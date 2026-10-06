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
| 2026-10-04 | **Hybrid names become the default, tilted further West.** §2.12. | The founder played all three name sets and liked the hybrid "much better than the sanskrit version", then asked for it, and the loading screen, to lean more Western. Five short Sanskrit words remain: Kiran, Asura, Vritra, Nidhi, Tejas. |
| 2026-10-04 | **Boons wait for the player.** §2.24. | "The number of pauses when boon selection is needed just turned me off from the game." The founder pointed to Dota 2, where a level-up is spent at leisure with the + key. A cleared wave no longer stops the fight. |
| 2026-10-04 | **Power, stats and a profile screen.** §2.28. | The founder asked for a power level on the gameplay screen, numbers for the player's stats, and a first version of the profile screen pinned as P2, laid out like Destiny 2's character screen. |
| 2026-10-04 | **Glass.** §2.29. | "The overall game doesn't have any transparency as showcased in today's design cues (iOS, Windows 11)." Panels are now translucent over a frosted copy of the scene. |
| 2026-10-05 | **A boss shows when it can be hurt.** §2.6. | The testing round (`design-document.md` §1.4) named the first boss as the likeliest place to lose a new player: he took 12% damage unless the phase bar matched a small glow at his feet, and one tip explained it. The founder chose all four proposals: the state drawn on the boss, a countdown, a first Gatekeeper who arrives open, and a softer penalty on level 1, which they set at 30%. |
| 2026-10-05 | **Seven depths, with perks as the rewards.** §2.30. | The same round found nothing to earn by winning. The founder chose seven depths of the well as the spine, each harder than the last, and perks earned from bosses and depths as the rewards. This settles the "seven worlds" question as depths of the one well, and builds the perks pinned as P8. A daily descent was pinned for after the itch.io launch (P9). |
| 2026-10-05 | **Characters move; Vritra is drawn.** §2.31. | The cast is stock art with no animation frames. The founder chose motion made in code and a serpent drawn in code for now, will make the characters themselves with image tools (`docs/character-art-guide.md`), and is not ready to commission an artist. |
| 2026-10-05 | **Walk frames from the stock packs.** §2.31. | While writing the art guide it turned out that the four CraftPix packs already on the founder's machine hold full walk, attack, hurt and death frames for every character; the game had only ever taken one standing frame of each. Offered as a stopgap until the founder's own cast exists, and accepted: "Yes, switch on the walk frames from the stock packs". Walk only; the other animations stay unused. |
| 2026-10-05 | **Music stays off until after launch.** §2.16. | The founder on the earlier tracks: "Transitions weren't continuous plus the style for some tracks were not good. Freeware is still not good enough." Buying music is pinned for after the itch.io launch (P10). Sound effects stay. |
| 2026-10-04 | **A second set of floors, switchable.** §2.10. | The founder on the level backgrounds: "Current ones look too repetitive and low quality. Make something more sophisticated and worthwhile. It should look customized for this game." A new set was painted and offered beside the old one; the choice is theirs. |
| 2026-10-03 | **Wave shapes, a bigger opening, and tribute.** §2.25, §2.26. | The founder's first playtest of boons on a phone: "the initial runs look a bit too easy with no variability", and a reminder that patient players who kill more creeps before the boss should earn more drops and better benefits. They reached level 3 with the well 6% full. Every run had opened with four Asura, five Asura, then the Gatekeeper, and patience paid only a flat item roll. |
| 2026-10-03 | **Sound effects restored on iPhone.** §2.16. | The founder: "When I said remove the music, I just said remove the background music. I liked the gameplay sounds and effects." They had gone silent on the phone as a side effect of the music being switched off. |
| 2026-10-03 | **The well on the loading screen.** §2.19. | The founder asked for an infographic of how full the well is, which also says what happens once it is full. |
| 2026-10-03 | **Boons between waves.** §2.24. | The founder found the moment-to-moment play plain ("just moving around randomly shooting the nearest creep"), played the genre's hits, liked Brotato best, and asked whether the game should show a pick-of-three screen like Vampire Survivors'. They approved all 18 boons, a pick after every wave and one reroll per level. |
| 2026-10-03 | **The satchel pauses the fight.** §2.7.1. | Reversed at the founder's request: "I don't want to be killed while switching weapons." |
| 2026-10-02 | **The game gets a goal and an ending.** §2.23. | The founder's diagnosis after playing: nothing states what the player is trying to do, and nothing ends, so there is no compelling reason to stay. They chose "slay Vritra" as the end of a run plus a well that fills across runs. Seven worlds was discussed and left for later. |
| 2026-10-02 | **Sectors renamed for the stepwell; every name made switchable.** §2.12. | The founder found "The Fractured Approach" boring and vague, and chose names that say what each level is: Prangan, Jal-Kund, Nidhi-Kosh, Patal. In the same request they asked that all names be changeable in one step, because they are **re-evaluating whether so Indian a game helps or harms onboarding and retention**. That question is open; nothing about the identity has been reversed. |
| 2026-10-02 | **The stepwell becomes the game's place.** §2.10. | The founder still found the arena background generic after the jaali-and-rangoli floor. A lattice is a pattern, not a place. The game is now one descent down a stepwell: the title looks down the shaft, every arena is framed by its stairs, and each sector has its own painted floor. |

**Provenance:** the 2026-09-24 decisions were made in a claude.ai chat, and the 2026-10-02 Asura review in a separate Claude Code session, not in this repo. Recorded here so `docs/` stays the single source of truth — see `docs/design-document.md` §5 on why context living outside version control is a recurring problem.

---

## 2. Low-Level Requirements (by system)

### 2.1 Movement & Collision
- Dual input: touch or mouse, and WASD/arrow keys. **Both move Kiran at the same speed** (200 px/s, plus Vega Paduka).
- **Touch: tap to walk there, hold and drag to steer.** Lifting the finger does not cancel the walk; arriving, or pressing a movement key, does. A small ring marks where the tap landed.
- **Fixed 2026-10-03: touch movement was a teleport.** It closed 45% of the gap to the finger every frame, so a tap anywhere in the arena was reached in about a tenth of a second, against 1.7 to 2.8 seconds on the keys. The founder found it on a phone: "this feels like a cheat code". No bolt, slam or swarm could catch a touch player. See §2.14 for what this did to the difficulty figures.
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
  - **summons two Asura** on a timer — pressure, Tejas charge (§2.15), and tribute (§2.26). At most 4 of a boss's summons stand at once, rising with tribute to 7; each summons comes 8% sooner than the last, down to 3.5 s;
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
- **The rule is shown on the boss (2026-10-05).** It used to live in one tip: match a glow at his feet to the bar at the top of the screen. Now nothing has to be read or matched. This covers the Gatekeeper and Vritra's first stage.
  - **Resisting:** the boss turns steel-grey inside slowly turning plates of armour, and a line over his name counts down: "RESISTS · opens in 12s". Hits that glance off float the word RESISTS and play the blocked sound.
  - **Open:** the grey lifts, a ring flares in his colour with rays, the line reads "VULNERABLE 7s", a bell sounds, and a toast says "GATEKEEPER IS VULNERABLE - STRIKE NOW".
  - **The first Gatekeeper a player ever meets arrives open**, and stays open for at least 8 seconds (`session.gateTaught`). They see full damage first and then watch it fall away when the phase turns: a rule learnt by contrast.
  - **How much glances off** (`BOSS_RESIST`): on level 1 a resisting boss takes 30% of a hit, so a new player who ignores the rule still wins, slowly. From level 2 it takes 12%, as before.
- **Hoardbound** (Sector Boss): starts shielded; 3 "anchor" adds must be killed to break the shield before it becomes damageable.
- **Shield presentation (2026-09-24):** a breathing inner dome plus two counter-rotating rings, and a **second bar above the HP bar** showing anchors remaining. The two bars sit apart deliberately — while the shield bar has any fill, the HP bar underneath is unreachable, which says the rule faster than a toast does. Breaking the shield blows the rings outward rather than snapping them off, because that break is the payoff for the whole anchor puzzle.
- **Rift Warden** (Mega Boss, Sector 3): combines both mechanics sequentially — weak-phase timing first, then shield/anchor puzzle once below ~55% HP. Since 2026-10-05 he is a serpent drawn in code (§2.31).
- **Every enemy** displays a live HP bar (2026-09-24 — previously bosses, tanks and elites only). Bars scale with the enemy so a swarm reads as chatter and a boss reads as a wall, and drain gold → ember → crimson so health is legible without a number.

### 2.7 Loot
- Two slots: Weapon, Trinket. Three rarity tiers (Common/Rare/Epic) scale effect *magnitude*.
- Five weapon effects (none/Venom/Vampiric/Chain/Executioner) and five trinket effects (Vitality/Aegis/Thorns/Swift/Regen), each gated by a minimum Sector before appearing in the drop pool.
- ~25% of drops are Unidentified ("???") — revealed only on pickup, with a small rarity-roll bonus as the incentive to risk it.
- Loot pickups never pause gameplay — walking over an item equips it instantly with a toast notification.
- **Each effect has its own icon** (2026-09-24), generated procedurally at boot rather than shipped as files, so they stay on-palette and cost nothing to download. The icon says *what* dropped; the rarity tint says *how good*. Unidentified drops deliberately show one blank sigil regardless of contents — that ambiguity is the incentive to risk the pickup.
- **Each weapon effect has its own attack visual** (2026-09-24): Venom drips beads, Vampiric draws a thick crimson pull, Chain arcs jagged, Executioner swings a widening gold wedge, and the plain weapon stays a clean thin bolt. Previously every weapon drew the same cyan line, so a Venom Blade and an Executioner felt identical to use.

### 2.7.1 Satchel (run inventory)
A tab on the right edge of the arena shows a live item count. Tapping it pauses the fight and opens the satchel screen.

- A pickup no longer destroys what you were holding — **the outgoing item is stashed**, and tapping a stashed item swaps it back, returning the current one to the satchel. Nothing is ever lost to a swap.
- Capacity **8**; past that the oldest falls out. Losing something you stopped using long ago is a kinder failure than being unable to pick anything up.
- **Run-scoped.** Carrying loot between runs would undermine the Extract/Descend decision (§2.5).
- **Opening it pauses the fight (reversed 2026-10-03).** The first version did not pause: §2.7 says pickups never interrupt play, and swapping under fire was meant to cost something. The founder rejected it after playing on a phone: "I don't want to be killed while switching weapons". The original reasoning confused two things. Picking loot up should not interrupt play, and still does not. Choosing between items is a build decision, and Vampire Survivors, Brotato and 10 Minutes Till Dawn all stop the clock for those.
- **The screen says what each item does.** Every row carries the item's name, its effect and its numbers (damage and targets for a weapon, the bonus for a trinket), for both the equipped pair and the stored items. Before, rows showed a name only, so a swap was a guess.
- Tapping a stored item equips it and the screen stays open, so several swaps can be compared. BACK TO THE FIGHT, Esc or P resumes.

### 2.7.2 Powers Codex
A **POWERS** screen on the hub lists every weapon and trinket effect with its icon, description and unlock Sector. Effects the player has not yet reached the depth for are shown dimmed as *"Locked — reaches you in Sector N"*, and the hub button carries a live count (*"3 still locked — descend to find them"*).

The purpose is retention, not reference: a concrete count of unseen powers is a far better reason to press Descend than any amount of copy about replayability. It also satisfies §1.2.1 (mastery over grind) by making the system legible rather than hiding it.

A fourth tab, **BOONS** (2026-10-03), lists all 18 boons, one page per metal (§2.24).

### 2.8 Meta-Progression (Hub)
- Persistent-per-session currency ("Hoard Gold") purchases Vitality (max HP) and Power (weapon damage) upgrades between runs.
- Best Sector Reached is tracked and displayed as a bragging-rights stat.
- **Resolved 2026-09-11.** Persistence previously reset on page reload because the build ran inside a Claude.ai artifact sandbox that disallowed `localStorage`. That constraint disappeared once the game was served from GitHub Pages. Hoard Gold, Vitality/Power levels and Best Sector now persist across reloads via `localStorage` (`loadSession`/`saveSession`, key `loot-chase-session-v1`), falling back silently to in-memory if storage is unavailable (private browsing).

### 2.9 HUD
- **Kiran's health bar floats over his head (2026-10-06)**, at the founder's request, where it used to run across the top of the screen: 42 px wide, green, then gold under half and red under a quarter, with the Blood Shield as a thin line above it. The exact figure stays on the weapon line ("100/100 HP"). The phase bar took the freed space and is a little taller.
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

**Floor sets (2026-10-04).** The founder found the painted floors of 2026-10-02 "too repetitive and low quality" and asked for options that look made for this game. The floors are now grouped in sets (`FLOOR_SETS`), one line picks the set the game uses (`FLOOR_SET`), and `?floors=<name>` previews another without changing anything, the same way `?names=` previews a name pack.

| Set | What it is | Status |
|---|---|---|
| `classic` | The line-drawn floors of 2026-10-02 and the saw-tooth stair frame | Default until the founder chooses |
| `carved` | Weathered stone shaded pixel by pixel, carving lit by one sun, and a scene per level. The stairs round the arena are drawn as stairs: three courses of dressed stone, lit risers on two sides, shadowed on the other two | Offered 2026-10-04 |

The `carved` scenes, each tied to the story:

| Level | Scene |
|---|---|
| 1 Prangan | A court paved in irregular sandstone round a carved sun (Kiran means "ray of light"). The near corner lies in the wall's shade, and two arched jaali windows throw patterned sunlight across it. Marigold petals are strewn about; pots of marigolds stand on the steps |
| 2 Jal-Kund | The landing itself is flooded. Four drowned steps descend to a deep pool, each darker; a net of light plays on the water; lotus, fish and floating clay lamps drift in the shallows; and a long serpentine shadow lies in the deep, a first hint of Vritra |
| 3 Nidhi-Kosh | Vritra's coil is cast in bronze and laid into the floor round the whole vault, head at the top where the boss stands, eyes of ruby. His hoard is heaped in the four corners. Under a gold-rimmed grate at the centre the stolen water still glows |

- **Lights.** A set may place a few soft additive lights over a floor (`lights`): the floating lamps flicker, the grate's glow and the hoard's gleam breathe, the serpent's eyes pulse. They are clipped to the arena and pause with the game.
- **Legibility was checked** with all four enemy types, a boss, three loot drops and a slam telegraph on each floor. Loose coins on level 3 are kept within 44 px of the walls: scattered in the open they read as pickups.
- **Cost.** Each floor is painted once, about 0.3 to 0.6 s on a desktop. Level 1 is painted while the loading screen is up; the next level's is painted while the Extract or Descend screen is showing, so the descent does not stutter.
- Two further routes were offered and not taken yet: images from an image model (`docs/art-prompts.md` carries prompts for these same scenes) and commissioned art (pinned, P4).

### 2.11 Non-Functional
- Runs in-browser via Phaser 3 (CDN-loaded), no build step, portrait-oriented canvas (mobile-first).
- **High-DPI rendering (added 2026-09-24).** The game reasons in 400×700 world units, but the canvas backing store is `RES` times that, and the main camera zooms back in by the same factor — so no coordinate in the source had to change. `RES` is derived from `devicePixelRatio`, clamped to 2–3.

  Without it the canvas was literally 400×700 real pixels stretched across ~1179 device pixels on a modern iPhone: a ~3× upscale, which is exactly the softness that prompted this. Text carries a matching `resolution` so glyph textures are rasterised at device scale rather than world scale, and pointer input reads `worldX`/`worldY` rather than `x`/`y`, which are canvas-space and would be `RES` times too large.
- Target frame budget: smooth on mid-range mobile browsers (no confirmed performance testing yet — flagged as an open item, not a verified requirement). The `RES` clamp of 3 exists for this reason: beyond it the backing-store cost stops buying visible sharpness.

### 2.12 Naming & Cultural Layer

**The default is the hybrid pack since 2026-10-04** (§1.7): English for everything a player must understand at a glance (phases, enemy types, weapons, levels, boons), and five short Sanskrit words kept as the game's own: Kiran, Asura, Vritra, Nidhi, Tejas. Its loading cards carry no Devanagari. The Sanskrit pack described below remains, one line or `?names=sanskrit` away; `?names=plain` removes the last five words too.

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
Ten cards since 2026-10-05: the last, Depths · Perks, draws the well's seven steps with the won ones under water, beside three of the perks (§2.30).

Nine illustrated cards, reachable from the hub and the pause menu: The Goal (added 2026-10-02), Move · Fight, Loot · Satchel, Boons (added 2026-10-03), The Cosmic Cycle, Bosses, Slams, Tejas, and Extract or Descend. The illustrations reuse the real sprites, icons and telegraph shapes, so what the card shows is exactly what the player will see. Players swipe, or use the arrows. The copy switches between touch and keyboard wording.

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
- **More enemies deeper:** `4 + wave + (sector − 1)` per wave, plus one more on level 1 (it was `3 + …` until 2026-10-03, §2.25). HP scaling alone made Sector 5 feel like Sector 1 with bigger numbers.
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

**Caveat on everything above (2026-10-03).** The founder's report that started this section ("by Sector 3 not even losing 5% of my hp") was made on a phone, where touch movement was a teleport (§2.1). The playtest bot was never able to teleport: it steers by small steps. So the gap between the founder and the bot that these figures were read against was largely the bug, not skill, and **the game was made harder to challenge a player who could not be hit**. With the bug fixed, the bot's figures are the better guide to what a real player now faces: a fresh player loses most of their health in Sector 1 and rarely clears Sector 2. The scaling very likely needs to come back down. Not retuned yet: the founder should play the fixed build first.

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
**Status, 2026-10-05:** sound effects are in and stay. Music is switched off (`MUSIC_ON = false`) and stays off for the itch.io launch: the founder found that the first tracks' transitions were not continuous and that some did not suit the game, judged free music not good enough, and will consider buying it after launch (`design-document.md` P10). The music engine described below remains in the code.

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

**Sound effects on an iPhone (2026-10-03).** The founder reported that the gameplay sounds had gone when the music was switched off, and asked for them back: only the background music was meant to go. Cause: an iPhone whose ring switch is on silent mutes everything played through Web Audio, which is every effect in the game, unless the page is also playing an HTML `<audio>` element. The music's `<audio>` elements had been doing that by accident. Fix (`Unmute`): inside the Begin tap the audio session is declared as playback (Safari 16.4 and later), and on iOS a silent half-second loop plays in an `<audio>` element as the stand-in, paused while the page is hidden. Not verified on a real iPhone from here; the smoke test checks that the effects play with music off and that the loop is valid audio.

### 2.17 Pause & Settings (built 2026-09-27)
**Pause (VIRAM, विराम):** a button at the top-right of the HUD whose touch target (56×36) is larger than the drawn button. Esc or P also toggles pause. **Switching apps or tabs pauses the run automatically.** Pausing freezes game logic, timers and tweens. The menu shows the build you are carrying (weapon, trinket and Tejas form, each with what it does, and the boons taken this run as a row of icons), a **Profile** button (§2.28), your sector and wave, and the Nidhi from this run, followed by Resume, How to Play, Settings and **Abandon Run**. Abandon opens a confirmation that states the cost before anything happens: it **counts as a death**, and you keep only half of the run's Nidhi, with the exact numbers shown ("62 of 125"). *Keep Fighting* is the primary button.

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

**The well (2026-10-03).** Under the glossary card sits a small infographic of the goal: a stepwell shaft in cross-section with the water drawn at its current level, read straight from the save so it shows before the engine loads. The shaft has seven steps because the well has seven depths, and winning a depth fills a step (§2.30). Beside it, four lines:

| Line | New save | In progress | Full |
|---|---|---|---|
| Headline | The well is dry | The well is 6% full | The well is full |
| Count | Vritra has drunk it dry | Depth 3 of 7 · 11 of 35 measures returned | Depth 7 of 7 · 35 of 35 measures returned |
| What fills it | Slay Vritra to win a depth and fill a step. There are 7, each harder than the last | the same | Every drop Vritra took is back |
| What a full well means | Fill it and the game is won. Patal, the endless depths, stays open after. | the same | You have finished the game. Patal, the endless depths, stays open. |

The last line states what exists today and nothing more: a full well ends the game (§2.23). What each win unlocks on the way is in §2.30. Two glossary cards, Seven depths and Perks, were added on 2026-10-05. The loader is checked to fit a sideways phone and a small phone with its tallest glossary card showing.

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
- **How:** a static page cannot send mail, so the message is posted to FormSubmit (`formsubmit.co`), a free relay that needs no account. **The first message ever sent triggers an activation email to the founder; nothing is delivered until the link in it is clicked once.** The founder did this on 2026-10-06, and a test message sent through the live dialog that day was accepted. FormSubmit then issues a private alias, which should replace the address in the page source (the address is visible there until it does).
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

**Changed 2026-10-05:** the seven descents now differ. Each is a depth of the well with its own hardship, a win opens the next, and water is counted by depth instead of boss by boss, so beating the first depth seven times no longer fills the well (§2.30).

### 2.24 Boons between waves (2026-10-03)
The answer to "the play feels plain" (`design-document.md` §1.3): the game's big decisions (Extract or Descend, the Cosmic Cycle, boss rules) were good but rare, and the small ones were missing. Loot equipped itself, and nothing grew inside a run.

**When.** Every wave cleared before a boss earns a boon: waves 1 to 5 of each level, the Gatekeeper's wave included. That is 5 a level and 15 in a full descent, plus any paid as tribute (§2.26).

**Chosen at the player's leisure (2026-10-04).** For one day a cleared wave froze the fight and demanded a pick. The founder found the interruptions off-putting and pointed to Dota 2. Now a cleared wave adds a boon to a queue, the next wave comes on 0.4 s later as it always did, and a gold **+ button** with a count appears at the right edge of the arena, below the satchel. Tapping it, or pressing + (or =, or B), opens the pick, and only then does the fight pause. Boons that are never spent are simply lost with the run. Because a waiting boon is power left unused (bot runs: a player who only spends them between levels reaches level 3 half as often, `design-document.md` §1.4), the button pulses, carries a count, has a one-time tip that jumps the tip queue, and from the second waiting boon a line of text says "2 BOONS WAITING - TAP +". None of these stop the fight. The choice screen after a level offers "Choose your boons first" when any are waiting, and unspent boons travel down with a Descend.

**The screen.** Three cards, stacked: icon, name, metal, what it does, and a note (the gloss, "rank 2 of 3" when it stacks, or the weapon it needs). Tapping a card takes it; if more are waiting the next three cards follow at once, otherwise the fight resumes. Taps in the first 0.35 s after the cards appear are ignored, so a tap meant for walking cannot choose one. **Choose later** (or Esc) closes the screen and keeps the boon; its three cards are kept too, so closing and reopening is not a reroll. **One free reroll per level** (`BOON_REROLLS`). The screen ends with the boons taken so far.

**Rules.**
- Boons belong to Kiran, not to the weapon, so a swap keeps them. They last the run; Extract or death clears them.
- **Metal ladder, as for loot.** Copper boons are stats and stack three times. Silver change how you fight. Gold deepen what you carry and are offered only when they apply: a weapon boon only while that kind of weapon is equipped, Kindling only once Tejas has woken.
- **Odds by level** (`BOON_ODDS`), per card: level 1 copper 65%, silver 28%, gold 7%; level 2 50/35/15; level 3 and below 40/35/25. A metal with nothing left to offer falls back to any boon that applies. The three cards are always different.
- Bonuses add rather than multiply, so a stacked build grows steadily. Damage boons apply to every hit Kiran deals: the weapon, its chain, its poison and the Tejas forms.

| Boon | Metal | Effect |
|---|---|---|
| Keen Edge (*Dhaar*) | Copper, ×3 | +15% damage |
| Quick Hands (*Chapal*) | Copper, ×3 | Attacks 12% faster |
| Long Reach (*Vistar*) | Copper, ×3 | +20 attack range |
| Light Feet (*Laghu*) | Copper, ×3 | +20 move speed |
| Iron Body (*Loha*) | Copper, ×3 | +20 max health, and heals 20 now |
| Thick Hide (*Kathor*) | Copper, ×3 | Take 8% less damage |
| Hold Your Ground (*Achal*) | Silver | +35% damage after 0.2 s of standing still. Judged by intent: being shoved by an enemy still counts as standing |
| Strike on the Run (*Gati*) | Silver | Attacks 25% faster while moving. Taking either of these two removes the other from the pool |
| Second Target (*Yugal*) | Silver, ×2 | Each attack hits one more enemy |
| Read the Slam (*Sajag*) | Silver | Be inside a slam's red zone at any point of its warning, be out when it lands, and hit 50% harder for 4 s |
| Last Stand (*Veer*) | Silver | Below 30% health: +40% damage, +30 speed |
| Greed (*Lobh*) | Silver | +25% Nidhi from kills and waves, but every hit taken is 10% bigger |
| Spreading Rot (*Prasar*) | Gold, venom | A poisoned enemy that dies passes its poison (4 fresh ticks) to the nearest enemy within 140 |
| Blood Shield (*Rakta Kavach*) | Gold, vampiric | Healing past full health becomes a shield, up to 25, shown as a pale band on the health bar. It soaks damage before health |
| Forked Lightning (*Shakha*) | Gold, chain | Each chain jumps to two enemies, not one |
| Clean Cut (*Nirnay*) | Gold, executioner | The executioner's bonus starts at 35% health, not 25% |
| Kindling (*Chingari*) | Gold | Tejas fills 30% faster |
| Eclipse Hunger (*Bhookh*) | Gold | During Grahan, every kill heals 3 |

Names live in the name packs (`boons`, §2.12): the Sanskrit pack uses short everyday words with English glosses; the plain and hybrid packs use the English names. Icons are drawn at boot like the loot icons and tinted by metal.

**Balance (playtest bot, 2026-10-03, random picks, target level 3, two batches pooled).** Fresh player, 16 runs each: **9 of 16 reached level 3 with boons, 1 of 16 without**; health lost on level 1 averaged 52% against 68%. Single runs swing widely (0% to 182% on level 1), so only pooled figures mean anything. Mid upgrades (6/6), 8 runs each: **4 of 8 slew Vritra with boons, 0 of 8 without**. Boons roughly cancel the difficulty that was tuned against the touch-teleport bug (§2.14). A later check of 16 fresh runs without boons, on the build before boons and on this one, gave the same picture on both (85 to 95% of health lost on level 1, one untouched run in 16), so boons changed nothing for a player who skips them. **No retune yet**: the founder plays the build first, and the retune happens once, with boons in.

**Boons tab in Powers** (§2.7.2). A fourth tab lists all 18, one short page per metal (six each), with the same rows as the other tabs: icon, name, gloss and conditions ("can be taken twice", "Visha Katar only", "once Tejas has woken"), and the effect. Nothing here is locked: boons are not gated by depth.

**Tells on Kiran.** A boon that only works some of the time has to show when it is working.

| Boon | While it is live |
|---|---|
| Hold Your Ground | A gold ring, gently pulsing, planted outside the phase ring at Kiran's feet. It appears after 0.2 s of standing still and goes the moment Kiran moves. The phase ring keeps its own colour |
| Read the Slam | A gold arc around Kiran that drains over the 4 seconds, plus the toast when it triggers |

Last Stand has no tell of its own: the health bar turning red already says it.

### 2.25 Wave shapes and the opening (2026-10-03)
Every run opened the same way: four Asura, five Asura, the Gatekeeper, and no other enemy type before wave 4. The founder, who reached level 3 on the first build with boons, called the opening too easy and too alike.

**Shapes.** Each ordinary wave (not the Gatekeeper's, not a boss) draws a shape, never the same one twice running (`WAVE_SHAPES`). A toast names it as it starts.

| Shape | What arrives | From |
|---|---|---|
| Mixed | The usual count, types rolled from the pool below | wave 1 |
| Swarm | 1.7× the count, all Asura at 55% health and 60% Nidhi, arriving fast | wave 1 |
| Pincer | One more than the count, alternating between two opposite walls | wave 1 |
| Archers | About 45% Rakshasa, the rest Asura | wave 2 |
| Brute | One Mahish (two from level 2) and its guard of Asura | wave 2 |
| Brood | About 55% Raktabija, the rest Asura | wave 4 |

**A bigger opening.** The count is `4 + wave + (sector − 1)`, and level 1 gets one more, so its waves run 6 to 10 enemies where they ran 4 to 8. Deeper levels gain one per wave: only the opening was called too easy. In the type pool Rakshasa and Mahish arrive from wave 2 (was 3) and Raktabija from wave 3 (was 4). The Gatekeeper brings three escorts, not two.

**A first-ever run is exempt for its first two waves** (no level has been reached yet on this save): four plain Asura, then five, as before, so the tutorial tips have room.

**Playtest bot, fresh player with random boons, 14 runs each, target level 3.** Level 1 kills rose from 46 to 62 and health lost there from 57% to 76%; runs reaching level 3 went from 6 to 9 of 14. With mid upgrades, 3 of 8 slew Vritra on both builds. So the opening is busier and costs more, and the later levels are about where they were. A first version added two enemies per wave on every level; it cut the mid profile's Vritra kills from 3 of 8 to none and was tapered.

### 2.26 Tribute: the reward for patience (2026-10-03)
The founder's rule since 2026-09-24: a player patient enough to kill more creeps before killing the boss should come out ahead. Until now that paid Tejas charge and a flat 18% item roll per kill, grew with nothing, and was explained nowhere.

- **Counting.** While a boss lives, every enemy *it summoned* that the player kills adds 1 to that boss's tribute. Anchors, escorts and wave enemies do not count. The count rides on the boss's name: "Bakasura · tribute 3/5", turning gold at 5.
- **Paid when the boss falls** (`TRIBUTE`):

| Tribute | Reward |
|---|---|
| 5 | One more gold item in the boss's drop |
| 10 | A boon, added to the + button's queue like any other (until 2026-10-04 it was a forced pick) |
| 15 | That pick offers gold boons on every card. Where fewer than three gold boons apply, silver fills the rest |

- **The gamble.** Each summons comes 8% sooner than the last (9, 8 or 7 s at first, down to 3.5 s), and the number of summons allowed to stand at once rises from 4 by one for every 5 tribute, to 7. The longer the wait, the thicker the crowd.
- **Told to the player:** a toast at each threshold ("TRIBUTE 5 - AN EXTRA ITEM WHEN IT FALLS"), a one-time tip the first time a boss summons, and a line on the Bosses card in How to Play. The tribute pick's screen is headed "TRIBUTE OF 12 PAID · earned by patience".
- Ordinary waves cannot be farmed: they are a fixed count. Tribute is the only place patience pays.

### 2.28 Power, stats and the profile (2026-10-04)
The first working version of the profile screen pinned as P2 (`design-document.md` §1.1). Function first; the cosmetic side of P2 (naming the hero, building looks) stays pinned.

**Power** is one number for how strong Kiran is, in the manner of Destiny's. It is a gear score: everything carried adds a fixed amount, so a pickup or a boon moves it by a figure the player can learn (`POWER`).

| Source | Adds |
|---|---|
| Base | 100 |
| Each rank of Vitality or Power bought on the title screen | 8 |
| Weapon | 20 copper, 45 silver, 80 gold; +15 for each extra target; +15 if it has an effect |
| Trinket | 15 copper, 30 silver, 50 gold |
| Each boon rank | 10 copper, 25 silver, 40 gold. A weapon boon that is asleep adds nothing |
| Tejas, once woken | 30 |
| Each perk worn (§2.30) | 20 |

A new character starts a run at 120. The HUD shows "◆ Power 245" at the right of the weapon line; when it rises the number swells and the gain floats up from it. Tapping it opens the profile.

**The profile** is reached from that number, from the pause menu, and from a Profile button on the title screen (where it shows what a new run starts with). Laid out after Destiny 2's character screen:

- Name and place at the top left; Power, large, at the top right.
- Kiran in the middle, lit from behind, standing on the current phase's ring.
- Left: three gear slots (weapon, trinket, Tejas form), each bordered in its metal and marked with the power it adds.
- Right: this run's boons as small slots, three across, with the rank when it stacks; a sleeping weapon boon is dimmed. At the top of the well, where there are no boons, the same space holds the perks to choose from (§2.30). The perks worn sit in a row at Kiran's feet on both.
- Tapping any slot names what is in it and says what it does.
- **Stats**, with numbers: Health (current / maximum), Shield (Blood Shield points, and the Aegis's "blocks a hit every N s"), Attack damage (per hit, with the number of targets), Attack speed (attacks a second), Move speed. Under them, range and the share of damage taken. Bonuses that come and go (standing still, a read slam, the last stand) are left out: these are what Kiran has all the time.
- A bar showing where the power comes from, one colour to a source, with the figures under it.

### 2.29 Glass (2026-10-04)
- **Every panel is translucent** with rounded corners, a faint sheen across the top, a coloured rim and a hairline of light inside it: the pause menu, satchel, boon pick, profile, settings, How to Play, the abandon prompt, the choice after a level, the victory and the end of a run. Buttons, boon cards, satchel rows and the title screen's upgrade cards are the same glass.
- **What lies behind a panel shows through frosted.** When a panel opens, the whole scene is drawn once into a texture a quarter of the size, and that small copy is laid down thirteen times in two rings, each averaged into the last. It is a blur built from plain draws: nothing is paid per frame, and it does not depend on how the graphics card filters a stretched texture (a first version did, and came out as a mosaic). Two frosted textures exist so that a boon pick can open over the choice screen.
- Without WebGL the panels fall back to a nearly opaque backing.
- The chips that live in the arena (satchel tab, Tejas button, tip box) are see-through so the fight shows under them. The loading screen's cards and the feedback dialog use the browser's own `backdrop-filter`.

### 2.30 Seven depths, and perks (2026-10-05)
The answer to "nothing to earn by winning" (`design-document.md` §1.4). The founder chose depths as the spine and perks as the rewards.

**Depths.** The well is won seven times over. Slaying Vritra wins the depth being played: a step of the well fills, and the next depth opens. Each depth keeps every hardship of the ones above it and adds one of its own (`DEPTHS`), and pays 20% more Nidhi than the one before.

| Depth | Name | What it adds | Nidhi |
|---|---|---|---|
| 1 | The First Descent | The game as it was | as before |
| 2 | Swift | Enemies move 12% faster | +20% |
| 3 | Thin Air | Beating a boss heals 20% of health, not 35% | +40% |
| 4 | Wrath | Bosses slam a quarter more often | +60% |
| 5 | Horde | Two more enemies in every wave | +80% |
| 6 | Restless | Convergence every 60 seconds, not 90 | +100% |
| 7 | The Serpent's Own | Everything has 20% more health and hits 20% harder | +120% |

- **Choosing.** The title screen shows the depth about to be played, its name and its hardship, on a glass strip under DESCEND. Once a second depth is open, arrows step between the open ones. It defaults to the deepest one open. No new art is needed: a depth is the same three levels under harder rules.
- **Told during play:** the level banner reads "DEPTH 3 · LEVEL 1 OF 3", the HUD line and the pause menu carry "D3", and the victory screen says "Depth 3 is won. Depth 4 opens: Wrath."
- **Water is counted by depth.** A depth won holds 5 measures. The depth being attempted holds 1 for each of its two level bosses beaten at best, so progress short of a win still shows. Seven depths make the same 35 measures as before. A depth already won can be replayed for its Nidhi and pays no water, and the title screen and the victory screen both say so.
- **Older saves** are carried over: a save that had slain Vritra starts with depth 1 won; one that had not keeps up to 2 measures; one that had reached level 2 is given the first two perks.

**Perks.** Lasting gifts, each earned once (`PERKS`). This is the boss-kill perk idea pinned as P8, widened so that every depth has one.

| Perk | Earned by | What it does |
|---|---|---|
| Sentinel's Guard | the first Gatekeeper beaten | Start every level with one hit blocked |
| Hoarder's Eye | the first Hoard Guardian beaten | Enemies drop items a third more often (24% from 18%) |
| Serpent's Scale | winning depth 1 | Take 10% less damage |
| Deep Lungs | winning depth 2 | +25 max health |
| Second Wind | winning depth 3 | Once a run, a killing blow leaves you on 30% health |
| Quick Study | winning depth 4 | Start every run with a boon waiting |
| Second Thoughts | winning depth 5 | One more reroll on every level |
| Tribute Taker | winning depth 6 | Tribute pays at 4, 8 and 12, not 5, 10 and 15 |

- **Two are worn at a time**, three once depth 4 is won. That is the choice: perks are a build made before the run, where boons are a build made during it.
- A perk is worn at once if a slot is free. Otherwise it waits on the Profile, where tapping a perk wears it or takes it off, and a perk not yet earned says how to earn it. Perks cannot be changed during a run.
- **Told to the player:** a toast when one is earned, a line on the victory screen and on the end-of-run summary pointing to the Profile, a How to Play card (the tenth), and a glossary card on the loading screen.
- Each perk worn adds 20 to Power (§2.28).
- Winning depth 7 earns no perk: the well is full, and that is the ending (§2.23).

**Not built:** a daily descent, pinned as P9 for after the itch.io launch.

### 2.31 Motion, walk frames, and the drawn serpent (2026-10-05)
The cast is stock art. Until the founder's own characters exist (`docs/character-art-guide.md`), it is brought to life three ways.

- **Walk frames (`WALK`, `charSprite`, `pose`).** Kiran and the six enemies and bosses that are sprites each have a walk sheet, `game/assets/chars/<name>-walk.png`: a row for each facing, and in each row a standing frame followed by eight walk frames. They come from the same CraftPix packs as the stills (`game/assets/CREDITS.md`) and are built by `tools/extract-walk.py`, which reads the packs' zips directly.
  - The cycle advances with the ground covered (one cycle for every 2.4 body-widths), so feet do not slide; a slow boss still steps at 0.7 cycles a second. A character that stops returns to its standing frame after a moment's hold, so one jostled in a crowd does not flicker.
  - A sheet's standing frame is the same picture, at the same size, as the 96 px still. Cells are 112 px so a stride never clips, and the game draws a sheet 112/96 times larger to make up for it.
  - Sheets are saved with a 255-colour palette: 362 KB for all seven, against 424 KB for the 32 stills. The stills stay, for the Profile and How to Play, and as the fallback if a sheet fails to load.
  - Only walking is used. The packs also hold attack, hurt, dying and idle frames; they are not in the game.
- **Motion in code (`animate`).** One small routine adds what the frames do not carry: a lean into the direction of travel, slow breathing when still, a squash when hit, a punch forward on each of Kiran's volleys, a pop when a character appears, and a crouch while a boss winds up a slam. Heavy enemies move less. A dying enemy folds and fades instead of blinking out. A character with no sheet also gets a hop in place of a stride; that was every character for one build (0.4).
- **Vritra is a serpent (`paintSerpent`, `updateSerpent`).** The game's last boss was a stock sprite standing where the story promises a serpent. He is now drawn in code: a head leading 26 segments in teal banded with gold, each segment following the one before, so he slithers when he moves and draws into a coil when he roots himself behind his shield or winds up a slam. His colour carries the same tell as §2.6: steel-grey while he resists, full colour and flaring while he is open. The stock sprite stays loaded as an unseen stand-in so nothing that expects one breaks. The Goal card in How to Play shows the serpent.

### 2.20 Automated checks
- **`tools/playtest-bot.js`** plays complete runs with game logic only (about 80x real time) and records per-sector balance figures, errors and leaked objects (§2.14).
- **`tools/smoke-test.mjs`** (2026-10-02) loads the game in a private, muted, headless Chrome with a throwaway profile; clicks through the loading screen; checks the fonts, the first tip, the HUD, the abandon prompt, the death and extract payouts and the sector-banner cleanup; checks that all three music tracks load and that each sector paints its own floor; measures every text on the how-to, settings, Powers and title screens against its panel; checks the goal on the title screen, "Level 1 of 3" and the near-miss line, kills the final boss and confirms the win, the water and the full payout; checks that all name packs have the same entries and that the plain pack shows no Sanskrit (every boon card included); clears a wave and checks the boon pick (three cards, the fight frozen, a stray tap ignored, one reroll, the next wave), the numbers a set of boons promise, and Read the Slam on a live slam; opens the feedback dialog, types the game's own keys into it and confirms the message is posted (to a stub, so nothing is sent); checks the gold ring and arc that show on Kiran while Hold Your Ground and Read the Slam are live, and that the Boons tab lists six boons per metal clear of the Back button; checks that a cleared wave earns a boon without pausing, that the + button and the + key open the pick, that a pick can be put off without a free reroll, and that panels are frosted; checks power for gear, boons and a sleeping weapon boon, the HUD number, and the profile's stats; builds 300 waves and checks the six shapes, the no-repeat rule and the gentle first-ever opening; makes a boss summon and checks the tribute count, the extra item, the second pick and the pick before the choice screen; checks the well on the loading screen for a new save and for a save with water; checks that the first Gatekeeper arrives open, that a resisting boss says so, counts down and takes 30% on level 1 and 12% below, and that Vritra is the drawn serpent; wins a depth and checks the water, the next depth on the title screen, that a depth already won pays no water, that depth 2 is faster and richer and depth 3 heals less; checks that perks show on the profile, that two are worn and chosen by tapping, that each does what it says, and that an older save is carried into the depths, both when read in play and when the page loads with one; checks that every character but Vritra has a walk sheet, that figures keep their size, and that Kiran and an enemy step through their walk frames and stand when they stop; runs four bot profiles, one without boons; checks that Kiran's health bar sits over his head; and saves screenshots. 68 checks. `node tools/smoke-test.mjs`. It needs Chrome or Edge and Node 22+, and no packages. It exists so testing never plays sound on, or takes over, the machine someone is working on.
