import { useState } from "react";
import { DocItem, DocsViewMode } from "./types";
import { initialDocsData } from "./mockDocsData";
import { DocsTableList } from "./DocsTableList";
import { DocsFormView } from "./DocsFormView";
import { toast } from "sonner";

export function DocsManagementContainer() {
  const [docs, setDocs] = useState<DocItem[]>(initialDocsData);
  const [viewMode, setViewMode] = useState<DocsViewMode>("list");
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);

  // Reorder callback from Drag & Drop Table
  const handleReorder = (newDocs: DocItem[]) => {
    setDocs(newDocs);
    toast.success("Urutan menu dokumentasi berhasil diperbarui!");
  };

  // Open Create Mode
  const handleCreateNew = () => {
    setEditingDoc(null);
    setViewMode("create");
  };

  // Open Edit Mode
  const handleEdit = (doc: DocItem) => {
    setEditingDoc(doc);
    setViewMode("edit");
  };

  // Save (Create or Update)
  const handleSave = (
    docData: Omit<DocItem, "id" | "order" | "updatedAt">,
    id?: string
  ) => {
    const todayStr = new Date().toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

    if (id) {
      // Update existing
      setDocs((prev) =>
        prev.map((item) =>
          item.id === id
            ? {
                ...item,
                ...docData,
                updatedAt: todayStr,
              }
            : item
        )
      );
      toast.success(`Dokumen "${docData.title}" berhasil diperbarui!`);
    } else {
      // Create new
      const newId = `doc-${Date.now()}`;
      const newOrder = docs.length + 1;
      const newDocItem: DocItem = {
        ...docData,
        id: newId,
        order: newOrder,
        updatedAt: todayStr,
      };
      setDocs((prev) => [newDocItem, ...prev]);
      toast.success(`Dokumen baru "${docData.title}" berhasil disimpan!`);
    }

    setViewMode("list");
    setEditingDoc(null);
  };

  // Delete Document
  const handleDelete = (id: string) => {
    const target = docs.find((d) => d.id === id);
    setDocs((prev) => prev.filter((d) => d.id !== id));
    toast.success(`Dokumen "${target?.title || id}" berhasil dihapus dari sistem!`);
    if (viewMode === "edit") {
      setViewMode("list");
      setEditingDoc(null);
    }
  };

  // Toggle Status Document
  const handleToggleStatus = (id: string) => {
    setDocs((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newStatus = item.status === "Published" ? "Draft" : "Published";
          toast.success(`Status dokumen "${item.title}" berhasil diubah menjadi ${newStatus}!`);
          return {
            ...item,
            status: newStatus,
          };
        }
        return item;
      })
    );
  };

  // Get distinct menu labels for form selector
  const existingMenuLabels = Array.from(new Set(docs.map((d) => d.menuLabel)));

  return (
    <div className="space-y-6">
      {viewMode === "list" && (
        <DocsTableList
          docs={docs}
          onReorder={handleReorder}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
        />
      )}

      {(viewMode === "create" || viewMode === "edit") && (
        <DocsFormView
          initialDoc={editingDoc}
          existingMenuLabels={existingMenuLabels}
          onSave={handleSave}
          onCancel={() => {
            setViewMode("list");
            setEditingDoc(null);
          }}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
