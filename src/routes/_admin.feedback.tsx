import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { PageHeader } from "@/components/admin/PageHeader";
import { CrmTab } from "@/components/admin/feedback/CrmTab";
import { GmailInbox } from "@/components/admin/feedback/GmailInbox";
import { ChatPanel } from "@/components/admin/feedback/ChatPanel";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { campaigns, messages } from "@/lib/mock/data";

export const Route = createFileRoute("/_admin/feedback")({
  validateSearch: (search: Record<string, unknown>) => {
    return {
      tab: (search.tab as string) || "Chat",
      messageId: (search.messageId as string) || undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "Feedback & Report — Postmatic Admin" },
      { name: "description", content: "Pusat layanan pelanggan Postmatic: chat, email, dan laporan." },
    ],
  }),
  component: FeedbackPage,
});

type Ch = "CRM" | "Email" | "Chat" | "Report";

function FeedbackPage() {
  const { tab: tabParam, messageId } = Route.useSearch();
  const [tab, setTab] = useState<Ch>((tabParam as Ch) || "Chat");

  const handleTabChange = (val: Ch) => {
    setTab(val);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("tab", val);
      // Remove messageId parameter on tab change to prevent locking it in search parameters
      url.searchParams.delete("messageId");
      window.history.replaceState(null, "", url.toString());
    }
  };

  const emailMessages = messages.filter((m) => m.channel === "Email");
  const chatMessages = messages.filter((m) => m.channel === "Chat");
  const reportMessages = messages.filter((m) => m.channel === "Report");

  return (
    <>
      <PageHeader
        title="Feedback & Report"
        description="Layanan pelanggan Postmatic dari WhatsApp, Email, CRM blast, dan tiket laporan."
      />

      <Tabs value={tab} onValueChange={(v) => handleTabChange(v as Ch)} className="mb-6">
        <TabsList className="flex w-full h-20 p-2 bg-muted/30 border">
          <TabsTrigger value="CRM" className="flex-1 h-full text-base font-bold transition-all">CRM</TabsTrigger>
          <TabsTrigger value="Email" className="flex-1 h-full text-base font-bold transition-all">Gmail</TabsTrigger>
          <TabsTrigger value="Chat" className="flex-1 h-full text-base font-bold transition-all">WhatsApp</TabsTrigger>
          <TabsTrigger value="Report" className="flex-1 h-full text-base font-bold transition-all">Report</TabsTrigger>
        </TabsList>
      </Tabs>

      {tab === "CRM" ? <CrmTab /> : null}
      {tab === "Email" ? <GmailInbox messages={emailMessages} variant="email" activeId={messageId} /> : null}
      {tab === "Chat" ? <ChatPanel messages={chatMessages} /> : null}
      {tab === "Report" ? <GmailInbox messages={reportMessages} variant="report" activeId={messageId} /> : null}
    </>
  );
}
