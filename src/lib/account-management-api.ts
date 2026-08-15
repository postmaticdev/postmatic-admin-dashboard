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

export type ManagedProfileRole = "user" | "admin";

export interface RemoteManagedProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  imageUrl?: string | null;
  image?: string | null;
  avatarUrl?: string | null;
  photoUrl?: string | null;
  picture?: string | null;
  profilePictureUrl?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  description?: string | null;
  role?: string | null;
  isBanned?: boolean | null;
  hasCredentialProvider?: boolean | null;
  hasGoogleProvider?: boolean | null;
  credentialVerifiedAt?: string | null;
  googleVerifiedAt?: string | null;
  hasEverTopupImageToken?: boolean | null;
  successTopupCount?: number | null;
  successTopupTokenAmount?: number | null;
  successTopupTotalAmount?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteManagedProfileDetail {
  profile?: RemoteManagedProfile | null;
  businesses?: unknown[] | null;
  creatorImages?: {
    total?: number | null;
    data?: unknown[] | null;
  } | null;
}

export interface RemoteUserManageOverview {
  totalProfiles?: number | null;
  totalAdminProfiles?: number | null;
  totalUserProfiles?: number | null;
  totalBannedProfiles?: number | null;
  newProfilesLast7Days?: number | null;
  newProfilesLast30Days?: number | null;
  profilesWithCredentialProvider?: number | null;
  profilesWithGoogleProvider?: number | null;
  profilesWithVerifiedCredential?: number | null;
  profilesWithBusinessMembership?: number | null;
  totalCreatorImagesUploadedByProfiles?: number | null;
  profilesWithCreatorImages?: number | null;
}

export interface ManagedProfileListQuery {
  role?: ManagedProfileRole;
  search?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
  limit?: number;
}

export interface CreateManagedUserPayload {
  email: string;
  name: string;
  password: string;
  role: ManagedProfileRole;
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

const getManagedProfilesServer = createServerFn({ method: "GET" })
  .validator((data: ManagedProfileListQuery) => data)
  .handler(async ({ data }) => {
    return apiRequestAllPages<RemoteManagedProfile>("/api/user/manage", {
      limit: 100,
      sort: "desc",
      sortBy: "createdAt",
      ...data,
    });
  });

const getManagedProfileByIdServer = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteManagedProfileDetail>(
      `/api/user/manage/${encodeURIComponent(data.id)}`,
    );

    return response.data;
  });

const getUserManageOverviewServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteUserManageOverview>("/api/user/manage/overview");
  return response.data;
});

const createManagedUserServer = createServerFn({ method: "POST" })
  .validator((data: CreateManagedUserPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteManagedProfile>("/api/user/manage", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const updateManagedProfileRoleServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; role: ManagedProfileRole }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteManagedProfile>(
      `/api/user/manage/${encodeURIComponent(data.id)}/update-role`,
      {
        method: "PUT",
        body: JSON.stringify({ role: data.role }),
      },
    );

    return response.data;
  });

const updateManagedProfileBanServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; isBanned: boolean }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteManagedProfile>(
      `/api/user/manage/${encodeURIComponent(data.id)}/banned`,
      {
        method: "PUT",
        body: JSON.stringify({ isBanned: data.isBanned }),
      },
    );

    return response.data;
  });

export function getManagedProfiles(query: ManagedProfileListQuery = {}) {
  return getManagedProfilesServer({ data: query });
}

export function getManagedProfileById(id: string) {
  return getManagedProfileByIdServer({ data: { id } });
}

export function getUserManageOverview() {
  return getUserManageOverviewServer();
}

export function createManagedUser(payload: CreateManagedUserPayload) {
  return createManagedUserServer({ data: payload });
}

export function updateManagedProfileRole(id: string, role: ManagedProfileRole) {
  return updateManagedProfileRoleServer({ data: { id, role } });
}

export function updateManagedProfileBan(id: string, isBanned: boolean) {
  return updateManagedProfileBanServer({ data: { id, isBanned } });
}
