"use client";

/**
 * THE BROWSER SHORTLIST (do-all round #2, 2026-08-18) — `local-shortlist`,
 * named apart from `shortlist.ts` ON PURPOSE: that module is the SIGNED-IN
 * shortlist writing to the app's `favorites` table, and this session briefly
 * overwrote it by landing here under the same name. Two shortlists, two
 * files, two names — hearts without a
 * sign-in. One localStorage key holding property ids, read everywhere
 * through useSyncExternalStore (the repo's standing pattern; no
 * setState-in-effect anywhere).
 *
 * ⚠️ LOCAL-ONLY, BY DESIGN, FOR NOW. The signed-in shortlist lives in the
 * app's Supabase and its write path belongs to the app; silently mirroring a
 * browser list into an account the moment somebody signs in would need that
 * write path and a merge policy nobody has decided. Until then the two lists
 * coexist: this one costs nothing and works for the anonymous 99%.
 *
 * ⚠️ SSR snapshot is the EMPTY list — hydration renders no hearts filled,
 * then the client corrects. Storage events keep two tabs honest.
 */
const KEY = "jp-shortlist";

let cache: string[] = [];
let cacheRaw: string | null = null;
const listeners = new Set<() => void>();

function read(): string[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw === cacheRaw) return cache;
    cacheRaw = raw;
    cache = raw ? (JSON.parse(raw) as string[]).filter((x) => typeof x === "string") : [];
  } catch {
    cache = [];
  }
  return cache;
}

function write(next: string[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
  } catch {
    /* private mode — the list lives for the session in `cache` only */
    cacheRaw = null;
    cache = next;
  }
  listeners.forEach((l) => l());
}

export function subscribeShortlist(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => {
    if (e.key === KEY) listeners.forEach((l) => l());
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", onStorage);
  };
}

export function getShortlist(): string[] {
  if (typeof window === "undefined") return EMPTY;
  return read();
}

const EMPTY: string[] = [];
export const getServerShortlist = () => EMPTY;

export function toggleShortlist(id: string) {
  const cur = read();
  write(cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]);
}

/**
 * Empty the browser list. Called on SIGN-OUT (report 18, 2026-09-03: "after
 * signing out, the 'SHORTLIST 2' popup is still visible… the previous
 * shortlist state is being retained for the signed-out user"). Adding to the
 * list is gated on a session (ShortlistHeart), so a list that outlives the
 * session is the signed-in person's, and it must not be shown to whoever
 * uses the browser next.
 */
export function clearShortlist() {
  write([]);
}
