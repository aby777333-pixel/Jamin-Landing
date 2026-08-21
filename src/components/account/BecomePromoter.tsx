"use client";

import { useEffect, useState } from "react";
import { AccountShell } from "./AccountShell";
import { Badge, Skeleton } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { browserClient } from "@/lib/supabase-browser";

/**
 * Become a Jamin promoter — the information, then the application.
 *
 * 🚨 SUBMITTING DOES NOT MAKE ANYBODY A PROMOTER, and that is the owner's
 * explicit instruction (2026-08-21 §3): "Submitting an application should not
 * immediately convert the account into a Promoter account. The application must
 * first appear in the Admin Panel for verification and approval."
 *
 * So this page writes ONE row into `promoter_applications` with status
 * 'pending' and stops. The role is granted only by
 * `admin_review_promoter_application`, which is SECURITY DEFINER and refuses
 * anybody who is not a super admin. The RLS insert policy pins both halves —
 * `user_id = auth.uid()` AND `status = 'pending'` — so an applicant cannot post
 * themselves an approved row and skip the desk. The client is not trusted here
 * and does not need to be.
 *
 * ⚠️ NO COMMISSION NUMBERS APPEAR ON THIS PAGE. The rates are configurable per
 * deployment (admin → Bazaar → Direct Sales Income, and Earnings → commission
 * rates), so any figure hard-coded here would be a promise the engine has not
 * agreed to — and it would be read as one by somebody deciding whether to sign
 * up. The STRUCTURE is described because that is fixed and true; the rates are
 * stated to come from the desk in writing, because that is where they live.
 */
export function BecomePromoter() {
  const { session, profile } = useAuth();
  const uid = session?.user?.id;

  const [existing, setExisting] = useState<
    { status: string; review_reason: string | null; created_at: string } | null | undefined
  >(undefined); // undefined = still loading, null = none on file

  useEffect(() => {
    if (!uid) return;
    let alive = true;
    (async () => {
      const { data } = await browserClient()
        .from("promoter_applications")
        .select("status, review_reason, created_at")
        .order("created_at", { ascending: false })
        .limit(1);
      if (!alive) return;
      setExisting((data?.[0] as typeof existing) ?? null);
    })();
    return () => {
      alive = false;
    };
  }, [uid]);

  return (
    <AccountShell title="Become a promoter">
      <Intro />

      {existing === undefined ? (
        <div className="mt-phi4 space-y-3">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : existing && existing.status === "pending" ? (
        <Pending at={existing.created_at} />
      ) : (
        <>
          {existing?.status === "rejected" && <PreviouslyDeclined reason={existing.review_reason} />}
          <Terms />
          {/* 🚨 THE KEY IS THE SEEDING MECHANISM. The form initialises its
              fields from the profile, and a `useState` initialiser runs once —
              so a profile that arrives after mount would leave the fields
              blank. Re-keying on the profile id remounts the form with the
              real values instead.

              ⚠️ It is NOT an effect that calls setState, which was the first
              version and is what `react-hooks/set-state-in-effect` exists to
              catch: seeding four fields that way costs a second render pass on
              every mount, and the guard against clobbering typed input has to
              be written by hand in each setter. Remounting says the same thing
              in one word and cannot half-apply.

              In practice the profile is always present by the time this
              renders — the form appears only after the application lookup has
              returned, and that needs `uid`. The key is what makes it correct
              rather than merely likely. */}
          <ApplicationForm
            key={profile?.id ?? "anon"}
            uid={uid ?? ""}
            profile={profile}
            onSent={() =>
              setExisting({
                status: "pending",
                review_reason: null,
                created_at: new Date().toISOString(),
              })
            }
          />
        </>
      )}
    </AccountShell>
  );
}

/* ---------- the information the owner asked to be shown ---------- */

function Intro() {
  return (
    <>
      <section className="rounded-card border border-line bg-canvas-alt p-phi3">
        <h2 className="text-xl text-ink">What a Jamin promoter does</h2>
        <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
          A promoter introduces buyers to Jamin developments and is credited when one of those
          introductions completes a purchase. You keep the same account you are signed into now —
          the same phone number, the same profile, the same history — with the promoter tools added
          to it.
        </p>
      </section>

      <div className="mt-phi3 grid gap-phi3 sm:grid-cols-2">
        <Card title="What you get">
          <List
            items={[
              "A digital visiting card with your own referral code, shareable by link or WhatsApp",
              "Your own share links for any development — the visit, the enquiry and the sale are attributed to you",
              "A leads desk showing every enquiry that came through your code",
              "Your network, level by level, as it grows",
              "A wallet and income ledger reading the same records the desk sees",
            ]}
          />
        </Card>

        <Card title="What is expected of you">
          <List
            items={[
              "Represent projects accurately — quote only what is on the approved plan and the listing",
              "Never promise a price, a date or an approval that Jamin has not confirmed in writing",
              "Pass a buyer's details on only with their consent",
              "Keep your KYC current",
              "Behave, in front of a buyer, as the company would",
            ]}
          />
        </Card>

        <Card title="Who can apply">
          <List
            items={[
              "18 or over, with a valid Indian mobile number already verified on this account",
              "A PAN and one address proof for KYC",
              "A bank account in your own name for payouts",
              "No prior Jamin promoter account — one person, one account",
            ]}
          />
        </Card>

        <Card title="How you earn">
          <p className="text-base leading-relaxed text-ink-muted">
            Two streams, both paid on <em>recorded, completed</em> sales:
          </p>
          <List
            items={[
              "Direct sales income — a percentage of a sale you brought in yourself",
              "Referral income — a percentage from sales made by promoters in your team, by level",
            ]}
          />
          {/* ⚠️ Honest about the lock, because a promoter who does not know about
              it reads a zero balance as the engine being broken. */}
          <p className="mt-phi2 text-tiny leading-relaxed text-ink-muted">
            Referral income can be held until your own first direct sale, depending on the settings
            in force. Levels and designations advance on real recorded sales, never on signups
            alone.
          </p>
          <p className="mt-phi2 text-tiny leading-relaxed text-ink-muted">
            <strong className="text-ink-soft">The current rates are given to you in writing when
            your application is approved.</strong>{" "}
            They are set by the desk and can change, so no percentage is printed on this page — your
            wallet only ever shows what has actually been credited.
          </p>
        </Card>
      </div>

      <section className="mt-phi3 rounded-card border border-line bg-canvas p-phi3">
        <h2 className="text-xl text-ink">Verification, and what the badge means</h2>
        <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
          Approval gives you promoter access. The{" "}
          <Badge tone="canopy">✓ Verified Jamin Partner</Badge> badge is separate and comes later,
          once your KYC documents — PAN, address proof and bank details — are approved. Both steps
          exist because a buyer meeting you should be able to tell the difference between someone
          who has signed up and someone Jamin has checked.
        </p>
      </section>

      <section className="mt-phi3 rounded-card border border-line bg-canvas p-phi3">
        <h2 className="text-xl text-ink">How the application goes</h2>
        <ol className="mt-phi2 space-y-2 text-base leading-relaxed text-ink-muted">
          {[
            "You submit the form below. Nothing changes on your account yet.",
            "It reaches the Jamin desk, where a super admin reviews it.",
            "You are notified either way. If approved, your promoter tools appear in this account immediately.",
            "You complete KYC in the app to earn the Verified badge and enable payouts.",
          ].map((s, i) => (
            <li key={s} className="flex gap-3">
              <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-canvas-sunken text-tiny font-semibold text-ink-soft">
                {i + 1}
              </span>
              <span>{s}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}

function Terms() {
  return (
    <section className="mt-phi3 rounded-card border border-line bg-canvas-alt p-phi3">
      <h2 className="text-xl text-ink">Terms in short</h2>
      <List
        items={[
          "A promoter is an independent introducer, not an employee or an agent of Jamin Properties, and may not sign or accept anything on the company's behalf.",
          "Commission is earned on completed, recorded sales, and is reversed if a sale is cancelled or refunded.",
          "Payouts require approved KYC and a bank account in your own name.",
          "Buyer details obtained through Jamin are used for Jamin business only.",
          "Misrepresenting a project, a price or an approval ends the arrangement.",
          "Jamin may decline or withdraw promoter access, and may change the rates in force with notice.",
        ]}
      />
    </section>
  );
}

/* ---------- states ---------- */

function Pending({ at }: { at: string }) {
  return (
    <section className="mt-phi4 rounded-card border border-champagne-500 bg-canvas-alt p-phi3">
      <Badge tone="gold">Under review</Badge>
      <h2 className="mt-phi2 text-xl text-ink">Your application is with the desk</h2>
      <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
        Submitted{" "}
        {new Date(at).toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        . A super admin reviews each application by hand, so this is not instant. You will be
        notified as soon as it is decided, and your promoter tools will appear here the moment it is
        approved — you do not need to check back.
      </p>
    </section>
  );
}

function PreviouslyDeclined({ reason }: { reason: string | null }) {
  return (
    <section className="mt-phi4 rounded-card border border-line bg-canvas-alt p-phi3">
      <Badge tone="red">Previously declined</Badge>
      <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
        {reason
          ? `The desk's note: ${reason}`
          : "Your last application was not approved. You are welcome to apply again."}
      </p>
    </section>
  );
}

/* ---------- the form ---------- */

function ApplicationForm({
  uid,
  profile,
  onSent,
}: {
  uid: string;
  profile: { full_name: string | null; mobile: string | null; email: string | null; city: string | null } | null;
  onSent: () => void;
}) {
  /* ⚠️ Seeded from the profile once, at mount, and then EDITABLE. The desk
     reviews what the applicant actually wrote, and a profile with a stale city
     should not silently become part of an application they never read. */
  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [mobile, setMobile] = useState(profile?.mobile ?? "");
  const [email, setEmail] = useState(profile?.email ?? "");
  const [city, setCity] = useState(profile?.city ?? "");
  const [occupation, setOccupation] = useState("");
  const [experience, setExperience] = useState("");
  const [motivation, setMotivation] = useState("");
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy || !uid) return;
    setBusy(true);
    setError(null);
    try {
      const { error: insErr } = await browserClient().from("promoter_applications").insert({
        user_id: uid,
        full_name: fullName.trim(),
        mobile: mobile.trim(),
        email: email.trim() || null,
        city: city.trim() || null,
        occupation: occupation.trim() || null,
        experience: experience.trim() || null,
        motivation: motivation.trim() || null,
        consent,
        status: "pending",
      });
      if (insErr) {
        /* The partial unique index is the guard against a double tap. Say what
           it means rather than leaking the constraint name. */
        throw new Error(
          insErr.code === "23505"
            ? "You already have an application with the desk."
            : insErr.message,
        );
      }
      onSent();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  const field =
    "w-full rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink outline-none focus:border-ink-faint";

  return (
    <section className="mt-phi3 rounded-card border border-line bg-canvas p-phi3">
      <h2 className="text-xl text-ink">Apply</h2>
      <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
        Your account keeps its identity — this adds the promoter role to it once the desk approves.
      </p>

      {/* ⚠️ `bp-` prefixes throughout: the account pages can carry other forms,
          and a duplicate id sends a <label for> to the wrong input. */}
      <form onSubmit={submit} aria-busy={busy} className="mt-phi3 space-y-phi2">
        <div className="grid gap-phi2 sm:grid-cols-2">
          <div>
            <label htmlFor="bp-name" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
              Full name
            </label>
            <input
              id="bp-name"
              required
              autoComplete="name"
              enterKeyHint="next"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="bp-mobile" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
              Mobile
            </label>
            <input
              id="bp-mobile"
              required
              inputMode="numeric"
              autoComplete="tel"
              enterKeyHint="next"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 12))}
              className={field}
            />
          </div>
        </div>

        <div className="grid gap-phi2 sm:grid-cols-2">
          <div>
            <label htmlFor="bp-email" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
              Email <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="bp-email"
              type="email"
              inputMode="email"
              autoComplete="email"
              enterKeyHint="next"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>
          <div>
            <label htmlFor="bp-city" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
              Town or city
            </label>
            <input
              id="bp-city"
              autoComplete="address-level2"
              enterKeyHint="next"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className={field}
            />
          </div>
        </div>

        <div>
          <label htmlFor="bp-occupation" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            What you do <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id="bp-occupation"
            enterKeyHint="next"
            value={occupation}
            onChange={(e) => setOccupation(e.target.value)}
            placeholder="Business, salaried, agent, retired…"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="bp-exp" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            Any property experience? <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <textarea
            id="bp-exp"
            rows={2}
            enterKeyHint="next"
            value={experience}
            onChange={(e) => setExperience(e.target.value)}
            placeholder="Years in the trade, areas you know well, or none at all — both are fine"
            className={field}
          />
        </div>

        <div>
          <label htmlFor="bp-why" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            Why you want to promote Jamin
          </label>
          <textarea
            id="bp-why"
            required
            rows={3}
            enterKeyHint="done"
            value={motivation}
            onChange={(e) => setMotivation(e.target.value)}
            className={field}
          />
        </div>

        {/* ⚠️ Unchecked by default and `required`, unlike the enquiry form's
            contact consent. That one is a preference; this is agreement to the
            terms above, and a pre-ticked box is not agreement. */}
        <label className="flex items-start gap-2.5 text-tiny leading-relaxed text-ink-muted">
          <input
            type="checkbox"
            required
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            I have read the terms above, the details I have given are true, and I understand that
            submitting this does not make me a promoter until Jamin approves it.
          </span>
        </label>

        {error && (
          <p role="alert" className="rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-50 sm:w-auto"
        >
          {busy ? "Sending…" : "Submit application"}
        </button>
      </form>
    </section>
  );
}

/* ---------- small pieces ---------- */

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-canvas p-phi3">
      <h2 className="text-xl text-ink">{title}</h2>
      <div className="mt-phi2">{children}</div>
    </section>
  );
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2 text-base leading-relaxed text-ink-muted">
      {items.map((t) => (
        <li key={t} className="flex gap-2.5">
          <span aria-hidden="true" className="mt-[0.55em] h-1 w-1 shrink-0 rounded-full bg-champagne-500" />
          <span>{t}</span>
        </li>
      ))}
    </ul>
  );
}
