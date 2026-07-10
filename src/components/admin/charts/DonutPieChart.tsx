import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from "recharts";

export type PieSlice = { name: string; value: number; color: string };

export function DonutPieChart({
  data,
  innerRadius = 55,
  centerText,
}: {
  data: PieSlice[];
  innerRadius?: number;
  centerText?: string;
}) {
  const total = data.reduce((a, b) => a + b.value, 0);

  return (
    <div className="relative w-full h-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={innerRadius}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
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
              `${v.toLocaleString("id-ID")} (${total > 0 ? ((v / total) * 100).toFixed(1) : 0}%)`,
              name,
            ]}
          />
          <Legend
            verticalAlign="bottom"
            iconType="circle"
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
        </PieChart>
      </ResponsiveContainer>
      {centerText && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none pb-7">
          <span className="text-xs font-semibold text-foreground text-center px-2 max-w-[100px] leading-tight">
            {centerText}
          </span>
        </div>
      )}
    </div>
  );
}
