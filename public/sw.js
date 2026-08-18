/**
 * THE SERVICE WORKER (do-all round #2, 2026-08-18) — deliberately the most
 * conservative useful worker that exists.
 *
 * 🚨 NAVIGATIONS ARE NETWORK-FIRST, ALWAYS. A cache-first worker on a
 * statically-regenerated site is how a deploy stops reaching readers — the
 * classic stale-HTML wedge. The cache is only ever the FALLBACK, so a deploy
 * behaves exactly as it did before this file existed.
 *
 * What offline actually gets: the two carry-along documents (the site-visit
 * checklist and the FAQ), the last pages the reader opened, and any brochure
 * or hero image already fetched (stale-while-revalidate for same-origin
 * static assets). Nothing else is promised.
 *
 * ⚠️ BUMP `VERSION` WHEN THIS FILE'S LOGIC CHANGES — activation prunes every
 * other cache name, which is the recovery path from any bad worker.
 */
const VERSION = "jp-sw-v1";
const PRECACHE = ["/visit-checklist", "/faq"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(VERSION)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const req = event.request;
  if (req.method !== "GET") return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  // Pages: network first, cache the copy, fall back to the cache offline.
  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((hit) => hit || caches.match("/visit-checklist"))),
    );
    return;
  }

  // Static assets (immutable by pathname convention): stale-while-revalidate.
  if (
    url.pathname.startsWith("/hero/") ||
    url.pathname.startsWith("/brochure/") ||
    url.pathname.startsWith("/plan/") ||
    url.pathname.startsWith("/section/") ||
    url.pathname.startsWith("/_next/static/")
  ) {
    event.respondWith(
      caches.match(req).then((hit) => {
        const refresh = fetch(req)
          .then((res) => {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
            return res;
          })
          .catch(() => hit);
        return hit || refresh;
      }),
    );
  }
});
