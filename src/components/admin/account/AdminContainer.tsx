import React, { useState } from "react";
import { AdminAccount, initialAdmins } from "./types";
import { AdminTableList } from "./AdminTableList";
import { AdminFormView } from "./AdminFormView";
import { AdminCreateForm } from "./AdminCreateForm";
import { initialRoles } from "./RoleContainer";
import { toast } from "sonner";
import { ShieldCheck, Plus } from "lucide-react";

export function AdminContainer() {
  const [admins, setAdmins] = useState<AdminAccount[]>(initialAdmins);
  const [viewMode, setViewMode] = useState<"list" | "edit" | "create">("list");
  const [editingAdmin, setEditingAdmin] = useState<AdminAccount | null>(null);

  const handleEdit = (admin: AdminAccount) => {
    setEditingAdmin(admin);
    setViewMode("edit");
  };

  const handleSave = (data: Omit<AdminAccount, "id">, id: string) => {
    setAdmins((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...data } : a))
    );
    toast.success(`Data "${data.fullName}" berhasil diperbarui!`);
    setViewMode("list");
    setEditingAdmin(null);
  };

  const handleCreate = (data: Omit<AdminAccount, "id">) => {
    const newAdmin: AdminAccount = {
      ...data,
      id: `a-${Date.now()}`,
    };
    setAdmins((prev) => [newAdmin, ...prev]);
    toast.success(`Admin "${data.fullName}" berhasil ditambahkan!`);
    setViewMode("list");
  };

  const handleDelete = (id: string) => {
    const target = admins.find((a) => a.id === id);
    setAdmins((prev) => prev.filter((a) => a.id !== id));
    toast.success(`Admin "${target?.fullName}" berhasil dihapus.`);
    setViewMode("list");
    setEditingAdmin(null);
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" && (
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-violet-500/5 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
                <ShieldCheck className="h-5 w-5 text-violet-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                    Account Management
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">/ Admin</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Manajemen Admin</h1>
                <p className="text-sm text-muted-foreground">Kelola semua akun administrator platform Postmatic.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("create")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0 self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />Create Admin
            </button>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <AdminTableList items={admins} onEdit={handleEdit} />
      ) : viewMode === "edit" ? (
        editingAdmin && (
          <AdminFormView
            admin={editingAdmin}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => { setViewMode("list"); setEditingAdmin(null); }}
          />
        )
      ) : (
        <AdminCreateForm
          roles={initialRoles}
          onSave={handleCreate}
          onCancel={() => setViewMode("list")}
        />
      )}
    </div>
  );
}
