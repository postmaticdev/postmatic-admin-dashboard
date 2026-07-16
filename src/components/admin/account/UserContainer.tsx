import React, { useState } from "react";
import { UserAccount, initialUsers } from "./types";
import { UserTableList } from "./UserTableList";
import { UserFormView } from "./UserFormView";
import { UserCreateForm } from "./UserCreateForm";
import { toast } from "sonner";
import { Users, Plus } from "lucide-react";

export function UserContainer() {
  const [users, setUsers] = useState<UserAccount[]>(initialUsers);
  const [viewMode, setViewMode] = useState<"list" | "edit" | "create">("list");
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);

  const handleEdit = (user: UserAccount) => {
    setEditingUser(user);
    setViewMode("edit");
  };

  const handleSave = (data: Omit<UserAccount, "id" | "postsCount" | "followersCount">, id: string) => {
    setUsers((prev) =>
      prev.map((u) => (u.id === id ? { ...u, ...data } : u))
    );
    toast.success(`Data "${data.fullName}" berhasil diperbarui!`);
    setViewMode("list");
    setEditingUser(null);
  };

  const handleCreate = (data: Omit<UserAccount, "id" | "postsCount" | "followersCount">) => {
    const newUser: UserAccount = {
      ...data,
      id: `u-${Date.now()}`,
      postsCount: 0,
      followersCount: 0,
    };
    setUsers((prev) => [newUser, ...prev]);
    toast.success(`Pengguna "${data.fullName}" berhasil ditambahkan!`);
    setViewMode("list");
  };

  const handleDelete = (id: string) => {
    const target = users.find((u) => u.id === id);
    setUsers((prev) => prev.filter((u) => u.id !== id));
    toast.success(`Pengguna "${target?.fullName}" berhasil dihapus.`);
    setViewMode("list");
    setEditingUser(null);
  };

  return (
    <div className="space-y-6">
      {/* Page header - only show in list mode */}
      {viewMode === "list" && (
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-blue-500/5 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Account Management
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">/ User</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Manajemen Pengguna</h1>
                <p className="text-sm text-muted-foreground">Kelola semua akun pengguna terdaftar di platform Postmatic.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setViewMode("create")}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0 self-start md:self-auto"
            >
              <Plus className="h-4 w-4" />Create User
            </button>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <UserTableList items={users} onEdit={handleEdit} />
      ) : viewMode === "edit" ? (
        editingUser && (
          <UserFormView
            user={editingUser}
            onSave={handleSave}
            onDelete={handleDelete}
            onCancel={() => { setViewMode("list"); setEditingUser(null); }}
          />
        )
      ) : (
        <UserCreateForm
          onSave={handleCreate}
          onCancel={() => setViewMode("list")}
        />
      )}
    </div>
  );
}
