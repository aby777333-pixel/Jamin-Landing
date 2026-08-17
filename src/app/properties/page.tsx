import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { CallbackBand } from "@/components/CallbackBand";
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
        /* hero-37 — the aerial gate, owner-supplied 2026-08-12, replacing
           hero-17. hero-17 is not retired: it is still the fallback for a
           district page without art of its own, which today means Coimbatore. */
        art={37}
        tone="cinematic"
        /* `full`, up from `tall` (2026-08-17) — the owner's report: "hero does
           not fill the expected viewport height / large white space below".
           ⚠️ The taller box is also what UNLOCKED artPosition below: at `tall`
           heights this 2.334:1 frame was width-bound in the box and had ~10.6%
           of horizontal slack; at 85vh the box is ~1.9–2.1:1, cover becomes
           HEIGHT-bound, and the crop gains real horizontal travel. */
        size="full"
        /* ⚠️ `left center`, was 20% — and the old note here ("the gate barely
           stirs") described the `tall` geometry, where cover left almost no
           slack. Height-bound at `full`, anchoring left shows the picture from
           its left edge and walks the symmetric gate (22%–78% of the frame) to
           the RIGHT of the copy card: gate centre lands at ~57–60% of the
           viewport at 1280–1440, clear of the card's right edge. The card
           still overlaps the gate's left arch — that is the frame, not the
           CSS; a re-cut with the gate right of centre remains the only full
           answer and stays flagged to the owner. */
        artPosition="left center"
        sheer
        /* The plate fades out across its right fifth so the gate and the
           lockup behind it read — every glyph here ends by 77.6% of the
           plate's width, so the reveal costs no contrast. See the note on
           `.rj-gilt-sheer-edge`. */
        sheerEdge
        /* 42rem, up from 38 (2026-08-17) — the report asked for the card a
           little larger. 38rem was chosen when narrowing was the only way to
           give the photograph back; the taller box does that job now, and at
           42rem the headline still sets in three lines (the cliff is 36). */
        plateXl="42rem"
        /* ⚠️ 0.52, up from hero-17's 0.12, and swept rather than carried.
           hero-17 was a trimmed banner that is dark exactly where the copy
           sits; this frame is an aerial under a bright sky and measures far
           lighter under the plate. Gold eyebrow (it binds; white runs ~1.1x
           clear), worst pixel, at the widths where the photograph is actually
           BEHIND the copy:

               a0.12 → 1024 n/a · 1280 2.20      ← hero-17's value
               a0.42 → 1024 3.10 · 1280 4.36
               a0.52 → 1024 4.17 · 1280 5.64     ← ships
               a0.56 → 1024 4.72 · 1280 6.28

           ⚠️ 1024 BINDS, not 375. Below `lg` the cinematic tone puts the
           picture in a band above the copy and the words sit on the section's
           charcoal, so the phone is the safest width, not the tightest — a
           sweep that models a full-bleed phone crop overstates the constraint.
           The tightest real case is the narrowest width that still composites
           copy over photograph, which is 1024. */
        sheerAlpha={0.52}
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
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
