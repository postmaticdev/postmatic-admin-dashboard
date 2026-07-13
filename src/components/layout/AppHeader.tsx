import { PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Logo } from "./Logo";
import { NotificationsMenu } from "./NotificationsMenu";
import { ThemeToggle } from "./ThemeToggle";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
}

export function AppHeader({ collapsed, onToggle }: Props) {
  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
      <div className="flex items-center gap-3">
        <Logo />
        <Button
          variant="ghost"
          size="icon"
          onClick={onToggle}
          aria-label={collapsed ? "Perluas sidebar" : "Ciutkan sidebar"}
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
        >
          {collapsed ? <PanelLeftOpen className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
        </Button>
      </div>
      <div className="flex items-center gap-1">
        <ThemeToggle />
        <NotificationsMenu />
      </div>
    </header>
  );
}
