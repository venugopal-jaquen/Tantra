# Asset Credits

Provenance for every shipped asset, kept auditable ahead of store submission.

## CraftPix — character roster (`chars/`)

Source: https://craftpix.net/freebies/
License: https://craftpix.net/file-licenses/

**Permitted:** use in any number of personal and commercial projects, modification,
selling and distributing the game containing them. **Attribution is not required** —
credited here voluntarily and for provenance.
**Not permitted:** reselling the source files or slightly modified versions, shipping
them so end users can extract the artwork, or using them to train AI/ML systems.

Four free packs, all **vector** and all 4-direction, chosen from one house style so the
roster reads as a single set rather than four borrowed packs:

| Pack | Characters used |
|---|---|
| Free Warrior 4-direction Character Sprites | Warrior (clothes_1) |
| Free Top-Down Goblin Character Sprite | Male Goblin, Chief Goblin, Female Goblin |
| Free Top-Down Boss Character 4-Direction Pack | Giant Goblin, Viking Leader, Caveman Boss |
| Free Medieval Bandit 4-Direction Character Pack | Assassin |

### Roster mapping

Sanskrit names per `docs/requirements.md` §2.12. The art is European fantasy and carries
no Indian visual signifier — **the naming and gameplay carry the identity, the art does
not.** This is a deliberate, documented trade to ship on itch.io, not an oversight;
§2.13 records the intent to commission custom art if the game finds an audience.

| In-game | Devanagari | Role | Source character |
|---|---|---|---|
| `kiran-*`       | किरण      | Player | Warrior |
| `asura-*`       | असुर      | Melee | Male Goblin |
| `rakshasa-*`    | राक्षस     | Ranged | Chief Goblin |
| `raktabija-*`   | रक्तबीज    | Splitter | Female Goblin |
| `mahish-*`      | महिष      | Tank | Giant Goblin |
| `bakasura-*`    | बकासुर     | Semi-boss | Viking Leader |
| `nidhiraksha-*` | निधि-रक्षा | Sector boss | Caveman Boss |
| `vritra-*`      | वृत्र       | Mega boss | Assassin |

**Renamed 2026-09-24** after a naming audit (see `docs/requirements.md` §2.12): Yaksha, Dwarapal
and Kalachakra are revered or benevolent in living traditions and should not be cast as
enemies; Bheda was an abstract noun where Raktabija - whose every drop of blood rose as a new
demon - *is* the splitter mechanic. Files were renamed to match (`git mv`), not copied.

Several are closer than "close enough": **Mahish** literally means buffalo (Mahishasura
is the buffalo demon), so a heavy horned brute fits; **Nidhi-Raksha** means treasure guardian;
**Bakasura** demanded tribute before anyone could pass, which is what a gatekeeper does; and
**Raktabija** multiplying from spilled blood is exactly what the splitter does.

### How these files were produced

Each source pack ships ~480×480 frames across full animation sets — roughly 870 MB of
raw downloads for four packs. Shipping that is out of the question for a mobile web
game, so per character the first `Idle` frame of each of the four facings was taken,
trimmed to its alpha bounding box, scaled to fit a 96×96 tile, and re-centred.

96px is deliberate: entities draw at roughly 24–46px, so this keeps retina headroom
without paying for detail nobody sees. Result: 32 sprites, ~432 KB total.

The raw zips live in `incoming/` and are **gitignored** — only the derived sprites
belong in version control. `tools/extract-chars.py` regenerates them from fresh downloads; see its
docstring for the three steps.

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

Both licences allow commercial use and embedding. The faces are loaded from Google Fonts
today (`fonts.googleapis.com`); for the itch.io build they should be self-hosted in
`game/assets/fonts/` with their `OFL.txt` files alongside.

## Music (`music/`) — not in the repo yet

Chosen by the founder on 2026-10-02 from Pixabay (https://pixabay.com/service/license-summary/:
free for commercial use, no attribution required, no standalone redistribution). Neither
track is registered with YouTube Content ID, checked the same day.

| Game file | Track | Artist | Source |
|---|---|---|---|
| `hub.mp3` | Sitar and Tanpura - Indian style BGM | ShidenBeatsMusic | https://pixabay.com/music/india-sitar-and-tanpura-indian-style-bgm-22000/ |
| `combat.mp3` | Indian | Rockot | https://pixabay.com/music/india-indian-559394/ |
| `boss.mp3` | *not chosen* | | |

Pixabay refuses automated downloads, so these are downloaded by hand into
`incoming/music/` (gitignored) and prepared by `tools/convert-music.py`, which trims
silence, levels the loudness and re-encodes. Record the download date here when they land.

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
