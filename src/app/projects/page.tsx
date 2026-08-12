import type { Metadata } from "next";
import Link from "next/link";
import { PropertyCard } from "@/components/PropertyCard";
import { PageHero } from "@/components/PageHero";
import { Container, EmptyState, ButtonLink } from "@/components/ui";
import { getProperties, secondaryImage } from "@/lib/properties";
import { PHASE_META, PHASE_ORDER, type Phase } from "@/lib/site";

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
  const photo = showcase
    ? { src: secondaryImage(showcase)!, alt: `${showcase.title}, a Jamin development` }
    : undefined;

  return (
    <>
      <PageHero
        art={5}
        photo={photo}
        tone={photo ? "cinematic" : "paper"}
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
        sheerAlpha={0.34}
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
        groups.map((g) => (
          <section key={g.phase} className="mt-phi6 first:mt-phi5">
            <div className="flex flex-wrap items-end justify-between gap-phi2 border-b border-line pb-phi2">
              <div className="max-w-xl">
                <h2 className="text-2xl text-ink">{g.meta.label}</h2>
                <p className="mt-2 text-base leading-relaxed text-ink-muted">{g.meta.blurb}</p>
              </div>
              <Link
                href={`/projects/${g.phase}`}
                className="text-tiny font-semibold uppercase tracking-[0.12em] text-jamin-red-deep"
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
        ))
      )}
      </Container>
    </>
  );
}

export type { Phase };
