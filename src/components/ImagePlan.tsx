"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  PLOT_STATUS,
  plotStatus,
  plotStatusKey,
  plotArea,
  type PlanImage,
  type PlanImageShape,
  type Plot,
  type PlotPlan,
  type PlotStatus,
} from "@/lib/properties";
import { PlotSheet } from "@/components/MasterPlan";
import { PlanMeasure } from "@/components/cadastral/PlanMeasure";
import type { Unit } from "@/lib/units";

/**
 * 🚨 THE APPROVED LAYOUT IMAGE, MADE INTERACTIVE (owner's brief 2026-09-17).
 *
 * "Replace the programmatically drawn rectangular blocks with the actual
 * layout plan… the image must remain visually authentic. All interactivity
 * should be implemented through a separate, precisely aligned overlay."
 *
 * HOW IT STAYS ALIGNED — ONE TRANSFORM, TWO LAYERS.
 * The stage is a W×H box in the IMAGE'S OWN PIXEL SPACE. The <img> fills it and
 * the <svg viewBox="0 0 W H"> sits exactly on top of it; the plot polygons are
 * stored normalised (0..1) and multiplied by W/H. Zoom and pan are a single CSS
 * `translate() scale()` on the stage, so the picture and every polygon move
 * together — there is no second coordinate system that could drift.
 *
 * ⚠️ THE IMAGE IS NEVER DRAWN ON. Status tints are translucent, off for
 * nothing-to-say states, and the numbers and dimensions printed on the plan
 * stay readable under every one of them. Roads and open space are highlighted
 * only when the reader asks for them.
 *
 * ⚠️ SELECTION IS A HIT TEST, NOT A CLICK ON THE SVG. A tap that became a pan
 * must not select, and a pan that started on a polygon must not be swallowed by
 * it. So the container owns every pointer; a pointer-up that did not travel is
 * converted to image coordinates through the current transform and tested
 * against the polygons (point-in-polygon, topmost plot wins). The polygons
 * themselves stay focusable buttons for the keyboard.
 *
 * The plot record, the enquiry routes and the approval rows are the SAME
 * PlotSheet the traced plan uses — a buyer sees one record whichever view they
 * picked.
 */

type Tx = { s: number; x: number; y: number };

/* Overlay defaults. Admin overrides arrive in `image.style.status[state]`. */
const DEFAULT_TINT: Record<PlotStatus, { color: string; opacity: number }> = {
  available: { color: "#1f8a5b", opacity: 0.1 },
  reserved: { color: "#c9962c", opacity: 0.3 },
  booked: { color: "#c8102e", opacity: 0.3 },
  sold: { color: "#6e0303", opacity: 0.36 },
  blocked: { color: "#8a8f98", opacity: 0.4 },
  not_released: { color: "#5b6b7a", opacity: 0.34 },
};

const pointIn = (x: number, y: number, pts: [number, number][]) => {
  let inside = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i];
    const [xj, yj] = pts[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

const polyArea = (pts: [number, number][]) => {
  let a = 0;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) a += pts[j][0] * pts[i][1] - pts[i][0] * pts[j][1];
  return Math.abs(a / 2);
};

export function ImagePlan({
  image,
  plots,
  plotPlan = null,
  title,
  unit = "ft",
  propertyId = null,
}: {
  image: PlanImage;
  plots: Plot[];
  /** The traced plan's particulars, for the sheet's approval rows only. */
  plotPlan?: PlotPlan | null;
  title: string;
  unit?: Unit;
  propertyId?: string | null;
}) {
  const W = image.w;
  const H = image.h;

  /* ---- data: shapes joined to their plot records ---- */
  const byUid = useMemo(() => new Map(plots.filter((p) => p.uid).map((p) => [p.uid as string, p])), [plots]);
  const byNo = useMemo(() => new Map(plots.map((p) => [String(p.plot).trim().toLowerCase(), p])), [plots]);
  const plotShapes = useMemo(
    () =>
      (image.shapes ?? [])
        .filter((s) => s.k === "plot" && Array.isArray(s.pts) && s.pts.length >= 3)
        .map((s) => {
          const rec =
            (s.uid && byUid.get(s.uid)) || (s.plot != null ? byNo.get(String(s.plot).trim().toLowerCase()) : undefined);
          const pts = s.pts.map(([x, y]) => [x * W, y * H] as [number, number]);
          return { shape: s, rec, pts, area: polyArea(pts) };
        })
        .filter((x): x is { shape: PlanImageShape; rec: Plot; pts: [number, number][]; area: number } => !!x.rec),
    [image.shapes, byUid, byNo, W, H],
  );
  const zoneShapes = useMemo(
    () =>
      (image.shapes ?? [])
        .filter((s) => s.k !== "plot" && Array.isArray(s.pts) && s.pts.length >= 3)
        .map((s) => ({ shape: s, pts: s.pts.map(([x, y]) => [x * W, y * H] as [number, number]) })),
    [image.shapes, W, H],
  );
  const mappedPlots = useMemo(() => plotShapes.map((p) => p.rec), [plotShapes]);
  const unmapped = useMemo(() => {
    const onMap = new Set(mappedPlots.map((p) => String(p.plot)));
    return plots.filter((p) => !onMap.has(String(p.plot)));
  }, [plots, mappedPlots]);
  const key = useMemo(() => plotStatusKey(mappedPlots), [mappedPlots]);
  const review = useMemo(() => new Set((image.review_plots ?? []).map(String)), [image.review_plots]);
  const hasRoads = zoneShapes.some((z) => z.shape.k === "road");
  const hasOpen = zoneShapes.some((z) => z.shape.k === "open_space");

  const tint = (st: PlotStatus) => {
    const o = image.style?.status?.[st];
    const d = DEFAULT_TINT[st];
    return {
      color: o?.color || d.color,
      opacity: typeof o?.opacity === "number" ? o.opacity : d.opacity,
      visible: o?.visible !== false,
    };
  };

  /* ---- ui state ---- */
  const [selectedUid, setSelectedUid] = useState<string | null>(null);
  const selected = useMemo(
    () => plotShapes.find((p) => (p.rec.uid ?? `n:${p.rec.plot}`) === selectedUid) ?? null,
    [plotShapes, selectedUid],
  );
  const idOf = (p: Plot) => p.uid ?? `n:${p.plot}`;
  const [hoverUid, setHoverUid] = useState<string | null>(null);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [showRoads, setShowRoads] = useState(false);
  const [showOpen, setShowOpen] = useState(false);
  const [measuring, setMeasuring] = useState(false);

  /* ---- view transform ---- */
  const frameRef = useRef<HTMLDivElement>(null);
  const boxRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const [box, setBox] = useState({ w: 0, h: 0 });
  const [tx, setTx] = useState<Tx | null>(null);
  const touched = useRef(false);
  /* Handlers read the live transform through a ref; synced after commit. */
  const txRef = useRef<Tx | null>(null);
  useEffect(() => {
    txRef.current = tx;
  }, [tx]);

  const fitWidth = useCallback((b = box): Tx => ({ s: b.w / W, x: 0, y: 0 }), [box, W]);
  const fitAll = useCallback(
    (b = box): Tx => {
      const s = Math.min(b.w / W, b.h / H);
      return { s, x: (b.w - W * s) / 2, y: (b.h - H * s) / 2 };
    },
    [box, W, H],
  );
  const limits = useCallback(
    (b = box) => {
      const min = Math.min(b.w / W, b.h / H);
      const max = Math.max((b.w / W) * 10, 1.6);
      return { min, max };
    },
    [box, W, H],
  );
  /* Keep the drawing on screen: centred on an axis where it is smaller than
     the frame, otherwise never pulled past its own edges. */
  const clamp = useCallback(
    (t: Tx, b = box): Tx => {
      const { min, max } = limits(b);
      const s = Math.min(max, Math.max(min, t.s));
      const sw = W * s;
      const sh = H * s;
      const x = sw <= b.w ? (b.w - sw) / 2 : Math.min(0, Math.max(b.w - sw, t.x));
      const y = sh <= b.h ? (b.h - sh) / 2 : Math.min(0, Math.max(b.h - sh, t.y));
      return { s, x, y };
    },
    [box, limits, W, H],
  );

  /* Measure the frame; re-fit until the reader has moved the plan themselves. */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const measure = () => {
      const b = { w: el.clientWidth, h: el.clientHeight };
      if (!b.w || !b.h) return;
      setBox((cur) => (cur.w === b.w && cur.h === b.h ? cur : b));
      setTx((cur) => (!cur || !touched.current ? { s: b.w / W, x: 0, y: 0 } : cur));
    };
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    /* ⚠️ A TIMER AS WELL AS THE OBSERVER. ResizeObserver callbacks ride the
       rendering loop, which a background tab or hidden pane never runs — the
       plan would sit empty until the reader looked at it. A shared WhatsApp
       link opened in a background tab is exactly that case (the MasterPlan
       deep-link note). A timer fires regardless of visibility. */
    const t = setTimeout(measure, 0);
    return () => {
      ro.disconnect();
      clearTimeout(t);
    };
  }, [W]);

  const zoomAt = useCallback(
    (factor: number, cx: number, cy: number) => {
      touched.current = true;
      setTx((cur) => {
        if (!cur) return cur;
        const { min, max } = limits();
        const s = Math.min(max, Math.max(min, cur.s * factor));
        const k = s / cur.s;
        return clamp({ s, x: cx - (cx - cur.x) * k, y: cy - (cy - cur.y) * k });
      });
    },
    [clamp, limits],
  );

  /* Wheel zoom around the cursor. Native listener: React's wheel handler is
     passive and could not stop the page from scrolling underneath. */
  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const delta = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
      zoomAt(Math.exp(-delta * 0.0022), e.clientX - r.left, e.clientY - r.top);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  /* ---- pointers: pan, pinch, tap, double-tap ---- */
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const gesture = useRef<{
    startX: number;
    startY: number;
    moved: boolean;
    tx: Tx;
    pinch?: { d: number; mx: number; my: number; tx: Tx };
  } | null>(null);
  const lastTap = useRef<{ t: number; x: number; y: number } | null>(null);

  const local = (e: { clientX: number; clientY: number }) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const hitTest = (lx: number, ly: number) => {
    const t = txRef.current;
    if (!t) return null;
    const ix = (lx - t.x) / t.s;
    const iy = (ly - t.y) / t.s;
    /* Smallest containing polygon wins, so a plot drawn inside another shape
       is always reachable. */
    let best: (typeof plotShapes)[number] | null = null;
    for (const p of plotShapes) {
      if (pointIn(ix, iy, p.pts) && (!best || p.area < best.area)) best = p;
    }
    return best;
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    const t = txRef.current;
    if (!t) return;
    if (pointers.current.size === 2) {
      const [a, b] = [...pointers.current.values()];
      gesture.current = {
        startX: p.x,
        startY: p.y,
        moved: true,
        tx: t,
        pinch: { d: Math.hypot(a.x - b.x, a.y - b.y) || 1, mx: (a.x + b.x) / 2, my: (a.y + b.y) / 2, tx: t },
      };
    } else if (pointers.current.size === 1) {
      gesture.current = { startX: p.x, startY: p.y, moved: false, tx: t };
    }
  };

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!pointers.current.has(e.pointerId)) {
      if (e.pointerType === "mouse" && !measuring) {
        const hit = hitTest(local(e).x, local(e).y);
        const id = hit ? idOf(hit.rec) : null;
        if (id !== hoverUid) setHoverUid(id);
      }
      return;
    }
    const p = local(e);
    pointers.current.set(e.pointerId, p);
    const g = gesture.current;
    if (!g) return;
    if (g.pinch && pointers.current.size >= 2) {
      const [a, b] = [...pointers.current.values()];
      const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
      const mx = (a.x + b.x) / 2;
      const my = (a.y + b.y) / 2;
      const { min, max } = limits();
      const s = Math.min(max, Math.max(min, g.pinch.tx.s * (d / g.pinch.d)));
      const k = s / g.pinch.tx.s;
      touched.current = true;
      setTx(clamp({ s, x: mx - (g.pinch.mx - g.pinch.tx.x) * k, y: my - (g.pinch.my - g.pinch.tx.y) * k }));
      return;
    }
    /* In Measure mode a single pointer belongs to the ruler, not to panning. */
    if (measuring) return;
    const dx = p.x - g.startX;
    const dy = p.y - g.startY;
    if (!g.moved && Math.hypot(dx, dy) > 5) {
      g.moved = true;
      boxRef.current?.setPointerCapture?.(e.pointerId);
    }
    if (g.moved) {
      touched.current = true;
      setTx(clamp({ s: g.tx.s, x: g.tx.x + dx, y: g.tx.y + dy }));
    }
  };

  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    const had = pointers.current.delete(e.pointerId);
    const g = gesture.current;
    if (pointers.current.size === 1 && g?.pinch) {
      /* One finger lifted out of a pinch: carry on as a pan from here. */
      const [rest] = [...pointers.current.values()];
      gesture.current = { startX: rest.x, startY: rest.y, moved: true, tx: txRef.current ?? g.tx };
      return;
    }
    if (pointers.current.size > 0) return;
    gesture.current = null;
    if (!had || !g || g.moved || g.pinch || measuring) return;

    const p = local(e);
    const now = Date.now();
    const last = lastTap.current;
    if (last && now - last.t < 320 && Math.hypot(p.x - last.x, p.y - last.y) < 30) {
      lastTap.current = null;
      const t = txRef.current;
      const { max } = limits();
      if (t && t.s >= max * 0.98) setTx(fitWidth());
      else zoomAt(2, p.x, p.y);
      return;
    }
    lastTap.current = { t: now, x: p.x, y: p.y };
    const hit = hitTest(p.x, p.y);
    if (hit) {
      const id = idOf(hit.rec);
      setSelectedUid((cur) => (cur === id ? null : id));
    } else {
      setSelectedUid(null);
    }
  };

  const onPointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(e.pointerId);
    if (pointers.current.size === 0) gesture.current = null;
  };

  /* ---- deep link #plot-N, like the traced plan ---- */
  useEffect(() => {
    const m = window.location.hash.match(/^#plot-(.+)$/);
    if (!m) return;
    const raw = decodeURIComponent(m[1]);
    const hit = plotShapes.find((p) => String(p.rec.plot) === raw);
    if (!hit) return;
    const t = setTimeout(() => {
      setSelectedUid(idOf(hit.rec));
      frameRef.current?.scrollIntoView({ block: "center" });
    }, 0);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- arrival only
  }, []);

  /* Escape / outside click close the sheet (same rules as MasterPlan). */
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelectedUid(null);
    };
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (frameRef.current?.contains(t) || sheetRef.current?.contains(t)) return;
      setSelectedUid(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [selected]);

  useEffect(() => {
    if (selected) closeRef.current?.focus();
  }, [selected]);

  /* ---- resolution: swap to the full-size rendition once it would show ---- */
  const [hiReady, setHiReady] = useState(false);
  const displayW = 1600; // the rendition's nominal width; exact value only tunes the threshold
  const needHi =
    !!image.hi && !!tx && typeof window !== "undefined" && tx.s * (window.devicePixelRatio || 1) > (displayW / W) * 1.15;
  useEffect(() => {
    if (!needHi || hiReady || !image.hi) return;
    const im = new Image();
    im.decoding = "async";
    im.onload = () => setHiReady(true);
    im.src = image.hi;
  }, [needHi, hiReady, image.hi]);
  const src = hiReady && image.hi ? image.hi : image.src;

  const pts = (p: [number, number][]) => p.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const zoomPct = tx && box.w ? Math.round((tx.s / (box.w / W)) * 100) : 100;
  const lim = box.w ? limits() : { min: 0, max: 1 };
  const center = () => ({ x: box.w / 2, y: box.h / 2 });
  /* Stroke widths are given in screen pixels and converted into image units. */
  const px = (n: number) => (tx ? n / tx.s : n);

  const chip = "inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-tiny font-medium transition-colors";
  const toggle = (on: boolean) =>
    `rounded-full border px-3 py-1.5 text-tiny font-medium transition-colors ${
      on ? "border-ink bg-ink text-canvas" : "border-line bg-canvas text-ink-soft hover:border-ink-faint"
    }`;

  return (
    <div>
      {/* ---- key and controls ---- */}
      <div className="flex flex-wrap items-center justify-between gap-phi2 print:hidden">
        <div className="flex flex-wrap items-center gap-2">
          {key.map(({ status, count }) => {
            const s = PLOT_STATUS[status];
            const t = tint(status);
            return (
              <span key={status} className={chip} style={{ background: s.fill, borderColor: s.stroke, color: s.text }}>
                <span
                  aria-hidden="true"
                  className="h-3.5 w-3.5 shrink-0 rounded-[3px] border"
                  style={{ background: t.color, opacity: Math.max(0.35, t.opacity * 2), borderColor: s.stroke }}
                />
                {s.label}
                <span className="tabular-nums opacity-70">{count}</span>
              </span>
            );
          })}
          {hasRoads && (
            <button
              type="button"
              aria-pressed={showRoads}
              onClick={() => setShowRoads((v) => !v)}
              className={chip}
              style={{
                background: showRoads ? "var(--plan-road-fill)" : "color-mix(in srgb, var(--plan-road-fill) 45%, white)",
                borderColor: "var(--plan-road-line)",
                color: "var(--color-ink-soft)",
              }}
            >
              <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-[3px] border" style={{ background: "var(--plan-road-fill)", borderColor: "var(--plan-road-line)" }} />
              Roads
            </button>
          )}
          {hasOpen && (
            <button
              type="button"
              aria-pressed={showOpen}
              onClick={() => setShowOpen((v) => !v)}
              className={chip}
              style={{
                background: showOpen ? "var(--plan-osr-fill)" : "color-mix(in srgb, var(--plan-osr-fill) 40%, white)",
                borderColor: "var(--plan-osr-line)",
                color: "var(--color-ink-soft)",
              }}
            >
              <span aria-hidden="true" className="h-3.5 w-3.5 shrink-0 rounded-[3px] border" style={{ background: "var(--plan-osr-fill)", borderColor: "var(--plan-osr-line)" }} />
              Open space
            </button>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button type="button" onClick={() => setOnlyAvailable((v) => !v)} aria-pressed={onlyAvailable} className={toggle(onlyAvailable)}>
            Available only
          </button>
          {image.metres_per_px ? (
            <button
              type="button"
              onClick={() => {
                setMeasuring((v) => !v);
                setSelectedUid(null);
              }}
              aria-pressed={measuring}
              className={toggle(measuring)}
            >
              Measure
            </button>
          ) : null}
          <div className="flex items-center rounded-full border border-line bg-canvas">
            <button
              type="button"
              onClick={() => zoomAt(1 / 1.5, center().x, center().y)}
              disabled={!tx || tx.s <= lim.min * 1.001}
              aria-label="Zoom out"
              className="px-3 py-1.5 text-base text-ink-soft disabled:opacity-30"
            >
              −
            </button>
            <span className="min-w-[3.2rem] px-1 text-center text-tiny tabular-nums text-ink-faint" aria-live="polite">
              {zoomPct}%
            </span>
            <button
              type="button"
              onClick={() => zoomAt(1.5, center().x, center().y)}
              disabled={!tx || tx.s >= lim.max * 0.999}
              aria-label="Zoom in"
              className="px-3 py-1.5 text-base text-ink-soft disabled:opacity-30"
            >
              +
            </button>
          </div>
          <button
            type="button"
            onClick={() => {
              touched.current = true;
              setTx(fitAll());
            }}
            className={toggle(false)}
            title="Show the whole layout"
          >
            Fit
          </button>
          <button
            type="button"
            onClick={() => {
              touched.current = false;
              setTx(fitWidth());
            }}
            className={toggle(false)}
            title="Back to the starting view"
          >
            Reset
          </button>
        </div>
      </div>

      {/* ⚠️ HIDDEN, NEVER UNMOUNTED. Removing this line when a plot opens moved
          the whole plan up by its height (measured: 69px) under the reader's
          finger, so the next tap — or the second half of a double-tap — landed
          on a DIFFERENT plot. `invisible` keeps its space. */}
      {(
        <p
          aria-hidden={!!selected || measuring}
          className={`mt-phi3 flex items-center gap-2 text-base text-ink-muted print:hidden ${
            selected || measuring ? "invisible" : ""
          }`}
        >
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jamin-gold-soft text-tiny text-jamin-gold-ink"
          >
            ☝
          </span>
          Tap any plot on the approved layout for its record. Drag to move, pinch or scroll to zoom, double-tap to zoom in.
        </p>
      )}

      {/* ---- the plan ---- */}
      <div ref={frameRef} className="mt-phi3">
        <div
          ref={boxRef}
          className={`relative overflow-hidden rounded-xl border border-line bg-canvas shadow-lift select-none ${
            measuring ? "cursor-crosshair" : hoverUid ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
          }`}
          /* The same `min(78vh, 900px)` window the traced plan uses, with a
             floor so a landscape phone still gets a usable map. */
          style={{ height: "min(78vh, 900px)", minHeight: 340, touchAction: "none" }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerCancel}
          onPointerLeave={() => setHoverUid(null)}
          role="region"
          aria-label={`Approved layout plan for ${title}, ${plotShapes.length} plots`}
        >
          {tx && (
            <div
              className="absolute left-0 top-0 origin-top-left"
              style={{ width: W, height: H, transform: `translate(${tx.x}px, ${tx.y}px) scale(${tx.s})` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={src}
                width={W}
                height={H}
                alt={`${title} — the approved layout plan`}
                draggable={false}
                decoding="async"
                className="pointer-events-none block h-full w-full max-w-none"
              />
              <svg viewBox={`0 0 ${W} ${H}`} className="absolute inset-0 h-full w-full">
                {/* roads and open space, only when asked for */}
                {zoneShapes.map((z, i) => {
                  const on =
                    (z.shape.k === "road" && showRoads) ||
                    (z.shape.k === "open_space" && showOpen) ||
                    (z.shape.k === "reserved" && showOpen);
                  if (!on) return null;
                  const road = z.shape.k === "road";
                  const cfg = road ? image.style?.road : image.style?.open_space;
                  if (cfg?.visible === false) return null;
                  return (
                    <polygon
                      key={`z-${i}`}
                      points={pts(z.pts)}
                      pointerEvents="none"
                      style={{
                        fill: cfg?.color || (road ? "#e07a2e" : "#3f9c35"),
                        fillOpacity: typeof cfg?.opacity === "number" ? cfg.opacity : 0.32,
                        stroke: cfg?.color || (road ? "#b4561a" : "#2c7a24"),
                        strokeWidth: px(2),
                      }}
                    />
                  );
                })}

                {plotShapes.map((p) => {
                  const st = plotStatus(p.rec);
                  const t = tint(st);
                  const id = idOf(p.rec);
                  const active = selectedUid === id;
                  const hover = hoverUid === id;
                  const dimmed = onlyAvailable && st !== "available";
                  const emphasised = onlyAvailable && st === "available";
                  return (
                    <polygon
                      key={id}
                      points={pts(p.pts)}
                      role="button"
                      tabIndex={0}
                      aria-pressed={active}
                      aria-label={`Plot ${p.rec.plot}, ${PLOT_STATUS[st].label}${plotArea(p.rec) ? `, ${plotArea(p.rec)}` : ""}`}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          setSelectedUid(active ? null : id);
                        }
                      }}
                      onFocus={() => setHoverUid(id)}
                      onBlur={() => setHoverUid((h) => (h === id ? null : h))}
                      className="outline-none"
                      style={{
                        fill: dimmed ? "#2b2b2b" : active ? "#d4a017" : t.visible ? t.color : "transparent",
                        fillOpacity: dimmed ? 0.32 : active ? 0.2 : emphasised ? Math.max(t.opacity, 0.22) : t.visible ? t.opacity : 0,
                        stroke: active ? "#8a5a00" : hover ? "#d4a017" : emphasised ? t.color : "transparent",
                        strokeWidth: px(active ? 3.5 : hover ? 2.5 : emphasised ? 2 : 0),
                        strokeLinejoin: "round",
                        transition: "fill-opacity .18s ease, stroke-width .12s ease",
                      }}
                    />
                  );
                })}

                {measuring && image.metres_per_px ? (
                  <PlanMeasure
                    metresPerUnit={image.metres_per_px}
                    unit={unit}
                    glyphScale={tx ? 1 / tx.s : 1}
                    source="approved layout image"
                  />
                ) : null}
              </svg>
            </div>
          )}
        </div>
      </div>

      {measuring && (
        <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
          Drag across the plan to measure. Distances are scaled from the layout image and are approximate
          {image.scale_note ? ` (${image.scale_note})` : ""} — they are not survey figures. For a plot&rsquo;s
          recorded dimensions, tap the plot and read its record.
        </p>
      )}

      {unmapped.length > 0 && (
        <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
          {unmapped.length === 1 ? "Plot record" : "Plot records"}{" "}
          {unmapped.map((p) => p.plot).join(", ")} {unmapped.length === 1 ? "is" : "are"} not shown on this
          layout image — see the Plot list, or ask the desk.
        </p>
      )}

      {selected &&
        createPortal(
          <>
            <div className="fixed inset-0 z-[55] bg-ink/40 sm:hidden" aria-hidden="true" onClick={() => setSelectedUid(null)} />
            <div
              ref={sheetRef}
              role="dialog"
              aria-label={`Plot ${selected.rec.plot} details`}
              className="fixed inset-x-0 bottom-0 z-[60] max-h-[70vh] overflow-y-auto rounded-t-[1.5rem] border-t border-line bg-canvas shadow-raise sm:bottom-0 sm:left-auto sm:right-0 sm:top-[var(--header-h)] sm:max-h-none sm:w-[26rem] sm:rounded-none sm:rounded-l-[1.5rem] sm:border-l sm:border-t-0"
              style={{ animation: "reveal 0.35s var(--ease-silk) both" }}
            >
              <PlotSheet
                plot={selected.rec}
                plan={plotPlan ?? {}}
                title={title}
                unit={unit}
                propertyId={propertyId}
                closeRef={closeRef}
                onClose={() => setSelectedUid(null)}
                underReview={review.has(String(selected.rec.plot))}
              />
            </div>
          </>,
          document.body,
        )}
    </div>
  );
}
