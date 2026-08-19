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
  /* ⚠️ GARNET IS THE WORD, PLATINUM IS STILL THE FILL (do-all round,
     2026-08-19 — menu item 2). `--color-garnet` shipped in the 2026-08-18
     round as "the red foil's deep stop" and then had ZERO call sites; this
     is the one place where spending it changes meaning rather than merely
     adding a colour. Sold and Completed both read platinum today, and they
     are opposite facts — one is finished and handed over, the other is
     closed to you. Garnet measures 8.91:1 on the canvas against plat-800's
     6.14:1, so this is also the more legible of the two. The FILL stays
     platinum: garnet as a band would read as an alarm.

     ⚠️ 8.91:1 is the GEMSTONE garnet (#7a0404). Putting this token to work
     is what turned up a second `--color-garnet` (#8e1c22) declared earlier
     in globals.css and overridden by it — dead since the day it shipped,
     deleted 2026-08-19. If a future round re-adds one, this ratio is the
     thing that quietly changes. */
  sold: { stone: "var(--color-plat-300)", ink: "var(--color-garnet)", label: "Sold", tone: "glass" }, // 7.03:1
};

/**
 * NAVIGATION STONES (§6.1) — "small pieces of jewellery".
 *
 * Each tab carries a dot and an inlay underline in its own stone. The mapping
 * is meaning-led, not decorative: Properties is land (emerald), Projects is
 * stage (sapphire, the same stone Future wears on a card), Locations is
 * district (amethyst), Home is the identity itself (champagne), and the two
 * account-ish tabs are platinum, which §2 assigns to secondary interface.
 *
 * ⚠️ `ink` EXISTS BECAUSE A NAV LABEL IS ~12.5px TEXT. Three stones cannot be
 * read at that size on ivory and are therefore never used as the word: jade
 * measures 3.84:1, topaz 3.63:1 and platinum-500 2.96:1. Journal takes
 * emerald-deep (7.93:1) rather than the jade it would otherwise get, and the
 * platinum tabs take plat-800 (6.14:1). The bright value still paints the dot
 * and the inlay, which carry no ratio.
 */
export const NAV_STONE: Record<string, { stone: string; ink: string }> = {
  "/": { stone: "var(--color-champagne-500)", ink: "var(--color-champagne-700)" }, // 6.20:1
  "/properties": { stone: "var(--color-emerald)", ink: "var(--color-emerald)" }, // 5.20:1
  "/projects": { stone: "var(--color-sapphire)", ink: "var(--color-sapphire)" }, // 9.68:1
  "/locations": { stone: "var(--color-amethyst)", ink: "var(--color-amethyst)" }, // 7.20:1
  "/journal": { stone: "var(--color-jade)", ink: "var(--color-emerald-deep)" }, // 7.93:1
  /* ⚠️ Champagne, and the reasoning here is the opposite of every other row.
     Onyx was tried first — §2 pairs the Vault with onyx and gold, and on a
     light page onyx ink measures 14.8:1. But this tab's ACTIVE state only ever
     renders on /vault, and /vault is the one route that flips the whole
     interface to onyx. Onyx ink on an onyx ground measured 1.09:1: the label
     for the page you are standing on was the one label you could not read.

     So the ink is tuned for the ground it will actually appear on, not for the
     ground the rest of this table assumes. champagne-300 measures 12.3:1 on
     onyx-800. Home also carries champagne, and that is not a collision — its
     ink is champagne-700 for a light page, and the two are never active at
     once. */
  "/vault": { stone: "var(--color-champagne-500)", ink: "var(--color-champagne-300)" }, // 12.3:1 on onyx
  "/about": { stone: "var(--color-plat-500)", ink: "var(--color-plat-800)" }, // 6.14:1
  "/account": { stone: "var(--color-plat-500)", ink: "var(--color-plat-800)" }, // 6.14:1
};

export function navStone(href: string): { stone: string; ink: string } {
  return NAV_STONE[href] ?? { stone: STONE_FALLBACK, ink: "var(--color-champagne-700)" };
}

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * PANE HUES (§6.1b) — the colour a whole ROUTE wears on its content blocks.
 *
 * Owner, 2026-08-19: "in the whole site, the beige is prominent… why can't we
 * add related glassy pungent colors to page blocks". He is describing a real
 * property of the design: the sand ground is a strong warm, and it was the only
 * large surface on every page, so 31 routes read as one field.
 *
 * ⚠️ THIS IS NOT A SECOND PALETTE. Every value below is a stone this file
 * already owns; what changes is where it is spent — from a dot and an inlay
 * (NAV_STONE, ~40px of jewellery per page) to the page's blocks. A route's pane
 * hue and its nav stone are the SAME colour wherever both exist, so the tab you
 * came in on and the blocks you land among agree.
 *
 * ⚠️ FOUR ROUTES DELIBERATELY DIVERGE FROM NAV_STONE, on the owner's call the
 * same day. Home and /ta wore champagne and About wore platinum, and at pane
 * strength those are still beige — which is the exact complaint. They take
 * vermilion and canopy instead. `/account` KEEPS platinum on purpose: it is the
 * one signed-in surface and §2 assigns platinum to secondary interface, so a
 * quiet page there is the design working, not the design failing. `/vault`
 * keeps champagne because that route flips the whole interface to onyx and its
 * panes sit on a dark ground where champagne is the correct metal.
 *
 * ⚠️ MEANING-LED, LIKE NAV_STONE. Land is emerald, stage is sapphire, district
 * is amethyst, writing is jade, the desk and the action are the signal reds,
 * paperwork is the bronze family, and the checklist that gets walked on site
 * takes the deep canopy.
 * ═══════════════════════════════════════════════════════════════════════════
 */
export const PANE_HUE: Record<string, string> = {
  "/": "var(--color-vermilion)",
  "/ta": "var(--color-vermilion)",
  "/properties": "var(--color-emerald)",
  "/projects": "var(--color-sapphire)",
  "/locations": "var(--color-amethyst)",
  "/journal": "var(--color-jade)",
  "/about": "var(--color-canopy)",
  "/account": "var(--color-plat-500)",
  "/vault": "var(--color-champagne-500)",
  "/compare": "var(--color-topaz)",
  "/contact": "var(--color-jamin-red)",
  "/downloads": "var(--color-champagne-500)",
  "/faq": "var(--color-jade)",
  "/gazetteer": "var(--color-amethyst)",
  "/tools": "var(--color-ruby)",
  "/visit-checklist": "var(--color-emerald-deep)",
};

/** The hue for a route, falling back to the identity metal. */
export function paneHue(route: string): string {
  return PANE_HUE[route] ?? "var(--color-champagne-500)";
}

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
