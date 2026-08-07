import Image from "next/image";
import Link from "next/link";
import { getDeskContact, getNavFacets, telHref, waHref } from "@/lib/site";

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
            <Image src="/logo.png" alt="Jamin Bazaar" width={200} height={73} className="h-11 w-auto" />
            <p className="mt-phi3 max-w-sm text-base leading-relaxed text-ink-muted">
              DTCP-approved residential plotted developments across Tamil Nadu — planned for
              families who intend to build, and for investors who intend to hold.
            </p>
            <div className="mt-phi3 h-px w-24 rule-gold" />
            {facets.totals.developments > 0 && (
              <p className="mt-phi3 text-tiny text-ink-faint">
                {facets.totals.developments} development
                {facets.totals.developments === 1 ? "" : "s"} · {facets.totals.plotsAvailable} plot
                {facets.totals.plotsAvailable === 1 ? "" : "s"} available
              </p>
            )}
          </div>

          <div>
            <FooterHeading>Projects</FooterHeading>
            <ul className="mt-phi2 space-y-3">
              <FooterLink href="/properties">All properties</FooterLink>
              <FooterLink href="/projects">Projects by stage</FooterLink>
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
                  <a href={tel} className="text-base text-ink-muted transition-colors hover:text-jamin-red">
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
                    className="text-base text-ink-muted transition-colors hover:text-jamin-red"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {desk.email && (
                <li>
                  <a
                    href={`mailto:${desk.email}`}
                    className="break-all text-base text-ink-muted transition-colors hover:text-jamin-red"
                  >
                    {desk.email}
                  </a>
                </li>
              )}
              <FooterLink href="/about">About Jamin</FooterLink>
              <FooterLink href="/contact">Book a site visit</FooterLink>
              <li>
                <a
                  href="https://merry-begonia-4c3cd1.netlify.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base text-ink-muted transition-colors hover:text-jamin-red"
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

function FooterHeading({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="text-tiny font-semibold uppercase tracking-[0.18em] text-ink">{children}</h4>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-base text-ink-muted transition-colors hover:text-jamin-red">
        {children}
      </Link>
    </li>
  );
}
