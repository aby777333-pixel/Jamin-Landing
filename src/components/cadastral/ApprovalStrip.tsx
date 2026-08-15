import { approvalBadges, formatArea, type Property } from "@/lib/properties";

/**
 * The document header of a project page: the facts of record, set as a band.
 *
 * This is where the site earns its argument in one glance — the copy already
 * claims rigour, and a row of survey numbers and extents in tabular figures is
 * that claim rendered rather than asserted.
 *
 * ⚠️ ONLY FIELDS THAT EXIST. An approval number is a legal claim about a
 * specific sanction, so it is the last thing on this site that should be
 * improvised — the same rule that stops the pages inventing a price.
 *
 * 🚨 CORRECTED 2026-08-15: this note used to say the approval number "is not in
 * the schema", reasoning from the COLUMN — `approvals` really is only a set of
 * boolean flags (`{dtcp: true}`). But the number was in the data the whole
 * time, inside the `legal` blob as `dtcp_approval_no` ("320/2025"), and the
 * site that promises to publish the approval number was not publishing it.
 * `ProvenanceRibbon` now states it where it is recorded.
 * **Generalises: a jsonb column is schema too.** Before concluding a field does
 * not exist, look inside the blobs — `legal`, `investment`, `utilities` and
 * `plot_plan` all carry keys no type in this repo names.
 *
 * There is still no sanctioned-DATE anywhere, so that half stands. This strip
 * keeps the flag wording rather than duplicating the ribbon's number.
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
    /* ⚠️ `rj-seal` is ornament and nothing else — the mark, embossed at 4.5%
       into the band that carries the facts of record, the way a watermark sits
       on a document. It adds no information and is `pointer-events: none`. */
    <div className="cd-strip rj-seal border-y border-line bg-canvas-alt">
      {/* 🚨 IT SPANS THE FULL CONTENT WIDTH FROM `lg`, AND THE ENTRIES SHARE IT.
          Reported 2026-08-13: "property statistics do not use the full available
          page width… keep all five details evenly distributed". They were
          `shrink-0` in a scroller, so the band ended wherever the content
          happened to end — on a 1425px page the five entries occupied about 700
          of it and the rest was empty ivory, which read as a truncated table
          rather than a document header.

          ⚠️ THE SCROLLER SURVIVES BELOW `lg`, and that is not laziness. A
          document header that wraps onto three ragged lines stops reading as a
          header, which is why it scrolls on a phone in the first place —
          `flex-1` there would squeeze "789/3B2E2A1A2, 789/3B2E2A1A3C" into a
          column two characters wide. So the entries flex only where there is
          room to share, and `basis-0` is what makes the share EVEN rather than
          proportional to each value's length.

          ⚠️ `min-w-0` on the item, or a long survey number sets its own track
          and pushes the band wider than the page — the same trap the footer's
          district column and the account sidebar both paid for. */}
      <dl className="cd-noscroll flex items-stretch gap-0 overflow-x-auto">
        {entries.map((e, i) => (
          <div
            key={e.label}
            className={`shrink-0 px-phi3 py-phi2 lg:min-w-0 lg:flex-1 lg:basis-0 lg:shrink ${
              i > 0 ? "border-l border-jamin-gold/35" : ""
            }`}
          >
            <dt className="ledger-label">{e.label}</dt>
            <dd
              className={`mt-1 text-base text-ink lg:whitespace-normal ${
                e.ledger ? "ledger" : ""
              } whitespace-nowrap`}
            >
              {e.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
