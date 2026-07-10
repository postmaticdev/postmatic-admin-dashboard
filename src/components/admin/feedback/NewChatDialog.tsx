import { useNavigate } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function NewChatDialog({
  size = "default",
  className,
  type = "gmail",
}: {
  size?: "default" | "sm" | "icon";
  className?: string;
  type?: "gmail" | "whatsapp" | "report";
}) {
  const navigate = useNavigate();

  return (
    <Button
      variant="outline"
      size={size}
      className={cn("gap-2 shrink-0 bg-blue-600 hover:bg-blue-700 text-white hover:text-white border-none", className)}
      onClick={() => navigate({ to: "/compose", search: { type } })}
    >
      <Plus className="h-4 w-4" /> New Chat
    </Button>
  );
}
