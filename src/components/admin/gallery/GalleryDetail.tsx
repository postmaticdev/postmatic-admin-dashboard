import React, { useState } from "react";
import { GalleryImage } from "./types";
import {
  ArrowLeft,
  Heart,
  MoreHorizontal,
  Calendar,
  User,
  Tag,
  ZoomIn,
} from "lucide-react";

interface GalleryDetailProps {
  image: GalleryImage;
  allImages: GalleryImage[];
  onBack: () => void;
  onImageClick: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}

export function GalleryDetail({ image, allImages, onBack, onImageClick, onDelete }: GalleryDetailProps) {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(image.likes);
  const [fullscreen, setFullscreen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const relatedImages = allImages.filter((img) => img.id !== image.id).slice(0, 9);

  const handleLike = () => {
    setLiked(!liked);
    setLikeCount((prev) => (liked ? prev - 1 : prev + 1));
  };

  const handleDelete = () => {
    if (window.confirm("Apakah Anda yakin ingin menghapus foto ini?")) {
      onDelete(image.id);
    }
    setShowDropdown(false);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-card hover:bg-muted text-sm font-medium text-foreground transition-all"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke Gallery
        </button>
        <span className="text-xs text-muted-foreground font-mono">Creator / Gallery / {image.title}</span>
      </div>

      {/* Main content */}
      <div className="grid grid-cols-1 lg:grid-cols-[auto_380px] gap-6 items-start">
        {/* Image panel */}
        <div className="space-y-4">
          <div className="relative group overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
            <img
              src={image.imageUrl}
              alt={image.title}
              className="w-full object-contain max-h-[600px] rounded-2xl"
            />
            {/* Fullscreen button */}
            <button
              type="button"
              onClick={() => setFullscreen(true)}
              className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-black/50 backdrop-blur-sm text-white hover:bg-black/70 transition-all opacity-0 group-hover:opacity-100"
            >
              <ZoomIn className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Info Panel */}
        <div className="space-y-5 lg:sticky lg:top-6">
          {/* Action Bar */}
          <div className="flex items-center justify-between bg-card border border-border/70 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLike}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                  liked
                    ? "bg-red-500/15 text-red-500 hover:bg-red-500/20"
                    : "bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${liked ? "fill-current" : ""}`} />
                {likeCount}
              </button>
              
              {/* More Actions Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowDropdown(!showDropdown)}
                  className="p-2 rounded-xl bg-muted text-muted-foreground hover:text-foreground hover:bg-muted/80 transition-all"
                >
                  <MoreHorizontal className="h-3.5 w-3.5" />
                </button>
                {showDropdown && (
                  <div className="absolute left-0 mt-2 z-10 w-28 bg-card border border-border rounded-xl shadow-lg py-1">
                    <button
                      type="button"
                      onClick={handleDelete}
                      className="w-full px-3 py-1.5 text-xs text-red-500 hover:bg-muted font-semibold text-left transition-colors"
                    >
                      Hapus
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Creator Info */}
          <div className="bg-card border border-border/70 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src={image.creatorAvatar}
                  alt={image.creatorName}
                  className="h-10 w-10 rounded-full border-2 border-primary/20 bg-muted"
                />
                <div>
                  <p className="text-sm font-bold text-foreground">{image.creatorName}</p>
                  <p className="text-xs text-muted-foreground">Creator</p>
                </div>
              </div>
              <button type="button" className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary hover:bg-primary hover:text-primary-foreground transition-all">
                Follow
              </button>
            </div>

            <div className="border-t border-border/60 pt-4 space-y-3">
              <h2 className="text-base font-bold text-foreground leading-tight">{image.title}</h2>
              <p className="text-sm text-muted-foreground leading-relaxed">{image.description}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Calendar className="h-3.5 w-3.5 text-primary" />
                <span>{new Date(image.createdAt).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <User className="h-3.5 w-3.5 text-primary" />
                <span>{image.creatorName}</span>
              </div>
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <Tag className="h-3.5 w-3.5 text-primary mt-0.5" />
                <div className="flex flex-wrap gap-1">
                  {image.tags.map((tag) => (
                    <span key={tag} className="bg-muted px-2 py-0.5 rounded-full font-medium hover:bg-primary/10 hover:text-primary cursor-pointer transition-colors">
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 border-t border-border/60 pt-3">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Heart className="h-3.5 w-3.5 text-red-500 fill-current" />{likeCount} suka
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Related images */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-foreground">Gambar Lainnya</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {relatedImages.map((img) => (
            <div
              key={img.id}
              className="relative overflow-hidden rounded-xl cursor-pointer group aspect-square bg-muted"
              onClick={() => onImageClick(img)}
            >
              <img
                src={img.imageUrl}
                alt={img.title}
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all duration-300 flex items-end p-2 opacity-0 group-hover:opacity-100">
                <p className="text-white text-[10px] font-semibold line-clamp-2">{img.title}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Fullscreen modal */}
      {fullscreen && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setFullscreen(false)}
        >
          <button type="button" className="absolute top-4 right-4 text-white/80 hover:text-white p-2" onClick={() => setFullscreen(false)}>
            <ArrowLeft className="h-5 w-5" />
          </button>
          <img
            src={image.imageUrl}
            alt={image.title}
            className="max-w-full max-h-screen object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}
