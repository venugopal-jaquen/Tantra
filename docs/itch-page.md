# The itch.io page: what to upload, what to paste, what to tick

Prepared 2026-10-10 for build 0.9 and rebuilt the same day as 0.13 with the teaching pauses and the free rides closed (launch track L9, `design-document.md` §1.2). Everything
here is ready to use except where it says otherwise. The upload itself is the founder's:
creating the itch.io account and signing in cannot be done for them.

**Still open before the page goes public**

| What | Whose | Why it matters here |
|---|---|---|
| The game's name (L1) | Founder | The title, the page address and the cover all carry it. Everything below says "Anantarya", the working title |
| The FormSubmit alias (L10) | Founder sends it | Until it is swapped in, the founder's address is readable in the page |
| A mid-range Android (L8) | Founder | The wide arena has only run on an iPhone 16 Pro Max |
| The security pass (L11) | Claude, just before the upload | `pre-launch-security-checklist.md` |

## 1. The files

| File | What it is | Where it goes |
|---|---|---|
| `dist/anantarya-0.14-itch.zip` | The game: 90 files, 2.7 MB. Made by `python tools/build-itch.py` | Uploads |
| `store/itch/cover-draft.png` | Cover, 630 by 500. **A draft: it carries the working title** | Cover image |
| `store/itch/1-title.png` | The title screen, the well part filled | Screenshots, in this order |
| `store/itch/2-drowned-steps.png` | A fight on level 2 | |
| `store/itch/3-hoard-guardian.png` | The Hoard Guardian's cleave on level 1 | |
| `store/itch/4-vritra.png` | Vritra's ring slam on level 3 | |
| `store/itch/5-boons.png` | Choosing a boon | |
| `store/itch/gameplay.gif` | Five seconds of a level 1 fight, 240 by 420, 2.6 MB | In the description, above the first line |

The zip holds the game page as `index.html`, the sprites and sounds, the engine and the
two typefaces with their licences, and a credits file. It does not hold the music, which
is switched off for launch. The game in the zip fetches nothing from the internet: the
only address it ever contacts is the feedback form's mail relay, when a player sends
feedback.

The pictures were taken from that zip's contents by `tools/store-shots.mjs`, with a
returning player's save (two depths won) so the well and the perks show. The hero in
them is steered by a script and kept alive. The cover is the one posed picture: the
serpent is stood still beside the hero and the HUD is left out.

## 2. The form, field by field

itch.io's own wording may differ a little from what is written here.

| Field | Put |
|---|---|
| Title | Anantarya (the final name, once chosen) |
| Project URL | the name in lower case; it cannot be changed without breaking links, so set it after the name is final |
| Short description or tagline | see §3 |
| Classification | Games |
| Kind of project | HTML |
| Release status | Prototype |
| Pricing | No payments. The game is free and takes no donations for now, so no tax question arises |
| Uploads | the zip. Tick **This file will be played in the browser** |
| Embed options | Embed in page. Viewport **400 by 700** |
| Mobile friendly | Ticked. Orientation: **Portrait** |
| Fullscreen button | Ticked |
| Automatically start on page load | Not ticked. The game needs one tap before it can play sound anyway |
| Enable scrollbars | Not ticked |
| Description | see §3 |
| Genre | Action |
| Tags | roguelite, survivors-like, arena, top-down, loot, mythology, india, touch-friendly, singleplayer, 2d |
| Generative AI disclosure | see §4 |
| App store links | none |
| Community | Comments on. They are a second way to hear from players, beside the feedback form |
| Visibility | **Draft** until the checks in §5 pass, then Public |

## 3. Text to paste

Player-facing, so it follows the game's rules: plain English first, the four Sanskrit
words the game keeps (Asura, Vritra, Nidhi, Tejas), no hero's name, nothing sacred.

**Tagline**

> Vritra has drunk the well dry. Go down and take the water back. A one-thumb arena roguelite.

**Description**

> **Vritra, the serpent, has drunk the well dry. He is at the bottom of it.**
>
> Anantarya is an arena roguelite made for a phone and one thumb. Your hero strikes on
> their own. Your whole job is choosing where to stand.
>
> - **Three levels down, a boss on each.** The Gatekeeper bars the way. The Hoard
>   Guardian hides behind a shield. Vritra waits at the bottom and knows every trick
>   the others use.
> - **Read the slam.** A red zone shows where a boss will strike and fills as it winds
>   up. Step out in time, or pay for it.
> - **Read the cycle.** The fight loops through Calm, Surge and Eclipse. In Eclipse
>   everyone hits harder, you included. Every boss has a phase when it opens up.
> - **Loot you walk over.** No menus. A venom dagger, a sword that heals you, lightning
>   that jumps to the next Asura. Copper is common, gold is rare.
> - **Boons when you want them.** Every wave you clear earns one. Tap + when you have a
>   moment and choose one of three; the fight never stops to make you choose.
> - **Tejas.** It fills as you fight. Let it go for six seconds of power shaped by the
>   weapon in your hand.
> - **Seven depths.** Slay the serpent and the well fills a step. Go down again and it
>   is harder and pays more Nidhi. Fill the well to win the game.
> - **Perks that stay.** Your first boss kills and every depth you win earn one. Wear two.
>
> A run takes about five minutes. Progress is saved in your browser.
>
> **Controls.** Phone: tap where you want to go, or hold and drag. Computer: click or
> drag, or use the arrow keys or WASD; Space or E for Tejas; P or Esc to pause.
>
> **This is a prototype.** There is no music yet, only sound effects. There is a
> Feedback button on the title screen and after every run. Every message is read.
>
> Made by one person with an AI coding assistant. Characters by CraftPix, sound
> effects by Kenney, engine by Phaser.

Two lines above are the founder's to confirm, because they speak for them: "Every
message is read" and "Made by one person with an AI coding assistant".

## 4. The generative AI disclosure

itch.io asks whether a project contains generative AI, and of which kinds. Answer it as
it is; players can filter on it, and a wrong answer is worse than a filtered page.

| Kind | Answer | Why |
|---|---|---|
| Code | Yes | The game's code was written with an AI assistant |
| Text and dialogue | Yes | The in-game text was drafted with an AI assistant and edited by the founder |
| Graphics | **Yes**, since build 0.14 | The title screen's picture was made by the founder with ChatGPT. Characters are CraftPix stock art; floors, effects and the serpent are drawn by code |
| Sound | No | Kenney's recorded effects. Music, if bought later, is to be checked the same way |

## 5. After the upload, while the page is still a draft

1. **Play it on the draft page on a phone**, start to end of one run. The page is a
   frame inside itch.io's page, which no test here can stand in for. The save there is
   new, so this is also the one place the founder meets the tutorial as a new player does.
2. **The save is new.** itch.io serves the game from its own address, so progress made on
   the GitHub Pages link does not appear there, and the two never meet. Some browsers
   also hold back storage inside a frame; if progress is gone after closing the tab, say
   so before the page goes public.
3. **Send one feedback message from the itch.io page.** FormSubmit may ask to be
   activated again for the new address. If its activation email arrives, click it and
   send a second message to confirm.
4. **Try the fullscreen button** on a computer and on the phone.
5. Then set Visibility to Public, and watch itch.io's analytics for the first two weeks
   (L10).

When the page is live, two reminders are owed to the founder: the daily descent (P9) and
buying music (P10).

## 6. Making any of it again

```
python tools/build-itch.py                                   the folder and the zip, in dist/
node tools/smoke-test.mjs "" dist/itch/index.html            every check, against what was built
node tools/store-shots.mjs <folder>                          candidate pictures and the film
python tools/make-gif.py <folder>/film store/itch/gameplay.gif --start 2
python tools/make-cover.py store/itch/source/cover-clean.png store/itch/cover-draft.png
```

Rebuild the zip after any change to the game, and run the checks against it before
uploading. When the name changes, run the last line again: the cover takes its title
from `GAME_TITLE`. Of the screenshots only `1-title.png` shows the name; take that one
again too.
