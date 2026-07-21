import React, { useState } from "react";
import { PaymentMethodItem } from "./types";
import { formatIDR } from "./utils";
import {
  Plus,
  Edit3,
  Search,
  CreditCard,
  CheckCircle2,
  Clock,
  X,
  AlertCircle,
  Loader2,
  RefreshCw,
} from "lucide-react";

interface PaymentTableListProps {
  items: PaymentMethodItem[];
  isLoading?: boolean;
  errorMessage?: string;
  loadingDetailId?: string | null;
  togglingStatusId?: string | null;
  onCreateNew: () => void;
  onEdit: (item: PaymentMethodItem) => void;
  onToggleStatus: (id: string) => void;
  onRetry?: () => void;
}

function TableRow({
  item,
  isLoadingDetail,
  isTogglingStatus,
  onEdit,
  onToggleStatus,
  onRowClick,
}: {
  item: PaymentMethodItem;
  isLoadingDetail?: boolean;
  isTogglingStatus?: boolean;
  onEdit: (item: PaymentMethodItem) => void;
  onToggleStatus: (id: string) => void;
  onRowClick: () => void;
}) {
  return (
    <tr
      onClick={onRowClick}
      className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
    >
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {item.logoUrl ? (
              <img
                src={item.logoUrl}
                alt={item.name}
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block font-semibold text-sm text-foreground group-hover:text-primary transition-colors truncate">
              {item.name}
            </span>
            <span className="block text-[11px] font-medium text-muted-foreground uppercase">
              {item.code} / {item.type}
            </span>
          </div>
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="text-sm font-medium">
          {item.adminFeeType === "Percentage" ? `${item.adminFee}%` : formatIDR(item.adminFee)}
        </span>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="text-sm font-medium">
          {item.otherFeeType === "Percentage" ? `${item.otherFee}%` : formatIDR(item.otherFee)}
        </span>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        {item.status === "Active" ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="h-3 w-3" />
            Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
            <Clock className="h-3 w-3" />
            Inactive
          </span>
        )}
      </td>
      <td
        className="py-4 pr-4 pl-3 text-right whitespace-nowrap"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            disabled={isLoadingDetail}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm disabled:pointer-events-none disabled:opacity-60"
          >
            {isLoadingDetail ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Edit3 className="h-3.5 w-3.5" />
            )}
            Edit
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(item.id)}
            disabled={isTogglingStatus}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 disabled:opacity-70 ${item.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${item.status === "Active" ? "translate-x-4" : "translate-x-0.5"}`}
            />
          </button>
        </div>
      </td>
    </tr>
  );
}

function PaymentDetailModal({
  item,
  onClose,
  onEdit,
}: {
  item: PaymentMethodItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-20 bg-gradient-to-br from-emerald-500/20 via-emerald-500/10 to-transparent" />

        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-6 space-y-4">
          <div className="text-center pt-2">
            <div className="h-16 w-16 rounded-2xl border-4 border-card shadow-md overflow-hidden bg-muted mx-auto flex items-center justify-center">
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name} className="h-12 w-12 object-contain" />
              ) : (
                <CreditCard className="h-6 w-6 text-muted-foreground" />
              )}
            </div>
            <h3 className="text-base font-bold text-foreground mt-3">{item.name}</h3>
            <p className="text-xs text-muted-foreground uppercase">
              {item.code} / {item.type}
            </p>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-3">
            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                  Biaya Admin
                </span>
                <span className="text-sm font-semibold text-foreground mt-1 block">
                  {item.adminFeeType === "Percentage"
                    ? `${item.adminFee}%`
                    : formatIDR(item.adminFee)}
                </span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">
                  Biaya Lain-lain
                </span>
                <span className="text-sm font-semibold text-foreground mt-1 block">
                  {item.otherFeeType === "Percentage"
                    ? `${item.otherFee}%`
                    : formatIDR(item.otherFee)}
                </span>
              </div>
            </div>

            <div className="space-y-2.5 border-t border-border/40 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Status Aktif</span>
                {item.status === "Active" ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                    Active
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                    Inactive
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />
              Edit Metode
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

export function PaymentTableList({
  items,
  isLoading = false,
  errorMessage,
  loadingDetailId,
  togglingStatusId,
  onCreateNew,
  onEdit,
  onToggleStatus,
  onRetry,
}: PaymentTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedPayment, setSelectedPayment] = useState<PaymentMethodItem | null>(null);

  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-emerald-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
                <CreditCard className="h-3.5 w-3.5" />
                Payment
              </span>
              <span className="text-xs text-muted-foreground font-mono">Workspace / Payment</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Payment Method Manager
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Kelola metode pembayaran yang tersedia di platform Postmatic.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            Create Payment Method
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari metode pembayaran..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="max-h-[520px] overflow-auto md:max-h-[calc(100vh-22rem)]">
          <table className="w-full min-w-[720px] text-left border-collapse">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground shadow-sm">
                <th className="py-3 px-4">Logo & Nama Payment</th>
                <th className="py-3 px-4">Biaya Admin</th>
                <th className="py-3 px-4">Biaya Lain-lain</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pr-4 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat payment method...
                    </div>
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2 font-semibold text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Gagal memuat payment method.
                      </div>
                      <p className="text-xs">{errorMessage}</p>
                      {onRetry && (
                        <button
                          type="button"
                          onClick={onRetry}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground hover:bg-muted transition-colors"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Coba lagi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-muted-foreground">
                    Metode pembayaran tidak ditemukan.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <TableRow
                    key={item.id}
                    item={item}
                    isLoadingDetail={loadingDetailId === item.id}
                    isTogglingStatus={togglingStatusId === item.id}
                    onEdit={onEdit}
                    onToggleStatus={onToggleStatus}
                    onRowClick={() => setSelectedPayment(item)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPayment && (
        <PaymentDetailModal
          item={selectedPayment}
          onClose={() => setSelectedPayment(null)}
          onEdit={() => {
            onEdit(selectedPayment);
            setSelectedPayment(null);
          }}
        />
      )}
    </div>
  );
}
