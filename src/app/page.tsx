import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Hero, type Slide } from "@/components/Hero";
import { PropertyCard } from "@/components/PropertyCard";
import { Container, SectionLabel, ButtonLink } from "@/components/ui";
import {
  coverImage,
  getProperties,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  type Property,
} from "@/lib/properties";
import { getNavFacets } from "@/lib/site";

/** Revalidate hourly so admin edits reach the website without a redeploy,
 *  while every visitor still gets a cached, server-rendered page. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: { absolute: "DTCP Approved Plots in Tamil Nadu — Jamin Properties" },
  description:
    "Buy DTCP-approved residential plots in Erode, Salem, Tiruppur and Coimbatore. Sanctioned layouts, clear title, formed roads and water to every plot.",
  alternates: { canonical: "/" },
};

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

/** What a buyer is actually checking, in the words they use. Keyword-bearing
 *  because those ARE the terms — not because they were sprinkled in (§91). */
/* Each assurance carries its own colour so the block reads as four distinct
   promises rather than one grey list. The tones are the brand's own — the
   canopy green for land, the gold for paperwork, terracotta for what is built,
   red for money — and every pairing below is a tinted background with its own
   darker ink, so none of them is red-on-red or gold-as-text. */
const ASSURANCES = [
  {
    k: "DTCP approved",
    d: "Every Jamin layout is sanctioned by the Directorate of Town and Country Planning. We publish the approval number and the sanctioned plan on each project page.",
    icon: "▦",
    tint: "bg-jamin-gold-soft text-jamin-gold-ink",
  },
  {
    k: "Clear, marketable title",
    d: "Title and encumbrance are checked before a single plot is offered, and the documents are on the page for you to read.",
    icon: "✓",
    tint: "bg-canopy-soft text-canopy",
  },
  {
    k: "Roads, water, drains",
    d: "Internal roads formed to the sanctioned width, common water to every plot, storm-water drains and street lighting by the promoter.",
    icon: "⌁",
    tint: "bg-jamin-red-soft text-jamin-red-deep",
  },
  {
    k: "Loan assistance",
    d: "Plot purchase loans arranged with leading banks for eligible buyers on approved layouts.",
    icon: "₹",
    // Burgundy, not earth. Earth measures 4.11:1 on champagne and fails AA even
    // for a glyph; burgundy is 9.7:1 and is the deeper tone the palette already
    // carries for exactly this kind of accent.
    tint: "bg-canvas-sunken text-burgundy",
  },
];

export default async function HomePage() {
  const [all, facets] = await Promise.all([getProperties(), getNavFacets()]);
  const slides = buildSlides(all);
  const live = all.filter(isSellable);
  const completed = all.filter((p) => !isSellable(p));
  const districts = facets.districts.map((d) => d.label);

  return (
    <>
      <Hero slides={slides} />

      {/* ---- what we are, in plain search terms ---- */}
      <Container className="py-phi6">
        <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
          <div>
            <SectionLabel>Plotted development in Tamil Nadu</SectionLabel>
            <h2 className="mt-phi3 max-w-2xl text-3xl text-ink">
              Land is the one purchase where the paperwork matters more than the pitch.
            </h2>
            <div className="mt-phi3 max-w-2xl space-y-phi2 text-lg leading-relaxed text-ink-soft">
              <p>
                Jamin Properties plans and sells residential plots in approved layouts across{" "}
                {districts.length > 1
                  ? `${districts.slice(0, -1).join(", ")} and ${districts[districts.length - 1]}`
                  : "Tamil Nadu"}
                . Each development is DTCP sanctioned, the title is checked before anything is
                offered, and the roads, water and open space are formed to the plan rather than
                promised for later.
              </p>
              <p>
                We publish the approval number, the survey numbers, the area statement and the
                plot-by-plot schedule on every project page — so you can do the checks that matter
                before you spend a morning driving to site.
              </p>
            </div>
          </div>

          <dl className="grid content-start gap-phi2">
            {ASSURANCES.map((a) => (
              <div
                key={a.k}
                className="flex gap-phi2 rounded-card border border-line/70 bg-canvas p-phi2 transition-all duration-500 hover:-translate-y-0.5 hover:border-line hover:shadow-lift"
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                <span
                  aria-hidden="true"
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] text-base ${a.tint}`}
                >
                  {a.icon}
                </span>
                <div>
                  <dt className="text-base font-semibold text-ink">{a.k}</dt>
                  <dd className="mt-1 text-base leading-relaxed text-ink-muted">{a.d}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>
      </Container>

      {/* ---- live inventory ---- */}
      <Container className="pb-phi6">
        <div className="flex flex-wrap items-end justify-between gap-phi3 border-t border-line pt-phi5">
          <div>
            <SectionLabel>Now selling</SectionLabel>
            <h2 className="mt-phi3 text-3xl text-ink">Plots available today</h2>
            <p className="mt-phi3 max-w-xl text-lg leading-relaxed text-ink-muted">
              {facets.totals.plotsAvailable > 0
                ? `${facets.totals.plotsAvailable} plots across ${live.length} approved layouts, with live availability on every plan.`
                : "Approved layouts with live availability on every plan."}
            </p>
          </div>
          <Link
            href="/properties"
            className="text-tiny font-semibold uppercase tracking-[0.14em] text-jamin-red-deep transition-opacity hover:opacity-70"
          >
            All properties →
          </Link>
        </div>

        <div className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
          {live.map((p, i) => (
            <PropertyCard key={p.id} p={p} priority={i === 0} />
          ))}
        </div>
      </Container>

      {/* ---- from plan to plot: the motif, made literal ---- */}
      <section className="relative overflow-hidden border-y border-line bg-canvas-alt">
        <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <Container className="relative py-phi6">
          <div className="grid items-center gap-phi5 lg:grid-cols-[1fr_1.1fr]">
            <div className="max-w-xl">
              <SectionLabel>How a Jamin plot happens</SectionLabel>
              <h2 className="mt-phi3 text-3xl text-ink">
                From sanctioned drawing to a plot you stand on.
              </h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                Four stages, in this order, every time. Nothing is offered for sale before the
                stage above it is finished and on paper.
              </p>
            </div>
            {/* The one image in the supplied set that IS this idea — a house
                half in red line-work, half built. Brand imagery, so it carries
                no caption claiming to be a Jamin project. */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <Image
                src="/hero/hero-05-1823.webp"
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover"
              />
            </div>
          </div>

          <ol className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Land and title", "We buy only where the chain of title is continuous and the encumbrance is clean.", "bg-canopy"],
              ["Sanctioned layout", "The plan goes to the planning authority. Plot boundaries, road widths and open space are fixed by that approval.", "bg-jamin-gold"],
              ["Formed on the ground", "Roads laid to the sanctioned width, water and drains run, open space handed to the local body.", "bg-terracotta"],
              ["Registered to you", "You see the plot, the plan and the documents, then the sale is registered in your name.", "bg-jamin-red"],
            ].map(([t, d, bar], n) => (
              <li key={t} className="rounded-card bg-canvas/70 p-phi3 backdrop-blur-sm">
                <span className={`block h-1 w-10 rounded-full ${bar}`} aria-hidden="true" />
                <span className="mt-phi2 block text-tiny font-semibold tabular-nums text-ink-faint">
                  {String(n + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-1 text-lg text-ink">{t}</h3>
                <p className="mt-1.5 text-base leading-relaxed text-ink-muted">{d}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---- where we build: colour, and four real internal links ---- */}
      {districts.length > 0 && (
        <Container className="py-phi6">
          <div className="flex flex-wrap items-end justify-between gap-phi3">
            <div className="max-w-xl">
              <SectionLabel>Where we build</SectionLabel>
              <h2 className="mt-phi3 text-3xl text-ink">Districts with Jamin land today</h2>
            </div>
          </div>
          <div className="mt-phi4 grid gap-phi2 sm:grid-cols-2 lg:grid-cols-4">
            {facets.districts.map((d, i) => (
              <Link
                key={d.key}
                href={d.href}
                className={`group relative overflow-hidden rounded-xl border border-line p-phi3 transition-all duration-500 hover:-translate-y-1 hover:shadow-lift ${
                  ["bg-canopy-soft", "bg-jamin-gold-soft", "bg-jamin-red-soft", "bg-canvas-sunken"][i % 4]
                }`}
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                <span className="block text-xl text-ink">{d.label}</span>
                <span className="mt-1 block text-tiny text-ink-muted">
                  {d.count} development{d.count === 1 ? "" : "s"}
                </span>
                <span className="mt-phi3 block text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-transform duration-500 group-hover:translate-x-1">
                  Plots in {d.label} →
                </span>
              </Link>
            ))}
          </div>
        </Container>
      )}

      {/* ---- track record ---- */}
      {completed.length > 0 && (
        <Container className="py-phi6">
          <SectionLabel>Track record</SectionLabel>
          <h2 className="mt-phi3 text-3xl text-ink">Delivered and handed over</h2>
          <p className="mt-phi3 max-w-xl text-lg leading-relaxed text-ink-muted">
            Completed layouts where every plot is now with its owner. Shown in full, because a track
            record is only worth something if you can inspect it.
          </p>
          <div className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
            {completed.map((p) => (
              <PropertyCard key={p.id} p={p} />
            ))}
          </div>
        </Container>
      )}

      {/* ---- closing ---- */}
      <Container className="pb-phi7">
        <div className="relative isolate overflow-hidden rounded-xl bg-charcoal">
          {/* A photograph rather than a flat black panel. The copy sits in the
              bottom-left, which is the corner `veil` makes darkest, so white
              type holds AA whatever the picture is doing behind it. */}
          <Image
            src="/hero/hero-02-1920.webp"
            alt=""
            aria-hidden="true"
            fill
            sizes="(max-width: 1280px) 100vw, 1200px"
            className="object-cover object-center"
          />
          <div className="veil absolute inset-0" aria-hidden="true" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rule-red" />
          <div className="relative max-w-2xl px-phi4 py-phi6 lg:px-phi6 lg:py-phi7">
            <h2 className="text-3xl text-white">Walk the land before you decide.</h2>
            <p className="mt-phi3 text-lg leading-relaxed text-white/85">
              Pick a date and a time that suits you. We will show you the approvals, walk the plot
              boundaries against the sanctioned plan, and answer the awkward questions. No payment,
              no obligation.
            </p>
            <div className="mt-phi4 flex flex-wrap gap-3">
              <ButtonLink href="/contact">Book a site visit</ButtonLink>
              <Link
                href="/properties"
                className="glass-dark inline-flex items-center rounded-full px-6 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-500 hover:-translate-y-0.5"
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                Browse plots first
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </>
  );
}
