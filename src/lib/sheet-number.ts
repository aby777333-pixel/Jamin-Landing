/**
 * JAMIN CARTOUCHE §4.3 — deterministic drawing-sheet serials.
 *
 * The Docket's third line is always a mono serial in the creative's `EP-016`
 * convention, re-purposed as sheet numbers: `JG-SLM-061` is Salem's 61-plot
 * sheet. Deterministic and stable across rebuilds: the same inputs always
 * yield the same serial, and no randomness or date is involved.
 *
 * Shape: `JG-{DISTRICT}-{NNN}` where DISTRICT is the survey office's own
 * three-letter registration code and NNN is the plot count when the project
 * has one, else a stable checksum of the slug so projects without a recorded
 * schedule still carry a serial that never wanders.
 *
 * Self-check (run in your head — these are the spec's own examples):
 *   sheetNumber("Salem", "jamin-new-project-jul-2026", 61)  → "JG-SLM-061"
 *   sheetNumber("Erode", "jamin-garden-shastri-nagar", 16)  → "JG-ERD-016"
 */
const DISTRICT_CODE: Record<string, string> = {
  salem: "SLM",
  erode: "ERD",
  coimbatore: "CBE",
  tiruppur: "TPR",
};

/** Stable 1–999 checksum for a slug — plain djb2, no Date, no Math.random. */
function checksum(text: string): number {
  let h = 5381;
  for (let i = 0; i < text.length; i++) h = (h * 33 + text.charCodeAt(i)) >>> 0;
  return (h % 999) + 1;
}

export function sheetNumber(
  district?: string | null,
  slug?: string | null,
  plots?: number | null,
): string {
  const key = (district ?? "").trim().toLowerCase();
  const code = DISTRICT_CODE[key] ?? (key ? key.slice(0, 3).toUpperCase() : "TN");
  const n = plots && plots > 0 ? plots : checksum(slug ?? code);
  return `JG-${code}-${String(Math.min(n, 999)).padStart(3, "0")}`;
}
