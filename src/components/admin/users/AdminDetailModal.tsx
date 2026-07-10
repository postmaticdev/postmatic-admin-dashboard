import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Upload, Trash2, Mail } from "lucide-react";
import { DetailModal } from "@/components/admin/DetailModal";
import { SectionCard } from "@/components/admin/SectionCard";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DetailInfoHeader, ResetPasswordButton, RoleBadge } from "@/components/admin/DetailInfoHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import type { AdminRow } from "@/lib/mock/types";

function displayRole(role: AdminRow["role"]) {
  return role === "Super Admin" ? "Super Admin" : "Admin";
}

function EditAdminForm({ row }: { row: AdminRow }) {
  const [phoneNum, setPhoneNum] = useState(row.phone);
  const [role, setRole] = useState(row.role);
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
              id="admin-avatar-upload"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
            <label htmlFor="admin-avatar-upload" className="cursor-pointer">
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
            <Input defaultValue={row.name} placeholder="Masukkan nama lengkap admin" />
          </div>
          <div className="grid gap-1.5">
            <Label>Admin Role</Label>
            <Select value={role} onValueChange={(v: any) => setRole(v)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Super Admin">Super Admin</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Email (Disabled) */}
        <div className="grid gap-1.5">
          <Label>Email Address <span className="text-xs font-normal text-muted-foreground">(tidak bisa diganti)</span></Label>
          <Input defaultValue={row.email} disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
        </div>

        {/* Phone Number */}
        <div className="grid gap-1.5">
          <Label>Phone Number</Label>
          <Input
            value={phoneNum}
            onChange={(e) => setPhoneNum(e.target.value)}
            placeholder="08123456789"
          />
        </div>
      </div>

      {/* Button Send Email Reset Password */}
      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-foreground">Reset Password</p>
          <p className="text-xs text-muted-foreground">Kirim email berisi tautan untuk mereset kata sandi akun admin ini.</p>
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

export function AdminDetailModal({
  row,
  onClose,
  mode = "view",
}: {
  row: AdminRow | null;
  onClose: () => void;
  mode?: "view" | "edit";
}) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [confirmName, setConfirmName] = useState("");
  const [adminRole, setAdminRole] = useState("Admin");

  useEffect(() => {
    if (row) {
      setAdminRole(row.role);
    }
  }, [row]);

  if (!row) return null;

  const handleDelete = () => {
    if (confirmName === row.name) {
      toast.success(`Admin "${row.name}" berhasil dihapus.`);
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

  return (
    <>
      <DetailModal
        open={!!row}
        onOpenChange={(v) => !v && onClose()}
        title={mode === "edit" ? `Edit Admin — ${row.name}` : "Detail Admin"}
        size="lg"
        footer={
          mode === "edit" ? (
            <div className="flex justify-between w-full">
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                Delete Admin
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={onClose}>
                  Batal
                </Button>
                <Button onClick={() => { toast.success("Perubahan admin berhasil disimpan!"); onClose(); }}>Simpan Perubahan</Button>
              </div>
            </div>
          ) : (
            <div className="flex justify-between w-full">
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)} className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete Admin
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
        {mode === "edit" ? (
          <EditAdminForm row={row} />
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
                    <Select 
                      value={adminRole} 
                      onValueChange={(val: any) => {
                        setAdminRole(val);
                        toast.success(`Role admin berhasil diubah menjadi ${val}`);
                      }}
                    >
                      <SelectTrigger className="h-6 px-2 py-0 text-[10px] font-bold bg-indigo-50 border-indigo-100 text-indigo-700 rounded-sm w-[120px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="text-xs">
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Customer Support">Customer Support</SelectItem>
                        <SelectItem value="Content">Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <span className="text-xs text-slate-400 font-medium">User ID: {row.id}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 border-t border-slate-50 pt-4">
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium mb-1">Nama Lengkap</span>
                  <span className="text-xs font-bold text-slate-700">{row.name}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium mb-1">Email</span>
                  <span className="text-xs font-bold text-slate-700 break-all">{row.email}</span>
                </div>
                <div>
                  <span className="block text-[11px] text-slate-400 font-medium mb-1">No. HP</span>
                  <span className="text-xs font-bold text-slate-700">{row.phone}</span>
                </div>
              </div>
            </div>

            {/* Security Details */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4">Security Details</h3>
              <dl className="mb-4 grid grid-cols-2 gap-4 text-xs border-b border-slate-50 pb-4">
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Join Date</span>
                  <span className="text-xs font-bold text-slate-700">{row.joinDate}</span>
                </div>
                <div>
                  <span className="text-slate-400 font-medium block mb-1">Last Login</span>
                  <span className="text-xs font-bold text-slate-700">{row.lastLogin}</span>
                </div>
              </dl>
              
              <h4 className="text-[10px] font-bold text-slate-800 mb-3 uppercase tracking-wider">Log Perangkat & IP</h4>
              <div className="space-y-3 max-h-[180px] overflow-y-auto pr-1">
                {row.devices.map((d, i) => (
                  <div key={i} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-xs">
                    <div>
                      <span className="block text-xs font-bold text-slate-700">{d.device}</span>
                      <span className="text-[10px] text-slate-400 font-medium">IP {d.ip}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{d.lastSeen}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Log Activity */}
            <div className="rounded-xl border border-slate-100 bg-white p-5 shadow-xs">
              <h3 className="text-base font-bold text-slate-800 mb-4">Log Activity</h3>
              <div className="space-y-3 max-h-[220px] overflow-y-auto pr-1">
                {row.auditLog.map((log) => (
                  <div key={log.id} className="flex items-center justify-between bg-slate-50 border border-slate-100 rounded-xl p-3 shadow-xs">
                    <div>
                      <span className="block text-xs font-bold text-slate-700">{log.action}</span>
                      <span className="text-[10px] text-slate-400 font-medium">Module: {log.module}</span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-medium">{log.timestamp}</span>
                  </div>
                ))}
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
              Hapus Admin
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-3">
            <p className="text-sm text-muted-foreground">
              Apakah Anda yakin ingin menghapus admin ini? Tindakan ini tidak dapat dibatalkan.
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
              Ya, Hapus Admin
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
