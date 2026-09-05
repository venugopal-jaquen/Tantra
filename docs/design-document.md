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
| M5 | Visual direction defined (Cut Light) | ✅ Done | Style sheet artifact renders palette, player, all enemy/boss tiers |
| M6 | **Project infrastructure** (git, deployment, formal spec) | ⚠️ **Not started** | Code lives in a real git repo with commit history; a live URL exists outside claude.ai |
| M7 | Visual reskin (apply Cut Light to the real game) | 🔜 Next | Actual gameplay renders faceted shapes, not circles |
| M8 | Narrative depth pass (optional expansion beyond banners) | 🔜 Planned | Only if desired — current light-banner narrative already meets M1-level requirements |
| M9 | Capstone boss + perpetual post-capstone scaling | 🔜 Planned | A fixed deep milestone (e.g. Sector 6) ends the game with a real finale; Sectors continue infinitely after |
| M10 | Platform packaging (web → Android → Steam) | 🔜 Planned | Matches `docs/launch-roadmap.md` sequencing |
| M11 | Marketing & launch | 🔜 Planned | Store page live, wishlist campaign running pre-Steam |

**Immediate priority: M6.** Every milestone after it benefits from being in real version control before more systems get layered on.

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
**Done.** Delivered so far: `dragons-hoard-v0.1.html` (exploratory prototype), `game/loot-chase-v0.1.html` (full current build — sectors, bosses, Cosmic Cycle, item identity, HUD), `concept/visual-style-sheet.html` (Cut Light direction), `docs/launch-roadmap.md` (cost/sequencing plan).

---

## 4. Gap Analysis — vs. the reference guide

Reference: Peter Yang's Claude Code game-dev tutorial (5 steps: set up the project → find pixel art assets → draft the spec → build the MVP and iterate → ship with GitHub and Vercel).

| Step | Our status | Notes |
|---|---|---|
| 1. Set up the project | ⚠️ **Gap** | No local project folder or git repo exists yet — everything lives as claude.ai artifacts only |
| 2. Find pixel art assets | ➡️ Deliberately diverged | Chose the procedural "Cut Light" faceted-vector direction instead of pixel art — a valid alternative, not a failure, but worth naming as a conscious choice |
| 3. Draft the spec | ✅ Done, informally | Happened conversationally throughout development; this document and the Requirements doc formalize it retroactively |
| 4. Build the MVP and iterate | ✅ Done, extensively | The largest share of work so far |
| 5. Ship with GitHub and Vercel | ⚠️ **Biggest gap** | No version control, no deployment. The game currently exists only as ephemeral chat artifacts — no backup, no shareable persistent link, no history if something goes wrong |

**The single highest-priority action from this whole document:** set up a real git repository and a free deployment (GitHub Pages, Vercel, or even itch.io early) *now*, independent of the later commercial-launch planning. This serves a different purpose than launch — it's backup, version history, and a real shareable link for playtesting beyond this chat.

---

## 5. On "setting this up in Claude Code"

Worth being precise about what's possible from here: this conversation runs in Claude.ai's chat interface, not Claude Code — I can't literally switch myself into that tool from inside this chat. What I *can* do right now is prepare a clean, ready-to-use project folder (this doc, the requirements doc, the game files, the style sheet) as downloadable files — the seed for a real repository.

Claude Code is a separate, free CLI/desktop tool that runs on your own machine, reads/edits files directly, and has a genuine permission system — by default it asks before file edits and most commands (exactly the "ask me for permission" behavior you're after), with configurable modes if you want faster iteration later. It also supports MCP servers directly, which is how it would connect to Summer Engine if you go that route in M10.

**Suggested next action:** install Claude Code, point it at a local folder seeded with the files from this project, and continue development there for M6 onward — git history, permission-gated actions, and (later) live-engine MCP access all come from that move.
