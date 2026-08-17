import { getDeskContact } from "@/lib/site";

/**
 * JAMIN CARTOUCHE §4.2 — the Sweep.
 *
 * The oversized red quarter-round entering from the bottom-right of the
 * reference creative, carrying the phone number and the email. On the site it
 * is the contact-and-conversion surface and NOTHING else, and it appears on
 * exactly three surfaces: the homepage pre-footer, /contact, and the foot of
 * /property/[slug]. Do not add a fourth — the restraint is what keeps it a
 * signature rather than a texture.
 *
 * ⚠️ The contact values come from `platform_contacts.jamin_desk` via
 * getDeskContact(), the same single source the footer and DeskActions read —
 * never hard-code the number here (see the desk-contact memory rule).
 *
 * On mobile the quarter-round flattens to a full-width top arc.
 */
export async function Sweep({
  /** One line of context above the number, e.g. "Walk the land before you decide." */
  lead,
}: {
  lead?: string;
}) {
  const desk = await getDeskContact();
  const raw = desk.mobile ?? "+91 98844 00229";
  const email = desk.email ?? "info@jaminbazaar.in";
  const tel = raw.replace(/[^\d+]/g, "");
  /* Displayed with the country code set apart and the Indian 5-5 split
     (owner 2026-08-17: "give spacing, one after the country code") — the
     database keeps the raw string, the tel: link uses digits only, and only
     the DISPLAY is grouped. A number that is not +91-and-ten-digits prints
     exactly as recorded. */
  const m = tel.match(/^\+91(\d{5})(\d{5})$/);
  const phone = m ? `+91 ${m[1]} ${m[2]}` : raw;

  return (
    <section aria-label="Contact the desk" className="relative overflow-hidden">
      {/* The sweep itself: bleeds off the right and bottom edges.
          `rj-velvet` (Gilded Register §1): the flat signal red becomes the
          oxblood sweep, with the certificate rule riding its top edge. */}
      <div
        className="rj-velvet relative ml-auto flex flex-col items-start justify-end text-white"
        style={{
          borderRadius: "60% 0 0 0 / 100% 0 0 0",
          minHeight: "34vh",
          width: "100%",
          maxWidth: "100%",
          padding:
            "clamp(3.5rem, 9vw, 7rem) clamp(1.25rem, 6vw, 5rem) clamp(2rem, 5vw, 3.5rem) clamp(2.5rem, 14vw, 12rem)",
        }}
      >
        <div className="relative ml-auto max-w-2xl text-right">
          {lead && (
            <p
              className="text-tiny uppercase"
              style={{
                fontWeight: 600,
                letterSpacing: "0.14em",
                color: "rgba(255,255,255,0.85)",
              }}
            >
              {lead}
            </p>
          )}
          <a
            href={`tel:${tel}`}
            className="mt-phi2 block text-3xl font-extrabold uppercase text-white no-underline sm:text-4xl"
            /* Inter 800 with tabular figures — a phone number is a figure of
               record, and tnum keeps its digits on an even pitch. */
            style={{
              letterSpacing: "-0.01em",
              lineHeight: 0.95,
              fontFeatureSettings: "'tnum' 1, 'zero' 1",
            }}
          >
            {phone}
          </a>
          {/* The hairline between number and email, exactly as the creative
              rules it. */}
          <div
            aria-hidden="true"
            className="ml-auto mt-phi3 h-px w-full max-w-sm"
            style={{ background: "var(--color-jamin-gold-light)", opacity: 0.65 }}
          />
          <a
            href={`mailto:${email}`}
            className="mt-phi2 block text-lg text-white/90 no-underline hover:text-white"
          >
            {email}
          </a>
        </div>
      </div>
    </section>
  );
}
