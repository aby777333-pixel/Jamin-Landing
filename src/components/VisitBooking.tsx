"use client";

import { useEffect, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { supabase } from "@/lib/supabase";
import { captureAttribution, currentRef } from "@/lib/attribution";

/**
 * Book a site visit — a real appointment, not a call-back request.
 *
 * Everything needed to take a booking already existed in the database:
 * `site_visits` has a slot, a scheduled time, a reference series and an admin
 * queue. This talks to `website_book_visit` (0079), the anon-callable RPC that
 * writes the visit AND the matching lead, so the desk still works one list.
 *
 * ⚠️ TIMEZONE. Every date on this calendar is an Indian date, and the time sent
 * to the server is pinned to +05:30 explicitly. A visitor in Dubai or New
 * Jersey picking "Saturday, 9 am" means 9 am at the site — using the browser's
 * own zone would book them a slot in the middle of the night, and the mistake
 * would only surface when nobody turned up.
 *
 * ⚠️ SLOT_LABELS must stay byte-identical to the list the RPC validates
 * against, including the middle dot and the en dash. A mismatch is rejected
 * server-side with "Please choose a visiting time", which is a baffling error
 * to hit after you have chosen one.
 */
const SLOTS = [
  { label: "Morning · 9–11 am", hour: 9 },
  { label: "Midday · 11 am–1 pm", hour: 11 },
  { label: "Afternoon · 2–4 pm", hour: 14 },
  { label: "Evening · 4–6 pm", hour: 16 },
] as const;

/** How far ahead the desk will take a booking. Mirrors the RPC's 90 days. */
const HORIZON_DAYS = 90;

const IST_DATE = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Asia/Kolkata",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
});
const IST_HOUR = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Kolkata",
  hour: "2-digit",
  hour12: false,
});

/** "2026-08-07" for right now, in India. */
function istToday() {
  return IST_DATE.format(new Date());
}
function istHourNow() {
  // hour12:false formats midnight as "24" in some engines, which would close
  // every slot for the day rather than opening all of them.
  return Number(IST_HOUR.format(new Date())) % 24;
}

/** Plain date helpers on "YYYY-MM-DD" strings — no Date arithmetic, so no
 *  daylight-saving or local-midnight surprises. */
function addDays(iso: string, n: number) {
  const [y, m, d] = iso.split("-").map(Number);
  const t = Date.UTC(y, m - 1, d) + n * 86400000;
  const dt = new Date(t);
  return `${dt.getUTCFullYear()}-${String(dt.getUTCMonth() + 1).padStart(2, "0")}-${String(
    dt.getUTCDate(),
  ).padStart(2, "0")}`;
}
function monthKey(iso: string) {
  return iso.slice(0, 7);
}
function firstOfMonth(key: string) {
  return `${key}-01`;
}
function daysInMonth(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}
/** 0 = Monday. The week starts on Monday here, as it does on an Indian wall
 *  calendar, so a weekend reads as the pair at the end rather than as a split. */
function weekdayIndex(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return (new Date(Date.UTC(y, m - 1, d)).getUTCDay() + 6) % 7;
}
function longDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "UTC",
  });
}
function monthTitle(key: string) {
  const [y, m] = key.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, 1)).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * "Today in India" is not knowable at build time, and this page is statically
 * prerendered. useSyncExternalStore gives the server `null` and the browser the
 * real date, which is the supported way to render something client-only without
 * a hydration mismatch and without setting state from an effect.
 */
const subscribeToNothing = () => () => {};
function useIstToday() {
  return useSyncExternalStore(subscribeToNothing, istToday, () => null);
}

export type VisitProperty = { id: string; title: string; place?: string | null };

export function VisitBooking({
  properties,
  fixedProperty,
}: {
  /** Sellable developments only — the RPC refuses anything else. */
  properties: VisitProperty[];
  /** On a property page the development is already decided. */
  fixedProperty?: VisitProperty;
}) {
  const today = useIstToday();
  const [property, setProperty] = useState(fixedProperty?.id ?? properties[0]?.id ?? "");
  const [month, setMonth] = useState<string | null>(null);
  const [date, setDate] = useState<string | null>(null);
  const [slot, setSlot] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [mobile, setMobile] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [consent, setConsent] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<{ ref?: string; when?: string } | null>(null);
  const doneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    captureAttribution();
  }, []);

  /**
   * 🚨 AFTER SUBMITTING, PUT THE READER BACK ON THE CONFIRMATION.
   *
   * Reported as "the page scrolls to the footer instead of the visit
   * confirmation". Nothing scrolls the page — that is what made it confusing.
   * What happens is that this component swaps a very tall subtree (a month
   * calendar, four slot buttons, five fields and a consent block) for a short
   * card, so the document loses well over a thousand pixels in one paint. The
   * browser holds `scrollY` where it was, and on the now-much-shorter page that
   * offset lands at or past the footer. The reader is exactly where they were;
   * the page moved out from under them.
   *
   * So the scroll has to be restored deliberately, and it has to happen AFTER
   * the shrink — this effect runs post-commit, so `doneRef` is measuring the
   * card in its final position.
   *
   * ⚠️ Offset by `--header-h`. The header is sticky, so scrolling the card to
   * viewport top puts its heading underneath the bar. The token is read rather
   * than hard-coded because it changes at `lg` (72 → 80px).
   *
   * ⚠️ Focus moves too, with `preventScroll`. A visually-obvious change that
   * nothing announces is invisible to a screen reader, and the card is the
   * entire result of the action. `preventScroll` stops focus doing its own
   * competing scroll before ours lands.
   */
  useEffect(() => {
    if (!done) return;
    const el = doneRef.current;
    if (!el) return;

    el.focus({ preventScroll: true });

    const headerH =
      parseFloat(
        getComputedStyle(document.documentElement).getPropertyValue("--header-h"),
      ) || 72;
    const top = el.getBoundingClientRect().top + window.scrollY - headerH - 24;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: Math.max(0, top), behavior: reduced ? "auto" : "smooth" });
  }, [done]);

  // Adjust-during-render rather than in an effect: the month has no meaning
  // until we know today's date, and an effect would paint an empty grid first.
  const shownMonth = month ?? (today ? monthKey(today) : null);
  const last = today ? addDays(today, HORIZON_DAYS) : null;

  const cells = useMemo(() => {
    if (!shownMonth) return [];
    const total = daysInMonth(shownMonth);
    const lead = weekdayIndex(firstOfMonth(shownMonth));
    const out: (string | null)[] = Array.from({ length: lead }, () => null);
    for (let d = 1; d <= total; d++) {
      out.push(`${shownMonth}-${String(d).padStart(2, "0")}`);
    }
    return out;
  }, [shownMonth]);

  const canGoBack = !!(today && shownMonth && shownMonth > monthKey(today));
  const canGoNext = !!(last && shownMonth && shownMonth < monthKey(last));

  // On today itself, a slot that has already started is not bookable — the RPC
  // would reject the timestamp anyway, and offering it is a small lie.
  const slotOpen = (hour: number) =>
    !today || date !== today || istHourNow() < hour;

  const chosen = fixedProperty ?? properties.find((p) => p.id === property);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (busy) return;
    if (!date || !slot) {
      setError("Please choose a date and a visiting time.");
      return;
    }
    const hour = SLOTS.find((s) => s.label === slot)?.hour ?? 9;
    // Pinned to Indian time, on purpose. See the note at the top of this file.
    const scheduledAt = `${date}T${String(hour).padStart(2, "0")}:00:00+05:30`;

    setBusy(true);
    setError(null);
    try {
      const { data, error: rpcError } = await supabase.rpc("website_book_visit", {
        p_name: name,
        p_mobile: mobile,
        p_property: fixedProperty?.id ?? property,
        p_scheduled_at: scheduledAt,
        p_slot_label: slot,
        p_email: email || null,
        p_message: message || null,
        p_ref: currentRef(),
        p_source_url: typeof window !== "undefined" ? window.location.href : null,
        p_consent: consent,
      });
      if (rpcError) throw new Error(rpcError.message);
      const res = data as { ok: boolean; error?: string; visit_ref?: string; when?: string };
      if (!res?.ok) throw new Error(res?.error ?? "Please check the details and try again.");
      setDone({ ref: res.visit_ref, when: res.when });
    } catch (err) {
      // §93 — a failed submission never clears what they typed.
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div
        ref={doneRef}
        /* `-1` so the effect above can move focus here without adding the card
           to the tab order. `role="status"` announces it for anyone who is not
           watching the screen. `scroll-mt` is the CSS half of the header offset,
           so an in-page anchor lands correctly too. */
        tabIndex={-1}
        role="status"
        aria-live="polite"
        className="scroll-mt-28 rounded-xl border border-canopy/30 bg-canopy-soft p-phi4 outline-none"
      >
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-canopy text-canvas">
            ✓
          </span>
          <h3 className="text-xl text-canopy">Your visit is requested</h3>
        </div>
        <p className="mt-phi3 text-base leading-relaxed text-ink-soft">
          {chosen?.title ? <strong>{chosen.title}</strong> : "Your visit"}
          {done.when ? ` — ${done.when}.` : "."} We will call to confirm the time and tell you
          exactly where to meet.
        </p>
        {done.ref && (
          <p className="mt-phi2 text-tiny uppercase tracking-[0.14em] text-canopy">
            Reference {done.ref}
          </p>
        )}
        <p className="mt-phi3 border-t border-canopy/20 pt-phi2 text-tiny leading-relaxed text-ink-muted">
          A requested visit is not yet a confirmed appointment. If your plans change, tell us on the
          same number and we will move it.
        </p>
      </div>
    );
  }

  const field =
    "w-full rounded-card border border-line bg-canvas px-phi3 py-2.5 text-base text-ink outline-none transition-colors focus:border-jamin-red";

  return (
    <form onSubmit={submit} className="space-y-phi3">
      {/* ---- 1. which development ---- */}
      {!fixedProperty && (
        <div>
          <StepLabel n={1}>Which development</StepLabel>
          <div className="mt-phi2 grid gap-2 sm:grid-cols-2">
            {properties.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setProperty(p.id)}
                aria-pressed={property === p.id}
                className={`rounded-card border px-phi3 py-2.5 text-left transition-all duration-300 ${
                  property === p.id
                    ? "border-jamin-red bg-jamin-red-soft"
                    : "border-line bg-canvas hover:border-ink/30"
                }`}
              >
                <span className="block text-base text-ink">{p.title}</span>
                {p.place && <span className="mt-0.5 block text-tiny text-ink-muted">{p.place}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ---- 2. the date ---- */}
      <div>
        <StepLabel n={fixedProperty ? 1 : 2}>Pick a date</StepLabel>
        <div className="mt-phi2 rounded-xl border border-line bg-canvas p-phi3">
          {!shownMonth ? (
            /* Rendered on the server and for the first paint. A calendar cannot
               honestly draw itself before it knows what day it is. */
            <div className="h-64 animate-pulse rounded-card bg-canvas-sunken" aria-hidden="true" />
          ) : (
            <>
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMonth(addDays(firstOfMonth(shownMonth), -1).slice(0, 7))}
                  disabled={!canGoBack}
                  aria-label="Previous month"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink/40 disabled:opacity-30"
                >
                  ‹
                </button>
                <div className="text-base font-medium text-ink">{monthTitle(shownMonth)}</div>
                <button
                  type="button"
                  onClick={() =>
                    setMonth(
                      addDays(firstOfMonth(shownMonth), daysInMonth(shownMonth)).slice(0, 7),
                    )
                  }
                  disabled={!canGoNext}
                  aria-label="Next month"
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-line text-ink-soft transition-colors hover:border-ink/40 disabled:opacity-30"
                >
                  ›
                </button>
              </div>

              <div className="mt-phi3 grid grid-cols-7 gap-1 text-center">
                {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
                  <div
                    key={i}
                    aria-hidden="true"
                    className="pb-1 text-micro font-semibold uppercase tracking-[0.1em] text-ink-faint"
                  >
                    {d}
                  </div>
                ))}
                {cells.map((iso, i) => {
                  if (!iso) return <div key={`p${i}`} />;
                  const past = !!today && iso < today;
                  const beyond = !!last && iso > last;
                  const disabled = past || beyond;
                  const isToday = iso === today;
                  const selected = iso === date;
                  return (
                    <button
                      key={iso}
                      type="button"
                      disabled={disabled}
                      aria-pressed={selected}
                      aria-label={longDate(iso)}
                      onClick={() => {
                        setDate(iso);
                        setSlot(null);
                      }}
                      className={`aspect-square rounded-[10px] text-base transition-all duration-200 ${
                        selected
                          ? "bg-jamin-red font-semibold text-white shadow-lift"
                          : disabled
                            ? "cursor-not-allowed text-ink-faint/40"
                            : isToday
                              ? "border border-jamin-gold text-ink hover:bg-jamin-gold-soft"
                              : "text-ink-soft hover:bg-canvas-sunken"
                      }`}
                    >
                      {Number(iso.slice(8))}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---- 3. the slot ---- */}
      <div>
        <StepLabel n={fixedProperty ? 2 : 3}>Choose a time</StepLabel>
        <div className="mt-phi2 grid grid-cols-2 gap-2">
          {SLOTS.map((s) => {
            const open = slotOpen(s.hour);
            return (
              <button
                key={s.label}
                type="button"
                disabled={!date || !open}
                aria-pressed={slot === s.label}
                onClick={() => setSlot(s.label)}
                className={`rounded-card border px-phi2 py-2.5 text-tiny font-medium transition-all duration-300 ${
                  slot === s.label
                    ? "border-jamin-red bg-jamin-red text-white"
                    : !date || !open
                      ? "cursor-not-allowed border-line bg-canvas-alt text-ink-faint/60"
                      : "border-line bg-canvas text-ink-soft hover:border-ink/30"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>
        <p className="mt-phi2 text-tiny text-ink-faint">
          {date
            ? `${longDate(date)} — all times are Indian Standard Time.`
            : "Pick a date first and the available times appear."}
        </p>
      </div>

      {/* ---- 4. who is coming ---- */}
      <div>
        <StepLabel n={fixedProperty ? 3 : 4}>Your details</StepLabel>
        <div className="mt-phi2 space-y-phi2">
          <div className="grid gap-phi2 sm:grid-cols-2">
            <div>
              <label
                htmlFor="sv-name"
                className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint"
              >
                Your name
              </label>
              <input
                id="sv-name"
                required
                autoComplete="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={field}
              />
            </div>
            <div>
              <label
                htmlFor="sv-mobile"
                className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint"
              >
                Mobile
              </label>
              <div className="flex items-center gap-2">
                <span className="rounded-card border border-line bg-canvas-alt px-2.5 py-2.5 text-base text-ink-muted">
                  +91
                </span>
                <input
                  id="sv-mobile"
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
            <label
              htmlFor="sv-email"
              className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint"
            >
              Email <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <input
              id="sv-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={field}
            />
          </div>

          <div>
            <label
              htmlFor="sv-msg"
              className="mb-1 block text-tiny uppercase tracking-[0.12em] text-ink-faint"
            >
              Anything we should know?{" "}
              <span className="normal-case tracking-normal">(optional)</span>
            </label>
            <textarea
              id="sv-msg"
              rows={2}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="How many of you are coming, whether you need directions, a plot you already have in mind"
              className={field}
            />
          </div>
        </div>
      </div>

      <label className="flex items-start gap-2.5 text-tiny leading-relaxed text-ink-muted">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5"
        />
        <span>
          You may contact me about this visit and about matching Jamin developments. We do not share
          your number with anyone else.
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

      <button
        type="submit"
        disabled={busy || !date || !slot}
        className="w-full rounded-full bg-jamin-red px-5 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-500 hover:-translate-y-0.5 hover:bg-jamin-red-deep hover:shadow-raise disabled:translate-y-0 disabled:opacity-45 disabled:shadow-none"
        style={{ transitionTimingFunction: "var(--ease-silk)" }}
      >
        {busy
          ? "Requesting…"
          : date && slot
            ? `Request ${longDate(date).replace(/,.*$/, "")} · ${slot.split(" · ")[0]}`
            : "Choose a date and time"}
      </button>

      <p className="text-tiny leading-relaxed text-ink-faint">
        No payment, no obligation. A requested visit is confirmed by a call from our desk — we will
        agree the time with you before you travel.
      </p>
    </form>
  );
}

function StepLabel({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2.5">
      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-ink text-micro font-semibold text-canvas">
        {n}
      </span>
      <span className="text-tiny font-semibold uppercase tracking-[0.14em] text-ink">
        {children}
      </span>
    </div>
  );
}
