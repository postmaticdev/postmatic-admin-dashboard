import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Archive, Inbox, Mail, Send, Star, Trash2, ChevronDown, ChevronUp, Paperclip } from "lucide-react";
import { NewChatDialog } from "@/components/admin/feedback/NewChatDialog";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { Button } from "@/components/ui/button";
import type { MessageRow } from "@/lib/mock/types";
import { cn } from "@/lib/utils";
import { SearchBar } from "@/components/admin/SearchBar";
import { toast } from "sonner";

const folders = [
  { id: "inbox", label: "Inbox", icon: Inbox },
  { id: "sent", label: "Sent", icon: Send },
  { id: "drafts", label: "Drafts", icon: Mail },
  { id: "spam", label: "Spam", icon: Archive },
  { id: "trash", label: "Trash", icon: Trash2 },
] as const;

export function GmailInbox({
  messages,
  variant = "email",
  activeId,
}: {
  messages: MessageRow[];
  variant?: "email" | "report";
  activeId?: string;
}) {
  const navigate = useNavigate();
  const [folder, setFolder] = useState<string>("inbox");
  const [search, setSearch] = useState("");
  const filtered = messages.filter((m) => (m.folder ?? "inbox") === folder || folder === "inbox");
  const [active, setActive] = useState<MessageRow | null>(() => {
    if (activeId) {
      const found = messages.find((m) => m.id === activeId);
      if (found) return found;
    }
    return filtered[0] ?? null;
  });

  const [expandedThreads, setExpandedThreads] = useState<Record<string, boolean>>({});

  const toggleThread = (threadId: string) => {
    setExpandedThreads(prev => ({
      ...prev,
      [threadId]: !prev[threadId]
    }));
  };

  return (
    <div
      className={cn(
        "grid grid-cols-1 overflow-hidden rounded-xl border bg-card shadow-card h-[calc(100vh-250px)] min-h-[500px]",
        variant === "report" ? "lg:grid-cols-[320px_1fr]" : "lg:grid-cols-[200px_320px_1fr]",
      )}
    >
      {variant !== "report" && (
        <aside className="border-b lg:border-b-0 lg:border-r bg-muted/20 p-3">
          <p className="mb-2 px-2 text-xs font-semibold uppercase text-muted-foreground">
            Folders
          </p>
        <nav className="space-y-0.5">
          {folders.map((f) => (
            <button
              key={f.id}
              onClick={() => setFolder(f.id)}
              className={cn(
                "flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                folder === f.id ? "bg-accent font-medium text-foreground" : "text-muted-foreground hover:bg-muted/50",
              )}
            >
              <f.icon className="h-4 w-4" />
              {f.label}
            </button>
          ))}
        </nav>
        </aside>
      )}

      <div className="border-b lg:border-b-0 lg:border-r flex flex-col h-full">
        <div className="p-3 border-b flex flex-col gap-2">
          <SearchBar placeholder="Search messages..." value={search} onChange={setSearch} className="max-w-full" />
          {variant !== "report" && (
            <NewChatDialog className="w-full" type={variant === "email" ? "gmail" : "report"} />
          )}
        </div>
        <ul className="divide-y overflow-y-auto flex-1">
          {filtered.map((m) => (
            <li key={m.id}>
              <button
                onClick={() => setActive(m)}
                className={cn(
                  "w-full px-4 py-3 text-left hover:bg-muted/40 transition-colors",
                  active?.id === m.id && "bg-accent",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className={cn("truncate text-sm", m.unread ? "font-bold text-foreground" : "text-muted-foreground")}>
                    {m.contact}
                  </p>
                  <span className="shrink-0 text-[10px] text-muted-foreground">{m.at.slice(-5)}</span>
                </div>
                <p className={cn("truncate text-sm", m.unread ? "font-semibold" : "font-normal text-foreground")}>
                  {m.subject}
                </p>
                <p className="truncate text-xs text-muted-foreground">{m.preview}</p>
                {variant === "report" && m.reportStatus ? (
                  <div className="mt-1">
                    <StatusBadge status={m.reportStatus === "Resolved" ? "Success" : m.reportStatus === "Open" ? "Pending" : "Active"} />
                  </div>
                ) : null}
              </button>
            </li>
          ))}
          {filtered.length === 0 ? (
            <li className="p-8 text-center text-sm text-muted-foreground">Tidak ada pesan.</li>
          ) : null}
        </ul>
      </div>

      <section className="flex flex-col h-full overflow-hidden">
        {active ? (
          <>
            {variant === "email" ? (
              <header className="border-b p-5 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{active.subject}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Dari <span className="font-semibold text-foreground">{active.contact}</span>
                      {active.contactEmail ? ` <${active.contactEmail}>` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      title={active.unread ? "Tandai sudah dibaca" : "Tandai belum dibaca"}
                      onClick={() => {
                        active.unread = !active.unread;
                        toast.success(active.unread ? "Tercatat belum dibaca" : "Tercatat sudah dibaca");
                      }}
                    >
                      <Mail className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      title="Hapus"
                      onClick={() => {
                        toast.success("Email dipindahkan ke kotak sampah.");
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </header>
            ) : (
              <header className="border-b p-5 bg-card">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{active.subject}</h3>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Pelapor <span className="font-semibold text-foreground">{active.contact}</span>
                      {active.contactEmail ? ` <${active.contactEmail}>` : ""}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Status:</span>
                    <StatusBadge status={active.reportStatus === "Resolved" ? "Success" : active.reportStatus === "Open" ? "Pending" : "Active"} />
                  </div>
                </div>
              </header>
            )}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {active.thread.map((t, idx) => {
                const hasOnlyOne = active.thread.length === 1;
                const isDefaultExpanded = idx === active.thread.length - 1;
                const isExpanded = hasOnlyOne || (expandedThreads[t.id] ?? isDefaultExpanded);

                return (
                  <div key={t.id} className="border rounded-lg bg-card overflow-hidden shadow-xs">
                    <button
                      onClick={() => !hasOnlyOne && toggleThread(t.id)}
                      disabled={hasOnlyOne}
                      className={cn(
                        "w-full flex items-center justify-between px-4 py-3 bg-muted/20 hover:bg-muted/40 transition-colors text-left",
                        hasOnlyOne && "cursor-default hover:bg-muted/20"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-foreground">
                          {t.from === "us" ? "Postmatic Support" : active.contact}
                        </p>
                        <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                          {t.from === "us" ? "Support" : "User"}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{t.at}</span>
                        {!hasOnlyOne && (
                          isExpanded ? (
                            <ChevronUp className="h-4 w-4 text-muted-foreground" />
                          ) : (
                            <ChevronDown className="h-4 w-4 text-muted-foreground" />
                          )
                        )}
                      </div>
                    </button>

                    {isExpanded && (
                      <div className="p-4 border-t space-y-4 bg-card">
                        <p className="text-sm leading-relaxed text-foreground whitespace-pre-wrap">{t.body}</p>
                        
                        {t.attachments && t.attachments.length > 0 && (
                          <div className="pt-3 border-t mt-3">
                            <p className="text-xs font-semibold text-muted-foreground mb-2 flex items-center gap-1">
                              <Paperclip className="h-3 w-3" /> Lampiran ({t.attachments.length})
                            </p>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                              {t.attachments.map((att, attIdx) => (
                                <a
                                  key={attIdx}
                                  href={att.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="group flex flex-col rounded-lg border bg-muted/25 hover:bg-muted/50 overflow-hidden transition-colors"
                                >
                                  {att.type === "image" ? (
                                    <img
                                      src={att.url}
                                      alt={att.name}
                                      className="h-24 w-full object-cover border-b"
                                    />
                                  ) : (
                                    <div className="h-24 flex items-center justify-center border-b bg-muted/55">
                                      <Paperclip className="h-8 w-8 text-muted-foreground" />
                                    </div>
                                  )}
                                  <div className="p-2 min-w-0">
                                    <p className="text-xs font-medium text-foreground truncate">{att.name}</p>
                                    <p className="text-[10px] text-muted-foreground mt-0.5">Lihat berkas</p>
                                  </div>
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            {variant === "email" ? (
              <footer className="border-t p-4 flex items-center justify-between bg-card">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-blue-600 hover:bg-blue-700 text-white border-none"
                  onClick={() =>
                    navigate({
                      to: "/compose",
                      search: {
                        type: "gmail",
                        replyToId: active.id,
                        to: active.contactEmail || active.contact,
                        subject: active.subject.startsWith("Re:") ? active.subject : `Re: ${active.subject}`,
                      },
                    })
                  }
                >
                  <Send className="h-4 w-4" /> Balas Email
                </Button>
              </footer>
            ) : (
              <footer className="border-t p-4 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2 bg-violet-600 hover:bg-violet-700 text-white border-none shrink-0"
                  onClick={() =>
                    navigate({
                      to: "/compose",
                      search: {
                        type: "report",
                        replyToId: active.id,
                        to: active.contact,
                        subject: active.subject.startsWith("Re:") ? active.subject : `Re: ${active.subject}`,
                      },
                    })
                  }
                >
                  <Send className="h-4 w-4" /> Balas Report
                </Button>
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <div className="text-xs text-muted-foreground font-semibold">
                    Lacak Status Tiket Laporan:
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant={active.reportStatus === "Open" ? "default" : "outline"}
                      className={cn("text-xs font-semibold", active.reportStatus === "Open" && "bg-amber-600 hover:bg-amber-700 text-white")}
                      onClick={() => {
                        active.reportStatus = "Open";
                        toast.success("Status laporan diperbarui: Review");
                      }}
                    >
                      Review
                    </Button>
                    <Button
                      size="sm"
                      variant={active.reportStatus === "In Progress" ? "default" : "outline"}
                      className={cn("text-xs font-semibold", active.reportStatus === "In Progress" && "bg-blue-600 hover:bg-blue-700 text-white")}
                      onClick={() => {
                        active.reportStatus = "In Progress";
                        toast.success("Status laporan diperbarui: In Progress");
                      }}
                    >
                      In Progress
                    </Button>
                    <Button
                      size="sm"
                      variant={active.reportStatus === "Resolved" ? "default" : "outline"}
                      className={cn("text-xs font-semibold", active.reportStatus === "Resolved" && "bg-emerald-600 hover:bg-emerald-700 text-white")}
                      onClick={() => {
                        active.reportStatus = "Resolved";
                        toast.success("Status laporan diperbarui: Done");
                      }}
                    >
                      Done
                    </Button>
                  </div>
                </div>
              </footer>
            )}
          </>
        ) : (
          <div className="flex flex-1 items-center justify-center text-sm text-muted-foreground">
            Pilih pesan untuk dibaca.
          </div>
        )}
      </section>
    </div>
  );
}
