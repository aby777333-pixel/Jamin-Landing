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
 * ⚠️ hero-13 AND `tone="paper"`, NOT a photograph. It shipped with no hero at
 * all on the argument that an instrument should open on its first field; the
 * owner asked for one, and the register had exactly the right frame spare. 13
 * is a plot with a wireframe house on it and a clock reading NOW — planning,
 * time, and a parcel being valued, which is what this page is for. It is also
 * from the GRAPHIC family, so `paper` is the correct tone: the copy sits on the
 * page's own ivory and the render dissolves into it, rather than a full-bleed
 * photograph putting a screen of picture between the reader and the sums.
 */
export default function ToolsPage() {
  return (
    <>
      <PageHero
        art={13}
        tone="paper"
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
