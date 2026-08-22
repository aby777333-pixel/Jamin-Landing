import Image from "next/image";
import { Reveal } from "@/components/Reveal";
import { SectionLabel } from "@/components/ui";
import { prospectusFor, prospectusGallery, prospectusHero, prospectusLine } from "@/lib/prospectus";
import type { Phase } from "@/lib/site";

/**
 * THE PROSPECTUS BAND — announced developments, on the stage pages that have
 * any. Built for /projects/future, generalised to /projects/current the same
 * day when the owner sent a second, "Upcoming" list.
 *
 * Owner, 2026-08-22: "only show images and overview". That instruction is the
 * whole specification, and the restraint in it is the point: these carry a picture and a sentence and
 * nothing else. No plot count, no price, no availability, no "enquire about
 * this plot" — because none of those exist yet, and inventing a CTA for
 * inventory that cannot be sold is how a marketing page starts lying.
 *
 * ⚠️ IT IS DELIBERATELY NOT A `PropertyCard`. That component is the catalogue's
 * shape and every part of it assumes a record: the fact strip, the gem band,
 * the stage chip, the availability pair, the price line. Rendered against a
 * prospectus it would be a card of empty cells with a corner fold on it. A
 * different kind of thing gets a different shape.
 *
 * ⚠️ HEADINGS ARE h3. The page's `h2` is its screen-reader-only "<stage>
 * developments"; this band adds its own visible `h2` and the entries sit under
 * it, so the outline runs h1 → h2 → h3 with no jump.
 */
const COUNT_WORD = ["No", "One", "Two", "Three", "Four", "Five", "Six"];

/**
 * ⚠️ THE LEAD SENTENCE IS PER-PHASE, and that is a truthfulness decision.
 *
 * `PHASE_META` gives `future` the blurb "Land secured and planning under way"
 * and `current` the blurb "Approved and about to open" — so reusing one line
 * for both would have put the word "approved" over two developments whose
 * approval status the owner never stated. Each phase gets the framing its own
 * page already uses, and neither claims more than that.
 *
 * The second sentence is shared and is the part that matters: it says plainly
 * that nothing here is on sale, whichever stage it sits under.
 */
const LEAD: Partial<Record<Phase, string>> = {
  future: "Land secured, planning under way.",
  current: "Announced and being prepared for release.",
};

export function ProspectusBand({ phase }: { phase: Phase }) {
  const items = prospectusFor(phase);
  if (items.length === 0) return null;

  const count = COUNT_WORD[items.length] ?? String(items.length);

  return (
    <section className="mt-phi5" aria-labelledby="prospectus-heading">
      <SectionLabel>Announced</SectionLabel>
      <h2 id="prospectus-heading" className="mt-phi3 max-w-2xl text-2xl text-ink">
        {count} more development{items.length === 1 ? "" : "s"} in planning
      </h2>
      {/* ⚠️ THIS SENTENCE IS THE BAND'S HONESTY, not its marketing. The page
          header counts the CATALOGUE (developments and plots you can act on
          today) and these are not in it; without a line saying so, a reader
          who sees "1 development" above and four things below concludes the
          number is wrong. It also states plainly that there is nothing to buy
          here yet, which is the difference between announcing and selling. */}
      <p className="mt-phi2 max-w-2xl text-base leading-relaxed text-ink-muted">
        {LEAD[phase]} These are not yet on sale and carry no plot schedule or price — they are
        counted separately from the developments above. The desk registers interest, and the
        sanctioned layout is published here as soon as it is approved.
      </p>

      <div className="mt-phi4 grid gap-phi4">
        {items.map((p, i) => {
          const gallery = prospectusGallery(p);
          const line = prospectusLine(p);
          return (
            <Reveal key={p.slug}>
              <article
                id={p.slug}
                className="overflow-hidden rounded-xl border border-line bg-canvas shadow-lift"
              >
                {/* The gate render. `rj-plate` is the hairline the property
                    cards carry, so mixed-provenance artwork reads as one set.
                    ⚠️ 16:9 matches the supplied files (1672x941 ≈ 1.777), so
                    `object-cover` has nothing to crop — the trap recorded on
                    the Rubycon poster, which arrived at 2:3 into a 4:5 box. */}
                <div className="rj-plate relative aspect-[16/9] w-full overflow-hidden bg-canvas-sunken">
                  <Image
                    src={prospectusHero(p)}
                    alt={`Entrance gate render for the planned ${p.kind.toLowerCase()} at ${p.name}.`}
                    fill
                    /* Only the first is above the fold on a phone; the rest are
                       lazy so three gate renders do not compete with the page's
                       own hero for the loading budget. */
                    priority={i === 0}
                    loading={i === 0 ? undefined : "lazy"}
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 90vw, 1100px"
                    className="object-cover"
                  />
                </div>

                <div className="p-phi3 sm:p-phi4">
                  <h3 className="text-xl text-ink">{p.name}</h3>
                  {line && (
                    <p className="mt-1.5 text-micro font-semibold uppercase tracking-[0.14em] text-jamin-gold-ink">
                      {line}
                    </p>
                  )}
                  <div className="mt-phi3 h-px w-full rule-gold" aria-hidden="true" />
                  <p className="mt-phi3 max-w-2xl text-base leading-relaxed text-ink-muted">
                    {p.overview}
                  </p>

                  {gallery.length > 0 && (
                    <>
                      {/* ⚠️ A plain grid, NOT the `Gallery` lightbox. That
                          component is built around a property's own image
                          record; wiring it to a static list would be a second
                          code path through it for no reader benefit. These are
                          impressions of a development that does not exist yet
                          — they are meant to be glanced at, not studied. */}
                      <h4 className="sr-only">{p.name} — design impressions</h4>
                      <ul className="mt-phi3 grid grid-cols-2 gap-phi2 sm:grid-cols-3">
                        {gallery.map((src, gi) => (
                          <li
                            key={src}
                            className="rj-plate relative aspect-[16/9] overflow-hidden rounded-lg bg-canvas-sunken"
                          >
                            <Image
                              src={src}
                              alt={`${p.name} — design impression ${gi + 1} of ${gallery.length}.`}
                              fill
                              loading="lazy"
                              sizes="(max-width: 640px) 50vw, 33vw"
                              className="object-cover"
                            />
                          </li>
                        ))}
                      </ul>
                      {/* Renders are not photographs, and on a page that sells
                          land the difference is not a footnote. The go-live
                          checklist asks for exactly this line: "clearly
                          distinguish real property photography from
                          conceptual/illustrative imagery". */}
                      <p className="mt-phi2 text-tiny text-ink-faint">
                        Artist&rsquo;s impressions. Not photographs of a built site.
                      </p>
                    </>
                  )}
                </div>
              </article>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
