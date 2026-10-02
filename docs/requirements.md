# Loot Chase — Requirements Document

## 1. High-Level Requirements

### 1.1 Vision
A solo-buildable, AI-assisted arena roguelite where survival depth comes from reading systems (a learnable cosmic timer, boss tells, item identity) rather than raw reflexes or grind — built to be genuinely replayable through mastery, not FOMO.

### 1.2 Core Pillars
1. **Mastery over grind** — depth comes from learnable systems (Cosmic Cycle timing, boss weak points), not time-gating or daily-login mechanics.
2. **Real item identity** — loot has distinct mechanical personality (Dota-inspired), not just bigger numbers.
3. **Structured escalation** — Sectors → Boss → Extract/Descend choice, so "getting better" changes the *kind* of challenge, not just its size.
4. **Minimal-cost, solo-buildable** — AI-assisted ("vibe-coded") development, developer hiring scoped narrowly to post-launch bug-fixing or platform-specific packaging only.
5. **Indian cultural identity** — Sanskrit/Hindi naming and Hindu-mythological *flavour*, used the way Hades uses Greek myth: evocative and atmospheric, never doctrinal. This is now the project's primary differentiator — no other title in the arena-roguelite genre has it. **Reversed 2026-09-24**; see §1.7.

### 1.3 Non-Goals (explicit)
- No literal item-crafting/recipe-combination system (evaluated, deliberately deferred — adds complexity that could turn off players seeking a simpler game).
- No FOMO mechanics: no daily login timers, no power decay, no time-gated content.
- No manual-aim/twin-stick combat rebuild at this stage (auto-attack + positioning is the current skill expression layer; manual aim remains a possible future pillar change, not a current requirement).
- No **doctrinal or devotional** religious content. Mythological naming and visual flavour are explicitly in scope (§1.2.5); depictions of worship, religious instruction, or claims about real belief are not. The line is Hades-with-Greek-myth, not a religious text.

### 1.4 Target Platforms (sequenced, not simultaneous)
1. Web (itch.io) — first, validates retention risk-free.
2. Android — second, after web validates engagement.
3. Steam (PC) — third, highest packaging cost, most justified once a real audience exists.

### 1.5 Target Audience
Players who enjoy systems-depth genres (Dota-style itemization/knowledge depth, Destiny-style build-crafting and boss mechanics) but want sessions compatible with mobile/short-form play — bridging "deep" and "quick to pick up."

### 1.6 Success Criteria
- A player who clears a Sector wants to press "Descend" rather than stop.
- A boss fight is rememberable/describable to a friend (a real "trial and error" story), not a stat check.
- Launch is achievable with founder time + AI-assisted coding + minimal paid freelance hours (see `docs/launch-roadmap.md`).

### 1.7 Direction Changes (log)

Kept so a reversal is never mistaken for drift or an error.

| Date | Change | Reason |
|---|---|---|
| 2026-09-24 | **Secular/no-mythology → Indian cultural identity.** §1.2.5 and the §1.3 non-goal both reversed. | Founder decision: market this as an Indian game, with Sanskrit naming and non-explicit Hindu-mythological flavour. Judged the project's strongest differentiator. |
| 2026-09-24 | **"Cut Light" → "Cosmic Forge."** §2.10 rewritten. | "Cut Light" rejected as too dark and generic — dark background with purple/cyan accents reads as every other indie roguelite (Hades, Dead Cells). Warm amber/gold chosen instead. A first Cosmic Forge pass on `#170A00` was *also* rejected as still too dark; the background was brightened to saffron-amber. |
| 2026-09-24 | **Abstract shapes rejected outright.** | Polygons cannot carry an Indian-themed identity. Real sprites now required; sourcing unresolved (§2.12). |
| 2026-09-24 | **Roster naming audit.** Yaksha → Rakshasa, Dwarapal → Bakasura, Kalachakra → Vritra, Bheda → Raktabija. | Founder flagged that Yaksha is not evil. The audit found two more beings revered in living traditions (Dwarapala temple guardians; Kalachakra, a major Vajrayana Buddhist tantra and deity) — casting them as villains risks offending the very audience the Indian identity targets. See §2.12. |
| 2026-10-02 | **Working title: Anantarya.** | The founder's placeholder until the final name is chosen (launch track L1). One constant, `GAME_TITLE`, renames the game. To weigh before it becomes a store name: Sanskrit *ānantarya* means "immediate succession, without interval", but in Buddhist texts *ānantarya-karma* is the term for the five gravest acts. |
| 2026-10-02 | **Falling keeps half the run's Nidhi.** §2.5. | Death banked everything, exactly like Extract, so Descend carried no risk and the Extract/Descend choice was a fake one. The founder approved 50%. |
| 2026-10-02 | **Typography: Yatra One + Baloo 2.** §2.18. | The founder asked for type that feels Indian. The game had been rendering in the engine's default monospace. |
| 2026-10-02 | **Asura (2017) reviewed as a reference game.** | Outcome of a separate research session. *Adopted:* a glossary-card loading screen (§2.19). *Pinned for after itch.io:* the Bhagya chart and boss-kill perks (`design-document.md` P7, P8). *Unchanged:* the live-tip tutorial (Asura shipped a separate tutorial, players disliked it, and it was replaced with learn-as-you-play, which is what §2.12.1 already does) and the antagonists-only naming rule (stricter than Asura's, and it stays). The lesson worth keeping: Asura turned cultural ideas into mechanics instead of using them only as names. |
| 2026-10-02 | **The game gets a goal and an ending.** §2.23. | The founder's diagnosis after playing: nothing states what the player is trying to do, and nothing ends, so there is no compelling reason to stay. They chose "slay Vritra" as the end of a run plus a well that fills across runs. Seven worlds was discussed and left for later. |
| 2026-10-02 | **Sectors renamed for the stepwell; every name made switchable.** §2.12. | The founder found "The Fractured Approach" boring and vague, and chose names that say what each level is: Prangan, Jal-Kund, Nidhi-Kosh, Patal. In the same request they asked that all names be changeable in one step, because they are **re-evaluating whether so Indian a game helps or harms onboarding and retention**. That question is open; nothing about the identity has been reversed. |
| 2026-10-02 | **The stepwell becomes the game's place.** §2.10. | The founder still found the arena background generic after the jaali-and-rangoli floor. A lattice is a pattern, not a place. The game is now one descent down a stepwell: the title looks down the shaft, every arena is framed by its stairs, and each sector has its own painted floor. |

**Provenance:** the 2026-09-24 decisions were made in a claude.ai chat, and the 2026-10-02 Asura review in a separate Claude Code session, not in this repo. Recorded here so `docs/` stays the single source of truth — see `docs/design-document.md` §5 on why context living outside version control is a recurring problem.

---

## 2. Low-Level Requirements (by system)

### 2.1 Movement & Collision
- Dual input: drag/touch (tight lerp-follow) and WASD/arrow keys.
- Player is physically blocked by all enemy colliders — no walking through enemies.
- Player position is clamped to the arena bounds at all times.

### 2.2 Combat
- Auto-attack targets the nearest enemy/enemies (up to `weapon.shots` count) within `weapon.range`, on an `atkSpeed` cooldown.
- Damage is modified by: Cosmic Cycle phase multiplier, boss weak-phase multiplier (where applicable), and any equipped weapon effect (Executioner, Vampiric, Venom, Chain).
- **One damage door (2026-09-24).** All player-sourced damage — auto-attack, chain arcs, poison ticks, Thorns, Tejas — goes through `damageEnemy()`, so shields, weak phases and the Vritra 55% transition are enforced identically everywhere. Previously a single big hit could take Vritra from above 55% straight to dead, skipping its whole second phase; the transition now clamps.
- **Boss focus.** Every other volley, an in-range boss is guaranteed a shot even when adds are nearer — but only while it is vulnerable. Focusing an off-phase boss wasted half of a new player's damage on 12%-effective hits (§2.14). As a side effect the auto-attack visibly swings onto the boss when its weak phase opens, so the weak-phase rule teaches itself.
- **Hit feedback (2026-09-24).** Taking damage used to produce one 150 ms flicker — players lost half their HP without registering a hit. Every hit now reads on several channels at once, scaled by the share of max HP it took: the attacker lunges, a slash arc marks where the blow landed, the camera shakes, the arena flashes red, Kiran flashes red, and a damage number floats up.
- **Invulnerability window.** 280 ms after a melee or ranged hit (never after a slam — slams are telegraphed, so standing in one should always cost). Without it five Asura touching you landed five hits in the same instant: a one-frame death that reads as unfair rather than hard. The hit flicker lasts exactly as long as the window, so the player can see it.

### 2.3 Cosmic Cycle (core learnable system)
- Four phases in fixed sequence: Drift → Surge → Eclipse → (repeat), each with a defined duration, enemy/player damage multiplier, spawn-rate multiplier, and loot-rarity boost.
- A rare, time-based Convergence event interrupts the sequence periodically, spawning a guaranteed-drop elite, then resumes the prior phase exactly where it left off.
- Current phase and time-remaining must be visibly legible at a glance (countdown bar, not a static icon).

### 2.4 Enemy Types
- Melee, Ranged (kites + projectiles), Tank (slow/tanky), Splitter (splits into two on death) — each unlocked progressively by depth, permanently once unlocked.
- Stats scale off a cumulative `depth` counter `(sector-1)*5 + wave`, not the wave-within-sector number, so difficulty never resets on Descend.
- **Every enemy carries its Sanskrit type name above it** (2026-09-24): Asura, Rakshasa, Mahish, Raktabija, Bakasura, Nidhi-Raksha, Vritra. Elites render theirs in caps and gold. These are *type* names, not proper nouns — the point is that the player reads them constantly during play, so the Indian identity lands through the game rather than through a menu nobody opens. Devanagari is deliberately omitted at this size: at ~8px over a moving sprite it turns to mush, and the codex already carries it.

### 2.5 Progression Structure
- A **Sector** = 5 waves. Wave 3 spawns a **Gatekeeper** (semi-boss). Wave 6 (i.e., past wave 5) spawns a **Sector Boss**.
- On Sector Boss defeat: present **Extract** (bank gold, end run) or **Descend** (Sector+1, harder, same shape) as an explicit, non-blocking-to-return choice screen.
- **A run ends at Sector 3 (2026-10-02).** Vritra's death wins it (§2.23); the sectors beyond are an optional endless descent.
- **Falling keeps half (2026-10-02).** Extract banks all of the run's Nidhi. Dying, or abandoning from the pause menu, banks `DEATH_KEEP` = 50%, rounded down. The choice screen says so ("Fall, and half is lost"), and the run summary shows what was gathered and what was kept. Before this, death banked everything, which made Descend free.
- Every Sector boss encounter must leave the game state clean on either choice (no leftover UI — this was a real shipped bug, now fixed, and should stay covered by manual regression testing).

### 2.6 Bosses
- **Every boss attacks (2026-09-24).** Previously a shielded boss was completely inert, slams did a flat 22–28 that never scaled, and boss contact damage was 0 — standing next to a boss was safe indefinitely. Now every boss:
  - hits on contact, with a **30 px reach** past its own edge (collision holds Kiran at exactly body-contact distance, and a rooted boss never steps back into him, so a pure contact check almost never fired);
  - **summons two Asura** on a timer, capped at 4 alive per boss — pressure, and Tejas charge (§2.15);
  - cycles a **telegraphed slam kit**. Telegraphs paint on the floor under the characters: a faint zone shows where it will land and a bright fill grows toward the edge — when the fill reaches the edge, it lands. Impacts throw a shockwave, stone chips and camera shake.

  | Slam | Shape | Wind-up | % of max HP |
  |---|---|---|---|
  | Circle | ring around the boss | 950 ms | 14% |
  | Line | a 280 px cleave aimed where you stood when it began | 850 ms | 12% |
  | Scatter | 4–6 eruptions around you, one always on you | 1150 ms | 8% |

  Slam damage = `(14 + 1.6 × depth) × sector multiplier + max HP × pct`. The percentage part is what keeps slams dangerous against HP stacking; Sector 1 gets only 60% of it, so a first boss is a lesson rather than a wall.
  - **Bakasura** (gatekeeper): circle; adds line from Sector 2. **Nidhi-Raksha**: circle + line. **Vritra**: all three.
  - A **shielded boss is rooted** (the anchor puzzle is a stand-off) but always casts **scatter**, so it reaches you instead of idling.
- **Gatekeeper**: weak-phase puzzle — full damage only when the Cosmic Cycle matches its core color; telegraphed AoE slam.
- **Hoardbound** (Sector Boss): starts shielded; 3 "anchor" adds must be killed to break the shield before it becomes damageable.
- **Shield presentation (2026-09-24):** a breathing inner dome plus two counter-rotating rings, and a **second bar above the HP bar** showing anchors remaining. The two bars sit apart deliberately — while the shield bar has any fill, the HP bar underneath is unreachable, which says the rule faster than a toast does. Breaking the shield blows the rings outward rather than snapping them off, because that break is the payoff for the whole anchor puzzle.
- **Rift Warden** (Mega Boss, Sector 3): combines both mechanics sequentially — weak-phase timing first, then shield/anchor puzzle once below ~55% HP.
- **Every enemy** displays a live HP bar (2026-09-24 — previously bosses, tanks and elites only). Bars scale with the enemy so a swarm reads as chatter and a boss reads as a wall, and drain gold → ember → crimson so health is legible without a number.

### 2.7 Loot
- Two slots: Weapon, Trinket. Three rarity tiers (Common/Rare/Epic) scale effect *magnitude*.
- Five weapon effects (none/Venom/Vampiric/Chain/Executioner) and five trinket effects (Vitality/Aegis/Thorns/Swift/Regen), each gated by a minimum Sector before appearing in the drop pool.
- ~25% of drops are Unidentified ("???") — revealed only on pickup, with a small rarity-roll bonus as the incentive to risk it.
- Loot pickups never pause gameplay — walking over an item equips it instantly with a toast notification.
- **Each effect has its own icon** (2026-09-24), generated procedurally at boot rather than shipped as files, so they stay on-palette and cost nothing to download. The icon says *what* dropped; the rarity tint says *how good*. Unidentified drops deliberately show one blank sigil regardless of contents — that ambiguity is the incentive to risk the pickup.
- **Each weapon effect has its own attack visual** (2026-09-24): Venom drips beads, Vampiric draws a thick crimson pull, Chain arcs jagged, Executioner swings a widening gold wedge, and the plain weapon stays a clean thin bolt. Previously every weapon drew the same cyan line, so a Venom Blade and an Executioner felt identical to use.

### 2.7.1 Satchel (run inventory)
A collapsible panel on the right edge of the arena, opened by a tab that shows a live item count.

- A pickup no longer destroys what you were holding — **the outgoing item is stashed**, and tapping a stashed item swaps it back, returning the current one to the satchel. Nothing is ever lost to a swap.
- Capacity **8**; past that the oldest falls out. Losing something you stopped using long ago is a kinder failure than being unable to pick anything up.
- **Run-scoped.** Carrying loot between runs would undermine the Extract/Descend decision (§2.5).
- **Does not pause.** §2.7 says pickups never interrupt play, and a pause-to-swap would turn every drop into a menu trip. The panel is translucent, hugs the right edge, and sizes to its contents — swapping mid-fight is meant to cost you something.

### 2.7.2 Powers Codex
A **POWERS** screen on the hub lists every weapon and trinket effect with its icon, description and unlock Sector. Effects the player has not yet reached the depth for are shown dimmed as *"Locked — reaches you in Sector N"*, and the hub button carries a live count (*"3 still locked — descend to find them"*).

The purpose is retention, not reference: a concrete count of unseen powers is a far better reason to press Descend than any amount of copy about replayability. It also satisfies §1.2.1 (mastery over grind) by making the system legible rather than hiding it.

### 2.8 Meta-Progression (Hub)
- Persistent-per-session currency ("Hoard Gold") purchases Vitality (max HP) and Power (weapon damage) upgrades between runs.
- Best Sector Reached is tracked and displayed as a bragging-rights stat.
- **Resolved 2026-09-11.** Persistence previously reset on page reload because the build ran inside a Claude.ai artifact sandbox that disallowed `localStorage`. That constraint disappeared once the game was served from GitHub Pages. Hoard Gold, Vitality/Power levels and Best Sector now persist across reloads via `localStorage` (`loadSession`/`saveSession`, key `loot-chase-session-v1`), falling back silently to in-memory if storage is unavailable (private browsing).

### 2.9 HUD
- Wave/Sector/Gold readout, HP bar, Cosmic Cycle countdown bar (with near-end flash warning), Sector progress track with milestone icons (Gatekeeper wave, final wave).

### 2.10 Visual Style
**Current direction: "Cosmic Forge"** (adopted 2026-09-24, replaces "Cut Light" — see §1.7).

Governing idea: everything in this world is precious material at some stage of refinement. Enemies are raw unrefined ore; the player is the most refined thing on screen; loot is extracted essence; bosses are large deposits being cracked open.

| Element | Treatment |
|---|---|
| Background | Warm saffron-amber, **not** near-black. Sunrise gradient with hex forge-floor lines. Darkness was rejected twice for reading as generic. |
| Player | Brilliant gold/white — the most refined element on screen |
| Enemies | Near-black crystalline ore with hot amber/orange glowing edges; glow intensity encodes threat |
| Loot rarity | Tarnished bronze → bright gold → pure white-gold (ascending refinement). Unidentified "???" is a cold grey so it reads as alien to the ladder. |
| Phase colours | Drift = cool cyan (the only cool thing in a warm world, so it pops), Surge = forge-orange, Eclipse = deep crimson, Convergence = blinding white |
| Typography | Yatra One for display, Baloo 2 for text (§2.18). Both carry Devanagari and Latin in one design, so Devanagari sits beside the English as an identity marker in the same hand. (The style sheet's Syne / Inter / JetBrains Mono were replaced 2026-10-02.) |

Target feeling, stated by the founder: **"rich and rewarding — treasure, wealth, loot fantasy."**

- **The stepwell (2026-10-02).** The whole game is one descent down a *baori*, the stepped wells of Rajasthan and Gujarat (Chand Baori, Rani ki Vav). It replaces the jaali lattice and rangoli, which the founder found generic: they were a pattern, not a place.
  - **Frame.** Every arena is the landing of one level, ringed by two courses of saw-tooth stairs climbing away on all four sides: the pattern that makes Chand Baori recognisable from above.
  - **A painted floor per sector** (`FLOORS`), drawn once into a texture and crossfaded on Descend:

    | Sector | Level of the well | Floor |
    |---|---|---|
    | 1, The Fractured Approach | the sunlit courtyard | red sandstone paving, a carved lotus medallion with corner rosettes, a shaft of daylight |
    | 2, The Churning Depths | the flooded level | green well-water drawn as miniature painters draw it (rows of scalloped waves), a whirlpool spiral, lily pads and lotus, a warm stone rim |
    | 3, The Convergence Core | the vault at the bottom | dark stone inlaid with glowing gold in interlocking circles, heat cracks, a gold seal |
    | 4 and deeper | the endless descent | the same three, under a deepening wash |

  - Sector 2 is deliberately cool. The rule that cyan belongs to Shanti alone gave way to the founder's request that sectors look different; the stone rim keeps the warm world around it.
  - **Legibility.** Floors stay mid-dark and keep their detail at the edges and in one central medallion. Slam zones gained a dark under-layer so the red reads on any floor, and enemy names, loot labels, toasts and the sector banner gained a dark outline.
  - Hand-made or generated art can replace any of this file for file; `docs/art-prompts.md` has the prompts and sizes.
- **Phase tints are colour shifts, not dimmers.** Shanti laid a 35% dark-teal wash over the floor for its full 20 s, which was the main reason the arena still read grey. Tints are now 10–14%, except Grahan (38%): it *is* an eclipse, and the darkening doubles as a warning for the high-damage phase.
- **Canonical reference:** `concept/loot-chase-visual-forge-v2.html`. Measured palette: background `#3D1200`, gold `#FFD23C`, cream `#FFFBEF`, dark ore `#2A0800`, forge orange `#FF8C42` / `#FF6B1A`, bronze `#C8A96E`, and cyan `#4DD0FF` as the single cool accent (Shanti).
- **Superseded:** `concept/visual-style-sheet.html` ("Cut Light") and `concept/character-art-spec.html` (abstract cosmic roster) both predate this direction and are retained only as history.
- **Open:** abstract polygon shapes were rejected as unable to carry an Indian-themed identity. Real sprites are required; sourcing is unresolved (see §2.12).

### 2.11 Non-Functional
- Runs in-browser via Phaser 3 (CDN-loaded), no build step, portrait-oriented canvas (mobile-first).
- **High-DPI rendering (added 2026-09-24).** The game reasons in 400×700 world units, but the canvas backing store is `RES` times that, and the main camera zooms back in by the same factor — so no coordinate in the source had to change. `RES` is derived from `devicePixelRatio`, clamped to 2–3.

  Without it the canvas was literally 400×700 real pixels stretched across ~1179 device pixels on a modern iPhone: a ~3× upscale, which is exactly the softness that prompted this. Text carries a matching `resolution` so glyph textures are rasterised at device scale rather than world scale, and pointer input reads `worldX`/`worldY` rather than `x`/`y`, which are canvas-space and would be `RES` times too large.
- Target frame budget: smooth on mid-range mobile browsers (no confirmed performance testing yet — flagged as an open item, not a verified requirement). The `RES` clamp of 3 exists for this reason: beyond it the backing-store cost stops buying visible sharpness.

### 2.12 Naming & Cultural Layer

Adopted 2026-09-24 (§1.7). Sanskrit/Hindi naming replaces the previous abstract-cosmic roster. Devanagari is shown alongside the Latin name in the UI as an identity marker, not as a translation the player must read.

| System concept | Name | Devanagari | Meaning |
|---|---|---|---|
| Player | **Kiran** | किरण | Ray of light |
| Melee enemy | **Asura** | असुर | Power-seeking antagonists of the devas |
| Ranged enemy | **Rakshasa** | राक्षस | Shape-shifting demons famed for sorcery (*maya*) — a caster |
| Tank enemy | **Mahish** | महिष | The buffalo demon |
| Splitter enemy | **Raktabija** | रक्तबीज | Every drop of his blood rose as a new demon — literally the split mechanic |
| Gatekeeper (semi-boss) | **Bakasura** | बकासुर | Demanded tribute before anyone could pass |
| Sector boss | **Nidhi-Raksha** | निधि-रक्षा | Treasure guardian (a descriptive compound, not a figure) |
| Mega boss | **Vritra** | वृत्र | The Vedic serpent who hoarded the world's waters — a hoarder, for a loot game |
| Hoard Gold (currency) | **Nidhi** | निधि | Treasure, wealth |
| Hub | **Kshetra** | क्षेत्र | Realm, field of action |

**Cosmic Cycle phases** — the four-phase sequence keeps its mechanics; only the names change:

| Old | New | Devanagari | Meaning |
|---|---|---|---|
| Drift | **Shanti** | शांति | Peace |
| Surge | **Shakti** | शक्ति | Power |
| Eclipse | **Grahan** | ग्रहण | Eclipse |
| Convergence | **Pralaya** | प्रलय | Dissolution |

**Sectors (2026-10-02)** are the levels of the stepwell, each a short Sanskrit name with a plain line under it:

| Sector | Name | Devanagari | Line under it |
|---|---|---|---|
| 1 | **Prangan** | प्रांगण | the sunlit court |
| 2 | **Jal-Kund** | जल-कुंड | the flooded steps |
| 3 | **Nidhi-Kosh** | निधि-कोष | the gold vault |
| 4 and deeper | **Patal** | पाताल | the world below |

They replace The Fractured Approach, The Churning Depths, The Convergence Core and The Endless Descent, which described nothing.

**Name packs (2026-10-02).** Every in-world word a player reads (hero, enemies, phases, metals, items, Tejas forms, sectors, the pause title, the loading-screen cards) lives in one table, `NAME_PACKS`, in `game/loot-chase-v0.1.html`. No other code spells a name out; it asks the pack.

- **To rename the whole game:** change `NAME_PACK` (one line), or edit a pack.
- **To compare without editing:** add `?names=plain` to the address.
- A pack also holds the word for a sector (`stage`, currently "Level" in all three), so "Level 2 of 3" can change with the rest.
- `hybrid` (2026-10-02) is a second **draft**, made after the founder said the names felt overtly Sanskrit and hard to pronounce. It keeps Sanskrit only where it is short and easy to say (Kiran, Asura, Rakshasa, Mahish, Vritra, Nidhi, Tejas, the four phases, Katar, Patal) and uses English for the rest (Bloodseed, Gatekeeper, Hoard Guardian, Copper/Silver/Gold, Storm Chakram, The Drowned Steps). Preview with `?names=hybrid`. The founder has not chosen between the three.
- `sanskrit` is the game as designed. `plain` is a **draft** in plain English (Goblin, Hexer, Brute; Calm, Surge, Eclipse; Copper, Silver, Gold; The Courtyard, The Drowned Steps, The Gold Vault), kept so the Sanskrit's cost to new players can be judged by trying both. Its wording has not been reviewed.
- Internal keys never change, so saves survive a switch.
- The smoke test loads the plain pack, reads about 200 on-screen texts across every screen, and fails if any Sanskrit word or Devanagari character appears.

**Constraint:** naming is flavour, not doctrine (§1.3). Names are chosen for meaning and atmosphere; the game makes no claim about belief and depicts no worship.

**Enemy-naming rule (from the 2026-09-24 audit).** An enemy name must be an *antagonist* in its source tradition — never a being that is revered, protective or worshipped today. The audit replaced three:

| Was | Problem | Now |
|---|---|---|
| Yaksha | Ambivalent nature spirits and treasure-keepers; Kubera, god of wealth, is their king | Rakshasa |
| Dwarapal | The guardian figures carved at temple doorways — protectors, and sacred architecture | Bakasura |
| Kalachakra | A major Vajrayana Buddhist tantra and meditational deity; the Dalai Lama confers Kalachakra initiations | Vritra |

Bheda → Raktabija was an improvement rather than a fix: *bheda* is an abstract noun, while Raktabija *is* the splitter.

**Items, rarity and currency (2026-09-24).** No Western names remain in player-facing text.

| Rarity | Metal |
|---|---|
| Tamra | copper |
| Rajat | silver |
| Swarna | gold |

Rarity is a metal-refinement ladder because the Cosmic Forge metaphor *is* refinement. Unidentified drops turned violet (they were grey, which no longer stood apart once silver joined the ladder).

| Weapon | Meaning | | Trinket | Meaning |
|---|---|---|---|---|
| Katar | push-dagger (starter) | | Prana Mani | life-force jewel |
| Visha Katar | poison dagger | | Kavach | armour |
| Rakta Talwar | blood sword | | Kantak Kangan | thorn bangle |
| Vidyut Chakram | lightning discus | | Vega Paduka | swift sandals |
| Vadha Parashu | slaying axe | | Sanjeevani | healing herb |

Currency is **Nidhi** (treasure). Items read as `<metal> <item>`, e.g. *Swarna Vidyut Chakram*.

**Partly implemented (2026-09-24).** The roster and the phase labels are live in
`game/loot-chase-v0.1.html`: each entity now loads a named character (`CHARS`), and the
Cosmic Cycle displays SHANTI / SHAKTI / GRAHAN / PRALAYA.

Object keys were **deliberately left in English** (`PHASE_DEFS.drift`, enemy type
`melee`, …). They are internal identifiers the player never sees, and `loot-chase-session-v1`
save data is keyed off them — renaming would break existing saves for no visible gain.

Currency is now Nidhi. The hub is still unnamed in-game — left for the title-screen redesign (roadmap P1).

### 2.12.1 First-run Tutorial — live tips (built 2026-09-27)
Pinned 2026-09-24 until the mechanics were final; unpinned 2026-09-27 when the founder called gameplay ~99% done. The founder chose **live prompts, skippable** over a forced practice wave.

Modelled on Hades and Archero, not Brotato: Brotato's "figure it out" onboarding is a known reason new players bounce off it. Each tip appears **once, ever**, at the moment its system first shows up, in a small panel at the bottom-right of the arena. That spot keeps it clear of bosses, which enter at the top, and of the Tejas button at the bottom-left. Play never stops. Tapping a tip dismisses it.

| Tip | Fires when |
|---|---|
| move | 0.9s into the first run (touch and keyboard wording differ) |
| loot / mystery | first identified / unidentified drop appears |
| satchel | first item goes into the satchel |
| ranged | first Rakshasa spawns |
| core | first Bakasura spawns (the weak-phase rule) |
| slam | first slam telegraph (**urgent**: it replaces whatever tip is showing) |
| shield | first shielded boss |
| shakti / grahan / pralaya | first time each phase begins |
| tejas | first time the Tejas meter is full |
| lowhp | first time HP drops below 30% |

- A tip counts as seen only once it is **displayed**. One that waits more than 10s in the queue is dropped unseen, and it returns the next time its moment comes. (The first version marked tips seen on arrival, and eight arrived in the first 25 seconds.)
- Seen tips live in `session.hintsSeen`, so "Reset save" re-arms them. Settings has a **Tutorial tips** on/off switch and a **show tips again** button.

### 2.12.2 How to Play (built 2026-09-27)
Seven illustrated cards, reachable from the hub and the pause menu: Move · Fight, Loot · Satchel, The Cosmic Cycle, Bosses, Slams, Tejas, and Extract or Descend. The illustrations reuse the real sprites, icons and telegraph shapes, so what the card shows is exactly what the player will see. Players swipe, or use the arrows. The copy switches between touch and keyboard wording.

### 2.13 Sprite Sourcing (open)

Abstract shapes are ruled out (§1.7). Three paths were identified, none yet chosen:

| Option | Cost | Note |
|---|---|---|
| AI image generation | ₹0–850/mo | Midjourney trial or Adobe Firefly free tier. Fastest path to "looks real". |
| Free asset packs | ₹0 | itch.io / Kenney / CraftPix. None are Indian-themed, which is now the whole point — so these can only ever be placeholder. |
| Commission a 2D artist | ₹3,000–8,000 | Fiverr or local Pune/Jalna. 4–6 core sprites. Genuinely unique, but worth doing *after* itch.io validates the game. |

**Resolved 2026-09-24 — option 2 (free packs), consciously.** The Kenney sci-fi sprites
were removed and replaced with a CraftPix roster: four free **vector**, 4-direction packs
from one house style, covering all eight entities. See `game/assets/CREDITS.md` for the
full mapping and licence.

Market check that informed this: itch.io's entire `indian` tag returns **11 assets**, free
and paid combined, several of which are Native-American tag collisions. **Zero** are a
top-down enemy roster. Paying does not solve this — the market does not exist.

So the trade taken is explicit: **the names and gameplay carry the Indian identity; the
art does not.** The art is European fantasy — goblins, a viking, a caveman, an assassin.
This is accepted in order to ship on itch.io and learn the release pipeline. Option 3
(commission, ₹3,000–8,000) remains the intended path *if the game finds an audience*, at
which point this roster is replaced rather than extended.

### 2.14 Difficulty Scaling (2026-09-24)
The founder reported that by Sector 3 a well-upgraded player lost under 5% HP while tanking hits. Causes: enemy damage grew linearly (`8 + 1.4 × depth`), bosses did flat damage, and meta upgrades cost only `50 × (level + 1)`, so HP outgrew the game.

- **Sector multipliers** on enemy damage (`1.22^(sector-1)`) and HP (`1.26^(sector-1)`). Sector 1 is untouched.
- **More enemies deeper:** `3 + wave + (sector − 1)` per wave. HP scaling alone made Sector 5 feel like Sector 1 with bigger numbers.
- **Exponential upgrade cost:** `50 × 1.45^level` (Vitality), `60 × 1.45^level` (Power). Levels plateau around 8–12 instead of outpacing every sector.
- **Boss slams scale with the player's max HP** (§2.6) — the direct counter to HP stacking.
- **Sector-clear heal:** beating a sector boss restores 35% of max HP. HP otherwise carries over, and players were arriving at Sector 2 on 19–45% HP. Nobody presses Descend on 20% HP, and that decision is §1.6's success test.
- **Rakshasa arrive a wave later in Sector 1**, at half weight until depth 5. Their bolts were the #1 killer of new players (up to 98% of max HP in a single sector). Sector 2 onward is unchanged.

**Measured with `tools/playtest-bot.js`** — a headless bot that plays whole runs (kites, sidesteps bolts and slam telegraphs, grabs loot, fires Tejas, always Descends). Calibrated first against the pre-change build: there the bot's fully upgraded profile lost ~59% HP in Sector 3 where the founder reported under 5%, so **the bot is a much weaker player than the founder** and its numbers are read *relative to the old build*, not as absolutes.

| Profile | S1 HP lost | S2 | S3 | Avg sector reached |
|---|---|---|---|---|
| Fresh (0/0 upgrades) | 39% | 186% | — | 1.9 |
| Grinder (14/14) | 14% | 67% | 219% | 3.0 (old build: 5–6) |

HP lost can exceed 100% because heals are spent along the way. Across 30+ bot runs: zero runtime errors, zero leaked objects. Final feel still needs human playtesting — the bot measures *direction*, not fun.

### 2.15 Tejas — supercharge (2026-09-24)
**Tejas** (तेजस्, radiance) is a meter that fills slowly on its own (1.1%/s) and faster per kill — Asura +3.5, Rakshasa +4.5, Mahish +7, Raktabija +2.5, elites +10. When it is full, tapping the TEJAS button (bottom-left) or pressing Space/E unleashes a 6-second form. Farming boss-summoned Asura to charge it before committing to a boss is a deliberate strategy.

- **Unlocks the first time the player reaches Sector 2**, and stays unlocked (`session.tejasUnlocked`) — so it is also a reward for choosing Descend over Extract.
- **The form follows the equipped weapon**, so every weapon has its own super:

| Weapon | Tejas form | Effect |
|---|---|---|
| Katar | Agni (fire) | fire novas burst out around you |
| Visha Katar | Visha (poison) | a poison cloud clings to you |
| Rakta Talwar | Rakta (blood) | drain everything near you to heal |
| Vidyut Chakram | Vidyut (lightning) | continuous chain lightning |
| Vadha Parashu | Prahar (the blow) | ground slams that execute the weak |

- Kiran glows gold for the duration and the meter drains as it runs. The codex has a Tejas tab.
- Taps on the Tejas button (or the satchel tab) no longer also walk Kiran to that spot.

### 2.16 Audio (built 2026-09-27)
**Sound effects:** 37 sounds from three Kenney CC0 packs (Impact, Interface and RPG Audio). These are recorded sounds, which the founder chose over generated ones. They ship as mono 16-bit WAV (1.4 MB) because older iOS Safari cannot decode the packs' Ogg Vorbis. Every file has its leading silence trimmed; `knifeSlice` had 235 ms of dead air, which would have read as input lag. Every file is also peak-normalised, so the `SFX` table's per-sound `vol` is the only loudness control.

The sounds were picked by measurement (length, brightness, ring-out) because **Claude cannot hear audio; the founder's ear is the final judge.** Anything can be swapped by editing the `MAP` in the conversion script and re-running it. Design rules:
- **Loot quality is audible.** Tamra is a tin clink, Rajat a glass chime, Swarna a bell. An unidentified drop plays a rising swell before its reveal. This follows Vampire Survivors, where pickup sounds are the addiction loop.
- **Every slam shape has its own warning rhythm** (`SLAM_WARN`), so the ear knows which slam is coming before the eye has found the red zone, as in Hades: one low gong for the ring, two quick high strikes for the line, three rising taps for the scatter. The first version changed only the gong's pitch per shape; a rhythm is much harder to miss.
- **Phase changes have their own sound** (a struck metal plate). They used to share the slam gong at a lower pitch, which blurred the one sound that must never be ambiguous.
- **Repeated sounds are kept in check.** Each gets ±4% pitch drift, and noisy sounds have a minimum gap (`gap`), so a 3-target volley or a dying swarm reads as one hit.
- **Getting hit scales with damage.** The hurt sound's volume scales with the share of max HP lost, and slams play it lower.

**Music is switched off (2026-10-02).** The founder listened to the build and the music did not suit the game, the transitions least of all. `MUSIC_ON = false` stops it loading or playing and hides its Settings row; the engine, the three files and everything described below stay in place for a second attempt. What that attempt should be is undecided.

**Music as built:** one track per mood (`hub`, `combat`, `boss`), crossfaded over 0.9 s.

| Mood | Track | Status |
|---|---|---|
| Hub | *Sitar and Tanpura - Indian style BGM*, ShidenBeatsMusic (0:51) | In the game since 2026-10-02. Not Content ID registered. |
| Combat | *Indian*, Rockot (2:54) | In the game since 2026-10-02. Not Content ID registered. |
| Boss | *INDIA - Drums of the World*, Rockot (2:59) | In the game since 2026-10-02. Not Content ID registered. It replaced the founder's first pick, *The Descent of Hanuman* (Openly), which is Content ID registered and tagged devotional/bhakti. |

The three files total 7 MB and stream one at a time. If the boss file is ever missing, boss fights keep the combat track and push it (5% faster, 15% louder) instead of falling silent.

Rules for every pick: **no vocals or mantras** (§1.3, and the rule that cut Kalachakra), and **no Content ID registration**. A Content ID track puts a copyright claim on every video a streamer makes of the game, which works against the game being shared. Pixabay marks these on each track's page ("Content ID Registered"); of 48 Indian-flavoured candidates checked on 2026-10-02, 29 were registered. Pixabay's licence allows use in games with no attribution and forbids only standalone redistribution. Its download links refuse automated requests, so the founder downloads tracks by hand into `game/assets/incoming/music/`, and they are prepared by `tools/convert-music.py` (trim silence, level every track to the same loudness, re-encode at about 120 kbps).

**Streamed, not decoded.** Each track plays from an `<audio>` element routed into the Web Audio graph. Decoding three tracks into memory would cost roughly 150 MB on a phone and would hold the loading screen until all had downloaded. Routing through Web Audio is also what makes the volume setting work on iOS, which ignores an element's own volume. Every track is touched inside the Begin tap, because iOS only lets code start an `<audio>` element that has first been played from a real tap.

**The Cosmic Cycle colours whatever is playing** (`MUSIC_PHASE`). The agreed ideal is the Hades approach: a drone in Shanti, tabla entering for Shakti, eerie in Grahan, full percussion in Pralaya. That needs stems written to fit together, and licensed tracks do not come that way, so each phase reshapes the one track instead:

| Phase | Volume | Lowpass | Speed / pitch | Reads as |
|---|---|---|---|---|
| Shanti | 80% | 3.2 kHz | 100% | softer, calmer |
| Shakti | 100% | open | 100% | full and open |
| Grahan | 90% | 800 Hz | 97% | muffled and sunk |
| Pralaya | 125% | open | 103% | louder, driven |

Pitch glides rather than steps. Pausing ducks the music to 35%. Because these tracks were not written to loop, the volume dips for 1.5 s either side of the loop point, so the restart is a breath rather than a cut. **All of these values were set without hearing them** and should be tuned by ear. True layered music (stems) belongs with the commissioned-art pass (`design-document.md` P4).

The values were set without hearing them, because Claude cannot hear. Verified 2026-10-02 with stand-in tracks and an analyser node: crossfade, per-phase volume, filter and rate, the boss fallback, pause ducking, pause-on-hidden and the loop-seam fade all behave as specified.

### 2.17 Pause & Settings (built 2026-09-27)
**Pause (VIRAM, विराम):** a button at the top-right of the HUD whose touch target (56×36) is larger than the drawn button. Esc or P also toggles pause. **Switching apps or tabs pauses the run automatically.** Pausing freezes game logic, timers and tweens. The menu shows the build you are carrying (weapon, trinket and Tejas form, each with what it does), your sector and wave, and the Nidhi from this run, followed by Resume, How to Play, Settings and **Abandon Run**. Abandon opens a confirmation that states the cost before anything happens: it **counts as a death**, and you keep only half of the run's Nidhi, with the exact numbers shown ("62 of 125"). *Keep Fighting* is the primary button.

**Settings** (stored apart from the save, key `loot-chase-settings-v1`, so "Reset save" keeps your volume):

| Setting | Default | Notes |
|---|---|---|
| Music / Sound effects | 7 / 8 of 10 | Eleven tap-cells (off, 1–10). Easier to hit on a phone than a slider |
| Screen shake | on | |
| Reduce flashing | off | Caps the red hit flash at 12% and drops the Tejas screen flash (accessibility) |
| Damage numbers | on | The floating −N / +N over Kiran |
| Vibration | on | Android only. Hidden where `navigator.vibrate` doesn't exist (iOS Safari) |
| Tutorial tips | on | Plus a "show tips again" button |
| Reset save | — | Hub only, two taps. Erases Nidhi, upgrades and unlocks |

### 2.18 Typography (2026-10-02)
The game had been rendering every word in the engine's default monospace. The founder asked for type that feels Indian.

| Role | Typeface | Why |
|---|---|---|
| Display: titles, toasts, banners, large buttons | **Yatra One** (Catharsis Fonts, OFL 1.1) | Drawn from the hand-painted signage of Mumbai's local trains. Its Latin letters take a Devanagari brush angle, so English headings carry the flavour without resorting to fake-Devanagari lettering. Includes Marathi alternates. |
| Text: everything else | **Baloo 2** (Ek Type, OFL 1.1) | A rounded face designed in Mumbai across nine Indian scripts. Sturdy at the 8-12 px sizes the HUD uses, and friendly enough to sit with the cartoon character art. |

- **One door.** Every `this.add.text()` passes through `styleText()`: bold text of 14 px and up is a heading and gets the display face, everything else gets the text face. A style can override with `display: true/false`. No call site names a font.
- Yatra One has a single weight, so the helper strips `bold` from display text; a canvas asked for a bold it does not have smears one.
- Text containing Devanagari is measured with a Devanagari test string. The engine sizes a text box from Latin letters, which clips the marks above and below Devanagari letters.
- **Loading.** Canvas text cannot swap fonts after it is drawn, so the game does not start until the faces have arrived, with a 3.5 s cap so a blocked font host never stops the game (it falls back to system fonts). The faces currently come from Google Fonts; **self-host them for the itch.io build** (launch track L9).
- The pre-pivot purple was swept out in the same pass: hub, HUD bars, progress track, sector banner, choice and summary panels now use the forge palette, with one saffron primary button per screen.

### 2.19 Loading screen: glossary cards (2026-10-02)
Launch track L7. Each load shows **one glossary card**: the word large in Devanagari, its Latin name, its meaning, and what it does in play. There are 28 cards (the roster, the four phases, the three metals, every weapon and trinket, Tejas, Nidhi, Viram), taken from the naming table in §2.12. The card changes every 7 s, a tap brings the next one, and each visit starts on the card after the last one seen, so a returning player meets the whole glossary over time. The Sanskrit is learnt a word at a time instead of from a manual.

- **The progress bar fills copper, then silver, then gold**, the rarity ladder, with a label that reads *Forging · Tamra / Rajat / Swarna*.
- **Plain DOM, not canvas**, so it is on screen before the engine itself has downloaded. Every size is in `em` off one value that follows the smaller of the viewport's height and width, so it fits a phone held sideways.
- **It ends on a Begin button for a technical reason:** browsers refuse to play sound until the player has tapped something, and this tap is what unlocks audio. It also lets a player finish reading the card.
- If the engine cannot be downloaded, the bar is replaced by a plain message instead of hanging.
- The loader's design came from the Asura review (§1.7); Asura's own loading screens could not be seen, so this is original.

### 2.21 Title screen (2026-10-02)
Launch track L2, first design. **One screen, not two:** the title, the way into a run and the two upgrades share it, because a title in front of a separate hub would put three taps between a player and a fight. It replaces the plain menu that was drawn over the arena.

- **Backdrop:** the view straight down the stepwell shaft. Seventeen square tiers of stairs shrink toward a glowing floor, each turned slightly more than the last, and the whole shaft sinks forever (a tier every 5.2 s) with embers rising.
- **DESCEND** is a round button on the glow at the bottom of the well: the player presses the light they are falling toward.
- Below it: deepest descent, Nidhi, the Vitality and Power cards (gold-edged when affordable), the locked-powers count, then Powers, How to Play, Settings and Feedback.
- It is built in code, with no image files. The founder will judge it and may replace the backdrop with art made from `docs/art-prompts.md`.

### 2.22 Feedback (2026-10-02)
Launch track L10, the basic version the founder asked for: a text box whose contents are emailed to them.

- **Where:** a Feedback button on the title screen and a "Send feedback" button on every run summary, since the end of a run is when a player has something to say.
- **What is sent:** the message, an optional reply address, the build, the player's best sector, the screen size and the browser's device string. The dialog says so.
- **How:** a static page cannot send mail, so the message is posted to FormSubmit (`formsubmit.co`), a free relay that needs no account. **The first message ever sent triggers an activation email to the founder; nothing is delivered until the link in it is clicked once.** FormSubmit then issues a private alias, which should replace the address in the page source (the address is visible there until it does).
- If the relay fails, the dialog offers "Email it instead", which opens the player's own mail app with the message filled in.
- The dialog is plain DOM, because a canvas has no text box. While it is open the game's keyboard handling is switched off; otherwise W, A, S, D, E, P and Space, which the game claims, could not be typed.
- To grow later: a proper backend, categories, screenshots.

### 2.23 The goal and the ending (2026-10-02)
Before this the game stated no goal and never ended: Vritra fell in Sector 3 and play simply continued.

**The goal, in one sentence, on the title screen:** "Vritra has drunk the well dry. Descend three levels and take the water back." The fiction was already in the game (Vritra is the serpent who hoarded the world's waters; the game is a descent down a well) and had never been used.

**A run now has an end.** Sector 3 is the bottom (`FINAL_SECTOR`). Killing Vritra there wins the run and opens the victory screen, *The Waters Return*. From it the player surfaces and banks everything, or goes on into Patal, the endless depths, under the usual rule that a fall keeps half.

**The player is told how far the goal is, everywhere:**

| Where | What it says |
|---|---|
| HUD and pause menu | "Level 2 of 3" in place of a bare sector number |
| Banner at the start of each level | "Vritra waits two levels below" |
| The choice after a level | "Prangan is cleared. Vritra waits two levels below." |
| The summary after a fall | "You fell in Jal-Kund, level 2 of 3. Vritra waits one level below." If he was on screen: "Vritra had 34% health left." |
| How to Play | A new first card, The Goal |

The near miss on the summary is deliberate: it is the strongest reason to try again.

**The well fills across runs.** Every boss beaten returns water: 1 measure for a level's boss, 3 for Vritra (`WATER`), so a complete descent returns 5. The well holds 35 (`WELL_FULL`), seven complete descents. Water is saved the moment it is won, so **a run that is lost afterwards still counted**. The title screen shows it twice: as a line ("The well is 34% full") and as a pool of water rising in the stepwell shaft, which is dry and molten at first. When the well fills, the victory screen becomes *The Well Is Full* and says the game is finished. Play can continue.

Player-facing text now says **level** where it said sector (the word lives in the name pack as `stage`); upgrade cards say *Rank* so the two do not collide. Code and these documents still say sector.

Not decided: whether the seven complete descents should differ from one another (the "seven worlds" idea, `design-document.md` §1.3), and what a win unlocks beyond water.

### 2.20 Automated checks
- **`tools/playtest-bot.js`** plays complete runs with game logic only (about 80x real time) and records per-sector balance figures, errors and leaked objects (§2.14).
- **`tools/smoke-test.mjs`** (2026-10-02) loads the game in a private, muted, headless Chrome with a throwaway profile; clicks through the loading screen; checks the fonts, the first tip, the HUD, the abandon prompt, the death and extract payouts and the sector-banner cleanup; checks that all three music tracks load and that each sector paints its own floor; measures every text on the how-to, settings, Powers and title screens against its panel; checks the goal on the title screen, "Level 1 of 3" and the near-miss line, kills the final boss and confirms the win, the water and the full payout; checks that all name packs have the same entries and that the plain pack shows no Sanskrit; opens the feedback dialog, types the game's own keys into it and confirms the message is posted (to a stub, so nothing is sent); runs three bot profiles; and saves screenshots. `node tools/smoke-test.mjs`. It needs Chrome or Edge and Node 22+, and no packages. It exists so testing never plays sound on, or takes over, the machine someone is working on.
