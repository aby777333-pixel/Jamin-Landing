import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Gallery } from "@/components/Gallery";
import { PropertyCard } from "@/components/PropertyCard";
import { LayoutViews } from "@/components/LayoutViews";
import { SiteMap } from "@/components/SiteMap";
import { SaveProperty } from "@/components/SaveProperty";
import { EnquiryForm } from "@/components/EnquiryForm";
import { VisitBooking } from "@/components/VisitBooking";
import { DeskActions } from "@/components/DeskActions";
import { DownloadList, downloadsFor } from "@/components/Downloads";
import { ApprovalStrip } from "@/components/cadastral/ApprovalStrip";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";
import { SurveyReveal } from "@/components/cadastral/SurveyReveal";
import { SITE_URL } from "@/lib/supabase";
import { seoDescription, seoTitle } from "@/lib/seo";
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
  type Property,
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
  // generating a second, competing description. Both sources get clamped: the
  // audit found the admin's own descriptions at 187 and 191 characters and the
  // body-text fallback at 263 and 300.
  const adminTitle = p.seo?.title?.trim();
  const title = seoTitle(
    adminTitle || `${p.title} — Plots in ${p.district ?? p.city ?? "Tamil Nadu"}`,
  );
  const description = seoDescription(
    p.seo?.description ||
      p.description ||
      `${p.title}, ${locationLine(p)}. DTCP-approved plotted development by Jamin Properties.`,
  );
  const cover = coverImage(p);
  const url = `${SITE_URL}${propertyHref(p)}`;

  return {
    // Always absolute: every project title already begins "Jamin Garden",
    // so the "| Jamin Properties" template would spend 19 of the 60 usable
    // characters repeating the brand.
    title: { absolute: title },
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
  className = "",
}: {
  id: string;
  title: string;
  lead?: string;
  children: React.ReactNode;
  /** Ornament hook only — `rj-sheet` puts registration ticks at the corners of
   *  a block that genuinely is a drawing. Never anything structural. */
  className?: string;
}) {
  return (
    <section id={id} className={`mt-phi5 scroll-mt-28 ${className}`}>
      {/* The gold rule now rules ITSELF across, the way a guide line is drawn
          before the words — see SurveyReveal. On a page this long the sections
          otherwise run into one another as an undifferentiated column. */}
      <SurveyReveal className="mb-phi3">
        <h2 className="text-2xl text-ink">{title}</h2>
      </SurveyReveal>
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
  // Brochure + sanctioned plan + every document, as one unbranded set.
  const downloads = downloadsFor(p);
  const legal = Object.entries(p.legal ?? {}).filter(([, v]) => v);
  const investment = Object.entries(p.investment ?? {}).filter(([, v]) => v);

  const plots = p.plot_layout ?? [];
  const hasGeometry = !!p.plot_plan?.viewBox && plots.some((x) => Array.isArray(x.poly));
  const availablePlots = plots.filter((x) => plotStatus(x) === "available").length;

  const headerArt = headerArtFor(p);

  const all = await getProperties();
  const related = all.filter((x) => x.id !== p.id && isSellable(x)).slice(0, 3);

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildSchema(p)) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(buildBreadcrumbs(p)) }}
      />

      {/* This page's hero is the project's OWN photography, not the brand
          renders every other page opens with. A real picture of the land beats
          a conceptual one, and putting a render here would imply it shows this
          development — which it does not. */}
      <section className="relative overflow-hidden border-b border-line bg-canvas">
        <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
        <div className="relative mx-auto max-w-[1280px] px-5 pt-phi3 lg:px-10">
          <nav aria-label="Breadcrumb" className="text-tiny text-ink-faint">
            <Link href="/" className="hover:text-jamin-red-deep">
              Home
            </Link>
            <span className="px-2.5 text-jamin-gold" aria-hidden="true">
              <span className="inline-block h-1 w-1 rotate-45 rounded-[1px] bg-jamin-gold align-middle" />
            </span>
            <Link href="/properties" className="hover:text-jamin-red-deep">
              Properties
            </Link>
            <span className="px-2.5 text-jamin-gold" aria-hidden="true">
              <span className="inline-block h-1 w-1 rotate-45 rounded-[1px] bg-jamin-gold align-middle" />
            </span>
            <span className="text-ink-soft">{p.title}</span>
          </nav>

          {/* 🚨 THE HEADER IS A TWO-TRACK GRID FROM `xl`, AND THE RIGHT TRACK
              BLEEDS OFF THE PAGE.

              Owner's request 2026-08-13: put the project name on one line, and
              burn a picture into the empty right half. Both halves of that were
              real — the titles ran to two lines on every property ("Jamin
              Garden —" then the place, which reads as two thoughts), and beyond
              the copy there was nothing but blueprint grid to the window edge.

              ⚠️ THE SPLIT STARTS AT `xl`, NOT `lg`. At 1024 the container's
              inner width is 944px; a 620px copy column leaves 310px of picture,
              which is a stripe rather than a photograph, and narrowing the copy
              to fit puts the title back onto two lines. Below `xl` the copy
              takes the full width and there is no image — an honest "there is
              no room for both" rather than a bad version of both. */}
          {/* ⚠️ `items-center`, where this was `items-end`. Bottom-aligning the
              copy was right while the picture was a 320px band — the two blocks
              ended together. Against a 414–480px picture it leaves a hole above
              the badges, which is the "large empty space on the right" complaint
              arriving from the other side. */}
          <div className="pb-phi4 xl:grid xl:grid-cols-[minmax(0,620px)_1fr] xl:items-center xl:gap-phi4">
          {/* ⚠️ `relative z-10` is what makes the burn's leftward reach safe.
              The picture is the SECOND grid item, so without a raised copy
              column it paints over the title and the status card the moment the
              two overlap. Raising the words rather than lowering the picture
              keeps the stacking readable: everything in this header sits above
              the artwork, by construction. */}
          <header className="relative z-10 flex flex-wrap items-end justify-between gap-phi3">
            <div className="max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                {phaseLabel(p) && (
                  <span className="rounded-full bg-jamin-gold-soft px-3 py-1 text-micro font-semibold uppercase tracking-[0.12em] text-jamin-gold-ink">
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
              {/* 🚨 ONE LINE, AND THE SIZE IS MEASURED RATHER THAN CHOSEN.
                  `text-4xl` clamps to 4.236rem — 67.8px at 1440 — and the
                  longest title on the site, "Jamin Garden — Shastri Nagar",
                  renders 912px wide at that size. It has never fitted anything.
                  Measured in the page's own h1 style at 1440: 32px → 430px ·
                  40px → 538 · 44px → 592 · 48px → 646.
                  So the ceiling is 2.75rem (44px), which clears the 620px copy
                  track with 28px to spare, and the fluid part is sized to keep
                  the same title on one line all the way down to 768 (36px →
                  484px against 728px of container). Below that a phone cannot
                  hold it on one line at any readable size, and it wraps.
                  ⚠️ If a project is ever named longer than "Shastri Nagar",
                  re-measure — this is a ceiling that fits today's catalogue, not
                  a rule that fits every future name. It degrades to a wrap. */}
              {/* ⚠️ THE SIZE IS AN INLINE STYLE, for the same reason the burn's
                  width is: written as a `text-[...]` arbitrary value carrying that clamp
                  it crashed the postcss subprocess with a Windows stack
                  overflow on every build. A `clamp()` carrying an unparenthesised
                  sum is more than Tailwind's arbitrary-value parser will walk.
                  Same declaration, different parser. */}
              <h1
                className="mt-phi3 leading-[1.08] text-ink"
                style={{ fontSize: "clamp(2rem, 1rem + 2.6vw, 2.75rem)" }}
              >
                {p.title}
              </h1>
              <p className="mt-phi2 text-lg text-ink-muted">{locationLine(p)}</p>

              {/* 🚨 THE STATUS CARD — directly under the location, which is where
                  the report asked for it and where it belongs: price and
                  availability are facts ABOUT this address, and they used to sit
                  in a separate right-aligned column that read as unrelated
                  furniture.

                  Reported as "'Sold out' and 'Price on request' feel
                  disconnected from the property information… presented as plain
                  text… does not feel consistent with the premium design". The
                  old block was a bare `text-right` div: a ledger figure with a
                  grey sentence under it, floating opposite the title.

                  ⚠️ ONE STRUCTURE, THREE STATES. Mark, headline, supporting
                  lines — the content changes, the shape never does, which is the
                  report's "keep the same card structure across different
                  property statuses". `StatusCard` at the foot of this file holds
                  the three. Subtle tints and a hairline rather than decoration,
                  per the same brief. */}
              <div className="mt-phi3 max-w-md">
                <StatusCard p={p} />
              </div>
            </div>
          </header>

          {/* 🚨 THE BURN. The picture bleeds off the right edge of the WINDOW,
              not of the container, and dissolves into the blueprint grid on its
              left instead of ending on a border.

              The width is `100% + the container's right padding + whatever
              gutter the 1280 cap leaves` — `min(100vw,1280px)` handles both
              sides of that cap in one expression, and the section's own
              `overflow-hidden` absorbs the overhang and the scrollbar.

              ⚠️ `.rj-burn` fades the LEFT edge, which is the mirror of
              `hero-fade` and not the same utility — that one dissolves a
              picture that bleeds off the RIGHT of a paper hero, this one has to
              dissolve the edge that faces the copy. Solid from 30%, so 70% of
              the frame is at full strength: the owner's "make the images
              visible more than half".

              ⚠️ Brand imagery, and the rule binds on a PROPERTY page harder
              than anywhere: `alt=""`, `aria-hidden`, never a caption. These are
              landscapes of countryside, not of a plotted layout — no roads, no
              plot markers, no gate — which is exactly why they are safe here
              where a picture of a formed layout would not be. The project's own
              photography is in the Gallery immediately below, which is where a
              reader goes to see the actual land. */}
          {headerArt && (
            /* 🚨 THE HEIGHT IS THE WHOLE POINT — "can't see them properly"
                (owner, 2026-08-13). The box was 320px and the frames are not:
                measured at 1440, Udumalaipet is a 1.335:1 picture in a 2.08:1
                box, so `object-cover` was throwing away **36% of its height**.
                It was not merely small, it was cropped to a middle band, and
                the 4:3 frame suffered worst while the 2:1 ones barely noticed.

                At 666px of rendered width, showing that frame whole needs 499px
                of height. `clamp(24rem, 46vh, 30rem)` gives 384–480px — 480 at
                1080, 414 on a 900-tall window — which puts it at 96% of the
                height on the tightest frame and 100% on every other. The wide
                frames now crop horizontally instead, which costs nothing: they
                bleed off the window edge anyway.

                ⚠️ vh, not a fixed number, because this sits under a sticky
                header on a page whose next block is the stats bar — on a short
                laptop a hard 30rem would push that bar off the first screen.

                ⚠️ An INLINE STYLE, not a `min-h-` arbitrary value. One
                carrying a clamp with an unparenthesised sum takes the postcss
                subprocess down with a stack overflow; the h1 above is written
                the same way for the same reason. */
            <div
              className="relative hidden self-stretch xl:block"
              style={{ minHeight: "clamp(24rem, 46vh, 30rem)" }}
              aria-hidden="true"
            >
              {/* 🚨 A `<picture>` WITH A MEDIA-GATED SOURCE, AND IT IS THE ONLY
                  THING THAT ACTUALLY STOPS THE DOWNLOAD.

                  The wrapper is `hidden xl:block`, which is enough to stop the
                  picture RENDERING on a phone and not even slightly enough to
                  stop it being FETCHED — a `display: none` image is still
                  downloaded, which is the same trap `PageHero` records against
                  its own mobile band. Measured at 375 before this: the header
                  art was in the network log on a phone that could never show it,
                  90–140 KB spent on nothing.

                  So the real candidates live on a `<source>` gated at 1280 and
                  the `<img>` itself carries a 43-byte transparent GIF. Under
                  1280 the browser matches no source, falls back to that, and
                  fetches nothing over the network. `srcset` on the img would
                  defeat the whole arrangement — it must stay on the source. */}
              <picture>
                <source media="(min-width: 1280px)" srcSet={headerArt.srcSet} sizes="46vw" />
              <img
                src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7"
                alt=""
                decoding="async"
                fetchPriority="high"
                /* ⚠️ THE WIDTH IS AN INLINE STYLE, NOT A TAILWIND ARBITRARY
                   VALUE, and that is not a style preference. Written as
                   a `w-[...]` arbitrary value carrying that same calc it took
                   the postcss subprocess down with a Windows stack overflow
                   (exit 0xc00000fd) on every build — nested parens with a
                   `min()` inside a `calc()` is more than the arbitrary-value
                   parser will walk. The declaration is identical; only who
                   parses it changes. */
                /* 🚨 IT REACHES 6rem LEFT OF ITS OWN TRACK. "Make the burn more
                   left… show the picture a bit more, more than half" (owner,
                   2026-08-13). Measured before: the picture ran 766→1432 at
                   1440, which is 47% of the page — just under half, and the eye
                   reads just-under-half as a panel rather than as a picture the
                   page is standing on.

                   Pulling it 5rem left takes it to 52% at 1440 and 54% at
                   1600 — over half, which is what was asked, and no further.

                   ⚠️ 5rem AND NOT 6rem, AND THE 1rem IS A CONTRAST DECISION.
                   At 6rem the longest title on the site ("Jamin Garden — Shastri
                   Nagar") ended 34px inside the dissolve and the LOCATION line
                   under it ended inside it too. The title never cared — 11.9:1
                   even against the darkest thing a photo could put there — but
                   the location is `ink-muted`, which is only 4.95:1 on bare
                   canvas to begin with, and the wash took it to 4.83. That
                   clears AA and has no margin left in a model that is a
                   comparison rather than an audit. At 5rem the same line ends
                   about 10px inside a 4% wash and the question stops existing.

                   ⚠️ It works only because the copy is raised above it — see
                   the `z-10` on the header. Without that the picture is the
                   later grid item and paints OVER the words. */
                /* ⚠️ `objectPosition` rides here with the width, and for the
                   same reason: an inline style, never a Tailwind arbitrary
                   value. Undefined when the picture has no `focus`, which
                   leaves the CSS default of `50% 50%` — so adding the field to
                   one entry cannot move the other three. */
                style={{
                  left: "-5rem",
                  width: "calc(100% + 5rem + 2.5rem + (100vw - min(100vw, 1280px)) / 2)",
                  objectPosition: headerArt.focus,
                }}
                className="rj-burn absolute inset-y-0 h-full max-w-none object-cover"
              />
              </picture>
            </div>
          )}
          </div>

          {/* The facts of record, as a document header. Renders only the fields
              that exist — see the component. */}
          <div className="mt-phi4 -mx-phi3 pb-phi4 lg:-mx-phi4">
            <ApprovalStrip p={p} />
          </div>

          <div className="mt-phi4">
            <Gallery images={images} title={p.title} />
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-5 pb-phi4 lg:px-10">

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
              className="rj-sheet"
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
              {/* ⚠️ ONE COMPONENT FOR BOTH VIEWS since 2026-08-13. This used to
                  choose for the reader — drawing where the plan was traced,
                  block grid where it was not — and the owner asked for the
                  choice to be theirs. `LayoutViews` shows the switch only where
                  there is genuinely a second view, so an untraced project still
                  renders exactly one thing and no dead control. */}
              <LayoutViews plots={plots} plan={hasGeometry ? p.plot_plan : null} title={p.title} />

              {p.master_plan_url && (
                <a
                  href={p.master_plan_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-phi3 inline-block text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep"
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
                    {/* A drawn mark instead of a dot. `leaf` is the set's mark
                        for planting and open space, which is what an amenity on
                        a plotted layout is; the services list below takes
                        `junction`, the mark for a formed road meeting another.
                        Both are `aria-hidden` — the words carry the meaning. */}
                    <SurveyIcon
                      name="leaf"
                      size="h-4 w-4"
                      className="mt-0.5 shrink-0 text-jamin-gold-ink"
                    />
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
                    <SurveyIcon name="junction" size="h-4 w-4" className="mt-0.5 shrink-0 text-canopy" />
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
                  <ul className="mt-phi2 grid gap-2 sm:grid-cols-2">
                    {nearby.map((n, i) => (
                      /* ⚠️ min-w-0 on the grid ITEM, not just on the text
                         inside it. A grid item's default `min-width: auto` is
                         its content's minimum, so the longest place name set
                         this list's min-content to 373px and pushed the whole
                         page 18px wider than the phone. `truncate` on a child
                         cannot save you from that. */
                      <li
                        key={i}
                        className="flex min-w-0 items-center justify-between gap-3 rounded-card border border-line bg-canvas px-phi2 py-2.5"
                      >
                        <div className="min-w-0">
                          <div className="truncate text-base text-ink">{n.name}</div>
                          {n.category && (
                            <div className="truncate text-tiny text-ink-faint">{n.category}</div>
                          )}
                        </div>
                        {n.distance && (
                          <span className="shrink-0 rounded-full bg-canopy-soft px-2.5 py-1 text-tiny font-medium text-canopy">
                            {n.distance}
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </Block>
          ) : null}

          {/* ---- legal & documents (§15, §78) ---- */}
          {(legal.length > 0 || downloads.length > 0 || p.rera_number) && (
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

              {/* Brochure, sanctioned plan and every document, downloadable
                  straight from here — no form, no sign-in, and no promoter's
                  contact page stapled to the file. */}
              {downloads.length > 0 && (
                <div className="mt-phi3">
                  <DownloadList items={downloads} />
                  <p className="mt-phi2 text-tiny text-ink-faint">
                    Free to download — no details required.{" "}
                    <Link href="/downloads" className="underline">
                      Every development&rsquo;s papers
                    </Link>
                    .
                  </p>
                </div>
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
                    /* ⚠️ A fixed box, not `w-full` alone. Left to itself a
                       <video> sizes to its own intrinsic ratio, so two clips
                       shot differently sat side by side at different heights
                       with their tops and bottoms out of line — which is what
                       was reported. The box is the same 1.618:1 the card grid
                       uses, and `object-contain` gives equal heights WITHOUT
                       cropping the walkthrough; `bg-ink` letterboxes the
                       remainder, so a portrait clip reads as deliberate. */
                    className="aspect-[1.618/1] w-full rounded-card border border-line bg-ink object-contain"
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
              {/* Straight to the booking on this page, not off to /contact where
                  the project they were reading gets lost.
                  ⚠️ A sold-out development gets no booking control at all. There
                  is nothing to walk somebody around and nothing they could buy
                  at the end of it, so the offer would be a waste of their
                  Saturday. `website_book_visit` refuses it server-side too. */}
              {sellable ? (
                <a
                  href="#visit"
                  className="block rounded-full bg-jamin-red px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
                >
                  Book a site visit
                </a>
              ) : (
                <Link
                  href="/properties"
                  className="block rounded-full bg-jamin-red px-5 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
                >
                  See what is selling
                </Link>
              )}

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
                className="mt-phi3 block border-t border-line pt-phi2 text-tiny font-medium text-jamin-red-deep hover:opacity-70"
              >
                Take the 360° tour →
              </a>
            )}
          </div>
        </aside>
      </div>

      {/* §39 — the conversion block sits after the read, where somebody who has
          just gone through the plan and the approvals is most interested.

          ⚠️ Which block appears is decided by `sellable`, and the two are
          mutually exclusive. Offering an enquiry form on a development that is
          sold out generates a lead the desk can only disappoint; the honest
          answer is to say so and point at the stock that is still selling. */}
      {sellable ? (
        <>
          <section
            id="visit"
            className="mt-phi6 scroll-mt-28 rounded-xl border border-line bg-canvas p-phi4 shadow-lift lg:p-phi5"
          >
            <div className="max-w-xl">
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
                No obligation
              </span>
              <h2 className="mt-phi2 text-2xl text-ink">Walk {p.title} yourself</h2>
              <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
                Stand on the plot, see the roads and the approvals, and ask everything at once. Pick
                a day and a time and you will have a reference straight away.
              </p>
            </div>
            <div className="mt-phi4 grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
              <VisitBooking
                properties={[]}
                fixedProperty={{ id: p.id, title: p.title, place: locationLine(p) }}
              />
              <div className="lg:border-l lg:border-line lg:pl-phi4">
                <h3 className="text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
                  Rather just ask?
                </h3>
                <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
                  Plot availability, the current rate, or anything in the documents.
                </p>
                <div className="mt-phi3">
                  <EnquiryForm propertyId={p.id} propertyTitle={p.title} compact />
                </div>
                <h3 className="mt-phi4 border-t border-line pt-phi3 text-tiny font-semibold uppercase tracking-[0.16em] text-ink">
                  Or reach us now
                </h3>
                <div className="mt-phi2">
                  <DeskActions context={p.title} url={`${SITE_URL}${propertyHref(p)}`} />
                </div>
              </div>
            </div>
          </section>
        </>
      ) : (
        <section
          id="enquire"
          className="mt-phi6 scroll-mt-28 overflow-hidden rounded-xl border border-line bg-charcoal"
        >
          <div className="p-phi4 lg:p-phi5">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-micro font-semibold uppercase tracking-[0.14em] text-white/80">
              {p.status === "sold" ? "Fully sold" : String(p.status)}
            </span>
            {/* ⚠️ NO `max-w-2xl` ON EITHER OF THESE — owner's call, 2026-08-14:
                the heading and the paragraph run the full width of the band and
                the buttons centre under them. Both carried a 42rem cap before,
                which is the measure the rest of the site sets its prose to, so
                if a future round asks for "the text is too wide to read" this
                is the line that changed and `max-w-2xl` is what it was. */}
            <h2 className="mt-phi3 text-2xl text-white">
              {p.title} has sold out.
            </h2>
            <p className="mt-phi3 text-base leading-relaxed text-white/75">
              Every plot here is gone, so there is nothing for us to show you on site and no
              enquiry worth taking. We have left the layout, the approvals and the documents on
              this page because they are the clearest picture of how a Jamin development is
              planned — and the next one is planned the same way.
            </p>
            {/* ⚠️ A GRID, NOT `flex flex-wrap`. Reported as "both buttons
                appear small and centered… excessive empty space on both sides…
                the CTAs do not feel like primary actions", and the cause was
                that content-sized pills in a wrap container take exactly as much
                room as their labels — "See what is selling" is 22 characters, so
                on a phone it made a button about two thirds of the card wide
                with nothing beside it.

                One column, `max-w-2xl` so the pair lines up with the heading and
                the paragraph above rather than stretching to a 1200px slab on a
                desktop, and `w-full` + `text-center` inside each cell so both
                are the same width, the same height and the same radius, with the
                label optically centred. Colours and radius are untouched, which
                the report asked for explicitly.

                ⚠️ `auto-rows-fr` + `h-full` is what makes the two the same
                HEIGHT, and it is not cosmetic. At 375 the card's inner box is
                267px and "Tell us what you are after" wraps to two lines while
                "See what is selling" does not — measured 47px against 67px, so
                full-width alone left them visibly mismatched. Equal-fraction
                rows give both cells the taller one's height, and the inner flex
                centres each label in the space, which is the report's "center
                the button text horizontally and vertically". */}
            {/* ⚠️ `mx-auto` CENTRES THE PAIR, AND IT IS NOT THE BUG THE NOTE
                ABOVE DESCRIBES. That report was about buttons that were small
                AND centred — content-sized pills whose width was their label,
                which is what made them stop reading as primary actions. The
                width fix is the part that mattered and it stays: each control
                is still `w-full` inside a 42rem block, so the pair is 672px
                wide whatever the card does. Only the block's horizontal
                position moved, owner's call 2026-08-14. Centring alone cannot
                bring the old symptom back; dropping `w-full` or `max-w-2xl`
                would. */}
            <div className="mt-phi4 grid max-w-2xl auto-rows-fr gap-3 mx-auto">
              <Link
                href="/properties"
                className="flex h-full w-full items-center justify-center rounded-full bg-white px-6 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-all duration-500 hover:-translate-y-0.5 hover:bg-canvas"
              >
                See what is selling
              </Link>
              <Link
                href="/contact"
                className="glass-dark flex h-full w-full items-center justify-center rounded-full px-6 py-3.5 text-center text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-500 hover:-translate-y-0.5"
              >
                Tell us what you are after
              </Link>
            </div>
          </div>
        </section>
      )}

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
      </div>
    </article>
  );
}

/**
 * 🚨 THE HEADER ART, ONE PICTURE PER PROJECT, KEYED BY SLUG.
 *
 * Owner-supplied 2026-08-13, one for each of the four developments, and the
 * files arrived named for their destination — Edappadi, Varapatti, Udumalaipet,
 * Shastri Nagar — so the mapping is his rather than mine.
 *
 * ⚠️ KEYED BY SLUG **AND** BY ID, because one property has no slug. Udumalaipet
 * is served at a raw UUID (its `slug` column is null, which is a content gap
 * recorded in the project notes), so a slug-only map would have silently left
 * that page — the only sold-out one — as the odd page without a picture.
 *
 * ⚠️ A MISS IS A NORMAL OUTCOME, not a bug. A fifth development added tomorrow
 * gets no header art and the header falls back to full-width copy, which is
 * exactly what every property looked like the day before this shipped. The
 * alternative — reusing another project's picture — would put a photograph of
 * one place at the top of another, which is the one thing this page must not do.
 *
 * ⚠️ Brand imagery under the standing rule: these are landscapes of countryside,
 * not photographs of these developments. `alt=""`, `aria-hidden`, and never a
 * caption, a location or a project name. See the note at the render site for
 * why a countryside frame is defensible here where a formed layout would not be.
 */
/**
 * 🚨 `focus` IS PER-PICTURE BECAUSE THE CROP IS PER-PICTURE. One global anchor
 * cannot serve this set: the frames run 1.333 to 2.058, and the box they sit in
 * is wider than all of them, so each loses a different share of its height and
 * loses it from a different part of the composition.
 *
 * Measured live at 2000x860, where the box is 1026x396 = **2.594:1**:
 *
 *   udumalaipet        1.333  only 51.4% of the height survives  <- the problem
 *   jamin-new-project  1.874  72.2%
 *   varapatty          2.000  77.1%
 *   shastri-nagar      2.058  79.3%
 *
 * ⚠️ The note on the height further up claims "96% of the height on the
 * tightest frame". That was true where it was measured — 1440 wide, 1080 tall,
 * a 666px box. It does NOT hold on a wide short window: the width grows with
 * the viewport while the height is capped by `clamp(24rem, 46vh, 30rem)`, so
 * the box gets both wider and shorter and Udumalaipet drops to barely half.
 * Re-measure before trusting either number.
 *
 * ⚠️ ONLY UDUMALAIPET IS SHIFTED. Owner asked to see more of the bottom of that
 * picture (2026-08-14) — at centre the banana canopy and the roof take the frame
 * and the tea stall it is actually about is cut off at the bottom edge. All four
 * anchors were rendered against all four frames before choosing: 80% puts the
 * road curve, the seated men and the whole stall in shot. The other three are
 * left at the default deliberately — the same 80% costs the new-project frame
 * its clouds and mountains and Varapatty its hills, and none of them was what
 * was reported. A per-picture value is the only thing that can be right for all
 * four; re-render that sweep before adding another.
 */
const HEADER_ART: Record<string, { file: string; widths: number[]; focus?: string }> = {
  /* ⚠️ `edappadi-2`, owner-supplied 2026-08-14, replacing the paddy-field frame.
     A new filename rather than an overwrite, for the reason on Udumalaipet
     below: `next/image` keys its optimised output by source path.

     ⚠️ IT IS MUCH DARKER THAN WHAT IT REPLACES, and that is the thing to watch
     on this page rather than the crop. The header art dissolves leftward into
     the canvas under `rj-burn`, and the LOCATION line ends inside that wash —
     `ink-muted` is only 4.95:1 on bare ivory to begin with, and the note on the
     -5rem offset records it falling to 4.83 under the old, brighter picture. A
     forest road in rain is darker at every pixel, so this was re-measured after
     the swap rather than assumed. */
  /* ⚠️ `edappadi-3`, 2026-08-14, replacing `edappadi-2` the same evening — the
     banyan and the paddy valley, where that was the misty forest road. Third
     filename rather than a third overwrite, for the `next/image` reason below.
     It is also BRIGHTER than the frame it replaces, which reverses the concern
     recorded on -2: the copy is clear of the picture at 1440 either way, and a
     bright frame only helps the dark ink beside it. */
  "jamin-new-project-jul-2026": { file: "edappadi-3", widths: [960, 1440, 1672] },
  "jamin-garden-varapatty": { file: "jamin-garden-varapatty", widths: [960, 1440, 1774] },
  "jamin-garden-shastri-nagar-erode": {
    file: "jamin-garden-shastri-nagar-erode",
    widths: [960, 1440, 1799],
  },
  /* No slug in the database — this is the id the URL actually uses.
     ⚠️ `udumalaipet-2`, owner-supplied 2026-08-14, replacing `udumalaipet`.
     A NEW FILENAME rather than an overwrite: `next/image` keys its optimised
     output by source path, so writing over the old file lets a warm build keep
     serving the old picture from a deploy that looks correct. The previous
     renditions stay in the folder, unused.

     ⚠️ AND ITS `focus` WENT WITH IT. The old frame was 1440x1080 — 1.333 — and
     needed `50% 80%` to stop the tea stall being cut off the bottom. This one
     is 1672x941, **1.777**, so the same box crops far less of it: 85% of the
     height survives at 1440 and 68% at a 2000-wide window, against 51% before.
     Rendered top / 30% / centre / 80% at the widest case before dropping it —
     at 80% the JAMIN BAZAAR arrow is jammed against the top edge with no
     margin, and at centre it has headroom while the road curve and the stall
     both still read. Centre is the default, so the override is gone rather than
     set to 50%. */
  "c0e9c29e-8865-45ba-b852-1ab993fb1664": {
    file: "udumalaipet-2",
    widths: [960, 1440, 1672],
  },
};

function headerArtFor(
  p: PropertyDetail,
): { src: string; srcSet: string; focus?: string } | null {
  const art = (p.slug && HEADER_ART[p.slug]) || HEADER_ART[p.id];
  if (!art) return null;
  const url = (w: number) => `/property/header/${art.file}-${w}.webp`;
  return {
    src: url(art.widths[art.widths.length - 1]),
    srcSet: art.widths.map((w) => `${url(w)} ${w}w`).join(", "),
    focus: art.focus,
  };
}

/**
 * The status card that sits under the location line.
 *
 * ⚠️ ONE SHAPE, THREE STATES — mark, headline, supporting lines. The report
 * asked for "the same card structure across different property statuses while
 * changing the content accordingly", and that is worth holding to for a reason
 * beyond consistency: a reader who has looked at one Jamin property should be
 * able to find the price on the next one without reading, and a card that
 * changes shape with its meaning defeats that.
 *
 * ⚠️ IT INVENTS NOTHING. The three states are exactly the three `formatPrice`
 * already distinguishes, and where there is no published rate the card says so
 * and points at the desk — the standing rule on this site is that it would
 * rather say "not published yet" than quote a number it cannot stand behind.
 *
 * ⚠️ Tints, not decoration: `jamin-red-soft` for sold out (an end state),
 * `jamin-gold-soft` for a rate that has to be asked for, `canopy-soft` where a
 * real figure is published. All three are existing tokens with audited ink
 * partners — do not reach for a colour this site does not already own.
 */
function StatusCard({ p }: { p: Property }) {
  const priced = p.price != null && Number(p.price) > 0;
  const selling = isSellable(p);

  const state = !selling
    ? {
        icon: "stamp" as const,
        tone: "border-jamin-red/25 bg-jamin-red-soft",
        markTone: "bg-white/70 text-jamin-red-deep",
        title: p.status === "sold" ? "Sold out" : "Not for sale",
        lines: [
          "Every plot here has been handed over.",
          "The layout, the approvals and the documents stay on this page.",
        ],
      }
    : priced
      ? {
          icon: "ledger" as const,
          tone: "border-canopy/25 bg-canopy-soft",
          markTone: "bg-white/70 text-canopy",
          title: formatPrice(p),
          lines: [
            "The published rate for this development.",
            "Confirmed by our sales desk at the time of booking.",
          ],
        }
      : {
          icon: "deed" as const,
          tone: "border-jamin-gold/30 bg-jamin-gold-soft",
          markTone: "bg-white/70 text-jamin-gold-ink",
          title: "Price on request",
          lines: [
            "Current pricing is available through our sales desk.",
            "Contact us for the latest rate and availability.",
          ],
        };

  return (
    <div className={`flex items-start gap-phi3 rounded-card border p-phi3 ${state.tone}`}>
      <span
        aria-hidden="true"
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-card ${state.markTone}`}
      >
        <SurveyIcon name={state.icon} className="h-[22px] w-[22px]" />
      </span>
      {/* ⚠️ `min-w-0` — a flex item's default minimum is its content, and the
          second line is long enough to push this card past its column. */}
      <div className="min-w-0">
        <p className="ledger text-xl leading-none text-ink">{state.title}</p>
        {state.lines.map((l) => (
          <p key={l} className="mt-1.5 text-tiny leading-relaxed text-ink-muted">
            {l}
          </p>
        ))}
      </div>
    </div>
  );
}
