import { createFileRoute } from "@tanstack/react-router";
import { UserContainer } from "@/components/admin/account/UserContainer";

export const Route = createFileRoute("/_dashboard/workspace/account/user")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-8 pt-6 space-y-4">
      <UserContainer />
    </div>
  ),
});
