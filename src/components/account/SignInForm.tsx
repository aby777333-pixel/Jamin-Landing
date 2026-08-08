"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { SectionLabel } from "@/components/ui";
import { useAuth } from "@/lib/auth";
import { sendOtp, verifyOtp } from "@/lib/supabase-browser";

/**
 * Sign in with the mobile number the app already knows.
 *
 * This calls the app's own `send-otp` / `verify-otp` functions, so a buyer has
 * ONE Jamin account — the shortlist they save here is the shortlist they see on
 * the phone. No second user table, no second password.
 *
 * ⚠️ There is no password field anywhere by design. `verify-otp` mints a
 * one-time credential pair which is exchanged for a session immediately and
 * never shown, stored or logged.
 */
const TEN_DIGITS = /^\d{10}$/;

export function SignInForm({ next }: { next: string }) {
  const router = useRouter();
  const { loading, session } = useAuth();
  const [step, setStep] = useState<"mobile" | "code">("mobile");
  const [mobile, setMobile] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(0);
  const codeRef = useRef<HTMLInputElement>(null);

  // Already signed in? Do not make them do it again.
  useEffect(() => {
    if (!loading && session) router.replace(next);
  }, [loading, session, next, router]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  async function onSend(e?: React.FormEvent) {
    e?.preventDefault();
    const m = mobile.replace(/\D/g, "").slice(-10);
    if (!TEN_DIGITS.test(m)) {
      setError("Enter the 10-digit mobile number, without the country code.");
      return;
    }
    setBusy(true);
    setError(null);
    setNote(null);
    try {
      const res = await sendOtp(m);
      setStep("code");
      setSeconds(30);
      setNote(
        res.delivered
          ? `We sent a 6-digit code to ${m}.`
          : "Code generated. If the SMS does not arrive, our desk can confirm it for you.",
      );
      // Present only when the admin has switched on code exposure for testing;
      // it is never assumed to exist.
      if (res.devCode) setCode(res.devCode);
      setTimeout(() => codeRef.current?.focus(), 50);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send the code.");
    } finally {
      setBusy(false);
    }
  }

  async function onVerify(e?: React.FormEvent) {
    e?.preventDefault();
    const c = code.replace(/\D/g, "");
    if (c.length !== 6) {
      setError("The code is 6 digits.");
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await verifyOtp(mobile.replace(/\D/g, "").slice(-10), c);
      router.replace(next);
    } catch (err) {
      // §93 — never wipe the form on a failure.
      setError(err instanceof Error ? err.message : "That code did not work.");
    } finally {
      setBusy(false);
    }
  }

  /* A phone number and a one-time code are identifiers, so they set in the
     ledger column: tabular figures keep the digits on a fixed pitch as they are
     typed, instead of the field visibly breathing on every 1. */
  const field =
    "ledger w-full rounded-card border border-line bg-canvas px-phi3 py-3 text-lg text-ink outline-none transition-colors focus:border-jamin-gold";

  /**
   * Presentation only — every handler above is untouched. The page owns the
   * layout now, so this renders the plate contents rather than its own
   * Container; a small card centred in an empty viewport was the whole problem.
   */
  return (
    <div className="cd-plate cd-fold overflow-hidden rounded-card p-phi4 shadow-lift lg:p-phi5">
      <div>
        {/* A document header, because that is what this is: a form that opens
            a record. The rule is the one under BAZAAR in the logo. */}
        <span className="mb-phi3 block h-px w-16 rule-gold" aria-hidden="true" />
        <SectionLabel>Your Jamin account</SectionLabel>
        <h1 className="mt-phi2 text-3xl text-ink">
          {step === "mobile" ? "Sign in with your mobile" : "Enter your code"}
        </h1>
        <p className="mt-phi2 text-base leading-relaxed text-ink-muted">
          {step === "mobile"
            ? "The same account you use in the Jamin Bazaar app. No password — we send a one-time code."
            : `We sent a 6-digit code to ${mobile.replace(/\D/g, "").slice(-10)}.`}
        </p>

        {step === "mobile" ? (
          <form onSubmit={onSend} className="mt-phi4 space-y-phi2">
            <label htmlFor="mobile" className="block text-tiny uppercase tracking-[0.14em] text-ink-faint">
              Mobile number
            </label>
            <div className="flex items-center gap-2">
              <span className="rounded-card border border-line bg-canvas-alt px-3 py-3 text-lg text-ink-muted">
                +91
              </span>
              <input
                id="mobile"
                inputMode="numeric"
                autoComplete="tel-national"
                value={mobile}
                onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
                placeholder="98765 43210"
                className={field}
              />
            </div>
            <button
              type="submit"
              disabled={busy}
              className="mt-phi2 w-full rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send code"}
            </button>
          </form>
        ) : (
          <form onSubmit={onVerify} className="mt-phi4 space-y-phi2">
            <label htmlFor="code" className="block text-tiny uppercase tracking-[0.14em] text-ink-faint">
              6-digit code
            </label>
            <input
              id="code"
              ref={codeRef}
              inputMode="numeric"
              autoComplete="one-time-code"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              placeholder="••••••"
              className={`${field} tracking-[0.4em]`}
            />
            <button
              type="submit"
              disabled={busy}
              className="mt-phi2 w-full rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-50"
            >
              {busy ? "Checking…" : "Verify and sign in"}
            </button>
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                onClick={() => {
                  setStep("mobile");
                  setCode("");
                  setError(null);
                }}
                className="text-tiny font-semibold uppercase tracking-[0.12em] text-ink-faint hover:text-ink"
              >
                Change number
              </button>
              <button
                type="button"
                disabled={seconds > 0 || busy}
                onClick={() => onSend()}
                className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep disabled:text-ink-faint"
              >
                {seconds > 0 ? `Resend in ${seconds}s` : "Resend code"}
              </button>
            </div>
          </form>
        )}

        {note && !error && <p className="mt-phi3 text-base text-ink-muted">{note}</p>}
        {error && (
          <p role="alert" className="mt-phi3 rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep">
            {error}
          </p>
        )}

        <p className="mt-phi4 border-t border-line pt-phi3 text-tiny leading-relaxed text-ink-faint">
          We only use your number to reach you about property you have asked about. Read our{" "}
          <Link href="/contact" className="underline underline-offset-2 hover:text-ink">
            contact page
          </Link>{" "}
          if you would rather just talk to someone.
        </p>
      </div>
    </div>
  );
}
