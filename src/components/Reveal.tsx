"use client";

import { useEffect, useRef } from "react";

/**
 * Scroll-linked arrival (do-all round, 2026-08-18) — wires the material
 * layer's existing `rj-arrive` choreography to the reader's scroll instead of
 * to mount.
 *
 * 🚨 THE HIDDEN STATE IS ONLY EVER APPLIED BY JAVASCRIPT. The server renders
 * children fully visible; `.rj-reveal-pre` (opacity 0) goes on in an effect,
 * and only for elements still BELOW the viewport at that moment. So a crawler,
 * a no-JS reader and a reader who arrives mid-page all see content — the
 * failure royal.css records for `animation: none` on `rj-arrive` (a hero
 * permanently invisible) is unreachable by construction.
 *
 * Reduced motion bails out before anything is hidden, matching the site-wide
 * collapse of `rj-arrive` in royal.css.
 */
export function Reveal({
  children,
  className,
  decorative = false,
}: {
  children: React.ReactNode;
  className?: string;
  /**
   * ⚠️ Marks the whole wrapper as ornament (`aria-hidden`). Added 2026-08-21
   * for the section folio rows, which were already `aria-hidden` on their own
   * container — wrapping them in a Reveal that could not carry the attribute
   * would have EXPOSED a decorative numeral and a fret pattern to a screen
   * reader, which is a regression dressed as an animation.
   *
   * It is opt-in and defaults off, so the four existing callers are byte
   * identical.
   */
  decorative?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Already on screen (or above it) — animating now would flash content
    // the reader is looking at.
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return;

    el.classList.add("rj-reveal-pre");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          el.classList.remove("rj-reveal-pre");
          el.classList.add("rj-arrive");
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <div ref={ref} className={className} aria-hidden={decorative || undefined}>
      {children}
    </div>
  );
}
