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
| P2 | **Name your character + look-builder loading screen** — ▶ *profile screen started 2026-10-04 (`requirements.md` §2.28); naming built 2026-10-06 at the founder's request (§2.32); looks still pinned* | 2026-09-24 | The player names the hero and builds cosmetic looks for a loading/character screen (reference: Destiny 2's character screen). Cosmetic only — no stat effect. | Intended as a social hook: players styling and sharing their character. Needs its own interface and a cosmetics pipeline, which depends on art that does not exist yet (P4). |
| P3 | **First-run tutorial** (= M8.5) — ✅ *built, see L4* | 2026-09-24 | A live tutorial teaching each system during Wave 1. | Mechanics are still moving — teaching a system that changes means rewriting the tutorial each time. |
| P4 | **Commission custom Indian art** | 2026-09-24 | Replace the CraftPix European-fantasy roster with commissioned art that carries the Indian identity visually, not just by name. Est. ₹3,000–8,000 (`requirements.md` §2.13). | Only once the itch.io release shows the game has an audience. |
| P5 | **Full visual-story polish** | 2026-09-24 | A broader art and narrative pass across the whole game. | Explicitly tied to the game reaching "critical mass". |
| P6 | **Real-device performance check** — ▶ *due, see L8* | 2026-09-24 | Profile on an actual mid-range Android and an iPhone. `RES` caps the canvas at 3× (1200×2100 buffer), untested on budget hardware. | Should happen **before** the itch.io launch, not after — this one is a pre-launch gate, not a someday item. |
| P7 | **Bhagya chart** | 2026-10-02 | A chart cast at the start of each run: four boons, one tied to each Cosmic Cycle phase (for example, "during Grahan, kills heal"). Shown in full up front so the player plans around it, and switched on one boon at a time at each Extract/Descend screen, which is one more reason to Descend. It is our answer to Asura's procedural skill tree, whose known weakness was that a run's strength depended on the luck of the deal. Named *Bhagya* (fortune): "Kundali" was avoided because astrology is a living practice and the planets are worshipped. | After itch.io (founder, 2026-10-02). It deepens the Cosmic Cycle and needs real players' feedback on the base game first. |
| P8 | **Boss-kill perks** — ✅ *built 2026-10-05, widened to eight perks (`requirements.md` §2.30)* | 2026-10-02 | The first kill of Bakasura, Nidhi-Raksha and Vritra each unlocks one permanent perk the player can equip, after Asura: Vengeance Edition's "Chakra" system. It rewards skill, where the Vitality and Power upgrades reward accumulated Nidhi. | After itch.io (founder, 2026-10-02). Brought forward by the founder on 2026-10-05 as the rewards for the seven depths. |
| P9 | **Daily descent** — 🔔 *remind the founder once the itch.io page is live* | 2026-10-05 | One run a day that is the same for everyone: the same waves, shapes, drops and boon offers, from a seed made of the date. One attempt counts, and the result (depth, level reached, time, Nidhi) is shown as a line to copy and share. It gives a reason to open the game tomorrow and something to compare with a friend, and needs no account and no server until a shared leaderboard is wanted. Needs first: a seeded random source in place of the engine's (every roll in a run), and a decision on which depth the daily is played at. | "We will develop it post launch on itch.io (remind me)." It is the fourth of the four retention options offered on 2026-10-04; depths (the spine) and perks (the rewards) were built first. |
| P10 | **Buy music** — 🔔 *remind the founder once the itch.io page is live* | 2026-10-05 | Licensed music bought for the game, in place of free tracks. What went wrong with the first attempt, in the founder's words: "Transitions weren't continuous plus the style for some tracks were not good." So the brief is one continuous piece, or stems that layer, in place of separate tracks swapped at the hub, a fight and a boss; and a style chosen by ear before anything is wired in. The engine for it is still in the game, switched off (`MUSIC_ON`). | "Freeware is still not good enough ... We can think about buying music post launch on itch.io (remind me)." Music stays off until then; the sound effects stay. |
| P11 | **Five outside players** | 2026-10-06 | Put the current build in front of five people who have never seen it and read what comes back through the feedback form (activated and checked 2026-10-06). Every judgement of adoption and retention so far is argued from the screens, the genre and a bot; only the founder has played. Proposed as the first thing to do after the second assessment (§1.4). | "Five outside players, let's put a pin on that" (founder, 2026-10-06). No date set. It is the founder's to do: the game needs nothing built for it. |
| P12 | **Cosmetic drops for feats** | 2026-10-10 | Looks for the hero on the profile screen that are earned, not bought, starting with tribute: how far a player pushed a boss before killing him. The founder: "In the future, we can design cosmetic drops based on these which will make the player's looks on the profile screen more attractive earning them bragging points." Cosmetic only, no effect on the fight. Advice given and not yet answered: give them at thresholds (a tribute of 50, 100, 200 from a named boss) and not as chance drops, and start with what code can draw (titles, auras, name colours) before anything that needs art. The best tribute from each kind of boss is recorded from build 0.13 on (`requirements.md` §2.37), so feats from launch day will count. | After the itch.io launch. Bragging needs someone to show it to, and today only the player sees their own profile: it pays off once there is a shareable profile card or the daily descent (P9). It also builds on the look-builder (P2) and needs the hero art the founder is making. |
| P13 | **A badges tab on the Profile** | 2026-10-10 | A tab of its own in the Profile holding simple badges, one for each kind of achievement. The founder: "Maybe let's design the badges tab separately in the profile section where we can keep simple badges for each kind of achievement." To be designed as its own piece of work: which achievements, what a badge looks like earned and unearned, and how a new one is announced. It is the plainer first step toward P12. What the game counts for it today is listed in `requirements.md` §2.37. | Not started: the founder asked for it to be designed separately, and no date was set. Nothing blocks it; the records it needs are already being kept. |

## 1.2 Launch track — itch.io POC (added 2026-09-27)

Founder call, 2026-09-27: gameplay is ~99% done for the POC. That meets the condition P1 and P3 were waiting on ("mechanics final"), so both move from pinned to **due**. What stands between the current build and an itch.io page, in order:

| # | Item | State today | Done when |
|---|---|---|---|
| L1 | **Game name** | **Working title: Anantarya** (founder, 2026-10-02: "will give name later"). One constant, `GAME_TITLE`, renames the loader, hub and browser tab; `index.html` carries its own copy. Earlier candidates: "Loot Chase" (generic, pre-pivot) and the repo name "Tantra" (reads as sexual/new-age to a Western audience, and is a religious practice term). One caution on the working title is logged in `requirements.md` §1.7. **Still undecided on 2026-10-06** (founder). | A final name is chosen. It still blocks L2's art and L9's store page. |
| L2 | **Title / welcome screen** (= P1) | ⏳ **First design built 2026-10-02** (`requirements.md` §2.21): the view down a stepwell shaft, with DESCEND at the bottom of the well and the upgrades below. **Verdict, 2026-10-06: explore made art next.** `docs/art-prompts.md` §1 now has three directions with prompts, and `docs/title-art-layout.jpg` marks where the title, the button and the menu sit. Next step is the founder's: make candidate pictures and drop them in `game/assets/incoming/`; each is then fitted behind the real title screen and shown before anything is kept. The drawn shaft stays until one is chosen. | A Cosmic Forge title screen with the name, art and a Start that leads into the hub. |
| L3 | **How to play** | ✅ **Built 2026-09-27**: illustrated cards (`requirements.md` §2.12.2), ten since The Goal, Boons and Depths · Perks were added. | A help page reachable from the title and the hub. |
| L4 | **First-run tutorial** (= P3) | ✅ **Built 2026-09-27**: 14 one-time live tips, skippable (§2.12.1). **2026-10-10: the founder wants it stronger before launch; see L12.** | Wave 1 of a player's first run teaches movement, loot, the satchel and slams live. |
| L5 | **Audio** | ⏳ 37 sound effects are in. **Music was switched off on 2026-10-02**: the founder heard it and the tracks, and above all the transitions, did not suit the game (`requirements.md` §2.16). The engine and files remain; the approach needs rethinking. **The founder likes the sound effects** (2026-10-03: "I liked the gameplay sounds and effects"); they had gone silent on an iPhone when the music was switched off and were restored the same day (`requirements.md` §2.16). **2026-10-05: music stays off for the launch.** The founder judged free tracks not good enough and will consider buying music after the itch.io launch (P10). The POC ships with sound effects only. **2026-10-06: the founder confirmed the sound effects work on their phone.** | Free SFX (hits, slams, pickups, Tejas) plus Indian-flavoured music, with a mute toggle. |
| L6 | **Pause + settings** | ✅ **Built 2026-09-27** (§2.17). | Pause mid-run (essential on mobile), mute, and a "reset save" with a confirmation step. |
| L7 | **Loading screen** | ✅ **Built 2026-10-02**: one glossary card per load, with a copper-silver-gold progress bar and a Begin button (`requirements.md` §2.19). Since 2026-10-03 it also shows how full the well is and what a full well means. | A branded loader with a progress bar. |
| L8 | **Real-device check** (= P6) | The founder plays every build on an iPhone; on 2026-10-07 the wide arena, the heaviest thing the game draws, "looked good" on an iPhone 16 Pro Max. **No mid-range Android has been tried.** | Profiled on a mid-range Android and an iPhone; the frame rate holds with a full arena. |
| L9 | **itch.io page** | ⏳ **Package made 2026-10-10** (`requirements.md` §2.34, `docs/itch-page.md`): the engine and typefaces now sit beside the game, the zip is built by one script and passes every check, and five screenshots, a GIF, a draft cover, the page text, the tags and the AI disclosure are ready. **Left:** the cover and the title wait on the name (L1); the founder creates the page and uploads; the checks in `itch-page.md` §5 are made on the draft page before it goes public. Music's in-world names wait with the music (P10). | Zipped build, embed size set, mobile-friendly flag, fullscreen button, cover image (630×500), 3–5 screenshots, a short GIF, description, tags, credits. Released **free**: no money changes hands, so the GST/CA question waits. |
| L10 | **Feedback loop** | ⏳ **Built 2026-10-02** (`requirements.md` §2.22): a dialog on the title screen and after every run that emails the founder through FormSubmit. **Activated by the founder, 2026-10-06.** Checked the same day with one labelled test message sent through the dialog on the live site: FormSubmit answered that it was submitted successfully. Still to do: swap the address in the page for the private alias FormSubmit issued, once the founder passes it on. itch.io analytics start with L9. | An in-game "Send feedback" link, and itch.io analytics watched for the first two weeks. |
| L11 | **Security pass** | Not started; nothing to do until the build for itch.io is final. The founder's twenty-item list was saved on 2026-10-06 in `docs/pre-launch-security-checklist.md`, with a first reading of which items apply to a game with no server (about half do not today). | **Just before the itch.io upload (L9):** every item on the list gone through, done where it applies, and the result written down. The founder asked for it to be run at that moment without being asked again. |
| L12 | **A stronger first-run tutorial** | ⏳ **Built 2026-10-10** (`requirements.md` §2.35, pictured in `docs/tutorial-lessons.jpg`); waiting for the founder to play it. Asked for in their words: "Make the level tutorial stronger. Something like: the game pauses and a popup is highlighted explaining a particular concept. This can be skipped but happens first time the player is playing or there can be an option to go through this." They then chose: five ideas (moving, loot, the + button, the timer over a boss, slams), the other ten tips left quiet; automatic on a first run, a skip on every panel, a replay in How to play; inside the real run. **To judge on a phone:** the five come within the first half minute. The founder's own save has seen these tips already, so they must press REPLAY TUTORIAL in How to play, or try a private window, to see it. | A new player's first run stops, once, at each of the five ideas, dims the screen, lights the thing itself, and says what it is in a sentence or two; one tap carries on and one button skips the rest. It can be gone through again on request. It is in the build the five outside players (P11) see, and the zip is rebuilt after it. |
| L13 | **Free rides** | ⏳ **Hunted and closed 2026-10-10** (`requirements.md` §2.36); waiting for the founder to play it. Asked for in their words: "try to figure out some gameplay pseudo-cheats... We need to game test this thinking of such possibilities and fix them." Their own example was real: a player who ran round the walls could not be touched. Now the pack runs a runner down. A boss could also be kept alive for an endless and nearly safe supply of Nidhi. A first fix stopped the pay at tribute 15; the founder rejected that the same day, because farming before a descent is a way of building they want kept. Tribute now pays without end and grows heavier: past 15, the summons are 12% tougher and harder-hitting, and 4% faster, for every 5 more. The speed is what ends it; no bot now outlasts 20 minutes farming a boss. **To judge on a phone:** whether being run down after six seconds of running feels fair. | No way of playing that needs no reading of the fight lives as long, gets as far or earns as much as playing does. `node tools/lazy-players.mjs` is run again whenever a reward or an enemy's behaviour changes. |

**Not needed for the POC:** P2 (look-builder), P4 (commissioned art), P5 (visual-story polish), M8 (narrative), M9 (capstone boss). These wait on the itch.io response, as the "prove it, then invest" rule in `launch-roadmap.md` says.

**Immediate priority (2026-10-02): the goal and ending are built; the founder is playing the reference games before deciding the rest of §1.3 (gameplay depth, the names, seven worlds).** A slide deck of the whole loop and every mechanic was made for that review; it closes with the gaps found (no stated goal, no ending, an unreadable sector track), three options for sector names, and a split of what to fix before launch against what can wait. Sector names are not yet changed. Still open on the launch track: music (L5), the title screen verdict (L2), activating the feedback form (L10), the real-device check (L8), the final name (L1) and the itch.io page (L9). M7 is effectively closed for the POC; its remainder is L2 plus the post-launch P4.

## 1.3 Open design questions (2026-10-02)

After first playing the merged build, the founder paused changes to settle three things. Nothing below is decided or built.

**1. The goal and the ending: decided and built (2026-10-02).** The founder chose A + B: a run ends when Vritra is slain at the bottom of level 3, and every boss beaten returns water to a well that fills across runs (`requirements.md` §2.23). Still open from that discussion:

- **Seven worlds: settled 2026-10-05 as seven depths.** The founder had wanted seven worlds and suggested four more sectors; the alternative offered was seven tiers of the same three-level descent, each win opening a harder one, which needs almost no new art. They chose the tiers ("B as the spine"), built as depths of the well (`requirements.md` §2.30).
- **What a win unlocks besides water: settled 2026-10-05.** The next depth, and a perk.

**2. The moment-to-moment play feels plain.** Compared with the genre's hits (2026-10-02): moving while the character attacks on its own is exactly what Vampire Survivors and Brotato do, so the base is sound. What they add and this game lacks:

- **A choice every 20 to 40 seconds.** Vampire Survivors offers a pick of three on every level-up, the first within a minute or two. Here a run has no choices: loot equips itself, and there is one weapon and one trinket.
- **A reason to move toward things.** Their experience gems must be walked over. Here Nidhi is banked automatically.
- **Power that visibly grows inside a run.** Here the attack looks the same at minute ten as at minute one.
- Archero adds a different twist: the hero fires only while standing still, so every second is a decision.

What this game has that they lack: bosses with real rules, the Cosmic Cycle, and Extract or Descend. Its big decisions are good and rare; its small decisions are missing. Candidate fixes, in rising cost: Nidhi as drops to collect; a standing-still attack bonus; level-up picks (where the pinned Bhagya chart, P7, could live).

**Founder's verdict after playing them (2026-10-03):** Brotato is the favourite, "for being close to what we have built"; 10 Minutes Till Dawn is "really intriguing and engaging". They asked whether this game should show a level-up screen like Vampire Survivors' pick-of-three. Recommendation: follow Brotato, not Vampire Survivors. Offer a pick of one from three boons **between waves**, on a paused card screen, so the choice arrives at a natural break instead of interrupting a dodge. No experience bar is needed.

**Decided and built (2026-10-03).** The founder approved the draft below as written: "Build all 18", a pick after every wave, one reroll per level. Specification and balance figures: `requirements.md` §2.24. The draft is kept as it was proposed.

#### Proposal: boons between waves (draft, 2026-10-03)

**When.** After every cleared wave before a boss: waves 1 to 5 of each level, the Gatekeeper's wave included. That is 5 picks a level and 15 in a full descent, about one every 20 to 30 seconds of fighting. Not after a boss: the Extract or Descend screen already sits there.

**The screen.** The fight freezes, as for the satchel. Three cards stacked down the screen, as in Vampire Survivors: icon, name, metal, one line on what it does, and "rank 2 of 3" when it stacks. Tap one and the next wave starts. One free reroll per level.

**Rules.**
- Boons belong to Kiran, not to the weapon, so swapping weapons keeps them. They last the run: Extract or death clears them.
- Metal ladder, as for loot. Copper boons are stats and stack up to three times. Silver boons change how you fight. Gold boons deepen what you carry, after 10 Minutes Till Dawn's upgrade trees, and are offered only when they apply.
- Level 1 offers mostly copper. Silver and gold grow with depth, which gives one more reason to Descend.
- The pause menu shows the run's boons as a row of icons, so the build stays visible.
- Bosses, Extract or Descend and the Cosmic Cycle are unchanged. The Bhagya chart (P7) stays pinned; "Eclipse Hunger" below is the only boon tied to the Cycle.
- Names: the plain-English names below go in the `plain` pack; Sanskrit and hybrid names are drafted when it is built.

| # | Metal | Boon | What it does |
|---|---|---|---|
| 1 | Copper | Keen Edge | +15% damage |
| 2 | Copper | Quick Hands | Attacks 12% faster |
| 3 | Copper | Long Reach | +20 attack range (130 to start) |
| 4 | Copper | Light Feet | +20 move speed (200 to start) |
| 5 | Copper | Iron Body | +20 max health, and heals 20 now |
| 6 | Copper | Thick Hide | Take 8% less damage |
| 7 | Silver | Hold Your Ground | +35% damage while standing still (Archero's idea) |
| 8 | Silver | Strike on the Run | Attacks 25% faster while moving. Never offered alongside 7: pick a style |
| 9 | Silver | Second Target | Every attack hits one more enemy (twice at most) |
| 10 | Silver | Read the Slam | Step out of a slam's red zone and the next 4 seconds hit 50% harder |
| 11 | Silver | Last Stand | Below 30% health: +40% damage and +30 speed |
| 12 | Silver | Greed | +25% Nidhi for the run, but enemies hit 10% harder |
| 13 | Gold | Spreading Rot | Venom weapon: a poisoned enemy that dies passes its poison on |
| 14 | Gold | Blood Shield | Vampiric weapon: healing past full health becomes a shield, up to 25 |
| 15 | Gold | Forked Lightning | Chain weapon: each chain jumps to two enemies, not one |
| 16 | Gold | Clean Cut | Executioner weapon: the bonus starts at 35% health, not 25% |
| 17 | Gold | Kindling | Tejas fills 30% faster (from level 2, once Tejas has woken) |
| 18 | Gold | Eclipse Hunger | During Grahan (Eclipse), every kill heals 3 |

Gold boons 13 to 16 go quiet while another kind of weapon is equipped and wake again when it is swapped back, which makes the satchel matter.

**Difficulty.** Fifteen boons make Kiran far stronger by level 3. The difficulty already needs revisiting now that touch movement no longer teleports (`requirements.md` §2.14). Retune once, with boons in, instead of twice. The playtest bot picks a boon at random so its runs stay comparable.

Games for the founder to play first: Vampire Survivors and 10 Minutes Till Dawn (both free in a browser on itch.io), HoloCure (free download on itch.io), Brotato and Archero (free on phones). Each states its goal as a number on screen: survive 30 minutes, survive 10 minutes, survive 20 waves.

**First phone playtest of boons (2026-10-03).** The founder reached level 3 with the well 6% full and reported "the initial runs look a bit too easy with no variability". They also asked whether rewarding patient play (more creeps killed before the boss, more drops and better benefits) was built: only partly. All three proposals were approved and built the same day: wave shapes and a bigger opening (`requirements.md` §2.25) and tribute (§2.26). Still open after it: what a full well should unlock beyond ending the game, and a difficulty pass on levels 2 and 3 once the founder has played this build.

**4. One screen, or a wide arena with the camera following? Settled 2026-10-07: wide is the default.** The founder asked for Brotato's moving screen. It is built as an option (`requirements.md` §2.33): `?arena=wide`. The fixed arena stays the default until they have played both. If wide wins, two things follow before it ships: the larger floors are measured on a real phone (L8), and the difficulty is looked at again, because more room is more room to run. **2026-10-07:** the founder played it on an iPhone 16 Pro Max ("phone performance looked good"), agreed it was easier, and had it made harder: slams reach 30% further and waves bring a few more enemies (`requirements.md` §2.33). They then chose it: "make wide the default" (2026-10-07). The fixed arena stays behind `?arena=fixed`. A mid-range Android is still untried, and that matters more now that the larger floors are what every player gets.

**3. Does the Indian identity help or harm onboarding and retention?** The founder is re-evaluating. The names are now switchable in one line so the question can be tested instead of argued (`requirements.md` §2.12).

## 1.4 Testing round and assessment (2026-10-04)

Asked for by the founder after the profile, power, boon-button, hybrid-name and glass changes: a detailed test, A/B runs, and "straight answers about adoptability, gamer retention, and advertising potential" from a new player's point of view.

**Automated checks.** `tools/smoke-test.mjs`: 51 of 51, run repeatedly. One check proved flaky (a fixed wait where a headless page can stall) and now waits on the event.

**A/B runs.** The playtest bot, target level 3. The bot is a far weaker player than the founder, so the columns compare builds; they are not a forecast of how a person fares.

| Run | New character, 16 runs: health lost on level 1 · reached level 3 · slew Vritra | Upgrades 6/6, 12 runs: the same three |
|---|---|---|
| A. Build 0.1 (boons, uniform waves), hybrid names | 53% · 8 · 1 | 23% · 10 · 5 |
| B. Build 0.2 (wave shapes, tribute) | 83% · 8 · 1 | 21% · 10 · 3 |
| C. Build 0.3 (this one), hybrid names | 99% · 7 · 0 | 28% · 9 · 6 |
| D. Build 0.3, Sanskrit names | 50% · 6 · 0 | 27% · 11 · 2 |
| E. Build 0.3, boons spent only between levels | 117% · 3 · 1 | |
| E. Build 0.3, boons never spent | 109% · 1 · 0 | |

What the runs say:

1. **Names do not change difficulty.** C and D are the same code under two name packs. The gap between them (99% against 50% on level 1) is the size of the noise in 16 bot runs, and a reminder not to read a single batch.
2. **The three builds are about equally hard overall.** Level 1 costs a new character more since the wave update (0.2); the share reaching level 3 has not moved. The founder's impression that the hybrid session was harder than the latest build cannot come from the names. It is either an older build served from the phone's cache for that address, or run-to-run swing, which is large now that waves take different shapes. A strong player may also find the newer builds easier past level 1: more enemies mean more item rolls, Nidhi and tribute, which the bot is too weak to turn into an advantage.
3. **Unspent boons are costly.** Spending them only between levels cuts the share reaching level 3 from about 7 in 16 to 3 in 16. Hence the reminder added to the + button (`requirements.md` §2.24).
4. **Cost of the glass.** The frosted backdrop took about 140 ms to make in software rendering on the test machine; with a graphics card it is a few milliseconds. The bot skips it.

**Assessment, as a new player would meet the game.** Opinion, argued from the screens, the genre and the figures above; no real new player has been watched yet.

*Will a new player get in? Mostly yes.*
- For: it runs in a browser tab with nothing to install, plays with one thumb, states its goal on the first two screens, and the first two waves are gentle.
- Against: too many systems arrive in the first three minutes (phases, boss cores, shield anchors, satchel, boons, tribute, Tejas, power, extract or descend). The riskiest is the first boss: about a minute in, the Gatekeeper takes 12% damage unless the phase bar matches the colour at his feet, and a player who misses that one tip meets a boss that will not die.
- Against: the first download is about 3.5 MB (engine, 37 sound files, sprites) with the engine and fonts fetched from other servers; no music; small text.

*Will they come back? Not for long, yet.*
- For: runs are short (three to six minutes), and Extract or Descend, tribute and boon builds now make two runs differ.
- Against: there is little to earn across runs. Two upgrades, a well that fills in about seven wins, five weapons, five trinkets, 18 boons. A good player sees everything in an evening, as the founder did, and after Vritra nothing new appears. No reason to return tomorrow is built: no unlocks from wins, no harder tier, no daily or shared element.

*Will it advertise? Weakly, as it stands.*
- For: the setting is distinctive in a crowded genre, and the title shaft, the flooded level and the serpent's vault now make screenshots worth stopping for.
- Against: the cast does not match the place. The hero, the green goblins and a horned Viking are stock sprites with no animation frames, standing in an Indian stepwell.
- Against: fights are 6 to 15 enemies and thin beams. The genre sells on screens full of enemies and numbers; a five-second clip of this game does not yet show that.
- Against: the name "Anantarya" is hard to say, spell and search for.

*What would move each most.*

| Aim | Change |
|---|---|
| Getting in | Teach the first boss's rule in the fight itself (a marker on the phase bar while he is vulnerable, a visible "resisted" on hits that are not), and hold tribute, power and the satchel tips back until level 2 |
| Coming back | Something earned by winning: the pinned boss-kill perks (P8), a harder tier after the first win, new enemies or a fourth weapon family |
| Advertising | Hero and enemies that belong to the setting (P4), walk and attack frames, bigger late waves, music, and a name people can repeat |

**What was chosen (2026-10-05).** The founder agreed with all three aims and picked from the options offered for each.

| Aim | Chosen | Built |
|---|---|---|
| Getting in | All four: the state drawn on the boss, a countdown, a first Gatekeeper who arrives open, and a softer penalty on level 1 (the founder set it at 30% of a hit getting through, where 50% was proposed) | `requirements.md` §2.6 |
| Coming back | Seven depths as the spine, perks as the rewards. The daily descent is pinned (P9) | §2.30 |
| Advertising | Motion in code and a drawn Vritra now. The founder will make the characters themselves with image tools, and is not ready to commission an artist (`docs/character-art-guide.md`). Music waits until after launch (P10). Later the same day: walk frames switched on from the stock packs already licensed, as a stopgap (build 0.5) | §2.31 |

Holding the tribute, power and satchel tips back until level 2 was proposed under "getting in" and not chosen; it is not built.

**Bot runs by depth (2026-10-06, build 0.5).** Eight runs each, upgrades 10/10 unless stated, target level 3. As above, the bot is far weaker than the founder: read the rows against each other, not as a forecast.

| Depth and build | Health lost on level 1 | Reached level 3 | Slew Vritra |
|---|---|---|---|
| 1, no perks | 14% | 7 of 8 | 3 of 8 |
| 1, two perks (Serpent's Scale, Sentinel's Guard) | 13% | 8 of 8 | 2 of 8 |
| 2, two perks | 12% | 7 of 8 | 5 of 8 |
| 4, two perks | 31% | 7 of 8 | 6 of 8 |
| 7, two perks | 25% | 6 of 8 | 0 of 8 |
| 7, upgrades 14/14, three perks | 36% | 7 of 8 | 3 of 8 |

What the runs say:

1. **Depths 2 and 4 are not measurably harder than depth 1.** With eight runs the gaps are inside the noise, but they point the wrong way: more wins at depths 2 and 4 than at 1. Faster enemies, a smaller heal and more frequent slams do not, on their own, stop a run that depth 1 does not stop.
2. **Depth 7 is a cliff.** The fifth more health and damage it adds is the first thing on the ladder that bites: no wins at 10/10, three of eight at 14/14 with three perks. Depths 5 and 6 were not run.
3. **Two perks do not move the bot's results** at depth 1. They are small by design; their worth is the choosing.

So the ladder as built was flat for three or four wins and then steep. A player would feel "the same run again" and then a wall. Proposed: enemy health and damage +4% for each depth past the first.

**Decided and built the same day (build 0.6).** The founder: "Depth - add 4% enemy health and a random extra creep every few waves to add to the complexity." So health ramps and damage does not, strays were added (`requirements.md` §2.30), and depth 7 keeps its fifth more damage while its extra health now comes from the ramp. The same six-rung table, run again with ten runs each:

| Depth (upgrades 10/10, two perks) | Before: slew Vritra | After: health lost on level 1 | After: reached level 3 | After: slew Vritra |
|---|---|---|---|---|
| 1 | 2 of 8 | 7% | 10 of 10 | 7 of 10 |
| 2 | 5 of 8 | 8% | 8 of 10 | 3 of 10 |
| 4 | 6 of 8 | 18% | 10 of 10 | 4 of 10 |
| 6 | not run | 23% | 7 of 10 | 1 of 10 |
| 7 | 0 of 8 | 41% | 7 of 10 | 0 of 10 |
| 7, upgrades 14/14, three perks | 3 of 8 | 35% | 10 of 10 | 5 of 10 |

1. **The ladder now climbs.** Wins fall from 7 in 10 at depth 1 to 1 in 10 at depth 6, and the health a run costs on level 1, the steadier of the two measures, rises at every rung: 7%, 8%, 18%, 23%, 41%.
2. **How much to trust it.** Depth 1 plays by the same rules in both builds, and the bot won 2 of 8 there one day and 7 of 10 the next. A gap of two or three wins between neighbouring rungs means nothing; the slope across five rungs does.
3. **Depth 7 is still out of reach at 10/10** and is won half the time at 14/14 with three perks. That reads as a last depth that asks for upgrades and perks, which is what a last depth is for; whether it is too much is a question for a player, not the bot.

**Second assessment (2026-10-06, build 0.6).** Asked for again by the founder: adoption and "sustenance". The same caution as before: argued from the screens, the genre and the bot; **no one but the founder has played yet**, and now that the feedback form works, five outside players would tell more than any of this.

*Will a new player get in? Yes, more readily than at 0.3. The risk has moved from confusion to load.*
- Better: the first boss is no longer a wall. He arrives open, shows a countdown, and on level 1 a player who ignores the rule still wins, slower. Characters walk, the floors look made for this game, and the player's own name is on the profile.
- Unchanged: nothing to install, one thumb, the goal on the first screen.
- Worse: there is more to take in, not less. Depths and perks joined phases, boss tells, the satchel, boons, tribute, Tejas, power and extract-or-descend, and the title screen now carries eleven things. The one proposal that would thin the first three minutes (holding the tribute, power and satchel tips back until level 2) was not chosen.
- To watch: the founder found the boss tells "maybe too fast" in a distracted session. A first-time player is always distracted.
- Still true: about 4 MB to load from three hosts, no music, small text, and a name that is hard to say.

*Will they come back? There is now something to come back for, and it is not yet worth as much as it looks.*
- Better: a ladder exists. Seven depths, eight perks, a well that fills by depth, a name and a profile to own.
- The catch is the table above: the next three depths play like the first, then the seventh is a wall. Until that is tuned, a player who wins once has, in effect, seen the game.
- Unchanged: the amount of content. Five weapons, five trinkets, eighteen boons, six kinds of enemy, three bosses, three levels. Depths reuse all of it.
- Still missing: any reason to open the game tomorrow (the daily descent is pinned), anything to share, and music.
- A fair guess for a player who likes it: one sitting of 30 to 60 minutes to win depth 1, and a second sitting if depth 2 feels different. Today it would not.

*Will it advertise? Still the weakest of the three, though the stills improved.*
- Better: carved floors, the serpent and walking characters make screenshots and a GIF worth showing.
- Unchanged: stock goblins, a Viking and a caveman in an Indian stepwell; fights of 6 to 15 enemies in a genre sold on screens full of them; no name, no title art, no store page.

*What would move each most, in order.*

| Aim | Change |
|---|---|
| All three | Put build 0.6 in front of five people who have never seen it and read what comes back through the feedback form |
| Coming back | Tune the depths so each one bites, then measure again. **Done 2026-10-06**, table above |
| Getting in | Thin the first run: hold the tribute and satchel tips until level 2. **Done 2026-10-06** (`requirements.md` §2.12.1). Power was named with them; it has no tip |
| Advertising | The founder's own cast and title art, a name, then a short clip |

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
