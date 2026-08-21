"use client";

import { useRouter } from "next/navigation";
import { useSyncExternalStore } from "react";
import { browserClient } from "@/lib/supabase-browser";
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
 *
 * 🚨 IT ASKS FOR A SIGN-IN BEFORE IT KEEPS ANYTHING (report 12, 2026-08-21:
 * "the Shortlist action is visible and appears usable even when the user is not
 * signed in… when an unauthenticated user clicks the heart / Shortlist button,
 * show a clear Sign in to shortlist prompt or redirect the user to the sign-in
 * page. After successful sign-in, return the user to the same property and
 * allow them to shortlist it").
 *
 * ⚠️ THE SESSION IS CHECKED ON CLICK, NEVER ON RENDER, and that is the whole
 * design of this gate. The obvious build wraps each card in an `AuthProvider`
 * and reads `useAuth()` — but this component renders once PER CARD, and that
 * provider opens an auth subscription AND fetches a profile row each time, so a
 * six-card grid would pay six sessions and six queries to grey out a heart.
 * `getSession()` reads the token from local storage, so the check on click is
 * effectively instant and costs a signed-out visitor nothing until they ask for
 * something that needs an account.
 *
 * ⚠️ The redirect carries the reader's CURRENT path, so the sign-in returns
 * them where they were rather than to the account dashboard — validated on the
 * other end by `safeNext` in the sign-in page, which accepts only same-origin
 * paths of known shapes.
 */
export function ShortlistHeart({ propertyId, title }: { propertyId: string; title: string }) {
  const list = useSyncExternalStore(subscribeShortlist, getShortlist, getServerShortlist);
  const on = list.includes(propertyId);
  const router = useRouter();

  async function keep() {
    /* Removing something already kept needs no account — a reader must always
       be able to undo what is on their own screen, and gating the way OUT of a
       state is how a control starts feeling like a trap. */
    if (!on) {
      const { data } = await browserClient().auth.getSession();
      if (!data.session) {
        /* ⚠️ `window.location`, NOT `useSearchParams()`. Reading the search
           params through the hook opts this subtree out of the static
           prerender and hands a crawler a Suspense fallback instead of the
           card — on EVERY listing page, because every card carries a heart.
           This runs in a click handler, where `window` exists and there is no
           render-time dependency to pay for. */
        const here = `${window.location.pathname}${window.location.search}`;
        router.push(`/account/sign-in?next=${encodeURIComponent(here)}`);
        return;
      }
    }
    toggleShortlist(propertyId);
  }

  return (
    <button
      type="button"
      aria-pressed={on}
      aria-label={on ? `Remove ${title} from your shortlist` : `Sign in to shortlist ${title}`}
      /* The label doubles as the hover hint, so the ask is visible before the
         click as well as after it. */
      title={on ? undefined : "Sign in to shortlist"}
      onClick={(e) => {
        /* The card around this is one big link — the heart must not follow it. */
        e.preventDefault();
        e.stopPropagation();
        void keep();
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
