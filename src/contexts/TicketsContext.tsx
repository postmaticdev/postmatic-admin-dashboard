import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import {
  createWhatsappRoom,
  createWhatsappTicket,
  getChatBlastHistories,
  getRealtimeWebsocketUrl,
  getWebsiteTicketDetail,
  getWebsiteTickets,
  getWhatsappMessages,
  getWhatsappRooms,
  getWhatsappTickets,
  replyWebsiteTicket,
  replyWhatsappRoom,
  setTicketPinned,
  setWhatsappRoomPinned,
  updateWebsiteTicketStatus,
  updateWhatsappTicketStatus,
  type RemoteChatBlastHistory,
  type RemoteTicket,
  type RemoteWebsiteMessage,
  type RemoteWhatsappMessage,
  type RemoteWhatsappRoom,
  type WhatsappRoomCreateResult,
} from "@/lib/customer-service-api";
import {
  applyWhatsappMessages,
  mapWebsiteMessage,
  mapWebsiteTicket,
  mapWhatsappMessage,
  mapWhatsappRoom,
  mapWhatsappTicket,
  remoteTicketToReference,
  remoteStatusToTicketStatus,
  ticketStatusToRemoteStatus,
} from "@/lib/customer-service-mappers";
import { MOCK_TICKETS } from "@/lib/mock/tickets";
import type {
  Ticket,
  TicketMessage,
  TicketReference,
  TicketSource,
  TicketStatus,
} from "@/lib/types/ticket";
import {
  findWhatsappRoomAlias,
  normalizeWhatsappDigits,
  rememberWhatsappRoomAlias,
  whatsappPhonesMatch,
} from "@/lib/whatsapp-room-aliases";
import { useAuth } from "@/hooks/useAuth";

const CUSTOMER_SERVICE_QUERY_KEY = ["customer-service", "overview"] as const;
const GMAIL_MOCK_TICKETS = MOCK_TICKETS.filter((ticket) => ticket.source === "gmail");
const REALTIME_TOPICS = ["chat.whatsapp.admin", "chat.website.admin", "ticket.admin"] as const;
const REALTIME_PING_INTERVAL_MS = 15_000;
const REALTIME_RECONNECT_DELAY_MS = 2_000;
const REALTIME_MAX_RECONNECT_ATTEMPTS = 3;
const REALTIME_FALLBACK_REFRESH_INTERVAL_MS = 5_000;
const WHATSAPP_BLAST_DEDUPE_WINDOW_MS = 10 * 60 * 1_000;

function getNewerTimestamp(left: string, right?: string | null) {
  if (!right) return left;
  return new Date(right).getTime() > new Date(left).getTime() ? right : left;
}

function htmlToSnippetText(value?: string | null) {
  return (value ?? "")
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

function htmlToMessageText(value?: string | null) {
  return (value ?? "")
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|li|h[1-6])>/gi, "\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/[ \t]+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function getAttachmentName(url: string, fallback: string) {
  const rawName = url.split(/[?#]/)[0].split("/").filter(Boolean).at(-1) ?? fallback;

  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
}

function getWhatsappBlastStatus(history: RemoteChatBlastHistory) {
  return history.status?.toLowerCase().trim() ?? "";
}

function isDeliveredWhatsappBlast(history: RemoteChatBlastHistory) {
  if (history.channelType?.toLowerCase() !== "whatsapp") return false;

  const status = getWhatsappBlastStatus(history);
  const succeedAssign = Number(history.succeedAssign ?? 0);

  return (
    succeedAssign > 0 ||
    status === "success" ||
    status === "sent" ||
    status === "delivered" ||
    status === "done" ||
    status === "completed"
  );
}

function getWhatsappBlastTargets(history: RemoteChatBlastHistory) {
  return (history.targets ?? [])
    .map((target) => target?.trim())
    .filter((target): target is string => Boolean(target));
}

function whatsappTargetMatches(left?: string | null, right?: string | null) {
  const normalizedLeft = left?.trim().toLowerCase();
  const normalizedRight = right?.trim().toLowerCase();

  return Boolean(
    normalizedLeft &&
    normalizedRight &&
    (normalizedLeft === normalizedRight || whatsappPhonesMatch(normalizedLeft, normalizedRight)),
  );
}

function mapWhatsappBlastHistoryMessage(history: RemoteChatBlastHistory): TicketMessage {
  const createdAt =
    history.updatedAt ?? history.scheduledFor ?? history.createdAt ?? new Date().toISOString();
  const content =
    htmlToMessageText(history.body) || htmlToMessageText(history.subject) || `Blast #${history.id}`;
  const attachments = (history.attachments ?? [])
    .map((url) => url?.trim())
    .filter((url): url is string => Boolean(url))
    .map((url, index) => ({
      name: getAttachmentName(url, `blast-${history.id}-${index + 1}`),
      url,
    }));

  return {
    id: `whatsapp-blast:${history.id}`,
    externalId: `chat-blast:${history.id}`,
    authorId: "agent",
    authorName: "CS Postmatic",
    subject: htmlToMessageText(history.subject) || undefined,
    content,
    attachments: attachments.length ? attachments : undefined,
    createdAt,
    direction: "out",
    sentStatus: getWhatsappBlastStatus(history) || null,
    sentAt: history.updatedAt ?? history.createdAt ?? createdAt,
  };
}

function getRealtimeTopics(tickets: Ticket[]) {
  const topics = new Set<string>(REALTIME_TOPICS);

  tickets.forEach((ticket) => {
    const whatsappRoomChatId = ticket.externalIds?.whatsappRoomChatId;
    if (ticket.source === "whatsapp" && whatsappRoomChatId != null) {
      topics.add(`chat.whatsapp.room.${whatsappRoomChatId}`);
    }

    const websiteTicketId = ticket.externalIds?.websiteTicketId;
    if (ticket.source === "website" && websiteTicketId != null) {
      topics.add(`ticket.${websiteTicketId}`);
    }
  });

  return topics;
}

interface TicketsContextValue {
  tickets: Ticket[];
  isLoading: boolean;
  error: string | null;
  refreshTickets: () => void;
  ensureTicketDetails: (id: string) => Promise<void>;
  getBySource: (source: TicketSource) => Ticket[];
  getSaved: () => Ticket[];
  getById: (id: string) => Ticket | undefined;
  openWhatsappTicketReference: (
    sourceTicketId: string,
    reference: TicketReference,
  ) => string | null;
  markAsTicket: (
    id: string,
    opts?: { subject?: string; messageExternalId?: number },
  ) => Promise<void>;
  unmarkAsTicket: (id: string) => void;
  togglePinTicket: (id: string) => void;
  createTicket: (
    ticket: Omit<Ticket, "id" | "updatedAt" | "isSavedAsTicket" | "status"> & {
      id?: string;
      status?: TicketStatus;
      isSavedAsTicket?: boolean;
    },
  ) => Ticket;
  updateTicketStatus: (id: string, status?: TicketStatus) => void;
  addMessage: (ticketId: string, message: Omit<TicketMessage, "id" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  getDraft: <T = unknown>(key: string) => T | undefined;
  setDraft: (key: string, val: unknown) => void;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

function hasPendingOutgoingWhatsappMessage(ticket: Ticket) {
  return (
    ticket.source === "whatsapp" &&
    ticket.messages.some((message) => {
      const status = message.sentStatus?.toLowerCase();

      return (
        message.direction === "out" &&
        (Boolean(message.pendingAt) ||
          status === "pending" ||
          status === "enqueued" ||
          status === "queued" ||
          status === "scheduled")
      );
    })
  );
}

function isUnhelpfulWhatsappIdentity(value?: string | null) {
  const text = value?.trim() ?? "";

  return !text || /@lid$/i.test(text) || /^WhatsApp Room \d+$/i.test(text) || text === "WhatsApp";
}

function isWhatsappTicketView(ticket: Ticket) {
  return ticket.source === "whatsapp" && ticket.viewKind === "ticket";
}

function isWhatsappConversationView(ticket: Ticket) {
  return ticket.source === "whatsapp" && ticket.viewKind !== "ticket";
}

function getRemoteTicketId(ticket: Ticket) {
  return ticket.externalIds?.websiteTicketId ?? ticket.externalIds?.whatsappTicketId;
}

function mergeTicketReference(existing: TicketReference | undefined, next: TicketReference) {
  return {
    ...existing,
    ...next,
    subject: next.subject || existing?.subject || `Ticket #${next.id}`,
    body: next.body || existing?.body,
    status: next.status ?? existing?.status,
    isPinned: next.isPinned ?? existing?.isPinned,
    createdAt: next.createdAt ?? existing?.createdAt,
    updatedAt: next.updatedAt ?? existing?.updatedAt,
    messageExternalId: next.messageExternalId ?? existing?.messageExternalId,
  } satisfies TicketReference;
}

function mergeTicketReferences(references: Array<TicketReference | null | undefined>) {
  const byId = new Map<number, TicketReference>();

  references.forEach((reference) => {
    if (!reference) return;
    byId.set(reference.id, mergeTicketReference(byId.get(reference.id), reference));
  });

  return [...byId.values()].sort((a, b) => {
    const aTime = new Date(a.createdAt ?? a.updatedAt ?? "").getTime();
    const bTime = new Date(b.createdAt ?? b.updatedAt ?? "").getTime();

    if (Number.isFinite(aTime) && Number.isFinite(bTime) && aTime !== bTime) {
      return bTime - aTime;
    }

    return b.id - a.id;
  });
}

function ticketToWhatsappReference(ticket: Ticket) {
  const ticketId = ticket.externalIds?.whatsappTicketId;
  if (ticket.source !== "whatsapp" || ticketId == null) return null;

  const existingReference = ticket.ticketHistory?.find((reference) => reference.id === ticketId);

  return {
    id: ticketId,
    subject: ticket.subject || existingReference?.subject || `Ticket #${ticketId}`,
    body: existingReference?.body || ticket.snippet,
    status: ticket.status ?? existingReference?.status,
    isPinned: ticket.isPinned ?? existingReference?.isPinned,
    createdAt: existingReference?.createdAt,
    updatedAt: ticket.updatedAt ?? existingReference?.updatedAt,
    messageExternalId:
      ticket.focusedMessageExternalId ??
      ticket.externalIds?.whatsappTicketMessageChatId ??
      existingReference?.messageExternalId,
  } satisfies TicketReference;
}

function collectWhatsappRoomReferences(
  tickets: Ticket[],
  roomChatId: number,
  extraReferences: TicketReference[] = [],
) {
  const roomTickets = tickets.filter(
    (ticket) =>
      ticket.source === "whatsapp" && ticket.externalIds?.whatsappRoomChatId === roomChatId,
  );

  return mergeTicketReferences([
    ...extraReferences,
    ...roomTickets.flatMap((ticket) => ticket.ticketHistory ?? []),
    ...roomTickets.flatMap((ticket) =>
      ticket.messages.flatMap((message) => message.ticketReferences ?? []),
    ),
    ...roomTickets.map(ticketToWhatsappReference),
  ]);
}

function applyWhatsappRoomAliases(tickets: Ticket[]) {
  return tickets.map((ticket) => {
    if (ticket.source !== "whatsapp") return ticket;

    const alias = findWhatsappRoomAlias({
      roomChatId: ticket.externalIds?.whatsappRoomChatId,
      phones: [ticket.senderHandle],
    });
    if (!alias) return ticket;

    const shouldUseAliasIdentity =
      alias.roomChatId === ticket.externalIds?.whatsappRoomChatId ||
      isUnhelpfulWhatsappIdentity(ticket.senderName) ||
      isUnhelpfulWhatsappIdentity(ticket.senderHandle);
    const aliasMessageAlreadyExists =
      alias.lastMessage &&
      ticket.messages.some(
        (message) =>
          message.id === alias.lastMessage?.id ||
          (message.externalId != null &&
            alias.lastMessage?.externalId != null &&
            String(message.externalId) === String(alias.lastMessage.externalId)),
      );
    const messages =
      alias.lastMessage && !aliasMessageAlreadyExists && ticket.messages.length === 0
        ? [alias.lastMessage]
        : ticket.messages;
    const shouldUseAliasSnippet =
      !ticket.snippet || ticket.snippet === "Room chat WhatsApp" || shouldUseAliasIdentity;

    return {
      ...ticket,
      senderName: shouldUseAliasIdentity ? alias.senderName : ticket.senderName,
      senderHandle: shouldUseAliasIdentity ? alias.senderHandle : ticket.senderHandle,
      senderAvatar: alias.senderAvatar ?? ticket.senderAvatar,
      subject:
        shouldUseAliasIdentity && isWhatsappConversationView(ticket)
          ? (alias.subject ?? ticket.subject)
          : ticket.subject,
      snippet: shouldUseAliasSnippet ? (alias.snippet ?? ticket.snippet) : ticket.snippet,
      updatedAt: getNewerTimestamp(ticket.updatedAt, alias.updatedAt),
      lastMessageAt: getNewerTimestamp(ticket.lastMessageAt ?? ticket.updatedAt, alias.updatedAt),
      messages,
    };
  });
}

function ticketsShareRemoteIdentity(left: Ticket, right: Ticket) {
  const leftIds = left.externalIds;
  const rightIds = right.externalIds;

  if (left.source !== right.source) return false;

  if (
    left.source === "website" &&
    leftIds?.websiteTicketId != null &&
    leftIds.websiteTicketId === rightIds?.websiteTicketId
  ) {
    return true;
  }

  return Boolean(
    left.source === "whatsapp" &&
    ((leftIds?.whatsappTicketId != null &&
      rightIds?.whatsappTicketId != null &&
      leftIds.whatsappTicketId === rightIds.whatsappTicketId) ||
      (isWhatsappConversationView(left) &&
        isWhatsappConversationView(right) &&
        leftIds?.whatsappRoomChatId != null &&
        leftIds.whatsappRoomChatId === rightIds?.whatsappRoomChatId)),
  );
}

function findMatchingLocalTicket(remoteTicket: Ticket, previousTickets: Ticket[]) {
  return previousTickets.find(
    (ticket) => ticket.id === remoteTicket.id || ticketsShareRemoteIdentity(ticket, remoteTicket),
  );
}

function mergeRemoteTickets(remoteTickets: Ticket[], previousTickets: Ticket[]) {
  const localOnlyTickets = previousTickets.filter(
    (ticket) =>
      !ticket.isSynced || ticket.source === "gmail" || hasPendingOutgoingWhatsappMessage(ticket),
  );

  const mergedRemote = remoteTickets.map((remoteTicket) => {
    const localTicket = findMatchingLocalTicket(remoteTicket, previousTickets);
    if (!localTicket) return remoteTicket;

    const keepLocalDetails =
      localTicket.isDetailsLoaded && localTicket.messages.length > remoteTicket.messages.length;
    const keepLocalIdentity =
      localTicket.id !== remoteTicket.id && hasPendingOutgoingWhatsappMessage(localTicket);
    const localLastMessage = keepLocalDetails ? localTicket.messages.at(-1) : undefined;

    return {
      ...remoteTicket,
      id: keepLocalIdentity ? localTicket.id : remoteTicket.id,
      isPinned: localTicket.isPinned,
      unread: localTicket.unread,
      isDetailsLoaded: keepLocalDetails || remoteTicket.isDetailsLoaded,
      senderName: keepLocalDetails ? localTicket.senderName : remoteTicket.senderName,
      senderHandle: keepLocalDetails ? localTicket.senderHandle : remoteTicket.senderHandle,
      senderAvatar: localTicket.senderAvatar ?? remoteTicket.senderAvatar,
      snippet: localLastMessage
        ? getMessageSnippet(localLastMessage, localTicket.snippet)
        : remoteTicket.snippet,
      updatedAt: keepLocalDetails
        ? getNewerTimestamp(remoteTicket.updatedAt, localTicket.updatedAt)
        : remoteTicket.updatedAt,
      lastMessageAt: keepLocalDetails
        ? getNewerTimestamp(
            remoteTicket.lastMessageAt ?? remoteTicket.updatedAt,
            localTicket.lastMessageAt ?? localTicket.updatedAt,
          )
        : (remoteTicket.lastMessageAt ?? remoteTicket.updatedAt),
      messages: keepLocalDetails ? localTicket.messages : remoteTicket.messages,
      externalIds: {
        ...remoteTicket.externalIds,
        ...localTicket.externalIds,
      },
    };
  });

  const localOnlyWithoutRemoteDuplicates = localOnlyTickets.filter(
    (localTicket) =>
      !mergedRemote.some(
        (remoteTicket) =>
          remoteTicket.id === localTicket.id ||
          ticketsShareRemoteIdentity(localTicket, remoteTicket),
      ),
  );

  return [...mergedRemote, ...localOnlyWithoutRemoteDuplicates];
}

function toExternalAttachmentUrls(message: Omit<TicketMessage, "id" | "createdAt">) {
  return (message.attachments ?? [])
    .map((attachment) => attachment.url)
    .filter((url) => url && !url.startsWith("data:"));
}

function formatWhatsappHandle(value: string) {
  const normalized = normalizeWhatsappDigits(value);
  if (!normalized) return value.trim();

  if (normalized.startsWith("62") && normalized.length > 2) {
    return `+62 ${normalized.slice(2)}`;
  }

  return `+${normalized}`;
}

function getWhatsappBlastFailureMessage(error: unknown) {
  if (error instanceof Error && error.message.trim()) {
    return error.message;
  }

  return "Gagal membuat room WhatsApp di server.";
}

function getWhatsappRoomPhoneCandidates(room: RemoteWhatsappRoom) {
  const countryCode = String(room.countryCode ?? "").replace(/\D/g, "");
  const phone = String(room.phone ?? "").replace(/\D/g, "");

  return [
    room.phone,
    countryCode && phone ? `${countryCode}${phone}` : undefined,
    room.chatId,
    room.roomName,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function findWhatsappRoomByTarget(rooms: RemoteWhatsappRoom[], target: string) {
  return rooms.find((room) =>
    getWhatsappRoomPhoneCandidates(room).some((candidate) =>
      whatsappTargetMatches(candidate, target),
    ),
  );
}

function getWhatsappTicketTargetCandidates(ticket: Ticket) {
  return [
    ticket.senderHandle,
    ticket.senderName,
    ticket.subject,
    ticket.externalIds?.whatsappRoomChatId != null
      ? String(ticket.externalIds.whatsappRoomChatId)
      : undefined,
  ].filter((value): value is string => typeof value === "string" && value.trim().length > 0);
}

function historyMatchesWhatsappRoom(history: RemoteChatBlastHistory, room?: RemoteWhatsappRoom) {
  if (!room) return false;

  const candidates = getWhatsappRoomPhoneCandidates(room);

  return getWhatsappBlastTargets(history).some((target) =>
    candidates.some((candidate) => whatsappTargetMatches(candidate, target)),
  );
}

function historyMatchesWhatsappTicket(
  history: RemoteChatBlastHistory,
  ticket: Ticket,
  room?: RemoteWhatsappRoom,
) {
  if (historyMatchesWhatsappRoom(history, room)) return true;

  const candidates = getWhatsappTicketTargetCandidates(ticket);

  return getWhatsappBlastTargets(history).some((target) =>
    candidates.some((candidate) => whatsappTargetMatches(candidate, target)),
  );
}

function getWhatsappBlastMessagesForTicket(
  histories: RemoteChatBlastHistory[],
  ticket: Ticket,
  room?: RemoteWhatsappRoom,
) {
  if (ticket.source !== "whatsapp") return [];

  return histories
    .filter(isDeliveredWhatsappBlast)
    .filter((history) => historyMatchesWhatsappTicket(history, ticket, room))
    .map(mapWhatsappBlastHistoryMessage);
}

function getWhatsappBlastMessagesByRoom(
  histories: RemoteChatBlastHistory[],
  rooms: RemoteWhatsappRoom[],
) {
  const messagesByRoomId = new Map<number, TicketMessage[]>();

  histories.filter(isDeliveredWhatsappBlast).forEach((history) => {
    getWhatsappBlastTargets(history).forEach((target) => {
      const matchedRoom = findWhatsappRoomByTarget(rooms, target);
      const roomId = matchedRoom?.id != null ? Number(matchedRoom.id) : undefined;
      if (roomId == null || !Number.isFinite(roomId)) return;

      const message = mapWhatsappBlastHistoryMessage(history);
      const previousMessages = messagesByRoomId.get(roomId) ?? [];

      if (!previousMessages.some((item) => item.id === message.id)) {
        messagesByRoomId.set(roomId, [...previousMessages, message]);
      }
    });
  });

  return messagesByRoomId;
}

function uniqueTicketMessages(messages: TicketMessage[]) {
  return messages.reduce<TicketMessage[]>(
    (uniqueMessages, message) =>
      uniqueMessages.some((item) => messagesLookEquivalent(item, message))
        ? uniqueMessages
        : [...uniqueMessages, message],
    [],
  );
}

function messageTimeDistance(left?: string | null, right?: string | null) {
  const leftTime = new Date(left ?? "").getTime();
  const rightTime = new Date(right ?? "").getTime();

  if (!Number.isFinite(leftTime) || !Number.isFinite(rightTime)) return Number.POSITIVE_INFINITY;

  return Math.abs(leftTime - rightTime);
}

function messagesLookEquivalent(left: TicketMessage, right: TicketMessage) {
  if (left.id === right.id) return true;

  if (left.externalId != null && right.externalId != null) {
    return String(left.externalId) === String(right.externalId);
  }

  return (
    left.direction === right.direction &&
    left.direction === "out" &&
    htmlToSnippetText(left.content).toLowerCase() ===
      htmlToSnippetText(right.content).toLowerCase() &&
    messageTimeDistance(left.createdAt, right.createdAt) <= WHATSAPP_BLAST_DEDUPE_WINDOW_MS
  );
}

function mergeWhatsappBlastMessagesIntoTicket(ticket: Ticket, blastMessages: TicketMessage[]) {
  const missingMessages = blastMessages.filter(
    (blastMessage) =>
      !ticket.messages.some((message) => messagesLookEquivalent(message, blastMessage)),
  );

  if (!missingMessages.length) return ticket;

  const messages = sortTicketMessages([...ticket.messages, ...missingMessages]);
  const lastMessage = messages.at(-1);
  const lastMessageAt = lastMessage?.createdAt ?? ticket.lastMessageAt ?? ticket.updatedAt;

  return {
    ...ticket,
    snippet: lastMessage ? getMessageSnippet(lastMessage, ticket.snippet) : ticket.snippet,
    updatedAt: isWhatsappTicketView(ticket) ? ticket.updatedAt : lastMessageAt,
    lastMessageAt: getNewerTimestamp(ticket.lastMessageAt ?? ticket.updatedAt, lastMessageAt),
    messages,
  };
}

async function getCustomerServiceOverview() {
  const [websiteTickets, whatsappTickets, whatsappRooms, chatBlastHistories] = await Promise.all([
    getWebsiteTickets(),
    getWhatsappTickets(),
    getWhatsappRooms(),
    getChatBlastHistories().catch(() => [] as RemoteChatBlastHistory[]),
  ]);

  const whatsappRoomById = new Map(whatsappRooms.map((room) => [Number(room.id), room]));
  const whatsappBlastMessagesByRoomId = getWhatsappBlastMessagesByRoom(
    chatBlastHistories,
    whatsappRooms,
  );
  const whatsappTicketHistoryByRoomId = new Map<
    number,
    ReturnType<typeof remoteTicketToReference>[]
  >();

  whatsappTickets.forEach((ticket) => {
    if (ticket.whatsappRoomChatId == null) return;

    const roomId = Number(ticket.whatsappRoomChatId);
    const previousHistory = whatsappTicketHistoryByRoomId.get(roomId) ?? [];
    whatsappTicketHistoryByRoomId.set(roomId, [
      ...previousHistory,
      remoteTicketToReference(ticket),
    ]);
  });

  const websiteMapped = websiteTickets.map((ticket) => mapWebsiteTicket(ticket));
  const whatsappRoomMapped = whatsappRooms.map((room) => {
    const roomId = Number(room.id);

    return mergeWhatsappBlastMessagesIntoTicket(
      mapWhatsappRoom(
        room,
        [...(whatsappTicketHistoryByRoomId.get(roomId) ?? [])].sort(
          (a, b) => new Date(b.createdAt ?? "").getTime() - new Date(a.createdAt ?? "").getTime(),
        ),
      ),
      whatsappBlastMessagesByRoomId.get(roomId) ?? [],
    );
  });
  const whatsappTicketMapped = whatsappTickets.map((ticket) => {
    const roomId =
      ticket.whatsappRoomChatId != null ? Number(ticket.whatsappRoomChatId) : undefined;
    const room = roomId != null ? whatsappRoomById.get(roomId) : undefined;
    const mappedTicket = mapWhatsappTicket(
      ticket,
      room,
      roomId != null ? whatsappTicketHistoryByRoomId.get(roomId) : undefined,
    );
    const roomBlastMessages =
      roomId != null ? (whatsappBlastMessagesByRoomId.get(roomId) ?? []) : [];
    const ticketBlastMessages = getWhatsappBlastMessagesForTicket(
      chatBlastHistories,
      mappedTicket,
      room,
    );

    return mergeWhatsappBlastMessagesIntoTicket(
      mappedTicket,
      uniqueTicketMessages([...roomBlastMessages, ...ticketBlastMessages]),
    );
  });

  return applyWhatsappRoomAliases([
    ...websiteMapped,
    ...whatsappRoomMapped,
    ...whatsappTicketMapped,
  ]);
}

interface RealtimePayload {
  type?: string;
  topic?: string;
  data?: {
    afterStatus?: string | null;
    beforeStatus?: string | null;
    message?: RemoteWebsiteMessage | RemoteWhatsappMessage | null;
    reason?: string | null;
    room?: RemoteWhatsappRoom | null;
    ticket?: RemoteTicket | null;
    ticketId?: number | null;
    messages?: RemoteWhatsappMessage[] | null;
  } | null;
  sentAt?: string | null;
}

function parseRealtimePayload(value: string): RealtimePayload | null {
  try {
    const payload = JSON.parse(value) as RealtimePayload;
    return payload && typeof payload === "object" ? payload : null;
  } catch {
    return null;
  }
}

async function parseRealtimeMessageData(value: unknown) {
  if (typeof value === "string") return parseRealtimePayload(value);

  if (typeof Blob !== "undefined" && value instanceof Blob) {
    return parseRealtimePayload(await value.text());
  }

  if (value instanceof ArrayBuffer) {
    return parseRealtimePayload(new TextDecoder().decode(value));
  }

  return null;
}

function isWhatsappRealtimeEvent(eventType: string) {
  return eventType.startsWith("chat.whatsapp.") || eventType.includes("whatsapp");
}

function sortTicketMessages(messages: TicketMessage[]) {
  return [...messages].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  );
}

function shouldReplacePendingOptimisticMessage(existing: TicketMessage, next: TicketMessage) {
  return (
    existing.direction === next.direction &&
    existing.direction === "out" &&
    existing.sentStatus === "pending" &&
    existing.externalId == null &&
    existing.content.trim() !== "" &&
    existing.content.trim() === next.content.trim()
  );
}

function isSameTicketMessage(existing: TicketMessage, next: TicketMessage) {
  if (existing.id === next.id) return true;

  if (existing.externalId != null && next.externalId != null) {
    return String(existing.externalId) === String(next.externalId);
  }

  return shouldReplacePendingOptimisticMessage(existing, next);
}

function upsertTicketMessage(messages: TicketMessage[], nextMessage: TicketMessage) {
  return sortTicketMessages([
    ...messages.filter((message) => !isSameTicketMessage(message, nextMessage)),
    nextMessage,
  ]);
}

function getMessageSnippet(message: TicketMessage, fallback: string) {
  return (
    htmlToSnippetText(message.content) || (message.attachments?.length ? "Pesan media" : fallback)
  );
}

function mergeMessageIntoTicket(ticket: Ticket, message: TicketMessage) {
  const messages = upsertTicketMessage(ticket.messages, message);
  const lastMessage = messages.at(-1);

  return {
    ...ticket,
    snippet: getMessageSnippet(lastMessage ?? message, ticket.snippet),
    updatedAt: lastMessage?.createdAt ?? message.createdAt,
    lastMessageAt: lastMessage?.createdAt ?? message.createdAt,
    unread: message.direction === "in" ? true : ticket.unread,
    isDetailsLoaded: true,
    messages,
  };
}

function getRemoteTicketStatus(ticket?: RemoteTicket | null, fallbackStatus?: string | null) {
  return remoteStatusToTicketStatus(ticket?.slaStatus ?? fallbackStatus);
}

function matchesRemoteTicket(ticket: Ticket, remoteTicket: RemoteTicket) {
  const remoteTicketId = Number(remoteTicket.id);

  if (remoteTicket.channel === "website") {
    return ticket.externalIds?.websiteTicketId === remoteTicketId;
  }

  return ticket.externalIds?.whatsappTicketId === remoteTicketId;
}

function upsertRealtimeTicket(tickets: Ticket[], remoteTicket: RemoteTicket) {
  const linkedRoom =
    remoteTicket.channel === "whatsapp" && remoteTicket.whatsappRoomChatId != null
      ? tickets.find(
          (ticket) =>
            isWhatsappConversationView(ticket) &&
            ticket.externalIds?.whatsappRoomChatId === Number(remoteTicket.whatsappRoomChatId),
        )
      : undefined;
  const linkedRemoteRoom =
    remoteTicket.channel === "whatsapp" && remoteTicket.whatsappRoomChatId != null
      ? ({
          id: Number(remoteTicket.whatsappRoomChatId),
          roomName: linkedRoom?.senderName,
          chatId: linkedRoom?.senderHandle,
          createdAt: linkedRoom?.lastMessageAt ?? linkedRoom?.updatedAt,
          updatedAt: linkedRoom?.lastMessageAt ?? linkedRoom?.updatedAt,
        } satisfies RemoteWhatsappRoom)
      : undefined;
  const remoteReference =
    remoteTicket.channel === "whatsapp" ? remoteTicketToReference(remoteTicket) : undefined;
  const linkedTicketHistory = remoteReference
    ? [
        remoteReference,
        ...(linkedRoom?.ticketHistory ?? []).filter((item) => item.id !== remoteReference.id),
      ]
    : linkedRoom?.ticketHistory;
  const mappedTicket =
    remoteTicket.channel === "website"
      ? mapWebsiteTicket(remoteTicket)
      : mapWhatsappTicket(remoteTicket, linkedRemoteRoom, linkedTicketHistory);
  let found = false;

  const updatedTickets = tickets.map((ticket) => {
    if (!matchesRemoteTicket(ticket, remoteTicket)) return ticket;

    found = true;

    return {
      ...ticket,
      externalIds: {
        ...ticket.externalIds,
        ...mappedTicket.externalIds,
      },
      subject: mappedTicket.subject,
      snippet: mappedTicket.snippet || ticket.snippet,
      updatedAt: mappedTicket.updatedAt,
      lastMessageAt: mappedTicket.lastMessageAt ?? ticket.lastMessageAt,
      status: mappedTicket.status ?? ticket.status,
      isSavedAsTicket: true,
      isSynced: true,
      isPinned: mappedTicket.isPinned,
    };
  });

  const withTicket = found ? updatedTickets : [mappedTicket, ...tickets];

  if (!remoteReference || remoteTicket.whatsappRoomChatId == null) return withTicket;

  const roomChatId = Number(remoteTicket.whatsappRoomChatId);
  return withTicket.map((ticket) => {
    if (ticket.source !== "whatsapp" || ticket.externalIds?.whatsappRoomChatId !== roomChatId) {
      return ticket;
    }

    const history = ticket.ticketHistory ?? [];
    const nextHistory = [
      remoteReference,
      ...history.filter((reference) => reference.id !== remoteReference.id),
    ];

    return {
      ...ticket,
      ticketHistory: nextHistory,
    };
  });
}

function applyRealtimeTicketStatus(
  tickets: Ticket[],
  remoteTicket: RemoteTicket,
  fallbackStatus?: string | null,
) {
  const status = getRemoteTicketStatus(remoteTicket, fallbackStatus);

  return tickets.map((ticket) => {
    const isMatchingTicket = matchesRemoteTicket(ticket, remoteTicket);
    const shouldUpdateLinkedHistory =
      remoteTicket.channel === "whatsapp" &&
      remoteTicket.whatsappRoomChatId != null &&
      ticket.source === "whatsapp" &&
      ticket.externalIds?.whatsappRoomChatId === Number(remoteTicket.whatsappRoomChatId);

    if (!isMatchingTicket && !shouldUpdateLinkedHistory) return ticket;

    if (!isMatchingTicket && shouldUpdateLinkedHistory) {
      const reference = remoteTicketToReference(remoteTicket);

      return {
        ...ticket,
        ticketHistory: [
          reference,
          ...(ticket.ticketHistory ?? []).filter((item) => item.id !== reference.id),
        ],
      };
    }
    const remoteReference =
      remoteTicket.channel === "whatsapp" ? remoteTicketToReference(remoteTicket) : undefined;

    return {
      ...ticket,
      externalIds: {
        ...ticket.externalIds,
        ...(remoteTicket.channel === "website"
          ? { websiteTicketId: Number(remoteTicket.id) }
          : {
              whatsappTicketId: Number(remoteTicket.id),
              whatsappRoomChatId:
                remoteTicket.whatsappRoomChatId != null
                  ? Number(remoteTicket.whatsappRoomChatId)
                  : ticket.externalIds?.whatsappRoomChatId,
            }),
      },
      status: status ?? ticket.status,
      updatedAt: remoteTicket.updatedAt ?? ticket.updatedAt,
      isSavedAsTicket: true,
      isPinned: remoteTicket.isPinned ?? ticket.isPinned,
      ticketHistory: remoteReference
        ? [
            remoteReference,
            ...(ticket.ticketHistory ?? []).filter((item) => item.id !== remoteReference.id),
          ]
        : ticket.ticketHistory,
    };
  });
}

function applyRealtimeWebsiteMessage(
  tickets: Ticket[],
  message: RemoteWebsiteMessage,
  remoteTicket?: RemoteTicket | null,
) {
  const ticketId = Number(message.ticketId ?? remoteTicket?.id);
  if (!Number.isFinite(ticketId)) return tickets;

  const mappedMessage = mapWebsiteMessage(message);
  let found = false;

  const updatedTickets = tickets.map((ticket) => {
    if (ticket.source !== "website" || ticket.externalIds?.websiteTicketId !== ticketId) {
      return ticket;
    }

    found = true;

    return mergeMessageIntoTicket(
      {
        ...ticket,
        status: getRemoteTicketStatus(remoteTicket) ?? ticket.status,
        subject: remoteTicket?.subject || ticket.subject,
      },
      mappedMessage,
    );
  });

  if (found) return updatedTickets;
  if (!remoteTicket) return tickets;

  return [mapWebsiteTicket(remoteTicket, [message]), ...tickets];
}

function applyRealtimeWhatsappMessage(
  tickets: Ticket[],
  message: RemoteWhatsappMessage,
  room?: RemoteWhatsappRoom | null,
) {
  const roomChatId = Number(message.whatsappRoomChatId ?? room?.id);
  if (!Number.isFinite(roomChatId)) return tickets;

  let found = false;

  const updatedTickets = tickets.map((ticket) => {
    if (ticket.source !== "whatsapp" || ticket.externalIds?.whatsappRoomChatId !== roomChatId) {
      return ticket;
    }

    found = true;

    const mappedMessage = mapWhatsappMessage(message, ticket.senderName);

    if (isWhatsappTicketView(ticket)) {
      const lastMessageAt = getNewerTimestamp(
        ticket.lastMessageAt ?? ticket.updatedAt,
        mappedMessage.createdAt,
      );

      if (!ticket.isDetailsLoaded) {
        return {
          ...ticket,
          lastMessageAt,
        };
      }

      return {
        ...ticket,
        lastMessageAt,
        messages: upsertTicketMessage(ticket.messages, mappedMessage),
      };
    }

    return mergeMessageIntoTicket(
      {
        ...ticket,
        externalIds: {
          ...ticket.externalIds,
          whatsappRoomChatId: roomChatId,
          whatsappMessageChatId: Number(message.id),
        },
      },
      mappedMessage,
    );
  });

  if (found) return updatedTickets;
  if (!room) return tickets;

  const baseTicket = mapWhatsappRoom(room);
  const mappedMessage = mapWhatsappMessage(message, baseTicket.senderName);

  return [
    mergeMessageIntoTicket(
      {
        ...baseTicket,
        externalIds: {
          ...baseTicket.externalIds,
          whatsappMessageChatId: Number(message.id),
        },
        isSavedAsTicket: false,
      },
      mappedMessage,
    ),
    ...tickets,
  ];
}

export function TicketsProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient();
  const { accessToken, isAuthenticated } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>(GMAIL_MOCK_TICKETS);
  const [locallyUnmarkedTicketIds, setLocallyUnmarkedTicketIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [isRealtimeUnavailable, setIsRealtimeUnavailable] = useState(false);
  const draftsRef = useRef<Record<string, unknown>>({});
  const ticketsRef = useRef<Ticket[]>(tickets);
  const loadingDetailsRef = useRef(new Set<string>());
  const realtimeWebsocketRef = useRef<WebSocket | null>(null);
  const subscribedRealtimeTopicsRef = useRef(new Set<string>());
  const shouldUseRealtimeFallback =
    isAuthenticated && isRealtimeUnavailable && !isRealtimeConnected;

  const overviewQuery = useQuery({
    queryKey: CUSTOMER_SERVICE_QUERY_KEY,
    queryFn: getCustomerServiceOverview,
    enabled: isAuthenticated,
    refetchInterval: shouldUseRealtimeFallback ? REALTIME_FALLBACK_REFRESH_INTERVAL_MS : false,
    staleTime: 30_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    ticketsRef.current = tickets;
  }, [tickets]);

  useEffect(() => {
    if (!overviewQuery.data) return;
    setTickets((previous) => mergeRemoteTickets(overviewQuery.data, previous));
  }, [overviewQuery.data]);

  const sendRealtimeMessage = useCallback((message: object) => {
    const websocket = realtimeWebsocketRef.current;
    if (!websocket || websocket.readyState !== WebSocket.OPEN) return false;

    websocket.send(JSON.stringify(message));
    return true;
  }, []);

  const subscribeRealtimeTopics = useCallback(
    (topics: Iterable<string>) => {
      for (const topic of topics) {
        if (subscribedRealtimeTopicsRef.current.has(topic)) continue;

        const didSend = sendRealtimeMessage({ type: "subscribe", topic });
        if (didSend) {
          subscribedRealtimeTopicsRef.current.add(topic);
        }
      }
    },
    [sendRealtimeMessage],
  );

  const handleRealtimePayload = useCallback(
    (payload: RealtimePayload) => {
      const eventType = payload.type ?? "";
      const data = payload.data;

      if (eventType === "realtime.connected") {
        subscribedRealtimeTopicsRef.current = new Set();
        subscribeRealtimeTopics(getRealtimeTopics(ticketsRef.current));
        return;
      }

      if (isWhatsappRealtimeEvent(eventType)) {
        const message = data?.message as RemoteWhatsappMessage | null | undefined;
        const messages = data?.messages;

        if (message?.id) {
          setTickets((previous) => applyRealtimeWhatsappMessage(previous, message, data?.room));
          return;
        }

        if (Array.isArray(messages) && messages.length > 0) {
          setTickets((previous) =>
            messages.reduce(
              (nextTickets, nextMessage) =>
                applyRealtimeWhatsappMessage(nextTickets, nextMessage, data?.room),
              previous,
            ),
          );
          return;
        }

        return;
      }

      if (eventType === "chat.website.message.created") {
        const message = data?.message as RemoteWebsiteMessage | null | undefined;
        if (!message?.id) return;

        setTickets((previous) => applyRealtimeWebsiteMessage(previous, message, data?.ticket));
        return;
      }

      if (eventType === "ticket.created" && data?.ticket) {
        setTickets((previous) => upsertRealtimeTicket(previous, data.ticket!));
        queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
        return;
      }

      if (eventType === "ticket.status_changed" && data?.ticket) {
        setTickets((previous) =>
          applyRealtimeTicketStatus(previous, data.ticket!, data.afterStatus),
        );
        queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
      }
    },
    [queryClient, subscribeRealtimeTopics],
  );

  useEffect(() => {
    if (!isAuthenticated || !accessToken || typeof WebSocket === "undefined") return;

    const websocketUrl = getRealtimeWebsocketUrl(accessToken);
    if (!websocketUrl) return;

    let activeWebsocket: WebSocket | null = null;
    let pingInterval: number | undefined;
    let reconnectTimeout: number | undefined;
    let reconnectAttempts = 0;
    let isDisposed = false;

    setIsRealtimeConnected(false);
    setIsRealtimeUnavailable(false);

    const clearPingInterval = () => {
      if (pingInterval) {
        window.clearInterval(pingInterval);
        pingInterval = undefined;
      }
    };

    const connect = () => {
      if (isDisposed) return;

      const websocket = new WebSocket(websocketUrl);
      websocket.binaryType = "arraybuffer";
      activeWebsocket = websocket;
      realtimeWebsocketRef.current = websocket;
      subscribedRealtimeTopicsRef.current = new Set();
      clearPingInterval();

      websocket.onopen = () => {
        reconnectAttempts = 0;
        setIsRealtimeConnected(true);
        setIsRealtimeUnavailable(false);
        subscribeRealtimeTopics(getRealtimeTopics(ticketsRef.current));
        sendRealtimeMessage({ type: "ping" });
        pingInterval = window.setInterval(
          () => sendRealtimeMessage({ type: "ping" }),
          REALTIME_PING_INTERVAL_MS,
        );
      };

      websocket.onmessage = (event) => {
        parseRealtimeMessageData(event.data)
          .then((payload) => {
            if (!payload) return;
            handleRealtimePayload(payload);
          })
          .catch(() => undefined);
      };

      websocket.onerror = () => {
        setIsRealtimeConnected(false);
        websocket.close();
      };

      websocket.onclose = () => {
        clearPingInterval();
        setIsRealtimeConnected(false);

        if (activeWebsocket === websocket) {
          activeWebsocket = null;
        }

        if (realtimeWebsocketRef.current === websocket) {
          realtimeWebsocketRef.current = null;
        }

        subscribedRealtimeTopicsRef.current = new Set();

        if (!isDisposed) {
          reconnectAttempts += 1;

          if (reconnectAttempts > REALTIME_MAX_RECONNECT_ATTEMPTS) {
            setIsRealtimeUnavailable(true);
            return;
          }

          reconnectTimeout = window.setTimeout(
            connect,
            REALTIME_RECONNECT_DELAY_MS * reconnectAttempts,
          );
        }
      };
    };

    connect();

    return () => {
      isDisposed = true;
      clearPingInterval();

      if (reconnectTimeout) {
        window.clearTimeout(reconnectTimeout);
      }

      subscribedRealtimeTopicsRef.current = new Set();

      if (activeWebsocket) {
        activeWebsocket.close(1000, "Dashboard closed");
      }
    };
  }, [
    accessToken,
    handleRealtimePayload,
    isAuthenticated,
    sendRealtimeMessage,
    subscribeRealtimeTopics,
  ]);

  useEffect(() => {
    if (!isAuthenticated) return;

    subscribeRealtimeTopics(getRealtimeTopics(tickets));
  }, [isAuthenticated, subscribeRealtimeTopics, tickets]);

  const getDraft = useCallback(
    <T = unknown,>(key: string) => draftsRef.current[key] as T | undefined,
    [],
  );
  const setDraft = useCallback((key: string, val: unknown) => {
    draftsRef.current[key] = val;
  }, []);

  const refreshTickets = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
  }, [queryClient]);

  const getChatBlastHistoriesCached = useCallback(
    () =>
      queryClient.fetchQuery({
        queryKey: ["customer-service", "whatsapp-blast-histories"],
        queryFn: getChatBlastHistories,
        staleTime: 0,
      }),
    [queryClient],
  );

  const loadTicketDetails = useCallback(
    async (ticket: Ticket) => {
      if (loadingDetailsRef.current.has(ticket.id)) {
        return ticket;
      }

      loadingDetailsRef.current.add(ticket.id);

      try {
        if (ticket.source === "website" && ticket.externalIds?.websiteTicketId) {
          const detail = await getWebsiteTicketDetail(ticket.externalIds.websiteTicketId);
          const mappedTicket = mapWebsiteTicket(detail.ticket, detail.messages ?? []);
          setTickets((previous) =>
            previous.map((item) =>
              item.id === ticket.id
                ? { ...mappedTicket, isPinned: item.isPinned, unread: item.unread }
                : item,
            ),
          );
          return mappedTicket;
        }

        if (ticket.source === "whatsapp" && ticket.externalIds?.whatsappRoomChatId) {
          const [messages, chatBlastHistories] = await Promise.all([
            getWhatsappMessages(ticket.externalIds.whatsappRoomChatId),
            getChatBlastHistoriesCached().catch(() => [] as RemoteChatBlastHistory[]),
          ]);
          const ticketWithMessages = applyWhatsappMessages(ticket, messages);
          const updatedTicket = mergeWhatsappBlastMessagesIntoTicket(
            ticketWithMessages,
            getWhatsappBlastMessagesForTicket(chatBlastHistories, ticketWithMessages),
          );
          setTickets((previous) =>
            previous.map((item) =>
              item.id === ticket.id
                ? { ...updatedTicket, isPinned: item.isPinned, unread: item.unread }
                : item,
            ),
          );
          return updatedTicket;
        }

        return ticket;
      } finally {
        loadingDetailsRef.current.delete(ticket.id);
      }
    },
    [getChatBlastHistoriesCached],
  );

  const refreshWhatsappMessages = useCallback(
    async (ticketId: string, roomChatId: number) => {
      const [messages, chatBlastHistories] = await Promise.all([
        getWhatsappMessages(roomChatId),
        getChatBlastHistoriesCached().catch(() => [] as RemoteChatBlastHistory[]),
      ]);

      setTickets((previous) =>
        previous.map((item) => {
          if (item.id !== ticketId) return item;

          const ticketWithMessages = applyWhatsappMessages(item, messages);
          const updatedTicket = mergeWhatsappBlastMessagesIntoTicket(
            ticketWithMessages,
            getWhatsappBlastMessagesForTicket(chatBlastHistories, ticketWithMessages),
          );

          return {
            ...updatedTicket,
            isPinned: item.isPinned,
            unread: item.unread,
          };
        }),
      );
    },
    [getChatBlastHistoriesCached],
  );

  useEffect(() => {
    if (!shouldUseRealtimeFallback || typeof window === "undefined") return;

    const refreshLoadedWhatsappRooms = () => {
      const loadedWhatsappTickets = ticketsRef.current.filter(
        (ticket) =>
          ticket.source === "whatsapp" &&
          ticket.isDetailsLoaded &&
          ticket.externalIds?.whatsappRoomChatId != null,
      );

      loadedWhatsappTickets.forEach((ticket) => {
        refreshWhatsappMessages(ticket.id, ticket.externalIds!.whatsappRoomChatId!).catch(() =>
          queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY }),
        );
      });
    };

    refreshLoadedWhatsappRooms();
    const interval = window.setInterval(
      refreshLoadedWhatsappRooms,
      REALTIME_FALLBACK_REFRESH_INTERVAL_MS,
    );

    return () => {
      window.clearInterval(interval);
    };
  }, [queryClient, refreshWhatsappMessages, shouldUseRealtimeFallback]);

  const scheduleWhatsappMessagesRefresh = useCallback(
    (ticketId: string, roomChatId: number) => {
      const refresh = () => {
        refreshWhatsappMessages(ticketId, roomChatId).catch(() =>
          queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY }),
        );
      };

      refresh();

      if (typeof window === "undefined") return;

      window.setTimeout(refresh, 1_500);
      window.setTimeout(refresh, 5_000);
    },
    [queryClient, refreshWhatsappMessages],
  );

  const ensureTicketDetails = useCallback(
    async (id: string) => {
      const ticket = ticketsRef.current.find((item) => item.id === id);
      if (!ticket || ticket.isDetailsLoaded) return;
      await loadTicketDetails(ticket);
    },
    [loadTicketDetails],
  );

  const markAsTicket = useCallback(
    async (id: string, opts?: { subject?: string; messageExternalId?: number }) => {
      let ticket = ticketsRef.current.find((item) => item.id === id);
      if (!ticket) return;

      const subject = opts?.subject?.trim() || ticket.subject;

      if (ticket.source === "whatsapp") {
        const whatsappMessageChatId = Number(opts?.messageExternalId);
        if (!Number.isFinite(whatsappMessageChatId)) {
          throw new Error("Pilih bubble pesan WhatsApp yang ingin dijadikan ticket.");
        }

        if (!ticket.isDetailsLoaded) {
          ticket = await loadTicketDetails(ticket);
        }

        const createdTicket = await createWhatsappTicket({
          subject,
          priority: "high",
          whatsappMessageChatId,
        });
        const roomChatId =
          ticket.externalIds?.whatsappRoomChatId ??
          (createdTicket.whatsappRoomChatId != null
            ? Number(createdTicket.whatsappRoomChatId)
            : undefined);
        const reference = remoteTicketToReference({
          ...createdTicket,
          whatsappMessageChatId,
        });
        const mappedTicket = mapWhatsappTicket(
          {
            ...createdTicket,
            whatsappMessageChatId,
          },
          roomChatId != null
            ? {
                id: roomChatId,
                roomName: ticket.senderName,
                chatId: ticket.senderHandle,
                createdAt: ticket.lastMessageAt ?? ticket.updatedAt,
                updatedAt: ticket.lastMessageAt ?? ticket.updatedAt,
              }
            : undefined,
          [reference, ...(ticket.ticketHistory ?? []).filter((item) => item.id !== reference.id)],
        );

        setLocallyUnmarkedTicketIds((previous) => {
          const next = new Set(previous);
          next.delete(mappedTicket.id);
          return next;
        });
        setTickets((previous) =>
          [
            mappedTicket,
            ...previous.map((item) => {
              const shouldAttachHistory =
                item.source === "whatsapp" &&
                roomChatId != null &&
                item.externalIds?.whatsappRoomChatId === roomChatId;

              if (!shouldAttachHistory) return item;

              const history = item.ticketHistory ?? [];
              return {
                ...item,
                ticketHistory: [
                  reference,
                  ...history.filter((ticketReference) => ticketReference.id !== reference.id),
                ],
                messages: item.messages.map((message) =>
                  Number(message.externalId) === whatsappMessageChatId
                    ? {
                        ...message,
                        ticketReferences: [
                          reference,
                          ...(message.ticketReferences ?? []).filter(
                            (ticketReference) => ticketReference.id !== reference.id,
                          ),
                        ],
                      }
                    : message,
                ),
              };
            }),
          ].filter(
            (item, index, allTickets) =>
              allTickets.findIndex((candidate) => candidate.id === item.id) === index,
          ),
        );
        queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
        return;
      }

      setLocallyUnmarkedTicketIds((previous) => {
        const next = new Set(previous);
        next.delete(id);
        return next;
      });
      setTickets((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                isSavedAsTicket: true,
                subject,
              }
            : item,
        ),
      );
    },
    [loadTicketDetails, queryClient],
  );

  const unmarkAsTicket = useCallback((id: string) => {
    setLocallyUnmarkedTicketIds((previous) => {
      const next = new Set(previous);
      next.add(id);
      return next;
    });
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              isSavedAsTicket: false,
            }
          : ticket,
      ),
    );
  }, []);

  const togglePinTicket = useCallback(
    (id: string) => {
      const ticket = ticketsRef.current.find((item) => item.id === id);
      const nextPinned = !ticket?.isPinned;
      const remoteTicketId = ticket ? getRemoteTicketId(ticket) : undefined;
      const whatsappRoomChatId = ticket?.externalIds?.whatsappRoomChatId;

      setTickets((previous) =>
        previous.map((item) =>
          item.id === id
            ? {
                ...item,
                isPinned: nextPinned,
              }
            : item,
        ),
      );

      if (ticket && isWhatsappConversationView(ticket) && whatsappRoomChatId != null) {
        setWhatsappRoomPinned(whatsappRoomChatId, nextPinned)
          .then((remoteRoom) => {
            setTickets((previous) =>
              previous.map((item) =>
                isWhatsappConversationView(item) &&
                item.externalIds?.whatsappRoomChatId === remoteRoom.id
                  ? {
                      ...item,
                      isPinned: Boolean(remoteRoom.isPinned),
                    }
                  : item,
              ),
            );
            queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
          })
          .catch(() => {
            setTickets((previous) =>
              previous.map((item) =>
                item.id === id
                  ? {
                      ...item,
                      isPinned: ticket.isPinned,
                    }
                  : item,
              ),
            );
          });
        return;
      }

      if (!remoteTicketId || ticket?.viewKind === "conversation") return;

      setTicketPinned(remoteTicketId, nextPinned)
        .then((remoteTicket) => {
          setTickets((previous) =>
            applyRealtimeTicketStatus(
              upsertRealtimeTicket(previous, remoteTicket),
              remoteTicket,
              remoteTicket.slaStatus,
            ),
          );
          queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
        })
        .catch(() => {
          setTickets((previous) =>
            previous.map((item) =>
              item.id === id
                ? {
                    ...item,
                    isPinned: ticket?.isPinned,
                  }
                : item,
            ),
          );
        });
    },
    [queryClient],
  );

  const openWhatsappTicketReference = useCallback(
    (sourceTicketId: string, reference: TicketReference) => {
      const sourceTicket = ticketsRef.current.find((item) => item.id === sourceTicketId);
      const roomChatId = sourceTicket?.externalIds?.whatsappRoomChatId;

      if (!sourceTicket || sourceTicket.source !== "whatsapp" || roomChatId == null) {
        return null;
      }

      const ticketId = `whatsapp-ticket:${reference.id}`;

      setTickets((previous) => {
        const source = previous.find((item) => item.id === sourceTicketId) ?? sourceTicket;
        const existing = previous.find((item) => item.id === ticketId);
        const roomHistory = collectWhatsappRoomReferences(previous, roomChatId, [reference]);
        const activeReference = roomHistory.find((item) => item.id === reference.id) ?? reference;
        const ticketMessages =
          existing?.messages.length && existing.isDetailsLoaded
            ? existing.messages
            : source.messages;
        const nextTicket: Ticket = {
          ...source,
          ...existing,
          id: ticketId,
          externalIds: {
            ...source.externalIds,
            ...existing?.externalIds,
            whatsappRoomChatId: roomChatId,
            whatsappTicketId: reference.id,
            whatsappTicketMessageChatId: activeReference.messageExternalId,
          },
          viewKind: "ticket",
          subject: existing?.subject || activeReference.subject || `Ticket #${reference.id}`,
          snippet: existing?.snippet || activeReference.body || source.snippet,
          status: existing?.status ?? activeReference.status,
          isPinned: existing?.isPinned ?? activeReference.isPinned ?? false,
          isSavedAsTicket: true,
          isSynced: existing?.isSynced ?? source.isSynced,
          isDetailsLoaded: existing?.isDetailsLoaded ?? source.isDetailsLoaded,
          ticketHistory: mergeTicketReferences([activeReference, ...roomHistory]),
          focusedMessageExternalId: activeReference.messageExternalId,
          messages: ticketMessages,
        };
        const withReferencedTicket = previous.some((item) => item.id === ticketId)
          ? previous.map((item) => (item.id === ticketId ? nextTicket : item))
          : [nextTicket, ...previous];
        const nextRoomHistory = collectWhatsappRoomReferences(withReferencedTicket, roomChatId, [
          activeReference,
        ]);

        return withReferencedTicket.map((item) =>
          item.source === "whatsapp" && item.externalIds?.whatsappRoomChatId === roomChatId
            ? {
                ...item,
                ticketHistory: mergeTicketReferences([
                  ...(item.ticketHistory ?? []),
                  ...nextRoomHistory,
                ]),
              }
            : item,
        );
      });

      return ticketId;
    },
    [],
  );

  const createTicket = useCallback(
    (
      newTicketData: Omit<Ticket, "id" | "updatedAt" | "isSavedAsTicket" | "status"> & {
        id?: string;
        status?: TicketStatus;
        isSavedAsTicket?: boolean;
      },
    ) => {
      const newId =
        newTicketData.id ??
        `t-${newTicketData.source}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
      const createdAt = new Date().toISOString();
      const newTicket: Ticket = {
        status: newTicketData.status,
        ...newTicketData,
        id: newId,
        updatedAt: createdAt,
        lastMessageAt: newTicketData.lastMessageAt ?? createdAt,
        isSavedAsTicket: newTicketData.isSavedAsTicket ?? false,
      };
      setTickets((previous) =>
        previous.some((ticket) => ticket.id === newId)
          ? previous.map((ticket) =>
              ticket.id === newId
                ? {
                    ...ticket,
                    ...newTicket,
                    isPinned: ticket.isPinned,
                    unread: ticket.unread,
                  }
                : ticket,
            )
          : [newTicket, ...previous],
      );
      return newTicket;
    },
    [],
  );

  const revertTicketStatus = useCallback((id: string, previousStatus?: TicketStatus) => {
    setTickets((previous) =>
      previous.map((item) =>
        item.id === id
          ? {
              ...item,
              status: previousStatus,
            }
          : item,
      ),
    );
  }, []);

  const persistTicketStatus = useCallback(
    async (ticket: Ticket, status: TicketStatus) => {
      const remoteStatus = ticketStatusToRemoteStatus(status);
      let remoteTicket: RemoteTicket | null = null;

      if (ticket.externalIds?.websiteTicketId) {
        remoteTicket = await updateWebsiteTicketStatus(
          ticket.externalIds.websiteTicketId,
          remoteStatus,
        );
      } else if (ticket.externalIds?.whatsappTicketId) {
        remoteTicket = await updateWhatsappTicketStatus(
          ticket.externalIds.whatsappTicketId,
          remoteStatus,
        );
      } else if (ticket.source === "whatsapp") {
        throw new Error("Status WhatsApp hanya bisa diubah dari item ticket, bukan room chat.");
      }

      if (!remoteTicket) {
        throw new Error("Ticket ini belum memiliki ID remote untuk update status.");
      }

      setTickets((previous) =>
        applyRealtimeTicketStatus(upsertRealtimeTicket(previous, remoteTicket), remoteTicket),
      );
      queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
    },
    [queryClient],
  );

  const updateTicketStatus = useCallback(
    (id: string, status?: TicketStatus) => {
      const ticket = ticketsRef.current.find((item) => item.id === id);
      const previousStatus = ticket?.status;

      setTickets((previous) =>
        previous.map((item) => {
          if (item.id !== id) return item;

          const oldStatus = item.status;
          const newStatus = status;

          if (oldStatus === newStatus) return item;

          let content = "";
          const capitalize = (value: string) => value.charAt(0).toUpperCase() + value.slice(1);

          if (!oldStatus && newStatus) {
            content = `Status ditambahkan menjadi ${capitalize(newStatus)}`;
          } else if (oldStatus && !newStatus) {
            content = "Status dihapus";
          } else if (oldStatus && newStatus) {
            content = `Status diubah dari ${capitalize(oldStatus)} menjadi ${capitalize(newStatus)}`;
          }

          const systemMsg: TicketMessage = {
            id: `m-system-${Date.now()}`,
            authorId: "system",
            authorName: "System",
            content,
            createdAt: new Date().toISOString(),
            direction: "in",
          };

          return {
            ...item,
            status,
            updatedAt: new Date().toISOString(),
            snippet: content,
            messages: content ? [...item.messages, systemMsg] : item.messages,
          };
        }),
      );

      if (!ticket || !status) return;

      persistTicketStatus(ticket, status).catch(() => {
        revertTicketStatus(id, previousStatus);
        queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
      });
    },
    [persistTicketStatus, queryClient, revertTicketStatus],
  );

  const addMessage = useCallback(
    (ticketId: string, messageData: Omit<TicketMessage, "id" | "createdAt">) => {
      const ticket = ticketsRef.current.find((item) => item.id === ticketId);
      const optimisticMessage: TicketMessage = {
        ...messageData,
        id: `m-${Date.now()}`,
        createdAt: new Date().toISOString(),
        sentStatus: ticket?.source === "whatsapp" ? "pending" : messageData.sentStatus,
        pendingAt: ticket?.source === "whatsapp" ? new Date().toISOString() : messageData.pendingAt,
      };

      setTickets((previous) =>
        previous.map((item) =>
          item.id === ticketId
            ? {
                ...item,
                snippet: getMessageSnippet(optimisticMessage, item.snippet),
                updatedAt: optimisticMessage.createdAt,
                lastMessageAt: optimisticMessage.createdAt,
                messages: [...item.messages, optimisticMessage],
              }
            : item,
        ),
      );

      if (ticket?.source === "whatsapp" && !ticket.externalIds?.whatsappRoomChatId) {
        const target = normalizeWhatsappDigits(ticket.senderHandle || ticket.senderName);
        const body = messageData.content.trim();
        const markOptimisticMessageFailed = (reason: string) => {
          setTickets((previous) =>
            previous.map((item) =>
              item.id === ticketId
                ? {
                    ...item,
                    messages: item.messages.map((message) =>
                      message.id === optimisticMessage.id
                        ? {
                            ...message,
                            sentStatus: "failed",
                            errorMessage: reason,
                            pendingAt: undefined,
                          }
                        : message,
                    ),
                  }
                : item,
            ),
          );
          toast.error("Pesan WhatsApp gagal dikirim", {
            description: reason,
          });
        };

        if (!target) {
          markOptimisticMessageFailed("Nomor WhatsApp belum valid.");
          return;
        }

        if (!body) {
          markOptimisticMessageFailed(
            "Pesan pertama untuk chat baru harus berisi teks agar room bisa dibuat.",
          );
          return;
        }

        const syncWhatsappRoomMessage = ({
          roomChatId,
          remoteMessage,
          duplicateTicket,
          responseMessage,
          toastTitle,
        }: {
          roomChatId: number;
          remoteMessage: RemoteWhatsappMessage;
          duplicateTicket?: Ticket;
          responseMessage?: string;
          toastTitle: string;
        }) => {
          const mappedMessage = mapWhatsappMessage(remoteMessage, ticket.senderName);
          const messageExternalId = Number(remoteMessage.id);
          const senderHandle = formatWhatsappHandle(target);

          rememberWhatsappRoomAlias({
            roomChatId,
            phone: target,
            senderName: ticket.senderName || senderHandle,
            senderHandle,
            senderAvatar: ticket.senderAvatar,
            subject: ticket.subject,
            snippet: getMessageSnippet(mappedMessage, ticket.snippet),
            updatedAt: mappedMessage.createdAt,
            lastMessage: mappedMessage,
          });

          setTickets((previous) => {
            const duplicateFromState = duplicateTicket
              ? previous.find((item) => item.id === duplicateTicket.id)
              : undefined;

            return previous
              .filter((item) => item.id !== duplicateTicket?.id)
              .map((item) => {
                if (item.id !== ticketId) return item;

                const localMessages = item.messages.map((message) =>
                  message.id === optimisticMessage.id ? mappedMessage : message,
                );
                const messages = localMessages.reduce(
                  (mergedMessages, message) => upsertTicketMessage(mergedMessages, message),
                  duplicateFromState?.messages ?? [],
                );
                const lastMessage = messages.at(-1) ?? mappedMessage;

                return {
                  ...item,
                  externalIds: {
                    ...duplicateFromState?.externalIds,
                    ...item.externalIds,
                    whatsappRoomChatId: roomChatId,
                    whatsappMessageChatId: Number.isFinite(messageExternalId)
                      ? messageExternalId
                      : item.externalIds?.whatsappMessageChatId,
                  },
                  senderName: duplicateFromState?.senderName ?? item.senderName,
                  senderHandle: duplicateFromState?.senderHandle ?? senderHandle,
                  senderAvatar: duplicateFromState?.senderAvatar ?? item.senderAvatar,
                  subject: duplicateFromState?.subject ?? item.subject,
                  snippet: getMessageSnippet(lastMessage, item.snippet),
                  updatedAt: getNewerTimestamp(item.updatedAt, lastMessage.createdAt),
                  lastMessageAt: getNewerTimestamp(
                    item.lastMessageAt ?? item.updatedAt,
                    lastMessage.createdAt,
                  ),
                  isSynced: true,
                  isDetailsLoaded: true,
                  messages,
                };
              });
          });

          queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
          scheduleWhatsappMessagesRefresh(ticketId, roomChatId);
          toast.success(toastTitle, {
            description: responseMessage,
          });
        };

        const existingWhatsappTicket = ticketsRef.current.find((item) => {
          if (item.id === ticketId || item.source !== "whatsapp") return false;
          if (!item.externalIds?.whatsappRoomChatId) return false;

          return [item.senderHandle, item.senderName, item.subject].some((value) =>
            whatsappPhonesMatch(value, target),
          );
        });

        if (existingWhatsappTicket?.externalIds?.whatsappRoomChatId) {
          const roomChatId = existingWhatsappTicket.externalIds.whatsappRoomChatId;
          replyWhatsappRoom(roomChatId, { body })
            .then((remoteMessage) => {
              syncWhatsappRoomMessage({
                roomChatId,
                remoteMessage,
                duplicateTicket: existingWhatsappTicket,
                toastTitle: "Pesan WhatsApp dikirim ke room yang sudah ada",
              });
            })
            .catch((error) => {
              markOptimisticMessageFailed(getWhatsappBlastFailureMessage(error));
              queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
            });
          return;
        }

        createWhatsappRoom({
          number: target,
          body,
        })
          .then(async (createResult: WhatsappRoomCreateResult) => {
            const roomChatId =
              createResult.room?.id != null ? Number(createResult.room.id) : undefined;

            if (!roomChatId) {
              throw new Error("Endpoint create room WhatsApp belum mengembalikan room chat.");
            }

            const remoteMessage =
              createResult.message ?? (await replyWhatsappRoom(roomChatId, { body }));
            syncWhatsappRoomMessage({
              roomChatId,
              remoteMessage,
              responseMessage: createResult.responseMessage,
              toastTitle: "Room chat WhatsApp berhasil dibuat",
            });
          })
          .catch(async (error) => {
            try {
              const rooms = await getWhatsappRooms();
              const matchedRoom = findWhatsappRoomByTarget(rooms, target);
              const fallbackRoomChatId =
                matchedRoom?.id != null ? Number(matchedRoom.id) : undefined;

              if (fallbackRoomChatId) {
                const remoteMessage = await replyWhatsappRoom(fallbackRoomChatId, { body });
                const duplicateTicket = ticketsRef.current.find(
                  (item) =>
                    item.id !== ticketId &&
                    item.source === "whatsapp" &&
                    item.externalIds?.whatsappRoomChatId === fallbackRoomChatId,
                );

                syncWhatsappRoomMessage({
                  roomChatId: fallbackRoomChatId,
                  remoteMessage,
                  duplicateTicket,
                  responseMessage: "Room sudah ada, pesan dikirim lewat endpoint reply.",
                  toastTitle: "Pesan WhatsApp dikirim",
                });
                return;
              }
            } catch {
              // Keep the original create-room error for the UI bubble.
            }

            markOptimisticMessageFailed(getWhatsappBlastFailureMessage(error));
            queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
          });
        return;
      }

      if (!ticket?.isSynced) return;

      if (ticket.source === "website" && ticket.externalIds?.websiteTicketId) {
        replyWebsiteTicket(ticket.externalIds.websiteTicketId, {
          body: messageData.content,
          attachments: toExternalAttachmentUrls(messageData),
        })
          .then((remoteMessage) => {
            const mappedMessage = mapWebsiteMessage(remoteMessage);
            setTickets((previous) =>
              previous.map((item) => {
                if (item.id !== ticketId) return item;

                const messages = sortTicketMessages(
                  item.messages.map((message) =>
                    message.id === optimisticMessage.id ? mappedMessage : message,
                  ),
                );
                const lastMessage = messages.at(-1) ?? mappedMessage;

                return {
                  ...item,
                  snippet: getMessageSnippet(lastMessage, item.snippet),
                  updatedAt: getNewerTimestamp(item.updatedAt, lastMessage.createdAt),
                  lastMessageAt: getNewerTimestamp(
                    item.lastMessageAt ?? item.updatedAt,
                    lastMessage.createdAt,
                  ),
                  messages,
                };
              }),
            );
          })
          .catch(() => queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY }));
      }

      if (ticket.source === "whatsapp" && ticket.externalIds?.whatsappRoomChatId) {
        const attachment = toExternalAttachmentUrls(messageData)[0];
        const quotedWhatsappMessageId = Number(messageData.quotedExternalId);
        replyWhatsappRoom(ticket.externalIds.whatsappRoomChatId, {
          body: messageData.content,
          attachment,
          quotedWhatsappMessageId: Number.isFinite(quotedWhatsappMessageId)
            ? quotedWhatsappMessageId
            : undefined,
        })
          .then((remoteMessage) => {
            const mappedMessage = mapWhatsappMessage(remoteMessage, ticket.senderName);
            setTickets((previous) =>
              previous.map((item) =>
                item.id === ticketId
                  ? {
                      ...item,
                      externalIds: {
                        ...item.externalIds,
                        whatsappMessageChatId: Number(remoteMessage.id),
                      },
                      lastMessageAt: getNewerTimestamp(
                        item.lastMessageAt ?? item.updatedAt,
                        mappedMessage.createdAt,
                      ),
                      messages: item.messages.map((message) =>
                        message.id === optimisticMessage.id ? mappedMessage : message,
                      ),
                    }
                  : item,
              ),
            );
            const roomChatId = ticket.externalIds?.whatsappRoomChatId;
            if (roomChatId != null) {
              scheduleWhatsappMessagesRefresh(ticketId, roomChatId);
            }
          })
          .catch(() => queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY }));
      }
    },
    [queryClient, scheduleWhatsappMessagesRefresh],
  );

  const markAsRead = useCallback((id: string) => {
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === id && ticket.unread ? { ...ticket, unread: false } : ticket,
      ),
    );
  }, []);

  const value = useMemo<TicketsContextValue>(
    () => ({
      tickets,
      isLoading: overviewQuery.isLoading,
      error: overviewQuery.error instanceof Error ? overviewQuery.error.message : null,
      refreshTickets,
      ensureTicketDetails,
      getBySource: (source) =>
        tickets.filter(
          (ticket) =>
            ticket.source === source &&
            (source !== "whatsapp" || isWhatsappConversationView(ticket)),
        ),
      getSaved: () =>
        tickets.filter(
          (ticket) =>
            ticket.isSavedAsTicket &&
            ticket.source !== "gmail" &&
            (ticket.source !== "whatsapp" || isWhatsappTicketView(ticket)) &&
            !locallyUnmarkedTicketIds.has(ticket.id),
        ),
      getById: (id) => tickets.find((ticket) => ticket.id === id),
      openWhatsappTicketReference,
      markAsTicket,
      unmarkAsTicket,
      togglePinTicket,
      createTicket,
      updateTicketStatus,
      addMessage,
      markAsRead,
      getDraft,
      setDraft,
    }),
    [
      addMessage,
      createTicket,
      ensureTicketDetails,
      getDraft,
      locallyUnmarkedTicketIds,
      markAsRead,
      markAsTicket,
      openWhatsappTicketReference,
      overviewQuery.error,
      overviewQuery.isLoading,
      refreshTickets,
      setDraft,
      tickets,
      togglePinTicket,
      unmarkAsTicket,
      updateTicketStatus,
    ],
  );

  return <TicketsContext.Provider value={value}>{children}</TicketsContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useTickets() {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error("useTickets must be used inside TicketsProvider");
  return ctx;
}
