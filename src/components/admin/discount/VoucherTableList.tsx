import React, { useState } from "react";
import { VoucherItem } from "./types";
import { formatIDR } from "./utils";
import {
  Plus,
  Edit3,
  Search,
  Wallet,
  CheckCircle2,
  Clock,
  Filter,
  Copy,
  X,
  Calendar,
  Info,
} from "lucide-react";
import { toast } from "sonner";

interface VoucherTableListProps {
  items: VoucherItem[];
  onCreateNew: () => void;
  onEdit: (item: VoucherItem) => void;
  onToggleStatus: (id: string) => void;
}

function TableRow({
  item,
  onEdit,
  onToggleStatus,
  onRowClick,
}: {
  item: VoucherItem;
  onEdit: (item: VoucherItem) => void;
  onToggleStatus: (id: string) => void;
  onRowClick: () => void;
}) {
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode voucher "${code}" disalin!`);
  };

  return (
    <tr
      onClick={onRowClick}
      className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
    >
      <td className="py-4 px-4 max-w-[200px]">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {item.name}
          </span>
        </div>
      </td>

      <td className="py-4 px-4 whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20">
            {item.code}
          </span>
          <button
            onClick={() => handleCopy(item.code)}
            className="text-muted-foreground hover:text-primary transition-colors"
            title="Salin Kode Voucher"
          >
            <Copy className="h-3.5 w-3.5" />
          </button>
        </div>
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <span className="text-[11px] text-muted-foreground">
            {item.startDate} - {item.endDate || "Tanpa Kedaluwarsa"}
          </span>
        </div>
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <span className="text-xs font-medium">
          {item.type === "Percentage" ? `${item.discountValue}%` : formatIDR(item.discountValue)}
        </span>
      </td>

      <td className="py-4 px-4 min-w-[200px]">
        <div className="flex flex-col gap-1 text-xs text-muted-foreground">
          <span>Min Order: <span className="font-medium text-foreground">{formatIDR(item.minOrder)}</span></span>
          <span>Max Discount: <span className="font-medium text-foreground">{item.maxDiscount ? formatIDR(item.maxDiscount) : "Tidak Ada"}</span></span>
        </div>
      </td>

      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex items-center gap-1.5">
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
        </div>
      </td>

      <td className="py-4 pr-4 pl-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <div
            className="flex items-center gap-2"
            title={item.status === "Active" ? "Ubah status ke Inactive" : "Ubah status ke Active"}
          >
            <button
              type="button"
              onClick={() => onToggleStatus(item.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                item.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  item.status === "Active" ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

function VoucherDetailModal({
  item,
  onClose,
  onEdit,
}: {
  item: VoucherItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success(`Kode voucher "${code}" disalin!`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-20 bg-gradient-to-br from-blue-500/20 via-blue-500/10 to-transparent" />
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-6 space-y-4 text-left">
          <div>
            <h3 className="text-base font-bold text-foreground leading-tight">{item.name}</h3>
            <span className="text-[10px] text-muted-foreground mt-0.5 block">Kupon Diskon Platform</span>
          </div>

          <div className="p-3 bg-muted/40 border border-border/50 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-wide block">Kode Kupon</span>
              <span className="text-sm font-extrabold text-foreground tracking-wider font-mono">{item.code}</span>
            </div>
            <button
              onClick={() => handleCopy(item.code)}
              className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all"
            >
              <Copy className="h-3.5 w-3.5" /> Salin Kode
            </button>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-3.5">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Nilai Diskon</span>
                <span className="text-sm font-extrabold text-violet-600 dark:text-violet-400 mt-1 block">
                  {item.type === "Percentage" ? `${item.discountValue}%` : formatIDR(item.discountValue)}
                </span>
              </div>
              <div className="p-3 bg-muted/30 border border-border/50 rounded-xl">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Tipe Diskon</span>
                <span className="text-sm font-semibold text-foreground mt-1 block">
                  {item.type}
                </span>
              </div>
            </div>

            <div className="space-y-2 border-t border-border/40 pt-3 text-xs text-muted-foreground">
              <div className="flex items-center justify-between">
                <span>Minimal Pembelian</span>
                <span className="font-semibold text-foreground">{formatIDR(item.minOrder)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Maksimal Diskon</span>
                <span className="font-semibold text-foreground">{item.maxDiscount ? formatIDR(item.maxDiscount) : "Tidak Ada"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" /> Masa Berlaku</span>
                <span className="font-semibold text-foreground">{item.startDate} &rarr; {item.endDate || "Unlimited"}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/30 pt-2">
                <span>Status</span>
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
              <Edit3 className="h-3.5 w-3.5" />Edit Voucher
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

export function VoucherTableList({
  items,
  onCreateNew,
  onEdit,
  onToggleStatus,
}: VoucherTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatusFilter, setSelectedStatusFilter] = useState("ALL");
  const [selectedVoucher, setSelectedVoucher] = useState<VoucherItem | null>(null);

  const statusCategories = ["ALL", "Active", "Inactive"];

  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatusFilter === "ALL" || item.status === selectedStatusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <Wallet className="h-3.5 w-3.5" />
                Discount
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Workspace / Voucher
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Voucher Manager
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Kelola voucher diskon untuk pengguna platform Postmatic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              Create New Voucher
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama atau kode voucher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Status:</span>
          </div>
          <select
            value={selectedStatusFilter}
            onChange={(e) => setSelectedStatusFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {statusCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "Semua Status" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4">Nama Voucher</th>
              <th className="py-3 px-4">Kode Voucher</th>
              <th className="py-3 px-4">Tanggal Kedaluwarsa</th>
              <th className="py-3 px-4">Nilai Diskon</th>
              <th className="py-3 px-4">Ketentuan Diskon</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 pr-4 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Wallet className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">
                      Tidak ada voucher yang ditemukan.
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      Coba sesuaikan filter atau klik &quot;Create New Voucher&quot;.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onRowClick={() => setSelectedVoucher(item)}
                />
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Menampilkan <strong>{filteredItems.length}</strong> dari{" "}
            <strong>{items.length}</strong> voucher
          </span>
        </div>
      </div>

      {/* Voucher Detail Modal */}
      {selectedVoucher && (
        <VoucherDetailModal
          item={selectedVoucher}
          onClose={() => setSelectedVoucher(null)}
          onEdit={() => { onEdit(selectedVoucher); setSelectedVoucher(null); }}
        />
      )}
    </div>
  );
}
