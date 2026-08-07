"use client";

/**
 * Promoter attribution (§40).
 *
 * A visitor who arrives on `?ref=JA-REF-00021` and then browses three projects
 * before enquiring must still be credited to that promoter. Reading the code
 * off the current URL at submit time would lose them at the first click, so it
 * is captured on arrival and kept.
 *
 * ⚠️ Deliberately NOT trusted as an identity. The code travels to the server as
 * a hint, and `website_enquiry` resolves it against `profiles` itself — an
 * invented code simply resolves to nobody, and there is no way to attach a
 * lead to a promoter who did not earn it. Direct inserts into `leads` are
 * refused by RLS, so the RPC is the only path in.
 *
 * sessionStorage, not a cookie: it is per-visit, never sent with a request, and
 * disappears when the tab closes. Nothing here identifies a person.
 */
const KEY = "jamin-ref";
const CAMPAIGN_KEY = "jamin-campaign";

/** Called once on mount. Safe to call repeatedly — the first code wins, so a
 *  later untagged page view cannot overwrite the promoter who sent them. */
export function captureAttribution() {
  if (typeof window === "undefined") return;
  try {
    const q = new URLSearchParams(window.location.search);
    const ref = (q.get("ref") || "").trim().toUpperCase();
    if (ref && /^[A-Z0-9-]{4,32}$/.test(ref) && !sessionStorage.getItem(KEY)) {
      sessionStorage.setItem(KEY, ref);
    }
    const campaign =
      q.get("utm_campaign") || q.get("utm_source") || q.get("campaign") || "";
    if (campaign && !sessionStorage.getItem(CAMPAIGN_KEY)) {
      sessionStorage.setItem(CAMPAIGN_KEY, campaign.trim().slice(0, 120));
    }
  } catch {
    // Private browsing can refuse storage; attribution is a nice-to-have, not
    // a reason to break the page.
  }
}

export function currentRef(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

export function currentCampaign(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return sessionStorage.getItem(CAMPAIGN_KEY);
  } catch {
    return null;
  }
}
