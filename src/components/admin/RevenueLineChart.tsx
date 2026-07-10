import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { revenueSeries } from "@/lib/mock/data";

const fmt = (v: number) => v.toLocaleString("id-ID");

export function RevenueLineChart() {
  const chartData = revenueSeries.map((item) => ({
    ...item,
    nett: item.revenue - item.expense,
  }));

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <YAxis
            tickFormatter={fmt}
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={12}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number, name: string) => [
              `Rp ${v.toLocaleString("id-ID")}`,
              name === "revenue" ? "Revenue" : name === "nett" ? "Nett Profit" : "Expense",
            ]}
          />
          <Legend
            verticalAlign="top"
            height={36}
            iconType="circle"
            wrapperStyle={{ fontSize: 12 }}
          />
          <Line
            name="Revenue"
            type="monotone"
            dataKey="revenue"
            stroke="var(--primary)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--primary)" }}
            activeDot={{ r: 5 }}
          />
          <Line
            name="Nett Profit"
            type="monotone"
            dataKey="nett"
            stroke="#f97316"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "#f97316" }}
            activeDot={{ r: 5 }}
          />
          <Line
            name="Expense"
            type="monotone"
            dataKey="expense"
            stroke="var(--destructive)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: "var(--destructive)" }}
            activeDot={{ r: 5 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}