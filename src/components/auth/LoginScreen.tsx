import { Loader2, LogIn, ShieldCheck } from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function FullScreenState({ label }: { label: string }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 text-foreground">
      <div className="flex items-center gap-3 text-sm font-medium text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>{label}</span>
      </div>
    </div>
  );
}

export function LoginScreen() {
  const { login, loginUrl } = useAuth();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="w-full max-w-md rounded-lg border-border bg-card shadow-sm">
        <CardHeader>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <CardTitle className="text-2xl text-foreground">Postmatic Admin Dashboard</CardTitle>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Masuk sebagai admin untuk membuka dashboard operasional Postmatic.
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full" onClick={login}>
            <LogIn />
            Login via auth-staging
          </Button>
          <div className="rounded-md border border-border bg-muted p-3 text-xs text-muted-foreground">
            Auth URL: {loginUrl}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
