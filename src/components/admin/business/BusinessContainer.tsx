import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getBusinessDashboardData,
  getManagedBusinessById,
  upsertManagedBusinessKnowledge,
  type BusinessKnowledgePayload,
} from "@/lib/business-api";
import { BusinessAccount, BusinessFormValues } from "./types";
import { BusinessTableList } from "./BusinessTableList";
import { BusinessFormView } from "./BusinessFormView";
import {
  getErrorMessage,
  mapBusinessTokenOverviewToAccount,
  mapManagedBusinessDetailToAccount,
} from "./mappers";
import { toast } from "sonner";
import { Building2, Plus } from "lucide-react";

const BUSINESS_QUERY_KEY = ["workspace", "businesses"] as const;

function sanitizePhone(value?: string) {
  return value?.replace(/[^\d]/g, "").replace(/^0+/, "") || undefined;
}

function sanitizeCountryCode(value?: string) {
  const digits = value?.replace(/[^\d]/g, "");
  return digits || undefined;
}

function toBusinessKnowledgePayload(data: BusinessFormValues): BusinessKnowledgePayload {
  return {
    name: data.name.trim(),
    category: data.category.trim(),
    primaryLogoUrl: data.logoUrl.trim() || undefined,
    description: data.description?.trim() || undefined,
    websiteUrl: data.websiteUrl?.trim() || undefined,
    businessPhone: sanitizePhone(data.businessPhone),
    countryCode: sanitizeCountryCode(data.countryCode),
    colorTone: data.colorTone?.replace(/^#/, "").trim() || undefined,
  };
}

export function BusinessContainer() {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<BusinessAccount | null>(null);

  const businessQuery = useQuery({
    queryKey: BUSINESS_QUERY_KEY,
    queryFn: getBusinessDashboardData,
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (businessQuery.data?.businesses ?? []).map(mapBusinessTokenOverviewToAccount),
    [businessQuery.data],
  );

  const editingBusinessId = editingItem?.id;
  const businessDetailQuery = useQuery({
    queryKey: [...BUSINESS_QUERY_KEY, "detail", editingBusinessId],
    queryFn: () => getManagedBusinessById(editingBusinessId!),
    enabled: Boolean(editingBusinessId),
  });

  const editingBusiness = useMemo(() => {
    if (!editingItem) return null;
    if (!businessDetailQuery.data) return editingItem;
    return mapManagedBusinessDetailToAccount(businessDetailQuery.data, editingItem);
  }, [businessDetailQuery.data, editingItem]);

  const updateKnowledgeMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: BusinessFormValues }) =>
      upsertManagedBusinessKnowledge(id, toBusinessKnowledgePayload(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEY }),
  });

  const handleSave = async (data: BusinessFormValues, id?: string) => {
    if (!id) {
      toast.error(
        `Endpoint create business sederhana untuk "${data.name}" belum tersedia di koleksi Postman terbaru.`,
      );
      return;
    }

    try {
      await updateKnowledgeMutation.mutateAsync({ id, data });
      toast.success(`Business "${data.name}" berhasil diperbarui!`);
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memperbarui business."));
    }
  };

  const handleEdit = (item: BusinessAccount) => {
    setEditingItem(item);
  };

  const handleCreateNew = () => {
    toast.error("Endpoint create business sederhana belum tersedia di koleksi Postman terbaru.");
  };

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-blue-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Building2 className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Workspace Management
                </span>
                <span className="text-xs text-muted-foreground font-mono">
                  / Business Management
                </span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Business Management
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola profil bisnis, saldo token AI, dan keanggotaan klien.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCreateNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all shrink-0 self-start md:self-auto"
          >
            <Plus className="h-4 w-4" /> Create New Business
          </button>
        </div>
      </div>

      <BusinessTableList
        items={items}
        isLoading={businessQuery.isLoading}
        errorMessage={
          businessQuery.isError
            ? getErrorMessage(businessQuery.error, "Gagal memuat data business.")
            : undefined
        }
        onEdit={handleEdit}
        onRetry={() => businessQuery.refetch()}
      />

      <BusinessFormView
        business={editingBusiness}
        onSave={handleSave}
        onCancel={() => {
          setEditingItem(null);
        }}
        isSaving={updateKnowledgeMutation.isPending}
        isLoadingInitialData={
          businessDetailQuery.isFetching && !businessDetailQuery.data && Boolean(editingBusinessId)
        }
      />
    </div>
  );
}
