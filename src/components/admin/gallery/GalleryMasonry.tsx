import React, { useState, useEffect, useRef, useCallback } from "react";
import { GalleryImage } from "./types";
import { Search, Grid3X3, MoreHorizontal, Loader2 } from "lucide-react";

interface GalleryCardProps {
  image: GalleryImage;
  onClick: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}

// Truly memoized — no external state props that change every render
function GalleryCardInner({ image, onClick, onDelete }: GalleryCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Ultra-compressed thumbnail: w=200 q=50 → ~5-15KB per image
  const optimizedUrl = image.imageUrl.replace(/w=\d+&q=\d+/, "w=200&q=50");

  const handleMoreClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu((s) => !s);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(false);
    if (window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) {
      onDelete(image.id);
    }
  };

  // Close menu on outside click (scoped to this card only)
  useEffect(() => {
    if (!showMenu) return;
    const close = () => setShowMenu(false);
    document.addEventListener("click", close, { once: true });
    return () => document.removeEventListener("click", close);
  }, [showMenu]);

  return (
    <div
      className="relative overflow-hidden rounded-xl cursor-pointer gallery-card"
      style={{ breakInside: "avoid", marginBottom: "12px" }}
      onClick={() => onClick(image)}
    >
      <img
        src={optimizedUrl}
        alt={image.title}
        loading="lazy"
        decoding="async"
        onError={(e) => {
          (e.target as HTMLImageElement).src =
            "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=200&q=50";
        }}
        className="w-full h-auto block"
      />

      {/* Hover overlay — no transition, pure CSS :hover toggled via parent .gallery-card */}
      <div className="gallery-overlay" />

      {/* 3-dot menu — always rendered, visibility toggled by parent hover */}
      <div className="absolute top-2 right-2 z-10 gallery-menu-btn">
        <button
          type="button"
          onClick={handleMoreClick}
          className="p-1 rounded-full bg-white/90 text-gray-700"
        >
          <MoreHorizontal className="h-3 w-3" />
        </button>
        {showMenu && (
          <div className="absolute right-0 mt-1 w-24 bg-card border border-border rounded-xl shadow-lg py-1 z-50">
            <button
              type="button"
              onClick={handleDelete}
              className="w-full px-3 py-1.5 text-xs text-red-500 hover:bg-muted font-semibold text-left"
            >
              Hapus
            </button>
          </div>
        )}
      </div>

      {/* Bottom info — no transition */}
      <div className="gallery-info">
        <p className="text-white font-semibold text-xs leading-tight line-clamp-1">{image.title}</p>
        <span className="text-white/70 text-[10px]">{image.creatorName}</span>
      </div>
    </div>
  );
}

// Stable memo: no changing props from parent except stable callbacks
const GalleryCard = React.memo(GalleryCardInner);

interface GalleryMasonryProps {
  images: GalleryImage[];
  onImageClick: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function GalleryMasonry({ images, onImageClick, onDelete }: GalleryMasonryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [displayedImages, setDisplayedImages] = useState<GalleryImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const observerTarget = useRef<HTMLDivElement>(null);
  const loadCountRef = useRef(0);
  const isLoadingRef = useRef(false);
  const nextIndexRef = useRef(50);

  // Memoize filter to avoid re-creating on every render
  const filteredBase = React.useMemo(
    () =>
      images.filter(
        (img) =>
          img.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          img.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          img.creatorName.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    [searchQuery, images]
  );

  // Reset on search/images change
  useEffect(() => {
    loadCountRef.current = 0;
    isLoadingRef.current = false;
    nextIndexRef.current = Math.min(50, filteredBase.length);
    setIsLoading(false);
    setDisplayedImages(filteredBase.slice(0, 50));
  }, [filteredBase]);

  // Stable loadMore via useCallback + refs (no dependency on displayedImages)
  const loadMore = useCallback(() => {
    if (isLoadingRef.current || filteredBase.length === 0) return;
    isLoadingRef.current = true;
    setIsLoading(true);

    setTimeout(() => {
      loadCountRef.current += 1;
      const batchSize = 30;
      const nextIdx = nextIndexRef.current;
      let batch: GalleryImage[];

      if (nextIdx < filteredBase.length) {
        const remaining = filteredBase.slice(nextIdx, nextIdx + batchSize);
        if (remaining.length < batchSize) {
          const needed = batchSize - remaining.length;
          const extra = shuffleArray(filteredBase)
            .slice(0, needed)
            .map((img, idx) => ({
              ...img,
              id: `${img.id}-c${loadCountRef.current}-${idx}`,
            }));
          batch = [...remaining, ...extra];
        } else {
          batch = remaining;
        }
      } else {
        batch = shuffleArray(filteredBase)
          .slice(0, batchSize)
          .map((img, idx) => ({
            ...img,
            id: `${img.id}-c${loadCountRef.current}-${idx}`,
          }));
      }

      nextIndexRef.current += batchSize;
      setDisplayedImages((prev) => [...prev, ...batch]);
      isLoadingRef.current = false;
      setIsLoading(false);
    }, 600);
  }, [filteredBase]);

  // Stable observer — only recreated when loadMore changes (i.e., when filteredBase changes)
  useEffect(() => {
    const el = observerTarget.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px", threshold: 0 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore]);

  return (
    <div>
      {/* Sticky Header — no backdrop-blur to avoid scroll repaint */}
      <div className="sticky top-0 z-20 bg-background -mx-4 md:-mx-8 px-4 md:px-8 pt-4 pb-3 border-b border-border/30">
        <div className="rounded-2xl border border-border/70 bg-card px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1 rounded-full bg-violet-500/10 px-2 py-0.5 text-[11px] font-semibold text-violet-600 dark:text-violet-400">
                <Grid3X3 className="h-3 w-3" />Gallery
              </span>
              <span className="text-xs text-muted-foreground font-mono">Creator / Gallery</span>
            </div>
            <h1 className="text-xl font-bold text-foreground leading-tight">Creator Gallery</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Koleksi karya visual kreator Postmatic</p>
          </div>
          <div className="flex items-center gap-2 shrink-0 min-w-[240px]">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
              <input
                type="text"
                placeholder="Cari gambar, kreator, tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-xs bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/30 text-foreground"
              />
            </div>
            <span className="text-[10px] text-muted-foreground bg-muted/60 border border-border/40 px-2 py-1.5 rounded-lg whitespace-nowrap">
              {displayedImages.length} foto
            </span>
          </div>
        </div>
      </div>

      {/* CSS Multi-Column Masonry */}
      <div className="pt-4">
        {displayedImages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-muted-foreground">
            <Grid3X3 className="h-10 w-10 opacity-30" />
            <p className="text-sm">Tidak ada gambar ditemukan.</p>
          </div>
        ) : (
          <>
            <div className="columns-2 sm:columns-3 lg:columns-4 gap-3">
              {displayedImages.map((image) => (
                <GalleryCard
                  key={image.id}
                  image={image}
                  onClick={onImageClick}
                  onDelete={onDelete}
                />
              ))}
            </div>

            {/* Sentinel + loader */}
            <div ref={observerTarget} className="flex items-center justify-center h-16 mt-2">
              {isLoading && (
                <div className="flex items-center gap-2 text-xs text-violet-600 dark:text-violet-400 font-bold bg-violet-500/10 border border-violet-500/20 px-4 py-2 rounded-full">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Memuat karya baru...
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* Gallery-specific styles — CSS-only hover, zero JS transitions */}
      <style>{`
        .gallery-card .gallery-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.5);
          opacity: 0;
          pointer-events: none;
        }
        .gallery-card .gallery-menu-btn {
          opacity: 0;
          pointer-events: none;
        }
        .gallery-card .gallery-info {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          padding: 8px 10px;
          background: linear-gradient(to top, rgba(0,0,0,0.65), transparent);
          opacity: 0;
          pointer-events: none;
        }
        .gallery-card:hover .gallery-overlay,
        .gallery-card:hover .gallery-menu-btn,
        .gallery-card:hover .gallery-info {
          opacity: 1;
          pointer-events: auto;
        }
      `}</style>
    </div>
  );
}
