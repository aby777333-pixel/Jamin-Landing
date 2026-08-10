import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { GoldDust } from "@/components/GoldDust";
import { PropertyCard } from "@/components/PropertyCard";
import { VaultTheme } from "@/components/VaultTheme";
import { getProperties, isSellable } from "@/lib/properties";
import { getTier, TIERS } from "@/lib/tiers";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Royal Vault — Exceptional Properties, Quietly Presented",
  description:
    "The Jamin Royal Vault: developments held to the Royal and Crown Collection standard, presented on request.",
  alternates: { canonical: "/vault" },
};

/**
 * THE ROYAL VAULT (§6.6).
 *
 * ⚠️ ITS SIX CATEGORIES MATCH ZERO ROWS, and that was known before it was
 * built — every property in the database is `residential_plot`, so Private
 * Estates, Beachfront, Heritage, Luxury Villas and Rare Listings have nothing
 * behind them and Investment Land has everything. The owner asked for it as
 * specified after the cost was put to him twice, so it is built as specified.
 *
 * ⚠️ What it is NOT allowed to be is a page of six dead ends. SiteHeader.tsx
 * records the standing rule — the nav was rebuilt from live facets precisely
 * because three menu items once pointed at pages that did not exist. So the
 * Vault leads with the inventory that genuinely earns the name (Royal and
 * Crown by lib/tiers) and presents the six as a register of what it will hold,
 * each routing to the desk rather than to an empty grid. The page is never
 * blank on arrival.
 */
const COLLECTIONS = [
  { key: "private-estates", label: "Private Estates", note: "Whole-parcel holdings, sold entire." },
  { key: "beachfront", label: "Beachfront", note: "Coastal land with clear title." },
  { key: "heritage", label: "Heritage", note: "Land with a history worth keeping." },
  { key: "luxury-villas", label: "Luxury Villas", note: "Built, finished and ready to occupy." },
  { key: "investment-land", label: "Investment Land", note: "Held for appreciation, not for building." },
  { key: "rare-listings", label: "Rare Listings", note: "Released to enquiry only." },
];

export default async function VaultPage() {
  const all = await getProperties();
  /* Royal and Crown are the two rungs that mean "approved, published and
     checkable" — see lib/tiers. That is the honest definition of exceptional
     on a site with no prices. */
  const held = all
    .filter((p) => getTier(p).rank >= TIERS.royal.rank)
    .sort((a, b) => getTier(b).rank - getTier(a).rank);

  return (
    <>
      <VaultTheme />

      {/* hero-24 — the village at dusk, supplied 2026-08-10.
          ⚠️ Brand imagery, never a Jamin project: a generic Tamil street with a
          gopuram behind it, carrying no Jamin mark and no identifiable site. It
          stays `alt=""` and `aria-hidden` and must never gain a caption, a
          location or a project name. See public/hero/README.md.
          ⚠️ Picture PLUS PLATE, not a scrim — the treatment the whole site moved
          to on 2026-08-09. The frame is golden hour and its left third, exactly
          where the copy sits, is the brightest part of it (sky through palms,
          then a sunlit road), so bare type would have had nothing to sit on. */}
      <section className="relative isolate overflow-hidden bg-onyx-900">
        <Image
          src="/hero/hero-24-1914.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />

        {/* The only particles on the site. Over the picture, so they read as
            late light in the air rather than as dust on a black panel. */}
        <GoldDust />

        <Container className="relative py-phi7">
          <div className="gilt rj-gilt-sheer max-w-2xl rounded-2xl p-phi3 sm:p-phi4">
            <p className="rj-eyebrow" style={{ color: "var(--color-champagne-50)" }}>
              By appointment
            </p>
            <h1 className="mt-phi3 text-balance text-4xl text-white">The Royal Vault</h1>
            <p className="rj-voice mt-phi3 text-xl text-white">
              Exceptional properties, quietly presented.
            </p>

            {/* ⚠️ §6.6 puts "price on request" in gold foil, and foil text only
                works on a dark ground — the seal ramp measures 12.3:1 on onyx
                and 1.57:1 on ivory. The plate is what keeps it dark here, which
                is the same reason the line lives in this band rather than beside
                the collections on the canvas below. No rupee glyph, per the
                brief. */}
            <p className="mt-phi4 text-base text-white">
              Rates are <span className="font-medium" style={{ color: "var(--color-champagne-50)" }}>
                price on request
              </span>. Nothing
              in the Vault carries a published figure.
            </p>

            <div className="rj-fret mt-phi4 max-w-xs" aria-hidden="true" />
          </div>
        </Container>
      </section>

      <Container className="py-phi6">
        {held.length > 0 ? (
          <>
            <h2 className="text-2xl text-ink">Held in the Vault</h2>
            <p className="mt-phi2 max-w-2xl text-base text-ink-muted">
              {held.length} development{held.length === 1 ? "" : "s"} currently meet the standard:
              sanctioned, published, and checkable against the DTCP file before you visit.
            </p>
            <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
              {held.map((p) => (
                <div key={p.id} className="relative flex">
                  <PropertyCard p={p} />
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className="max-w-2xl text-base text-ink-muted">
            Nothing is held in the Vault today. The desk will tell you the moment something is.
          </p>
        )}

        <div className="rj-fret my-phi6" aria-hidden="true" />

        <h2 className="text-2xl text-ink">The collections</h2>
        <p className="mt-phi2 max-w-2xl text-base text-ink-muted">
          What the Vault is built to hold. Jamin sells sanctioned residential plots today, so most
          of these are not open — where that is true it says so, rather than showing an empty page.
        </p>

        <ul className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTIONS.map((c) => {
            /* Counted from the real records, never asserted. Today this is
               zero for five of the six and every card says so. */
            const count = c.key === "investment-land" ? all.filter(isSellable).length : 0;
            return (
              <li key={c.key}>
                <div className="flex h-full flex-col rounded-xl border border-line p-phi3">
                  {/* A champagne hairline above each, which is the Select rung's
                      treatment — the quietest thing the tier ladder owns. */}
                  <div className="rj-tier-rule mb-phi2" aria-hidden="true" />
                  <h3 className="text-lg text-ink">{c.label}</h3>
                  <p className="mt-phi2 flex-1 text-base text-ink-muted">{c.note}</p>
                  {count > 0 ? (
                    <Link
                      href="/properties"
                      className="mt-phi3 text-tiny font-semibold uppercase tracking-[0.12em] text-cta-deep"
                    >
                      {count} available →
                    </Link>
                  ) : (
                    <p className="mt-phi3 text-tiny text-ink-faint">
                      Not open.{" "}
                      <Link href="/contact" className="text-cta-deep underline underline-offset-4">
                        Register interest
                      </Link>
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ul>

      </Container>
    </>
  );
}
