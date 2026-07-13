import { cn } from "@/lib/utils";
import type { TicketStatus } from "@/lib/types/ticket";

const MAP: Record<TicketStatus, { label: string; cls: string }> = {
  blast: {
    label: "Blast",
    cls: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/20",
  },
  review: {
    label: "Review",
    cls: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/20",
  },
  progress: {
    label: "Progress",
    cls: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/20",
  },
  done: {
    label: "Done",
    cls: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/20",
  },
};

export function StatusBadge({ status }: { status: TicketStatus }) {
  const cfg = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium",
        cfg.cls,
      )}
    >
      {cfg.label}
    </span>
  );
}
