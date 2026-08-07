import type { MetadataRoute } from "next";
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

    return [
      ...statics,
      ...phases,
      ...all.map((p) => ({
        url: `${SITE_URL}${propertyHref(p)}`,
        lastModified: p.updated_at ? new Date(p.updated_at) : undefined,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
    ];
  } catch {
    // A database hiccup must not take the whole sitemap down.
    return statics;
  }
}
