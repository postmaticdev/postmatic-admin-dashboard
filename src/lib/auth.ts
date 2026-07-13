export const AUTH_ORIGIN = getPublicEnv("VITE_AUTH_ORIGIN") ?? "https://auth-staging.postmatic.id";

export const ACCESS_TOKEN_KEY = "postmaticAccessToken";
export const REFRESH_TOKEN_KEY = "postmaticRefreshToken";
export const ACCESS_TOKEN_HEADER = "X-Postmatic-AccessToken";

const DEFAULT_ADMIN_ORIGIN = "https://admin-haystudio-staging.postmatic.id";
const TOKEN_QUERY_KEYS = [
  ACCESS_TOKEN_KEY,
  REFRESH_TOKEN_KEY,
  "accessToken",
  "refreshToken",
  "token",
] as const;

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export interface AuthUser {
  name: string;
  email: string;
  initials: string;
}

type JwtPayload = Record<string, unknown>;

function getPublicEnv(key: string) {
  const env = import.meta.env as Record<string, string | undefined>;
  const value = env[key]?.trim();
  return value || undefined;
}

function getReturnOrigin() {
  const configuredOrigin = getPublicEnv("VITE_ADMIN_ORIGIN");
  if (configuredOrigin) return configuredOrigin;

  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  return DEFAULT_ADMIN_ORIGIN;
}

function getCookie(name: string) {
  if (typeof document === "undefined") return null;

  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];

  return value ? decodeURIComponent(value) : null;
}

function setClientCookie(name: string, value: string | null) {
  if (typeof document === "undefined") return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";

  if (!value) {
    document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Lax${secure}`;
    return;
  }

  document.cookie = `${name}=${encodeURIComponent(
    value,
  )}; Path=/; Max-Age=604800; SameSite=Lax${secure}`;
}

export function getLoginUrl() {
  const returnOrigin = getReturnOrigin();
  const url = new URL("/login", AUTH_ORIGIN);

  url.searchParams.set("from", returnOrigin);
  url.searchParams.set("redirectUrl", returnOrigin);

  return url.toString();
}

export function redirectToLogin() {
  if (typeof window === "undefined") return;
  window.location.href = getLoginUrl();
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return getCookie(ACCESS_TOKEN_KEY) ?? localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function getStoredAuthTokens(): AuthTokens {
  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
  };
}

export function hasStoredAuthToken() {
  const { accessToken, refreshToken } = getStoredAuthTokens();
  return Boolean(accessToken || refreshToken);
}

export function setAuthTokens(accessToken: string | null, refreshToken: string | null) {
  if (typeof window === "undefined") return;

  if (accessToken) {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    setClientCookie(ACCESS_TOKEN_KEY, accessToken);
  } else {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    setClientCookie(ACCESS_TOKEN_KEY, null);
  }

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  }
}

export function clearAuthTokens() {
  setAuthTokens(null, null);
}

function decodeJwtPayload(token: string | null) {
  if (!token || typeof atob === "undefined") return null;

  const payload = token.split(".")[1];
  if (!payload) return null;

  try {
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const paddedBase64 = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = decodeURIComponent(
      atob(paddedBase64)
        .split("")
        .map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
        .join(""),
    );
    const parsed = JSON.parse(json);
    return parsed && typeof parsed === "object" ? (parsed as JwtPayload) : null;
  } catch {
    return null;
  }
}

function getNestedRecord(payload: JwtPayload | null) {
  if (!payload) return null;

  const candidates = ["user", "account", "profile", "data", "admin"];
  for (const key of candidates) {
    const value = payload[key];
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return value as JwtPayload;
    }
  }

  return null;
}

function getStringValue(record: JwtPayload | null, keys: string[]) {
  if (!record) return null;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getInitials(value: string) {
  const words = value
    .split(/[\s._-]+/)
    .map((word) => word.trim())
    .filter(Boolean);

  if (!words.length) return "A";

  return words
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? "")
    .join("");
}

export function getAuthUserFromTokens({ accessToken }: AuthTokens): AuthUser | null {
  const payload = decodeJwtPayload(accessToken);
  const nestedRecord = getNestedRecord(payload);

  const name =
    getStringValue(nestedRecord, ["name", "fullName", "displayName", "username"]) ??
    getStringValue(payload, ["name", "fullName", "displayName", "username"]);
  const email =
    getStringValue(nestedRecord, ["email", "mail", "userEmail"]) ??
    getStringValue(payload, ["email", "mail", "userEmail"]);

  if (!name && !email) return null;

  const resolvedName = name ?? email?.split("@")[0] ?? "Admin";
  const resolvedEmail = email ?? "Authenticated";

  return {
    name: resolvedName,
    email: resolvedEmail,
    initials: getInitials(resolvedName),
  };
}

export function readAuthTokensFromSearch(searchParams: URLSearchParams): AuthTokens {
  return {
    accessToken:
      searchParams.get(ACCESS_TOKEN_KEY) ??
      searchParams.get("accessToken") ??
      searchParams.get("token"),
    refreshToken: searchParams.get(REFRESH_TOKEN_KEY) ?? searchParams.get("refreshToken"),
  };
}

export function readAuthTokensFromLocation() {
  if (typeof window === "undefined") {
    return { accessToken: null, refreshToken: null };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const hash = window.location.hash.replace(/^#/, "");
  const hashSearch = hash.includes("?") ? hash.slice(hash.indexOf("?") + 1) : hash;
  const hashParams = new URLSearchParams(hashSearch);

  hashParams.forEach((value, key) => {
    if (!searchParams.has(key)) {
      searchParams.set(key, value);
    }
  });

  return readAuthTokensFromSearch(searchParams);
}

export function removeAuthParamsFromUrl() {
  if (typeof window === "undefined") return;

  const url = new URL(window.location.href);
  let changed = false;

  TOKEN_QUERY_KEYS.forEach((key) => {
    if (url.searchParams.has(key)) {
      url.searchParams.delete(key);
      changed = true;
    }
  });

  if (url.hash) {
    const rawHash = url.hash.slice(1);
    const hashPath = rawHash.includes("?") ? rawHash.slice(0, rawHash.indexOf("?")) : "";
    const hashSearch = rawHash.includes("?") ? rawHash.slice(rawHash.indexOf("?") + 1) : rawHash;
    const hashParams = new URLSearchParams(hashSearch);
    let hashChanged = false;

    TOKEN_QUERY_KEYS.forEach((key) => {
      if (hashParams.has(key)) {
        hashParams.delete(key);
        hashChanged = true;
      }
    });

    if (hashChanged) {
      const nextHashSearch = hashParams.toString();
      url.hash = hashPath
        ? `${hashPath}${nextHashSearch ? `?${nextHashSearch}` : ""}`
        : nextHashSearch;
      changed = true;
    }
  }

  if (changed) {
    const nextUrl = `${url.pathname}${url.search}${url.hash}`;
    window.history.replaceState({}, "", nextUrl);
  }
}
