"use client";

import Image from "next/image";
import { useSyncExternalStore } from "react";

/**
 * THE LIVING DAY (do-all round #2, 2026-08-18) — the home hero follows Tamil
 * Nadu's own clock. Morning visitors meet the daylight gate, evening visitors
 * the dusk trident, night visitors the lit night gate.
 *
 * ⚠️ `useSyncExternalStore`, the repo's standing pattern: the server snapshot
 * is DUSK (hero-61, the page's established identity), so SSR and hydration
 * agree; after hydration React re-reads the real IST hour and corrects. A
 * visitor outside the dusk band sees one soft crossfade at most. The clock is
 * IST by construction (`Asia/Kolkata` via Intl), never the visitor's zone —
 * the site shows the LAND's time of day.
 *
 * ⚠️ Frame reuse is deliberate and recorded: hero-75 also carries /compare
 * and hero-59 carries /locations/tiruppur — the where-we-build/hero-39
 * precedent. All three are brand imagery under the standing rule (alt="",
 * aria-hidden). Per-frame objectPosition travels WITH each frame (the
 * hero-and-its-crop-are-one-change rule): 61 keeps the apex-preserving
 * `50% 0%` from the report round; 75/59 hold their arch bands at `50% 30%`.
 *
 * ⚠️ The copy plate needs NO re-sweep for this: it is the LIGHT sand plate at
 * 0.62 both vars, so its effective ground is ≥ 0.62·sand whatever frame sits
 * behind — ink stays ≥8:1 on the darkest frame (worked in the session notes).
 * The phone band is NOT cycled: it carries hero-72 for the left-lockup
 * report fix and stays stable.
 */
/* FIVE bands now (owner 2026-08-18 evening: "add early morning and midnight
   too, and adjust the time. Do not change the other images"): DEWDROPS at
   dawn (hero-78, mist and joggers) and DREAMERS at midnight (hero-79, moon
   over the lit layout) join the original three, which are untouched.
   ⚠️ evening.png arrived in the same batch and is deliberately NOT wired —
   the instruction keeps hero-61 as the dusk identity; the file waits in
   Downloads as a spare. */
/**
 * 🚨 THE DAY FRAME'S CROP CARRIES TWO REPORT-12 FIXES, AND THEY ACT AT
 * DIFFERENT VIEWPORTS — which is why one value can satisfy both (2026-08-21).
 *
 * hero-75 is 1774x887 (2:1) in a box that is 100svh less the header. Whether
 * `cover` crops the SIDES or the TOP AND BOTTOM depends entirely on whether
 * that box is narrower or wider than 2:1, and each complaint lives on one side
 * of that line:
 *
 * · "the hero image is currently cropped too much at the bottom… a small
 *   amount of cropping from the top is acceptable" (priority High). Measured at
 *   1920x900: the box is 2.33:1, so the frame is WIDTH-bound, scales to 955px
 *   tall in an 820px box, and 135px of height is discarded. At the old 30% that
 *   was 40px off the top and 95px off the bottom — the brick forecourt, which
 *   is the foreground the composition stands on. At 70% it is 95 off the top
 *   and 41 off the bottom. The top can afford it: the arch beam carrying the
 *   lockup sits at 20–34% of the frame and 95px is 9.9% of it, so the beam
 *   keeps a full 10% of headroom.
 *
 * · "adjust the hero image position/crop so the JAMIN SOULFUL signage stays on
 *   the right side". Measured at 1440x900: the box is 1.744:1, so the frame is
 *   HEIGHT-bound, scales to 1640px wide in a 1430px box, and 210px of width is
 *   discarded. The signage runs 36.3%–68.8% of the source, so anchoring the
 *   crop at the LEFT edge (0%) walks it 105px to the right — the entire travel
 *   the geometry has. The price is the rightmost 12.8% of the frame, which
 *   holds the "Welcome to a Life Well Planned" plaque and no brand mark.
 *
 * ⚠️ 105px IS ALL THE CROP CAN GIVE, AND IT IS NOT ENOUGH ON ITS OWN. Solved
 * rather than eyeballed: the plate's right edge sits at screen x 691 and the
 * signage's left edge lands at 595 even at 0%, so clearing it by crop alone
 * needs an object-position of −45%, which does not exist. That is why the copy
 * plate's alpha moved with this change (see Hero.tsx) — the two are one fix.
 */
/**
 * 🚨 THE CROP BUDGET, MEASURED (report 17: "The hero image on the Home page is
 * visibly cut off/cropped, causing parts of the original image composition to
 * be missing").
 *
 * The banner is `absolute inset-0` inside a hero whose xl height is
 * `100svh - header`. At 1440x900 that box is 1430x820 — a ratio of 1.744 — and
 * `object-cover` fills it, so any frame wider than 1.744 loses width:
 *
 *   dawn / day / night   2.000   13% of the width falls outside the box
 *   dusk                 1.589   fits the width; loses 9% of its HEIGHT
 *   midnight             2.155   19% of the width falls outside
 *
 * ⚠️ `day` WAS ANCHORED AT `0%` AND THAT IS THE BUG THE REPORT PHOTOGRAPHED.
 * A horizontal anchor of 0% pins the crop to the left edge, so the whole 13%
 * came off ONE side — the right of the composition simply vanished, which is
 * the same complaint filed on 2026-08-17 against a different frame. At 50% the
 * same 13% is split into 6.5% a side, which reads as a framing choice rather
 * than as a missing half. The vertical 70% is untouched: that one was swept
 * for this frame's horizon and is not what was reported.
 *
 * ⚠️ THIS REDUCES THE CROP; IT CANNOT REMOVE IT. Showing a 2.0 frame whole
 * inside a 1.744 box is geometrically impossible — the only two ways are
 * `object-contain`, which letterboxes the hero with 105-156px bands and ends
 * its full-bleed character, or shortening the hero, which walks straight back
 * into the straddle bug Hero.tsx records at length ("the console now sits
 * wholly BELOW the 100svh hero"). Both are owner decisions, not silent ones.
 */
const FRAMES = {
  dawn: { id: "78", w: 1774, pos: "50% 30%" },
  day: { id: "75", w: 1774, pos: "50% 70%" },
  dusk: { id: "61", w: 1581, pos: "50% 0%" },
  night: { id: "59", w: 1774, pos: "50% 30%" },
  midnight: { id: "79", w: 1840, pos: "50% 40%" },
} as const;

type FrameKey = keyof typeof FRAMES;

/* The adjusted clock, IST:
     05–08  dawn      — the Dewdrops mist
     08–17  day       — the Soulful daylight gate
     17–20  dusk      — the Trident dusk (unchanged)
     20–23  night     — the lit night gate (unchanged)
     23–05  midnight  — the Dreamers moon */
function frameForNow(): FrameKey {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (hour >= 5 && hour < 8) return "dawn";
  if (hour >= 8 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  if (hour >= 20 && hour < 23) return "night";
  return "midnight";
}

const listeners = new Set<() => void>();
let timer: ReturnType<typeof setInterval> | null = null;
function subscribe(cb: () => void) {
  listeners.add(cb);
  /* One shared 10-minute tick so the frame turns over while a tab sits
     open across a boundary. Torn down with the last subscriber. */
  if (!timer) timer = setInterval(() => listeners.forEach((l) => l()), 10 * 60 * 1000);
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && timer) {
      clearInterval(timer);
      timer = null;
    }
  };
}
const getSnapshot = () => frameForNow();
const getServerSnapshot = (): FrameKey => "dusk";

export function LivingHeroArt() {
  const key = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const f = FRAMES[key];
  return (
    <Image
      key={f.id}
      src={`/hero/hero-${f.id}-${f.w}.webp`}
      alt=""
      fill
      priority
      sizes="100vw"
      className="object-cover"
      style={{ objectPosition: f.pos, transition: "opacity 600ms var(--ease-silk)" }}
    />
  );
}
