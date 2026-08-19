import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container, Pane } from "@/components/ui";
import { paneHue } from "@/lib/stones";
import { CompareTable } from "@/components/CompareTable";
import { CallbackBand } from "@/components/CallbackBand";
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
        /* hero-75 — JAMIN SOULFUL in daylight (owner-supplied 2026-08-18
           13:00, replacing the same morning's hero-73 sunset gate at the
           owner's ask). Swept on this frame: brighter than audited hero-38
           under the plate (p95 0.711 vs 0.604) → 0.58, see the register. */
        art={75}
        tone="cinematic"
        sheer
        sheerAlpha={0.58}
        eyebrow="Side by side"
        title="Compare Jamin developments"
        lead="Two or three at a time. Rows where the projects agree are hidden, so what is left on the page is what actually separates them."
      />
      <Container className="py-phi5" hue={paneHue("/compare")}>
      {/* ⚠️ ONE pane for the page body, not one per element (owner
          2026-08-19). Converting the bordered elements instead would have
          tinted the CARDS too, and the cards are what has to stay on
          `bg-canvas` so they lift off the sheet — that lift is half of
          what the hue buys. The colour itself is stated once, on the
          Container above, and every `.rj-pane` inside inherits it. */}
      <Pane className="p-phi3 sm:p-phi5">
        <CompareTable all={all} />
      </Pane>
      </Container>
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
