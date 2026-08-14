import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { JournalIndex, type JournalCard } from "@/components/JournalIndex";
import { CallbackBand } from "@/components/CallbackBand";
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
          hero-25 is a photograph with real tonal range, which is the case
          `veil` and the `gilt` plate exist for. */}
      <PageHero
        art={41}
        tone="cinematic"
        sheer
        /* 🚨 RE-SWEPT FOR hero-41 (2026-08-14), AND CARRYING hero-27’s 0.38
           OVER WOULD HAVE FAILED. That frame was overcast daylight; this one
           puts a sunlit signboard and a bright horizon directly under the copy,
           so the plate’s own footprint measures a p95 of rgb(221,188,155)
           against the meadow’s much darker one.

           Swept on the built page — photograph, then `veil`’s two gradients,
           then the plate — over the plate region only, at the p95 this repo
           measures by:

               0.38 → 4.09   ← hero-27’s value. UNDER AA on this frame.
               0.44 → 4.76   ← ships: the lightest that clears
               0.48 → 5.29
               0.52 → 5.89   ← the site’s audited default

           0.44 keeps a 0.26 margin, which is the same order this page has
           always run at (0.38 kept 0.21 on the meadow). Anyone lightening it
           has to change the ink first — the eyebrow binds, as on every
           cinematic hero.

           ⚠️ At the single BRIGHTEST pixel under the plate (the signboard’s
           white face, which blows to 255) nothing below 0.56 clears 4.5. That
           is a handful of pixels rather than a glyph’s worth of ground, which
           is exactly why this repo measures at p95 and not at the maximum —
           but it is the reason this frame cannot go as light as the meadow. */
        sheerAlpha={0.44}
        eyebrow="Jamin Journal"
        title="Land, and the things worth knowing before you decide."
        /* ⚠️ THREE PARAGRAPHS, so `lead` is passed as JSX rather than a
           string. `PageHero` types it as a `ReactNode` and renders it inside a
           <div>, so the paragraphs are legitimate children — a string with
           line breaks in it would have come out as one run of prose. */
        lead={
          <>
            <p className="font-medium">When there’s danger, Jamin stays cool.</p>
            <p className="mt-phi2">
              When uncertainty surrounds a property, Jamin stays calm, careful and alert. We
              help protect our buyers and sellers, even when the risks aren’t obvious.
            </p>
            <p className="mt-phi2">
              Trusted by thousands to protect what matters most: their home, their land, and
              their future.
            </p>
          </>
        }
      />
      <Container className="py-phi5">
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
