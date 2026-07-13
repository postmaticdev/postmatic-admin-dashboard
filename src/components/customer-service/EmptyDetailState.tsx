import { Inbox } from "lucide-react";

export function EmptyDetailState() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 bg-background text-center">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
        <Inbox className="h-6 w-6" />
      </div>
      <div>
        <p className="text-sm font-medium text-foreground">Pilih percakapan</p>
        <p className="mt-1 text-xs text-muted-foreground">
          Klik salah satu tiket di sebelah kiri untuk membuka detail percakapan.
        </p>
      </div>
    </div>
  );
}
