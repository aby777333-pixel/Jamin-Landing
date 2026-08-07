"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { PLOT_STATUS, plotArea, plotStatus, plotStatusKey, type Plot, type PlotPlan } from "@/lib/properties";

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
}: {
  plots: Plot[];
  plan: PlotPlan;
  title: string;
}) {
  const [selected, setSelected] = useState<Plot | null>(null);
  const [zoomIx, setZoomIx] = useState(0);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const frameRef = useRef<HTMLDivElement>(null);

  const geo = useMemo(() => plots.filter((p) => Array.isArray(p.poly) && p.poly.length >= 3), [plots]);
  const key = useMemo(() => plotStatusKey(plots), [plots]);
  const [vx, vy, vw, vh] = plan.viewBox ?? [0, 0, 100, 100];
  const zoom = ZOOMS[zoomIx];

  const pts = (poly: [number, number][]) => poly.map(([x, y]) => `${x},${y}`).join(" ");

  // Escape closes the floater, and so does a click anywhere outside the plan.
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    const onDown = (e: MouseEvent) => {
      if (frameRef.current && !frameRef.current.contains(e.target as Node)) setSelected(null);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("mousedown", onDown);
    };
  }, [selected]);

  /**
   * Where the floater goes.
   *
   * The plot's label point is in the drawing's own coordinate space and the SVG
   * fills its wrapper with a viewBox, so the plot's position as a FRACTION of
   * the wrapper is exactly `(x - vx) / vw`. Percentages therefore survive every
   * zoom step and every screen width without measuring one pixel at runtime.
   *
   * ⚠️ Clipping is prevented by CSS `clamp()`, not by a rule of thumb. A first
   * attempt hung the card off the anchor point and clipped the frame edge on 4
   * of Edappadi's 27 plots and the top edge on 2 more. Pinning the card to a
   * corner of the frame instead was worse: this frame is as tall as the drawing
   * — around 2,400px — so "the corner" is a long way from the plot you clicked.
   *
   * So: anchored, but clamped between a gutter and (100% − the card's own size).
   * That needs the card's size to be KNOWN, which is why it is a fixed 17rem
   * wide and capped at 21rem tall with its own scroll. The vertical case
   * anchors by `bottom` rather than translating, so the same clamp works in
   * both directions.
   */
  const CARD_W = 17; // rem — must match the class below
  // ⚠️ Keep the card SHORT. At 21rem it was half the height of Edappadi's
  // 709px frame, so for any plot near the middle there was no room either
  // above or below and the clamp dragged it back over the plot it described.
  // 17rem is the card's natural height and still clears both ways for every
  // plot in that layout — measured, not guessed.
  const CARD_H = 17; // rem — the max-height cap, likewise
  const GAP = 0.75; // rem of gutter, and of clearance from the plot

  const anchor = useMemo(() => {
    if (!selected?.at) return null;
    const fx = ((selected.at[0] - vx) / vw) * 100;
    const fy = ((selected.at[1] - vy) / vh) * 100;

    // Clear the plot's own OUTLINE, not its label point. Anchoring off the
    // centre put the card over the bottom half of every plot it described —
    // the polygon's own bounding box is right there, so use it.
    const ys = (selected.poly ?? []).map(([, y]) => y);
    const topPct = ys.length ? ((Math.min(...ys) - vy) / vh) * 100 : fy;
    const bottomPct = ys.length ? ((Math.max(...ys) - vy) / vh) * 100 : fy;

    const clampCss = (pct: number) =>
      `clamp(${GAP}rem, calc(${pct}% + ${GAP}rem), calc(100% - ${CARD_H + GAP}rem))`;
    return {
      left: `clamp(${GAP}rem, calc(${fx}% - ${CARD_W / 2}rem), calc(100% - ${CARD_W + GAP}rem))`,
      // Below the plot in the top half of the plan, above it in the bottom half.
      ...(fy < 50 ? { top: clampCss(bottomPct) } : { bottom: clampCss(100 - topPct) }),
    };
  }, [selected, vx, vy, vw, vh]);

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
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ background: s.stroke }}
                  aria-hidden="true"
                />
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
      <div ref={frameRef} className="mt-phi3">
      <div className="overflow-auto rounded-xl border border-line bg-canvas-alt shadow-lift">
        <div className="relative" style={{ width: `${zoom * 100}%` }}>
          <svg
            viewBox={`${vx} ${vy} ${vw} ${vh}`}
            className="block h-auto w-full"
            role="img"
            aria-label={`Approved layout plan for ${title}, ${geo.length} plots`}
          >
            {/* site boundary */}
            {plan.boundary && plan.boundary.length > 2 && (
              <polygon
                points={pts(plan.boundary)}
                fill="#FFFDFA"
                stroke="#17181C"
                strokeWidth={1.2}
              />
            )}

            {/* road bands */}
            {(plan.roads ?? []).map((r, i) => {
              const [x1, y1, x2, y2] = r.band;
              return (
                <g key={`road-${i}`}>
                  <rect
                    x={Math.min(x1, x2)}
                    y={Math.min(y1, y2)}
                    width={Math.abs(x2 - x1)}
                    height={Math.abs(y2 - y1)}
                    fill="#F2EDE4"
                    stroke="#D8D0C2"
                    strokeWidth={0.5}
                  />
                  {r.label && (
                    <text
                      x={(x1 + x2) / 2}
                      y={(y1 + y2) / 2 + 2.5}
                      textAnchor="middle"
                      fontSize={6}
                      fill="#6B6F7A"
                      letterSpacing="0.5"
                    >
                      {r.label}
                    </text>
                  )}
                </g>
              );
            })}

            {/* existing road outside the site */}
            {plan.existingRoad?.quad && (
              <g>
                <polygon points={pts(plan.existingRoad.quad)} fill="#EDE6DA" stroke="#D8D0C2" strokeWidth={0.5} />
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
                    fill="#6B6F7A"
                  >
                    {plan.existingRoad.label}
                  </text>
                )}
              </g>
            )}

            {/* open space reservation */}
            {plan.osr?.polygon && (
              <g>
                <polygon points={pts(plan.osr.polygon)} fill="#EAF3F0" stroke="#1F5D4C" strokeWidth={0.7} />
                <text
                  x={plan.osr.polygon.reduce((s, p) => s + p[0], 0) / plan.osr.polygon.length}
                  y={plan.osr.polygon.reduce((s, p) => s + p[1], 0) / plan.osr.polygon.length}
                  textAnchor="middle"
                  fontSize={9}
                  fontWeight={600}
                  fill="#1F5D4C"
                >
                  {plan.osr.label ?? "O.S.R."}
                </text>
                {plan.osr.areaSqm && (
                  <text
                    x={plan.osr.polygon.reduce((s, p) => s + p[0], 0) / plan.osr.polygon.length}
                    y={plan.osr.polygon.reduce((s, p) => s + p[1], 0) / plan.osr.polygon.length + 9}
                    textAnchor="middle"
                    fontSize={6}
                    fill="#1F5D4C"
                  >
                    {plan.osr.areaSqm.toLocaleString("en-IN")} sq m
                  </text>
                )}
              </g>
            )}

            {/* dimension lines from the sanctioned drawing */}
            {(plan.dimensions ?? []).map((d, i) => (
              <g key={`dim-${i}`} stroke="#9AA0AB" strokeWidth={0.4}>
                <line x1={d.from[0]} y1={d.from[1]} x2={d.to[0]} y2={d.to[1]} strokeDasharray="3 2" />
                {d.label && (
                  <text
                    x={(d.from[0] + d.to[0]) / 2}
                    y={(d.from[1] + d.to[1]) / 2 - 2}
                    textAnchor="middle"
                    fontSize={6}
                    fill="#6B6F7A"
                    stroke="none"
                  >
                    {d.label}
                  </text>
                )}
              </g>
            ))}

            {/* plots */}
            {geo.map((p) => {
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
                  onClick={() => setSelected(active ? null : p)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(active ? null : p);
                    }
                  }}
                  className="cursor-pointer outline-none [&:focus-visible>polygon]:stroke-[2.5] [&:focus-visible>polygon]:stroke-jamin-red"
                  opacity={dimmed ? 0.25 : 1}
                >
                  <polygon
                    points={pts(p.poly!)}
                    fill={active ? "#FDECEC" : s.fill}
                    stroke={active ? "#E11B22" : s.stroke}
                    strokeWidth={active ? 2.2 : 0.8}
                    className="transition-all duration-200"
                  />
                  {p.at && (
                    <text
                      x={p.at[0]}
                      y={p.at[1]}
                      textAnchor="middle"
                      fontSize={8}
                      fontWeight={700}
                      fill={active ? "#A81219" : s.text}
                      pointerEvents="none"
                    >
                      {p.plot}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>

          {/* ---- the floater, anchored to its plot ---- */}
          {selected && anchor && (
            <div
              className="glass absolute z-10 max-h-[17rem] w-[17rem] max-w-[calc(100%-1.5rem)] overflow-y-auto rounded-xl p-phi2"
              style={{ ...anchor, animation: "reveal 0.3s var(--ease-silk) both" }}
            >
              <PlotFloater plot={selected} onClose={() => setSelected(null)} />
            </div>
          )}
        </div>
      </div>
      </div>

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

      {/* the drawing's own particulars */}
      {(plan.approvalNo || plan.areaStatement?.length) && (
        <div className="mt-phi4 grid gap-phi4 border-t border-line pt-phi3 lg:grid-cols-2">
          <dl className="space-y-2 text-base">
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
            <div>
              {/* h3: this sits under the "The layout" h2, and h4 would skip a level. */}
              <h3 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
                Area statement
              </h3>
              <ul className="mt-phi2 divide-y divide-line border-y border-line">
                {plan.areaStatement.map((a) => (
                  <li key={a.label} className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="text-base text-ink-soft">{a.label}</span>
                    <span className="shrink-0 text-base text-ink">
                      {a.areaSqm != null ? `${a.areaSqm.toLocaleString("en-IN")} sq m` : ""}
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
    </div>
  );
}

/** What a plot actually is, in the space a floating card allows. */
function PlotFloater({ plot, onClose }: { plot: Plot; onClose: () => void }) {
  const s = PLOT_STATUS[plotStatus(plot)];
  const facts: [string, string][] = [];
  if (plot.dim_m) facts.push(["Dimensions", `${plot.dim_m} m`]);
  if (plot.facing) facts.push(["Facing", plot.facing]);
  if (plot.road_m != null) facts.push(["Road width", `${plot.road_m} m`]);
  if (plot.size_sqm != null) facts.push(["Extent", `${plot.size_sqm} sq m`]);

  const available = plotStatus(plot) === "available";

  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
          Plot {plot.plot}
          {plot.block ? ` · ${plot.block}` : ""}
        </span>
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-micro font-semibold uppercase tracking-[0.08em]"
          style={{ background: s.fill, color: s.text }}
        >
          <span className="h-1.5 w-1.5 rounded-full" style={{ background: s.stroke }} aria-hidden="true" />
          {s.label}
        </span>
        <button
          type="button"
          onClick={onClose}
          aria-label={`Close plot ${plot.plot}`}
          className="-mr-1 ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-tiny text-ink-faint transition-colors hover:bg-canvas-sunken hover:text-ink"
        >
          ✕
        </button>
      </div>

      <div className="mt-1 text-xl leading-tight text-ink">
        {plotArea(plot) ?? "Area on request"}
      </div>

      {facts.length > 0 && (
        <dl className="mt-phi2 grid grid-cols-2 gap-x-3 gap-y-1.5 border-t border-line pt-phi2">
          {facts.map(([k, v]) => (
            <div key={k}>
              <dt className="text-micro uppercase tracking-[0.1em] text-ink-faint">{k}</dt>
              <dd className="text-base leading-tight text-ink">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {/* §74 — every plot is unpriced in the database today. Saying so is the
          only honest option; an estimate on land somebody may actually buy
          would be far worse than a blank. */}
      <p className="mt-phi2 text-micro leading-snug text-ink-muted">
        Rate confirmed by the sales desk — we publish no estimates.
      </p>

      {/* A sold plot gets no enquiry button. There is nothing to enquire about
          and the answer would only be "that one is gone". */}
      {available ? (
        <a
          href="#visit"
          onClick={onClose}
          className="mt-phi2 flex justify-center rounded-full bg-jamin-red px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors duration-300 hover:bg-jamin-red-deep"
        >
          Ask about plot {plot.plot}
        </a>
      ) : (
        <p className="mt-phi2 rounded-card bg-canvas-sunken px-2.5 py-1.5 text-micro text-ink-soft">
          {s.label}. Ask the desk what else is open here.
        </p>
      )}
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-2">
      <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="text-base text-ink">{value}</dd>
    </div>
  );
}
