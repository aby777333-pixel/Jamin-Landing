/**
 * Survey dimension annotation, drawn on a card the way it is drawn on an FMB
 * sketch: an extension line with tick terminators running the top and left
 * edges, labelled with the real figure.
 *
 * A server component — the whole interaction is CSS, so it costs no JavaScript
 * at all. It reveals on `:hover` AND `:focus-within`, so a keyboard user
 * tabbing through the grid sees exactly what a mouse user sees.
 *
 * `preserveAspectRatio="none"` lets one viewBox stretch to any card, which is
 * why the strokes carry `vector-effect: non-scaling-stroke` — see cadastral.css.
 * The labels are HTML rather than SVG text for the same reason: 10px type
 * scaled by a stretched viewBox goes soft.
 */
export function DimensionOverlay({ top, left }: { top?: string | null; left?: string | null }) {
  if (!top && !left) return null;

  return (
    <>
      <svg className="cd-dim" viewBox="0 0 420 250" preserveAspectRatio="none" aria-hidden="true">
        {top && (
          <>
            <line className="cd-dim__ext" x1="14" y1="8" x2="14" y2="22" />
            <line className="cd-dim__ext" x1="406" y1="8" x2="406" y2="22" />
            <line className="cd-dim__line cd-dim__line--h" x1="14" y1="15" x2="406" y2="15" />
          </>
        )}
        {left && (
          <>
            <line className="cd-dim__ext" x1="8" y1="36" x2="22" y2="36" />
            <line className="cd-dim__ext" x1="8" y1="242" x2="22" y2="242" />
            <line className="cd-dim__line cd-dim__line--v" x1="15" y1="36" x2="15" y2="242" />
          </>
        )}
      </svg>

      {/* Both are decoration: the same figures are already in the card's own
          text, so a screen reader would otherwise hear the extent twice. */}
      {top && (
        <span
          aria-hidden="true"
          className="cd-dim__label left-1/2 top-[3px] -translate-x-1/2 bg-canvas px-1.5"
        >
          {top}
        </span>
      )}
      {left && (
        <span
          aria-hidden="true"
          className="cd-dim__label left-[-14px] top-1/2 -translate-y-1/2 -rotate-90 bg-canvas px-1.5"
        >
          {left}
        </span>
      )}
    </>
  );
}
