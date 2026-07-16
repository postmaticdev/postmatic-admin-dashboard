import { createFileRoute, Outlet } from "@tanstack/react-router";

export const Route = createFileRoute("/_dashboard/workspace/business")({
  component: () => (
    <div className="h-full min-h-0">
      <Outlet />
    </div>
  ),
});
