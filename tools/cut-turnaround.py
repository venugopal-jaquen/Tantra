"""Cut a character's turnaround into the files the game plays.

Usage:
  pip install Pillow
  python tools/cut-turnaround.py <turnaround.png> <name> [--out folder] [--frames folder]

A turnaround is one picture of one character standing three ways in a row, on a clear
background: facing us, facing away, and facing right. That is what an image tool can be
asked for and keep consistent (docs/character-art-guide.md). From it this writes, into
game/assets/chars/ unless --out says otherwise:

  <name>-front.png, -back.png, -left.png, -right.png    stills of STILL pixels
  <name>-walk.png                                       four rows by facing, a standing
                                                        frame and FRAMES of a walk, cells
                                                        of CELL pixels

The three figures are found by the clear columns between them, not by cutting the picture
in thirds, so a blade that reaches across a third cannot leave a piece of itself in its
neighbour's frame. All three are scaled by the same amount and stand on the same line.
The left view is the right view mirrored, as it was for the stock cast, so whatever the
figure carries changes hands when it turns.

The walk is made from the stills, because a turnaround has no legs in motion to cut. The
picture is bent, smoothly, a little at a time: seen from the front or the back one leg
shortens as its foot comes up and the weight moves over the other; seen from the side the
legs open and close under a body that rises and falls. It reads as stepping at the size a
phone shows it. It is not drawn animation and will not pass for it up close; a figure whose
tool can supply real walk frames should use them instead.

--frames saves every walk frame as its own picture, for looking at.
"""
import math, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
OUT = os.path.join(REPO, "game", "assets", "chars")

STILL = 160      # a still; the game is told this size in ART (the game file)
CELL = 192       # a walk cell: the still plus room for a stride
FRAMES = 8       # walk frames per facing, as for every other sheet
COLOURS = 255    # the sheet is saved with a palette
TALL = 0.86      # how much of a still's height the tallest view fills
FEET = 0.94      # where in a still the feet stand
CLEAR, SOLID = 12, 244   # alpha at or under CLEAR is background left behind; at or over SOLID is the figure
GAP = 12         # clear columns that separate two figures
SHADOW = 0.34    # how dark the shadow under the feet is
HIP = 0.56       # where the legs begin, down the figure

def fail(msg):
    print("CUT FAILED: " + msg)
    sys.exit(1)

def clean(im):
    """The background remover leaves a faint haze round a figure and the figure itself
    a shade short of solid. Both are put right here."""
    im = im.convert("RGBA")
    a = im.getchannel("A").point(lambda v: 0 if v <= CLEAR else 255 if v >= SOLID else round((v - CLEAR) * 255 / (SOLID - CLEAR)))
    im.putalpha(a)
    return im

def figures(im):
    """The boxes of the figures in the row, left to right."""
    a = im.getchannel("A").point(lambda v: 255 if v > 64 else 0)
    w, h = im.size
    filled = [a.crop((x, 0, x + 1, h)).getbbox() is not None for x in range(w)]
    spans, start, empty = [], None, 0
    for x in range(w + 1):
        on = x < w and filled[x]
        if on:
            if start is None: start = x
            empty = 0
        elif start is not None:
            empty += 1
            if empty >= GAP or x == w:
                spans.append((start, x - empty + 1)); start = None
    boxes = []
    for x0, x1 in spans:
        if x1 - x0 < w * 0.05: continue          # a speck, not a figure
        top, bottom = a.crop((x0, 0, x1, h)).getbbox()[1::2]
        boxes.append((x0, top, x1, bottom))
    return boxes

def middle(fig):
    """The column half of the figure's substance lies either side of: where its body is,
    whatever it holds out to one side."""
    a = fig.getchannel("A")
    w, h = fig.size
    cols = [sum(a.crop((x, 0, x + 1, h)).histogram()[128:]) for x in range(w)]
    half, run = sum(cols) / 2, 0
    for x, c in enumerate(cols):
        run += c
        if run >= half: return x + 0.5
    return w / 2

def smooth(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def bend(fig, source):
    """The figure redrawn with every point taken from where `source(x, y)` says, on a
    mesh fine enough that the bending shows no joins. Room is left all round."""
    pad = round(fig.height * 0.08)
    big = Image.new("RGBA", (fig.width + 2 * pad, fig.height + 2 * pad), (0, 0, 0, 0))
    big.paste(fig, (pad, pad))
    big = big.convert("RGBa")                    # colour weighed by alpha, so edges do not fringe
    step = max(6, fig.height // 60)
    mesh = []
    for y0 in range(0, big.height, step):
        for x0 in range(0, big.width, step):
            x1, y1 = min(x0 + step, big.width), min(y0 + step, big.height)
            quad = []
            for cx, cy in ((x0, y0), (x0, y1), (x1, y1), (x1, y0)):
                sx, sy = source(cx - pad, cy - pad)
                quad += [sx + pad, sy + pad]
            mesh.append(((x0, y0, x1, y1), quad))
    return big.transform(big.size, Image.MESH, mesh, Image.BICUBIC).convert("RGBA"), pad

def stride(fig, facing, i, mid):
    """Walk frame i of FRAMES for one view. Returns the picture and how far its corner
    lies up and left of the still's."""
    w, h = fig.size
    hip = h * HIP
    phase = 2 * math.pi * i / FRAMES
    leg = lambda y: smooth((y - hip) / (h - hip))            # 0 at the hip, 1 at the sole
    if facing in ("front", "back"):
        # One leg, then the other: the foot comes up and the leg shortens toward us,
        # the weight moves over the leg that stands, and the body rises as it passes.
        lift_l, lift_r = max(0.0, math.sin(phase)), max(0.0, -math.sin(phase))
        rise = abs(math.sin(phase))
        def source(x, y):
            side = 0.5 * (1 + math.tanh((x - mid) / (w * 0.05)))      # 0 on the left leg, 1 on the right
            lift = (1 - side) * lift_l + side * lift_r
            up = h * 0.075 * lift * leg(y) + h * 0.014 * rise * (1 - leg(y))
            over = w * 0.022 * math.sin(phase) * (1 - leg(y))
            return x - over, y + up
    else:
        # From the side the legs open and close like shears under a body that drops as
        # they open and rises as they pass, and leans a little into the way it is going.
        apart = math.cos(2 * phase)
        way = 1 if facing == "right" else -1
        rise = (1 - apart) / 2
        def source(x, y):
            wide = 1 + 0.42 * apart * leg(y) if apart > 0 else 1 + 0.2 * apart * leg(y)
            lean = way * h * 0.02 * (1 - y / h)
            up = h * 0.02 * rise * (1 - leg(y))
            swing = way * w * 0.03 * math.sin(phase) * leg(y)
            return mid + (x - mid) / wide - lean - swing, y + up
    return bend(fig, source)

def shadow(size, cx, feet, width):
    """A soft dark oval for the figure to stand on."""
    s = Image.new("L", (size, size), 0)
    rx, ry = width / 2, width / 6.5
    ImageDraw.Draw(s).ellipse((cx - rx, feet - ry, cx + rx, feet + ry * 0.9), fill=round(255 * SHADOW))
    s = s.filter(ImageFilter.GaussianBlur(size / 64))
    out = Image.new("RGBA", (size, size), (20, 6, 0, 0))
    out.putalpha(s)
    return out

def place(pic, size, scale, cx_in_pic, feet_in_pic, shade):
    """A cut figure scaled and stood in a square of `size`, its body over the middle and
    its feet on the line, on its shadow."""
    w, h = max(1, round(pic.width * scale)), max(1, round(pic.height * scale))
    small = pic.convert("RGBa").resize((w, h), Image.LANCZOS).convert("RGBA")
    still_feet = round(STILL * FEET) + (size - STILL) // 2
    x = round(size / 2 - cx_in_pic * scale)
    y = round(still_feet - feet_in_pic * scale)
    out = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    out.alpha_composite(shadow(size, size / 2, still_feet - 1, shade))
    layer = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    layer.paste(small, (x, y))
    out.alpha_composite(layer)
    return out

def main():
    args = sys.argv[1:]
    def opt(name):
        if name in args:
            i = args.index(name); v = args[i + 1]; del args[i:i + 2]; return v
    out, frames_dir = opt("--out") or OUT, opt("--frames")
    if len(args) != 2: fail("usage: cut-turnaround.py <turnaround.png> <name> [--out folder] [--frames folder]")
    path, name = args
    sheet = clean(Image.open(path))
    boxes = figures(sheet)
    if len(boxes) != 3:
        fail(f"expected three figures in a row (front, back, right side) and found {len(boxes)}: {boxes}")
    views = dict(zip(("front", "back", "right"), (sheet.crop(b) for b in boxes)))
    views["left"] = views["right"].transpose(Image.FLIP_LEFT_RIGHT)
    scale = STILL * TALL / max(v.height for v in views.values())
    widest = max(v.width for v in views.values()) * scale
    if widest > STILL * 0.98: fail(f"the widest view would be {widest:.0f} pixels across in a still of {STILL}")
    os.makedirs(out, exist_ok=True)
    if frames_dir: os.makedirs(frames_dir, exist_ok=True)

    walk = Image.new("RGBA", (CELL * (FRAMES + 1), CELL * 4), (0, 0, 0, 0))
    for row, facing in enumerate(("front", "back", "left", "right")):
        fig = views[facing]
        mid = middle(fig)
        # The shadow is as wide as the stance, taken from the lowest tenth of the figure.
        low = fig.getchannel("A").crop((0, round(fig.height * 0.9), fig.width, fig.height)).getbbox()
        shade = max(STILL * 0.2, min(STILL * 0.5, (low[2] - low[0]) * scale * 1.15))
        still = place(fig, STILL, scale, mid, fig.height, shade)
        still.save(os.path.join(out, f"{name}-{facing}.png"), optimize=True)
        walk.alpha_composite(place(fig, CELL, scale, mid, fig.height, shade), (0, row * CELL))
        for i in range(FRAMES):
            bent, pad = stride(fig, facing, i, mid)
            cell = place(bent, CELL, scale, mid + pad, fig.height + pad, shade)
            walk.alpha_composite(cell, ((i + 1) * CELL, row * CELL))
            if frames_dir: cell.save(os.path.join(frames_dir, f"{name}-{facing}-{i}.png"))
    # A palette keeps the sheet small. Colour is picked with the alpha weighed in, so the
    # soft edge of a figure does not spend colours on what can barely be seen.
    walk.quantize(COLOURS, method=Image.FASTOCTREE, dither=Image.NONE).save(os.path.join(out, f"{name}-walk.png"), optimize=True)
    sizes = {f: os.path.getsize(os.path.join(out, f"{name}-{f}.png")) // 1024 for f in ("front", "back", "left", "right", "walk")}
    print(f"{name}: three figures at {boxes}, scaled by {scale:.3f}; files in KB {sizes}")

if __name__ == "__main__":
    main()
