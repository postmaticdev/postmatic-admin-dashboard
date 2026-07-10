import { useState } from "react";
import { toast } from "sonner";
import { createFileRoute } from "@tanstack/react-router";
import { Briefcase, Plus, Sparkles, UserCheck, Users, CheckCircle, Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Scorecard, ScorecardGrid } from "@/components/admin/Scorecard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { UserCell } from "@/components/admin/UserCell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { SectionCard } from "@/components/admin/SectionCard";
import { UserTabCharts } from "@/components/admin/users/UserTabCharts";
import { AdminTabCharts } from "@/components/admin/users/AdminTabCharts";
import { BusinessTabCharts } from "@/components/admin/users/BusinessTabCharts";
import { UserDetailModal } from "@/components/admin/users/UserDetailModal";
import { AdminDetailModal } from "@/components/admin/users/AdminDetailModal";
import { BusinessDetailModal } from "@/components/admin/users/BusinessDetailModal";
import { InjectTokenModal } from "@/components/admin/users/InjectTokenModal";
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { SearchBar } from "@/components/admin/SearchBar";
import { admins, businesses, dashboardMetrics, users } from "@/lib/mock/data";
import type { AdminRow, BusinessRow, UserRow } from "@/lib/mock/types";
import { formatCompact, formatRp, formatNum } from "@/components/admin/utils";

export const Route = createFileRoute("/_admin/users")({
  head: () => ({
    meta: [
      { title: "User Management — Postmatic Admin" },
      { name: "description", content: "Kelola user, admin, dan business workspace Postmatic." },
    ],
  }),
  component: UsersPage,
});

type Tab = "user" | "admin" | "business";

function UsersPage() {
  const [tab, setTab] = useState<Tab>("user");
  const [addOpen, setAddOpen] = useState(false);
  const [detailUser, setDetailUser] = useState<UserRow | null>(null);
  const [detailAdmin, setDetailAdmin] = useState<AdminRow | null>(null);
  const [detailBiz, setDetailBiz] = useState<BusinessRow | null>(null);
  const [editUser, setEditUser] = useState<UserRow | null>(null);
  const [editAdmin, setEditAdmin] = useState<AdminRow | null>(null);
  const [editBiz, setEditBiz] = useState<BusinessRow | null>(null);
  const [tokenBiz, setTokenBiz] = useState<BusinessRow | null>(null);
  const [approvalUser, setApprovalUser] = useState<UserRow | null>(null);
  const [searchUser, setSearchUser] = useState("");
  const [searchAdmin, setSearchAdmin] = useState("");
  const [searchBiz, setSearchBiz] = useState("");
  const displayUsers = users
    .filter((u) => u.name.toLowerCase().includes(searchUser.toLowerCase()) || u.email.toLowerCase().includes(searchUser.toLowerCase()))
    .sort((a, b) => {
      if (a.role === "User" && b.role === "Creator") return -1;
      if (a.role === "Creator" && b.role === "User") return 1;
      return 0;
    });

  const displayAdmins = admins.filter((a) =>
    a.name.toLowerCase().includes(searchAdmin.toLowerCase()) ||
    a.email.toLowerCase().includes(searchAdmin.toLowerCase())
  );

  const displayBusinesses = businesses.filter((b) =>
    b.name.toLowerCase().includes(searchBiz.toLowerCase()) ||
    b.owner.toLowerCase().includes(searchBiz.toLowerCase())
  );
  const addLabel =
    tab === "user" ? "Add New User" : tab === "admin" ? "Add New Admin" : "Add New Business";

  return (
    <>
      <PageHeader
        title="User Management"
        description="Kelola seluruh user, admin, dan workspace bisnis."
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{addLabel}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            {tab === "business" ? (
              <>
                <FieldRow label="Nama Bisnis" placeholder="Sinar Digital" />
                <FieldRow label="Kategori" placeholder="Digital Agency, E-Commerce, dll." />
                <div className="grid gap-1.5">
                  <Label>Owner</Label>
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Pilih owner" /></SelectTrigger>
                    <SelectContent>
                      {users.map((u) => (
                        <SelectItem key={u.id} value={u.id}>{u.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label>Plan</Label>
                  <Select defaultValue="free">
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="starter">Starter</SelectItem>
                      <SelectItem value="pro">Pro</SelectItem>
                      <SelectItem value="enterprise">Enterprise</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </>
            ) : (
              <>
                <FieldRow label="Full Name" placeholder="Nama lengkap" />
                <FieldRow label="Email" placeholder="email@postmatic.id" type="email" />
                <PasswordFieldRow label="Password" placeholder="••••••••" />
                <PasswordFieldRow label="Confirm Password" placeholder="••••••••" />
                {tab === "admin" ? (
                  <div className="grid gap-1.5">
                    <Label>Role</Label>
                    <Select defaultValue="Admin">
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Super Admin">Super Admin</SelectItem>
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Finance">Finance</SelectItem>
                        <SelectItem value="Customer Support">Customer Support</SelectItem>
                        <SelectItem value="Content">Content</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={() => setAddOpen(false)}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ScorecardGrid>
        <Scorecard label="Total User" value={users.length.toLocaleString("id-ID")} icon={Users} tone="primary" delta={5.2} />
        <Scorecard
          label="Total Active User"
          value={`${users.filter((u) => u.status === "Active").length.toLocaleString("id-ID")} / 10.000`}
          icon={Users}
          tone="success"
          delta={2.1}
        />
        <Scorecard label="Total Active Business" value={`${businesses.length.toLocaleString("id-ID")} / 10.000`} icon={Briefcase} tone="info" delta={7.4} />
        <Scorecard label="Total Generated" value={formatNum(dashboardMetrics.totalGenerated)} icon={Sparkles} tone="warning" delta={-1.2} />
      </ScorecardGrid>

      <Tabs value={tab} onValueChange={(v) => setTab(v as Tab)}>
        <TabsList className="flex w-full h-20 p-2 bg-muted/30 border">
          <TabsTrigger value="user" className="flex-1 h-full text-base font-bold transition-all">User</TabsTrigger>
          <TabsTrigger value="admin" className="flex-1 h-full text-base font-bold transition-all">Admin</TabsTrigger>
          <TabsTrigger value="business" className="flex-1 h-full text-base font-bold transition-all">Business</TabsTrigger>
        </TabsList>

        <TabsContent value="user" className="mt-4">
          <UserTabCharts />
          <SectionCard title="User Management Table" description={`${users.length} user terdaftar.`}>
            <div className="mb-4 flex w-full gap-3">
              <SearchBar className="max-w-full flex-1" placeholder="Search user..." value={searchUser} onChange={setSearchUser} />
              <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Add New User
              </Button>
            </div>
            <DataTable columns={userCols(setDetailUser, setApprovalUser)} data={displayUsers} onRowClick={setDetailUser} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="admin" className="mt-4">
          <AdminTabCharts />
          <SectionCard title="Admin Management Table" description={`${admins.length} admin internal.`}>
            <div className="mb-4 flex w-full gap-3">
              <SearchBar className="max-w-full flex-1" placeholder="Search admin..." value={searchAdmin} onChange={setSearchAdmin} />
              <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Add New Admin
              </Button>
            </div>
            <DataTable columns={adminCols()} data={displayAdmins} onRowClick={setDetailAdmin} />
          </SectionCard>
        </TabsContent>

        <TabsContent value="business" className="mt-4">
          <BusinessTabCharts />
          <SectionCard title="Business Management Table" description={`${businesses.length} workspace aktif.`}>
            <div className="mb-4 flex w-full gap-3">
              <SearchBar className="max-w-full flex-1" placeholder="Search business..." value={searchBiz} onChange={setSearchBiz} />
              <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
                <Plus className="h-4 w-4" /> Add New Business
              </Button>
            </div>
            <DataTable columns={businessCols(setEditBiz, setTokenBiz)} data={displayBusinesses} onRowClick={setDetailBiz} />
          </SectionCard>
        </TabsContent>
      </Tabs>

      <UserDetailModal
        row={detailUser || editUser}
        onClose={() => {
          setDetailUser(null);
          setEditUser(null);
        }}
        mode={editUser ? "edit" : "view"}
      />
      <AdminDetailModal
        row={detailAdmin || editAdmin}
        onClose={() => {
          setDetailAdmin(null);
          setEditAdmin(null);
        }}
        mode={editAdmin ? "edit" : "view"}
      />
      <BusinessDetailModal
        row={detailBiz || editBiz}
        onClose={() => {
          setDetailBiz(null);
          setEditBiz(null);
        }}
        mode={editBiz ? "edit" : "view"}
      />
      <InjectTokenModal row={tokenBiz} onClose={() => setTokenBiz(null)} />

      <Dialog open={!!approvalUser} onOpenChange={(v) => !v && setApprovalUser(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Persetujuan Request Creator
            </DialogTitle>
          </DialogHeader>
          {approvalUser && (
            <div className="grid gap-4 py-3">
              <p className="text-sm text-muted-foreground">
                Tinjau permintaan dari user berikut untuk meningkatkan tipe akun menjadi Creator.
              </p>
              <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Nama Lengkap:</span>
                  <span className="font-semibold">{approvalUser.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email:</span>
                  <span>{approvalUser.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bisnis:</span>
                  <span className="font-semibold">{approvalUser.businesses.join(", ")}</span>
                </div>
              </div>
            </div>
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              className="border-destructive/30 text-destructive hover:bg-destructive hover:text-destructive-foreground"
              onClick={() => {
                if (approvalUser) {
                  toast.error(`Request Creator untuk "${approvalUser.name}" ditolak.`);
                  setApprovalUser(null);
                }
              }}
            >
              Tolak Request
            </Button>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
              onClick={() => {
                if (approvalUser) {
                  toast.success(`Request Creator untuk "${approvalUser.name}" disetujui!`);
                  setApprovalUser(null);
                }
              }}
            >
              Setujui Request
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function FieldRow({ label, placeholder, type = "text" }: { label: string; placeholder?: string; type?: string }) {
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <Input type={type} placeholder={placeholder} />
    </div>
  );
}

function PasswordFieldRow({ label, placeholder }: { label: string; placeholder?: string }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="grid gap-1.5">
      <Label>{label}</Label>
      <div className="relative">
        <Input 
          type={showPassword ? "text" : "password"} 
          placeholder={placeholder} 
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
        >
          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </div>
  );
}

function userCols(
  openInfo: (r: UserRow) => void,
  onApprove: (r: UserRow) => void,
): Column<UserRow>[] {
  return [
    { key: "u", header: "Profile & Name", render: (r) => <UserCell name={r.name} email={r.email} avatar={r.avatar} /> },
    { key: "e", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "p", header: "Phone Number", render: (r) => <span className="text-muted-foreground">{r.phone}</span> },
    { key: "r", header: "Role", render: (r) => <StatusBadge status={r.role} /> },
    {
      key: "b",
      header: "Business",
      render: (r) => (
        <div className="flex flex-wrap gap-1">
          {r.businesses.map((b) => (
            <span key={b} className="inline-flex items-center rounded-md bg-primary/10 text-primary px-2 py-0.5 text-xs font-medium ring-1 ring-inset ring-primary/20">
              {b}
            </span>
          ))}
        </div>
      ),
    },
    {
      key: "a",
      header: "Creator Approval",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          {r.role === "User" && (
            <Button
              size="sm"
              variant="outline"
              onClick={(e) => {
                e.stopPropagation();
                onApprove(r);
              }}
              className="gap-1 border-emerald-500 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 font-medium text-xs px-3 py-1.5 h-8 rounded-lg shadow-sm"
            >
              <CheckCircle className="h-3.5 w-3.5" /> Approval
            </Button>
          )}
        </div>
      ),
    },
  ];
}

function adminCols(): Column<AdminRow>[] {
  return [
    { key: "u", header: "Profile & Name", render: (r) => <UserCell name={r.name} email={r.email} avatar={r.avatar} /> },
    { key: "e", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "p", header: "Phone Number", render: (r) => <span className="text-muted-foreground">{r.phone}</span> },
    { key: "r", header: "Role", render: (r) => <StatusBadge status={r.role} /> },
    { key: "l", header: "Last Login", render: (r) => <span className="text-muted-foreground">{r.lastLogin}</span> },
  ];
}

function businessCols(
  openEdit: (r: BusinessRow) => void,
  openToken: (r: BusinessRow) => void,
): Column<BusinessRow>[] {
  return [
    {
      key: "b",
      header: "Profile & Business",
      render: (r) => (
        <div className="flex items-center gap-3">
          <img src={r.logo} alt={r.name} className="h-9 w-9 rounded-lg bg-muted" />
          <div>
            <p className="text-sm font-medium text-foreground">{r.name}</p>
            <p className="text-xs text-muted-foreground">Owner: {r.owner}</p>
          </div>
        </div>
      ),
    },
    { key: "c", header: "Category Business", render: (r) => <span className="text-muted-foreground">{r.category}</span> },
    { key: "t", header: "Type", render: (r) => <StatusBadge status={r.plan === "Free" ? "Trial" : "Paid"} /> },
    { key: "bal", header: "Balance", align: "right", render: (r) => <span className="font-medium">{formatRp(r.balance)}</span> },
    {
      key: "a",
      header: "Action",
      align: "right",
      render: (r) => (
        <div className="flex items-center justify-end gap-2">
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              openToken(r);
            }}
            className="gap-1 bg-blue-600 hover:bg-blue-700 text-white font-medium text-xs px-3 py-1.5 h-8 rounded-lg shadow-sm"
          >
            <Plus className="h-3.5 w-3.5" /> Tambah Token
          </Button>
          <ActionMenu onEdit={() => openEdit(r)} />
        </div>
      ),
    },
  ];
}
