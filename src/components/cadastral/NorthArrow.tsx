/**
 * A surveyor's north point.
 *
 * 🚨 IT MUST ACTUALLY POINT NORTH, OR IT DOES NOT BELONG ON THIS SITE. The
 * cadastral set's one rule is that every shape traces to a land document or a
 * survey instrument; a compass rose that is merely decorative is a lifestyle
 * pictogram wearing a survey costume, and it fails that rule harder than a
 * cheerful icon would, because it makes a claim about the ground.
 *
 * Where it is safe to draw:
 *   ✅ the OSM maps (`PropertiesMap`, `SiteMap`). Web Mercator is north-up by
 *      construction, and neither map rotates, so "up" IS north and a fixed
 *      arrow is a true statement.
 *   ❌ `MasterPlan`. That draws a traced DTCP layout in the sanctioned
 *      drawing's OWN coordinate space, and nothing in `plot_plan` records the
 *      sheet's bearing. The plan is very probably not north-up, and an arrow
 *      there would be a guess printed as a fact. It gets a scale bar and no
 *      north point until somebody records the rotation.
 *
 * The form is the conventional half-open needle — one flank filled, one flank
 * open — which is how a north point is distinguished from an arrowhead at a
 * glance on a drawing carrying dozens of other arrows.
 *
 * ⚠️ `fill`/`stroke` are `currentColor`, NEVER `var(--token)`. An SVG
 * presentation attribute is not a CSS declaration, so `fill="var(--x)"` does
 * not resolve and the shape renders black — the trap already recorded against
 * the plot polygons in royal.css.
 */
export function NorthArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      width="26"
      height="34"
      viewBox="0 0 26 34"
      role="img"
      aria-label="North is up"
      className={className}
    >
      {/* The needle. Left flank open, right flank filled — both halves share
          the same apex and base so the two read as one blade, not as two
          triangles that happen to touch. */}
      <path
        d="M13 7 L6.5 27 L13 22.5 Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
      <path d="M13 7 L19.5 27 L13 22.5 Z" fill="currentColor" stroke="none" />
      {/* The letter, drawn rather than typeset: at 9px the site's own Inter
          would hint to a different weight than the 1.25px strokes beside it and
          the mark would read as two materials. */}
      <path
        d="M9.5 4.5 V0.5 L16.5 4.5 V0.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.25"
        strokeLinecap="round"
        strokeLinejoin="round"
        transform="translate(0 1)"
      />
    </svg>
  );
}
