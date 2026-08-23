import type { Metadata } from "next";
import { PageHero } from "@/components/PageHero";
import { Container, Pane, SectionLabel } from "@/components/ui";
import { paneHue } from "@/lib/stones";
import { GiltSeam } from "@/components/GiltSeam";
import { Reveal } from "@/components/Reveal";
import { CallbackBand } from "@/components/CallbackBand";
import { CareerTabs } from "@/components/careers/CareerTabs";

export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Careers at Jamin Bazaar — We're Developing Careers",
  description:
    "Promoters, brokers, business development, customer relationships, sales, site teams, security, marketing, design and technology. Eleven ways to build a career with Jamin Bazaar across Tamil Nadu.",
  alternates: { canonical: "/careers" },
};

/**
 * CAREERS AT JAMIN BAZAAR (owner 2026-08-23) — his copy, whole, plus the hero
 * he sent with it and one instruction: "make it glassy tabs, colorize…superb".
 *
 * ── WHAT THIS PAGE MAY NOT DO ──────────────────────────────────────────────
 * 🚨 IT DESCRIBES ROLE FAMILIES, NOT VACANCIES. There is no headcount, no
 * salary, no location and no "we are hiring N people" anywhere, because none of
 * that is knowable from a page and all of it would be a commitment the moment
 * it was published. His own closing line is the licence for the whole page and
 * it is reproduced at the foot verbatim: "Roles, compensation, commissions,
 * incentives and availability vary by position and location." Every capability
 * sentence above it is hedged the way he hedged it — "may include",
 * "opportunities may include", "responsibilities may include". Do not tighten
 * those verbs into the indicative; it turns an invitation into an offer.
 *
 * ⚠️ "Many commercial roles offer performance-linked earning opportunities in
 * addition to applicable fixed compensation" is HIS sentence and is the only
 * thing this page says about money. It does not become "earn up to", a number,
 * or a commission percentage.
 *
 * ── WHERE AN APPLICATION GOES ──────────────────────────────────────────────
 * `website_career_apply` → `career_applications` (migration 0093), NOT into
 * `leads`. The migration header carries the full argument; the short version is
 * that `leads` is the sales pipeline with promoter attribution, dashboard
 * counts and a commission trail attached, and a jobseeker belongs in none of
 * it. The admin console reads the new table on its own Careers tab.
 *
 * ── WHY IT IS NOT IN THE DESKTOP NAV ───────────────────────────────────────
 * Same reason as /security: HeaderShell's own note records the primary row
 * overflowing 1280 by ~47px and having its gaps cut to fit the eight tabs
 * already there. Footer, phone menu and sitemap instead.
 */

/** His five reasons, as data so the row and the heading cannot drift apart. */
const WHY: { title: string; body: string }[] = [
  {
    title: "Build something real",
    body: "The work eventually becomes something you can point to. A road. A project. A neighbourhood. A customer holding a document for a piece of land they now own.",
  },
  {
    title: "Earn through performance",
    body: "Many commercial roles offer performance-linked earning opportunities in addition to applicable fixed compensation.",
  },
  {
    title: "Grow beyond your job title",
    body: "Good people shouldn't remain trapped inside job descriptions. As Jamin expands, responsibilities and opportunities can expand with it.",
  },
  {
    title: "Technology + real estate",
    body: "Work where property meets digital discovery, mobile technology, smart customer experiences and a growing promoter network.",
  },
  {
    title: "Local knowledge matters here",
    body: "Knowing a town, its roads, its people and how business actually gets done isn't a footnote. It's an advantage.",
  },
];

/** The closing character list. His lines, one per row. */
const CHARACTER: string[] = [
  "We like people who answer the phone.",
  "People who show up.",
  "People who call back when they said they would.",
  "People who notice problems and do something about them.",
  "People who can chase a target without losing their integrity.",
];

export default function CareersPage() {
  return (
    <>
      <PageHero
        /* ⚠️ `art` IS REQUIRED AND REACHES NOTHING HERE — `photo` overrides the
           render's src and `mobileBandRatio` overrides the only other thing the
           register is consulted for. 71 because it is a frame that exists; a
           prop pointing at a real file is easier to reason about than one
           pointing at a hole. Same note as /security. */
        art={71}
        photo={{
          src: "/careers-art/hero-red-tie-1983.webp",
          alt: "Illustration: a column of identical grey robots marching with briefcases, and one man in a red suit and tie walking the other way, out of the shadow into the light.",
        }}
        mobileBandRatio="1983/793"
        tone="cinematic"
        size="full"
        /* 🚨 SWEPT, NOT COPIED FROM /security. The two heroes are the same shape
           and nothing else: this frame's left half — where the copy plate sits
           — is a flat dark concrete wall, the darkest ground any hero on this
           site puts under its words, while the guard hero had two lit sconces
           there. `veil` plus a wall that dark leaves the plate almost nothing
           to do, so it is thinner here than anywhere: 0.10 against
           /security's 0.14 and `gilt`'s audited 0.52.

           ⚠️ THE SUBJECT IS ON THE RIGHT AND MUST STAY CLEAR. The man in red is
           the whole point of the picture and the plate is left-anchored, so
           they do not collide at any width — but a future crop or an
           `artPosition` that walks him leftward would put the plate over him.
           Re-check the frame before touching either. */
        sheer
        sheerAlpha={0.1}
        eyebrow="Careers at Jamin Bazaar"
        title={
          <>
            We&rsquo;re not just developing land.
            <br />
            We&rsquo;re developing careers.
          </>
        }
        lead="Some people see an empty piece of land. We see the road that will run through it, the trees that will grow beside it, the homes that will rise around it — and the families that will eventually call it theirs."
        meta="Illustration. The dress code is, in practice, negotiable."
      />

      {/* ── The invitation ─────────────────────────────────────────────── */}
      <Container className="py-phi5" hue={paneHue("/careers")}>
        <Pane as="section" className="p-phi3 sm:p-phi5">
          <div className="max-w-3xl">
            <SectionLabel>Come grow with Jamin</SectionLabel>
            <h2 className="mt-phi3 text-3xl text-ink">
              Behind every Jamin Bazaar project are people who make it happen.
            </h2>
            <p className="mt-phi3 text-lg leading-relaxed text-ink-soft">
              Promoters. Brokers. Salespeople. Relationship builders. Site teams. Security
              professionals. Marketing minds. There could be a place here for you.
            </p>
            <p className="mt-phi3 text-lg leading-relaxed text-ink-soft">
              Whether you have years of real-estate experience or simply the hunger to build a
              career, we&rsquo;re interested in people who can{" "}
              <strong className="font-semibold text-ink">
                talk to people, earn trust, take responsibility and get things done.
              </strong>
            </p>
          </div>
        </Pane>
      </Container>

      {/* ── The eleven ─────────────────────────────────────────────────────
          `bg-bone-paper` with the blueprint grid, as /security uses for its own
          tab band. The tabs are frosted, so they need a ground with something
          BEHIND them worth seeing through — on the flat page field the blur
          would have nothing to do and the glass would read as a flat wash. */}
      {/* ⚠️ `id` HERE, NOT ON THE INNER DIV — the closing CTA links to
          `#opportunities` and a fragment that resolves to a wrapper inside the
          band would scroll the heading under the sticky header. */}
      <section id="opportunities" className="scroll-mt-[var(--header-h)] border-y border-line bg-bone-paper">
        <div className="relative overflow-hidden">
          <div className="blueprint pointer-events-none absolute inset-0" aria-hidden="true" />
          <Container className="relative py-phi6">
            <div className="max-w-3xl">
              <SectionLabel>Open opportunities</SectionLabel>
              <h2 className="mt-phi3 text-3xl text-ink">Eleven ways in.</h2>
              <p className="mt-phi3 text-lg leading-relaxed text-ink-soft">
                Pick the one that sounds like you. Every tab carries what the work is and a form
                that reaches the Jamin desk directly.
              </p>
            </div>
            <Reveal className="mt-phi5">
              <CareerTabs />
            </Reveal>
          </Container>
        </div>
      </section>

      <GiltSeam />

      {/* ── Why Jamin ──────────────────────────────────────────────────── */}
      <Container className="py-phi6" hue={paneHue("/careers")}>
        <div className="max-w-3xl">
          <SectionLabel>Why Jamin</SectionLabel>
          <h2 className="mt-phi3 text-3xl text-ink">
            Because there&rsquo;s room to grow. Literally.
          </h2>
        </div>
        <div className="mt-phi5 grid gap-phi3 md:grid-cols-2 lg:grid-cols-3">
          {WHY.map((w) => (
            <Pane key={w.title} className="p-phi3">
              <h3 className="text-xl text-ink">{w.title}</h3>
              <p className="mt-phi2 text-base leading-relaxed text-ink-soft">{w.body}</p>
            </Pane>
          ))}
        </div>
      </Container>

      {/* ── Character ──────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-canvas-sunken">
        <Container className="py-phi6">
          <Reveal className="mx-auto max-w-3xl">
            <div className="mx-auto h-px w-16 rule-gold" aria-hidden="true" />
            <h2 className="mt-phi4 text-balance text-center text-3xl text-ink">
              Work with people who move.
            </h2>
            <ul className="mx-auto mt-phi5 max-w-xl space-y-phi2">
              {CHARACTER.map((line) => (
                <li key={line} className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rotate-45 rounded-[1px] bg-cta"
                  />
                  <span className="text-lg leading-relaxed text-ink-soft">{line}</span>
                </li>
              ))}
            </ul>
            <p className="mt-phi5 text-center text-2xl text-ink">
              Talent gets our attention. Character keeps it.
            </p>
          </Reveal>
        </Container>
      </section>

      {/* ── The close ──────────────────────────────────────────────────── */}
      <section className="bg-onyx-900">
        <Container className="py-phi6">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-micro font-semibold uppercase tracking-brand text-champagne-300">
              Your next move could start here
            </p>
            <p className="mt-phi3 text-balance text-3xl leading-tight text-white">
              Promote. Sell. Build. Protect. Create. Lead.
            </p>
            <p className="mt-phi3 text-lg leading-relaxed text-bone-soft">
              Whatever your strength, there may be a place for it at Jamin Bazaar.
            </p>

            {/* ⚠️ ONE CONTROL, AND IT POINTS BACK UP THIS PAGE. His copy ends on
                four buttons — View open positions / Become a promoter / Join as
                a broker / Send your CV — and three of the four would have to be
                invented as destinations: there is no positions board, and no CV
                upload exists anywhere on this site or in the app. Rather than
                ship three dead controls (the standing rule this site's header
                already records), all four collapse into the one that is real:
                the tab strip above, where every role family has its own live
                form. */}
            <p className="mt-phi5">
              <a
                href="#opportunities"
                className="inline-flex items-center justify-center rounded-full bg-cta px-6 py-3.5 text-tiny font-semibold uppercase tracking-[0.12em] text-white shadow-lift transition-all duration-300 [transition-timing-function:var(--ease-silk)] hover:-translate-y-0.5 hover:shadow-raise"
              >
                Ready? Let&rsquo;s talk.
              </a>
            </p>

            {/* 🚨 HIS SENTENCE, AND THE PAGE'S LOAD-BEARING ONE. Everything
                above is written "may" and "can" because of this line. It does
                not get shortened, moved into a tooltip or dropped a size. */}
            <p className="mx-auto mt-phi5 max-w-2xl border-t border-champagne-500/25 pt-phi3 text-tiny leading-relaxed text-bone-soft">
              Roles, compensation, commissions, incentives and availability vary by position and
              location.
            </p>
          </div>
        </Container>
      </section>

      <CallbackBand context="Careers at Jamin Bazaar" url="/careers" />
    </>
  );
}
