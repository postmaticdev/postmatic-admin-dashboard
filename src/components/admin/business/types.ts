export interface BusinessAccount {
  id: string;
  name: string;
  logoUrl: string;
  owner: string;
  category: string;
  status: "Paid" | "Free";
  balance: number; // Token balance
  joinedAt: string;
}

export interface InjectHistoryItem {
  id: string;
  businessId: string;
  businessName: string;
  businessLogoUrl: string;
  businessCategory: string;
  totalTokens: number;
  price: number;
  dateTime: string;
  adminName: string;
}

export const initialBusinesses: BusinessAccount[] = [
  {
    id: "b-1",
    name: "TechNova Solutions",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TS&backgroundColor=4f46e5",
    owner: "Adrian Maulana",
    category: "Information Technology",
    status: "Paid",
    balance: 15500000,
    joinedAt: "2024-01-15",
  },
  {
    id: "b-2",
    name: "Aero Logistics",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=AL&backgroundColor=0ea5e9",
    owner: "Dewi Lestari",
    category: "Logistics & Supply Chain",
    status: "Free",
    balance: 250000,
    joinedAt: "2024-02-10",
  },
  {
    id: "b-3",
    name: "Boga Rasa Group",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=BR&backgroundColor=f59e0b",
    owner: "Budi Santoso",
    category: "Food & Beverage",
    status: "Paid",
    balance: 42000000,
    joinedAt: "2024-03-01",
  },
  {
    id: "b-4",
    name: "Klinik Medika Utama",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=KM&backgroundColor=10b981",
    owner: "Dr. Amanda Putri",
    category: "Healthcare",
    status: "Free",
    balance: 750000,
    joinedAt: "2024-03-22",
  },
  {
    id: "b-5",
    name: "Karya Mandiri Furniture",
    logoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=KF&backgroundColor=ec4899",
    owner: "Hendrawan",
    category: "Manufacturing",
    status: "Paid",
    balance: 8900000,
    joinedAt: "2024-04-05",
  },
];
