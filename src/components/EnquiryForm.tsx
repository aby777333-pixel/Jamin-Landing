"use client";

import { SurveyIcon } from "@/components/cadastral/SurveyIcon";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { captureAttribution, currentCampaign, currentRef } from "@/lib/attribution";

/**
 * Enquiry capture (§39, §92, §93).
 *
 * Short on purpose: a name, a number, and optionally what they are after.
 * §92 warns against asking for KYC before somebody can ask a basic question,
 * and every extra field costs conversions at the exact moment interest is
 * highest.
 *
 * The write goes through `website_enquiry`, an RPC that validates, resolves
 * attribution itself and de-duplicates. `leads` has no insert grant for anon,
 * so this is the only way in and a promoter id cannot be forged from the
 * browser.
 *
 * §93: a failed submission never clears the form.
 */
export function EnquiryForm({
  propertyId,
  propertyTitle,
  compact,
}: {
  propertyId?: string;
  propertyTitle?: string;
  compact?: boolean;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    captureAttribution();
  }, []);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("website_enquiry", {
        p_name: name,
        p_mobile: mobile,
        p_email: email || null,
        p_property: propertyId ?? null,
        p_message: message || null,
        p_ref: currentRef(),
        p_source_url: typeof window !== "undefined" ? window.location.href : null,
        p_campaign: currentCampaign(),
        p_consent: consent,
      });
      if (rpcError) throw new Error(rpcError.message);
      const res = data as { ok: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error ?? "Please check the details and try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="relative overflow-hidden rounded-card border border-canopy bg-canopy-soft p-phi3">
        {/* The seal, struck once. `rj-foil-seal` is the text-bearing foil ramp —
            the same one the DTCP chip uses — and `rj-stamp` presses it on
            arrival. `aria-hidden`: the heading beside it already says the thing
            in words, and a screen reader has no use for a picture of a stamp. */}
        <span
          aria-hidden="true"
          className="rj-foil-seal rj-stamp pointer-events-none absolute -right-2 -top-2 flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full text-champagne-900 opacity-90"
        >
          <SurveyIcon name="stamp" size="h-7 w-7" />
        </span>
        <h3 className="text-xl text-canopy">Thank you — we have it.</h3>
        <p className="mt-phi2 text-base leading-relaxed text-ink-soft">
          Someone from the Jamin desk will call you
          {propertyTitle ? ` about ${propertyTitle}` : ""}. If it is urgent, calling us is faster
          than waiting for us to call you.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink outline-none focus:border-ink-faint";

  return (
    <form onSubmit={submit} className="space-y-phi2">
      <div className={compact ? "" : "grid gap-phi2 sm:grid-cols-2"}>
        <div>
          <label htmlFor="eq-name" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            Your name
          </label>
          <input
            id="eq-name"
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </div>
        <div className={compact ? "mt-phi2" : ""}>
          <label htmlFor="eq-mobile" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            Mobile
          </label>
          <div className="flex items-center gap-2">
            <span className="rounded-card border border-line bg-canvas-alt px-2.5 py-2.5 text-base text-ink-muted">
              +91
            </span>
            <input
              id="eq-mobile"
              required
              inputMode="numeric"
              autoComplete="tel-national"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98765 43210"
              className={field}
            />
          </div>
        </div>
      </div>

      <div>
        <label htmlFor="eq-email" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
          Email <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id="eq-email"
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className={field}
        />
      </div>

      <div>
        <label htmlFor="eq-msg" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
          What are you looking for? <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id="eq-msg"
          rows={compact ? 2 : 3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={
            propertyTitle
              ? `Anything you want to know about ${propertyTitle}`
              : "District, extent, and roughly when you want to build"
          }
          className={field}
        />
      </div>

      <label className="flex items-start gap-2.5 text-tiny leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          You may contact me about this enquiry and about matching Jamin developments. We do not
          share your number with anyone else.
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
        className="w-full rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-50"
      >
        {busy ? "Sending…" : propertyTitle ? "Ask about this development" : "Request a call back"}
      </button>
    </form>
  );
}
