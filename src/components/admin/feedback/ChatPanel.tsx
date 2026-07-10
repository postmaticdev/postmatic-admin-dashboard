import { useRef, useState } from "react";
import { Paperclip, Send, X } from "lucide-react";
import { NewChatDialog } from "@/components/admin/feedback/NewChatDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { MessageRow } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/admin/SearchBar";

export function ChatPanel({ messages }: { messages: MessageRow[] }) {
  const [active, setActive] = useState<MessageRow | null>(messages[0] ?? null);
  const [reply, setReply] = useState("");
  const [search, setSearch] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    if (files.length) setAttachments((prev) => [...prev, ...files]);
    e.target.value = "";
  };

  return (
    <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-xl border bg-card shadow-card lg:grid-cols-[320px_1fr] h-[calc(100vh-250px)] min-h-[500px]">
      <aside className="border-b lg:border-b-0 lg:border-r flex flex-col h-full">
        <div className="p-3 border-b flex flex-col gap-2">
          <SearchBar placeholder="Search chats..." value={search} onChange={setSearch} className="max-w-full" />
          <NewChatDialog className="w-full" type="whatsapp" />
        </div>
        <ul className="divide-y overflow-y-auto flex-1">
          {messages.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => setActive(m)}
                className={cn(
                  "w-full flex items-start gap-3 p-4 text-left hover:bg-muted/40 transition-colors",
                  active?.id === m.id && "bg-accent",
                )}
              >
                <img src={m.contactAvatar} alt={m.contact} className="h-10 w-10 rounded-full bg-muted" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between">
                    <p className="truncate text-sm font-semibold text-foreground">{m.contact}</p>
                    <span className="text-xs text-muted-foreground">{m.at.slice(-5)}</span>
                  </div>
                  <p className="truncate text-xs font-medium text-foreground">{m.subject}</p>
                  <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
                </div>
                {m.unread ? <span className="mt-1 h-2 w-2 rounded-full bg-primary" /> : null}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section className="flex flex-col h-full overflow-hidden">
        {active ? (
          <>
            <header className="flex items-center gap-3 border-b p-4">
              <img src={active.contactAvatar} alt={active.contact} className="h-10 w-10 rounded-full bg-muted" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-foreground">{active.contact}</p>
                <p className="text-xs text-muted-foreground">{active.subject}</p>
              </div>
              <StatusBadge status="Chat" />
            </header>
            <div className="flex-1 space-y-4 overflow-y-auto p-6 bg-muted/20">
              {active.thread.map((t) => (
                <div key={t.id} className={cn("flex", t.from === "us" ? "justify-end" : "justify-start")}>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm shadow-card",
                      t.from === "us"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-card text-foreground rounded-bl-sm border",
                    )}
                  >
                    <p>{t.body}</p>
                    {t.attachments?.map((a) => (
                      <div key={a.id} className="mt-2 flex items-center gap-2 rounded-md bg-black/10 px-2 py-1 text-xs">
                        <Paperclip className="h-3 w-3" />
                        {a.name}
                      </div>
                    ))}
                    <p className={cn("mt-1 text-[10px]", t.from === "us" ? "text-primary-foreground/70" : "text-muted-foreground")}>
                      {t.at.slice(-5)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <footer className="border-t p-3">
              {attachments.length > 0 ? (
                <div className="mb-2 flex flex-wrap gap-2">
                  {attachments.map((f, i) => (
                    <span key={i} className="inline-flex items-center gap-1 rounded-md border bg-muted/50 px-2 py-1 text-xs">
                      <Paperclip className="h-3 w-3" />
                      {f.name}
                      <button onClick={() => setAttachments((a) => a.filter((_, j) => j !== i))}>
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
              ) : null}
              <div className="flex items-center gap-2">
                <input ref={fileRef} type="file" className="hidden" multiple accept="image/*,.pdf,.doc,.docx" onChange={handleAttach} />
                <Button type="button" variant="outline" size="icon" onClick={() => fileRef.current?.click()}>
                  <Paperclip className="h-4 w-4" />
                </Button>
                <Input
                  placeholder="Tulis balasan..."
                  className="flex-1"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <Button className="gap-2">
                  <Send className="h-4 w-4" /> Kirim
                </Button>
              </div>
            </footer>
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Pilih percakapan di sebelah kiri.
          </div>
        )}
      </section>
    </div>
  );
}
