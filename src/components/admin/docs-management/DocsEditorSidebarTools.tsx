import React, { useState } from "react";
import { Editor } from "@tiptap/react";
import {
  Code2,
  Table as TableIcon,
  MousePointerClick,
  AlertTriangle,
  Info,
  CheckCircle2,
  AlertOctagon,
  Sparkles,
  Plus,
  Minus,
} from "lucide-react";

interface DocsEditorSidebarToolsProps {
  editor: Editor | null;
}

export function DocsEditorSidebarTools({ editor }: DocsEditorSidebarToolsProps) {
  // 1. Code Snippet modal state
  const [codeModalOpen, setCodeModalOpen] = useState(false);
  const [codeFilename, setCodeFilename] = useState("welcome.ts");
  const [codeLanguage, setCodeLanguage] = useState("TYPESCRIPT");
  const [codeContent, setCodeContent] = useState(
    "async function sendWelcomeEmail(userEmail: string) {\n  const response = await client.emails.send({\n    to: userEmail,\n    template: 'welcome-id',\n    variables: {\n      name: 'Pengguna',\n      loginUrl: 'https://app.postmatic.id/login',\n    },\n  })\n\n  console.log('Email terkirim:', response.id)\n  return response\n}"
  );

  // 2. Table modal state
  const [tableModalOpen, setTableModalOpen] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);
  const [withHeader, setWithHeader] = useState(true);

  // 3. Button CTA modal state
  const [btnModalOpen, setBtnModalOpen] = useState(false);
  const [btnText, setBtnText] = useState("Lihat Dokumentasi API →");
  const [btnUrl, setBtnUrl] = useState("https://docs.postmatic.id/api");
  const [btnColor, setBtnColor] = useState<"blue" | "yellow" | "red" | "green" | "grey">("blue");

  // 4. Admonitions modal state
  const [admonitionModalOpen, setAdmonitionModalOpen] = useState(false);
  const [admType, setAdmType] = useState<"caution" | "warning" | "note" | "tip">("caution");
  const [admTitle, setAdmTitle] = useState("🚨 Caution — Bahaya / Peringatan Kritis");
  const [admContent, setAdmContent] = useState(
    "Perubahan pada parameter ini dapat mempengaruhi pengiriman pesan di lingkungan produksi. Harap verifikasi API Key sebelum mengeksekusi request."
  );

  if (!editor) {
    return null;
  }

  // 1. Insert Editable Code Snippet Box
  const handleInsertCodeSnippet = () => {
    const escapedCode = codeContent
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;");

    const html = `
      <div class="code-snippet-box" data-language="${codeLanguage}" data-filename="${codeFilename}">
        <pre><code>${escapedCode}</code></pre>
      </div>
      <p></p>
    `;
    editor.commands.insertContent(html);
    setCodeModalOpen(false);
  };

  // 2. Insert Table dengan jumlah Kolom & Baris kustom
  const handleInsertTable = () => {
    if (editor.can().insertTable({ rows: tableRows, cols: tableCols, withHeaderRow: withHeader })) {
      editor.commands.insertTable({
        rows: tableRows,
        cols: tableCols,
        withHeaderRow: withHeader,
      });
    }
    setTableModalOpen(false);
  };


  // 3. Insert Interactive Editable Button
  const handleInsertButton = () => {
    let bg = "#2563eb";
    let border = "#1d4ed8";
    let text = "#ffffff";
    let shadow = "rgba(37, 99, 235, 0.28)";

    if (btnColor === "yellow") {
      bg = "#eab308";
      border = "#ca8a04";
      text = "#ffffff";
      shadow = "rgba(234, 179, 8, 0.28)";
    } else if (btnColor === "red") {
      bg = "#ef4444";
      border = "#dc2626";
      text = "#ffffff";
      shadow = "rgba(239, 68, 68, 0.28)";
    } else if (btnColor === "green") {
      bg = "#22c55e";
      border = "#16a34a";
      text = "#ffffff";
      shadow = "rgba(34, 197, 94, 0.28)";
    } else if (btnColor === "grey") {
      bg = "#e2e8f0";
      border = "#cbd5e1";
      text = "#0f172a";
      shadow = "rgba(148, 163, 184, 0.12)";
    }

    const html = `<p style="margin: 12px 0;"><a href="${btnUrl}" target="_blank" rel="noopener noreferrer" class="docs-btn docs-btn-${btnColor}" style="display: inline-block; padding: 11px 24px; border-radius: 8px; font-weight: 600; font-size: 14px; border: 1px solid;">${btnText}</a></p>`;
    editor.commands.insertContent(html);
    setBtnModalOpen(false);
  };

  // 4. Insert Editable Admonition Card (Sesuai Lampiran)
  const handleInsertAdmonitionPreset = (
    type: "caution" | "warning" | "note" | "tip" | "info"
  ) => {
    const configs: Record<string, string> = {
      caution:
        "Selalu validasi signature webhook menggunakan secret key Anda untuk memastikan payload benar-benar berasal dari Postmatic.id.",
      warning:
        "Selalu validasi signature webhook menggunakan secret key Anda untuk memastikan payload benar-benar berasal dari Postmatic.id.",
      tip:
        "Gunakan template yang sudah dibuat di dashboard untuk memisahkan desain email dari logika aplikasi Anda.",
      note:
        "Postmatic.id tersedia dalam paket gratis hingga 1.000 email per bulan. Untuk volume lebih besar, lihat halaman harga.",
      info:
        "Postmatic.id tersedia dalam paket gratis hingga 1.000 email per bulan. Untuk volume lebih besar, lihat halaman harga.",
    };

    const text = configs[type] || configs.warning;
    const html = `<div class="admonition-card ${type}" data-type="${type}"><div class="adm-content"><p>${text}</p></div></div>`;
    editor.commands.insertContent(html);
  };

  const handleInsertCustomAdmonition = () => {
    const html = `<div class="admonition-card ${admType}" data-type="${admType}"><div class="adm-content"><p>${admContent}</p></div></div>`;
    editor.commands.insertContent(html);
    setAdmonitionModalOpen(false);
  };

  // 5. Insert Break / Garis Pemisah (Horizontal Rule)
  const handleInsertBreak = () => {
    editor.chain().focus().setHorizontalRule().run();
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Header Panel */}
      <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Sparkles className="h-4 w-4 text-primary" />
          <h3 className="font-semibold text-sm text-foreground">Tools / Insert Elements</h3>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          Klik tombol di bawah untuk menyisipkan elemen berformat yang <strong>langsung dapat diedit (editable)</strong> di dalam editor.
        </p>
      </div>

      {/* 1. Code Snippet Card */}
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <Code2 className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Code Snippet Box</h4>
            <p className="text-[11px] text-muted-foreground">Blok kode standar + editable</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setCodeModalOpen(true)}
          className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center gap-1.5"
        >
          <Code2 className="h-3.5 w-3.5" />
          Insert Code Snippet
        </button>
      </div>

      {/* 2. Table Card */}
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400">
            <TableIcon className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Tabel Dinamis</h4>
            <p className="text-[11px] text-muted-foreground">Pilih ukuran kolom/baris & edit</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setTableModalOpen(true)}
          className="w-full py-2 px-3 text-xs font-medium rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-600 hover:text-white transition-all flex items-center justify-center gap-1.5"
        >
          <TableIcon className="h-3.5 w-3.5" />
          Insert / Kustom Tabel...
        </button>
      </div>

      {/* 3. Interactive Button CTA Card */}
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
            <MousePointerClick className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-xs font-semibold text-foreground">Interactive Button CTA</h4>
            <p className="text-[11px] text-muted-foreground">Tombol CTA dengan pilihan warna</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setBtnModalOpen(true)}
          className="w-full py-2 px-3 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-all flex items-center justify-center gap-1.5 shadow-sm"
        >
          <MousePointerClick className="h-3.5 w-3.5" />
          Insert CTA Button
        </button>
      </div>

      {/* 4. Admonitions / Callout Card */}
      <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400">
              <AlertTriangle className="h-4 w-4" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-foreground">Admonition / Callout Card</h4>
              <p className="text-[11px] text-muted-foreground">Kartu peringatan standar docs</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAdmonitionModalOpen(true)}
            className="text-[11px] text-primary hover:underline font-medium"
          >
            Kustom...
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2 pt-1">
          <button
            type="button"
            onClick={() => handleInsertAdmonitionPreset("warning")}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white transition-all"
          >
            <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
            Peringatan
          </button>

          <button
            type="button"
            onClick={() => handleInsertAdmonitionPreset("tip")}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-amber-500/10 text-amber-600 dark:text-amber-400 hover:bg-amber-500 hover:text-white transition-all"
          >
            <CheckCircle2 className="h-3.5 w-3.5 shrink-0" />
            Tips
          </button>

          <button
            type="button"
            onClick={() => handleInsertAdmonitionPreset("info")}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-semibold bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500 hover:text-white transition-all"
          >
            <Info className="h-3.5 w-3.5 shrink-0" />
            Info
          </button>

          <button
            type="button"
            onClick={() => setAdmonitionModalOpen(true)}
            className="flex items-center gap-1.5 px-2.5 py-2 rounded-lg text-xs font-medium bg-muted text-muted-foreground hover:bg-primary hover:text-primary-foreground transition-all"
          >
            Kustom...
          </button>
        </div>
      </div>

      {/* MODAL 1: Code Snippet Modal */}
      {codeModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <Code2 className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Insert Standar Code Snippet</h3>
              </div>
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Nama File (misal: welcome.ts)
                  </label>
                  <input
                    type="text"
                    value={codeFilename}
                    onChange={(e) => setCodeFilename(e.target.value)}
                    placeholder="welcome.ts"
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-foreground block mb-1">
                    Label Bahasa (misal: TYPESCRIPT)
                  </label>
                  <input
                    type="text"
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    placeholder="TYPESCRIPT"
                    className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Isi Kode (Bisa langsung diedit setelah disisipkan ke editor)
                </label>
                <textarea
                  rows={8}
                  value={codeContent}
                  onChange={(e) => setCodeContent(e.target.value)}
                  className="w-full font-mono px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setCodeModalOpen(false)}
                className="px-4 py-2 text-xs text-muted-foreground hover:bg-muted rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertCodeSnippet}
                className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-sm"
              >
                Sisipkan Code Snippet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: Table Configuration Modal */}
      {tableModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <TableIcon className="h-5 w-5 text-purple-600" />
                <h3 className="font-bold text-sm text-foreground">Insert Tabel Spesifikasi</h3>
              </div>
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Jumlah Kolom (Columns)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTableCols(Math.max(1, tableCols - 1))}
                    className="p-2 rounded-lg border border-border hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={12}
                    value={tableCols}
                    onChange={(e) => setTableCols(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center px-3 py-2 text-sm bg-background border border-border rounded-lg font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setTableCols(tableCols + 1)}
                    className="p-2 rounded-lg border border-border hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Jumlah Baris (Rows)
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setTableRows(Math.max(1, tableRows - 1))}
                    className="p-2 rounded-lg border border-border hover:bg-muted"
                  >
                    <Minus className="h-4 w-4" />
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={tableRows}
                    onChange={(e) => setTableRows(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full text-center px-3 py-2 text-sm bg-background border border-border rounded-lg font-bold"
                  />
                  <button
                    type="button"
                    onClick={() => setTableRows(tableRows + 1)}
                    className="p-2 rounded-lg border border-border hover:bg-muted"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="headerCheck"
                  checked={withHeader}
                  onChange={(e) => setWithHeader(e.target.checked)}
                  className="rounded border-border text-primary focus:ring-primary"
                />
                <label htmlFor="headerCheck" className="text-xs font-medium text-foreground cursor-pointer">
                  Sertakan Baris Header (Header Row)
                </label>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setTableModalOpen(false)}
                className="px-4 py-2 text-xs text-muted-foreground hover:bg-muted rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertTable}
                className="px-5 py-2 text-xs font-semibold bg-purple-600 text-white rounded-xl hover:bg-purple-700 shadow-sm"
              >
                Sisipkan Tabel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: Interactive BLUE Button CTA Modal */}
      {btnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <MousePointerClick className="h-5 w-5 text-primary" />
                <h3 className="font-bold text-sm text-foreground">Kustomisasi Tombol (CTA Button)</h3>
              </div>
              <button
                type="button"
                onClick={() => setBtnModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Teks Tombol (Bisa diedit langsung setelah disisipkan)
                </label>
                <input
                  type="text"
                  value={btnText}
                  onChange={(e) => setBtnText(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  URL Tujuan (Hyperlink)
                </label>
                <input
                  type="url"
                  value={btnUrl}
                  onChange={(e) => setBtnUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1.5">
                  Warna Tombol
                </label>
                <div className="flex items-center gap-2">
                  {(["blue", "yellow", "red", "green", "grey"] as const).map((color) => {
                    const colorClasses: Record<string, string> = {
                      blue: "bg-blue-600 border-blue-700",
                      yellow: "bg-yellow-500 border-yellow-600",
                      red: "bg-red-500 border-red-600",
                      green: "bg-green-500 border-green-600",
                      grey: "bg-slate-200 border-slate-300 text-slate-800",
                    };
                    const isSelected = btnColor === color;
                    return (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setBtnColor(color)}
                        className={`w-7 h-7 rounded-full border-2 transition-all flex items-center justify-center capitalize ${
                          colorClasses[color]
                        } ${
                          isSelected ? "ring-2 ring-primary ring-offset-2 scale-110" : "opacity-80 hover:opacity-100"
                        }`}
                        title={color}
                      >
                        {isSelected && (
                          <span className={`w-1.5 h-1.5 rounded-full ${color === "grey" ? "bg-black" : "bg-white"}`} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setBtnModalOpen(false)}
                className="px-4 py-2 text-xs text-muted-foreground hover:bg-muted rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertButton}
                className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/95 shadow-md"
              >
                Sisipkan Tombol
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 4: Custom Admonition Card Modal */}
      {admonitionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <h3 className="font-bold text-sm text-foreground">Kustomisasi Admonition / Callout Card</h3>
              </div>
              <button
                type="button"
                onClick={() => setAdmonitionModalOpen(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Tutup
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Tipe Kartu Peringatan
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(["caution", "warning", "note", "tip"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setAdmType(t)}
                      className={`py-2 px-3 rounded-lg text-xs font-semibold capitalize border transition-all ${
                        admType === t
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border hover:bg-muted text-muted-foreground"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Judul Kartu (Title)
                </label>
                <input
                  type="text"
                  value={admTitle}
                  onChange={(e) => setAdmTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-foreground block mb-1">
                  Isi Catatan / Keterangan (Bisa langsung diedit setelah disisipkan)
                </label>
                <textarea
                  rows={3}
                  value={admContent}
                  onChange={(e) => setAdmContent(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setAdmonitionModalOpen(false)}
                className="px-4 py-2 text-xs text-muted-foreground hover:bg-muted rounded-xl"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={handleInsertCustomAdmonition}
                className="px-5 py-2 text-xs font-semibold bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 shadow-sm"
              >
                Sisipkan Kartu Callout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
