"use client";

import { usePathname } from "next/navigation";

/**
 * The title block: the ruled panel in the corner of every drawing that says
 * what the sheet is, who issued it, at what scale and when.
 *
 * It is the most conventional object in a drawing office and the site did not
 * have one, which left the footer — the element on every page — as the least
 * designed thing here. This is the cadastral language applied to the PAGE
 * rather than to a component on it.
 *
 * 🚨 EVERY CELL IS TRUE OR IT IS NOT DRAWN. A title block that reads
 * "DRAWN BY / CHECKED BY" over invented initials is the exact failure the
 * survey vocabulary rule exists to prevent — worse than an ornament, because
 * it forges a record. So there is no "checked by" (nobody checks these), no
 * revision letter (nothing tracks one), and no drawing number (there is no
 * register). What is left is four things the site actually knows.
 *
 * ⚠️ SCALE IS "NOT TO SCALE", AND THAT IS THE HONEST ANSWER, not a placeholder.
 * A page of prose has no scale. The two surfaces that DO — the maps — carry
 * their own computed `ScaleBar`, which is where a scale belongs: next to the
 * thing being measured, not in a panel three sections below it.
 *
 * ⚠️ `usePathname` is why this is a client island rather than part of the
 * server footer, and it is deliberately the ONLY reason. The issue date is
 * passed in from the server so it is the BUILD's date — computing it here
 * would silently stamp each sheet with the reader's own clock, which is not
 * when it was issued and would differ between two people looking at the same
 * page. Keep this component free of anything else that would grow it: it ships
 * on every route.
 */
export function TitleBlock({ issued }: { issued: string }) {
  const pathname = usePathname();
  /* The site's own name for the root, rather than a bare "/" — a sheet
     reference has to be readable aloud. */
  const sheet = pathname === "/" ? "/ (index)" : pathname;

  return (
    <div
      className="mt-phi5 border-t border-white/10 pt-phi4"
      /* Not `aria-hidden`: the issue date and the sheet reference are real
         information about the document, and a reader using a screen reader has
         the same claim on them as one who can see the panel. */
    >
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-4">
        <Cell term="Sheet" value={sheet} />
        <Cell term="Issued by" value="Jamin Properties" />
        <Cell term="Scale" value="Not to scale" />
        <Cell term="Issued" value={issued} />
      </dl>
    </div>
  );
}

function Cell({ term, value }: { term: string; value: string }) {
  return (
    /* The 1px grid is drawn by the parent's `gap-px` over its own background,
       so each cell only has to be opaque — no per-cell borders to keep in step,
       and no double hairline where two cells meet. */
    <div className="bg-onyx-800 px-3 py-2.5">
      <dt className="ledger-label text-bone-soft">{term}</dt>
      {/* `ledger` gives tabular figures, so the dates and the paths line up
          across the row the way they would on a real sheet. `break-all` because
          a long route must not push the footer wider than the phone. */}
      <dd className="ledger mt-1 break-all text-tiny text-bone">{value}</dd>
    </div>
  );
}
