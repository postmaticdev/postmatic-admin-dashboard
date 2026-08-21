import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import countryCodeData from "@/data/country-codes.json";
import { cn } from "@/lib/utils";

interface CountryCallingCode {
  name: string;
  dial_code: string;
  code: string;
}

interface CountryCodeSelectProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

const countries = countryCodeData as CountryCallingCode[];

function normalizeDialCode(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "+62";
  return trimmed.startsWith("+") ? trimmed : `+${trimmed}`;
}

export function CountryCodeSelect({
  value,
  onValueChange,
  disabled = false,
  className,
}: CountryCodeSelectProps) {
  const [open, setOpen] = useState(false);
  const normalizedValue = normalizeDialCode(value);
  const selectedCountry = useMemo(
    () => countries.find((country) => country.dial_code === normalizedValue),
    [normalizedValue],
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-label="Pilih kode negara"
          aria-expanded={open}
          disabled={disabled}
          className={cn("h-9 w-32 shrink-0 justify-between px-3 font-normal", className)}
        >
          <span className="truncate">{selectedCountry?.dial_code ?? normalizedValue}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-80 max-w-[calc(100vw-2rem)] p-0">
        <Command>
          <CommandInput placeholder="Cari negara..." />
          <CommandList>
            <CommandEmpty>Negara tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {countries.map((country) => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.code} ${country.dial_code}`}
                  onSelect={() => {
                    onValueChange(country.dial_code);
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "h-4 w-4",
                      selectedCountry?.code === country.code ? "opacity-100" : "opacity-0",
                    )}
                  />
                  <span className="min-w-0 flex-1 truncate">{country.name}</span>
                  <span className="shrink-0 text-muted-foreground">({country.dial_code})</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
