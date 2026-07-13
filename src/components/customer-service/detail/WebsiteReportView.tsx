import { useState, useRef, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
import LinkExtension from "@tiptap/extension-link";
import OrderedList from "@tiptap/extension-ordered-list";
import {
  Paperclip,
  Send,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Link as LinkIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  CornerUpLeft,
  X,
  List,
  ListOrdered,
} from "lucide-react";
import { MarkAsTicketButton } from "../MarkAsTicketButton";
import { StatusBadge } from "../StatusBadge";
import { TicketStatusSelector } from "../TicketStatusSelector";
import { useTickets } from "@/contexts/TicketsContext";
import { cn } from "@/lib/utils";
import { formatRelative, formatDateTime } from "@/lib/utils/date";
import type { Ticket, TicketMessage } from "@/lib/types/ticket";

const CustomOrderedList = OrderedList.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      type: {
        default: "1",
        parseHTML: (element) => element.getAttribute("type"),
        renderHTML: (attributes) => {
          return {
            type: attributes.type,
          };
        },
      },
    };
  },
});

export function WebsiteReportView({ ticket }: { ticket: Ticket }) {
  const { addMessage, getDraft, setDraft } = useTickets();
  const draftKey = `web-reply-${ticket.id}`;

  const [subject, setSubject] = useState("");
  const [editorHtml, setEditorHtml] = useState("");
  const [replyingTo, setReplyingTo] = useState<TicketMessage | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
        orderedList: false,
      }),
      CustomOrderedList,
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      LinkExtension.configure({
        openOnClick: false,
      }),
    ],
    content: editorHtml,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setEditorHtml(html);
      saveDraft(subject, html);
    },
  });

  // Load draft when ticket.id changes
  useEffect(() => {
    const saved = getDraft(draftKey);
    if (saved) {
      setSubject(saved.subject || "");
      setEditorHtml(saved.html || "");
      editor?.commands.setContent(saved.html || "");
    } else {
      setSubject("");
      setEditorHtml("");
      editor?.commands.setContent("");
    }
    setReplyingTo(null);
  }, [ticket.id, getDraft, draftKey, editor]);

  const saveDraft = (sub: string, html: string) => {
    if (sub.trim() || (html && html !== "<p></p>")) {
      setDraft(draftKey, { subject: sub, html });
    } else {
      setDraft(draftKey, null);
    }
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    saveDraft(val, editorHtml);
  };

  // Recursively extract all messages and replies, then sort them chronologically
  const getFlatMessages = (messages: TicketMessage[]): TicketMessage[] => {
    const list: TicketMessage[] = [];
    const traverse = (msg: TicketMessage) => {
      const { replies, ...cleanMsg } = msg;
      list.push(cleanMsg);
      if (replies && replies.length > 0) {
        replies.forEach((reply) => traverse(reply));
      }
    };
    messages.forEach((msg) => traverse(msg));
    return list.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  };

  const flatMessages = getFlatMessages(ticket.messages);

  // Auto scroll to bottom when message list changes
  useEffect(() => {
    if (scrollAreaRef.current) {
      const scrollContainer = scrollAreaRef.current.querySelector("[data-radix-scroll-area-viewport]");
      if (scrollContainer) {
        scrollContainer.scrollTop = scrollContainer.scrollHeight;
      }
    }
  }, [ticket.messages, replyingTo]);

  const handleLink = () => {
    const url = prompt("Masukkan URL:");
    if (url) {
      editor?.chain().focus().toggleLink({ href: url }).run();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || !editor) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          const dataUrl = event.target.result as string;
          let htmlToInsert = "";

          if (file.type.startsWith("image/")) {
            htmlToInsert = `<img src="${dataUrl}" alt="${file.name}" style="max-width: 100%; max-height: 240px; display: block; border-radius: 6px; margin: 8px 0; border: 1px solid var(--border);" />`;
          } else if (file.type.startsWith("video/")) {
            htmlToInsert = `<video src="${dataUrl}" controls style="max-width: 100%; max-height: 240px; display: block; border-radius: 6px; margin: 8px 0; border: 1px solid var(--border);"></video>`;
          } else {
            htmlToInsert = `<a href="${dataUrl}" download="${file.name}" style="display: inline-flex; align-items: center; gap: 8px; padding: 6px 12px; background: rgba(0,0,0,0.05); border: 1px solid rgba(0,0,0,0.1); border-radius: 4px; text-decoration: underline; font-weight: 500; font-size: 12px; margin: 4px 0; color: inherit;">📎 ${file.name}</a>`;
          }

          editor.chain().focus().insertContent(htmlToInsert).run();
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const content = editorHtml.trim();
    if (!content || content === "<p></p>" || content === "<br>") return;

    addMessage(ticket.id, {
      authorId: "cs-agent",
      authorName: "CS Postmatic",
      subject: subject.trim() || undefined,
      content: content,
      direction: "out",
      quotedMessage: replyingTo
        ? {
            authorName: replyingTo.authorName,
            content: replyingTo.content ? replyingTo.content.replace(/<[^>]*>/g, " ").substring(0, 100) : "Pesan media",
          }
        : undefined,
    });

    setSubject("");
    setEditorHtml("");
    editor?.commands.setContent("");
    setReplyingTo(null);
    setDraft(draftKey, null);
  };

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      <header className="flex items-start justify-between gap-4 border-b border-border bg-card px-6 py-4 shrink-0">
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex items-center gap-2">
            <StatusBadge status={ticket.status} />
            <span className="text-xs text-muted-foreground">
              dilaporkan oleh {ticket.senderName}
            </span>
          </div>
          <h1 className="truncate text-lg font-semibold text-foreground">{ticket.subject}</h1>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <TicketStatusSelector ticketId={ticket.id} currentStatus={ticket.status} />
          <MarkAsTicketButton ticket={ticket} />
        </div>
      </header>

      <ScrollArea ref={scrollAreaRef} className="flex-1">
        <div className="mx-auto max-w-3xl space-y-4 px-6 py-6">
          {flatMessages.map((m) => {
            if (m.authorId === "system") {
              return (
                <div key={m.id} className="flex justify-center my-3 w-full">
                  <div className="rounded-full bg-muted border border-border/50 px-3 py-1 text-[11px] text-muted-foreground font-medium shadow-sm">
                    {m.content} ({formatDateTime(m.createdAt)})
                  </div>
                </div>
              );
            }
            return (
              <article key={m.id} className="rounded-lg border border-border bg-card p-4 shadow-sm relative group flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="mb-3 flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={m.authorAvatar} alt={m.authorName} />
                    <AvatarFallback className="text-xs">{m.authorName.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-foreground">{m.authorName}</p>
                    <p className="text-[11px] text-muted-foreground">
                      {m.direction === "out" ? "CS Agent" : "Pelapor"}
                    </p>
                  </div>
                  <span className="shrink-0 text-xs text-muted-foreground">
                    {formatRelative(m.createdAt)}
                  </span>
                </div>

                {/* Render Quoted message inside Website Report card */}
                {m.quotedMessage && (
                  <div className="bg-muted border-l-4 border-primary/50 p-2 rounded text-xs text-muted-foreground mb-2 max-w-full overflow-hidden">
                    <p className="font-bold text-[10px] text-foreground mb-0.5">{m.quotedMessage.authorName}</p>
                    <p className="truncate text-[11px]">{m.quotedMessage.content}</p>
                  </div>
                )}

                {/* Render Message Subject if exists */}
                {m.subject && (
                  <h3 className="text-sm font-bold text-foreground mb-1.5 border-b pb-1">
                    {m.subject}
                  </h3>
                )}

                {/* Render Rich Content message body */}
                <div
                  className="text-sm leading-relaxed text-foreground/90 prose max-w-none 
                    [&_img]:max-h-64 [&_img]:rounded [&_img]:my-2 [&_img]:inline-block
                    [&_video]:max-h-64 [&_video]:rounded [&_video]:my-2 [&_video]:inline-block
                    [&_a]:text-blue-600 [&_a]:underline [&_a]:font-medium
                    [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1
                    [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1
                    [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-1 [&_h3]:mb-1
                    [&_p]:mb-1"
                  dangerouslySetInnerHTML={{ __html: m.content }}
                />
              </div>

              {/* Reply Button (Hover) */}
              <button
                type="button"
                onClick={() => setReplyingTo(m)}
                className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground shrink-0 mt-1"
                title="Balas pesan ini"
              >
                <CornerUpLeft className="h-3.5 w-3.5" />
              </button>
            </article>
          )})}
        </div>
      </ScrollArea>

      {/* Rich Editor Footer */}
      <footer className="border-t border-border bg-card p-4 shrink-0">
        <form onSubmit={handleSend} className="flex flex-col gap-3">
          {/* Quoting Preview Block */}
          {replyingTo && (
            <div className="flex items-center justify-between bg-muted/40 border border-border border-b-0 px-3 py-2 rounded-t-lg shrink-0">
              <div className="border-l-4 border-primary pl-2 overflow-hidden flex-1">
                <p className="text-xs font-bold text-foreground">{replyingTo.authorName}</p>
                <p className="text-xs text-muted-foreground truncate max-w-[500px]">
                  {replyingTo.content ? replyingTo.content.replace(/<[^>]*>/g, " ").substring(0, 100) : "Pesan media"}
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

          {/* Subject Field */}
          <div className="flex flex-col gap-1.5">
            <Input
              value={subject}
              onChange={(e) => handleSubjectChange(e.target.value)}
              placeholder="Subject (Opsional)"
              className="h-8 text-xs bg-muted/20 border-border/80"
            />
          </div>

          {/* Formatting Toolbar */}
          <div className="flex items-center gap-1 bg-muted/40 border border-border/70 rounded-t-md px-3 py-1.5 shrink-0 overflow-x-auto">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={cn(
                "h-7 px-2 text-xs font-bold rounded transition-colors shrink-0",
                editor?.isActive("heading", { level: 1 })
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              H1
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={cn(
                "h-7 px-2 text-xs font-bold rounded transition-colors shrink-0",
                editor?.isActive("heading", { level: 2 })
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              H2
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleHeading({ level: 3 }).run()}
              className={cn(
                "h-7 px-2 text-xs font-bold rounded transition-colors shrink-0",
                editor?.isActive("heading", { level: 3 })
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              H3
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().setParagraph().run()}
              className={cn(
                "h-7 px-2 text-xs font-semibold rounded transition-colors shrink-0",
                editor?.isActive("paragraph")
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
            >
              Paragraf
            </button>

            <span className="w-px h-4 bg-border mx-1 shrink-0" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive("bold") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBold().run()}
            >
              <Bold className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive("italic") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleItalic().run()}
            >
              <Italic className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive("underline") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
            >
              <UnderlineIcon className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive("link") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={handleLink}
            >
              <LinkIcon className="h-3.5 w-3.5" />
            </Button>

            <span className="w-px h-4 bg-border mx-1 shrink-0" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive({ textAlign: "left" }) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().setTextAlign("left").run()}
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive({ textAlign: "center" }) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().setTextAlign("center").run()}
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive({ textAlign: "right" }) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().setTextAlign("right").run()}
            >
              <AlignRight className="h-3.5 w-3.5" />
            </Button>

            <span className="w-px h-4 bg-border mx-1 shrink-0" />

            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive("bulletList") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              title="Bullet list"
            >
              <List className="h-3.5 w-3.5" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className={cn(
                "h-7 w-7 shrink-0",
                editor?.isActive("orderedList") ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground",
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              title="Numbered list"
            >
              <ListOrdered className="h-3.5 w-3.5" />
            </Button>
            <button
              type="button"
              className={cn(
                "h-7 px-1 text-[10px] font-bold border border-border rounded transition-colors shrink-0 flex items-center justify-center gap-0.5",
                editor?.isActive("orderedList", { type: "a" }) ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent hover:text-foreground"
              )}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                if (editor?.isActive("orderedList", { type: "a" })) {
                  editor.chain().focus().toggleOrderedList().run();
                } else {
                  editor?.chain().focus().toggleOrderedList().updateAttributes("orderedList", { type: "a" }).run();
                }
              }}
              title="ABC list"
            >
              <ListOrdered className="h-3 w-3 shrink-0" />
              <span>a-b-c</span>
            </button>

            <span className="w-px h-4 bg-border mx-1 shrink-0" />

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
              className="h-7 w-7 text-muted-foreground hover:text-foreground shrink-0"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-3.5 w-3.5" />
            </Button>
          </div>

          {/* Tiptap Editor Content */}
          <div className="relative border border-t-0 border-border/70 rounded-b-md bg-muted/20">
            {editor && editor.isEmpty && (
              <div className="absolute left-3 top-2 text-muted-foreground/60 text-sm pointer-events-none select-none">
                Tulis balasan laporan di sini... (Sisipkan media tepat pada kursor)
              </div>
            )}
            <EditorContent
              editor={editor}
              className="min-h-[100px] max-h-48 overflow-y-auto w-full px-3 py-2 text-sm focus:outline-none select-text prose prose-sm max-w-none focus-within:ring-1 focus-within:ring-ring [&_.ProseMirror]:outline-none [&_.ProseMirror]:min-h-[84px] [&_.ProseMirror]:max-h-44"
            />
          </div>

          {/* Send Trigger */}
          <div className="flex justify-end shrink-0">
            <Button
              type="submit"
              disabled={!editorHtml.trim() || editorHtml === "<p></p>" || editorHtml === "<br>"}
              className="h-9 px-4 gap-1.5 font-medium text-xs rounded shadow-sm"
            >
              <Send className="h-3.5 w-3.5" />
              Kirim Balasan
            </Button>
          </div>
        </form>
      </footer>
    </div>
  );
}
