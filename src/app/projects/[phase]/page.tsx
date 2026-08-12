import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/PropertyCard";
import { PageHero, type HeroArt } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { getProperties, secondaryImage } from "@/lib/properties";
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
  // of the same header. `completed` is deliberately absent: it opens with a
  // photograph of a delivered project instead, which is both truer to its
  // subject and what releases hero-10 back to /contact.
  //
  // `current` ("Upcoming" in the app) now has hero-11, supplied 2026-08-08.
  // It previously had none, and the page would have fallen back to hero-05 and
  // doubled with /projects the moment a property was moved into that stage.
  // ⚠️ 2026-08-12: `ongoing` and `future` took owner-supplied photographs of
  // Jamin's OWN layouts (hero-31, hero-32), replacing the villa render and the
  // skyline render. This is the direction hero/README.md already prefers — a
  // page whose subject genuinely IS a Jamin project should carry a real
  // photograph rather than brand imagery of nowhere.
  const ART_BY_PHASE: Record<string, HeroArt> = { ongoing: 31, current: 11, future: 33 };

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
   * ⚠️ hero-33 IS TRIMMED, and the reason is worth keeping because the first
   * attempt was wrong. Its board sits further into the frame (source x 267–484
   * rather than 45–470), and the crop window is only 1366px wide, so even a
   * full right anchor starts at x 409 — always short of 484. A 75px sliver of
   * the board's dark-framed edge survived every anchor value. I reasoned it
   * would dissolve, since it lands 5.5% across a box whose fade runs to 22%.
   * It did not: the mask is already about a quarter opaque there, and a
   * high-contrast dark frame on white reads clearly through that. On screen it
   * looked like a sign sliced in half.
   *
   * So hero-33's renditions are cut at source x 494 and the whole board is
   * gone. That is the hero-22 precedent applied for a NEW reason — not "a
   * second wordmark duplicates the header" but "the geometry cannot crop it
   * cleanly". The trim also re-squares the frame to 16/9, which keeps the
   * phone band's `object-contain` from letterboxing.
   *
   * The rule for the next swap: if the board sits more than about 400px into a
   * 1774-wide frame, `artPosition` alone CANNOT remove it — trim the source.
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
  const ART_POSITION_BY_PHASE: Record<string, string> = { ongoing: "right", future: "right" };

  // The SECOND photograph, not the cover: the same project is carded in the
  // grid directly below this hero, and the cover is what that card shows. Falls
  // back to the render if there is no photograph at all, so a thin record
  // degrades to the old header rather than to an empty hero.
  const delivered = phase === "completed" ? items.find((p) => secondaryImage(p)) : undefined;
  const photo = delivered
    ? { src: secondaryImage(delivered)!, alt: `${delivered.title}, a completed Jamin development` }
    : undefined;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {/* ⚠️ Same tone and size for every stage.
          Giving `completed` a photograph earlier also flipped it to
          `cinematic`, which moved its heading ON TO the image while Ongoing and
          Future kept theirs above it — three sibling pages with three different
          content structures. The photograph was the point; the tone change was
          an accident of how it was wired. `paper` keeps the hierarchy identical
          across the section, and the photograph still replaces the render. */}
      <PageHero
        art={ART_BY_PHASE[phase] ?? 5}
        photo={photo}
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
        sheerAlpha={0.26}
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
    </>
  );
}
