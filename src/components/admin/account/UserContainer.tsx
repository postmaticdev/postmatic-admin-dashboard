import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { getManagedProfiles, type RemoteManagedProfile } from "@/lib/account-management-api";
import { UserAccount } from "./types";
import { UserTableList } from "./UserTableList";
import { Users } from "lucide-react";

const USER_QUERY_KEY = ["account-management", "profiles", "user"] as const;

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

function getBio(profile: RemoteManagedProfile) {
  const description = profile.description?.trim();
  if (description) return description;

  const providers = [
    profile.hasCredentialProvider ? "Credential" : null,
    profile.hasGoogleProvider ? "Google" : null,
  ].filter(Boolean);

  return providers.length ? `Login: ${providers.join(", ")}` : "-";
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

function mapRemoteUser(profile: RemoteManagedProfile): UserAccount {
  const fullName = profile.name?.trim() || profile.email?.trim() || `User ${profile.id}`;

  return {
    id: profile.id,
    fullName,
    email: profile.email?.trim() || "-",
    phone: getPhone(profile),
    bio: getBio(profile),
    avatarUrl: getProfilePhoto(profile),
    joinedAt: formatDate(profile.createdAt),
    status: profile.isBanned ? "Suspended" : "Active",
    lastActive: formatDate(profile.updatedAt ?? profile.createdAt),
    postsCount: profile.successTopupCount ?? 0,
    followersCount: 0,
  };
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

export function UserContainer() {
  const usersQuery = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => getManagedProfiles({ role: "user" }),
    staleTime: 30_000,
  });

  const users = useMemo(
    () =>
      (usersQuery.data ?? [])
        .filter((profile) => (profile.role ?? "user").toLowerCase() === "user")
        .map(mapRemoteUser),
    [usersQuery.data],
  );

  return (
    <div className="space-y-6">
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-blue-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center">
              <Users className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/10 px-2.5 py-0.5 text-xs font-semibold text-blue-600 dark:text-blue-400">
                  Account Management
                </span>
                <span className="text-xs text-muted-foreground font-mono">/ User</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">
                Manajemen Pengguna
              </h1>
              <p className="text-sm text-muted-foreground">
                Kelola semua akun pengguna terdaftar di platform Postmatic.
              </p>
            </div>
          </div>
        </div>
      </div>

      <UserTableList
        items={users}
        isLoading={usersQuery.isLoading}
        errorMessage={
          usersQuery.isError
            ? getErrorMessage(usersQuery.error, "Gagal memuat data pengguna.")
            : undefined
        }
        isReadOnly
        onRetry={() => usersQuery.refetch()}
      />
    </div>
  );
}
