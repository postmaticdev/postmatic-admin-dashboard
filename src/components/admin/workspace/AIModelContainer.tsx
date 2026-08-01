import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createGenerativeModel,
  deleteGenerativeModel,
  getGenerativeModelById,
  getGenerativeModels,
  updateGenerativeModel,
  type GenerativeModelPayload,
  type GenerativeModelType,
  type RemoteGenerativeModel,
} from "@/lib/workspace-management-api";
import { AIModelItem } from "./types";
import { AIModelTableList } from "./AIModelTableList";
import { AIModelFormView } from "./AIModelFormView";
import { toast } from "sonner";

interface AIModelContainerProps {
  modelType: "Image" | "Text";
}

function getRemoteType(modelType: "Image" | "Text"): GenerativeModelType {
  return modelType === "Image" ? "image" : "text";
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

function providerLogo(provider: string) {
  const normalized = provider.toLowerCase();
  if (normalized.includes("openai")) {
    return "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/120px-OpenAI_Logo.svg.png";
  }
  if (normalized.includes("google") || normalized.includes("gemini")) {
    return "https://www.google.com/favicon.ico";
  }
  return "";
}

function mapRemoteModel(item: RemoteGenerativeModel): AIModelItem {
  const id = String(item.id);
  const provider = item.provider?.trim() || "-";
  const modelCode = item.model?.trim() || "";
  const label = item.label?.trim() || modelCode || `Model #${id}`;

  return {
    id,
    name: label,
    logoUrl: item.image?.trim() || providerLogo(provider),
    source: provider,
    temperature: item.premiumModel ? 1 : 0.7,
    preprompt: modelCode,
    status: item.isActive === false ? "Inactive" : "Active",
    modelCode,
    premiumModel: Boolean(item.premiumModel),
    validRatios: item.validRatios ?? undefined,
    imageSizes: item.imageSizes ?? undefined,
  };
}

function toPayload(
  data: Omit<AIModelItem, "id">,
  modelType: "Image" | "Text",
): GenerativeModelPayload {
  const modelCode = data.modelCode?.trim() || data.preprompt.trim() || slugify(data.name);
  const payload: GenerativeModelPayload = {
    label: data.name.trim(),
    model: modelCode,
    provider: data.source.trim(),
    image: data.logoUrl.trim() || undefined,
    isActive: data.status === "Active",
  };

  if (modelType === "Image") {
    payload.premiumModel = data.premiumModel ?? data.temperature >= 1;
    payload.validRatios = data.validRatios?.length ? data.validRatios : ["1:1"];
    payload.imageSizes = data.imageSizes ?? [];
  }

  return payload;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AIModelContainer({ modelType }: AIModelContainerProps) {
  const queryClient = useQueryClient();
  const remoteType = getRemoteType(modelType);
  const queryKey = ["workspace", "generative-models", remoteType] as const;
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<AIModelItem | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);
  const [orderIds, setOrderIds] = useState<string[]>([]);

  const modelsQuery = useQuery({
    queryKey,
    queryFn: () => getGenerativeModels(remoteType),
    staleTime: 30_000,
  });

  const items = useMemo(() => {
    const mapped = (modelsQuery.data ?? []).map(mapRemoteModel);
    if (!orderIds.length) return mapped;

    const order = new Map(orderIds.map((id, index) => [id, index]));
    return [...mapped].sort((left, right) => {
      const leftOrder = order.get(left.id) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = order.get(right.id) ?? Number.MAX_SAFE_INTEGER;
      return leftOrder - rightOrder;
    });
  }, [modelsQuery.data, orderIds]);

  const createMutation = useMutation({
    mutationFn: (data: Omit<AIModelItem, "id">) =>
      createGenerativeModel(remoteType, toPayload(data, modelType)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<AIModelItem, "id"> }) =>
      updateGenerativeModel(remoteType, id, toPayload(data, modelType)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteGenerativeModel(remoteType, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  const handleSave = async (data: Omit<AIModelItem, "id">, id?: string) => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(`Model "${data.name}" berhasil diperbarui!`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Model "${data.name}" berhasil ditambahkan!`);
      }

      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan model."));
    }
  };

  const handleDelete = async (id: string) => {
    const target = items.find((item) => item.id === id) ?? editingItem;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Model "${target?.name ?? id}" berhasil dihapus!`);
      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus model."));
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const nextStatus = target.status === "Active" ? "Inactive" : "Active";
    setTogglingStatusId(id);

    try {
      await updateGenerativeModel(
        remoteType,
        id,
        toPayload({ ...target, status: nextStatus }, modelType),
      );
      await queryClient.invalidateQueries({ queryKey });
      toast.success(`Status model "${target.name}" diubah menjadi ${nextStatus}!`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Gagal mengubah status model "${target.name}".`));
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleEdit = async (item: AIModelItem) => {
    setLoadingDetailId(item.id);

    try {
      const detail = await getGenerativeModelById(remoteType, item.id);
      setEditingItem(mapRemoteModel(detail));
      setViewMode("edit");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat detail model."));
    } finally {
      setLoadingDetailId(null);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <AIModelTableList
          items={items}
          modelType={modelType}
          isLoading={modelsQuery.isLoading}
          errorMessage={
            modelsQuery.isError
              ? getErrorMessage(modelsQuery.error, "Gagal memuat model AI.")
              : undefined
          }
          loadingDetailId={loadingDetailId}
          togglingStatusId={togglingStatusId}
          onCreateNew={() => {
            setEditingItem(null);
            setViewMode("create");
          }}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onReorder={(newItems) => setOrderIds(newItems.map((item) => item.id))}
          onRetry={() => modelsQuery.refetch()}
        />
      ) : (
        <AIModelFormView
          initialItem={editingItem}
          modelType={modelType}
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
