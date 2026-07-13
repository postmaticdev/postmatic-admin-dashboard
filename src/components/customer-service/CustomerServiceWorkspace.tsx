import { useEffect, useState } from "react";
import { TicketListPanel } from "./TicketListPanel";
import { TicketDetailPanel } from "./TicketDetailPanel";
import { GmailComposer } from "./detail/GmailComposer";
import { useTickets } from "@/contexts/TicketsContext";
import type { Ticket } from "@/lib/types/ticket";

interface Props {
  title: string;
  tickets: Ticket[];
  scopeKey: string;
}

export function CustomerServiceWorkspace({ title, tickets, scopeKey }: Props) {
  const { markAsRead } = useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  const [replyToData, setReplyToData] = useState<{ to: string; subject: string; ticketId: string } | null>(null);

  useEffect(() => {
    setSelectedId(null);
    setIsComposingEmail(false);
    setReplyToData(null);
  }, [scopeKey]);

  useEffect(() => {
    if (selectedId) {
      markAsRead(selectedId);
    }
  }, [selectedId, markAsRead]);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsComposingEmail(false);
    setReplyToData(null);
  };

  const handleStartCompose = () => {
    setIsComposingEmail(true);
    setSelectedId(null);
    setReplyToData(null);
  };

  const handleSendCompose = (newTicketId: string) => {
    setIsComposingEmail(false);
    setSelectedId(newTicketId);
    setReplyToData(null);
  };

  const handleReplyEmail = (data: { to: string; subject: string; ticketId: string }) => {
    setReplyToData(data);
    setIsComposingEmail(true);
  };

  const selected = tickets.find((t) => t.id === selectedId);

  return (
    <div className="grid h-full min-h-0 grid-cols-10">
      <div className="col-span-3 min-h-0">
        <TicketListPanel
          key={scopeKey}
          scopeKey={scopeKey}
          title={title}
          tickets={tickets}
          selectedId={selectedId}
          onSelect={handleSelect}
          onStartCompose={handleStartCompose}
        />
      </div>
      <div className="col-span-7 min-h-0">
        {isComposingEmail ? (
          <GmailComposer
            onCancel={() => setIsComposingEmail(false)}
            onSent={handleSendCompose}
            replyToData={replyToData}
          />
        ) : (
          <TicketDetailPanel ticket={selected} onReplyEmail={handleReplyEmail} />
        )}
      </div>
    </div>
  );
}
