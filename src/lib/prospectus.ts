/**
 * THE PROSPECTUS — developments that are announced but not yet catalogued.
 *
 * 🚨 WHY THIS IS A FILE AND NOT A SUPABASE ROW, which is the first thing a
 * reader will want to argue with.
 *
 * Everything else on this site that looks like a project comes from the app's
 * Supabase, and `src/lib/properties.ts` opens by saying so: the website reads
 * that database READ-ONLY and the app's admin console is the only editor. That
 * rule is not being broken here — it is being respected. These three are not
 * catalogue records:
 *
 *   · no plot schedule        · no availability
 *   · no price                · no sanction number
 *   · no survey number        · nothing for the desk to sell yet
 *
 * A `properties` row with every one of those columns null would render as a
 * broken listing everywhere the catalogue is consumed — the cards, the map,
 * the compare table, the sitemap, the district pages — and would have to be
 * special-cased out of each. Worse, writing into the app's database from the
 * website is the one thing the read-only contract exists to prevent.
 *
 * So they live here, in the one surface that shows them, until they become
 * real listings. When any of them does, DELETE it from this file rather than
 * leaving both — two sources for one development is how a site ends up
 * contradicting itself about a plot count.
 *
 * ⚠️ EVERY WORD BELOW CAME FROM THE OWNER (2026-08-22) AND NOTHING WAS ADDED.
 * The supplied brief was exactly:
 *
 *     1. KARIYAPATTI — INTEGRATED LAYOUT PROJECT
 *     2. Genguvarpatti — 30 ACRES — TOWNSHIP RETREAT VILLA PROJECT
 *     3. 50 Acres madurai kallikudi — Integrated township
 *
 * No acreage is shown for Kariyapatti because none was given. No district is
 * named for Kariyapatti or Genguvarpatti because none was given — Virudhunagar
 * and Theni are the obvious guesses and both were deliberately NOT written
 * down, because a guessed location on a land-sales page is the exact class of
 * claim the trust section on the homepage invites the reader to check. Madurai
 * appears only because the owner wrote "madurai kallikudi".
 *
 * ── SECOND BRIEF, 2026-08-22 (Upcoming) ──────────────────────────────────
 *
 *     1. Chandrapuram — RESIDENTIAL LAYOUT PROJECT — 6.5 ACRES
 *     2. AMMAPETTAI — 7.79 ACRES — RESIDENTIAL LAYOUT PROJECT
 *
 * ⚠️ THE OWNER ASKED FOR THREE AND NAMED TWO. There is no third entry below
 * because no third development was supplied — not because one was missed. Add
 * it here when its name, scale and artwork arrive.
 *
 * ⚠️ CHANDRAPURAM SHIPPED WITHOUT A HERO IMAGE. Its folder
 * (`Downloads/1 Chandrapuram`) was empty and the six files were loose in
 * `Downloads/`, none of them named "hero" — every other development supplied
 * one explicitly. `chandrapuram image1.png` is used as the header because it
 * is the same shape as the real heroes (1672x941) and is the gate render
 * carrying the project's own name board, so it is the frame a hero would have
 * been. The remaining five are the gallery. Swap it if a proper hero arrives.
 */

import type { Phase } from "@/lib/site";

export type Prospectus = {
  /**
   * Which stage page shows it.
   *
   * ⚠️ "UPCOMING" IS `current`, NOT `future` — the slug and the word differ,
   * and `PHASE_META` in lib/site.ts is the thing that spells it out
   * (`current: { label: "Upcoming" }`). An entry tagged "upcoming" would
   * silently render nowhere.
   */
  phase: Phase;
  /** URL-safe id. Used for the anchor and the image folder name. */
  slug: string;
  /** The development, as the owner writes it. */
  name: string;
  /** The place, where one was actually supplied. `null` otherwise. */
  place: string | null;
  /** The scale, where one was actually supplied. `null` otherwise. */
  scale: string | null;
  /** What kind of development it is — the owner's own words, title-cased. */
  kind: string;
  /** One sentence. Says only what the two fields above already say. */
  overview: string;
  /** Count of gallery files in `public/projects/<slug>/NN-1200.webp`. */
  gallery: number;
};

export const PROSPECTUS: Prospectus[] = [
  {
    phase: "future",
    slug: "kariyapatti",
    name: "Kariyapatti",
    place: null,
    scale: null,
    kind: "Integrated layout project",
    overview:
      "An integrated layout development. The land is secured and planning is under way; plot sizes, pricing and the sanctioned layout will be published here once they are approved.",
    gallery: 6,
  },
  {
    phase: "future",
    slug: "genguvarpatti",
    name: "Genguvarpatti",
    place: null,
    scale: "30 acres",
    kind: "Township retreat villa project",
    overview:
      "A township retreat villa development across 30 acres. The land is secured and planning is under way; plot sizes, pricing and the sanctioned layout will be published here once they are approved.",
    gallery: 5,
  },
  {
    phase: "future",
    slug: "kallikudi",
    name: "Kallikudi",
    place: "Madurai",
    scale: "50 acres",
    kind: "Integrated township",
    overview:
      "An integrated township across 50 acres at Kallikudi, Madurai. The land is secured and planning is under way; plot sizes, pricing and the sanctioned layout will be published here once they are approved.",
    gallery: 5,
  },
  /* ── UPCOMING ── phase `current`, which the buyer reads as "Upcoming". */
  {
    phase: "current",
    slug: "chandrapuram",
    name: "Chandrapuram",
    place: null,
    scale: "6.5 acres",
    kind: "Residential layout project",
    overview:
      "A residential layout development across 6.5 acres. Plot sizes, pricing and the sanctioned layout will be published here once they are approved.",
    gallery: 5,
  },
  {
    phase: "current",
    slug: "ammapettai",
    name: "Ammapettai",
    place: null,
    scale: "7.79 acres",
    kind: "Residential layout project",
    overview:
      "A residential layout development across 7.79 acres. Plot sizes, pricing and the sanctioned layout will be published here once they are approved.",
    gallery: 6,
  },
];

/**
 * The entries for one stage page.
 *
 * ⚠️ Filtering happens HERE rather than at the call site so the band, the
 * header count and the empty-state guard cannot disagree about which entries
 * belong to a page — they all ask the same function.
 */
export function prospectusFor(phase: Phase) {
  return PROSPECTUS.filter((p) => p.phase === phase);
}

/** `public/projects/<slug>/hero-1440.webp` — the gate render for the header. */
export function prospectusHero(p: Prospectus) {
  return `/projects/${p.slug}/hero-1440.webp`;
}

/** The gallery files, in the order they were supplied. */
export function prospectusGallery(p: Prospectus) {
  return Array.from(
    { length: p.gallery },
    (_, i) => `/projects/${p.slug}/${String(i + 1).padStart(2, "0")}-1200.webp`,
  );
}

/**
 * The one-line summary under the name — only the parts that exist.
 *
 * ⚠️ FILTERED, NOT TEMPLATED. Two of the three have no place and one has no
 * scale, and a template would render "Kariyapatti ·  · Integrated layout
 * project" with a hole in it. Joining a filtered list is what keeps a missing
 * field invisible instead of visibly missing.
 */
export function prospectusLine(p: Prospectus) {
  return [p.place, p.scale, p.kind].filter(Boolean).join(" · ");
}
