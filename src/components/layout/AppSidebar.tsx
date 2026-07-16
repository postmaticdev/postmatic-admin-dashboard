import { useState, useRef, useEffect } from "react";
import { Link, useRouterState, useNavigate } from "@tanstack/react-router";
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
  Settings,
  LogOut,
  Bot,
  Image,
  Type,
  CreditCard,
  Rss,
  Tag,
  GalleryHorizontal,
  Shield,
  Coins,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

interface NavChild {
  label: string;
  to?: string;
  icon: LucideIcon;
  children?: { label: string; to: string; icon: LucideIcon }[];
}

interface NavItem {
  label: string;
  icon: LucideIcon;
  to?: string;
  children?: NavChild[];
}

const NAV: NavItem[] = [
  {
    label: "Account Management",
    icon: UserCircle,
    children: [
      { label: "User", to: "/workspace/account/user", icon: Users },
      { label: "Admin", to: "/workspace/account/admin", icon: UserCircle },
      { label: "Role Management", to: "/workspace/account/role", icon: Shield },
      { label: "Creator", to: "/workspace/account/creator", icon: Sparkles },
    ],
  },
  {
    label: "Creator Management",
    icon: Sparkles,
    children: [
      { label: "Creator", to: "/workspace/creator", icon: Sparkles },
      { label: "Gallery", to: "/workspace/creator/gallery", icon: GalleryHorizontal },
    ],
  },
  {
    label: "Business Management",
    icon: Building2,
    children: [
      { label: "Business", to: "/workspace/business", icon: Building2 },
      { label: "Token Inject", to: "/workspace/business/token-inject", icon: Coins },
    ],
  },
  {
    label: "Workspace Management",
    icon: Users,
    children: [
      {
        label: "Discount",
        icon: Tag,
        children: [
          { label: "Voucher", to: "/workspace/discount/voucher", icon: Wallet },
          { label: "Referral", to: "/workspace/discount/referral", icon: Users },
        ],
      },
      {
        label: "AI Model",
        icon: Bot,
        children: [
          { label: "Image", to: "/workspace/ai-model/image", icon: Image },
          { label: "Text", to: "/workspace/ai-model/text", icon: Type },
        ],
      },
      { label: "Payment", to: "/workspace/payment", icon: CreditCard },
      { label: "RSS", to: "/workspace/rss", icon: Rss },
    ],
  },
  { label: "Financing", icon: Wallet, to: "/financing" },
  {
    label: "Documentation",
    icon: FileText,
    children: [
      { label: "Docs Management", to: "/docs/management", icon: FileText },
      { label: "Legality", to: "/docs/legality", icon: FileText },
    ],
  },
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
  const [profileOpen, setProfileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const profileName = user?.name ?? "Admin";
  const profileEmail = user?.email ?? "Authenticated";
  const profileInitials = user?.initials ?? "A";

  // Close dropdown when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

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
              <SidebarItem key={item.label} item={item} collapsed={collapsed} pathname={pathname} />
            ))}
          </ul>
        </TooltipProvider>
      </nav>

      {/* Profile section */}
      <div ref={dropdownRef} className="relative border-t border-border/60 p-2">
        {/* Dropdown menu — appears above the trigger */}
        {profileOpen && (
          <div
            className={cn(
              "absolute bottom-full left-2 right-2 mb-1 overflow-hidden rounded-xl border border-border bg-popover shadow-xl shadow-black/10 backdrop-blur-sm",
              "animate-in fade-in slide-in-from-bottom-2 duration-150",
            )}
          >
            <div className="p-1">
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  navigate({ to: "/settings" });
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-foreground/80 transition-colors hover:bg-accent hover:text-foreground"
              >
                <Settings className="h-4 w-4 shrink-0 text-muted-foreground" />
                <span>Settings</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setProfileOpen(false);
                  logout();
                }}
                className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium text-destructive/80 transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 shrink-0" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        )}

        {/* Profile trigger button */}
        <TooltipProvider delayDuration={100}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex h-10 w-10 items-center justify-center rounded-lg transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                >
                  <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground ring-2 ring-primary/20">
                    {profileInitials}
                  </div>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right">{profileName}</TooltipContent>
            </Tooltip>
          ) : (
            <button
              type="button"
              onClick={() => setProfileOpen((o) => !o)}
              className={cn(
                "flex h-11 w-full items-center gap-3 rounded-xl px-3 transition-colors",
                profileOpen
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              {/* Avatar */}
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground ring-2 ring-primary/20">
                {profileInitials}
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start text-left">
                <span className="truncate text-xs font-semibold text-sidebar-foreground">
                  {profileName}
                </span>
                <span className="truncate text-[10px] text-sidebar-foreground/50">
                  {profileEmail}
                </span>
              </div>
              <ChevronDown
                className={cn(
                  "h-3.5 w-3.5 shrink-0 text-sidebar-foreground/50 transition-transform duration-200",
                  profileOpen && "rotate-180",
                )}
              />
            </button>
          )}
        </TooltipProvider>
      </div>
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
  const isChildActive = hasChildren && item.children!.some((c) => {
    if (c.to && pathname.startsWith(c.to)) return true;
    if (c.children?.some((sc) => pathname.startsWith(sc.to))) return true;
    return false;
  });
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
          {item.children!.map((child) => (
            <SidebarChildItem key={child.label} child={child} pathname={pathname} />
          ))}
        </ul>
      )}
    </li>
  );
}

function SidebarChildItem({
  child,
  pathname,
}: {
  child: NavChild;
  pathname: string;
}) {
  const hasSubChildren = !!child.children?.length;
  const isSubChildActive = hasSubChildren && child.children!.some((sc) => pathname.startsWith(sc.to));
  const [open, setOpen] = useState(isSubChildActive);
  const ChildIcon = child.icon;

  if (!hasSubChildren && child.to) {
    const active = pathname === child.to;
    return (
      <li>
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
  }

  return (
    <li>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "flex h-8 w-full items-center gap-2 rounded-md px-2 text-sm transition-colors",
          isSubChildActive
            ? "text-sidebar-accent-foreground"
            : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
        )}
      >
        <ChildIcon className="h-3.5 w-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">{child.label}</span>
        <ChevronDown
          className={cn("h-3.5 w-3.5 shrink-0 transition-transform", open && "rotate-180")}
        />
      </button>
      {open && (
        <ul className="mt-1 flex flex-col gap-0.5 pl-4">
          {child.children!.map((sc) => {
            const ScIcon = sc.icon;
            const active = pathname === sc.to;
            return (
              <li key={sc.to}>
                <Link
                  to={sc.to}
                  className={cn(
                    "flex h-8 items-center gap-2 rounded-md px-2 text-sm transition-colors",
                    active
                      ? "bg-primary/10 font-medium text-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  )}
                >
                  <ScIcon className="h-3.5 w-3.5 shrink-0" />
                  <span className="truncate">{sc.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </li>
  );
}
