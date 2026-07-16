import { BusinessAccount, initialBusinesses } from "./types";

export interface InjectHistoryItem {
  id: string;
  businessId: string;
  businessName: string;
  businessLogoUrl: string;
  businessCategory: string;
  totalTokens: number;
  price: number; // calculated e.g. Rp 1 per token
  dateTime: string;
  adminName: string;
}

const LOCAL_STORAGE_KEY_BIZ = "postmatic_businesses";
const LOCAL_STORAGE_KEY_HIST = "postmatic_inject_history";

export const getStoredBusinesses = (): BusinessAccount[] => {
  if (typeof window === "undefined") return initialBusinesses;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_BIZ);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return initialBusinesses;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_BIZ, JSON.stringify(initialBusinesses));
  return initialBusinesses;
};

export const setStoredBusinesses = (biz: BusinessAccount[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_BIZ, JSON.stringify(biz));
};

export const getStoredHistory = (): InjectHistoryItem[] => {
  const defaultHistory: InjectHistoryItem[] = [
    {
      id: "h-1",
      businessId: "b-1",
      businessName: "TechNova Solutions",
      businessLogoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=TS&backgroundColor=4f46e5",
      businessCategory: "Information Technology",
      totalTokens: 5000000,
      price: 5000000, // Rp 1 per token
      dateTime: "2026-07-14T14:30:00Z",
      adminName: "Super Admin",
    },
    {
      id: "h-2",
      businessId: "b-3",
      businessName: "Boga Rasa Group",
      businessLogoUrl: "https://api.dicebear.com/7.x/initials/svg?seed=BR&backgroundColor=f59e0b",
      businessCategory: "Food & Beverage",
      totalTokens: 10000000,
      price: 10000000,
      dateTime: "2026-07-15T09:15:00Z",
      adminName: "Adrian Maulana",
    },
  ];
  if (typeof window === "undefined") return defaultHistory;
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY_HIST);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return defaultHistory;
    }
  }
  localStorage.setItem(LOCAL_STORAGE_KEY_HIST, JSON.stringify(defaultHistory));
  return defaultHistory;
};

export const setStoredHistory = (history: InjectHistoryItem[]) => {
  if (typeof window === "undefined") return;
  localStorage.setItem(LOCAL_STORAGE_KEY_HIST, JSON.stringify(history));
};

export const injectTokens = (businessId: string, amount: number, adminName: string): { success: boolean; businessName?: string } => {
  const businesses = getStoredBusinesses();
  const index = businesses.findIndex((b) => b.id === businessId);
  if (index === -1) return { success: false };

  const target = businesses[index];
  target.balance += amount;
  setStoredBusinesses(businesses);

  const history = getStoredHistory();
  const newHistoryItem: InjectHistoryItem = {
    id: `h-${Date.now()}`,
    businessId,
    businessName: target.name,
    businessLogoUrl: target.logoUrl,
    businessCategory: target.category,
    totalTokens: amount,
    price: amount, // Rp 1 per token
    dateTime: new Date().toISOString(),
    adminName,
  };
  setStoredHistory([newHistoryItem, ...history]);

  return { success: true, businessName: target.name };
};
