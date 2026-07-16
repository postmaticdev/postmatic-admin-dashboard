import React, { useState } from "react";
import { VoucherItem, DiscountType } from "./types";
import { formatNumberString, parseNumberString } from "./utils";
import {
  ArrowLeft,
  Save,
  Trash2,
  AlertTriangle,
  Gift,
} from "lucide-react";

interface VoucherFormViewProps {
  initialItem: VoucherItem | null;
  onSave: (data: Omit<VoucherItem, "id">, id?: string) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function VoucherFormView({
  initialItem,
  onSave,
  onCancel,
  onDelete,
}: VoucherFormViewProps) {
  const isEditMode = Boolean(initialItem);

  const [name, setName] = useState(initialItem?.name || "");
  const [code, setCode] = useState(initialItem?.code || "");
  const [startDate, setStartDate] = useState(initialItem?.startDate || "");
  const [hasExpiry, setHasExpiry] = useState(Boolean(initialItem?.endDate));
  const [endDate, setEndDate] = useState(initialItem?.endDate || "");
  const [type, setType] = useState<DiscountType>(initialItem?.type || "Percentage");
  const [discountValue, setDiscountValue] = useState(initialItem?.discountValue || 0);
  const [minOrder, setMinOrder] = useState(initialItem?.minOrder || 0);
  const [hasMaxDiscount, setHasMaxDiscount] = useState(Boolean(initialItem?.maxDiscount));
  const [maxDiscount, setMaxDiscount] = useState(initialItem?.maxDiscount || 0);
  const [status, setStatus] = useState<"Active" | "Inactive">(initialItem?.status || "Active");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !code.trim() || !startDate) {
      alert("Harap isi semua kolom wajib!");
      return;
    }

    onSave(
      {
        name,
        code: code.toUpperCase().trim(),
        startDate,
        endDate: hasExpiry ? endDate : null,
        type,
        discountValue,
        minOrder,
        maxDiscount: hasMaxDiscount ? maxDiscount : null,
        status,
      },
      initialItem?.id
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {isEditMode ? "Edit Voucher" : "Buat Voucher Baru"}
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground">
              {isEditMode ? name || "Edit Voucher" : "Buat Voucher Baru"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {isEditMode && onDelete && initialItem && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold transition-all shadow-xs"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-md shadow-primary/20"
          >
            <Save className="h-3.5 w-3.5" />
            Simpan Voucher
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Gift className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Detail Voucher</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Nama Voucher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Voucher <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Promo Akhir Tahun"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Kode Voucher */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kode Voucher <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Misal: AKHIRTAHUN20"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium uppercase"
            />
          </div>

          {/* Tipe Diskon */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tipe Diskon</label>
            <select
              value={type}
              onChange={(e) => {
                setType(e.target.value as DiscountType);
                setDiscountValue(0);
              }}
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
            >
              <option value="Percentage">Persentase (%)</option>
              <option value="Fixed">Nominal Tetap (IDR)</option>
            </select>
          </div>

          {/* Nilai Diskon */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nilai Diskon ({type === "Percentage" ? "%" : "IDR"}) <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={type === "Fixed" ? formatNumberString(discountValue) : discountValue || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (type === "Fixed") {
                  setDiscountValue(parseNumberString(val));
                } else {
                  const num = Number(val.replace(/\D/g, ""));
                  setDiscountValue(num > 100 ? 100 : num); // Limit percentage to 100
                }
              }}
              placeholder={type === "Percentage" ? "10" : "50.000"}
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Tanggal Mulai */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tanggal Mulai <span className="text-destructive">*</span>
            </label>
            <input
              type="date"
              required
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Tanggal Kedaluwarsa */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Tanggal Kedaluwarsa</label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasExpiry}
                  onChange={(e) => setHasExpiry(!e.target.checked)}
                />
                Tanpa Kedaluwarsa
              </label>
            </div>
            <input
              type="date"
              disabled={!hasExpiry}
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium disabled:opacity-50"
            />
          </div>

          {/* Minimum Order */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Minimum Order (IDR)</label>
            <input
              type="text"
              value={formatNumberString(minOrder)}
              onChange={(e) => setMinOrder(parseNumberString(e.target.value))}
              placeholder="0"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
          </div>

          {/* Maksimum Diskon */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-foreground">Maksimum Diskon (IDR)</label>
              <label className="flex items-center gap-1.5 text-xs text-muted-foreground select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hasMaxDiscount}
                  onChange={(e) => setHasMaxDiscount(!e.target.checked)}
                />
                Tidak Ada Batas
              </label>
            </div>
            <input
              type="text"
              disabled={!hasMaxDiscount}
              value={hasMaxDiscount ? formatNumberString(maxDiscount) : ""}
              onChange={(e) => setMaxDiscount(parseNumberString(e.target.value))}
              placeholder="Tidak ada batas"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium disabled:opacity-50"
            />
          </div>

          {/* Status */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Status</label>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setStatus(status === "Active" ? "Inactive" : "Active")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors p-0.5 ${
                  status === "Active" ? "bg-primary" : "bg-muted-foreground/30"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                    status === "Active" ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </button>
              <span className={`text-xs font-bold ${status === "Active" ? "text-primary" : "text-muted-foreground"}`}>
                {status}
              </span>
            </div>
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal */}
      {deleteConfirmOpen && initialItem && onDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Konfirmasi Hapus Voucher</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus voucher <strong className="text-foreground">"{initialItem.name}"</strong>?
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  onDelete(initialItem.id);
                }}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md transition-all"
              >
                Ya, Hapus Voucher
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
