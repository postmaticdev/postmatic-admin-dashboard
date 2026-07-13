import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Camera, Mail, Phone, User, Lock, Save, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Link } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [avatarSrc, setAvatarSrc] = useState<string | null>(null);
  const [isHoveringAvatar, setIsHoveringAvatar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const showSuccess = (msg: string) => {
    setSuccessMessage(msg);
    setTimeout(() => setSuccessMessage(null), 3500);
  };

  const [form, setForm] = useState({
    fullName: "Admin Postmatic",
    email: "admin@postmatic.id",
    phone: "+62 812-3456-7890",
  });

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        setAvatarSrc(ev.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise((res) => setTimeout(res, 900));
    setIsSaving(false);
    showSuccess("Perubahan profil Anda telah disimpan.");
  };

  const handleSendReset = async () => {
    setIsSendingReset(true);
    await new Promise((res) => setTimeout(res, 1200));
    setIsSendingReset(false);
    showSuccess(`Link reset password telah dikirim ke ${form.email}`);
  };

  const initials = form.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");

  return (
    <div className="flex h-full min-h-0 flex-col overflow-y-auto bg-background">
      {/* Success banner */}
      {successMessage && (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="flex items-center gap-2.5 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800 shadow-lg dark:border-green-800/30 dark:bg-green-950/50 dark:text-green-300">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {successMessage}
          </div>
        </div>
      )}

      {/* Page header */}
      <div className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="flex items-center gap-3 px-6 py-4">
          <Link
            to="/"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-base font-semibold text-foreground">Profile Settings</h1>
            <p className="text-xs text-muted-foreground">Kelola informasi akun Anda</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mx-auto w-full max-w-2xl px-6 py-8">
        {/* Avatar section */}
        <div className="mb-8 flex flex-col items-center gap-4">
          <div
            className="relative cursor-pointer select-none"
            onMouseEnter={() => setIsHoveringAvatar(true)}
            onMouseLeave={() => setIsHoveringAvatar(false)}
            onClick={() => fileInputRef.current?.click()}
          >
            {/* Avatar */}
            <div className="h-24 w-24 overflow-hidden rounded-full ring-4 ring-border ring-offset-2 ring-offset-background transition-shadow hover:ring-primary/50">
              {avatarSrc ? (
                <img src={avatarSrc} alt="Profile" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-primary text-2xl font-bold text-primary-foreground">
                  {initials || "A"}
                </div>
              )}
            </div>

            {/* Hover overlay */}
            <div
              className={cn(
                "absolute inset-0 flex flex-col items-center justify-center rounded-full bg-black/50 transition-opacity duration-200",
                isHoveringAvatar ? "opacity-100" : "opacity-0",
              )}
            >
              <Camera className="h-5 w-5 text-white" />
              <span className="mt-1 text-[10px] font-medium text-white">Ganti Foto</span>
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />

          <div className="text-center">
            <p className="text-sm font-semibold text-foreground">{form.fullName}</p>
            <p className="text-xs text-muted-foreground">{form.email}</p>
          </div>
        </div>

        {/* Form card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          {/* Personal info section */}
          <div className="border-b border-border px-6 py-5">
            <h2 className="mb-1 text-sm font-semibold text-foreground">Informasi Pribadi</h2>
            <p className="text-xs text-muted-foreground">Perbarui nama dan kontak Anda</p>
          </div>

          <div className="space-y-5 px-6 py-6">
            {/* Full name */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <User className="h-3.5 w-3.5" />
                Nama Lengkap
              </label>
              <Input
                value={form.fullName}
                onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                placeholder="Masukkan nama lengkap"
                className="h-10 rounded-xl border-border/80 bg-background text-sm focus-visible:ring-primary/30"
              />
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Mail className="h-3.5 w-3.5" />
                Email
              </label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                placeholder="Masukkan email"
                className="h-10 rounded-xl border-border/80 bg-background text-sm focus-visible:ring-primary/30"
              />
            </div>

            {/* Phone */}
            <div className="space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
                <Phone className="h-3.5 w-3.5" />
                Nomor HP
              </label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                placeholder="Masukkan nomor HP"
                className="h-10 rounded-xl border-border/80 bg-background text-sm focus-visible:ring-primary/30"
              />
            </div>

            {/* Save button */}
            <div className="pt-1">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="h-10 w-full rounded-xl font-medium"
              >
                {isSaving ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Menyimpan...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    Simpan Perubahan
                  </span>
                )}
              </Button>
            </div>
          </div>

          {/* Password section */}
          <div className="border-t border-border px-6 py-5">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="mb-1 flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <h2 className="text-sm font-semibold text-foreground">Keamanan Akun</h2>
                </div>
                <p className="text-xs text-muted-foreground">
                  Kirim email berisi tautan untuk mereset password Anda ke alamat{" "}
                  <span className="font-medium text-foreground">{form.email}</span>
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSendReset}
                disabled={isSendingReset}
                className="h-9 shrink-0 rounded-xl border-border/80 text-xs font-medium"
              >
                {isSendingReset ? (
                  <span className="flex items-center gap-1.5">
                    <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Mengirim...
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5" />
                    Kirim Reset Password
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
