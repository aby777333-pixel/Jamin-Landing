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
   * 🚨 THE HEADING THE READER JUST CLICKED (report 18, 2026-09-03: "sometimes
   * it works correctly, while sometimes it jumps"). A click on an entry starts
   * a SMOOTH page scroll (`html { scroll-behavior: smooth }`), and on the way
   * to the target the page passes every intervening heading. `useActiveHeading`
   * reports each one in turn, and the follow effect below wrote `scrollTop` for
   * each — so the list hunted up and down while the article glided, and where
   * it came to rest depended on how many headings lay between. While a click
   * is in flight the follow is suspended; the clicked entry is scrolled into
   * the list's view ONCE, and the follow resumes when the target becomes the
   * active heading — or after a timeout, for a target near the foot of the
   * page that can never reach the reading line.
   */
  const pinned = useRef<string | null>(null);
  const pinTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const reveal = (id: string) => {
    const list = listRef.current;
    if (!list) return;
    const el = list.querySelector<HTMLElement>(`[data-toc="${CSS.escape(id)}"]`);
    if (!el) return;
    const pad = 24;
    const top = el.offsetTop - list.offsetTop;
    const bottom = top + el.offsetHeight;
    if (top < list.scrollTop + pad) list.scrollTop = Math.max(0, top - pad);
    else if (bottom > list.scrollTop + list.clientHeight - pad) {
      list.scrollTop = bottom - list.clientHeight + pad;
    }
  };

  const pin = (id: string) => {
    pinned.current = id;
    if (pinTimer.current) clearTimeout(pinTimer.current);
    pinTimer.current = setTimeout(() => {
      pinned.current = null;
    }, 1500);
    reveal(id);
  };

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
    if (!active) return;
    if (pinned.current) {
      // A click is in flight: ignore the headings the page is gliding past.
      if (active !== pinned.current) return;
      pinned.current = null;
      if (pinTimer.current) clearTimeout(pinTimer.current);
    }
    reveal(active);
  }, [active]);

  useEffect(() => () => { if (pinTimer.current) clearTimeout(pinTimer.current); }, []);


  return (
    /* ⚠️ The list scrolls itself, the page does not scroll it.
       A long guide can produce forty entries — taller than the viewport — and a
       plain `sticky` block simply clips them: the last sections were
       unreachable because the list ran past the bottom of the screen with
       nowhere to go. `max-h` plus its own overflow gives it a scroller bounded
       by the viewport minus the sticky header, and `overscroll-contain` stops a
       flick that reaches the end of this list from carrying on into the
       article behind it. */
    /* 🚨 THE STICKY AND THE HEIGHT CAP MOVED TO THE CALLER (2026-08-15), and
       this is a bug fix, not a tidy-up. When `Marginalia` was added as a
       SIBLING after this nav, this element pinned at `top-28` while the notes
       below it scrolled — so the marginalia rode up through the pinned list and
       the two overlapped, and past it, over the article. A sticky element and a
       static sibling in one column can only avoid that by luck.
       Both now live inside ONE height-capped sticky box in the article page;
       this is a flex child of it, and `min-h-0 flex-1` is what lets the list's
       own scroller keep working inside that box. */
    <nav className="flex min-h-0 flex-1 flex-col" aria-label="On this page">
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
                onClick={() => pin(h.id)}
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
