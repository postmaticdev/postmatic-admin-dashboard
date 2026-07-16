import React, { useState } from "react";
import { AIModelItem } from "./types";
import { ArrowLeft, Save, Trash2, AlertTriangle, Bot, Image, Type } from "lucide-react";

interface AIModelFormViewProps {
  initialItem: AIModelItem | null;
  modelType: "Image" | "Text";
  onSave: (data: Omit<AIModelItem, "id">, id?: string) => void;
  onCancel: () => void;
  onDelete?: (id: string) => void;
}

export function AIModelFormView({ initialItem, modelType, onSave, onCancel, onDelete }: AIModelFormViewProps) {
  const isEditMode = Boolean(initialItem);
  const [name, setName] = useState(initialItem?.name || "");
  const [logoUrl, setLogoUrl] = useState(initialItem?.logoUrl || "");
  const [source, setSource] = useState(initialItem?.source || "");
  const [temperature, setTemperature] = useState(initialItem?.temperature ?? 0.7);
  const [preprompt, setPreprompt] = useState(initialItem?.preprompt || "");
  const [status, setStatus] = useState<"Active" | "Inactive">(initialItem?.status || "Active");
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !source.trim()) {
      alert("Harap isi semua kolom wajib!");
      return;
    }
    onSave({ name, logoUrl, source, temperature, preprompt, status }, initialItem?.id);
  };

  const Icon = modelType === "Image" ? Image : Type;
  const typeLabel = modelType === "Image" ? "Image Model" : "Text Model";

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-card p-4 rounded-2xl border border-border/80 shadow-sm">
        <div className="flex items-center gap-3">
          <button type="button" onClick={onCancel} className="p-2 rounded-xl border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-primary">
              {isEditMode ? `Edit ${typeLabel}` : `Buat ${typeLabel} Baru`}
            </span>
            <h1 className="text-lg font-bold text-foreground">{isEditMode ? name || `Edit ${typeLabel}` : `Buat ${typeLabel} Baru`}</h1>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          {isEditMode && onDelete && initialItem && (
            <button type="button" onClick={() => setDeleteConfirmOpen(true)} className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-destructive/10 text-destructive hover:bg-destructive hover:text-destructive-foreground text-xs font-semibold transition-all">
              <Trash2 className="h-3.5 w-3.5" />Delete
            </button>
          )}
          <button type="button" onClick={handleSubmit} className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 text-xs font-semibold transition-all shadow-md shadow-primary/20">
            <Save className="h-3.5 w-3.5" />Simpan Model
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rounded-2xl border border-border bg-card p-6 shadow-sm space-y-6">
        <div className="flex items-center gap-2 border-b border-border/60 pb-3">
          <Icon className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-bold text-foreground">Detail {typeLabel}</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Nama Model <span className="text-destructive">*</span></label>
            <input type="text" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: GPT-4o" className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Sumber Model <span className="text-destructive">*</span></label>
            <input type="text" required value={source} onChange={(e) => setSource(e.target.value)} placeholder="Misal: OpenAI" className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium" />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">URL Logo</label>
            <input type="url" value={logoUrl} onChange={(e) => setLogoUrl(e.target.value)} placeholder="https://example.com/logo.png" className="w-full h-[42px] px-3.5 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium" />
            {logoUrl && (
              <div className="flex items-center gap-2 mt-1">
                <span className="text-xs text-muted-foreground">Preview:</span>
                <div className="h-8 w-8 rounded-lg border border-border bg-muted flex items-center justify-center overflow-hidden">
                  <img src={logoUrl} alt="Logo preview" className="h-6 w-6 object-contain" onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }} />
                </div>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Temperature <span className="text-muted-foreground font-normal">(0.0 – 2.0)</span></label>
            <div className="flex items-center gap-3">
              <input
                type="range"
                min={0}
                max={2}
                step={0.1}
                value={temperature}
                onChange={(e) => setTemperature(Number(e.target.value))}
                className="flex-1 h-2 rounded-lg appearance-none bg-muted accent-primary cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #3b82f6 0%, #3b82f6 ${(temperature / 2) * 100}%, rgb(203 213 225 / 0.3) ${(temperature / 2) * 100}%, rgb(203 213 225 / 0.3) 100%)`
                }}
              />
              <span className="w-10 text-sm font-bold text-center text-foreground">{temperature.toFixed(1)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground">
              <span>Deterministic</span><span>Creative</span>
            </div>
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-semibold text-foreground">Preprompt / System Instruction</label>
            <textarea
              value={preprompt}
              onChange={(e) => setPreprompt(e.target.value)}
              rows={4}
              placeholder="Masukkan instruksi sistem atau preprompt untuk model ini..."
              className="w-full px-3.5 py-3 text-sm bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all font-medium resize-none leading-relaxed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-foreground">Status</label>
            <div className="flex items-center gap-2 mt-2">
              <button type="button" onClick={() => setStatus(status === "Active" ? "Inactive" : "Active")} className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors p-0.5 ${status === "Active" ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <span className={`inline-block h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${status === "Active" ? "translate-x-4" : "translate-x-0"}`} />
              </button>
              <span className={`text-xs font-bold ${status === "Active" ? "text-primary" : "text-muted-foreground"}`}>{status}</span>
            </div>
          </div>
        </div>
      </form>

      {deleteConfirmOpen && initialItem && onDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-destructive">
              <div className="p-2.5 rounded-xl bg-destructive/10"><AlertTriangle className="h-6 w-6" /></div>
              <div>
                <h3 className="font-bold text-base text-foreground">Konfirmasi Hapus Model</h3>
                <p className="text-xs text-muted-foreground">Tindakan ini tidak dapat dibatalkan</p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">Apakah Anda yakin ingin menghapus model <strong className="text-foreground">"{initialItem.name}"</strong>?</p>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setDeleteConfirmOpen(false)} className="px-4 py-2 text-xs font-medium rounded-xl border border-border hover:bg-muted text-foreground transition-colors">Batal</button>
              <button type="button" onClick={() => { setDeleteConfirmOpen(false); onDelete(initialItem.id); }} className="px-5 py-2 text-xs font-semibold rounded-xl bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-md transition-all">Ya, Hapus</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
