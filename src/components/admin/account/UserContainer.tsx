import React, { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createManagedUser,
  getManagedProfiles,
  updateManagedProfileBan,
  updateManagedProfileRole,
  type RemoteManagedProfile,
} from "@/lib/account-management-api";
import { UserAccount } from "./types";
import { UserTableList } from "./UserTableList";
import { UserCreateForm } from "./UserCreateForm";
import { Plus, Users } from "lucide-react";
import { toast } from "sonner";

const ACCOUNT_PROFILE_QUERY_KEY = ["account-management", "profiles"] as const;
const USER_QUERY_KEY = [...ACCOUNT_PROFILE_QUERY_KEY, "user"] as const;

interface UserCreateFormValues {
  fullName: string;
  email: string;
  password: string;
}

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
  const queryClient = useQueryClient();
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [promotingUserId, setPromotingUserId] = useState<string | null>(null);
  const [updatingBanUserId, setUpdatingBanUserId] = useState<string | null>(null);

  const usersQuery = useQuery({
    queryKey: USER_QUERY_KEY,
    queryFn: () => getManagedProfiles({ role: "user" }),
    staleTime: 30_000,
  });

  const createMutation = useMutation({
    mutationFn: (data: UserCreateFormValues) =>
      createManagedUser({
        email: data.email,
        name: data.fullName,
        password: data.password,
        role: "user",
      }),
  });

  const promoteMutation = useMutation({
    mutationFn: (id: string) => updateManagedProfileRole(id, "admin"),
  });

  const banMutation = useMutation({
    mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
      updateManagedProfileBan(id, isBanned),
  });

  const users = useMemo(
    () =>
      (usersQuery.data ?? [])
        .filter((profile) => (profile.role ?? "user").toLowerCase() === "user")
        .map(mapRemoteUser),
    [usersQuery.data],
  );

  const invalidateProfiles = () =>
    queryClient.invalidateQueries({ queryKey: ACCOUNT_PROFILE_QUERY_KEY });

  const handleCreateUser = async (data: UserCreateFormValues) => {
    try {
      await createMutation.mutateAsync(data);
      await invalidateProfiles();
      toast.success(`User "${data.fullName}" berhasil dibuat.`);
      setViewMode("list");
    } catch (error) {
      toast.error(getErrorMessage(error, "Gagal membuat user."));
    }
  };

  const handlePromoteToAdmin = async (user: UserAccount) => {
    if (!window.confirm(`Ubah "${user.fullName}" menjadi admin?`)) return;

    setPromotingUserId(user.id);

    try {
      await promoteMutation.mutateAsync(user.id);
      await invalidateProfiles();
      toast.success(`"${user.fullName}" berhasil diubah menjadi admin.`);
    } catch (error) {
      toast.error(getErrorMessage(error, `Gagal mengubah role "${user.fullName}".`));
    } finally {
      setPromotingUserId(null);
    }
  };

  const handleToggleBan = async (user: UserAccount, isBanned: boolean) => {
    const confirmed = window.confirm(
      isBanned ? `Ban user "${user.fullName}"?` : `Buka ban untuk "${user.fullName}"?`,
    );
    if (!confirmed) return;

    setUpdatingBanUserId(user.id);

    try {
      await banMutation.mutateAsync({ id: user.id, isBanned });
      await invalidateProfiles();
      toast.success(
        isBanned ? `"${user.fullName}" berhasil diban.` : `Ban "${user.fullName}" berhasil dibuka.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, `Gagal mengubah status ban "${user.fullName}".`));
    } finally {
      setUpdatingBanUserId(null);
    }
  };

  if (viewMode === "create") {
    return (
      <UserCreateForm
        onSave={handleCreateUser}
        onCancel={() => setViewMode("list")}
        isSaving={createMutation.isPending}
      />
    );
  }

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
          <button
            type="button"
            onClick={() => setViewMode("create")}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />
            Create User
          </button>
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
        promotingUserId={promotingUserId}
        updatingBanUserId={updatingBanUserId}
        onPromoteToAdmin={handlePromoteToAdmin}
        onToggleBan={handleToggleBan}
        onRetry={() => usersQuery.refetch()}
      />
    </div>
  );
}
