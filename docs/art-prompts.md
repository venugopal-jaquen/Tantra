# Art prompts for an image model

Use these if you want to make the title art or the arena floors yourself with an image
generator (Midjourney, DALL·E, Imagen, Firefly, Stable Diffusion). Each prompt is complete
on its own: paste the **style block** first, then one **subject**.

What the game draws today is built in code (`requirements.md` §2.10): a view down a
stepwell shaft for the title, and three painted floors. Anything made from these prompts
replaces that, file for file.

## The idea everything hangs on

The game is one long descent down a **stepwell** (a *baori* or *vav*): the stepped wells of
Rajasthan and Gujarat, such as Chand Baori and Rani ki Vav. The title looks down the shaft.
Each sector is a deeper level: a sunlit courtyard, then the flooded level, then a vault of
gold at the bottom.

## Style block (paste at the start of every prompt)

```
Stylised 2D game art, flat shapes with soft painted shading, clean vector-like edges,
no photorealism. Warm palette only: deep maroon #2A0800, burnt umber #3D1200, red
sandstone #903C12, saffron #E8820A, forge orange #FF8C42, gold #FFD23C, cream #FFFBEF.
Indian architecture and craft: stepwells, carved sandstone, jaali screens, lotus
rosettes, brass and gold inlay. Dramatic warm light from above, glowing embers, rich
and treasure-like, never dark or grey.
```

## Things to keep out (add as a negative prompt, or say "without")

```
no text, no letters, no logos, no watermark, no people's faces, no deities, no idols,
no temples in worship, no Om, no swastika, no trident, no religious symbols, no
photorealism, no 3D render look, no cool blue or purple colour cast, no black background
```

The religious items are there on purpose. The game uses Indian myth as flavour and never
depicts worship or revered figures (`requirements.md` §1.3 and §2.12).

## 1. Title screen background

**The founder chose to explore made art for this screen (2026-10-06).** Today's backdrop is
drawn in code. A picture replaces only the backdrop: the name, the goal, the DESCEND button
and the menu are still drawn by the game on top of it.

**Where things sit.** `docs/title-art-layout.jpg` shows the screen with three bands marked:

| Band | Part of the picture | What it must be |
|---|---|---|
| Title | top 22% | Calm and darker. The game writes the name and the goal here |
| The picture | 22% to 52% | The subject. The round DESCEND button covers the very middle, so lead the eye to the centre without needing it |
| Menu | bottom 48% | Dark and plain. Panels and buttons sit on it |

Portrait, **9:16** (1080 × 1920 or larger). No lettering in the picture. If a picture turns
out to deserve more room than the middle band, the two upgrade cards can move to a screen
of their own and the picture can have two thirds of the height: say so and it will be done.

**Three directions.** Make a few of each and keep whatever stops you scrolling.

A. *Down the shaft.* The nearest to today's screen: the button is the light you fall toward.

```
[style block] Looking straight down the square shaft of an ancient Indian stepwell from
its rim. Tier after tier of zigzag sandstone stairs descend in concentric squares,
sunlit and saffron at the top, deepening to red and maroon below, with a molten gold
glow rising from the very bottom, a little above the centre of the image. Embers drift
upward. Strong one-point perspective, symmetrical. The top fifth of the image is darker
and plain. The whole lower half fades to deep maroon shadow with almost no detail.
Portrait 9:16.
```

B. *The serpent's coil.* The same view with the villain in it: the first screen then shows
what took the water.

```
[style block] Looking straight down the square shaft of an ancient Indian stepwell. A
colossal serpent with dark teal scales banded in gold lies coiled along the tiers of
stairs, winding down and round the shaft, its head resting near the bottom beside a
molten gold glow a little above the centre of the image. The stairs are dry and cracked.
Seen from far above, the serpent is a pattern before it is a creature. The top fifth is
darker and plain; the whole lower half fades to deep maroon shadow. Portrait 9:16.
```

C. *The first step.* A figure for scale, seen from behind, so the screen is about the
player. Make this one after the hero has a design (`docs/character-art-guide.md`), or keep
the figure a small dark silhouette so it need not match.

```
[style block] A small lone figure, seen from behind as a dark silhouette, stands on the
top step at the rim of a vast square Indian stepwell and looks down. Below, zigzag
sandstone stairs fall away tier after tier into a molten gold glow. The figure stands
just below the centre of the image and the glow sits above it, so the eye travels from
the figure down into the well. Warm light from above, long shadow. The top fifth is
darker and plain; the lower half is the dark stone of the rim, with almost no detail.
Portrait 9:16.
```

**Judging a candidate.** Put it behind `docs/title-art-layout.jpg` in your head: is the top
calm enough for the name to read, is the subject inside the middle band, does the bottom
half get out of the way? Then drop it in `game/assets/incoming/` and it will be shown
behind the real screen before anything is kept.

## 2. Arena floors (one per sector)

Top-down, flat, **no perspective**, no characters, no objects that look like something to
walk around. Proportion **3:5** (make it 1020 × 1692). Detail belongs at the edges and in
one central medallion; the area between must stay quiet, because enemies, loot and red
danger zones are drawn on top of it. Mid-dark overall: nothing brighter than saffron.

Sector 1, the courtyard:

```
[style block] Top-down orthographic view of a red sandstone courtyard floor in a
Rajasthani stepwell. Large worn paving slabs, a carved lotus rosette medallion in the
centre, quarter-rosettes in the four corners, a narrow border of small carved
triangles. A soft shaft of daylight crosses it diagonally. Flat, evenly lit, low
contrast in the open areas, no objects, no shadows of people. Portrait 3:5.
```

Sector 2, the flooded level:

```
[style block, but allow deep teal-green water #145258 as the main colour] Top-down
orthographic view of the flooded level of an Indian stepwell: dark green well-water
drawn in the style of Indian miniature painting, with rows of small scalloped waves, a
slow whirlpool spiral turning toward the centre, a stone lotus at the centre, lily pads
and pink lotus flowers only near the edges, and a warm sandstone rim around the whole
floor. Flat, low contrast in the open water, no objects in the middle. Portrait 3:5.
```

Sector 3, the vault:

```
[style block] Top-down orthographic view of a treasure vault floor at the bottom of a
stepwell: dark maroon basalt inlaid with glowing molten gold lines in a kolam-like
pattern of interlocking circles and dots, a round gold seal in the centre, thin glowing
cracks spreading outward as if heat rises from below, brighter at the centre and
fading to dark at the walls. Flat, no objects, no coins lying about. Portrait 3:5.
```

### The same floors as scenes (2026-10-04)

The game now has a second, hand-painted set of floors (`?floors=carved`) built round three
scenes. If you would rather have an image model paint them, these prompts describe the
same scenes. Keep the 3:5 proportion and the calm middle.

Level 1, the sunlit court:

```
[style block] Top-down orthographic view of a sandstone courtyard at the top of an Indian
stepwell. Irregular weathered paving slabs. In the centre a large carved sun medallion
with long and short faceted rays, a beaded ring and a small lotus at its heart. The
upper-left corner lies in soft shadow, and inside the shadow two tall arched patches of
dappled sunlight fall across the floor, cast through a pierced stone jaali screen.
Scattered marigold petals. Carved fan motifs in the four corners. No objects standing on
the floor. Portrait 3:5.
```

Level 2, the flooded steps:

```
[style block, but allow deep teal-green water as the main colour] Top-down orthographic
view of a flooded stepwell landing. A dry stone rim, then four concentric rectangular
steps descending under clear green water, each step darker, to a deep pool in the middle.
A bright net of rippling light on the water. Lotus pads with pink flowers, small koi and
six floating clay oil lamps with warm glows, all near the edges. In the deep centre, the
faint dark shadow of a huge serpent under the water. Portrait 3:5.
```

Level 3, the serpent's vault:

```
[style block] Top-down orthographic view of a treasure vault floor. Dark warm stone in
lozenge slabs with thin glowing gold joints. A giant bronze serpent relief with gold
scales is inlaid in the floor, coiled once around the whole perimeter, its head at the
top centre with two small ruby eyes. Heaps of gold coins and cut gems in the four
corners only. In the centre a round gold-rimmed iron grate with glowing turquoise water
visible beneath it. The middle of the floor between the grate and the serpent stays
plain. Portrait 3:5.
```

## 3. Store cover (itch.io)

Landscape, **630 × 500** (make it 1260 × 1000). Leave the upper-left third calm for the
game's name, which is added afterwards as real text.

```
[style block] A small warrior in a conical steel helmet, seen from behind, stands at the
rim of a vast Indian stepwell whose zigzag sandstone stairs descend into a molten gold
glow far below. Green horned goblin-like demons climb the stairs toward him. Embers in
the air. Wide composition, the upper-left third is plain sky-glow with no detail.
```

## 4. Handing the results back

| For | Size | Format | Put it in |
|---|---|---|---|
| Title background | 1080 × 1920 | JPG, under 400 KB | `game/assets/incoming/` |
| Each floor | 1020 × 1692 | JPG, under 300 KB | `game/assets/incoming/` |
| Store cover | 1260 × 1000 | PNG | `game/assets/incoming/` |

Tell me which file is which and I will wire them in. Two things to check before using any
generated image:

- **Readability.** Put a red circle and a small green character on the floor image. If
  either is hard to see, the floor is too busy or too bright.
- **Disclosure.** itch.io asks creators to declare AI-generated art on the project page.
