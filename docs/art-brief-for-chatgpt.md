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

## 4. The loot icons

Weapons and trinkets lie on the floor as small icons and show again in the satchel and
on the profile. Today they are eleven flat white shapes, coloured by the game. The
founder asked for a prompt (2026-10-11). The game shows how good an item is by its metal:
copper, silver or gold. So each icon is painted once, with its metal in plain grey, and
the game colours the metal. Attach the hero and Asura turnarounds for the look.

```text
I need the loot icons for my game, in the same Well Delver look as the characters you
made for it (the hero and the Asura turnarounds are attached, for the look).

WHAT TO MAKE
One PNG with a transparent background: a grid of 4 columns and 3 rows of equal square
cells, one object in each, in this order, left to right, top row first:
 1. Dagger: a plain, quick dagger.
 2. Venom Dagger: a dagger with a green, dripping edge.
 3. Blood Sword: a short sword with a crimson edge and a red drop at the guard.
 4. Storm Disc: a plain steel throwing ring with a yellow and red crackle of lightning
    on it. A plain ring: not a spoked wheel, not a flaming disc.
 5. Executioner's Axe: a heavy axe with one notched blade and a dark leather grip.
 6. Life Gem: a red faceted gem in a simple metal setting.
 7. Aegis: a small round shield with a boss at its middle.
 8. Thorn Band: a bangle with thorns all round it.
 9. Swift Sandals: one sandal with a small feather at the ankle and a metal buckle.
10. Healing Herb: a sprig of green leaves held by a small metal clasp.
11. Unknown item: a cloth bundle tied with cord and closed with a plain metal toggle.
    Nothing shows what is inside.
12. Leave this cell empty.

RULES
- The picture is 1024 x 768 pixels, or larger in the same shape, so that every cell is a
  square at least 256 pixels across.
- Each object sits in the middle of its cell, fills about three quarters of it, and has
  clear space all round. Nothing crosses into the next cell.
- A truly transparent background. No lines between cells, no labels, no numbers, no
  text, no ground shadow, no glow.
- Every icon must read when it is 20 pixels across on a phone: one bold, chunky shape,
  two or three colours, no fine detail, no thin lines. The eleven shapes must be told
  apart at a glance.
- EVERY METAL PART IS PLAIN PALE GREY STEEL: blades, the axe's head, the shield, the
  band, settings, buckles, clasps, the toggle. The game colours the metal copper, silver
  or gold itself, to show how good the item is. Nothing that is not metal may be grey or
  white.
- What is not metal keeps a strong colour of its own: green venom, crimson blood,
  yellow and red lightning, the red gem, green leaves, brown leather, cream cloth.
- All eleven are seen from the same angle, a little from above and to one side, and lit
  as the characters are: warm light from above.
- The look of the characters: stylised low-poly 3D, faceted planes, painted, matte.
- No symbol of any faith. No trident, conch or sacred mark. The disc is a plain weapon,
  not the weapon of any god.

Save it as game/assets/incoming/well-delver/loot-icons.png, at the full size it was made.
Do not change any other file, and do not run any git command.
Tell me its size in pixels and anything you could not do as asked.
```

## 4a. Three loot icons painted again

Asked for on 2026-10-12: "Repaint those 3 icons". The game shows an item's quality by
recolouring its steel copper, silver or gold. On the Swift Sandals and the Healing Herb
the only steel is a small buckle or clasp (2 to 4% of the picture), so at the size loot
lies on the floor all three qualities look alike. An item not yet known has no quality
shown: its steel is turned violet to mark it unknown, and the bundle's small toggle leaves
too little violet to see. The eight others are approved and stay as they are, the yellow
and red Storm Disc among them.

Attach: `game/assets/incoming/well-delver/loot-icons.png` (the look, the steel, which
three to redo), the hero turnaround (the look), and if you like
`concept/icons-2026-10-11-loot-metal.jpg` (how the game recolours the steel). Send it in
the conversation that made the loot icons if you can. The lines starting "Idea:" are yours
to change.

```text
You made the loot icons for my game (loot-icons.png, attached), in the same Well Delver
look as the hero (hero-turnaround.png, attached). Eight of them are approved and stay
exactly as they are. Three need painting again: the Swift Sandals, the Healing Herb and
the unknown item (the bottom row). Paint only these three.

Another tool cuts your picture into game icons. Your job is ONLY to make the picture
described here. Do not cut it, shrink it or change any game file.

WHY
The game shows how good an item is by recolouring its steel copper, silver or gold, and
marks an item not yet known by turning its steel violet. On these three the only steel is
a small buckle, clasp or toggle, so at 20 pixels on a phone the colour does not show.
Each needs MUCH more of itself in steel: at least a third of what you see, and close to
half is better, in large plain pieces, not small details.

WHAT TO MAKE
One PNG with a transparent background, 1536 x 1024 pixels: the three objects side by
side, each in the middle of its own third of the picture, in this order, left to right:
 1. Swift Sandals: one sandal, seen as before.
    [Idea: the sole is a thick plate of steel, its faceted edge showing all round; a wide
    steel cuff round the ankle with a big square steel buckle; a steel heel guard; the
    straps across the foot in brown leather; a small tuft of teal feathers at the ankle.]
 2. Healing Herb: a bunch of broad green leaves.
    [Idea: their stems gathered in a thick, faceted steel holder, a cuff about a third
    as tall as the whole object with a heavy steel knob at its end, the leaves fanning
    out of it.] The leaves stay the largest part, about half of what you see.
 3. Unknown item: a round cloth bundle, closed, gathered at its neck.
    [Idea: deep indigo cloth; a broad steel collar round the neck and a broad steel band
    round its middle, the two bands parallel; a large plain steel toggle on the collar.]
    Nothing shows what is inside: no coins, no flap, no lock.

RULES (the cutting depends on each of these)
- Match the eight approved icons in loot-icons.png exactly: the same angle (a little
  from above and to one side), the same warm light from above, the same size of facets,
  the same pale steel as the dagger blades. Stylised low-poly 3D, faceted planes,
  painted, matte.
- Each object about 400 pixels at its longest, with clear space all round. Nothing
  crosses into the next third.
- A truly transparent background. No lines, no labels, no numbers, no text, no ground
  shadow, no glow.
- EVERY METAL PART IS PLAIN PALE GREY STEEL: the sole, cuffs, buckle, holder, knob,
  collar, band and toggle. The game colours the steel itself. Make the steel large,
  simple pieces; no rivets, chains or thin wires standing in for it.
- NOTHING THAT IS NOT METAL MAY BE GREY, WHITE, CREAM, BEIGE OR PALE. The leather is the
  same brown as the dagger grips (not black); the feathers are teal, not white; the
  leaves are green; the cloth is a strong colour, not cream or sacking. The tool finds
  the metal by its pale grey, and anything else pale would be taken for metal.
- Every icon must read when it is 20 pixels across on a phone: one bold, chunky shape,
  two or three colours, no fine detail, no thin lines. Each must still be told apart at
  a glance from the other eight, and from a leather satchel with a flap, a purse of
  coins and a padlock, which are other icons in the game.
- No symbol of any faith. No bands that cross each other to make a cross. No wings on
  the sandal: a small tuft of feathers only.

Save it as game/assets/incoming/well-delver/loot-icons-2.png, at the full size it was
made. Do not change loot-icons.png or any other file, and do not run any git command.
Tell me its size in pixels and anything you could not do as asked.
```

## 5. The other icons

Asked for on 2026-10-11: "create a list of other visual icons (boons, drops etc) that
needs to be redesigned and send a prompt for Chatgpt for that." Everything below is a
flat white shape drawn by code today, coloured by the game. The only things that drop on
the floor are the eleven loot icons of §4; treasure is paid straight to the count.

| What | How many | Where it shows | Today |
|---|---|---|---|
| **Boons** | 18 | The three cards after every wave, the row of boons taken, the profile, the list of powers | Its own white shape each, coloured by its metal |
| **Perks** | 8 | The profile, the pause screen, How to Play | Borrow a loot or boon shape, in violet |
| **The five great powers** (Tejas) | 5 | The profile, the list of powers | Borrow the weapon's shape, in the power's colour |
| **Signs for numbers** | 5 | The profile: health, shield, attack damage, attack speed, move speed | Borrow a loot or boon shape |
| **Treasure and Power** | 2 | The top of the screen, the profile, the end of a run | A word and a number, no sign |
| **Empty slot, locked** | 2 | "No trinket", "Tejas: dormant" | Borrow the unknown item's shape, in brown |
| **Satchel** | 1 | Its tab at the edge of the screen | An arrowhead |
| **The four phases** | 4 | The bar at the top, How to Play | A coloured bar and a word |

The borrowing stops working once the loot icons are paintings: a painted dagger tinted
orange is not "Fire". So each kind gets a shape of its own: boons are round tokens of
their metal, perks are charms on a violet cord, signs are plain emblems. A boon's metal
never changes, so it is painted in; nothing here needs the game to colour it.

**Not pictures; drawn by the game and staying so:** the slam warnings, health bars, the
ring at the hero's feet, the arrows to what is off screen, the pause and + buttons, the
wave track, panels and buttons. What stands round a boss, and how enemies die and split,
is redrawn in code in the faceted look (`requirements.md` §2.45).

Attach the hero and Asura turnarounds and, once it is made, `loot-icons.png`.

```text
I need the rest of the icons for my game, in the same Well Delver look as the characters
and the loot icons you made for it (attached: the hero and Asura turnarounds, and
loot-icons.png, for the look).

Another tool cuts your pictures into the game's icons. Your job is ONLY to make the six
pictures described here. Do not cut them, shrink them or change any game file.

WHAT TO MAKE
Six PNG pictures, each 1536 x 1024 pixels with a transparent background. Each is a grid
of equal cells with one icon in each cell, in the order given: left to right, top row
first.

RULES FOR ALL SIX (the cutting depends on each of these)
- Each icon sits in the middle of its cell, fits inside a square about three quarters of
  the cell's height, and has clear space all round. Nothing crosses into the next cell.
- A truly transparent background. No lines between cells, no labels, no numbers, no
  text, no ground shadow, no glow or haze.
- Every icon must read when it is 16 pixels across on a phone: ONE bold, chunky shape,
  two or three colours, no fine detail, no thin lines.
- Every icon must be told apart at a glance from every other one, across all six
  pictures, and from the eleven loot icons.
- All seen from the same angle as the loot icons and lit the same way: warm light from
  above.
- The look of the characters: stylised low-poly 3D, faceted planes, painted, matte.
- Nothing that people revere and no symbol of any faith: no trident, conch, discus,
  lotus, Om, swastika, crescent and star, cross, halo, third eye, eye in a hand or a
  triangle, no likeness of any deity. No skulls. No letters or numerals.

Each of the four kinds has its own shape, so a player can tell what kind of thing an icon
is before they can tell which one it is. Keep to these shapes.

------------------------------------------------------------------------------------
PICTURES 1, 2 AND 3: BOONS (18 in all). Grid: 3 columns, 2 rows.
A boon is a power the hero picks up during a run. Every boon is a THICK ROUND TOKEN, like
a heavy coin, tilted a little so its faceted edge shows. All six tokens in one picture
are the same metal, the same size and the same tilt. On the face of each is ONE raised
emblem that fills it, painted in the strong colour given. Only the emblem differs.

PICTURE 1: six COPPER tokens (warm orange-brown copper). File: boons-copper.png
 1. Keen Edge (more damage): the point of a blade, upright, with a four-pointed glint
    beside it. Hot orange.
 2. Quick Hands (faster attacks): two chevrons side by side, pointing right. Yellow.
 3. Long Reach (longer range): a long arrow leaving a dot, pointing up and to the right.
    Aqua.
 4. Light Feet (faster on foot): one footprint. Leaf green.
 5. Iron Body (more health): a breastplate with a ridge down its middle. Crimson.
 6. Thick Hide (takes less damage): three overlapping scales. Slate blue.

PICTURE 2: six SILVER tokens (pale, cool silver). File: boons-silver.png
 1. Hold Your Ground (stronger standing still): a spike driven point down into a flat
    line of ground. Hot orange.
 2. Strike on the Run (faster while moving): an arrow pointing right with three speed
    lines behind it. Yellow.
 3. Second Target (each attack hits one more enemy): one dot at the bottom with two
    lines branching up to two rings. Aqua.
 4. Read the Slam (stepping out of danger makes the hero stronger): a ring with a bold
    arrow leaving it, up and to the right. Red.
 5. Last Stand (stronger when nearly dead): a heart cracked down its middle, a flame
    rising out of the crack. Crimson heart, orange flame.
 6. Greed (more treasure, at a price): a stack of three coins. Gold.

PICTURE 3: six GOLD tokens (bright yellow gold). File: boons-gold.png
The emblems here are dark or strongly coloured so that they stand out from the gold.
 1. Spreading Rot (poison passes on): one large drop with two small drops flying off it.
    Green.
 2. Blood Shield (healing becomes a shield): the outline of a shield holding one drop.
    Deep crimson.
 3. Forked Lightning: a lightning bolt that splits in two at its lower end. Teal blue.
 4. Clean Cut: a square block cut in two by one clean diagonal slash, the halves slipping
    apart. Dark iron brown.
 5. Kindling (the hero's great power fills faster): a flame. Orange-red.
 6. Eclipse Hunger (kills heal during an eclipse): a dark disc with a thin bright rim of
    light all round it, a sun fully covered. A whole disc: not a crescent. Dark red.

------------------------------------------------------------------------------------
PICTURE 4: PERKS (8). Grid: 4 columns, 2 rows. File: perks.png
A perk is a keepsake won from a boss and kept for good. Every perk is a CHARM hanging
from a short loop of VIOLET cord, knotted at the top. The cord is the same on all eight.
 1. Sentinel's Guard (blocks the first hit of each level): a small, tall, rectangular
    bronze shield with a boss at its middle, like a door.
 2. Hoarder's Eye (more items drop): a polished amber cat's-eye gemstone, one bright slit
    of light across it, in a gold claw setting. A stone, not a living eye.
 3. Serpent's Scale (takes less damage): one large indigo serpent scale edged in gold.
 4. Deep Lungs (more health): three air bubbles, one large and two small. Pale blue-green.
 5. Second Wind (survives one killing blow): a cream feather curled round a swirl of
    wind.
 6. Quick Study (starts with a boon waiting): a rolled palm-leaf scroll tied with red
    cord. No writing on it.
 7. Second Thoughts (one more reroll): one chunky bone die showing dots, a curved arrow
    circling it.
 8. Tribute Taker (bosses pay sooner): a small drawstring purse, open, three gold coins
    spilling out.

------------------------------------------------------------------------------------
PICTURE 5: SIGNS (12). Grid: 4 columns, 3 rows. File: signs.png
Plain emblems on their own: no token under them, no cord. Each is ONE colour family,
lighter at the top and darker at the bottom, as given.
 1. Treasure (the game's money): one gold coin stamped with three squares, one inside
    another. No face and no writing on it.
 2. Power (how strong the hero is): a four-pointed star. Amber.
 3. Health: a heart. Red.
 4. Shield: a pointed kite shield. Pale blue. (The loot icon Aegis is a ROUND shield;
    this one must not be round.)
 5. Attack damage: the same blade point and glint as on Keen Edge. Orange.
 6. Attack speed: the same two chevrons as on Quick Hands. Yellow.
 7. Move speed: the same footprint as on Light Feet. Green.
The last five are the hero's five great powers. Their colours match effects already in
the game, so keep to them:
 8. Fire: a flame. Gold-yellow (#FFDC64) at the tip to orange-red (#E8501A) at the base.
 9. Poison: a bubbling cloud of three lumps. Yellow-green (#CFE650) to leaf green
    (#5A9433).
10. Blood: one heavy drop. Coral (#FF8273) to deep crimson (#9C1F30).
11. Lightning: one bolt, in hard angles. Pale aqua (#BAF4F2) to teal blue (#2A9DB5).
12. Execution: a heavy axe blade falling edge down. Pale gold (#F7D264) to dark bronze
    gold (#A66F1C).

------------------------------------------------------------------------------------
PICTURE 6: SCREEN ICONS (7). Grid: 4 columns, 2 rows. File: hud.png
Objects and plain signs. The least pressing of the six: make it last.
 1. Satchel: a brown leather satchel with a flap and one buckle.
 2. Empty slot: an empty round setting, a ring with four claws and nothing in it. Dull
    dark bronze.
 3. Locked: a chunky bronze padlock, closed.
 4. Calm: three gentle ripples of water. Sky blue (#4DD0FF).
 5. Surge: three bold arrows pointing up, side by side, the middle one tallest. Orange
    (#FF8C42).
 6. Eclipse: the same covered sun as on Eclipse Hunger, a dark disc with a bright rim.
    Dark red (#C4331F).
 7. Convergence: four arrowheads pointing in to one bright point at the middle. Cream
    white (#FFFBEF).
 8. Leave this cell empty.

------------------------------------------------------------------------------------
WHERE TO SAVE, AND WHAT NOT TO TOUCH
Save into game/assets/incoming/well-delver/icons/ under the six file names above, each
at the full size it was made. Do not change any other file, and do not run any git
command: another tool is working in this folder too.

WHEN YOU ARE DONE, TELL ME
- the files you made, and each one's size in pixels;
- for each, whether the background is truly transparent and every icon is clear of its
  neighbours;
- which image model made them (it goes in the game's credits);
- anything you could not do as asked.

Make PICTURE 1 first, the six copper tokens, and show me before making the rest.
```

## 6. What comes back, and what happens to it

| Picture | Where | What Claude does with it |
|---|---|---|
| `<name>-turnaround.png` | `game/assets/incoming/well-delver/` | Cuts it into stills and a walk sheet, sets its size in the game, shows it on all three floors |
| `<name>-walk-side.png` | the same | If the four figures match the turnaround, the side walk is made from them and not from the still |
| `pieces/<slot>-<name>.png` | the same | Cuts the changed slot out, bends it as the hero is bent, and shows it on the profile and in a fight |
| `loot-icons.png` | the same | **Done (2026-10-11):** `tools/cut-icons.py` cuts the eleven and makes each in copper, silver and gold, recolouring only its metal |
| `loot-icons-2.png` | the same | The three of §4a: `tools/cut-icons.py` is taught to take those three from it and leave the old three, and each is checked for how much of it the metal is (at least a third) |
| `icons/boons-*.png`, `perks.png`, `signs.png`, `hud.png` | the same | **Done (2026-10-11):** cut by the same tool and shown wherever the white shapes were. A remade sheet of the same name is cut the same way |
| `floor-N.png` | the same | **Done for the first three (2026-10-11):** laid on the arena with its steps round it, the game's lamps and glows moved to the picture's. A remade floor of the same name is put in the same way |

File names in the game keep their first names (`requirements.md` §2.12): hexer is
`rakshasa`, brute is `mahish`, bloodseed is `raktabija`, gatekeeper is `bakasura`,
guardian is `nidhiraksha`. Nobody making pictures needs to know that.
