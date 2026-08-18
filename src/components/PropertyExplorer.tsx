"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { PropertyCard } from "./PropertyCard";
import { PropertiesMap } from "./PropertiesMap";
import { SurveyIcon } from "./cadastral/SurveyIcon";
import { EmptyState, ButtonLink } from "./ui";
import { DISTRICT_STONE, STAGE_STONE, STONE_FALLBACK } from "@/lib/stones";
import {
  approvalBadges,
  formatArea,
  formatPrice,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  type Property,
} from "@/lib/properties";
import { matchReason, matches, suggestions, summaryLine } from "@/lib/search";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";
import { purposeByKey, type PurposeKey } from "@/lib/purpose";
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
type Filters = {
  q: string;
  district: string | null;
  phase: Phase | null;
  /* Arrives from the homepage's "Explore by Purpose" cards. It is a filter like
     any other — it appears as a removable chip and clears with "Clear all", so
     a visitor who lands here from a purpose card is never stuck inside it
     wondering why the list is short. */
  purpose: PurposeKey | null;
  view: View;
  compare: string[];
};

function parse(search: string): Filters {
  const s = new URLSearchParams(search);
  const phase = s.get("phase");
  const view = s.get("view");
  return {
    q: s.get("q") ?? "",
    district: s.get("district")?.trim() || null,
    phase: phase && (PHASE_ORDER as readonly string[]).includes(phase) ? (phase as Phase) : null,
    // Validated through the same map the cards are built from, so an invented
    // `?purpose=` in the URL is ignored rather than filtering to nothing.
    purpose: (purposeByKey(s.get("purpose"))?.key as PurposeKey | undefined) ?? null,
    view: view === "list" || view === "map" ? view : "grid",
    compare: (s.get("compare") ?? "").split(",").filter(Boolean).slice(0, MAX_COMPARE),
  };
}

function serialise(f: Filters): URLSearchParams {
  const s = new URLSearchParams();
  if (f.q.trim()) s.set("q", f.q.trim());
  if (f.district) s.set("district", f.district);
  if (f.phase) s.set("phase", f.phase);
  if (f.purpose) s.set("purpose", f.purpose);
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
        if (f.purpose && !purposeByKey(f.purpose)?.matches(p)) return false;
        return matches(p, f.q);
      }),
    [all, f.district, f.phase, f.purpose, f.q],
  );

  const tips = useMemo(
    () => (suggestOpen ? suggestions(all, f.q) : []),
    [all, f.q, suggestOpen],
  );

  const live = results.filter(isSellable);
  const completed = results.filter((p) => !isSellable(p));
  const active = !!(f.q.trim() || f.district || f.phase || f.purpose);
  const compared = f.compare.filter((id) => all.some((p) => p.id === id));

  function toggleCompare(id: string) {
    const next = compared.includes(id)
      ? compared.filter((x) => x !== id)
      : [...compared, id].slice(0, MAX_COMPARE);
    set({ compare: next });
  }

  /* MOBILE FILTERS FOLD BEHIND ONE BUTTON (owner report 2026-08-18: the
     chip rows "look crowded on mobile… replace with a single Filters
     button", Grid/List/Map staying visible). Phone-only — from `sm` the
     rows show as always, and the xl rail is untouched. Opens automatically
     when a filter is already active from the URL, so a shared filtered link
     never hides the chips that explain the short list. */
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const activeFilterCount = (f.district ? 1 : 0) + (f.phase ? 1 : 0) + (f.purpose ? 1 : 0);
  /* DERIVED, not an effect (the repo's eslint bans setState in an effect
     body): with a filter active the rows stay shown, so a shared filtered
     URL always explains its own short list. */
  const filtersShown = mobileFiltersOpen || activeFilterCount > 0;
  const filterRowCls = filtersShown ? "grid" : "hidden sm:grid";

  /* "Pick one more" OFFERS THE OTHER PROJECTS (owner 2026-08-17, second
     report: "it should give other projects to pick") — the first fix scrolled
     back to the listings, which still made the visitor do the finding. The
     button now opens a picker right above the tray listing every development
     not yet in the comparison; one tap adds it. Closes on pick, on re-tap,
     and on any press outside it. */
  const [pickOpen, setPickOpen] = useState(false);
  /* Compare NAVIGATES to /compare (owner 2026-08-18: "when clicked to
     compare let it go to the compare page") — this supersedes the 08-17
     popup, which is gone. The selection already travels in `ids`, so the
     destination arrives pre-loaded and stays shareable. */
  const pickRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!pickOpen) return;
    const close = (e: PointerEvent) => {
      if (pickRef.current && !pickRef.current.contains(e.target as Node)) setPickOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [pickOpen]);

  /* ⚠️ `inline-flex`, so each chip can carry the same 6px gem the nav tabs do.
     The filters ARE tabs — they select a district or a stage, which is exactly
     what the Locations and Projects menus select — so they get the same
     jewellery rather than a second visual language for the same job. */
  /* ⚠️ SEE-THROUGH TABS (owner 2026-08-17): the pressed pill is ink at 85%
     over a blur rather than solid — white copy still reads 10:1+ over any
     ground the sand system produces — and the resting pill's stone wash mixes
     with TRANSPARENT (set inline below), so the page shows through both. */
  const chip = (on: boolean) =>
    `group inline-flex items-center gap-2 rounded-full border px-4 py-2 text-tiny font-medium backdrop-blur-sm transition-colors ${
      on
        ? "border-ink bg-ink/85 text-canvas"
        : "border-line bg-canvas/40 text-ink-soft hover:border-ink-faint hover:text-ink"
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

      {/* CARTOUCHE §5's /properties LEFT FILTER RAIL (do-all round,
          2026-08-18): from `xl` the facets become a sticky rail beside the
          results instead of a band above them. ONE DOM, two layouts — below
          `xl` nothing changes, so the phone keeps the band the reports
          already tuned. `min-w-0` on the results column or a wide map/table
          would stretch the track. */}
      <div className="xl:grid xl:grid-cols-[17rem_minmax(0,1fr)] xl:items-start xl:gap-phi4">
      {/* ---- facets + view switch ---- */}
      {/* `border-t` only. The bottom rule sat a hair above the first card and
          read as a second divider stacked on the section's own spacing. */}
      {/* ⚠️ TABULAR ROWS (2026-08-17 report round) — a fixed label track, so
          DISTRICT's pills and STAGE's pills start on the same column instead
          of each row's pills beginning wherever its own label ended. The
          labels are a column now; the rows read as a register. In the `xl`
          rail the tracks stack (`xl:grid-cols-1`) — a 5.5rem label column
          inside a 17rem rail would leave the pills 10rem. */}
      <div className="mt-phi3 flex flex-col gap-phi2 border-t border-line py-phi3 xl:sticky xl:top-[calc(var(--header-h)+1rem)] xl:mt-phi4 xl:gap-phi3 xl:rounded-card xl:border xl:border-line xl:bg-canvas-alt/60 xl:p-phi3">
        {(districts.length > 1 || phases.length > 1) && (
          <button
            type="button"
            aria-expanded={filtersShown}
            onClick={() => setMobileFiltersOpen((v) => !v)}
            className="inline-flex items-center gap-2 self-start rounded-full border border-line bg-canvas px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft sm:hidden"
          >
            <svg viewBox="0 0 16 16" className="h-3.5 w-3.5" aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M2 4h12M4.5 8h7M7 12h2" />
            </svg>
            Filters
            {activeFilterCount > 0 && (
              <span className="ledger rounded-full bg-jamin-red px-1.5 text-micro text-white">
                {activeFilterCount}
              </span>
            )}
          </button>
        )}

        {districts.length > 1 && (
          <div className={`${filterRowCls} grid-cols-[5.5rem_1fr] items-center gap-2 xl:grid-cols-1 xl:items-start xl:gap-1.5`}>
            <span className="text-micro font-semibold uppercase tracking-brand text-ink-faint">
              District
            </span>
            <div className="flex flex-wrap gap-2">
            {districts.map(([d, n]) => {
              const on = f.district === d;
              const stone = DISTRICT_STONE[d] ?? STONE_FALLBACK;
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ district: on ? null : d })}
                  className={chip(on)}
                  /* Colour-coded beyond the dot now: the resting pill wears a
                     wash and a border of its own stone, so the row reads as a
                     colour key even before anything is picked. The stone never
                     becomes the WORD (two stones are illegible at this size —
                     lib/stones.ts) and the pressed state stays ink, which is
                     readable over every stone in the set. */
                  style={
                    {
                      "--rj-stone": stone,
                      ...(on
                        ? {}
                        : {
                            borderColor: `color-mix(in srgb, ${stone} 42%, transparent)`,
                            background: `color-mix(in srgb, ${stone} 10%, transparent)`,
                          }),
                    } as React.CSSProperties
                  }
                >
                  <span className={`rj-dot ${on ? "is-on" : ""}`} aria-hidden="true" />
                  {d}{" "}
                  <span className={`ledger ${on ? "text-canvas/60" : "text-ink-faint"}`}>{n}</span>
                </button>
              );
            })}
            </div>
          </div>
        )}

        {phases.length > 1 && (
          <div className={`${filterRowCls} grid-cols-[5.5rem_1fr] items-center gap-2 xl:grid-cols-1 xl:items-start xl:gap-1.5`}>
            <span className="text-micro font-semibold uppercase tracking-brand text-ink-faint">
              Stage
            </span>
            <div className="flex flex-wrap gap-2">
            {phases.map(([k, n]) => {
              const on = f.phase === k;
              const stone = STAGE_STONE[k as keyof typeof STAGE_STONE]?.stone ?? STONE_FALLBACK;
              return (
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ phase: on ? null : k })}
                  className={chip(on)}
                  style={
                    {
                      "--rj-stone": stone,
                      ...(on
                        ? {}
                        : {
                            borderColor: `color-mix(in srgb, ${stone} 42%, transparent)`,
                            background: `color-mix(in srgb, ${stone} 10%, transparent)`,
                          }),
                    } as React.CSSProperties
                  }
                >
                  <span className={`rj-dot ${on ? "is-on" : ""}`} aria-hidden="true" />
                  {PHASE_META[k].label}{" "}
                  <span className={`ledger ${on ? "text-canvas/60" : "text-ink-faint"}`}>{n}</span>
                </button>
              );
            })}
            </div>
          </div>
        )}

        {/* `justify-between` on a wrapping row is what produced the zig-zag on a
            phone: with the count and the view switch on one line the switch was
            pushed to the far edge, and once it wrapped it left a ragged gap
            beside it. Stacked below `sm`, both sides align to the same left
            edge as the chips above them. */}
        {/* ⚠️ The purpose gets its OWN removable chip rather than joining the
            district or stage rows. It arrives from a homepage card, so it is
            the one filter a visitor did not set on this page — if it were
            invisible, a short list would look like a small catalogue rather
            than a narrowed one. */}
        {f.purpose && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="mr-1 text-micro font-semibold uppercase tracking-brand text-ink-faint">
              Purpose
            </span>
            <button
              type="button"
              aria-pressed
              onClick={() => set({ purpose: null })}
              className={chip(true)}
            >
              <span className="rj-dot is-on" aria-hidden="true" />
              {purposeByKey(f.purpose)?.label}
              <span className="ml-1 text-canvas/60" aria-hidden="true">✕</span>
            </button>
          </div>
        )}

        <div className="flex flex-col gap-phi2 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between xl:flex-col xl:items-start">
          <div className="flex items-center gap-3">
            {active && (
              <>
                <span className="text-tiny text-ink-muted">
                  <span className="ledger">{results.length}</span> of{" "}
                  <span className="ledger">{all.length}</span> shown
                </span>
                <button
                  type="button"
                  onClick={() => set({ q: "", district: null, phase: null, purpose: null })}
                  className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep"
                >
                  Clear filters
                </button>
              </>
            )}
          </div>

          <div className="flex items-center gap-1 self-start rounded-full border border-line bg-canvas p-1 sm:self-auto">
            {/* ⚠️ The icon is DECORATION beside a label that stays — reported
                2026-08-14 as the three controls being "less recognizable at a
                glance", which is an argument for adding a mark, not for
                removing the word. Icon-only would also cost the one thing this
                switcher gets right: `capitalize` on a plain word needs no
                tooltip and no guess. The mark is `aria-hidden`; the button's
                accessible name is still its text. */}
            {/* Colorized (owner 2026-08-17): each resting segment wears its
                own stone wash — the Downloads trio, red/teal/gold — while the
                pressed segment stays the ink pill, readable over any of them. */}
            {(
              [
                { v: "grid", icon: "grid", stone: "var(--color-cta)" },
                { v: "list", icon: "list", stone: "var(--color-emerald-deep)" },
                { v: "map", icon: "map", stone: "var(--color-jamin-gold)" },
              ] as const
            ).map(({ v, icon, stone }) => (
              <button
                key={v}
                type="button"
                aria-pressed={f.view === v}
                onClick={() => set({ view: v })}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-tiny font-medium capitalize transition-colors ${
                  f.view === v ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink"
                }`}
                style={
                  f.view === v
                    ? undefined
                    : { background: `color-mix(in srgb, ${stone} 9%, transparent)` }
                }
              >
                <SurveyIcon name={icon} size="h-3.5 w-3.5" className="shrink-0" />
                {v}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ---- results (the rail's right column from `xl`) ---- */}
      <div className="min-w-0">
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
            /* Stacked on a phone. Wrapping a right-aligned price block under a
               left-aligned title is what made every row look differently
               aligned depending on how long its title happened to be. */
            <li
              key={p.id}
              className="flex flex-col gap-phi2 py-phi3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-phi3"
            >
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
              <div className="flex items-baseline gap-3 sm:block sm:text-right">
                <div className="ledger text-base text-ink">{formatPrice(p)}</div>
                {formatArea(p) && (
                  <div className="ledger text-tiny text-ink-faint">{formatArea(p)}</div>
                )}
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
                  /* `flex` so the card inside stretches to the row height the
                     grid gives this wrapper — without it the compare button's
                     positioning context is full height but the card is not. */
                  <div key={p.id} className="relative flex">
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
              /* Colour-coded like the filter pills above: each chip wears the
                 stone of its property's district, dot included, so the tray
                 speaks the same colour key as the rest of the page. */
              const stone = DISTRICT_STONE[p.district ?? ""] ?? STONE_FALLBACK;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => toggleCompare(id)}
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-tiny text-ink-soft transition-colors hover:border-jamin-red-deep hover:text-jamin-red-deep"
                  style={
                    {
                      "--rj-stone": stone,
                      borderColor: `color-mix(in srgb, ${stone} 42%, transparent)`,
                      background: `color-mix(in srgb, ${stone} 10%, transparent)`,
                    } as React.CSSProperties
                  }
                >
                  <span className="rj-dot is-on" aria-hidden="true" />
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
              className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep hover:text-jamin-red"
            >
              Clear
            </button>
            {compared.length >= 2 ? (
              <Link
                href={`/compare?ids=${compared.join(",")}`}
                className="rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all hover:bg-jamin-red-deep"
              >
                Compare {compared.length}
              </Link>
            ) : all.filter((p) => !compared.includes(p.id)).length === 0 ? (
              /* 🚨 A DISTRICT PAGE WITH ONE DEVELOPMENT CAN NEVER FILL THE
                 TRAY FROM ITS OWN LIST — `all` here is only that district's
                 properties, so the picker below would open EMPTY (the owner's
                 2026-08-18 Coimbatore screenshot). When there is nothing left
                 to offer locally, the same gold control walks to /compare,
                 whose picker spans the whole catalogue, carrying the current
                 selection in `ids`. */
              <Link
                href={`/compare?ids=${compared.join(",")}`}
                className="rounded-full border border-jamin-gold bg-jamin-gold-soft/70 px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-gold-ink transition-all hover:bg-jamin-gold/25"
              >
                Pick one more
              </Link>
            ) : (
              /* A real button in gold guidance dress, not a dead link — the
                 gold says "next step", the red above says "go". */
              <div ref={pickRef} className="relative">
                <button
                  type="button"
                  aria-expanded={pickOpen}
                  aria-haspopup="true"
                  onClick={() => setPickOpen((v) => !v)}
                  className="rounded-full border border-jamin-gold bg-jamin-gold-soft/70 px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-gold-ink transition-all hover:bg-jamin-gold/25"
                >
                  Pick one more
                </button>
                {pickOpen && (
                  <div className="absolute bottom-[calc(100%+0.5rem)] right-0 z-40 max-h-80 w-80 max-w-[calc(100vw-2.5rem)] overflow-y-auto rounded-card border border-line bg-canvas p-2 shadow-raise">
                    <p className="px-3 pb-1.5 pt-1 text-micro font-semibold uppercase tracking-brand text-ink-faint">
                      Add to the comparison
                    </p>
                    {all
                      .filter((p) => !compared.includes(p.id))
                      .map((p) => {
                        const stone = DISTRICT_STONE[p.district ?? ""] ?? STONE_FALLBACK;
                        return (
                          <button
                            key={p.id}
                            type="button"
                            onClick={() => {
                              toggleCompare(p.id);
                              setPickOpen(false);
                            }}
                            className="flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left transition-colors"
                            style={
                              {
                                "--rj-stone": stone,
                                background: `color-mix(in srgb, ${stone} 8%, transparent)`,
                                marginTop: 4,
                              } as React.CSSProperties
                            }
                          >
                            <span className="rj-dot is-on shrink-0" aria-hidden="true" />
                            <span className="min-w-0">
                              <span className="block truncate text-tiny font-medium text-ink">
                                {p.title}
                              </span>
                              <span className="block truncate text-micro uppercase tracking-[0.1em] text-ink-faint">
                                {locationLine(p)}
                              </span>
                            </span>
                          </button>
                        );
                      })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
      </div>
      </div>

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
