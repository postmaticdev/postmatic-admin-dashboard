import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { ACCESS_TOKEN_HEADER, ACCESS_TOKEN_KEY, getAccessToken } from "@/lib/auth";

const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined)?.trim() ||
  "https://api-staging.postmatic.id";

interface ApiResponse<T> {
  data: T;
  responseMessage?: string;
  metaData?: {
    code?: number;
    message?: string;
  };
  validationErrors?: unknown;
  pagination?: unknown;
}

export type CreatorImageCategoryKind = "type" | "product";

export interface RemoteCreatorImageCategory {
  id: number | string;
  name?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteCreatorLibraryImage {
  id: number | string;
  creatorImageId?: number | string | null;
  creator_image_id?: number | string | null;
  creatorLibraryImageId?: number | string | null;
  creator_library_image_id?: number | string | null;
  libraryImageId?: number | string | null;
  library_image_id?: number | string | null;
  name?: string | null;
  imageUrl?: string | null;
  isPublished?: boolean | null;
  isBanned?: boolean | null;
  bannedReason?: string | null;
  price?: number | string | null;
  productCategoryIds?: Array<number | string> | null;
  typeCategoryIds?: Array<number | string> | null;
  productCategories?: RemoteCreatorImageCategory[] | null;
  typeCategories?: RemoteCreatorImageCategory[] | null;
  creatorName?: string | null;
  profileName?: string | null;
  adminName?: string | null;
  createdBy?: {
    name?: string | null;
    imageUrl?: string | null;
    image?: string | null;
  } | null;
  creatorImage?: {
    id?: number | string | null;
    name?: string | null;
    imageUrl?: string | null;
  } | null;
  libraryImage?: {
    id?: number | string | null;
    name?: string | null;
    imageUrl?: string | null;
  } | null;
  image?: {
    id?: number | string | null;
    imageUrl?: string | null;
    url?: string | null;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreatorLibraryQuery {
  page?: number;
  search?: string;
  sortBy?: string;
  sort?: "asc" | "desc";
  limit?: number;
  isPublished?: boolean;
}

export interface CreatorLibraryPayload {
  name: string;
  imageUrl: string;
  isPublished: boolean;
  price: number;
  productCategoryIds: number[];
  typeCategoryIds: number[];
}

export interface CreatorLibraryModerationPayload {
  isBanned: boolean;
  bannedReason?: string;
}

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

function formatValidationErrors(validationErrors: unknown) {
  if (!validationErrors || typeof validationErrors !== "object") return "";

  return Object.entries(validationErrors as Record<string, unknown>)
    .map(([field, message]) => {
      if (Array.isArray(message)) return `${field}: ${message.join(", ")}`;
      return `${field}: ${String(message)}`;
    })
    .join(", ");
}

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const hasBody = init.body != null;
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: authHeaders(hasBody),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  const metaCode = Number(payload?.metaData?.code ?? response.status);
  const validationMessage = formatValidationErrors(payload?.validationErrors);
  const isPayloadError =
    validationMessage ||
    (Number.isFinite(metaCode) && metaCode >= 400) ||
    payload?.responseMessage?.toLowerCase().includes("validation");

  if (!response.ok || !payload || isPayloadError) {
    throw new Error(
      validationMessage ||
        payload?.responseMessage ||
        payload?.metaData?.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return payload;
}

function appendQuery(path: string, query: Record<string, string | number | boolean | undefined>) {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      params.set(key, String(value));
    }
  });

  const queryString = params.toString();
  return queryString ? `${path}?${queryString}` : path;
}

const getCreatorImageCategoriesServer = createServerFn({ method: "GET" })
  .validator((data: { kind: CreatorImageCategoryKind }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorImageCategory[]>(
      `/api/app/category-creator-image/${data.kind}`,
    );

    return Array.isArray(response.data) ? response.data : [];
  });

const createCreatorImageCategoryServer = createServerFn({ method: "POST" })
  .validator((data: { kind: CreatorImageCategoryKind; name: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorImageCategory>(
      `/api/app/category-creator-image/${data.kind}`,
      {
        method: "POST",
        body: JSON.stringify({ name: data.name }),
      },
    );

    return response.data;
  });

const updateCreatorImageCategoryServer = createServerFn({ method: "POST" })
  .validator((data: { kind: CreatorImageCategoryKind; id: string; name: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorImageCategory>(
      `/api/app/category-creator-image/${data.kind}/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify({ name: data.name }),
      },
    );

    return response.data;
  });

const deleteCreatorImageCategoryServer = createServerFn({ method: "POST" })
  .validator((data: { kind: CreatorImageCategoryKind; id: string }) => data)
  .handler(async ({ data }) => {
    await apiRequest<unknown>(
      `/api/app/category-creator-image/${data.kind}/${encodeURIComponent(data.id)}`,
      {
        method: "DELETE",
      },
    );
  });

const getCreatorLibraryServer = createServerFn({ method: "GET" })
  .validator((data: CreatorLibraryQuery) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorLibraryImage[]>(
      appendQuery("/api/creator/library", {
        page: data.page ?? 1,
        search: data.search ?? "",
        sortBy: data.sortBy ?? "createdAt",
        sort: data.sort ?? "desc",
        limit: data.limit ?? 50,
        isPublished: data.isPublished,
      }),
    );

    return Array.isArray(response.data) ? response.data : [];
  });

const getCreatorLibraryImageServer = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorLibraryImage>(
      `/api/creator/library/${encodeURIComponent(data.id)}`,
    );

    return response.data;
  });

const createCreatorLibraryImageServer = createServerFn({ method: "POST" })
  .validator((data: CreatorLibraryPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorLibraryImage>("/api/creator/library", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const updateCreatorLibraryImageServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: CreatorLibraryPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorLibraryImage>(
      `/api/creator/library/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const moderateCreatorLibraryImageServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: CreatorLibraryModerationPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteCreatorLibraryImage>(
      `/api/creator/library/${encodeURIComponent(data.id)}`,
      {
        method: "PATCH",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteCreatorLibraryImageServer = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    await apiRequest<unknown>(`/api/creator/library/${encodeURIComponent(data.id)}`, {
      method: "DELETE",
    });
  });

export function getCreatorImageCategories(kind: CreatorImageCategoryKind) {
  return getCreatorImageCategoriesServer({ data: { kind } });
}

export function createCreatorImageCategory(kind: CreatorImageCategoryKind, name: string) {
  return createCreatorImageCategoryServer({ data: { kind, name } });
}

export function updateCreatorImageCategory(
  kind: CreatorImageCategoryKind,
  id: string,
  name: string,
) {
  return updateCreatorImageCategoryServer({ data: { kind, id, name } });
}

export function deleteCreatorImageCategory(kind: CreatorImageCategoryKind, id: string) {
  return deleteCreatorImageCategoryServer({ data: { kind, id } });
}

export function getCreatorLibrary(query: CreatorLibraryQuery = {}) {
  return getCreatorLibraryServer({ data: query });
}

export function getPublishedCreatorLibrary(query: Omit<CreatorLibraryQuery, "isPublished"> = {}) {
  return getCreatorLibraryServer({ data: { ...query, isPublished: true } });
}

export function getCreatorLibraryImage(id: string) {
  return getCreatorLibraryImageServer({ data: { id } });
}

export function createCreatorLibraryImage(payload: CreatorLibraryPayload) {
  return createCreatorLibraryImageServer({ data: payload });
}

export function updateCreatorLibraryImage(id: string, payload: CreatorLibraryPayload) {
  return updateCreatorLibraryImageServer({ data: { id, payload } });
}

export function moderateCreatorLibraryImage(id: string, payload: CreatorLibraryModerationPayload) {
  return moderateCreatorLibraryImageServer({ data: { id, payload } });
}

export function deleteCreatorLibraryImage(id: string) {
  return deleteCreatorLibraryImageServer({ data: { id } });
}
