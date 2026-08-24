import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { ACCESS_TOKEN_HEADER, ACCESS_TOKEN_KEY, getAccessToken } from "@/lib/auth";
import { toPaginatedResult } from "@/lib/pagination";

export const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined)?.trim() ||
  "https://api-staging.postmatic.id";
const ASSET_PUBLIC_ORIGIN =
  (import.meta.env.VITE_ASSET_PUBLIC_ORIGIN as string | undefined)?.trim() ||
  "https://asset.postmatic.id";

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
  channel: "website" | "whatsapp" | "email";
  priority?: string | null;
  slaStatus?: "open" | "pending" | "in_progress" | "resolved" | string | null;
  isPinned?: boolean | null;
  unreadMessages?: number | null;
  whatsappRoomChatId?: number | null;
  whatsappMessageChatId?: number | null;
  emailThreadId?: number | null;
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
  displayName?: string | null;
  displayPicture?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  isPinned?: boolean | null;
  unreadMessage?: number | null;
  displayInfoRefresh?: {
    performed?: boolean | null;
    skipped?: boolean | null;
    reason?: string | null;
    retryAfterSeconds?: number | null;
  } | null;
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
  uploadedAssetIds?: Array<number | string>;
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
  uploadedAssetIds?: Array<number | string>;
  attachment?: string;
  attachmentFilename?: string;
  attachmentMimeType?: string;
  attachmentType?: ChatAttachmentType;
}

export interface ReplyWebsitePayload {
  body: string;
  quotedWebMessageId?: number;
  attachments?: string[];
}

export interface UploadedAttachment {
  assetId: number | string;
  name: string;
  url: string;
  type: string;
}

export type ChatAttachmentType = "image" | "video" | "audio" | "document";

export interface RemoteChatAttachment {
  id?: number | null;
  uploadedAssetId?: number | string | null;
  position?: number | null;
  url?: string | null;
  filename?: string | null;
  mimeType?: string | null;
  attachmentType?: ChatAttachmentType | string | null;
  sizeBytes?: number | null;
}

export type RemoteChatAttachmentValue = string | RemoteChatAttachment;

export interface ChatAttachmentPayload {
  uploadedAssetId?: number | string;
  url: string;
  filename: string;
  mimeType: string;
  attachmentType: ChatAttachmentType;
}

export interface RemoteEmailAddress {
  name?: string | null;
  address?: string | null;
}

export interface RemoteEmailMailbox {
  id?: number | null;
  address?: string | null;
  displayName?: string | null;
}

export interface RemoteEmailAttachment {
  id?: number | null;
  uploadedAssetId?: number | string | null;
  position?: number | null;
  filename?: string | null;
  mimeType?: string | null;
  sizeBytes?: number | null;
  disposition?: string | null;
  contentId?: string | null;
  assetUrl?: string | null;
  status?: string | null;
}

export interface RemoteEmailMessageSummary {
  id?: number | null;
  direction?: "inbound" | "outbound" | string | null;
  from?: RemoteEmailAddress | null;
  subject?: string | null;
  preview?: string | null;
  sentStatus?: string | null;
  occurredAt?: string | null;
}

export interface RemoteEmailThread {
  id: number;
  mailbox?: RemoteEmailMailbox | null;
  subject?: string | null;
  primaryContactEmail?: string | null;
  primaryContactName?: string | null;
  unreadMessage?: number | null;
  isPinned?: boolean | null;
  isArchived?: boolean | null;
  inboxView?: "inbox" | "archive" | "spam" | "trash" | string | null;
  lastMessage?: RemoteEmailMessageSummary | null;
  lastMessageAt?: string | null;
  appTicketCategoryId?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteEmailMessage {
  id: number;
  emailThreadId?: number | null;
  direction?: "inbound" | "outbound" | string | null;
  senderType?: "customer" | "agent" | string | null;
  from?: RemoteEmailAddress | null;
  replyTo?: RemoteEmailAddress | null;
  to?: RemoteEmailAddress[] | null;
  cc?: RemoteEmailAddress[] | null;
  bcc?: RemoteEmailAddress[] | null;
  subject?: string | null;
  textBody?: string | null;
  htmlBody?: string | null;
  rfcMessageId?: string | null;
  inReplyTo?: string | null;
  references?: string[] | null;
  parent?: RemoteEmailMessageSummary | null;
  resendOfEmailMessageId?: number | null;
  resentAsEmailMessageId?: number | null;
  canResend?: boolean | null;
  sentStatus?: string | null;
  sendAttempts?: number | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  attachments?: RemoteEmailAttachment[] | null;
  inlineContentUrls?: Record<string, string> | null;
  occurredAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface EmailMessagePayload {
  to?: RemoteEmailAddress[];
  cc?: RemoteEmailAddress[];
  bcc?: RemoteEmailAddress[];
  subject?: string;
  textBody: string;
  htmlBody: string;
  replyAll?: boolean;
  uploadedAssetIds?: Array<number | string>;
}

export interface RemoteEmailQuota {
  mailboxId?: number | null;
  address?: string | null;
  dailyUsage?: number | null;
  dailyGuard?: number | null;
  providerDailyLimit?: number | null;
  remainingDailyGuard?: number | null;
  guardResetAt?: string | null;
}

export interface CreateEmailTicketPayload {
  emailMessageId: number;
  appTicketCategoryId?: number | null;
  priority: "low" | "medium" | "high";
}

interface RemoteAssetUploadInstruction {
  method?: string | null;
  url?: string | null;
  headers?: Record<string, string> | null;
  expiresAt?: string | null;
}

interface RemoteUploadedAsset {
  id?: number | string | null;
  contentHash?: string | null;
  isDuplicate?: boolean | null;
  provider?: string | null;
  status?: "pending" | "ready" | "failed" | string | null;
  assetUrl?: string | null;
  size?: number | null;
  mimeType?: string | null;
  extension?: string | null;
  assetKind?: ChatAttachmentType | string | null;
  originalFilename?: string | null;
  upload?: RemoteAssetUploadInstruction | null;
}

interface AssetPresignPayload {
  contentHash: string;
  filename: string;
  mimeType: string;
  size: number;
}

interface AssetConfirmPayload {
  assetId: number | string;
  contentHash: string;
}

interface AssetServerUploadPayload {
  asset: RemoteUploadedAsset;
  dataUrl: string;
  mimeType: string;
  size: number;
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
  htmlBody?: string;
  uploadedAssetIds?: Array<number | string>;
  attachments?: ChatAttachmentPayload[];
  channelType: "whatsapp" | "gmail" | "email" | "website";
  purpose?: "marketing" | "operational";
  broadcastType: "direct" | "scheduled";
  schedule: string | null;
  targets: ChatBlastTargetsPayload;
}

export interface RemoteChatBlastHistory {
  id: number;
  subject?: string | null;
  body?: string | null;
  htmlBody?: string | null;
  purpose?: "marketing" | "operational" | string | null;
  attachments?: RemoteChatAttachmentValue[] | null;
  channelType?: "whatsapp" | "gmail" | "email" | "website" | string | null;
  totalAssign?: number | null;
  succeedAssign?: number | null;
  targets?: string[] | null;
  broadcastType?: "direct" | "scheduled" | string | null;
  status?: "queued" | "processing" | "success" | "failed" | string | null;
  scheduledFor?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ChatBlastHistoryQuery {
  page?: number;
  limit?: number;
  search?: string;
}

export interface RemoteEmailBlastDelivery {
  id?: number | null;
  chatBlastMessageHistoryId?: number | null;
  emailThreadId?: number | null;
  emailMessageId?: number | null;
  recipient?: RemoteEmailAddress | string | null;
  recipientAddress?: string | null;
  recipientEmail?: string | null;
  normalizedRecipient?: string | null;
  email?: string | null;
  status?: "pending" | "sent" | "failed" | "delivery_unknown" | "bounced" | string | null;
  sentStatus?: "pending" | "sent" | "failed" | "delivery_unknown" | "bounced" | string | null;
  attemptCount?: number | null;
  lastErrorCode?: string | null;
  lastErrorMessage?: string | null;
  queuedAt?: string | null;
  sentAt?: string | null;
  failedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteAdminNotification {
  id: number;
  eventKey: string;
  severity: "info" | "warning" | "critical" | string;
  title: string;
  message: string;
  actorProfileId?: string | null;
  resourceType: "ticket" | "chat";
  resourceId: string;
  readAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteAdminNotificationUnreadCount {
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
  const headers = authHeaders(hasBody);

  new Headers(init.headers).forEach((value, key) => {
    headers.set(key, value);
  });

  headers.set("Cache-Control", "no-store");
  headers.set("Pragma", "no-cache");

  const response = await fetch(buildUrl(path), {
    ...init,
    cache: "no-store",
    headers,
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload) {
    throw new Error(payload?.metaData?.message || `Request failed with status ${response.status}`);
  }

  return payload;
}

function getExtension(value: string) {
  return value.split(/[?#]/)[0].split(".").pop()?.toLowerCase();
}

const SUPPORTED_ASSETS = [
  { mimeType: "image/jpeg", extensions: ["jpg", "jpeg"], maxSize: 10 * 1024 * 1024 },
  { mimeType: "image/png", extensions: ["png"], maxSize: 10 * 1024 * 1024 },
  { mimeType: "image/webp", extensions: ["webp"], maxSize: 10 * 1024 * 1024 },
  { mimeType: "application/pdf", extensions: ["pdf"], maxSize: 25 * 1024 * 1024 },
  { mimeType: "audio/mpeg", extensions: ["mp3"], maxSize: 25 * 1024 * 1024 },
  { mimeType: "application/ogg", extensions: ["ogg"], maxSize: 25 * 1024 * 1024 },
  { mimeType: "audio/wave", extensions: ["wav"], maxSize: 25 * 1024 * 1024 },
  { mimeType: "video/mp4", extensions: ["mp4"], maxSize: 16 * 1024 * 1024 },
] as const;

function normalizeAttachmentMimeType(file: File) {
  const extension = getExtension(file.name);
  const browserMime = file.type.toLowerCase().trim();
  const normalizedMime =
    browserMime === "image/jpg"
      ? "image/jpeg"
      : browserMime === "audio/wav" || browserMime === "audio/x-wav"
        ? "audio/wave"
        : browserMime;

  const byExtension = SUPPORTED_ASSETS.find((asset) => asset.extensions.includes(extension ?? ""));
  const byMime = SUPPORTED_ASSETS.find((asset) => asset.mimeType === normalizedMime);
  const asset = byExtension ?? byMime;

  if (!asset) {
    throw new Error("Tipe lampiran belum didukung oleh Asset Uploader.");
  }

  if (file.size > asset.maxSize) {
    const maxMiB = Math.floor(asset.maxSize / 1024 / 1024);
    throw new Error(`Ukuran lampiran melebihi batas ${maxMiB} MiB.`);
  }

  return asset.mimeType;
}

async function sha256Hex(file: File) {
  if (!globalThis.crypto?.subtle) {
    throw new Error("Browser tidak mendukung SHA-256 untuk upload asset.");
  }

  const bytes = await file.arrayBuffer();
  const digest = await globalThis.crypto.subtle.digest("SHA-256", bytes);

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
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

function uploadHeaders(headers?: Record<string, string> | null) {
  const nextHeaders = new Headers();

  Object.entries(headers ?? {}).forEach(([key, value]) => {
    if (key.toLowerCase() === "host") return;
    nextHeaders.set(key, value);
  });

  return nextHeaders;
}

function normalizePublicAssetUrl(url: string) {
  try {
    const assetUrl = new URL(url);

    if (assetUrl.hostname.endsWith(".r2.dev")) {
      const publicOrigin = new URL(ASSET_PUBLIC_ORIGIN);
      assetUrl.protocol = publicOrigin.protocol;
      assetUrl.host = publicOrigin.host;
    }

    return assetUrl.toString();
  } catch {
    return url;
  }
}

function publicAssetUrl(asset: RemoteUploadedAsset, fallbackUrl?: string | null) {
  const assetUrl = asset.assetUrl?.trim() || fallbackUrl?.trim();
  return assetUrl ? normalizePublicAssetUrl(assetUrl) : "";
}

const presignAssetServer = createServerFn({ method: "POST" })
  .validator((data: AssetPresignPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteUploadedAsset>("/api/app/asset-uploader/presign", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const confirmAssetServer = createServerFn({ method: "POST" })
  .validator((data: AssetConfirmPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteUploadedAsset>("/api/app/asset-uploader/confirm", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const uploadPresignedAssetServer = createServerFn({ method: "POST" })
  .validator((data: AssetServerUploadPayload) => data)
  .handler(async ({ data }) => {
    const upload = data.asset.upload;
    if (data.asset.id == null || !data.asset.contentHash || !upload?.url) {
      throw new Error("Response presign asset tidak lengkap.");
    }

    const fileBlob = dataUrlToBlob(data.dataUrl, data.mimeType);
    if (fileBlob.size !== data.size) {
      throw new Error("Ukuran lampiran berubah sebelum upload R2.");
    }

    const uploadResponse = await fetch(upload.url, {
      method: upload.method || "PUT",
      headers: uploadHeaders(upload.headers),
      body: fileBlob,
    });

    if (!uploadResponse.ok && uploadResponse.status !== 412) {
      throw new Error(`Upload R2 gagal dengan status ${uploadResponse.status}.`);
    }

    const response = await apiRequest<RemoteUploadedAsset>("/api/app/asset-uploader/confirm", {
      method: "POST",
      body: JSON.stringify({
        assetId: data.asset.id,
        contentHash: data.asset.contentHash,
      }),
    });

    return response.data;
  });

function presignAsset(payload: AssetPresignPayload) {
  return presignAssetServer({ data: payload });
}

function confirmAsset(asset: RemoteUploadedAsset) {
  if (asset.id == null || !asset.contentHash) {
    throw new Error("Response presign asset tidak lengkap.");
  }

  return confirmAssetServer({
    data: {
      assetId: asset.id,
      contentHash: asset.contentHash,
    },
  });
}

function uploadPresignedAsset(
  asset: RemoteUploadedAsset,
  payload: Omit<AssetServerUploadPayload, "asset">,
) {
  return uploadPresignedAssetServer({
    data: {
      asset,
      ...payload,
    },
  });
}

async function uploadAssetToR2(file: File) {
  const mimeType = normalizeAttachmentMimeType(file);
  const contentHash = await sha256Hex(file);
  const presignedAsset = await presignAsset({
    contentHash,
    filename: file.name || "attachment",
    mimeType,
    size: file.size,
  });

  if (presignedAsset.status === "ready" && presignedAsset.upload == null) {
    const cachedUrl = publicAssetUrl(presignedAsset);
    if (!cachedUrl) throw new Error("Asset siap tetapi URL tidak tersedia.");
    if (presignedAsset.id == null) throw new Error("Asset siap tetapi ID tidak tersedia.");
    return { id: presignedAsset.id, url: cachedUrl, mimeType: presignedAsset.mimeType ?? mimeType };
  }

  const upload = presignedAsset.upload;
  if (presignedAsset.status !== "pending" || !upload?.url) {
    throw new Error("State upload asset dari backend tidak valid.");
  }

  const confirmedAsset = await uploadPresignedAsset(presignedAsset, {
    dataUrl: await readFileAsDataUrl(file),
    mimeType,
    size: file.size,
  });
  if (confirmedAsset.status !== "ready") {
    throw new Error("Asset belum ready setelah confirm.");
  }

  const assetUrl = publicAssetUrl(confirmedAsset, presignedAsset.assetUrl);
  if (!assetUrl) {
    throw new Error("Confirm asset berhasil tetapi URL tidak tersedia.");
  }
  if (confirmedAsset.id == null) {
    throw new Error("Confirm asset berhasil tetapi ID tidak tersedia.");
  }

  return { id: confirmedAsset.id, url: assetUrl, mimeType: confirmedAsset.mimeType ?? mimeType };
}

export function getAttachmentType(name: string, mimeType?: string | null): ChatAttachmentType {
  const normalizedMime = mimeType?.toLowerCase() ?? "";
  const extension = getExtension(name);

  if (normalizedMime.startsWith("image/")) return "image";
  if (normalizedMime.startsWith("video/")) return "video";
  if (normalizedMime.startsWith("audio/")) return "audio";

  if (["apng", "avif", "gif", "jpg", "jpeg", "png", "svg", "webp"].includes(extension ?? "")) {
    return "image";
  }

  if (["mp4", "m4v", "mov", "ogg", "ogv", "webm"].includes(extension ?? "")) {
    return "video";
  }

  if (["aac", "m4a", "mp3", "oga", "opus", "wav", "weba"].includes(extension ?? "")) {
    return "audio";
  }

  return "document";
}

export function toChatAttachmentPayload(attachment: UploadedAttachment): ChatAttachmentPayload {
  const filename = attachment.name || "attachment";
  const mimeType = attachment.type || "application/octet-stream";

  return {
    uploadedAssetId: attachment.assetId,
    url: attachment.url,
    filename,
    mimeType,
    attachmentType: getAttachmentType(filename, mimeType),
  };
}

export function getUploadedAssetIds(attachments: UploadedAttachment[]) {
  return Array.from(
    new Set(
      attachments
        .map((attachment) => attachment.assetId)
        .filter((assetId): assetId is number | string => assetId != null && `${assetId}` !== ""),
    ),
  );
}

function getAttachmentNameFromUrl(url: string, fallback: string) {
  const rawName = url.split(/[?#]/)[0].split("/").filter(Boolean).at(-1) ?? fallback;

  try {
    return decodeURIComponent(rawName);
  } catch {
    return rawName;
  }
}

export function normalizeRemoteChatAttachment(
  attachment: RemoteChatAttachmentValue,
  fallbackName: string,
): ChatAttachmentPayload | null {
  if (typeof attachment === "string") {
    const url = attachment.trim();
    if (!url) return null;

    const filename = getAttachmentNameFromUrl(url, fallbackName);

    return {
      uploadedAssetId: attachment.uploadedAssetId ?? attachment.id ?? undefined,
      url,
      filename,
      mimeType: "application/octet-stream",
      attachmentType: getAttachmentType(filename),
    };
  }

  const url = attachment.url?.trim();
  if (!url) return null;

  const filename =
    attachment.filename?.trim() || getAttachmentNameFromUrl(url, fallbackName) || fallbackName;
  const mimeType = attachment.mimeType?.trim() || "application/octet-stream";
  const attachmentType = attachment.attachmentType?.trim() as ChatAttachmentType | undefined;

  return {
    url,
    filename,
    mimeType,
    attachmentType:
      attachmentType === "image" ||
      attachmentType === "video" ||
      attachmentType === "audio" ||
      attachmentType === "document"
        ? attachmentType
        : getAttachmentType(filename, mimeType),
  };
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

const refreshWhatsappRoomDisplayInfoServer = createServerFn({ method: "GET" })
  .validator((data: { roomChatId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteWhatsappRoom>(
      `/api/chat/whatsapp/${data.roomChatId}/display-info`,
    );
    return response.data;
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

const resendWhatsappMessageServer = createServerFn({ method: "POST" })
  .validator((data: { roomChatId: number; whatsappMessageChatId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteWhatsappMessage>(
      `/api/chat/whatsapp/${data.roomChatId}/resend`,
      {
        method: "POST",
        body: JSON.stringify({
          whatsappMessageChatId: data.whatsappMessageChatId,
        }),
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

const getEmailThreadsServer = createServerFn({ method: "GET" })
  .validator(
    (data?: {
      inboxView?: "inbox" | "archive" | "spam" | "trash";
      search?: string;
      limit?: number;
      sort?: "asc" | "desc";
      sortBy?: string;
    }) => data ?? {},
  )
  .handler(async ({ data }) => {
    return apiRequestAllPages<RemoteEmailThread>("/api/chat/email", {
      inboxView: data.inboxView ?? "inbox",
      search: data.search ?? undefined,
      limit: data.limit ?? 50,
      sort: data.sort ?? "desc",
      sortBy: data.sortBy ?? "lastMessageAt",
    });
  });

const getEmailTicketsServer = createServerFn({ method: "GET" }).handler(async () => {
  return apiRequestAllPages<RemoteTicket>("/api/ticket/email", {
    limit: 50,
    sort: "desc",
    sortBy: "id",
  });
});

const getEmailThreadInfoServer = createServerFn({ method: "GET" })
  .validator((data: { emailThreadId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailThread>(
      `/api/chat/email/${data.emailThreadId}/info`,
    );
    return response.data;
  });

const getEmailMessagesServer = createServerFn({ method: "GET" })
  .validator((data: { emailThreadId: number; limit?: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailMessage[]>(
      appendQuery(`/api/chat/email/${data.emailThreadId}`, {
        page: 1,
        limit: data.limit ?? 50,
      }),
    );
    return response.data ?? [];
  });

const getEmailQuotaServer = createServerFn({ method: "GET" })
  .validator((data?: { emailMailboxId?: number }) => data ?? {})
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailQuota>(
      appendQuery("/api/chat/email/quota", {
        emailMailboxId: data.emailMailboxId,
      }),
    );
    return response.data;
  });

const composeEmailServer = createServerFn({ method: "POST" })
  .validator((data: EmailMessagePayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailMessage>("/api/chat/email", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  });

const replyEmailServer = createServerFn({ method: "POST" })
  .validator((data: { emailThreadId: number; payload: EmailMessagePayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailMessage>(
      `/api/chat/email/${data.emailThreadId}/reply`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );
    return response.data;
  });

const markEmailThreadReadServer = createServerFn({ method: "POST" })
  .validator((data: { emailThreadId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailThread>(
      `/api/chat/email/${data.emailThreadId}/mark-read`,
      { method: "POST" },
    );
    return response.data;
  });

const setEmailThreadPinnedServer = createServerFn({ method: "POST" })
  .validator((data: { emailThreadId: number; isPinned: boolean }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailThread>(
      `/api/chat/email/${data.emailThreadId}/set-pinned`,
      {
        method: "POST",
        body: JSON.stringify({ isPinned: data.isPinned }),
      },
    );
    return response.data;
  });

const resendEmailMessageServer = createServerFn({ method: "POST" })
  .validator((data: { emailMessageId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailMessage>(
      `/api/chat/email/message/${data.emailMessageId}/resend`,
      { method: "POST" },
    );
    return response.data;
  });

const createEmailTicketServer = createServerFn({ method: "POST" })
  .validator((data: CreateEmailTicketPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteTicket>("/api/chat/email/ticket", {
      method: "POST",
      body: JSON.stringify(data),
    });
    return response.data;
  });

const updateEmailTicketStatusServer = createServerFn({ method: "POST" })
  .validator((data: { ticketId: number; status: RemoteTicketStatus }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteTicket>(`/api/ticket/email/${data.ticketId}/status`, {
      method: "PUT",
      body: JSON.stringify({ status: data.status }),
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

function profileToEmailContact(
  profile: RemoteManagedProfile,
  role: "user" | "admin",
): WhatsappBlastContact | null {
  const email = profile.email?.trim();
  if (!email) return null;

  const resolvedRole = profile.role === "admin" ? "admin" : "user";
  if (resolvedRole !== role) return null;

  const sourceId = profile.id ?? email;
  const name = profile.name?.trim() || email.split("@")[0] || email;

  return {
    id: `email-${role}-${sourceId}`,
    name,
    handle: email,
    phone: profile.phone ?? "",
    avatarUrl: profile.imageUrl ?? profile.image ?? undefined,
    countryCode: profile.countryCode ?? undefined,
    email,
    role,
    sourceId,
  };
}

async function getManagedEmailContacts(role: "user" | "admin") {
  const listedProfiles = await apiRequestAllPages<RemoteManagedProfile>("/api/user/manage", {
    role,
  });

  return Array.from(
    new Map(
      listedProfiles
        .map((profile) => profileToEmailContact(profile, role))
        .filter((contact): contact is WhatsappBlastContact => Boolean(contact))
        .map((contact) => [`${contact.role}:${contact.email}`, contact]),
    ).values(),
  );
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

const getEmailBlastContactsServer = createServerFn({ method: "GET" }).handler(async () => {
  const contactResults = await Promise.allSettled([
    getManagedEmailContacts("user"),
    getManagedEmailContacts("admin"),
  ]);

  const contacts = Array.from(
    new Map(
      contactResults
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .map((contact) => [`${contact.role}:${contact.email}`, contact]),
    ).values(),
  );

  if (!contacts.length) {
    const firstError = contactResults.find(
      (result): result is PromiseRejectedResult => result.status === "rejected",
    );
    if (firstError) {
      throw firstError.reason instanceof Error
        ? firstError.reason
        : new Error("Gagal memuat kontak email blast.");
    }
  }

  return contacts;
});

const getChatBlastHistoryPageServer = createServerFn({ method: "POST" })
  .validator((data: ChatBlastHistoryQuery = {}) => data)
  .handler(async ({ data }) => {
    const page = data.page ?? 1;
    const limit = data.limit ?? 20;
    const response = await apiRequest<RemoteChatBlastHistory[]>(
      appendQuery("/api/chat/blast", {
        limit,
        page,
        search: data.search,
        sort: "desc",
        sortBy: "id",
      }),
      { cache: "no-store" },
    );

    return toPaginatedResult(response.data, response.pagination, page, limit);
  });

const getChatBlastHistoriesServer = createServerFn({ method: "POST" }).handler(async () => {
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

const getEmailBlastDeliveriesServer = createServerFn({ method: "GET" })
  .validator((data: { id: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteEmailBlastDelivery[]>(
      `/api/chat/blast/${data.id}/deliveries`,
      { cache: "no-store" },
    );
    return response.data ?? [];
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

const getAdminNotificationsServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteAdminNotification[]>(
    appendQuery("/api/notification/admin", { page: 1, limit: 20 }),
    { cache: "no-store" },
  );
  return response.data ?? [];
});

const getAdminNotificationUnreadCountServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const response = await apiRequest<RemoteAdminNotificationUnreadCount>(
      "/api/notification/admin/unread-count",
      { cache: "no-store" },
    );
    return response.data ?? { totalUnread: 0 };
  },
);

const markAdminNotificationReadServer = createServerFn({ method: "POST" })
  .validator((data: { notificationId: number }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<{ id: number }>(
      `/api/notification/admin/${data.notificationId}/read`,
      { method: "POST" },
    );
    return response.data ?? { id: data.notificationId };
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

export async function uploadCustomerServiceAttachment(file: File): Promise<UploadedAttachment> {
  const asset = await uploadAssetToR2(file);

  return {
    assetId: asset.id,
    name: file.name || "attachment",
    url: asset.url,
    type: asset.mimeType,
  };
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

export function refreshWhatsappRoomDisplayInfo(roomChatId: number) {
  return refreshWhatsappRoomDisplayInfoServer({ data: { roomChatId } });
}

export function createWhatsappRoom(payload: CreateWhatsappRoomPayload) {
  return createWhatsappRoomServer({ data: payload });
}

export function replyWhatsappRoom(roomChatId: number, payload: ReplyWhatsappPayload) {
  return replyWhatsappRoomServer({ data: { roomChatId, payload } });
}

export function resendWhatsappMessage(roomChatId: number, whatsappMessageChatId: number) {
  return resendWhatsappMessageServer({ data: { roomChatId, whatsappMessageChatId } });
}

export function createWhatsappTicket(payload: CreateWhatsappTicketPayload) {
  return createWhatsappTicketServer({ data: payload });
}

export function getEmailThreads(query?: {
  inboxView?: "inbox" | "archive" | "spam" | "trash";
  search?: string;
  limit?: number;
  sort?: "asc" | "desc";
  sortBy?: string;
}) {
  return getEmailThreadsServer({ data: query ?? {} });
}

export function getEmailTickets() {
  return getEmailTicketsServer();
}

export function getEmailThreadInfo(emailThreadId: number) {
  return getEmailThreadInfoServer({ data: { emailThreadId } });
}

export function getEmailMessages(emailThreadId: number, limit = 50) {
  return getEmailMessagesServer({ data: { emailThreadId, limit } });
}

export function getEmailQuota(emailMailboxId?: number) {
  return getEmailQuotaServer({ data: { emailMailboxId } });
}

export function composeEmail(payload: EmailMessagePayload) {
  return composeEmailServer({ data: payload });
}

export function replyEmail(emailThreadId: number, payload: EmailMessagePayload) {
  return replyEmailServer({ data: { emailThreadId, payload } });
}

export function markEmailThreadRead(emailThreadId: number) {
  return markEmailThreadReadServer({ data: { emailThreadId } });
}

export function setEmailThreadPinned(emailThreadId: number, isPinned: boolean) {
  return setEmailThreadPinnedServer({ data: { emailThreadId, isPinned } });
}

export function resendEmailMessage(emailMessageId: number) {
  return resendEmailMessageServer({ data: { emailMessageId } });
}

export function createEmailTicket(payload: CreateEmailTicketPayload) {
  return createEmailTicketServer({ data: payload });
}

export function updateEmailTicketStatus(ticketId: number, status: RemoteTicketStatus) {
  return updateEmailTicketStatusServer({ data: { ticketId, status } });
}

export function getWhatsappBlastContacts() {
  return getWhatsappBlastContactsServer();
}

export function getEmailBlastContacts() {
  return getEmailBlastContactsServer();
}

export function getChatBlastHistories() {
  return getChatBlastHistoriesServer();
}

export function getChatBlastHistoryPage(query: ChatBlastHistoryQuery = {}) {
  return getChatBlastHistoryPageServer({ data: query });
}

export function getChatBlastHistory(id: number) {
  return getChatBlastHistoryServer({ data: { id } });
}

export function getEmailBlastDeliveries(id: number) {
  return getEmailBlastDeliveriesServer({ data: { id } });
}

export function sendChatBlast(payload: ChatBlastPayload) {
  return sendChatBlastServer({ data: payload });
}

export function getAdminNotifications() {
  return getAdminNotificationsServer();
}

export function getAdminNotificationUnreadCount() {
  return getAdminNotificationUnreadCountServer();
}

export function markAdminNotificationRead(notificationId: number) {
  return markAdminNotificationReadServer({ data: { notificationId } });
}

export function getRealtimeWebsocketUrl(accessToken?: string | null) {
  const token = accessToken ?? getAccessToken();
  if (!token) return null;

  const url = new URL("/api/realtime/ws", API_ORIGIN);
  url.protocol = url.protocol === "https:" ? "wss:" : "ws:";
  url.searchParams.set("accessToken", token);

  return url.toString();
}
