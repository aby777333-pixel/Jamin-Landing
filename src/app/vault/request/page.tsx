import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { VaultRequestForm } from "@/components/vault/VaultRequestForm";
import { getVaultSettings, VAULT_FALLBACK } from "@/lib/vault";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Submit a Private Requirement — The Vault | Jamin Bazaar",
  description:
    "Tell The Vault what you are looking for. Some of the finest properties never reach the open market. Private enquiries, handled personally.",
  alternates: { canonical: "/vault/request" },
  // ⚠️ A form page has nothing to rank for and everything to lose by being
  // indexed: it would compete with /vault for the same intent and give a
  // searcher a wall of fields instead of the argument for filling them in.
  robots: { index: false, follow: true },
};

/**
 * §4 — the private request concierge, given its own room.
 *
 * The form is the whole page. What sits beside it is the only thing a client
 * needs to know before writing: who reads this, and what happens next. §23's
 * "more space, more confidence" is the brief for this layout — one column of
 * fields, one column of reassurance, and nothing else competing.
 *
 * ⚠️ The page stays STATIC. The `?intent=buy` and `?where=` parameters are read
 * by the FORM through `useSearchParams`, inside the Suspense boundary below,
 * rather than from `searchParams` here — touching `searchParams` in a server
 * component opts the whole route out of the prerender, which is a heavy price
 * for two optional hints.
 */
export default async function VaultRequestPage() {
  const settings = await getVaultSettings();
  const promise = settings.promise?.length ? settings.promise : VAULT_FALLBACK.promise;

  return (
    <Container className="py-phi6">
      <Link
        href="/vault"
        className="text-tiny font-semibold uppercase tracking-[0.12em] text-ink-faint transition-colors hover:text-champagne-300"
      >
        ← The Vault
      </Link>

      <div className="mt-phi4 grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
        <div>
          <p className="rj-eyebrow text-jamin-gold-ink">Private requirement</p>
          <h1 className="mt-phi2 text-balance text-3xl text-ink lg:text-4xl">
            Tell us what you are looking for.
          </h1>
          <p className="mt-phi3 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Some of the finest properties never reach the open market. Describe what you have in
            mind and a Jamin Bazaar representative will take it from there — privately, and by
            person rather than by portal.
          </p>

          <div className="rj-fret my-phi5 max-w-xs" aria-hidden="true" />

          {/* ⚠️ REQUIRED, not defensive. The form reads `?intent=` and
              `?where=` through `useSearchParams`, and Next fails the BUILD for
              that hook outside a Suspense boundary rather than degrading at
              runtime. The fallback is the form's own height so the page does
              not jump when it arrives. */}
          <Suspense fallback={<div className="min-h-[42rem]" aria-hidden="true" />}>
            <VaultRequestForm />
          </Suspense>
        </div>

        <aside className="lg:sticky lg:self-start" style={{ top: "calc(var(--header-h) + 1.25rem)" }}>
          <div className="rounded-xl border border-line bg-canvas-alt p-phi4">
            <p className="rj-eyebrow text-jamin-gold-ink">What happens next</p>
            <ol className="mt-phi3 space-y-phi3">
              {[
                ["A person reads it", "Not a queue and not an auto-responder. The desk reads what you wrote."],
                ["We come back to you", "By whichever means you chose, to understand the requirement properly before we search."],
                ["The search begins", "Against what we hold privately, and against owners, lawyers and estate managers where we hold nothing."],
                ["You see what fits", "Only what genuinely answers the brief. We would rather report that it does not exist at the price than fill your inbox."],
              ].map(([t, d], i) => (
                <li key={t} className="border-t border-line pt-phi3 first:border-t-0 first:pt-0">
                  <p className="text-base text-ink">
                    <span className="ledger mr-2 text-ink-faint">{String(i + 1).padStart(2, "0")}</span>
                    {t}
                  </p>
                  <p className="mt-1 text-tiny leading-relaxed text-ink-muted">{d}</p>
                </li>
              ))}
            </ol>
          </div>

          <ul className="mt-phi3 space-y-2">
            {promise.slice(0, 3).map((line) => (
              <li key={line} className="text-tiny leading-relaxed text-ink-faint">
                {line}
              </li>
            ))}
          </ul>

          {settings.legal?.privacy ? (
            <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
              {settings.legal.privacy}
            </p>
          ) : null}
        </aside>
      </div>
    </Container>
  );
}
