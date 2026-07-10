import { ChartCard } from "@/components/admin/charts/ChartCard";
import { DonutPieChart } from "@/components/admin/charts/DonutPieChart";
import { MultiLineChart } from "@/components/admin/charts/MultiLineChart";
import { businessGrowthSeries, businesses } from "@/lib/mock/data";

export function BusinessTabCharts() {
  const total = businesses.length;
  const paid = businesses.filter((b) => b.plan !== "Free").length;
  const activeUsers = businesses.reduce((sum, b) => sum + b.activeUsers, 0);

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-2">
      <ChartCard title="Proporsi Business" description="Total Business, Paid, & Active User">
        <DonutPieChart
          centerText="Proporsi Business"
          data={[
            { name: "Total Business", value: total, color: "var(--primary)" },
            { name: "Paid Business", value: paid, color: "var(--success)" },
            { name: "Active Users", value: activeUsers, color: "var(--chart-3)" },
          ]}
        />
      </ChartCard>
      <ChartCard title="Business Growth" description="Paid vs Free business growth">
        <MultiLineChart
          data={businessGrowthSeries}
          series={[
            { dataKey: "paid", label: "Paid Business", color: "var(--success)" },
            { dataKey: "free", label: "Free Business", color: "var(--muted-foreground)" },
          ]}
        />
      </ChartCard>
    </div>
  );
}
