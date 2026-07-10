import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Facebook,
  Instagram,
  Linkedin,
  Globe,
  Plus,
  Search,
  Trash2,
  Copy,
  Edit3,
  MoreHorizontal,
  Sparkles,
  UserPlus,
  Link2,
  Phone,
  Check,
  X,
  Rss,
  Smile,
  Tag,
  ShoppingBag,
  ExternalLink,
  Save,
  AlertCircle,
  Palette,
  Target,
  MessageSquare,
  Hash,
} from "lucide-react";
import { DetailModal } from "@/components/admin/DetailModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BusinessRow } from "@/lib/mock/types";
import { formatRp } from "@/components/admin/utils";

interface AvatarItem {
  id: string;
  name: string;
  source: string;
  image: string;
}

interface RssItem {
  id: string;
  name: string;
  category: string;
  source: string;
  active: boolean;
}

interface ProductItem {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string;
  image: string;
}

export function BusinessDetailModal({
  row,
  onClose,
  mode = "view",
}: {
  row: BusinessRow | null;
  onClose: () => void;
  mode?: "view" | "edit";
}) {
  const [localMode, setLocalMode] = useState<"view" | "edit">(mode);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState("");

  // Business Knowledge State
  const [bizName, setBizName] = useState("");
  const [bizCategory, setBizCategory] = useState("");
  const [bizPhone, setBizPhone] = useState("+62 85156031385");
  const [bizWebsite, setBizWebsite] = useState("https://harachickenofficial.com");
  const [bizDescription, setBizDescription] = useState(
    "Hara Chicken adalah bisnis makanan cepat saji yang menyediakan beragam menu ayam goreng lezat, renyah, dan berkualitas tinggi dengan harga terjangkau. Kami berfokus pada inovasi rasa dan kualitas bahan baku untuk memberikan pengalaman kuliner terbaik bagi pelanggan."
  );
  const [bizColor, setBizColor] = useState("#D02626");

  // Role Knowledge State (Pengetahuan Peran)
  const [targetAudience, setTargetAudience] = useState(
    "Ibu rumah tangga, pekerja kantor, pecinta kuliner cepat saji usia 18-45 tahun"
  );
  const [contentNuance, setContentNuance] = useState(
    "Hangat, menggugah selera, akrab, informatif, dan terpercaya"
  );
  const [hashtags, setHashtags] = useState(
    "#HaraChicken, #AyamGeprekKeju, #KulinerNusantara, #MakanEnak, #MamaCook"
  );

  // Social Media State
  const [platformsState, setPlatformsState] = useState<string[]>(["facebook", "linkedin"]);

  // Products State
  const [productsList, setProductsList] = useState<ProductItem[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState("");

  // Business Avatars State
  const [avatarsList, setAvatarsList] = useState<AvatarItem[]>([
    {
      id: "av-1",
      name: "Badut McD",
      source: "Business Avatar ID: #2",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Badut",
    },
    {
      id: "av-2",
      name: "Teddy Mam",
      source: "Business Avatar ID: #1",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Teddy",
    },
    {
      id: "av-3",
      name: "Rae Schremmud",
      source: "Business Avatar ID: #5",
      image: "https://api.dicebear.com/7.x/bottts/svg?seed=Rae",
    },
  ]);
  const [searchAvatarQuery, setSearchAvatarQuery] = useState("");

  // RSS Trends State
  const [rssList, setRssList] = useState<RssItem[]>([
    {
      id: "rss-1",
      name: "Balap",
      category: "Berita Otomotif",
      source: "RSS ASEAN",
      active: true,
    },
    {
      id: "rss-2",
      name: "Sportz",
      category: "Berita Olahraga",
      source: "Top News ID",
      active: false,
    },
    {
      id: "rss-3",
      name: "Kuliner Nusantara Daily",
      category: "Kuliner & F&B",
      source: "ID Culinary Feed",
      active: true,
    },
  ]);
  const [searchRssQuery, setSearchRssQuery] = useState("");

  // Team Members State
  const [membersList, setMembersList] = useState<
    { id: string; name: string; role: string; avatar: string }[]
  >([]);
  const [searchMemberQuery, setSearchMemberQuery] = useState("");

  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  useEffect(() => {
    if (row) {
      setBizName(row.name);
      setBizCategory(row.category || "Lainnya");
      setMembersList(row.members || []);
      setPlatformsState(row.platforms || ["facebook", "linkedin"]);
      setProductsList(
        (row.products || []).map((p, idx) => ({
          id: p.id || `P-${idx + 1}`,
          name: p.name,
          price: p.price,
          category: "Menu Utama",
          description: "Hidangan lezat siap saji berkualitas tinggi.",
          image: p.image,
        }))
      );
    }
  }, [row]);

  if (!row) return null;

  const handleSaveAll = () => {
    setLocalMode("view");
    toast.success("Perubahan Pengetahuan Bisnis berhasil disimpan!");
  };

  const handleDelete = () => {
    if (confirmName === row.name) {
      toast.success(`Bisnis "${row.name}" berhasil dihapus.`);
      setShowDeleteConfirm(false);
      setConfirmName("");
      onClose();
    } else {
      toast.error("Nama bisnis tidak cocok!");
    }
  };

  const handleTogglePlatform = (key: string) => {
    const isConnected = platformsState.includes(key);
    if (isConnected) {
      setPlatformsState((prev) => prev.filter((p) => p !== key));
      toast.success(`Platform ${key} berhasil diputuskan.`);
    } else {
      setPlatformsState((prev) => [...prev, key]);
      toast.success(`Platform ${key} berhasil dihubungkan.`);
    }
  };

  // Add Item Handlers
  const handleAddProduct = () => {
    const newProd: ProductItem = {
      id: `P-${Date.now()}`,
      name: `Paket Spesial Baru ${productsList.length + 1}`,
      price: 35000,
      category: "Paket Hemat",
      description: "Ayam renyah + Nasi + Minuman segar pilihan.",
      image: "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=150&h=150&fit=crop",
    };
    setProductsList((prev) => [newProd, ...prev]);
    toast.success("Produk baru berhasil ditambahkan!");
  };

  const handleDeleteProduct = (id: string) => {
    setProductsList((prev) => prev.filter((p) => p.id !== id));
    toast.success("Produk berhasil dihapus.");
  };

  const handleAddAvatar = () => {
    const names = ["Maskot Koki", "Bunda Ceria", "Chef Juna AI", "Mimin Sigap"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const newAvatar: AvatarItem = {
      id: `AV-${Date.now()}`,
      name: randomName,
      source: `Business Avatar ID: #${avatarsList.length + 1}`,
      image: `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(randomName)}`,
    };
    setAvatarsList((prev) => [newAvatar, ...prev]);
    toast.success(`Avatar "${randomName}" berhasil ditambahkan!`);
  };

  const handleDeleteAvatar = (id: string) => {
    setAvatarsList((prev) => prev.filter((a) => a.id !== id));
    toast.success("Avatar berhasil dihapus.");
  };

  const handleAddRss = () => {
    const newRss: RssItem = {
      id: `RSS-${Date.now()}`,
      name: "Tren F&B Viral ID",
      category: "Tren Kuliner",
      source: "RSS ID Feed",
      active: true,
    };
    setRssList((prev) => [newRss, ...prev]);
    toast.success("Sumber Trend RSS berhasil ditambahkan!");
  };

  const handleToggleRss = (id: string) => {
    setRssList((prev) =>
      prev.map((item) => (item.id === id ? { ...item, active: !item.active } : item))
    );
  };

  const handleDeleteRss = (id: string) => {
    setRssList((prev) => prev.filter((r) => r.id !== id));
    toast.success("Sumber RSS berhasil dihapus.");
  };

  const handleInviteMember = () => {
    const names = ["Andi Wijaya", "Siti Rahma", "Budi Santoso", "Lina Marlina"];
    const roles = ["Editor", "Viewer", "Admin"];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomRole = roles[Math.floor(Math.random() * roles.length)];
    const newMember = {
      id: `M-${Date.now()}`,
      name: randomName,
      role: randomRole,
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(randomName)}`,
    };
    setMembersList((prev) => [...prev, newMember]);
    toast.success(`${randomName} berhasil diundang sebagai ${randomRole}.`);
  };

  const handleRemoveMember = (id: string, name: string) => {
    setMembersList((prev) => prev.filter((m) => m.id !== id));
    toast.success(`${name} telah dihapus dari tim.`);
  };

  const ALL_PLATFORMS = [
    {
      key: "facebook",
      name: "Facebook",
      handle: "Postmatic.id",
      icon: Facebook,
      color: "text-blue-600 bg-blue-50 border-blue-100",
    },
    {
      key: "instagram",
      name: "Instagram",
      handle: "Belum terhubung",
      icon: Instagram,
      color: "text-pink-600 bg-pink-50 border-pink-100",
    },
    {
      key: "linkedin",
      name: "LinkedIn",
      handle: "Strix Lans",
      icon: Linkedin,
      color: "text-indigo-600 bg-indigo-50 border-indigo-100",
    },
  ];

  const filteredProducts = productsList.filter((p) =>
    p.name.toLowerCase().includes(searchProductQuery.toLowerCase())
  );

  const filteredAvatars = avatarsList.filter((a) =>
    a.name.toLowerCase().includes(searchAvatarQuery.toLowerCase())
  );

  const filteredRss = rssList.filter((r) =>
    r.name.toLowerCase().includes(searchRssQuery.toLowerCase())
  );

  const filteredMembers = membersList.filter(
    (m) =>
      m.name.toLowerCase().includes(searchMemberQuery.toLowerCase()) ||
      m.role.toLowerCase().includes(searchMemberQuery.toLowerCase())
  );

  return (
    <>
      <DetailModal
        open={!!row}
        onOpenChange={(v) => !v && onClose()}
        title={localMode === "edit" ? `Edit Pengetahuan Dasar — ${bizName}` : `Pengetahuan Dasar`}
        description="Kelola Media Sosial Anda Secara Otomatis dengan Postmatic."
        size="xl"
        footer={
          <div className="flex flex-wrap items-center justify-between w-full gap-3">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowDeleteConfirm(true)}
              className="text-xs"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Hapus Bisnis
            </Button>
            <div className="flex items-center gap-2">
              {localMode === "edit" ? (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => setLocalMode("view")}
                  >
                    Batal
                  </Button>
                  <Button
                    size="sm"
                    className="text-xs bg-blue-600 hover:bg-blue-700 text-white"
                    onClick={handleSaveAll}
                  >
                    <Save className="h-3.5 w-3.5 mr-1.5" /> Simpan Perubahan
                  </Button>
                </>
              ) : (
                <Button
                  size="sm"
                  className="text-xs bg-slate-900 hover:bg-slate-800 text-white"
                  onClick={() => setLocalMode("edit")}
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1.5" /> Edit Pengetahuan Bisnis
                </Button>
              )}
            </div>
          </div>
        }
      >
        {/* Top Toggle & Status Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                localMode === "edit"
                  ? "bg-amber-100 text-amber-800 border border-amber-200"
                  : "bg-blue-50 text-blue-700 border border-blue-100"
              }`}
            >
              {localMode === "edit" ? (
                <>
                  <Edit3 className="h-3.5 w-3.5" /> Mode Edit Aktif
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" /> Mode Tampilan
                </>
              )}
            </span>
            <span className="text-xs text-slate-400 font-medium">ID Workspace: {row.id}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocalMode(localMode === "edit" ? "view" : "edit")}
            className="text-xs h-8"
          >
            {localMode === "edit" ? "Kembali ke Tampilan" : "Aktifkan Mode Edit"}
          </Button>
        </div>

        {/* ========================================================
            VERTICAL CARD STACK (Menurun Ke Bawah)
        ======================================================== */}
        <div className="flex flex-col space-y-6">
          {/* CARD 1: PENGETAHUAN BISNIS */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs transition-all">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pengetahuan Bisnis</h3>
                <p className="text-xs text-slate-500">
                  Informasi dasar profil bisnis yang digunakan oleh AI Postmatic
                </p>
              </div>
              {localMode === "view" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocalMode("edit")}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              )}
            </div>

            {localMode === "edit" ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Nama Bisnis</Label>
                    <Input
                      value={bizName}
                      onChange={(e) => setBizName(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Kategori</Label>
                    <Input
                      value={bizCategory}
                      onChange={(e) => setBizCategory(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Nomor Telepon</Label>
                    <Input
                      value={bizPhone}
                      onChange={(e) => setBizPhone(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label className="text-xs font-semibold">Situs Web</Label>
                    <Input
                      value={bizWebsite}
                      onChange={(e) => setBizWebsite(e.target.value)}
                      className="text-xs h-9"
                    />
                  </div>
                </div>

                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Deskripsi Bisnis</Label>
                  <Textarea
                    value={bizDescription}
                    onChange={(e) => setBizDescription(e.target.value)}
                    rows={4}
                    className="text-xs"
                    placeholder="Jelaskan mengenai bisnis Anda secara rinci..."
                  />
                </div>

                <div className="grid gap-1.5 max-w-xs">
                  <Label className="text-xs font-semibold">Warna Tone Bisnis</Label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={bizColor}
                      onChange={(e) => setBizColor(e.target.value)}
                      className="h-9 w-12 rounded-lg border border-slate-200 cursor-pointer p-0.5"
                    />
                    <Input
                      value={bizColor}
                      onChange={(e) => setBizColor(e.target.value)}
                      className="text-xs font-mono h-9 uppercase"
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {/* Logo and Identity */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <img
                      src={row.logo}
                      alt={bizName}
                      className="h-14 w-14 rounded-xl bg-slate-50 object-cover border border-slate-200 shadow-2xs"
                    />
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-slate-800">{bizName}</h4>
                        <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100">
                          {bizCategory}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-1 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-slate-400" /> {bizPhone}
                        </span>
                        <a
                          href={bizWebsite}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" /> {bizWebsite}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <div>
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                        Warna Tone Bisnis
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className="h-4 w-4 rounded-full border border-slate-300 shadow-2xs"
                          style={{ backgroundColor: bizColor }}
                        />
                        <span className="text-xs font-bold font-mono text-slate-700">
                          {bizColor}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description Paragraph */}
                <div>
                  <span className="text-xs font-bold text-slate-700 block mb-1.5">
                    Deskripsi & Latar Belakang Bisnis
                  </span>
                  <p className="text-xs leading-relaxed text-slate-600 bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                    {bizDescription}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* CARD 2: PENGETAHUAN PERAN (Sasaran Audiens, Nuansa Konten, Hashtag) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Pengetahuan Peran</h3>
                <p className="text-xs text-slate-500">
                  Panduan audiens dan kepribadian konten media sosial
                </p>
              </div>
              {localMode === "view" && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setLocalMode("edit")}
                  className="text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-8"
                >
                  <Edit3 className="h-3.5 w-3.5 mr-1" /> Edit
                </Button>
              )}
            </div>

            {localMode === "edit" ? (
              <div className="space-y-4">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Sasaran Audiens</Label>
                  <Textarea
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    rows={2}
                    className="text-xs"
                    placeholder="Contoh: Ibu rumah tangga, pekerja kantor..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Nuansa Konten</Label>
                  <Textarea
                    value={contentNuance}
                    onChange={(e) => setContentNuance(e.target.value)}
                    rows={2}
                    className="text-xs"
                    placeholder="Contoh: Hangat, menggugah selera, akrab..."
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold">Hashtag Utama</Label>
                  <Input
                    value={hashtags}
                    onChange={(e) => setHashtags(e.target.value)}
                    className="text-xs h-9"
                    placeholder="Contoh: #HaraChicken, #KulinerNusantara..."
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <Target className="h-4 w-4 text-blue-600" />
                    Sasaran Audiens
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{targetAudience}</p>
                </div>

                <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <MessageSquare className="h-4 w-4 text-amber-600" />
                    Nuansa Konten
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{contentNuance}</p>
                </div>

                <div className="rounded-xl bg-slate-50/80 border border-slate-100 p-4">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-800 mb-2">
                    <Hash className="h-4 w-4 text-green-600" />
                    Hashtag
                  </div>
                  <div className="flex flex-wrap gap-1.5 mt-1">
                    {hashtags.split(",").map((tag, i) => (
                      <span
                        key={i}
                        className="bg-white border border-slate-200 text-slate-700 text-[11px] font-medium px-2 py-0.5 rounded-md"
                      >
                        {tag.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CARD 3: MEDIA SOSIAL */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">Media Sosial</h3>
                <p className="text-xs text-slate-500">
                  Akun media sosial yang terhubung untuk penjadwalan otomatis
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {ALL_PLATFORMS.map((platform) => {
                const Icon = platform.icon;
                const isConnected = platformsState.includes(platform.key);
                return (
                  <div
                    key={platform.key}
                    className="flex items-center justify-between border border-slate-200/80 rounded-xl p-3.5 bg-white hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg border ${platform.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          {platform.name}
                        </span>
                        <span
                          className={`text-[11px] font-medium ${
                            isConnected ? "text-slate-600" : "text-slate-400 italic"
                          }`}
                        >
                          {isConnected ? platform.handle : "Belum terhubung"}
                        </span>
                      </div>
                    </div>

                    <Button
                      variant={isConnected ? "outline" : "default"}
                      size="sm"
                      onClick={() => handleTogglePlatform(platform.key)}
                      className={`text-xs h-8 px-3 rounded-lg ${
                        isConnected
                          ? "border-slate-200 text-slate-600 hover:bg-red-50 hover:text-red-600 hover:border-red-200"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                    >
                      {isConnected ? "Putuskan" : "Hubungkan"}
                    </Button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 4: PRODUK ANDA */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Produk Anda ({productsList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Daftar produk atau menu yang akan dipromosikan AI Postmatic
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Cari produk anda..."
                    value={searchProductQuery}
                    onChange={(e) => setSearchProductQuery(e.target.value)}
                    className="pl-8 text-xs h-8 bg-slate-50 border-slate-200"
                  />
                </div>
                <Button
                  onClick={handleAddProduct}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-lg whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Produk
                </Button>
              </div>
            </div>

            {filteredProducts.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <ShoppingBag className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Belum ada produk yang cocok</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredProducts.map((p) => (
                  <div
                    key={p.id}
                    className="flex items-start justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-white hover:border-slate-200 transition-all group"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="h-12 w-12 rounded-lg object-cover border border-slate-200 bg-white shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800 line-clamp-1">{p.name}</h4>
                          <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 border border-blue-100 px-1.5 py-0.5 rounded">
                            {formatRp(p.price)}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                          {p.description}
                        </p>
                      </div>
                    </div>

                    {(localMode === "edit" || mode === "edit") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteProduct(p.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50 shrink-0"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 5: AVATAR BISNIS */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Avatar Bisnis ({avatarsList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Karakter atau persona AI yang mewakili suara merek bisnis Anda
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Cari avatar..."
                    value={searchAvatarQuery}
                    onChange={(e) => setSearchAvatarQuery(e.target.value)}
                    className="pl-8 text-xs h-8 bg-slate-50 border-slate-200"
                  />
                </div>
                <Button
                  onClick={handleAddAvatar}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-lg whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Tambah Avatar
                </Button>
              </div>
            </div>

            {filteredAvatars.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Smile className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Avatar tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {filteredAvatars.map((avatar) => (
                  <div
                    key={avatar.id}
                    className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={avatar.image}
                        alt={avatar.name}
                        className="h-10 w-10 rounded-full bg-white border border-slate-200 p-0.5"
                      />
                      <div>
                        <span className="block text-xs font-bold text-slate-800">
                          {avatar.name}
                        </span>
                        <span className="text-[10px] text-slate-400">{avatar.source}</span>
                      </div>
                    </div>

                    {(localMode === "edit" || mode === "edit") && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteAvatar(avatar.id)}
                        className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 6: SUMBER TREND RSS */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Sumber Trend RSS ({rssList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Sumber berita otomatis untuk inspirasi ide konten terpopuler
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Cari RSS anda..."
                    value={searchRssQuery}
                    onChange={(e) => setSearchRssQuery(e.target.value)}
                    className="pl-8 text-xs h-8 bg-slate-50 border-slate-200"
                  />
                </div>
                <Button
                  onClick={handleAddRss}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-lg whitespace-nowrap"
                >
                  <Plus className="h-3.5 w-3.5 mr-1" /> Tambah RSS
                </Button>
              </div>
            </div>

            {filteredRss.length === 0 ? (
              <div className="text-center py-8 bg-slate-50/60 rounded-xl border border-dashed border-slate-200">
                <Rss className="h-8 w-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-500 font-medium">Sumber RSS tidak ditemukan</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {filteredRss.map((rss) => (
                  <div
                    key={rss.id}
                    className="flex items-center justify-between p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-slate-200 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-lg bg-orange-50 text-orange-600 border border-orange-100">
                        <Rss className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-800">{rss.name}</span>
                          <span className="text-[10px] font-medium text-slate-500 bg-slate-200/60 px-1.5 py-0.5 rounded">
                            {rss.category}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 block">{rss.source}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-[10px] font-bold ${
                            rss.active ? "text-green-600" : "text-slate-400"
                          }`}
                        >
                          {rss.active ? "Aktif" : "Tidak Aktif"}
                        </span>
                        <Switch
                          checked={rss.active}
                          onCheckedChange={() => handleToggleRss(rss.id)}
                        />
                      </div>

                      {(localMode === "edit" || mode === "edit") && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteRss(rss.id)}
                          className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* CARD 7: ANGGOTA TIM (Opsional namun lengkap) */}
          <div className="rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Anggota Tim ({membersList.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Tim yang memiliki akses untuk mengelola pengetahuan bisnis ini
                </p>
              </div>

              <div className="flex items-center gap-2">
                <div className="relative w-full sm:w-56">
                  <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
                  <Input
                    placeholder="Cari anggota tim..."
                    value={searchMemberQuery}
                    onChange={(e) => setSearchMemberQuery(e.target.value)}
                    className="pl-8 text-xs h-8 bg-slate-50 border border-slate-200"
                  />
                </div>
                <Button
                  onClick={handleInviteMember}
                  size="sm"
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-8 px-3 rounded-lg whitespace-nowrap"
                >
                  <UserPlus className="h-3.5 w-3.5 mr-1" /> Undang
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {filteredMembers.map((m) => (
                <div
                  key={m.id}
                  className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50/60"
                >
                  <div className="flex items-center gap-2.5">
                    <img
                      src={m.avatar}
                      alt={m.name}
                      className="h-8 w-8 rounded-full border border-slate-200 bg-white"
                    />
                    <div>
                      <span className="block text-xs font-bold text-slate-800">{m.name}</span>
                      <span className="text-[10px] text-slate-500 font-medium">{m.role}</span>
                    </div>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveMember(m.id, m.name)}
                    className="h-7 w-7 text-slate-400 hover:text-red-600 hover:bg-red-50"
                  >
                    <X className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DetailModal>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onOpenChange={(v) => {
          setShowDeleteConfirm(v);
          if (!v) setConfirmName("");
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              <AlertCircle className="h-5 w-5" /> Hapus Bisnis
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus bisnis ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="grid gap-1.5">
              <Label htmlFor="delete-confirm-name">
                Ketik <strong className="text-foreground">"{row.name}"</strong> untuk mengonfirmasi:
              </Label>
              <Input
                id="delete-confirm-name"
                value={confirmName}
                onChange={(e) => setConfirmName(e.target.value)}
                placeholder={row.name}
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => {
                setShowDeleteConfirm(false);
                setConfirmName("");
              }}
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName !== row.name}
            >
              Ya, Hapus Bisnis
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
