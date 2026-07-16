import React, { useState } from "react";
import {
  X,
  CheckCircle2,
  XCircle,
  DollarSign,
  Package,
  CreditCard,
  TrendingUp,
  AlertCircle,
} from "lucide-react";
import { CreatorItem, WithdrawalRequest } from "./types";

interface WithdrawalApprovalModalProps {
  creator: CreatorItem;
  onClose: () => void;
  onApprove: (creatorId: string, withdrawalId: string) => void;
  onReject: (creatorId: string, withdrawalId: string) => void;
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  bank_transfer: "Transfer Bank",
  paypal: "PayPal",
  dana: "DANA",
  gopay: "GoPay",
  ovo: "OVO",
};

function formatIDR(amount: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(amount);
}

export function WithdrawalApprovalModal({ creator, onClose, onApprove, onReject }: WithdrawalApprovalModalProps) {
  const [activeTab, setActiveTab] = useState<"summary" | "history">("summary");
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [adminName, setAdminName] = useState("");

  const pendingRequests = creator.withdrawalRequests.filter((r) => r.status === "pending");
  const historyRequests = creator.withdrawalRequests.filter((r) => r.status !== "pending");

  const totalGrossSales = creator.templateSales.reduce(
    (sum, t) => sum + t.totalSold * t.pricePerUnit,
    0
  );
  
  // Calculate shares: 90% Creator, 10% Postmatic
  const totalEarningsFromSales = totalGrossSales * 0.9;
  const totalPlatformShare = totalGrossSales * 0.1;

  const statusBadge = (status: WithdrawalRequest["status"]) => {
    const map: Record<string, { label: string; className: string }> = {
      pending: { label: "Menunggu", className: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
      approved: { label: "Disetujui", className: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
      rejected: { label: "Ditolak", className: "bg-red-500/10 text-red-500 border-red-500/20" },
      paid: { label: "Dibayar", className: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" },
    };
    const { label, className } = map[status] || map.pending;
    return (
      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${className}`}>
        {label}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-20 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent shrink-0" />

        {/* Creator avatar + name */}
        <div className="absolute top-4 left-6 flex items-end gap-4">
          <img
            src={creator.avatar}
            alt={creator.name}
            className="h-16 w-16 rounded-2xl border-4 border-card bg-muted shadow-lg object-cover"
          />
          <div className="pb-1">
            <p className="text-base font-bold text-foreground leading-tight">{creator.name}</p>
            <p className="text-xs text-muted-foreground">{creator.email}</p>
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-foreground transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-6 pb-6 space-y-5 overflow-y-auto flex-1">
          {/* Balance summary cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-muted/50 border border-border/50 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-muted-foreground mb-1 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" /> Total Penjualan
              </p>
              <p className="text-sm font-bold text-foreground">{formatIDR(creator.totalSalesRevenue)}</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-emerald-600 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3" /> Saldo Tersedia
              </p>
              <p className="text-sm font-bold text-emerald-600">{formatIDR(creator.availableBalance)}</p>
            </div>
            <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-amber-600 mb-1 flex items-center gap-1">
                <AlertCircle className="h-3 w-3" /> Pending
              </p>
              <p className="text-sm font-bold text-amber-600">{formatIDR(creator.pendingWithdrawal)}</p>
            </div>
            <div className="bg-blue-500/5 border border-blue-500/20 rounded-xl p-3">
              <p className="text-[10px] font-semibold text-blue-600 mb-1 flex items-center gap-1">
                <CheckCircle2 className="h-3 w-3" /> Sudah Cair
              </p>
              <p className="text-sm font-bold text-blue-600">{formatIDR(creator.totalWithdrawn)}</p>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 p-1 bg-muted/50 rounded-xl border border-border/40">
            {(["summary", "history"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  activeTab === tab
                    ? "bg-card text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "summary" ? "Ringkasan Penjualan" : "Riwayat Pencairan"}
              </button>
            ))}
          </div>

          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* Template Sales */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-xs font-bold text-foreground flex items-center gap-1.5">
                    <Package className="h-3.5 w-3.5 text-primary" /> Penjualan Template
                  </p>
                  <span className="text-[10px] font-semibold text-muted-foreground bg-primary/5 px-2 py-0.5 rounded border border-primary/20">
                    Bagi Hasil: 90% Creator / 10% Postmatic
                  </span>
                </div>
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2 px-3 text-left">Template</th>
                        <th className="py-2 px-3 text-left">Kategori</th>
                        <th className="py-2 px-3 text-right">Terjual</th>
                        <th className="py-2 px-3 text-right">Harga</th>
                        <th className="py-2 px-3 text-right">Komisi Creator</th>
                        <th className="py-2 px-3 text-right">Total Earned</th>
                      </tr>
                    </thead>
                    <tbody>
                      {creator.templateSales.map((sale) => {
                        const earned = sale.totalSold * sale.pricePerUnit * 0.9;
                        return (
                          <tr key={sale.templateId} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                            <td className="py-2.5 px-3 font-medium text-foreground">{sale.templateName}</td>
                            <td className="py-2.5 px-3">
                              <span className="bg-primary/10 text-primary text-[10px] font-semibold px-1.5 py-0.5 rounded-md">{sale.category}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono">{sale.totalSold.toLocaleString("id-ID")}</td>
                            <td className="py-2.5 px-3 text-right font-mono">{formatIDR(sale.pricePerUnit)}</td>
                            <td className="py-2.5 px-3 text-right text-violet-600 font-bold">90%</td>
                            <td className="py-2.5 px-3 text-right font-bold text-emerald-600">{formatIDR(earned)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="bg-muted/30 border-t border-border">
                        <td colSpan={5} className="py-2 px-3 font-bold text-foreground text-right">Total Bagian Creator (90%)</td>
                        <td className="py-2 px-3 text-right font-bold text-emerald-600">{formatIDR(totalEarningsFromSales)}</td>
                      </tr>
                      <tr className="bg-muted/10 border-t border-border/40 text-muted-foreground text-[11px]">
                        <td colSpan={5} className="py-1.5 px-3 font-medium text-right">Komisi Platform Postmatic (10%)</td>
                        <td className="py-1.5 px-3 text-right font-semibold">{formatIDR(totalPlatformShare)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              {/* Payment method */}
              <div>
                <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-primary" /> Metode Pembayaran
                </p>
                <div className="bg-muted/40 border border-border/50 rounded-xl p-3 flex items-center gap-3">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                    <CreditCard className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-foreground">
                      {PAYMENT_METHOD_LABELS[creator.paymentMethod]}
                      {creator.bankName && ` — ${creator.bankName}`}
                    </p>
                    <p className="text-[10px] text-muted-foreground">{creator.accountName} · {creator.accountNumber}</p>
                  </div>
                </div>
              </div>

              {/* Pending requests — approval buttons */}
              {pendingRequests.length > 0 && (
                <div>
                  <p className="text-xs font-bold text-foreground mb-2 flex items-center gap-1.5">
                    <AlertCircle className="h-3.5 w-3.5 text-amber-500" /> Permintaan Pencairan Pending
                  </p>
                  <div className="space-y-2">
                    {pendingRequests.map((req) => (
                      <div key={req.id} className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 flex flex-col gap-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="text-xs font-bold text-foreground">{formatIDR(req.amount)}</p>
                            <p className="text-[10px] text-muted-foreground">
                              {PAYMENT_METHOD_LABELS[req.paymentMethod]} · {req.accountNumber} · Diajukan {new Date(req.requestedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}
                            </p>
                          </div>
                          
                          {confirmingId !== req.id && (
                            <div className="flex items-center gap-2 shrink-0">
                              <button
                                type="button"
                                onClick={() => {
                                  if (window.confirm("Apakah Anda yakin ingin menolak pencairan ini?")) {
                                    onReject(creator.id, req.id);
                                  }
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-red-500/10 text-red-500 text-[11px] font-semibold hover:bg-red-500 hover:text-white transition-all"
                              >
                                <XCircle className="h-3 w-3" /> Tolak
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmingId(req.id);
                                  setAdminName("");
                                }}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 text-[11px] font-semibold hover:bg-emerald-500 hover:text-white transition-all"
                              >
                                <CheckCircle2 className="h-3 w-3" /> Setujui
                              </button>
                            </div>
                          )}
                        </div>

                        {confirmingId === req.id && (
                          <div className="border-t border-border/40 pt-2.5 space-y-2">
                            <p className="text-[11px] font-bold text-foreground">
                              Konfirmasi Persetujuan Pencairan
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              Silakan tulis nama lengkap Anda selaku Admin untuk memverifikasi pencairan dana ini:
                            </p>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                placeholder="Nama Lengkap Admin"
                                value={adminName}
                                onChange={(e) => setAdminName(e.target.value)}
                                className="flex-1 px-3 py-1.5 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 text-foreground"
                              />
                              <button
                                type="button"
                                disabled={!adminName.trim()}
                                onClick={() => {
                                  onApprove(creator.id, req.id);
                                  setConfirmingId(null);
                                  setAdminName("");
                                }}
                                className="px-3.5 py-1.5 rounded-lg bg-emerald-500 text-white text-[11px] font-bold hover:bg-emerald-600 disabled:opacity-50 transition-all shrink-0"
                              >
                                Setujui &amp; Kirim
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setConfirmingId(null);
                                  setAdminName("");
                                }}
                                className="px-2.5 py-1.5 rounded-lg bg-muted text-muted-foreground text-[11px] font-semibold hover:bg-muted/80 transition-all shrink-0"
                              >
                                Batal
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div>
              {historyRequests.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground gap-2">
                  <CheckCircle2 className="h-8 w-8 opacity-30" />
                  <p className="text-sm">Belum ada riwayat pencairan.</p>
                </div>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                        <th className="py-2 px-3 text-left">Tanggal</th>
                        <th className="py-2 px-3 text-left">Metode</th>
                        <th className="py-2 px-3 text-right">Jumlah</th>
                        <th className="py-2 px-3 text-left">Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {historyRequests.map((req) => (
                        <tr key={req.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                          <td className="py-2.5 px-3 text-muted-foreground">
                            {new Date(req.requestedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-foreground">{PAYMENT_METHOD_LABELS[req.paymentMethod]}</td>
                          <td className="py-2.5 px-3 text-right font-bold text-foreground">{formatIDR(req.amount)}</td>
                          <td className="py-2.5 px-3">{statusBadge(req.status)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
