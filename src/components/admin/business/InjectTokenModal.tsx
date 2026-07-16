import React, { useState } from "react";
import { BusinessAccount } from "./types";
import { getStoredBusinesses } from "./store";
import { Search, X, Coins, Check, ArrowRight, Building2 } from "lucide-react";
import { toast } from "sonner";

interface InjectTokenModalProps {
  onClose: () => void;
  onInject: (businessId: string, amount: number) => void;
}

// Formatting helpers
const formatNumber = (num: number) => {
  return num.toLocaleString("id-ID");
};

const formatNumberString = (val: number | string) => {
  const clean = String(val).replace(/\D/g, "");
  if (!clean) return "";
  return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseFormattedNumber = (val: string) => {
  const clean = val.replace(/\./g, "");
  return Number(clean) || 0;
};

export function InjectTokenModal({ onClose, onInject }: InjectTokenModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccount | null>(null);
  const [tokenInput, setTokenInput] = useState("");

  const businesses = getStoredBusinesses();

  const filtered = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
    b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTokenInput(formatNumberString(e.target.value));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedBusiness) {
      toast.error("Harap pilih bisnis terlebih dahulu!");
      return;
    }
    const amount = parseFormattedNumber(tokenInput);
    if (amount <= 0) {
      toast.error("Harap masukkan jumlah token yang valid!");
      return;
    }
    onInject(selectedBusiness.id, amount);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-20 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Floating Icon */}
        <div className="absolute top-8 left-6">
          <div className="h-14 w-14 rounded-2xl border-4 border-card shadow-lg bg-violet-600 flex items-center justify-center text-white">
            <Coins className="h-6 w-6" />
          </div>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-8 space-y-5">
          <div className="pt-2">
            <h2 className="text-lg font-bold text-foreground">Inject Token</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Lakukan penyuntikan token ke salah satu bisnis terdaftar</p>
          </div>

          {!selectedBusiness ? (
            /* Step 1: Search and Select Business */
            <div className="space-y-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Cari bisnis..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground"
                />
              </div>

              <div className="max-h-[220px] overflow-y-auto pr-1 space-y-2">
                {filtered.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">Tidak ada bisnis ditemukan.</p>
                ) : (
                  filtered.map((b) => (
                    <div
                      key={b.id}
                      onClick={() => setSelectedBusiness(b)}
                      className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-card hover:bg-muted/40 cursor-pointer select-none transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                          <img src={b.logoUrl} alt={b.name} className="h-full w-full object-cover" />
                        </div>
                        <div className="text-left">
                          <h4 className="text-xs font-bold text-foreground leading-tight">{b.name}</h4>
                          <span className="text-[10px] text-muted-foreground mt-0.5 block">{b.category}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  ))
                )}
              </div>
            </div>
          ) : (
            /* Step 2: Show Selected Business Card & Amount Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Selected Business Card */}
              <div className="relative flex items-start gap-3 p-4 rounded-xl border-2 border-primary/20 bg-primary/[0.02]">
                <div className="h-12 w-12 rounded-xl border border-border overflow-hidden bg-background shrink-0 shadow-sm">
                  <img src={selectedBusiness.logoUrl} alt={selectedBusiness.name} className="h-full w-full object-cover" />
                </div>
                <div className="flex-1 min-w-0 pr-6 text-left">
                  <h4 className="text-sm font-bold text-foreground truncate">{selectedBusiness.name}</h4>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{selectedBusiness.category}</p>
                  
                  <div className="grid grid-cols-2 gap-3 mt-3 pt-2.5 border-t border-border/40">
                    <div>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Owner</span>
                      <span className="text-[11px] font-semibold text-foreground truncate block">{selectedBusiness.owner}</span>
                    </div>
                    <div>
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider block">Balance</span>
                      <span className="text-[11px] font-extrabold text-foreground flex items-center gap-0.5 mt-0.5">
                        <Coins className="h-3 w-3 text-yellow-500" /> {formatNumber(selectedBusiness.balance)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Reset Business Selection (X) */}
                <button
                  type="button"
                  onClick={() => { setSelectedBusiness(null); setTokenInput(""); }}
                  className="absolute top-2 right-2 p-1 rounded-lg border border-border hover:bg-muted text-muted-foreground transition-colors"
                  title="Pilih bisnis lain"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Form Input Token */}
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Jumlah Token Inject *</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Contoh: 5.000.000"
                    value={tokenInput}
                    onChange={handleInputChange}
                    required
                    autoFocus
                    className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-bold text-foreground"
                  />
                  <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                </div>
                <p className="text-[10px] text-muted-foreground">Format numbering ribuan menggunakan pemisah dot (.)</p>
              </div>

              {/* Buttons */}
              <div className="flex gap-2 pt-2 border-t border-border/40">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-violet-600 hover:bg-violet-700 transition-all shadow-md shadow-violet-600/20"
                >
                  <Coins className="h-4 w-4" /> Inject Token
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                >
                  Batal
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
