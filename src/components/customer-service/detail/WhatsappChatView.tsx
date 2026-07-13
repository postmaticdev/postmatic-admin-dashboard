import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Paperclip, Send, X, FileText, CornerUpLeft, Image as ImageIcon, Video as VideoIcon } from "lucide-react";
import { MarkAsTicketButton } from "../MarkAsTicketButton";
import { StatusBadge } from "../StatusBadge";
import { TicketStatusSelector } from "../TicketStatusSelector";
import { useTickets } from "@/contexts/TicketsContext";
import { cn } from "@/lib/utils";
import { formatTime } from "@/lib/utils/date";
import type { Ticket, TicketMessage } from "@/lib/types/ticket";

interface AttachedFile {
  name: string;
  url: string;
  type: string;
}

export function WhatsappChatView({ ticket }: { ticket: Ticket }) {
  const { addMessage, getDraft, setDraft } = useTickets();
  const draftKey = `wa-reply-${ticket.id}`;

  const [inputText, setInputText] = useState("");
  const [attachments, setAttachments] = useState<AttachedFile[]>([]);
  const [replyingTo, setReplyingTo] = useState<TicketMessage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // Load draft when ticket changes
  useEffect(() => {
    const saved = getDraft(draftKey);
    if (saved) {
      setInputText(saved.text || "");
      setAttachments(saved.attachments || []);
    } else {
      setInputText("");
      setAttachments([]);
    }
    setReplyingTo(null);
  }, [ticket.id, getDraft, draftKey]);

  // Save draft when states change
  const saveDraft = (text: string, atts: AttachedFile[]) => {
    if (text.trim() || atts.length > 0) {
      setDraft(draftKey, { text, attachments: atts });
    } else {
      setDraft(draftKey, null);
    }
  };

  const handleInputChange = (val: string) => {
    setInputText(val);
    saveDraft(val, attachments);
  };

  // Auto scroll to bottom when message list changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [ticket.messages, replyingTo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const newAtts = [
            ...attachments,
            {
              name: file.name,
              url: event.target!.result as string,
              type: file.type,
            },
          ];
          setAttachments(newAtts);
          saveDraft(inputText, newAtts);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    const newAtts = attachments.filter((_, i) => i !== index);
    setAttachments(newAtts);
    saveDraft(inputText, newAtts);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() && attachments.length === 0) return;

    addMessage(ticket.id, {
      authorId: "cs-agent",
      authorName: "CS Postmatic",
      content: inputText.trim(),
      direction: "out",
      attachments: attachments.map((att) => ({ name: att.name, url: att.url })),
      quotedMessage: replyingTo
        ? {
            authorName: replyingTo.authorName,
            content: replyingTo.content || (replyingTo.attachments?.length ? "📎 Lampiran file" : "Pesan media"),
          }
        : undefined,
    });

    setInputText("");
    setAttachments([]);
    setReplyingTo(null);
    setDraft(draftKey, null);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (inputText.trim() || attachments.length > 0) {
        handleSend(e);
      }
    }
  };

  const isImage = (name: string, type?: string) => {
    if (type?.startsWith("image/")) return true;
    return /\.(jpg|jpeg|png|gif|webp)$/i.test(name);
  };

  const isVideo = (name: string, type?: string) => {
    if (type?.startsWith("video/")) return true;
    return /\.(mp4|webm|ogg)$/i.test(name);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-center justify-between border-b border-border bg-card px-6 py-3 shrink-0">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={ticket.senderAvatar} alt={ticket.senderName} />
            <AvatarFallback>{ticket.senderName.charAt(0)}</AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-semibold text-foreground">{ticket.senderName}</p>
            <p className="text-xs text-muted-foreground">{ticket.senderHandle}</p>
          </div>
          <StatusBadge status={ticket.status} />
        </div>
        <div className="flex items-center gap-2">
          <TicketStatusSelector ticketId={ticket.id} currentStatus={ticket.status} />
          <MarkAsTicketButton ticket={ticket} />
        </div>
      </header>

      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="flex flex-col gap-3 px-6 py-6">
          {ticket.messages.map((m) => {
            if (m.authorId === "system") {
              return (
                <div key={m.id} className="flex justify-center my-1 w-full">
                  <div className="rounded-full bg-muted/80 border border-border/50 px-3 py-1 text-[11px] text-muted-foreground font-medium shadow-sm">
                    {m.content} ({formatTime(m.createdAt)})
                  </div>
                </div>
              );
            }
            const out = m.direction === "out";
            return (
              <div
                key={m.id}
                className={cn("flex group items-center gap-2", out ? "justify-end" : "justify-start")}
              >
                {out && (
                  <button
                    type="button"
                    onClick={() => setReplyingTo(m)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                    title="Balas pesan ini"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                  </button>
                )}

                <div
                  className={cn(
                    "max-w-[70%] rounded-2xl px-3.5 py-2 shadow-sm flex flex-col gap-1.5 relative",
                    out
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm bg-card text-card-foreground border border-border",
                  )}
                >
                  {/* Quoted Message display */}
                  {m.quotedMessage && (
                    <div
                      className={cn(
                        "border-l-4 p-1.5 rounded text-xs mb-0.5 max-w-sm overflow-hidden",
                        out
                          ? "bg-primary-foreground/10 border-primary-foreground/50 text-primary-foreground/90"
                          : "bg-muted border-primary/50 text-muted-foreground"
                      )}
                    >
                      <p className="font-bold text-[10px] mb-0.5">{m.quotedMessage.authorName}</p>
                      <p className="truncate text-[11px]">{m.quotedMessage.content}</p>
                    </div>
                  )}

                  {/* Render Attachments inside bubble */}
                  {m.attachments && m.attachments.length > 0 && (
                    <div className="flex flex-col gap-1.5 mb-1 max-w-sm">
                      {m.attachments.map((att, idx) => {
                        if (isImage(att.name)) {
                          return (
                            <img
                              key={idx}
                              src={att.url}
                              alt={att.name}
                              className="max-h-60 rounded object-cover cursor-pointer hover:opacity-90"
                            />
                          );
                        } else if (isVideo(att.name)) {
                          return (
                            <video
                              key={idx}
                              src={att.url}
                              controls
                              className="max-h-60 rounded"
                            />
                          );
                        } else {
                          return (
                            <div
                              key={idx}
                              className={cn(
                                "flex items-center gap-2 rounded p-2 text-xs",
                                out ? "bg-primary-foreground/10 text-primary-foreground" : "bg-muted text-foreground"
                              )}
                            >
                              <FileText className="h-4 w-4 shrink-0" />
                              <a
                                href={att.url}
                                download={att.name}
                                className="underline hover:no-underline truncate font-medium max-w-[200px]"
                                title={att.name}
                              >
                                {att.name}
                              </a>
                            </div>
                          );
                        }
                      })}
                    </div>
                  )}

                  {m.content && (
                    <p className="whitespace-pre-wrap text-sm leading-relaxed">{m.content}</p>
                  )}
                  <p
                    className={cn(
                      "text-[9px] mt-0.5",
                      out ? "text-primary-foreground/75 text-right" : "text-muted-foreground",
                    )}
                  >
                    {formatTime(m.createdAt)}
                  </p>
                </div>

                {!out && (
                  <button
                    type="button"
                    onClick={() => setReplyingTo(m)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0"
                    title="Balas pesan ini"
                  >
                    <CornerUpLeft className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* WhatsApp Input Footer */}
      <footer className="border-t border-border bg-card p-3 shrink-0">
        <form onSubmit={handleSend} className="flex flex-col gap-2">
          {/* Quoting Preview Block */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-muted/40 border border-border border-b-0 px-3 py-2 rounded-t-lg shrink-0">
              <div className="border-l-4 border-primary pl-2 overflow-hidden flex-1">
                <p className="text-xs font-bold text-foreground">{replyingTo.authorName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[500px]">
                  {replyingTo.content || (replyingTo.attachments?.length ? "📎 Lampiran file" : "Pesan media")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-5 w-5 rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/60 shrink-0"
                onClick={() => setReplyingTo(null)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          )}

          {/* Attachment Previews */}
          {attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 rounded-lg border border-border bg-muted/20 p-2 max-h-24 overflow-y-auto">
              {attachments.map((att, index) => (
                <div
                  key={index}
                  className="relative flex items-center gap-1.5 rounded border border-border bg-background pl-2 pr-1.5 py-1 text-xs text-foreground shadow-sm max-w-[180px]"
                >
                  {isImage(att.name, att.type) ? (
                    <ImageIcon className="h-3.5 w-3.5 text-blue-500 shrink-0" />
                  ) : isVideo(att.name, att.type) ? (
                    <VideoIcon className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                  ) : (
                    <FileText className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                  )}
                  <span className="truncate font-medium flex-1 pr-3">{att.name}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttachment(index)}
                    className="absolute right-1 top-1 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Input Controls */}
          <div className={cn("flex items-center gap-2", replyingTo && "rounded-b-lg")}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              className="hidden"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-4 w-4" />
            </Button>
            <Textarea
              value={inputText}
              onChange={(e) => handleInputChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ketik pesan..."
              rows={1}
              className="flex-1 min-h-[36px] h-9 max-h-24 py-2 resize-none text-sm placeholder:text-muted-foreground/70 bg-muted/30 focus-visible:ring-1"
            />
            <Button
              type="submit"
              size="icon"
              disabled={!inputText.trim() && attachments.length === 0}
              className="h-9 w-9 rounded-full shrink-0"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
