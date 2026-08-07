import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/supabase";

export default function robots(): MetadataRoute.Robots {
  return {
    // /account is private and /compare is a working view, not a destination.
    // Both also carry a noindex of their own — this is the second lock.
    rules: { userAgent: "*", allow: "/", disallow: ["/account", "/compare"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
