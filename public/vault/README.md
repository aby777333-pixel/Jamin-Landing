# /public/vault — artwork register for THE VAULT

Same register discipline as `public/hero/README.md` and `public/section/README.md`.
Seventeen photographs supplied by the owner on 2026-08-11 and converted to WebP
at q80 — 46 MB of PNG down to 2.8 MB.

## `path/` — the four ways in

Hard-coded in `src/app/vault/page.tsx` (`PATHS`), and deliberately so: the four
intents are **structure**, not data. They are the routes the desk offers, they
map to `?intent=` on the request form, and adding a fifth is a code change with a
form change behind it. There is nothing for the console to edit here.

| file | card |
| --- | --- |
| `buy.webp` | Acquire something exceptional |
| `rent.webp` | Live somewhere extraordinary |
| `sell.webp` | Sell with discretion |
| `lease.webp` | Place your property privately |

## `family/` — the asset families

**Not hard-coded.** These are read from `vault_settings.familyImages` (migration
0084), keyed by the slug `familySlug()` derives from the family name. A family is
a set of `vault_categories` rows, adding one is a console action, so its picture
has to be swappable from the console too — paste a public-bucket URL over the
local path and it changes with no deploy.

1200px wide. Files: `coastal-and-waterfront`, `mountains-and-nature`,
`land-and-agricultural-estates`, `exceptional-residences`,
`hospitality-and-investment-assets`, `rare-commercial-assets`,
`heritage-india`.

`heritage-india` arrived second (0085) and its band now reads the same map as
the other six rather than drawing its own plate. It is a family that gets a
bigger frame, not a different kind of thing — an earlier note here said the key
would do nothing, and that stopped being true when the band was rewired.

## `destination/` — the places

Read from `vault_destinations.image_url`. A destination **is** a row, and the
column already existed, so unlike a family its picture belongs on the row —
delete the place and the picture goes with it.

1000px wide, and the card crops them 4:5 from landscape sources: they are
scenery, so the centre carries the picture. Files: `goa`, `nilgiris`, `coorg`,
`kerala`, `rajasthan`, `alibaug`.

⚠️ **Six of twelve destinations have no picture** — Lonavala, Bengaluru,
Chennai & ECR, Puducherry, Himachal Pradesh and Uttarakhand keep their plates.
Never close that gap by pointing two places at one photograph. These cards sit
in one grid, so the same picture under two names reads as a mistake at best, and
at worst as a claim about somewhere it was not taken.

## The rule these images live under

Every one is `alt=""` and `aria-hidden`. They are mood, not inventory: none of
them is a Jamin property, and a caption, a place name or a price beside any of
them would turn atmosphere into a claim about something we are selling. The
Vault's own §13 discretion rule points the same way — this page exists precisely
because some properties may not be shown.

Fallback is the drawn `VaultPlate`, always. Delete a file or empty the settings
row and the page degrades to plates rather than to holes.
