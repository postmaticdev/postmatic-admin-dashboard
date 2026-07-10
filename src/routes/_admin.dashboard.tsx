import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Bot,
  Briefcase,
  ChevronRight,
  DollarSign,
  Sparkles,
  Users,
  Zap,
} from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { GlobalFilter } from "@/components/admin/GlobalFilter";
import { Scorecard, ScorecardGrid } from "@/components/admin/Scorecard";
import { SectionCard } from "@/components/admin/SectionCard";
import { RevenueLineChart } from "@/components/admin/RevenueLineChart";
import { AiModelChart, PlatformPieChart } from "@/components/admin/OverviewCharts";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { UserCell } from "@/components/admin/UserCell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import {
  aiModels,
  dashboardMetrics,
  messages,
  users,
} from "@/lib/mock/data";
import { formatCompact, formatRp, formatNum } from "@/components/admin/utils";
import type { UserRow } from "@/lib/mock/types";

export const Route = createFileRoute("/_admin/dashboard")({
  head: () => ({
    meta: [
      { title: "Overview — Postmatic Admin" },
      { name: "description", content: "Ringkasan performa Postmatic: revenue, user, chat, dan AI usage." },
    ],
  }),
  component: DashboardPage,
});

function DashboardPage() {
  const cols: Column<UserRow>[] = [
    {
      key: "user",
      header: "Profile & Name",
      render: (r) => <UserCell name={r.name} email={r.email} avatar={r.avatar} />,
    },
    { key: "email", header: "Email", render: (r) => <span className="text-muted-foreground">{r.email}</span> },
    { key: "business", header: "Business", render: (r) => r.business },
    { key: "join", header: "Join Date", render: (r) => r.joinDate },
    {
      key: "action",
      header: "Action",
      align: "right",
      render: () => <ActionMenu />,
    },
  ];

  return (
    <>
      <PageHeader
        title="Overview"
        description="Ringkasan performa Postmatic hari ini."
        actions={<GlobalFilter />}
      />

      <ScorecardGrid>
        <Scorecard
          label="Total Revenue"
          value={formatRp(dashboardMetrics.totalRevenue)}
          delta={12.4}
          hint="vs bulan lalu"
          icon={DollarSign}
          tone="primary"
        />
        <Scorecard
          label="Active Users"
          value={`${dashboardMetrics.activeUsers.toLocaleString("id-ID")} / 10.000`}
          delta={8.1}
          hint="vs bulan lalu"
          icon={Users}
          tone="success"
        />
        <Scorecard
          label="Active Business"
          value={`${dashboardMetrics.activeBusinesses.toLocaleString("id-ID")} / 10.000`}
          delta={4.6}
          hint="vs bulan lalu"
          icon={Briefcase}
          tone="info"
        />
        <Scorecard
          label="Total Generated"
          value={formatNum(dashboardMetrics.totalGenerated)}
          delta={-2.3}
          hint="konten dihasilkan"
          icon={Sparkles}
          tone="warning"
        />
      </ScorecardGrid>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Revenue Growth"
            description="Pergerakan revenue selama 12 bulan terakhir."
            action={<GlobalFilter value="monthly" />}
          >
            <RevenueLineChart />
          </SectionCard>
        </div>
        <SectionCard
          title="Unread Messages"
          description="Pesan yang belum dibalas."
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/feedback" search={{ tab: "Chat" }}>
                Buka <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <ul className="divide-y">
            {messages
              .filter((m) => m.unread)
              .slice(0, 5)
              .map((m) => (
                <li key={m.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
                  <img src={m.contactAvatar} alt={m.contact} className="h-9 w-9 rounded-full bg-muted" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-medium text-foreground">{m.contact}</p>
                      <StatusBadge status={m.channel} />
                    </div>
                    <p className="truncate text-xs text-muted-foreground">{m.subject}</p>
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">{m.at.slice(-5)}</span>
                </li>
              ))}
          </ul>
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="AI Model Requests Analytics"
            description="Volume request untuk masing-masing AI Model yang aktif."
          >
            <AiModelChart />
          </SectionCard>
        </div>
        <SectionCard
          title="Campaign Platform Distribution"
          description="Rasio pengiriman broadcast berdasarkan platform."
        >
          <PlatformPieChart />
        </SectionCard>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <div className="xl:col-span-2">
          <SectionCard
            title="Ringkasan User"
            description="12 user terbaru terdaftar."
            action={
              <Button variant="ghost" size="sm" asChild>
                <Link to="/users">
                  Lihat semua <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
            }
          >
            <DataTable columns={cols} data={users.slice(0, 6)} />
          </SectionCard>
        </div>
        <SectionCard
          title="AI Model Quick Access"
          description="Shortcut konfigurasi model aktif."
          action={
            <Button variant="ghost" size="sm" asChild>
              <Link to="/workspace" search={{ tab: "pricing" }}>
                Semua model <ChevronRight className="h-4 w-4" />
              </Link>
            </Button>
          }
        >
          <div className="grid grid-cols-2 gap-3">
            {aiModels.slice(0, 4).map((m) => (
              <Link
                key={m.id}
                to="/workspace"
                search={{ tab: "pricing" }}
                className="group flex flex-col gap-2 rounded-lg border p-3 hover:border-primary hover:bg-accent transition-colors"
              >
                <div className="flex items-center justify-between">
                  <Bot className="h-4 w-4 text-primary" />
                  <StatusBadge status={m.active ? "Active" : "Inactive"} />
                </div>
                <p className="text-sm font-semibold text-foreground">{m.name}</p>
                <p className="text-xs text-muted-foreground">{m.provider} · {m.version}</p>
                <div className="flex items-center gap-1 text-xs text-primary opacity-0 group-hover:opacity-100 transition-opacity">
                  <Zap className="h-3 w-3" /> Kelola
                </div>
              </Link>
            ))}
          </div>
        </SectionCard>
      </div>

    </>
  );
}