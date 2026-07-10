import { useState } from "react";
import { Coins, Sparkles, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatRp } from "@/components/admin/utils";
import type { BusinessRow } from "@/lib/mock/types";

export function InjectTokenModal({
  row,
  onClose,
}: {
  row: BusinessRow | null;
  onClose: () => void;
}) {
  const [amount, setAmount] = useState("");
  const [success, setSuccess] = useState(false);

  if (!row) return null;

  const handleInject = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) return;
    setSuccess(true);
    setTimeout(() => {
      setSuccess(false);
      setAmount("");
      onClose();
    }, 1200);
  };

  const handleClose = () => {
    setSuccess(false);
    setAmount("");
    onClose();
  };

  return (
    <Dialog open={!!row} onOpenChange={(v) => !v && handleClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-amber-500" />
            Inject Token to Business
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-3">
          {/* Business Profile & Balance Card */}
          <div className="flex items-center gap-4 rounded-xl border bg-muted/30 p-4">
            <img
              src={row.logo}
              alt={row.name}
              className="h-14 w-14 rounded-lg bg-muted object-cover shadow-sm"
            />
            <div className="flex-1 overflow-hidden">
              <h4 className="truncate font-semibold text-foreground">{row.name}</h4>
              <p className="text-xs text-muted-foreground">Owner: {row.owner}</p>
              <div className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" />
                <span>Current Balance: {formatRp(row.balance)}</span>
              </div>
            </div>
          </div>

          {/* Token Input Form */}
          <div className="grid gap-2">
            <Label htmlFor="tokenAmount" className="text-sm font-medium">
              Token Amount to Inject
            </Label>
            <div className="relative">
              <Coins className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="tokenAmount"
                type="number"
                placeholder="e.g. 500.000"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="pl-9"
                disabled={success}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Tokens will be added immediately to the business workspace balance.
            </p>
          </div>
        </div>

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={handleClose} disabled={success}>
            Cancel
          </Button>
          <Button onClick={handleInject} disabled={!amount || success} className="min-w-[120px]">
            {success ? (
              <>
                <Check className="mr-2 h-4 w-4" /> Injected!
              </>
            ) : (
              <>
                <Coins className="mr-2 h-4 w-4" /> Inject Token
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
