import { createClient } from "@supabase/supabase-js";

/**
 * Read-only Supabase client for the public website.
 *
 * The Jamin Bazaar app is the master product and its admin console is the only
 * place data is written. This site never writes to the shared tables — it reads
 * the same rows the app reads, so there is exactly one source of truth and no
 * duplicated dataset to drift.
 *
 * Uses the publishable key and therefore only ever sees what RLS exposes to an
 * anonymous visitor.
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error(
    "Supabase env missing: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY",
  );
}

/**
 * ⚠️ The data cache is pinned to the page's own revalidation window.
 *
 * supabase-js talks over `fetch`, and Next caches fetch responses in
 * `.next/cache` — across builds. That bit hard: after unpublishing three
 * articles, a rebuild still emitted them, because the build reused the
 * responses from a build minutes earlier. RLS was correct the whole time (the
 * anon key genuinely returned zero rows); the stale layer was in front of it.
 *
 * Tying the fetch to the same one-hour window every page declares means the
 * data can never be older than the page that renders it.
 *
 * ⚠️ `cache: "no-store"` was tried and is NOT an option: it makes every read a
 * dynamic-server usage, and the build fails with "couldn't be rendered
 * statically". That would trade the whole prerender — and the SEO that depends
 * on it — for freshness we get another way.
 *
 * ⚠️ OPERATIONAL RULE: pinning fixes runtime freshness but not build freshness,
 * because a rebuild inside the window legitimately reuses the cached response.
 * **Always deploy with the build cache cleared** — `createSiteBuild` with
 * `clear_cache: true` — or a deploy can re-emit content the database no longer
 * exposes. Verified the hard way: after unpublishing three articles, a warm
 * rebuild put them straight back into the output.
 *
 * And because the site is statically generated, unpublishing something in the
 * admin console reaches the public site on the next revalidation — or
 * immediately with a cache-cleared redeploy.
 *
 * ⚠️ THIS NUMBER MUST NEVER EXCEED THE SHORTEST `revalidate` IN THE APP.
 *
 * It was 3600 while the Journal routes declared 60, and the result looked
 * exactly like a broken save: an uploaded cover was in the database, the page
 * dutifully regenerated every 60s — `Cache-Status: "Next.js"; hit; fwd=stale`
 * then `hit` — and still rendered the placeholder, because each regeneration
 * re-read the same hour-old cached response. The page was fresh; the data
 * underneath it was not.
 *
 * 60 is therefore the floor for the whole site, not a Journal setting. Pages
 * that declare an hour still only regenerate hourly — this only governs how old
 * the data may be *when* they do, so the cost is a few more reads, not more
 * renders.
 */
const REVALIDATE_SECONDS = 60;

export const supabase = createClient(url, key, {
  auth: { persistSession: false },
  global: {
    fetch: (input, init) =>
      fetch(input as RequestInfo, {
        ...init,
        next: { revalidate: REVALIDATE_SECONDS },
      } as RequestInit),
  },
});

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://jaminproperties.com";
