"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { PropertiesMap } from "./PropertiesMap";
import { EmptyState, ButtonLink } from "./ui";
import {
  approvalBadges,
  formatArea,
  formatPrice,
  isSellable,
  phaseLabel,
  propertyHref,
  type Property,
} from "@/lib/properties";
import { matchReason, matches, suggestions, summaryLine } from "@/lib/search";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";
import { setQuery, useQueryString } from "@/lib/url-state";

/**
 * Discovery: search, facets, three views and comparison (§11, §12, §18, §76).
 *
 * All of it is URL state — q, district, phase, view and compare — so any view a
 * visitor reaches can be copied to somebody else and arrive the same way.
 *
 * ⚠️ Deliberately NOT `useSearchParams()`. Reading it would push this subtree
 * out of the static prerender and hand a crawler a Suspense fallback instead of
 * the listings. The first render is the full unfiltered set — which is exactly
 * what a crawler should see — and the URL is applied once, after hydration.
 */

const MAX_COMPARE = 3;
type View = "grid" | "list" | "map";
type Filters = { q: string; district: string | null; phase: Phase | null; view: View; compare: string[] };

function parse(search: string): Filters {
  const s = new URLSearchParams(search);
  const phase = s.get("phase");
  const view = s.get("view");
  return {
    q: s.get("q") ?? "",
    district: s.get("district")?.trim() || null,
    phase: phase && (PHASE_ORDER as readonly string[]).includes(phase) ? (phase as Phase) : null,
    view: view === "list" || view === "map" ? view : "grid",
    compare: (s.get("compare") ?? "").split(",").filter(Boolean).slice(0, MAX_COMPARE),
  };
}

function serialise(f: Filters): URLSearchParams {
  const s = new URLSearchParams();
  if (f.q.trim()) s.set("q", f.q.trim());
  if (f.district) s.set("district", f.district);
  if (f.phase) s.set("phase", f.phase);
  if (f.view !== "grid") s.set("view", f.view);
  if (f.compare.length) s.set("compare", f.compare.join(","));
  return s;
}

export function PropertyExplorer({ all }: { all: Property[] }) {
  // The URL is the state. Nothing is copied into React state and re-synced,
  // so there is no moment where the two can disagree.
  const search = useQueryString();
  const f = useMemo(() => parse(search), [search]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current && !boxRef.current.contains(e.target as Node)) setSuggestOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  function set(next: Partial<Filters>) {
    setQuery(serialise({ ...f, ...next }));
  }

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

  const results = useMemo(
    () =>
      all.filter((p) => {
        if (f.district && (p.district ?? p.city ?? "").trim() !== f.district) return false;
        if (f.phase && p.project_phase !== f.phase) return false;
        return matches(p, f.q);
      }),
    [all, f.district, f.phase, f.q],
  );

  const tips = useMemo(
    () => (suggestOpen ? suggestions(all, f.q) : []),
    [all, f.q, suggestOpen],
  );

  const live = results.filter(isSellable);
  const completed = results.filter((p) => !isSellable(p));
  const active = !!(f.q.trim() || f.district || f.phase);
  const compared = f.compare.filter((id) => all.some((p) => p.id === id));

  function toggleCompare(id: string) {
    const next = compared.includes(id)
      ? compared.filter((x) => x !== id)
      : [...compared, id].slice(0, MAX_COMPARE);
    set({ compare: next });
  }

  const chip = (on: boolean) =>
    `rounded-full border px-4 py-2 text-tiny font-medium transition-colors ${
      on
        ? "border-ink bg-ink text-canvas"
        : "border-line bg-canvas text-ink-soft hover:border-ink-faint hover:text-ink"
    }`;

  return (
    <>
      {/* ---- search ---- */}
      <div ref={boxRef} className="relative mt-phi4">
        <label htmlFor="property-search" className="sr-only">
          Search developments by place, stage or approval
        </label>
        <div className="flex items-center gap-3 rounded-full border border-line bg-canvas px-phi3 py-3 shadow-lift focus-within:border-ink-faint">
          <svg viewBox="0 0 20 20" className="h-4 w-4 shrink-0 text-ink-faint" aria-hidden="true">
            <circle cx="9" cy="9" r="6" fill="none" stroke="currentColor" strokeWidth="1.6" />
            <path d="M13.5 13.5 17 17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </svg>
          <input
            id="property-search"
            type="search"
            value={f.q}
            onChange={(e) => set({ q: e.target.value })}
            onFocus={() => setSuggestOpen(true)}
            placeholder="Search by district, town, project, stage or approval"
            className="w-full bg-transparent text-base text-ink outline-none placeholder:text-ink-faint"
            autoComplete="off"
          />
          {f.q && (
            <button
              type="button"
              onClick={() => set({ q: "" })}
              className="shrink-0 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-faint hover:text-jamin-red-deep"
            >
              Clear
            </button>
          )}
        </div>

        {/* Suggestions come from the catalogue, so none of them dead-ends. */}
        {suggestOpen && tips.length > 0 && (
          <ul className="absolute z-30 mt-2 w-full overflow-hidden rounded-card border border-line bg-canvas shadow-raise">
            {tips.map((t) => (
              <li key={`${t.kind}:${t.label}`}>
                <button
                  type="button"
                  onClick={() => {
                    set({ q: t.label });
                    setSuggestOpen(false);
                  }}
                  className="flex w-full items-center justify-between gap-4 px-phi3 py-2.5 text-left transition-colors hover:bg-canvas-alt"
                >
                  <span className="text-base text-ink">{t.label}</span>
                  <span className="shrink-0 text-micro uppercase tracking-[0.12em] text-ink-faint">
                    {t.kind} · {t.count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* ---- facets + view switch ---- */}
      <div className="mt-phi3 flex flex-col gap-phi2 border-y border-line py-phi3">
        {districts.length > 1 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-micro font-semibold uppercase tracking-brand text-ink-faint">
              District
            </span>
            {districts.map(([d, n]) => {
              const on = f.district === d;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ district: on ? null : d })}
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
              const on = f.phase === k;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ phase: on ? null : k })}
                  className={chip(on)}
                >
                  {PHASE_META[k].label}{" "}
                  <span className={on ? "text-canvas/60" : "text-ink-faint"}>{n}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            {active && (
              <>
                <span className="text-tiny text-ink-muted">
                  {results.length} of {all.length} shown
                </span>
                <button
                  type="button"
                  onClick={() => set({ q: "", district: null, phase: null })}
                  className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>

          <div className="flex items-center rounded-full border border-line bg-canvas p-1">
            {(["grid", "list", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                aria-pressed={f.view === v}
                onClick={() => set({ view: v })}
                className={`rounded-full px-3.5 py-1.5 text-tiny font-medium capitalize transition-colors ${
                  f.view === v ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink"
                }`}
              >
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- results ---- */}
      {results.length === 0 ? (
        <div className="mt-phi5">
          <EmptyState
            title="Nothing matches that yet"
            body="Jamin develops in a handful of districts at a time, so a search can genuinely come up empty. Clearing a filter usually brings the closest options back — or tell us what you are looking for and we will call when it exists."
            action={
              <>
                <button
                  type="button"
                  onClick={() => set({ q: "", district: null, phase: null })}
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
      ) : f.view === "map" ? (
        <div className="mt-phi5">
          <PropertiesMap items={results} />
        </div>
      ) : f.view === "list" ? (
        <>
        {/* The cards below are h3. Without this the outline jumps h1 → h3,
            which is what a screen reader navigates by. Visually redundant
            under the page title, so it is announced rather than shown. */}
        <h2 className="sr-only">Developments</h2>
        <ul className="mt-phi5 divide-y divide-line border-y border-line">
          {results.map((p) => (
            <li key={p.id} className="flex flex-wrap items-center gap-phi3 py-phi3">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-micro font-semibold uppercase tracking-[0.14em] text-jamin-gold-ink">
                    {phaseLabel(p)}
                  </span>
                  {approvalBadges(p).map((a) => (
                    <span key={a} className="text-micro uppercase tracking-[0.12em] text-canopy">
                      {a}
                    </span>
                  ))}
                  {!isSellable(p) && (
                    <span className="text-micro uppercase tracking-[0.12em] text-ink-faint">
                      {p.status === "sold" ? "Sold out" : p.status}
                    </span>
                  )}
                </div>
                <Link href={propertyHref(p)} className="mt-1 block text-xl text-ink hover:text-jamin-red-deep">
                  {p.title}
                </Link>
                <p className="mt-0.5 text-base text-ink-muted">{summaryLine(p)}</p>
                {matchReason(p, f.q) && (
                  <p className="mt-1 text-tiny text-ink-faint">
                    Matched on {matchReason(p, f.q)!.toLowerCase()}
                  </p>
                )}
              </div>
              <div className="text-right">
                <div className="text-base text-ink">{formatPrice(p)}</div>
                {formatArea(p) && <div className="text-tiny text-ink-faint">{formatArea(p)}</div>}
              </div>
              <CompareToggle
                on={compared.includes(p.id)}
                disabled={compared.length >= MAX_COMPARE && !compared.includes(p.id)}
                onClick={() => toggleCompare(p.id)}
              />
            </li>
          ))}
        </ul>
        </>
      ) : (
        <>
          {live.length > 0 && (
            <section className="mt-phi5">
              <h2 className="sr-only">Developments currently selling</h2>
              <div className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
                {live.map((p, i) => (
                  <div key={p.id} className="relative">
                    <PropertyCard p={p} priority={i < 3} />
                    <div className="absolute right-3 top-3 z-10">
                      <CompareToggle
                        on={compared.includes(p.id)}
                        disabled={compared.length >= MAX_COMPARE && !compared.includes(p.id)}
                        onClick={() => toggleCompare(p.id)}
                        floating
                      />
                    </div>
                  </div>
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

      {/* ---- comparison tray (§18) ---- */}
      {compared.length > 0 && (
        <div className="sticky bottom-0 z-30 mt-phi4 flex flex-wrap items-center justify-between gap-3 rounded-t-card border border-line bg-canvas/95 px-phi3 py-phi2 shadow-raise backdrop-blur">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-micro font-semibold uppercase tracking-brand text-ink-faint">
              Comparing
            </span>
            {compared.map((id) => {
              const p = all.find((x) => x.id === id)!;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCompare(id)}
                  className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas-alt px-3 py-1.5 text-tiny text-ink-soft hover:border-ink-faint"
                >
                  {p.title}
                  <span aria-hidden="true">×</span>
                  <span className="sr-only">Remove from comparison</span>
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set({ compare: [] })}
              className="text-tiny font-semibold uppercase tracking-[0.12em] text-ink-faint hover:text-jamin-red-deep"
            >
              Clear
            </button>
            <Link
              href={`/compare?ids=${compared.join(",")}`}
              className={`rounded-full px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] transition-all ${
                compared.length >= 2
                  ? "bg-jamin-red text-white hover:bg-jamin-red-deep"
                  : "pointer-events-none bg-canvas-sunken text-ink-faint"
              }`}
              aria-disabled={compared.length < 2}
            >
              {compared.length < 2 ? "Pick one more" : `Compare ${compared.length}`}
            </Link>
          </div>
        </div>
      )}

    </>
  );
}

function CompareToggle({
  on,
  disabled,
  onClick,
  floating,
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
  floating?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={on}
      title={disabled ? `Compare up to ${MAX_COMPARE} at once` : undefined}
      className={`rounded-full border px-3 py-1.5 text-tiny font-medium transition-colors disabled:opacity-40 ${
        on
          ? "border-ink bg-ink text-canvas"
          : floating
            ? "border-canvas/60 bg-canvas/90 text-ink-soft backdrop-blur hover:border-ink-faint"
            : "border-line bg-canvas text-ink-soft hover:border-ink-faint"
      }`}
    >
      {on ? "Comparing" : "Compare"}
    </button>
  );
}
