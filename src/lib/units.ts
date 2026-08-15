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

/**
 * A NON-BREAKING SPACE, and every measurement on this site goes through it.
 *
 * "500 m", "27 plots", "12.2 x 18.3 m" were all free to break across a line,
 * which puts the number at the end of one line and its unit at the start of the
 * next. On a page of prose that is untidy; on a page whose subject is
 * dimensions it is a misreading waiting to happen, because a stranded "m" reads
 * as the start of the next sentence.
 *
 * ⚠️ U+00A0, not `&nbsp;` — these strings are also handed to `Intl`, written
 * into `alt` text and compared in tests, and an HTML entity would survive into
 * all three as literal characters.
 *
 * ⚠️ NOT a thin space, and not as a thousands separator either. The ISO
 * convention is a thin space between groups; this site prints `en-IN`, where a
 * plot is "2,403 sq ft" in the lakh grouping every Indian reader expects.
 * Grouping is already handled by `inIN` above — the separator is not the
 * problem this fixes.
 */
const NB = "\u00a0";

/** A length held in metres, printed in the reader's unit. */
export function length(metres: number, unit: Unit): string {
  if (unit === "m") return `${inIN(metres, 2)}${NB}m`;
  return `${inIN(metres * FEET_PER_METRE, 1)}${NB}ft`;
}

/** An area held in square metres, printed in the reader's unit. */
export function area(sqm: number, unit: Unit): string {
  /* The unit itself is two words, so BOTH gaps are non-breaking — otherwise
     "1,342 sq
m" simply moves the problem one word along. */
  if (unit === "m") return `${inIN(sqm)}${NB}sq${NB}m`;
  return `${inIN(Math.round(sqm * SQFT_PER_SQM))}${NB}sq${NB}ft`;
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
    /* ⚠️ ALWAYS the multiplication sign, whatever the data held. `dim_m` is
       authored as "12.2 x 18.3" with a lowercase letter x — a stand-in nobody
       intended to be read as a letter, and it is now set beside real figures on
       a drawing. Hair spaces either side: a full space around × makes the pair
       read as two separate numbers. */
    if (/^[x×]$/i.test(part)) return "\u200a\u00d7\u200a";
    const n = Number(part.replace(/,/g, ""));
    if (!Number.isFinite(n)) return part;
    return unit === "m" ? inIN(n, 2) : inIN(n * FEET_PER_METRE, 1);
  });
  return `${converted.join("")}${NB}${unit === "m" ? "m" : "ft"}`;
}

/** For prose: "in feet" / "in metres". */
export function unitWord(unit: Unit): string {
  return unit === "ft" ? "feet" : "metres";
}
