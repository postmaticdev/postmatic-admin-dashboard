import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getManagedProfiles, type RemoteManagedProfile } from "@/lib/account-management-api";
import { AdminAccount } from "./types";
import { AdminTableList } from "./AdminTableList";
import { ShieldCheck } from "lucide-react";

const ADMIN_QUERY_KEY = ["account-management", "profiles", "admin"] as const;

function formatDate(value?: string | null) {
  if (!value) return new Date().toISOString().slice(0, 10);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return new Date().toISOString().slice(0, 10);
  return date.toISOString().slice(0, 10);
}

function getPhone(profile: RemoteManagedProfile) {
  const phone = profile.phone?.trim();
  if (!phone) return "-";

  const countryCode = profile.countryCode?.trim();
  return countryCode ? `${countryCode}${phone}` : phone;
}

function getProfilePhoto(profile: RemoteManagedProfile) {
  return (
    profile.imageUrl?.trim() ||
    profile.image?.trim() ||
    profile.avatarUrl?.trim() ||
    profile.profilePictureUrl?.trim() ||
    profile.photoUrl?.trim() ||
    profile.picture?.trim() ||
    ""
  );
}

function mapRemoteAdmin(profile: RemoteManagedProfile): AdminAccount {
  const fullName = profile.name?.trim() || profile.email?.trim() || `Admin ${profile.id}`;

  return {
    id: profile.id,
    fullName,
    email: profile.email?.trim() || "-",
    phone: getPhone(profile),
    avatarUrl: getProfilePhoto(profile),
    role: "Admin",
    joinedAt: formatDate(profile.createdAt),
    status: profile.isBanned ? "Inactive" : "Active",
    lastActive: formatDate(profile.updatedAt ?? profile.createdAt),
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function AdminContainer() {
  const adminsQuery = useQuery({
    queryKey: ADMIN_QUERY_KEY,
    queryFn: () => getManagedProfiles({ role: "admin" }),
    staleTime: 30_000,
  });

  const admins = useMemo(
    () =>
      (adminsQuery.data ?? [])
        .filter((profile) => (profile.role ?? "").toLowerCase() === "admin")
        .map(mapRemoteAdmin),
    [adminsQuery.data],
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-violet-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <ShieldCheck className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  Account Management
                </span>
                <span className="text-xs text-muted-foreground font-mono">/ Admin</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Manajemen Admin
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola semua akun administrator platform Postmatic.
              </p>
            </div>
          </div>
        </div>
      </div>

      <AdminTableList
        items={admins}
        isLoading={adminsQuery.isLoading}
        errorMessage={
          adminsQuery.isError
            ? getErrorMessage(adminsQuery.error, "Gagal memuat data admin.")
            : undefined
        }
        isReadOnly
        onRetry={() => adminsQuery.refetch()}
      />
    </div>
  );
}
