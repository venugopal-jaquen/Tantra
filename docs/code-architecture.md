# How the code is laid out, and where to change what

Written 2026-10-11, when the game was cut from one 7,271-line page into a page, a
stylesheet and seventeen scripts (`requirements.md` §2.49). Nothing the game does was
changed by it. This is the map to give whoever makes the next change.

## 1. The shape of it

`game/loot-chase-v0.1.html` is the page: the loading screen's markup, the two dialogs,
and a list of scripts. Its styles are `game/styles/game.css`. Its code is `game/src/`.

**The scripts are classic scripts sharing one scope.** They are not ES modules and
nothing is bundled: the page names them in order, the browser runs them in order, and a
name declared at the top of one file (`const BOONS`, `function saveSession`) is seen by
every file after it. That is how the one file worked, which is why no reference had to
be rewritten. Three rules keep it orderly, and `node tools/check-game.mjs` holds the game
to them:

1. A name is declared in exactly one file. (Declaring it twice stops the page.)
2. A file may use, **as it loads**, only names from files before it. Inside a function
   it may use any name, because functions run after everything has loaded.
3. The page names every file in `game/src/` once. `tools/build-itch.py` refuses to
   package a page that names a script that is not there, or leaves one out.

Every file opens with a header saying what it declares, what it needs and what state it
owns. Read the header first.

| Order | File | What it owns |
|---|---|---|
| 1 | `config.js` | Title, build, screen size, arena size, the address switches (`QUERY`) |
| 2 | `names.js` | Every word a player reads: three packs, `N` is the one in use |
| 3 | `rules.js` | Every number and table the game is played by |
| 4 | `calculations.js` | Sums that need no screen: prices, banking, boon sums, healing |
| 5 | `persistence.js` | The save and the settings; `STORE`, the one door to storage |
| 6 | `loader.js` | The loading screen (plain DOM), and the page restarting itself after lost graphics (2.55) |
| 7 | `dialogs.js` | The feedback and naming forms (plain DOM) |
| | *the engine, `vendor/phaser-3.70.0.min.js`* | |
| 8 | `audio.js` | Sound effects' table, music player (music is off) |
| 9 | `assets.js` | Which picture stands for what; `gameAssets()`, every file loaded |
| 10 | `ui.js` | Layers, colours, the panel material (`MAT`, `drawSlab`), type |
| 11 | `floors.js` | The three floors, in three sets |
| 12 | `scene-ui.js` | Scene layer 1: pinned things, overlays, panels, buttons, icons |
| 13 | `scene-fx.js` | Scene layer 2: effects, figures and their motion, floors laid |
| 14 | `scene-screens.js` | Scene layer 3: title, profile, satchel, boons, pause, settings ... |
| 15 | `scene-systems.js` | Scene layer 4: boons, perks, tribute, Tejas, tips, lessons |
| 16 | `loot-scene.js` | The scene: its life, the run, waves, bosses, damage, `update()` |
| 17 | `boot.js` | Starts the one game; `Surround`, the page round it on a wide screen (backdrop, side panels, the request to turn a phone upright) |

**The scene is one object in five files.** `UiScene < FxScene < ScreensScene <
SystemsScene < LootScene`, each a class extending the one before, so that a method may
call any other through `this` exactly as when they were one class. It is a way of
keeping one class in files of a size that can be read, and it is not more than that:
the layers are not independent, a screen still reads the hero's state through `this`,
and a lower layer calls methods that a higher one defines. Each header lists what it
expects of the layers above. See §6 for what is still coupled.

## 2. Who owns which state

| State | Owner | Made | Cleared |
|---|---|---|---|
| `session` (the save) | `persistence.js` | Loaded once as that file runs | `resetSession()` only. Written by `saveSession()` |
| `settings` | `persistence.js` | Loaded once | Never by a reset. Written by `saveSettings()` |
| `N`, `QUERY`, `FLOORS`, `WORN` | their files | Chosen once at load, from the address | Never |
| `DEPTH_NOW` | `rules.js` | Set by `startRun()` | A global the rules read; the one such |
| One run: `this.player`, `enemies`, `pickups`, `wave`, `sector`, `phase`, `boons`, `inventory`, `tejas` | the scene | `startRun()` | The end-of-run screen's button (`endRun`) |
| An enemy: its record, sprite, bars, label, what is drawn round it | the scene | `spawnEnemyOfType` and the boss spawns | `killEnemy`, and the end of a run |
| A screen over a fight | `this.overlay` | `openOverlay()` then `ov()` | `closeOverlay()` |
| A screen of the title | `this.uiObjects` | pushed as made | `clearUI()` |
| The HUD | the scene's own fields | `create()` | Lives as long as the scene |

Opening the game reads the save and writes nothing. A panel is drawn from what is true
when it opens and drawn again when that changes; nothing keeps a copy.

**For tools and the console:** the running scene is `game.scene.keys.LootScene`
(`window.game` is set by `boot.js`). The tables are reachable by name in the page
(`session`, `settings`, `N`, `BOONS`, `ICON_FRAMES` ...), which is what
`tools/smoke-test.mjs`, `tools/playtest-bot.js`, `tools/lazy-players.mjs` and
`tools/store-shots.mjs` use. There is no separate test adapter: they read the real ones.

## 3. To change this, edit that

| To change | Edit | Then run |
|---|---|---|
| A balance number (damage, health, odds, timings, prices) | `rules.js` | both checks |
| A word, a name, a description | `names.js`, in all three packs | `check-game` |
| What an address switch does, or the screen's size | `config.js` and the file its header names | smoke |
| A boon | `rules.js` (`BOONS`), `names.js`; what it does, where its number is used: `calculations.js` or `scene-systems.js`; its icon, §4 | both |
| An item (weapon or trinket) | `rules.js`, `names.js`; its effect in `loot-scene.js` (`applyLoot` is in `scene-systems.js`); its icon, §4 | both |
| A perk | `rules.js` (`PERKS`), its effect where `perkOn('key')` is asked; its icon | both |
| A character's picture, size or proportions | cut it (`tools/cut-turnaround.py`), then `ART` in `assets.js` | both |
| Which files are loaded | `gameAssets()` in `assets.js`: the one place | `check-game` |
| A floor | `floors.js` | smoke |
| The look of every panel, card and button | `MAT` and `drawSlab` in `ui.js`; the same colours in `game.css` | smoke, and look |
| One screen | its method in `scene-screens.js` | smoke |
| An effect, an animation | `scene-fx.js` | smoke |
| The loading screen, the dialogs | `loader.js`, `dialogs.js`, `game.css` | smoke |
| The page round the game on a wide screen: its backdrops, the controls and goal beside it, the request to turn a phone upright | `Surround` in `boot.js`, `game.css`, the markup in the page; the backdrops are made by `tools/make-backdrops.py` (`requirements.md` §2.54) | smoke, and look at several screen shapes |
| What is saved, or how an old save is read | `persistence.js`; add a fixture to `check-game.mjs` | `check-game` |
| A boss, a slam, the order of a frame | `loot-scene.js`. Read §6 first | smoke, and `tools/lazy-players.mjs` |
| What is packaged | `TAKE` in `tools/build-itch.py` | the three commands of §5 |
| The build number | `BUILD` in `config.js`, **and** the `?v=` tag on every script and the stylesheet in the page and on the front page's link (`requirements.md` §2.51); the loader tags pictures and sounds itself | `check-game` (it fails if a tag differs) |

## 4. Two worked examples

**Adding a boon with its own icon.** Say a silver boon, "Steady Hand".

1. `rules.js`: add `steady: { metal: 'rare', max: 1, n: 0.1, desc: '...' }` to `BOONS`.
   The key is its identity; where it sits in the table is where it is listed.
2. `names.js`: add `steady: ['Steady Hand', '']` to `boons` in all three packs.
3. Its icon: have the token painted into `incoming/well-delver/icons/boons-silver.png`
   (`docs/art-brief-for-chatgpt.md` §5), add `"steady"` to that sheet's list in
   `tools/cut-icons.py`, run it, and paste the `ICON_FRAMES` line it prints into
   `assets.js`. (`boonIcon('steady')` then finds the frame `boon-steady`.)
4. What it does: use `this.boonRank('steady')` where the number matters. If it is a sum,
   put the sum in `calculations.js` and hand it the rank.
5. `node tools/check-game.mjs` says at once if a pack lacks its words or the frame is
   missing. Then the smoke test.

**Changing the panel material.** Say the bronze edge should be darker.

1. `ui.js`: `MAT.bronze`. Every panel, card, slot and button in the game is drawn by
   `drawSlab` from `MAT`, so that is the whole change for the game.
2. `styles/game.css`: `--edge`, for the loading cards and the dialogs. `MAT`'s comments
   say which CSS name matches which colour.
3. Run the smoke test, then look: the title, the profile, a boon card, the feedback
   dialog. A thicker edge or a different corner is in `drawSlab` itself.

## 5. Running, testing, packaging

**Running.** Serve the folder and open it:

```bash
python -m http.server 8123
```

then `http://localhost:8123/`. Opened straight off the disk (`file://`) the page reaches
Begin, but browsers block the engine from reading pictures and sounds there, so nothing
is drawn. That was so before the code was cut up, and is still so.

**Testing.** Three commands, in this order:

```bash
node tools/check-game.mjs
```

```bash
node tools/smoke-test.mjs
```

```bash
python tools/build-itch.py
```

then the same two against what was built:

```bash
node tools/check-game.mjs --package dist/itch
```

```bash
node tools/smoke-test.mjs "" dist/itch/index.html
```

`node tools/measure-pictures.mjs` prints what the pictures take in memory once loaded, at
a phone's pixel density. The browser tools find Chrome or Edge through
`tools/find-browser.mjs`.

`check-game` takes a second and needs no browser: script order, words, icons, files, the
save, the sums. The smoke test takes five minutes in a private, muted, headless Chrome:
every screen, a full run, the bots.

**Art.** `tools/cut-turnaround.py` (a figure), `tools/cut-icons.py` (the icons),
`tools/fit-title.py` (the title picture). Each reads a picture in
`game/assets/incoming/` or one the founder holds, and writes what the game loads.
`tools/make-backdrops.py` makes the blurred backdrops a wide screen shows beside the game
from the floors and the title picture; run it again when either changes.

**Entry pages.** `index.html` at the top redirects to `game/loot-chase-v0.1.html`, which
is the only game page on this branch. The candidate page `game/well-delver-playtest.html`
was another tool's copy of the old single file and was never on this branch; if it is
wanted again, it should be a page that names these same scripts with a different
`assets.js`, not a copy of them.

**Deploying.** GitHub Pages serves `main`. itch.io takes `dist/*.zip`. Neither is done
by any tool here.

## 6. What is still coupled, and what to cut next

- **The scene is still one object.** Screens read and change the run through `this`. A
  screen that took a view of the state and a list of actions would be testable alone;
  the profile and the satchel are the two to start with, after launch.
- **`loot-scene.js` is 1,900 lines** and holds the fight whole: waves, spawning, bosses,
  damage, death, `update()`. It was left together on purpose. The order things happen in
  within a frame, and the order enemies are gone through, decide who is hit first and
  what a kill sets off, and nothing checks that but playing. `damageEnemy` is the one
  door for damage to an enemy; keep it so.
- **Effects of items and boons are applied where they bite,** not in one place: a
  weapon's effect in the attack code, a boon's number where it is used. `rules.js` holds
  the numbers; the doing is in `scene-systems.js` and `loot-scene.js`.
- **`DEPTH_NOW`** is a global the scene sets and the rules read.
- **`endRun`** does the banking and draws the summary in one method.
- **The effect of each upgrade** (10% health, 8% damage a level) is written where it is
  used and in the title screen's words; only the prices are in `rules.js`.
- **The game's own drawn icons** (`makeLootIcons`, the fallback) are in `scene-ui.js`.
