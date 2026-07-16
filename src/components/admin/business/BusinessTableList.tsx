import React, { useState } from "react";
import { BusinessAccount } from "./types";
import { Search, Edit3, Building2, CheckCircle2, Clock, Coins, HelpCircle, X, Calendar, Info } from "lucide-react";

interface BusinessTableListProps {
  items: BusinessAccount[];
  onEdit: (item: BusinessAccount) => void;
}

// Format number with thousand separator
const formatNumber = (num: number) => {
  return num.toLocaleString("id-ID");
};

function StatusBadge({ status }: { status: BusinessAccount["status"] }) {
  if (status === "Paid") {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
        <CheckCircle2 className="h-3 w-3" /> Paid Business
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-600 dark:text-slate-400 bg-slate-500/10 px-2 py-0.5 rounded-md border border-slate-500/20">
      <Clock className="h-3 w-3" /> Free Account
    </span>
  );
}

function BusinessDetailModal({
  business,
  onClose,
  onEdit,
}: {
  business: BusinessAccount;
  onClose: () => void;
  onEdit: () => void;
}) {
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-20 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent" />

        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-6 pb-6 pt-6 space-y-4">
          <div className="text-center pt-2">
            <div className="h-16 w-16 rounded-2xl border-4 border-card shadow-md overflow-hidden bg-muted mx-auto">
              <img src={business.logoUrl} alt={business.name} className="h-full w-full object-cover" />
            </div>
            <h3 className="text-base font-bold text-foreground mt-3">{business.name}</h3>
            <p className="text-xs text-muted-foreground">{business.category}</p>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Owner</span>
                <span className="text-sm font-semibold text-foreground mt-1 block truncate">
                  {business.owner}
                </span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Current Balance</span>
                <span className="text-sm font-extrabold text-primary mt-1 flex items-center gap-1">
                  <Coins className="h-4 w-4 text-yellow-500" /> {business.balance.toLocaleString("id-ID")}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-border/40 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tanggal Bergabung</span>
                <span className="font-semibold text-foreground">{formatDateTime(business.joinedAt)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Status Keanggotaan</span>
                <StatusBadge status={business.status} />
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />Edit Bisnis
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function BusinessTableList({ items, onEdit }: BusinessTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBusiness, setSelectedBusiness] = useState<BusinessAccount | null>(null);

  const filtered = items.filter(
    (b) =>
      b.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalBusiness = items.length;
  const paidBusiness = items.filter((b) => b.status === "Paid").length;
  const freeBusiness = items.filter((b) => b.status === "Free").length;

  return (
    <>
      {/* Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Business</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalBusiness}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Terdaftar di platform</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 to-blue-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Paid Business</p>
              <p className="text-3xl font-bold text-foreground mt-1">{paidBusiness}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Menggunakan plan berbayar</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 to-emerald-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Free Account</p>
              <p className="text-3xl font-bold text-foreground mt-1">{freeBusiness}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Menggunakan plan gratis</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-slate-500/10 flex items-center justify-center">
              <HelpCircle className="h-6 w-6 text-slate-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-slate-500/60 to-slate-500/10 rounded-b-2xl" />
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama bisnis, owner, atau kategori..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} business</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4">Profile & Nama Business</th>
              <th className="py-3 px-4">Owner</th>
              <th className="py-3 px-4">Business Category</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Balance (Token)</th>
              <th className="py-3 pr-4 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Building2 className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">Tidak ada business ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((business) => (
                <tr
                  key={business.id}
                  onClick={() => setSelectedBusiness(business)}
                  className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                        <img src={business.logoUrl} alt={business.name} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{business.name}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Sejak {new Date(business.joinedAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-foreground font-medium">{business.owner}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-muted-foreground">{business.category}</span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={business.status} />
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-sm text-foreground">
                    <div className="flex items-center justify-end gap-1 text-primary">
                      <Coins className="h-3.5 w-3.5 text-yellow-500" />
                      <span>{formatNumber(business.balance)}</span>
                    </div>
                  </td>
                  <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onEdit(business)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground">
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{items.length}</strong> business
        </div>
      </div>

      {/* Business Detail Modal */}
      {selectedBusiness && (
        <BusinessDetailModal
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          onEdit={() => { onEdit(selectedBusiness); setSelectedBusiness(null); }}
        />
      )}
    </>
  );
}
