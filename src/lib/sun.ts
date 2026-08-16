/**
 * Where the sun actually is over this site, at a given instant.
 *
 * 🚨 THIS IS A REAL EPHEMERIS, NOT A PRETTY ARC. The 3D view exists to answer a
 * question a buyer genuinely asks about a plot — which way does it face, where
 * does the shade fall in the afternoon, does the west wall cop the evening sun —
 * and a decorative light sweeping a made-up path would answer it wrongly while
 * looking convincing. So the altitude and azimuth come from the standard
 * low-precision solar position algorithm (Meeus, as popularised by SunCalc),
 * good to well under a degree, which is far finer than the geometry it lights.
 *
 * ⚠️ Accuracy claim, stated honestly: the SUN is accurate; the SITE it shines on
 * is a traced model whose own sheet disagrees with itself by 16%. Shadow
 * DIRECTION is trustworthy, shadow LENGTH inherits the model's scale. Nothing in
 * the UI should invite a reader to measure a shadow.
 */

const RAD = Math.PI / 180;
const DAY_MS = 86_400_000;
const J1970 = 2_440_588;
const J2000 = 2_451_545;
/** Obliquity of the ecliptic. */
const E = RAD * 23.4397;

const toDays = (d: Date) => d.valueOf() / DAY_MS - 0.5 + J1970 - J2000;

export type SunPosition = {
  /** Radians above the horizon. Negative is below — i.e. night. */
  altitude: number;
  /** Radians, measured CLOCKWISE FROM NORTH. */
  azimuth: number;
};

export function sunPosition(date: Date, lat: number, lng: number): SunPosition {
  const d = toDays(date);

  const M = RAD * (357.5291 + 0.98560028 * d);
  const C = RAD * (1.9148 * Math.sin(M) + 0.02 * Math.sin(2 * M) + 0.0003 * Math.sin(3 * M));
  const L = M + C + RAD * 102.9372 + Math.PI;

  const dec = Math.asin(Math.sin(E) * Math.sin(L));
  const ra = Math.atan2(Math.sin(L) * Math.cos(E), Math.cos(L));

  const lw = RAD * -lng;
  const H = RAD * (280.16 + 360.9856235 * d) - lw - ra;
  const phi = RAD * lat;

  const altitude = Math.asin(
    Math.sin(phi) * Math.sin(dec) + Math.cos(phi) * Math.cos(dec) * Math.cos(H),
  );
  /* ⚠️ The source algorithm measures azimuth from SOUTH going west. Every other
     thing in this codebase that has a bearing — the compass rose this layout was
     registered against, `facing` on a plot — measures clockwise from NORTH. Add
     pi once, here, rather than leaving a south-based angle to be misread by
     whichever component consumes it next. */
  const azimuth =
    Math.atan2(Math.sin(H), Math.cos(H) * Math.sin(phi) - Math.tan(dec) * Math.cos(phi)) +
    Math.PI;

  return { altitude, azimuth };
}

/**
 * Unit vector pointing at the sun, in the scene's frame.
 *
 * ⚠️ THE FRAME IS FIXED BY THE DRAWING, NOT CHOSEN. The layout was traced off a
 * sheet whose compass rose measures within 0.2 deg of vertical, so **-y in plan
 * space is true north**. The scene maps plan (x, y) to world (x, ·, y), which
 * puts north at -Z and east at +X. Anything that assumes +Z is north will
 * mirror every shadow on the site.
 */
export function sunVector({ altitude, azimuth }: SunPosition): [number, number, number] {
  const h = Math.cos(altitude);
  return [h * Math.sin(azimuth), Math.sin(altitude), -h * Math.cos(azimuth)];
}

/** IST is UTC+5:30 and India has no daylight saving, so one constant is right. */
export const IST_OFFSET_MIN = 330;

/**
 * Build a Date for `hour` (local IST, fractional) on the given local day.
 *
 * ⚠️ Constructed in UTC deliberately. `new Date(y, m, d, h)` uses the VIEWER's
 * timezone, so the same slider position would put the sun somewhere different
 * for a buyer in Dubai than for one in Salem — and the whole point is where the
 * sun is over the LAND.
 */
export function istDate(year: number, month: number, day: number, hour: number): Date {
  return new Date(Date.UTC(year, month, day, 0, 0, 0) + (hour * 60 - IST_OFFSET_MIN) * 60_000);
}
