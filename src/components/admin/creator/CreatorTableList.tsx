import React, { useState } from "react";
import {
  Search,
  Sparkles,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  Package,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { CreatorItem, MOCK_CREATORS } from "./types";
import { WithdrawalApprovalModal } from "./WithdrawalApprovalModal";

const LEVEL_CONFIG = {
  bronze: { label: "Bronze", className: "bg-amber-700/10 text-amber-700 border-amber-700/20" },
  silver: { label: "Silver", className: "bg-slate-400/15 text-slate-500 border-slate-400/25 dark:text-slate-400" },
  gold: { label: "Gold", className: "bg-yellow-500/10 text-yellow-600 border-yellow-500/20" },
  platinum: { label: "Platinum", className: "bg-violet-500/10 text-violet-600 border-violet-500/20 dark:text-violet-400" },
};

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Transfer Bank",
  paypal: "PayPal",
  dana: "DANA",
  gopay: "GoPay",
  ovo: "OVO",
};

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

type SortKey = "name" | "totalContent" | "totalSalesRevenue" | "availableBalance" | "pendingWithdrawal";

export function CreatorTableList() {
  const [creators, setCreators] = useState<CreatorItem[]>(MOCK_CREATORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCreator, setSelectedCreator] = useState<CreatorItem | null>(null);
  const [sortKey, setSortKey] = useState<SortKey>("totalSalesRevenue");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  const filtered = creators
    .filter(
      (c) =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.email.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      const aVal = a[sortKey] as number | string;
      const bVal = b[sortKey] as number | string;
      if (typeof aVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal);
      }
      return sortDir === "asc" ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });

  const totalPending = creators.reduce((s, c) => s + c.pendingWithdrawal, 0);
  const totalAvailable = creators.reduce((s, c) => s + c.availableBalance, 0);
  const totalRevenue = creators.reduce((s, c) => s + c.totalSalesRevenue, 0);
  const totalPendingCreators = creators.filter((c) => c.pendingWithdrawal > 0).length;

  const handleApprove = (creatorId: string, withdrawalId: string) => {
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id !== creatorId) return c;
        const req = c.withdrawalRequests.find((r) => r.id === withdrawalId);
        const amount = req?.amount ?? 0;
        return {
          ...c,
          availableBalance: c.availableBalance - amount,
          totalWithdrawn: c.totalWithdrawn + amount,
          pendingWithdrawal: c.pendingWithdrawal - amount,
          withdrawalRequests: c.withdrawalRequests.map((r) =>
            r.id === withdrawalId ? { ...r, status: "paid" as const } : r
          ),
        };
      })
    );
    setSelectedCreator(null);
  };

  const handleReject = (creatorId: string, withdrawalId: string) => {
    setCreators((prev) =>
      prev.map((c) => {
        if (c.id !== creatorId) return c;
        const req = c.withdrawalRequests.find((r) => r.id === withdrawalId);
        const amount = req?.amount ?? 0;
        return {
          ...c,
          pendingWithdrawal: c.pendingWithdrawal - amount,
          withdrawalRequests: c.withdrawalRequests.map((r) =>
            r.id === withdrawalId ? { ...r, status: "rejected" as const } : r
          ),
        };
      })
    );
    setSelectedCreator(null);
  };

  const SortIcon = ({ field }: { field: SortKey }) => {
    if (sortKey !== field) return <ChevronDown className="h-3 w-3 text-muted-foreground/40" />;
    return sortDir === "asc" ? (
      <ChevronUp className="h-3 w-3 text-primary" />
    ) : (
      <ChevronDown className="h-3 w-3 text-primary" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-violet-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                <Sparkles className="h-3.5 w-3.5" /> Creator Monetization
              </span>
              <span className="text-xs text-muted-foreground font-mono">Creator / Monetisasi</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Creator Monetization Dashboard</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Monitor saldo, penjualan template, dan kelola persetujuan pencairan dana kreator Postmatic.
            </p>
          </div>
        </div>
      </div>

      {/* Summary stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-violet-500" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Total Penjualan</p>
          </div>
          <p className="text-xl font-bold text-foreground">{formatIDR(totalRevenue)}</p>
          <p className="text-[10px] text-muted-foreground">{creators.length} kreator aktif</p>
        </div>
        <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 flex items-center justify-center">
              <DollarSign className="h-4 w-4 text-emerald-500" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Saldo Tersedia</p>
          </div>
          <p className="text-xl font-bold text-emerald-600">{formatIDR(totalAvailable)}</p>
          <p className="text-[10px] text-muted-foreground">Total saldo semua kreator</p>
        </div>
        <div className="bg-card border border-amber-500/20 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 flex items-center justify-center">
              <AlertCircle className="h-4 w-4 text-amber-500" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Pending Pencairan</p>
          </div>
          <p className="text-xl font-bold text-amber-600">{formatIDR(totalPending)}</p>
          <p className="text-[10px] text-muted-foreground">{totalPendingCreators} kreator menunggu approval</p>
        </div>
        <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <Package className="h-4 w-4 text-primary" />
            </div>
            <p className="text-xs font-semibold text-muted-foreground">Total Konten</p>
          </div>
          <p className="text-xl font-bold text-foreground">{creators.reduce((s, c) => s + c.totalContent, 0)}</p>
          <p className="text-[10px] text-muted-foreground">Template dipublikasikan</p>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari kreator berdasarkan nama atau email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} kreator</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th
                className="py-3 px-4 cursor-pointer select-none"
                onClick={() => handleSort("name")}
              >
                <span className="flex items-center gap-1">Kreator <SortIcon field="name" /></span>
              </th>
              <th
                className="py-3 px-4 cursor-pointer select-none"
                onClick={() => handleSort("totalContent")}
              >
                <span className="flex items-center gap-1">Jumlah Konten <SortIcon field="totalContent" /></span>
              </th>
              <th
                className="py-3 px-4 cursor-pointer select-none"
                onClick={() => handleSort("totalSalesRevenue")}
              >
                <span className="flex items-center gap-1">Total Penjualan <SortIcon field="totalSalesRevenue" /></span>
              </th>
              <th
                className="py-3 px-4 cursor-pointer select-none"
                onClick={() => handleSort("availableBalance")}
              >
                <span className="flex items-center gap-1">Saldo Tersedia <SortIcon field="availableBalance" /></span>
              </th>
              <th
                className="py-3 px-4 cursor-pointer select-none"
                onClick={() => handleSort("pendingWithdrawal")}
              >
                <span className="flex items-center gap-1">Pending Cair <SortIcon field="pendingWithdrawal" /></span>
              </th>
              <th className="py-3 px-4">Metode Bayar</th>
              <th className="py-3 pr-4 pl-3 text-right w-[130px]">Approval</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-8 w-8 text-muted-foreground/40" />
                    <p className="text-sm font-medium">Tidak ada kreator ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((creator) => {
                const { label: levelLabel, className: levelClass } = LEVEL_CONFIG[creator.level];
                const hasPending = creator.pendingWithdrawal > 0;

                return (
                  <tr
                    key={creator.id}
                    className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card"
                  >
                    {/* Profile + Name */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-3">
                        <img
                          src={creator.avatar}
                          alt={creator.name}
                          className="h-9 w-9 rounded-xl border border-border bg-muted object-cover shrink-0"
                        />
                        <div>
                          <p className="text-sm font-bold text-foreground leading-tight">{creator.name}</p>
                          <p className="text-[11px] text-muted-foreground">{creator.email}</p>
                          <span className={`inline-flex items-center mt-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border ${levelClass}`}>
                            {levelLabel}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Jumlah Konten */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex items-center gap-1.5">
                        <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm font-bold text-foreground">{creator.totalContent}</span>
                        <span className="text-xs text-muted-foreground">template</span>
                      </div>
                    </td>

                    {/* Total Penjualan */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-sm font-bold text-foreground">{formatIDR(creator.totalSalesRevenue)}</span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <CheckCircle2 className="h-3 w-3 text-emerald-500" /> Sudah cair: {formatIDR(creator.totalWithdrawn)}
                        </span>
                      </div>
                    </td>

                    {/* Saldo Tersedia */}
                    <td className="py-4 px-4 align-top">
                      <span className="text-sm font-bold text-emerald-600">{formatIDR(creator.availableBalance)}</span>
                    </td>

                    {/* Pending */}
                    <td className="py-4 px-4 align-top">
                      {hasPending ? (
                        <span className="inline-flex items-center gap-1 text-sm font-bold text-amber-600 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-lg">
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" />{formatIDR(creator.pendingWithdrawal)}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </td>

                    {/* Metode Bayar */}
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs font-semibold text-foreground">{PAYMENT_METHOD_LABELS[creator.paymentMethod]}</span>
                        {creator.bankName && (
                          <span className="text-[10px] text-muted-foreground">{creator.bankName}</span>
                        )}
                        <span className="text-[10px] text-muted-foreground font-mono">{creator.accountNumber}</span>
                      </div>
                    </td>

                    {/* Approval Button */}
                    <td className="py-4 pr-4 pl-3 text-right align-top">
                      <button
                        type="button"
                        onClick={() => setSelectedCreator(creator)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-150 shadow-sm ${
                          hasPending
                            ? "bg-violet-500 text-white hover:bg-violet-600 shadow-violet-500/20"
                            : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                        }`}
                      >
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        {hasPending ? "Review" : "Detail"}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground">
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{creators.length}</strong> kreator
        </div>
      </div>

      {/* Withdrawal Approval Modal */}
      {selectedCreator && (
        <WithdrawalApprovalModal
          creator={selectedCreator}
          onClose={() => setSelectedCreator(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
