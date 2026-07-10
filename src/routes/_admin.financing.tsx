import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Download, Plus, TrendingDown, TrendingUp, Wallet, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/admin/PageHeader";
import { Scorecard, ScorecardGrid } from "@/components/admin/Scorecard";
import { SectionCard } from "@/components/admin/SectionCard";
import { FinancingCharts } from "@/components/admin/financing/FinancingCharts";
import { DataTable, type Column } from "@/components/admin/DataTable";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { ActionMenu } from "@/components/admin/ActionMenu";
import { DetailModal } from "@/components/admin/DetailModal";
import { KeyValueList } from "@/components/admin/KeyValueList";
import { GlobalFilter } from "@/components/admin/GlobalFilter";
import { SearchBar } from "@/components/admin/SearchBar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { transactions } from "@/lib/mock/data";
import type { TransactionRow } from "@/lib/mock/types";
import { formatRp } from "@/components/admin/utils";

export const Route = createFileRoute("/_admin/financing")({
  head: () => ({
    meta: [
      { title: "Financing — Postmatic Admin" },
      { name: "description", content: "Pantau seluruh mutasi transaksi Postmatic." },
    ],
  }),
  component: FinancingPage,
});

function FinancingPage() {
  const [detail, setDetail] = useState<TransactionRow | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [search, setSearch] = useState("");

  const income = transactions.filter((t) => t.type === "Income").reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter((t) => t.type === "Expense").reduce((a, b) => a + Math.abs(b.amount), 0);
  const nett = income - expense;

  const cols: Column<TransactionRow>[] = [
    { key: "dt", header: "Date & Time", render: (r) => <span className="text-muted-foreground">{r.datetime}</span> },
    { key: "id", header: "Transaction ID", render: (r) => <span className="font-mono text-xs">{r.id}</span> },
    { key: "desc", header: "Description", render: (r) => r.description },
    { key: "t", header: "Type", render: (r) => <StatusBadge status={r.type} /> },
    { key: "m", header: "Method", render: (r) => r.method },
    {
      key: "amt",
      header: "Amount",
      align: "right",
      render: (r) => (
        <span className={`font-semibold ${r.type === "Income" ? "text-success" : "text-destructive"}`}>
          {r.type === "Income" ? "+" : "−"}
          {formatRp(Math.abs(r.amount))}
        </span>
      ),
    },
    { key: "s", header: "Status", render: (r) => <StatusBadge status={r.status} /> },
    { key: "a", header: "Action", align: "right", render: (r) => <ActionMenu onEdit={() => setDetail(r)} /> },
  ];

  return (
    <>
      <PageHeader
        title="Financing"
        description="Ringkasan pendapatan, pengeluaran, dan mutasi transaksi."
        actions={
          <div className="flex items-center gap-3">
            <GlobalFilter />
            <Button variant="outline" className="gap-2">
              <Download className="h-4 w-4" /> Export
            </Button>
          </div>
        }
      />

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New Transaction</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-1.5">
              <Label>Date</Label>
              <Input type="datetime-local" />
            </div>
            <div className="grid gap-1.5">
              <Label>Description</Label>
              <Textarea placeholder="Contoh: Top up 500 Token oleh USR-1012" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Type</Label>
                <Select defaultValue="income">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="income">Income</SelectItem>
                    <SelectItem value="expense">Expense</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Amount (IDR)</Label>
                <Input type="number" placeholder="500.000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Payment Method</Label>
                <Select defaultValue="gopay">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gopay">GoPay</SelectItem>
                    <SelectItem value="bca">BCA VA</SelectItem>
                    <SelectItem value="ovo">OVO</SelectItem>
                    <SelectItem value="manual">Manual Transfer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-1.5">
                <Label>Status</Label>
                <Select defaultValue="success">
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="success">Success</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="failed">Failed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddOpen(false)}>Batal</Button>
            <Button onClick={() => setAddOpen(false)}>Simpan Transaksi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Scorecard label="Total Revenue" value={formatRp(income)} icon={TrendingUp} tone="success" delta={12.4} hint="periode ini" />
        <Scorecard label="Total Expense" value={formatRp(expense)} icon={TrendingDown} tone="warning" delta={4.8} hint="periode ini" />
        <Scorecard label="Nett Profit" value={formatRp(nett)} icon={Wallet} tone="primary" delta={16.2} hint="revenue − expense" />
      </div>

      <div className="mb-4">
        <FinancingCharts />
      </div>

      <SectionCard title="Mutasi Transaksi" description={`${transactions.length.toLocaleString("id-ID")} transaksi tercatat.`}>
        <div className="mb-4 flex w-full gap-3">
          <SearchBar className="max-w-full flex-1" placeholder="Search transaction..." value={search} onChange={setSearch} />
          <Button onClick={() => setAddOpen(true)} className="gap-2 shrink-0">
            <Plus className="h-4 w-4" /> Add New Transaction
          </Button>
        </div>
        <DataTable columns={cols} data={transactions} onRowClick={setDetail} />
      </SectionCard>

      <DetailModal
        open={!!detail}
        onOpenChange={(v) => !v && setDetail(null)}
        title={detail ? `Invoice ${detail.id}` : ""}
        description="Ringkasan resi transaksi & audit trail."
        footer={
          detail ? (
            <div className="flex justify-between w-full">
              <Button variant="destructive" onClick={() => setDetail(null)} className="gap-2">
                <Trash2 className="h-4 w-4" /> Delete Transaction
              </Button>
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setDetail(null)}>Tutup</Button>
                <Button onClick={() => setDetail(null)}>Simpan Perubahan</Button>
              </div>
            </div>
          ) : null
        }
      >
        {detail ? (
          <>
            <KeyValueList
              items={[
                { label: "No. Transaksi", value: <span className="font-mono">{detail.id}</span> },
                { label: "Tanggal & Jam", value: detail.datetime },
                { label: "Type", value: <StatusBadge status={detail.type} /> },
                {
                  label: "Nominal",
                  value: (
                    <span className={detail.type === "Income" ? "text-success" : "text-destructive"}>
                      {detail.type === "Income" ? "+" : "−"}{formatRp(Math.abs(detail.amount))}
                    </span>
                  ),
                },
                { label: "Payment Method", value: detail.method },
                { label: "Status", value: <StatusBadge status={detail.status} /> },
                { label: "User", value: `${detail.userName} · ${detail.userId}` },
                { label: "Description", value: detail.description },
              ]}
            />
            <SectionCard title="Audit Log Perubahan Status">
              <ol className="relative border-l ml-2 space-y-4">
                {detail.auditTrail.map((a, i) => (
                  <li key={i} className="ml-4">
                    <span className="absolute -left-1.5 h-3 w-3 rounded-full bg-primary" />
                    <p className="text-sm font-medium">
                      Status: <span className="text-muted-foreground">{a.from}</span> → <span className="text-success">{a.to}</span>
                    </p>
                    <p className="text-xs text-muted-foreground">{a.at} · oleh {a.by}</p>
                  </li>
                ))}
              </ol>
            </SectionCard>
          </>
        ) : null}
      </DetailModal>
    </>
  );
}