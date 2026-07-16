import { createFileRoute } from "@tanstack/react-router";
import { AdminContainer } from "@/components/admin/account/AdminContainer";

export const Route = createFileRoute("/_dashboard/workspace/account/admin")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto p-4 md:p-8 pt-6 space-y-4">
      <AdminContainer />
    </div>
  ),
});
