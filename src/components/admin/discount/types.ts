export type DiscountType = "Percentage" | "Fixed";

export interface VoucherItem {
  id: string;
  name: string;
  code: string;
  startDate: string;
  endDate: string | null; // null if no expiry
  type: DiscountType;
  discountValue: number; // percentage or fixed amount
  minOrder: number;
  maxDiscount: number | null; // null if no max
  status: "Active" | "Inactive";
}

export interface ReferralItem {
  id: string;
  role: "User" | "Admin";
  startDate: string;
  endDate: string | null; // null if no expiry
  type: DiscountType;
  discountValue: number;
  minOrder: number;
  maxDiscount: number | null;
  status: "Active" | "Inactive";
}

export const initialVoucherData: VoucherItem[] = [
  {
    id: "v-1",
    name: "Promo Merdeka",
    code: "MERDEKA78",
    startDate: "2026-08-01",
    endDate: "2026-08-31",
    type: "Percentage",
    discountValue: 17,
    minOrder: 100000,
    maxDiscount: 50000,
    status: "Active",
  },
  {
    id: "v-2",
    name: "Diskon Ongkir",
    code: "FREESHIP",
    startDate: "2026-07-01",
    endDate: null,
    type: "Fixed",
    discountValue: 15000,
    minOrder: 50000,
    maxDiscount: null,
    status: "Active",
  },
];

export const initialReferralData: ReferralItem[] = [
  {
    id: "r-1",
    role: "User",
    startDate: "2026-01-01",
    endDate: null,
    type: "Fixed",
    discountValue: 20000,
    minOrder: 100000,
    maxDiscount: null,
    status: "Active",
  },
  {
    id: "r-2",
    role: "Admin",
    startDate: "2026-05-01",
    endDate: "2026-12-31",
    type: "Percentage",
    discountValue: 10,
    minOrder: 0,
    maxDiscount: 100000,
    status: "Inactive",
  },
];
