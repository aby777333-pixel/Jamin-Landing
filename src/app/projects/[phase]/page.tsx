import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyCard } from "@/components/PropertyCard";
import { ProspectusBand } from "@/components/ProspectusBand";
import { prospectusFor } from "@/lib/prospectus";
import { PageHero, type HeroArt } from "@/components/PageHero";
import { ButtonLink, Container, EmptyState, Pane } from "@/components/ui";
import { paneHue } from "@/lib/stones";
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
  /* Announced-but-not-catalogued developments for THIS stage. Derived once and
     shared by the header count, the empty-state guard and the band, so the
     three cannot disagree about what belongs on the page. */
  const planned = prospectusFor(phase);
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
    /* ⚠️ WAS hero-65 (JAMIN MONARCH; owner 2026-08-20: "swap the hero image
       with the attached"). hero-83 is the JAMIN GEMSTONE daylight gate —
       lockup plaque on the RIGHT pier, clear of the left copy plate. Swept
       at this geometry: p95 0.548 vs audited hero-38's 0.604 → darker, holds
       the same 0.52 hero-65 held, so the alpha below did not move. The
       `50% 14%` anchor was re-checked against the new frame, not carried:
       at the worst 500px box the visible window is 5.3%–67% of the frame,
       and the beam (~15–30%) and plaque (~45–62%) both stay inside. */
    ongoing: 83,
    /* ⚠️ WAS hero-11 (owner, 2026-08-19 night: "swap the hero image of the
       upcoming project"). hero-82 is the Trichy's Tulip entrance arch —
       the one development actually in this phase — so the page now opens
       on the thing it is about rather than on a stock sand render. */
    current: 82,
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
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars -- kept
     deliberately unreferenced (see the note below): it is the record of why a
     horizontal anchor was ever needed, the `photo` precedent. Delete it the
     day a hero wants one again. */
  const ART_POSITION_BY_PHASE: Record<string, string> = {
    ongoing: "right",
    future: "right",
    completed: "right",
  };

  /**
   * 🚨 THE VERTICAL ANCHOR IS PER PHASE NOW (report 8, 2026-08-19: "the hero
   * image is incorrectly cropped… display the complete hero composition
   * without cutting important architectural elements", priority High).
   *
   * It used to be one shared `"50% 30%"` for both ongoing and future, and on
   * hero-65 that is a hair from disaster. Measured at 1440x900: the art box is
   * 1602x605, the frame scales to 1602x901, and 30% puts the visible window at
   * 9.9%-77% of the frame. The gate's arch begins at 10.6% — inside by 0.7%.
   *
   * That margin is not a margin, it is luck, and it runs out as soon as the
   * window is shorter: at a 500px box the same 30% moves the window to
   * 13.3%-68.8% and the top of the arch is gone. A gate photographed head-on
   * with its beam near the top edge cannot be anchored at a third of the way
   * down.
   *
   * 14% holds the arch at every height this hero renders at — at the 605px box
   * the window becomes 4.9%-72%, at 500px it is 6.7%-62%, and the board
   * (16%-35% of the frame) is comfortably inside both.
   *
   * ⚠️ `future` KEEPS 30% deliberately. It carries hero-64, a different
   * composition, and this number was solved against hero-65's arch. Re-measure
   * before assuming one value serves both.
   */
  /**
   * 🚨 TWO PHASES TOOK A HORIZONTAL ANCHOR (report 12, 2026-08-21) — the first
   * time since hero-31/33 that one has been needed, and `ART_POSITION_BY_PHASE`
   * above is finally cashed in as a value rather than kept as a record.
   *
   * · `current` (hero-82): "keep the Jamin Bazaar/project branding visible on
   *   the right side of the hero image." Measured on the built page at
   *   1440x900: the frame is height-bound in a 1602x857 box with 115px of
   *   horizontal travel, and at 50% the JAMIN BAZAAR pier lands at screen
   *   1261–1482 against a 1430 viewport — 52px of it off the edge. Anchoring
   *   right spends the whole travel and brings it to 1203–1424, inside by 6px.
   *
   * · `completed` (hero-40): "the Jamin Bazaar branding on the right side is
   *   also partially cut… do not crop important project content just to fit
   *   the hero." Same measurement: 408px of travel, the wall at 1155–1595 at
   *   50% — 165px off the edge. Right lands it at 951–1391, inside by 39px.
   *   ⚠️ The report also calls this frame "cropped too aggressively at the
   *   leftside", and a right anchor spends MORE of the left, not less. Its own
   *   Key Requirement settles it: "adjust the image positioning so the complete
   *   relevant composition — Jamin Bazaar branding — is visible." The left of
   *   hero-40 is street and pavement; the right is the only mark on the frame.
   */
  const ART_VERTICAL_BY_PHASE: Record<string, string> = {
    ongoing: "50% 14%",
    /* ⚠️ `current` IS EXPLICIT, not left to the `50% 30%` fallback, because
       the warning above applies to it exactly: hero-82 is a gate photographed
       head-on with its beam near the top, the same shape that made 30%
       dangerous on hero-65. It is a 2:1 frame though, WIDER than the band at
       most sizes, so the usual failure is a horizontal crop and the full
       height survives. Measured on the built page: the beam carrying
       TRICHY'S TULIP sits at 22-37% of the frame and the JAMIN BAZAAR board
       at 40-56%, and both stay inside the visible window at every size this
       hero renders at. 30% is right here for the same reason 14% was right
       there — it was measured, not inherited. */
    current: "100% 30%",
    future: "50% 30%",
    completed: "100% 50%",
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      {/* 🚨 `cinematic` FOR ALL THREE BUILT STAGES (owner report 2026-08-18:
          "use the complete image across the entire hero… remove the large
          white/grid background effect… only a subtle transparent overlay
          behind the text"). This retires the paper split — and with it the
          whole trim/anchor apparatus above, which existed to keep boards
          clear of `hero-fade`; full-bleed cover has no fade. The sibling
          consistency note that once kept these `paper` now argues the same
          way for `cinematic`: all three stages flip together.

          ⚠️ The sheer plate (0.52/0.58, swept comparatively vs audited
          hero-38 at this geometry: 65 p95 0.489 → 0.52 · 64 p95 0.631 →
          0.58 · 40 p95 0.863 → 0.58) IS the report's "subtle transparent
          overlay", and `sheerEdge` + the 38rem cap fade its right edge where
          the arch lockups (top-centre on 64/65) pass behind it — the sign
          reads THROUGH the dissolving plate instead of dying under an
          opaque one. `50% 30%` keeps the arch band in shot on 64/65 (their
          lockups sit high; a centre crop clips 64's). hero-40's wall is far
          right and never meets the plate.

          `current` (hero-11, a white-ground render) stays `paper` — the
          report names only these three, and a near-white frame full-bleed
          would need the heavy scrim the paper tone exists to avoid. */}
      <PageHero
        art={ART_BY_PHASE[phase] ?? 5}
        /* ⚠️ `current` USED TO BE THE ONE `paper` HERO ON THIS ROUTE, and
           that exception belonged to hero-11, not to the phase. hero-11 was
           a pale sand render that a cinematic scrim turned to mud; hero-82
           is a lit gate render like Ongoing's, so it takes Ongoing's
           treatment. The condition goes with the picture it was written
           for — leaving it would wash the new frame out, which is exactly
           what the Upcoming page looked like before the swap. */
        tone="cinematic"
        /* 🚨 FULL HEIGHT (owner, 2026-08-19 evening: "increase the height of the
           hero image to full"). `PageHero` already carries the three sizes;
           `full` is `xl:min-h-[clamp(30rem,85vh,52rem)]` against the default's
           `clamp(20rem,48vh,30rem)`, so the gate gets most of the first screen
           instead of a third of it.

           ⚠️ `current` KEEPS `standard`. That phase is the one `paper` hero on
           this route — its art sits on the page's own ground rather than
           behind the copy — and 85vh of a paper band is a screen of empty sand
           with a picture at the bottom. The instruction was about the
           cinematic gate.

           ⚠️ This does NOT re-open the crop this file solved earlier today.
           `50% 14%` was measured to hold the arch at box heights from 500px
           up; a TALLER box discards less of the frame, not more, so the arch
           only becomes safer. */
        /* Full, like every other phase now. The `standard` exception was the
           other half of the hero-11 accommodation retired above. */
        size="full"
        /* ⚠️ THE LAST THREE PIECES OF THE hero-11 ACCOMMODATION, retired with
           the other two. A pale sand render needed a left anchor, a 0.26 scrim
           and no edge or it turned to mud; hero-82 is a lit gate frame like
           Ongoing's hero-65, so Upcoming now reads exactly like Ongoing —
           `50% 30%` holds the arch lettering and the JAMIN BAZAAR board, both
           of which sit above the midline.
           ⚠️ `ART_POSITION_BY_PHASE` is now UNREFERENCED. It was already
           unreachable for three of its four keys — only `current` ever read
           it, and `current` had no entry, so it was resolving to the `left`
           default. Left in place with its hero-31/33/40 reasoning intact,
           because that reasoning is the record of why a horizontal anchor
           was ever needed; delete it the day a hero wants one again and the
           argument can be re-read. */
        artPosition={ART_VERTICAL_BY_PHASE[phase] ?? "50% 30%"}
        /* 🚨 THE COPY SITS AT THE FOOT OF THE FRAME (report 12, 2026-08-21,
           on Upcoming and Future: "the large left-side dark content panel is
           covering the Jamin Bazaar branding/signage within the hero image…
           the important signage in the background should not sit underneath
           the dark content panel", with "keep the hero text/content on the
           left" stated in the same breath).

           Every gate in this set carries its lettering on a beam in the upper
           third, and the centred plate's top edge lands exactly there —
           measured at 1440x900: hero-64's arch board runs to screen y 290
           against a plate starting at 255, and hero-82's TRICHY'S TULIP
           lettering spans 197–325 against a plate starting at 217. Neither is
           reachable by a horizontal move (the plate covers x 115–723 and both
           marks begin inside that band), and narrowing the plate does not
           help for the same reason. Dropping the copy to the foot clears both
           outright — plate top goes to ~453 and ~377 — and keeps the text
           left, which is the half of the instruction a re-crop would have
           broken.

           ⚠️ ALL FOUR STAGES, not the two named. These pages are read as one
           set and the file's own tone note is explicit that they flip
           together; `ongoing` and `completed` carry no mark under the plate,
           so the move costs them nothing and buys the register consistency. */
        copyAlign="end"
        sheer
        sheerAlpha={phase === "ongoing" || phase === "current" ? 0.52 : 0.58}
        sheerEdge
        plateXl="38rem"
        /* Report 11 (2026-08-21): "The labels is aligned too far to the
           right… Move labels to the left and align it with the heading" —
           named for all four stage pages. */
        eyebrowAlign="start"
        eyebrow={`${meta.label} projects`}
        title={`${meta.label} Jamin developments`}
        lead={meta.blurb}
        /* ⚠️ THE PLANNED COUNT IS A SEPARATE CLAUSE, NOT ADDED IN (2026-08-22).
           `/projects/future` now carries the prospectus band as well as the
           catalogue, and this line counts the catalogue — things with a plot
           schedule someone can act on. Folding three announced developments
           into the same figure would make "4 developments · 1 plot available"
           true of nothing: three of the four have no plots to be available.
           Stated separately, both halves stay checkable. */
        meta={
          <>
            {items.length} development{items.length === 1 ? "" : "s"}
            {plots > 0 ? ` · ${plots} plot${plots === 1 ? "" : "s"} available` : ""}
            {planned.length > 0 ? ` · ${planned.length} more in planning` : ""}
          </>
        }
      />
      <Container className="py-phi5" hue={paneHue("/projects")}>
      {/* The route's pane. Hue stated once above; see lib/stones.ts. */}
      <Pane className="p-phi3 sm:p-phi5">
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
        {/* ⚠️ THE EMPTY STATE HAS TO KNOW ABOUT THE BAND. Its copy is "This
            stage is empty at the moment", and /projects/future is the one
            stage where that can be false while `items` is still empty — the
            catalogue entry could be sold out or withdrawn tomorrow and three
            announced developments would remain below it. Guarding on both is
            what stops the page contradicting itself in a state nobody is
            looking at today. */}
        {items.length === 0 && planned.length === 0 ? (
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
            <div className="grid gap-phi3">
              {items.map((p, i) => (
                <PropertyCard key={p.id} p={p} wide priority={i < 3} />
              ))}
            </div>
          </>
        )}
        {/* Announced-but-not-catalogued developments. `/projects/future` only:
            every other stage describes inventory that exists, and a band of
            things with no plot schedule would contradict those pages rather
            than extend them. See lib/prospectus.ts for why these are a file
            and not Supabase rows. */}
        <ProspectusBand phase={phase} />
      </div>
      </Pane>
      </Container>
      {/* The desk, on a page that otherwise ends without one. Links for
          someone who wants to act now, and a three-field form for someone who
          would rather be called — the form is the only half that becomes a
          record, because a tap on a `tel:` link cannot be counted. */}
      <CallbackBand />
    </>
  );
}
