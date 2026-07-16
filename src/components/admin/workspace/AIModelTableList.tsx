import React, { useState } from "react";
import { AIModelItem } from "./types";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Plus, Edit3, Search, Bot, CheckCircle2, Clock, GripVertical, X } from "lucide-react";

interface AIModelTableListProps {
  items: AIModelItem[];
  modelType: "Image" | "Text";
  onCreateNew: () => void;
  onEdit: (item: AIModelItem) => void;
  onToggleStatus: (id: string) => void;
  onReorder: (newItems: AIModelItem[]) => void;
}

function SortableRow({
  item,
  index,
  modelType,
  onEdit,
  onToggleStatus,
  onRowClick,
}: {
  item: AIModelItem;
  index: number;
  modelType: "Image" | "Text";
  onEdit: (item: AIModelItem) => void;
  onToggleStatus: (id: string) => void;
  onRowClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
  };

  return (
    <tr
      ref={setNodeRef}
      style={style}
      onClick={onRowClick}
      className={`group transition-colors border-b border-border/60 cursor-pointer ${
        isDragging ? "bg-primary/5 shadow-lg scale-[1.006]" : "hover:bg-muted/40 bg-card"
      }`}
    >
      <td className="w-12 py-4 pl-4 text-center" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          {...attributes}
          {...listeners}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-md cursor-grab active:cursor-grabbing transition-colors focus:outline-none"
          title="Drag untuk memindahkan urutan"
        >
          <GripVertical className="h-4 w-4 mx-auto" />
        </button>
      </td>
      <td className="py-4 px-3 whitespace-nowrap">
        {modelType === "Image" ? (
          index === 0 ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-500/20">
              Default
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
              #{index + 1}
            </span>
          )
        ) : (
          index === 0 ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
              Primary
            </span>
          ) : index === 1 ? (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-500/10 text-slate-600 dark:text-slate-400 border border-slate-500/20">
              Secondary
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-muted text-muted-foreground border border-border">
              #{index + 1}
            </span>
          )
        )}
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
            {item.logoUrl ? (
              <img
                src={item.logoUrl}
                alt={item.name}
                className="h-7 w-7 object-contain"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = "none";
                }}
              />
            ) : (
              <Bot className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
          <span className="font-semibold text-sm text-foreground group-hover:text-primary transition-colors">
            {item.name}
          </span>
        </div>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="text-xs text-muted-foreground">{item.source}</span>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
          {item.temperature}
        </span>
      </td>
      <td className="py-4 px-4 max-w-[260px]">
        <p className="text-xs text-muted-foreground truncate" title={item.preprompt}>
          {item.preprompt || "—"}
        </p>
      </td>
      <td className="py-4 px-4 whitespace-nowrap">
        {item.status === "Active" ? (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
            <CheckCircle2 className="h-3 w-3" />Active
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
            <Clock className="h-3 w-3" />Inactive
          </span>
        )}
      </td>
      <td className="py-4 pr-4 pl-3 text-right whitespace-nowrap" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => onEdit(item)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all duration-150 shadow-sm"
          >
            <Edit3 className="h-3.5 w-3.5" />Edit
          </button>
          <button
            type="button"
            onClick={() => onToggleStatus(item.id)}
            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/40 ${
              item.status === "Active" ? "bg-emerald-500" : "bg-muted-foreground/30"
            }`}
          >
            <span
              className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${
                item.status === "Active" ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </td>
    </tr>
  );
}

export function AIModelTableList({
  items,
  modelType,
  onCreateNew,
  onEdit,
  onToggleStatus,
  onReorder,
}: AIModelTableListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedModel, setSelectedModel] = useState<AIModelItem | null>(null);
  const filtered = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.source.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      
      const newItems = [...items];
      const [removed] = newItems.splice(oldIndex, 1);
      newItems.splice(newIndex, 0, removed);
      
      onReorder(newItems);
    }
  };

  const iconColor = modelType === "Image" ? "text-violet-500" : "text-sky-500";
  const bgGrad = modelType === "Image" ? "to-violet-500/5" : "to-sky-500/5";

  return (
    <div className="space-y-6">
      <div className={`relative overflow-hidden rounded-2xl border border-border/80 bg-gradient-to-r from-card via-card ${bgGrad} p-6 shadow-sm`}>
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold ${iconColor}`}>
                <Bot className="h-3.5 w-3.5" />AI Model
              </span>
              <span className="text-xs text-muted-foreground font-mono">Workspace / AI Model / {modelType}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">{modelType} Model Manager</h1>
            <p className="text-sm text-muted-foreground max-w-2xl">
              Kelola model AI {modelType === "Image" ? "pembuat gambar" : "bahasa teks"} untuk platform Postmatic.
            </p>
          </div>
          <button
            type="button"
            onClick={onCreateNew}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-lg shadow-primary/20 hover:bg-primary/90 active:scale-[0.98] transition-all"
          >
            <Plus className="h-4 w-4" />Create Model
          </button>
        </div>
      </div>

      <div className="flex items-center gap-3 bg-card p-4 rounded-xl border border-border/60 shadow-sm">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Cari nama model atau sumber..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary transition-all"
          />
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-muted/40 text-xs font-semibold text-muted-foreground">
                <th className="w-12 py-3 pl-4 text-center">Urutan</th>
                <th className="py-3 px-3">Label</th>
                <th className="py-3 px-4">Logo & Nama Model</th>
                <th className="py-3 px-4">Sumber Model</th>
                <th className="py-3 px-4">Temperature</th>
                <th className="py-3 px-4">Preprompt</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 pr-4 pl-3 text-right">Action</th>
              </tr>
            </thead>
            <SortableContext items={filtered.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-muted-foreground">
                      <div className="flex flex-col items-center gap-2">
                        <Bot className="h-8 w-8 text-muted-foreground/50" />
                        <p className="text-sm font-medium">Tidak ada model yang ditemukan.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filtered.map((item, idx) => (
                    <SortableRow 
                      key={item.id} 
                      item={item} 
                      index={idx} 
                      modelType={modelType} 
                      onEdit={onEdit} 
                      onToggleStatus={onToggleStatus} 
                      onRowClick={() => setSelectedModel(item)}
                    />
                  ))
                )}
              </tbody>
            </SortableContext>
          </table>
        </DndContext>
        <div className="px-4 py-3 bg-muted/20 border-t border-border/40 text-xs text-muted-foreground">
          Menampilkan <strong>{filtered.length}</strong> dari <strong>{items.length}</strong> model
        </div>
      </div>
      {/* AI Model Detail Modal */}
      {selectedModel && (
        <AIModelDetailModal
          item={selectedModel}
          modelType={modelType}
          onClose={() => setSelectedModel(null)}
          onEdit={() => { onEdit(selectedModel); setSelectedModel(null); }}
        />
      )}
    </div>
  );
}

function AIModelDetailModal({
  item,
  modelType,
  onClose,
  onEdit,
}: {
  item: AIModelItem;
  modelType: "Image" | "Text";
  onClose: () => void;
  onEdit: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="h-20 bg-gradient-to-br from-violet-500/20 via-violet-500/10 to-transparent" />
        
        <button
          type="button"
          onClick={onClose}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-black/10 hover:bg-black/25 text-white transition-colors"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="px-6 pb-6 pt-6 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-xl border border-border bg-muted flex items-center justify-center overflow-hidden shrink-0">
              {item.logoUrl ? (
                <img src={item.logoUrl} alt={item.name} className="h-9 w-9 object-contain" />
              ) : (
                <Bot className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
            <div className="text-left">
              <h3 className="text-base font-bold text-foreground leading-tight">{item.name}</h3>
              <span className="text-[10px] text-muted-foreground mt-0.5 block">{modelType} AI Model &bull; {item.source}</span>
            </div>
          </div>

          <div className="border-t border-border/60 pt-4 space-y-3">
            {/* Temperature Slider with blue tail */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-muted-foreground">Temperature</span>
                <span className="text-primary font-bold">{item.temperature}</span>
              </div>
              <div className="relative h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="absolute top-0 left-0 h-full bg-blue-500 transition-all duration-300"
                  style={{ width: `${item.temperature * 100}%` }}
                />
              </div>
              <p className="text-[9px] text-muted-foreground">Kreativitas dan variasi respon model</p>
            </div>

            <div className="space-y-1.5 border-t border-border/40 pt-3 text-left">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide block">Pre-prompt / System Instruction</span>
              <div className="max-h-[120px] overflow-y-auto p-3 rounded-xl border border-border bg-muted/40 text-xs text-foreground leading-relaxed whitespace-pre-line font-medium shadow-inner">
                {item.preprompt || "Tidak ada pre-prompt yang dikonfigurasi..."}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs border-t border-border/40 pt-3 text-muted-foreground">
            <span>Status</span>
            {item.status === "Active" ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md">
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-600 dark:text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-md">
                Inactive
              </span>
            )}
          </div>

          <div className="flex gap-2 pt-2 border-t border-border/40">
            <button
              type="button"
              onClick={onEdit}
              className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-semibold shadow-md shadow-primary/20 hover:bg-primary/90 transition-all"
            >
              <Edit3 className="h-3.5 w-3.5" />Edit Model
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-border bg-muted text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
            >
              Tutup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
