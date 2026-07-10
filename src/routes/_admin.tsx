import { createFileRoute, Outlet } from "@tanstack/react-router";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/admin/AppSidebar";
import { Topbar } from "@/components/admin/Topbar";

export const Route = createFileRoute("/_admin")({
  component: AdminLayout,
});

function AdminLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset className="bg-background">
        <Topbar />
        <main className="flex-1 p-6 space-y-6">
          <Outlet />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}