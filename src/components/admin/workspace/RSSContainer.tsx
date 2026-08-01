import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Edit3,
  FolderTree,
  Loader2,
  Plus,
  RefreshCw,
  Save,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import {
  createRssCategory,
  createRssFeed,
  deleteRssCategory,
  deleteRssFeed,
  getRssCategories,
  getRssFeeds,
  updateRssCategory,
  updateRssFeed,
  type RemoteRssCategory,
  type RemoteRssFeed,
  type RssFeedPayload,
} from "@/lib/workspace-management-api";
import { RSSCategoryItem, RSSFormValues, RSSItem } from "./types";
import { RSSFormView } from "./RSSFormView";
import { RSSTableList } from "./RSSTableList";

const RSS_FEEDS_QUERY_KEY = ["workspace", "rss-feeds"] as const;
const RSS_CATEGORIES_QUERY_KEY = ["workspace", "rss-categories"] as const;

function faviconFromUrl(value?: string | null) {
  if (!value) return "";

  try {
    const url = new URL(value);
    return `${url.origin}/favicon.ico`;
  } catch {
    return "";
  }
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function categoryIdFromFeed(item: RemoteRssFeed) {
  return (
    item.appRssCategoryId ??
    item.masterRssCategoryId ??
    item.categoryId ??
    item.category?.id ??
    item.masterRssCategory?.id ??
    item.rssCategory?.id ??
    ""
  );
}

function categoryNameFromFeed(item: RemoteRssFeed) {
  return (
    item.category?.name?.trim() ||
    item.masterRssCategory?.name?.trim() ||
    item.rssCategory?.name?.trim() ||
    ""
  );
}

function mapRemoteCategory(item: RemoteRssCategory): RSSCategoryItem {
  const id = String(item.id);

  return {
    id,
    name: item.name?.trim() || `Category #${id}`,
    createdAt: item.createdAt ?? undefined,
    updatedAt: item.updatedAt ?? undefined,
  };
}

function mapRemoteRss(item: RemoteRssFeed, categoryById: Map<string, RSSCategoryItem>): RSSItem {
  const id = String(item.id);
  const sourceUrl = item.url?.trim() || "";
  const categoryId = String(categoryIdFromFeed(item));
  const categoryName =
    categoryNameFromFeed(item) || categoryById.get(categoryId)?.name || `Category #${categoryId}`;
  const title = item.title?.trim() || item.publisher?.trim() || `RSS #${id}`;

  return {
    id,
    name: title,
    logoUrl: faviconFromUrl(sourceUrl),
    sourceUrl,
    publisher: item.publisher?.trim() || "-",
    categoryId,
    categoryName,
    createdAt: item.createdAt ?? undefined,
    updatedAt: item.updatedAt ?? undefined,
    status: "Active",
  };
}

function toRssFeedPayload(data: RSSFormValues): RssFeedPayload {
  const appRssCategoryId = Number(data.categoryId);
  if (!Number.isFinite(appRssCategoryId) || appRssCategoryId <= 0) {
    throw new Error("Category RSS tidak valid.");
  }

  return {
    title: data.name.trim(),
    url: data.sourceUrl.trim(),
    publisher: data.publisher.trim(),
    appRssCategoryId,
  };
}

function CategoryManager({
  categories,
  isLoading,
  errorMessage,
  isMutating,
  onRetry,
  onCreate,
  onUpdate,
  onDelete,
}: {
  categories: RSSCategoryItem[];
  isLoading?: boolean;
  errorMessage?: string;
  isMutating?: boolean;
  onRetry: () => void;
  onCreate: (name: string) => void;
  onUpdate: (id: string, name: string) => void;
  onDelete: (id: string) => void;
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [draftName, setDraftName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [deletingCategory, setDeletingCategory] = useState<RSSCategoryItem | null>(null);

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleCreate = (event: React.FormEvent) => {
    event.preventDefault();
    const name = draftName.trim();
    if (!name) return;
    onCreate(name);
    setDraftName("");
  };

  const handleUpdate = (event: React.FormEvent) => {
    event.preventDefault();
    const name = editingName.trim();
    if (!editingId || !name) return;
    onUpdate(editingId, name);
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/80 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
                <FolderTree className="h-3.5 w-3.5" />
                Category
              </span>
              <span className="font-mono text-xs text-muted-foreground">Workspace / RSS</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">
              RSS Category Manager
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Kelola category untuk pengelompokan source RSS platform.
            </p>
          </div>
        </div>
      </div>

      <form
        onSubmit={handleCreate}
        className="flex flex-col gap-3 rounded-xl border border-border/60 bg-card p-4 shadow-sm md:flex-row md:items-center"
      >
        <div className="relative flex-1">
          <Plus className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={draftName}
            onChange={(event) => setDraftName(event.target.value)}
            placeholder="Nama category baru..."
            className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>
        <button
          type="submit"
          disabled={isMutating || !draftName.trim()}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm shadow-primary/20 transition-colors hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <Save className="h-4 w-4" />
          Simpan Category
        </button>
      </form>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="border-b border-border/60 p-4">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Cari category..."
              className="w-full rounded-lg border border-border bg-background py-2 pl-9 pr-4 text-sm transition-all focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
        </div>

        <div className="max-h-[520px] overflow-auto">
          <table className="w-full min-w-[620px] border-collapse text-left">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border bg-muted text-xs font-semibold text-muted-foreground">
                <th className="px-4 py-3">Nama</th>
                <th className="px-4 py-3">Updated</th>
                <th className="py-3 pl-3 pr-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <div className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Memuat category...
                    </div>
                  </td>
                </tr>
              ) : errorMessage ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center">
                    <div className="mx-auto flex max-w-md flex-col items-center gap-3 text-sm text-muted-foreground">
                      <div className="inline-flex items-center gap-2 font-semibold text-destructive">
                        <AlertCircle className="h-4 w-4" />
                        Gagal memuat category.
                      </div>
                      <p className="text-xs">{errorMessage}</p>
                      <button
                        type="button"
                        onClick={onRetry}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-semibold text-foreground transition-colors hover:bg-muted"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Coba lagi
                      </button>
                    </div>
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td colSpan={3} className="py-12 text-center text-sm text-muted-foreground">
                    Tidak ada category yang ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="border-b border-border/60 bg-card hover:bg-muted/40"
                  >
                    <td className="px-4 py-4">
                      {editingId === category.id ? (
                        <form onSubmit={handleUpdate} className="flex max-w-md items-center gap-2">
                          <input
                            value={editingName}
                            onChange={(event) => setEditingName(event.target.value)}
                            className="h-9 flex-1 rounded-lg border border-border bg-background px-3 text-sm font-medium focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
                            autoFocus
                          />
                          <button
                            type="submit"
                            disabled={isMutating || !editingName.trim()}
                            className="rounded-lg bg-primary px-3 py-2 text-xs font-semibold text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingId(null);
                              setEditingName("");
                            }}
                            className="rounded-lg border border-border px-3 py-2 text-xs font-semibold text-foreground hover:bg-muted"
                          >
                            Cancel
                          </button>
                        </form>
                      ) : (
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderTree className="h-4 w-4" />
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {category.name}
                          </span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {category.updatedAt ?? category.createdAt ?? "-"}
                    </td>
                    <td className="py-4 pl-3 pr-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setEditingId(category.id);
                            setEditingName(category.name);
                          }}
                          disabled={isMutating}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary hover:text-primary-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingCategory(category)}
                          disabled={isMutating}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-destructive/10 px-3 py-1.5 text-xs font-medium text-destructive transition-colors hover:bg-destructive hover:text-destructive-foreground disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="border-t border-border/40 bg-muted/20 px-4 py-3 text-xs text-muted-foreground">
          Menampilkan <strong>{filteredCategories.length}</strong> dari{" "}
          <strong>{categories.length}</strong> category
        </div>
      </div>

      {deletingCategory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6 shadow-2xl">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-foreground">Hapus Category</h3>
                <p className="text-xs text-muted-foreground">
                  Pastikan source terkait sudah dipindahkan.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="rounded-lg p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <p className="text-sm text-muted-foreground">
              Hapus <strong className="text-foreground">"{deletingCategory.name}"</strong>?
            </p>
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeletingCategory(null)}
                className="rounded-lg border border-border px-4 py-2 text-xs font-medium text-foreground transition-colors hover:bg-muted"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDelete(deletingCategory.id);
                  setDeletingCategory(null);
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

export function RSSContainer() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"source" | "category">("source");
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<RSSItem | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState("");

  const categoriesQuery = useQuery({
    queryKey: RSS_CATEGORIES_QUERY_KEY,
    queryFn: getRssCategories,
    staleTime: 30_000,
  });

  const feedsQuery = useQuery({
    queryKey: [...RSS_FEEDS_QUERY_KEY, { category: selectedCategoryId }] as const,
    queryFn: () => getRssFeeds({ category: selectedCategoryId || undefined }),
    staleTime: 30_000,
  });

  const categories = useMemo(
    () => (categoriesQuery.data ?? []).map(mapRemoteCategory),
    [categoriesQuery.data],
  );

  const categoryById = useMemo(
    () => new Map(categories.map((category) => [category.id, category])),
    [categories],
  );

  const items = useMemo(
    () => (feedsQuery.data ?? []).map((item) => mapRemoteRss(item, categoryById)),
    [feedsQuery.data, categoryById],
  );

  const createFeedMutation = useMutation({
    mutationFn: (data: RSSFormValues) => createRssFeed(toRssFeedPayload(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RSS_FEEDS_QUERY_KEY }),
  });

  const updateFeedMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: RSSFormValues }) =>
      updateRssFeed(id, toRssFeedPayload(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RSS_FEEDS_QUERY_KEY }),
  });

  const deleteFeedMutation = useMutation({
    mutationFn: (id: string) => deleteRssFeed(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RSS_FEEDS_QUERY_KEY }),
  });

  const createCategoryMutation = useMutation({
    mutationFn: (name: string) => createRssCategory({ name }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: RSS_CATEGORIES_QUERY_KEY }),
  });

  const updateCategoryMutation = useMutation({
    mutationFn: ({ id, name }: { id: string; name: string }) => updateRssCategory(id, { name }),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: RSS_CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: RSS_FEEDS_QUERY_KEY });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: (id: string) => deleteRssCategory(id),
    onSuccess: (_data, id) => {
      if (selectedCategoryId === id) setSelectedCategoryId("");
      void queryClient.invalidateQueries({ queryKey: RSS_CATEGORIES_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: RSS_FEEDS_QUERY_KEY });
    },
  });

  const handleSaveFeed = async (data: RSSFormValues, id?: string) => {
    try {
      if (id) {
        await updateFeedMutation.mutateAsync({ id, data });
        toast.success(`RSS source "${data.name}" berhasil diperbarui.`);
      } else {
        await createFeedMutation.mutateAsync(data);
        toast.success(`RSS source "${data.name}" berhasil dibuat.`);
      }

      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan RSS source."));
    }
  };

  const handleDeleteFeed = async (id: string) => {
    const target = items.find((item) => item.id === id) ?? editingItem;

    try {
      await deleteFeedMutation.mutateAsync(id);
      toast.success(`RSS source "${target?.name ?? id}" berhasil dihapus.`);
      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus RSS source."));
    }
  };

  const handleCreateCategory = async (name: string) => {
    try {
      await createCategoryMutation.mutateAsync(name);
      toast.success(`Category "${name}" berhasil dibuat.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal membuat RSS category."));
    }
  };

  const handleUpdateCategory = async (id: string, name: string) => {
    try {
      await updateCategoryMutation.mutateAsync({ id, name });
      toast.success(`Category "${name}" berhasil diperbarui.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memperbarui RSS category."));
    }
  };

  const handleDeleteCategory = async (id: string) => {
    const target = categories.find((category) => category.id === id);

    try {
      await deleteCategoryMutation.mutateAsync(id);
      toast.success(`Category "${target?.name ?? id}" berhasil dihapus.`);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus RSS category."));
    }
  };

  const isSavingFeed =
    createFeedMutation.isPending || updateFeedMutation.isPending || deleteFeedMutation.isPending;
  const isMutatingCategory =
    createCategoryMutation.isPending ||
    updateCategoryMutation.isPending ||
    deleteCategoryMutation.isPending;

  if (viewMode !== "list") {
    return (
      <RSSFormView
        initialItem={editingItem}
        categories={categories}
        isSaving={isSavingFeed}
        onSave={handleSaveFeed}
        onCancel={() => {
          setViewMode("list");
          setEditingItem(null);
        }}
        onDelete={handleDeleteFeed}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="inline-flex rounded-lg border border-border bg-card p-1 shadow-sm">
        {[
          { id: "source", label: "Source" },
          { id: "category", label: "Category" },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id as "source" | "category")}
            className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
              activeTab === tab.id
                ? "bg-primary text-primary-foreground shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "source" ? (
        <RSSTableList
          items={items}
          categories={categories}
          selectedCategoryId={selectedCategoryId}
          isLoading={feedsQuery.isLoading || categoriesQuery.isLoading}
          errorMessage={
            feedsQuery.isError
              ? getErrorMessage(feedsQuery.error, "Gagal memuat RSS source.")
              : categoriesQuery.isError
                ? getErrorMessage(categoriesQuery.error, "Gagal memuat RSS category.")
                : undefined
          }
          onCategoryChange={setSelectedCategoryId}
          onCreateNew={() => {
            if (categories.length === 0) {
              toast.info("Buat RSS category terlebih dahulu.");
              setActiveTab("category");
              return;
            }

            setEditingItem(null);
            setViewMode("create");
          }}
          onEdit={(item) => {
            setEditingItem(item);
            setViewMode("edit");
          }}
          onRetry={() => {
            void feedsQuery.refetch();
            void categoriesQuery.refetch();
          }}
        />
      ) : (
        <CategoryManager
          categories={categories}
          isLoading={categoriesQuery.isLoading}
          errorMessage={
            categoriesQuery.isError
              ? getErrorMessage(categoriesQuery.error, "Gagal memuat RSS category.")
              : undefined
          }
          isMutating={isMutatingCategory}
          onRetry={() => categoriesQuery.refetch()}
          onCreate={handleCreateCategory}
          onUpdate={handleUpdateCategory}
          onDelete={handleDeleteCategory}
        />
      )}
    </div>
  );
}
