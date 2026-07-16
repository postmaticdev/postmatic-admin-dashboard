import React, { useState, useRef, useEffect } from "react";
import { AdminAccount } from "./types";
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Mail,
  Send,
  Shield,
  CheckCircle2,
  X,
  Camera,
  Upload,
} from "lucide-react";

interface AdminFormViewProps {
  admin: AdminAccount;
  onSave: (data: Omit<AdminAccount, "id">, id: string) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

function ChangeAvatarModal({
  currentUrl,
  onConfirm,
  onClose,
}: {
  currentUrl: string;
  onConfirm: (url: string) => void;
  onClose: () => void;
}) {
  const [url, setUrl] = useState(currentUrl);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRandom = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setUrl(`https://api.dicebear.com/7.x/avataaars/svg?seed=${randomSeed}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <Camera className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Ganti Foto Profil</h3>
            <p className="text-xs text-muted-foreground">Pilih foto dari device Anda</p>
          </div>
        </div>

        <div className="flex flex-col items-center justify-center gap-4 py-2">
          <div className="h-24 w-24 rounded-2xl border border-border overflow-hidden bg-muted shadow-inner">
            <img src={url} alt="Preview Avatar" className="h-full w-full object-cover" />
          </div>
          
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />
          
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all shadow-sm"
          >
            <Upload className="h-3.5 w-3.5" /> Pilih Foto dari Device
          </button>
        </div>

        <div className="flex gap-2 pt-2 border-t border-border/40">
          <button
            type="button"
            onClick={handleRandom}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-muted hover:bg-muted/80 text-foreground transition-all"
          >
            Acak Avatar
          </button>
          <button
            type="button"
            onClick={() => onConfirm(url)}
            className="flex-1 inline-flex items-center justify-center px-4 py-2 rounded-xl text-xs font-semibold text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md shadow-primary/20"
          >
            Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function DeleteConfirmModal({ adminName, onConfirm, onClose }: { adminName: string; onConfirm: () => void; onClose: () => void }) {
  const [input, setInput] = useState("");
  const matches = input.trim() === adminName.trim();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
            <AlertTriangle className="h-5 w-5 text-red-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Hapus Admin</h3>
            <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan.</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ketik <span className="font-semibold text-foreground">{adminName}</span> untuk mengonfirmasi penghapusan akun admin ini secara permanen.
        </p>
        <input
          type="text"
          placeholder={`Ketik "${adminName}"`}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
        />
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            disabled={!matches}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />Hapus Permanen
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

function ResetPasswordModal({ email, onConfirm, onClose }: { email: string; onConfirm: () => void; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4" onClick={(e) => e.stopPropagation()}>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
            <Mail className="h-5 w-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Kirim Email Reset Password</h3>
            <p className="text-xs text-muted-foreground">Konfirmasi pengiriman email</p>
          </div>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Email reset password akan dikirimkan ke <span className="font-semibold text-foreground">{email}</span>.
        </p>
        <div className="flex gap-2 pt-1">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-500 hover:bg-blue-600 transition-all shadow-md shadow-blue-500/20"
          >
            <Send className="h-3.5 w-3.5" />Kirim Sekarang
          </button>
          <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

export function AdminFormView({ admin, onSave, onDelete, onCancel }: AdminFormViewProps) {
  const [form, setForm] = useState({
    fullName: admin.fullName,
    email: admin.email,
    phone: admin.phone,
    avatarUrl: admin.avatarUrl,
    role: admin.role as AdminAccount["role"],
    status: admin.status as AdminAccount["status"],
    joinedAt: admin.joinedAt,
    lastActive: admin.lastActive,
  });
  const [showDelete, setShowDelete] = useState(false);
  const [showReset, setShowReset] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleResetConfirm = () => {
    setShowReset(false);
    setResetSent(true);
    setTimeout(() => setResetSent(false), 4000);
  };

  return (
    <>
      {/* Header */}
      <div className="flex items-center gap-4">
        <button type="button" onClick={onCancel} className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-all">
          <ArrowLeft className="h-4 w-4" />Kembali
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">Edit Admin</h1>
          <p className="text-xs text-muted-foreground font-mono">Account / Admin / {admin.fullName}</p>
        </div>
      </div>

      {resetSent && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 text-sm font-medium">
          <CheckCircle2 className="h-4 w-4 shrink-0" />
          Email reset password berhasil dikirimkan ke <strong>{form.email}</strong>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main form */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-5">
          <div className="flex items-center gap-3 pb-2 border-b border-border/60">
            <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Shield className="h-4 w-4 text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Informasi Admin</h2>
              <p className="text-xs text-muted-foreground">Edit data akun admin</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Lengkap</label>
              <input
                type="text"
                value={form.fullName}
                onChange={(e) => handleChange("fullName", e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange("email", e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">No. Telepon</label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">URL Avatar</label>
              <input
                type="url"
                value={form.avatarUrl}
                onChange={(e) => handleChange("avatarUrl", e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</label>
              <select
                value={form.role}
                onChange={(e) => handleChange("role", e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none"
              >
                <option value="Super Admin">Super Admin</option>
                <option value="Admin">Admin</option>
                <option value="Moderator">Moderator</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={(e) => handleChange("status", e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all appearance-none"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3 pt-2 border-t border-border/60">
            <button
              type="button"
              onClick={() => onSave(form, admin.id)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Save className="h-4 w-4" />Simpan Perubahan
            </button>
            <button type="button" onClick={onCancel} className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
              Batal
            </button>
          </div>
        </div>

        {/* Sidebar actions */}
        <div className="space-y-4">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Preview Avatar</h3>
            <div className="flex items-center gap-3">
              <div
                className="relative h-14 w-14 rounded-2xl border-2 border-border overflow-hidden bg-muted shrink-0 group cursor-pointer"
                onClick={() => setShowAvatarModal(true)}
                title="Klik untuk ganti foto profil"
              >
                <img src={form.avatarUrl} alt={form.fullName} className="h-full w-full object-cover group-hover:brightness-75 transition-all duration-300" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                  <Camera className="h-4 w-4 text-white" />
                </div>
              </div>
              <div>
                <p className="text-sm font-bold text-foreground">{form.fullName || "—"}</p>
                <p className="text-xs text-muted-foreground">{form.role}</p>
              </div>
            </div>
          </div>
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Aksi Cepat</h3>
            <button
              type="button"
              onClick={() => setShowReset(true)}
              className="w-full inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-blue-500/30 bg-blue-500/5 text-blue-600 dark:text-blue-400 text-sm font-semibold hover:bg-blue-500/10 transition-all"
            >
              <Mail className="h-4 w-4" />Kirim Reset Password
            </button>
          </div>
          <div className="bg-card border border-red-500/20 rounded-2xl p-5 shadow-sm space-y-3">
            <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wide flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5" />Danger Zone
            </h3>
            <p className="text-xs text-muted-foreground">Menghapus akun admin ini akan menghilangkan semua akses secara permanen.</p>
            <button
              type="button"
              onClick={() => setShowDelete(true)}
              className="w-full inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 text-sm font-semibold hover:bg-red-500/10 transition-all"
            >
              <Trash2 className="h-4 w-4" />Hapus Admin
            </button>
          </div>
        </div>
      </div>

      {showDelete && (
        <DeleteConfirmModal
          adminName={admin.fullName}
          onConfirm={() => { setShowDelete(false); onDelete(admin.id); }}
          onClose={() => setShowDelete(false)}
        />
      )}
      {showReset && (
        <ResetPasswordModal
          email={admin.email}
          onConfirm={handleResetConfirm}
          onClose={() => setShowReset(false)}
        />
      )}
      {showAvatarModal && (
        <ChangeAvatarModal
          currentUrl={form.avatarUrl}
          onConfirm={(url) => {
            handleChange("avatarUrl", url);
            setShowAvatarModal(false);
          }}
          onClose={() => setShowAvatarModal(false)}
        />
      )}
    </>
  );
}
