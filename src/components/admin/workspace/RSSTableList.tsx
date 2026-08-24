import React, { useState } from "react";
import {
  AlertCircle,
  Edit3,
  ExternalLink,
  FolderTree,
  Loader2,
  Plus,
  RefreshCw,
  Rss,
  Search,
  X,
} from "lucide-react";

import { TablePagination } from "@/components/ui/table-pagination";
import type { PaginationMeta } from "@/lib/pagination";
import type { RSSCategoryItem, RSSItem } from "./types";

interface RSSTableListProps {
  items: RSSItem[];
  categories?: RSSCategoryItem[];
  selectedCategoryId?: string;
  searchQuery: string;
  pagination: PaginationMeta;
  isLoading?: boolean;
  isPageChanging?: boolean;
  errorMessage?: string;
  isReadOnly?: boolean;
  onCreateNew?: () => void;
  onEdit?: (item: RSSItem) => void;
  onRetry?: () => void;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onCategoryChange?: (categoryId: string) => void;
}

function formatDate(value?: string) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }).format(new Date(value));
  } catch {
    return "-";
  }
}

function TableRow({
  item,
  isReadOnly,
  onEdit,
  onRowClick,
}: {
  item: RSSItem;
  isReadOnly?: boolean;
  onEdit?: (item: RSSItem) => void;
  onRowClick: () => void;
}) {
  return (
    <tr
      onClick={onRowClick}
      className="group cursor-pointer border-b border-border/60 bg-card transition-colors hover:bg-muted/40"
    >
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
            {item.logoUrl ? (
              <img
                src={item.logoUrl}
                alt={item.name}
                className="h-7 w-7 object-contain"
                onError={(event) => {
                  (event.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Rss className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <div className="min-w-0">
            <span className="block truncate text-sm font-semibold text-foreground transition-colors group-hover:text-primary">
              {item.name}
            </span>
            <span className="block truncate text-xs text-muted-foreground">{item.publisher}</span>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <span className="inline-flex max-w-[180px] items-center gap-1 rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
          <FolderTree className="h-3 w-3 shrink-0" />
          <span className="truncate">{item.categoryName || "-"}</span>
        </span>
      </td>
      <td className="max-w-[280px] px-4 py-4">
        <span className="block truncate text-xs font-medium text-primary">{item.sourceUrl}</span>
      </td>
      <td className="whitespace-nowrap px-4 py-4 text-xs text-muted-foreground">
        {formatDate(item.updatedAt ?? item.createdAt)}
      </td>
      {!isReadOnly && onEdit && (
        <td
          className="whitespace-nowrap py-4 pl-3 pr-4 text-right"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary shadow-sm transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            <Edit3 className="h-3.5 w-3.5" />
            Edit
          </button>
        </td>
      )}
    </tr>
  );
}

function RSSDetailModal({
  item,
  onClose,
  onEdit,
  isReadOnly,
}: {
  item: RSSItem;
  onClose: () => void;
  onEdit?: () => void;
  isReadOnly?: boolean;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md overflow-hidden rounded-xl border border-border bg-card shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="border-b border-border/70 bg-muted/30 px-6 py-5">
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 rounded-lg bg-background/80 p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3 pr-8">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-background">
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name} className="h-9 w-9 object-contain" />
              ) : (
                <Rss className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="min-w-0">
              <h3 className="truncate text-base font-bold text-foreground">{item.name}</h3>
              <p className="truncate text-xs text-muted-foreground">{item.publisher}</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 px-6 py-5 text-left">
          <div className="space-y-1">
            <span className="block text-[10px] font-bold uppercase tracking-wide text-muted-foreground">
              URL RSS Feed
            </span>
            <a
              href={item.sourceUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 break-all text-xs font-medium text-primary hover:underline"
            >
              {item.sourceUrl}
              <ExternalLink className="h-3 w-3 shrink-0" />
            </a>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <span className="block text-muted-foreground">Category</span>
              <span className="mt-1 block font-semibold text-foreground">
                {item.categoryName || "-"}
              </span>
            </div>
            <div className="rounded-lg border border-border/70 bg-muted/20 p-3">
              <span className="block text-muted-foreground">Updated</span>
              <span className="mt-1 block font-semibold text-foreground">
                {formatDate(item.updatedAt ?? item.createdAt)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 border-t border-border/40 pt-2">
            {!isReadOnly && onEdit && (
              <button
                type="button"
                onClick={onEdit}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
              >
                <Edit3 className="h-3.5 w-3.5" />
                Edit
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className={`${isReadOnly ? "flex-1" : "px-4"} rounded-lg border border-border bg-muted py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted/80 hover:text-foreground`}
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function RSSTableList({
  items,
  categories = [],
  selectedCategoryId = "",
  searchQuery,
  pagination,
  isLoading = false,
  isPageChanging = false,
  errorMessage,
  isReadOnly = false,
  onCreateNew,
  onEdit,
  onRetry,
  onSearchChange,
  onPageChange,
  onCategoryChange,
}: RSSTableListProps) {
  const [selectedRss, setSelectedRss] = useState<RSSItem | null>(null);

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-orange-500/10 px-2.5 py-0.5 text-xs font-semibold text-orange-600 dark:text-orange-400">
                <Rss className="h-3.5 w-3.5" />
                RSS
              </span>
              <span className="text-xs font-mono text-muted-foreground">Workspace / RSS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              RSS Source Manager
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Kelola source dan category RSS yang tersedia untuk seluruh workspace.
            </p>
          </div>
          {!isReadOnly && onCreateNew && (
            <button
              type="button"
              onClick={onCreateNew}
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90"
            >
              <Plus className="h-4 w-4" />
              New Source
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm md:flex-row md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari title, publisher, category, atau URL..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        {onCategoryChange && (
          <select
            value={selectedCategoryId}
            onChange={(event) => onCategoryChange(event.target.value)}
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 md:w-56"
          >
            <option value="">Semua category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        )}
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="max-h-[520px] overflow-auto md:max-h-[calc(100vh-22rem)]">
          <table className="w-full min-w-[860px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground shadow-sm">
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">URL</th>
                <th className="px-4 py-3">Updated</th>
                {!isReadOnly && <th className="py-3 pl-3 pr-4 text-right">Action</th>}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={isReadOnly ? 4 : 5} className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat RSS source...
                    </div>
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={isReadOnly ? 4 : 5} className="py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2 font-semibold text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Gagal memuat RSS source.
                      </div>
                      <p className="text-xs">{errorMessage}</p>
                      {onRetry && (
                        <button
                          type="button"
                          onClick={onRetry}
                          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                        >
                          <RefreshCw className="h-3.5 w-3.5" />
                          Coba lagi
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : items.length === 0 ? (
                <tr>
                  <td
                    colSpan={isReadOnly ? 4 : 5}
                    className="py-12 text-center text-muted-foreground"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <Rss className="h-8 w-8 text-muted-foreground/50" />
                      <p className="text-sm font-medium">Tidak ada RSS source yang ditemukan.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.id}
                    item={item}
                    isReadOnly={isReadOnly}
                    onEdit={onEdit}
                    onRowClick={() => setSelectedRss(item)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
        <TablePagination
          pagination={pagination}
          itemLabel="RSS source"
          onPageChange={onPageChange}
          disabled={isPageChanging}
        />
      </div>

      {selectedRss && (
        <RSSDetailModal
          item={selectedRss}
          onClose={() => setSelectedRss(null)}
          onEdit={
            onEdit
              ? () => {
                  onEdit(selectedRss);
                  setSelectedRss(null);
                }
              : undefined
          }
          isReadOnly={isReadOnly}
        />
      )}
    </div>
  );
}
