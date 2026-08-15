"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { PLOT_STATUS, plotArea, plotStatus, plotStatusKey, type Plot, type PlotPlan } from "@/lib/properties";
import { useCanAnimate, useInView } from "@/hooks/useInView";
import { PlotDimensions } from "@/components/cadastral/PlotDimensions";
import {
  area as fmtArea,
  dimensions as fmtDims,
  length as fmtLength,
  relabel,
  type Unit,
} from "@/lib/units";

/**
 * The interactive DTCP layout (§16).
 *
 * Drawn from the traced geometry the app already holds — `plot_plan` carries
 * the sanctioned drawing's own coordinate space (viewBox, site boundary, road
 * bands, the OSR and the dimension lines) and each plot carries its polygon in
 * that same space. So this is not a picture of a plan, it is the plan: a plot
 * marked reserved in the admin console changes colour here on the next
 * revalidation, which a flat scan could never do.
 *
 * Plain SVG, no mapping library. The whole thing is a few kilobytes of path
 * data and it scales perfectly, which beats shipping a canvas engine to draw
 * 27 quadrilaterals.
 */

const ZOOMS = [1, 1.6, 2.4, 3.4];

export function MasterPlan({
  plots,
  plan,
  title,
  unit = "ft",
}: {
  plots: Plot[];
  plan: PlotPlan;
  title: string;
  /** Which unit the reader has chosen. The drawing is stored in metres — see
   *  `lib/units.ts` for why this is a display layer and never a rewrite. */
  unit?: Unit;
}) {
  const [selected, setSelected] = useState<Plot | null>(null);
  /**
   * Phase 5 — the plan rules itself in on arrival.
   *
   * ⚠️ `armed` gates the hiding, not the showing: unarmed, the CSS leaves every
   * shape at its finished state, so no-JS, reduced motion and a tab producing
   * no frames all get the complete drawing. This is the sanctioned layout of a
   * plot someone is being asked to buy — it is the last thing on the site that
   * may depend on an animation to become visible.
   */
  const { ref: drawRef, inView: drawn } = useInView<HTMLDivElement>();
  const armed = useCanAnimate();
  /**
   * ⚠️ THE SEQUENCE HANDS THE PLAN BACK.
   *
   * `animation-fill-mode: both` is what holds each shape hidden through its
   * delay, and it is also what would strand the whole drawing on its FIRST
   * frame in any context where animations never actually run — a background
   * tab, an off-screen pane. Measured exactly that: every shape sat at opacity
   * 0 with the sequence supposedly playing.
   *
   * So the animation classes are removed once the sequence has had time to
   * finish. In a browser that ran it, the shapes are already at their end state
   * and dropping the animation changes nothing visible. In one that did not,
   * the element falls back to its ordinary styles — which is the complete plan.
   * Either way this drawing cannot end up invisible.
   */
  const [drawDone, setDrawDone] = useState(false);
  useEffect(() => {
    if (!drawn || !armed) return;
    const t = setTimeout(() => setDrawDone(true), 2600);
    return () => clearTimeout(t);
  }, [drawn, armed]);
  const [zoomIx, setZoomIx] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** So focus can go back where it came from when the sheet closes. */
  const openerRef = useRef<SVGGElement | null>(null);

  const geo = useMemo(() => plots.filter((p) => Array.isArray(p.poly) && p.poly.length >= 3), [plots]);
  const key = useMemo(() => plotStatusKey(plots), [plots]);
  const [vx, vy, vw, vh] = plan.viewBox ?? [0, 0, 100, 100];
  /* The hatch tile, in the drawing's own units rather than in pixels. Every
     traced plan carries its own viewBox — Edappadi's is nothing like a 0–100
     box — so a fixed tile would be invisible on one plan and coarse on the
     next. A ninetieth of the long edge reads as a fine hatch at any scale. */
  const HATCH = Math.max(vw, vh) / 90;
  const zoom = ZOOMS[zoomIx];

  const pts = (poly: [number, number][]) => poly.map(([x, y]) => `${x},${y}`).join(" ");

  // Escape closes the sheet, and so does a click outside both the plan and the
  // sheet itself.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    // ⚠️ The sheet is `fixed`, so it is NOT inside the plan's DOM subtree.
    // Testing the plan alone would make every click inside the sheet count as
    // "outside": it would unmount before mouseup and its own buttons would
    // never fire. Both containers have to be in the test.
    const onDown = (e: MouseEvent) => {
      const t = e.target as Node;
      if (frameRef.current?.contains(t) || sheetRef.current?.contains(t)) return;
      setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [selected]);

  // Send focus into the sheet when it opens and back to the plot when it goes,
  // so a keyboard user is never stranded at the top of the document.
  useEffect(() => {
    if (selected) closeRef.current?.focus();
    else openerRef.current?.focus();
  }, [selected]);

  return (
    <div>
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-phi2">
        <div className="flex flex-wrap items-center gap-2">
          {key.map(({ status, count }) => {
            const s = PLOT_STATUS[status];
            return (
              /* Tinted with the status' own colour, so the key is legible at a
                 glance against the drawing instead of four identical pills. */
              <span
                key={status}
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-tiny font-medium"
                style={{ background: s.fill, borderColor: s.stroke, color: s.text }}
              >
                {/* ⚠️ The swatch carries the TEXTURE, not just the colour. A
                    legend of coloured dots is exactly the colour-only cue §6.5
                    forbids, and it would have left the hatches on the drawing
                    unexplained. Its own tiny pattern defs, because a `<pattern>`
                    is resolved against the SVG it lives in — referencing the
                    plan's defs from here renders nothing. */}
                <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true" className="shrink-0">
                  <defs>
                    <pattern id={`rj-key-${status}`} patternUnits="userSpaceOnUse" width="4" height="4" patternTransform="rotate(45)">
                      <line x1="0" y1="0" x2="0" y2="4" stroke="currentColor" strokeWidth="0.8" />
                      {s.hatch === "cross" && (
                        <line x1="0" y1="0" x2="4" y2="0" stroke="currentColor" strokeWidth="0.8" />
                      )}
                    </pattern>
                    <pattern id={`rj-key-dot-${status}`} patternUnits="userSpaceOnUse" width="3" height="3">
                      <circle cx="1.5" cy="1.5" r="0.6" fill="currentColor" />
                    </pattern>
                  </defs>
                  <rect x="0.5" y="0.5" width="13" height="13" rx="2.5" style={{ fill: s.fill, stroke: s.stroke }} strokeWidth="1" />
                  {s.hatch && (
                    <rect
                      x="0.5"
                      y="0.5"
                      width="13"
                      height="13"
                      rx="2.5"
                      style={{
                        fill: `url(#rj-key-${s.hatch === "dot" ? `dot-${status}` : status})`,
                        color: s.stroke,
                        opacity: 0.55,
                      }}
                    />
                  )}
                </svg>
                {s.label}
                <span className="tabular-nums opacity-70">{count}</span>
              </span>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOnlyAvailable((v) => !v)}
            aria-pressed={onlyAvailable}
            className={`rounded-full border px-3 py-1.5 text-tiny font-medium transition-colors ${
              onlyAvailable
                ? "border-ink bg-ink text-canvas"
                : "border-line bg-canvas text-ink-soft hover:border-ink-faint"
            }`}
          >
            Available only
          </button>
          <div className="flex items-center rounded-full border border-line bg-canvas">
            <button
              type="button"
              onClick={() => setZoomIx((z) => Math.max(0, z - 1))}
              disabled={zoomIx === 0}
              aria-label="Zoom out"
              className="px-3 py-1.5 text-base text-ink-soft disabled:opacity-30"
            >
              −
            </button>
            <span className="px-1 text-tiny tabular-nums text-ink-faint">{zoom}×</span>
            <button
              type="button"
              onClick={() => setZoomIx((z) => Math.min(ZOOMS.length - 1, z + 1))}
              disabled={zoomIx === ZOOMS.length - 1}
              aria-label="Zoom in"
              className="px-3 py-1.5 text-base text-ink-soft disabled:opacity-30"
            >
              +
            </button>
          </div>
        </div>
      </div>

      {/* the drawing — scrollable at zoom, so a phone can pan it. The floater
          overlays this wrapper rather than the scroller, so it stays put while
          the plan pans underneath. */}
      <div ref={frameRef} className={`cd-plan mt-phi3 ${armed && !drawDone ? "is-armed" : ""} ${drawn && !drawDone ? "is-on" : ""}`}>
      <div className="overflow-auto rounded-xl border border-line bg-canvas-alt shadow-lift">
        <div ref={drawRef} className="relative" style={{ width: `${zoom * 100}%` }}>
          <svg
            viewBox={`${vx} ${vy} ${vw} ${vh}`}
            className="rj-crosshair block h-auto w-full"
            role="img"
            aria-label={`Approved layout plan for ${title}, ${geo.length} plots`}
          >
            {/* ⚠️ §6.5 forbids colour as the only carrier of a plot's state, so
                every state except `available` also gets a texture. This is what
                makes the drawing readable to a colour-blind buyer and what
                survives the deed-grade print stylesheet, where the tints go.

                `userSpaceOnUse` with a viewBox-scaled tile, because the default
                `objectBoundingBox` would size the tile to each polygon — plots
                are different sizes, so the hatch would be coarse on a small plot
                and fine on a large one, and the texture would stop meaning one
                thing. Drawn in the state's own hairline colour at low opacity so
                it reads as tone rather than as a second object. */}
            <defs>
              <pattern
                id="rj-hatch-diagonal"
                patternUnits="userSpaceOnUse"
                width={HATCH}
                height={HATCH}
                patternTransform="rotate(45)"
              >
                <line x1={0} y1={0} x2={0} y2={HATCH} stroke="currentColor" strokeWidth={0.7} />
              </pattern>
              <pattern
                id="rj-hatch-cross"
                patternUnits="userSpaceOnUse"
                width={HATCH}
                height={HATCH}
                patternTransform="rotate(45)"
              >
                <line x1={0} y1={0} x2={0} y2={HATCH} stroke="currentColor" strokeWidth={0.7} />
                <line x1={0} y1={0} x2={HATCH} y2={0} stroke="currentColor" strokeWidth={0.7} />
              </pattern>
              <pattern
                id="rj-hatch-dot"
                patternUnits="userSpaceOnUse"
                width={HATCH}
                height={HATCH}
              >
                <circle cx={HATCH / 2} cy={HATCH / 2} r={0.55} fill="currentColor" />
              </pattern>
            </defs>

            {/* site boundary */}
            {plan.boundary && plan.boundary.length > 2 && (
              <polygon
                points={pts(plan.boundary)}
                strokeWidth={1.2}
                /* `pathLength` normalises the dash maths so a polygon and a
                   rect draw at the same rate without measuring perimeters. */
                pathLength={1}
                className="cd-plan__boundary rj-plan-paper"
              />
            )}

            {/* road bands */}
            {(plan.roads ?? []).map((r, i) => {
              const [x1, y1, x2, y2] = r.band;
              return (
                <g key={`road-${i}`} className="cd-plan__road">
                  <rect
                    x={Math.min(x1, x2)}
                    y={Math.min(y1, y2)}
                    width={Math.abs(x2 - x1)}
                    height={Math.abs(y2 - y1)}
                    className="rj-plan-road"
                    strokeWidth={0.5}
                  />
                  {r.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 + 2.5}
                      textAnchor="middle"
                      fontSize={6}
                      className="rj-plan-note"
                      letterSpacing="0.5"
                    >
                      {/* `widthM` where the data carries it, the caption
                          otherwise — the dimension lines have no number at all,
                          so both paths are needed. See lib/units.ts. */}
                      {r.widthM != null
                        ? `${fmtLength(r.widthM, unit)} ROAD`
                        : relabel(r.label, unit)}
                    </text>
                  )}
                </g>
              );
            })}

            {/* existing road outside the site */}
            {plan.existingRoad?.quad && (
              <g>
                <polygon points={pts(plan.existingRoad.quad)} className="rj-plan-road-existing" strokeWidth={0.5} />
                {plan.existingRoad.label && (
                  <text
                    x={
                      plan.existingRoad.quad.reduce((s, p) => s + p[0], 0) /
                      plan.existingRoad.quad.length
                    }
                    y={
                      plan.existingRoad.quad.reduce((s, p) => s + p[1], 0) /
                        plan.existingRoad.quad.length +
                      2.5
                    }
                    textAnchor="middle"
                    fontSize={6}
                    className="rj-plan-note"
                  >
                    {relabel(plan.existingRoad.label, unit)}
                  </text>
                )}
              </g>
            )}

            {/* open space reservation */}
            {plan.osr?.polygon && (
              <g>
                <polygon points={pts(plan.osr.polygon)} className="rj-plan-osr" strokeWidth={0.7} />
                <text
                  x={plan.osr.polygon.reduce((s, p) => s + p[0], 0) / plan.osr.polygon.length}
                  y={plan.osr.polygon.reduce((s, p) => s + p[1], 0) / plan.osr.polygon.length}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  className="rj-plan-osr-note"
                >
                  {plan.osr.label ?? "O.S.R."}
                </text>
                {plan.osr.areaSqm && (
                  <text
                    x={plan.osr.polygon.reduce((s, p) => s + p[0], 0) / plan.osr.polygon.length}
                    y={plan.osr.polygon.reduce((s, p) => s + p[1], 0) / plan.osr.polygon.length + 9}
                    textAnchor="middle"
                    fontSize={6}
                    className="rj-plan-osr-note"
                  >
                    {fmtArea(plan.osr.areaSqm, unit)}
                  </text>
                )}
              </g>
            )}

            {/* dimension lines from the sanctioned drawing */}
            {(plan.dimensions ?? []).map((d, i) => (
              <g key={`dim-${i}`} className="rj-plan-tick" strokeWidth={0.4}>
                <line x1={d.from[0]} y1={d.from[1]} x2={d.to[0]} y2={d.to[1]} strokeDasharray="3 2" />
                {d.label && (
                  <text
                    x={(d.from[0] + d.to[0]) / 2}
                    y={(d.from[1] + d.to[1]) / 2 - 2}
                    textAnchor="middle"
                    fontSize={6}
                    className="rj-plan-note"
                    stroke="none"
                  >
                    {relabel(d.label, unit)}
                  </text>
                )}
              </g>
            ))}

            {/* plots */}
            {geo.map((p, i) => {
              const st = plotStatus(p);
              const s = PLOT_STATUS[st];
              const dimmed = onlyAvailable && st !== "available";
              const active = selected?.plot === p.plot;
              return (
                /* A plot is a control, so it behaves like one: focusable, named
                   for a screen reader, and openable with Enter or Space. It was
                   a bare <g onClick>, which a keyboard could never reach. */
                <g
                  key={p.plot}
                  role="button"
                  tabIndex={dimmed ? -1 : 0}
                  aria-pressed={active}
                  aria-label={`Plot ${p.plot}, ${s.label}${
                    plotArea(p) ? `, ${plotArea(p)}` : ""
                  }`}
                  onClick={(e) => {
                    openerRef.current = e.currentTarget;
                    setSelected(active ? null : p);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      openerRef.current = e.currentTarget;
                      setSelected(active ? null : p);
                    }
                  }}
                  className="rj-plot-hit cursor-pointer outline-none [&:focus-visible>polygon]:stroke-[2.5]"
                  opacity={dimmed ? 0.25 : 1}
                  /* Capped at 40 so a large layout still finishes drawing in
                     about the same time as a small one. */
                  style={{ "--i": Math.min(i, 40) } as React.CSSProperties}
                >
                  {/* ⚠️ fill and stroke are INLINE STYLE, not presentation
                      attributes. Every value here is now a `var(--plot-…)`
                      token, and a presentation attribute does not resolve
                      var() — written as `fill="var(…)"` the polygons render
                      black. */}
                  <polygon
                    points={pts(p.poly!)}
                    pathLength={1}
                    strokeWidth={active ? 2.2 : 0.8}
                    style={{
                      fill: active ? "var(--plot-selected-fill)" : s.fill,
                      stroke: active ? "var(--plot-selected-line)" : s.stroke,
                    }}
                    className="cd-plan__plot rj-plot"
                  />
                  {/* The texture, §6.5. A second polygon rather than a pattern
                      baked into the fill, so the tint underneath stays a flat
                      measurable colour — the plot number is read against it.
                      `color` drives the pattern's `currentColor`. */}
                  {s.hatch && !active && (
                    <polygon
                      points={pts(p.poly!)}
                      pointerEvents="none"
                      style={{ fill: `url(#rj-hatch-${s.hatch})`, color: s.stroke, opacity: 0.5 }}
                    />
                  )}
                  {p.at && (
                    <text
                      x={p.at[0]}
                      y={p.at[1]}
                      textAnchor="middle"
                      fontSize={8}
                      fontWeight={700}
                      style={{ fill: active ? "var(--plot-selected-ink)" : s.text }}
                      pointerEvents="none"
                      className="cd-plan__num"
                    >
                      {p.plot}
                    </text>
                  )}
                </g>
              );
            })}

            {/* Per-plot dimensions, drawn LAST so they sit above the plot fills
                and the hatches rather than under them.

                ⚠️ NOT a duplicate of `plan.dimensions` above. Those are the
                SITE's extents, carried by the sanctioned drawing and always on
                screen; these belong to one plot and appear only while it is
                selected. Two scales of the same convention, which is how a real
                sheet works.

                The unit divisor matches the scale the rest of this svg is drawn
                at — its `fontSize={6}` notes against Edappadi's 286-unit box —
                so the annotation reads at the same optical weight as the plan's
                own notes on any traced sheet, not just this one. */}
            {selected && <PlotDimensions plot={selected} unitsPerPx={vw / 380} />}
          </svg>
        </div>
      </div>
      </div>

      {/* ---- the plot sheet ----
          A bottom sheet on a phone, a right-hand drawer from `sm` up. It is
          `fixed`, so it is always fully visible however far down the drawing
          you have scrolled and however deep you have zoomed — which an
          anchored card on a 700px-tall plan can never be. It is also the shape
          the Jamin Bazaar app already uses for the same record, so the two
          products show a plot the same way. */}
      {/* ⚠️ PORTALLED, for the reason recorded in Gallery.tsx: `body > main`
          carries `z-index: 2` and is therefore a stacking context, so this
          sheet's z-50 was only 50 INSIDE main and the sticky header — a sibling
          of main at z-40 — painted straight over its top edge. The reported
          symptom was the "Plot 12" heading disappearing behind the navbar.
          ⚠️ It also no longer runs to `inset-y-0` on desktop: even clear of the
          stacking bug, a full-height drawer starts underneath a sticky header.
          It now begins below the header and the offset is shared, so the two
          can never drift apart. */}
      {selected && createPortal(
        <>
          {/* Scrim on a phone only. On a wider screen the drawer sits beside
              the plan and you want to keep seeing the plot you picked. */}
          <div
            className="fixed inset-0 z-[55] bg-ink/40 sm:hidden"
            aria-hidden="true"
            onClick={() => setSelected(null)}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-label={`Plot ${selected.plot} details`}
            className="fixed inset-x-0 bottom-0 z-[60] max-h-[85vh] overflow-y-auto rounded-t-[1.5rem] border-t border-line bg-canvas shadow-raise sm:bottom-0 sm:left-auto sm:right-0 sm:top-[var(--header-h)] sm:max-h-none sm:w-[26rem] sm:rounded-none sm:rounded-l-[1.5rem] sm:border-l sm:border-t-0"
            style={{ animation: "reveal 0.35s var(--ease-silk) both" }}
          >
            <PlotSheet
              plot={selected}
              plan={plan}
              title={title}
              unit={unit}
              closeRef={closeRef}
              onClose={() => setSelected(null)}
            />
          </div>
        </>,
        document.body,
      )}

      {!selected && (
        <p className="mt-phi3 flex items-center gap-2 text-base text-ink-muted">
          <span
            aria-hidden="true"
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-jamin-gold-soft text-tiny text-jamin-gold-ink"
          >
            ☝
          </span>
          Tap any plot on the plan for its dimensions, facing and road width.
        </p>
      )}

    </div>
  );
}

/**
 * The drawing's own particulars — approval identifiers on the left, the area
 * statement on the right, and the conditions printed on the plan below.
 *
 * ⚠️ LIFTED OUT OF `MasterPlan` ON 2026-08-13 so it can sit under EITHER view.
 * The owner asked for a plan/blocks switch with "all functions remain the
 * same", and these particulars are the most load-bearing thing on the section:
 * the approval number, the sanctioned authority and the area statement are the
 * evidence the whole page rests on. Leaving them inside the drawing would have
 * meant a reader who preferred the block view silently lost them.
 */
export function PlanParticulars({ plan, unit }: { plan: PlotPlan; unit: Unit }) {
  return (
    <>
  {/* the drawing's own particulars */}
  {(plan.approvalNo || plan.areaStatement?.length) && (
    /* ⚠️ A DIVIDED PAIR, and the divider is the point.
       Reported as "the information should be clearly divided into left and
       right sections… ensure both sections have clear and equal visual
       space… use a simple divider or spacing between the two". It was
       already `lg:grid-cols-2`, so the split existed; what it lacked was any
       mark saying where one section ends and the other begins, and at `lg`
       the two 253px columns were narrow enough that the reader had to infer
       it from alignment alone.
       `lg:gap-phi5` + a hairline on the right column gives the boundary;
       below `lg` the columns stack and the rule would be a line across the
       middle of nothing, so it is scoped to `lg` and the Area statement's
       own heading carries the separation on a phone. */
    <div className="mt-phi4 grid gap-phi4 border-t border-line pt-phi3 lg:grid-cols-2 lg:gap-phi5">
      {/* ⚠️ `@container`, so PlanRow can respond to THIS COLUMN's width
          rather than the viewport's. The column is 242px at 1024 and 337px
          at 1440 on a page whose main content sits beside a sticky aside —
          a viewport breakpoint cannot see that difference and would pick the
          wrong layout at one of the two. */}
      <dl className="@container space-y-2 text-base">
        {plan.approvalNo && <PlanRow label="Approval no." value={plan.approvalNo} />}
        {plan.authority && <PlanRow label="Sanctioned by" value={plan.authority} />}
        {plan.surveyNos && <PlanRow label="Survey numbers" value={plan.surveyNos} />}
        {plan.village && (
          <PlanRow
            label="Village"
            value={[plan.village, plan.taluk ? `${plan.taluk} taluk` : null].filter(Boolean).join(", ")}
          />
        )}
        {plan.scale && <PlanRow label="Scale" value={plan.scale} />}
      </dl>

      {plan.areaStatement?.length ? (
        <div className="lg:border-l lg:border-line lg:pl-phi5">
          {/* h3: this sits under the "The layout" h2, and h4 would skip a level. */}
          <h3 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
            Area statement
          </h3>
          <ul className="mt-phi2 divide-y divide-line border-y border-line">
            {plan.areaStatement.map((a) => (
              <li key={a.label} className="flex items-baseline justify-between gap-4 py-2.5">
                <span className="text-base text-ink-soft">{a.label}</span>
                <span className="shrink-0 text-base text-ink">
                  {a.areaSqm != null ? fmtArea(a.areaSqm, unit) : ""}
                  {a.percent != null ? ` · ${a.percent}%` : ""}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )}

  {plan.notes?.length ? (
    <details className="mt-phi3 rounded-card border border-line bg-canvas-alt p-phi3">
      <summary className="cursor-pointer text-base font-medium text-ink">
        Conditions printed on the approved plan
      </summary>
      <ul className="mt-phi2 space-y-2">
        {plan.notes.map((n, i) => (
          <li key={i} className="flex gap-2.5 text-base leading-relaxed text-ink-muted">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-ink-faint" />
            {n}
          </li>
        ))}
      </ul>
    </details>
  ) : null}
    </>
  );
}


/** What a plot actually is, in the space a floating card allows. */
/**
 * The whole plot record, laid out the way the Jamin Bazaar app lays it out —
 * because a buyer who has seen one should recognise the other. Every row is
 * read from the traced drawing; nothing here is computed or estimated.
 */
function PlotSheet({
  plot,
  plan,
  title,
  unit,
  closeRef,
  onClose,
}: {
  plot: Plot;
  plan: PlotPlan;
  title: string;
  unit: Unit;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const s = PLOT_STATUS[plotStatus(plot)];
  const available = plotStatus(plot) === "available";

  /**
   * ⚠️ THE SHEET KEEPS BOTH UNITS, WHICHEVER ONE IS SELECTED, and it is the one
   * place on the plan that does.
   *
   * Everywhere else the switch replaces the figure, because a caption on a
   * drawing has room for one number. This is the record of a specific plot —
   * the thing a buyer screenshots and takes to a surveyor — so the sanctioned
   * metre value stays beside the converted one rather than behind a toggle they
   * may not have noticed. `size_sqft` is stored, not derived, which is why it
   * leads: it is what the approved schedule itself says.
   */
  const record: [string, string][] = [["Plot number", plot.plot]];
  if (plot.block) record.push(["Block", plot.block]);
  if (plot.size_sqft != null)
    record.push(["Area", `${Math.round(plot.size_sqft).toLocaleString("en-IN")}\u00a0sq\u00a0ft`]);
  if (plot.size_sqm != null) record.push(["Area (sanctioned)", `${plot.size_sqm}\u00a0m²`]);
  if (plot.dim_m) record.push(["Dimensions", fmtDims(plot.dim_m, unit)]);
  if (plot.facing) record.push(["Facing", plot.facing]);
  if (plot.road_m != null) record.push(["Road width", fmtLength(plot.road_m, unit)]);

  const approval: [string, string][] = [];
  if (plan.approvalNo) approval.push(["DTCP application", plan.approvalNo]);
  if (plan.authority) approval.push(["Approving authority", plan.authority]);
  if (plan.scale) approval.push(["Drawing scale", plan.scale]);
  if (plan.surveyNos) approval.push(["Survey nos.", plan.surveyNos]);
  if (plan.village)
    approval.push(["Village / Taluk", [plan.village, plan.taluk].filter(Boolean).join(" / ")]);

  return (
    <div className="p-phi3 sm:p-phi4">
      {/* the grab handle a bottom sheet is expected to have */}
      <div
        className="mx-auto mb-phi3 h-1 w-10 rounded-full bg-line sm:hidden"
        aria-hidden="true"
      />

      <div className="flex items-start justify-between gap-3">
        <div>
          {plot.block && (
            <div className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
              Block {plot.block}
            </div>
          )}
          <h3 className="mt-1 text-3xl text-ink">Plot {plot.plot}</h3>
        </div>
        <div className="flex items-center gap-2">
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em]"
            style={{ background: s.fill, color: s.text }}
          >
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: s.stroke }}
              aria-hidden="true"
            />
            {s.label}
          </span>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={`Close plot ${plot.plot}`}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-line text-ink-faint transition-colors hover:border-ink/30 hover:text-ink"
          >
            ✕
          </button>
        </div>
      </div>

      <p className="mt-phi2 text-lg text-ink-muted">Pricing on request</p>

      <SheetSection label="Plot record">
        <dl className="divide-y divide-line">
          {record.map(([k, v]) => (
            <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
              <dt className="text-base text-ink-muted">{k}</dt>
              {/* ⚠️ `ledger` for tabular figures. The rows were already ruled;
                  what they were not was ALIGNED — "2,403 sq ft" and "12.2 × 18.3 m"
                  set in proportional figures put their digits in different
                  places on every line, so a column of measurements read as a
                  list of unrelated strings. Tabular figures are the whole reason
                  this class exists, and the record of a plot is the most
                  literally ledger-like thing on the site. */}
              <dd className="ledger text-right text-base font-medium text-ink">{v}</dd>
            </div>
          ))}
        </dl>
        {plot.facing && (
          <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
            Facing is read from the plan and is not itself part of the DTCP approval.
          </p>
        )}
      </SheetSection>

      <SheetSection label="Cost">
        {/* §74 — every plot in this database is unpriced today. Saying so is the
            only honest option; an estimate on land somebody may actually buy
            would be far worse than a blank. */}
        <div className="rounded-card border border-line bg-canvas-alt p-phi3">
          <p className="text-base font-medium text-ink">
            Pricing for this layout is not published yet.
          </p>
          <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
            Every measurement above is confirmed against the sanctioned drawing. Talk to the sales
            desk for the current rate and charges on plot {plot.plot}.
          </p>
        </div>

        {/* A plot that is not available gets no booking button. There is
            nothing to book and the answer would only be "that one is gone". */}
        {available ? (
          <a
            href="#visit"
            onClick={onClose}
            className="mt-phi3 flex justify-center rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-500 hover:-translate-y-0.5 hover:bg-jamin-red-deep hover:shadow-raise"
            style={{ transitionTimingFunction: "var(--ease-silk)" }}
          >
            Book a visit for plot {plot.plot}
          </a>
        ) : (
          <p className="mt-phi3 rounded-card bg-canvas-sunken px-phi3 py-2.5 text-base text-ink-soft">
            This plot is {s.label.toLowerCase()}. Ask the desk what else is open in {title}.
          </p>
        )}
      </SheetSection>

      {approval.length > 0 && (
        <SheetSection label="Approval">
          <dl className="divide-y divide-line">
            {approval.map(([k, v]) => (
              <div key={k} className="flex items-baseline justify-between gap-4 py-2.5">
                <dt className="shrink-0 text-base text-ink-muted">{k}</dt>
                <dd className="text-right text-base font-medium text-ink">{v}</dd>
              </div>
            ))}
          </dl>
        </SheetSection>
      )}

      <p className="mt-phi4 border-t border-line pt-phi3 text-tiny leading-relaxed text-ink-faint">
        Availability shown here is the state in our own records at the last update. The sales desk
        confirms it at the time of booking.
      </p>
    </div>
  );
}

function SheetSection({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <section className="mt-phi4">
      <h4 className="text-micro font-semibold uppercase tracking-brand text-ink-faint">{label}</h4>
      <div className="mt-phi2">{children}</div>
    </section>
  );
}

/**
 * ⚠️ A TWO-TRACK GRID, NOT `flex flex-wrap justify-between`.
 *
 * The report's line is "keep labels and corresponding values aligned within
 * their respective columns", and wrapping flex cannot do that: when a value is
 * too long for the space left beside its label it becomes a new flex line, and
 * `justify-between` on a single item puts it at flex-start — so "Directorate of
 * Town and Country Planning" dropped to a full-width line hard against the left
 * margin while "1:1000" stayed right-aligned two rows below. Measured at 1024,
 * where the containing column is 253px, FOUR of the five rows did that; the
 * left column read as a ragged stack rather than a set of pairs.
 *
 * With a grid the value keeps its own track and wraps INSIDE it, right-aligned,
 * at every width — which is also what the reference design in the report shows.
 * `minmax(0,auto)` on the label lets a long label shrink rather than pushing the
 * value out of the box.
 *
 * ⚠️ IT PAIRS ONLY WHEN THE COLUMN CAN AFFORD IT — `@[19rem]`, a CONTAINER
 * query on the `dl`, not a viewport breakpoint. Forced side-by-side at every
 * width just moves the damage: at 1024 the column is 242px, the label eats 110
 * of it and "214/1B, 214/2, 215/1" came back as three lines and "Directorate of
 * Town and Country Planning" as four. Under 304px the pair stacks — label over
 * value, both left — which is the same information in two clean lines. The
 * threshold is the width at which a two-line value becomes the exception rather
 * than the rule; re-measure it if the labels are ever rewritten longer.
 */
function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-x-phi3 border-b border-line pb-2 @[19rem]:grid-cols-[minmax(0,auto)_minmax(0,1fr)] @[19rem]:items-baseline">
      <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="mt-0.5 text-base text-ink @[19rem]:mt-0 @[19rem]:text-right">{value}</dd>
    </div>
  );
}
