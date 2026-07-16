import { createFileRoute } from "@tanstack/react-router";
import { BusinessContainer } from "@/components/admin/business/BusinessContainer";

export const Route = createFileRoute("/_dashboard/workspace/business/")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-8 pt-6 bg-background space-y-4">
      <BusinessContainer />
    </div>
  ),
});
