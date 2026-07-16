import React, { useState } from "react";
import { AIModelItem, initialImageModels, initialTextModels } from "./types";
import { AIModelTableList } from "./AIModelTableList";
import { AIModelFormView } from "./AIModelFormView";
import { toast } from "sonner";

interface AIModelContainerProps {
  modelType: "Image" | "Text";
}

export function AIModelContainer({ modelType }: AIModelContainerProps) {
  const initialData = modelType === "Image" ? initialImageModels : initialTextModels;
  const [items, setItems] = useState<AIModelItem[]>(initialData);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<AIModelItem | null>(null);

  const handleSave = (data: Omit<AIModelItem, "id">, id?: string) => {
    if (id) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
      toast.success(`Model "${data.name}" berhasil diperbarui!`);
    } else {
      const newItem: AIModelItem = { ...data, id: `${modelType.toLowerCase()}-${Date.now()}` };
      setItems((prev) => [newItem, ...prev]);
      toast.success(`Model "${data.name}" berhasil ditambahkan!`);
    }
    setViewMode("list");
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const target = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`Model "${target?.name}" berhasil dihapus!`);
    setViewMode("list");
    setEditingItem(null);
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "Active" ? "Inactive" : "Active";
          toast.success(`Status model "${item.name}" diubah menjadi ${newStatus}!`);
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <AIModelTableList
          items={items}
          modelType={modelType}
          onCreateNew={() => { setEditingItem(null); setViewMode("create"); }}
          onEdit={(item) => { setEditingItem(item); setViewMode("edit"); }}
          onToggleStatus={handleToggleStatus}
          onReorder={setItems}
        />
      ) : (
        <AIModelFormView
          initialItem={editingItem}
          modelType={modelType}
          onSave={handleSave}
          onCancel={() => { setViewMode("list"); setEditingItem(null); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
