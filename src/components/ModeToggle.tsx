"use client";

import { useEffect, useState } from "react";

/**
 * CARBON — the dark-mode toggle (owner 2026-08-17). One boolean on <html>
 * (`data-mode="dark"`), persisted in localStorage as `jp-mode`; the boot
 * script in layout.tsx applies the stored value before first paint so the
 * page never flashes light on a dark reader.
 *
 * ⚠️ The glyphs are DRAWN, per the SurveyIcon rule — a lamp for light and a
 * crescent for carbon, both stroke-only so they take the current ink.
 * ⚠️ Light stays the default. Dark is an offer, not an opinion.
 */
export function ModeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.dataset.mode === "dark");
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    if (next) document.documentElement.dataset.mode = "dark";
    else delete document.documentElement.dataset.mode;
    try {
      localStorage.setItem("jp-mode", next ? "dark" : "light");
    } catch {
      /* private mode — the toggle still works for the session */
    }
  };

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={dark}
      aria-label={dark ? "Switch to light mode" : "Switch to dark mode"}
      className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line bg-canvas/60 text-ink-soft transition-colors hover:border-jamin-gold hover:text-ink"
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
        {dark ? (
          /* the lamp — back to light */
          <>
            <circle cx="12" cy="12" r="4.2" />
            <path d="M12 2.5v2.4M12 19.1v2.4M2.5 12h2.4M19.1 12h2.4M4.9 4.9l1.7 1.7M17.4 17.4l1.7 1.7M19.1 4.9l-1.7 1.7M6.6 17.4l-1.7 1.7" />
          </>
        ) : (
          /* the crescent — into carbon */
          <path d="M20.2 14.2A8.3 8.3 0 1 1 9.8 3.8a6.6 6.6 0 1 0 10.4 10.4Z" />
        )}
      </svg>
    </button>
  );
}
