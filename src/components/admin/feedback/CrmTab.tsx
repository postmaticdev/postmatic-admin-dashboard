import { useState } from "react";
import { Plus } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";
import { SectionCard } from "@/components/admin/SectionCard";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { Button } from "@/components/ui/button";
import { campaigns } from "@/lib/mock/data";
import type { CampaignRow } from "@/lib/mock/types";
import { SearchBar } from "@/components/admin/SearchBar";

export function CrmTab() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");

  const cols: Column<CampaignRow>[] = [
    { key: "name", header: "Campaign Name", render: (r) => <span className="font-medium">{r.name}</span> },
    { key: "platform", header: "Platform", render: (r) => <StatusBadge status={r.platform === "WhatsApp" ? "Chat" : "Email"} /> },
    { key: "target", header: "Target Audience", render: (r) => <span className="text-muted-foreground">{r.targetAudience}</span> },
    { key: "status", header: "Status", render: (r) => <StatusBadge status={r.status === "Sent" ? "Success" : r.status === "Draft" ? "Pending" : "Active"} /> },
    { key: "date", header: "Date", render: (r) => <span className="text-muted-foreground">{r.date}</span> },
    { key: "a", header: "Action", align: "right", render: () => <ActionMenu onEdit={() => {}} /> },
  ];

  return (
    <>
      <SectionCard title="Campaign History" description={`${campaigns.length.toLocaleString("id-ID")} kampanye tercatat.`}>
        <div className="mb-4 flex w-full gap-3">
          <SearchBar className="max-w-full flex-1" placeholder="Search campaigns..." value={search} onChange={setSearch} />
          <Button className="gap-2 shrink-0" onClick={() => navigate({ to: "/blast" })}>
            <Plus className="h-4 w-4" /> Create New Blast
          </Button>
        </div>
        <DataTable columns={cols} data={campaigns} />
      </SectionCard>

    </>
  );
}
