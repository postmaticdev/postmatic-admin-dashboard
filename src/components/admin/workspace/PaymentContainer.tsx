import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPaymentMethod,
  deletePaymentMethod,
  getPaymentMethodById,
  getPaymentMethods,
  updatePaymentMethod,
  type PaymentMethodPayload,
  type RemotePaymentMethod,
} from "@/lib/payment-method-api";
import { PaymentMethodItem, type FeeType } from "./types";
import { PaymentTableList } from "./PaymentTableList";
import { PaymentFormView } from "./PaymentFormView";
import { toast } from "sonner";

const PAYMENT_METHOD_QUERY_KEY = ["workspace", "payment-methods"] as const;

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function remoteAdminTypeToFeeType(value?: string | null): FeeType {
  return value?.toLowerCase() === "percentage" ? "Percentage" : "Fixed";
}

function feeTypeToRemoteAdminType(value: FeeType): PaymentMethodPayload["adminType"] {
  return value === "Percentage" ? "percentage" : "fixed";
}

function mapRemotePaymentMethod(item: RemotePaymentMethod): PaymentMethodItem {
  const id = String(item.id);
  const code = item.code?.trim() || id;
  const name = item.name?.trim() || code;

  return {
    id,
    code,
    name,
    type: item.type?.trim() || "bank",
    logoUrl: item.image?.trim() || "",
    adminFeeType: remoteAdminTypeToFeeType(item.adminType),
    adminFee: normalizeNumber(item.adminFee),
    otherFeeType: "Percentage",
    otherFee: normalizeNumber(item.taxFee),
    status: item.isActive === false ? "Inactive" : "Active",
  };
}

function toPaymentMethodPayload(data: Omit<PaymentMethodItem, "id">): PaymentMethodPayload {
  return {
    adminType: feeTypeToRemoteAdminType(data.adminFeeType),
    code: data.code.trim(),
    name: data.name.trim(),
    type: data.type.trim(),
    taxFee: data.otherFee,
    adminFee: data.adminFee,
    image: data.logoUrl.trim() || undefined,
    isActive: data.status === "Active",
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function PaymentContainer() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<PaymentMethodItem | null>(null);
  const [loadingDetailId, setLoadingDetailId] = useState<string | null>(null);
  const [togglingStatusId, setTogglingStatusId] = useState<string | null>(null);

  const paymentMethodsQuery = useQuery({
    queryKey: PAYMENT_METHOD_QUERY_KEY,
    queryFn: getPaymentMethods,
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (paymentMethodsQuery.data ?? []).map(mapRemotePaymentMethod),
    [paymentMethodsQuery.data],
  );

  const createMutation = useMutation({
    mutationFn: (data: Omit<PaymentMethodItem, "id">) =>
      createPaymentMethod(toPaymentMethodPayload(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_METHOD_QUERY_KEY }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Omit<PaymentMethodItem, "id"> }) =>
      updatePaymentMethod(id, toPaymentMethodPayload(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_METHOD_QUERY_KEY }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePaymentMethod(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: PAYMENT_METHOD_QUERY_KEY }),
  });

  const handleSave = async (data: Omit<PaymentMethodItem, "id">, id?: string) => {
    try {
      if (id) {
        await updateMutation.mutateAsync({ id, data });
        toast.success(`Payment method "${data.name}" berhasil diperbarui!`);
      } else {
        await createMutation.mutateAsync(data);
        toast.success(`Payment method "${data.name}" berhasil ditambahkan!`);
      }

      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan payment method."));
    }
  };

  const handleDelete = async (id: string) => {
    const target = items.find((item) => item.id === id) ?? editingItem;

    try {
      await deleteMutation.mutateAsync(id);
      toast.success(`Payment method "${target?.name ?? id}" berhasil dihapus!`);
      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menghapus payment method."));
    }
  };

  const handleToggleStatus = async (id: string) => {
    const target = items.find((item) => item.id === id);
    if (!target) return;

    const newStatus = target.status === "Active" ? "Inactive" : "Active";
    setTogglingStatusId(id);

    try {
      await updatePaymentMethod(id, toPaymentMethodPayload({ ...target, status: newStatus }));
      await queryClient.invalidateQueries({ queryKey: PAYMENT_METHOD_QUERY_KEY });
      toast.success(`Status "${target.name}" diubah menjadi ${newStatus}!`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Gagal mengubah status "${target.name}".`));
    } finally {
      setTogglingStatusId(null);
    }
  };

  const handleEdit = async (item: PaymentMethodItem) => {
    setLoadingDetailId(item.id);

    try {
      const detail = await getPaymentMethodById(item.id);
      setEditingItem(mapRemotePaymentMethod(detail));
      setViewMode("edit");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal memuat detail payment method."));
    } finally {
      setLoadingDetailId(null);
    }
  };

  const isSaving = createMutation.isPending || updateMutation.isPending;

  const handleCancelForm = () => {
    setViewMode("list");
    setEditingItem(null);
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <PaymentTableList
          items={items}
          isLoading={paymentMethodsQuery.isLoading}
          errorMessage={
            paymentMethodsQuery.isError
              ? getErrorMessage(paymentMethodsQuery.error, "Gagal memuat payment method.")
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
          onRetry={() => paymentMethodsQuery.refetch()}
        />
      ) : (
        <PaymentFormView
          initialItem={editingItem}
          onSave={handleSave}
          onCancel={handleCancelForm}
          onDelete={handleDelete}
          isSaving={isSaving}
          isDeleting={deleteMutation.isPending}
        />
      )}
    </div>
  );
}
