"use client";

import { useRef } from "react";

/**
 * Item 12 — tilt-on-pointer (aesthetics round 2026-08-18). A few degrees of
 * perspective under the cursor, spring-settled on leave.
 *
 * ⚠️ Pointer-type gated: `pointerType === "mouse"` only — a thumb dragging a
 * touch screen must never wrestle a card. Reduced motion bails before any
 * transform. Direct style writes, no state — this must cost nothing per
 * frame beyond the transform itself.
 */
export function Tilt({ children, className }: { children: React.ReactNode; className?: string }) {
  const ref = useRef<HTMLDivElement>(null);

  function onMove(e: React.PointerEvent) {
    if (e.pointerType !== "mouse") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    el.style.transform = `perspective(700px) rotateX(${(-py * 4).toFixed(2)}deg) rotateY(${(px * 5).toFixed(2)}deg)`;
    el.style.transition = "transform 80ms linear";
  }

  function onLeave() {
    const el = ref.current;
    if (!el) return;
    el.style.transition = "transform 600ms var(--ease-silk)";
    el.style.transform = "";
  }

  return (
    <div ref={ref} className={className} onPointerMove={onMove} onPointerLeave={onLeave}>
      {children}
    </div>
  );
}
