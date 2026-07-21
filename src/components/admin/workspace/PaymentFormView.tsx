import React, { useState } from "react";
import { PaymentMethodItem, FeeType } from "./types";
import { formatNumberString, parseNumberString } from "./utils";
import { ArrowLeft, Save, Trash2, AlertTriangle, CreditCard, Loader2 } from "lucide-react";

interface PaymentFormViewProps {
  initialItem: PaymentMethodItem | null;
  onSave: (data: Omit<PaymentMethodItem, "id">, id?: string) => void | Promise<void>;
  onCancel: () => void;
  onDelete?: (id: string) => void | Promise<void>;
  isSaving?: boolean;
  isDeleting?: boolean;
}

function parsePercentageInput(value: string) {
  const sanitized = value.replace(/[^\d.]/g, "");
  const [whole = "", ...fractionParts] = sanitized.split(".");
  const normalized = fractionParts.length ? `${whole}.${fractionParts.join("")}` : whole;
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed)) return 0;
  return parsed > 100 ? 100 : parsed;
}

export function PaymentFormView({
  initialItem,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
  isDeleting = false,
}: PaymentFormViewProps) {
  const isEditMode = Boolean(initialItem);
  const [code, setCode] = useState(initialItem?.code || "");
  const [name, setName] = useState(initialItem?.name || "");
  const [type, setType] = useState(initialItem?.type || "bank");
  const [logoUrl, setLogoUrl] = useState(initialItem?.logoUrl || "");
  const [adminFeeType, setAdminFeeType] = useState<FeeType>(initialItem?.adminFeeType || "Fixed");
  const [adminFee, setAdminFee] = useState(initialItem?.adminFee || 0);
  const [otherFeeType] = useState<FeeType>(initialItem?.otherFeeType || "Percentage");
  const [otherFee, setOtherFee] = useState(initialItem?.otherFee || 0);
  const [status, setStatus] = useState<"Active" | "Inactive">(initialItem?.status || "Active");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("Harap isi kode payment method!");
      return;
    }
    if (!name.trim()) {
      alert("Harap isi nama payment method!");
      return;
    }
    if (!type.trim()) {
      alert("Harap pilih tipe payment method!");
      return;
    }
    onSave(
      { code, name, type, logoUrl, adminFeeType, adminFee, otherFeeType, otherFee, status },
      initialItem?.id,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {isEditMode ? "Edit Payment Method" : "Buat Payment Method Baru"}
            </span>
            <h1 className="text-lg font-bold text-foreground">
              {isEditMode ? name || "Edit Payment Method" : "Buat Payment Method Baru"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {isEditMode && onDelete && initialItem && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSaving || isDeleting}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-md shadow-primary/20 disabled:pointer-events-none disabled:opacity-60"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Simpan
          </button>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6"
      >
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <CreditCard className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Detail Payment Method</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Kode Payment Method <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="Misal: BCA"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium uppercase"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Nama Payment Method <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Misal: Bank Transfer BCA"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Tipe Payment Method <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
            >
              <option value="bank">Bank</option>
              <option value="ewallet">E-Wallet</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">URL Logo</label>
            <input
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://example.com/logo.png"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
            {logoUrl && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Preview:</span>
                <div className="h-8 w-8 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                  <img
                    src={logoUrl}
                    alt="preview"
                    className="h-6 w-6 object-contain"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tipe Biaya Admin</label>
            <select
              value={adminFeeType}
              onChange={(e) => {
                setAdminFeeType(e.target.value as FeeType);
                setAdminFee(0);
              }}
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
            >
              <option value="Fixed">Nominal Tetap (IDR)</option>
              <option value="Percentage">Persentase (%)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Biaya Admin ({adminFeeType === "Percentage" ? "%" : "IDR"})
            </label>
            <input
              type="text"
              value={adminFeeType === "Fixed" ? formatNumberString(adminFee) : adminFee || ""}
              onChange={(e) => {
                const val = e.target.value;
                if (adminFeeType === "Fixed") {
                  setAdminFee(parseNumberString(val));
                } else {
                  setAdminFee(parsePercentageInput(val));
                }
              }}
              placeholder="0"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Tax Fee (%)</label>
            <input
              type="text"
              value={otherFee || ""}
              onChange={(e) => {
                setOtherFee(parsePercentageInput(e.target.value));
              }}
              placeholder="0"
              className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Status</label>
            <div className="flex items-center gap-2 mt-2">
              <button
                type="button"
                onClick={() => setStatus(status === "Active" ? "Inactive" : "Active")}
                className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors p-0.5 ${status === "Active" ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span
                  className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${status === "Active" ? "translate-x-4" : "translate-x-0"}`}
                />
              </button>
              <span
                className={`text-xs font-bold ${status === "Active" ? "text-primary" : "text-muted-foreground"}`}
              >
                {status}
              </span>
            </div>
          </div>
        </div>
      </form>

      {deleteConfirmOpen && initialItem && onDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">
                  Konfirmasi Hapus Payment Method
                </h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus{" "}
              <strong className="text-foreground">"{initialItem.name}"</strong>?
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
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md transition-all disabled:pointer-events-none disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
