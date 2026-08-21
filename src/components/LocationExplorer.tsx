"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PropertiesMap } from "@/components/PropertiesMap";
import { districtSlug } from "@/lib/site";
import { type Property } from "@/lib/properties";

/**
 * FEATURE 2 — THE INTERACTIVE LOCATION EXPLORER.
 *
 * Replaces the flat "Districts with Jamin land today" grid of coloured tiles.
 * The interaction the brief asks for is:
 *
 *   Select district → see projects on the map → click a project → view it →
 *   explore its plots
 *
 * and every one of those steps already exists somewhere on this site. This
 * component is the join, not new machinery: `PropertiesMap` is the same OSM
 * raster map the properties page uses in its map view, and the property page it
 * links to already carries the interactive plot plan. What was missing was the
 * first step — a way to narrow to a district without leaving the homepage.
 *
 * ⚠️ IT REUSES `PropertiesMap` RATHER THAN DRAWING A SECOND MAP. That component
 * fits its zoom to the bounding box of whatever pins it is given and measures
 * the real frame to do it, which is exactly the behaviour a district filter
 * needs — pick Erode and the map moves to Erode without anyone computing a
 * centre. A second map implementation would have had to re-learn that, and the
 * note in `PropertiesMap` records what it cost the first time.
 *
 * ⚠️ NO URL STATE, deliberately. The properties page keeps its filters in the
 * query string because a filtered catalogue is worth sharing. A district
 * glanced at on the homepage is not a destination — it is a step on the way to
 * one — and writing it to the URL would put a history entry behind every
 * chip and make Back walk through them.
 *
 * ⚠️ Only properties WITH COORDINATES can appear on a map. The list beside it
 * shows every property in the district either way, so a project without a pin
 * is reachable rather than invisible.
 */
export function LocationExplorer({ items }: { items: Property[] }) {
  const districts = useMemo(() => {
    const by = new Map<string, number>();
    for (const p of items) {
      const d = (p.district ?? p.city ?? "").trim();
      if (d) by.set(d, (by.get(d) ?? 0) + 1);
    }
    return [...by.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [items]);

  const [district, setDistrict] = useState<string | null>(null);

  const shown = useMemo(
    () =>
      district
        ? items.filter((p) => (p.district ?? p.city ?? "").trim() === district)
        : items,
    [items, district],
  );

  /* 🚨 A CELL, NOT AN INLINE PILL (report 13, 2026-08-21: "the district filter
     buttons currently have different widths based on the length of their text,
     making the row look uneven and inconsistent… maintain a uniform width and
     height for every district filter card… same width for All Tamil Nadu,
     Coimbatore, Erode, Salem, Tiruchirappalli, Tiruppur… keep the text
     centred").

     `inline-flex` in a `flex-wrap` row sized every button to its own label, so
     "ALL TAMIL NADU 5" ran nearly three times the width of "ERODE 1" and the
     row broke wherever it happened to run out. They are grid CELLS now — equal
     width, equal height, centred — which is the same correction the
     /properties facets took in report 8 and for the same reason.

     ⚠️ `min-w-0` + `truncate` on the label, because a fixed cell and a long
     word are only compatible if the label can give way; the COUNT stays
     outside the truncation so a narrowed cell never hides the number. */
  const chip = (on: boolean) =>
    `flex min-h-[44px] w-full items-center justify-center gap-2 rounded-full border px-3 py-2 text-center text-tiny font-semibold uppercase tracking-[0.12em] transition-colors ${
      on
        ? "border-ink bg-ink text-white"
        : "border-line bg-canvas text-ink-soft hover:border-ink-faint"
    }`;

  return (
    <div>
      {/* Step 1 — the district. `All` first so the default state is the whole
          picture rather than an arbitrary district. */}
      <div className="mt-phi4 grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-6">
        <button
          type="button"
          onClick={() => setDistrict(null)}
          aria-pressed={district === null}
          className={chip(district === null)}
        >
          <span className="min-w-0 truncate">All Tamil Nadu</span>
          <span className="ledger shrink-0 opacity-60">{items.length}</span>
        </button>
        {districts.map(([d, n]) => (
          <button
            key={d}
            type="button"
            onClick={() => setDistrict(d === district ? null : d)}
            aria-pressed={d === district}
            className={chip(d === district)}
          >
            <span className="min-w-0 truncate">{d}</span>
            <span className="ledger shrink-0 opacity-60">{n}</span>
          </button>
        ))}
      </div>

      {/* ⚠️ `PropertiesMap` ALREADY RENDERS THE LIST. It is a map plus a
          linked list of the pinned developments in its own two-column grid,
          and this component was wrapping it and adding a second list beside
          it — three columns, the same projects twice, and a map squeezed into
          the narrowest of them. What was actually missing was never the list;
          it was the district filter above it.

          So this component is now chips, the map, and the way onward. Anything
          without a pin is still reachable: `PropertiesMap` counts them and says
          so under its own list rather than dropping them silently. */}
      {/* ⚠️ `district` is passed down so the MAP can answer the second half of
          the question. The chips say which district is selected; without this
          the map only silently re-fitted its zoom, which on a single-project
          district looks identical to no selection at all. With it the map
          draws a halo round that district's projects and names them. */}
      <div className="mt-phi4">
        <PropertiesMap key={district ?? "all"} items={shown} district={district} />
      </div>

      {district ? (
        /* Leads to the district's own page now, which is where the menu goes
           and where that district's hero and metadata live. */
        <Link
          href={`/locations/${districtSlug(district)}`}
          className="mt-phi4 inline-block text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep transition-opacity hover:opacity-70"
        >
          Explore plots in {district} →
        </Link>
      ) : null}
    </div>
  );
}
