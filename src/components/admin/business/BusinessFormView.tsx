import React, { useState } from "react";
import { BusinessAccount } from "./types";
import {
  ArrowLeft,
  Save,
  Building2,
  Sparkles,
  Loader2,
  Coins,
  User,
  Globe2,
  ImageIcon,
} from "lucide-react";
import { toast } from "sonner";

interface BusinessFormViewProps {
  business: BusinessAccount | null;
  onSave: (data: Omit<BusinessAccount, "id">, id?: string) => void | Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

const formatNumber = (num: number) => num.toLocaleString("id-ID");

export function BusinessFormView({
  business,
  onSave,
  onCancel,
  isSaving = false,
}: BusinessFormViewProps) {
  const isEditMode = Boolean(business);
  const [name, setName] = useState(business?.name || "");
  const [category, setCategory] = useState(business?.category || "Information Technology");
  const [description, setDescription] = useState(business?.description || "");
  const [websiteUrl, setWebsiteUrl] = useState(business?.websiteUrl || "");
  const [logoUrl, setLogoUrl] = useState(
    business?.logoUrl ||
      `https://api.dicebear.com/7.x/initials/svg?seed=Biz&backgroundColor=4f46e5`,
  );

  const handleRandomLogo = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setLogoUrl(
      `https://api.dicebear.com/7.x/initials/svg?seed=${randomSeed}&backgroundColor=4f46e5`,
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !category.trim()) {
      toast.error("Harap isi semua kolom wajib!");
      return;
    }

    onSave(
      {
        name: name.trim(),
        owner: business?.owner || "Belum tersedia",
        category: category.trim(),
        description: description.trim() || undefined,
        websiteUrl: websiteUrl.trim() || undefined,
        status: business?.status || "Free",
        balance: business?.balance || 0,
        logoUrl,
        joinedAt: business?.joinedAt || new Date().toISOString().split("T")[0],
      },
      business?.id,
    );
  };

  const categories = [
    "Information Technology",
    "Food & Beverage",
    "Logistics & Supply Chain",
    "Healthcare",
    "Manufacturing",
    "Finance & Banking",
    "Retail & E-commerce",
    "Education",
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEditMode ? `Edit Business - ${business?.name}` : "Tambah Bisnis Baru"}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Workspace / Business / {isEditMode ? "Edit" : "Create"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main Form Area */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-border/60">
            <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="h-4.5 w-4.5 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Informasi Profil Bisnis</h2>
              <p className="text-xs text-muted-foreground">
                Detail identitas utama yang tersimpan di knowledge bisnis
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Nama Bisnis *
                </label>
                <input
                  type="text"
                  placeholder="Masukkan nama bisnis..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSaving}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Kategori Bisnis *
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  disabled={isSaving}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium text-foreground"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Deskripsi
                </label>
                <textarea
                  placeholder="Deskripsi singkat bisnis..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  disabled={isSaving}
                  rows={4}
                  className="w-full resize-none px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                />
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  Website
                </label>
                <div className="relative">
                  <Globe2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <input
                    type="url"
                    placeholder="https://example.com"
                    value={websiteUrl}
                    onChange={(e) => setWebsiteUrl(e.target.value)}
                    disabled={isSaving}
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/60">
              <button
                type="submit"
                disabled={isSaving}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:pointer-events-none disabled:opacity-60"
              >
                {isSaving ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Save className="h-4 w-4" />
                )}
                {isEditMode ? "Simpan Perubahan" : "Simpan Bisnis Baru"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                disabled={isSaving}
                className="px-5 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Logo Upload Card */}
        <div className="space-y-4">
          {business && (
            <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Ringkasan Akun
              </h3>
              <div className="space-y-3 pt-1">
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <User className="h-3.5 w-3.5" /> Owner
                  </span>
                  <span className="max-w-[160px] truncate font-semibold text-foreground">
                    {business.owner}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-muted-foreground">Status</span>
                  <span className="font-semibold text-foreground">{business.status}</span>
                </div>
                <div className="flex items-center justify-between gap-3 text-xs">
                  <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                    <Coins className="h-3.5 w-3.5" /> Balance
                  </span>
                  <span className="font-extrabold text-primary">
                    {formatNumber(business.balance)}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col items-center">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide self-start">
              Logo Bisnis
            </h3>

            <div className="h-28 w-28 rounded-2xl border-2 border-border overflow-hidden bg-muted shadow-md">
              <img
                src={logoUrl}
                alt="Business logo preview"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="w-full space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Logo URL
              </label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="url"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                  disabled={isSaving}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                />
              </div>
            </div>

            <div className="flex w-full justify-end pt-1">
              <button
                type="button"
                onClick={handleRandomLogo}
                disabled={isSaving}
                className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-border bg-muted px-3 py-2 text-xs font-semibold text-foreground transition-all hover:bg-muted/80"
                title="Acak logo"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Acak Logo
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
