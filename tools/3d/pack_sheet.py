"""
Packs frames rendered by render_char.py into the files the game plays:
  <name>-front|back|left|right.png   96 x 96 stills
  <name>-walk.png                    4 rows (front, back, left, right) x 9 cells of 112: standing, then 8 walk frames

  python pack_sheet.py <frames-dir> <out-dir> <name> [--idle Idle] [--walk Walking_A] [--fit 0.92]

Every frame is cut from the same place and scaled by the same amount, so the figure's
feet stay put from cell to cell, and the still is the sheet's standing frame.
"""
import sys, os, argparse
from PIL import Image

ap = argparse.ArgumentParser()
ap.add_argument("frames"); ap.add_argument("out"); ap.add_argument("name")
ap.add_argument("--idle", default="Idle"); ap.add_argument("--walk", default="Walking_A")
ap.add_argument("--fit", type=float, default=0.92)
a = ap.parse_args()
STILL, CELL, FRAMES = 96, 112, 8
FACINGS = ["front", "back", "left", "right"]

def load(anim, facing, i):
    return Image.open(os.path.join(a.frames, f"{anim}_{facing}_{i:02d}.png")).convert("RGBA")

# One box for every facing and frame: the union of what the figure ever covers standing,
# so all four stills are the same scale and stand on the same line.
boxes = [load(a.idle, f, 0).getbbox() for f in FACINGS]
l = min(b[0] for b in boxes); t = min(b[1] for b in boxes); r = max(b[2] for b in boxes); b_ = max(b[3] for b in boxes)
cx, cy, side = (l + r) / 2, (t + b_) / 2, max(r - l, b_ - t) / a.fit

def cut(im, size):
    half = side * size / STILL / 2
    box = (round(cx - half), round(cy - half), round(cx + half), round(cy + half))
    return im.crop(box).resize((size, size), Image.LANCZOS)

os.makedirs(a.out, exist_ok=True)
sheet = Image.new("RGBA", (CELL * (FRAMES + 1), CELL * len(FACINGS)), (0, 0, 0, 0))
for row, facing in enumerate(FACINGS):
    idle = load(a.idle, facing, 0)
    cut(idle, STILL).save(os.path.join(a.out, f"{a.name}-{facing}.png"))
    sheet.paste(cut(idle, CELL), (0, row * CELL))
    for i in range(FRAMES):
        sheet.paste(cut(load(a.walk, facing, i), CELL), ((i + 1) * CELL, row * CELL))
sheet.save(os.path.join(a.out, f"{a.name}-walk.png"))
print("packed", a.name, "box", (l, t, r, b_), "side", round(side))
