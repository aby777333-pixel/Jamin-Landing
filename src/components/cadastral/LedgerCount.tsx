"use client";

import { useEffect, useRef, useState } from "react";
import { useCanAnimate, useInView } from "@/hooks/useInView";

/**
 * A figure that counts up once, on the way in.
 *
 * ⚠️ This only works because of the tabular figures shipped in phase 1. With
 * proportional numerals every tick would be a different width — "111" is 26.9px
 * narrower than "000" in Inter — so the number would visibly jitter and shove
 * the words beside it back and forth for the whole 900ms. `.ledger` is what
 * makes the column stand still while the value changes.
 *
 * Renders the final value server-side so the figure is in the HTML a crawler
 * reads, and so a reader with JavaScript off or reduced motion on sees the
 * number rather than a zero.
 */
export function LedgerCount({
  value,
  suffix = "",
  className = "",
}: {
  value: number;
  suffix?: string;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLSpanElement>();
  const canAnimate = useCanAnimate();
  const [n, setN] = useState(value);
  const done = useRef(false);

  useEffect(() => {
    if (!inView || done.current || !canAnimate) return;

    done.current = true;
    let raf = 0;
    const t0 = performance.now();
    const DUR = 900;

    // ⚠️ Every setState happens inside the frame callback, never in the effect
    // body. The first tick lands at p≈0, which is what takes the figure to zero
    // to be counted up — so a reader with no JS, or a crawler, keeps the real
    // number rather than a 0 that would stick.
    const tick = (t: number) => {
      const p = Math.min((t - t0) / DUR, 1);
      // Ease-out cubic: fast at the start, settling rather than stopping.
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value, canAnimate]);

  return (
    <span ref={ref} className={`ledger ${className}`}>
      {/* en-IN so lakhs and crores group the way a reader here expects. */}
      {n.toLocaleString("en-IN")}
      {suffix}
    </span>
  );
}
