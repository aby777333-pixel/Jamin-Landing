# Jamin Bazaar — Phase 1 Audit & Feature-Parity Inventory

Produced before any rebuild work, per the master brief's closing instruction:
*"Before writing the new homepage, inspect the APK, existing website code,
existing backend and database. Build the feature-parity inventory first."*

Date of audit: 2026-08-07. Nothing in this document changes production.

---

## 0. The single most important finding

**There are three Jamin Bazaar web codebases, not one. Two of them are real,
and one of them cannot be adopted without forking the business.**

| # | Codebase | Stack | Data | Auth | Status |
|---|---|---|---|---|---|
| A | `JAMINDAR 2026` → Expo **web export** | React Native / expo-router | Supabase `zmxqozvivdluuxvvcegs` | Supabase auth (OTP) | **LIVE** at `merry-begonia-4c3cd1`. Same code as the APK. 57 screens. |
| B | `jamin-website` | **Next.js 16 + Supabase** | Same Supabase, **read-only** | none yet (public site) | **LIVE** at `jamin-properties-web.netlify.app`. 13 routes pre-rendered, hourly ISR. Increment 1 shipped 2026-08-04. |
| C | `Premium_Real_Estate_Website.zip` | Next.js + **Prisma + NextAuth + AWS S3 + AbacusAI** | **Its own PostgreSQL database** | **Its own NextAuth user table** | Supplied 2026-08-07. Never deployed. **Zero references to Supabase anywhere in the codebase.** |

The brief describes C as *"the current/previous website files"*. It is not.
The current website is B. C is a separately generated product that has never
been connected to Jamin Bazaar's data.

### Why C cannot be adopted as-is

Verified by reading its own files, not by assumption:

- `prisma/schema.prisma` declares **25 models** — `User`, `Profile`,
  `Property`, `Project`, `Promoter`, `PromoterLead`, `KycSubmission`,
  `Booking`, `Withdrawal`, `Wishlist`, `SiteVisit`, `Enquiry`,
  `CommunityPost`… — a complete parallel copy of the domain that already
  exists in Supabase.
- `datasource db { provider = "postgresql"; url = env("DATABASE_URL") }` —
  a **different database**.
- `app/api/auth/[...nextauth]/route.ts` — a **different auth system**, with its
  own `Role` enum (`BUYER / PROMOTER / ADMIN / SUPER_ADMIN / EDITOR / WRITER /
  SALES / SUPPORT`).
- Storage is **AWS S3** (`AWS_BUCKET_NAME`), not Supabase Storage.
- The AI is **AbacusAI** (`ABACUSAI_API_KEY`), not the Sarvam-backed
  `jamindar-voice` edge function.
- `grep -ril supabase` across the whole project returns **nothing**.

Adopting C would mean every real buyer, promoter and super-admin in
`zhttps`-hosted `zmxqozvivdluuxvvcegs` — with their `JA######` member codes,
`JA-P-####` partner codes, `JA-REF-#####` referral codes, KYC records,
referral events, plot holds and commission ledger — **does not exist on the
website**. They would have to register again, and promoter attribution and
commissions would silently break.

That directly contradicts five of the brief's own rules: §5 (single source of
truth), §73 (do not casually alter production schemas), §74 (real data only),
§103 (preserve search equity), §110 (do not rewrite working business logic).

**C is still valuable — as design material.** 132 `.tsx` files, a 53-route
information architecture that matches the brief closely, a shadcn/ui component
set and a `STYLE_GUIDE.md`. The recommendation is to **harvest its UI, layouts
and IA into B, and discard its data layer entirely.**

### ⚠️ Security: rotate these now

`Premium_Real_Estate_Website.zip` ships a committed `.env` containing
real-looking values. Values were classified by length/pattern and **were not
printed or stored anywhere**:

| Key | Assessment |
|---|---|
| `DATABASE_URL` | 130 chars — real connection string incl. credentials |
| `NEXTAUTH_SECRET` | 32 chars — real |
| `ABACUSAI_API_KEY` | 35 chars — real |
| `AWS_BUCKET_NAME`, `AWS_PROFILE` | real |

The zip has travelled through chat and Downloads. **Rotate the database
password, the AbacusAI key and the NextAuth secret**, regardless of which
direction we take. Per brief §6, none of these may ever reach frontend code.

---

## 1. APK audit — method

The APK does not need decompiling: **its source is the repository**. Auditing
`aby777333-pixel/Jamindar-2026` at commit `70c4908` (= the shipped
`Jamin-Bazaar-1.3.4-15.apk`, versionCode 15) gives a complete and exact feature
inventory, which decompilation could only approximate.

Surface: **57 screens** under `app/`, plus the `public/` static consoles
(`admin.html`, `card.html`, `welcome.html`) and 3 Netlify functions
(`share-page`, `community-page`, brochure `/b/`).

---

## 2. APK → Website feature-parity matrix

Disposition key, per brief §2:
**A** public web · **B** buyer · **C** promoter · **D** seller · **E** admin ·
**F** shared · **G** app-only, needs a web alternative.

### Public / discovery

| App screen | Capability | Disp. | Web status | Action |
|---|---|---|---|---|
| `index.tsx`, `welcome.tsx` | Entry, language gate | A | B has `/` | Rebuild as cinematic homepage (§10, §89) |
| `(tabs)/home.tsx` | Hero slider, phase tiles, For You, verified listings, community teaser | A | partial | Homepage narrative + CMS hero slides |
| `(tabs)/properties.tsx` | Search + filters, `?filters=` deep link | A | `/properties` basic | **Gap:** predictive search, map view, shareable filter URLs (§11–12, §76) |
| `projects.tsx` | Projects grouped by phase (Completed/Ongoing/Upcoming/Future) | A | missing | `/projects`, `/projects/[phase]` |
| `property/[id].tsx` | The richest screen: gallery, video hero, tabs (Overview/Photos/Videos/Master Plan/Amenities/Location/Legal/Investment), plot plan, PlotSheet, brochure, share, compare, visit | A | `/property/[slug]` basic | **Largest single build** (§15) |
| `land-types.tsx` | Property-type browse | A | missing | Category pages |
| `tools/compare.tsx` | Compare up to 3 | A/B | missing | §18 |
| `tools/calculators.tsx` | EMI, eligibility, cost, yield (`lib/calc.ts`, exact) | A | missing | Port `lib/calc.ts` verbatim — it is tested logic (§29) |
| `tools/legal.tsx` | Legal glossary (`lib/legal.ts`) | A | missing | Becomes the Legal Guide (§28) |
| `support.tsx` | Help desk from `platform_contacts.jamin_desk` + FAQ | A | `/contact` partial | Read the same record — never hardcode (§75) |
| — | Blog / Jamin Journal | A | **does not exist anywhere** | Entire §115–183 module |

### Buyer

| App screen | Capability | Disp. | Action |
|---|---|---|---|
| `login/signup/verify/role/profile` | Mobile-OTP auth, referral capture on signup | B | Web auth must use **the same Supabase OTP edge functions** (`send-otp`/`verify-otp`) — not a second auth system |
| `buyer/onboarding.tsx` | Questionnaire → `buyer_preferences` | B | Web form, same tables |
| `buyer/dashboard.tsx` | Buyer home | B | Dashboard shell (§20) |
| `buyer/kyc.tsx` | PAN/Aadhaar/bank + uploads, states not_started→verified, locked preview | B | §21 — **signed URLs only**, never public bucket |
| `saved.tsx` | Favourites (`favorites.buyer_id`) | B | Shortlist (§19) |
| `visits.tsx` | My site visits | B | §96 |
| `notifications.tsx` | Role-filtered notifications | B/F | |
| `messages/*` | Threaded messaging | B/F | |
| `interests.tsx` | Preferences | B | |

### Promoter

| App screen | Capability | Disp. | Action |
|---|---|---|---|
| `become-promoter.tsx`, `role.tsx` | `join_as_promoter()` — role granted on entry | C | Preserve the "a promoter is a promoter" rule exactly |
| `promoter/index.tsx` | Desk, KPIs | C | §25 |
| `promoter/card.tsx` + `public/card.html` | Digital V-Card, QR, verified badge, VCF | C/A | **`/card` already public** — rebuild premium (§24) |
| `promoter/leads.tsx`, `leads-list.tsx` | Leads by status | C | §25 |
| `promoter/tree.tsx` | Referral network | C | §26 |
| `promoter/income.tsx` | DSI/RSI/ASI, wallet, withdrawals, rank ladder | C | **Never re-implement commission maths** — read the RPCs |
| `promoter/earnings.tsx` | Earnings | C | |
| `promoter/explorer.tsx` | Project explorer for sharing | C | §94 |
| `promoter/submit.tsx`, `submission/[id]` | Property submission + uploads | C/D | This is the seller flow today (§27) |
| `referral.tsx` | Referral Centre, 8 share channels, QR | C | §40 attribution rules must survive |

### Admin

`admin/{index,properties,property-edit,property-media,partners,kyc,
withdrawals,registrations,community,activity,desk-contact}` — 11 screens,
mirrored by `public/admin.html`. **Disposition E.** These already work and are
already reachable on the web. The brief's §35–38 CMS is largely *new surface*
(pages, hero slides, blog, SEO, media library, redirects), not a replacement.

### Jamindar AI

| Capability | Disp. | Note |
|---|---|---|
| Chat with live inventory injection, sales-consultant prompt, `mentioned[]` ids → recommendation cards | A/F | Edge fn `jamindar-voice` is already HTTP — the website can call it directly |
| TTS / STT / translate, 10 languages, `speakable()` sanitiser | A/G | Voice input on web = MediaRecorder; the `expo-audio` path is native-only |
| Deterministic intents, property search from natural language (`lib/property-search.ts`), memory | F | Port the parsers as-is |

### Community

`community/{index,[id],new,clips}` — posts, threads, likes, reports,
server-side contact masking via SECURITY DEFINER RPCs, reel player.
**Disposition A/F.** `/c/<id>` public pages already exist as a Netlify
function. Masking must stay server-side — the website must call the same RPCs,
never insert directly.

### App-only (disposition G) — needs a designed web alternative

| App capability | Why it will not port | Proposed web equivalent |
|---|---|---|
| Voice note recording (`expo-audio`) | Native recorder | MediaRecorder + same upload path |
| Camera capture (`expo-image-picker`) | Native camera | File input + drag-drop |
| Haptics | No web API worth using | Silent no-op |
| Push notifications | FCM via app | Web Push, opt-in |
| Device location | Available but permission-heavy on web | Explicit "use my location" button |
| Screen-orientation lock in the photo viewer | Native | CSS/fullscreen API |

**Nothing in the app is proposed for deletion.**

---

## 3. Backend audit

- Supabase `zmxqozvivdluuxvvcegs`, **75 migrations** (`0001` → `0075`).
- `public.properties` has **77 columns** and already covers most of the brief:
  `slug`, `seo`, `translations`, `images`/`videos`/`drone_videos`,
  `virtual_tour_url`, `master_plan_url`, `plot_layout`, `plot_plan`,
  `documents`, `nearby_places`, `legal`, `investment`, `approvals`,
  `utilities`, `rera_number`, `lat`/`lng`, `street_view_url`.
- RLS on all tables; role checks via `is_super_admin()` SECURITY DEFINER.
- Money, masking, commissions, plot holds and KYC review all run through
  SECURITY DEFINER RPCs — **the write path is already correct and must not be
  bypassed by a new website.**

### Data-quality blockers the brief will hit

| Issue | Effect on the brief | Owner action needed |
|---|---|---|
| **44 plots still unpriced** | §15 pricing, §16 plot selector, §11 budget filter, §29 calculators all have nothing to show | Fill the Plot pricing grid in the admin console |
| Udumalaipet has a **NULL slug**; Edappadi's slug is the stale working title `jamin-new-project-jul-2026` | §48 clean URLs, §103 redirects | Set real slugs in admin |
| Only **4 properties** exist | §47 location landing pages would be thin — brief itself forbids thin pages | Publish more inventory, or gate location pages behind a minimum |
| No blog content exists | §115+ CMS will launch empty | Plan an initial editorial set |

---

## 4. Supplied hero images — assessment

10 PNGs, 1672–1983 px wide, ~1.3–1.9 MB each.

They are **conceptual/stock-style renders, not photographs of Jamin projects**
(one shows a high-rise skyline that does not correspond to Erode, Salem or
Tiruppur). Under brief §42/§74 that is acceptable **only** as abstract brand
imagery in the hero, and they must never be labelled as a Jamin project or used
on a property card. They also need conversion to WebP/AVIF with responsive
crops before they go anywhere near LCP (§51, §147).

Real project photography already in Supabase storage — including the
Udumalaipet after/before set and the Edappadi site photos — should carry any
section that claims to show a Jamin project.

---

## 5. Recommended architecture

**Continue and expand `jamin-website` (B). Do not start from zero, and do not
adopt C's data layer.**

```
                    Supabase zmxqozvivdluuxvvcegs
                    (single source of truth: data, auth, storage, RPCs)
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        │                           │                           │
   Jamin Bazaar app            jamin-website              Admin console
   (Expo → APK + AAB)          (Next.js 16, SSR/ISR)      (public/admin.html
   merry-begonia               jamin-properties-web        + app/admin/*)
   authenticated screens       public + SEO + CMS          the only writer
```

Why this and not the alternatives:

- **Not C**, because it forks users, auth, storage and the AI away from the
  business — the one thing the brief forbids most explicitly.
- **Not a from-scratch rebuild**, because Increment 1 of B is already live,
  already pre-renders real HTML from real data, and already carries the
  golden-ratio design foundation and the logo palette.
- **Not the Expo web export alone**, because `web.output: "single"` is a
  client-only 3.9 MB SPA with no server rendering — it can never deliver the
  SEO or Core Web Vitals in §45–51.

The authenticated app screens stay on the Expo export at `merry-begonia` until
their Next.js equivalents are built and verified, so nothing is ever down.

---

## 6. Proposed build order

Following the brief's own §111 sequence. Each increment ends verified and
deployed; none of them touches the app or the database's write path.

| # | Increment | Contents |
|---|---|---|
| 0 | **This audit** | ✔ done |
| 1 | Design system + shell | Tokens, type scale, nav/mega-menu, footer, WebP hero pipeline, error/empty/loading states |
| 2 | Property experience | Detail page §15, gallery, video, interactive master plan §16, map §17, brochure, share |
| 3 | Discovery | Smart search §11–12, filters, map/list/grid, compare §18, category + location pages |
| 4 | Jamin Journal + Blog CMS | §115–183 — the largest module; block editor, SEO console, workflow, media library, clusters, Jamindar pipeline |
| 5 | Accounts | Supabase-OTP web auth, buyer workspace, shortlist, KYC, visits |
| 6 | Promoter portal | Dashboard, V-Card, leads, tree, earnings, marketing kit, attribution |
| 7 | Seller + enquiry/booking | Submission review flow, enquiry attribution, booking states |
| 8 | Jamindar on web | Chat + cards + voice, article-aware retrieval |
| 9 | SEO, performance, a11y, QA | §45–51, §99–107, redirects from the old URLs |

---

## 7. Owner decision, 2026-08-07

Asked which codebase wins, the owner answered verbatim:

> *"The third code base I designed - not good... u r free to dump it... or add
> elements from there.. ur wish"*

**Resolved: C is dumped as a codebase.** `jamin-website` (B) is the platform.
C stays on disk as a design reference only — its layouts, IA and component
inventory may be harvested; its Prisma schema, NextAuth, S3 and AbacusAI layers
are never imported. The security rotation in §0 still applies, because the
credentials travelled regardless of whether the code is used.

## 8. Remaining open questions

1. **Domain.** The brief writes `jaminbazaar.com`. Today the site is
   `jamin-properties-web.netlify.app` and the app is `merry-begonia-4c3cd1`.
   Which domain is canonical, and which host serves it?
2. **Lead capture.** Should the website write leads directly (needs a write
   path + attribution design), or keep handing off to the app as it does now?
3. **The 44 unpriced plots** — several headline features are empty until these
   are filled.

None of these blocks Increment 1; each is answered before the increment that
depends on it.
