import type { AppNotification } from "@/lib/types/notification";

const now = Date.now();
const ago = (m: number) => new Date(now - m * 60_000).toISOString();

export const MOCK_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n1",
    title: "Pesan WhatsApp baru",
    snippet: "Andi Pratama menanyakan paket enterprise",
    source: "whatsapp",
    ticketId: "t-wa-1",
    createdAt: ago(5),
    read: false,
  },
  {
    id: "n2",
    title: "Email masuk dari Michael Chen",
    snippet: "Integration with Zapier - Technical question",
    source: "gmail",
    ticketId: "t-gm-1",
    createdAt: ago(45),
    read: false,
  },
  {
    id: "n3",
    title: "Laporan bug baru",
    snippet: "Dashboard chart not rendering on Safari",
    source: "website",
    ticketId: "t-web-1",
    createdAt: ago(90),
    read: false,
  },
  {
    id: "n4",
    title: "Refund diproses",
    snippet: "Sarah Williams — duplicate charge",
    source: "gmail",
    ticketId: "t-gm-2",
    createdAt: ago(360),
    read: true,
  },
  {
    id: "n5",
    title: "Feedback baru",
    snippet: "Priya Iyer memberi masukan onboarding",
    source: "website",
    ticketId: "t-web-3",
    createdAt: ago(300),
    read: true,
  },
];
