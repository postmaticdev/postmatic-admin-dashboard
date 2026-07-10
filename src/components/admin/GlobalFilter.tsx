import { Calendar as CalendarIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function GlobalFilter({
  value,
  onChange,
}: {
  value?: string;
  onChange?: (v: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <Select value={value ?? "monthly"} onValueChange={onChange}>
        <SelectTrigger className="h-9 w-[140px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="daily">Daily</SelectItem>
          <SelectItem value="weekly">Weekly</SelectItem>
          <SelectItem value="monthly">Monthly</SelectItem>
          <SelectItem value="yearly">Yearly</SelectItem>
          <SelectItem value="range">Date Range</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" size="sm" className="h-9 gap-2">
        <CalendarIcon className="h-4 w-4" />
        Jul 1 — Jul 6, 2026
      </Button>
    </div>
  );
}