import React, { useState, useRef } from "react";
import { BusinessAccount } from "./types";
import { ArrowLeft, Save, ShieldAlert, KeyRound, Building2, Upload, Camera, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface BusinessFormViewProps {
  business: BusinessAccount | null;
  onSave: (data: Omit<BusinessAccount, "id">, id?: string) => void;
  onCancel: () => void;
}

// Formatting helper for input
const formatNumberString = (val: number | string) => {
  const clean = String(val).replace(/\D/g, "");
  if (!clean) return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseFormattedNumber = (val: string) => {
  const clean = val.replace(/\./g, "");
  return Number(clean) || 0;
};

export function BusinessFormView({ business, onSave, onCancel }: BusinessFormViewProps) {
  const isEditMode = Boolean(business);
  const [name, setName] = useState(business?.name || "");
  const [owner, setOwner] = useState(business?.owner || "");
  const [category, setCategory] = useState(business?.category || "Information Technology");
  const [status, setStatus] = useState<"Paid" | "Free">(business?.status || "Free");
  const [balanceInput, setBalanceInput] = useState(
    business ? formatNumberString(business.balance) : "100.000"
  );
  const [logoUrl, setLogoUrl] = useState(
    business?.logoUrl || `https://api.dicebear.com/7.x/initials/svg?seed=Biz&backgroundColor=4f46e5`
  );

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleRandomLogo = () => {
    const randomSeed = Math.random().toString(36).substring(7);
    setLogoUrl(`https://api.dicebear.com/7.x/initials/svg?seed=${randomSeed}&backgroundColor=4f46e5`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBalanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBalanceInput(formatNumberString(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim() || !owner.trim() || !category.trim()) {
      toast.error("Harap isi semua kolom wajib!");
      return;
    }

    const balance = parseFormattedNumber(balanceInput);

    onSave(
      {
        name,
        owner,
        category,
        status,
        balance,
        logoUrl,
        joinedAt: business?.joinedAt || new Date().toISOString().split("T")[0],
      },
      business?.id
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
          <ArrowLeft className="h-4 w-4" />Kembali
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
              <p className="text-xs text-muted-foreground">Detail mengenai identitas, kategori, dan saldo awal bisnis</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Business Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Bisnis *</label>
                <input
                  type="text"
                  placeholder="Masukkan nama bisnis..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                />
              </div>

              {/* Owner */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Owner / Pemilik *</label>
                <input
                  type="text"
                  placeholder="Nama pemilik bisnis..."
                  value={owner}
                  onChange={(e) => setOwner(e.target.value)}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                />
              </div>

              {/* Category */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Kategori Bisnis *</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium text-foreground"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status Paid/Free */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Status Langganan</label>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setStatus("Paid")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      status === "Paid"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/50 shadow-sm"
                        : "bg-background text-muted-foreground border-border hover:bg-muted/30"
                    }`}
                  >
                    Paid Account
                  </button>
                  <button
                    type="button"
                    onClick={() => setStatus("Free")}
                    className={`flex-1 py-2.5 text-xs font-bold rounded-xl border transition-all ${
                      status === "Free"
                        ? "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/50 shadow-sm"
                        : "bg-background text-slate-500 border-border hover:bg-muted/30"
                    }`}
                  >
                    Free Account
                  </button>
                </div>
              </div>

              {/* Balance (Tokens) */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {isEditMode ? "Saldo Balance (Token) *" : "Saldo Token Awal *"}
                </label>
                <input
                  type="text"
                  placeholder="Contoh: 10.000"
                  value={balanceInput}
                  onChange={handleBalanceChange}
                  required
                  className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold"
                />
                <p className="text-[10px] text-muted-foreground">Format numbering ribuan terpisah tanda dot (.)</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-3 pt-4 border-t border-border/60">
              <button
                type="submit"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all font-semibold"
              >
                <Save className="h-4 w-4" />
                {isEditMode ? "Simpan Perubahan" : "Simpan Bisnis Baru"}
              </button>
              <button
                type="button"
                onClick={onCancel}
                className="px-5 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              >
                Batal
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar Logo Upload Card */}
        <div className="space-y-4">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4 flex flex-col items-center">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide self-start">Logo Bisnis</h3>
            
            <div className="relative group mt-2">
              <div className="h-28 w-28 rounded-2xl border-2 border-border overflow-hidden bg-muted shadow-md transition-all group-hover:opacity-95">
                <img src={logoUrl} alt="Business logo preview" className="h-full w-full object-cover" />
              </div>
              <div className="absolute inset-0 bg-black/40 rounded-2xl opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="flex gap-2 w-full pt-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-all shadow-sm"
              >
                <Upload className="h-3.5 w-3.5" /> Upload File
              </button>
              <button
                type="button"
                onClick={handleRandomLogo}
                className="inline-flex items-center justify-center p-2 rounded-xl border border-border bg-muted hover:bg-muted/80 text-foreground transition-all"
                title="Acak logo"
              >
                <Sparkles className="h-4 w-4" />
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
              Klik area logo atau tombol di atas untuk mengganti logo dari galeri file Anda.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
