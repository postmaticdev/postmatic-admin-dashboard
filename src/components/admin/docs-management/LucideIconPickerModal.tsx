import React, { useState } from "react";
import {
  FileText,
  BookOpen,
  Book,
  FileCode,
  Code2,
  Terminal,
  Key,
  Shield,
  Lock,
  Unlock,
  Database,
  Server,
  Cloud,
  Cpu,
  Globe,
  Webhook,
  Send,
  MessageSquare,
  Mail,
  Bell,
  Users,
  User,
  UserCheck,
  Settings,
  Sliders,
  Wrench,
  Zap,
  Sparkles,
  Layers,
  Box,
  Archive,
  Folder,
  FolderOpen,
  File,
  CheckCircle2,
  AlertTriangle,
  Info,
  HelpCircle,
  Activity,
  BarChart3,
  PieChart,
  TrendingUp,
  GitBranch,
  Workflow,
  Compass,
  Layout,
  Smartphone,
  Monitor,
  Radio,
  Wifi,
  Share2,
  Link2,
  ExternalLink,
  Copy,
  Download,
  Upload,
  RefreshCw,
  Play,
  Search,
  Tag,
  Bookmark,
  Star,
  ShieldCheck,
  Rocket,
  Target,
  Briefcase,
  Calendar,
  Clock,
  X,
} from "lucide-react";

export interface LucideIconOption {
  name: string;
  label: string;
  category: string;
  icon: React.ComponentType<{ className?: string }>;
}

export const LUCIDE_ICONS_LIST: LucideIconOption[] = [
  // Docs & Books
  { name: "FileText", label: "File Text", category: "Dokumen", icon: FileText },
  { name: "BookOpen", label: "Book Open", category: "Dokumen", icon: BookOpen },
  { name: "Book", label: "Book", category: "Dokumen", icon: Book },
  { name: "FileCode", label: "File Code", category: "Dokumen", icon: FileCode },
  { name: "File", label: "File", category: "Dokumen", icon: File },
  { name: "Folder", label: "Folder", category: "Dokumen", icon: Folder },
  { name: "FolderOpen", label: "Folder Open", category: "Dokumen", icon: FolderOpen },
  { name: "Archive", label: "Archive", category: "Dokumen", icon: Archive },

  // Code & Developer
  { name: "Code2", label: "Code", category: "Kode & API", icon: Code2 },
  { name: "Terminal", label: "Terminal", category: "Kode & API", icon: Terminal },
  { name: "Webhook", label: "Webhook", category: "Kode & API", icon: Webhook },
  { name: "GitBranch", label: "Git Branch", category: "Kode & API", icon: GitBranch },
  { name: "Workflow", label: "Workflow", category: "Kode & API", icon: Workflow },
  { name: "Layers", label: "Layers", category: "Kode & API", icon: Layers },
  { name: "Box", label: "Box", category: "Kode & API", icon: Box },

  // Security & Authentication
  { name: "Key", label: "API Key", category: "Keamanan", icon: Key },
  { name: "Shield", label: "Shield", category: "Keamanan", icon: Shield },
  { name: "ShieldCheck", label: "Shield Check", category: "Keamanan", icon: ShieldCheck },
  { name: "Lock", label: "Lock", category: "Keamanan", icon: Lock },
  { name: "Unlock", label: "Unlock", category: "Keamanan", icon: Unlock },

  // Cloud & Infrastructure
  { name: "Database", label: "Database", category: "Infrastruktur", icon: Database },
  { name: "Server", label: "Server", category: "Infrastruktur", icon: Server },
  { name: "Cloud", label: "Cloud", category: "Infrastruktur", icon: Cloud },
  { name: "Cpu", label: "CPU", category: "Infrastruktur", icon: Cpu },
  { name: "Globe", label: "Globe / Web", category: "Infrastruktur", icon: Globe },
  { name: "Wifi", label: "Network WiFi", category: "Infrastruktur", icon: Wifi },

  // Messaging & Communications
  { name: "Send", label: "Send Message", category: "Pesan", icon: Send },
  { name: "MessageSquare", label: "Chat Message", category: "Pesan", icon: MessageSquare },
  { name: "Mail", label: "Email", category: "Pesan", icon: Mail },
  { name: "Bell", label: "Notification", category: "Pesan", icon: Bell },

  // Users & Roles
  { name: "Users", label: "Users Team", category: "Pengguna", icon: Users },
  { name: "User", label: "User Single", category: "Pengguna", icon: User },
  { name: "UserCheck", label: "User Verified", category: "Pengguna", icon: UserCheck },
  { name: "Briefcase", label: "Business", category: "Pengguna", icon: Briefcase },

  // Settings & Tools
  { name: "Settings", label: "Settings", category: "Pengaturan", icon: Settings },
  { name: "Sliders", label: "Sliders", category: "Pengaturan", icon: Sliders },
  { name: "Wrench", label: "Wrench Tool", category: "Pengaturan", icon: Wrench },
  { name: "Zap", label: "Lightning Zap", category: "Pengaturan", icon: Zap },
  { name: "Sparkles", label: "AI Sparkles", category: "Pengaturan", icon: Sparkles },
  { name: "Rocket", label: "Rocket Launch", category: "Pengaturan", icon: Rocket },
  { name: "Target", label: "Target", category: "Pengaturan", icon: Target },

  // Status & Analytics
  { name: "CheckCircle2", label: "Success Check", category: "Status", icon: CheckCircle2 },
  { name: "AlertTriangle", label: "Warning Alert", category: "Status", icon: AlertTriangle },
  { name: "Info", label: "Information", category: "Status", icon: Info },
  { name: "HelpCircle", label: "Help Guide", category: "Status", icon: HelpCircle },
  { name: "Activity", label: "Activity Logs", category: "Analisis", icon: Activity },
  { name: "BarChart3", label: "Bar Chart", category: "Analisis", icon: BarChart3 },
  { name: "PieChart", label: "Pie Chart", category: "Analisis", icon: PieChart },
  { name: "TrendingUp", label: "Trending Up", category: "Analisis", icon: TrendingUp },

  // UI & Actions
  { name: "Layout", label: "Layout UI", category: "UI", icon: Layout },
  { name: "Compass", label: "Compass Guide", category: "UI", icon: Compass },
  { name: "Smartphone", label: "Mobile Device", category: "UI", icon: Smartphone },
  { name: "Monitor", label: "Monitor Screen", category: "UI", icon: Monitor },
  { name: "Link2", label: "Link URL", category: "Aksi", icon: Link2 },
  { name: "ExternalLink", label: "External Link", category: "Aksi", icon: ExternalLink },
  { name: "Copy", label: "Copy Duplicate", category: "Aksi", icon: Copy },
  { name: "Download", label: "Download", category: "Aksi", icon: Download },
  { name: "Upload", label: "Upload", category: "Aksi", icon: Upload },
  { name: "RefreshCw", label: "Refresh Sync", category: "Aksi", icon: RefreshCw },
  { name: "Tag", label: "Tag Label", category: "Aksi", icon: Tag },
  { name: "Bookmark", label: "Bookmark", category: "Aksi", icon: Bookmark },
  { name: "Star", label: "Favorite Star", category: "Aksi", icon: Star },
  { name: "Calendar", label: "Calendar Date", category: "Waktu", icon: Calendar },
  { name: "Clock", label: "Clock Time", category: "Waktu", icon: Clock },
];

export function renderLucideIcon(
  iconName?: string,
  className = "h-4 w-4 text-primary"
): React.ReactNode {
  if (!iconName) {
    return <FileText className={className} />;
  }
  const found = LUCIDE_ICONS_LIST.find((item) => item.name === iconName);
  if (found) {
    const IconComp = found.icon;
    return <IconComp className={className} />;
  }
  return <FileText className={className} />;
}

interface LucideIconPickerModalProps {
  open: boolean;
  selectedIcon: string;
  onSelect: (iconName: string) => void;
  onClose: () => void;
}

export function LucideIconPickerModal({
  open,
  selectedIcon,
  onSelect,
  onClose,
}: LucideIconPickerModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  if (!open) return null;

  const categories = [
    "Semua",
    "Dokumen",
    "Kode & API",
    "Keamanan",
    "Infrastruktur",
    "Pesan",
    "Pengguna",
    "Pengaturan",
    "Status",
    "Analisis",
  ];

  const filteredIcons = LUCIDE_ICONS_LIST.filter((item) => {
    const matchCategory =
      selectedCategory === "Semua" || item.category === selectedCategory;
    const matchSearch =
      item.label.toLowerCase().includes(search.toLowerCase()) ||
      item.name.toLowerCase().includes(search.toLowerCase());
    return matchCategory && matchSearch;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-2xl shadow-2xl flex flex-col max-h-[85vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-border pb-4 mb-4">
          <div>
            <h3 className="text-base font-bold text-foreground">
              Pilih Ikon Dokumen (Lucide Icons)
            </h3>
            <p className="text-xs text-muted-foreground">
              Pilih ikon yang akan ditampilkan di samping judul dokumen.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari ikon Lucide (misal: File, Code, API Key, Database, Send)..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap items-center gap-1.5 mb-4 pb-2 border-b border-border/60 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                selectedCategory === cat
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Icons Grid */}
        <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-7 gap-2 overflow-y-auto pr-1 flex-1 min-h-[220px]">
          {filteredIcons.map((item) => {
            const IconComp = item.icon;
            const isSelected = selectedIcon === item.name;
            return (
              <button
                key={item.name}
                type="button"
                onClick={() => {
                  onSelect(item.name);
                  onClose();
                }}
                className={`flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all text-center group ${
                  isSelected
                    ? "border-primary bg-primary/10 text-primary ring-2 ring-primary/20"
                    : "border-border bg-background hover:bg-muted/60 text-foreground hover:border-primary/40"
                }`}
                title={`${item.label} (${item.name})`}
              >
                <IconComp
                  className={`h-6 w-6 mb-1.5 transition-transform group-hover:scale-110 ${
                    isSelected ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                  }`}
                />
                <span className="text-[10px] font-medium truncate w-full">
                  {item.name}
                </span>
              </button>
            );
          })}
          {filteredIcons.length === 0 && (
            <div className="col-span-full py-12 text-center text-muted-foreground text-sm">
              Ikon dengan kata kunci "{search}" tidak ditemukan.
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-end gap-2 border-t border-border pt-4 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold border border-border bg-background hover:bg-muted text-foreground transition-all"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
}
