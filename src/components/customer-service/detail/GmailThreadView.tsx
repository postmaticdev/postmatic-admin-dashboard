import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, CornerUpLeft, FileText, Loader2, RefreshCw } from "lucide-react";
import { MarkAsTicketButton } from "../MarkAsTicketButton";
import { StatusBadge } from "../StatusBadge";
import { TicketStatusSelector } from "../TicketStatusSelector";
import { formatDateTime } from "@/lib/utils/date";
import { useTickets } from "@/contexts/TicketsContext";
import type { Ticket } from "@/lib/types/ticket";
import { useState } from "react";

interface Props {
  ticket: Ticket;
  onReplyEmail?: (data: { to: string; subject: string; ticketId: string }) => void;
}

function getEmailStatusMeta(status?: string | null) {
  const normalizedStatus = status?.trim().toLowerCase();

  if (normalizedStatus === "sent") {
    return {
      label: "Sent",
      className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-600",
    };
  }

  if (normalizedStatus === "failed" || normalizedStatus === "bounced") {
    return {
      label: normalizedStatus === "bounced" ? "Bounced" : "Failed",
      className: "border-red-500/20 bg-red-500/10 text-red-600",
    };
  }

  if (normalizedStatus === "delivery_unknown") {
    return {
      label: "Delivery unknown",
      className: "border-amber-500/20 bg-amber-500/10 text-amber-700",
    };
  }

  if (normalizedStatus === "pending") {
    return {
      label: "Pending",
      className: "border-blue-500/20 bg-blue-500/10 text-blue-600",
    };
  }

  return null;
}

function getEmailDeliveryError(message: Ticket["messages"][number]) {
  if (message.errorMessage) return message.errorMessage;
  if (message.sentStatus === "delivery_unknown") {
    return "Status delivery belum dapat dipastikan. Periksa sebelum mengirim ulang.";
  }
  if (message.sentStatus === "bounced") return "Email ditolak atau dikembalikan oleh penerima.";
  return "Email gagal dikirim.";
}

export function GmailThreadView({ ticket, onReplyEmail }: Props) {
  const { resendEmailMessage } = useTickets();
  const [retryingMessageId, setRetryingMessageId] = useState<string | null>(null);

  const handleRetryEmail = async (messageId: string) => {
    setRetryingMessageId(messageId);
    try {
      await resendEmailMessage(ticket.id, messageId);
    } finally {
      setRetryingMessageId(null);
    }
  };

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
          {ticket.isSavedAsTicket && (
            <TicketStatusSelector ticketId={ticket.id} currentStatus={ticket.status} />
          )}
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
            const statusMeta = m.direction === "out" ? getEmailStatusMeta(m.sentStatus) : null;
            const showDeliveryError =
              m.sentStatus === "failed" ||
              m.sentStatus === "delivery_unknown" ||
              m.sentStatus === "bounced";
            const canRetry =
              Boolean(m.canResend) &&
              (m.sentStatus === "failed" || m.sentStatus === "delivery_unknown");

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
                    <div className="flex shrink-0 items-center gap-2">
                      {statusMeta && (
                        <Badge
                          className={`${statusMeta.className} border text-[10px] font-semibold`}
                        >
                          {m.sentStatus === "pending" && (
                            <Loader2 className="mr-1 h-2.5 w-2.5 animate-spin" />
                          )}
                          {statusMeta.label}
                        </Badge>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatDateTime(m.createdAt)}
                      </span>
                    </div>
                  </div>
                  {showDeliveryError && (
                    <div className="mb-3 flex items-start justify-between gap-3 rounded-md border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-700 dark:text-red-300">
                      <span className="inline-flex items-start gap-1.5">
                        <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                        <span>{getEmailDeliveryError(m)}</span>
                      </span>
                      {canRetry && (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          disabled={retryingMessageId === m.id}
                          onClick={() => void handleRetryEmail(m.id)}
                          className="h-7 shrink-0 gap-1.5 px-2 text-[11px]"
                        >
                          {retryingMessageId === m.id ? (
                            <Loader2 className="h-3 w-3 animate-spin" />
                          ) : (
                            <RefreshCw className="h-3 w-3" />
                          )}
                          Retry
                        </Button>
                      )}
                    </div>
                  )}
                  <div
                    className="text-sm leading-relaxed text-foreground/90 prose max-w-none
                    [&_h1]:text-lg [&_h1]:font-bold [&_h1]:my-2
                    [&_h2]:text-base [&_h2]:font-bold [&_h2]:my-1.5
                    [&_p]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:mb-2 [&_li]:mb-0.5
                    [&_a]:text-blue-600 [&_a]:underline"
                    dangerouslySetInnerHTML={{ __html: m.content }}
                  />
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-2">
                      {m.attachments.map((attachment, index) => (
                        <a
                          key={`${attachment.url}-${index}`}
                          href={attachment.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex max-w-[220px] items-center gap-2 rounded-md border border-border bg-muted/35 px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"
                        >
                          <FileText className="h-3.5 w-3.5 shrink-0 text-blue-600" />
                          <span className="truncate">{attachment.name}</span>
                        </a>
                      ))}
                    </div>
                  )}
                </article>
              </div>
            );
          })}
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
