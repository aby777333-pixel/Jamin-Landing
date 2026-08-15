import type { PropertyDetail } from "@/lib/properties";
import { approvalBadges, locationLine } from "@/lib/properties";

/**
 * The masthead of the printed sheet. Invisible on screen, drawn on paper.
 *
 * A printed page loses everything that told the reader where it came from — the
 * header, the URL bar, the navigation. What it must carry instead is what a
 * filed document carries: what this is, which parcel, under whose sanction, and
 * when the copy was taken.
 *
 * ⚠️ EVERY FIELD IS RECORDED OR ABSENT. Same rule as the title block and the
 * chain of record: no "prepared by", no reference number, no validity period.
 * A printed sheet is the version of this page most likely to be shown to a
 * lawyer, so it is the LAST place to improvise a fact.
 *
 * ⚠️ "Taken" rather than "issued", and it is the build date rather than the
 * moment of printing. That is deliberate and it is the conservative choice: the
 * page is statically generated, so the data on the sheet is as fresh as the
 * build, not as fresh as the reader's clock. Printing a current timestamp
 * beside hour-old data would overstate it.
 */
export function PrintHeader({ p, taken }: { p: PropertyDetail; taken: string }) {
  const approvals = approvalBadges(p);
  const approvalNo = p.legal?.dtcp_approval_no?.trim();

  const rows: [string, string][] = [];
  const place = locationLine(p);
  if (place) rows.push(["Location", place]);
  if (p.survey_number?.trim()) rows.push(["Survey nos", p.survey_number.trim()]);
  if (approvals.length) {
    rows.push(["Sanction", approvalNo ? `${approvals.join(" · ")} ${approvalNo}` : approvals.join(" · ")]);
  }
  rows.push(["Sheet taken", taken]);

  return (
    <div className="rj-print-only mb-6 border-b-2 border-black pb-3">
      <div className="flex items-baseline justify-between gap-6">
        <div>
          <div className="text-[10pt] uppercase tracking-[0.18em]">Jamin Properties</div>
          <div className="text-[16pt] font-medium leading-tight">
            {p.project_name ?? p.title}
          </div>
        </div>
        {/* ⚠️ Stated on the sheet itself, because a printout separated from this
            site cannot be checked against it. It tells the reader what the paper
            in their hand is and what it is not. */}
        <div className="text-right text-[8pt] leading-snug">
          Record of a published listing.
          <br />
          Not a title document.
        </div>
      </div>
      <dl className="mt-3 grid grid-cols-2 gap-x-8 gap-y-1 text-[9pt]">
        {rows.map(([k, v]) => (
          <div key={k} className="flex gap-2">
            <dt className="shrink-0 uppercase tracking-[0.12em]">{k}</dt>
            <dd className="ledger font-medium">{v}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
