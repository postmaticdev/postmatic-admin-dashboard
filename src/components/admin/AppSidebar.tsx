import { useState, useRef, useEffect } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  Bot,
  LayoutDashboard,
  LogOut,
  MessagesSquare,
  ScrollText,
  Settings,
  ShieldCheck,
  Users,
  ChevronUp,
  Briefcase,
  BookOpen,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

const items = [
  { title: "Overview", url: "/dashboard", icon: LayoutDashboard, group: "Utama" },
  { title: "User Management", url: "/users", icon: Users, group: "Utama" },
  { title: "Workspace Management", url: "/workspace", icon: Briefcase, group: "Utama" },
  { title: "Financing", url: "/financing", icon: BarChart3, group: "Utama" },
  { title: "Feedback & Report", url: "/feedback", icon: MessagesSquare, group: "Layanan" },
  { title: "Docs Management", url: "/docs-management", icon: BookOpen, group: "Layanan" },
  { title: "Role Management", url: "/roles", icon: ShieldCheck, group: "Sistem" },
  { title: "Log Activity", url: "/logs", icon: ScrollText, group: "Sistem" },
];

export function AppSidebar() {
  const pathname = useRouterState({ select: (r) => r.location.pathname });
  const groups = ["Utama", "Layanan", "Sistem"] as const;
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleOutside(e: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, []);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b">
        <div className="flex items-center gap-2 px-2 py-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
            P
          </div>
          <div className="flex flex-col group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold text-foreground">Postmatic</span>
            <span className="text-xs text-muted-foreground">Admin Panel</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g}>
            <SidebarGroupLabel>{g}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {items
                  .filter((i) => i.group === g)
                  .map((item) => {
                    const active = pathname === item.url || pathname.startsWith(item.url + "/");
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild isActive={active} tooltip={item.title}>
                          <Link to={item.url}>
                            <item.icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter className="border-t">
        <div ref={profileRef} className="relative">
          {/* Profile Dropdown Menu */}
          {profileMenuOpen && (
            <div
              className="absolute bottom-full left-0 right-0 mb-1 overflow-hidden rounded-xl border border-border/60 bg-card shadow-2xl shadow-black/20"
              style={{ animation: "slideUp 0.18s cubic-bezier(0.34,1.56,0.64,1) both" }}
            >
              <div className="p-1.5 group-data-[collapsible=icon]:p-1">
                <Link
                  to="/settings"
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-foreground hover:bg-muted/60 transition-colors group"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-muted/60 group-hover:bg-primary/10 transition-colors">
                    <Settings className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
                  </span>
                  <span className="font-medium group-data-[collapsible=icon]:hidden">Settings</span>
                </Link>
                <div className="my-1 border-t border-border/40" />
                <button
                  onClick={() => setProfileMenuOpen(false)}
                  className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-rose-500 hover:bg-rose-500/8 transition-colors group"
                >
                  <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-lg bg-rose-500/10 group-hover:bg-rose-500/20 transition-colors">
                    <LogOut className="h-3.5 w-3.5 text-rose-500" />
                  </span>
                  <span className="font-medium group-data-[collapsible=icon]:hidden">Logout</span>
                </button>
              </div>
            </div>
          )}

          {/* Profile Button */}
          <button
            onClick={() => setProfileMenuOpen((p) => !p)}
            className="flex w-full items-center gap-2 rounded-lg px-2 py-2 hover:bg-muted/60 transition-colors group-data-[collapsible=icon]:justify-center"
          >
            <img
              src="https://api.dicebear.com/7.x/notionists/svg?seed=Andini%20Prameswari"
              alt="Andini"
              className="h-8 w-8 rounded-full bg-muted flex-shrink-0"
            />
            <div className="flex flex-1 flex-col text-xs text-left group-data-[collapsible=icon]:hidden">
              <span className="font-medium text-foreground">Andini Prameswari</span>
              <span className="text-muted-foreground">Super Admin</span>
            </div>
            <ChevronUp
              className={`h-4 w-4 text-muted-foreground transition-transform group-data-[collapsible=icon]:hidden ${profileMenuOpen ? "rotate-180" : ""}`}
            />
          </button>
        </div>

        <style>{`
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(8px) scale(0.96); }
            to   { opacity: 1; transform: translateY(0)   scale(1); }
          }
        `}</style>
      </SidebarFooter>
    </Sidebar>
  );
}