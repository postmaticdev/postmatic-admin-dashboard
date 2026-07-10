import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { LogOut, Upload } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/_admin/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Postmatic Admin" },
      { name: "description", content: "Kelola profil admin dan keamanan akun." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const [avatarUrl, setAvatarUrl] = useState("https://api.dicebear.com/7.x/notionists/svg?seed=Andini%20Prameswari");

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <>
      <PageHeader title="Settings" description="Kelola profil dan keamanan akun admin Anda." />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <SectionCard title="Profil Admin" description="Informasi yang tampil di dashboard.">
            <div className="flex flex-col md:flex-row gap-6 items-start">
              <div className="flex items-center gap-4 shrink-0">
                <div className="relative group cursor-pointer overflow-hidden rounded-xl h-20 w-20 border">
                  <input
                    type="file"
                    id="avatar-upload"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAvatarChange}
                  />
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <img
                      src={avatarUrl}
                      alt="Avatar"
                      className="h-20 w-20 rounded-xl bg-muted object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-[10px] text-white font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Upload className="h-4 w-4 mb-1" />
                      Edit Foto
                    </div>
                  </label>
                </div>
              </div>
              <div className="flex-1 grid gap-4 md:grid-cols-2 w-full">
                <div className="grid gap-1.5">
                  <Label>Nama Lengkap</Label>
                  <Input defaultValue="Andini Prameswari" />
                </div>
                <div className="grid gap-1.5">
                  <Label>Email <span className="text-xs font-normal text-muted-foreground">(tidak bisa diganti)</span></Label>
                  <Input type="email" defaultValue="andini@postmatic.id" disabled className="bg-muted text-muted-foreground cursor-not-allowed" />
                </div>
              </div>
            </div>
          </SectionCard>

          <SectionCard title="Ubah Password" description="Gunakan password yang kuat & unik.">
            <div className="grid gap-4 md:grid-cols-3">
              <div className="grid gap-1.5">
                <Label>Current Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="grid gap-1.5">
                <Label>New Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
              <div className="grid gap-1.5">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="••••••••" />
              </div>
            </div>
          </SectionCard>

          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="destructive" className="gap-2">
              <LogOut className="h-4 w-4" /> Logout
            </Button>
            <Button className="min-w-32">Save Changes</Button>
          </div>
        </div>

        <SectionCard title="Ringkasan Akun">
          <dl className="space-y-4 text-sm">
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Role</dt>
              <dd className="mt-0.5 font-medium">Super Admin</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Bergabung</dt>
              <dd className="mt-0.5 font-medium">12 Januari 2023</dd>
            </div>
            <div>
              <dt className="text-xs uppercase text-muted-foreground">Terakhir Login</dt>
              <dd className="mt-0.5 font-medium">6 Juli 2026 · 09:00</dd>
            </div>
          </dl>
        </SectionCard>
      </div>
    </>
  );
}