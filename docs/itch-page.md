# The itch.io page: what to upload, what to paste, what to tick

Prepared 2026-10-10 for build 0.9 and rebuilt the same day as 0.13 with the teaching pauses and the free rides closed (launch track L9, `design-document.md` §1.2). **Current, 2026-10-16: the five screenshots, the cover and the GIF are from builds 0.23 to 0.25, with the founder's cast, floors and icons, the new names and the name Sevenwell (the title screenshot and cover from 0.25, the GIF from 0.25 at 60 frames a second). The zip is built from whatever `main` is when it is uploaded: run `python tools/build-itch.py` then, and the checks of §6.** Everything
here is ready to use except where it says otherwise. The upload itself is the founder's:
creating the itch.io account and signing in cannot be done for them.

**Still open before the page goes public**

| What | Whose | Why it matters here |
|---|---|---|
| ~~The game's name (L1)~~ | Done, 2026-10-14 | **Sevenwell.** The page address is made from it: `sevenwell` |
| ~~The FormSubmit alias (L10)~~ | Done, build 0.24 | The founder's address is no longer in the page |
| A mid-range Android (L8) | Founder | The wide arena has only run on an iPhone 16 Pro Max |
| The security pass (L11) | Claude, just before the upload | `pre-launch-security-checklist.md` |

## 0. How it goes up (agreed 2026-10-14)

The founder's plan: the page goes up first where only invited people can open it, and the
five outside players (P11, `design-document.md` §1.1) are sent its link. Their feedback
comes through the in-game form and itch.io's comments. Then it goes public.

1. The founder creates the page as a draft and uploads the zip (§2).
2. The checks of §5, on the draft page, on a phone.
3. Visibility set so that only people with the link can open it (itch.io's restricted
   setting, or a draft's secret link: whichever the page offers when it is made).
4. The link goes to five people who have never seen the game.
5. Once their answers are read and anything urgent is fixed (a new zip, the same page),
   Visibility: Public.

The name (L1) should be final before step 1: the page's address is made from it, and
cannot be changed later without breaking every link sent.

## 1. The files

| File | What it is | Where it goes |
|---|---|---|
| `dist/sevenwell-0.25-itch.zip` | The game: 127 files, 9.55 MB. Made by `python tools/build-itch.py` | Uploads |
| `store/itch/cover-draft.png` | Cover, 630 by 500. **A draft: it carries the working title** | Cover image |
| `store/itch/1-title.png` | The title screen, the well part filled | Screenshots, in this order |
| `store/itch/2-drowned-steps.png` | Brutes, Hexers and imps on level 2, the flooded landing | |
| `store/itch/3-hoard-guardian.png` | The Hoard Guardian under his dome, held by its anchors, on level 1 | |
| `store/itch/4-vritra.png` | Overdrive (fire) bursting round The Thirst on level 3 | |
| `store/itch/5-boons.png` | Choosing a boon | |
| `store/itch/gameplay.gif` | Five seconds of a level 1 fight, 240 by 420, 2.0 MB (build 0.25: imps and brutes, Overdrive's FIRE button, "Stored: Copper Life Gem") | In the description, above the first line |

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
| Title | Sevenwell |
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

Player-facing, so it follows the game's rules: plain English (since build 0.23 the game
keeps no Sanskrit word in its default names), no hero's name, nothing sacred.

**Tagline**

> The Thirst has drunk the well dry. Go down and take the water back. A one-thumb arena roguelite.

**Description**

> **The Thirst, a serpent, has drunk the well dry. He is at the bottom of it.**
>
> Sevenwell is an arena roguelite made for a phone and one thumb. Your hero strikes on
> their own. Your whole job is choosing where to stand.
>
> - **Three levels down, a boss on each.** The Gatekeeper bars the way. The Hoard
>   Guardian hides behind a shield. The Thirst waits at the bottom and knows every trick
>   the others use.
> - **Read the slam.** A red zone shows where a boss will strike and fills as it winds
>   up. Step out in time, or pay for it.
> - **Read the cycle.** The fight loops through Calm, Surge, Eclipse and Zenith. In Eclipse
>   everyone hits harder, you included. From the second depth, every boss has a phase
>   when it opens up.
> - **Loot you walk over.** Anything stronger than what you carry is worn at once; the
>   rest waits in your satchel, and a full one sells its weakest. A venom dagger, a sword
>   that heals you, lightning that jumps to the next imp. Copper is common, gold is rare.
> - **Boons when you want them.** Every wave you clear earns one. Tap + when you have a
>   moment and choose one of three; the fight never stops to make you choose.
> - **Overdrive.** It fills as you fight. Let it go for six seconds of power shaped by the
>   weapon in your hand: fire, poison, blood, lightning or the executioner's blow.
> - **Seven depths.** Slay the serpent and the well fills a step. Go down again and it
>   is harder and pays more Hoard. Fill the well to win the game.
> - **Perks that stay.** Your first boss kills and every depth you win earn one. Wear two.
>
> A run takes about five minutes. Progress is saved in your browser.
>
> **Controls.** Phone: tap where you want to go, or hold and drag. Computer: click or
> drag, or use the arrow keys or WASD; Space or E for Overdrive; P or Esc to pause.
>
> **Privacy.** No accounts, ads or tracking. Your progress stays in your browser. The
> Feedback button sends only what you type, with the build, how deep you have been, your
> screen size, your device type and any errors the game hit, to the developer by email; a
> reply address only if you give one.
>
> **This is a prototype.** There is no music yet, only sound effects. There is a
> Feedback button on the title screen and after every run. Every message is read.
>
> Made by one person with an AI coding assistant. The characters, floors and icons are my
> own designs, made with ChatGPT; sound effects by Kenney, engine by Phaser.

Two lines above are the founder's to confirm, because they speak for them: "Every
message is read" and "Made by one person with an AI coding assistant". The privacy
paragraph (2026-10-16, the founder's "go with 4 to 8") says what `dialogs.js` sends and
nothing more; `SECURITY.md` has the longer form. Change one, change both.

## 4. The generative AI disclosure

itch.io asks whether a project contains generative AI, and of which kinds. Answer it as
it is; players can filter on it, and a wrong answer is worse than a filtered page.

| Kind | Answer | Why |
|---|---|---|
| Code | Yes | The game's code was written with an AI assistant |
| Text and dialogue | Yes | The in-game text was drafted with an AI assistant and edited by the founder |
| Graphics | **Yes**, since build 0.14 | The title screen's picture was made by the founder with ChatGPT. Since build 0.15 every character (The Thirst too), the three floors and every icon are the founder's designs, made with ChatGPT's image generation. Effects and the screens' frames are drawn by code |
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
4a. **The security policy inside itch.io's frame** (`pre-launch-security-checklist.md`, line 18): the game reaches Begin, the pictures and sounds are there, and the feedback message in step 3 is sent. If anything is missing, the policy is blocking itch.io's address for the game's own files: tell Claude before going public.
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
