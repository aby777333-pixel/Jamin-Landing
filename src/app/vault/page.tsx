import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { GoldDust } from "@/components/GoldDust";
import { KolamCorner } from "@/components/cadastral/Engravings";
import { VaultCarousel } from "@/components/vault/VaultCarousel";
import { VaultPlate } from "@/components/vault/VaultPlate";
import {
  getVaultCategories,
  getVaultDestinations,
  getVaultListings,
  getVaultSettings,
  groupFamilies,
  publicPlace,
  publicTitle,
  vaultListingHref,
  verificationBadge,
  VAULT_FALLBACK,
  type VaultFamily,
} from "@/lib/vault";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "The Vault — Private Real Estate & Exceptional Assets | Jamin Bazaar",
  description:
    "Jamin Bazaar's private property desk. Acquisition, rental, sale and leasing of exceptional properties — estates, heritage residences, plantations and rare assets — handled personally and privately.",
  alternates: { canonical: "/vault" },
};

/**
 * THE VAULT — Jamin Bazaar's private property desk.
 *
 * ⚠️ THIS PAGE ASKS A DIFFERENT QUESTION FROM THE REST OF THE SITE. The
 * marketplace answers "what is available?"; The Vault answers "what are you
 * looking for?". Every decision below follows from that inversion, and the one
 * that matters most is that INVENTORY IS NOT THE LEAD. `vault_listings` is
 * empty today and may be empty for a long time, and the page is complete
 * without it — the service is the desk, not the catalogue. A redesign that puts
 * a grid at the top will be wrong the moment the grid has three things in it.
 *
 * ⚠️ NOTHING HERE IS HARD-CODED CONTENT (§19). Families, categories,
 * destinations, the hero copy, the standing lines, the FAQ and the legal
 * notices are all rows in `vault_categories`, `vault_destinations` and
 * `vault_settings`. What IS in this file is structure and voice: which section
 * comes first, and how each one speaks.
 *
 * ⚠️ THE TWO DESKS LIVE ON THEIR OWN PAGES, deliberately. §4 and §5 each
 * describe a section with a long form, and putting both inline would have made
 * this page two screens of fields under a cinematic hero — the opposite of
 * §23's "fewer listings, more space". They are presented here as invitations
 * with the whole argument, and the form itself gets a quiet room of its own.
 *
 * ⚠️ THE FORBIDDEN REGISTER (§14). No "exclusive", no "VIP", no "ultimate
 * luxury", no "for billionaires". The audience works out who this is for from
 * the restraint. If a line here ever needs an exclamation mark, it is the wrong
 * line.
 */

/* §3 — the four intent paths, in the brief's own order and wording. Structure,
   not content: these are routes through the product, and each one lands on a
   form that exists.

   ⚠️ The pictures are LOCAL, unlike the families' — these four are structure
   rather than data. There is no row behind "Buy"; it is a route, and a route
   cannot be added or removed in the console. So its art lives beside it. */
const PATHS = [
  {
    key: "buy",
    kicker: "Buy",
    title: "Acquire something exceptional",
    note: "For clients looking to purchase a premium property or estate.",
    cta: "Tell us what you want",
    href: "/vault/request?intent=buy",
    image: "/vault/path/buy.webp",
  },
  {
    key: "rent",
    kicker: "Rent",
    title: "Live somewhere extraordinary",
    note: "Short-term, seasonal, long-term, holiday, corporate or private rentals.",
    cta: "Find it for me",
    href: "/vault/request?intent=rent",
    image: "/vault/path/rent.webp",
  },
  {
    key: "sell",
    kicker: "Sell",
    title: "Sell with discretion",
    note: "For owners wishing to sell through Jamin Bazaar's private network.",
    cta: "Speak to The Vault",
    href: "/vault/offer?intent=sell",
    image: "/vault/path/sell.webp",
  },
  {
    key: "lease",
    kicker: "Lease",
    title: "Place your property privately",
    note: "For owners who want us to find suitable tenants or occupants.",
    cta: "Offer to The Vault",
    href: "/vault/offer?intent=lease",
    image: "/vault/path/lease.webp",
  },
  /* ⚠️ CO-DEVELOPMENT IS A REQUEST, NOT AN OFFER, so it points at
     `/vault/request` beside buy and rent rather than at `/vault/offer` beside
     sell and lease — even though a landowner arrives here the same way a seller
     does. The distinction is what is being started: an offer lists an asset, a
     request opens a conversation, and a partnership is the second. Owner's
     addition 2026-08-13.
     ⚠️ It reuses `sell.webp` because no artwork exists for it yet. That is a
     visible placeholder rather than a hidden one: the card is real, the picture
     is borrowed, and it should be replaced. */
  {
    key: "codevelop",
    kicker: "Co-develop",
    title: "Build it together",
    note: "For landowners with land to develop, and for investors who want into a development.",
    cta: "Start the conversation",
    href: "/vault/request?intent=codevelop",
    image: "/vault/path/sell.webp",
  },
];

/* §1 and §7 — what a request actually sounds like. Written as things a client
   would say, because the whole page is an argument that saying it is enough. */
const SPOKEN = [
  "A private beachfront home near Goa for three months.",
  "A coffee estate in Coorg, with an existing residence.",
  "A restored heritage property in Rajasthan.",
  "A private estate near Ooty, for the family.",
  "An orchard within two hours of Bengaluru.",
  "A villa I own, leased privately — never publicly advertised.",
];

/* §6 — the three visibility levels, stated to owners in plain words. This is
   the page's strongest trust argument, so it is prose rather than a table. */
const LEVELS = [
  {
    name: "Public Vault",
    note: "Shown to anyone who visits The Vault. Used only where an owner is content to be seen.",
  },
  {
    name: "Private Vault",
    note: "Held back from the public page and shown to verified clients whose requirement it answers.",
  },
  {
    name: "Off-market",
    note: "Never publicly displayed at all. Visible to authorised Vault administrators, and matched by hand against qualified requirements.",
  },
];

function FamilyBlock({ family, image }: { family: VaultFamily; image?: string }) {
  return (
    /* ⚠️ `flex` on the item and `h-full` on the card, for the reason recorded on
       PropertyCard: a grid item stretches to the tallest in its row, but a
       `block` child does not follow it. Every family here carries a different
       number of categories — that is data, and the console can change it any
       day — so without this the three frames in a row ended at three different
       heights and the section read as broken rather than as varied. The two
       sibling grids on this page (`PATHS`, `destinations`) were already built
       this way; this one was the outlier, and it was the one reported.

       The frames level; the LISTS inside them still differ, which is correct.
       Padding a short family with invented categories, or trimming a long one,
       would be editing the register to suit the layout. */
    <li id={family.slug} className="flex scroll-mt-28">
      <div className="flex h-full w-full flex-col overflow-hidden rounded-xl border border-line bg-canvas-alt">
        {/* `shrink-0` or the flex column squashes the 16/9 out of the frame in
            the shorter cards — the ratio is the thing keeping the row of
            pictures consistent. */}
        <div className="relative aspect-[16/9] w-full shrink-0 overflow-hidden bg-canvas-sunken">
          {/* The drawn plate is the fallback, not the plan: a family without a
              picture in `familyImages` still gets a designed frame rather than
              a hole. ⚠️ The label is dropped once there is a photograph — a
              caption over brand imagery is the one thing this site forbids. */}
          <VaultPlate
            src={image}
            seed={family.slug}
            label={image ? undefined : family.name}
            sizes="(min-width: 1280px) 33vw, (min-width: 768px) 50vw, 100vw"
          />
        </div>
        <div className="flex flex-1 flex-col p-phi3">
          <h3 className="text-xl text-ink">{family.name}</h3>
          <ul className="mt-phi3 space-y-2">
            {family.items.map((c) => (
              <li key={c.slug} className="border-t border-line pt-2 first:border-t-0 first:pt-0">
                <p className="text-base text-ink">{c.label}</p>
                {c.note ? <p className="text-tiny text-ink-faint">{c.note}</p> : null}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </li>
  );
}

export default async function VaultPage() {
  /* Every read is independent and every one has a fallback, so one unreachable
     table takes its own section down rather than the page. */
  const [settings, categories, destinations, listings] = await Promise.all([
    getVaultSettings(),
    getVaultCategories().catch(() => []),
    getVaultDestinations().catch(() => []),
    getVaultListings().catch(() => []),
  ]);

  const families = groupFamilies(categories);
  /* Heritage gets the feature band the brief asks for — but only if it is
     actually there. Removing the family in the console removes the band, and
     nothing else on the page notices. */
  const heritage = families.find((f) => f.slug === "heritage-india");
  const rest = families.filter((f) => f !== heritage);

  const hero = settings.hero ?? VAULT_FALLBACK.hero;
  const promise = settings.promise?.length ? settings.promise : VAULT_FALLBACK.promise;

  return (
    <>
      {/* ── §16 THE OPENING ────────────────────────────────────────────────
          Very little text over a very large frame. `min-h` rather than a fixed
          height so the plate breathes on a phone without the copy ever being
          pushed off it.

          hero-30 — a Pichwai-style painting of a palace in a wooded valley at
          sunset, supplied by the owner 2026-08-12, replacing hero-29's monsoon
          backroad. Fourth picture this section has carried: it opened on a
          drawn plate.

          ⚠️ BRAND IMAGERY, NEVER A JAMIN PROJECT. Same standing rule as every
          other hero on this site: `alt=""`, `aria-hidden`, and it must never
          gain a caption, a location or a project name. See public/hero/README.

          The treatment is a SCRIM rather than the picture-plus-plate the rest
          of the site moved to on 2026-08-09, and that is a property of the
          section rather than of any one picture: the copy here is white, and a
          plate alone cannot hold white type over a bright sky without becoming
          a black box. The scrim is two gradients because it has two jobs —
          horizontal darkens the left third where the words are and lets go
          across the rest so the picture survives; vertical anchors the top
          under the header and the foot into the section edge.

          ⚠️ THE SCRIM IS UNCHANGED FROM hero-29 AND THE PLATE DID THE MOVING.
          That is the opposite of the last two swaps and it is worth reading
          before touching either number, because the instinct — re-scale the
          scrim, as hero-26 → hero-29 did — was swept here and rejected on
          evidence.

          hero-29 was wet forest: uniformly dark exactly where the words sit, so
          a gradient could carry the whole job. A Pichwai painting is the
          hardest kind of frame for white type, because it is dark on AVERAGE
          and locally bright EVERYWHERE — white blossom, a waterfall, peacock
          highlights, gold domes and an orange sky, all at glyph scale. Nothing
          global fixes a scatter like that:

            • object-position was swept at 1024/1280/1440/1920 (left, 20%, 35%,
              centre). The worst pixel under the plate moved between 1.89 and
              2.58 — i.e. not at all. There is no crop where the copy sits over
              calm paint, because the bright bits are in every third of it.
            • Scaling the scrim up needs ×1.60 to reach the worst pixel hero-29
              shipped at, and that takes the frame's mean luminance from 0.026
              to 0.011. It buys legibility by putting the painting out.

          So the scrim stays at hero-29's stops and the PLATE goes 0.14 → 0.46.
          A scrim pays for the words with the whole picture; a plate pays only
          where the words are — the same argument that put every hero on this
          site onto plates in the first place, applied to the frame that needs
          it most. Swept at 1024, the tightest width (plate region, gold eyebrow
          — it binds every time, and white runs ~1.6× clear of it):

              0.14 → gold 4.54 at p95, 2.26 at the worst pixel  ← hero-29's
              0.32 → gold 5.76 at p95, 3.21 at the worst pixel
              0.40 → gold 6.40 at p95, 3.80 at the worst pixel
              0.46 → gold 6.92 at p95, 4.32 at the worst pixel  ← ships
              0.58 → gold 8.04 at p95, 5.61 at the worst pixel  ← plate reads
                                                                  as a box

          0.46 clears the 4.19 worst pixel hero-29 shipped at, at every width
          measured (1024 4.32 · 1280 4.38 · 1440 4.75 · 1920 5.76 · 768 5.97 ·
          375 5.88). And because the scrim did not move, the painting OUTSIDE
          the plate reads at mean luminance 0.035 against hero-29's 0.027 —
          brighter than the picture it replaces, which is the whole point of
          spending the contrast locally.

          ⚠️ Everything above describes the DESKTOP composition. On a phone the
          copy no longer sits on the painting at all — see the note on the
          picture wrapper below. */}
      {/* 🚨 THE PHONE SEES THE WHOLE PAINTING NOW (2026-08-13).
          /vault was the last hero on the site still built as words-over-picture
          at every width, and it was the documented exception to the
          one-structure rule the other ten pages adopted on 2026-08-12. The UI
          report flagged it twice — "the hero background image is not fully
          visible and important parts of the image are being cropped… the Vault
          hero therefore looks inconsistent with the visual treatment of the
          other pages" — and offered to let it stand if it was deliberate. It
          was deliberate, and it was still wrong: `object-cover` in a
          `min-h-[78vh]` box on a 375px phone shows a 375-wide slice of a frame
          that has been scaled to 1477 wide. **The reader was seeing 25% of the
          painting.** No `object-position` can fix that; the picture is simply
          wider than the hole, which is the same finding that moved every other
          hero.
          So below `lg` the picture becomes a band in its own ratio and the copy
          sits under it on the section's own onyx — identical in structure to
          `PageHero`'s cinematic tone, and identical in consequence: white on
          onyx is ~15:1, so the phone stops being a contrast case entirely.
          ⚠️ ONE `<Image>`, not two. A `display:none` image is still fetched, so
          the obvious `lg:hidden` band + `hidden lg:block` backdrop build costs
          every phone a second full-size hero download. The WRAPPER changes job
          at the breakpoint instead; `fill` is satisfied either way because both
          states are positioned. */}
      <section className="relative isolate overflow-hidden bg-onyx-900 lg:flex lg:min-h-[clamp(30rem,78vh,44rem)] lg:items-center">
        <div className="relative aspect-[1916/821] w-full lg:absolute lg:inset-0 lg:aspect-auto">
          <Image
            src="/hero/hero-30-1916.webp"
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* ⚠️ `hidden lg:block`. The scrim is a legibility device for type
              sitting ON the picture; below `lg` nothing sits on it, so leaving
              it there would darken a band that has no words in it — spending
              the painting for nothing. Same rule as `veil` in PageHero. */}
          <div
            className="pointer-events-none absolute inset-0 hidden lg:block"
            aria-hidden="true"
            style={{
              background:
                "linear-gradient(to right, rgba(10,10,9,0.53) 0%, rgba(10,10,9,0.43) 34%, rgba(10,10,9,0.23) 64%, rgba(10,10,9,0.28) 100%), " +
                "linear-gradient(to bottom, rgba(10,10,9,0.37) 0%, rgba(10,10,9,0.13) 38%, rgba(10,10,9,0.35) 100%)",
            }}
          />
          {/* ⚠️ THE FLAT MOBILE VEIL IS GONE, AND THAT IS THE SAME CHANGE, NOT A
              SEPARATE ONE. It existed because `object-cover` in a tall box
              cropped a phone to the frame's centre slice, so the horizontal
              gradient's argument was off-screen and the eyebrow landed on
              whatever sat in the middle — measured at 4.23 on hero-29's
              inherited 0.18, which is what raised it to 0.28. There is no
              centre slice any more and no copy over the picture, so the veil
              has nothing left to protect and would only mute the band.
              ⚠️ If the copy is ever moved back on top of the picture below
              `lg`, this veil has to come back WITH it — do not restore one
              without the other. */}
        </div>
        {/* The only particles on the site, over the picture rather than on a
            black panel, so they read as late light in the air. */}
        <GoldDust />

        {/* ⚠️ `w-full` is load-bearing here, not tidying. The section is a flex
            container, so this is a flex ITEM and is sized by its content along
            the main axis — without it the 1280 cap and `mx-auto` centred a box
            only as wide as the copy, and the plate sat in the middle of the
            frame directly over the house. It went unnoticed while the hero was
            an abstract drawn plate; with a photograph whose subject is dead
            centre it hides the one thing worth showing. */}
        <Container className="relative w-full py-phi5">
          {/* ⚠️ 0.46, and the sweep that chose it is in the section comment
              above — it is the hero-30 swap, not a taste change. The short
              version: under hero-29 the scrim carried the contrast and the
              plate could drop to 0.14; under a painting that is bright at glyph
              scale in every third of the frame, the plate has to carry it
              again, and doing that locally is what keeps the picture bright.

              Still well under the site's audited 0.52 for the opaque `gilt`,
              and it is a flat tint with no backdrop-filter, so the painting
              runs through it unaltered rather than being frosted. */}
          <div
            /* ⚠️ `max-w-xl`, down from `max-w-2xl` (report 6, 2026-08-19:
               "reduce the left content panel slightly so more of the hero image
               is visible"). 42rem → 36rem gives the painting back ~96px of
               frame at every width above `xl`. Deliberately one step, not two:
               the plate still has to hold a 5xl heading and a 2×3 CTA grid, and
               `max-w-lg` starts wrapping the longer button labels onto three
               lines. */
            className="gilt rj-gilt-sheer rj-sheer-copy max-w-xl rounded-2xl p-phi3 sm:p-phi4"
            style={{ "--rj-sheer-alpha": 0.46 } as React.CSSProperties}
          >
            {/* ⚠️ THE ALIGNMENT IS NOT SET HERE. This used to carry `text-right`
                and removing it changed nothing — `.rj-eyebrow` right-aligns
                every caption on the site from royal.css, and the Vault's
                override lives beside that rule. Putting a `text-left` back on
                this one element would fix the wordmark and leave the other
                sixteen eyebrows on the page where they were. */}
            <p className="rj-eyebrow" style={{ color: "var(--color-champagne-300)" }}>
              {hero.eyebrow ?? "Jamin Bazaar"}
            </p>
            {/* One step down (report 6: "keep The Vault as the main focal point,
                but reduce its size slightly"). It stays the largest thing in
                the plate — the lead below is `xl` — so it is still the focal
                point, just no longer competing with the painting. */}
            <h1 className="mt-phi2 text-balance text-3xl text-white lg:text-4xl">
              {hero.title ?? "The Vault"}
            </h1>
            <p className="rj-voice mt-phi2 text-pretty text-xl text-white">
              {hero.lead ?? VAULT_FALLBACK.hero.lead}
            </p>

            {/* 🚨 SIX WAYS IN, AS A 2×3 GRID — reported 2026-08-17: the six
                CTAs stacked as a single column made the hero nearly two
                scrolls tall, and the report asks for "2 in a row (2×3 grid)"
                with the button text CENTRED. The two-tier ranking survives the
                re-flow: the first ROW is the two primaries (filled `jamin-red`
                buy, `champagne-300` outline rent) and the remaining four keep
                the quieter `champagne-500/30` hairline treatment — same tiers,
                a third of the height.

                ⚠️ NO NEW COLOUR — every value here already existed on this
                page, which is the same restraint the 2026-08-14 pass held to.

                ⚠️ THE ARROWS ARE BACK, AND THE CENTRING GAVE WAY TO THEM
                (report 6, 2026-08-19: "keep the → arrow on every CTA and align
                all arrows consistently"). This note used to argue the opposite
                and the argument still holds — a centred label with a
                right-pinned arrow does read as mis-set — but "aligned
                consistently" can only mean the arrows line up, and they cannot
                line up under labels of six very different lengths unless each
                one is pinned to its own right edge. So the label goes left, the
                arrow goes right, and every arrow in a row sits at the same x.
                Restoring the centring means dropping the arrows again; the two
                requests are mutually exclusive.

                ⚠️ Below `sm` the grid collapses back to one column — six
                half-width tap targets at 375px would be under the 44px
                minimum this site keeps to. */}
            <div className="mt-phi4 grid gap-3 sm:grid-cols-2">
              {/* Aesthetics item 20: `rj-rim` finally earns its keep — the
                  gradient glass ring on the two primaries (authored in the
                  Maharaja round, unused since). `relative` is the host's
                  duty; the class never declares position. */}
              <Link
                href="/vault/request?intent=buy"
                className="rj-velvet rj-rim relative flex items-center justify-between gap-3 rounded-full px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-opacity hover:opacity-90"
              >
                I want to buy
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/vault/request?intent=rent"
                className="rj-rim relative flex items-center justify-between gap-3 rounded-full border border-champagne-300 px-5 py-3 text-tiny font-semibold uppercase tracking-[0.12em] text-champagne-300 transition-colors hover:bg-white/5"
              >
                I want to rent
                <span aria-hidden="true">→</span>
              </Link>
              {[
                { href: "/vault/offer?intent=sell", label: "I want to sell", tone: "text-white/80" },
                {
                  href: "/vault/offer?intent=lease",
                  label: "I want to lease my property",
                  tone: "text-white/80",
                },
                {
                  href: "/vault/request?intent=codevelop",
                  label: "I want to co-develop",
                  tone: "text-white/80",
                },
                { href: "#desks", label: "Speak privately to The Vault", tone: "text-champagne-300" },
              ].map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className={`flex items-center justify-between gap-3 rounded-full border border-champagne-500/30 px-5 py-3 text-tiny uppercase tracking-[0.12em] transition-colors hover:bg-white/5 ${r.tone}`}
                >
                  {r.label}
                  {/* Decoration — the label already says where it goes, so the
                      arrow is hidden from the tree rather than read out six
                      times as "right arrow". */}
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>

            <div className="rj-fret mt-phi4 max-w-xs" aria-hidden="true" />
          </div>
        </Container>
      </section>

      {/* ── §1 THE CORE IDEA ───────────────────────────────────────────────
          Placed second on purpose. A visitor who has just arrived does not yet
          know that this page works backwards, and everything after it depends
          on their knowing. */}
      <Container className="py-phi6">
        {/* 🚨 THE LEFT COLUMN HAD TWO LINES IN IT (report 6, 2026-08-19: "the
            section has excessive empty space, weak visual hierarchy, and the
            content/cards feel disconnected from the premium nature of The
            Vault").

            All three complaints have one cause. An eyebrow and a two-line
            heading were holding open 38% of the band's width against a column
            of body copy nearly four times as tall, so the left half was mostly
            air and the heading — the thing meant to lead the section — was the
            smallest object in it.

            ⚠️ THE PICTURE IS `VaultPlate`, NOT A NEW ASSET. That component
            already backs every family card on this page and DRAWS a plate when
            it has no photograph, so the column is never empty and nothing new
            has to be commissioned or shipped. Give `settings.familyImages` a
            key and it becomes a real property visual with no code change. */}
        {/* 🚨 REARRANGED TO THE REPORT'S OWN REFERENCE (report 10, 2026-08-20:
            "use the first layout as the reference design, keep the larger hero
            image on the right side, keep the heading and description on the
            left side, arrange the six property examples in a clean 3×2 card
            grid below the main content").

            The report-6 build put the picture UNDER the heading in the narrow
            left column and the six spoken examples in the right one — which is
            the proportion problem it now names: a 4:5 portrait stretched the
            left column past the copy beside it. Words (heading + both
            paragraphs) now hold the wide left column, the picture stands alone
            on the right, and the six examples run full-width below in three
            columns — two rows of three, the reference's grid. Source order is
            still words → picture → examples, so a phone and a screen reader
            read the argument before the illustration. */}
        <div className="grid items-center gap-phi5 lg:grid-cols-[1.618fr_1fr]">
          <div>
            <p className="rj-eyebrow text-jamin-gold-ink">The idea</p>
            {/* ⚠️ BACK TO `2xl/3xl` — the size bump was wrong and measuring
                caught it. At `lg:text-4xl` this h2 rendered at 67.8px, which is
                exactly what the hero h1 now renders at: a section heading the
                same size as the page title is not a stronger hierarchy, it is
                no hierarchy. The report's "strengthen the THE IDEA heading" is
                answered structurally instead — the column beside it is no
                longer empty, so the heading stops floating in white space —
                and by the rule and plate below it. */}
            <h2 className="mt-phi2 text-balance text-2xl text-ink lg:text-3xl">
              You do not have to find it. You have to describe it.
            </h2>
            <div className="rj-fret mt-phi3 max-w-[10rem]" aria-hidden="true" />
            {/* The owner's picture, 2026-08-19 evening — the column carried
                `VaultPlate`'s DRAWN fallback until now, which is what the
                report-6 note said it would do until a frame arrived. It has
                arrived, so the plate takes its `src` branch and the drawing
                stands down.

                ⚠️ The supplied file had a dark frame baked into it and was
                cropped to the photograph before saving; the border below is
                the page's, and two of them read as a mount. If this frame is
                ever replaced, crop the new one the same way. */}
            <p className="mt-phi4 text-lg leading-relaxed text-ink-soft">
              {hero.note ?? VAULT_FALLBACK.hero.note}
            </p>
            <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
              Most of what The Vault handles is never published — it is held quietly, and moved
              between people who are already known to us. So instead of a catalogue to search, there
              is a desk to speak to. Tell us what you want, and a representative takes it from
              there.
            </p>
          </div>
          {/* The owner's picture holds the RIGHT column now, 4:3 rather than
              4:5 — the report's "larger hero image on the right side", sized
              to end near the copy's own foot instead of a storey past it.

              🚨 IT SHOWS ON A PHONE TOO (report 13, 2026-08-21: "the current
              section doesn't have image in mobile view, appears visually flat
              without a strong supporting visual. Keep the image for the mobile
              as well which is currently displayed in the desktop"). The old
              `hidden lg:block` was argued as saving a phone reader a screen of
              scrolling for a picture that "says nothing new" — the owner reads
              the same absence as the section falling flat, and the newer word
              wins. It sits BELOW the copy on a phone (source order is
              unchanged), so the argument is still read before the
              illustration. */}
          <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-champagne-500/35">
            <VaultPlate
              src="/vault/the-idea.webp"
              seed="the-idea"
              sizes="(min-width: 1024px) 38vw, 100vw"
            />
          </div>
        </div>

        {/* ⚠️ THESE ARE QUOTATIONS, SO THEY ARE SET AS QUOTATIONS. They were
            plain bordered boxes carrying curly quotes as punctuation, which
            is what made them read as "disconnected" — a spoken sentence
            looked like a form field. Each keeps its champagne rule down the
            speaking edge and the drawn quote mark. Full-width in THREE columns
            from `lg` now — six examples, two rows of three, the report's 3×2 —
            two columns at `sm`, one on a phone.

            ⚠️ The gold is a HAIRLINE AND A MARK, never the words:
            champagne-500 measures 2.36:1 on this ground and would fail as
            text. The sentence itself stays `ink-soft`. */}
        <ul className="mt-phi5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {SPOKEN.map((line) => (
            <li
              key={line}
              className="relative overflow-hidden rounded-card border border-champagne-500/30 bg-canvas-alt py-3 pl-phi4 pr-phi3 text-base leading-relaxed text-ink-soft"
            >
              <span
                aria-hidden="true"
                className="absolute inset-y-0 left-0 w-[3px] bg-champagne-500/60"
              />
              <span
                aria-hidden="true"
                className="absolute left-3 top-1.5 text-lg leading-none text-champagne-500/50"
              >
                “
              </span>
              {line}
            </li>
          ))}
        </ul>
      </Container>

      {/* ── §3 THE FOUR PATHS ──────────────────────────────────────────────*/}
      <section className="border-y border-line bg-canvas-alt py-phi6">
        <Container>
          <p className="rj-eyebrow text-jamin-gold-ink">Where would you like to begin</p>
          <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">Four ways into The Vault</h2>

          <ul className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-4">
            {PATHS.map((p) => (
              <li key={p.key} className="flex">
                <Link
                  href={p.href}
                  className="rj-lift group flex w-full flex-col overflow-hidden rounded-xl border border-line bg-canvas"
                >
                  <span className="relative aspect-[4/3] w-full overflow-hidden bg-canvas-sunken">
                    <VaultPlate src={p.image} seed={p.key} sizes="(min-width: 1024px) 25vw, 50vw" />
                  </span>
                  <span className="flex flex-1 flex-col p-phi3">
                    <span className="rj-eyebrow text-jamin-gold-ink">{p.kicker}</span>
                    <span className="mt-phi2 text-lg text-ink">{p.title}</span>
                    <span className="mt-phi2 flex-1 text-base leading-relaxed text-ink-muted">
                      {p.note}
                    </span>
                    <span className="mt-phi3 text-tiny font-semibold uppercase tracking-[0.12em] text-cta-deep">
                      {p.cta} →
                    </span>
                  </span>
                </Link>
              </li>
            ))}

            {/* ⚠️ THIS FILLS A HOLE THAT ONLY EXISTS AT `lg`, WHICH IS WHY IT
                IS HIDDEN EVERYWHERE ELSE. `PATHS` is five cards in a
                four-column grid, so the second row carries co-develop and three
                empty columns — the gap the owner pointed at. At `sm` the grid
                is two columns and the leftover cell is one narrow slot, where a
                2:1 photograph would be a letterbox sliver; at base there is one
                column and no hole at all. Adding it there would not be filling
                a gap, it would be adding a section nobody asked for.

                ⚠️ `aria-hidden` + `alt=""`, per the standing rule for brand
                imagery: the picture carries its own words, so a caption of ours
                would say it twice, and a screen reader reading "JAMIN BAZAAR,
                the truly elite are shaped by humble beginnings" out of a list of
                four ways into The Vault is noise in a list of controls. The
                list still holds five real destinations.

                ⚠️ Its height is NOT its own — it stretches to whatever the
                co-develop card beside it measures, so the crop is set by that
                card rather than by the artwork. Measured live rather than
                assumed:

                  >=1200 container   cell 895x447 = 2.003 against a native
                                     2.000 source — NOTHING is cropped. The
                                     three-track span plus two 21px gaps lands
                                     on the artwork's own ratio, and the
                                     co-develop card measures 447 beside it.
                  1024               cell 695x442 = 1.574, so 21.3% of the
                                     WIDTH goes.

                ⚠️ `object-center`, and that is the swept answer rather than the
                obvious one. The instinct is `object-right`, because the
                signboard and the quote are the content and they sit right of
                centre — but rendering all three anchors at the 1.574 worst case
                shows the sign has vine and wall to its right that can be spent,
                so centring keeps the board AND the whole quote while also
                keeping the bicycle and the lit house that `object-right` throws
                away. `object-left` clips the quote to "The truly elit…" and is
                the only one that is plainly wrong. Re-render that comparison if
                the artwork is ever swapped; the answer follows the picture. */}
            <li aria-hidden="true" className="hidden lg:col-span-3 lg:flex">
              <div className="relative w-full overflow-hidden rounded-xl border border-line bg-canvas-sunken">
                <Image
                  src="/vault/humble-beginnings-1774.webp"
                  alt=""
                  fill
                  sizes="(min-width: 1024px) 66vw, 0px"
                  className="object-cover object-center"
                />
              </div>
            </li>
          </ul>
        </Container>
      </section>

      {/* ── HELD IN THE VAULT ──────────────────────────────────────────────
          ⚠️ Renders NOTHING when there is nothing to show. An empty grid with a
          "no results" message would be the one moment on this page that reads
          like a portal, and the argument above it — that most of what we handle
          is unpublished — already accounts for the silence. */}
      {listings.length > 0 ? (
        <Container className="py-phi6">
          <p className="rj-eyebrow text-jamin-gold-ink">Currently in The Vault</p>
          <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">
            {listings.length} {listings.length === 1 ? "property" : "properties"} shown publicly
          </h2>
          <p className="mt-phi2 max-w-2xl text-lg leading-relaxed text-ink-muted">
            What appears here is what its owner is content to show. It is a fraction of what The
            Vault holds.
          </p>

          {/* A rail, not a grid. §23 asks for fewer listings and larger
              photographs, and a grid does the opposite of both as soon as there
              are more than four — it shrinks every picture to fit them all on
              one screen. Scrolling keeps each one large and makes the reader
              move through them one at a time, which is how a dossier is read. */}
          <VaultCarousel
            label="Properties currently in The Vault"
            className="mt-phi5"
            itemClassName="w-[86%] sm:w-[64%] lg:w-[48%]"
          >
            {listings.map((l) => {
              const place = publicPlace(l);
              const badge = verificationBadge(l.stage);
              return (
                <div key={l.id} className="flex h-full">
                  <Link
                    href={vaultListingHref(l)}
                    className="rj-lift group flex w-full flex-col overflow-hidden rounded-xl border border-line bg-canvas-alt"
                  >
                    <span className="relative aspect-[3/2] w-full overflow-hidden bg-canvas-sunken">
                      <VaultPlate
                        src={l.images?.[0]}
                        seed={l.slug ?? l.id}
                        alt=""
                        sizes="(min-width: 1024px) 50vw, 100vw"
                      />
                    </span>
                    <span className="flex flex-1 flex-col p-phi4">
                      {badge ? (
                        <span className="rj-eyebrow text-jamin-gold-ink">{badge}</span>
                      ) : null}
                      <span className="mt-phi2 text-2xl text-ink">{publicTitle(l)}</span>
                      {place ? (
                        <span className="mt-1 text-base text-ink-muted">{place}</span>
                      ) : null}
                      <span className="mt-phi3 flex-1 text-base leading-relaxed text-ink-muted">
                        {l.discreet
                          ? "Full details available upon qualified enquiry."
                          : (l.headline ?? l.summary ?? "")}
                      </span>
                      <span className="mt-phi3 text-tiny font-semibold uppercase tracking-[0.12em] text-cta-deep">
                        {l.discreet ? "Request private access" : "Open the dossier"} →
                      </span>
                    </span>
                  </Link>
                </div>
              );
            })}
          </VaultCarousel>
        </Container>
      ) : null}

      {/* ── §2 WHAT THE VAULT HANDLES ──────────────────────────────────────*/}
      {rest.length > 0 ? (
        <Container className="py-phi6">
          <p className="rj-eyebrow text-jamin-gold-ink">What we handle</p>
          <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">
            Far beyond villas and apartments
          </h2>
          <p className="mt-phi2 max-w-2xl text-lg leading-relaxed text-ink-muted">
            A register of what The Vault will take on. Where a category carries legal restriction —
            agricultural land, coastal land, heritage, forest-adjacent — eligibility is established
            before anything else happens.
          </p>

          <ul className="mt-phi5 grid gap-phi4 md:grid-cols-2 xl:grid-cols-3">
            {rest.map((f) => (
              <FamilyBlock key={f.slug} family={f} image={settings.familyImages[f.slug]} />
            ))}
          </ul>
        </Container>
      ) : null}

      {/* ── §2 HERITAGE INDIA ──────────────────────────────────────────────
          Its own band because the brief asks for one, and because it is the
          part of this list that no international private-office template
          covers. */}
      {heritage ? (
        <section className="border-y border-line bg-canvas-alt py-phi6">
          <Container>
            {/* 🚨 THE WORDS COME FIRST NOW (report 6, 2026-08-19: "the text
                content is positioned on the right side, which creates an
                unbalanced layout… place HERITAGE INDIA at the top-left").

                The picture was in the 1.618 column and the copy in the 1, so
                the section opened on an image and the reader met the heading
                two-thirds of the way across. Swapping the ORDER and the RATIO
                — text in the wide column, picture in the narrow one — puts the
                eyebrow at the top-left where every other section on this page
                already starts.

                ⚠️ Source order changed, not just `order-*`. A visual-only swap
                would leave a screen reader and a phone (where the grid is one
                column) still meeting the picture first, which is the same
                complaint in a different medium. */}
            {/* 🚨 RATIO REVERSED AND THE FRAME RESHAPED (report 10, 2026-08-20:
                "the image is too long, creating excessive empty space on the
                left… reduce the paragraph width, increase the width of the
                heritage image, reduce the height of the image slightly").

                The report-6 swap put the words first — that stands — but it
                left the picture as a 4:5 PORTRAIT in the narrow column, so the
                row's height was set by the tallest possible frame beside five
                lines of copy: the band was mostly the air under the paragraph.
                Text now takes the 1fr column (a more compact measure), the
                picture takes the 1.618fr column as a 16:10 LANDSCAPE — wider
                than before and roughly 20% shorter in absolute height, so both
                sides end near the same line. Source order still words-first. */}
            <div className="grid items-center gap-phi5 lg:grid-cols-[1fr_1.618fr]">
              <div>
                <p className="rj-eyebrow text-jamin-gold-ink">Heritage India</p>
                <h2 className="mt-phi2 text-balance text-2xl text-ink lg:text-3xl">
                  Houses that were never allowed to fall.
                </h2>
                <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                  Havelis, Chettinad mansions, colonial and plantation bungalows, courtyard homes,
                  palace-style residences. These rarely reach a portal — they change hands through
                  families, lawyers and long conversations, which is the way The Vault works anyway.
                </p>
              </div>
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-canvas-sunken">
                {/* Reads the same `familyImages` map as every other family
                    (0085) rather than a key of its own — it is a family that
                    happens to get a bigger frame, not a different kind of
                    thing. No picture in the map and it falls back to the drawn
                    plate, exactly as this band shipped. */}
                <VaultPlate
                  src={settings.familyImages[heritage.slug]}
                  seed={heritage.slug}
                  /* Back to 60vw — the frame moved to the WIDE column in the
                     report-10 rebalance above; a `sizes` that lags the box
                     makes the browser upscale a small rendition. */
                  sizes="(min-width: 1024px) 60vw, 100vw"
                />
              </div>
            </div>

            {/* 🚨 THE CATEGORIES CAME OUT OF THE RIGHT COLUMN, and that is the
                fix rather than a re-styling. They were a two-column list inside
                the narrow half of a `1.618fr_1fr` grid, so ten labels of very
                unequal length ran five rows deep in about a third of the band's
                width — reported 2026-08-14 as "arranged unevenly across
                multiple rows, leaving unnecessary empty space". The column was
                the problem: no gap or alignment inside it could make ten items
                look deliberate in that measure.

                Full width below the band, five across, so today's ten fall into
                the two equal rows the report asks for.

                ⚠️ FIVE IS THE COLUMN COUNT, NOT THE ROW COUNT — the rows are
                whatever the DATA makes them. `heritage.items` is
                `vault_categories`, and adding an eleventh in the console is a
                click; it will start a third row and that is correct. Nothing
                here may hard-code ten.

                ⚠️ 2 → 3 → 5 rather than straight to five: at 375 a five-column
                grid gives each label 60px, and "Rare culturally significant
                properties" is four words. */}
            <ul className="mt-phi5 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-line bg-line sm:grid-cols-3 lg:grid-cols-5">
              {heritage.items.map((c) => (
                <li
                  key={c.slug}
                  className="flex h-full flex-col justify-center bg-canvas-alt px-phi3 py-phi3 text-center transition-colors hover:bg-canvas"
                >
                  <p className="text-base leading-snug text-ink-soft">{c.label}</p>
                  {c.note ? (
                    <p className="mt-1 text-tiny leading-relaxed text-ink-faint">{c.note}</p>
                  ) : null}
                </li>
              ))}
            </ul>

            <p className="mt-phi4 max-w-3xl text-tiny leading-relaxed text-ink-faint">
              Heritage and culturally significant property carries its own rules on alteration,
              transfer and use. Those are established for the specific building, never assumed from
              the category.
            </p>
          </Container>
        </section>
      ) : null}

      {/* ── §17 DESTINATIONS ───────────────────────────────────────────────*/}
      {destinations.length > 0 ? (
        <Container className="py-phi6">
          <p className="rj-eyebrow text-jamin-gold-ink">Where</p>
          <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">The places we are asked for</h2>
          <p className="mt-phi2 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Where requirements come from most often. It is not a claim of inventory in each — it is
            where the desk already has people worth calling.
          </p>

          <ul className="mt-phi5 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {destinations.map((d) => (
              <li key={d.slug} className="flex">
                <Link
                  href={`/vault/request?intent=buy&where=${encodeURIComponent(d.name)}`}
                  className="rj-lift group relative flex aspect-[4/5] w-full flex-col justify-end overflow-hidden rounded-xl border border-line bg-canvas-sunken"
                >
                  <VaultPlate
                    src={d.image_url}
                    seed={d.slug}
                    kind="destination"
                    sizes="(min-width: 1280px) 25vw, (min-width: 640px) 50vw, 100vw"
                  />
                  {/* The scrim is what makes the name legible over any
                      photograph an administrator later uploads — the plate is
                      dark, but a real picture might not be. */}
                  <span
                    className="pointer-events-none absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(to top, rgba(10,10,9,0.88) 0%, rgba(10,10,9,0.45) 38%, rgba(10,10,9,0) 68%)",
                    }}
                    aria-hidden="true"
                  />
                  <span className="relative p-phi3">
                    <span className="block text-xl text-white">{d.name}</span>
                    {d.tagline ? (
                      <span className="mt-1 block text-base text-white/75">{d.tagline}</span>
                    ) : null}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      ) : null}

      {/* ── §7 BESPOKE SEARCH + §6 THE OFF-MARKET VAULT ────────────────────*/}
      <section className="border-y border-line bg-canvas-alt py-phi6">
        <Container>
          <div className="grid gap-phi5 lg:grid-cols-2">
            <div>
              <p className="rj-eyebrow text-jamin-gold-ink">Vault bespoke search</p>
              <h2 className="mt-phi2 text-balance text-2xl text-ink lg:text-3xl">
                You describe it. We search for it.
              </h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                When nothing we hold answers a requirement, the requirement becomes the brief. The
                desk takes it to owners, lawyers, estate managers and the people who know what is
                quietly available in a district — and reports back, including when the answer is
                that it does not exist at the price.
              </p>
              <Link
                href="/vault/request"
                className="mt-phi4 inline-flex rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep"
              >
                Submit a private requirement
              </Link>
            </div>

            <div>
              <p className="rj-eyebrow text-jamin-gold-ink">The off-market Vault</p>
              <h2 className="mt-phi2 text-balance text-2xl text-ink lg:text-3xl">
                Not everything is meant to be seen.
              </h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
                Every property offered to The Vault is held at one of three levels. An owner chooses;
                the system enforces it.
              </p>
              <ul className="mt-phi4 space-y-phi3">
                {LEVELS.map((l) => (
                  <li key={l.name} className="border-t border-line pt-phi3">
                    <p className="text-lg text-ink">{l.name}</p>
                    <p className="mt-1 text-base leading-relaxed text-ink-muted">{l.note}</p>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      {/* ── §4 + §5 THE TWO DESKS ──────────────────────────────────────────*/}
      <Container className="py-phi6">
        <div id="desks" className="scroll-mt-28 grid gap-phi4 lg:grid-cols-2">
          <div className="flex flex-col rounded-xl border border-champagne-500/35 bg-canvas-alt p-phi4 lg:p-phi5">
            <p className="rj-eyebrow text-jamin-gold-ink">For clients</p>
            <h2 className="mt-phi2 text-balance text-2xl text-ink lg:text-3xl">
              Looking for something we haven&rsquo;t listed?
            </h2>
            <p className="mt-phi3 flex-1 text-lg leading-relaxed text-ink-muted">
              Tell us what you are looking for. Some of the finest properties never reach the open
              market. Location, landscape, architecture, privacy, acreage, budget, intended use —
              whatever matters to you is what we work from.
            </p>
            <Link
              href="/vault/request"
              className="mt-phi4 inline-flex justify-center rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep"
            >
              Submit private requirement
            </Link>
          </div>

          <div className="flex flex-col rounded-xl border border-champagne-500/35 bg-canvas-alt p-phi4 lg:p-phi5">
            <p className="rj-eyebrow text-jamin-gold-ink">For owners</p>
            <h2 className="mt-phi2 text-balance text-2xl text-ink lg:text-3xl">
              Have something exceptional?
            </h2>
            <p className="mt-phi3 flex-1 text-lg leading-relaxed text-ink-muted">
              Offer your property privately to The Vault for sale or lease. Choose to keep it
              off-market and it never appears in the public catalogue — it is held privately and
              matched by hand against qualified requirements.
            </p>
            <Link
              href="/vault/offer"
              className="mt-phi4 inline-flex justify-center rounded-full border border-champagne-300 px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-champagne-300 transition-colors hover:bg-white/5"
            >
              Offer to The Vault
            </Link>
          </div>
        </div>
      </Container>

      {/* ── §14 THE STANDING LINES ─────────────────────────────────────────
          Discretion said once, quietly, rather than asserted on every card. */}
      <section className="border-y border-line py-phi6">
        <Container>
          {/* ⚠️ NUMBERED, AND THE NUMBER IS THE FIX. Reported 2026-08-14 as
              five separate text blocks with uneven spacing, "stretched and less
              structured" — which is what a one-column stack of unequal
              sentences under identical hairlines looks like on a phone. Each
              rule read as the start of a section rather than as a divider, and
              nothing said the five were one list.

              `01`–`05` in the ledger face, with the line held off them by a
              vertical hairline, says it in the page's own vocabulary: this is
              the same treatment `LedgerCount` and the plot schedule already
              use, so it is not a new device.

              ⚠️ The count comes from the DATA. `promise` is `vault_settings`
              and the console can hold three lines or six — the fallback ships
              three. Never hard-code `05`.

              ⚠️ Tighter only where it was reported. `gap-phi2` on a phone
              closes the stretch; from `sm` the grid is two and three columns,
              where the old rhythm was never the complaint. */}
          {/* 🚨 A HEADING, BECAUSE THE BLOCK HAD NONE (report 13, 2026-08-21:
              "the five-point content block appears as a standalone section
              between the CTA cards above and the FAQ section below. Since
              there is no heading, [readers] don't immediately understand the
              purpose of these points. Add a section heading above the five
              points, while keeping the existing layout and styling. Suggested
              heading: Private opportunities, handled differently").

              The owner's own words are used verbatim. The note above says the
              numbering is what makes the five read as ONE list; the heading is
              what says WHAT the list is — the two answer different halves of
              the same confusion. Layout and styling below are untouched, as
              the report asks. */}
          <h2 className="mb-phi4 text-2xl text-ink">Private opportunities, handled differently.</h2>
          <ul className="grid gap-phi2 sm:grid-cols-2 sm:gap-phi3 lg:grid-cols-3">
            {promise.map((line, i) => (
              <li key={line} className="flex gap-phi3 border-t border-line pt-phi3">
                <span
                  aria-hidden="true"
                  className="ledger shrink-0 text-tiny uppercase tracking-[0.12em] text-jamin-gold-ink"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="border-l border-line pl-phi3 text-lg leading-relaxed text-ink-soft">
                  {line}
                </span>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      {/* ── TRUST ──────────────────────────────────────────────────────────*/}
      {settings.faq?.length ? (
        <Container className="py-phi6">
          <p className="rj-eyebrow text-jamin-gold-ink">Before you write</p>
          <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">Questions the desk is asked</h2>
          <dl className="mt-phi5 max-w-3xl">
            {settings.faq.map((f) => (
              <div key={f.q} className="border-t border-line py-phi3">
                <dt className="text-lg text-ink">{f.q}</dt>
                <dd className="mt-phi2 text-base leading-relaxed text-ink-muted">{f.a}</dd>
              </div>
            ))}
          </dl>
        </Container>
      ) : null}

      {/* ── THE GALLERY ────────────────────────────────────────────────────
          A picture rail the desk fills by hand, at the foot of the page.
          Deliberately NOT derived from inventory: the Vault's argument is
          visual and its inventory may be empty for a long time, so this is how
          it shows what it deals in without publishing a property.

          ⚠️ HIDDEN UNTIL THERE ARE PICTURES. It shipped on 2026-08-11 holding
          its space with four engraved plates, and the owner asked the same day
          for it to be hidden instead — a placeholder rail on a page whose whole
          argument is restraint reads as an unfinished page. So the section is
          gated on the gallery having content.

          ⚠️ THE FEATURE IS NOT DELETED, IT IS DORMANT. The Gallery tab in the
          admin console still writes here, and the first upload brings the
          section back with no deploy. Removing this block would mean the
          console has a screen that changes nothing, which is worse than an
          empty state — it is a lie about what the button does. */}
      {settings.gallery.length > 0 ? (
      <section className="border-t border-line py-phi6">
        <Container>
          <p className="rj-eyebrow text-jamin-gold-ink">In pictures</p>
          <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">What The Vault deals in</h2>
          <p className="mt-phi2 max-w-2xl text-lg leading-relaxed text-ink-muted">
            Estates, residences and land the desk has been asked for. Brand imagery — never a
            caption, never a claim about a specific property.
          </p>

          <VaultCarousel
            label="The Vault in pictures"
            className="mt-phi5"
            itemClassName="w-[80%] sm:w-[52%] lg:w-[38%]"
          >
            {settings.gallery.map((item, i) => (
              <figure key={`g-${i}`} className="m-0">
                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-line bg-canvas-sunken">
                  <VaultPlate
                    src={item.url || undefined}
                    seed={`vault-gallery-${i}`}
                    alt={item.caption ?? ""}
                    sizes="(min-width: 1024px) 38vw, 80vw"
                  />
                </div>
                {/* A caption only where one was written. §22: a picture with an
                    invented caption is a claim nobody made. */}
                {item.caption ? (
                  <figcaption className="mt-phi2 text-tiny text-ink-faint">{item.caption}</figcaption>
                ) : null}
              </figure>
            ))}
          </VaultCarousel>
        </Container>
      </section>
      ) : null}

      {/* ── §22 LEGAL ──────────────────────────────────────────────────────
          ⚠️ Small type, but never absent. §22 is explicit that luxury may not
          cost clarity, and the verification paragraph in particular is the one
          that stops a premium presentation from implying a legal opinion
          nobody has given. */}
      {/* ⚠️ `pb-phi5` at EVERY width now (owner report 2026-08-18: "excessive
          padding bottom in the Vault section" under the closing line). The
          2026-08-15 round cut the phone to phi5 and left `lg:pb-phi7` — but
          the desktop stacks the same way: phi7 here plus the footer's 9rem
          top margin was ~290px of dark canvas under fifteen words. The
          footer's own margin IS the separation; this container adds only a
          breath. */}
      {settings.legal ? (
        <Container className="pb-phi5">
          {/* Aesthetics items 2 + 4 + 18: the legal panel becomes a FILED
              sheet — whisper grain, aged-corner vignette, kolam corners. */}
          <div className="rj-grain rj-vignette relative rounded-xl border border-line p-phi4">
            <KolamCorner className="pointer-events-none absolute left-2 top-2 h-8 w-8 text-champagne-500/45" />
            <KolamCorner className="pointer-events-none absolute bottom-2 right-2 h-8 w-8 rotate-180 text-champagne-500/45" />
            <p className="rj-eyebrow text-ink-faint">Please note</p>
            <div className="mt-phi3 space-y-phi3 text-tiny leading-relaxed text-ink-muted">
              {settings.legal.intro ? <p>{settings.legal.intro}</p> : null}
              {settings.legal.restricted ? <p>{settings.legal.restricted}</p> : null}
              {settings.legal.verification ? <p>{settings.legal.verification}</p> : null}
              {settings.legal.privacy ? <p>{settings.legal.privacy}</p> : null}
            </div>
          </div>

          {/* ⚠️ THE CLOSING LINE IS A COMPOSED BLOCK NOW, not a centred
              paragraph. Reported as "the paragraph is centered with a narrow
              text width, causing awkward line breaks… the content feels
              disconnected from the rest of the page", and both halves were
              true for the same reason: it was a bare `<p>` with no measure, so
              on a phone it wrapped to four ragged lines at whatever width the
              container happened to be, and nothing tied it to the section
              above it.

              `max-w-[34rem] mx-auto` gives it a measure instead of a viewport,
              `text-balance` evens the lines rather than filling each one and
              orphaning the remainder, and the gold rule above is the site's own
              `rule-gold` — the same mark that closes the footer and opens every
              hero eyebrow — which is what connects it rather than leaving it
              floating. The `<br>` stays desktop-only: at 34rem the two
              sentences break naturally on a phone. */}
          <div className="mt-phi5 flex flex-col items-center">
            <span className="h-px w-24 rule-gold" aria-hidden="true" />
            <p className="mt-phi3 max-w-[34rem] text-balance text-center text-lg leading-relaxed text-ink-muted">
              Exceptional property doesn&rsquo;t always need a listing.
              <br className="hidden sm:block" /> Sometimes it needs the right introduction.
            </p>
          </div>
        </Container>
      ) : null}
    </>
  );
}
