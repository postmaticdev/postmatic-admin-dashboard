import type { ReactNode } from "react";

export function KeyValueList({
  items,
  columns = 2,
}: {
  items: Array<{ label: string; value: ReactNode }>;
  columns?: 1 | 2;
}) {
  return (
    <dl
      className={
        columns === 2
          ? "grid grid-cols-1 gap-x-6 gap-y-3 sm:grid-cols-2"
          : "space-y-3"
      }
    >
      {items.map((it) => (
        <div key={it.label} className="flex flex-col gap-0.5">
          <dt className="text-xs uppercase tracking-wide text-muted-foreground">
            {it.label}
          </dt>
          <dd className="text-sm font-medium text-foreground">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}