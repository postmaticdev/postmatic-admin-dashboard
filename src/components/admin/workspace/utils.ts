export const formatNumberString = (value: string | number): string => {
  if (value === null || value === undefined || value === "") return "";
  const numStr = value.toString().replace(/\D/g, "");
  if (!numStr) return "";
  return new Intl.NumberFormat("id-ID").format(Number(numStr));
};

export const parseNumberString = (formattedStr: string): number => {
  const cleanStr = formattedStr.replace(/\./g, "");
  return Number(cleanStr) || 0;
};

export const formatIDR = (value: number): string => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};
