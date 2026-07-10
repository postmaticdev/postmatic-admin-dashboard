import type {
  AdminRow,
  AiModelRow,
  BusinessRow,
  CampaignRow,
  LogRow,
  MessageRow,
  TransactionRow,
  UserRow,
} from "./types";

const avatar = (seed: string) =>
  `https://api.dicebear.com/7.x/notionists/svg?seed=${encodeURIComponent(seed)}&backgroundColor=dbeafe,fef3c7,dcfce7,fce7f3`;

const logo = (seed: string) =>
  `https://api.dicebear.com/7.x/shapes/svg?seed=${encodeURIComponent(seed)}&backgroundColor=2563eb,0ea5e9,10b981,f59e0b`;

export const userGrowthSeries = [
  { label: "Jan", total: 8200 },
  { label: "Feb", total: 8950 },
  { label: "Mar", total: 9420 },
  { label: "Apr", total: 10100 },
  { label: "May", total: 10850 },
  { label: "Jun", total: 11520 },
  { label: "Jul", total: 12100 },
  { label: "Aug", total: 12480 },
  { label: "Sep", total: 12750 },
  { label: "Oct", total: 12980 },
  { label: "Nov", total: 13120 },
  { label: "Dec", total: 12847 },
];

export const businessGrowthSeries = [
  { label: "Jan", paid: 180, free: 95 },
  { label: "Feb", paid: 195, free: 102 },
  { label: "Mar", paid: 210, free: 108 },
  { label: "Apr", paid: 228, free: 115 },
  { label: "May", paid: 245, free: 120 },
  { label: "Jun", paid: 268, free: 128 },
  { label: "Jul", paid: 285, free: 132 },
  { label: "Aug", paid: 298, free: 138 },
  { label: "Sep", paid: 310, free: 142 },
  { label: "Oct", paid: 325, free: 148 },
  { label: "Nov", paid: 335, free: 152 },
  { label: "Dec", paid: 342, free: 156 },
];

export const revenueSeries = [
  { label: "Jan", revenue: 42_500_000, expense: 18_200_000 },
  { label: "Feb", revenue: 51_300_000, expense: 21_400_000 },
  { label: "Mar", revenue: 48_900_000, expense: 19_800_000 },
  { label: "Apr", revenue: 63_700_000, expense: 24_100_000 },
  { label: "May", revenue: 72_400_000, expense: 27_300_000 },
  { label: "Jun", revenue: 68_100_000, expense: 25_900_000 },
  { label: "Jul", revenue: 81_500_000, expense: 29_600_000 },
  { label: "Aug", revenue: 95_200_000, expense: 33_800_000 },
  { label: "Sep", revenue: 88_700_000, expense: 31_200_000 },
  { label: "Oct", revenue: 104_300_000, expense: 36_500_000 },
  { label: "Nov", revenue: 118_900_000, expense: 39_100_000 },
  { label: "Dec", revenue: 132_400_000, expense: 42_700_000 },
];

export const dashboardMetrics = {
  totalRevenue: 189_500_000,
  activeUsers: 12_847,
  activeBusinesses: 342,
  totalGenerated: 4_581_200,
};

export const users: UserRow[] = [
  ["Rifqi Aditya", "rifqi@sinar.co", "Sinar Digital", "Active"],
  ["Nadia Kusuma", "nadia@bloom.id", "Bloom Studio", "Active"],
  ["Bagas Pratama", "bagas@kavana.co", "Kavana Group", "Inactive"],
  ["Sarah Wijaya", "sarah@mavora.id", "Mavora Media", "Active"],
  ["Dimas Ariyanto", "dimas@northpeak.co", "Northpeak", "Active"],
  ["Alya Rahman", "alya@lumina.id", "Lumina Co", "Active"],
  ["Fajar Setiawan", "fajar@haven.id", "Haven Digital", "Inactive"],
  ["Putri Ananda", "putri@zenith.co", "Zenith Labs", "Active"],
  ["Reza Maulana", "reza@apex.id", "Apex Studio", "Active"],
  ["Citra Melati", "citra@harbor.co", "Harbor Media", "Active"],
  ["Yoga Prasetyo", "yoga@drift.id", "Drift Agency", "Active"],
  ["Melisa Halim", "melisa@ember.co", "Ember Group", "Inactive"],
].map(([name, email, business, status], i) => ({
  id: `USR-${String(1001 + i).padStart(4, "0")}`,
  name,
  email,
  phone: `+62 8${String(12 + i).padStart(2, "0")}-${String(1000 + i * 111).slice(0, 4)}-${String(5000 + i * 77).slice(0, 4)}`,
  avatar: avatar(name),
  role: (i % 3 === 0 ? "Creator" : "User") as "User" | "Creator",
  business,
  businessLogo: logo(business),
  businessCategory: ["Digital Agency", "E-Commerce", "Media", "SaaS", "Retail"][i % 5],
  status: status as "Active" | "Inactive",
  joinDate: `2024-${String(((i * 3) % 12) + 1).padStart(2, "0")}-${String(((i * 7) % 27) + 1).padStart(2, "0")}`,
  lastLogin: `2026-07-0${(i % 6) + 1} ${String((i * 4) % 24).padStart(2, "0")}:${String((i * 11) % 60).padStart(2, "0")}`,
  balance: (i + 1) * 125_000 + 50_000,
  businesses: [business, i % 2 === 0 ? "Postmatic Pro" : "Freelance"],
  topups: [
    { id: `TX-${i}1`, date: "2026-06-15", amount: 500_000, method: "GoPay" },
    { id: `TX-${i}2`, date: "2026-05-02", amount: 250_000, method: "BCA VA" },
  ],
  aiUsage: [
    { id: `AI-${i}1`, model: "Postmatic Copy v2", tokens: 12_450, date: "2026-07-01" },
    { id: `AI-${i}2`, model: "Caption Generator", tokens: 8_120, date: "2026-06-28" },
  ],
  devices: [
    { ip: `114.10.${20 + i}.${45 + i}`, device: "Chrome · macOS", lastSeen: "2026-07-06 09:12" },
    { ip: `36.72.${i}.${100 - i}`, device: "Safari · iOS", lastSeen: "2026-07-05 21:44" },
  ],
  activityLog: [
    { id: `AL-${i}1`, action: "Login dari Chrome · macOS", at: "2026-07-06 09:12" },
    { id: `AL-${i}2`, action: "Generate caption via Postmatic Copy", at: "2026-07-05 14:30" },
    { id: `AL-${i}3`, action: "Top up saldo Rp 500.000", at: "2026-06-15 10:00" },
  ],
}));

export const admins: AdminRow[] = [
  ["Andini Prameswari", "andini@postmatic.id", "Super Admin"],
  ["Bramantyo Wicaksana", "bram@postmatic.id", "Finance"],
  ["Clara Wibisono", "clara@postmatic.id", "Customer Support"],
  ["Dendi Kurniawan", "dendi@postmatic.id", "Content"],
  ["Erika Salim", "erika@postmatic.id", "Customer Support"],
  ["Fikri Ramadhan", "fikri@postmatic.id", "Finance"],
].map(([name, email, role], i) => ({
  id: `ADM-${String(201 + i).padStart(4, "0")}`,
  name,
  email,
  phone: `+62 8${String(15 + i).padStart(2, "0")}-${String(2000 + i * 99).slice(0, 4)}-${String(3000 + i * 55).slice(0, 4)}`,
  avatar: avatar(name),
  role: role as AdminRow["role"],
  status: (i === 4 ? "Inactive" : "Active") as "Active" | "Inactive",
  joinDate: `2023-${String((i % 12) + 1).padStart(2, "0")}-12`,
  lastLogin: `2026-07-06 ${String(8 + i).padStart(2, "0")}:${String(10 + i * 3).padStart(2, "0")}`,
  auditLog: [
    { id: `L-${i}1`, action: "Update user status", module: "User Management", timestamp: "2026-07-06 10:12" },
    { id: `L-${i}2`, action: "Approve topup TX-9821", module: "Financing", timestamp: "2026-07-05 16:44" },
    { id: `L-${i}3`, action: "Reply chat WA #4519", module: "Feedback", timestamp: "2026-07-05 11:20" },
  ],
  devices: [
    { ip: `202.152.${i}.${88 + i}`, device: "Chrome · Windows", lastSeen: "2026-07-06 09:00" },
  ],
}));

export const businesses: BusinessRow[] = [
  ["Sinar Digital", "Rifqi Aditya", "Pro"],
  ["Bloom Studio", "Nadia Kusuma", "Enterprise"],
  ["Kavana Group", "Bagas Pratama", "Starter"],
  ["Mavora Media", "Sarah Wijaya", "Pro"],
  ["Northpeak", "Dimas Ariyanto", "Free"],
  ["Lumina Co", "Alya Rahman", "Pro"],
  ["Zenith Labs", "Putri Ananda", "Enterprise"],
  ["Apex Studio", "Reza Maulana", "Starter"],
].map(([name, owner, plan], i) => ({
  id: `BIZ-${String(501 + i).padStart(4, "0")}`,
  name,
  logo: logo(name),
  owner,
  category: ["Digital Agency", "E-Commerce", "Media", "SaaS", "Retail", "F&B", "Fashion", "Education"][i % 8],
  plan: plan as BusinessRow["plan"],
  balance: (i + 2) * 1_250_000,
  lastLogin: `2026-07-0${(i % 6) + 1} 14:${String(10 + i * 4).padStart(2, "0")}`,
  activeUsers: 3 + (i % 5) * 2,
  platforms: (
    i % 3 === 0 ? ["instagram", "facebook", "linkedin"] :
    i % 3 === 1 ? ["instagram", "facebook"] :
    ["instagram"]
  ) as BusinessRow["platforms"],
  products: Array.from({ length: 2 + (i % 2) }, (_, p) => ({
    id: `PRD-${i}${p}`,
    name: ["Paket Pro", "Konsultasi Brand", "Template Bundle", "Workshop"][p % 4],
    price: (p + 1) * 250_000 + i * 50_000,
    image: logo(`${name}-product-${p}`),
  })),
  members: Array.from({ length: 3 + (i % 3) }, (_, m) => ({
    id: `M-${i}${m}`,
    name: ["Rina", "Bagas", "Tono", "Yuni", "Fajar"][m % 5] + " " + ["S.", "P.", "W.", "R."][m % 4],
    role: ["Owner", "Editor", "Viewer", "Editor"][m % 4],
    avatar: avatar(name + m),
  })),
  transactions: Array.from({ length: 3 }, (_, t) => ({
    id: `BTX-${i}${t}`,
    datetime: `2026-07-0${(t % 5) + 1} ${String(10 + t).padStart(2, "0")}:30`,
    description: t % 2 === 0 ? `Top up ${(t + 1) * 100} Token` : "Pembelian paket Pro",
    amount: (t + 1) * 150_000,
    status: (["Success", "Pending", "Success"] as const)[t % 3],
  })),
  aiStats: { totalRequests: (i + 1) * 1420, totalTokens: (i + 1) * 384_000 },
}));

export const transactions: TransactionRow[] = Array.from({ length: 14 }, (_, i) => {
  const isIncome = i % 3 !== 0;
  const statuses: TransactionRow["status"][] = ["Success", "Pending", "Failed", "Success", "Success"];
  const user = users[i % users.length];
  return {
    id: `TRX-${String(98210 + i)}`,
    datetime: `2026-07-0${(i % 6) + 1} ${String(9 + (i % 10)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
    description: isIncome
      ? `Top up ${(i + 1) * 100} Token`
      : ["Payout affiliate", "Server hosting", "Ads campaign"][i % 3],
    type: (isIncome ? "Income" : "Expense") as "Income" | "Expense",
    amount: (isIncome ? 1 : -1) * ((i + 1) * 150_000 + 25_000),
    method: ["GoPay", "BCA VA", "OVO", "Manual Transfer", "Credit Card"][i % 5],
    status: statuses[i % statuses.length],
    userName: user.name,
    userId: user.id,
    auditTrail: [
      { at: "2026-07-01 09:12", from: "-", to: "Pending", by: "System" },
      { at: "2026-07-01 09:20", from: "Pending", to: "Success", by: "Bramantyo W." },
    ],
  };
});

const messageSeeds: Array<[MessageRow["channel"], string, string, boolean]> = [
  ["Email", "Nadia Kusuma", "Kendala login setelah top up", true],
  ["Email", "Yudha Prawira", "Permintaan invoice bulan Juni", false],
  ["Chat", "+62 812-3344-5566", "Halo, mau tanya harga paket Pro", true],
  ["Chat", "+62 878-9911-2233", "Terima kasih responsnya!", false],
  ["Chat", "+62 813-2200-1188", "Fitur schedule kok error ya?", true],
  ["Report", "Rifqi Aditya", "Bug: caption tidak tersimpan", true],
  ["Email", "Melisa Halim", "Cara upgrade plan?", true],
];

export const messages: MessageRow[] = messageSeeds.map(([channel, contact, subject, unread], i) => {
  let thread: MessageRow["thread"] = [
    { id: `t${i}1`, from: "them" as const, body: "Halo tim Postmatic, saya butuh bantuan terkait akun.", at: "2026-07-05 09:12" },
    { id: `t${i}2`, from: "us" as const, body: "Halo, dengan Clara dari Postmatic. Boleh dijelaskan lebih lanjut?", at: "2026-07-05 09:20" },
    { id: `t${i}3`, from: "them" as const, body: "Setelah top up saldo saya tidak bertambah, sudah 15 menit.", at: "2026-07-05 09:25" },
    { id: `t${i}4`, from: "us" as const, body: "Baik, sedang saya cek transaksinya ya. Mohon ditunggu.", at: "2026-07-05 09:28" },
  ];

  if (contact === "Nadia Kusuma") {
    thread = [
      {
        id: `t${i}1`,
        from: "them" as const,
        body: "Halo Postmatic,\n\nSaya telah melakukan top up saldo senilai Rp150.000 menggunakan metode transfer bank pada pukul 14:00 hari ini. Namun, hingga sekarang saldo di dashboard saya belum terupdate dan masih menunjukkan nominal Rp0.\n\nSaya sudah melampirkan bukti transfer ATM BCA saya di bawah ini. Mohon bantuannya untuk memproses saldo saya secara manual agar saya bisa melanjutkan pembuatan campaign blast.\n\nTerima kasih,\nNadia Kusuma",
        at: "2026-07-08 14:15",
        attachments: [
          {
            id: "att-01",
            name: "bukti_transfer_bca.jpg",
            type: "image" as const,
            url: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60"
          }
        ]
      }
    ];
  } else if (contact === "Rifqi Aditya") {
    thread = [
      {
        id: `t${i}1`,
        from: "them" as const,
        body: "Halo tim Technical Support,\n\nSaya ingin melaporkan kendala pada halaman editor workspace. Setiap kali saya menuliskan caption untuk AI Model baru lalu menekan tombol simpan, caption/prompt preprocessing tersebut tidak tersimpan dan kembali kosong saat halaman direfresh.\n\nBug ini sangat mengganggu karena saya harus mengetik ulang system prompt berulang kali. Saya lampirkan tangkapan layar konsol log error yang terjadi saat tombol simpan diklik.\n\nMohon bantuannya untuk diperiksa,\nRifqi",
        at: "2026-07-08 10:30",
        attachments: [
          {
            id: "att-02",
            name: "console_error_log.png",
            type: "image" as const,
            url: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=60"
          }
        ]
      }
    ];
  } else if (contact === "Melisa Halim") {
    thread = [
      {
        id: `t${i}1`,
        from: "them" as const,
        body: "Sore admin Postmatic,\n\nSaat ini perusahaan kami menggunakan plan Trial dan ingin melakukan upgrade ke plan Paid/Enterprise untuk menambah kuota blast bulanan.\n\nApakah ada diskon promo khusus untuk upgrade plan tahunan? Dan bagaimana cara pengajuan invoice pajaknya?\n\nMelisa - Head of Marketing",
        at: "2026-07-07 16:45",
        attachments: [
          {
            id: "att-03",
            name: "company_profile_upgrade.pdf",
            type: "document" as const,
            url: "https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=150&auto=format&fit=crop&q=60"
          }
        ]
      }
    ];
  }

  return {
    id: `MSG-${1000 + i}`,
    channel,
    contact,
    contactEmail: channel === "Email" ? `${contact.toLowerCase().replace(/ /g, ".")}@email.com` : undefined,
    contactAvatar: avatar(contact),
    subject,
    preview: thread[0]?.body.substring(0, 80) + "...",
    unread,
    starred: i % 4 === 0,
    folder: "inbox" as const,
    priority: (["Low", "Medium", "High"] as const)[i % 3],
    reportStatus: channel === "Report" ? (unread ? "Open" : "In Progress") as "Open" | "In Progress" : undefined,
    at: thread[thread.length - 1]?.at || "2026-07-08 12:00",
    thread,
  };
});

export const campaigns: CampaignRow[] = [
  { id: "CMP-001", name: "Promo Paket Pro Juli", platform: "WhatsApp", targetAudience: "All Active Users", status: "Sent", date: "2026-07-01 10:00" },
  { id: "CMP-002", name: "Newsletter Fitur Baru", platform: "Gmail", targetAudience: "By Business — Enterprise", status: "Sent", date: "2026-06-28 14:30" },
  { id: "CMP-003", name: "Reminder Top Up Saldo", platform: "WhatsApp", targetAudience: "Active Users", status: "Draft", date: "2026-07-06 09:00" },
  { id: "CMP-004", name: "Onboarding Creator Baru", platform: "Gmail", targetAudience: "Import Contacts (248)", status: "Scheduled", date: "2026-07-08 08:00" },
  { id: "CMP-005", name: "Flash Sale Token Weekend", platform: "WhatsApp", targetAudience: "By Business — Free Plan", status: "Sent", date: "2026-06-22 18:00" },
];

export const aiModels: AiModelRow[] = [
  {
    id: "AIM-01",
    name: "Postmatic Copy",
    category: "Caption",
    provider: "OpenAI",
    version: "gpt-4o-mini",
    description: "Generator copywriting caption sosial media berbasis brand voice.",
    active: true,
    systemPrompt:
      "Kamu adalah copywriter Postmatic. Tulis caption Instagram yang engaging, 3 kalimat maksimum, gunakan bahasa Indonesia yang ramah dan profesional.",
    temperature: 0.7,
    topP: 0.9,
    maxTokens: 800,
    requests: 128_450,
    errors: [
      { id: "e1", at: "2026-07-05 12:14", message: "Rate limit exceeded (429)" },
      { id: "e2", at: "2026-07-04 08:02", message: "Timeout after 30s" },
    ],
  },
  {
    id: "AIM-02",
    name: "Caption Vision",
    category: "Image",
    provider: "Google",
    version: "gemini-1.5-pro",
    description: "Menganalisis gambar produk dan menghasilkan caption deskriptif.",
    active: true,
    systemPrompt: "Analyze the product image and generate a marketing-ready caption.",
    temperature: 0.5,
    topP: 0.95,
    maxTokens: 1024,
    requests: 62_180,
    errors: [],
  },
  {
    id: "AIM-03",
    name: "Hashtag Miner",
    category: "Caption",
    provider: "Anthropic",
    version: "claude-3-haiku",
    description: "Ekstraksi hashtag relevan berdasarkan niche & audience.",
    active: false,
    systemPrompt: "Extract 15 relevant hashtags for the given post context.",
    temperature: 0.3,
    topP: 0.8,
    maxTokens: 400,
    requests: 24_920,
    errors: [{ id: "e1", at: "2026-07-03 22:00", message: "Deactivated by admin" }],
  },
  {
    id: "AIM-04",
    name: "Reply Assistant",
    category: "Caption",
    provider: "OpenAI",
    version: "gpt-4o",
    description: "Draft balasan komentar dan DM secara otomatis.",
    active: true,
    systemPrompt: "You are a friendly reply assistant for Instagram DMs and comments.",
    temperature: 0.6,
    topP: 0.9,
    maxTokens: 512,
    requests: 94_600,
    errors: [],
  },
  {
    id: "AIM-05",
    name: "Trend Radar",
    category: "Image",
    provider: "Google",
    version: "gemini-1.5-flash",
    description: "Deteksi tren konten viral berbasis lokasi dan niche.",
    active: false,
    systemPrompt: "Detect trending content ideas.",
    temperature: 0.8,
    topP: 1,
    maxTokens: 2048,
    requests: 12_400,
    errors: [],
  },
  {
    id: "AIM-06",
    name: "Brand Voice",
    category: "Caption",
    provider: "OpenAI",
    version: "gpt-4o-mini",
    description: "Menyelaraskan output copy dengan brand voice bisnis.",
    active: true,
    systemPrompt: "Rewrite copy to match brand voice.",
    temperature: 0.4,
    topP: 0.85,
    maxTokens: 700,
    requests: 41_300,
    errors: [],
  },
];

export const logs: LogRow[] = Array.from({ length: 18 }, (_, i) => {
  const actor = admins[i % admins.length];
  const actions: LogRow["action"][] = ["Login", "Update", "Delete", "Create", "Approve"];
  const modules = ["User Management", "Financing", "AI Model", "Feedback", "Settings"];
  const action = actions[i % actions.length];
  return {
    id: `LOG-${5000 + i}`,
    at: `2026-07-0${(i % 6) + 1} ${String(8 + (i % 12)).padStart(2, "0")}:${String((i * 13) % 60).padStart(2, "0")}`,
    actor: actor.name,
    actorAvatar: actor.avatar,
    action,
    module: modules[i % modules.length],
    ip: `202.152.${i}.${88 + i}`,
    status: (i % 7 === 0 ? "Failed" : "Success") as "Success" | "Failed",
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0 Safari/537.36",
    location: ["Jakarta, ID", "Bandung, ID", "Surabaya, ID", "Denpasar, ID"][i % 4],
    oldData:
      action === "Update"
        ? { status: "Inactive", plan: "Free", balance: 250_000 }
        : null,
    newData:
      action === "Update"
        ? { status: "Active", plan: "Pro", balance: 500_000 }
        : action === "Create"
          ? { id: `USR-${2000 + i}`, name: "New User", status: "Active" }
          : null,
  };
});