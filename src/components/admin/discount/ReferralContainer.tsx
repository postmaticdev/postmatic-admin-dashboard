import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getReferralRule,
  upsertReferralRule,
  type ReferralRulePayload,
  type RemoteReferralRule,
} from "@/lib/workspace-management-api";
import { ReferralItem } from "./types";
import { ReferralTableList } from "./ReferralTableList";
import { ReferralFormView } from "./ReferralFormView";
import { toast } from "sonner";

const REFERRAL_RULE_QUERY_KEY = ["workspace", "referral-rule"] as const;

function formatDate(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function addDays(dateValue: string, days?: number | null) {
  if (!days || days <= 0) return null;

  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return null;
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

function daysBetween(startDate: string, endDate: string | null) {
  if (!endDate) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;

  const diff = Math.ceil((end.getTime() - start.getTime()) / 86_400_000);
  return diff > 0 ? diff : null;
}

function discountTypeToLocal(value?: string | null): ReferralItem["type"] {
  return value?.toLowerCase() === "fixed" ? "Fixed" : "Percentage";
}

function discountTypeToRemote(value: ReferralItem["type"]): ReferralRulePayload["discountType"] {
  return value === "Fixed" ? "fixed" : "percentage";
}

function mapRemoteReferralRule(rule: RemoteReferralRule): ReferralItem {
  const startDate = formatDate(rule.createdAt ?? rule.updatedAt);

  return {
    id: String(rule.id),
    role: "Global",
    startDate,
    endDate: addDays(startDate, rule.expiredDays),
    type: discountTypeToLocal(rule.discountType),
    discountValue: rule.totalDiscount ?? 0,
    minOrder: rule.rewardPerReferral ?? 0,
    maxDiscount: rule.maxDiscount ?? null,
    status: "Active",
  };
}

function toReferralRulePayload(data: Omit<ReferralItem, "id">): ReferralRulePayload {
  return {
    discountType: discountTypeToRemote(data.type),
    maxDiscount: data.maxDiscount,
    rewardPerReferral: data.minOrder,
    totalDiscount: data.discountValue,
    expiredDays: daysBetween(data.startDate, data.endDate),
    maxUsage: null,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function ReferralContainer() {
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "create" | "edit">("list");
  const [editingItem, setEditingItem] = useState<ReferralItem | null>(null);

  const referralRuleQuery = useQuery({
    queryKey: REFERRAL_RULE_QUERY_KEY,
    queryFn: getReferralRule,
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (referralRuleQuery.data ? [mapRemoteReferralRule(referralRuleQuery.data)] : []),
    [referralRuleQuery.data],
  );

  const upsertMutation = useMutation({
    mutationFn: (data: Omit<ReferralItem, "id">) => upsertReferralRule(toReferralRulePayload(data)),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: REFERRAL_RULE_QUERY_KEY }),
  });

  const handleCreateNew = () => {
    setEditingItem({
      id: "new",
      role: "Global",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: null,
      type: "Percentage",
      discountValue: 0,
      minOrder: 0,
      maxDiscount: null,
      status: "Active",
    });
    setViewMode("create");
  };

  const handleEdit = (item: ReferralItem) => {
    setEditingItem(item);
    setViewMode("edit");
  };

  const handleToggleStatus = () => {
    toast.info("Status referral rule belum tersedia di API.");
  };

  const handleSave = async (data: Omit<ReferralItem, "id">) => {
    try {
      await upsertMutation.mutateAsync(data);
      toast.success("Referral rule berhasil disimpan!");
      setViewMode("list");
      setEditingItem(null);
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal menyimpan referral rule."));
    }
  };

  return (
    <div className="space-y-6">
      {viewMode === "list" ? (
        <ReferralTableList
          items={items}
          isLoading={referralRuleQuery.isLoading}
          errorMessage={
            referralRuleQuery.isError
              ? getErrorMessage(referralRuleQuery.error, "Gagal memuat referral rule.")
              : undefined
          }
          canCreate={items.length === 0}
          statusReadOnly
          onCreateNew={handleCreateNew}
          onEdit={handleEdit}
          onToggleStatus={handleToggleStatus}
          onRetry={() => referralRuleQuery.refetch()}
        />
      ) : (
        <ReferralFormView
          initialItem={editingItem}
          onSave={handleSave}
          onCancel={() => {
            setViewMode("list");
            setEditingItem(null);
          }}
          isSaving={upsertMutation.isPending}
        />
      )}
    </div>
  );
}
