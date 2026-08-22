import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";
import { paneHue } from "@/lib/stones";

/**
 * The shared primitives. §54 of the brief: one visual system, not forty pages
 * each inventing their own. Every measurement here comes from the golden-ratio
 * tokens in globals.css rather than from arbitrary pixel values.
 */

/** The single page gutter. Changing the site's measure happens here, once. */
export function Container({
  children,
  className = "",
  hue,
}: {
  children: ReactNode;
  className?: string;
  /**
   * The route's pane colour, stated ONCE per page (owner 2026-08-19).
   *
   * Every `.rj-pane` inside inherits `--rj-hue` from here, so a page names its
   * hue in one place instead of threading a prop into every block. Pass
   * `paneHue("/about")` — the map lives in lib/stones.ts and is meaning-led.
   */
  hue?: string;
}) {
  return (
    <div
      className={`mx-auto max-w-[1280px] px-5 lg:px-10 ${className}`}
      style={hue ? ({ "--rj-hue": hue } as CSSProperties) : undefined}
    >
      {children}
    </div>
  );
}

/**
 * A PANE — one of the route's coloured blocks (owner 2026-08-19).
 *
 * ⚠️ THE HUE IS A ROUTE PROPERTY, NOT A PER-BLOCK CHOICE. Pass `route` and the
 * pane looks its colour up in lib/stones.ts. Every block on a page therefore
 * wears the same hue and the page reads as one object — the alternative, a
 * different colour per block, is a paint chart, not a design. `hue` exists for
 * the one case a route genuinely varies: a property page takes its own
 * development's district stone.
 *
 * ⚠️ IT RE-SCOPES ITS OWN INK, and that is why 40% is safe. `--color-ink-muted`
 * measures under 4.5:1 on every pungent pane; the class overrides the token
 * inside the pane so every Tailwind utility beneath it follows, which is the
 * same mechanism PropertyCard's `data-tier` uses to re-scope a Crown card to
 * onyx. Nothing at the call site has to know.
 */
export function Pane({
  children,
  route,
  hue,
  className = "",
  as: Tag = "div",
  flat = false,
  mix,
}: {
  children: ReactNode;
  route?: string;
  hue?: string;
  className?: string;
  as?: "div" | "section";
  /**
   * 🚨 THE HUE AND THE FROST WITHOUT THE CARD (owner 2026-08-21: "all the
   * hues… the frosty glass stuff is gone. bring them back").
   *
   * Five pages had the pane stripped in reports 10, 11 and 13 — and every one
   * of those complaints named the outer CARD, not the colour. Because one
   * class carried the card edges AND the hue AND the gloss AND the
   * backdrop-filter, removing the first removed all four. `flat` keeps the
   * ground, the specular and the frost and drops only the radius, the side
   * borders and the shadow, leaving a gold rule above and below — which is
   * report 10's own "just maintain the border line for the section before and
   * after". Pair it with a full-bleed wrapper so it reads as a band.
   */
  flat?: boolean;
  /**
   * Overrides the ground's tint, e.g. `"24%"`. ⚠️ LOWER ONLY. The audited
   * default is 40% and the ink re-scope was measured against it; a lighter
   * ground can only improve those ratios, a heavier one invalidates them.
   */
  mix?: string;
}) {
  return (
    <Tag
      className={`rj-pane ${flat ? "rj-pane-flat" : ""} ${className}`}
      /* 🚨 UNDEFINED WHEN NEITHER IS GIVEN — it must INHERIT, not default.
         This shipped as `hue ?? paneHue(route ?? "/")`, which meant a bare
         <Pane> wrote the HOME hue onto itself and beat the `--rj-hue` its
         Container had just set. Every page came out vermilion; /about was
         salmon instead of canopy and it looked like the route map was wrong
         when the map was right. An inline style beats the cascade, so writing
         a fallback here is writing an override. */
      /* ⚠️ `--rj-pane-mix` rides the SAME style object. Two `style` attributes
         on one element is not a merge — JSX keeps the last and silently drops
         the first, which is the trap the homepage's stage cards already
         record. Both properties are written here or neither is. */
      style={
        hue || route || mix
          ? ({
              ...(hue || route ? { "--rj-hue": hue ?? paneHue(route!) } : {}),
              ...(mix ? { "--rj-pane-mix": mix } : {}),
            } as CSSProperties)
          : undefined
      }
    >
      {children}
    </Tag>
  );
}

/** The small gold-ruled eyebrow that opens every section. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    /* ⚠️ LEFT-ALIGNED AGAIN (owner report 2026-08-18: "NOW SELLING" and
       "START HERE" both flagged as "disconnected from the section heading",
       with the same correction asked for "all similar section labels").
       This REVERSES the 2026-08-17 "captions to the right" sweep for
       SECTION labels only — a label above a left heading belongs on the
       heading's own edge. PageHero's hero eyebrows and `.rj-eyebrow` card
       captions keep the right-hand rule; they sit on plates, not above
       headings, and the report does not name them. */
    <div className="flex items-center gap-3">
      {/* The rule now ends in a station mark rather than simply stopping — the
          same lozenge the prose bullets use, so a section opening and a list
          item are visibly the same hand. Decoration: `aria-hidden`, and the
          label itself is unchanged. */}
      {/* The station mark takes the SIGNAL RED (owner 2026-08-17, the "too
          much beige" round): one solid drop of the brand in every section
          opening, against the bronze rule it terminates. Small on purpose —
          a dot of signal, not a red bar. */}
      <span className="flex items-center gap-1.5" aria-hidden="true">
        <span className="h-px w-10 bg-jamin-gold" />
        <span className="h-1.5 w-1.5 rotate-45 rounded-[1px] bg-cta" />
      </span>
      <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-ink">
        {children}
      </span>
    </div>
  );
}

export function SectionHead({
  label,
  title,
  lead,
  action,
}: {
  label?: string;
  title: string;
  lead?: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-phi3">
      <div className="max-w-2xl">
        {label ? <SectionLabel>{label}</SectionLabel> : null}
        <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">{title}</h2>
        {lead ? (
          <p className="mt-phi2 text-lg leading-relaxed text-ink-muted">{lead}</p>
        ) : null}
      </div>
      {action}
    </div>
  );
}

type BadgeTone = "neutral" | "gold" | "canopy" | "red";
const BADGE_TONE: Record<BadgeTone, string> = {
  neutral: "bg-canvas-sunken text-ink-soft",
  gold: "bg-jamin-gold-soft text-earth",
  canopy: "bg-canopy-soft text-canopy",
  red: "bg-jamin-red-soft text-jamin-red-deep",
};

export function Badge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: BadgeTone;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em] ${BADGE_TONE[tone]}`}
    >
      {children}
    </span>
  );
}

type ButtonVariant = "primary" | "secondary" | "quiet";
const BUTTON_VARIANT: Record<ButtonVariant, string> = {
  // §85: one primary action per view. Primary is the only filled red control —
  // which is exactly what "red as an accent" means: it appears once, on the
  // single thing you want pressed, and nowhere else on the page.
  primary:
    "bg-jamin-red text-white shadow-lift hover:-translate-y-0.5 hover:bg-jamin-red-deep hover:shadow-raise",
  // Secondary is charcoal-ruled rather than grey-ruled: on the warm ivory
  // ground a neutral grey outline goes muddy, where ink at low opacity stays
  // crisp and reads as considered.
  secondary:
    "border border-ink/15 bg-canvas/70 text-ink backdrop-blur-sm hover:-translate-y-0.5 hover:border-ink/35 hover:bg-canvas",
  quiet: "text-ink-soft hover:text-jamin-red-deep",
};

export function ButtonLink({
  href,
  children,
  variant = "primary",
  className = "",
  ...rest
}: {
  href: string;
  children: ReactNode;
  variant?: ButtonVariant;
  className?: string;
} & Omit<React.ComponentProps<typeof Link>, "href" | "className" | "children">) {
  const base =
    "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-tiny font-semibold uppercase tracking-[0.12em] transition-all duration-500 [transition-timing-function:var(--ease-silk)]";
  // An external link must not go through the client router.
  if (/^https?:/.test(href)) {
    return (
      <a
        href={href}
        className={`${base} ${BUTTON_VARIANT[variant]} ${className}`}
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={`${base} ${BUTTON_VARIANT[variant]} ${className}`} {...rest}>
      {children}
    </Link>
  );
}

/* ---------- states (§62 / §63 / §64) ---------- */

/** Skeletons, not a spinner over the whole page. Shapes match what loads. */
export function Skeleton({ className = "" }: { className?: string }) {
  return (
    /* ⚠️ `rj-shimmer`, not `animate-pulse`. A pulse fades the whole block in
       and out, which reads as something blinking at the reader; a light
       travelling across a block that stays put reads as something arriving.
       `relative overflow-hidden` is given HERE rather than by the class,
       because ornament.css is unlayered and a `position` declared there would
       beat every Tailwind utility — the trap that unstuck the navbar once. */
    <div
      className={`rj-shimmer relative overflow-hidden rounded-md bg-canvas-sunken ${className}`}
      aria-hidden="true"
    />
  );
}

export function CardSkeletonGrid({ count = 3 }: { count?: number }) {
  return (
    <div className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="overflow-hidden rounded-card border border-line bg-canvas">
          <Skeleton className="aspect-[4/3] rounded-none" />
          <div className="space-y-3 p-phi3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * §64: an empty state earns its place by offering the next move. "No results"
 * on its own is a dead end, so this always takes an action.
 */
export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body: string;
  action?: ReactNode;
}) {
  /* ⚠️ `px-phi3` UNTIL `sm`. On a 375px phone this card sits inside a Container
     (px-5) and a Pane (p-phi3), so `px-phi4` left its buttons just 223px to
     live in — short of what "Tell us what you want" needs on one line at this
     tracking. Dropping to phi3 there returns 26px. Desktop is unchanged.

     ⚠️ A PLAIN COMMENT, ABOVE THE RETURN. Written as a JSX comment it sat
     BESIDE the root div and made two sibling roots — "JSX expressions must have
     one parent element".

     ⚠️ AND DO NOT SPELL THE JSX COMMENT DELIMITERS OUT IN HERE. The first
     attempt at this note quoted them literally, and the closing pair ended THIS
     block comment on its own line — everything below it parsed as code.
   */
  return (
    <div className="rounded-xl border border-line bg-canvas-alt px-phi3 py-phi5 text-center sm:px-phi4 sm:py-phi6">
      <div className="mx-auto h-px w-16 rule-gold" />
      {/* h2, not h3: an empty state is usually the only thing under the page's
          h1, and jumping a level breaks the outline screen-reader users
          navigate by. The audit caught this on /journal. */}
      <h2 className="mt-phi3 text-xl text-ink">{title}</h2>
      <p className="mx-auto mt-phi2 max-w-md text-base leading-relaxed text-ink-muted">{body}</p>
      {/* 🚨 STACKED UNTIL `sm` (report 17: the two buttons "are currently
          placed side by side, but causing the buttons to look cramped and
          poorly aligned… If the available width is insufficient, place the
          buttons in two separate rows").

          It was a bare `flex`, so on a 375px phone the two controls shared one
          line and each shrank until its label broke — "TELL US / WHAT / YOU /
          WANT" over four lines in the report's screenshot. A column below `sm`
          gives each its own row; from `sm` they return to a wrapping row, which
          is the "side by side with proper spacing" half of the same request.

          ⚠️ THE COLUMN DELIBERATELY DOES *NOT* CARRY `items-center`, and that
          was a correction. Centred, each pill shrinks to fit its own label and
          "Tell us what you want" — 21 uppercase characters at 0.12em tracking —
          still broke onto a second line inside a 223px pill. Left to stretch,
          the same pill is the card's full 267px, the label has 211px to sit in,
          and it fits on one line. Measured both ways.

          It is also the pattern the hero already uses and documents: a flex
          column stretches its items, which is what makes a phone CTA fill its
          card rather than float in the middle of it. `sm:items-center` restores
          centring for the row form, where the two pills differ in height. */}
      {action ? (
        <div className="mt-phi3 flex flex-col justify-center gap-3 sm:flex-row sm:flex-wrap sm:items-center">
          {action}
        </div>
      ) : null}
    </div>
  );
}

/** A single figure with its caption. Only ever fed by a real count. */
export function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div>
      <div className="text-2xl font-light tracking-tight text-ink lg:text-3xl">{value}</div>
      <div className="mt-1 text-tiny uppercase tracking-[0.14em] text-ink-faint">{label}</div>
    </div>
  );
}
