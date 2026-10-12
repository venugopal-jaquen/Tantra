"""
Builds the folder and the zip that itch.io takes (launch track L9).

    python tools/build-itch.py

Writes dist/itch/ - the game as itch.io will serve it, with index.html at the top - and
dist/<title>-<build>-itch.zip beside it. Nothing is downloaded and nothing under game/ is
changed; dist/ is gitignored and can be deleted at any time.

In:  the game page (as index.html), the scripts and the stylesheet it names (game/src,
     game/styles), the sprites and sounds they load, the engine and the typefaces with
     their licences, and a short credits file.
Out: the music (switched off for launch, 7 MB, and Pixabay's licence does not allow it to
     be handed out on its own), the raw asset packs, the docs and the tools.

Run the whole test suite against what was built before uploading it:

    node tools/smoke-test.mjs "" dist/itch/index.html
"""
import io, os, re, shutil, sys, zipfile

REPO = os.path.normpath(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".."))
GAME = os.path.join(REPO, "game")
DIST = os.path.join(REPO, "dist")
STAGE = os.path.join(DIST, "itch")
PAGE = "loot-chase-v0.1.html"
CONFIG = "src/config.js"        # where the game's title and build are said, and nowhere else

# What the page loads, as (folder under game/, file ending). Anything else found in those
# folders stops the build, so a stray file can never ride along unnoticed.
TAKE = [("src", ".js"), ("styles", ".css"), ("assets/chars", ".png"), ("assets/floors", ".jpg"), ("assets/icons", ".png"), ("assets/sfx", ".wav"), ("vendor", ".js"), ("vendor", ".md"),
        ("vendor/fonts", ".woff2"), ("vendor/fonts", ".txt")]
SINGLE = ["assets/bg-stars.png", "assets/title-art.jpg"]
# Addresses the page may name. The first is the feedback form's mail relay (requirements
# 2.22); the second is the name of the SVG format inside a drawn background, not a request.
ALLOWED = ["https://formsubmit.co/ajax/", "http://www.w3.org/2000/svg"]
# itch.io's limits for an HTML5 upload.
MAX_FILES, MAX_PATH, MAX_FILE_MB, MAX_TOTAL_MB = 1000, 240, 200, 500

def fail(msg):
    print("BUILD FAILED: " + msg)
    sys.exit(1)

def read(rel):
    return io.open(os.path.join(GAME, rel), encoding="utf-8", newline="").read()

html = read(PAGE)
title = re.search(r"^const GAME_TITLE = '([^']+)'", read(CONFIG), re.M)
build = re.search(r"^const BUILD = '([^']+)'", read(CONFIG), re.M)
if not title or not build:
    fail("GAME_TITLE or BUILD not found in " + CONFIG)
title, build = title.group(1), build.group(1)

# The page's code is the files it names, in the order it names them: every script in
# game/src and every sheet in game/styles is named once, nothing named is missing, and
# no code is written into the page itself.
# Each is asked for at the build's own address (?v=0.16; BUILD_TAG in src/config.js), so a
# player's cache never mixes two builds. The file is the name without it, and every tag
# must be this build's.
tag = build.split(" ")[0]
asked = re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', html) + re.findall(r'<link rel="stylesheet" href="([^"]+)"', html)
stale = [a for a in asked if not a.startswith("vendor/") and not a.endswith("?v=" + tag)]
if stale:
    fail("the page asks for these at another build's address, not ?v=" + tag + ": " + ", ".join(stale))
scripts = [re.sub(r"\?.*$", "", s) for s in re.findall(r'<script\b[^>]*\bsrc="([^"]+)"', html)]
sheets = [re.sub(r"\?.*$", "", s) for s in re.findall(r'<link rel="stylesheet" href="([^"]+)"', html)]
if re.search(r"<script(?![^>]*\bsrc=)", html) or re.search(r"<style\b", html):
    fail("the page carries code or styles of its own: they belong in game/src and game/styles")
for kind, named, folder, ending in (("script", [n for n in scripts if not n.startswith("vendor/")], "src", ".js"), ("stylesheet", sheets, "styles", ".css")):
    there = sorted(folder + "/" + n for n in os.listdir(os.path.join(GAME, folder)) if n.endswith(ending))
    if len(set(named)) != len(named):
        fail("the page names a " + kind + " twice")
    if sorted(named) != there:
        fail("the page's " + kind + "s and the files in game/" + folder + " differ: " + ", ".join(sorted(set(named) ^ set(there))))
for named in scripts + sheets:
    if not os.path.isfile(os.path.join(GAME, named)):
        fail("the page names " + named + ", which is not in game/")
sources = {PAGE: html}
sources.update({n: read(n) for n in scripts + sheets if not n.startswith("vendor/")})

for name, text in sources.items():
    for url in re.findall(r"https?://[^\s\"'<>)]+", text):
        if not any(url.startswith(a) for a in ALLOWED):
            fail(name + " names an outside address that is not on the list: " + url)

files = [(PAGE, "index.html")] + [(s, s) for s in SINGLE]
for folder, ending in TAKE:
    for name in sorted(os.listdir(os.path.join(GAME, folder))):
        if name.endswith(ending):
            files.append((folder + "/" + name, folder + "/" + name))
for folder in sorted({f for f, _ in TAKE}):
    endings = tuple(e for f, e in TAKE if f == folder)
    for name in sorted(os.listdir(os.path.join(GAME, folder))):
        if os.path.isfile(os.path.join(GAME, folder, name)) and not name.endswith(endings):
            fail("unexpected file " + folder + "/" + name + " - add its ending to TAKE or remove it")

# Every sprite, sound and typeface asked for by a fixed name must be there. (A stylesheet
# names them from its own folder, with ../ in front. Names built as the game runs, a
# figure's facings or a level's floor, are checked by tools/check-game.mjs from the
# tables that build them, and by the smoke test from what the browser really asks for.)
for name, text in sources.items():
    for ref in sorted(set(re.findall(r"'((?:assets|vendor)/[\w./-]+\.\w+)'|\"((?:assets|vendor)/[\w./-]+\.\w+)\"|url\((?:\.\./)?((?:assets|vendor)/[\w./-]+\.\w+)\)", text))):
        ref = next(r for r in ref if r)
        if ref.startswith("assets/music/"):
            continue
        if not os.path.isfile(os.path.join(GAME, ref)):
            fail(name + " asks for " + ref + ", which is not in game/")

credits = f"""{title} - build {build}

This game is built with other people's work, used under these terms.

Engine
  Phaser 3.70.0. Copyright (c) 2020 Richard Davey, Photon Storm Ltd.
  MIT licence: vendor/phaser-LICENSE.md

Typefaces
  Baloo 2. Copyright 2019 The Baloo 2 Project Authors (https://github.com/EkType/Baloo2)
  Yatra One. Copyright 2014 The Yatra Project Authors.
  SIL Open Font License 1.1: vendor/fonts/OFL-baloo2.txt, vendor/fonts/OFL-yatraone.txt

Characters, floors and icons
  The maker's own designs, generated with OpenAI's image generation in ChatGPT.

Sound effects and the ember texture
  Kenney (https://kenney.nl), CC0 1.0 Universal.
"""

if os.path.isdir(STAGE):
    shutil.rmtree(STAGE)
os.makedirs(STAGE)
for src, dst in files:
    out = os.path.join(STAGE, dst)
    os.makedirs(os.path.dirname(out), exist_ok=True)
    shutil.copyfile(os.path.join(GAME, src), out)
io.open(os.path.join(STAGE, "CREDITS.txt"), "w", encoding="utf-8", newline="\n").write(credits)

staged = []
for root, _, names in os.walk(STAGE):
    for name in names:
        full = os.path.join(root, name)
        staged.append((os.path.relpath(full, STAGE).replace(os.sep, "/"), os.path.getsize(full)))
staged.sort()
total = sum(size for _, size in staged)
if len(staged) > MAX_FILES:
    fail(f"{len(staged)} files; itch.io takes at most {MAX_FILES}")
if total > MAX_TOTAL_MB * 2**20:
    fail(f"{total / 2**20:.0f} MB unpacked; itch.io takes at most {MAX_TOTAL_MB}")
for rel, size in staged:
    if len(rel) > MAX_PATH:
        fail("path too long for itch.io: " + rel)
    if size > MAX_FILE_MB * 2**20:
        fail("file too large for itch.io: " + rel)
    if not re.fullmatch(r"[A-Za-z0-9._/-]+", rel):
        fail("a file name with characters a web server may trip on: " + rel)

slug = re.sub(r"[^a-z0-9]+", "-", title.lower()).strip("-")
number = re.match(r"[\d.]+", build)
zip_path = os.path.join(DIST, f"{slug}-{number.group(0) if number else 'build'}-itch.zip")
for old in os.listdir(DIST):
    if old.endswith("-itch.zip"):
        os.remove(os.path.join(DIST, old))
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED, compresslevel=9) as z:
    for rel, _ in staged:
        z.write(os.path.join(STAGE, rel), rel)
with zipfile.ZipFile(zip_path) as z:
    if z.testzip() is not None or "index.html" not in z.namelist():
        fail("the zip did not read back cleanly")

groups = {}
for rel, size in staged:
    key = rel.rsplit("/", 1)[0] if "/" in rel else "(top)"
    n, s = groups.get(key, (0, 0))
    groups[key] = (n + 1, s + size)
print(f"{title}, build {build}")
for key, (n, s) in groups.items():
    print(f"  {key:<16}{n:>4} files {s / 1024:>9.0f} KB")
print(f"  {'in all':<16}{len(staged):>4} files {total / 1024:>9.0f} KB unpacked")
print(f"folder: {os.path.relpath(STAGE, REPO)}")
print(f"zip:    {os.path.relpath(zip_path, REPO)}  ({os.path.getsize(zip_path) / 2**20:.2f} MB)")
