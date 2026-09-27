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
| M7 | Visual reskin (apply **Cosmic Forge** + Indian identity to the real game) | ⏳ **Mostly done** | Live: warm forge floor with jaali lattice + rangoli, CraftPix character roster under Sanskrit names, Indian item/rarity/currency names. Remaining: the title screen (pinned P1) and commissioned Indian art (pinned P4). |
| M8 | Narrative depth pass (optional expansion beyond banners) | 🔜 Planned | Only if desired — current light-banner narrative already meets M1-level requirements |
| M8.5 | First-run tutorial | ✅ **Built 2026-09-27** (live tips, §2.12.1) | Teaches each system live during Wave 1. Deliberately held until mechanics are final — see `requirements.md` §2.12.1 |
| M9 | Capstone boss + perpetual post-capstone scaling | 🔜 Planned | A fixed deep milestone (e.g. Sector 6) ends the game with a real finale; Sectors continue infinitely after |
| M10 | Platform packaging (web → Android → Steam) | 🔜 Planned | Matches `docs/launch-roadmap.md` sequencing |
| M11 | Marketing & launch | 🔜 Planned | Store page live, wishlist campaign running pre-Steam |

## 1.1 Pinned backlog

Features the founder has deliberately **parked** — agreed, but not to be built until called for. Whenever a request says "put a pin on" something, it is recorded here in the same change (standing instruction, 2026-09-24). Nothing here is built unprompted.

| # | Pinned | Date | What it is | Why it waits |
|---|---|---|---|---|
| P1 | **Title / front page redesign** — ▶ *due, see L2* | 2026-09-24 | A complete redesign of the pre-game screen, which currently reads as a plain menu. Covers the visuals shown *before* the game loads. | Founder wants the in-game visuals settled first, so the front page can be designed to match them rather than guessed ahead of them. |
| P2 | **Name your character + look-builder loading screen** | 2026-09-24 | The player names Kiran's successor and builds cosmetic looks for a loading/character screen (reference: Destiny 2's character screen). Cosmetic only — no stat effect. | Intended as a social hook: players styling and sharing their character. Needs its own interface and a cosmetics pipeline, which depends on art that does not exist yet (P4). |
| P3 | **First-run tutorial** (= M8.5) — ✅ *built, see L4* | 2026-09-24 | A live tutorial teaching each system during Wave 1. | Mechanics are still moving — teaching a system that changes means rewriting the tutorial each time. |
| P4 | **Commission custom Indian art** | 2026-09-24 | Replace the CraftPix European-fantasy roster with commissioned art that carries the Indian identity visually, not just by name. Est. ₹3,000–8,000 (`requirements.md` §2.13). | Only once the itch.io release shows the game has an audience. |
| P5 | **Full visual-story polish** | 2026-09-24 | A broader art and narrative pass across the whole game. | Explicitly tied to the game reaching "critical mass". |
| P6 | **Real-device performance check** — ▶ *due, see L8* | 2026-09-24 | Profile on an actual mid-range Android and an iPhone. `RES` caps the canvas at 3× (1200×2100 buffer), untested on budget hardware. | Should happen **before** the itch.io launch, not after — this one is a pre-launch gate, not a someday item. |

## 1.2 Launch track — itch.io POC (added 2026-09-27)

Founder call, 2026-09-27: gameplay is ~99% done for the POC. That meets the condition P1 and P3 were waiting on ("mechanics final"), so both move from pinned to **due**. What stands between the current build and an itch.io page, in order:

| # | Item | State today | Done when |
|---|---|---|---|
| L1 | **Game name** | Undecided. The game says "Loot Chase" (generic, pre-pivot); the repo says "Tantra" — which reads as sexual/new-age to a Western audience and is a religious practice term (the reason Kalachakra was cut). | A name is chosen. Blocks L2 and L9 — the title screen, store page and cover art all carry it. |
| L2 | **Title / welcome screen** (= P1) | The hub is a plain menu still in the pre-pivot purple (`#c77dff`, `0x7c3fff`); `index.html` is the old sci-fi redirect page. The hub has no in-game name. | A Cosmic Forge title screen with the name, art and a Start that leads into the hub; the hub restyled to match. |
| L3 | **How to play** | ✅ **Built 2026-09-27**: seven illustrated cards (`requirements.md` §2.12.2). | A help page reachable from the title and the hub. |
| L4 | **First-run tutorial** (= P3) | ✅ **Built 2026-09-27**: 14 one-time live tips, skippable (§2.12.1). | Wave 1 of a player's first run teaches movement, loot, the satchel and slams live. |
| L5 | **Audio** | ⏳ **SFX built 2026-09-27** (36 Kenney CC0 sounds). The music system is built; **waiting on the founder's track picks** (§2.16). | Free SFX (hits, slams, pickups, Tejas) plus an Indian-flavoured loop (tanpura/tabla), with a mute toggle. |
| L6 | **Pause + settings** | ✅ **Built 2026-09-27** (§2.17). | Pause mid-run (essential on mobile), mute, and a "reset save" with a confirmation step. |
| L7 | **Loading screen** | The canvas is blank while assets load. | A branded loader with a progress bar. |
| L8 | **Real-device check** (= P6) | Untested on a real phone. | Profiled on a mid-range Android and an iPhone; the frame rate holds with a full arena. |
| L9 | **itch.io page** | Nothing. | Zipped build, embed size set, mobile-friendly flag, fullscreen button, cover image (630×500), 3–5 screenshots, a short GIF, description, tags, credits. Released **free**: no money changes hands, so the GST/CA question waits. |
| L10 | **Feedback loop** | Nothing. | An in-game "Send feedback" link, and itch.io analytics watched for the first two weeks. |

**Not needed for the POC:** P2 (look-builder), P4 (commissioned art), P5 (visual-story polish), M8 (narrative), M9 (capstone boss). These wait on the itch.io response, as the "prove it, then invest" rule in `launch-roadmap.md` says.

**Immediate priority: the launch track (§1.2), starting with L1 (the name).** M7 is effectively closed for the POC; its remainder is L2 plus the post-launch P4.

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
