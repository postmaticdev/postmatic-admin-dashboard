import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { ACCESS_TOKEN_HEADER, ACCESS_TOKEN_KEY, getAccessToken } from "@/lib/auth";
import { toPaginatedResult } from "@/lib/pagination";

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

export interface RemoteAdminActivityLog {
  id: number | string;
  type?: string | null;
  action?: string | null;
  description?: string | null;
  message?: string | null;
  metadata?: unknown;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt?: string | null;
  adminId?: string | null;
  adminName?: string | null;
  adminEmail?: string | null;
  admin?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    imageUrl?: string | null;
    image?: string | null;
  } | null;
  profile?: {
    id?: string | null;
    name?: string | null;
    email?: string | null;
    imageUrl?: string | null;
    image?: string | null;
  } | null;
}

export interface AdminActivityLogQuery {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  dateStart?: string;
  dateEnd?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
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

const getAdminActivityLogsServer = createServerFn({ method: "GET" })
  .validator((data: AdminActivityLogQuery) => data)
  .handler(async ({ data }) => {
    const page = data.page ?? 1;
    const limit = data.limit ?? 20;
    const response = await apiRequest<RemoteAdminActivityLog[]>(
      appendQuery("/api/activity-log/admin", {
        page,
        limit,
        search: data.search ?? "",
        type: data.type,
        dateStart: data.dateStart,
        dateEnd: data.dateEnd,
        sort: data.sort ?? "desc",
        sortBy: data.sortBy ?? "createdAt",
      }),
    );

    return toPaginatedResult(response.data, response.pagination, page, limit);
  });

const getAdminActivityLogFilterTypesServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<string[]>("/api/activity-log/admin/filter-type");
  return Array.isArray(response.data) ? response.data : [];
});

export function getAdminActivityLogs(query: AdminActivityLogQuery = {}) {
  return getAdminActivityLogsServer({ data: query });
}

export function getAdminActivityLogFilterTypes() {
  return getAdminActivityLogFilterTypesServer();
}
