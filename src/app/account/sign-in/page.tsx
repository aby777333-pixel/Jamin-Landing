import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/account/SignInForm";
import { Container } from "@/components/ui";
import { getNavFacets } from "@/lib/site";

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
const REASONS = [
  {
    title: "Keep a shortlist",
    body: "Save the layouts you are weighing up. The same list appears in the Jamin Bazaar app.",
  },
  {
    title: "Follow your site visits",
    body: "See the date our desk confirmed, the slot, and which development it is against.",
  },
  {
    title: "Ask Jamindar anything",
    body: "The assistant answers from live project records in the language you prefer.",
  },
];

export default async function SignInPage() {
  const facets = await getNavFacets();
  const { developments, selling, plotsAvailable } = facets.totals;

  const stats = [
    { label: "Developments", value: developments },
    { label: "Selling now", value: selling },
    { label: "Plots available", value: plotsAvailable },
    { label: "Districts", value: facets.districts.length },
  ].filter((s) => s.value > 0);

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas-alt">
      {/* The sheet the plate is drawn on. */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      <Container className="relative py-phi6 lg:py-phi7">
        <div className="grid items-start gap-phi5 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.85fr)] lg:gap-phi6">
          {/* `next` deliberately is NOT read from the query string. An open
              redirect on a sign-in page is a phishing primitive, and the only
              place a buyer needs to land afterwards is their own account. */}
          <Suspense fallback={null}>
            <SignInForm next="/account" />
          </Suspense>

          <aside className="lg:pt-phi4">
            <span className="mb-phi3 block h-px w-16 rule-red" aria-hidden="true" />
            <h2 className="text-2xl text-ink">What an account is for</h2>

            <dl className="mt-phi4 space-y-phi3">
              {REASONS.map((r) => (
                <div key={r.title} className="border-t border-line pt-phi3">
                  <dt className="text-lg text-ink">{r.title}</dt>
                  <dd className="mt-1 text-base leading-relaxed text-ink-muted">{r.body}</dd>
                </div>
              ))}
            </dl>

            {/* The document footer: what the catalogue actually contains, in the
                ledger column so the figures sit on a common pitch. */}
            {stats.length > 0 && (
              <div className="mt-phi5 rounded-card border border-line bg-canvas p-phi3">
                <div className="ledger-label">On the books today</div>
                <dl className="mt-phi2 grid grid-cols-2 gap-phi3 sm:grid-cols-4 lg:grid-cols-2">
                  {stats.map((s) => (
                    <div key={s.label} className="min-w-0">
                      <dt className="text-tiny text-ink-faint">{s.label}</dt>
                      <dd className="ledger mt-0.5 text-2xl text-ink">
                        {s.value.toLocaleString("en-IN")}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
              No password is ever set or stored. Signing in mints a one-time credential that is
              exchanged for a session immediately and never shown again.
            </p>
          </aside>
        </div>
      </Container>
    </section>
  );
}
