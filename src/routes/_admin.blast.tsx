import { useState, useRef } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  Paperclip,
  Send,
  Download,
  ChevronDown,
  UserCheck,
  Users,
  Briefcase,
  Search,
  CheckCircle,
  Bold,
  Italic,
  Underline,
  Palette,
  AlignLeft,
  List,
  EyeOff,
  Trash2,
  Smile
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { admins, users, businesses } from "@/lib/mock/data";
import { cn } from "@/lib/utils";
import { SectionCard } from "@/components/admin/SectionCard";

export const Route = createFileRoute("/_admin/blast")({
  head: () => ({
    meta: [{ title: "Create Blast — Postmatic Admin" }],
  }),
  component: BlastPage,
});

interface ImportItem {
  id: string;
  name: string;
  role?: string;
  plan?: string;
  target: string;
  subtext: string;
  avatar: string;
}

function BlastPage() {
  const navigate = useNavigate();
  const [platform, setPlatform] = useState<"whatsapp" | "gmail">("whatsapp");
  const [targetInput, setTargetInput] = useState("");
  const [targets, setTargets] = useState<string[]>([]);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Modal Import State
  const [importType, setImportType] = useState<"admin" | "user" | "business" | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === " " || e.key === "," || e.key === "Enter") {
      e.preventDefault();
      const val = targetInput.trim().replace(/,/g, "");
      if (val && !targets.includes(val)) {
        setTargets([...targets, val]);
      }
      setTargetInput("");
    }
  };

  const removeTarget = (t: string) => setTargets(targets.filter((x) => x !== t));

  const handlePlatformChange = (val: string) => {
    setPlatform(val as "whatsapp" | "gmail");
    setTargets([]);
  };

  const getItems = (): ImportItem[] => {
    if (importType === "admin") {
      return admins.map((a) => ({
        id: a.id,
        name: a.name,
        role: a.role,
        target: platform === "gmail" ? a.email : a.phone,
        subtext: `${a.email} · ${a.phone}`,
        avatar: a.avatar,
      }));
    } else if (importType === "user") {
      return users.map((u) => ({
        id: u.id,
        name: u.name,
        role: u.role,
        target: platform === "gmail" ? u.email : u.phone,
        subtext: `${u.email} · ${u.phone}`,
        avatar: u.avatar,
      }));
    } else if (importType === "business") {
      return businesses.map((b, idx) => {
        const target =
          platform === "gmail"
            ? `contact@${b.name.toLowerCase().replace(/\s+/g, "").replace(/[^a-z0-9]/g, "")}.co.id`
            : `+62 811-${String(8000 + idx * 111).slice(0, 4)}-${String(1000 + idx * 222).slice(0, 4)}`;
        return {
          id: b.id,
          name: b.name,
          plan: b.plan,
          target,
          subtext: `Owner: ${b.owner} · ${target}`,
          avatar: b.logo,
        };
      });
    }
    return [];
  };

  const allItems = getItems();
  const filteredItems = allItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.name.toLowerCase().includes(q) ||
      item.target.toLowerCase().includes(q) ||
      item.subtext.toLowerCase().includes(q)
    );
  });

  const allFilteredIds = filteredItems.map((item) => item.id);
  const isAllSelected = allFilteredIds.length > 0 && allFilteredIds.every((id) => selectedIds.includes(id));

  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedIds(selectedIds.filter((id) => !allFilteredIds.includes(id)));
    } else {
      const newIds = new Set([...selectedIds, ...allFilteredIds]);
      setSelectedIds(Array.from(newIds));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((x) => x !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleImport = () => {
    const selectedItems = allItems.filter((item) => selectedIds.includes(item.id));
    const newTargets = selectedItems.map((item) => item.target);

    const combined = [...targets];
    let addedCount = 0;
    for (const t of newTargets) {
      if (t && !combined.includes(t)) {
        combined.push(t);
        addedCount++;
      }
    }

    setTargets(combined);
    toast.success(`Berhasil mengimport ${addedCount} target ke dalam daftar audience!`);
    setImportType(null);
  };

  const handleSendNow = () => {
    if (targets.length === 0) {
      toast.error("Harap tambahkan minimal 1 target audience terlebih dahulu.");
      return;
    }
    if (!message.trim()) {
      toast.error("Isi pesan broadcast tidak boleh kosong!");
      return;
    }
    toast.success("Broadcast berhasil dikirim ke seluruh target!");
    navigate({ to: "/feedback", search: { tab: "Chat" } });
  };

  const handleSchedule = () => {
    if (targets.length === 0) {
      toast.error("Harap tambahkan minimal 1 target audience terlebih dahulu.");
      return;
    }
    if (!message.trim()) {
      toast.error("Isi pesan broadcast tidak boleh kosong!");
      return;
    }
    toast.success("Broadcast berhasil dijadwalkan!");
    navigate({ to: "/feedback", search: { tab: "Chat" } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files]);
      toast.success(`${files.length} file berhasil dilampirkan.`);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-background rounded-xl border overflow-hidden shadow-sm">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/feedback", search: { tab: "Chat" } })}
            className="hover:bg-muted h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <span className="font-semibold text-foreground text-sm">Create New Blast</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSchedule}
            className="gap-2 h-8 text-xs font-semibold font-mono"
          >
            <Calendar className="h-3.5 w-3.5" /> Schedule
          </Button>
          <Button
            onClick={handleSendNow}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-3.5 h-8 text-xs font-semibold"
          >
            <Send className="h-3.5 w-3.5" /> Send Now
          </Button>
        </div>
      </header>

      {/* Main Form Fields Container */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4 bg-card">
        {/* Platform Selection */}
        <div className="flex items-center border-b pb-3 text-sm text-muted-foreground gap-4">
          <span className="w-20 text-left">Platform</span>
          <Tabs value={platform} onValueChange={handlePlatformChange} className="w-auto">
            <TabsList className="grid grid-cols-2 max-w-[200px] h-8 p-0.5">
              <TabsTrigger value="whatsapp" className="h-7 text-xs">WhatsApp</TabsTrigger>
              <TabsTrigger value="gmail" className="h-7 text-xs">Gmail</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Dari Field */}
        <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-20 text-left">Dari</span>
            <span className="font-medium text-foreground">hayhasan.project@gmail.com</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground/60 cursor-pointer" />
        </div>

        {/* Recipient Input (Kepada) with Import Dropdown */}
        <div className="flex items-start border-b pb-3 text-sm text-muted-foreground gap-4">
          <span className="w-20 text-left pt-1">Kepada</span>
          <div className="flex-1 flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-1.5 min-h-[28px] max-h-[120px] overflow-y-auto">
              {targets.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-1.5 rounded bg-secondary/80 dark:bg-secondary/40 px-2 py-0.5 text-xs text-secondary-foreground font-mono font-medium"
                >
                  {t}
                  <button
                    type="button"
                    onClick={() => removeTarget(t)}
                    className="text-muted-foreground hover:text-destructive transition-colors ml-0.5 font-bold text-sm"
                  >
                    &times;
                  </button>
                </span>
              ))}
              <input
                type="text"
                value={targetInput}
                onChange={(e) => setTargetInput(e.target.value)}
                onKeyDown={handleKeyDown}
                className="border-none focus-visible:ring-0 p-0 h-auto bg-transparent text-foreground placeholder:text-muted-foreground/50 text-sm font-normal flex-1 min-w-[150px]"
                placeholder={
                  targets.length === 0
                    ? `Ketik ${platform === "gmail" ? "email" : "nomor HP"} lalu tekan enter...`
                    : ""
                }
              />
            </div>
          </div>

          {/* Dropdown Import */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 gap-1.5 border-primary/20 hover:border-primary/50 text-primary bg-primary/5 hover:bg-primary/10 transition-all font-semibold text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Import</span>
                <ChevronDown className="h-3 w-3 opacity-70" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem
                className="gap-2.5 cursor-pointer py-2 font-medium"
                onClick={() => {
                  setImportType("admin");
                  setSelectedIds([]);
                  setSearchQuery("");
                }}
              >
                <UserCheck className="h-4 w-4 text-blue-500" />
                <span>Import Admin</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2.5 cursor-pointer py-2 font-medium"
                onClick={() => {
                  setImportType("user");
                  setSelectedIds([]);
                  setSearchQuery("");
                }}
              >
                <Users className="h-4 w-4 text-emerald-500" />
                <span>Import User</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="gap-2.5 cursor-pointer py-2 font-medium"
                onClick={() => {
                  setImportType("business");
                  setSelectedIds([]);
                  setSearchQuery("");
                }}
              >
                <Briefcase className="h-4 w-4 text-purple-500" />
                <span>Import Business</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Subject Input (Gmail-specific) */}
        {platform === "gmail" && (
          <div className="flex items-center border-b pb-3 text-sm text-muted-foreground gap-4">
            <span className="w-20 text-left">Subjek</span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Tambahkan subjek email"
              className="border-none focus-visible:ring-0 p-0 h-auto bg-transparent text-foreground placeholder:text-muted-foreground/50 w-full text-sm font-normal"
            />
          </div>
        )}

        {/* Attachment Files List */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-muted/60 dark:bg-muted/30 px-3 py-1.5 rounded-lg border text-xs"
              >
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[200px] truncate font-medium text-foreground">{file.name}</span>
                <span className="text-[10px] text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="h-4 w-4 text-muted-foreground hover:text-destructive hover:bg-transparent"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Message body Editor */}
        <div className="flex-1 flex flex-col pt-2 gap-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan broadcast Anda..."
            className="flex-1 border-none focus-visible:ring-0 p-0 resize-none bg-transparent text-foreground placeholder:text-muted-foreground/40 text-sm leading-relaxed min-h-[250px]"
          />
          <div className="text-[11px] text-muted-foreground italic mt-1">
            *Gunakan variabel {'{name}'} atau {'{company}'} untuk personalisasi pesan.
          </div>
        </div>
      </div>

      {/* Formatting Textbar at the bottom */}
      <footer className="flex items-center gap-1 px-4 py-2 border-t bg-muted/30">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Palette className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <List className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <EyeOff className="h-4 w-4" />
        </Button>
      </footer>

      {/* Modal Import */}
      <Dialog
        open={importType !== null}
        onOpenChange={(open) => {
          if (!open) setImportType(null);
        }}
      >
        <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 gap-0 overflow-hidden sm:rounded-xl">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="flex items-center gap-2.5 text-lg font-bold">
              {importType === "admin" && <UserCheck className="h-5 w-5 text-blue-500" />}
              {importType === "user" && <Users className="h-5 w-5 text-emerald-500" />}
              {importType === "business" && <Briefcase className="h-5 w-5 text-purple-500" />}
              <span>
                Import Daftar{" "}
                {importType === "admin"
                  ? "Admin"
                  : importType === "user"
                  ? "User Pengguna"
                  : "Business Workspace"}
              </span>
            </DialogTitle>
            <p className="text-xs text-muted-foreground mt-1">
              Pilih {importType === "admin" ? "admin" : importType === "user" ? "user" : "business"} untuk ditambahkan
              ke target broadcast {platform === "whatsapp" ? "WhatsApp (Nomor HP)" : "Gmail (Alamat Email)"}.
            </p>
          </DialogHeader>

          <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Input
                placeholder={`Cari nama${importType !== "business" ? ", email, atau nomor HP" : " atau owner"}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-9 text-xs pl-8 bg-background"
              />
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="select-all" checked={isAllSelected} onCheckedChange={toggleSelectAll} />
              <Label htmlFor="select-all" className="text-xs font-semibold cursor-pointer select-none">
                Pilih Semua ({allFilteredIds.length})
              </Label>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[360px]">
            {filteredItems.length === 0 ? (
              <div className="py-12 text-center text-sm text-muted-foreground">
                Tidak ada data yang ditemukan untuk pencarian "{searchQuery}".
              </div>
            ) : (
              filteredItems.map((item) => {
                const id = item.id;
                const isSelected = selectedIds.includes(id);
                const name = item.name;
                const subtext = item.subtext;
                const avatarUrl = item.avatar;

                return (
                  <div
                    key={id}
                    onClick={() => toggleSelect(id)}
                    className={cn(
                      "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                      isSelected
                        ? "border-primary/50 bg-primary/5 shadow-2xs"
                        : "border-border/60 hover:border-border hover:bg-muted/40"
                    )}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleSelect(id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <img
                        src={avatarUrl}
                        alt={name}
                        className="h-9 w-9 rounded-full object-cover border bg-muted shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="text-sm font-semibold text-foreground flex items-center gap-2 truncate">
                          <span className="truncate">{name}</span>
                          {item.role && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-secondary text-secondary-foreground shrink-0">
                              {item.role}
                            </span>
                          )}
                          {item.plan && (
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 shrink-0">
                              {item.plan}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-muted-foreground mt-0.5 font-mono truncate">
                          {subtext}
                        </div>
                      </div>
                    </div>

                    <div className="text-xs font-medium text-muted-foreground shrink-0 ml-3">
                      {isSelected ? (
                        <span className="text-primary font-semibold flex items-center gap-1">
                          <CheckCircle className="h-3.5 w-3.5" /> Terpilih
                        </span>
                      ) : (
                        "Klik untuk pilih"
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <DialogFooter className="p-4 border-t bg-muted/20 flex items-center justify-between sm:justify-between">
            <div className="text-xs text-muted-foreground font-medium">
              <span className="text-foreground font-bold">{selectedIds.length}</span> dari {allFilteredIds.length}{" "}
              item terpilih
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setImportType(null)}>
                Batal
              </Button>
              <Button
                size="sm"
                className="gap-1.5 font-semibold"
                disabled={selectedIds.length === 0}
                onClick={handleImport}
              >
                <Download className="h-3.5 w-3.5" />
                <span>Import Terpilih ({selectedIds.length})</span>
              </Button>
            </div>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
