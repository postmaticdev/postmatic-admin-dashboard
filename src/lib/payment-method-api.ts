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

export interface RemotePaymentMethod {
  id: number | string;
  code?: string | null;
  name?: string | null;
  type?: string | null;
  image?: string | null;
  taxFee?: number | null;
  adminType?: string | null;
  adminFee?: number | null;
  isActive?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface PaymentMethodPayload {
  adminType: "fixed" | "percentage";
  code: string;
  name: string;
  type: string;
  taxFee: number;
  adminFee: number;
  image?: string;
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

    items.push(...(response.data ?? []));
    totalPages = getPaginationTotalPages(response.pagination);
    page += 1;
  } while (page <= totalPages && page <= 20);

  return items;
}

const getPaymentMethodsServer = createServerFn({ method: "GET" }).handler(async () => {
  return apiRequestAllPages<RemotePaymentMethod>("/api/app/payment-method", {
    limit: 100,
    sort: "desc",
    sortBy: "id",
  });
});

const getPaymentMethodByIdServer = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemotePaymentMethod>(
      `/api/app/payment-method/${encodeURIComponent(data.id)}`,
    );

    return response.data;
  });

const createPaymentMethodServer = createServerFn({ method: "POST" })
  .validator((data: PaymentMethodPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemotePaymentMethod>("/api/app/payment-method", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const updatePaymentMethodServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: PaymentMethodPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemotePaymentMethod>(
      `/api/app/payment-method/${encodeURIComponent(data.id)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deletePaymentMethodServer = createServerFn({ method: "POST" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemotePaymentMethod>(
      `/api/app/payment-method/${encodeURIComponent(data.id)}`,
      {
        method: "DELETE",
      },
    );

    return response.data;
  });

export function getPaymentMethods() {
  return getPaymentMethodsServer();
}

export function getPaymentMethodById(id: string) {
  return getPaymentMethodByIdServer({ data: { id } });
}

export function createPaymentMethod(payload: PaymentMethodPayload) {
  return createPaymentMethodServer({ data: payload });
}

export function updatePaymentMethod(id: string, payload: PaymentMethodPayload) {
  return updatePaymentMethodServer({ data: { id, payload } });
}

export function deletePaymentMethod(id: string) {
  return deletePaymentMethodServer({ data: { id } });
}
