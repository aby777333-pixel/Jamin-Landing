import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Sweep } from "@/components/brand/Sweep";
import { Container, Pane } from "@/components/ui";
import { paneHue } from "@/lib/stones";
import { EnquiryForm } from "@/components/EnquiryForm";
import { VisitBooking } from "@/components/VisitBooking";
import { DeskActions } from "@/components/DeskActions";
import { getProperties, isSellable, locationLine } from "@/lib/properties";
import { getDeskContact } from "@/lib/site";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Contact & Site Visits",
  description:
    "Arrange a site visit or speak to the Jamin Properties sales desk about DTCP-approved plots in Salem, Erode, Tiruppur and Coimbatore.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const [all, desk] = await Promise.all([getProperties(), getDeskContact()]);
  const live = all.filter(isSellable);

  return (
    <>
      <PageHero
        /* ⚠️ hero-21 names itself — JAMIN BAZAAR on the gate — and shows a
           layout mid-build, with workers, a tractor and a house going up. It is
           a render. The no-caption rule in public/hero/README.md binds here as
           it does on /about: no caption, no location, no project name. */
        /* hero-52 — the modern slat gate, JAMIN CITY set 2026-08-17. */
        /* 🚨 hero-72 REPLACES hero-52 (report 14, 2026-08-21: "the 'Book a site
           visit' section currently uses a hero image that does not clearly
           relate to the purpose of the section… the image shows a generic
           residential/gated-community entrance, while the section is
           specifically about booking a site visit. The image does not visually
           reinforce the action of visiting a property or walking through an
           actual plotted development").

           hero-72 is the one frame in the register whose subject IS the visit:
           a family walking in through the gate at dusk, with the guard at the
           post. It was the home phone band until report 13 moved that to
           hero-83 for carrying the wordmark twice — and the second wordmark is
           precisely what `artPosition="right"` crops away here, so the frame
           arrives on this page without the duplication that retired it.

           ⚠️ `softFade`, NOT an anchor, AND THE MEASUREMENT IS WHY. The first
           attempt used `artPosition="right"` to push the wall lockup (source x
           8–30%) clear of `hero-fade`'s 22% dissolve — the hero-31/33 lesson,
           that a board inside the fade reads as a sign sliced in half. Probed
           on the built page: the art box is 829x553 against a 1.5:1 frame, so
           the frame is WIDTH-bound and the anchor has ZERO horizontal travel;
           the lockup sat at screen 665–848 with the fade running to 783
           whatever the anchor said. The dissolve is the thing that has to
           move, so it takes the 8% ramp `hero-fade-soft` (report 12,
           /projects): the knee lands at 667 and the lockup is solid from its
           own left edge. The anchor stays `right` — harmless with no travel,
           and correct the day this box stops being width-bound. */
        art={72}
        artPosition="right"
        softFade
        sheer
        /* 0.42 held for hero-52 because its overlap strip is greenery; hero-72
           is a dusk frame and darker still under the plate, so the value is
           carried rather than re-swept upward — a darker ground can only
           improve ink on a light plate. */
        sheerAlpha={0.42}
        eyebrow="Talk to Jamin"
        title="Book a site visit"
        lead="Walk the layout, see the approvals and stand on the plot before you decide. Visits are arranged at your convenience and carry no obligation."
      />
      <Container className="py-phi5" hue={paneHue("/contact")}>
      {/* ⚠️ ONE pane for the page body, not one per element (owner
          2026-08-19). Converting the bordered elements instead would have
          tinted the CARDS too, and the cards are what has to stay on
          `bg-canvas` so they lift off the sheet — that lift is half of
          what the hue buys. The colour itself is stated once, on the
          Container above, and every `.rj-pane` inside inherits it. */}
      <Pane className="p-phi3 sm:p-phi5">
      <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
        <div>

          {/* The booking writes a real site_visits row with a reference and a
              slot, AND the matching lead — one pipeline, not a second one the
              desk would have to reconcile. */}
          {live.length > 0 && (
            <div className="rounded-xl border border-line bg-canvas p-phi4 shadow-lift">
              <h2 className="text-2xl text-ink">Pick a day to walk the land</h2>
              <p className="mt-phi2 max-w-xl text-base leading-relaxed text-ink-muted">
                Choose a development, a date and a time that suits you. You will get a reference
                straight away, and a call from our desk to confirm it.
              </p>
              <div className="mt-phi4">
                <VisitBooking
                  properties={live.map((p) => ({
                    id: p.id,
                    title: p.title,
                    place: locationLine(p),
                  }))}
                />
              </div>
            </div>
          )}

          {/* Not everybody wants to commit to a date. §39: never make the only
              path the heaviest one. */}
          <div className="mt-phi4 rounded-xl border border-line bg-canvas-alt p-phi4">
            <h2 className="text-xl text-ink">Not ready for a date? Just ask.</h2>
            <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
              Two fields is all we need to call you back. Everything else is optional.
            </p>
            <div className="mt-phi3">
              <EnquiryForm />
            </div>
          </div>

          <div className="mt-phi4">
            <h2 className="text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
              Or reach the desk directly
            </h2>
            <p className="mt-phi2 text-base text-ink-muted">
              {desk.label ?? "Jamin Properties Help Desk"} — we usually respond within working
              hours.
            </p>
            <div className="mt-phi3">
              <DeskActions />
            </div>
          </div>
        </div>

        {/* ⚠️ STICKY, and that is the balance fix rather than a flourish. The
            left column carries three stacked blocks and this carries one short
            card, so the right half of the section was empty for most of its
            height — the "large unused space" in the report. Making the card
            travel with the reader turns that space into margin instead of a
            hole, and keeps the list of places visible while the form above it
            is being filled in. Offset by the header so it never docks
            underneath the navbar. */}
        {/* 🚨 IT COMES FIRST ON A PHONE (report 14, 2026-08-21, priority High:
            "the Visible Developments section is currently displayed at the
            bottom of the site-visit flow… [readers] have to go through the
            booking form and other details before reaching the list of
            available developments. This makes it difficult to know which
            developments are currently available before starting the booking
            process… should be moved near the beginning of the site-visit page,
            directly after the 'Book a site visit' introduction and before the
            date/time selection").

            ⚠️ `order`, NOT a move in the markup, and the reason is the desktop
            layout: this is the RIGHT column of a two-column grid, so reordering
            the source would put the sidebar on the left at every width above
            `lg`. `-order-1 lg:order-none` changes only the single-column
            stacking, which is exactly the scope the report gives. The sticky
            behaviour is untouched — it only engages at `lg`, where the order
            is back to normal. */}
        <aside
          className="-order-1 lg:order-none lg:sticky lg:self-start"
          style={{ top: "calc(var(--header-h) + 1.25rem)" }}
        >
          <div className="rounded-card border border-line bg-canvas p-phi3 shadow-lift">
            <h2 className="text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
              Visitable developments
            </h2>
            {/* ⚠️ One rule per row, not a rule PLUS a gap. The list previously
                stacked `space-y-phi2` on top of each row's own `pt-phi2`, so
                every entry carried roughly 34px of dead space above its title
                and the card read as three floating blocks rather than a
                register. Even padding above and below each row gives it the
                even rhythm a reference panel needs, and the entries are set a
                step down from body copy because this is a sidebar, not the
                page's argument. */}
            <ul className="mt-phi2">
              {live.map((p) => (
                <li key={p.id} className="border-t border-line py-phi2">
                  <div className="text-base font-medium leading-snug text-ink">{p.title}</div>
                  <div className="mt-0.5 text-tiny leading-snug text-ink-muted">
                    {locationLine(p)}
                  </div>
                </li>
              ))}
            </ul>
            <p className="border-t border-line pt-phi2 text-tiny leading-relaxed text-ink-faint">
              A requested visit is not yet a confirmed appointment — we call to agree the time with
              you.
            </p>
          </div>
        </aside>
      </div>
      </Pane>
      </Container>

      {/* CARTOUCHE §4.2 — the Sweep, surface 2 of exactly 3. On /contact the
          sweep IS the page's closing statement. */}
      <div className="mt-phi6">
        <Sweep lead="The desk, directly" />
      </div>
    </>
  );
}
