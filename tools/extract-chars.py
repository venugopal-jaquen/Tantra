"""Rebuild game/assets/chars/ from the raw CraftPix packs.

Usage:
  1. Download the four free packs listed in game/assets/incoming/DROP-ZIPS-HERE.md
  2. Unzip each into game/assets/incoming/extracted/<pack-name>/
  3. pip install Pillow && python tools/extract-chars.py

Takes the first Idle frame of each of the four facings per character, trims it to
its alpha bounds, and fits it to a 96x96 tile. See game/assets/CREDITS.md.
"""
import os, sys, glob
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(HERE)
# Extract the four CraftPix zips from game/assets/incoming/ into this folder first.
S = os.path.join(REPO, "game", "assets", "incoming", "extracted")
OUT = os.path.join(REPO, "game", "assets", "chars")
os.makedirs(OUT, exist_ok=True)

SIZE = 96  # entities draw at ~24-46px; 96 gives retina headroom without bloat

# name -> (pack, character, style)  style: "std" = PNG Sequences/<Dir> - Idle ; "warrior" = Warrior_animations/<Dir>/...
ROSTER = {
    "kiran":       ("warrior-4-direction-character-sprites", "Warrior_clothes_1", "warrior"),
    "asura":       ("top-down-goblin-character-sprite", "Male Goblin", "std"),
    "yaksha":      ("top-down-goblin-character-sprite", "Chief Goblin", "std"),
    "bheda":       ("top-down-goblin-character-sprite", "Female Goblin", "std"),
    "mahish":      ("top-down-boss-character-4-direction-pack", "Giant Goblin", "std"),
    "dwarapal":    ("top-down-boss-character-4-direction-pack", "Viking Leader", "std"),
    "nidhiraksha": ("top-down-boss-character-4-direction-pack", "Caveman Boss", "std"),
    "kalachakra":  ("medieval-bandit-4-direction-character-pack", "Assassin", "std"),
}
DIRS_STD = {"front": "Front", "back": "Back", "left": "Left", "right": "Right"}
DIRS_WAR = {"front": "Front", "back": "Back", "left": "Left_Side", "right": "Right_Side"}

def first_frame(folder):
    fs = sorted(glob.glob(os.path.join(folder, "*.png")))
    return fs[0] if fs else None

def crop_and_scale(path):
    im = Image.open(path).convert("RGBA")
    bbox = im.getbbox()          # trim the transparent margin so the figure fills the tile
    if bbox: im = im.crop(bbox)
    w, h = im.size
    s = SIZE / max(w, h)
    im = im.resize((max(1,round(w*s)), max(1,round(h*s))), Image.LANCZOS)
    canvas = Image.new("RGBA", (SIZE, SIZE), (0,0,0,0))
    canvas.paste(im, ((SIZE-im.size[0])//2, (SIZE-im.size[1])//2), im)
    return canvas

made, failed = [], []
for name, (pack, char, style) in ROSTER.items():
    for key, d in (DIRS_WAR if style=="warrior" else DIRS_STD).items():
        if style == "warrior":
            folder = f"{S}/{pack}/Warrior_animations/{d}/PNG Sequences/{char}/Idle"
        else:
            folder = f"{S}/{pack}/{char}/PNG/PNG Sequences/{d} - Idle"
        src = first_frame(folder)
        if not src:
            failed.append(f"{name}-{key}: {folder}"); continue
        dst = f"{OUT}/{name}-{key}.png"
        crop_and_scale(src).save(dst, optimize=True)
        made.append((f"{name}-{key}.png", os.path.getsize(dst)))

print(f"WROTE {len(made)} sprites")
for n, sz in made: print(f"  {n:26} {sz/1024:5.1f} KB")
if failed:
    print(f"\nFAILED {len(failed)}:")
    for f in failed: print("  " + f)
