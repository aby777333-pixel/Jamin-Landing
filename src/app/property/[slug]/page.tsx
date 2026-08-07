import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { PropertyCard } from "@/components/PropertyCard";
import { MasterPlan } from "@/components/MasterPlan";
import { PlotSchedule } from "@/components/PlotSchedule";
import { SiteMap } from "@/components/SiteMap";
import { SaveProperty } from "@/components/SaveProperty";
import { EnquiryForm } from "@/components/EnquiryForm";
import { DeskActions } from "@/components/DeskActions";
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
  plotStatus,
  propertyHref,
  typeLabel,
  type PropertyDetail,
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

/** Section wrapper so every block on this long page shares one rhythm. */
function Block({
  id,
  title,
  lead,
  children,
}: {
  id: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="mt-phi5 scroll-mt-28">
      <h2 className="text-2xl text-ink">{title}</h2>
      {lead ? <p className="mt-phi2 max-w-2xl text-base leading-relaxed text-ink-muted">{lead}</p> : null}
      <div className="mt-phi3">{children}</div>
    </section>
  );
}

/** Turn `dtcp_approval_no` into `DTCP approval no`, without a lookup table that
 *  would silently drop any key the admin adds later. */
function humanKey(k: string) {
  const s = k.replace(/_/g, " ").trim();
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function buildSchema(p: PropertyDetail) {
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
  // §46 — only fields the content actually supports. No price is published, so
  // no Offer is emitted; a fabricated one would be a rich-snippet lie.
  return schema;
}

function buildBreadcrumbs(p: PropertyDetail) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Properties", item: `${SITE_URL}/properties` },
      { "@type": "ListItem", position: 3, name: p.title, item: `${SITE_URL}${propertyHref(p)}` },
    ],
  };
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
  const utilities = p.utilities ?? [];
  const documents = (p.documents ?? []).filter((d) => d.url);
  const legal = Object.entries(p.legal ?? {}).filter(([, v]) => v);
  const investment = Object.entries(p.investment ?? {}).filter(([, v]) => v);

  const plots = p.plot_layout ?? [];
  const hasGeometry = !!p.plot_plan?.viewBox && plots.some((x) => Array.isArray(x.poly));
  const availablePlots = plots.filter((x) => plotStatus(x) === "available").length;

  const all = await getProperties();
  const related = all.filter((x) => x.id !== p.id && isSellable(x)).slice(0, 3);

  return (
    <article className="mx-auto max-w-[1280px] px-5 py-phi4 lg:px-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema(p)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbs(p)) }}
      />

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

          {/* ---- the layout: interactive where the plan was traced, a live
                 schedule where it was not ---- */}
          {plots.length > 0 && (
            <Block
              id="layout"
              title="The layout"
              lead={
                hasGeometry
                  ? `${plots.length} plots on the sanctioned plan${
                      availablePlots ? `, ${availablePlots} available today` : ""
                    }. Every plot is drawn from the approved drawing, and its state here is the state in our own records.`
                  : `${plots.length} plots in the approved schedule${
                      availablePlots ? `, ${availablePlots} available today` : ""
                    }.`
              }
            >
              {hasGeometry ? (
                <MasterPlan plots={plots} plan={p.plot_plan!} title={p.title} />
              ) : (
                <PlotSchedule plots={plots} />
              )}

              {p.master_plan_url && (
                <a
                  href={p.master_plan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-phi3 inline-block text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red"
                >
                  View the scanned master plan →
                </a>
              )}
            </Block>
          )}

          {amenities.length > 0 && (
            <Block id="amenities" title="Amenities">
              <ul className="grid gap-x-phi3 gap-y-2 sm:grid-cols-2">
                {amenities.map((a) => (
                  <li key={a} className="flex items-start gap-2.5 text-base text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-jamin-gold" />
                    {a}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {utilities.length > 0 && (
            <Block id="utilities" title="Services on site">
              <ul className="grid gap-x-phi3 gap-y-2 sm:grid-cols-2">
                {utilities.map((u) => (
                  <li key={u} className="flex items-start gap-2.5 text-base text-ink-soft">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-canopy" />
                    {u}
                  </li>
                ))}
              </ul>
            </Block>
          )}

          {/* ---- location ---- */}
          {(p.lat != null && p.lng != null) || nearby.length > 0 ? (
            <Block id="location" title="Where it is">
              {p.lat != null && p.lng != null && (
                <SiteMap
                  lat={Number(p.lat)}
                  lng={Number(p.lng)}
                  title={p.title}
                  gmapsUrl={p.gmaps_url}
                  streetViewUrl={p.street_view_url}
                  earthUrl={p.google_earth_url}
                />
              )}

              {nearby.length > 0 && (
                <>
                  <h3 className="mt-phi4 text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
                    What&rsquo;s nearby
                  </h3>
                  <ul className="mt-phi2 divide-y divide-line border-y border-line">
                    {nearby.map((n, i) => (
                      <li key={i} className="flex items-center justify-between gap-4 py-3">
                        <div>
                          <div className="text-base text-ink">{n.name}</div>
                          {n.category && (
                            <div className="text-tiny text-ink-faint">{n.category}</div>
                          )}
                        </div>
                        {n.distance && (
                          <div className="shrink-0 text-base font-medium text-jamin-red">
                            {n.distance}
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Block>
          ) : null}

          {/* ---- legal & documents (§15, §78) ---- */}
          {(legal.length > 0 || documents.length > 0 || p.rera_number) && (
            <Block
              id="legal"
              title="Approvals & documents"
              lead="What has been sanctioned, and the paperwork behind it."
            >
              {(legal.length > 0 || p.rera_number) && (
                <dl className="divide-y divide-line border-y border-line">
                  {p.rera_number && (
                    <div className="flex flex-wrap items-baseline justify-between gap-3 py-3">
                      <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">RERA</dt>
                      <dd className="text-base text-ink">{p.rera_number}</dd>
                    </div>
                  )}
                  {legal.map(([k, v]) => (
                    <div key={k} className="flex flex-wrap items-baseline justify-between gap-3 py-3">
                      <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">
                        {humanKey(k)}
                      </dt>
                      <dd className="max-w-md text-right text-base text-ink">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              )}

              {documents.length > 0 && (
                <ul className="mt-phi3 space-y-2">
                  {documents.map((d) => (
                    <li key={d.url}>
                      <a
                        href={d.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between gap-4 rounded-card border border-line bg-canvas px-phi3 py-3 transition-colors hover:border-ink-faint"
                      >
                        <span className="text-base text-ink">{d.label ?? "Document"}</span>
                        <span className="shrink-0 text-tiny text-ink-faint">
                          {d.size ? `${d.size} · ` : ""}Open
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}

              <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
                Approval details are published as recorded in the sanctioned documents. Verify the
                current position with the issuing authority before you commit to a purchase.
              </p>
            </Block>
          )}

          {investment.length > 0 && sellable && (
            <Block id="investment" title="Why this location">
              <dl className="divide-y divide-line border-y border-line">
                {investment.map(([k, v]) => (
                  <div key={k} className="py-3">
                    <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">
                      {humanKey(k)}
                    </dt>
                    <dd className="mt-1 text-base leading-relaxed text-ink-soft">{String(v)}</dd>
                  </div>
                ))}
              </dl>
            </Block>
          )}

          {videos.length > 0 && (
            <Block id="video" title="Video walkthrough">
              <div className="grid gap-phi3 sm:grid-cols-2">
                {videos.map((v) => (
                  /* §68 — never autoplay, and never load the media until asked. */
                  <video
                    key={v}
                    src={v}
                    controls
                    preload="none"
                    playsInline
                    poster={coverImage(p) ?? undefined}
                    className="w-full rounded-card border border-line bg-ink"
                  />
                ))}
              </div>
            </Block>
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
              {p.road_frontage && <Stat label="Road frontage" value={p.road_frontage} />}
              {p.rera_number && <Stat label="RERA" value={p.rera_number} />}
            </dl>

            <div className="mt-phi3 space-y-2.5">
              {/* Straight to the form on this page, not off to /contact where
                  the project they were reading gets lost. */}
              <a
                href="#enquire"
                className="block rounded-full bg-jamin-red px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
              >
                Book a site visit
              </a>

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

              {plots.length > 0 && (
                <a
                  href="#layout"
                  className="block rounded-full border border-ink/15 px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition hover:border-ink/40"
                >
                  See the plot layout
                </a>
              )}

              {/* A small client island on an otherwise static page. */}
              <SaveProperty propertyId={p.id} />
            </div>

            {p.virtual_tour_url && (
              <a
                href={p.virtual_tour_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-phi3 block border-t border-line pt-phi2 text-tiny font-medium text-jamin-red hover:opacity-70"
              >
                Take the 360° tour →
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* §39 — the conversion block sits after the read, where somebody who has
          just gone through the plan and the approvals is most interested. */}
      <section
        id="enquire"
        className="mt-phi6 scroll-mt-28 rounded-card border border-line bg-canvas-alt p-phi4"
      >
        <h2 className="text-2xl text-ink">Ask about {p.title}</h2>
        <p className="mt-phi2 max-w-xl text-base leading-relaxed text-ink-muted">
          Two fields and we will call you back — plot availability, the current rate, or a date to
          walk the site.
        </p>
        <div className="mt-phi3 grid gap-phi4 lg:grid-cols-[1.618fr_1fr]">
          <EnquiryForm propertyId={p.id} propertyTitle={p.title} />
          <div>
            <h3 className="text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
              Or reach us now
            </h3>
            <div className="mt-phi2">
              <DeskActions context={p.title} url={`${SITE_URL}${propertyHref(p)}`} />
            </div>
          </div>
        </div>
      </section>

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
