"use client";

import { useState } from "react";
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
export function LayoutViews({
  plots,
  plan,
  title,
}: {
  plots: Plot[];
  /** Absent when the drawing was never traced — then there is only one view. */
  plan?: PlotPlan | null;
  title: string;
}) {
  const hasPlan = !!plan?.viewBox && plots.some((p) => p.poly);
  const [view, setView] = useState<"plan" | "blocks">(hasPlan ? "plan" : "blocks");

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
              onChange={(v) => setView(v as "plan" | "blocks")}
              options={[
                { value: "plan", label: "Plan" },
                { value: "blocks", label: "Blocks" },
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
