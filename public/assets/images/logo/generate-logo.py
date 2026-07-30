#!/usr/bin/env python3
"""LuckyTicket365 logo — vector ("flat") set: a fan of 5 upright tier tickets
over the wordmark. Also emits wordmark.json for generate-logo-real.mjs."""

import json
import os
import re

from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform

ROOT = "/Users/arsen/WebstormProjects/lucky-ticket"
# Wordmark face = the landing header's (Space Grotesk Bold, --font-wordmark).
# Instantiated at wght 700 from next/font's variable subset and vendored here so
# regeneration doesn't depend on the landing repo's build cache.
HERE = os.path.dirname(os.path.abspath(__file__))
FONT = os.path.join(HERE, "fonts/SpaceGrotesk-Bold.ttf")
OUT = os.path.join(ROOT, "public/assets/images/logo")

KEYLINE = "#231E3A"

# project palette (src/styles/global/theme.css)
GOLD = "#F8BD3E"
ELECTRIC_PINK = "#DE009B"
ELECTRIC_PURPLE = "#743DF5"
BACKGROUND = "#1B192A"

# wordmark gradient built from the tier palette (same order as the fan).
# light tones for dark backgrounds, deep tones for light ones.
TIER_TEXT_LIGHT = [
    (0, "#E8A961"),    # bronze
    (25, "#C6CFD8"),   # silver
    (50, "#F8BD3E"),   # gold
    (75, "#E0D7BE"),   # platinum
    (100, "#6FE0DA"),  # diamond
]
TIER_TEXT_DEEP = [
    (0, "#7A3F12"),
    (25, "#5E6166"),
    (50, "#A9700A"),
    (75, "#7C7663"),
    (100, "#0C5A57"),
]
# «365» is only three glyphs — the full five-stop ramp turns to mush there,
# so the accent keeps the ends plus gold.
ACCENT_LIGHT = [(0, "#C9F7F2"), (40, "#6FE0DA"), (100, "#178D88")]
ACCENT_DEEP = [(0, "#2FA9A2"), (45, "#178D88"), (100, "#0C5A57")]
# wordmark palette copied from the landing header (Wordmark.tsx + theme.css):
# «Lucky» белый · «Ticket» бренд-градиент · «365» золотой, оба под 100deg
BRAND_TEXT = [(0, "#DE009B"), (45, "#A32183"), (100, "#743DF5")]
GOLD_TEXT = [(0, "#F8BD3E"), (50, "#FFE6A3"), (100, "#F8BD3E")]
BRAND_TEXT_DEEP = [(0, "#B0007B"), (45, "#7C1863"), (100, "#4B21B4")]
GOLD_TEXT_DEEP = [(0, "#A9700A"), (50, "#C99A41"), (100, "#A9700A")]
# 100deg in CSS ≈ this vector in objectBoundingBox space
DEG100 = (0.985, 0.174)

# ---------------------------------------------------------------- tiers
TIERS = [
    # key,      dark,      base,      light,     angle, lift
    ("bronze",   "#5E2E0C", "#AC6122", "#E8A961", -36, 0),
    ("silver",   "#4E535A", "#97A0A8", "#E4EAF0", -18, 0),
    ("gold",     "#8A5606", "#F0B23A", "#FFE9A8",   0, 0),
    ("platinum", "#6E6656", "#CFC6AE", "#F6F1E2",  18, 0),
    ("diamond",  "#06403E", "#178D88", "#6FE0DA",  36, 0),
]

# drawn horizontally (186 x 102), rotated upright at render time
TICKET_PATH = (
    "M -78 -51 H 78 A 15 15 0 0 1 93 -36 V -15 A 15 15 0 0 0 93 15 V 36 "
    "A 15 15 0 0 1 78 51 H -78 A 15 15 0 0 1 -93 36 V 15 "
    "A 15 15 0 0 0 -93 -15 V -36 A 15 15 0 0 1 -78 -51 Z"
)
TICKET_SCALE = 1.16  # → 216 tall, 118 wide once upright

# ---------------------------------------------------------------- layout
CANVAS_W, CANVAS_H = 740, 500
FAN_CX, FAN_CY, PIVOT = 370, 150, 340
WORDMARK_W, WORDMARK_BASELINE = 560, 448


def defs():
    out = []
    for key, dark, base, light, _a, _l in TIERS:
        out.append(
            f'''    <linearGradient id="g-{key}" x1="0" y1="0" x2="1" y2="0.3">
      <stop offset="0%" stop-color="{light}"/>
      <stop offset="26%" stop-color="{base}"/>
      <stop offset="52%" stop-color="{dark}"/>
      <stop offset="74%" stop-color="{base}"/>
      <stop offset="100%" stop-color="{light}"/>
    </linearGradient>'''
        )
    # wordmark ramp = tier colours, in fan order bronze → … → diamond
    def ramp(gid, stops, user_space=False, vertical=False):
        head = (
            f'<linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
            f'x1="{FAN_CX - WORDMARK_W / 2}" y1="0" x2="{FAN_CX + WORDMARK_W / 2}" y2="0">'
            if user_space
            else f'<linearGradient id="{gid}" x1="0" y1="0" '
            f'x2="{0 if vertical else 1}" y2="{1 if vertical else 0}">'
        )
        body = "".join(
            f'\n      <stop offset="{o}%" stop-color="{c}"/>' for o, c in stops
        )
        return f"    {head}{body}\n    </linearGradient>"

    out.append(ramp("g-accent", ACCENT_LIGHT, vertical=True))
    out.append(ramp("g-accent-deep", ACCENT_DEEP, vertical=True))
    out.append(ramp("g-brand", TIER_TEXT_LIGHT, user_space=True))
    out.append(ramp("g-brand-deep", TIER_TEXT_DEEP, user_space=True))
    # one continuous gold sweep across the whole word
    for gid, stops in (("g-gold-wide", GOLD_TEXT), ("g-gold-wide-deep", GOLD_TEXT_DEEP)):
        body = "".join(
            f'\n      <stop offset="{o}%" stop-color="{c}"/>' for o, c in stops
        )
        out.append(
            f'    <linearGradient id="{gid}" gradientUnits="userSpaceOnUse" '
            f'x1="{FAN_CX - WORDMARK_W / 2}" y1="{CAP_TOP}" '
            f'x2="{FAN_CX + WORDMARK_W / 2}" y2="{CAP_TOP + 40}">{body}\n    </linearGradient>'
        )
    for gid, stops in (
        ("g-ticket", BRAND_TEXT),
        ("g-ticket-deep", BRAND_TEXT_DEEP),
        ("g-gold-text", GOLD_TEXT),
        ("g-gold-text-deep", GOLD_TEXT_DEEP),
    ):
        body = "".join(
            f'\n      <stop offset="{o}%" stop-color="{c}"/>' for o, c in stops
        )
        out.append(
            f'    <linearGradient id="{gid}" x1="0" y1="0" '
            f'x2="{DEG100[0]}" y2="{DEG100[1]}">{body}\n    </linearGradient>'
        )
    out.append(
        '    <clipPath id="clip-ticket">\n      <path d="%s"/>\n    </clipPath>' % TICKET_PATH
    )
    out.append(
        '''    <filter id="ticket-shadow" x="-40%" y="-40%" width="180%" height="180%">
      <feDropShadow dx="0" dy="6" stdDeviation="8" flood-color="#0B0918" flood-opacity="0.40"/>
    </filter>'''
    )
    return "\n".join(out)


# one heart-shaped leaf, tip at (0,0), lobes pointing up
LEAF = (
    "M 0 0 C -1.5 -7 -13 -9.5 -13 -17.5 C -13 -24 -6.5 -26 0 -20.5 "
    "C 6.5 -26 13 -24 13 -17.5 C 13 -9.5 1.5 -7 0 0 Z"
)


def clover(cx, cy, scale=0.82, fill="#FFFFFF", opacity="0.95"):
    leaves = "".join(
        f'<path d="{LEAF}" transform="rotate({a})"/>' for a in (-45, 45, 135, 225)
    )
    stem = (
        '<path d="M 1 3 C 3 12 1 18 -7 22" fill="none" stroke="%s" '
        'stroke-width="3.6" stroke-linecap="round"/>' % fill
    )
    return (
        f'<g transform="translate({cx:g} {cy:g}) scale({scale:g})" fill="{fill}" '
        f'opacity="{opacity}">{leaves}{stem}</g>'
    )


BG_LAYERS = [
    ("bg-core", "0.5", "0.34", "0.85",
     [("0", "#5B2E88", "1"), ("45", "#2E2049", "1"), ("100", "#12101E", "1")]),
    ("bg-ep", "0.16", "0.12", "0.62",
     [("0", "#743DF5", "0.42"), ("100", "#743DF5", "0")]),
    ("bg-pk", "0.12", "0.78", "0.62",
     [("0", "#DE009B", "0.34"), ("100", "#DE009B", "0")]),
    ("bg-tl", "0.9", "0.82", "0.6",
     [("0", "#178D88", "0.34"), ("100", "#178D88", "0")]),
    ("bg-gd", "0.5", "0.3", "0.42",
     [("0", "#F8BD3E", "0.18"), ("100", "#F8BD3E", "0")]),
    ("bg-vg", "0.5", "0.45", "0.78",
     [("55", "#0E0C18", "0"), ("100", "#0E0C18", "0.6")]),
]


def bg_defs():
    out = []
    for gid, cx, cy, r, stops in BG_LAYERS:
        body = "".join(
            f'\n      <stop offset="{o}%" stop-color="{c}" stop-opacity="{a}"/>'
            for o, c, a in stops
        )
        out.append(
            f'    <radialGradient id="{gid}" cx="{cx}" cy="{cy}" r="{r}">{body}'
            f"\n    </radialGradient>"
        )
    return "\n".join(out)


def bg_rects(w, h):
    return "\n".join(
        f'  <rect width="{w}" height="{h}" fill="url(#{gid})"/>' for gid, *_ in BG_LAYERS
    )


def ticket(key, light, angle, lift, is_center):
    """Upright ticket: drawn horizontally, then rotated -90° inside the fan."""
    p = [
        f'  <g transform="translate({FAN_CX} {FAN_CY + lift}) rotate({angle} 0 {PIVOT})" '
        f'filter="url(#ticket-shadow)">',
        f'    <g transform="rotate(-90) scale({TICKET_SCALE})">',
        f'      <path d="{TICKET_PATH}" fill="{KEYLINE}" stroke="{KEYLINE}" stroke-width="7"/>',
        f'      <path d="{TICKET_PATH}" fill="url(#g-{key})"/>',
        '      <g clip-path="url(#clip-ticket)">'
        '<path d="M -112 26 L -30 -58 L 12 -58 L -70 58 Z" fill="#FFFFFF" opacity="0.13"/>'
        '<path d="M 6 -58 L 28 -58 L -54 58 L -74 58 Z" fill="#FFFFFF" opacity="0.07"/>'
        "</g>",
        f'      <path d="{TICKET_PATH}" fill="none" stroke="{light}" '
        f'stroke-opacity="0.8" stroke-width="2.5"/>',
        f'      <rect x="-80" y="-38" width="160" height="76" rx="11" fill="none" '
        f'stroke="{light}" stroke-opacity="0.4" stroke-width="1.8"/>',
    ]
    for x in (-52, 52):
        p.append(
            f'      <path d="M {x} -36 V 36" stroke="{light}" stroke-opacity="0.5" '
            f'stroke-width="3" stroke-dasharray="4 9" stroke-linecap="round"/>'
        )
    p.append("    </g>")
    if is_center:  # clover stays upright, outside the -90° rotation
        p.append("    " + clover(0, -4))
    p.append("  </g>")
    return "\n".join(p)


def fan():
    order = [0, 1, 4, 3, 2]  # outer -> inner, gold on top
    return "\n".join(
        ticket(t[0], t[3], t[4], t[5], t[0] == "gold") for t in (TIERS[i] for i in order)
    )


# ---------------------------------------------------------------- wordmark
def wordmark(runs, target_width, cx, baseline, tracking=0.0):
    font = TTFont(FONT)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    gs = font.getGlyphSet()

    total = sum(
        hmtx[cmap[ord(ch)]][0] + tracking * upem for text, _ in runs for ch in text
    )
    scale = target_width / total

    x = cx - target_width / 2
    out = []
    for text, fill in runs:
        ds = []
        for ch in text:
            gname = cmap[ord(ch)]
            pen = SVGPathPen(gs)
            gs[gname].draw(TransformPen(pen, Transform(scale, 0, 0, -scale, x, baseline)))
            d = pen.getCommands()
            if d:
                ds.append(d)
            x += (hmtx[gname][0] + tracking * upem) * scale
        if ds:
            out.append(f'  <path fill="{fill}" d="{" ".join(ds)}"/>')
    return "\n".join(out)


def wordmark_paths(target_width, cx, baseline, tracking=0.0):
    """Raw path data for the wordmark, consumed by generate-logo-real.mjs."""
    svg = wordmark(
        [("Lucky", "#A"), ("Ticket", "#B"), ("365", "#C")],
        target_width,
        cx,
        baseline,
        tracking,
    )
    ds = re.findall(r'd="([^"]+)"', svg)
    return {"lucky": ds[0], "ticket": ds[1], "accent": ds[2]}


def lockup(runs, background=False):
    text_svg = wordmark(runs, WORDMARK_W, FAN_CX, WORDMARK_BASELINE, tracking=-0.004)
    extra_defs = "\n" + bg_defs() if background else ""
    bg = bg_rects(CANVAS_W, CANVAS_H) + "\n" if background else ""
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {CANVAS_W} {CANVAS_H}" width="{CANVAS_W}" height="{CANVAS_H}" role="img" aria-label="LuckyTicket365">
  <title>LuckyTicket365</title>
  <defs>
{defs()}{extra_defs}
  </defs>
{bg}{fan()}
{text_svg}
</svg>
'''


def mark():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="51 32 638 313" width="638" height="313" role="img" aria-label="LuckyTicket365">
  <title>LuckyTicket365 mark</title>
  <defs>
{defs()}
  </defs>
{fan()}
</svg>
'''


def icon():
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024" role="img" aria-label="LuckyTicket365">
  <title>LuckyTicket365 icon</title>
  <defs>
{defs()}
{bg_defs()}
  </defs>
{bg_rects(1024, 1024)}
  <g transform="translate(33.2 268.1) scale(1.294)">
{fan()}
  </g>
</svg>
'''


def cap_top(target_width, baseline, tracking=0.0):
    """Y of the wordmark's cap line — anchors the gold ramp across both runs."""
    font = TTFont(FONT)
    upem = font["head"].unitsPerEm
    cmap = font.getBestCmap()
    hmtx = font["hmtx"]
    text = "LuckyTicket365"
    total = sum(hmtx[cmap[ord(ch)]][0] + tracking * upem for ch in text)
    scale = target_width / total
    cap = getattr(font["OS/2"], "sCapHeight", 0) or round(0.72 * upem)
    return round(baseline - cap * scale, 1)


CAP_TOP = cap_top(WORDMARK_W, WORDMARK_BASELINE, tracking=-0.004)

RUNS_LIGHT = [
    ("Lucky", "url(#g-gold-wide)"),
    ("Ticket", "url(#g-gold-wide)"),
    ("365", "url(#g-gold-wide)"),
]
RUNS_DARK = [
    ("Lucky", "url(#g-gold-wide-deep)"),
    ("Ticket", "url(#g-gold-wide-deep)"),
    ("365", "url(#g-gold-wide-deep)"),
]

files = {
    "luckyticket365-logo-flat.svg": lockup(RUNS_LIGHT, background=True),
    "luckyticket365-logo-flat-transparent.svg": lockup(RUNS_LIGHT),
    "luckyticket365-logo-flat-dark-text.svg": lockup(RUNS_DARK),
    "luckyticket365-mark-flat.svg": mark(),
    "luckyticket365-icon-flat.svg": icon(),
}
for name, content in files.items():
    with open(os.path.join(OUT, name), "w") as f:
        f.write(content)

with open(os.path.join(OUT, "wordmark.json"), "w") as f:
    json.dump(
        {
            "capTop": CAP_TOP,
            "baseline": WORDMARK_BASELINE,
            "real": wordmark_paths(
                target_width=WORDMARK_W,
                cx=FAN_CX,
                baseline=WORDMARK_BASELINE,
                tracking=-0.004,
            )
        },
        f,
    )
print("written:", ", ".join(files), ", wordmark.json")
