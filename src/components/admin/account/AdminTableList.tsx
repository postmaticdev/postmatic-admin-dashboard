import React, { useState } from "react";
import { AdminAccount } from "./types";
import {
  Search,
  Edit3,
  Users,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Shield,
  X,
  Phone,
  Mail,
  Calendar,
  Activity,
} from "lucide-react";

interface AdminTableListProps {
  items: AdminAccount[];
  onEdit: (item: AdminAccount) => void;
}

function RoleBadge({ role }: { role: AdminAccount["role"] }) {
  const map = {
    "Super Admin": { color: "text-violet-600 dark:text-violet-400 bg-violet-500/10", icon: ShieldCheck },
    "Admin": { color: "text-blue-600 dark:text-blue-400 bg-blue-500/10", icon: Shield },
    "Moderator": { color: "text-amber-600 dark:text-amber-400 bg-amber-500/10", icon: Shield },
  };
  const cfg = map[role];
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${cfg.color}`}>
      <Icon className="h-3 w-3" />{role}
    </span>
  );
}

function StatusBadge({ status }: { status: AdminAccount["status"] }) {
  if (status === "Active") return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
      <CheckCircle2 className="h-3 w-3" />Active
    </span>
  );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
      <Clock className="h-3 w-3" />Inactive
    </span>
  );
}

function AdminInfoModal({ admin, onClose, onEdit }: { admin: AdminAccount; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-24 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent" />

        {/* Avatar */}
        <div className="absolute top-10 left-6">
          <div className="h-16 w-16 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-muted">
            <img src={admin.avatarUrl} alt={admin.fullName} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Close button */}
        <button type="button" onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors">
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-6 pb-6 pt-10 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-foreground">{admin.fullName}</h2>
              <div className="flex items-center gap-2 mt-1">
                <RoleBadge role={admin.role} />
                <StatusBadge status={admin.status} />
              </div>
            </div>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{admin.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{admin.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Bergabung {new Date(admin.joinedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Activity className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Terakhir aktif {new Date(admin.lastActive).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />Edit Admin
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

export function AdminTableList({ items, onEdit }: AdminTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalAdmin, setModalAdmin] = useState<AdminAccount | null>(null);

  const filtered = items.filter((a) =>
    a.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.phone.includes(searchQuery)
  );

  const totalAdmins = items.length;
  const activeAdmins = items.filter((a) => a.status === "Active").length;
  const inactiveAdmins = items.filter((a) => a.status === "Inactive").length;

  return (
    <>
      {/* Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Admin</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalAdmins}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Pengelola terdaftar</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-violet-500/10 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6 text-violet-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500/60 to-violet-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Admin Aktif</p>
              <p className="text-3xl font-bold text-foreground mt-1">{activeAdmins}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Status aktif saat ini</p>
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
              <p className="text-xs font-medium text-muted-foreground">Admin Nonaktif</p>
              <p className="text-3xl font-bold text-foreground mt-1">{inactiveAdmins}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Sedang tidak aktif</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500/60 to-amber-500/10 rounded-b-2xl" />
        </div>
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
        <span className="text-xs text-muted-foreground">{filtered.length} admin</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4">Profile & Nama Lengkap</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">No. Telepon</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 pr-4 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">Tidak ada admin ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((admin) => (
                <tr
                  key={admin.id}
                  className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
                  onClick={() => setModalAdmin(admin)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                        <img src={admin.avatarUrl} alt={admin.fullName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{admin.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Bergabung {new Date(admin.joinedAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-muted-foreground">{admin.email}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">{admin.phone}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <RoleBadge role={admin.role} />
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={admin.status} />
                  </td>
                  <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit(admin); }}
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
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{items.length}</strong> admin
        </div>
      </div>

      {/* Modal */}
      {modalAdmin && (
        <AdminInfoModal
          admin={modalAdmin}
          onClose={() => setModalAdmin(null)}
          onEdit={() => { onEdit(modalAdmin); setModalAdmin(null); }}
        />
      )}
    </>
  );
}
