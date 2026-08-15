import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Edit3, Loader2, MoreVertical, Plus, Rss, Trash2 } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  createManagedBusinessRssSubscription,
  deleteManagedBusinessRssSubscription,
  updateManagedBusinessRssSubscription,
  type BusinessRssSubscriptionPayload,
  type RemoteBusinessRssSubscription,
} from "@/lib/business-api";
import { getRssCategories, getRssFeeds, type RemoteRssFeed } from "@/lib/workspace-management-api";
import { getErrorMessage } from "./mappers";

interface RssTrendSectionProps {
  businessId: string;
  subscriptions: RemoteBusinessRssSubscription[];
  onChanged: () => void;
}

interface RssFormState {
  title: string;
  categoryId: string;
  feedId: string;
  isActive: boolean;
}

const emptyForm: RssFormState = { title: "", categoryId: "", feedId: "", isActive: true };

function getFeedCategoryId(feed: RemoteRssFeed) {
  return String(
    feed.appRssCategoryId ??
      feed.masterRssCategoryId ??
      feed.categoryId ??
      feed.category?.id ??
      feed.masterRssCategory?.id ??
      feed.rssCategory?.id ??
      "",
  );
}

export function RssTrendSection({ businessId, subscriptions, onChanged }: RssTrendSectionProps) {
  const [editing, setEditing] = useState<RemoteBusinessRssSubscription | null | undefined>(
    undefined,
  );
  const [deleting, setDeleting] = useState<RemoteBusinessRssSubscription | null>(null);
  const [form, setForm] = useState<RssFormState>(emptyForm);

  const categoriesQuery = useQuery({
    queryKey: ["workspace", "rss-categories"],
    queryFn: getRssCategories,
    staleTime: 60_000,
  });
  const feedsQuery = useQuery({
    queryKey: ["workspace", "rss-feeds", "business-knowledge"],
    queryFn: () => getRssFeeds(),
    staleTime: 60_000,
  });

  const availableFeeds = useMemo(
    () =>
      (feedsQuery.data ?? []).filter(
        (feed) => !form.categoryId || getFeedCategoryId(feed) === form.categoryId,
      ),
    [feedsQuery.data, form.categoryId],
  );
  const selectedFeed = (feedsQuery.data ?? []).find((feed) => String(feed.id) === form.feedId);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload: BusinessRssSubscriptionPayload = {
        title: form.title.trim(),
        isActive: form.isActive,
        appRssFeedId: Number(form.feedId),
      };
      if (editing?.id != null) {
        return updateManagedBusinessRssSubscription(businessId, String(editing.id), payload);
      }
      return createManagedBusinessRssSubscription(businessId, payload);
    },
    onSuccess: () => {
      toast.success(editing ? "RSS trend berhasil diperbarui." : "RSS trend berhasil ditambahkan.");
      setEditing(undefined);
      onChanged();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menyimpan RSS trend.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (subscription: RemoteBusinessRssSubscription) =>
      deleteManagedBusinessRssSubscription(businessId, String(subscription.id)),
    onSuccess: () => {
      toast.success("RSS trend berhasil dihapus.");
      setDeleting(null);
      onChanged();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menghapus RSS trend.")),
  });

  const openCreate = () => {
    setForm(emptyForm);
    setEditing(null);
  };

  const openEdit = (subscription: RemoteBusinessRssSubscription) => {
    const feedId = String(subscription.appRssId ?? subscription.appRssFeed?.id ?? "");
    const feed = (feedsQuery.data ?? []).find((item) => String(item.id) === feedId);
    setForm({
      title: subscription.title ?? "",
      feedId,
      categoryId:
        (feed && getFeedCategoryId(feed)) ||
        String(subscription.appRssFeed?.appRssCategory?.id ?? ""),
      isActive: subscription.isActive ?? true,
    });
    setEditing(subscription);
  };

  return (
    <>
      <section className="flex h-full min-h-[32rem] flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-lg font-semibold text-foreground">RSS Trend</h2>
          <Button size="icon" onClick={openCreate} title="Tambah RSS trend">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {subscriptions.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <Rss className="h-9 w-9 opacity-50" />
              <p className="text-sm font-medium">Belum ada RSS trend.</p>
            </div>
          ) : (
            subscriptions.map((subscription) => (
              <article key={String(subscription.id)} className="rounded-md border p-3">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-orange-500/15 text-orange-600">
                    <Rss className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-semibold">{subscription.title}</h3>
                    <p className="truncate text-xs text-muted-foreground">
                      {subscription.appRssFeed?.title || "RSS source"}
                    </p>
                    <div className="mt-2 flex items-center gap-2 text-xs">
                      <span className="rounded-sm bg-muted px-2 py-0.5 text-muted-foreground">
                        {subscription.appRssFeed?.appRssCategory?.name || "Tanpa kategori"}
                      </span>
                      <span
                        className={
                          subscription.isActive
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-muted-foreground"
                        }
                      >
                        {subscription.isActive ? "Aktif" : "Nonaktif"}
                      </span>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8" title="Aksi RSS">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => openEdit(subscription)}>
                        <Edit3 className="mr-2 h-4 w-4" /> Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setDeleting(subscription)}
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
            <DialogTitle>{editing ? "Edit RSS Trend" : "Tambah RSS Trend"}</DialogTitle>
            <DialogDescription>Pilih RSS source yang digunakan business.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              if (!form.title.trim() || !form.feedId || !Number.isFinite(Number(form.feedId))) {
                toast.error("Judul dan RSS source wajib dipilih.");
                return;
              }
              saveMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <label className="text-sm font-medium">Judul Feed</label>
              <Input
                value={form.title}
                onChange={(event) =>
                  setForm((current) => ({ ...current, title: event.target.value }))
                }
                placeholder="Masukkan judul feed"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Kategori Feed</label>
              <Select
                value={form.categoryId}
                onValueChange={(categoryId) =>
                  setForm((current) => ({ ...current, categoryId, feedId: "" }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  {(categoriesQuery.data ?? []).map((category) => (
                    <SelectItem key={String(category.id)} value={String(category.id)}>
                      {category.name || `Category #${category.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">RSS Source</label>
              <Select
                value={form.feedId}
                onValueChange={(feedId) => setForm((current) => ({ ...current, feedId }))}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={feedsQuery.isLoading ? "Memuat source..." : "Pilih RSS source"}
                  />
                </SelectTrigger>
                <SelectContent>
                  {availableFeeds.map((feed) => (
                    <SelectItem key={String(feed.id)} value={String(feed.id)}>
                      {feed.title || `RSS #${feed.id}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">URL RSS</label>
              <Input value={selectedFeed?.url ?? ""} disabled placeholder="URL RSS source" />
            </div>
            <div className="flex items-center gap-3 rounded-md border p-3">
              <Switch
                id="rss-active"
                checked={form.isActive}
                onCheckedChange={(isActive) => setForm((current) => ({ ...current, isActive }))}
              />
              <label htmlFor="rss-active" className="text-sm font-medium">
                RSS aktif
              </label>
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
            <AlertDialogTitle>Hapus RSS Trend?</AlertDialogTitle>
            <AlertDialogDescription>
              RSS "{deleting?.title}" akan dihapus dari business ini.
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
