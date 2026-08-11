import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/ui";
import { VaultOfferForm } from "@/components/vault/VaultOfferForm";
import { getVaultSettings } from "@/lib/vault";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Offer a Property to The Vault — Jamin Bazaar",
  description:
    "Offer your property privately to The Vault for sale or lease. Keep it off-market and it never appears in the public catalogue.",
  alternates: { canonical: "/vault/offer" },
  robots: { index: false, follow: true },
};

/**
 * §5 — the owner's private listing desk.
 *
 * ⚠️ THE VISIBILITY LADDER IS EXPLAINED BEFORE THE FORM, not after it. An owner
 * deciding whether to hand over photographs and title documents is deciding
 * whether to trust us with them, and the answer to "who will see this?" cannot
 * be a checkbox they meet on the way past. §6 is the argument; the checkbox is
 * only where they record it.
 */
export default async function VaultOfferPage() {
  const settings = await getVaultSettings();

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
          <p className="rj-eyebrow text-jamin-gold-ink">Private listing desk</p>
          <h1 className="mt-phi2 text-balance text-3xl text-ink lg:text-4xl">
            Have something exceptional?
          </h1>
          <p className="mt-phi3 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Offer it privately to The Vault, for sale or for lease. You decide what may be shown and
            to whom, and nothing is published until you and the desk agree it.
          </p>

          <div className="rj-fret my-phi5 max-w-xs" aria-hidden="true" />

          {/* Required by `useSearchParams` inside the form — see the note on
              the request page. */}
          <Suspense fallback={<div className="min-h-[48rem]" aria-hidden="true" />}>
            <VaultOfferForm />
          </Suspense>
        </div>

        <aside className="lg:sticky lg:self-start" style={{ top: "calc(var(--header-h) + 1.25rem)" }}>
          <div className="rounded-xl border border-champagne-500/35 bg-canvas-alt p-phi4">
            <p className="rj-eyebrow text-jamin-gold-ink">Who will see this</p>
            <ul className="mt-phi3 space-y-phi3">
              {[
                ["Public Vault", "Shown on the public page. Only ever with your agreement."],
                ["Private Vault", "Held back, and shown to verified clients whose requirement it answers."],
                ["Off-market", "Never publicly displayed. Authorised Vault administrators only, matched by hand."],
              ].map(([t, d]) => (
                <li key={t} className="border-t border-line pt-phi3 first:border-t-0 first:pt-0">
                  <p className="text-base text-ink">{t}</p>
                  <p className="mt-1 text-tiny leading-relaxed text-ink-muted">{d}</p>
                </li>
              ))}
            </ul>
            <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
              Everything you submit arrives at the off-market level. Moving it higher is a
              deliberate act by an administrator, never a side effect of this form.
            </p>
          </div>

          {settings.legal?.verification ? (
            <p className="mt-phi3 text-tiny leading-relaxed text-ink-faint">
              {settings.legal.verification}
            </p>
          ) : null}
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
