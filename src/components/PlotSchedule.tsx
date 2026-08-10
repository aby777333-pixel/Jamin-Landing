"use client";

import { useMemo, useState } from "react";
import { PLOT_STATUS, plotArea, plotStatus, plotStatusKey, type Plot } from "@/lib/properties";

/**
 * The layout for a project whose plan has NOT been traced.
 *
 * Shastri Nagar has 16 schedule rows and a flat scan of the drawing — no
 * polygons — so there is nothing to click on the image. Rather than print a
 * colour key the picture cannot honour, the plots become a grid of real tiles
 * driven by the same status data. The key and the tiles are generated from one
 * source, so they can never disagree.
 */
export function PlotSchedule({ plots }: { plots: Plot[] }) {
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
          <p className="mt-phi2 text-base text-ink-soft">
            {[plotArea(selected), selected.facing ? `${selected.facing} facing` : null]
              .filter(Boolean)
              .join(" · ") || "Details on request"}
          </p>
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
        <p className="mt-phi3 text-base text-ink-muted">
          Tap a plot number for its extent and facing.
        </p>
      )}
    </div>
  );
}
