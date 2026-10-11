# Well Delver candidate integration handoff

The candidate pack is at `game/assets/chars/well-delver-v1/`. It is deliberately isolated so
the main game can remain stable while the art is reviewed.

## What is ready

- `wellhero-*`: four transparent 96×96 direction stills plus a Phaser-compatible walk sheet.
- `wellasura-*`: the equivalent standard-melee-enemy assets.
- `source/`: the transparent front/back/right turnaround sources used to derive the files.
- A separate, disposable validation page: `game/well-delver-playtest.html`.

## Exact integration request

1. Preserve the current file naming convention and the Phaser loader contract.
2. Back up the existing `kiran-*` and `asura-*` files before replacing anything.
3. Copy this pack's `wellhero-front/back/left/right/walk.png` to the existing `kiran-front/back/left/right/walk.png` names.
4. Copy this pack's `wellasura-front/back/left/right/walk.png` to the existing `asura-front/back/left/right/walk.png` names.
5. Do not change character collision radii, damage, movement, spawn logic, loot or balance as part of this art-only change.
6. Run `node tools/smoke-test.mjs` and manually verify the first sector at a 420×740 viewport. Check silhouette, health-bar placement, enemy labels, walk rows and contrast on all three carved floors.
7. Update `game/assets/CREDITS.md` with this pack's provenance and the store's generative-AI disclosure before release.

## Acceptance bar

The hero must remain identifiable by teal + cream + terracotta; the Asura by indigo +
terracotta + one horn. Both must read at their actual in-game sizes. If either gets lost under
the phase tint, loot or boss telegraphs, adjust art contrast/scale only—do not compensate by
changing gameplay rules.
