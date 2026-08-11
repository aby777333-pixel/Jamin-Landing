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

  const base =
    "inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-line bg-canvas px-4 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-ink transition-colors hover:border-ink-faint";

  return (
    <div className="flex flex-wrap gap-2">
      {tel && (
        <a href={tel} className={base}>
          Call
        </a>
      )}
      {wa && (
        <a href={wa} target="_blank" rel="noopener noreferrer" className={base}>
          WhatsApp
        </a>
      )}
      {desk.email && (
        <DeskEmail email={desk.email} className={base} context={context} url={url} />
      )}
    </div>
  );
}
