import React, { useState } from "react";
import { LegalityItem } from "./types";
import {
  Plus,
  Edit3,
  Search,
  Scale,
  CheckCircle2,
  Clock,
  Filter,
  X,
  ExternalLink,
} from "lucide-react";

interface LegalityTableListProps {
  items: LegalityItem[];
  onCreateNew: () => void;
  onEdit: (item: LegalityItem) => void;
  onToggleStatus: (id: string) => void;
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
  "Terms & Conditions": "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  "Privacy Policy": "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "Acceptable Use": "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
  "Cookie Policy": "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  "GDPR Compliance": "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
};

function TableRow({
  item,
  onEdit,
  onToggleStatus,
  onRowClick,
}: {
  item: LegalityItem;
  onEdit: (item: LegalityItem) => void;
  onToggleStatus: (id: string) => void;
  onRowClick: () => void;
}) {
  const badgeClass =
    menuColorMap[item.menuLabel] ||
    "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";

  const cleanSnippet = stripHtml(item.content);

  return (
    <tr
      onClick={onRowClick}
      className="group transition-colors border-b border-border/60 hover:bg-muted/40 bg-card cursor-pointer"
    >
      {/* Judul Dokumen & Link */}
      <td className="py-4 px-4 max-w-[240px]">
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-sm tracking-tight group-hover:text-primary transition-colors line-clamp-1">
            {item.title}
          </span>
          {item.link && (
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="text-[10px] text-primary hover:underline truncate max-w-[200px]"
            >
              {item.link}
            </a>
          )}
        </div>
      </td>

      {/* Nama Menu */}
      <td className="py-4 px-4 whitespace-nowrap">
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}
        >
          {item.menuLabel}
        </span>
      </td>

      {/* Isi Docs (Cuplikan) */}
      <td className="py-4 px-4 max-w-[320px]">
        <p
          className="text-xs text-muted-foreground truncate leading-relaxed"
          title={cleanSnippet}
        >
          {cleanSnippet || "Belum ada cuplikan konten..."}
        </p>
      </td>

      {/* Status & Waktu */}
      <td className="py-4 px-4 whitespace-nowrap">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5">
            {item.status === "Published" ? (
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
            {item.updatedAt} • {item.author}
          </span>
        </div>
      </td>

      {/* Action */}
      <td className="py-4 pr-4 pl-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>

          <div
            className="flex items-center gap-2"
            title={
              item.status === "Published"
                ? "Ubah status ke Draft"
                : "Ubah status ke Published"
            }
          >
            <button
              type="button"
              onClick={() => onToggleStatus(item.id)}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
                item.status === "Published"
                  ? "bg-emerald-500"
                  : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                  item.status === "Published"
                    ? "translate-x-4"
                    : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        </div>
      </td>
    </tr>
  );
}

function LegalityDetailModal({
  item,
  onClose,
  onEdit,
}: {
  item: LegalityItem;
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
            <h3 className="text-base font-bold text-foreground truncate max-w-[280px]">{item.title}</h3>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${menuColorMap[item.menuLabel] || "bg-slate-500/10 border-slate-500/20 text-slate-600"}`}>
              {item.menuLabel}
            </span>
          </div>

          {item.link && (
            <div className="text-xs text-muted-foreground">
              Link Dokumen: <a href={item.link} target="_blank" rel="noreferrer" className="text-primary hover:underline font-medium ml-1 inline-flex items-center gap-0.5">{item.link} <ExternalLink className="h-3 w-3" /></a>
            </div>
          )}

          <div className="max-h-[220px] overflow-y-auto p-4 rounded-xl border border-border bg-muted/40 text-xs text-foreground leading-relaxed whitespace-pre-line font-medium shadow-inner">
            {stripHtml(item.content) || "Dokumen kosong..."}
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border/40 pt-3 text-muted-foreground">
            <span>Dibuat oleh: <span className="font-semibold text-foreground">{item.author}</span></span>
            <span>Terakhir update: <span className="font-semibold text-foreground">{item.updatedAt}</span></span>
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

export function LegalityTableList({
  items,
  onCreateNew,
  onEdit,
  onToggleStatus,
}: LegalityTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMenuFilter, setSelectedMenuFilter] = useState("ALL");
  const [selectedItem, setSelectedItem] = useState<LegalityItem | null>(null);

  // Get distinct menu labels for filter
  const menuCategories = [
    "ALL",
    ...Array.from(new Set(items.map((d) => d.menuLabel))),
  ];

  // Filter items
  const filteredItems = items.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.menuLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.content.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedMenuFilter === "ALL" || item.menuLabel === selectedMenuFilter;

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
                <Scale className="h-3.5 w-3.5" />
                Legality
              </span>
              <span className="text-xs text-muted-foreground font-mono">
                Legal Documents / Compliance
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              Legality Content Manager
            </h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Kelola dokumen hukum, syarat & ketentuan, kebijakan privasi, dan
              dokumen kepatuhan lainnya untuk platform Postmatic.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
            >
              <Plus className="h-4 w-4" />
              Create New Legality
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
            placeholder="Cari judul, kategori, atau konten legal..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Filter className="h-3.5 w-3.5" />
            <span>Kategori:</span>
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
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
              <th className="py-3 px-4">Judul Dokumen</th>
              <th className="py-3 px-4">Nama Menu</th>
              <th className="py-3 px-4">Isi Docs (Cuplikan)</th>
              <th className="py-3 px-4">Status &amp; Waktu</th>
              <th className="py-3 pr-4 pl-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-12 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Scale className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">
                      Tidak ada dokumen legal yang ditemukan.
                    </p>
                    <p className="text-xs text-muted-foreground/80">
                      Coba sesuaikan filter atau klik &quot;Create New
                      Legality&quot;.
                    </p>
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map((item) => (
                <TableRow
                  key={item.id}
                  item={item}
                  onEdit={onEdit}
                  onToggleStatus={onToggleStatus}
                  onRowClick={() => setSelectedItem(item)}
                />
              ))
            )}
          </tbody>
        </table>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 flex items-center justify-between text-xs text-muted-foreground">
          <span>
            Menampilkan <strong>{filteredItems.length}</strong> dari{" "}
            <strong>{items.length}</strong> dokumen legal
          </span>
        </div>
      </div>

      {/* Legality Detail Modal */}
      {selectedItem && (
        <LegalityDetailModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
          onEdit={() => { onEdit(selectedItem); setSelectedItem(null); }}
        />
      )}
    </div>
  );
}
