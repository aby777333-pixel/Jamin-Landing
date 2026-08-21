# Hero imagery

Supplied by the owner on 2026-08-07 (`jaminpropertiesherosectionimages.zip`),
converted to responsive WebP. The originals were 16.6 MB of PNG; this set is
under 1 MB in total.

Serve with a `srcset` of the three widths and an explicit `width`/`height`, so
the hero contributes nothing to CLS.

## Brand imagery only

These are conceptual renders, not photographs of Jamin Bazaar projects — one
shows a high-rise skyline unrelated to Erode, Salem or Tiruppur. Under the
master brief sections 42 and 74 they may be used as abstract hero and brand
backgrounds only. They must **never** be captioned as a Jamin project, used on
a property card, or placed in a project gallery. Anything that claims to show a
Jamin project must use the real photography already in Supabase storage.

## Two families, and why it decides the treatment

The set is not one look. Which `PageHero` tone an image gets is a property of
the artwork, not a matter of taste — get it the wrong way round and either the
type stops being legible or the picture stops being worth showing.

**Photographic (1, 2, 3)** — real tonal range, deep skies, golden hour. These
carry white type across a full bleed, so they get `tone="cinematic"`: the image
fills the section and the `veil` scrim holds the copy at AA.

**Graphic (4–10)** — near-white ground with red architectural line-work, half
wireframe and half finished building. Laid full-bleed these need a heavy scrim,
which flattens the very thing that makes them good, and the near-white ground
gives white type nothing to sit on. They get `tone="paper"`: the words sit on
the page's ivory and `hero-fade` dissolves the image's left edge into it.

## Current assignments

**One image per page — no render appears twice.** Corrected 2026-08-08: hero-09
was on both /journal and /downloads, and hero-10 on both /contact and
/projects/completed, while hero-07 sat unused on a page that is never built.

| id | source | native | widths generated | subject | used on |
|---|---|---|---|---|---|
| hero-01 | jamin img1.png | 1850x850 | 1850, 1280, 768 | villa at sunset, distant skyline | **spare** — was /about until 2026-08-09 |
| hero-19 | ChatGPT Image Aug 9 2026 02_00_34 PM.png | 1672x941 (**no trim**) | 1672, 1280, 768 | lit gated entrance to a plotted layout at sunset, **JAMIN BAZAAR on the arch** | /about (cinematic) |
| hero-02 | jamin im2.png | 1983x793 | 1920, 1280, 768 | family on a terrace over a layout | **spare** — was /properties until 2026-08-09 |
| hero-03 | jamin img3.png | 1720x914 | 1720, 1280, 768 | formed road, plots, first houses | **unassigned — spare** |
| hero-04 | jamin img4.png | 1717x916 | 1717, 1280, 768 | street of houses in mist | /projects/ongoing |
| hero-05 | jamin img5.png | 1823x863 | 1823, 1280, 768 | wireframe resolving into a house | /projects only — left the homepage 2026-08-09 |
| hero-22 | ChatGPT Image Aug 9 2026 07_23_29 PM.png | 1774x887 → **trimmed to 1194x887** | 1194, 1024, 768 | tiled-roof house above paddy, hills behind | homepage, "The place you are from" |
| hero-06 | jamin img 6.png | 1672x941 | 1672, 1280, 768 | dart in a target between blocks | /compare |
| hero-07 | jamin img 7.png | 1672x941 | 1672, 1280, 768 | skyline, half drawn half built | /downloads |
| hero-11 | jamin img13.png | 1720x914 | 1720, 1280, 768 | golden key over hillside villas | /projects/current |
| hero-12 | jamin img 15.png | 1672x941 | 1672, 1280, 768 | plot with a wireframe house and a NOW dial | /account/sign-in |
| hero-13 | jamin img 16.png | 1672x941 | 1672, 1280, 768 | aerial plot with a red pin, green fields | **unassigned — spare** |
| hero-14 | cf65435a…jpg | ⚠️ 748x421 | 748, 1280 (upscaled) | tree, boy with umbrella, cattle, paddy | retired — too small |
| hero-15 | view-green-palm-tree…jpg | 3000x2000 | 1920, 1280, 768 | coconut palms over paddy, hills behind | **spare** — was the homepage until 2026-08-09 |
| hero-08 | jamin 8.png | 1672x941 | 1672, 1280, 768 | aircraft trailing a red arc | /projects/future |
| hero-09 | jamin 9.png | 1672x941 | 1672, 1280, 768 | figure walking to a drawn house | **spare** — was /journal until 2026-08-09 |
| hero-18 | ChatGPT Image Aug 9 2026 01_30_24 PM.png | 1672x941 (**no trim**) | 1672, 1280, 768 | boy copying a palm-leaf manuscript at sunset, gopurams behind | **spare** — was /journal for part of 2026-08-09 |
| hero-23 | ChatGPT Image Aug 9 2026 08_18_56 PM.png | 1706x922 (**no trim**) | 1706, 1280, 768 | villas, a plotted layout with a map pin, apartment towers under construction, red and gold arcs | /journal (cinematic) |
| hero-10 | jamin 10.png | 1672x941 | 1672, 1280, 768 | red disc over a waterfront | **spare** — was /contact until 2026-08-09 |
| hero-21 | ChatGPT Image Aug 9 2026 07_21_02 PM.png | 1790x879 (**no trim**) | 1790, 1280, 768 | a layout mid-build at sunset, workers and a tractor, **JAMIN BAZAAR on the gate** | /contact (paper) |
| hero-16 | ChatGPT Image Aug 9 2026 12_41_24 PM.png | 1983x793 → **trimmed to 1983x600** | 1983, 1280, 768 | temple-form gateway over a palm-lined road, red sweep at right | **spare** — was the homepage for part of 2026-08-09 |
| hero-20 | ChatGPT Image Aug 9 2026 07_05_34 PM.png | 1983x793 → **trimmed to 1983x600** | 1983, 1280, 768 | the same gateway drawn wider, **JAMIN BAZAAR on the arch**, sun behind the hills | homepage |
| hero-17 | ChatGPT Image Aug 9 2026 01_21_48 PM.png | 1672x941 → **trimmed to 1672x745** | 1672, 1280, 768 | formed road between planted plots, palms and hills, red sweep at right | /properties (cinematic) |

## ⚠️ hero-16 is TRIMMED, not just resized (2026-08-09)

It replaced hero-15 on the homepage. It is the first supplied frame that is a
finished **banner** rather than a picture, and that costs it two things:

- **Baked-in type.** The original carries a white strip — "DTCP Approved · Prime
  Locations · Best Value · Safe & Secure" — and a column of categories
  ("Residential / Villa / Investment Plots", "Farm Lands"). Those are pixels:
  unselectable, untranslated, invisible to a screen reader, and they do not
  reflow. Two of the categories are not sold here and "Best Value" is a claim
  this site makes nowhere else. The renditions are cut at **y=600**, above the
  strip (y 622–732) and above the labels (y 611–715). Regenerate from the
  original with that same `extract` — a plain resize puts the text back.
- **Aspect.** Trimming takes it from 2.5:1 to **3.3:1**, and `object-cover`
  scales a background to the box HEIGHT and takes the difference off the sides.
  How much of the banner survives is therefore decided by how tall the hero is,
  not by any crop setting. At a 586px band: 71% of the width at 1400, 65% at
  1280, 52% at 1024. This is why the inventory rail sits below the banner
  instead of inside it — 107px of rail costs about a tenth of the picture.

Its treatment is neither `paper` nor `cinematic`: the artwork provides its own
empty white panel on the left, so the copy is **ink on the artwork**, with a
left-to-right canvas wash (the mirror of `hero-fade`) guaranteeing the backdrop
under the words. ⚠️ That overlay only holds from **1400px**. The panel is a
fixed fraction of the artwork while the copy column is a fixed 36rem, so as the
viewport narrows the last lines land on the gatepost: composited through the
wash the lead measures 5.56:1 at 1400, 3.46:1 at 1280, 1.62:1 at 1024. Below
1400 the artwork leads as a band above the copy instead, where nothing sits
behind the text at all.

## hero-17 → /properties (2026-08-09) — same trim, opposite treatment

The second banner of the same family, and the trim rule carried over unchanged:
cut at **y=745**, above the strip (y 784–877) and above the category icons
(from y 755). Regenerate with that `extract` or the baked type comes back.

Its TREATMENT is the opposite of hero-16's, and that is the rule working, not
an inconsistency. hero-16 is graphic with an empty paper panel, so the words
went onto the artwork in ink. hero-17 is a **photograph** — blue sky, real
tonal range, no empty panel anywhere — so it takes `cinematic` and white type
over the shared `veil`, exactly like the frames it sits beside.

⚠️ It was measured against hero-02, the frame it replaced, by the comparison
method described at the end of this file — composite both through the veil's
two gradients and read the brightest 5% of the backdrop under each zone. It is
**safer** in every one: eyebrow 6.21 against 3.45, h1 4.23 against 3.10, lead
10.01 against 8.89. That is why it needs no frame-specific wash, unlike hero-15
on the homepage, which needed one swept. Those are relative figures; a real
audit has to measure the composited page.

## hero-18 → /journal (2026-08-09) — and the page changed tone with it

Not a banner: a plain photograph with no baked type, so its renditions are
straight downscales. It is the first frame supplied this way, which is worth
noticing — do not assume the trim rule applies to everything the owner sends.

⚠️ **/journal moved from `paper` to `cinematic`**, which is the two-families
rule doing its job rather than an inconsistency. hero-09 was a graphic render
on near-white and had to keep the words off the image; hero-18 is golden hour
with real tonal range, which is the case `veil` exists for. Laying a photograph
like this on the ivory instead would waste it.

Measured against the audited cinematic frames in the real /journal box
(1425x559 at 1440), by the comparison method at the end of this file:

| zone | hero-01 | hero-02 | hero-18 |
|---|---|---|---|
| eyebrow | 3.43 | 2.99 | **2.74** |
| h1 | 2.65 | 2.57 | 2.57 |
| lead | 6.61 | 8.89 | **11.73** |

Equal to hero-02 under the headline and far better under the lead, so it ships
on the shared veil with no frame-specific wash. ⚠️ The eyebrow is the one zone
where it is the weakest of the three. That line sits about 21% down a 559px
hero, and the vertical wash is already at zero by 25% from the bottom, so only
the horizontal one reaches it — and this frame has bright sky exactly there.
If the eyebrow ever has to hold more than a short label on this page, that is
the number to re-measure first.

## 🚨 hero-19 → /about (2026-08-09) — the render that names itself

No trim needed, and by the veil comparison in the real /about box (1425x639 at
1440) it is by far the safest frame the site has carried: eyebrow 6.81 against
hero-01's 3.84, h1 6.36 against 2.72, lead 10.11 against 4.80. Its whole left
side is planting and boundary wall in shadow, exactly under the copy.

**The problem is not contrast, it is provenance.** Every other image here is
abstract enough that "brand imagery, never a project" is easy to hold. This one
puts **JAMIN BAZAAR on the gate** and shows a specific finished layout — lit
lamp posts, formed roads, planted avenues, a completed villa behind. A reader
will take it for a photograph of a delivered Jamin development, because that is
what it is drawn to look like. It is a render.

So the no-caption rule binds harder here than anywhere else in the set:

- it stays `alt=""` and `aria-hidden`, as decoration, and must never gain a
  caption, a location, a project name or a "photo of" line;
- it must never appear on a property card, in a project gallery, or on
  /projects/completed, where the subject genuinely is a delivered project and
  real photography is required;
- if the owner ever wants a gate picture presented AS a Jamin project, it has
  to be a photograph from Supabase storage, not this.

Worth raising with him rather than deciding quietly: on a page headed "Land,
sold the way it should be" — beside copy that says the business would rather
say "not published yet" than quote a number it cannot stand behind — an
invented photograph of its own completed layout is the one asset on the site
that cuts against that promise.

## 2026-08-09 — the veil came down and the copy moved onto a gilt plate

The heroes stopped being scrims over pictures and became **pictures with a
plate on them**. One change, two halves that cannot be separated:

- `veil` is at ≈65% of its old stops (0.8/0.45 → 0.52/0.30, 0.55/0.34 →
  0.36/0.22). On its own that would put every cinematic lead under AA.
- the hero copy now sits in `gilt` — translucent near-black at **0.52** with a
  gold hairline — which supplies the contrast locally instead of the page
  supplying it globally.

Net effect, measured per frame in the real boxes at 1440 (white type, brightest
5% of the backdrop under the copy):

| page | before | after |
|---|---|---|
| /about | 6.74 | **10.25** |
| /properties | 3.61 | **8.08** |
| /journal | 2.62 | **6.15** |

Contrast roughly doubled while the photograph got lighter. That is the whole
argument for the plate: a scrim pays for legibility with the whole frame, a
plate pays only where the words are.

Numbers that were swept, not chosen — change them and re-sweep:

- **`gilt` at 0.52.** At 0.46 the gold label measured 3.34 on hero-18; at 0.58
  it stopped reading as a plate.
- **`--color-jamin-gold-pale` #f9dca6** for gold words ON the dark plate.
  `gold-light` was tried first and gives 3.91 on hero-18 — under the 4.5 a
  small uppercase label needs. This gives 4.63 there.
- **`gilt-light` at 0.90**, which converged on `--glass-tint`'s number for the
  identical reason: over ivory 0.72 looks the same, but the homepage plate's
  corner reaches the roadway, where 0.72 gave gold-ink 3.64.

⚠️ **The homepage canvas wash is GONE, not reduced.** Stacked under a 0.90
plate it bleached the left gatepost to a smear. If copy is ever placed outside
the plate on that hero, the wash has to come back with it.

⚠️ **The homepage measure went WIDER (36rem → 42rem) when the plate arrived**,
which looks backwards until you remember the banner is 3.3:1 and content-sized:
a narrow plate makes tall copy, and height is taken off the SIDES. At `lg` the
plate pushed the banner to 764px and cropped it to 56% of its width, losing the
red sweep. At 42rem it is back to 66%.

## hero-20 → homepage, and what a frame swap costs downstream (2026-08-09)

Same family as hero-16, same trim line: cut at **y=600**, above the strip
(starts 608) and the category icons (start 618). It also carries **JAMIN BAZAAR
on the arch**, so the provenance warning written for hero-19 applies here too.

⚠️ **It moved `gilt-light` from 0.90 to 0.94, and that is the lesson.** hero-16
put the plate on the artwork's own white panel; hero-20 puts it on open paddy
and a stone gatepost. Same plate, same copy, darker backdrop — gold-ink fell
from 4.62 to **4.40**, under AA, purely because the picture changed. 0.92
clears by 0.06, which is no margin in a model that is a comparison rather than
an audit; 0.94 gives 4.72 here and 4.86 on the old frame. **Re-sweep this
whenever the homepage artwork changes.** A plate's contrast is a property of
the pair, not of the plate.

The cost is honest: at 0.94 it is nearer opaque than the translucent card it
began as. The lever that buys translucency back is shorter hero copy — a
smaller plate would clear the gatepost, sit wholly on light paddy, and pass at
a much lower alpha.

## One column, and why the rail's bleed had to go (2026-08-09)

The hero briefly had **three** left edges: the inventory rail at 99, the plate
and the header logo at 112, the headline at 147. Each was individually
defensible and together they were a mess.

The rail's `-mx-[13px]` was correct when the copy lay bare on the artwork — it
put the first thumbnail on the same column as the headline. The `gilt` plates
then moved every headline 35px inside their own padding and quietly invalidated
it. The bleed is gone: **every card edge in every hero now starts at the
container's content edge**, the same place the logo above and the body copy
below start.

Contents are then inset by each card's own padding — 6px in a rail, 35px in a
plate. Aligning the CONTENTS instead would require those paddings to be equal,
which means a chunky rail or a cramped plate. If a plate's padding changes,
nothing has to be recalculated; that is the point of choosing the edge.

## 🚨 hero-21 → /contact (2026-08-09) — the strongest provenance case yet

No trim; it has no baked strip. But it goes further than hero-19 did. hero-19
showed a finished gate; this shows a layout **mid-build** — surveyors' pegs,
a water tractor, a house at slab level, workers planting the avenue — under a
gate reading **JAMIN BAZAAR**. It is not a photograph of a Jamin site. It is a
render, and it is drawn to look exactly like documentary evidence of work in
progress.

Everything written for hero-19 applies, harder: `alt=""`, `aria-hidden`, no
caption, no location, no project name, never on a property card or in a project
gallery, and never on /projects/completed or /projects/ongoing, where the
subject genuinely is a real site and real photography is required. On /contact
it sits behind "Book a site visit", which is the page where a reader is closest
to acting on what they think they are seeing.

## Transparency is bought with text colour, not with the plate (2026-08-09)

`gilt-light` went 0.94 → **0.74** without failing anything, and the method
generalises. A plate's alpha is set by whichever text on it has the LEAST
contrast; here that was always the gold caption, one short line. Rather than
darken the whole plate to rescue it, the line moved: caption to
`jamin-gold-deep`, hero lead from `ink-muted` to `ink-soft`. Swept on the
homepage's worst case (hero-20 behind the plate, 1425x736 at 1440):

    0.62 → gold 3.54 · 0.68 → 4.05 · 0.74 → 4.60 · 0.80 → 5.20

⚠️ **Darken the text before darkening the plate.** The plate is the thing the
reader was promised they could see through.

⚠️ The homepage hero was also raised to `clamp(30rem,82vh,46rem)` on request —
736px at 1440, up from 656. On a 3.3:1 banner that costs picture WIDTH, because
`object-cover` sizes to the box height: 66% → **59%**. Lower this first if the
red sweep has to come back into frame.

## hero-22, and the one warm passage on the site (2026-08-09)

Not a hero — the image beside the homepage's four-stage section, which was
rewritten at the same time from "From sanctioned drawing to a plot you stand
on" to "Somewhere your children will say they are from."

**Trimmed at x=580.** The original bakes in a JAMIN BAZAAR lockup (ends x=399)
and a gold temple line-art (ends x=564). A second logo inside a content card
duplicates the header three inches above it, and a half-cropped ornament reads
as a mistake, so the cut clears both.

⚠️ Two things about that section are load-bearing and easy to undo by accident:

- **The copy still has to hand over to the four stages.** The `<ol>` beneath it
  has no other introduction, so the paragraph opens on the picture a buyer
  already carries and closes on the process. Rewrite it and that handover has
  to survive.
- **It evokes without asserting.** It describes a tiled roof, a field and a
  remembered address and then asks whether that is the reader's picture. It
  does NOT say what buyers feel or why they buy, which is the line between
  atmosphere and an invented claim — and this is the page's only warm passage,
  so it is the one most likely to drift over that line on the next edit.

⚠️ And the caption rule bites hardest here of anywhere. Beside copy about the
place you are from, a reader will read this as a Jamin site. It is a render of
nowhere. No caption, no location, no project name, ever.

## The heroes centre their copy (2026-08-09)

Every hero moved from `justify-end` to `justify-center`. Bottom-anchoring was
never a layout preference — `veil` is darkest in the bottom-left corner, so
that is where bare white type had to sit. The `gilt` plate carries its own
backdrop, which released the copy from the corner.

⚠️ Centring alone did not centre it. With `justify-center` the free space
splits evenly and the padding is then added on top, so the existing
larger-on-top padding left the homepage card 49px low (109 above, 60 below).
The padding is now inverted — more room BELOW than above — which lands the card
a touch above the geometric centre, where the optical centre of a block of type
actually is. Measured after: 88 above, 81 below.

## hero-23 → /journal (2026-08-09), and the gold gets paler again

No trim: graphic arcs and dot grids, but no baked words. No Jamin mark either,
so the provenance risk is the ordinary one rather than hero-19's or hero-21's.

⚠️ It shows **villas, a plotted layout and apartment towers in one frame**, and
that is deliberate rather than off-brand. The Journal's most-read piece compares
exactly those three. The towers are the section's SUBJECT, not a claim that the
company builds them — do not "correct" them out.

⚠️ **It moved `--color-jamin-gold-pale` a second time, from #f9dca6 to
#fbe6bd.** The eyebrow measured 4.31 on this frame — under AA — where it read
4.61 on hero-18, on the same plate with the same copy. The frame changed; the
number moved. At #fbe6bd the worst cinematic frame reads 4.67 and the other two
improve with it (hero-17 6.60, hero-19 5.71).

That is now the fourth time a frame swap has broken a contrast figure. **The
pattern is worth naming: a plate's contrast is a property of the PAIR — plate
and picture — never of the plate alone.** The response each time has been to
move the text, not the plate: darker gold on `gilt-light`, paler gold on
`gilt`. Both keep the plate as see-through as it was, which is the thing the
reader was promised.

**Three surfaces deliberately use no render at all**, which is what makes the
one-image-per-page arithmetic work — and is what the "brand imagery only" rule
above asks for on pages whose subject is a real project:

| surface | image | why not a render |
|---|---|---|
| /projects | 2nd photo of a development | index of real projects; hero-05 is needed on the homepage, where it literally illustrates "from sanctioned drawing to a plot you stand on" |
| ~~/projects/completed~~ | ~~2nd photo of the delivered project~~ | ⚠️ **NO LONGER TRUE — it took hero-40 on 2026-08-13 at the owner's request.** The argument below still stands; it was overruled, not withdrawn. See the hero-40 entry. |
| homepage closing band | 2nd photo of the delivered project | was hero-02, which is the /properties hero — the same frame twice in one visit |

⚠️ Always the **second** photograph, never `images[0]`. The first is the card
cover, and each of these pages also lists that project as a card, so using the
cover would put the same frame in the hero and the grid below it.

## The shortfall is closed (2026-08-08)

Three more renders were supplied, which ends the arithmetic problem recorded
here before: eleven hero surfaces against ten images.

- **hero-11 → /projects/current.** That stage had no image of its own and would
  have fallen back to hero-05, doubling with /projects, the moment a property
  was moved into it. It is now covered before it is ever used.
- **hero-12 → /account/sign-in**, which a bug report called visually empty.
- **hero-15 → the homepage** (2026-08-08). ⚠️ Superseded on 2026-08-09 by
  hero-16; hero-15 is now a spare and the veil sweep below is history, not live
  configuration — the homepage no longer uses `veil` at all. A 3000x2000 source, so
  every rendition is a genuine downscale — hero-14 before it was 748x421 and had
  to be upscaled to fill a desktop hero, which is why it read soft. hero-14 is
  retired for that reason alone.

  ⚠️ **It needed a second scrim, and the value was swept rather than guessed.**
  The photograph is bright from the horizon down — sunlit palms exactly where
  the headline sits — so on the shared `veil` alone the h1 measured 2.11 against
  2.73 for the frame it replaced, even though the lead paragraph improved. A
  frame-specific bottom wash was added to the homepage hero ONLY, leaving the
  audited `veil` untouched for every other cinematic page. Sweep:
  0.45/0.20 → 2.47 · 0.50/0.30 → 2.68 · **0.55/0.38 → 2.86** · 0.60/0.45 → 3.02.
  Shipped at 0.55/0.40: the first setting that clears the previous frame.
  Going further flattened the picture, which is what it was chosen for.

- **hero-13** is spare again.
- **hero-03 is now the spare** — the golden-hour render it replaced. Any new
  page that opens with a `PageHero` should take that rather than reuse an id.

### ⚠️ On measuring the veil against a new frame

Before swapping the homepage frame, hero-13 was compared with hero-03 by
compositing both through a canvas with the veil's two gradients and reading the
95th-percentile background luminance under the h1 and the lead. They came out
equivalent — h1 1.21 vs 1.11, lead 2.37 vs 2.37 — which is the useful result:
the new frame carries the same risk as the audited one already in place.

**Those absolute figures are NOT a contrast audit.** The reconstruction does not
reproduce the ≈0.89 combined alpha recorded in globals.css, most likely because
the 100deg gradient is approximated as an axis-aligned one. Treat this method as
a COMPARISON between frames only. A real audit has to measure the composited
page, not a model of it.

## hero-28 → /tools (2026-08-11) — and the two edits it needed

Owner-supplied, and owner-chosen over hero-13 the same afternoon: a woman in
office clothes carrying an elephant on her back, on a plain ground. It is a
picture of the WEIGHT OF THE DECISION rather than of the land — a different
argument for that page, and the owner's to make. 1672x941 native → 1672 / 1280 /
768 WebP (57 / 38 / 17 KB — a plain ground compresses to almost nothing).

⚠️ **MIRRORED.** In `tone="paper"` the copy plate sits on the LEFT and the render
bleeds off the RIGHT. The subject was in the left third: unflipped, the plate
covered the woman entirely and the page showed the elephant's back end. Flipped,
she stands clear on the right and the trunk points INTO the page. Nothing in the
frame is text or handed, so the flip costs nothing.

⚠️ **RETINTED TO THE CANVAS.** The stock background is pure `#ffffff`; this site's
canvas is `#fdfcf9`. Untouched it reads as a white rectangle pasted onto ivory,
with a hard seam along the top and right that `hero-fade` — which only dissolves
the LEFT edge — cannot reach. Each channel is scaled by `canvas/255`, which maps
white exactly onto the canvas and costs the elephant 0.8% of red and 2.4% of
blue. Invisible, and it keeps the contact shadow as a gradient rather than
turning the subject into a cut-out.

**Both edits are mandatory on any regenerate.** Neither is visible as a mistake
until the page is looked at, which is exactly why they are written down here.

## hero-13 → SPARE again (was /tools for one afternoon, 2026-08-11)

The spare that turned out to be the right one. /tools shipped with NO hero, on
the argument that an instrument should open on its first field; the owner asked
for one and 13 was unused. It is a plot with a wireframe house on it and a clock
reading **NOW** — planning, time, and a parcel being valued, which is exactly
what that page is for.

⚠️ **`tone="paper"`, not `cinematic`.** 13 is from the GRAPHIC family (near-white
ground, architectural line-work), so the copy sits on the page's own ivory and
`hero-fade` dissolves the render's left edge into it. Laid full-bleed it would
need a heavy scrim, which destroys the very thing that makes it good — the rule
this file opens with. Measured after: 86 nodes on /tools, zero WCAG failures,
and no plate alpha needed at all because nothing sits on the picture.

## hero-27 → /journal (2026-08-11) — and the plate that came with it

Owner-supplied. A desk, a chair and a CRT standing in a mown meadow under
overcast light, hills and woodland behind. 1774x887 native → 1774 / 1280 / 768
WebP (196 / 141 / 62 KB). Brand imagery: `alt=""`, `aria-hidden`, never a
caption, and obviously not a Jamin project.

⚠️ **ITS PLATE ALPHA WAS RE-SWEPT, NOT INHERITED, AND THAT IS THE LESSON.** The
banyan it replaced (hero-25) allowed **0.02** — the lightest plate on the site —
because it was deep shade. This frame is the exact opposite: overcast daylight,
bright sky, pale grass, no shade anywhere. Carried over unchanged, the white
lead measures **2.41:1**. That is not a near miss, and it would have shipped
invisibly, because swapping `art={25}` for `art={27}` looks like a one-line
change.

Swept on the composited frame — photograph, then `veil`'s two gradients, then
the plate — over the plate region only, at the p95 this file measures by:

    0.34 → eyebrow 4.27 · white 4.61   ← eyebrow under AA
    0.40 → eyebrow 4.89 · white 5.28
    0.44 → eyebrow 5.36 · white 5.79   ← ships
    0.52 → eyebrow 6.49 · white 7.01   ← the site's audited default

The eyebrow is `champagne-50` at 9.9px and is the binding ink, as it is on every
cinematic hero. 0.44 keeps margin on it while letting more of the meadow through
than the default would. Verified on the built page: eyebrow 5.38, white 5.81,
and 4.12 even against the single brightest pixel under the plate.

**Rule for the next swap: a hero and its `sheerAlpha` are one change, not two.**

## hero-25 → RETIRED from /journal 2026-08-11 (the banyan)

Replaced by hero-27. Its notes below are still the reference for the lightest
plate the system can carry, and for why deep shade is what buys it.

## hero-29 → /vault (2026-08-11) — the monsoon backroad

Supplied by the owner, replacing hero-26 the same day. A tarred village road
under heavy rain: coconut palms, a tiled hut at the right, mist closing the end
of the road. Native 1672x941 → 1672 / 1280 / 768 WebP (327 / 222 / 86 KB).

⚠️ **Its scrim is not hero-26's, and the correction went in OPPOSITE
directions on desktop and mobile.** Read the hero block in
`src/app/vault/page.tsx` before touching either number.

- **Desktop lightened, ×1.00 → ×0.70 on both gradients.** hero-26 was the
  brightest frame here and its stops were sized for a sunlit lawn. hero-29 is
  dark wet forest exactly where the words sit, so the inherited scrim measured
  8.66 at p95 on the gold eyebrow — three points of headroom spent crushing a
  picture that never needed it. Ships at 6.83 p95 / 4.19 worst pixel.
- **Mobile darkened, 0.18 → 0.28 on the flat veil.** `object-cover` in a tall
  box crops to the centre slice, and the centre of this frame is the brightest
  part of it — the rain-mist. The eyebrow measured 4.23 at 375 on the inherited
  veil, under the line; 0.28 puts it at 4.92.

The lesson generalises: **a desktop sweep tells you nothing about the phone**,
because they are looking at different parts of the picture. Measure both.

Same standing rule as everything in this folder — brand imagery, `alt=""`,
never a caption, a location or a project name.

## hero-26 → RETIRED from /vault 2026-08-11 — the brightest frame the site carried

Replaced by hero-29 within the day. The files stay. Its notes below remain the
reference for the heaviest scrim the system has needed and for why a bright
frame under white type forces a scrim rather than a plate.

Supplied by the owner. A stone-and-glass estate seen straight down its own
drive: clipped hedges, urns, mown stripes, midday sun and white cloud. Native
1855x848 → 1855 / 1280 / 768 WebP (380 / 221 / 87 KB — heavier than the renders
because it is a photograph, and `next/image` re-encodes from it anyway).

⚠️ **Brand imagery, and the rule bites harder here than usual.** It is a
render of nowhere and it is not a Jamin project. It is also the most
convincingly *real* frame in this folder — which is exactly why it must stay
`alt=""`, `aria-hidden`, uncaptioned and off every property card. A viewer who
believes it is a Jamin estate has been misled by the picture alone.

⚠️ **It is a SCRIM frame, not a picture-plus-plate frame**, and it is the
first exception to the treatment the site moved to on 2026-08-09. That
treatment works because a plate can carry white type locally over a picture
that is dark *somewhere*. This one is not dark anywhere: midday sky, white
cloud, sunlit lawn. A plate opaque enough to hold white type over a cloud is a
black box, so the scrim came back — and the plate dropped to 0.14 to stop the
two compounding into a visible rectangle.

Two gradients, because there are two jobs. Horizontal darkens the left third
where the words are (0.88 → 0.72 → 0.38 → 0.46) and lets go over the house, so
the picture survives being used. Vertical anchors the top under the header and
the foot into the section edge (0.62 → 0.22 → 0.58).

Swept on the composited frame at 1280, plate region only, worst single pixel:

    plate 0.10 → gold 4.36 · white 7.01   ← one pixel under AA
    plate 0.14 → gold 4.53 · white 7.29   ← ships
    plate 0.18 → gold 4.75 · white 7.64
    plate 0.22 → gold 5.04 · white 8.10

At the p95 this file normally measures by, 0.14 reads gold 7.07 and white 11.01.

⚠️ **Below `lg` it needs a flat veil on top, and the reason is the CROP.**
`object-cover` on a 2.19:1 photograph in a tall box shows a narrow centre
slice, so the horizontal gradient's whole argument is off-screen and what lands
under the copy is lawn and cloud. At 375 the brightest pixel took the gold
eyebrow to 3.74. A uniform `rgba(10,10,9,0.18)` under `lg:hidden` reads 4.83 at
375 and 4.56 at 768, and moves the mean luminance only 0.023 → 0.017.

⚠️ **`Container` needed `w-full` to sit left.** The hero section is a flex
container, so the container is a flex ITEM and was sized by its content — the
1280 cap and `mx-auto` centred a box only as wide as the copy, and the plate sat
directly over the house. Harmless while the hero was an abstract drawn plate;
fatal for a photograph whose subject is dead centre.

## hero-24 → RETIRED 2026-08-11 (was /vault) — the first frame on a DARK page

⚠️ **No longer on any page.** It opened /vault until the division was rebuilt
on 2026-08-11 and hero-26 replaced it. The files stay; everything below is the
record of what it cost to make it work, and is still the reference for any
frame whose copy lands on its brightest quarter.

Supplied by the owner. A Tamil village street at dusk: tiled roofs, palms, a
gopuram behind, elders on a platform, a bicycle and a cow. No trim needed — it
bakes in no type and carries no Jamin mark, so the provenance risk is the
ordinary one rather than hero-19's or hero-21's. Still `alt=""`, `aria-hidden`,
and never captioned as a project: it is a render of nowhere.

1914x822 native → 1914 / 1280 / 768 WebP at q82 (326 / 174 / 70 KB).

⚠️ **It needed its own plate alpha, and that is the pair rule again.** `gilt` is
0.52, swept against hero-18 and correct on /about, /properties and /journal.
This frame puts the copy over its brightest quarter — sky through palms, then a
sunlit road — and at 0.52 everything failed: lead 1.80, eyebrow 3.91, the foil's
dark stop 2.97. Swept at the plate's real size over this frame:

    0.52 → bone 3.67 · pale 3.91 · foil 2.97
    0.60 → bone 4.69 · pale 4.99 · foil 3.80
    0.66 → bone 5.66 · pale 6.02 · foil 4.58
    0.78 → bone 8.41 · pale 8.95 · foil 6.81

It shipped at 0.66 for a few hours, then the owner asked for a plate you could
see more of the village through — so it was **re-swept with the copy lightened
first**, which is the move this file keeps recording:

    0.50 → white 4.48 · champagne-50 4.15
    0.52 → white 4.78 · champagne-50 4.43
    0.54 → white 5.04 · champagne-50 4.66   ← the floor
    0.56 → white 5.37 · champagne-50 4.97   ← ships, as `.rj-gilt-vault`

⚠️ **Every gold word on this plate is `champagne-50` (#fdf6e0), and the body is
pure white.** `bone` fails at 4.13 and `jamin-gold-pale` at 4.39; the gradient
foil is gone from "price on request" because its darkest stop (#e3cb74) needs
0.66 to clear and would have forced the plate back to opaque. Verified on the
composited page at 0.56: eyebrow 4.97, h1 5.37, lead 5.37, rates 5.37, gold
phrase 4.97.

⚠️ The absolute brightest pixel under the plate is 0.184 rather than the p95's
0.146, where the gold measures 4.18. The p95 is this file's established method
and a single pixel is unlikely to sit under a glyph — but if the frame is ever
re-cropped, that gap is the first thing to re-measure.

Scoped to this hero; the audited 0.52 stands everywhere else.

⚠️ It is also the first hero on a page that is already dark (`data-theme="vault"`),
so the gold dust now drifts over a photograph instead of over flat onyx.

## hero-25 → /journal (2026-08-10), and the SHEER plate

The banyan lesson: a teacher and students under the tree, palm-leaf manuscripts
on the ground, a hanging board reading **JAMIN BAZAAR**. 1983x793 native →
1983 / 1280 / 768 WebP (369 / 185 / 77 KB). It replaces hero-23, which returns
to the spare pile.

⚠️ It **bakes the wordmark into the picture**, so hero-19's provenance rule
applies: `alt=""`, `aria-hidden`, never a caption, never a project name. It is
allegorical rather than documentary — nobody will mistake a gurukul for a Jamin
layout — which is why it is a lower risk than hero-19 or hero-21, not a
different rule.

⚠️ **`.rj-gilt-sheer` — transparency bought with BLUR, not with luck.** The
owner asked twice for a plate you can see the picture through. A plate's worst
case is the brightest 5% of what sits behind it, and blur is what collapses
that toward the mean: under the Vault plate the mean is 0.053 against a p95 of
0.170, so nearly all of the contrast problem was a handful of bright spots
rather than the picture as a whole. Swept on the real frame:

    blur  14  α0.42 → white 3.85 · gold 3.57
    blur  44  α0.42 → white 4.55 · gold 4.21
    blur  80  α0.36 → white 4.89 · gold 4.53
    blur  80  α0.38 → white 5.14 · gold 4.76
    blur 120  α0.28 → white 5.14 · gold 4.75

Taken further again on 2026-08-10 after a third request for transparency. The
alpha is now PER FRAME, at 100px blur, because the ceiling belongs to the
picture rather than to the plate:

    /vault   (dusk, bright sky)   α0.32 → white 5.00 · gold 4.63   ← its floor
    /journal (banyan, deep shade) α0.10 → white 8.09 · gold 7.49

The Journal frame clears AA at **no tint at all** (α0.00 → white 6.09), which is
why it runs at 0.10 — the plate there is doing almost nothing but blurring. One
shared number would have made the Journal murky to protect a frame it does not
share. 100px is expensive and is the first thing to lower if a phone struggles.

120/0.28 is the most transparent thing that passes and was **not** taken: a
120px blur across a full-width hero is a real cost on a low-end phone, and §9
already treats `backdrop-filter` as a performance budget. 80/0.38 is a third
more see-through than the 0.56 it replaced.

⚠️ **The plate requires full-strength copy.** `bone`, `white/80` and
`jamin-gold-pale` all fail on it. `PageHero` sets pure white body text and
champagne-50 gold behind the `sheer` prop so the two cannot be set apart.
/about and /properties keep the audited `gilt` at 0.52 and 14px — they were
never asked to change.

Measured after, on both pages: Vault eyebrow 4.76 · h1 5.14 · lead 5.14 ·
rates 5.14 · gold phrase 4.76. Journal eyebrow 10.06 · h1 10.86 · lead 10.86,
because that frame is far darker under the plate than the Vault's dusk.

## hero-30 → /vault (2026-08-12), and why the PLATE moved instead of the scrim

A Pichwai-style painting: a cream palace in a wooded valley at sunset, peacocks,
cattle at a river, hill shrines, birds crossing an orange sky. Owner-supplied,
1916×821 native → 1916 / 1280 / 768 WebP (447 / 239 / 93 KB). It replaces
hero-29, which returns to the spare pile.

⚠️ It bakes NO wordmark and depicts nothing that could be read as a Jamin
development, so it is the lowest-provenance-risk hero in the set. The standing
rule still binds — `alt=""`, `aria-hidden`, never a caption — because it is
brand imagery, not a photograph of anything Jamin owns.

⚠️ **It is the hardest frame on the site for white type, and not for the reason
a glance suggests.** Its mean luminance is low — it looks like a dark picture —
but it is bright at GLYPH SCALE in every third of the frame: white blossom and a
waterfall on the left, gold domes and a lit facade in the centre, an orange sky
above. A scatter like that cannot be fixed by anything global, and both global
levers were swept before the plate was touched:

    object-position at 1024/1280/1440/1920, left → centre
      worst pixel under the plate moved only 1.89 → 2.58. There is no crop
      where the copy sits over calm paint.

    scrim scale (hero-29's two gradients, scaled as one)
      ×1.60 is needed to reach hero-29's shipped worst pixel, and it takes the
      frame's mean luminance from 0.026 to 0.011 — it buys the words by putting
      the painting out.

So the scrim kept hero-29's stops exactly and `--rj-sheer-alpha` went
**0.14 → 0.46**. Swept at 1024 (the tightest width), plate region, gold eyebrow
— it binds every time and white runs about 1.6× clear of it:

    0.14 → gold 4.54 p95 · 2.26 worst   ← hero-29's, fails here
    0.32 → gold 5.76 p95 · 3.21 worst
    0.40 → gold 6.40 p95 · 3.80 worst
    0.46 → gold 6.92 p95 · 4.32 worst   ← ships
    0.58 → gold 8.04 p95 · 5.61 worst   ← plate starts reading as a box

Worst pixel at every width measured: 1024 4.32 · 1280 4.38 · 1440 4.75 ·
1920 5.76 · 768 5.97 · 375 5.88. All clear the 4.19 hero-29 shipped at.

**The result is a brighter page, not a darker one.** Because the scrim did not
move, the painting outside the plate reads at mean luminance 0.035 against
hero-29's 0.027. That is the general lesson and it is the same one the site
learned in 2026-08-09: a scrim pays for legibility with the whole frame, a plate
pays only where the words are — so when a frame gets harder, spend it locally.

⚠️ The `lg:hidden` mobile veil stayed at 0.28 and was re-measured rather than
assumed. With the plate at 0.46, 375px is now the SAFEST width rather than the
tightest, so that veil has headroom if the phone crop is ever reworked.

## hero-31 → /projects/ongoing · hero-32 → /projects/future (2026-08-12)

Owner-supplied photographs of Jamin's OWN layouts, replacing hero-04 (a villa
render) and hero-08 (an abstract skyline). 1774×887 native → 1774 / 1280 / 768
WebP (212/129/52 KB and 219/134/55 KB).

- **hero-31** — formed asphalt roads with lane markings, kerbs, street lighting,
  a completed building and a roller still working. Reads as "under development
  and selling now", which is what /projects/ongoing says. **TRIMMED** at source
  x 526 -> 1248x702, exported 768 / 1280 (62 / 140 KB). See the warning below:
  it shipped untrimmed and only looked right because the copy plate was opaque.
- **hero-32** — red earth, plots demarcated and kerbed, roads laid, the thatched
  site office, hills behind.

This is the direction this register already prefers: a page whose subject
genuinely IS a Jamin project should carry a real photograph, and the renders are
brand imagery of nowhere. The standing rule still binds — `alt=""`,
`aria-hidden`, never a caption naming a development — exactly as it does for
hero-19 and hero-21, which also carry the JAMIN BAZAAR name in frame.

⚠️ **Both ship with `artPosition="right"`, and it is not a taste call.** The
JAMIN BAZAAR board stands at the far LEFT of both frames, and `paper` tone masks
the leftmost 22% of the image box to transparent (`hero-fade`) so the picture
dissolves into the canvas. The default `left` anchor puts the board precisely in
the dissolve. Worked through: the box crops to about 77% of the source width, so
for the board (source x 45–470) to clear the fade the crop would have to start
at a negative offset — there is no anchor value that keeps the board AND leaves
it solid. Cropping it out on desktop and showing the roads is the better half of
that trade.

⚠️ **The phone still sees the whole photograph, board included** — the mobile
band is `aspect-[16/9]` + `object-contain`, so nothing is cropped there. That is
also why the sign should NOT be trimmed out of the renditions: the hero-22
trimming precedent was for a picture inside a content card, where a second
wordmark duplicates the header. Here the original stays whole and the desktop
crop does the work.

⚠️ hero-32 shows a layout already formed, on a page headed "Land secured and
planning under way". It is brand imagery and carries no caption, the same
standing as hero-19 and hero-21 — but if the register is ever tightened so that
a hero must depict its page's stage, this is the pairing to revisit first.

hero-04 and hero-08 return to the spare pile.

## hero-33 replaces hero-32 on /projects/future (2026-08-12, same afternoon)

Owner-supplied. **TRIMMED**: the original is 1774x887; the renditions are cut at
source x 494 and re-squared to 16/9, giving 1280x720 native -> 1280 / 768 WebP
(165 / 72 KB). The finished avenue: lawns laid, avenue trees and flower beds
planted, plot markers and boundary walls in, a completed house at the head of
the road.

WARNING: It is a LATER stage than the frame it replaces, not an earlier one. The
note under hero-32 flagged that a formed layout sits oddly under "Land secured
and planning under way"; hero-33 is further along still. That was put to the
owner and he chose this picture, so the pairing is deliberate. It remains
uncaptioned brand imagery under the standing rule, the same standing as hero-19
and hero-21, and makes no claim about any specific future project. If the
register is ever tightened so a hero must depict its page's stage, this is the
first pairing to revisit, and hero-32 is kept in the spare pile for exactly
that rather than deleted.

WARNING: THE TRIM IS THE INTERESTING PART, because the first attempt was wrong
and the mistake generalises. hero-33's board sits further into the frame than
hero-31's (source x 267-484 against 45-470). The `paper` box crops to a 1366px
window, so even a full right anchor starts at x 409 and can never reach 484 - a
75px sliver of the board's dark-framed edge survived EVERY `artPosition` value.
It was shipped on the reasoning that the sliver lands 5.5% across a box whose
`hero-fade` runs to 22%, so it would dissolve. It did not: the mask is already
about a quarter opaque at 5.5%, and a dark frame on white reads clearly through
that. On screen it looked like a sign sliced in half.

Hence the cut. This is the hero-22 trimming precedent applied for a NEW reason -
not "a second wordmark duplicates the header" but "the geometry cannot crop it
cleanly". Trimming also restored 16/9, which keeps the phone band's
`object-contain` from letterboxing.

THE RULE FOR THE NEXT SWAP: if a baked-in board sits more than about 400px into
a 1774-wide frame, `artPosition` alone cannot remove it. Trim the source, and
check the result on screen rather than trusting a percentage against the fade.


## The plate-opacity trap (2026-08-12, learned the hard way on hero-31)

hero-31 shipped UNTRIMMED and looked correct: its board sat far enough left that
`artPosition="right"` cropped most of it, and whatever remained was hidden
behind the `paper` hero's opaque `gilt-light` copy plate. The moment that plate
was made see-through, the board ghosted through the headline - "AMIN BAZAAR"
reading straight across "Ongoing Jamin". Nothing about the picture changed; a
plate stopped covering it.

THE RULE: a plate that HIDES something is not the same as a frame that is
CLEAN. Before lowering any plate's alpha, look at what the plate was covering.
Anything relying on plate opacity to conceal artwork - a baked wordmark, a
caption, a busy corner - breaks the day that plate goes transparent.

Also: measure the board, do not eyeball it. hero-31's was first noted as ending
at x 470; it actually ends at 498, and a cut at 494 would have left a 4px seam.

## hero-34/35/36 -> the district pages (2026-08-12)

⚠️ **SUPERSEDED IN PART 2026-08-13** — hero-34 (Erode) and hero-36 (Tiruppur)
were replaced by hero-38 and hero-39 the next day and are now SPARE. Only
hero-35 (Salem) is still on a page. Everything below is the record of that
shoot and is still the reference for the sweep; the live numbers are in the
hero-38/39 entry above.

Owner-supplied, one shoot: golden-hour Jamin layouts with the marble JAMIN
BAZAAR sign. hero-34 Erode, hero-35 Salem, hero-36 Tiruppur. Coimbatore keeps
hero-17 at the owner's request, which is why ART_BY_DISTRICT has no entry for it.

WARNING: hero-34 IS TRIMMED, cut at source x 1422 -> 1422x800, exported
768 / 1280 / 1422 (101 / 234 / 274 KB). The original carries a "ROYAL CHETTINADU
ENCLAVE" plaque on its right edge - a development name that is NOT in the
catalogue, on a page whose whole job is to list the catalogue. Put to the owner
2026-08-12; he chose to cut it. Re-cut from the ORIGINAL if regenerated, not
from a rendition. 35 and 36 are untrimmed 1774x887.

WARNING: THE PLATE IS 0.52 HERE, AGAINST 0.12 ON /properties, AND THE SWEEP IS
WHY. hero-17 is a trimmed banner that is dark where the copy sits; these three
are bright golden-hour frames with a lot of sky and measure about 2.5x lighter
under the plate. At /properties' 0.12 the gold eyebrow reads 1.72-1.88 at the
worst pixel - not a near miss. Swept at 1280, plate region, gold eyebrow (it
binds every time, white runs about 1.1x clear):

    0.12 -> Erode 1.72 · Salem 1.76 · Tiruppur 1.88   <- /properties' value
    0.34 -> Erode 2.87 · Salem 2.93 · Tiruppur 3.12
    0.42 -> Erode 3.54 · Salem 3.62 · Tiruppur 3.83
    0.52 -> Erode ~4.6 · Salem ~4.7 · Tiruppur ~4.9   <- ships

ONE alpha for three frames, which departs from the per-frame rule this register
normally insists on. Justified because they are one shoot at one time of day and
measure within 0.3 of each other at every step; the number satisfies the darkest
of them (Erode). CORRECTION (2026-08-12, same day): the note first written here cited a 375px
worst pixel as if the phone were the tight case. It is not, and the mistake is
worth keeping because it is easy to repeat. Below `lg` the CINEMATIC tone puts
the picture in a band ABOVE the copy and the words sit on the section's own
charcoal — no photograph is behind them at all, so the phone is the SAFEST
width. The binding case is the narrowest width that still composites copy over
photograph, which is 1024. Sweeping a full-bleed phone crop overstates the
constraint; it errs safe, but it is measuring something the page does not do. If a district frame is ever swapped for
one from a different shoot, sweep it on its own.

Note the copy plate sits over the marble sign in all three. That is not a
defect - the sign reads through the sheer plate - but it is why these were given
`cinematic` rather than `paper`: the paper tone fades its left 22%, which is
exactly where the sign is, and hero-31/33 already paid for that lesson.


## 🚨 THE MOBILE BAND IS THE ARTWORK'S OWN RATIO, NOT 16/9 (2026-08-13)

This file used to say a wider frame "only letterboxes onto the section's own
charcoal, which is invisible". **It is not invisible.** It was reported as a
black strip under the navbar on six pages at once — /properties,
/projects/completed, /locations/coimbatore, /locations/salem,
/locations/tiruppur and /journal — and every one of them is simply a frame wider
than 16/9 sitting in a 16/9 box under `object-contain`. On a 375px phone
hero-37 (2.33:1) rendered 161px tall in a 211px box: a 25px bar above the
picture and another below it.

`PageHero` now carries a `TOP_HEIGHT` map beside `TOP_WIDTH` and the band takes
each frame's own ratio, so the picture fills it exactly — no bar, and still no
crop, which is the pair of failures that band exists to avoid. Measured after,
at 375: bars are 0px on all six.

⚠️ **Keep TOP_HEIGHT in step with the files here**, and read the top rendition
with an image tool rather than copying a number out of this register — several
frames are TRIMMED and their file is not their source. A wrong value is a bar or
a sliver of crop; nothing fails loudly.

⚠️ A `photo` (a real photograph from the database) keeps the 16/9 box, because
its dimensions are not knowable at build time. The only page still passing one
is /projects.

## 🚨 hero-40 -> /projects/completed (2026-08-13) — the register's own exception

Owner-supplied: a lit avenue of finished villas at dusk, a family walking, the
JAMIN BAZAAR wall at the right. 1921x819 native -> 768 / 1280 / 1921 WebP
(53 / 132 / 258 KB).

**This is the one page this file said a render must never go on.** /projects/
completed is the surface whose subject genuinely IS a delivered project, so the
rule above requires real photography, and it carried `secondaryImage()` of the
handed-over development until now. The owner asked for this frame with that on
the table, so the photograph is gone.

⚠️ **The picture and the page describe different things.** It shows finished
VILLAS; the listing beneath it holds one PLOTTED development — Udumalaipet, 400
cents / 60 plots. Jamin has not built these houses and this is a render of
nowhere. The standing rule therefore binds harder here than on any other hero,
and it is now enforced by construction rather than by discipline: the page no
longer passes `photo`, and an `art` is always `alt=""` + `aria-hidden`. It must
never gain a caption, a location or a project name. Restoring the photograph is
a two-line revert and the `secondaryImage` path is still live on /projects.

⚠️ **`artPosition="right"`, for the OPPOSITE reason to hero-31/33.** Their board
is at the far left and the anchor moves it out of `hero-fade`. hero-40's wall is
at the far right, and the box shows 54% of the source, so a `left` anchor would
slice the wall — the artefact hero-33 was trimmed to avoid.

⚠️ **IT MOVED THE PLATE, 0.26 -> 0.42, AND THAT IS THE PAIR RULE FOR THE FOURTH
TIME.** `rj-gilt-light-sheer` goes transparent at 1440; hero-31/33's overlap
strip there is a pale faded edge, hero-40's is dark tarmac. The lead paragraph
(20.35px regular, so AA is 4.5 and not the large-text 3.0) measured **4.02 at
the darkest pixel** on the inherited value. Swept on the built page at 1440,
compositing the served rendition through `hero-fade`'s mask and then the tint:

    0.26 -> lead 4.02 · h1 7.09   <- inherited, fails
    0.34 -> lead 4.56 · h1 7.96   <- the floor, by 0.06
    0.42 -> lead 5.06 · h1 8.88   <- ships
    0.74 -> lead 7.64 · h1 13.11  <- the opaque plate

⚠️ On the `paper` tone the LEAD binds, not the eyebrow. The eyebrow sits left of
the 58% band at every width and never touches the picture — 7.52 at every step
of that sweep. That is the reverse of the cinematic tone, where the small gold
eyebrow binds every time.

⚠️ Applying the mask is not optional in that measurement: without it the same
lead reads 1.01, because the whole overlap sits inside `hero-fade`'s
transparent leftmost 22%.

## hero-38 -> /locations/erode · hero-39 -> /locations/tiruppur (2026-08-13)

Owner-supplied, replacing hero-34 and hero-36 the day after they shipped. Salem
keeps hero-35 and Coimbatore keeps hero-17, so the district set is now three
pictures from two different shoots. Untrimmed:

| id | native | widths (KB) | subject |
|---|---|---|---|
| hero-38 | 1921x819 | 768 / 1280 / 1921 (66 / 163 / 308) | palm avenue and formed roads, a backhoe at work, a woman planting a bed, the JAMIN BAZAAR hoarding at the right |
| hero-39 | 1881x836 | 768 / 1280 / 1881 (65 / 169 / 320) | timber-and-stone entrance wall with the JAMIN BAZAAR lockup, gardeners planting, a roller and an excavator on the unmade road at the right |

WARNING: THEY ARE A DIFFERENT SHOOT FROM 34/35/36 AND WERE SWEPT AS ONE. That
register entry ends "if a district frame is ever swapped for one from a
different shoot, sweep it on its own", and this is that case. The value did not
move — `SHEER_ALPHA` is still 0.52 — but it is now held by a measurement of
these frames rather than by inheritance. The full table is in
`src/app/locations/[district]/page.tsx`; the short version is that the new
frames are hazier and flatter, so they read lower at p95 and HIGHER at the worst
pixel (hero-38 4.56 at 1024 against hero-34's 4.53), and the worst pixel is what
binds. **A picture and its `sheerAlpha` are one change, not two** — that rule
held here even though the answer came back unchanged.

⚠️ **Neither needs a trim, and the swap RETIRES two trims.** hero-34 was cut at
source x 1422 to lose a "ROYAL CHETTINADU ENCLAVE" plaque — a development name
not in the catalogue, on the page whose job is to list the catalogue — and both
34 and 36 also bake a "PLOT 125" plaque into the marble. Every one of those
goes with the picture; the only baked words left on 38 and 39 are the brand's
own lockup. That makes these the lowest-risk frames the district pages have
carried, and it is why they are exported at full native width.

⚠️ Same standing rule as everything else in this folder, and it binds hard here
because both frames are drawn to look like documentary evidence of work in
progress, exactly as hero-21 is: `alt=""`, `aria-hidden`, never a caption, never
a location, never a project name, never on a property card or in a gallery.

⚠️ `cinematic`, not `paper`, for the same reason 34/35/36 were: the board sits
in the left half of hero-39 and `paper` fades its leftmost 22% — the mistake
hero-31 and hero-33 already paid for. The copy plate does sit over hero-39's
lockup; the sign reads through the sheer tint, which is the treatment working.

hero-34 and hero-36 return to the spare pile. hero-35 is untouched.

## hero-37 -> /properties (2026-08-12)

Owner-supplied aerial of the gate and the layout beyond it. 1916x821 native ->
1916 / 1280 / 768 WebP (340 / 177 / 69 KB). Replaces hero-17.

WARNING: hero-17 IS NOT FREED. It remains DEFAULT_ART for a district page with
no art of its own, which today means /locations/coimbatore — the owner asked for
Coimbatore's hero to stay as it was. Do not reassign 17 without checking
ART_BY_DISTRICT.

WARNING: the plate is 0.52 here, against hero-17's 0.12. hero-17 was a trimmed
banner, dark exactly where the copy sits; this is an aerial under a bright sky.
Gold eyebrow, worst pixel, at the widths where the photograph is genuinely
behind the copy:

    a0.12 -> 1280 2.20                <- hero-17's value
    a0.42 -> 1024 3.10 · 1280 4.36
    a0.52 -> 1024 4.17 · 1280 5.64    <- ships
    a0.56 -> 1024 4.72 · 1280 6.28

1024 BINDS, NOT 375 — see the correction under hero-34/35/36 above.

## The homepage "purpose" picture (2026-08-12)

`public/section/purpose-gate-960.webp` / `-1440.webp`, owner-supplied, replacing
`purpose-1857.webp` in `PurposeExplorer`.

WARNING: a NEW FILENAME, not a new file at the old path. `next/image` keys its
optimised output by source path, so overwriting purpose-1857.webp would let a
warm build keep serving the old picture from a deploy that looks correct. Same
trap recorded against hero-27. purpose-1857 is left in place, unused.

## hero-46..54 — the JAMIN CITY set (2026-08-17, CARTOUCHE revamp)

Owner-supplied ("Jamin city" folder in Downloads): nine gated-entrance renders
of named Jamin Bazaar communities. No trims; q82 WebP at 768/1280/native.

| id | source | native | assigned |
|---|---|---|---|
| 46 | trident.png — JAMIN TRIDENT, red trident roofline at dusk | 1773x887 | homepage (Hero.tsx ART) |
| 47 | metropolis.png — JAMIN METROPOLIS gate | 1716x916 | /properties, a0.58 |
| 48 | 2.png — the arc gate at sunset | 1823x863 | /locations/coimbatore, a0.58 |
| 49 | 1.png — JAMIN NEXUS RESIDENCY arch (subject CENTRED) | 1672x941 | /locations/erode, a0.52 |
| 50 | …01_13_39 — JAMIN CITY OF DREAMS | 1672x941 | /about, a0.58 |
| 51 | …01_18_11 — JAMIN DAYDREAMER RESIDENCY | 1672x941 | /journal, a0.58 |
| 52 | …01_24_30 — modern slat gate | 1672x941 | /contact (paper, a0.42) |
| 53 | …01_27_08 — stone-pillar gate | 1774x887 | **spare** — lockup sits where paper's fade would cut it (the hero-31/33 lesson) |
| 54 | …01_32_33 — brick-and-white gate | 1672x941 | **spare** — lockup dead centre, fights every copy position |

⚠️ **Every frame names a community that is NOT in the catalogue** (Trident,
Metropolis, Nexus, City of Dreams, Daydreamer). The standing rule binds at
hero-19 strength: `alt=""`, `aria-hidden`, never a caption, never a location,
never on a property card. The owner supplied them for the CARTOUCHE revamp
with that on the table.

⚠️ **Alphas were swept comparatively, not inherited** (the pair rule):
against audited hero-38 at the same geometry, hero-49 reads at or above the
audited figure at 0.52; 47/48/50/51 read p95 4.1–4.6 there and take **0.58**.
/journal's 0.08 belonged to the BANYAN (hero-43) and would have shipped a
failure invisibly — the exact trap the hero-27 entry documents. /contact's
paper plate went 0.26 → 0.42, the audited hero-40 value.

Displaced to the spare pile: 37 (/properties), 19 (/about), 43 (/journal),
21 (/contact), 20 (homepage banner — its trim notes stay in Hero.tsx), 38
(Erode), 17 (now a true default for an artless future district). Salem and
Tiruppur KEEP 44/45 — the board-right mirrors from the owner's own report the
same morning.

## hero-44 -> /locations/salem · hero-45 -> /locations/tiruppur (2026-08-17)

MIRRORED cuts of hero-35 and hero-39, made for the owner's report asking for
"text left, entrance board right, with a clear gap" on the district heroes.
Both source frames bake the JAMIN BAZAAR board into the LEFT of the picture —
exactly where the cinematic copy plate sits — and both are width-bound in the
hero box at every desktop width, so `object-position` has ZERO horizontal
travel: no CSS could move the board a pixel. The hero-28 mirror precedent
almost applied, except that these frames carry readable text, which a plain
flip reverses.

So the flip is done with the text put back:

- **hero-44** (from hero-35, 1774x887): the sign panel (logo + wordmark +
  "signature for Fortune") is restored by a feathered rect re-flip; the
  "PLOT 118 - 125" plaque is at a real angle, so its original quad is
  perspective-warped onto the mirrored quad (a rect re-flip left sloped ghost
  text); the small yellow "118" kerb marker is a tiny rect re-flip.
- **hero-45** (from hero-39, 1881x836): one feathered rect re-flip around the
  lockup on the timber wall. The horizontal wood grain hides the seam.

WARNING: `SHEER_ALPHA` was re-checked, not inherited — a mirror changes what
sits under the plate, which is the pair rule. By the comparative method this
file allows (same assumed geometry, original vs mirror): hero-44 within 0.02
of the audited hero-35 at every step; hero-45 within 0.11 at the worst pixel
and 0.25 at p95 of hero-39 — inside the 0.3 spread the district entry already
accepts. 0.52 stands.

WARNING: regenerate from the hero-35/39 renditions with the scripts recorded
in the session that made them, never by flipping alone — a plain flip mirrors
the wordmark, the plaque and the marker. 35 and 39 stay on disk as sources
(35 was live on Salem until this change; 39 on Tiruppur).

The plate no longer covers the board on either page, which also retires the
"the sign reads through the sheer plate" note as the thing making the overlap
acceptable — there is no overlap left to excuse.

## hero-43 -> /journal (2026-08-15), and the lightest plate on the site

Owner-supplied, replacing hero-41 the day after it shipped. Untrimmed — the only
baked words are the brand's own lockup on the signboard, so the same rule that
made 38/39 low-risk applies here.

| id | native | widths (KB) | subject |
|---|---|---|---|
| hero-43 | 1790x879 | 768 / 1280 / 1790 (69 / 189 / 316) | a wet forest platform under a banyan, railway track running to a misty vanishing point, a lone walking figure, the **JAMIN BAZAAR** signboard at the right |

**It is the darkest frame in the register, and that is the point.** Under the
plate's own footprint it measures a raw mean of rgb(20,47,30), against hero-41's
sunlit meadow. The owner asked for the plate "see-through to the max"; that
request was grantable here and would have been refused on hero-41, which put a
lit signboard and a bright horizon directly under the copy. `sheerAlpha` went
**0.44 -> 0.08**, 5.5x lighter and below the utility's own 0.14 default.

WARNING: THE p95 THIS REPO NORMALLY MEASURES BY SAYS 0.00 IS FINE. IT IS NOT.
The mist at the vanishing point is a bright BANK rather than the specular
pinpricks p95 exists to discount, and it lands under the plate's inner edge.
1.38% of the footprint sits above the 4.5 limit with the tint removed — an area
a reader would actually meet. Swept at p99 across five viewports:

    0.00 -> 4.23 worst   fails
    0.04 -> 4.49 worst   fails by 0.01
    0.08 -> 4.77 worst   ships, 0.27 of margin

**Which statistic binds is a property of the frame, not of the repo.** A frame
whose bright pixels form a region needs p99; one whose bright pixels are
scattered highlights is correctly judged at p95. Read the picture before
choosing. Full table in `src/app/journal/page.tsx`.

WARNING: the /journal lead dropped from three paragraphs to one line in the same
change, which makes the PLATE about 140px shorter and therefore moves it up over
different pixels. The sweep above is measured on the SHORT plate. Growing that
copy back is a re-sweep, not a copy edit.

## hero-73 — the avenue gate at sunset (/compare, 2026-08-18)

Owner-supplied ("Jamin city" folder, ChatGPT Image Aug 18 12:38). The JAMIN
BAZAAR avenue gate after rain at sunset: lockup on the arch top-centre, a guard
at the left pillar, wet road reflecting the golden sky, sun low at right.
1672x941, renditions 768/1280/1672 at WebP q80, no trim.

Replaces hero-6 (the dart-board graphic render) on /compare, and the page moves
`paper` → `cinematic` with it — this is a photographic-range frame, not a
white-ground render. Alpha swept comparatively against audited hero-38 at the
/compare standard-height plate geometry: p95 luminance 0.783 vs 38's 0.604, so
it takes 0.58 (the bright-daylight figure), not 0.52.

⚠️ It carries the brand lockup on the arch, so the standing rule binds at
hero-19 strength: `alt=""`, `aria-hidden`, never a caption, never on a property
card. hero-6 stays on disk and in the register.

## hero-74 — the survey-desk flat-lay v1 (/journal, 2026-08-18) — WITHDRAWN

The first flat-lay laid the two REAL Edappadi sheets (`edappadi-sheet-1260` at
+4.5° behind, `edappadi-illustrated-2-1055` at −3.5° in front) on the same
ground the recipe below describes. Owner replaced both sheets the same evening
("Replace those two layouts with the attached"), so the renditions are DELETED
and the id is retired — see hero-80. The id moved rather than the file being
regenerated in place because `next/image` and the CDN both key on the path,
and a same-name swap serves the old picture to anyone who has it cached.

## hero-80 — the survey-desk flat-lay v2 (/journal, 2026-08-18 16:05)

COMPOSED IN-REPO from two OWNER-ATTACHED sheets, replacing hero-74:

- BEHIND, +4.5°, height 800px, centred at (1010, 465): the **JAMIN GARDEN —
  Premium Plotted Development** masterplan poster (Studio Village / Workshops
  & Fab Labs / Creative Academy). ⚠️ A CONCEPT sheet, not a record of a
  catalogue project.
- IN FRONT, −3.5°, height 830px, centred at (1330, 485): the **61-unit
  illustrated JAMIN GARDEN plan** (Perungulam, 2.31 acres).

Ground and finish are unchanged from v1: near-white warm paper (250,246,240),
a faint 76px setting-out grid in (238,233,225), each sheet wearing a 10px
paper margin then a 2px stone (168,160,148) hairline, and a gaussian shadow
(blur 18, offset +14/+20, alpha 60) cast from the rotated silhouette. Canvas
1672×941; renditions 768/1280/1672 at WebP q82. Subject occupies the right
two-thirds; the left third stays calm ground for `paper`'s copy plate.

Rebuild: PIL, `sheet()` → resize to target height, `ImageOps.expand` twice for
the margin and hairline; `place()` → rotate expand-true, paste blurred
silhouette shadow, paste sheet. Same script as v1 with the two inputs swapped.

PAPER family (near-white ground → multiply prints it into the sand page), so
no alpha sweep. Decoration only: `alt=""`, `aria-hidden`, no caption — and the
concept masterplan is covered by the site-wide "creative representation only"
line the footer now carries. hero-55 (bougainvillea pergola) stays SPARE.

## hero-75 — JAMIN SOULFUL in daylight (/compare, 2026-08-18 13:00)

Owner-supplied ("Jamin city", ChatGPT Image Aug 18 01:00 PM). The SOULFUL
gate at midday: lockup top-centre, guard booth left, "Welcome to a Life Well
Planned" plinth right. 1774x887, renditions 768/1280/1774 q80. Replaces
hero-73 on /compare the same day it shipped (owner's ask); 73 → SPARES.
Named community not in the catalogue → standing rule at full strength.
Swept vs hero-38 at /compare standard geometry: p95 0.711 vs 0.604 → 0.58.

## hero-76 / hero-77 — the sign-in gate and the Trichy Tulip gate (2026-08-18)

hero-76 ("Premium Villas, Chennai" gate, 12:58 supply, 1672x940) is the
SIGN-IN page's content-card art — registered as renditions only, no PageHero
id. hero-77 ("Tulip 1.png", 14:00 supply, 1774x887) → /ta's cinematic hero;
swept p95 0.864 vs hero-38's 0.604 → 0.58. Both name places/communities not
in the catalogue: standing rule at full strength.

## hero-67 → /faq (2026-08-18, owner's swap)

The JAMIN CROWN gate joins the PageHero register (it had only been the home
track-record mini hero's direct image). Now ALSO /faq's cinematic hero at
0.52 (swept: p95 0.563 vs hero-38's 0.604 — darker). Deliberate two-surface
reuse under the hero-39/72 precedent. hero-73 (sunset gate) → SPARES.

## hero-78 / hero-79 — the living day grows to five bands (2026-08-18 evening)

hero-78 = JAMIN DEWDROPS ("Morning.png", 1774x887): sunrise mist, joggers,
butterflies — the DAWN band (05–08 IST). hero-79 = JAMIN DREAMERS
("midnight.png", 1840x854): full moon over the lit plotted layout — the
MIDNIGHT band (23–05 IST). Both live ONLY in LivingHeroArt's register (like
hero-61, no PageHero id). No alpha sweep needed — the home plate is the sand
0.62 card, safe over any frame (worked in LivingHeroArt's header).
⚠️ "evening.png" from the same batch is deliberately UNUSED — the owner kept
hero-61 as dusk; it waits in Downloads as a spare. Standing rule on both:
named communities, alt="", aria-hidden, never a caption.

## hero-81 — JAMIN GRAND at dusk (/projects, 2026-08-19, owner's swap)

Owner-supplied as `kl.png`, 1672x941 — the register's common geometry, so the
ladder is the existing 768/1280/1672 at q80 with no crop or letterbox.

Replaces **hero-69** on /projects: the same named community, a later hour and a
much closer stand. hero-69 saw the entrance across a lawn from the roundabout;
this one stands in the avenue itself, gate open, family walking in. hero-69 →
**SPARES** (it keeps its ids and renditions).

⚠️ **It ships with `artPosition="right"`, and that is not a taste call.** Both
frames carry the JAMIN BAZAAR lockup baked in, on opposite sides: hero-69 on the
LEFT of an arch, hero-81 on a plinth at the FAR RIGHT. The paper hero's art box
is 58% of the viewport under `object-cover`, so it crops from whichever edge
`objectPosition` does not anchor. Simulated at 1440x800 before shipping — box
835x620, frame scales to 1101 wide, 266px discarded — and at the default `left`
those 266px are exactly the plinth: the mark came out sliced down the middle.
At `right` the lockup and the JAMIN GRAND plaque are whole, and the edge
`hero-fade` dissolves is empty road, which is the best thing that mask can be
given.

⚠️ **No alpha sweep**, because /projects is `paper` and paper carries no plate —
nothing overlays the render. This is the same reason hero-69's cinematic sweep
numbers (0.34 photograph, 0.58 Grand) were retired when the page moved to
`paper` on 2026-08-18. Put the page back on `cinematic` and this frame needs
sweeping first.

Standing rule at full strength — names a community not in the catalogue:
`alt=""`, `aria-hidden`, never a caption.

## hero-65 RETOUCHED — "JAMIN MONARCH" removed from the board (2026-08-19)

Report 8: "the entrance gate currently displays both Jamin Monarch and Jamin
Bazaar, which makes the branding overlapped with the text on the image… remove
'Jamin Monarch' completely from the gate board."

The gold lettering is **painted out of the source**, not hidden by framing —
there is no crop that removes it and keeps the gate. All three renditions were
regenerated from the retouched 1672 master; the originals are in git history at
`87dd21e` if the frame is ever re-supplied.

**How, in case it has to be repeated.** The board face is a smooth cream with a
slow vertical gradient, which is the one condition under which per-column
vertical interpolation reconstructs a surface convincingly. The letters sit on a
slanted baseline (the beam is in perspective), measured off a 3× gridded crop:

    top of caps    y = 248 − 0.131 · (x − 945)
    bottom of caps y = 287 − 0.131 · (x − 945)      x from 934 to 1330

⚠️ **The donor rows are searched for, not assumed.** A fixed margin above the
band walks into the top lip's warm shadow at the right-hand end, where the face
is much shallower — that is what left the final "H" standing on the first pass
(34 columns skipped). Each column now searches outward for genuinely cream
pixels, any column that still fails inherits a donor interpolated from its
neighbours, and only the fill itself is feathered, through a soft mask. Blurring
a rectangular band instead leaves the band's own edges visible.

⚠️ **THE LOCKUP WAS NOT MOVED, and the report asked for it** ("position the Jamin
Bazaar branding slightly right of the visual center"). It was attempted and
withdrawn: on a perspective surface the move is three transforms — right, up
along the −0.131 baseline, and ~3% larger because the right of the board is
nearer the camera — and the erase left behind is 108px tall, spanning the lit
top and the shaded lower face, which vertical interpolation cannot reconstruct.
The result was a pale striped rectangle where the mark used to be. That needs a
re-render or content-aware fill, not PIL. The lockup currently sits at 49% of
the frame's width — near centre, slightly left of the board's own centre.

⚠️ Framing cannot deliver it either: at 1440 the hero shows the full frame width
(visible X 0–100%), so there is no horizontal crop to steer.

## hero-83 — the JAMIN GEMSTONE gate (2026-08-20)

Owner-supplied `gem.png` (1672x941, Downloads), report-10 round: "swap the hero
image with the attached" → `/projects/ongoing`, replacing hero-65 (JAMIN
MONARCH), which returns to SPARES with its renditions intact.

A daylight avenue gate: flat concrete beam across the top, planted verges, the
JAMIN GEMSTONE lockup on a plaque on the RIGHT pier wall — clear of the 38rem
copy plate, reading through `sheerEdge`. Renditions 768/1280/1672 webp built
with PIL (LANCZOS, quality 82, method 6).

Swept comparatively vs audited hero-38 at the ongoing full-height geometry:
plate-footprint p95 luminance **0.548** against 38's 0.604 — darker, so it
holds **0.52**, the same figure hero-65 held; the caller's alpha did not move.
Vertical anchor `50% 14%` re-checked against this frame (beam ~15–30%, plaque
~45–62% of frame height; worst-case 500px box shows 5.3%–67%) — both stay in
shot. Names a community not in the catalogue → standing rule at full strength:
alt="", aria-hidden, never a caption.

## hero-84 — the JAMIN JADE CITY gate (2026-08-21)

Owner-supplied in chat, this round: "Book a site visit page, swap the hero image
with the attached" -> `/contact`, replacing hero-72 (the golden-hour gate walk),
which returns to SPARES with its renditions intact.

Full daylight: the boom up, a car and two residents walking in past the guard
post, villas and the avenue running back, and "Welcome to a Life Well Planned"
carved into the right wall. It keeps what report 14 asked hero-72 to provide - a
frame whose subject is ARRIVING at a development rather than a generic gate -
and states it at the hour a site visit actually happens. Renditions 768/1280/1774
webp built with PIL (LANCZOS, quality 80, method 6).

**1774x887, a 2:1 frame** - the same geometry as hero-82, so this is one of the
two widest in the register.

⚠️ THE ANCHOR AND THE FADE BOTH MOVED, AND THE 2:1 RATIO IS WHY. hero-72 was
1.5:1 in the 829x554 contact box, so it was WIDTH-bound and `artPosition` had
zero travel. At 2:1 `cover` renders 1108x554 and there are **279px of horizontal
travel**. All three anchors were rendered at the real box size: `left` cuts
"CITY" off the right edge, `right` amputates the arch's left pillar, `center`
keeps the whole arch, the whole lockup and the Welcome wall. Centre it is.

⚠️ IT NEEDS THE WIDE `hero-fade`, NOT `softFade`, AND RAISING THE PLATE ALPHA
WOULD HAVE MADE IT WORSE. The h1 runs to screen 688 and the art box starts at
601, so ~88px of "Book a site visit" sits over the picture; under this frame
that strip is deep tree shade. Sampled composite: darkest backdrop under the
title rgb(34,31,6) against heading ink rgb(27,23,18) = **1.0** - invisible.
The plate is `rgba(16,14,12,a)`, a DARKENING tint, so it rescues light copy on a
bright frame and does the opposite here; measured at 0.42 / 0.55 / 0.68, still
1.0 at all three. `hero-fade`'s 22% knee lands at 182px, putting the whole
overlap inside the dissolve - title on cream, 95px of clearance. Nothing
readable is lost: the red logo chip starts at 270px in this crop and the cream
arch runs to 727px, so the fade eats foliage and part of the left pillar only.

Phone band re-checked at 375px: 375x188, ratio 2.0 against the source's 2.005,
`object-fit: contain` - **letterboxed, not cropped**, and no copy overlaps it.
Both breakpoints swept, per the standing two-sweep rule.

Names a community not in the catalogue -> standing rule at full strength:
alt="", aria-hidden, never a caption.
