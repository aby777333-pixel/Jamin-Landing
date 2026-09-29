import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/supabase";

export default function robots(): MetadataRoute.Robots {
  return {
    // /account is private; its own noindex is the second lock.
    // ⚠️ /compare is NOT disallowed, deliberately. It carries `noindex, follow`,
    // and a crawler can only obey a noindex it is allowed to fetch — blocking it
    // here hid the tag and left ~95 incoming links pointing into a wall.
    rules: { userAgent: "*", allow: "/", disallow: ["/account"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
