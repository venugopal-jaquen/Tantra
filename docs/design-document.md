# Loot Chase — Design Document

*Companion to `docs/requirements.md`. This document defines milestones, engine strategy, and current project gaps.*

## 1. Milestones (testable)

| # | Milestone | Status | Acceptance test |
|---|---|---|---|
| M0 | Concept exploration (Dragon's Hoard prototype) | ✅ Done | Playable one-tap dodge loop existed and informed the genre pivot |
| M1 | Core loop MVP (arena, auto-attack, waves, loot) | ✅ Done | A full run (death or 5-wave clear) is playable start to finish |
| M2 | Enemy variety + Cosmic Cycle | ✅ Done | All 4 enemy types + all 4 phases appear and visibly change gameplay in a single run |
| M3 | Sector structure + boss encounters | ✅ Done | Player can Descend past Sector 3 and fight the Rift Warden |
| M4 | Item identity system | ✅ Done | At least one run demonstrates a weapon effect and a trinket effect changing how combat feels |
| M5 | Visual direction defined | ⚠️ **Redone** | ~~Cut Light~~ rejected 2026-09-24 as too dark/generic. Replaced by **Cosmic Forge** + Indian cultural identity — see `requirements.md` §1.7, §2.10, §2.12 |
| M6 | **Project infrastructure** (git, deployment, formal spec) | ✅ **Done 2026-09-11** | Repo at github.com/venugopal-jaquen/Tantra with full history; live at venugopal-jaquen.github.io/Tantra |
| M7 | Visual reskin (apply **Cosmic Forge** + Indian identity to the real game) | ⏳ In progress, **partly superseded** | Warm saffron-amber arena, gold player, dark-ore enemies with amber glow, Sanskrit naming live in-game. The Kenney CC0 sci-fi sprites shipped 2026-09-11 predate this direction and are placeholder only. |
| M8 | Narrative depth pass (optional expansion beyond banners) | 🔜 Planned | Only if desired — current light-banner narrative already meets M1-level requirements |
| M8.5 | First-run tutorial | 📌 **Pinned** | Teaches each system live during Wave 1. Deliberately held until mechanics are final — see `requirements.md` §2.12.1 |
| M9 | Capstone boss + perpetual post-capstone scaling | 🔜 Planned | A fixed deep milestone (e.g. Sector 6) ends the game with a real finale; Sectors continue infinitely after |
| M10 | Platform packaging (web → Android → Steam) | 🔜 Planned | Matches `docs/launch-roadmap.md` sequencing |
| M11 | Marketing & launch | 🔜 Planned | Store page live, wishlist campaign running pre-Steam |

**Immediate priority: M7.** M6 closed on 2026-09-11 — the code is in git with history and deployed. The open question now is visual: the game needs the Cosmic Forge palette, the Sanskrit naming layer, and real sprites that can carry an Indian identity. Sprite sourcing is the one genuinely unresolved dependency (`requirements.md` §2.13).

---

## 2. Engine Selection

### 2.1 Now: Phaser 3 (web)
Correct choice for the design/mechanics-proving phase already completed — zero install friction, instant in-chat testing, huge JS hiring pool if a freelancer is ever needed for cleanup. No reason to change engines mid-design; the switching cost would slow iteration for no current benefit.

### 2.2 Future: the real decision, once packaging becomes the focus (M10)

| Option | Fit for you | Real trade-off |
|---|---|---|
| **Summer Engine** (Godot-4-compatible, MCP-native) | Purpose-built for exactly this workflow: solo dev + AI agent. Via MCP, Claude can drive a *live running engine* — press play, read real runtime errors, fix its own bugs — instead of only editing files blindly. Free to start. Exports to Steam. | Very new (2026) — smaller ecosystem, less battle-tested than Unity/Godot alone. Pilot on a small scope before committing fully. |
| **Unity** | Largest dedicated game-dev hiring pool; the right call if this ever grows into a funded/team production. | C# is a steeper solo-vibe-coding curve; no native agent-run-and-debug loop the way Summer offers. |
| **Plain Godot** (no AI layer) | Middle ground — approachable GDScript, solid exports, growing hiring pool. | You lose the "agent can run and see the game" advantage Summer specifically adds. |

**Why this matters concretely, not theoretically:** both real bugs this project actually hit — the Phaser physics Group silently resetting velocity, and the Container hitbox rendering in the wrong place — were exactly the failure mode Summer Engine's MCP bridge is designed to close (an agent that can only read/edit code, but never press play and see what actually happens, will keep making this class of mistake).

**Recommendation:** stay in Phaser through the remaining mechanics/visual-reskin work. When M10 (packaging) begins, **pilot Summer Engine on a small scope** — it directly matches your stated goal of minimal-developer-intervention, AI-assisted solo development. Keep Unity as the fallback if Summer's rough edges (being a brand-new product) prove disruptive.

---

## 3. Initial Builds
**Done.** Delivered so far: `dragons-hoard-v0.1.html` (exploratory prototype, pre-pivot), `game/loot-chase-v0.1.html` (full current build — sectors, bosses, Cosmic Cycle, item identity, HUD), `docs/launch-roadmap.md` (cost/sequencing plan).

Superseded by the 2026-09-24 direction change, kept as history: `concept/visual-style-sheet.html` (Cut Light) and `concept/character-art-spec.html` (abstract cosmic roster — Seeker/Mote/Caster/Monolith/Fissure, now replaced by the Sanskrit naming in `requirements.md` §2.12).

**Current canonical visual reference:** `concept/loot-chase-visual-forge-v2.html` — the Cosmic Forge v2 style sheet from the 2026-09-24 claude.ai chat, imported into the repo 2026-09-24. Renders the saffron-amber background, the full Sanskrit-named roster, and the refinement-ladder loot palette.

The earlier `Loot chase visual forge` v1 (background `#170A00`) was rejected as still too dark and was not imported — v2 supersedes it.

---

## 4. Gap Analysis — vs. the reference guide

Reference: Peter Yang's Claude Code game-dev tutorial (5 steps: set up the project → find pixel art assets → draft the spec → build the MVP and iterate → ship with GitHub and Vercel).

| Step | Our status | Notes |
|---|---|---|
| 1. Set up the project | ✅ **Closed 2026-09-11** | Local project folder and git repo exist with full commit history |
| 2. Find pixel art assets | ⚠️ **Now a real gap** | The procedural-vector divergence (Cut Light) was reversed on 2026-09-24 — abstract shapes cannot carry an Indian cultural identity. Real sprites are now required and unsourced; see `requirements.md` §2.13 for the three costed options |
| 3. Draft the spec | ✅ Done, informally | Happened conversationally throughout development; this document and the Requirements doc formalize it retroactively |
| 4. Build the MVP and iterate | ✅ Done, extensively | The largest share of work so far |
| 5. Ship with GitHub and Vercel | ✅ **Closed 2026-09-11** | github.com/venugopal-jaquen/Tantra, deployed via GitHub Pages at venugopal-jaquen.github.io/Tantra. Backup, history and a shareable playtest link all exist |

**Resolved.** The former highest-priority action — get a real git repository and a free deployment — was completed on 2026-09-11. The remaining gap is step 2: real sprites, which the 2026-09-24 direction change turned from a deliberate divergence back into a genuine dependency (`requirements.md` §2.13).

---

## 5. On "setting this up in Claude Code"

Worth being precise about what's possible from here: this conversation runs in Claude.ai's chat interface, not Claude Code — I can't literally switch myself into that tool from inside this chat. What I *can* do right now is prepare a clean, ready-to-use project folder (this doc, the requirements doc, the game files, the style sheet) as downloadable files — the seed for a real repository.

Claude Code is a separate, free CLI/desktop tool that runs on your own machine, reads/edits files directly, and has a genuine permission system — by default it asks before file edits and most commands (exactly the "ask me for permission" behavior you're after), with configurable modes if you want faster iteration later. It also supports MCP servers directly, which is how it would connect to Summer Engine if you go that route in M10.

**Suggested next action:** install Claude Code, point it at a local folder seeded with the files from this project, and continue development there for M6 onward — git history, permission-gated actions, and (later) live-engine MCP access all come from that move.
