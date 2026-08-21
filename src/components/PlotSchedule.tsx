"use client";

import { useMemo, useState } from "react";
import { PLOT_STATUS, plotArea, plotStatus, plotStatusKey, type Plot } from "@/lib/properties";
import { plotRecordRows } from "@/lib/plot-record";
import { type Unit } from "@/lib/units";

/**
 * The layout as a structured block of tiles.
 *
 * Shastri Nagar has 16 schedule rows and a flat scan of the drawing — no
 * polygons — so there is nothing to click on the image. Rather than print a
 * colour key the picture cannot honour, the plots become a grid of real tiles
 * driven by the same status data. The key and the tiles are generated from one
 * source, so they can never disagree.
 *
 * ⚠️ SINCE 2026-08-13 IT IS ALSO A CHOICE, not just a fallback. `LayoutViews`
 * offers it beside the traced drawing on projects that have one, because a
 * drawing answers "where is plot 14" and a block answers "what is there and how
 * big" — and on a phone the second question is far easier to answer in a grid
 * than on a plan you have to pinch. So this component now has to carry the plot
 * RECORD, not just a number: a reader who picks blocks must not end up with
 * less than a reader who picks the plan.
 */
export function PlotSchedule({ plots, unit = "ft" }: { plots: Plot[]; unit?: Unit }) {
  const [selected, setSelected] = useState<Plot | null>(null);
  const key = useMemo(() => plotStatusKey(plots), [plots]);

  return (
    <div>
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

      <div className="mt-phi3 grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
        {plots.map((p) => {
          const st = plotStatus(p);
          const s = PLOT_STATUS[st];
          const active = selected?.plot === p.plot;
          return (
            <button
              key={p.plot}
              type="button"
              onClick={() => setSelected(active ? null : p)}
              aria-pressed={active}
              className="rounded-lg border px-2 py-3 text-center transition-transform hover:-translate-y-0.5"
              style={{
                background: s.fill,
                borderColor: active ? "var(--plot-selected-line)" : s.stroke,
                borderWidth: active ? 2 : 1,
              }}
            >
              <span className="block text-base font-semibold" style={{ color: s.text }}>
                {p.plot}
              </span>
              {p.size_sqft ? (
                <span className="mt-0.5 block text-micro" style={{ color: s.text }}>
                  {Math.round(p.size_sqft).toLocaleString("en-IN")}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>

      {selected ? (
        <div className="mt-phi3 rounded-card border border-line bg-canvas p-phi3">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <span className="text-xl text-ink">Plot {selected.plot}</span>
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
          {/* 🚨 THE FULL RECORD, AS A RULED TABLE (owner 2026-08-21: "in plot
              list and blocks, when a client clicks a plot, there should be a
              table — for example, what is the square feet, facing where, what
              all info u can pull from the sheet").

              ⚠️ THE ROWS COME FROM `plotRecordRows` NOW, THE SAME BUILDER THE
              TRACED PLAN'S PLOT SHEET USES. They were two hand-written lists
              and they had drifted: this one was missing the SANCTIONED metre
              area — the drawing's own figure rather than this site's
              arithmetic — so a reader who chose the grid was quietly getting
              less than one who chose the plan, which is the exact thing
              LayoutViews' header promises never happens.

              ⚠️ ONE COLUMN, NOT TWO. The pairs were in a `sm:grid-cols-2`,
              which puts two label/value pairs on a line and makes the values
              land at two different x positions — the same raggedness report 14
              reported against the Area statement. A single ruled register
              gives every value one right-hand rule, which is what "a table"
              means here. Every row is conditional inside the builder, so a
              project with only a schedule still renders exactly what it did. */}
          <dl className="mt-phi2 divide-y divide-line border-y border-line text-base">
            {plotRecordRows(selected, unit).map(([k, v]) => (
              <div
                key={k}
                className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-4 py-2"
              >
                <dt className="text-tiny uppercase leading-snug tracking-[0.12em] text-ink-faint">
                  {k}
                </dt>
                <dd className="ledger whitespace-nowrap text-right leading-snug text-ink">{v}</dd>
              </div>
            ))}
          </dl>
          {!plotArea(selected) && !selected.facing && (
            <p className="mt-phi2 text-base text-ink-soft">Details on request</p>
          )}
          <p className="mt-phi2 text-tiny leading-relaxed text-ink-muted">
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
        /* ⚠️ "its record", not "its extent and facing" — the older wording
           promised two specific figures, and Edappadi's 61 traced plots carry
           neither (they were traced for their OUTLINES; the schedule figures
           were never entered against them). A hint that names fields the
           record may not hold reads as a fault in the page rather than as a
           gap in the data. */
        <p className="mt-phi3 text-base text-ink-muted">
          Tap a plot number for its record.
        </p>
      )}
    </div>
  );
}
