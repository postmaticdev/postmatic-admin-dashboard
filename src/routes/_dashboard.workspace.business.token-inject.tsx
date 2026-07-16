import { createFileRoute } from "@tanstack/react-router";
import { TokenInjectContainer } from "@/components/admin/business/TokenInjectContainer";

export const Route = createFileRoute("/_dashboard/workspace/business/token-inject")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-8 pt-6 bg-background space-y-4">
      <TokenInjectContainer />
    </div>
  ),
});
