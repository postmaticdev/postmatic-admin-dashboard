import { useCallback, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BellRing,
  CheckCircle2,
  Clock,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

import {
  getEmailHealth,
  getWahaHealth,
  notifyEmailHealth,
  notifyWahaHealth,
  type RemoteWahaHealth,
} from "@/lib/monitoring-api";

const WAHA_HEALTH_QUERY_KEY = ["monitoring", "waha-health"] as const;
const EMAIL_HEALTH_QUERY_KEY = ["monitoring", "email-health"] as const;
const HISTORY_STORAGE_KEY = "postmatic_system_monitoring_waha_history";
const HISTORY_LIMIT = 30;

interface WahaHealthHistoryItem extends RemoteWahaHealth {
  id: string;
  source: "check" | "notify";
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function historyId(item: RemoteWahaHealth, source: WahaHealthHistoryItem["source"]) {
  return [
    source,
    item.checkedAt ?? new Date().toISOString(),
    item.healthy === true ? "healthy" : "unhealthy",
    item.errorCode ?? "no-code",
    item.discordNotificationSent === true ? "notified" : "silent",
  ].join(":");
}

function normalizeHistoryItem(
  item: RemoteWahaHealth,
  source: WahaHealthHistoryItem["source"],
): WahaHealthHistoryItem {
  return {
    ...item,
    id: historyId(item, source),
    source,
  };
}

function readHistory() {
  if (typeof window === "undefined") return [];

  try {
    const parsed = JSON.parse(localStorage.getItem(HISTORY_STORAGE_KEY) ?? "[]");
    return Array.isArray(parsed) ? (parsed as WahaHealthHistoryItem[]) : [];
  } catch {
    return [];
  }
}

function persistHistory(history: WahaHealthHistoryItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history.slice(0, HISTORY_LIMIT)));
}

function mergeHistory(history: WahaHealthHistoryItem[], item: WahaHealthHistoryItem) {
  const unique = new Map<string, WahaHealthHistoryItem>();

  [item, ...history].forEach((entry) => {
    unique.set(entry.id, entry);
  });

  return Array.from(unique.values())
    .sort((left, right) => {
      const leftTime = left.checkedAt ? new Date(left.checkedAt).getTime() : 0;
      const rightTime = right.checkedAt ? new Date(right.checkedAt).getTime() : 0;
      return rightTime - leftTime;
    })
    .slice(0, HISTORY_LIMIT);
}

function healthStatusClasses(healthy?: boolean | null) {
  if (healthy) return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  return "bg-destructive/10 text-destructive";
}

function healthStatusText(healthy?: boolean | null) {
  return healthy ? "Healthy" : "Accident";
}

export function SystemMonitoringContainer() {
  const [history, setHistory] = useState<WahaHealthHistoryItem[]>([]);

  const healthQuery = useQuery({
    queryKey: WAHA_HEALTH_QUERY_KEY,
    queryFn: getWahaHealth,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });

  const emailHealthQuery = useQuery({
    queryKey: EMAIL_HEALTH_QUERY_KEY,
    queryFn: getEmailHealth,
    refetchInterval: 60_000,
    staleTime: 15_000,
  });

  const notifyMutation = useMutation({
    mutationFn: notifyWahaHealth,
    onSuccess: (data) => {
      appendHistory(data, "notify");
      if (data.discordNotificationSent) {
        toast.success("Alert monitoring berhasil dikirim.");
      } else {
        toast.info("Health check selesai tanpa pengiriman alert.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal mengirim alert monitoring."));
    },
  });

  const notifyEmailMutation = useMutation({
    mutationFn: notifyEmailHealth,
    onSuccess: (data) => {
      if (data.discordNotificationSent) {
        toast.success("Alert monitoring email berhasil dikirim.");
      } else {
        toast.info("Health check email selesai tanpa pengiriman alert.");
      }
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal mengirim alert monitoring email."));
    },
  });

  const latest = notifyMutation.data ?? healthQuery.data;
  const latestEmail = notifyEmailMutation.data ?? emailHealthQuery.data;
  const accidentHistory = useMemo(
    () => history.filter((item) => item.healthy === false),
    [history],
  );

  const appendHistory = useCallback(
    (item: RemoteWahaHealth, source: WahaHealthHistoryItem["source"]) => {
      const nextItem = normalizeHistoryItem(item, source);

      setHistory((current) => {
        const next = mergeHistory(current, nextItem);
        persistHistory(next);
        return next;
      });
    },
    [],
  );

  useEffect(() => {
    setHistory(readHistory());
  }, []);

  useEffect(() => {
    if (healthQuery.data) {
      appendHistory(healthQuery.data, "check");
    }
  }, [appendHistory, healthQuery.data]);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Activity className="h-3.5 w-3.5" />
                Monitoring
              </span>
              <span className="font-mono text-xs text-muted-foreground">System / WAHA</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">System Monitoring</h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Pantau health WAHA, kirim alert manual, dan lihat accident history terakhir.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => {
                void healthQuery.refetch();
                void emailHealthQuery.refetch();
              }}
              disabled={healthQuery.isFetching || emailHealthQuery.isFetching}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  healthQuery.isFetching || emailHealthQuery.isFetching ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => notifyMutation.mutate()}
              disabled={notifyMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {notifyMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellRing className="h-4 w-4" />
              )}
              Send Alert
            </button>
            <button
              type="button"
              onClick={() => notifyEmailMutation.mutate()}
              disabled={notifyEmailMutation.isPending}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-4 py-2.5 text-sm font-semibold text-foreground transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-60"
            >
              {notifyEmailMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BellRing className="h-4 w-4" />
              )}
              Email Alert
            </button>
          </div>
        </div>
      </div>

      {healthQuery.isLoading ? (
        <div className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat status monitoring...
          </div>
        </div>
      ) : healthQuery.isError ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-6 text-sm text-destructive">
          <div className="flex items-start gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
            <div>
              <p className="font-semibold">Gagal memuat WAHA health.</p>
              <p className="mt-1 text-xs">{getErrorMessage(healthQuery.error, "Unknown error")}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm font-semibold text-muted-foreground">Health</span>
              {latest?.healthy ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              ) : (
                <AlertTriangle className="h-5 w-5 text-destructive" />
              )}
            </div>
            <div className="mt-4">
              <span
                className={`inline-flex rounded-md px-2.5 py-1 text-xs font-bold ${healthStatusClasses(
                  latest?.healthy,
                )}`}
              >
                {healthStatusText(latest?.healthy)}
              </span>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-sm font-semibold text-muted-foreground">Session</span>
            <p className="mt-4 truncate text-lg font-bold text-foreground">
              {latest?.session ?? "-"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">{latest?.sessionStatus ?? "-"}</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="text-sm font-semibold text-muted-foreground">Notification</span>
            <p className="mt-4 text-lg font-bold text-foreground">
              {latest?.discordNotificationSent ? "Sent" : "Not sent"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Discord monitoring alert</p>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <Clock className="h-4 w-4" />
              Checked At
            </div>
            <p className="mt-4 text-sm font-bold text-foreground">
              {formatDateTime(latest?.checkedAt)}
            </p>
          </div>
        </div>
      )}

      {latest?.healthy === false && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-5 shadow-sm">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
            <div>
              <h2 className="text-sm font-bold text-foreground">
                {latest.errorCode || "WAHA_HEALTH_ACCIDENT"}
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                {latest.errorMessage || "WAHA health check melaporkan status tidak sehat."}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Email CRM Health</h2>
            <p className="text-xs text-muted-foreground">
              Status ingest mailbox, quota harian, dan sinkronisasi folder email.
            </p>
          </div>
          <span
            className={`inline-flex w-fit rounded-md px-2.5 py-1 text-xs font-bold ${healthStatusClasses(
              latestEmail?.healthy,
            )}`}
          >
            {emailHealthQuery.isLoading ? "Checking" : healthStatusText(latestEmail?.healthy)}
          </span>
        </div>

        {emailHealthQuery.isError ? (
          <div className="p-6 text-sm text-destructive">
            {getErrorMessage(emailHealthQuery.error, "Gagal memuat Email CRM health.")}
          </div>
        ) : (
          <div className="grid gap-4 p-4 lg:grid-cols-4">
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Ingest Mode</p>
              <p className="mt-2 text-sm font-bold text-foreground">
                {latestEmail?.ingestMode ?? "-"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Enabled: {latestEmail?.enabled === false ? "No" : "Yes"}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Stale Pending</p>
              <p className="mt-2 text-2xl font-extrabold text-foreground">
                {latestEmail?.stalePendingCount ?? 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Pesan pending lama</p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Mailboxes</p>
              <p className="mt-2 text-2xl font-extrabold text-foreground">
                {latestEmail?.mailboxes?.length ?? 0}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Checked at {formatDateTime(latestEmail?.checkedAt)}
              </p>
            </div>
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs font-semibold text-muted-foreground">Notification</p>
              <p className="mt-2 text-sm font-bold text-foreground">
                {latestEmail?.discordNotificationSent ? "Sent" : "Not sent"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">Discord monitoring alert</p>
            </div>
          </div>
        )}

        {(latestEmail?.mailboxes ?? []).length > 0 && (
          <div className="border-t border-border/60">
            <div className="max-h-[360px] overflow-auto">
              <table className="w-full min-w-[760px] border-collapse text-left">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                    <th className="px-4 py-3">Mailbox</th>
                    <th className="px-4 py-3">Runtime</th>
                    <th className="px-4 py-3">Quota</th>
                    <th className="px-4 py-3">Folders</th>
                  </tr>
                </thead>
                <tbody>
                  {latestEmail?.mailboxes?.map((mailbox) => (
                    <tr
                      key={mailbox.mailboxId ?? mailbox.address}
                      className="border-b border-border/60 bg-card"
                    >
                      <td className="px-4 py-4 text-xs">
                        <p className="font-bold text-foreground">{mailbox.address ?? "-"}</p>
                        <p className="text-muted-foreground">
                          {mailbox.healthy ? "Healthy" : "Needs attention"}
                        </p>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">
                          {mailbox.runtime?.state ?? "-"}
                        </p>
                        <p>Reconnect: {mailbox.runtime?.reconnectAttempts ?? 0}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        <p className="font-semibold text-foreground">
                          {mailbox.dailySendUsage ?? 0} / {mailbox.dailySendLimit ?? "-"}
                        </p>
                        <p>Quarantined: {mailbox.quarantinedCount ?? 0}</p>
                      </td>
                      <td className="px-4 py-4 text-xs text-muted-foreground">
                        <div className="flex flex-col gap-1">
                          {(mailbox.folders ?? []).map((folder) => (
                            <span
                              key={folder.folderPath ?? folder.specialUse}
                              className="inline-flex justify-between gap-3 rounded border border-border bg-muted/30 px-2 py-1"
                            >
                              <span>{folder.folderPath ?? folder.specialUse ?? "-"}</span>
                              <span>{folder.syncLagSeconds ?? 0}s</span>
                            </span>
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-2 border-b border-border/60 p-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-base font-bold text-foreground">Accident History</h2>
            <p className="text-xs text-muted-foreground">
              Riwayat local dari hasil check dan notify WAHA.
            </p>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {accidentHistory.length} accident
          </span>
        </div>

        <div className="max-h-[420px] overflow-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Session</th>
                <th className="px-4 py-3">Error</th>
                <th className="px-4 py-3">Alert</th>
                <th className="px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {accidentHistory.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    Belum ada accident yang tercatat di browser ini.
                  </td>
                </tr>
              ) : (
                accidentHistory.map((item) => (
                  <tr key={item.id} className="border-b border-border/60 bg-card hover:bg-muted/40">
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-foreground">
                      {formatDateTime(item.checkedAt)}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">{item.session ?? "-"}</span>
                      <span className="ml-1">({item.sessionStatus ?? "-"})</span>
                    </td>
                    <td className="max-w-[320px] px-4 py-4">
                      <p className="truncate text-xs font-semibold text-destructive">
                        {item.errorCode ?? "UNKNOWN"}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {item.errorMessage ?? "-"}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={`inline-flex rounded-md px-2 py-1 text-xs font-semibold ${
                          item.discordNotificationSent
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {item.discordNotificationSent ? "Sent" : "Not sent"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-xs font-medium text-muted-foreground">
                      {item.source === "notify" ? "Manual alert" : "Health check"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
