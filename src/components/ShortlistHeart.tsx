"use client";

import { useSyncExternalStore } from "react";
import {
  getServerShortlist,
  getShortlist,
  subscribeShortlist,
  toggleShortlist,
} from "@/lib/local-shortlist";

/**
 * The heart on a card (do-all round #2). A client island small enough to sit
 * on the server-rendered PropertyCard without dragging it client-side.
 *
 * ⚠️ The mark is DRAWN, stroke-only, per the SurveyIcon discipline — filled
 * red when kept, outline when not. `aria-pressed` + a real label so it reads
 * as the toggle it is.
 */
export function ShortlistHeart({ propertyId, title }: { propertyId: string; title: string }) {
  const list = useSyncExternalStore(subscribeShortlist, getShortlist, getServerShortlist);
  const on = list.includes(propertyId);

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from your shortlist` : `Keep ${title} on your shortlist`}
      onClick={(e) => {
        /* The card around this is one big link — the heart must not follow it. */
        e.preventDefault();
        e.stopPropagation();
        toggleShortlist(propertyId);
      }}
      className={`inline-flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur transition-all ${
        on
          /* ⚠️ VERMILION, NOT THE BRAND RED (do-all round, menu item 2).
             Every red on this site meant one thing — the company asking you
             to act: Ask, Enquire, Book a visit. A kept heart is the opposite
             direction of travel, the reader marking the page for themselves,
             and it was wearing the same hue as the buttons pushing at them.
             `--color-vermilion` is the sindoor thread and had no call sites
             until now. It measures 3.93:1 against `jamin-red-soft`, over the
             3:1 a graphic needs; it is NOT used as a word anywhere, because
             on the canvas it is 3.64:1 and would fail for text. The heart is
             a filled shape and its accessible name lives in `aria-label`. */
          ? "border-vermilion/50 bg-jamin-red-soft text-vermilion"
          : "border-canvas/60 bg-canvas/90 text-ink-faint hover:border-ink-faint hover:text-ink"
      }`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-[18px] w-[18px]"
        aria-hidden="true"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      >
        <path d="M12 20.3 4.9 13a4.6 4.6 0 0 1 0-6.5 4.4 4.4 0 0 1 6.4 0l.7.8.7-.8a4.4 4.4 0 0 1 6.4 0 4.6 4.6 0 0 1 0 6.5Z" />
      </svg>
    </button>
  );
}
