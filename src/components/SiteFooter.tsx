import Image from "next/image";
import Link from "next/link";
import { getDeskContact, getNavFacets, telHref, waHref } from "@/lib/site";
import { getAppDownload, type AppDownload } from "@/lib/app-download";
import { TitleBlock } from "@/components/cadastral/TitleBlock";
import { LedgerCount } from "@/components/cadastral/LedgerCount";
import { SurveyIcon, type SurveyIconName } from "@/components/cadastral/SurveyIcon";

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
  const [desk, facets, app] = await Promise.all([
    getDeskContact(),
    getNavFacets(),
    getAppDownload(),
  ]);
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
      {/* The certificate rule crowns the onyx (Gilded Register §2).
          ⚠️ The engraved FooterFrieze that used to sit under it was withdrawn
          at the owner's ask (2026-08-18 16:05, "no need of this design") —
          the component stays in cadastral/Engravings for any future use. */}
      <div className="rj-royal-rule" aria-hidden="true" />
      <div className="mx-auto max-w-[1280px] px-5 py-phi6 lg:px-10">
        <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr_1fr_1fr]">
          {/* 🚨 CENTRED ON A PHONE (report 14, 2026-08-21: "footer company
              information is not centered on mobile… the 'Property.
              Prosperity. Legacy.' text, company description, statistics and
              brochure button are all aligned toward the left side… on mobile
              screens, this entire footer company-information section should be
              center-aligned").

              ⚠️ `text-center` alone does NOT centre the lockup, the rule, the
              stats grid or the brochure pill — three of those are flex/grid
              children and one is `max-w-sm`, all of which stay left however
              the text aligns. Each gets its own centring below, and every one
              of them is undone at `sm`, where the column is wide enough that
              centred copy would read as a pull-quote rather than as a block.
              ONLY this first column moves: the link columns beside it are
              lists, and a centred list is harder to scan, not easier. */}
          <div className="text-center sm:text-left">
            {/* ⚠️ THE MARK, THEN THE WORDMARK AS TEXT — not logo-full.png.
                That file bakes the wordmark in as near-black ink, which
                measures 1.06:1 on onyx and simply vanishes; the same finding
                that put a plate under the header lockup in the Vault. §6.9 asks
                for "the emblem, then the wordmark", so here the split is free:
                the emblem stays an image and the wordmark becomes real text,
                which is selectable, translatable and legible by construction. */}
            <div className="flex items-center justify-center gap-3 sm:justify-start">
              <Image
                src="/logo-mark.png"
                alt=""
                aria-hidden="true"
                width={256}
                height={256}
                sizes="44px"
                className="h-11 w-11 object-contain"
              />
              {/* Item 10: `rj-signage` — in carbon mode the wordmark glows
                  like the gate boards in the night renders. */}
              <span className="rj-signage text-lg font-medium uppercase tracking-brand text-ink">
                Jamin Bazaar
              </span>
            </div>

            <p className="rj-voice mt-phi3 text-lg text-bone-soft">
              Property. Prosperity. Legacy.
            </p>

            <p className="mx-auto mt-phi3 max-w-sm text-base leading-relaxed text-ink-muted sm:mx-0">
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
              <dl className="mx-auto mt-phi3 grid max-w-sm grid-cols-3 gap-phi2 sm:mx-0">
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
              /* An `inline-flex` centres with its line box, so the parent's
                 `text-center` carries it on a phone with nothing added here. */
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
            <FooterHeading icon="building">Projects</FooterHeading>
            <ul className="mt-phi2 space-y-3">
              <FooterLink href="/properties">All properties</FooterLink>
              <FooterLink href="/projects">Projects by stage</FooterLink>
              <FooterLink href="/compare">Compare developments</FooterLink>
              <FooterLink href="/downloads">Brochures &amp; plans</FooterLink>
              {facets.phases.map((f) => (
                <FooterLink key={f.key} href={f.href}>
                  {f.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading icon="station">Locations</FooterHeading>
            <ul className="mt-phi2 space-y-3">
              {facets.districts.map((f) => (
                <FooterLink key={f.key} href={f.href}>
                  {f.label}
                </FooterLink>
              ))}
            </ul>
          </div>

          <div>
            <FooterHeading icon="deed">{desk.label ?? "Talk to Jamin"}</FooterHeading>
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
              {/* The Tamil doorway — the label IS Tamil, because the reader
                  it serves scans for their own script, not for "Tamil". */}
              <FooterLink href="/ta">தமிழில்</FooterLink>
              <FooterLink href="/tools">Tools &amp; calculators</FooterLink>
              <FooterLink href="/faq">Questions, answered</FooterLink>
              <FooterLink href="/about">About Jamin</FooterLink>
              <FooterLink href="/vault">The Vault</FooterLink>
              <FooterLink href="/contact">Book a site visit</FooterLink>
              {/* ⚠️ The app link is NOT in this list. It is a band of its own
                  below the columns — the owner asked for a "prominent Download
                  Our App section", and a row in a column of fourteen text links
                  is the opposite of prominent. */}
            </ul>
          </div>
        </div>

        <AppBand app={app} />

        <div className="mt-phi5 flex flex-col gap-3 border-t border-line pt-phi3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-tiny text-ink-faint">
            © {new Date().getFullYear()} Jamin Properties. All rights reserved.
          </p>
          <p className="text-tiny text-ink-faint">
            Plot availability and pricing are confirmed by our sales desk at the time of booking.
          </p>
        </div>

        {/* Owner's ask (2026-08-18 16:05): "add a disclaimer somewhere that
            the images are for creative representation only." The footer is on
            every page, so one line here covers every render and composed
            sheet on the site — including the /journal flat-lay's concept
            masterplan and the gate renders naming places outside the
            catalogue. Plans of record stay checkable on their own pages. */}
        <p className="mt-3 text-tiny text-ink-faint">
          Artistic renders and illustrative site plans shown on this website are for creative
          representation only.
        </p>

        {/* ⚠️ THE BUILD CREDIT — owner's instruction 2026-08-17: "Change this
            to Website powered by GHL India Ventures", replacing the 777 Raptor
            credit and its WhatsApp deep link (owner's own 2026-08-13 request).
            No URL was given, so the credit is plain text rather than an
            invented link; if GHL's site should be linked, that is a one-line
            change here. */}
        <p className="mt-phi3 text-center text-tiny text-ink-faint">
          Website powered by{" "}
          <span className="font-medium text-champagne-300">GHL India Ventures</span>
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

        {/* ⚠️ `issued` is evaluated HERE, in a server component, so it is the
            date this build was made. Passing it in rather than letting the
            client island read its own clock is the whole correctness argument —
            see the note in TitleBlock. `en-GB` + Asia/Kolkata so the sheet is
            stamped in the office's own timezone rather than the builder's. */}
        <TitleBlock
          issued={new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          }).format(new Date())}
        />
      </div>
    </footer>
  );
}

/**
 * "Download Our App" (owner spec 2026-08-21 §6): the direct APK and the Play
 * listing, side by side.
 *
 * 🚨 RENDERS NOTHING WHEN NEITHER URL IS SET, and each button is independent of
 * the other. This is the site's standing rule about dead controls, and it
 * matters more here than anywhere else on the page: the footer is on EVERY
 * route, so one unset link would be one broken promise repeated across the
 * whole site. The Play listing and the APK will very likely arrive on different
 * days — whichever lands first shows on its own, with the copy adjusting rather
 * than a greyed-out placeholder sitting beside it.
 *
 * ⚠️ Plain <a>, not FooterLink/Link. Both destinations are external and one of
 * them is a binary; Next's Link would prefetch and client-navigate them.
 *
 * ⚠️ NO `download` ATTRIBUTE ON THE APK. The file is cross-origin, where the
 * attribute is ignored by every current browser anyway, and the reader's own
 * download UI is the honest place for a 60MB fetch to be confirmed. The size is
 * printed instead, as the brochure pill above does.
 */
function AppBand({ app }: { app: AppDownload }) {
  if (!app.apkUrl && !app.playUrl) return null;

  return (
    <section className="mt-phi5 rounded-card border border-jamin-gold/25 bg-jamin-gold/[0.05] p-phi4">
      <div className="flex flex-col items-center gap-phi3 text-center lg:flex-row lg:items-center lg:justify-between lg:text-left">
        <div className="max-w-xl">
          <h2 className="flex items-center justify-center gap-2 text-tiny font-semibold uppercase tracking-[0.18em] text-ink lg:justify-start">
            <SurveyIcon name="stamp" size="h-4 w-4" className="shrink-0 text-champagne-500" />
            Download our app
          </h2>
          <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
            Your plots, your visits and your promoter tools in one place — the same account and the
            same phone number you use here.
          </p>
        </div>

        {/* ⚠️ `w-full sm:w-auto` on both: at 375px these two labels cannot share
            a line, so they stack full-width and equal rather than wrapping to
            two pills of different widths — the same finding written up on the
            account overview's button pair. */}
        <div className="flex w-full shrink-0 flex-col gap-2.5 sm:w-auto sm:flex-row">
          {app.apkUrl && (
            <a
              href={app.apkUrl}
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full bg-jamin-red px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep sm:w-auto"
            >
              <svg
                viewBox="0 0 16 16"
                className="h-4 w-4 shrink-0"
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
              Download directly
            </a>
          )}
          {app.playUrl && (
            <a
              href={app.playUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex w-full items-center justify-center gap-2.5 rounded-full border border-jamin-gold/55 bg-jamin-gold/[0.07] px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-champagne-100 transition-colors hover:border-jamin-gold hover:bg-jamin-gold/15 sm:w-auto"
            >
              {/* The Play triangle, drawn rather than fetched — the store's own
                  badge is a hosted asset with its own brand rules, and this
                  footer has no external images. */}
              <svg viewBox="0 0 16 16" className="h-4 w-4 shrink-0" aria-hidden="true" fill="currentColor">
                <path d="M2.6 1.4a.8.8 0 0 0-.35.67v11.86a.8.8 0 0 0 .35.67l6.3-6.6-6.3-6.6Zm7.1 7.4 1.9 1.99-6.42 3.66 4.52-5.65Zm0-1.6L5.18 1.55 11.6 5.2 9.7 7.2Zm2.83 1.4-2.1-2.2 2.1-2.2 1.9 1.09c.63.36.63 1.26 0 1.62l-1.9 1.09Z" />
              </svg>
              Get it on Google Play
            </a>
          )}
        </div>
      </div>

      {/* Version and weight only where they are actually known — the reader is
          told what they are about to fetch, and nothing is guessed. */}
      {app.apkUrl && (app.version || app.sizeLabel) && (
        <p className="mt-phi3 text-center text-tiny text-ink-faint lg:text-left">
          Direct download: Android
          {app.version ? ` · version ${app.version}` : ""}
          {app.sizeLabel ? ` · ${app.sizeLabel}` : ""}
        </p>
      )}
    </section>
  );
}

/** h2, not h4. The footer sits on every page, and its column headings were
 *  jumping the outline from h2 straight to h4 on pages whose deepest heading
 *  was an h2 — flagged on /, /about, /contact and a property page. */
function FooterHeading({ icon, children }: { icon: SurveyIconName; children: React.ReactNode }) {
  return (
    <h2 className="flex items-center gap-2 text-tiny font-semibold uppercase tracking-[0.18em] text-ink">
      {/* A drawn mark per column, in champagne so it reads as a rule rather
          than as a second heading. `aria-hidden` inside the icon itself — the
          heading text is the heading. */}
      <SurveyIcon name={icon} size="h-4 w-4" className="shrink-0 text-champagne-500" />
      {children}
    </h2>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      {/* `rj-underline` draws the rule from the left rather than switching it
          on. Purely a transition; the link is unchanged. */}
      <Link
        href={href}
        className="rj-underline text-base text-ink-muted transition-colors hover:text-champagne-300"
      >
        {children}
      </Link>
    </li>
  );
}
