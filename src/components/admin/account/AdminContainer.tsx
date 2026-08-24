import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getManagedProfilePage,
  updateManagedProfileBan,
  updateManagedProfileRole,
  type RemoteManagedProfile,
} from "@/lib/account-management-api";
import { AdminAccount } from "./types";
import { AdminTableList } from "./AdminTableList";
import { AdminRoleRemovalDialog } from "./AdminRoleRemovalDialog";
import { ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const ACCOUNT_PROFILE_QUERY_KEY = ["account-management", "profiles"] as const;
const ADMIN_QUERY_KEY = [...ACCOUNT_PROFILE_QUERY_KEY, "admin"] as const;
const ACCOUNT_PAGE_SIZE = 20;

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
  const queryClient = useQueryClient();
  const [roleRemovalAdmin, setRoleRemovalAdmin] = useState<AdminAccount | null>(null);
  const [updatingBanAdminId, setUpdatingBanAdminId] = useState<string | null>(null);
  const [removingRoleAdminId, setRemovingRoleAdminId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());

  const adminsQuery = useQuery({
    queryKey: [...ADMIN_QUERY_KEY, { page: currentPage, search: deferredSearchQuery }] as const,
    queryFn: () =>
      getManagedProfilePage({
        role: "admin",
        search: deferredSearchQuery || undefined,
        page: currentPage,
        limit: ACCOUNT_PAGE_SIZE,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, isBanned }: { id: string; isBanned: boolean }) =>
      updateManagedProfileBan(id, isBanned),
  });

  const removeRoleMutation = useMutation({
    mutationFn: (id: string) => updateManagedProfileRole(id, "user"),
  });

  const admins = useMemo(
    () =>
      (adminsQuery.data?.items ?? [])
        .filter((profile) => (profile.role ?? "").toLowerCase() === "admin")
        .map(mapRemoteAdmin),
    [adminsQuery.data],
  );

  const pagination = adminsQuery.data?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: ACCOUNT_PAGE_SIZE,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: currentPage > 1,
  };

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const invalidateProfiles = () =>
    queryClient.invalidateQueries({ queryKey: ACCOUNT_PROFILE_QUERY_KEY });

  const handleToggleBan = async (admin: AdminAccount, isBanned: boolean) => {
    const confirmed = window.confirm(
      isBanned ? `Ban admin "${admin.fullName}"?` : `Buka ban untuk "${admin.fullName}"?`,
    );
    if (!confirmed) return;

    setUpdatingBanAdminId(admin.id);

    try {
      await banMutation.mutateAsync({ id: admin.id, isBanned });
      await invalidateProfiles();
      toast.success(
        isBanned
          ? `Admin "${admin.fullName}" berhasil diban.`
          : `Ban admin "${admin.fullName}" berhasil dibuka.`,
      );
    } catch (error) {
      toast.error(getErrorMessage(error, `Gagal mengubah status ban "${admin.fullName}".`));
    } finally {
      setUpdatingBanAdminId(null);
    }
  };

  const handleRemoveRole = async () => {
    if (!roleRemovalAdmin) return;

    const admin = roleRemovalAdmin;
    setRemovingRoleAdminId(admin.id);

    try {
      await removeRoleMutation.mutateAsync(admin.id);
      await invalidateProfiles();
      toast.success(`Role admin "${admin.fullName}" berhasil dihapus.`);
      setRoleRemovalAdmin(null);
    } catch (error) {
      toast.error(getErrorMessage(error, `Gagal menghapus role "${admin.fullName}".`));
    } finally {
      setRemovingRoleAdminId(null);
    }
  };

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
        searchQuery={searchQuery}
        pagination={pagination}
        isLoading={adminsQuery.isLoading}
        isPageChanging={adminsQuery.isFetching && !adminsQuery.isLoading}
        errorMessage={
          adminsQuery.isError
            ? getErrorMessage(adminsQuery.error, "Gagal memuat data admin.")
            : undefined
        }
        updatingBanAdminId={updatingBanAdminId}
        removingRoleAdminId={removingRoleAdminId}
        onToggleBan={handleToggleBan}
        onRemoveRole={setRoleRemovalAdmin}
        onRetry={() => adminsQuery.refetch()}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
      />

      {roleRemovalAdmin && (
        <AdminRoleRemovalDialog
          key={roleRemovalAdmin.id}
          admin={roleRemovalAdmin}
          isSubmitting={removeRoleMutation.isPending}
          onClose={() => setRoleRemovalAdmin(null)}
          onConfirm={handleRemoveRole}
        />
      )}
    </div>
  );
}
