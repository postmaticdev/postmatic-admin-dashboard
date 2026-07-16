import React, { useState } from "react";
import { DocItem } from "./types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Plus,
  GripVertical,
  Edit3,
  Trash2,
  Search,
  ExternalLink,
  BookOpen,
  CheckCircle2,
  Clock,
  Filter,
  X,
} from "lucide-react";
import { renderLucideIcon } from "./LucideIconPickerModal";

interface DocsTableListProps {
  docs: DocItem[];
  onReorder: (newDocs: DocItem[]) => void;
  onCreateNew: () => void;
  onEdit: (doc: DocItem) => void;
  onToggleStatus: (docId: string) => void;
}

// Helper function to strip HTML tags for preview snippet
function stripHtml(html: string): string {
  if (typeof document === "undefined") {
    return html.replace(/<[^>]*>?/gm, "");
  }
  const tmp = document.createElement("DIV");
  tmp.innerHTML = html;
  return tmp.textContent || tmp.innerText || "";
}

// Menu Badge color mapping
const menuColorMap: Record<string, string> = {
  "Getting Started": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Authentication": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "Messaging Guides": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "Webhooks & Events": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Rate Limits": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

// Sortable Row Component
function SortableRow({
  doc,
  onEdit,
  onToggleStatus,
  onRowClick,
}: {
  doc: DocItem;
  onEdit: (doc: DocItem) => void;
  onToggleStatus: (docId: string) => void;
  onRowClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: doc.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  const badgeClass =
    menuColorMap[doc.menuLabel] ||
    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";

  const cleanSnippet = stripHtml(doc.content);

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={onRowClick}
      className={`group transition-colors border-b border-border/60 cursor-pointer ${
        isDragging
          ? "bg-primary/5 shadow-lg scale-[1.006]"
          : "hover:bg-muted/40 bg-card"
      }`}
    >
      {/* Drag Handle */}
      <td className="w-12 py-4 pl-4 text-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-grab active:cursor-grabbing transition-colors focus:outline-none"
          title="Drag to reorder menu"
        >
          <GripVertical className="h-4 w-4 mx-auto" />
        </button>
      </td>

      {/* Judul & Slug */}
      <td className="py-4 px-3 max-w-[280px]">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            {renderLucideIcon(doc.icon, "h-4 w-4 text-primary shrink-0")}
            <span className="font-semibold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors line-clamp-1">
              {doc.title}
            </span>
          </div>
          <span className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5 truncate">
            <span className="font-mono text-[11px] text-muted-foreground/80">
              docs.postmatic.id/docs/{doc.slug}
            </span>
          </span>
        </div>
      </td>

      {/* Label Nama Menu */}
      <td className="py-4 px-3 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}
        >
          {doc.menuLabel}
        </span>
      </td>

      {/* Isi Docs (Cuplikan Konten dengan Truncate) */}
      <td className="py-4 px-3 max-w-[340px]">
        <p className="text-xs text-muted-foreground truncate leading-relaxed" title={cleanSnippet}>
          {cleanSnippet || "Belum ada cuplikan konten..."}
        </p>
      </td>

      {/* Status & Updated */}
      <td className="py-4 px-3 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {doc.status === "Published" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                <CheckCircle2 className="h-3 w-3" />
                Published
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                <Clock className="h-3 w-3" />
                Draft
              </span>
            )}
          </div>
          <span className="text-[11px] text-muted-foreground">
            {doc.updatedAt} • {doc.author}
          </span>
        </div>
      </td>

      {/* Action */}
      <td className="py-4 pr-4 pl-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onEdit(doc)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <div className="flex items-center gap-2" title={doc.status === "Published" ? "Ubah status ke Draft" : "Ubah status ke Published"}>
            <button
              type="button"
              onClick={() => onToggleStatus(doc.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                doc.status === "Published" ? "bg-emerald-500" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  doc.status === "Published" ? "translate-x-4" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

export function DocsTableList({
  docs,
  onReorder,
  onCreateNew,
  onEdit,
  onToggleStatus,
}: DocsTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenuFilter, setSelectedMenuFilter] = useState("ALL");
  const [selectedDoc, setSelectedDoc] = useState<DocItem | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = docs.findIndex((d) => d.id === active.id);
      const newIndex = docs.findIndex((d) => d.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reordered = [...docs];
        const [moved] = reordered.splice(oldIndex, 1);
        reordered.splice(newIndex, 0, moved);

        // Re-assign order numbers
        const updatedOrders = reordered.map((item, idx) => ({
          ...item,
          order: idx + 1,
        }));
        onReorder(updatedOrders);
      }
    }
  };

  // Get distinct menu labels for filter
  const menuCategories = ["ALL", ...Array.from(new Set(docs.map((d) => d.menuLabel)))];

  // Filter docs
  const filteredDocs = docs.filter((doc) => {
    const matchesSearch =
      doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.menuLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      doc.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedMenuFilter === "ALL" || doc.menuLabel === selectedMenuFilter;

    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-primary/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <BookOpen className="h-3.5 w-3.5" />
                docs.postmatic.id
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                CMS / Knowledge Base
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Documentation Content Manager
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Kelola struktur menu, topik panduan, dan referensi API publik untuk portal dokumentasi Postmatic. Urutkan posisi menu secara visual menggunakan fitur drag-and-drop.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <a
              href="https://docs.postmatic.id"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-background/80 px-4 py-2.5 text-xs font-medium text-foreground hover:bg-muted transition-colors shadow-sm"
              onClick={(e) => {
                e.preventDefault();
                alert("Preview portal docs.postmatic.id (Live preview terhubung ke domain publik)");
              }}
            >
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
              Live Portal Preview
            </a>

            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              Create New Docs
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari judul dokumentasi, kategori menu, atau konten..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Kategori Menu:</span>
          </div>
          <select
            value={selectedMenuFilter}
            onChange={(e) => setSelectedMenuFilter(e.target.value)}
            className="px-3 py-2 text-xs font-medium bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40"
          >
            {menuCategories.map((cat) => (
              <option key={cat} value={cat}>
                {cat === "ALL" ? "Semua Kategori" : cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th className="w-12 py-3 pl-4 text-center">Urutan</th>
                <th className="py-3 px-3">Judul Dokumen</th>
                <th className="py-3 px-3">Label Nama Menu</th>
                <th className="py-3 px-3">Isi Docs (Cuplikan)</th>
                <th className="py-3 px-3">Status & Waktu</th>
                <th className="py-3 pr-4 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <SortableContext
              items={filteredDocs.map((d) => d.id)}
              strategy={verticalListSortingStrategy}
            >
              <tbody>
                {filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium">Tidak ada dokumen yang ditemukan.</p>
                        <p className="text-xs text-muted-foreground/80">
                          Coba sesuaikan filter pencarian Anda atau klik tombol &quot;Create New Docs&quot;.
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <SortableRow
                      key={doc.id}
                      doc={doc}
                      onEdit={onEdit}
                      onToggleStatus={onToggleStatus}
                      onRowClick={() => setSelectedDoc(doc)}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Menampilkan <strong>{filteredDocs.length}</strong> dari <strong>{docs.length}</strong> dokumen
          </span>
          <span className="flex items-center gap-1.5">
            <GripVertical className="h-3.5 w-3.5" />
            Tips: Drag & drop ikon grip di kolom kiri untuk mengubah urutan menu navigasi di portal docs.postmatic.id
          </span>
        </div>
      </div>
      {/* Doc Detail Modal */}
      {selectedDoc && (
        <DocDetailModal
          doc={selectedDoc}
          onClose={() => setSelectedDoc(null)}
          onEdit={() => { onEdit(selectedDoc); setSelectedDoc(null); }}
        />
      )}
    </div>
  );
}

function DocDetailModal({
  doc,
  onClose,
  onEdit,
}: {
  doc: DocItem;
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-20 bg-gradient-to-br from-primary/20 via-primary/10 to-transparent" />
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {renderLucideIcon(doc.icon, "h-5 w-5 text-primary shrink-0")}
              <h3 className="text-base font-bold text-foreground truncate max-w-[280px]">{doc.title}</h3>
            </div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${menuColorMap[doc.menuLabel] || "bg-slate-500/10 border-slate-500/20 text-slate-600"}`}>
              {doc.menuLabel}
            </span>
          </div>

          <div className="text-xs text-muted-foreground font-mono bg-muted/40 p-2 rounded-lg border border-border/40">
            Path: docs.postmatic.id/docs/{doc.slug}
          </div>

          <div className="max-h-[220px] overflow-y-auto p-4 rounded-xl border border-border bg-muted/40 text-xs text-foreground leading-relaxed whitespace-pre-line font-medium shadow-inner">
            {stripHtml(doc.content) || "Dokumen kosong..."}
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border/40 pt-3 text-muted-foreground">
            <span>Dibuat oleh: <span className="font-semibold text-foreground">{doc.author}</span></span>
            <span>Terakhir update: <span className="font-semibold text-foreground">{doc.updatedAt}</span></span>
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />Edit Dokumen
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
