import { DocItem } from "../docs-management/types";

export interface LegalityItem {
  id: string;
  title: string;
  menuLabel: string;
  content: string;
  order: number;
  status: "Published" | "Draft";
  updatedAt: string;
  author: string;
  link: string;
}

export type LegalityViewMode = "list" | "create" | "edit";

export const initialLegalityData: LegalityItem[] = [
  {
    id: "legal-1",
    title: "Syarat dan Ketentuan Pengguna",
    menuLabel: "Terms & Conditions",
    order: 1,
    status: "Published",
    updatedAt: "10 Juli 2026",
    author: "Legal Team",
    link: "https://postmatic.id/terms",
    content: `<h1>Syarat dan Ketentuan Pengguna</h1><p>Dengan menggunakan layanan Postmatic, Anda menyetujui syarat dan ketentuan berikut ini.</p>`,
  },
  {
    id: "legal-2",
    title: "Kebijakan Privasi",
    menuLabel: "Privacy Policy",
    order: 2,
    status: "Published",
    updatedAt: "09 Juli 2026",
    author: "Legal Team",
    link: "https://postmatic.id/privacy",
    content: `<h1>Kebijakan Privasi</h1><p>Kami berkomitmen untuk melindungi privasi data pengguna Postmatic.</p>`,
  },
  {
    id: "legal-3",
    title: "Kebijakan Penggunaan yang Diizinkan",
    menuLabel: "Acceptable Use",
    order: 3,
    status: "Draft",
    updatedAt: "05 Juli 2026",
    author: "Legal Team",
    link: "https://postmatic.id/acceptable-use",
    content: `<h1>Kebijakan Penggunaan yang Diizinkan</h1><p>Dokumen ini menjelaskan penggunaan layanan yang diizinkan dan dilarang.</p>`,
  },
];
