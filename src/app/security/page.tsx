import type { Metadata } from "next";
import Image from "next/image";
import { PageHero } from "@/components/PageHero";
import { Container, Pane, SectionLabel } from "@/components/ui";
import { paneHue } from "@/lib/stones";
import { GiltSeam } from "@/components/GiltSeam";
import { Reveal } from "@/components/Reveal";
import { CallbackBand } from "@/components/CallbackBand";
import { SecurityTabs } from "@/components/security/SecurityTabs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Jamin Bazaar Security — Life Inside. Worry Outside.",
  description:
    "How security is designed at Jamin Bazaar communities: 360° surveillance, smart gates, controlled visitor management, trained personnel and instant alerts — a protective ecosystem of people, technology and communication.",
  alternates: { canonical: "/security" },
};

/**
 * JAMIN BAZAAR SECURITY (owner 2026-08-23) — the copy is his, sent whole with
 * four images and one instruction: "make it amazing funny… and secure, and
 * generate an amazing feeling of safety and security and peace of mind."
 *
 * ── HOW THOSE TWO THINGS SHARE A PAGE ──────────────────────────────────────
 * The jokes are in the PICTURES and their captions. Not one of them is in the
 * specification. That split is deliberate and it is the only version that
 * works: this is a trust page, read by a parent deciding whether their child
 * can run out of the gate, and a witty sentence about intrusion detection
 * would undo the whole argument. So the eleven layers are stated flat, in the
 * owner's own hedged wording, and the warmth comes from a guard standing on a
 * ceiling and an officer with a camera for a head — both of which are funny
 * precisely because nobody could mistake them for evidence. See
 * public/security-art/README.md, which turns that into a rule for whoever swaps a
 * frame next.
 *
 * ── WHAT THIS PAGE MAY NOT DO ──────────────────────────────────────────────
 * 🚨 IT DESCRIBES A SPECIFICATION, NOT AN INSTALLATION. Every capability here
 * is written "can", "where enabled", "where supported" — the owner wrote it
 * that way and the closing note says why: these features are project-specific
 * and subject to consent and availability. Not one Jamin development is named
 * on this page and none may be, because that would turn a general
 * specification into a claim about a particular gate. The same standing rule
 * the FAQ carries: a sentence invented here becomes a promise nobody made.
 *
 * ── WHY IT IS NOT IN THE DESKTOP NAV ───────────────────────────────────────
 * The primary row is full. HeaderShell's own note records that the nav
 * overflowed the viewport by ~47px at 1280 and had to have its gaps cut to
 * `gap-4` to fit the tabs already there; a ninth would put the horizontal
 * scrollbar straight back. It is in the footer, in the phone menu and in the
 * sitemap instead. If it is ever wanted in the top row, something else has to
 * come out of it — that is a decision about the menu, not about this page.
 */

/** The three halves of the owner's own definition. Kept as data so the row and
 *  the sentence above it cannot drift apart. */
const ECOSYSTEM: { label: string; body: string }[] = [
  {
    label: "Trained people",
    body: "Teams who manage the entrances, walk the common areas and are there to be spoken to.",
  },
  {
    label: "Intelligent technology",
    body: "Cameras, gates, sensors and recognition working quietly underneath, around the clock.",
  },
  {
    label: "Instant communication",
    body: "What happens at the gate reaching the resident it concerns, on the phone already in their hand.",
  },
];

export default function SecurityPage() {
  return (
    <>
      <PageHero
        /* ⚠️ `art` IS REQUIRED AND IS NOT USED HERE. `photo` overrides the
           render's src, and `mobileBandRatio` overrides the only other thing
           the register is consulted for — so this number reaches nothing. It
           is 71 rather than an arbitrary value only because that is a frame
           that exists, and a prop pointing at a real file is easier to reason
           about than one pointing at a hole. */
        art={71}
        photo={{
          src: "/security-art/hero-guard-ceiling-v2-1717.webp",
          alt: "Illustration: a security guard in Jamin red, braced across the ceiling of a hallway between two framed paintings, watching the corridor below.",
        }}
        /* The artwork's own 2.5:1, so the phone band neither crops the guard
           nor letterboxes him. ⚠️ In the CINEMATIC tone this changes the BOX
           only — the image stays `object-contain` below `xl`, and the
           `object-cover` that `mobileBandRatio` buys on the paper tone is not
           available here. Passing anything other than the true ratio adds
           bars; it does not crop. */
        /* ⚠️ THE NEW FRAME'S OWN RATIO, and it is NOT the old one. `v2` is
           1717x916 (1.87:1) where the frame it replaced was 1983x793 (2.5:1) —
           a tighter, taller crop with the guard bigger in it. Leaving the old
           `1983/793` here would have letterboxed the phone band by ~25% of its
           height with nothing in the bars.

           🚨 THE RATIO IS ALSO WHY THE DESKTOP HERO FILLS PROPERLY NOW (owner
           2026-08-23: "make it full height and width"). At `size="full"` the
           section was ~765px tall and the picture is `object-cover`, so a 2.5:1
           frame had to scale until its HEIGHT covered — throwing away 20% of
           the frame off each side, guard included. At 1.87:1 far less is
           discarded and the man reaches the full height of the band. Width was
           never the problem: the cinematic tone has been edge-to-edge since it
           shipped.

           ⚠️ THE SECTION IS TALLER AGAIN NOW (`size="screen"` below), so the
           crop is tighter still — a taller box means cover discards MORE off
           the sides. The guard survives it because he is centred; a frame with
           its subject near an edge would not, and would need `artPosition`. */
        mobileBandRatio="1717/916"
        tone="cinematic"
        /* Owner 2026-08-23: "make the image full height". `full` is
           `clamp(30rem, 85vh, 52rem)` from `xl` — 765px in a 1440x900 window,
           against `standard`'s 432px. Below `xl` nothing changes: the hero is
           a band at the artwork's own ratio with the copy under it, so a
           taller desktop section costs a phone nothing. */
        /* 🚨 `screen`, NOT `full` — owner 2026-08-23, "increase the height of
           the hero to the max". The viewport minus the sticky header, so the
           picture ends exactly at the fold. `full` was left alone on purpose:
           five other pages pass it. See the note on the prop. */
        size="screen"
        /* 🚨 `sheerAlpha={0.14}` — RE-SWEPT AGAINST THE v2 CROP, not carried
           over. The two sconces still sit inside the plate's footprint and the
           tighter crop brings them slightly CLOSER to the copy, so the numbers
           below were re-measured on the new frame rather than assumed. Owner
           2026-08-23, "make the tab bg max
           see-through", AND THE FIRST SWEEP OF THIS FRAME SAID NO.
           That sweep measured the PHOTOGRAPH (p95 luminance 0.719 under the
           copy — two wall sconces sit exactly where the plate goes) and
           concluded a sheer plate would put white type on lamplight. It was
           measuring the wrong stack. `veil` is drawn between the picture and
           the plate at `xl`, and it is not subtle where this copy sits: its
           two gradients reach ~0.69 of near-black in the bottom-left corner.
           Modelling the real composite — cover-crop, both veil gradients, then
           the plate — the same region reads p95 0.113 BEFORE the plate does
           anything at all.

           So the alpha is set by the brightest 1% — the LEFT SCONCE, whose
           bulb sits inside the plate's footprint — and not by the 95th. Swept
           against the plate's real measured box rather than an estimate of it
           (736x462 at 249,219 in a 1697x716 section, read off the live DOM),
           at three window widths:

           Re-swept a THIRD time when the hero went to `size="screen"`, because
           a taller section changes the cover-crop and therefore which pixels
           end up under the copy. Section height is the window minus the 80px
           header, so it varies by machine — all four swept at a=0.14:

               window        section    p95        p99
               1697x898      1697x818   10.72:1    7.23:1
               1920x1080     1920x1000  11.85:1    8.58:1
               1440x900      1440x820    9.34:1    5.28:1
               1366x768      1366x688    8.05:1    4.85:1   <- tightest

           ⚠️ THE SHORT LAPTOP IS NOW THE CASE TO CHECK, not the widest and not
           1440. Growing the section pulls more dark ceiling in behind the copy
           on a tall window, so the big screens got BETTER; a 768px-high window
           has the least room and keeps the most lit wall. It still clears at
           4.85, so the alpha does not move.

           🚨 RE-SWEEP ON ANY SIZE CHANGE, NOT JUST ON AN IMAGE CHANGE. Nothing
           about the picture changed between the second sweep and this one —
           only the height of the box it is drawn into — and the tightest width
           moved from 1440 to 1366 as a result. It is barely a quarter of
           `gilt`'s audited 0.52, and the bulb core itself is covered by
           `rj-sheer-copy`'s four-layer halo, which WCAG does not model and
           royal.css counts as free margin.

           ⚠️ 1697 IS THE TIGHTEST OF THE THREE, NOT THE WIDEST-IS-SAFEST YOU
           MIGHT ASSUME. A wider window crops less off the sides, which walks
           MORE of the lit wall in under the plate. Sweep the widest window you
           support, not the narrowest.

           ⚠️ THE FLOOR IS THE VEIL, SO IT MOVES IF THE VEIL MOVES. globals.css
           already records lightening `veil` once by ~35%; do that again and
           this number has to be re-swept, not merely reviewed. Re-run the
           composite sweep — the photograph's own p95 is 0.412 here and will
           happily read as "fine" while the copy is failing.

           `copyAlign="end"` for the composition rather than for legibility:
           the guard is pinned to the TOP of the frame, so copy at the foot
           leaves him whole — and at `full` there is a great deal more frame
           between his boots and the words. */
        sheer
        sheerAlpha={0.14}
        copyAlign="end"
        eyebrow="Jamin Bazaar Security"
        title="Life inside. Worry outside."
        lead="Children running out to play. An evening walk after dinner. Parents sitting in the garden. A family sleeping peacefully while the street outside grows quiet. That is what security should feel like."
        meta="Illustration. Yes, that is our man on the ceiling. No, that is not in the specification."
      />

      {/* ── The definition ─────────────────────────────────────────────── */}
      <Container className="py-phi5" hue={paneHue("/security")}>
        <Pane as="section" className="p-phi3 sm:p-phi5">
          <div className="max-w-3xl">
            <SectionLabel>How it is designed</SectionLabel>
            <h2 className="mt-phi3 text-3xl text-ink">A 360° protective ecosystem.</h2>
            <p className="mt-phi3 text-lg leading-relaxed text-ink-soft">
              At Jamin Bazaar communities, security is designed as a 360° protective ecosystem,
              combining trained people, intelligent technology and instant communication.
            </p>
          </div>

          <dl className="mt-phi5 grid gap-phi3 md:grid-cols-3">
            {ECOSYSTEM.map((e) => (
              <div
                key={e.label}
                className="rounded-card border border-line bg-canvas p-phi3 shadow-lift"
              >
                <dt className="text-tiny font-semibold uppercase tracking-brand text-jamin-gold-ink">
                  {e.label}
                </dt>
                <dd className="mt-phi2 text-base leading-relaxed text-ink-soft">{e.body}</dd>
              </div>
            ))}
          </dl>
        </Pane>
      </Container>

      {/* ── The eleven layers ──────────────────────────────────────────────
          `bg-bone-paper` — the rung the homepage uses for its one raised band.
          The tabs need a ground that is NOT the page field, because each panel
          is a `bg-canvas` card and a canvas card on a canvas ground has no
          edge. */}
      <section className="border-y border-line bg-bone-paper">
        {/* The blueprint grid, as on the homepage's own raised band — a
            drawing-office ground under a section that is, in the end, a
            specification. */}
        <div className="relative overflow-hidden">
          <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
          <Container className="relative py-phi6">
            <div className="max-w-3xl">
              <SectionLabel>Protected. Day &amp; night.</SectionLabel>
              <h2 className="mt-phi3 text-3xl text-ink">Eleven layers, and what each one does.</h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-soft">
                Every layer below is one part of the same system. Open any of them.
              </p>
            </div>
            <Reveal className="mt-phi5">
              <SecurityTabs />
            </Reveal>
          </Container>
        </div>
      </section>

      <GiltSeam />

      {/* ── The restraint ──────────────────────────────────────────────── */}
      <Container className="py-phi6" hue={paneHue("/security")}>
        <div className="grid items-start gap-phi5 lg:grid-cols-[1fr_1fr]">
          <div>
            <SectionLabel>Security that doesn&rsquo;t intrude</SectionLabel>
            <h2 className="mt-phi3 text-3xl text-ink">
              A secure home should never feel like a guarded fortress.
            </h2>
          </div>
          <Pane className="p-phi3 sm:p-phi4">
            <p className="text-lg leading-relaxed text-ink-soft">
              Our approach is to make protection{" "}
              <strong className="font-semibold text-ink">visible when you need it</strong> and{" "}
              <strong className="font-semibold text-ink">almost invisible when you don&rsquo;t</strong>
              , while keeping streets, gardens and community spaces warm and welcoming.
            </p>
            {/* ⚠️ An observation about security systems in general, not a claim
                about this one. It is the page's second joke and it is doing a
                real job: it says out loud that the measure of the section
                above is how little of it you notice. */}
            <p className="mt-phi3 border-t border-line pt-phi3 text-base leading-relaxed text-ink-muted">
              The best thing anyone can say about a security system is that they forgot it was
              there.
            </p>
          </Pane>
        </div>
      </Container>

      {/* ── The payoff ─────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-canvas-sunken">
        <Container className="py-phi6">
          <Reveal className="mx-auto max-w-3xl text-center">
            <div className="mx-auto h-px w-16 rule-gold" aria-hidden="true" />
            <h2 className="mt-phi4 text-balance text-4xl text-ink">
              Let them play. Let them explore. Let them be kids.
            </h2>
            <p className="mt-phi4 text-lg leading-relaxed text-ink-soft">
              While they make memories outside, an intelligent network of people and technology
              quietly looks out for the community.
            </p>
          </Reveal>

          {/* 🚨 THE ONE FRAME ON THIS PAGE THAT COULD BE MISTAKEN FOR EVIDENCE
              (owner 2026-08-23: "add image to the section").

              Everything else in public/security-art/ is safe because it is
              impossible — a guard on a ceiling, an officer with a camera for a
              head. This is a photoreal render of a gate house with the JAMIN
              BAZAAR lockup on the wall AND on the arch, a uniformed guard at a
              live monitor wall, and children playing thirty feet away. It is
              the exact composition a reader would take for a photograph of a
              development they could go and visit, and it sits on the page that
              describes what the cameras do.

              So it follows public/section/README.md's rule rather than this
              folder's: it names itself an illustration in BOTH the alt text
              and a caption, and it is never given a project name, a location
              or a claim. The caption is also the one on this page that is not
              a joke — a wink here would read as winking at the evidence.

              ⚠️ It earns its place because it IS the sentence above it: the
              children are outside, the guard is watching the screens, and
              neither is looking at the other. Do not move it to a section
              whose words it does not illustrate. */}
          <Reveal className="mt-phi5">
            <figure>
              <div className="overflow-hidden rounded-xl border border-jamin-gold/40 shadow-lift">
                <Image
                  src="/security-art/gatehouse-dusk-1774.webp"
                  alt="Illustration: a Jamin Bazaar community at dusk. Children run on a lawn beside a lit entrance arch, while a guard in the gate house watches a bank of camera monitors."
                  width={1774}
                  height={887}
                  /* The container is 1280 with a 40px gutter each side, so
                     1200px is what it actually occupies from `xl`; below that
                     it is the viewport less the gutters. */
                  sizes="(min-width: 1280px) 1200px, 100vw"
                  className="h-auto w-full"
                />
              </div>
              {/* ⚠️ `text-ink-muted`, NOT the `text-ink-faint` every other
                  caption on this page uses, and the difference is the GROUND
                  rather than the words. This band is `bg-canvas-sunken`
                  (#e5d2c2) where the tab cards are `bg-canvas` (#f0e1d6), and
                  ink-faint measures 4.86:1 on the lighter sheet but only
                  4.23:1 on this one — under the bar, at 12.5px. ink-muted
                  clears it. Of all the captions to let fail this was the worst
                  candidate: it is the sentence that stops the picture above it
                  being read as evidence. */}
              <figcaption className="mt-phi3 text-tiny leading-relaxed text-ink-muted">
                Illustration. Not a photograph of a Jamin development, and not a record of any
                installation.
              </figcaption>
            </figure>
          </Reveal>
        </Container>
      </section>

      {/* ── The signature ──────────────────────────────────────────────── */}
      <section className="bg-onyx-900">
        <Container className="py-phi6">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-micro font-semibold uppercase tracking-brand text-champagne-300">
              Jamin Bazaar Security
            </p>
            {/* The one line the owner set apart, and the closest this page
                comes to a promise — which is why it is a promise about
                RESTRAINT. Champagne on onyx at 12.3:1, the pair the Vault tab
                already uses. */}
            <p className="mt-phi3 text-balance text-3xl leading-tight text-white">
              We see what we need to. Nothing we shouldn&rsquo;t.
            </p>

            <figure className="mt-phi5">
              <div className="overflow-hidden rounded-xl border border-champagne-500/30">
                <Image
                  src="/security-art/lockup-officer-1981.webp"
                  alt="Illustration: an officer in a red Jamin Bazaar jacket with a yellow security camera in place of a head, standing beside the Jamin Bazaar lockup."
                  width={1981}
                  height={793}
                  sizes="(min-width: 1280px) 56rem, 100vw"
                  className="h-auto w-full"
                />
              </div>
              <figcaption className="mt-phi3 text-tiny leading-relaxed text-bone-soft">
                Illustration. Our Head of Never Blinking has not yet requested a lunch break.
              </figcaption>
            </figure>

            {/* 🚨 THE PAGE'S LOAD-BEARING SENTENCE, and it is the owner's own.
                Everything above is written "can" and "where enabled" because of
                this line — it is what makes the whole page a specification
                rather than a guarantee about any particular development. It
                does not get shortened, moved into a tooltip or dropped to
                `text-micro`. */}
            <p className="mx-auto mt-phi5 max-w-2xl border-t border-champagne-500/25 pt-phi3 text-tiny leading-relaxed text-bone-soft">
              Security features, including biometric access, are project-specific and subject to
              resident consent, applicable privacy requirements and availability at each
              development.
            </p>
          </div>
        </Container>
      </section>

      <CallbackBand context="Jamin Bazaar Security" url="/security" />
    </>
  );
}
