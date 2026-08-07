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
 */

const listeners = new Set<() => void>();

function subscribe(cb: () => void) {
  listeners.add(cb);
  window.addEventListener("popstate", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("popstate", cb);
  };
}

const getSnapshot = () => window.location.search;
/** Server and hydration: no filters, so the prerendered HTML is the full set. */
const getServerSnapshot = () => "";

export function useQueryString(): string {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

/** Write the query string without a router navigation, then notify readers.
 *  `replaceState` keeps Back out of a walk through every chip that was tapped. */
export function setQuery(params: URLSearchParams) {
  const qs = params.toString();
  window.history.replaceState(null, "", qs ? `?${qs}` : window.location.pathname);
  for (const l of listeners) l();
}
