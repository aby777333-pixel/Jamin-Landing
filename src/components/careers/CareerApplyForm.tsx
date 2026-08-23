"use client";

import { useEffect, useState } from "react";
import type { CSSProperties } from "react";
import { supabase } from "@/lib/supabase";
import { captureAttribution, currentRef } from "@/lib/attribution";
import { SurveyIcon } from "@/components/cadastral/SurveyIcon";

/**
 * The job application (owner 2026-08-23).
 *
 * ⚠️ A DELIBERATE SIBLING OF `EnquiryForm`, NOT A REUSE OF IT. The two look
 * alike and are not the same object: `EnquiryForm` writes a `leads` row through
 * `website_enquiry`, and `leads` is the SALES pipeline — promoter attribution,
 * a lead_status enum, dashboard counts, the commission trail. Migration 0093
 * spells out why a jobseeker must not land there. Bending `EnquiryForm` into
 * doing both would have meant one component with two write paths and a prop
 * deciding which, which is exactly how somebody later files an applicant as a
 * lead.
 *
 * What it does share is the contract, because that part IS audited: the RPC
 * validates server-side and returns `{ok:false,error}` rather than raising, and
 * §93's rule holds — a failed submission never clears the form.
 */
export function CareerApplyForm({
  roleKey,
  roleLabel,
  stone,
  cta,
  idPrefix,
}: {
  roleKey: string;
  roleLabel: string;
  /** The role's fill, for the submit button and the focus ring. */
  stone: string;
  cta: string;
  /**
   * 🚨 REQUIRED, AND THERE IS NO DEFAULT ON PURPOSE. Eleven of these render
   * into the page at once (one per tab panel, all in the DOM so a crawler sees
   * them). A shared literal would emit eleven sets of duplicate field ids, and
   * `<label for>` binds to the FIRST match in the document — every "Your name"
   * label on the page would focus the promoter tab's input. `EnquiryForm`
   * already records this failure; here it is eleven-fold rather than double, so
   * the prop is not optional.
   */
  idPrefix: string;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [city, setCity] = useState("");
  const [experience, setExperience] = useState("");
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
      const { data, error: rpcError } = await supabase.rpc("website_career_apply", {
        p_role_key: roleKey,
        p_role_label: roleLabel,
        p_name: name,
        p_mobile: mobile,
        p_email: email || null,
        p_city: city || null,
        p_experience: experience || null,
        p_message: message || null,
        p_ref: currentRef(),
        p_source_url: typeof window !== "undefined" ? window.location.href : null,
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
        <span
          aria-hidden="true"
          className="rj-foil-seal rj-stamp pointer-events-none absolute -right-2 -top-2 flex h-16 w-16 rotate-[8deg] items-center justify-center rounded-full text-champagne-900 opacity-90"
        >
          <SurveyIcon name="stamp" size="h-7 w-7" />
        </span>
        <h4 className="text-xl text-canopy">Thank you — we have it.</h4>
        <p className="mt-phi2 text-base leading-relaxed text-ink-soft">
          Your application for {roleLabel} is with the Jamin desk. If it is a fit, somebody will
          call you on the number you gave us.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink outline-none focus:border-ink-faint";
  const lab = "mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint";

  return (
    <form
      onSubmit={submit}
      aria-busy={busy}
      className="space-y-phi2"
      style={{ "--stone": stone } as CSSProperties}
    >
      <div className="grid gap-phi2 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-name`} className={lab}>
            Your name
          </label>
          <input
            id={`${idPrefix}-name`}
            required
            autoComplete="name"
            enterKeyHint="next"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`${idPrefix}-mobile`} className={lab}>
            Mobile
          </label>
          <div className="flex items-center gap-2">
            <span className="rounded-card border border-line bg-canvas-alt px-2.5 py-2.5 text-base text-ink-muted">
              +91
            </span>
            <input
              id={`${idPrefix}-mobile`}
              required
              inputMode="numeric"
              autoComplete="tel-national"
              enterKeyHint="next"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              placeholder="98765 43210"
              className={field}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-phi2 sm:grid-cols-2">
        <div>
          <label htmlFor={`${idPrefix}-email`} className={lab}>
            Email <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-email`}
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
          <label htmlFor={`${idPrefix}-city`} className={lab}>
            Town or district <span className="normal-case tracking-normal">(optional)</span>
          </label>
          <input
            id={`${idPrefix}-city`}
            autoComplete="address-level2"
            enterKeyHint="next"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Erode"
            className={field}
          />
        </div>
      </div>

      <div>
        <label htmlFor={`${idPrefix}-exp`} className={lab}>
          Experience <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <input
          id={`${idPrefix}-exp`}
          enterKeyHint="next"
          value={experience}
          onChange={(e) => setExperience(e.target.value)}
          placeholder="Years, and what you did"
          className={field}
        />
      </div>

      <div>
        <label htmlFor={`${idPrefix}-msg`} className={lab}>
          Anything you want us to know{" "}
          <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id={`${idPrefix}-msg`}
          rows={3}
          enterKeyHint="done"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What you are good at, and what you would want to do here"
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
          You may contact me about this application and about other openings at Jamin Bazaar. We do
          not share your number with anyone else.
        </span>
      </label>

      {error && (
        <p
          role="alert"
          className="rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep"
        >
          {error}
        </p>
      )}

      {/* ⚠️ THE ROLE'S STONE, WHITE TYPE, AND THAT PAIRING IS THE REASON THE
          eleven stones were picked against white in the first place — see the
          ratio note in `career-roles.ts`. Vermilion is the floor at 4.64:1 and
          this label is small uppercase, so it is the one that had to clear.
          `backgroundColor`, never the `background` shorthand: the shorthand
          resets `background-image` and this button carries a sheen. */}
      <button
        type="submit"
        disabled={busy}
        style={{ backgroundColor: stone }}
        className="w-full rounded-full px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-300 [transition-timing-function:var(--ease-silk)] hover:-translate-y-0.5 hover:shadow-raise focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color:var(--stone)] disabled:opacity-50"
      >
        {busy ? "Sending…" : cta}
      </button>
    </form>
  );
}
