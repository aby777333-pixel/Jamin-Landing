"use client";

import { useSyncExternalStore } from "react";

/**
 * CARBON + GROVE — the mode toggle (owner 2026-08-17; third mode 2026-08-24).
 * One attribute on <html> (`data-mode="dark"` / `data-mode="nature"`, absent
 * for light), persisted in localStorage as `jp-mode`; the boot script in
 * layout.tsx applies the stored value before first paint so a dark or grove
 * reader never sees a flash of sand.
 *
 * ⚠️ ONE BUTTON, THREE MODES, CYCLED. light → dark → nature → light. A
 * segmented control would be "more discoverable" and would also be a third
 * object in a header whose phone geometry has been measured twice; the coin
 * stays a coin. The glyph advertises the mode the press will ENTER — the
 * convention the two-mode toggle already set (light showed the crescent).
 *
 * ⚠️ The glyphs are DRAWN, per the SurveyIcon rule — a lamp for light, a
 * crescent for carbon, a leaf for grove, all stroke-only so they take the
 * current ink.
 * ⚠️ Light stays the default. The others are offers, not opinions.
 * ⚠️ No aria-pressed: it is a boolean and this is no longer a boolean
 * control. The label carries the state instead, as a cycle button should.
 *
 * ⚠️ `useSyncExternalStore`, not useState+useEffect — the DOM attribute IS
 * the store (the boot script writes it before hydration), and the repo's
 * eslint bans setState in an effect body. Server snapshot is "light", the
 * default; after hydration React re-reads the real attribute. Same pattern
 * as JamindarDock's SpeechRecognition detection.
 */
type Mode = "light" | "dark" | "nature";

const ORDER: Mode[] = ["light", "dark", "nature"];

const listeners = new Set<() => void>();
function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}
const getSnapshot = (): Mode => {
  const m = document.documentElement.dataset.mode;
  return m === "dark" || m === "nature" ? m : "light";
};
const getServerSnapshot = (): Mode => "light";

export function ModeToggle() {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];

  const toggle = () => {
    if (next === "light") delete document.documentElement.dataset.mode;
    else document.documentElement.dataset.mode = next;
    try {
      localStorage.setItem("jp-mode", next);
    } catch {
      /* private mode — the toggle still works for the session */
    }
    listeners.forEach((l) => l());
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={
        next === "dark"
          ? "Switch to dark mode"
          : next === "nature"
            ? "Switch to nature mode"
            : "Switch to light mode"
      }
      /* ⚠️ `rj-coin` owns the radius, the ring, the light-catch, the hover
         lift and the transition (do-all round, menu item 9). It was a
         bordered circle at `bg-canvas/60` — a hole punched in the header
         rather than an object lying on it. Do not put `border` or a `bg-`
         utility back: the ring is an inset `box-shadow` so the coin has no
         border box to fight with, and a background utility would cover the
         gradient that IS the light on its top edge. */
      className="rj-coin inline-flex h-9 w-9 shrink-0 items-center justify-center text-ink-soft"
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        {next === "light" ? (
          /* the lamp — back to light */
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" />
          </>
        ) : next === "dark" ? (
          /* the crescent — into carbon */
          <path d="M20.2 14.2A8.3 8.3 0 1 1 9.8 3.8a6.6 6.6 0 1 0 10.4 10.4Z" />
        ) : (
          /* the leaf — into the grove */
          <>
            <path d="M19.5 4.5C13 4.5 6.5 7.5 6.5 14.5c0 2.9 2.1 5 5 5 7 0 8-9 8-15Z" />
            <path d="M11.5 19.5c0-5 2.5-9.5 6-12.5" />
          </>
        )}
      </svg>
    </button>
  );
}
