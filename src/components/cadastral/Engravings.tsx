/**
 * THE ENGRAVED PLATES (aesthetics round 2026-08-18, items 14 · 15 · 16 ·
 * 17 · 18 · 19) — hairline vector art in the SurveyIcon hand: every shape
 * traces to a land document, a survey instrument or the formed ground
 * itself; nothing is a lifestyle pictogram.
 *
 * All decoration: `aria-hidden` at every call site, colour always
 * `currentColor` so the caller's token paints it and carbon mode is free.
 */

const HAIR = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.1,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

/** Item 14 — isometric micro-dioramas: the gate, the formed road, the
 *  survey stone. Tiny scene-marks for section openers. */
export function IsoMark({
  name,
  className = "",
}: {
  name: "gate" | "road" | "stone";
  className?: string;
}) {
  return (
    <svg viewBox="0 0 48 32" className={className} aria-hidden="true" focusable="false">
      {name === "gate" && (
        <g {...HAIR}>
          {/* two pillars and a beam, in isometric projection */}
          <path d="M10 26 10 12 14 10 14 24Z" />
          <path d="M34 22 34 8 38 6 38 20Z" />
          <path d="M10 12 38 6 38 9 10 15Z" />
          <path d="M4 29 24 24 44 19" />
        </g>
      )}
      {name === "road" && (
        <g {...HAIR}>
          {/* a formed road receding, kerbs and centreline dashes */}
          <path d="M6 30 20 4" />
          <path d="M42 30 28 4" />
          <path d="M24 28 24 24M24 19 24 15M24 10 24 7" />
          <path d="M2 30 46 30" />
        </g>
      )}
      {name === "stone" && (
        <g {...HAIR}>
          {/* the survey stone: a truncated pyramid on formed ground */}
          <path d="M20 26 22 12 26 12 28 26Z" />
          <path d="M22 12 24 9 26 12" />
          <path d="M8 28 40 24" />
          <circle cx="24" cy="17" r="0.8" fill="currentColor" stroke="none" />
        </g>
      )}
    </svg>
  );
}

/** Item 16 — the survey instruments, watermark scale. */
export function InstrumentPlate({
  name,
  className = "",
}: {
  name: "theodolite" | "chain" | "rod" | "compass";
  className?: string;
}) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" focusable="false">
      {name === "theodolite" && (
        <g {...HAIR}>
          <circle cx="32" cy="22" r="8" />
          <path d="M24 22h16M32 14v16" />
          <path d="M32 30 32 38M22 54 32 38 42 54M26 54h12" />
          <circle cx="32" cy="22" r="2" />
        </g>
      )}
      {name === "chain" && (
        <g {...HAIR}>
          {/* the surveyor's chain: linked ovals with end handles */}
          <ellipse cx="14" cy="32" rx="5" ry="3" />
          <ellipse cx="24" cy="32" rx="5" ry="3" />
          <ellipse cx="34" cy="32" rx="5" ry="3" />
          <ellipse cx="44" cy="32" rx="5" ry="3" />
          <path d="M6 28v8M58 28v8M6 32h3M55 32h3" />
        </g>
      )}
      {name === "rod" && (
        <g {...HAIR}>
          {/* the ranging rod: banded staff on a station point */}
          <path d="M32 6v46" />
          <path d="M30 10h4M30 18h4M30 26h4M30 34h4M30 42h4" />
          <path d="M24 56l8-4 8 4" />
          <circle cx="32" cy="52" r="1" fill="currentColor" stroke="none" />
        </g>
      )}
      {name === "compass" && (
        <g {...HAIR}>
          <circle cx="32" cy="32" r="16" />
          <circle cx="32" cy="32" r="11" />
          <path d="M32 21 35 32 32 43 29 32Z" />
          <path d="M32 12v4M32 48v4M12 32h4M48 32h4" />
        </g>
      )}
    </svg>
  );
}

/** Item 15 — the compass rose whose needle settles north on arrival (the
 *  animation is CSS, keyed off Reveal's `rj-arrive`; static without JS). */
export function CompassRose({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={className} aria-hidden="true" focusable="false">
      <g {...HAIR}>
        <circle cx="40" cy="40" r="30" />
        <circle cx="40" cy="40" r="22" />
        <path d="M40 6v6M40 68v6M6 40h6M68 40h6" />
        <path d="M18 18l4 4M62 18l-4 4M18 62l4-4M62 62l-4-4" />
      </g>
      <g className="rj-needle">
        <path d="M40 20 44 40 40 60 36 40Z" fill="var(--color-cta)" opacity="0.85" />
        <path d="M40 20 44 40H36Z" fill="currentColor" opacity="0.5" />
      </g>
      <circle cx="40" cy="40" r="2.4" fill="currentColor" />
      <text
        x="40"
        y="14"
        textAnchor="middle"
        fontSize="8"
        fill="currentColor"
        style={{ letterSpacing: "0.08em" }}
      >
        N
      </text>
    </svg>
  );
}

/** Item 18 — the kolam corner: a 3×3 dot grid with one continuous loop,
 *  geometric and quietly Tamil. Position with utilities at the call site. */
export function KolamCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" className={className} aria-hidden="true" focusable="false">
      <g fill="currentColor">
        {[8, 20, 32].map((x) =>
          [8, 20, 32].map((y) => <circle key={`${x}-${y}`} cx={x} cy={y} r="1.1" />),
        )}
      </g>
      <path
        {...HAIR}
        d="M8 14c0-4 6-4 6 0s-6 4-6 0Zm12 0c0-4 6-4 6 0s-6 4-6 0ZM14 26c4 0 4 6 0 6s-4-6 0-6Zm12-6c0-4 6-4 6 0s-6 4-6 0Z"
      />
    </svg>
  );
}

/** Item 19 — the engraved frieze: banyan leaf and paddy stalk alternating
 *  as a hairline band. One pattern tile, repeated by SVG itself. */
export function FooterFrieze({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 640 28"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <pattern id="rj-frieze-tile" patternUnits="userSpaceOnUse" width="80" height="28">
          <g {...HAIR} opacity="0.9">
            {/* banyan leaf */}
            <path d="M16 22c-5-3-6-10 0-14 6 4 5 11 0 14Zm0 0v-12" />
            {/* paddy stalk */}
            <path d="M52 22c0-8 4-12 8-14M52 22c0-6-3-10-6-12M52 22v-2" />
            <path d="M58 12l3-2M56 15l3-2M49 13l-3-2M51 16l-3-2" />
          </g>
        </pattern>
      </defs>
      <rect width="640" height="28" fill="url(#rj-frieze-tile)" />
    </svg>
  );
}

/** Item 17 — the district monogram: an engraved seal ring carrying the
 *  district's initial. NOT a map silhouette — a hand-drawn boundary of a
 *  real district would be invented geography on a site whose argument is
 *  that its claims are checkable; a monogram invents nothing. Colour from
 *  the district stone at the call site. */
export function MonogramSeal({ letter, className = "" }: { letter: string; className?: string }) {
  return (
    <svg viewBox="0 0 72 72" className={className} aria-hidden="true" focusable="false">
      <g {...HAIR}>
        <circle cx="36" cy="36" r="32" />
        <circle cx="36" cy="36" r="27" />
        <path d="M36 4v5M36 63v5M4 36h5M63 36h5" />
      </g>
      <text
        x="36"
        y="47"
        textAnchor="middle"
        fontSize="30"
        fontWeight="600"
        fill="currentColor"
        style={{ letterSpacing: "0.02em" }}
      >
        {letter}
      </text>
    </svg>
  );
}
