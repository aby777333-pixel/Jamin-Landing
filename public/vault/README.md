# /public/vault — artwork register for THE VAULT

Same register discipline as `public/hero/README.md` and `public/section/README.md`.
Ten photographs supplied by the owner on 2026-08-11, converted to WebP at 1200px
wide, q80 — 27.3 MB of PNG down to 1.9 MB.

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

Files: `coastal-and-waterfront`, `mountains-and-nature`,
`land-and-agricultural-estates`, `exceptional-residences`,
`hospitality-and-investment-assets`, `rare-commercial-assets`.

⚠️ **HERITAGE INDIA HAS NO PICTURE.** Six were supplied for seven families.
Heritage does not render through `FamilyBlock` — it has its own feature band
further down `/vault` — so it keeps its drawn plate. Dropping a
`heritage-india` key into `familyImages` will do nothing; the band reads its own
art.

## The rule these images live under

Every one is `alt=""` and `aria-hidden`. They are mood, not inventory: none of
them is a Jamin property, and a caption, a place name or a price beside any of
them would turn atmosphere into a claim about something we are selling. The
Vault's own §13 discretion rule points the same way — this page exists precisely
because some properties may not be shown.

Fallback is the drawn `VaultPlate`, always. Delete a file or empty the settings
row and the page degrades to plates rather than to holes.
