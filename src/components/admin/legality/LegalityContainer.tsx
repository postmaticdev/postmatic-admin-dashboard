import { useState } from "react";
import { LegalityItem, LegalityViewMode, initialLegalityData } from "./types";
import { LegalityTableList } from "./LegalityTableList";
import { LegalityFormView } from "./LegalityFormView";
import { toast } from "sonner";

export function LegalityContainer() {
  const [items, setItems] = useState<LegalityItem[]>(initialLegalityData);
  const [viewMode, setViewMode] = useState<LegalityViewMode>("list");
  const [editingItem, setEditingItem] = useState<LegalityItem | null>(null);

  // Open Create Mode
  const handleCreateNew = () => {
    setEditingItem(null);
    setViewMode("create");
  };

  // Open Edit Mode
  const handleEdit = (item: LegalityItem) => {
    setEditingItem(item);
    setViewMode("edit");
  };

  // Save (Create or Update)
  const handleSave = (
    data: Omit<LegalityItem, "id" | "order" | "updatedAt">,
    id?: string
  ) => {
    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (id) {
      // Update existing
      setItems((prev) =>
        prev.map((item) =>
          item.id === id
            ? { ...item, ...data, updatedAt: todayStr }
            : item
        )
      );
      toast.success(`Dokumen "${data.title}" berhasil diperbarui!`);
    } else {
      // Create new
      const newId = `legal-${Date.now()}`;
      const newOrder = items.length + 1;
      const newItem: LegalityItem = {
        ...data,
        id: newId,
        order: newOrder,
        updatedAt: todayStr,
      };
      setItems((prev) => [newItem, ...prev]);
      toast.success(`Dokumen baru "${data.title}" berhasil disimpan!`);
    }

    setViewMode("list");
    setEditingItem(null);
  };

  // Delete Document
  const handleDelete = (id: string) => {
    const target = items.find((d) => d.id === id);
    setItems((prev) => prev.filter((d) => d.id !== id));
    toast.success(
      `Dokumen "${target?.title || id}" berhasil dihapus!`
    );
    if (viewMode === "edit") {
      setViewMode("list");
      setEditingItem(null);
    }
  };

  // Toggle Status
  const handleToggleStatus = (id: string) => {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus =
            item.status === "Published" ? "Draft" : "Published";
          toast.success(
            `Status dokumen "${item.title}" berhasil diubah menjadi ${newStatus}!`
          );
          return { ...item, status: newStatus };
        }
        return item;
      })
    );
  };

  // Get distinct menu labels for form selector
  const existingMenuLabels = Array.from(
    new Set(items.map((d) => d.menuLabel))
  );

  return (
    <div className="space-y-6">
      {viewMode === "list" && (
        <LegalityTableList
          items={items}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {(viewMode === "create" || viewMode === "edit") && (
        <LegalityFormView
          initialItem={editingItem}
          existingMenuLabels={existingMenuLabels}
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
