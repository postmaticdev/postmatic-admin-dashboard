import { cn } from "@/lib/utils";
import type { TicketSource } from "@/lib/types/ticket";

const MAP: Record<TicketSource, { label: string; cls: string }> = {
  whatsapp: {
    label: "WA",
    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
  gmail: {
    label: "Gmail",
    cls: "bg-red-500/15 text-red-700 dark:text-red-400 border-red-500/20",
  },
  website: {
    label: "Website",
    cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
};

export function SourceBadge({ source }: { source: TicketSource }) {
  const cfg = MAP[source];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}
