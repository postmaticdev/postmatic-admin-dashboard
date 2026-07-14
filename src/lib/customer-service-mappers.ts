import type {
  RemoteTicketStatus,
  RemoteTicket,
  RemoteWebsiteMessage,
  RemoteWhatsappMessage,
  RemoteWhatsappRoom,
} from "@/lib/customer-service-api";
import type { Ticket, TicketMessage, TicketStatus } from "@/lib/types/ticket";

export function remoteStatusToTicketStatus(status?: string | null): TicketStatus | undefined {
  if (status === "resolved") return "done";
  if (status === "in_progress") return "progress";
  if (status === "open" || status === "pending") return "review";
  return undefined;
}

export function ticketStatusToRemoteStatus(status?: TicketStatus): RemoteTicketStatus {
  if (status === "done") return "resolved";
  if (status === "progress") return "in_progress";
  return "pending";
}

function compactText(value: unknown, fallback = "") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function timestamp(value?: string | null) {
  return value || new Date().toISOString();
}

function newerTimestamp(left: string, right?: string | null) {
  if (!right) return left;
  return new Date(right).getTime() > new Date(left).getTime() ? right : left;
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function plainTextToSafeHtml(value?: string | null) {
  return escapeHtml(compactText(value, "-")).replace(/\n/g, "<br />");
}

function looksLikeHtml(value: string) {
  return /<\/?[a-z][\s\S]*>/i.test(value);
}

function richTextToSafeHtml(value?: string | null) {
  const html = compactText(value, "-");

  if (!looksLikeHtml(html)) {
    return plainTextToSafeHtml(html);
  }

  return html
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+=(".*?"|'.*?'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)=(["'])\s*javascript:[\s\S]*?\2/gi, ' $1="#"');
}

function htmlToText(value?: string | null) {
  return compactText(value)
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, " ")
    .trim();
}

function attachmentName(url: string, fallback: string) {
  try {
    const pathname = new URL(url).pathname;
    const filename = pathname.split("/").filter(Boolean).pop();
    return filename || fallback;
  } catch {
    return fallback;
  }
}

function urlAttachments(urls?: string[] | null) {
  return (urls ?? []).filter(Boolean).map((url, index) => ({
    name: attachmentName(url, `attachment-${index + 1}`),
    url,
  }));
}

function getReporterName(ticket: RemoteTicket) {
  const email = compactText(ticket.email);
  if (email) return email.split("@")[0] || email;

  const phone = compactText(ticket.phone);
  if (phone) return `+${compactText(ticket.countryCode)} ${phone}`.trim();

  return ticket.channel === "website" ? "Website User" : "WhatsApp User";
}

function getReporterHandle(ticket: RemoteTicket) {
  const email = compactText(ticket.email);
  if (email) return email;

  const phone = compactText(ticket.phone);
  if (phone) return `+${compactText(ticket.countryCode)} ${phone}`.trim();

  return ticket.channel;
}

export function mapWebsiteTicket(ticket: RemoteTicket, messages?: RemoteWebsiteMessage[]): Ticket {
  const createdAt = timestamp(ticket.createdAt);
  const updatedAt = timestamp(ticket.updatedAt ?? ticket.createdAt);
  const initialMessage: TicketMessage = {
    id: `website-ticket-${ticket.id}-body`,
    authorId: String(ticket.profileId ?? `website-user-${ticket.id}`),
    authorName: getReporterName(ticket),
    content: plainTextToSafeHtml(ticket.body),
    attachments: urlAttachments(ticket.attachments),
    createdAt,
    direction: "in",
  };

  const mappedMessages = messages?.map(mapWebsiteMessage) ?? [];
  const allMessages = [initialMessage, ...mappedMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const lastMessage = allMessages.at(-1);
  const snippet = compactText(
    htmlToText(messages ? lastMessage?.content : ticket.body),
    lastMessage?.attachments?.length ? "Pesan media" : "-",
  );

  return {
    id: `website:${ticket.id}`,
    externalIds: { websiteTicketId: Number(ticket.id) },
    source: "website",
    subject: compactText(ticket.subject, `Website Report #${ticket.id}`),
    snippet,
    senderName: getReporterName(ticket),
    senderHandle: getReporterHandle(ticket),
    updatedAt: newerTimestamp(updatedAt, messages ? lastMessage?.createdAt : undefined),
    status: remoteStatusToTicketStatus(ticket.slaStatus),
    isSavedAsTicket: true,
    isSynced: true,
    isDetailsLoaded: Boolean(messages),
    messages: allMessages,
  };
}

export function mapWebsiteMessage(message: RemoteWebsiteMessage): TicketMessage {
  const profile = message.profile;
  const out = message.senderType === "customer_service";

  return {
    id: `website-message-${message.id}`,
    externalId: message.id,
    authorId: String(message.profileId ?? profile?.id ?? `website-message-${message.id}`),
    authorName: compactText(profile?.name, out ? "CS Postmatic" : "Website User"),
    content: out ? richTextToSafeHtml(message.body) : plainTextToSafeHtml(message.body),
    attachments: urlAttachments(message.attachments),
    createdAt: timestamp(message.createdAt),
    direction: out ? "out" : "in",
  };
}

export function mapWhatsappRoom(room: RemoteWhatsappRoom, linkedTicket?: RemoteTicket): Ticket {
  const roomId = Number(room.id);
  const phoneHandle = `+${compactText(room.countryCode)} ${compactText(room.phone)}`.trim();
  const displayName = compactText(
    room.roomName,
    phoneHandle || compactText(room.chatId, `Room ${roomId}`),
  );
  const linkedTicketId = linkedTicket?.id != null ? Number(linkedTicket.id) : undefined;

  return {
    id: `whatsapp:${roomId}`,
    externalIds: {
      whatsappRoomChatId: roomId,
      whatsappTicketId: linkedTicketId,
    },
    source: "whatsapp",
    subject: compactText(linkedTicket?.subject, `Chat WhatsApp - ${displayName}`),
    snippet: compactText(linkedTicket?.body, "Room chat WhatsApp"),
    senderName: displayName,
    senderHandle: phoneHandle || compactText(room.chatId, "WhatsApp"),
    updatedAt: timestamp(linkedTicket?.updatedAt ?? room.updatedAt ?? room.createdAt),
    status: remoteStatusToTicketStatus(linkedTicket?.slaStatus),
    isSavedAsTicket: Boolean(linkedTicket),
    isSynced: true,
    isDetailsLoaded: false,
    messages: [],
  };
}

export function mapWhatsappTicketWithoutRoom(ticket: RemoteTicket): Ticket {
  const roomId = ticket.whatsappRoomChatId != null ? Number(ticket.whatsappRoomChatId) : undefined;

  return {
    id: `whatsapp-ticket:${ticket.id}`,
    externalIds: {
      whatsappTicketId: Number(ticket.id),
      whatsappRoomChatId: roomId,
    },
    source: "whatsapp",
    subject: compactText(ticket.subject, `WhatsApp Ticket #${ticket.id}`),
    snippet: compactText(ticket.body, "-"),
    senderName: roomId ? `WhatsApp Room ${roomId}` : "WhatsApp User",
    senderHandle: "WhatsApp",
    updatedAt: timestamp(ticket.updatedAt ?? ticket.createdAt),
    status: remoteStatusToTicketStatus(ticket.slaStatus),
    isSavedAsTicket: true,
    isSynced: true,
    isDetailsLoaded: false,
    messages: [
      {
        id: `whatsapp-ticket-${ticket.id}-body`,
        authorId: "customer",
        authorName: "WhatsApp User",
        content: compactText(ticket.body, "-"),
        attachments: urlAttachments(ticket.attachments),
        createdAt: timestamp(ticket.createdAt),
        direction: "in",
      },
    ],
  };
}

export function mapWhatsappMessage(
  message: RemoteWhatsappMessage,
  fallbackName: string,
): TicketMessage {
  const out = message.senderType === "agent";
  const attachment = message.mediaUrl
    ? [
        {
          name: compactText(
            message.mediaFilename,
            attachmentName(message.mediaUrl, `media-${message.id}`),
          ),
          url: message.mediaUrl,
        },
      ]
    : undefined;

  return {
    id: `whatsapp-message-${message.id}`,
    externalId: message.id,
    authorId: String(message.profileId ?? (out ? "agent" : "customer")),
    authorName: compactText(message.profile?.name, out ? "CS Postmatic" : fallbackName),
    content: compactText(message.body),
    attachments: attachment,
    createdAt: timestamp(message.sentAt ?? message.timestamp ?? message.createdAt),
    direction: out ? "out" : "in",
    sentStatus: message.sentStatus,
    pendingAt: message.pendingAt,
    sentAt: message.sentAt,
    deliveredAt: message.deliveredAt,
    readAt: message.readAt,
    quotedExternalId: message.quotedWhatsappMessageId,
    quotedMessage: message.quotedWhatsappMessage
      ? {
          authorName:
            message.quotedWhatsappMessage.senderType === "agent" ? "CS Postmatic" : fallbackName,
          content: compactText(message.quotedWhatsappMessage.body, "Pesan media"),
        }
      : undefined,
  };
}

export function applyWhatsappMessages(ticket: Ticket, messages: RemoteWhatsappMessage[]): Ticket {
  const mappedMessages = messages
    .map((message) => mapWhatsappMessage(message, ticket.senderName))
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const lastMessage = mappedMessages.at(-1);
  const referableMessage = [...messages]
    .reverse()
    .find((message) => message.senderType === "customer" || message.body || message.mediaUrl);

  return {
    ...ticket,
    externalIds: {
      ...ticket.externalIds,
      whatsappMessageChatId:
        referableMessage?.id != null
          ? Number(referableMessage.id)
          : ticket.externalIds?.whatsappMessageChatId,
    },
    snippet:
      lastMessage?.content || (lastMessage?.attachments?.length ? "Pesan media" : ticket.snippet),
    updatedAt: lastMessage?.createdAt ?? ticket.updatedAt,
    isDetailsLoaded: true,
    messages: mappedMessages,
  };
}
