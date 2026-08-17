import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { LedgerCount } from "@/components/cadastral/LedgerCount";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";
import { CallbackBand } from "@/components/CallbackBand";
import { getProperties, isSellable } from "@/lib/properties";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Jamin Properties",
  description:
    "Jamin Properties develops DTCP-approved residential plotted layouts across Tamil Nadu, with clear and marketable title, wide internal roads and bank loan assistance.",
  alternates: { canonical: "/about" },
};

/**
 * ⚠️ THE ICONS ARE DRAWN MARKS, NOT DECORATION, and the pairing is not
 * arbitrary: `stamp` is an approval impression, `deed` a title document,
 * `junction` a formed road meeting another, `ledger` a record kept as work
 * proceeds. Each is the instrument the sentence beside it is about. Adding a
 * fifth principle means finding a mark that passes the same test — see
 * `SurveyIcon`, which exists because a Unicode glyph is rendered by whatever
 * font the reader's device happens to own.
 */
const PRINCIPLES = [
  {
    icon: "stamp",
    t: "Approved before it is offered",
    d: "Every layout carries planning-authority approval. We do not pre-sell land that is still waiting on paperwork.",
  },
  {
    icon: "deed",
    t: "Clear and marketable title",
    d: "Title is verified up front, and the documents are yours to inspect — before you commit, not after.",
  },
  {
    icon: "junction",
    t: "Built to be built on",
    d: "Wide internal roads, common water supply and demarcated boundaries, so construction can begin immediately.",
  },
  {
    icon: "ledger",
    t: "Published, not promised",
    d: "Site progress is photographed and published as work proceeds. What you see is the site as it stands today.",
  },
] as const;

export default async function AboutPage() {
  const all = await getProperties();
  const live = all.filter(isSellable);
  const delivered = all.filter((p) => !isSellable(p));
  const plots = all.reduce((n, p) => n + (p.plots_total ?? 0), 0);

  return (
    <>
      {/* ⚠️ hero-19 has the JAMIN BAZAAR name rendered into the gate, so it is
          the one frame in the set that identifies itself. It is still a render,
          not a photograph of a delivered layout, which is exactly why it stays
          uncaptioned and out of the accessibility tree — the no-caption rule in
          public/hero/README.md binds harder here than anywhere else. */}
      <PageHero
        /* hero-56 — the curving avenue and lockup wall, FLOWERED GATES set
           2026-08-17 evening, replacing City of Dreams the same day. */
        art={56}
        tone="cinematic"
        size="tall"
        sheer
        /* Swept on this frame, not copied. The brightest frame the site carries: white 4.96, gold 4.59 at blur 16. */
        /* 0.58 for hero-50 — re-swept, not carried (the pair rule). At the
           old 0.14 this bright daylight frame fails outright; 0.58 matches the
           audited hero-38 figure at the same geometry. */
        sheerAlpha={0.58}
        eyebrow="Who we are"
        title="Land, sold the way it should be."
        lead="Jamin Properties plans and delivers DTCP-approved residential plotted developments across Tamil Nadu — in Salem, Erode, Coimbatore and Tiruppur. We sell to families who intend to build and to investors who intend to hold, and we would rather say “not published yet” than quote a number we cannot stand behind."
      />
      <Container className="py-phi5">

      {/* 🚨 THE LEDGER PANEL — figures computed from the live database, never
          hand-typed, and as of 2026-08-13 no longer three loose divs.

          Reported as "displayed as plain text with minimal visual hierarchy…
          the numbers do not stand out strongly enough… too much unused
          whitespace… does not feel like a single, intentionally designed
          section", and every one of those was fair. Three bare `<div>`s in a
          `sm:grid-cols-3` collapse to a single column on a phone, so the reader
          got three stacked lines with a `gap-phi3` trench between each figure
          and its own caption — the whitespace was not decoration, it was the
          grid gap doing the wrong job at the wrong breakpoint.

          What it is now, all of it borrowed rather than invented — this site
          already had a house style for figures and this section simply was not
          using it:

          • `LedgerCount` + `.ledger` tabular figures, the same component the
            footer's totals use. It counts up on the way in and renders the
            final value server-side, so a crawler and a reader with reduced
            motion both see the number.
          • `SurveyIcon` — drawn marks traceable to a land document, never a
            lifestyle pictogram. `building` for what is selling, `stamp` for
            what is registered and handed over, `ledger` for the plot schedule.
          • The gold hairline and the `gilt`-edged card, so it reads as one
            deliberate block rather than three sentences that happen to be near
            each other.

          ⚠️ THE MOBILE LAYOUT IS A ROW, NOT A STACK, and that is the actual fix
          for the whitespace. Below `sm` each figure is `flex items-baseline`
          with the number and its label on ONE line, divided by a rule — the
          section goes from about 210px of mostly-empty column to three compact
          ruled rows. Stacking only starts at `sm`, where there are three
          columns to stack inside. */}
      <section
        aria-labelledby="jamin-figures"
        className="mt-phi5 overflow-hidden rounded-card border border-line bg-canvas-alt"
      >
        <h2 id="jamin-figures" className="sr-only">
          Jamin in figures
        </h2>
        <div className="h-px w-full rule-gold" aria-hidden="true" />
        <dl className="grid divide-y divide-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
          {(
            [
              ["building", live.length, "developments currently selling"],
              ["stamp", delivered.length, "completed and handed over"],
              ["ledger", plots, "plots planned across all projects"],
            ] as const
          ).map(([icon, value, label]) => (
            <div
              key={label}
              className="flex items-baseline gap-phi3 p-phi3 sm:block sm:p-phi4"
            >
              {/* ⚠️ `text-4xl` at every width, NOT `sm:text-5xl`. The scale here
                  is fluid — `text-5xl` clamps to 6.854rem, which measured 109px
                  at 1280 and turned a statistic into a hero headline. `text-4xl`
                  runs 41.6px on a phone to 67.8px on a desktop, which is louder
                  than the `text-3xl` this replaced and still reads as a figure. */}
              <dd className="flex shrink-0 items-center gap-2.5 text-4xl leading-none text-jamin-red-deep">
                <SurveyIcon
                  name={icon}
                  className="h-[22px] w-[22px] self-center text-jamin-gold sm:h-7 sm:w-7"
                />
                <LedgerCount value={value} className="ledger" />
              </dd>
              {/* `min-w-0` because the third label is long and this is a flex
                  item on a phone — a flex item's default minimum is its content,
                  which is the same trap the footer's district column paid for. */}
              <dt className="ledger-label min-w-0 sm:mt-phi2 sm:block">{label}</dt>
            </div>
          ))}
        </dl>
      </section>

      {/* 🚨 FOUR CARDS IN A 2×2, WHERE THIS WAS FOUR PARAGRAPHS IN A GRID.
          Reported 2026-08-13: "the four key points currently appear as plain
          text, making the section look flat… convert them into four highlighted
          cards in a 2×2 layout… subtle borders, rounded corners, soft shadows,
          gold icons and accent lines". Every one of those is a token this site
          already owns — `rounded-card`, `border-line`, `shadow-lift`,
          `rule-gold`, `SurveyIcon` — so nothing new was invented for it.

          ⚠️ `sm:grid-cols-2` and no `lg:grid-cols-4`. The report asked for 2×2
          and 2×2 is right: these are four sentences of argument, not four
          statistics, and at a quarter of the width each would set to five ragged
          lines. The section keeps its measure. */}
      <section className="mt-phi6 grid gap-phi3 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div
            key={p.t}
            className="rounded-card border border-line bg-canvas p-phi3 shadow-lift transition-shadow duration-500 hover:shadow-raise sm:p-phi4"
          >
            <span
              aria-hidden="true"
              className="flex h-11 w-11 items-center justify-center rounded-[12px] bg-jamin-gold-soft text-jamin-gold-ink"
            >
              <SurveyIcon name={p.icon} className="h-[23px] w-[23px]" />
            </span>
            {/* The accent line the report asked for — `rule-gold` is the site's
                own gradient hairline, the one under BAZAAR in the logo. */}
            <span className="mt-phi3 block h-px w-12 rule-gold" aria-hidden="true" />
            <h2 className="mt-phi3 text-xl text-ink">{p.t}</h2>
            <p className="mt-phi2 text-base leading-relaxed text-ink-muted">{p.d}</p>
          </div>
        ))}
      </section>

      <section className="mt-phi6">
        <Link
          href="/properties"
          className="inline-block rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
        >
          See our developments
        </Link>
      </section>
      </Container>
      {/* Anti-beige item 6: a thin full-bleed strip of the spare stone-pillar
          gate (hero-53) breaks the long sand read before the desk — imagery
          is the site's strongest non-beige asset and it only lived in heroes.
          Brand imagery under the standing rule: alt="", aria-hidden, never a
          caption. */}
      <div className="relative h-40 w-full overflow-hidden border-y border-line lg:h-56" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/hero/hero-53-1774.webp"
          srcSet="/hero/hero-53-768.webp 768w, /hero/hero-53-1280.webp 1280w, /hero/hero-53-1774.webp 1774w"
          sizes="100vw"
          alt=""
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
          style={{ objectPosition: "50% 42%" }}
        />
      </div>

      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
