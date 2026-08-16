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

interface NotificationResourceTarget {
  eventKey: string;
  resourceId: string;
  resourceType: "ticket" | "chat";
}

function getNotificationResourceTarget(): NotificationResourceTarget | null {
  if (typeof window === "undefined") return null;

  const params = new URLSearchParams(window.location.search);
  const eventKey = params.get("notificationEventKey")?.trim();
  const resourceId = params.get("notificationResourceId")?.trim();
  const resourceType = params.get("notificationResourceType")?.trim();

  if (!eventKey || !resourceId || (resourceType !== "ticket" && resourceType !== "chat")) {
    return null;
  }

  return { eventKey, resourceId, resourceType };
}

function ticketMatchesNotificationResource(ticket: Ticket, target: NotificationResourceTarget) {
  const eventKey = target.eventKey.toLowerCase();

  if (eventKey.includes("whatsapp")) {
    const remoteId =
      target.resourceType === "ticket"
        ? ticket.externalIds?.whatsappTicketId
        : ticket.externalIds?.whatsappRoomChatId;
    return (
      ticket.source === "whatsapp" && remoteId != null && String(remoteId) === target.resourceId
    );
  }

  if (eventKey.includes("email")) {
    const remoteId =
      target.resourceType === "ticket"
        ? ticket.externalIds?.emailTicketId
        : ticket.externalIds?.emailThreadId;
    return ticket.source === "gmail" && remoteId != null && String(remoteId) === target.resourceId;
  }

  if (eventKey.includes("website") && target.resourceType === "ticket") {
    const remoteId = ticket.externalIds?.websiteTicketId;
    return (
      ticket.source === "website" && remoteId != null && String(remoteId) === target.resourceId
    );
  }

  return false;
}

function clearNotificationResourceTarget() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  url.searchParams.delete("notificationEventKey");
  url.searchParams.delete("notificationResourceId");
  url.searchParams.delete("notificationResourceType");
  window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
}

export function CustomerServiceWorkspace({ title, tickets, scopeKey }: Props) {
  const { error, ensureTicketDetails, getById, isLoading, markAsRead, refreshTickets } =
    useTickets();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isComposingEmail, setIsComposingEmail] = useState(false);
  const [replyToData, setReplyToData] = useState<{
    to: string;
    subject: string;
    ticketId: string;
  } | null>(null);

  useEffect(() => {
    setSelectedId(null);
    setIsComposingEmail(false);
    setReplyToData(null);
  }, [scopeKey]);

  useEffect(() => {
    const target = getNotificationResourceTarget();
    if (!target) return;

    const matchedTicket = tickets.find((ticket) =>
      ticketMatchesNotificationResource(ticket, target),
    );
    if (!matchedTicket) return;

    setSelectedId(matchedTicket.id);
    setIsComposingEmail(false);
    setReplyToData(null);
    clearNotificationResourceTarget();
  }, [tickets]);

  useEffect(() => {
    if (selectedId) {
      markAsRead(selectedId);
      ensureTicketDetails(selectedId).catch(() => undefined);
    }
  }, [selectedId, ensureTicketDetails, markAsRead]);

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

  const selected = selectedId
    ? (tickets.find((t) => t.id === selectedId) ?? getById(selectedId))
    : undefined;

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
          isLoading={isLoading}
          error={error}
          onRefresh={refreshTickets}
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
          <TicketDetailPanel
            ticket={selected}
            onReplyEmail={handleReplyEmail}
            onSelectTicket={handleSelect}
          />
        )}
      </div>
    </div>
  );
}
