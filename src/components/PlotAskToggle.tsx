"use client";

import { useState, type ReactNode } from "react";

/**
 * "Ask about plot N" — the disclosure that drops the enquiry form down in
 * place (owner, 2026-08-21: "when clicked ask about plot, it should drop down
 * a creds fill field… a copy of the bottom field").
 *
 * It is only the toggle. What it reveals is the caller's business, which is
 * what lets the traced plan's plot sheet and the Plot list's card show the
 * SAME form with the same wording — the standing rule on this page since the
 * shared record builder: a reader who picks the grid must never end up with
 * less than a reader who picks the drawing.
 *
 * ⚠️ Gold guidance dress, deliberately not red. "Book a site visit" above it
 * is the one filled red control in this sheet — §85 allows exactly one primary
 * action per view, and asking a question is the quieter of the two intents.
 *
 * ⚠️ `aria-expanded` + `aria-controls` and a real `<button>`: this collapses
 * and expands content, which is a disclosure, not navigation. It used to be an
 * `<a href="#enquire">` — correct then, because it genuinely went somewhere.
 */
export function PlotAskToggle({ plotNo, children }: { plotNo: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const panelId = `plot-ask-${plotNo}`;

  return (
    <>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-jamin-gold bg-jamin-gold-soft/60 px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-gold-ink transition-all hover:bg-jamin-gold/25"
      >
        Ask about plot {plotNo}
        {/* The chevron turns rather than swapping glyphs, so the control reads
            as one object changing state. Decoration: the button's own label
            and `aria-expanded` carry the meaning. */}
        <svg
          viewBox="0 0 12 8"
          aria-hidden="true"
          className={`h-2 w-3 shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
        >
          <path
            d="M1 1.5 6 6.5l5-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ⚠️ MOUNTED ONLY WHEN OPEN, never hidden with CSS. The form inside
          carries `required` inputs, and a `display:none` form still takes part
          in its own submission and still exposes its fields to autofill and to
          a screen reader's forms list. Unmounting is also what makes the
          caller's `key` reset the message when a different plot is opened. */}
      {open && (
        <div
          id={panelId}
          className="mt-2 rounded-card border border-line bg-canvas-alt p-phi3"
        >
          {children}
        </div>
      )}
    </>
  );
}
