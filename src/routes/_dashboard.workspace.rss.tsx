import { createFileRoute } from "@tanstack/react-router";
import { RSSContainer } from "@/components/admin/workspace/RSSContainer";

export const Route = createFileRoute("/_dashboard/workspace/rss")({
  component: () => (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <RSSContainer />
    </div>
  ),
});
