import Image from "next/image";
import { Reveal } from "@/components/Reveal";

/**
 * THE GILT SEAM (2026-08-22) — a printer's ornament between two light bands.
 *
 * The homepage descends canvas → bone-paper → velvet → canvas → sunken, and
 * every one of those transitions is carried by a change of paper except one:
 * the bone-paper band hands over to the location explorer across nothing but
 * `border-y border-line`, a single sand hairline between two light grounds.
 * At that seam the page reads as one continuous sheet for two full sections.
 *
 * This is that seam, made into an object: a full-bleed strip of onyx with the
 * mark centred in it and a gold rule running out to each edge.
 *
 * ⚠️ IT CARRIES NO WORDS, AND THAT IS THE POINT. Every other band on this page
 * asserts something — figures, districts, tools — and each of those numbers is
 * read from the catalogue. A divider has nothing true of its own to say, so
 * rather than invent a line of marketing copy to fill it, it stays an
 * ornament. `aria-hidden` for the same reason: there is nothing here for a
 * screen reader to lose.
 *
 * ⚠️ `rj-gilded` — the strip lays down its own onyx, so the tier-2b gold is
 * legal inside it whatever the sections either side happen to be.
 *
 * ⚠️ THE CROWN IS `rj-leaf`, WHICH IS THE ONLY PLACE ON THE SITE BIG ENOUGH TO
 * WANT IT. Gold leaf grain is invisible on an 11px seal and on a 1px rule; it
 * needs a surface with room for the grain to be a texture rather than noise.
 * A 6px bar running the full width of the viewport is that surface, and it is
 * why the class was written at all.
 */
export function GiltSeam() {
  return (
    <div className="rj-band-gilt rj-gilded" aria-hidden="true">
      {/* The leafed foil crown — a real metal edge rather than a hairline.

          ⚠️ `rj-sweep` ON THE TOP BAR ONLY (Tier C, item 12). The sweep is the
          site's slow specular band, and until the gilding there was nothing
          gold for it to cross — it was travelling over bronze, which is why
          royal.css describes an effect the page never quite showed. A 6px bar
          the full width of the viewport is the first surface where it reads.

          It is on ONE of the two crowns deliberately. Both would be a pair of
          highlights sliding in lockstep, which reads as a loading skeleton —
          the one thing royal.css's own note says a luxury surface must not
          look like. One bar glints and the other holds still. */}
      <div className="rj-leaf rj-sweep h-1.5 w-full" />
      <Reveal className="flex items-center justify-center gap-phi3 px-5 py-phi3" decorative>
        {/* The rules run out to the edges and fade, the same shape as the rule
            under BAZAAR in the logo — `rule-gold` is that gradient, and it is
            gold rather than bronze here because of the scope above.

            ⚠️ `rj-rule-draw` REPLACES `rule-gold` rather than joining it: the
            drawn rule paints the same gradient on its own pseudo-element so it
            has something to scale. Two gradients would be one behind the other,
            and the static one would show through the undrawn state. */}
        <div className="rj-rule-draw max-w-[18rem] flex-1" />
        <Image
          src="/logo-mark.png"
          alt=""
          width={256}
          height={256}
          sizes="28px"
          className="h-7 w-7 shrink-0 object-contain opacity-90"
        />
        {/* The right-hand rule is drawn a beat after the left, so the pair
            reads as one line crossing the mark rather than as two rules. */}
        <div
          className="rj-rule-draw max-w-[18rem] flex-1"
          style={{ "--rj-rule-delay": "320ms" } as React.CSSProperties}
        />
      </Reveal>
      <div className="rj-leaf h-1.5 w-full" />
    </div>
  );
}
