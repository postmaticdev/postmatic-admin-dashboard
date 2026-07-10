import { SimpleLineChart, type LineSeries } from "./SimpleLineChart";

export function MultiLineChart({
  data,
  series,
  xKey = "label",
}: {
  data: Record<string, string | number>[];
  series: LineSeries[];
  xKey?: string;
}) {
  return (
    <SimpleLineChart
      data={data}
      xKey={xKey}
      series={series}
      valueFormatter={(v) => v.toLocaleString("id-ID")}
    />
  );
}
