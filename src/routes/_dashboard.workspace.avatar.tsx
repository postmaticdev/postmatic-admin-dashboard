import { createFileRoute } from "@tanstack/react-router";

import { AvatarContainer } from "@/components/admin/workspace/AvatarContainer";

export const Route = createFileRoute("/_dashboard/workspace/avatar")({
  component: () => (
    <div className="h-full min-h-0 overflow-y-auto p-4 pt-6 md:p-8">
      <AvatarContainer />
    </div>
  ),
});
