# Loot Chase — Requirements Document

## 1. High-Level Requirements

### 1.1 Vision
A solo-buildable, AI-assisted arena roguelite where survival depth comes from reading systems (a learnable cosmic timer, boss tells, item identity) rather than raw reflexes or grind — built to be genuinely replayable through mastery, not FOMO.

### 1.2 Core Pillars
1. **Mastery over grind** — depth comes from learnable systems (Cosmic Cycle timing, boss weak points), not time-gating or daily-login mechanics.
2. **Real item identity** — loot has distinct mechanical personality (Dota-inspired), not just bigger numbers.
3. **Structured escalation** — Sectors → Boss → Extract/Descend choice, so "getting better" changes the *kind* of challenge, not just its size.
4. **Minimal-cost, solo-buildable** — AI-assisted ("vibe-coded") development, developer hiring scoped narrowly to post-launch bug-fixing or platform-specific packaging only.
5. **Secular, broad-appeal theme** — cosmic/astronomy-flavored, deliberately not tied to any real-world religion or mythology.

### 1.3 Non-Goals (explicit)
- No literal item-crafting/recipe-combination system (evaluated, deliberately deferred — adds complexity that could turn off players seeking a simpler game).
- No FOMO mechanics: no daily login timers, no power decay, no time-gated content.
- No manual-aim/twin-stick combat rebuild at this stage (auto-attack + positioning is the current skill expression layer; manual aim remains a possible future pillar change, not a current requirement).
- No specific real-world religious or mythological framing.

### 1.4 Target Platforms (sequenced, not simultaneous)
1. Web (itch.io) — first, validates retention risk-free.
2. Android — second, after web validates engagement.
3. Steam (PC) — third, highest packaging cost, most justified once a real audience exists.

### 1.5 Target Audience
Players who enjoy systems-depth genres (Dota-style itemization/knowledge depth, Destiny-style build-crafting and boss mechanics) but want sessions compatible with mobile/short-form play — bridging "deep" and "quick to pick up."

### 1.6 Success Criteria
- A player who clears a Sector wants to press "Descend" rather than stop.
- A boss fight is rememberable/describable to a friend (a real "trial and error" story), not a stat check.
- Launch is achievable with founder time + AI-assisted coding + minimal paid freelance hours (see `loot-chase-launch-roadmap.md`).

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
- **Known limitation:** persistence is session-only (resets on page reload) because the current build runs inside a Claude.ai artifact sandbox, which disallows `localStorage`. This is *not* a permanent design constraint — once deployed to real hosting (GitHub Pages/Vercel/itch.io), standard browser storage will work normally. Flagged here so it isn't mistaken for a design flaw later.

### 2.9 HUD
- Wave/Sector/Gold readout, HP bar, Cosmic Cycle countdown bar (with near-end flash warning), Sector progress track with milestone icons (Gatekeeper wave, final wave).

### 2.10 Visual Style
- "Cut Light" direction: faceted polygon silhouettes (not circles), shape complexity encodes threat tier, rim color always reflects the current Cosmic Cycle phase. Full specification in `loot-chase-visual-style-sheet.html`.

### 2.11 Non-Functional
- Runs in-browser via Phaser 3 (CDN-loaded), no build step, portrait-oriented canvas (mobile-first).
- Target frame budget: smooth on mid-range mobile browsers (no confirmed performance testing yet — flagged as an open item, not a verified requirement).
