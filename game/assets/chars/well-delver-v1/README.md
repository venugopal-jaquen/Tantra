# Well Delver v1 — integration-ready candidate pack

This is a **candidate replacement pack**, not the current live cast. It contains the first
two characters in the approved Well Delver direction: the player hero and the common Asura.

## Contents

```
wellhero-front.png        96×96 still
wellhero-back.png         96×96 still
wellhero-left.png         96×96 still
wellhero-right.png        96×96 still
wellhero-walk.png         1008×448 (9 × 4 cells, 112×112 each)
wellasura-front.png       96×96 still
wellasura-back.png        96×96 still
wellasura-left.png        96×96 still
wellasura-right.png       96×96 still
wellasura-walk.png        1008×448 (9 × 4 cells, 112×112 each)
source/                   transparent three-view turnaround sources
```

Walk-sheet rows are `front`, `back`, `left`, then `right`. Each row has one idle cell plus
eight walk cells, matching `WALK = { frames: 8, cell: 112 }` in the current game.

## Use in the existing Phaser build

Do **not** change the public asset names or the sprite format. To put this candidate into the
main game, copy the five `wellhero-*` files over the existing `kiran-*` files and the five
`wellasura-*` files over the existing `asura-*` files in the parent `chars/` folder. The current
preloader already loads those names and the code already understands this still/walk layout.

The walk motion is intentionally a stable bob/weight shift derived from the approved poses. It
is fit for a near-term visual replacement, but it is **not** a substitute for a hand-authored
or model-rendered limb walk cycle. Keep the three-view sources so the cycle can be upgraded
without redesigning the characters.

To rebuild the derived files after editing a turnaround source:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File tools/build-well-delver-sheets.ps1 `
  -HeroTurnaround game/assets/chars/well-delver-v1/source/wellhero-turnaround.png `
  -AsuraTurnaround game/assets/chars/well-delver-v1/source/wellasura-turnaround.png
```

## Provenance

Generated from the approved Well Delver concept and processed by `tools/build-well-delver-sheets.ps1`
on 2026-10-10. Before a commercial release, retain the generation record and disclose generated
graphics wherever the eventual store requires it.
