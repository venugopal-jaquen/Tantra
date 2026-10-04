# Character art guide: sprite sheets, and making your own cast

Written 2026-10-05 for the founder, who wants to make the game's characters with a personal
touch, using image tools, without commissioning an artist yet (`design-document.md` §1.4).
It explains what a sprite sheet is, what this game needs, and who does which part.

## 1. What a sprite sheet is

A character on screen is a small picture, a **sprite**. To make it walk, the game shows a
few slightly different pictures one after another, like a flip book. Each picture is a
**frame**.

A **sprite sheet** is one image file that holds all of a character's frames, laid out in a
grid of equal cells. The game is told the size of a cell, cuts the sheet up, and plays the
cells in order.

```
            frame 1   frame 2   frame 3   frame 4
          +---------+---------+---------+---------+
  front   |  stand  | L foot  |  stand  | R foot  |   <- a 4-frame walk, facing the camera
          +---------+---------+---------+---------+
  back    |         |         |         |         |
          +---------+---------+---------+---------+
  side    |         |         |         |         |   <- drawn once; the game mirrors it
          +---------+---------+---------+---------+      for the other side
```

Three things make a sheet work:

1. **Every cell is the same size**, and the character stands on the same spot in each. If
   the feet jump from cell to cell, the character jitters.
2. **The background is transparent** (a PNG file), so the floor shows around the character.
3. **It is the same character in every cell**: same clothes, colours, proportions and
   light. This is the hard part with image tools, and section 4 is about it.

Why one file and not many: fewer downloads, and a phone's graphics chip draws many copies
of one image far faster than many separate images.

## 2. What the game uses today

- 8 characters, each as **4 still pictures**: front, back, left, right. 32 files of
  96 x 96 pixels in `game/assets/chars/`, named like `kiran-front.png`.
- No frames. Since 2026-10-05 the stills are moved by code (a hop, a lean, a squash when
  hit: `requirements.md` §2.31), and Vritra is drawn entirely in code as a serpent, so he
  needs no art.
- The stills come from four free CraftPix packs (`game/assets/CREDITS.md`). They are
  European fantasy: a warrior, goblins, a Viking, a caveman.

**Something worth knowing:** those four packs are already on this machine, and they hold
full animation for every character and facing: walk (20 to 30 frames), attack, hurt, dying
and idle. The game takes only the first idle frame of each. So real walk and attack
animation for the *current* cast can be switched on from files already licensed, at the
cost of a larger download. It would not make the cast fit the setting, which is the reason
to make your own.

## 3. What your own cast needs

Seven characters (Vritra is drawn in code):

| In the game | Role | What must read at a glance |
|---|---|---|
| Kiran | the hero | Small, bright, warm colours; the one figure that is clearly "you" |
| Asura | rank and file | Simple, in numbers; a strong silhouette at thumbnail size |
| Hexer | ranged | Looks like it throws things: a staff, a raised hand, a glow |
| Brute | slow and heavy | Twice the bulk of an Asura |
| Bloodseed | splits when killed | Reads as "more than one": blistered, budding, doubled |
| Gatekeeper | first boss | Tall, armoured, a guardian of a door |
| Hoard Guardian | level boss | Heavy, hung with gold |

Two rules already in force (`requirements.md` §2.12):

- **Enemies are antagonists, never beings anyone reveres.** No deities, no temple
  guardians, no sacred symbols on any character.
- The setting is a stepwell; the palette is warm (maroon, sandstone, saffron, gold). Enemies
  in cool colours (teal, violet, sickly green) stand out against it.

Sizes. Kiran is drawn about 44 pixels wide on a 400-pixel-wide screen, and phones triple
that. Make each cell **256 x 256**; the game shrinks it. At that size, fine detail
vanishes, so judge every design at thumbnail size: if the silhouette does not read when
the picture is as big as a fingernail, the detail will not save it.

View. The current art is a three-quarter top-down view with large heads ("chibi"
proportions), which keeps faces readable when small. Keep one view for everyone.

**Three stages, each usable on its own:**

| Stage | You make | Frames | The game gains |
|---|---|---|---|
| 1 | A front, back and side still for each of 7 characters | 21 pictures | A cast that belongs to the setting. The code motion keeps them alive. |
| 2 | A 4-frame walk for each facing | 84 | Real walking |
| 3 | An attack and a hurt frame for Kiran and the two bosses | about 20 | Hits that land |

Stage 1 is the one that changes how the game looks in a screenshot. Start there.

## 4. Making them with image tools

Image generators are good at one striking picture and poor at **the same character
twice**. Ask for "the hero, facing away" in a new request and you get a different hero. The
ways round it, most useful first:

1. **Ask for the whole turnaround in one picture.** "A character sheet: the same character
   shown from the front, the back and the side, in a row, full body, on a plain flat
   background." One picture, one character, three views. I cut it into cells.
2. **Use a reference picture.** Most tools can take an image as a guide (called character
   reference, image reference or image-to-image). Make one picture of the character you
   love, then ask for the other views and the walk frames *from that picture*.
3. **Start from your own drawing.** This is where the personal touch comes from. A rough
   pencil sketch photographed with the phone is enough: stick figure, shapes, a note on
   colours. Give it to the tool as the reference and ask it to paint that design in the
   style block below. The idea and the shapes are then yours; the tool is the inker.
4. **Fix the style in words and never change them.** Paste the same style block at the
   start of every request, for every character.
5. **Ask for a plain, flat background** in a colour the character does not use (bright
   green or magenta). I remove it and make the picture transparent.
6. For walk frames, ask for "a 4-frame walk cycle of this character, in a row, same size,
   same position". Expect to try several times and to keep the best two or three frames;
   I can fill a missing in-between by nudging limbs.

**Style block** (the same family as `docs/art-prompts.md`, for characters):

```
2D game character sprite, three-quarter top-down view, chibi proportions with a large
head, flat shapes with soft painted shading, clean dark outline, no photorealism.
Full body, standing, centred, feet visible. Plain flat bright green background, no
shadow on the ground, no text. Indian setting: a stepwell of carved red sandstone.
```

**Then one character**, for example:

```
Character sheet, the same character three times in a row: front view, back view, side
view facing right. A young lamp-bearer hero: saffron tunic, gold sash, short dark hair,
a small bright blade, bare forearms, cream leggings. Brave, quick, friendly.
```

**Tools.** Any image generator that accepts a reference picture will do, and the free
tiers are enough to find out whether you enjoy this. Before settling on one, check two
things on its own terms page, on the day: that pictures made on your plan may be used
commercially, and whether it asks you to say they were AI-made. itch.io asks creators to
disclose generative-AI content, which the launch checklist already covers (`design-document.md`
L9). For touching up by hand, Krita and GIMP are free; Photopea runs in a browser.

## 5. Who does what

**You:** the designs. Sketch or describe each character, generate until one is right, and
drop the pictures, as they come out of the tool, into `game/assets/incoming/`. One picture
per character is fine. Nothing needs to be cut, resized or cleaned.

**Me:**

- remove the background and cut the picture into equal cells;
- line the feet up so nothing jitters, and even out size between characters;
- build the sheet, shrink it for the game, and wire it in. Replacing the stills needs no
  change to the game's code: the files keep their names. Walk frames need a small change,
  once, that then serves every character;
- show you each one in the game, at real size, on the real floors, before anything is kept;
- record where every picture came from in `game/assets/CREDITS.md`.

A good first session: Kiran only, stage 1. One character through the whole route shows
what the tool can hold steady, and sets the style for the other six.
