import { createFileRoute } from "@tanstack/react-router";
import { LegalityContainer } from "@/components/admin/legality/LegalityContainer";

export const Route = createFileRoute("/_dashboard/docs/legality")({
  component: LegalityPage,
});

function LegalityPage() {
  return (
    <div className="h-full min-h-0 overflow-y-auto bg-background p-6">
      <LegalityContainer />
    </div>
  );
}

