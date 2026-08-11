"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * A scrolling rail for The Vault's photography.
 *
 * ⚠️ NATIVE SCROLL, NOT A SLIDER LIBRARY. The whole thing is a flex row with
 * `scroll-snap-type: x mandatory` and `overflow-x: auto`. That means it already
 * works before this component's JavaScript arrives, it works with scripting
 * off, a touch device gets its own momentum rather than an emulation of it, and
 * a keyboard user gets the browser's own scroll handling. The buttons are an
 * enhancement layered on top — if hydration never happens the rail still
 * scrolls, which is exactly the property a carousel library takes away.
 *
 * ⚠️ NO AUTOPLAY, EVER. §14 bans anything that shouts, and a Vault dossier that
 * moves while somebody is reading it is the same mistake the homepage hero
 * rotation was removed for. It advances when a person advances it.
 *
 * ⚠️ THE ARROWS DISAPPEAR WHEN THERE IS NOTHING TO SCROLL. A dead control on a
 * page whose argument is discretion reads worse than no control. `scrollable`
 * is measured from the element rather than assumed from the item count, because
 * three items fit on a desktop and do not fit on a phone.
 */
export function VaultCarousel({
  label,
  children,
  className = "",
  /** Tailwind width classes for each slide — the caller owns the sizing, so a
   *  gallery and a card rail can share this component. */
  itemClassName = "w-[86%] sm:w-[58%] lg:w-[42%]",
}: {
  label: string;
  children: React.ReactNode[];
  className?: string;
  itemClassName?: string;
}) {
  const rail = useRef<HTMLDivElement>(null);
  const [scrollable, setScrollable] = useState(false);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const sync = useCallback(() => {
    const el = rail.current;
    if (!el) return;
    // 2px of slack: sub-pixel layout means scrollLeft rarely lands exactly on
    // the maximum, and a button that never re-enables is worse than one that
    // enables a pixel early.
    const max = el.scrollWidth - el.clientWidth;
    setScrollable(max > 2);
    setAtStart(el.scrollLeft <= 2);
    setAtEnd(el.scrollLeft >= max - 2);
  }, []);

  useEffect(() => {
    const el = rail.current;
    if (!el) return;
    sync();
    el.addEventListener("scroll", sync, { passive: true });
    // Re-measure on resize AND on content changes — a rail whose images load
    // late is not scrollable at mount and is a moment later.
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    for (const child of Array.from(el.children)) ro.observe(child);
    return () => {
      el.removeEventListener("scroll", sync);
      ro.disconnect();
    };
  }, [sync]);

  function page(direction: 1 | -1) {
    const el = rail.current;
    if (!el) return;
    // ⚠️ THE STEP IS MEASURED, NOT ASSUMED. One slide plus the real gap, so a
    // click lands ON a snap point rather than near one. Hard-coding the gap at
    // 16 was 5px short of `gap-phi3`'s computed 21 — mandatory snapping hid it
    // by pulling the rail to the nearest point anyway, which is exactly the
    // kind of wrongness that survives until the gap changes.
    const first = el.firstElementChild as HTMLElement | null;
    const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
    const step = first ? first.getBoundingClientRect().width + gap : el.clientWidth * 0.8;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollBy({ left: direction * step, behavior: reduced ? "auto" : "smooth" });
  }

  const arrow =
    "inline-flex h-10 w-10 items-center justify-center rounded-full border border-champagne-500/40 bg-canvas-alt text-ink transition-colors hover:border-champagne-300 disabled:pointer-events-none disabled:opacity-30";

  return (
    <div className={className}>
      <div
        ref={rail}
        role="region"
        aria-label={label}
        tabIndex={0}
        className="flex snap-x snap-mandatory gap-phi3 overflow-x-auto pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        style={{ overscrollBehaviorX: "contain" }}
      >
        {children.map((child, i) => (
          <div key={i} className={`shrink-0 snap-start ${itemClassName}`}>
            {child}
          </div>
        ))}
      </div>

      {scrollable ? (
        <div className="mt-phi3 flex items-center justify-end gap-2">
          <button type="button" onClick={() => page(-1)} disabled={atStart} aria-label={`Scroll ${label} back`} className={arrow}>
            <span aria-hidden="true">←</span>
          </button>
          <button type="button" onClick={() => page(1)} disabled={atEnd} aria-label={`Scroll ${label} forward`} className={arrow}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}
