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
  seo: { title?: string; description?: string; canonical?: string; og_image?: string; noindex?: boolean } | null;
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
