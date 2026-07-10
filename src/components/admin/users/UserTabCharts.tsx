import { ChartCard } from "@/components/admin/charts/ChartCard";
import { DonutPieChart } from "@/components/admin/charts/DonutPieChart";
import { SimpleLineChart } from "@/components/admin/charts/SimpleLineChart";
import { userGrowthSeries, users } from "@/lib/mock/data";

export function UserTabCharts() {
  const total = users.length;
  const active = users.filter((u) => u.status === "Active").length;
  const inactive = total - active;

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Proporsi User" description="Total User vs Total User Active">
        <DonutPieChart
          centerText="Proporsi User"
          data={[
            { name: "Active", value: active, color: "var(--success)" },
            { name: "Inactive", value: inactive, color: "var(--muted-foreground)" },
          ]}
        />
      </ChartCard>
      <ChartCard title="Total User Growth" description="Pertumbuhan user per bulan">
        <SimpleLineChart
          data={userGrowthSeries}
          series={[{ dataKey: "total", label: "Total User", color: "var(--primary)" }]}
          valueFormatter={(v) => v.toLocaleString("id-ID")}
        />
      </ChartCard>
    </div>
  );
}
