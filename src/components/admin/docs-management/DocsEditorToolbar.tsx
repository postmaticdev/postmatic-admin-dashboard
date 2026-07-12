import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Link as LinkIcon,
  Image as ImageIcon,
  Youtube,
  Undo,
  Redo,
  Type,
  Table as TableIcon,
  Columns,
  Rows,
  Plus,
  Minus,
  Trash2,
} from "lucide-react";

interface DocsEditorToolbarProps {
  editor: Editor | null;
}

export function DocsEditorToolbar({ editor }: DocsEditorToolbarProps) {
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");

  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [youtubeModalOpen, setYoutubeModalOpen] = useState(false);
  const [videoMode, setVideoMode] = useState<"upload" | "youtube">("upload");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [youtubeUrl, setYoutubeUrl] = useState("");

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl.trim()) {
      editor.chain().focus().extendMarkRange("link").setLink({ href: linkUrl }).run();
    } else {
      editor.chain().focus().unsetLink().run();
    }
    setLinkModalOpen(false);
    setLinkUrl("");
  };

  const addImage = () => {
    if (imageFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        editor.chain().focus().setImage({ src: base64 }).run();
      };
      reader.readAsDataURL(imageFile);
    }
    setImageModalOpen(false);
    setImageFile(null);
  };

  const addYoutube = () => {
    if (videoMode === "youtube" && youtubeUrl.trim()) {
      editor.chain().focus().setYoutubeVideo({ src: youtubeUrl }).run();
    } else if (videoMode === "upload" && videoFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const base64 = e.target?.result as string;
        editor.chain().focus().insertContent(`<video controls src="${base64}"></video><p></p>`).run();
      };
      reader.readAsDataURL(videoFile);
    }
    setYoutubeModalOpen(false);
    setYoutubeUrl("");
    setVideoFile(null);
  };

  const btnClass = (active = false) =>
    `p-1.5 rounded-md text-xs font-medium transition-all ${
      active
        ? "bg-primary text-primary-foreground shadow-sm"
        : "text-muted-foreground hover:text-foreground hover:bg-muted"
    }`;

  const isTableActive = editor.isActive("table");

  return (
    <div className="border-b border-border bg-muted/20 p-2 flex flex-col gap-2">
      {/* Main Toolbar Row */}
      <div className="flex flex-wrap items-center gap-1">
        {/* Undo / Redo */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            title="Undo"
          >
            <Undo className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted disabled:opacity-30"
            title="Redo"
          >
            <Redo className="h-4 w-4" />
          </button>
        </div>

        {/* Headings & Paragraph */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setParagraph().run()}
            className={btnClass(editor.isActive("paragraph"))}
            title="Paragraph"
          >
            <Type className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            className={btnClass(editor.isActive("heading", { level: 1 }))}
            title="Heading 1"
          >
            <Heading1 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            className={btnClass(editor.isActive("heading", { level: 2 }))}
            title="Heading 2"
          >
            <Heading2 className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            className={btnClass(editor.isActive("heading", { level: 3 }))}
            title="Heading 3"
          >
            <Heading3 className="h-4 w-4" />
          </button>
        </div>

        {/* Formatting: Bold, Italic, Underline, Strike */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={btnClass(editor.isActive("bold"))}
            title="Bold"
          >
            <Bold className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={btnClass(editor.isActive("italic"))}
            title="Italic"
          >
            <Italic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={btnClass(editor.isActive("underline"))}
            title="Underline"
          >
            <UnderlineIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={btnClass(editor.isActive("strike"))}
            title="Strikethrough"
          >
            <Strikethrough className="h-4 w-4" />
          </button>
        </div>

        {/* Alignments */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={btnClass(editor.isActive({ textAlign: "left" }))}
            title="Align Left"
          >
            <AlignLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={btnClass(editor.isActive({ textAlign: "center" }))}
            title="Align Center"
          >
            <AlignCenter className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={btnClass(editor.isActive({ textAlign: "right" }))}
            title="Align Right"
          >
            <AlignRight className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={btnClass(editor.isActive({ textAlign: "justify" }))}
            title="Justify"
          >
            <AlignJustify className="h-4 w-4" />
          </button>
        </div>

        {/* Lists */}
        <div className="flex items-center gap-0.5 border-r border-border/60 pr-1.5 mr-1">
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            className={btnClass(editor.isActive("bulletList"))}
            title="Bulleted List"
          >
            <List className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            className={btnClass(editor.isActive("orderedList"))}
            title="Numbered List"
          >
            <ListOrdered className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => editor.chain().focus().setHorizontalRule().run()}
            className={btnClass()}
            title="Break / Garis Pemisah (Horizontal Rule)"
          >
            <Minus className="h-4 w-4" />
          </button>
        </div>

        {/* Media & Embeds */}
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={() => {
              const previousUrl = editor.getAttributes("link").href;
              setLinkUrl(previousUrl || "");
              setLinkModalOpen(true);
            }}
            className={btnClass(editor.isActive("link"))}
            title="Hyperlink"
          >
            <LinkIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setImageModalOpen(true)}
            className={btnClass()}
            title="Insert Gambar"
          >
            <ImageIcon className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setYoutubeModalOpen(true)}
            className={btnClass()}
            title="Embed YouTube"
          >
            <Youtube className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Table Actions Sub-Toolbar (Muncul aktif saat kursor di dalam Tabel) */}
      {isTableActive && (
        <div
          className="flex flex-wrap items-center gap-1.5 pt-1.5 border-t border-border/60 bg-purple-500/5 px-2 py-1.5 rounded-lg"
          style={{ animation: "fadeIn 0.15s ease-in-out" }}
        >
          <div className="flex items-center gap-1 text-[11px] font-semibold text-purple-600 dark:text-purple-400 pr-2 border-r border-border/60">
            <TableIcon className="h-3.5 w-3.5" />
            <span>Table Controls:</span>
          </div>

          {/* Kolom Controls */}
          <div className="flex items-center gap-1 bg-background/80 border border-border/60 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().addColumnAfter().run()}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted rounded"
              title="Tambah Kolom (Add Column)"
            >
              <Columns className="h-3 w-3 text-purple-500" />
              <span>+ Kolom</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteColumn().run()}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10 rounded"
              title="Hapus Kolom (Delete Column)"
            >
              <Minus className="h-3 w-3" />
              <span>Kolom</span>
            </button>
          </div>

          {/* Baris Controls */}
          <div className="flex items-center gap-1 bg-background/80 border border-border/60 rounded-md p-0.5">
            <button
              type="button"
              onClick={() => editor.chain().focus().addRowAfter().run()}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-foreground hover:bg-muted rounded"
              title="Tambah Baris (Add Row)"
            >
              <Rows className="h-3 w-3 text-purple-500" />
              <span>+ Baris</span>
            </button>
            <button
              type="button"
              onClick={() => editor.chain().focus().deleteRow().run()}
              className="inline-flex items-center gap-1 px-2 py-1 text-[11px] font-medium text-destructive hover:bg-destructive/10 rounded"
              title="Hapus Baris (Delete Row)"
            >
              <Minus className="h-3 w-3" />
              <span>Baris</span>
            </button>
          </div>

          {/* Header & Delete Table */}
          <button
            type="button"
            onClick={() => editor.chain().focus().toggleHeaderRow().run()}
            className="px-2.5 py-1 text-[11px] font-medium bg-background/80 border border-border/60 hover:bg-muted rounded-md"
          >
            Toggle Header Row
          </button>

          <button
            type="button"
            onClick={() => editor.chain().focus().deleteTable().run()}
            className="inline-flex items-center gap-1 px-2.5 py-1 text-[11px] font-semibold text-destructive bg-destructive/10 hover:bg-destructive hover:text-white rounded-md ml-auto transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            Hapus Tabel
          </button>
        </div>
      )}

      {/* Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Insert / Edit Hyperlink</h3>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">URL / Link Tujuan</label>
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://docs.postmatic.id/api"
                className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setLinkModalOpen(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={addLink}
                className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90"
              >
                Terapkan Link
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {imageModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Upload Gambar</h3>
            <div>
              <label className="text-xs text-muted-foreground block mb-1">Pilih File Gambar</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    setImageFile(e.target.files[0]);
                  }
                }}
                className="w-full text-sm text-foreground bg-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
              />
            </div>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setImageModalOpen(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={addImage}
                disabled={!imageFile}
                className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Upload Gambar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube / Video Modal */}
      {youtubeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-xl p-5 w-full max-w-sm shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-foreground">Insert Video</h3>
            
            <div className="flex bg-muted p-1 rounded-lg">
              <button 
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${videoMode === "upload" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setVideoMode("upload")}
              >
                Upload Video
              </button>
              <button 
                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-colors ${videoMode === "youtube" ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}
                onClick={() => setVideoMode("youtube")}
              >
                Link YouTube
              </button>
            </div>

            {videoMode === "upload" ? (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">Pilih File Video Lokal</label>
                <input
                  type="file"
                  accept="video/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setVideoFile(e.target.files[0]);
                    }
                  }}
                  className="w-full text-sm text-foreground bg-background file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                />
              </div>
            ) : (
              <div>
                <label className="text-xs text-muted-foreground block mb-1">URL Video YouTube</label>
                <input
                  type="url"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  placeholder="https://www.youtube.com/watch?v=..."
                  className="w-full px-3 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            )}

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setYoutubeModalOpen(false)}
                className="px-3 py-1.5 text-xs text-muted-foreground hover:bg-muted rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={addYoutube}
                disabled={(videoMode === "upload" && !videoFile) || (videoMode === "youtube" && !youtubeUrl.trim())}
                className="px-4 py-1.5 text-xs font-semibold bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Sisipkan Video
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
