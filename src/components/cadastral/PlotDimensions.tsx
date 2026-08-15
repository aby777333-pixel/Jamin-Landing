import type { Plot } from "@/lib/properties";

/**
 * Survey dimension lines on a selected plot: extension lines, arrowheads and
 * the sanctioned figure, drawn in the plan's own coordinate space.
 *
 * `dim_m` has always been in the data and has only ever been PRINTED, as a row
 * in the detail sheet reading "Dimensions 12.2 x 18.3". On a drawing that is
 * the one fact that belongs on the drawing.
 *
 * 🚨 THE FIGURES ARE LABELLED, NOT MEASURED, AND THAT IS DELIBERATE. Edappadi's
 * plot 1 spans 28.49 x 39.10 viewBox units against a recorded 12.2 x 18.3 m —
 * ratios of 2.335 and 2.137, which do not agree. The traced sheet is therefore
 * NOT uniformly scaled to metres, so deriving a length from the polygon would
 * produce a number that looks surveyed and is invented. The drawing shows the
 * shape; the label states what was sanctioned. Those are two different claims
 * and only one of them is ours to make.
 *
 * ⚠️ THE TWO FIGURES ARE MATCHED TO THE TWO EXTENTS BY SIZE, NOT BY ORDER.
 * "12.2 x 18.3" is conventionally width x depth, but nothing enforces that in
 * the data and a transposed pair would print a plot's frontage on its flank —
 * a specific, checkable, wrong statement about a plot somebody may buy. Sorting
 * both pairs removes the assumption: the smaller figure goes on the shorter
 * side whichever way round the string was written.
 *
 * ⚠️ Non-rectangular and clipped plots get NOTHING. A single width and depth
 * describe a rectangle; hung on an L-shaped or road-clipped boundary they would
 * be describing a plot that is not the one drawn.
 */
export function PlotDimensions({ plot, unitsPerPx }: { plot: Plot; unitsPerPx: number }) {
  const poly = plot.poly;
  if (!poly || poly.length !== 4 || plot.clipped || !plot.dim_m) return null;

  const xs = poly.map((p) => p[0]);
  const ys = poly.map((p) => p[1]);
  const x0 = Math.min(...xs);
  const x1 = Math.max(...xs);
  const y0 = Math.min(...ys);
  const y1 = Math.max(...ys);
  const w = x1 - x0;
  const h = y1 - y0;

  /* A four-point polygon that is not axis-aligned is a quadrilateral, not a
     rectangle, and its bounding box is not its shape. */
  const axisAligned =
    new Set(xs.map((v) => v.toFixed(2))).size === 2 &&
    new Set(ys.map((v) => v.toFixed(2))).size === 2;
  if (!axisAligned || w <= 0 || h <= 0) return null;

  const figures = plot.dim_m
    .split(/[x×]/i)
    .map((s) => parseFloat(s.trim()))
    .filter((n) => Number.isFinite(n) && n > 0);
  if (figures.length !== 2) return null;

  const [small, large] = [...figures].sort((a, b) => a - b);
  const alongX = w <= h ? small : large;
  const alongY = w <= h ? large : small;

  /* Everything is sized in viewBox units off the caller's scale so the strokes
     and the type stay optically constant however the sheet is zoomed. A plan
     whose ticks thicken as it scales stops reading as a drawing. */
  const u = unitsPerPx;
  const gap = 4 * u;
  const tick = 2.5 * u;
  const stroke = 0.9 * u;
  const font = 8 * u;

  const dimY = y1 + gap;
  const dimX = x1 + gap;

  return (
    <g className="text-ink" pointerEvents="none" aria-hidden="true">
      {/* Extension lines: they leave a small gap at the boundary so the
          dimension does not appear welded to the plot edge — the convention
          that keeps a dimension readable as an annotation ABOUT the shape. */}
      <path
        d={`M${x0} ${y1 + gap * 0.25} V${dimY + tick * 0.6}
            M${x1} ${y1 + gap * 0.25} V${dimY + tick * 0.6}
            M${x1 + gap * 0.25} ${y0} H${dimX + tick * 0.6}
            M${x1 + gap * 0.25} ${y1} H${dimX + tick * 0.6}`}
        stroke="currentColor"
        strokeWidth={stroke * 0.7}
        fill="none"
        opacity="0.55"
      />
      {/* The dimension lines themselves, with the surveyor's oblique ticks
          rather than arrowheads: at this scale a filled head closes up into a
          blob, where a 45° tick stays legible. */}
      <path
        d={`M${x0} ${dimY} H${x1}
            M${x0 - tick * 0.4} ${dimY + tick * 0.4} L${x0 + tick * 0.4} ${dimY - tick * 0.4}
            M${x1 - tick * 0.4} ${dimY + tick * 0.4} L${x1 + tick * 0.4} ${dimY - tick * 0.4}
            M${dimX} ${y0} V${y1}
            M${dimX - tick * 0.4} ${y0 - tick * 0.4} L${dimX + tick * 0.4} ${y0 + tick * 0.4}
            M${dimX - tick * 0.4} ${y1 - tick * 0.4} L${dimX + tick * 0.4} ${y1 + tick * 0.4}`}
        stroke="currentColor"
        strokeWidth={stroke}
        fill="none"
        strokeLinecap="round"
      />
      {/* ⚠️ `fill="currentColor"`, never `var(--token)` — a presentation
          attribute is not a CSS declaration and the glyphs would render black.
          The vertical figure is rotated about its own anchor so it reads up the
          page, as it does on a sheet. */}
      <text
        x={(x0 + x1) / 2}
        y={dimY + font * 0.95}
        textAnchor="middle"
        fontSize={font}
        fill="currentColor"
        className="ledger"
      >
        {`${alongX}\u00a0m`}
      </text>
      <text
        x={dimX + font * 0.95}
        y={(y0 + y1) / 2}
        textAnchor="middle"
        fontSize={font}
        fill="currentColor"
        className="ledger"
        transform={`rotate(-90 ${dimX + font * 0.95} ${(y0 + y1) / 2})`}
      >
        {`${alongY}\u00a0m`}
      </text>
    </g>
  );
}
