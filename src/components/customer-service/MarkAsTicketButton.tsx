import { useState } from "react";
import { BookmarkCheck, BookmarkPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTickets } from "@/contexts/TicketsContext";
import { TicketConfirmationDialog } from "./TicketConfirmationDialog";
import type { Ticket } from "@/lib/types/ticket";

export function MarkAsTicketButton({ ticket }: { ticket: Ticket }) {
  const { markAsTicket } = useTickets();
  const [dialogOpen, setDialogOpen] = useState(false);

  if (ticket.source === "whatsapp" && !ticket.isSavedAsTicket) {
    return null;
  }

  if (ticket.isSavedAsTicket) {
    return (
      <Button
        variant="outline"
        size="sm"
        disabled
        className="gap-1.5 border-emerald-500/30 bg-emerald-500/5 text-emerald-600 disabled:opacity-100"
      >
        <BookmarkCheck className="h-4 w-4" />
        Ticket Created
      </Button>
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
