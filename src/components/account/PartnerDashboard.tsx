"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { Badge, EmptyState, ButtonLink, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import {
  fetchReferralStats,
  fetchTree,
  fetchWallet,
  inr,
  isPartner,
  isVerifiedPartner,
  type ReferralStats,
  type TreeLevel,
  type Wallet,
} from "@/lib/partner";

/**
 * The partner desk.
 *
 * Every figure is read from the app's own RPCs — nothing here recomputes a
 * commission. Where the engine has not credited anything yet the number is
 * zero and it says zero; §25 is explicit that there are to be no invented
 * earnings charts, and a promoter checking their own money is precisely the
 * person who must never be shown a flattering guess.
 */
export function PartnerDashboard() {
  const { profile } = useAuth();
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [wallet, setWallet] = useState<Wallet | null>(null);
  const [tree, setTree] = useState<TreeLevel[] | null>(null);

  const partner = isPartner(profile);
  const verified = isVerifiedPartner(profile);

  useEffect(() => {
    if (!partner) return;
    let alive = true;
    Promise.all([fetchReferralStats(), fetchWallet(), fetchTree()]).then(([s, w, t]) => {
      if (!alive) return;
      setStats(s);
      setWallet(w);
      setTree(t);
    });
    return () => {
      alive = false;
    };
  }, [partner]);

  if (!partner) {
    return (
      <AccountShell title="Partner">
        <EmptyState
          title="You are not registered as a Jamin partner"
          body="Partners share verified projects, bring buyers and earn on completed sales. Joining takes a minute in the Jamin Bazaar app — the role is granted straight away, and the Verified badge follows once KYC is approved."
          action={
            <>
              <a
                href="https://merry-begonia-4c3cd1.netlify.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white"
              >
                Become a partner
              </a>
              <ButtonLink href="/contact" variant="secondary">
                Ask about it first
              </ButtonLink>
            </>
          }
        />
      </AccountShell>
    );
  }

  const code = profile?.referral_code || profile?.partner_code || profile?.member_code || null;
  const downline = (tree ?? []).reduce((n, l) => n + l.users, 0);

  return (
    <AccountShell title="Partner desk">
      {/* verification state — never implied, always stated */}
      <div className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-canvas-alt p-phi3">
        {verified ? (
          <>
            <Badge tone="canopy">✓ Verified Jamin Partner</Badge>
            {profile?.partner_code && (
              <span className="text-base text-ink-muted">{profile.partner_code}</span>
            )}
          </>
        ) : (
          <>
            <Badge tone="gold">Verification pending</Badge>
            <span className="text-base text-ink-muted">
              The Verified badge appears once your KYC has been approved in the app.
            </span>
          </>
        )}
      </div>

      <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total earned" value={wallet ? inr(wallet.total_earnings) : null} />
        <Stat label="Wallet balance" value={wallet ? inr(wallet.balance) : null} />
        <Stat label="Registrations" value={stats ? String(stats.registrations) : null} />
        <Stat label="Team members" value={tree ? String(downline) : null} />
      </div>

      <section className="mt-phi4 rounded-card border border-line bg-canvas p-phi3">
        <h2 className="text-xl text-ink">Your referral activity</h2>
        <p className="mt-phi2 text-base text-ink-muted">
          Counted from real events — a click is a real visit to your link, a registration is a real
          signup against your code.
        </p>
        <dl className="mt-phi3 grid grid-cols-2 gap-phi3 sm:grid-cols-3">
          {(
            [
              ["Link clicks", stats?.clicks],
              ["Registrations", stats?.registrations],
              ["KYC completed", stats?.kyc_completed],
              ["Enquiries", stats?.enquiries],
              ["Site visits", stats?.site_visits],
              ["Purchases", stats?.purchases],
            ] as const
          ).map(([label, v]) => (
            <div key={label}>
              <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
              <dd className="mt-1 text-2xl text-ink">
                {stats ? String(v ?? 0) : <Skeleton className="h-7 w-10" />}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      {code && (
        <section className="mt-phi4 rounded-card border border-line bg-canvas p-phi3">
          <h2 className="text-xl text-ink">Share and be credited</h2>
          <p className="mt-phi2 text-base text-ink-muted">
            Anything opened through these carries your code, so the visit, the enquiry and the
            eventual sale are attributed to you.
          </p>
          <div className="mt-phi3 flex flex-wrap gap-2">
            <Link
              href="/account/partner/card"
              className="inline-flex items-center rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white"
            >
              Your digital card
            </Link>
            <ButtonLink href="/account/partner/leads" variant="secondary">
              Your leads
            </ButtonLink>
            <ButtonLink href="/account/partner/network" variant="secondary">
              Your network
            </ButtonLink>
          </div>
        </section>
      )}

      <p className="mt-phi4 text-tiny leading-relaxed text-ink-muted">
        Withdrawals, KYC and the full income ledger are in the{" "}
        <a
          href="https://merry-begonia-4c3cd1.netlify.app/"
          target="_blank"
          rel="noopener noreferrer"
          className="underline"
        >
          Jamin Bazaar app
        </a>
        . These figures are read from the same records, so the two always agree.
      </p>
    </AccountShell>
  );
}

function Stat({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="rounded-card border border-line bg-canvas p-phi3">
      <div className="text-tiny uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div className="mt-1 text-2xl text-ink">{value ?? <Skeleton className="h-7 w-20" />}</div>
    </div>
  );
}
