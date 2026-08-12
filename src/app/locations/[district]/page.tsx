import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, type HeroArt } from "@/components/PageHero";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { Container } from "@/components/ui";
import { getProperties, isSellable } from "@/lib/properties";
import { districtFromSlug, districtNames, districtSlug } from "@/lib/site";
import { SITE_URL } from "@/lib/supabase";
import { seoTitle } from "@/lib/seo";

export const revalidate = 3600;

/**
 * A PAGE PER DISTRICT.
 *
 * The Locations menu has been a top-level nav item with no pages behind it —
 * every entry pointed at `/properties?district=…`, which is a filter, not a
 * destination. This gives the section its own routes, and the reason it had to
 * be routes rather than a smarter filter is the hero: the district lives in the
 * query string, `/properties` is statically prerendered, so the server cannot
 * know which district is being asked for. A per-district picture there could
 * only be swapped in after hydration, which means anyone opening a shared link
 * sees the wrong photograph for a paint. Owner chose these pages 2026-08-12.
 *
 * ⚠️ Generated only for districts that HOLD a property, and `dynamicParams` is
 * false, so an unknown slug 404s rather than quietly producing a thin page for
 * a crawler. Same rule as `/projects/[phase]`.
 *
 * ⚠️ `/properties?district=…` STILL WORKS and is deliberately not redirected.
 * Those links are in the wild, `PropertyExplorer` still reads the query, and
 * the filtered listing is a legitimate view — it just is not the thing the menu
 * points at any more.
 */
export const dynamicParams = false;

/**
 * ⚠️ Coimbatore is ABSENT ON PURPOSE — it falls through to hero-17, the frame
 * `/properties` already carries, which is what the owner asked for ("let
 * Coimbatore hero image be the same"). Adding a district here without supplying
 * a picture for it would be worse than this fallback, because every district
 * would then look like the same page.
 */
const ART_BY_DISTRICT: Record<string, HeroArt> = {
  erode: 34,
  salem: 35,
  tiruppur: 36,
};
const DEFAULT_ART: HeroArt = 17;

/**
 * ⚠️ 0.52, SWEPT — NOT carried over from `/properties`, which runs the same
 * treatment at 0.12.
 *
 * hero-17 is a trimmed banner that is dark where the copy sits. These three are
 * bright golden-hour photographs with a lot of sky, and they measure about 2.5×
 * lighter under the plate: at 0.12 the gold eyebrow reads 1.72–1.88 at the
 * worst pixel, which is not a near miss. Swept on each frame at 1280 (plate
 * region, gold eyebrow — it binds every time, white runs ~1.1× clear):
 *
 *     0.12 → Erode 1.72 · Salem 1.76 · Tiruppur 1.88   ← /properties' value
 *     0.34 → Erode 2.87 · Salem 2.93 · Tiruppur 3.12
 *     0.42 → Erode 3.54 · Salem 3.62 · Tiruppur 3.83
 *     0.52 → Erode ~4.6 · Salem ~4.7 · Tiruppur ~4.9   ← ships
 *
 * One value for three frames rather than three, and that is a departure from
 * the per-frame rule this codebase normally follows — justified here because
 * they are one shoot at one time of day and measure within 0.3 of each other at
 * every step. The number satisfies the DARKEST of them (Erode). At 375 the
 * worst pixel is around 4.1; `.rj-sheer-copy`'s four-layer halo covers the
 * remainder, which is the job it exists for.
 */
const SHEER_ALPHA = 0.52;

export async function generateStaticParams() {
  const all = await getProperties();
  return districtNames(all).map((d) => ({ district: districtSlug(d) }));
}

async function resolve(slug: string) {
  const all = await getProperties();
  const name = districtFromSlug(slug, districtNames(all));
  if (!name) return null;
  const items = all.filter((p) => (p.district ?? p.city ?? "").trim() === name);
  return { name, items };
}

export async function generateMetadata({
  params,
}: PageProps<"/locations/[district]">): Promise<Metadata> {
  const { district } = await params;
  const found = await resolve(district);
  if (!found) return {};
  const selling = found.items.filter(isSellable).length;
  const description = `DTCP-approved residential plots in ${found.name}, Tamil Nadu. ${
    selling > 0
      ? `${selling} Jamin development${selling === 1 ? "" : "s"} selling now`
      : `Jamin developments in ${found.name}`
  } — clear title, formed roads and water to every plot.`;
  return {
    title: { absolute: seoTitle(`Plots for Sale in ${found.name} — DTCP Approved`) },
    description,
    alternates: { canonical: `/locations/${district}` },
    openGraph: {
      title: `Jamin plots in ${found.name}`,
      description,
      url: `${SITE_URL}/locations/${district}`,
    },
  };
}

export default async function DistrictPage({ params }: PageProps<"/locations/[district]">) {
  const { district } = await params;
  const found = await resolve(district);
  if (!found) notFound();

  const { name, items } = found;
  const live = items.filter(isSellable);
  const plots = live.reduce((n, p) => n + (p.plots_available ?? 0), 0);

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Properties", item: `${SITE_URL}/properties` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/locations/${district}` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <PageHero
        art={ART_BY_DISTRICT[district] ?? DEFAULT_ART}
        tone="cinematic"
        size="tall"
        sheer
        sheerAlpha={ART_BY_DISTRICT[district] ? SHEER_ALPHA : 0.12}
        eyebrow={`${name} district`}
        title={`Jamin plots in ${name}`}
        lead={
          <>
            {items.length} development{items.length === 1 ? "" : "s"} in {name}
            {live.length > 0
              ? `, ${live.length} selling now${plots > 0 ? ` with ${plots} plots available` : ""}`
              : ""}
            . Every layout is DTCP approved with clear and marketable title.
          </>
        }
      />

      <Container className="py-phi5">
        <nav aria-label="Breadcrumb" className="text-tiny text-ink-muted">
          <Link href="/properties" className="hover:text-ink">
            Properties
          </Link>
          <span className="px-2">/</span>
          <span className="text-ink">{name}</span>
        </nav>

        {/* ⚠️ The SAME explorer the catalogue uses, handed only this district's
            records. Its own district chips render only when there is more than
            one to choose from, so they disappear here rather than offering a
            filter with a single option — and search, stage and compare all keep
            working inside the district. Rebuilding a cut-down grid here would
            have been a second listing to maintain. */}
        <div className="mt-phi3">
          <PropertyExplorer all={items} />
        </div>
      </Container>
    </>
  );
}
