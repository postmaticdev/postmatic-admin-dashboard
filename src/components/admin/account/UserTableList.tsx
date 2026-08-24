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
  Calendar,
  Activity,
  Heart,
  Image as ImageIcon,
  AlertCircle,
  Loader2,
  RefreshCw,
  Ban,
  ShieldCheck,
  Unlock,
} from "lucide-react";

import { TablePagination } from "@/components/ui/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";

interface UserTableListProps {
  items: UserAccount[];
  searchQuery: string;
  pagination: PaginationMeta;
  onEdit?: (item: UserAccount) => void;
  onEditRole?: (item: UserAccount) => void;
  onToggleBan?: (item: UserAccount, isBanned: boolean) => void;
  isLoading?: boolean;
  isPageChanging?: boolean;
  errorMessage?: string;
  isReadOnly?: boolean;
  updatingRoleUserId?: string | null;
  updatingBanUserId?: string | null;
  onRetry?: () => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
}

function getInitials(name: string) {
  const cleanName = name.trim();
  if (!cleanName) return "U";

  const words = cleanName.split(/\s+/).filter(Boolean);
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();

  return `${words[0][0]}${words[words.length - 1][0]}`.toUpperCase();
}

function UserAvatar({ name, src, className }: { name: string; src?: string; className: string }) {
  const [hasImageError, setHasImageError] = useState(false);
  const canShowImage = Boolean(src?.trim()) && !hasImageError;

  return (
    <div
      className={`${className} overflow-hidden bg-primary/10 text-primary flex items-center justify-center`}
    >
      {canShowImage ? (
        <img
          src={src}
          alt={name}
          className="h-full w-full object-cover"
          onError={() => setHasImageError(true)}
        />
      ) : (
        <span className="font-bold tracking-normal">{getInitials(name)}</span>
      )}
    </div>
  );
}

function UserInfoModal({
  user,
  onClose,
  onEdit,
  onEditRole,
  onToggleBan,
  isReadOnly,
  isUpdatingRole,
  isUpdatingBan,
}: {
  user: UserAccount;
  onClose: () => void;
  onEdit?: () => void;
  onEditRole?: () => void;
  onToggleBan?: () => void;
  isReadOnly?: boolean;
  isUpdatingRole?: boolean;
  isUpdatingBan?: boolean;
}) {
  const isSuspended = user.status === "Suspended";
  const hasActions = !isReadOnly && Boolean(onEdit || onEditRole || onToggleBan);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-24 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />

        {/* Avatar */}
        <div className="absolute top-10 left-6">
          <UserAvatar
            name={user.fullName}
            src={user.avatarUrl}
            className="h-16 w-16 rounded-2xl border-4 border-card shadow-lg text-base"
          />
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
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                <ImageIcon className="h-2.5 w-2.5" />
                Posts
              </p>
            </div>
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-lg font-bold text-foreground">
                {user.followersCount.toLocaleString("id-ID")}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                <Heart className="h-2.5 w-2.5" />
                Followers
              </p>
            </div>
            <div className="bg-muted/60 rounded-xl p-3 text-center">
              <p className="text-[10px] font-bold text-foreground">
                {new Date(user.lastActive).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "short",
                })}
              </p>
              <p className="text-[10px] text-muted-foreground flex items-center justify-center gap-0.5">
                <Activity className="h-2.5 w-2.5" />
                Terakhir
              </p>
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
              <span>
                Bergabung{" "}
                {new Date(user.joinedAt).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            {hasActions && onEditRole && (
              <button
                type="button"
                onClick={onEditRole}
                disabled={isUpdatingRole || isUpdatingBan}
                className="flex-1 inline-flex min-w-[9rem] items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-violet-500 text-white text-sm font-semibold shadow-md shadow-violet-500/20 hover:bg-violet-600 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isUpdatingRole ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <ShieldCheck className="h-3.5 w-3.5" />
                )}
                Edit Role
              </button>
            )}
            {hasActions && onToggleBan && (
              <button
                type="button"
                onClick={onToggleBan}
                disabled={isUpdatingRole || isUpdatingBan}
                className={`flex-1 inline-flex min-w-[8rem] items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed ${
                  isSuspended
                    ? "border border-amber-500/30 bg-amber-500/5 text-amber-600 dark:text-amber-400 hover:bg-amber-500/10"
                    : "border border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 hover:bg-red-500/10"
                }`}
              >
                {isUpdatingBan ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : isSuspended ? (
                  <Unlock className="h-3.5 w-3.5" />
                ) : (
                  <Ban className="h-3.5 w-3.5" />
                )}
                {isSuspended ? "Buka Ban" : "Ban User"}
              </button>
            )}
            {hasActions && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                disabled={isUpdatingRole || isUpdatingBan}
                className="flex-1 inline-flex min-w-[8rem] items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit Pengguna
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${hasActions ? "px-4" : "flex-1"} py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all`}
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
  if (status === "Active")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
        <CheckCircle2 className="h-3 w-3" />
        Active
      </span>
    );
  if (status === "Inactive")
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
        <Clock className="h-3 w-3" />
        Inactive
      </span>
    );
  return (
    <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-red-600 dark:text-red-400 bg-red-500/10 px-2 py-0.5 rounded-md">
      <AlertTriangle className="h-3 w-3" />
      Suspended
    </span>
  );
}

function UserActionButtons({
  user,
  onEdit,
  onEditRole,
  onToggleBan,
  isUpdatingRole,
  isUpdatingBan,
}: {
  user: UserAccount;
  onEdit?: (item: UserAccount) => void;
  onEditRole?: (item: UserAccount) => void;
  onToggleBan?: (item: UserAccount, isBanned: boolean) => void;
  isUpdatingRole?: boolean;
  isUpdatingBan?: boolean;
}) {
  const isSuspended = user.status === "Suspended";
  const isBusy = Boolean(isUpdatingRole || isUpdatingBan);

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      {onEditRole && (
        <button
          type="button"
          onClick={() => onEditRole(user)}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-violet-500/10 text-violet-600 dark:text-violet-400 hover:bg-violet-500 hover:text-white transition-all duration-150 shadow-sm disabled:pointer-events-none disabled:opacity-60"
        >
          {isUpdatingRole ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <ShieldCheck className="h-3.5 w-3.5" />
          )}
          Edit Role
        </button>
      )}
      {onToggleBan && (
        <button
          type="button"
          onClick={() => onToggleBan(user, !isSuspended)}
          disabled={isBusy}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-150 shadow-sm disabled:pointer-events-none disabled:opacity-60 ${
            isSuspended
              ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white"
              : "bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500 hover:text-white"
          }`}
        >
          {isUpdatingBan ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : isSuspended ? (
            <Unlock className="h-3.5 w-3.5" />
          ) : (
            <Ban className="h-3.5 w-3.5" />
          )}
          {isSuspended ? "Buka" : "Ban"}
        </button>
      )}
      {onEdit && (
        <button
          type="button"
          onClick={() => onEdit(user)}
          disabled={isBusy}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm disabled:pointer-events-none disabled:opacity-60"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
      )}
    </div>
  );
}

export function UserTableList({
  items,
  searchQuery,
  pagination,
  onEdit,
  onEditRole,
  onToggleBan,
  isLoading = false,
  isPageChanging = false,
  errorMessage,
  isReadOnly = false,
  updatingRoleUserId,
  updatingBanUserId,
  onRetry,
  onSearchChange,
  onPageChange,
}: UserTableListProps) {
  const [modalUser, setModalUser] = useState<UserAccount | null>(null);

  const totalUsers = pagination.total;
  const activeUsers = items.filter((u) => u.status === "Active").length;
  const suspendedUsers = items.filter((u) => u.status === "Suspended").length;
  const hasActions = !isReadOnly && Boolean(onEdit || onEditRole || onToggleBan);
  const tableColSpan = hasActions ? 6 : 5;

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
              <p className="text-xs font-medium text-muted-foreground">Aktif di Halaman</p>
              <p className="text-3xl font-bold text-foreground mt-1">{activeUsers}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Dari data halaman ini</p>
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
              <p className="text-xs font-medium text-muted-foreground">Diban di Halaman</p>
              <p className="text-3xl font-bold text-foreground mt-1">{suspendedUsers}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Dari data halaman ini</p>
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
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">{pagination.total} pengguna</span>
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
              {hasActions && <th className="py-3 pr-4 pl-3 text-right">Action</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={tableColSpan} className="py-12 text-center">
                  <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Memuat data pengguna...
                  </div>
                </td>
              </tr>
            ) : errorMessage ? (
              <tr>
                <td colSpan={tableColSpan} className="py-12 text-center">
                  <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-sm text-muted-foreground">
                    <div className="inline-flex items-center gap-2 font-semibold text-destructive">
                      <AlertCircle className="h-4 w-4" />
                      Gagal memuat data pengguna.
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
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={tableColSpan} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Users className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">Tidak ada pengguna ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              items.map((user) => (
                <tr
                  key={user.id}
                  className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
                  onClick={() => setModalUser(user)}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={user.fullName}
                        src={user.avatarUrl}
                        className="h-9 w-9 rounded-xl border border-border shrink-0 text-xs"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {user.fullName}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          Bergabung{" "}
                          {new Date(user.joinedAt).toLocaleDateString("id-ID", {
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-xs text-muted-foreground">{user.email}</span>
                  </td>
                  <td className="py-3 px-4 max-w-[200px]">
                    <p className="text-xs text-muted-foreground truncate" title={user.bio}>
                      {user.bio || <span className="italic opacity-50">-</span>}
                    </p>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span className="text-xs text-muted-foreground">{user.phone}</span>
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <StatusBadge status={user.status} />
                  </td>
                  {hasActions && (
                    <td
                      className="py-3 pr-4 pl-3 text-right whitespace-nowrap"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <UserActionButtons
                        user={user}
                        onEdit={onEdit}
                        onEditRole={onEditRole}
                        onToggleBan={onToggleBan}
                        isUpdatingRole={updatingRoleUserId === user.id}
                        isUpdatingBan={updatingBanUserId === user.id}
                      />
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
        <TablePagination
          pagination={pagination}
          itemLabel="pengguna"
          onPageChange={onPageChange}
          disabled={isPageChanging}
        />
      </div>

      {/* Modal */}
      {modalUser && (
        <UserInfoModal
          user={modalUser}
          onClose={() => setModalUser(null)}
          onEditRole={
            onEditRole
              ? () => {
                  onEditRole(modalUser);
                  setModalUser(null);
                }
              : undefined
          }
          onToggleBan={
            onToggleBan
              ? () => {
                  onToggleBan(modalUser, modalUser.status !== "Suspended");
                  setModalUser(null);
                }
              : undefined
          }
          onEdit={
            onEdit
              ? () => {
                  onEdit(modalUser);
                  setModalUser(null);
                }
              : undefined
          }
          isReadOnly={isReadOnly}
          isUpdatingRole={updatingRoleUserId === modalUser.id}
          isUpdatingBan={updatingBanUserId === modalUser.id}
        />
      )}
    </>
  );
}
