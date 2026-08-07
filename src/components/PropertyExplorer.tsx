"use client";

import { useEffect, useMemo, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { EmptyState, ButtonLink } from "./ui";
import { isSellable, type Property } from "@/lib/properties";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";

/**
 * Filtering that does not cost the page its static HTML.
 *
 * §12 asks for shareable filtered URLs; §45 asks for indexable pages. Reading
 * `useSearchParams()` would push this subtree out of the static prerender and
 * leave a crawler looking at a Suspense fallback instead of the listings. So
 * the first render is deliberately unfiltered — the full set is in the HTML for
 * every crawler — and the URL is applied once, after hydration. With a
 * four-item dataset the transition is imperceptible.
 *
 * The URL is kept in sync with `replaceState`, so a filtered view can be copied
 * and shared, and Back does not turn into a walk through every chip the visitor
 * happened to tap.
 */

type Filters = { district: string | null; phase: Phase | null };
const EMPTY: Filters = { district: null, phase: null };

function readUrl(): Filters {
  if (typeof window === "undefined") return EMPTY;
  const q = new URLSearchParams(window.location.search);
  const district = q.get("district");
  const phase = q.get("phase");
  return {
    district: district && district.trim() ? district : null,
    phase: phase && (PHASE_ORDER as readonly string[]).includes(phase) ? (phase as Phase) : null,
  };
}

function writeUrl(f: Filters) {
  if (typeof window === "undefined") return;
  const q = new URLSearchParams();
  if (f.district) q.set("district", f.district);
  if (f.phase) q.set("phase", f.phase);
  const qs = q.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
}

export function PropertyExplorer({ all }: { all: Property[] }) {
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFilters(readUrl());
    setHydrated(true);
  }, []);

  const districts = useMemo(() => {
    const m = new Map<string, number>();
    for (const p of all) {
      const d = (p.district ?? p.city ?? "").trim();
      if (d) m.set(d, (m.get(d) ?? 0) + 1);
    }
    return [...m.entries()].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  }, [all]);

  const phases = useMemo(
    () =>
      PHASE_ORDER.map((k) => [k, all.filter((p) => p.project_phase === k).length] as const).filter(
        ([, n]) => n > 0,
      ),
    [all],
  );

  const matches = useMemo(
    () =>
      all.filter((p) => {
        if (filters.district && (p.district ?? p.city ?? "").trim() !== filters.district) return false;
        if (filters.phase && p.project_phase !== filters.phase) return false;
        return true;
      }),
    [all, filters],
  );

  const live = matches.filter(isSellable);
  const completed = matches.filter((p) => !isSellable(p));
  const active = !!(filters.district || filters.phase);

  function set(next: Filters) {
    setFilters(next);
    writeUrl(next);
  }

  // Only one facet is offered per row, and a second tap on the active chip
  // clears it — no separate "deselect" control to explain.
  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-tiny font-medium transition-colors ${
      on
        ? "border-ink bg-ink text-canvas"
        : "border-line bg-canvas text-ink-soft hover:border-ink-faint hover:text-ink"
    }`;

  return (
    <>
      {(districts.length > 1 || phases.length > 1) && (
        <div className="mt-phi4 flex flex-col gap-phi2 border-y border-line py-phi3">
          {districts.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-micro font-semibold uppercase tracking-brand text-ink-faint">
                District
              </span>
              {districts.map(([d, n]) => {
                const on = filters.district === d;
                return (
                  <button
                    key={d}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ ...filters, district: on ? null : d })}
                    className={chip(on)}
                  >
                    {d} <span className={on ? "text-canvas/60" : "text-ink-faint"}>{n}</span>
                  </button>
                );
              })}
            </div>
          )}
          {phases.length > 1 && (
            <div className="flex flex-wrap items-center gap-2">
              <span className="mr-1 text-micro font-semibold uppercase tracking-brand text-ink-faint">
                Stage
              </span>
              {phases.map(([k, n]) => {
                const on = filters.phase === k;
                return (
                  <button
                    key={k}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set({ ...filters, phase: on ? null : k })}
                    className={chip(on)}
                  >
                    {PHASE_META[k].label}{" "}
                    <span className={on ? "text-canvas/60" : "text-ink-faint"}>{n}</span>
                  </button>
                );
              })}
            </div>
          )}
          {hydrated && active && (
            <div className="flex items-center gap-3 text-tiny text-ink-muted">
              <span>
                {matches.length} of {all.length} shown
              </span>
              <button
                type="button"
                onClick={() => set(EMPTY)}
                className="font-semibold uppercase tracking-[0.12em] text-jamin-red"
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}

      {matches.length === 0 ? (
        <div className="mt-phi5">
          <EmptyState
            title="Nothing matches that combination"
            body="No development fits both of those filters at the moment. Clearing one usually brings the closest options back."
            action={
              <>
                <button
                  type="button"
                  onClick={() => set(EMPTY)}
                  className="inline-flex items-center rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white"
                >
                  Show everything
                </button>
                <ButtonLink href="/contact" variant="secondary">
                  Tell us what you want
                </ButtonLink>
              </>
            }
          />
        </div>
      ) : (
        <>
          {live.length > 0 && (
            <section className="mt-phi5">
              <div className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
                {live.map((p, i) => (
                  <PropertyCard key={p.id} p={p} priority={i < 3} />
                ))}
              </div>
            </section>
          )}

          {completed.length > 0 && (
            <section className={live.length > 0 ? "mt-phi6 border-t border-line pt-phi5" : "mt-phi5"}>
              <h2 className="text-2xl text-ink">Completed projects</h2>
              <p className="mt-phi2 max-w-xl text-base leading-relaxed text-ink-muted">
                Fully delivered developments, listed for reference. These are not available to buy.
              </p>
              <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((p) => (
                  <PropertyCard key={p.id} p={p} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </>
  );
}
