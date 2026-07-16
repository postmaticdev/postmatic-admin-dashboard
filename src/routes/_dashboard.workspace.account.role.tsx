import { createFileRoute } from "@tanstack/react-router";
import { RoleContainer } from "@/components/admin/account/RoleContainer";

export const Route = createFileRoute("/_dashboard/workspace/account/role")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-8 pt-6 space-y-4">
      <RoleContainer />
    </div>
  ),
});
