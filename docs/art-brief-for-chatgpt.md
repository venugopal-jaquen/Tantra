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

The founder means to have the floors generated to match the characters, and asked for a
full prompt. Today the three floors are painted by code (`requirements.md` §2.10) and
parts of them move. A picture replaces the still part; lamps, glows and water light are
drawn over it by the game, as now.

A floor is not a scene. The game looks straight down on it and the whole fight happens
on top of it, so most pictures an image tool makes by default cannot be used. The prompt
spends most of its length on that.

**Attach these with it:** the hero and Asura turnarounds (the look), and the three
pictures of the floors as the game paints them now (the layout to keep):
`concept/floors-2026-10-10-as-painted-level-1.jpg`, `-2.jpg`, `-3.jpg`. Each is the floor
inside its band of steps, with nothing drawn on top.

```text
I want the three floors of my game repainted to match the Well Delver characters you
made for it (the hero and the Asura). Attached:
- the hero and Asura turnarounds: the look to match;
- three pictures, level 1, level 2 and level 3: the floors as the game draws them today.
  They are the layout to keep.

WHAT A FLOOR IS IN THIS GAME (read this first)
The game is a fight seen from straight above. The player's character and up to twenty
enemies move all over the floor. On top of the floor the game draws red and orange
warning shapes where a boss is about to strike, small glinting loot with a label, health
bars, a coloured ring under the hero, fire, lightning and poison, and numbers. The floor
has one job: to be a place, and to stay out of the way of all of that. A beautiful
picture that competes with the fight is a failure here.

WHAT TO MAKE
One picture for each level, three in all. Each shows the floor together with the band of
steps that surrounds it, exactly as the attached pictures do.
- Portrait, 2:3, at least 1024 x 1536 pixels. Larger if you can.
- PNG, no transparency.
- The band of steps is the same thickness on all four sides, about 7% of the picture's
  width. Everything inside it is floor.
- Keep the layout of the attached picture for that level: the same things, in the same
  places, at the same size. Repaint it; do not rearrange it.

THE VIEW
- Straight down from directly above, like a plan or a map. The floor lies flat to the
  picture. No horizon, no vanishing point, no tilt, no wall rising, no side of anything.
- The steps round the edge are seen from above too: nested bands, lit a little
  differently on each side so they read as steps.
- Anything standing on the steps (lamps, pots) is also seen from above.

SCALE (the same in all three pictures)
- A person standing on the floor would be about one tenth of the picture's width tall.
- Paving slabs are one to two persons across.
- In the open floor, no pattern finer than a person's head. On a phone it turns to noise.

THE CALM MIDDLE (the most important rule)
The fight area is everything more than about a tenth of the width in from the steps. In
it:
- Tones stay in a narrow range. No patch much lighter or darker than what is round it.
  Carving reads as soft, shallow relief, not as lines.
- Nothing that looks solid or tall: no pillars, pots, statues, rubble, railings. The
  floor has no obstacles, and nothing may look like one.
- Nothing small and bright: no loose coins, gems, sparks or glints, no heaps of petals.
  They look like loot to pick up.
- No red or orange circles, rings or discs, and no bright straight bands. The game warns
  of attacks with exactly those shapes.
- No arrows, paths, footprints, lettering, or anything that reads as a sign.
Richness belongs in the outer tenth, in the corners and on the steps.

TONE AND COLOUR (so the characters stand out)
- The hero is cream, teal and terracotta. The Asura is dark indigo and rust orange. The
  floor must be clearly different from both, everywhere they can stand.
- A middle to middle-dark tone overall: darker than the hero's cream clothes, lighter
  than the Asura's skin. Never near white, never near black.
- Less saturated than the characters. They must be the brightest, most colourful things
  on the screen.
- Level 1: a deep, reddish sandstone, a clear step darker than the hero's cream. Not
  pale, not yellow.
- Level 2: dark, greyed green-teal water, darker and duller than the hero's teal scarf.
- Level 3: dark brown stone. Gold only as thin inlay and at the edges.
- Light soft and even, from above and a little from the upper left, the same in all
  three. No spotlight, no vignette, no fog, no bloom, no lens effects: the game adds its
  own edge shading, lamp flicker and glows.
- No shadow falling across the floor from anything outside the picture, except level 1's
  patterned sunlight, which must be faint.

THE LOOK
The same as the characters: stylised low-poly 3D look, faceted planes, painted, matte.
Stone that looks cut and worn; water as flat, faceted planes; bronze and gold aged, not
mirror-bright. The three must look like three levels of one building, by one hand.

THE THREE LEVELS (a stepwell in India, gone down one level at a time)
Level 1, the court. The top of the well, in daylight. Irregular sandstone paving round
one large carved sun medallion, set a little below the middle. Sunlight through two
arched screens of pierced stone falls as a faint lattice across the upper left. A carved
quarter-fan in each corner. A few marigold petals, at the edges only. Steps of the same
sandstone, with small brass pots of marigolds standing on them.

Level 2, the flooded landing. Water stands over the floor. Four drowned steps go down
toward the middle, each ring darker than the last, so the middle is the deepest and
darkest. Lotus leaves with a few pink flowers, three or four small fish and six small
floating clay lamps, all near the edges. In the deep middle, the long faint shadow of a
huge serpent under the water: a hint, barely darker than the water round it. The steps
are wet grey-green stone with moss.

Level 3, the hoard. The vault at the bottom of the well. Dark brown stone with a thin
gold lattice inlaid in it. A great serpent of aged bronze is laid into the floor as a
border just inside the steps, all the way round, its head at the top with two small red
eyes. Gold and gems heaped in the four corners only. In the middle, one round grate with
a gold rim, and dark water glowing teal beneath its bars. Steps of dark stone edged with
gold, a few coins lying on them.

NEVER
No people, characters or creatures other than those named. No text. No religious symbols
or figures: no Om, swastika, trident, idol, deity, shrine, temple bell or sacred diagram.
The sun on level 1 is a plain carved sun. No photorealism. No frame, caption, watermark
or anything like a game's buttons and bars.

WHERE TO SAVE
game/assets/incoming/well-delver/floor-1.png, floor-2.png and floor-3.png, at the full
size they were made. Do not change any other file, and do not run any git command.

HOW TO WORK
Make level 1 only, first, and show me. Tell me its size in pixels and anything in the
layout you changed. I will try it in the game with the characters standing on it before
you make the other two.
```

**What will be checked when one comes back:** that the hero in cream can be found on it
at a glance, that a slam warning and a loot drop still read, and that the band of steps
can be told from the floor. The first one usually fails on brightness; expect a second
try.

## 3. A piece for the hero to wear

The hero's picture is in four parts, each of which can be replaced: head, chest, legs,
and the strap the weapon hangs from (`requirements.md` §2.42). A piece is not drawn on
its own. It is made by changing one thing in the hero's own picture, so that it sits
exactly where the old one sat, in all three views. Attach `hero-turnaround.png` and send
this, with the two bracketed lines filled in. One piece to a picture.

```text
Attached is the turnaround of the hero of my game: the same character from the front,
the back and the right side, 1774 x 887 pixels, on a transparent background.

Make a copy of this picture with ONE thing changed:
[replace the teal head-wrap and scarf with a bronze helmet that has a neck guard]

RULES (another tool cuts the changed part out and lays it over the original, so they matter)
- The picture stays exactly 1774 x 887 pixels, with a transparent background.
- The three figures stay exactly where they are: the same pose, the same size, the same
  place in the picture. Do not redraw the character; change the one thing.
- Change nothing else: not the face, the body, the other clothes, the spear, the colours
  or the light.
- The new piece shows in all three views as the same object.
- It covers at least what the old piece covered where it meets the body (the neck, the
  waist, the ankles). Nothing is painted underneath it.
- It stays close to the body: nothing wider than the shoulders or taller than a hand above
  the head, and nothing that reaches into the next view.
- The same look as the rest: faceted planes, matte cloth, leather, aged bronze.
- No crown, halo, sacred mark or symbol of any faith.

Save it as game/assets/incoming/well-delver/pieces/[head-bronze-helm].png, at full size.
Do not change any other file, and do not run any git command.
Tell me what you changed and anything you could not keep exactly as it was.
```

The four names to use in the file name are `head`, `chest`, `legs` and `holster`. Make one
piece first: the way the game lays a new shape into a slot is built against it.

## 4. What comes back, and what happens to it

| Picture | Where | What Claude does with it |
|---|---|---|
| `<name>-turnaround.png` | `game/assets/incoming/well-delver/` | Cuts it into stills and a walk sheet, sets its size in the game, shows it on all three floors |
| `<name>-walk-side.png` | the same | If the four figures match the turnaround, the side walk is made from them and not from the still |
| `pieces/<slot>-<name>.png` | the same | Cuts the changed slot out, bends it as the hero is bent, and shows it on the profile and in a fight |
| `floor-N.png` | the same | Cuts it into the floor and its band of steps, fits both to the arena, puts the game's own lamps and glows over it, and shows the cast on it beside today's floor |

File names in the game keep their first names (`requirements.md` §2.12): hexer is
`rakshasa`, brute is `mahish`, bloodseed is `raktabija`, gatekeeper is `bakasura`,
guardian is `nidhiraksha`. Nobody making pictures needs to know that.
