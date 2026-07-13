import { createFileRoute } from "@tanstack/react-router";
import { CustomerServiceWorkspace } from "@/components/customer-service/CustomerServiceWorkspace";
import { useTickets } from "@/contexts/TicketsContext";

export const Route = createFileRoute("/_dashboard/customer-service/all")({
  component: AllTicketsPage,
});

function AllTicketsPage() {
  const { getSaved } = useTickets();
  return (
    <CustomerServiceWorkspace title="All Tickets" tickets={getSaved()} scopeKey="all" />
  );
}
