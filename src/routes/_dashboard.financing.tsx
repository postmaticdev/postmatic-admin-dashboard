import { useState, useMemo, useRef } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  Plus,
  Search,
  Calendar,
  ChevronDown,
  Pencil,
  X,
  Check,
  Filter,
  Wallet,
  BarChart3,
  Activity,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import * as XLSX from "xlsx";

export const Route = createFileRoute("/_dashboard/financing")({
  component: FinancingPage,
});

// ─── Types ─────────────────────────────────────────────────────────────────
type FilterPeriod = "daily" | "weekly" | "monthly" | "yearly";
type TxCategory = "Income" | "Expense";
type TxType = "manual" | "system";
type TxStatus = "Success" | "Pending" | "Failed";
type TxMethod = "GoPay" | "BCA VA" | "OVO" | "Transfer Bank" | "DANA" | "Stripe" | "Midtrans" | "Cash";

interface Transaction {
  id: string;
  datetime: string;
  txId: string;
  description: string;
  category: TxCategory;
  type: TxType;
  method: TxMethod;
  status: TxStatus;
  amount: number;
  user?: string;
}

// ─── Mock Data ──────────────────────────────────────────────────────────────
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: "1",  datetime: "2026-07-01 08:00", txId: "TRX-49210", description: "Payout Affiliate", category: "Expense", type: "system", method: "GoPay",        status: "Success", amount: -375000 },
  { id: "2",  datetime: "2026-07-02 10:07", txId: "TRX-49211", description: "Top up 200 Token", category: "Income",  type: "system", method: "BCA VA",       status: "Pending", amount:  375000 },
  { id: "3",  datetime: "2026-07-02 11:14", txId: "TRX-49212", description: "Top up 300 Token", category: "Income",  type: "system", method: "OVO",          status: "Failed",  amount:  375000 },
  { id: "4",  datetime: "2026-07-03 09:30", txId: "TRX-49213", description: "Subscription Plan Pro", category: "Income", type: "system", method: "Midtrans", status: "Success", amount: 1500000 },
  { id: "5",  datetime: "2026-07-04 14:00", txId: "TRX-49214", description: "Server Cost AWS",   category: "Expense", type: "manual", method: "Transfer Bank", status: "Success", amount: -2300000 },
  { id: "6",  datetime: "2026-07-05 08:45", txId: "TRX-49215", description: "Enterprise License",   category: "Income",  type: "system", method: "Stripe",   status: "Success", amount: 5000000 },
  { id: "7",  datetime: "2026-07-06 16:20", txId: "TRX-49216", description: "Refund Order #889",    category: "Expense", type: "manual", method: "GoPay",     status: "Success", amount: -250000 },
  { id: "8",  datetime: "2026-07-07 10:00", txId: "TRX-49217", description: "Subscription Basic",   category: "Income",  type: "system", method: "DANA",      status: "Success", amount: 499000 },
  { id: "9",  datetime: "2026-07-08 11:30", txId: "TRX-49218", description: "Office Rent Q3",       category: "Expense", type: "manual", method: "Transfer Bank", status: "Success", amount: -4500000 },
  { id: "10", datetime: "2026-07-09 09:15", txId: "TRX-49219", description: "Ads Revenue Google",   category: "Income",  type: "system", method: "Stripe",    status: "Success", amount: 750000 },
  { id: "11", datetime: "2026-07-10 14:30", txId: "TRX-49220", description: "Payout Reseller",      category: "Expense", type: "system", method: "GoPay",     status: "Pending", amount: -600000 },
  { id: "12", datetime: "2026-07-11 08:00", txId: "TRX-49221", description: "Top up 500 Token",     category: "Income",  type: "system", method: "BCA VA",    status: "Success", amount: 875000 },
  { id: "13", datetime: "2026-07-12 09:00", txId: "TRX-49222", description: "Subscription Enterprise", category: "Income", type: "system", method: "Midtrans", status: "Success", amount: 8000000 },
  { id: "14", datetime: "2026-07-13 10:00", txId: "TRX-49223", description: "Domain & Hosting Renew", category: "Expense", type: "manual", method: "Cash",   status: "Success", amount: -1200000 },
];

const MONTHLY_TREND = [
  { label: "Jan", revenue: 4500000, expense: 2100000 },
  { label: "Feb", revenue: 5200000, expense: 2400000 },
  { label: "Mar", revenue: 4800000, expense: 2200000 },
  { label: "Apr", revenue: 6100000, expense: 2800000 },
  { label: "May", revenue: 5900000, expense: 2500000 },
  { label: "Jun", revenue: 7200000, expense: 3100000 },
  { label: "Jul", revenue: 8400000, expense: 3500000 },
  { label: "Aug", revenue: 7800000, expense: 3200000 },
  { label: "Sep", revenue: 9200000, expense: 3900000 },
  { label: "Oct", revenue: 10100000, expense: 4300000 },
  { label: "Nov", revenue: 9500000, expense: 4000000 },
  { label: "Dec", revenue: 10725000, expense: 5375000 },
];

const WEEKLY_TREND = [
  { label: "Mg 1", revenue: 2100000, expense: 980000 },
  { label: "Mg 2", revenue: 2600000, expense: 1200000 },
  { label: "Mg 3", revenue: 2900000, expense: 1500000 },
  { label: "Mg 4", revenue: 3125000, expense: 1695000 },
];

const DAILY_TREND = Array.from({ length: 14 }, (_, i) => ({
  label: `${i + 1} Jul`,
  revenue: Math.floor(300000 + Math.random() * 900000),
  expense: Math.floor(100000 + Math.random() * 400000),
}));

const YEARLY_TREND = [
  { label: "2022", revenue: 45000000, expense: 22000000 },
  { label: "2023", revenue: 72000000, expense: 35000000 },
  { label: "2024", revenue: 98000000, expense: 48000000 },
  { label: "2025", revenue: 115000000, expense: 54000000 },
  { label: "2026", revenue: 125000000, expense: 64500000 },
];

const DONUT_COLORS = ["#22c55e", "#ef4444", "#2563eb"];

// ─── Helpers ─────────────────────────────────────────────────────────────────
const formatRp = (n: number) =>
  `${n < 0 ? "-" : ""}Rp ${Math.abs(n).toLocaleString("id-ID")}`;

const formatChartRp = (n: number) => {
  if (Math.abs(n) >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}jt`;
  if (Math.abs(n) >= 1_000) return `${(n / 1_000).toFixed(0)}rb`;
  return String(n);
};

// ─── Sub-components ──────────────────────────────────────────────────────────

function ScoreCard({
  label,
  value,
  delta,
  icon,
  color,
  deltaLabel,
}: {
  label: string;
  value: string;
  delta: number;
  icon: React.ReactNode;
  color: string;
  deltaLabel: string;
}) {
  const isUp = delta >= 0;
  return (
    <div className="bg-card border border-border rounded-2xl p-5 flex flex-col gap-3 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{label}</span>
        <div className={`p-2 rounded-xl ${color}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-semibold text-foreground tracking-tight">{value}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-bold ${isUp ? "bg-green-50 text-green-600" : "bg-red-50 text-red-600"}`}>
            {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
          <span className="text-xs text-muted-foreground">{deltaLabel}</span>
        </div>
      </div>
    </div>
  );
}

const STATUS_CONFIG: Record<TxStatus, { bg: string; text: string }> = {
  Success: { bg: "bg-green-50 text-green-700 border-green-200",  text: "Success" },
  Pending: { bg: "bg-yellow-50 text-yellow-700 border-yellow-200", text: "Pending" },
  Failed:  { bg: "bg-red-50 text-red-700 border-red-200",        text: "Failed" },
};
const CATEGORY_CONFIG: Record<TxCategory, { bg: string }> = {
  Income:  { bg: "bg-green-50 text-green-700 border-green-200" },
  Expense: { bg: "bg-red-50 text-red-700 border-red-200" },
};

const EMPTY_TX: Omit<Transaction, "id" | "txId"> = {
  datetime: new Date().toISOString().slice(0, 16).replace("T", " "),
  description: "",
  category: "Income",
  type: "manual",
  method: "Transfer Bank",
  status: "Pending",
  amount: 0,
  user: "Admin (hayhasan)",
};

// ─── Main Component ───────────────────────────────────────────────────────────
function FinancingPage() {
  const [period, setPeriod] = useState<FilterPeriod>("monthly");
  const [periodDropOpen, setPeriodDropOpen] = useState(false);
  const [dateFrom, setDateFrom] = useState("2026-07-01");
  const [dateTo, setDateTo] = useState("2026-07-13");
  const [showDateRange, setShowDateRange] = useState(false);
  const [chartPeriod, setChartPeriod] = useState<FilterPeriod>("monthly");
  const [chartDropOpen, setChartDropOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [txList, setTxList] = useState<Transaction[]>(MOCK_TRANSACTIONS);

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState<Transaction | null>(null);
  const [formData, setFormData] = useState<Omit<Transaction, "id" | "txId">>(EMPTY_TX);
  const [amountInput, setAmountInput] = useState("");
  const [selectedDetailTx, setSelectedDetailTx] = useState<Transaction | null>(null);

  // Helper formatting for rupiah input
  const formatNumberString = (val: number | string) => {
    const clean = String(val).replace(/\D/g, "");
    if (!clean) return "";
    return clean.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  // Chart data selection
  const trendData = useMemo(() => {
    if (chartPeriod === "daily") return DAILY_TREND;
    if (chartPeriod === "weekly") return WEEKLY_TREND;
    if (chartPeriod === "yearly") return YEARLY_TREND;
    return MONTHLY_TREND;
  }, [chartPeriod]);

  // Scorecard aggregations
  const totalRevenue = txList.filter(t => t.category === "Income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = Math.abs(txList.filter(t => t.category === "Expense").reduce((s, t) => s + t.amount, 0));
  const nettProfit = totalRevenue - totalExpense;

  // Donut data
  const donutData = [
    { name: "Revenue", value: totalRevenue },
    { name: "Expense", value: totalExpense },
    { name: "Nett Profit", value: Math.max(nettProfit, 0) },
  ];

  // Filtered transactions
  const filtered = useMemo(() => {
    return txList.filter(t => {
      const q = search.toLowerCase();
      return (
        t.description.toLowerCase().includes(q) ||
        t.txId.toLowerCase().includes(q) ||
        t.method.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.status.toLowerCase().includes(q)
      );
    });
  }, [txList, search]);

  // Excel Export
  const handleExport = () => {
    const rows = txList.map(t => ({
      "Date & Time": t.datetime,
      "Transaction ID": t.txId,
      "Description": t.description,
      "Category": t.category,
      "Type": t.type,
      "Method": t.method,
      "Status": t.status,
      "Amount": t.amount,
    }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Mutasi Transaksi");
    XLSX.writeFile(wb, `mutasi-transaksi-${dateFrom}-${dateTo}.xlsx`);
  };

  // Modal helpers
  const openCreate = () => {
    setEditingTx(null);
    setFormData(EMPTY_TX);
    setAmountInput("");
    setIsModalOpen(true);
  };
  const openEdit = (tx: Transaction) => {
    if (tx.type === "system") return; // Prevent system transactions from being edited
    setEditingTx(tx);
    setFormData({
      datetime: tx.datetime,
      description: tx.description,
      category: tx.category,
      type: tx.type,
      method: tx.method,
      status: tx.status,
      amount: tx.amount,
      user: tx.user || "Admin (hayhasan)",
    });
    setAmountInput(formatNumberString(Math.abs(tx.amount)));
    setIsModalOpen(true);
  };
  const handleSave = () => {
    const numericAmount = Number(amountInput.replace(/\./g, ""));
    const finalAmount = formData.category === "Expense" ? -Math.abs(numericAmount) : Math.abs(numericAmount);
    
    const updatedData = {
      ...formData,
      amount: finalAmount,
      status: editingTx ? formData.status : ("Success" as const),
      type: editingTx ? formData.type : ("manual" as const),
      user: formData.user?.trim() || (editingTx ? "System" : "Admin (hayhasan)"),
    };
    if (editingTx) {
      setTxList(prev => prev.map(t => t.id === editingTx.id ? { ...editingTx, ...updatedData } : t));
    } else {
      const newId = String(Date.now());
      const newTxId = `TRX-${49224 + txList.length}`;
      const newTx: Transaction = { id: newId, txId: newTxId, ...updatedData };
      setTxList(prev => [newTx, ...prev]);
    }
    setIsModalOpen(false);
  };
  const handleDelete = () => {
    if (editingTx) {
      setTxList(prev => prev.filter(t => t.id !== editingTx.id));
      setIsModalOpen(false);
    }
  };

  const PERIOD_LABELS: Record<FilterPeriod, string> = {
    daily: "Daily",
    weekly: "Weekly",
    monthly: "Monthly",
    yearly: "Yearly",
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background text-foreground">
      {/* ─── Sticky Header ───────────────────────────────────── */}
      <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border bg-card px-6 py-4 shrink-0">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Wallet className="h-5 w-5 text-primary" />
            Financing
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Ringkasan pendapatan, pengeluaran, dan mutasi transaksi.
          </p>
        </div>

        {/* Controls: Period filter + Date range + Export */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Period Dropdown */}
          <div className="relative">
            <button
              onClick={() => { setPeriodDropOpen(!periodDropOpen); setShowDateRange(false); }}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
            >
              <Activity className="h-3.5 w-3.5 text-primary" />
              {PERIOD_LABELS[period]}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </button>
            {periodDropOpen && (
              <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                {(["daily", "weekly", "monthly", "yearly"] as FilterPeriod[]).map(p => (
                  <button
                    key={p}
                    onClick={() => { setPeriod(p); setPeriodDropOpen(false); }}
                    className={`w-full text-left px-3 py-2 text-xs hover:bg-muted transition-colors capitalize ${period === p ? "text-primary font-semibold bg-primary/5" : "text-foreground"}`}
                  >
                    {PERIOD_LABELS[p]}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range */}
          <button
            onClick={() => { setShowDateRange(!showDateRange); setPeriodDropOpen(false); }}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
          >
            <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-muted-foreground">{dateFrom}</span>
            <span className="text-muted-foreground">—</span>
            <span className="text-muted-foreground">{dateTo}</span>
          </button>

          {/* Export */}
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-primary px-4 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[.98] transition-all"
          >
            <Download className="h-3.5 w-3.5" />
            Export
          </button>
        </div>
      </header>

      {/* Date range sub-bar */}
      {showDateRange && (
        <div className="flex items-center gap-3 border-b border-border bg-card px-6 py-2.5 shrink-0">
          <label className="text-xs font-semibold text-muted-foreground">Dari:</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <label className="text-xs font-semibold text-muted-foreground">Hingga:</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
            className="text-xs border border-border rounded-lg px-3 py-1.5 bg-background focus:outline-none focus:ring-2 focus:ring-primary/30" />
          <button onClick={() => setShowDateRange(false)} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <Check className="h-4 w-4 text-primary" />
          </button>
        </div>
      )}

      {/* ─── Scrollable Content Area ─────────────────────────── */}
      <div className="flex-1 overflow-auto p-6 space-y-6">
        {/* ─── Scorecard Row ────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ScoreCard
            label="Total Revenue"
            value={formatRp(totalRevenue)}
            delta={12.4}
            deltaLabel="periode ini"
            icon={<TrendingUp className="h-5 w-5 text-green-600" />}
            color="bg-green-50"
          />
          <ScoreCard
            label="Total Expense"
            value={formatRp(totalExpense)}
            delta={-4.2}
            deltaLabel="periode ini"
            icon={<TrendingDown className="h-5 w-5 text-red-500" />}
            color="bg-red-50"
          />
          <ScoreCard
            label="Nett Profit"
            value={formatRp(nettProfit)}
            delta={16.2}
            deltaLabel="revenue - expense"
            icon={<DollarSign className="h-5 w-5 text-blue-500" />}
            color="bg-blue-50"
          />
        </div>

        {/* ─── Charts Row ───────────────────────────────────── */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
          {/* Tren Revenue */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="font-bold text-foreground text-sm flex items-center gap-1.5">
                  <BarChart3 className="h-4 w-4 text-primary" />
                  Tren Revenue
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Pertumbuhan{" "}
                  {chartPeriod === "daily" ? "Harian" : chartPeriod === "weekly" ? "Mingguan" : chartPeriod === "monthly" ? "Bulanan" : "Tahunan"}
                </p>
              </div>
              {/* Chart period selector */}
              <div className="relative">
                <button
                  onClick={() => setChartDropOpen(!chartDropOpen)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-xs font-medium hover:bg-muted transition-colors"
                >
                  {PERIOD_LABELS[chartPeriod]}
                  <ChevronDown className="h-3 w-3 text-muted-foreground" />
                </button>
                {chartDropOpen && (
                  <div className="absolute right-0 mt-1 w-36 bg-card border border-border rounded-lg shadow-lg z-20 overflow-hidden">
                    {(["daily", "weekly", "monthly", "yearly"] as FilterPeriod[]).map(p => (
                      <button
                        key={p}
                        onClick={() => { setChartPeriod(p); setChartDropOpen(false); }}
                        className={`w-full text-left px-3 py-2 text-xs hover:bg-muted capitalize ${chartPeriod === p ? "text-primary font-semibold bg-primary/5" : "text-foreground"}`}
                      >
                        {PERIOD_LABELS[p]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <ResponsiveContainer width="100%" height={240}>
              <LineChart data={trendData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.929 0.013 255.508)" strokeOpacity={0.6} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257.417)" }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={formatChartRp}
                  tick={{ fontSize: 11, fill: "oklch(0.554 0.046 257.417)" }}
                  axisLine={false}
                  tickLine={false}
                  width={55}
                />
                <Tooltip
                  contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: 12 }}
                  formatter={(val: number) => [formatRp(val), ""]}
                />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#22c55e"
                  strokeWidth={2.5}
                  dot={{ r: 4, fill: "#22c55e", strokeWidth: 0 }}
                  activeDot={{ r: 6 }}
                  name="Revenue"
                />
                <Line
                  type="monotone"
                  dataKey="expense"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#ef4444", strokeWidth: 0 }}
                  activeDot={{ r: 5 }}
                  strokeDasharray="4 3"
                  name="Expense"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Proporsi Keuangan – Donut */}
          <div className="bg-card border border-border rounded-lg shadow-sm p-5 flex flex-col">
            <div className="mb-2">
              <h2 className="font-bold text-foreground text-sm">Proporsi Keuangan</h2>
              <p className="text-xs text-muted-foreground mt-0.5">Revenue, Expense, & Nett Profit</p>
            </div>
            <div className="flex-1 flex flex-col items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={donutData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {donutData.map((_, i) => (
                      <Cell key={i} fill={DONUT_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "10px", fontSize: 12 }}
                    formatter={(val: number) => [formatRp(val), ""]}
                  />
                </PieChart>
              </ResponsiveContainer>
              {/* Legend */}
              <div className="flex items-center justify-center gap-4 mt-2">
                {donutData.map((d, i) => (
                  <div key={d.name} className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full shrink-0" style={{ background: DONUT_COLORS[i] }} />
                    <span className="text-xs text-muted-foreground font-medium">{d.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* ─── Transaction Table ────────────────────────────── */}
        <div className="rounded-lg border border-border bg-card shadow-sm overflow-hidden">
          {/* Table toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border px-6 py-3.5">
            <div>
              <h2 className="font-semibold text-foreground flex items-center gap-1.5 text-sm">
                <Filter className="h-4 w-4 text-primary" />
                Mutasi Transaksi
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} transaksi tersedia</p>
            </div>
            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Cari transaksi..."
                  className="pl-9 pr-4 h-9 text-xs border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 w-52"
                />
              </div>
              {/* Add */}
              <button
                onClick={openCreate}
                className="inline-flex items-center gap-1.5 h-9 rounded-lg bg-primary px-3.5 text-xs font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 active:scale-[.98] transition-all whitespace-nowrap"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Transaksi
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted/30 text-xs font-semibold text-muted-foreground uppercase">
                  {["Date & Time", "Transaction ID", "Description", "Category", "Type", "Method", "Amount", "Status", ""].map((col, i) => (
                    <th
                      key={i}
                      className={`px-6 py-3.5 whitespace-nowrap tracking-wide ${col === "Amount" ? "text-right" : ""}`}
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-12 text-muted-foreground text-sm">
                      Tidak ada transaksi ditemukan.
                    </td>
                  </tr>
                )}
                {filtered.map(tx => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedDetailTx(tx)}
                    className="hover:bg-muted/45 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 text-xs text-muted-foreground whitespace-nowrap font-mono">{tx.datetime}</td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-mono text-primary font-semibold">{tx.txId}</span>
                    </td>
                    <td className="px-6 py-4 max-w-[200px]">
                      <span className="text-sm text-foreground font-medium line-clamp-1">{tx.description}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${CATEGORY_CONFIG[tx.category].bg}`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${tx.type === "manual" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground whitespace-nowrap">{tx.method}</td>
                    <td className={`px-6 py-4 font-bold text-right whitespace-nowrap tabular-nums text-sm ${tx.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                      {tx.amount >= 0 ? "+" : ""}
                      {formatRp(tx.amount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold border ${STATUS_CONFIG[tx.status].bg}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {tx.type !== "system" ? (
                        <button
                          onClick={() => openEdit(tx)}
                          className="p-1.5 rounded-md hover:bg-muted text-muted-foreground hover:text-primary transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      ) : (
                        <span className="text-xs text-muted-foreground/60 italic px-1.5 select-none">System</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ─── Modal: Add / Edit Transaction ─────────────────── */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setIsModalOpen(false)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <h3 className="font-bold text-foreground text-base">
                {editingTx ? "Edit Transaksi" : "Tambah Transaksi Baru"}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={formData.datetime.replace(" ", "T")}
                    onChange={e => setFormData(p => ({ ...p, datetime: e.target.value.replace("T", " ") }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">Deskripsi</label>
                  <input
                    type="text"
                    placeholder="Mis: Top up 200 Token"
                    value={formData.description}
                    onChange={e => setFormData(p => ({ ...p, description: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Category</label>
                    <select
                      value={formData.category}
                      onChange={e => setFormData(p => ({ ...p, category: e.target.value as TxCategory }))}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="Income">Income (Pemasukan)</option>
                      <option value="Expense">Expense (Pengeluaran)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-foreground mb-1.5 block">Method</label>
                    <select
                      value={formData.method}
                      onChange={e => setFormData(p => ({ ...p, method: e.target.value as TxMethod }))}
                      className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {(["GoPay","BCA VA","OVO","Transfer Bank","DANA","Stripe","Midtrans","Cash"] as TxMethod[]).map(m => (
                        <option key={m} value={m}>{m}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">User / Operator</label>
                  <input
                    type="text"
                    placeholder="Nama operator input..."
                    value={formData.user || ""}
                    onChange={e => setFormData(p => ({ ...p, user: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground mb-1.5 block">
                    Amount (Rp)
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-sm font-semibold text-muted-foreground select-none">Rp</span>
                    <input
                      type="text"
                      placeholder="0"
                      value={amountInput}
                      onChange={e => setAmountInput(formatNumberString(e.target.value))}
                      className="w-full pl-9 pr-3 py-2 text-sm border border-border rounded-lg bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono font-bold"
                    />
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 block">
                    Contoh format: 10.000, 150.000, 2.500.000
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-muted/20">
              <div>
                {editingTx && (
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-sm active:scale-[.98] transition-all"
                  >
                    Hapus Transaksi
                  </button>
                )}
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg border border-border text-sm font-medium text-foreground hover:bg-muted transition-colors">
                  Batal
                </button>
                <button
                  onClick={handleSave}
                  disabled={!formData.description.trim() || !amountInput}
                  className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[.98] transition-all"
                >
                  {editingTx ? "Simpan Perubahan" : "Tambah Transaksi"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── Modal: Detail Transaksi ──────────────────────── */}
      {selectedDetailTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedDetailTx(null)} />
          <div className="relative bg-card border border-border rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <Wallet className="h-4.5 w-4.5 text-primary" />
                <h3 className="font-bold text-foreground text-base">Detail Transaksi</h3>
              </div>
              <button onClick={() => setSelectedDetailTx(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Body */}
            <div className="px-6 py-5 space-y-4">
              <div className="space-y-3.5">
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">Transaction ID</span>
                  <span className="text-xs font-mono text-primary font-bold">{selectedDetailTx.txId}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">Date & Time</span>
                  <span className="text-xs font-mono text-foreground font-medium">{selectedDetailTx.datetime}</span>
                </div>
                <div className="flex flex-col gap-1 border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">Deskripsi</span>
                  <span className="text-sm font-semibold text-foreground leading-relaxed">{selectedDetailTx.description}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">User / Operator</span>
                  <span className="text-xs font-semibold text-foreground">
                    {selectedDetailTx.user || (selectedDetailTx.type === "system" ? "System" : "Admin (hayhasan)")}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">Category</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${CATEGORY_CONFIG[selectedDetailTx.category].bg}`}>
                    {selectedDetailTx.category}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">Type</span>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium border ${selectedDetailTx.type === "manual" ? "bg-purple-50 text-purple-700 border-purple-200" : "bg-sky-50 text-sky-700 border-sky-200"}`}>
                    {selectedDetailTx.type}
                  </span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">Method</span>
                  <span className="text-xs font-semibold text-foreground">{selectedDetailTx.method}</span>
                </div>
                <div className="flex justify-between border-b border-border/50 pb-2">
                  <span className="text-xs text-muted-foreground font-medium">Status</span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${STATUS_CONFIG[selectedDetailTx.status].bg}`}>
                    {selectedDetailTx.status}
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-xs text-muted-foreground font-medium">Amount (Rp)</span>
                  <span className={`text-base font-extrabold tabular-nums ${selectedDetailTx.amount >= 0 ? "text-green-600" : "text-red-500"}`}>
                    {selectedDetailTx.amount >= 0 ? "+" : ""}
                    {formatRp(selectedDetailTx.amount)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end px-6 py-3.5 border-t border-border bg-muted/20">
              <button
                onClick={() => setSelectedDetailTx(null)}
                className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors shadow-xs"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
