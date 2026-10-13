"""
Makes the backdrops the page shows on either side of the game on a wide screen (a
computer, a tablet held sideways; requirements 2.54): each level's floor picture and the
title picture, small, blurred and darkened, so that they read as the stepwell around the
game and never compete with it. The browser stretches them over the screen; the blur is
what lets so small a file be stretched.

    python tools/make-backdrops.py

Run it again when a floor or the title picture changes. Writes game/assets/backdrop/
(title.jpg, level-1.jpg, level-2.jpg, level-3.jpg). Needs Pillow.
"""
import os
from PIL import Image, ImageEnhance, ImageFilter

REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
ASSETS = os.path.join(REPO, "game", "assets")
OUT = os.path.join(ASSETS, "backdrop")
SOURCES = {
    "title": os.path.join(ASSETS, "title-art.jpg"),
    "level-1": os.path.join(ASSETS, "floors", "level-1.jpg"),
    "level-2": os.path.join(ASSETS, "floors", "level-2.jpg"),
    "level-3": os.path.join(ASSETS, "floors", "level-3.jpg"),
}
WIDE = 480            # pixels across; the blur hides the stretch
BLUR = 9              # radius, at that width
# How much light and colour are left: the game is the bright thing on the screen. The floors
# are darker pictures than the title's to begin with, so they keep more of their light.
LIGHT = {"title": 0.42}
FLOOR_LIGHT, COLOUR = 0.62, 0.85

os.makedirs(OUT, exist_ok=True)
for name, path in SOURCES.items():
    im = Image.open(path).convert("RGB")
    im = im.resize((WIDE, round(im.height * WIDE / im.width)), Image.LANCZOS)
    im = im.filter(ImageFilter.GaussianBlur(BLUR))
    im = ImageEnhance.Color(ImageEnhance.Brightness(im).enhance(LIGHT.get(name, FLOOR_LIGHT))).enhance(COLOUR)
    dest = os.path.join(OUT, name + ".jpg")
    im.save(dest, quality=82, optimize=True, progressive=True)
    print(f"{dest}: {im.width}x{im.height}, {os.path.getsize(dest) // 1024} KB")
