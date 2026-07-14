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
  onConfirm: (subject: string) => void | Promise<void>;
}

export function TicketConfirmationDialog({ open, defaultSubject, onOpenChange, onConfirm }: Props) {
  const [subject, setSubject] = useState(defaultSubject);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (open) {
      setSubject(defaultSubject);
      setError(null);
      setIsSubmitting(false);
    }
  }, [open, defaultSubject]);

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);

    try {
      await onConfirm(subject.trim());
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menandai percakapan sebagai tiket.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tandai sebagai Tiket</DialogTitle>
          <DialogDescription>
            Konfirmasi pemindahan percakapan ini ke status tiket. Anda dapat menyesuaikan subjek
            tiket terlebih dahulu.
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
          {error && (
            <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs text-destructive">
              {error}
            </div>
          )}
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="outline"
            disabled={isSubmitting}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button type="button" disabled={!subject.trim() || isSubmitting} onClick={handleConfirm}>
            {isSubmitting ? "Memindahkan..." : "Pindah"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
