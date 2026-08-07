import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { Container, SectionLabel } from "@/components/ui";
import { getProperties, isSellable } from "@/lib/properties";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Properties — DTCP-Approved Plots Across Tamil Nadu",
  description:
    "Every Jamin development: DTCP-approved residential plots in Salem, Erode, Tiruppur and Coimbatore, with live plot availability.",
  alternates: { canonical: "/properties" },
};

export default async function PropertiesPage() {
  const all = await getProperties();
  const live = all.filter(isSellable);
  const totalPlots = live.reduce((n, p) => n + (p.plots_available ?? 0), 0);

  return (
    <Container className="py-phi5">
      <header className="max-w-2xl">
        <SectionLabel>Our developments</SectionLabel>
        <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">Properties</h1>
        <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
          {live.length} development{live.length === 1 ? "" : "s"} currently selling
          {totalPlots > 0 ? `, with ${totalPlots} plots available` : ""}. Every layout is
          DTCP-approved with clear and marketable title.
        </p>
      </header>

      {/* The full list is rendered server-side; the filters narrow it after
          hydration, so the static HTML a crawler receives is complete. */}
      <PropertyExplorer all={all} />
    </Container>
  );
}
