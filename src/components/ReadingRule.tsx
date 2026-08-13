"use client";

import { useEffect } from "react";

/**
 * A champagne hairline across the top of a long article, filled as the reader
 * moves through it.
 *
 * ⚠️ DECORATION, AND IT HAS TO STAY THAT WAY. It reports nothing the scrollbar
 * does not already report, so it is `aria-hidden` and carries no role — a
 * progressbar role would promise a screen reader something meaningful, and this
 * is a stripe.
 *
 * ⚠️ NO `requestAnimationFrame`. The obvious build throttles the scroll handler
 * through rAF, and this codebase has already paid for that: a pane that is not
 * compositing never fires one, so the rule would sit at zero in exactly the
 * situation where it is being tested. Writing the custom property straight from
 * the scroll event is cheap — `transform: scaleX()` off a custom property never
 * touches layout — and it works whether or not frames are being produced.
 *
 * ⚠️ `passive: true`. A non-passive scroll listener on a long article is a
 * measurable scroll-jank source on a phone, and nothing here calls
 * `preventDefault`.
 */
export function ReadingRule() {
  useEffect(() => {
    const el = document.getElementById("rj-reading-rule");
    if (!el) return;

    const update = () => {
      const doc = document.documentElement;
      /* The distance actually scrollable. On a page shorter than the viewport
         this is 0, and dividing by it would put the rule permanently full. */
      const max = doc.scrollHeight - doc.clientHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      el.style.setProperty("--rj-read", String(p));
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update, { passive: true });
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  return <div id="rj-reading-rule" className="rj-reading-rule" aria-hidden="true" />;
}
