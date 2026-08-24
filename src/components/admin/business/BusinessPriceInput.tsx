import { Input } from "@/components/ui/input";

interface BusinessPriceInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  currency?: string;
  placeholder?: string;
  disabled?: boolean;
  invalid?: boolean;
}

const MAX_PRICE = 999_999_999_999;
const priceFormatter = new Intl.NumberFormat("id-ID", {
  maximumFractionDigits: 0,
});

export function BusinessPriceInput({
  id,
  value,
  onChange,
  currency = "IDR",
  placeholder = "Masukkan harga produk",
  disabled = false,
  invalid = false,
}: BusinessPriceInputProps) {
  const displayValue = value > 0 ? priceFormatter.format(value) : "";

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      pattern="[0-9.]*"
      value={displayValue}
      onChange={(event) => {
        const digits = event.target.value.replace(/\D/g, "");
        if (!digits) {
          onChange(0);
          return;
        }

        const numericValue = Number(digits);
        if (Number.isSafeInteger(numericValue) && numericValue <= MAX_PRICE) {
          onChange(numericValue);
        }
      }}
      onKeyDown={(event) => {
        if (event.ctrlKey || event.metaKey || event.altKey) return;
        if (event.key.length === 1 && !/\d/.test(event.key)) event.preventDefault();
      }}
      placeholder={placeholder}
      disabled={disabled}
      aria-label={`Harga dalam ${currency}`}
      aria-invalid={invalid}
      className={invalid ? "border-destructive focus-visible:ring-destructive" : undefined}
    />
  );
}
