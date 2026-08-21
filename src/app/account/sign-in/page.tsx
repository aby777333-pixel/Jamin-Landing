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

/**
 * 🚨 WHERE SIGN-IN MAY SEND YOU AFTERWARDS (report 12, 2026-08-21, the
 * shortlist gate: "after successful sign-in, return the user to the same
 * property and allow them to shortlist it").
 *
 * The old note here said `next` deliberately is NOT read from the query string,
 * because "an open redirect on a sign-in page is a phishing primitive". That
 * reasoning is right and it is preserved by CONSTRUCTION rather than by
 * refusing the feature: this returns a value only for a path that begins with a
 * single "/" and matches one of the shapes below, so nothing off this origin
 * can ever be reached. Everything else — an absolute URL, a protocol-relative
 * `//evil.example`, a backslash, an unknown route — falls back to `/account`.
 *
 * ⚠️ `//` IS THE ATTACK AND IT LOOKS LIKE A PATH. `//evil.example/x` starts
 * with "/" and is a protocol-relative URL that leaves this origin; the second
 * character has to be checked explicitly. Same for `/\evil.example`, which some
 * engines normalise to the same thing.
 */
const RETURNABLE = [
  /^\/$/,
  /^\/property\/[^/?#]+$/,
  /^\/properties$/,
  /^\/locations\/[^/?#]+$/,
  /^\/projects(\/[^/?#]+)?$/,
  /^\/compare$/,
];

function safeNext(raw: string | string[] | undefined): string {
  const v = Array.isArray(raw) ? raw[0] : raw;
  if (!v || v.length > 200) return "/account";
  if (!v.startsWith("/") || v.startsWith("//") || v.startsWith("/\\")) return "/account";
  // Compare the PATH only; a query string is not part of what is allowlisted
  // and is carried through untouched once the path itself is known-good.
  const path = v.split(/[?#]/)[0];
  return RETURNABLE.some((re) => re.test(path)) ? v : "/account";
}

export default async function SignInPage({ searchParams }: PageProps<"/account/sign-in">) {
  const facets = await getNavFacets();
  const next = safeNext((await searchParams)?.next);
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
    /* ⚠️ `-mb-phi5 lg:-mb-phi7` swallows the footer's page-end margin after
       this band (report 10, 2026-08-20: "large unnecessary empty space between
       the main content and the footer… let the footer move directly after the
       page content"). The CallbackBand precedent exactly: SiteFooter carries
       `mt-phi5 lg:mt-phi7` on every page, and on a page that ENDS on a
       full-width banded section that margin is a hole, not breathing room —
       this section already separates itself with its own ground and border.
       Pages not ending on a band are unaffected. */
    <section className="relative -mb-phi5 overflow-hidden border-b border-line bg-canvas-alt lg:-mb-phi7">
      {/* The sheet the plate is drawn on. */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative py-phi5 lg:py-phi6">
        {/* 🚨 FOUR CELLS IN A 2×2 GRID, NOT TWO STACKED COLUMNS (report 7,
            2026-08-19 — two separate items: "the left Sign in with your mobile
            card and the right What an account is for card have different
            heights", and "the left property image and the right On the books
            today information card have different heights").

            The 2026-08-18 round made the two COLUMNS end flush (`h-full` on the
            aside, `flex-1` on its first card) and that property still holds —
            but flush columns say nothing about what happens inside them. The
            form is short and the features card is tall, so the seam between
            block one and block two sat at a different height on each side, and
            the reader sees the seams, not the outer edges.

            Rows can only be equalised by rows. All four blocks are now direct
            children of ONE grid with explicit `row-start`/`col-start` from
            `lg`, so the browser's default `items-stretch` makes each PAIR the
            same height: form ↔ features, picture ↔ statistics.

            ⚠️ SOURCE ORDER IS THE PHONE ORDER, and it changed with this. Below
            `lg` the grid is one column and reads form → why an account →
            picture → statistics. The picture used to sit directly under the
            form; it now breaks between the two right-hand plates instead,
            which keeps "do this" and "here is why" adjacent on a phone.

            ⚠️ The placement classes are `lg:` only. Removing them without also
            restoring the column wrappers collapses the page to a single
            stack. */}
        <div className="grid gap-phi4 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:grid-rows-[auto_auto] lg:gap-phi5">
          {/* `next` comes from the query string but only through `safeNext`
              above — same-origin paths of known shapes, everything else lands
              on /account. See the note there for why that keeps the original
              open-redirect refusal intact. */}
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
          <div className="flex flex-col lg:col-start-1 lg:row-start-1">
            <Suspense fallback={null}>
              <SignInForm next={next} />
            </Suspense>
          </div>

            {/* hero-76 — the Premium Villas Chennai gate, owner-supplied
                2026-08-18 (12:58, "swap image with the attached"), replacing
                hero-12's pin-in-plot render. ⚠️ It names a city with no
                catalogue project, so the standing rule binds at full
                strength: alt="", aria-hidden, never a caption. */}
          {/* The picture is the second LEFT cell now, paired with the
              statistics plate opposite. `lg:row-start-2` is what pairs them. */}
          <div className="overflow-hidden rounded-card border border-line bg-canvas-alt lg:col-start-1 lg:row-start-2">
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
                /* ⚠️ `h-full object-cover` from `lg`, not `h-auto`. Stretching
                   the CELL is only half of equal heights — an `h-auto` image
                   sits at its natural height inside a stretched box and leaves
                   the difference as dead space under it, which is the same
                   complaint one level down. Below `lg` there is nothing to
                   match, so it keeps its own height and is never cropped. */
                className="h-auto w-full lg:h-full lg:object-cover"
              />
          </div>

          {/* ── TWO INDIVIDUAL CARDS (owner report 2026-08-18), where the
              2026-08-17 round made one. Top card: "What an account is for"
              with the three features. Bottom card: "On the books today" with
              the statistics and the security note at its foot. The column is
              still `h-full` with the features card taking `flex-1`, so the
              pair of columns keep ending flush — the property the previous
              round existed to win stays won, just across two plates. */}
          {/* The aside is gone as a wrapper — its two plates are grid cells in
              their own right now, which is what lets each pair with the block
              opposite. */}
            {/* Aesthetics item 2: whisper grain — the account plate reads as
                paper. `relative` is the grain's host duty. */}
          <div className="cd-plate rj-grain relative flex flex-col overflow-hidden rounded-card p-phi4 shadow-lift lg:col-start-2 lg:row-start-1 lg:p-phi5">
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
              <div className="cd-plate flex flex-col overflow-hidden rounded-card p-phi4 shadow-lift lg:col-start-2 lg:row-start-2 lg:p-phi5">
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
        </div>
      </Container>
    </section>
  );
}
