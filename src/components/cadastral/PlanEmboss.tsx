import type { PlotPlan } from "@/lib/properties";

/**
 * Item 13 (aesthetics round 2026-08-18) — THE EMBOSSED PLAN: the traced
 * sanctioned geometry pressed faintly into the paper behind a panel, like a
 * blind stamp. Drawn from the REAL `plot_plan` boundary and road bands —
 * decoration built from data, never invented geography.
 *
 * The emboss illusion is two hairline copies of the same geometry offset a
 * whisper apart: a light stroke up-left (the raised lip) and a dark stroke
 * down-right (the pressed shadow), both token-mixed from ink/canvas so the
 * carbon mode derives its own relief for free.
 *
 * Decoration by construction: `aria-hidden`, `pointer-events-none`, and it
 * renders nothing when the plan carries no boundary. Position with
 * utilities at the call site (absolute inside an `isolate` panel, -z-10 —
 * the homepage stamp's own rules).
 */
export function PlanEmboss({ plan, className = "" }: { plan: PlotPlan; className?: string }) {
  if (!plan.viewBox || !plan.boundary || plan.boundary.length < 3) return null;
  const [vx, vy, vw, vh] = plan.viewBox;
  const pts = (poly: [number, number][]) => poly.map(([x, y]) => `${x},${y}`).join(" ");
  const off = Math.max(vw, vh) / 600; // the whisper, in drawing units

  const shapes = (
    <>
      <polygon points={pts(plan.boundary)} />
      {(plan.roads ?? []).map((r, i) => {
        const [x, y, w, h] = r.band;
        return <rect key={i} x={x} y={y} width={w} height={h} />;
      })}
    </>
  );

  return (
    <svg
      viewBox={`${vx} ${vy} ${vw} ${vh}`}
      className={className}
      aria-hidden="true"
      focusable="false"
      preserveAspectRatio="xMidYMid meet"
    >
      {/* the raised lip — light, up-left */}
      <g
        transform={`translate(${-off} ${-off})`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-canvas) 85%, white)"
        strokeWidth={off * 2}
        opacity="0.9"
      >
        {shapes}
      </g>
      {/* the pressed shadow — dark, down-right */}
      <g
        transform={`translate(${off} ${off})`}
        fill="none"
        stroke="color-mix(in srgb, var(--color-ink) 18%, transparent)"
        strokeWidth={off * 2}
      >
        {shapes}
      </g>
    </svg>
  );
}
