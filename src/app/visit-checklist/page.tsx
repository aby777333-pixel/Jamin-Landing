import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container, Pane } from "@/components/ui";
import { paneHue } from "@/lib/stones";
import { PassportButton } from "@/components/PassportButton";
import { PrintDate } from "@/components/PrintDate";
import { CallbackBand } from "@/components/CallbackBand";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Site-Visit Checklist — What to Verify on the Ground",
  description:
    "A printable checklist for visiting a plotted development: what to check at the gate, on the plot and in the paperwork before you decide.",
  alternates: { canonical: "/visit-checklist" },
};

/**
 * The printable site-visit checklist (do-all round, 2026-08-18).
 *
 * The deed-sheet print system already turns a route into a filed document —
 * chrome suppressed, A4 with a filing margin (royal.css §print). This page is
 * written FOR that treatment: a reader prints it, takes it to the site, and
 * ticks boxes with a pen. The tick boxes are drawn with a border, not
 * <input type="checkbox"> — form controls print inconsistently across
 * renderers and nothing here needs to be interactive.
 *
 * ⚠️ GENERAL DUE DILIGENCE, NOT JAMIN CLAIMS. Every line is something any
 * careful buyer checks on any plotted development. Where Jamin publishes the
 * matching record (approval number, plot schedule), the line says where to
 * find it — that is the one brand-specific statement, and it is true.
 */
const SECTIONS: { title: string; items: string[] }[] = [
  {
    title: "Before you go",
    items: [
      "Read the project page: approval number, survey numbers, extent and the plot schedule.",
      "Note the plot numbers you want to walk, and their recorded dimensions.",
      "Carry the sanctioned layout plan — printed or on your phone.",
      "Confirm the visit slot with the desk, and who will meet you.",
    ],
  },
  {
    title: "At the gate",
    items: [
      "Does the entrance match the sanctioned plan's access point?",
      "Is the layout board displayed, and does its approval number match the published one?",
      "Walk the main road: is the width consistent with the plan?",
    ],
  },
  {
    title: "On the plot",
    items: [
      "Find the survey stones at the corners; pace the frontage and depth against the schedule.",
      "Check the levels: does the plot need filling, and where does rainwater drain?",
      "Locate the water line and the electricity poles serving the plot.",
      "Stand on the plot at both ends of the day if you can — sun, noise, neighbours.",
      "Note what borders the plot: road, another plot, open space, or something unrecorded.",
    ],
  },
  {
    title: "The paperwork",
    items: [
      "Ask for the mother document chain and read the seller's title.",
      "Take an Encumbrance Certificate for the survey numbers, for at least 15 years.",
      "Verify the DTCP approval independently with the authority.",
      "Confirm patta transfer, tax receipts and who pays what at registration.",
      "Agree the price, the schedule of payment and what is included — in writing.",
    ],
  },
];

export default function VisitChecklistPage() {
  /* 🚨 THE DATE IS NO LONGER TAKEN HERE (report 18, 2026-09-03: "the 'Sheet
     taken' date displays 25 Aug 2026 even though the checklist is generated
     on 29 Aug 2026"). This is a server component under `revalidate = 3600`
     with no dynamic read, so `new Date()` ran at BUILD time and the day it
     was built was baked into the static HTML for everyone thereafter. The
     property sheets do the same on purpose — their "taken" date is the date
     of the record — but this checklist has no record behind it: the honest
     date is the day the reader prints it, which only the browser knows. See
     `PrintDate`. */

  return (
    <>
      <div className="print:hidden">
        <PageHero
          /* hero-71 — the golden gate walk, from the SPARE pile (hero-72
             carries /downloads and one frame carries one surface). The family
             entering under the lockup IS this page's subject. Swept at this
             standard geometry: p95 lum 0.526 vs audited hero-38's 0.604 —
             darker, so it holds 0.52 like hero-49. */
          art={71}
          tone="cinematic"
          /* ⚠️ Anchored near the TOP (report 18, 2026-09-03: "the Jamin Bazaar
             logo and company name on the property entrance are visibly cut
             off by the top edge"). The standard box crops a 3:2 frame
             vertically at xl and the default centre anchor took the arch
             lockup with it; the family walking in sits low enough to survive
             a top-weighted crop. Same lever /projects/ongoing uses (50% 14%). */
          artPosition="50% 8%"
          sheer
          sheerAlpha={0.52}
          eyebrow="Site visits"
          title="What to verify on the ground"
          lead="Print it, carry it, tick it with a pen. A plot visit is a verification exercise — this is the list."
        />
      </div>

      {/* The print masthead — invisible on screen, drawn on paper. Same
          discipline as the property sheet: what this is, and when the copy
          was taken. */}
      <div className="rj-print-only mb-6 border-b-2 border-black pb-3">
        <div className="flex items-baseline justify-between gap-6">
          <div>
            <div className="text-[10pt] uppercase tracking-[0.18em]">Jamin Properties</div>
            <div className="text-[16pt] font-medium leading-tight">Site-visit checklist</div>
          </div>
          <div className="text-right text-[8pt] leading-snug">
            General guidance for visiting a plotted development.
            <br />
            Not legal advice.
          </div>
        </div>
        <div className="mt-2 text-[9pt]">Sheet taken <PrintDate /></div>
      </div>

      <Container className="py-phi5 print:py-0" hue={paneHue("/visit-checklist")}>
      {/* ⚠️ ONE pane for the page body, not one per element (owner
          2026-08-19). Converting the bordered elements instead would have
          tinted the CARDS too, and the cards are what has to stay on
          `bg-canvas` so they lift off the sheet — that lift is half of
          what the hue buys. The colour itself is stated once, on the
          Container above, and every `.rj-pane` inside inherits it. */}
      <Pane className="p-phi3 sm:p-phi5 print:p-0">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-4 print:hidden">
          <p className="text-base text-ink-muted">
            Save it as a PDF from the print dialogue, or take it on paper.
          </p>
          <PassportButton />
        </div>

        {/* `print:max-w-none` (report 18: "the main checklist container is too
            narrow, causing the content to appear cramped and too close to the
            left border"). 48rem is a reading measure for a screen; on A4 with
            its 14mm margins it left the list hugging the left edge with a
            blank column beside it. On paper the sheet IS the measure. */}
        <div className="mx-auto max-w-3xl print:max-w-none">
          {SECTIONS.map((s) => (
            <section key={s.title} className="mt-phi4 break-inside-avoid first:mt-phi3 print:mt-5">
              <h2 className="border-b border-line pb-2 text-2xl text-ink print:border-black print:text-[13pt]">
                {s.title}
              </h2>
              <ul className="mt-phi3 space-y-3 print:mt-3 print:space-y-2">
                {s.items.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    {/* the tick box, drawn — prints as a crisp square */}
                    <span
                      aria-hidden="true"
                      className="mt-1 h-4 w-4 shrink-0 rounded-[3px] border border-ink-faint print:border-black"
                    />
                    <span className="text-base leading-relaxed text-ink-soft print:text-[10pt] print:text-black">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          ))}

          <p className="mt-phi4 border-t border-line pt-phi3 text-tiny leading-relaxed text-ink-faint print:border-black print:text-[8pt] print:text-black">
            This list is general guidance for any plotted development, not legal advice and not a
            substitute for your own lawyer&rsquo;s verification. On Jamin projects, the approval
            number, survey numbers and plot schedule are published on the project page.
          </p>
        </div>
      </Pane>
      </Container>
      <div className="print:hidden">
        <CallbackBand />
      </div>
    </>
  );
}
