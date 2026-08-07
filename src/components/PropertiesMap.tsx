"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { locationLine, phaseLabel, propertyHref, type Property } from "@/lib/properties";

/**
 * The map view (§17, §76): every development on one frame, pin linked to card.
 *
 * Same OpenStreetMap raster approach as the single-property map, for the same
 * reasons — no library, no API key, and a hard cap on tiles so we stay inside
 * OSM's usage policy. The zoom is derived from the bounding box of the pins
 * rather than fixed, so the frame stays right if Jamin buys land three hundred
 * kilometres from here.
 */

const TILE = 256;
const COLS = 5;
const ROWS = 3;
const MIN_Z = 4;
const MAX_Z = 13;

const lngToX = (lng: number, z: number) => ((lng + 180) / 360) * 2 ** z;
const latToY = (lat: number, z: number) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** z;
};

export function PropertiesMap({ items }: { items: Property[] }) {
  const [active, setActive] = useState<string | null>(null);

  const pinned = useMemo(
    () => items.filter((p) => p.lat != null && p.lng != null),
    [items],
  );

  const view = useMemo(() => {
    if (pinned.length === 0) return null;
    const lats = pinned.map((p) => Number(p.lat));
    const lngs = pinned.map((p) => Number(p.lng));
    const centreLat = (Math.min(...lats) + Math.max(...lats)) / 2;
    const centreLng = (Math.min(...lngs) + Math.max(...lngs)) / 2;

    // Largest zoom at which every pin still fits inside the capped grid, with
    // a tile of breathing room on each side.
    let z = MAX_Z;
    for (; z > MIN_Z; z--) {
      const xs = lngs.map((l) => lngToX(l, z) * TILE);
      const ys = lats.map((l) => latToY(l, z) * TILE);
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      if (w <= (COLS - 1.4) * TILE && h <= (ROWS - 1.2) * TILE) break;
    }
    return { z, centreLat, centreLng };
  }, [pinned]);

  if (!view) {
    return (
      <p className="rounded-card border border-line bg-canvas-alt px-phi3 py-phi4 text-base text-ink-muted">
        None of these developments has a map pin recorded yet.
      </p>
    );
  }

  const { z, centreLat, centreLng } = view;
  const fx = lngToX(centreLng, z);
  const fy = latToY(centreLat, z);
  const cx = Math.floor(fx);
  const cy = Math.floor(fy);
  const offX = (fx - cx - 0.5) * TILE;
  const offY = (fy - cy - 0.5) * TILE;

  const tiles: { c: number; r: number; url: string }[] = [];
  const half = { c: (COLS - 1) / 2, r: (ROWS - 1) / 2 };
  const max = 2 ** z;
  for (let r = -half.r; r <= half.r; r++) {
    for (let c = -half.c; c <= half.c; c++) {
      const ty = cy + r;
      if (ty < 0 || ty >= max) continue;
      tiles.push({
        c: c + half.c,
        r: r + half.r,
        url: `https://tile.openstreetmap.org/${z}/${(((cx + c) % max) + max) % max}/${ty}.png`,
      });
    }
  }

  /** Pin position measured from the centre of the frame, in CSS pixels. */
  const pinOffset = (p: Property) => ({
    x: (lngToX(Number(p.lng), z) - fx) * TILE,
    y: (latToY(Number(p.lat), z) - fy) * TILE,
  });

  return (
    <div className="grid gap-phi3 lg:grid-cols-[1.618fr_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-canvas-sunken sm:aspect-[16/10]">
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
              key={`${t.c}-${t.r}`}
              src={t.url}
              alt=""
              aria-hidden="true"
              width={TILE}
              height={TILE}
              loading="lazy"
              className="absolute max-w-none"
              style={{ left: t.c * TILE, top: t.r * TILE }}
            />
          ))}
        </div>

        {pinned.map((p) => {
          const o = pinOffset(p);
          const on = active === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(on ? null : p.id)}
              aria-label={`${p.title} — ${locationLine(p)}`}
              className="absolute -translate-x-1/2 -translate-y-full transition-transform duration-300 hover:scale-110"
              style={{
                left: `calc(50% + ${o.x}px)`,
                top: `calc(50% + ${o.y}px)`,
                zIndex: on ? 20 : 10,
              }}
            >
              <svg width={on ? 34 : 26} height={on ? 45 : 35} viewBox="0 0 30 40">
                <path
                  d="M15 39C15 39 28 24.5 28 14.5A13 13 0 1 0 2 14.5C2 24.5 15 39 15 39Z"
                  fill={on ? "#17181C" : "#E11B22"}
                  stroke="#FFFDFA"
                  strokeWidth="2"
                />
                <circle cx="15" cy="14.5" r="4.5" fill="#FFFDFA" />
              </svg>
            </button>
          );
        })}

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

      {/* the list beside the map — selecting a pin highlights its row (§86) */}
      <ul className="space-y-2">
        {pinned.map((p) => {
          const on = active === p.id;
          return (
            <li key={p.id}>
              <Link
                href={propertyHref(p)}
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                className={`block rounded-card border px-phi3 py-phi2 transition-colors ${
                  on ? "border-ink bg-canvas" : "border-line bg-canvas-alt hover:border-ink-faint"
                }`}
              >
                <div className="text-micro font-semibold uppercase tracking-[0.14em] text-jamin-gold">
                  {phaseLabel(p)}
                </div>
                <div className="mt-1 text-base text-ink">{p.title}</div>
                <div className="mt-0.5 text-tiny text-ink-muted">{locationLine(p)}</div>
              </Link>
            </li>
          );
        })}
        {items.length > pinned.length && (
          <li className="px-phi3 py-phi2 text-tiny text-ink-faint">
            {items.length - pinned.length} development
            {items.length - pinned.length === 1 ? "" : "s"} without a map pin are not shown here.
          </li>
        )}
      </ul>
    </div>
  );
}
