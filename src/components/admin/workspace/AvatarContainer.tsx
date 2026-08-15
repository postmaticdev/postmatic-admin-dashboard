import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  Edit3,
  Loader2,
  MoreVertical,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";

import { ImageUploadField } from "@/components/admin/business/ImageUploadField";
import { getErrorMessage } from "@/components/admin/business/mappers";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createAppAvatar,
  deleteAppAvatar,
  getAppAvatars,
  updateAppAvatar,
  type AppAvatarPayload,
  type RemoteAppAvatar,
} from "@/lib/workspace-management-api";

const AVATAR_QUERY_KEY = ["workspace", "app-avatars"] as const;
const emptyForm: AppAvatarPayload = { name: "", imageUrl: "", isActive: true };

type StatusFilter = "all" | "active" | "inactive";

function formatDate(value?: string | null) {
  if (!value) return "Belum tersedia";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

export function AvatarContainer() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<RemoteAppAvatar | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RemoteAppAvatar | null>(null);
  const [form, setForm] = useState<AppAvatarPayload>(emptyForm);

  const avatarsQuery = useQuery({
    queryKey: AVATAR_QUERY_KEY,
    queryFn: getAppAvatars,
    staleTime: 30_000,
  });

  const avatars = useMemo(() => avatarsQuery.data ?? [], [avatarsQuery.data]);
  const filteredAvatars = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    return avatars.filter((avatar) => {
      const matchesSearch = !keyword || avatar.name?.toLowerCase().includes(keyword);
      const isActive = avatar.isActive ?? false;
      const matchesStatus =
        statusFilter === "all" ||
        (statusFilter === "active" && isActive) ||
        (statusFilter === "inactive" && !isActive);
      return matchesSearch && matchesStatus;
    });
  }, [avatars, search, statusFilter]);

  const activeCount = avatars.filter((avatar) => avatar.isActive).length;

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing?.id != null) return updateAppAvatar(String(editing.id), form);
      return createAppAvatar(form);
    },
    onSuccess: () => {
      toast.success(editing ? "Avatar berhasil diperbarui." : "Avatar berhasil dibuat.");
      setEditing(undefined);
      void queryClient.invalidateQueries({ queryKey: AVATAR_QUERY_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menyimpan avatar.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (avatar: RemoteAppAvatar) => deleteAppAvatar(String(avatar.id)),
    onSuccess: () => {
      toast.success("Avatar berhasil dihapus.");
      setDeleting(null);
      void queryClient.invalidateQueries({ queryKey: AVATAR_QUERY_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menghapus avatar.")),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const openEdit = (avatar: RemoteAppAvatar) => {
    setForm({
      name: avatar.name ?? "",
      imageUrl: avatar.imageUrl ?? "",
      isActive: avatar.isActive ?? true,
    });
    setEditing(avatar);
  };

  return (
    <div className="space-y-6">
      <header className="rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <UserRound className="h-5 w-5" />
            </span>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                  Workspace Management
                </span>
                <span className="font-mono text-xs text-muted-foreground">/ Avatar</span>
              </div>
              <h1 className="mt-1 text-2xl font-bold text-foreground">Avatar Manager</h1>
              <p className="text-sm text-muted-foreground">
                Kelola avatar library yang tersedia untuk seluruh business.
              </p>
            </div>
          </div>
          <Button onClick={openCreate} className="self-start sm:self-auto">
            <Plus className="h-4 w-4" /> Tambah Avatar
          </Button>
        </div>
      </header>

      <div className="flex flex-col gap-3 rounded-lg border border-border bg-card p-4 shadow-sm sm:flex-row sm:items-center">
        <div className="relative min-w-0 flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama avatar..."
            className="pl-9"
          />
        </div>
        <Select
          value={statusFilter}
          onValueChange={(value) => setStatusFilter(value as StatusFilter)}
        >
          <SelectTrigger className="w-full sm:w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua status</SelectItem>
            <SelectItem value="active">Aktif</SelectItem>
            <SelectItem value="inactive">Nonaktif</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-3 text-xs text-muted-foreground sm:ml-auto">
          <span>{avatars.length} total</span>
          <span className="h-4 w-px bg-border" />
          <span className="text-emerald-600 dark:text-emerald-400">{activeCount} aktif</span>
        </div>
      </div>

      {avatarsQuery.isLoading ? (
        <div className="flex min-h-80 items-center justify-center rounded-lg border border-border bg-card text-sm text-muted-foreground">
          <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Memuat avatar...
        </div>
      ) : avatarsQuery.isError ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-3 rounded-lg border border-border bg-card p-6 text-center">
          <AlertCircle className="h-9 w-9 text-destructive" />
          <p className="text-sm font-semibold">Gagal memuat avatar.</p>
          <p className="max-w-md text-xs text-muted-foreground">
            {getErrorMessage(avatarsQuery.error, "Data avatar tidak tersedia.")}
          </p>
          <Button variant="outline" onClick={() => avatarsQuery.refetch()}>
            <RefreshCw className="h-4 w-4" /> Coba lagi
          </Button>
        </div>
      ) : filteredAvatars.length === 0 ? (
        <div className="flex min-h-80 flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card p-6 text-center text-muted-foreground">
          <UserRound className="h-10 w-10 opacity-50" />
          <p className="text-sm font-semibold">
            {avatars.length === 0 ? "Belum ada avatar." : "Avatar tidak ditemukan."}
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {filteredAvatars.map((avatar) => (
            <article
              key={String(avatar.id)}
              className="overflow-hidden rounded-lg border border-border bg-card shadow-sm"
            >
              <div className="aspect-square overflow-hidden bg-muted">
                {avatar.imageUrl ? (
                  <img
                    src={avatar.imageUrl}
                    alt={avatar.name || "Avatar"}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <UserRound className="h-14 w-14 text-muted-foreground/50" />
                  </div>
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold text-foreground">
                      {avatar.name || `Avatar #${avatar.id}`}
                    </h2>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Diperbarui {formatDate(avatar.updatedAt || avatar.createdAt)}
                    </p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Aksi avatar">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(avatar)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleting(avatar)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" /> Hapus
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <span
                  className={`mt-3 inline-flex rounded-md px-2 py-1 text-xs font-medium ${
                    avatar.isActive
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                      : "bg-muted text-muted-foreground"
                  }`}
                >
                  {avatar.isActive ? "Aktif" : "Nonaktif"}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}

      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && !saveMutation.isPending && setEditing(undefined)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Avatar" : "Tambah Avatar"}</DialogTitle>
            <DialogDescription>
              Avatar aktif akan tersedia sebagai pilihan bagi seluruh business.
            </DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!form.name.trim() || !form.imageUrl.trim()) {
                toast.error("Nama dan gambar avatar wajib diisi.");
                return;
              }
              saveMutation.mutate();
            }}
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <ImageUploadField
                label="Gambar Avatar"
                value={form.imageUrl}
                onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
                disabled={saveMutation.isPending}
              />
              <div className="min-w-0 flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Avatar</label>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Masukkan nama avatar"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">URL Gambar</label>
                  <Input
                    value={form.imageUrl}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, imageUrl: event.target.value }))
                    }
                    placeholder="https://example.com/avatar.png"
                  />
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <label htmlFor="app-avatar-active" className="text-sm font-medium">
                  Avatar aktif
                </label>
                <p className="text-xs text-muted-foreground">
                  Tampilkan avatar pada library business.
                </p>
              </div>
              <Switch
                id="app-avatar-active"
                checked={form.isActive}
                onCheckedChange={(isActive) => setForm((current) => ({ ...current, isActive }))}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditing(undefined)}>
                Batal
              </Button>
              <Button type="submit" disabled={saveMutation.isPending}>
                {saveMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
                Simpan
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(deleting)} onOpenChange={(open) => !open && setDeleting(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Avatar?</AlertDialogTitle>
            <AlertDialogDescription>
              Avatar "{deleting?.name}" akan dihapus dari library workspace.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteMutation.isPending}>Batal</AlertDialogCancel>
            <AlertDialogAction
              disabled={deleteMutation.isPending}
              onClick={(event) => {
                event.preventDefault();
                if (deleting) deleteMutation.mutate(deleting);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
