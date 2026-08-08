"use client";

import { useEffect, useState } from "react";
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
 * The handler is passive and rAF-throttled — this runs on every scroll event of
 * a very long page.
 */
export function TableOfContents({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string | null>(null);

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
    <nav className="sticky top-28" aria-label="On this page">
      <h2 className="ledger-label">On this page</h2>
      <ul className="mt-phi2 space-y-2 border-l border-line">
        {headings.map((h) => {
          const on = active === h.id;
          return (
            <li
              key={h.id}
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
