import type { ReactNode } from "react";
import { SectionCard } from "@/components/admin/SectionCard";

export function ChartCard({
  title,
  description,
  action,
  children,
  className,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <SectionCard title={title} description={description} action={action}>
      <div className={className ?? "h-64 w-full"}>{children}</div>
    </SectionCard>
  );
}
