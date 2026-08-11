import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { PlanningTools } from "@/components/PlanningTools";
import { Container } from "@/components/ui";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Plan Your Property Investment — EMI, Eligibility, Cost & Yield",
  description:
    "Four calculators for buying land in Tamil Nadu: monthly EMI, indicative loan eligibility, the full purchase cost once statutory charges are added, and rental yield.",
  alternates: { canonical: "/tools" },
};

/**
 * FEATURE 3 — the planning tools, on one page rather than four.
 *
 * ⚠️ ONE ROUTE WITH FOUR ANCHORS, not four routes. Somebody working out whether
 * they can afford a plot uses three of these in the same sitting — the EMI
 * depends on the loan, the loan depends on eligibility, and both depend on the
 * purchase cost. Splitting them across four pages would make the commonest
 * journey three navigations long for no gain, and would give the site four thin
 * pages competing with each other for the same search.
 *
 * ⚠️ hero-28 AND `tone="paper"`. It shipped with no hero at all on the argument
 * that an instrument should open on its first field; the owner asked for one,
 * chose hero-13 (a plot with a clock reading NOW), then swapped it for this —
 * somebody carrying an elephant. It is a picture of the weight of the decision
 * rather than of the land, which is a different argument for the same page, and
 * it is the owner's to make.
 *
 * `paper` is the correct tone for it and not a preference: the frame is a
 * subject on a plain ground, so the copy sits on the page's own ivory and the
 * render bleeds off the right. Laid full-bleed it would need a scrim over a
 * white background, which is the one thing that treatment cannot do.
 *
 * ⚠️ The asset was MIRRORED and RETINTED on the way in — the subject was on the
 * side the copy plate covers, and its white was whiter than the page. Both are
 * recorded in public/hero/README.md; regenerating from the original without
 * repeating them puts the woman behind the text on a white rectangle.
 */
export default function ToolsPage() {
  return (
    <>
      <PageHero
        art={28}
        tone="paper"
        /* ⚠️ 42%, and the number is COMPUTED rather than nudged. The default
           `object-left` crop pinned the woman against the frame's own right
           edge; the owner asked for her to line up with the header's "Book a
           visit" button. Measured rather than eyeballed:

             she sits at x 1114–1222 of hero-28's 1672 → centre 69.9%
             the art box at 1366 is 783 wide, 629 tall, left edge 567
             cover scale 0.668 → drawn 1117 wide → 334px of crop to spend
             screen x = 567 + 0.699·1117 − 334·X  =  1347.8 − 334X
             "Book a visit" centre = 1206  →  X = 0.425

           At 42% the window covers image x 210–1382, so neither she (1114–1222)
           nor the elephant (495–1302) is clipped — the crop only spends empty
           ground. Re-derive this if the art box or the header ever changes. */
        artPosition="42% center"
        eyebrow="Plan your property investment"
        title="Work out what it costs before you visit."
        lead="Four calculators, using your figures rather than ours. Jamin publishes no rate — every number below is one you enter, and nothing here is an offer of finance."
      />
      <Container className="py-phi6">
      <nav aria-label="Tools" className="flex flex-wrap gap-2">
        {[
          ["#emi", "EMI"],
          ["#eligibility", "Loan eligibility"],
          ["#cost", "Purchase cost"],
          ["#yield", "Rental yield"],
        ].map(([href, label]) => (
          <a
            key={href}
            href={href}
            className="rounded-full border border-line bg-canvas px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint"
          >
            {label}
          </a>
        ))}
      </nav>

      <div className="mt-phi6">
        <PlanningTools />
      </div>

      <div className="mt-phi6 rounded-xl border border-line p-phi4">
        <p className="rj-eyebrow text-ink-faint">Please note</p>
        <p className="mt-phi2 text-tiny leading-relaxed text-ink-muted">
          These are estimates for planning, not quotations, valuations or financial advice. Interest
          rates, stamp duty and registration fees change and vary with the document, the buyer and
          the property. Jamin Bazaar does not lend, does not arrange loans and does not receive a
          commission from any lender. Confirm every figure with your lender and with the
          sub-registrar before you commit.
        </p>
        <Link
          href="/contact"
          className="mt-phi3 inline-block text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep transition-opacity hover:opacity-70"
        >
          Ask the desk instead →
        </Link>
      </div>
      </Container>
    </>
  );
}
