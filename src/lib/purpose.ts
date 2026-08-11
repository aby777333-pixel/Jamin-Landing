import { isSellable, type Property } from "./properties";

/**
 * FEATURE 1 — EXPLORE BY PURPOSE.
 *
 * Four ways in, chosen from what a visitor actually came to do rather than from
 * how the database happens to classify a row. The brief asks for Build a Home,
 * Investment, Farm and Commercial.
 *
 * ⚠️ THE COUNTS ARE REAL AND TWO OF THEM ARE ZERO TODAY. Every property in the
 * database is `residential_plot` — checked, not assumed. So Farm and Commercial
 * match nothing, and the honest thing is to say so rather than to hand a
 * visitor a filter that returns an empty page. That is the standing rule this
 * site already follows in two places: `getNavFacets` drops a phase with nothing
 * in it, and the Vault's collections say "Not open" and route to the desk. A
 * purpose with no inventory does the same here.
 *
 * ⚠️ "INVESTMENT" IS A STAGE, NOT A TYPE, and that is the one interpretation in
 * this file worth arguing with. There is no column that says a plot is for
 * investment — every plot is, in the sense that it appreciates. What genuinely
 * separates the two intentions is WHEN: land you can build on now is `ongoing`,
 * and land bought to hold is `future` or `current`, which is what the site
 * already tells people on /projects/future ("Land secured and planning under
 * way. Registered interest is served first."). So Investment filters by phase
 * and the card says exactly that, rather than implying a category that does not
 * exist. If a real `investment` flag is ever added, move this to it.
 */

export type PurposeKey = "home" | "investment" | "farm" | "commercial";

export type Purpose = {
  key: PurposeKey;
  label: string;
  /** What the filter genuinely does — shown on the card, so the visitor is
   *  never guessing what they clicked. */
  note: string;
  /** The `SurveyIcon` name, drawn rather than typed. */
  icon: string;
  matches: (p: Property) => boolean;
};

/** Type groups. Kept as arrays rather than a single string test so a new
 *  `property_type` in the admin console joins a purpose by being listed here,
 *  and never by accident. */
const HOME_TYPES = ["residential_plot", "villa_plot", "house", "apartment"];
const FARM_TYPES = ["farm_land", "agricultural_land", "farm_plot"];
const COMMERCIAL_TYPES = ["commercial_land", "industrial_land", "commercial_plot"];

const typeIs = (p: Property, list: string[]) =>
  list.includes((p.property_type ?? "").trim().toLowerCase());

export const PURPOSES: Purpose[] = [
  {
    key: "home",
    label: "Build a Home",
    note: "Residential plots in layouts that are formed and selling now.",
    icon: "home",
    matches: (p) => isSellable(p) && typeIs(p, HOME_TYPES),
  },
  {
    key: "investment",
    label: "Investment",
    note: "Approved land at an earlier stage, bought to hold rather than to build on.",
    icon: "growth",
    matches: (p) =>
      isSellable(p) && (p.project_phase === "future" || p.project_phase === "current"),
  },
  {
    key: "farm",
    label: "Farm",
    note: "Agricultural and farmland parcels.",
    icon: "leaf",
    matches: (p) => isSellable(p) && typeIs(p, FARM_TYPES),
  },
  {
    key: "commercial",
    label: "Commercial",
    note: "Commercial and industrial land.",
    icon: "building",
    matches: (p) => isSellable(p) && typeIs(p, COMMERCIAL_TYPES),
  },
];

export function purposeByKey(key: string | null | undefined): Purpose | null {
  return PURPOSES.find((p) => p.key === key) ?? null;
}

/** Counted from the real records, never asserted. */
export function countPurposes(all: Property[]): { purpose: Purpose; count: number }[] {
  return PURPOSES.map((purpose) => ({ purpose, count: all.filter(purpose.matches).length }));
}
