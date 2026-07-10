import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Percent,
  CreditCard,
  Coins,
  Settings,
  Plus,
  Trash2,
  Pencil,
  Edit3,
  Rss,
  AlertTriangle,
  FolderHeart,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Scorecard, ScorecardGrid } from "@/components/admin/Scorecard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { toast } from "sonner";
import { formatRp } from "@/components/admin/utils";
import { aiModels } from "@/lib/mock/data";
import { DetailModal } from "@/components/admin/DetailModal";
import { AiModelCard } from "@/components/admin/ai-model/AiModelCard";
import { Slider } from "@/components/ui/slider";
import type { AiModelRow } from "@/lib/mock/types";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ReferenceDesign {
  id: string;
  name: string;
  imageUrl: string;
  tags: string[];
  category: string;
  price: number;
}

export const Route = createFileRoute("/_admin/workspace")({
  head: () => ({
    meta: [
      { title: "Workspace Management — Postmatic Admin" },
      { name: "description", content: "Kelola konfigurasi platform Postmatic: promo, pembayaran, dan harga token." },
    ],
  }),
  component: WorkspaceManagementPage,
});

interface PromoCode {
  id: string;
  code: string;
  type: "Nominal" | "Percentage";
  value: number;
  maxUsage: number;
  currentUsage: number;
  status: "Active" | "Expired";
  expiryDate: string;
}

interface PaymentMethod {
  id: string;
  name: string;
  provider: string;
  feeType: "Nominal" | "Percentage";
  feeValue: number;
  taxPercent: number; // Pajak
  adminFee: number;   // Admin
  active: boolean;
  type: "Bank" | "E-Wallet" | "QRIS" | "Card";
}

interface RssSource {
  id: string;
  name: string;
  url: string;
  category: string;
  active: boolean;
  lastFetched: string;
  intervalMinutes: number;
}

const getLogoUrl = (name: string, type: string) => {
  const n = name.toLowerCase();
  if (n.includes("mandiri")) return "https://upload.wikimedia.org/wikipedia/commons/a/ad/Bank_Mandiri_logo_2016.svg";
  if (n.includes("bca")) return "https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg";
  if (n.includes("qris")) return "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg";
  if (n.includes("gopay")) return "https://upload.wikimedia.org/wikipedia/commons/8/86/Gopay_logo.svg";
  if (n.includes("credit card") || n.includes("visa") || n.includes("master")) {
    return "https://upload.wikimedia.org/wikipedia/commons/5/5e/Visa_2021.svg";
  }
  // generic placeholders based on type
  if (type === "Bank") return "https://api.dicebear.com/7.x/shapes/svg?seed=bank&backgroundColor=2563eb";
  if (type === "E-Wallet") return "https://api.dicebear.com/7.x/shapes/svg?seed=wallet&backgroundColor=0ea5e9";
  if (type === "QRIS") return "https://upload.wikimedia.org/wikipedia/commons/a/a2/Logo_QRIS.svg";
  return "https://api.dicebear.com/7.x/shapes/svg?seed=card&backgroundColor=10b981";
};

function WorkspaceManagementPage() {
  const [activeTab, setActiveTab] = useState(() => {
    if (typeof window !== "undefined") {
      return new URLSearchParams(window.location.search).get("tab") || "promo";
    }
    return "promo";
  });

  const handleTabChange = (val: string) => {
    setActiveTab(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", val);
      window.history.replaceState(null, "", url.toString());
    }
  };

  // Promo Codes State
  const [promos, setPromos] = useState<PromoCode[]>([
    { id: "1", code: "POSTMATIC10", type: "Percentage", value: 10, maxUsage: 100, currentUsage: 45, status: "Active", expiryDate: "2026-12-31" },
    { id: "2", code: "MERDEKA50K", type: "Nominal", value: 50000, maxUsage: 500, currentUsage: 312, status: "Active", expiryDate: "2026-08-17" },
    { id: "3", code: "LAUNCHPROMO", type: "Percentage", value: 15, maxUsage: 50, currentUsage: 50, status: "Expired", expiryDate: "2026-01-01" },
  ]);
  const [promoModalOpen, setPromoModalOpen] = useState(false);
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null);
  const [newPromo, setNewPromo] = useState<Omit<PromoCode, "id" | "currentUsage" | "status">>({
    code: "",
    type: "Percentage",
    value: 0,
    maxUsage: 100,
    expiryDate: "",
  });

  // Payment Methods State
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: "1", name: "Bank Mandiri Transfer", provider: "Midtrans", feeType: "Nominal", feeValue: 4000, taxPercent: 0, adminFee: 2500, active: true, type: "Bank" },
    { id: "2", name: "Bank BCA Virtual Account", provider: "Midtrans", feeType: "Nominal", feeValue: 4500, taxPercent: 0, adminFee: 2000, active: true, type: "Bank" },
    { id: "3", name: "QRIS All Payment", provider: "Midtrans", feeType: "Percentage", feeValue: 0.7, taxPercent: 11, adminFee: 0, active: true, type: "QRIS" },
    { id: "4", name: "GoPay E-Wallet", provider: "Midtrans", feeType: "Percentage", feeValue: 1.5, taxPercent: 11, adminFee: 1000, active: true, type: "E-Wallet" },
    { id: "5", name: "Credit Card (Visa/Master)", provider: "Midtrans", feeType: "Percentage", feeValue: 2.9, taxPercent: 11, adminFee: 5000, active: false, type: "Card" },
  ]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<PaymentMethod | null>(null);
  const [newPayment, setNewPayment] = useState<Omit<PaymentMethod, "id" | "active">>({
    name: "",
    provider: "Midtrans",
    feeType: "Percentage",
    feeValue: 0,
    taxPercent: 11,
    adminFee: 0,
    type: "Bank",
  });

  // RSS Sources State
  const [rssSources, setRssSources] = useState<RssSource[]>([
    { id: "1", name: "Detik News Feed", url: "https://news.detik.com/rss", category: "News", active: true, lastFetched: "2026-07-08 14:05", intervalMinutes: 15 },
    { id: "2", name: "TechCrunch Startups", url: "https://techcrunch.com/category/startups/feed/", category: "Technology", active: true, lastFetched: "2026-07-08 13:50", intervalMinutes: 30 },
    { id: "3", name: "Kompas Tekno", url: "https://tekno.kompas.com/rss", category: "Technology", active: false, lastFetched: "2026-07-07 10:00", intervalMinutes: 60 },
  ]);
  const [rssModalOpen, setRssModalOpen] = useState(false);
  const [editingRss, setEditingRss] = useState<RssSource | null>(null);
  const [newRss, setNewRss] = useState<Omit<RssSource, "id" | "active" | "lastFetched">>({
    name: "",
    url: "",
    category: "News",
    intervalMinutes: 30,
  });

  // Reference Gallery State
  const [gallery, setGallery] = useState<ReferenceDesign[]>([
    {
      id: "G-01",
      name: "Modern Minimalist Feed",
      imageUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=60",
      tags: ["Minimalist", "Instagram", "Clean"],
      category: "Social Media",
      price: 0,
    },
    {
      id: "G-02",
      name: "Neon Cyberpunk Poster",
      imageUrl: "https://images.unsplash.com/photo-1508739773434-c26b3d09e071?w=150&auto=format&fit=crop&q=60",
      tags: ["Cyberpunk", "Poster", "Neon"],
      category: "Marketing",
      price: 15000,
    },
    {
      id: "G-03",
      name: "Elegant Watercolor Banner",
      imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&auto=format&fit=crop&q=60",
      tags: ["Watercolor", "Banner", "Pastel"],
      category: "Branding",
      price: 0,
    },
  ]);
  const [editingGallery, setEditingGallery] = useState<(ReferenceDesign & { tempTags?: string }) | null>(null);
  const [addGalleryOpen, setAddGalleryOpen] = useState(false);
  const [newGallery, setNewGallery] = useState<Omit<ReferenceDesign, "id">>({
    name: "",
    imageUrl: "",
    tags: [],
    category: "Social Media",
    price: 0,
  });
  const [newGalleryTagsString, setNewGalleryTagsString] = useState("");

  // AI Models State
  const [allModels, setAllModels] = useState<AiModelRow[]>(() => aiModels);
  const [modelStates, setModelStates] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(aiModels.map((m) => [m.id, m.active]))
  );

  // AI Model Modal state
  const [addModelOpen, setAddModelOpen] = useState(false);
  const [activeModel, setActiveModel] = useState<(AiModelRow & { price?: number }) | null>(null);
  const [modelTab, setModelTab] = useState<"Image" | "Caption">("Caption");

  // Add Model Form State
  const [newName, setNewName] = useState("");
  const [newProvider, setNewProvider] = useState("");
  const [newVersion, setNewVersion] = useState("");
  const [newPrompt, setNewPrompt] = useState("");
  const [newTemp, setNewTemp] = useState(0.7);
  const [newTopP, setNewTopP] = useState(0.9);
  const [newMaxTokens, setNewMaxTokens] = useState(800);
  const [newActive, setNewActive] = useState(true);
  const [newPrice, setNewPrice] = useState(500);

  // Token Pricing State (Dynamically initialized from registered AI models list)
  const [modelPrices, setModelPrices] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    aiModels.forEach((m) => {
      if (m.id === "AIM-01") initial[m.id] = 500;
      else if (m.id === "AIM-02") initial[m.id] = 600;
      else if (m.id === "AIM-03") initial[m.id] = 800;
      else if (m.id === "AIM-04") initial[m.id] = 750;
      else if (m.id === "AIM-05") initial[m.id] = 300;
      else if (m.id === "AIM-06") initial[m.id] = 400;
      else initial[m.id] = 500; // default for newly added models
    });
    return initial;
  });
  const [minPurchase, setMinPurchase] = useState(100); // min 100 tokens
  const [isEditingToken, setIsEditingToken] = useState(false);

  // Form states for temporary edits
  const [tempModelPrices, setTempModelPrices] = useState<Record<string, number>>({});
  const [tempMinPurchase, setTempMinPurchase] = useState(minPurchase);

  const handleAddPromo = () => {
    if (!newPromo.code || newPromo.value <= 0 || !newPromo.expiryDate) {
      toast.error("Mohon lengkapi semua field promo dengan benar!");
      return;
    }
    const added: PromoCode = {
      id: Math.random().toString(),
      code: newPromo.code.toUpperCase(),
      type: newPromo.type,
      value: newPromo.value,
      maxUsage: newPromo.maxUsage,
      currentUsage: 0,
      status: "Active",
      expiryDate: newPromo.expiryDate,
    };
    setPromos([added, ...promos]);
    setPromoModalOpen(false);
    setNewPromo({
      code: "",
      type: "Percentage",
      value: 0,
      maxUsage: 100,
      expiryDate: "",
    });
    toast.success(`Kode promo ${added.code} berhasil dibuat!`);
  };

  const handleEditPromo = () => {
    if (!editingPromo || !editingPromo.code || editingPromo.value <= 0 || !editingPromo.expiryDate) {
      toast.error("Mohon lengkapi data promo dengan benar!");
      return;
    }
    setPromos(promos.map(p => p.id === editingPromo.id ? { ...editingPromo, code: editingPromo.code.toUpperCase() } : p));
    setEditingPromo(null);
    toast.success("Kode promo berhasil diperbarui!");
  };

  const handleDeletePromo = (id: string) => {
    setPromos(promos.filter(p => p.id !== id));
    toast.success("Kode promo berhasil dihapus.");
  };

  const handleTogglePromoStatus = (id: string) => {
    setPromos(promos.map(p => {
      if (p.id === id) {
        const nextStatus = p.status === "Active" ? "Expired" : "Active";
        toast.success(`Status promo ${p.code} diubah menjadi ${nextStatus === "Active" ? "Aktif" : "Kadaluarsa"}.`);
        return { ...p, status: nextStatus };
      }
      return p;
    }));
  };

  const handleTogglePayment = (id: string) => {
    setPaymentMethods(paymentMethods.map(pm => {
      if (pm.id === id) {
        const nextState = !pm.active;
        toast.success(`${pm.name} telah ${nextState ? "diaktifkan" : "dinonaktifkan"}.`);
        return { ...pm, active: nextState };
      }
      return pm;
    }));
  };

  const handleAddPayment = () => {
    if (!newPayment.name || newPayment.feeValue < 0 || newPayment.taxPercent < 0 || newPayment.adminFee < 0) {
      toast.error("Mohon lengkapi form metode pembayaran dengan benar!");
      return;
    }
    const added: PaymentMethod = {
      id: Math.random().toString(),
      name: newPayment.name,
      provider: newPayment.provider,
      feeType: newPayment.feeType,
      feeValue: newPayment.feeValue,
      taxPercent: newPayment.taxPercent,
      adminFee: newPayment.adminFee,
      type: newPayment.type,
      active: true,
    };
    setPaymentMethods([...paymentMethods, added]);
    setPaymentModalOpen(false);
    toast.success(`Metode pembayaran "${added.name}" berhasil dibuat!`);
  };

  const handleEditPayment = () => {
    if (!editingPayment || !editingPayment.name || editingPayment.feeValue < 0 || editingPayment.taxPercent < 0 || editingPayment.adminFee < 0) {
      toast.error("Mohon lengkapi form dengan benar!");
      return;
    }
    setPaymentMethods(paymentMethods.map(pm => pm.id === editingPayment.id ? editingPayment : pm));
    setEditingPayment(null);
    toast.success("Metode pembayaran berhasil diperbarui!");
  };

  const handleDeletePayment = (id: string) => {
    setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
    toast.success("Metode pembayaran berhasil dihapus.");
  };

  const handleSaveTokenPricing = () => {
    setModelPrices(tempModelPrices);
    setMinPurchase(tempMinPurchase);
    setIsEditingToken(false);
    toast.success("Konfigurasi harga token berhasil diperbarui!");
  };

  const handleSaveModel = () => {
    if (!newName || !newProvider || !newVersion) {
      toast.error("Mohon lengkapi nama model, provider, dan versi!");
      return;
    }

    const added: AiModelRow = {
      id: `AIM-${String(allModels.length + 1).padStart(2, "0")}`,
      name: newName,
      category: modelTab,
      provider: newProvider,
      version: newVersion,
      description: `Model ${modelTab} kustom didaftarkan oleh admin.`,
      active: newActive,
      systemPrompt: newPrompt || "You are a helpful assistant.",
      temperature: newTemp,
      topP: newTopP,
      maxTokens: newMaxTokens,
      requests: 0,
      errors: [],
    };

    aiModels.push(added);
    setAllModels([...allModels, added]);
    setModelStates((prev) => ({ ...prev, [added.id]: newActive }));
    setModelPrices((prev) => ({ ...prev, [added.id]: newPrice }));
    setAddModelOpen(false);

    // Reset Form
    setNewName("");
    setNewProvider("");
    setNewVersion("");
    setNewPrompt("");
    setNewTemp(0.7);
    setNewTopP(0.9);
    setNewMaxTokens(800);
    setNewActive(true);
    setNewPrice(500);
  };

  const handleDeleteModel = (id: string) => {
    const target = allModels.find(m => m.id === id);
    if (!target) return;
    if (confirm(`Apakah Anda yakin ingin menghapus AI Model "${target.name}"?`)) {
      setAllModels(allModels.filter(m => m.id !== id));
      const globalIdx = aiModels.findIndex(m => m.id === id);
      if (globalIdx !== -1) {
        aiModels.splice(globalIdx, 1);
      }
      setActiveModel(null);
      toast.success(`Model "${target.name}" berhasil dihapus.`);
    }
  };

  const handleAddGallery = () => {
    if (!newGallery.name.trim()) {
      toast.error("Nama desain wajib diisi!");
      return;
    }
    const tagsParsed = newGalleryTagsString
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const added: ReferenceDesign = {
      id: `G-${String(gallery.length + 1).padStart(2, "0")}`,
      name: newGallery.name,
      imageUrl: newGallery.imageUrl.trim() || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&auto=format&fit=crop&q=60",
      tags: tagsParsed,
      category: newGallery.category,
      price: newGallery.price,
    };

    setGallery([...gallery, added]);
    setAddGalleryOpen(false);
    setNewGallery({
      name: "",
      imageUrl: "",
      tags: [],
      category: "Social Media",
      price: 0,
    });
    setNewGalleryTagsString("");
    toast.success("Referensi desain berhasil ditambahkan!");
  };

  const handleEditGallery = () => {
    if (!editingGallery || !editingGallery.name.trim()) {
      toast.error("Nama desain wajib diisi!");
      return;
    }
    const tagsParsed = (editingGallery.tempTags || "")
      .split(",")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const updated: ReferenceDesign = {
      id: editingGallery.id,
      name: editingGallery.name,
      imageUrl: editingGallery.imageUrl.trim() || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&auto=format&fit=crop&q=60",
      tags: tagsParsed,
      category: editingGallery.category,
      price: editingGallery.price,
    };

    setGallery(gallery.map((g) => (g.id === updated.id ? updated : g)));
    setEditingGallery(null);
    toast.success("Referensi desain berhasil diperbarui!");
  };

  const handleDeleteGallery = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus referensi desain ini?")) {
      setGallery(gallery.filter((g) => g.id !== id));
      setEditingGallery(null);
      toast.success("Referensi desain berhasil dihapus.");
    }
  };

  const handleAddRss = () => {
    if (!newRss.name.trim() || !newRss.url.trim()) {
      toast.error("Nama sumber dan URL RSS Feed wajib diisi!");
      return;
    }
    const added: RssSource = {
      ...newRss,
      id: Math.random().toString(),
      active: true,
      lastFetched: "Belum pernah",
    };
    setRssSources([...rssSources, added]);
    setRssModalOpen(false);
    toast.success(`Sumber RSS "${newRss.name}" berhasil ditambahkan!`);
  };

  const handleEditRss = () => {
    if (!editingRss) return;
    if (!editingRss.name.trim() || !editingRss.url.trim()) {
      toast.error("Nama sumber dan URL RSS Feed wajib diisi!");
      return;
    }
    setRssSources(rssSources.map((r) => (r.id === editingRss.id ? editingRss : r)));
    setEditingRss(null);
    toast.success(`Sumber RSS "${editingRss.name}" berhasil diperbarui!`);
  };

  const handleDeleteRss = (id: string) => {
    const r = rssSources.find((x) => x.id === id);
    if (!r) return;
    setRssSources(rssSources.filter((x) => x.id !== id));
    toast.success("Sumber RSS berhasil dihapus.");
  };

  const handleToggleRss = (id: string) => {
    setRssSources(
      rssSources.map((r) => {
        if (r.id === id) {
          const nextActive = !r.active;
          toast.success(`Sumber RSS "${r.name}" telah ${nextActive ? "diaktifkan" : "dinonaktifkan"}.`);
          return { ...r, active: nextActive };
        }
        return r;
      })
    );
  };

  // RSS Table Columns
  const rssCols: Column<RssSource>[] = [
    { key: "name", header: "Nama Sumber", render: (r) => <span className="font-semibold text-foreground">{r.name}</span> },
    { key: "url", header: "URL RSS Feed", render: (r) => <span className="font-mono text-xs text-muted-foreground break-all">{r.url}</span> },
    { key: "category", header: "Kategori", render: (r) => <span className="inline-flex items-center rounded-md bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-blue-700/10">{r.category}</span> },
    { key: "interval", header: "Interval Sync", render: (r) => <span>Setiap {r.intervalMinutes} menit</span> },
    { key: "fetched", header: "Fetch Terakhir", render: (r) => <span className="text-muted-foreground font-mono text-xs">{r.lastFetched || "-"}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.active}
            onCheckedChange={() => handleToggleRss(r.id)}
          />
          <span className="text-xs text-muted-foreground">{r.active ? "Aktif" : "Nonaktif"}</span>
        </div>
      )
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/10 h-8 w-8"
            onClick={() => setEditingRss(r)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => handleDeleteRss(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // AI Model Table Columns
  const modelCols: Column<AiModelRow>[] = [
    {
      key: "name",
      header: "Nama Model",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground">{r.name}</span>
          <span className="text-[10px] text-muted-foreground">{r.description}</span>
        </div>
      ),
    },
    {
      key: "provider",
      header: "Sumber Model(GPT, Gemini, dll)",
      render: (r) => (
        <div className="flex flex-col">
          <span className="font-medium text-foreground">{r.provider}</span>
          <span className="text-[10px] text-muted-foreground font-mono">{r.version}</span>
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori(Caption/ Generate Image)",
      render: (r) => (
        <span className={cn(
          "inline-flex items-center rounded-md px-2.5 py-0.5 text-xs font-semibold ring-1 ring-inset",
          r.category === "Caption"
            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 ring-emerald-500/20"
            : "bg-purple-500/10 text-purple-600 dark:text-purple-400 ring-purple-500/20"
        )}>
          {r.category === "Caption" ? "Caption" : "Generate Image"}
        </span>
      ),
    },
    {
      key: "price",
      header: "Harga per generate",
      render: (r) => (
        <span className="font-mono font-semibold text-foreground">
          {formatRp(modelPrices[r.id] ?? 500)}
        </span>
      ),
    },
    {
      key: "preprompt",
      header: "Preprompt",
      render: (r) => (
        <span className="text-muted-foreground text-xs block max-w-xs truncate font-mono" title={r.systemPrompt}>
          {r.systemPrompt}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-3">
          <div className="flex items-center gap-1.5">
            <Switch
              checked={modelStates[r.id]}
              onCheckedChange={(v) => {
                setModelStates((s) => ({ ...s, [r.id]: v }));
                r.active = v;
                toast.success(`Model "${r.name}" ${v ? "diaktifkan" : "dinonaktifkan"}.`);
              }}
            />
            <span className="text-[11px] text-muted-foreground select-none">
              {modelStates[r.id] ? "Aktif" : "Nonaktif"}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/10 h-8 w-8"
            onClick={() => setActiveModel({
              ...r,
              price: modelPrices[r.id] ?? 500
            } as any)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Gallery Table Columns
  const galleryCols: Column<ReferenceDesign>[] = [
    {
      key: "imageUrl",
      header: "Foto",
      render: (r) => (
        <img
          src={r.imageUrl || "https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?w=150&auto=format&fit=crop&q=60"}
          alt={r.name}
          className="h-10 w-10 object-cover rounded-lg border shadow-sm bg-muted"
        />
      ),
    },
    {
      key: "name",
      header: "Nama Desain",
      render: (r) => <span className="font-semibold text-foreground">{r.name}</span>,
    },
    {
      key: "tags",
      header: "Tag",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.tags.map((t, idx) => (
            <span
              key={idx}
              className="inline-flex items-center rounded bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 px-1.5 py-0.5 text-[10px] font-medium"
            >
              {t}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "category",
      header: "Kategori",
      render: (r) => (
        <span className="inline-flex items-center rounded-md bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-purple-700/10">
          {r.category}
        </span>
      ),
    },
    {
      key: "price",
      header: "Harga",
      render: (r) => (
        <span className={cn(
          "font-mono font-semibold text-xs px-2 py-0.5 rounded",
          r.price === 0
            ? "text-emerald-700 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/30"
            : "text-foreground bg-muted"
        )}>
          {r.price === 0 ? "Free" : formatRp(r.price)}
        </span>
      ),
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (r) => (
        <Button
          variant="ghost"
          size="icon"
          className="text-primary hover:bg-primary/10 h-8 w-8"
          onClick={() => {
            setEditingGallery({
              ...r,
              tempTags: r.tags.join(", "),
            });
          }}
        >
          <Pencil className="h-4 w-4" />
        </Button>
      ),
    },
  ];

  // Promo Table Columns
  const promoCols: Column<PromoCode>[] = [
    { key: "code", header: "Promo Code", render: (r) => <span className="font-mono font-bold text-primary">{r.code}</span> },
    {
      key: "discount",
      header: "Diskon / Pengurangan",
      render: (r) => (
        <span>{r.type === "Percentage" ? `${r.value}%` : formatRp(r.value)}</span>
      )
    },
    {
      key: "usage",
      header: "Penggunaan",
      render: (r) => (
        <span className="text-sm font-medium">
          {r.currentUsage} / {r.maxUsage}
        </span>
      )
    },
    { key: "expiry", header: "Expiry Date", render: (r) => <span className="text-muted-foreground">{r.expiryDate}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.status === "Active"}
            onCheckedChange={() => handleTogglePromoStatus(r.id)}
          />
          <span className="text-xs text-muted-foreground">{r.status === "Active" ? "Aktif" : "Kadaluarsa"}</span>
        </div>
      )
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/10 h-8 w-8"
            onClick={() => setEditingPromo(r)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => handleDeletePromo(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  // Payment Table Columns (With logos)
  const paymentCols: Column<PaymentMethod>[] = [
    {
      key: "name",
      header: "Payment Method",
      render: (r) => (
        <div className="flex items-center gap-3">
          <img
            src={getLogoUrl(r.name, r.type)}
            alt={r.name}
            className="h-6 w-12 object-contain bg-white rounded border p-0.5 shrink-0"
          />
          <span className="font-semibold text-foreground">{r.name}</span>
        </div>
      )
    },
    { key: "provider", header: "Provider", render: (r) => <span className="text-muted-foreground">{r.provider}</span> },
    { key: "type", header: "Type", render: (r) => <StatusBadge status={r.type} /> },
    {
      key: "fee",
      header: "Fee (MDR)",
      render: (r) => (
        <span>{r.feeType === "Percentage" ? `${r.feeValue}%` : formatRp(r.feeValue)}</span>
      )
    },
    { key: "tax", header: "Pajak PPN", render: (r) => <span>{r.taxPercent}%</span> },
    { key: "admin", header: "Biaya Admin", render: (r) => <span>{formatRp(r.adminFee)}</span> },
    {
      key: "status",
      header: "Status",
      render: (r) => (
        <div className="flex items-center gap-2">
          <Switch
            checked={r.active}
            onCheckedChange={() => handleTogglePayment(r.id)}
          />
          <span className="text-xs text-muted-foreground">{r.active ? "Aktif" : "Nonaktif"}</span>
        </div>
      )
    },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="text-primary hover:bg-primary/10 h-8 w-8"
            onClick={() => setEditingPayment(r)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive hover:bg-destructive/10 h-8 w-8"
            onClick={() => handleDeletePayment(r.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Workspace Management"
        description="Konfigurasi inti website Postmatic: promo, pembayaran, token pricing, dan platform settings."
      />

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="flex w-full mb-6 h-20 p-2 bg-muted/30 border">
          <TabsTrigger value="promo" className="flex-1 gap-2 h-full text-base font-bold transition-all">
            <Percent className="h-5 w-5" /> Kelola Promo
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex-1 gap-2 h-full text-base font-bold transition-all">
            <CreditCard className="h-5 w-5" /> Kelola Pembayaran
          </TabsTrigger>
          <TabsTrigger value="pricing" className="flex-1 gap-2 h-full text-base font-bold transition-all">
            <Coins className="h-5 w-5" /> Kelola AI Model
          </TabsTrigger>
          <TabsTrigger value="rss" className="flex-1 gap-2 h-full text-base font-bold transition-all">
            <Rss className="h-5 w-5" /> Kelola RSS
          </TabsTrigger>
          <TabsTrigger value="gallery" className="flex-1 gap-2 h-full text-base font-bold transition-all">
            <FolderHeart className="h-5 w-5" /> Reference Gallery
          </TabsTrigger>
        </TabsList>

        {/* Tab Promo Codes */}
        <TabsContent value="promo" className="space-y-4">
          <SectionCard
            title="Kelola Kode Promo"
            description="Buat dan monitoring pemakaian kode diskon untuk pembelian paket/token."
            action={
              <Button onClick={() => setPromoModalOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Buat Kode Promo
              </Button>
            }
          >
            <DataTable columns={promoCols} data={promos} />
          </SectionCard>
        </TabsContent>

        {/* Tab Payment Methods */}
        <TabsContent value="payment" className="space-y-4">
          <SectionCard
            title="Metode Pembayaran"
            description="Atur channel pembayaran, provider gateway, pajak pertambahan nilai (PPN) serta biaya administrasi per channel pembayaran."
            action={
              <Button onClick={() => {
                setNewPayment({
                  name: "",
                  provider: "Midtrans",
                  feeType: "Percentage",
                  feeValue: 0,
                  taxPercent: 11,
                  adminFee: 0,
                  type: "Bank",
                });
                setPaymentModalOpen(true);
              }} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Tambah Pembayaran
              </Button>
            }
          >
            <DataTable columns={paymentCols} data={paymentMethods} />
          </SectionCard>
        </TabsContent>

        {/* Tab Kelola AI Model */}
        <TabsContent value="pricing" className="space-y-6">
          <SectionCard
            title="Kelola AI Model & Preprocessing"
            description="Atur parameter model AI, harga per generate, system prompt preprocessing, dan pantau status serta log error model."
            action={
              <Button onClick={() => setAddModelOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Tambah AI Model
              </Button>
            }
          >
            <DataTable columns={modelCols} data={allModels} />
          </SectionCard>
        </TabsContent>

        {/* Tab RSS Feeds */}
        <TabsContent value="rss" className="space-y-4">
          <SectionCard
            title="Kelola Sumber RSS Feed"
            description="Daftarkan, pantau, dan atur sinkronisasi sumber berita/konten eksternal melalui RSS Feed."
            action={
              <Button onClick={() => {
                setNewRss({
                  name: "",
                  url: "",
                  category: "News",
                  intervalMinutes: 30,
                });
                setRssModalOpen(true);
              }} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Tambah Sumber RSS
              </Button>
            }
          >
            <DataTable columns={rssCols} data={rssSources} />
          </SectionCard>
        </TabsContent>

        {/* Tab Reference Gallery */}
        <TabsContent value="gallery" className="space-y-4">
          <SectionCard
            title="Kelola Reference Gallery"
            description="Kelola galeri referensi desain foto, tag, kategori, dan harga (free/paid) untuk inspirasi pengguna."
            action={
              <Button onClick={() => setAddGalleryOpen(true)} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
                <Plus className="h-4 w-4" /> Tambah Referensi
              </Button>
            }
          >
            <DataTable columns={galleryCols} data={gallery} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Dialog Pembuatan Promo Baru */}
      <Dialog open={promoModalOpen} onOpenChange={setPromoModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buat Kode Promo Baru</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="promo-code">Kode Promo</Label>
              <Input
                id="promo-code"
                placeholder="POSTMATICPROMO20"
                value={newPromo.code}
                onChange={(e) => setNewPromo({ ...newPromo, code: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="promo-type">Tipe Diskon</Label>
                <Select
                  value={newPromo.type}
                  onValueChange={(v: "Nominal" | "Percentage") => setNewPromo({ ...newPromo, type: v })}
                >
                  <SelectTrigger id="promo-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Persentase (%)</SelectItem>
                    <SelectItem value="Nominal">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="promo-value">Nilai Diskon</Label>
                <Input
                  id="promo-value"
                  type="number"
                  placeholder={newPromo.type === "Percentage" ? "15" : "50000"}
                  value={newPromo.value || ""}
                  onChange={(e) => setNewPromo({ ...newPromo, value: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="promo-usage">Maks. Penggunaan</Label>
                <Input
                  id="promo-usage"
                  type="number"
                  value={newPromo.maxUsage}
                  onChange={(e) => setNewPromo({ ...newPromo, maxUsage: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="promo-expiry">Tanggal Kadaluarsa</Label>
                <Input
                  id="promo-expiry"
                  type="date"
                  value={newPromo.expiryDate}
                  onChange={(e) => setNewPromo({ ...newPromo, expiryDate: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPromoModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddPromo} className="bg-blue-600 hover:bg-blue-700 text-white">
              Buat Promo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Promo */}
      <Dialog open={!!editingPromo} onOpenChange={(v) => !v && setEditingPromo(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Kode Promo</DialogTitle>
          </DialogHeader>
          {editingPromo && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-promo-code">Kode Promo</Label>
                <Input
                  id="edit-promo-code"
                  value={editingPromo.code}
                  onChange={(e) => setEditingPromo({ ...editingPromo, code: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-promo-type">Tipe Diskon</Label>
                  <Select
                    value={editingPromo.type}
                    onValueChange={(v: "Nominal" | "Percentage") => setEditingPromo({ ...editingPromo, type: v })}
                  >
                    <SelectTrigger id="edit-promo-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Persentase (%)</SelectItem>
                      <SelectItem value="Nominal">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-promo-value">Nilai Diskon</Label>
                  <Input
                    id="edit-promo-value"
                    type="number"
                    value={editingPromo.value}
                    onChange={(e) => setEditingPromo({ ...editingPromo, value: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-promo-usage">Maks. Penggunaan</Label>
                  <Input
                    id="edit-promo-usage"
                    type="number"
                    value={editingPromo.maxUsage}
                    onChange={(e) => setEditingPromo({ ...editingPromo, maxUsage: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-promo-expiry">Tanggal Kadaluarsa</Label>
                  <Input
                    id="edit-promo-expiry"
                    type="date"
                    value={editingPromo.expiryDate}
                    onChange={(e) => setEditingPromo({ ...editingPromo, expiryDate: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPromo(null)}>
              Batal
            </Button>
            <Button onClick={handleEditPromo} className="bg-blue-600 hover:bg-blue-700 text-white">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Metode Pembayaran */}
      <Dialog open={paymentModalOpen} onOpenChange={setPaymentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Metode Pembayaran</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="pay-name">Nama Metode Pembayaran</Label>
              <Input
                id="pay-name"
                placeholder="Bank BCA Virtual Account"
                value={newPayment.name}
                onChange={(e) => setNewPayment({ ...newPayment, name: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="pay-type">Tipe Channel</Label>
                <Select
                  value={newPayment.type}
                  onValueChange={(v: any) => setNewPayment({ ...newPayment, type: v })}
                >
                  <SelectTrigger id="pay-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bank">Virtual Account (Bank)</SelectItem>
                    <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                    <SelectItem value="QRIS">QRIS</SelectItem>
                    <SelectItem value="Card">Kartu Kredit / Debit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pay-provider">Payment Gateway / Partner</Label>
                <Input
                  id="pay-provider"
                  value={newPayment.provider}
                  onChange={(e) => setNewPayment({ ...newPayment, provider: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="pay-feetype">Tipe Biaya (MDR)</Label>
                <Select
                  value={newPayment.feeType}
                  onValueChange={(v: "Nominal" | "Percentage") => setNewPayment({ ...newPayment, feeType: v })}
                >
                  <SelectTrigger id="pay-feetype">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Percentage">Persentase (%)</SelectItem>
                    <SelectItem value="Nominal">Nominal (Rp)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pay-feevalue">Biaya Transaksi (MDR)</Label>
                <Input
                  id="pay-feevalue"
                  type="number"
                  step="any"
                  value={newPayment.feeValue || ""}
                  onChange={(e) => setNewPayment({ ...newPayment, feeValue: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="pay-tax">Pajak Pertambahan Nilai (PPN)</Label>
                <div className="relative">
                  <span className="absolute right-3 top-2.5 text-sm text-muted-foreground font-semibold">%</span>
                  <Input
                    id="pay-tax"
                    type="number"
                    value={newPayment.taxPercent}
                    onChange={(e) => setNewPayment({ ...newPayment, taxPercent: Number(e.target.value) })}
                  />
                </div>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="pay-admin">Biaya Admin Platform</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">Rp</span>
                  <Input
                    id="pay-admin"
                    type="number"
                    className="pl-9"
                    value={newPayment.adminFee}
                    onChange={(e) => setNewPayment({ ...newPayment, adminFee: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPaymentModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddPayment} className="bg-blue-600 hover:bg-blue-700 text-white">
              Tambah Metode
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Metode Pembayaran */}
      <Dialog open={!!editingPayment} onOpenChange={(v) => !v && setEditingPayment(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Metode Pembayaran</DialogTitle>
          </DialogHeader>
          {editingPayment && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-pay-name">Nama Metode Pembayaran</Label>
                <Input
                  id="edit-pay-name"
                  value={editingPayment.name}
                  onChange={(e) => setEditingPayment({ ...editingPayment, name: e.target.value })}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-pay-type">Tipe Channel</Label>
                  <Select
                    value={editingPayment.type}
                    onValueChange={(v: any) => setEditingPayment({ ...editingPayment, type: v })}
                  >
                    <SelectTrigger id="edit-pay-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Bank">Virtual Account (Bank)</SelectItem>
                      <SelectItem value="E-Wallet">E-Wallet</SelectItem>
                      <SelectItem value="QRIS">QRIS</SelectItem>
                      <SelectItem value="Card">Kartu Kredit / Debit</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-pay-provider">Payment Gateway / Partner</Label>
                  <Input
                    id="edit-pay-provider"
                    value={editingPayment.provider}
                    onChange={(e) => setEditingPayment({ ...editingPayment, provider: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-pay-feetype">Tipe Biaya (MDR)</Label>
                  <Select
                    value={editingPayment.feeType}
                    onValueChange={(v: "Nominal" | "Percentage") => setEditingPayment({ ...editingPayment, feeType: v })}
                  >
                    <SelectTrigger id="edit-pay-feetype">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Percentage">Persentase (%)</SelectItem>
                      <SelectItem value="Nominal">Nominal (Rp)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-pay-feevalue">Biaya Transaksi (MDR)</Label>
                  <Input
                    id="edit-pay-feevalue"
                    type="number"
                    step="any"
                    value={editingPayment.feeValue}
                    onChange={(e) => setEditingPayment({ ...editingPayment, feeValue: Number(e.target.value) })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-pay-tax">Pajak Pertambahan Nilai (PPN)</Label>
                  <div className="relative">
                    <span className="absolute right-3 top-2.5 text-sm text-muted-foreground font-semibold">%</span>
                    <Input
                      id="edit-pay-tax"
                      type="number"
                      value={editingPayment.taxPercent}
                      onChange={(e) => setEditingPayment({ ...editingPayment, taxPercent: Number(e.target.value) })}
                    />
                  </div>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-pay-admin">Biaya Admin Platform</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-sm text-muted-foreground font-semibold">Rp</span>
                    <Input
                      id="edit-pay-admin"
                      type="number"
                      className="pl-9"
                      value={editingPayment.adminFee}
                      onChange={(e) => setEditingPayment({ ...editingPayment, adminFee: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPayment(null)}>
              Batal
            </Button>
            <Button onClick={handleEditPayment} className="bg-blue-600 hover:bg-blue-700 text-white">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah Sumber RSS */}
      <Dialog open={rssModalOpen} onOpenChange={setRssModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Sumber RSS Feed</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="rss-name">Nama Sumber Feed</Label>
              <Input
                id="rss-name"
                placeholder="Contoh: Detik News, TechCrunch Startups"
                value={newRss.name}
                onChange={(e) => setNewRss({ ...newRss, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="rss-url">URL RSS Feed</Label>
              <Input
                id="rss-url"
                type="url"
                placeholder="https://example.com/feed"
                value={newRss.url}
                onChange={(e) => setNewRss({ ...newRss, url: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="rss-category">Kategori</Label>
                <Select
                  value={newRss.category}
                  onValueChange={(v) => setNewRss({ ...newRss, category: v })}
                >
                  <SelectTrigger id="rss-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="News">Berita / Politik</SelectItem>
                    <SelectItem value="Technology">Teknologi</SelectItem>
                    <SelectItem value="Business">Bisnis / Keuangan</SelectItem>
                    <SelectItem value="Entertainment">Hiburan</SelectItem>
                    <SelectItem value="Lifestyle">Gaya Hidup</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="rss-interval">Interval Sinkronisasi</Label>
                <Select
                  value={String(newRss.intervalMinutes)}
                  onValueChange={(v) => setNewRss({ ...newRss, intervalMinutes: Number(v) })}
                >
                  <SelectTrigger id="rss-interval">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">Setiap 15 Menit</SelectItem>
                    <SelectItem value="30">Setiap 30 Menit</SelectItem>
                    <SelectItem value="60">Setiap 1 Jam</SelectItem>
                    <SelectItem value="360">Setiap 6 Jam</SelectItem>
                    <SelectItem value="1440">Setiap 24 Jam</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRssModalOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddRss} className="bg-blue-600 hover:bg-blue-700 text-white">
              Tambah Sumber
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Sumber RSS */}
      <Dialog open={!!editingRss} onOpenChange={(v) => !v && setEditingRss(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Sumber RSS Feed</DialogTitle>
          </DialogHeader>
          {editingRss && (
            <div className="grid gap-4 py-2">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-rss-name">Nama Sumber Feed</Label>
                <Input
                  id="edit-rss-name"
                  value={editingRss.name}
                  onChange={(e) => setEditingRss({ ...editingRss, name: e.target.value })}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-rss-url">URL RSS Feed</Label>
                <Input
                  id="edit-rss-url"
                  type="url"
                  value={editingRss.url}
                  onChange={(e) => setEditingRss({ ...editingRss, url: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-rss-category">Kategori</Label>
                  <Select
                    value={editingRss.category}
                    onValueChange={(v) => setEditingRss({ ...editingRss, category: v })}
                  >
                    <SelectTrigger id="edit-rss-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="News">Berita / Politik</SelectItem>
                      <SelectItem value="Technology">Teknologi</SelectItem>
                      <SelectItem value="Business">Bisnis / Keuangan</SelectItem>
                      <SelectItem value="Entertainment">Hiburan</SelectItem>
                      <SelectItem value="Lifestyle">Gaya Hidup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="edit-rss-interval">Interval Sinkronisasi</Label>
                  <Select
                    value={String(editingRss.intervalMinutes)}
                    onValueChange={(v) => setEditingRss({ ...editingRss, intervalMinutes: Number(v) })}
                  >
                    <SelectTrigger id="edit-rss-interval">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Setiap 15 Menit</SelectItem>
                      <SelectItem value="30">Setiap 30 Menit</SelectItem>
                      <SelectItem value="60">Setiap 1 Jam</SelectItem>
                      <SelectItem value="360">Setiap 6 Jam</SelectItem>
                      <SelectItem value="1440">Setiap 24 Jam</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRss(null)}>
              Batal
            </Button>
            <Button onClick={handleEditRss} className="bg-blue-600 hover:bg-blue-700 text-white">
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Tambah AI Model */}
      <Dialog open={addModelOpen} onOpenChange={setAddModelOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah AI Model</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label htmlFor="new-model-name">Nama Model</Label>
                <Input
                  id="new-model-name"
                  placeholder="Postmatic Copy"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="new-model-category">Kategori</Label>
                <Select
                  value={modelTab}
                  onValueChange={(v: "Image" | "Caption") => setModelTab(v)}
                >
                  <SelectTrigger id="new-model-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caption">Caption</SelectItem>
                    <SelectItem value="Image">Generate Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="grid gap-1.5 col-span-1">
                <Label htmlFor="new-model-price">Harga per Generate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Rp</span>
                  <Input
                    id="new-model-price"
                    type="number"
                    className="pl-8"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                  />
                </div>
              </div>
              <div className="grid gap-1.5 col-span-1">
                <Label htmlFor="new-model-prov">Provider</Label>
                <Input
                  id="new-model-prov"
                  placeholder="OpenAI"
                  value={newProvider}
                  onChange={(e) => setNewProvider(e.target.value)}
                />
              </div>
              <div className="grid gap-1.5 col-span-1">
                <Label htmlFor="new-model-ver">Versi</Label>
                <Input
                  id="new-model-ver"
                  placeholder="gpt-4o-mini"
                  value={newVersion}
                  onChange={(e) => setNewVersion(e.target.value)}
                />
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="new-model-prompt">System Prompt Preprocessing</Label>
              <Textarea
                id="new-model-prompt"
                rows={5}
                placeholder="You are a helpful assistant..."
                value={newPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setNewPrompt(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ParamSlider label="Temperature" value={newTemp} onChange={setNewTemp} max={1} step={0.05} />
              <ParamSlider label="Top-P" value={newTopP} onChange={setNewTopP} max={1} step={0.05} />
              <ParamSlider label="Max Tokens" value={newMaxTokens} onChange={setNewMaxTokens} max={4096} step={64} />
            </div>
            <div className="flex items-center justify-between rounded-lg border p-3">
              <div>
                <p className="text-sm font-medium">Status Aktif</p>
                <p className="text-xs text-muted-foreground">Aktifkan model setelah didaftarkan.</p>
              </div>
              <Switch checked={newActive} onCheckedChange={setNewActive} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddModelOpen(false)}>Batal</Button>
            <Button onClick={handleSaveModel} className="bg-blue-600 hover:bg-blue-700 text-white">Simpan Model</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DetailModal Edit AI Model */}
      <DetailModal
        open={!!activeModel}
        onOpenChange={(v) => !v && setActiveModel(null)}
        title={activeModel ? `Settings — ${activeModel.name}` : ""}
        description="Konfigurasi mendalam model & preprocessing."
        size="xl"
        footer={
          activeModel ? (
            <div className="flex justify-between items-center w-full">
              <Button
                variant="destructive"
                onClick={() => handleDeleteModel(activeModel.id)}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Hapus Model
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setActiveModel(null)}>
                  Batal
                </Button>
                <Button
                  onClick={() => {
                    if (activeModel.price !== undefined) {
                      setModelPrices(prev => ({ ...prev, [activeModel.id]: activeModel.price! }));
                    }
                    setAllModels(prev =>
                      prev.map(m =>
                        m.id === activeModel.id
                          ? {
                            ...m,
                            name: activeModel.name,
                            provider: activeModel.provider,
                            version: activeModel.version,
                            category: activeModel.category,
                            systemPrompt: activeModel.systemPrompt,
                            temperature: activeModel.temperature,
                            topP: activeModel.topP,
                            maxTokens: activeModel.maxTokens,
                          }
                          : m
                      )
                    );
                    const target = aiModels.find(m => m.id === activeModel.id);
                    if (target) {
                      target.name = activeModel.name;
                      target.provider = activeModel.provider;
                      target.version = activeModel.version;
                      target.category = activeModel.category;
                      target.systemPrompt = activeModel.systemPrompt;
                      target.temperature = activeModel.temperature;
                      target.topP = activeModel.topP;
                      target.maxTokens = activeModel.maxTokens;
                    }
                    setActiveModel(null);
                    toast.success(`Model "${activeModel.name}" berhasil diperbarui!`);
                  }}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {activeModel ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-model-name">Nama Model</Label>
                <Input
                  id="edit-model-name"
                  value={activeModel.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setActiveModel({ ...activeModel, name: val });
                  }}
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-model-prov">Provider · Versi</Label>
                <Input
                  id="edit-model-prov"
                  value={`${activeModel.provider} · ${activeModel.version}`}
                  onChange={(e) => {
                    const val = e.target.value;
                    const parts = val.split("·").map(p => p.trim());
                    const provider = parts[0] || activeModel.provider;
                    const version = parts[1] || activeModel.version;
                    setActiveModel({ ...activeModel, provider, version });
                  }}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-model-category">Kategori</Label>
                <Select
                  value={activeModel.category}
                  onValueChange={(v: "Caption" | "Image") => setActiveModel({ ...activeModel, category: v })}
                >
                  <SelectTrigger id="edit-model-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Caption">Caption</SelectItem>
                    <SelectItem value="Image">Generate Image</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-model-price">Harga per Generate</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Rp</span>
                  <Input
                    id="edit-model-price"
                    type="number"
                    className="pl-8"
                    value={activeModel.price ?? 500}
                    onChange={(e) => setActiveModel({ ...activeModel, price: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-model-prompt">System Prompt Preprocessing</Label>
              <Textarea
                id="edit-model-prompt"
                rows={6}
                value={activeModel.systemPrompt}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  const val = e.target.value;
                  setActiveModel({ ...activeModel, systemPrompt: val });
                }}
              />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <ParamSlider
                label="Temperature"
                value={activeModel.temperature}
                onChange={(v) => {
                  setActiveModel({ ...activeModel, temperature: v });
                }}
                max={1}
                step={0.05}
              />
              <ParamSlider
                label="Top-P"
                value={activeModel.topP}
                onChange={(v) => {
                  setActiveModel({ ...activeModel, topP: v });
                }}
                max={1}
                step={0.05}
              />
              <ParamSlider
                label="Max Tokens"
                value={activeModel.maxTokens}
                onChange={(v) => {
                  setActiveModel({ ...activeModel, maxTokens: v });
                }}
                max={4096}
                step={64}
              />
            </div>
            <SectionCard title="Log Error Model">
              {activeModel.errors.length === 0 ? (
                <p className="py-4 text-center text-sm text-muted-foreground">Tidak ada error tercatat.</p>
              ) : (
                <ul className="divide-y">
                  {activeModel.errors.map((e) => (
                    <li key={e.id} className="flex items-start gap-3 py-3">
                      <AlertTriangle className="mt-0.5 h-4 w-4 text-destructive" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">{e.message}</p>
                        <p className="text-xs text-muted-foreground">{e.at}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </SectionCard>
          </div>
        ) : null}
      </DetailModal>

      {/* Dialog Tambah Reference Gallery */}
      <Dialog open={addGalleryOpen} onOpenChange={setAddGalleryOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Tambah Referensi Desain</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="gallery-name">Nama Desain</Label>
              <Input
                id="gallery-name"
                placeholder="Contoh: Modern Minimalist Feed"
                value={newGallery.name}
                onChange={(e) => setNewGallery({ ...newGallery, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="gallery-image">URL Foto</Label>
              <Input
                id="gallery-image"
                placeholder="https://images.unsplash.com/..."
                value={newGallery.imageUrl}
                onChange={(e) => setNewGallery({ ...newGallery, imageUrl: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="gallery-tags">Tag (pisahkan dengan koma)</Label>
              <Input
                id="gallery-tags"
                placeholder="Minimalist, Clean, Instagram"
                value={newGalleryTagsString}
                onChange={(e) => setNewGalleryTagsString(e.target.value)}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="gallery-category">Kategori</Label>
                <Select
                  value={newGallery.category}
                  onValueChange={(v) => setNewGallery({ ...newGallery, category: v })}
                >
                  <SelectTrigger id="gallery-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Branding">Branding</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="gallery-price">Harga (0 untuk Free)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Rp</span>
                  <Input
                    id="gallery-price"
                    type="number"
                    className="pl-8"
                    value={newGallery.price}
                    onChange={(e) => setNewGallery({ ...newGallery, price: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddGalleryOpen(false)}>
              Batal
            </Button>
            <Button onClick={handleAddGallery} className="bg-blue-600 hover:bg-blue-700 text-white">
              Tambah Desain
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DetailModal Edit Reference Gallery */}
      <DetailModal
        open={!!editingGallery}
        onOpenChange={(v) => !v && setEditingGallery(null)}
        title={editingGallery ? `Edit Referensi — ${editingGallery.name}` : ""}
        description="Ubah detail desain galeri referensi."
        size="lg"
        footer={
          editingGallery ? (
            <div className="flex justify-between items-center w-full">
              <Button
                variant="destructive"
                onClick={() => handleDeleteGallery(editingGallery.id)}
                className="gap-1.5"
              >
                <Trash2 className="h-4 w-4" /> Hapus Desain
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setEditingGallery(null)}>
                  Batal
                </Button>
                <Button
                  onClick={handleEditGallery}
                  className="bg-blue-600 hover:bg-blue-700 text-white"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          ) : null
        }
      >
        {editingGallery ? (
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label htmlFor="edit-gallery-name">Nama Desain</Label>
              <Input
                id="edit-gallery-name"
                value={editingGallery.name}
                onChange={(e) => setEditingGallery({ ...editingGallery, name: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-gallery-image">URL Foto</Label>
              <Input
                id="edit-gallery-image"
                value={editingGallery.imageUrl}
                onChange={(e) => setEditingGallery({ ...editingGallery, imageUrl: e.target.value })}
              />
            </div>
            <div className="grid gap-1.5">
              <Label htmlFor="edit-gallery-tags">Tag (pisahkan dengan koma)</Label>
              <Input
                id="edit-gallery-tags"
                value={editingGallery.tempTags || ""}
                onChange={(e) => setEditingGallery({ ...editingGallery, tempTags: e.target.value })}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-1.5">
                <Label htmlFor="edit-gallery-category">Kategori</Label>
                <Select
                  value={editingGallery.category}
                  onValueChange={(v) => setEditingGallery({ ...editingGallery, category: v })}
                >
                  <SelectTrigger id="edit-gallery-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Social Media">Social Media</SelectItem>
                    <SelectItem value="Marketing">Marketing</SelectItem>
                    <SelectItem value="Branding">Branding</SelectItem>
                    <SelectItem value="Personal">Personal</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="edit-gallery-price">Harga (0 untuk Free)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs text-muted-foreground font-semibold">Rp</span>
                  <Input
                    id="edit-gallery-price"
                    type="number"
                    className="pl-8"
                    value={editingGallery.price}
                    onChange={(e) => setEditingGallery({ ...editingGallery, price: Number(e.target.value) })}
                  />
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DetailModal>
    </>
  );
}

function ParamSlider({
  label,
  value,
  onChange,
  max,
  step,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  max: number;
  step: number;
}) {
  return (
    <div className="rounded-lg border p-3">
      <div className="flex items-center justify-between">
        <Label className="text-xs">{label}</Label>
        <span className="text-xs font-medium text-foreground">{value}</span>
      </div>
      <Slider
        className="mt-3"
        value={[value]}
        max={max}
        step={step}
        onValueChange={(vals) => onChange(vals[0] ?? value)}
      />
    </div>
  );
}
