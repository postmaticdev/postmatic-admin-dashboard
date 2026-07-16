import React, { useState, useEffect } from "react";
import { BusinessAccount } from "./types";
import { BusinessTableList } from "./BusinessTableList";
import { BusinessFormView } from "./BusinessFormView";
import { getStoredBusinesses, setStoredBusinesses } from "./store";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";

export function BusinessContainer() {
  const [items, setItems] = useState<BusinessAccount[]>([]);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<BusinessAccount | null>(null);

  // Load from store on mount and when viewMode changes to list
  useEffect(() => {
    setItems(getStoredBusinesses());
  }, [viewMode]);

  const handleSave = (data: Omit<BusinessAccount, "id">, id?: string) => {
    let updatedItems: BusinessAccount[];
    if (id) {
      updatedItems = items.map((item) => (item.id === id ? { ...item, ...data } : item));
      toast.success(`Data bisnis "${data.name}" berhasil diperbarui!`);
    } else {
      const newItem: BusinessAccount = {
        ...data,
        id: `b-${Date.now()}`,
      };
      updatedItems = [newItem, ...items];
      toast.success(`Bisnis "${data.name}" berhasil didaftarkan!`);
    }
    setStoredBusinesses(updatedItems);
    setItems(updatedItems);
    setViewMode("list");
    setEditingItem(null);
  };

  const handleEdit = (item: BusinessAccount) => {
    setEditingItem(item);
    setViewMode("edit");
  };

  const handleCreateNew = () => {
    setEditingItem(null);
    setViewMode("create");
  };

  return (
    <div className="space-y-6">
      {/* Page Header (Only show in List Mode) */}
      {viewMode === "list" && (
        <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-blue-500/5 p-6 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-blue-500" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                    Workspace Management
                  </span>
                  <span className="text-xs text-muted-foreground font-mono">/ Business Management</span>
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Business Management</h1>
                <p className="text-sm text-muted-foreground">Kelola profil bisnis, saldo token AI, dan keanggotaan klien.</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleCreateNew}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0 self-start md:self-auto"
            >
              <Plus className="h-4 w-4" /> Create New Business
            </button>
          </div>
        </div>
      )}

      {viewMode === "list" ? (
        <BusinessTableList
          items={items}
          onEdit={handleEdit}
        />
      ) : (
        <BusinessFormView
          business={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setViewMode("list");
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
