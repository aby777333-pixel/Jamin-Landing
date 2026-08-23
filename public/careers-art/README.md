# Careers imagery

One frame, supplied by the owner 2026-08-23 with the copy for `/careers`.

| file | where | what it is |
|---|---|---|
| `hero-red-tie-1983.webp` | `/careers` → the hero | a column of identical grey robots marching with briefcases, and one man in a red suit walking out of the shadow into the light |

## 🚨 `careers-art`, NOT `careers` — AND IT SHIPPED WRONG FOR TEN MINUTES

The file went into `public/careers/` first, which is a static folder shadowing
a real route. It *worked* — Next serves the route for `/careers` and the file
for `/careers/hero-...webp` — and that is exactly the problem: nothing fails
until somebody drops an `index.html` in there, or until a `netlify.toml` header
glob written as `/careers/*` puts `X-Robots-Tag: noindex` one character away
from the page it is meant to protect. `public/security-art/` carries the same
note for the same reason. **Never name an asset folder after a route.**

## ⚠️ It is a render, and it is safe by being obviously one

Unlike `security-art/gatehouse-dusk`, nothing here could be mistaken for
evidence: it is a stylised illustration of nobody, in no real place, and it
carries no Jamin branding at all. It gets a plain descriptive `alt` and one
light caption. If it is ever swapped for something photoreal — a real office, a
real team — re-read `public/section/README.md` first.

## ⚠️ THE SUBJECT IS ON THE RIGHT AND THE PLATE IS ON THE LEFT

That is the whole composition: the man in red is the point of the picture and
the hero's copy plate is left-anchored, so the two never collide. A future
`artPosition`, a taller `size`, or a re-crop that walks him leftward would put
the plate over the only thing in the frame worth looking at. Check the frame
before touching either.

## One source width

Consumed by `next/image` with `sizes` set, so Next generates its own responsive
set from the single 1983px source. Nothing to hand-cut.
