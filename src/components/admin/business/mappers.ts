import type {
  RemoteBusinessMember,
  RemoteBusinessProfile,
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
  return profileDisplayName(member?.profile);
}

function profileDisplayName(profile?: RemoteBusinessProfile | null) {
  return (
    getDisplayText(profile?.name) || getDisplayText(profile?.email) || getDisplayText(profile?.id)
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
    profileDisplayName(root.ownerProfile) ||
    profileDisplayName(root.owner) ||
    profileName(owner) ||
    profileName(root.userPosition) ||
    getDisplayText(root.ownerName) ||
    "Belum tersedia"
  );
}

function getPlanStatus(
  root: RemoteBusinessTokenOverview["business"],
  tokenStatus: RemoteBusinessTokenOverview["tokenStatus"],
): BusinessAccount["status"] {
  const plan = getDisplayText(root.plan) || getDisplayText(root.status);
  const normalizedPlan = plan?.toLowerCase();

  if (normalizedPlan?.includes("paid") || normalizedPlan?.includes("premium")) return "Paid";
  if (normalizedPlan?.includes("free")) return "Free";

  return tokenStatus?.hasEverTopUp || normalizeNumber(tokenStatus?.totalToken) > 0
    ? "Paid"
    : "Free";
}

export function mapBusinessTokenOverviewToAccount(
  overview: RemoteBusinessTokenOverview,
): BusinessAccount {
  const root = overview.detail?.businessRoot ?? overview.business;
  const knowledge = overview.detail?.knowledge;
  const id = String(root.id ?? overview.business.id);
  const name = getDisplayText(knowledge?.name) || getDisplayText(root.name) || `Business #${id}`;
  const tokenStatus = overview.tokenStatus ?? root.tokenStatus ?? null;
  const logoUrl =
    getDisplayText(knowledge?.primaryLogoUrl) ||
    getDisplayText(root.primaryLogoUrl) ||
    getDisplayText(root.logoUrl) ||
    getDisplayText(root.imageUrl) ||
    fallbackLogoUrl(name, id);
  const balance = normalizeNumber(tokenStatus?.availableToken);

  return {
    id,
    name,
    logoUrl,
    owner: getOwnerName(overview),
    category:
      getDisplayText(knowledge?.category) || getDisplayText(root.category) || "Tanpa kategori",
    description:
      getDisplayText(knowledge?.description) || getDisplayText(root.description) || undefined,
    websiteUrl:
      getDisplayText(knowledge?.websiteUrl) || getDisplayText(root.websiteUrl) || undefined,
    status: getPlanStatus(root, tokenStatus),
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
  const remoteBusiness = item.businessRoot;
  const businessId = String(item.businessRootId ?? remoteBusiness?.id ?? "");
  const business = businessById.get(businessId);
  const businessName =
    business?.name || getDisplayText(remoteBusiness?.name) || `Business #${businessId || item.id}`;
  const businessLogoUrl =
    business?.logoUrl ||
    getDisplayText(remoteBusiness?.primaryLogoUrl) ||
    getDisplayText(remoteBusiness?.logoUrl) ||
    getDisplayText(remoteBusiness?.imageUrl) ||
    fallbackLogoUrl(businessName, businessId);

  return {
    id: String(item.id),
    businessId,
    businessName,
    businessLogoUrl,
    businessCategory:
      business?.category || getDisplayText(remoteBusiness?.category) || "Tanpa kategori",
    totalTokens: normalizeNumber(item.amount),
    price: normalizeNumber(item.priceAmount),
    priceCurrency: getDisplayText(item.priceCurrency) || "IDR",
    dateTime: item.createdAt || new Date().toISOString(),
    adminName: profileDisplayName(item.injectedByProfile) || formatAdminName(item.injectedBy),
  };
}

export function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}
