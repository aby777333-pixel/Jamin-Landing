import Image from "next/image";
import Link from "next/link";
import { getDeskContact, getNavFacets, telHref, waHref } from "@/lib/site";
import { LedgerCount } from "@/components/cadastral/LedgerCount";

/**
 * §59 — the footer is a discovery layer, and §75 — its contact details must be
 * the real ones. Both the phone number and the email are read from
 * `platform_contacts.jamin_desk`, the same row the app's Support screen reads
 * and the admin console edits, so the two products can never disagree. No
 * address is shown because none is recorded; inventing one is explicitly
 * forbidden.
 *
 * Every link below resolves to a page that exists. The previous footer offered
 * /legal and /guide, neither of which was ever built.
 */
export async function SiteFooter() {
  const [desk, facets] = await Promise.all([getDeskContact(), getNavFacets()]);
  const tel = telHref(desk.mobile);
  const wa = waHref(desk.whatsapp, "Hello Jamin Properties — I'd like to know more about your plots.");

  return (
    <footer className="mt-phi7 border-t border-line bg-canvas-alt">
      <div className="mx-auto max-w-[1280px] px-5 py-phi6 lg:px-10">
        <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr_1fr_1fr]">
          <div>
            <Image
              src="/logo-full.png"
              alt="Jamin Bazaar"
              width={793}
              height={312}
              sizes="150px"
              className="h-14 w-auto"
            />
            <p className="mt-phi3 max-w-sm text-base leading-relaxed text-ink-muted">
              DTCP-approved residential plotted developments across Tamil Nadu — planned for
              families who intend to build, and for investors who intend to hold.
            </p>
            <div className="mt-phi3 h-px w-24 rule-gold" />
            {/* Was one tiny grey sentence — "4 developments · 43 plots
                available" — set at the same weight as a caption, so the only
                hard numbers on the page were also the least visible thing on
                it. As a ledger block the figures lead and the labels support,
                and tabular figures hold the columns on a common pitch. */}
            {facets.totals.developments > 0 && (
              <dl className="mt-phi3 grid max-w-sm grid-cols-3 gap-phi2">
                {[
                  { label: "Developments", value: facets.totals.developments },
                  { label: "Plots available", value: facets.totals.plotsAvailable },
                  { label: "Districts", value: facets.districts.length },
                ]
                  .filter((s) => s.value > 0)
                  .map((s) => (
                    <div key={s.label} className="min-w-0 border-t border-line pt-phi2">
                      <dd className="text-2xl leading-none text-ink">
                        <LedgerCount value={s.value} />
                      </dd>
                      <dt className="ledger-label mt-1.5 block">{s.label}</dt>
                    </div>
                  ))}
              </dl>
            )}
          </div>

          <div>
            <FooterHeading>Projects</FooterHeading>
            <ul className="mt-phi2 space-y-3">
              <FooterLink href="/properties">All properties</FooterLink>
              <FooterLink href="/projects">Projects by stage</FooterLink>
              <FooterLink href="/downloads">Brochures &amp; plans</FooterLink>
              {facets.phases.map((f) => (
                <FooterLink key={f.key} href={f.href}>
                  {f.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>Locations</FooterHeading>
            <ul className="mt-phi2 space-y-3">
              {facets.districts.map((f) => (
                <FooterLink key={f.key} href={f.href}>
                  {f.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading>{desk.label ?? "Talk to Jamin"}</FooterHeading>
            <ul className="mt-phi2 space-y-3">
              {tel && (
                <li>
                  <a href={tel} className="text-base text-ink-muted transition-colors hover:text-jamin-red-deep">
                    {desk.mobile}
                  </a>
                </li>
              )}
              {wa && (
                <li>
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-base text-ink-muted transition-colors hover:text-jamin-red-deep"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {desk.email && (
                <li>
                  <a
                    href={`mailto:${desk.email}`}
                    className="break-all text-base text-ink-muted transition-colors hover:text-jamin-red-deep"
                  >
                    {desk.email}
                  </a>
                </li>
              )}
              {facets.hasJournal && <FooterLink href="/journal">Jamin Journal</FooterLink>}
              <FooterLink href="/about">About Jamin</FooterLink>
              <FooterLink href="/contact">Book a site visit</FooterLink>
              <li>
                <a
                  href="https://merry-begonia-4c3cd1.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-ink-muted transition-colors hover:text-jamin-red-deep"
                >
                  Jamin Bazaar app
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-phi5 flex flex-col gap-3 border-t border-line pt-phi3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-tiny text-ink-faint">
            © {new Date().getFullYear()} Jamin Properties. All rights reserved.
          </p>
          <p className="text-tiny text-ink-faint">
            Plot availability and pricing are confirmed by our sales desk at the time of booking.
          </p>
        </div>
      </div>
    </footer>
  );
}

/** h2, not h4. The footer sits on every page, and its column headings were
 *  jumping the outline from h2 straight to h4 on pages whose deepest heading
 *  was an h2 — flagged on /, /about, /contact and a property page. */
function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">{children}</h2>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-base text-ink-muted transition-colors hover:text-jamin-red-deep">
        {children}
      </Link>
    </li>
  );
}
