import { DeskActions } from "@/components/DeskActions";
import { CallbackForm } from "@/components/CallbackForm";
import { Container } from "@/components/ui";
import { getDeskContact } from "@/lib/site";

/**
 * "Talk to an executive" — the desk, on the pages that had no way to reach it.
 *
 * ⚠️ DELIBERATELY NOT THE VAULT'S DOCK. That is a dark floating panel pinned to
 * the corner of one route, and a second floating control on every page would
 * put two of them on screen beside the Jamindar medallion. This is a BAND: it
 * sits in the page flow, in ivory, ruled — the trust-layer register rather than
 * the luxury one. Same desk, different room.
 *
 * ⚠️ Two ways in, on purpose. The links are for someone who wants to act now —
 * and a tap on a `tel:` link cannot be recorded from a browser, which is
 * exactly why the form exists beside them. The form is the only half that
 * becomes a record.
 *
 * ⚠️ The wording is "an executive", not "a relationship manager": the owner's
 * phrasing, and the more honest of the two, since a relationship manager is a
 * titled role this business does not staff.
 */
export async function CallbackBand({
  context,
  url,
}: {
  /** What the visitor was looking at, prefilled into WhatsApp and email. */
  context?: string;
  url?: string;
}) {
  const desk = await getDeskContact();

  return (
    <section className="mt-phi6 border-y border-line bg-canvas-alt py-phi5" id="desk">
      <Container>
        <div className="grid gap-phi4 lg:grid-cols-[1fr_1.1fr] lg:items-start lg:gap-phi5">
          <div>
            {/* The measure rule from the ornament layer — a dimension line with
                end serifs, which is the mark this site uses when something is
                being stated rather than sold. */}
            <span className="block h-px w-24 rule-measure" aria-hidden="true" />
            <h2 className="mt-phi3 text-2xl text-ink">Talk to an executive</h2>
            <p className="mt-phi2 max-w-md text-base leading-relaxed text-ink-muted">
              Not a call centre. One person who knows the layouts, the paperwork and what is
              actually available this week — reachable directly, or by asking for a call at a
              time that suits you.
            </p>

            <div className="mt-phi3">
              <DeskActions context={context} url={url} />
            </div>

            {desk.mobile && (
              <p className="mt-phi3 text-tiny text-ink-faint">
                {desk.label ?? "Jamin Properties Help Desk"} · we usually respond within working
                hours.
              </p>
            )}
          </div>

          <div className="rounded-card border border-line bg-canvas p-phi3 shadow-lift sm:p-phi4">
            <CallbackForm />
          </div>
        </div>
      </Container>
    </section>
  );
}
