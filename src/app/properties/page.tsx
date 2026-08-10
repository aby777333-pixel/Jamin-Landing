import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
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
    <>
      <PageHero
        art={17}
        tone="cinematic"
        size="tall"
        sheer
        /* Swept on this frame, not copied. white 5.31, gold 4.91 at blur 16 - the frame stays legible. */
        sheerAlpha={0.48}
        sheerBlur={16}
        eyebrow="Residential plots for sale"
        title="Plots in approved layouts across Tamil Nadu"
        lead={
          <>
            {live.length} development{live.length === 1 ? "" : "s"} selling now
            {totalPlots > 0 ? `, ${totalPlots} plots available` : ""}. Every layout is DTCP
            approved with clear and marketable title, formed roads and water to each plot.
          </>
        }
      />
      <Container className="py-phi5">

      {/* The full list is rendered server-side; the filters narrow it after
          hydration, so the static HTML a crawler receives is complete. */}
        <PropertyExplorer all={all} />
      </Container>
    </>
  );
}
