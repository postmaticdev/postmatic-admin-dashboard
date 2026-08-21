import { useState, type FormEvent } from "react";
import { AlertTriangle, Loader2, ShieldCheck } from "lucide-react";

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
import type { ManagedProfileRole } from "@/lib/account-management-api";

import type { UserAccount } from "./types";

export interface UserRoleOption {
  label: string;
  value: ManagedProfileRole;
}

interface UserRoleChangeDialogProps {
  user: UserAccount;
  roleOptions: UserRoleOption[];
  isSubmitting: boolean;
  onClose: () => void;
  onConfirm: (role: ManagedProfileRole) => Promise<void>;
}

export function UserRoleChangeDialog({
  user,
  roleOptions,
  isSubmitting,
  onClose,
  onConfirm,
}: UserRoleChangeDialogProps) {
  const [selectedRole, setSelectedRole] = useState<ManagedProfileRole | "">(
    roleOptions[0]?.value ?? "",
  );
  const [confirmationName, setConfirmationName] = useState("");

  const nameMatches = confirmationName.trim() === user.fullName.trim();
  const canSubmit = Boolean(selectedRole) && nameMatches && !isSubmitting;
  const selectedRoleLabel =
    roleOptions.find((role) => role.value === selectedRole)?.label ?? "role terpilih";

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!canSubmit || !selectedRole) return;
    void onConfirm(selectedRole);
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
          <DialogHeader className="border-b border-border bg-violet-500/5 px-6 py-5 pr-12">
            <div className="mb-1 flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10">
                <ShieldCheck className="h-5 w-5 text-violet-600 dark:text-violet-400" />
              </div>
              <DialogTitle>Ubah Role Pengguna</DialogTitle>
            </div>
            <DialogDescription className="text-left leading-relaxed">
              Pilih role baru lalu konfirmasi dengan mengetik nama pengguna.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 px-6 py-5">
            <div className="rounded-xl border border-border bg-muted/40 px-4 py-3">
              <p className="text-sm font-semibold text-foreground">{user.fullName}</p>
              <p className="mt-0.5 text-xs text-muted-foreground">{user.email}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-target">Role tujuan</Label>
              <select
                id="role-target"
                value={selectedRole}
                onChange={(event) => setSelectedRole(event.target.value as ManagedProfileRole | "")}
                disabled={isSubmitting}
                className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500/40 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {roleOptions.map((role) => (
                  <option key={role.value} value={role.value}>
                    {role.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-muted-foreground">
                Daftar role akan mengikuti Role Management setelah backend tersedia.
              </p>
            </div>

            <div className="rounded-lg border border-amber-500/25 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-700 dark:text-amber-300">
              <div className="flex gap-2">
                <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                <p>
                  Pengguna akan memperoleh hak akses <strong>{selectedRoleLabel}</strong> setelah
                  perubahan disimpan.
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role-confirmation-name">
                Ketik <span className="font-bold">{user.fullName}</span> untuk konfirmasi
              </Label>
              <Input
                id="role-confirmation-name"
                value={confirmationName}
                onChange={(event) => setConfirmationName(event.target.value)}
                placeholder={`Ketik "${user.fullName}"`}
                autoComplete="off"
                disabled={isSubmitting}
                aria-invalid={confirmationName.length > 0 && !nameMatches}
                className="h-10 focus-visible:ring-violet-500/40"
              />
              {confirmationName.length > 0 && !nameMatches && (
                <p className="text-xs font-medium text-destructive">Nama pengguna belum sesuai.</p>
              )}
            </div>
          </div>

          <DialogFooter className="gap-2 border-t border-border bg-muted/20 px-6 py-4 sm:space-x-0">
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Batal
            </Button>
            <Button
              type="submit"
              disabled={!canSubmit}
              className="bg-violet-600 text-white hover:bg-violet-700"
            >
              {isSubmitting ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
              {isSubmitting ? "Mengubah role..." : `Ubah menjadi ${selectedRoleLabel}`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
