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
export type StageKey = "ongoing" | "current" | "future" | "completed" | "available" | "reserved" | "booked" | "sold";

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
  /* ⚠️ `current` IS THE PHASE THE BUYER READS AS "UPCOMING" — the slug and
     the word differ, which is why PHASE_META in site.ts spells it out. It
     had no stone at all until Trichy's Tulip became the first development
     to sit in it, so the shelf fell through to the champagne fallback and
     wore Reserved's colour. Amethyst measures 5.78:1 on `--color-canvas`
     (#f0e1d6), between emerald's 6.09 and sapphire's 7.78 as measured on
     the same ground — legible as a word, which is the test that matters
     here, and the one gemstone not already spent on another state. */
  current: { stone: "var(--color-amethyst)", ink: "var(--color-amethyst)", label: "Upcoming", tone: "solid" }, // 5.78:1
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
  /* ⚠️ GARNET, AND IT IS THE FIRST ROUTE TO SPEND IT. The note on `sold` above
     records that this token shipped with zero call sites and was nearly a dead
     colour; the security page is the second place where spending it changes
     meaning rather than adding a shade. Every stone left unspent was wrong for
     a different reason — sapphire, amethyst and emerald-deep are Projects,
     Locations and the site-visit checklist, and platinum is what §2 assigns to
     a deliberately QUIET surface, which this page is not. Garnet is the brand
     red at its deepest and it is the colour of every frame the page carries.
     8.91:1 on the canvas, the most legible red in the file.

     ⚠️ NO DESKTOP TAB WEARS THIS YET. `/security` is reached from the footer
     and the phone menu — see the note in the page — so this row currently
     serves only `stoneVar` on the mobile link. It is written now rather than
     later so that the day the tab appears, its jewellery is already correct. */
  "/security": { stone: "var(--color-garnet)", ink: "var(--color-garnet)" }, // 8.91:1
  /* ⚠️ THE STONE AND THE INK ARE DIFFERENT HERE, and gilt-700 is the reason:
     it is the brass this site spends on opportunity and earning, and it is the
     right FILL for a careers tab — but it measures 4.20:1 on the canvas, under
     the 4.5 this file sets for a word. So the label takes champagne-700
     (5.60:1), exactly as Journal takes emerald-deep rather than the jade its
     dot wears. Home also carries champagne-700 as its ink; the two are never a
     collision because the STONES differ and neither tab is ever active at the
     same time as the other.

     ⚠️ Like /security, no desktop tab wears this yet — the row is full. The row
     exists so that the day one does, its jewellery is already correct. */
  "/careers": { stone: "var(--color-gilt-700)", ink: "var(--color-champagne-700)" }, // 5.60:1
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
  /* ⚠️ THE SAME EMERALD AS THE LISTING, DELIBERATELY (owner 2026-08-21: "there
     are no hues in the properties pages…add"). A development's own page is the
     listing's destination, and this file's own rule is that "the tab you came
     in on and the blocks you land among agree" — a second colour here would
     make one journey read as two. Land is emerald; a single plot is still
     land. */
  "/property": "var(--color-emerald)",
  "/projects": "var(--color-sapphire)",
  /* ⚠️ WAS amethyst (report 10, 2026-08-20: "the current purple background
     section feels inconsistent with the overall Jamin Bazaar visual style…
     replace it with a warm cream/beige tone such as #F3E7DA"). At the pane's
     40% mix, canvas-alt over the sand canvas measures #F2E5DB — within three
     RGB points of the requested tone — so the district pages keep the pane's
     gloss and gold hairline while the ground goes back to warm paper. The
     district TAB keeps its amethyst jewellery in NAV_STONE above; only the
     page ground moved. */
  "/locations": "var(--color-canvas-alt)",
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
  /* The same garnet as the nav stone, per this file's own rule that a route's
     pane hue and its nav stone agree. ⚠️ It is the DEEPEST hue in this map and
     therefore the strongest 40% ground on the site after `/contact`'s
     jamin-red — deliberately, because the page's whole subject is the last
     line rather than the quiet one. If it ever reads as too much, `mix` on the
     individual panes is the lever the class documents; do not lighten the
     token, which is load-bearing on `sold` in STAGE_STONE. */
  "/security": "var(--color-garnet)",
  /* Brass, the same stone the nav row above gives it. It is the one hue in this
     map spent on opportunity rather than on a kind of land, which is what a
     careers page is about — and it is unused by any other route, so nothing
     reads as a repeat of somewhere the visitor has already been. At the pane's
     40% it lands near #c7af88: a burnished gold, markedly deeper and more
     saturated than the sand canvas it sits on rather than another wash of it. */
  "/careers": "var(--color-gilt-700)",
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
