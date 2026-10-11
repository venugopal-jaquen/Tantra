"""Fits the founder's title picture to the title screen (requirements 2.48).

    python tools/fit-title.py <picture> [--look out.jpg]

The picture is a stepwell seen from above, tall (9 by 16), with a glowing pool and the hero
on the ledge before it. The title screen is 400 by 700 of the game's pixels and its way in
(DESCEND) is at WELL.cy, 300 down. The picture is enlarged by ZOOM and placed so that the
middle of its pool lies exactly there; what then falls on the screen is cut out and saved
three times the screen's size, which is what a phone with three device pixels to one shows.
The game lays the result over the whole screen and does no fitting of its own.

Change ZOOM or POOL here and run it again to fit it differently; the same picture in gives
the same file out. Needs Pillow.
"""
import os, sys
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", "game", "assets", "title-art.jpg")
SCREEN = (400, 700)          # the game's screen (W, H)
WAY_IN = (200, 300)          # where DESCEND is on it (W / 2, WELL.cy)
ZOOM = 1.31                  # how much wider than the screen the whole picture is shown
POOL = (0.500, 0.5625)       # the middle of the pool, as parts of the picture's width and height
SCALE = 3                    # the file's pixels to one of the screen's
QUALITY = 86

def main():
    if len(sys.argv) < 2:
        print(__doc__); sys.exit(1)
    Image.MAX_IMAGE_PIXELS = None                      # the founder's originals are large on purpose
    im = Image.open(sys.argv[1]).convert("RGB")
    shown_w = SCREEN[0] * ZOOM                         # the picture's width, in the screen's pixels
    k = im.width / shown_w                             # the picture's pixels to one of the screen's
    left = POOL[0] * im.width - WAY_IN[0] * k
    top = POOL[1] * im.height - WAY_IN[1] * k
    box = (left, top, left + SCREEN[0] * k, top + SCREEN[1] * k)
    if box[0] < 0 or box[1] < 0 or box[2] > im.width or box[3] > im.height:
        print("FIT FAILED: at this zoom the picture does not cover the screen:", [round(v) for v in box], im.size); sys.exit(1)
    out = im.resize((SCREEN[0] * SCALE, SCREEN[1] * SCALE), Image.LANCZOS, box=box)
    out.save(OUT, quality=QUALITY, optimize=True, progressive=True)
    print(f"title-art.jpg: {out.width} x {out.height}, {os.path.getsize(OUT) // 1024} KB; cut {[round(v) for v in box]} from {im.width} x {im.height}; {k:.2f} of its pixels to one of the screen's")
    if "--look" in sys.argv:
        out.resize(SCREEN, Image.LANCZOS).save(sys.argv[sys.argv.index("--look") + 1], quality=90)

if __name__ == "__main__":
    main()
