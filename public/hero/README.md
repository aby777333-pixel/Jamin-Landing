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
| hero-05 | jamin img5.png | 1823x863 | 1823, 1280, 768 | wireframe resolving into a house | homepage, "How a Jamin plot happens" |
| hero-06 | jamin img 6.png | 1672x941 | 1672, 1280, 768 | dart in a target between blocks | /compare |
| hero-07 | jamin img 7.png | 1672x941 | 1672, 1280, 768 | skyline, half drawn half built | /downloads |
| hero-11 | jamin img13.png | 1720x914 | 1720, 1280, 768 | golden key over hillside villas | /projects/current |
| hero-12 | jamin img 15.png | 1672x941 | 1672, 1280, 768 | plot with a wireframe house and a NOW dial | /account/sign-in |
| hero-13 | jamin img 16.png | 1672x941 | 1672, 1280, 768 | aerial plot with a red pin, green fields | **unassigned — spare** |
| hero-14 | cf65435a…jpg | ⚠️ 748x421 | 748, 1280 (upscaled) | tree, boy with umbrella, cattle, paddy | retired — too small |
| hero-15 | view-green-palm-tree…jpg | 3000x2000 | 1920, 1280, 768 | coconut palms over paddy, hills behind | **spare** — was the homepage until 2026-08-09 |
| hero-08 | jamin 8.png | 1672x941 | 1672, 1280, 768 | aircraft trailing a red arc | /projects/future |
| hero-09 | jamin 9.png | 1672x941 | 1672, 1280, 768 | figure walking to a drawn house | **spare** — was /journal until 2026-08-09 |
| hero-18 | ChatGPT Image Aug 9 2026 01_30_24 PM.png | 1672x941 (**no trim**) | 1672, 1280, 768 | boy copying a palm-leaf manuscript at sunset, gopurams behind | /journal (cinematic) |
| hero-10 | jamin 10.png | 1672x941 | 1672, 1280, 768 | red disc over a waterfront | /contact |
| hero-16 | ChatGPT Image Aug 9 2026 12_41_24 PM.png | 1983x793 → **trimmed to 1983x600** | 1983, 1280, 768 | temple-form gateway over a palm-lined road, red sweep at right | homepage |
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

**Three surfaces deliberately use no render at all**, which is what makes the
one-image-per-page arithmetic work — and is what the "brand imagery only" rule
above asks for on pages whose subject is a real project:

| surface | image | why not a render |
|---|---|---|
| /projects | 2nd photo of a development | index of real projects; hero-05 is needed on the homepage, where it literally illustrates "from sanctioned drawing to a plot you stand on" |
| /projects/completed | 2nd photo of the delivered project | its subject IS a delivered project |
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
