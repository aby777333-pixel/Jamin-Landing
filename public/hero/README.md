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
| hero-01 | jamin img1.png | 1850x850 | 1850, 1280, 768 | villa at sunset, distant skyline | /about (cinematic) |
| hero-02 | jamin im2.png | 1983x793 | 1920, 1280, 768 | family on a terrace over a layout | /properties (cinematic) |
| hero-03 | jamin img3.png | 1720x914 | 1720, 1280, 768 | formed road, plots, first houses | homepage (cinematic) |
| hero-04 | jamin img4.png | 1717x916 | 1717, 1280, 768 | street of houses in mist | /projects/ongoing |
| hero-05 | jamin img5.png | 1823x863 | 1823, 1280, 768 | wireframe resolving into a house | homepage, "How a Jamin plot happens" |
| hero-06 | jamin img 6.png | 1672x941 | 1672, 1280, 768 | dart in a target between blocks | /compare |
| hero-07 | jamin img 7.png | 1672x941 | 1672, 1280, 768 | skyline, half drawn half built | /downloads |
| hero-11 | jamin img13.png | 1720x914 | 1720, 1280, 768 | golden key over hillside villas | /projects/current |
| hero-12 | jamin img 15.png | 1672x941 | 1672, 1280, 768 | plot with a wireframe house and a NOW dial | /account/sign-in |
| hero-13 | jamin img 16.png | 1672x941 | 1672, 1280, 768 | aerial plot with a red location pin | **unassigned — spare** |
| hero-08 | jamin 8.png | 1672x941 | 1672, 1280, 768 | aircraft trailing a red arc | /projects/future |
| hero-09 | jamin 9.png | 1672x941 | 1672, 1280, 768 | figure walking to a drawn house | /journal |
| hero-10 | jamin 10.png | 1672x941 | 1672, 1280, 768 | red disc over a waterfront | /contact |

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
- **hero-13 is spare.** The first genuine spare this set has had. Any new page
  that opens with a `PageHero` should take it rather than reuse an id — and
  once it is gone, new artwork is needed again.
