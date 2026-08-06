import { createFileRoute, redirect } from "@tanstack/react-router";
import { PageHeader, PlaceholderCard } from "@/components/PageHeader";

export const Route = createFileRoute("/_authenticated/admin/clients")({
  beforeLoad: ({ context }) => {
    if (context.role !== "admin") {
      throw redirect({ to: "/dashboard" });
    }
  },
  head: () => ({
    meta: [
      { title: "Client management — Client Health" },
      {
        name: "description",
        content: "Create, edit and assign clients to Client Impact leads.",
      },
      { property: "og:title", content: "Client management — Client Health" },
      {
        property: "og:description",
        content: "Create, edit and assign clients to Client Impact leads.",
      },
    ],
  }),
  component: AdminClientsPage,
});

function AdminClientsPage() {
  return (
    <div>
      <PageHeader
        title="Clients"
        description="Admin-only client records and CI assignments."
      />
      <PlaceholderCard title="Client CRUD">
        Client create, edit and archive controls will be built here.
      </PlaceholderCard>
    </div>
  );
}
