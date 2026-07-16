import React, { useState } from "react";
import { UserAccount } from "./types";
import {
  Search,
  Edit3,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  X,
  Phone,
  Mail,
  FileText,
  Calendar,
  Activity,
  Heart,
  Image as ImageIcon,
} from "lucide-react";

interface UserTableListProps {
  items: UserAccount[];
  onEdit: (item: UserAccount) => void;
}

function UserInfoModal({ user, onClose, onEdit }: { user: UserAccount; onClose: () => void; onEdit: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

        {/* Avatar */}
        <div className="absolute top-10 left-6">
          <div className="h-16 w-16 rounded-2xl border-4 border-card shadow-lg overflow-hidden bg-muted">
            <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/20 hover:bg-black/40 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-6 pb-6 pt-10 space-y-4">
          <div>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-foreground">{user.fullName}</h2>
              <StatusBadge status={user.status} />
            </div>
            {user.bio && (
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{user.bio}</p>
            )}
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{user.postsCount}</p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><ImageIcon className="h-2.5 w-2.5" />Posts</p>
            </div>
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">{user.followersCount.toLocaleString("id-ID")}</p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Heart className="h-2.5 w-2.5" />Followers</p>
            </div>
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-foreground">{new Date(user.lastActive).toLocaleDateString("id-ID", { day:"numeric", month:"short" })}</p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5"><Activity className="h-2.5 w-2.5" />Terakhir</p>
            </div>
          </div>

          <div className="space-y-2 border-t border-border/60 pt-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Mail className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{user.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Phone className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>{user.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3.5 w-3.5 text-primary shrink-0" />
              <span>Bergabung {new Date(user.joinedAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />Edit Pengguna
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

function StatusBadge({ status }: { status: UserAccount["status"] }) {
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

export function UserTableList({ items, onEdit }: UserTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalUser, setModalUser] = useState<UserAccount | null>(null);

  const filtered = items.filter((u) =>
    u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.phone.includes(searchQuery)
  );

  const totalUsers = items.length;
  const activeUsers = items.filter((u) => u.status === "Active").length;
  const suspendedUsers = items.filter((u) => u.status === "Suspended").length;

  return (
    <>
      {/* Scorecards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Total Pengguna</p>
              <p className="text-3xl font-bold text-foreground mt-1">{totalUsers}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Terdaftar di platform</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 to-blue-500/10 rounded-b-2xl" />
        </div>
        <div className="relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Pengguna Aktif</p>
              <p className="text-3xl font-bold text-foreground mt-1">{activeUsers}</p>
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
              <p className="text-xs font-medium text-muted-foreground">Disuspend</p>
              <p className="text-3xl font-bold text-foreground mt-1">{suspendedUsers}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Akun dibatasi</p>
            </div>
            <div className="h-12 w-12 rounded-2xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500/60 to-red-500/10 rounded-b-2xl" />
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
        <span className="text-xs text-muted-foreground">{filtered.length} pengguna</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4">Profile & Nama Lengkap</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Bio</th>
              <th className="py-3 px-4">No. Telepon</th>
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
                    <p className="text-sm font-medium">Tidak ada pengguna ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((user) => (
                <tr
                  key={user.id}
                  className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
                  onClick={() => setModalUser(user)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-xl border border-border overflow-hidden shrink-0 bg-muted">
                        <img src={user.avatarUrl} alt={user.fullName} className="h-full w-full object-cover" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">{user.fullName}</p>
                        <p className="text-[11px] text-muted-foreground">
                          Bergabung {new Date(user.joinedAt).toLocaleDateString("id-ID", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </td>
                  <td className="py-3 px-4 max-w-[200px]">
                    <p className="text-xs text-muted-foreground truncate" title={user.bio}>
                      {user.bio || <span className="italic opacity-50">—</span>}
                    </p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">{user.phone}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  <td className="py-3 pr-4 pl-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); onEdit(user); }}
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
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{items.length}</strong> pengguna
        </div>
      </div>

      {/* Modal */}
      {modalUser && (
        <UserInfoModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onEdit={() => { onEdit(modalUser); setModalUser(null); }}
        />
      )}
    </>
  );
}
