/**
 * The four assurances, drawn instead of typed.
 *
 * ⚠️ These replace literal Unicode glyphs — `▦ ✓ ⌁ ₹`. A codepoint is rendered
 * by whatever font the reader's OS picks, so the set never matched itself
 * across platforms, and `⌁` (U+2301) is absent from most Windows and Android
 * font stacks entirely: the strongest trust block on the homepage could be
 * showing a buyer an empty box.
 *
 * One geometry for all four — 24px box, 1.25px stroke, `currentColor` — so they
 * inherit the tint classes already on the tiles and read as one set drawn by
 * one hand. Every shape is traceable to a land document or a survey instrument,
 * which is the whole test this system applies to anything decorative.
 */
export type SurveyIconName =
  | "stamp"
  | "deed"
  | "junction"
  | "ledger"
  /* Added 2026-08-11 for "Explore by Purpose". Same test as the first four:
     every shape is traceable to a land document or a survey instrument, so the
     set still reads as one hand. Nothing here is a pictogram of a lifestyle. */
  | "home"
  | "growth"
  | "leaf"
  | "building";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function SurveyIcon({ name, className = "" }: { name: SurveyIconName; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={`h-6 w-6 ${className}`} aria-hidden="true" focusable="false">
      {name === "stamp" && (
        /* A rubber approval stamp: double-ruled impression with the arc of text
           reduced to the arc itself, and the handle above it. */
        <g {...STROKE}>
          <circle cx="12" cy="13.5" r="7" />
          <circle cx="12" cy="13.5" r="4.6" />
          <path d="M9.2 13.6l1.9 1.9 3.7-3.9" />
          <path d="M12 6.5V4.2" />
        </g>
      )}

      {name === "deed" && (
        /* A deed with the corner turned — the dog-ear from the logo, and the
           reason the card fold exists at all. Rule lines stand for the text. */
        <g {...STROKE}>
          <path d="M5.5 3.5h9l4.5 4.5v12a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
          <path d="M14.5 3.5V8h4.5" />
          <path d="M7.8 12.5h8.4M7.8 15.5h8.4M7.8 18.2h5.2" />
        </g>
      )}

      {name === "junction" && (
        /* A road junction in plan, with the dashed centre line a layout drawing
           uses — roads formed to the sanctioned width, seen from above. */
        <g {...STROKE}>
          <path d="M3 8.5h18M3 15.5h18" />
          <path d="M8.5 3v18M15.5 3v18" />
          <path d="M12 4.6v2M12 9.8v2M12 15v2M12 19.4v-2" strokeDasharray="0.1 3.2" />
        </g>
      )}

      {name === "ledger" && (
        /* A ledger page: ruled lines and a column rule, the register a loan is
           entered into. */
        <g {...STROKE}>
          <rect x="3.6" y="4" width="16.8" height="16" rx="1.2" />
          <path d="M8.2 4v16" />
          <path d="M11 8.4h6.4M11 12h6.4M11 15.6h4" />
        </g>
      )}

      {name === "home" && (
        /* A house in ELEVATION, sitting inside its plot boundary — the drawing
           a sanctioned layout carries, not a roof-and-chimney pictogram. The
           setback line is what says "a plot you may build on". */
        <g {...STROKE}>
          <path d="M3.4 20.4h17.2" />
          <path d="M5.6 20.4v-8.2L12 7.2l6.4 5v8.2" />
          <path d="M10.2 20.4v-4.6h3.6v4.6" />
          <path d="M3.4 17.2h1.2M19.4 17.2h1.2" strokeDasharray="0.1 2.4" />
        </g>
      )}

      {name === "growth" && (
        /* A survey chain rising across a plot — value plotted over time, drawn
           as the stepped benchmark a levelling instrument records rather than
           as a stock-market arrow. */
        <g {...STROKE}>
          <path d="M3.6 20.2h16.8" />
          <path d="M3.6 20.2V4.2" />
          <path d="M6.4 16.6l3.6-3.4 3.2 2.4 5.6-6" />
          <path d="M15.6 9.6h4.2v4.2" />
          <circle cx="10" cy="13.2" r="0.9" />
        </g>
      )}

      {name === "leaf" && (
        /* Furrows running to a boundary — farmland in plan, the way an
           agricultural parcel is hatched on a drawing. */
        <g {...STROKE}>
          <rect x="3.4" y="4.6" width="17.2" height="14.8" rx="1.2" />
          <path d="M3.4 9.2c4.4 1.6 12.8 1.6 17.2 0M3.4 13.4c4.4 1.6 12.8 1.6 17.2 0M3.4 17.6c4.4 1.6 12.8 1.6 17.2 0" />
        </g>
      )}

      {name === "building" && (
        /* A commercial block in elevation, with the floor rules a plan uses and
           the frontage marked at the base. */
        <g {...STROKE}>
          <path d="M3.4 20.4h17.2" />
          <rect x="5.2" y="4.2" width="8.2" height="16.2" rx="0.8" />
          <rect x="13.4" y="9.4" width="5.4" height="11" rx="0.8" />
          <path d="M7.4 8h4M7.4 11.4h4M7.4 14.8h4M15.2 12.6h1.8M15.2 16h1.8" />
        </g>
      )}
    </svg>
  );
}
