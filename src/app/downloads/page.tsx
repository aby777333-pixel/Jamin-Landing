import type { Metadata } from "next";
import Link from "next/link";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { DownloadList, downloadsFor } from "@/components/Downloads";
import { CallbackBand } from "@/components/CallbackBand";
import { getProperties, getProperty, isSellable, locationLine, propertyHref } from "@/lib/properties";
import { SITE_URL } from "@/lib/supabase";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Brochures & Approved Plans",
  description:
    "Download the brochure, the sanctioned DTCP layout plan and the approval documents for every Jamin development. No form, no sign-in, no agent attached.",
  alternates: { canonical: "/downloads" },
};

/**
 * §78 — the paperwork, freely available.
 *
 * ⚠️ Nothing here is gated. No form, no OTP, no promoter card. A buyer doing
 * their homework on a layout should not have to hand over a phone number to
 * read the approval it was sold on, and a brochure that arrives with a
 * stranger's contact page stapled to it is not a neutral document.
 */
export default async function DownloadsPage() {
  const all = await getProperties();
  // The list page carries only summaries, so each development is fetched in
  // full — `documents`, `brochure_url` and `master_plan_url` are detail fields.
  const details = await Promise.all(all.map((p) => getProperty(p.slug || p.id)));

  const groups = details
    .filter((p): p is NonNullable<typeof p> => !!p)
    .map((p) => ({ p, items: downloadsFor(p) }))
    .filter((g) => g.items.length > 0)
    // Selling developments first — that is what somebody is downloading for.
    .sort((a, b) => Number(isSellable(b.p)) - Number(isSellable(a.p)));

  const total = groups.reduce((n, g) => n + g.items.length, 0);

  return (
    <>
      <PageHero
        /* hero-68 — JAMIN IMPERIAL ("Imperiel.png", owner-named 2026-08-17),
           replacing the hero-7 skyline render. */
        art={68}
        eyebrow="Brochures & plans"
        title="Read the paperwork before you talk to anyone."
        lead="Every brochure, sanctioned layout plan and approval document we publish, in one place. No form to fill in, no sign-in, and no agent's card attached to the file."
        meta={
          total > 0
            ? `${total} document${total === 1 ? "" : "s"} across ${groups.length} development${
                groups.length === 1 ? "" : "s"
              }`
            : undefined
        }
      />

      <Container className="py-phi5">
        {groups.length === 0 ? (
          <EmptyState
            title="Nothing published yet"
            body="Brochures and sanctioned plans appear here as soon as they are published from the Jamin admin console."
            action={<ButtonLink href="/properties">Browse properties</ButtonLink>}
          />
        ) : (
          <>
            <h2 className="sr-only">Downloads by development</h2>
            <div className="space-y-phi5">
              {groups.map(({ p, items }) => (
                <section key={p.id}>
                  <span className="mb-phi2 block h-px w-12 rule-gold" aria-hidden="true" />
                  <div className="flex flex-wrap items-baseline justify-between gap-3">
                    <div>
                      <h3 className="text-2xl text-ink">{p.title}</h3>
                      <p className="mt-1 text-base text-ink-muted">{locationLine(p)}</p>
                    </div>
                    <Link
                      href={propertyHref(p)}
                      className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep transition-opacity hover:opacity-70"
                    >
                      Open the project →
                    </Link>
                  </div>
                  <div className="mt-phi3">
                    <DownloadList items={items} />
                  </div>
                </section>
              ))}
            </div>

            <p className="mt-phi6 border-t border-line pt-phi3 text-tiny leading-relaxed text-ink-faint">
              Documents are published as recorded in the sanctioned papers. Verify the current
              position with the issuing authority before you commit to a purchase. If something you
              need is missing,{" "}
              <Link href="/contact" className="underline">
                ask the desk
              </Link>{" "}
              and we will send it.
            </p>
          </>
        )}
      </Container>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            itemListElement: [
              { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
              { "@type": "ListItem", position: 2, name: "Brochures & plans", item: `${SITE_URL}/downloads` },
            ],
          }),
        }}
      />
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
