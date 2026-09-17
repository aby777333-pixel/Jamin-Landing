"use client";

import { useRef, useState } from "react";
import { length as fmtLength, type Unit } from "@/lib/units";

/**
 * The measuring tool: drag across the plan, get the distance.
 *
 * 🚨 THE DRAWING IS NOT ACCURATE TO THE METRE AND THIS TOOL MUST NOT PRETEND IT
 * IS. `plot_plan.metresPerUnit` is 0.547243 for Edappadi. Checked against the
 * three dimensions the sanctioned drawing labels itself:
 *
 *     labelled     from the traced geometry     error
 *      72.40 m            73.45 m              +1.4%
 *     118.60 m           116.14 m              -2.1%
 *     246.15 m           238.45 m              -3.1%
 *
 * No single scale fits all three — the ratios implied by the labels are
 * 0.5394, 0.5588 and 0.5649 — so the inconsistency is in the TRACING, not in
 * the constant, and no better constant exists to switch to. On a page about
 * land, 3% of 100 m is three metres, which is a plot boundary's worth.
 *
 * Three things follow, and all three are the design:
 *   1. The readout is prefixed "≈" and captioned with where the number comes
 *      from. A bare "73.4 m" would be a survey claim.
 *   2. It is ROUNDED HARD — `lib/units.ts` already rounds feet to one decimal
 *      and metres to two, which is finer than this drawing supports, so the
 *      value is rounded to whole units first. Printing 73.45 m from a source
 *      that is ±3% is false precision, and false precision is how a reader
 *      comes to trust a number they should not.
 *   3. A plot's own `dim_m` is ALWAYS the better answer where one exists, and
 *      the caption says so — that figure is sanctioned, this one is scaled off
 *      a tracing.
 *
 * ⚠️ It renders nothing at all without `metresPerUnit`. A plan with no recorded
 * scale cannot be measured, and a pixel distance is not a distance.
 *
 * ⚠️ Pointer coordinates go through `getScreenCTM().inverse()`, never through
 * `getBoundingClientRect` arithmetic. The plan has four zoom steps and lives
 * inside a scrolling frame; the CTM is the only thing that accounts for both
 * without re-deriving the transform by hand.
 */
export function PlanMeasure({
  metresPerUnit,
  unit,
  scale,
  glyphScale = 1,
  source = "traced drawing",
}: {
  metresPerUnit?: number;
  unit: Unit;
  /** The drawing's stated scale, e.g. "1:1000" — shown so the reader can see
   *  what the figure was derived from. */
  scale?: string;
  /** Multiplies the marker radius, readout size and offset. 1 on the traced
   *  plans (their viewBox is already near screen size); the image-backed plan
   *  passes the inverse of its zoom so the readout stays a constant ~11px on a
   *  3,545-pixel-wide drawing. Geometry is unaffected — only glyph sizes. */
  glyphScale?: number;
  /** What the distance is scaled from, for the screen-reader caption. */
  source?: string;
}) {
  const ref = useRef<SVGRectElement>(null);
  const [from, setFrom] = useState<{ x: number; y: number } | null>(null);
  const [to, setTo] = useState<{ x: number; y: number } | null>(null);
  const [dragging, setDragging] = useState(false);

  if (!metresPerUnit || !Number.isFinite(metresPerUnit) || metresPerUnit <= 0) return null;

  const at = (e: React.PointerEvent) => {
    const svg = ref.current?.ownerSVGElement;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: pt.x, y: pt.y };
  };

  const down = (e: React.PointerEvent) => {
    const p = at(e);
    if (!p) return;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    setFrom(p);
    setTo(p);
    setDragging(true);
  };
  const move = (e: React.PointerEvent) => {
    if (!dragging) return;
    const p = at(e);
    if (p) setTo(p);
  };
  const up = () => setDragging(false);

  const units = from && to ? Math.hypot(to.x - from.x, to.y - from.y) : 0;
  const metres = units * metresPerUnit;
  /* Rounded to whole metres before formatting. See the note above: the source
     does not support the decimals `fmtLength` would otherwise print. */
  const shown = fmtLength(Math.round(metres), unit);

  return (
    <>
      {/* The capture surface. `fill="transparent"` rather than `none` — a `none`
          fill takes no pointer events at all, which is the classic reason an
          SVG overlay silently does nothing. */}
      <rect
        ref={ref}
        x="-100000"
        y="-100000"
        width="200000"
        height="200000"
        fill="transparent"
        className="rj-crosshair"
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
      />
      {from && to && units > 0 && (
        <g pointerEvents="none" className="text-ink">
          {/* The line, with the same oblique ticks the dimension annotations
              use, so the two read as one instrument. */}
          <line
            x1={from.x}
            y1={from.y}
            x2={to.x}
            y2={to.y}
            stroke="currentColor"
            strokeWidth="1.2"
            strokeDasharray="4 2"
            vectorEffect="non-scaling-stroke"
          />
          {[from, to].map((p, i) => (
            <circle
              key={i}
              cx={p.x}
              cy={p.y}
              r={2.5 * glyphScale}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.2"
              vectorEffect="non-scaling-stroke"
            />
          ))}
          {/* The readout rides the midpoint. `paintOrder` puts the halo stroke
              under the glyphs so the figure stays legible over hatching. */}
          <text
            x={(from.x + to.x) / 2}
            y={(from.y + to.y) / 2 - 6 * glyphScale}
            textAnchor="middle"
            fontSize={11 * glyphScale}
            className="ledger"
            fill="currentColor"
            stroke="var(--color-canvas)"
            strokeWidth={3 * glyphScale}
            paintOrder="stroke"
          >
            {`≈ ${shown}`}
          </text>
        </g>
      )}
      {/* ⚠️ The caption is not optional and not `aria-hidden`. It is the
          difference between a measurement and a claim, and it has to reach a
          screen reader too. `foreignObject` so it can be real text that wraps,
          rather than an SVG <text> that would run off the sheet. */}
      {from && to && units > 0 && (
        <foreignObject x={0} y={0} width="1" height="1" aria-hidden="true" />
      )}
      <desc>
        {scale
          ? `Distances are scaled from the ${source} at ${scale} and are approximate.`
          : `Distances are scaled from the ${source} and are approximate.`}
      </desc>
    </>
  );
}
