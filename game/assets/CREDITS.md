# Art Asset Credits

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

## Kenney — background (`bg-stars.png`)

Source: https://kenney.nl/assets/space-shooter-remastered (`Backgrounds/darkPurple.png`)
License: **CC0 1.0 Universal (Public Domain)** — commercial use, no attribution required.

256×256 and tileable. Retained from the earlier sci-fi pass but repurposed: tinted hot
(`FORGE.ember`) at low alpha so it reads as drifting embers over the forge floor rather
than stars in space.

The rest of that pass — `player.png`, `enemy-melee/ranged/tank/splitter.png` — was
removed when the CraftPix roster landed. Those were sci-fi ships and grey meteors on
dark purple and satisfied none of the Cosmic Forge direction.
