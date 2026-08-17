import Link from "next/link";
import type { ReactNode } from "react";

/**
 * The shared primitives. §54 of the brief: one visual system, not forty pages
 * each inventing their own. Every measurement here comes from the golden-ratio
 * tokens in globals.css rather than from arbitrary pixel values.
 */

/** The single page gutter. Changing the site's measure happens here, once. */
export function Container({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`mx-auto max-w-[1280px] px-5 lg:px-10 ${className}`}>{children}</div>;
}

/** The small gold-ruled eyebrow that opens every section. */
export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    /* ⚠️ RIGHT-ALIGNED (owner, 2026-08-17): "all the tabs and captions
       everywhere: move to the right." `justify-end` walks the caption to its
       container's right edge on every section that uses it; the rule still
       leads INTO the label reading left-to-right, so the mark keeps its
       direction while the pair changes side. */
    <div className="flex items-center justify-end gap-3">
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
  return (
    <div className="rounded-xl border border-line bg-canvas-alt px-phi4 py-phi6 text-center">
      <div className="mx-auto h-px w-16 rule-gold" />
      {/* h2, not h3: an empty state is usually the only thing under the page's
          h1, and jumping a level breaks the outline screen-reader users
          navigate by. The audit caught this on /journal. */}
      <h2 className="mt-phi3 text-xl text-ink">{title}</h2>
      <p className="mx-auto mt-phi2 max-w-md text-base leading-relaxed text-ink-muted">{body}</p>
      {action ? <div className="mt-phi3 flex justify-center gap-3">{action}</div> : null}
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
