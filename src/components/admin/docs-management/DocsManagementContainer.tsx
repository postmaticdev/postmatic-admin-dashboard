import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createDocumentation,
  createDocumentationCategory,
  deleteDocumentation,
  getDocumentationById,
  getDocumentationCategories,
  getDocumentations,
  updateDocumentation,
  type DocumentationCategoryPayload,
  type DocumentationPayload,
  type RemoteDocumentation,
  type RemoteDocumentationCategory,
} from "@/lib/documentation-api";
import { DocItem, DocsViewMode } from "./types";
import { DocsTableList } from "./DocsTableList";
import { DocsFormView } from "./DocsFormView";
import { toast } from "sonner";

const DOCS_QUERY_KEY = ["docs", "information", "articles"] as const;
const DOCS_CATEGORY_QUERY_KEY = ["docs", "information", "categories"] as const;

function slugify(value: string, fallback: string) {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || fallback;
}

function iconToRemote(value?: string) {
  return (value?.trim() || "FileText")
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[\s_]+/g, "-")
    .toLowerCase();
}

function formatUpdatedAt(value?: string | null) {
  if (!value) return "-";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function mapRemoteDoc(
  item: RemoteDocumentation,
  index: number,
  categoryById: Map<string, RemoteDocumentationCategory>,
): DocItem {
  const id = String(item.id);
  const category =
    item.category ??
    (item.appDocumentationCategoryId != null
      ? categoryById.get(String(item.appDocumentationCategoryId))
      : undefined);

  return {
    id,
    title: item.title?.trim() || `Dokumen #${id}`,
    slug: item.slug?.trim() || id,
    menuLabel: category?.name?.trim() || "Uncategorized",
    categoryId:
      item.appDocumentationCategoryId != null
        ? String(item.appDocumentationCategoryId)
        : category?.id != null
          ? String(category.id)
          : undefined,
    categorySlug: category?.slug?.trim() || undefined,
    description: item.description?.trim() || "",
    content: item.article ?? "",
    order: index + 1,
    status: item.isActive === false ? "Draft" : "Published",
    updatedAt: formatUpdatedAt(item.updatedAt),
    author: "Admin",
    icon: item.icon?.trim() || "FileText",
    createdAt: item.createdAt ?? undefined,
  };
}

function getCategoryIdNumber(category: RemoteDocumentationCategory) {
  const categoryId = Number(category.id);

  if (!Number.isFinite(categoryId)) {
    throw new Error("ID kategori dokumentasi tidak valid.");
  }

  return categoryId;
}

export function DocsManagementContainer() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<DocsViewMode>("list");
  const [editingDoc, setEditingDoc] = useState<DocItem | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [orderedIds, setOrderedIds] = useState<string[]>([]);

  const docsQuery = useQuery({
    queryKey: DOCS_QUERY_KEY,
    queryFn: () => getDocumentations("information"),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const categoriesQuery = useQuery({
    queryKey: DOCS_CATEGORY_QUERY_KEY,
    queryFn: () => getDocumentationCategories("information"),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data]);

  const categoryById = useMemo(
    () =>
      new Map(
        categories
          .filter((category) => category.id != null)
          .map((category) => [String(category.id), category]),
      ),
    [categories],
  );

  const docs = useMemo(() => {
    const mappedDocs = (docsQuery.data ?? []).map((item, index) =>
      mapRemoteDoc(item, index, categoryById),
    );

    if (orderedIds.length === 0) return mappedDocs;

    const positionById = new Map(orderedIds.map((id, index) => [id, index]));

    return [...mappedDocs].sort((left, right) => {
      const leftPosition = positionById.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightPosition = positionById.get(right.id) ?? Number.MAX_SAFE_INTEGER;

      if (leftPosition !== rightPosition) return leftPosition - rightPosition;
      return left.order - right.order;
    });
  }, [categoryById, docsQuery.data, orderedIds]);

  const existingMenuLabels = useMemo(() => {
    const labels = categories
      .map((category) => category.name?.trim())
      .filter((name): name is string => Boolean(name));

    return labels.length > 0 ? labels : ["Getting Started"];
  }, [categories]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<DocItem, "id" | "order" | "updatedAt">) =>
      createDocumentationFromForm(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DOCS_CATEGORY_QUERY_KEY });
      setOrderedIds([]);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<DocItem, "id" | "order" | "updatedAt"> }) =>
      updateDocumentationFromForm(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: DOCS_CATEGORY_QUERY_KEY });
      setOrderedIds([]);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocumentation("information", id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEY });
      setOrderedIds([]);
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload: DocumentationCategoryPayload) =>
      createDocumentationCategory("information", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: DOCS_CATEGORY_QUERY_KEY });
    },
  });

  async function ensureCategory(menuLabel: string) {
    const categoryName = menuLabel.trim() || "Getting Started";
    const categorySlug = slugify(categoryName, "documentation-category");
    const matchedCategory = categories.find((category) => {
      const name = category.name?.trim().toLowerCase();
      const slug = category.slug?.trim().toLowerCase();

      return name === categoryName.toLowerCase() || slug === categorySlug;
    });

    if (matchedCategory) return matchedCategory;

    return createCategoryMutation.mutateAsync({
      slug: categorySlug,
      name: categoryName,
      isActive: true,
    });
  }

  async function toDocumentationPayload(data: Omit<DocItem, "id" | "order" | "updatedAt">) {
    const existingCategoryId = Number(data.categoryId);
    const categoryId = Number.isFinite(existingCategoryId)
      ? existingCategoryId
      : getCategoryIdNumber(await ensureCategory(data.menuLabel));

    return {
      slug: slugify(data.slug || data.title, "untitled-doc"),
      title: data.title.trim(),
      description: data.description?.trim() || "",
      icon: iconToRemote(data.icon),
      article: data.content || "",
      appDocumentationCategoryId: categoryId,
      isActive: data.status === "Published",
    } satisfies DocumentationPayload;
  }

  async function createDocumentationFromForm(data: Omit<DocItem, "id" | "order" | "updatedAt">) {
    const payload = await toDocumentationPayload(data);
    return createDocumentation("information", payload);
  }

  async function updateDocumentationFromForm(
    id: string,
    data: Omit<DocItem, "id" | "order" | "updatedAt">,
  ) {
    const payload = await toDocumentationPayload(data);
    return updateDocumentation("information", id, payload);
  }

  const handleReorder = (newDocs: DocItem[]) => {
    setOrderedIds(newDocs.map((doc) => doc.id));
    toast.info(
      "Urutan docs disesuaikan di tampilan ini. Endpoint reorder belum tersedia di collection.",
    );
  };

  const handleCreateNew = () => {
    setEditingDoc(null);
    setViewMode("create");
  };

  const handleEdit = async (doc: DocItem) => {
    setLoadingDetailId(doc.id);

    try {
      const detail = await getDocumentationById("information", doc.id);
      setEditingDoc(mapRemoteDoc(detail, doc.order - 1, categoryById));
      setViewMode("edit");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat detail dokumen."));
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleSave = async (docData: Omit<DocItem, "id" | "order" | "updatedAt">, id?: string) => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data: docData });
        toast.success(`Dokumen "${docData.title}" berhasil diperbarui!`);
      } else {
        await createMutation.mutateAsync(docData);
        toast.success(`Dokumen baru "${docData.title}" berhasil disimpan!`);
      }

      setViewMode("list");
      setEditingDoc(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan dokumen."));
    }
  };

  const handleDelete = async (id: string) => {
    const target = docs.find((doc) => doc.id === id) ?? editingDoc;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Dokumen "${target?.title || id}" berhasil dihapus dari sistem!`);
      setViewMode("list");
      setEditingDoc(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus dokumen."));
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = docs.find((item) => item.id === id);
    if (!target) return;

    const newStatus = target.status === "Published" ? "Draft" : "Published";
    setTogglingStatusId(id);

    try {
      await updateDocumentationFromForm(id, {
        ...target,
        status: newStatus,
      });
      await queryClient.invalidateQueries({ queryKey: DOCS_QUERY_KEY });
      toast.success(`Status dokumen "${target.title}" berhasil diubah menjadi ${newStatus}!`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Gagal mengubah status dokumen "${target.title}".`));
    } finally {
      setTogglingStatusId(null);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <DocsTableList
          docs={docs}
          isLoading={docsQuery.isLoading || categoriesQuery.isLoading}
          errorMessage={
            docsQuery.isError
              ? getErrorMessage(docsQuery.error, "Gagal memuat dokumentasi.")
              : categoriesQuery.isError
                ? getErrorMessage(categoriesQuery.error, "Gagal memuat kategori dokumentasi.")
                : undefined
          }
          loadingDetailId={loadingDetailId}
          togglingStatusId={togglingStatusId}
          onReorder={handleReorder}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onRetry={() => {
            void docsQuery.refetch();
            void categoriesQuery.refetch();
          }}
        />
      ) : (
        <DocsFormView
          initialDoc={editingDoc}
          existingMenuLabels={existingMenuLabels}
          onSave={handleSave}
          onCancel={() => {
            setViewMode("list");
            setEditingDoc(null);
          }}
          onDelete={handleDelete}
          isSaving={isSaving}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
