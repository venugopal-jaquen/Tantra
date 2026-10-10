"""
Builds the folder and the zip that itch.io takes (launch track L9).

    python tools/build-itch.py

Writes dist/itch/ - the game as itch.io will serve it, with index.html at the top - and
dist/<title>-<build>-itch.zip beside it. Nothing is downloaded and nothing under game/ is
changed; dist/ is gitignored and can be deleted at any time.

In:  the game page (as index.html), the sprites and sounds it loads, the engine and the
     typefaces with their licences, and a short credits file.
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

# What the page loads, as (folder under game/, file ending). Anything else found in those
# folders stops the build, so a stray file can never ride along unnoticed.
TAKE = [("assets/chars", ".png"), ("assets/sfx", ".wav"), ("vendor", ".js"), ("vendor", ".md"),
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

html = io.open(os.path.join(GAME, PAGE), encoding="utf-8", newline="").read()
title = re.search(r"const GAME_TITLE = '([^']+)'", html)
build = re.search(r"const BUILD = '([^']+)'", html)
if not title or not build:
    fail("GAME_TITLE or BUILD not found in the game page")
title, build = title.group(1), build.group(1)

for url in re.findall(r"https?://[^\s\"'<>)]+", html):
    if not any(url.startswith(a) for a in ALLOWED):
        fail("the page names an outside address that is not on the list: " + url)

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

# Every sprite and sound the page asks for by a fixed name must be there.
for ref in sorted(set(re.findall(r"'((?:assets|vendor)/[\w./-]+\.\w+)'|\"((?:assets|vendor)/[\w./-]+\.\w+)\"|url\(((?:assets|vendor)/[\w./-]+\.\w+)\)", html))):
    ref = next(r for r in ref if r)
    if ref.startswith("assets/music/"):
        continue
    if not os.path.isfile(os.path.join(GAME, ref)):
        fail("the page asks for " + ref + ", which is not in game/")

credits = f"""{title} - build {build}

This game is built with other people's work, used under these terms.

Engine
  Phaser 3.70.0. Copyright (c) 2020 Richard Davey, Photon Storm Ltd.
  MIT licence: vendor/phaser-LICENSE.md

Typefaces
  Baloo 2. Copyright 2019 The Baloo 2 Project Authors (https://github.com/EkType/Baloo2)
  Yatra One. Copyright 2014 The Yatra Project Authors.
  SIL Open Font License 1.1: vendor/fonts/OFL-baloo2.txt, vendor/fonts/OFL-yatraone.txt

Characters
  Rendered from KayKit Character Pack: Adventurers by Kay Lousberg
  (www.kaylousberg.com), Creative Commons Zero.

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
