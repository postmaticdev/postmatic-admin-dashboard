export type CreatorAccountStatus = "Active" | "Inactive" | "Suspended";
export type CreatorRequestStatus = "pending" | "approved" | "rejected";

export interface CreatorAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  joinedAt: string;
  status: CreatorAccountStatus;
  lastActive: string;
  balance: number; // IDR
  totalContent: number;
  followersCount: number;
  specialization: string;
}

export interface CreatorRequest {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  specialization: string;
  portfolio: string;
  requestedAt: string;
  status: CreatorRequestStatus;
  note?: string;
}

export const INITIAL_CREATOR_ACCOUNTS: CreatorAccount[] = [
  {
    id: "ca-1",
    fullName: "Arief Wirawan",
    email: "arief.wirawan@postmatic.id",
    phone: "08123456789",
    bio: "Desainer template profesional dengan spesialisasi di email marketing dan presentasi bisnis.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ArW",
    joinedAt: "2023-04-12",
    status: "Active",
    lastActive: "2025-07-14",
    balance: 3_200_000,
    totalContent: 47,
    followersCount: 4200,
    specialization: "Email & Presentasi",
  },
  {
    id: "ca-2",
    fullName: "Sinta Maharani",
    email: "sinta.maharani@postmatic.id",
    phone: "08234567890",
    bio: "Kreator konten visual untuk media sosial dan event design.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SiM",
    joinedAt: "2023-07-22",
    status: "Active",
    lastActive: "2025-07-13",
    balance: 1_950_000,
    totalContent: 31,
    followersCount: 2800,
    specialization: "Social Media",
  },
  {
    id: "ca-3",
    fullName: "Dian Pratama",
    email: "dian.pratama@postmatic.id",
    phone: "08345678901",
    bio: "Brand identity dan corporate design specialist. Platinum creator Postmatic.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DiP",
    joinedAt: "2022-11-05",
    status: "Active",
    lastActive: "2025-07-15",
    balance: 5_400_000,
    totalContent: 83,
    followersCount: 9100,
    specialization: "Branding & Corporate",
  },
  {
    id: "ca-4",
    fullName: "Reza Fahlevi",
    email: "reza.fahlevi@postmatic.id",
    phone: "08456789012",
    bio: "Desainer resume dan dokumen profesional.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=ReF",
    joinedAt: "2024-01-15",
    status: "Active",
    lastActive: "2025-07-10",
    balance: 840_000,
    totalContent: 12,
    followersCount: 650,
    specialization: "Dokumen & Resume",
  },
  {
    id: "ca-5",
    fullName: "Laila Qodriyah",
    email: "laila.qodriyah@postmatic.id",
    phone: "08567890123",
    bio: "Desainer kreatif untuk event card, undangan, dan menu restoran.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LaQ",
    joinedAt: "2023-09-30",
    status: "Inactive",
    lastActive: "2025-06-20",
    balance: 1_300_000,
    totalContent: 26,
    followersCount: 1500,
    specialization: "Event & F&B",
  },
  {
    id: "ca-6",
    fullName: "Budi Santoso",
    email: "budi.santoso@postmatic.id",
    phone: "08678901234",
    bio: "Gold creator spesialisasi template CV, iklan produk, dan pitch deck startup.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=BuS",
    joinedAt: "2022-06-14",
    status: "Suspended",
    lastActive: "2025-05-01",
    balance: 4_100_000,
    totalContent: 58,
    followersCount: 5400,
    specialization: "Marketing & Startup",
  },
];

export const INITIAL_CREATOR_REQUESTS: CreatorRequest[] = [
  {
    id: "cr-1",
    fullName: "Hendra Kusuma",
    email: "hendra.kusuma@gmail.com",
    phone: "08987654321",
    bio: "Desainer UI/UX dengan 5 tahun pengalaman di startup teknologi.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=HeK",
    specialization: "UI/UX Design",
    portfolio: "https://hendrakusuma.design",
    requestedAt: "2025-07-14",
    status: "pending",
  },
  {
    id: "cr-2",
    fullName: "Maya Putri",
    email: "maya.putri@gmail.com",
    phone: "08876543210",
    bio: "Illustrator digital dan content creator dengan pengikut 50k+ di Instagram.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MaP",
    specialization: "Illustrasi Digital",
    portfolio: "https://behance.net/mayaputri",
    requestedAt: "2025-07-13",
    status: "pending",
  },
  {
    id: "cr-3",
    fullName: "Fahmi Ramadhan",
    email: "fahmi.ramadhan@gmail.com",
    phone: "08765432109",
    bio: "Motion graphic designer dan video editor freelance.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=FaR",
    specialization: "Motion & Video",
    portfolio: "https://vimeo.com/fahmiramadhan",
    requestedAt: "2025-07-12",
    status: "pending",
  },
  {
    id: "cr-4",
    fullName: "Dewi Anggraini",
    email: "dewi.anggraini@gmail.com",
    phone: "08654321098",
    bio: "Fotografer komersial dan wedding photographer professional.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=DeA",
    specialization: "Fotografi",
    portfolio: "https://dewianggraini.photo",
    requestedAt: "2025-07-11",
    status: "pending",
  },
];
