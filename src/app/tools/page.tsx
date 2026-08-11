import type { Metadata } from "next";
import Link from "next/link";
import { PlanningTools } from "@/components/PlanningTools";
import { Container, SectionLabel } from "@/components/ui";

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
 * ⚠️ NO PAGE HERO. Every other page on this site opens on a photograph, and
 * this one deliberately does not: it is an instrument, the reader arrived to do
 * a sum, and a full-bleed frame would put a screen of picture between them and
 * the first field. The register is the ledger, not the estate.
 */
export default function ToolsPage() {
  return (
    <Container className="py-phi6">
      <div className="max-w-2xl">
        <SectionLabel>Plan your property investment</SectionLabel>
        <h1 className="mt-phi3 text-3xl text-ink lg:text-4xl">
          Work out what it costs before you visit.
        </h1>
        <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
          Four calculators, using your figures rather than ours. Jamin publishes no rate — every
          number below is one you enter, and nothing here is an offer of finance.
        </p>
      </div>

      <nav aria-label="Tools" className="mt-phi5 flex flex-wrap gap-2">
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
  );
}
