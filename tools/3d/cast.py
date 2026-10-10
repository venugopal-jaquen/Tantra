"""
The cast, and how each is made from the free KayKit models (roadmap L14). Run:

    python tools/3d/cast.py <pack-folder> [name ...] [--look]

<pack-folder> is the KayKit Adventurers folder that holds Characters/ and Textures/.
With names, only those are built. --look renders just the front and right standing frames
into tools/3d/_work/<name>/ for a quick check and packs nothing.

Each entry: the model; the recolour (swatch = hue, saturation, brightness multiplier: see
recolour.py and uvcells.py); what to hide; the pieces added (pieces.py); the stretch; the
walk it uses; and a wider view (zoom) for a figure whose horns and axe would leave the frame. Colour rule: the hero is the one warm, bright figure; everything hostile is
cool or dark, so it stands off the sandstone.
"""
import os, sys, subprocess

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))
BLENDER = os.environ.get("BLENDER") or os.path.join(REPO, "tools", "_blender", "b45", "blender.exe")   # set BLENDER when this checkout has none of its own
WORK = os.path.join(HERE, "_work")
OUT = os.path.join(REPO, "game", "assets", "chars")
BARB_HIDE = "Icosphere,Offhand,Mug,Cape"

CAST = {
    # the hero: saffron turban, cream tunic, warm skin, a curved dagger
    "kiran": dict(model="Rogue", texture="rogue",
        recolour="0,0=24,0.52,0.74; 1,0=25,0.25,0.22; 0,1=40,0.12,1.6; 1,1=22,0.9,1.25; 3,2=5,0.72,0.75",
        hide="Icosphere,Offhand,Crossbow,Throwable,Cape", pieces="turban", walk="Running_A"),
    # rank and file: storm-blue skin, black beard, red and gold, two horns, an axe
    "asura": dict(model="Barbarian", texture="barbarian",
        recolour="0,0=236,0.42,0.8; 1,0=235,0.35,0.3; 0,1=2,0.82,1.0; 1,1=2,0.85,0.9; 2,1=42,0.8,0.95; 7,0=250,0.3,0.45; 3,2=260,0.3,0.5",
        hide=BARB_HIDE + ",2H_Axe,Shield,Hat", pieces="horns", walk="Walking_A"),
    # ranged: sallow green skin, a violet robe and cloak, a tall cap, a staff with a burning head
    "rakshasa": dict(model="Mage", texture="mage",
        recolour="0,0=92,0.4,0.82; 1,0=285,0.3,0.25; 0,1=285,0.55,0.7; 2,1=205,0.55,0.45; 3,2=280,0.4,0.4; 6,2=28,0.95,1.3; 7,2=285,0.4,0.5",
        hide="Icosphere,Spellbook,1H_Wand,Hat", pieces="hexhat", walk="Walking_A"),
    # the buffalo: half as wide again, grey hide, a dark hood with sweeping horns, a great axe
    "mahish": dict(model="Barbarian", texture="barbarian",
        recolour="0,0=265,0.14,0.62; 1,0=20,0.2,0.22; 0,1=350,0.5,0.34; 1,1=350,0.5,0.3; 2,1=40,0.25,0.85; 7,0=18,0.3,0.32; 3,2=20,0.35,0.35",
        hide=BARB_HIDE + ",1H_Axe,Shield", pieces="buffalo", stretch="1.34,1.3,1.06", zoom="2.1", walk="Walking_A"),
    # the splitter: crimson from hood to boot, a blade in each hand, buds swelling on its back
    "raktabija": dict(model="Rogue_Hooded", texture="rogue",
        recolour="0,0=338,0.4,0.95; 1,1=350,0.82,0.7; 0,1=346,0.8,0.5; 3,2=335,0.55,0.4; 5,2=350,0.5,0.45; 5,0=350,0.5,0.4",
        hide="Icosphere,Crossbow,Throwable,Cape", pieces="seeds", walk="Running_A"),
    # the first boss: ash skin, dark steel plate edged with gold, a red cloak, a spiked helm, a shield like a bronze door
    "bakasura": dict(model="Knight", texture="knight",
        recolour="0,0=268,0.16,0.68; 1,0=40,0.08,0.9; 3,0=218,0.5,0.5; 7,0=42,0.85,1.1; 4,0=42,0.85,1.0; 7,1=222,0.45,0.32; 6,0=20,0.6,0.5; 0,1=356,0.85,0.9; 3,1=36,0.72,0.95; 5,1=24,0.7,0.55; 6,1=356,0.8,0.75",
        hide="Icosphere,2H_Sword,Offhand,Badge_Shield,Round_Shield,Spike_Shield,Helmet", pieces="helm", stretch="1.14,1.14,1.1", walk="Walking_A"),
    # the level's boss: iron-dark all over with gold laid on it: a gold beard, gold trim, a flat gold helm, a round gold shield like a vault door
    "nidhiraksha": dict(model="Barbarian", texture="barbarian",
        recolour="0,0=225,0.2,0.5; 1,0=44,0.9,1.05; 0,1=228,0.4,0.3; 1,1=228,0.4,0.26; 2,1=44,0.9,1.0; 7,0=228,0.3,0.25; 6,0=42,0.85,0.9; 3,2=350,0.6,0.38; 7,1=228,0.3,0.3; 4,1=44,0.9,1.05; 3,1=44,0.55,1.0; 5,1=24,0.6,0.5",
        hide=BARB_HIDE + ",2H_Axe,Hat", pieces="vault", stretch="1.38,1.32,1.02", walk="Walking_A"),
}

def run(cmd):
    r = subprocess.run(cmd, capture_output=True, text=True)
    bad = [x for x in (r.stdout + r.stderr).splitlines() if "Traceback" in x or "Error" in x or "NO SUCH" in x]
    if r.returncode or bad:
        print("\n".join(bad or [r.stderr[-800:]])); sys.exit(1)
    return r.stdout

def build(pack, name, look):
    c = CAST[name]
    work = os.path.join(WORK, name); os.makedirs(work, exist_ok=True)
    tex = os.path.join(work, "texture.png")
    run([sys.executable, os.path.join(HERE, "recolour.py"), os.path.join(pack, "Textures", c["texture"] + "_texture.png"), tex, c["recolour"]])
    cmd = [BLENDER, "-b", "--factory-startup", "--python", os.path.join(HERE, "render_char.py"), "--",
           "--glb", os.path.join(pack, "Characters", "gltf", c["model"] + ".glb"), "--out", work,
           "--hide", c["hide"], "--texture", tex, "--pieces", c.get("pieces", ""), "--stretch", c.get("stretch", "1,1,1"), "--zoom", c.get("zoom", "1.6")]
    if look:
        run(cmd + ["--anims", "Idle:1", "--only", "front,right"]); print("looked at", name); return
    walk = c["walk"]
    run(cmd + ["--anims", "Idle:1," + walk + ":8"])
    print(run([sys.executable, os.path.join(HERE, "pack_sheet.py"), work, OUT, name, "--walk", walk, "--colours", "255"]).strip())

if __name__ == "__main__":
    args = [x for x in sys.argv[1:] if not x.startswith("--")]
    pack, names = args[0], args[1:] or list(CAST)
    for n in names:
        build(pack, n, "--look" in sys.argv)
