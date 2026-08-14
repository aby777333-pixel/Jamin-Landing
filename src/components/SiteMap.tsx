import type { ReactNode } from "react";

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
      <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-canvas-sunken shadow-lift sm:aspect-[2/1]">
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
          <svg width="34" height="45" viewBox="0 0 30 40" aria-label={`${title} location`}>
            <ellipse cx="15" cy="38" rx="6" ry="2" fill="rgba(23,24,28,0.28)" />
            <path
              d="M15 39C15 39 28 24.5 28 14.5A13 13 0 1 0 2 14.5C2 24.5 15 39 15 39Z"
              style={{ fill: "var(--color-cta)", stroke: "var(--color-canvas)" }}
              strokeWidth="2"
            />
            <circle cx="15" cy="14.5" r="4.5" style={{ fill: "var(--color-canvas)" }} />
          </svg>
        </div>

        {/* The layout's name, on the map itself. A pin with no label makes you
            check the heading again to be sure which project you are looking at. */}
        <span className="glass rj-crystal pointer-events-none absolute left-3 top-3 max-w-[70%] truncate rounded-full px-3 py-1.5 text-tiny font-medium text-ink">
          {title}
        </span>

        <span className="absolute bottom-0 right-0 rounded-tl-md bg-canvas/90 px-2 py-0.5 text-[10px] text-ink-muted">
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

      {/* Four ways to look at the same coordinates. They were four identical
          grey pills, which made them read as one control repeated; each now
          carries its own icon and its own tone so the eye can pick the one it
          wants without reading all four. */}
      <div className="mt-phi3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MapLink
          href={maps}
          label="Open in Maps"
          note="Directions"
          tint="bg-jamin-red-soft text-jamin-red-deep"
          ring="hover:border-jamin-red/40"
          icon={
            <>
              <path d="M12 21s7-6.2 7-11a7 7 0 1 0-14 0c0 4.8 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.6" />
            </>
          }
        />
        <MapLink
          href={sat}
          label="Satellite"
          note="From above"
          tint="bg-canvas-sunken text-graphite"
          ring="hover:border-graphite/40"
          icon={
            <>
              <path d="M3 12a9 9 0 0 1 9-9" />
              <path d="M7.5 12A4.5 4.5 0 0 1 12 7.5" />
              <circle cx="12" cy="12" r="1.6" />
              <path d="M14 14l6 6M20 14l-6 6" />
            </>
          }
        />
        <MapLink
          href={sv}
          label="Street View"
          note="Stand there"
          tint="bg-canopy-soft text-canopy"
          ring="hover:border-canopy/40"
          icon={
            <>
              <circle cx="12" cy="6" r="3" />
              <path d="M8 21v-5.5a4 4 0 0 1 4-4 4 4 0 0 1 4 4V21" />
              <path d="M10 21v-4M14 21v-4" />
            </>
          }
        />
        <MapLink
          href={earth}
          label="Earth"
          note="In 3D"
          tint="bg-jamin-gold-soft text-jamin-gold-ink"
          ring="hover:border-jamin-gold/60"
          icon={
            <>
              <circle cx="12" cy="12" r="9" />
              <path d="M3 12h18" />
              <path d="M12 3a14 14 0 0 1 0 18 14 14 0 0 1 0-18Z" />
            </>
          }
        />
      </div>
      <p className="mt-phi2 text-tiny tabular-nums text-ink-faint">
        Pin: {lat.toFixed(6)}, {lng.toFixed(6)}
      </p>
    </div>
  );
}

/**
 * One way of looking at the site. Every one of these leaves for Google, so it
 * says so with the arrow and opens in a new tab rather than losing the page the
 * visitor was reading.
 */
function MapLink({
  href,
  label,
  note,
  icon,
  tint,
  ring,
}: {
  href: string;
  label: string;
  note: string;
  icon: ReactNode;
  tint: string;
  ring: string;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`group flex items-center gap-2.5 rounded-card border border-line bg-canvas px-3 py-2.5 transition-all duration-500 hover:-translate-y-0.5 hover:shadow-lift ${ring}`}
      style={{ transitionTimingFunction: "var(--ease-silk)" }}
    >
      <span
        aria-hidden="true"
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-[11px] ${tint}`}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {icon}
        </svg>
      </span>
      <span className="min-w-0">
        <span className="block truncate text-tiny font-semibold uppercase tracking-[0.1em] text-ink">
          {label}
        </span>
        <span className="block truncate text-micro text-ink-faint">{note}</span>
      </span>
      <span
        aria-hidden="true"
        className="ml-auto text-tiny text-ink-faint transition-transform duration-500 group-hover:translate-x-0.5"
      >
        ↗
      </span>
    </a>
  );
}
