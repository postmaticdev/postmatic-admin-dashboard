import React, { useState } from "react";
import { RoleItem, DASHBOARD_MODULES, WORKSPACE_MODULES, DASHBOARD_SUBMODULES } from "./types";
import { ArrowLeft, Save, Trash2, Shield, AlertTriangle, CheckCircle, X, Check, LayoutDashboard, Briefcase, Lock } from "lucide-react";

interface RoleFormViewProps {
  initialItem: RoleItem | null;
  onSave: (data: Omit<RoleItem, "id">, id?: string) => void;
  onDelete: (id: string) => void;
  onCancel: () => void;
}

const CRUD_OPTIONS = ["Create", "Read", "Update", "Delete"];

export function RoleFormView({ initialItem, onSave, onDelete, onCancel }: RoleFormViewProps) {
  const isEditMode = Boolean(initialItem);
  const [name, setName] = useState(initialItem?.name || "");
  const [description, setDescription] = useState(initialItem?.description || "");
  
  // Section enabling toggles
  const [dashboardEnabled, setDashboardEnabled] = useState<boolean>(
    initialItem?.dashboardEnabled !== false
  );
  const [workspaceEnabled, setWorkspaceEnabled] = useState<boolean>(
    initialItem?.workspaceEnabled !== false
  );

  // Detailed permissions states
  const [dashboardPermissions, setDashboardPermissions] = useState<Record<string, string[]>>(
    initialItem?.dashboardPermissions || {}
  );
  const [dashboardSubmenus, setDashboardSubmenus] = useState<Record<string, string[]>>(
    initialItem?.dashboardSubmenus || {}
  );
  const [workspacePermissions, setWorkspacePermissions] = useState<string[]>(
    initialItem?.workspacePermissions || []
  );

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteInput, setDeleteInput] = useState("");

  const hasSubmodules = (module: string) => (DASHBOARD_SUBMODULES[module] || []).length > 0;

  // Toggle Dashboard Module On/Off (check/checkbox logic)
  const handleToggleDashboardModule = (module: string) => {
    const subs = DASHBOARD_SUBMODULES[module] || [];
    const hasSubs = subs.length > 0;

    setDashboardPermissions((prev) => {
      const copy = { ...prev };
      if (hasSubs) {
        // Toggle the parent category in terms of active status
        const isCurrentlyActive = subs.some(sub => dashboardSubmenus[module]?.includes(sub));
        if (isCurrentlyActive) {
          // If active, clear submenus & their CRUDs
          setDashboardSubmenus((prevSub) => {
            const subCopy = { ...prevSub };
            delete subCopy[module];
            return subCopy;
          });
          subs.forEach((sub) => {
            delete copy[sub];
          });
        } else {
          // If inactive, enable all submenus and give them default CRUDs
          setDashboardSubmenus((prevSub) => ({
            ...prevSub,
            [module]: [...subs],
          }));
          subs.forEach((sub) => {
            copy[sub] = ["Create", "Read", "Update", "Delete"];
          });
        }
      } else {
        // No submenus, just toggle the module itself
        if (copy[module]) {
          delete copy[module];
        } else {
          copy[module] = ["Create", "Read", "Update", "Delete"];
        }
      }
      return copy;
    });
  };

  // Toggle specific CRUD action for either module or submenu
  const handleToggleCrud = (targetKey: string, action: string) => {
    setDashboardPermissions((prev) => {
      const current = prev[targetKey] || [];
      const updated = current.includes(action)
        ? current.filter((a) => a !== action)
        : [...current, action];
      return { ...prev, [targetKey]: updated };
    });
  };

  // Toggle specific Submenu
  const handleToggleSubmenu = (module: string, submenu: string) => {
    setDashboardSubmenus((prev) => {
      const current = prev[module] || [];
      const isChecking = !current.includes(submenu);
      const updated = isChecking
        ? [...current, submenu]
        : current.filter((s) => s !== submenu);
      
      // Update CRUD permissions for this submenu
      setDashboardPermissions((prevPerm) => {
        const permCopy = { ...prevPerm };
        if (isChecking) {
          permCopy[submenu] = ["Create", "Read", "Update", "Delete"];
        } else {
          delete permCopy[submenu];
        }
        return permCopy;
      });

      return { ...prev, [module]: updated };
    });
  };

  // Toggle Workspace Module On/Off
  const handleToggleWorkspaceModule = (module: string) => {
    if (workspacePermissions.includes(module)) {
      setWorkspacePermissions((prev) => prev.filter((m) => m !== module));
    } else {
      setWorkspacePermissions((prev) => [...prev, module]);
    }
  };

  const handleSelectAllDashboard = () => {
    const isAllChecked = DASHBOARD_MODULES.every((mod) => {
      if (hasSubmodules(mod)) {
        return (DASHBOARD_SUBMODULES[mod] || []).every(sub => dashboardSubmenus[mod]?.includes(sub));
      }
      return Boolean(dashboardPermissions[mod]);
    });

    if (isAllChecked) {
      setDashboardPermissions({});
      setDashboardSubmenus({});
    } else {
      const allPerms: Record<string, string[]> = {};
      const allSubs: Record<string, string[]> = {};
      DASHBOARD_MODULES.forEach((mod) => {
        if (hasSubmodules(mod)) {
          const subs = DASHBOARD_SUBMODULES[mod] || [];
          allSubs[mod] = [...subs];
          subs.forEach((sub) => {
            allPerms[sub] = ["Create", "Read", "Update", "Delete"];
          });
        } else {
          allPerms[mod] = ["Create", "Read", "Update", "Delete"];
        }
      });
      setDashboardPermissions(allPerms);
      setDashboardSubmenus(allSubs);
    }
  };

  const handleSelectAllWorkspace = () => {
    if (workspacePermissions.length === WORKSPACE_MODULES.length) {
      setWorkspacePermissions([]);
    } else {
      setWorkspacePermissions([...WORKSPACE_MODULES]);
    }
  };

  const handleSave = () => {
    if (!name.trim()) return;

    const finalDashboardPermissions = dashboardEnabled ? dashboardPermissions : {};
    const finalDashboardSubmenus = dashboardEnabled ? dashboardSubmenus : {};
    const finalWorkspacePermissions = workspaceEnabled ? workspacePermissions : [];

    const activeDashboardKeys = Object.keys(finalDashboardPermissions);
    const combinedAccess = [...activeDashboardKeys, ...finalWorkspacePermissions];

    onSave(
      {
        name,
        description,
        access: combinedAccess,
        dashboardEnabled,
        workspaceEnabled,
        dashboardPermissions: finalDashboardPermissions,
        dashboardSubmenus: finalDashboardSubmenus,
        workspacePermissions: finalWorkspacePermissions,
      },
      initialItem?.id
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />Kembali
        </button>
        <div>
          <h1 className="text-xl font-bold text-foreground">
            {isEditMode ? `Edit Role - ${initialItem?.name}` : "Create New Role"}
          </h1>
          <p className="text-xs text-muted-foreground font-mono">
            Account / Role Management / {isEditMode ? "Edit" : "Create"}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* Main form */}
        <div className="bg-card border border-border/80 rounded-2xl p-6 shadow-sm space-y-6">
          <div className="flex items-center gap-3 pb-3 border-b border-border/60">
            <div className="h-9 w-9 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Shield className="h-4.5 w-4.5 text-violet-500" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground">Detail Role & Hak Akses</h2>
              <p className="text-xs text-muted-foreground">Tentukan hak akses pada modul Dashboard dan Workspace</p>
            </div>
          </div>

          {/* Basic Info */}
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nama Role</label>
              <input
                type="text"
                placeholder="Contoh: Editor Konten, Finance Admin"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deskripsi Singkat</label>
              <textarea
                rows={2}
                placeholder="Tuliskan deskripsi tanggung jawab atau batasan dari role ini..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Akses Grid */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 pt-3 border-t border-border/60">
            
            {/* 1. Hak Akses Module Dashboard Card */}
            <div className="space-y-4 p-4 rounded-2xl border border-border bg-muted/20">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">Hak Akses Module Dashboard</h3>
                </div>
                
                {/* MASTER TOGGLE FOR DASHBOARD MODULES */}
                <button
                  type="button"
                  onClick={() => setDashboardEnabled(!dashboardEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    dashboardEnabled ? "bg-primary" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      dashboardEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {dashboardEnabled ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Pilih Menu</span>
                    <button
                      type="button"
                      onClick={handleSelectAllDashboard}
                      className="text-[11px] font-bold text-primary hover:underline"
                    >
                      Toggle Select All
                    </button>
                  </div>

                  <div className="space-y-3">
                    {DASHBOARD_MODULES.map((module) => {
                      const hasSubs = hasSubmodules(module);
                      const submodules = DASHBOARD_SUBMODULES[module] || [];
                      const activeSubs = dashboardSubmenus[module] || [];
                      
                      // Parent is active if its checklist is checked (or if any submenu is active)
                      const isEnabled = hasSubs 
                        ? submodules.some(sub => activeSubs.includes(sub))
                        : Boolean(dashboardPermissions[module]);
                      
                      const activeCruds = dashboardPermissions[module] || [];

                      return (
                        <div
                          key={module}
                          className={`rounded-xl border transition-all overflow-hidden ${
                            isEnabled
                              ? "border-primary/30 bg-card shadow-sm"
                              : "border-border bg-card/60 hover:bg-card"
                          }`}
                        >
                          {/* Menu Item (Checklist Box) */}
                          <div
                            onClick={() => handleToggleDashboardModule(module)}
                            className="flex items-center gap-3 p-3 cursor-pointer select-none"
                          >
                            <div
                              className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition-all ${
                                isEnabled
                                  ? "bg-primary border-primary text-primary-foreground"
                                  : "border-muted-foreground/30 bg-background"
                              }`}
                            >
                              {isEnabled && <Check className="h-3 w-3 stroke-[3]" />}
                            </div>
                            <span className={`text-xs font-bold ${isEnabled ? "text-foreground" : "text-muted-foreground"}`}>
                              {module}
                            </span>
                          </div>

                          {/* Nested Submenu (or CRUD if no submenus) when parent is active */}
                          {isEnabled && (
                            <div className="px-3 pb-3 pt-1.5 border-t border-dashed border-border bg-muted/10 space-y-3">
                              
                              {/* Option A: If no submenus, show CRUD directly under parent */}
                              {!hasSubs ? (
                                <div className="space-y-1">
                                  <span className="text-[10px] font-bold text-muted-foreground block">
                                    Hak Akses Tindakan (CRUD Multiple Select):
                                  </span>
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {CRUD_OPTIONS.map((action) => {
                                      const isSelected = activeCruds.includes(action);
                                      return (
                                        <button
                                          key={action}
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleToggleCrud(module, action);
                                          }}
                                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all ${
                                            isSelected
                                              ? "bg-primary text-primary-foreground border-primary"
                                              : "bg-background text-muted-foreground border-border hover:text-foreground"
                                          }`}
                                        >
                                          {action}
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>
                              ) : (
                                // Option B: Has submenus, list them. Inside each active submenu, show its CRUD.
                                <div className="space-y-2">
                                  <span className="text-[10px] font-bold text-muted-foreground block">
                                    Akses Submenu & CRUD:
                                  </span>
                                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                                    {submodules.map((sub) => {
                                      const isSubChecked = activeSubs.includes(sub);
                                      const subCruds = dashboardPermissions[sub] || [];
                                      return (
                                        <div
                                          key={sub}
                                          className="p-2 rounded-lg border border-border bg-card/40 space-y-1.5"
                                          onClick={(e) => e.stopPropagation()}
                                        >
                                          <div
                                            onClick={() => handleToggleSubmenu(module, sub)}
                                            className="flex items-center gap-2 cursor-pointer select-none"
                                          >
                                            <div
                                              className={`h-3.5 w-3.5 rounded flex items-center justify-center border transition-all ${
                                                isSubChecked
                                                  ? "bg-primary/95 border-primary text-primary-foreground"
                                                  : "border-muted-foreground/30 bg-background"
                                              }`}
                                            >
                                              {isSubChecked && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                                            </div>
                                            <span className={`text-[10px] font-bold ${isSubChecked ? "text-foreground" : "text-muted-foreground"}`}>
                                              {sub}
                                            </span>
                                          </div>

                                          {/* CRUD checklist directly underneath active submenu */}
                                          {isSubChecked && (
                                            <div className="pl-5 pt-1 border-t border-border/20 flex flex-wrap gap-1">
                                              {CRUD_OPTIONS.map((action) => {
                                                const isSelected = subCruds.includes(action);
                                                return (
                                                  <button
                                                    key={action}
                                                    type="button"
                                                    onClick={() => handleToggleCrud(sub, action)}
                                                    className={`inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold border transition-all ${
                                                      isSelected
                                                        ? "bg-primary text-primary-foreground border-primary"
                                                        : "bg-background text-muted-foreground border-border hover:text-foreground"
                                                    }`}
                                                  >
                                                    {action}
                                                  </button>
                                                );
                                              })}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              )}

                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border rounded-xl bg-card/40">
                  <Lock className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">Kategori dinonaktifkan</p>
                  <p className="text-[10px] text-muted-foreground/75 mt-0.5">Nyalakan toggle di atas untuk mengatur menu</p>
                </div>
              )}
            </div>

            {/* 2. Hak Akses Module Workspace Card */}
            <div className="space-y-4 p-4 rounded-2xl border border-border bg-muted/20">
              <div className="flex items-center justify-between pb-2 border-b border-border/40">
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-violet-500" />
                  <h3 className="text-sm font-bold text-foreground">Hak Akses Module Workspace</h3>
                </div>

                {/* MASTER TOGGLE FOR WORKSPACE MODULES */}
                <button
                  type="button"
                  onClick={() => setWorkspaceEnabled(!workspaceEnabled)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    workspaceEnabled ? "bg-violet-600" : "bg-muted"
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                      workspaceEnabled ? "translate-x-5" : "translate-x-0"
                    }`}
                  />
                </button>
              </div>

              {workspaceEnabled ? (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">
                      Pilih Akses ({workspacePermissions.length}/{WORKSPACE_MODULES.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleSelectAllWorkspace}
                      className="text-[11px] font-bold text-violet-600 dark:text-violet-400 hover:underline"
                    >
                      {workspacePermissions.length === WORKSPACE_MODULES.length
                        ? "Deselect All"
                        : "Select All"}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-2.5">
                    {WORKSPACE_MODULES.map((module) => {
                      const isEnabled = workspacePermissions.includes(module);
                      return (
                        <div
                          key={module}
                          onClick={() => handleToggleWorkspaceModule(module)}
                          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer select-none transition-all ${
                            isEnabled
                              ? "border-violet-500/30 bg-card shadow-sm text-foreground"
                              : "border-border bg-card/60 hover:bg-card text-muted-foreground"
                          }`}
                        >
                          {/* Checklist Box */}
                          <div
                            className={`h-4.5 w-4.5 rounded-md flex items-center justify-center border transition-all ${
                              isEnabled
                                ? "bg-violet-600 border-violet-600 text-white"
                                : "border-muted-foreground/30 bg-background"
                            }`}
                          >
                            {isEnabled && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          
                          <span className="text-xs font-bold">{module}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-8 text-center border border-dashed border-border rounded-xl bg-card/40">
                  <Lock className="h-6 w-6 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-xs text-muted-foreground font-medium">Kategori dinonaktifkan</p>
                  <p className="text-[10px] text-muted-foreground/75 mt-0.5">Nyalakan toggle di atas untuk mengatur menu</p>
                </div>
              )}
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-border/60">
            <button
              type="button"
              onClick={handleSave}
              disabled={!name.trim()}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary min-w-[120px] justify-center shadow-md shadow-primary/20 text-primary-foreground text-sm font-semibold hover:bg-primary/90 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Save className="h-4 w-4" />
              {isEditMode ? "Simpan" : "Buat Role"}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="px-5 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            >
              Batal
            </button>
          </div>
        </div>

        {/* Sidebar Live Preview */}
        <div className="space-y-4">
          <div className="bg-card border border-border/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Live Preview</h3>
              <p className="text-sm font-bold text-foreground mt-1">{name || "Nama Role Baru"}</p>
              <p className="text-xs text-muted-foreground italic leading-relaxed mt-0.5">
                {description || "Belum ada deskripsi singkat."}
              </p>
            </div>

            {dashboardEnabled && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <LayoutDashboard className="h-3 w-3 text-primary" /> Dashboard Access:
                </span>
                <div className="flex flex-col gap-2 pl-1">
                  {DASHBOARD_MODULES.filter(mod => {
                    if (hasSubmodules(mod)) {
                      return dashboardSubmenus[mod]?.length > 0;
                    }
                    return Boolean(dashboardPermissions[mod]);
                  }).length === 0 ? (
                    <span className="text-[10px] text-muted-foreground italic">Tidak ada menu terpilih</span>
                  ) : (
                    DASHBOARD_MODULES.map((mod) => {
                      const hasSubs = hasSubmodules(mod);
                      const activeSubs = dashboardSubmenus[mod] || [];
                      
                      if (hasSubs && activeSubs.length > 0) {
                        return (
                          <div key={mod} className="space-y-1">
                            <span className="text-[10px] font-bold text-foreground block">{mod}</span>
                            <div className="flex flex-col gap-1 pl-2 border-l border-border/60">
                              {activeSubs.map((s) => {
                                const cruds = dashboardPermissions[s] || [];
                                return (
                                  <div key={s} className="flex items-center gap-1">
                                    <span className="text-[9px] font-semibold text-muted-foreground">{s}</span>
                                    {cruds.length > 0 && (
                                      <span className="font-bold text-[7px] bg-primary text-primary-foreground px-1 rounded-sm">
                                        {cruds.map((c) => c[0]).join("")}
                                      </span>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        );
                      }
                      
                      if (!hasSubs && dashboardPermissions[mod]) {
                        const cruds = dashboardPermissions[mod] || [];
                        return (
                          <div key={mod} className="flex items-center gap-1">
                            <span className="text-[10px] font-bold text-foreground">{mod}</span>
                            {cruds.length > 0 && (
                              <span className="font-bold text-[8px] bg-primary text-primary-foreground px-1 rounded-sm">
                                {cruds.map((c) => c[0]).join("")}
                              </span>
                            )}
                          </div>
                        );
                      }

                      return null;
                    })
                  )}
                </div>
              </div>
            )}

            {workspaceEnabled && (
              <div className="space-y-2 pt-2 border-t border-border/40">
                <span className="text-[11px] font-bold text-foreground flex items-center gap-1.5">
                  <Briefcase className="h-3 w-3 text-violet-500" /> Workspace Access:
                </span>
                <div className="flex flex-wrap gap-1">
                  {workspacePermissions.length === 0 ? (
                    <span className="text-[10px] text-muted-foreground italic">Tidak ada menu terpilih</span>
                  ) : (
                    workspacePermissions.map((mod) => (
                      <span
                        key={mod}
                        className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-semibold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20"
                      >
                        {mod}
                      </span>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {isEditMode && (
            <div className="bg-card border border-red-500/20 rounded-2xl p-5 shadow-sm space-y-3">
              <h3 className="text-xs font-semibold text-red-500 uppercase tracking-wide flex items-center gap-1.5">
                <AlertTriangle className="h-3.5 w-3.5" />Danger Zone
              </h3>
              <p className="text-xs text-muted-foreground font-medium">
                Menghapus role ini akan berdampak pada pengguna yang menggunakan role ini.
              </p>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-red-500/30 bg-red-500/5 text-red-600 dark:text-red-400 text-sm font-bold hover:bg-red-500/10 transition-all"
              >
                <Trash2 className="h-4 w-4" />Hapus Role
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          onClick={() => setShowDeleteConfirm(false)}
        >
          <div
            className="relative w-full max-w-sm bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(false)}
              className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-red-500/10 flex items-center justify-center shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-500" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">Konfirmasi Hapus</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak bisa dibatalkan</p>
              </div>
            </div>

            <p className="text-xs text-muted-foreground leading-relaxed font-medium">
              Ketik <span className="font-bold text-foreground">{initialItem?.name}</span> untuk mengonfirmasi penghapusan role ini secara permanen.
            </p>

            <input
              type="text"
              placeholder={`Ketik "${initialItem?.name}"`}
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500 transition-all"
            />

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  if (initialItem) {
                    onDelete(initialItem.id);
                  }
                  setShowDeleteConfirm(false);
                }}
                disabled={deleteInput !== initialItem?.name}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-red-500 hover:bg-red-600 disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-md shadow-red-500/20"
              >
                <Trash2 className="h-3.5 w-3.5" />Hapus Permanen
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
