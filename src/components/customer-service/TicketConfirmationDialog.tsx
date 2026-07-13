import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Props {
  open: boolean;
  defaultSubject: string;
  onOpenChange: (o: boolean) => void;
  onConfirm: (subject: string) => void;
}

export function TicketConfirmationDialog({ open, defaultSubject, onOpenChange, onConfirm }: Props) {
  const [subject, setSubject] = useState(defaultSubject);

  useEffect(() => {
    if (open) setSubject(defaultSubject);
  }, [open, defaultSubject]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tandai sebagai Tiket</DialogTitle>
          <DialogDescription>
            Konfirmasi pemindahan percakapan ini ke status tiket. Anda dapat menyesuaikan subjek tiket terlebih dahulu.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="confirm-subject">Subjek Tiket</Label>
            <Input
              id="confirm-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Contoh: Permintaan demo paket enterprise"
              autoFocus
            />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            type="button"
            disabled={!subject.trim()}
            onClick={() => {
              onConfirm(subject.trim());
              onOpenChange(false);
            }}
          >
            Pindah
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
