import type { MetadataRoute } from "next";
import { getJournalCategories, getJournalPosts, journalHref } from "@/lib/journal";
import { getProperties, propertyHref } from "@/lib/properties";
import { PHASE_ORDER } from "@/lib/site";
import { SITE_URL } from "@/lib/supabase";

export const revalidate = 3600;

/** Generated from the live database, so a property added in the admin console
 *  enters the sitemap on the next revalidation without anyone editing a list. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const statics: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/properties`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/about`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/downloads`, changeFrequency: "weekly", priority: 0.7 },
    /* ⚠️ Added with the route, not after it. A new public page reachable from
       the primary nav but absent here is discoverable only by crawl, which is
       exactly the gap nobody notices until the page has been live for months. */
    { url: `${SITE_URL}/vault`, changeFrequency: "monthly", priority: 0.6 },
  ];

  try {
    const all = await getProperties();
    // Only the stages that were actually built as pages. `dynamicParams` is
    // false on that route, so listing an empty stage would put a 404 in the
    // sitemap.
    const phases: MetadataRoute.Sitemap = PHASE_ORDER.filter((k) =>
      all.some((p) => p.project_phase === k),
    ).map((k) => ({
      url: `${SITE_URL}/projects/${k}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));

    // Journal. RLS only returns published articles, and the category route is
    // built only for categories that hold one — so listing them here cannot
    // put a 404 or an unpublished draft into the sitemap.
    const [posts, cats] = await Promise.all([getJournalPosts(), getJournalCategories()]);
    const usedCats = new Set(posts.map((p) => p.blog_categories?.slug).filter(Boolean));
    const journal: MetadataRoute.Sitemap = posts.length
      ? [
          { url: `${SITE_URL}/journal`, changeFrequency: "weekly" as const, priority: 0.8 },
          ...cats
            .filter((c) => usedCats.has(c.slug))
            .map((c) => ({
              url: `${SITE_URL}/journal/category/${c.slug}`,
              changeFrequency: "weekly" as const,
              priority: 0.6,
            })),
          ...posts
            .filter((p) => !p.seo?.noindex)
            .map((p) => ({
              url: `${SITE_URL}${journalHref(p)}`,
              lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
              changeFrequency: "monthly" as const,
              priority: 0.7,
            })),
        ]
      : [];

    return [
      ...statics,
      ...phases,
      ...all.map((p) => ({
        url: `${SITE_URL}${propertyHref(p)}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...journal,
    ];
  } catch {
    // A database hiccup must not take the whole sitemap down.
    return statics;
  }
}
