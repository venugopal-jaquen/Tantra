# Claude working notes

Standing guidance for any Claude session working on this repo. These are copies of the
memory notes kept on the founder's PC (2026-10-02), so a cloud session has them too.
`docs/requirements.md` and `docs/design-document.md` remain the source of truth for the game itself.

## cosmic-forge-visual-direction

*Loot Chase's art direction is warm saffron-amber "Cosmic Forge"; dark palettes were rejected twice as generic.*

The "Cut Light" direction (faceted polygons, near-black `#0D0A1A`, purple/cyan) was rejected on
2026-09-24 as "too black and not interesting" — it read as every other indie roguelite
(Hades, Dead Cells). A first Cosmic Forge pass on `#170A00` was **also** rejected as still too
dark. The background is now warm saffron-amber.

Governing idea: everything is precious material at some stage of refinement. Enemies are raw
dark ore with hot amber glowing edges; the player is refined gold; loot goes tarnished bronze →
gold → white-gold. Target feeling: *"rich and rewarding — treasure, wealth, loot fantasy."*

Abstract shapes are ruled out entirely — they cannot carry an Indian identity. Real sprites are
required and **not yet sourced**.

**Why:** two rejections in a row were both about the same thing — darkness reading as generic.

**How to apply:** never propose a dark-background palette for this game. Check any art work
against docs/requirements.md §2.10 first. The Kenney CC0 sci-fi sprites currently in
game/assets/ predate this and are placeholder only.
See *indian-cultural-identity-pivot*.

## indian-cultural-identity-pivot

*Loot Chase reversed its secular/no-mythology rule on 2026-09-24 and is now explicitly an Indian-identity game with Sanskrit naming.*

On 2026-09-24 the founder reversed a stated non-goal: Loot Chase is now marketed as an
**Indian game**, with Sanskrit/Hindi naming and non-explicit Hindu-mythological flavour.
The prior requirement was the opposite — "deliberately not tied to any real-world religion
or mythology."

Naming: player **Kiran**, enemies **Asura** (melee) / **Rakshasa** (ranged) / **Mahish** (tank) /
**Raktabija** (splitter), bosses **Bakasura** / **Nidhi-Raksha** / **Vritra**, currency **Nidhi**,
phases **Shanti / Shakti / Grahan / Pralaya**, rarity **Tamra / Rajat / Swarna** (copper/silver/gold).

**Enemy-naming rule (audit, 2026-09-24):** an enemy must be an *antagonist* in its source tradition,
never a being revered today. Yaksha, Dwarapal (temple guardians) and Kalachakra (a Vajrayana
Buddhist tantra/deity) were replaced for this reason. Apply the same check to any new name.

**Why:** judged the project's strongest differentiator — nothing else in the arena-roguelite
genre has it. The bar is "Hades uses Greek myth": evocative flavour, never doctrine.

**How to apply:** treat this as settled, not open for re-litigation. Do not reintroduce the
secular framing. Naming is still flavour only — no worship depiction, no religious instruction,
no claims about belief. Full detail in docs/requirements.md §1.7 and §2.12.
See *cosmic-forge-visual-direction* and *loot-chase-canonical-docs*.

## loot-chase-canonical-docs

*"Loot Chase context splits across this repo, claude.ai chats and other Claude Code sessions; docs/ is canonical and drifts if not merged."*

This project is developed in **three places**: this repo (code), claude.ai chats (design and
direction), and **other Claude Code sessions in this same project folder** (research). The
founder answers proposals from all three in whichever session is open, without saying which
one a proposal came from.

- claude.ai: Claude Code cannot read claude.ai projects or chats — only a **public share link**
  `claude.ai/share/<id>` is readable, via the browser pane. Project links and private chats are not.
- Other Claude Code sessions: their transcripts are the `*.jsonl` files beside the `memory/`
  folder (`~/.claude/projects/C--Users-venug-Documents-Game-loot-chase-project/`). They can be
  grepped and read directly.

Direction has drifted twice. The Indian-identity and Cosmic Forge pivot happened in a claude.ai
chat on 2026-09-24 and was invisible here until the founder shared a link. On 2026-10-02 the
founder said "build the glossary-card loader, pin the Bhagya chart and the boss-kill perks" —
all three came from a separate Claude Code research session on the game Asura, and none was in
the repo.

**Why:** the repo's own design-document.md §4 calls context living outside version control the
project's biggest historical gap. It was fixed for code (M6) but keeps recurring for design context.

**How to apply:** when the founder references something unfamiliar, **grep the sibling session
transcripts first** (the term will be there if it came from Claude Code), and only then ask for
a claude.ai share link. Treat `docs/` as the single source of truth and fold every external
decision into it with a dated row in requirements.md §1.7. See *pin-means-roadmap*.

## pin-means-roadmap

*When the founder says "put a pin on" something, record it on the roadmap (design-document.md) rather than building it or just noting it in chat.*

"Put a pin on X" means: do NOT build X now, but add it to the project roadmap —
the milestone table / pinned backlog in docs/design-document.md — with the date and
why it was deferred. Stated explicitly by the founder on 2026-09-24, and applied
retroactively to earlier pins (first-run tutorial, front-page redesign, character
naming/customisation screen).

**Why:** pins that only live in chat get lost; the roadmap is the canonical backlog.
See *loot-chase-canonical-docs*.

**How to apply:** whenever a request contains "pin", "park", or "later" for a feature,
add a dated row to the pinned backlog in docs/design-document.md in the same change,
and say so in the reply. Never silently drop it and never build it unprompted.

## playtest-bot-calibration

*tools/playtest-bot.js is a much weaker player than the founder; read its balance numbers relative to a baseline build, never as absolutes.*

`tools/playtest-bot.js` plays whole runs headlessly (~80x real time) and reports per-sector HP
loss, deaths, damage by source, errors and leaks. Calibrated on 2026-09-24 against the pre-change
build: there its fully upgraded profile lost ~59% HP in Sector 3, where the founder reported
losing under 5%. So the bot is far weaker than the founder, and closer to a brand-new player.

**Why:** tuning straight to the bot's absolute numbers would make the game far too easy for the
actual player. Its value is relative comparison (old vs new build) and new-player survival.

**How to apply:** when rebalancing, run the bot on BOTH the old and new build and compare. Treat
"fresh" profile results as the new-player experience. Two headless gotchas: Phaser tweens do not
advance under headlessStep (so in-flight FX look like leaks - count only non-tweening objects),
and instrumented damage must exclude hits blocked by i-frames or shields.

## test-headless-and-muted

*"Run automated game checks with tools/smoke-test.mjs (private, muted, headless Chrome), not in the visible browser pane."*

Test the game with `node tools/smoke-test.mjs <output-dir>` — a headless Chrome with its own
throwaway profile and `--mute-audio` — and read the screenshots it saves. Use the visible
browser pane only when the founder asks to see something.

**Why:** on 2026-10-02 the founder stopped the preview server and closed the browser pane in
the middle of my testing. At the time I was playing synthetic test tones through their speakers
(stand-in "music") and my playtest bot had started on top of a run sitting on the sector-clear
screen — very likely one the founder was playing in the pane. The pane is shared: they can see
it, hear it and play in it. It also throttles the game clock when it is not in view, which
made real-time checks unreliable there.

**How to apply:** never play audio on the founder's machine during tests (mute, or set
`settings.music = settings.sfx = 0`); never drive the pane's game without checking its state
first; delete stand-in assets as soon as a test is done. The smoke test also runs
`tools/playtest-bot.js`, so prefer it for regression runs. See *playtest-bot-calibration*.

## vet-assets-before-shortlisting

*"Check every licence flag (Pixabay \"Content ID Registered\", devotional tags, AI-generated) on an asset BEFORE offering it to the founder."*

Before putting any music track (or other third-party asset) in front of the founder, open its
page and check the flags myself: **Content ID Registered**, devotional/bhakti/mantra tags,
vocals, and "AI generated". Offer only assets that pass.

**Why:** on 2026-09-27 I shortlisted eight Pixabay tracks and told the founder to check each
page for Content ID. Both of my boss-fight suggestions were in fact Content ID registered, and
the founder picked one ("The Descent of Hanuman" — also tagged devotional, which
requirements.md §1.3 rules out). I had to tell them their pick could not be used. 29 of 48
Indian-flavoured Pixabay candidates I checked on 2026-10-02 were registered, so it is the
common case, not an edge case. A Content ID track puts a copyright claim on every streamer's
video of the game, which works directly against the founder's goal of reach.

**How to apply:** the check is cheap — fetch the track page and look for "Content ID
Registered" and the tag list. Pixabay's download links refuse automated requests (403), so the
founder downloads by hand into `game/assets/incoming/music/` and `tools/convert-music.py`
prepares the files. I cannot hear audio, so the founder judges by ear; my job is the licence
and the wiring. Related: *indian-cultural-identity-pivot*.

## working-title-anantarya

*"The game's working title is \"Anantarya\" (placeholder since 2026-10-02); final name still to come from the founder."*

On 2026-10-02 the founder said: "Will give name later.. For now go with Anantarya". It is a
**placeholder**, not the final name. Earlier candidates "Loot Chase" (generic) and the repo name
"Tantra" (sexual/new-age connotation in the West, and a religious practice term) were both
set aside.

The name is one constant, `GAME_TITLE`, in `game/loot-chase-v0.1.html` (loader, hub, browser
tab); the root `index.html` redirect page has its own copy. File names, the save key
`loot-chase-session-v1` and the docs' titles still say "Loot Chase" on purpose — renaming them
would break saves and links for a name that may change again.

**Why:** the final name blocks the title-screen art (launch track L2) and the itch.io page (L9).

**How to apply:** use "Anantarya" in player-facing text; do not rename files or save keys. I
flagged one caution and asked which word the founder means: Sanskrit *ānantarya* is "immediate
succession, without interval", but in Buddhist texts *ānantarya-karma* is the term for the five
gravest acts — the same class of problem as Kalachakra under *indian-cultural-identity-pivot*.
No Devanagari is shown for the title until the founder confirms the intended word.
