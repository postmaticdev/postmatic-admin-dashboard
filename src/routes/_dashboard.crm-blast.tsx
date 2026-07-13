import { useState, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { cn } from "@/lib/utils";
import {
  Megaphone,
  Plus,
  Search,
  Calendar,
  Users,
  Eye,
  ChevronDown,
  X,
  MessageCircle,
  Mail,
  Globe,
  CheckCircle2,
  Bold,
  Italic,
  Underline,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  ArrowLeft,
  Send,
  Upload,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useTickets } from "@/contexts/TicketsContext";

export const Route = createFileRoute("/_dashboard/crm-blast")({
  component: CrmBlastPage,
});

interface BlastCampaign {
  id: string;
  campaignName: string;
  platform: "whatsapp" | "gmail" | "website";
  status: "success" | "schedule";
  assign: number;
  dateTime: string;
  message: string;
  subject?: string;
  targets: string;
}

interface ContactUser {
  id: string;
  name: string;
  handle: string;
  role: "user" | "admin" | "business";
}

const MOCK_USERS: ContactUser[] = [
  { id: "u-1", name: "Hasanudin", handle: "+62 812-1000-5000", role: "user" },
  { id: "u-2", name: "Ahmad Jalal", handle: "ahmad.jalal@gmail.com", role: "admin" },
  { id: "u-3", name: "Budi Santoso", handle: "+62 813-1111-5077", role: "business" },
  { id: "u-4", name: "Citra Dewi", handle: "citra.dewi@gmail.com", role: "user" },
  { id: "u-5", name: "Eko Prasetyo", handle: "+62 814-1222-5154", role: "admin" },
  { id: "u-6", name: "Farida Utami", handle: "farida@website.com", role: "business" },
  { id: "u-7", name: "Gita Amanda", handle: "+62 815-1333-5231", role: "user" },
  { id: "u-8", name: "Heri Wibowo", handle: "heri.wibowo@gmail.com", role: "admin" },
  { id: "u-9", name: "Indra Wijaya", handle: "+62 816-1444-5308", role: "business" },
  { id: "u-10", name: "Kartika Sari", handle: "kartika.sari@gmail.com", role: "user" },
  { id: "u-11", name: "Luthfi Hakim", handle: "+62 817-1555-5385", role: "admin" },
  { id: "u-12", name: "Mega Utami", handle: "+62 818-1666-5462", role: "business" },
  { id: "u-13", name: "Naufal Hadi", handle: "+62 819-1777-5539", role: "user" },
  { id: "u-14", name: "Olivia Rian", handle: "+62 820-1888-5616", role: "admin" },
  { id: "u-15", name: "Putra Perdana", handle: "+62 821-1999-5693", role: "business" },
  { id: "u-16", name: "Rian Hidayat", handle: "+62 822-2110-5770", role: "user" },
  { id: "u-17", name: "Siti Rahma", handle: "+62 823-2221-5847", role: "business" },
];

const INITIAL_BLASTS: BlastCampaign[] = [
  {
    id: "b-1",
    campaignName: "Promo Gajian Spektakuler",
    platform: "whatsapp",
    status: "success",
    assign: 3,
    dateTime: "12 Jul 2026, 10:00",
    message: "Promo Gajian Spektakuler! Dapatkan diskon 50% untuk semua produk premium khusus hari ini dengan kode voucher GAJIAN50. Hubungi CS untuk order.",
    targets: "+62 812-1000-5000, +62 813-1111-5077, +62 814-1222-5154",
  },
  {
    id: "b-2",
    campaignName: "Monthly Product Newsletter",
    platform: "gmail",
    status: "success",
    assign: 3,
    dateTime: "10 Jul 2026, 09:15",
    subject: "Update Fitur Postmatic - Juli 2026",
    message: "Halo rekan-rekan, berikut update bulanan fitur terbaru Postmatic, termasuk rich editor and CRM Blast. Selamat menggunakan!",
    targets: "ahmad.jalal@gmail.com, citra.dewi@gmail.com, heri.wibowo@gmail.com",
  },
  {
    id: "b-3",
    campaignName: "Pengumuman Maintenance Server",
    platform: "website",
    status: "schedule",
    assign: 2,
    dateTime: "15 Jul 2026, 23:00",
    subject: "Pemberitahuan Pemeliharaan Sistem",
    message: "Sistem website report akan mengalami maintenance berkala pada hari Rabu, 15 Juli jam 23:00 - Kamis 01:00 WIB. Terima kasih atas pengertiannya.",
    targets: "farida@website.com, kartika.sari@gmail.com",
  },
];

function CrmBlastPage() {
  const { createTicket } = useTickets();
  const [blasts, setBlasts] = useState<BlastCampaign[]>(INITIAL_BLASTS);
  const [searchQuery, setSearchQuery] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Detail Dialog modal states
  const [selectedBlast, setSelectedBlast] = useState<BlastCampaign | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // Recipient List dialog modal states (from clicking Assign)
  const [isRecipientListOpen, setIsRecipientListOpen] = useState(false);
  const [recipientSearch, setRecipientSearch] = useState("");

  // Dropdown states
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [actionDropdownOpen, setActionDropdownOpen] = useState(false);

  // View state: 'list' | 'create'
  const [viewMode, setViewMode] = useState<"list" | "create">("list");
  const [activePlatform, setActivePlatform] = useState<"whatsapp" | "gmail" | "website">("whatsapp");

  // Form states
  const [campaignName, setCampaignName] = useState("");
  const [targetGroup, setTargetGroup] = useState("");
  const [manualInput, setManualInput] = useState("");
  const [scheduleTime, setScheduleTime] = useState("");
  const [composeSubject, setComposeSubject] = useState("");
  const [composeMessage, setComposeMessage] = useState("");

  // Schedule modal state
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);

  // Import users modal states
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [importSearch, setImportSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<"user" | "admin" | "business">("user");

  const filteredBlasts = blasts.filter((b) =>
    b.campaignName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDetail = (blast: BlastCampaign) => {
    setSelectedBlast(blast);
    setIsDetailOpen(true);
    setIsRecipientListOpen(false);
    setRecipientSearch("");
  };

  const handleStartCreate = (platform: "whatsapp" | "gmail" | "website") => {
    setActivePlatform(platform);
    setCampaignName("");
    setTargetGroup("");
    setManualInput("");
    setScheduleTime("");
    setComposeSubject("");
    setComposeMessage("");
    setDropdownOpen(false);
    setActionDropdownOpen(false);
    setIsScheduleModalOpen(false);
    setViewMode("create");
  };

  const handleSaveBlast = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Add manualInput remaining if exists
    let finalTargets = targetGroup.trim();
    if (manualInput.trim()) {
      finalTargets = finalTargets ? `${finalTargets}, ${manualInput.trim()}` : manualInput.trim();
    }

    if (!campaignName.trim() || !composeMessage.trim() || !finalTargets) return;
    if (activePlatform !== "whatsapp" && !composeSubject.trim()) return;

    const targetList = finalTargets.split(",").map((s) => s.trim()).filter(Boolean);
    const assignCount = targetList.length;

    const newBlast: BlastCampaign = {
      id: `b-${Date.now()}`,
      campaignName: campaignName.trim(),
      platform: activePlatform,
      status: "success",
      assign: assignCount || 1,
      dateTime: new Date().toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      message: composeMessage,
      subject: activePlatform !== "whatsapp" ? composeSubject : undefined,
      targets: finalTargets,
    };

    setBlasts([newBlast, ...blasts]);

    // Create room chats in Customer Service for each target recipient
    targetList.forEach((handle, idx) => {
      const matchedUser = MOCK_USERS.find((u) => u.handle.toLowerCase() === handle.toLowerCase());
      const contactName = matchedUser ? matchedUser.name : handle;
      const cleanSnippet = composeMessage.replace(/<[^>]*>?/gm, "").substring(0, 100);

      createTicket({
        source: activePlatform,
        subject: activePlatform !== "whatsapp" ? (composeSubject.trim() || campaignName.trim()) : campaignName.trim(),
        snippet: cleanSnippet,
        senderName: contactName,
        senderHandle: handle,
        senderAvatar: `https://i.pravatar.cc/80?u=${encodeURIComponent(handle)}`,
        status: "blast",
        isSavedAsTicket: true,
        messages: [
          {
            id: `msg-blast-${Date.now()}-${idx}`,
            authorId: "cs",
            authorName: "CS Postmatic",
            subject: activePlatform !== "whatsapp" ? (composeSubject.trim() || campaignName.trim()) : undefined,
            content: composeMessage,
            createdAt: new Date().toISOString(),
            direction: "out",
          },
        ],
      });
    });

    setViewMode("list");
  };

  const insertHtmlAtCursor = (html: string) => {
    const sel = window.getSelection();
    if (sel && sel.getRangeAt && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else {
      const editor = document.getElementById("rich-blast-editor");
      if (editor) {
        editor.innerHTML += html;
      }
    }
    const editor = document.getElementById("rich-blast-editor");
    if (editor) {
      setComposeMessage(editor.innerHTML);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          let htmlToInsert = "";

          if (file.type.startsWith("image/")) {
            htmlToInsert = `<img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; max-height: 240px; display: block; border-radius: 6px; margin: 8px 0; border: 1px solid var(--border);" />`;
          } else if (file.type.startsWith("video/")) {
            htmlToInsert = `<video src="${dataUrl}" controls style="max-width: 100%; max-height: 240px; display: block; border-radius: 6px; margin: 8px 0; border: 1px solid var(--border);"></video>`;
          } else {
            htmlToInsert = `<a href="${dataUrl}" download="${file.name}" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; text-decoration: underline; font-weight: 500; font-size: 12px; margin: 4px 0; color: inherit;">📎 ${file.name}</a>`;
          }

          if (activePlatform === "whatsapp") {
            setComposeMessage((prev) => (prev ? `${prev}\n[File: ${file.name}]` : `[File: ${file.name}]`));
          } else {
            insertHtmlAtCursor(htmlToInsert);
          }
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleConfirmSchedule = () => {
    let finalTargets = targetGroup.trim();
    if (manualInput.trim()) {
      finalTargets = finalTargets ? `${finalTargets}, ${manualInput.trim()}` : manualInput.trim();
    }

    if (!campaignName.trim() || !composeMessage.trim() || !finalTargets || !scheduleTime) return;
    if (activePlatform !== "whatsapp" && !composeSubject.trim()) return;

    const assignCount = finalTargets.split(",").map((s) => s.trim()).filter(Boolean).length;

    const newBlast: BlastCampaign = {
      id: `b-${Date.now()}`,
      campaignName: campaignName.trim(),
      platform: activePlatform,
      status: "schedule",
      assign: assignCount || 1,
      dateTime: new Date(scheduleTime).toLocaleString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }),
      message: composeMessage,
      subject: activePlatform !== "whatsapp" ? composeSubject : undefined,
      targets: finalTargets,
    };

    setBlasts([newBlast, ...blasts]);
    setIsScheduleModalOpen(false);
    setViewMode("list");
  };

  // Helper formatting tool exec command
  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    const editor = document.getElementById("rich-blast-editor");
    if (editor) {
      setComposeMessage(editor.innerHTML);
    }
  };

  // Import Modal Handlers
  const filteredUsers = MOCK_USERS.filter((u) => {
    if (activePlatform === "whatsapp") {
      if (!u.handle.startsWith("+")) return false;
    } else if (activePlatform === "gmail") {
      if (!u.handle.includes("@")) return false;
    }
    
    // Filter by active Tab Category (role)
    if (u.role !== activeTab) return false;

    const term = importSearch.toLowerCase();
    return u.name.toLowerCase().includes(term) || u.handle.toLowerCase().includes(term);
  });

  const handleToggleUser = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleToggleSelectAll = () => {
    const visibleIds = filteredUsers.map((u) => u.id);
    const allSelected = visibleIds.every((id) => selectedUserIds.includes(id));
    if (allSelected) {
      setSelectedUserIds((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setSelectedUserIds((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleImportConfirm = () => {
    const selectedHandles = MOCK_USERS.filter((u) => selectedUserIds.includes(u.id)).map((u) => u.handle);
    if (selectedHandles.length > 0) {
      const handlesString = selectedHandles.join(", ");
      setTargetGroup((prev) => (prev.trim() ? `${prev.trim()}, ${handlesString}` : handlesString));
    }
    setIsImportOpen(false);
  };

  // Recipient Validation Logic
  const isValidHandle = (handle: string) => {
    const clean = handle.trim();
    if (!clean) return true;
    if (activePlatform === "whatsapp") {
      // Must be a valid phone number (digits, hyphens, spaces, optional plus)
      return /^\+?[0-9\s\-()]{8,20}$/.test(clean);
    } else if (activePlatform === "gmail") {
      // Must be a valid email format
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean);
    }
    return true; // generic website tags
  };

  const parsedTargets = targetGroup.split(",").map((s) => s.trim()).filter(Boolean);
  const hasInvalidTargets = parsedTargets.some((t) => !isValidHandle(t));

  const hasTargets = targetGroup.trim() || manualInput.trim();
  const isFormValid = campaignName.trim() && composeMessage.trim() && hasTargets && !hasInvalidTargets && (activePlatform === "whatsapp" || composeSubject.trim());

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground relative">
      {viewMode === "list" ? (
        <>
          {/* Header */}
          <header className="flex items-center justify-between border-b border-border bg-card px-6 py-4 shrink-0">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
                <Megaphone className="h-5 w-5 text-primary" />
                CRM Blast
              </h1>
              <p className="text-xs text-muted-foreground">Kelola dan kirim broadcast campaign pelanggan Anda</p>
            </div>

            {/* Create Button Dropdown */}
            <div className="relative">
              <Button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="h-9 gap-1.5 px-4 font-semibold text-sm shadow-sm"
              >
                <Plus className="h-4 w-4" />
                Create New Blast
                <ChevronDown className="h-3.5 w-3.5 opacity-80" />
              </Button>

              {dropdownOpen && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setDropdownOpen(false)} />
                  <div className="absolute right-0 mt-1.5 w-48 rounded-lg border border-border bg-popover p-1.5 shadow-xl z-20">
                    <button
                      onClick={() => handleStartCreate("whatsapp")}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground text-left"
                    >
                      <MessageCircle className="h-4 w-4 text-emerald-500" />
                      WhatsApp Blast
                    </button>
                    <button
                      onClick={() => handleStartCreate("gmail")}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground text-left"
                    >
                      <Mail className="h-4 w-4 text-blue-500" />
                      Gmail Blast
                    </button>
                    <button
                      onClick={() => handleStartCreate("website")}
                      className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-xs font-medium text-foreground hover:bg-accent hover:text-accent-foreground text-left"
                    >
                      <Globe className="h-4 w-4 text-purple-500" />
                      Website Blast
                    </button>
                  </div>
                </>
              )}
            </div>
          </header>

          {/* Search bar */}
          <div className="border-b border-border bg-card px-6 py-3 shrink-0">
            <div className="relative max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Cari campaign blast..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 pl-9 text-xs"
              />
            </div>
          </div>

          {/* Table content */}
          <div className="flex-1 overflow-auto p-6">
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                    <th className="px-6 py-3.5">Campaign Name</th>
                    <th className="px-6 py-3.5 w-32 text-center">Platform</th>
                    <th className="px-6 py-3.5 w-36 text-center">Status</th>
                    <th className="px-6 py-3.5 w-28 text-center">Assign</th>
                    <th className="px-6 py-3.5 w-52 text-right">Date & Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredBlasts.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-8 text-center text-sm text-muted-foreground">
                        Belum ada riwayat blast.
                      </td>
                    </tr>
                  ) : (
                    filteredBlasts.map((b) => (
                      <tr
                        key={b.id}
                        onClick={() => handleOpenDetail(b)}
                        className="hover:bg-muted/45 cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4 font-semibold text-foreground">{b.campaignName}</td>
                        <td className="px-6 py-4 text-center">
                          <span className="inline-flex items-center gap-1 text-xs justify-center font-medium">
                            {b.platform === "whatsapp" && (
                              <Badge className="bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500/15 gap-1 text-[11px] h-6">
                                <MessageCircle className="h-3 w-3" /> WhatsApp
                              </Badge>
                            )}
                            {b.platform === "gmail" && (
                              <Badge className="bg-blue-500/10 text-blue-600 border border-blue-500/20 hover:bg-blue-500/15 gap-1 text-[11px] h-6">
                                <Mail className="h-3 w-3" /> Gmail
                              </Badge>
                            )}
                            {b.platform === "website" && (
                              <Badge className="bg-purple-500/10 text-purple-600 border border-purple-500/20 hover:bg-purple-500/15 gap-1 text-[11px] h-6">
                                <Globe className="h-3 w-3" /> Website
                              </Badge>
                            )}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          {b.status === "success" ? (
                            <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] uppercase font-bold py-0.5 px-2">
                              Success
                            </Badge>
                          ) : (
                            <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-[10px] uppercase font-bold py-0.5 px-2">
                              Schedule
                            </Badge>
                          )}
                        </td>
                        <td className="px-6 py-4 text-center font-medium text-foreground/80">{b.assign}</td>
                        <td className="px-6 py-4 text-right text-xs text-muted-foreground">{b.dateTime}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      ) : (
        /* Create Campaign Form View */
        <div className="flex-1 overflow-auto bg-muted/20">
          <form onSubmit={handleSaveBlast} className="mx-auto max-w-5xl px-6 py-8 flex flex-col gap-6">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            {/* Form Header */}
            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setViewMode("list")}
                className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full bg-card shadow-sm border border-border"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold tracking-tight text-foreground">
                  Isi Pesan Blast ({activePlatform === "whatsapp" ? "WhatsApp" : activePlatform === "gmail" ? "Gmail" : "Website"})
                </h1>
                <p className="text-xs text-muted-foreground">Tulis detail campaign broadcast Anda</p>
              </div>
            </div>

            {/* Message Composition Container (Matches Screenshot Layout + flex layout for Campaign Name) */}
            <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden flex flex-col">
              {/* Campaign Name Flex Row */}
              <div className="flex items-center border-b border-border/70 py-3.5 px-5 bg-card shrink-0">
                <span className="text-xs font-semibold text-muted-foreground w-12 shrink-0">Nama</span>
                <input
                  required
                  placeholder="Masukkan nama campaign blast"
                  value={campaignName}
                  onChange={(e) => setCampaignName(e.target.value)}
                  className="border-0 bg-transparent p-0 text-xs font-semibold focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50 flex-1 min-w-[200px]"
                />
              </div>

              {/* Dari Row */}
              <div className="flex items-center justify-between border-b border-border/70 py-3.5 px-5 bg-card shrink-0">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-semibold text-muted-foreground w-12">Dari</span>
                  <span className="text-xs font-bold text-foreground">hayhasan.project@gmail.com</span>
                </div>
                <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer opacity-60" />
              </div>

              {/* Kepada Row (Contains Chip Tags + Import Button - Max Height scrollbar applied) */}
              <div className="flex items-start justify-between border-b border-border/70 py-3 px-5 bg-card gap-4 shrink-0">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-xs font-semibold text-muted-foreground w-12 pt-1.5">Kepada</span>
                  
                  {/* Tidy container layout with max-height and custom thin scroll area */}
                  <div className="flex flex-wrap gap-2 flex-1 min-w-0 pr-2 pt-0.5 max-h-20 overflow-y-auto select-text scrollbar-thin">
                    {targetGroup.split(",").map(t => t.trim()).filter(Boolean).map((handle, idx) => {
                      const isValid = isValidHandle(handle);
                      return (
                        <Badge
                          key={idx}
                          variant="secondary"
                          className={cn(
                            "flex items-center gap-1.5 text-xs px-2.5 py-1 font-semibold rounded border",
                            isValid
                              ? "bg-muted/65 border-border text-foreground/90"
                              : "bg-red-500/10 border-red-500/30 text-red-600 dark:text-red-400"
                          )}
                        >
                          {handle}
                          <button
                            type="button"
                            onClick={() => {
                              const newList = targetGroup.split(",").map(h => h.trim()).filter(h => h !== handle).join(", ");
                              setTargetGroup(newList);
                            }}
                            className="text-muted-foreground hover:text-foreground rounded-full p-0.5 hover:bg-muted"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      );
                    })}
                    
                    {/* Inline Manual Tags Input supporting Comma and Space splitters */}
                    <input
                      type="text"
                      value={manualInput}
                      onChange={(e) => {
                        const val = e.target.value;
                        setManualInput(val);
                        if (val.endsWith(",") || val.endsWith(" ")) {
                          const cleanVal = val.slice(0, -1).trim();
                          if (cleanVal) {
                            setTargetGroup((prev) => (prev.trim() ? `${prev.trim()}, ${cleanVal}` : cleanVal));
                          }
                          setManualInput("");
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          const cleanVal = manualInput.trim();
                          if (cleanVal) {
                            setTargetGroup((prev) => (prev.trim() ? `${prev.trim()}, ${cleanVal}` : cleanVal));
                          }
                          setManualInput("");
                        } else if (e.key === "Backspace" && !manualInput) {
                          const parts = targetGroup.split(",").map(s => s.trim()).filter(Boolean);
                          if (parts.length > 0) {
                            parts.pop();
                            setTargetGroup(parts.join(", "));
                          }
                        }
                      }}
                      placeholder={targetGroup ? "" : "Ketik nomer manual..."}
                      className="border-0 bg-transparent p-0 text-xs focus:ring-0 focus:outline-none placeholder:text-muted-foreground/60 flex-1 min-w-[120px] h-6"
                    />
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUserIds([]);
                    setImportSearch("");
                    setIsImportOpen(true);
                  }}
                  className="h-8 gap-1 px-3 shadow-xs border-blue-500/20 text-blue-600 hover:text-blue-700 bg-blue-500/5 hover:bg-blue-500/10 font-bold shrink-0 text-xs flex items-center justify-center rounded"
                >
                  <Upload className="h-3.5 w-3.5" />
                  Import
                  <ChevronDown className="h-3 w-3 opacity-60" />
                </Button>
              </div>

              {/* Message Editor Area */}
              <div className="flex-1 bg-card flex flex-col min-h-[350px]">
                {activePlatform !== "whatsapp" && (
                  <div className="px-5 pt-4">
                    <Input
                      required
                      placeholder="Subject Email / Blast"
                      value={composeSubject}
                      onChange={(e) => setComposeSubject(e.target.value)}
                      className="h-10 text-sm focus-visible:ring-1 bg-muted/20 border-border/80"
                    />
                  </div>
                )}

                {activePlatform === "whatsapp" ? (
                  <div className="flex flex-col flex-1 min-h-[300px]">
                    <textarea
                      required
                      placeholder="Tulis pesan broadcast Anda..."
                      value={composeMessage}
                      onChange={(e) => setComposeMessage(e.target.value)}
                      className="w-full flex-1 bg-transparent border-0 outline-none p-5 text-sm resize-none focus:ring-0 focus:outline-none placeholder:text-muted-foreground/50"
                    />
                    <div className="flex justify-end p-2 bg-muted/20 border-t border-border/60">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        className="h-8 gap-1.5 px-3 text-xs font-semibold text-muted-foreground hover:text-foreground"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                        Lampirkan File/Foto/Video
                      </Button>
                    </div>
                  </div>
                ) : (
                  /* Rich Text HTML Editor for Gmail & Website */
                  <div className="flex flex-col flex-1 min-h-[300px]">
                    <div className="flex items-center gap-1 bg-muted/40 border-b border-t border-border/60 px-3 py-1.5 overflow-x-auto shrink-0 mt-3">
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("formatBlock", "<h1>")}
                        className="h-7 px-2 text-xs font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        H1
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("formatBlock", "<h2>")}
                        className="h-7 px-2 text-xs font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        H2
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("formatBlock", "<h3>")}
                        className="h-7 px-2 text-xs font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        H3
                      </button>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("formatBlock", "<p>")}
                        className="h-7 px-2 text-xs font-semibold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
                      >
                        P
                      </button>
                      <span className="w-px h-4 bg-border/80 mx-1 shrink-0" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("bold")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Bold className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("italic")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Italic className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("underline")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <Underline className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const url = prompt("Masukkan URL:");
                          if (url) execCommand("createLink", url);
                        }}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <LinkIcon className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => fileInputRef.current?.click()}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                        title="Sisipkan Lampiran (Foto, Video, File)"
                      >
                        <Paperclip className="h-3.5 w-3.5" />
                      </Button>
                      <span className="w-px h-4 bg-border/80 mx-1 shrink-0" />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("justifyLeft")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <AlignLeft className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("justifyCenter")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <AlignCenter className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => execCommand("justifyRight")}
                        className="h-7 w-7 text-muted-foreground hover:text-foreground"
                      >
                        <AlignRight className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                    <div
                      id="rich-blast-editor"
                      contentEditable
                      onInput={(e) => setComposeMessage(e.currentTarget.innerHTML)}
                      onBlur={(e) => setComposeMessage(e.currentTarget.innerHTML)}
                      data-placeholder="Tulis pesan broadcast Anda..."
                      className="w-full flex-1 bg-transparent border-0 outline-none p-5 text-sm select-text focus:outline-none focus:ring-0
                        empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none min-h-[320px]
                        prose dark:prose-invert max-w-none
                        [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:mt-4 [&_h1]:mb-2
                        [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-3 [&_h2]:mb-1.5
                        [&_h3]:text-lg [&_h3]:font-bold [&_h3]:mt-2 [&_h3]:mb-1
                        [&_p]:mb-2 [&_a]:text-blue-600 [&_a]:underline"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Form Footer with Kirim split dropdown button */}
            <div className="flex justify-end gap-3 shrink-0 items-center">
              <Button
                type="button"
                variant="outline"
                onClick={() => setViewMode("list")}
                className="h-9 px-4 text-xs font-semibold"
              >
                Batal
              </Button>

              {/* Split Dropdown Button */}
              <div className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white shadow-sm shrink-0 relative rounded-full">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className="h-9 pl-5 pr-4 text-xs font-semibold hover:bg-blue-700/80 transition-colors disabled:opacity-50 flex items-center justify-center border-r border-blue-500/30 rounded-l-full"
                >
                  Kirim
                </button>
                <button
                  type="button"
                  disabled={!isFormValid}
                  onClick={() => setActionDropdownOpen(!actionDropdownOpen)}
                  className="h-9 px-3 hover:bg-blue-700/80 transition-colors flex items-center justify-center disabled:opacity-50 rounded-r-full"
                >
                  <ChevronDown className="h-3.5 w-3.5" />
                </button>

                {actionDropdownOpen && (
                  <>
                    <div className="fixed inset-0 z-30" onClick={() => setActionDropdownOpen(false)} />
                    <div className="absolute right-0 bottom-full mb-1.5 w-36 rounded-lg border border-border bg-popover p-1.5 shadow-xl z-40 text-foreground">
                      <button
                        type="button"
                        onClick={() => {
                          setActionDropdownOpen(false);
                          setIsScheduleModalOpen(true);
                        }}
                        className="flex w-full items-center gap-2 rounded px-2.5 py-1.5 text-xs font-semibold hover:bg-accent hover:text-accent-foreground text-left"
                      >
                        <Calendar className="h-3.5 w-3.5 text-blue-500" />
                        Schedule
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Details Dialog Modal */}
      {isDetailOpen && selectedBlast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-xl rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4">
              <div className="flex items-center gap-2">
                <Megaphone className="h-4.5 w-4.5 text-primary" />
                <h2 className="text-base font-bold text-foreground">Detail Informasi Blast</h2>
              </div>
              <button
                onClick={() => setIsDetailOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Modal Body */}
            <ScrollArea className="flex-1 p-6">
              <div className="space-y-4 text-sm leading-relaxed">
                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Campaign Name
                  </span>
                  <p className="text-base font-bold text-foreground">{selectedBlast.campaignName}</p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-y border-border/60 py-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Platform
                    </span>
                    <span className="inline-flex items-center gap-1 font-semibold text-foreground">
                      {selectedBlast.platform === "whatsapp" && (
                        <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                          <MessageCircle className="h-4 w-4" /> WhatsApp
                        </span>
                      )}
                      {selectedBlast.platform === "gmail" && (
                        <span className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400">
                          <Mail className="h-4 w-4" /> Gmail
                        </span>
                      )}
                      {selectedBlast.platform === "website" && (
                        <span className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400">
                          <Globe className="h-4 w-4" /> Website
                        </span>
                      )}
                    </span>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Status
                    </span>
                    {selectedBlast.status === "success" ? (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 text-[10px] uppercase font-bold py-0.5 px-2">
                        Success
                      </Badge>
                    ) : (
                      <Badge className="bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 hover:bg-blue-500/20 text-[10px] uppercase font-bold py-0.5 px-2">
                        Schedule
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 border-b border-border/60 pb-3">
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Jumlah Penerima (Assign)
                    </span>
                    <button
                      type="button"
                      onClick={() => setIsRecipientListOpen(true)}
                      className="font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1.5 transition-colors text-left"
                    >
                      <Users className="h-4 w-4 shrink-0" />
                      {selectedBlast.assign} Penerima
                    </button>
                  </div>

                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Date & Time
                    </span>
                    <span className="text-muted-foreground text-xs font-medium flex items-center gap-1.5">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {selectedBlast.dateTime}
                    </span>
                  </div>
                </div>

                {selectedBlast.subject && (
                  <div>
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                      Subject
                    </span>
                    <p className="font-semibold text-foreground bg-muted/30 px-3 py-1.5 rounded border border-border/50">{selectedBlast.subject}</p>
                  </div>
                )}

                <div>
                  <span className="block text-[10px] font-bold uppercase tracking-wider text-muted-foreground mb-1">
                    Isi Pesan
                  </span>
                  {selectedBlast.platform === "whatsapp" ? (
                    <div className="bg-muted/40 border border-border p-4 rounded-lg text-sm text-foreground whitespace-pre-wrap leading-relaxed">
                      {selectedBlast.message}
                    </div>
                  ) : (
                    <div
                      className="bg-muted/40 border border-border p-4 rounded-lg text-sm text-foreground leading-relaxed prose max-w-none 
                        [&_h1]:text-base [&_h1]:font-bold [&_h2]:text-sm [&_h2]:font-bold [&_p]:mb-1 [&_a]:text-blue-600 [&_a]:underline"
                      dangerouslySetInnerHTML={{ __html: selectedBlast.message }}
                    />
                  )}
                </div>
              </div>
            </ScrollArea>

            {/* Modal Footer */}
            <div className="border-t border-border bg-muted/20 px-6 py-3.5 flex justify-end">
              <Button
                onClick={() => setIsDetailOpen(false)}
                className="h-8.5 text-xs font-semibold px-4"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Recipient Details Sub-Modal */}
      {isRecipientListOpen && selectedBlast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[70vh]">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-3.5 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Daftar Penerima Blast</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsRecipientListOpen(false)}
                className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-modal recipient filter search */}
            <div className="px-5 py-2.5 border-b border-border bg-card shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari penerima..."
                  value={recipientSearch}
                  onChange={(e) => setRecipientSearch(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/60 px-5 py-2">
                {selectedBlast.targets
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .filter((handle) => handle.toLowerCase().includes(recipientSearch.toLowerCase()))
                  .map((handle, idx) => (
                    <div key={idx} className="py-2.5 flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{handle}</span>
                      <Badge className="bg-muted text-muted-foreground font-medium border text-[10px]">
                        Recipient #{idx + 1}
                      </Badge>
                    </div>
                  ))}
                {selectedBlast.targets
                  .split(",")
                  .map((t) => t.trim())
                  .filter(Boolean)
                  .filter((handle) => handle.toLowerCase().includes(recipientSearch.toLowerCase())).length === 0 && (
                  <p className="p-8 text-center text-xs text-muted-foreground">Tidak ada penerima yang cocok.</p>
                )}
              </div>
            </ScrollArea>

            <div className="border-t border-border bg-muted/20 px-5 py-3 flex justify-end shrink-0">
              <Button
                onClick={() => setIsRecipientListOpen(false)}
                className="h-8 text-xs font-semibold px-4"
              >
                Kembali
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Selection Dialog Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-sm rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col">
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-5 py-3">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                <Calendar className="h-4 w-4 text-primary" />
                Jadwalkan Blast
              </h3>
              <button
                type="button"
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="p-5 space-y-3">
              <label className="block text-xs font-bold text-muted-foreground">
                PILIH TANGGAL & WAKTU
              </label>
              <Input
                type="datetime-local"
                required
                value={scheduleTime}
                onChange={(e) => setScheduleTime(e.target.value)}
                className="h-10 text-sm w-full focus-visible:ring-1 bg-muted/20 border-border/80"
              />
            </div>
            <div className="border-t border-border bg-muted/20 px-5 py-3 flex justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsScheduleModalOpen(false)}
                className="h-8 text-xs font-semibold"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleConfirmSchedule}
                disabled={!scheduleTime}
                className="h-8 text-xs font-semibold px-4 bg-blue-600 hover:bg-blue-700 text-white rounded"
              >
                Jadwalkan
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Import Contacts Modal */}
      {isImportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg rounded-xl border border-border bg-card shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-border bg-muted/20 px-6 py-4 shrink-0">
              <div className="flex items-center gap-2">
                <Users className="h-4.5 w-4.5 text-primary" />
                <h3 className="text-sm font-bold text-foreground">Import Data Pengguna</h3>
              </div>
              <button
                onClick={() => setIsImportOpen(false)}
                className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Search filter */}
            <div className="px-6 py-3 border-b border-border bg-card shrink-0">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Cari nama atau handle kontak..."
                  value={importSearch}
                  onChange={(e) => setImportSearch(e.target.value)}
                  className="h-9 pl-9 text-xs"
                />
              </div>
            </div>

            {/* Tab Selector bar (User, Admin, Business) */}
            <div className="flex border-b border-border bg-muted/10 shrink-0 px-6">
              {(["user", "admin", "business"] as const).map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={cn(
                    "py-2.5 px-4 text-xs font-bold border-b-2 transition-colors uppercase tracking-wider",
                    activeTab === tab
                      ? "border-primary text-primary"
                      : "border-transparent text-muted-foreground hover:text-foreground"
                  )}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* List Header (Select All) */}
            <div className="px-6 py-2 bg-muted/30 border-b border-border text-xs flex items-center justify-between font-semibold text-muted-foreground shrink-0">
              <label className="inline-flex items-center gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={filteredUsers.length > 0 && filteredUsers.every((u) => selectedUserIds.includes(u.id))}
                  onChange={handleToggleSelectAll}
                  className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 bg-muted/10 cursor-pointer"
                />
                <span>Pilih Semua ({filteredUsers.length} Terfilter)</span>
              </label>
              <span>{selectedUserIds.length} Terpilih</span>
            </div>

            {/* Contacts list */}
            <ScrollArea className="flex-1">
              <div className="divide-y divide-border/60 px-6">
                {filteredUsers.length === 0 ? (
                  <p className="p-8 text-center text-xs text-muted-foreground">Tidak ada kontak yang cocok.</p>
                ) : (
                  filteredUsers.map((u) => {
                    const isChecked = selectedUserIds.includes(u.id);
                    return (
                      <label
                        key={u.id}
                        className="flex items-center justify-between py-3 cursor-pointer hover:bg-muted/10 transition-colors"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => handleToggleUser(u.id)}
                            className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 bg-muted/10 cursor-pointer"
                          />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground truncate">{u.name}</p>
                            <p className="text-[11px] text-muted-foreground truncate">{u.handle}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })
                )}
              </div>
            </ScrollArea>

            {/* Footer */}
            <div className="border-t border-border bg-muted/20 px-6 py-3.5 flex justify-end gap-2.5 shrink-0">
              <Button
                variant="outline"
                onClick={() => setIsImportOpen(false)}
                className="h-8.5 text-xs font-semibold"
              >
                Batal
              </Button>
              <Button
                onClick={handleImportConfirm}
                disabled={selectedUserIds.length === 0}
                className="h-8.5 text-xs font-semibold px-4"
              >
                Import Terpilih ({selectedUserIds.length})
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
