import { ButtonLink } from "./ui";

/**
 * Where the land actually is (§17).
 *
 * Built from OpenStreetMap raster tiles as plain <img> elements — no mapping
 * library, no API key, no client JavaScript at all. The app took the same
 * approach for the same reason: a slippy-map bundle is a lot of weight to carry
 * for a picture that never needs to move.
 *
 * ⚠️ The tile grid is deliberately capped. An uncapped grid on a wide monitor
 * would pull close to a hundred tiles per view, which abuses OSM's tile usage
 * policy. Attribution is required by that policy and is shown.
 */

const TILE = 256;
const COLS = 5;
const ROWS = 3;
const ZOOM = 15;

function lngToX(lng: number, z: number) {
  return ((lng + 180) / 360) * 2 ** z;
}
function latToY(lat: number, z: number) {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
}

export function SiteMap({
  lat,
  lng,
  title,
  gmapsUrl,
  streetViewUrl,
  earthUrl,
}: {
  lat: number;
  lng: number;
  title: string;
  gmapsUrl?: string | null;
  streetViewUrl?: string | null;
  earthUrl?: string | null;
}) {
  const fx = lngToX(lng, ZOOM);
  const fy = latToY(lat, ZOOM);
  const cx = Math.floor(fx);
  const cy = Math.floor(fy);
  // How far the pin sits inside its own tile, so the grid can be nudged to put
  // the pin exactly in the middle of the frame.
  const offX = (fx - cx - 0.5) * TILE;
  const offY = (fy - cy - 0.5) * TILE;

  const tiles: { x: number; y: number; url: string }[] = [];
  const half = { c: (COLS - 1) / 2, r: (ROWS - 1) / 2 };
  for (let r = -half.r; r <= half.r; r++) {
    for (let c = -half.c; c <= half.c; c++) {
      const tx = cx + c;
      const ty = cy + r;
      const max = 2 ** ZOOM;
      if (ty < 0 || ty >= max) continue;
      tiles.push({
        x: c + half.c,
        y: r + half.r,
        url: `https://tile.openstreetmap.org/${ZOOM}/${((tx % max) + max) % max}/${ty}.png`,
      });
    }
  }

  // Fall back to coordinate-derived links when the admin has not set one.
  const maps = gmapsUrl || `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
  const sat = `https://www.google.com/maps/@?api=1&map_action=map&center=${lat},${lng}&zoom=17&basemap=satellite`;
  const sv =
    streetViewUrl ||
    `https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${lat},${lng}`;
  const earth = earthUrl || `https://earth.google.com/web/@${lat},${lng},1000a,1000d,35y,0h,0t,0r`;

  return (
    <div>
      <div className="relative aspect-[16/10] overflow-hidden rounded-card border border-line bg-canvas-sunken sm:aspect-[2/1]">
        <div
          className="absolute left-1/2 top-1/2"
          style={{
            width: COLS * TILE,
            height: ROWS * TILE,
            transform: `translate(calc(-50% - ${offX}px), calc(-50% - ${offY}px))`,
          }}
        >
          {tiles.map((t) => (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              key={`${t.x}-${t.y}`}
              src={t.url}
              alt=""
              aria-hidden="true"
              width={TILE}
              height={TILE}
              loading="lazy"
              className="absolute max-w-none"
              style={{ left: t.x * TILE, top: t.y * TILE }}
            />
          ))}
        </div>

        {/* the pin sits at the exact centre of the frame by construction */}
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full">
          <svg width="30" height="40" viewBox="0 0 30 40" aria-label={`${title} location`}>
            <path
              d="M15 39C15 39 28 24.5 28 14.5A13 13 0 1 0 2 14.5C2 24.5 15 39 15 39Z"
              fill="#E11B22"
              stroke="#FFFDFA"
              strokeWidth="2"
            />
            <circle cx="15" cy="14.5" r="4.5" fill="#FFFDFA" />
          </svg>
        </div>

        <span className="absolute bottom-0 right-0 bg-canvas/85 px-2 py-0.5 text-[10px] text-ink-muted">
          ©{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            OpenStreetMap
          </a>{" "}
          contributors
        </span>
      </div>

      <div className="mt-phi3 flex flex-wrap gap-2">
        <ButtonLink href={maps} variant="secondary">
          Open in Maps
        </ButtonLink>
        <ButtonLink href={sat} variant="secondary">
          Satellite
        </ButtonLink>
        <ButtonLink href={sv} variant="secondary">
          Street View
        </ButtonLink>
        <ButtonLink href={earth} variant="secondary">
          Earth
        </ButtonLink>
      </div>
      <p className="mt-phi2 text-tiny text-ink-faint">
        Pin: {lat.toFixed(6)}, {lng.toFixed(6)}
      </p>
    </div>
  );
}
