import { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, Bell, Globe, Mail, MessageCircle, ShieldAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getAdminNotificationUnreadCount,
  getAdminNotifications,
  markAdminNotificationRead,
  type RemoteAdminNotification,
  type RemoteAdminNotificationUnreadCount,
} from "@/lib/customer-service-api";
import {
  ADMIN_NOTIFICATIONS_QUERY_KEY,
  ADMIN_NOTIFICATION_UNREAD_QUERY_KEY,
} from "@/lib/query-keys";
import { formatRelative } from "@/lib/utils/date";

function getNotificationIcon(eventKey: string) {
  if (eventKey.includes("whatsapp")) return MessageCircle;
  if (eventKey.includes("email")) return Mail;
  if (eventKey.includes("website")) return Globe;
  return Bell;
}

function getSeverityMeta(severity: string) {
  if (severity === "critical") {
    return {
      Icon: ShieldAlert,
      iconClassName: "bg-red-500/10 text-red-600",
      label: "Kritis",
    };
  }

  if (severity === "warning") {
    return {
      Icon: AlertTriangle,
      iconClassName: "bg-amber-500/10 text-amber-700",
      label: "Peringatan",
    };
  }

  return {
    Icon: null,
    iconClassName: "bg-blue-500/10 text-blue-600",
    label: "Info",
  };
}

function getNotificationDestination(notification: RemoteAdminNotification) {
  const eventKey = notification.eventKey.toLowerCase();
  const route = eventKey.includes("whatsapp")
    ? "/customer-service/whatsapp"
    : eventKey.includes("email")
      ? "/customer-service/gmail"
      : eventKey.includes("website")
        ? "/customer-service/website"
        : "/customer-service/all";

  if (typeof window === "undefined") return route;

  const url = new URL(route, window.location.origin);
  url.searchParams.set("notificationResourceType", notification.resourceType);
  url.searchParams.set("notificationResourceId", notification.resourceId);
  url.searchParams.set("notificationEventKey", notification.eventKey);
  return `${url.pathname}${url.search}`;
}

export function NotificationsMenu() {
  const queryClient = useQueryClient();
  const [readingNotificationIds, setReadingNotificationIds] = useState<Set<number>>(
    () => new Set(),
  );
  const notificationsQuery = useQuery({
    queryKey: ADMIN_NOTIFICATIONS_QUERY_KEY,
    queryFn: getAdminNotifications,
    staleTime: 10_000,
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
  const unreadCountQuery = useQuery({
    queryKey: ADMIN_NOTIFICATION_UNREAD_QUERY_KEY,
    queryFn: getAdminNotificationUnreadCount,
    staleTime: 10_000,
    refetchInterval: 15_000,
    refetchOnWindowFocus: true,
  });
  const notifications = notificationsQuery.data ?? [];
  const unread = Number(unreadCountQuery.data?.totalUnread ?? 0);
  const unreadBadge = unread > 99 ? "99+" : String(unread);

  const handleOpenChange = (open: boolean) => {
    if (!open) return;
    void notificationsQuery.refetch();
    void unreadCountQuery.refetch();
  };

  const handleNotificationClick = async (notification: RemoteAdminNotification) => {
    const destination = getNotificationDestination(notification);

    if (!notification.readAt && !readingNotificationIds.has(notification.id)) {
      const previousNotifications = queryClient.getQueryData<RemoteAdminNotification[]>(
        ADMIN_NOTIFICATIONS_QUERY_KEY,
      );
      const previousUnreadCount = queryClient.getQueryData<RemoteAdminNotificationUnreadCount>(
        ADMIN_NOTIFICATION_UNREAD_QUERY_KEY,
      );
      const optimisticReadAt = new Date().toISOString();

      setReadingNotificationIds((current) => new Set(current).add(notification.id));
      queryClient.setQueryData<RemoteAdminNotification[]>(
        ADMIN_NOTIFICATIONS_QUERY_KEY,
        (current = []) =>
          current.map((item) =>
            item.id === notification.id ? { ...item, readAt: optimisticReadAt } : item,
          ),
      );
      queryClient.setQueryData<RemoteAdminNotificationUnreadCount>(
        ADMIN_NOTIFICATION_UNREAD_QUERY_KEY,
        (current) => ({
          ...current,
          totalUnread: Math.max(0, Number(current?.totalUnread ?? unread) - 1),
        }),
      );

      try {
        await markAdminNotificationRead(notification.id);
      } catch {
        queryClient.setQueryData(ADMIN_NOTIFICATIONS_QUERY_KEY, previousNotifications);
        queryClient.setQueryData(ADMIN_NOTIFICATION_UNREAD_QUERY_KEY, previousUnreadCount);
      } finally {
        setReadingNotificationIds((current) => {
          const next = new Set(current);
          next.delete(notification.id);
          return next;
        });
      }
    }

    if (typeof window !== "undefined") {
      window.location.assign(destination);
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`Notifikasi admin, ${unread} belum dibaca`}
          className="relative"
        >
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span
              aria-hidden="true"
              className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#ff3b30] px-1 text-[9px] font-semibold leading-none text-white ring-2 ring-background"
            >
              {unreadBadge}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi Admin</span>
          <span className="text-xs font-normal text-muted-foreground">{unread} belum dibaca</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-96">
          <div className="flex flex-col">
            {notificationsQuery.isLoading ? (
              <p className="p-6 text-center text-xs text-muted-foreground">Memuat notifikasi...</p>
            ) : notificationsQuery.isError ? (
              <div className="space-y-2 p-6 text-center">
                <p className="text-xs text-muted-foreground">Gagal memuat notifikasi admin.</p>
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => void notificationsQuery.refetch()}
                  className="h-7 text-xs"
                >
                  Coba lagi
                </Button>
              </div>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">
                Belum ada notifikasi admin.
              </p>
            ) : (
              notifications.map((notification) => {
                const ChannelIcon = getNotificationIcon(notification.eventKey);
                const severity = getSeverityMeta(notification.severity);
                const SeverityIcon = severity.Icon;

                return (
                  <button
                    type="button"
                    key={notification.id}
                    onClick={() => void handleNotificationClick(notification)}
                    disabled={readingNotificationIds.has(notification.id)}
                    className="flex w-full items-start gap-3 border-b border-border px-3 py-3 text-left transition-colors last:border-0 hover:bg-accent disabled:opacity-70"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${severity.iconClassName}`}
                      title={severity.label}
                    >
                      {SeverityIcon ? (
                        <SeverityIcon className="h-4 w-4" />
                      ) : (
                        <ChannelIcon className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">
                          {notification.title}
                        </p>
                        {!notification.readAt && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">
                        {notification.message}
                      </p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatRelative(notification.createdAt ?? new Date().toISOString())}
                      </p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
