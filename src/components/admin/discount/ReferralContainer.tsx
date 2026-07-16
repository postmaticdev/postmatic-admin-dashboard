import React, { useState } from "react";
import { ReferralItem, initialReferralData } from "./types";
import { ReferralTableList } from "./ReferralTableList";
import { ReferralFormView } from "./ReferralFormView";
import { toast } from "sonner";

export function ReferralContainer() {
  const [items, setItems] = useState<ReferralItem[]>(initialReferralData);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<ReferralItem | null>(null);

  const handleCreateNew = () => {
    setEditingItem(null);
    setViewMode("create");
  };

  const handleEdit = (item: ReferralItem) => {
    setEditingItem(item);
    setViewMode("edit");
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "Active" ? "Inactive" : "Active";
          toast.success(
            `Status referral untuk role "${item.role}" berhasil diubah menjadi ${newStatus}!`
          );
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  const handleSave = (data: Omit<ReferralItem, "id">, id?: string) => {
    if (id) {
      // Update
      setItems((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...data } : item))
      );
      toast.success(`Referral untuk role "${data.role}" berhasil diperbarui!`);
    } else {
      // Create
      const newItem: ReferralItem = {
        ...data,
        id: `r-${Date.now()}`,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success(`Referral untuk role "${data.role}" berhasil dibuat!`);
    }
    setViewMode("list");
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <ReferralTableList
          items={items}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <ReferralFormView
          initialItem={editingItem}
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
