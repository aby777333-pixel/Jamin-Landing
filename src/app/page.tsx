import Image from "next/image";
import Link from "next/link";
import type { Metadata } from "next";
import { Hero, type Slide } from "@/components/Hero";
import { Sweep } from "@/components/brand/Sweep";
import { LocationExplorer } from "@/components/LocationExplorer";
import { PropertyCard } from "@/components/PropertyCard";
import { PurposeExplorer } from "@/components/PurposeExplorer";
import { Container, SectionLabel, ButtonLink } from "@/components/ui";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";
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
    icon: "stamp" as const,
    tint: "bg-jamin-gold-soft text-jamin-gold-ink",
    ground: "bg-jamin-gold-soft/45",
  },
  {
    k: "Clear, marketable title",
    d: "Title and encumbrance are checked before a single plot is offered, and the documents are on the page for you to read.",
    icon: "deed" as const,
    tint: "bg-canopy-soft text-canopy",
    ground: "bg-canopy-soft/45",
  },
  {
    k: "Roads, water, drains",
    d: "Internal roads formed to the sanctioned width, common water to every plot, storm-water drains and street lighting by the promoter.",
    icon: "junction" as const,
    tint: "bg-jamin-red-soft text-jamin-red-deep",
    ground: "bg-jamin-red-soft/45",
  },
  {
    k: "Loan assistance",
    d: "Plot purchase loans arranged with leading banks for eligible buyers on approved layouts.",
    icon: "ledger" as const,
    // Burgundy, not earth. Earth measures 4.11:1 on champagne and fails AA even
    // for a glyph; burgundy is 9.7:1 and is the deeper tone the palette already
    // carries for exactly this kind of accent.
    tint: "bg-canvas-sunken text-burgundy",
    ground: "bg-canvas-sunken/70",
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
      <Hero slides={slides} districts={facets.districts} />

      {/* ---- FEATURE 1: explore by purpose ----
          Directly below the hero console, because the console asks "where?" and
          this asks "what for?" — the two questions a visitor arrives with. A
          purpose with no inventory says so and routes to the desk rather than
          filtering to an empty page; see lib/purpose.ts for why two of the four
          are closed today. */}
      <Container className="pt-phi6">
        <PurposeExplorer all={all} />
      </Container>

      {/* ---- what we are, in plain search terms ---- */}
      <Container className="py-phi6">
        <div className="grid gap-phi4 lg:grid-cols-[1.618fr_1fr]">
          {/* On the page's own canvas this block was a slab of text with nothing
              holding it. The card is ivory on warm white — a step of luminance,
              not a colour — with the gold hairline the rest of the system opens
              a section with. Subtle enough that it reads as paper, not as a
              callout box. */}
          {/* ⚠️ `p-phi4 lg:p-phi4` and `overflow-hidden`, down from `lg:p-phi5`
              — reported 2026-08-14 as unused space in this panel. It is the
              tall half of a two-column band, so its own padding was being added
              to height it already had from the grid.

              ⚠️ THE STAMP IS DRAWN, NOT FETCHED. The report asked for "a image
              for the left side context", and the mockup shows an approval
              stamp. `SurveyIcon name="stamp"` already IS that drawing — the
              rubber impression with the tick — and this file's standing rule is
              that one decorative mark should not cost a request. Oversized,
              very faint, bottom-right, `aria-hidden`: it reads as watermarked
              paper behind the copy rather than as an illustration beside it.
              A photograph here would also have to obey the brand-imagery rule
              (no caption, `alt=""`), which is a lot of freight for texture. */}
          {/* ⚠️ `isolate` + `-z-10` on the mark, and both are required. A
              positioned element paints ABOVE its static siblings, so an
              absolute watermark declared first still lands on top of the
              copy — even at 6% it would tint the headline. `isolate` opens a
              stacking context on this panel so a negative z-index drops the
              stamp behind the text without escaping to sit behind the panel's
              own background. */}
          <div className="relative isolate flex h-full flex-col overflow-hidden rounded-xl border border-line bg-canvas-alt p-phi4">
            <SurveyIcon
              name="stamp"
              size="h-64 w-64"
              className="pointer-events-none absolute -bottom-10 -right-8 -z-10 text-jamin-red/[0.06]"
            />
            <span className="mb-phi3 block h-px w-16 rule-gold" aria-hidden="true" />
            <SectionLabel>Plotted development in Tamil Nadu</SectionLabel>
            <h2 className="mt-phi3 max-w-2xl text-2xl text-ink">
              Land is the one purchase where the paperwork matters more than the pitch.
            </h2>
            <div className="mt-phi3 max-w-2xl space-y-phi2 text-base leading-relaxed text-ink-soft">
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

          {/* `content-between` so the four tiles distribute across the row rather
              than stacking at the top and leaving the column visibly short
              beside the card. */}
          <dl className="grid h-full content-between gap-phi2">
            {ASSURANCES.map((a) => (
              <div
                key={a.k}
                className={`flex gap-phi2 rounded-card border border-line/70 ${a.ground} p-phi2 transition-all duration-500 hover:-translate-y-0.5 hover:border-line hover:shadow-lift`}
                style={{ transitionTimingFunction: "var(--ease-silk)" }}
              >
                {/* Drawn, not typed — see components/cadastral/SurveyIcon. */}
                <span
                  aria-hidden="true"
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] ${a.tint}`}
                >
                  <SurveyIcon name={a.icon} className="h-[22px] w-[22px]" />
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
              {/* ⚠️ This copy is deliberately the one warm passage on the page,
                  and it still has to hand over to the four stages below it —
                  the <ol> that follows has no other introduction. So it opens on
                  the picture a buyer already carries and closes on the process,
                  in that order. Note what it does NOT do: it makes no claim
                  about what buyers feel or why they buy. It describes a picture
                  and then asks whether it is yours, which is the difference
                  between evoking something and asserting it. */}
              <SectionLabel>The place you are from</SectionLabel>
              <h2 className="mt-phi3 text-3xl text-ink">
                Somewhere your children will say they are from.
              </h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-soft">
                A tiled roof, a field running down to the hills, an address the whole family knew
                by heart. If that is the picture in your head, the way back to it is unromantic:
                four stages, in this order, every time, and nothing is offered for sale before the
                stage above it is finished and on paper.
              </p>
            </div>
            {/* hero-22, supplied 2026-08-09. Trimmed from the original, which
                bakes in a JAMIN BAZAAR lockup and a gold temple line-art — a
                second logo inside a content card duplicates the header, so the
                renditions are cut at x=580, right of both.

                ⚠️ Brand imagery, and here the caption discipline matters more
                than usual: beside copy about the place you are from, a reader
                could easily take this for a Jamin site. It is a render of
                nowhere. It carries no caption and must never be given one. */}
            <div className="relative aspect-[16/10] overflow-hidden rounded-xl">
              <Image
                /* ⚠️ `family-keeps`, owner-supplied 2026-08-17 as "move better
                   image.png", replacing hero-42 — same subject (the family
                   room, the rain outside, the wall lockup) redrawn WITHOUT the
                   baked competing headline hero-42 carried, which closes the
                   two-headlines flag recorded here. 1536x1024 (1.5:1), so the
                   16/10 box crops ~6% of the HEIGHT now instead of width, and
                   centre keeps everything: object-right retired with the text
                   it existed to protect. New filename per the next/image
                   cache rule. */
                src="/section/family-keeps-1536.webp"
                alt=""
                aria-hidden="true"
                fill
                sizes="(max-width: 1024px) 100vw, 55vw"
                className="object-cover object-center"
              />
            </div>
          </div>

          {/* ⚠️ SOLID STAGE COLOUR (owner 2026-08-17: "the beige are too much
              everywhere") — the 10px accent stub grew into a full-width 6px
              bar, the index takes the stage's own ink, and each card face
              carries a whisper of its stage colour so the four read as four
              STEPS in four materials rather than four beige boxes. Stage 04
              stays the signal red — the resolved fact ends the sequence, the
              same move the reference creative makes. Text colours are the
              audited ink cousins, never the fills (the fill/word rule). */}
          <ol className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Land and title", "We buy only where the chain of title is continuous and the encumbrance is clean.", "bg-canopy", "text-canopy", "var(--color-canopy)"],
              ["Sanctioned layout", "The plan goes to the planning authority. Plot boundaries, road widths and open space are fixed by that approval.", "bg-jamin-gold", "text-jamin-gold-ink", "var(--color-jamin-gold)"],
              ["Formed on the ground", "Roads laid to the sanctioned width, water and drains run, open space handed to the local body.", "bg-terracotta", "text-jamin-gold-ink", "var(--color-terracotta)"],
              ["Registered to you", "You see the plot, the plan and the documents, then the sale is registered in your name.", "bg-jamin-red", "text-jamin-red-deep", "var(--color-jamin-red)"],
            ].map(([t, d, bar, ink, stone], n) => (
              <li
                key={t}
                className="overflow-hidden rounded-card bg-canvas/70 backdrop-blur-sm"
                style={{ background: `color-mix(in srgb, ${stone} 7%, var(--color-canvas))` }}
              >
                <span className={`block h-1.5 w-full ${bar}`} aria-hidden="true" />
                <div className="p-phi3">
                  <span className={`block text-tiny font-semibold tabular-nums ${ink}`}>
                    {String(n + 1).padStart(2, "0")}
                  </span>
                  <h3 className="mt-1 text-lg text-ink">{t}</h3>
                  <p className="mt-1.5 text-base leading-relaxed text-ink-muted">{d}</p>
                </div>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ---- FEATURE 2: the interactive location explorer ----
          Replaces the grid of four coloured district tiles. The interaction is
          district → projects on the map → project → its plots, and every step
          of that already existed somewhere on this site — `PropertiesMap` is
          the same OSM map the properties page uses, and the property page it
          links to carries the plot plan. What was missing was the first step.
          "Plots available today" stays above this and the record below it. */}
      {facets.districts.length > 0 && (
        <Container className="py-phi6">
          {/* Same empty-right-half problem as the purpose section above, and the
              photograph the owner chose for it — a Jamin entrance wall with a
              layout being built behind it: gardeners planting, a roller and a
              backhoe on the unmade road. Owner-supplied 2026-08-13, replacing
              the paddy-at-low-sun frame that had been here since 08-11.

              ⚠️ A NEW FILENAME, not a new file at the old path. `next/image`
              keys its optimised output by source path, so overwriting
              `where-we-build-1672.webp` would let a warm build keep serving the
              old picture from a deploy that looks correct. Same trap recorded
              against hero-27 and against purpose-gate.

              ⚠️ IT IS THE SAME PICTURE AS hero-39 ON /locations/tiruppur, which
              breaks the register's one-frame-one-surface rule for the first
              time. Owner's choice, made with the frame already live there. The
              two are a scroll apart for anyone who lands here and then opens
              Tiruppur, so if it ever reads as a repeat the cheap fix is to give
              that district page hero-36 back — it is in the spare pile, already
              swept at the same 0.52, and nothing else has claimed it.

              🚨 Brand imagery, and the rule binds HARDER than it did on the
              paddy: this frame carries the JAMIN BAZAAR lockup and is drawn to
              look like documentary evidence of a site under construction, and
              it sits directly above a map of real Jamin developments with real
              pins on it. `alt=""`, `aria-hidden`, and never a caption, a
              location or a project name. Hidden below `lg`, where the column is
              full width anyway. */}
          <div className="grid items-center gap-phi4 lg:grid-cols-[1fr_0.9fr]">
            <div className="max-w-xl">
              <SectionLabel>Where we build</SectionLabel>
              <h2 className="mt-phi3 text-3xl text-ink">Find land near you</h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                Pick a district to see every Jamin development in it on the map, then open a project
                to walk its plot plan.
              </p>
            </div>

            <div className="relative hidden aspect-[16/9] min-w-0 overflow-hidden rounded-xl border border-line lg:block">
              <Image
                src="/section/where-we-build-gate-1881.webp"
                alt=""
                aria-hidden="true"
                fill
                sizes="45vw"
                className="object-cover object-center"
              />
            </div>
          </div>
          <LocationExplorer items={all} />
        </Container>
      )}

      {/* ---- FEATURE 3: plan your property investment ----
          Four tools, four cards, one destination. They sit AFTER the inventory
          and the map because the sum only becomes interesting once somebody has
          seen something they want; leading with a calculator would open the
          page on arithmetic.

          ⚠️ Every card lands on a working calculator at /tools, not on a
          "coming soon". The app links on this site are withdrawn until the
          Play Store listing exists, so borrowing the app's tools was not an
          option — they are rebuilt for the web. */}
      <section className="border-y border-line bg-canvas-alt py-phi6">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-phi3">
            <div className="max-w-xl">
              <SectionLabel>Before you commit</SectionLabel>
              <h2 className="mt-phi3 text-3xl text-ink">Plan your property investment</h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                Four calculators, using your figures rather than ours. Jamin publishes no rate, so
                every number is one you enter.
              </p>
            </div>
            <Link
              href="/tools"
              className="text-tiny font-semibold uppercase tracking-[0.14em] text-jamin-red-deep transition-opacity hover:opacity-70"
            >
              Open all four →
            </Link>
          </div>

          <ul className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["emi", "EMI calculator", "Estimate your monthly EMI.", "ledger", "bg-jamin-gold-soft/50"],
              ["eligibility", "Loan eligibility", "Check your eligible loan amount.", "stamp", "bg-canopy-soft/50"],
              ["cost", "Purchase cost", "Understand the complete cost of buying a plot.", "deed", "bg-jamin-red-soft/45"],
              ["yield", "Rental yield", "Estimate potential rental returns.", "growth", "bg-canvas-sunken/80"],
            ].map(([anchor, title, note, icon, ground]) => (
              <li key={anchor} className="flex">
                <Link
                  href={`/tools#${anchor}`}
                  className={`group flex w-full flex-col rounded-xl border border-line ${ground} p-phi3 transition-all duration-500 hover:-translate-y-1 hover:border-ink-faint hover:shadow-lift`}
                  style={{ transitionTimingFunction: "var(--ease-silk)" }}
                >
                  <span
                    aria-hidden="true"
                    className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-canvas/70 text-jamin-gold-ink"
                  >
                    <SurveyIcon name={icon as never} className="h-[23px] w-[23px]" />
                  </span>
                  <span className="mt-phi3 block text-xl text-ink">{title}</span>
                  <span className="mt-phi2 block flex-1 text-base leading-relaxed text-ink-muted">
                    {note}
                  </span>
                  <span className="mt-phi3 block text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-transform duration-500 group-hover:translate-x-1">
                    Open →
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </section>

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
      {/* ⚠️ No bottom padding here. The footer already carries `mt-phi7`, and this
          container carried `pb-phi7` as well — 9rem on top of 9rem, which put
          roughly 288px of empty canvas between the closing band and the footer
          and read as the page having ended early. The footer's own margin is
          the separation. */}
      <Container>
        {/* ⚠️ THE COPY CAME OFF THE FOOTAGE, 2026-08-11. It used to sit over the
            video with a `veil` behind it, which is the right treatment for a
            still and the wrong one for this clip: somebody is speaking to
            camera, and a heading laid across her face reads as a caption burnt
            into the film. So the band is two panels now — the words on the
            charcoal ground, the footage beside them, neither on top of the
            other. The `veil` went with the overlay; nothing is over the picture
            any more, so there is nothing left for it to protect.

            ⚠️ THE VIDEO HAS CONTROLS AND SOUND. It is no longer decoration —
            a person is talking, so muting her and hiding the controls threw the
            content away. `controls` is the native set (play, scrub, volume,
            full screen), which is also the accessible one: it is keyboard
            operable and screen-reader labelled without this page writing a
            single button. It does NOT autoplay: audio that starts by itself is
            the thing every browser blocks and every reader resents. */}
        <div className="relative isolate overflow-hidden rounded-xl bg-charcoal">
          <div className="pointer-events-none absolute inset-x-0 top-0 h-px rule-red" />
          {/* ⚠️ VERTICAL PADDING IS ONE RUNG DOWN THE SCALE FROM THE HORIZONTAL
              (2026-08-14). It was `py-phi6 lg:py-phi7` — and phi7 is 9rem, so
              the band carried 288px of empty charcoal on a desktop, against
              content that is a heading, three lines and two buttons on one side
              and a 16:9 video on the other. Reported as the section being
              taller than it needs to be, and it was: the padding alone was
              close to the height of the thing it framed.

              phi5/phi6 rather than a hand-picked rem, because the whole system
              is the golden-ratio scale — stepping off it here would make this
              the one band whose rhythm does not match the sections above it.
              The HORIZONTAL padding is deliberately left where it is: it sets
              the measure of the copy column, which was not what was reported
              and which the two-panel layout depends on. */}
          <div className="relative grid items-center gap-phi5 px-phi4 py-phi5 lg:grid-cols-2 lg:px-phi6 lg:py-phi6">
            {/* ⚠️ Centred on a phone only, and the buttons fill the card there
                — the same rule as the hero plate, reported in the same round
                and for the same reason. From `sm` this is the left half of a
                two-panel band sitting beside a video, where centred body copy
                would read as a pull-quote rather than as the lead into two
                controls. */}
            <div className="min-w-0 max-w-2xl text-center sm:text-left">
              <h2 className="text-3xl text-white">Walk the land before you decide.</h2>
              <p className="mt-phi3 text-lg leading-relaxed text-white/85">
                Pick a date and a time that suits you. We will show you the approvals, walk the plot
                boundaries against the sanctioned plan, and answer the awkward questions. No payment,
                no obligation.
              </p>
              <div className="mt-phi4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                {/* `ButtonLink`'s base is already `inline-flex justify-center`,
                    so it centres its own label once the column stretches it —
                    only the bare `<Link>` beside it needs `text-center`. */}
                <ButtonLink href="/contact">Book a site visit</ButtonLink>
                <Link
                  href="/properties"
                  className="glass-dark inline-flex items-center justify-center rounded-full px-6 py-3 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-500 hover:-translate-y-0.5"
                  style={{ transitionTimingFunction: "var(--ease-silk)" }}
                >
                  Browse plots first
                </Link>
              </div>
            </div>

            {/* ⚠️ `min-w-0` again — a video element carries an intrinsic width
                and a grid item's `min-width: auto` is its content's minimum, so
                without it this column refuses to shrink and takes the page
                sideways. Exactly the failure the location explorer hit. */}
            <div className="min-w-0">
              {/* ⚠️ THE SOURCE WAS 42.9 MB AND COULD NOT SHIP AS IT WAS.
                  Re-encoded 24fps H.264 at CRF 30 with `faststart`, in two
                  widths: 3.67 MB at 1280 and 1.80 MB at 854 — a 92% reduction
                  with no visible loss at the size this band renders. Anyone
                  replacing the clip must re-encode it; dropping a phone
                  recording straight in here would cost more than every image on
                  this page put together.

                  ⚠️ IT CARRIES AUDIO, and that is why the encode changed with
                  the layout. The first pass was `-an` because a background loop
                  must be muted to autoplay at all — which would have left the
                  volume control sitting over a silent track. Re-encoded at CRF
                  28 with AAC 128k: 4.83 MB, and `preload="metadata"` means only
                  the header is fetched until somebody presses play. */}
              <video
                controls
                preload="metadata"
                playsInline
                poster="/video/walk-the-land-poster.jpg"
                className="aspect-video w-full rounded-card bg-black"
              >
                <source src="/video/walk-the-land-1280.mp4" type="video/mp4" />
                Your browser cannot play this video.
              </video>
            </div>
          </div>
        </div>
      </Container>

      {/* CARTOUCHE §4.2 — the Sweep, surface 1 of exactly 3 (here, /contact,
          and the foot of /property/[slug]). The red quarter-round is the
          site's contact-and-conversion mark; adding it anywhere else spends
          the signature. */}
      <div className="mt-phi6">
        <Sweep lead="Speak to the desk" />
      </div>
    </>
  );
}
