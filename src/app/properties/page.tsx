import type { Metadata } from "next";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { paneHue } from "@/lib/stones";
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
        /* hero-57 — the villa street at golden hour, FLOWERED GATES set
           2026-08-17 evening, replacing Metropolis the same day. */
        art={57}
        tone="cinematic"
        /* `full`, up from `tall` (2026-08-17) — the owner's report: "hero does
           not fill the expected viewport height / large white space below".
           ⚠️ The taller box is also what UNLOCKED artPosition below: at `tall`
           heights this 2.334:1 frame was width-bound in the box and had ~10.6%
           of horizontal slack; at 85vh the box is ~1.9–2.1:1, cover becomes
           HEIGHT-bound, and the crop gains real horizontal travel. */
        size="full"
        /* 🚨 `right center`, was `left center` (report 10, 2026-08-21: "The
           Jamin Bazaar branding/signboard on the right side of the hero is
           partially outside the visible area, so the full name cannot be
           seen. Reposition the hero image/composition slightly to the left").

           hero-57's lockup wall runs to source x ≈ 1240 of 1280 — the last 3%
           of the frame. At wide desktop boxes cover is width-bound and the
           whole frame shows regardless of anchor; the clip the owner shot
           happens where the box turns HEIGHT-bound (≈1024–1200 at 85vh),
           where a left anchor discards the right ~12% — exactly the BAZAAR
           half of the sign. Anchoring right keeps the sign whole at every
           width and gives up the far-left villas instead, which the copy
           plate covers anyway. */
        artPosition="right center"
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
        /* 0.58 for hero-47, up from hero-37's 0.52 — the pair rule. Swept
           comparatively against audited hero-38: at 0.52 this frame reads p95
           4.46/4.57 where the audited figure is ~5.0; 0.58 restores it
           (5.40/5.52). */
        sheerAlpha={0.58}
        /* Report 11 (2026-08-21): "Move the label to the left side and align
           it with the main heading" — the same per-page override /about took
           in report 10. */
        eyebrowAlign="start"
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
      {/* 🚨 THE HUE AND THE FROST ARE BACK, THE CARD IS NOT (owner 2026-08-21:
          "all the hues… the frosty glass stuff is gone. bring them back").

          Report 10 asked to "remove the outer rounded filter card, background
          and shadow" and the emerald pane came off with it — taking the hue,
          the gloss and the backdrop-filter, which is what is now missed. The
          `flat` pane returns all three without the rounded card: a full-bleed
          band, gold rule above and below. Both instructions hold. */}
      <div className="rj-pane rj-pane-flat" style={{ "--rj-hue": paneHue("/properties") } as React.CSSProperties}>
      <Container className="py-phi5">
      {/* The full list is rendered server-side; the filters narrow it after
          hydration, so the static HTML a crawler receives is complete. */}
        <PropertyExplorer all={all} />
      </Container>
      </div>
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
