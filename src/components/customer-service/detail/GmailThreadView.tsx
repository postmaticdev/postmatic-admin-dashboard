import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CornerUpLeft } from "lucide-react";
import { MarkAsTicketButton } from "../MarkAsTicketButton";
import { StatusBadge } from "../StatusBadge";
import { TicketStatusSelector } from "../TicketStatusSelector";
import { formatDateTime } from "@/lib/utils/date";
import type { Ticket } from "@/lib/types/ticket";

interface Props {
  ticket: Ticket;
  onReplyEmail?: (data: { to: string; subject: string; ticketId: string }) => void;
}

export function GmailThreadView({ ticket, onReplyEmail }: Props) {
  return (
    <div className="flex h-full min-h-0 flex-col bg-background relative">
      <header className="flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-4">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <span className="text-xs text-muted-foreground">
              {ticket.messages.length} pesan dalam thread
            </span>
          </div>
          <h1 className="truncate text-xl font-semibold text-foreground">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TicketStatusSelector ticketId={ticket.id} currentStatus={ticket.status} />
          <MarkAsTicketButton ticket={ticket} />
        </div>
      </header>

      <ScrollArea className="flex-1 pb-20">
        <div className="mx-auto max-w-3xl px-6 py-6">
          {ticket.messages.map((m, i) => {
            if (m.authorId === "system") {
              return (
                <div key={m.id} className="flex justify-center my-3 w-full">
                  <div className="rounded-full bg-muted border border-border/50 px-3 py-1 text-[11px] text-muted-foreground font-medium shadow-sm">
                    {m.content} ({formatDateTime(m.createdAt)})
                  </div>
                </div>
              );
            }
            return (
              <div key={m.id}>
                {i > 0 && <Separator className="my-4" />}
                <article className="rounded-lg border border-border bg-card p-4 shadow-sm">
                  <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={m.authorAvatar ?? ticket.senderAvatar} alt={m.authorName} />
                    <AvatarFallback>{m.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{m.authorName}</p>
                    <p className="text-xs text-muted-foreground">
                      {m.direction === "out" ? "kepada pelanggan" : `<${ticket.senderHandle}>`}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatDateTime(m.createdAt)}
                  </span>
                </div>
                <div
                  className="text-sm leading-relaxed text-foreground/90 prose max-w-none 
                    [&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2 
                    [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-1.5 
                    [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_li]:mb-0.5
                    [&_a]:text-blue-600 [&_a]:underline"
                  dangerouslySetInnerHTML={{ __html: m.content }}
                />
              </article>
            </div>
          )})}
        </div>
      </ScrollArea>

      {/* Pinned Reply Button in bottom right corner */}
      <div className="absolute bottom-6 right-6 z-10">
        <Button
          type="button"
          onClick={() => {
            onReplyEmail?.({
              to: ticket.senderHandle,
              subject: ticket.subject.startsWith("Re:") ? ticket.subject : `Re: ${ticket.subject}`,
              ticketId: ticket.id,
            });
          }}
          className="h-10 px-5 gap-2 text-sm font-semibold shadow-lg bg-blue-600 hover:bg-blue-700 text-white rounded-full flex items-center justify-center transition-all hover:scale-105 border border-blue-500"
        >
          <CornerUpLeft className="h-4 w-4" />
          Reply
        </Button>
      </div>
    </div>
  );
}
