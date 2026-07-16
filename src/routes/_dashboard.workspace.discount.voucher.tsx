import { createFileRoute } from "@tanstack/react-router";
import { VoucherContainer } from "@/components/admin/discount/VoucherContainer";

export const Route = createFileRoute("/_dashboard/workspace/discount/voucher")({
  component: () => (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <VoucherContainer />
    </div>
  ),
});
