import { createFileRoute } from "@tanstack/react-router";
import { CustomerServiceWorkspace } from "@/components/customer-service/CustomerServiceWorkspace";
import { useTickets } from "@/contexts/TicketsContext";

export const Route = createFileRoute("/_dashboard/customer-service/gmail")({
  component: GmailPage,
});

function GmailPage() {
  const { getBySource } = useTickets();
  return (
    <CustomerServiceWorkspace title="Gmail" tickets={getBySource("gmail")} scopeKey="gmail" />
  );
}
