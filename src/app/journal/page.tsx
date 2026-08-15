import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { JournalIndex, type JournalCard } from "@/components/JournalIndex";
import { CallbackBand } from "@/components/CallbackBand";
import { Masthead } from "@/components/Masthead";
import {
  KIND_LABEL,
  buildSearchIndex,
  getJournalCategories,
  getJournalPosts,
  publishedLabel,
  readingMinutes,
} from "@/lib/journal";

/** 60s, not the site-wide hour. The Journal is the one section edited daily,
 *  and an hour between pressing Publish and seeing the article reads as the
 *  publish having failed — it sent the owner back to redeploy three times in a
 *  single afternoon. Property records change far less often and keep the hour. */
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Jamin Journal",
  description:
    "Guides and explainers from Jamin Properties: what to check before buying a plot in Tamil Nadu, what the approvals mean, and how the documents fit together.",
  alternates: { canonical: "/journal" },
};

/**
 * §141 — an editorial landing page, not a grid of rectangles. The lead story
 * takes the width; the rest reads as a magazine contents page.
 *
 * ⚠️ This page is now a DATA PREPARATION step and nothing else: it reads,
 * reduces each article to what a card draws plus a search haystack, and hands
 * the list to `JournalIndex`. The markup moved there rather than being
 * duplicated, because the search has to be able to re-order and replace the
 * layout — a client component that could only render a second list beside the
 * server's would have left two versions of every card to keep in step.
 */
export default async function JournalPage() {
  const [posts, categories] = await Promise.all([getJournalPosts(), getJournalCategories()]);

  const used = new Set(posts.map((p) => p.blog_categories?.slug).filter(Boolean));

  /* ⚠️ The editor's featured article is sorted to the FRONT here, on the
     server, and that is the whole contract with JournalIndex: it treats
     `posts[0]` as the lead. Doing it here keeps `is_featured` out of the
     payload and keeps the editorial decision on the server side, where the
     rest of the article's ordering already lives. */
  const ordered = [...posts].sort((a, b) => Number(b.is_featured) - Number(a.is_featured));

  const cards: JournalCard[] = ordered.map((p) => ({
    id: p.id,
    slug: p.slug,
    title: p.title,
    excerpt: p.excerpt,
    coverUrl: p.cover_url,
    coverAlt: p.cover_alt,
    kindLabel: KIND_LABEL[p.kind] ?? p.kind,
    categoryName: p.blog_categories?.name ?? null,
    minutes: readingMinutes(p),
    dateLabel: publishedLabel(p),
    hay: buildSearchIndex(p),
  }));

  return (
    <>
      {/* `cinematic` — the tone is a property of the artwork, not of the page.
          hero-43 is a photograph with real tonal range, which is the case
          `veil` and the `gilt` plate exist for. */}
      <PageHero
        art={43}
        tone="cinematic"
        /* Taller, at the owner's request (2026-08-15): `clamp(26rem,64vh,38rem)`
           against the standard `clamp(20rem,48vh,30rem)`.

           🚨 HEIGHT CHANGES THE CROP, SO THE PLATE HAD TO BE RE-SWEPT — the
           same rule as swapping the artwork. A taller box takes LESS off the
           top and bottom (131px of slack here against 275px), so more of the
           frame's bright mist bank arrives under the copy. Carried over
           unchanged, 0.08 fell from a worst-case p99 of 4.77 to **4.54** — still
           passing, but on a margin of 0.04 rather than 0.27, which is not a
           margin at all.

           ⚠️ THE FIX IS THE CROP, NOT THE TINT. Steering the frame up trades
           the wet foreground for banyan canopy, which is the dark half of the
           picture. Swept at 1440x576, 1440x608, 1280, 1920x1080 and 1680:

               object-position   worst p99 @ 0.08
               top   (0%)             5.07
               25%                    5.00   ← ships
               center                 4.54   (the naive carry-over)
               75%                    3.96   FAILS
               bottom                 3.45   FAILS

           So the hero gets taller AND keeps the lightest plate on the site,
           with a 0.50 margin — nearly double what it ran at before. Verified
           the JAMIN BAZAAR signboard (source y 275–479 of 879) sits fully
           inside the 25% crop at every one of those widths. */
        size="tall"
        artPosition="center 25%"
        sheer
        /* 🚨 RE-SWEPT FOR hero-43 (2026-08-15). The owner asked for the plate
           “see-through to the max”, and on THIS frame that is a real option
           rather than a wish: hero-41 was a sunlit meadow whose footprint
           measured a p95 of rgb(221,188,155), where hero-43 is a wet forest
           platform in deep shade measuring rgb(20,47,30). Same request on the
           old frame would have been refused.

           Swept the way this page always is — photograph, then `veil`’s two
           gradients, then the plate — over the plate’s footprint only:

               0.00 → 7.83 at p95   the tint removed entirely
               0.08 → 8.47 at p95   ships
               0.44 → 12.00 at p95  hero-41’s value

           ⚠️ AND p95 IS THE WRONG STATISTIC ON THIS FRAME, WHICH IS THE WHOLE
           REASON THIS IS NOT 0. The mist at the track’s vanishing point is a
           genuinely bright BANK, not the stray specular hits p95 exists to
           discount, and it lands under the plate’s inner edge. Measured at p99
           across 1440x900, 1440x1080, 1280, 1920x1080 and 1680:

               0.00 → 4.23 worst   FAILS
               0.04 → 4.49 worst   fails by 0.01
               0.08 → 4.77 worst   ships, 0.27 of margin

           1.38% of the footprint sits above the 4.5 limit at alpha 0 — an area,
           so a reader would meet it. 0.08 keeps the same order of margin this
           page has always run at (0.44 kept 0.26 on the meadow) while being
           5.5x lighter, and it is below the utility’s own 0.14 default.
           The eyebrow binds, as on every cinematic hero — `champagne-50`, not
           the white h1. Anyone lightening this has to change the ink first. */
        sheerAlpha={0.08}
        /* ⚠️ 42rem, NOT the 38rem /properties uses — the cliff is set by the
           headline and this one is longer. Measured at 1440: "Land, and the
           things worth knowing before you decide." holds three lines at 42rem
           and breaks to four at 40. So this card gives back 64px of picture
           where /properties gave back 128. Re-measure before changing it. */
        sheerEdge
        plateXl="42rem"
        eyebrow="Jamin Journal"
        title="Land, and the things worth knowing before you decide."
        /* ONE LINE now, where this was three paragraphs (owner, 2026-08-15).
           Still JSX rather than a bare string so the weight matches what the
           opening line always carried — `PageHero` types `lead` as a
           `ReactNode` and renders it in a <div>, so a <p> is a legitimate
           child. ⚠️ Losing ~100px of copy makes the PLATE shorter, which is
           why the alpha sweep above measures a 340px footprint and not the
           480px the three paragraphs occupied: a shorter plate sits higher on
           the frame, over different pixels. Re-sweep if this copy grows. */
        lead={
          <p className="font-medium">
            India’s Complete Real Estate Knowledge Hub — From Plot to Property, Stay on the
            Right Track
          </p>
        }
      />
      <Container className="py-phi5">
        {/* The nameplate. `count` is the published rows and `issue` is this
            build's date — the same stamp the title block carries, in the
            office's own timezone rather than the builder's. */}
        <Masthead
          count={posts.length}
          issue={new Intl.DateTimeFormat("en-GB", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            timeZone: "Asia/Kolkata",
          }).format(new Date())}
        />
        {posts.length === 0 ? (
          <div className="mt-phi5">
            <EmptyState
              title="The first pieces are being written"
              body="Jamin Journal opens shortly with guides on patta and chitta, what DTCP approval actually certifies, and a plot-buying checklist. Until then, the sales desk will answer any of it directly."
              action={
                <>
                  <ButtonLink href="/properties" variant="secondary">
                    Browse properties
                  </ButtonLink>
                  <ButtonLink href="/contact">Ask the desk</ButtonLink>
                </>
              }
            />
          </div>
        ) : (
          <JournalIndex
            posts={cards}
            /* Only categories that actually hold something. */
            categories={categories
              .filter((c) => used.has(c.slug))
              .map((c) => ({ slug: c.slug, name: c.name }))}
          />
        )}
      </Container>
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
