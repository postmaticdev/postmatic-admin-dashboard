import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/contexts/TicketsContext";
import type { TicketStatus } from "@/lib/types/ticket";

interface Props {
  ticketId: string;
  currentStatus: TicketStatus;
}

const STATUS_OPTS: { value: TicketStatus; label: string; activeClass: string }[] = [
  {
    value: "blast",
    label: "Blast",
    activeClass: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-500/30 hover:bg-purple-500/25",
  },
  {
    value: "review",
    label: "Review",
    activeClass: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/25",
  },
  {
    value: "progress",
    label: "Progress",
    activeClass: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30 hover:bg-blue-500/25",
  },
  {
    value: "done",
    label: "Done",
    activeClass: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25",
  },
];

export function TicketStatusSelector({ ticketId, currentStatus }: Props) {
  const { updateTicketStatus } = useTickets();

  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
      {STATUS_OPTS.map((opt) => {
        const isActive = currentStatus === opt.value;
        return (
          <Button
            key={opt.value}
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => updateTicketStatus(ticketId, opt.value)}
            className={cn(
              "h-7 px-2.5 text-xs font-medium border border-transparent transition-all",
              isActive
                ? opt.activeClass
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
            )}
          >
            {opt.label}
          </Button>
        );
      })}
    </div>
  );
}
