import Link from "next/link";
import { Hero, type Slide } from "@/components/Hero";
import { PropertyCard } from "@/components/PropertyCard";
import {
  coverImage,
  getProperties,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  type Property,
} from "@/lib/properties";

/** Revalidate hourly so admin edits reach the website without a redeploy,
 *  while every visitor still gets a cached, server-rendered page. */
export const revalidate = 3600;

const TRUST = [
  { k: "DTCP", v: "Approved layouts", d: "Every development is planning-authority approved." },
  { k: "Clear", v: "Marketable title", d: "Title verified before a single plot is offered." },
  { k: "80–90%", v: "Bank loan assistance", d: "Arranged with leading lenders for eligible buyers." },
  { k: "Live", v: "Site progress", d: "Photographs and video published as work proceeds." },
];

/** First two sentences of the admin's own copy. Re-adding a full stop
 *  unconditionally produced "…investment.." when the slice already ended in
 *  one, so the terminator is only added when it is actually missing. */
function firstSentences(text: string | null, count = 2): string | null {
  if (!text) return null;
  const trimmed = text.trim();
  if (!trimmed) return null;
  const parts = trimmed.split(/(?<=\.)\s+/).slice(0, count).join(" ").trim();
  if (!parts) return null;
  return /[.!?]$/.test(parts) ? parts : `${parts}.`;
}

function buildSlides(props: Property[]): Slide[] {
  return props
    .filter((p) => isSellable(p) && coverImage(p))
    .slice(0, 5)
    .map((p) => ({
      image: coverImage(p)!,
      eyebrow: [phaseLabel(p), p.district].filter(Boolean).join(" · "),
      title: p.title,
      blurb: p.seo?.description ?? firstSentences(p.description) ?? locationLine(p),
      href: propertyHref(p),
    }));
}

export default async function HomePage() {
  const all = await getProperties();
  const slides = buildSlides(all);
  const live = all.filter(isSellable);
  const completed = all.filter((p) => !isSellable(p));

  return (
    <>
      <Hero slides={slides} />

      {/* ---- trust strip ---- */}
      <section className="border-b border-line bg-canvas-alt">
        <div className="mx-auto grid max-w-[1280px] gap-phi3 px-5 py-phi5 sm:grid-cols-2 lg:grid-cols-4 lg:px-10">
          {TRUST.map((t) => (
            <div key={t.k} className="flex flex-col">
              <div className="text-2xl text-jamin-red">{t.k}</div>
              <div className="mt-1 text-base font-semibold text-ink">{t.v}</div>
              <p className="mt-1.5 text-tiny leading-relaxed text-ink-muted">{t.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---- live inventory ---- */}
      <section className="mx-auto max-w-[1280px] px-5 py-phi6 lg:px-10">
        <div className="flex flex-wrap items-end justify-between gap-phi3">
          <div>
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-jamin-gold" />
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
                Now selling
              </span>
            </div>
            <h2 className="mt-phi2 text-3xl text-ink">Current developments</h2>
            <p className="mt-phi2 max-w-xl text-lg leading-relaxed text-ink-muted">
              Plotted layouts across Salem, Erode and Coimbatore — each one approved, titled and
              ready for immediate construction.
            </p>
          </div>
          <Link
            href="/properties"
            className="text-tiny font-semibold uppercase tracking-[0.14em] text-jamin-red transition-opacity hover:opacity-70"
          >
            View all →
          </Link>
        </div>

        <div className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((p, i) => (
            <PropertyCard key={p.id} p={p} priority={i === 0} />
          ))}
        </div>
      </section>

      {/* ---- track record ---- */}
      {completed.length > 0 && (
        <section className="bg-canvas-sunken">
          <div className="mx-auto max-w-[1280px] px-5 py-phi6 lg:px-10">
            <div className="flex items-center gap-3">
              <span className="h-px w-10 bg-jamin-gold" />
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
                Track record
              </span>
            </div>
            <h2 className="mt-phi2 text-3xl text-ink">Delivered and handed over</h2>
            <p className="mt-phi2 max-w-xl text-lg leading-relaxed text-ink-muted">
              Completed developments where every plot has been handed to its owner. Shown in full,
              because a track record is only worth something if you can inspect it.
            </p>
            <div className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
              {completed.map((p) => (
                <PropertyCard key={p.id} p={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- closing CTA ---- */}
      <section className="mx-auto max-w-[1280px] px-5 py-phi7 lg:px-10">
        <div className="relative overflow-hidden rounded-card bg-ink px-phi4 py-phi6 text-center lg:px-phi6">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rule-gold" />
          <h2 className="mx-auto max-w-2xl text-3xl text-white">
            Come and walk the land before you decide.
          </h2>
          <p className="mx-auto mt-phi3 max-w-xl text-lg leading-relaxed text-white/70">
            Site visits are arranged at your convenience, with no obligation. Our team will show you
            the approvals, the layout and the plot boundaries in person.
          </p>
          <Link
            href="/contact"
            className="mt-phi4 inline-block rounded-full bg-jamin-red px-8 py-4 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-raise transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
          >
            Book a site visit
          </Link>
        </div>
      </section>
    </>
  );
}
