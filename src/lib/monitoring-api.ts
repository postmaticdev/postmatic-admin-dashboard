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
}

export interface RemoteWahaHealth {
  healthy?: boolean | null;
  session?: string | null;
  sessionStatus?: string | null;
  errorCode?: string | null;
  errorMessage?: string | null;
  discordNotificationSent?: boolean | null;
  checkedAt?: string | null;
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
    cache: "no-store",
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

const getWahaHealthServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteWahaHealth>("/api/monitoring/waha/check");
  return response.data;
});

const notifyWahaHealthServer = createServerFn({ method: "POST" }).handler(async () => {
  const response = await apiRequest<RemoteWahaHealth>("/api/monitoring/waha/check", {
    method: "POST",
  });
  return response.data;
});

export function getWahaHealth() {
  return getWahaHealthServer();
}

export function notifyWahaHealth() {
  return notifyWahaHealthServer();
}
