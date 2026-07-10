import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  ArrowLeft,
  Send,
  Paperclip,
  Smile,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  List,
  ChevronDown,
  Trash2,
  Mic,
  MoreVertical,
  Palette,
  EyeOff
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_admin/compose")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      type: (search.type as string) || "gmail",
    };
  },
  head: () => ({
    meta: [{ title: "Tulis Pesan Baru — Postmatic Admin" }],
  }),
  component: ComposePage,
});

function ComposePage() {
  const { type } = Route.useSearch();
  const navigate = useNavigate();
  
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [attachments, setAttachments] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = () => {
    if (!to.trim()) {
      toast.error("Tujuan penerima wajib diisi!");
      return;
    }
    if (!message.trim()) {
      toast.error("Isi pesan tidak boleh kosong!");
      return;
    }
    if (type === "gmail" && !subject.trim()) {
      toast.error("Subjek email wajib diisi!");
      return;
    }

    toast.success(`Pesan berhasil dikirim via ${type === "gmail" ? "Gmail" : type === "whatsapp" ? "WhatsApp" : "Report"}!`);
    navigate({ to: "/feedback", search: { tab: "Chat" } });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setAttachments((prev) => [...prev, ...files]);
      toast.success(`${files.length} file berhasil dilampirkan.`);
    }
  };

  const handleRemoveAttachment = (index: number) => {
    setAttachments((prev) => prev.filter((_, idx) => idx !== index));
  };

  const displayType = type === "gmail" ? "Gmail" : type === "whatsapp" ? "WhatsApp" : "Report";

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] bg-background rounded-xl border overflow-hidden shadow-sm">
      {/* Top Header Bar */}
      <header className="flex items-center justify-between px-4 py-3 border-b bg-card">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: "/feedback", search: { tab: "Chat" } })}
            className="hover:bg-muted h-8 w-8"
          >
            <ArrowLeft className="h-5 w-5 text-muted-foreground" />
          </Button>
          <span className="font-semibold text-foreground text-sm">Tulis Pesan ({displayType})</span>
        </div>
        <div className="flex items-center gap-1">
          {/* Attachment trigger */}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => fileInputRef.current?.click()}
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Paperclip className="h-4 w-4" />
          </Button>
          <input
            type="file"
            multiple
            ref={fileInputRef}
            className="hidden"
            onChange={handleFileChange}
          />
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Mic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <Smile className="h-4 w-4" />
          </Button>
          <Button
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-700 text-white gap-2 px-3 h-8 ml-2 text-xs font-semibold"
          >
            <Send className="h-3.5 w-3.5" /> Kirim
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground h-8 w-8"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </div>
      </header>

      {/* Main Form Fields Container */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto space-y-4 bg-card">
        {/* From Field */}
        <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-16 text-left">Dari</span>
            <span className="font-medium text-foreground">hayhasan.project@gmail.com</span>
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground/60 cursor-pointer" />
        </div>

        {/* Recipient Input (Kepada) */}
        <div className="flex items-center justify-between border-b pb-3 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 flex-1">
            <span className="w-16 text-left">Kepada</span>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder={type === "gmail" ? "contoh@email.com" : "+62 812-3456-7890"}
              className="border-none focus-visible:ring-0 p-0 h-auto bg-transparent text-foreground placeholder:text-muted-foreground/50 w-full text-sm font-normal"
            />
          </div>
          <ChevronDown className="h-4 w-4 text-muted-foreground/60 cursor-pointer" />
        </div>

        {/* Subject Input (Gmail-specific) */}
        {type === "gmail" && (
          <div className="flex items-center border-b pb-3 text-sm text-muted-foreground">
            <span className="w-16 text-left">Subjek</span>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Tambahkan subjek email"
              className="border-none focus-visible:ring-0 p-0 h-auto bg-transparent text-foreground placeholder:text-muted-foreground/50 w-full text-sm font-normal"
            />
          </div>
        )}

        {/* Attachment Files List */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 bg-muted/60 dark:bg-muted/30 px-3 py-1.5 rounded-lg border text-xs"
              >
                <Paperclip className="h-3 w-3 text-muted-foreground" />
                <span className="max-w-[200px] truncate font-medium text-foreground">{file.name}</span>
                <span className="text-[10px] text-muted-foreground">({(file.size / 1024).toFixed(1)} KB)</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRemoveAttachment(idx)}
                  className="h-4 w-4 text-muted-foreground hover:text-destructive hover:bg-transparent"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        )}

        {/* Message body Editor */}
        <div className="flex-1 flex flex-col pt-2">
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan Anda..."
            className="flex-1 border-none focus-visible:ring-0 p-0 resize-none bg-transparent text-foreground placeholder:text-muted-foreground/40 text-sm leading-relaxed min-h-[250px]"
          />
        </div>
      </div>

      {/* Formatting Textbar at the bottom */}
      <footer className="flex items-center gap-1 px-4 py-2 border-t bg-muted/30">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Bold className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Italic className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Underline className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <Palette className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <List className="h-4 w-4" />
        </Button>
        <div className="w-px h-5 bg-border mx-1" />
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
          <EyeOff className="h-4 w-4" />
        </Button>
      </footer>
    </div>
  );
}
