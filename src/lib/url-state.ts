"use client";

import { useSyncExternalStore } from "react";

/**
 * The query string, read as an external store.
 *
 * Two things have to be true at once on this site:
 *
 *  1. The listing and comparison pages must stay statically prerendered, so a
 *     crawler receives the full catalogue rather than a Suspense fallback.
 *     That rules out `useSearchParams()`, which opts the subtree out of the
 *     prerender.
 *  2. A filtered or compared view must still be shareable, so the state has to
 *     live in the URL.
 *
 * `useSyncExternalStore` satisfies both without the setState-in-an-effect
 * pattern that reads the URL after mount: `getServerSnapshot` returns an empty
 * query for the server render and the hydration pass — which is precisely the
 * unfiltered HTML we want indexed — and React re-reads the live URL once
 * hydration completes.
 *
 * `replaceState` does not emit an event of its own, so writes go through
 * `setQuery`, which notifies subscribers explicitly. Back/forward is covered by
 * `popstate`.
 *
 * ⚠️ Neither of those covers a `<Link>`. The App Router navigates with
 * `history.pushState`, which fires no event and never reaches `setQuery`, so a
 * district picked in the header or the footer used to change the URL and
 * nothing else — the first pick only appeared to work because arriving from
 * another route mounts this subtree fresh and the initial snapshot reads the
 * live URL. A second pick is a same-route navigation, so the component stays
 * mounted with the old query. Patching the two history methods to announce
 * themselves is what closes that gap, and it keeps the static prerender that
 * ruled out `useSearchParams()` in the first place.
 */

const URL_CHANGED = "jamin:urlchange";

const listeners = new Set<() => void>();

/** Wrap `pushState`/`replaceState` once so every URL write announces itself —
 *  ours and the router's alike. Patched lazily on first subscribe rather than
 *  at import, so it wraps whatever the router has already installed instead of
 *  racing it, and never touches `history` during SSR. */
let patched = false;
function patchHistory() {
  if (patched || typeof window === "undefined") return;
  patched = true;
  for (const method of ["pushState", "replaceState"] as const) {
    const original = history[method];
    history[method] = function (this: History, ...args: Parameters<History["pushState"]>) {
      const result = original.apply(this, args);
      // After the call, so `window.location` already holds the new URL.
      window.dispatchEvent(new Event(URL_CHANGED));
      return result;
    };
  }
}

function subscribe(cb: () => void) {
  patchHistory();
  listeners.add(cb);
  window.addEventListener("popstate", cb);
  window.addEventListener(URL_CHANGED, cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("popstate", cb);
    window.removeEventListener(URL_CHANGED, cb);
  };
}

const getSnapshot = () => window.location.search;
/** Server and hydration: no filters, so the prerendered HTML is the full set. */
const getServerSnapshot = () => "";

export function useQueryString(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Write the query string without a router navigation, then notify readers.
 *  `replaceState` keeps Back out of a walk through every chip that was tapped.
 *
 *  The patch above already announces this write, so the explicit loop is a
 *  second notification of the same subscribers. That is deliberate and free:
 *  `useSyncExternalStore` compares snapshots and drops the duplicate, and it
 *  means a chip still works if the patch was ever skipped. */
export function setQuery(params: URLSearchParams) {
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  for (const l of listeners) l();
}
