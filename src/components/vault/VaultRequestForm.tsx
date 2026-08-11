"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { captureAttribution, currentCampaign, currentRef } from "@/lib/attribution";
import { VaultUpload, type UploadedFile } from "./VaultUpload";

/**
 * §4 — THE PRIVATE REQUEST CONCIERGE.
 *
 * The inverse of the marketplace form. `EnquiryForm` is deliberately three
 * fields because §92 warns that every extra field costs a conversion at the
 * moment interest peaks — and that is right for a plot buyer who wants a call
 * back. It is wrong here. A client describing a coffee estate in Coorg is not
 * being interrogated by the length of this form; they are being taken
 * seriously by it. The one field that matters is the paragraph at the bottom,
 * and everything above it exists so the desk does not have to ring back to ask.
 *
 * ⚠️ NAME AND MOBILE ARE THE ONLY REQUIRED FIELDS. Everything else may be left
 * blank and the request still lands. A client who will only say "beach house,
 * Goa, three months" must be able to send exactly that.
 *
 * ⚠️ This writes through `vault_request` (0081), never to `leads`. A Vault
 * requirement is not a marketplace enquiry: putting it in `leads` would route
 * it into the promoter commission path and expose it to every promoter whose
 * RLS policy covers their own leads.
 *
 * §93, inherited: a failed submission never clears the form.
 */

const CONTACT_METHODS = ["Phone", "WhatsApp", "Email"];

export function VaultRequestForm({ initialIntent }: { initialIntent?: "buy" | "rent" }) {
  /**
   * ⚠️ THE INTENT IS DERIVED, NOT SYNCHRONISED, and the difference is what
   * keeps this component lint-clean and correct at once.
   *
   * The obvious shape — `useState("buy")` plus an effect that reads the query
   * string and calls `setIntent` — is a cascading render, and
   * `react-hooks/set-state-in-effect` rejects it. The fix is not to silence the
   * rule: state that can be computed from props and the URL should never be
   * copied into `useState` at all. `chosen` therefore holds only what the
   * visitor CLICKED, which is genuinely state, and everything else falls
   * through to the link they arrived on.
   *
   * ⚠️ `useSearchParams` obliges every page rendering this form to wrap it in a
   * `<Suspense>` boundary, and both do. Without one, `next build` fails the
   * whole route rather than degrading — the error names the hook, not the page,
   * so it is worth knowing where it comes from.
   */
  const params = useSearchParams();
  const fromUrl = params.get("intent");
  const [chosen, setChosen] = useState<"buy" | "rent" | null>(null);
  const intent: "buy" | "rent" =
    chosen ?? initialIntent ?? (fromUrl === "rent" ? "rent" : "buy");
  const setIntent = setChosen;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [preferred, setPreferred] = useState("Phone");
  const [asset, setAsset] = useState("");
  /* A destination card links here with `?where=Coorg`. Lazy initialiser rather
     than an effect, for the same reason as the intent above. */
  const [location, setLocation] = useState(() => (params.get("where") ?? "").slice(0, 120));
  const [alt, setAlt] = useState("");
  const [budget, setBudget] = useState("");
  const [size, setSize] = useState("");
  const [use, setUse] = useState("");
  const [features, setFeatures] = useState("");
  const [possession, setPossession] = useState("");
  const [duration, setDuration] = useState("");
  const [additional, setAdditional] = useState("");
  const [confidential, setConfidential] = useState("");
  const [brief, setBrief] = useState("");
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [consent, setConsent] = useState(true);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
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
      const { data, error: rpcError } = await supabase.rpc("vault_request", {
        p_intent: intent,
        p_name: name,
        p_mobile: mobile,
        p_email: email || null,
        p_whatsapp: whatsapp || null,
        p_preferred: preferred || null,
        p_asset: asset || null,
        p_location: location || null,
        p_alt: alt || null,
        p_budget: budget || null,
        p_size: size || null,
        p_use: use || null,
        p_features: features || null,
        // An empty date input is "", which Postgres rejects as a date. Null it.
        p_possession: possession || null,
        p_duration: duration || null,
        p_additional: additional || null,
        p_confidential: confidential || null,
        p_brief: brief || null,
        p_attachments: files.map((f) => f.path),
        p_ref: currentRef(),
        p_campaign: currentCampaign(),
        p_source_url: typeof window !== "undefined" ? window.location.href : null,
        p_consent: consent,
      });
      if (rpcError) throw new Error(rpcError.message);
      const res = data as { ok: boolean; error?: string; reference?: string };
      if (!res?.ok) throw new Error(res?.error ?? "Please check the details and try again.");
      setReference(res.reference ?? null);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="rounded-xl border border-champagne-500/35 bg-canvas-alt p-phi4">
        <p className="rj-eyebrow text-jamin-gold-ink">Received</p>
        <h3 className="mt-phi2 text-2xl text-ink">Your request has entered The Vault.</h3>
        <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
          A Jamin Bazaar representative will contact you privately.
        </p>
        {reference ? (
          <p className="mt-phi3 text-base text-ink-soft">
            Your reference is <span className="ledger font-semibold text-ink">{reference}</span>.
            Quote it if you write to us before we reach you.
          </p>
        ) : null}
      </div>
    );
  }

  const field =
    "w-full rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink outline-none focus:border-champagne-300";
  const labelCls = "mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint";

  return (
    <form onSubmit={submit} className="space-y-phi3">
      {/* The intent is a real choice, not a dropdown buried in the middle. It
          changes which of the fields below actually matter. */}
      <fieldset>
        <legend className={labelCls}>I want to</legend>
        <div className="flex gap-2">
          {(["buy", "rent"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setIntent(k)}
              aria-pressed={intent === k}
              className={`flex-1 rounded-full border px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] transition-colors ${
                intent === k
                  ? "border-champagne-300 bg-canvas-sunken text-ink"
                  : "border-line bg-canvas text-ink-muted hover:border-champagne-500"
              }`}
            >
              {k === "buy" ? "Acquire" : "Rent"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-phi2 sm:grid-cols-2">
        <div>
          <label htmlFor="vr-name" className={labelCls}>
            Name
          </label>
          <input id="vr-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vr-mobile" className={labelCls}>
            Mobile
          </label>
          <div className="flex items-center gap-2">
            <span className="rounded-card border border-line bg-canvas-alt px-2.5 py-2.5 text-base text-ink-muted">
              +91
            </span>
            <input
              id="vr-mobile"
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
        <div>
          <label htmlFor="vr-wa" className={labelCls}>
            WhatsApp <span className="normal-case tracking-normal">(if different)</span>
          </label>
          <input
            id="vr-wa"
            inputMode="numeric"
            value={whatsapp}
            onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))}
            className={field}
          />
        </div>
        <div>
          <label htmlFor="vr-email" className={labelCls}>
            Email
          </label>
          <input id="vr-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vr-pref" className={labelCls}>
            Preferred contact
          </label>
          <select id="vr-pref" value={preferred} onChange={(e) => setPreferred(e.target.value)} className={field}>
            {CONTACT_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vr-asset" className={labelCls}>
            Property or asset sought
          </label>
          <input id="vr-asset" value={asset} onChange={(e) => setAsset(e.target.value)} placeholder="Coffee estate, heritage residence, beach house…" className={field} />
        </div>
        <div>
          <label htmlFor="vr-loc" className={labelCls}>
            Preferred location
          </label>
          <input id="vr-loc" value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vr-alt" className={labelCls}>
            Alternative locations
          </label>
          <input id="vr-alt" value={alt} onChange={(e) => setAlt(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vr-budget" className={labelCls}>
            Budget range
          </label>
          <input id="vr-budget" value={budget} onChange={(e) => setBudget(e.target.value)} placeholder="₹8–15 crore" className={field} />
        </div>
        <div>
          <label htmlFor="vr-size" className={labelCls}>
            Approximate size
          </label>
          <input id="vr-size" value={size} onChange={(e) => setSize(e.target.value)} placeholder="20+ acres, 8,000 sq ft…" className={field} />
        </div>
        <div>
          <label htmlFor="vr-use" className={labelCls}>
            Intended use
          </label>
          <input id="vr-use" value={use} onChange={(e) => setUse(e.target.value)} placeholder="Family home, second home, investment, conversion…" className={field} />
        </div>
        <div>
          <label htmlFor="vr-poss" className={labelCls}>
            {intent === "rent" ? "Preferred check-in" : "Preferred possession"}
          </label>
          {/* ⚠️ `colorScheme: "dark"` IS THE FIX, NOT DECORATION. A date input
              draws three things the page cannot reach with CSS — the calendar
              button, the dd-mm-yyyy skeleton and the whole dropdown panel — and
              Chrome picks their colours from the element's colour scheme, not
              from anything it inherits. The Vault is the one dark surface on
              this site, so the browser was painting a near-black glyph and a
              white panel onto a near-black field: the button was invisible and
              the panel arrived as a slab of glare. Every other field here is
              ordinary text and needs nothing.

              The empty skeleton is muted to match the placeholders beside it
              and goes full-strength once a date exists — a placeholder that
              reads louder than the answers around it looks like a filled
              field. Driven off the value we already hold in state, and applied
              as a style rather than a second class because `field` already
              carries `text-ink`: two same-specificity utilities on one element
              are settled by their order in the compiled sheet, not by the order
              they are written here, so the muted one would win only by luck. */}
          <input
            id="vr-poss"
            type="date"
            value={possession}
            onChange={(e) => setPossession(e.target.value)}
            style={{
              colorScheme: "dark",
              color: possession ? undefined : "var(--color-ink-faint)",
            }}
            className={field}
          />
        </div>
        {/* Only asked when it can be answered. A buyer has no duration. */}
        {intent === "rent" ? (
          <div>
            <label htmlFor="vr-dur" className={labelCls}>
              Duration
            </label>
            <input id="vr-dur" value={duration} onChange={(e) => setDuration(e.target.value)} placeholder="Three months, one season, two years…" className={field} />
          </div>
        ) : null}
      </div>

      <div>
        <label htmlFor="vr-feat" className={labelCls}>
          Required amenities or features
        </label>
        <input id="vr-feat" value={features} onChange={(e) => setFeatures(e.target.value)} placeholder="Existing residence, private access, water source, staff quarters…" className={field} />
      </div>

      {/* §4's large field, and the one the whole page is built around. */}
      <div>
        <label htmlFor="vr-brief" className="mb-1 block text-lg text-ink">
          Describe what you are looking for
        </label>
        <textarea
          id="vr-brief"
          rows={7}
          value={brief}
          onChange={(e) => setBrief(e.target.value)}
          placeholder="Tell The Vault exactly what you have in mind. Location, landscape, architecture, privacy, acreage, budget, amenities, intended use, or anything else that matters."
          className={field}
        />
      </div>

      <div>
        <label htmlFor="vr-add" className={labelCls}>
          Additional requirements
        </label>
        <textarea id="vr-add" rows={2} value={additional} onChange={(e) => setAdditional(e.target.value)} className={field} />
      </div>

      <div>
        <label htmlFor="vr-conf" className={labelCls}>
          Confidential notes
        </label>
        <p className="mb-phi2 text-tiny text-ink-faint">
          Read by the Vault desk only. Never shown on this site, never included when a property is
          presented to you, and never shared with an owner.
        </p>
        <textarea id="vr-conf" rows={2} value={confidential} onChange={(e) => setConfidential(e.target.value)} className={field} />
      </div>

      <VaultUpload
        label="Reference images or documents"
        hint="Anything that shows what you mean faster than a description. Uploaded privately; not published anywhere."
        value={files}
        onChange={setFiles}
      />

      <label className="flex items-start gap-2.5 text-tiny leading-relaxed text-ink-muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>
          A Jamin Bazaar representative may contact me privately about this requirement. My details
          are not published, listed or shared with other clients.
        </span>
      </label>

      {error ? (
        <p role="alert" className="rounded-card border border-jamin-red bg-jamin-red-soft p-phi2 text-base text-jamin-red-deep">
          {error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={busy}
        className="w-full rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep disabled:opacity-50"
      >
        {busy ? "Sending privately…" : "Submit private requirement"}
      </button>
    </form>
  );
}
