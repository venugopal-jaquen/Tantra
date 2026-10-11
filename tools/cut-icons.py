"""Cuts the founder's icon pictures into the icons the game shows (requirements 2.46).

    python tools/cut-icons.py            writes game/assets/icons/
    python tools/cut-icons.py --qa DIR   also writes pictures to look at: every icon at the
                                         sizes the game draws it, and the metal of the loot

The pictures are grids of icons with clear backgrounds, as asked for in
docs/art-brief-for-chatgpt.md (sections 4 and 5), kept as they came in
game/assets/incoming/well-delver/. What is written:

    icons.png        every icon in a frame of FRAME pixels, COLS to a row
    icons-small.png  the same frames at SMALL pixels, for where an icon is drawn small

and, beside the pictures it was cut from, incoming/well-delver/icons-cut.json: what each
frame was cut from. That is the record; the game does not read it and it is not shipped.

An icon is cut by its own outline and not by the lines of the grid (two of the loot icons
reach across them), cleared of the haze the pictures have where they should be clear, sized
by its kind, and set in the middle of its frame with room round it.

A loot icon is painted once, with its metal in plain steel, and made three times over: in
copper, silver and gold, the game's three qualities. Only the metal is recoloured, by its
own light and shade; leather, cloth, leaves, blood and lightning stay as painted. What
counts as metal is found by colour (steel is the only pale, unsaturated thing in these
pictures but for cloth and feathers) and, for the three icons where cloth or a feather would
be taken for steel, only inside a box drawn round the metal part.

Needs Pillow. The same pictures in give the same files out.
"""
import io, json, os, sys
from PIL import Image, ImageChops, ImageDraw, ImageFilter, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "..", "game", "assets", "incoming", "well-delver")
OUT = os.path.join(HERE, "..", "game", "assets", "icons")
FRAME, SMALL, COLS = 128, 64, 10

RARITIES = ["common", "rare", "epic"]
# Each sheet: its grid, the kind of icon in it, and what stands in each cell, left to
# right and top row first. None is a cell left empty on purpose.
SHEETS = [
    ("loot-icons.png", 4, 3, "loot", ["none", "venom", "vampiric", "chain", "executioner", "vitality", "aegis", "thorns", "swift", "regen", "mystery", None]),
    ("icons/boons-copper.png", 3, 2, "boon", ["keen", "quick", "reach", "feet", "iron", "hide"]),
    ("icons/boons-silver.png", 3, 2, "boon", ["ground", "run", "second", "readslam", "laststand", "greed"]),
    ("icons/boons-gold.png", 3, 2, "boon", ["rot", "bloodshield", "fork", "cleancut", "kindling", "hunger"]),
    ("icons/perks.png", 4, 2, "perk", ["guard", "eye", "scale", "lungs", "wind", "study", "reroll", "taker"]),
    ("icons/signs.png", 4, 3, "sign", ["treasure", "power", "health", "shield", "damage", "speed", "move", "fire", "poison", "blood", "lightning", "execution"]),
    ("icons/hud.png", 4, 2, "hud", ["satchel", "empty", "locked", "drift", "surge", "eclipse", "convergence", None]),
]
# How large an icon stands in a frame of 128: the longer side of its outline, and the most
# of the frame it may cover. The second keeps a round shield from looking larger than a
# dagger that is as long; None lets it fill what its length allows.
SIZING = {"loot": (118, 0.46), "boon": (116, None), "perk": (120, None), "sign": (114, 0.42), "hud": (114, 0.44)}
# An icon turned from how it was painted, in degrees, and why. Convergence came as four
# arrowheads pointing in from above, below and either side, which together make the
# outline of a cross with flared arms; turned to point in from the corners they read as
# "closing in" and as nothing else.
TURN = {"hud-convergence": 45}
# The metal ramps: the darkest shade, shade, the metal itself, its highlight. The third of
# each is the game's own colour for that quality (RARITY in the game); the fourth ramp is
# for the clasp of an item not yet known, in the violet the game gives the unknown.
METALS = {
    "common": [0x4a1f0c, 0x9c4f24, 0xd9844a, 0xffd0a0],
    "rare":   [0x39424e, 0x7f8b99, 0xc4ced8, 0xfbfdff],
    "epic":   [0x6a3f06, 0xc98a14, 0xffc93c, 0xfff3b0],
    "unknown": [0x2e1a5c, 0x6a48b8, 0xb48cff, 0xf0e4ff],
}
# Where the metal of a loot icon is looked for. `sat`: steel is no more saturated than
# this. `only`: boxes, as parts of the icon's cell, outside which nothing is metal.
STEEL = {
    "default": {"sat": 0.42},
    "swift":   {"sat": 0.42, "only": [[0.66, 0.06, 0.93, 0.36]]},        # the buckle; not the pale feather
    "regen":   {"sat": 0.42, "only": [[0.27, 0.57, 0.53, 0.80]]},        # the clasp round the stems
    "mystery": {"sat": 0.30, "only": [[0.50, 0.24, 0.72, 0.45]]},        # the toggle on the cord; not the cloth
}


def fail(msg):
    print("CUT FAILED: " + msg)
    sys.exit(1)


def clean_alpha(im):
    """The pictures are a hair short of solid where they are painted (249 to 254 of 255)
    and carry a haze of 2 or 3 where they should be clear. Both are put right."""
    a = im.getchannel("A").point(lambda v: 0 if v <= 12 else 255 if v >= 244 else round((v - 12) * 255 / 232))
    im = im.copy(); im.putalpha(a)
    return im


def components(mask):
    """Every separate shape in a small black-and-white picture: its size, box and middle."""
    w, h = mask.size
    px = bytearray(mask.tobytes())
    label = [0] * (w * h)
    found = []
    for start in range(w * h):
        if not px[start] or label[start]:
            continue
        n = len(found) + 1
        stack, area, sx, sy, x0, y0, x1, y1 = [start], 0, 0, 0, w, h, 0, 0
        label[start] = n
        while stack:
            p = stack.pop()
            x, y = p % w, p // w
            area += 1; sx += x; sy += y
            x0, y0, x1, y1 = min(x0, x), min(y0, y), max(x1, x), max(y1, y)
            for dy in (-1, 0, 1):
                yy = y + dy
                if yy < 0 or yy >= h: continue
                for dx in (-1, 0, 1):
                    xx = x + dx
                    if xx < 0 or xx >= w: continue
                    q = yy * w + xx
                    if px[q] and not label[q]:
                        label[q] = n; stack.append(q)
        found.append({"n": n, "area": area, "box": (x0, y0, x1 + 1, y1 + 1), "mid": (sx / area, sy / area)})
    return found, label


def cells_of(im, cols, rows):
    """The icons of a sheet, each by its own outline: [(cell index, picture, box in the sheet)]."""
    W, H = im.size
    xs = [round(W * i / cols) for i in range(cols + 1)]
    ys = [round(H * j / rows) for j in range(rows + 1)]          # for three rows of 1024: 0, 341, 683, 1024
    K = 4
    small = im.getchannel("A").resize((W // K, H // K), Image.BOX).point(lambda v: 255 if v > 20 else 0)
    found, label = components(small)
    sw = small.size[0]
    owner = {}
    for c in found:
        if c["area"] < 5:
            continue                                                # a speck of the haze
        mx, my = c["mid"][0] * K, c["mid"][1] * K
        i = max(k for k in range(cols) if xs[k] <= mx); j = max(k for k in range(rows) if ys[k] <= my)
        owner[c["n"]] = j * cols + i
    out = []
    for cell in range(cols * rows):
        mine = [c for c in found if owner.get(c["n"]) == cell]
        if not mine:
            out.append((cell, None, None)); continue
        keep = {c["n"] for c in mine}
        part = Image.frombytes("L", small.size, bytes(255 if label[p] in keep else 0 for p in range(len(label))))
        part = part.resize((sw * K, small.size[1] * K), Image.NEAREST).filter(ImageFilter.MaxFilter(2 * K + 1))
        full = Image.new("L", (W, H), 0); full.paste(part, (0, 0))
        alpha = ImageChops.darker(im.getchannel("A"), full)
        box = alpha.point(lambda v: 255 if v > 8 else 0).getbbox()
        icon = im.crop(box); icon.putalpha(alpha.crop(box))
        out.append((cell, icon, box))
    return out, xs, ys


def ramp_luts(stops):
    """Three tables that turn a light level into a metal's colour at that level."""
    at = [0.0, 0.34, 0.70, 1.0]
    rgb = [((s >> 16) & 255, (s >> 8) & 255, s & 255) for s in stops]
    luts = [[], [], []]
    for v in range(256):
        t = v / 255
        k = max(i for i in range(3) if at[i] <= t)
        f = (t - at[k]) / (at[k + 1] - at[k])
        for ch in range(3):
            luts[ch].append(round(rgb[k][ch] + (rgb[k + 1][ch] - rgb[k][ch]) * f))
    return luts


def steel_mask(icon, box, cellbox, rule):
    """Where a loot icon is metal: soft-edged, white where it is."""
    rgb = icon.convert("RGB")
    sat = rgb.convert("HSV").getchannel("S")
    limit = round(rule["sat"] * 255)
    mask = ImageChops.darker(sat.point(lambda s: 255 if s < limit else 0), icon.getchannel("A").point(lambda v: 255 if v > 128 else 0))
    if "only" in rule:
        allow = Image.new("L", icon.size, 0)
        d = ImageDraw.Draw(allow)
        cx0, cy0, cx1, cy1 = cellbox
        for x0, y0, x1, y1 in rule["only"]:
            d.rectangle([cx0 + x0 * (cx1 - cx0) - box[0], cy0 + y0 * (cy1 - cy0) - box[1], cx0 + x1 * (cx1 - cx0) - box[0], cy0 + y1 * (cy1 - cy0) - box[1]], fill=255)
        mask = ImageChops.darker(mask, allow)
    # Specks are dropped and pinholes filled, then the edge is softened so that no line shows.
    mask = mask.filter(ImageFilter.MinFilter(5)).filter(ImageFilter.MaxFilter(5))
    mask = mask.filter(ImageFilter.MaxFilter(7)).filter(ImageFilter.MinFilter(7))
    return mask.filter(ImageFilter.GaussianBlur(1.3))


def in_metal(icon, mask, stops):
    """The icon with its steel turned to a metal, keeping the steel's own light and shade."""
    light = icon.convert("L")
    hist = light.histogram(mask.point(lambda v: 255 if v > 128 else 0))
    total = sum(hist) or 1
    def level(part):
        run = 0
        for v in range(256):
            run += hist[v]
            if run >= total * part: return v
        return 255
    lo, hi = level(0.03), max(level(0.985), level(0.03) + 1)
    t = light.point(lambda v: max(0, min(255, round((v - lo) * 255 / (hi - lo)))))
    r, g, b = ramp_luts(stops)
    metal = Image.merge("RGB", (t.point(r), t.point(g), t.point(b)))
    out = Image.composite(metal, icon.convert("RGB"), mask).convert("RGBA")
    out.putalpha(icon.getchannel("A"))
    return out


def fit(icon, kind, size):
    """An icon set into a square frame: sized by its kind, in the middle by eye."""
    longest, most = SIZING[kind]
    k = size / FRAME
    w, h = icon.size
    scale = longest * k / max(w, h)
    solid = sum(icon.getchannel("A").point(lambda v: 255 if v > 128 else 0).histogram()[255:])
    if most:
        scale = min(scale, (most * size * size / solid) ** 0.5)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    # Resized with its colour weighted by how solid it is, so that no dark or pale line
    # forms where the icon ends.
    small = icon.convert("RGBa").resize((nw, nh), Image.LANCZOS).convert("RGBA")
    # In the middle of its outline, drawn a third of the way to the middle of its weight.
    a = icon.getchannel("A").resize((max(1, w // 4), max(1, h // 4)), Image.BOX)
    aw, ah = a.size
    data = a.tobytes(); tot = sum(data) or 1
    wx = sum(v * (i % aw) for i, v in enumerate(data)) / tot / aw
    wy = sum(v * (i // aw) for i, v in enumerate(data)) / tot / ah
    pad = round(4 * k)
    x = round(size / 2 - nw * (0.5 + 0.35 * (wx - 0.5)))
    y = round(size / 2 - nh * (0.5 + 0.35 * (wy - 0.5)))
    x = max(pad, min(size - pad - nw, x)); y = max(pad, min(size - pad - nh, y))
    frame = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    frame.alpha_composite(small, (x, y))
    return frame, scale / k


def main():
    qa = sys.argv[sys.argv.index("--qa") + 1] if "--qa" in sys.argv else None
    frames, record, masks = [], [], []
    for file, cols, rows, kind, names in SHEETS:
        path = os.path.join(SRC, file)
        if not os.path.exists(path):
            fail("missing " + file)
        im = clean_alpha(Image.open(path).convert("RGBA"))
        found, xs, ys = cells_of(im, cols, rows)
        for cell, icon, box in found:
            name = names[cell]
            if name is None:
                if icon is not None: fail(f"{file}: cell {cell} is meant to be empty and is not")
                continue
            if icon is None:
                fail(f"{file}: nothing found in cell {cell} ({name})")
            cellbox = (xs[cell % cols], ys[cell // cols], xs[cell % cols + 1], ys[cell // cols + 1])
            base = {"source": "game/assets/incoming/well-delver/" + file, "cell": cell, "cut": list(box)}
            if kind == "loot":
                rule = STEEL.get(name, STEEL["default"])
                mask = steel_mask(icon, box, cellbox, rule)
                share = round(sum(mask.point(lambda v: 255 if v > 128 else 0).histogram()[255:]) / max(1, sum(icon.getchannel("A").point(lambda v: 255 if v > 128 else 0).histogram()[255:])), 3)
                if share < 0.004: fail(f"{file}: no metal found in {name}")
                variants = [("loot-mystery", "unknown")] if name == "mystery" else [(f"loot-{name}-{r}", r) for r in RARITIES]
                for frame_name, metal in variants:
                    frames.append((frame_name, kind, in_metal(icon, mask, METALS[metal])))
                    record.append(dict(base, name=frame_name, metal=metal, metalShare=share, steel=rule))
                masks.append((name, icon, mask))
            else:
                full = f"{kind}-{name}"
                if full in TURN:
                    icon = icon.convert("RGBa").rotate(TURN[full], resample=Image.BICUBIC, expand=True).convert("RGBA")
                    icon = icon.crop(icon.getchannel("A").point(lambda v: 255 if v > 8 else 0).getbbox())
                    base["turned"] = TURN[full]
                frames.append((full, kind, icon))
                record.append(dict(base, name=full))

    names = [f[0] for f in frames]
    if len(set(names)) != len(names): fail("two frames have one name")
    rows = -(-len(frames) // COLS)
    os.makedirs(OUT, exist_ok=True)
    for size, file in ((FRAME, "icons.png"), (SMALL, "icons-small.png")):
        sheet = Image.new("RGBA", (COLS * size, rows * size), (0, 0, 0, 0))
        for n, (name, kind, icon) in enumerate(frames):
            frame, scale = fit(icon, kind, size)
            edge = frame.getchannel("A").point(lambda v: 255 if v > 0 else 0).getbbox()
            clear = round(2 * size / FRAME)
            if not edge or edge[0] < clear or edge[1] < clear or edge[2] > size - clear or edge[3] > size - clear:
                fail(f"{name} reaches the edge of its frame at {size}")
            sheet.alpha_composite(frame, ((n % COLS) * size, (n // COLS) * size))
            if size == FRAME:
                record[n].update(frame=n, scale=round(scale, 4))
        sheet.save(os.path.join(OUT, file), optimize=True)
        print(f"{file}: {sheet.size[0]} x {sheet.size[1]}, {len(frames)} frames of {size}, {os.path.getsize(os.path.join(OUT, file)) // 1024} KB")
    doc = {"about": "What each frame of icons.png and icons-small.png was cut from, by tools/cut-icons.py. The game does not read this file.",
           "frame": FRAME, "small": SMALL, "columns": COLS, "frames": record}
    io.open(os.path.join(SRC, "icons-cut.json"), "w", encoding="utf-8", newline="\n").write(json.dumps(doc, indent=1) + "\n")
    print("const ICON_FRAMES = '" + " ".join(names) + "'.split(' ');")
    if qa:
        os.makedirs(qa, exist_ok=True)
        look(frames, masks, qa)


def look(frames, masks, out):
    """Pictures for a person to check: the metal of the loot, and every icon at the sizes
    the game draws it, on the grounds it is drawn on."""
    try:
        font = ImageFont.truetype("arial.ttf", 13); bold = ImageFont.truetype("arialbd.ttf", 15)
    except OSError:
        font = bold = ImageFont.load_default()
    # 1. The metal: as painted, what was taken for metal, and the three qualities.
    S = 150
    sheet = Image.new("RGB", (6 * S + 90, len(masks) * S + 26), (58, 34, 22))
    d = ImageDraw.Draw(sheet)
    for i, head in enumerate(["as painted", "taken for metal", "copper", "silver", "gold", "unknown"]):
        d.text((90 + i * S + 8, 6), head, font=font, fill=(240, 220, 192))
    by = {n: i for n, _, i in frames}
    for row, (name, icon, mask) in enumerate(masks):
        y = 26 + row * S
        d.text((6, y + S // 2 - 8), name, font=bold, fill=(255, 210, 60))
        def put(im, col):
            im = im.copy(); im.thumbnail((S - 10, S - 10), Image.LANCZOS)
            sheet.paste(im.convert("RGB"), (90 + col * S + (S - im.width) // 2, y + (S - im.height) // 2), im if im.mode == "RGBA" else None)
        put(icon, 0); put(mask.convert("RGB"), 1)
        if name == "mystery": put(by["loot-mystery"], 5)
        else:
            for k, r in enumerate(RARITIES): put(by[f"loot-{name}-{r}"], 2 + k)
    sheet.save(os.path.join(out, "loot-metal.jpg"), quality=90)
    # 2. Every icon at the sizes it is drawn, as a phone with two device pixels to one of
    # the game's draws it (the harder case; with three, everything is half as large again).
    # Each icon twice: on a panel as the game's screens have them, and on the darker one.
    DPR, sizes, grounds = 2, [16, 20, 24, 34], [(74, 26, 4), (30, 11, 3)]
    def shown(kind, icon, s):
        px = s * DPR
        src, _ = fit(icon, kind, SMALL if px <= SMALL else FRAME)          # as the game chooses (iconImg)
        return src.convert("RGBa").resize((px, px), Image.BILINEAR).convert("RGBA")
    def tiles(which, file, per_row=5):
        tw, th = sum(s * DPR + 6 for s in sizes) + 10, 18 + len(grounds) * (max(sizes) * DPR + 6)
        rows = -(-len(which) // per_row)
        sheet = Image.new("RGB", (per_row * (tw + 6) + 6, rows * (th + 6) + 26), (16, 7, 3))
        d = ImageDraw.Draw(sheet)
        d.text((8, 5), "Each icon at " + ", ".join(str(s) for s in sizes) + " of the game's pixels, drawn at twice that as a phone does; on a panel, and on a dark one", font=font, fill=(240, 220, 192))
        for n, (name, kind, icon) in enumerate(which):
            x0, y0 = 6 + (n % per_row) * (tw + 6), 26 + (n // per_row) * (th + 6)
            d.text((x0 + 2, y0), name, font=font, fill=(255, 210, 60))
            for g, ground in enumerate(grounds):
                y = y0 + 18 + g * (max(sizes) * DPR + 6)
                d.rectangle([x0, y, x0 + tw - 1, y + max(sizes) * DPR + 5], fill=ground)
                x = x0 + 5
                for s in sizes:
                    im = shown(kind, icon, s)
                    sheet.paste(im.convert("RGB"), (x, y + 3 + (max(sizes) - s) * DPR // 2), im)
                    x += s * DPR + 6
        sheet.save(os.path.join(out, file), quality=92)
    tiles([f for f in frames if f[1] == "loot"], "icons-loot.jpg")
    tiles([f for f in frames if f[1] != "loot"], "icons-other.jpg")
    # 3. Loot where it lies: on the three floors, at the size it is drawn there.
    floors = [Image.open(os.path.join(OUT, "..", "floors", f"level-{n}.jpg")).convert("RGB") for n in (1, 2, 3)]
    loot = [f for f in frames if f[1] == "loot"]
    on, cell, per = [20, 24, 28], 64, 16
    lines = -(-len(loot) // per)
    band = len(on) * lines * cell
    sheet = Image.new("RGB", (per * cell, len(floors) * band + 22), (16, 7, 3))
    d = ImageDraw.Draw(sheet)
    d.text((8, 4), "Loot on the three floors at " + ", ".join(str(s) for s in on) + " of the game's pixels (twice that here)", font=font, fill=(240, 220, 192))
    for f, floor in enumerate(floors):
        x0, y0 = int(floor.width * 0.12), int(floor.height * 0.3)
        piece = floor.crop((x0, y0, x0 + int(sheet.width / 1.26), y0 + int(band / 1.26)))          # the floor at the size the game lays it
        sheet.paste(piece.resize((sheet.width, band), Image.LANCZOS), (0, 22 + f * band))
        for k, s in enumerate(on):
            for n, (name, kind, icon) in enumerate(loot):
                im = shown(kind, icon, s)
                sheet.paste(im.convert("RGB"), ((n % per) * cell + (cell - im.width) // 2, 22 + f * band + (k * lines + n // per) * cell + (cell - im.height) // 2), im)
    sheet.save(os.path.join(out, "loot-on-floors.jpg"), quality=92)
    print("to look at, in", out + ":", "loot-metal.jpg, icons-loot.jpg, icons-other.jpg, loot-on-floors.jpg")


if __name__ == "__main__":
    main()
