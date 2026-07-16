export interface UserAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  bio: string;
  avatarUrl: string;
  joinedAt: string;
  status: "Active" | "Inactive" | "Suspended";
  lastActive: string;
  postsCount: number;
  followersCount: number;
}

export interface AdminAccount {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  role: "Super Admin" | "Admin" | "Moderator";
  joinedAt: string;
  status: "Active" | "Inactive";
  lastActive: string;
}

export const initialUsers: UserAccount[] = [
  {
    id: "u-1",
    fullName: "Budi Santoso",
    email: "budi.santoso@email.com",
    phone: "08123456789",
    bio: "Content creator dan fotografer profesional berbasis di Jakarta.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Budi",
    joinedAt: "2024-01-15",
    status: "Active",
    lastActive: "2025-07-14",
    postsCount: 142,
    followersCount: 3200,
  },
  {
    id: "u-2",
    fullName: "Siti Rahayu",
    email: "siti.rahayu@email.com",
    phone: "08234567890",
    bio: "Desainer grafis freelance dan ilustrator.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Siti",
    joinedAt: "2024-02-20",
    status: "Active",
    lastActive: "2025-07-13",
    postsCount: 89,
    followersCount: 1850,
  },
  {
    id: "u-3",
    fullName: "Andi Wijaya",
    email: "andi.wijaya@email.com",
    phone: "08345678901",
    bio: "Pengusaha muda di bidang kuliner dan F&B.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Andi",
    joinedAt: "2024-03-10",
    status: "Inactive",
    lastActive: "2025-05-20",
    postsCount: 23,
    followersCount: 450,
  },
  {
    id: "u-4",
    fullName: "Dewi Lestari",
    email: "dewi.lestari@email.com",
    phone: "08456789012",
    bio: "Travel blogger dan penulis lepas.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Dewi",
    joinedAt: "2024-04-05",
    status: "Active",
    lastActive: "2025-07-15",
    postsCount: 201,
    followersCount: 5600,
  },
  {
    id: "u-5",
    fullName: "Reza Pratama",
    email: "reza.pratama@email.com",
    phone: "08567890123",
    bio: "Digital marketer dan konsultan media sosial.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Reza",
    joinedAt: "2024-05-18",
    status: "Suspended",
    lastActive: "2025-06-01",
    postsCount: 67,
    followersCount: 920,
  },
  {
    id: "u-6",
    fullName: "Fitri Handayani",
    email: "fitri.handayani@email.com",
    phone: "08678901234",
    bio: "Fotografer nature dan wildlife.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Fitri",
    joinedAt: "2024-06-22",
    status: "Active",
    lastActive: "2025-07-12",
    postsCount: 178,
    followersCount: 4100,
  },
  {
    id: "u-7",
    fullName: "Ahmad Fajar",
    email: "ahmad.fajar@email.com",
    phone: "08789012345",
    bio: "Seniman digital dan motion graphic designer.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad",
    joinedAt: "2024-07-30",
    status: "Active",
    lastActive: "2025-07-10",
    postsCount: 55,
    followersCount: 1200,
  },
  {
    id: "u-8",
    fullName: "Maya Sari",
    email: "maya.sari@email.com",
    phone: "08890123456",
    bio: "Beauty influencer dan content creator.",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Maya",
    joinedAt: "2024-08-14",
    status: "Active",
    lastActive: "2025-07-15",
    postsCount: 312,
    followersCount: 12400,
  },
];

export const initialAdmins: AdminAccount[] = [
  {
    id: "a-1",
    fullName: "Hendra Kurniawan",
    email: "hendra.kurniawan@postmatic.id",
    phone: "08111222333",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Hendra",
    role: "Super Admin",
    joinedAt: "2023-01-01",
    status: "Active",
    lastActive: "2025-07-15",
  },
  {
    id: "a-2",
    fullName: "Linda Permata",
    email: "linda.permata@postmatic.id",
    phone: "08222333444",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Linda",
    role: "Admin",
    joinedAt: "2023-03-15",
    status: "Active",
    lastActive: "2025-07-14",
  },
  {
    id: "a-3",
    fullName: "Agus Setiawan",
    email: "agus.setiawan@postmatic.id",
    phone: "08333444555",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Agus",
    role: "Moderator",
    joinedAt: "2023-06-01",
    status: "Active",
    lastActive: "2025-07-13",
  },
  {
    id: "a-4",
    fullName: "Nurul Aisyah",
    email: "nurul.aisyah@postmatic.id",
    phone: "08444555666",
    avatarUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=Nurul",
    role: "Admin",
    joinedAt: "2023-09-20",
    status: "Inactive",
    lastActive: "2025-04-10",
  },
];

export interface RoleItem {
  id: string;
  name: string;
  description: string;
  access: string[]; // e.g., ["Workspace Management", "CRM Blast", "Documentation"]
  dashboardEnabled?: boolean;
  workspaceEnabled?: boolean;
  dashboardPermissions: Record<string, string[]>; // Module -> ["Create", "Read", "Update", "Delete"]
  dashboardSubmenus?: Record<string, string[]>; // Module -> list of submenus
  workspacePermissions: string[]; // List of active workspace modules
}

export const DASHBOARD_MODULES = [
  "Workspace Management",
  "Account Management",
  "Creator Management",
  "Business Management",
  "Financing",
  "Documentation",
  "CRM Blast",
  "Customer Service",
];

export const DASHBOARD_SUBMODULES: Record<string, string[]> = {
  "Workspace Management": ["Discount - Voucher", "Discount - Referral", "AI Model - Image", "AI Model - Text", "Payment", "RSS"],
  "Account Management": ["User", "Admin", "Role Management"],
  "Creator Management": ["Creator", "Gallery"],
  "Business Management": [],
  "Financing": [],
  "Documentation": ["Docs Management", "Legality"],
  "CRM Blast": [],
  "Customer Service": ["All Ticket", "Whatsapp", "Gmail", "Website Report"],
};

export const WORKSPACE_MODULES = [
  "Creator menu",
  "Wajib Share Hasil generate",
  "Watermark when download",
  "Model Postmatic Vision Flash",
  "Model Postmatic Vision",
  "Model Postmatic Vision Pro",
  "Model Postmatic Vision Max",
];

export const initialRoles: RoleItem[] = [
  {
    id: "r-1",
    name: "Super Admin",
    description: "Memiliki kontrol penuh atas semua modul, pengaturan, dan akun platform.",
    access: ["All Modules", "Workspace Management", "Account Management", "Creator Management", "Business Management", "Financing", "Documentation", "CRM Blast", "Customer Service"],
    dashboardEnabled: true,
    workspaceEnabled: true,
    dashboardPermissions: {
      "Discount - Voucher": ["Create", "Read", "Update", "Delete"],
      "Discount - Referral": ["Create", "Read", "Update", "Delete"],
      "AI Model - Image": ["Create", "Read", "Update", "Delete"],
      "AI Model - Text": ["Create", "Read", "Update", "Delete"],
      "Payment": ["Create", "Read", "Update", "Delete"],
      "RSS": ["Create", "Read", "Update", "Delete"],
      "User": ["Create", "Read", "Update", "Delete"],
      "Admin": ["Create", "Read", "Update", "Delete"],
      "Role Management": ["Create", "Read", "Update", "Delete"],
      "Creator": ["Create", "Read", "Update", "Delete"],
      "Gallery": ["Create", "Read", "Update", "Delete"],
      "Business Management": ["Create", "Read", "Update", "Delete"],
      "Financing": ["Create", "Read", "Update", "Delete"],
      "Docs Management": ["Create", "Read", "Update", "Delete"],
      "Legality": ["Create", "Read", "Update", "Delete"],
      "CRM Blast": ["Create", "Read", "Update", "Delete"],
      "All Ticket": ["Create", "Read", "Update", "Delete"],
      "Whatsapp": ["Create", "Read", "Update", "Delete"],
      "Gmail": ["Create", "Read", "Update", "Delete"],
      "Website Report": ["Create", "Read", "Update", "Delete"],
    },
    dashboardSubmenus: {
      "Workspace Management": ["Discount - Voucher", "Discount - Referral", "AI Model - Image", "AI Model - Text", "Payment", "RSS"],
      "Account Management": ["User", "Admin", "Role Management"],
      "Creator Management": ["Creator", "Gallery"],
      "Documentation": ["Docs Management", "Legality"],
      "Customer Service": ["All Ticket", "Whatsapp", "Gmail", "Website Report"],
    },
    workspacePermissions: [
      "Creator menu",
      "Wajib Share Hasil generate",
      "Watermark when download",
      "Model Postmatic Vision Flash",
      "Model Postmatic Vision",
      "Model Postmatic Vision Pro",
      "Model Postmatic Vision Max",
    ],
  },
  {
    id: "r-2",
    name: "Admin",
    description: "Pengelolaan harian platform dan creator kecuali pengaturan utama sistem.",
    access: ["Workspace Management", "Account Management", "Creator Management", "Business Management", "Documentation", "CRM Blast", "Customer Service"],
    dashboardEnabled: true,
    workspaceEnabled: true,
    dashboardPermissions: {
      "Discount - Voucher": ["Create", "Read", "Update"],
      "AI Model - Text": ["Create", "Read", "Update"],
      "Payment": ["Create", "Read", "Update"],
      "User": ["Create", "Read", "Update"],
      "Admin": ["Create", "Read", "Update"],
      "Creator": ["Create", "Read", "Update", "Delete"],
      "Gallery": ["Create", "Read", "Update"],
      "Business Management": ["Create", "Read", "Update"],
      "Docs Management": ["Create", "Read", "Update"],
      "Legality": ["Create", "Read", "Update"],
      "CRM Blast": ["Create", "Read", "Update"],
      "All Ticket": ["Create", "Read", "Update"],
      "Whatsapp": ["Create", "Read", "Update"],
    },
    dashboardSubmenus: {
      "Workspace Management": ["Discount - Voucher", "AI Model - Text", "Payment"],
      "Account Management": ["User", "Admin"],
      "Creator Management": ["Creator", "Gallery"],
      "Documentation": ["Docs Management", "Legality"],
      "Customer Service": ["All Ticket", "Whatsapp"],
    },
    workspacePermissions: [
      "Creator menu",
      "Wajib Share Hasil generate",
      "Model Postmatic Vision Flash",
      "Model Postmatic Vision",
      "Model Postmatic Vision Pro",
    ],
  },
  {
    id: "r-3",
    name: "Moderator",
    description: "Mengawasi postingan creator, gallery, dan merespon customer service.",
    access: ["Creator Management", "Customer Service", "Documentation"],
    dashboardEnabled: true,
    workspaceEnabled: true,
    dashboardPermissions: {
      "Creator": ["Read", "Update"],
      "Gallery": ["Read", "Update"],
      "Legality": ["Read"],
      "All Ticket": ["Read", "Update"],
      "Website Report": ["Read", "Update"],
    },
    dashboardSubmenus: {
      "Creator Management": ["Creator", "Gallery"],
      "Documentation": ["Legality"],
      "Customer Service": ["All Ticket", "Website Report"],
    },
    workspacePermissions: [
      "Creator menu",
      "Watermark when download",
      "Model Postmatic Vision Flash",
      "Model Postmatic Vision",
    ],
  },
  {
    id: "r-4",
    name: "Customer Service",
    description: "Fokus menangani tiket bantuan, website report, dan Whatsapp inbox.",
    access: ["Customer Service"],
    dashboardEnabled: true,
    workspaceEnabled: true,
    dashboardPermissions: {
      "All Ticket": ["Create", "Read", "Update"],
      "Whatsapp": ["Create", "Read", "Update"],
      "Gmail": ["Create", "Read", "Update"],
      "Website Report": ["Create", "Read", "Update"],
    },
    dashboardSubmenus: {
      "Customer Service": ["All Ticket", "Whatsapp", "Gmail", "Website Report"],
    },
    workspacePermissions: [
      "Creator menu",
      "Model Postmatic Vision Flash",
    ],
  },
];
