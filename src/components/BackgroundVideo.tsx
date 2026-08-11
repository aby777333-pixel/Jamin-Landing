"use client";

import { useEffect, useRef } from "react";

/**
 * A decorative background loop, for the homepage's closing band.
 *
 * ⚠️ THE POSTER IS THE DEFAULT STATE, NOT A LOADING STATE. The element renders
 * with a `poster` and NO source at all, so the first paint is a 50 KB still —
 * the same thing the photograph it replaced was. Everything else happens after
 * mount, which means the markup costs nothing before hydration and a visitor
 * who never scrolls this far never pays for the video.
 *
 * ⚠️ NO REACT STATE, DELIBERATELY. The obvious shape — `useState(null)` plus an
 * effect that reads `matchMedia` and `innerWidth` — is a cascading render, and
 * every variation on it (memoised store, lazily-initialised ref) trips one hook
 * rule or another. That is the linter being right rather than being awkward:
 * none of this is state the component renders FROM. It is imperative work on a
 * DOM node this component owns, which is exactly what an effect is for. So the
 * effect sets `src` on the element itself and React never re-renders at all.
 *
 * ⚠️ IT LOADS ON APPROACH, NOT ON MOUNT. This band sits at the very bottom of a
 * long homepage, so most visits never reach it. An `IntersectionObserver` with
 * a screen of margin means the file is fetched by the people who will actually
 * see it and nobody else — a far bigger saving than picking a smaller encode,
 * and the reason `preload="none"` is on the element as well.
 *
 * ⚠️ `prefers-reduced-motion` IS HONOURED BY NEVER LOADING IT. §2's rule is that
 * with motion off the page must still say everything it says with motion on —
 * and this band says it with the poster, which is a frame of the same footage.
 * No motion, no download, no difference in meaning.
 *
 * ⚠️ MUTED, INLINE, LOOPING, NO CONTROLS. `muted` is not a preference: without
 * it every browser blocks autoplay. `playsInline` is what stops iOS taking the
 * video full-screen. And the autoplay promise can still be rejected — a data
 * saver, a battery-saver mode, a browser policy — so the rejection is caught
 * and the poster simply stays. A decoration must never throw into the console.
 */
export function BackgroundVideo({
  sources,
  poster,
  className = "",
}: {
  /** Narrowest first. The first entry whose `maxWidth` the viewport fits is
   *  used; the last is the fallback for everything wider. */
  sources: { src: string; maxWidth?: number }[];
  poster: string;
  className?: string;
}) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const w = window.innerWidth;
    const chosen =
      sources.find((s) => s.maxWidth != null && w <= s.maxWidth) ?? sources[sources.length - 1];
    if (!chosen) return;

    let done = false;
    const start = () => {
      if (done) return;
      done = true;
      el.src = chosen.src;
      el.load();
      el.play().catch(() => {});
    };

    /* ⚠️ A DIRECT RECT CHECK FIRST, THEN THE OBSERVER. If the band is already
       within reach at mount — a short page, a tall screen, or a visitor who
       arrived on an anchor further down — waiting for an observer callback
       delays it for no reason. It also gives the component one path that does
       not depend on the rendering pipeline at all, which is what makes it
       testable: `IntersectionObserver` callbacks are driven by frames, so in a
       surface that never composites (the preview pane) they never fire. */
    const near = () => el.getBoundingClientRect().top < window.innerHeight * 2;
    if (near()) {
      start();
      return;
    }

    // A screen of margin, so it is ready by the time it is looked at.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          start();
          io.disconnect();
        }
      },
      { rootMargin: "100% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
    // `sources` is an inline literal at the call site, so its identity changes
    // on every render — but this component holds no state and therefore never
    // re-renders, and the file is chosen once by design.
  }, [sources]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="none"
      aria-hidden="true"
      tabIndex={-1}
      className={className}
    />
  );
}
