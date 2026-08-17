/**
 * The four assurances, drawn instead of typed.
 *
 * ⚠️ These replace literal Unicode glyphs — `▦ ✓ ⌁ ₹`. A codepoint is rendered
 * by whatever font the reader's OS picks, so the set never matched itself
 * across platforms, and `⌁` (U+2301) is absent from most Windows and Android
 * font stacks entirely: the strongest trust block on the homepage could be
 * showing a buyer an empty box.
 *
 * One geometry for all four — 24px box, 1.25px stroke, `currentColor` — so they
 * inherit the tint classes already on the tiles and read as one set drawn by
 * one hand. Every shape is traceable to a land document or a survey instrument,
 * which is the whole test this system applies to anything decorative.
 */
export type SurveyIconName =
  | "stamp"
  | "deed"
  | "junction"
  | "ledger"
  /* Added 2026-08-11 for "Explore by Purpose". Same test as the first four:
     every shape is traceable to a land document or a survey instrument, so the
     set still reads as one hand. Nothing here is a pictogram of a lifestyle. */
  | "home"
  | "growth"
  | "leaf"
  | "building"
  /* Added 2026-08-12 for the property card's address line, which the UI report's
     reference design opens with a location marker.
     ⚠️ It is a SURVEY STATION, not a map pin. A teardrop pin is a web
     convention borrowed from a mapping product; a triangle with a centred dot
     over a levelled base is the symbol a surveyor actually leaves on the
     ground, which is the test this whole set has to pass. It is also the only
     icon here used at 14px rather than 24 — the 1.25px stroke survives the
     reduction because every shape in it is straight. */
  | "station"
  /* 🚨 `pin` OVERRULES THE NOTE ABOVE, AND THE OWNER MADE THAT CALL
     (2026-08-14). The argument for `station` still stands as drawing: a trig
     station IS the mark a surveyor leaves, and a teardrop IS a borrowed mapping
     convention. What the argument missed is how the shape reads at 14px on a
     line of prose — an outlined triangle with a dot in it is the near-universal
     glyph for a WARNING, and the report says exactly that: "looks like a
     warning symbol rather than a location indicator". An icon that has to be
     explained has already failed the line it sits on.
     ⚠️ `station` is kept in the set rather than deleted. It is now unused, and
     it is the right mark wherever a survey point is genuinely the subject —
     just not in front of a postal address. */
  | "pin"
  /* The view switcher on /properties, added 2026-08-14 — the controls were
     text-only and the report asked for icons. Same test as the rest of the set
     where it can be met: `grid` is a layout sheet's plot blocks, `list` is the
     plot SCHEDULE that accompanies it, and `map` is a folded survey sheet
     rather than a globe. */
  | "grid"
  | "list"
  | "map"
  /* The account statistics (2026-08-17 report) asked for a price-tag mark on
     "Selling now". Drawn as the label a registry ties to a parcel — a deed
     tag with its eyelet — not a shopping pictogram. */
  | "tag";

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.25,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/**
 * ⚠️ `size` is a separate prop rather than something you pass through
 * `className`. The box used to be a hard-coded `h-6 w-6` prefix, and appending
 * `h-3.5` after it does NOT reliably win: both are utilities in the same layer,
 * so the winner is decided by their order in the generated stylesheet, not by
 * their order in the string. That reads as an icon that ignores its size.
 */
export function SurveyIcon({
  name,
  className = "",
  size = "h-6 w-6",
}: {
  name: SurveyIconName;
  className?: string;
  size?: string;
}) {
  return (
    <svg viewBox="0 0 24 24" className={`${size} ${className}`} aria-hidden="true" focusable="false">
      {name === "tag" && (
        /* The deed tag: a parcel label with its eyelet, rotated the way one
           hangs. The rule line stands for the rate written on it. */
        <g {...STROKE}>
          <path d="M12.6 3.8h6.6a1 1 0 0 1 1 1v6.6a1 1 0 0 1-.3.7l-9 9a1 1 0 0 1-1.4 0l-6.6-6.6a1 1 0 0 1 0-1.4l9-9a1 1 0 0 1 .7-.3Z" />
          <circle cx="16.4" cy="7.6" r="1.4" />
          <path d="M8.4 13.2l3.4 3.4" />
        </g>
      )}

      {name === "stamp" && (
        /* A rubber approval stamp: double-ruled impression with the arc of text
           reduced to the arc itself, and the handle above it. */
        <g {...STROKE}>
          <circle cx="12" cy="13.5" r="7" />
          <circle cx="12" cy="13.5" r="4.6" />
          <path d="M9.2 13.6l1.9 1.9 3.7-3.9" />
          <path d="M12 6.5V4.2" />
        </g>
      )}

      {name === "deed" && (
        /* A deed with the corner turned — the dog-ear from the logo, and the
           reason the card fold exists at all. Rule lines stand for the text. */
        <g {...STROKE}>
          <path d="M5.5 3.5h9l4.5 4.5v12a1 1 0 0 1-1 1H5.5a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
          <path d="M14.5 3.5V8h4.5" />
          <path d="M7.8 12.5h8.4M7.8 15.5h8.4M7.8 18.2h5.2" />
        </g>
      )}

      {name === "junction" && (
        /* A road junction in plan, with the dashed centre line a layout drawing
           uses — roads formed to the sanctioned width, seen from above. */
        <g {...STROKE}>
          <path d="M3 8.5h18M3 15.5h18" />
          <path d="M8.5 3v18M15.5 3v18" />
          <path d="M12 4.6v2M12 9.8v2M12 15v2M12 19.4v-2" strokeDasharray="0.1 3.2" />
        </g>
      )}

      {name === "ledger" && (
        /* A ledger page: ruled lines and a column rule, the register a loan is
           entered into. */
        <g {...STROKE}>
          <rect x="3.6" y="4" width="16.8" height="16" rx="1.2" />
          <path d="M8.2 4v16" />
          <path d="M11 8.4h6.4M11 12h6.4M11 15.6h4" />
        </g>
      )}

      {name === "home" && (
        /* A house in ELEVATION, sitting inside its plot boundary — the drawing
           a sanctioned layout carries, not a roof-and-chimney pictogram. The
           setback line is what says "a plot you may build on". */
        <g {...STROKE}>
          <path d="M3.4 20.4h17.2" />
          <path d="M5.6 20.4v-8.2L12 7.2l6.4 5v8.2" />
          <path d="M10.2 20.4v-4.6h3.6v4.6" />
          <path d="M3.4 17.2h1.2M19.4 17.2h1.2" strokeDasharray="0.1 2.4" />
        </g>
      )}

      {name === "growth" && (
        /* A survey chain rising across a plot — value plotted over time, drawn
           as the stepped benchmark a levelling instrument records rather than
           as a stock-market arrow. */
        <g {...STROKE}>
          <path d="M3.6 20.2h16.8" />
          <path d="M3.6 20.2V4.2" />
          <path d="M6.4 16.6l3.6-3.4 3.2 2.4 5.6-6" />
          <path d="M15.6 9.6h4.2v4.2" />
          <circle cx="10" cy="13.2" r="0.9" />
        </g>
      )}

      {name === "leaf" && (
        /* Furrows running to a boundary — farmland in plan, the way an
           agricultural parcel is hatched on a drawing. */
        <g {...STROKE}>
          <rect x="3.4" y="4.6" width="17.2" height="14.8" rx="1.2" />
          <path d="M3.4 9.2c4.4 1.6 12.8 1.6 17.2 0M3.4 13.4c4.4 1.6 12.8 1.6 17.2 0M3.4 17.6c4.4 1.6 12.8 1.6 17.2 0" />
        </g>
      )}

      {name === "building" && (
        /* A commercial block in elevation, with the floor rules a plan uses and
           the frontage marked at the base. */
        <g {...STROKE}>
          <path d="M3.4 20.4h17.2" />
          <rect x="5.2" y="4.2" width="8.2" height="16.2" rx="0.8" />
          <rect x="13.4" y="9.4" width="5.4" height="11" rx="0.8" />
          <path d="M7.4 8h4M7.4 11.4h4M7.4 14.8h4M15.2 12.6h1.8M15.2 16h1.8" />
        </g>
      )}

      {name === "station" && (
        /* A trig station: the triangle of the observation, the centre mark it
           is set over, and the levelled ground line it is referenced to.
           ⚠️ UNUSED since 2026-08-14 — see the note on `pin` in the type. */
        <g {...STROKE}>
          <path d="M12 4.6 20 18.2H4Z" />
          <circle cx="12" cy="14.4" r="1.5" />
          <path d="M2.6 21.2h18.8" />
        </g>
      )}

      {name === "pin" && (
        /* An outlined location pin, drawn to this set's geometry rather than
           borrowed: the head is a true circle so the 1.25px stroke stays even
           at 14px, and the tip is two straight tangents rather than a bezier —
           a curve that tight goes muddy at this size, which is the same reason
           every other shape here is straight. */
        <g {...STROKE}>
          <path d="M12 21.2c0 0-6.6-7-6.6-11.4a6.6 6.6 0 0 1 13.2 0c0 4.4-6.6 11.4-6.6 11.4Z" />
          <circle cx="12" cy="9.6" r="2.4" />
        </g>
      )}

      {name === "grid" && (
        /* Plot blocks on a layout sheet — four parcels divided by the road
           reserve that separates them. */
        <g {...STROKE}>
          <rect x="3.8" y="3.8" width="6.6" height="6.6" rx="1" />
          <rect x="13.6" y="3.8" width="6.6" height="6.6" rx="1" />
          <rect x="3.8" y="13.6" width="6.6" height="6.6" rx="1" />
          <rect x="13.6" y="13.6" width="6.6" height="6.6" rx="1" />
        </g>
      )}

      {name === "list" && (
        /* The plot schedule that accompanies the sheet: a number column, then
           the entry against each. */
        <g {...STROKE}>
          <path d="M4.2 6.6h1.6M4.2 12h1.6M4.2 17.4h1.6" />
          <path d="M9 6.6h10.8M9 12h10.8M9 17.4h7.2" />
        </g>
      )}

      {name === "map" && (
        /* A survey sheet folded into three panels, the way a plan is carried to
           site — the creases are what make it a map rather than a page. */
        <g {...STROKE}>
          <path d="M3.6 6.2 9 4.2l6 2 5.4-2v13.6l-5.4 2-6-2-5.4 2Z" />
          <path d="M9 4.2v15.6M15 6.2v15.6" strokeDasharray="0.1 2.6" />
        </g>
      )}
    </svg>
  );
}
