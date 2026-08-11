import Image from "next/image";
import type { CSSProperties } from "react";

/**
 * THE VAULT'S IMAGE PLACEHOLDER — an engraved plate, not a grey box.
 *
 * Every category, destination, intent path and dossier in The Vault has a place
 * for a photograph, and almost none of them have one yet. The brief asks for
 * placeholders; the question is what kind. A grey rectangle with a camera icon
 * would undo the whole page — a private-bank aesthetic cannot survive a
 * "missing image" graphic repeated nineteen times.
 *
 * So the placeholder is a drawn plate: onyx ground, a champagne hairline, and a
 * fine engraved motif chosen from the subject. It is deliberately abstract —
 * it depicts a coastline or a ridge or a facade as a line drawing, so it says
 * "this is a coastal category" without pretending to be a photograph of a
 * property Jamin does not have. §22's rule against implying things we have not
 * verified applies to pictures as much as to words.
 *
 * ⚠️ REPLACING ONE IS A CONSOLE EDIT, NOT A DEPLOY. `image_url` on the category,
 * destination or listing row wins whenever it is set; the plate is what renders
 * in its absence. That is why the placeholders are drawn here rather than
 * shipped as files in `public/` — a file placeholder has to be deleted by hand
 * once real art arrives, and the one that gets forgotten is the one that stays
 * on the page for a year.
 *
 * ⚠️ `fill="var(--x)"` DOES NOT RESOLVE. An SVG presentation attribute is not a
 * CSS declaration, so every colour below goes through `style`. Written the
 * obvious way, every one of these plates renders solid black.
 */

type Motif =
  | "coast"
  | "ridge"
  | "field"
  | "facade"
  | "arch"
  | "roofline"
  | "tower"
  | "contour"
  | "estate";

/** Presentation only — which line drawing suits which subject. Content still
 *  comes from the database; this maps a slug to a pencil. Anything unknown
 *  falls through to a stable hash, so a family added in the console gets a
 *  consistent plate rather than a blank one. */
const MOTIF_BY_SLUG: Record<string, Motif> = {
  "coastal-and-waterfront": "coast",
  "mountains-and-nature": "ridge",
  "land-and-agricultural-estates": "field",
  "exceptional-residences": "facade",
  "heritage-india": "arch",
  "hospitality-and-investment-assets": "roofline",
  "rare-commercial-assets": "tower",
  buy: "estate",
  rent: "facade",
  sell: "arch",
  lease: "roofline",
};

const MOTIFS: Motif[] = [
  "coast",
  "ridge",
  "field",
  "facade",
  "arch",
  "roofline",
  "tower",
  "contour",
  "estate",
];

/** Small, stable, and not trying to be a hash function — it only has to spread
 *  slugs across nine motifs and give the same answer on the server and in the
 *  browser. */
function hash(seed: string) {
  let h = 0;
  for (let i = 0; i < seed.length; i += 1) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return h;
}

function motifFor(seed: string, kind?: "destination"): Motif {
  if (MOTIF_BY_SLUG[seed]) return MOTIF_BY_SLUG[seed];
  if (kind === "destination") return "contour";
  return MOTIFS[hash(seed) % MOTIFS.length];
}

const GOLD: CSSProperties = { stroke: "var(--color-champagne-500)", fill: "none" };
const GOLD_SOFT: CSSProperties = { stroke: "var(--color-champagne-700)", fill: "none" };
const PLAT: CSSProperties = { stroke: "var(--color-plat-800)", fill: "none" };

/**
 * The drawing itself. One 800×500 frame per motif, all built from the same
 * vocabulary — a horizon, a mass, and a few fine lines — so nine different
 * plates still read as one set.
 */
function Drawing({ motif, offset }: { motif: Motif; offset: number }) {
  // A small deterministic wobble so two categories sharing a motif are not
  // pixel-identical. Bounded hard: this is texture, never composition.
  const o = (offset % 7) - 3;

  switch (motif) {
    case "coast":
      return (
        <g>
          <circle cx={600} cy={188 + o} r={46} style={{ ...GOLD_SOFT, strokeWidth: 1 }} />
          <path d={`M0 ${250 + o} H800`} style={{ ...GOLD, strokeWidth: 1.2, opacity: 0.55 }} />
          {[0, 1, 2, 3, 4, 5, 6].map((i) => (
            <path
              key={i}
              d={`M${40 + i * 18} ${292 + i * 26 + o} q 120 -${14 + i * 2} 240 0 q 120 ${14 + i * 2} 240 0 q 120 -${10 + i} 200 4`}
              style={{ ...PLAT, strokeWidth: 1, opacity: 0.5 - i * 0.05 }}
            />
          ))}
        </g>
      );
    case "ridge":
      return (
        <g>
          <path
            d={`M0 ${330 + o} L150 ${210 + o} L250 ${268 + o} L390 ${150 + o} L520 ${262 + o} L640 ${196 + o} L800 ${312 + o}`}
            style={{ ...GOLD, strokeWidth: 1.4, opacity: 0.7 }}
          />
          <path
            d={`M0 ${392 + o} L190 ${290 + o} L330 ${346 + o} L470 ${256 + o} L620 ${330 + o} L800 ${268 + o}`}
            style={{ ...PLAT, strokeWidth: 1.1, opacity: 0.55 }}
          />
          <path d={`M0 ${446} H800`} style={{ ...GOLD_SOFT, strokeWidth: 1, opacity: 0.4 }} />
        </g>
      );
    case "field":
      return (
        <g>
          <path d={`M0 ${236 + o} H800`} style={{ ...GOLD, strokeWidth: 1.2, opacity: 0.5 }} />
          {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <path
              key={i}
              d={`M${400 + (i - 4) * 26} ${236 + o} L${400 + (i - 4) * 132} 500`}
              style={{ ...PLAT, strokeWidth: 1, opacity: 0.45 }}
            />
          ))}
          {[0, 1, 2, 3].map((i) => (
            <path
              key={`h${i}`}
              d={`M0 ${288 + i * i * 22 + i * 24} H800`}
              style={{ ...GOLD_SOFT, strokeWidth: 1, opacity: 0.35 }}
            />
          ))}
        </g>
      );
    case "facade":
      return (
        <g>
          <rect
            x={228}
            y={132 + o}
            width={344}
            height={300}
            rx={4}
            style={{ ...GOLD, strokeWidth: 1.3, opacity: 0.6 }}
          />
          {[0, 1, 2, 3].map((r) =>
            [0, 1, 2, 3, 4].map((c) => (
              <rect
                key={`${r}-${c}`}
                x={252 + c * 62}
                y={158 + o + r * 70}
                width={38}
                height={46}
                style={{ ...PLAT, strokeWidth: 1, opacity: 0.5 }}
              />
            )),
          )}
          <path d={`M120 ${432} H680`} style={{ ...GOLD_SOFT, strokeWidth: 1, opacity: 0.45 }} />
        </g>
      );
    case "arch":
      return (
        <g>
          <path
            d={`M282 ${430} V${252 + o} q118 -${128 + o} 236 0 V${430}`}
            style={{ ...GOLD, strokeWidth: 1.5, opacity: 0.72 }}
          />
          <path
            d={`M320 ${430} V${268 + o} q80 -${92} 160 0 V${430}`}
            style={{ ...GOLD_SOFT, strokeWidth: 1, opacity: 0.5 }}
          />
          <path d={`M212 ${430} H588`} style={{ ...GOLD, strokeWidth: 1.2, opacity: 0.5 }} />
          {[0, 1].map((i) => (
            <path
              key={i}
              d={`M${232 + i * 320} ${430} V${300 + o}`}
              style={{ ...PLAT, strokeWidth: 1, opacity: 0.5 }}
            />
          ))}
        </g>
      );
    case "roofline":
      return (
        <g>
          <path
            d={`M120 ${300 + o} L268 ${212 + o} L416 ${300 + o}`}
            style={{ ...GOLD, strokeWidth: 1.4, opacity: 0.7 }}
          />
          <path
            d={`M384 ${330 + o} L532 ${248 + o} L680 ${330 + o}`}
            style={{ ...GOLD_SOFT, strokeWidth: 1.2, opacity: 0.55 }}
          />
          <path d={`M96 ${400} H704`} style={{ ...GOLD, strokeWidth: 1.1, opacity: 0.45 }} />
          {[0, 1, 2, 3, 4].map((i) => (
            <circle
              key={i}
              cx={188 + i * 106}
              cy={362}
              r={3}
              style={{ fill: "var(--color-champagne-500)", opacity: 0.65 }}
            />
          ))}
        </g>
      );
    case "tower":
      return (
        <g>
          {[0, 1, 2].map((i) => (
            <rect
              key={i}
              x={244 + i * 108}
              y={168 + o + i * 44}
              width={82}
              height={264 - i * 44}
              style={{ ...(i === 1 ? GOLD : PLAT), strokeWidth: 1.2, opacity: 0.6 }}
            />
          ))}
          {[0, 1, 2, 3, 4].map((r) => (
            <path
              key={r}
              d={`M244 ${212 + o + r * 44} H570`}
              style={{ ...PLAT, strokeWidth: 0.8, opacity: 0.35 }}
            />
          ))}
          <path d={`M180 ${432} H640`} style={{ ...GOLD_SOFT, strokeWidth: 1, opacity: 0.45 }} />
        </g>
      );
    case "contour":
      return (
        <g>
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <ellipse
              key={i}
              cx={400}
              cy={280 + o}
              rx={70 + i * 58}
              ry={34 + i * 27}
              style={{
                ...(i % 2 ? GOLD_SOFT : PLAT),
                strokeWidth: 1,
                opacity: 0.5 - i * 0.055,
              }}
            />
          ))}
          <circle cx={400} cy={280 + o} r={4} style={{ fill: "var(--color-champagne-500)" }} />
        </g>
      );
    default:
      return (
        <g>
          <path d={`M0 ${318 + o} H800`} style={{ ...GOLD_SOFT, strokeWidth: 1, opacity: 0.4 }} />
          <path
            d={`M188 ${318 + o} V${222 + o} L286 ${168 + o} L384 ${222 + o} V${318 + o}`}
            style={{ ...GOLD, strokeWidth: 1.4, opacity: 0.7 }}
          />
          <rect
            x={412}
            y={236 + o}
            width={200}
            height={82}
            style={{ ...PLAT, strokeWidth: 1.1, opacity: 0.55 }}
          />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <path
              key={i}
              d={`M${70 + i * 128} ${376} v${18 + (i % 3) * 10}`}
              style={{ ...PLAT, strokeWidth: 1, opacity: 0.4 }}
            />
          ))}
          <path d={`M0 ${430} H800`} style={{ ...GOLD, strokeWidth: 1, opacity: 0.32 }} />
        </g>
      );
  }
}

export function VaultPlate({
  src,
  alt = "",
  seed,
  kind,
  label,
  className = "",
  sizes = "(min-width: 1024px) 33vw, 100vw",
  priority,
}: {
  /** A real photograph from the console. Wins whenever it is present. */
  src?: string | null;
  alt?: string;
  /** Slug the plate is drawn from — stable, so the art never shuffles. */
  seed: string;
  kind?: "destination";
  /** Engraved into the plate's foot. Omit on plates that sit under a caption. */
  label?: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        className={`object-cover ${className}`}
      />
    );
  }

  const motif = motifFor(seed, kind);
  const gid = `vp-${seed.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      viewBox="0 0 800 500"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full ${className}`}
    >
      <defs>
        {/* Blue hour, drawn rather than photographed: a little warmth low in the
            frame where a horizon would be, onyx everywhere else. */}
        <linearGradient id={gid} x1="0" y1="0" x2="0.35" y2="1">
          <stop offset="0%" style={{ stopColor: "var(--color-onyx-900)" }} />
          <stop offset="62%" style={{ stopColor: "var(--color-onyx-800)" }} />
          <stop offset="100%" style={{ stopColor: "var(--color-onyx-700)" }} />
        </linearGradient>
      </defs>

      <rect width="800" height="500" style={{ fill: `url(#${gid})` }} />
      <Drawing motif={motif} offset={hash(seed)} />

      {/* The inset hairline is what makes it read as a plate rather than as a
          failed image. 14px in, so it survives any crop the container applies. */}
      <rect
        x="14"
        y="14"
        width="772"
        height="472"
        style={{
          fill: "none",
          stroke: "var(--color-champagne-500)",
          strokeWidth: 1,
          opacity: 0.28,
        }}
      />

      {label ? (
        <text
          x="34"
          y="462"
          style={{
            fill: "var(--color-champagne-300)",
            fontSize: "17px",
            letterSpacing: "3.4px",
            textTransform: "uppercase",
            opacity: 0.72,
          }}
        >
          {label.toUpperCase()}
        </text>
      ) : null}
    </svg>
  );
}
