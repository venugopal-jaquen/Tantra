# Brief for ChatGPT: the rest of the cast, and the floors

The hero and the Asura were made with ChatGPT and are in the game (`requirements.md`
§2.39). This is what to give ChatGPT so that what it makes next can be cut and fitted the
same way, with nothing to redo. Written 2026-10-10, at the founder's asking.

**How to use it.** Paste everything inside a box into ChatGPT, in the conversation that
made the hero and the Asura, so it has them to match. In a new conversation, attach
`hero-turnaround.png` and `asura-turnaround.png` first. Each character has an **Idea**
line in square brackets: those are starting points and they are yours to change before
sending. Everything else in the box is what the cutting needs and should stay.

When the pictures are made, tell Claude. Each one is cut with
`tools/cut-turnaround.py`, shown in the game on all three floors, and only then kept.

## 1. The five characters

```text
You made two character turnarounds for my game in the "Well Delver" look: the hero and
the Asura (above, or attached; also in game/assets/chars/well-delver-v1/source/). They
are approved and in the game. I now need the remaining five characters as turnarounds in
exactly the same look, and one optional extra for walking.

Another tool cuts your pictures into game sprites. Your job is ONLY to make the source
pictures described here. Do not cut them, shrink them, build sprite sheets or change any
game file.

WHAT TO MAKE FOR EACH CHARACTER
One PNG with a transparent background: the same character standing three times in a
row, in this order from left to right:
  1. front view, facing the viewer
  2. back view, facing away
  3. side view, facing RIGHT

RULES FOR EVERY TURNAROUND (the cutting depends on each of these)
- The same character, the same size and the same proportions in all three views, feet on
  one ground line.
- Camera straight on at eye level with no perspective distortion, as in the hero and
  Asura turnarounds.
- The whole body in every view. Nothing cut off by the edge of the picture: leave a
  margin all round.
- Clear, empty space between the views, at least a tenth of the picture's width.
  Nothing from one view may reach into or touch the next: no blade, horn, staff, cloak or
  trailing cloth.
- A truly transparent background. No floor, no ground shadow, no glow or haze round the
  figure, no text, no labels, no frame.
- Landscape 2:1, at least 1774 x 887 pixels (the size of the first two). Larger is better.
- A neutral standing pose: arms a little away from the body, legs a little apart so each
  leg is its own clear shape, both feet flat and fully visible.
- In the SIDE view both legs must show from the knee down, one a little ahead of the
  other, and nothing may hang in front of the legs below the knee: hold weapons up and
  away from the legs and keep cloth ends above the knee. The walk is made by moving the
  lower legs, so they must be clear of everything else.
- The same light as the hero: warm from above, a faint cool rim.

THE LOOK (unchanged)
Stylised low-poly 3D look, faceted planes, painted, matte materials: cotton, linen, worn
leather, aged bronze, terracotta, stone dust. Follow docs/well-delver-visual-contract.md.
Each character must read when it is 50 pixels tall on a phone: broad, chunky shapes, big
hands and feet, one large simple weapon, and ONE strong signature colour that no other
character uses. Taken already: the hero's teal with cream, the Asura's indigo with rust
orange.

The floors they stand on are warm sandstone (level 1), dark teal water (level 2) and
dark brown stone with gold (level 3). An enemy must stand out on all three, so avoid
large areas of sandstone, cream or teal on an enemy.

THE FIVE CHARACTERS
For each: its part in the game, what must read at a glance, how large it will stand next
to the hero, and my idea for it. Every picture is the same size; the game sets how large
each figure is drawn. Design each one to carry the size given.

1. HEXER (file name: hexer). A ranged enemy that stands back and throws curses. Must
   read as "this one attacks from a distance": a staff, or a raised hand with a glow.
   Lean. About the hero's height.
   Idea: [a gaunt sorcerer in a long violet-grey robe and hood, a staff topped with a
   sickly green ember]. A robe to the ground is fine for this one only.

2. BRUTE (file name: brute). A slow, heavy enemy that hits hard. Must read as twice the
   bulk of an Asura: huge shoulders, thick arms, a small head. One and a half times the
   hero's height and twice as wide.
   Idea: [a buffalo-horned giant with ash-grey hide, iron bands on its arms, a great
   club].

3. BLOODSEED (file name: bloodseed). An enemy that splits into two smaller ones when it
   dies. Must read as "there is more than one in there": swollen, budding, doubled
   shapes. A little smaller than the hero.
   Idea: [a crimson creature with bulbous growths on its back and shoulders, as if a
   second one is pushing its way out].

4. GATEKEEPER (file name: gatekeeper). The first boss. It guards the way down. Must read
   as a wall to get past: tall, armoured, a shield like a door. Twice the hero's height.
   Idea: [dark bronze armour, a heavy rectangular shield, a deep red cloak that ends
   above the knee, a spiked helm].

5. HOARD GUARDIAN (file name: guardian). The boss of each level. It sits on the
   treasure. Must read as heavy and hung with gold. Twice the hero's height, very wide.
   Idea: [an iron-dark giant with gold plates, chains and strings of coins, and a flat
   helm like the lid of a treasure chest].

NEVER (firm rules for this game)
Every enemy is a villain and must not look like anything people revere. On no character:
a crown; a halo or ring of light behind a head; a third eye; a mark on the forehead;
extra arms or heads; a trident, conch, discus, lotus seat or sacred thread; Om, a
swastika or any religious symbol; the likeness of any deity or temple guardian; bright
sky-blue skin. Also none of: Viking or European plate armour, green goblins, modern
clothing, text.

OPTIONAL, AND ONLY IF THE CHARACTER STAYS IDENTICAL: WALK POSES
For each character, the hero and the Asura included, a second PNG: the SIDE view facing
right, four times in a row, as four moments of one walk:
  1. contact: the near leg forward, the far leg back
  2. passing: both legs under the body, the far foot lifted
  3. contact: the far leg forward, the near leg back
  4. passing: both legs under the body, the near foot lifted
The same size, the same head height and the same spacing in all four. Only the legs and
arms change. The same rules as above: transparent, clear space between, nothing cut off.
Try the hero first. If the four figures do not look like the same character as the
turnaround, say so and do not send them: a mismatched walk is worse than none.

WHERE TO SAVE, AND WHAT NOT TO TOUCH
Save into game/assets/incoming/well-delver/ as:
  hexer-turnaround.png   brute-turnaround.png   bloodseed-turnaround.png
  gatekeeper-turnaround.png   guardian-turnaround.png
and, if made: hero-walk-side.png, asura-walk-side.png, hexer-walk-side.png, and so on.
Keep each picture at the full size it was made. Do not change anything in
game/assets/chars/, the game's .html files, tools/ or docs/, and do not run any git
command: another tool is working in this folder too.

WHEN YOU ARE DONE, TELL ME
- the files you made, and each one's size in pixels;
- for each, whether the background is truly transparent and the three views fully apart;
- which image model made them (it goes in the game's credits);
- anything you could not keep consistent with the hero and the Asura.

Make ONE character first, the Hexer, and show me before making the rest.
```

## 2. The three floors

The founder means to try floors generated to match the characters. Today the three
floors are painted by code (`requirements.md` §2.10), and parts of them move. A picture
replaces the still part of a floor; what moves can be drawn over it. A floor is not a
scene: the game looks straight down on it and fights happen all over it, so most
pictures an image tool makes by default cannot be used. This box asks for one that can.

```text
I also want the game's three floors repainted to match the Well Delver characters. The
game is played looking straight down on a floor, and the characters stand on it.

RULES FOR EVERY FLOOR
- The view is straight down from above, like a plan. No horizon, no walls standing up,
  no perspective, nothing tall.
- Portrait 3:5, at least 1020 x 1692 pixels. Larger is better. No transparency.
- The whole picture is floor that can be walked on. A carved border round the edge is
  welcome.
- The middle two thirds must be calm: low contrast, no objects, no strong lines. Fights
  happen there and the characters must stand out. Detail belongs at the edges and in the
  corners.
- A step darker and less saturated than the characters. No large areas of cream, bright
  teal or bright orange: those are the hero's and the Asura's colours.
- No loose coins, gems or other small bright things lying in the open: in a fight they
  look like something to pick up. Keep them heaped against the edges.
- Even light from above. No spotlight, no long shadows.
- No characters, no text, no symbols, no shadows of people. No religious symbols: no Om,
  swastika, trident, deity or idol.
- The same low-poly, painted look and materials as the characters: sandstone, old water,
  bronze, gold.

THE THREE (each is a place in the story, and is already in the game in a plainer style)
Level 1, the court: a sunlit court at the top of a stepwell, paved in irregular
sandstone round a large carved sun. Patterned sunlight falls across one corner through
carved stone screens. Marigold petals are strewn at the edges.

Level 2, the flooded landing: dark green-teal water standing over four drowned stone
steps, each darker than the last. Lotus pads, a few fish and small floating clay lamps
near the edges, and the long faint shadow of a huge serpent in the deep.

Level 3, the hoard: the vault at the bottom of the well. Dark brown stone. A great
serpent cast in bronze is laid into the floor round the whole room like a border. Gold
is heaped in the four corners. In the middle, a round gold-rimmed grate with water
glowing beneath it.

Save as game/assets/incoming/well-delver/floor-1.png, floor-2.png and floor-3.png. Make
level 1 first and show me before making the others.
```

## 3. What comes back, and what happens to it

| Picture | Where | What Claude does with it |
|---|---|---|
| `<name>-turnaround.png` | `game/assets/incoming/well-delver/` | Cuts it into stills and a walk sheet, sets its size in the game, shows it on all three floors |
| `<name>-walk-side.png` | the same | If the four figures match the turnaround, the side walk is made from them and not from the still |
| `floor-N.png` | the same | Fits it to the arena and shows the cast on it beside today's floor |

File names in the game keep their first names (`requirements.md` §2.12): hexer is
`rakshasa`, brute is `mahish`, bloodseed is `raktabija`, gatekeeper is `bakasura`,
guardian is `nidhiraksha`. Nobody making pictures needs to know that.
