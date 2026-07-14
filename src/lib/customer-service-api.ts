import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { ACCESS_TOKEN_HEADER, ACCESS_TOKEN_KEY, getAccessToken } from "@/lib/auth";

export const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined)?.trim() ||
  "https://api-staging.postmatic.id";

export interface ApiResponse<T> {
  data: T;
  responseMessage?: string;
  metaData?: {
    code?: number;
    message?: string;
  };
  validationErrors?: unknown;
  pagination?: unknown;
  filterQuery?: unknown;
}

export interface RemoteTicket {
  id: number;
  appTicketCategoryId?: number | null;
  profileId?: string | null;
  channel: "website" | "whatsapp";
  priority?: string | null;
  slaStatus?: "open" | "pending" | "in_progress" | "resolved" | string | null;
  whatsappRoomChatId?: number | null;
  subject?: string | null;
  body?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  email?: string | null;
  attachments?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteProfile {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  role?: string | null;
}

export interface RemoteWebsiteMessage {
  id: number;
  ticketId?: number | null;
  profileId?: string | null;
  profile?: RemoteProfile | null;
  senderType?: "customer" | "customer_service" | string | null;
  body?: string | null;
  attachments?: string[] | null;
  quotedWebMessageId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteWebsiteTicketDetail {
  ticket: RemoteTicket;
  messages?: RemoteWebsiteMessage[] | null;
}

export interface RemoteWhatsappRoom {
  id: number;
  chatId?: string | null;
  roomName?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteWhatsappMessage {
  id: number;
  whatsappRoomChatId?: number | null;
  ticketId?: number | null;
  profileId?: string | null;
  profile?: RemoteProfile | null;
  messageId?: string | null;
  quotedWhatsappMessageId?: number | null;
  quotedWhatsappMessage?: RemoteWhatsappMessage | null;
  senderType?: "customer" | "agent" | string | null;
  body?: string | null;
  sentStatus?: string | null;
  mediaUrl?: string | null;
  mediaMimeType?: string | null;
  mediaFilename?: string | null;
  pendingAt?: string | null;
  sentAt?: string | null;
  deliveredAt?: string | null;
  readAt?: string | null;
  timestamp?: string | null;
  timestampDate?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateWhatsappTicketPayload {
  subject: string;
  priority: "low" | "medium" | "high";
  whatsappMessageChatId: number;
}

export interface ReplyWhatsappPayload {
  body: string;
  quotedWhatsappMessageId?: number;
  attachment?: string;
}

export interface ReplyWebsitePayload {
  body: string;
  quotedWebMessageId?: number;
  attachments?: string[];
}

export type RemoteTicketStatus = "open" | "pending" | "in_progress" | "resolved";

function buildUrl(path: string) {
  return new URL(path, API_ORIGIN).toString();
}

function getCookieValue(cookieHeader: string | undefined, name: string) {
  if (!cookieHeader) return null;

  const cookie = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));

  if (!cookie) return null;

  return decodeURIComponent(cookie.slice(name.length + 1));
}

function authHeaders(hasBody: boolean) {
  const headers = new Headers();
  const cookieToken = getCookieValue(getRequestHeader("cookie"), ACCESS_TOKEN_KEY);
  const token = cookieToken ?? getAccessToken();

  if (hasBody) headers.set("Content-Type", "application/json");
  if (token) headers.set(ACCESS_TOKEN_HEADER, token);

  return headers;
}

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const hasBody = init.body != null;
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: authHeaders(hasBody),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.metaData?.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

const getWebsiteTicketsServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteTicket[]>("/api/ticket/website");
  return response.data ?? [];
});

const getWebsiteTicketDetailServer = createServerFn({ method: "GET" })
  .validator((data: { ticketId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteWebsiteTicketDetail>(
      `/api/ticket/website/${data.ticketId}`,
    );
    return response.data;
  });

const replyWebsiteTicketServer = createServerFn({ method: "POST" })
  .validator((data: { ticketId: number; payload: ReplyWebsitePayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteWebsiteMessage>(
      `/api/ticket/website/${data.ticketId}/reply`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );
    return response.data;
  });

const updateWebsiteTicketStatusServer = createServerFn({ method: "POST" })
  .validator((data: { ticketId: number; status: RemoteTicketStatus }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteTicket>(`/api/ticket/website/${data.ticketId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: data.status }),
    });
    return response.data;
  });

const getWhatsappTicketsServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteTicket[]>("/api/ticket/whatsapp");
  return response.data ?? [];
});

const updateWhatsappTicketStatusServer = createServerFn({ method: "POST" })
  .validator((data: { ticketId: number; status: RemoteTicketStatus }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteTicket>(
      `/api/ticket/whatsapp/${data.ticketId}/status`,
      {
        method: "PUT",
        body: JSON.stringify({ status: data.status }),
      },
    );
    return response.data;
  });

const getWhatsappRoomsServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteWhatsappRoom[]>("/api/chat/whatsapp");
  return response.data ?? [];
});

const getWhatsappMessagesServer = createServerFn({ method: "GET" })
  .validator((data: { roomChatId: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    const params = new URLSearchParams({ limit: String(data.limit ?? 50) });
    const response = await apiRequest<RemoteWhatsappMessage[]>(
      `/api/chat/whatsapp/${data.roomChatId}?${params.toString()}`,
    );
    return response.data ?? [];
  });

const replyWhatsappRoomServer = createServerFn({ method: "POST" })
  .validator((data: { roomChatId: number; payload: ReplyWhatsappPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteWhatsappMessage>(
      `/api/chat/whatsapp/${data.roomChatId}/reply`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );
    return response.data;
  });

const createWhatsappTicketServer = createServerFn({ method: "POST" })
  .validator((data: CreateWhatsappTicketPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteTicket>("/api/chat/whatsapp/ticket", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  });

export function getWebsiteTickets() {
  return getWebsiteTicketsServer();
}

export function getWebsiteTicketDetail(ticketId: number) {
  return getWebsiteTicketDetailServer({ data: { ticketId } });
}

export function replyWebsiteTicket(ticketId: number, payload: ReplyWebsitePayload) {
  return replyWebsiteTicketServer({ data: { ticketId, payload } });
}

export function updateWebsiteTicketStatus(ticketId: number, status: RemoteTicketStatus) {
  return updateWebsiteTicketStatusServer({ data: { ticketId, status } });
}

export function getWhatsappTickets() {
  return getWhatsappTicketsServer();
}

export function updateWhatsappTicketStatus(ticketId: number, status: RemoteTicketStatus) {
  return updateWhatsappTicketStatusServer({ data: { ticketId, status } });
}

export function getWhatsappRooms() {
  return getWhatsappRoomsServer();
}

export function getWhatsappMessages(roomChatId: number, limit = 50) {
  return getWhatsappMessagesServer({ data: { roomChatId, limit } });
}

export function replyWhatsappRoom(roomChatId: number, payload: ReplyWhatsappPayload) {
  return replyWhatsappRoomServer({ data: { roomChatId, payload } });
}

export function createWhatsappTicket(payload: CreateWhatsappTicketPayload) {
  return createWhatsappTicketServer({ data: payload });
}

export function getRealtimeWebsocketUrl(accessToken?: string | null) {
  const token = accessToken ?? getAccessToken();
  if (!token) return null;

  const url = new URL("/api/realtime/ws", API_ORIGIN);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("postmaticAccessToken", token);

  return url.toString();
}
