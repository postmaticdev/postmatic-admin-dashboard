import { createFileRoute } from "@tanstack/react-router";
import { RSSContainer } from "@/components/admin/workspace/RSSContainer";

export const Route = createFileRoute("/_dashboard/workspace/rss")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-8 pt-6 space-y-4">
      <RSSContainer />
    </div>
  ),
});
