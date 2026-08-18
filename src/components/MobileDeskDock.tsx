import { getDeskContact, telHref, waHref } from "@/lib/site";

/**
 * The phone-only desk dock (do-all round, 2026-08-18) — Call / WhatsApp /
 * Book a visit pinned to the foot of a property page on small screens, where
 * the DeskActions row and the Sweep are several screens away by the time a
 * buyer has read the plot schedule.
 *
 * Reads `platform_contacts.jamin_desk` like every other contact surface —
 * never a hard-coded number (the standing rule from the desk-contact change).
 *
 * ⚠️ `lg:hidden`: on desktop the page already carries the desk twice and a
 * fixed bar would just cover the footer. `fixed` inside <main> is safe here —
 * body>main is a stacking context but the header is at the TOP; the one
 * overlay that must beat this is the plot sheet, and that portals to <body>.
 * The `pb-[env(safe-area-inset-bottom)]` keeps it clear of a phone's home
 * indicator. Every colour is a token, so carbon mode is free.
 */
export async function MobileDeskDock({ context }: { context?: string }) {
  const desk = await getDeskContact();
  const tel = telHref(desk.mobile);
  const wa = waHref(
    desk.whatsapp,
    context
      ? `Hello Jamin Properties — I'm interested in ${context}.`
      : "Hello Jamin Properties — I'd like to know more about your plots.",
  );

  if (!tel && !wa) return null;

  const base =
    "flex flex-1 items-center justify-center rounded-full px-3 py-2.5 text-tiny font-semibold uppercase tracking-[0.1em] transition-colors";

  return (
    <>
      {/* The dock's landing room — without it the last section's copy ends
          underneath the bar. */}
      <div className="h-16 lg:hidden" aria-hidden="true" />
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-canvas/95 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl gap-2">
          {tel && (
            <a href={tel} className={`${base} border border-jamin-red-deep/40 bg-jamin-red-soft text-jamin-red-deep`}>
              Call
            </a>
          )}
          {wa && (
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className={`${base} border border-canopy/40 bg-canopy-soft text-canopy`}
            >
              WhatsApp
            </a>
          )}
          <a href="#visit" className={`${base} bg-jamin-red text-white`}>
            Book a visit
          </a>
        </div>
      </div>
    </>
  );
}
