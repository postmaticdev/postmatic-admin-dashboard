import { EmptyDetailState } from "./EmptyDetailState";
import { GmailThreadView } from "./detail/GmailThreadView";
import { WebsiteReportView } from "./detail/WebsiteReportView";
import { WhatsappChatView } from "./detail/WhatsappChatView";
import type { Ticket } from "@/lib/types/ticket";

interface Props {
  ticket: Ticket | undefined;
  onReplyEmail?: (data: { to: string; subject: string; ticketId: string }) => void;
  onSelectTicket?: (id: string) => void;
}

export function TicketDetailPanel({ ticket, onReplyEmail, onSelectTicket }: Props) {
  if (!ticket) return <EmptyDetailState />;
  if (ticket.source === "whatsapp") {
    return <WhatsappChatView ticket={ticket} onSelectTicket={onSelectTicket} />;
  }
  if (ticket.source === "gmail") {
    return <GmailThreadView ticket={ticket} onReplyEmail={onReplyEmail} />;
  }
  return <WebsiteReportView ticket={ticket} />;
}
