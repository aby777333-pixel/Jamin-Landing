"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { currentRef } from "@/lib/attribution";

/**
 * BOOK A SITE VISIT, FROM THE PLOT ITSELF (owner, 2026-08-21: "give an option
 * to book the site, when clicked, name phone and email, submit, which adds to
 * the admin in its respective area").
 *
 * The plot record is where a buyer decides they want THIS plot, so the request
 * leaves from there carrying the plot number — rather than sending them down
 * the page to a form that has forgotten which plot they were looking at.
 *
 * 🚨 IT WRITES THROUGH `website_enquiry` (0078), NOT `website_book_visit`
 * (0079), AND THE CHOICE IS ABOUT HONESTY RATHER THAN CONVENIENCE. The visit
 * RPC books a real APPOINTMENT: it demands a date and one of a fixed set of
 * slot labels, and it writes a `site_visits` row with a scheduled time and a
 * reference the desk then has to honour. This form asks for three fields. To
 * push it through that RPC we would have to invent a date the visitor never
 * chose — which puts a slot in the desk's diary that nobody agreed to and
 * hands the visitor a reference for an appointment that does not exist.
 *
 * `website_enquiry` is the pipeline for exactly this: a named person who wants
 * to be called back about a specific property. It writes a `leads` row with
 * `source = 'website'` and `status = 'new'`, which is the queue the desk works
 * from — so the request lands in the admin console with the rest of the demand
 * rather than in a second list nobody watches. The plot number rides in the
 * notes, and `campaign` is tagged `plot-visit` so these are filterable apart
 * from a general enquiry.
 *
 * ⚠️ The RPC does its own validation, de-duplication (the same number on the
 * same property inside ten minutes is accepted and quietly dropped) and rate
 * limiting (six in an hour). None of that is repeated here: a second copy of a
 * rule is a second chance to get it wrong. This form only reports what the RPC
 * says back, and its "already_received" note is treated as success — because
 * from the visitor's side it is: the desk has their request.
 */
export function PlotVisitForm({
  propertyId,
  propertyTitle,
  plot,
}: {
  /** Null on a project whose page did not pass one — the control then hides
   *  rather than submitting a request with nothing to attach it to. */
  propertyId?: string | null;
  propertyTitle: string;
  plot: string;
}) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  if (!propertyId) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("website_enquiry", {
        p_name: name,
        p_mobile: mobile,
        p_email: email || null,
        p_property: propertyId,
        p_message: `Site visit requested for plot ${plot} at ${propertyTitle}.`,
        p_ref: currentRef(),
        p_source_url: typeof window !== "undefined" ? window.location.href : null,
        /* Tagged so the desk can tell a plot-level visit request apart from a
           general enquiry on the same development. */
        p_campaign: "plot-visit",
        p_consent: true,
      });
      if (rpcError) throw new Error(rpcError.message);
      const res = data as { ok: boolean; error?: string };
      if (!res?.ok) throw new Error(res?.error ?? "Please check the details and try again.");
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send that. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="mt-2 rounded-card border border-canopy bg-canopy-soft/60 p-phi3 text-base leading-relaxed text-ink">
        Thank you — your visit request for plot {plot} is with our desk. Somebody will call you to
        agree a day and a time. No payment, no obligation.
      </div>
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 flex w-full justify-center rounded-full bg-jamin-red px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep"
      >
        Book a site visit
      </button>
    );
  }

  const field =
    "w-full rounded-card border border-line bg-canvas px-phi2 py-2.5 text-base text-ink outline-none transition-colors focus:border-jamin-gold";

  return (
    <form onSubmit={submit} className="mt-2 rounded-card border border-line bg-canvas-alt p-phi3">
      <p className="text-tiny font-semibold uppercase tracking-brand text-jamin-gold-ink">
        Book a site visit · plot {plot}
      </p>
      <div className="mt-phi2 space-y-2">
        <div>
          <label htmlFor={`pv-name-${plot}`} className="sr-only">
            Your name
          </label>
          <input
            id={`pv-name-${plot}`}
            required
            autoComplete="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your name"
            className={field}
          />
        </div>
        <div>
          <label htmlFor={`pv-mobile-${plot}`} className="sr-only">
            Mobile number
          </label>
          {/* `inputMode="numeric"` and a ten-digit hint, because the RPC wants
              an Indian mobile and says so plainly when it does not get one. */}
          <input
            id={`pv-mobile-${plot}`}
            required
            inputMode="numeric"
            autoComplete="tel-national"
            value={mobile}
            onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
            placeholder="10-digit mobile"
            className={`ledger ${field}`}
          />
        </div>
        <div>
          <label htmlFor={`pv-email-${plot}`} className="sr-only">
            Email (optional)
          </label>
          <input
            id={`pv-email-${plot}`}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email (optional)"
            className={field}
          />
        </div>
      </div>

      {error && (
        <p role="alert" className="mt-phi2 text-tiny leading-relaxed text-jamin-red-deep">
          {error}
        </p>
      )}

      <div className="mt-phi2 flex items-center gap-2">
        <button
          type="submit"
          disabled={busy}
          className="flex-1 rounded-full bg-jamin-red px-5 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-50"
        >
          {busy ? "Sending…" : "Request visit"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-full border border-line px-4 py-2.5 text-tiny font-semibold uppercase tracking-[0.12em] text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
        >
          Cancel
        </button>
      </div>

      <p className="mt-phi2 text-tiny leading-relaxed text-ink-faint">
        We will call to agree the day and time. A request is not yet a confirmed appointment.
      </p>
    </form>
  );
}
