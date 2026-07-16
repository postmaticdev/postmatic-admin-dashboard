import React, { useState } from "react";
import {
  Search,
  Edit3,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Clock,
  X,
  Phone,
  Mail,
  FileText,
  Calendar,
  DollarSign,
  Package,
  Trash2,
  ShieldOff,
  ExternalLink,
} from "lucide-react";
import {
  CreatorAccount,
  CreatorRequest,
  CreatorAccountStatus,
  CreatorRequestStatus,
} from "./creator-types";

function formatIDR(n: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);
}

function StatusBadge({ status }: { status: CreatorAccountStatus }) {
  if (status === "Active") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
      <CheckCircle2 className="h-3 w-3" />Active
    </span>
  );
  if (status === "Inactive") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
      <Clock className="h-3 w-3" />Inactive
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
      <AlertTriangle className="h-3 w-3" />Suspended
    </span>
  );
}

// ─── Creator Info Modal ─────────────────────────────────────────────────────────
function CreatorInfoModal({
  creator,
  onClose,
  onEdit,
}: {
  creator: CreatorAccount;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-24 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent" />
        <div className="absolute top-10 left-6">
          <div className="h-16 w-16 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-muted">
            <img src={creator.avatarUrl} alt={creator.fullName} className="h-full w-full object-cover" />
          </div>
        </div>
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="px-6 pb-6 pt-10 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{creator.fullName}</h2>
              <StatusBadge status={creator.status} />
            </div>
            <span className="inline-flex items-center mt-1 text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 px-2 py-0.5 rounded-full">{creator.specialization}</span>
            {creator.bio && <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">{creator.bio}</p>}
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{creator.totalContent}</p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Package className="h-2.5 w-2.5" />Template</p>
            </div>
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-sm font-bold text-foreground">{creator.followersCount.toLocaleString("id-ID")}</p>
              <p className="text-[10px] text-muted-foreground">Followers</p>
            </div>
            <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3 text-center">
              <p className="text-xs font-bold text-emerald-600">{formatIDR(creator.balance)}</p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><DollarSign className="h-2.5 w-2.5" />Saldo</p>
            </div>
          </div>
          <div className="space-y-2 border-t border-border/60 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Mail className="h-3.5 w-3.5 text-primary shrink-0" /><span>{creator.email}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Phone className="h-3.5 w-3.5 text-primary shrink-0" /><span>{creator.phone}</span></div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground"><Calendar className="h-3.5 w-3.5 text-primary shrink-0" /><span>Bergabung {new Date(creator.joinedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span></div>
          </div>
          <div className="flex items-center gap-2 pt-1">
            <button type="button" onClick={onEdit} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all">
              <Edit3 className="h-3.5 w-3.5" />Edit Creator
            </button>
            <button type="button" onClick={onClose} className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all">
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Request Approval View ──────────────────────────────────────────────────────
function RequestApprovalView({
  requests,
  onApprove,
  onReject,
}: {
  requests: CreatorRequest[];
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  const [confirmingId, setConfirmingId] = useState<string | null>(null);
  const [confirmAction, setConfirmAction] = useState<"approve" | "reject" | null>(null);
  const [adminNote, setAdminNote] = useState("");

  const pending = requests.filter((r) => r.status === "pending");
  const done = requests.filter((r) => r.status !== "pending");

  const startConfirm = (id: string, action: "approve" | "reject") => {
    setConfirmingId(id);
    setConfirmAction(action);
    setAdminNote("");
  };

  const cancelConfirm = () => {
    setConfirmingId(null);
    setConfirmAction(null);
    setAdminNote("");
  };

  const submitConfirm = () => {
    if (!confirmingId || !confirmAction) return;
    if (confirmAction === "approve") onApprove(confirmingId);
    else onReject(confirmingId);
    cancelConfirm();
  };

  const requestBadge = (status: CreatorRequestStatus) => {
    if (status === "approved") return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">Disetujui</span>;
    if (status === "rejected") return <span className="text-[10px] font-bold text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full border border-red-500/20">Ditolak</span>;
    return <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">Menunggu</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-violet-500/5 p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center"><Sparkles className="h-5 w-5 text-violet-500" /></div>
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">Account Management</span>
              <span className="text-xs text-muted-foreground font-mono">/ Creator / Approval</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Approval Pendaftaran Creator</h1>
            <p className="text-sm text-muted-foreground">Tinjau dan setujui atau tolak permintaan pendaftaran kreator baru.</p>
          </div>
        </div>
      </div>

      {/* Pending requests */}
      <div className="space-y-3">
        <p className="text-sm font-bold text-foreground flex items-center gap-2"><Clock className="h-4 w-4 text-amber-500" /> Menunggu Persetujuan ({pending.length})</p>
        {pending.length === 0 ? (
          <div className="bg-card border border-border/60 rounded-xl p-8 text-center text-muted-foreground">
            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 opacity-30" />
            <p className="text-sm">Semua permintaan telah diproses.</p>
          </div>
        ) : (
          pending.map((req) => (
            <div key={req.id} className="bg-card border border-border/70 rounded-2xl p-4 shadow-sm space-y-3">
              <div className="flex items-start gap-4">
                <img src={req.avatarUrl} alt={req.fullName} className="h-12 w-12 rounded-xl border border-border bg-muted shrink-0 object-cover" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-bold text-foreground">{req.fullName}</p>
                      <span className="text-[10px] font-semibold text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded-full">{req.specialization}</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground shrink-0">{new Date(req.requestedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</p>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed line-clamp-2">{req.bio}</p>
                  <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Mail className="h-3 w-3" />{req.email}</span>
                    <span className="flex items-center gap-1 text-[11px] text-muted-foreground"><Phone className="h-3 w-3" />{req.phone}</span>
                    <a href={req.portfolio} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-[11px] text-primary hover:underline" onClick={(e) => e.stopPropagation()}>
                      <ExternalLink className="h-3 w-3" />Portfolio
                    </a>
                  </div>
                </div>
              </div>

              {/* Inline confirmation form */}
              {confirmingId === req.id ? (
                <div className={`border-t border-border/40 pt-3 space-y-2.5 ${confirmAction === "approve" ? "bg-emerald-500/5 -mx-4 px-4 pb-3 rounded-b-2xl" : "bg-red-500/5 -mx-4 px-4 pb-3 rounded-b-2xl"}`}>
                  <p className="text-[11px] font-bold text-foreground">
                    {confirmAction === "approve" ? "⚠️ Konfirmasi Persetujuan" : "⚠️ Konfirmasi Penolakan"}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {confirmAction === "approve"
                      ? `Anda akan menyetujui "${req.fullName}" sebagai Creator Postmatic. Tuliskan catatan (opsional):`
                      : `Anda akan menolak pendaftaran "${req.fullName}". Berikan alasan penolakan:`}
                  </p>
                  <textarea
                    value={adminNote}
                    onChange={(e) => setAdminNote(e.target.value)}
                    placeholder={confirmAction === "approve" ? "Catatan opsional..." : "Alasan penolakan (wajib)..."}
                    rows={2}
                    className="w-full text-xs bg-background border border-border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <div className="flex gap-2">
                    <button
                      type="button"
                      disabled={confirmAction === "reject" && !adminNote.trim()}
                      onClick={submitConfirm}
                      className={`flex-1 py-1.5 rounded-lg text-[11px] font-bold transition-all disabled:opacity-40 ${confirmAction === "approve" ? "bg-emerald-500 text-white hover:bg-emerald-600" : "bg-red-500 text-white hover:bg-red-600"}`}
                    >
                      {confirmAction === "approve" ? "✓ Ya, Setujui" : "✗ Ya, Tolak"}
                    </button>
                    <button type="button" onClick={cancelConfirm} className="px-4 py-1.5 rounded-lg border border-border bg-muted text-[11px] font-semibold text-muted-foreground hover:text-foreground">
                      Batal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 border-t border-border/40 pt-3">
                  <button
                    type="button"
                    onClick={() => startConfirm(req.id, "reject")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
                  >
                    <X className="h-3.5 w-3.5" />Tolak
                  </button>
                  <button
                    type="button"
                    onClick={() => startConfirm(req.id, "approve")}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 text-xs font-semibold hover:bg-emerald-500 hover:text-white transition-all"
                  >
                    <CheckCircle2 className="h-3.5 w-3.5" />Setujui
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Processed requests */}
      {done.length > 0 && (
        <div className="space-y-3">
          <p className="text-sm font-bold text-foreground">Riwayat ({done.length})</p>
          <div className="overflow-hidden rounded-xl border border-border bg-card">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/40 text-muted-foreground font-semibold">
                  <th className="py-2 px-4 text-left">Pemohon</th>
                  <th className="py-2 px-4 text-left">Spesialisasi</th>
                  <th className="py-2 px-4 text-left">Tanggal</th>
                  <th className="py-2 px-4 text-left">Status</th>
                </tr>
              </thead>
              <tbody>
                {done.map((req) => (
                  <tr key={req.id} className="border-b border-border/60 last:border-0 hover:bg-muted/30">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2">
                        <img src={req.avatarUrl} alt={req.fullName} className="h-7 w-7 rounded-lg bg-muted" />
                        <div>
                          <p className="font-medium text-foreground">{req.fullName}</p>
                          <p className="text-[10px] text-muted-foreground">{req.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 text-muted-foreground">{req.specialization}</td>
                    <td className="py-2.5 px-4 text-muted-foreground">{new Date(req.requestedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}</td>
                    <td className="py-2.5 px-4">{requestBadge(req.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Creator Edit Modal (inline) ────────────────────────────────────────────────
function CreatorEditModal({
  creator,
  onSave,
  onClose,
  onDelete,
  onSuspend,
}: {
  creator: CreatorAccount;
  onSave: (updated: CreatorAccount) => void;
  onClose: () => void;
  onDelete: (id: string) => void;
  onSuspend: (id: string) => void;
}) {
  const [form, setForm] = useState({ ...creator });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="h-16 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent" />
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors">
          <X className="h-4 w-4" />
        </button>
        <div className="px-6 pb-6 pt-3 space-y-4">
          <h2 className="text-base font-bold text-foreground">Edit Creator</h2>
          <div className="space-y-3">
            {[
              { label: "Nama Lengkap", key: "fullName" as const, type: "text" },
              { label: "Email", key: "email" as const, type: "email" },
              { label: "No. Telepon", key: "phone" as const, type: "text" },
              { label: "Spesialisasi", key: "specialization" as const, type: "text" },
            ].map(({ label, key, type }) => (
              <div key={key}>
                <label className="text-[11px] font-semibold text-muted-foreground block mb-1">{label}</label>
                <input
                  type={type}
                  value={form[key] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
                />
              </div>
            ))}
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Bio</label>
              <textarea
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none text-foreground"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-muted-foreground block mb-1">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value as CreatorAccount["status"] })}
                className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
                <option value="Suspended">Suspended</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1 border-t border-border/40">
            <button
              type="button"
              onClick={() => { onSave(form); onClose(); }}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-all"
            >
              Simpan
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Suspend "${creator.fullName}"?`)) { onSuspend(creator.id); onClose(); }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-amber-500/10 text-amber-600 text-xs font-semibold hover:bg-amber-500 hover:text-white transition-all"
            >
              <ShieldOff className="h-3.5 w-3.5" />Suspend
            </button>
            <button
              type="button"
              onClick={() => {
                if (window.confirm(`Hapus "${creator.fullName}" secara permanen?`)) { onDelete(creator.id); onClose(); }
              }}
              className="inline-flex items-center gap-1.5 px-3 py-2.5 rounded-xl bg-red-500/10 text-red-500 text-xs font-semibold hover:bg-red-500 hover:text-white transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />Hapus
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Creator Table List ─────────────────────────────────────────────────────────
interface CreatorTableListProps {
  creators: CreatorAccount[];
  requests: CreatorRequest[];
  onEdit: (c: CreatorAccount) => void;
  onDelete: (id: string) => void;
  onSuspend: (id: string) => void;
  onSave: (c: CreatorAccount) => void;
  onShowRequests: () => void;
}

export function CreatorTableList({
  creators,
  requests,
  onEdit,
  onDelete,
  onSuspend,
  onSave,
  onShowRequests,
}: CreatorTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalCreator, setModalCreator] = useState<CreatorAccount | null>(null);
  const [editCreator, setEditCreator] = useState<CreatorAccount | null>(null);

  const filtered = creators.filter(
    (c) =>
      c.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery)
  );

  const totalCreators = creators.length;
  const activeCreators = creators.filter((c) => c.status === "Active").length;
  const suspendedCreators = creators.filter((c) => c.status === "Suspended").length;
  const pendingRequests = requests.filter((r) => r.status === "pending").length;

  return (
    <>
      {/* Scorecards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Creator</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalCreators}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Terdaftar</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center"><Sparkles className="h-6 w-6 text-violet-500" /></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/60 to-violet-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Creator Aktif</p>
              <p className="text-3xl font-bold text-foreground mt-1">{activeCreators}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Status aktif</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center"><CheckCircle2 className="h-6 w-6 text-emerald-500" /></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500/60 to-emerald-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Disuspend</p>
              <p className="text-3xl font-bold text-foreground mt-1">{suspendedCreators}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Akun dibatasi</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center"><AlertTriangle className="h-6 w-6 text-red-500" /></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/60 to-red-500/10 rounded-b-2xl" />
        </div>
        <button
          type="button"
          onClick={onShowRequests}
          className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5 shadow-sm hover:bg-amber-500/10 transition-colors text-left group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pending Request</p>
              <p className="text-3xl font-bold text-amber-600 mt-1">{pendingRequests}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Klik untuk review →</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/15 flex items-center justify-center"><FileText className="h-6 w-6 text-amber-500" /></div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/60 to-amber-500/10 rounded-b-2xl" />
        </button>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama, email, atau no. telepon..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} creator</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4">Profile &amp; Nama</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Bio</th>
              <th className="py-3 px-4">No. Telepon</th>
              <th className="py-3 px-4">Saldo</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 pr-4 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Sparkles className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">Tidak ada creator ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((creator) => (
                <tr
                  key={creator.id}
                  className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
                  onClick={() => setModalCreator(creator)}
                >
                  <td className="py-3 px-4 align-top">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                        <img src={creator.avatarUrl} alt={creator.fullName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{creator.fullName}</p>
                        <span className="text-[10px] text-violet-600 bg-violet-500/10 px-1.5 py-0.5 rounded-full">{creator.specialization}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 align-top"><span className="text-xs text-muted-foreground">{creator.email}</span></td>
                  <td className="py-3 px-4 max-w-[180px] align-top">
                    <p className="text-xs text-muted-foreground line-clamp-2" title={creator.bio}>{creator.bio || <span className="italic opacity-50">—</span>}</p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap align-top"><span className="text-xs text-muted-foreground">{creator.phone}</span></td>
                  <td className="py-3 px-4 whitespace-nowrap align-top"><span className="text-xs font-bold text-emerald-600">{formatIDR(creator.balance)}</span></td>
                  <td className="py-3 px-4 whitespace-nowrap align-top"><StatusBadge status={creator.status} /></td>
                  <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap align-top" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); setEditCreator(creator); }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5" />Edit
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground">
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{creators.length}</strong> creator
        </div>
      </div>

      {/* Creator Info Modal */}
      {modalCreator && (
        <CreatorInfoModal
          creator={modalCreator}
          onClose={() => setModalCreator(null)}
          onEdit={() => { setEditCreator(modalCreator); setModalCreator(null); }}
        />
      )}

      {/* Creator Edit Modal */}
      {editCreator && (
        <CreatorEditModal
          creator={editCreator}
          onClose={() => setEditCreator(null)}
          onSave={(updated) => { onSave(updated); setEditCreator(null); }}
          onDelete={(id) => { onDelete(id); setEditCreator(null); }}
          onSuspend={(id) => { onSuspend(id); setEditCreator(null); }}
        />
      )}
    </>
  );
}

// ─── Approval View re-export ────────────────────────────────────────────────────
export { RequestApprovalView };
