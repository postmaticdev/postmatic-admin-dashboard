import { createFileRoute } from "@tanstack/react-router";

import { AdminActivityLogContainer } from "@/components/admin/monitoring/AdminActivityLogContainer";

export const Route = createFileRoute("/_dashboard/monitoring/activity")({
  component: () => (
    <div className="h-full min-h-0 space-y-4 overflow-y-auto p-4 pt-6 md:p-8">
      <AdminActivityLogContainer />
    </div>
  ),
});
