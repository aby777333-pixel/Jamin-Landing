"use client";

import { useEffect, useRef } from "react";

/**
 * CINEMATIC DEPTH (do-all round #2, 2026-08-18) — the hero photograph drifts
 * slower than the page, so the drawn-document world gains physical depth.
 *
 * ⚠️ Deliberately modest: 14% travel, one rAF-throttled scroll listener, and
 * a 1.12 scale so the drift never reveals the frame's edge. Active only from
 * `xl` (below that the hero is a contained band — nothing to reveal, nothing
 * to drift) and never under `prefers-reduced-motion` — the bail-out happens
 * BEFORE any transform is written, so reduced-motion readers get exactly the
 * static hero they always had.
 *
 * The wrapper is `absolute inset-0`, so a `fill` Image inside positions
 * against it and the `veil` (a sibling, outside) stays put — legibility
 * gradients must not swim.
 */
export function ParallaxLayer({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el || !el.parentElement) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const wide = window.matchMedia("(min-width: 1280px)");
    const parent = el.parentElement;
    let raf = 0;

    const tick = () => {
      raf = 0;
      if (!wide.matches) {
        el.style.transform = "";
        return;
      }
      const r = parent.getBoundingClientRect();
      const progress = Math.min(1, Math.max(0, -r.top / Math.max(1, r.height)));
      el.style.transform = `translateY(${(progress * r.height * 0.14).toFixed(1)}px) scale(1.12)`;
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    tick();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={ref} className="absolute inset-0 will-change-transform">
      {children}
    </div>
  );
}
