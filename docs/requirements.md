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

### 2.3 Cosmic Cycle (core learnable system)
- Four phases in fixed sequence: Drift → Surge → Eclipse → (repeat), each with a defined duration, enemy/player damage multiplier, spawn-rate multiplier, and loot-rarity boost.
- A rare, time-based Convergence event interrupts the sequence periodically, spawning a guaranteed-drop elite, then resumes the prior phase exactly where it left off.
- Current phase and time-remaining must be visibly legible at a glance (countdown bar, not a static icon).

### 2.4 Enemy Types
- Melee, Ranged (kites + projectiles), Tank (slow/tanky), Splitter (splits into two on death) — each unlocked progressively by depth, permanently once unlocked.
- Stats scale off a cumulative `depth` counter `(sector-1)*5 + wave`, not the wave-within-sector number, so difficulty never resets on Descend.

### 2.5 Progression Structure
- A **Sector** = 5 waves. Wave 3 spawns a **Gatekeeper** (semi-boss). Wave 6 (i.e., past wave 5) spawns a **Sector Boss**.
- On Sector Boss defeat: present **Extract** (bank gold, end run) or **Descend** (Sector+1, harder, same shape) as an explicit, non-blocking-to-return choice screen.
- Every Sector boss encounter must leave the game state clean on either choice (no leftover UI — this was a real shipped bug, now fixed, and should stay covered by manual regression testing).

### 2.6 Bosses
- **Gatekeeper**: weak-phase puzzle — full damage only when the Cosmic Cycle matches its core color; telegraphed AoE slam.
- **Hoardbound** (Sector Boss): starts shielded; 3 "anchor" adds must be killed to break the shield before it becomes damageable.
- **Rift Warden** (Mega Boss, Sector 3): combines both mechanics sequentially — weak-phase timing first, then shield/anchor puzzle once below ~55% HP.
- All bosses (and tanks/elites) display a live HP bar.

### 2.7 Loot
- Two slots: Weapon, Trinket. Three rarity tiers (Common/Rare/Epic) scale effect *magnitude*.
- Five weapon effects (none/Venom/Vampiric/Chain/Executioner) and five trinket effects (Vitality/Aegis/Thorns/Swift/Regen), each gated by a minimum Sector before appearing in the drop pool.
- ~25% of drops are Unidentified ("???") — revealed only on pickup, with a small rarity-roll bonus as the incentive to risk it.
- Loot pickups never pause gameplay — walking over an item equips it instantly with a toast notification.

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

- **Canonical reference:** `concept/loot-chase-visual-forge-v2.html`. Measured palette: background `#3D1200`, gold `#FFD23C`, cream `#FFFBEF`, dark ore `#2A0800`, forge orange `#FF8C42` / `#FF6B1A`, bronze `#C8A96E`, and cyan `#4DD0FF` as the single cool accent (Shanti).
- **Superseded:** `concept/visual-style-sheet.html` ("Cut Light") and `concept/character-art-spec.html` (abstract cosmic roster) both predate this direction and are retained only as history.
- **Open:** abstract polygon shapes were rejected as unable to carry an Indian-themed identity. Real sprites are required; sourcing is unresolved (see §2.12).

### 2.11 Non-Functional
- Runs in-browser via Phaser 3 (CDN-loaded), no build step, portrait-oriented canvas (mobile-first).
- Target frame budget: smooth on mid-range mobile browsers (no confirmed performance testing yet — flagged as an open item, not a verified requirement).

### 2.12 Naming & Cultural Layer

Adopted 2026-09-24 (§1.7). Sanskrit/Hindi naming replaces the previous abstract-cosmic roster. Devanagari is shown alongside the Latin name in the UI as an identity marker, not as a translation the player must read.

| System concept | Name | Devanagari | Meaning |
|---|---|---|---|
| Player | **Kiran** | किरण | Ray of light |
| Melee enemy | **Asura** | असुर | Cosmic dark being |
| Ranged enemy | **Yaksha** | यक्ष | Supernatural keeper of hidden treasure — fits a loot game exactly |
| Tank enemy | **Mahish** | महिष | Great force |
| Splitter enemy | **Bheda** | भेद | Division, splitting |
| Gatekeeper (semi-boss) | **Dwarapal** | द्वारपाल | Literally "gate guardian" |
| Hoardbound (sector boss) | **Nidhi-Raksha** | निधि-रक्षा | Treasure guardian |
| Rift Warden (mega boss) | **Kalachakra** | कालचक्र | Wheel of time |
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

**Not yet implemented.** `game/loot-chase-v0.1.html` still uses the old names throughout (`PHASE_DEFS` keys `drift`/`surge`/`eclipse`/`convergence`, enemy types `melee`/`ranged`/`tank`/`splitter`, and the "Hoard Gold" / hub strings). Renaming touches display strings *and* object keys, so it should be done as one deliberate pass rather than piecemeal.

### 2.13 Sprite Sourcing (open)

Abstract shapes are ruled out (§1.7). Three paths were identified, none yet chosen:

| Option | Cost | Note |
|---|---|---|
| AI image generation | ₹0–850/mo | Midjourney trial or Adobe Firefly free tier. Fastest path to "looks real". |
| Free asset packs | ₹0 | itch.io / Kenney / CraftPix. None are Indian-themed, which is now the whole point — so these can only ever be placeholder. |
| Commission a 2D artist | ₹3,000–8,000 | Fiverr or local Pune/Jalna. 4–6 core sprites. Genuinely unique, but worth doing *after* itch.io validates the game. |

**Conflict to resolve:** the Kenney CC0 space-shooter sprites currently shipped in `game/assets/` are sci-fi ships and grey meteors on a dark purple field. They satisfy none of this section and contradict §2.10. They are placeholder only.
