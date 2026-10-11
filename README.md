# Anantarya (working title; the repository is still "Loot Chase")

A one-thumb arena roguelite set in a stepwell: descend three levels, beat the serpent
who drank the well dry, and bring the water back. Mobile-first, plays in a browser.
Built by one person with AI assistants.

## Where things are

```
index.html                  the site's front door: redirects to the game
game/
  loot-chase-v0.1.html      the game's page: markup and the list of scripts
  styles/game.css           the page's styles
  src/                      the game's code, 17 ordered scripts (docs/code-architecture.md)
  assets/                   pictures and sounds the game loads; CREDITS.md says whose
    incoming/               the pictures as they came, kept for re-cutting; never shipped
  vendor/                   the engine (Phaser 3.70) and the two typefaces, with licences
tools/                      checks, packaging, and the scripts that cut the art
docs/
  code-architecture.md      how the code is laid out and where to change what: start here
  requirements.md           what the game does and why, with the founder's decisions, dated
  design-document.md        milestones, the roadmap, the pinned backlog
  launch-roadmap.md         platforms and costs
  itch-page.md              the store page's text and settings
  pre-launch-security-checklist.md
concept/                    pictures made along the way
store/                      the store page's pictures
```

## Running it

Serve the folder and open it:

```bash
python -m http.server 8123
```

then <http://localhost:8123/>. There is no build step and nothing to install; the engine
and typefaces are in `game/vendor/`, so it needs no connection.

Opening the page straight off the disk does not work: browsers block the engine from
reading pictures and sounds from `file://`. Use the server.

## Checking it

```bash
node tools/check-game.mjs
```

A second, no browser: script order, words, icons, files, the save, the sums.

```bash
node tools/smoke-test.mjs
```

Five minutes, in a private, muted, headless Chrome: every screen, a full run, bots.
Needs Chrome or Edge and Node 22 or later. Nothing appears on screen and your own saved
game is not touched.

## Packaging it for itch.io

```bash
python tools/build-itch.py
```

writes `dist/itch/` and a zip beside it. Check what was built before uploading it:

```bash
node tools/check-game.mjs --package dist/itch
```

```bash
node tools/smoke-test.mjs "" dist/itch/index.html
```

`docs/pre-launch-security-checklist.md` is to be gone through before any upload.

## Where it is live

GitHub Pages serves the `main` branch: <https://venugopal-jaquen.github.io/Tantra/>.
Merging to `main` is what changes the live game.

## Changing it

`docs/code-architecture.md` has a table of "to change this, edit that", two worked
examples, and what is still tangled. `docs/requirements.md` §2.20 lists what the checks
cover.
