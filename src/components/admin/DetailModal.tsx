import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function DetailModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  size = "lg",
  footer,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
  size?: "md" | "lg" | "xl" | "2xl" | "3xl";
  footer?: ReactNode;
}) {
  const w =
    size === "3xl"
      ? "sm:max-w-7xl"
      : size === "2xl"
      ? "sm:max-w-6xl"
      : size === "xl"
      ? "sm:max-w-4xl"
      : size === "lg"
      ? "sm:max-w-3xl"
      : "sm:max-w-lg";
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={`${w} max-h-[92vh] overflow-y-auto`}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description ? <DialogDescription>{description}</DialogDescription> : null}
        </DialogHeader>
        <div className="mt-2 space-y-6">{children}</div>
        {footer ? <div className="mt-4 flex justify-end gap-2 border-t pt-4">{footer}</div> : null}
      </DialogContent>
    </Dialog>
  );
}