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

export interface RemoteRssFeed {
  id: number | string;
  title?: string | null;
  url?: string | null;
  publisher?: string | null;
  masterRssCategoryId?: number | string | null;
  appRssCategoryId?: number | string | null;
  categoryId?: number | string | null;
  category?: RemoteRssCategory | null;
  masterRssCategory?: RemoteRssCategory | null;
  rssCategory?: RemoteRssCategory | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteRssCategory {
  id: number | string;
  name?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RssFeedQuery {
  category?: string;
  search?: string;
}

export interface RssFeedPayload {
  title: string;
  url: string;
  publisher: string;
  appRssCategoryId: number;
}

export interface RssCategoryPayload {
  name: string;
}

export type GenerativeModelType = "image" | "text";

export interface RemoteGenerativeModel {
  id: number | string;
  model?: string | null;
  label?: string | null;
  image?: string | null;
  provider?: string | null;
  isActive?: boolean | null;
  premiumModel?: boolean | null;
  validRatios?: string[] | null;
  imageSizes?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface GenerativeModelPayload {
  label: string;
  model: string;
  provider: string;
  image?: string;
  isActive: boolean;
  premiumModel?: boolean;
  validRatios?: string[];
  imageSizes?: string[];
}

export interface RemoteReferralRule {
  id: number | string;
  totalDiscount?: number | null;
  discountType?: string | null;
  expiredDays?: number | null;
  maxDiscount?: number | null;
  maxUsage?: number | null;
  rewardPerReferral?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface ReferralRulePayload {
  discountType: "percentage" | "fixed";
  maxDiscount: number | null;
  rewardPerReferral: number;
  totalDiscount: number;
  expiredDays: number | null;
  maxUsage: number | null;
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

async function apiRequest<T>(path: string, init: RequestInit = {}) {
  const hasBody = init.body != null;
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: authHeaders(hasBody),
  });
  const payload = (await response.json().catch(() => null)) as ApiResponse<T> | null;

  if (!response.ok || !payload) {
    throw new Error(
      payload?.responseMessage ||
        payload?.metaData?.message ||
        `Request failed with status ${response.status}`,
    );
  }

  return payload;
}

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

function getPaginationTotalPages(pagination: unknown) {
  if (!pagination || typeof pagination !== "object") return 1;

  const totalPages = (pagination as { totalPages?: unknown }).totalPages;
  return typeof totalPages === "number" && Number.isFinite(totalPages) && totalPages > 0
    ? totalPages
    : 1;
}

async function apiRequestAllPages<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
) {
  let page = 1;
  let totalPages = 1;
  const items: T[] = [];

  do {
    const response = await apiRequest<T[]>(
      appendQuery(path, {
        ...query,
        limit: query.limit ?? 100,
        page,
      }),
    );

    items.push(...(Array.isArray(response.data) ? response.data : []));
    totalPages = getPaginationTotalPages(response.pagination);
    page += 1;
  } while (page <= totalPages && page <= 20);

  return items;
}

function generativeModelPath(type: GenerativeModelType) {
  return type === "image" ? "/api/app/generative-image-model" : "/api/app/generative-text-model";
}

const getRssCategoriesServer = createServerFn({ method: "GET" }).handler(async () => {
  return apiRequestAllPages<RemoteRssCategory>("/api/app/rss/category", {
    limit: 100,
    sort: "asc",
    sortBy: "name",
  });
});

const getRssFeedsServer = createServerFn({ method: "GET" })
  .validator((data: RssFeedQuery = {}) => data)
  .handler(async ({ data }) => {
    return apiRequestAllPages<RemoteRssFeed>("/api/app/rss", {
      limit: 100,
      sort: "asc",
      sortBy: "title",
      category: data.category,
      search: data.search,
    });
  });

const createRssCategoryServer = createServerFn({ method: "POST" })
  .validator((data: RssCategoryPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteRssCategory>("/api/app/rss/category", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const updateRssCategoryServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: RssCategoryPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteRssCategory>(
      `/api/app/rss/category/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteRssCategoryServer = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteRssCategory>(
      `/api/app/rss/category/${encodeURIComponent(data.id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  });

const createRssFeedServer = createServerFn({ method: "POST" })
  .validator((data: RssFeedPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteRssFeed>("/api/app/rss", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const updateRssFeedServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: RssFeedPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteRssFeed>(
      `/api/app/rss/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteRssFeedServer = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteRssFeed>(
      `/api/app/rss/${encodeURIComponent(data.id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  });

const getGenerativeModelsServer = createServerFn({ method: "GET" })
  .validator((data: { type: GenerativeModelType }) => data)
  .handler(async ({ data }) => {
    return apiRequestAllPages<RemoteGenerativeModel>(generativeModelPath(data.type), {
      limit: 100,
      sort: "desc",
      sortBy: "id",
    });
  });

const getGenerativeModelByIdServer = createServerFn({ method: "GET" })
  .validator((data: { type: GenerativeModelType; id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteGenerativeModel>(
      `${generativeModelPath(data.type)}/${encodeURIComponent(data.id)}`,
    );

    return response.data;
  });

const createGenerativeModelServer = createServerFn({ method: "POST" })
  .validator((data: { type: GenerativeModelType; payload: GenerativeModelPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteGenerativeModel>(generativeModelPath(data.type), {
      method: "POST",
      body: JSON.stringify(data.payload),
    });

    return response.data;
  });

const updateGenerativeModelServer = createServerFn({ method: "POST" })
  .validator(
    (data: { type: GenerativeModelType; id: string; payload: GenerativeModelPayload }) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteGenerativeModel>(
      `${generativeModelPath(data.type)}/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteGenerativeModelServer = createServerFn({ method: "POST" })
  .validator((data: { type: GenerativeModelType; id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteGenerativeModel>(
      `${generativeModelPath(data.type)}/${encodeURIComponent(data.id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  });

const getReferralRuleServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteReferralRule>("/api/app/referral-rule");
  return response.data;
});

const upsertReferralRuleServer = createServerFn({ method: "POST" })
  .validator((data: ReferralRulePayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteReferralRule>("/api/app/referral-rule", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

export function getRssCategories() {
  return getRssCategoriesServer();
}

export function getRssFeeds(query: RssFeedQuery = {}) {
  return getRssFeedsServer({ data: query });
}

export function createRssCategory(payload: RssCategoryPayload) {
  return createRssCategoryServer({ data: payload });
}

export function updateRssCategory(id: string, payload: RssCategoryPayload) {
  return updateRssCategoryServer({ data: { id, payload } });
}

export function deleteRssCategory(id: string) {
  return deleteRssCategoryServer({ data: { id } });
}

export function createRssFeed(payload: RssFeedPayload) {
  return createRssFeedServer({ data: payload });
}

export function updateRssFeed(id: string, payload: RssFeedPayload) {
  return updateRssFeedServer({ data: { id, payload } });
}

export function deleteRssFeed(id: string) {
  return deleteRssFeedServer({ data: { id } });
}

export function getGenerativeModels(type: GenerativeModelType) {
  return getGenerativeModelsServer({ data: { type } });
}

export function getGenerativeModelById(type: GenerativeModelType, id: string) {
  return getGenerativeModelByIdServer({ data: { type, id } });
}

export function createGenerativeModel(type: GenerativeModelType, payload: GenerativeModelPayload) {
  return createGenerativeModelServer({ data: { type, payload } });
}

export function updateGenerativeModel(
  type: GenerativeModelType,
  id: string,
  payload: GenerativeModelPayload,
) {
  return updateGenerativeModelServer({ data: { type, id, payload } });
}

export function deleteGenerativeModel(type: GenerativeModelType, id: string) {
  return deleteGenerativeModelServer({ data: { type, id } });
}

export function getReferralRule() {
  return getReferralRuleServer();
}

export function upsertReferralRule(payload: ReferralRulePayload) {
  return upsertReferralRuleServer({ data: payload });
}
