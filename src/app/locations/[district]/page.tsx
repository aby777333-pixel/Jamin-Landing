import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PageHero, type HeroArt } from "@/components/PageHero";
import { PropertyExplorer } from "@/components/PropertyExplorer";
import { Container } from "@/components/ui";
import { CallbackBand } from "@/components/CallbackBand";
import { getProperties, isSellable } from "@/lib/properties";
import { districtFromSlug, districtNames, districtSlug } from "@/lib/site";
import { ThumbIndex } from "@/components/ThumbIndex";
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
/**
 * ⚠️ 2026-08-13: Erode and Tiruppur took NEW owner artwork (34 → 38, 36 → 39),
 * Salem kept hero-35. The two new frames are a working site — planting, kerbing,
 * a backhoe, a roller — where 34/35/36 are a finished ceremonial gateway, and
 * they are NOT from that shoot, so `SHEER_ALPHA` below was re-swept against them
 * rather than inherited. 34 and 36 return to the spare pile.
 */
const ART_BY_DISTRICT: Record<string, HeroArt> = {
  erode: 38,
  salem: 35,
  tiruppur: 39,
};
const DEFAULT_ART: HeroArt = 17;

/**
 * ⚠️ 0.52, SWEPT — NOT carried over from `/properties`, which runs the same
 * treatment at 0.12, and NOT inherited across the 2026-08-13 artwork swap.
 *
 * hero-17 was a trimmed banner that is dark where the copy sits. These frames
 * are bright daylight photographs with a lot of sky, and they measure about
 * 2.5× lighter under the plate: at 0.12 the gold eyebrow read 1.72–1.88 at the
 * worst pixel, which is not a near miss.
 *
 * RE-SWEPT 2026-08-13 when Erode and Tiruppur changed picture. The value did
 * not move, and that is a measured result rather than an assumption — the two
 * new frames are hazier and flatter than the golden-hour gateway they replace,
 * so they lose p95 but gain at the worst pixel, which is the number that binds.
 * Champagne-50 eyebrow (it binds every time, white runs ~1.1× clear), over the
 * plate rect, at the two widths where copy genuinely composites over the
 * photograph — geometry taken off the live page:
 *
 *                       1024 p95 / worst      1280 p95 / worst
 *     0.42  hero-38     4.77 / 3.43           5.13 / 4.14
 *           hero-39     4.66 / 3.60           5.50 / 3.92
 *           hero-35     4.73 / 3.51           4.90 / 3.62
 *     0.52  hero-38     6.11 / 4.56  ← binds  6.51 / 5.39
 *           hero-39     5.98 / 4.76           6.90 / 5.15
 *           hero-35     6.06 / 4.66           6.25 / 4.79
 *     0.58  hero-38     7.11 / 5.47           7.53 / 6.36
 *           hero-39     6.98 / 5.69           7.92 / 6.10
 *
 * 0.42 fails all three. 0.52 clears AA on every frame at both widths, and its
 * binding case (hero-38 at 1024, 4.56) sits a whisker ABOVE the 4.53 that
 * hero-34 shipped at, so the swap does not spend any of the margin that was
 * already audited. Over the eyebrow's own box every frame reads 6.1–7.8 — the
 * plate-rect figure is the conservative proxy this register measures by.
 *
 * ⚠️ 1024 is the tight width, NOT 375. Below `lg` the cinematic tone puts the
 * picture in a band ABOVE the copy and the words sit on the section's own
 * charcoal, so no photograph is behind them at all — see the correction under
 * hero-34/35/36 in public/hero/README.md.
 *
 * One value for three frames rather than three. That departs from the per-frame
 * rule this codebase normally follows, and it survives the swap for the same
 * reason it was granted: they measure within 0.3 of each other at every step,
 * and the number satisfies the tightest of them.
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

      {/* The fore-edge tabs. This is the one page where they earn their keep:
          a reader here is already thinking in districts. */}
      <ThumbIndex districts={districtNames(await getProperties())} current={name} />

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
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
