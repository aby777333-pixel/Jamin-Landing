import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/account/SignInForm";
import { Container } from "@/components/ui";
import { getNavFacets } from "@/lib/site";
import { LedgerCount } from "@/components/cadastral/LedgerCount";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in to your Jamin account with your mobile number to keep a shortlist and follow your site visits. The same account as the Jamin Bazaar app.",
  alternates: { canonical: "/account/sign-in" },
  robots: { index: false, follow: true },
};

/**
 * The sign-in plate.
 *
 * It used to be a single narrow card centred in an otherwise empty viewport,
 * which read as an unfinished page rather than a considered one. It is now a
 * survey plate: the form on paper over the setting-out grid, and beside it the
 * reason to bother — stated in real figures read from the catalogue, not in
 * marketing adjectives.
 *
 * ⚠️ The numbers come from `getNavFacets`, the same query the header uses, so
 * this page can never claim a development count the menu disagrees with. If
 * Supabase is unreachable that helper already returns zeros rather than
 * throwing, and the aside simply renders nothing.
 */
/* Icons per the 2026-08-17 account report — "simple, consistent icons for the
   three account features". Drawn survey marks from the standing set, never a
   pictogram pack: the shortlist is a plot SCHEDULE (`list`), a visit is a
   PLACE (`pin`), and Jamindar answers from the REGISTER (`ledger`). */
const REASONS = [
  {
    icon: "list" as const,
    title: "Keep a shortlist",
    body: "Save the layouts you are weighing up. The same list appears in the Jamin Bazaar app.",
  },
  {
    icon: "pin" as const,
    title: "Follow your site visits",
    body: "See the date our desk confirmed, the slot, and which development it is against.",
  },
  {
    icon: "ledger" as const,
    title: "Ask Jamindar anything",
    body: "The assistant answers from live project records in the language you prefer.",
  },
];

export default async function SignInPage() {
  const facets = await getNavFacets();
  const { developments, selling, plotsAvailable } = facets.totals;

  /* Icons per the 2026-08-17 report's own mapping: Developments → building,
     Selling now → price tag, Plots available → plot grid, Districts → map. */
  const stats = [
    { label: "Developments", value: developments, icon: "building" as const },
    { label: "Selling now", value: selling, icon: "tag" as const },
    { label: "Plots available", value: plotsAvailable, icon: "grid" as const },
    { label: "Districts", value: facets.districts.length, icon: "map" as const },
  ].filter((s) => s.value > 0);

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas-alt">
      {/* The sheet the plate is drawn on. */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative py-phi5 lg:py-phi6">
        {/* `items-stretch` (the default), not `items-start` — equal card
            heights are the report's headline ask, and `items-start` was the
            single property preventing them. */}
        <div className="grid gap-phi4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-phi5">
          {/* `next` deliberately is NOT read from the query string. An open
              redirect on a sign-in page is a phishing primitive, and the only
              place a buyer needs to land afterwards is their own account. */}
          {/* ⚠️ The left column is a COLUMN now, not just the form. The report's
              words: the picture below the account information "creates
              additional vertical length and leaves the left side
              underutilised". It was right — the form is short and the aside is
              five blocks long, so the page was a tall right-hand strip beside
              half a screen of blueprint. Moving the one movable block across
              shortens the page by its own height instead of adding to it.

              On a phone the two columns collapse to one and the picture lands
              directly under the form, which is also where it reads best: it
              breaks the page between "do this" and "here is why", rather than
              trailing off the bottom where nobody scrolls to. */}
          <div className="flex flex-col gap-phi4">
            <Suspense fallback={null}>
              <SignInForm next="/account" />
            </Suspense>

            {/* hero-76 — the Premium Villas Chennai gate, owner-supplied
                2026-08-18 (12:58, "swap image with the attached"), replacing
                hero-12's pin-in-plot render. ⚠️ It names a city with no
                catalogue project, so the standing rule binds at full
                strength: alt="", aria-hidden, never a caption. */}
            <div className="overflow-hidden rounded-card border border-line bg-canvas-alt">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/hero/hero-76-1280.webp"
                srcSet="/hero/hero-76-768.webp 768w, /hero/hero-76-1280.webp 1280w, /hero/hero-76-1672.webp 1672w"
                /* ⚠️ Re-stated with the move. It used to sit in the 0.85fr
                   column and now sits in the 1fr one, so the old `34vw` would
                   have had the browser pick a rendition about a third too small
                   and upscale it. A `sizes` that no longer matches the box is
                   invisible in review and obvious on a retina screen. */
                sizes="(max-width: 1024px) 100vw, 46vw"
                alt=""
                aria-hidden="true"
                loading="lazy"
                decoding="async"
                className="h-auto w-full"
              />
            </div>
          </div>

          {/* ── TWO INDIVIDUAL CARDS (owner report 2026-08-18), where the
              2026-08-17 round made one. Top card: "What an account is for"
              with the three features. Bottom card: "On the books today" with
              the statistics and the security note at its foot. The column is
              still `h-full` with the features card taking `flex-1`, so the
              pair of columns keep ending flush — the property the previous
              round existed to win stays won, just across two plates. */}
          <aside className="flex h-full flex-col gap-phi4">
            <div className="cd-plate flex flex-1 flex-col overflow-hidden rounded-card p-phi4 shadow-lift lg:p-phi5">
              <span className="mb-phi3 block h-px w-16 rule-red" aria-hidden="true" />
              <h2 className="text-2xl text-ink">What an account is for</h2>

              <dl className="mt-phi3">
                {REASONS.map((r) => (
                  <div key={r.title} className="flex gap-phi2 border-t border-line py-phi3">
                    {/* Drawn survey marks, one register for all three — the
                        report's "simple, consistent icons". */}
                    <span
                      aria-hidden="true"
                      className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[11px] bg-jamin-gold-soft text-jamin-gold-ink"
                    >
                      <SurveyIcon name={r.icon} className="h-[22px] w-[22px]" />
                    </span>
                    <div>
                      <dt className="text-lg text-ink">{r.title}</dt>
                      <dd className="mt-1 text-base leading-relaxed text-ink-muted">{r.body}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>

            {stats.length > 0 && (
              <div className="cd-plate flex flex-col overflow-hidden rounded-card p-phi4 shadow-lift lg:p-phi5">
                <div className="ledger-label">On the books today</div>
                {/* ⚠️ VERTICAL REGISTER ROWS with FIXED COLUMNS (owner report
                    2026-08-18, two items): the 2/4-column grid compressed the
                    stats into a dashboard strip, and the label's start
                    position drifted with the number's width — "the 138 row
                    especially". One row per statistic now, ruled like every
                    register on this site, with a fixed icon track, a fixed
                    number track in tabular figures, and every label starting
                    on the same x. A plain list, not a <dl> — the number-first
                    reading order would force dd before dt, which is invalid
                    in a description list. */}
                <ul className="mt-phi2 divide-y divide-line">
                  {stats.map((s) => (
                    <li
                      key={s.label}
                      className="grid grid-cols-[2.5rem_4.5rem_minmax(0,1fr)] items-center gap-3 py-phi2"
                    >
                      <span
                        aria-hidden="true"
                        className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-canvas-sunken text-jamin-gold-ink"
                      >
                        <SurveyIcon name={s.icon} className="h-[19px] w-[19px]" />
                      </span>
                      <span className="ledger text-2xl leading-none text-ink">
                        <LedgerCount value={s.value} />
                      </span>
                      <span className="text-base text-ink-muted">{s.label}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-phi3 border-t border-line pt-phi3 text-tiny leading-relaxed text-ink-faint">
                  No password is ever set or stored. Signing in mints a one-time credential that is
                  exchanged for a session immediately and never shown again.
                </p>
              </div>
            )}
          </aside>
        </div>
      </Container>
    </section>
  );
}
