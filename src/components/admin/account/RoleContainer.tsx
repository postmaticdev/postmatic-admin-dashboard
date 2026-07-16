import React, { useState } from "react";
import { RoleItem, initialRoles } from "./types";
import { RoleTableList } from "./RoleTableList";
import { RoleFormView } from "./RoleFormView";
import { toast } from "sonner";

export function RoleContainer() {
  const [items, setItems] = useState<RoleItem[]>(initialRoles);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<RoleItem | null>(null);

  const handleSave = (data: Omit<RoleItem, "id">, id?: string) => {
    if (id) {
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
      toast.success(`Role "${data.name}" berhasil diperbarui!`);
    } else {
      const newItem: RoleItem = {
        ...data,
        id: `r-${Date.now()}`,
      };
      setItems((prev) => [...prev, newItem]);
      toast.success(`Role "${data.name}" berhasil ditambahkan!`);
    }
    setViewMode("list");
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const target = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Role "${target?.name}" berhasil dihapus.`);
    setViewMode("list");
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <RoleTableList
          items={items}
          onCreateNew={() => {
            setEditingItem(null);
            setViewMode("create");
          }}
          onEdit={(item) => {
            setEditingItem(item);
            setViewMode("edit");
          }}
        />
      ) : (
        <RoleFormView
          initialItem={editingItem}
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => {
            setViewMode("list");
            setEditingItem(null);
          }}
        />
      )}
    </div>
  );
}
export { initialRoles };
