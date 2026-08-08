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
export type SurveyIconName = "stamp" | "deed" | "junction" | "ledger";

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
    </svg>
  );
}
