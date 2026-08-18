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
const FRAMES = {
  day: { id: "75", w: 1774, pos: "50% 30%" },
  dusk: { id: "61", w: 1581, pos: "50% 0%" },
  night: { id: "59", w: 1774, pos: "50% 30%" },
} as const;

type FrameKey = keyof typeof FRAMES;

function frameForNow(): FrameKey {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      hour12: false,
      timeZone: "Asia/Kolkata",
    }).format(new Date()),
  );
  if (hour >= 6 && hour < 17) return "day";
  if (hour >= 17 && hour < 20) return "dusk";
  return "night";
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
