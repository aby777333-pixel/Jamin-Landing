"use client";

import { useMemo, useState } from "react";
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

  const geo = useMemo(() => plots.filter((p) => Array.isArray(p.poly) && p.poly.length >= 3), [plots]);
  const key = useMemo(() => plotStatusKey(plots), [plots]);
  const [vx, vy, vw, vh] = plan.viewBox ?? [0, 0, 100, 100];
  const zoom = ZOOMS[zoomIx];

  const pts = (poly: [number, number][]) => poly.map(([x, y]) => `${x},${y}`).join(" ");

  return (
    <div>
      {/* controls */}
      <div className="flex flex-wrap items-center justify-between gap-phi2">
        <div className="flex flex-wrap items-center gap-2">
          {key.map(({ status, count }) => {
            const s = PLOT_STATUS[status];
            return (
              <span
                key={status}
                className="inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-tiny text-ink-soft"
              >
                <span
                  className="h-3 w-3 rounded-[3px] border"
                  style={{ background: s.fill, borderColor: s.stroke }}
                  aria-hidden="true"
                />
                {s.label}
                <span className="text-ink-faint">{count}</span>
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

      {/* the drawing — scrollable at zoom, so a phone can pan it */}
      <div className="mt-phi3 overflow-auto rounded-card border border-line bg-canvas-alt">
        <div style={{ width: `${zoom * 100}%` }}>
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
                <g
                  key={p.plot}
                  onClick={() => setSelected(active ? null : p)}
                  className="cursor-pointer"
                  opacity={dimmed ? 0.25 : 1}
                >
                  <polygon
                    points={pts(p.poly!)}
                    fill={s.fill}
                    stroke={active ? "#E11B22" : s.stroke}
                    strokeWidth={active ? 2 : 0.8}
                  />
                  {p.at && (
                    <text
                      x={p.at[0]}
                      y={p.at[1]}
                      textAnchor="middle"
                      fontSize={8}
                      fontWeight={700}
                      fill={active ? "#E11B22" : s.text}
                      pointerEvents="none"
                    >
                      {p.plot}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* selected plot */}
      <div className="mt-phi3">
        {selected ? (
          <div className="rounded-card border border-line bg-canvas p-phi3 shadow-lift">
            <div className="flex flex-wrap items-start justify-between gap-phi2">
              <div>
                <div className="text-micro font-semibold uppercase tracking-brand text-jamin-gold">
                  Plot {selected.plot}
                  {selected.block ? ` · Block ${selected.block}` : ""}
                </div>
                <div className="mt-1 text-xl text-ink">{plotArea(selected) ?? "Area on request"}</div>
              </div>
              <span
                className="rounded-full px-3 py-1 text-micro font-semibold uppercase tracking-[0.1em]"
                style={{
                  background: PLOT_STATUS[plotStatus(selected)].fill,
                  color: PLOT_STATUS[plotStatus(selected)].text,
                }}
              >
                {PLOT_STATUS[plotStatus(selected)].label}
              </span>
            </div>

            <dl className="mt-phi3 grid grid-cols-2 gap-phi2 sm:grid-cols-4">
              {selected.dim_m && <PlotFact label="Dimensions" value={`${selected.dim_m} m`} />}
              {selected.facing && <PlotFact label="Facing" value={selected.facing} />}
              {selected.road_m != null && <PlotFact label="Road width" value={`${selected.road_m} m`} />}
              {selected.size_sqm != null && (
                <PlotFact label="Extent" value={`${selected.size_sqm} sq m`} />
              )}
            </dl>

            {/* §74 — every plot is unpriced in the database today. Saying so is
                the only honest option; an estimate on land someone may buy
                would be far worse than a blank. */}
            <p className="mt-phi3 border-t border-line pt-phi2 text-tiny leading-relaxed text-ink-muted">
              The rate for this plot is confirmed by the sales desk — we do not publish estimates.
            </p>
            <a
              href="/contact"
              className="mt-phi2 inline-flex rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
            >
              Enquire about plot {selected.plot}
            </a>
          </div>
        ) : (
          <p className="text-base text-ink-muted">
            Tap any plot on the plan to see its dimensions, facing and road width.
          </p>
        )}
      </div>

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
              <h4 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
                Area statement
              </h4>
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

function PlotFact({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-micro font-semibold uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="mt-1 text-base text-ink">{value}</dd>
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
