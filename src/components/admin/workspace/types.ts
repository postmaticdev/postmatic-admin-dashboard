export interface AIModelItem {
  id: string;
  name: string;
  logoUrl: string;
  source: string;
  temperature: number;
  preprompt: string;
  status: "Active" | "Inactive";
}

export type FeeType = "Percentage" | "Fixed";

export interface PaymentMethodItem {
  id: string;
  name: string;
  logoUrl: string;
  adminFeeType: FeeType;
  adminFee: number;
  otherFeeType: FeeType;
  otherFee: number;
  status: "Active" | "Inactive";
}

export interface RSSItem {
  id: string;
  name: string;
  logoUrl: string;
  sourceUrl: string;
  updateInterval: string;
  status: "Active" | "Inactive";
}

export const initialImageModels: AIModelItem[] = [
  {
    id: "img-1",
    name: "DALL·E 3",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/120px-OpenAI_Logo.svg.png",
    source: "OpenAI",
    temperature: 0.8,
    preprompt: "Generate high-quality, detailed images based on the following prompt:",
    status: "Active",
  },
  {
    id: "img-2",
    name: "Stable Diffusion XL",
    logoUrl: "https://avatars.githubusercontent.com/u/100950301?s=200",
    source: "Stability AI",
    temperature: 0.7,
    preprompt: "Create a realistic and artistic image based on:",
    status: "Active",
  },
];

export const initialTextModels: AIModelItem[] = [
  {
    id: "txt-1",
    name: "GPT-4o",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4d/OpenAI_Logo.svg/120px-OpenAI_Logo.svg.png",
    source: "OpenAI",
    temperature: 0.7,
    preprompt: "You are a helpful assistant for Postmatic platform. Answer questions professionally.",
    status: "Active",
  },
  {
    id: "txt-2",
    name: "Claude 3.5 Sonnet",
    logoUrl: "https://anthropic.com/favicon.ico",
    source: "Anthropic",
    temperature: 0.6,
    preprompt: "You are an intelligent assistant. Provide clear and concise responses.",
    status: "Active",
  },
];

export const initialPaymentMethods: PaymentMethodItem[] = [
  {
    id: "pay-1",
    name: "Bank Transfer BCA",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Bank_Central_Asia.svg/120px-Bank_Central_Asia.svg.png",
    adminFeeType: "Fixed",
    adminFee: 2500,
    otherFeeType: "Fixed",
    otherFee: 0,
    status: "Active",
  },
  {
    id: "pay-2",
    name: "GoPay",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/8/86/Gopay_logo.svg/120px-Gopay_logo.svg.png",
    adminFeeType: "Percentage",
    adminFee: 2,
    otherFeeType: "Fixed",
    otherFee: 1500,
    status: "Active",
  },
  {
    id: "pay-3",
    name: "OVO",
    logoUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/eb/Logo_ovo_purple.svg/120px-Logo_ovo_purple.svg.png",
    adminFeeType: "Percentage",
    adminFee: 1.5,
    otherFeeType: "Fixed",
    otherFee: 1500,
    status: "Inactive",
  },
];

export const initialRSSFeeds: RSSItem[] = [
  {
    id: "rss-1",
    name: "TechCrunch",
    logoUrl: "https://techcrunch.com/favicon.ico",
    sourceUrl: "https://techcrunch.com/feed/",
    updateInterval: "30 menit",
    status: "Active",
  },
  {
    id: "rss-2",
    name: "The Verge",
    logoUrl: "https://www.theverge.com/favicon.ico",
    sourceUrl: "https://www.theverge.com/rss/index.xml",
    updateInterval: "1 jam",
    status: "Active",
  },
];
