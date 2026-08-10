"use client";

import { useEffect, useState } from "react";

/**
 * Up / down scroller for the long pages.
 *
 * The Journal guides run to twenty-five minutes of reading, and the plot pages
 * are nearly as long — getting back to the top meant a lot of flicking.
 *
 * ⚠️ It sits ABOVE the Jamindar medallion, not beside it. The concierge is
 * pinned bottom-right at 46px, and anything sharing that corner either overlaps
 * it or pushes it off the thumb's natural arc on a phone. Stacking keeps one
 * column of controls in the corner the thumb already reaches.
 *
 * ⚠️ Hidden until the reader is actually somewhere. A scroll-to-top button on
 * an unscrolled page is a control that does nothing, and the down arrow
 * disappears at the foot for the same reason — a dead button is worse than an
 * absent one.
 */
export function ScrollNav() {
  const [show, setShow] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setShow(y > 400);
      /* 24px of slack: `scrollHeight` and the visual bottom disagree by a pixel
         or two on mobile browsers whose toolbar collapses, and an arrow that
         flickers at the foot of every page reads as a bug. */
      setAtEnd(y >= max - 24);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  /* ⚠️ `smooth` is asked for here rather than set in CSS, because globals.css
     puts `scroll-behavior: smooth` on <html> and Next needs
     `data-scroll-behavior` alongside it — see the note in that file. Passing
     the behaviour explicitly keeps this control working regardless. Readers who
     ask for less motion get the jump instead, which is what they asked for. */
  const go = (top: number) => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  if (!show) return null;

  return (
    <div
      /* ⚠️ The column is 46px wide and centres its contents, which is the
         concierge medallion's width — not the 34px of the buttons themselves.
         Sharing `right-5` alone right-ALIGNS the stack, and because the
         medallion is twelve pixels wider the corner then reads as a ragged
         edge rather than one column. Centring on the medallion's axis is what
         makes the three controls look like one control. */
      className="fixed bottom-[4.75rem] right-5 z-30 flex w-[2.875rem] flex-col items-center gap-1.5 print:hidden"
      aria-label="Scroll"
    >
      <button
        type="button"
        onClick={() => go(0)}
        aria-label="Back to top"
        className="rj-scroll-btn"
      >
        <Chevron up />
      </button>
      {!atEnd && (
        <button
          type="button"
          onClick={() => go(document.documentElement.scrollHeight)}
          aria-label="Jump to the end of the page"
          className="rj-scroll-btn"
        >
          <Chevron />
        </button>
      )}
    </div>
  );
}

function Chevron({ up = false }: { up?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      className={`h-3.5 w-3.5 ${up ? "" : "rotate-180"}`}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 10.5 8 5.5l5 5" />
    </svg>
  );
}
