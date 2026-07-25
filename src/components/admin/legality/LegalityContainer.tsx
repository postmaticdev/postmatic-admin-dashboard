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
import { LegalityItem, LegalityViewMode } from "./types";
import { LegalityTableList } from "./LegalityTableList";
import { LegalityFormView } from "./LegalityFormView";
import { toast } from "sonner";

const LEGALITY_QUERY_KEY = ["docs", "legality", "articles"] as const;
const LEGALITY_CATEGORY_QUERY_KEY = ["docs", "legality", "categories"] as const;

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
  return (value?.trim() || "ShieldCheck")
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

function buildLegalityLink(categorySlug?: string, articleSlug?: string) {
  const category = categorySlug?.trim() || "legality";
  const article = articleSlug?.trim() || "";

  return article ? `https://docs.postmatic.id/${category}/${article}` : "https://docs.postmatic.id";
}

function mapRemoteLegality(
  item: RemoteDocumentation,
  index: number,
  categoryById: Map<string, RemoteDocumentationCategory>,
): LegalityItem {
  const id = String(item.id);
  const category =
    item.category ??
    (item.appDocumentationCategoryId != null
      ? categoryById.get(String(item.appDocumentationCategoryId))
      : undefined);
  const slug = item.slug?.trim() || id;
  const categorySlug = category?.slug?.trim() || undefined;

  return {
    id,
    title: item.title?.trim() || `Dokumen Legal #${id}`,
    slug,
    menuLabel: category?.name?.trim() || "Legality",
    categoryId:
      item.appDocumentationCategoryId != null
        ? String(item.appDocumentationCategoryId)
        : category?.id != null
          ? String(category.id)
          : undefined,
    categorySlug,
    description: item.description?.trim() || "",
    icon: item.icon?.trim() || "ShieldCheck",
    content: item.article ?? "",
    order: index + 1,
    status: item.isActive === false ? "Draft" : "Published",
    updatedAt: formatUpdatedAt(item.updatedAt),
    author: "Legal Team",
    link: buildLegalityLink(categorySlug, slug),
    createdAt: item.createdAt ?? undefined,
  };
}

function getCategoryIdNumber(category: RemoteDocumentationCategory) {
  const categoryId = Number(category.id);

  if (!Number.isFinite(categoryId)) {
    throw new Error("ID kategori legality tidak valid.");
  }

  return categoryId;
}

export function LegalityContainer() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<LegalityViewMode>("list");
  const [editingItem, setEditingItem] = useState<LegalityItem | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  const legalityQuery = useQuery({
    queryKey: LEGALITY_QUERY_KEY,
    queryFn: () => getDocumentations("legality"),
    staleTime: 0,
    refetchOnMount: "always",
  });

  const categoriesQuery = useQuery({
    queryKey: LEGALITY_CATEGORY_QUERY_KEY,
    queryFn: () => getDocumentationCategories("legality"),
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

  const items = useMemo(
    () =>
      (legalityQuery.data ?? []).map((item, index) => mapRemoteLegality(item, index, categoryById)),
    [categoryById, legalityQuery.data],
  );

  const existingMenuLabels = useMemo(() => {
    const labels = categories
      .map((category) => category.name?.trim())
      .filter((name): name is string => Boolean(name));

    return labels.length > 0 ? labels : ["Terms & Conditions"];
  }, [categories]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<LegalityItem, "id" | "order" | "updatedAt">) =>
      createLegalityFromForm(data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEGALITY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: LEGALITY_CATEGORY_QUERY_KEY });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: Omit<LegalityItem, "id" | "order" | "updatedAt">;
    }) => updateLegalityFromForm(id, data),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEGALITY_QUERY_KEY });
      void queryClient.invalidateQueries({ queryKey: LEGALITY_CATEGORY_QUERY_KEY });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteDocumentation("legality", id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEGALITY_QUERY_KEY });
    },
  });

  const createCategoryMutation = useMutation({
    mutationFn: (payload: DocumentationCategoryPayload) =>
      createDocumentationCategory("legality", payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LEGALITY_CATEGORY_QUERY_KEY });
    },
  });

  async function ensureCategory(menuLabel: string) {
    const categoryName = menuLabel.trim() || "Terms & Conditions";
    const categorySlug = slugify(categoryName, "legality-category");
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

  async function toDocumentationPayload(data: Omit<LegalityItem, "id" | "order" | "updatedAt">) {
    const existingCategoryId = Number(data.categoryId);
    const categoryId = Number.isFinite(existingCategoryId)
      ? existingCategoryId
      : getCategoryIdNumber(await ensureCategory(data.menuLabel));

    return {
      slug: slugify(data.slug || data.title, "legal-document"),
      title: data.title.trim(),
      description: data.description?.trim() || "",
      icon: iconToRemote(data.icon),
      article: data.content || "",
      appDocumentationCategoryId: categoryId,
      isActive: data.status === "Published",
    } satisfies DocumentationPayload;
  }

  async function createLegalityFromForm(data: Omit<LegalityItem, "id" | "order" | "updatedAt">) {
    const payload = await toDocumentationPayload(data);
    return createDocumentation("legality", payload);
  }

  async function updateLegalityFromForm(
    id: string,
    data: Omit<LegalityItem, "id" | "order" | "updatedAt">,
  ) {
    const payload = await toDocumentationPayload(data);
    return updateDocumentation("legality", id, payload);
  }

  const handleCreateNew = () => {
    setEditingItem(null);
    setViewMode("create");
  };

  const handleEdit = async (item: LegalityItem) => {
    setLoadingDetailId(item.id);

    try {
      const detail = await getDocumentationById("legality", item.id);
      setEditingItem(mapRemoteLegality(detail, item.order - 1, categoryById));
      setViewMode("edit");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat detail dokumen legal."));
    } finally {
      setLoadingDetailId(null);
    }
  };

  const handleSave = async (
    data: Omit<LegalityItem, "id" | "order" | "updatedAt">,
    id?: string,
  ) => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(`Dokumen "${data.title}" berhasil diperbarui!`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Dokumen baru "${data.title}" berhasil disimpan!`);
      }

      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan dokumen legal."));
    }
  };

  const handleDelete = async (id: string) => {
    const target = items.find((item) => item.id === id) ?? editingItem;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Dokumen "${target?.title || id}" berhasil dihapus!`);
      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus dokumen legal."));
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const newStatus = target.status === "Published" ? "Draft" : "Published";
    setTogglingStatusId(id);

    try {
      await updateLegalityFromForm(id, {
        ...target,
        status: newStatus,
      });
      await queryClient.invalidateQueries({ queryKey: LEGALITY_QUERY_KEY });
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
        <LegalityTableList
          items={items}
          isLoading={legalityQuery.isLoading || categoriesQuery.isLoading}
          errorMessage={
            legalityQuery.isError
              ? getErrorMessage(legalityQuery.error, "Gagal memuat dokumen legal.")
              : categoriesQuery.isError
                ? getErrorMessage(categoriesQuery.error, "Gagal memuat kategori legal.")
                : undefined
          }
          loadingDetailId={loadingDetailId}
          togglingStatusId={togglingStatusId}
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onRetry={() => {
            void legalityQuery.refetch();
            void categoriesQuery.refetch();
          }}
        />
      ) : (
        <LegalityFormView
          initialItem={editingItem}
          existingMenuLabels={existingMenuLabels}
          onSave={handleSave}
          onCancel={() => {
            setViewMode("list");
            setEditingItem(null);
          }}
          onDelete={handleDelete}
          isSaving={isSaving}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
