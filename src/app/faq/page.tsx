import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Container } from "@/components/ui";
import { CallbackBand } from "@/components/CallbackBand";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Questions, Answered — Buying a Plot with Jamin",
  description:
    "Plain answers on DTCP approval, title checks, site visits, pricing and how buying a plot from Jamin Properties actually works.",
  alternates: { canonical: "/faq" },
};

/**
 * The FAQ (do-all round, 2026-08-18) — with FAQPage structured data, which is
 * what earns the rich result.
 *
 * 🚨 EVERY ANSWER RESTATES SOMETHING THE SITE ALREADY ASSERTS — the approval
 * number published per project, the no-published-rate rule, the desk-confirmed
 * visit, "does not lend and does not arrange loans" — or states general law in
 * general terms. Nothing here may make a NEW claim about Jamin: an FAQ is the
 * page a buyer quotes back, so a sentence invented here becomes a promise
 * nobody made. Where the honest answer is "ask the desk", that IS the answer.
 */
const FAQS: { q: string; a: string; href?: { to: string; label: string } }[] = [
  {
    q: "What does DTCP approval mean?",
    a: "DTCP is Tamil Nadu's Directorate of Town and Country Planning. A DTCP-approved layout has its plan sanctioned by the authority — plot boundaries, road widths and open-space reservation as drawn. Every Jamin project page publishes its approval number so you can verify it yourself.",
    href: { to: "/properties", label: "See the approved layouts" },
  },
  {
    q: "How do I verify a plot before buying?",
    a: "Check the sanctioned plan against the ground, read the title documents, and take an Encumbrance Certificate for the survey numbers. Jamin publishes the approval number, survey numbers, area statement and the plot-by-plot schedule on every project page, so these checks can start before you visit.",
    href: { to: "/journal", label: "The Journal covers each check in detail" },
  },
  {
    q: "Why is there no price on the website?",
    a: "Jamin publishes no rate. Plot pricing is confirmed by the sales desk at the time of booking — which is also why every calculator on this site uses figures you enter rather than figures we assert.",
  },
  {
    q: "How does a site visit work?",
    a: "Book a visit from the website or the app with the day that suits you. The desk confirms the date and slot, and meets you at the development. Bring your questions — walking the roads and finding the survey stones is the point of the trip.",
    href: { to: "/contact", label: "Book a site visit" },
  },
  {
    q: "Where does Jamin build?",
    a: "Across Tamil Nadu — currently Erode, Salem, Tiruppur and Coimbatore districts. Each location page maps every development in that district.",
    href: { to: "/properties", label: "Browse by district" },
  },
  {
    q: "Are the roads and water real, or promised?",
    a: "Formed to the approved plan. On an ongoing Jamin layout the roads, water lines and open space are laid out as the sanctioned drawing shows them, not promised for after you register.",
  },
  {
    /* ⚠️ Worded to sit between TWO published statements without contradicting
       either: the homepage assurance ("plot purchase loans arranged with
       leading banks for eligible buyers") and the calculator disclaimer
       ("Jamin Bazaar does not lend"). Jamin is not a lender; the bank
       decides. Both true, both said. */
    q: "Can I buy with a bank loan?",
    a: "Often, yes — banks lend against plots in approved layouts, and the desk can point eligible buyers to lenders who work with these developments. Jamin itself is not a lender: the decision, the rate and the terms are the bank's, made on your record and the property's papers. The calculators here are indicative only.",
    href: { to: "/tools", label: "Run the numbers yourself" },
  },
  {
    q: "Can NRIs buy a residential plot?",
    a: "In general, non-resident Indians can purchase residential property in India; agricultural land is restricted. The paperwork differs from a resident purchase, so talk to the desk and your own advisor before committing.",
  },
  {
    q: "What is The Vault?",
    a: "A private desk for exceptional property that is not publicly listed. Off-market is its default — you tell the desk what you hold or what you seek, and introductions happen quietly.",
    href: { to: "/vault", label: "Open The Vault" },
  },
  {
    q: "What happens after I decide?",
    a: "The desk confirms the plot and price, the documents go for your verification, and the sale deed is registered in your name at the sub-registrar. Clear and marketable title is checked before a plot is ever offered.",
  },
];

export default function FaqPage() {
  /* The rich-result payload — mirrors the visible list exactly. Search
     engines cross-check the two; a question shown here but not on the page
     is treated as spam. */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };

  return (
    <>
      <PageHero
        /* hero-67 — JAMIN CROWN (owner's swap 2026-08-18, replacing the
           hero-73 sunset gate; 73 → spares). Swept on this frame at this
           geometry: p95 0.563 vs hero-38's 0.604 — darker, holds 0.52.
           ⚠️ THE PLATE SITS AT THE FOOT (`copyAlign="end"`, same day: "this
           blocks the brand logo on the gate") — the lockups ride the TOP of
           the arch, so the copy anchors low and the crop steers the board
           into the upper third (measured at 1440 and 1280 in the preview).
           sheerEdge + 38rem shrink what the plate can ever touch. */
        art={67}
        tone="cinematic"
        /* `full` (owner 2026-08-18 night: "make it full height") — and the
           headline steps down to 3xl with it (the /ta span treatment):
           at 85vh the box crops far less of the frame, so the board rides
           lower and the only way the end-anchored plate stays off it is a
           shorter plate. Measured at 1440x800 and 1280x664 after the
           change. */
        size="full"
        sheer
        sheerAlpha={0.52}
        sheerEdge
        /* 46rem (owner, same night: "widen the tab") — at the 3xl headline
           the wide measure sets two lines, so the WIDER plate is also the
           SHORTER one, which is what keeps it off the board at full
           height. */
        plateXl="46rem"
        copyAlign="end"
        /* 88%, measured at BOTH 1440x800 and 1280x664: 82% left the board's
           bottom trim grazing the plate top by 14px at 1280. At 88% the
           board clears the plate at both, at the price of its top edge
           sitting under the TRANSPARENT header at 1440 load — which reads
           through. */
        artPosition="50% 88%"
        eyebrow="Questions, answered"
        title={<span className="text-3xl">How buying a plot actually works</span>}
        /* ⚠️ ONE LINE, and the length is structural: the three-line lead made
           the plate 451px tall — taller than the hero's free space — so no
           anchor could pull it off the arch. Shortening the copy IS the
           board fix (the same shortening-moves-the-plate rule the /journal
           hero-43 round recorded). */
        lead="Plain answers, with the record to check."
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Container className="py-phi5">
        <dl className="mx-auto max-w-3xl">
          {FAQS.map((f) => (
            <div key={f.q} className="border-t border-line py-phi4 first:border-t-0">
              <dt className="text-2xl text-ink">{f.q}</dt>
              <dd className="mt-phi2 text-lg leading-relaxed text-ink-soft">
                {f.a}
                {f.href && (
                  /* ⚠️ Its own block, and NO `whitespace-nowrap` — an inline
                     nowrap label like "The Journal covers each check in
                     detail →" is wider than a phone and was 104px of page
                     overflow at 375. */
                  <Link
                    href={f.href.to}
                    className="mt-phi2 block text-base font-semibold uppercase tracking-[0.1em] text-jamin-red-deep transition-opacity hover:opacity-70"
                  >
                    {f.href.label} →
                  </Link>
                )}
              </dd>
            </div>
          ))}
        </dl>
      </Container>
      <CallbackBand />
    </>
  );
}
