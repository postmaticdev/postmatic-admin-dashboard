import { useState } from "react";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { AppHeader } from "@/components/layout/AppHeader";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { TicketsProvider } from "@/contexts/TicketsContext";

export const Route = createFileRoute("/_dashboard")({
  component: DashboardLayout,
});

function DashboardLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <ThemeProvider>
      <TicketsProvider>
        <div className="flex h-screen w-full flex-col bg-background text-foreground">
          <AppHeader collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} />
          <div className="flex min-h-0 flex-1">
            <AppSidebar collapsed={collapsed} />
            <main className="min-w-0 flex-1 overflow-hidden">
              <Outlet />
            </main>
          </div>
        </div>
      </TicketsProvider>
    </ThemeProvider>
  );
}

