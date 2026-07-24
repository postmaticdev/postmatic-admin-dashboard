import { Bell, Mail, MessageCircle, Globe } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
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
  getCommonNotificationUnreadCount,
  getCommonNotifications,
  type RemoteNotification,
} from "@/lib/customer-service-api";
import { formatRelative } from "@/lib/utils/date";
import type { TicketSource } from "@/lib/types/ticket";

const iconFor = (s: TicketSource) => {
  if (s === "whatsapp") return MessageCircle;
  if (s === "gmail") return Mail;
  return Globe;
};

function sourceForNotification(notification: RemoteNotification): TicketSource {
  const channelType = notification.chatBlast?.channelType;

  if (channelType === "whatsapp" || channelType === "gmail" || channelType === "website") {
    return channelType;
  }

  return "website";
}

export function NotificationsMenu() {
  const notificationsQuery = useQuery({
    queryKey: ["notifications", "common"],
    queryFn: getCommonNotifications,
    staleTime: 30_000,
  });
  const unreadCountQuery = useQuery({
    queryKey: ["notifications", "common", "unread-count"],
    queryFn: getCommonNotificationUnreadCount,
    staleTime: 15_000,
    refetchInterval: 60_000,
  });
  const notifications = notificationsQuery.data ?? [];
  const unread = Number(unreadCountQuery.data?.totalUnread ?? 0);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff3b30] ring-2 ring-background" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifikasi</span>
          <span className="text-xs font-normal text-muted-foreground">{unread} baru</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-80">
          <div className="flex flex-col">
            {notificationsQuery.isLoading ? (
              <p className="p-6 text-center text-xs text-muted-foreground">Memuat notifikasi...</p>
            ) : notifications.length === 0 ? (
              <p className="p-6 text-center text-xs text-muted-foreground">Belum ada notifikasi.</p>
            ) : (
              notifications.map((n) => {
                const source = sourceForNotification(n);
                const Icon = iconFor(source);
                const title = n.chatBlast?.subject || "Blast notification";
                const snippet = n.chatBlast?.body || "Notifikasi blast baru.";
                return (
                  <div
                    key={n.id}
                    className="flex items-start gap-3 border-b border-border px-3 py-3 last:border-0 hover:bg-accent"
                  >
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-muted-foreground">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <p className="truncate text-sm font-medium text-foreground">{title}</p>
                        {!n.readAt && (
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                        )}
                      </div>
                      <p className="line-clamp-2 text-xs text-muted-foreground">{snippet}</p>
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {formatRelative(n.createdAt ?? new Date().toISOString())}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
