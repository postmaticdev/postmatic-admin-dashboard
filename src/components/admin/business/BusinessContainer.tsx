import React, { useDeferredValue, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { getBusinessDashboardPage } from "@/lib/business-api";
import { BusinessAccount } from "./types";
import { BusinessTableList } from "./BusinessTableList";
import { getErrorMessage, mapBusinessTokenOverviewToAccount } from "./mappers";
import { Building2, Plus } from "lucide-react";

const BUSINESS_QUERY_KEY = ["workspace", "businesses"] as const;
const BUSINESS_PAGE_SIZE = 20;

export function BusinessContainer() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const deferredSearchQuery = useDeferredValue(searchQuery.trim());

  const businessQuery = useQuery({
    queryKey: [...BUSINESS_QUERY_KEY, { page: currentPage, search: deferredSearchQuery }] as const,
    queryFn: () =>
      getBusinessDashboardPage({
        search: deferredSearchQuery || undefined,
        page: currentPage,
        limit: BUSINESS_PAGE_SIZE,
      }),
    placeholderData: (previousData) => previousData,
    staleTime: 30_000,
  });

  const items = useMemo(
    () => (businessQuery.data?.businesses ?? []).map(mapBusinessTokenOverviewToAccount),
    [businessQuery.data],
  );

  const pagination = businessQuery.data?.pagination ?? {
    total: 0,
    page: currentPage,
    limit: BUSINESS_PAGE_SIZE,
    totalPages: 1,
    hasNextPage: false,
    hasPrevPage: currentPage > 1,
  };
  const overview = businessQuery.data?.overview;
  const totalBusiness = overview?.totalBusinesses ?? pagination.total;
  const freeBusiness =
    overview?.freeBusinesses ?? items.filter((item) => item.status === "Free").length;
  const paidBusiness = Math.max(0, totalBusiness - freeBusiness);

  useEffect(() => {
    if (currentPage > pagination.totalPages) {
      setCurrentPage(pagination.totalPages);
    }
  }, [currentPage, pagination.totalPages]);

  const handleEdit = (item: BusinessAccount) => {
    void navigate({
      to: "/workspace/business/$businessId/knowledge-base",
      params: { businessId: item.id },
    });
  };

  const handleCreateNew = () => {
    void navigate({ to: "/workspace/business/create" });
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
        searchQuery={searchQuery}
        pagination={pagination}
        summary={{ totalBusiness, paidBusiness, freeBusiness }}
        isLoading={businessQuery.isLoading}
        isPageChanging={businessQuery.isFetching && !businessQuery.isLoading}
        errorMessage={
          businessQuery.isError
            ? getErrorMessage(businessQuery.error, "Gagal memuat data business.")
            : undefined
        }
        onEdit={handleEdit}
        onRetry={() => businessQuery.refetch()}
        onSearchChange={(value) => {
          setSearchQuery(value);
          setCurrentPage(1);
        }}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
