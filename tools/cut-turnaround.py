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

The walk is made from the stills, because a turnaround has no legs in motion to cut.
Seen from the front or the back the picture is bent, smoothly: one leg shortens as its
foot comes up and the weight moves over the other. Seen from the side the legs are cut
free below the cuff (where they come out from under what is worn) and each swings from
there: forward in the air, back along the ground, one passing the other, under a body
that rises as they pass. A blade or a cloth that hangs by the legs without reaching the
ground stays with the body. Where a side view shows only one leg, the one behind is a
darker copy of it. It reads as stepping at the size a phone shows it. It is not drawn
animation and will not pass for it up close; a figure whose tool can supply real walk
frames should use them instead.

A file beside the turnaround with the same name and .json may say where a figure's cuff
is, as a part of its height: {"cuff": 0.84}. Without one it is CUFF.

--frames saves every walk frame as its own picture, and the legs as they were found.
"""
import json, math, os, sys
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
HIP = 0.56       # where the legs begin, down the figure, seen from the front or the back
CUFF = 0.8       # where, down a side view, the legs come out from under what is worn
STEP = 0.07      # how far a foot swings ahead of and behind where it stood, as a part of the figure's height
RAISE = 0.035    # how high a foot comes up on its way forward
BOB = 0.012      # how far the body rises as the legs pass
BEHIND = 0.68    # how much of its light the leg behind keeps, where one leg has to stand for two

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

def stride(fig, i, mid):
    """Walk frame i of FRAMES for a view from the front or the back. Returns the picture
    and how far its corner lies up and left of the still's."""
    w, h = fig.size
    hip = h * HIP
    phase = 2 * math.pi * i / FRAMES
    leg = lambda y: smooth((y - hip) / (h - hip))            # 0 at the hip, 1 at the sole
    # One leg, then the other: the foot comes up and the leg shortens toward us, the
    # weight moves over the leg that stands, and the body rises as it passes.
    lift_l, lift_r = max(0.0, math.sin(phase)), max(0.0, -math.sin(phase))
    rise = abs(math.sin(phase))
    def source(x, y):
        side = 0.5 * (1 + math.tanh((x - mid) / (w * 0.05)))      # 0 on the left leg, 1 on the right
        lift = (1 - side) * lift_l + side * lift_r
        up = h * 0.075 * lift * leg(y) + h * 0.014 * rise * (1 - leg(y))
        over = w * 0.022 * math.sin(phase) * (1 - leg(y))
        return x - over, y + up
    return bend(fig, source)

def legs(fig, cuff):
    """The legs of a side view, cut free of the body: (body, near leg, far leg, the row
    they are cut at, whether two were found). A leg is whatever, below the cuff, is joined
    to the ground; what hangs there without reaching it stays with the body."""
    w, h = fig.size
    top = round(h * cuff)
    solid = fig.getchannel("A").point(lambda v: 255 if v > 96 else 0)
    px = solid.load()
    seen = bytearray(w * h)
    stack = [(x, y) for y in range(h - max(2, h // 40), h) for x in range(w) if px[x, y]]
    for x, y in stack: seen[y * w + x] = 1
    while stack:
        x, y = stack.pop()
        for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
            if 0 <= nx < w and top <= ny < h and px[nx, ny] and not seen[ny * w + nx]:
                seen[ny * w + nx] = 1
                stack.append((nx, ny))
    def runs(y):
        out, start = [], None
        for x in range(w + 1):
            on = x < w and seen[y * w + x]
            if on and start is None: start = x
            elif not on and start is not None:
                if x - start >= w * 0.03: out.append((start, x))
                start = None
        return out
    rows = {y: runs(y) for y in range(top, h)}
    # Two legs show as two runs on a row. The first row from which they do, down to where
    # the feet join them again, is where they are cut; above it is cloth.
    pairs = [y for y in range(top, h) if len(rows[y]) == 2]
    two = len(pairs) >= (h - top) * 0.25
    near, far = Image.new("L", (w, h), 0), Image.new("L", (w, h), 0)
    dn, df = ImageDraw.Draw(near), ImageDraw.Draw(far)
    if two:
        top, last = pairs[0], pairs[-1]
        split = edge = None
        for y in range(top, h):
            r = rows[y]
            if len(r) == 2 and y <= last:
                split, edge = (r[0][1] + r[1][0]) / 2, r[1][1]
            for x0, x1 in r:
                # Below the ankles the feet lie across each other: the near leg keeps
                # all of them as far as the far shin, the far leg all from the gap on.
                n1 = min(x1, edge if y > last else split)
                if n1 > x0: dn.line((x0, y, n1 - 1, y), fill=255)
                f0 = max(x0, split)
                if x1 > f0: df.line((f0, y, x1 - 1, y), fill=255)
    else:
        for y in range(top, h):
            for x0, x1 in rows[y]:
                dn.line((x0, y, x1 - 1, y), fill=255)
        far = near.copy()
    # The soft edge of a leg goes with the leg; nothing above the cut is taken.
    def grown(mask):
        mask = mask.filter(ImageFilter.MaxFilter(5))
        ImageDraw.Draw(mask).rectangle((0, 0, w, top - 1), fill=0)
        return mask
    near, far = grown(near), grown(far)
    alpha = fig.getchannel("A")
    def part(mask, light=1.0):
        # A few rows over the cut come too, unmoved, so that no seam shows under the body.
        keep = mask.copy()
        keep.paste(mask.crop((0, top, w, top + 1)).resize((w, 4)), (0, top - 4))
        out = fig.copy()
        if light != 1.0:
            r, g, b, _ = out.split()
            out = Image.merge("RGBA", [c.point(lambda v: round(v * light)) for c in (r, g, b)] + [alpha])
        out.putalpha(ImageChops.multiply(alpha, keep))
        return out
    body = fig.copy()
    body.putalpha(ImageChops.multiply(alpha, ImageChops.invert(ImageChops.lighter(near, far))))
    return body, part(near), part(far, 1.0 if two else BEHIND), top, two

def side_stride(parts, i, h):
    """Walk frame i of FRAMES for a figure facing right, from its legs() parts."""
    body, near, far, top, _ = parts
    phase = 2 * math.pi * i / FRAMES
    rise = round(h * BOB * abs(math.sin(phase)))
    down = lambda y: max(0.0, min(1.0, (y - top) / (h - top)))       # 0 at the cut, 1 at the sole
    def swung(leg, at):
        # A leg is ahead at 0, goes back along the ground, and comes forward in the air.
        ahead, up = math.cos(at), max(0.0, -math.sin(at))
        return bend(leg, lambda x, y: (x - h * STEP * ahead * down(y), y + rise * (1 - down(y)) + h * RAISE * up * down(y)))
    out, pad = swung(far, phase + math.pi)
    out.alpha_composite(swung(near, phase)[0])
    out.alpha_composite(bend(body, lambda x, y: (x, y + rise))[0])
    return out, pad

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
    hints = {}
    if len(args) != 2: fail("usage: cut-turnaround.py <turnaround.png> <name> [--out folder] [--frames folder]")
    path, name = args
    if os.path.isfile(os.path.splitext(path)[0] + ".json"):
        hints = json.load(open(os.path.splitext(path)[0] + ".json", encoding="utf-8"))
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

    # The side view walks facing right; facing left is those frames mirrored.
    side = views["right"]
    parts = legs(side, hints.get("cuff", CUFF))
    strides = [side_stride(parts, i, side.height) for i in range(FRAMES)]
    if frames_dir:
        found = Image.new("RGBA", side.size, (90, 60, 40, 255))
        found.alpha_composite(parts[0])
        for leg, tint in ((parts[2], (60, 120, 255)), (parts[1], (255, 70, 60))):
            found.paste(Image.new("RGBA", side.size, tint + (255,)), (0, 0), leg.getchannel("A").point(lambda v: v // 2))
        found.save(os.path.join(frames_dir, f"{name}-legs.png"))
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
            if facing in ("front", "back"): bent, pad = stride(fig, i, mid)
            else:
                bent, pad = strides[i]
                if facing == "left": bent = bent.transpose(Image.FLIP_LEFT_RIGHT)
            cell = place(bent, CELL, scale, mid + pad, fig.height + pad, shade)
            walk.alpha_composite(cell, ((i + 1) * CELL, row * CELL))
            if frames_dir: cell.save(os.path.join(frames_dir, f"{name}-{facing}-{i}.png"))
    # A palette keeps the sheet small. Colour is picked with the alpha weighed in, so the
    # soft edge of a figure does not spend colours on what can barely be seen.
    walk.quantize(COLOURS, method=Image.FASTOCTREE, dither=Image.NONE).save(os.path.join(out, f"{name}-walk.png"), optimize=True)
    sizes = {f: os.path.getsize(os.path.join(out, f"{name}-{f}.png")) // 1024 for f in ("front", "back", "left", "right", "walk")}
    print(f"{name}: three figures at {boxes}, scaled by {scale:.3f}; side view: {'two legs' if parts[4] else 'one leg, doubled'}, cut at {parts[3] / side.height:.2f}; files in KB {sizes}")

if __name__ == "__main__":
    main()
