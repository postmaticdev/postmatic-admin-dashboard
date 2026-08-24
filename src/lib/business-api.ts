import { createServerFn } from "@tanstack/react-start";
import { getRequestHeader } from "@tanstack/react-start/server";

import { ACCESS_TOKEN_HEADER, ACCESS_TOKEN_KEY, getAccessToken } from "@/lib/auth";
import { toPaginatedResult, type PaginationMeta } from "@/lib/pagination";

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
  owner?: RemoteBusinessProfile | null;
  ownerProfile?: RemoteBusinessProfile | null;
  plan?: string | null;
  status?: string | null;
  tokenStatus?: RemoteImageTokenStatus | null;
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

export interface RemoteBusinessProduct {
  id: number | string;
  businessRootId?: number | string | null;
  name?: string | null;
  category?: string | null;
  description?: string | null;
  price?: number | string | null;
  currency?: string | null;
  imageUrls?: string[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteBusinessRoleKnowledge {
  businessRootId?: number | string | null;
  hashtags?: string[] | null;
  targetAudience?: string | null;
  tone?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteBusinessRssSubscription {
  id: number | string;
  businessRootId?: number | string | null;
  title?: string | null;
  appRssId?: number | string | null;
  isActive?: boolean | null;
  appRssFeed?: {
    id?: number | string | null;
    title?: string | null;
    url?: string | null;
    publisher?: string | null;
    appRssCategory?: {
      id?: number | string | null;
      name?: string | null;
    } | null;
  } | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteBusinessAvatar {
  id: number | string;
  name?: string | null;
  imageUrl?: string | null;
  appAvatarId?: number | string | null;
  businessRootId?: number | string | null;
  rootBusinessId?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface RemoteManagedBusinessDetail {
  businessRoot?: RemoteManagedBusiness | null;
  knowledge?: RemoteBusinessKnowledge | null;
  connectedPlatforms?: unknown[] | null;
  imageContents?: unknown[] | null;
  members?: RemoteBusinessMember[] | null;
  products?: RemoteBusinessProduct[] | null;
  role?: RemoteBusinessRoleKnowledge | null;
  rssSubscriptions?: RemoteBusinessRssSubscription[] | null;
  avatars?: RemoteBusinessAvatar[] | null;
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
  priceAmount?: number | null;
  priceCurrency?: string | null;
  bonusType?: string | null;
  injectedBy?: string | null;
  injectedByProfile?: RemoteBusinessProfile | null;
  businessRoot?: RemoteManagedBusiness | null;
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

export interface RemoteBusinessDashboardPageData extends RemoteBusinessDashboardData {
  pagination: PaginationMeta;
}

export interface RemoteImageTokenInjectionOverview {
  totalInjectedTokenAmount?: number | null;
  totalInjectedTokenTransaction?: number | null;
  totalBusinessInjectedToken?: number | null;
}

export interface RemoteImageTokenInjectionDashboardData {
  histories: RemoteImageTokenInjection[];
  overview: RemoteImageTokenInjectionOverview | null;
}

export interface RemoteImageTokenInjectionDashboardPageData extends RemoteImageTokenInjectionDashboardData {
  pagination: PaginationMeta;
}

export interface RemoteTokenProduct {
  id?: number | string | null;
  type?: string | null;
  currencyCode?: string | null;
  priceAmount?: number | string | null;
  tokenAmount?: number | string | null;
  amount?: number | string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface BusinessKnowledgePayload {
  name: string;
  category: string;
  primaryLogoUrl?: string;
  description?: string;
  websiteUrl?: string;
  colorTone?: string;
  businessPhone?: string;
  countryCode?: string;
}

export interface BusinessProductPayload {
  name: string;
  category: string;
  description: string;
  price: number;
  currency: string;
  imageUrls: string[];
}

export interface BusinessRoleKnowledgePayload {
  hashtags: string[];
  targetAudience: string;
  tone: string;
}

export interface CreateManagedBusinessPayload {
  ownerEmail: string;
  knowledge: {
    category: string;
    description: string;
    name: string;
    primaryLogoUrl: string;
    websiteUrl?: string;
    colorTone: string;
    businessPhone: string;
    countryCode: string;
  };
  role: BusinessRoleKnowledgePayload;
  products: BusinessProductPayload[];
}

export interface CreateManagedBusinessResult {
  id: number | string;
}

export interface BusinessAvatarPayload {
  name: string;
  imageUrl: string;
}

export interface BusinessRssSubscriptionPayload {
  appRssFeedId: number;
  isActive: boolean;
  title: string;
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

export interface BusinessListQuery {
  search?: string;
  page?: number;
  limit?: number;
  sort?: "asc" | "desc";
  sortBy?: string;
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
  page?: number;
  limit?: number;
}

export interface ImageTokenInjectionPayload {
  businessRootId: number;
  amount: number;
}

export interface TokenProductPayload {
  type: "image_token";
  currencyCode: string;
  priceAmount: number;
  tokenAmount: number;
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

async function getManagedBusinessPageInternal(query: BusinessListQuery = {}) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const response = await apiRequest<RemoteManagedBusiness[]>(
    appendQuery("/api/business/manage", {
      sort: "desc",
      sortBy: "id",
      ...query,
      page,
      limit,
    }),
  );

  return toPaginatedResult(response.data, response.pagination, page, limit);
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

async function getImageTokenInjectionHistoryPageInternal(
  query: ImageTokenInjectionHistoryQuery = {},
) {
  const page = query.page ?? 1;
  const limit = query.limit ?? 20;
  const response = await apiRequest<RemoteImageTokenInjection[]>(
    appendQuery("/api/generative-token/image-token/injection", {
      sort: "desc",
      sortBy: "id",
      ...query,
      page,
      limit,
    }),
  );

  return toPaginatedResult(response.data, response.pagination, page, limit);
}

async function getImageTokenInjectionOverviewInternal() {
  const response = await apiRequest<RemoteImageTokenInjectionOverview>(
    "/api/generative-token/image-token/injection/overview",
  );

  return response.data;
}

async function enrichBusinessTokenOverviews(businesses: RemoteManagedBusiness[]) {
  const validBusinesses = businesses.filter((business) => business.id != null);
  const missingStatusBusinesses = validBusinesses.filter((business) => !business.tokenStatus);
  const statusResults = await Promise.allSettled(
    missingStatusBusinesses.map((business) => getImageTokenStatusInternal(String(business.id))),
  );
  const statusByBusinessId = new Map(
    missingStatusBusinesses.map((business, index) => {
      const result = statusResults[index];
      return [String(business.id), result?.status === "fulfilled" ? result.value : null] as const;
    }),
  );

  return validBusinesses.map<RemoteBusinessTokenOverview>((business) => ({
    business,
    detail: null,
    tokenStatus: business.tokenStatus ?? statusByBusinessId.get(String(business.id)) ?? null,
  }));
}

async function getBusinessTokenOverviewsInternal() {
  return enrichBusinessTokenOverviews(await getManagedBusinessesInternal());
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

const getBusinessDashboardPageServer = createServerFn({ method: "GET" })
  .validator((data: BusinessListQuery = {}) => data)
  .handler(async ({ data }) => {
    const [businessesResult, overviewResult] = await Promise.allSettled([
      getManagedBusinessPageInternal(data),
      getBusinessManageOverviewInternal(),
    ]);

    if (businessesResult.status === "rejected") {
      throw businessesResult.reason;
    }

    return {
      businesses: await enrichBusinessTokenOverviews(businessesResult.value.items),
      overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
      pagination: businessesResult.value.pagination,
    } satisfies RemoteBusinessDashboardPageData;
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

const getImageTokenInjectionDashboardDataServer = createServerFn({ method: "GET" }).handler(
  async () => {
    const [historiesResult, overviewResult] = await Promise.allSettled([
      getImageTokenInjectionHistoriesInternal(),
      getImageTokenInjectionOverviewInternal(),
    ]);

    if (historiesResult.status === "rejected") {
      throw historiesResult.reason;
    }

    return {
      histories: historiesResult.value.sort(sortByLatestCreatedAt),
      overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
    } satisfies RemoteImageTokenInjectionDashboardData;
  },
);

const getImageTokenInjectionDashboardPageServer = createServerFn({ method: "GET" })
  .validator((data: ImageTokenInjectionHistoryQuery = {}) => data)
  .handler(async ({ data }) => {
    const [historiesResult, overviewResult] = await Promise.allSettled([
      getImageTokenInjectionHistoryPageInternal(data),
      getImageTokenInjectionOverviewInternal(),
    ]);

    if (historiesResult.status === "rejected") {
      throw historiesResult.reason;
    }

    return {
      histories: historiesResult.value.items.sort(sortByLatestCreatedAt),
      overview: overviewResult.status === "fulfilled" ? overviewResult.value : null,
      pagination: historiesResult.value.pagination,
    } satisfies RemoteImageTokenInjectionDashboardPageData;
  });

const getImageTokenProductPriceServer = createServerFn({ method: "GET" }).handler(async () => {
  const response = await apiRequest<RemoteTokenProduct>(
    appendQuery("/api/app/token-product", {
      amount: 1000,
      currencyCode: "IDR",
      from: "price",
      type: "image_token",
    }),
  );

  return response.data;
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

const upsertImageTokenProductServer = createServerFn({ method: "POST" })
  .validator((data: TokenProductPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteTokenProduct>("/api/app/token-product", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const createManagedBusinessServer = createServerFn({ method: "POST" })
  .validator((data: CreateManagedBusinessPayload) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<CreateManagedBusinessResult>("/api/business/manage", {
      method: "POST",
      body: JSON.stringify(data),
    });

    return response.data;
  });

const upsertManagedBusinessKnowledgeServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: BusinessKnowledgePayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteBusinessKnowledge>(
      `/api/business/manage/${encodeURIComponent(data.id)}/knowledge`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const getManagedBusinessAvatarsServer = createServerFn({ method: "GET" })
  .validator((data: { id: string }) => data)
  .handler(async ({ data }) =>
    apiRequestAllPages<RemoteBusinessAvatar>(
      `/api/business/avatar/${encodeURIComponent(data.id)}`,
      {
        limit: 100,
        sort: "desc",
        sortBy: "id",
      },
    ),
  );

const upsertManagedBusinessRoleKnowledgeServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: BusinessRoleKnowledgePayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteBusinessRoleKnowledge>(
      `/api/business/role/${encodeURIComponent(data.id)}`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const createManagedBusinessProductServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: BusinessProductPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteBusinessProduct>(
      `/api/business/manage/${encodeURIComponent(data.id)}/product`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const updateManagedBusinessProductServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; productId: string; payload: BusinessProductPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteBusinessProduct>(
      `/api/business/manage/${encodeURIComponent(data.id)}/product/${encodeURIComponent(data.productId)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteManagedBusinessProductServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; productId: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<{ id?: number | string }>(
      `/api/business/manage/${encodeURIComponent(data.id)}/product/${encodeURIComponent(data.productId)}`,
      { method: "DELETE" },
    );

    return response.data;
  });

const createManagedBusinessAvatarServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: BusinessAvatarPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteBusinessAvatar>(
      `/api/business/manage/${encodeURIComponent(data.id)}/avatar`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const updateManagedBusinessAvatarServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; avatarId: string; payload: BusinessAvatarPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteBusinessAvatar>(
      `/api/business/manage/${encodeURIComponent(data.id)}/avatar/${encodeURIComponent(data.avatarId)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteManagedBusinessAvatarServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; avatarId: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<RemoteBusinessAvatar>(
      `/api/business/manage/${encodeURIComponent(data.id)}/avatar/${encodeURIComponent(data.avatarId)}`,
      { method: "DELETE" },
    );

    return response.data;
  });

const createManagedBusinessRssSubscriptionServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; payload: BusinessRssSubscriptionPayload }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<{ id?: number | string }>(
      `/api/business/manage/${encodeURIComponent(data.id)}/rss-subscription`,
      {
        method: "POST",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const updateManagedBusinessRssSubscriptionServer = createServerFn({ method: "POST" })
  .validator(
    (data: { id: string; subscriptionId: string; payload: BusinessRssSubscriptionPayload }) => data,
  )
  .handler(async ({ data }) => {
    const response = await apiRequest<{ id?: number | string }>(
      `/api/business/manage/${encodeURIComponent(data.id)}/rss-subscription/${encodeURIComponent(data.subscriptionId)}`,
      {
        method: "PUT",
        body: JSON.stringify(data.payload),
      },
    );

    return response.data;
  });

const deleteManagedBusinessRssSubscriptionServer = createServerFn({ method: "POST" })
  .validator((data: { id: string; subscriptionId: string }) => data)
  .handler(async ({ data }) => {
    const response = await apiRequest<{ id?: number | string }>(
      `/api/business/manage/${encodeURIComponent(data.id)}/rss-subscription/${encodeURIComponent(data.subscriptionId)}`,
      { method: "DELETE" },
    );

    return response.data;
  });

export function getBusinessDashboardData() {
  return getBusinessDashboardDataServer();
}

export function getBusinessDashboardPage(query: BusinessListQuery = {}) {
  return getBusinessDashboardPageServer({ data: query });
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

export function getImageTokenInjectionDashboardData() {
  return getImageTokenInjectionDashboardDataServer();
}

export function getImageTokenInjectionDashboardPage(query: ImageTokenInjectionHistoryQuery = {}) {
  return getImageTokenInjectionDashboardPageServer({ data: query });
}

export function getImageTokenProductPrice() {
  return getImageTokenProductPriceServer();
}

export function injectImageToken(payload: ImageTokenInjectionPayload) {
  return injectImageTokenServer({ data: payload });
}

export function upsertImageTokenProduct(payload: TokenProductPayload) {
  return upsertImageTokenProductServer({ data: payload });
}

export function createManagedBusiness(payload: CreateManagedBusinessPayload) {
  return createManagedBusinessServer({ data: payload });
}

export function upsertManagedBusinessKnowledge(id: string, payload: BusinessKnowledgePayload) {
  return upsertManagedBusinessKnowledgeServer({ data: { id, payload } });
}

export function getManagedBusinessAvatars(id: string) {
  return getManagedBusinessAvatarsServer({ data: { id } });
}

export function upsertManagedBusinessRoleKnowledge(
  id: string,
  payload: BusinessRoleKnowledgePayload,
) {
  return upsertManagedBusinessRoleKnowledgeServer({ data: { id, payload } });
}

export function createManagedBusinessProduct(id: string, payload: BusinessProductPayload) {
  return createManagedBusinessProductServer({ data: { id, payload } });
}

export function updateManagedBusinessProduct(
  id: string,
  productId: string,
  payload: BusinessProductPayload,
) {
  return updateManagedBusinessProductServer({ data: { id, productId, payload } });
}

export function deleteManagedBusinessProduct(id: string, productId: string) {
  return deleteManagedBusinessProductServer({ data: { id, productId } });
}

export function createManagedBusinessAvatar(id: string, payload: BusinessAvatarPayload) {
  return createManagedBusinessAvatarServer({ data: { id, payload } });
}

export function updateManagedBusinessAvatar(
  id: string,
  avatarId: string,
  payload: BusinessAvatarPayload,
) {
  return updateManagedBusinessAvatarServer({ data: { id, avatarId, payload } });
}

export function deleteManagedBusinessAvatar(id: string, avatarId: string) {
  return deleteManagedBusinessAvatarServer({ data: { id, avatarId } });
}

export function createManagedBusinessRssSubscription(
  id: string,
  payload: BusinessRssSubscriptionPayload,
) {
  return createManagedBusinessRssSubscriptionServer({ data: { id, payload } });
}

export function updateManagedBusinessRssSubscription(
  id: string,
  subscriptionId: string,
  payload: BusinessRssSubscriptionPayload,
) {
  return updateManagedBusinessRssSubscriptionServer({
    data: { id, subscriptionId, payload },
  });
}

export function deleteManagedBusinessRssSubscription(id: string, subscriptionId: string) {
  return deleteManagedBusinessRssSubscriptionServer({ data: { id, subscriptionId } });
}
