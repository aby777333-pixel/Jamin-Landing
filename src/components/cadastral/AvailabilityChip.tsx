/**
 * How much of a layout is left, as a plot grid rather than a sentence.
 *
 * One cell per plot: sold filled in ink red, available left as an outline. A
 * buyer reads "nearly gone" or "just opened" in about a second, which is the
 * question they actually arrived with — and it is true by construction, because
 * both figures come from the same record the app's admin console edits.
 *
 * ⚠️ Renders nothing unless BOTH counts are present and coherent. A grid drawn
 * from a guessed total would be a picture of availability that is not real, and
 * on plots that is a claim, not a graphic.
 */
const MAX_CELLS = 36;
const COLS = 12;
/** A grid of one, two or three squares says nothing a sentence does not already
 *  say better, and the card already prints the count. */
const MIN_TO_DRAW = 4;
/** ⚠️ Fixed pixels, not `1fr`. With `minmax(0,1fr)` a four-plot layout stretched
 *  four squares across the whole card and a one-plot layout drew a single
 *  square the width of the column — which added 300px to the card height. */
const CELL = 9;

export function AvailabilityChip({
  total,
  available,
}: {
  total: number | null;
  available: number | null;
}) {
  if (total == null || available == null) return null;
  if (total < MIN_TO_DRAW || available < 0 || available > total) return null;

  // Above the cap the grid stops being readable, so it becomes proportional
  // rather than one-cell-per-plot — and the label below says which it is.
  const scaled = total > MAX_CELLS;
  const cells = scaled ? MAX_CELLS : total;
  const soldCells = Math.round(((total - available) / total) * cells);

  return (
    <div>
      <div
        className="grid gap-[3px]"
        style={{ gridTemplateColumns: `repeat(${Math.min(cells, COLS)}, ${CELL}px)` }}
        role="img"
        aria-label={`${available} of ${total} plots available`}
      >
        {Array.from({ length: cells }, (_, i) => (
          <span
            key={i}
            aria-hidden="true"
            style={{ width: CELL, height: CELL }}
            className={`rounded-[2px] transition-colors duration-300 ${
              i < soldCells ? "bg-jamin-red-deep" : "border border-line-red bg-canvas"
            }`}
          />
        ))}
      </div>
      <p className="ledger-label mt-2">
        <span className="ledger">{available}</span> of <span className="ledger">{total}</span>{" "}
        available{scaled ? " · to scale" : ""}
      </p>
    </div>
  );
}
