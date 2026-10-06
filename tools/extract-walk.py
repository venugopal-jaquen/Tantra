"""Build the walk sheets in game/assets/chars/ from the raw CraftPix packs.

Usage:
  pip install Pillow
  python tools/extract-walk.py            # reads the zips in game/assets/incoming/ directly

One sheet per character, "<name>-walk.png". A row for each facing (front, back, left,
right, the order of FACINGS in the game); in each row the first cell is the standing
frame and the next FRAMES cells are one walk cycle, picked evenly from the pack's 20 or
30. Every frame of a row is cut from the same place on the pack's canvas and scaled by
the same amount, so the character keeps its feet from cell to cell; that amount is the
one tools/extract-chars.py uses for the 96px stills, so a sheet's standing frame and the
still are the same picture. The cell is larger than 96 so a stride never clips: the game
draws a sheet CELL/96 times larger than a still to make up for it (WALK in the game file).

Vritra has no sheet: he is drawn in code. See game/assets/CREDITS.md for the packs.
"""
import io, os, sys, zipfile
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
IN = os.path.join(REPO, "game", "assets", "incoming")
OUT = os.path.join(REPO, "game", "assets", "chars")

STILL = 96      # the size extract-chars.py fits a standing figure to
CELL = 112      # the sheet's cell: the still's 96 plus room for the stride
FRAMES = 8      # walk frames kept per facing
COLOURS = 255   # the sheet is saved with a palette; flat vector art loses nothing visible

PACKS = {
    "warrior": "craftpix-901123-free-warrior-4-direction-character-sprites.zip",
    "goblin":  "craftpix-net-228980-free-top-down-goblin-character-sprite.zip",
    "boss":    "craftpix-net-907874-free-top-down-boss-character-4-direction-pack.zip",
}
# name -> (pack, character). The same mapping as extract-chars.py, less Vritra.
ROSTER = {
    "kiran":       ("warrior", "Warrior_clothes_1"),
    "asura":       ("goblin", "Male Goblin"),
    "rakshasa":    ("goblin", "Chief Goblin"),
    "raktabija":   ("goblin", "Female Goblin"),
    "mahish":      ("boss", "Giant Goblin"),
    "bakasura":    ("boss", "Viking Leader"),
    "nidhiraksha": ("boss", "Caveman Boss"),
}
FACINGS = ["front", "back", "left", "right"]
WARRIOR_DIR = {"front": "Front", "back": "Back", "left": "Left_Side", "right": "Right_Side"}

def folder(pack, char, facing, walk):
    if pack == "warrior":
        return f"Warrior_animations/{WARRIOR_DIR[facing]}/PNG Sequences/{char}/{'Walk' if walk else 'Idle'}/"
    return f"{char}/PNG/PNG Sequences/{facing.capitalize()} - {'Walking' if walk else 'Idle'}/"

def frames(z, names, prefix):
    return sorted(n for n in names if n.startswith(prefix) and n.lower().endswith(".png"))

def build(name, pack, char, z, names):
    sheet = Image.new("RGBA", (CELL * (FRAMES + 1), CELL * len(FACINGS)), (0, 0, 0, 0))
    for row, facing in enumerate(FACINGS):
        idle = frames(z, names, folder(pack, char, facing, False))
        walk = frames(z, names, folder(pack, char, facing, True))
        if not idle or len(walk) < FRAMES:
            raise SystemExit(f"{name}-{facing}: frames not found in {PACKS[pack]}")
        picks = [idle[0]] + [walk[round(i * len(walk) / FRAMES)] for i in range(FRAMES)]
        stand = Image.open(io.BytesIO(z.read(idle[0]))).convert("RGBA")
        l, t, r, b = stand.getbbox()
        scale = STILL / max(r - l, b - t)                 # exactly the still's scale
        cx, cy = (l + r) / 2, (t + b) / 2                 # the standing figure's middle goes to the cell's middle
        for col, n in enumerate(picks):
            im = Image.open(io.BytesIO(z.read(n))).convert("RGBA")
            box = im.getbbox()
            im = im.crop(box)
            w, h = max(1, round(im.width * scale)), max(1, round(im.height * scale))
            im = im.resize((w, h), Image.LANCZOS)
            x = round(CELL / 2 + (box[0] - cx) * scale)
            y = round(CELL / 2 + (box[1] - cy) * scale)
            if x < 0 or y < 0 or x + w > CELL or y + h > CELL:
                raise SystemExit(f"{name}-{facing} frame {col} does not fit a {CELL}px cell: raise CELL")
            sheet.alpha_composite(im, (col * CELL + x, row * CELL + y))
    dst = os.path.join(OUT, f"{name}-walk.png")
    sheet.quantize(colors=COLOURS, method=Image.Quantize.FASTOCTREE, dither=Image.Dither.NONE).save(dst, optimize=True)
    return dst

if __name__ == "__main__":
    os.makedirs(OUT, exist_ok=True)
    zips, total = {}, 0
    for name, (pack, char) in ROSTER.items():
        path = os.path.join(IN, PACKS[pack])
        if not os.path.exists(path):
            sys.exit(f"missing {path}: see game/assets/incoming/DROP-ZIPS-HERE.md")
        if pack not in zips:
            z = zipfile.ZipFile(path)
            zips[pack] = (z, z.namelist())
        dst = build(name, pack, char, *zips[pack])
        size = os.path.getsize(dst)
        total += size
        print(f"  {os.path.basename(dst):22} {size / 1024:6.1f} KB")
    print(f"WROTE {len(ROSTER)} sheets, {total / 1024:.0f} KB in all ({FRAMES} walk frames + 1 standing, {CELL}px cells)")
