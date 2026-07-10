import { ChartCard } from "@/components/admin/charts/ChartCard";
import { DonutPieChart } from "@/components/admin/charts/DonutPieChart";
import { SimpleLineChart } from "@/components/admin/charts/SimpleLineChart";
import { ChartFilter } from "@/components/admin/ChartFilter";
import { revenueSeries, transactions } from "@/lib/mock/data";

export function FinancingCharts() {
  const income = transactions.filter((t) => t.type === "Income").reduce((a, b) => a + b.amount, 0);
  const expense = transactions.filter((t) => t.type === "Expense").reduce((a, b) => a + Math.abs(b.amount), 0);
  const nett = income - expense;

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard 
        title="Tren Revenue" 
        description="Pendapatan bulanan"
        action={<ChartFilter />}
      >
        <SimpleLineChart
          data={revenueSeries}
          series={[{ dataKey: "revenue", label: "Revenue", color: "var(--success)" }]}
        />
      </ChartCard>
      <ChartCard 
        title="Proporsi Keuangan" 
        description="Revenue, Expense, & Nett Profit"
        action={<ChartFilter />}
      >
        <DonutPieChart
          centerText="Proporsi Keuangan"
          data={[
            { name: "Revenue", value: income, color: "var(--success)" },
            { name: "Expense", value: expense, color: "var(--destructive)" },
            { name: "Nett Profit", value: Math.max(nett, 0), color: "var(--primary)" },
          ]}
        />
      </ChartCard>
    </div>
  );
}
