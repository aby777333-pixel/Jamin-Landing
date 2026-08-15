"use client";

import { useEffect, useRef } from "react";
import { useActiveHeading } from "@/hooks/useActiveHeading";
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
  /* One answer, shared with the running head — see the hook. */
  const active = useActiveHeading(headings);
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
