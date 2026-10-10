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
| 2026-10-10 | **This look is the cast.** §2.39. | Shown the two in the game, the founder: "Yes, this is the look for the cast. You can close the relevant PR." "ChatGPT made the pictures." "Wait until we get the entire characters.. I will also try to get the background images generated to match the character arts." And of the walk: "The stepping walk looks a bit odd in the side-view animation. Can we fix that?" The rendered cast's pull request was closed, the side walk was made again, and what to give ChatGPT for the other five and for floors was written down (`docs/art-brief-for-chatgpt.md`). |
| 2026-10-10 | **The founder's own hero and Asura, fitted to the game.** §2.39. | The founder had the two designed with another AI tool and pasted its handoff: "Check this out and see how you can integrate with the main code. If this looks good, I will get the other characters designed similarly." The designs were kept as they are; how they were cut and how large they are drawn were changed, because as delivered the hero was about 20 pixels wide in a fight. Put up for their review; not merged. |
| 2026-10-10 | **The title screen has its picture.** §2.21. | The founder made a picture with ChatGPT (a stepwell seen from above, lamps, a glowing pool) and was shown it behind the real title screen three ways. "Use fit 2 for the title screen." |
| 2026-10-10 | **Tribute's summons quicken too; records are kept; badges are pinned.** §2.26, §2.37. | Told that toughness alone never threatens a player who is not touched, and asked three things, the founder answered: "1. Yes" (add the climb in speed), "2. Yes" (pin the cosmetics), "3. Yes start recording. Maybe let's design the badges tab separately in the profile section where we can keep simple badges for each kind of achievement." The cosmetics are pinned as P12 and the badges tab as P13 (`design-document.md`); neither is built. |
| 2026-10-10 | **Tribute pays without end, and grows heavier.** §2.26, §2.36. | The first fix for a boss kept alive stopped his summons paying at tribute 15. The founder: "I don't agree with the circling a boss while killing his summons stops paying after a while. That could increase the farming potential for players looking to build before descending to the next level." Offered three ways, they picked the first: pay for as long as the boss lives, with the danger climbing. They added that this is a mechanic learnt by playing, as in Destiny 2, and that cosmetic drops for the profile screen could one day be hung on it; that idea is not pinned. |
| 2026-10-10 | **Free rides are hunted for and closed.** §2.36. | The founder: "Also try to figure out some gameplay pseudo-cheats. For example: if a player keeps moving around the edges of the wall he stays alive even without much effort. I am not saying this is in the game right now but it could be. We need to game test this thinking of such possibilities and fix them." It was in the game. Two were real and are closed (the runner, and a boss kept alive for what he summons), three small ones are closed with them, and the rest were tried and found shut. |
| 2026-10-10 | **Five ideas stop the fight to be taught.** §2.35. | The founder: "Make the level tutorial stronger. Something like: the game pauses and a popup is highlighted explaining a particular concept. This can be skipped but happens first time the player is playing or there can be an option to go through this." Asked which ideas, how it is offered and where, they took all three proposals: five ideas (moving, loot, the + button, the timer over a boss, slams) with the other tips left quiet; it runs by itself on a first run with a skip on every panel and a replay in How to play; and it happens inside the real run. This sets aside, for teaching only, the 2026-09-27 choice that play never stops and the 2026-10-04 rule against pauses the player did not ask for. |
| 2026-10-10 | **The launch package for itch.io is made.** §2.34. | The founder, asked what stood between the build and a launch, and offered the package as the part that did not wait on them: "Yes, go ahead with the launch package." They also allowed the two downloads it needed, the engine and the typefaces. |
| 2026-10-07 | **The wide arena becomes the default.** §2.33. | The founder, after playing both and having the wide one made harder: "Merge PR 12 and make wide the default." The fixed arena stays, behind `?arena=fixed`. |
| 2026-10-07 | **The wide arena is made harder.** §2.33. | The founder played it on a phone: "Yes, it is easier. Increase power radii by 30% across all levels. Add 5% across each subsequent sector. Add the number of creeps (randomly) across each levels as well. Phone performance looked good on my iPhone 16 Pro Max." "Power radii" was read as the reach of the bosses' slams. Applied to the wide arena only. |
| 2026-10-06 | **A wide arena with the camera following, offered beside the fixed one.** §2.33. | The founder: "I saw in Brotato that the player moves around and the screen moves around with them denoting that the player is travelling an infinite arena while moving around and attacking. Can we implement that? Will make it more fun rather than a static screen." Built as an option, `?arena=wide`; the default is unchanged until they have tried it. |
| 2026-10-06 | **Each depth bites; the first run is thinned.** §2.30, §2.12.1. | The second assessment (`design-document.md` §1.4) found depths 2 and 4 no harder than depth 1 and the first three minutes overloaded. The founder: "Depth - add 4% enemy health and a random extra creep every few waves to add to the complexity", and "Yes for thinning the first run". Health only was asked for, so damage does not ramp. |
| 2026-10-06 | **The player names the hero; "Kiran" is dropped.** §2.32, §2.12. | The founder: "Let's not name our character Kiran - don't like that. Let the gamer add a nickname for themselves and that can be the name of the player." This builds the naming half of pinned P2. Four Sanskrit words remain in the default names: Asura, Vritra, Nidhi, Tejas. |
| 2026-10-06 | **The carved floors become the default.** §2.10. | The founder, after seeing both sets side by side: "Carved as the default is nice. Go ahead." The line-drawn set stays, behind `?floors=classic`. |
| 2026-10-06 | **Title screen: made art is to be explored.** §2.21. | The founder's answer to "keep the drawn title screen, or replace it with made art". Three directions, prompts and a layout guide are in `docs/art-prompts.md` §1; the pictures are theirs to make. |
| 2026-10-06 | **The health bar moves over the hero's head.** §2.9. | "There should be an HP bar on top of our player instead of at the top of the screen." |
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
  - **Founder's first verdict on a phone (2026-10-06):** the tells are "maybe too fast for me, but I wasn't being fully attentive, so let's keep that for now". Nothing changed. If it comes up again, the first things to try are a longer open window and a larger label.
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
| `classic` | The line-drawn floors of 2026-10-02 and the saw-tooth stair frame | The default until 2026-10-06; now behind `?floors=classic` |
| `carved` | Weathered stone shaded pixel by pixel, carving lit by one sun, and a scene per level. The stairs round the arena are drawn as stairs: three courses of dressed stone, lit risers on two sides, shadowed on the other two | Offered 2026-10-04. **The default since 2026-10-06**, chosen by the founder from a side-by-side of both sets |

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
- Runs in-browser via Phaser 3, no build step, portrait-oriented canvas (mobile-first). Since 2026-10-10 the engine is a file beside the game (`game/vendor/`, §2.34), not fetched from a CDN.
- **High-DPI rendering (added 2026-09-24).** The game reasons in 400×700 world units, but the canvas backing store is `RES` times that, and the main camera zooms back in by the same factor — so no coordinate in the source had to change. `RES` is derived from `devicePixelRatio`, clamped to 2–3.

  Without it the canvas was literally 400×700 real pixels stretched across ~1179 device pixels on a modern iPhone: a ~3× upscale, which is exactly the softness that prompted this. Text carries a matching `resolution` so glyph textures are rasterised at device scale rather than world scale, and pointer input reads `worldX`/`worldY` rather than `x`/`y`, which are canvas-space and would be `RES` times too large.
- Target frame budget: smooth on mid-range mobile browsers (no confirmed performance testing yet — flagged as an open item, not a verified requirement). The `RES` clamp of 3 exists for this reason: beyond it the backing-store cost stops buying visible sharpness.

### 2.12 Naming & Cultural Layer

**The default is the hybrid pack since 2026-10-04** (§1.7): English for everything a player must understand at a glance (phases, enemy types, weapons, levels, boons), and short Sanskrit words kept as the game's own: Asura, Vritra, Nidhi, Tejas. There were five until 2026-10-06, when the hero's name, Kiran, was dropped: the player now names the hero (§2.32), and where these documents still say "Kiran" they mean the hero. Its loading cards carry no Devanagari. The Sanskrit pack described below remains, one line or `?names=sanskrit` away; `?names=plain` removes the last five words too.

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
**Since 2026-10-10 five of these tips are teaching pauses instead (§2.35):** move, loot, boon, core and slam stop the fight, light the thing itself and explain it. The other ten work as described here, and so do those five once a player has skipped the pauses.

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
| hunted | first time the pack runs the hero down (§2.36) |

- **Two tips wait for level 2 (2026-10-06, `HELD_TIPS`).** The tribute and satchel tips are not shown while a player is on level 1 and has never finished a run that reached level 2. They are not marked as seen, so each appears the next time it applies. Level 1 already teaches moving, loot, boons, the phases, the Gatekeeper's rule, slams and the shield; these two can wait, and both things keep working untold. (Power was named with them when this was proposed; it has no tip, so there was nothing to hold.)
- A tip counts as seen only once it is **displayed**. One that waits more than 10s in the queue is dropped unseen, and it returns the next time its moment comes. (The first version marked tips seen on arrival, and eight arrived in the first 25 seconds.)
- Seen tips live in `session.hintsSeen`, so "Reset save" re-arms them. Settings has a **Tutorial** on/off switch, which covers the pauses as well as the tips, and a **show it all again** button.

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
**Status, 2026-10-06:** the founder confirmed on their phone that the sound effects work (the iPhone fix of 2026-10-03 below had been unverified until then). **2026-10-05:** sound effects are in and stay. Music is switched off (`MUSIC_ON = false`) and stays off for the itch.io launch: the founder found that the first tracks' transitions were not continuous and that some did not suit the game, judged free music not good enough, and will consider buying it after launch (`design-document.md` P10). The music engine described below remains in the code.

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
- **Loading.** Canvas text cannot swap fonts after it is drawn, so the game does not start until the faces have arrived, with a 3.5 s cap so a font file that fails to arrive never stops the game (it falls back to system fonts). Since 2026-10-10 the faces are files beside the game (`game/vendor/fonts/`, §2.34), not fetched from Google Fonts.
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
**Since build 0.14 (2026-10-10) the backdrop is a picture** (`game/assets/title-art.jpg`, `TITLE_ART`): the founder's own, made with ChatGPT, of a stepwell seen from above. It is laid across the screen and moved up by 100 so that its glowing pool lies under DESCEND, and from 545 down it fades into the dark that the menu sits on ("fit 2" of the three shown, `concept/title-2026-10-10-fit-*.png`). Everything else on the screen is where it was. The embers and the glow under DESCEND still move over it. The shaft drawn in code, described below, is no longer seen, and with it went the pool that rose as water was won; the line "The well is N% full" still says it. If the picture's file is missing the drawn shaft shows instead. The picture is AI-generated, which the itch.io page must say (`docs/itch-page.md` §4).

Launch track L2, first design. **One screen, not two:** the title, the way into a run and the two upgrades share it, because a title in front of a separate hub would put three taps between a player and a fight. It replaces the plain menu that was drawn over the arena.

- **Backdrop:** the view straight down the stepwell shaft. Seventeen square tiers of stairs shrink toward a glowing floor, each turned slightly more than the last, and the whole shaft sinks forever (a tier every 5.2 s) with embers rising.
- **DESCEND** is a round button on the glow at the bottom of the well: the player presses the light they are falling toward.
- Below it: deepest descent, Nidhi, the Vitality and Power cards (gold-edged when affordable), the locked-powers count, then Powers, How to Play, Settings and Feedback.
- It is built in code, with no image files. The founder will judge it and may replace the backdrop with art made from `docs/art-prompts.md`.
- **2026-10-06: the founder chose to explore made art.** `docs/art-prompts.md` §1 gives three directions with prompts, and `docs/title-art-layout.jpg` shows which parts of the picture the title, the DESCEND button and the menu sit on. The drawn shaft stays until a picture is chosen. If a picture deserves more room than the middle third, the two upgrade cards can move to a screen of their own; that is not built.
- Since 2026-10-06 a small chip above the title says who is descending: the player's nickname, or "Name yourself" (§2.32).

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
**Since 2026-10-10 tribute grows heavier (`TRIBUTE.step`, `TRIBUTE.heavier`; §2.36).** It is paid for as long as the boss lives: Nidhi, items and the count on his name never stop. The price used to stop rising after about a minute, when the summons reached their fastest; that made a boss an endless and nearly safe supply. Now, past the gold boon, every 5 more tribute makes what he summons 12% tougher and 12% harder-hitting than the plain ones, and 4% quicker on their feet (`TRIBUTE.faster`), with no ceiling: 1.12 times at 20, twice at 60, 3.4 times at 115. A line says so at each step ("TRIBUTE 20 - HIS SUMMONS GROW STRONGER"). How far to take it is the player's to judge, and to learn.

The speed is what makes it end. Toughness and weight of blow never troubled a player who was not touched. The first Gatekeeper's summons run as fast as a hero with no boons at about tribute 215, and no one outruns them after that; a deeper boss's summons start faster and get there sooner (about 135 for the Gatekeeper on level 2, about 70 for Vritra, on the first depth). So each boss has its own height, which is what makes the number worth keeping (§2.37).

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

**Every depth past the first also adds two things** (2026-10-06, the founder's figures, after the bot found depths 2 and 4 no harder than depth 1):

- **Enemy health +4% a depth** (`DEPTH_HEALTH`): +4% at depth 2, +12% at depth 4, +24% at depth 7, on every enemy and boss. Damage does not ramp.
- **Strays** (`STRAYS`): one extra enemy of a random kind joins some waves, whatever the wave's shape, and of a kind the wave does not already field when there is one: a Brute in a swarm, a Hexer behind a pincer. At depths 2 and 3 one comes every two or three waves; at 4 and 5 every one or two; at 6 and 7 every wave. The wait varies so it cannot be counted, and the wave's own announcement names the stray ("FROM BOTH SIDES · A STRAY HEXER"). Boss waves have none.

| Depth | Name | What it adds | Nidhi |
|---|---|---|---|
| 1 | The First Descent | The game as it was | as before |
| 2 | Swift | Enemies move 12% faster | +20% |
| 3 | Thin Air | Beating a boss heals 20% of health, not 35% | +40% |
| 4 | Wrath | Bosses slam a quarter more often | +60% |
| 5 | Horde | Two more enemies in every wave | +80% |
| 6 | Restless | Convergence every 60 seconds, not 90 | +100% |
| 7 | The Serpent's Own | Everything hits 20% harder (its 20% more health became part of the 4%-a-depth ramp on 2026-10-06) | +120% |

- **Choosing.** The title screen shows the depth about to be played, its name and its hardship, on a glass strip under DESCEND, with a third line for what the depth adds and pays ("+8% enemy health · a stray in some waves · +40% Nidhi"). Once a second depth is open, arrows step between the open ones. It defaults to the deepest one open. No new art is needed: a depth is the same three levels under harder rules.
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

### 2.32 The player names the hero (2026-10-06)
The hero has no name of their own. "Kiran" is gone from everything a player reads; the founder did not like it and asked that players give a nickname instead. This is the naming half of pinned P2 (`design-document.md` §1.1); building looks stays pinned.

- **Giving a name.** A chip at the top of the title screen reads "Name yourself", in gold, until a name is given, and "<name> · rename" after. Tapping it, or the name on the Profile at the top of the well, opens a small dialog with one text field. It is a real text field (`Namer`), because the engine has none and a phone's keyboard only opens for a real one; the game's own keys are switched off while it is open, as for Feedback.
- **Nothing is forced.** The game never stops to ask. A player who never names themselves is "Hero" (`player` in the name pack; "Veer" in the Sanskrit pack), and saving an empty field goes back to that.
- **What a name may be:** up to 14 characters in any script. Line breaks, control characters and angle brackets are removed and runs of spaces closed up.
- **Where it shows:** the title-screen chip; the Profile's heading, in capitals, shrunk to fit beside the Power number when long; the victory screen ("Meera has slain Vritra."); and the loading screen's card about the hero. An unnamed player's card ends "Name yourself on the title screen."
- **Where it does not go:** anywhere off the device. It is kept in the save and is not added to feedback messages. If names are ever shown to other players (the daily descent, P9), they will need a filter first.
- How to Play now speaks to the player ("you walk there", "you strike") where it named the hero.
- The hero's art files and the code's `CHARS.player` keep the old name; nothing a player sees does.

### 2.33 The arena: one screen, or wide with the camera following (2026-10-06)
Until now the arena was the screen. The founder saw Brotato's screen move with the player and asked for the same, reading it as an endless arena.

**What Brotato does, and what was built.** Brotato's arena is not endless: it is a walled arena larger than the screen, and the camera follows the player. That is what this is. A floor with no walls was not built, for two reasons. The game is a descent down a well, and each level is a landing with stairs round it. And its fights assume walls: a wave is a fixed number of enemies, and bosses are slow, or rooted behind a shield; with nowhere to be cornered a player simply outwalks them.

**It is the default since 2026-10-07** (`ARENA_MODE = 'wide'`), chosen by the founder after playing both arenas on a phone and having the wide one made harder. It is 1.6 times the screen in each direction (544 by 902 against 340 by 564). `?arena=fixed` plays the old one-screen arena. (Until 2026-10-10 any number from 1 to 2.2 could be asked for as well; a bigger arena is an easier game, so only the two named ones remain, §2.36.) It was offered as an option on 2026-10-06 (`?arena=wide`) and became the default the next day.

How it works:

- **The camera** keeps the hero in the middle of the window under the HUD, easing after him, and stops at the walls. Outside a run it sits still, so the title screen and every menu are as before.
- **Two rectangles.** `viewBounds` is the window: the part of the screen under the HUD. `arenaBounds` is the arena. In the fixed arena they are the same rectangle, which is why that arena plays exactly as it did.
- **What stays on the screen:** the HUD, the wave track, the satchel tab, the + button, the Tejas button, tips, announcements, the level banner, the red flash when hit, and every panel. Each is pinned (`fix`, `ov`, `uiObjects`). In a wide arena the HUD is also lifted above everything that fights, because the arena now passes underneath it.
- **The floors are the same paintings**, painted finer and shown larger, with their lights and the stairs round them scaled to match. Nothing was redrawn.
- **Enemies come in just beyond what is seen** (or at a wall, where the wall is nearer), so they reach the hero as soon as they always have and are never seen appearing. **Bosses enter at the top of what is seen.**
- **Arrows** at the window's edge point to a boss that is out of sight, and to the last three enemies of a wave, so a wide arena never becomes a search.
- A held finger keeps steering as the camera moves; a tap still means "walk there".

**What the bot makes of it.** Target level 3; the bot plays the two arenas the same way and is far weaker than a person, so read the rows against each other.

| Character | Arena | Runs | Health lost on level 1 | Died on level 1 | Reached level 3 | Slew Vritra | Run length |
|---|---|---|---|---|---|---|---|
| New player, picks at once | fixed | 32 | 74% | 1 | 13 | 1 | 3.8 min |
| Some upgrades (6/6) | fixed | 24 | 28% | 0 | 20 | 6 | 3.4 min |
| New player, picks at once | wide | 32 | 62% | 1 | 18 | 2 | 4.1 min |
| New player, picks at once | wide, made harder | 32 | 68% | 1 | 18 | 2 | 4.5 min |
| Some upgrades (6/6) | wide | 24 | 22% | 0 | 24 | 12 | 4.5 min |
| Some upgrades (6/6) | wide, made harder | 24 | 28% | 0 | 23 | 7 | 4.4 min |

**Reading.** The wide arena is the easier of the two for the bot, as more room to run would suggest: with some upgrades it slew Vritra in 12 runs of 24 against 6 of 24, and every one of those runs reached level 3; a new character reached level 3 in 18 runs of 32 against 13. Runs last about half a minute to a minute longer. The usual caution applies to the counts, but both batches and both characters lean the same way. If the wide arena becomes the default, the difficulty needs another look with it.

**Made harder (2026-10-07, `WIDE`).** The founder played it and agreed it was easier, and gave the changes. They apply in the wide arena only; the fixed arena plays as it did.

- **Slams reach 30% further** on every level, and 5% more on each level after the first: 1.30 times on level 1, 1.35 on level 2, 1.40 on level 3, rising to 1.60 in the endless levels and no further. The whole shape grows together: the ring's radius, the cleave's length and width, and the scatter's eruptions with the gaps between them. Wind-up times are unchanged, so the larger zones leave less time to spare.
- **Waves are larger by a number left to chance:** one to three more enemies in each wave on level 1, one to four on level 2, one to five on level 3. A first-ever player's two opening waves are left alone.
- **What it did, by the bot** (the "wide, made harder" rows above): with some upgrades, Vritra slain in 7 runs of 24, against 12 before the change and 6 in the fixed arena, and the same 28% of health lost on level 1 as in the fixed arena. So the end of a run is now about as hard as it is in the fixed arena. The start is still a little kinder: a new character reaches level 3 in 18 runs of 32 against 13.

**Phone.** The founder played the wide arena on an iPhone 16 Pro Max on 2026-10-07: "Phone performance looked good." That is the fastest phone there is; the larger floors (2.56 times the pixels to paint and to hold) are still to be tried on a mid-range Android (`design-document.md` L8).

**Decided 2026-10-07:** the wide arena is the default. The difficulty figures above were measured on it before it became so; nothing else changed in the switch.

### 2.34 The itch.io package (2026-10-10)
What is uploaded to itch.io, and what goes on its page. `docs/itch-page.md` is the working copy: every field of the form, the text to paste, and the checks to make after the upload.

**The game no longer fetches anything.** Until now the engine came from cdnjs and the two typefaces from Google Fonts on every load. Both are now files in `game/vendor/`, with their licences beside them, and the live site uses them too, so there is one build and not two.

- **The engine** is the published `phaser.min.js` 3.70.0, byte for byte: its checksum was compared with the one cdnjs publishes before it was added, and `.gitattributes` keeps git from touching it.
- **The typefaces** are the six files Google Fonts serves for Baloo 2 and Yatra One (Latin, extended Latin and Devanagari for each; 273 KB), declared in the page with the same ranges, so a browser still fetches only the ones a screen uses.
- The only address the page can still contact is the feedback form's mail relay, and only when a player sends feedback.

**The zip** is made by `tools/build-itch.py`: the game page as `index.html`, the sprites and sounds, `vendor/`, and a `CREDITS.txt`. 89 files, 2.5 MB. The music is left out: it is switched off, it is 7 MB, and Pixabay's licence does not allow it to be handed out on its own. The build stops if the page names an outside address that is not on its short list, if a file the page asks for is absent, if an unexpected file sits in a folder it copies, or if itch.io's limits are passed.

**The pictures** are taken from the built folder by `tools/store-shots.mjs`, headless and muted, with a returning player's save so the well and perks show. A script steers the hero and keeps him alive; a fight is never the same twice, so each scene saves several candidates to choose from. Kept in `store/itch/`: five screenshots (title, a level 2 fight, the Hoard Guardian's cleave, Vritra's ring slam, choosing a boon), a five-second GIF (`tools/make-gif.py`; 240 by 420 and 2.6 MB, under the 3 MB an image may be), and a draft cover (`tools/make-cover.py`; 630 by 500). The cover is the one posed picture: the serpent is stood still beside the hero and the HUD is left out. It takes its title from `GAME_TITLE`, so it is a draft until the name is final.

**The page text** follows the rules for anything a player reads (§2.12). The generative AI disclosure is answered as it is: code yes, text yes, graphics no until a generated picture goes in, sound no.

**Found on the way:** the How to play card for boons still said the fight pauses after every wave. It now says what happens: a boon waits behind the + button.

**Not done here, on purpose:** the upload (the account is the founder's), the name, the FormSubmit alias, the Android check, and the security pass (L11), which is run just before the upload and not before.

### 2.35 Teaching pauses (2026-10-10)
The first-run tutorial was fifteen small tips in a corner while the fight went on. The founder asked for something that cannot be missed: the game pauses, the thing is highlighted, a popup explains it; it can be skipped; it happens the first time, and can be gone through again. `docs/tutorial-lessons.jpg` shows all five as a new player meets them.

**Five ideas get a pause, once each, ever** (`LESSONS`). The rest stay as corner tips (§2.12.1).

| Lesson | Comes when | What is lit | What it says |
|---|---|---|---|
| Moving | the level's banner has gone, about two seconds into a first run | the hero | tap or drag (or the keys); you strike on your own, so your job is where to stand |
| Loot | the first named drop is on the ground and on the screen | the drop | walk over it; copper, silver, gold |
| A boon is waiting | the + button has arrived after the first cleared wave | the + button | every wave earns one; tap + whenever you like |
| The timer over a boss | the first Gatekeeper's timer has been up for a second | the boss and his timer | he can only be hurt properly some of the time; the wording follows whether he is open or resisting |
| A slam is coming | the first red zone has been drawn | the zone, the boss and the hero | the fill grows, and it lands at the edge; get out of the red |

How it works:

- **The fight stops completely** (`state === 'lesson'`): clock, tweens, spawns, the boss's own timers.
- **The screen is dimmed and the subject left lit.** A dark sheet is laid over everything, the HUD included, and soft-edged holes are rubbed out of it over the subject. A gold ring breathes round a single subject.
- **The panel** sits on whichever side of the subject has more room, points at it, and never covers it. It carries the word TUTORIAL, a title, two or three sentences, **GOT IT**, and a smaller **skip the tutorial**.
- **The buttons take half a second to wake** (`LESSON.hold`). The fight has just stopped under a moving thumb, and a tap already on its way must not answer for the player. On a computer Enter, Space, Esc and P do what GOT IT does.
- **Lessons keep four seconds of play apart** (`LESSON.gap`), a slam first among those waiting. One whose subject is not on the screen waits up to ten seconds for it (`LESSON.patience`), then gives up unseen and comes back the next time that thing happens.
- **The first slam is a gentle one.** The slam being taught starts its wind-up again and takes twice as long (`LESSON.slamGrace`), so there is time to read and then to move. A Gatekeeper who has just been explained holds his first slam until its own lesson can follow.
- **Skipping stops the pauses, not the teaching.** `session.lessonsOff` is set, a corner tip says where to find them again, and those five ideas then arrive as corner tips, as they did before.
- **Going through it again.** How to play, from the title screen or the pause menu, has a **REPLAY TUTORIAL** button: it arms all five again and each plays the next time its moment comes. "Show it all again" in Settings does the same for every tip. The Tutorial switch in Settings turns pauses and tips off together.
- A player whose save already had these five tips marked as seen gets no pauses until they ask for the replay. That includes the founder's own save.
- The playtest bot runs silent and is never taught.

**What a first run looks like.** In three scripted first runs the five came at about 3, 11 to 13, 16 to 21, 22 to 27 and 28 to 33 seconds: a first-ever run opens with two small waves, so the Gatekeeper is there within half a minute. That is five stops in the first half minute and none after. Whether that is too many in a row is for the founder to feel on a phone; `LESSON.gap` is the one number that spreads them out.

**Found on the way:** a lesson about a boss standing exactly at the top edge of the screen never came, because the test for "on the screen" asked for a margin he did not have. He now counts as on the screen.

### 2.36 Free rides: ways of getting by without playing (2026-10-10)
The founder asked for the game to be tested for pseudo-cheats, giving one as an example: keep moving round the walls and stay alive without effort. This section is what was looked for, what was found, and what was done.

**How it was tested.** The playtest bot gained players who do not play (`style` on a profile): `lap` runs round the walls and never stops, `stutter` does the same but stands for a moment whenever it is being run down, `circle` runs a ring round the middle, `corner` stands in one, `still` never moves, and `milk` plays properly but will not kill a Gatekeeper, only what he summons. None of them reads a slam or a bolt. `node tools/lazy-players.mjs` runs them beside the bot that plays and prints one line each. A lazy style that lives as long, gets as far or earns as much as the one that plays is a hole. The usual caution holds: the bot is weak and its counts are noisy, so lines are read against each other.

**What was found** (new character, depth 1, wide arena; 8 runs of each before and 16 after; stopped at 12 game minutes):

| Style | Before | After |
|---|---|---|
| plays properly | all 8 died, at 3.9 min; 8 reached level 2, 4 level 3; 608 Nidhi a minute | all 16 died, at 4.5 min; 15 reached level 2, 6 level 3; 535 a minute; **never once run down** |
| `lap`, round the walls | **2 of 8 outlived the 12 minutes** (4 of 6 in another batch), and the eight lasted 9 on average; 2 kills; 7 Nidhi; 10% of health lost a minute | 15 of 16 died, at 2.7 min on average, none reaching level 2; one outlived the 12 minutes at the first Gatekeeper, earning nothing |
| `stutter` | not tried | all 16 died, at 1.2 min |
| `milk`, a Gatekeeper kept alive | 5 of 8 outlived 12 minutes; tribute 277 (480 in a 15-minute batch); 2,282 Nidhi; 11% of health lost a minute | (12 runs, stopped at 20 minutes) all 12 died, at 4.3 minutes on average, with tribute between 18 and 200; 224 Nidhi a minute against 587 for playing; 48% of health lost a minute |
| `circle`, a ring round the middle | all died, at 3.4 min, none past level 1 | the same |
| `corner`, `still` | all died within 20 seconds | the same |

**1. The runner (real, closed).** Nothing in the well is as fast as the hero: chasers move at a third to a half of his speed, and a bolt is aimed where he is, not where he will be. So a player who ran round the walls of the wide arena could be touched by almost nothing, for as long as they liked. They also hurt nothing and earned nothing, so it won no games; but it was a free time-out, and with a Healing Herb a free full heal.

*The rule now (`HUNT`): no rest for a runner.* While anything is chasing the hero, the game counts how long it is since he struck a blow. At six seconds, if he is running and not making for the nearest of them, **the pack runs him down**: every chaser sprints at 1.35 times his own speed whenever he runs, and walks whenever he stands. It lasts until one of them lands a blow on him, blocked or not, or they are all dead. Then the six seconds start again.

- A player who is fighting never meets it. Any blow he strikes clears the count, including one a shield or a resisting boss shrugs off. In 42 runs of the bot that plays properly, across three kinds of character, it happened once.
- Standing for a moment and running on is not a way out: only being caught, or killing them, ends it. (A first version did end it after half a second of standing still, and `stutter` walked straight through that.)
- Hexers and bosses neither start the count nor sprint. Shield anchors and elites sprint but keep their own colour.
- The tell: a line across the top, "THE PACK RUNS YOU DOWN - TURN AND FIGHT", a warning note, the chasers turn red while it lasts, and a corner tip the first time.
- It is one switch, `HUNT.on`.

**2. A boss kept as a cow (real; the price now rises with the pay).** A boss summons two Asura every nine seconds, quickening to every three and a half, for as long as he lives; each pays Nidhi, an 18% chance of an item, and tribute. The quickening was the price of waiting, and it stopped after about a minute while the pay went on. A bot that refused to kill the first Gatekeeper took 480 in tribute and 3,700 Nidhi in fifteen minutes while losing a tenth of its health a minute.

*A first fix stopped the pay at tribute 15. The founder rejected it the same day:* farming before a descent is a way of building that they want kept. *The rule now:* the pay never stops, and past the gold boon the summons grow 12% tougher and harder-hitting and 4% faster for every 5 more tribute, without end (§2.26). Farming is still worth doing, pays less than half as fast as playing on, and ends when the player misjudges it or the summons outrun him.

*The speed was added second.* With toughness alone, two new characters in twelve kept the first Gatekeeper alive for the full 20 minutes at a tribute of about 265: summons that hit seven times as hard do not trouble a player they never touch. The founder said yes to speed. With it, all 12 new characters died, the best at tribute 200, and all 10 with six ranks of each upgrade died, the best at 143.

**3. Three small ones, closed.**
- *A slow slam on request.* REPLAY TUTORIAL (§2.35) armed the slam lesson again, and with it the slam that takes twice as long to land: four taps before any slam bought a slow one. The slow slam is now given once in a save (`session.slamTaught`); the lesson itself can still be replayed.
- *The arena's size in the address.* `?arena=2.2` asked for an arena nearly twice the area of the real one. Only `fixed` and `wide` are taken now.
- *Health below nothing.* Taking a Life Gem off in the satchel removed its health from a hero who had less than that left, leaving him on a negative number until the next blow. It now leaves him on 1.

**4. Tried and found shut.**
- *Standing still, or in a corner:* dead within 20 seconds, at every upgrade level tried.
- *Closing and reopening the boon panel for a new offer:* the offer is drawn once and kept.
- *Swapping trinkets in the satchel for health or a fresh shield:* the health given is taken back, and a newly worn Aegis starts empty.
- *Changing perks in the middle of a run:* the Profile only allows it at the top of the well.
- *Leaving the game instead of dying:* a run's Nidhi is banked only when the run ends, so closing the tab keeps none of it, where dying keeps half.

**5. Left as they are, and why.**
- *Clearing level 1 and extracting, over and over.* It is the safest way to earn, and it is the Extract-or-Descend choice working as designed: it pays less than going on, and wins no depth.
- *Running rings round a boss while killing what he summons.* This is tribute, and it is meant to be there (§2.26): the player is fighting the whole time, and it now costs more the longer it goes on.
- *Editing the saved game in the browser.* A player can give themselves anything; it harms no one while nothing is shared (`pre-launch-security-checklist.md`, line 8).

**To judge on a phone:** whether six seconds and 1.35 feel right, and whether the first time it happens reads as fair. A new player who runs from everything will meet it in their first minute.

### 2.37 Records (2026-10-10)
Kept in the save from build 0.13 on, and shown nowhere yet. They exist so that the badges pinned as P13 (`design-document.md`) can be given for what a player did from launch day: a feat that was not counted on the day cannot be counted later. The founder asked for the first; the other four were added with it for the same reason.

| Record (`session.records`) | What it holds |
|---|---|
| `tribute` | the most tribute ever taken from each kind of boss: Gatekeeper, Hoard Guardian, Vritra |
| `bosses` | how many of each kind have fallen |
| `runs` | runs begun |
| `slain` | enemies slain |
| `bestHaul` | the most Nidhi banked from one run |

- A tribute record is written to the save at every fifth step, so it survives a tab closed before the run ends; everything else is written whenever the game next saves.
- A save from before records gains them empty. Reset save empties them.
- The game already kept what else a badge might want: depths won, Vritra slain (`wins`), the deepest level reached, perks earned.
- The playtest bot puts the save back as it found it, so its runs are not counted.

### 2.39 The founder's own characters: the hero and the Asura (2026-10-10)
(§2.38 was the cast rendered from free 3D models. It was never merged: see "The look is chosen" below.)

The founder had the hero and the Asura designed with ChatGPT, in a look its notes call Well Delver: low-poly figures painted as if rendered in 3D. The hero wears cream with a teal head-wrap and scarf and a terracotta sash, and carries a spear. The Asura is charcoal indigo with rust-orange armour, one horn and a blade. Each came as a **turnaround**: one picture of the figure from the front, the back and the right side (`game/assets/incoming/well-delver/`). That tool also cut them into the game's files, and wrote a handoff asking for those to be copied over the stock hero and Asura with nothing else changed. The founder asked for the two to be looked at and fitted to the main game: "If this looks good, I will get the other characters designed similarly."

**What was found** (`concept/well-delver-2026-10-10-*`).
- The designs are the best the game has had, and they belong to the stepwell. On the profile screen the hero looked right at once.
- As cut, they did not work in a fight. These figures stand as people do, about half as wide as they are tall; the stock cast are squat, with large heads. Drawn at the stock size the hero was about 20 pixels wide on a 400-pixel screen and was lost on the sandstone.
- The Asura's side views carried a piece of a blade from the view beside it, because the turnaround had been cut in thirds and the blade reached across.
- The stills were 96 pixels, cut down from figures 700 pixels tall, so the profile screen showed them soft.
- The walk was the standing picture bobbing. That tool said so itself.

**What was done.**
- **A cutter of the project's own**, `tools/cut-turnaround.py`. It finds the three figures by the clear space between them; cleans the haze the background remover left; scales all three views by one amount and stands them on one line; centres each on its body, not on what it holds out; puts a soft shadow under the feet; and writes stills of 160 pixels and a walk sheet with cells of 192. The left view is the right view mirrored, as it was for the stock cast.
- **A walk made from the stills.** A turnaround has no legs in motion. Eight frames a facing, like every other sheet. From the front or back the standing picture is bent, smoothly: one leg shortens as its foot comes up and the weight moves over the other. **From the side the legs are cut free and swung.** The first version stretched the legs apart and squeezed them together, and the founder found it odd, rightly: the clothes swelled with every step and the feet slid both ways at once. Now the cutter finds the legs below the cuff (where they come out from under what is worn) as whatever there is joined to the ground, so a spear or a blade hanging by them stays with the body. Each leg swings from the cuff: forward in the air, back along the ground, one passing in front of the other, under a body that only rises and falls. The hero shows two legs from the side and each is moved; the Asura shows one, and the leg behind is a darker copy of it. Where the cuff is can be said for a figure in a small file beside its turnaround. It reads as stepping at the size a phone shows it. It is not drawn animation and would not pass for it up close.
- **Art that arrives one figure at a time** (`ART` in the game). A figure named there has files of its own size and is drawn larger; every other figure keeps its stock files and its size. So the cast can be replaced one at a time as designs come. The hero is drawn 1.5 times the stock size and the Asura 1.7: the hero stands about 57 pixels tall where the stock one stood about 40, and is still narrower than the stock one was.
- **Bars, names and the ring follow the figure.** The hero's health bar clears the head and the stance ring lies at the feet; an enemy's health bar, name, shield bar and "RESISTS" sit over its head and a boss's core glows at its feet, whatever art it has.
- **Nothing about the fight changed.** Hit circles, reach, speed, damage and spawning are as they were. A walk keeps the pace it had.

**Rules kept.** Enemies are antagonists and nothing revered (§2.12): the Asura has a horn, a blade and armour, and no crown, halo or sacred mark. Its skin is a dark indigo, the founder's own choice in their brief. The hero reads as a young woman; no line in the game calls the hero he or she, so nothing in the text needed changing. The hero's files keep their first name (§2.32).

**It is generated art.** Both pictures were made with ChatGPT's image generation, at the founder's direction ("ChatGPT made the pictures"). The itch.io page says so (`docs/itch-page.md` §4), and `game/assets/CREDITS.md` records it. OpenAI's terms give the person who made a picture the rights to it, commercial use included; that is to be read again on OpenAI's own page in the pre-launch pass, as for the title picture.

**The look is chosen (2026-10-10).** The same day, all seven figures had also been rendered from free 3D models (§2.38). The founder chose between them: "Yes, this is the look for the cast. You can close the relevant PR." The rendered cast's pull request (17) was closed without merging; its branch `cast-3d` is kept, with the Blender route and its tools, should a rendered figure ever be wanted.

**Not merged until the cast is whole.** "Wait until we get the entire characters." Until the other five are designed in this look this branch shows the new hero and Asura beside five stock figures, and the live game keeps the stock cast. What to give ChatGPT for the five is in `docs/art-brief-for-chatgpt.md`, as a prompt to paste: one turnaround each, the rules the cutting depends on, what each figure must read as, and, if ChatGPT can keep a figure the same from picture to picture, four poses of a side walk to replace the made one.

**Floors to match.** "I will also try to get the background images generated to match the character arts." The floors are painted by code today (§2.10). The same brief says what a picture must be to work as a floor: seen from straight above, 3:5, calm in the middle, darker than the cast, nothing loose that looks like loot. Nothing about the floors has changed.

**Known limits, told to the founder.**
- The walk is made, not drawn. The brief asks ChatGPT for real side-walk poses; if they match the figure they replace it.
- A turnaround shows a figure level with the eye, not from above. So did the stock cast.
- The left view is a mirror, so the spear and the blade change hands when a figure turns.
- Taller figures overlap more in a crowd, and the game draws them in the order they arrived, not nearest last.
- The profile screen enlarges a 160-pixel still; a larger portrait cut from the same turnaround would be sharper there.

### 2.20 Automated checks
- **`tools/playtest-bot.js`** plays complete runs with game logic only (about 80x real time) and records per-sector balance figures, errors and leaked objects (§2.14). Since 2026-10-10 a profile can name a `style`, a player who does not play (§2.36), and **`tools/lazy-players.mjs`** runs those beside the one that does.
- **`tools/smoke-test.mjs`** (2026-10-02) loads the game in a private, muted, headless Chrome with a throwaway profile; clicks through the loading screen; checks the fonts, the first teaching pause, the HUD, the abandon prompt, the death and extract payouts and the sector-banner cleanup; checks that all three music tracks load and that each sector paints its own floor; measures every text on the how-to, settings, Powers and title screens against its panel; checks the goal on the title screen, "Level 1 of 3" and the near-miss line, kills the final boss and confirms the win, the water and the full payout; checks that all name packs have the same entries and that the plain pack shows no Sanskrit (every boon card included); clears a wave and checks the boon pick (three cards, the fight frozen, a stray tap ignored, one reroll, the next wave), the numbers a set of boons promise, and Read the Slam on a live slam; opens the feedback dialog, types the game's own keys into it and confirms the message is posted (to a stub, so nothing is sent); checks the gold ring and arc that show on Kiran while Hold Your Ground and Read the Slam are live, and that the Boons tab lists six boons per metal clear of the Back button; checks that a cleared wave earns a boon without pausing, that the + button and the + key open the pick, that a pick can be put off without a free reroll, and that panels are frosted; checks power for gear, boons and a sleeping weapon boon, the HUD number, and the profile's stats; builds 300 waves and checks the six shapes, the no-repeat rule and the gentle first-ever opening; makes a boss summon and checks the tribute count, the extra item, the second pick and the pick before the choice screen; checks the well on the loading screen for a new save and for a save with water; checks that the first Gatekeeper arrives open, that a resisting boss says so, counts down and takes 30% on level 1 and 12% below, and that Vritra is the drawn serpent; wins a depth and checks the water, the next depth on the title screen, that a depth already won pays no water, that depth 2 is faster and richer and depth 3 heals less; checks that perks show on the profile, that two are worn and chosen by tapping, that each does what it says, and that an older save is carried into the depths, both when read in play and when the page loads with one; checks that every character but Vritra has a walk sheet, that each figure is drawn at the size its art asks for, that art of the game's own (§2.39) is cut to its own cell and still, and that Kiran and an enemy step through their walk frames and stand when they stop; runs four bot profiles, one without boons; checks that the hero's health bar sits over his head; checks that the carved floors are the default and that the classic set still paints when the address asks for it; checks that an unnamed hero is "Hero" with the old name nowhere on screen, that a nickname is cleaned, saved and shown on the title screen, the profile, the victory and the loading card, and that a long one is shrunk to fit; checks the health each depth adds, that strays come at the promised rate from depth 2 and never at depth 1, and that the tribute and satchel tips wait for level 2; checks that by default the camera never moves; reloads with `?arena=wide` and checks the arena's size, that the camera follows the hero and stops at the walls, that the HUD and every panel stay on the screen, where enemies and bosses come in, the arrow to a boss out of sight, that a real tap is read where it lands, the further reach of slams and the larger waves there, and three bot runs there; reloads with `?arena=fixed` and checks that the old arena is still one screen with the camera still and nothing made harder, with two bot runs; checks the teaching pauses (§2.35): that a first run stops to teach moving once the banner has gone, that the fight is frozen and the panel is pinned to the screen and clear of what it points at, that a tap already on its way is ignored, that lessons keep apart, that the other tips never stop the fight, that the taught slam takes twice as long, and that skip, replay, the Settings switch and the bot each do what they should, and that a replayed slam lesson does not slow the slam twice; checks the free rides (§2.36): that a runner is run down after six seconds, that the pack sprints only while he runs and stops when it catches him, that fighting, heading for the nearest enemy, Hexers and bosses never start it, that tribute pays for as long as a boss lives and grows 12% heavier and 4% faster for every five past the gold boon, that records are kept and an older save gains them empty, and that a Life Gem taken off leaves the hero on 1; watches every address the page fetches from start to finish, and checks that none is on the internet and none is missing; checks that the title screen shows its picture with the pool under the way in; and saves screenshots. 99 checks. Since 2026-10-07 the whole test runs in the wide arena, which is the default. `node tools/smoke-test.mjs`. Since 2026-10-10 it takes the page to test as a second argument, so the same checks run against the folder built for itch.io: `node tools/smoke-test.mjs "" dist/itch/index.html`. It needs Chrome or Edge and Node 22+, and no packages. It exists so testing never plays sound on, or takes over, the machine someone is working on.
