import type { NextConfig } from "next";

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
};

export default nextConfig;
