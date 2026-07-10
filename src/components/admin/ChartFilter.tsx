import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type ChartPeriod = "daily" | "weekly" | "monthly" | "yearly";

const PERIOD_LABELS: Record<ChartPeriod, string> = {
  daily: "Daily",
  weekly: "Weekly",
  monthly: "Monthly",
  yearly: "Yearly",
};

export function ChartFilter({
  value = "monthly",
  onChange,
}: {
  value?: ChartPeriod;
  onChange?: (v: ChartPeriod) => void;
}) {
  return (
    <Select value={value} onValueChange={(v) => onChange?.(v as ChartPeriod)}>
      <SelectTrigger className="h-8 w-[110px] text-xs">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {(Object.keys(PERIOD_LABELS) as ChartPeriod[]).map((p) => (
          <SelectItem key={p} value={p}>
            {PERIOD_LABELS[p]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
