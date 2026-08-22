import type { NextConfig } from "next";

/**
 * ══════════════════════════════════════════════════════════════════════════
 * SECURITY HEADERS — WHY THEY ARE HERE AND *ALSO* IN netlify.toml
 *
 * 🚨 THE netlify.toml BLOCK ALONE DOES NOT COVER THE PAGES. That was measured,
 * not assumed: the first attempt put the whole set in `netlify.toml` only,
 * deployed with the cache cleared, and the live result was
 *
 *   GET /og-jamin-1200x630.png  → X-Frame-Options, Referrer-Policy,
 *                                 Permissions-Policy, COOP/CORP all present
 *   GET /                       → only Netlify's own HSTS and nosniff
 *
 * `netlify.toml` headers are applied by the CDN to what the CDN serves. Every
 * HTML route on this site is rendered by `@netlify/plugin-nextjs`'s function,
 * whose response the CDN passes through — so the pages, which are exactly
 * where clickjacking and referrer leakage matter, were the one thing left
 * uncovered. Next's own `headers()` is what reaches them.
 *
 * ⚠️ KEEP BOTH. They cover different halves and neither is redundant: this
 * block does not reach `/section/*`'s `X-Robots-Tag`, and the toml does not
 * reach any page. If a header is ever changed, change it in both places.
 *
 * ⚠️ STILL NO Content-Security-Policy. It is the one header here that can
 * white-screen a working site, and this app pulls Google Fonts, Supabase REST
 * + realtime + storage, OpenStreetMap tiles and inline Next hydration. It
 * belongs in its own change, Report-Only first, promoted once the report is
 * clean.
 * ══════════════════════════════════════════════════════════════════════════
 */
const SECURITY_HEADERS = [
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    /* Camera and microphone are denied outright because the account area takes
       KYC uploads: nothing on this origin should be able to open a sensor.
       `geolocation=(self)` stays because the properties map offers "near me". */
    key: "Permissions-Policy",
    value:
      "camera=(), microphone=(), geolocation=(self), payment=(), usb=(), magnetometer=(), gyroscope=(), interest-cohort=()",
  },
  { key: "X-XSS-Protection", value: "1; mode=block" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
  /* `cross-origin`, NOT `same-origin` — WhatsApp, Facebook and X have to be
     able to fetch the share card. Locking this down silently kills every link
     preview, which is the thing the card was added to fix. */
  { key: "Cross-Origin-Resource-Policy", value: "cross-origin" },
];

const nextConfig: NextConfig = {
  images: {
    // Every photograph, brochure cover and master plan is served from the app's
    // own Supabase Storage bucket — that is the single source of truth for
    // media, so it is the only remote host the site is allowed to optimise.
    remotePatterns: [
      {
        protocol: "https",
        hostname: "zmxqozvivdluuxvvcegs.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: SECURITY_HEADERS }];
  },
};

export default nextConfig;
