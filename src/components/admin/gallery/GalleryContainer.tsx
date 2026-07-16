import React, { useState } from "react";
import { GalleryImage, galleryImages } from "./types";
import { GalleryMasonry } from "./GalleryMasonry";
import { GalleryDetail } from "./GalleryDetail";
import { toast } from "sonner";

export function GalleryContainer() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [activeImages, setActiveImages] = useState<GalleryImage[]>(galleryImages);

  const handleDeleteImage = (id: string) => {
    // Strip clone and random suffixes to find the base ID
    const baseId = id.split("-clone-")[0].split("-r")[0].split("-init-")[0];
    setActiveImages((prev) => prev.filter((img) => img.id !== baseId));
    toast.success("Foto berhasil dihapus!");
    setSelectedImage(null);
  };

  if (selectedImage) {
    return (
      <GalleryDetail
        image={selectedImage}
        allImages={activeImages}
        onBack={() => setSelectedImage(null)}
        onImageClick={(img) => setSelectedImage(img)}
        onDelete={handleDeleteImage}
      />
    );
  }

  return (
    <GalleryMasonry
      images={activeImages}
      onImageClick={(img) => setSelectedImage(img)}
      onDelete={handleDeleteImage}
    />
  );
}
