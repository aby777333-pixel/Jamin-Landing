/**
 * The survey number, set very large and very faint into the page behind the
 * record — a watermark that carries evidence instead of branding.
 *
 * `.rj-seal` (ornament.css §7) already embosses the logo mark into the approval
 * band. That is decoration: it says "Jamin", which the reader knew. This says
 * which parcel of land they are looking at, which is the one fact the whole
 * page exists to establish, and it happens to be a beautiful thing to set at
 * 96px in 4% ink.
 *
 * 🚨 `isolate` ON THE HOST AND `-z-10` HERE, BOTH REQUIRED. An absolutely
 * positioned element paints ABOVE its static siblings whatever its opacity, so
 * without the pair this tints the headline it sits behind — measured on the
 * trust panel, where even 6% alpha lifted the type. The host must carry
 * `isolate relative`; this component cannot add it, because a stacking context
 * created here would not contain the siblings it needs to sit under.
 *
 * ⚠️ `aria-hidden`. The survey number is already printed, legibly, in the
 * record beside it — `ApprovalStrip` and `ProvenanceRibbon` both carry it. A
 * screen reader announcing it a third time is noise, and this instance is the
 * one that is decoration.
 *
 * ⚠️ It renders nothing without a survey number rather than falling back to the
 * project name. A watermark that says something other than the parcel is the
 * logo mark again, and that already exists.
 */
export function SurveyWatermark({ surveyNumber }: { surveyNumber?: string | null }) {
  const value = surveyNumber?.trim();
  if (!value) return null;

  /* Only the first reference. Edappadi records two ("214/1B, 214/2, 215/1" is
     three), and the whole string set at watermark scale would either wrap into
     a block of grey or shrink until it stopped reading as a watermark. The
     first is the one the record leads with. */
  const lead = value.split(",")[0].trim();

  return (
    <span
      aria-hidden="true"
      className="ledger pointer-events-none absolute -z-10 select-none whitespace-nowrap text-[clamp(3rem,11vw,7rem)] font-light leading-none tracking-tight text-ink opacity-[0.045] right-0 bottom-0 translate-y-[0.18em]"
    >
      {lead}
    </span>
  );
}
