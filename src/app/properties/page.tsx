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
        size="tall"
        /* ⚠️ 20%, AND IT IS A PARTIAL ANSWER — say so before someone re-reads
           the report and thinks this closed it. Asked 2026-08-14 to "move the
           entire background image slightly to the right" so the copy card has
           clean space behind it. Lowering X shows more of the picture's left,
           which walks the gate right; this is the same lever the homepage
           banner uses, and there it moves the gate ten points.

           Here it moves it about two. hero-37 is 2.334:1 in a 2.09 box, so
           `cover` has only **10.6% of horizontal slack** — the whole range from
           0% to 100% shifts the frame by ~5% of the picture's width. Rendered
           all four before choosing: the gate barely stirs.

           🚨 THE REAL CONSTRAINT IS THE FRAME, NOT THE CSS. The gateway is
           symmetric and occupies roughly 22%–78% of this picture, so no
           object-position and no card width clears it — the card would have to
           end at 22% of the viewport to sit beside it, which is narrower than
           the headline. Fixing this properly means a re-cut frame with the gate
           right of centre, exactly as hero-31, hero-33 and hero-34 were trimmed
           for their own baked elements. Flagged to the owner rather than
           quietly left as done. */
        artPosition="20% center"
        sheer
        /* The plate fades out across its right fifth so the gate and the
           lockup behind it read — every glyph here ends by 77.6% of the
           plate's width, so the reveal costs no contrast. See the note on
           `.rj-gilt-sheer-edge`. */
        sheerEdge
        plateXl="38rem"
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
