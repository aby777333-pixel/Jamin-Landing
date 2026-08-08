"use client";

import { useEffect, useRef, useState } from "react";
import type { Heading } from "@/components/Prose";

/**
 * "On this page", following the reader.
 *
 * The list was static: it named the sections but never said which one you were
 * in, so on a long guide it stopped being navigation and became a summary.
 *
 * ⚠️ The active heading is the LAST one whose top has passed the reading line,
 * not simply whichever is intersecting. Several headings share the viewport on
 * a tall screen, and "first intersecting" jumps back and forth between them as
 * you scroll. Reading it off scroll position instead gives one unambiguous
 * answer at any offset, and it also works while scrolling upward.
 *
 * The handler is passive and throttled — this runs on every scroll event of a
 * very long page. See the note on the throttle: it is on the clock, not on
 * `requestAnimationFrame`.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLUListElement>(null);

  /**
   * Keep the current entry visible inside the list's OWN scroller.
   *
   * ⚠️ Deliberately not `scrollIntoView`. On a long guide this list is taller
   * than the viewport and scrolls independently, and `scrollIntoView` walks up
   * every scrollable ancestor — so following the reader would yank the article
   * itself. Setting `scrollTop` moves only this box.
   *
   * It also only acts when the entry is actually out of view, so a reader who
   * has scrolled the list by hand is not fought for control of it.
   */
  useEffect(() => {
    const list = listRef.current;
    if (!list || !active) return;
    const el = list.querySelector<HTMLElement>(`[data-toc="${CSS.escape(active)}"]`);
    if (!el) return;

    const pad = 24;
    const top = el.offsetTop - list.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop + pad) list.scrollTop = Math.max(0, top - pad);
    else if (bottom > list.scrollTop + list.clientHeight - pad) {
      list.scrollTop = bottom - list.clientHeight + pad;
    }
  }, [active]);

  useEffect(() => {
    if (!headings.length) return;

    let last = 0;
    let trailing: ReturnType<typeof setTimeout> | undefined;

    const measure = () => {
      last = Date.now();
      // A quarter down the viewport: the line a reader's eye actually sits on.
      const line = window.innerHeight * 0.25;
      let current: string | null = null;
      for (const h of headings) {
        const el = document.getElementById(h.id);
        if (!el) continue;
        if (el.getBoundingClientRect().top - line <= 0) current = h.id;
        else break;
      }
      // Before the first heading, the first entry is the honest answer rather
      // than nothing highlighted at all.
      setActive(current ?? headings[0].id);
    };

    /**
     * ⚠️ Throttled on the clock, NOT on `requestAnimationFrame`.
     *
     * rAF is the usual advice and it is wrong here for the same reason the
     * observers were: it is driven by the rendering pipeline, so in a tab that
     * is not producing frames the callback never runs and the list silently
     * stops following the reader. Caught by scrolling to the third heading and
     * watching the first stay highlighted. A 100ms gate costs the same handful
     * of `getBoundingClientRect` calls and works everywhere.
     */
    const GAP = 100;
    const onScroll = () => {
      const since = Date.now() - last;
      if (since >= GAP) {
        measure();
        return;
      }
      // Trailing call, so coming to rest mid-gap still ends on the right entry.
      if (!trailing) {
        trailing = setTimeout(() => {
          trailing = undefined;
          measure();
        }, GAP - since);
      }
    };

    // Seeded so the list is right on arrival without waiting for a scroll —
    // and in a callback, never in the effect body.
    const seed = setTimeout(measure, 0);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    return () => {
      clearTimeout(seed);
      if (trailing) clearTimeout(trailing);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [headings]);

  return (
    /* ⚠️ The list scrolls itself, the page does not scroll it.
       A long guide can produce forty entries — taller than the viewport — and a
       plain `sticky` block simply clips them: the last sections were
       unreachable because the list ran past the bottom of the screen with
       nowhere to go. `max-h` plus its own overflow gives it a scroller bounded
       by the viewport minus the sticky header, and `overscroll-contain` stops a
       flick that reaches the end of this list from carrying on into the
       article behind it. */
    <nav className="sticky top-28 flex max-h-[calc(100vh-9rem)] flex-col" aria-label="On this page">
      <h2 className="ledger-label shrink-0">On this page</h2>
      <ul
        ref={listRef}
        className="cd-noscroll mt-phi2 min-h-0 flex-1 space-y-2 overflow-y-auto overscroll-contain border-l border-line"
      >
        {headings.map((h) => {
          const on = active === h.id;
          return (
            <li
              key={h.id}
              data-toc={h.id}
              className={`${h.level === 3 ? "pl-phi3" : "pl-phi2"} ${
                on ? "-ml-px border-l-2 border-jamin-gold" : ""
              }`}
            >
              <a
                href={`#${h.id}`}
                aria-current={on ? "location" : undefined}
                className={`block text-base leading-snug transition-colors ${
                  on ? "font-medium text-ink" : "text-ink-muted hover:text-jamin-red-deep"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
