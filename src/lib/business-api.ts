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

export interface RemoteBusinessProfile {
  id?: string | null;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  imageUrl?: string | null;
}

export interface RemoteBusinessMember {
  id?: number | string | null;
  role?: string | null;
  status?: string | null;
  profile?: RemoteBusinessProfile | null;
}

export interface RemoteManagedBusiness {
  id: number | string;
  name?: string | null;
  primaryLogoUrl?: string | null;
  logoUrl?: string | null;
  imageUrl?: string | null;
  category?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  colorTone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  ownerName?: string | null;
  businessPhone?: string | null;
  countryCode?: string | null;
  members?: RemoteBusinessMember[] | null;
  userPosition?: RemoteBusinessMember | null;
}

export interface RemoteBusinessKnowledge {
  rootBusinessId?: number | string | null;
  name?: string | null;
  primaryLogoUrl?: string | null;
  category?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  colorTone?: string | null;
  businessPhone?: string | null;
  countryCode?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteManagedBusinessDetail {
  businessRoot?: RemoteManagedBusiness | null;
  knowledge?: RemoteBusinessKnowledge | null;
  connectedPlatforms?: unknown[] | null;
  imageContents?: unknown[] | null;
  members?: RemoteBusinessMember[] | null;
  products?: unknown[] | null;
  role?: unknown;
  rssSubscriptions?: unknown[] | null;
  timezonePreference?: unknown;
}

export interface RemoteBusinessManageOverview {
  totalBusinesses?: number | null;
  newBusinessesLast7Days?: number | null;
  newBusinessesLast30Days?: number | null;
  businessesEverTopUp?: number | null;
  freeBusinesses?: number | null;
  totalTopupTokenAmount?: number | null;
  totalTopupRevenueAmount?: number | null;
}

export interface RemoteImageTokenStatus {
  availableToken?: number | null;
  usedToken?: number | null;
  totalToken?: number | null;
  isExhausted?: boolean | null;
  hasEverTopUp?: boolean | null;
}

export interface RemoteImageTokenTransaction {
  id: number | string;
  type?: string | null;
  amount?: number | null;
  profileId?: string | null;
  businessRootId?: number | string | null;
  paymentHistoryId?: number | string | null;
  createdAt?: string | null;
}

export interface RemoteImageTokenUsagePoint {
  dateStart?: string | null;
  dateEnd?: string | null;
  totalUsage?: number | null;
}

export interface RemoteImageTokenUsageChart {
  rangeStart?: string | null;
  rangeEnd?: string | null;
  limit?: number | null;
  data?: RemoteImageTokenUsagePoint[] | null;
}

export interface RemoteImageTokenInjection {
  id: number | string;
  businessRootId?: number | string | null;
  amount?: number | null;
  bonusType?: string | null;
  injectedBy?: string | null;
  createdAt?: string | null;
}

export interface RemoteBusinessTokenOverview {
  business: RemoteManagedBusiness;
  detail: RemoteManagedBusinessDetail | null;
  tokenStatus: RemoteImageTokenStatus | null;
}

export interface RemoteBusinessDashboardData {
  businesses: RemoteBusinessTokenOverview[];
  overview: RemoteBusinessManageOverview | null;
}

export interface ImageTokenHistoryQuery {
  businessRootId: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
  limit?: number;
}

export interface ImageTokenUsageQuery {
  businessRootId: string;
  dateStart?: string;
  dateEnd?: string;
  limit?: number;
}

export interface ImageTokenInjectionHistoryQuery {
  businessRootId?: string;
  search?: string;
  category?: string;
  dateStart?: string;
  dateEnd?: string;
  sort?: "asc" | "desc";
  sortBy?: string;
  limit?: number;
}

export interface ImageTokenInjectionPayload {
  businessRootId: number;
  amount: number;
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

function sortByLatestCreatedAt<T extends { id?: number | string; createdAt?: string | null }>(
  left: T,
  right: T,
) {
  const leftDate = left.createdAt ? new Date(left.createdAt).getTime() : 0;
  const rightDate = right.createdAt ? new Date(right.createdAt).getTime() : 0;

  if (rightDate !== leftDate) return rightDate - leftDate;
  return Number(right.id ?? 0) - Number(left.id ?? 0);
}

async function getManagedBusinessesInternal() {
  return apiRequestAllPages<RemoteManagedBusiness>("/api/business/manage", {
    limit: 100,
    sort: "desc",
    sortBy: "id",
  });
}

async function getManagedBusinessByIdInternal(id: string) {
  const response = await apiRequest<RemoteManagedBusinessDetail>(
    `/api/business/manage/${encodeURIComponent(id)}`,
  );

  return response.data;
}

async function getBusinessManageOverviewInternal() {
  const response = await apiRequest<RemoteBusinessManageOverview>("/api/business/manage/overview");
  return response.data;
}

async function getImageTokenStatusInternal(businessRootId: string) {
  const response = await apiRequest<RemoteImageTokenStatus>(
    `/api/generative-token/image-token/${encodeURIComponent(businessRootId)}/status`,
  );

  return response.data;
}

async function getImageTokenInjectionHistoriesInternal(
  query: ImageTokenInjectionHistoryQuery = {},
) {
  return apiRequestAllPages<RemoteImageTokenInjection>(
    "/api/generative-token/image-token/injection",
    {
      sort: "desc",
      sortBy: "id",
      ...query,
    },
  );
}

async function getBusinessTokenOverviewsInternal() {
  const businesses = (await getManagedBusinessesInternal()).filter(
    (business) => business.id != null,
  );

  const [detailResults, statusResults] = await Promise.all([
    Promise.allSettled(
      businesses.map((business) => getManagedBusinessByIdInternal(String(business.id))),
    ),
    Promise.allSettled(
      businesses.map((business) => getImageTokenStatusInternal(String(business.id))),
    ),
  ]);

  return businesses.map<RemoteBusinessTokenOverview>((business, index) => {
    const detailResult = detailResults[index];
    const statusResult = statusResults[index];

    return {
      business,
      detail: detailResult?.status === "fulfilled" ? detailResult.value : null,
      tokenStatus: statusResult?.status === "fulfilled" ? statusResult.value : null,
    };
  });
}

const getBusinessDashboardDataServer = createServerFn({ method: "GET" }).handler(async () => {
  const [businessesResult, overviewResult] = await Promise.allSettled([
    getBusinessTokenOverviewsInternal(),
    getBusinessManageOverviewInternal(),
  ]);

  if (businessesResult.status === "rejected") {
    throw businessesResult.reason;
  }

  return {
    businesses: businessesResult.value,
    overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
  } satisfies RemoteBusinessDashboardData;
});

const getManagedBusinessByIdServer = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) => getManagedBusinessByIdInternal(data.id));

const getImageTokenHistoryServer = createServerFn({ method: "GET" })
  .validator((data: ImageTokenHistoryQuery) => data)
  .handler(async ({ data }) => {
    const { businessRootId, ...query } = data;

    return apiRequestAllPages<RemoteImageTokenTransaction>(
      `/api/generative-token/image-token/${encodeURIComponent(businessRootId)}`,
      {
        sort: "desc",
        sortBy: "id",
        ...query,
      },
    );
  });

const getImageTokenStatusServer = createServerFn({ method: "GET" })
  .validator((data: { businessRootId: string }) => data)
  .handler(async ({ data }) => getImageTokenStatusInternal(data.businessRootId));

const getImageTokenUsageServer = createServerFn({ method: "GET" })
  .validator((data: ImageTokenUsageQuery) => data)
  .handler(async ({ data }) => {
    const { businessRootId, ...query } = data;
    const response = await apiRequest<RemoteImageTokenUsageChart>(
      appendQuery(
        `/api/generative-token/image-token/${encodeURIComponent(businessRootId)}/usage-chart`,
        query,
      ),
    );

    return response.data;
  });

const getImageTokenInjectionHistoriesServer = createServerFn({ method: "GET" })
  .validator((data: ImageTokenInjectionHistoryQuery) => data)
  .handler(async ({ data }) => getImageTokenInjectionHistoriesInternal(data));

const getImageTokenInjectionHistoriesForBusinessesServer = createServerFn({ method: "GET" })
  .validator((data: { businessRootIds: string[] }) => data)
  .handler(async ({ data }) => {
    const businessRootIds = Array.from(new Set(data.businessRootIds.filter(Boolean)));

    try {
      const histories = await getImageTokenInjectionHistoriesInternal();
      if (histories.length > 0 || businessRootIds.length === 0) {
        return histories.sort(sortByLatestCreatedAt);
      }
    } catch (error) {
      if (businessRootIds.length === 0) throw error;
    }

    const results = await Promise.allSettled(
      businessRootIds.map((businessRootId) =>
        getImageTokenInjectionHistoriesInternal({ businessRootId }),
      ),
    );
    const histories = results.flatMap((result) =>
      result.status === "fulfilled" ? result.value : [],
    );
    const uniqueHistories = Array.from(
      new Map(histories.map((history) => [String(history.id), history])).values(),
    );

    return uniqueHistories.sort(sortByLatestCreatedAt);
  });

const injectImageTokenServer = createServerFn({ method: "POST" })
  .validator((data: ImageTokenInjectionPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteImageTokenInjection>(
      "/api/generative-token/image-token/injection",
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );

    return response.data;
  });

export function getBusinessDashboardData() {
  return getBusinessDashboardDataServer();
}

export function getManagedBusinessById(id: string) {
  return getManagedBusinessByIdServer({ data: { id } });
}

export function getImageTokenHistory(query: ImageTokenHistoryQuery) {
  return getImageTokenHistoryServer({ data: query });
}

export function getImageTokenStatus(businessRootId: string) {
  return getImageTokenStatusServer({ data: { businessRootId } });
}

export function getImageTokenUsage(query: ImageTokenUsageQuery) {
  return getImageTokenUsageServer({ data: query });
}

export function getImageTokenInjectionHistories(query: ImageTokenInjectionHistoryQuery = {}) {
  return getImageTokenInjectionHistoriesServer({ data: query });
}

export function getImageTokenInjectionHistoriesForBusinesses(businessRootIds: string[]) {
  return getImageTokenInjectionHistoriesForBusinessesServer({ data: { businessRootIds } });
}

export function injectImageToken(payload: ImageTokenInjectionPayload) {
  return injectImageTokenServer({ data: payload });
}
