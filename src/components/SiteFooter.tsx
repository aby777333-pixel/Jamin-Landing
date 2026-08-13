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
    /* §6.9 — the page descends into onyx. `.rj-footer` re-scopes the colour
       tokens rather than restyling children, so LedgerCount and cadastral's
       `.ledger-label` follow without either being touched. */
    /* 🚨 `mt-phi5 lg:mt-phi7`, and the phone value is the bug fix.
       `mt-phi7` is 9rem — 144px of bare canvas above the footer, on every page,
       at every width. On a desktop that is breathing room between a long page
       and its closing block. On a phone it is a screen-and-a-bit of nothing,
       and it compounds with whatever bottom padding the last section carries:
       /projects/completed ended a single card 199px above the footer and /vault
       ended its closing line 288px above it. Reported 2026-08-13 as "excessive
       blank space appears between the paragraph section and footer" on both.
       55px is enough separation here because the footer does not rely on the
       gap to announce itself — it changes ground colour to onyx, which is a
       harder edge than any amount of margin. */
    <footer className="rj-footer mt-phi5 lg:mt-phi7">
      <div className="mx-auto max-w-[1280px] px-5 py-phi6 lg:px-10">
        <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr_1fr_1fr]">
          <div>
            {/* ⚠️ THE MARK, THEN THE WORDMARK AS TEXT — not logo-full.png.
                That file bakes the wordmark in as near-black ink, which
                measures 1.06:1 on onyx and simply vanishes; the same finding
                that put a plate under the header lockup in the Vault. §6.9 asks
                for "the emblem, then the wordmark", so here the split is free:
                the emblem stays an image and the wordmark becomes real text,
                which is selectable, translatable and legible by construction. */}
            <div className="flex items-center gap-3">
              <Image
                src="/logo-mark.png"
                alt=""
                aria-hidden="true"
                width={256}
                height={256}
                sizes="44px"
                className="h-11 w-11 object-contain"
              />
              <span className="text-lg font-medium uppercase tracking-brand text-ink">
                Jamin Bazaar
              </span>
            </div>

            <p className="rj-voice mt-phi3 text-lg text-bone-soft">
              Property. Prosperity. Legacy.
            </p>

            <p className="mt-phi3 max-w-sm text-base leading-relaxed text-ink-muted">
              DTCP-approved residential plotted developments across Tamil Nadu — planned for
              families who intend to build, and for investors who intend to hold.
            </p>
            {/* §6.9's one fine gold rule. `rule-gold` already fades at both
                ends — it is the same gradient as the line under BAZAAR in the
                logo, so this is the site's existing rule, widened. */}
            <div className="mt-phi3 h-px w-full rule-gold" />
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

            {/* ⚠️ STANDS ALONE, and is deliberately not in the Projects list —
                owner's call 2026-08-12, and the markup follows from it. As a
                list item it had to look like its neighbours: no icon, and the
                weight stacked underneath on a second line, because that column
                is only about 150px wide. Out here it is a control rather than a
                destination, so it can be a bordered target with the icon and
                the weight on one line — and the brand column is `max-w-sm`, so
                that line fits without wrapping.

                ⚠️ Still a plain <a>, not `FooterLink`. That renders a Next
                `Link`, which prefetches and client-navigates a STATIC PDF and
                cannot carry `download` at all.

                The weight is stated rather than sprung on the reader — half a
                megabyte on a phone connection is their decision, not ours.

                ⚠️ IT IS GOLD, NOT RED, AND THAT IS THE RULE RATHER THAN A
                PREFERENCE. Owner asked for colour on it 2026-08-13. The obvious
                answer is a filled `bg-cta` pill — but the footer sits on EVERY
                page and the header already carries the site's one filled red
                control ("Book a visit", HeaderShell), so a red button here would
                put two of them on every view and the red would stop meaning
                "this is the thing to press". Gold is the site's other brand
                colour, it is what the rule above this block already uses, and it
                is unspoken-for.

                Three materials, each doing one job, all on onyx-900: the glyph
                is `jamin-red` (4.13:1 — a graphic needs 3:1, and it echoes the
                red mark sitting directly above it in this column), the label is
                `champagne-100` (14.94:1), and the weight stays brushed silver
                like every other piece of metadata in this footer. The gold wash
                is 7% so the chip reads as filled without becoming a second
                button; hover doubles it rather than changing colour.

                ⚠️ The ring is gold at 0.55, not 0.45. Against the tinted fill
                0.45 composites to 2.71:1 — under §1.4.11's 3:1 for the boundary
                of a control — and 0.55 gives 3.42:1. Worth knowing that the
                `border-line` it replaced measured about 1.6:1, so this was
                already the weakest edge in the footer before any colour went
                near it. */}
            <a
              href="/brochure/jamin-bazaar-royal-presentation.pdf"
              download
              className="mt-phi4 inline-flex items-center gap-3 rounded-full border border-jamin-gold/55 bg-jamin-gold/[0.07] px-5 py-3 text-base text-champagne-100 transition-colors hover:border-jamin-gold hover:bg-jamin-gold/15 hover:text-champagne-50"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 shrink-0 text-jamin-red"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M8 2v8m0 0L5 7m3 3 3-3" />
                <path d="M2.5 11.5v1a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-1" />
              </svg>
              Download brochure
              <span className="text-tiny text-ink-faint">PDF · 540 KB</span>
            </a>
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
                  <a href={tel} className="text-base text-ink-muted transition-colors hover:text-champagne-300">
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
                    className="text-base text-ink-muted transition-colors hover:text-champagne-300"
                  >
                    WhatsApp
                  </a>
                </li>
              )}
              {desk.email && (
                <li>
                  <a
                    href={`mailto:${desk.email}`}
                    className="break-all text-base text-ink-muted transition-colors hover:text-champagne-300"
                  >
                    {desk.email}
                  </a>
                </li>
              )}
              {facets.hasJournal && <FooterLink href="/journal">Jamin Journal</FooterLink>}
              <FooterLink href="/about">About Jamin</FooterLink>
              <FooterLink href="/vault">The Vault</FooterLink>
              <FooterLink href="/contact">Book a site visit</FooterLink>
              {/* ⚠️ The app link is withdrawn until the Play Store listing is
                  live. Sending a buyer to a raw Netlify URL and calling it "the
                  app" is not the first impression the store page will make. */}
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

        {/* ⚠️ THE BUILD CREDIT, and the link is an ASSUMPTION worth reading.
            Owner's instruction 2026-08-13, verbatim: "in the footer write site
            powered by 777 Raptor …give a link and keep the whatzap number
            7012608089". 777 Raptor has no website recorded anywhere in this
            project, and the number arrived in the same breath as the request for
            a link, so the link is a WhatsApp deep link to that number. If there
            is a real site, this is a one-line change.

            ⚠️ The number is HARD-CODED here, unlike every other contact on this
            page. That is deliberate and it is the exception that proves the
            rule: the desk's phone, WhatsApp and email above are read from
            `platform_contacts.jamin_desk` so the app and the site can never
            disagree about how to reach JAMIN. This is not Jamin's number — it is
            the builder's — and putting it in the desk record would make it
            answer sales calls. */}
        <p className="mt-phi3 text-center text-tiny text-ink-faint">
          Site powered by{" "}
          <a
            href="https://wa.me/917012608089"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-champagne-300 underline-offset-4 transition-colors hover:text-champagne-100 hover:underline"
          >
            777 Raptor
          </a>{" "}
          · WhatsApp 70126 08089
        </p>

        {/* §6.9's closing line.
            ⚠️ §6.9 also asks for social icons in brushed silver. There are none
            here, deliberately: no social profile exists anywhere in the data or
            the code, so an icon row would mean inventing accounts and linking
            buyers to them. The same section's own closing rule settles it — if
            a footer link does not earn its row, cut it — and a link to nowhere
            earns nothing. Add them the moment there are real handles. */}
        <p className="mt-phi4 text-center text-micro text-bone-soft">
          Built on trust. Designed for generations.
        </p>
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
      <Link href={href} className="text-base text-ink-muted transition-colors hover:text-champagne-300">
        {children}
      </Link>
    </li>
  );
}
