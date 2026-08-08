"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

/**
 * Shared scroll-entrance machinery for the cadastral layer.
 *
 * Extracted rather than repeated: `SurveyReveal` and `LedgerCount` both need
 * "has this arrived yet", and two copies of observer code is two places to
 * forget `disconnect()`.
 */

const noSubscribe = () => () => {};
const onServer = () => false;

/**
 * Whether an entrance animation should run at all.
 *
 * ⚠️ Read as an external store, not detected in an effect — the same pattern
 * the URL state and the speech capabilities use. It must be `false` for the
 * server render and the hydration pass, and it never changes afterwards, so
 * there is nothing to subscribe to.
 *
 * ⚠️ This is also what ARMS the effects. Everything animated must default to
 * its finished, visible state and be hidden only once this returns true —
 * because `IntersectionObserver`, like `ResizeObserver`, is delivered through
 * the rendering pipeline and does not fire in a tab producing no frames. If
 * hiding were the default, a reader whose observer never fired would be left
 * looking at invisible headings.
 */
const canAnimateNow = () =>
  typeof window !== "undefined" &&
  typeof IntersectionObserver !== "undefined" &&
  !window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useCanAnimate() {
  return useSyncExternalStore(noSubscribe, canAnimateNow, onServer);
}

/**
 * Fires ONCE and then disconnects. These are entrance effects — a heading that
 * re-draws its rule every time it scrolls back into view is a distraction on
 * the second pass and an irritation on the fifth.
 */
export function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || inView) return;

    // ⚠️ A backstop, not a nicety. If the observer never delivers — a
    // background tab, an off-screen pane — this still resolves, so an armed
    // element cannot be stranded mid-animation.
    const fallback = setTimeout(() => setInView(true), 1500);

    if (typeof IntersectionObserver === "undefined") {
      return () => clearTimeout(fallback);
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setInView(true);
          io.disconnect();
        }
      },
      { threshold: 0.25, rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);

    return () => {
      io.disconnect();
      clearTimeout(fallback);
    };
  }, [inView]);

  return { ref, inView };
}
