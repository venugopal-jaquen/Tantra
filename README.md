# Loot Chase

A solo-buildable, AI-assisted arena roguelite. Depth comes from a learnable Cosmic Cycle, real item identity, and structured Sector escalation — not grind or FOMO.

## Folder structure
```
loot-chase-project/
├── docs/
│   ├── requirements.md       — high & low-level requirements
│   ├── design-document.md    — milestones, engine selection, gap analysis
│   └── launch-roadmap.md     — platform sequencing & cost plan
├── game/
│   └── loot-chase-v0.1.html  — current playable build (open directly in any browser)
└── concept/
    └── visual-style-sheet.html — "Cut Light" art direction reference
```

## Status
Core mechanics: ~90% designed (Sectors, Cosmic Cycle, bosses, item identity, HUD).
Remaining: visual reskin to Cut Light, capstone boss, project infrastructure (this repo is that step), platform packaging.

See `docs/design-document.md` for the full milestone table.

## Getting this into real version control

```bash
cd loot-chase-project
git init
git add .
git commit -m "Initial commit: core mechanics + docs, pre-visual-reskin"
```

Then create an empty repo on GitHub and:
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

## Running the game locally
Just open `game/loot-chase-v0.1.html` in a browser — no build step, no install. Phaser loads from CDN.

## Next steps
See `docs/design-document.md` §4 for the full gap analysis. Short version: this repo *is* the top-priority gap being closed. After that — visual reskin, then capstone boss, then packaging per the launch roadmap.
