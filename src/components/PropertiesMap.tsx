"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  approvalBadges,
  formatArea,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  type Property,
} from "@/lib/properties";
import { NorthArrow } from "@/components/cadastral/NorthArrow";
import { ScaleBar } from "@/components/cadastral/ScaleBar";
import { PlanSkeleton } from "@/components/cadastral/PlanSkeleton";

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

/** Room for the pin graphic and its label, so a marker on the edge of the
 *  bounding box is not half off the frame. */
const PIN_INSET = 56;

export function PropertiesMap({
  items,
  /**
   * The selected district, when the map is being used as a district explorer.
   *
   * ⚠️ IT DRAWS A HALO AROUND THE PROJECTS, NOT A DISTRICT BOUNDARY, and the
   * difference matters on this site more than on most. We hold no administrative
   * geometry — no district polygon, no survey outline — so anything shaped like
   * a boundary would be invented, and inventing a boundary on a page about land
   * is exactly the kind of claim the rest of this codebase refuses to make. What
   * IS true is where the pins are, so the halo is fitted to the pins and the
   * label counts them. It is deliberately a soft disc with no hard edge: a
   * crisp outline reads as a border, a wash reads as "around here".
   */
  district = null,
}: {
  items: Property[];
  district?: string | null;
}) {
  const [active, setActive] = useState<string | null>(null);

  /** Escape closes the open card, like every other overlay on the site. */
  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setActive(null);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [active]);

  /**
   * ⚠️ The zoom has to be fitted to the FRAME, not to the tile plane.
   *
   * It used to be chosen so every pin fell inside the 5x3 tile grid — 1280x768
   * px. The frame that is actually visible crops that plane, and on a phone it
   * is about 335x251, so a zoom that "fitted" could leave a quarter of the pins
   * outside the window. It looked correct on a laptop purely because the frame
   * there is close to the plane's own size. Measuring the real box is the only
   * thing that makes the fit true at every width.
   */
  const frameRef = useRef<HTMLDivElement>(null);
  const [frame, setFrame] = useState<{ w: number; h: number } | null>(null);

  useEffect(() => {
    const el = frameRef.current;
    if (!el) return;

    const measure = () => {
      const r = el.getBoundingClientRect();
      if (!r.width || !r.height) return;
      setFrame((prev) =>
        prev && Math.abs(prev.w - r.width) < 1 && Math.abs(prev.h - r.height) < 1
          ? prev
          : { w: r.width, h: r.height },
      );
    };

    // ⚠️ Three ways in, because one is not reliable enough.
    //
    // `ResizeObserver` is the right instrument but it is delivered through the
    // rendering pipeline, so it does not fire while the page is not producing
    // frames — a background tab, or a preview pane that is not on screen. On
    // its own the map would then keep the fallback zoom until something forced
    // a resize. The timeout seeds the first measurement regardless, and the
    // window listener covers orientation changes on devices where the observer
    // is throttled.
    const t = setTimeout(measure, 0);
    window.addEventListener("resize", measure, { passive: true });
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    ro?.observe(el);

    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", measure);
      ro?.disconnect();
    };
  }, []);

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

    // Until the frame has been measured, fall back to the tile plane so the
    // server render and the first paint still produce a usable map.
    const availW = Math.max(120, (frame?.w ?? (COLS - 1.4) * TILE) - PIN_INSET * 2);
    const availH = Math.max(120, (frame?.h ?? (ROWS - 1.2) * TILE) - PIN_INSET * 2);

    let z = MAX_Z;
    for (; z > MIN_Z; z--) {
      const xs = lngs.map((l) => lngToX(l, z) * TILE);
      const ys = lats.map((l) => latToY(l, z) * TILE);
      const w = Math.max(...xs) - Math.min(...xs);
      const h = Math.max(...ys) - Math.min(...ys);
      if (w <= availW && h <= availH) break;
    }
    return { z, centreLat, centreLng };
  }, [pinned, frame]);

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

  /**
   * The halo: centred on the pins it contains, sized to reach the furthest of
   * them plus room for the pin graphic itself.
   *
   * ⚠️ The floor matters more than the fit. Most districts here hold one
   * project, and a radius fitted to a single pin is zero — the highlight would
   * vanish on exactly the case a reader is most likely to select. 96px is about
   * three pin-heights, which reads as "this area" rather than as a dot.
   */
  const halo = (() => {
    if (!district || pinned.length === 0) return null;
    const os = pinned.map(pinOffset);
    const cxp = os.reduce((s, o) => s + o.x, 0) / os.length;
    const cyp = os.reduce((s, o) => s + o.y, 0) / os.length;
    const reach = Math.max(...os.map((o) => Math.hypot(o.x - cxp, o.y - cyp)));
    return { x: cxp, y: cyp, r: Math.max(96, reach + 56) };
  })();

  const openCard = active ? pinned.find((p) => p.id === active) ?? null : null;

  return (
    <div className="grid gap-phi3 lg:grid-cols-[1.618fr_1fr]">
      <div
        ref={frameRef}
        /* ⚠️ From `lg` the frame STRETCHES to the row rather than holding an
           aspect ratio: `h-full` in a grid row whose height is set by the list
           beside it, so the map reaches the same bottom border instead of
           leaving a band of empty card under it. The aspect ratios still govern
           below `lg`, where the two stack and there is no row to fill, and
           `min-h` protects the case where the list is one item long.
           `PropertiesMap` measures its own frame and refits the zoom, so a
           taller box simply shows more map — nothing else has to change. */
        className="rj-crosshair relative aspect-[4/3] overflow-hidden rounded-card border border-line bg-canvas-sunken sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[24rem]"
      >
        {/* The ground the tiles land on. Until now this frame was an empty
            `bg-canvas-sunken` box while OSM fetched — a grey rectangle that says
            nothing about what is coming. A layout tracing itself does, and the
            tiles paint straight over it as they arrive, so it needs no state
            and no cleanup. */}
        <PlanSkeleton className="absolute inset-0 flex items-center justify-center p-6" />

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

        {/* The district halo, under the pins. Two stops rather than a flat
            disc — a flat one has an edge wherever its alpha ends, which is the
            border this must not draw. */}
        {halo && (
          <>
            <span
              aria-hidden="true"
              className="pointer-events-none absolute rounded-full"
              style={{
                left: `calc(50% + ${halo.x - halo.r}px)`,
                top: `calc(50% + ${halo.y - halo.r}px)`,
                width: halo.r * 2,
                height: halo.r * 2,
                zIndex: 5,
                background:
                  "radial-gradient(circle, color-mix(in srgb, var(--color-cta) 22%, transparent) 0%, color-mix(in srgb, var(--color-cta) 14%, transparent) 62%, transparent 100%)",
              }}
            />
            {/* The label is the only thing here making a claim, so it says
                exactly what is true: the district, and how many of its projects
                are pinned inside this circle. */}
            <span
              className="pointer-events-none absolute -translate-x-1/2 whitespace-nowrap rounded-full bg-ink/85 px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-white backdrop-blur"
              style={{
                left: `calc(50% + ${halo.x}px)`,
                top: `calc(50% + ${halo.y - halo.r - 12}px)`,
                zIndex: 6,
              }}
            >
              {district} · {pinned.length} project{pinned.length === 1 ? "" : "s"}
            </span>
          </>
        )}

        {pinned.map((p) => {
          const o = pinOffset(p);
          const on = active === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => setActive(on ? null : p.id)}
              aria-label={`${p.title} — ${locationLine(p)}`}
              aria-expanded={on}
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
                  style={{ fill: on ? "var(--color-ink)" : "var(--color-cta)", stroke: "var(--color-canvas)" }}
                  strokeWidth="2"
                />
                <circle cx="15" cy="14.5" r="4.5" style={{ fill: "var(--color-canvas)" }} />
              </svg>
            </button>
          );
        })}

        {/* ── THE PIN CARD ────────────────────────────────────────────────────
            Anchored to the pin, clamped to the frame.

            ⚠️ The clamp is why the frame is measured. The card is 260px wide
            and sits above a pin that may be anywhere — including hard against
            an edge, which is common because the zoom is fitted to the bounding
            box of the pins, so there is ALWAYS a pin near each side. Without
            the clamp the card hangs outside the map on those, and `overflow:
            hidden` on the frame cuts it in half. `frame` is null only for the
            first paint before the measurement lands; the fallback keeps the
            card centred rather than mispositioned.

            ⚠️ It flips BELOW the pin when there is not room above. A pin in the
            top row of the bounding box is the normal case, not the edge case. */}
        {openCard && (() => {
          const o = pinOffset(openCard);
          const W = frame?.w ?? (COLS - 1.4) * TILE;
          const H = frame?.h ?? (ROWS - 1.2) * TILE;
          const CARD_W = 260;
          /* ⚠️ THE CARD HAS TO FIT THE FRAME, NOT JUST BE PLACED IN IT. This
             estimate went 180 → 290 → 236 across three attempts, and the middle
             one is the instructive failure: at 290 the arithmetic was right and
             the card STILL got cut, because the frame on a one-project district
             is only about 350px tall and the card as first written needed over
             300. Positioning cannot rescue a card that does not fit — the
             content had to come down too, which is why the body below is a
             single facts row with the approval chip folded up beside the phase
             label rather than a stack of sections.
             `maxHeight` on the card is the backstop for the case this estimate
             is still wrong: it scrolls rather than being sliced. */
          const CARD_H = 236;
          const GAP = 14;

          /* Frame-relative, in plain pixels. ⚠️ No transforms: the first build
             anchored with `translate(-50%,-100%)` and could only clamp the
             horizontal, so a pin in the upper half pushed the card straight
             through the top edge — and the frame is `overflow-hidden`, so it
             was sliced rather than merely overhanging. Positioning outright
             lets both axes be clamped by the same arithmetic. */
          const px = W / 2 + o.x;
          const py = H / 2 + o.y;

          const left = Math.min(Math.max(px - CARD_W / 2, 8), Math.max(8, W - CARD_W - 8));
          const above = py - GAP - CARD_H;
          const below = py + GAP;
          /* Prefer above the pin — it is the pin that is being pointed at, and a
             card under it hides the place. Fall back to below, then to whatever
             fits, so a short frame still shows a whole card. */
          const top =
            above >= 8
              ? above
              : below + CARD_H <= H - 8
                ? below
                : Math.max(8, H - CARD_H - 8);

          const area = formatArea(openCard);
          const approvals = approvalBadges(openCard);
          return (
            <div
              role="dialog"
              aria-label={openCard.title}
              className="absolute w-[260px] overflow-y-auto rounded-card border border-line bg-canvas p-phi3 shadow-raise"
              style={{ left, top, zIndex: 30, maxHeight: Math.max(140, H - 16) }}
            >
              <button
                type="button"
                onClick={() => setActive(null)}
                aria-label="Close"
                className="absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-ink-faint transition-colors hover:bg-canvas-alt hover:text-ink"
              >
                <svg viewBox="0 0 12 12" className="h-3 w-3" aria-hidden="true">
                  <path d="M2 2l8 8M10 2l-8 8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                </svg>
              </button>

              {/* The stage and the approval on ONE line — the approval used to
                  have a row of its own, which is 30px this card cannot spare. */}
              <div className="flex flex-wrap items-center gap-2 pr-6 text-micro font-semibold uppercase tracking-[0.14em]">
                <span className="text-jamin-gold-ink">{phaseLabel(openCard)}</span>
                {approvals.map((a) => (
                  <span
                    key={a}
                    /* `rj-sweep rj-foil-scroll` — this seal has no `rj-glint`,
                       so until now it was gold that never once caught the
                       light. The scroll timeline gives it the same one-shot
                       band on every device instead of only where hover exists. */
                    className="rj-foil-seal rj-sweep rj-foil-scroll inline-flex items-center rounded-full px-2 py-0.5 tracking-[0.1em] text-champagne-900"
                  >
                    {a}
                  </span>
                ))}
              </div>

              <div className="mt-1 line-clamp-2 text-base text-ink">{openCard.title}</div>
              {/* Clamped: these addresses run to three and four lines, and every
                  extra line here is one the button loses. */}
              <div className="mt-0.5 line-clamp-2 text-tiny leading-relaxed text-ink-muted">
                {locationLine(openCard)}
              </div>

              {/* Real fields only, and only the ones this record actually has —
                  the same rule the property card follows. `flex-nowrap` with
                  `min-w-0` cells so three facts stay on one line instead of
                  wrapping into a second row. */}
              {(area || openCard.plots_total) && (
                <dl className="mt-phi2 flex items-baseline gap-x-phi2 border-t border-line pt-phi2">
                  {area && (
                    <div className="min-w-0">
                      <dt className="ledger-label">Extent</dt>
                      <dd className="ledger truncate text-tiny text-ink">{area}</dd>
                    </div>
                  )}
                  {openCard.plots_total ? (
                    <div className="min-w-0">
                      <dt className="ledger-label">Plots</dt>
                      <dd className="ledger text-tiny text-ink">{openCard.plots_total}</dd>
                    </div>
                  ) : null}
                  {isSellable(openCard) && openCard.plots_available != null && openCard.plots_total ? (
                    <div className="min-w-0">
                      <dt className="ledger-label">Available</dt>
                      <dd className="ledger text-tiny text-ink">
                        {openCard.plots_available} / {openCard.plots_total}
                      </dd>
                    </div>
                  ) : null}
                </dl>
              )}

              <Link
                href={propertyHref(openCard)}
                className="mt-phi2 block rounded-full bg-cta px-4 py-2 text-center text-tiny font-semibold uppercase tracking-[0.1em] text-white transition-colors hover:bg-jamin-red-deep"
              >
                View project
              </Link>
            </div>
          );
        })()}

        {/* Drawing-office furniture. Both are TRUE here: these are Web Mercator
            tiles, which are north-up by construction and never rotated, and the
            bar is computed from this frame's own fitted `z` and centre latitude
            rather than drawn to a fixed width. `pointer-events-none` so neither
            steals a click meant for a pin, and both sit bottom-LEFT because the
            OSM attribution owns bottom-right and must not be obscured. */}
        <div className="pointer-events-none absolute bottom-1.5 left-2 flex items-end gap-3 text-ink-muted mix-blend-multiply">
          <NorthArrow />
          <ScaleBar latitude={centreLat} zoom={z} />
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

      {/* the list beside the map — selecting a pin highlights its row (§86) */}
      <ul className="space-y-2">
        {pinned.map((p) => {
          const on = active === p.id;
          return (
            <li key={p.id}>
              {/* 🚨 EACH ROW WARMS TO ITS OWN STAGE ON HOVER (owner, 2026-08-13:
                  "on mouse over can we have different subtle colours").
                  ⚠️ The colour is not decoration and it is not new: it is the
                  STAGE this development is at, in tokens the site already owns —
                  canopy for land secured, gold for work in progress, earth for
                  what is finished and handed over. Four identical grey rows told
                  the reader nothing; four that warm differently tell them where
                  each project is before they read a word.
                  ⚠️ The SELECTED row stays `border-ink bg-canvas`. Selection and
                  stage are two different facts and must not share a channel —
                  the same reason the time slots keep red when chosen. */}
              <Link
                href={propertyHref(p)}
                onMouseEnter={() => setActive(p.id)}
                onFocus={() => setActive(p.id)}
                className={`block rounded-card border px-phi3 py-phi2 transition-colors duration-300 ${
                  on
                    ? "border-ink bg-canvas"
                    : `border-line bg-canvas-alt hover:border-ink-faint ${phaseHover(p)}`
                }`}
              >
                <div className="text-micro font-semibold uppercase tracking-[0.14em] text-jamin-gold-ink">
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

/**
 * The hover tint for a project row, keyed to the stage it is at.
 *
 * ⚠️ EXISTING TOKENS ONLY, and each one is chosen rather than assigned:
 * `canopy` for land secured and planning under way (green, nothing built yet),
 * `jamin-gold` for work in progress (the site's colour for a thing happening
 * now), `earth` for delivered and handed over (the ground, settled). A stage
 * with no match falls through to the neutral hover the row already had, so a
 * new phase in the database cannot produce a colour nobody chose.
 */
function phaseHover(p: { project_phase?: string | null }): string {
  switch (p.project_phase) {
    case "future":
    case "current":
      return "hover:border-canopy/30 hover:bg-canopy-soft";
    case "ongoing":
      return "hover:border-jamin-gold/35 hover:bg-jamin-gold-soft";
    case "completed":
      return "hover:border-earth/30 hover:bg-earth/8";
    default:
      return "";
  }
}
