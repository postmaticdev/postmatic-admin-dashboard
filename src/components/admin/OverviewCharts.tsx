import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { aiModels } from "@/lib/mock/data";

const COLORS = ["#6366f1", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6"];

export function AiModelChart() {
  // Sort models by requests and get top 5
  const data = [...aiModels]
    .sort((a, b) => b.requests - a.requests)
    .slice(0, 5)
    .map((m) => ({
      name: m.name,
      requests: m.requests,
      provider: m.provider,
    }));

  const formatNumber = (v: number) => {
    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
    return v.toString();
  };

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <defs>
            <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity={0.9} />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity={0.4} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis
            dataKey="name"
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={11}
          />
          <YAxis
            tickFormatter={formatNumber}
            tickLine={false}
            axisLine={false}
            stroke="var(--muted-foreground)"
            fontSize={11}
          />
          <Tooltip
            contentStyle={{
              background: "var(--card)",
              border: "1px solid var(--border)",
              borderRadius: 8,
              fontSize: 12,
            }}
            formatter={(v: number) => [`${v.toLocaleString("id-ID")} Requests`, "Total Usage"]}
          />
          <Bar
            dataKey="requests"
            fill="url(#barGradient)"
            radius={[4, 4, 0, 0]}
            maxBarSize={45}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function PlatformPieChart() {
  const data = [
    { name: "WhatsApp", value: 342, count: 185200 },
    { name: "Gmail", value: 184, count: 98400 },
  ];

  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <div className="h-72 w-full flex flex-col justify-between">
      <div className="h-56 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={5}
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: 8,
                fontSize: 12,
              }}
              formatter={(v: number, name: string) => [
                `${v} Campaigns (${((v / total) * 100).toFixed(1)}%)`,
                name,
              ]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 gap-4 text-center mt-2 px-2">
        {data.map((item, index) => (
          <div key={item.name} className="flex flex-col items-center">
            <div className="flex items-center gap-1.5">
              <span
                className="h-2.5 w-2.5 rounded-full shrink-0"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs font-medium text-muted-foreground">{item.name}</span>
            </div>
            <span className="text-sm font-bold text-foreground mt-0.5">
              {item.value} Blast
            </span>
            <span className="text-[10px] text-muted-foreground font-mono">
              ({(item.count / 1000).toFixed(1)}K Recipient)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
