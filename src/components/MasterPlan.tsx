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
  const sheetRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  /** So focus can go back where it came from when the sheet closes. */
  const openerRef = useRef<SVGGElement | null>(null);

  const geo = useMemo(() => plots.filter((p) => Array.isArray(p.poly) && p.poly.length >= 3), [plots]);
  const key = useMemo(() => plotStatusKey(plots), [plots]);
  const [vx, vy, vw, vh] = plan.viewBox ?? [0, 0, 100, 100];
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
      {selected && (
        <>
          {/* Scrim on a phone only. On a wider screen the drawer sits beside
              the plan and you want to keep seeing the plot you picked. */}
          <div
            className="fixed inset-0 z-40 bg-ink/40 sm:hidden"
            aria-hidden="true"
            onClick={() => setSelected(null)}
          />
          <div
            ref={sheetRef}
            role="dialog"
            aria-label={`Plot ${selected.plot} details`}
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-[1.5rem] border-t border-line bg-canvas shadow-raise sm:inset-y-0 sm:left-auto sm:right-0 sm:max-h-none sm:w-[26rem] sm:rounded-none sm:rounded-l-[1.5rem] sm:border-l sm:border-t-0"
            style={{ animation: "reveal 0.35s var(--ease-silk) both" }}
          >
            <PlotSheet
              plot={selected}
              plan={plan}
              title={title}
              closeRef={closeRef}
              onClose={() => setSelected(null)}
            />
          </div>
        </>
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
/**
 * The whole plot record, laid out the way the Jamin Bazaar app lays it out —
 * because a buyer who has seen one should recognise the other. Every row is
 * read from the traced drawing; nothing here is computed or estimated.
 */
function PlotSheet({
  plot,
  plan,
  title,
  closeRef,
  onClose,
}: {
  plot: Plot;
  plan: PlotPlan;
  title: string;
  closeRef: React.RefObject<HTMLButtonElement | null>;
  onClose: () => void;
}) {
  const s = PLOT_STATUS[plotStatus(plot)];
  const available = plotStatus(plot) === "available";

  const record: [string, string][] = [["Plot number", plot.plot]];
  if (plot.block) record.push(["Block", plot.block]);
  if (plot.size_sqft != null)
    record.push(["Area", `${Math.round(plot.size_sqft).toLocaleString("en-IN")} sq ft`]);
  if (plot.size_sqm != null) record.push(["Area (m²)", `${plot.size_sqm} m²`]);
  if (plot.dim_m) record.push(["Dimensions", `${plot.dim_m} m`]);
  if (plot.facing) record.push(["Facing", plot.facing]);
  if (plot.road_m != null) record.push(["Road width", `${plot.road_m.toFixed(2)} m`]);

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
              <dd className="text-right text-base font-medium text-ink">{v}</dd>
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

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-3 border-b border-line pb-2">
      <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="text-base text-ink">{value}</dd>
    </div>
  );
}
