import type { Property } from "./properties";

/**
 * THE GEMSTONE IDENTITY SYSTEM — tier 4 of the material hierarchy.
 *
 * Every value here is a `var()` reference rather than a hex, so the tokens in
 * globals.css stay the single source of truth and nothing in this file has to
 * be re-audited when a stone is retuned.
 *
 * ⚠️ A STONE MAY NEVER BE THE ONLY CARRIER OF MEANING. §2's tier-5 rule says
 * light must not communicate; the same applies one tier up here, for a reason
 * specific to this site's data. There are four districts and exactly one
 * property in each, so a colour keyed to district is currently indistinguishable
 * from a colour keyed to the individual card — it reads as decoration, not as a
 * taxonomy. Every surface that carries a stone must also carry the word.
 */

/** The four districts that actually hold inventory (§5a). */
export const DISTRICT_STONE: Record<string, string> = {
  Coimbatore: "var(--color-emerald)",
  Erode: "var(--color-ruby)",
  Salem: "var(--color-sapphire)",
  Tiruppur: "var(--color-amethyst)",
};

/**
 * Stage and status (§5b).
 *
 * `tone` is what the stone is allowed to do on a light ground: `solid` states
 * get a hairline and coloured text, `glass` states get a low-alpha fill. Kept
 * as data rather than as class names so a chip, a band and a map polygon can
 * each render it in their own idiom without three copies of the mapping.
 */
export type StageKey = "ongoing" | "future" | "completed" | "available" | "reserved" | "booked" | "sold";

/**
 * ⚠️ `stone` IS THE FILL. `ink` IS THE WORD. They are the same value only where
 * the stone happens to survive being read at 10px on ivory, and two of them do
 * not: platinum-500 measures 2.96:1 and champagne-500 measures 2.36:1 against
 * the canvas. Both are correct as a hairline or a band and both are illegible
 * as a label, which is the distinction globals.css already draws between the
 * fill gold and gold-ink. Measured values are in the comment on each row.
 */
export const STAGE_STONE: Record<
  StageKey,
  { stone: string; ink: string; label: string; tone: "solid" | "glass" }
> = {
  ongoing: { stone: "var(--color-emerald)", ink: "var(--color-emerald)", label: "Ongoing", tone: "solid" }, // 5.20:1
  future: { stone: "var(--color-sapphire)", ink: "var(--color-sapphire)", label: "Future", tone: "solid" }, // 9.68:1
  /* The handed-over object is the finished object — platinum, not a gemstone. */
  completed: { stone: "var(--color-plat-500)", ink: "var(--color-plat-800)", label: "Completed", tone: "solid" }, // 6.14:1
  available: { stone: "var(--color-emerald)", ink: "var(--color-emerald)", label: "Available", tone: "glass" }, // 5.20:1
  reserved: { stone: "var(--color-champagne-500)", ink: "var(--color-champagne-700)", label: "Reserved", tone: "glass" }, // 6.20:1
  booked: { stone: "var(--color-ruby)", ink: "var(--color-ruby)", label: "Booked", tone: "glass" }, // 7.89:1
  sold: { stone: "var(--color-plat-300)", ink: "var(--color-plat-800)", label: "Sold", tone: "glass" }, // 6.14:1
};

/**
 * FORWARD MAP — the marketplace taxonomy (§5c).
 *
 * ⚠️ Constants only, wired to nothing. Every property in the database is
 * `residential_plot`, so not one of these categories has a row behind it today.
 * They live here so the marketplace side inherits the identity system with no
 * rework, and so nobody invents a second mapping when it arrives.
 */
export const PORTAL_STONE: Record<string, string> = {
  buy: "var(--color-emerald)",
  sell: "var(--color-champagne-500)",
  plots: "var(--color-jade)",
  apartments: "var(--color-sapphire)",
  villas: "var(--color-garnet)",
  commercial: "var(--color-plat-500)",
  farmland: "var(--color-emerald-deep)",
  luxury: "var(--color-onyx-900)",
  new_launches: "var(--color-amethyst)",
  verified: "var(--color-emerald)",
};

/** Champagne is the fallback, not a grey: an unmapped district still belongs to
 *  Jamin, and the identity colour is the honest thing to show when the
 *  categorical one is unknown. */
export const STONE_FALLBACK = "var(--color-champagne-500)";

export function districtStone(p: Property): string {
  const d = (p.district ?? p.city ?? "").trim();
  return DISTRICT_STONE[d] ?? STONE_FALLBACK;
}

/** The word that must accompany the stone. Falls back to the city so the band
 *  is never unlabelled — an anonymous colour is the failure mode this system
 *  is written to avoid. */
export function districtName(p: Property): string | null {
  const d = (p.district ?? p.city ?? "").trim();
  return d || null;
}

export function stageStone(
  p: Property,
): { stone: string; ink: string; label: string; tone: "solid" | "glass" } | null {
  const phase = (p.project_phase ?? "").toLowerCase();
  if (phase in STAGE_STONE) return STAGE_STONE[phase as StageKey];
  const status = (p.status ?? "").toLowerCase();
  if (status in STAGE_STONE) return STAGE_STONE[status as StageKey];
  return null;
}
