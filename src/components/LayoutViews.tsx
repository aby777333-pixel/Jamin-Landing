"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { LayoutRelief } from "@/components/LayoutRelief";
import { MasterPlan, PlanParticulars } from "@/components/MasterPlan";
import { PlotSchedule } from "@/components/PlotSchedule";
import type { Plot, PlotPlan } from "@/lib/properties";
import { unitWord, type Unit } from "@/lib/units";

/**
 * 🚨 TWO WAYS TO READ THE SAME LAYOUT, AND ONE SET OF UNITS OVER BOTH.
 *
 * Owner's request 2026-08-13: "add a function that makes the map like a
 * structured block… the user can choose the view layout… 2 options to see", and
 * separately "in Tamil Nadu it is always mentioned in feet".
 *
 * The two views already existed and the page picked ONE for the reader: traced
 * projects got the drawing, untraced ones got the block grid. Both answer
 * different questions — a drawing answers "where is plot 14, and what is it
 * next to", a block answers "what is there and how big" — and on a phone the
 * second is far easier to read in a grid than on a plan you have to pinch and
 * pan. So it becomes the reader's choice wherever both are possible.
 *
 * ⚠️ NOTHING IS LOST BY CHOOSING. "All functions remain the same" was explicit,
 * so the particulars — approval number, sanctioned authority, survey numbers,
 * area statement and the conditions printed on the plan — were lifted out of
 * `MasterPlan` and now render under EITHER view. The status key, the plot record
 * and the enquiry route exist in both. What differs is only the picture.
 *
 * ⚠️ The switch does not appear when there is nothing to switch to. A project
 * with no traced geometry has one view, and a control offering a second is the
 * dead control this site's standing rule forbids.
 */
/**
 * ⚠️ three.js NEVER ENTERS THIS BUNDLE. `LayoutVR` is the only file that imports
 * it, and it arrives through `next/dynamic` with `ssr: false` — so a reader who
 * never opens the Sun & shadow view never downloads ~150 KB of renderer, and the
 * static prerender this site is built on is untouched. Importing `LayoutVR`
 * statically anywhere would silently undo that.
 */
const LayoutVR = dynamic(() => import("@/components/LayoutVR").then((m) => m.LayoutVR), {
  ssr: false,
  loading: () => (
    <div
      className="animate-pulse rounded-xl border border-line bg-canvas-alt"
      style={{ height: "clamp(320px, 58vw, 580px)" }}
    />
  ),
});

export function LayoutViews({
  plots,
  plan,
  title,
  lat = null,
  lng = null,
  sheet = null,
}: {
  plots: Plot[];
  /** Absent when the drawing was never traced — then there is only one view. */
  plan?: PlotPlan | null;
  title: string;
  /** For the sun's real position. Falls back to Edappadi inside `LayoutVR`. */
  lat?: number | null;
  lng?: number | null;
  /** The BRANDED PRINTED SHEET (owner-supplied, 2026-08-17): the sanctioned
   *  drawing as issued, offered as its own zoomable view beside the traced
   *  interactive plan. An IMAGE, never clickable — the raster and the trace
   *  cannot be registered (measured, three incompatible scales), so the
   *  functions stay on the traced view where the geometry is real. */
  sheet?: { src: string; width: number; height: number } | null;
}) {
  const hasPlan = !!plan?.viewBox && plots.some((p) => p.poly);
  const [view, setView] = useState<"plan" | "relief" | "blocks" | "sun" | "sheet">(hasPlan ? "plan" : "blocks");

  /**
   * ⚠️ FEET BY DEFAULT, and that is the point of the request rather than a
   * preference. Every figure in `plot_plan` is traced from a DTCP drawing that
   * is dimensioned in metres, and nobody buying land in Salem or Erode speaks
   * in metres. The metre view stays one tap away because the drawing is the
   * document of record — see the header of `lib/units.ts`, which explains why
   * this is a switch and not a substitution, and why the conditions printed on
   * the plan are never unit-converted.
   */
  const [unit, setUnit] = useState<Unit>("ft");
  /** The printed sheet's lightbox (owner 2026-08-17: "add a click to pop
   *  up, and close button"; 2026-08-19: "let printed sheet have a zoom in
   *  out, close"). */
  const [sheetOpen, setSheetOpen] = useState(false);
  /** Lightbox magnification. 1 = fit, which is the sheet drawn at the
   *  widest it can be without overflowing the viewport. Steps are
   *  multiplicative so each press feels the same at any level. */
  const [sheetZoom, setSheetZoom] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);

  /* Escape closes the drawing, and every open resets the magnification —
     re-opening a sheet still at 4x would look broken rather than zoomed. */
  useEffect(() => {
    if (!sheetOpen) return;
    setSheetZoom(1);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSheetOpen(false);
      if (e.key === "+" || e.key === "=") setSheetZoom((z) => Math.min(6, z * 1.4));
      if (e.key === "-") setSheetZoom((z) => Math.max(1, z / 1.4));
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [sheetOpen]);

  /* THE SUN STUDY, SURFACED (do-all round #2, 2026-08-18): the plot sheet's
     "See the sun here" dispatches this. setState inside a subscription
     callback is the pattern the effect rule allows. The 2026-08-17 "hide the
     3D and sun and shadow for later use" is cashed in by the same round —
     the Sun & shadow OPTION returns below; "3D view" stays hidden. */
  useEffect(() => {
    if (!hasPlan) return;
    const on = () => {
      setView("sun");
      rootRef.current?.scrollIntoView({ block: "start", behavior: "smooth" });
    };
    window.addEventListener("jamin:open-sun-view", on);
    return () => window.removeEventListener("jamin:open-sun-view", on);
  }, [hasPlan]);

  /** Only worth offering where a stored metre figure actually appears. */
  const hasMetricFigures =
    !!plan &&
    !!(
      plan.areaStatement?.length ||
      plan.dimensions?.length ||
      plan.roads?.length ||
      plan.osr?.areaSqm ||
      plots.some((p) => p.road_m != null || p.dim_m || p.size_sqm != null)
    );

  return (
    <div ref={rootRef}>
      {/* ⚠️ `sheet` JOINS THE GATE (2026-08-19). It was `hasPlan ||
          hasMetricFigures`, which meant a development whose only drawing is
          the sanctioned sheet had no control to reach it — the sheet option
          existed but nothing rendered the switch. */}
      {(hasPlan || sheet || hasMetricFigures) && (
        <div className="mb-phi3 flex flex-wrap items-center justify-between gap-phi2">
          {hasPlan || sheet ? (
            <Segmented
              label="Layout view"
              value={view}
              onChange={(v) => setView(v as "plan" | "relief" | "blocks" | "sun" | "sheet")}
              /* ⚠️ Relief sits BETWEEN the two, because that is the order of
                 abstraction: the drawing, the drawing tilted, then the list. It
                 is offered on exactly the same condition as the plan — traced
                 geometry — because it is the same geometry. */
              /* ⚠️ RENAMED 2026-08-15 — the labels were drawing-office words.
                 "Relief" is a cartographer's term for elevation and "Blocks"
                 names the data structure, not what the reader gets; between
                 them they made a buyer's most useful control read as CAD.
                 The VALUES are unchanged (`plan` / `relief` / `blocks`), so the
                 URL state, the analytics and every existing link still resolve
                 — this is a label change and nothing else. */
              /* ⚠️ "Sun & shadow" sits AFTER "3D view" and is named for what it
                 answers, not for its technology. Two entries both called 3D
                 would make the reader guess; nobody wants "WebGL", everybody
                 understands wanting to know where the shade falls. It stays a
                 separate entry rather than replacing the relief because the flat
                 view needs no WebGL and is the better read on a cheap phone. */
              /* ⚠️ "3D view" AND "Sun & shadow" ARE HIDDEN, NOT REMOVED —
                 owner 2026-08-17: "hide the 3D and sun and shadow for later
                 use." Everything behind them stays live: the `relief` and
                 `sun` VALUES still render below (a deep link or stored state
                 still resolves), LayoutRelief and LayoutVR stay in the
                 bundle-split imports, and restoring the two entries is
                 uncommenting two lines. Only the OPTIONS are gone, so a new
                 visitor sees plan and plot list. */
              options={[
                /* ⚠️ CONDITIONAL NOW. It was unconditional, which was safe only
                   while the whole control was gated on `hasPlan`; with the sheet
                   able to open the control on its own, an untraced project would
                   otherwise be offered an Approved plan that renders nothing. */
                ...(hasPlan ? [{ value: "plan", label: "Approved plan" }] : []),
                // { value: "relief", label: "3D view" },
                /* ⚠️ Sun & shadow HIDDEN AGAIN (owner 2026-08-18 night:
                   "hide the sun and shadow"), reversing the same day's
                   restore. The plot sheet's "See the sun here" button is
                   hidden WITH it (MasterPlan) — the pair must move together
                   or the button lands a reader in a view with no lit tab.
                   The view value, LayoutVR and the event listener all stay
                   live; restoring is uncommenting two lines. */
                // { value: "sun", label: "Sun & shadow" },
                ...(sheet ? [{ value: "sheet", label: "Printed sheet" }] : []),
                { value: "blocks", label: "Plot list" },
              ]}
            />
          ) : (
            <span />
          )}

          {hasMetricFigures && (
            <Segmented
              label="Measurements"
              value={unit}
              onChange={(v) => setUnit(v as Unit)}
              options={[
                { value: "ft", label: "Feet" },
                { value: "m", label: "Metres" },
              ]}
            />
          )}
        </div>
      )}

      {view === "sheet" && sheet ? (
        <>
          {/* Click to open the lightbox; the inline frame stays scrollable for
              readers who never click. */}
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            aria-haspopup="dialog"
            className="block w-full cursor-zoom-in overflow-auto rounded-xl border border-line bg-canvas text-left"
            style={{ maxHeight: "min(78vh, 900px)" }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={sheet.src}
              width={sheet.width}
              height={sheet.height}
              alt={`${title} — the sanctioned layout drawing as issued`}
              className="h-auto w-full"
              loading="lazy"
              decoding="async"
            />
          </button>
          {/* ⚠️ PORTALLED to <body> — body > main is a stacking context, so an
              overlay left inside it paints UNDER the sticky header. Same
              lesson as the plot sheet and the gallery lightbox. */}
          {sheetOpen &&
            createPortal(
              <div
                role="dialog"
                aria-modal="true"
                aria-label={`${title} — layout drawing`}
                className="fixed inset-0 z-[60] overflow-auto bg-ink/85 p-4 backdrop-blur-sm"
                onClick={() => setSheetOpen(false)}
              >
                {/* ⚠️ THE CONTROLS STOP THE CLICK. The backdrop closes on click, so
                    a toolbar sitting on top of it would dismiss the drawing on the
                    way to zooming in. Each button calls stopPropagation, and so
                    does the image — clicking the sheet magnifies it instead of
                    closing, which is what a reader who has just zoomed expects. */}
                <div
                  className="fixed right-4 top-4 z-[61] flex items-center gap-2"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => setSheetZoom((z) => Math.max(1, z / 1.4))}
                    disabled={sheetZoom <= 1}
                    aria-label="Zoom out"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-2xl leading-none text-ink shadow-raise transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    −
                  </button>
                  <span
                    className="ledger min-w-[4.5rem] rounded-full bg-canvas px-3 py-2 text-center text-tiny text-ink-soft shadow-raise"
                    aria-live="polite"
                  >
                    {Math.round(sheetZoom * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setSheetZoom((z) => Math.min(6, z * 1.4))}
                    disabled={sheetZoom >= 6}
                    aria-label="Zoom in"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-canvas text-2xl leading-none text-ink shadow-raise transition-transform hover:scale-105 disabled:opacity-40 disabled:hover:scale-100"
                  >
                    +
                  </button>
                  <button
                    type="button"
                    onClick={() => setSheetOpen(false)}
                    aria-label="Close the drawing"
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-cta text-xl text-white shadow-raise transition-transform hover:scale-105"
                  >
                    ×
                  </button>
                </div>
                {/* ⚠️ `w-max min-w-full` IS LOAD-BEARING, TWICE OVER.
                    `min-w-full` keeps the track at least the viewport wide so a
                    small drawing still centres; `w-max` lets it grow to the
                    zoomed image so the centring happens inside the SCROLLABLE
                    width. Centring on the scroller itself pushes the overflow
                    half off the left edge, where no scrollbar can reach it. */}
                <div className="flex w-max min-w-full items-start justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sheet.src}
                  width={sheet.width}
                  height={sheet.height}
                  alt=""
                  onClick={(e) => {
                    e.stopPropagation();
                    setSheetZoom((z) => (z >= 6 ? 1 : Math.min(6, z * 1.4)));
                  }}
                  className={`h-auto max-w-none shrink-0 rounded-lg ${
                    sheetZoom >= 6 ? "cursor-zoom-out" : "cursor-zoom-in"
                  }`}
                  /* ⚠️ `sheet.width`, NOT A LITERAL. This was `min(96vw, 1055px)`,
                     and 1055 is EDAPPADI'S sheet width baked into a shared
                     component — every other drawing was being capped at the size
                     of the first one that happened to use it. Trichy's sheet is
                     1500 wide and was rendering at 70% of itself. */
                  style={{
                    maxHeight: "none",
                    width: `min(${96 * sheetZoom}vw, ${sheet.width * sheetZoom}px)`,
                  }}
                />
                </div>
              </div>,
              document.body,
            )}
        </>
      ) : view === "plan" && plan ? (
        <MasterPlan plots={plots} plan={plan} title={title} unit={unit} />
      ) : view === "relief" && plan ? (
        <LayoutRelief plots={plots} plan={plan} unit={unit} />
      ) : view === "sun" && plan ? (
        <LayoutVR plots={plots} plan={plan} lat={lat} lng={lng} />
      ) : (
        <PlotSchedule plots={plots} unit={unit} />
      )}

      {plan && <PlanParticulars plan={plan} unit={unit} />}

      {/* ⚠️ SAYS SO IN PROSE, and it is not boilerplate. A reader looking at
          "29.5 ft ROAD" on a drawing whose own printed conditions say "all
          dimensions are in metres" is entitled to know which of the two the
          site did. It also keeps the rounding honest: 9.00 m is exact on the
          approved plan, 29.5 ft is this page's arithmetic. */}
      {hasMetricFigures && (
        <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
          Shown in {unitWord(unit)}.{" "}
          {unit === "ft"
            ? "The approved drawing is dimensioned in metres; these figures are converted from it. Switch to metres for the sanctioned values."
            : "These are the sanctioned values as printed on the approved drawing."}
        </p>
      )}
    </div>
  );
}

/**
 * A two-option segmented control.
 *
 * ⚠️ `role="group"` with `aria-pressed` buttons rather than a radio group. A
 * radio group would be the stricter pattern, but it wants arrow-key navigation
 * and a roving tabindex to be correct, and a mislabelled radio group is worse
 * than a pair of honest toggle buttons. Both options are always visible, both
 * are reachable by Tab, and each announces its own state.
 */
function Segmented({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  /* ⚠️ CLAMPED, not just `findIndex`. A stored or deep-linked `view` can name
     an option that is currently commented out — `relief` and `sun` both are —
     and `findIndex` returns -1 for those. Feeding -1 to the pill would park it
     one whole seat to the LEFT of the rail, outside the capsule. Falling back
     to 0 puts it under the first option, which is what the reader sees
     highlighted anyway. */
  const index = Math.max(
    0,
    options.findIndex((o) => o.value === value),
  );

  return (
    <div
      role="group"
      aria-label={label}
      className="rj-segment"
      /* The two numbers the pill's arithmetic needs. See `.rj-segment-pill`. */
      style={{ "--rj-n": options.length, "--rj-i": index } as React.CSSProperties}
    >
      {/* Decoration only — `aria-pressed` on each button is still what is
          announced, so the pill is hidden from the tree. */}
      <span className="rj-segment-pill" aria-hidden="true" />
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={o.value === value}
          className="rj-segment-btn"
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
