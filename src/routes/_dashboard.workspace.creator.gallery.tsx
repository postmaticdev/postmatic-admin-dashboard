import { createFileRoute } from "@tanstack/react-router";
import { GalleryContainer } from "@/components/admin/gallery/GalleryContainer";

export const Route = createFileRoute("/_dashboard/workspace/creator/gallery")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto px-4 md:px-8 pb-4 md:pb-8 pt-0 bg-background space-y-4">
      <GalleryContainer />
    </div>
  ),
});
