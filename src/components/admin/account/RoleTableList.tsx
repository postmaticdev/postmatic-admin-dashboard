import React, { useState } from "react";
import { RoleItem, DASHBOARD_SUBMODULES } from "./types";
import { Search, Edit3, Shield, ShieldCheck, Key, Plus, X, LayoutDashboard, Briefcase } from "lucide-react";

interface RoleTableListProps {
  items: RoleItem[];
  onCreateNew: () => void;
  onEdit: (item: RoleItem) => void;
}

const hasSubmodules = (module: string) => (DASHBOARD_SUBMODULES[module] || []).length > 0;

function RoleInfoModal({
  role,
  onClose,
  onEdit,
}: {
  role: RoleItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header gradient */}
        <div className="h-20 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent" />

        {/* Shield Icon */}
        <div className="absolute top-8 left-6">
          <div className="h-14 w-14 rounded-2xl border-4 border-card shadow-lg bg-violet-500 flex items-center justify-center text-white">
            <Shield className="h-6 w-6 stroke-[2]" />
          </div>
        </div>

        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Content */}
        <div className="px-6 pb-6 pt-8 space-y-5">
          <div className="pt-2">
            <h2 className="text-lg font-bold text-foreground">{role.name}</h2>
            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{role.description}</p>
          </div>

          <div className="max-h-[300px] overflow-y-auto pr-1 space-y-4 border-t border-border/60 pt-4">
            {/* Dashboard Access details */}
            {role.dashboardEnabled !== false ? (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <LayoutDashboard className="h-3.5 w-3.5 text-primary" /> Hak Akses Module Dashboard:
                </h3>
                <div className="grid grid-cols-1 gap-2 pl-2">
                  {Object.entries(DASHBOARD_SUBMODULES).map(([mod, subs]) => {
                    const hasSubs = subs.length > 0;
                    
                    if (hasSubs) {
                      const activeSubs = role.dashboardSubmenus?.[mod] || [];
                      if (activeSubs.length === 0) return null;
                      
                      return (
                        <div key={mod} className="p-2.5 rounded-xl bg-muted/40 border border-border/40 space-y-1.5">
                          <span className="text-xs font-bold text-foreground block">{mod}</span>
                          <div className="grid grid-cols-1 gap-1.5 pl-2 border-l border-border/60">
                            {activeSubs.map((sub) => {
                              const cruds = role.dashboardPermissions?.[sub] || [];
                              return (
                                <div key={sub} className="flex items-center justify-between">
                                  <span className="text-[10px] font-semibold text-muted-foreground">{sub}</span>
                                  <div className="flex gap-0.5">
                                    {cruds.map((c) => (
                                      <span key={c} className="text-[7.5px] font-bold bg-primary/10 text-primary px-1 rounded-sm">
                                        {c[0]}
                                      </span>
                                    ))}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    } else {
                      const cruds = role.dashboardPermissions?.[mod] || [];
                      if (cruds.length === 0) return null;

                      return (
                        <div key={mod} className="p-2.5 rounded-xl bg-muted/40 border border-border/40 flex items-center justify-between">
                          <span className="text-xs font-bold text-foreground">{mod}</span>
                          <div className="flex gap-0.5">
                            {cruds.map((c) => (
                              <span key={c} className="text-[8.5px] font-bold bg-primary/10 text-primary px-1.5 py-0.2 rounded-sm">
                                {c}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    }
                  })}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic pl-2">Tidak ada modul dashboard yang diaktifkan.</div>
            )}

            {/* Workspace Access details */}
            {role.workspaceEnabled !== false && role.workspacePermissions && role.workspacePermissions.length > 0 ? (
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3.5 w-3.5 text-violet-500" /> Hak Akses Module Workspace:
                </h3>
                <div className="flex flex-wrap gap-1.5 pl-2">
                  {role.workspacePermissions.map((mod) => (
                    <span
                      key={mod}
                      className="inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                    >
                      {mod}
                    </span>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-xs text-muted-foreground italic pl-2">Tidak ada modul workspace yang diaktifkan.</div>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />Edit Role
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

export function RoleTableList({ items, onCreateNew, onEdit }: RoleTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [modalRole, setModalRole] = useState<RoleItem | null>(null);

  const filtered = items.filter(
    (role) =>
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-violet-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                <Shield className="h-3.5 w-3.5" />Role Management
              </span>
              <span className="text-xs text-muted-foreground font-mono">Account / Role Management</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Role & Access Management</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Definisikan role pengguna beserta tingkat hak akses masing-masing modul di platform Postmatic.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0"
          >
            <Plus className="h-4 w-4" />Create Role
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama role atau deskripsi..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
        <span className="text-xs text-muted-foreground">{filtered.length} role</span>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4 w-[200px]">Nama Role</th>
              <th className="py-3 px-4">Deskripsi Singkat</th>
              <th className="py-3 px-4">Access Management</th>
              <th className="py-3 pr-4 pl-3 text-right w-[120px]">Action</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center gap-2">
                    <Shield className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">Tidak ada role ditemukan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              filtered.map((role) => {
                const dashElements: React.ReactNode[] = [];
                if (role.dashboardEnabled !== false && role.dashboardPermissions && Object.keys(role.dashboardPermissions).length > 0) {
                  Object.entries(DASHBOARD_SUBMODULES).forEach(([mod, subs]) => {
                    const hasSubs = subs.length > 0;
                    if (hasSubs) {
                      const activeSubs = role.dashboardSubmenus?.[mod] || [];
                      activeSubs.forEach((sub) => {
                        const cruds = role.dashboardPermissions[sub] || [];
                        dashElements.push(
                          <span
                            key={sub}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            <span>{sub}</span>
                            {cruds.length > 0 && (
                              <span className="font-bold text-[8px] bg-primary text-primary-foreground px-1 rounded-sm">
                                {cruds.map((c) => c[0]).join("")}
                              </span>
                            )}
                          </span>
                        );
                      });
                    } else {
                      const cruds = role.dashboardPermissions[mod] || [];
                      if (cruds.length > 0) {
                        dashElements.push(
                          <span
                            key={mod}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                          >
                            <span>{mod}</span>
                            {cruds.length > 0 && (
                              <span className="font-bold text-[8px] bg-primary text-primary-foreground px-1 rounded-sm">
                                {cruds.map((c) => c[0]).join("")}
                              </span>
                            )}
                          </span>
                        );
                      }
                    }
                  });
                } else if (role.access && !role.dashboardPermissions) {
                  role.access.forEach((mod) => {
                    dashElements.push(
                      <span
                        key={mod}
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-primary/10 text-primary border border-primary/20"
                      >
                        {mod}
                      </span>
                    );
                  });
                }

                return (
                  <tr
                    key={role.id}
                    className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
                    onClick={() => setModalRole(role)}
                  >
                    <td className="py-4 px-4 font-semibold text-sm text-foreground align-top">
                      <div className="flex items-center gap-2">
                        <div className="h-7 w-7 rounded-lg bg-violet-500/10 flex items-center justify-center shrink-0">
                          <Key className="h-3.5 w-3.5 text-violet-500" />
                        </div>
                        <span>{role.name}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-xs text-muted-foreground max-w-[300px] align-top">
                      {role.description}
                    </td>
                    <td className="py-4 px-4 align-top">
                      <div className="flex flex-col gap-1.5 max-w-[420px]">
                        {dashElements.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center">
                            <span className="text-[10px] font-semibold text-muted-foreground mr-0.5">Dash:</span>
                            {dashElements.slice(0, 5)}
                            {dashElements.length > 5 && (
                              <span className="text-[9px] font-semibold text-muted-foreground bg-muted border border-border/80 px-1.5 py-0.5 rounded">
                                +{dashElements.length - 5} lainnya
                              </span>
                            )}
                          </div>
                        )}

                        {role.workspaceEnabled !== false && role.workspacePermissions && role.workspacePermissions.length > 0 && (
                          <div className="flex flex-wrap gap-1 items-center pt-0.5 border-t border-border/40">
                            <span className="text-[10px] font-semibold text-muted-foreground mr-0.5">Work:</span>
                            {role.workspacePermissions.slice(0, 5).map((mod) => (
                              <span
                                key={mod}
                                className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                              >
                                {mod}
                              </span>
                            ))}
                            {role.workspacePermissions.length > 5 && (
                              <span className="text-[9px] font-semibold text-muted-foreground bg-muted border border-border/80 px-1.5 py-0.5 rounded">
                                +{role.workspacePermissions.length - 5} lainnya
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  <td className="py-4 pr-4 pl-3 text-right whitespace-nowrap align-top" onClick={(e) => e.stopPropagation()}>
                    <button
                      type="button"
                      onClick={() => onEdit(role)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm"
                    >
                      <Edit3 className="h-3.5 w-3.5" />Edit
                    </button>
                  </td>
                </tr>
              );
            })
          )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground">
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{items.length}</strong> role
        </div>
      </div>

      {/* Role Info Modal */}
      {modalRole && (
        <RoleInfoModal
          role={modalRole}
          onClose={() => setModalRole(null)}
          onEdit={() => { onEdit(modalRole); setModalRole(null); }}
        />
      )}
    </div>
  );
}
