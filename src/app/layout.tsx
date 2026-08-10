import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
/* After globals: the cadastral layer adds to the foundation, it never
   overrides an audited decision made there. */
import "@/styles/cadastral.css";
/* After cadastral: the material layer, on the same terms. */
import "@/styles/royal.css";
import { ScrollNav } from "@/components/ScrollNav";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Jamindar } from "@/components/Jamindar";
import { PaperGrain } from "@/components/cadastral/PaperGrain";
import { SITE_URL } from "@/lib/supabase";

/** One typeface, as the brief asks. Inter carries display and UI both; the
 *  hierarchy comes from weight and scale rather than from a second family.
 *  Loading one variable font instead of two also removes a render-blocking
 *  request, which is where a "premium" site usually loses its speed.
 *
 *  ⚠️ 2026-08-10: the Maharaja brief asked for four families (Marcellus,
 *  Cormorant Garamond, Noto Serif Tamil, Inter) and they were built and
 *  measured before the owner reverted to Inter alone. Recording the outcome so
 *  the same ground is not re-walked a fourth time — this rule has now survived
 *  three separate briefs that each asked for a display serif:
 *
 *  - Marcellus carried the headings convincingly, and cost two extra
 *    render-blocking families for the pair.
 *  - Noto Serif Tamil had nothing to set: there is no Tamil script in the
 *    source or in any property's title, description, locality or location text.
 *  - The material change in this redesign is doing the work regardless. What
 *    reads as expensive is the champagne-against-onyx discipline, the gem
 *    banding and the hairlines — not the face the headline is set in. */
const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Jamin Properties — DTCP-Approved Plots & Land in Tamil Nadu",
    template: "%s | Jamin Properties",
  },
  description:
    "DTCP-approved residential plotted layouts across Tamil Nadu — clear title, wide internal roads and loan assistance, in Salem, Erode and Coimbatore.",
  keywords: [
    "DTCP approved plots Tamil Nadu",
    "residential plots Salem",
    "plots for sale Erode",
    "land investment Tamil Nadu",
    "Jamin Properties",
    "Jamin Bazaar",
  ],
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Jamin Properties",
    locale: "en_IN",
    url: SITE_URL,
    title: "Jamin Properties — DTCP-Approved Plots & Land in Tamil Nadu",
    description:
      "DTCP-approved residential plotted layouts across Tamil Nadu, with clear title and bank loan assistance.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Jamin Properties — DTCP-Approved Plots & Land in Tamil Nadu",
    description:
      "DTCP-approved residential plotted layouts across Tamil Nadu, with clear title and bank loan assistance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-image-preview": "large" },
  },
};

/** Organisation-level structured data, emitted once for the whole site. */
const orgSchema = {
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  name: "Jamin Properties",
  url: SITE_URL,
  areaServed: { "@type": "State", name: "Tamil Nadu" },
  address: { "@type": "PostalAddress", addressRegion: "Tamil Nadu", addressCountry: "IN" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    /* `data-scroll-behavior="smooth"` is not decorative. globals.css sets
       `scroll-behavior: smooth` so in-page anchors glide, and Next only
       suspends that during a route change when this attribute is present
       (`disableSmoothScrollDuringRouteTransition`). Without it the router's
       scroll-to-top animates, the destination's images land mid-flight and
       change the document height, and the animation stops wherever it got to —
       which is why "See what is selling" used to open half a screen down. */
    <html
      lang="en-IN"
      data-scroll-behavior="smooth"
      /* The incumbent palette. Swap to "ruby" to see the brief's darker
         primary; every control resolves through --color-cta, so nothing else
         in the tree has to know which one is active. */
      data-palette="heritage"
      className={`${body.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col">
        {/* Once for the document. Never per section — see the component. */}
        <PaperGrain />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-ink focus:px-4 focus:py-2 focus:text-canvas"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main" className="flex-1">
          {children}
        </main>
        <SiteFooter />
        {/* Public since 2026-08-08 — safe only because the anonymous rate
            limiter is live and verified. See components/JamindarDock.tsx. */}
        <Jamindar />
        {/* Stacks ABOVE the concierge medallion in the same corner — see the
            component for why they share a column rather than sit side by side. */}
        <ScrollNav />
      </body>
    </html>
  );
}
