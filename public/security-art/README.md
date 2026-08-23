# Security imagery

Supplied by the owner 2026-08-23 with the copy for `/security`. Four frames,
all of them **renders** — not one is a photograph of a Jamin development, a
Jamin employee or a Jamin installation.

| file | where | what it is |
|---|---|---|
| `guard-ceiling-1983.webp` | `/security` → the hero | a guard in Jamin red braced across a hallway ceiling between two framed Tanjore-style paintings |
| `camera-night-1080.webp` | `/security` → the 360° Surveillance tab | a bullet camera at night, its ring lit red |
| `sentry-626.webp` | `/security` → the Our People tab | a figure in a dark suit and red tie with a bullet camera for a head |
| `lockup-officer-1981.webp` | `/security` → the closing signature band | the same conceit in Jamin red and yellow, with the JAMIN BAZAAR lockup beside it |

## 🚨 THEY ARE JOKES, AND THAT IS WHAT MAKES THEM SAFE HERE

`public/section/README.md` carries a hard rule: a render that could be mistaken
for evidence gets `alt=""`, `aria-hidden` and **never a caption**. Two of these
frames carry Jamin branding — the guard wears the patch, the officer stands
beside the full lockup — so on that rule alone they would be the highest
provenance risk on the site.

They are not, because none of them is physically possible. A man does not stand
on a ceiling and a security officer does not have a camera for a head. Nobody
reads either frame as documentation of a real installation, which is precisely
why they can be captioned when the `section/` frames cannot.

The safety is in the impossibility, so **do not replace any of these with a
plausible one.** A photorealistic guard at a real-looking Jamin gate, captioned,
is the exact failure `section/README.md` is written to prevent. If a frame here
is ever swapped for something that could be true, the caption has to go with it.

Every caption on the page names the frame as an illustration for the same
reason.

## ⚠️ `sentry-626.webp` IS 626px WIDE AND THAT IS THE WHOLE BUDGET

It arrived at 626x358 — the free-preview width several stock libraries hand
out. It is rendered in a column capped at 320px so it is never upscaled, and it
must not be moved to a wider slot. **Provenance is unconfirmed**; if the owner
cannot show a licence for it, drop the tab's image rather than shrink it
further. The tab reads perfectly well without one.

A fifth frame was supplied and is deliberately **not in this folder**: a white
camera on a red ground, tiled edge to edge with the Adobe Stock watermark and
carrying asset id 500594896. That is an unlicensed comp and cannot ship.

## ⚠️ A REPLACEMENT GETS A NEW FILENAME, NEVER THE OLD PATH

Same rule as `public/section`: `next/image` keys its optimised output by source
path, so overwriting one of these in place lets a warm build keep serving the
old picture from a deploy that looks correct.

## One source width, not three

Unlike `public/hero`, these are consumed by `next/image` with `sizes` set, so
Next generates its own responsive set from the single source. There is nothing
to hand-cut.
