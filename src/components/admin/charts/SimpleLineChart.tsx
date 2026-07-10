import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const fmt = (v: number) => v.toLocaleString("id-ID");

export type LineSeries = {
  dataKey: string;
  label: string;
  color: string;
  strokeWidth?: number;
};

export function SimpleLineChart({
  data,
  xKey = "label",
  series,
  valueFormatter,
}: {
  data: Record<string, string | number>[];
  xKey?: string;
  series: LineSeries[];
  valueFormatter?: (v: number) => string;
}) {
  const fmtVal = valueFormatter ?? ((v: number) => `Rp ${v.toLocaleString("id-ID")}`);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis
          dataKey={xKey}
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
          formatter={(v: number, name: string) => [fmtVal(v), name]}
        />
        {series.map((s) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.label}
            stroke={s.color}
            strokeWidth={s.strokeWidth ?? 2.5}
            dot={{ r: 3, fill: s.color }}
            activeDot={{ r: 5 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
