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
  isPinned?: boolean | null;
  unreadMessages?: number | null;
  whatsappRoomChatId?: number | null;
  whatsappMessageChatId?: number | null;
  subject?: string | null;
  body?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  email?: string | null;
  attachments?: string[] | null;
  lastMessageAt?: string | null;
  latestMessageAt?: string | null;
  lastMessage?: RemoteWebsiteMessage | RemoteWhatsappMessage | null;
  messages?: RemoteWebsiteMessage[] | null;
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
  isPinned?: boolean | null;
  unreadMessage?: number | null;
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

export interface RemoteManagedProfile {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  role?: "user" | "admin" | string | null;
  isBanned?: boolean | null;
}

export interface RemoteManagedUserDetail {
  profile?: RemoteManagedProfile | null;
}

export interface RemoteBusinessSummary {
  id?: number | null;
  name?: string | null;
  primaryLogoUrl?: string | null;
  category?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  businessPhone?: string | null;
  countryCode?: string | null;
}

export interface RemoteBusinessKnowledge {
  primaryLogoUrl?: string | null;
  rootBusinessId?: number | null;
  name?: string | null;
  category?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  businessPhone?: string | null;
  countryCode?: string | null;
}

export interface RemoteBusinessManageDetail {
  businessRoot?: RemoteBusinessSummary | null;
  knowledge?: RemoteBusinessKnowledge | null;
}

export interface CreateWhatsappTicketPayload {
  subject: string;
  priority: "low" | "medium" | "high";
  whatsappMessageChatId: number;
}

export interface CreateWhatsappRoomPayload {
  number: string;
  body?: string;
}

export interface RemoteWhatsappRoomCreateResult {
  room?: RemoteWhatsappRoom | null;
  message?: RemoteWhatsappMessage | null;
}

export interface WhatsappRoomCreateResult extends RemoteWhatsappRoomCreateResult {
  responseMessage?: string;
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

export interface UploadedAttachment {
  name: string;
  url: string;
  type: string;
}

interface UploadCustomerServiceAttachmentPayload {
  name: string;
  type: string;
  dataUrl: string;
}

export interface WhatsappBlastContact {
  id: string;
  name: string;
  handle: string;
  phone: string;
  avatarUrl?: string;
  countryCode?: string;
  email?: string;
  role: "user" | "admin" | "business";
  sourceId: string | number;
}

export interface ChatBlastTargetsPayload {
  profileIds?: string[];
  businessIds?: number[];
  phoneNumbers?: string[];
  emails?: string[];
}

export interface ChatBlastPayload {
  subject: string;
  body: string;
  attachments?: string[];
  channelType: "whatsapp" | "gmail" | "website";
  broadcastType: "direct" | "scheduled";
  schedule: string | null;
  targets: ChatBlastTargetsPayload;
}

export interface RemoteChatBlastHistory {
  id: number;
  subject?: string | null;
  body?: string | null;
  attachments?: string[] | null;
  channelType?: "whatsapp" | "gmail" | "website" | string | null;
  totalAssign?: number | null;
  succeedAssign?: number | null;
  targets?: string[] | null;
  broadcastType?: "direct" | "scheduled" | string | null;
  status?: "queued" | "processing" | "success" | "failed" | string | null;
  scheduledFor?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteNotificationChatBlast {
  id?: number | null;
  subject?: string | null;
  body?: string | null;
  attachments?: string[] | null;
  channelType?: "whatsapp" | "gmail" | "website" | string | null;
  broadcastType?: string | null;
  status?: string | null;
  scheduledFor?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteNotification {
  id: number;
  chatBlastMessageHistoryId?: number | null;
  profileId?: string | null;
  readAt?: string | null;
  chatBlast?: RemoteNotificationChatBlast | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteNotificationUnreadCount {
  totalUnread?: number | null;
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

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();

    reader.onerror = () => reject(new Error("Gagal membaca lampiran."));
    reader.onload = () => {
      if (typeof reader.result === "string") {
        resolve(reader.result);
        return;
      }

      reject(new Error("Gagal membaca lampiran."));
    };

    reader.readAsDataURL(file);
  });
}

function dataUrlToBlob(dataUrl: string, fallbackType: string) {
  const match = dataUrl.match(/^data:([^;,]+)?(;base64)?,([\s\S]*)$/);

  if (!match) {
    throw new Error("Format lampiran tidak valid.");
  }

  const mimeType = match[1] || fallbackType || "application/octet-stream";
  const isBase64 = Boolean(match[2]);
  const data = match[3] || "";
  const bytes = isBase64
    ? Uint8Array.from(atob(data.replace(/\s/g, "")), (char) => char.charCodeAt(0))
    : new TextEncoder().encode(decodeURIComponent(data));

  return new Blob([bytes], { type: mimeType });
}

const getWebsiteTicketsServer = createServerFn({ method: "GET" }).handler(async () => {
  const tickets = await apiRequestAllPages<RemoteTicket>("/api/ticket/website");
  const detailResults = await Promise.allSettled(
    tickets.map(async (ticket) => {
      const response = await apiRequest<RemoteWebsiteTicketDetail>(
        `/api/ticket/website/${ticket.id}`,
      );
      return response.data;
    }),
  );

  return tickets.map((ticket, index) => {
    const result = detailResults[index];
    if (result?.status !== "fulfilled") return ticket;

    const detail = result.value;
    const detailTicket = detail?.ticket ?? ticket;

    return {
      ...ticket,
      ...detailTicket,
      isPinned: ticket.isPinned ?? detailTicket.isPinned,
      unreadMessages: ticket.unreadMessages ?? detailTicket.unreadMessages,
      messages: detail?.messages ?? ticket.messages ?? [],
    } satisfies RemoteTicket;
  });
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

const uploadCustomerServiceAttachmentServer = createServerFn({ method: "POST" })
  .validator((data: UploadCustomerServiceAttachmentPayload) => data)
  .handler(async ({ data }) => {
    const fileBlob = dataUrlToBlob(data.dataUrl, data.type);
    const formData = new FormData();

    formData.append("image", fileBlob, data.name || "attachment");

    const response = await fetch(buildUrl("/api/app/image-uploader/upload-single-image"), {
      method: "POST",
      headers: authHeaders(false),
      body: formData,
    });
    const payload = (await response.json().catch(() => null)) as ApiResponse<
      string | { imageUrl?: string | null; url?: string | null }
    > | null;

    const responseData = payload?.data;
    const url =
      typeof responseData === "string"
        ? responseData
        : typeof responseData?.imageUrl === "string"
          ? responseData.imageUrl
          : typeof responseData?.url === "string"
            ? responseData.url
            : "";

    if (!response.ok || !url) {
      throw new Error(
        payload?.metaData?.message ||
          payload?.responseMessage ||
          `Upload lampiran gagal dengan status ${response.status}.`,
      );
    }

    return {
      name: data.name || "attachment",
      url,
      type: data.type || fileBlob.type,
    } satisfies UploadedAttachment;
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
  return apiRequestAllPages<RemoteTicket>("/api/ticket/whatsapp");
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

const setTicketPinnedServer = createServerFn({ method: "POST" })
  .validator((data: { ticketId: number; isPinned: boolean }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteTicket>("/api/ticket/common/set-pinned", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  });

const setWhatsappRoomPinnedServer = createServerFn({ method: "POST" })
  .validator((data: { whatsappRoomChatId: number; isPinned: boolean }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteWhatsappRoom>("/api/chat/whatsapp/set-pinned", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data ?? { id: data.whatsappRoomChatId, isPinned: data.isPinned };
  });

const getWhatsappRoomsServer = createServerFn({ method: "GET" }).handler(async () => {
  return apiRequestAllPages<RemoteWhatsappRoom>("/api/chat/whatsapp");
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

const createWhatsappRoomServer = createServerFn({ method: "POST" })
  .validator((data: CreateWhatsappRoomPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteWhatsappRoomCreateResult>("/api/chat/whatsapp", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return {
      ...(response.data ?? {}),
      responseMessage: response.responseMessage,
    } satisfies WhatsappRoomCreateResult;
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

const CONTACT_PAGE_LIMIT = 100;
const CONTACT_PAGE_CAP = 10;

function appendQuery(path: string, query: Record<string, string | number | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

function numberFromPagination(pagination: Record<string, unknown>, keys: string[]) {
  const value = keys.map((key) => pagination[key]).find((item) => item != null);
  const parsed = typeof value === "number" ? value : Number(value);

  return Number.isFinite(parsed) ? parsed : undefined;
}

function getPaginationTotalPages(pagination: unknown) {
  if (!pagination || typeof pagination !== "object") return 1;

  const paginationRecord = pagination as Record<string, unknown>;
  const totalPages = numberFromPagination(paginationRecord, [
    "totalPages",
    "totalPage",
    "lastPage",
    "pageCount",
  ]);
  if (totalPages != null && totalPages > 0) return totalPages;

  const total = numberFromPagination(paginationRecord, ["total", "totalItems", "count"]);
  const limit = numberFromPagination(paginationRecord, ["limit", "perPage", "pageSize"]);
  if (total != null && limit != null && limit > 0) {
    return Math.max(1, Math.ceil(total / limit));
  }

  return 1;
}

function getPaginationHasNextPage(pagination: unknown, currentPage: number, totalPages: number) {
  if (pagination && typeof pagination === "object") {
    const hasNextPage = (pagination as { hasNextPage?: unknown }).hasNextPage;
    if (hasNextPage === true) return true;
    if (currentPage < totalPages) return true;
    if (hasNextPage === false) return false;
  }

  return currentPage < totalPages;
}

async function apiRequestAllPages<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
  init: RequestInit = {},
) {
  let page = 1;
  let totalPages = 1;
  let hasNextPage = true;
  const items: T[] = [];

  do {
    const response = await apiRequest<T[] | T>(
      appendQuery(path, {
        ...query,
        limit: query.limit ?? CONTACT_PAGE_LIMIT,
        page,
      }),
      init,
    );

    const data = response.data;
    items.push(...(Array.isArray(data) ? data : data ? [data] : []));
    totalPages = getPaginationTotalPages(response.pagination);
    hasNextPage = getPaginationHasNextPage(response.pagination, page, totalPages);
    page += 1;
  } while (hasNextPage && page <= CONTACT_PAGE_CAP);

  return items;
}

function normalizeWhatsappPhone(phone?: string | null, countryCode?: string | null) {
  const phoneDigits = phone?.replace(/\D/g, "") ?? "";
  if (!phoneDigits) return null;

  const resolvedCountryCode = countryCode?.replace(/\D/g, "") || "62";

  if (phoneDigits.startsWith(resolvedCountryCode)) {
    if (phoneDigits.startsWith(`${resolvedCountryCode}0`)) {
      return `${resolvedCountryCode}${phoneDigits.slice(resolvedCountryCode.length + 1)}`;
    }

    return phoneDigits;
  }

  if (phoneDigits.startsWith("0")) {
    return `${resolvedCountryCode}${phoneDigits.slice(1)}`;
  }

  if (resolvedCountryCode === "62" && phoneDigits.startsWith("8")) {
    return `62${phoneDigits}`;
  }

  return `${resolvedCountryCode}${phoneDigits}`;
}

function toWhatsappHandle(phone: string) {
  if (phone.startsWith("62") && phone.length > 2) {
    return `+62 ${phone.slice(2)}`;
  }

  return `+${phone}`;
}

function profileToWhatsappContact(
  profile: RemoteManagedProfile,
  role: "user" | "admin",
): WhatsappBlastContact | null {
  const normalizedPhone = normalizeWhatsappPhone(profile.phone, profile.countryCode);
  if (!normalizedPhone) return null;

  const resolvedRole = profile.role === "admin" ? "admin" : "user";
  if (resolvedRole !== role) return null;

  const sourceId = profile.id ?? normalizedPhone;
  const name = profile.name?.trim() || profile.email?.trim() || toWhatsappHandle(normalizedPhone);

  return {
    id: `${role}-${sourceId}`,
    name,
    handle: toWhatsappHandle(normalizedPhone),
    phone: normalizedPhone,
    avatarUrl: profile.imageUrl ?? profile.image ?? undefined,
    countryCode: profile.countryCode ?? undefined,
    email: profile.email ?? undefined,
    role,
    sourceId,
  };
}

async function getManagedProfileDetail(profile: RemoteManagedProfile) {
  if (!profile.id) return profile;

  const response = await apiRequest<RemoteManagedUserDetail | RemoteManagedProfile>(
    `/api/user/manage/${profile.id}`,
  );
  const data = response.data;

  if (data && typeof data === "object" && "profile" in data && data.profile) {
    return data.profile;
  }

  return (data as RemoteManagedProfile | null) ?? profile;
}

async function getManagedWhatsappContacts(role: "user" | "admin") {
  const listedProfiles = await apiRequestAllPages<RemoteManagedProfile>("/api/user/manage", {
    role,
  });
  const uniqueProfiles = Array.from(
    new Map(
      listedProfiles
        .filter((profile) => profile.id || profile.email || profile.phone)
        .map((profile) => [profile.id ?? profile.email ?? profile.phone, profile]),
    ).values(),
  );

  const detailResults = await Promise.allSettled(
    uniqueProfiles.map(async (profile) => getManagedProfileDetail(profile)),
  );

  return detailResults
    .map((result, index) => (result.status === "fulfilled" ? result.value : uniqueProfiles[index]))
    .map((profile) => profileToWhatsappContact(profile, role))
    .filter((contact): contact is WhatsappBlastContact => Boolean(contact));
}

function businessToWhatsappContact(
  business: RemoteBusinessSummary,
  knowledge?: RemoteBusinessKnowledge | null,
): WhatsappBlastContact | null {
  const phone = normalizeWhatsappPhone(
    knowledge?.businessPhone ?? business.businessPhone,
    knowledge?.countryCode ?? business.countryCode,
  );
  if (!phone) return null;

  const sourceId = knowledge?.rootBusinessId ?? business.id ?? phone;
  const name = knowledge?.name?.trim() || business.name?.trim() || `Business #${sourceId}`;

  return {
    id: `business-${sourceId}`,
    name,
    handle: toWhatsappHandle(phone),
    phone,
    avatarUrl: knowledge?.primaryLogoUrl ?? business.primaryLogoUrl ?? undefined,
    countryCode: knowledge?.countryCode ?? business.countryCode ?? undefined,
    role: "business",
    sourceId,
  };
}

async function getBusinessListForWhatsappContacts() {
  try {
    return await apiRequestAllPages<RemoteBusinessSummary>("/api/business/manage");
  } catch {
    return apiRequestAllPages<RemoteBusinessSummary>("/api/business/information");
  }
}

async function getBusinessWhatsappContact(business: RemoteBusinessSummary) {
  if (!business.id) return businessToWhatsappContact(business);

  try {
    const response = await apiRequest<RemoteBusinessManageDetail>(
      `/api/business/manage/${business.id}`,
    );
    return businessToWhatsappContact(
      response.data?.businessRoot ?? business,
      response.data?.knowledge,
    );
  } catch {
    const knowledge = await apiRequest<RemoteBusinessKnowledge>(
      `/api/business/knowledge/${business.id}`,
    )
      .then((response) => response.data)
      .catch(() => null);

    return businessToWhatsappContact(business, knowledge);
  }
}

async function getBusinessWhatsappContacts() {
  const businesses = await getBusinessListForWhatsappContacts();
  const uniqueBusinesses = Array.from(
    new Map(
      businesses
        .filter((business) => business.id || business.name || business.businessPhone)
        .map((business) => [business.id ?? business.name ?? business.businessPhone, business]),
    ).values(),
  );

  const detailResults = await Promise.allSettled(
    uniqueBusinesses.map(async (business) => getBusinessWhatsappContact(business)),
  );

  return detailResults
    .map((result) => (result.status === "fulfilled" ? result.value : null))
    .filter((contact): contact is WhatsappBlastContact => Boolean(contact));
}

function uniqueWhatsappBlastContacts(contacts: WhatsappBlastContact[]) {
  return Array.from(
    new Map(contacts.map((contact) => [`${contact.role}:${contact.phone}`, contact])).values(),
  );
}

const getWhatsappBlastContactsServer = createServerFn({ method: "GET" }).handler(async () => {
  const contactResults = await Promise.allSettled([
    getManagedWhatsappContacts("user"),
    getManagedWhatsappContacts("admin"),
    getBusinessWhatsappContacts(),
  ]);

  const contacts = uniqueWhatsappBlastContacts(
    contactResults.flatMap((result) => (result.status === "fulfilled" ? result.value : [])),
  );

  if (!contacts.length) {
    const firstError = contactResults.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (firstError) {
      throw firstError.reason instanceof Error
        ? firstError.reason
        : new Error("Gagal memuat kontak WhatsApp blast.");
    }
  }

  return contacts;
});

const getChatBlastHistoriesServer = createServerFn({ method: "GET" }).handler(async () => {
  return apiRequestAllPages<RemoteChatBlastHistory>(
    "/api/chat/blast",
    {
      limit: 10,
      sort: "desc",
      sortBy: "id",
    },
    { cache: "no-store" },
  );
});

const getChatBlastHistoryServer = createServerFn({ method: "GET" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteChatBlastHistory>(`/api/chat/blast/${data.id}`);
    return response.data;
  });

const sendChatBlastServer = createServerFn({ method: "POST" })
  .validator((data: ChatBlastPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteChatBlastHistory>("/api/chat/blast", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  });

const getCommonNotificationsServer = createServerFn({ method: "GET" }).handler(async () => {
  return apiRequestAllPages<RemoteNotification>("/api/notification/common");
});

const getCommonNotificationUnreadCountServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const response = await apiRequest<RemoteNotificationUnreadCount>(
      "/api/notification/common/unread-count",
    );
    return response.data ?? { totalUnread: 0 };
  },
);

export function getWebsiteTickets() {
  return getWebsiteTicketsServer();
}

export function getWebsiteTicketDetail(ticketId: number) {
  return getWebsiteTicketDetailServer({ data: { ticketId } });
}

export function replyWebsiteTicket(ticketId: number, payload: ReplyWebsitePayload) {
  return replyWebsiteTicketServer({ data: { ticketId, payload } });
}

export async function uploadCustomerServiceAttachment(file: File): Promise<UploadedAttachment> {
  const dataUrl = await readFileAsDataUrl(file);

  return uploadCustomerServiceAttachmentServer({
    data: {
      name: file.name,
      type: file.type,
      dataUrl,
    },
  });
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

export function setTicketPinned(ticketId: number, isPinned: boolean) {
  return setTicketPinnedServer({ data: { ticketId, isPinned } });
}

export function setWhatsappRoomPinned(whatsappRoomChatId: number, isPinned: boolean) {
  return setWhatsappRoomPinnedServer({ data: { whatsappRoomChatId, isPinned } });
}

export function getWhatsappRooms() {
  return getWhatsappRoomsServer();
}

export function getWhatsappMessages(roomChatId: number, limit = 50) {
  return getWhatsappMessagesServer({ data: { roomChatId, limit } });
}

export function createWhatsappRoom(payload: CreateWhatsappRoomPayload) {
  return createWhatsappRoomServer({ data: payload });
}

export function replyWhatsappRoom(roomChatId: number, payload: ReplyWhatsappPayload) {
  return replyWhatsappRoomServer({ data: { roomChatId, payload } });
}

export function createWhatsappTicket(payload: CreateWhatsappTicketPayload) {
  return createWhatsappTicketServer({ data: payload });
}

export function getWhatsappBlastContacts() {
  return getWhatsappBlastContactsServer();
}

export function getChatBlastHistories() {
  return getChatBlastHistoriesServer();
}

export function getChatBlastHistory(id: number) {
  return getChatBlastHistoryServer({ data: { id } });
}

export function sendChatBlast(payload: ChatBlastPayload) {
  return sendChatBlastServer({ data: payload });
}

export function getCommonNotifications() {
  return getCommonNotificationsServer();
}

export function getCommonNotificationUnreadCount() {
  return getCommonNotificationUnreadCountServer();
}

export function getRealtimeWebsocketUrl(accessToken?: string | null) {
  const token = accessToken ?? getAccessToken();
  if (!token) return null;

  const url = new URL("/api/realtime/ws", API_ORIGIN);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("postmaticAccessToken", token);

  return url.toString();
}
