import React, { useState } from "react";
import { VoucherItem, initialVoucherData } from "./types";
import { VoucherTableList } from "./VoucherTableList";
import { VoucherFormView } from "./VoucherFormView";
import { toast } from "sonner";

export function VoucherContainer() {
  const [items, setItems] = useState<VoucherItem[]>(initialVoucherData);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<VoucherItem | null>(null);

  const handleCreateNew = () => {
    setEditingItem(null);
    setViewMode("create");
  };

  const handleEdit = (item: VoucherItem) => {
    setEditingItem(item);
    setViewMode("edit");
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "Active" ? "Inactive" : "Active";
          toast.success(
            `Status voucher "${item.name}" berhasil diubah menjadi ${newStatus}!`
          );
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleSave = (data: Omit<VoucherItem, "id">, id?: string) => {
    if (id) {
      // Update
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
      toast.success(`Voucher "${data.name}" berhasil diperbarui!`);
    } else {
      // Create
      const newItem: VoucherItem = {
        ...data,
        id: `v-${Date.now()}`,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success(`Voucher "${data.name}" berhasil dibuat!`);
    }
    setViewMode("list");
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const target = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Voucher "${target?.name || id}" berhasil dihapus!`);
    setViewMode("list");
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <VoucherTableList
          items={items}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <VoucherFormView
          initialItem={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setViewMode("list");
            setEditingItem(null);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
