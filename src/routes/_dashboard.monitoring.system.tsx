import { createFileRoute } from "@tanstack/react-router";

import { SystemMonitoringContainer } from "@/components/admin/monitoring/SystemMonitoringContainer";

export const Route = createFileRoute("/_dashboard/monitoring/system")({
  component: () => (
    <div className="h-full min-h-0 space-y-4 overflow-y-auto p-4 pt-6 md:p-8">
      <SystemMonitoringContainer />
    </div>
  ),
});
