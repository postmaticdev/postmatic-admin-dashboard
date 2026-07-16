export type WithdrawalStatus = "pending" | "approved" | "rejected" | "paid";
export type PaymentMethod = "bank_transfer" | "paypal" | "dana" | "gopay" | "ovo";

export interface TemplateSale {
  templateId: string;
  templateName: string;
  category: string;
  totalSold: number;
  pricePerUnit: number; // in IDR
  creatorShare: number; // percentage e.g. 0.9 = 90%
}

export interface WithdrawalRequest {
  id: string;
  requestedAt: string;
  amount: number; // IDR
  status: WithdrawalStatus;
  paymentMethod: PaymentMethod;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  notes?: string;
}

export interface CreatorItem {
  id: string;
  name: string;
  avatar: string;
  email: string;
  joinedAt: string;
  totalContent: number;
  totalSalesRevenue: number; // IDR total gross sales
  availableBalance: number; // IDR available to withdraw
  totalWithdrawn: number; // IDR total already paid
  pendingWithdrawal: number; // IDR pending
  templateSales: TemplateSale[];
  withdrawalRequests: WithdrawalRequest[];
  paymentMethod: PaymentMethod;
  accountName: string;
  accountNumber: string;
  bankName?: string;
  level: "bronze" | "silver" | "gold" | "platinum";
}

export const MOCK_CREATORS: CreatorItem[] = [
  {
    id: "c001",
    name: "Arief Wirawan",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Arief",
    email: "arief@postmatic.id",
    joinedAt: "2023-04-12",
    totalContent: 47,
    totalSalesRevenue: 12_400_000,
    availableBalance: 3_200_000,
    totalWithdrawn: 8_100_000,
    pendingWithdrawal: 1_100_000,
    paymentMethod: "bank_transfer",
    accountName: "Arief Wirawan",
    accountNumber: "1234567890",
    bankName: "BCA",
    level: "gold",
    templateSales: [
      { templateId: "t001", templateName: "Modern Newsletter Pack", category: "Email", totalSold: 210, pricePerUnit: 29_000, creatorShare: 0.9 },
      { templateId: "t002", templateName: "Social Media Bundle", category: "Social", totalSold: 185, pricePerUnit: 39_000, creatorShare: 0.9 },
      { templateId: "t003", templateName: "Business Proposal Pro", category: "Document", totalSold: 92, pricePerUnit: 59_000, creatorShare: 0.9 },
    ],
    withdrawalRequests: [
      { id: "w001", requestedAt: "2024-07-10", amount: 1_100_000, status: "pending", paymentMethod: "bank_transfer", accountName: "Arief Wirawan", accountNumber: "1234567890", bankName: "BCA" },
      { id: "w002", requestedAt: "2024-06-01", amount: 2_500_000, status: "paid", paymentMethod: "bank_transfer", accountName: "Arief Wirawan", accountNumber: "1234567890", bankName: "BCA" },
    ],
  },
  {
    id: "c002",
    name: "Sinta Maharani",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sinta",
    email: "sinta@postmatic.id",
    joinedAt: "2023-07-22",
    totalContent: 31,
    totalSalesRevenue: 7_850_000,
    availableBalance: 1_950_000,
    totalWithdrawn: 5_200_000,
    pendingWithdrawal: 700_000,
    paymentMethod: "dana",
    accountName: "Sinta Maharani",
    accountNumber: "08123456789",
    level: "silver",
    templateSales: [
      { templateId: "t004", templateName: "Elegant Wedding Invite", category: "Event", totalSold: 155, pricePerUnit: 25_000, creatorShare: 0.9 },
      { templateId: "t005", templateName: "Instagram Story Mega", category: "Social", totalSold: 130, pricePerUnit: 35_000, creatorShare: 0.9 },
    ],
    withdrawalRequests: [
      { id: "w003", requestedAt: "2024-07-08", amount: 700_000, status: "pending", paymentMethod: "dana", accountName: "Sinta Maharani", accountNumber: "08123456789" },
    ],
  },
  {
    id: "c003",
    name: "Dian Pratama",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dian",
    email: "dian@postmatic.id",
    joinedAt: "2022-11-05",
    totalContent: 83,
    totalSalesRevenue: 31_700_000,
    availableBalance: 5_400_000,
    totalWithdrawn: 24_300_000,
    pendingWithdrawal: 2_000_000,
    paymentMethod: "bank_transfer",
    accountName: "Dian Pratama",
    accountNumber: "9876543210",
    bankName: "Mandiri",
    level: "platinum",
    templateSales: [
      { templateId: "t006", templateName: "Corporate Deck Pro", category: "Presentation", totalSold: 420, pricePerUnit: 49_000, creatorShare: 0.9 },
      { templateId: "t007", templateName: "Brand Identity Kit", category: "Branding", totalSold: 305, pricePerUnit: 79_000, creatorShare: 0.9 },
      { templateId: "t008", templateName: "Report Annual 2024", category: "Document", totalSold: 188, pricePerUnit: 59_000, creatorShare: 0.9 },
      { templateId: "t009", templateName: "UI Component Library", category: "Design", totalSold: 140, pricePerUnit: 89_000, creatorShare: 0.9 },
    ],
    withdrawalRequests: [
      { id: "w004", requestedAt: "2024-07-11", amount: 2_000_000, status: "pending", paymentMethod: "bank_transfer", accountName: "Dian Pratama", accountNumber: "9876543210", bankName: "Mandiri" },
      { id: "w005", requestedAt: "2024-05-20", amount: 5_000_000, status: "paid", paymentMethod: "bank_transfer", accountName: "Dian Pratama", accountNumber: "9876543210", bankName: "Mandiri" },
    ],
  },
  {
    id: "c004",
    name: "Reza Fahlevi",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reza",
    email: "reza@postmatic.id",
    joinedAt: "2024-01-15",
    totalContent: 12,
    totalSalesRevenue: 1_200_000,
    availableBalance: 840_000,
    totalWithdrawn: 0,
    pendingWithdrawal: 360_000,
    paymentMethod: "gopay",
    accountName: "Reza Fahlevi",
    accountNumber: "08987654321",
    level: "bronze",
    templateSales: [
      { templateId: "t010", templateName: "Minimalist Resume Kit", category: "Document", totalSold: 48, pricePerUnit: 19_000, creatorShare: 0.9 },
    ],
    withdrawalRequests: [
      { id: "w006", requestedAt: "2024-07-09", amount: 360_000, status: "pending", paymentMethod: "gopay", accountName: "Reza Fahlevi", accountNumber: "08987654321" },
    ],
  },
  {
    id: "c005",
    name: "Laila Qodriyah",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Laila",
    email: "laila@postmatic.id",
    joinedAt: "2023-09-30",
    totalContent: 26,
    totalSalesRevenue: 5_100_000,
    availableBalance: 1_300_000,
    totalWithdrawn: 3_600_000,
    pendingWithdrawal: 200_000,
    paymentMethod: "ovo",
    accountName: "Laila Qodriyah",
    accountNumber: "08111222333",
    level: "silver",
    templateSales: [
      { templateId: "t011", templateName: "Cute Kids Birthday Card", category: "Event", totalSold: 210, pricePerUnit: 15_000, creatorShare: 0.9 },
      { templateId: "t012", templateName: "Food Menu Template", category: "Marketing", totalSold: 95, pricePerUnit: 29_000, creatorShare: 0.9 },
    ],
    withdrawalRequests: [
      { id: "w007", requestedAt: "2024-07-05", amount: 200_000, status: "pending", paymentMethod: "ovo", accountName: "Laila Qodriyah", accountNumber: "08111222333" },
      { id: "w008", requestedAt: "2024-04-10", amount: 1_500_000, status: "paid", paymentMethod: "ovo", accountName: "Laila Qodriyah", accountNumber: "08111222333" },
    ],
  },
  {
    id: "c006",
    name: "Budi Santoso",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
    email: "budi@postmatic.id",
    joinedAt: "2022-06-14",
    totalContent: 58,
    totalSalesRevenue: 18_300_000,
    availableBalance: 4_100_000,
    totalWithdrawn: 13_800_000,
    pendingWithdrawal: 400_000,
    paymentMethod: "bank_transfer",
    accountName: "Budi Santoso",
    accountNumber: "5432109876",
    bankName: "BNI",
    level: "gold",
    templateSales: [
      { templateId: "t013", templateName: "Professional CV Pack", category: "Document", totalSold: 310, pricePerUnit: 25_000, creatorShare: 0.9 },
      { templateId: "t014", templateName: "E-Commerce Product Ads", category: "Marketing", totalSold: 280, pricePerUnit: 35_000, creatorShare: 0.9 },
      { templateId: "t015", templateName: "Tech Startup Deck", category: "Presentation", totalSold: 180, pricePerUnit: 59_000, creatorShare: 0.9 },
    ],
    withdrawalRequests: [
      { id: "w009", requestedAt: "2024-07-12", amount: 400_000, status: "pending", paymentMethod: "bank_transfer", accountName: "Budi Santoso", accountNumber: "5432109876", bankName: "BNI" },
      { id: "w010", requestedAt: "2024-06-15", amount: 3_000_000, status: "paid", paymentMethod: "bank_transfer", accountName: "Budi Santoso", accountNumber: "5432109876", bankName: "BNI" },
    ],
  },
];
