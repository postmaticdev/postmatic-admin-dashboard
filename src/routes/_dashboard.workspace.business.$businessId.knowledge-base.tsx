import { createFileRoute } from "@tanstack/react-router";

import { BusinessKnowledgePage } from "@/components/admin/business/BusinessKnowledgePage";

export const Route = createFileRoute("/_dashboard/workspace/business/$businessId/knowledge-base")({
  component: BusinessKnowledgeRoute,
});

function BusinessKnowledgeRoute() {
  const { businessId } = Route.useParams();

  return (
    <div className="h-full min-h-0 overflow-y-auto">
      <BusinessKnowledgePage businessId={businessId} />
    </div>
  );
}
