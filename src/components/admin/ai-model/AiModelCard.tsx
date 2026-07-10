import { Bot, Settings2 } from "lucide-react";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import type { AiModelRow } from "@/lib/mock/types";
import { formatNum } from "@/components/admin/utils";

export function AiModelCard({
  model,
  active,
  onToggle,
  onSettings,
}: {
  model: AiModelRow;
  active: boolean;
  onToggle: (v: boolean) => void;
  onSettings: () => void;
}) {
  return (
    <div className="flex flex-col rounded-xl border bg-card shadow-card p-5">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">{model.name}</p>
            <p className="text-xs text-muted-foreground">{model.provider} · {model.version}</p>
          </div>
        </div>
        <Switch checked={active} onCheckedChange={onToggle} />
      </div>
      <p className="mt-3 flex-1 text-sm text-muted-foreground line-clamp-3">{model.description}</p>
      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatNum(model.requests)} requests</span>
        <StatusBadge status={active ? "Active" : "Inactive"} />
      </div>
      <div className="mt-4 flex gap-2">
        <Button variant="outline" size="sm" className="flex-1" onClick={onSettings}>
          Edit Prompt
        </Button>
        <Button variant="outline" size="sm" className="flex-1 gap-1" onClick={onSettings}>
          <Settings2 className="h-3.5 w-3.5" /> Settings
        </Button>
      </div>
    </div>
  );
}
