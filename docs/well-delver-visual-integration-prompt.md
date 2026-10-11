# Claude handoff: integrate the Well Delver visuals and unify the screens

Paste the prompt below into Claude with access to the project. Paths inside the prompt are relative to the repository root unless stated otherwise.

---

You are implementing a visual integration pass for my existing game. Another assistant created the approved Well Delver artwork; you are responsible for turning those source assets into a coherent, production-ready game presentation.

Repository: `C:\Users\venug\Documents\Game\loot-chase-project`

## Outcome and boundaries

Integrate the approved character designs, three level backgrounds, loot icons and six additional icon sheets. Bring **all player-facing screens into the same material language**, not just the combat arena. The game should feel like one deliberately designed world rather than new sprites placed over an unrelated interface.

This authorizes implementation of art loading, deterministic asset preparation, presentation-only animation, UI material styling, packaging fixes and relevant tests/documentation. It does **not** authorize changes to balance, pacing, controls, enemy AI, collision, loot rules, progression, save formats, naming packs, sound timing or mechanics. Do not rename the game: “Well Delver” is the art direction, not a replacement for the current game title. Do not redesign the first-run pacing; I am evaluating that separately.

Preserve unrelated work. Another tool/session may be editing this folder. Check current files and overlapping changes before editing; never reset, discard or overwrite someone else's work. Do not automatically commit, push, change branches, deploy or publish. Preserve the full-resolution artwork and previous production assets in a recoverable location outside the shipping asset list. Do not use broad recursive cleanup.

Start with a short evidence-based integration plan, then implement in reviewable stages. Do not stop after proposing a plan or ask me to reconfirm this scope. Complete the unaffected parts if one asset needs further art production; report that limitation honestly.

## Read the current project before integrating

Read applicable repository instructions, `docs/requirements.md`, `docs/design-document.md`, `docs/launch-roadmap.md`, `docs/well-delver-visual-contract.md`, `docs/well-delver-integration-handoff.md`, and `game/assets/chars/well-delver-v1/README.md`. Inspect the current main build, not just a screenshot or old documentation:

- `game/loot-chase-v0.1.html` is the production game page.
- `game/well-delver-playtest.html` is a separate candidate validation page.
- `tools/build-itch.py` controls what actually ships.
- `tools/smoke-test.mjs` is the existing regression suite.

Older art notes refer to stock sprites and earlier Cosmic Forge treatments. Use the approved assets and the visual contract in **this prompt** for the new presentation, while preserving the current game's functional requirements. Do not undo current features because an older README describes an earlier build. If current code differs from the observations below, adapt to the current code and explain the difference.

## 1. Shared visual contract

The world is a weathered stepwell: warm sandstone, terracotta, old water, accumulated treasure, aged bronze, cream cloth and worn brown leather. Characters and objects are stylised low-poly 3D rendered into sprites: chunky silhouettes, faceted planes, painted matte surfaces, warm light from above, restrained cool-teal accents. Avoid glossy mobile-casino gold, modern neon, generic medieval UI or near-black/purple sci-fi styling.

The hero remains readable through teal + cream + terracotta. Enemy identities come from their approved silhouettes and charcoal/indigo, terracotta, bronze and selective magical accents. Do not redesign characters during extraction or invent new equipment. In particular, do not turn the revised unarmed Brute back into a hammer character; preserve the chest-shaped Guardian, its round shield and floating ornaments.

Use a consistent category grammar:

- Loot: a recognisable physical object.
- Boons: thick round metal tokens with coloured raised emblems.
- Perks: keepsake charms on violet cord.
- Stats/powers: bare emblems, without tokens or cord.
- Empty, locked and unknown: three different meanings, three different visuals.

Copper/silver/gold communicate rarity. Violet communicates perks and existing unknown-item semantics, not a fourth rarity. Functional colour remains functional: red danger/health/blood, green poison, aqua/teal power lightning, amber fire, and the established phase families. Keep shapes, labels and state cues so colour is never the only distinction.

The plain steel in the loot source is deliberate: it permits metal-only rarity recolouring. It is not a request to replace the world's aged-bronze material language with polished steel.

Do not introduce religious symbols, deity likenesses, sacred marks, skull motifs or new faith-associated ornaments. Preserve the existing naming/localisation choices; this is not a naming or cultural-identity rewrite.

## 2. Approved asset manifest: use these versions

### Characters

The hero and Asura have a ready candidate pack in `game/assets/chars/well-delver-v1/`:

- `wellhero-{front,back,left,right}.png` and `wellasura-{front,back,left,right}.png`: 96 × 96 transparent stills.
- `wellhero-walk.png` and `wellasura-walk.png`: 1008 × 448, nine columns and four rows of 112 × 112 cells. Rows: front, back, left, right. Each row: one idle frame, then eight walk frames.
- Approved originals are under its `source/` folder.

These walk sheets are pose-derived bob/weight-shift cycles, **not articulated limb animation**. I have already seen this pair running successfully in a main build. First determine whether your current checkout already integrates them; preserve a working integration rather than replacing it blindly. On the inspected checkout the candidate playtest and the production loader were still separate.

For the other six, use the corrected proposal versions below, not the older similarly named root files:

```text
Role             Runtime type     Existing art key   Approved source
Hero             player           kiran              chars/well-delver-v1/wellhero-*
Asura            melee            asura              chars/well-delver-v1/wellasura-*
Hexer            ranged           rakshasa           incoming/well-delver/hexer-turnaround.png
Brute            tank             mahish             incoming/well-delver/proposal-v2/brute-turnaround.png
Bloodseed        splitter         raktabija           incoming/well-delver/proposal-v2/bloodseed-turnaround.png
Gatekeeper       gatekeeper       bakasura           incoming/well-delver/proposal-v2/gatekeeper-turnaround.png
Hoard Guardian   sectorboss       nidhiraksha        incoming/well-delver/proposal-v2/guardian-turnaround.png
Vritra           megaboss         vritra             incoming/well-delver/proposal-v2/vritra-turnaround.png
```

Source paths in this block start under `game/assets/`. The six turnaround PNGs are 1774 × 887, generally front/back/right views. They are **reference/production sources, not walk or attack sprite sheets**. Inspect the actual poses before slicing; three equal rounded x-boundaries would be `[0, 591, 1183, 1774]`, but verify that no silhouette is cut.

Keep runtime keys, naming packs and save semantics intact. Follow the existing 96/112-pixel character format where practical. Anchor feet consistently, preserve relative body size across directions, and allow padding for motion. Do not fit each facing independently so the character changes size when turning. The existing pair mirrors right to make left; for each new asymmetric character inspect whether that is acceptable. Do not silently move a shield, horn or weapon to the wrong side or claim a mirrored pose is a separately rendered view.

Do not run an old stock-model renderer and assume it reproduces these new designs. If only pose-based motion can be produced from these PNGs, identify it as such. A turnaround is not a supplied 3D rig.

### Final backgrounds

Use only these approved final images for the three floor themes:

```text
game/assets/incoming/well-delver/floor-1.png   1024 × 1536
game/assets/incoming/well-delver/floor-2.png   1024 × 1536
game/assets/incoming/well-delver/floor-3.png   1024 × 1536
```

Floor 1 is worn terracotta/sandstone with a shallow sun carving; floor 2 is flooded teal-green paving with edge vegetation and lamps; floor 3 is a bronze-brown vault with serpent edging, treasure and a central grated drain. These are different landings of the same well, not three unrelated games. Exclude `floor-1-concept-worn-sun.png` and `floor-concept-bronze-sluice-v1.png`; they are alternatives, not final assets. Preserve the current sector/theme/depth-cycle logic rather than assuming the game has only three playable levels.

### Icon source sheets

```text
game/assets/incoming/well-delver/loot-icons.png              1448 × 1086, 4 × 3, square 362-pixel cells
game/assets/incoming/well-delver/icons/boons-copper.png       1536 × 1024, 3 × 2, 512 × 512 cells
game/assets/incoming/well-delver/icons/boons-silver.png       1536 × 1024, 3 × 2, 512 × 512 cells
game/assets/incoming/well-delver/icons/boons-gold.png         1536 × 1024, 3 × 2, 512 × 512 cells
game/assets/incoming/well-delver/icons/perks.png              1536 × 1024, 4 × 2, 384 × 512 cells
game/assets/incoming/well-delver/icons/signs.png              1536 × 1024, 4 × 3, uneven integer row heights
game/assets/incoming/well-delver/icons/hud.png                1536 × 1024, 4 × 2, 384 × 512 cells
```

All have alpha backgrounds. Use alpha, not black/white/brown colour-key removal. Hidden RGB under fully transparent pixels may contain colour; it is not visible artwork. Preserve antialiasing and avoid dark/white fringes when resampling or packing.

**Important slicing exception:** 1024 is not divisible by three. For `signs.png`, use y-boundaries `[0, 341, 683, 1024]`, x-boundaries `[0, 384, 768, 1152, 1536]`, then repack into uniform production frames or a proper atlas. Do not feed it to a fixed 341-pixel Phaser spritesheet and assume the final row is correct. Perks/HUD source cells are rectangular; that is not permission to stretch their objects.

The last loot cell and last HUD cell are intentionally empty and must not become icons. There are **56 populated icon definitions: 11 loot + 18 boons + 8 perks + 12 signs + 7 HUD**. Some stats intentionally reuse a boon emblem, and the two eclipses intentionally share a motif; distinguish their categories through the specified token/bare-sign treatment.

## 3. Exact icon mappings

Indices below are zero-based, row-major: left to right, then the next row. Names describe the artwork; use current `N.*` display names in the game.

### Loot

```text
0  Dagger              weapon effect none          existing texture icon_none
1  Venom Dagger        weapon effect venom         icon_venom
2  Blood Sword         weapon effect vampiric      icon_vampiric
3  Storm Disc          weapon effect chain         icon_chain
4  Executioner's Axe   weapon effect executioner   icon_executioner
5  Life Gem            trinket vitality            icon_vitality
6  Aegis               trinket aegis               icon_aegis
7  Thorn Band          trinket thorns              icon_thorns
8  Swift Sandals       trinket swift               icon_swift
9  Healing Herb        trinket regen               icon_regen
10 Unknown bundle      mystery                     icon_mystery
11 EMPTY: ignore
```

The **latest approved Storm Disc has yellow lightning with red borders**, not teal lightning. Keep that override. It remains a plain steel throwing ring, not a spoked wheel. This art override does not change the `chain` weapon's mechanics or the aqua/teal lightning Tejas sign and effects.

### Boons

Retain `boon_<key>` texture semantics and existing rank/availability logic:

```text
boons-copper.png / common, indices 0..5:
keen       Keen Edge
quick      Quick Hands
reach      Long Reach
feet       Light Feet
iron       Iron Body
hide       Thick Hide

boons-silver.png / rare, indices 0..5:
ground     Hold Your Ground
run        Strike on the Run
second     Second Target
readslam   Read the Slam
laststand  Last Stand
greed      Greed

boons-gold.png / epic, indices 0..5:
rot          Spreading Rot
bloodshield  Blood Shield
fork         Forked Lightning
cleancut     Clean Cut
kindling     Kindling
hunger       Eclipse Hunger
```

These tokens are already coloured for their fixed tier. Do not multiply-tint the whole icon with rarity colours: that corrupts the emblem colour and painted lighting.

### Perks

Use dedicated `perk_<key>` textures instead of borrowed loot/boon shapes. `perks.png`, indices 0..7:

```text
guard   Sentinel's Guard
eye     Hoarder's Eye
scale   Serpent's Scale
lungs   Deep Lungs
wind    Second Wind
study   Quick Study
reroll  Second Thoughts
taker   Tribute Taker
```

Preserve the violet cord and the individual charm materials. Worn, available and locked states must remain distinct without painting the entire charm violet.

### Signs

Use dedicated semantic keys such as `stat_*`, `form_*`, `hud_treasure` and `hud_power`; do not retain borrowed loot art in these roles. `signs.png`, indices 0..11:

```text
0  Treasure / current Nidhi currency
1  Power
2  Health
3  Shield                 pointed kite shield, NOT round loot Aegis
4  Attack damage
5  Attack speed
6  Move speed
7  Fire form              TEJAS_FORMS.none
8  Poison form            TEJAS_FORMS.venom
9  Blood form             TEJAS_FORMS.vampiric
10 Lightning form         TEJAS_FORMS.chain
11 Execution form         TEJAS_FORMS.executioner
```

The Execution sign has a short haft in the chosen source; it is not a perfect blade-only rendering. Use the chosen source, not rejected regeneration attempts elsewhere. If it fails the small-size readability check, make a carefully documented derived simplification preserving the falling axe identity, or report the remaining art need. Do not substitute a crown-like shape.

### HUD

`hud.png`, indices 0..7:

```text
0  Satchel
1  Empty slot
2  Locked
3  Calm / runtime phase key drift
4  Surge / runtime key surge
5  Eclipse / runtime key eclipse
6  Convergence / runtime key convergence
7  EMPTY: ignore
```

Convergence has four inward-pointing arrowheads. Keep runtime `drift`; do not rename logic to `calm`. Use the empty setting for “No trinket”, the lock for a genuinely locked/dormant power, and the closed cloth bundle for unidentified loot. Keep their text explanations.

## 4. Prepare production assets correctly

Create a deterministic offline preparation step and a small explicit manifest recording source file, cell index, crop, production frame/key and any variant/mask. Keep source files intact under `incoming/`; ship only derived assets actually needed by the game. Put derived icons/floors in clearly named production folders, not loose ad-hoc runtime dependencies on raw source sheets.

Crop within each cell using its alpha silhouette, then centre optically in consistent square frames with clear padding. Source icons vary in occupancy and centring; shrinking an entire untouched cell to 16 pixels can make the visible glyph much smaller than intended. Preserve aspect ratio. Use category-consistent sizing: equal boon token diameters, comparable charm scale, deliberate optical sizing for weapons and bare signs. Do not let thin dagger shapes or wide feathers become unreadably small through one generic fit rule.

Choose production resolution from the actual largest display size and device pixel ratio. Around 128 pixels per icon frame may cover the present small HUD/card usage, but inspect every consumer, including profile slots and previews, before choosing. Keep enough resolution for larger slots. Use a compact atlas with safe gutters/extrusion or a modest set of frames. Configure smooth filtering for this faceted painted art; do not automatically use nearest-neighbour pixel-art filtering.

For loot, implement **metal-only rarity recolouring** using validated per-icon masks or precomputed copper/silver/gold variants. Preserve painted light/shade; map to the game's existing `RARITY` tiers. Never globally tint the whole sprite. Keep green venom/leaves, crimson blood, red gem, brown leather/wood, cream cloth/feather and yellow/red Storm Disc lightning unchanged. A naive grey-pixel threshold is not a sufficient metal mask: highlights and cream fabric can be misclassified. Validate every variant against the source at full and phone size.

Do not expose an unknown item's identity or hidden rarity through its artwork. Keep the same closed bundle and current unknown-item presentation until revealed; do not select the hidden item's revealed icon variant prematurely.

Precoloured boons, perks, signs and HUD icons normally render without whole-sprite colour multiplication. Represent state with readable frames, badges, labels, dim overlays or alpha as appropriate. Audit `.setTint()` **by purpose**; do not globally remove character hit flashes, elite status, phase effects or intentional gameplay feedback.

Guard `makeLootIcons()` or replace its procedural production branch explicitly: the current method generates `icon_*` and `boon_*` textures during scene creation. It must not overwrite loaded artwork, create duplicate keys or leave some consumers on procedural icons. Keep a deliberate legacy fallback, not an accidental mixture. Avoid generating rarity variants or scanning masks every frame.

## 5. Character motion and special powers

Make movement, facing, idle return and presentation-only attack cues work with the approved bodies. Do not confuse walk-frame animation with changes to position or movement speed. Preserve sprite origins, visual scale padding, overhead labels/bars and existing collision radii independently of the art bounding box.

The Gatekeeper, Hoard Guardian and Vritra must have distinctly readable special-power cues, rather than the same generic squash reused for all three. Use character-specific wind-up, impact and recovery, fitted to the current attacks: a grounded Gatekeeper brace/staff or arm motion, a Guardian shield/ornament charge and impact, and a Vritra head/hood rear or coil response. Only use props present in the approved design. Give other enemies suitable restrained cast/hit/split cues where the existing lifecycle supports them.

Tie presentation to the actual attack state and progress. The inspected slam warnings are 950 ms circle, 850 ms line and 1150 ms scatter, but use the runtime duration, including tutorial grace and modifiers, rather than hardcoding these into independent animation timers. Impact must coincide with the real resolution. Do not add wind-up time, change hit shapes or delay damage to fit the art.

Compose animation over a stable base pose/scale. Prevent walk, hit, spawn and slam transforms from stacking and leaving a permanently enlarged or offset sprite. Cancel/reset appropriately on pause, death, sector changes and destruction. Respect existing shake/accessibility settings; no forced screen shake or excessive new flashes.

**Vritra is a special integration problem:** the existing game draws an articulated, procedurally moving serpent using `paintSerpent` and related logic, rather than a normal walk sheet. The supplied turnaround shows a coiled armoured cobra and does not include a rig or isolated moving body segments. Adapt the approved head/hood/body material to that renderer, or implement a validated presentation replacement that retains its movement, shield/rooting states, heading and attack readability. Do not show the old serpent behind a complete new coil, stretch the entire turnaround into one sprite, or silently change which parts are hittable. Update tutorial/codex depictions too. If genuine articulated animation cannot be produced from supplied art, document that limitation; do not claim it is supplied or complete.

Use bounded, lightweight dust, faceted shards, sparks and water/energy accents where helpful. Combat warnings are allowed to be vivid: the source-icon “no glow” rule is not a ban on functional VFX. Keep the existing red danger-zone silhouettes and warning rhythms unmistakable over every floor and phase; avoid decorative effects that resemble hit zones or pickups.

## 6. Floor integration: geometry, depth and readability

The source floors are 2:3. The inspected game uses a 400 × 700 logical canvas, a 76-pixel HUD, and a 340 × 564 visible arena footprint; the default wide world is 544 × 902. Do not blindly stretch a full 2:3 floor into that differently shaped arena. Choose and document an aspect-preserving crop/fit, including how the baked border meets the actual four walls. Avoid unused strips, distorted circular engravings and camera-revealed seams.

A floor belongs in world coordinates over `arenaBounds`, not fixed HUD/viewport coordinates. Preserve camera following, input-to-world conversion, arena bounds and collision. Verify both default wide and existing fixed-arena modes.

Keep the current depth order: floor below phase tint, phase tint below telegraphs, then entities and HUD. The inspected constants are `Z.floor = -10`, `Z.tint = -8`, `Z.telegraph = -5`, `Z.fx = -4`, `Z.hud = 55`. New artwork must never hide a slam warning.

Review `FLOOR_SETS`, `setFloor`, `paintFloor`, `setFrame` and `setFloorLights` together. The images already contain borders and lamps; do not leave an extra procedural frame over them or floating lights at unrelated old coordinates. Preserve intentional depth-cycle washes and phase semantics, but adjust presentation if they crush contrast. Retain classic/carved floors as a working development fallback while making approved art the intended presentation.

Baked coins, gems, plants, fish and the drain are scenery, not pickups or newly collidable objects. Make real loot recognisable through foreground placement, existing pickup feedback and state cues. Keep the playable centre quieter than its edges; if needed, use restrained derived colour/contrast adjustments, never an opaque dark wash that makes the game muddy. Verify hero, dark enemies, projectiles, health bars and all warning shapes on all three floors.

## 7. Bring every screen into the same material language

This is an essential part of the request, not a final colour swap. Build a small shared presentation system for panels, inset cards, buttons, slots, separators and text roles. Use the same material relationships in Phaser UI and DOM/CSS. Start from existing `FORGE`, CSS colour variables, `glass()`, `uiPanel`, `makeButton` and `ovButton`; centralise only what helps this integration. Do not undertake a large architecture rewrite.

Translate the world into a restrained material hierarchy:

- Main panels: warm stone/terracotta body or quiet frosted inset, edged with worn bronze; readable cream text.
- Nested cards and slots: flatter recessed surfaces and thinner borders, not another equally heavy gold frame.
- Satchel/equipment areas: subtle leather/cloth cues where useful, still part of the same system.
- Primary actions: warm amber/bronze emphasis; secondary actions quieter; destructive actions clearly distinct.
- Active, selected, pressed, keyboard-focused, disabled, locked, worn and unavailable states: explicit, consistent and readable.
- Small highlights: one warm top edge and restrained lower shadow to echo the artwork's lighting, not glossy glass gradients everywhere.

Preserve the useful frosted-panel readability of the existing interface. It can be reframed in matte stone/bronze without removing frost or making every panel fully opaque. Retain the existing efficient cached frost implementation; do not add expensive live blur or heavy texture under every small label. Avoid making everything orange/gold with no hierarchy. Keep functional colours for status and warnings instead of forcing them into the decorative palette.

Keep local Yatra One for its established display role and Baloo 2 for readable body text, including existing Devanagari handling. Do not introduce a new font dependency, shrink text to fit decoration or replace meaningful words/numbers with ambiguous icons. Keep touch targets at least as usable as before; small art does not mean a small hit area. Preserve keyboard focus and native form behaviour where already supported. Do not claim full accessibility merely from a palette change.

Audit and apply the system across:

1. DOM loading screen, glossary/loading cards, well progress, fallback page and any loading errors.
2. Title/hub, hero naming, depth selection, upgrades and well progression.
3. In-run HUD: health and shield, treasure and Power, phase bar, Tejas meter/button, boon queue/strip, pause and satchel tab.
4. Boon choice cards, rerolls and accumulated-boon displays.
5. Profile: equipment, dedicated stat signs, power form and perk selection/slots/states.
6. Satchel/inventory, item rows, tooltips and comparison/reveal states.
7. Pause, settings, How to Play, powers/codex, tutorial diagrams and first-run callouts.
8. Abandon confirmation, descend/extract choices, run summary, defeat and victory.
9. Feedback and other DOM forms: matching palette/frames without breaking submission or input.

Find **all** consumers of the old shared icon shapes and tints, not just the first profile or boon screen. Update tutorial examples, codex rows, hover details, menu previews and dormant/empty slots. Augment currency and Power labels with their dedicated signs without displacing numbers or interactions.

No new title illustration was supplied in this batch. Recompose existing approved art if useful, or adapt the present title to the shared language; do not claim a new key-art asset exists. If changing its composition, revisit the current `title_art` focal-point assumptions (`ART`/pool positioning) instead of reusing constants intended for a different image.

Prefer coherent code-drawn frames and shared style helpers over generating a different ornate PNG for each screen. A material language should be visible through silhouette, hierarchy, lighting, colour and spacing—not gratuitous surface noise. Do not remove helpful controls or materially rearrange the information architecture to accommodate the art.

## 8. Packaging, performance and provenance

The current `tools/build-itch.py` copies a shallow allowlist of assets: character PNGs, sounds, engine/fonts, and two fixed background/title files. New icon/floor folders and atlas JSON will **not ship automatically**. Update a narrow production allowlist/manifest to include exactly the derived resources the game loads. Validate dynamic frame/path references too; the existing regex check for literal paths alone is insufficient. Do not recursively ship `incoming/`, raw turnarounds, rejected alternatives or source backups.

Match filename case for case-sensitive hosting. Test the staged `dist/itch/index.html`, not just the development page. Preserve offline/local asset behaviour and the existing external-request policy; do not introduce CDNs, remote fonts or another runtime framework.

The six full-size additional icon sheets alone occupy about 36 MiB decoded RGBA; three full-size floors add about 18 MiB before character textures and other resources. Keep sources high-resolution, but use measured production texture sizes and avoid loading duplicate source + derived assets. Inspect cold-load size, decode time, texture memory and crowded-combat frame time. Do not create textures, masks or fresh complex panel geometry in per-frame loops. Clean up scene/UI resources and animations across repeated menus and sector transitions.

Update `game/assets/CREDITS.md` and the build-generated credits template: it currently credits CraftPix characters and Kenney resources, and will be inaccurate if those characters are replaced. Retain attribution/licences for anything still used, including fallbacks, fonts, engine and sound. Describe the new artwork as generated using **OpenAI ImageGen**; the exact model identifier was not exposed, so do not invent one or unsupported legal guarantees. Preserve available generation/source records. Flag store disclosure checks for release; do not publish or submit anything as part of integration.

Update only directly affected handoff/asset documentation and stale art-specific claims. Do not perform a broad documentation cleanup or rewrite gameplay requirements in this task.

## 9. Verification and acceptance gates

Use an isolated throwaway browser profile/save, with sound muted when automating. Do not overwrite my actual progress or exercise feedback submission against a real recipient. Capture an initial baseline, then verify the integrated main game and packaged build.

Run the existing regression workflow using available project runtimes:

```text
node tools/smoke-test.mjs
python tools/build-itch.py
node tools/smoke-test.mjs "" dist/itch/index.html
```

The build regenerates its own output; preserve unrelated artifacts. Add focused checks for asset/frame completeness, valid slice bounds, empty-cell exclusion, mask integrity and staged resource paths. Do not delete failing tests or change gameplay assertions simply to make the suite pass. If environment limitations prevent a test, state what was and was not verified.

Visual/manual acceptance must include:

- A labelled QA contact sheet of all 56 populated icons at 16, 20, 24 and typical larger UI sizes, on actual light/dark panel and floor backgrounds. Source artwork is not yet proven at every tiny live size. Check cropping, scale, fringes, category distinctions and every loot rarity variant. If 16-pixel detail fails, simplify a derived asset or use a readable presentation size; do not blindly declare it passed.
- Correct metal-only recolouring: nonmetal colours unchanged, metal tier visible, mystery unrevealed. Precoloured icons retain their original colours.
- Every character at actual game scale, all directions, idle/walk transitions, labels/bars, crowds, elite/hit states and appropriate special-attack cues. Report which animations are pose-based versus genuinely articulated.
- All three floors under every phase, including Eclipse and Convergence, plus deeper-cycle tinting; clear circular/line/scatter telegraphs and real pickups.
- Default wide arena and fixed arena; camera at all four edges; no seams, duplicate borders or detached lights; unchanged movement/collision/input mapping.
- Screenshots of loader, title/hub, profile, perk states, boon choices, satchel, pause/settings, How to Play/powers, descend/extract and end states. Check fresh and returning saves, locked and unlocked Tejas, worn/unworn perks, boon ranks/asleep states, empty slots and unknown items.
- At least 420 × 740 and a smaller phone viewport such as 360 × 640, with device pixel ratio 2 and 3; inspect narrow 320-pixel layouts and landscape for existing clipping/interaction regressions. Preserve safe margins, text legibility and tap areas.
- Dense combat and repeated menu/sector transitions: no new exceptions, missing textures, visual-state leaks or obvious frame-time spikes. Record measured results and the tested device/browser; do not invent mobile FPS from a desktop run.

Refresh existing store screenshots only after verified integration, using actual gameplay captures and current project tooling. Do not fabricate UI/gameplay in marketing images. If store capture is outside the tools available, list it as a remaining release step.

## 10. Execution sequence and final handoff

Implement in this order so problems stay attributable:

1. Audit current integration and approved source versions; record baseline and source manifest.
2. Build reusable extraction/normalisation and loot rarity-mask/variant preparation; validate mappings and small-size contact sheet.
3. Integrate icons into all consumers, guarding procedural fallbacks and separating icon colour from state styling.
4. Preserve/integrate the hero/Asura pair; prepare the other characters and distinct attack presentation, handling Vritra explicitly.
5. Integrate floors with correct geometry, layering, lighting and fallback behaviour.
6. Apply the shared material system to all screens, including DOM surfaces; verify each screen rather than only changing global colours.
7. Update packaging and credits, run source and staged-build tests, and capture visual evidence.

Prioritise a coherent, stable playable build over a new framework, speculative shader system or a full 3D production pipeline. Keep the work small enough to review and evolve. Where art cannot meet acceptance from the supplied sources, keep a clearly documented working fallback for that item instead of breaking the rest or concealing missing animation.

Deliver:

- The integrated build and a concise list of changed files.
- The source-to-runtime asset manifest and reproducible preparation command.
- Before/after screenshots and the icon/rarity QA contact sheet.
- Source and packaged-build test results, with performance/load observations.
- A coverage checklist: each character, each floor, all icon categories and all screen families, marked implemented/verified/fallback/remaining.
- Any residual limitation, especially articulated animation, Vritra, tiny-icon readability or title art, with the smallest concrete next step.

Do not call this complete just because textures load. Completion means the game plays as before, the new art reads at phone size, the screens visibly belong to the same world, and the packaged build contains everything it needs.
