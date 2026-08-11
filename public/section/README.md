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
| `purpose-*.webp` | homepage → "Find the right plot for your purpose" | a plotted layout at golden hour: formed roads, kerbs, street lights, plots marked out |
| `where-we-build-*.webp` | homepage → "Find land near you" | paddy under a low sun, a house in the middle of it |

## 🚨 BRAND IMAGERY, AND THE RULE BITES HARDER HERE THAN ON A HERO

Both are renders of NOWHERE. Neither is a Jamin project.

That matters more in these two slots than it does on a hero, because of what
each one sits directly above:

- `purpose` sits above four cards that link to real Jamin developments, and it
  depicts exactly what those developments are — a formed, plotted layout. A
  reader could take it for one of them in a heartbeat.
- `where-we-build` sits above a map of real Jamin sites with real pins on it.

So: `alt=""`, `aria-hidden="true"`, and **never a caption, a project name or a
location**. If either is ever wanted with words attached, the words have to come
with a photograph of a real project from Supabase storage — not with these.

Both are `hidden lg:block`: below `lg` the copy column is full width and there
is no empty half to fill.
