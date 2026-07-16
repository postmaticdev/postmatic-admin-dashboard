import { createFileRoute } from "@tanstack/react-router";
import { CreatorContainer } from "@/components/admin/creator/CreatorContainer";

export const Route = createFileRoute("/_dashboard/workspace/creator/")(
  {
    component: () => (
      <div className="h-full min-h-0 overflow-y-auto p-4 md:p-8 pt-6 space-y-4">
        <CreatorContainer />
      </div>
    ),
  }
);
