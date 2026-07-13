import { createFileRoute } from "@tanstack/react-router";
import { DocsManagementContainer } from "@/components/admin/docs-management/DocsManagementContainer";

export const Route = createFileRoute("/_dashboard/docs")({
  component: DocsPage,
});

function DocsPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-background p-6">
      <DocsManagementContainer />
    </div>
  );
}
