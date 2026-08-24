import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { ACCESS_TOKEN_HEADER, ACCESS_TOKEN_KEY, getAccessToken } from "@/lib/auth";
import { toPaginatedResult, type PaginatedResult } from "@/lib/pagination";

const API_ORIGIN =
  (import.meta.env.VITE_API_ORIGIN as string | undefined)?.trim() ||
  "https://api-staging.postmatic.id";

export type DocumentationType = "information" | "legality";

interface ApiResponse<T> {
  data: T;
  responseMessage?: string;
  metaData?: {
    code?: number;
    message?: string;
  };
  validationErrors?: unknown;
  filterQuery?: unknown;
  pagination?: unknown;
}

export interface DocumentationListQuery {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  sortBy?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
}

export interface RemoteDocumentationCategorySummary {
  id: number | string;
  slug?: string | null;
  name?: string | null;
  type?: DocumentationType | string | null;
  isActive?: boolean | null;
}

export interface RemoteDocumentationTocArticle {
  id: number | string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  isActive?: boolean | null;
}

export interface RemoteDocumentationCategory extends RemoteDocumentationCategorySummary {
  documentations?: RemoteDocumentationTocArticle[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteDocumentation {
  id: number | string;
  slug?: string | null;
  title?: string | null;
  description?: string | null;
  icon?: string | null;
  article?: string | null;
  type?: DocumentationType | string | null;
  appDocumentationCategoryId?: number | string | null;
  category?: RemoteDocumentationCategorySummary | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface DocumentationPayload {
  slug: string;
  title: string;
  description: string;
  icon: string;
  article: string;
  appDocumentationCategoryId: number;
  isActive: boolean;
}

export interface DocumentationCategoryPayload {
  slug: string;
  name: string;
  isActive: boolean;
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
    .map(([field, message]) => `${field}: ${String(message)}`)
    .join(", ");
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
    const validationMessage = formatValidationErrors(payload?.validationErrors);

    throw new Error(
      validationMessage ||
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
    if (hasNextPage === false) return false;
  }

  return currentPage < totalPages;
}

async function apiRequestAllPages<T>(
  path: string,
  query: Record<string, string | number | undefined> = {},
) {
  let page = 1;
  let totalPages = 1;
  let hasNextPage = true;
  const items: T[] = [];

  do {
    const response = await apiRequest<T[]>(
      appendQuery(path, {
        ...query,
        limit: query.limit ?? 100,
        page,
      }),
    );

    items.push(...(response.data ?? []));
    totalPages = getPaginationTotalPages(response.pagination);
    hasNextPage = getPaginationHasNextPage(response.pagination, page, totalPages);
    page += 1;
  } while (hasNextPage && page <= 20);

  return items;
}

function articlePath(type: DocumentationType) {
  return `/api/app/documentation/${type}`;
}

function categoryPath(type: DocumentationType) {
  return `/api/app/documentation/${type}-category`;
}

function tocPath(type: DocumentationType) {
  return `/api/app/documentation/${type}-table-of-contents`;
}

const getDocumentationsServer = createServerFn({ method: "POST" })
  .validator((data: DocumentationListQuery & { type: DocumentationType }) => data)
  .handler(async ({ data }) => {
    const { type, ...query } = data;

    return apiRequestAllPages<RemoteDocumentation>(articlePath(type), {
      limit: 100,
      sort: "desc",
      sortBy: "id",
      ...query,
    });
  });

const getDocumentationPageServer = createServerFn({ method: "POST" })
  .validator((data: DocumentationListQuery & { type: DocumentationType }) => data)
  .handler(async ({ data }): Promise<PaginatedResult<RemoteDocumentation>> => {
    const { type, ...query } = data;
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const response = await apiRequest<RemoteDocumentation[]>(
      appendQuery(articlePath(type), {
        limit,
        page,
        sort: "desc",
        sortBy: "id",
        ...query,
      }),
    );

    return toPaginatedResult(response.data, response.pagination, page, limit);
  });

const getDocumentationByIdServer = createServerFn({ method: "POST" })
  .validator((data: { type: DocumentationType; id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentation>(
      `${articlePath(data.type)}/${encodeURIComponent(data.id)}`,
    );

    return response.data;
  });

const getDocumentationCategoriesServer = createServerFn({ method: "POST" })
  .validator((data: DocumentationListQuery & { type: DocumentationType }) => data)
  .handler(async ({ data }) => {
    const { type, ...query } = data;

    return apiRequestAllPages<RemoteDocumentationCategory>(categoryPath(type), {
      limit: 100,
      sort: "desc",
      sortBy: "id",
      ...query,
    });
  });

const getDocumentationTableOfContentsServer = createServerFn({ method: "POST" })
  .validator((data: { type: DocumentationType }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentationCategory[]>(tocPath(data.type));
    return response.data ?? [];
  });

const getDocumentationArticleBySlugServer = createServerFn({ method: "POST" })
  .validator((data: { categorySlug: string; articleSlug: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentation>(
      `/api/app/documentation/article/${encodeURIComponent(data.categorySlug)}/${encodeURIComponent(
        data.articleSlug,
      )}`,
    );

    return response.data;
  });

const getDocumentationArticlesByCategorySlugServer = createServerFn({ method: "POST" })
  .validator((data: DocumentationListQuery & { categorySlug: string }) => data)
  .handler(async ({ data }) => {
    const { categorySlug, ...query } = data;
    const response = await apiRequest<RemoteDocumentationCategory>(
      appendQuery(`/api/app/documentation/article/${encodeURIComponent(categorySlug)}`, {
        limit: 100,
        page: 1,
        sort: "desc",
        sortBy: "id",
        ...query,
      }),
    );

    return response.data;
  });

const createDocumentationServer = createServerFn({ method: "POST" })
  .validator((data: { type: DocumentationType; payload: DocumentationPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentation>(articlePath(data.type), {
      method: "POST",
      body: JSON.stringify(data.payload),
    });

    return response.data;
  });

const updateDocumentationServer = createServerFn({ method: "POST" })
  .validator((data: { type: DocumentationType; id: string; payload: DocumentationPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentation>(
      `${articlePath(data.type)}/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteDocumentationServer = createServerFn({ method: "POST" })
  .validator((data: { type: DocumentationType; id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentation>(
      `${articlePath(data.type)}/${encodeURIComponent(data.id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  });

const createDocumentationCategoryServer = createServerFn({ method: "POST" })
  .validator((data: { type: DocumentationType; payload: DocumentationCategoryPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentationCategory>(categoryPath(data.type), {
      method: "POST",
      body: JSON.stringify(data.payload),
    });

    return response.data;
  });

const updateDocumentationCategoryServer = createServerFn({ method: "POST" })
  .validator(
    (data: { type: DocumentationType; id: string; payload: DocumentationCategoryPayload }) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentationCategory>(
      `${categoryPath(data.type)}/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteDocumentationCategoryServer = createServerFn({ method: "POST" })
  .validator((data: { type: DocumentationType; id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteDocumentationCategory>(
      `${categoryPath(data.type)}/${encodeURIComponent(data.id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  });

export function getDocumentations(type: DocumentationType, query: DocumentationListQuery = {}) {
  return getDocumentationsServer({ data: { type, ...query } });
}

export function getDocumentationPage(type: DocumentationType, query: DocumentationListQuery = {}) {
  return getDocumentationPageServer({ data: { type, ...query } });
}

export function getDocumentationById(type: DocumentationType, id: string) {
  return getDocumentationByIdServer({ data: { type, id } });
}

export function getDocumentationCategories(
  type: DocumentationType,
  query: DocumentationListQuery = {},
) {
  return getDocumentationCategoriesServer({ data: { type, ...query } });
}

export function getDocumentationTableOfContents(type: DocumentationType) {
  return getDocumentationTableOfContentsServer({ data: { type } });
}

export function getDocumentationArticleBySlug(categorySlug: string, articleSlug: string) {
  return getDocumentationArticleBySlugServer({ data: { categorySlug, articleSlug } });
}

export function getDocumentationArticlesByCategorySlug(
  categorySlug: string,
  query: DocumentationListQuery = {},
) {
  return getDocumentationArticlesByCategorySlugServer({
    data: { categorySlug, ...query },
  });
}

export function createDocumentation(type: DocumentationType, payload: DocumentationPayload) {
  return createDocumentationServer({ data: { type, payload } });
}

export function updateDocumentation(
  type: DocumentationType,
  id: string,
  payload: DocumentationPayload,
) {
  return updateDocumentationServer({ data: { type, id, payload } });
}

export function deleteDocumentation(type: DocumentationType, id: string) {
  return deleteDocumentationServer({ data: { type, id } });
}

export function createDocumentationCategory(
  type: DocumentationType,
  payload: DocumentationCategoryPayload,
) {
  return createDocumentationCategoryServer({ data: { type, payload } });
}

export function updateDocumentationCategory(
  type: DocumentationType,
  id: string,
  payload: DocumentationCategoryPayload,
) {
  return updateDocumentationCategoryServer({ data: { type, id, payload } });
}

export function deleteDocumentationCategory(type: DocumentationType, id: string) {
  return deleteDocumentationCategoryServer({ data: { type, id } });
}
