"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { DaypartMark, type Daypart } from "@/components/cadastral/DaypartMark";
import { captureAttribution, currentRef } from "@/lib/attribution";

/**
 * Three fields, and the discipline is in what is NOT here.
 *
 * A callback form that also asks for a budget, a district and a property type
 * is a lead-capture form wearing a callback's clothes — and a visitor who
 * wanted to be phoned reads the fourth field as a toll. Name, number, and when
 * to call. Everything else is what the executive asks on the call.
 *
 * ⚠️ IT WRITES THROUGH `website_callback`, NOT `website_enquiry`, and that is
 * the whole point of the feature rather than an implementation detail. A Vault
 * enquiry and a callback from an ordinary page reach different people with
 * different expectations, so they separate in three places: a different table,
 * `source = 'website_callback'` on the lead, and `meta.source = 'website'` on
 * the admin notification. See migration 0089.
 *
 * ⚠️ The time choices reuse `DaypartMark`, the same four marks the visit
 * booking uses, so "Morning" means the same thing and looks the same in both
 * places. They are a preference recorded as a note, not an appointment — the
 * booking form is where an actual slot is reserved.
 */
const WHENS: { value: string; part: Daypart }[] = [
  { value: "Morning", part: "morning" },
  { value: "Midday", part: "midday" },
  { value: "Afternoon", part: "afternoon" },
  { value: "Evening", part: "evening" },
];

export function CallbackForm() {
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [when, setWhen] = useState<string | null>(null);
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
      const { data, error: rpcError } = await supabase.rpc("website_callback", {
        p_name: name,
        p_mobile: mobile,
        p_when: when,
        p_email: null,
        p_ref: currentRef(),
        p_source_url: typeof window !== "undefined" ? window.location.href : null,
        p_consent: true,
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
      /* A seal rather than a banner: the gold rule and a short sentence, which
         is the register the rest of this band is in. */
      <div className="rounded-card border border-jamin-gold/40 bg-jamin-gold-soft p-phi3">
        <span className="block h-px w-12 rule-gold" aria-hidden="true" />
        <p className="mt-phi2 text-base leading-relaxed text-ink-soft">
          Noted — an executive will call you
          {when ? ` in the ${when.toLowerCase()}` : " shortly"}. If it is urgent, calling us is
          faster than waiting for us to call you.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink outline-none transition-colors focus:border-jamin-gold";

  return (
    <form onSubmit={submit} className="space-y-phi2">
      <div className="grid gap-phi2 sm:grid-cols-2">
        <div>
          <label htmlFor="cb-name" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            Your name
          </label>
          <input
            id="cb-name"
            className={field}
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={80}
            autoComplete="name"
          />
        </div>
        <div>
          <label htmlFor="cb-mobile" className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
            Mobile
          </label>
          <input
            id="cb-mobile"
            className={field}
            value={mobile}
            onChange={(e) => setMobile(e.target.value)}
            required
            inputMode="numeric"
            maxLength={13}
            autoComplete="tel"
            placeholder="10-digit number"
          />
        </div>
      </div>

      <fieldset>
        <legend className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint">
          Best time to call <span className="normal-case tracking-normal">(optional)</span>
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {WHENS.map((w) => {
            const on = when === w.value;
            return (
              <button
                key={w.value}
                type="button"
                aria-pressed={on}
                onClick={() => setWhen(on ? null : w.value)}
                className={`flex items-center justify-center gap-2 rounded-card border px-phi2 py-2 text-tiny font-medium transition-all duration-300 ${
                  on
                    ? "border-jamin-red bg-jamin-red text-white"
                    : "border-line bg-canvas text-ink-soft hover:-translate-y-px hover:border-jamin-gold/45"
                }`}
              >
                <DaypartMark
                  part={w.part}
                  size="h-4 w-4"
                  className={`shrink-0 ${on ? "text-white" : "text-jamin-gold-ink"}`}
                />
                {w.value}
              </button>
            );
          })}
        </div>
      </fieldset>

      {error && <p className="text-tiny text-jamin-red-deep">{error}</p>}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-jamin-red px-6 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-jamin-red-deep disabled:opacity-60 sm:w-auto sm:px-8"
      >
        {busy ? "Sending…" : "Ask for a call"}
      </button>

      <p className="text-tiny leading-relaxed text-ink-faint">
        We use your number to return this call and to talk about Jamin developments. We do not sell
        it or pass it to anyone else.
      </p>
    </form>
  );
}
