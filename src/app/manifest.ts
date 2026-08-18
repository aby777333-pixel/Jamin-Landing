import type { MetadataRoute } from "next";

/**
 * THE INSTALLABLE SITE (do-all round #2, 2026-08-18) — "Add Jamin to your
 * home screen". Next serves this at /manifest.webmanifest and stamps the
 * link tag itself.
 *
 * ⚠️ Colours are the LIGHT theme's literals — a manifest cannot read CSS
 * variables, and the splash screen showing sand then a carbon page is the
 * lesser evil than the reverse (light is the default). The icons are the
 * red mark on the signal ground, padded for maskable crops.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Jamin Properties",
    short_name: "Jamin",
    description:
      "DTCP-approved residential plots across Tamil Nadu — approvals, plans and plot schedules published.",
    start_url: "/",
    display: "standalone",
    background_color: "#F0E1D6",
    theme_color: "#C90202",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
