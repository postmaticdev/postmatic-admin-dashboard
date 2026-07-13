import { createFileRoute } from "@tanstack/react-router";
import { CustomerServiceWorkspace } from "@/components/customer-service/CustomerServiceWorkspace";
import { useTickets } from "@/contexts/TicketsContext";

export const Route = createFileRoute("/_dashboard/customer-service/website")({
  component: WebsitePage,
});

function WebsitePage() {
  const { getBySource } = useTickets();
  return (
    <CustomerServiceWorkspace
      title="Website Report"
      tickets={getBySource("website")}
      scopeKey="website"
    />
  );
}
