# Raw downloads go in this folder

Everything here is source material. It is **not committed** (see `.gitignore`); the
scripts in `tools/` turn it into the small files the game ships.

## Music (already here)

Three tracks from Pixabay, downloaded by hand on 2026-10-02 because the site refuses
automated downloads. They live in `incoming/music/`. `python tools/convert-music.py`
(needs `pip install soundfile numpy`) turns them into `game/assets/music/hub.mp3`,
`combat.mp3` and `boss.mp3`. To change a track, drop the new file in `incoming/music/`,
point `PICKS` at the top of that script at it, and run it again.

Before picking any track, check its Pixabay page: if it says **Content ID Registered**,
do not use it. Streamers who play the game would get a copyright claim on their videos.

## Sound effects — Kenney (already here)

`kenney_impact-sounds.zip`, `kenney_interface-sounds.zip` and `kenney_rpg-audio.zip`,
CC0. `tools/convert-sfx.py` regenerates `game/assets/sfx/` from them.

## Character art — CraftPix (already here)

Four **free** packs, downloaded while signed in to craftpix.net and dropped here
unextracted. `tools/extract-chars.py` regenerates `game/assets/chars/` from them.

| # | Pack | URL | Used for |
|---|---|---|---|
| 1 | Free Warrior 4-direction Character Sprites | craftpix.net/freebies/free-warrior-4-direction-character-sprites/ | **Kiran** (player) |
| 2 | Free Top-Down Goblin Character Sprite | craftpix.net/freebies/free-top-down-goblin-character-sprite/ | **Asura**, **Rakshasa**, **Raktabija** |
| 3 | Free Top-Down Boss Character 4-Direction Pack | craftpix.net/freebies/free-top-down-boss-character-4-direction-pack/ | **Mahish**, **Bakasura**, **Nidhi-Raksha** |
| 4 | Free Medieval Bandit 4-Direction Character Pack | craftpix.net/freebies/free-medieval-bandit-4-direction-character-pack/ | **Vritra** |

All four are **vector** and **4-direction animated**, from the same CraftPix house
style, so they read as one set rather than four borrowed packs. Do NOT add the pixel-art
packs (Swordsman, Knight, Warrior Pixel): mixing pixel and vector looks worse than either
on its own.

Licence, already verified: commercial use in unlimited projects, no attribution
required, modification allowed. Not allowed: reselling the source files, or shipping
them so end users can extract the artwork. The full mapping is in `../CREDITS.md`.
