"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { VaultUpload, type UploadedFile } from "./VaultUpload";

/**
 * §5 — THE OWNER'S PRIVATE LISTING DESK.
 *
 * A completely separate experience from the client concierge, because the two
 * people are not the same person and do not want the same conversation. A
 * client is describing something that does not exist yet; an owner is
 * describing something that does, and can prove it.
 *
 * ⚠️ "KEEP MY PROPERTY OFF-MARKET" IS THE MOST IMPORTANT CONTROL ON THIS PAGE.
 * It is not a preference the desk may quietly override. `vault_offer` writes it
 * to `off_market` (what the owner asked for) AND to `visibility` (what the
 * system enforces) as two separate columns, so an administrator changing one
 * cannot erase the record of the other.
 *
 * ⚠️ NOTHING SUBMITTED HERE IS EVER PUBLIC BY DEFAULT. The RPC has no argument
 * that can set visibility to `public`; the best an unticked box achieves is
 * `private`. Becoming publicly visible requires a deliberate change in the
 * admin console, which is the whole shape of §6.
 */

const OWNERSHIP = [
  "",
  "Sole owner",
  "Joint ownership",
  "Family / ancestral",
  "Company or trust owned",
  "Power of attorney",
  "Other",
];
const FURNISHING = ["", "Unfurnished", "Semi-furnished", "Fully furnished"];

export function VaultOfferForm({ initialIntent }: { initialIntent?: "sell" | "lease" }) {
  /* Derived, not synchronised — see the long note in VaultRequestForm. `chosen`
     holds only what the owner clicked; the rest falls through to the link they
     arrived on. Requires a <Suspense> boundary in the page. */
  const params = useSearchParams();
  const fromUrl = params.get("intent");
  const [chosen, setChosen] = useState<"sell" | "lease" | null>(null);
  const intent: "sell" | "lease" =
    chosen ?? initialIntent ?? (fromUrl === "lease" ? "lease" : "sell");
  const setIntent = setChosen;

  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [type, setType] = useState("");
  const [location, setLocation] = useState("");
  const [price, setPrice] = useState("");
  const [rent, setRent] = useState("");
  const [landArea, setLandArea] = useState("");
  const [builtArea, setBuiltArea] = useState("");
  const [bedrooms, setBedrooms] = useState("");
  const [description, setDescription] = useState("");
  const [ownership, setOwnership] = useState("");
  const [availability, setAvailability] = useState("");
  const [furnishing, setFurnishing] = useState("");
  const [amenities, setAmenities] = useState("");
  const [map, setMap] = useState("");
  const [coordinates, setCoordinates] = useState("");
  const [instructions, setInstructions] = useState("");
  const [offMarket, setOffMarket] = useState(false);
  const [consent, setConsent] = useState(true);

  const [photos, setPhotos] = useState<UploadedFile[]>([]);
  const [videos, setVideos] = useState<UploadedFile[]>([]);
  const [brochures, setBrochures] = useState<UploadedFile[]>([]);
  const [documents, setDocuments] = useState<UploadedFile[]>([]);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reference, setReference] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("vault_offer", {
        p_intent: intent,
        p_name: name,
        p_mobile: mobile,
        p_email: email || null,
        p_whatsapp: whatsapp || null,
        p_type: type || null,
        p_location: location || null,
        p_price: price || null,
        p_rent: rent || null,
        p_land_area: landArea || null,
        p_built_area: builtArea || null,
        // An empty number input is "", and Number("") is 0 — which would tell
        // the desk this estate has no bedrooms rather than that nobody said.
        p_bedrooms: bedrooms === "" ? null : Number(bedrooms),
        p_description: description || null,
        p_ownership: ownership || null,
        p_availability: availability || null,
        p_furnishing: furnishing || null,
        p_amenities: amenities || null,
        p_map: map || null,
        p_coordinates: coordinates || null,
        p_instructions: instructions || null,
        p_photos: photos.map((f) => f.path),
        p_videos: videos.map((f) => f.path),
        p_brochures: brochures.map((f) => f.path),
        p_documents: documents.map((f) => f.path),
        p_off_market: offMarket,
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
        <h3 className="mt-phi2 text-2xl text-ink">Your property has entered The Vault.</h3>
        <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
          A Jamin Bazaar representative will contact you privately to take it further.
          {offMarket
            ? " It is held off-market: it will not appear in the public Vault, and it is matched by hand against qualified requirements."
            : " Nothing is published until you and the desk agree what may be shown."}
        </p>
        {reference ? (
          <p className="mt-phi3 text-base text-ink-soft">
            Your reference is <span className="ledger font-semibold text-ink">{reference}</span>.
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
      <fieldset>
        <legend className={labelCls}>I want to</legend>
        <div className="flex gap-2">
          {(["sell", "lease"] as const).map((k) => (
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
              {k === "sell" ? "Sell" : "Give for rent / lease"}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-phi2 sm:grid-cols-2">
        <div>
          <label htmlFor="vo-name" className={labelCls}>
            Owner name
          </label>
          <input id="vo-name" required autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vo-mobile" className={labelCls}>
            Mobile
          </label>
          <div className="flex items-center gap-2">
            <span className="rounded-card border border-line bg-canvas-alt px-2.5 py-2.5 text-base text-ink-muted">
              +91
            </span>
            <input
              id="vo-mobile"
              required
              inputMode="numeric"
              autoComplete="tel-national"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, "").slice(0, 10))}
              className={field}
            />
          </div>
        </div>
        <div>
          <label htmlFor="vo-wa" className={labelCls}>
            WhatsApp <span className="normal-case tracking-normal">(if different)</span>
          </label>
          <input id="vo-wa" inputMode="numeric" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value.replace(/\D/g, "").slice(0, 10))} className={field} />
        </div>
        <div>
          <label htmlFor="vo-email" className={labelCls}>
            Email
          </label>
          <input id="vo-email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vo-type" className={labelCls}>
            Property type
          </label>
          <input id="vo-type" value={type} onChange={(e) => setType(e.target.value)} placeholder="Heritage bungalow, coffee estate, penthouse…" className={field} />
        </div>
        <div>
          <label htmlFor="vo-loc" className={labelCls}>
            Property location
          </label>
          <input id="vo-loc" value={location} onChange={(e) => setLocation(e.target.value)} className={field} />
        </div>

        {/* Both are shown regardless of intent — an owner selling may also
            consider a lease, and finding out costs one field. */}
        <div>
          <label htmlFor="vo-price" className={labelCls}>
            Expected sale price
          </label>
          <input id="vo-price" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="In your own words" className={field} />
        </div>
        <div>
          <label htmlFor="vo-rent" className={labelCls}>
            Expected rent or lease
          </label>
          <input id="vo-rent" value={rent} onChange={(e) => setRent(e.target.value)} placeholder="Per month, per season, negotiable…" className={field} />
        </div>

        <div>
          <label htmlFor="vo-land" className={labelCls}>
            Land area
          </label>
          <input id="vo-land" value={landArea} onChange={(e) => setLandArea(e.target.value)} placeholder="Acres, cents, sq ft" className={field} />
        </div>
        <div>
          <label htmlFor="vo-built" className={labelCls}>
            Built-up area
          </label>
          <input id="vo-built" value={builtArea} onChange={(e) => setBuiltArea(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vo-beds" className={labelCls}>
            Bedrooms <span className="normal-case tracking-normal">(where applicable)</span>
          </label>
          <input id="vo-beds" type="number" min={0} max={99} value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vo-own" className={labelCls}>
            Ownership status
          </label>
          <select id="vo-own" value={ownership} onChange={(e) => setOwnership(e.target.value)} className={field}>
            {OWNERSHIP.map((o) => (
              <option key={o} value={o}>
                {o || "Select"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vo-avail" className={labelCls}>
            Availability
          </label>
          <input id="vo-avail" value={availability} onChange={(e) => setAvailability(e.target.value)} placeholder="Immediate, after harvest, from October…" className={field} />
        </div>
        <div>
          <label htmlFor="vo-furn" className={labelCls}>
            Furnished / unfurnished
          </label>
          <select id="vo-furn" value={furnishing} onChange={(e) => setFurnishing(e.target.value)} className={field}>
            {FURNISHING.map((o) => (
              <option key={o} value={o}>
                {o || "Select"}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="vo-map" className={labelCls}>
            Google Maps link
          </label>
          <input id="vo-map" value={map} onChange={(e) => setMap(e.target.value)} className={field} />
        </div>
        <div>
          <label htmlFor="vo-coord" className={labelCls}>
            Coordinates
          </label>
          <input id="vo-coord" value={coordinates} onChange={(e) => setCoordinates(e.target.value)} placeholder="12.3456, 75.8901" className={field} />
        </div>
      </div>

      <div>
        <label htmlFor="vo-desc" className="mb-1 block text-lg text-ink">
          Describe the property
        </label>
        <textarea
          id="vo-desc"
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What it is, what stands on it, what surrounds it, and what makes it worth showing to the right person."
          className={field}
        />
      </div>

      <div>
        <label htmlFor="vo-amen" className={labelCls}>
          Amenities
        </label>
        <input id="vo-amen" value={amenities} onChange={(e) => setAmenities(e.target.value)} className={field} />
      </div>

      <div className="grid gap-phi3 sm:grid-cols-2">
        <VaultUpload label="Photographs" accept="image/*" value={photos} onChange={setPhotos} />
        <VaultUpload label="Video" accept="video/*" value={videos} onChange={setVideos} />
        <VaultUpload label="Brochure" accept=".pdf,application/pdf" value={brochures} onChange={setBrochures} />
        <VaultUpload
          label="Property documents"
          hint="Held privately and read only by the Vault desk. Uploading a document does not make a property verified."
          value={documents}
          onChange={setDocuments}
        />
      </div>

      <div>
        <label htmlFor="vo-instr" className={labelCls}>
          Special instructions
        </label>
        <textarea id="vo-instr" rows={2} value={instructions} onChange={(e) => setInstructions(e.target.value)} placeholder="When we may call, who else knows, anything that must not be shown." className={field} />
      </div>

      {/* §5's defining control. Given its own plate because it deserves to be
          read rather than skimmed past with the checkboxes. */}
      <div className="rounded-xl border border-champagne-500/35 bg-canvas-alt p-phi3">
        <label className="flex items-start gap-3">
          <input type="checkbox" checked={offMarket} onChange={(e) => setOffMarket(e.target.checked)} className="mt-1" />
          <span>
            <span className="block text-lg text-ink">Keep my property off-market</span>
            <span className="mt-1 block text-base leading-relaxed text-ink-muted">
              It will never appear in the public Vault catalogue. Only authorised Jamin Bazaar Vault
              administrators can see it, and it is matched by hand against qualified buyer or tenant
              requirements.
            </span>
          </span>
        </label>
      </div>

      <label className="flex items-start gap-2.5 text-tiny leading-relaxed text-ink-muted">
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-0.5" />
        <span>
          I own or am authorised to offer this property, and Jamin Bazaar may contact me privately
          about it. I understand that uploading documents does not make the property legally
          verified.
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
        {busy ? "Sending privately…" : "Offer to The Vault"}
      </button>
    </form>
  );
}
