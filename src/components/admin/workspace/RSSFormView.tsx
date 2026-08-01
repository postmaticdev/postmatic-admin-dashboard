import React, { useEffect, useMemo, useState } from "react";
import { AlertTriangle, ArrowLeft, FolderTree, Rss, Save, Trash2 } from "lucide-react";

import type { RSSCategoryItem, RSSFormValues, RSSItem } from "./types";

interface RSSFormViewProps {
  initialItem: RSSItem | null;
  categories: RSSCategoryItem[];
  isSaving?: boolean;
  onSave: (data: RSSFormValues, id?: string) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function RSSFormView({
  initialItem,
  categories,
  isSaving = false,
  onSave,
  onCancel,
  onDelete,
}: RSSFormViewProps) {
  const isEditMode = Boolean(initialItem);
  const firstCategoryId = categories[0]?.id ?? "";
  const [name, setName] = useState(initialItem?.name || "");
  const [sourceUrl, setSourceUrl] = useState(initialItem?.sourceUrl || "");
  const [publisher, setPublisher] = useState(initialItem?.publisher || "");
  const [categoryId, setCategoryId] = useState(initialItem?.categoryId || firstCategoryId);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (!categoryId && firstCategoryId) {
      setCategoryId(firstCategoryId);
    }
  }, [categoryId, firstCategoryId]);

  const selectedCategory = useMemo(
    () => categories.find((category) => category.id === categoryId),
    [categories, categoryId],
  );

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const nextName = name.trim();
    const nextUrl = sourceUrl.trim();
    const nextPublisher = publisher.trim();

    if (!nextName || !nextUrl || !nextPublisher || !categoryId) {
      alert("Harap isi semua kolom wajib.");
      return;
    }

    onSave(
      {
        name: nextName,
        sourceUrl: nextUrl,
        publisher: nextPublisher,
        categoryId,
      },
      initialItem?.id,
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-border/80 bg-card p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-border bg-background p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {isEditMode ? "Edit RSS Source" : "Buat RSS Source"}
            </span>
            <h1 className="text-lg font-bold text-foreground">
              {isEditMode ? name || "Edit RSS Source" : "RSS Source Baru"}
            </h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {isEditMode && onDelete && initialItem && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              disabled={isSaving}
              className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3.5 py-2 text-xs font-semibold text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}
          <button
            type="submit"
            form="rss-source-form"
            disabled={isSaving || categories.length === 0}
            className="inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-2 text-xs font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Save className="h-3.5 w-3.5" />
            {isSaving ? "Menyimpan..." : "Simpan"}
          </button>
        </div>
      </div>

      <form
        id="rss-source-form"
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border border-border bg-card p-6 shadow-sm"
      >
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Rss className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Detail Source</h2>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Judul RSS <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Misal: ANTARA News Terkini"
              className="h-[42px] w-full rounded-lg border border-border bg-background px-3.5 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Publisher <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              required
              value={publisher}
              onChange={(event) => setPublisher(event.target.value)}
              placeholder="Misal: antara"
              className="h-[42px] w-full rounded-lg border border-border bg-background px-3.5 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">
              URL RSS Feed <span className="text-destructive">*</span>
            </label>
            <input
              type="url"
              required
              value={sourceUrl}
              onChange={(event) => setSourceUrl(event.target.value)}
              placeholder="https://example.com/rss.xml"
              className="h-[42px] w-full rounded-lg border border-border bg-background px-3.5 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">
              Category <span className="text-destructive">*</span>
            </label>
            <select
              required
              value={categoryId}
              onChange={(event) => setCategoryId(event.target.value)}
              disabled={categories.length === 0}
              className="h-[42px] w-full rounded-lg border border-border bg-background px-3.5 text-sm font-medium transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {categories.length === 0 ? (
                <option value="">Buat category terlebih dahulu</option>
              ) : (
                categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div className="flex items-center gap-3 rounded-lg border border-border/70 bg-muted/30 px-3.5 py-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <FolderTree className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">
                {selectedCategory?.name ?? "Category belum dipilih"}
              </p>
              <p className="text-xs text-muted-foreground">Dipakai sebagai kategori feed.</p>
            </div>
          </div>
        </div>
      </form>

      {deleteConfirmOpen && initialItem && onDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3 text-destructive">
              <div className="rounded-lg bg-destructive/10 p-2.5">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus RSS Source</h3>
                <p className="text-xs text-muted-foreground">
                  Tindakan ini tidak dapat dibatalkan.
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus{" "}
              <strong className="text-foreground">"{initialItem.name}"</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  onDelete(initialItem.id);
                }}
                className="rounded-lg bg-destructive px-5 py-2 text-xs font-semibold text-destructive-foreground shadow-sm transition-colors hover:bg-destructive/90"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
