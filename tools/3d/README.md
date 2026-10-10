# 3D characters rendered to sprites (a test, 2026-10-10)

Roadmap L14. The founder is unhappy with the stock 2D cast and pointed to the look of a 3D
game. This folder is the route tried for that: take rigged, animated low-poly 3D models,
recolour them, add simple pieces, and render them from the game's camera into the same
sprite files the game already plays. Nothing here is used by the game yet.

What it needs, neither of which is in git:
- Blender 4.5 LTS, unpacked to `tools/_blender/b45/` (from blender.org; 900 MB).
- The models: KayKit Adventurers by Kay Lousberg, CC0
  (github.com/KayKit-Game-Assets/KayKit-Character-Pack-Adventures-1.0; 142 MB).

The steps, for one character (`B` is `tools/_blender/b45/blender.exe`, `K` the pack's folder):

    B -b --factory-startup --python tools/3d/uvcells.py -- K/Characters/gltf/Rogue.glb
        which colour swatches each body part uses, to plan the recolour
    python tools/3d/recolour.py K/Textures/rogue_texture.png hero.png "0,0=24,0.52,0.74; 1,0=25,0.25,0.22; 0,1=40,0.12,1.6; 1,1=22,0.9,1.25; 3,2=5,0.72,0.75"
    B -b --factory-startup --python tools/3d/render_char.py -- --glb K/Characters/gltf/Rogue.glb --out frames/hero
        --hide "Icosphere,Offhand,Crossbow,Throwable,Cape" --texture hero.png --pieces turban
        --anims "Idle:1,Running_A:8" --elev 30 --zoom 1.35
    python tools/3d/pack_sheet.py frames/hero game/assets/chars kiran --walk Running_A --fit 1.0

The enemy in the test was the Barbarian: texture
"0,0=218,0.5,0.82; 1,0=235,0.35,0.3; 0,1=2,0.82,1.0; 1,1=2,0.85,0.9; 2,1=42,0.8,0.95; 7,0=250,0.3,0.45; 3,2=260,0.3,0.5",
hidden "Icosphere,2H_Axe,Offhand,Mug,Shield,Hat,Cape", `--pieces horns`, walk `Walking_A`.

Blender must sit on a short path: unpacked deep inside a temp folder it fails to start,
because Windows will not load a file whose path is longer than 260 characters.

Each model carries 76 animations (attacks, hits, deaths, a spell cast), so more than walking
can be rendered the same way. The pictures of the test are in `concept/cast-2026-10-10-3d-test-*`.
