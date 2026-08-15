import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Ban,
  CheckCircle2,
  ChevronDown,
  Edit2,
  FileImage,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  createCreatorImageCategory,
  createCreatorLibraryImage,
  deleteCreatorImageCategory,
  deleteCreatorLibraryImage,
  getCreatorImageCategories,
  getCreatorLibrary,
  moderateCreatorLibraryImage,
  updateCreatorImageCategory,
  updateCreatorLibraryImage,
  type CreatorImageCategoryKind,
  type CreatorLibraryPayload,
  type RemoteCreatorImageCategory,
  type RemoteCreatorLibraryImage,
} from "@/lib/creator-library-api";
import { uploadCustomerServiceAttachment } from "@/lib/customer-service-api";
import { cn } from "@/lib/utils";

const LIBRARY_QUERY_KEY = ["creator", "library"] as const;
const TYPE_CATEGORY_QUERY_KEY = ["creator", "library", "categories", "type"] as const;
const PRODUCT_CATEGORY_QUERY_KEY = ["creator", "library", "categories", "product"] as const;

interface LibraryFormState {
  id?: string;
  idCandidates?: string[];
  name: string;
  imageUrl: string;
  price: string;
  isPublished: boolean;
  typeCategoryIds: string[];
  productCategoryIds: string[];
  typeCategoryLabels: Record<string, string>;
  productCategoryLabels: Record<string, string>;
  isBanned: boolean;
  bannedReason: string;
}

const emptyForm: LibraryFormState = {
  name: "",
  imageUrl: "",
  price: "0",
  isPublished: true,
  typeCategoryIds: [],
  productCategoryIds: [],
  typeCategoryLabels: {},
  productCategoryLabels: {},
  isBanned: false,
  bannedReason: "",
};

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function categoryIdsFrom(
  directIds?: Array<number | string> | null,
  categories?: RemoteCreatorImageCategory[] | null,
) {
  const ids = directIds?.length ? directIds : categories?.map((category) => category.id);
  return (ids ?? []).filter((id) => id != null).map(String);
}

function categoryLabelMapFrom(ids: string[], categories?: RemoteCreatorImageCategory[] | null) {
  const labels: Record<string, string> = {};

  ids.forEach((id, index) => {
    const matchingCategory = categories?.find((category) => String(category.id) === id);
    const fallbackCategory = categories?.[index];
    const label = matchingCategory?.name ?? fallbackCategory?.name;

    if (label) labels[id] = label;
  });

  categories?.forEach((category) => {
    if (category.id != null && category.name) labels[String(category.id)] = category.name;
  });

  return labels;
}

function uniqueIds(ids: Array<number | string | null | undefined>) {
  const unique = new Set<string>();

  ids.forEach((id) => {
    if (id != null && String(id).trim()) unique.add(String(id));
  });

  return Array.from(unique);
}

function creatorLibraryImageIdCandidates(image: RemoteCreatorLibraryImage) {
  return uniqueIds([
    image.creatorImageId,
    image.creator_image_id,
    image.creatorLibraryImageId,
    image.creator_library_image_id,
    image.libraryImageId,
    image.library_image_id,
    image.creatorImage?.id,
    image.libraryImage?.id,
    image.image?.id,
    image.id,
  ]);
}

function creatorLibraryImageUrl(image: RemoteCreatorLibraryImage) {
  return (
    image.imageUrl ??
    image.creatorImage?.imageUrl ??
    image.libraryImage?.imageUrl ??
    image.image?.imageUrl ??
    image.image?.url ??
    ""
  );
}

function formFromImage(image: RemoteCreatorLibraryImage): LibraryFormState {
  const idCandidates = creatorLibraryImageIdCandidates(image);
  const typeCategoryIds = categoryIdsFrom(image.typeCategoryIds, image.typeCategories);
  const productCategoryIds = categoryIdsFrom(image.productCategoryIds, image.productCategories);

  return {
    id: idCandidates[0] ?? String(image.id),
    idCandidates,
    name: image.name ?? image.creatorImage?.name ?? image.libraryImage?.name ?? "",
    imageUrl: creatorLibraryImageUrl(image),
    price: String(image.price ?? 0),
    isPublished: image.isPublished !== false,
    typeCategoryIds,
    productCategoryIds,
    typeCategoryLabels: categoryLabelMapFrom(typeCategoryIds, image.typeCategories),
    productCategoryLabels: categoryLabelMapFrom(productCategoryIds, image.productCategories),
    isBanned: image.isBanned === true,
    bannedReason: image.bannedReason ?? "",
  };
}

function toCategoryIdPayload(ids: string[], label: string) {
  return ids.map((id) => {
    const value = Number(id);

    if (!Number.isSafeInteger(value) || value < 1) {
      throw new Error(`${label} punya category id tidak valid: ${id}. Pilih ulang kategorinya.`);
    }

    return value;
  });
}

function toPayload(form: LibraryFormState): CreatorLibraryPayload {
  return {
    name: form.name.trim(),
    imageUrl: form.imageUrl.trim(),
    isPublished: form.isPublished,
    price: Number(form.price || 0),
    productCategoryIds: toCategoryIdPayload(form.productCategoryIds, "Product Category"),
    typeCategoryIds: toCategoryIdPayload(form.typeCategoryIds, "Type Category"),
  };
}

function isNotFoundError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  return message.toLowerCase().includes("not_found") || message.toLowerCase().includes("not found");
}

async function withCreatorImageIdFallback<T>(ids: string[], operation: (id: string) => Promise<T>) {
  let lastError: unknown;

  for (const id of ids) {
    try {
      return { id, data: await operation(id) };
    } catch (error) {
      lastError = error;
      if (!isNotFoundError(error)) throw error;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("CREATOR_LIBRARY_IMAGE_NOT_FOUND");
}

function updateCreatorLibraryImageWithFallback(ids: string[], payload: CreatorLibraryPayload) {
  return withCreatorImageIdFallback(ids, (id) => updateCreatorLibraryImage(id, payload));
}

function moderateCreatorLibraryImageWithFallback(
  ids: string[],
  payload: Parameters<typeof moderateCreatorLibraryImage>[1],
) {
  return withCreatorImageIdFallback(ids, (id) => moderateCreatorLibraryImage(id, payload));
}

async function deleteCreatorLibraryImageWithFallback(ids: string[]) {
  await withCreatorImageIdFallback(ids, deleteCreatorLibraryImage);
}

function formatDate(value?: string | null) {
  if (!value) return "-";

  try {
    return new Intl.DateTimeFormat("id-ID", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function formatCurrency(value?: string | number | null) {
  const amount = Number(value ?? 0);

  if (!Number.isFinite(amount)) return "Rp 0";

  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function categoryNames(
  ids: string[],
  fallback?: RemoteCreatorImageCategory[] | null,
  lookup?: Map<string, RemoteCreatorImageCategory>,
) {
  const names = ids
    .map((id) => lookup?.get(id)?.name)
    .filter((name): name is string => Boolean(name));

  if (names.length) return names;
  return (fallback ?? [])
    .map((category) => category.name)
    .filter((name): name is string => Boolean(name));
}

function creatorName(image: RemoteCreatorLibraryImage) {
  return (
    image.createdBy?.name ??
    image.creatorName ??
    image.profileName ??
    image.adminName ??
    "Postmatic Admin"
  );
}

function creatorAvatar(image: RemoteCreatorLibraryImage) {
  return image.createdBy?.imageUrl ?? image.createdBy?.image ?? null;
}

function CategoryManager({
  title,
  kind,
  categories,
  isLoading,
  isMutating,
  onCreate,
  onUpdate,
  onDelete,
}: {
  title: string;
  kind: CreatorImageCategoryKind;
  categories: RemoteCreatorImageCategory[];
  isLoading: boolean;
  isMutating: boolean;
  onCreate: (kind: CreatorImageCategoryKind, name: string) => void;
  onUpdate: (kind: CreatorImageCategoryKind, id: string, name: string) => void;
  onDelete: (kind: CreatorImageCategoryKind, id: string) => void;
}) {
  const [newName, setNewName] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");

  const submitNew = () => {
    if (!newName.trim()) return;
    onCreate(kind, newName.trim());
    setNewName("");
  };

  const submitEdit = () => {
    if (!editingId || !editingName.trim()) return;
    onUpdate(kind, editingId, editingName.trim());
    setEditingId(null);
    setEditingName("");
  };

  return (
    <div className="rounded-lg border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-bold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{categories.length} kategori</p>
        </div>
        {isLoading && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
      </div>

      <div className="mt-4 flex gap-2">
        <Input
          value={newName}
          onChange={(event) => setNewName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") submitNew();
          }}
          placeholder="Nama kategori"
          className="h-8 text-xs"
        />
        <Button
          type="button"
          size="sm"
          onClick={submitNew}
          disabled={isMutating || !newName.trim()}
        >
          <Plus className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="mt-3 max-h-44 space-y-2 overflow-auto pr-1">
        {categories.length === 0 && !isLoading ? (
          <p className="rounded-md border border-dashed border-border p-3 text-xs text-muted-foreground">
            Belum ada kategori.
          </p>
        ) : (
          categories.map((category) => {
            const id = String(category.id);
            const isEditing = editingId === id;

            return (
              <div
                key={id}
                className="flex items-center gap-2 rounded-md border border-border bg-muted/20 px-2 py-1.5"
              >
                {isEditing ? (
                  <Input
                    value={editingName}
                    onChange={(event) => setEditingName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") submitEdit();
                      if (event.key === "Escape") setEditingId(null);
                    }}
                    className="h-7 text-xs"
                    autoFocus
                  />
                ) : (
                  <span className="min-w-0 flex-1 truncate text-xs font-semibold text-foreground">
                    {category.name ?? "-"}
                  </span>
                )}

                {isEditing ? (
                  <Button type="button" size="sm" onClick={submitEdit} disabled={isMutating}>
                    Save
                  </Button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(id);
                      setEditingName(category.name ?? "");
                    }}
                    className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => onDelete(kind, id)}
                  disabled={isMutating}
                  className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:pointer-events-none disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function CategorySelector({
  label,
  categories,
  selectedIds,
  selectedLabelsById = {},
  onChange,
}: {
  label: string;
  categories: RemoteCreatorImageCategory[];
  selectedIds: string[];
  selectedLabelsById?: Record<string, string>;
  onChange: (ids: string[]) => void;
}) {
  const availableIds = new Set(categories.map((category) => String(category.id)));
  const legacyCategories = selectedIds
    .filter((selectedId) => !availableIds.has(selectedId))
    .map((selectedId) => ({
      id: selectedId,
      name: selectedLabelsById[selectedId] ?? selectedId,
    }));
  const categoryOptions = [
    ...legacyCategories,
    ...categories.map((category) => ({
      id: String(category.id),
      name: category.name ?? String(category.id),
    })),
  ];
  const selectedLabels = selectedIds.map((selectedId) => {
    const category = categories.find((item) => String(item.id) === selectedId);
    return category?.name ?? selectedLabelsById[selectedId] ?? selectedId;
  });
  const triggerLabel =
    selectedLabels.length === 0
      ? "Pilih kategori"
      : selectedLabels.length <= 2
        ? selectedLabels.join(", ")
        : `${selectedLabels.slice(0, 2).join(", ")} +${selectedLabels.length - 2}`;

  const toggle = (id: string) => {
    onChange(
      selectedIds.includes(id)
        ? selectedIds.filter((selectedId) => selectedId !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <div className="space-y-2">
      <span className="text-xs font-bold text-foreground">{label}</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={categoryOptions.length === 0}
            className="flex h-10 w-full items-center justify-between gap-3 rounded-md border border-border bg-background px-3 text-left text-sm font-medium text-foreground shadow-sm transition-colors hover:bg-muted/40 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span
              className={cn(
                "min-w-0 flex-1 truncate",
                selectedLabels.length === 0 && "text-muted-foreground",
              )}
            >
              {categoryOptions.length === 0 ? "Kategori belum tersedia" : triggerLabel}
            </span>
            <span className="flex shrink-0 items-center gap-2">
              {selectedLabels.length > 0 && (
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                  {selectedLabels.length}
                </span>
              )}
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="start"
          className="max-h-64 w-[var(--radix-dropdown-menu-trigger-width)]"
        >
          <DropdownMenuLabel className="text-xs">{label}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categoryOptions.map((category) => {
            const selected = selectedIds.includes(category.id);

            return (
              <DropdownMenuCheckboxItem
                key={category.id}
                checked={selected}
                onCheckedChange={() => toggle(category.id)}
                onSelect={(event) => event.preventDefault()}
                className="text-xs"
              >
                <span className="truncate">{category.name}</span>
              </DropdownMenuCheckboxItem>
            );
          })}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export function GalleryContainer() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [search, setSearch] = useState("");
  const [form, setForm] = useState<LibraryFormState>(emptyForm);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const libraryQuery = useQuery({
    queryKey: [...LIBRARY_QUERY_KEY, search],
    queryFn: () => getCreatorLibrary({ search, limit: 80 }),
    staleTime: 30_000,
  });

  const typeCategoriesQuery = useQuery({
    queryKey: TYPE_CATEGORY_QUERY_KEY,
    queryFn: () => getCreatorImageCategories("type"),
    staleTime: 60_000,
  });

  const productCategoriesQuery = useQuery({
    queryKey: PRODUCT_CATEGORY_QUERY_KEY,
    queryFn: () => getCreatorImageCategories("product"),
    staleTime: 60_000,
  });

  const typeCategories = useMemo(() => typeCategoriesQuery.data ?? [], [typeCategoriesQuery.data]);
  const productCategories = useMemo(
    () => productCategoriesQuery.data ?? [],
    [productCategoriesQuery.data],
  );

  const typeLookup = useMemo(
    () => new Map(typeCategories.map((category) => [String(category.id), category])),
    [typeCategories],
  );
  const productLookup = useMemo(
    () => new Map(productCategories.map((category) => [String(category.id), category])),
    [productCategories],
  );

  const invalidateCategories = (kind?: CreatorImageCategoryKind) => {
    if (!kind || kind === "type") {
      void queryClient.invalidateQueries({ queryKey: TYPE_CATEGORY_QUERY_KEY });
    }
    if (!kind || kind === "product") {
      void queryClient.invalidateQueries({ queryKey: PRODUCT_CATEGORY_QUERY_KEY });
    }
    void queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
  };

  const categoryMutation = useMutation({
    mutationFn: async (
      input:
        | { action: "create"; kind: CreatorImageCategoryKind; name: string }
        | { action: "update"; kind: CreatorImageCategoryKind; id: string; name: string }
        | { action: "delete"; kind: CreatorImageCategoryKind; id: string },
    ) => {
      if (input.action === "create") {
        return createCreatorImageCategory(input.kind, input.name);
      }

      if (input.action === "update") {
        return updateCreatorImageCategory(input.kind, input.id, input.name);
      }

      await deleteCreatorImageCategory(input.kind, input.id);
      return null;
    },
    onSuccess: (_data, variables) => {
      invalidateCategories(variables.kind);
      toast.success("Kategori berhasil disimpan.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menyimpan kategori."));
    },
  });

  const saveLibraryMutation = useMutation({
    mutationFn: async (nextForm: LibraryFormState) => {
      const payload = toPayload(nextForm);

      if (nextForm.id) {
        const idCandidates = nextForm.idCandidates?.length ? nextForm.idCandidates : [nextForm.id];
        const { id: updatedId, data: updated } = await updateCreatorLibraryImageWithFallback(
          idCandidates,
          payload,
        );

        if (nextForm.isBanned !== Boolean(updated?.isBanned)) {
          await moderateCreatorLibraryImageWithFallback(uniqueIds([updatedId, ...idCandidates]), {
            isBanned: nextForm.isBanned,
            bannedReason: nextForm.isBanned ? nextForm.bannedReason.trim() : undefined,
          });
        }

        return updated;
      }

      const created = await createCreatorLibraryImage(payload);

      if (nextForm.isBanned) {
        await moderateCreatorLibraryImageWithFallback(creatorLibraryImageIdCandidates(created), {
          isBanned: true,
          bannedReason: nextForm.bannedReason.trim(),
        });
      }

      return created;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      setIsDialogOpen(false);
      setForm(emptyForm);
      toast.success("Creator image berhasil disimpan.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menyimpan creator image."));
    },
  });

  const deleteLibraryMutation = useMutation({
    mutationFn: deleteCreatorLibraryImageWithFallback,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: LIBRARY_QUERY_KEY });
      toast.success("Creator image berhasil dihapus.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menghapus creator image."));
    },
  });

  const openCreate = () => {
    setForm(emptyForm);
    setIsDialogOpen(true);
  };

  const openEdit = (image: RemoteCreatorLibraryImage) => {
    setForm(formFromImage(image));
    setIsDialogOpen(true);
  };

  const refreshAll = () => {
    void libraryQuery.refetch();
    void typeCategoriesQuery.refetch();
    void productCategoriesQuery.refetch();
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);

    try {
      const attachment = await uploadCustomerServiceAttachment(file);
      setForm((current) => ({
        ...current,
        imageUrl: attachment.url,
        name: current.name || file.name.replace(/\.[^.]+$/, ""),
      }));
      toast.success("Gambar berhasil diunggah.");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal mengunggah gambar."));
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleSave = () => {
    let payload: CreatorLibraryPayload;

    try {
      payload = toPayload(form);
    } catch (error) {
      toast.error(getErrorMessage(error, "Category tidak valid."));
      return;
    }

    if (!payload.name || !payload.imageUrl || !Number.isFinite(payload.price)) {
      toast.error("Nama, URL gambar, dan harga wajib valid.");
      return;
    }

    if (payload.typeCategoryIds.length === 0) {
      toast.error("Pilih minimal satu Type Category.");
      return;
    }

    if (payload.productCategoryIds.length === 0) {
      toast.error("Pilih minimal satu Product Category.");
      return;
    }

    saveLibraryMutation.mutate(form);
  };

  const images = libraryQuery.data ?? [];
  const publishedCount = images.filter((image) => image.isPublished !== false).length;
  const bannedCount = images.filter((image) => image.isBanned === true).length;
  const isLoading =
    libraryQuery.isLoading || typeCategoriesQuery.isLoading || productCategoriesQuery.isLoading;

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                <FileImage className="h-3.5 w-3.5" />
                Creator
              </span>
              <span className="font-mono text-xs text-muted-foreground">Creator / Library</span>
            </div>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-foreground">
              Creator Library
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Kelola asset creator image, kategori type/product, harga, publish status, dan
              moderasi.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={refreshAll} disabled={isLoading}>
              <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
              Refresh
            </Button>
            <Button type="button" onClick={openCreate}>
              <Plus className="h-4 w-4" />
              Upload Image
            </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Total Images</p>
          <p className="mt-2 text-2xl font-extrabold text-foreground">{images.length}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Published</p>
          <p className="mt-2 text-2xl font-extrabold text-emerald-600">{publishedCount}</p>
        </div>
        <div className="rounded-lg border border-border bg-card p-4">
          <p className="text-xs font-semibold text-muted-foreground">Banned</p>
          <p className="mt-2 text-2xl font-extrabold text-destructive">{bannedCount}</p>
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <CategoryManager
          title="Type Category"
          kind="type"
          categories={typeCategories}
          isLoading={typeCategoriesQuery.isLoading}
          isMutating={categoryMutation.isPending}
          onCreate={(kind, name) => categoryMutation.mutate({ action: "create", kind, name })}
          onUpdate={(kind, id, name) =>
            categoryMutation.mutate({ action: "update", kind, id, name })
          }
          onDelete={(kind, id) => {
            if (window.confirm("Hapus kategori type ini?")) {
              categoryMutation.mutate({ action: "delete", kind, id });
            }
          }}
        />
        <CategoryManager
          title="Product Category"
          kind="product"
          categories={productCategories}
          isLoading={productCategoriesQuery.isLoading}
          isMutating={categoryMutation.isPending}
          onCreate={(kind, name) => categoryMutation.mutate({ action: "create", kind, name })}
          onUpdate={(kind, id, name) =>
            categoryMutation.mutate({ action: "update", kind, id, name })
          }
          onDelete={(kind, id) => {
            if (window.confirm("Hapus kategori product ini?")) {
              categoryMutation.mutate({ action: "delete", kind, id });
            }
          }}
        />
      </div>

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <div className="flex flex-col gap-3 border-b border-border p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari nama image atau creator..."
              className="pl-9"
            />
          </div>
          <span className="text-xs font-semibold text-muted-foreground">
            {images.length} item library
          </span>
        </div>

        {libraryQuery.isError ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center">
            <AlertCircle className="h-8 w-8 text-destructive" />
            <p className="text-sm font-semibold text-foreground">Gagal memuat creator library.</p>
            <p className="text-xs text-muted-foreground">
              {getErrorMessage(libraryQuery.error, "Unknown error")}
            </p>
          </div>
        ) : libraryQuery.isLoading ? (
          <div className="flex items-center justify-center gap-2 p-12 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat creator library...
          </div>
        ) : images.length === 0 ? (
          <div className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground">
            <FileImage className="h-10 w-10 opacity-40" />
            <p className="text-sm font-medium">Belum ada image di creator library.</p>
          </div>
        ) : (
          <div className="grid gap-4 p-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
            {images.map((image) => {
              const idCandidates = creatorLibraryImageIdCandidates(image);
              const id = idCandidates[0] ?? String(image.id);
              const displayImageUrl = creatorLibraryImageUrl(image);
              const typeIds = categoryIdsFrom(image.typeCategoryIds, image.typeCategories);
              const productIds = categoryIdsFrom(image.productCategoryIds, image.productCategories);
              const typeNames = categoryNames(typeIds, image.typeCategories, typeLookup);
              const productNames = categoryNames(
                productIds,
                image.productCategories,
                productLookup,
              );

              return (
                <div
                  key={id}
                  className="overflow-hidden rounded-lg border border-border bg-background"
                >
                  <div className="relative aspect-[4/3] bg-muted">
                    {displayImageUrl ? (
                      <img
                        src={displayImageUrl}
                        alt={image.name ?? "Creator image"}
                        className="h-full w-full object-cover"
                        loading="lazy"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-muted-foreground">
                        <FileImage className="h-8 w-8" />
                      </div>
                    )}
                    <div className="absolute left-2 top-2 flex flex-wrap gap-1.5">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-bold",
                          image.isPublished === false
                            ? "bg-muted text-muted-foreground"
                            : "bg-emerald-500/90 text-white",
                        )}
                      >
                        <CheckCircle2 className="h-3 w-3" />
                        {image.isPublished === false ? "Draft" : "Published"}
                      </span>
                      {image.isBanned && (
                        <span className="inline-flex items-center gap-1 rounded-md bg-destructive px-2 py-1 text-[10px] font-bold text-destructive-foreground">
                          <Ban className="h-3 w-3" />
                          Banned
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <h2 className="truncate text-sm font-bold text-foreground">
                          {image.name ?? "-"}
                        </h2>
                        <p className="truncate text-xs text-muted-foreground">
                          {creatorName(image)}
                        </p>
                      </div>
                      {creatorAvatar(image) && (
                        <img
                          src={creatorAvatar(image) ?? ""}
                          alt={creatorName(image)}
                          className="h-8 w-8 rounded-full border border-border object-cover"
                        />
                      )}
                    </div>

                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-muted-foreground">Price</span>
                      <span className="font-bold text-foreground">
                        {formatCurrency(image.price)}
                      </span>
                    </div>

                    <div className="flex min-h-11 flex-wrap gap-1.5">
                      {[...typeNames, ...productNames].slice(0, 5).map((name) => (
                        <span
                          key={name}
                          className="rounded-md border border-border bg-muted/40 px-2 py-0.5 text-[10px] font-semibold text-muted-foreground"
                        >
                          {name}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between border-t border-border pt-3">
                      <span className="text-[11px] text-muted-foreground">
                        {formatDate(image.createdAt)}
                      </span>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => openEdit(image)}
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (window.confirm("Hapus creator image ini?")) {
                              deleteLibraryMutation.mutate(idCandidates);
                            }
                          }}
                          disabled={deleteLibraryMutation.isPending}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{form.id ? "Edit Creator Image" : "Upload Creator Image"}</DialogTitle>
          </DialogHeader>

          <div className="grid gap-5 lg:grid-cols-[240px_1fr]">
            <div className="space-y-3">
              <div className="flex aspect-square items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                {form.imageUrl ? (
                  <img
                    src={form.imageUrl}
                    alt={form.name || "Preview"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <FileImage className="h-10 w-10 text-muted-foreground" />
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(event) => void handleUpload(event)}
              />
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
                Upload Asset
              </Button>
            </div>

            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2">
                <label className="space-y-1.5 text-xs font-semibold text-foreground">
                  Nama Image
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Nama creator image"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-semibold text-foreground">
                  Harga
                  <Input
                    type="number"
                    min={0}
                    value={form.price}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, price: event.target.value }))
                    }
                    placeholder="0"
                  />
                </label>
              </div>

              <label className="space-y-1.5 text-xs font-semibold text-foreground">
                Image URL
                <Input
                  value={form.imageUrl}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, imageUrl: event.target.value }))
                  }
                  placeholder="https://asset.postmatic.id/..."
                />
              </label>

              <div className="grid gap-3 md:grid-cols-2">
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                  <div>
                    <p className="text-xs font-bold text-foreground">Published</p>
                    <p className="text-[11px] text-muted-foreground">Tampilkan di library.</p>
                  </div>
                  <Switch
                    checked={form.isPublished}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, isPublished: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between rounded-md border border-border bg-muted/20 p-3">
                  <div>
                    <p className="text-xs font-bold text-foreground">Banned</p>
                    <p className="text-[11px] text-muted-foreground">
                      Sembunyikan karena moderasi.
                    </p>
                  </div>
                  <Switch
                    checked={form.isBanned}
                    onCheckedChange={(checked) =>
                      setForm((current) => ({ ...current, isBanned: checked }))
                    }
                  />
                </div>
              </div>

              {form.isBanned && (
                <label className="space-y-1.5 text-xs font-semibold text-foreground">
                  Banned Reason
                  <Input
                    value={form.bannedReason}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, bannedReason: event.target.value }))
                    }
                    placeholder="Alasan moderasi"
                  />
                </label>
              )}

              <CategorySelector
                label="Type Category"
                categories={typeCategories}
                selectedIds={form.typeCategoryIds}
                selectedLabelsById={form.typeCategoryLabels}
                onChange={(ids) => setForm((current) => ({ ...current, typeCategoryIds: ids }))}
              />
              <CategorySelector
                label="Product Category"
                categories={productCategories}
                selectedIds={form.productCategoryIds}
                selectedLabelsById={form.productCategoryLabels}
                onChange={(ids) => setForm((current) => ({ ...current, productCategoryIds: ids }))}
              />

              <div className="flex justify-end gap-2 border-t border-border pt-4">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  disabled={saveLibraryMutation.isPending || isUploading}
                >
                  {saveLibraryMutation.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
