import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Activity,
  AlertCircle,
  Clock,
  Filter,
  Loader2,
  RefreshCw,
  Search,
  User,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  getAdminActivityLogFilterTypes,
  getAdminActivityLogs,
  type RemoteAdminActivityLog,
} from "@/lib/activity-log-api";
import { cn } from "@/lib/utils";

const ACTIVITY_QUERY_KEY = ["monitoring", "admin-activity-log"] as const;
const ACTIVITY_TYPE_QUERY_KEY = ["monitoring", "admin-activity-log", "types"] as const;

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
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function adminName(log: RemoteAdminActivityLog) {
  return log.admin?.name ?? log.profile?.name ?? log.adminName ?? "Admin";
}

function adminEmail(log: RemoteAdminActivityLog) {
  return log.admin?.email ?? log.profile?.email ?? log.adminEmail ?? "-";
}

function logTitle(log: RemoteAdminActivityLog) {
  return log.action ?? log.type ?? "activity";
}

function logDescription(log: RemoteAdminActivityLog) {
  return log.description ?? log.message ?? "-";
}

function metadataPreview(value: unknown) {
  if (value == null) return "-";

  try {
    const serialized = JSON.stringify(value);
    return serialized.length > 140 ? `${serialized.slice(0, 140)}...` : serialized;
  } catch {
    return "-";
  }
}

function typeClassName(type?: string | null) {
  const normalized = (type ?? "").toLowerCase();

  if (normalized.includes("delete") || normalized.includes("ban")) {
    return "bg-destructive/10 text-destructive";
  }
  if (normalized.includes("create") || normalized.includes("success")) {
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
  }
  if (normalized.includes("update") || normalized.includes("edit")) {
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400";
  }
  return "bg-muted text-muted-foreground";
}

export function AdminActivityLogContainer() {
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");

  const activityQuery = useQuery({
    queryKey: [...ACTIVITY_QUERY_KEY, search, typeFilter],
    queryFn: () =>
      getAdminActivityLogs({
        search,
        type: typeFilter === "all" ? undefined : typeFilter,
        limit: 100,
      }),
    staleTime: 20_000,
  });

  const filterTypesQuery = useQuery({
    queryKey: ACTIVITY_TYPE_QUERY_KEY,
    queryFn: getAdminActivityLogFilterTypes,
    staleTime: 60_000,
  });

  const logs = useMemo(() => activityQuery.data ?? [], [activityQuery.data]);
  const latestLog = logs[0] ?? null;
  const uniqueAdmins = useMemo(() => new Set(logs.map(adminEmail)).size, [logs]);
  const destructiveCount = useMemo(
    () =>
      logs.filter((log) => {
        const type = `${log.type ?? ""} ${log.action ?? ""}`.toLowerCase();
        return type.includes("delete") || type.includes("ban");
      }).length,
    [logs],
  );

  const refresh = () => {
    void activityQuery.refetch();
    void filterTypesQuery.refetch();
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Activity className="h-3.5 w-3.5" />
                Monitoring
              </span>
              <span className="font-mono text-xs text-muted-foreground">Activity / Admin</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Admin Activity Log
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Audit aktivitas admin Postmatic dari backend activity log.
            </p>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={refresh}
            disabled={activityQuery.isFetching || filterTypesQuery.isFetching}
          >
            <RefreshCw
              className={cn(
                "h-4 w-4",
                (activityQuery.isFetching || filterTypesQuery.isFetching) && "animate-spin",
              )}
            />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Total Activity</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{logs.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Active Admins</p>
          <p className="mt-2 text-2xl font-extrabold text-blue-600">{uniqueAdmins}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Sensitive Actions</p>
          <p className="mt-2 text-2xl font-extrabold text-destructive">{destructiveCount}</p>
        </div>
      </div>

      {latestLog && (
        <div className="rounded-lg border border-border bg-card p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase text-muted-foreground">
                Aktivitas terbaru
              </p>
              <p className="mt-1 text-sm font-bold text-foreground">{logTitle(latestLog)}</p>
              <p className="mt-1 text-xs text-muted-foreground">{logDescription(latestLog)}</p>
            </div>
            <span className="inline-flex w-fit items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              <Clock className="h-3.5 w-3.5" />
              {formatDateTime(latestLog.createdAt)}
            </span>
          </div>
        </div>
      )}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-1 flex-col gap-3 md:flex-row">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Cari admin, aksi, atau deskripsi..."
                className="pl-9"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-full md:w-56">
                <Filter className="h-4 w-4 text-muted-foreground" />
                <SelectValue placeholder="Filter type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Semua Type</SelectItem>
                {(filterTypesQuery.data ?? []).map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <span className="text-xs font-semibold text-muted-foreground">{logs.length} log</span>
        </div>

        <div className="max-h-[640px] overflow-auto">
          <table className="w-full min-w-[920px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3">Time</th>
                <th className="px-4 py-3">Admin</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Activity</th>
                <th className="px-4 py-3">Metadata</th>
              </tr>
            </thead>
            <tbody>
              {activityQuery.isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat activity log...
                    </div>
                  </td>
                </tr>
              ) : activityQuery.isError ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-sm text-muted-foreground">
                      <AlertCircle className="h-8 w-8 text-destructive" />
                      <p className="font-semibold text-foreground">Gagal memuat activity log.</p>
                      <p className="text-xs">
                        {getErrorMessage(activityQuery.error, "Unknown error")}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : logs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    Belum ada activity log untuk filter ini.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr
                    key={String(log.id)}
                    className="border-b border-border/60 bg-card hover:bg-muted/40"
                  >
                    <td className="whitespace-nowrap px-4 py-4 text-xs font-medium text-foreground">
                      {formatDateTime(log.createdAt)}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                          <User className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-xs font-bold text-foreground">
                            {adminName(log)}
                          </p>
                          <p className="truncate text-[11px] text-muted-foreground">
                            {adminEmail(log)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          "inline-flex rounded-md px-2 py-1 text-[11px] font-bold",
                          typeClassName(log.type ?? log.action),
                        )}
                      >
                        {log.type ?? log.action ?? "-"}
                      </span>
                    </td>
                    <td className="max-w-[300px] px-4 py-4">
                      <p className="truncate text-xs font-bold text-foreground">{logTitle(log)}</p>
                      <p className="mt-1 truncate text-xs text-muted-foreground">
                        {logDescription(log)}
                      </p>
                    </td>
                    <td className="max-w-[320px] px-4 py-4">
                      <code className="block truncate rounded bg-muted px-2 py-1 text-[11px] text-muted-foreground">
                        {metadataPreview(log.metadata)}
                      </code>
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
