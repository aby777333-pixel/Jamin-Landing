"use client";

import { useState } from "react";
import { AccountShell } from "./AccountShell";
import { Badge, EmptyState, ButtonLink } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { cardLink, inviteLink, isPartner, isVerifiedPartner } from "@/lib/partner";

/**
 * The partner's share kit.
 *
 * The card and invite pages themselves are served by the app's own site, so a
 * link copied here is byte-for-byte the link shared from the phone — one
 * public card per partner, not a second one that drifts.
 */
export function PartnerCard() {
  const { profile } = useAuth();
  const [copied, setCopied] = useState<string | null>(null);

  if (!isPartner(profile)) {
    return (
      <AccountShell title="Digital card">
        <EmptyState
          title="Partners only"
          body="A digital Jamin card is issued when you join as a partner."
          action={<ButtonLink href="/account/partner" variant="secondary">Back to partner</ButtonLink>}
        />
      </AccountShell>
    );
  }

  const code = profile?.partner_code || profile?.referral_code || profile?.member_code || "";
  const refCode = profile?.referral_code || profile?.partner_code || code;
  const verified = isVerifiedPartner(profile);

  async function copy(label: string, text: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(label);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      setCopied("Could not copy — select the text instead");
    }
  }

  const links: { label: string; url: string; note: string }[] = [
    { label: "Your digital card", url: cardLink(code), note: "Photo, verified badge, one-tap call and WhatsApp, QR." },
    { label: "Your invite link", url: inviteLink(refCode), note: "Anyone who signs up through this is credited to you." },
  ];

  return (
    <AccountShell title="Digital card">
      <div className="rounded-card border border-line bg-canvas-alt p-phi3">
        <div className="flex flex-wrap items-center gap-3">
          {verified ? <Badge tone="canopy">✓ Verified Jamin Partner</Badge> : <Badge tone="gold">Verification pending</Badge>}
          <span className="text-base text-ink">{code || "—"}</span>
        </div>
        {!verified && (
          <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
            Your card works now, but it shows the verified check only once KYC has been approved.
            The badge is earned, so we never display it early.
          </p>
        )}
      </div>

      <div className="mt-phi4 space-y-phi3">
        {links.map((l) => (
          <div key={l.label} className="rounded-card border border-line bg-canvas p-phi3">
            <div className="text-lg text-ink">{l.label}</div>
            <p className="mt-1 text-base text-ink-muted">{l.note}</p>
            <div className="mt-phi2 flex flex-wrap items-center gap-2">
              <code className="min-w-0 flex-1 truncate rounded-card bg-canvas-sunken px-3 py-2 text-tiny text-ink-soft">
                {l.url}
              </code>
              <button
                onClick={() => copy(l.label, l.url)}
                className="rounded-full border border-line bg-canvas px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
              >
                Copy
              </button>
              <a
                href={l.url}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line bg-canvas px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
              >
                Open
              </a>
              <a
                href={`https://wa.me/?text=${encodeURIComponent(`${profile?.full_name ?? "Jamin Partner"} · Jamin Bazaar\n${l.url}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="rounded-full border border-line bg-canvas px-4 py-2 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
              >
                WhatsApp
              </a>
            </div>
          </div>
        ))}
      </div>

      {copied && (
        <p role="status" className="mt-phi3 text-base text-canopy">
          {copied.startsWith("Could not") ? copied : `${copied} copied.`}
        </p>
      )}

      <p className="mt-phi4 text-tiny leading-relaxed text-ink-muted">
        Your photo, designation and contact details on the card are edited in the Jamin Bazaar app.
        A card without a professional photograph cannot be shared from the app, and that rule is
        the app&rsquo;s — this page simply points at the same card.
      </p>
    </AccountShell>
  );
}
