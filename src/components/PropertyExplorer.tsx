"use client";

import Link from "next/link";
import { createPortal } from "react-dom";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
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

/** `useLayoutEffect` on the client, `useEffect` on the server render of this
 *  client component — React warns about the former during SSR and the warning
 *  is the only difference. See the view-anchor note below for why the scroll
 *  correction cannot wait until after paint. */
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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
  /**
   * Item 15 — the key that makes a filter change legible AS a change.
   *
   * Changing this string remounts the results container, which re-runs
   * `rj-swap`'s 220ms settle. Cached images do not re-fetch on a remount, so
   * the cards fade rather than flash.
   *
   * ⚠️ `view` IS DELIBERATELY NOT IN IT, and `compare` must never be. The
   * three views are separate elements already, so including it would be
   * redundant; including `compare` would replay the whole grid every time a
   * reader ticks one card's compare box, which is a flash on an action that
   * changed nothing about what is listed.
   *
   * ⚠️ IT IS NOT PUT ON THE MAP. `PropertiesMap` re-initialises on a
   * remount, and paying for that on every keystroke is exactly the cost the
   * rest of this component is written to avoid.
   */
  const swapKey = `${f.q}|${f.district ?? ""}|${f.phase ?? ""}|${f.purpose ?? ""}`;
  const [suggestOpen, setSuggestOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement>(null);

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * THE VIEW SWITCH HOLDS THE READER'S PLACE (report 6, 2026-08-19: "Scroll
   * position is not maintained when switching from Grid View to List View").
   *
   * Grid and list are wildly different heights for the same result set — three
   * columns of tall cards against one column of short rows — so the document
   * shrinks by thousands of pixels on the switch. The browser keeps `scrollY`
   * and simply clamps it to the new maximum, which lands the reader somewhere
   * unrelated. Nothing was "scrolling"; the page moved underneath them.
   *
   * ⚠️ THE ANCHOR IS A CARD, NOT AN OFFSET — AND NOT THE RESULTS CONTAINER
   * EITHER. Both of those were tried and both are no-ops exactly where the bug
   * lives. Measured on /properties at 1440x820: the document is 4959px in grid
   * and 3309px in list, so the maximum scroll drops from 4139 to 2489. A reader
   * at y=4000 is CLAMPED to 2489 by the browser, and any fix that computes "put
   * me back at y=4000" is asking for a position the shorter document does not
   * have — it clamps straight back and nothing moves.
   *
   * What survives the switch is the CONTENT. So the topmost card still on
   * screen is remembered by id, and after the switch that same card is put back
   * at the same height in the viewport. It exists in both views, so the sum is
   * always satisfiable; if the reader was near the end and the target now sits
   * past the new maximum, the browser clamps to the bottom, which is the
   * closest place that exists.
   *
   * ⚠️ A LAYOUT EFFECT, and it has to be. `useEffect` runs after paint, so the
   * reader sees the jump and then sees it corrected — a flicker is worse than
   * the bug. The isomorphic alias below keeps React from warning about
   * `useLayoutEffect` during the server render of this client component.
   *
   * ⚠️ The anchor is CLEARED on read, so an unrelated re-render (a filter, a
   * compare tick) can never trigger a stray scroll.
   * ═══════════════════════════════════════════════════════════════════════
   */
  const resultsRef = useRef<HTMLDivElement>(null);
  const viewAnchor = useRef<{ id: string; top: number } | null>(null);

  function setView(view: View) {
    const root = resultsRef.current;
    if (root) {
      /* The topmost card still on screen — `bottom > 0` rather than `top >= 0`
         so a card the reader is halfway through still counts as the one they
         are looking at. Reading from a live NodeList in document order means
         the first match is the topmost. */
      const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-pid]"));
      const first = cards.find((el) => el.getBoundingClientRect().bottom > 0);
      viewAnchor.current =
        first && first.dataset.pid
          ? { id: first.dataset.pid, top: first.getBoundingClientRect().top }
          : null;
    }
    set({ view });
  }

  useIsoLayoutEffect(() => {
    const a = viewAnchor.current;
    viewAnchor.current = null;
    if (!a) return;
    /* Absent in map view, and absent if the card fell out of the filtered set
       between renders — either way there is nothing to line up against. */
    const el = resultsRef.current?.querySelector<HTMLElement>(
      `[data-pid="${CSS.escape(a.id)}"]`,
    );
    if (!el) return;
    const delta = el.getBoundingClientRect().top - a.top;
    // Sub-pixel differences are layout noise, not a jump.
    if (Math.abs(delta) > 1) window.scrollBy(0, delta);
  }, [f.view]);

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

  /**
   * ═══════════════════════════════════════════════════════════════════════
   * THE GRID IS GROUPED BY PHASE (report 6, 2026-08-19: "Future and Ongoing
   * projects are displayed under the same section").
   *
   * It used to be a two-way split on `isSellable`, which answers a DIFFERENT
   * question — "can you buy it" — and Ongoing, Upcoming and Future are all
   * yes. So three stages that mean three very different things to a buyer
   * (being handed over / about to open / land secured) arrived as one
   * undifferentiated wall of cards.
   *
   * ⚠️ `completed` STILL CATCHES SOLD-OUT, and that is why this is not simply
   * a group-by. A development can be sold out while its phase still says
   * `ongoing`; the report asks for "Completed/Sold Out projects only" in one
   * section, so anything not sellable joins the completed group whatever its
   * phase says. The filter below therefore takes sellable items for every
   * stage EXCEPT completed, and completed takes everything else — which is
   * what keeps the two rules from double-counting a row.
   *
   * ⚠️ `unphased` EXISTS BECAUSE `project_phase` IS NULLABLE. A row with no
   * phase, or one naming a stage this build does not know, would silently
   * vanish from a pure group-by — a property that is on sale and appears
   * nowhere is the worst failure this page has. They get their own section.
   * ═══════════════════════════════════════════════════════════════════════
   */
  const groups = useMemo(() => {
    const sellable = results.filter(isSellable);
    const known = PHASE_ORDER.map((key) => ({
      key,
      meta: PHASE_META[key],
      selling: key !== "completed",
      items:
        key === "completed"
          ? results.filter((p) => p.project_phase === "completed" || !isSellable(p))
          : sellable.filter((p) => p.project_phase === key),
    }));
    const unphased = sellable.filter(
      (p) => !PHASE_ORDER.includes((p.project_phase ?? "") as Phase),
    );
    if (unphased.length) {
      known.splice(known.length - 1, 0, {
        key: "unphased" as Phase,
        meta: {
          label: "Also selling",
          blurb: "Developments open to buy that are not yet assigned a stage.",
        },
        selling: true,
        items: unphased,
      });
    }
    return known.filter((g) => g.items.length > 0);
  }, [results]);
  const active = !!(f.q.trim() || f.district || f.phase || f.purpose);
  const compared = f.compare.filter((id) => all.some((p) => p.id === id));

  function toggleCompare(id: string) {
    const next = compared.includes(id)
      ? compared.filter((x) => x !== id)
      : [...compared, id].slice(0, MAX_COMPARE);
    set({ compare: next });
  }

  /* THE FILTER SHEET, AT EVERY WIDTH (report 13, 2026-08-21) — one control,
     one panel, phone and desktop alike. It replaces both the phone-only
     `mobileFiltersOpen` fold and the `xl` sticky rail; see the note at the
     control bar for the measurement that retired the rail. */
  const [filtersOpen, setFiltersOpen] = useState(false);
  const activeFilterCount = (f.district ? 1 : 0) + (f.phase ? 1 : 0) + (f.purpose ? 1 : 0);
  /**
   * ═══════════════════════════════════════════════════════════════════════
   * 🚨 A PANEL IS OPEN WHEN THE READER OPENED IT (report 7, 2026-08-19, and
   * the rule survives the report-13 rebuild).
   *
   * `|| activeFilterCount > 0` once forced the facets open whenever a filter
   * was set, so the FIRST tap permanently unfolded every option — eleven chips
   * pushing the first card most of a screen down, with no way to fold them
   * back. What an active filter gets instead is the summary chip row in the
   * control bar: it names the choice and carries a × to undo it, which is both
   * a smaller footprint and a better answer to "where did this come from".
   * ═══════════════════════════════════════════════════════════════════════
   */

  /** The active choices, as {label, clear} — the control bar's chip row and
   *  nothing else reads this. Built here so the row stays declarative. */
  const activeChips: { key: string; label: string; clear: () => void }[] = [];
  if (f.district) activeChips.push({ key: "district", label: f.district, clear: () => set({ district: null }) });
  if (f.phase)
    activeChips.push({
      key: "phase",
      label: PHASE_META[f.phase]?.label ?? f.phase,
      clear: () => set({ phase: null }),
    });
  if (f.purpose)
    activeChips.push({
      key: "purpose",
      label: purposeByKey(f.purpose)?.label ?? f.purpose,
      clear: () => set({ purpose: null }),
    });

  /* Escape closes the filter sheet — a full-height overlay with no keyboard
     exit is a trap. Bound only while it is open. */
  useEffect(() => {
    if (!filtersOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setFiltersOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [filtersOpen]);

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
  /* ⚠️ `rj-chip-glass` REPLACES `bg-canvas/40 backdrop-blur-sm` on the resting
     pill and nothing else (do-all round, menu item 6). The old pair was half
     glass: `blur-sm` is 4px and there was no saturation, so over a photograph
     the rail read as fog rather than as material.

     ⚠️ IT DOES NOT TOUCH THE STONE. Each resting pill is painted with its
     district's colour through an INLINE `background`, and an inline style beats
     a class — the tint inside `rj-chip-glass` is only the fallback for pills
     that carry no stone. The colour key shipped on 2026-08-18 is untouched.

     ⚠️ The pressed pill keeps `backdrop-blur-sm` EXPLICITLY rather than
     inheriting it from the base. `bg-ink/85` over a bright photograph without
     any blur is a muddy rectangle, and writing it here means the two states do
     not silently depend on which stylesheet wins. */
  /* 🚨 A FIXED CELL, NOT AN INLINE PILL (report 8, 2026-08-19: "filter options
     are using inconsistent spacing and occupying unnecessary vertical
     space… keep all filter cards/chips at a consistent fixed size… do not let
     the filter card size change based on the text length").

     `inline-flex` sized every chip to its own label, so "Coimbatore 1" and
     "Salem 1" were different widths and the row wrapped wherever it happened
     to run out — a ragged block whose height changed with the district names.
     The chips are now CELLS of a two-column grid (see `facetGridCls`): equal
     width, equal height, equal gutters, and a predictable number of rows.

     ⚠️ `justify-between` + `truncate`, because a fixed cell and a long label
     are only compatible if the label can give way. The count stays pinned to
     the right so the column of numbers lines up. */
  /* 🚨 NEUTRAL RESTING PILLS, CHARCOAL + RED ACTIVE (report 10, 2026-08-21:
     "Use Jamin red / dark charcoal for the active filter. Remove unnecessary
     blue accents"). The per-stone washes are gone from the FILTER pills only —
     "Future" wore sapphire and "Upcoming" amethyst, which is exactly the blue
     the report points at. Resting pills are quiet canvas cells; the pressed
     pill stays the dark charcoal ink over blur, and every pill's dot is now
     the signal red (`--rj-stone` set once on the container below). The colour
     key survives everywhere else it shipped — cards, tray, nav. */
  const chip = (on: boolean) =>
    `group flex min-h-[44px] w-full items-center justify-between gap-2 overflow-hidden rounded-full border px-3.5 py-2 text-tiny font-medium transition-colors ${
      on
        ? "border-ink bg-ink/85 text-canvas backdrop-blur-sm"
        : "border-line bg-canvas text-ink-soft hover:border-ink-faint hover:text-ink"
    }`;

  /* 🚨 ONE PER ROW IN THE SHEET (report 10's "fix the Tiruchirappalli,
     upcoming, completed clipping issue", carried into the report-13 rebuild).
     The sheet is 22rem wide, so two cells would leave ~9rem per label and
     `truncate` would eat the long district names again — the exact clipping
     that report named. Full-width cells hold every name in the catalogue at
     every width, which also makes the panel identical on a phone and a
     desktop. */
  const facetGridCls = "mt-2 grid grid-cols-1 gap-2";

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

      {/* 🚨 THE PERMANENT LEFT RAIL IS GONE (report 13, 2026-08-21: "remove the
          permanent left filter panel because the cards are looking with less
          width to display context… keep controls at the top beside search…
          place a compact control bar directly below the header: Search bar |
          FILTER | GRID | LIST | MAP. Keep this control bar sticky while
          scrolling. Filter must open as an overlay popup at the right side").

          ⚠️ THIS REVERSES THE 2026-08-18 RAIL AND THE 2026-08-21 DIVIDER, AND
          THE MEASUREMENT IS WHY. The 17rem rail plus its gutter left a
          three-column card 272px wide at 1440 — which is the same 272px that
          made every area figure overflow its cell two reports ago. The rail
          was spending a fifth of the page permanently on six pills a reader
          touches once. Behind a control it costs nothing until it is wanted,
          and the cards get the width back.

          ⚠️ ONE FILTER UI AT EVERY WIDTH NOW, which is the simplification the
          phone reports were circling: report 13 offered three options for
          mobile and its third — "tapping it opens a bottom-sheet filter
          panel" — is the same interaction as the desktop overlay, so both are
          the one panel below. The separate `mobileFiltersOpen` state, the
          `sm:hidden` summary row and the `filterRowCls` visibility switch all
          go with it. */}
      <div className="flex flex-col">
      {/* ---- the control bar ---- */}
      <div
        className="rj-controlbar sticky top-[var(--header-h)] z-20 -mx-5 mt-phi3 flex flex-wrap items-center gap-phi2 border-y border-line bg-canvas/95 px-5 py-phi2 backdrop-blur lg:-mx-10 lg:px-10"
        style={{ "--rj-stone": "var(--color-jamin-red)" } as React.CSSProperties}
      >
        {(districts.length > 1 || phases.length > 1) && (
          <button
            type="button"
            aria-expanded={filtersOpen}
            aria-haspopup="dialog"
            onClick={() => setFiltersOpen(true)}
            /* ⚠️ `h-11`, NOT `min-h-[44px]` (report 16: the Filters bar
               "appears visually unbalanced… spacing, button sizing, alignment").
               The three control types in this row stood at three different
               heights — this button 44px, the active chips 36px, the view
               segment about 40px — which is what reads as unbalanced. They are
               now one height. 44px rather than 40 because this is the primary
               touch target on a phone and 44 is the floor for one. */
            className="inline-flex h-11 items-center gap-2 rounded-full border border-line bg-canvas px-4 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
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

        {/* 🚨 THE ACTIVE CHOICES, WITH A WAY OUT (report 7, 2026-08-19:
            "display the selected District and Stage clearly as active filter
            chips… use a visible × icon on each active chip to remove it").
            At EVERY width now — with the options behind a control there is no
            longer a pressed pill on the page saying what is selected, so this
            row is the only thing that does.

            ⚠️ The × is INSIDE the button and the button's accessible name says
            what it removes — "Remove Salem filter" — so a screen reader is
            never left with a row of unlabelled crosses. */}
        {activeChips.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={c.clear}
            aria-label={`Remove ${c.label} filter`}
            /* `h-11` to match the Filters button and the view segment — see
               the note on that button. `px-3.5` keeps the chip from looking
               squat now that it is 8px taller. */
            className="inline-flex h-11 items-center gap-1.5 rounded-full border border-ink bg-ink/85 px-3.5 text-tiny font-medium text-canvas backdrop-blur-sm transition-opacity hover:opacity-80"
          >
            {c.label}
            <svg viewBox="0 0 12 12" className="h-3 w-3 shrink-0" aria-hidden="true">
              <path
                d="M2.5 2.5l7 7M9.5 2.5l-7 7"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        ))}

        {active && (
          <span className="text-tiny text-ink-muted">
            <span className="ledger">{results.length}</span> of{" "}
            <span className="ledger">{all.length}</span> shown
          </span>
        )}

        {/* The view switch closes the bar on the right, as the report's
            "Search bar | FILTER | GRID | LIST | MAP" asks. */}
        <div
          /* `min-h-[44px]` for the same reason as the button and the chips: one
             height for every control in this bar. The segment sets its own
             height from its buttons' padding, so it needs a floor rather than a
             fixed height — forcing `h-11` would fight `.rj-segment`'s 3px inset
             padding and clip the sliding pill. */
          className="rj-segment ml-auto min-h-[44px]"
          /* Three seats. The pill's index is the view's position in the same
             order the buttons are written below — keep the two in step. */
          style={
            {
              "--rj-n": 3,
              "--rj-i": ["grid", "list", "map"].indexOf(f.view),
            } as React.CSSProperties
          }
        >
          <span className="rj-segment-pill" aria-hidden="true" />
          {/* ⚠️ The icon is DECORATION beside a label that stays — reported
              2026-08-14 as the three controls being "less recognizable at a
              glance", which is an argument for adding a mark, not for
              removing the word. The mark is `aria-hidden`; the button's
              accessible name is still its text. */}
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
              /* ⚠️ `setView`, not `set({ view })` — it captures the scroll
                 anchor first. Calling `set` directly here is the bug coming
                 back. */
              onClick={() => setView(v)}
              className="rj-segment-btn capitalize"
              /* ⚠️ THE STONE WASH STAYS ON THE RESTING SEGMENTS ONLY. The
                 pressed seat must be transparent or it would paint over the
                 pill sliding underneath it. */
              style={
                f.view === v
                  ? undefined
                  : { background: `color-mix(in srgb, ${stone} 9%, transparent)` }
              }
            >
              <SurveyIcon name={icon} size="h-3.5 w-3.5" className="shrink-0" />
              <span className="hidden sm:inline">{v}</span>
            </button>
          ))}
        </div>
      </div>

      {/* ---- the filter overlay ----
          A right-hand sheet on every width: the report's "overlay popup at the
          right side" and its own bottom-sheet suggestion are the same object,
          so it is built once. Escape closes it, the scrim closes it, and the
          panel traps nothing — a reader can still scroll the page behind on a
          desktop, which is what makes it a sheet rather than a modal takeover. */}
      {/* 🚨 PORTALLED TO <body>, AND THAT IS THE WHOLE BUG FIX (report 16,
          2026-08-22: "After clicking the Filters button, the filters sidebar
          opens from the right side. When the page is scrolled, the sidebar also
          scrolls along with the page instead of remaining fixed").

          The panel was ALREADY `fixed inset-0`. It scrolled anyway because
          `position: fixed` is only viewport-relative while no ancestor creates a
          containing block for it — and `.rj-pane`, which wraps this explorer,
          sets `backdrop-filter`. That is one of the properties (with transform,
          filter, perspective, will-change and contain) that makes an element the
          containing block for its fixed descendants. Measured before the fix at
          1280x900: the scrim reported top 892, left 41, height 3022 — the
          pane's own scroll box, not the viewport's 0/0/1280x900.

          ⚠️ SO DO NOT "FIX" THIS BY ADDING MORE POSITIONING. No combination of
          inset, z-index or transform on the panel can escape an ancestor
          containing block; only leaving that ancestor can. Portalling to
          document.body is that, and it is the same remedy this codebase's
          sibling app reached for when a pop-down rendered behind its parent.

          ⚠️ Removing `backdrop-filter` from `.rj-pane` would also have worked
          and was rejected: that class is the frosted pane on every route, and
          un-frosting the whole site to unstick one drawer is a far larger blast
          radius than moving one subtree.

          The guard is belt-and-braces — `filtersOpen` starts false so the server
          pass never reaches this branch — but a portal that reads `document`
          during SSR is a hard crash rather than a visual bug, so it is stated. */}
      {filtersOpen && typeof document !== "undefined" && createPortal(
        <div
          className="fixed inset-0 z-50 flex justify-end bg-ink/40 backdrop-blur-[2px] print:hidden"
          onClick={() => setFiltersOpen(false)}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Filter developments"
            onClick={(e) => e.stopPropagation()}
            className="flex h-full w-full max-w-[22rem] flex-col overflow-y-auto border-l border-line bg-canvas p-phi4 shadow-raise"
            style={{ "--rj-stone": "var(--color-jamin-red)" } as React.CSSProperties}
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-tiny font-semibold uppercase tracking-brand text-jamin-gold-ink">
                Filters
              </p>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                aria-label="Close filters"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
              >
                <svg viewBox="0 0 12 12" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M2.5 2.5l7 7M9.5 2.5l-7 7" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

        {districts.length > 1 && (
          <div className="mt-phi4">
            <span className="text-micro font-semibold uppercase tracking-brand text-ink-faint">
              District
            </span>
            <div className={facetGridCls}>
            {districts.map(([d, n]) => {
              const on = f.district === d;
              return (
                /* ⚠️ The stone wash this button wore is gone with report 10's
                   "remove unnecessary blue accents" — see the chip note. The
                   dot reads the container's red `--rj-stone`. */
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ district: on ? null : d })}
                  className={chip(on)}
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
          <div className="mt-phi4">
            <span className="text-micro font-semibold uppercase tracking-brand text-ink-faint">
              Stage
            </span>
            <div className={facetGridCls}>
            {phases.map(([k, n]) => {
              const on = f.phase === k;
              return (
                /* ⚠️ No stone wash — report 10's blue-accent removal; see the
                   chip note above. */
                <button
                  key={k}
                  type="button"
                  aria-pressed={on}
                  onClick={() => set({ phase: on ? null : k })}
                  className={chip(on)}
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
        {/* ⚠️ The purpose gets its OWN removable chip rather than joining the
            district or stage rows. It arrives from a homepage card, so it is
            the one filter a visitor did not set on this page — if it were
            invisible, a short list would look like a small catalogue rather
            than a narrowed one. */}
        {f.purpose && (
          <div className="mt-phi4">
            <span className="text-micro font-semibold uppercase tracking-brand text-ink-faint">
              Purpose
            </span>
            <div className="mt-2">
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
          </div>
        )}

            {/* The sheet's own foot: clear everything, or take the narrowed
                list. `mt-auto` pins the pair to the bottom of the panel, which
                is where the report's bottom-sheet sketch puts them. */}
            <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-phi3">
              <button
                type="button"
                onClick={() => set({ q: "", district: null, phase: null, purpose: null })}
                disabled={!active}
                className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep disabled:opacity-40"
              >
                Clear all
              </button>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep"
              >
                Show {results.length} result{results.length === 1 ? "" : "s"}
              </button>
            </div>
          </div>
        </div>,
        document.body,
      )}

      {/* ---- results ---- */}
      {/* `resultsRef` is what the view switch pins in place; see the note on
          `viewAnchor` above. Full width now that the rail is gone — which is
          the point of report 13's change. */}
      <div ref={resultsRef} className="min-w-0">
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
        <ul key={swapKey} className="rj-swap mt-phi5 divide-y divide-line border-y border-line">
          {results.map((p) => (
            /* Stacked on a phone. Wrapping a right-aligned price block under a
               left-aligned title is what made every row look differently
               aligned depending on how long its title happened to be. */
            <li
              key={p.id}
              /* The view switch lines this row up with its grid card of the same
                 id — see `viewAnchor`. Both views must carry it or the anchor
                 has nothing to find. */
              data-pid={p.id}
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
                    /* ⚠️ Was `text-ink-faint` — a THIRD colour for a fact the
                       stage system already owns (lib/stones.ts). Sold now reads
                       garnet here, on the card, in Compare and in Jamindar's
                       result rows, because all four ask stones.ts. A status
                       that is not `sold` keeps the neutral: `reserved` and
                       `booked` are not closed doors and must not look like one. */
                    <span className={`text-micro uppercase tracking-[0.12em] ${p.status === "sold" ? "text-garnet" : "text-ink-faint"}`}>
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
          {groups.map((g, gi) => {
            /* The stage's own stone, the same key the cards, the chips and
               /projects' bands already speak. `unphased` has none — it is not a
               stage — so it falls back to the identity metal. */
            const stone = STAGE_STONE[g.key as keyof typeof STAGE_STONE];
            const accent = stone?.stone ?? "var(--color-champagne-500)";
            return (
              <section key={g.key} className={gi === 0 ? "mt-phi5" : "mt-phi6"}>
                <div
                  className="border-b pb-phi2"
                  style={{
                    borderColor: `color-mix(in srgb, ${accent} 40%, var(--color-line))`,
                  }}
                >
                  <div style={{ borderLeft: `3px solid ${accent}`, paddingLeft: "0.9rem" }}>
                    <h2 className="text-2xl text-ink">{g.meta.label} projects</h2>
                    <p className="mt-phi2 max-w-xl text-base leading-relaxed text-ink-muted">
                      {g.meta.blurb}
                    </p>
                  </div>
                </div>
                {/* ⚠️ The swap key carries the GROUP as well as the filters, or
                    all three grids would share one animation identity and only
                    the first would replay. */}
                {/* 🚨 ONE GRID FOR EVERY COUNT AGAIN (report 10, 2026-08-20:
                    "the Tiruchirappalli, Completed and Upcoming project cards
                    are not properly contained within their layout and are
                    extending outside the intended card boundaries… ensure
                    [they] have consistent dimensions and alignment").

                    This REVERSES report 8's count-driven shapes (2026-08-19:
                    1 → full-width featured, 2 → halves). What that bought —
                    less empty pane beside a lone card — is exactly what the
                    owner now reads as a card escaping its boundary: the
                    featured card ran the full band while its neighbours held
                    a third of it, so the stages disagreed about what a card
                    IS. Every stage now sets the same `sm:2 / lg:3` tracks,
                    so a lone development is one card in the standard slot
                    and every card on the page shares one dimension. Do not
                    re-introduce the dynamic shape without the owner naming
                    report 8's complaint again — the two reports want
                    opposite things and this file follows the newer word. */}
                {/* 🚨 A LONE RESULT IS A FULL-WIDTH HORIZONTAL CARD (report 11,
                    2026-08-21, Locations pages: "When a location contains only
                    one property, do not show it as a narrow vertical card with
                    limited information. Convert it into a full-width
                    horizontal property card"). Keyed on the WHOLE result set,
                    not the group — a one-development district (Tiruppur,
                    Coimbatore) and a filter narrowed to one match both
                    qualify; on /properties with several results every stage
                    keeps the uniform sm:2/lg:3 grid the 2026-08-20 word
                    demands. */}
                {/* 🚨 SINGLE COLUMN, EVERY COUNT (owner, 2026-08-22: "in all
                    pages of the website make the cards horizontal wide. But in
                    the phone app, it should come vertical").

                    ⚠️ THIS SETTLES THE REPORT 8 / REPORT 10 ARGUMENT ABOVE
                    RATHER THAN PICKING A SIDE OF IT. Those two notes are in
                    tension because both were true: report 8 wanted a lone card
                    to fill the band, report 10 wanted every card on a page to
                    share one dimension, and a count-driven shape cannot do
                    both. Making the wide form universal does — every card is
                    now the same shape (report 10) AND every card fills the
                    band (report 8), because there is no longer a narrow form
                    to disagree with.

                    The count-keyed class is therefore gone, not merely always
                    true: `results.length === 1` no longer changes anything. */}
                <div key={`${swapKey}|${g.key}`} className="rj-swap mt-phi4 grid gap-phi3">
                  {g.items.map((p, i) =>
                    g.selling ? (
                      /* `flex` so the card inside stretches to the row height
                         the grid gives this wrapper. */
                      <div key={p.id} data-pid={p.id} className="flex">
                        {/* `priority` only in the first group: it is the LCP
                            candidate and marking every grid's first three would
                            spend the preload budget on images below the fold. */}
                        {/* 🚨 COMPARE RIDES THE CARD'S OWN FOOTER SLOT NOW
                            (report 11, 2026-08-21: it overlapped Price/View
                            details as an absolute overlay). See PropertyCard's
                            `action` note. */}
                        <PropertyCard
                          p={p}
                          priority={gi === 0 && i < 3}
                          wide
                          action={
                            <CompareToggle
                              on={compared.includes(p.id)}
                              disabled={compared.length >= MAX_COMPARE && !compared.includes(p.id)}
                              onClick={() => toggleCompare(p.id)}
                            />
                          }
                        />
                      </div>
                    ) : (
                      /* Completed and sold-out carry no compare control — there
                         is nothing to weigh up against anything. */
                      <div key={p.id} data-pid={p.id} className="flex">
                        <PropertyCard p={p} wide />
                      </div>
                    ),
                  )}
                </div>
              </section>
            );
          })}
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
}: {
  on: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      /* ⚠️ preventDefault + stopPropagation, because this control now sits
         INSIDE the card's <Link> (the footer action slot — report 11). Without
         both, ticking Compare navigates to the property. Harmless in the list
         view, where there is no ancestor link. The ShortlistHeart precedent. */
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      aria-pressed={on}
      title={disabled ? `Compare up to ${MAX_COMPARE} at once` : undefined}
      className={`rounded-full border px-3 py-1.5 text-tiny font-medium transition-colors disabled:opacity-40 ${
        on
          ? "border-ink bg-ink text-canvas"
          : "border-line bg-canvas text-ink-soft hover:border-ink-faint"
      }`}
    >
      {on ? "Comparing" : "Compare"}
    </button>
  );
}
