import { useState, useEffect } from "react";
import { toast } from "sonner";
import { ChevronDown, Upload, Trash2, Mail, Edit3, Search, Plus, Copy, MoreHorizontal, ChevronLeft, ChevronRight } from "lucide-react";
import { DetailModal } from "@/components/admin/DetailModal";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DetailInfoHeader, ResetPasswordButton, RoleBadge } from "@/components/admin/DetailInfoHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import type { UserRow } from "@/lib/mock/types";

const COUNTRY_CODES = [
  { code: "+62", country: "Indonesia (ID)" },
  { code: "+60", country: "Malaysia (MY)" },
  { code: "+65", country: "Singapore (SG)" },
  { code: "+66", country: "Thailand (TH)" },
  { code: "+84", country: "Vietnam (VN)" },
  { code: "+63", country: "Philippines (PH)" },
  { code: "+1", country: "United States (US)" },
  { code: "+44", country: "United Kingdom (UK)" },
  { code: "+61", country: "Australia (AU)" },
  { code: "+81", country: "Japan (JP)" },
  { code: "+82", country: "South Korea (KR)" },
  { code: "+86", country: "China (CN)" },
  { code: "+91", country: "India (IN)" },
  { code: "+971", country: "United Arab Emirates (AE)" },
  { code: "+966", country: "Saudi Arabia (SA)" },
];

function CountryCodeDropdown({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  const filtered = COUNTRY_CODES.filter(
    (c) =>
      c.country.toLowerCase().includes(search.toLowerCase()) ||
      c.code.includes(search)
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-28 justify-between px-2.5">
          <span>{value}</span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56 p-2" align="start">
        <Input
          placeholder="Search country..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2 h-8 text-xs"
        />
        <div className="max-h-48 overflow-y-auto space-y-1">
          {filtered.map((item) => (
            <button
              key={item.country}
              type="button"
              onClick={() => {
                onChange(item.code);
                setOpen(false);
                setSearch("");
              }}
              className="flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-left text-xs hover:bg-accent hover:text-accent-foreground"
            >
              <span>{item.country}</span>
              <span className="font-semibold">{item.code}</span>
            </button>
          ))}
          {filtered.length === 0 && (
            <p className="py-2 text-center text-xs text-muted-foreground">No country found.</p>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

function EditUserForm({ row }: { row: UserRow }) {
  const [countryCode, setCountryCode] = useState("+62");
  const [phoneNum, setPhoneNum] = useState(() => row.phone.replace(/^\+\d+\s*/, ""));
  const [role, setRole] = useState(row.role || "User");
  const [avatarUrl, setAvatarUrl] = useState(row.avatar);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  const handleSendReset = () => {
    toast.success(`Email reset password telah dikirim ke ${row.email}`);
  };

  return (
    <div className="space-y-6 py-2">
      {/* Edit Profile Picture and Name & Role */}
      <div className="flex flex-col md:flex-row gap-6 items-start rounded-xl border bg-card p-5">
        <div className="flex items-center gap-4 shrink-0">
          <div className="relative group cursor-pointer overflow-hidden rounded-full h-20 w-20 border">
            <input
              type="file"
              id="user-avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label htmlFor="user-avatar-upload" className="cursor-pointer">
              <img src={avatarUrl} alt={row.name} className="h-20 w-20 rounded-full bg-muted object-cover" />
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Upload className="h-4 w-4 mb-1" />
                Edit Foto
              </div>
            </label>
          </div>
        </div>

        <div className="flex-1 grid gap-4 md:grid-cols-2 w-full">
          <div className="grid gap-1.5">
            <Label>Full Name</Label>
            <Input defaultValue={row.name} placeholder="Masukkan nama lengkap" />
          </div>
          <div className="grid gap-1.5">
            <Label>Role / Tipe Akun</Label>
            <Select value={role} onValueChange={(v) => setRole(v as "User" | "Creator")}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="User">User</SelectItem>
                <SelectItem value="Creator">Creator</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Email (Disabled) */}
        <div className="grid gap-1.5">
          <Label>Email Address <span className="text-xs font-normal text-muted-foreground">(tidak bisa diganti)</span></Label>
          <Input defaultValue={row.email} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
        </div>

        {/* Phone Number with Country Code Dropdown */}
        <div className="grid gap-1.5">
          <Label>No. HP</Label>
          <div className="flex gap-2">
            <CountryCodeDropdown value={countryCode} onChange={setCountryCode} />
            <Input
              value={phoneNum}
              onChange={(e) => setPhoneNum(e.target.value)}
              placeholder="8123456789"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      {/* Button Send Email Reset Password */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Reset Password</p>
          <p className="text-xs text-muted-foreground">Kirim email berisi tautan untuk mereset kata sandi akun ini.</p>
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={handleSendReset}
          className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground shrink-0 gap-2"
        >
          <Mail className="h-4 w-4" /> Send Email Reset Password
        </Button>
      </div>
    </div>
  );
}

interface CreatorDesign {
  id: string;
  title: string;
  category: string;
  image: string;
  price: string;
  isDraft: boolean;
  savedCount: number;
  date: string;
}

export function UserDetailModal({
  row,
  onClose,
  mode = "view",
}: {
  row: UserRow | null;
  onClose: () => void;
  mode?: "view" | "edit";
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [localMode, setLocalMode] = useState<"view" | "edit">(mode);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [devices, setDevices] = useState<{ ip: string; device: string; lastSeen: string }[]>([]);
  const [businessesList, setBusinessesList] = useState<{ name: string; role: string; logo: string }[]>([]);
  const [designs, setDesigns] = useState<CreatorDesign[]>([]);

  useEffect(() => {
    setLocalMode(mode);
  }, [mode]);

  useEffect(() => {
    if (row) {
      setDevices(row.devices || []);
      
      const mockBiz = (row.businesses || []).map((b, idx) => ({
        name: b,
        role: idx === 0 ? "Owner" : "Member",
        logo: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(b)}&backgroundColor=03a9f4`
      }));
      
      if (mockBiz.length === 0) {
        mockBiz.push(
          { name: "Bliss Group", role: "Owner", logo: "https://api.dicebear.com/7.x/initials/svg?seed=Bliss" },
          { name: "Coca-Cola Indonesia", role: "Owner", logo: "https://api.dicebear.com/7.x/initials/svg?seed=CocaCola" },
          { name: "Donattela", role: "Owner", logo: "https://api.dicebear.com/7.x/initials/svg?seed=Donattela" },
          { name: "Hara Chicken", role: "Owner", logo: "https://api.dicebear.com/7.x/initials/svg?seed=Hara" },
          { name: "Hasan Rama Sagita (Hayhasan)", role: "Owner", logo: "https://api.dicebear.com/7.x/initials/svg?seed=Hasan" },
          { name: "KFC Indonesia", role: "Owner", logo: "https://api.dicebear.com/7.x/initials/svg?seed=KFC" }
        );
      }
      setBusinessesList(mockBiz);

      setDesigns([
        {
          id: "1",
          title: "Susune Mbok Murnii",
          category: "Uncategorized",
          image: "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&q=80&w=200",
          price: "Free",
          isDraft: true,
          savedCount: 0,
          date: "19/6/2026",
        },
        {
          id: "2",
          title: "Summer Refreshment Promo",
          category: "Promo",
          image: "https://images.unsplash.com/photo-1528459801416-a9e53bbf4e17?auto=format&fit=crop&q=80&w=200",
          price: "Rp 15.000",
          isDraft: false,
          savedCount: 24,
          date: "12/6/2026",
        },
        {
          id: "3",
          title: "Coffee Shop Instagram Banner",
          category: "Social Media",
          image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&q=80&w=200",
          price: "Free",
          isDraft: false,
          savedCount: 15,
          date: "05/6/2026",
        }
      ]);
    }
  }, [row]);

  if (!row) return null;

  const handleDelete = () => {
    if (confirmName === row.name) {
      toast.success(`User "${row.name}" berhasil dihapus.`);
      setShowDeleteConfirm(false);
      setConfirmName("");
      onClose();
    } else {
      toast.error("Nama yang dimasukkan tidak cocok!");
    }
  };

  const handleSendReset = () => {
    toast.success(`Email reset password telah dikirim ke ${row.email}`);
  };

  const handleCopyReferral = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Kode referral disalin ke clipboard!");
  };

  const handleToggleDraft = (id: string, isDraft: boolean) => {
    setDesigns(prev => prev.map(d => d.id === id ? { ...d, isDraft } : d));
    toast.success(`Status desain berhasil diubah menjadi ${isDraft ? "Draft" : "Aktif"}`);
  };

  const handleDeleteDesign = (id: string) => {
    setDesigns(prev => prev.filter(d => d.id !== id));
    toast.success("Desain berhasil dihapus");
  };

  const handleCreateDesign = () => {
    const newId = String(designs.length + 1);
    const newDesign: CreatorDesign = {
      id: newId,
      title: `Desain Baru #${newId}`,
      category: "Uncategorized",
      image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=200",
      price: "Free",
      isDraft: true,
      savedCount: 0,
      date: new Date().toLocaleDateString("id-ID"),
    };
    setDesigns(prev => [newDesign, ...prev]);
    toast.success("Desain baru berhasil dibuat sebagai Draft");
  };

  const handleLogoutSingle = (index: number, deviceName: string) => {
    setDevices(prev => prev.filter((_, idx) => idx !== index));
    toast.success(`Sesi perangkat "${deviceName}" berhasil dikeluarkan.`);
  };

  const handleLogoutAll = () => {
    setDevices([]);
    toast.success("Semua sesi perangkat berhasil dikeluarkan.");
  };

  const formatIndonesianDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr.replace(/-/g, "/"));
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      const days = ["Minggu", "Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];
      const months = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
      ];
      return `${days[date.getDay()]}, ${date.getDate()} ${months[date.getMonth()]} ${date.getFullYear()}`;
    } catch {
      return dateStr;
    }
  };

  const formatPhone = (phoneStr: string) => {
    if (!phoneStr) return "-";
    const cleaned = phoneStr.replace(/\s+/g, "").replace(/-/g, "");
    if (cleaned.startsWith("+62")) {
      return `(+62) ${cleaned.slice(3)}`;
    }
    return phoneStr;
  };

  const referralCode = (row.id.replace("USR-", "") + "VR5PHFH").slice(0, 8);
  const invitedUsers = row.name.length % 3;
  const proUsers = row.name.length % 2;

  const filteredDesigns = designs.filter(d => 
    d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    d.category.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const itemsPerPage = 2;
  const totalPages = Math.ceil(filteredDesigns.length / itemsPerPage) || 1;
  const currentDesigns = filteredDesigns.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  return (
    <>
      <DetailModal
        open={!!row}
        onOpenChange={(v) => !v && onClose()}
        title={localMode === "edit" ? `Edit User — ${row.name}` : "Detail User"}
        size="lg"
        footer={
          localMode === "edit" ? (
            <div className="flex justify-between w-full">
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete User
              </Button>
              <div className="flex gap-2">
                <Button onClick={() => { toast.success("Perubahan user berhasil disimpan!"); onClose(); }}>Simpan Perubahan</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete User
              </Button>
              <Button
                variant="outline"
                onClick={handleSendReset}
                className="gap-2 border-slate-200 text-slate-700 hover:bg-slate-50"
              >
                <Mail className="h-4 w-4 text-blue-600" /> Send Email Reset Password
              </Button>
            </div>
          )
        }
      >
        {localMode === "edit" ? (
          <EditUserForm row={row} />
        ) : (
          <div className="flex flex-col gap-6 w-full">
            {/* Informasi Personal */}
            <div className="relative rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4">Informasi Personal</h3>
              
              <div className="flex items-center gap-4 mb-5">
                <img src={row.avatar} alt={row.name} className="h-16 w-16 rounded-full bg-muted object-cover border border-slate-100" />
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h4 className="text-base font-bold text-slate-800 leading-tight">{row.name}</h4>
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-sm uppercase tracking-wider ${
                      row.role === "Creator" 
                        ? "bg-purple-600 text-white" 
                        : "bg-blue-600 text-white"
                    }`}>
                      {row.role}
                    </span>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">Belum ada deskripsi</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-slate-50 pt-4">
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium mb-1">Nama Lengkap</span>
                  <span className="text-xs font-bold text-slate-700">{row.name}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium mb-1">Email</span>
                  <span className="text-xs font-bold text-slate-700 break-all">{row.email}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium mb-1">Telepon</span>
                  <span className="text-xs font-bold text-slate-700">{formatPhone(row.phone)}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium mb-1">Role</span>
                  <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full inline-block ${
                    row.role === "Creator" 
                      ? "bg-purple-50 text-purple-700 border border-purple-100" 
                      : "bg-blue-50 text-blue-700 border border-blue-100"
                  }`}>
                    {row.role}
                  </span>
                </div>
              </div>
            </div>

            {/* Informasi Bisnis */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4">Informasi Bisnis</h3>
              
              <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                {businessesList.map((biz, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-xs">
                    <div className="flex items-center gap-3">
                      <img src={biz.logo} alt={biz.name} className="h-9 w-9 rounded-full border border-slate-100 object-cover bg-white" />
                      <div>
                        <span className="block text-[9px] text-slate-400 font-medium">Nama Bisnis</span>
                        <span className="text-xs font-bold text-slate-700 line-clamp-1">{biz.name}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <span className="block text-[9px] text-slate-400 font-medium">Peran</span>
                        <span className="text-xs font-bold text-slate-700">{biz.role}</span>
                      </div>
                      <Button 
                        size="sm" 
                        className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-medium px-3.5 h-8 rounded-lg"
                        onClick={() => toast.success(`Membuka profil bisnis: ${biz.name}`)}
                      >
                        Lihat
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Activity (Join Date, Last Login) */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4">Activity</h3>
              <div className="rounded-xl border border-slate-100 bg-white p-4 space-y-3">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Join Date</span>
                  <span className="font-bold text-slate-700">{formatIndonesianDate(row.joinDate)}</span>
                </div>
                <div className="border-t border-slate-100" />
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400 font-medium">Last Login</span>
                  <span className="font-bold text-slate-700">{formatIndonesianDate(row.lastLogin)}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </DetailModal>

      <Dialog open={showDeleteConfirm} onOpenChange={(v) => {
        setShowDeleteConfirm(v);
        if (!v) setConfirmName("");
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-destructive flex items-center gap-2">
              Hapus User
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
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
            <Button variant="outline" onClick={() => {
              setShowDeleteConfirm(false);
              setConfirmName("");
            }}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmName !== row.name}
            >
              Ya, Hapus User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
