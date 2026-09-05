# Loot Chase

A solo-buildable, AI-assisted arena roguelite. Depth comes from a learnable Cosmic Cycle, real item identity, and structured Sector escalation — not grind or FOMO.

## Folder structure
```
loot-chase-project/
├── index.html                  — site entry point; redirects to the current build
├── docs/
│   ├── requirements.md         — high & low-level requirements
│   ├── design-document.md      — milestones, engine selection, gap analysis
│   └── launch-roadmap.md       — platform sequencing & cost plan
├── game/
│   └── loot-chase-v0.1.html    — current playable build (open directly in any browser)
├── concept/
│   └── visual-style-sheet.html — "Cut Light" art direction reference
└── .claude/launch.json         — local preview server config (python http.server on :8123)
```

## Status
Core mechanics: ~90% designed (Sectors, Cosmic Cycle, bosses, item identity, HUD).
Remaining: visual reskin to Cut Light, capstone boss, platform packaging.

**M6 (project infrastructure) is now in progress** — this repo exists, with history. What still
closes M6: pushing to GitHub and turning on Pages (below).

See `docs/design-document.md` for the full milestone table.

## Running the game locally

Open `game/loot-chase-v0.1.html` directly in a browser — no build step, no install. Phaser loads
from CDN.

To serve it over HTTP instead (needed if you want `localStorage` to behave exactly as it will in
production):
```bash
python -m http.server 8123
```
Then visit <http://localhost:8123>.

## Deploying to GitHub Pages

Create an empty repo on GitHub (no README, no .gitignore — this repo already has both), then:

```bash
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

Then in the repo on GitHub: **Settings → Pages → Source: Deploy from a branch → `main` / `(root)` → Save.**

The game goes live at `https://<your-username>.github.io/<your-repo>/` within a minute or two.
`index.html` redirects the site root straight to the current build, so that URL is a direct play
link you can hand to playtesters.

**Shipping a new build:** add the new file under `game/`, bump the one `meta http-equiv="refresh"`
line in `index.html` to point at it, and push. Keeping old versioned files around means every past
build stays playable at its own URL.

## Known open items

- **Canvas does not scale.** The Phaser config sets a fixed 400×700 with no `scale` block, so the
  game renders at literal pixel size rather than fitting the viewport. Contradicts requirements
  §2.11 (mobile-first portrait). Small fix, not yet applied.
- **Meta-progression does not persist.** `session` is a plain in-memory object (see the top of the
  game file). Requirements §2.8 attributes this to the claude.ai artifact sandbox blocking
  `localStorage` — that constraint is gone once this is served from Pages, so the fix is now
  unblocked.
