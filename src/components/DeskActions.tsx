import { getDeskContact, telHref, waHref } from "@/lib/site";
import { DeskEmail } from "./DeskEmail";

/**
 * §39 — Call and WhatsApp, right where the interest is, instead of only a
 * form. Both read `platform_contacts.jamin_desk`, the same record the app's
 * Support screen reads, so the number can never disagree between the two.
 *
 * The WhatsApp text is prefilled with context (§95): "Hi" tells the desk
 * nothing, whereas the project name and its URL tell them everything. Email now
 * carries the same prefill as a subject and a body, for the same reason.
 *
 * ⚠️ Email is a client component and the other two are not. That asymmetry is
 * deliberate and is explained in `DeskEmail` — it is the only one of the three
 * that can fail silently on the visitor's machine, so it is the only one that
 * needs to watch whether its own click did anything.
 */
export async function DeskActions({
  context,
  url,
}: {
  context?: string;
  url?: string;
}) {
  const desk = await getDeskContact();
  const tel = telHref(desk.mobile);
  const wa = waHref(
    desk.whatsapp,
    context
      ? `Hello Jamin Properties — I'm interested in ${context}.${url ? `\n${url}` : ""}`
      : "Hello Jamin Properties — I'd like to know more about your plots.",
  );

  if (!tel && !wa && !desk.email) return null;

  /* COLORIZED (owner 2026-08-17 night, "check all pages and colorize"): the
     three pills were beige outlines that vanished into the sand on every page
     that carries the desk. Each now wears a wash and border of a meaningful
     system colour — CALL in the signal red (the action), WHATSAPP in the
     land tones (the conversation), EMAIL in bronze (the record). Text stays
     the audited dark inks; the colour is the ground, never the word.

     ⚠️ WHATSAPP's ground is KRAFT, not `canopy-soft` (owner 2026-08-18: "the
     bg looks bright green, can we make it dark beige"). `canopy-soft`
     (#e4eae9) is a cool pale green that read as the one cold chip on a band
     of warm sand. Kraft is the deepest paper rung the site already owns, so
     the pill still separates from the bone-paper band by TONE rather than by
     hue, and the canopy ink stays on the word — 5.8:1 on kraft in light,
     and both tokens flip to their carbon twins in dark, so the pairing
     holds there too. */
  const base =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-full border px-4 py-3 text-tiny font-semibold uppercase tracking-[0.12em] transition-all hover:-translate-y-0.5";
  const tone = {
    call: "border-jamin-red-deep/40 bg-jamin-red-soft text-jamin-red-deep hover:border-jamin-red-deep",
    wa: "border-canopy/40 bg-kraft text-canopy hover:border-canopy",
    mail: "border-jamin-gold bg-jamin-gold-soft text-jamin-gold-ink hover:border-jamin-gold-ink",
  };

  return (
    <div className="flex flex-wrap gap-2">
      {tel && (
        <a href={tel} className={`${base} ${tone.call}`}>
          Call
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={`${base} ${tone.wa}`}>
          WhatsApp
        </a>
      )}
      {desk.email && (
        <DeskEmail email={desk.email} className={`${base} ${tone.mail}`} context={context} url={url} />
      )}
    </div>
  );
}
