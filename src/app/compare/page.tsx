import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { CompareTable } from "@/components/CompareTable";
import { getProperties } from "@/lib/properties";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Compare developments",
  description:
    "Put two or three Jamin developments side by side — location, stage, extent, plot availability and approvals.",
  // A working view, not a destination for search results.
  robots: { index: false, follow: true },
  alternates: { canonical: "/compare" },
};

/**
 * §18 — comparison that highlights differences rather than dumping a
 * spreadsheet. The selection travels in the URL so a comparison can be shared;
 * the table reads it on the client, because touching searchParams here would
 * make the route dynamic and cost the prerender.
 */
export default async function ComparePage() {
  const all = await getProperties();

  return (
    <>
      <PageHero
        art={7}
        eyebrow="Side by side"
        title="Compare Jamin developments"
        lead="Two or three at a time. Rows where the projects agree are hidden, so what is left on the page is what actually separates them."
      />
      <Container className="py-phi5">
        <CompareTable all={all} />
      </Container>
    </>
  );
}
