# Section imagery

Photographs that sit beside a section heading rather than opening a page. They
are NOT heroes and are deliberately not in `public/hero` — that folder has its
own register, its own two tones and its own plate-alpha discipline, and none of
it applies here. Nothing in this folder is rendered by `PageHero`.

Supplied by the owner 2026-08-11. Converted to WebP at three widths; only the
widest is referenced, because `next/image` generates its own responsive set from
it and the other two exist as a source if a layout ever needs them.

| file | where | what it is |
|---|---|---|
| `purpose-gate-*.webp` | homepage → "Find the right plot for your purpose" | the gate, owner-supplied 2026-08-12 |
| `where-we-build-gate-*.webp` | homepage → "Find land near you" | a Jamin entrance wall, gardeners planting, a roller and a backhoe on the unmade road — owner-supplied 2026-08-13 |
| `purpose-*.webp` | — | UNUSED. A plotted layout at golden hour, replaced 2026-08-12 |
| `where-we-build-*.webp` | — | UNUSED. Paddy under a low sun with a house in it, replaced 2026-08-13 |
| `why-jamin-rubycon-wide-1672.webp` | homepage → "Eight things you can check before you believe us" | the JAMIN RUBYCON poster, LANDSCAPE cut, owner-supplied 2026-08-22 |
| `why-jamin-rubycon-1024.webp` | — | UNUSED. The portrait cut of the same poster, replaced 2026-08-22 |

## ⚠️ A REPLACEMENT GETS A NEW FILENAME, NEVER THE OLD PATH

`next/image` keys its optimised output by source path, so overwriting a file in
place lets a warm build keep serving the old picture from a deploy that looks
correct. Both swaps above are therefore new names beside the originals, and the
originals stay in the folder unused rather than being deleted.

## ⚠️ `where-we-build-gate` IS ALSO hero-39, ON /locations/tiruppur

The first time one picture carries two surfaces. `public/hero/README.md` opens
with "one image per page — no render appears twice", and this is a deliberate
exception the owner made on 2026-08-13 with the frame already live on the
district page. It is not a licence to reuse frames generally: if it ever reads
as a repeat, hero-36 is in the spare pile, already swept at the same 0.52, and
gives Tiruppur its own picture back in one line.

⚠️ It also raises the provenance risk in this slot rather than leaving it where
the paddy had it — see below. The frame carries the JAMIN BAZAAR lockup and
looks like documentary evidence of a site under construction.

## 🚨 BRAND IMAGERY, AND THE RULE BITES HARDER HERE THAN ON A HERO

Both are renders of NOWHERE. Neither is a Jamin project.

That matters more in these two slots than it does on a hero, because of what
each one sits directly above:

- `purpose` sits above four cards that link to real Jamin developments, and it
  depicts exactly what those developments are — a formed, plotted layout. A
  reader could take it for one of them in a heartbeat.
- `where-we-build` sits above a map of real Jamin sites with real pins on it,
  and since 2026-08-13 the frame in that slot **names itself** — the JAMIN
  BAZAAR lockup is in shot, with workers, a roller and a backhoe around it. It
  is the strongest provenance case in this folder and the same standing as
  hero-19 and hero-21: it is a render, it is drawn to look like evidence, and it
  sits one scroll above a map of places that really exist.

So: `alt=""`, `aria-hidden="true"`, and **never a caption, a project name or a
location**. If either is ever wanted with words attached, the words have to come
with a photograph of a real project from Supabase storage — not with these.

Both are `hidden lg:block`: below `lg` the copy column is full width and there
is no empty half to fill.

## ⚠️ `why-jamin-rubycon` IS THE ONLY RENDER IN THIS FOLDER, AND IT IS A POSTER

Every other file here is a photograph. This one is marketing artwork with a
wordmark, a project name and three claims baked into the pixels, and it sits
beside the six trust points — the section whose whole argument is "check us
rather than believe us". It replaced an admin-uploaded photograph of a real
development on the owner's instruction, 2026-08-22 ("swap that image with the
attached"). The reasoning, and what to reconsider if Rubycon later reaches the
catalogue, is written at the call site in `src/app/page.tsx`.

Two practical consequences:

- **It is 1024x1536 (2:3) and the box is `aspect-[2/3]` to match.** The box it
  inherited was `aspect-[4/5]`, which under `object-cover` would have cropped
  the wordmark off the top and the closing line off the bottom. If the artwork
  is ever replaced at a different ratio, change the box with it.
- **It is hard-coded, so it does NOT follow the admin console.** The picture it
  replaced came from `secondaryImage()` and changed whenever the admin uploaded
  a new one. This will not.

## ⚠️ The Rubycon plate went portrait → landscape on the same day

`why-jamin-rubycon-1024.webp` (1024x1536, 2:3) was live for a few hours and is
kept, unused, under the new-filename rule at the top of this file. The owner
supplied a 16:9 cut — `why-jamin-rubycon-wide-1672.webp`, 1672x941 — with the
instruction "Swap and widen the Image".

The reason this mattered for more than taste: report 16 asked for the section to
be shorter AND for the image to sit beside the heading. While the artwork was
2:3 its width *was* its height, so those two goals fought — the only way to
shorten the section was to shrink the picture. Measured at 1280x900:

| | section height | image |
|---|---|---|
| original (image beside 2-up cards) | 1106px | 521x782 |
| report-16 first pass, 22rem column | 1312px | 352x528 |
| report-16 shipped, 16rem column | 1168px | 256x384 |
| landscape cut, 1.2fr column | 1158px | **631x355** |

The landscape image is 2.5x wider than the one it replaced and the section is
marginally shorter — and on a phone the plate drops from 432px tall to 188px.

**The height is now set by the heading column (373px), not the image (355px).**
Widening the column further would make the image the tallest thing in the row
again and start adding height back. That is the ceiling.
