import Image from "next/image";
import type { ReactNode } from "react";
import { Container } from "./ui";

/**
 * The hero every page opens with.
 *
 * There are two tones, and which one a page uses is decided by the ARTWORK, not
 * by taste. The supplied set splits cleanly in two:
 *
 *  • 1, 2, 3 are photographic — deep skies, golden hour, real tonal range. They
 *    can carry white type across the full bleed, so they get `cinematic`.
 *  • 4–10 are graphic renders on a near-white ground with red architectural
 *    line-work. Laid full-bleed they would need a heavy scrim, which destroys
 *    the very thing that makes them good. They get `paper`: the words sit on
 *    the page's own ivory, the render bleeds off the right edge and `hero-fade`
 *    dissolves its left edge into the canvas.
 *
 * The accessibility consequence matters as much as the aesthetic one. In
 * `paper` the text contrast is fixed and knowable because nothing sits behind
 * it. In `cinematic` white type never touches the raw photograph — `veil` is a
 * measured gradient, dark enough at the copy end that white clears AA whatever
 * the image does underneath.
 *
 * ⚠️ These images are conceptual renders, NOT photographs of Jamin projects.
 * They may carry a page as brand imagery and must never be captioned as a
 * development or placed on a property card. See public/hero/README.md.
 */
export type HeroArt =
  | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 17 | 18 | 19 | 21 | 23 | 25 | 27 | 28
  | 31 | 32 | 33 | 34 | 35 | 36 | 37 | 38 | 39 | 40;

/**
 * 🚨 THE NATIVE HEIGHT OF EACH TOP RENDITION, AND IT IS NOT DECORATION.
 *
 * The mobile hero band used to be a hard `aspect-[16/9]` box with
 * `object-contain`, on the reasoning recorded in hero/README.md that "16/9 is
 * the narrowest ratio in the register, so a wider frame only letterboxes onto
 * the section's own charcoal, which is invisible". **It is not invisible.**
 * Reported 2026-08-13 as a black strip under the navbar on /properties,
 * /projects/completed, /locations/coimbatore, /locations/salem,
 * /locations/tiruppur and /journal — six pages, one cause. Those carry frames
 * at 2.33, 2.24, 2.00 and 2.25:1, so on a 375px phone the picture is 161px tall
 * in a 211px box and the reader gets a ~25px bar above it and another below.
 *
 * The fix is to stop guessing the box: the band now takes the ARTWORK'S OWN
 * ratio, so the picture fills it exactly — no bar, and still no crop, which is
 * the pair of failures this band exists to avoid.
 *
 * ⚠️ Keep this in step with the files in public/hero. A wrong number here is a
 * bar or a sliver of crop, not a crash, so nothing will fail loudly. Read the
 * top rendition with an image tool rather than copying a figure out of the
 * README — several frames are TRIMMED and their file is not their source.
 */
const TOP_HEIGHT: Record<HeroArt, number> = {
  1: 850, 2: 768, 3: 914, 4: 916, 5: 863,
  6: 941, 7: 941, 8: 941, 9: 941, 10: 941,
  11: 914, 12: 941, 13: 941,
  17: 745, 18: 941, 19: 941, 21: 879, 23: 922,
  25: 793, 27: 887, 28: 941,
  31: 720, 32: 887, 33: 720,
  34: 800, 35: 887, 36: 887, 37: 821,
  38: 819, 39: 836, 40: 819,
};

/** The widest rendition that exists for each source image. */
const TOP_WIDTH: Record<HeroArt, number> = {
  1: 1850, 2: 1920, 3: 1720, 4: 1717, 5: 1823,
  6: 1672, 7: 1672, 8: 1672, 9: 1672, 10: 1672,
  // Supplied 2026-08-08. 11 ends the shortfall recorded in hero/README.md —
  // there were eleven hero surfaces and ten renders.
  11: 1720, 12: 1672, 13: 1672,
  // Supplied 2026-08-09, a banner like hero-16 and TRIMMED the same way — the
  // renditions are cut at y=745 to drop the baked trust strip and category
  // column. See public/hero/README.md before regenerating it.
  17: 1672,
  // Also 2026-08-09, but NOT a banner: a plain photograph with no baked type,
  // so its renditions are straight downscales of the original.
  18: 1672,
  // ⚠️ 19 carries the JAMIN BAZAAR name on the gate and depicts a specific
  // finished layout. It is still a render, so the no-caption rule binds harder
  // here than anywhere else in the set — see public/hero/README.md.
  19: 1672,
  // ⚠️ 21 also names itself, and goes further: it shows a layout mid-build,
  // with workers, a tractor and a house going up. The same rule binds.
  21: 1790,
  // 23 carries no Jamin mark, so the provenance risk is the ordinary one. It
  // does show villas, plots AND apartment towers in one frame, which is the
  // Journal's subject rather than the company's — see hero/README.md.
  23: 1706,
  /* hero-25 — the banyan lesson, /journal until 2026-08-11. */
  25: 1983,
  /* hero-27 — the desk in the meadow, /journal from 2026-08-11. Owner-supplied.
     ⚠️ It is the OPPOSITE frame to the banyan it replaced: overcast daylight,
     bright sky, pale grass, and no deep shade anywhere. The banyan allowed the
     lightest plate on the site (0.02); this one cannot, and the alpha on the
     Journal's PageHero call was re-swept rather than carried over. */
  27: 1774,
  /* hero-28 — the elephant, /tools from 2026-08-11. Owner-supplied.
     ⚠️ MIRRORED and RETINTED before export, and both were necessary rather
     than tasteful: the subject was in the left third where `paper`'s copy plate
     sits, and the stock background is pure #ffffff against a #fdfcf9 canvas.
     See public/hero/README.md before regenerating it from the original. */
  28: 1672,
  /* hero-31 (/projects/ongoing) and hero-32 (/projects/future) — owner-supplied
     2026-08-12, replacing the villa render and the skyline render. Both are
     Jamin's OWN layouts: formed roads, kerbs, street lighting, plot markers.
     ⚠️ Both bake the JAMIN BAZAAR sign into the frame at the FAR LEFT, which is
     why they ship with `artPosition="right"` — see the note on the phase page.
     They are still brand imagery under the standing rule: `alt=""`,
     `aria-hidden`, and never a caption naming a development. */
  /* ⚠️ 1280, not 1774: hero-31 is TRIMMED, cut at source x 526. It shipped
     untrimmed while the copy plate was opaque, which hid the board behind it —
     the moment the plate went sheer the board ghosted straight through the
     headline. Anchoring right was never enough on its own. Same treatment and
     same native width as hero-33 so the two behave identically. */
  31: 1280,
  /* ⚠️ 32 is UNUSED — the owner replaced it with 33 the same afternoon, before
     it had been live an hour. Kept in the register rather than deleted because
     it is a perfectly good frame of an earlier stage, and /projects/future is
     the page most likely to want one back. */
  32: 1774,
  /* hero-33 (/projects/future) — the finished avenue: lawns in, avenue trees
     planted, flower beds, plot markers, boundary walls and a completed house.
     ⚠️ 1280, not 1774: it is TRIMMED. The JAMIN BAZAAR board was cut off the
     left edge (source x 0–494) because no `artPosition` could clear it — see
     the note on the phase page. Re-cut from the original, not from a rendition,
     if it is ever regenerated. */
  33: 1280,
  /* hero-34/35/36 — the district pages (Erode, Salem, Tiruppur), owner-supplied
     2026-08-12. One shoot: golden-hour layouts with the marble JAMIN BAZAAR
     sign. Coimbatore keeps hero-17, at the owner's request.
     ⚠️ 34 is 1422, not 1774 — it is TRIMMED. The original carries a "ROYAL
     CHETTINADU ENCLAVE" plaque on its right edge, a development name that is
     not in the catalogue, and the owner chose to cut it rather than publish a
     project the listing beneath it does not contain. Re-cut from the ORIGINAL
     at source x 1422, not from a rendition, if it is ever regenerated. */
  34: 1422,
  35: 1774,
  36: 1774,
  /* hero-38 (Erode) and hero-39 (Tiruppur) — owner-supplied 2026-08-13,
     replacing 34 and 36 on those two district pages. Same subject as the shoot
     they replace (a Jamin layout with the JAMIN BAZAAR board in frame) but a
     WORKING site rather than a finished gateway: planting, kerbing, a backhoe,
     a roller, cement stacked on a pallet.
     ⚠️ They are NOT from the 34/35/36 shoot, so they do not inherit its
     `SHEER_ALPHA` — the sweep is on the district page. 38 in particular is the
     brightest district frame the site has carried (hazy white sky across the
     whole top third).
     ⚠️ Neither is trimmed and neither needs to be: 34's "ROYAL CHETTINADU
     ENCLAVE" plaque and the "PLOT 125" plaque are both gone with the picture,
     so the only baked words left are the brand's own. */
  38: 1921,
  39: 1881,
  /* hero-37 — the aerial gate, /properties from 2026-08-12, owner-supplied.
     ⚠️ hero-17 is NOT freed by this: it stays the default for a district page
     with no art of its own, which today is Coimbatore. */
  37: 1916,
  /* 🚨 hero-40 — /projects/completed from 2026-08-13, owner-supplied, and it is
     the ONE PLACE public/hero/README.md says a render must never go. That page's
     subject genuinely is a delivered project, so the register requires real
     photography there, and until now it carried `secondaryImage()` of the
     handed-over development. The owner asked for this frame anyway, with that
     on the table.
     ⚠️ What it shows and what the page lists are different things: a lit avenue
     of finished VILLAS, above a listing whose one completed entry is a PLOTTED
     development (Udumalaipet, 400 cents / 60 plots). It is a render of nowhere
     and Jamin has not built these houses. So the standing rule binds harder here
     than on any other hero: `alt=""`, `aria-hidden`, and never a caption, a
     location or a project name — enforced by construction, since the page no
     longer passes `photo` and an art is always decoration. */
  40: 1921,
};

function artSrc(n: HeroArt) {
  const id = String(n).padStart(2, "0");
  return {
    src: `/hero/hero-${id}-${TOP_WIDTH[n]}.webp`,
    srcSet: `/hero/hero-${id}-768.webp 768w, /hero/hero-${id}-1280.webp 1280w, /hero/hero-${id}-${TOP_WIDTH[n]}.webp ${TOP_WIDTH[n]}w`,
  };
}

export function PageHero({
  eyebrow,
  title,
  lead,
  art,
  photo,
  actions,
  meta,
  priority = true,
  size = "standard",
  tone = "paper",
  sheer = false,
  sheerAlpha,
  sheerBlur,
  artPosition = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  lead?: ReactNode;
  art: HeroArt;
  /**
   * A real photograph, used instead of the brand render.
   *
   * Only ten renders were supplied and there are eleven pages that open with a
   * hero, so one page had to give. `/projects/completed` is the right one to
   * take a photograph: it is the only page whose subject genuinely IS a
   * delivered Jamin project, so per public/hero/README.md real photography is
   * what belongs there anyway — the renders are brand imagery and must never be
   * presented as a project. Passing a photo also releases hero-10 back to
   * /contact, which is how every remaining page ends up with its own image.
   */
  photo?: { src: string; alt: string };
  actions?: ReactNode;
  /** Small factual line under the copy — counts, never claims. */
  meta?: ReactNode;
  priority?: boolean;
  size?: "standard" | "tall";
  tone?: "paper" | "cinematic";
  /** ⚠️ A far more see-through plate, for frames where the picture is the
   *  point. It is NOT free: it needs white copy and a heavy blur to hold AA —
   *  see `.rj-gilt-sheer`. Only set it after sweeping the frame. */
  sheer?: boolean;
  /** Per-frame tint for the sheer plate. Sweep the picture before setting it —
   *  the ceiling belongs to the photograph, not to the component. */
  sheerAlpha?: number;
  /** Blur radius in px. LOW keeps the photograph readable and costs tint;
   *  HIGH flattens it to a colour wash and costs almost none. Sweep both. */
  sheerBlur?: number;
  /**
   * ⚠️ Which part of the render survives the crop, `paper` tone only.
   *
   * The art sits in a 58%-wide box with `object-cover`, so it is always wider
   * than the window and something is cropped. `left` (the default, and what
   * every other paper page uses) anchors the image's left edge and crops the
   * right — which is correct for the graphic renders, whose subject is on the
   * left. hero-28's subject is on the RIGHT, so the default pinned the woman
   * against the frame's own right edge. Moving the anchor right shows more of
   * the empty ground beside her and walks the subject leftward into the frame.
   */
  artPosition?: string;
}) {
  const artwork = artSrc(art);
  const src = photo?.src ?? artwork.src;
  const srcSet = photo ? undefined : artwork.srcSet;

  /**
   * The mobile band's box, as a ratio rather than a guess. See TOP_HEIGHT.
   *
   * ⚠️ A `photo` keeps 16/9, because its dimensions live in the database and
   * cannot be known at build time. That is a knowing compromise, not an
   * oversight: the only page still passing one is /projects, which is NOT among
   * the six reported, and `object-contain` means the worst case there stays a
   * letterbox rather than becoming a crop. If a photograph ever needs the same
   * treatment, the ratio has to travel with it from `lib/properties`.
   */
  const bandRatio = photo ? "16/9" : `${TOP_WIDTH[art]}/${TOP_HEIGHT[art]}`;
  const bandStyle = { "--hero-band": bandRatio } as React.CSSProperties;

  if (tone === "cinematic") {
    return (
      <section className="relative isolate overflow-hidden bg-charcoal">
        {/* 🚨 BELOW `lg` THIS IS A BAND, NOT A BACKGROUND — and it is ONE
            element that changes job at the breakpoint, not two.

            The bug: `object-cover` sizes to the box's HEIGHT, and on a phone the
            box is roughly square while every frame in the set is between 1.78:1
            and 2.5:1. /journal's hero is 2.0:1 in a 375×420 box, so the reader
            saw a 40% centre slice — reported as "the mobile layout crops a large
            portion of the image… important parts of the original are missing
            from view". No amount of `object-position` fixes that; the picture is
            simply wider than the hole.

            So on a phone the picture stops being a backdrop and becomes a band
            above the copy, `object-contain` inside a 16/9 box — which is the
            NARROWEST ratio in the set, so nothing is ever cropped left or right
            and a wider frame only letterboxes onto the section's own charcoal.
            The copy then sits on that charcoal, where white type is far safer
            than it ever was over a photograph.

            ⚠️ ONE `<Image>`. The obvious build is a `lg:hidden` band plus a
            `hidden lg:block` backdrop, and it costs every phone a second full
            hero download — a `display: none` image is still fetched. Instead the
            WRAPPER changes: in flow with an aspect box on mobile, absolutely
            filling the section from `lg`. `fill` is satisfied either way because
            both states are positioned.

            ⚠️ It also puts the picture FIRST on a phone, which is what the
            homepage banner already does and what the second report asked for —
            see the note on the paper band below.

            🚨 THE BOX IS THE ARTWORK'S OWN RATIO, NOT 16/9. A fixed 16/9 box was
            the black strip reported under the navbar on six pages — the frames
            here run to 2.33:1, and `object-contain` paid for "never cropped"
            with a bar of charcoal top and bottom. See TOP_HEIGHT. */}
        <div
          className="relative aspect-[var(--hero-band)] w-full xl:absolute xl:inset-0 xl:aspect-auto"
          style={bandStyle}
        >
          {/* A render is decoration and stays out of the accessibility tree; a
              photograph of a real project is content and gets a real alt. */}
          <Image
            src={src}
            alt={photo?.alt ?? ""}
            aria-hidden={photo ? undefined : "true"}
            fill
            priority={priority}
            sizes="100vw"
            className="object-contain object-center xl:object-cover"
          />
          {/* The veil is a legibility device for type sitting ON the picture.
              Below `lg` nothing sits on it, so darkening it there would spend
              the photograph for nothing. */}
          <div className="veil absolute inset-0 hidden xl:block" />
        </div>

        {/* `justify-center`, where this was `justify-end`. Bottom-anchoring was
            a legibility device, not a layout preference: `veil` is darkest in
            the bottom-left corner, so that is where bare white type had to go.
            The `gilt` plate carries its own backdrop now, which frees the copy
            to sit on the frame's vertical centre. The asymmetric padding stays
            — the optical centre of a block of type sits slightly above the
            geometric one, so a little more room below keeps it from reading
            low. */}
        {/* ⚠️ The `min-h` is `lg:` only now. It exists to give a full-bleed
            photograph room to be a photograph; below `lg` there is no
            photograph behind this block, so a forced 48vh box would just be
            empty charcoal under three lines of type. The vertical rhythm on a
            phone is now the same `py-phi5` every other section on the site
            opens with, which is half of what the second report asked for. */}
        <Container
          className={`relative flex flex-col justify-center py-phi5 ${
            size === "tall"
              ? "lg:min-h-[clamp(26rem,64vh,38rem)] lg:pb-phi7 lg:pt-phi6"
              : "lg:min-h-[clamp(20rem,48vh,30rem)] lg:pb-phi6 lg:pt-phi5"
          }`}
        >
          {/* The measure opens up on a wide screen. At 42rem a headline like
              "Plots in approved layouts across Tamil Nadu" broke to three lines
              and left "Nadu" alone on the last one, with 880px of empty hero
              beside it.

              ⚠️ The `gilt` plate is load-bearing, not ornament. `veil` was
              lightened at the same time, and it is this panel's 0.46 that puts
              the contrast back under the words — take the panel off and every
              cinematic hero drops below AA. The two changes ship together or
              not at all. */}
          <div
            className={`gilt ${sheer ? "rj-gilt-sheer rj-sheer-copy" : ""} rise max-w-[42rem] rounded-2xl p-phi3 sm:p-phi4 xl:max-w-[46rem]`}
            style={
              sheer
                ? ({
                    ...(sheerAlpha != null ? { "--rj-sheer-alpha": sheerAlpha } : {}),
                    ...(sheerBlur != null ? { "--rj-sheer-blur": `${sheerBlur}px` } : {}),
                  } as React.CSSProperties)
                : undefined
            }
          >
            {eyebrow && (
              <div className="flex items-center gap-3">
                {/* Gilt, where this was a plain white hairline — the same rule
                    that sits under BAZAAR in the logo. Gold as a RULE may be the
                    fill gold; gold as a WORD may not, so the label takes
                    `jamin-gold-light`, which holds on the plate. */}
                <span className="h-px w-12 rule-gold" />
                <span className={`text-micro font-medium uppercase tracking-brand ${sheer ? "" : "text-jamin-gold-pale"}`}
                  style={sheer ? { color: "var(--color-champagne-50)" } : undefined}>
                  {eyebrow}
                </span>
              </div>
            )}
            {/* `text-balance` evens the line lengths instead of filling each one
                to the measure and orphaning whatever is left over. */}
            <h1 className="mt-phi3 text-balance text-4xl text-white">{title}</h1>
            {lead && (
              <div className={`mt-phi3 max-w-xl text-pretty text-lg leading-relaxed ${sheer ? "text-white" : "text-white/80"}`}>
                {lead}
              </div>
            )}
            {meta && (
              <div className="glass-dark mt-phi3 inline-flex rounded-full px-4 py-1.5 text-tiny text-white/85">
                {meta}
              </div>
            )}
            {actions && <div className="mt-phi4 flex flex-wrap gap-3">{actions}</div>}
          </div>
        </Container>
      </section>
    );
  }

  return (
    <section className="relative overflow-hidden border-b border-line bg-canvas-alt">
      {/* setting-out grid, the faint texture a layout plan is drawn on */}
      <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />

      {/* 🚨 THE PHONE BAND MOVED ABOVE THE COPY (2026-08-12) — this is the
          "every page has a different layout" report, and it was true.

          A reader going /properties → /projects/ongoing → /journal met three
          different structures: banner-then-copy on the homepage, copy-then-band
          on every `paper` page, and words-over-picture on every `cinematic`
          one. Each was defensible alone; together they read as three websites.

          One rule now: on a phone the picture comes first at full width, then
          the copy. The homepage banner already worked that way and is the one
          the owner designed by hand, so it is the one the rest follows.

          ⚠️ An ASPECT BOX + `object-contain`, where this was `h-44 sm:h-56`
          + `object-cover object-right`. A fixed height cannot be right for a
          set whose frames run 1.78:1 to 3.31:1 — at `sm:h-56` a 640px-wide
          phone was cropping a 1.78 render by 38%, and `object-right` then chose
          which 62% to keep.

          🚨 That box was 16/9 until 2026-08-13, on the reasoning that a wider
          frame would "letterbox onto the section's own ivory, which is
          invisible". It is not invisible — it was reported as a strip under the
          navbar, and on the charcoal of the cinematic tone it reads as a black
          band. The box is the artwork's own ratio now, so a frame of any width
          fills it exactly: no bar, and still nothing cropped.

          ⚠️ Still a SECOND element rather than the single re-positioned one the
          cinematic tone uses. It has to be: the desktop render is 58% wide,
          right-aligned and masked by `hero-fade`, and that mask is not
          something a full-width phone band should carry. The extra fetch is
          real and is the price of the two treatments being genuinely
          different pictures of the same file. */}
      <div className="relative aspect-[var(--hero-band)] w-full xl:hidden" style={bandStyle}>
        <Image
          src={src}
          alt=""
          aria-hidden="true"
          fill
          sizes="100vw"
          priority={priority}
          className="object-contain object-center"
        />
      </div>

      {/* the render, bleeding off the right edge and dissolving into the page */}
      <div
        className="pointer-events-none absolute inset-y-0 right-0 hidden w-[58%] xl:block"
        aria-hidden={photo ? undefined : "true"}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          srcSet={srcSet}
          sizes="58vw"
          /* A render is decoration; a photograph of a real project is content. */
          alt={photo?.alt ?? ""}
          fetchPriority={priority ? "high" : "auto"}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          className="hero-fade h-full w-full object-cover"
          style={{ objectPosition: artPosition }}
        />
      </div>

      <Container
        className={`relative ${size === "tall" ? "py-phi6 lg:py-phi7" : "py-phi5 lg:py-phi6"}`}
      >
        {/* The paper tone gets the same plate, in its light form. Over ivory the
            fill is nearly invisible; what reads is the gold hairline, which is
            the point — the copy on every hero now sits on a gilt-edged plate
            whether or not there is a photograph behind it. */}
        <div
          className={`gilt-light ${sheer ? "rj-gilt-light-sheer rj-sheer-copy-ink" : ""} rise max-w-[34rem] rounded-2xl p-phi3 sm:p-phi4 lg:max-w-[38rem]`}
          style={
            sheer
              ? ({
                  ...(sheerAlpha != null ? { "--rj-sheer-alpha": sheerAlpha } : {}),
                  ...(sheerBlur != null ? { "--rj-sheer-blur": `${sheerBlur}px` } : {}),
                } as React.CSSProperties)
              : undefined
          }
        >
          {eyebrow && (
            <div className="flex items-center gap-3">
              <span className="h-px w-12 rule-gold" />
              {/* `gold-deep`, not `gold-ink` — this line sets the plate's
                  opacity. See the sweep recorded in `gilt-light`. */}
              <span className="text-micro font-semibold uppercase tracking-brand text-jamin-gold-deep">
                {eyebrow}
              </span>
            </div>
          )}
          <h1 className="mt-phi3 text-balance text-4xl text-ink">{title}</h1>
          {lead && (
            <div className="mt-phi3 text-pretty text-lg leading-relaxed text-ink-soft">{lead}</div>
          )}
          {meta && (
            <div className="glass rj-crystal mt-phi3 inline-flex rounded-full px-4 py-1.5 text-tiny text-ink-soft">
              {meta}
            </div>
          )}
          {actions && <div className="mt-phi4 flex flex-wrap gap-3">{actions}</div>}
        </div>
      </Container>

    </section>
  );
}
