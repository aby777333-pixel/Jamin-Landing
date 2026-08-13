/**
 * The four parts of a day, drawn.
 *
 * 🚨 DELIBERATELY NOT IN `SurveyIcon`, AND THE SEPARATION IS THE POINT.
 * That set has one rule — every shape is traceable to a land document or a
 * survey instrument, and nothing in it is a pictogram of a lifestyle. A singing
 * bird fails that test and should. But this is the one control on the site
 * whose subject genuinely IS the time of day rather than the land: a visitor
 * choosing when to stand on a plot. So the marks live here, in their own file,
 * where they cannot quietly become the site's general icon vocabulary.
 *
 * They keep the survey set's HAND — 24px box, 1.25px stroke, `currentColor`,
 * no fills — so the two read as drawn by the same person even though they are
 * governed by different rules.
 *
 * ⚠️ `aria-hidden`. Each slot's label already says "Morning · 9–11 am"; the
 * mark repeats it in pictures and must not repeat it to a screen reader.
 */
export type Daypart = "morning" | "midday" | "afternoon" | "evening";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

export function DaypartMark({
  part,
  className = "",
  size = "h-4 w-4",
}: {
  part: Daypart;
  className?: string;
  /** ⚠️ Pass the size HERE, not in `className`. Two same-specificity size
   *  utilities on one element are resolved by stylesheet order, not by the
   *  order they are written — the property page's amenity marks shipped at
   *  24px for exactly that reason. */
  size?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={`${size} ${className}`} aria-hidden="true" focusable="false">
      {part === "morning" && (
        /* First light: a bird on the wing over a horizon, with two short song
           arcs rising from it. The sun is only an arc — it has not cleared the
           land yet, which is the whole difference from midday. */
        <g {...STROKE}>
          <path d="M3.4 17.6h17.2" />
          <path d="M6.6 17.6a5.4 5.4 0 0 1 10.8 0" opacity="0.55" />
          <path d="M7.2 9.4c1.2-1.5 2.5-1.5 3.4-.2.9-1.3 2.2-1.3 3.4.2" />
          <path d="M15.9 6.6c.7.5 1 1.2.9 2.1M18 5.2c1.1.9 1.6 2.1 1.4 3.6" opacity="0.7" />
        </g>
      )}

      {part === "midday" && (
        /* Overhead: a full disc, rays on all eight points, the horizon gone
           because at midday nothing is casting along it. */
        <g {...STROKE}>
          <circle cx="12" cy="12" r="4.1" />
          <path d="M12 3.1v2.2M12 18.7v2.2M3.1 12h2.2M18.7 12h2.2" />
          <path d="M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M18.2 5.8l-1.6 1.6M7.4 16.6l-1.6 1.6" opacity="0.75" />
        </g>
      )}

      {part === "afternoon" && (
        /* The lazy hour: the disc has dropped, the rays are gone, and what is
           left is heat lying flat over the ground. */
        <g {...STROKE}>
          <circle cx="12" cy="10.2" r="3.5" />
          <path d="M4.6 15.6h14.8" opacity="0.85" />
          <path d="M6.6 18.2h10.8" opacity="0.6" />
          <path d="M8.6 20.4h6.8" opacity="0.4" />
        </g>
      )}

      {part === "evening" && (
        /* Setting: half a disc below the horizon, two rays going down rather
           than up, and the line of the land holding the rest. */
        <g {...STROKE}>
          <path d="M3.4 15.4h17.2" />
          <path d="M8.2 15.4a3.8 3.8 0 0 1 7.6 0" />
          <path d="M12 6.4v2M6.9 8.6l1.4 1.4M17.1 8.6l-1.4 1.4" opacity="0.6" />
          <path d="M5.6 19.1h4.2M13 19.1h5.4" opacity="0.45" />
        </g>
      )}
    </svg>
  );
}
