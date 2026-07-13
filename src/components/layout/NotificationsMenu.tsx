import { Bell, Mail, MessageCircle, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { MOCK_NOTIFICATIONS } from "@/lib/mock/notifications";
import { formatRelative } from "@/lib/utils/date";
import type { TicketSource } from "@/lib/types/ticket";

const iconFor = (s: TicketSource) => {
  if (s === "whatsapp") return MessageCircle;
  if (s === "gmail") return Mail;
  return Globe;
};

export function NotificationsMenu() {
  const unread = MOCK_NOTIFICATIONS.filter((n) => !n.read).length;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifikasi" className="relative">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" />
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
            {MOCK_NOTIFICATIONS.map((n) => {
              const Icon = iconFor(n.source);
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
                      <p className="truncate text-sm font-medium text-foreground">{n.title}</p>
                      {!n.read && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />}
                    </div>
                    <p className="line-clamp-2 text-xs text-muted-foreground">{n.snippet}</p>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      {formatRelative(n.createdAt)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
