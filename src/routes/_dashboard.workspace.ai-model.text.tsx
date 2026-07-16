import { createFileRoute } from "@tanstack/react-router";
import { AIModelContainer } from "@/components/admin/workspace/AIModelContainer";

export const Route = createFileRoute("/_dashboard/workspace/ai-model/text")({
  component: () => (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <AIModelContainer modelType="Text" />
    </div>
  ),
});
