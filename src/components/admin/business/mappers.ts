import type {
  RemoteBusinessMember,
  RemoteBusinessTokenOverview,
  RemoteImageTokenInjection,
} from "@/lib/business-api";
import type { BusinessAccount, InjectHistoryItem } from "./types";

function normalizeNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function getDisplayText(value: string | null | undefined) {
  const trimmed = value?.trim();
  return trimmed || null;
}

function fallbackLogoUrl(name: string, id: string) {
  const seed = encodeURIComponent(name || `Business ${id}`);
  return `https://api.dicebear.com/7.x/initials/svg?seed=${seed}&backgroundColor=4f46e5`;
}

function profileName(member?: RemoteBusinessMember | null) {
  return (
    getDisplayText(member?.profile?.name) ||
    getDisplayText(member?.profile?.email) ||
    getDisplayText(member?.profile?.id)
  );
}

function getOwnerName(overview: RemoteBusinessTokenOverview) {
  const root = overview.detail?.businessRoot ?? overview.business;
  const members = overview.detail?.members ?? root.members ?? [];
  const owner =
    members.find(
      (member) =>
        member.role?.toLowerCase() === "owner" &&
        (!member.status || member.status.toLowerCase() === "accepted"),
    ) ?? members.find((member) => member.role?.toLowerCase() === "owner");

  return (
    profileName(owner) ||
    profileName(root.userPosition) ||
    getDisplayText(root.ownerName) ||
    "Belum tersedia"
  );
}

export function mapBusinessTokenOverviewToAccount(
  overview: RemoteBusinessTokenOverview,
): BusinessAccount {
  const root = overview.detail?.businessRoot ?? overview.business;
  const knowledge = overview.detail?.knowledge;
  const id = String(root.id ?? overview.business.id);
  const name = getDisplayText(knowledge?.name) || getDisplayText(root.name) || `Business #${id}`;
  const logoUrl =
    getDisplayText(knowledge?.primaryLogoUrl) ||
    getDisplayText(root.primaryLogoUrl) ||
    getDisplayText(root.logoUrl) ||
    getDisplayText(root.imageUrl) ||
    fallbackLogoUrl(name, id);
  const totalToken = normalizeNumber(overview.tokenStatus?.totalToken);
  const balance = normalizeNumber(overview.tokenStatus?.availableToken);

  return {
    id,
    name,
    logoUrl,
    owner: getOwnerName(overview),
    category:
      getDisplayText(knowledge?.category) || getDisplayText(root.category) || "Tanpa kategori",
    status: overview.tokenStatus?.hasEverTopUp || totalToken > 0 ? "Paid" : "Free",
    balance,
    joinedAt: root.createdAt || overview.business.createdAt || new Date().toISOString(),
  };
}

function formatAdminName(value: string | null | undefined) {
  const admin = getDisplayText(value);
  if (!admin) return "Admin";
  if (admin.includes("@") || admin.length <= 14) return admin;
  return `Admin ${admin.slice(0, 8)}`;
}

export function mapInjectionHistoryToItem(
  item: RemoteImageTokenInjection,
  businessById: Map<string, BusinessAccount>,
): InjectHistoryItem {
  const businessId = String(item.businessRootId ?? "");
  const business = businessById.get(businessId);
  const businessName = business?.name ?? `Business #${businessId || item.id}`;

  return {
    id: String(item.id),
    businessId,
    businessName,
    businessLogoUrl: business?.logoUrl ?? fallbackLogoUrl(businessName, businessId),
    businessCategory: business?.category ?? "Tanpa kategori",
    totalTokens: normalizeNumber(item.amount),
    price: 0,
    dateTime: item.createdAt || new Date().toISOString(),
    adminName: formatAdminName(item.injectedBy),
  };
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
