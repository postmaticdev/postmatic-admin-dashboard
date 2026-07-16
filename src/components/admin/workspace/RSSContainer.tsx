import React, { useState } from "react";
import { RSSItem, initialRSSFeeds } from "./types";
import { RSSTableList } from "./RSSTableList";
import { RSSFormView } from "./RSSFormView";
import { toast } from "sonner";

export function RSSContainer() {
  const [items, setItems] = useState<RSSItem[]>(initialRSSFeeds);
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<RSSItem | null>(null);

  const handleSave = (data: Omit<RSSItem, "id">, id?: string) => {
    if (id) {
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...data } : item)));
      toast.success(`RSS feed "${data.name}" berhasil diperbarui!`);
    } else {
      setItems((prev) => [{ ...data, id: `rss-${Date.now()}` }, ...prev]);
      toast.success(`RSS feed "${data.name}" berhasil ditambahkan!`);
    }
    setViewMode("list");
    setEditingItem(null);
  };

  const handleDelete = (id: string) => {
    const target = items.find((item) => item.id === id);
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success(`RSS feed "${target?.name}" berhasil dihapus!`);
    setViewMode("list");
    setEditingItem(null);
  };

  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "Active" ? "Inactive" : "Active";
          toast.success(`Status RSS "${item.name}" diubah menjadi ${newStatus}!`);
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <RSSTableList
          items={items}
          onCreateNew={() => { setEditingItem(null); setViewMode("create"); }}
          onEdit={(item) => { setEditingItem(item); setViewMode("edit"); }}
          onToggleStatus={handleToggleStatus}
        />
      ) : (
        <RSSFormView
          initialItem={editingItem}
          onSave={handleSave}
          onCancel={() => { setViewMode("list"); setEditingItem(null); }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
