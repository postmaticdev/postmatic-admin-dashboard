import { Coins, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ActionMenu({
  onEdit,
  onAddToken,
}: {
  onEdit?: () => void;
  onAddToken?: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      {onAddToken && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-amber-500"
          onClick={(e) => {
            e.stopPropagation();
            onAddToken?.();
          }}
          aria-label="Add Token"
        >
          <Coins className="h-4 w-4 text-amber-500" />
        </Button>
      )}
      {onEdit && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-primary"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.();
          }}
          aria-label="Edit"
        >
          <Pencil className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}