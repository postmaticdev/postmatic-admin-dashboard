import React, { useState } from "react";
import { AdminAccount, RoleItem } from "./types";
import { ArrowLeft, Save, ShieldAlert, KeyRound } from "lucide-react";
import { toast } from "sonner";

interface AdminCreateFormProps {
  roles: RoleItem[];
  onSave: (data: Omit<AdminAccount, "id">) => void;
  onCancel: () => void;
}

export function AdminCreateForm({ roles, onSave, onCancel }: AdminCreateFormProps) {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [selectedRole, setSelectedRole] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [phone, setPhone] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email || !selectedRole || !password || !confirmPassword) {
      toast.error("Harap isi semua kolom wajib!");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Password dan konfirmasi password tidak cocok!");
      return;
    }

    // Default avatar URL
    const avatarUrl = `https://api.dicebear.com/7.x/avataaars/svg?seed=${fullName}`;

    onSave({
      fullName,
      email,
      phone: phone || "—",
      avatarUrl,
      role: selectedRole as AdminAccount["role"],
      status: "Active",
      joinedAt: new Date().toISOString().split("T")[0],
      lastActive: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />Kembali
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Tambah Admin Baru</h1>
          <p className="text-xs text-muted-foreground font-mono">Account / Admin / Create</p>
        </div>
      </div>

      <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm max-w-2xl">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <KeyRound className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Buat Akun Administrator</h2>
              <p className="text-xs text-muted-foreground">Isi kredensial akun administrator baru</p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Lengkap *</label>
              <input
                type="text"
                placeholder="Masukkan nama lengkap admin"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email *</label>
              <input
                type="email"
                placeholder="admin@postmatic.id"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role Akses *</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none"
                >
                  <option value="">Pilih Role...</option>
                  {roles.map((r) => (
                    <option key={r.id} value={r.name}>
                      {r.name}
                    </option>
                  ))}
                  {roles.length === 0 && (
                    <>
                      <option value="Super Admin">Super Admin</option>
                      <option value="Admin">Admin</option>
                      <option value="Moderator">Moderator</option>
                    </>
                  )}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">No. Telepon (Opsional)</label>
                <input
                  type="tel"
                  placeholder="0811..."
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Konfirmasi Password *</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
                />
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-border/60">
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Save className="h-4 w-4" />Simpan Admin
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            >
              Batal
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
