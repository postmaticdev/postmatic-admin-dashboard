import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export function SearchBar({
  placeholder = "Search...",
  className,
  value,
  onChange,
}: {
  placeholder?: string;
  className?: string;
  value?: string;
  onChange?: (val: string) => void;
}) {
  return (
    <div className={cn("flex items-center relative w-full max-w-sm", className)}>
      <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      <Input
        type="search"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="pl-8 w-full flex-1"
      />
    </div>
  );
}
