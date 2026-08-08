"use client";

import type { ReactNode } from "react";
import { useCanAnimate, useInView } from "@/hooks/useInView";

/**
 * The draughtsman's construction line.
 *
 * Before the heading appears, a hairline rules itself across the space the
 * heading will occupy — the guide line drawn first on any survey sheet — and
 * the words then fade up through it. The line stays as the gold rule beneath.
 *
 * Only `transform` and `opacity` move, and the rule animates `scaleX` rather
 * than `width`, so nothing in this reflows the page. The heading's box is its
 * full size from the first frame, which is what keeps CLS at zero.
 *
 * ⚠️ With reduced motion `useInView` returns true immediately and every
 * transition is already reduced to 0.01ms by the media query in cadastral.css,
 * so the finished state renders at once. The same path is what makes this safe
 * in a tab that never produces frames.
 */
export function SurveyReveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
}: {
  children: ReactNode;
  as?: "div" | "h1" | "h2" | "h3" | "p" | "section";
  className?: string;
  /** Stagger, in ms. The brief caps a chain at four — past that the page feels
   *  slow rather than considered. */
  delay?: number;
}) {
  const { ref, inView } = useInView<HTMLElement>();
  /* Armed only where an animation can actually run. Unarmed, the CSS leaves
     the heading at its finished state, so no-JS and no-observer both read. */
  const armed = useCanAnimate();

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={`cd-reveal ${armed ? "is-armed" : ""} ${inView ? "is-on" : ""} ${className}`}
      style={delay ? ({ "--cd-delay": `${delay}ms` } as React.CSSProperties) : undefined}
    >
      <span className="cd-reveal__rule" aria-hidden="true" />
      <span className="cd-reveal__body">{children}</span>
    </Tag>
  );
}
