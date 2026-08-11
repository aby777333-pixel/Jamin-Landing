import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container } from "@/components/ui";
import { VaultPlate } from "@/components/vault/VaultPlate";
import {
  getVaultListing,
  getVaultListings,
  publicPlace,
  publicTitle,
  vaultListingHref,
  verificationBadge,
} from "@/lib/vault";

export const revalidate = 3600;

/**
 * §13 — A PRIVATE DOSSIER, NOT A PORTAL CARD.
 *
 * One column, large photographs, editorial type, and the story before the
 * specification. Everything a portal puts in a sidebar of chips is either
 * further down or absent.
 *
 * ⚠️ A DISCREET LISTING PUBLISHES ITS EXISTENCE AND NOTHING ELSE. §13: "Private
 * Estate — South India. Full details available upon qualified enquiry." The
 * masking is not done here — `publicTitle()` and `publicPlace()` in lib/vault
 * are the single choke point, so a future rail or card cannot leak a locality
 * because it forgot. What this page adds is the discipline of not rendering the
 * story, the amenities, the map or the gallery at all when `discreet` is set:
 * a masked title above a full description would be theatre.
 *
 * ⚠️ NO STATIC PARAMS ARE PRE-BUILT. `vault_listings` is empty today, and
 * `generateStaticParams` returning an empty array is correct — the route then
 * renders on demand and caches. Do not add `dynamicParams: false`, which would
 * 404 every listing added after a deploy.
 */

export async function generateStaticParams() {
  try {
    const all = await getVaultListings();
    return all.filter((l) => l.slug).map((l) => ({ slug: l.slug as string }));
  } catch {
    return [];
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const l = await getVaultListing(slug).catch(() => null);
  if (!l) return { title: "The Vault — Jamin Bazaar" };

  const title = publicTitle(l);
  const place = publicPlace(l);
  return {
    title: `${title}${place ? ` — ${place}` : ""} | The Vault`,
    description: l.discreet
      ? "A property held privately in The Vault. Full details available upon qualified enquiry."
      : (l.headline ?? l.summary ?? undefined),
    alternates: { canonical: vaultListingHref(l) },
    // A discreet listing must not be summarised in a search result either.
    robots: l.discreet ? { index: false, follow: false } : undefined,
  };
}

export default async function VaultListingPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const l = await getVaultListing(slug);
  if (!l) notFound();

  const title = publicTitle(l);
  const place = publicPlace(l);
  const badge = verificationBadge(l.stage);
  const gallery = l.discreet ? [] : (l.images ?? []);

  /* Specification lines, built only from what is actually recorded. A dossier
     that prints "Bedrooms —" is a form, not a document. */
  const facts: [string, string][] = [];
  if (!l.discreet) {
    if (l.land_area) facts.push(["Land", l.land_area]);
    if (l.built_area) facts.push(["Built", l.built_area]);
    if (l.bedrooms != null) facts.push(["Bedrooms", String(l.bedrooms)]);
    if (place) facts.push(["Where", place]);
  }
  facts.push([
    "Terms",
    l.intent === "rent" ? "For rent" : l.intent === "both" ? "Sale or rent" : "For sale",
  ]);
  facts.push(["Price", l.price_on_request || !l.price_display ? "On request" : l.price_display]);

  return (
    <>
      <section className="relative isolate flex min-h-[clamp(22rem,58vh,34rem)] items-end overflow-hidden bg-onyx-900">
        <VaultPlate
          src={gallery[0]}
          seed={l.slug ?? l.id}
          alt=""
          priority
          sizes="100vw"
          className="opacity-90"
        />
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(10,10,9,0.92) 0%, rgba(10,10,9,0.5) 40%, rgba(10,10,9,0.08) 78%)",
          }}
          aria-hidden="true"
        />
        <Container className="relative py-phi5">
          <Link
            href="/vault"
            className="text-tiny font-semibold uppercase tracking-[0.12em] text-white/70 transition-colors hover:text-champagne-300"
          >
            ← The Vault
          </Link>
          {badge ? (
            <p className="rj-eyebrow mt-phi3" style={{ color: "var(--color-champagne-300)" }}>
              {badge}
            </p>
          ) : null}
          <h1 className="mt-phi2 text-balance text-3xl text-white lg:text-5xl">{title}</h1>
          {place ? <p className="mt-phi2 text-xl text-white/80">{place}</p> : null}
        </Container>
      </section>

      <Container className="py-phi6">
        <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
          <div className="max-w-2xl">
            {l.discreet ? (
              <>
                <p className="text-xl leading-relaxed text-ink-soft">
                  This property is held privately. Its address, its photographs and its papers are
                  released to a qualified enquiry, not to a page.
                </p>
                <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                  Tell the desk what you are looking for. If this is it, you will be told; if it is
                  not, you will be told that too.
                </p>
              </>
            ) : (
              <>
                {l.headline ? (
                  <p className="rj-voice text-xl leading-relaxed text-ink-soft">{l.headline}</p>
                ) : null}
                {l.summary ? (
                  <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">{l.summary}</p>
                ) : null}
                {l.story
                  ? l.story
                      .split(/\n{2,}/)
                      .filter(Boolean)
                      .map((para, i) => (
                        <p key={i} className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                          {para}
                        </p>
                      ))
                  : null}
              </>
            )}

            {l.amenities?.length && !l.discreet ? (
              <>
                <div className="rj-fret my-phi5 max-w-xs" aria-hidden="true" />
                <h2 className="text-lg text-ink">On the property</h2>
                <ul className="mt-phi3 grid gap-2 sm:grid-cols-2">
                  {l.amenities.map((a) => (
                    <li key={a} className="border-t border-line pt-2 text-base text-ink-muted">
                      {a}
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>

          <aside className="lg:sticky lg:self-start" style={{ top: "calc(var(--header-h) + 1.25rem)" }}>
            <div className="rounded-xl border border-champagne-500/35 bg-canvas-alt p-phi4">
              <dl>
                {facts.map(([k, v]) => (
                  <div key={k} className="flex items-baseline justify-between gap-4 border-t border-line py-2 first:border-t-0 first:pt-0">
                    <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">{k}</dt>
                    <dd className="ledger text-base text-ink">{v}</dd>
                  </div>
                ))}
              </dl>

              <Link
                href="/vault/request"
                className="mt-phi4 inline-flex w-full justify-center rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep"
              >
                {l.discreet ? "Request private access" : "Request a viewing"}
              </Link>
              <Link
                href="/vault/request"
                className="mt-phi2 inline-flex w-full justify-center rounded-full border border-champagne-300 px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-champagne-300 transition-colors hover:bg-white/5"
              >
                Request the private dossier
              </Link>

              {/* Only offered where the owner has authorised it. A brochure link
                  on a discreet listing would undo the discretion in one click. */}
              {l.brochure_url && !l.discreet ? (
                <a
                  href={l.brochure_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-phi2 inline-flex w-full justify-center rounded-full border border-line px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-champagne-500"
                >
                  Brochure
                </a>
              ) : null}

              <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
                Information is provided by the owner and presented for discussion. Eligibility,
                land-use and transaction rules are established for the specific property before
                anything is committed.
              </p>
            </div>
          </aside>
        </div>

        {gallery.length > 1 ? (
          <ul className="mt-phi6 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
            {gallery.slice(1).map((src, i) => (
              <li key={src} className="relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-canvas-sunken">
                <VaultPlate
                  src={src}
                  seed={`${l.slug ?? l.id}-${i}`}
                  alt=""
                  sizes="(min-width: 1024px) 33vw, 100vw"
                />
              </li>
            ))}
          </ul>
        ) : null}
      </Container>
    </>
  );
}
