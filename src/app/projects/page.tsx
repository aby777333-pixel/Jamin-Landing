import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { CallbackBand } from "@/components/CallbackBand";
import { getProperties, secondaryImage } from "@/lib/properties";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";
import { STAGE_STONE } from "@/lib/stones";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Projects by Stage",
  description:
    "Every Jamin Properties development grouped by stage: ongoing layouts selling now, upcoming releases, future land, and completed projects already handed over.",
  alternates: { canonical: "/projects" },
};

/**
 * §13 — project discovery grouped the way a buyer actually thinks: how far
 * along is it, and can I buy into it yet. The groups come from live rows, so a
 * stage with nothing in it never renders an empty shelf.
 */
export default async function ProjectsPage() {
  const all = await getProperties();
  const groups = PHASE_ORDER.map((phase) => ({
    phase,
    meta: PHASE_META[phase],
    items: all.filter((p) => p.project_phase === phase),
  })).filter((g) => g.items.length > 0);

  // ⚠️ The reason recorded here used to be that hero-05 was needed on the
  // homepage, where it literally illustrated "from sanctioned drawing to a plot
  // you stand on". That section was rewritten on 2026-08-09 and now opens on
  // the place a buyer is from rather than on the drawing, so hero-05 is no
  // longer doing double duty — it is this page's alone, and the fallback below
  // can no longer collide with the homepage.
  //
  // The rest still holds: this page is an index of real projects, so a real
  // project carries it — the second photograph, because the first is the card
  // cover in the grid below.
  const showcase = all.find((p) => secondaryImage(p));
  // Kept live for the one-prop restore recorded on the PageHero call.
  const photo = showcase
    ? { src: secondaryImage(showcase)!, alt: `${showcase.title}, a Jamin development` }
    : undefined;

  return (
    <>
      {/* ⚠️ hero-69 (JAMIN GRAND, owner-named 2026-08-17) REPLACES THE REAL
          PHOTOGRAPH this page carried by rule — the owner supplied the frame
          for this page, the hero-40 precedent standing for the third time. The
          `photo`/`secondaryImage` path stays live below the fold and in code;
          restoring it is re-adding one prop. The standing rule binds hard: a
          named-community render on the projects index is alt="", aria-hidden,
          never a caption. */}
      <PageHero
        art={69}
        tone="cinematic"
        /* ⚠️ SHEER, at the owner's request 2026-08-12: "make the bg card see
           through transparent". Two things change and the second one is doing
           most of the work — `gilt` is 0.52 near-black WITH a 14px backdrop
           blur, so the picture behind the copy was both darkened and frosted.
           `rj-gilt-sheer` drops the blur entirely, so the photograph now runs
           through the plate sharp, and takes the tint to 0.34. Measured under
           the plate on the frame this page actually carries, mean luminance
           goes 0.033 → 0.060 — about twice the light, before counting the
           frost coming off.

           ⚠️ 0.34 rather than lower, and this hero is the reason the number is
           not free to keep falling: its backdrop is a PHOTOGRAPH FROM THE
           DATABASE (`secondaryImage` of the first project with one), so an
           administrator can replace it tomorrow and no sweep here can bind the
           frame. 0.34 is the alpha /journal already ships over a photograph,
           and it is the top of the range this treatment uses. Swept at 1280
           against all three candidate photos in `property-media` today, plate
           region, gold eyebrow at p95: Erode 5.79 · Varapatty 5.90 · New
           project 8.95. The worst single pixel runs 2.79–4.04 and is covered by
           `.rj-sheer-copy`'s four-layer halo, which is precisely the thing that
           replaced the blur — see the note on that class.

           If a future photo looks washed here, RAISE THIS, do not re-add blur:
           a backdrop-filter draws a hard frosted edge at the plate boundary,
           which is the artefact that got it removed in the first place. */
        sheer
        /* 0.58 for hero-69 — the bright Grand render, the same figure every
           daylight frame in the set now carries; the 0.34 note above described
           the swapped-out photograph. */
        sheerAlpha={0.58}
        eyebrow="Plotted developments"
        title="Every Jamin project, by stage"
        lead="Land moves through stages, and what you can do at each one differs — from land secured and sanctioned, through roads going in, to keys handed over."
      />
      <Container className="py-phi5">

      {groups.length === 0 ? (
        <div className="mt-phi5">
          <EmptyState
            title="Nothing published yet"
            body="Developments appear here as soon as they are published from the Jamin admin console."
            action={<ButtonLink href="/contact">Talk to the sales desk</ButtonLink>}
          />
        </div>
      ) : (
        groups.map((g) => {
          /* Colorized stage headers (owner 2026-08-17, "all over the projects
             pages"): each shelf wears its stage's own stone as a left bar, an
             underline tint and the link's ink - the same key the cards, pills
             and fore-edge tabs already speak. Stages without a stone (a future
             taxonomy addition) fall back to the champagne. */
          const stone = STAGE_STONE[g.phase as keyof typeof STAGE_STONE];
          return (
          <section key={g.phase} className="mt-phi6 first:mt-phi5">
            <div
              className="flex flex-wrap items-end justify-between gap-phi2 border-b pb-phi2"
              style={{
                borderColor: `color-mix(in srgb, ${stone?.stone ?? "var(--color-champagne-500)"} 40%, var(--color-line))`,
              }}
            >
              <div
                className="max-w-xl"
                style={{
                  borderLeft: `3px solid ${stone?.stone ?? "var(--color-champagne-500)"}`,
                  paddingLeft: "0.9rem",
                }}
              >
                <h2 className="text-2xl text-ink">{g.meta.label}</h2>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{g.meta.blurb}</p>
              </div>
              <Link
                href={`/projects/${g.phase}`}
                className="text-tiny font-semibold uppercase tracking-[0.12em]"
                style={{ color: stone?.ink ?? "var(--color-jamin-red-deep)" }}
              >
                View {g.meta.label.toLowerCase()} →
              </Link>
            </div>
            <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p, i) => (
                <PropertyCard key={p.id} p={p} priority={i === 0 && g.phase === PHASE_ORDER[0]} />
              ))}
            </div>
          </section>
          );
        })
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

export type { Phase };
