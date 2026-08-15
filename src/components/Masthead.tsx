/**
 * The Journal's nameplate.
 *
 * A newspaper does not put its name in a page title, it sets it as a plate:
 * rules above and below, the name at scale, and the standing details in the
 * margins of the rule. With 33 articles the Journal is a publication, and this
 * is the object that says so.
 *
 * ⚠️ IT IS NOT A SECOND `<h1>`. The hero above already carries the page's
 * heading; this is a `<div>` with `aria-hidden` on the wordmark and the real
 * standing information — the count and the issue line — left readable. Two h1s
 * on one document is the kind of thing that costs nothing visually and quietly
 * degrades the outline every assistive reader depends on.
 *
 * ⚠️ `rj-weight-shift` is used HERE and this is the surface that utility was
 * written for: a single, isolated, full-measure line whose line breaks cannot
 * move, because it is one word. §9's floor allows transform and opacity and
 * `font-variation-settings` is neither — the rule in ornament.css §16 is one
 * element per page, and the Journal index spends its one here.
 */
export function Masthead({ count, issue }: { count: number; issue: string }) {
  return (
    <div className="mt-phi5 border-y border-ink/15 py-phi4">
      <div className="flex flex-col items-center gap-2">
        {/* The standing line above the name, as a paper carries its place and
            its date. Real: the count is the published rows, the issue is the
            build date the title block already stamps. */}
        <div className="flex w-full items-center justify-between gap-phi3">
          <span className="ledger-label text-ink-faint">Tamil Nadu</span>
          <span className="ledger-label hidden text-ink-faint sm:block">
            {count} {count === 1 ? "article" : "articles"}
          </span>
          <span className="ledger-label text-ink-faint">{issue}</span>
        </div>
        <div
          aria-hidden="true"
          className="rj-weight-shift text-center text-4xl leading-none tracking-[-0.03em] text-ink lg:text-5xl"
        >
          The Jamin Journal
        </div>
        {/* The line under the name, in the logo's own rule rather than a plain
            hairline — `rule-gold` is the same mark that sits under BAZAAR. */}
        <span className="rule-gold mt-1 h-px w-24" />
      </div>
    </div>
  );
}
