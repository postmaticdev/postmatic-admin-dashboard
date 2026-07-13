import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";

import { AuthContext, type AuthContextValue, type AuthStatus } from "@/contexts/auth-context";
import {
  clearAuthTokens,
  getAuthUserFromTokens,
  getLoginUrl,
  getStoredAuthTokens,
  hasStoredAuthToken,
  readAuthTokensFromLocation,
  redirectToLogin,
  removeAuthParamsFromUrl,
  setAuthTokens,
  type AuthTokens,
} from "@/lib/auth";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [tokens, setTokens] = useState<AuthTokens>({
    accessToken: null,
    refreshToken: null,
  });

  const refreshAuthState = useCallback(() => {
    const storedTokens = getStoredAuthTokens();
    setTokens(storedTokens);
    setStatus(hasStoredAuthToken() ? "authenticated" : "unauthenticated");
  }, []);

  useEffect(() => {
    const tokensFromUrl = readAuthTokensFromLocation();

    if (tokensFromUrl.accessToken || tokensFromUrl.refreshToken) {
      const currentTokens = getStoredAuthTokens();
      setAuthTokens(
        tokensFromUrl.accessToken ?? currentTokens.accessToken,
        tokensFromUrl.refreshToken ?? currentTokens.refreshToken,
      );
      removeAuthParamsFromUrl();
    }

    refreshAuthState();
  }, [refreshAuthState]);

  const login = useCallback(() => {
    redirectToLogin();
  }, []);

  const logout = useCallback(() => {
    clearAuthTokens();
    setTokens({ accessToken: null, refreshToken: null });
    setStatus("unauthenticated");
    redirectToLogin();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      ...tokens,
      status,
      isAuthenticated: status === "authenticated",
      user: getAuthUserFromTokens(tokens),
      loginUrl: getLoginUrl(),
      login,
      logout,
    }),
    [login, logout, status, tokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
