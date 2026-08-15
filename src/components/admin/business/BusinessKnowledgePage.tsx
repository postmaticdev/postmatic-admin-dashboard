import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Building2, Edit3, Globe, Loader2, Phone, RefreshCw } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  getManagedBusinessById,
  upsertManagedBusinessKnowledge,
  type BusinessKnowledgePayload,
  type RemoteManagedBusinessDetail,
} from "@/lib/business-api";
import { AvatarKnowledgeSection } from "./AvatarKnowledgeSection";
import { BusinessFormView } from "./BusinessFormView";
import { ProductKnowledgeSection } from "./ProductKnowledgeSection";
import { RoleKnowledgeSection } from "./RoleKnowledgeSection";
import { RssTrendSection } from "./RssTrendSection";
import type { BusinessAccount, BusinessFormValues } from "./types";
import { getErrorMessage } from "./mappers";

interface BusinessKnowledgePageProps {
  businessId: string;
}

interface ConnectedPlatformEntry {
  socialPlatform?: {
    id?: number | string;
    name?: string | null;
    logo?: string | null;
    platformCode?: string | null;
    isActive?: boolean | null;
  } | null;
  connectedPlatform?: {
    platformName?: string | null;
    platformIconUrl?: string | null;
    platformUserName?: string | null;
  } | null;
}

const BUSINESS_QUERY_KEY = ["workspace", "businesses"] as const;

function sanitizePhone(value?: string) {
  return value?.replace(/[^\d]/g, "").replace(/^0+/, "") || undefined;
}

function sanitizeCountryCode(value?: string) {
  return value?.replace(/[^\d]/g, "") || undefined;
}

function toKnowledgePayload(data: BusinessFormValues): BusinessKnowledgePayload {
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

function accountFromDetail(
  detail: RemoteManagedBusinessDetail,
  businessId: string,
): BusinessAccount {
  const root = detail.businessRoot;
  const knowledge = detail.knowledge;
  const name = knowledge?.name?.trim() || root?.name?.trim() || `Business #${businessId}`;
  const logoUrl =
    knowledge?.primaryLogoUrl?.trim() ||
    root?.primaryLogoUrl?.trim() ||
    `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`;
  const ownerMember = detail.members?.find(
    (member) =>
      member.role?.toLowerCase() === "owner" && member.status?.toLowerCase() === "accepted",
  );
  const owner =
    root?.owner?.name ||
    root?.owner?.email ||
    root?.ownerProfile?.name ||
    ownerMember?.profile?.name ||
    ownerMember?.profile?.email ||
    "Belum tersedia";
  const tokenStatus = root?.tokenStatus;

  return {
    id: businessId,
    name,
    logoUrl,
    owner,
    category: knowledge?.category?.trim() || root?.category?.trim() || "Tanpa kategori",
    description: knowledge?.description?.trim() || root?.description?.trim() || undefined,
    websiteUrl: knowledge?.websiteUrl?.trim() || root?.websiteUrl?.trim() || undefined,
    businessPhone: knowledge?.businessPhone?.trim() || root?.businessPhone?.trim() || undefined,
    countryCode: knowledge?.countryCode?.trim() || root?.countryCode?.trim() || "62",
    colorTone: knowledge?.colorTone?.trim() || root?.colorTone?.trim() || "FAFAFA",
    status: tokenStatus?.hasEverTopUp || Number(tokenStatus?.totalToken ?? 0) > 0 ? "Paid" : "Free",
    balance: Number(tokenStatus?.availableToken ?? 0),
    joinedAt: root?.createdAt || knowledge?.createdAt || new Date().toISOString(),
  };
}

function BusinessProfileCard({
  business,
  onEdit,
}: {
  business: BusinessAccount;
  onEdit: () => void;
}) {
  const colorTone = business.colorTone?.replace(/^#/, "").toUpperCase() || "FAFAFA";
  const colorValue = /^[0-9A-F]{6}$/.test(colorTone) ? colorTone : "FAFAFA";
  const phone = business.businessPhone
    ? `${business.countryCode?.startsWith("+") ? business.countryCode : `+${business.countryCode || "62"}`} ${business.businessPhone}`
    : "Belum tersedia";

  return (
    <section className="h-full rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex items-center justify-between gap-3">
        <h2 className="text-xl font-semibold text-foreground">Business Knowledge</h2>
        <Button variant="ghost" size="icon" onClick={onEdit} title="Edit business knowledge">
          <Edit3 className="h-4 w-4" />
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-[11rem_1fr]">
        <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
          <img src={business.logoUrl} alt={business.name} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-foreground">{business.name}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{business.category}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{phone}</span>
            </span>
            <span className="inline-flex max-w-full items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs">
              <Globe className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{business.websiteUrl || "Belum tersedia"}</span>
            </span>
          </div>
        </div>
      </div>

      <p className="mt-5 line-clamp-4 text-sm leading-6 text-muted-foreground">
        {business.description || "Deskripsi business belum tersedia."}
      </p>

      <div className="mt-5">
        <p className="mb-2 text-sm font-semibold">Color Tone</p>
        <div className="flex h-10 w-40 items-center overflow-hidden rounded-md border">
          <span className="flex h-full items-center border-r px-1">
            <span
              className="h-8 w-8 rounded-md border border-black/5"
              style={{ backgroundColor: `#${colorValue}` }}
            />
          </span>
          <span className="px-3 font-mono text-sm text-foreground">#{colorValue}</span>
        </div>
      </div>
    </section>
  );
}

function ConnectedPlatformsSection({ entries }: { entries: unknown[] }) {
  const hiddenPlatformCodes = new Set(["whatsapp_business", "tiktok", "pinterest", "youtube"]);
  const platforms = (entries as ConnectedPlatformEntry[]).filter((entry) => {
    const platformCode = entry.socialPlatform?.platformCode?.trim().toLowerCase();
    const platformName = entry.socialPlatform?.name?.trim().toLowerCase();

    return (
      !platformCode ||
      (!hiddenPlatformCodes.has(platformCode) &&
        platformName !== "whatsapp business" &&
        platformName !== "tiktok" &&
        platformName !== "pinterest" &&
        platformName !== "youtube")
    );
  });
  return (
    <section className="h-full rounded-lg border border-border bg-card p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-foreground">Media Social</h2>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {platforms.map((entry, index) => {
          const platform = entry.socialPlatform;
          const connected = entry.connectedPlatform;
          const name = connected?.platformName || platform?.name || `Platform ${index + 1}`;
          const logo = connected?.platformIconUrl || platform?.logo;
          return (
            <div
              key={String(platform?.id ?? platform?.platformCode ?? index)}
              className="flex min-w-0 items-center gap-2 rounded-md border p-2.5"
            >
              <div className="h-8 w-8 shrink-0 overflow-hidden rounded-sm bg-muted">
                {logo ? (
                  <img src={logo} alt={name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="m-2 h-4 w-4 text-muted-foreground" />
                )}
              </div>
              <div className="min-w-0">
                <p className="truncate text-xs font-medium">{name}</p>
                <p
                  className={`text-[11px] ${connected ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}`}
                >
                  {connected ? "Terhubung" : "Belum terhubung"}
                </p>
              </div>
            </div>
          );
        })}
        {platforms.length === 0 && (
          <p className="col-span-full text-sm text-muted-foreground">Belum ada data platform.</p>
        )}
      </div>
    </section>
  );
}

export function BusinessKnowledgePage({ businessId }: BusinessKnowledgePageProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [isEditingProfile, setIsEditingProfile] = useState(false);

  const detailQuery = useQuery({
    queryKey: [...BUSINESS_QUERY_KEY, "detail", businessId],
    queryFn: () => getManagedBusinessById(businessId),
  });

  const business = useMemo(
    () => (detailQuery.data ? accountFromDetail(detailQuery.data, businessId) : null),
    [businessId, detailQuery.data],
  );

  const profileMutation = useMutation({
    mutationFn: (data: BusinessFormValues) =>
      upsertManagedBusinessKnowledge(businessId, toKnowledgePayload(data)),
    onSuccess: () => {
      toast.success("Business knowledge berhasil diperbarui.");
      setIsEditingProfile(false);
      void detailQuery.refetch();
      void queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEY });
    },
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui business knowledge.")),
  });

  const refreshDetail = () => {
    void detailQuery.refetch();
    void queryClient.invalidateQueries({ queryKey: BUSINESS_QUERY_KEY });
  };

  if (detailQuery.isLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center text-sm text-muted-foreground">
        <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat knowledge business...
      </div>
    );
  }

  if (detailQuery.isError || !detailQuery.data || !business) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 p-6 text-center">
        <Building2 className="h-10 w-10 text-muted-foreground" />
        <h1 className="text-lg font-semibold">Business tidak dapat dimuat</h1>
        <p className="max-w-md text-sm text-muted-foreground">
          {getErrorMessage(detailQuery.error, "Data detail business tidak tersedia.")}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/workspace/business" })}>
            <ArrowLeft className="h-4 w-4" /> Kembali
          </Button>
          <Button onClick={() => detailQuery.refetch()}>
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </Button>
        </div>
      </div>
    );
  }

  const detail = detailQuery.data;

  return (
    <main className="space-y-6 p-4 sm:p-6">
      <div className="flex items-start gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate({ to: "/workspace/business" })}
          title="Kembali ke Business Management"
          className="mt-0.5 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <p className="text-xs font-medium text-primary">Business Management</p>
          <h1 className="text-2xl font-bold text-foreground">Basic Knowledge</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kelola knowledge, product, avatar, dan RSS trend untuk {business.name}.
          </p>
        </div>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-2">
        <BusinessProfileCard business={business} onEdit={() => setIsEditingProfile(true)} />
        <div className="grid gap-6">
          <RoleKnowledgeSection
            businessId={businessId}
            role={detail.role}
            onChanged={refreshDetail}
          />
          <ConnectedPlatformsSection entries={detail.connectedPlatforms ?? []} />
        </div>
      </div>

      <div className="grid items-stretch gap-6 lg:grid-cols-3">
        <ProductKnowledgeSection
          businessId={businessId}
          products={detail.products ?? []}
          onChanged={refreshDetail}
        />
        <AvatarKnowledgeSection
          businessId={businessId}
          avatars={detail.avatars ?? []}
          onChanged={refreshDetail}
        />
        <RssTrendSection
          businessId={businessId}
          subscriptions={detail.rssSubscriptions ?? []}
          onChanged={refreshDetail}
        />
      </div>

      <BusinessFormView
        business={isEditingProfile ? business : null}
        onSave={(data) => profileMutation.mutateAsync(data)}
        onCancel={() => setIsEditingProfile(false)}
        isSaving={profileMutation.isPending}
      />
    </main>
  );
}
