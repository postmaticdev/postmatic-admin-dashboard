import React, { useState, useEffect } from "react";
import { InjectHistoryItem, getStoredHistory, injectTokens } from "./store";
import { InjectTokenModal } from "./InjectTokenModal";
import { Building2, Search, Coins, Plus, Calendar, User, DollarSign, X } from "lucide-react";
import { toast } from "sonner";

// Detail Modal for selected row
function InjectDetailModal({
  item,
  onClose,
}: {
  item: InjectHistoryItem;
  onClose: () => void;
}) {
  const formatNumber = (num: number) => num.toLocaleString("id-ID");
  
  const formatDateTime = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
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

        {/* Content */}
        <div className="px-6 pb-6 pt-6 space-y-4">
          <div className="text-center pt-2">
            <div className="h-16 w-16 rounded-2xl border-4 border-card shadow-md overflow-hidden bg-muted mx-auto">
              <img src={item.businessLogoUrl} alt={item.businessName} className="h-full w-full object-cover" />
            </div>
            <h3 className="text-base font-bold text-foreground mt-3">{item.businessName}</h3>
            <p className="text-xs text-muted-foreground">{item.businessCategory}</p>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Total Token Inject</span>
                <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400 mt-1 flex items-center gap-1">
                  <Coins className="h-4 w-4" /> {formatNumber(item.totalTokens)}
                </span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Price (Harga)</span>
                <span className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-0.5">
                  Rp {formatNumber(item.price)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-border/40 pt-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> Tanggal & Waktu</span>
                <span className="font-semibold text-foreground">{formatDateTime(item.dateTime)}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground flex items-center gap-1.5"><User className="h-3.5 w-3.5" /> Injector (Admin)</span>
                <span className="font-semibold text-foreground">{item.adminName}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-full mt-2 py-2.5 rounded-xl border border-border bg-muted hover:bg-muted/80 text-sm font-semibold text-muted-foreground hover:text-foreground transition-all"
          >
            Tutup Detail
          </button>
        </div>
      </div>
    </div>
  );
}

export function TokenInjectContainer() {
  const [history, setHistory] = useState<InjectHistoryItem[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showInjectModal, setShowInjectModal] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState<InjectHistoryItem | null>(null);

  // Load stored history on load
  const loadHistory = () => {
    setHistory(getStoredHistory());
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleInjectToken = (businessId: string, amount: number) => {
    // Current logged-in user simulation or defaults to Super Admin
    const result = injectTokens(businessId, amount, "Super Admin");
    if (result.success) {
      toast.success(`Berhasil menyuntikkan ${amount.toLocaleString("id-ID")} token ke ${result.businessName}!`);
      loadHistory();
      setShowInjectModal(false);
    } else {
      toast.error("Gagal melakukan token injection.");
    }
  };

  const filteredHistory = history.filter((item) =>
    item.businessName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.adminName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Scorecard calculations
  const totalTokensInjected = history.reduce((sum, item) => sum + item.totalTokens, 0);
  const totalInjectTransactions = history.length;
  const uniqueBusinessesFunded = new Set(history.map((item) => item.businessId)).size;

  const formatNumber = (num: number) => num.toLocaleString("id-ID");

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-violet-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Coins className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  Business Management
                </span>
                <span className="text-xs text-muted-foreground font-mono">/ Token Inject</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Token Inject</h1>
              <p className="text-sm text-muted-foreground">Kelola riwayat penyuntikan saldo token kecerdasan buatan klien.</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInjectModal(true)}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" /> Inject Token
          </button>
        </div>
      </div>

      {/* Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Injected Tokens</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{formatNumber(totalTokensInjected)}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Kumulatif saldo terisi</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <Coins className="h-6 w-6 text-violet-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/60 to-violet-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Transaksi Inject</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{totalInjectTransactions}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Total suntikan berhasil</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 to-emerald-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Bisnis Terisi</p>
              <p className="text-3xl font-extrabold text-foreground mt-1">{uniqueBusinessesFunded}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Klien bisnis disuntik saldo</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 to-blue-500/10 rounded-b-2xl" />
        </div>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari bisnis atau nama admin..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all text-foreground"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filteredHistory.length} riwayat</span>
      </div>

      {/* History Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4">Profile & Business Name</th>
              <th className="py-3 px-4 text-right">Total Token Inject</th>
              <th className="py-3 px-4 text-right">Price (Harga)</th>
              <th className="py-3 pr-4 pl-3 text-right">Date & Time</th>
            </tr>
          </thead>
          <tbody>
            {filteredHistory.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Coins className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">Belum ada riwayat token injection.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredHistory.map((item) => (
                <tr
                  key={item.id}
                  onClick={() => setSelectedHistory(item)}
                  className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                        <img src={item.businessLogoUrl} alt={item.businessName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{item.businessName}</p>
                        <p className="text-[11px] text-muted-foreground">{item.businessCategory}</p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-sm text-foreground">
                    <div className="flex items-center justify-end gap-1 text-primary">
                      <Coins className="h-3.5 w-3.5 text-yellow-500" />
                      <span>{formatNumber(item.totalTokens)} Token</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-sm text-emerald-600 dark:text-emerald-400">
                    Rp {formatNumber(item.price)}
                  </td>
                  <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">
                      {new Date(item.dateTime).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })} &bull; {new Date(item.dateTime).toLocaleTimeString("id-ID", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground">
          Menampilkan <strong>{filteredHistory.length}</strong> dari <strong>{history.length}</strong> riwayat
        </div>
      </div>

      {/* Inject Token Modal Popup */}
      {showInjectModal && (
        <InjectTokenModal
          onClose={() => setShowInjectModal(false)}
          onInject={handleInjectToken}
        />
      )}

      {/* Row Details Modal Popup */}
      {selectedHistory && (
        <InjectDetailModal
          item={selectedHistory}
          onClose={() => setSelectedHistory(null)}
        />
      )}
    </div>
  );
}
