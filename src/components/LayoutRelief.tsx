"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useCanAnimate } from "@/hooks/useInView";
import {
  PLOT_STATUS,
  plotArea,
  plotStatus,
  type Plot,
  type PlotPlan,
} from "@/lib/properties";
import { area as fmtArea, dimensions as fmtDims, length as fmtLength, type Unit } from "@/lib/units";

/**
 * THE SANCTIONED LAYOUT, STANDING UP (§16, third view).
 *
 * 🚨 THIS IS NOT A 3D MODEL AND IT LOADS NO 3D LIBRARY. It is the same traced
 * geometry `MasterPlan` draws — `plot_plan`'s own coordinate space, each plot's
 * `poly` inside it — put through an axonometric projection and painted to a 2D
 * canvas, with the prisms depth-sorted by a painter's algorithm. That is a few
 * hundred lines of arithmetic against three.js's ~150 KB before it draws a
 * single polygon, and this site's whole posture is a zero-JS hero and a static
 * prerender. If this ever needs true perspective, orbiting or lighting, THEN
 * the library earns its place; it does not earn it for extruded slabs.
 *
 * ⚠️ IT IS THE PLAN, NOT A PICTURE OF ONE — the same claim `MasterPlan` makes
 * and for the same reason. Mark a plot reserved in the console and it changes
 * colour here on the next build. Nothing in this file invents geometry.
 *
 * ⚠️ NO BUILDINGS ON THE PLOTS, deliberately. Massing a house on each plot
 * would look better and would say something untrue: these are plots in a formed
 * layout, and this site's standing rule is that imagery never implies a
 * development is built. The relief exists to make the SITE legible — levels,
 * frontages, which plots the 12 m road actually serves — not to sell a render.
 *
 * ⚠️ A CANVAS IS INVISIBLE to search engines and to assistive technology, so
 * this view never carries information the reader cannot get elsewhere. The
 * whole schedule is one tap away in `PlotSchedule`, which `LayoutViews` keeps
 * beside it, and the canvas carries a plain-language label describing itself.
 */
export function LayoutRelief({
  plots,
  plan,
  unit = "ft",
}: {
  plots: Plot[];
  plan: PlotPlan;
  unit?: Unit;
}) {
  const cv = useRef<HTMLCanvasElement>(null);
  const shell = useRef<HTMLDivElement>(null);
  const canAnimate = useCanAnimate();

  const [yaw, setYaw] = useState(-24);
  const [tilt, setTilt] = useState(54);
  const [relief, setRelief] = useState(30); // tenths of a metre
  const [hover, setHover] = useState<string | null>(null);

  /* Only the plots that actually carry geometry. A schedule-only plot has
     nothing to extrude and must not be invented a rectangle. */
  const solid = plots.filter((p) => Array.isArray(p.poly) && p.poly.length > 2);

  /**
   * ⚠️ COLOURS ARE RESOLVED THROUGH THE DOM, not read as custom properties.
   * `--plot-available-fill` is a `color-mix(...)`, and a canvas `fillStyle`
   * will not parse that in every engine — assigning it silently leaves the
   * previous colour, which paints every plot the same. Setting it on a real
   * element and reading the computed `color` back gets an `rgb()` from the
   * browser's own parser, whatever the token expands to.
   */
  const resolve = useCallback((value: string) => {
    const host = shell.current;
    if (!host) return "#888";
    const probe = document.createElement("span");
    probe.style.cssText = "position:absolute;width:0;height:0;opacity:0";
    probe.style.color = value;
    host.appendChild(probe);
    const out = getComputedStyle(probe).color;
    host.removeChild(probe);
    return out || "#888";
  }, []);

  const draw = useCallback(() => {
    const c = cv.current;
    const host = shell.current;
    if (!c || !host || !plan.viewBox) return;
    const ctx = c.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = host.clientWidth;
    const h = Math.round(Math.min(Math.max(w * 0.66, 300), 560));
    if (c.width !== Math.round(w * dpr) || c.height !== Math.round(h * dpr)) {
      c.width = Math.round(w * dpr);
      c.height = Math.round(h * dpr);
      c.style.height = `${h}px`;
    }
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    const mpu = plan.metresPerUnit || 1;
    const z = relief / 10 / mpu; // slider is tenths of a metre; the plan is in units

    const bounds = plan.boundary?.length ? plan.boundary : solid.flatMap((p) => p.poly!);
    let cx = 0;
    let cy = 0;
    {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const [x, y] of bounds) {
        x0 = Math.min(x0, x); y0 = Math.min(y0, y);
        x1 = Math.max(x1, x); y1 = Math.max(y1, y);
      }
      cx = (x0 + x1) / 2;
      cy = (y0 + y1) / 2;
    }

    const t = (yaw * Math.PI) / 180;
    const ph = (tilt * Math.PI) / 180;
    const proj = (x: number, y: number, zz: number) => {
      const dx = x - cx, dy = y - cy;
      const rx = dx * Math.cos(t) - dy * Math.sin(t);
      const ry = dx * Math.sin(t) + dy * Math.cos(t);
      return { x: rx, y: ry * Math.cos(ph) - zz * Math.sin(ph), d: ry };
    };

    /* Fit every projected extreme, at both z=0 and z=top, so a rotation never
       clips the drawing against the frame. */
    let S = 1, ox = 0, oy = 0;
    {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      const eat = (x: number, y: number, zz: number) => {
        const p = proj(x, y, zz);
        x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y);
        x1 = Math.max(x1, p.x); y1 = Math.max(y1, p.y);
      };
      for (const [x, y] of bounds) { eat(x, y, 0); eat(x, y, z); }
      for (const p of solid) for (const [x, y] of p.poly!) { eat(x, y, 0); eat(x, y, z); }
      const pad = 26;
      S = Math.min((w - pad * 2) / (x1 - x0 || 1), (h - pad * 2) / (y1 - y0 || 1));
      ox = pad - x0 * S + (w - pad * 2 - (x1 - x0) * S) / 2;
      oy = pad - y0 * S + (h - pad * 2 - (y1 - y0) * S) / 2;
    }
    /* 🚨 THE PAINT OWNS THE TRANSFORM AND HIT TESTING BORROWS IT. An earlier
       draft recomputed the same fit in a second effect so the pointer could
       project; two copies of this arithmetic is two chances for it to drift,
       and a hit test that disagrees with the picture by four pixels is a bug
       nobody can see and everybody feels. It is written down once, here, and
       read from the ref below. */
    lastTransform.current = { cx, cy, t, ph, S, ox, oy, z };

    const scr = (x: number, y: number, zz: number) => {
      const p = proj(x, y, zz);
      return { x: p.x * S + ox, y: p.y * S + oy };
    };
    const trace = (pts: [number, number][], zz: number) => {
      ctx.beginPath();
      pts.forEach(([x, y], i) => {
        const s = scr(x, y, zz);
        if (i) ctx.lineTo(s.x, s.y); else ctx.moveTo(s.x, s.y);
      });
      ctx.closePath();
    };

    const line = resolve("var(--color-line)");
    const sunken = resolve("var(--color-canvas-sunken)");
    const faint = resolve("var(--color-ink-faint)");

    /* the sanctioned extent */
    if (plan.boundary?.length) {
      trace(plan.boundary as [number, number][], 0);
      ctx.fillStyle = sunken;
      ctx.fill();
      ctx.strokeStyle = line;
      ctx.lineWidth = 1.2;
      ctx.stroke();
    }

    /* the open space reservation, dashed like the drawing marks it */
    if (plan.osr?.polygon?.length) {
      trace(plan.osr.polygon as [number, number][], 0);
      ctx.fillStyle = resolve("var(--plot-available-fill)");
      ctx.globalAlpha = 0.55;
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = resolve("var(--plot-available-line)");
      ctx.setLineDash([5, 4]);
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.setLineDash([]);
    }

    /* plots, far to near — the rotated depth is the sort key */
    const order = solid
      .map((p) => {
        const poly = p.poly!;
        const cxp = poly.reduce((a, q) => a + q[0], 0) / poly.length;
        const cyp = poly.reduce((a, q) => a + q[1], 0) / poly.length;
        return { p, d: proj(cxp, cyp, 0).d };
      })
      .sort((a, b) => a.d - b.d);

    for (const { p } of order) {
      const st = PLOT_STATUS[plotStatus(p)];
      const top = resolve(st.fill);
      const edge = resolve(st.stroke);
      const on = hover === p.plot;
      const poly = p.poly!;

      if (z > 0.4) {
        for (let i = 0; i < poly.length; i++) {
          const A = poly[i], B = poly[(i + 1) % poly.length];
          const q = [scr(A[0], A[1], 0), scr(B[0], B[1], 0), scr(B[0], B[1], z), scr(A[0], A[1], z)];
          /* Only the walls turned toward the reader. A signed area of zero or
             less means this face is round the back and painting it would show
             through the top. */
          const signed =
            (q[1].x - q[0].x) * (q[2].y - q[0].y) - (q[2].x - q[0].x) * (q[1].y - q[0].y);
          if (signed <= 0) continue;
          ctx.beginPath();
          q.forEach((s, i2) => (i2 ? ctx.lineTo(s.x, s.y) : ctx.moveTo(s.x, s.y)));
          ctx.closePath();
          ctx.fillStyle = edge;
          ctx.globalAlpha = on ? 0.5 : 0.3;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      trace(poly as [number, number][], z);
      ctx.fillStyle = on ? edge : top;
      ctx.fill();
      ctx.strokeStyle = edge;
      ctx.lineWidth = on ? 1.8 : 1;
      ctx.stroke();

      if (p.at) {
        const s = scr(p.at[0], p.at[1], z);
        ctx.fillStyle = on ? sunken : edge;
        ctx.font = "600 10px ui-monospace, SFMono-Regular, Menlo, monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(String(p.plot), s.x, s.y);
      }
    }

    /* scale bar, from the drawing's own metres-per-unit */
    if (plan.metresPerUnit) {
      const metres = 20;
      const px = (metres / plan.metresPerUnit) * S;
      const x = 16, y = h - 18;
      ctx.strokeStyle = faint;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(x, y - 4); ctx.lineTo(x, y); ctx.lineTo(x + px, y); ctx.lineTo(x + px, y - 4);
      ctx.stroke();
      ctx.fillStyle = faint;
      ctx.font = "500 10px ui-monospace, SFMono-Regular, Menlo, monospace";
      ctx.textAlign = "left";
      ctx.textBaseline = "bottom";
      ctx.fillText(fmtLength(metres, unit), x, y - 6);
    }
  }, [plan, solid, yaw, tilt, relief, hover, unit, resolve]);

  /* 🚨 NO `useInView` GATE HERE, AND REMOVING IT IS THE POINT. The obvious
     build wraps the paint in an intersection observer so an unseen canvas costs
     nothing — but this component only MOUNTS when the reader picks "Relief" in
     the switcher above, so the mount is already the lazy gate and the observer
     can only ever delay a canvas the reader has just asked for. It did exactly
     that in testing: the observer never delivered, and the drawing appeared
     1.5s later off the hook's own fallback timer. Two gates for one job, and
     the second one can only lose. */
  useEffect(() => {
    draw();
  }, [draw]);

  useEffect(() => {
    const host = shell.current;
    if (!host) return;
    const ro = new ResizeObserver(() => draw());
    ro.observe(host);
    return () => ro.disconnect();
  }, [draw]);

  const hit = (mx: number, my: number): Plot | null => {
    const c = cv.current;
    if (!c) return null;
    /* Re-derive the same transform the paint used, then test the top face. */
    const box = c.getBoundingClientRect();
    const px = mx - box.left, py = my - box.top;
    for (let i = solid.length - 1; i >= 0; i--) {
      const p = solid[i];
      const pts = (p.poly as [number, number][]).map(([x, y]) => projectToScreen(x, y));
      let inside = false;
      for (let a = 0, b = pts.length - 1; a < pts.length; b = a++) {
        if (
          pts[a].y > py !== pts[b].y > py &&
          px < ((pts[b].x - pts[a].x) * (py - pts[a].y)) / (pts[b].y - pts[a].y) + pts[a].x
        )
          inside = !inside;
      }
      if (inside) return p;
    }
    return null;

    /* Reads the transform the last paint wrote — never its own copy. */
    function projectToScreen(x: number, y: number) {
      const T = lastTransform.current;
      const dx = x - T.cx, dy = y - T.cy;
      const rx = dx * Math.cos(T.t) - dy * Math.sin(T.t);
      const ry = dx * Math.sin(T.t) + dy * Math.cos(T.t);
      return {
        x: rx * T.S + T.ox,
        y: (ry * Math.cos(T.ph) - T.z * Math.sin(T.ph)) * T.S + T.oy,
      };
    }
  };

  const lastTransform = useRef({ cx: 0, cy: 0, t: 0, ph: 0, S: 1, ox: 0, oy: 0, z: 0 });
  const dragging = useRef(false);
  const last = useRef({ x: 0, y: 0 });

  const selected = hover ? solid.find((p) => p.plot === hover) ?? null : null;

  return (
    <div>
      <div
        ref={shell}
        className="relative overflow-hidden rounded-card border border-line bg-canvas-alt"
      >
        <canvas
          ref={cv}
          tabIndex={0}
          role="img"
          aria-label={`Tilted view of the sanctioned layout: ${solid.length} plots, drawn from the approved plan. The full plot schedule is available in the Blocks view.`}
          className="block w-full cursor-grab touch-none active:cursor-grabbing focus-visible:outline focus-visible:outline-2 focus-visible:outline-jamin-gold"
          onPointerDown={(e) => {
            dragging.current = true;
            last.current = { x: e.clientX, y: e.clientY };
            e.currentTarget.setPointerCapture(e.pointerId);
          }}
          onPointerMove={(e) => {
            if (dragging.current) {
              const dx = e.clientX - last.current.x;
              const dy = e.clientY - last.current.y;
              last.current = { x: e.clientX, y: e.clientY };
              setYaw((v) => ((v + dx * 0.45 + 180 + 360) % 360) - 180);
              setTilt((v) => Math.max(0, Math.min(80, v + dy * 0.25)));
            } else {
              const p = hit(e.clientX, e.clientY);
              setHover(p ? p.plot : null);
            }
          }}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
          onPointerLeave={() => {
            if (!dragging.current) setHover(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") setYaw((v) => v - 5);
            else if (e.key === "ArrowRight") setYaw((v) => v + 5);
            else if (e.key === "ArrowUp") setTilt((v) => Math.min(80, v + 4));
            else if (e.key === "ArrowDown") setTilt((v) => Math.max(0, v - 4));
            else return;
            e.preventDefault();
          }}
        />

        {selected && (
          <div className="pointer-events-none absolute left-3 top-3 rounded-card border border-line bg-canvas/90 px-3 py-2.5">
            <p className="ledger text-base text-ink">Plot {selected.plot}</p>
            <p className="mt-0.5 text-micro uppercase tracking-[0.12em] text-ink-faint">
              {selected.block ? `Block ${selected.block} · ` : ""}
              {PLOT_STATUS[plotStatus(selected)].label}
            </p>
            <dl className="mt-2 grid grid-cols-[auto_auto] gap-x-3 gap-y-0.5 text-tiny">
              {plotArea(selected) && (
                <>
                  <dt className="text-ink-faint">Extent</dt>
                  <dd className="ledger text-right text-ink-soft">
                    {selected.size_sqm ? fmtArea(selected.size_sqm, unit) : plotArea(selected)}
                  </dd>
                </>
              )}
              {selected.dim_m && (
                <>
                  <dt className="text-ink-faint">Dimensions</dt>
                  <dd className="ledger text-right text-ink-soft">
                    {fmtDims(selected.dim_m, unit)}
                  </dd>
                </>
              )}
              {selected.facing && (
                <>
                  <dt className="text-ink-faint">Facing</dt>
                  <dd className="text-right text-ink-soft">{selected.facing}</dd>
                </>
              )}
              {selected.road_m != null && (
                <>
                  <dt className="text-ink-faint">Road</dt>
                  <dd className="ledger text-right text-ink-soft">
                    {fmtLength(selected.road_m, unit)}
                  </dd>
                </>
              )}
            </dl>
          </div>
        )}
      </div>

      {/* ⚠️ Sliders rather than a gesture only. Drag rotates, but a reader on a
          phone with one thumb, and anyone using a keyboard, needs the same two
          axes reachable without one. */}
      <div className="mt-phi3 grid gap-phi3 sm:grid-cols-3">
        <Dial label="Rotation" value={Math.round(yaw)} suffix="°" min={-180} max={180} onChange={setYaw} />
        <Dial label="Tilt" value={Math.round(tilt)} suffix="°" min={0} max={80} onChange={setTilt} />
        <Dial
          label="Relief"
          value={relief}
          display={fmtLength(relief / 10, unit)}
          min={0}
          max={80}
          onChange={setRelief}
        />
      </div>

      <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
        Drawn from the approved layout&rsquo;s own traced geometry — the same plan as the
        Plan view, tilted. Relief is a reading aid, not a level survey: the ground here is
        flat and the height only separates plots from roads.
        {!canAnimate && " Motion is reduced, so this view does not animate."}
      </p>
    </div>
  );
}

function Dial({
  label,
  value,
  suffix = "",
  display,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  display?: string;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  const id = `relief-${label.toLowerCase()}`;
  return (
    <div>
      <label htmlFor={id} className="flex items-baseline justify-between text-micro uppercase tracking-[0.12em] text-ink-faint">
        <span>{label}</span>
        <span className="ledger text-ink-soft">{display ?? `${value}${suffix}`}</span>
      </label>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="mt-1.5 w-full accent-jamin-red"
      />
    </div>
  );
}
