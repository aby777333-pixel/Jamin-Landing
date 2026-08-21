import type { NearbyPlace } from "@/lib/properties";

/**
 * What is around the project, grouped by what kind of thing it is.
 *
 * The list was flat: 31 entries on Erode and 20 on Edappadi, in one two-column
 * run. Every item was legible and the SET was not — a reader wanting to know
 * about schools had to scan the whole thing and hold a count in their head.
 * Eleven headed groups answer "is there a school near here" at a glance, which
 * is the question actually being asked.
 *
 * 🚨 NO RADIUS RINGS, AND THE DATA IS WHY. `distance` is free text and the
 * formats do not share an axis: "Nearby" (11), "10 minutes" (8), "Within 5-10
 * minutes" (5), "~13 km" (3), "30 minutes" (3). Bucketing those into 500 m /
 * 1 km / 3 km would mean deciding that "10 minutes" is nearer or further than
 * "~13 km", which depends on a road speed nobody recorded. The strings are
 * printed exactly as entered and no ordering is implied between them.
 *
 * ⚠️ Groups are ordered by SIZE, not alphabetically. The largest category is
 * the strongest thing that can be said about a location, and on both projects
 * that happens to be schools — which is also what most buyers here are moving
 * for. Alphabetical would open on "Attraction".
 *
 * ⚠️ `min-w-0` on the grid item, not on the text inside it. A grid item's
 * default `min-width: auto` is its content's minimum, and the longest place
 * name here once set a track to 373px and pushed the page wider than a phone.
 */
export function NearbyGroups({ places }: { places: NearbyPlace[] }) {
  const clean = places.filter((n) => n?.name?.trim());
  if (!clean.length) return null;

  const groups = new Map<string, NearbyPlace[]>();
  for (const n of clean) {
    /* Uncategorised entries are kept, under a heading that does not pretend to
       know what they are. Dropping them would silently shorten the record. */
    const key = n.category?.trim() || "Also nearby";
    groups.set(key, [...(groups.get(key) ?? []), n]);
  }

  const ordered = [...groups.entries()].sort((a, b) => {
    /* "Also nearby" always sits last whatever its size — it is the leftovers,
       not a category. */
    if (a[0] === "Also nearby") return 1;
    if (b[0] === "Also nearby") return -1;
    return b[1].length - a[1].length || a[0].localeCompare(b[0]);
  });

  return (
    <div className="mt-phi4">
      <h3 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
        What&rsquo;s nearby
      </h3>
      {/* ⚠️ DISCLOSURES, NOT SECTIONS (owner 2026-08-17: "make the what's
          nearby dropdowns, with heading to be clicked"). Native <details>, so
          the headings are keyboard-operable and screen-reader-announced with
          no JavaScript, and a crawler still reads every place name. The
          LARGEST group opens by default — the strongest fact about the
          location shows itself; the rest are one click away with their counts
          doing the advertising. */}
      <div className="mt-phi3 space-y-phi2">
        {ordered.map(([label, items], gi) => (
          <details
            key={label}
            open={gi === 0}
            className="group rounded-card border border-line bg-canvas-alt/60"
          >
            <summary className="flex cursor-pointer list-none items-baseline gap-2 px-phi2 py-2.5 [&::-webkit-details-marker]:hidden">
              {/* `print:hidden` — a disclosure arrow on paper is a control
                  that cannot be pressed; the printed sheet forces every group
                  open (royal.css deed sheet, report 11). */}
              <span
                aria-hidden="true"
                className="self-center text-tiny text-jamin-red-deep transition-transform duration-300 group-open:rotate-90 print:hidden"
              >
                ▸
              </span>
              <h4 className="ledger-label text-ink-muted">{label}</h4>
              {/* The count is the point of grouping: "School 13" is a fact
                  about the location that the flat list contained and never
                  stated. */}
              <span className="ledger text-micro text-ink-faint">{items.length}</span>
            </summary>
            <ul className="grid gap-2 px-phi2 pb-phi2 sm:grid-cols-2">
              {items.map((n, i) => (
                <li
                  key={`${label}-${i}`}
                  className="flex min-w-0 items-center justify-between gap-3 rounded-card border border-line bg-canvas px-phi2 py-2.5"
                >
                  <div className="min-w-0 truncate text-base text-ink">{n.name}</div>
                  {n.distance && (
                    /* Printed exactly as recorded. See the note above: these
                       strings are not a scale and must not be made to look like
                       one by rounding or re-unit-ing them. */
                    <span className="shrink-0 rounded-full bg-canopy-soft px-2.5 py-1 text-tiny font-medium text-canopy">
                      {n.distance}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </details>
        ))}
      </div>
    </div>
  );
}
