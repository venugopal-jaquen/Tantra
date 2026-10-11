# Well Delver — character visual contract

**Status:** approved direction, 2026-10-10. This is the first replacement pair for the
current stock character roster: the player hero and the rank-and-file Asura. It is a
design and production brief, not a change to the playable build.

## 1. The promise

The characters belong to the same world as the carved stepwell floors: a place of warm
sandstone, old water, bronze, cloth and accumulated treasure. They are practical people
and creatures who have lived in it, not imported European-fantasy adventurers.

The desired reading is **Well Delver**: grounded, weathered and mobile. Spectacle comes
from the well, loot, magic and bosses; the hero must remain immediately legible as the
player at phone size.

## 2. Shared rules

- **Medium:** stylised low-poly 3D rendered into sprites. Forms must remain clean after
  reduction to the game's roughly 24–46 px on-screen character size.
- **View:** the existing three-quarter top-down game camera. Keep the body broad and
  silhouettes clean; no illustration that assumes a side-scrolling camera.
- **Materials:** matte cotton and linen, worn leather, oxidised bronze, terracotta and
  stone dust. Avoid polished steel as the dominant material.
- **Lighting:** warm amber from above, restrained cool-teal rim from below. This joins the
  saffron steps and water without making characters disappear into either.
- **Detail budget:** silhouette first; then one head/readability cue; then one material
  accent. Small straps, coin strings and surface noise are optional and must not carry a
  character's identity.
- **Exclusions:** no European Viking armour, generic green goblins, religious iconography,
  deity likenesses or sacred symbols. Enemies remain antagonists, not revered figures.

## 3. Palette

Use the palette as a relationship, not a requirement that every piece use every colour.

| Purpose | Colour family | Use |
|---|---|---|
| Stepwell base | sandstone / cream | hero clothing and neutral surfaces |
| World warmth | saffron / rust / terracotta | wraps, belts, enemy armour, worn cloth |
| Player signature | muted teal | hero head-wrap and small cloth accents |
| Ancient craft | aged bronze | fasteners, charms, armour edges |
| Enemy body | charcoal-indigo / blue-violet | Asura skin and deep-well threat |
| Magic/rim light | deep teal | restrained lower edge and supernatural contrast |

The hero should be warm and bright against the floor; the Asura should be darker and
cooler than the floor, with enough terracotta armour to still look indigenous to it.

## 4. Hero — Well Delver

**Role:** the unnamed player character. Smallest, clearest and most approachable figure.

**Silhouette:** compact upright explorer; large readable head; layered cloth that forms a
clear taper from shoulders to sandals. The teal head-wrap/scarf is the instant recogniser
from all four directions. The weapon is secondary and must never hide the body.

**Wardrobe:** sand-coloured short tunic; layered wrapped waist cloth in muted terracotta;
teal scarf/head-wrap; dark leather bracers and sandals; one small bronze utility charm.
Clothing should imply travel and climbing, not royal or ceremonial dress.

**Prop:** a short spear or modest dagger. It is a visual identity cue only: gameplay still
uses auto-attacks and changing weapon loot.

**Personality:** alert, resourceful and brave. The player should look like they entered
the well willingly and know how to survive there.

## 5. Asura — rank and file

**Role:** the common melee enemy. It must read instantly in a crowd and remain visually
distinct from the later Brute and bosses.

**Silhouette:** low, broad shoulders; slightly hunched forward; long arms; an asymmetric
single horn or horned headpiece. The body shape, not facial detail, is its identifier.

**Materials and colour:** charcoal-indigo skin; chipped terracotta and bronze shoulder
plates; dark, ragged rust cloth; rope or leather bindings. A small gold/bronze detail is
enough to relate it to the hoard without making it look like a boss.

**Weapon:** short cleaver or club. Keep it low and clear of the torso so a crowd of Asura
does not turn into visual noise.

**Personality:** territorial scavenger, not comic goblin. It should feel dangerous in a
pack but not grand enough to compete with the Gatekeeper.

## 6. Sprite-production acceptance criteria

The source model/render is ready for implementation only when it meets all of these:

1. A player can distinguish hero and Asura at a glance at 44 px wide on every existing
   floor.
2. Front, back, left and right views keep the feet on the same baseline and retain their
   signature silhouette.
3. The hero has a visible teal head-wrap from front, back and side; the Asura retains the
   broad, horned shape from each view.
4. Neither relies on thin linework, facial detail or texture noise to read.
5. The render fits a 256×256 source cell and can be reduced cleanly to the game's 96×96
   still cells and 112×112 walk cells.
6. It looks coherent beside the carved level-one floor before the rest of the roster is
   commissioned or produced.

## 7. Production sequence

1. Make one turnaround sheet for the hero and one for the Asura: front, back and right
   side, on a plain background.
2. Judge those sheets at game scale on the real floors; revise silhouette, contrast or
   camera only at this stage.
3. Render the approved pair from four directions and make the still-sprite replacements.
4. Add the existing model walk animations through `tools/3d/render_char.py` and
   `tools/3d/pack_sheet.py`.
5. Play a real first sector with only this pair replaced. Do not build the other five
   characters until the pair remains clear in movement, crowds and combat effects.

The production utilities and current technical constraints are in `tools/3d/README.md`;
the wider sprite-sheet contract is in `docs/character-art-guide.md`.
