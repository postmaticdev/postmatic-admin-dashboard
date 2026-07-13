import { createFileRoute } from "@tanstack/react-router";
import { CustomerServiceWorkspace } from "@/components/customer-service/CustomerServiceWorkspace";
import { useTickets } from "@/contexts/TicketsContext";

export const Route = createFileRoute("/_dashboard/customer-service/whatsapp")({
  component: WhatsappPage,
});

function WhatsappPage() {
  const { getBySource } = useTickets();
  return (
    <CustomerServiceWorkspace
      title="Whatsapp"
      tickets={getBySource("whatsapp")}
      scopeKey="whatsapp"
    />
  );
}
