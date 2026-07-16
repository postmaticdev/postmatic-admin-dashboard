import React, { useState } from "react";
import { ReferralItem, DiscountType } from "./types";
import { formatNumberString, parseNumberString } from "./utils";
import {
  ArrowLeft,
  Save,
  Users,
} from "lucide-react";

interface ReferralFormViewProps {
  initialItem: ReferralItem | null;
  onSave: (data: Omit<ReferralItem, "id">, id?: string) => void;
  onCancel: () => void;
}

export function ReferralFormView({
  initialItem,
  onSave,
  onCancel,
}: ReferralFormViewProps) {
  const isEditMode = Boolean(initialItem);

  const [role, setRole] = useState<"User" | "Admin">(initialItem?.role || "User");
  const [startDate, setStartDate] = useState(initialItem?.startDate || "");
  const [hasExpiry, setHasExpiry] = useState(Boolean(initialItem?.endDate));
  const [endDate, setEndDate] = useState(initialItem?.endDate || "");
  const [type, setType] = useState<DiscountType>(initialItem?.type || "Percentage");
  const [discountValue, setDiscountValue] = useState(initialItem?.discountValue || 0);
  const [minOrder, setMinOrder] = useState(initialItem?.minOrder || 0);
  const [hasMaxDiscount, setHasMaxDiscount] = useState(Boolean(initialItem?.maxDiscount));
  const [maxDiscount, setMaxDiscount] = useState(initialItem?.maxDiscount || 0);
  const [status, setStatus] = useState<"Active" | "Inactive">(initialItem?.status || "Active");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate) {
      alert("Harap isi semua kolom wajib!");
      return;
    }

    onSave(
      {
        role,
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
                {isEditMode ? "Edit Referral" : "Buat Referral Baru"}
              </span>
            </div>
            <h1 className="text-lg font-bold text-foreground">
              {isEditMode ? `Edit Referral: ${role}` : "Buat Referral Baru"}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-md shadow-primary/20"
          >
            <Save className="h-3.5 w-3.5" />
            Simpan Referral
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Users className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Detail Referral</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Role */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "User" | "Admin")}
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
            >
              <option value="User">User</option>
              <option value="Admin">Admin</option>
            </select>
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
                  setDiscountValue(num > 100 ? 100 : num);
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
    </div>
  );
}
