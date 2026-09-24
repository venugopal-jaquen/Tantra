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

**Provenance:** these decisions were made in a claude.ai chat on 2026-09-24, not in this repo. Recorded here so `docs/` stays the single source of truth — see `docs/design-document.md` §5 on why context living outside version control is a recurring problem.

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
- **Every enemy carries its Sanskrit type name above it** (2026-09-24): Asura, Yaksha, Mahish, Bheda, Dwarapal, Nidhi-Raksha, Kalachakra. Elites render theirs in caps and gold. These are *type* names, not proper nouns — the point is that the player reads them constantly during play, so the Indian identity lands through the game rather than through a menu nobody opens. Devanagari is deliberately omitted at this size: at ~8px over a moving sprite it turns to mush, and the codex already carries it.

### 2.5 Progression Structure
- A **Sector** = 5 waves. Wave 3 spawns a **Gatekeeper** (semi-boss). Wave 6 (i.e., past wave 5) spawns a **Sector Boss**.
- On Sector Boss defeat: present **Extract** (bank gold, end run) or **Descend** (Sector+1, harder, same shape) as an explicit, non-blocking-to-return choice screen.
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
| Typography | Devanagari script embedded alongside Latin in the UI as an identity marker; JetBrains Mono for numerics (forge-instrument feel) |

Target feeling, stated by the founder: **"rich and rewarding — treasure, wealth, loot fantasy."**

- **Arena floor (2026-09-24):** a carved sandstone **jaali** lattice — the pierced stone screens of Rajput and Mughal architecture, 8-point stars joined through the tile edges — with a **rangoli** at the centre and one smooth radial heat glow. Replaces four concentric glow ellipses, which read as generic "circles within circles". The lattice is drawn at device resolution so it stays sharp on retina screens.
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

### 2.12.1 First-run Tutorial (planned — pinned)
A live, in-game tutorial for first-time players, teaching each system during Wave 1 rather than through a wall of text up front: movement, auto-attack, the Cosmic Cycle bar, the Gatekeeper weak-phase rule, loot pickup, and the satchel.

**Deliberately deferred.** Pinned by the founder on 2026-09-24 until the mechanics are final — teaching a system that is still moving means rewriting the tutorial every time it moves. Revisit once §2.7.1, §2.7.2 and the boss set are settled.

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
