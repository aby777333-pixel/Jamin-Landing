/**
 * A loading state for a drawing: the boundary traces itself, the way a plan
 * arrives on a sheet.
 *
 * ⚠️ IT DOES NOT REPLACE `Skeleton`. That block's travelling light is correct
 * for a card, a paragraph or an image — things that arrive whole — and it was
 * only just given its shimmer. This is for the two surfaces whose content IS
 * line work, where a grey rectangle says nothing about what is coming.
 *
 * ⚠️ The geometry is a GENERIC layout, not any project's traced plan, and that
 * is deliberate: a skeleton showing Edappadi's real boundary would be showing
 * the reader a specific parcel before knowing which one they asked for. It is
 * drawn from the same vocabulary — a site boundary, a road band, a run of plots
 * — without claiming to be a place.
 *
 * ⚠️ `prefers-reduced-motion` gets the finished outline, immediately, rather
 * than nothing: the drawing is the content of the placeholder, so removing the
 * animation must leave the drawing, not an empty box. Handled in cadastral.css
 * next to the other guards rather than inline, so all of this file's motion is
 * governed in one place.
 */
export function PlanSkeleton({ className = "" }: { className?: string }) {
  /* Six plots either side of a road band. Enough to read as a layout, few
     enough that the trace completes before a normal fetch does. */
  const plots = [0, 1, 2, 3, 4, 5];

  return (
    /* ⚠️ No border, background or position of its own. Its live use is as the
       GROUND BEHIND the map tiles, where the frame already supplies all three
       and a second border would draw a box inside a box. The caller decides
       what this sits in. */
    <div className={className} aria-hidden="true">
      <svg viewBox="0 0 200 130" className="block h-auto w-full">
        {/* the site boundary */}
        <rect
          x="6"
          y="6"
          width="188"
          height="118"
          className="rj-trace-line"
          style={{ animationDelay: "0ms" }}
        />
        {/* the road band */}
        <path
          d="M6 65 H194"
          className="rj-trace-line"
          style={{ animationDelay: "220ms" }}
        />
        {plots.map((i) => (
          <g key={i}>
            <rect
              x={14 + i * 30}
              y={14}
              width="26"
              height="44"
              className="rj-trace-line"
              style={{ animationDelay: `${380 + i * 90}ms` }}
            />
            <rect
              x={14 + i * 30}
              y={72}
              width="26"
              height="44"
              className="rj-trace-line"
              style={{ animationDelay: `${380 + (i + 6) * 90}ms` }}
            />
          </g>
        ))}
      </svg>
    </div>
  );
}
