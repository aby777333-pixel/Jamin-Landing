"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { PropertiesMap } from "@/components/PropertiesMap";
import { locationLine, phaseLabel, propertyHref, type Property } from "@/lib/properties";

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

  const mappable = useMemo(() => shown.filter((p) => p.lat != null && p.lng != null), [shown]);

  const chip = (on: boolean) =>
    `inline-flex items-center gap-2 rounded-full border px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] transition-colors ${
      on
        ? "border-ink bg-ink text-white"
        : "border-line bg-canvas text-ink-soft hover:border-ink-faint"
    }`;

  return (
    <div>
      {/* Step 1 — the district. `All` first so the default state is the whole
          picture rather than an arbitrary district. */}
      <div className="mt-phi4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setDistrict(null)}
          aria-pressed={district === null}
          className={chip(district === null)}
        >
          All Tamil Nadu
          <span className="ledger opacity-60">{items.length}</span>
        </button>
        {districts.map(([d, n]) => (
          <button
            key={d}
            type="button"
            onClick={() => setDistrict(d === district ? null : d)}
            aria-pressed={d === district}
            className={chip(d === district)}
          >
            {d}
            <span className="ledger opacity-60">{n}</span>
          </button>
        ))}
      </div>

      {/* ⚠️ `min-w-0` ON BOTH TRACKS, and it is load-bearing rather than tidy.
          `PropertiesMap` lays out a fixed 1280x768 tile plane, and a grid
          item's default `min-width: auto` is its CONTENT's minimum — so the map
          column refused to shrink below the plane, the sibling list stretched
          with it, and the homepage scrolled sideways by 164px on a phone. This
          is the same failure recorded against the property cards, where one
          long place name pushed the page 18px wider: the fix belongs on the
          ITEM, and `truncate` on a child cannot substitute for it. */}
      <div className="mt-phi4 grid gap-phi4 lg:grid-cols-[1.618fr_1fr]">
        {/* Step 2 — the projects on the map. Keyed by district so the map
            remounts and refits its zoom instead of animating between two
            unrelated bounding boxes. */}
        <div className="min-w-0 overflow-hidden rounded-xl border border-line">
          {mappable.length > 0 ? (
            <PropertiesMap key={district ?? "all"} items={mappable} />
          ) : (
            <div className="flex h-full min-h-[18rem] items-center justify-center p-phi4 text-center text-base text-ink-muted">
              No pin has been placed for {district ?? "these developments"} yet. The list beside
              this one still has every project.
            </div>
          )}
        </div>

        {/* Step 3 — the project. Every row is a real link into the property
            page, which is where the plots are. */}
        <div className="min-w-0">
          <p className="text-tiny font-semibold uppercase tracking-[0.12em] text-ink-faint">
            {district ? `${shown.length} in ${district}` : `${shown.length} developments`}
          </p>
          <ul className="mt-phi3 space-y-2">
            {shown.map((p) => (
              <li key={p.id}>
                <Link
                  href={propertyHref(p)}
                  className="group flex items-center gap-3 rounded-card border border-line bg-canvas p-phi2 transition-colors hover:border-ink-faint"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-base text-ink group-hover:text-jamin-red-deep">
                      {p.title}
                    </span>
                    <span className="mt-0.5 block truncate text-tiny text-ink-muted">
                      {/* `phaseLabel` takes the PROPERTY, not the phase string —
                          it resolves the buyer-facing wording, which is not the
                          same as the column value ("current" reads "Upcoming"). */}
                      {locationLine(p)}
                      {phaseLabel(p) ? ` · ${phaseLabel(p)}` : ""}
                    </span>
                  </span>
                  {p.plots_available != null && p.plots_available > 0 ? (
                    <span className="ledger shrink-0 text-tiny text-ink-faint">
                      {p.plots_available} plots
                    </span>
                  ) : null}
                  <span aria-hidden="true" className="shrink-0 text-ink-faint">
                    ›
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {district ? (
            <Link
              href={`/properties?district=${encodeURIComponent(district)}`}
              className="mt-phi3 inline-block text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep transition-opacity hover:opacity-70"
            >
              Explore plots in {district} →
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
