import { ChartCard } from "@/components/admin/charts/ChartCard";
import { DonutPieChart } from "@/components/admin/charts/DonutPieChart";
import { SectionCard } from "@/components/admin/SectionCard";
import { UserCell } from "@/components/admin/UserCell";
import { admins } from "@/lib/mock/data";

export function AdminTabCharts() {
  const superAdmin = admins.filter((a) => a.role === "Super Admin").length;
  const regularAdmin = admins.length - superAdmin;
  const recentLogins = [...admins]
    .filter((a) => a.status === "Active")
    .sort((a, b) => b.lastLogin.localeCompare(a.lastLogin))
    .slice(0, 5);

  return (
    <div className="mb-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
      <ChartCard title="Proporsi Admin" description="Super Admin vs Admin">
        <DonutPieChart
          centerText="Proporsi Admin"
          data={[
            { name: "Super Admin", value: superAdmin, color: "var(--primary)" },
            { name: "Admin", value: regularAdmin, color: "var(--chart-2)" },
          ]}
        />
      </ChartCard>
      <div className="lg:col-span-2">
        <SectionCard title="Last Admin Login" description="Admin yang baru saja login">
          <ul className="divide-y">
            {recentLogins.map((a) => (
              <li key={a.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <UserCell name={a.name} email={a.role} avatar={a.avatar} />
                <div className="text-right">
                  <p className="text-xs font-medium text-foreground">{a.lastLogin}</p>
                  <p className="text-[10px] text-muted-foreground">{a.devices[0]?.device}</p>
                </div>
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    </div>
  );
}
