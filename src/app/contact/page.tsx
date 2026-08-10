import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
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
        art={21}
        eyebrow="Talk to Jamin"
        title="Book a site visit"
        lead="Walk the layout, see the approvals and stand on the plot before you decide. Visits are arranged at your convenience and carry no obligation."
      />
      <Container className="py-phi5">
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
        <aside className="lg:sticky lg:self-start" style={{ top: "calc(var(--header-h) + 1.25rem)" }}>
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
      </Container>
    </>
  );
}
