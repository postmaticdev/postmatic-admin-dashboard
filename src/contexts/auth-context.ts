import { createContext } from "react";

import type { AuthTokens, AuthUser } from "@/lib/auth";

export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthContextValue extends AuthTokens {
  status: AuthStatus;
  isAuthenticated: boolean;
  user: AuthUser | null;
  loginUrl: string;
  login: () => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
