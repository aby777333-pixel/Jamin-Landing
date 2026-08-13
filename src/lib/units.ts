/**
 * 🚨 THE SANCTIONED DRAWING IS IN METRES. TAMIL NADU BUYS IN FEET.
 *
 * Both of those are true at once, and this file exists so the site can honour
 * the second without falsifying the first.
 *
 * `properties.plot_plan` is traced from the DTCP drawing, so every figure in it
 * — road widths, boundary dimensions, the OSR, the area statement — is in
 * metres, and one of the conditions printed on that drawing literally reads
 * "All dimensions are in metres; areas in square metres." Nobody buying land in
 * Salem or Erode talks in metres: a plot is 2,400 square feet and a road is
 * thirty feet wide. Owner's instruction 2026-08-13.
 *
 * ⚠️ THE CONVERSION IS A DISPLAY LAYER AND NOTHING ELSE. No stored value is
 * rewritten, the metre view is one tap away, and the conditions printed on the
 * plan are never re-worded — they are a quotation from a sanctioned document,
 * and a quotation that has been silently unit-converted is no longer evidence.
 * That is why the reader gets a switch rather than a substitution.
 *
 * ⚠️ Feet are rounded to one decimal and square feet to whole numbers, which is
 * how they are spoken. That rounding is the reason the metre figure has to stay
 * reachable: 9.00 m is exact on the drawing, 29.5 ft is not.
 */

export type Unit = "ft" | "m";

/** The international foot. 0.3048 m exactly, so this is not an approximation. */
export const FEET_PER_METRE = 1 / 0.3048;
export const SQFT_PER_SQM = FEET_PER_METRE * FEET_PER_METRE;

const inIN = (n: number, digits = 0) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: digits, maximumFractionDigits: digits });

/** A length held in metres, printed in the reader's unit. */
export function length(metres: number, unit: Unit): string {
  if (unit === "m") return `${inIN(metres, 2)} m`;
  return `${inIN(metres * FEET_PER_METRE, 1)} ft`;
}

/** An area held in square metres, printed in the reader's unit. */
export function area(sqm: number, unit: Unit): string {
  if (unit === "m") return `${inIN(sqm)} sq m`;
  return `${inIN(Math.round(sqm * SQFT_PER_SQM))} sq ft`;
}

/**
 * ⚠️ REWRITES A LABEL THAT WAS AUTHORED IN METRES, e.g. "9.00 m ROAD" or
 * "EXISTING ROAD — 12.00 m WIDE" or "72.40 m".
 *
 * The traced plan stores its captions as finished strings — some of them carry
 * a matching numeric field (`widthM`), the dimension lines carry none at all —
 * so a caller that only reads the numbers would silently leave half the drawing
 * in metres. Prefer `length()` where a number exists; this is for the rest.
 *
 * ⚠️ `sq m` and `m²` are matched BEFORE the bare-metre rule, or "1,342 sq m"
 * becomes "4,403.5 ft q m". Order is the whole correctness argument here.
 */
export function relabel(label: string, unit: Unit): string {
  if (unit === "m") return label;
  return label
    .replace(/(\d[\d,]*(?:\.\d+)?)\s*(?:sq\s*m\b|m²|sqm\b)/gi, (_, n: string) =>
      area(Number(n.replace(/,/g, "")), "ft"),
    )
    .replace(/(\d[\d,]*(?:\.\d+)?)\s*m\b(?!\w)/gi, (_, n: string) =>
      length(Number(n.replace(/,/g, "")), "ft"),
    );
}

/**
 * 🚨 A PLOT'S DIMENSION PAIR — "12.2 x 17.8", stored bare and in metres.
 *
 * ⚠️ IT NEEDS ITS OWN FUNCTION AND THE REASON IS A BUG THAT SHIPPED FOR ABOUT
 * TEN MINUTES. Running `relabel("12.2 x 17.8 m")` converts only the number the
 * unit is attached to, because that is exactly what the pattern says — the
 * result was "12.2 x 58.4 ft", one side in metres and the other in feet, which
 * is not a rounding error but a wrong plot. Anything that carries more than one
 * figure per unit token has to be split before it is converted.
 *
 * The separator is preserved as written (`x` or `×`) and the unit is printed
 * once, at the end, which is how a plot is spoken: "forty by fifty-eight feet".
 */
export function dimensions(dimM: string, unit: Unit): string {
  const parts = dimM.split(/\s*([x×])\s*/i);
  const converted = parts.map((part) => {
    if (/^[x×]$/i.test(part)) return ` ${part} `;
    const n = Number(part.replace(/,/g, ""));
    if (!Number.isFinite(n)) return part;
    return unit === "m" ? inIN(n, 2) : inIN(n * FEET_PER_METRE, 1);
  });
  return `${converted.join("")} ${unit === "m" ? "m" : "ft"}`;
}

/** For prose: "in feet" / "in metres". */
export function unitWord(unit: Unit): string {
  return unit === "ft" ? "feet" : "metres";
}
