import { supabase } from "./supabase";

/**
 * Jamin Journal — the read side (migration 0076).
 *
 * The site reads with the anon key, and the RLS policy only exposes articles
 * that are `published` with a publish time in the past. Drafts, articles in
 * review and scheduled pieces are therefore unreachable even by guessing a
 * slug — verified against the live database rather than assumed.
 */

export type JournalAuthor = {
  slug: string;
  name: string;
  title: string | null;
  bio: string | null;
  avatar_url: string | null;
};

export type JournalCategory = {
  slug: string;
  name: string;
  description: string | null;
  sort: number;
};

export type JournalFaq = { q: string; a: string };

export type JournalPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  body: string | null;
  kind: string;
  cover_url: string | null;
  cover_alt: string | null;
  status: string;
  published_at: string | null;
  reviewed_at: string | null;
  updated_at: string | null;
  tags: string[];
  /* ⚠️ `focus_keyword`, `secondary_keywords` and `long_tail` are PLANNING
     fields written by the admin console — they are never emitted as meta tags
     (Google has ignored the keywords meta since 2009). They earn their keep
     here instead: they are the best keyword surface the Journal has, and the
     search index reads them. `secondary_keywords` and `long_tail` are typed as
     `string | string[]` because the console stores whatever the author typed —
     a comma-separated line on the older rows, a list on the newer ones. */
  seo: {
    title?: string;
    description?: string;
    canonical?: string;
    og_image?: string;
    noindex?: boolean;
    focus_keyword?: string;
    secondary_keywords?: string | string[];
    long_tail?: string | string[];
  } | null;
  related_property_ids: string[];
  related_locations: string[];
  faqs: JournalFaq[];
  disclaimer: string | null;
  reading_minutes: number | null;
  is_featured: boolean;
  blog_categories: JournalCategory | null;
  blog_authors: JournalAuthor | null;
};

/**
 * ⚠️ THE LIST QUERY MUST NOT FETCH ARTICLE BODIES.
 *
 * `POST_COLUMNS` includes `body`, and `getJournalPosts` pulls up to 50 rows —
 * so every journal index, every category page, the related-articles rail and
 * the sitemap were each transferring the full text of every guide. At 16 posts
 * that is 246 kB of Markdown, and the build began FAILING outright at
 * /journal/category/[slug] once a new 30 kB guide was published: the error
 * surfaced with the entire payload as its message, which is what a response
 * that size looks like coming back through the fetch cache.
 *
 * Nothing on a card renders the body. `faqs` is dropped for the same reason —
 * only the article page shows them.
 *
 * ⚠️ Reading time used to be COUNTED from the body, so removing it here would
 * have silently reduced every card to "1 min read". `blog_posts.reading_minutes`
 * existed for this and was null on all 16 rows; it is now backfilled, and
 * `readingMinutes()` returns null rather than guessing when it has neither a
 * stored figure nor a body.
 */
const LIST_COLUMNS = `
  id, slug, title, excerpt, kind, cover_url, cover_alt, status,
  published_at, reviewed_at, updated_at, tags, seo, related_property_ids,
  related_locations, disclaimer, reading_minutes, is_featured,
  blog_categories ( slug, name, description, sort ),
  blog_authors!blog_posts_author_id_fkey ( slug, name, title, bio, avatar_url )
`;

const POST_COLUMNS = `
  id, slug, title, excerpt, body, kind, cover_url, cover_alt, status,
  published_at, reviewed_at, updated_at, tags, seo, related_property_ids,
  related_locations, faqs, disclaimer, reading_minutes, is_featured,
  blog_categories ( slug, name, description, sort ),
  blog_authors!blog_posts_author_id_fkey ( slug, name, title, bio, avatar_url )
`;

/**
 * ⚠️ These deliberately THROW on a query error rather than falling back to an
 * empty list.
 *
 * The first version swallowed errors, and it cost a real bug: during a
 * prerender one category page's query failed transiently, the page saw zero
 * articles, called notFound(), and Next baked a **permanently cached 404** for
 * a page that exists. A build that cannot read the database must fail loudly,
 * not ship a quietly empty — or quietly missing — Journal.
 *
 * An empty result is not an error: Supabase returns `data: []` with no error
 * when a table legitimately has no rows, so genuine emptiness still renders the
 * empty state. Only the site shell guards against an unreachable database, in
 * getNavFacets, so a dead Supabase cannot take the header down with it.
 */
export async function getJournalPosts(limit = 50): Promise<JournalPost[]> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(LIST_COLUMNS)
    .order("published_at", { ascending: false })
    .limit(limit);
  if (error) throw new Error(`journal posts query failed: ${error.message}`);
  return (data ?? []) as unknown as JournalPost[];
}

export async function getJournalPost(slug: string): Promise<JournalPost | null> {
  const { data, error } = await supabase
    .from("blog_posts")
    .select(POST_COLUMNS)
    .eq("slug", slug)
    .maybeSingle();
  if (error) throw new Error(`journal post query failed: ${error.message}`);
  return (data as unknown as JournalPost) ?? null;
}

/** A slug that has been renamed still resolves (migration 0076 records these).
 *  Tolerant on purpose: this runs only on the way to a 404, and a lookup
 *  failure should not turn that 404 into a 500. */
export async function getJournalRedirect(from: string): Promise<string | null> {
  try {
    const { data } = await supabase
      .from("blog_redirects")
      .select("to_slug")
      .eq("from_slug", from)
      .maybeSingle();
    return (data?.to_slug as string) ?? null;
  } catch {
    return null;
  }
}

export async function getJournalCategories(): Promise<JournalCategory[]> {
  const { data, error } = await supabase
    .from("blog_categories")
    .select("slug, name, description, sort")
    .order("sort");
  if (error) throw new Error(`journal categories query failed: ${error.message}`);
  return (data ?? []) as JournalCategory[];
}

/* ---------- presentation ---------- */

export function journalHref(p: Pick<JournalPost, "slug">) {
  return `/journal/${p.slug}`;
}

/**
 * 🚨 27 OF 39 ARTICLES WERE DECLARING A CANONICAL URL THAT 404s.
 *
 * Found in a link audit of the live site, 2026-08-15. `seo.canonical` is
 * authored in the admin console, and on most articles it was written against a
 * `/blog/<slug>` convention this site has never had — the Journal is
 * `/journal/<slug>`. Some pointed at `jaminproperties.com/blog/…` (404) and
 * four at `jaminbazaar.com/blog/…` (the domain does not resolve at all).
 *
 * A canonical is not a link a reader clicks; it is an instruction to a search
 * engine that says "the authoritative copy of this page lives here". Pointed at
 * a dead URL it invites the crawler to drop the real article — so this was a
 * quiet deindexing risk across two thirds of the site's largest content asset,
 * and nothing on the page would ever have looked wrong.
 *
 * ⚠️ IT REJECTS ONLY WHAT IS PROVABLY DEAD, and that restraint is deliberate.
 * A cross-domain canonical can be a legitimate editorial decision — an article
 * syndicated from elsewhere should say so. This drops the value ONLY when it
 * matches the known-dead `/blog/` shape, on any of the three hosts involved,
 * and otherwise passes the author's choice through untouched.
 *
 * ⏰ The stored values are still wrong. Correcting them in the console is the
 * real fix; this stops them reaching a crawler in the meantime.
 */
const DEAD_CANONICAL =
  /^(?:https?:\/\/(?:www\.)?(?:jaminproperties\.com|jaminbazaar\.com|jamin-properties-web\.netlify\.app))?\/blog\/[a-z0-9-]+\/?$/i;

export function canonicalFor(p: Pick<JournalPost, "slug" | "seo">): string {
  const stored = p.seo?.canonical?.trim();
  if (stored && !DEAD_CANONICAL.test(stored)) return stored;
  return journalHref(p);
}

/** ⚠️ Pinned to IST, like every other date on the site. `published_at` is a
 *  timestamptz, so formatting it in the reader's own zone made an article
 *  published at 00:29 IST show as the previous day — and the console, which
 *  works in IST, then disagreed with the site about when it went out. */
export function publishedLabel(p: JournalPost): string | null {
  if (!p.published_at) return null;
  return new Date(p.published_at).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  });
}

/** Prefer the stored figure; fall back to counting, at a deliberately
 *  conservative 200 words a minute for reference material. */
export function readingMinutes(p: JournalPost): number | null {
  if (p.reading_minutes && p.reading_minutes > 0) return p.reading_minutes;
  /* ⚠️ null, not a guess. List queries no longer carry `body`, and returning
     the 1-minute floor there would have printed "1 min read" on a 25-minute
     guide — worse than saying nothing. */
  if (!p.body) return null;
  const words = p.body.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

/* ---------- search ---------- */

/**
 * ⚠️ BOTH SIDES OF THE SEARCH MUST NORMALISE THROUGH HERE. The index is built
 * on the server and the query is typed in the browser; if they disagree about
 * case, accents or punctuation the search silently returns nothing for terms
 * that are plainly present. Diacritics are folded because "Vārapatty" and
 * "Varapatty" are the same place to a reader.
 */
export function normaliseForSearch(s: string): string {
  return s
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

const flatten = (v: string | string[] | undefined | null): string =>
  Array.isArray(v) ? v.join(" ") : (v ?? "");

/**
 * The haystack for one article, built on the server so no article body ever
 * reaches the browser.
 *
 * ⚠️ IT DELIBERATELY DOES NOT INDEX `body`. The list query does not fetch
 * bodies — that is a load-bearing decision recorded on LIST_COLUMNS, where
 * pulling them was transferring 246 kB and eventually failing the build. What
 * it indexes instead is the keyword surface the author actually curates: the
 * title, the excerpt, every tag (several articles carry thirty or more), the
 * category, the author, the kind, and the SEO planning fields. So an article
 * is findable by the words its author chose to be found by, which is what
 * those fields were entered for.
 *
 * ⚠️ Stored as a SORTED SET OF WORDS, not as raw prose. Twenty articles of
 * duplicated tag phrases is a payload; the unique words are a fraction of it.
 * The cost is that phrases stop being phrases — "ready to move" matches an
 * article carrying all three words rather than that exact run — which for a
 * twenty-article journal is more forgiving than it is wrong.
 */
export function buildSearchIndex(p: JournalPost): string {
  const seo = p.seo ?? {};
  const parts = [
    p.title,
    p.excerpt ?? "",
    p.blog_categories?.name ?? "",
    p.blog_authors?.name ?? "",
    KIND_LABEL[p.kind] ?? p.kind,
    (p.tags ?? []).join(" "),
    (p.related_locations ?? []).join(" "),
    seo.title ?? "",
    seo.description ?? "",
    seo.focus_keyword ?? "",
    flatten(seo.secondary_keywords),
    flatten(seo.long_tail),
  ];
  const words = new Set(
    normaliseForSearch(parts.join(" "))
      .split(" ")
      .filter((w) => w.length > 1),
  );
  return [...words].sort().join(" ");
}

/**
 * Every term must match, and each matches on a word PREFIX.
 *
 * AND rather than OR because a two-word query is a reader narrowing, not
 * widening — "dtcp erode" should be the articles about both. Prefix rather
 * than exact so the list narrows while the word is still being typed and so
 * "approv" finds "approval" and "approvals" without a stemmer.
 */
export function matchesQuery(index: string, query: string): boolean {
  const terms = normaliseForSearch(query).split(" ").filter(Boolean);
  if (terms.length === 0) return true;
  const words = index.split(" ");
  return terms.every((t) => words.some((w) => w.startsWith(t)));
}

export const KIND_LABEL: Record<string, string> = {
  guide: "Guide",
  explainer: "Explainer",
  location: "Location guide",
  insight: "Insight",
  story: "Project story",
  news: "News",
  checklist: "Checklist",
  comparison: "Comparison",
};
