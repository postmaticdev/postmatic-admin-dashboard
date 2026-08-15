import { createFileRoute } from "@tanstack/react-router";

import { CreateBusinessWizard } from "@/components/admin/business/CreateBusinessWizard";

export const Route = createFileRoute("/_dashboard/workspace/business/create")({
  component: () => <CreateBusinessWizard />,
});
