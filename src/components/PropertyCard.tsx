import Image from "next/image";
import Link from "next/link";
import {
  approvalBadges,
  coverImage,
  formatArea,
  formatPrice,
  isSellable,
  locationLine,
  phaseLabel,
  propertyHref,
  type Property,
} from "@/lib/properties";

export function PropertyCard({ p, priority = false }: { p: Property; priority?: boolean }) {
  const cover = coverImage(p);
  const approvals = approvalBadges(p);
  const area = formatArea(p);
  const sellable = isSellable(p);

  return (
    /* `h-full` + column flex is what keeps a row of cards level. A grid item
       stretches to the tallest in its row, but a `block` child does not follow
       it, so a two-line title used to leave one card's base floating above its
       neighbours'. */
    <Link
      href={propertyHref(p)}
      className="group flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-canvas shadow-lift transition-all duration-500 hover:-translate-y-1.5 hover:border-line-red hover:shadow-raise"
      style={{ transitionTimingFunction: "var(--ease-silk)" }}
    >
      {/* 1.618:1 — the same ratio the rest of the page is built on. `shrink-0`
          so the flex column cannot squash the ratio out of it. */}
      <div className="relative aspect-[1.618/1] shrink-0 overflow-hidden bg-canvas-sunken">
        {cover ? (
          <Image
            src={cover}
            alt={p.title}
            fill
            priority={priority}
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-cover transition-transform duration-[1400ms] group-hover:scale-[1.07]"
            style={{ transitionTimingFunction: "var(--ease-silk)" }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-tiny uppercase tracking-brand text-ink-faint">
            Jamin
          </div>
        )}

        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
          <div className="flex flex-wrap gap-2">
            {approvals.map((a) => (
              <span
                key={a}
                className="rounded-full bg-canopy/90 px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em] text-white backdrop-blur"
              >
                {a} Approved
              </span>
            ))}
          </div>
          {!sellable && (
            <span className="rounded-full bg-ink/85 px-2.5 py-1 text-micro font-semibold uppercase tracking-[0.1em] text-white backdrop-blur">
              {p.status === "sold" ? "Sold Out" : p.status}
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col p-phi3">
        {/* The variable-length half. `flex-1` absorbs the difference between a
            one-line and a two-line title so the price rail below always lands
            at the same height across the row. */}
        <div className="flex-1">
          <div className="flex items-center gap-2 text-micro font-semibold uppercase tracking-[0.16em] text-jamin-gold-ink">
            {phaseLabel(p)}
            {p.plots_available ? (
              <>
                <span className="text-ink-faint">·</span>
                <span className="text-ink-faint">{p.plots_available} plots available</span>
              </>
            ) : null}
          </div>

          <h3 className="mt-2 text-xl text-ink transition-colors group-hover:text-jamin-red-deep">
            {p.title}
          </h3>

          <p className="mt-1.5 line-clamp-1 text-base text-ink-muted">{locationLine(p)}</p>
        </div>

        <div className="mt-phi3 flex items-end justify-between border-t border-line pt-phi2">
          <div>
            <div className="text-lg text-ink">{formatPrice(p)}</div>
            {area && <div className="text-tiny text-ink-faint">{area}</div>}
          </div>
          {/* Slides in rather than blinking on — the movement is what reads as
              considered; opacity alone reads as a flicker. */}
          <span
            className="translate-x-1 text-tiny font-medium text-jamin-red-deep opacity-0 transition-all duration-500 group-hover:translate-x-0 group-hover:opacity-100"
            style={{ transitionTimingFunction: "var(--ease-silk)" }}
          >
            View details →
          </span>
        </div>
      </div>
    </Link>
  );
}
