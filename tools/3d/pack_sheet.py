"""
Packs frames rendered by render_char.py into the files the game plays:
  <name>-front|back|left|right.png   stills, STILL pixels square
  <name>-walk.png                    4 rows (front, back, left, right) x 9 cells of CELL: standing, then 8 walk frames

  python pack_sheet.py <frames-dir> <out-dir> <name> [--idle Idle] [--walk Walking_A] [--fit 0.9]

Every frame is cut from the same place and scaled by the same amount, so the figure's feet
stay put from cell to cell, and the still is the sheet's standing frame. The scale is set
by how tall the figure stands (never by what it holds out to the side), and a soft shadow
is laid under the feet, so the figure sits on the floor without the game drawing one.
STILL and CELL must match WALK in the game file.
"""
import sys, os, argparse
from PIL import Image, ImageDraw, ImageFilter

ap = argparse.ArgumentParser()
ap.add_argument("frames"); ap.add_argument("out"); ap.add_argument("name")
ap.add_argument("--idle", default="Idle"); ap.add_argument("--walk", default="Walking_A")
ap.add_argument("--fit", type=float, default=0.9)
ap.add_argument("--colours", type=int, default=0, help="save with a palette of this many colours (0 = full colour)")
a = ap.parse_args()
STILL, CELL, FRAMES = 160, 192, 8
FACINGS = ["front", "back", "left", "right"]

def load(anim, facing, i):
    return Image.open(os.path.join(a.frames, f"{anim}_{facing}_{i:02d}.png")).convert("RGBA")

# The figure standing, seen from the front, sets the scale and the ground line for every frame.
front = load(a.idle, "front", 0)
l, t, r, b = front.getbbox()
boxes = [load(a.idle, f, 0).getbbox() for f in FACINGS]
top = min(x[1] for x in boxes); base = max(x[3] for x in boxes)
cx = front.width / 2                       # the camera looks down the figure's own axis, so the middle of the frame is its middle
side = (base - top) / a.fit
cy = (top + base) / 2 + side * 0.02        # a little low, leaving room for the shadow under the feet
width = min(r - l, (base - top) * 0.62)

def shadowed(im):
    sh = Image.new("RGBA", im.size, (0, 0, 0, 0))
    rx, ry = width * 0.36, width * 0.36 * 0.36
    ImageDraw.Draw(sh).ellipse((cx - rx, base - ry * 1.2, cx + rx, base + ry * 0.8), fill=(24, 8, 0, 125))
    sh = sh.filter(ImageFilter.GaussianBlur(im.width / 110))
    return Image.alpha_composite(sh, im)

def cut(im, size):
    half = side * size / STILL / 2
    box = (round(cx - half), round(cy - half), round(cx + half), round(cy + half))
    return shadowed(im).crop(box).resize((size, size), Image.LANCZOS)

def write(im, path):
    if a.colours:
        im = im.quantize(a.colours, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.FLOYDSTEINBERG)
    im.save(path, optimize=True)

os.makedirs(a.out, exist_ok=True)
sheet = Image.new("RGBA", (CELL * (FRAMES + 1), CELL * len(FACINGS)), (0, 0, 0, 0))
for row, facing in enumerate(FACINGS):
    idle = load(a.idle, facing, 0)
    write(cut(idle, STILL), os.path.join(a.out, f"{a.name}-{facing}.png"))
    sheet.paste(cut(idle, CELL), (0, row * CELL))
    for i in range(FRAMES):
        sheet.paste(cut(load(a.walk, facing, i), CELL), ((i + 1) * CELL, row * CELL))
write(sheet, os.path.join(a.out, f"{a.name}-walk.png"))
kb = sum(os.path.getsize(os.path.join(a.out, f"{a.name}-{x}.png")) for x in FACINGS + ["walk"]) / 1024
print(f"packed {a.name}: figure {base - top}px tall in a {front.width}px frame, {kb:.0f} KB")
