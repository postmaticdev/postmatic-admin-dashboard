import { Send } from "lucide-react";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
        <Send className="h-4 w-4" />
      </div>
      {!collapsed && (
        <span className="text-lg font-semibold tracking-tight text-foreground">Postmatic</span>
      )}
    </div>
  );
}
