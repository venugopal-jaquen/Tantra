# Asset Credits

Provenance for every shipped asset, kept auditable ahead of store submission.

## KayKit — the cast (`chars/`)

Source: KayKit Character Pack: Adventurers 1.0, by Kay Lousberg (www.kaylousberg.com),
https://github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0 (fetched 2026-10-10)
License: **Creative Commons Zero (CC0)**. Free for personal, educational and commercial
use; credit is not required and is given here gladly.

The pack is five rigged, animated low-poly 3D characters. The seven figures in `chars/`
are pictures rendered from them with Blender 4.5 LTS (blender.org, GPL; the program, not
its output, is under that licence), after recolouring, hiding what a figure should not
carry, and adding simple pieces built in code. `tools/3d/cast.py` holds every choice and
remakes the files; `docs/requirements.md` §2.38 says which body became which figure.
Nothing in them was made by an image generator.

| In-game | Files | Body |
|---|---|---|
| Hero | `kiran-*` (the hero's files keep their first name) | Rogue |
| Asura | `asura-*` | Barbarian |
| Hexer | `rakshasa-*` | Mage |
| Brute | `mahish-*` | Barbarian |
| Bloodseed | `raktabija-*` | Rogue, hooded |
| Gatekeeper | `bakasura-*` | Knight |
| Hoard Guardian | `nidhiraksha-*` | Barbarian |

Each figure is four stills of 160 px (`-front`, `-back`, `-left`, `-right`) and a walk
sheet (`-walk.png`): four rows by facing, a standing frame and eight walk frames, cells of
192 px, a 255-colour palette. `vritra-*` are four empty pictures: the serpent is drawn in
code and its still is never shown.

**Until 2026-10-10** the cast was stock 2D art from four free CraftPix packs (a warrior,
goblins, a Viking, a caveman), under the CraftPix file licence. None of it ships now. The
packs still sit in `incoming/` and `tools/extract-chars.py` and `tools/extract-walk.py`
still remake that cast from them.

## Kenney — sound effects (`sfx/`)

Sources: https://kenney.nl/assets/impact-sounds · https://kenney.nl/assets/interface-sounds ·
https://kenney.nl/assets/rpg-audio (downloaded 2026-09-27)
License: **CC0 1.0 Universal (Public Domain)** — commercial use, no attribution required.

37 of the ~280 sounds are shipped. Each one was mixed to mono, had its leading silence
trimmed and its tail faded, was peak-normalised to -1 dBFS, and was written as 16-bit
WAV (older iOS Safari cannot play the packs' Ogg Vorbis). Total size is 1.4 MB. The raw
zips sit in `incoming/` and are gitignored.

| Game file | Kenney source | | Game file | Kenney source |
|---|---|---|---|---|
| ui-click | select_002 | | loot-tamra | impactTin_medium_000 |
| ui-confirm | confirmation_001 | | loot-rajat | glass_001 |
| ui-error | error_001 | | loot-swarna | impactBell_heavy_003 |
| ui-open / ui-close | open_002 / close_002 | | loot-mystery | maximize_004 |
| ui-page | bookFlip3 | | coins | handleCoins |
| satchel | cloth2 | | wave-clear | confirmation_002 |
| equip | metalLatch | | gate-open | doorOpen_1 |
| hit-blade | knifeSlice2 | | boss-fall | impactBell_heavy_001 |
| hit-axe | chop | | descend | doorOpen_2 |
| hit-zap | glitch_002 | | toll | impactBell_heavy_000 |
| hit-blocked | impactGlass_light_001 | | tejas-ready | glass_004 |
| enemy-die-1 / -2 | impactSoft_medium_000 / _002 | | tejas-go | maximize_006 |
| hurt-1 / -2 | impactPunch_heavy_001 / _003 | | tejas-bell | impactBell_heavy_002 |
| kavach | impactMetal_medium_000 | | thud | impactWood_heavy_002 |
| bolt | drawKnife3 | | boom | impactSoft_heavy_001 |
| slam-warn | bong_001 | | slam-land | impactSoft_heavy_003 |
| shield-break | impactGlass_heavy_000 | | phase | impactPlate_heavy_001 |

`tools/convert-sfx.py` regenerates `sfx/` from fresh downloads. Change the `MAP` there to
swap any sound.

## Typefaces

| Face | Used for | By | Licence |
|---|---|---|---|
| **Yatra One** | titles, toasts, banners, large buttons | Catharsis Fonts — https://github.com/cathschmidt/yatra-one | SIL Open Font License 1.1 |
| **Baloo 2** | all other text | Ek Type — https://github.com/EkType/Baloo2 | SIL Open Font License 1.1 |

Both licences allow commercial use and embedding, and ask that the licence travel with
the fonts. Since 2026-10-10 the faces are served from `game/vendor/fonts/`: the six
`.woff2` files Google Fonts serves for them (Latin, extended Latin and Devanagari for
each), downloaded that day from `fonts.gstatic.com`, with `OFL-baloo2.txt` and
`OFL-yatraone.txt` from the google/fonts repository beside them.

## Engine

**Phaser 3.70.0**, copyright 2020 Richard Davey, Photon Storm Ltd., MIT licence
(`game/vendor/phaser-LICENSE.md`). `game/vendor/phaser-3.70.0.min.js` is the published
file, downloaded from cdnjs on 2026-10-10 and checked against the SHA-512 cdnjs publishes
for it. `.gitattributes` keeps everything under `game/vendor/` byte for byte.

## Music (`music/`)

Chosen and downloaded by the founder on 2026-10-02 from Pixabay
(https://pixabay.com/service/license-summary/: free for commercial use, no attribution
required, no standalone redistribution). None of the three is registered with YouTube
Content ID, checked the same day.

| Game file | Track | Artist | Source |
|---|---|---|---|
| `hub.mp3` | Sitar and Tanpura - Indian style BGM | ShidenBeatsMusic | https://pixabay.com/music/india-sitar-and-tanpura-indian-style-bgm-22000/ |
| `combat.mp3` | Indian | Rockot | https://pixabay.com/music/india-indian-559394/ |
| `boss.mp3` | INDIA - Drums of the World | Rockot | https://pixabay.com/music/upbeat-india-drums-of-the-world-173071/ |

The downloads sit in `incoming/music/` (gitignored). `tools/convert-music.py` made the
files here from them: silence trimmed, every track levelled to the same loudness, and
re-encoded at about 150 kbps (7 MB in all).

**Rejected:** *The Descent of Hanuman* (Openly). It is Content ID registered, which would put
a copyright claim on every video a streamer makes of the game, and it is tagged
devotional/bhakti, which `docs/requirements.md` §1.3 rules out.

## Kenney — background (`bg-stars.png`)

Source: https://kenney.nl/assets/space-shooter-remastered (`Backgrounds/darkPurple.png`)
License: **CC0 1.0 Universal (Public Domain)** — commercial use, no attribution required.

256×256 and tileable. Retained from the earlier sci-fi pass but repurposed: tinted hot
(`FORGE.ember`) at low alpha so it reads as drifting embers over the forge floor rather
than stars in space.

The rest of that pass — `player.png`, `enemy-melee/ranged/tank/splitter.png` — was
removed when the CraftPix roster landed. Those were sci-fi ships and grey meteors on
dark purple and satisfied none of the Cosmic Forge direction.

## Title picture (`title-art.jpg`)

Made by the founder on 2026-10-10 with ChatGPT's image generation, from their own
prompt: a stepwell seen from above, lit by lamps, with a glowing pool at the bottom and a
small figure on the top ledge. 940 x 1672. It is AI-generated, and the itch.io page says
so. OpenAI's terms give the person who made an image the rights to it, including to use
it commercially; that is to be read again on OpenAI's own page in the pre-launch pass.
