import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/PropertyCard";
import { PageHero, type HeroArt } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { CallbackBand } from "@/components/CallbackBand";
import { getProperties } from "@/lib/properties";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";
import { SITE_URL } from "@/lib/supabase";
import { seoTitle } from "@/lib/seo";

export const revalidate = 3600;

/**
 * §50 — programmatic pages, with quality control. Only stages that actually
 * hold a development are generated, and `dynamicParams = false` means any other
 * value 404s instead of quietly producing a thin page for a crawler to index.
 */
export const dynamicParams = false;

export async function generateStaticParams() {
  const all = await getProperties();
  return PHASE_ORDER.filter((phase) => all.some((p) => p.project_phase === phase)).map((phase) => ({
    phase,
  }));
}

function isPhase(v: string): v is Phase {
  return (PHASE_ORDER as readonly string[]).includes(v);
}

export async function generateMetadata({ params }: PageProps<"/projects/[phase]">): Promise<Metadata> {
  const { phase } = await params;
  if (!isPhase(phase)) return {};
  const meta = PHASE_META[phase];
  return {
    title: { absolute: seoTitle(`${meta.label} Jamin Projects in Tamil Nadu`) },
    description: meta.blurb,
    alternates: { canonical: `/projects/${phase}` },
    openGraph: {
      title: `${meta.label} Jamin projects`,
      description: meta.blurb,
      url: `${SITE_URL}/projects/${phase}`,
    },
  };
}

export default async function PhasePage({ params }: PageProps<"/projects/[phase]">) {
  const { phase } = await params;
  if (!isPhase(phase)) notFound();

  const meta = PHASE_META[phase];
  const all = await getProperties();
  const items = all.filter((p) => p.project_phase === phase);
  const plots = items.reduce((n, p) => n + (p.plots_available ?? 0), 0);

  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Projects", item: `${SITE_URL}/projects` },
      { "@type": "ListItem", position: 3, name: meta.label, item: `${SITE_URL}/projects/${phase}` },
    ],
  };

  // One image per stage, so the pages are visually distinct rather than copies
  // of the same header.
  //
  // 🚨 `completed` HAS AN ENTRY NOW, AND IT REVERSES A DELIBERATE RULE.
  // Until 2026-08-13 it deliberately had none: it opened with `secondaryImage()`
  // of the delivered development, because public/hero/README.md says a render
  // must NEVER appear on this page — its subject genuinely is a handed-over
  // project, and real photography is what belongs there. The owner asked for
  // hero-40 with that on the table, so the photograph is gone and the page now
  // opens on brand imagery like every other stage.
  //
  // ⚠️ Two things follow, and they are why this is written down rather than
  // just done. The frame shows a lit avenue of finished VILLAS while the
  // listing under it holds one PLOTTED development (Udumalaipet, 400 cents /
  // 60 plots) — the picture and the page are not describing the same thing.
  // And because `photo` is no longer passed, the image is decoration by
  // construction: `alt=""`, `aria-hidden`, no caption, ever. Restoring the
  // photograph is a two-line revert; the `secondaryImage` path is still live on
  // /projects and needs no work to come back.
  //
  // `current` ("Upcoming" in the app) now has hero-11, supplied 2026-08-08.
  // It previously had none, and the page would have fallen back to hero-05 and
  // doubled with /projects the moment a property was moved into that stage.
  // ⚠️ 2026-08-12: `ongoing` and `future` took owner-supplied photographs of
  // Jamin's OWN layouts (hero-31, hero-32), replacing the villa render and the
  // skyline render. This is the direction hero/README.md already prefers — a
  // page whose subject genuinely IS a Jamin project should carry a real
  // photograph rather than brand imagery of nowhere.
  const ART_BY_PHASE: Record<string, HeroArt> = {
    ongoing: 31,
    current: 11,
    /* hero-64 (JAMIN REGENT, owner-named 2026-08-17) replaces hero-33 —
       its lockup is CENTRED, so the right anchor keeps it whole untrimmed. */
    future: 64,
    completed: 40,
  };

  /**
   * 🚨 THE SIGN IS AT THE FAR LEFT OF BOTH NEW FRAMES, AND `paper` FADES THE
   * LEFT. That collision is the whole reason this map exists.
   *
   * `hero-fade` masks the leftmost 22% of the image box to transparent so the
   * picture dissolves into the canvas instead of ending on a hard edge. The
   * default `artPosition: "left"` anchors the source's left edge there — which
   * on hero-31/33 is exactly where the JAMIN BAZAAR board stands. Worked
   * through rather than eyeballed: at the widths this box takes, the crop shows
   * about 77% of the source, so for the board (source x 45–470 on hero-31,
   * 267–484 on hero-33, of 1774) to clear the fade the crop would have to START
   * at a negative offset. There is no `artPosition` value that both keeps the
   * board and leaves it solid.
   *
   * 🚨 SO BOTH FRAMES ARE TRIMMED, and it took two goes to learn why the anchor
   * is never enough on its own.
   *
   * hero-33 first: its board sits at source x 267–484, and the crop window is
   * only 1366px wide, so even a full right anchor starts at x 409 — always
   * short of 484. A 75px sliver of the board's dark-framed edge survived every
   * anchor value. I reasoned it would dissolve, since it lands 5.5% across a
   * box whose fade runs to 22%. It did not: the mask is already about a quarter
   * opaque there, and a high-contrast dark frame on white reads clearly through
   * it. On screen it was a sign sliced in half. Cut at source x 494.
   *
   * hero-31 second, and this one is the sharper lesson. Its board DID sit far
   * enough left to be cropped, so it shipped untrimmed — and looked correct,
   * because the copy plate was opaque and simply covered it. The moment that
   * plate went sheer the board ghosted through the headline: "AMIN BAZAAR"
   * reading straight across "Ongoing Jamin". Nothing about the picture changed;
   * a plate stopped hiding it. Cut at source x 526 (its board measures out to
   * 498, not the 470 first assumed — measure, do not eyeball).
   *
   * Two rules out of it. If a board sits more than ~400px into a 1774-wide
   * frame, `artPosition` alone CANNOT remove it. And a plate that hides
   * something is not the same as a frame that is clean — anything relying on
   * plate opacity to cover artwork breaks the day the plate goes transparent.
   *
   * Both trims also re-square the frames to 16/9, which keeps the phone band's
   * `object-contain` from letterboxing.
   *
   * So the board is cropped out on desktop and the frame shows what the page is
   * actually about — formed roads, kerbs, street lighting, the hills behind.
   * The phone band is unaffected: it is `aspect-[16/9]` + `object-contain`, so
   * a phone still sees the whole photograph, sign included.
   *
   * ⚠️ Do NOT "fix" this by trimming the sign out of the renditions. hero-19
   * and hero-21 both carry the JAMIN BAZAAR name baked in and ship as heroes;
   * the trimming precedent (hero-22) was for a picture inside a content card,
   * where a second wordmark duplicates the header. Cropping by position keeps
   * the original whole for the phone and for any future use.
   */
  /**
   * ⚠️ `completed` anchors RIGHT for the opposite reason to the other two.
   *
   * On hero-31 and hero-33 the board is at the far LEFT and the anchor moves it
   * out of the fade. hero-40's wall is at the far RIGHT (source x ~1370–1921 of
   * 1921), and the box crops to about 83% of the source width, so a `left`
   * anchor would slice the wall at 83% — a sign cut in half, which is exactly
   * the artefact hero-33 was trimmed to avoid. Anchoring right keeps it whole
   * and drops the far-left pavement instead, which carries nothing.
   */
  const ART_POSITION_BY_PHASE: Record<string, string> = {
    ongoing: "right",
    future: "right",
    completed: "right",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {/* ⚠️ Same tone and size for every stage. Giving `completed` a photograph
          once flipped it to `cinematic`, which moved its heading ON TO the image
          while Ongoing and Future kept theirs above it — three sibling pages
          with three different content structures. `paper` keeps the hierarchy
          identical across the section, and it stays that way now that the
          photograph has been replaced by hero-40. */}
      <PageHero
        art={ART_BY_PHASE[phase] ?? 5}
        artPosition={ART_POSITION_BY_PHASE[phase] ?? "left"}
        /* See-through copy plate, at the owner's request 2026-08-12. `gilt-light`
           is 0.74 with a 14px backdrop blur; `rj-gilt-light-sheer` drops the blur
           and takes the tint to 0.26, so the blueprint grid and the picture's
           faded edge read straight through and only the gold hairline holds the
           shape.

           ⚠️ It is transparent only from 1440px up, and that is enforced in
           royal.css rather than here. Below it the plate genuinely sits over the
           photograph — at 1024 the gold eyebrow measures 1.11 at this alpha
           against 4.07 at the opaque one — so the narrow widths keep 0.74. Read
           the sweep on `.rj-gilt-light-sheer` before touching either number. */
        sheer
        /* 🚨 PER PHASE NOW, AND hero-40 IS WHY — the pair rule again: a plate's
           contrast belongs to the plate AND the picture, never to the plate
           alone. 0.26 was swept against hero-31 and hero-33, whose overlap strip
           at 1440 is a pale, faded edge. hero-40 is dusk: the same strip is dark
           tarmac and shadowed kerb, and the lead paragraph (20.35px regular, so
           AA is 4.5 and not the 3.0 large-text allowance) measured **4.02 at the
           darkest pixel** carried over unchanged. It would have shipped
           invisibly, because swapping the art looks like a one-line change.

           Swept on the built page at 1440 — the width where this plate goes
           sheer — compositing the served rendition through `hero-fade`'s mask
           and then the tint, worst pixel inside each text box:

               0.26 → lead 4.02 · h1 7.09   ← hero-31/33's value, fails here
               0.34 → lead 4.56 · h1 7.96   ← the floor, and only by 0.06
               0.42 → lead 5.06 · h1 8.88   ← ships
               0.50 → lead 5.65 · h1 9.82
               0.74 → lead 7.64 · h1 13.11  ← the opaque plate

           0.42 rather than the 0.34 floor because a 0.06 margin is not a margin
           in a model that is a comparison rather than an audit. The eyebrow is
           7.52 at every step: it sits left of the band at every width and never
           touches the picture, which is why the LEAD binds on this tone where
           the eyebrow binds on the cinematic one.

           ⚠️ Applying the mask is not optional in this measurement. Without it
           the same lead reads 1.01 — `hero-fade` makes the leftmost 22% of the
           image box transparent, and the whole overlap sits inside that. */
        sheerAlpha={phase === "completed" ? 0.42 : 0.26}
        eyebrow={`${meta.label} projects`}
        title={`${meta.label} Jamin developments`}
        lead={meta.blurb}
        meta={
          <>
            {items.length} development{items.length === 1 ? "" : "s"}
            {plots > 0 ? ` · ${plots} plot${plots === 1 ? "" : "s"} available` : ""}
          </>
        }
      />
      <Container className="py-phi5">
      <nav aria-label="Breadcrumb" className="text-tiny text-ink-faint">
        <Link href="/projects" className="hover:text-jamin-red-deep">
          Projects
        </Link>
        <span className="mx-2" aria-hidden="true">
          /
        </span>
        <span className="text-ink-soft">{meta.label}</span>
      </nav>

      <div className="mt-phi4">
        {items.length === 0 ? (
          <EmptyState
            title={`No ${meta.label.toLowerCase()} projects right now`}
            body="This stage is empty at the moment. The other stages have developments you can look at today."
            action={
              <>
                <ButtonLink href="/projects" variant="secondary">
                  All projects
                </ButtonLink>
                <ButtonLink href="/contact">Talk to the desk</ButtonLink>
              </>
            }
          />
        ) : (
          <>
            {/* Cards are h3; without this the outline jumps h1 → h3. */}
            <h2 className="sr-only">{meta.label} developments</h2>
            <div className="grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((p, i) => (
                <PropertyCard key={p.id} p={p} priority={i < 3} />
              ))}
            </div>
          </>
        )}
      </div>
      </Container>
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
