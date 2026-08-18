import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
/* After globals: the cadastral layer adds to the foundation, it never
   overrides an audited decision made there. */
import "@/styles/cadastral.css";
/* After cadastral: the material layer, on the same terms. */
import "@/styles/royal.css";
/* Last: ornament. Decoration only — nothing in it changes what a page says or
   does, and the site is functionally identical without it. It is imported last
   on purpose; see the header of that file. */
import "@/styles/ornament.css";
import { ScrollNav } from "@/components/ScrollNav";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Jamindar } from "@/components/Jamindar";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import { ShortlistTray } from "@/components/ShortlistTray";
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
/** CARTOUCHE TYPE PATCH (2026-08-17, supersedes the three-face round of the
 *  same day): INTER IS THE ONLY TYPEFACE AGAIN — one variable file, 100–900.
 *  Every distinction the three families carried now comes from weight, size,
 *  tracking, case, colour and OpenType features inside the one family:
 *
 *  - display: weight 800–900 + negative tracking (+ uppercase where a hero
 *    already sets it) — replaces Archivo. Inter has no width axis; every
 *    `wdth` declaration is deleted, never simulated with scaleX.
 *  - body: weight 400 at 1.7 leading — replaces Newsreader.
 *  - data: `.ledger` and the serials — SLASHED ZERO (`zero`) + tabular
 *    numerals (`tnum`) + 0.06–0.11em tracking + uppercase, which is what
 *    keeps "DTCP 320/2025" and "JG-SLM-061" reading as figures of record
 *    now that no mono face is doing it for free. Replaces IBM Plex Mono.
 *
 *  ⚠️ The variable keeps the --font-body name: it is the one name every
 *  stylesheet already references, and renaming it would touch four files to
 *  produce identical pixels.
 *  ⚠️ Tamil (patch §7): no decision needed HERE — this site has no `ta`
 *  locale and no Tamil script anywhere in source or data (verified in the
 *  Maharaja round); the Noto Sans Tamil exception activates only if Tamil
 *  content ever ships. */
const body = Inter({
  subsets: ["latin", "latin-ext"],
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

/**
 * 🚨 `interactiveWidget: "resizes-content"` IS A BUG FIX, NOT A PREFERENCE.
 *
 * The default is `resizes-visual`: when the on-screen keyboard opens, only the
 * VISUAL viewport shrinks. The layout viewport — and therefore `100dvh`, `vh`
 * and everything `position: fixed` — keeps the height of the whole screen, so a
 * full-screen panel quietly extends underneath the keyboard.
 *
 * That is the Jamindar report: with the keyboard up, the header and language
 * chips were visible and the question box was not; scroll down to reach the box
 * and the header left the screen. Nothing was wrong with the panel's own
 * layout — it is a correct `flex-col` with a `shrink-0` header, a `min-h-0
 * flex-1` transcript and a `shrink-0` composer — it was simply being told the
 * screen was 300px taller than the part the reader could see.
 *
 * `resizes-content` makes the layout viewport shrink with the keyboard, so
 * `100dvh` becomes the space actually visible and that flex column resolves
 * exactly as designed: header pinned, composer pinned, only the transcript
 * scrolls.
 *
 * ⚠️ It is site-wide because it is a viewport declaration, and that is fine —
 * it is what iOS Safari already does. The one thing it changes elsewhere is
 * that a `fixed` element now sits above the keyboard rather than behind it,
 * which is the desirable direction everywhere on this site.
 *
 * ⚠️ Safari does NOT support this key. `JamindarDock` carries a
 * `visualViewport` fallback for that; the two are belt and braces and neither
 * one covers every browser alone.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  interactiveWidget: "resizes-content",
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
        {/* CARBON boot (dark mode): applies the stored choice before first
            paint so a dark reader never sees a flash of sand. Inline and
            three lines on purpose — a component would run after hydration. */}
        <script
          dangerouslySetInnerHTML={{
            __html:
              'try{if(localStorage.getItem("jp-mode")==="dark")document.documentElement.dataset.mode="dark"}catch(e){}',
          }}
        />
        {/* Once for the document. Never per section — see the component. */}
        <PaperGrain />
        {/* The bound edge (Gilded Register §9): the book's gilded spine down
            the viewport's left, constant on every page. Desktop only. */}
        <div className="rj-spine" aria-hidden="true" />
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
        {/* The browser shortlist's tray — bottom-left (Jamindar owns
            bottom-right), renders nothing until something is kept. */}
        <ShortlistTray />
        {/* The installable site's worker — production only, network-first,
            see public/sw.js for the whole safety argument. */}
        <ServiceWorkerRegistration />
        {/* Stacks ABOVE the concierge medallion in the same corner — see the
            component for why they share a column rather than sit side by side. */}
        <ScrollNav />
      </body>
    </html>
  );
}
