"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
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
}: {
  plots: Plot[];
  /** Absent when the drawing was never traced — then there is only one view. */
  plan?: PlotPlan | null;
  title: string;
  /** For the sun's real position. Falls back to Edappadi inside `LayoutVR`. */
  lat?: number | null;
  lng?: number | null;
}) {
  const hasPlan = !!plan?.viewBox && plots.some((p) => p.poly);
  const [view, setView] = useState<"plan" | "relief" | "blocks" | "sun">(hasPlan ? "plan" : "blocks");

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
    <div>
      {(hasPlan || hasMetricFigures) && (
        <div className="mb-phi3 flex flex-wrap items-center justify-between gap-phi2">
          {hasPlan ? (
            <Segmented
              label="Layout view"
              value={view}
              onChange={(v) => setView(v as "plan" | "relief" | "blocks" | "sun")}
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
              options={[
                { value: "plan", label: "Approved plan" },
                { value: "relief", label: "3D view" },
                { value: "sun", label: "Sun & shadow" },
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

      {view === "plan" && plan ? (
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
  return (
    <div role="group" aria-label={label} className="flex items-center rounded-full border border-line bg-canvas p-0.5">
      {options.map((o) => {
        const on = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            aria-pressed={on}
            className={`rounded-full px-3.5 py-1.5 text-tiny font-medium transition-colors ${
              on ? "bg-ink text-canvas" : "text-ink-soft hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}
