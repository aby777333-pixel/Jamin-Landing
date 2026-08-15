"use client";

import { useEffect, useState } from "react";
import type { Heading } from "@/components/Prose";

/**
 * Which section the reader is in.
 *
 * 🚨 EXTRACTED FROM `TableOfContents` 2026-08-15 SO THERE IS ONE ANSWER, NOT
 * TWO. The running head needs exactly the same judgement the contents list
 * already made, and a second copy of this would drift — the two would disagree
 * about the current section somewhere in the middle of a long guide, which is
 * the kind of bug nobody reports and everybody feels. This repo has already
 * paid for one duplicated utility (`.rj-underline`) that silently won on colour
 * and duration; a duplicated scroll heuristic would be worse, because both
 * copies would look correct in isolation.
 *
 * The reasoning below is the original's, unchanged, and it is load-bearing:
 *
 * ⚠️ The active heading is the LAST one whose top has passed the reading line,
 * not simply whichever is intersecting. Several headings share the viewport on
 * a tall screen, and "first intersecting" jumps back and forth between them as
 * you scroll. Reading it off scroll position instead gives one unambiguous
 * answer at any offset, and it also works while scrolling upward.
 *
 * ⚠️ Throttled on the CLOCK, not on `requestAnimationFrame`. rAF is the usual
 * advice and it is wrong here: it is driven by the rendering pipeline, so in a
 * tab that is not producing frames the callback never runs and the reader is
 * silently abandoned at whatever section they were last on. A 100ms gate costs
 * the same handful of `getBoundingClientRect` calls and works everywhere.
 */
export function useActiveHeading(headings: Heading[]) {
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

    // Seeded so the answer is right on arrival without waiting for a scroll —
    // and in a callback, never in the effect body (this repo's eslint bans
    // setState in an effect body).
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

  return active;
}
