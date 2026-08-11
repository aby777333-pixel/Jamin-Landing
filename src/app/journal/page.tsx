import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { JournalIndex, type JournalCard } from "@/components/JournalIndex";
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
        art={27}
        tone="cinematic"
        sheer
        /* ⚠️ RE-SWEPT FOR hero-27, NOT CARRIED OVER. The banyan this replaced
           allowed 0.02 — the lightest plate on the site — because it was deep
           shade. hero-27 is the opposite frame: overcast daylight, bright sky,
           pale grass, no shade anywhere. At 0.02 the white lead measures
           2.41:1, which is not a near miss.

           Swept on the composited frame (photograph, then `veil`'s two
           gradients, then the plate), plate region only, at the p95 this repo
           measures by:

               0.34 → eyebrow 4.27 · white 4.61   ← eyebrow under AA
               0.40 → eyebrow 4.89 · white 5.28
               0.44 → eyebrow 5.36 · white 5.79   ← ships
               0.52 → eyebrow 6.49 · white 7.01   ← the site's audited default

           The eyebrow is champagne-50 at 9.9px and is the binding ink, as it is
           on every cinematic hero. 0.44 keeps a margin on it while still
           letting more of the meadow through than the default would. */
        sheerAlpha={0.44}
        eyebrow="Jamin Journal"
        title="Land, and the things worth knowing before you decide."
        lead="Patta, chitta, encumbrance, DTCP approval — buying land means meeting a set of documents most people see only once. These are our notes on them, written plainly and kept current."
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
    </>
  );
}
