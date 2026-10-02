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

Portrait, **9:16** (make it 1080 × 1920 or larger). The game puts the title in the top
fifth and the menu in the bottom third, so both must stay calm.

```
[style block] Looking straight down the square shaft of an ancient Indian stepwell from
its rim. Tier after tier of zigzag sandstone stairs descend in concentric squares,
sunlit and saffron at the top, deepening to red and maroon below, with a molten gold
glow rising from the very bottom at the centre of the image. Embers drift upward.
Strong one-point perspective, symmetrical. The top fifth and the bottom third of the
image are darker and plain, with little detail. Portrait 9:16.
```

Variation worth trying, with a figure for scale:

```
[style block] The same stepwell shaft seen from above, with one small warrior in a
conical steel helmet standing on the top step at the lower edge of the image, seen from
behind, looking down into the glowing depth. Portrait 9:16.
```

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
