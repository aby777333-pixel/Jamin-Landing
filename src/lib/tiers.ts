import type { Property } from "./properties";

/**
 * THE JAMIN TIERS (§6.4) — aesthetic with a business purpose.
 *
 * ⚠️ NO SCHEMA CHANGE, and no new column to maintain. Everything below is
 * derived from fields the admin console already fills in, so a tier can never
 * disagree with the record — and nobody has to remember to set it.
 *
 * ⚠️ THE BRIEF KEYS THIS ON A PRICE BAND. There are no prices: `price` is NULL
 * on every property in the database, and every plot inside every layout is
 * unpriced too. A price band would therefore have put all four developments in
 * one tier. The ladder below uses what the records actually carry — the DTCP
 * credential, whether the sanctioned layout has been traced, extent, and scale.
 *
 * The rungs are meaning, not a distribution. They are written so that a tier
 * says something true about the record rather than to make today's four
 * properties land one per tier — which, as it happens, is what they do.
 */

export type TierKey = "select" | "signature" | "royal" | "crown";

export type Tier = {
  key: TierKey;
  /** What the ribbon prints. */
  label: string;
  /** Ascending, for sorting and comparisons. */
  rank: number;
};

export const TIERS: Record<TierKey, Tier> = {
  select: { key: "select", label: "Jamin Select", rank: 1 },
  signature: { key: "signature", label: "Jamin Signature", rank: 2 },
  royal: { key: "royal", label: "Jamin Royal", rank: 3 },
  crown: { key: "crown", label: "Jamin Crown Collection", rank: 4 },
};

/**
 * Extent in acres, whatever unit the record happens to use.
 *
 * ⚠️ THIS FUNCTION IS THE WHOLE REASON THE LADDER IS NOT NONSENSE. The four
 * live properties are stored in three different units — 400 `cents`, 4 `acres`
 * and 26,727 `sqft` — so comparing `area_value` directly ranks them in almost
 * exactly the wrong order: it would read 26,727 as the largest and 4 as the
 * smallest, when in fact the 4-acre and the 400-cent sites are the same size
 * and the 26,727 sq ft one is a sixth of them.
 */
const ACRE_IN_SQFT = 43_560;
const TO_SQFT: Record<string, number> = {
  acre: ACRE_IN_SQFT,
  acres: ACRE_IN_SQFT,
  /** A cent is one hundredth of an acre. */
  cent: ACRE_IN_SQFT / 100,
  cents: ACRE_IN_SQFT / 100,
  ground: 2_400,
  grounds: 2_400,
  sqft: 1,
  sq_ft: 1,
  "sq ft": 1,
  sqyd: 9,
  "sq yd": 9,
};

export function extentAcres(p: Property): number | null {
  if (p.area_value == null) return null;
  const value = Number(p.area_value);
  if (!Number.isFinite(value) || value <= 0) return null;
  const unit = (p.area_unit ?? "sqft").trim().toLowerCase();
  const factor = TO_SQFT[unit];
  /* An unrecognised unit returns null rather than guessing. A wrong extent
     would silently promote or demote a development, and no tier is worth a
     made-up number. */
  if (!factor) return null;
  return (value * factor) / ACRE_IN_SQFT;
}

const isDtcp = (p: Property) => p.approvals?.dtcp === true;

/** The survey number is printed on the sanctioned plan, so publishing it is
 *  what lets a buyer check the record against the DTCP file themselves. On this
 *  site that is the paperwork signal, not a decorative one. */
const isCheckable = (p: Property) => Boolean(p.survey_number?.trim());
const hasPlan = (p: Property) => Boolean(p.master_plan_url?.trim());

/**
 * The single entry point. Everything downstream reads this and nothing
 * downstream re-derives it.
 *
 * ⚠️ EVERY FIELD USED HERE IS IN THE LIST QUERY, and that constraint shaped the
 * ladder. The first version keyed Crown on `plot_plan` — the traced polygons —
 * which is the strongest signal in the data and is deliberately NOT selected
 * for listings, because Edappadi's 27 polygons are kilobytes that the homepage,
 * /properties, /projects and the sitemap would all pay for and none would
 * render. Using it would have meant no card ever showed Crown or Royal, and
 * worse, a card and its own detail page disagreeing about the tier. A tier that
 * changes when you click into it is not a tier.
 */
export function getTier(p: Property): Tier {
  const acres = extentAcres(p);

  /* Crown — the approval, the drawing, a checkable survey number, and the
     scale for all of it to matter. The most complete record Jamin publishes. */
  if (isDtcp(p) && hasPlan(p) && isCheckable(p) && (acres ?? 0) >= 3) return TIERS.crown;

  /* Royal — approved, and the paperwork published so a buyer can verify it. */
  if (isDtcp(p) && isCheckable(p)) return TIERS.royal;

  /* Signature — a substantial development whose approval is not published
     here. Scale alone, by either measure. */
  if ((acres ?? 0) >= 2 || (p.plots_total ?? 0) >= 20) return TIERS.signature;

  /* Select — the base, and the default. Never a demotion: a small or early
     development is still a Jamin development. */
  return TIERS.select;
}
