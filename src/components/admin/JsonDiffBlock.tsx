export function JsonDiffBlock({
  oldData,
  newData,
}: {
  oldData: Record<string, unknown> | null;
  newData: Record<string, unknown> | null;
}) {
  const render = (d: Record<string, unknown> | null) =>
    d ? JSON.stringify(d, null, 2) : "// (kosong)";
  return (
    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
      <div className="rounded-lg border bg-destructive/5">
        <div className="border-b px-3 py-2 text-xs font-semibold uppercase text-destructive">
          Old Data
        </div>
        <pre className="max-h-64 overflow-auto p-3 text-xs font-mono text-foreground">
{render(oldData)}
        </pre>
      </div>
      <div className="rounded-lg border bg-success/5">
        <div className="border-b px-3 py-2 text-xs font-semibold uppercase text-success">
          New Data
        </div>
        <pre className="max-h-64 overflow-auto p-3 text-xs font-mono text-foreground">
{render(newData)}
        </pre>
      </div>
    </div>
  );
}