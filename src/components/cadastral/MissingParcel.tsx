/**
 * A survey sheet with one parcel missing, for the 404.
 *
 * The page it sits on already said the right thing in words and offered the two
 * routes onward; what it had no picture for was the situation itself. This is
 * that: a boundary, a road, a run of plots, and one lot where the drawing
 * simply stops — hatched out, its number replaced by a query.
 *
 * ⚠️ IT IS A GENERIC LAYOUT AND NEVER A TRACED PLAN, the same rule
 * `PlanSkeleton` follows. Drawing Edappadi's real boundary here would say a
 * plot in Edappadi is missing, which is a statement about inventory, on the one
 * page guaranteed to be seen by someone who followed a broken link.
 *
 * ⚠️ `aria-hidden`. The heading and the paragraph beside it already carry the
 * meaning; a screen reader gains nothing from a description of hatching, and
 * the 404 must not become a puzzle for anyone who cannot see it.
 *
 * ⚠️ No animation. Every other drawn thing on this site arrives — this one is
 * already the answer to "where is it", and a plot that draws itself in would
 * read as loading, which is the one thing a 404 must not suggest.
 */
export function MissingParcel({ className = "" }: { className?: string }) {
  const plots = [0, 1, 2, 3, 4];
  /* The gap: third along the upper run. Off-centre on purpose — dead centre
     reads as a target, off-centre reads as an omission. */
  const missing = 2;

  return (
    <svg
      viewBox="0 0 220 140"
      className={className}
      aria-hidden="true"
      role="presentation"
    >
      {/* the sheet's own boundary, in the plan's dashed survey hand */}
      <rect
        x="6"
        y="6"
        width="208"
        height="128"
        fill="none"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="6 3"
        opacity="0.5"
      />
      {/* the road band */}
      <path d="M6 74 H214" stroke="currentColor" strokeWidth="1" fill="none" opacity="0.35" />

      <defs>
        {/* ⚠️ `userSpaceOnUse`, not the default `objectBoundingBox` — the latter
            sizes the tile to each shape, so a 26x44 plot and a 26x40 one would
            carry visibly different hatches. Same reason the plan's own patterns
            do it. */}
        <pattern
          id="rj-missing-hatch"
          patternUnits="userSpaceOnUse"
          width="5"
          height="5"
          patternTransform="rotate(45)"
        >
          <line x1="0" y1="0" x2="0" y2="5" stroke="currentColor" strokeWidth="0.9" />
        </pattern>
      </defs>

      {plots.map((i) => {
        const x = 16 + i * 38;
        const gone = i === missing;
        return (
          <g key={i}>
            <rect
              x={x}
              y={18}
              width="30"
              height="46"
              fill={gone ? "url(#rj-missing-hatch)" : "none"}
              stroke="currentColor"
              strokeWidth="1"
              opacity={gone ? 0.55 : 0.8}
              /* The absent lot is drawn in the plan's own "not available"
                 language — hatched, dashed — rather than in red. Red is the
                 brand's accent and this is not an error state of the company. */
              strokeDasharray={gone ? "3 2" : undefined}
            />
            <text
              x={x + 15}
              y={45}
              textAnchor="middle"
              fontSize="9"
              fill="currentColor"
              opacity={gone ? 0.7 : 0.55}
              className="ledger"
            >
              {gone ? "?" : String(i + 1)}
            </text>
            {/* the lower run, drawn plainly — the sheet continues, one lot is
                simply not on it */}
            <rect
              x={x}
              y={84}
              width="30"
              height="42"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              opacity="0.8"
            />
          </g>
        );
      })}
    </svg>
  );
}
