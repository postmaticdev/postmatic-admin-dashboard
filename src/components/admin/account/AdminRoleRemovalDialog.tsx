import { useState, type FormEvent } from "react";
import { AlertTriangle, Loader2, ShieldOff } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import type { AdminAccount } from "./types";

interface AdminRoleRemovalDialogProps {
  admin: AdminAccount;
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export function AdminRoleRemovalDialog({
  admin,
  isSubmitting,
  onClose,
  onConfirm,
}: AdminRoleRemovalDialogProps) {
  const [confirmationName, setConfirmationName] = useState("");
  const nameMatches = confirmationName.trim() === admin.fullName.trim();

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!nameMatches || isSubmitting) return;
    void onConfirm();
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !isSubmitting) onClose();
      }}
    >
      <DialogContent className="overflow-hidden p-0 sm:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader className="border-b border-border bg-red-500/5 px-6 py-5 pr-12">
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-500/10">
                <ShieldOff className="h-5 w-5 text-red-600 dark:text-red-400" />
              </div>
              <DialogTitle>Hapus Role Admin</DialogTitle>
            </div>
            <DialogDescription className="text-left leading-relaxed">
              Cabut akses admin dan kembalikan akun ini menjadi pengguna biasa.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{admin.fullName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{admin.email}</p>
            </div>

            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Akun tidak akan dihapus, tetapi seluruh akses admin akan dicabut dan role diubah
                  menjadi <strong>User</strong>.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="remove-admin-role-name">
                Ketik <span className="font-bold">{admin.fullName}</span> untuk konfirmasi
              </Label>
              <Input
                id="remove-admin-role-name"
                value={confirmationName}
                onChange={(event) => setConfirmationName(event.target.value)}
                placeholder={`Ketik "${admin.fullName}"`}
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={confirmationName.length > 0 && !nameMatches}
                className="h-10 focus-visible:ring-red-500/40"
              />
              {confirmationName.length > 0 && !nameMatches && (
                <p className="text-xs font-medium text-destructive">Nama admin belum sesuai.</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:space-x-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button type="submit" variant="destructive" disabled={!nameMatches || isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldOff />}
              {isSubmitting ? "Menghapus role..." : "Hapus Role"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
