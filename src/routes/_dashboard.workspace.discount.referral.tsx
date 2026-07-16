import { createFileRoute } from "@tanstack/react-router";
import { ReferralContainer } from "@/components/admin/discount/ReferralContainer";

export const Route = createFileRoute("/_dashboard/workspace/discount/referral")({
  component: () => (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <ReferralContainer />
    </div>
  ),
});
