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
  // eslint-disable-next-line @typescript-eslint/no-unused-vars -- unused BY DESIGN while hero-81 carries the page
  const photo = showcase
    ? { src: secondaryImage(showcase)!, alt: `${showcase.title}, a Jamin development` }
    : undefined;

  return (
    <>
      {/* ⚠️ hero-81 (JAMIN GRAND at dusk, owner's swap 2026-08-19) REPLACES
          hero-69, the daylight roundabout view of the same community. Same
          name, same page, a later hour and a closer stand — the avenue now
          recedes into the frame instead of being seen across a lawn.

          The paragraph below still describes why a RENDER carries this page
          at all, and it still holds. hero-69 → SPARES.

          ⚠️ hero-69 (JAMIN GRAND, owner-named 2026-08-17) REPLACED THE REAL
          PHOTOGRAPH this page carried by rule — the owner supplied the frame
          for this page, the hero-40 precedent standing for the third time. The
          `photo`/`secondaryImage` path stays live below the fold and in code;
          restoring it is re-adding one prop. The standing rule binds hard: a
          named-community render on the projects index is alt="", aria-hidden,
          never a caption. */}
      <PageHero
        art={81}
        /* 🚨 `right`, NOT the default `left` — the ONE thing that has to
           travel with this frame. hero-69 wore its lockup on the left of an
           arch, hero-81 wears it on a plinth at the far right, and the 58%
           art box crops from whichever edge `objectPosition` does not
           anchor. Simulated at 1440x800 before shipping: at `left` the box
           drops the rightmost 266px of the scaled frame and cuts the JAMIN
           BAZAAR mark in half; at `right` the lockup and the JAMIN GRAND
           plaque are whole and the fade eats empty road instead. Full note
           on the id in PageHero's width register. */
        artPosition="right"
        /* 🚨 `paper`, NOT `cinematic` (owner report 2026-08-18): the dark copy
           plate was covering the JAMIN BAZAAR lockup baked into the LEFT of
           hero-69's arch — and the reasoning survives the 2026-08-19 swap
           unchanged, because hero-81 carries a lockup too and `paper` is
           still the tone that overlays nothing.

           The original finding, kept because it is why the tone is what it
           is: on desktop the geometry has NO fix — measured
           at 1440x800: the gap between the hero's top edge and the plate's
           top is 73px, the lockup is 84px tall at the width-bound scale, and
           the frame is width-bound so horizontal steering has zero travel.
           Vertical steering, taller boxes and source trims were all computed
           and each fails at some viewport height. `paper` dissolves the
           problem by construction: the copy sits on the page's own sand and
           NOTHING overlays the render. The lockup lands at 23–38% of the art
           box — past `hero-fade`'s 22% knee, fully solid. This is the
           hero-64 precedent from /projects/future (paper keeps a lockup whole
           without a trim). Below `xl` the band-then-copy structure is
           unchanged, which is the mobile composition the report says to keep.
           The cinematic sweep notes that lived here (0.34 photograph history,
           0.58 for the Grand render) travel back with `tone="cinematic"` —
           recover them from git if a photograph returns via `photo`. */
        tone="paper"
        /* 🚨 THE SHORT DISSOLVE (report 12, 2026-08-21: "the hero currently
           has a strong light/white overlay effect on the left side… remove or
           significantly reduce the current light/white fade"). hero-81's
           avenue starts at its own left edge, so `hero-fade`'s 22% ramp was
           washing out the composition rather than the empty ground it was
           written for. 8% instead — see `hero-fade-soft`. The tone stays
           `paper`: it is what keeps the copy off the JAMIN BAZAAR lockup, and
           the note below records why no cinematic geometry can. */
        softFade
        /* Report 11's left-aligned labels, extended here — the projects index
           carries the same eyebrow register as its four stage pages. */
        eyebrowAlign="start"
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
             taxonomy addition) fall back to the champagne.

             ⚠️ THE WHOLE BAND WEARS IT NOW (owner 2026-08-19: "I don't see any
             hue changes… can we have different hues for the blocks"). The
             stone was real but it was spending itself on a 3px bar and a link,
             which is a key you have to go looking for. `rj-pane` puts it
             on the GROUND, so Ongoing, Future and Completed are three visibly
             different blocks at a glance. Nothing about the mapping changed —
             same stones, same fallback, just spent where it can be seen. */
          const stone = STAGE_STONE[g.phase as keyof typeof STAGE_STONE];
          return (
          <section key={g.phase} className="mt-phi6 first:mt-phi5">
            <div
              className="rj-pane p-phi3 sm:p-phi4"
              /* ⚠️ `rj-pane`, NOT the bespoke `rj-stage-band` it replaced — and
                 the hue is the stage's INK, not its fill.

                 This page is the one route whose blocks are not all one colour:
                 the three stages ARE the subject, so each band takes its own
                 stone rather than the route's. Folding them into the shared
                 pane is what lets them go from the 13% they shipped at to the
                 40% everything else wears — the ceiling was never the tint, it
                 was `--color-ink-muted`, and the pane re-scopes it.

                 ⚠️ THE INK, NOT THE FILL, because the pane's cap bar paints
                 `--rj-hue` at full strength. Completed's fill is plat-500 and
                 measures 2.70:1 against its own band — a smudge where a bar
                 should be. Its ink (plat-800) reads. Emerald and sapphire are
                 their own ink, so only Completed actually moves. */
              style={
                { "--rj-hue": stone?.ink ?? "var(--color-champagne-700)" } as React.CSSProperties
              }
            >
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
            {/* The cards stay on `bg-canvas`, which is now LIGHTER than the
                band they sit in — so they lift off it instead of dissolving
                into the page as they did on a flat sand ground. That is the
                second half of what the tint buys and the reason the tint is on
                the band rather than on the cards. */}
            <div className="mt-phi4 grid gap-phi3 sm:grid-cols-2 lg:grid-cols-3">
              {g.items.map((p, i) => (
                <PropertyCard key={p.id} p={p} priority={i === 0 && g.phase === PHASE_ORDER[0]} />
              ))}
            </div>
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
