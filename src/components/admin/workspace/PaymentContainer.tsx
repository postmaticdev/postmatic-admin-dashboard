import React, { useState } from "react";
import { PaymentMethodItem, initialPaymentMethods } from "./types";
import { PaymentTableList } from "./PaymentTableList";
import { PaymentFormView } from "./PaymentFormView";
import { toast } from "sonner";

export function PaymentContainer() {
  const [items, setItems] = useState<PaymentMethodItem[]>(initialPaymentMethods);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<PaymentMethodItem | null>(null);

  const handleSave = (data: Omit<PaymentMethodItem, "id">, id?: string) => {
    if (id) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
      toast.success(`Payment method "${data.name}" berhasil diperbarui!`);
    } else {
      setItems((prev) => [{ ...data, id: `pay-${Date.now()}` }, ...prev]);
      toast.success(`Payment method "${data.name}" berhasil ditambahkan!`);
    }
    setViewMode("list");
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const target = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Payment method "${target?.name}" berhasil dihapus!`);
    setViewMode("list");
    setEditingItem(null);
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "Active" ? "Inactive" : "Active";
          toast.success(`Status "${item.name}" diubah menjadi ${newStatus}!`);
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <PaymentTableList
          items={items}
          onCreateNew={() => { setEditingItem(null); setViewMode("create"); }}
          onEdit={(item) => { setEditingItem(item); setViewMode("edit"); }}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <PaymentFormView
          initialItem={editingItem}
          onSave={handleSave}
          onCancel={() => { setViewMode("list"); setEditingItem(null); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
