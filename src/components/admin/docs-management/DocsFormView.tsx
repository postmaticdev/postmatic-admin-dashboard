import React, { useState, useEffect } from "react";
import { DocItem } from "./types";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import TextAlign from "@tiptap/extension-text-align";
// Removed original Image and Youtube imports
import { Table } from "@tiptap/extension-table";
import { TableRow } from "@tiptap/extension-table-row";
import { TableCell } from "@tiptap/extension-table-cell";
import { TableHeader } from "@tiptap/extension-table-header";

import {
  CustomLink,
  CodeSnippetBoxNode,
  AdmonitionCardNode,
  CustomVideoNode,
  CustomImageNode,
  CustomYoutubeNode,
} from "./extensions/DocsCustomExtensions";
import { DocsMediaBubbleMenu } from "./DocsMediaBubbleMenu";

import { DocsEditorToolbar } from "./DocsEditorToolbar";
import { DocsEditorSidebarTools } from "./DocsEditorSidebarTools";
import {
  ArrowLeft,
  Save,
  Trash2,
  BookOpen,
  AlertTriangle,
  Tag,
  FileText,
  CheckCircle2,
  ChevronDown,
} from "lucide-react";
import {
  LucideIconPickerModal,
  renderLucideIcon,
} from "./LucideIconPickerModal";

interface DocsFormViewProps {
  initialDoc: DocItem | null; // null if create mode, DocItem if edit mode
  existingMenuLabels: string[];
  onSave: (docData: Omit<DocItem, "id" | "order" | "updatedAt">, id?: string) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function DocsFormView({
  initialDoc,
  existingMenuLabels,
  onSave,
  onCancel,
  onDelete,
}: DocsFormViewProps) {
  const isEditMode = Boolean(initialDoc);

  const [title, setTitle] = useState(initialDoc?.title || "");
  const [menuLabel, setMenuLabel] = useState(initialDoc?.menuLabel || "Getting Started");
  const [customMenuInput, setCustomMenuInput] = useState("");
  const [isCustomMenu, setIsCustomMenu] = useState(false);
  const [status, setStatus] = useState<"Published" | "Draft">(initialDoc?.status || "Published");

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(initialDoc?.icon || "FileText");
  const [iconModalOpen, setIconModalOpen] = useState(false);
  const [description, setDescription] = useState(initialDoc?.description || "");

  // Auto slug generation from title if in create mode
  const handleTitleChange = (val: string) => {
    setTitle(val);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Underline,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      CustomLink.configure({
        openOnClick: false,
      }),
      CustomImageNode,
      CustomYoutubeNode.configure({
        width: 640,
        height: 360,
      }),
      Table.configure({
        resizable: true,
      }),
      TableRow,
      TableHeader,
      TableCell,
      CodeSnippetBoxNode,
      AdmonitionCardNode,
      CustomVideoNode,
    ],
    content:
      initialDoc?.content ||
      `
      <h1>Judul Dokumentasi Baru</h1>
      <p>Mulai tulis konten panduan atau spesifikasi API di sini. Anda juga bisa menggunakan <strong>Tools Sidebar</strong> di sebelah kanan untuk menyisipkan blok kode, tabel, tombol CTA interaktif, serta admonition/callout box.</p>
    `,
    editorProps: {
      attributes: {
        class:
          "prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[420px] py-6 px-8 md:px-14 leading-relaxed",
      },
    },
  });

  // Sync editor content when initialDoc changes
  useEffect(() => {
    if (editor && initialDoc) {
      editor.commands.setContent(initialDoc.content);
    }
  }, [editor, initialDoc]);

  // Handle copy button click in code snippets
  useEffect(() => {
    const handleCopyClick = (e: MouseEvent) => {
      const btn = (e.target as HTMLElement).closest(".copy-code-icon-btn");
      if (!btn) return;
      const box = btn.closest(".code-snippet-box");
      if (!box) return;
      const codeEl = box.querySelector("pre code") || box.querySelector("pre");
      if (codeEl && codeEl.textContent) {
        navigator.clipboard.writeText(codeEl.textContent);
        const originalHtml = btn.innerHTML;
        btn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>`;
        setTimeout(() => {
          btn.innerHTML = originalHtml;
        }, 1500);
      }
    };
    document.addEventListener("click", handleCopyClick);
    return () => document.removeEventListener("click", handleCopyClick);
  }, []);

  const handleSaveForm = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!title.trim()) {
      alert("Harap masukkan Judul Dokumen!");
      return;
    }

    const finalMenuLabel = isCustomMenu
      ? customMenuInput.trim() || "Getting Started"
      : menuLabel;

    const contentHtml = editor?.getHTML() || "";

    onSave(
      {
        title,
        slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "untitled-doc",
        menuLabel: finalMenuLabel,
        description,
        content: contentHtml,
        status,
        author: "Admin",
        icon: selectedIcon,
      },
      initialDoc?.id
    );
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all shadow-xs"
            title="Kembali ke Daftar Dokumen"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                {isEditMode ? "Edit Dokumentasi" : "Buat Dokumentasi Baru"}
              </span>
              <span className="text-muted-foreground text-xs">•</span>
              <span className="text-xs font-mono text-muted-foreground">docs.postmatic.id</span>
            </div>
            <h1 className="text-lg font-bold text-foreground">
              {isEditMode ? title || "Edit Document" : "Buat Konten Dokumentasi Web"}
            </h1>
          </div>
        </div>

        {/* Top Right Action Buttons */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5 mr-2">
            <span className="text-xs font-semibold text-muted-foreground">Status:</span>
            <button
              type="button"
              onClick={() => setStatus(status === "Published" ? "Draft" : "Published")}
              className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors p-0.5 ${
                status === "Published" ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
                  status === "Published" ? "translate-x-4" : "translate-x-0"
                }`}
              />
            </button>
            <span className={`text-xs font-bold ${status === "Published" ? "text-primary" : "text-muted-foreground"}`}>
              {status}
            </span>
          </div>

          {isEditMode && onDelete && initialDoc && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold transition-all shadow-xs"
              title="Hapus Dokumen"
            >
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveForm}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-md shadow-primary/20"
          >
            <Save className="h-3.5 w-3.5" />
            Save Document
          </button>
        </div>
      </div>

      {/* Main Form 2-Column Layout: Grid 12 Columns */}
      <form onSubmit={handleSaveForm}>
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* KOLOM KIRI: 75% -> col-span-12 lg:col-span-9 */}
          <div className="col-span-12 lg:col-span-9 space-y-6">
            {/* Section Input Dasar */}
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-2 border-b border-border/60 pb-3">
                <FileText className="h-4 w-4 text-primary" />
                <h2 className="text-sm font-bold text-foreground">Informasi Dasar & Posisi Menu</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Judul Dokumen & Pilih Ikon */}
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                    Judul Dokumen & Ikon <span className="text-destructive">*</span>
                  </label>
                  <div className="flex items-center gap-2">
                    {/* Tombol Pilih Ikon Lucide */}
                    <button
                      type="button"
                      onClick={() => setIconModalOpen(true)}
                      className="flex items-center justify-center gap-1.5 h-[42px] px-3 rounded-xl border border-border bg-background hover:bg-muted text-foreground transition-all shadow-2xs shrink-0 group"
                      title="Pilih Ikon Dokumen dari Lucide"
                    >
                      {renderLucideIcon(
                        selectedIcon,
                        "h-5 w-5 text-primary group-hover:scale-110 transition-transform"
                      )}
                      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                    </button>

                    {/* Input Judul */}
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => handleTitleChange(e.target.value)}
                      placeholder="Misal: Otentikasi & Manajemen API Key"
                      className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                    />
                  </div>
                </div>

                {/* Deskripsi Dokumen */}
                <div className="space-y-1.5 md:col-span-3">
                  <label className="text-xs font-semibold text-foreground">
                    Deskripsi Singkat Dokumen
                  </label>
                  <input
                    type="text"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Masukkan ringkasan singkat isi dokumen..."
                    className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium"
                  />
                </div>

                {/* Nama Menu (Dropdown / Custom Input) */}
                <div className="space-y-1.5 md:col-span-3">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-foreground flex items-center gap-1">
                      <Tag className="h-3.5 w-3.5 text-muted-foreground" />
                      Nama Menu
                    </label>
                    <button
                      type="button"
                      onClick={() => setIsCustomMenu(!isCustomMenu)}
                      className="text-[11px] font-medium text-primary hover:underline"
                    >
                      {isCustomMenu ? "Pilih dari daftar" : "+ Nama menu baru"}
                    </button>
                  </div>

                  {!isCustomMenu ? (
                    <select
                      value={menuLabel}
                      onChange={(e) => setMenuLabel(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    >
                      {existingMenuLabels.map((item) => (
                        <option key={item} value={item}>
                          {item}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={customMenuInput}
                      onChange={(e) => setCustomMenuInput(e.target.value)}
                      placeholder="Ketik nama kategori menu baru..."
                      className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary font-medium"
                    />
                  )}
                </div>
              </div>
            </div>

            {/* Section Editor ("Deskripsi/Isi Docs") */}
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-border flex items-center justify-between bg-muted/20">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-primary" />
                  <span className="text-sm font-bold text-foreground">
                    Deskripsi / Isi Dokumen (Rich Text Editor)
                  </span>
                </div>
                <span className="text-xs text-muted-foreground">
                  Gunakan toolbar di bawah atau sisipkan elemen dari sidebar kanan
                </span>
              </div>

              {/* Toolbar Dasar */}
              <DocsEditorToolbar editor={editor} />
              
              {/* Bubble Menu Khusus Media (Image, Video, Youtube) */}
              <DocsMediaBubbleMenu editor={editor} />

              {/* Editor Content Area */}
              <div className="bg-white text-slate-900 min-h-[460px] rounded-b-2xl px-8 md:px-16 py-6">
                <EditorContent editor={editor} />
              </div>
            </div>
          </div>

          {/* KOLOM KANAN: 25% -> col-span-12 lg:col-span-3 */}
          <div className="col-span-12 lg:col-span-3 sticky top-6">
            <DocsEditorSidebarTools editor={editor} />
          </div>
        </div>
      </form>

      {/* Delete Confirmation Modal / Alert */}
      {deleteConfirmOpen && initialDoc && onDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/10">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-bold text-base text-foreground">Konfirmasi Hapus Dokumen</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>

            <p className="text-sm text-muted-foreground leading-relaxed">
              Apakah Anda yakin ingin menghapus dokumen{" "}
              <strong className="text-foreground">&quot;{initialDoc.title}&quot;</strong>? Dokumen yang
              dihapus tidak akan lagi muncul di portal <span className="font-mono text-xs">docs.postmatic.id</span>.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(false)}
                className="px-4 py-2 text-xs font-medium rounded-xl border border-border hover:bg-muted text-foreground transition-colors"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteConfirmOpen(false);
                  onDelete(initialDoc.id);
                }}
                className="px-5 py-2 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md transition-all"
              >
                Ya, Hapus Dokumen
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PILIH IKON LUCIDE */}
      <LucideIconPickerModal
        open={iconModalOpen}
        selectedIcon={selectedIcon}
        onSelect={(iconName) => setSelectedIcon(iconName)}
        onClose={() => setIconModalOpen(false)}
      />
    </div>
  );
}
