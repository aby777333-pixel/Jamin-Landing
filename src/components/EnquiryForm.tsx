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
  idPrefix = "eq",
  initialMessage = "",
  submitLabel,
  campaign,
}: {
  propertyId?: string;
  propertyTitle?: string;
  compact?: boolean;
  /**
   * 🚨 REQUIRED WHENEVER A SECOND COPY OF THIS FORM IS ON THE PAGE (owner
   * 2026-08-21: the plot record's "Ask about plot N" drops this form down
   * inline, and the property page already carries one at the foot).
   *
   * Every field id here used to be a hard-coded literal — `eq-name`,
   * `eq-mobile`, `eq-email`, `eq-msg`. Two instances would therefore emit four
   * duplicate ids, and a `<label for>` resolves to the FIRST match in the
   * document: tapping "Your name" in the plot sheet would focus the field at
   * the bottom of the page, and a screen reader would read the same label
   * twice against different inputs. The prefix keeps the default markup
   * byte-identical for the single-instance case and makes the second one safe.
   */
  idPrefix?: string;
  /** Seeds "What are you looking for?" — the plot sheet opens with the plot
   *  already named, so the visitor is not asked to type what the page already
   *  knows. ⚠️ Read once, at mount: the caller keys the form per plot so a
   *  different plot remounts it rather than silently keeping the old text. */
  initialMessage?: string;
  /** Overrides the button's wording where the context is narrower than a whole
   *  development — "Ask about plot 36" rather than "Ask about this
   *  development". */
  submitLabel?: string;
  /** Tags the lead so the desk can tell a plot-level question apart from a
   *  general one. Falls back to the visitor's own campaign attribution. */
  campaign?: string;
}) {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(initialMessage);
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    captureAttribution();
  }, []);

  /* Tap-a-plot prefill (2026-08-18): MasterPlan's sheet dispatches this when
     the buyer asks about a specific plot — the two are separate client
     islands, so the message rides an event rather than a prop. Overwriting
     `message` is correct here: the dispatch IS the visitor's latest intent. */
  useEffect(() => {
    const on = (e: Event) => {
      const detail = (e as CustomEvent<unknown>).detail;
      if (typeof detail === "string") setMessage(detail);
    };
    window.addEventListener("jamin:enquiry-prefill", on);
    return () => window.removeEventListener("jamin:enquiry-prefill", on);
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
        p_campaign: campaign ?? currentCampaign(),
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
    <form
      onSubmit={submit}
      /* A screen reader hears nothing at all during the RPC — the button label
         changes to "Sending…" but nothing announces the region as busy, so the
         reader is left waiting on silence. */
      aria-busy={busy}
      className="space-y-phi2"
    >
      <div className={compact ? "" : "grid gap-phi2 sm:grid-cols-2"}>
        <div>
          <label htmlFor={`${idPrefix}-name`} className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            Your name
          </label>
          <input
            id={`${idPrefix}-name`}
            required
            autoComplete="name"
            /* The phone keyboard's action key. Without it every field offers a
               generic return; with it the reader is told whether they are
               moving on or finishing. */
            enterKeyHint="next"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={field}
          />
        </div>
        <div className={compact ? "mt-phi2" : ""}>
          <label htmlFor={`${idPrefix}-mobile`} className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
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

      <div>
        <label htmlFor={`${idPrefix}-email`} className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
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
        <label htmlFor={`${idPrefix}-msg`} className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
          What are you looking for? <span className="normal-case tracking-normal">(optional)</span>
        </label>
        <textarea
          id={`${idPrefix}-msg`}
          rows={compact ? 2 : 3}
          enterKeyHint="done"
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
        {busy ? "Sending…" : (submitLabel ?? (propertyTitle ? "Ask about this development" : "Request a call back"))}
      </button>
    </form>
  );
}
