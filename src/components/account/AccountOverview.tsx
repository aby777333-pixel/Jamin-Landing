"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { Badge, ButtonLink } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { browserClient } from "@/lib/supabase-browser";
import { fetchShortlistIds } from "@/lib/shortlist";

/**
 * The overview only reports what the database actually says. There is no
 * fabricated activity feed and no progress ring over features the website does
 * not have yet — an honest short page beats a padded one.
 */
export function AccountOverview() {
  const { session, profile } = useAuth();
  const uid = session?.user?.id;
  const [counts, setCounts] = useState<{ saved: number; visits: number } | null>(null);

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    (async () => {
      try {
        const [ids, visits] = await Promise.all([
          fetchShortlistIds(uid),
          browserClient()
            .from("site_visits")
            .select("id", { count: "exact", head: true })
            .eq("buyer_id", uid),
        ]);
        if (alive) setCounts({ saved: ids.length, visits: visits.count ?? 0 });
      } catch {
        if (alive) setCounts({ saved: 0, visits: 0 });
      }
    })();
    return () => {
      alive = false;
    };
  }, [uid]);

  const kyc = profile?.kyc_status ?? "not_started";
  const kycLabel: Record<string, string> = {
    not_started: "Not started",
    pending: "Under review",
    submitted: "Under review",
    approved: "Verified",
    rejected: "Needs attention",
  };

  return (
    <AccountShell title="Overview">
      <div className="grid gap-phi3 sm:grid-cols-2">
        <Tile
          label="Saved developments"
          value={counts ? String(counts.saved) : "—"}
          href="/account/shortlist"
          cta="Open shortlist"
        />
        <Tile
          label="Site visits"
          value={counts ? String(counts.visits) : "—"}
          href="/account/visits"
          cta="See visits"
        />
      </div>

      <section className="mt-phi4 rounded-card border border-line bg-canvas-alt p-phi3">
        <h2 className="text-xl text-ink">Your details</h2>
        <dl className="mt-phi3 divide-y divide-line border-y border-line">
          <Row label="Name" value={profile?.full_name || "—"} />
          <Row label="Mobile" value={profile?.mobile ? `+${profile.mobile}` : "—"} />
          <Row label="Email" value={profile?.email || "—"} />
          <Row label="Member ID" value={profile?.member_code || "—"} />
          <div className="flex flex-wrap items-center justify-between gap-3 py-3">
            <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">KYC</dt>
            <dd>
              <Badge tone={kyc === "approved" ? "canopy" : kyc === "rejected" ? "red" : "gold"}>
                {kycLabel[kyc] ?? kyc}
              </Badge>
            </dd>
          </div>
        </dl>
        <p className="mt-phi3 text-tiny leading-relaxed text-ink-muted">
          Your details, KYC documents and referral records live in the Jamin Bazaar app. This page
          reads them; it does not change them.{" "}
          <a
            href="https://merry-begonia-4c3cd1.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="underline"
          >
            Open the app
          </a>{" "}
          to edit anything here.
        </p>
      </section>

      <section className="mt-phi4 rounded-card border border-line bg-canvas p-phi3">
        <h2 className="text-xl text-ink">Looking for something specific?</h2>
        <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
          Tell our desk the district, the extent and roughly when you want to build, and we will
          call you when something fits — including before it is listed.
        </p>
        <div className="mt-phi3 flex flex-wrap gap-2">
          <ButtonLink href="/contact">Talk to Jamin</ButtonLink>
          <ButtonLink href="/properties" variant="secondary">
            Browse properties
          </ButtonLink>
        </div>
      </section>
    </AccountShell>
  );
}

function Tile({ label, value, href, cta }: { label: string; value: string; href: string; cta: string }) {
  return (
    <div className="rounded-card border border-line bg-canvas p-phi3">
      <div className="text-tiny uppercase tracking-[0.14em] text-ink-faint">{label}</div>
      <div className="mt-1 text-3xl text-ink">{value}</div>
      <Link
        href={href}
        className="mt-phi2 inline-block text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red"
      >
        {cta} →
      </Link>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 py-3">
      <dt className="text-tiny uppercase tracking-[0.12em] text-ink-faint">{label}</dt>
      <dd className="text-base text-ink">{value}</dd>
    </div>
  );
}
