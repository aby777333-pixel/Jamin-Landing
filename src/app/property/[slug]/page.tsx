import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { PropertyCard } from "@/components/PropertyCard";
import { SITE_URL } from "@/lib/supabase";
import {
  approvalBadges,
  coverImage,
  formatArea,
  formatPrice,
  getProperties,
  getProperty,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  typeLabel,
  type Property,
} from "@/lib/properties";

export const revalidate = 3600;

/** Pre-render every property at build time; ISR keeps them fresh afterwards. */
export async function generateStaticParams() {
  const all = await getProperties();
  return all.map((p) => ({ slug: p.slug || p.id }));
}

export async function generateMetadata({
  params,
}: PageProps<"/property/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) return { title: "Property not found" };

  // The admin already writes SEO copy per property — reuse it rather than
  // generating a second, competing description.
  const title = p.seo?.title ?? `${p.title} — ${typeLabel(p)} in ${p.city ?? "Tamil Nadu"}`;
  const description =
    p.seo?.description ??
    p.description?.slice(0, 300) ??
    `${p.title}, ${locationLine(p)}. DTCP-approved plotted development by Jamin Properties.`;
  const cover = coverImage(p);
  const url = `${SITE_URL}${propertyHref(p)}`;

  return {
    title,
    description,
    alternates: { canonical: propertyHref(p) },
    openGraph: {
      type: "article",
      url,
      title,
      description,
      images: cover ? [{ url: cover, width: 1200, height: 630, alt: p.title }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: cover ? [cover] : undefined,
    },
  };
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-phi2">
      <dt className="text-micro font-semibold uppercase tracking-[0.14em] text-ink-faint">
        {label}
      </dt>
      <dd className="mt-1.5 text-lg text-ink">{value}</dd>
    </div>
  );
}

function buildSchema(p: Property) {
  const schema: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "Residence",
    name: p.title,
    description: p.seo?.description ?? p.description ?? undefined,
    url: `${SITE_URL}${propertyHref(p)}`,
    image: p.images?.slice(0, 6) ?? undefined,
    address: {
      "@type": "PostalAddress",
      addressLocality: p.city ?? undefined,
      addressRegion: p.state ?? undefined,
      addressCountry: "IN",
    },
  };
  if (p.lat != null && p.lng != null) {
    schema.geo = { "@type": "GeoCoordinates", latitude: p.lat, longitude: p.lng };
  }
  return schema;
}

export default async function PropertyPage({ params }: PageProps<"/property/[slug]">) {
  const { slug } = await params;
  const p = await getProperty(slug);
  if (!p) notFound();

  const images = p.images ?? [];
  const videos = [...(p.videos ?? []), ...(p.drone_videos ?? [])];
  const approvals = approvalBadges(p);
  const area = formatArea(p);
  const sellable = isSellable(p);
  const nearby = p.nearby_places ?? [];
  const amenities = p.amenities ?? [];

  const all = await getProperties();
  const related = all.filter((x) => x.id !== p.id && isSellable(x)).slice(0, 3);

  return (
    <article className="mx-auto max-w-[1280px] px-5 py-phi4 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema(p)) }}
      />

      {/* breadcrumbs — required by the brief and good for indexing */}
      <nav aria-label="Breadcrumb" className="text-tiny text-ink-faint">
        <Link href="/" className="hover:text-jamin-red">
          Home
        </Link>
        <span className="px-2">/</span>
        <Link href="/properties" className="hover:text-jamin-red">
          Properties
        </Link>
        <span className="px-2">/</span>
        <span className="text-ink-soft">{p.title}</span>
      </nav>

      <header className="mt-phi3 flex flex-wrap items-start justify-between gap-phi3">
        <div className="max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            {phaseLabel(p) && (
              <span className="rounded-full bg-jamin-gold-soft px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-jamin-gold">
                {phaseLabel(p)}
              </span>
            )}
            {approvals.map((a) => (
              <span
                key={a}
                className="rounded-full bg-canopy-soft px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-canopy"
              >
                {a} Approved
              </span>
            ))}
            {!sellable && (
              <span className="rounded-full bg-ink px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-white">
                {p.status === "sold" ? "Sold Out" : p.status}
              </span>
            )}
          </div>
          <h1 className="mt-phi2 text-3xl text-ink lg:text-4xl">{p.title}</h1>
          <p className="mt-phi2 text-lg text-ink-muted">{locationLine(p)}</p>
        </div>

        <div className="text-right">
          <div className="text-2xl text-ink">{formatPrice(p)}</div>
          {p.price == null && (
            <p className="mt-1 max-w-[15rem] text-tiny leading-relaxed text-ink-faint">
              Our sales desk confirms the current rate — we don&rsquo;t publish estimates.
            </p>
          )}
        </div>
      </header>

      <div className="mt-phi4">
        <Gallery images={images} title={p.title} />
      </div>

      <div className="mt-phi5 grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
        <div>
          {p.description && (
            <section>
              <h2 className="text-2xl text-ink">About this development</h2>
              <div className="mt-phi3 space-y-4 text-lg leading-relaxed text-ink-soft">
                {p.description.split(/\n{2,}/).map((para, i) => (
                  <p key={i}>{para}</p>
                ))}
              </div>
            </section>
          )}

          {amenities.length > 0 && (
            <section className="mt-phi5">
              <h2 className="text-2xl text-ink">Amenities</h2>
              <ul className="mt-phi3 grid gap-x-phi3 gap-y-2 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-base text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-jamin-gold" />
                    {a}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {nearby.length > 0 && (
            <section className="mt-phi5">
              <h2 className="text-2xl text-ink">What&rsquo;s nearby</h2>
              <ul className="mt-phi3 divide-y divide-line border-y border-line">
                {nearby.map((n, i) => (
                  <li key={i} className="flex items-center justify-between gap-4 py-3">
                    <div>
                      <div className="text-base text-ink">{n.name}</div>
                      {n.category && <div className="text-tiny text-ink-faint">{n.category}</div>}
                    </div>
                    {n.distance && (
                      <div className="shrink-0 text-base font-medium text-jamin-red">
                        {n.distance}
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {videos.length > 0 && (
            <section className="mt-phi5">
              <h2 className="text-2xl text-ink">Video walkthrough</h2>
              <div className="mt-phi3 grid gap-phi3 sm:grid-cols-2">
                {videos.map((v) => (
                  <video
                    key={v}
                    src={v}
                    controls
                    preload="metadata"
                    className="w-full rounded-card border border-line bg-ink"
                  />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* ---- sticky enquiry rail ---- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <div className="rounded-card border border-line bg-canvas-alt p-phi3 shadow-lift">
            <dl className="space-y-phi2">
              <Stat label="Type" value={typeLabel(p)} />
              {area && <Stat label="Total extent" value={area} />}
              {p.plots_total != null && (
                <Stat
                  label="Plots"
                  value={
                    p.plots_available != null
                      ? `${p.plots_available} of ${p.plots_total} available`
                      : String(p.plots_total)
                  }
                />
              )}
              {p.rera_number && <Stat label="RERA" value={p.rera_number} />}
            </dl>

            <div className="mt-phi3 space-y-2.5">
              <Link
                href="/contact"
                className="block rounded-full bg-jamin-red px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
              >
                Book a site visit
              </Link>

              {p.brochure_url && (
                <a
                  href={p.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full border border-ink/15 px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-ink/40"
                >
                  Download brochure
                </a>
              )}

              {p.gmaps_url && (
                <a
                  href={p.gmaps_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-full border border-ink/15 px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-ink/40"
                >
                  Open in Maps
                </a>
              )}
            </div>

            {p.master_plan_url && (
              <a
                href={p.master_plan_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-phi3 block border-t border-line pt-phi2 text-tiny font-medium text-jamin-red hover:opacity-70"
              >
                View master plan →
              </a>
            )}
          </div>
        </aside>
      </div>

      {related.length > 0 && (
        <section className="mt-phi7 border-t border-line pt-phi5">
          <h2 className="text-2xl text-ink">Other developments</h2>
          <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <PropertyCard key={r.id} p={r} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
