import type { PropertyDetail } from "@/lib/properties";
import { approvalBadges, formatArea, locationLine } from "@/lib/properties";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";

/**
 * The certificate cover — page one of the printed record.
 *
 * A buyer forwards this sheet to a lawyer or a bank. Until now it opened
 * straight onto the masthead and then the body copy, which reads as a printout
 * of a web page. A cover states what the document IS before it states anything
 * else, and that is the difference between something filed and something
 * printed.
 *
 * 🚨 INVISIBLE ON SCREEN. `rj-print-only` is `display: none` until the print
 * stylesheet reveals it, so nothing here changes the page a visitor sees. It
 * costs the screen nothing and the paper one sheet.
 *
 * ⚠️ EVERY FIELD IS RECORDED OR ABSENT — the standing rule for the title block,
 * the chain of record and the masthead, and it binds hardest here. A cover page
 * carries the most authority of anything on the sheet, so it is the last place
 * to improvise a reference number, a validity period or a "prepared by". Rows
 * render only where the database actually holds the value.
 *
 * ⚠️ IT REPEATS THE MASTHEAD'S FIELDS ON PURPOSE, and that is not duplication
 * to be tidied away later: a cover can be separated from the body it opens, and
 * a cover that does not identify the parcel on its own is a decorative page.
 * The masthead stays because pages two onward need identifying too.
 *
 * ⚠️ "Taken" rather than "issued", and it is the BUILD date. Same reasoning as
 * PrintHeader: the page is statically generated, so a live timestamp beside
 * build-old data would overstate its freshness.
 */
export function PrintCover({ p, taken }: { p: PropertyDetail; taken: string }) {
  const approvals = approvalBadges(p);
  const approvalNo = p.legal?.dtcp_approval_no?.trim() || p.plot_plan?.approvalNo?.trim();
  const place = locationLine(p);
  const extent = formatArea(p);

  const rows: [string, string][] = [];
  if (place) rows.push(["Location", place]);
  if (p.survey_number?.trim()) rows.push(["Survey numbers", p.survey_number.trim()]);
  if (approvalNo) rows.push(["Approval number", approvalNo]);
  if (approvals.length) rows.push(["Sanctioned by", approvals.join(" · ")]);
  if (extent) rows.push(["Extent", extent]);
  if (p.plot_plan?.village?.trim()) rows.push(["Village", p.plot_plan.village.trim()]);
  rows.push(["Sheet taken", taken]);

  return (
    /* ⚠️ `break-after: page` via `rj-print-cover`, not a Tailwind utility —
       the class also carries the full-height centring, and keeping the two
       together means a caller cannot get one without the other. */
    <div className="rj-print-only rj-print-cover">
      <div className="rj-print-cover-inner">
        <div className="text-[10pt] uppercase tracking-[0.28em]">Jamin Properties</div>

        {/* The seal. `aria-hidden` is irrelevant on paper but kept for the
            screen-reader tree, which still contains this node. */}
        <div className="rj-print-seal" aria-hidden="true">
          <SurveyIcon name="stamp" size="h-12 w-12" />
        </div>

        <div className="text-[9pt] uppercase tracking-[0.22em]">Record of a published listing</div>

        <h1 className="rj-print-cover-title">{p.project_name ?? p.title}</h1>

        <dl className="rj-print-cover-rows">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd className="ledger">{v}</dd>
            </div>
          ))}
        </dl>

        {/* 🚨 THE DISCLAIMER IS ON THE COVER, NOT ONLY IN THE FOOTER. This is
            the page someone puts in front of a lawyer; what it is NOT has to be
            legible at a glance, not discovered on the last sheet. Same wording
            as the masthead so the two cannot drift. */}
        <p className="rj-print-cover-note">
          This is a record of a listing published on jaminproperties.com. It is not a title
          document, not an offer, and not a substitute for the sanctioned plan or the
          encumbrance certificate. Figures and availability are confirmed by the Jamin desk at
          the time of booking.
        </p>
      </div>
    </div>
  );
}
