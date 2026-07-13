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
  defaultSubject?: string;
  onOpenChange: (o: boolean) => void;
  onConfirm: (subject: string) => void;
}

export function WhatsappSubjectDialog({ open, defaultSubject, onOpenChange, onConfirm }: Props) {
  const [subject, setSubject] = useState(defaultSubject ?? "");

  useEffect(() => {
    if (open) setSubject(defaultSubject ?? "");
  }, [open, defaultSubject]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tandai sebagai Tiket</DialogTitle>
          <DialogDescription>
            Beri subjek singkat untuk percakapan WhatsApp ini sebelum menyimpannya sebagai tiket.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="ticket-subject">Subjek Tiket</Label>
          <Input
            id="ticket-subject"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Contoh: Permintaan demo paket enterprise"
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Batal
          </Button>
          <Button
            disabled={!subject.trim()}
            onClick={() => {
              onConfirm(subject.trim());
              onOpenChange(false);
            }}
          >
            Simpan Tiket
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
