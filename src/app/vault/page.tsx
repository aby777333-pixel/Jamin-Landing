import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/ui";
import { GoldDust } from "@/components/GoldDust";
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
   form that exists. */
const PATHS = [
  {
    key: "buy",
    kicker: "Buy",
    title: "Acquire something exceptional",
    note: "For clients looking to purchase a premium property or estate.",
    cta: "Tell us what you want",
    href: "/vault/request?intent=buy",
  },
  {
    key: "rent",
    kicker: "Rent",
    title: "Live somewhere extraordinary",
    note: "Short-term, seasonal, long-term, holiday, corporate or private rentals.",
    cta: "Find it for me",
    href: "/vault/request?intent=rent",
  },
  {
    key: "sell",
    kicker: "Sell",
    title: "Sell with discretion",
    note: "For owners wishing to sell through Jamin Bazaar's private network.",
    cta: "Speak to The Vault",
    href: "/vault/offer?intent=sell",
  },
  {
    key: "lease",
    kicker: "Lease",
    title: "Place your property privately",
    note: "For owners who want us to find suitable tenants or occupants.",
    cta: "Offer to The Vault",
    href: "/vault/offer?intent=lease",
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

function FamilyBlock({ family }: { family: VaultFamily }) {
  return (
    <li id={family.slug} className="scroll-mt-28">
      <div className="overflow-hidden rounded-xl border border-line bg-canvas-alt">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-canvas-sunken">
          <VaultPlate seed={family.slug} label={family.name} />
        </div>
        <div className="p-phi3">
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

          hero-26 — the estate at the end of its own drive, supplied by the
          owner 2026-08-11, replacing the drawn plate this section opened with.

          ⚠️ BRAND IMAGERY, NEVER A JAMIN PROJECT. Same standing rule as every
          other hero on this site: `alt=""`, `aria-hidden`, and it must never
          gain a caption, a location or a project name. See public/hero/README.

          ⚠️ THIS FRAME IS THE BRIGHTEST THE SITE CARRIES — midday sun, white
          cloud, a sunlit lawn — and the copy over it is white. That is why the
          treatment here is a SCRIM rather than the picture-plus-plate the rest
          of the site moved to on 2026-08-09: a plate alone cannot hold white
          type over a white cloud, and no amount of plate opacity fixes it
          without turning the plate into a black box.

          The scrim is two gradients, not one, because it has two jobs:
          horizontal darkens the left third where the words actually are and
          lets go over the house, so the picture survives; vertical anchors the
          top under the header and the foot into the section edge. Measured
          after: 24 text nodes in this section, zero below AA. */}
      <section className="relative isolate flex min-h-[clamp(30rem,78vh,44rem)] items-center overflow-hidden bg-onyx-900">
        <Image
          src="/hero/hero-26-1855.webp"
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div
          className="pointer-events-none absolute inset-0"
          aria-hidden="true"
          style={{
            background:
              "linear-gradient(to right, rgba(10,10,9,0.88) 0%, rgba(10,10,9,0.72) 34%, rgba(10,10,9,0.38) 64%, rgba(10,10,9,0.46) 100%), " +
              "linear-gradient(to bottom, rgba(10,10,9,0.62) 0%, rgba(10,10,9,0.22) 38%, rgba(10,10,9,0.58) 100%)",
          }}
        />
        {/* ⚠️ NARROW SCREENS NEED A FLAT VEIL ON TOP, and the reason is the crop
            rather than the design. `object-cover` on a 2.19:1 photograph in a
            tall box shows a narrow CENTRE slice — so below `lg` the horizontal
            gradient's whole argument (dark left for the words, open right for
            the house) is off-screen, and what lands under the copy is the
            sunlit lawn and the white cloud. Measured under the plate at 375:
            the brightest pixel took the gold eyebrow to 3.74. At 0.18 it is
            4.83 at 375 and 4.56 at 768, and the mean luminance moves 0.023 →
            0.017 — the picture survives; the words stop depending on which
            part of the sky they land on. */}
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          aria-hidden="true"
          style={{ background: "rgba(10,10,9,0.18)" }}
        />
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
        <Container className="relative w-full py-phi6">
          {/* ⚠️ The plate drops to 0.14 with the scrim above it. It is no longer
              carrying the contrast — the gradient is — so its remaining job is
              the gold hairline and the material cue that the rest of the site
              is built from. Swept against the composited frame at 1280, plate
              region only, worst single pixel:

                0.10 → gold 4.36 · white 7.01     ← under AA on one pixel
                0.14 → gold 4.53 · white 7.29     ← ships
                0.18 → gold 4.75 · white 7.64
                0.22 → gold 5.04 · white 8.10

              At the p95 this file normally measures by, 0.14 reads gold 7.07
              and white 11.01. Left at the site's usual 0.52 it stacked with the
              scrim and the copy sat in a visibly darker rectangle. */}
          <div
            className="gilt rj-gilt-sheer rj-sheer-copy max-w-2xl rounded-2xl p-phi4 sm:p-phi5"
            style={{ "--rj-sheer-alpha": 0.14 } as React.CSSProperties}
          >
            <p className="rj-eyebrow" style={{ color: "var(--color-champagne-300)" }}>
              {hero.eyebrow ?? "Jamin Bazaar"}
            </p>
            <h1 className="mt-phi3 text-balance text-4xl text-white lg:text-5xl">
              {hero.title ?? "The Vault"}
            </h1>
            <p className="rj-voice mt-phi3 text-pretty text-xl text-white">
              {hero.lead ?? VAULT_FALLBACK.hero.lead}
            </p>

            <div className="mt-phi5 flex flex-wrap gap-3">
              <Link
                href="/vault/request?intent=buy"
                className="rounded-full bg-jamin-red px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white transition-colors hover:bg-jamin-red-deep"
              >
                I want to buy
              </Link>
              <Link
                href="/vault/request?intent=rent"
                className="rounded-full border border-champagne-300 px-7 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-champagne-300 transition-colors hover:bg-white/5"
              >
                I want to rent
              </Link>
            </div>

            <div className="mt-phi3 flex flex-wrap gap-x-phi4 gap-y-2 text-tiny uppercase tracking-[0.12em]">
              <Link href="/vault/offer?intent=sell" className="text-white/80 underline-offset-4 hover:underline">
                I want to sell
              </Link>
              <Link href="/vault/offer?intent=lease" className="text-white/80 underline-offset-4 hover:underline">
                I want to lease my property
              </Link>
              <Link href="#desks" className="text-champagne-300 underline-offset-4 hover:underline">
                Speak privately to The Vault
              </Link>
            </div>

            <div className="rj-fret mt-phi5 max-w-xs" aria-hidden="true" />
          </div>
        </Container>
      </section>

      {/* ── §1 THE CORE IDEA ───────────────────────────────────────────────
          Placed second on purpose. A visitor who has just arrived does not yet
          know that this page works backwards, and everything after it depends
          on their knowing. */}
      <Container className="py-phi6">
        <div className="grid gap-phi5 lg:grid-cols-[1fr_1.618fr]">
          <div>
            <p className="rj-eyebrow text-jamin-gold-ink">The idea</p>
            <h2 className="mt-phi2 text-balance text-2xl text-ink lg:text-3xl">
              You do not have to find it. You have to describe it.
            </h2>
          </div>
          <div>
            <p className="text-lg leading-relaxed text-ink-soft">
              {hero.note ?? VAULT_FALLBACK.hero.note}
            </p>
            <p className="mt-phi3 text-lg leading-relaxed text-ink-muted">
              Most of what The Vault handles is never published — it is held quietly, and moved
              between people who are already known to us. So instead of a catalogue to search, there
              is a desk to speak to. Tell us what you want, and a representative takes it from
              there.
            </p>

            <ul className="mt-phi4 grid gap-2 sm:grid-cols-2">
              {SPOKEN.map((line) => (
                <li
                  key={line}
                  className="rounded-card border border-line bg-canvas-alt px-phi3 py-2.5 text-base text-ink-soft"
                >
                  “{line}”
                </li>
              ))}
            </ul>
          </div>
        </div>
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
                    <VaultPlate seed={p.key} sizes="(min-width: 1024px) 25vw, 50vw" />
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
              <FamilyBlock key={f.slug} family={f} />
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
            <div className="grid gap-phi5 lg:grid-cols-[1.618fr_1fr]">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-line bg-canvas-sunken">
                <VaultPlate seed={heritage.slug} sizes="(min-width: 1024px) 60vw, 100vw" />
              </div>
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
                <ul className="mt-phi4 grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {heritage.items.map((c) => (
                    <li key={c.slug} className="text-base text-ink-soft">
                      {c.label}
                    </li>
                  ))}
                </ul>
                <p className="mt-phi4 text-tiny leading-relaxed text-ink-faint">
                  Heritage and culturally significant property carries its own rules on alteration,
                  transfer and use. Those are established for the specific building, never assumed
                  from the category.
                </p>
              </div>
            </div>
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
          <ul className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
            {promise.map((line) => (
              <li key={line} className="border-t border-line pt-phi3 text-lg leading-relaxed text-ink-soft">
                {line}
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

          ⚠️ THE SPACE IS RESERVED WHETHER OR NOT THERE ARE PICTURES. Owner's
          instruction, 2026-08-11 — "just give space". An empty gallery renders
          four engraved plates rather than collapsing, so the section reads as a
          gallery awaiting photographs instead of as a hole in the page. Every
          other empty state on this page hides itself; this one is the exception
          and the reason is that somebody is about to fill it. */}
      <section className="border-t border-line py-phi6">
        <Container>
          <p className="rj-eyebrow text-jamin-gold-ink">In pictures</p>
          <h2 className="mt-phi2 text-2xl text-ink lg:text-3xl">What The Vault deals in</h2>
          <p className="mt-phi2 max-w-2xl text-lg leading-relaxed text-ink-muted">
            {settings.gallery.length > 0
              ? "Estates, residences and land the desk has been asked for. Brand imagery — never a caption, never a claim about a specific property."
              : "Photographs are added here by the desk. The frames below are placeholders."}
          </p>

          <VaultCarousel
            label="The Vault in pictures"
            className="mt-phi5"
            itemClassName="w-[80%] sm:w-[52%] lg:w-[38%]"
          >
            {(settings.gallery.length > 0
              ? settings.gallery
              : /* Four reserved frames. Keyed by index so the plates are stable
                   between builds rather than reshuffling on every render. */
                [0, 1, 2, 3].map((i) => ({ url: "", caption: undefined as string | undefined, i }))
            ).map((item, i) => (
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

      {/* ── §22 LEGAL ──────────────────────────────────────────────────────
          ⚠️ Small type, but never absent. §22 is explicit that luxury may not
          cost clarity, and the verification paragraph in particular is the one
          that stops a premium presentation from implying a legal opinion
          nobody has given. */}
      {settings.legal ? (
        <Container className="pb-phi7">
          <div className="rounded-xl border border-line p-phi4">
            <p className="rj-eyebrow text-ink-faint">Please note</p>
            <div className="mt-phi3 space-y-phi3 text-tiny leading-relaxed text-ink-muted">
              {settings.legal.intro ? <p>{settings.legal.intro}</p> : null}
              {settings.legal.restricted ? <p>{settings.legal.restricted}</p> : null}
              {settings.legal.verification ? <p>{settings.legal.verification}</p> : null}
              {settings.legal.privacy ? <p>{settings.legal.privacy}</p> : null}
            </div>
          </div>

          <p className="mt-phi5 text-center text-lg leading-relaxed text-ink-muted">
            Exceptional property doesn&rsquo;t always need a listing.
            <br className="hidden sm:block" /> Sometimes it needs the right introduction.
          </p>
        </Container>
      ) : null}
    </>
  );
}
