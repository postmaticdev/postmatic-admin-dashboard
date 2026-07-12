import { createFileRoute } from "@tanstack/react-router";
import { DocsManagementContainer } from "@/components/admin/docs-management/DocsManagementContainer";

export const Route = createFileRoute("/_admin/docs-management")({
  head: () => ({
    meta: [
      { title: "Docs Management — Postmatic Admin (docs.postmatic.id)" },
      {
        name: "description",
        content: "Kelola halaman dokumentasi, reorder menu navigasi, dan edit konten portal docs.postmatic.id.",
      },
    ],
  }),
  component: DocsManagementPage,
});

function DocsManagementPage() {
  return <DocsManagementContainer />;
}
