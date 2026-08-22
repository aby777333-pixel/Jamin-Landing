# The social share card

`og-jamin-1200x630.png` is the default Open Graph / Twitter image for the whole
site. It is referenced once, from the root `metadata` in `src/app/layout.tsx`,
so every route inherits it **except** `/property/[slug]` and `/journal/[slug]`,
which set their own from the listing's or article's own picture.

Added 2026-08-22. Before that the root metadata had no `images` at all while
already declaring `twitter.card: "summary_large_image"` — a card type that
promises a large image and had none. Because the two page types anyone tests
(a property, an article) carried their own, the gap was invisible: roughly 25
routes shared to WhatsApp as a bare blue link.

## Why it is a built file rather than a hero crop

A 1850x850 hero dropped into a 1.91:1 slot gets cropped differently by every
platform, and carries no wordmark — which fails two lines of the go-live
checklist at once ("the logo displays correctly", "sharing an image has the
correct dimensions"). This is composed at exactly 1200x630 with the emblem, the
wordmark and the district list.

## ⚠️ The copy sits on a measured scrim, not a guessed one

The first attempt faded its scrim to nothing by x≈860 while the caption lines
ran to x≈700, so "Formed roads" and "Trichy" ended up on a sunlit wall and a
lawn. The scrim is now sized to the *text*, and the result was measured against
the bare ground **before the text was drawn** — sampling after drawing returns
1.00:1, because it reads the glyph pixels rather than what is behind them.

| line | worst-case contrast | needs |
|---|---|---|
| eyebrow (JAMIN BAZAAR) | 8.42:1 | 4.5 |
| headline | 13.54:1 | 3.0 (large) |
| caption 1 | 12.73:1 | 4.5 |
| caption 2 (districts) | 8.68:1 | 4.5 |

## Regenerating it

Re-run when the hero artwork changes, or when the district list does. Keep the
filename stable — changing it orphans every preview already cached by WhatsApp,
Facebook and X, which cache aggressively and do not re-fetch on their own.

```
python - <<'PY'
from PIL import Image, ImageDraw, ImageFont
W,H = 1200,630
hero = Image.open("public/hero/hero-01-1850.webp").convert("RGB")
sr,tr = hero.width/hero.height, W/H
if sr>tr: nh=hero.height; nw=int(nh*tr)
else:     nw=hero.width;  nh=int(nw/tr)
left=(hero.width-nw)//2; top=int((hero.height-nh)*0.38)   # bias up: keep sky, drop foreground
card = hero.crop((left,top,left+nw,top+nh)).resize((W,H), Image.LANCZOS)

scrim = Image.new("L",(W,H),0); d=ImageDraw.Draw(scrim)
for x in range(W):
    t=x/W
    d.line([(x,0),(x,H)], fill=246 if t<0.58 else int(246*max(0.0,1.0-((t-0.58)/0.40))**1.15))
bot = Image.new("L",(W,H),0); db=ImageDraw.Draw(bot)
for y in range(H):
    db.line([(0,y),(W,y)], fill=int(150*max(0.0,(y/H-0.62)/0.38)**1.3))
ps,pb = scrim.load(), bot.load()
for y in range(H):
    for x in range(W):
        if pb[x,y] > ps[x,y]: ps[x,y] = pb[x,y]
card = Image.composite(Image.new("RGB",(W,H),(18,14,10)), card, scrim)

dr=ImageDraw.Draw(card); F="C:/Windows/Fonts/"
mark=Image.open("public/logo-mark.png").convert("RGBA").resize((84,84),Image.LANCZOS)
card.paste(mark,(72,62),mark)
dr.text((174,78),"JAMIN BAZAAR",font=ImageFont.truetype(F+"arialbd.ttf",22),fill=(234,163,23))
dr.text((174,108),"Signature for Fortune",font=ImageFont.truetype(F+"ariali.ttf",20),fill=(206,166,124))
ft=ImageFont.truetype(F+"arialbd.ttf",62)
dr.text((72,250),"DTCP-Approved Plots",font=ft,fill=(247,243,236))
dr.text((72,322),"in Tamil Nadu",font=ft,fill=(247,243,236))
dr.rectangle([72,416,292,419],fill=(234,163,23))
fs=ImageFont.truetype(F+"arial.ttf",29)
dr.text((72,448),"Clear title  \u00b7  Sanctioned layouts  \u00b7  Formed roads",font=fs,fill=(224,216,203))
dr.text((72,492),"Salem \u00b7 Erode \u00b7 Coimbatore \u00b7 Tiruppur \u00b7 Trichy",font=fs,fill=(214,172,120))
card.save("public/og-jamin-1200x630.png","PNG",optimize=True)
PY
```

Arial is used because Inter is not installed as a system font on the build
machine and the card is a raster — the glyphs never need to match the site's
running webfont. If Inter is ever installed locally, swap the three font paths.
