"""
Makes the itch.io cover image (630x500) from a HUD-less picture that tools/store-shots.mjs
saved in its `cover` scene.

    python tools/make-cover.py <cover-x.png> <out.png> [--title "..."] [--line "..."]

The title defaults to GAME_TITLE in the game page, so when the game is renamed this is
run again and the cover follows. The picture is cropped round the hero and the serpent
(their places are in the .json beside it), darkened at the top, and the title is set in
the game's own typefaces from game/vendor/fonts/. Needs Pillow.
"""
import argparse, io, json, os, re
from PIL import Image, ImageDraw, ImageFilter, ImageFont

REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
FONTS = os.path.join(REPO, "game", "vendor", "fonts")
SIZE = (630, 500)                      # what itch.io recommends; it shows it at half that
GOLD, CREAM, DEEP = (255, 210, 60), (255, 251, 239), (42, 8, 0)

ap = argparse.ArgumentParser()
ap.add_argument("picture"); ap.add_argument("out")
ap.add_argument("--title"); ap.add_argument("--line", default="A one-thumb arena roguelite")
a = ap.parse_args()
if not a.title:
    page = io.open(os.path.join(REPO, "game", "loot-chase-v0.1.html"), encoding="utf-8").read()
    a.title = re.search(r"const GAME_TITLE = '([^']+)'", page).group(1)

im = Image.open(a.picture).convert("RGB")
at = json.load(open(os.path.splitext(a.picture)[0] + ".json"))
k = im.width / at["view"][0]                                   # picture pixels to one game unit
crop_w = im.width
crop_h = round(crop_w * SIZE[1] / SIZE[0])
# The title takes the top third, so the hero and the serpent are framed in what is left:
# their midpoint sits about two thirds of the way down.
mid = (at["hero"][1] + at["boss"][1]) / 2 * k
top = max(0, min(im.height - crop_h, round(mid - crop_h * 0.68)))
cover = im.crop((0, top, crop_w, top + crop_h)).resize(SIZE, Image.LANCZOS)

# A dark wash down from the top edge, for the title to sit on.
shade = Image.new("L", (1, SIZE[1]))
for y in range(SIZE[1]):
    shade.putpixel((0, y), round(235 * max(0.0, 1 - y / (SIZE[1] * 0.46)) ** 1.25))
cover.paste(Image.new("RGB", SIZE, DEEP), (0, 0), shade.resize(SIZE))

def fit(path, text, size, most, weight=None):
    """The largest size up to `size` at which `text` is no wider than `most`."""
    while True:
        font = ImageFont.truetype(path, size)
        if weight:
            font.set_variation_by_axes([weight])
        box = font.getbbox(text)
        if box[2] - box[0] <= most or size <= 12:
            return font, box
        size -= 2

def put(text, font, box, y, fill):
    x = (SIZE[0] - (box[2] - box[0])) / 2 - box[0]
    glow = Image.new("RGBA", SIZE, (0, 0, 0, 0))
    ImageDraw.Draw(glow).text((x, y + 3), text, font=font, fill=(20, 4, 0, 230))
    cover.paste(glow.filter(ImageFilter.GaussianBlur(5)), (0, 0), glow.filter(ImageFilter.GaussianBlur(5)))
    ImageDraw.Draw(cover).text((x, y), text, font=font, fill=fill)

title, tbox = fit(os.path.join(FONTS, "yatraone-latin.woff2"), a.title, 104, SIZE[0] - 70)
put(a.title, title, tbox, 22 - tbox[1], GOLD)
if a.line:
    line, lbox = fit(os.path.join(FONTS, "baloo2-latin.woff2"), a.line, 27, SIZE[0] - 90, weight=600)
    put(a.line, line, lbox, 22 + (tbox[3] - tbox[1]) + 16 - lbox[1], CREAM)
cover.save(a.out, optimize=True)
print(f"{a.out}: {SIZE[0]}x{SIZE[1]}, title \"{a.title}\", {os.path.getsize(a.out) / 1024:.0f} KB")
