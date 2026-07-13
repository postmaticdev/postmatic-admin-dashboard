import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SourceBadge } from "./SourceBadge";
import { StatusBadge } from "./StatusBadge";
import { Pin } from "lucide-react";
import { useTickets } from "@/contexts/TicketsContext";
import { formatRelative } from "@/lib/utils/date";
import type { Ticket } from "@/lib/types/ticket";

interface Props {
  ticket: Ticket;
  active: boolean;
  onSelect: (id: string) => void;
}

export function TicketCard({ ticket, active, onSelect }: Props) {
  const { togglePinTicket } = useTickets();

  const lastMessage = ticket.messages[ticket.messages.length - 1];
  const isUnread = ticket.unread === true;
  const isUnreplied = !isUnread && lastMessage && lastMessage.direction === "in";

  return (
    <button
      type="button"
      onClick={() => onSelect(ticket.id)}
      className={cn(
        "group flex w-full flex-col gap-2 border-l-2 border-transparent px-4 py-3 text-left transition-colors relative",
        "hover:bg-accent",
        active && "border-l-primary bg-accent",
      )}
    >
      <div className="flex items-start gap-3 w-full">
        <Avatar className="h-8 w-8">
          <AvatarImage src={ticket.senderAvatar} alt={ticket.senderName} />
          <AvatarFallback>{ticket.senderName.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate text-sm font-semibold text-foreground">{ticket.senderName}</p>
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[11px] text-muted-foreground">
                {formatRelative(ticket.updatedAt)}
              </span>
              {isUnread && (
                <span className="h-2 w-2 rounded-full bg-[#ff3b30] shrink-0" title="Belum dibaca" />
              )}
              {isUnreplied && (
                <span className="h-2 w-2 rounded-full bg-neutral-400 dark:bg-neutral-500 shrink-0" title="Belum dibalas" />
              )}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  togglePinTicket(ticket.id);
                }}
                className={cn(
                  "text-muted-foreground transition-all p-0.5 rounded hover:bg-muted-foreground/10 hover:text-foreground",
                  ticket.isPinned ? "text-primary opacity-100" : "opacity-0 group-hover:opacity-100"
                )}
                title={ticket.isPinned ? "Lepas sematan" : "Sematkan chat"}
              >
                <Pin className={cn("h-3 w-3 transition-transform", ticket.isPinned && "fill-current -rotate-45 text-primary")} />
              </button>
            </div>
          </div>
          <p className="truncate text-sm font-medium text-foreground/90">{ticket.subject}</p>
          <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{ticket.snippet}</p>
        </div>
      </div>
      <div className="flex items-center gap-1.5 pl-11">
        <SourceBadge source={ticket.source} />
        <StatusBadge status={ticket.status} />
      </div>
    </button>
  );
}
