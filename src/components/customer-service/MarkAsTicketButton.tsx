import { useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/contexts/TicketsContext";
import { TicketConfirmationDialog } from "./TicketConfirmationDialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Ticket } from "@/lib/types/ticket";

export function MarkAsTicketButton({ ticket }: { ticket: Ticket }) {
  const { markAsTicket, unmarkAsTicket } = useTickets();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);

  if (ticket.isSavedAsTicket) {
    return (
      <>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setCancelDialogOpen(true)}
          className="gap-1.5 border-emerald-500/30 text-emerald-600 bg-emerald-500/5 hover:bg-destructive hover:text-destructive-foreground hover:border-destructive transition-colors group"
        >
          <BookmarkCheck className="h-4 w-4 group-hover:hidden" />
          <BookmarkPlus className="h-4 w-4 hidden group-hover:block" />
          <span className="group-hover:hidden">Ticket Created</span>
          <span className="hidden group-hover:inline">Batal Tandai</span>
        </Button>

        <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
          <DialogContent className="sm:max-w-[400px]">
            <DialogHeader>
              <DialogTitle>Batal Tandai sebagai Tiket?</DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin membatalkan status tiket untuk percakapan ini? Percakapan ini akan dihapus dari daftar All Ticket.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => setCancelDialogOpen(false)}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={() => {
                  unmarkAsTicket(ticket.id);
                  setCancelDialogOpen(false);
                }}
              >
                Ya, Batal Tandai
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </>
    );
  }

  const handleClick = () => {
    setDialogOpen(true);
  };

  return (
    <>
      <Button size="sm" onClick={handleClick} className="gap-1.5">
        <BookmarkPlus className="h-4 w-4" />
        Tandai sebagai Tiket
      </Button>
      <TicketConfirmationDialog
        open={dialogOpen}
        defaultSubject={ticket.subject}
        onOpenChange={setDialogOpen}
        onConfirm={(subject) => markAsTicket(ticket.id, { subject })}
      />
    </>
  );
}
