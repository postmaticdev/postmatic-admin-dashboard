import { cn } from "@/lib/utils";

type Variant =
  | "Active"
  | "Inactive"
  | "Success"
  | "Pending"
  | "Failed"
  | "Income"
  | "Expense"
  | "Read"
  | "Unread";

const map: Record<Variant, string> = {
  Active: "bg-success/10 text-success ring-success/20",
  Success: "bg-success/10 text-success ring-success/20",
  Income: "bg-success/10 text-success ring-success/20",
  Inactive: "bg-muted text-muted-foreground ring-border",
  Read: "bg-muted text-muted-foreground ring-border",
  Pending: "bg-warning/10 text-warning ring-warning/20",
  Failed: "bg-destructive/10 text-destructive ring-destructive/20",
  Expense: "bg-destructive/10 text-destructive ring-destructive/20",
  Unread: "bg-primary/10 text-primary ring-primary/20",
};

export function StatusBadge({ status }: { status: Variant | string }) {
  const cls = map[status as Variant] ?? "bg-muted text-muted-foreground ring-border";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
        cls,
      )}
    >
      {status}
    </span>
  );
}