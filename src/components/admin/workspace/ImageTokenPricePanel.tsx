import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { DollarSign, Loader2 } from "lucide-react";
import { toast } from "sonner";
import {
  getImageTokenProductPrice,
  upsertImageTokenProduct,
} from "@/lib/business-api";

const IMAGE_TOKEN_PRODUCT_QUERY_KEY = [
  "workspace",
  "businesses",
  "image-token-product",
] as const;

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function formatCurrency(amount: number, currency: string) {
  const formattedAmount = amount.toLocaleString("id-ID");
  return currency.toUpperCase() === "IDR"
    ? `Rp ${formattedAmount}`
    : `${currency} ${formattedAmount}`;
}

export function ImageTokenPricePanel() {
  const queryClient = useQueryClient();
  const [priceAmount, setPriceAmount] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");

  const tokenProductQuery = useQuery({
    queryKey: IMAGE_TOKEN_PRODUCT_QUERY_KEY,
    queryFn: getImageTokenProductPrice,
    staleTime: 30_000,
  });

  const tokenProductMutation = useMutation({
    mutationFn: upsertImageTokenProduct,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: IMAGE_TOKEN_PRODUCT_QUERY_KEY });
      toast.success("Harga image token berhasil disimpan.");
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menyimpan harga image token."));
    },
  });

  useEffect(() => {
    const product = tokenProductQuery.data;
    if (!product) return;

    setPriceAmount(String(product.priceAmount ?? product.amount ?? ""));
    setTokenAmount(String(product.tokenAmount ?? ""));
  }, [tokenProductQuery.data]);

  const handleSave = () => {
    const parsedPrice = Number(priceAmount);
    const parsedToken = Number(tokenAmount);

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error("Harga image token wajib lebih dari 0.");
      return;
    }

    if (!Number.isFinite(parsedToken) || parsedToken <= 0) {
      toast.error("Jumlah token wajib lebih dari 0.");
      return;
    }

    tokenProductMutation.mutate({
      type: "image_token",
      currencyCode: "IDR",
      priceAmount: parsedPrice,
      tokenAmount: parsedToken,
    });
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              <DollarSign className="h-3.5 w-3.5" />
              Image Token Price
            </span>
            {tokenProductQuery.isFetching && (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-muted-foreground" />
            )}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Harga jual image token yang dipakai endpoint token product.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Saat ini:{" "}
            <strong className="text-foreground">
              {formatCurrency(
                Number(tokenProductQuery.data?.priceAmount ?? tokenProductQuery.data?.amount ?? 0),
                tokenProductQuery.data?.currencyCode ?? "IDR",
              )}
            </strong>{" "}
            untuk{" "}
            <strong className="text-foreground">
              {Number(tokenProductQuery.data?.tokenAmount ?? 0).toLocaleString("id-ID")} token
            </strong>
          </p>
        </div>

        <div className="grid w-full gap-2 sm:grid-cols-[1fr_1fr_auto] lg:w-auto">
          <input
            type="number"
            min={1}
            value={priceAmount}
            onChange={(event) => setPriceAmount(event.target.value)}
            placeholder="Harga IDR"
            aria-label="Harga image token dalam rupiah"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <input
            type="number"
            min={1}
            value={tokenAmount}
            onChange={(event) => setTokenAmount(event.target.value)}
            placeholder="Jumlah token"
            aria-label="Jumlah image token"
            className="h-10 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
          <button
            type="button"
            onClick={handleSave}
            disabled={tokenProductMutation.isPending || tokenProductQuery.isLoading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-semibold text-primary-foreground hover:bg-primary/90 disabled:pointer-events-none disabled:opacity-60"
          >
            {tokenProductMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <DollarSign className="h-4 w-4" />
            )}
            Save Price
          </button>
        </div>
      </div>

      {tokenProductQuery.isError && (
        <p className="mt-3 text-xs font-medium text-destructive">
          {getErrorMessage(tokenProductQuery.error, "Gagal memuat harga image token.")}
        </p>
      )}
    </div>
  );
}
