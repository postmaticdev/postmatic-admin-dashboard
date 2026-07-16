import { useTheme } from "@/contexts/ThemeContext";

export function Logo({ collapsed = false }: { collapsed?: boolean }) {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? "/logo2.png" : "/logo1.png";

  return (
    <div className="flex items-center gap-2">
      <img
        src={logoSrc}
        alt="Postmatic Logo"
        className="h-5 w-auto object-contain"
      />
      {!collapsed && (
        <span className="text-lg font-semibold tracking-tight text-foreground">
          Postmatic
        </span>
      )}
    </div>
  );
}
