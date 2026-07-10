import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { ReactNode } from "react";

export function DetailInfoHeader({
  avatar,
  avatarAlt,
  title,
  subtitle,
  badges,
  meta,
  action,
}: {
  avatar?: string;
  avatarAlt?: string;
  title: string;
  subtitle?: ReactNode;
  badges?: ReactNode;
  meta?: { label: string; value: string }[];
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 rounded-xl border bg-muted/30 p-5 sm:flex-row sm:items-start">
      {avatar ? (
        <img src={avatar} alt={avatarAlt ?? title} className="h-20 w-20 shrink-0 rounded-xl bg-muted object-cover" />
      ) : null}
      <div className="min-w-0 flex-1 space-y-2">
        <div>
          <h4 className="text-lg font-semibold text-foreground">{title}</h4>
          {subtitle ? <p className="text-sm text-muted-foreground">{subtitle}</p> : null}
        </div>
        {badges ? <div className="flex flex-wrap items-center gap-2">{badges}</div> : null}
        {meta ? (
          <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
            {meta.map((m) => (
              <p key={m.label} className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{m.label}:</span> {m.value}
              </p>
            ))}
          </div>
        ) : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}

export function ResetPasswordButton() {
  return (
    <Button variant="destructive" size="sm" className="gap-2">
      <Mail className="h-4 w-4" />
      Send Email Reset Password
    </Button>
  );
}

export function RoleBadge({ role }: { role: string }) {
  const isSuper = role === "Super Admin";
  const isCreator = role === "Creator";
  return (
    <Badge variant={isSuper || isCreator ? "default" : "secondary"}>
      {role}
    </Badge>
  );
}

export function PlanBadge({ plan }: { plan: string }) {
  const isFree = plan === "Free";
  return (
    <Badge variant={isFree ? "outline" : "default"}>
      {isFree ? "Free" : "Paid"}
    </Badge>
  );
}
