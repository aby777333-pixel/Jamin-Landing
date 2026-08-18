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

  /* 🚨 THE NEWEST ARTICLE ALWAYS LEADS (owner, 2026-08-15).

     This used to sort `is_featured` to the front, so a pinned article held the
     lead slot indefinitely while newer work appeared below it — the reported
     case was the UDS guide leading while the agricultural-land piece, published
     the same day, sat underneath.

     `getJournalPosts()` already returns newest-first, so the lead is simply
     `posts[0]` and no re-sort is needed. The contract with `JournalIndex` is
     unchanged: it still treats `posts[0]` as the lead story and knows nothing
     about how that order was decided.

     ⚠️ `is_featured` is deliberately NOT removed from the schema or the console.
     The pin still records an editorial preference and the console now says
     plainly that it no longer holds the lead — restoring the old behaviour is
     one sort away, and dropping the column would have thrown that choice away
     to save a line. */
  const ordered = posts;

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
      {/* `paper` — the tone is a property of the artwork, not of the page,
          and hero-74 is a document flat-lay on near-white ground, which is
          exactly the paper family. (The long cinematic sweep notes below
          belonged to hero-43/51/55 and travel back with a photographic frame;
          kept nowhere because the paper plate's contrast is fixed and
          knowable — nothing sits behind the copy.) */}
      <PageHero
        /* hero-74 — the survey-desk flat-lay (owner report 2026-08-18: the
           Journal hero must say research/documents, not project showcase).
           The two REAL Edappadi sheets at opposing tilts — see the register
           entry in PageHero.tsx and the rebuild script in
           public/hero/README.md. hero-55 returns to the spare pile. */
        art={74}
        tone="paper"
        /* `tall` kept from the cinematic era — the Journal opens on its hero
           and the extra height is presence, not a sweep concern any more:
           the paper plate sits on the page's own ivory, so the elaborate
           per-frame alpha history that used to live here (hero-43's p99
           tables, hero-51's re-sweep) went with the photographic frames it
           measured. Recover it from git if a photograph ever returns. */
        size="tall"
        /* Subject sits RIGHT in the composed flat-lay; `right` anchors the
           sheets against the bleed edge and gives `hero-fade` the calm paper
           at the composition's left to dissolve. */
        artPosition="right"
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

      {/* ⚠️ THE hero-54 DIVIDER IS GONE (owner 2026-08-18 second report:
          "hide the image") — same decision as /about's hero-53 band: at the
          artwork's own ratio it read as a second hero mid-page, and the owner
          chose removal. Do not reintroduce a photo strip here. */}

      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
