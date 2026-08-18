import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "./ui";
import { ParallaxLayer } from "./ParallaxLayer";

/**
 * The hero every page opens with.
 *
 * There are two tones, and which one a page uses is decided by the ARTWORK, not
 * by taste. The supplied set splits cleanly in two:
 *
 *  • 1, 2, 3 are photographic — deep skies, golden hour, real tonal range. They
 *    can carry white type across the full bleed, so they get `cinematic`.
 *  • 4–10 are graphic renders on a near-white ground with red architectural
 *    line-work. Laid full-bleed they would need a heavy scrim, which destroys
 *    the very thing that makes them good. They get `paper`: the words sit on
 *    the page's own ivory, the render bleeds off the right edge and `hero-fade`
 *    dissolves its left edge into the canvas.
 *
 * The accessibility consequence matters as much as the aesthetic one. In
 * `paper` the text contrast is fixed and knowable because nothing sits behind
 * it. In `cinematic` white type never touches the raw photograph — `veil` is a
 * measured gradient, dark enough at the copy end that white clears AA whatever
 * the image does underneath.
 *
 * ⚠️ These images are conceptual renders, NOT photographs of Jamin projects.
 * They may carry a page as brand imagery and must never be captioned as a
 * development or placed on a property card. See public/hero/README.md.
 */
export type HeroArt =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 17 | 18 | 19 | 21 | 23 | 25 | 27 | 28
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40 | 41 | 43 | 44 | 45
  | 46 | 47 | 48 | 49 | 50 | 51 | 52 | 53 | 54 | 55 | 56 | 57 | 58 | 59
  | 62 | 63 | 64 | 65 | 66 | 68 | 69 | 70 | 71 | 72 | 73 | 74 | 75;

/**
 * 🚨 THE NATIVE HEIGHT OF EACH TOP RENDITION, AND IT IS NOT DECORATION.
 *
 * The mobile hero band used to be a hard `aspect-[16/9]` box with
 * `object-contain`, on the reasoning recorded in hero/README.md that "16/9 is
 * the narrowest ratio in the register, so a wider frame only letterboxes onto
 * the section's own charcoal, which is invisible". **It is not invisible.**
 * Reported 2026-08-13 as a black strip under the navbar on /properties,
 * /projects/completed, /locations/coimbatore, /locations/salem,
 * /locations/tiruppur and /journal — six pages, one cause. Those carry frames
 * at 2.33, 2.24, 2.00 and 2.25:1, so on a 375px phone the picture is 161px tall
 * in a 211px box and the reader gets a ~25px bar above it and another below.
 *
 * The fix is to stop guessing the box: the band now takes the ARTWORK'S OWN
 * ratio, so the picture fills it exactly — no bar, and still no crop, which is
 * the pair of failures this band exists to avoid.
 *
 * ⚠️ Keep this in step with the files in public/hero. A wrong number here is a
 * bar or a sliver of crop, not a crash, so nothing will fail loudly. Read the
 * top rendition with an image tool rather than copying a figure out of the
 * README — several frames are TRIMMED and their file is not their source.
 */
const TOP_HEIGHT: Record<HeroArt, number> = {
  1: 850, 2: 768, 3: 914, 4: 916, 5: 863,
  6: 941, 7: 941, 8: 941, 9: 941, 10: 941,
  11: 914, 12: 941, 13: 941,
  17: 745, 18: 941, 19: 941, 21: 879, 23: 922,
  25: 793, 27: 887, 28: 941,
  31: 720, 32: 887, 33: 720,
  34: 800, 35: 887, 36: 887, 37: 821,
  38: 819, 39: 836, 40: 819,
  /* hero-41 — /journal from 2026-08-14 to 2026-08-15. */
  41: 887,
  /* hero-43 — /journal from 2026-08-15. Owner-supplied, no trim. */
  43: 879,
  /* hero-44/45 — MIRRORED cuts of 35/39; same dimensions as their sources. */
  44: 887,
  45: 836,
  /* hero-46..54 — the JAMIN CITY set (owner-supplied 2026-08-17): gated
     entrances of named Jamin Bazaar communities. No trims. */
  46: 887, 47: 916, 48: 863, 49: 941, 50: 941, 51: 941, 52: 941, 53: 887, 54: 941,
  /* hero-55..59 — the FLOWERED GATES set (owner-supplied 2026-08-17 evening,
     files named for their pages). 59 is a NIGHT frame. */
  55: 941, 56: 941, 57: 941, 58: 887, 59: 887,
  /* hero-62 (Erode) / hero-63 (Coimbatore) — owner-supplied 2026-08-17
     night, named for their pages. */
  62: 929, 63: 941,
  /* hero-64 — JAMIN REGENT ("Regent.png", 2026-08-17 night). */
  64: 941,
  /* hero-65 JAMIN MONARCH · hero-66 the red elephant (/tools). */
  65: 941,
  66: 941,
  /* hero-68 JAMIN IMPERIAL (spare) · hero-69 JAMIN GRAND (/projects). */
  68: 941,
  69: 1024,
  /* hero-70 — the park at dusk (spare) · hero-71 — the golden gate walk
     (spare) · hero-72 — the gate at golden hour (/downloads). */
  70: 941,
  71: 1024,
  72: 1024,
  /* hero-73 — the JAMIN BAZAAR avenue gate at sunset (/compare). */
  73: 941,
  /* hero-74 — the survey-desk flat-lay (/journal), COMPOSED not supplied. */
  74: 941,
  /* hero-75 — JAMIN SOULFUL daylight gate (/compare). */
  75: 887,
};

/** The widest rendition that exists for each source image. */
const TOP_WIDTH: Record<HeroArt, number> = {
  1: 1850, 2: 1920, 3: 1720, 4: 1717, 5: 1823,
  6: 1672, 7: 1672, 8: 1672, 9: 1672, 10: 1672,
  // Supplied 2026-08-08. 11 ends the shortfall recorded in hero/README.md —
  // there were eleven hero surfaces and ten renders.
  11: 1720, 12: 1672, 13: 1672,
  // Supplied 2026-08-09, a banner like hero-16 and TRIMMED the same way — the
  // renditions are cut at y=745 to drop the baked trust strip and category
  // column. See public/hero/README.md before regenerating it.
  17: 1672,
  // Also 2026-08-09, but NOT a banner: a plain photograph with no baked type,
  // so its renditions are straight downscales of the original.
  18: 1672,
  // ⚠️ 19 carries the JAMIN BAZAAR name on the gate and depicts a specific
  // finished layout. It is still a render, so the no-caption rule binds harder
  // here than anywhere else in the set — see public/hero/README.md.
  19: 1672,
  // ⚠️ 21 also names itself, and goes further: it shows a layout mid-build,
  // with workers, a tractor and a house going up. The same rule binds.
  21: 1790,
  // 23 carries no Jamin mark, so the provenance risk is the ordinary one. It
  // does show villas, plots AND apartment towers in one frame, which is the
  // Journal's subject rather than the company's — see hero/README.md.
  23: 1706,
  /* hero-25 — the banyan lesson, /journal until 2026-08-11. */
  25: 1983,
  /* hero-27 — the desk in the meadow, /journal from 2026-08-11. Owner-supplied.
     ⚠️ It is the OPPOSITE frame to the banyan it replaced: overcast daylight,
     bright sky, pale grass, and no deep shade anywhere. The banyan allowed the
     lightest plate on the site (0.02); this one cannot, and the alpha on the
     Journal's PageHero call was re-swept rather than carried over. */
  27: 1774,
  /* hero-28 — the elephant, /tools from 2026-08-11. Owner-supplied.
     ⚠️ MIRRORED and RETINTED before export, and both were necessary rather
     than tasteful: the subject was in the left third where `paper`'s copy plate
     sits, and the stock background is pure #ffffff against a #fdfcf9 canvas.
     See public/hero/README.md before regenerating it from the original. */
  28: 1672,
  /* hero-31 (/projects/ongoing) and hero-32 (/projects/future) — owner-supplied
     2026-08-12, replacing the villa render and the skyline render. Both are
     Jamin's OWN layouts: formed roads, kerbs, street lighting, plot markers.
     ⚠️ Both bake the JAMIN BAZAAR sign into the frame at the FAR LEFT, which is
     why they ship with `artPosition="right"` — see the note on the phase page.
     They are still brand imagery under the standing rule: `alt=""`,
     `aria-hidden`, and never a caption naming a development. */
  /* ⚠️ 1280, not 1774: hero-31 is TRIMMED, cut at source x 526. It shipped
     untrimmed while the copy plate was opaque, which hid the board behind it —
     the moment the plate went sheer the board ghosted straight through the
     headline. Anchoring right was never enough on its own. Same treatment and
     same native width as hero-33 so the two behave identically. */
  31: 1280,
  /* ⚠️ 32 is UNUSED — the owner replaced it with 33 the same afternoon, before
     it had been live an hour. Kept in the register rather than deleted because
     it is a perfectly good frame of an earlier stage, and /projects/future is
     the page most likely to want one back. */
  32: 1774,
  /* hero-33 (/projects/future) — the finished avenue: lawns in, avenue trees
     planted, flower beds, plot markers, boundary walls and a completed house.
     ⚠️ 1280, not 1774: it is TRIMMED. The JAMIN BAZAAR board was cut off the
     left edge (source x 0–494) because no `artPosition` could clear it — see
     the note on the phase page. Re-cut from the original, not from a rendition,
     if it is ever regenerated. */
  33: 1280,
  /* hero-34/35/36 — the district pages (Erode, Salem, Tiruppur), owner-supplied
     2026-08-12. One shoot: golden-hour layouts with the marble JAMIN BAZAAR
     sign. Coimbatore keeps hero-17, at the owner's request.
     ⚠️ 34 is 1422, not 1774 — it is TRIMMED. The original carries a "ROYAL
     CHETTINADU ENCLAVE" plaque on its right edge, a development name that is
     not in the catalogue, and the owner chose to cut it rather than publish a
     project the listing beneath it does not contain. Re-cut from the ORIGINAL
     at source x 1422, not from a rendition, if it is ever regenerated. */
  34: 1422,
  35: 1774,
  36: 1774,
  /* hero-38 (Erode) and hero-39 (Tiruppur) — owner-supplied 2026-08-13,
     replacing 34 and 36 on those two district pages. Same subject as the shoot
     they replace (a Jamin layout with the JAMIN BAZAAR board in frame) but a
     WORKING site rather than a finished gateway: planting, kerbing, a backhoe,
     a roller, cement stacked on a pallet.
     ⚠️ They are NOT from the 34/35/36 shoot, so they do not inherit its
     `SHEER_ALPHA` — the sweep is on the district page. 38 in particular is the
     brightest district frame the site has carried (hazy white sky across the
     whole top third).
     ⚠️ Neither is trimmed and neither needs to be: 34's "ROYAL CHETTINADU
     ENCLAVE" plaque and the "PLOT 125" plaque are both gone with the picture,
     so the only baked words left are the brand's own. */
  38: 1921,
  39: 1881,
  /* hero-37 — the aerial gate, /properties from 2026-08-12, owner-supplied.
     ⚠️ hero-17 is NOT freed by this: it stays the default for a district page
     with no art of its own, which today is Coimbatore. */
  37: 1916,
  /* 🚨 hero-40 — /projects/completed from 2026-08-13, owner-supplied, and it is
     the ONE PLACE public/hero/README.md says a render must never go. That page's
     subject genuinely is a delivered project, so the register requires real
     photography there, and until now it carried `secondaryImage()` of the
     handed-over development. The owner asked for this frame anyway, with that
     on the table.
     ⚠️ What it shows and what the page lists are different things: a lit avenue
     of finished VILLAS, above a listing whose one completed entry is a PLOTTED
     development (Udumalaipet, 400 cents / 60 plots). It is a render of nowhere
     and Jamin has not built these houses. So the standing rule binds harder here
     than on any other hero: `alt=""`, `aria-hidden`, and never a caption, a
     location or a project name — enforced by construction, since the page no
     longer passes `photo` and an art is always decoration. */
  40: 1921,
  /* hero-41 — /journal from 2026-08-14, owner-supplied, replacing hero-27's
     desk in the meadow. Same desk, same valley, and a tyrannosaur coming over
     the ridge behind it: the visual half of "when there's danger, Jamin stays
     cool", which the lead beneath it now says in words.

     ⚠️ IT IS THE ONE FRAME IN THIS REGISTER THAT CANNOT BE MISTAKEN FOR A
     PLACE, which makes the standing rule easy for once rather than hard. There
     is no provenance question to get wrong — nobody reads a dinosaur as a
     development. It still ships `alt=""` and `aria-hidden` like every other
     art, because it is decoration and the page says everything without it.

     ⚠️ Its plate alpha was RE-SWEPT and went UP, not carried over. hero-27 was
     overcast daylight and settled at 0.38; this frame puts a sunlit signboard
     and a bright horizon directly under the copy. See the note on the /journal
     call for the numbers. */
  41: 1774,
  /* hero-43 — the banyan signboard on a wet forest platform. It is the DARKEST
     frame in the register: mean rgb(20,47,30) under the plate's own footprint,
     against hero-41's sunlit meadow. That is what lets /journal run the
     lightest plate on any cinematic hero — see the sweep on its PageHero call.
     ⚠️ It names itself on the board, so the no-caption rule binds as it does on
     19 and 21. */
  43: 1790,
  /* hero-44 (Salem) / hero-45 (Tiruppur) — MIRRORED cuts of hero-35 and
     hero-39 (2026-08-17), made because the JAMIN BAZAAR board is baked into
     the LEFT of both source frames, exactly where the copy plate sits — the
     owner's report asked for text left, board right, with a clear gap, and no
     `artPosition` can move a baked element (the frames are width-bound in the
     hero box, so there is no horizontal slack at all).
     ⚠️ NOT plain flips. Both frames carry readable text — the lockup, and on
     35 the PLOT plaque and a kerb marker — so the flip would mirror it. The
     text-bearing regions are restored in the export: rect re-flips for the
     sign panel and marker, a perspective quad-warp for 35's angled plaque.
     Regenerate from public/hero's own 35/39 renditions with the script in the
     register entry, never by flipping alone. See public/hero/README.md. */
  44: 1774,
  45: 1881,
  /* hero-46..54 — the JAMIN CITY set (owner-supplied 2026-08-17, "Jamin city"
     folder): gated entrances of named communities — Trident, Metropolis, the
     arc gate, Nexus Residency, City of Dreams, Daydreamer Residency, and
     three more. ⚠️ Every frame names a community that is NOT in the catalogue,
     so the standing rule binds at hero-19 strength: `alt=""`, `aria-hidden`,
     never a caption, never on a property card. 46 carries the homepage
     (via Hero.tsx's own ART constant, not this register's callers); 53/54 are
     SPARES — both put the lockup where `paper`'s fade or the copy plate
     would fight it, the hero-31/33 lesson. Cinematic alphas were swept
     comparatively against audited hero-38: 49 holds 0.52; 47/48/50/51 need
     0.58 (see each caller). */
  46: 1773, 47: 1716, 48: 1823, 49: 1672, 50: 1672, 51: 1672, 52: 1672, 53: 1774, 54: 1672,
  /* hero-55..59 — the FLOWERED GATES set (2026-08-17 evening, "Jamin city"
     folder, files named for their pages): 55 /journal (bougainvillea pergola),
     56 /about (curving avenue, lockup wall), 57 /properties (villa street at
     golden hour), 58 /locations/salem (pergola with guard booth), 59
     /locations/tiruppur (the NIGHT gate — lit wall, blue dusk). All lockups
     sit RIGHT of frame, which is what lets the left copy plate breathe — the
     board-right rule the mirrored 44/45 round established, now drawn in
     rather than flipped in. Alphas swept comparatively vs audited hero-38:
     55-58 take 0.58; 59 is night and reads p95 8-11 at 0.52 — the safest
     frame the district pages have ever carried. Same standing rule as the
     whole register: alt="", aria-hidden, never a caption. */
  55: 1672, 56: 1672, 57: 1672, 58: 1774, 59: 1774,
  /* hero-62 (Erode: the pergola-top beige arch, lockup CENTRED high) and
     hero-63 (Coimbatore: the classical stone gate, lockup wall RIGHT) —
     "Erode hero.png" / "Coibatore hero.png", 2026-08-17 night. Swept
     comparatively: both read ABOVE the audited hero-38 figure at 0.52
     (62: p95 5.47, worst 4.10 · 63: p95 5.67) — the first daylight frames
     in the set to hold the lower alpha. Standing rule as ever: alt="",
     aria-hidden, never a caption. */
  62: 1693, 63: 1672,
  /* hero-64 — the JAMIN REGENT gate ("Regent.png"): construction beyond a
     ceremonial arch, lockup TOP-CENTRE, a layout board at right →
     /projects/future. ⚠️ It NAMES a community not in the catalogue on a page
     that lists the catalogue — the owner supplied it for this page with the
     hero-33/40 precedent standing: alt="", aria-hidden, never a caption.
     Unlike 31/33 its lockup is centred, so paper's right anchor keeps it
     whole without a trim. */
  64: 1672,
  /* hero-65 — JAMIN MONARCH ("Monarch.png") → /projects/ongoing, replacing
     the hero-31 photograph at the owner's supply (the hero-40 precedent
     standing: a render on a real-project page binds the no-caption rule at
     full strength). hero-66 — the RED elephant → /tools; subject right, so
     hero-28's mirror is not inherited, and paper's multiply blend replaces
     its retint. Standing rule on both: alt="", aria-hidden, never a caption. */
  65: 1672,
  66: 1672,
  /* hero-68 JAMIN IMPERIAL ("Imperiel.png") → /downloads, replacing the
     hero-7 skyline. hero-69 JAMIN GRAND ("Grand.png", 1.5:1 — the TALLEST
     cinematic frame in the register) → /projects, replacing the database
     photograph at the owner's supply; the secondaryImage path stays live in
     the page for a one-prop restore. Both named communities: the standing
     rule at full strength. */
  68: 1672,
  69: 1536,
  /* hero-70 — the park at dusk (the re-supplied "Imperiel.png") — SPARE
     since 22:37, when hero-71 (the golden gate walk, family entering under
     the lockup) took /downloads. Standing rule on both. */
  70: 1672,
  71: 1536,
  /* hero-72 — the gate at golden hour (22:54): the wall lockup left, the
     arch lockup overhead, the family walking in. Took /downloads within
     the hour (71 → spare). Standing rule applies. */
  72: 1536,
  /* hero-73 — the JAMIN BAZAAR avenue gate at sunset, wet road, guard at
     the left pillar (owner-supplied 2026-08-18) → /compare, replacing the
     hero-6 dart-board render. Lockup on the arch TOP-CENTRE, sun at right.
     ⚠️ Carries the brand lockup, so the standing rule binds: alt="",
     aria-hidden, never a caption. Swept comparatively vs audited hero-38 at
     the /compare standard-height geometry: p95 lum 0.783 against 38's 0.604
     — brighter, so it takes 0.58 like the other bright daylight frames. */
  73: 1672,
  /* hero-74 — the survey-desk flat-lay → /journal (owner report 2026-08-18:
     the Journal hero must read as research/documents, not a project gate).
     ⚠️ COMPOSED IN-REPO, not owner-supplied: the two REAL Edappadi sheets
     the site already publishes (public/plan/edappadi-sheet + the illustrated
     plan) laid at opposing tilts on near-white paper with a faint
     setting-out grid — regenerate with the PIL script in the register entry
     in public/hero/README.md. Near-white ground = the PAPER family, so it
     ships with `multiply` and needs no alpha sweep. Subject sits RIGHT;
     artPosition="right" on the caller. These are documents of a CATALOGUE
     project already published on its own property page, so the no-caption
     rule is the ordinary one: alt="", aria-hidden, decoration only. */
  74: 1672,
  /* hero-75 — the JAMIN SOULFUL gate in daylight (owner-supplied 2026-08-18
     13:00) → /compare, replacing hero-73 the same day at the owner's ask.
     Lockup TOP-CENTRE on the arch, "Welcome to a Life Well Planned" plinth
     right. Named community not in the catalogue → the standing rule at full
     strength: alt="", aria-hidden, never a caption. Swept comparatively vs
     audited hero-38 at the /compare standard geometry: p95 lum 0.711 vs
     0.604 — brighter → 0.58, the bright-daylight figure. hero-73 (the sunset
     gate) moves to the SPARE pile. */
  75: 1774,
};

function artSrc(n: HeroArt) {
  const id = String(n).padStart(2, "0");
  return {
    src: `/hero/hero-${id}-${TOP_WIDTH[n]}.webp`,
    srcSet: `/hero/hero-${id}-768.webp 768w, /hero/hero-${id}-1280.webp 1280w, /hero/hero-${id}-${TOP_WIDTH[n]}.webp ${TOP_WIDTH[n]}w`,
  };
}

export function PageHero({
  eyebrow,
  title,
  lead,
  art,
  photo,
  actions,
  meta,
  priority = true,
  size = "standard",
  tone = "paper",
  sheer = false,
  sheerAlpha,
  sheerBlur,
  /* ⚠️ NO DEFAULT — the two tones want different ones and a shared
     literal would silently move every cinematic hero. `paper` falls back to
     "left" below, where it always was; `cinematic` falls back to its own
     `object-center` class. Passing a value now reaches both. */
  artPosition,
  sheerEdge = false,
  plateXl = "46rem",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  art: HeroArt;
  /**
   * A real photograph, used instead of the brand render.
   *
   * Only ten renders were supplied and there are eleven pages that open with a
   * hero, so one page had to give. `/projects/completed` is the right one to
   * take a photograph: it is the only page whose subject genuinely IS a
   * delivered Jamin project, so per public/hero/README.md real photography is
   * what belongs there anyway — the renders are brand imagery and must never be
   * presented as a project. Passing a photo also releases hero-10 back to
   * /contact, which is how every remaining page ends up with its own image.
   */
  photo?: { src: string; alt: string };
  actions?: ReactNode;
  /** Small factual line under the copy — counts, never claims. */
  meta?: ReactNode;
  priority?: boolean;
  /** `full` fills most of a desktop viewport — asked for on /properties
   *  (2026-08-17, "hero does not fill the expected viewport height"). */
  size?: "standard" | "tall" | "full";
  tone?: "paper" | "cinematic";
  /** ⚠️ A far more see-through plate, for frames where the picture is the
   *  point. It is NOT free: it needs white copy and a heavy blur to hold AA —
   *  see `.rj-gilt-sheer`. Only set it after sweeping the frame. */
  sheer?: boolean;
  /** Per-frame tint for the sheer plate. Sweep the picture before setting it —
   *  the ceiling belongs to the photograph, not to the component. */
  sheerAlpha?: number;
  /** Blur radius in px. LOW keeps the photograph readable and costs tint;
   *  HIGH flattens it to a colour wash and costs almost none. Sweep both. */
  sheerBlur?: number;
  /**
   * ⚠️ Which part of the render survives the crop, `paper` tone only.
   *
   * The art sits in a 58%-wide box with `object-cover`, so it is always wider
   * than the window and something is cropped. `left` (the default, and what
   * every other paper page uses) anchors the image's left edge and crops the
   * right — which is correct for the graphic renders, whose subject is on the
   * left. hero-28's subject is on the RIGHT, so the default pinned the woman
   * against the frame's own right edge. Moving the anchor right shows more of
   * the empty ground beside her and walks the subject leftward into the frame.
   */
  artPosition?: string;
  /** Fade the cinematic plate out across its right edge, so the artwork
   *  behind it reads. Only for heroes whose copy is left-aligned and whose
   *  subject sits right — see the note on `.rj-gilt-sheer-edge`. */
  sheerEdge?: boolean;
  /** 🚨 THE PLATE'S CAP FROM `xl`, AND IT IS PER-PAGE BECAUSE THE CLIFF IS.
   *  Narrowing the card is what actually gives the photograph back, but how far
   *  it can go is set by the HEADLINE, and every page has a different one.
   *  Measured at 1440, line count of the h1:
   *
   *      /properties  "Plots in approved layouts across Tamil Nadu"
   *                   3 lines down to 38rem, 4 at 36rem   → 38rem
   *      /journal     "Land, and the things worth knowing before you decide."
   *                   3 lines at 42rem, 4 at 40rem        → 42rem
   *
   *  So this is a union of literal strings rather than a number: Tailwind scans
   *  source text, and a class it never sees written out is a class it never
   *  generates. Re-measure before adding a value. */
  plateXl?: "38rem" | "42rem" | "46rem";
}) {
  const artwork = artSrc(art);
  const src = photo?.src ?? artwork.src;
  const srcSet = photo ? undefined : artwork.srcSet;

  /**
   * The mobile band's box, as a ratio rather than a guess. See TOP_HEIGHT.
   *
   * ⚠️ A `photo` keeps 16/9, because its dimensions live in the database and
   * cannot be known at build time. That is a knowing compromise, not an
   * oversight: the only page still passing one is /projects, which is NOT among
   * the six reported, and `object-contain` means the worst case there stays a
   * letterbox rather than becoming a crop. If a photograph ever needs the same
   * treatment, the ratio has to travel with it from `lib/properties`.
   */
  const bandRatio = photo ? "16/9" : `${TOP_WIDTH[art]}/${TOP_HEIGHT[art]}`;
  const bandStyle = { "--hero-band": bandRatio } as React.CSSProperties;

  if (tone === "cinematic") {
    return (
      <section className="relative isolate overflow-hidden bg-charcoal">
        {/* 🚨 BELOW `lg` THIS IS A BAND, NOT A BACKGROUND — and it is ONE
            element that changes job at the breakpoint, not two.

            The bug: `object-cover` sizes to the box's HEIGHT, and on a phone the
            box is roughly square while every frame in the set is between 1.78:1
            and 2.5:1. /journal's hero is 2.0:1 in a 375×420 box, so the reader
            saw a 40% centre slice — reported as "the mobile layout crops a large
            portion of the image… important parts of the original are missing
            from view". No amount of `object-position` fixes that; the picture is
            simply wider than the hole.

            So on a phone the picture stops being a backdrop and becomes a band
            above the copy, `object-contain` inside a 16/9 box — which is the
            NARROWEST ratio in the set, so nothing is ever cropped left or right
            and a wider frame only letterboxes onto the section's own charcoal.
            The copy then sits on that charcoal, where white type is far safer
            than it ever was over a photograph.

            ⚠️ ONE `<Image>`. The obvious build is a `lg:hidden` band plus a
            `hidden lg:block` backdrop, and it costs every phone a second full
            hero download — a `display: none` image is still fetched. Instead the
            WRAPPER changes: in flow with an aspect box on mobile, absolutely
            filling the section from `lg`. `fill` is satisfied either way because
            both states are positioned.

            ⚠️ It also puts the picture FIRST on a phone, which is what the
            homepage banner already does and what the second report asked for —
            see the note on the paper band below.

            🚨 THE BOX IS THE ARTWORK'S OWN RATIO, NOT 16/9. A fixed 16/9 box was
            the black strip reported under the navbar on six pages — the frames
            here run to 2.33:1, and `object-contain` paid for "never cropped"
            with a bar of charcoal top and bottom. See TOP_HEIGHT. */}
        <div
          className="relative aspect-[var(--hero-band)] w-full xl:absolute xl:inset-0 xl:aspect-auto"
          style={bandStyle}
        >
          {/* A render is decoration and stays out of the accessibility tree; a
              photograph of a real project is content and gets a real alt.
              ⚠️ Wrapped in ParallaxLayer (do-all #2): the photograph drifts
              14% slower than the page from `xl`; the veil stays OUTSIDE the
              wrapper so the legibility gradient never swims. */}
          <ParallaxLayer>
            <Image
              src={src}
              alt={photo?.alt ?? ""}
              aria-hidden={photo ? undefined : "true"}
              fill
              priority={priority}
              sizes="100vw"
              className="object-contain object-center xl:object-cover"
              /* ⚠️ Only bites from `xl`, where the picture is `cover` and there
                 is a crop to steer. Below that it is `contain` in a box cut to the
                 artwork’s own ratio, so the whole frame is on screen and an
                 object-position has nothing to choose between. */
              style={artPosition ? { objectPosition: artPosition } : undefined}
            />
          </ParallaxLayer>
          {/* The veil is a legibility device for type sitting ON the picture.
              Below `lg` nothing sits on it, so darkening it there would spend
              the photograph for nothing. */}
          <div className="veil absolute inset-0 hidden xl:block" />
        </div>

        {/* `justify-center`, where this was `justify-end`. Bottom-anchoring was
            a legibility device, not a layout preference: `veil` is darkest in
            the bottom-left corner, so that is where bare white type had to go.
            The `gilt` plate carries its own backdrop now, which frees the copy
            to sit on the frame's vertical centre. The asymmetric padding stays
            — the optical centre of a block of type sits slightly above the
            geometric one, so a little more room below keeps it from reading
            low. */}
        {/* ⚠️ The `min-h` is `xl:` now, and the breakpoint is the FIX, not a
            taste change. It exists to give a full-bleed photograph room to be
            a photograph — and the photograph is only full-bleed from `xl`,
            where the wrapper above goes absolute. It used to be `lg:`, which
            left 1024–1279 with the band-then-copy structure PLUS a 26rem+
            box under it: a screen of bare charcoal below three lines of type,
            reported 2026-08-17 as "large white space appears below the hero".
            Below `xl` the vertical rhythm is now the same `py-phi5` every
            other section opens with, exactly as it already was below `lg`. */}
        <Container
          className={`relative flex flex-col justify-center py-phi5 ${
            size === "full"
              ? "xl:min-h-[clamp(30rem,85vh,52rem)] xl:pb-phi7 xl:pt-phi6"
              : size === "tall"
                ? "xl:min-h-[clamp(26rem,64vh,38rem)] xl:pb-phi7 xl:pt-phi6"
                : "xl:min-h-[clamp(20rem,48vh,30rem)] xl:pb-phi6 xl:pt-phi5"
          }`}
        >
          {/* The measure opens up on a wide screen. At 42rem a headline like
              "Plots in approved layouts across Tamil Nadu" broke to three lines
              and left "Nadu" alone on the last one, with 880px of empty hero
              beside it.

              ⚠️ The `gilt` plate is load-bearing, not ornament. `veil` was
              lightened at the same time, and it is this panel's 0.46 that puts
              the contrast back under the words — take the panel off and every
              cinematic hero drops below AA. The two changes ship together or
              not at all. */}
          <div
            /* ⚠️ `rj-gilt-sheer-edge` is ADDITIVE. It shipped once as an
               alternative and took `rj-gilt-sheer`’s `backdrop-filter: none`
               and `box-shadow: none` with it, which put `gilt`’s blur and
               shadow back and made the plate frosted. Both classes, always. */
            /* ⚠️ `rj-gilt-sheer-edge` is ADDITIVE. It shipped once as an
               alternative and took `rj-gilt-sheer`’s `backdrop-filter: none`
               and `box-shadow: none` with it, which put `gilt`’s blur and
               shadow back and made the plate frosted. Both classes, always.

               🚨 AND `sheerEdge` NARROWS THE PLATE, which turned out to be the
               lever the tint could not be. Asked repeatedly to make this card
               see-through, the honest finding was that the TINT is already at
               its floor — the lead measures 4.03:1 against 4.5 on hero-37’s own
               sharp pixels at 0.52, so lightening it drops body copy under AA.
               The WIDTH was free: measured at 1440, the headline stays at three
               lines from 46rem all the way down to 38rem and only breaks to
               four at 36rem, and the lead holds at eight lines throughout. So
               46 → 38rem gives back 128px of photograph and costs nothing at
               all. 36rem is the cliff; do not go past it.

               ⚠️ Scoped to `sheerEdge` rather than applied to every cinematic
               hero — the 46rem cap was set for a different headline on a
               different page and those pages were not what was reported. */
            className={`gilt ${
              sheer ? `rj-gilt-sheer ${sheerEdge ? "rj-gilt-sheer-edge" : ""} rj-sheer-copy` : ""
            } rise max-w-[42rem] rounded-2xl p-phi3 sm:p-phi4 ${
              { "38rem": "xl:max-w-[38rem]", "42rem": "xl:max-w-[42rem]", "46rem": "xl:max-w-[46rem]" }[
                plateXl
              ]
            }`}
            style={
              sheer
                ? ({
                    ...(sheerAlpha != null ? { "--rj-sheer-alpha": sheerAlpha } : {}),
                    ...(sheerBlur != null ? { "--rj-sheer-blur": `${sheerBlur}px` } : {}),
                  } as React.CSSProperties)
                : undefined
            }
          >
            {eyebrow && (
              /* Right-aligned (owner 2026-08-17): tabs and captions sit right. */
              <div className="flex items-center justify-end gap-3">
                {/* Gilt, where this was a plain white hairline — the same rule
                    that sits under BAZAAR in the logo. Gold as a RULE may be the
                    fill gold; gold as a WORD may not, so the label takes
                    `jamin-gold-light`, which holds on the plate. */}
                <span className="h-px w-12 rule-gold" />
                <span className={`text-micro font-medium uppercase tracking-brand ${sheer ? "" : "text-jamin-gold-pale"}`}
                  style={sheer ? { color: "var(--color-champagne-50)" } : undefined}>
                  {eyebrow}
                </span>
              </div>
            )}
            {/* `text-balance` evens the line lengths instead of filling each one
                to the measure and orphaning whatever is left over. */}
            <h1 className="mt-phi3 text-balance text-4xl text-white">{title}</h1>
            {lead && (
              <div className={`mt-phi3 max-w-xl text-pretty text-lg leading-relaxed ${sheer ? "text-white" : "text-white/80"}`}>
                {lead}
              </div>
            )}
            {meta && (
              <div className="glass-dark mt-phi3 inline-flex rounded-full px-4 py-1.5 text-tiny text-white/85">
                {meta}
              </div>
            )}
            {actions && <div className="mt-phi4 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas-alt">
      {/* setting-out grid, the faint texture a layout plan is drawn on */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* 🚨 THE PHONE BAND MOVED ABOVE THE COPY (2026-08-12) — this is the
          "every page has a different layout" report, and it was true.

          A reader going /properties → /projects/ongoing → /journal met three
          different structures: banner-then-copy on the homepage, copy-then-band
          on every `paper` page, and words-over-picture on every `cinematic`
          one. Each was defensible alone; together they read as three websites.

          One rule now: on a phone the picture comes first at full width, then
          the copy. The homepage banner already worked that way and is the one
          the owner designed by hand, so it is the one the rest follows.

          ⚠️ An ASPECT BOX + `object-contain`, where this was `h-44 sm:h-56`
          + `object-cover object-right`. A fixed height cannot be right for a
          set whose frames run 1.78:1 to 3.31:1 — at `sm:h-56` a 640px-wide
          phone was cropping a 1.78 render by 38%, and `object-right` then chose
          which 62% to keep.

          🚨 That box was 16/9 until 2026-08-13, on the reasoning that a wider
          frame would "letterbox onto the section's own ivory, which is
          invisible". It is not invisible — it was reported as a strip under the
          navbar, and on the charcoal of the cinematic tone it reads as a black
          band. The box is the artwork's own ratio now, so a frame of any width
          fills it exactly: no bar, and still nothing cropped.

          ⚠️ Still a SECOND element rather than the single re-positioned one the
          cinematic tone uses. It has to be: the desktop render is 58% wide,
          right-aligned and masked by `hero-fade`, and that mask is not
          something a full-width phone band should carry. The extra fetch is
          real and is the price of the two treatments being genuinely
          different pictures of the same file. */}
      {/* ⚠️ `mix-blend-multiply` on BOTH paper-tone images (CARTOUCHE
          2026-08-17). The page field is sand now, not near-white, and half the
          graphic renders sit on their own white ground — unblended they read
          as white rectangles pasted on the paper. Multiply maps white exactly
          onto whatever ground is behind it, so a render prints INTO the page
          — which is the whole drawing-sheet metaphor — and a photograph takes
          a faint warm cast that reads as the house print grade. Cinematic
          frames are full-bleed cover and keep their own colour. */}
      <div className="relative aspect-[var(--hero-band)] w-full xl:hidden" style={bandStyle}>
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority={priority}
          className="object-contain object-center mix-blend-multiply"
        />
      </div>

      {/* the render, bleeding off the right edge and dissolving into the page */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] xl:block"
        aria-hidden={photo ? undefined : "true"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes="58vw"
          /* A render is decoration; a photograph of a real project is content. */
          alt={photo?.alt ?? ""}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="hero-fade h-full w-full object-cover mix-blend-multiply"
          style={{ objectPosition: artPosition ?? "left" }}
        />
      </div>

      <Container
        className={`relative ${size === "tall" ? "py-phi6 lg:py-phi7" : "py-phi5 lg:py-phi6"}`}
      >
        {/* The paper tone gets the same plate, in its light form. Over ivory the
            fill is nearly invisible; what reads is the gold hairline, which is
            the point — the copy on every hero now sits on a gilt-edged plate
            whether or not there is a photograph behind it. */}
        <div
          className={`gilt-light ${sheer ? "rj-gilt-light-sheer rj-sheer-copy-ink" : ""} rise max-w-[34rem] rounded-2xl p-phi3 sm:p-phi4 lg:max-w-[38rem]`}
          style={
            sheer
              ? ({
                  ...(sheerAlpha != null ? { "--rj-sheer-alpha": sheerAlpha } : {}),
                  ...(sheerBlur != null ? { "--rj-sheer-blur": `${sheerBlur}px` } : {}),
                } as React.CSSProperties)
              : undefined
          }
        >
          {eyebrow && (
            /* Right-aligned (owner 2026-08-17): tabs and captions sit right. */
            <div className="flex items-center justify-end gap-3">
              <span className="h-px w-12 rule-gold" />
              {/* `gold-deep`, not `gold-ink` — this line sets the plate's
                  opacity. See the sweep recorded in `gilt-light`. */}
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-deep">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="mt-phi3 text-balance text-4xl text-ink">{title}</h1>
          {lead && (
            <div className="mt-phi3 text-pretty text-lg leading-relaxed text-ink-soft">{lead}</div>
          )}
          {meta && (
            <div className="glass rj-crystal mt-phi3 inline-flex rounded-full px-4 py-1.5 text-tiny text-ink-soft">
              {meta}
            </div>
          )}
          {actions && <div className="mt-phi4 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </Container>

    </section>
  );
}
