import { useState, useRef, useEffect } from "react";
import {
  ArrowLeft,
  ChevronDown,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link as LinkIcon,
  Paperclip,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTickets } from "@/contexts/TicketsContext";
import type { TicketMessage } from "@/lib/types/ticket";

interface Props {
  onCancel: () => void;
  onSent: (newTicketId: string) => void;
  replyToData?: { to: string; subject: string; ticketId: string } | null;
}

export function GmailComposer({ onCancel, onSent, replyToData }: Props) {
  const { createTicket, addMessage, getDraft, setDraft } = useTickets();
  const draftKey = `gmail-compose-${replyToData?.ticketId || "new"}`;

  const [to, setTo] = useState(replyToData?.to ?? "");
  const [subject, setSubject] = useState(replyToData?.subject ?? "");
  const [bodyHtml, setBodyHtml] = useState("");
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const execCommand = (command: string, value: string = "") => {
    document.execCommand(command, false, value);
    if (editorRef.current) {
      handleEditorInput(editorRef.current.innerHTML);
    }
  };

  const insertHtmlAtCursor = (html: string) => {
    const sel = window.getSelection();
    if (sel && sel.getRangeAt && sel.rangeCount) {
      const range = sel.getRangeAt(0);
      range.deleteContents();
      const el = document.createElement("div");
      el.innerHTML = html;
      const frag = document.createDocumentFragment();
      let node;
      let lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);
      if (lastNode) {
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    } else if (editorRef.current) {
      editorRef.current.innerHTML += html;
    }
    if (editorRef.current) {
      handleEditorInput(editorRef.current.innerHTML);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

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

          insertHtmlAtCursor(htmlToInsert);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const execListCommand = (listType: "bullet" | "number" | "abc") => {
    if (listType === "bullet") {
      execCommand("insertUnorderedList");
    } else if (listType === "number") {
      execCommand("insertOrderedList");
    } else if (listType === "abc") {
      execCommand("insertOrderedList");
      const sel = window.getSelection();
      if (sel && sel.anchorNode) {
        const parentOl = sel.anchorNode.parentElement?.closest("ol");
        if (parentOl) {
          parentOl.setAttribute("type", "a");
        } else if (editorRef.current) {
          const ols = editorRef.current.getElementsByTagName("ol");
          if (ols.length > 0) {
            ols[ols.length - 1].setAttribute("type", "a");
          }
        }
      }
    }
  };

  const handleLink = () => {
    const url = prompt("Masukkan URL:");
    if (url) {
      execCommand("createLink", url);
    }
  };

  // Load draft when replyToData or component mounts
  useEffect(() => {
    const saved = getDraft(draftKey);
    if (saved) {
      setTo(saved.to || replyToData?.to || "");
      setSubject(saved.subject || replyToData?.subject || "");
      setBodyHtml(saved.body || "");
      if (editorRef.current) {
        editorRef.current.innerHTML = saved.body || "";
      }
    } else {
      setTo(replyToData?.to ?? "");
      setSubject(replyToData?.subject ?? "");
      setBodyHtml("");
      if (editorRef.current) {
        editorRef.current.innerHTML = "";
      }
    }
  }, [replyToData, getDraft, draftKey]);

  const saveDraft = (newTo: string, newSub: string, newBody: string) => {
    if (newTo.trim() || newSub.trim() || (newBody && newBody !== "<br>")) {
      setDraft(draftKey, { to: newTo, subject: newSub, body: newBody });
    } else {
      setDraft(draftKey, null);
    }
  };

  const handleToChange = (val: string) => {
    setTo(val);
    saveDraft(val, subject, bodyHtml);
  };

  const handleSubjectChange = (val: string) => {
    setSubject(val);
    saveDraft(to, val, bodyHtml);
  };

  const handleEditorInput = (html: string) => {
    setBodyHtml(html);
    saveDraft(to, subject, html);
  };



  const handleSend = () => {
    if (!to.trim() || !subject.trim() || !bodyHtml.trim() || bodyHtml === "<br>") return;

    if (replyToData?.ticketId) {
      addMessage(replyToData.ticketId, {
        authorId: "cs-agent",
        authorName: "CS Postmatic",
        content: bodyHtml.trim(),
        direction: "out",
      });
      onSent(replyToData.ticketId);
    } else {
      // Create new thread
      const namePart = to.split("@")[0];
      const senderName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

      const firstMsg: Omit<TicketMessage, "id" | "createdAt"> = {
        authorId: "cs-agent",
        authorName: "CS Postmatic",
        content: bodyHtml.trim(),
        direction: "out",
      };

      const newTicket = createTicket({
        source: "gmail",
        senderName,
        senderHandle: to.trim(),
        subject: subject.trim(),
        snippet: bodyHtml.replace(/<[^>]*>/g, " ").trim().substring(0, 100),
        messages: [
          {
            id: `m-${Date.now()}`,
            ...firstMsg,
            createdAt: new Date().toISOString(),
          },
        ],
      });

      onSent(newTicket.id);
    }

    setDraft(draftKey, null);
  };

  const isFormValid = to.trim() && subject.trim() && bodyHtml.trim() && bodyHtml !== "<br>";

  return (
    <div className="flex h-full min-h-0 flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border bg-card px-4 py-2.5 shrink-0">
        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onCancel}
            className="h-9 w-9 text-muted-foreground hover:text-foreground rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </div>

        <div className="flex items-center shrink-0">
          <Button
            type="button"
            onClick={handleSend}
            disabled={!isFormValid}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-1.5 h-8 text-xs rounded transition-colors disabled:opacity-50 shrink-0"
          >
            Send
          </Button>
        </div>
      </header>

      {/* Inputs Form */}
      <div className="flex flex-col border-b border-border bg-card shrink-0">
        {/* From Field */}
        <div className="flex items-center justify-between px-6 py-3 border-b border-border/60">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-muted-foreground w-12">Dari</span>
            <span className="text-sm font-medium text-foreground">hayhasan.project@gmail.com</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>

        {/* To Field */}
        <div className="flex items-center justify-between px-6 py-2.5 border-b border-border/60">
          <div className="flex items-center gap-3 flex-1">
            <span className="text-sm text-muted-foreground w-12">Kepada</span>
            <Input
              value={to}
              onChange={(e) => handleToChange(e.target.value)}
              placeholder="Alamat email penerima"
              className="border-0 bg-transparent p-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 flex-1"
            />
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground cursor-pointer" />
        </div>

        {/* Subject Field */}
        <div className="flex items-center px-6 py-2.5">
          <span className="text-sm text-muted-foreground w-12">Subjek</span>
          <Input
            value={subject}
            onChange={(e) => handleSubjectChange(e.target.value)}
            placeholder="Subjek email"
            className="border-0 bg-transparent p-0 h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-muted-foreground/50 flex-1"
          />
        </div>
      </div>

      {/* Message Body Rich Editor */}
      <div className="flex-1 bg-card px-6 py-4 flex flex-col overflow-y-auto">
        <div
          ref={editorRef}
          contentEditable
          onInput={(e) => handleEditorInput(e.currentTarget.innerHTML)}
          onBlur={(e) => handleEditorInput(e.currentTarget.innerHTML)}
          data-placeholder="Tulis email..."
          className="w-full flex-1 bg-transparent border-0 resize-none text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:ring-0 select-text min-h-[200px]
            empty:before:content-[attr(data-placeholder)] empty:before:text-muted-foreground/60 empty:before:pointer-events-none
            prose dark:prose-invert max-w-none
            [&_h1]:text-lg [&_h1]:font-bold [&_h1]:mt-2 [&_h1]:mb-1
            [&_h2]:text-base [&_h2]:font-bold [&_h2]:mt-2 [&_h2]:mb-1
            [&_h3]:text-sm [&_h3]:font-bold [&_h3]:mt-1 [&_h3]:mb-1
            [&_p]:mb-1"
        />
      </div>

      {/* Formatting Toolbar */}
      <div className="flex items-center gap-1 border-t border-border bg-card px-4 py-2 shrink-0 overflow-x-auto">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("formatBlock", "<h1>")}
          className="h-7 px-2 text-xs font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          H1
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("formatBlock", "<h2>")}
          className="h-7 px-2 text-xs font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          H2
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("formatBlock", "<h3>")}
          className="h-7 px-2 text-xs font-bold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          H3
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("formatBlock", "<p>")}
          className="h-7 px-2 text-xs font-semibold hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0"
        >
          Paragraf
        </button>

        <span className="w-px h-4 bg-border mx-1 shrink-0" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("bold")}
          className="h-8 w-8 text-muted-foreground"
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("italic")}
          className="h-8 w-8 text-muted-foreground"
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("underline")}
          className="h-8 w-8 text-muted-foreground"
        >
          <Underline className="h-4 w-4" />
        </Button>


        <span className="w-px h-4 bg-border mx-1 shrink-0" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={handleLink}
          className="h-8 w-8 text-muted-foreground"
        >
          <LinkIcon className="h-4 w-4" />
        </Button>

        <span className="w-px h-4 bg-border mx-1 shrink-0" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyLeft")}
          className="h-8 w-8 text-muted-foreground"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyCenter")}
          className="h-8 w-8 text-muted-foreground"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execCommand("justifyRight")}
          className="h-8 w-8 text-muted-foreground"
        >
          <AlignRight className="h-4 w-4" />
        </Button>

        <span className="w-px h-4 bg-border mx-1 shrink-0" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execListCommand("bullet")}
          className="h-8 w-8 text-muted-foreground"
          title="Bullet list"
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execListCommand("number")}
          className="h-8 w-8 text-muted-foreground"
          title="Numbered list"
        >
          <ListOrdered className="h-4 w-4" />
        </Button>
        <button
          type="button"
          className="h-8 px-1.5 text-[10px] font-bold border border-border hover:bg-accent rounded text-muted-foreground hover:text-foreground transition-colors shrink-0 flex items-center justify-center gap-0.5"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => execListCommand("abc")}
          title="ABC list"
        >
          <ListOrdered className="h-3.5 w-3.5 shrink-0" />
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
          className="h-8 w-8 text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => fileInputRef.current?.click()}
        >
          <Paperclip className="h-4 w-4" />
        </Button>


      </div>
    </div>
  );
}
