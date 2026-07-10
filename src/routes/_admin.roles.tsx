import { useState, useMemo } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { 
  ShieldCheck, 
  Plus, 
  Edit2, 
  Shield, 
  Info, 
  CheckSquare, 
  Square,
  Users2,
  Trash2
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { SearchBar } from "@/components/admin/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

export const Route = createFileRoute("/_admin/roles")({
  head: () => ({
    meta: [
      { title: "Role Management — Postmatic Admin" },
      { name: "description", content: "Kelola hak akses dan permission role User serta Admin Postmatic." },
    ],
  }),
  component: RolesPage,
});

interface RoleItem {
  id: string;
  name: string;
  description: string;
  assigned: number;
  permissions: string[];
}

const ADMIN_PERMISSIONS = [
  "Create Admin",
  "Manage Admin",
  "Delete Admin",
  "Create User",
  "Manage User",
  "Delete User",
  "Create Workspace",
  "Manage Workspace",
  "Delete Workspace",
  "Add & Manage Model/Prompt",
  "Manage User Access Management",
  "Manage Landing Page",
  "Manage Email & CRM",
  "See all menu dashboard (Main, Model, Finance, CS)",
  "Inject Token"
];

const USER_PERMISSIONS = [
  "Manage User",
  "Create Workspace",
  "Manage Workspace",
  "Delete Workspace",
  "Creator menu",
  "Wajib Share generate",
  "Limited Generated",
  "Watermark when download",
  "Model Postmatic Vision Flash",
  "Model Postmatic Vision",
  "Model Postmatic Vision Pro",
  "Model Postmatic Vision Max"
];

const INITIAL_ADMIN_ROLES: RoleItem[] = [
  {
    id: "adm-1",
    name: "Super Admin",
    description: "Memiliki kontrol penuh atas seluruh sistem dashboard, model AI, akses user, serta integrasi server.",
    assigned: 2,
    permissions: [...ADMIN_PERMISSIONS]
  },
  {
    id: "adm-2",
    name: "Finance Manager",
    description: "Bertanggung jawab atas pengelolaan transaksi keuangan, laporan pendapatan, serta fitur token inject keuangan.",
    assigned: 1,
    permissions: [
      "See all menu dashboard (Main, Model, Finance, CS)",
      "Inject Token"
    ]
  },
  {
    id: "adm-3",
    name: "Customer Support",
    description: "Merespon tiket bantuan, memantau feedback, dan mengelola profil user serta status akun dasar.",
    assigned: 3,
    permissions: [
      "Create User",
      "Manage User",
      "See all menu dashboard (Main, Model, Finance, CS)"
    ]
  },
  {
    id: "adm-4",
    name: "Content & Prompt Editor",
    description: "Mengelola landing page, memperbarui model AI, template prompt, serta kampanye email/CRM.",
    assigned: 1,
    permissions: [
      "Add & Manage Model/Prompt",
      "Manage Landing Page",
      "Manage Email & CRM"
    ]
  }
];

const INITIAL_USER_ROLES: RoleItem[] = [
  {
    id: "usr-1",
    name: "Creator",
    description: "Pengguna dengan akses ke menu creator, model Postmatic Vision Pro/Flash, dan kemampuan kelola workspace.",
    assigned: 24,
    permissions: [
      "Creator menu",
      "Create Workspace",
      "Manage Workspace",
      "Model Postmatic Vision Flash",
      "Model Postmatic Vision",
      "Model Postmatic Vision Pro"
    ]
  },
  {
    id: "usr-2",
    name: "Regular User",
    description: "Pengguna dasar dengan watermark pada unduhan hasil generate, kuota terbatas, dan model Flash dasar.",
    assigned: 145,
    permissions: [
      "Limited Generated",
      "Watermark when download",
      "Model Postmatic Vision Flash"
    ]
  },
  {
    id: "usr-3",
    name: "Enterprise Team",
    description: "Akun workspace perusahaan dengan akses penuh model Vision Max, tanpa limitasi, dan tanpa watermark.",
    assigned: 8,
    permissions: [
      "Create Workspace",
      "Manage Workspace",
      "Delete Workspace",
      "Creator menu",
      "Model Postmatic Vision Flash",
      "Model Postmatic Vision",
      "Model Postmatic Vision Pro",
      "Model Postmatic Vision Max"
    ]
  }
];

function RolesPage() {
  const [tab, setTab] = useState<"admin" | "user">("admin");
  const [adminRoles, setAdminRoles] = useState<RoleItem[]>(INITIAL_ADMIN_ROLES);
  const [userRoles, setUserRoles] = useState<RoleItem[]>(INITIAL_USER_ROLES);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleItem | null>(null);
  
  // Form State
  const [roleName, setRoleName] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

  // Filtered Roles
  const filteredAdminRoles = useMemo(() => {
    return adminRoles.filter(role => 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [adminRoles, searchQuery]);

  const filteredUserRoles = useMemo(() => {
    return userRoles.filter(role => 
      role.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      role.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [userRoles, searchQuery]);

  const activePermissionsList = tab === "admin" ? ADMIN_PERMISSIONS : USER_PERMISSIONS;

  const handleOpenCreateModal = () => {
    setEditingRole(null);
    setRoleName("");
    setRoleDescription("");
    setSelectedPermissions([]);
    setModalOpen(true);
  };

  const handleOpenEditModal = (role: RoleItem) => {
    setEditingRole(role);
    setRoleName(role.name);
    setRoleDescription(role.description);
    setSelectedPermissions(role.permissions);
    setModalOpen(true);
  };

  const handleDeleteRole = (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus role ini?")) {
      if (tab === "admin") {
        setAdminRoles(prev => prev.filter(r => r.id !== id));
      } else {
        setUserRoles(prev => prev.filter(r => r.id !== id));
      }
      toast.success("Role berhasil dihapus!");
    }
  };

  const handleTogglePermission = (perm: string) => {
    setSelectedPermissions(prev => 
      prev.includes(perm) 
        ? prev.filter(p => p !== perm) 
        : [...prev, perm]
    );
  };

  const handleSelectAllPermissions = () => {
    if (selectedPermissions.length === activePermissionsList.length) {
      setSelectedPermissions([]);
    } else {
      setSelectedPermissions([...activePermissionsList]);
    }
  };

  const handleSave = () => {
    if (!roleName.trim()) {
      toast.error("Nama Role wajib diisi!");
      return;
    }

    if (editingRole) {
      // Edit mode
      const updateFn = (prev: RoleItem[]) => 
        prev.map(r => r.id === editingRole.id 
          ? { ...r, name: roleName, description: roleDescription, permissions: selectedPermissions }
          : r
        );
      
      if (tab === "admin") {
        setAdminRoles(updateFn);
      } else {
        setUserRoles(updateFn);
      }
      toast.success(`Role "${roleName}" berhasil diperbarui!`);
    } else {
      // Create mode
      const newRole: RoleItem = {
        id: `${tab === "admin" ? "adm" : "usr"}-${Date.now()}`,
        name: roleName,
        description: roleDescription,
        assigned: 0,
        permissions: selectedPermissions
      };

      if (tab === "admin") {
        setAdminRoles(prev => [...prev, newRole]);
      } else {
        setUserRoles(prev => [...prev, newRole]);
      }
      toast.success(`Role "${roleName}" berhasil dibuat!`);
    }

    setModalOpen(false);
  };

  // Columns definition
  const columns: Column<RoleItem>[] = [
    {
      key: "name",
      header: "Nama Role",
      render: (r) => (
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <Shield className="h-4.5 w-4.5" />
          </div>
          <div>
            <span className="font-semibold text-foreground">{r.name}</span>
          </div>
        </div>
      )
    },
    {
      key: "description",
      header: "Deskripsi",
      render: (r) => (
        <span className="text-muted-foreground text-sm line-clamp-2 max-w-[450px]">
          {r.description || "-"}
        </span>
      )
    },
    {
      key: "assigned",
      header: "Assign",
      render: (r) => (
        <div className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
          <Users2 className="h-4 w-4" />
          <span>{r.assigned} Pengguna</span>
        </div>
      )
    },
    {
      key: "action",
      header: "Aksi",
      align: "center",
      render: (r) => (
        <div className="flex justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleOpenEditModal(r);
            }}
            className="flex items-center gap-1 px-3 py-1.5 h-8 text-xs font-semibold text-primary border-primary/20 hover:bg-primary/5 hover:text-primary transition-all rounded-lg"
          >
            <Edit2 className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteRole(r.id);
            }}
            className="flex items-center gap-1 px-3 py-1.5 h-8 text-xs font-semibold text-rose-600 border-rose-200 hover:bg-rose-50 hover:text-rose-700 transition-all rounded-lg"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Hapus
          </Button>
        </div>
      )
    }
  ];

  return (
    <>
      <PageHeader
        title="Role Management"
        description="Kelola template hak akses, nama peranan, deskripsi, dan permission untuk pengguna serta administrator."
      />

      <Tabs 
        value={tab} 
        onValueChange={(val) => {
          setTab(val as "admin" | "user");
          setSearchQuery("");
        }} 
        className="w-full"
      >
        <TabsList className="flex w-full h-20 p-2 bg-muted/30 border mb-6">
          <TabsTrigger value="admin" className="flex-1 h-full text-base font-bold transition-all">Admin</TabsTrigger>
          <TabsTrigger value="user" className="flex-1 h-full text-base font-bold transition-all">User</TabsTrigger>
        </TabsList>

        <TabsContent value="admin" className="mt-4">
          <SectionCard 
            title="Admin Management Table" 
            description={`Terdapat ${adminRoles.length} template peranan administrator sistem.`}
          >
            <div className="mb-4 flex w-full gap-3">
              <SearchBar 
                className="max-w-full flex-1" 
                placeholder="Search admin role..." 
                value={searchQuery} 
                onChange={setSearchQuery} 
              />
              <Button 
                onClick={handleOpenCreateModal} 
                className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Plus className="h-4 w-4" /> Create New Role
              </Button>
            </div>
            <DataTable columns={columns} data={filteredAdminRoles} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="user" className="mt-4">
          <SectionCard 
            title="User Management Table" 
            description={`Terdapat ${userRoles.length} tipe role lisensi untuk pengguna akhir.`}
          >
            <div className="mb-4 flex w-full gap-3">
              <SearchBar 
                className="max-w-full flex-1" 
                placeholder="Search user role..." 
                value={searchQuery} 
                onChange={setSearchQuery} 
              />
              <Button 
                onClick={handleOpenCreateModal} 
                className="gap-2 shrink-0 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
              >
                <Plus className="h-4 w-4" /> Create New Role
              </Button>
            </div>
            <DataTable columns={columns} data={filteredUserRoles} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      {/* Create / Edit Dialog Modal */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden rounded-2xl border bg-card p-0 shadow-2xl">
          <DialogHeader className="p-6 pb-4 border-b">
            <DialogTitle className="text-xl font-bold text-foreground flex items-center gap-2">
              <ShieldCheck className="h-5.5 w-5.5 text-primary" />
              {editingRole ? "Edit Role" : "Tambah Role Baru"} ({tab === "admin" ? "Admin" : "User"})
            </DialogTitle>
            <DialogDescription className="text-muted-foreground mt-1">
              {editingRole ? "Modifikasi detail informasi dan cakupan permission untuk role ini." : "Buat template peranan akses baru dan tetapkan daftar permission terkait."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* Nama & Deskripsi */}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="grid gap-1.5">
                <Label htmlFor="roleName" className="text-sm font-semibold text-foreground">Nama Role</Label>
                <Input
                  id="roleName"
                  placeholder="Contoh: Super Admin, Premium, etc."
                  value={roleName}
                  onChange={(e) => setRoleName(e.target.value)}
                  className="rounded-xl border-input/60 focus-visible:ring-primary"
                />
              </div>
              <div className="grid gap-1.5">
                <Label htmlFor="roleDesc" className="text-sm font-semibold text-foreground">Deskripsi Singkat</Label>
                <Textarea
                  id="roleDesc"
                  placeholder="Berikan keterangan kegunaan role ini..."
                  value={roleDescription}
                  onChange={(e) => setRoleDescription(e.target.value)}
                  className="rounded-xl border-input/60 focus-visible:ring-primary min-h-[40px] resize-none"
                  rows={2}
                />
              </div>
            </div>

            {/* Permission Checkbox Checklist */}
            <div className="space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-border/40">
                <Label className="text-sm font-bold text-foreground flex items-center gap-1.5">
                  Hak Akses / Permission
                  <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {selectedPermissions.length} Terpilih
                  </span>
                </Label>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleSelectAllPermissions}
                  className="h-8 text-xs font-semibold text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors rounded-lg flex items-center gap-1"
                >
                  {selectedPermissions.length === activePermissionsList.length ? (
                    <>
                      <Square className="h-3.5 w-3.5" />
                      Deselect All
                    </>
                  ) : (
                    <>
                      <CheckSquare className="h-3.5 w-3.5" />
                      Pilih Semua
                    </>
                  )}
                </Button>
              </div>

              {/* Permissions list Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-1">
                {activePermissionsList.map((perm) => {
                  const isChecked = selectedPermissions.includes(perm);
                  return (
                    <div 
                      key={perm}
                      onClick={() => handleTogglePermission(perm)}
                      className={`flex items-center space-x-3 p-3 rounded-xl border transition-all cursor-pointer select-none hover:bg-muted/30 ${isChecked ? "bg-primary/5 border-primary/25 shadow-sm" : "border-border/60 bg-card"}`}
                    >
                      <Checkbox
                        id={`perm-${perm}`}
                        checked={isChecked}
                        onCheckedChange={() => handleTogglePermission(perm)}
                        className="rounded-sm border-primary/50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground focus:ring-0"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <label 
                        htmlFor={`perm-${perm}`}
                        className="text-sm font-medium text-foreground leading-none cursor-pointer flex-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {perm}
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <DialogFooter className="p-6 pt-4 border-t bg-muted/20 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border-border hover:bg-muted/50 font-semibold px-4 py-2.5 transition-colors"
            >
              Batal
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 py-2.5 shadow-md shadow-primary/10 transition-all"
            >
              Simpan Perubahan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
