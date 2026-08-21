import type { Plot } from "@/lib/properties";
import { dimensions as fmtDims, length as fmtLength, type Unit } from "@/lib/units";

/**
 * THE PLOT RECORD — one list of facts, read by every surface that shows a plot.
 *
 * Owner, 2026-08-21: "in plot list and blocks, when a client clicks a plot,
 * there should be a table — for example, what is the square feet, facing where,
 * what all info u can pull from the sheet."
 *
 * 🚨 IT LIVES HERE BECAUSE IT WAS BUILT TWICE AND THE TWO HAD DRIFTED. The
 * traced plan's plot sheet listed seven rows; the Plot list's card listed five,
 * silently dropping the SANCTIONED metre area — the one figure on the record
 * that is the drawing's own number rather than this site's arithmetic. A reader
 * who chose the grid was getting a quieter record than a reader who chose the
 * drawing, which is exactly what LayoutViews' own header promises will never
 * happen. One builder, two callers, no drift.
 *
 * ⚠️ NOTHING HERE IS COMPUTED OR ESTIMATED. Every row is a field the approved
 * schedule carries; a plot with no facing recorded shows no Facing row rather
 * than an inferred one. `size_sqft` leads because it is STORED — it is what the
 * sanctioned schedule itself states — and `size_sqm` follows as the drawing's
 * own value, which is why both appear even though one converts into the other.
 * The units switch converts `dim_m` and `road_m`; it never touches the areas.
 *
 * ⚠️ `price` is deliberately absent. The standing rule on this site is that a
 * rate is confirmed by the desk and never published as an estimate, and a
 * per-plot price inside a record table would read as a quotation.
 */
export function plotRecordRows(plot: Plot, unit: Unit): [string, string][] {
  const rows: [string, string][] = [["Plot number", plot.plot]];
  if (plot.block) rows.push(["Block", plot.block]);

  /* ⚠️ THE NON-BREAKING SPACE IS WRITTEN AS AN ESCAPE, never as the literal
     character — there are zero literal NBSPs in `src` and the standing rule
     keeps it that way, because an invisible character is an unreviewable one.
     A figure must never break away from its unit across a line. */
  if (plot.size_sqft != null)
    rows.push(["Area", `${Math.round(plot.size_sqft).toLocaleString("en-IN")}\u00a0sq\u00a0ft`]);

  /* ⚠️ THE METRE ROW RENAMES ITSELF WHEN IT IS THE ONLY AREA THERE IS. Both are
     pushed on a traced project — the stored sq ft and the drawing's own metre
     figure, which is the point of showing two. On a project recorded only in
     metres, "Area (sanctioned)" beside no plain Area would read as a missing
     row rather than as the whole answer. */
  if (plot.size_sqm != null)
    rows.push([
      plot.size_sqft != null ? "Area (sanctioned)" : "Area",
      `${plot.size_sqm}\u00a0m²`,
    ]);

  if (plot.dim_m) rows.push(["Dimensions", fmtDims(plot.dim_m, unit)]);
  if (plot.facing) rows.push(["Facing", plot.facing]);
  if (plot.road_m != null) rows.push(["Road width", fmtLength(plot.road_m, unit)]);
  return rows;
}
