import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Edit3, Loader2, MoreVertical, Plus, Search, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";

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
  createManagedBusinessAvatar,
  deleteManagedBusinessAvatar,
  updateManagedBusinessAvatar,
  type BusinessAvatarPayload,
  type RemoteBusinessAvatar,
} from "@/lib/business-api";
import { ImageUploadField } from "./ImageUploadField";
import { getErrorMessage } from "./mappers";

interface AvatarKnowledgeSectionProps {
  businessId: string;
  avatars: RemoteBusinessAvatar[];
  onChanged: () => void;
}

const emptyAvatar: BusinessAvatarPayload = { name: "", imageUrl: "" };

export function AvatarKnowledgeSection({
  businessId,
  avatars,
  onChanged,
}: AvatarKnowledgeSectionProps) {
  const [editing, setEditing] = useState<RemoteBusinessAvatar | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RemoteBusinessAvatar | null>(null);
  const [form, setForm] = useState<BusinessAvatarPayload>(emptyAvatar);
  const [search, setSearch] = useState("");

  const filteredAvatars = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return avatars;

    return avatars.filter((avatar) => {
      const avatarType = avatar.appAvatarId ? "avatar library" : "avatar custom";
      return avatar.name?.toLowerCase().includes(keyword) || avatarType.includes(keyword);
    });
  }, [avatars, search]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing?.id != null) {
        return updateManagedBusinessAvatar(businessId, String(editing.id), form);
      }
      return createManagedBusinessAvatar(businessId, form);
    },
    onSuccess: () => {
      toast.success(editing ? "Avatar berhasil diperbarui." : "Avatar berhasil ditambahkan.");
      setEditing(undefined);
      onChanged();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menyimpan avatar.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (avatar: RemoteBusinessAvatar) =>
      deleteManagedBusinessAvatar(businessId, String(avatar.id)),
    onSuccess: () => {
      toast.success("Avatar berhasil dihapus.");
      setDeleting(null);
      onChanged();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menghapus avatar.")),
  });

  const openCreate = () => {
    setForm(emptyAvatar);
    setEditing(null);
  };

  const openEdit = (avatar: RemoteBusinessAvatar) => {
    setForm({ name: avatar.name ?? "", imageUrl: avatar.imageUrl ?? "" });
    setEditing(avatar);
  };

  return (
    <>
      <section className="flex h-full min-h-[32rem] flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Avatar Business</h2>

        <div className="mt-4 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari avatar..."
              className="pl-9"
            />
          </div>
          <Button size="icon" onClick={openCreate} title="Tambah avatar">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {filteredAvatars.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <UserRound className="h-9 w-9 opacity-50" />
              <p className="text-sm font-medium">
                {search.trim() ? "Avatar tidak ditemukan." : "Belum ada avatar."}
              </p>
            </div>
          ) : (
            filteredAvatars.map((avatar) => (
              <article key={String(avatar.id)} className="rounded-md border p-3">
                <div className="flex items-center gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {avatar.imageUrl ? (
                      <img
                        src={avatar.imageUrl}
                        alt={avatar.name || "Avatar"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <UserRound className="m-5 h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{avatar.name}</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {avatar.appAvatarId ? "Avatar library" : "Avatar custom"}
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
              </article>
            ))
          )}
        </div>
      </section>

      <Dialog
        open={editing !== undefined}
        onOpenChange={(open) => !open && !saveMutation.isPending && setEditing(undefined)}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Avatar" : "Tambah Avatar"}</DialogTitle>
            <DialogDescription>Atur nama dan foto avatar business.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (!form.name.trim() || !form.imageUrl) {
                toast.error("Nama dan foto avatar wajib diisi.");
                return;
              }
              saveMutation.mutate();
            }}
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <ImageUploadField
                label="Foto Avatar"
                value={form.imageUrl}
                onChange={(imageUrl) => setForm((current) => ({ ...current, imageUrl }))}
                disabled={saveMutation.isPending}
              />
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium">Nama Avatar</label>
                <Input
                  value={form.name}
                  onChange={(event) =>
                    setForm((current) => ({ ...current, name: event.target.value }))
                  }
                  placeholder="Masukkan nama avatar"
                />
              </div>
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
              Avatar "{deleting?.name}" akan dihapus dari business ini.
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
    </>
  );
}
