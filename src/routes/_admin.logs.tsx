import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/PageHeader";
import { SectionCard } from "@/components/admin/SectionCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { UserCell } from "@/components/admin/UserCell";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { DetailModal } from "@/components/admin/DetailModal";
import { KeyValueList } from "@/components/admin/KeyValueList";
import { JsonDiffBlock } from "@/components/admin/JsonDiffBlock";
import { SearchBar } from "@/components/admin/SearchBar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { logs } from "@/lib/mock/data";
import type { LogRow } from "@/lib/mock/types";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/logs")({
  head: () => ({
    meta: [
      { title: "Log Activity — Postmatic Admin" },
      { name: "description", content: "Audit trail seluruh aktivitas admin Postmatic." },
    ],
  }),
  component: LogsPage,
});

function LogsPage() {
  const [detail, setDetail] = useState<LogRow | null>(null);
  const [search, setSearch] = useState("");
  const [dateFilter, setDateFilter] = useState("");
  const [userFilter, setUserFilter] = useState("all");
  const [moduleFilter, setModuleFilter] = useState("all");
  const cols: Column<LogRow>[] = [
    { key: "t", header: "Timestamp", render: (r) => <span className="text-muted-foreground">{r.at}</span> },
    { key: "u", header: "Nama Admin", render: (r) => <UserCell name={r.actor} avatar={r.actorAvatar} /> },
    { key: "m", header: "Module", render: (r) => r.module },
    { key: "ip", header: "IP Address", render: (r) => <span className="font-mono text-xs">{r.ip}</span> },
    {
      key: "status",
      header: "Status (CRUD)",
      render: (r) => {
        const variantMap: Record<string, string> = {
          Create: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
          Approve: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/20",
          Update: "bg-amber-500/10 text-amber-500 ring-amber-500/20",
          Delete: "bg-rose-500/10 text-rose-500 ring-rose-500/20",
          Login: "bg-blue-500/10 text-blue-500 ring-blue-500/20",
        };
        const cls = variantMap[r.action] ?? "bg-muted text-muted-foreground ring-border";
        return (
          <span className={cn("inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset", cls)}>
            {r.action}
          </span>
        );
      }
    },
  ];

  return (
    <>
      <PageHeader title="Log Activity" description="Audit trail aktivitas admin & sistem Postmatic." />
      <SectionCard title="Log Activity Table" description={`${logs.length.toLocaleString("id-ID")} aktivitas tercatat.`}>
        <div className="mb-4 flex flex-col sm:flex-row gap-3 w-full">
          <SearchBar className="max-w-full flex-1" placeholder="Search logs..." value={search} onChange={setSearch} />
          <Input 
            type="date" 
            className="w-full sm:w-[150px]" 
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
          />
          <Select value={userFilter} onValueChange={setUserFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Users" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Users</SelectItem>
              <SelectItem value="admin">Admins</SelectItem>
              <SelectItem value="user">Users</SelectItem>
            </SelectContent>
          </Select>
          <Select value={moduleFilter} onValueChange={setModuleFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="All Modules" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Modules</SelectItem>
              <SelectItem value="auth">Auth</SelectItem>
              <SelectItem value="financing">Financing</SelectItem>
              <SelectItem value="settings">Settings</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <DataTable columns={cols} data={logs} onRowClick={setDetail} />
      </SectionCard>

      <DetailModal
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        title={detail ? `Log ${detail.id}` : ""}
        description="Detail teknis aktivitas & perbandingan data."
        size="xl"
      >
        {detail ? (
          <>
            <KeyValueList
              items={[
                { label: "Timestamp", value: detail.at },
                { label: "Actor", value: detail.actor },
                { label: "Action", value: detail.action },
                { label: "Module", value: detail.module },
                { label: "IP Address", value: <span className="font-mono">{detail.ip}</span> },
                { label: "Location", value: detail.location },
                { label: "Status", value: <StatusBadge status={detail.status} /> },
                { label: "User-Agent", value: <span className="font-mono text-xs">{detail.userAgent}</span> },
              ]}
            />
            <SectionCard title="Data Diff (Old vs New)">
              <JsonDiffBlock oldData={detail.oldData} newData={detail.newData} />
            </SectionCard>
          </>
        ) : null}
      </DetailModal>
    </>
  );
}