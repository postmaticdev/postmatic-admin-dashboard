import { cn } from "@/lib/utils";

export const BUSINESS_CATEGORY_OPTIONS = [
  "Makanan & Minuman",
  "Ritel & E-commerce",
  "Teknologi & Perangkat Lunak",
  "Kesehatan & Farmasi",
  "Layanan Keuangan & Finansial",
  "Real Estate & Properti",
  "Konstruksi & Infrastruktur",
  "Transportasi & Logistik",
  "Perjalanan & Perhotelan",
  "Energi & Pertambangan",
  "Pendidikan & Pelatihan",
  "Media & Hiburan",
  "Pertanian & Peternakan",
  "Fashion & Pakaian",
  "Konsultasi & Layanan Profesional",
  "Lainnya",
] as const;

export const PRODUCT_CATEGORY_OPTIONS = [
  "Makanan & Minuman",
  "Fashion & Pakaian",
  "Kecantikan & Perawatan Pribadi",
  "Elektronik & Gadget",
  "Rumah & Tempat Tinggal",
  "Kesehatan & Kesejahteraan",
  "Bayi & Anak-anak",
  "Otomotif & Aksesoris",
  "Olahraga & Outdoor",
  "Buku & Alat Tulis",
  "Perhiasan & Aksesoris",
  "Perlengkapan Hewan Peliharaan",
  "Furnitur & Dekorasi",
  "Alat & Perkakas",
  "Produk Digital & Langganan",
  "Lainnya",
] as const;

export const CURRENCY_OPTIONS = [
  "IDR",
  "USD",
  "EUR",
  "GBP",
  "JPY",
  "SGD",
  "MYR",
  "THB",
  "AUD",
  "CAD",
  "CHF",
  "CNY",
  "HKD",
  "KRW",
  "NZD",
  "PHP",
  "VND",
  "INR",
  "BRL",
  "MXN",
] as const;

interface BusinessFormSelectProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  options: readonly string[];
  disabled?: boolean;
  invalid?: boolean;
  className?: string;
}

function BusinessFormSelect({
  id,
  value,
  onChange,
  placeholder,
  options,
  disabled = false,
  invalid = false,
  className,
}: BusinessFormSelectProps) {
  const resolvedOptions = value && !options.includes(value) ? [...options, value] : options;

  return (
    <select
      id={id}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      disabled={disabled}
      aria-invalid={invalid}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50",
        invalid && "border-destructive focus:ring-destructive",
        className,
      )}
    >
      <option value="" disabled hidden>
        {placeholder}
      </option>
      {resolvedOptions.map((option) => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
}

type SharedSelectProps = Omit<BusinessFormSelectProps, "options" | "placeholder"> & {
  placeholder?: string;
};

export function BusinessCategorySelect({
  placeholder = "Pilih kategori bisnis",
  ...props
}: SharedSelectProps) {
  return (
    <BusinessFormSelect {...props} placeholder={placeholder} options={BUSINESS_CATEGORY_OPTIONS} />
  );
}

export function ProductCategorySelect({
  placeholder = "Pilih kategori produk",
  ...props
}: SharedSelectProps) {
  return (
    <BusinessFormSelect {...props} placeholder={placeholder} options={PRODUCT_CATEGORY_OPTIONS} />
  );
}

export function CurrencySelect({ placeholder = "Pilih mata uang", ...props }: SharedSelectProps) {
  return <BusinessFormSelect {...props} placeholder={placeholder} options={CURRENCY_OPTIONS} />;
}
