import type { ReactNode } from "react";

import { useAuth } from "@/hooks/useAuth";
import { FullScreenState, LoginScreen } from "./LoginScreen";

export function AuthGate({ children }: { children: ReactNode }) {
  const { isAuthenticated, status } = useAuth();

  if (status === "loading") {
    return <FullScreenState label="Menyiapkan sesi admin" />;
  }

  if (!isAuthenticated) {
    return <LoginScreen />;
  }

  return <>{children}</>;
}
