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

import {
  createWhatsappTicket,
  getRealtimeWebsocketUrl,
  getWebsiteTicketDetail,
  getWebsiteTickets,
  getWhatsappMessages,
  getWhatsappRooms,
  getWhatsappTickets,
  replyWebsiteTicket,
  replyWhatsappRoom,
  updateWebsiteTicketStatus,
  updateWhatsappTicketStatus,
  type RemoteTicket,
  type RemoteWebsiteMessage,
  type RemoteWhatsappMessage,
  type RemoteWhatsappRoom,
} from "@/lib/customer-service-api";
import {
  applyWhatsappMessages,
  mapWebsiteMessage,
  mapWebsiteTicket,
  mapWhatsappMessage,
  mapWhatsappRoom,
  mapWhatsappTicketWithoutRoom,
  remoteStatusToTicketStatus,
  ticketStatusToRemoteStatus,
} from "@/lib/customer-service-mappers";
import { MOCK_TICKETS } from "@/lib/mock/tickets";
import type { Ticket, TicketMessage, TicketSource, TicketStatus } from "@/lib/types/ticket";
import { useAuth } from "@/hooks/useAuth";

const CUSTOMER_SERVICE_QUERY_KEY = ["customer-service", "overview"] as const;
const GMAIL_MOCK_TICKETS = MOCK_TICKETS.filter((ticket) => ticket.source === "gmail");
const REALTIME_TOPICS = ["chat.whatsapp.admin", "chat.website.admin", "ticket.admin"] as const;
const REALTIME_PING_INTERVAL_MS = 15_000;
const REALTIME_RECONNECT_DELAY_MS = 2_000;
const REALTIME_MAX_RECONNECT_ATTEMPTS = 3;
const REALTIME_FALLBACK_REFRESH_INTERVAL_MS = 5_000;

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
  markAsTicket: (id: string, opts?: { subject?: string }) => Promise<void>;
  unmarkAsTicket: (id: string) => void;
  togglePinTicket: (id: string) => void;
  createTicket: (
    ticket: Omit<Ticket, "id" | "updatedAt" | "isSavedAsTicket" | "status"> & {
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

function mergeRemoteTickets(remoteTickets: Ticket[], previousTickets: Ticket[]) {
  const localOnlyTickets = previousTickets.filter(
    (ticket) => !ticket.isSynced || ticket.source === "gmail",
  );

  const mergedRemote = remoteTickets.map((remoteTicket) => {
    const localTicket = previousTickets.find((ticket) => ticket.id === remoteTicket.id);
    if (!localTicket) return remoteTicket;

    const keepLocalDetails =
      localTicket.isDetailsLoaded && localTicket.messages.length > remoteTicket.messages.length;
    const localLastMessage = keepLocalDetails ? localTicket.messages.at(-1) : undefined;

    return {
      ...remoteTicket,
      isPinned: localTicket.isPinned,
      unread: localTicket.unread,
      isDetailsLoaded: keepLocalDetails || remoteTicket.isDetailsLoaded,
      snippet: localLastMessage
        ? getMessageSnippet(localLastMessage, localTicket.snippet)
        : remoteTicket.snippet,
      updatedAt: keepLocalDetails
        ? getNewerTimestamp(remoteTicket.updatedAt, localTicket.updatedAt)
        : remoteTicket.updatedAt,
      messages: keepLocalDetails ? localTicket.messages : remoteTicket.messages,
      externalIds: {
        ...remoteTicket.externalIds,
        ...localTicket.externalIds,
      },
    };
  });

  const localOnlyWithoutRemoteDuplicates = localOnlyTickets.filter(
    (localTicket) => !mergedRemote.some((remoteTicket) => remoteTicket.id === localTicket.id),
  );

  return [...mergedRemote, ...localOnlyWithoutRemoteDuplicates];
}

function getTicketMessageExternalId(message: TicketMessage) {
  return typeof message.externalId === "number" ? message.externalId : Number(message.externalId);
}

function getReferableWhatsappMessageId(ticket: Ticket) {
  if (ticket.externalIds?.whatsappMessageChatId) {
    return ticket.externalIds.whatsappMessageChatId;
  }

  const message = [...ticket.messages]
    .reverse()
    .find(
      (item) => item.authorId !== "system" && Number.isFinite(getTicketMessageExternalId(item)),
    );

  return message ? getTicketMessageExternalId(message) : undefined;
}

function toExternalAttachmentUrls(message: Omit<TicketMessage, "id" | "createdAt">) {
  return (message.attachments ?? [])
    .map((attachment) => attachment.url)
    .filter((url) => url && !url.startsWith("data:"));
}

async function getCustomerServiceOverview() {
  const [websiteTickets, whatsappTickets, whatsappRooms] = await Promise.all([
    getWebsiteTickets(),
    getWhatsappTickets(),
    getWhatsappRooms(),
  ]);

  const whatsappTicketByRoomId = new Map(
    whatsappTickets
      .filter((ticket) => ticket.whatsappRoomChatId != null)
      .map((ticket) => [Number(ticket.whatsappRoomChatId), ticket]),
  );
  const roomIds = new Set(whatsappRooms.map((room) => Number(room.id)));

  const websiteMapped = websiteTickets.map((ticket) => mapWebsiteTicket(ticket));
  const whatsappRoomMapped = whatsappRooms.map((room) =>
    mapWhatsappRoom(room, whatsappTicketByRoomId.get(Number(room.id))),
  );
  const orphanWhatsappTickets = whatsappTickets
    .filter(
      (ticket) =>
        ticket.whatsappRoomChatId == null || !roomIds.has(Number(ticket.whatsappRoomChatId)),
    )
    .map((ticket) => mapWhatsappTicketWithoutRoom(ticket));

  return [...websiteMapped, ...whatsappRoomMapped, ...orphanWhatsappTickets];
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
  const remoteRoomId =
    remoteTicket.whatsappRoomChatId != null ? Number(remoteTicket.whatsappRoomChatId) : undefined;

  if (remoteTicket.channel === "website") {
    return ticket.externalIds?.websiteTicketId === remoteTicketId;
  }

  return (
    ticket.externalIds?.whatsappTicketId === remoteTicketId ||
    (remoteRoomId != null && ticket.externalIds?.whatsappRoomChatId === remoteRoomId)
  );
}

function upsertRealtimeTicket(tickets: Ticket[], remoteTicket: RemoteTicket) {
  const mappedTicket =
    remoteTicket.channel === "website"
      ? mapWebsiteTicket(remoteTicket)
      : mapWhatsappTicketWithoutRoom(remoteTicket);
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
      status: mappedTicket.status ?? ticket.status,
      isSavedAsTicket: true,
      isSynced: true,
    };
  });

  return found ? updatedTickets : [mappedTicket, ...tickets];
}

function applyRealtimeTicketStatus(
  tickets: Ticket[],
  remoteTicket: RemoteTicket,
  fallbackStatus?: string | null,
) {
  const status = getRemoteTicketStatus(remoteTicket, fallbackStatus);

  return tickets.map((ticket) => {
    if (!matchesRemoteTicket(ticket, remoteTicket)) return ticket;

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

    return mergeMessageIntoTicket(
      {
        ...ticket,
        externalIds: {
          ...ticket.externalIds,
          whatsappRoomChatId: roomChatId,
          whatsappTicketId:
            message.ticketId != null
              ? Number(message.ticketId)
              : ticket.externalIds?.whatsappTicketId,
          whatsappMessageChatId: Number(message.id),
        },
        isSavedAsTicket: message.ticketId != null ? true : ticket.isSavedAsTicket,
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
          whatsappTicketId: message.ticketId != null ? Number(message.ticketId) : undefined,
          whatsappMessageChatId: Number(message.id),
        },
        isSavedAsTicket: message.ticketId != null,
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

  const loadTicketDetails = useCallback(async (ticket: Ticket) => {
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
        const messages = await getWhatsappMessages(ticket.externalIds.whatsappRoomChatId);
        const updatedTicket = applyWhatsappMessages(ticket, messages);
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
  }, []);

  const refreshWhatsappMessages = useCallback(async (ticketId: string, roomChatId: number) => {
    const messages = await getWhatsappMessages(roomChatId);

    setTickets((previous) =>
      previous.map((item) =>
        item.id === ticketId
          ? {
              ...applyWhatsappMessages(item, messages),
              isPinned: item.isPinned,
              unread: item.unread,
            }
          : item,
      ),
    );
  }, []);

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
    async (id: string, opts?: { subject?: string }) => {
      let ticket = ticketsRef.current.find((item) => item.id === id);
      if (!ticket) return;

      const subject = opts?.subject?.trim() || ticket.subject;

      if (ticket.source === "whatsapp" && !ticket.externalIds?.whatsappTicketId) {
        if (!ticket.isDetailsLoaded) {
          ticket = await loadTicketDetails(ticket);
        }

        const whatsappMessageChatId = getReferableWhatsappMessageId(ticket);
        if (!whatsappMessageChatId) {
          throw new Error("Room WhatsApp belum memiliki pesan yang bisa dijadikan tiket.");
        }

        const createdTicket = await createWhatsappTicket({
          subject,
          priority: "high",
          whatsappMessageChatId,
        });

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
                  snippet: createdTicket.body || item.snippet,
                  status: remoteStatusToTicketStatus(createdTicket.slaStatus) ?? item.status,
                  externalIds: {
                    ...item.externalIds,
                    whatsappTicketId: Number(createdTicket.id),
                    whatsappRoomChatId:
                      createdTicket.whatsappRoomChatId != null
                        ? Number(createdTicket.whatsappRoomChatId)
                        : item.externalIds?.whatsappRoomChatId,
                  },
                }
              : item,
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

  const togglePinTicket = useCallback((id: string) => {
    setTickets((previous) =>
      previous.map((ticket) =>
        ticket.id === id
          ? {
              ...ticket,
              isPinned: !ticket.isPinned,
            }
          : ticket,
      ),
    );
  }, []);

  const createTicket = useCallback(
    (
      newTicketData: Omit<Ticket, "id" | "updatedAt" | "isSavedAsTicket" | "status"> & {
        status?: TicketStatus;
        isSavedAsTicket?: boolean;
      },
    ) => {
      const newId = `t-${newTicketData.source}-${Date.now()}-${Math.random()
        .toString(36)
        .substring(2, 6)}`;
      const newTicket: Ticket = {
        status: newTicketData.status,
        ...newTicketData,
        id: newId,
        updatedAt: new Date().toISOString(),
        isSavedAsTicket: newTicketData.isSavedAsTicket ?? false,
      };
      setTickets((previous) => [newTicket, ...previous]);
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
        const preparedTicket = ticket.isDetailsLoaded ? ticket : await loadTicketDetails(ticket);
        const whatsappMessageChatId = getReferableWhatsappMessageId(preparedTicket);

        if (!whatsappMessageChatId) {
          throw new Error("Room WhatsApp belum memiliki pesan yang bisa dijadikan tiket.");
        }

        const createdTicket = await createWhatsappTicket({
          subject: preparedTicket.subject,
          priority: "high",
          whatsappMessageChatId,
        });

        setLocallyUnmarkedTicketIds((previous) => {
          const next = new Set(previous);
          next.delete(ticket.id);
          return next;
        });

        remoteTicket = await updateWhatsappTicketStatus(Number(createdTicket.id), remoteStatus);
      }

      if (!remoteTicket) {
        throw new Error("Ticket ini belum memiliki ID remote untuk update status.");
      }

      setTickets((previous) =>
        applyRealtimeTicketStatus(upsertRealtimeTicket(previous, remoteTicket), remoteTicket),
      );
      queryClient.invalidateQueries({ queryKey: CUSTOMER_SERVICE_QUERY_KEY });
    },
    [loadTicketDetails, queryClient],
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
                messages: [...item.messages, optimisticMessage],
              }
            : item,
        ),
      );

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
                      messages: item.messages.map((message) =>
                        message.id === optimisticMessage.id ? mappedMessage : message,
                      ),
                    }
                  : item,
              ),
            );
            scheduleWhatsappMessagesRefresh(ticketId, ticket.externalIds.whatsappRoomChatId!);
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
      getBySource: (source) => tickets.filter((ticket) => ticket.source === source),
      getSaved: () =>
        tickets.filter(
          (ticket) =>
            ticket.isSavedAsTicket &&
            ticket.source !== "gmail" &&
            !locallyUnmarkedTicketIds.has(ticket.id),
        ),
      getById: (id) => tickets.find((ticket) => ticket.id === id),
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
