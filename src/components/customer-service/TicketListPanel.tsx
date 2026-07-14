import { useState } from "react";
import { Plus, Search, ChevronDown, Loader2, RefreshCw } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { TicketCard } from "./TicketCard";
import { useTickets } from "@/contexts/TicketsContext";
import type { Ticket, TicketSource } from "@/lib/types/ticket";
import { normalizeWhatsappDigits, whatsappPhonesMatch } from "@/lib/whatsapp-room-aliases";

interface Props {
  title: string;
  tickets: Ticket[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  scopeKey: string;
  onStartCompose?: () => void;
  isLoading?: boolean;
  error?: string | null;
  onRefresh?: () => void;
}

const COUNTRIES = [
  { code: "ID", name: "Indonesia", flag: "🇮🇩", dialCode: "+62" },
  { code: "US", name: "United States", flag: "🇺🇸", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", flag: "🇬🇧", dialCode: "+44" },
  { code: "SG", name: "Singapore", flag: "🇸🇬", dialCode: "+65" },
  { code: "MY", name: "Malaysia", flag: "🇲🇾", dialCode: "+60" },
  { code: "AU", name: "Australia", flag: "🇦🇺", dialCode: "+61" },
  { code: "IN", name: "India", flag: "🇮🇳", dialCode: "+91" },
  { code: "JP", name: "Japan", flag: "🇯🇵", dialCode: "+81" },
  { code: "DE", name: "Germany", flag: "🇩🇪", dialCode: "+49" },
  { code: "FR", name: "France", flag: "🇫🇷", dialCode: "+33" },
  { code: "CN", name: "China", flag: "🇨🇳", dialCode: "+86" },
  { code: "BR", name: "Brazil", flag: "🇧🇷", dialCode: "+55" },
  { code: "SA", name: "Saudi Arabia", flag: "🇸🇦", dialCode: "+966" },
  { code: "KR", name: "South Korea", flag: "🇰🇷", dialCode: "+82" },
];

export function TicketListPanel({
  title,
  tickets,
  selectedId,
  onSelect,
  scopeKey,
  onStartCompose,
  isLoading,
  error,
  onRefresh,
}: Props) {
  const { createTicket } = useTickets();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [platformFilter, setPlatformFilter] = useState("all");

  const [isWhatsappDialogOpen, setIsWhatsappDialogOpen] = useState(false);

  // WhatsApp form states
  const [waPhone, setWaPhone] = useState("");
  const [waName, setWaName] = useState("");
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [searchCountryQuery, setSearchCountryQuery] = useState("");
  const [isCountryPopoverOpen, setIsCountryPopoverOpen] = useState(false);

  const handleCreateWhatsappChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waPhone.trim()) return;

    const normalizedPhone = normalizeWhatsappDigits(`${selectedCountry.dialCode}${waPhone.trim()}`);
    const formattedHandle =
      normalizedPhone.startsWith("62") && normalizedPhone.length > 2
        ? `+62 ${normalizedPhone.slice(2)}`
        : `${selectedCountry.dialCode} ${waPhone.trim()}`;
    const existingTicket = tickets.find(
      (ticket) =>
        ticket.source === "whatsapp" &&
        [ticket.senderHandle, ticket.senderName, ticket.subject].some((value) =>
          whatsappPhonesMatch(value, normalizedPhone || formattedHandle),
        ),
    );

    if (existingTicket) {
      setWaPhone("");
      setWaName("");
      setSelectedCountry(COUNTRIES[0]);
      setIsWhatsappDialogOpen(false);
      onSelect(existingTicket.id);
      return;
    }

    const displayName = waName.trim() || formattedHandle;

    const newTicket = createTicket({
      source: "whatsapp",
      senderName: displayName,
      senderHandle: formattedHandle,
      subject: `Chat WhatsApp - ${displayName}`,
      snippet: "Chat baru disiapkan",
      messages: [
        {
          id: `m-${Date.now()}`,
          authorId: "system",
          authorName: "System",
          content:
            "Chat baru disiapkan. Room WhatsApp akan dibuat setelah pesan pertama berhasil dikirim.",
          createdAt: new Date().toISOString(),
          direction: "in",
        },
      ],
    });

    // Reset Form
    setWaPhone("");
    setWaName("");
    setSelectedCountry(COUNTRIES[0]);
    setIsWhatsappDialogOpen(false);

    // Select the new ticket room
    onSelect(newTicket.id);
  };

  // Search and Filter logic
  const filteredTickets = tickets.filter((t) => {
    // 1. Search Query Filter
    const query = searchQuery.toLowerCase().trim();
    let matchesSearch = true;
    if (query) {
      const matchSender = t.senderName.toLowerCase().includes(query);
      const matchHandle = t.senderHandle.toLowerCase().includes(query);
      const matchSubject = t.subject.toLowerCase().includes(query);
      const matchSnippet = t.snippet.toLowerCase().includes(query);
      const matchMessages = t.messages.some((m) => m.content.toLowerCase().includes(query));
      matchesSearch = matchSender || matchHandle || matchSubject || matchSnippet || matchMessages;
    }

    // 2. Status Filter
    let matchesStatus = true;
    if (statusFilter !== "all") {
      if (statusFilter === "none") {
        matchesStatus = !t.status;
      } else {
        matchesStatus = t.status === statusFilter;
      }
    }

    // 3. Platform Filter (only if scopeKey === "all")
    let matchesPlatform = true;
    if (scopeKey === "all" && platformFilter !== "all") {
      matchesPlatform = t.source === platformFilter;
    }

    return matchesSearch && matchesStatus && matchesPlatform;
  });

  // Sort by isPinned (pinned first) then by updatedAt descending (newest first)
  const sortedTickets = [...filteredTickets].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
  });

  const filteredCountries = COUNTRIES.filter(
    (c) =>
      c.name.toLowerCase().includes(searchCountryQuery.toLowerCase()) ||
      c.dialCode.includes(searchCountryQuery),
  );

  return (
    <div className="flex h-full min-h-0 flex-col border-r border-border bg-card">
      <div className="flex items-center justify-between border-b border-border px-4 py-3 shrink-0">
        <div>
          <h2 className="text-sm font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{sortedTickets.length} percakapan</p>
        </div>
        {(scopeKey === "whatsapp" || scopeKey === "gmail") && (
          <Button
            size="sm"
            onClick={() => {
              if (scopeKey === "gmail") {
                onStartCompose?.();
              } else {
                setIsWhatsappDialogOpen(true);
              }
            }}
            className="h-8 gap-1 px-2.5 text-xs font-medium"
          >
            <Plus className="h-3.5 w-3.5" />
            {scopeKey === "whatsapp" ? "New Chat" : "New Email"}
          </Button>
        )}
      </div>

      {/* Search & Filter Bar Component */}
      <div className="flex flex-col gap-1.5 border-b border-border px-4 py-2 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari percakapan..."
            className="h-9 pl-8 text-xs placeholder:text-muted-foreground/70"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-1.5">
          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="h-7 text-[11px] px-2 py-0.5 bg-muted/30 border-border/60 font-medium flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all" className="text-xs">
                Semua Status
              </SelectItem>
              <SelectItem value="none" className="text-xs">
                Tanpa Status
              </SelectItem>
              <SelectItem value="review" className="text-xs">
                Review
              </SelectItem>
              <SelectItem value="progress" className="text-xs">
                Progress
              </SelectItem>
              <SelectItem value="done" className="text-xs">
                Done
              </SelectItem>
            </SelectContent>
          </Select>

          {/* Platform Filter (Only if All Ticket) */}
          {scopeKey === "all" && (
            <Select value={platformFilter} onValueChange={setPlatformFilter}>
              <SelectTrigger className="h-7 text-[11px] px-2 py-0.5 bg-muted/30 border-border/60 font-medium flex-1">
                <SelectValue placeholder="Platform" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all" className="text-xs">
                  Semua Platform
                </SelectItem>
                <SelectItem value="whatsapp" className="text-xs">
                  WhatsApp
                </SelectItem>
                <SelectItem value="gmail" className="text-xs">
                  Gmail
                </SelectItem>
                <SelectItem value="website" className="text-xs">
                  Website
                </SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      </div>

      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Memuat percakapan...
          </div>
        ) : error ? (
          <div className="space-y-3 p-8 text-center text-sm text-muted-foreground">
            <p>Gagal memuat data customer service.</p>
            <Button variant="outline" size="sm" onClick={onRefresh} className="gap-1.5">
              <RefreshCw className="h-3.5 w-3.5" />
              Coba Lagi
            </Button>
          </div>
        ) : sortedTickets.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            {searchQuery || statusFilter !== "all" || platformFilter !== "all"
              ? "Tidak ada percakapan yang cocok."
              : "Belum ada tiket di kategori ini."}
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {sortedTickets.map((t) => (
              <li key={t.id}>
                <TicketCard ticket={t} active={t.id === selectedId} onSelect={onSelect} />
              </li>
            ))}
          </ul>
        )}
      </ScrollArea>

      {/* Dialog New WhatsApp Chat */}
      <Dialog open={isWhatsappDialogOpen} onOpenChange={setIsWhatsappDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <form onSubmit={handleCreateWhatsappChat}>
            <DialogHeader>
              <DialogTitle>Buat Chat WhatsApp Baru</DialogTitle>
              <DialogDescription>
                Masukkan nomor WhatsApp pelanggan untuk membuat roomchat baru.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="waPhone">Nomor WhatsApp</Label>
                <div className="flex gap-2">
                  <Popover open={isCountryPopoverOpen} onOpenChange={setIsCountryPopoverOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className="w-[100px] justify-between text-xs px-2 shrink-0 h-9"
                      >
                        <span>
                          {selectedCountry.flag} {selectedCountry.dialCode}
                        </span>
                        <ChevronDown className="h-3 w-3 opacity-50 shrink-0" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[200px] p-0" align="start">
                      <div className="flex items-center border-b px-3 py-2">
                        <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                        <input
                          placeholder="Cari kode negara..."
                          value={searchCountryQuery}
                          onChange={(e) => setSearchCountryQuery(e.target.value)}
                          className="flex h-7 w-full bg-transparent py-2 text-xs outline-none placeholder:text-muted-foreground/50"
                        />
                      </div>
                      <div className="max-h-48 overflow-y-auto p-1">
                        {filteredCountries.length === 0 ? (
                          <div className="p-2 text-center text-xs text-muted-foreground">
                            Negara tidak ditemukan.
                          </div>
                        ) : (
                          filteredCountries.map((country) => (
                            <button
                              key={country.code}
                              type="button"
                              onClick={() => {
                                setSelectedCountry(country);
                                setIsCountryPopoverOpen(false);
                                setSearchCountryQuery("");
                              }}
                              className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
                            >
                              <span>{country.flag}</span>
                              <span className="flex-1 truncate">{country.name}</span>
                              <span className="text-muted-foreground">{country.dialCode}</span>
                            </button>
                          ))
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                  <Input
                    id="waPhone"
                    type="tel"
                    value={waPhone}
                    onChange={(e) => setWaPhone(e.target.value.replace(/\D/g, ""))}
                    placeholder="8123456789"
                    className="flex-1 h-9"
                    required
                  />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="waName">Nama Pengirim (Opsional)</Label>
                <Input
                  id="waName"
                  value={waName}
                  onChange={(e) => setWaName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="h-9"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsWhatsappDialogOpen(false)}
              >
                Batal
              </Button>
              <Button type="submit" disabled={!waPhone.trim()}>
                Mulai Chat
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
