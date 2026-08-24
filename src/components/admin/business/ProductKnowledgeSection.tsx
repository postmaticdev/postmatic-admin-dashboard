import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Edit3, Loader2, MoreVertical, Plus, Search, ShoppingBag, Trash2 } from "lucide-react";
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
import { Textarea } from "@/components/ui/textarea";
import {
  createManagedBusinessProduct,
  deleteManagedBusinessProduct,
  updateManagedBusinessProduct,
  type BusinessProductPayload,
  type RemoteBusinessProduct,
} from "@/lib/business-api";
import { CurrencySelect, ProductCategorySelect } from "./BusinessFormSelects";
import { BusinessPriceInput } from "./BusinessPriceInput";
import { ImageUploadField } from "./ImageUploadField";
import { getErrorMessage } from "./mappers";

interface ProductKnowledgeSectionProps {
  businessId: string;
  products: RemoteBusinessProduct[];
  onChanged: () => void;
}

const emptyProduct: BusinessProductPayload = {
  name: "",
  category: "",
  description: "",
  price: 0,
  currency: "IDR",
  imageUrls: [],
};

export function ProductKnowledgeSection({
  businessId,
  products,
  onChanged,
}: ProductKnowledgeSectionProps) {
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<RemoteBusinessProduct | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<RemoteBusinessProduct | null>(null);
  const [form, setForm] = useState<BusinessProductPayload>(emptyProduct);

  const filteredProducts = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return products;
    return products.filter(
      (product) =>
        product.name?.toLowerCase().includes(keyword) ||
        product.category?.toLowerCase().includes(keyword),
    );
  }, [products, search]);

  const saveMutation = useMutation({
    mutationFn: () => {
      if (editing?.id != null) {
        return updateManagedBusinessProduct(businessId, String(editing.id), form);
      }
      return createManagedBusinessProduct(businessId, form);
    },
    onSuccess: () => {
      toast.success(editing ? "Product berhasil diperbarui." : "Product berhasil ditambahkan.");
      setEditing(undefined);
      onChanged();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menyimpan product.")),
  });

  const deleteMutation = useMutation({
    mutationFn: (product: RemoteBusinessProduct) =>
      deleteManagedBusinessProduct(businessId, String(product.id)),
    onSuccess: () => {
      toast.success("Product berhasil dihapus.");
      setDeleting(null);
      onChanged();
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menghapus product.")),
  });

  const openCreate = () => {
    setForm(emptyProduct);
    setEditing(null);
  };

  const openEdit = (product: RemoteBusinessProduct) => {
    setForm({
      name: product.name ?? "",
      category: product.category ?? "",
      description: product.description ?? "",
      price: Number(product.price ?? 0),
      currency: product.currency ?? "IDR",
      imageUrls: product.imageUrls ?? [],
    });
    setEditing(product);
  };

  return (
    <>
      <section className="flex h-full min-h-[32rem] flex-col rounded-lg border border-border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">Product Knowledge</h2>

        <div className="mt-4 flex gap-2">
          <div className="relative min-w-0 flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Cari product..."
              className="pl-9"
            />
          </div>
          <Button size="icon" onClick={openCreate} title="Tambah product">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="mt-4 flex-1 space-y-3 overflow-y-auto pr-1">
          {filteredProducts.length === 0 ? (
            <div className="flex min-h-64 flex-col items-center justify-center gap-2 text-center text-muted-foreground">
              <ShoppingBag className="h-9 w-9 opacity-50" />
              <p className="text-sm font-medium">Belum ada product.</p>
            </div>
          ) : (
            filteredProducts.map((product) => (
              <article key={String(product.id)} className="rounded-md border p-3">
                <div className="flex gap-3">
                  <div className="h-16 w-16 shrink-0 overflow-hidden rounded-md bg-muted">
                    {product.imageUrls?.[0] ? (
                      <img
                        src={product.imageUrls[0]}
                        alt={product.name || "Product"}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <ShoppingBag className="m-5 h-6 w-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                        <p className="truncate text-xs text-muted-foreground">{product.category}</p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            title="Aksi product"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEdit(product)}>
                            <Edit3 className="mr-2 h-4 w-4" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => setDeleting(product)}
                            className="text-destructive"
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Hapus
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-primary">
                      {new Intl.NumberFormat("id-ID", {
                        style: "currency",
                        currency: product.currency || "IDR",
                        maximumFractionDigits: 0,
                      }).format(Number(product.price ?? 0))}
                    </p>
                  </div>
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
        <DialogContent className="max-h-[90vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Produk" : "Tambah Produk"}</DialogTitle>
            <DialogDescription>Lengkapi informasi produk business.</DialogDescription>
          </DialogHeader>
          <form
            className="space-y-5"
            onSubmit={(event) => {
              event.preventDefault();
              if (
                !form.imageUrls[0]?.trim() ||
                !form.name.trim() ||
                !form.category.trim() ||
                !form.description.trim() ||
                !form.currency.trim() ||
                form.price < 1
              ) {
                toast.error("Lengkapi semua kolom produk dengan data yang valid.");
                return;
              }
              saveMutation.mutate();
            }}
          >
            <div className="flex flex-col gap-5 sm:flex-row">
              <ImageUploadField
                label="Foto Produk"
                value={form.imageUrls[0]}
                onChange={(url) => setForm((current) => ({ ...current, imageUrls: [url] }))}
                disabled={saveMutation.isPending}
              />
              <div className="flex-1 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nama Produk</label>
                  <Input
                    value={form.name}
                    onChange={(event) =>
                      setForm((current) => ({ ...current, name: event.target.value }))
                    }
                    placeholder="Masukkan nama produk"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Kategori Produk</label>
                  <ProductCategorySelect
                    value={form.category}
                    onChange={(value) => setForm((current) => ({ ...current, category: value }))}
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Deskripsi Produk</label>
              <Textarea
                value={form.description}
                onChange={(event) =>
                  setForm((current) => ({ ...current, description: event.target.value }))
                }
                rows={3}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-[140px_minmax(0,1fr)]">
              <div className="space-y-2">
                <label className="text-sm font-medium">Mata Uang</label>
                <CurrencySelect
                  value={form.currency}
                  onChange={(value) =>
                    setForm((current) => ({
                      ...current,
                      currency: value,
                    }))
                  }
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Harga</label>
                <BusinessPriceInput
                  value={form.price}
                  onChange={(value) => setForm((current) => ({ ...current, price: value }))}
                  currency={form.currency}
                  disabled={saveMutation.isPending}
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
            <AlertDialogTitle>Hapus Product?</AlertDialogTitle>
            <AlertDialogDescription>
              Product "{deleting?.name}" akan dihapus dari knowledge business.
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
