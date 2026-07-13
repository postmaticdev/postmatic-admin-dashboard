import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/contexts/TicketsContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { TicketStatus } from "@/lib/types/ticket";

interface Props {
  ticketId: string;
  currentStatus?: TicketStatus;
}

const STATUS_OPTS: { value: TicketStatus; label: string; activeClass: string }[] = [
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
  const [pendingStatus, setPendingStatus] = useState<TicketStatus | null>(null);

  return (
    <>
      <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/30 p-1">
        {STATUS_OPTS.map((opt) => {
          const isActive = currentStatus === opt.value;
          return (
            <Button
              key={opt.value}
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                if (currentStatus === opt.value) return;
                setPendingStatus(opt.value);
              }}
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

      <Dialog open={pendingStatus !== null} onOpenChange={(open) => { if (!open) setPendingStatus(null); }}>
        <DialogContent className="sm:max-w-[400px]">
          <DialogHeader>
            <DialogTitle>Kategorikan Percakapan</DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin mengkategorikannya? Percakapan ini akan dipindahkan ke kategori <span className="font-semibold text-foreground capitalize">{pendingStatus}</span>.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0 mt-4">
            <Button variant="ghost" size="sm" onClick={() => setPendingStatus(null)}>
              Batal
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => {
                if (pendingStatus) {
                  updateTicketStatus(ticketId, pendingStatus);
                  setPendingStatus(null);
                }
              }}
            >
              Ya, Kategorikan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
