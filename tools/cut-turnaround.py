"""Cut a character's turnaround into the files the game plays.

Usage:
  pip install Pillow
  python tools/cut-turnaround.py <turnaround.png> <name> [--out folder] [--frames folder]

A turnaround is one picture of one character standing three ways in a row, on a clear
background: facing us, facing away, and facing right. That is what an image tool can be
asked for and keep consistent (docs/character-art-guide.md). From it this writes, into
game/assets/chars/ unless --out says otherwise:

  <name>-front.png, -back.png, -left.png, -right.png    stills of STILL pixels
  <name>-walk.png                                       for each facing in turn, PER cells
                                                        of CELL pixels: standing, FRAMES of
                                                        a walk, then ACTS of a strike
                                                        (drawing back, striking, coming out
                                                        of it). The cells run on from row
                                                        to row, COLS to a row, so that the
                                                        sheet is never wider than 2048.

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

The strike is made the same way as the walk, by bending the standing picture: the figure
rears and leans back, then throws its weight forward and down, then comes out of it. It
stands for a thrust, a throw, a cast and a slam alike. An arm cannot be moved on its own
in a picture that has only one pose, but what the hand holds can: if the figure's file
says where its staff or spear is, that is taken out of the picture, turned in the hand
and put back for each strike cell, so a staff is lifted and driven down and a spear is
levelled and thrust. No new picture is made; these are the same pixels, moved.

A file beside the turnaround with the same name and .json may say, for that figure:
  "cuff": 0.84          where the cuff is, as a part of the side view's height (CUFF)
  "legs": [0.1, 0.7]    which columns of the side view can be legs, as parts of its
                        width; a staff planted on the ground outside them is left alone
  "still": 224, "cell": 256    larger files, for a figure the game draws large
  "rear": 12            a beast: in a strike it rears this many degrees on its hind feet
  "props": {"front": {...}, "back": {...}, "right": {...}}    what it holds, in each view:
      "boxes": [[x0, y0, x1, y1], ...], "polys": [[[x, y], ...], ...] and
      "bands": [[[x0, y0], [x1, y1], width], ...] mark it out, as parts of the view's width
      and height (a band's width as a part of the height). A band may cross the body; the
      body is mended behind it. "pivot": [x, y] is the hand. "turn": three angles in
      degrees, anticlockwise, and "shift": three [dx, dy] as parts of the height, are
      where it goes in the three strike cells.

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
ACTS = 3         # strike cells per facing, after the walk: drawing back, striking, coming out of it
PER = 1 + FRAMES + ACTS      # cells per facing; the game is told this in ART too
# How each strike cell bends the figure, as parts of its height: the head rises by, the
# shoulders widen by, the head goes forward by, the body drops by.
POSES = [(0.10, 0.08, -0.09, -0.02), (-0.09, 0.10, 0.15, 0.08), (-0.04, 0.04, 0.06, 0.03)]
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

def bend(fig, source, pad=None):
    """The figure redrawn with every point taken from where `source(x, y)` says, on a
    mesh fine enough that the bending shows no joins. Room is left all round."""
    if pad is None: pad = round(fig.height * 0.08)
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

def lift(fig, spec):
    """What a figure holds, taken out of its hand: (the figure without it, the thing
    alone). Where a band of it lay across the body, the body is mended from either side."""
    w, h = fig.size
    mask = Image.new("L", (w, h), 0)
    d = ImageDraw.Draw(mask)
    for x0, y0, x1, y1 in spec.get("boxes", []): d.rectangle((x0 * w, y0 * h, x1 * w - 1, y1 * h - 1), fill=255)
    for poly in spec.get("polys", []): d.polygon([(x * w, y * h) for x, y in poly], fill=255)
    for (ax, ay), (bx, by), wide in spec.get("bands", []): d.line((ax * w, ay * h, bx * w, by * h), fill=255, width=max(1, round(wide * h)))
    alpha = fig.getchannel("A")
    piece = fig.copy()
    piece.putalpha(ImageChops.multiply(alpha, mask))
    body = fig.copy()
    body.putalpha(ImageChops.multiply(alpha, ImageChops.invert(mask.filter(ImageFilter.MaxFilter(3)))))
    src, out = fig.load(), body.load()
    for (ax, ay), (bx, by), wide in spec.get("bands", []):
        ax, ay, bx, by, half = ax * w, ay * h, bx * w, by * h, wide * h / 2 + 3
        length = math.hypot(bx - ax, by - ay) or 1
        ux, uy = (bx - ax) / length, (by - ay) / length
        nx, ny = -uy, ux
        def at(x, y):
            x, y = round(x), round(y)
            return src[x, y] if 0 <= x < w and 0 <= y < h else (0, 0, 0, 0)
        for i in range(round(length) + 1):
            for j in range(-round(half), round(half) + 1):
                x, y = round(ax + ux * i + nx * j), round(ay + uy * i + ny * j)
                if not (0 <= x < w and 0 <= y < h) or out[x, y][3] > 0: continue
                # What lies just outside the band on either side, at this point along it.
                one, two = at(x + nx * (half - j + 1), y + ny * (half - j + 1)), at(x - nx * (half + j + 1), y - ny * (half + j + 1))
                if one[3] < 128 and two[3] < 128: continue
                if one[3] < 128: one = two
                if two[3] < 128: two = one
                t = (j + half) / (2 * half)
                out[x, y] = tuple(round(two[c] * (1 - t) + one[c] * t) for c in range(3)) + (255,)
    return body, piece

def strike(fig, facing, k, mid, prop=None, rear=0):
    """Strike cell k of ACTS for one view. Seen from the side the figure leans back and
    then throws itself forward; seen from the front or the back, where forward is toward
    us or away, it swells or shrinks a little instead. What it holds turns in its hand
    (`prop`), and a beast rears on its hind feet (`rear` degrees)."""
    w, h = fig.size
    hip = h * HIP
    rise, wide, forward, drop = POSES[k]
    way = {"right": 1, "left": -1}.get(facing, 0)
    if rear: forward, rise = forward * 0.3, rise * (1 if way else 1.6)
    near = {"front": 0.5, "back": -0.5}.get(facing, 0) * forward
    leg = lambda y: smooth((y - hip) / (h - hip))            # 0 at the hip, 1 at the sole
    def source(x, y):
        up = max(0.0, min(1.0, (hip - y) / hip))             # 1 at the crown, 0 at the hip
        shoulders = math.exp(-((y / h - 0.28) / 0.2) ** 2)
        grow = 1 + wide * shoulders + near * up
        return mid + (x - mid) / grow - way * forward * h * smooth(up), y + rise * h * up - drop * h * (1 - leg(y))
    body, piece = lift(fig, prop) if prop else (fig, None)
    whole = source
    if rear and way:
        # On its hind feet: the whole picture turned about them, before anything else.
        angle = math.radians((rear, -rear / 4, 0)[k]) * way
        cx, cy, co, si = w * (0.15 if way > 0 else 0.85), h, math.cos(angle), math.sin(angle)
        whole = lambda x, y: source(cx + (x - cx) * co - (y - cy) * si, cy + (x - cx) * si + (y - cy) * co)
    bent, pad = bend(body, whole, round(h * (0.24 if prop or rear else 0.08)))
    if piece:
        px, py = prop["pivot"][0] * w, prop["pivot"][1] * h
        sx, sy = source(px, py)                               # where the bending took the hand, near enough
        dx, dy = prop["shift"][k]
        held = Image.new("RGBA", bent.size, (0, 0, 0, 0))
        held.paste(piece, (pad, pad))
        held = held.rotate(prop["turn"][k], Image.BICUBIC, center=(px + pad, py + pad))
        moved = Image.new("RGBA", bent.size, (0, 0, 0, 0))
        moved.paste(held, (round(px - sx + dx * h), round(py - sy + dy * h)))
        bent.alpha_composite(moved)
    return bent, pad

def legs(fig, cuff, columns=None):
    """The legs of a side view, cut free of the body: (body, near leg, far leg, the row
    they are cut at, whether two were found). A leg is whatever, below the cuff, is joined
    to the ground; what hangs there without reaching it stays with the body. `columns`
    keeps the search to part of the picture's width."""
    w, h = fig.size
    top = round(h * cuff)
    solid = fig.getchannel("A").point(lambda v: 255 if v > 96 else 0)
    if columns:
        only = Image.new("L", (w, h), 0)
        only.paste(solid.crop((round(w * columns[0]), 0, round(w * columns[1]), h)), (round(w * columns[0]), 0))
        solid = only
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
    global STILL, CELL
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
    STILL, CELL = hints.get("still", STILL), hints.get("cell", CELL)
    cols = min(PER * 4, 2048 // CELL)
    sheet = clean(Image.open(path))
    boxes = figures(sheet)
    if len(boxes) != 3:
        fail(f"expected three figures in a row (front, back, right side) and found {len(boxes)}: {boxes}")
    views = dict(zip(("front", "back", "right"), (sheet.crop(b) for b in boxes)))
    views["left"] = views["right"].transpose(Image.FLIP_LEFT_RIGHT)
    # One scale for all three views: the tallest fills TALL of a still, unless the widest
    # would then not fit across it (a beast on four legs is wider than it is tall).
    tallest, widest = max(v.height for v in views.values()), max(v.width for v in views.values())
    scale = min(STILL * TALL / tallest, STILL * 0.96 / widest)
    os.makedirs(out, exist_ok=True)
    if frames_dir: os.makedirs(frames_dir, exist_ok=True)

    # The side view walks facing right; facing left is those frames mirrored.
    side = views["right"]
    parts = legs(side, hints.get("cuff", CUFF), hints.get("legs"))
    strides = [side_stride(parts, i, side.height) for i in range(FRAMES)]
    props, rear = hints.get("props", {}), hints.get("rear", 0)
    blows = [strike(side, "right", k, middle(side), props.get("right"), rear) for k in range(ACTS)]
    if frames_dir:
        found = Image.new("RGBA", side.size, (90, 60, 40, 255))
        found.alpha_composite(parts[0])
        for leg, tint in ((parts[2], (60, 120, 255)), (parts[1], (255, 70, 60))):
            found.paste(Image.new("RGBA", side.size, tint + (255,)), (0, 0), leg.getchannel("A").point(lambda v: v // 2))
        found.save(os.path.join(frames_dir, f"{name}-legs.png"))
        for view, spec in props.items():
            body, piece = lift(views[view], spec)
            shown = Image.new("RGBA", body.size, (90, 60, 40, 255))
            shown.alpha_composite(body)
            shown.paste(Image.new("RGBA", body.size, (80, 255, 120, 255)), (0, 0), piece.getchannel("A").point(lambda v: v * 2 // 3))
            shown.save(os.path.join(frames_dir, f"{name}-holds-{view}.png"))
    walk = Image.new("RGBA", (CELL * cols, CELL * -(-PER * 4 // cols)), (0, 0, 0, 0))
    for row, facing in enumerate(("front", "back", "left", "right")):
        fig = views[facing]
        mid = middle(fig)
        # The shadow is as wide as the stance, taken from the lowest tenth of the figure.
        low = fig.getchannel("A").crop((0, round(fig.height * 0.9), fig.width, fig.height)).getbbox()
        shade = max(STILL * 0.2, min(STILL * 0.62, (low[2] - low[0]) * scale * 1.15))
        still = place(fig, STILL, scale, mid, fig.height, shade)
        still.save(os.path.join(out, f"{name}-{facing}.png"), optimize=True)
        def put(k, cell, label):
            at = row * PER + k
            walk.alpha_composite(cell, (at % cols * CELL, at // cols * CELL))
            if frames_dir and label: cell.save(os.path.join(frames_dir, f"{name}-{facing}-{label}.png"))
        put(0, place(fig, CELL, scale, mid, fig.height, shade), None)
        for i in range(FRAMES):
            if facing in ("front", "back"): bent, pad = stride(fig, i, mid)
            else:
                bent, pad = strides[i]
                if facing == "left": bent = bent.transpose(Image.FLIP_LEFT_RIGHT)
            put(1 + i, place(bent, CELL, scale, mid + pad, fig.height + pad, shade), str(i))
        for k in range(ACTS):
            if facing in ("front", "back"): bent, pad = strike(fig, facing, k, mid, props.get(facing), rear)
            else:
                bent, pad = blows[k]
                if facing == "left": bent = bent.transpose(Image.FLIP_LEFT_RIGHT)
            put(1 + FRAMES + k, place(bent, CELL, scale, mid + pad, fig.height + pad, shade), "act" + str(k))
    # A palette keeps the sheet small. Colour is picked with the alpha weighed in, so the
    # soft edge of a figure does not spend colours on what can barely be seen.
    walk.quantize(COLOURS, method=Image.FASTOCTREE, dither=Image.NONE).save(os.path.join(out, f"{name}-walk.png"), optimize=True)
    sizes = {f: os.path.getsize(os.path.join(out, f"{name}-{f}.png")) // 1024 for f in ("front", "back", "left", "right", "walk")}
    print(f"{name}: still {STILL}, cell {CELL}, {PER} cells a facing, {cols} to a row; the figure stands {tallest * scale / STILL:.2f} of a still tall and {widest * scale / STILL:.2f} wide, "
          f"from {tallest} pixels; side view: {'two legs' if parts[4] else 'one leg, doubled'}, cut at {parts[3] / side.height:.2f}; files in KB {sizes}")

if __name__ == "__main__":
    main()
