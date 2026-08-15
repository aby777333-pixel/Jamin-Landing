/**
 * A drawing's scale bar, computed from the projection rather than drawn to
 * look like one.
 *
 * 🚨 THE NUMBER ON IT IS A MEASUREMENT, SO IT HAS TO BE DERIVED. In Web
 * Mercator at 256px tiles the ground resolution is
 *
 *     metres per pixel = 156543.03392 * cos(latitude) / 2^zoom
 *
 * and the `cos(latitude)` term is not optional decoration: Mercator stretches
 * east–west away from the equator, so a bar computed without it would be wrong
 * by the secant of the latitude. Tamil Nadu sits around 11°N, where that is
 * only ~2% — small enough to be invisible and large enough to be a false
 * statement, which is the worst combination available.
 *
 * The bar then picks a ROUND ground distance (1 / 2 / 5 x 10^n) that fits
 * inside `maxPx`, and takes whatever pixel width that distance actually
 * occupies. A fixed-width bar with a rounded label would be the reverse — a
 * drawing that looks precise and is not.
 *
 * ⚠️ It reports its distance in text, so it is NOT `aria-hidden`. A scale is
 * information a reader can act on, unlike the survey ticks and the daypart
 * marks, which repeat a label that is already there.
 */

/** Metres per pixel for 256px Web Mercator tiles at a given zoom and latitude. */
export function metresPerPixel(latitude: number, zoom: number) {
  return (156543.03392 * Math.cos((latitude * Math.PI) / 180)) / 2 ** zoom;
}

/** The largest 1/2/5 x 10^n metre distance that fits inside `maxPx`. */
export function niceDistance(maxMetres: number) {
  if (!Number.isFinite(maxMetres) || maxMetres <= 0) return 0;
  const pow = 10 ** Math.floor(Math.log10(maxMetres));
  for (const mult of [5, 2, 1]) {
    if (pow * mult <= maxMetres) return pow * mult;
  }
  return pow;
}

function label(metres: number) {
  /* ⚠️ U+00A0 between figure and unit. A scale bar that wraps to "500" over
     "m" has stopped being a scale bar — and this one sits in a corner overlay
     narrow enough that it genuinely can. */
  return metres >= 1000
    ? `${Number((metres / 1000).toFixed(metres % 1000 === 0 ? 0 : 1))}\u00a0km`
    : `${metres}\u00a0m`;
}

export function ScaleBar({
  latitude,
  zoom,
  maxPx = 108,
  className = "",
}: {
  latitude: number;
  zoom: number;
  /** The bar is drawn at whatever width the round distance occupies, never wider. */
  maxPx?: number;
  className?: string;
}) {
  const mpp = metresPerPixel(latitude, zoom);
  const metres = niceDistance(maxPx * mpp);
  /* A degenerate projection (zoom not yet fitted, latitude missing) must draw
     NOTHING rather than a bar reading "0 m" — an absent scale is honest, a
     zero one is not. */
  if (!metres || !Number.isFinite(mpp) || mpp <= 0) return null;
  const px = Math.round(metres / mpp);

  return (
    <div className={`flex flex-col items-start gap-1 ${className}`}>
      <svg width={px} height="9" viewBox={`0 0 ${px} 9`} aria-hidden="true" className="block">
        {/* Alternating filled and open cells — the checker is what makes a bar
            readable at a glance as a scale rather than as a rule or a divider.
            Four cells, so the reader can also halve and quarter it by eye. */}
        {[0, 1, 2, 3].map((i) => (
          <rect
            key={i}
            x={(px / 4) * i}
            y="2.5"
            width={px / 4}
            height="4"
            fill={i % 2 === 0 ? "currentColor" : "none"}
            stroke="currentColor"
            strokeWidth="0.9"
          />
        ))}
        {/* End ticks, full height: they mark where the measurement starts and
            stops, which the bar's own corners do not do unambiguously once it
            sits on a photograph or a map tile. */}
        <path
          d={`M0.45 0 V9 M${px - 0.45} 0 V9`}
          stroke="currentColor"
          strokeWidth="0.9"
          fill="none"
        />
      </svg>
      <span className="ledger tabular-nums text-micro tracking-brand">{label(metres)}</span>
    </div>
  );
}
