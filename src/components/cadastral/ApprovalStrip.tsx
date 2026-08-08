import { approvalBadges, formatArea, type Property } from "@/lib/properties";

/**
 * The document header of a project page: the facts of record, set as a band.
 *
 * This is where the site earns its argument in one glance — the copy already
 * claims rigour, and a row of survey numbers and extents in tabular figures is
 * that claim rendered rather than asserted.
 *
 * ⚠️ ONLY FIELDS THAT EXIST. The design brief asks for an approval number and a
 * sanctioned date alongside these. Neither is in the schema: `approvals` is a
 * set of boolean flags (`{dtcp: true}`), not a number, and there is no
 * sanctioned-date column anywhere on `properties`. An approval number is a
 * legal claim about a specific sanction, so it is the last thing on this site
 * that should be improvised — the same rule that stops the pages inventing a
 * price. Add the columns and populate them and this component will carry them;
 * until then it carries what is true.
 *
 * Every entry is dropped when its field is empty, and the strip removes itself
 * entirely rather than render a bar of dashes for a thin record.
 */
export function ApprovalStrip({ p }: { p: Property }) {
  const approvals = approvalBadges(p);
  const area = formatArea(p);

  const entries: { label: string; value: string; ledger?: boolean }[] = [];

  /** The three that make this a record of sanction rather than a stat line.
   *  Plot counts alone are already on the card and in the availability chip. */
  const hasSubstance = approvals.length > 0 || !!p.survey_number?.trim() || !!area;

  if (approvals.length) {
    entries.push({ label: "Sanction", value: `${approvals.join(" · ")} approved` });
  }
  if (p.survey_number?.trim()) {
    entries.push({ label: "Survey nos", value: p.survey_number.trim(), ledger: true });
  }
  if (area) entries.push({ label: "Extent", value: area, ledger: true });
  if (p.plots_total) {
    entries.push({ label: "Plots", value: String(p.plots_total), ledger: true });
  }
  if (p.plots_available != null && p.plots_total) {
    entries.push({ label: "Available", value: String(p.plots_available), ledger: true });
  }

  // ⚠️ A band reading only "Plots 1 · Available 1" is two ways of saying one
  // thing, and a document header that says nothing undermines the page it is
  // meant to anchor. Thin records simply do not get one.
  if (!hasSubstance || entries.length < 2) return null;

  return (
    <div className="cd-strip border-y border-line bg-canvas-alt">
      {/* Scrolls rather than wraps on a phone: a document header that breaks
          onto three ragged lines stops reading as a header. */}
      <dl className="cd-noscroll flex items-stretch gap-0 overflow-x-auto">
        {entries.map((e, i) => (
          <div
            key={e.label}
            className={`shrink-0 px-phi3 py-phi2 ${i > 0 ? "border-l border-jamin-gold/35" : ""}`}
          >
            <dt className="ledger-label">{e.label}</dt>
            <dd
              className={`mt-1 whitespace-nowrap text-base text-ink ${e.ledger ? "ledger" : ""}`}
            >
              {e.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
