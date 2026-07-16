import React, { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Users, ChevronLeft } from "lucide-react";
import { CreatorAccount, CreatorRequest, INITIAL_CREATOR_ACCOUNTS, INITIAL_CREATOR_REQUESTS } from "./creator-types";
import { CreatorTableList, RequestApprovalView } from "./CreatorAccountTableList";

type ViewMode = "list" | "requests";

export function CreatorAccountContainer() {
  const [creators, setCreators] = useState<CreatorAccount[]>(INITIAL_CREATOR_ACCOUNTS);
  const [requests, setRequests] = useState<CreatorRequest[]>(INITIAL_CREATOR_REQUESTS);
  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const handleSave = (updated: CreatorAccount) => {
    setCreators((prev) => prev.map((c) => (c.id === updated.id ? updated : c)));
    toast.success(`Data "${updated.fullName}" berhasil diperbarui!`);
  };

  const handleDelete = (id: string) => {
    const target = creators.find((c) => c.id === id);
    setCreators((prev) => prev.filter((c) => c.id !== id));
    toast.success(`Creator "${target?.fullName}" berhasil dihapus.`);
  };

  const handleSuspend = (id: string) => {
    const target = creators.find((c) => c.id === id);
    setCreators((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status: "Suspended" as const } : c))
    );
    toast.warning(`Creator "${target?.fullName}" telah disuspend.`);
  };

  const handleApproveRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    if (!req) return;
    // Mark as approved
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "approved" as const } : r)));
    // Add to creators list
    const newCreator: CreatorAccount = {
      id: `ca-${Date.now()}`,
      fullName: req.fullName,
      email: req.email,
      phone: req.phone,
      bio: req.bio,
      avatarUrl: req.avatarUrl,
      joinedAt: new Date().toISOString().split("T")[0],
      status: "Active",
      lastActive: new Date().toISOString().split("T")[0],
      balance: 0,
      totalContent: 0,
      followersCount: 0,
      specialization: req.specialization,
    };
    setCreators((prev) => [newCreator, ...prev]);
    toast.success(`"${req.fullName}" berhasil disetujui sebagai Creator!`);
  };

  const handleRejectRequest = (id: string) => {
    const req = requests.find((r) => r.id === id);
    setRequests((prev) => prev.map((r) => (r.id === id ? { ...r, status: "rejected" as const } : r)));
    toast.error(`Pendaftaran "${req?.fullName}" telah ditolak.`);
  };

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card to-violet-500/5 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-violet-500/10 flex items-center justify-center">
              <Sparkles className="h-5 w-5 text-violet-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2.5 py-0.5 text-xs font-semibold text-violet-600 dark:text-violet-400">
                  <Users className="h-3 w-3" />Account Management
                </span>
                <span className="text-xs text-muted-foreground font-mono">/ Creator</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground mt-1">Manajemen Creator</h1>
              <p className="text-sm text-muted-foreground">Kelola semua akun creator terdaftar di platform Postmatic.</p>
            </div>
          </div>

          {/* Request button */}
          {viewMode === "list" ? (
            <button
              type="button"
              onClick={() => setViewMode("requests")}
              className="relative inline-flex items-center gap-2 rounded-xl bg-amber-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-amber-500/30 hover:bg-amber-600 active:scale-[0.98] transition-all shrink-0 self-start md:self-auto"
            >
              Requests
              {requests.filter((r) => r.status === "pending").length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {requests.filter((r) => r.status === "pending").length}
                </span>
              )}
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setViewMode("list")}
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-2.5 text-sm font-semibold text-foreground hover:bg-muted transition-all shrink-0 self-start md:self-auto"
            >
              <ChevronLeft className="h-4 w-4" />Kembali ke Daftar
            </button>
          )}
        </div>
      </div>

      {/* View routing */}
      {viewMode === "list" ? (
        <CreatorTableList
          creators={creators}
          requests={requests}
          onEdit={() => {}}
          onDelete={handleDelete}
          onSuspend={handleSuspend}
          onSave={handleSave}
          onShowRequests={() => setViewMode("requests")}
        />
      ) : (
        <RequestApprovalView
          requests={requests}
          onApprove={handleApproveRequest}
          onReject={handleRejectRequest}
        />
      )}
    </div>
  );
}
