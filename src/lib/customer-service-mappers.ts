import type {
  RemoteTicketStatus,
  RemoteTicket,
  RemoteWebsiteMessage,
  RemoteWhatsappMessage,
  RemoteWhatsappRoom,
} from "@/lib/customer-service-api";
import type { Ticket, TicketMessage, TicketReference, TicketStatus } from "@/lib/types/ticket";
import { normalizeWhatsappDigits } from "@/lib/whatsapp-room-aliases";

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

function looksLikeEscapedHtml(value: string) {
  return /&lt;\/?[a-z][\s\S]*?&gt;/i.test(value);
}

function decodeEscapedHtmlTags(value: string) {
  return value
    .replace(/&lt;([\s\S]*?)&gt;/gi, "<$1>")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&amp;/g, "&");
}

function richTextToSafeHtml(value?: string | null) {
  const rawHtml = compactText(value, "-");
  const html = looksLikeEscapedHtml(rawHtml) ? decodeEscapedHtmlTags(rawHtml) : rawHtml;

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

function numberOrUndefined(value?: number | string | null) {
  const numeric = Number(value);
  return Number.isFinite(numeric) ? numeric : undefined;
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

function isLidHandle(value?: string | null) {
  return /@lid$/i.test(compactText(value));
}

function getWhatsappRoomPhoneHandle(room: RemoteWhatsappRoom) {
  const chatIdPhone = compactText(room.chatId).split("@")[0];
  const phone = compactText(room.phone) || (/^\d+$/.test(chatIdPhone) ? chatIdPhone : "");
  if (!phone) return "";

  const countryCode = compactText(room.countryCode, "62").replace(/\D/g, "") || "62";
  const phoneDigits = phone.replace(/\D/g, "");
  const normalizedPhone = phoneDigits.startsWith(countryCode)
    ? phoneDigits
    : normalizeWhatsappDigits(`${countryCode}${phoneDigits}`);

  if (normalizedPhone.startsWith("62") && normalizedPhone.length > 2) {
    return `+62 ${normalizedPhone.slice(2)}`;
  }

  return normalizedPhone ? `+${normalizedPhone}` : "";
}

function getWhatsappRoomDisplayName(room: RemoteWhatsappRoom, phoneHandle: string, roomId: number) {
  const displayName = compactText(room.displayName);
  if (displayName && !isLidHandle(displayName)) return displayName;

  const roomName = compactText(room.roomName);
  if (roomName && !isLidHandle(roomName)) return roomName;

  if (phoneHandle) return phoneHandle;

  const chatId = compactText(room.chatId);
  if (chatId && !isLidHandle(chatId)) return chatId;

  return `WhatsApp Room ${roomId}`;
}

function getWhatsappRoomAvatar(room?: RemoteWhatsappRoom) {
  return compactText(room?.displayPicture) || undefined;
}

export function mapWebsiteTicket(ticket: RemoteTicket, messages?: RemoteWebsiteMessage[]): Ticket {
  const createdAt = timestamp(ticket.createdAt);
  const updatedAt = timestamp(ticket.updatedAt ?? ticket.createdAt);
  const detailMessages = messages ?? ticket.messages ?? undefined;
  const hasDetailMessages = Array.isArray(detailMessages);
  const remoteLastMessage =
    ticket.lastMessage && "ticketId" in ticket.lastMessage ? ticket.lastMessage : undefined;
  const initialMessage: TicketMessage = {
    id: `website-ticket-${ticket.id}-body`,
    authorId: String(ticket.profileId ?? `website-user-${ticket.id}`),
    authorName: getReporterName(ticket),
    content: richTextToSafeHtml(ticket.body),
    attachments: urlAttachments(ticket.attachments),
    createdAt,
    direction: "in",
  };

  const mappedMessages = detailMessages?.map(mapWebsiteMessage) ?? [];
  const allMessages = [initialMessage, ...mappedMessages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
  const lastMessage = allMessages.at(-1);
  const fallbackLastMessageAt =
    ticket.lastMessageAt ??
    ticket.latestMessageAt ??
    remoteLastMessage?.createdAt ??
    ticket.createdAt;
  const snippet = compactText(
    htmlToText(hasDetailMessages ? lastMessage?.content : (remoteLastMessage?.body ?? ticket.body)),
    (hasDetailMessages ? lastMessage?.attachments?.length : remoteLastMessage?.attachments?.length)
      ? "Pesan media"
      : "-",
  );

  const lastMessageAt = hasDetailMessages
    ? (lastMessage?.createdAt ?? timestamp(fallbackLastMessageAt))
    : timestamp(fallbackLastMessageAt);

  return {
    id: `website:${ticket.id}`,
    externalIds: { websiteTicketId: Number(ticket.id) },
    source: "website",
    subject: compactText(ticket.subject, `Website Report #${ticket.id}`),
    snippet,
    senderName: getReporterName(ticket),
    senderHandle: getReporterHandle(ticket),
    updatedAt: newerTimestamp(updatedAt, hasDetailMessages ? lastMessage?.createdAt : undefined),
    lastMessageAt,
    status: remoteStatusToTicketStatus(ticket.slaStatus),
    unread: Number(ticket.unreadMessages ?? 0) > 0,
    unreadCount: Number(ticket.unreadMessages ?? 0) || undefined,
    isSavedAsTicket: true,
    isSynced: true,
    isDetailsLoaded: hasDetailMessages,
    isPinned: Boolean(ticket.isPinned),
    viewKind: "ticket",
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
    content: richTextToSafeHtml(message.body),
    attachments: urlAttachments(message.attachments),
    createdAt: timestamp(message.createdAt),
    direction: out ? "out" : "in",
  };
}

export function remoteTicketToReference(ticket: RemoteTicket): TicketReference {
  return {
    id: Number(ticket.id),
    subject: compactText(ticket.subject, `Ticket #${ticket.id}`),
    body: compactText(ticket.body),
    status: remoteStatusToTicketStatus(ticket.slaStatus),
    isPinned: Boolean(ticket.isPinned),
    createdAt: ticket.createdAt ?? undefined,
    updatedAt: ticket.updatedAt ?? undefined,
    messageExternalId: numberOrUndefined(ticket.whatsappMessageChatId),
  };
}

export function mapWhatsappRoom(
  room: RemoteWhatsappRoom,
  ticketHistory: TicketReference[] = [],
): Ticket {
  const roomId = Number(room.id);
  const phoneHandle = getWhatsappRoomPhoneHandle(room);
  const displayName = getWhatsappRoomDisplayName(room, phoneHandle, roomId);
  const unreadCount = Number(room.unreadMessage ?? 0);
  const roomUpdatedAt = timestamp(room.updatedAt ?? room.createdAt);

  return {
    id: `whatsapp:${roomId}`,
    externalIds: {
      whatsappRoomChatId: roomId,
    },
    viewKind: "conversation",
    source: "whatsapp",
    subject: `Chat WhatsApp - ${displayName}`,
    snippet: "Room chat WhatsApp",
    senderName: displayName,
    senderHandle:
      phoneHandle || (isLidHandle(room.chatId) ? "WhatsApp" : compactText(room.chatId, "WhatsApp")),
    senderAvatar: getWhatsappRoomAvatar(room),
    updatedAt: roomUpdatedAt,
    lastMessageAt: roomUpdatedAt,
    unread: unreadCount > 0,
    unreadCount: unreadCount || undefined,
    isPinned: Boolean(room.isPinned),
    isSavedAsTicket: false,
    isSynced: true,
    isDetailsLoaded: false,
    ticketHistory,
    messages: [],
  };
}

export function mapWhatsappTicket(
  ticket: RemoteTicket,
  room?: RemoteWhatsappRoom,
  ticketHistory?: TicketReference[],
): Ticket {
  const roomId = ticket.whatsappRoomChatId != null ? Number(ticket.whatsappRoomChatId) : undefined;
  const phoneHandle = room ? getWhatsappRoomPhoneHandle(room) : "";
  const displayName = room
    ? getWhatsappRoomDisplayName(room, phoneHandle, Number(room.id))
    : roomId
      ? `WhatsApp Room ${roomId}`
      : "WhatsApp User";
  const reference = remoteTicketToReference(ticket);
  const history = ticketHistory?.length
    ? [reference, ...ticketHistory.filter((item) => item.id !== reference.id)]
    : [reference];

  const ticketUpdatedAt = timestamp(ticket.updatedAt ?? ticket.createdAt);
  const lastMessageAt = timestamp(room?.updatedAt ?? ticket.updatedAt ?? ticket.createdAt);

  return {
    id: `whatsapp-ticket:${ticket.id}`,
    externalIds: {
      whatsappTicketId: Number(ticket.id),
      whatsappRoomChatId: roomId,
      whatsappTicketMessageChatId: reference.messageExternalId,
    },
    viewKind: "ticket",
    source: "whatsapp",
    subject: compactText(ticket.subject, `WhatsApp Ticket #${ticket.id}`),
    snippet: compactText(ticket.body, "-"),
    senderName: displayName,
    senderHandle:
      phoneHandle ||
      (room && isLidHandle(room.chatId) ? "WhatsApp" : compactText(room?.chatId, "WhatsApp")),
    senderAvatar: getWhatsappRoomAvatar(room),
    updatedAt: ticketUpdatedAt,
    lastMessageAt,
    status: remoteStatusToTicketStatus(ticket.slaStatus),
    isPinned: Boolean(ticket.isPinned),
    isSavedAsTicket: true,
    isSynced: true,
    isDetailsLoaded: false,
    ticketHistory: history,
    focusedMessageExternalId: reference.messageExternalId,
    messages: [
      {
        id: `whatsapp-ticket-${ticket.id}-body`,
        authorId: "customer",
        authorName: displayName,
        content: compactText(ticket.body, "-"),
        attachments: urlAttachments(ticket.attachments),
        createdAt: timestamp(ticket.createdAt),
        direction: "in",
        ticketReferences: [reference],
      },
    ],
  };
}

export function mapWhatsappTicketWithoutRoom(ticket: RemoteTicket): Ticket {
  return mapWhatsappTicket(ticket);
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
          type: message.mediaMimeType ?? undefined,
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

function remoteWhatsappMessageBody(message: RemoteWhatsappMessage) {
  return compactText(message.body).toLowerCase();
}

function referenceBody(reference: TicketReference) {
  return compactText(reference.body).toLowerCase();
}

function findReferenceMessageId(
  reference: TicketReference,
  messages: RemoteWhatsappMessage[],
  usedMessageIds: Set<number>,
) {
  if (reference.messageExternalId != null) return reference.messageExternalId;

  const body = referenceBody(reference);
  if (body) {
    const sameBody = messages.find(
      (message) =>
        !usedMessageIds.has(Number(message.id)) &&
        message.senderType === "customer" &&
        remoteWhatsappMessageBody(message) === body,
    );
    if (sameBody) return Number(sameBody.id);
  }

  if (!reference.createdAt) return undefined;

  const referenceTime = new Date(reference.createdAt).getTime();
  if (!Number.isFinite(referenceTime)) return undefined;

  const closest = messages
    .filter(
      (message) => !usedMessageIds.has(Number(message.id)) && message.senderType === "customer",
    )
    .map((message) => ({
      message,
      distance: Math.abs(
        new Date(message.createdAt ?? message.sentAt ?? "").getTime() - referenceTime,
      ),
    }))
    .filter((item) => Number.isFinite(item.distance))
    .sort((a, b) => a.distance - b.distance)[0]?.message;

  if (closest) return Number(closest.id);

  const direct = messages.find(
    (message) =>
      Number(message.ticketId) === reference.id && !usedMessageIds.has(Number(message.id)),
  );

  return direct ? Number(direct.id) : undefined;
}

function resolveWhatsappTicketReferences(ticket: Ticket, messages: RemoteWhatsappMessage[]) {
  const references = ticket.ticketHistory ?? [];
  const usedMessageIds = new Set<number>();
  const refsByMessageId = new Map<number, TicketReference[]>();

  references.forEach((reference) => {
    const messageExternalId = findReferenceMessageId(reference, messages, usedMessageIds);
    if (messageExternalId == null) return;

    usedMessageIds.add(messageExternalId);
    const resolvedReference = { ...reference, messageExternalId };
    const existing = refsByMessageId.get(messageExternalId) ?? [];
    refsByMessageId.set(messageExternalId, [...existing, resolvedReference]);
  });

  return refsByMessageId;
}

export function applyWhatsappMessages(ticket: Ticket, messages: RemoteWhatsappMessage[]): Ticket {
  const refsByMessageId = resolveWhatsappTicketReferences(ticket, messages);
  const mappedMessages = messages
    .map((message) => {
      const mappedMessage = mapWhatsappMessage(message, ticket.senderName);
      const messageExternalId = Number(message.id);
      const ticketReferences = refsByMessageId.get(messageExternalId);

      return ticketReferences?.length
        ? {
            ...mappedMessage,
            ticketReferences,
          }
        : mappedMessage;
    })
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const lastMessage = mappedMessages.at(-1);
  const referableMessage = [...messages]
    .reverse()
    .find((message) => message.senderType === "customer" || message.body || message.mediaUrl);
  const focusedTicketMessage = mappedMessages.find((message) =>
    message.ticketReferences?.some((ref) => ref.id === ticket.externalIds?.whatsappTicketId),
  );
  const focusedMessageExternalId =
    ticket.focusedMessageExternalId ??
    numberOrUndefined(ticket.externalIds?.whatsappTicketMessageChatId) ??
    numberOrUndefined(focusedTicketMessage?.externalId);
  const lastMessageSnippet =
    lastMessage?.content || (lastMessage?.attachments?.length ? "Pesan media" : ticket.snippet);

  return {
    ...ticket,
    externalIds: {
      ...ticket.externalIds,
      whatsappMessageChatId:
        referableMessage?.id != null
          ? Number(referableMessage.id)
          : ticket.externalIds?.whatsappMessageChatId,
      whatsappTicketMessageChatId:
        ticket.externalIds?.whatsappTicketMessageChatId ?? focusedMessageExternalId,
    },
    focusedMessageExternalId,
    snippet: lastMessageSnippet,
    updatedAt:
      ticket.viewKind === "ticket"
        ? ticket.updatedAt
        : (lastMessage?.createdAt ?? ticket.updatedAt),
    lastMessageAt: lastMessage?.createdAt ?? ticket.lastMessageAt ?? ticket.updatedAt,
    isDetailsLoaded: true,
    messages: mappedMessages,
  };
}
