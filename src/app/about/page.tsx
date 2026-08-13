import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { LedgerCount } from "@/components/cadastral/LedgerCount";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";
import { getProperties, isSellable } from "@/lib/properties";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "About Jamin Properties",
  description:
    "Jamin Properties develops DTCP-approved residential plotted layouts across Tamil Nadu, with clear and marketable title, wide internal roads and bank loan assistance.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  {
    t: "Approved before it is offered",
    d: "Every layout carries planning-authority approval. We do not pre-sell land that is still waiting on paperwork.",
  },
  {
    t: "Clear and marketable title",
    d: "Title is verified up front, and the documents are yours to inspect — before you commit, not after.",
  },
  {
    t: "Built to be built on",
    d: "Wide internal roads, common water supply and demarcated boundaries, so construction can begin immediately.",
  },
  {
    t: "Published, not promised",
    d: "Site progress is photographed and published as work proceeds. What you see is the site as it stands today.",
  },
];

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
        art={19}
        tone="cinematic"
        size="tall"
        sheer
        /* Swept on this frame, not copied. The brightest frame the site carries: white 4.96, gold 4.59 at blur 16. */
        sheerAlpha={0.14}
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

      <section className="mt-phi6 grid gap-phi4 sm:grid-cols-2">
        {PRINCIPLES.map((p) => (
          <div key={p.t}>
            <h2 className="text-xl text-ink">{p.t}</h2>
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
    </>
  );
}
