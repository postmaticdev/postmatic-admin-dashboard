import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import {
  ChevronDown,
  FileText,
  LifeBuoy,
  PanelLeftClose,
  PanelLeftOpen,
  Users,
  Wallet,
  MessageCircle,
  Mail,
  Globe,
  Inbox,
  UserCircle,
  Sparkles,
  Building2,
  Megaphone,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavChild {
  label: string;
  to: string;
  icon: LucideIcon;
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  {
    label: "Workspace Management",
    icon: Users,
    children: [
      { label: "Account", to: "/workspace/account", icon: UserCircle },
      { label: "Creator", to: "/workspace/creator", icon: Sparkles },
      { label: "Business", to: "/workspace/business", icon: Building2 },
    ],
  },
  { label: "Financing", icon: Wallet, to: "/financing" },
  { label: "Docs Management", icon: FileText, to: "/docs" },
  { label: "CRM Blast", icon: Megaphone, to: "/crm-blast" },
  {
    label: "Customer Service",
    icon: LifeBuoy,
    children: [
      { label: "All Ticket", to: "/customer-service/all", icon: Inbox },
      { label: "Whatsapp", to: "/customer-service/whatsapp", icon: MessageCircle },
      { label: "Gmail", to: "/customer-service/gmail", icon: Mail },
      { label: "Website Report", to: "/customer-service/website", icon: Globe },
    ],
  },
];

export function AppSidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <aside
      className={cn(
        "flex h-full shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200",
        collapsed ? "w-14" : "w-64",
      )}
    >
      <nav className="flex-1 overflow-y-auto p-2">
        <TooltipProvider delayDuration={100}>
          <ul className="flex flex-col gap-1">
            {NAV.map((item) => (
              <SidebarItem
                key={item.label}
                item={item}
                collapsed={collapsed}
                pathname={pathname}
              />
            ))}
          </ul>
        </TooltipProvider>
      </nav>
    </aside>
  );
}

function SidebarItem({
  item,
  collapsed,
  pathname,
}: {
  item: NavItem;
  collapsed: boolean;
  pathname: string;
}) {
  const hasChildren = !!item.children?.length;
  const isChildActive = hasChildren && item.children!.some((c) => pathname.startsWith(c.to));
  const [open, setOpen] = useState(isChildActive);
  const Icon = item.icon;

  if (!hasChildren && item.to) {
    const active = pathname === item.to || pathname.startsWith(item.to + "/");
    const link = (
      <Link
        to={item.to}
        className={cn(
          "flex h-9 items-center gap-3 rounded-md px-2 text-sm font-medium transition-colors",
          active
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          collapsed && "justify-center px-0",
        )}
      >
        <Icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );
    return (
      <li>
        {collapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>{link}</TooltipTrigger>
            <TooltipContent side="right">{item.label}</TooltipContent>
          </Tooltip>
        ) : (
          link
        )}
      </li>
    );
  }

  const trigger = (
    <button
      type="button"
      onClick={() => setOpen((o) => !o)}
      className={cn(
        "flex h-9 w-full items-center gap-3 rounded-md px-2 text-sm font-medium transition-colors",
        isChildActive
          ? "text-sidebar-accent-foreground"
          : "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        collapsed && "justify-center px-0",
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-left">{item.label}</span>
          <ChevronDown
            className={cn("h-4 w-4 shrink-0 transition-transform", open && "rotate-180")}
          />
        </>
      )}
    </button>
  );

  return (
    <li>
      {collapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{trigger}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      ) : (
        trigger
      )}
      {!collapsed && open && (
        <ul className="mt-1 flex flex-col gap-0.5 pl-4">
          {item.children!.map((child) => {
            const ChildIcon = child.icon;
            const active = pathname === child.to;
            return (
              <li key={child.to}>
                <Link
                  to={child.to}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <ChildIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{child.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
