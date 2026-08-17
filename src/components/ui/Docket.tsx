/**
 * JAMIN CARTOUCHE §4.3 — the Docket.
 *
 * The small caption block from the reference creative: a vertical rule at the
 * left, then three stacked lines of decreasing weight — name, record, serial.
 * It is the site's workhorse; it is what makes a page read as a document
 * rather than a brochure. The third line is always a mono sheet serial from
 * lib/sheet-number.ts.
 *
 * Server component, zero state. `onDark` flips the ink for use over imagery
 * (a property-card scrim, a cinematic hero) — the rule colour stays the same
 * because bronze and red both read on either ground at 2px width.
 */
const RULE: Record<string, string> = {
  bronze: "var(--color-jamin-gold)",
  red: "var(--color-cta)",
  teal: "var(--color-emerald-deep)",
};

export function Docket({
  lines,
  rule = "bronze",
  onDark = false,
}: {
  /** [name, record, serial] — render order is top to bottom; pass fewer for a
   *  shorter docket. The LAST line always sets in mono. */
  lines: (string | null | undefined)[];
  rule?: "bronze" | "red" | "teal";
  onDark?: boolean;
}) {
  const rows = lines.filter((l): l is string => Boolean(l && l.trim()));
  if (rows.length === 0) return null;
  return (
    <div
      className="flex items-stretch gap-2.5"
      style={{ borderLeft: `2px solid ${RULE[rule]}`, paddingLeft: "0.75rem" }}
    >
      <div className="flex min-w-0 flex-col justify-center gap-0.5">
        {rows.map((line, i) => {
          const isSerial = i === rows.length - 1 && rows.length > 1;
          if (isSerial) {
            return (
              <span
                key={line}
                className="truncate text-micro uppercase"
                style={{
                  fontFamily: "var(--font-mono), monospace",
                  letterSpacing: "0.12em",
                  color: onDark ? "var(--color-jamin-gold-light)" : "var(--color-jamin-gold-ink)",
                }}
              >
                {line}
              </span>
            );
          }
          if (i === 0) {
            return (
              <span
                key={line}
                className="truncate text-base font-semibold"
                style={{
                  fontFamily: "var(--font-display), sans-serif",
                  color: onDark ? "#fff" : "var(--color-ink)",
                }}
              >
                {line}
              </span>
            );
          }
          return (
            <span
              key={line}
              className="truncate text-tiny"
              style={{ color: onDark ? "rgba(255,255,255,0.82)" : "var(--color-ink-muted)" }}
            >
              {line}
            </span>
          );
        })}
      </div>
    </div>
  );
}
