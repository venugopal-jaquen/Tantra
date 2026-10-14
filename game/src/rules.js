/*
 * rules.js: the numbers and tables the game is played by. Change a balance value here.
 *
 * Declares  the well and its depths (WATER, WELL_FULL, DEPTH_*, DEPTHS, PERK_SLOTS, PERKS),
 *           levels and bosses (GATEKEEPER_WAVE, MEGA_BOSS_SECTOR, FINAL_SECTOR, SLAM,
 *           SLAM_WARN, BOSS_RESIST, sectorDmgMult, sectorHpMult, WIDE), the hero and the
 *           fight (HIT, HERO_RADIUS, PICKUP_REACH, BREATH, IFRAMES_MS, SECTOR_CLEAR_HEAL,
 *           DEATH_KEEP, INV_MAX, HUNT), loot (RARITY, rollRarity, WEAPON_EFFECTS, TRINKET_EFFECTS, the two
 *           pick... functions), boons (BOONS, BOON_ODDS, BOON_REROLLS), waves (WAVE_BASE,
 *           WAVE_SHAPES, STRAYS, ENEMY_TYPES, pickEnemyType), tribute (TRIBUTE), power
 *           (POWER), the supercharge (TEJAS, TEJAS_FORMS, TEJAS_UNLOCK_SECTOR), the
 *           phases (PHASE_DEFS, PHASE_SEQUENCE, CONVERGENCE_INTERVAL), the teaching
 *           (HELD_TIPS, LESSONS, LESSON), and the small functions that word a level or
 *           the well (sectorTitle, stageLabel, levelsBelow, wellLine, metalList).
 * Needs     config.js, names.js (labels and descriptions are taken from N as the tables
 *           are built). Functions in the tables call the engine and read the save only
 *           when they are run, which is after everything has loaded.
 * State     DEPTH_NOW, the depth of the run in progress: set by the scene when a run
 *           starts, read by sectorDmgMult and sectorHpMult. Nothing else here changes.
 *
 * Units are said beside each value: ms, seconds, pixels of the 400 x 700 screen, parts of
 * one (0.35 is 35%). A table's keys are identities the save and the art refer to: add,
 * never rename. The order of keys is the order things are offered and listed in.
 */

const WATER = { boss: 1, final: 3 };          // measures of water returned per boss beaten
const WELL_FULL = 35;                         // measures to fill the well: seven complete descents

// What a wide arena adds, to be as hard as the fixed one (requirements 2.33). More room is
// more room to run - the founder played it and agreed it was easier - so there a boss's
// slams reach further, and further still on each level after the first, and every wave
// brings a few more enemies, how many being left to chance. None of it touches the fixed
// arena. Figures are the founder's (2026-10-07) where they gave one.
const WIDE = {
  slam: 1.30,             // every slam zone, on every level
  slamPerSector: 0.05,    // and this much more for each level after the first
  slamMost: 1.60,         // where that stops, deep in the endless levels
  creeps: [1, 3],         // extra enemies in a wave: at least, at most
  creepsPerSector: 1      // the most rises by this for each level after the first
};
const GATEKEEPER_WAVE = 3;
const MEGA_BOSS_SECTOR = 3;

// Sector names come from the name pack: a short name, and a line to go under it.
function sectorTitle(n) { return (N.sectors[n - 1] || N.deeper)[0]; }
function sectorSub(n) { return (N.sectors[n - 1] || N.deeper)[1]; }
// "Level 2 of 3" while the final boss is still ahead; past him, just "Level 5".
function stageLabel(n) { return n <= FINAL_SECTOR ? `${N.stage} ${n} of ${FINAL_SECTOR}` : `${N.stage} ${n}`; }
// "two levels below" - how far down the final boss is from level n.
function levelsBelow(n) {
  const k = FINAL_SECTOR - n, word = ['no', 'one', 'two', 'three', 'four', 'five', 'six'][k] || String(k);
  return `${word} ${N.stage.toLowerCase()}${k === 1 ? '' : 's'} below`;
}
function wellPct() { return Math.round(100 * Math.min(1, (session.water || 0) / WELL_FULL)); }
function wellLine() { const pc = wellPct(); return pc <= 0 ? 'The well is dry' : pc >= 100 ? 'The well is full' : `The well is ${pc}% full`; }
// "Tamra (copper), Rajat (silver), Swarna (gold)" - or just the three names when a pack has no glosses.
function metalList() {
  return ['common', 'rare', 'epic'].map(k => N.metals[k] + (N.metalGloss[k] ? ` (${N.metalGloss[k]})` : '')).join(', ');
}

// Per-sector difficulty. Sector 1 is untouched; every sector deeper compounds, so a
// player who keeps buying Vitality cannot simply out-grow the game (see 2.14). Damage
// and HP compound separately so fights get both more dangerous AND longer.
// Tuned from playtest-bot data (2.14): 1.28 / 1.32 let no profile - not even a fully
// upgraded one - clear Sector 3.
let DEPTH_NOW = 1;      // the depth of the run in progress
// Every depth past the first toughens every enemy a little (DEPTH_HEALTH), so each win is
// felt in the next run; the seventh also hits a fifth harder.
function sectorDmgMult(sector) { return Math.pow(1.22, Math.max(0, sector - 1)) * (DEPTH_NOW >= 7 ? 1.2 : 1); }
function sectorHpMult(sector)  { return Math.pow(1.26, Math.max(0, sector - 1)) * (1 + DEPTH_HEALTH * (DEPTH_NOW - 1)); }

// Invulnerability window after a melee or ranged hit (never after a slam).
const IFRAMES_MS = 280;
// Share of max HP restored when a sector boss falls.
const SECTOR_CLEAR_HEAL = 0.35;
// ---------- THE GOAL AND THE WELL (requirements 2.23) ----------
// The game used to state no goal and never end. Now a run has one aim - reach the bottom
// level and slay the final boss, who has drunk the well dry - and across runs every boss
// beaten returns water to the well, which fills on the title screen.
const FINAL_SECTOR = MEGA_BOSS_SECTOR;        // the level whose boss ends the run
// WATER and WELL_FULL are at the top of this file.

// Share of a run's Nidhi you keep when you fall, or abandon. Extracting keeps all of it.
// Death used to bank everything, exactly like Extract - which made Descend free and the
// Extract/Descend choice (requirements 2.5) a fake one.
const DEATH_KEEP = 0.5;
// What the two upgrades on the title screen cost, in Nidhi: the first level's price, and
// how much dearer each level after it is (1.45 is 45% dearer). See upgradeCost().
const UPGRADE_COST = { vitalityLevel: 50, powerLevel: 60, growth: 1.45 };

// Boss slam kit. Each boss draws from its own pool; Vritra has all three.
const SLAM = {
  circle:  { windup: 950,  pct: 0.14, shake: 0.010 },   // ring around the boss
  line:    { windup: 850,  pct: 0.12, shake: 0.008 },   // a cleave aimed where you stood
  scatter: { windup: 1150, pct: 0.08, shake: 0.006 }    // eruptions landing around you
};

// Each slam shape has its own warning RHYTHM, so the ear knows which slam is coming
// before the eye has found the red zone: one low gong for the ring, two quick high
// strikes for the line, three rising taps for the scatter. Pitch alone was too easy to
// miss; a rhythm is not. Entries are [delay in ms, pitch].
const SLAM_WARN = {
  circle:  [[0, 1.0]],
  line:    [[0, 1.3], [110, 1.3]],
  scatter: [[0, 0.8], [85, 0.95], [170, 1.1]]
};

// TEJAS - supercharge. A meter that fills slowly on its own and faster with every kill;
// when full, the player unleashes a timed form chosen by their equipped weapon.
// Unlocks the first time the player reaches TEJAS_UNLOCK_SECTOR, which also makes it a
// reward for choosing Descend over Extract.
const TEJAS_UNLOCK_SECTOR = 2;
// `reach`: every form but the chain reaches its radius times a boss's slam reach (WIDE) times
// this, so from outside a boss's ring it still reaches him (2026-10-13, the founder: "Tejas
// AOE feels too small and not worth the risk. It makes me go near the guardian every time").
// The slams grew 30% with the wide arena and Tejas had not: its 104-128 sat inside a
// Hoard Guardian's ring of 117 and Vritra's of 134 (requirements 2.53).
const TEJAS = {
  passivePerSec: 1.1,
  perKill: { melee: 3.5, ranged: 4.5, tank: 7, splitter: 2.5 },
  eliteBonus: 10,
  duration: 6000,
  reach: 1.15
};
const TEJAS_FORMS = {
  none:        { name: N.forms.none[0], meaning: N.forms.none[1], desc: 'Fire novas burst out around you',     kind: 'nova',  every: 420, radius: 128, dmgMult: 1.1, colour: 0xff8c42 },
  venom:       { name: N.forms.venom[0], meaning: N.forms.venom[1], desc: 'A poison cloud clings to you',        kind: 'aura',  every: 300, radius: 112, dmgMult: 0.5, colour: 0x7fdd3c, poison: true },
  vampiric:    { name: N.forms.vampiric[0], meaning: N.forms.vampiric[1], desc: 'Drain everything near you to heal',   kind: 'aura',  every: 300, radius: 104, dmgMult: 0.6, colour: 0xff5f5f, heal: 0.2 },
  chain:       { name: N.forms.chain[0], meaning: N.forms.chain[1], desc: 'Continuous chain lightning',          kind: 'chain', every: 200, radius: 230, dmgMult: 0.9, colour: 0x4dd0ff, targets: 3 },
  executioner: { name: N.forms.executioner[0], meaning: N.forms.executioner[1], desc: 'Ground slams that execute the weak',  kind: 'slam',  every: 620, radius: 124, dmgMult: 2.2, colour: 0xffd23c, execute: 0.3 }
};

// The well's depths and the perks worn (requirements 2.30). Loading an older save
// (persistence.js) needs these; the tables themselves, DEPTHS and PERKS, are further down.
const DEPTH_MAX = 7, DEPTH_WATER = WATER.boss * 2 + WATER.final, DEPTH_GOLD = 0.2;   // +20% Nidhi per depth past the first
const DEPTH_HEALTH = 0.04;                    // and +4% enemy health (founder, 2026-10-06)
const PERK_SLOTS = 2;
function bossKind(e) { return e.isMega ? 'megaboss' : e.type; }

// Tamra / Rajat / Swarna - copper, silver, gold. The Cosmic Forge metaphor is literally
// refinement, so rarity reads as a metal ladder rather than an arbitrary colour code.
const RARITY = {
  common: { mult: 1.0,  color: 0xd9844a, label: N.metals.common,  meaning: N.metalGloss.common },
  rare:   { mult: 1.5,  color: 0xd4dde6, label: N.metals.rare,  meaning: N.metalGloss.rare },
  epic:   { mult: 2.3,  color: 0xffc93c, label: N.metals.epic, meaning: N.metalGloss.epic }
};
// Unidentified drops were a cold grey so they read as alien to the ladder. With
// silver now IN the ladder grey no longer stands apart, so they are violet instead.
const MYSTERY_COLOR = 0xb48cff;

function rollRarity(boost = 0) {
  const r = Phaser.Math.Between(0,99) + boost;
  if (r < 58) return 'common';
  if (r < 90) return 'rare';
  return 'epic';
}

// Item identities, Dota-recipe inspired: each effect is a distinct mechanical identity, not just a bigger number.
// minSector gates when it starts appearing in drop pools - deeper sectors unlock stronger, more complex effects.
// label = the item's in-game name; meaning = the English gloss shown in the codex.
const WEAPON_EFFECTS = {
  none:        { label: N.weapons.none[0], meaning: N.weapons.none[1], minSector: 1, desc: 'A plain, quick blade' },
  venom:       { label: N.weapons.venom[0], meaning: N.weapons.venom[1], minSector: 1, desc: 'Poisons on hit' },
  vampiric:    { label: N.weapons.vampiric[0], meaning: N.weapons.vampiric[1], minSector: 1, desc: 'Heals you on hit' },
  chain:       { label: N.weapons.chain[0], meaning: N.weapons.chain[1], minSector: 2, desc: 'Arcs to a 2nd enemy' },
  executioner: { label: N.weapons.executioner[0], meaning: N.weapons.executioner[1], minSector: 3, desc: 'Bonus vs low-HP enemies' }
};
const TRINKET_EFFECTS = {
  vitality: { label: N.trinkets.vitality[0], meaning: N.trinkets.vitality[1], minSector: 1, desc: 'Max HP boost' },
  aegis:    { label: N.trinkets.aegis[0], meaning: N.trinkets.aegis[1], minSector: 1, desc: 'Periodic shield charge' },
  thorns:   { label: N.trinkets.thorns[0], meaning: N.trinkets.thorns[1], minSector: 2, desc: 'Reflects contact damage' },
  swift:    { label: N.trinkets.swift[0], meaning: N.trinkets.swift[1], minSector: 2, desc: 'Movement speed boost' },
  regen:    { label: N.trinkets.regen[0], meaning: N.trinkets.regen[1], minSector: 3, desc: 'Heals over time' }
};
// BOONS (requirements 2.24). One pick from three after every cleared wave before a boss.
// They belong to the hero, not to the weapon, so a swap keeps them, and they last until the
// run ends. The metal follows the loot ladder: copper boons add stats and stack, silver
// ones change how you fight, gold ones deepen what you carry and are offered only when
// they apply. `n` is the number the description quotes - keep the two in step.
const BOONS = {
  keen:        { metal: 'common', max: 3, n: 0.15, desc: '+15% damage' },
  quick:       { metal: 'common', max: 3, n: 0.12, desc: 'Attacks 12% faster' },
  reach:       { metal: 'common', max: 3, n: 20,   desc: '+20 attack range' },
  feet:        { metal: 'common', max: 3, n: 20,   desc: '+20 move speed' },
  iron:        { metal: 'common', max: 3, n: 20,   desc: '+20 max health, and heals 20 now' },
  hide:        { metal: 'common', max: 3, n: 0.08, desc: 'Take 8% less damage' },
  ground:      { metal: 'rare', max: 1, n: 0.35, not: 'run', desc: '+35% damage while you stand still' },
  run:         { metal: 'rare', max: 1, n: 0.25, not: 'ground', desc: 'Attacks 25% faster while you move' },
  second:      { metal: 'rare', max: 2, desc: 'Every attack hits one more enemy' },
  readslam:    { metal: 'rare', max: 1, n: 0.5, ms: 4000, desc: "Step out of a slam's red zone and you hit 50% harder for 4 seconds" },
  laststand:   { metal: 'rare', max: 1, n: 0.4, below: 0.3, speed: 30, desc: 'Below 30% health: +40% damage and +30 speed' },
  greed:       { metal: 'rare', max: 1, n: 0.25, hurt: 0.10, desc: `+25% ${N.currency}, but enemies hit 10% harder` },
  rot:         { metal: 'epic', max: 1, weapon: 'venom', desc: 'A poisoned enemy that dies passes its poison to the nearest enemy' },
  bloodshield: { metal: 'epic', max: 1, weapon: 'vampiric', n: 25, desc: 'Healing past full health becomes a shield, up to 25' },
  fork:        { metal: 'epic', max: 1, weapon: 'chain', desc: 'Each chain jumps to two enemies, not one' },
  cleancut:    { metal: 'epic', max: 1, weapon: 'executioner', n: 0.35, desc: 'Its bonus starts at 35% health, not 25%' },
  kindling:    { metal: 'epic', max: 1, tejas: true, n: 0.3, desc: `${N.supercharge} fills 30% faster` },
  hunger:      { metal: 'epic', max: 1, n: 3, desc: `During ${N.phases.eclipse}, every kill heals 3` }
};
// Odds of each metal per card, by level (deeper levels use the last row): silver and
// gold grow with depth, one more reason to Descend.
const BOON_ODDS = { 1: { common: 65, rare: 28, epic: 7 }, 2: { common: 50, rare: 35, epic: 15 }, 3: { common: 40, rare: 35, epic: 25 } };
const BOON_REROLLS = 1;   // free rerolls per level

// WAVE SHAPES (requirements 2.25). Every run used to open the same way - four Asura, then
// five, then the Gatekeeper - and nothing but Asura appeared before wave 4. Each ordinary
// wave now draws a shape, never the same one twice running, so two runs do not open alike.
// `from` is the depth (waves since the top) at which a shape may first appear.
// Enemies in a wave = WAVE_BASE + wave + (sector - 1), plus WAVE_OPENING on level 1 only: the
// opening was what felt too easy, and the deeper levels were not. (The base was 3 until 2026-10-03.)
const WAVE_BASE = 4, WAVE_OPENING = 1;
const WAVE_SHAPES = {
  mixed:     { weight: 26, from: 1, gap: 380 },
  swarm:     { weight: 20, from: 1, gap: 170, toast: () => `A SWARM OF ${N.enemies.melee.toUpperCase()}` },
  pincer:    { weight: 20, from: 1, gap: 210, toast: () => 'FROM BOTH SIDES' },
  archers:   { weight: 14, from: 2, gap: 320, toast: () => `${N.enemies.ranged.toUpperCase()} VOLLEY` },
  brute:     { weight: 14, from: 2, gap: 380, toast: () => `${N.enemies.tank.toUpperCase()} AND GUARD` },
  splitters: { weight: 12, from: 4, gap: 340, toast: () => `${N.enemies.splitter.toUpperCase()} BROOD` }
};

// TRIBUTE (requirements 2.26). While a boss lives, every enemy it summoned that you kill
// adds to its tribute, paid when the boss falls: an extra item, then a boon pick, then a
// gold one. The price of waiting: each summons comes sooner than the last (`quicken`,
// down to `fastest` ms), and more of them may stand at once.
// `step`, `heavier` and `faster`: past the gold boon the pay never stops, so neither does
// the price. Every `step` more tribute makes what the boss summons `heavier` tougher and
// harder-hitting and `faster` quicker on its feet, with no ceiling (requirements 2.26,
// 2.36; founder, 2026-10-10). The speed is what makes it end: toughness alone never
// troubled a player who was not touched, and the first Gatekeeper's summons run as fast
// as a hero with no boons at about tribute 215. Deeper bosses reach that sooner.
const TRIBUTE = { item: 5, boon: 10, gold: 15, quicken: 0.92, fastest: 3500, step: 5, heavier: 0.12, faster: 0.04 };

// DEPTHS (requirements 2.30). The well is won seven times over. Slaying Vritra wins the
// depth you are on: a step of the well fills and the next depth opens. Each depth keeps
// every hardship of the ones before it and adds one of its own, and pays more Nidhi.
// It is the reason to come back after the first win, and it costs no new art.
const DEPTHS = [null,
  { name: 'The First Descent', twist: 'The well as it stands.' },
  { name: 'Swift',             twist: 'Enemies move 12% faster.' },
  { name: 'Thin Air',          twist: 'Beating a boss heals 20%, not 35%.' },
  { name: 'Wrath',             twist: 'Bosses slam a quarter more often.' },
  { name: 'Horde',             twist: 'Two more enemies in every wave.' },
  { name: 'Restless',          twist: `${N.phases.convergence} comes every 60 seconds, not 90.` },
  { name: "The Serpent's Own", twist: 'Everything hits a fifth harder.' }
];

// Strays (requirements 2.30; founder, 2026-10-06: "a random extra creep every few waves to
// add to the complexity"). From depth 2 an enemy of a random kind joins some waves,
// whatever the wave's shape: a Brute in a swarm, a Hexer behind a pincer. `every` is the
// longest wait between two of them, in waves, for each depth; the wait itself is a wave
// shorter as often as not, so their coming cannot be counted.
const STRAYS = { every: [0, 0, 3, 3, 2, 2, 1, 1], kinds: ['melee', 'ranged', 'tank', 'splitter'],
                 says: ['', '', 'some', 'some', 'most', 'most', 'every', 'every'] };

// PERKS (requirements 2.30; the "boss-kill perks" pinned as P8). Lasting gifts, earned
// once: the first two from the first Gatekeeper and Hoard Guardian a player beats, the
// rest by winning depths. A player wears two of them (three once depth 4 is won) and
// chooses which on the Profile.
const PERKS = {
  guard:  { name: "Sentinel's Guard", icon: 'icon_aegis',    from: 'gatekeeper', desc: 'Start every level with one hit blocked' },
  eye:    { name: "Hoarder's Eye",    icon: 'icon_mystery',  from: 'sectorboss', desc: 'Enemies drop items a third more often', n: 24 },
  scale:  { name: "Serpent's Scale",  icon: 'boon_hide',     depth: 1, desc: 'Take 10% less damage', n: 0.10 },
  lungs:  { name: 'Deep Lungs',       icon: 'icon_vitality', depth: 2, desc: '+25 max health', n: 25 },
  wind:   { name: 'Second Wind',      icon: 'icon_regen',    depth: 3, desc: 'Once a run, a killing blow leaves you on 30% health', n: 0.3 },
  study:  { name: 'Quick Study',      icon: 'boon_keen',     depth: 4, desc: 'Start every run with a boon waiting' },
  reroll: { name: 'Second Thoughts',  icon: 'boon_quick',    depth: 5, desc: 'One more reroll on every level' },
  taker:  { name: 'Tribute Taker',    icon: 'boon_greed',    depth: 6, desc: 'Tribute pays at 4, 8 and 12, not 5, 10 and 15' }
};
const PERK_TINT = 0xd89bff, TRIBUTE_TAKER = { item: 4, boon: 8, gold: 12 };

// POWER (requirements 2.28). One number for how strong the hero is, the way Destiny shows
// one: everything carried adds a fixed, visible amount, so equipping an item or taking a
// boon moves it by a figure the player can learn. It is a gear score, not a formula for
// damage - the stats on the profile screen give the real numbers.
const POWER = { base: 100, upgrade: 8, weapon: { common: 20, rare: 45, epic: 80 }, shot: 15, effect: 15,
                trinket: { common: 15, rare: 30, epic: 50 }, boon: { common: 10, rare: 25, epic: 40 }, tejas: 30, perk: 20 };

// VRITRA (requirements 2.6). The final boss is the serpent who drank the world's waters.
// He was a stock sprite of something else, then (2026-10-04) a chain of segments drawn by
// code. Since 2026-10-11 he is the founder's own picture of him, a figure like the others
// (requirements 2.44): a hooded serpent in his coil, who sways where the others walk.

// How much of a hit a boss takes outside its own phase. The rule is first met on level 1,
// so it bites less there: 30%, then 12% from level 2 on (founder, 2026-10-04).
const BOSS_RESIST = { first: 0.30, deeper: 0.12 };

function pickWeaponEffect(sector) {
  const pool = Object.keys(WEAPON_EFFECTS).filter(k => WEAPON_EFFECTS[k].minSector <= sector);
  return Phaser.Utils.Array.GetRandom(pool);
}
function pickTrinketEffect(sector) {
  const pool = Object.keys(TRINKET_EFFECTS).filter(k => TRINKET_EFFECTS[k].minSector <= sector);
  return Phaser.Utils.Array.GetRandom(pool);
}

// The Cosmic Cycle: a continuous, learnable timer independent of waves.
// Predictable on purpose - mastery comes from planning around it, not reacting blind.
// Object keys stay English so save data and existing logic keep working; only the
// player-facing label changes (requirements.md 2.12). Tints are warm now - a cool
// overlay on a forge arena fought the palette.
const PHASE_DEFS = {
  drift:    { label: N.phases.drift.toUpperCase(),  color: 0x4dd0ff, duration: 20000, enemyDmgMult: 1.0,  playerDmgMult: 1.0,  spawnRateMult: 1.0, lootBoost: 0,  tint: 0x3a8aa0, tintAlpha: 0.10 },
  surge:    { label: N.phases.surge.toUpperCase(),  color: 0xff8c42, duration: 12000, enemyDmgMult: 1.0,  playerDmgMult: 1.0,  spawnRateMult: 0.65,lootBoost: 15, tint: 0xff7a1a, tintAlpha: 0.12 },
  eclipse:  { label: N.phases.eclipse.toUpperCase(),  color: 0xc4331f, duration: 10000, enemyDmgMult: 1.3,  playerDmgMult: 1.3,  spawnRateMult: 1.0, lootBoost: 0,  tint: 0x2a0404, tintAlpha: 0.38 },
  convergence: { label: N.phases.convergence.toUpperCase(), color: 0xfffbef, duration: 8000, enemyDmgMult: 1.0, playerDmgMult: 1.0, spawnRateMult: 1.0, lootBoost: 30, tint: 0xfff0c0, tintAlpha: 0.14 }
};
const PHASE_SEQUENCE = ['drift', 'surge', 'eclipse'];
const CONVERGENCE_INTERVAL = 90000;
// Hit circles, as a multiple of what they first were: every enemy's, the hero's, and how
// near a bolt must pass. The founder grew them by a quarter to go with the larger figures
// (2026-10-11, "Grow the hit circles by a quarter") and then took a tenth back the same
// day ("reduce the hit circle by 10%"): 1.25 x 0.9.
const HIT = 1.125;
// The hero's hit circle: how near an enemy's edge can come, and how near a bolt must pass.
// A tenth larger than the others' measure, with the hero drawn a quarter larger
// (2026-10-12, the founder: "hit area 10% bigger").
const HERO_RADIUS = 15 * HIT * 1.1;
// What the hero picks up (requirements 2.53): an item this near any point of him from his
// middle down to his feet, where a player puts him. It was 26 round his middle alone, so an
// item walked over with his feet was missed (2026-10-13, the founder: "Item pickups is too
// buggy... I tried walking over it a few times and the items weren't picked up").
const PICKUP_REACH = 30;
// Catching breath (requirements 2.53; the founder, 2026-10-13: "If I am at low hp, I need to
// gain hp by a small rate"). Unhurt for `after` ms, the hero heals `perSec` of his health a
// second, up to `upTo` of it: whoever stops being hit climbs back to half, and nobody fills
// up by hiding. Healing above half still comes from bosses, the Regen trinket and Vampiric.
const BREATH = { after: 3000, perSec: 0.015, upTo: 0.5 };
const INV_MAX = 8;   // satchel capacity; oldest falls out past this

const ENEMY_TYPES = {
  melee:    { hpMult: 1.0, speedMult: 1.0, dmgMult: 1.0, radius: 12, color: 0xff5c5c },
  ranged:   { hpMult: 0.6, speedMult: 0.85, dmgMult: 0.0, radius: 10, color: 0xffa63c,
              isRanged: true, preferredRange: 175, fireInterval: 1500, projSpeed: 260, projDmgMult: 0.85 },
  tank:     { hpMult: 2.6, speedMult: 0.5, dmgMult: 1.7, radius: 19, color: 0x8a8a9c },
  splitter: { hpMult: 0.85, speedMult: 1.1, dmgMult: 0.85, radius: 11, color: 0xc77dff, splitsOnDeath: true }
};

// weighted pool of types unlocked per wave - depth ramps up as you go deeper
function pickEnemyType(wave) {
  const pool = [['melee', 100]];
  // Rakshasa stay at half weight until depth 5: their bolts were the worst killer of the
  // playtest bot on level 1. Since 2026-10-03 every type arrives a wave earlier - the
  // founder found the opening too easy and too alike from run to run (requirements 2.25).
  if (wave >= 2) pool.push(['ranged', wave >= 5 ? 40 : 20]);
  if (wave >= 2) pool.push(['tank', 30]);
  if (wave >= 3) pool.push(['splitter', 30]);
  const total = pool.reduce((s,p) => s+p[1], 0);
  let r = Phaser.Math.Between(0, total-1);
  for (const [type, weight] of pool) {
    if (r < weight) return type;
    r -= weight;
  }
  return 'melee';
}

// Tips held back until a player has reached level 2 (design-document 1.4, "thin the first run").
const HELD_TIPS = ['tribute', 'satchel'];
// Teaching pauses (requirements 2.35). Five ideas are worth stopping the fight for, once
// each: moving, loot, the + button, the timer over a boss, and slams. Every other tip
// stays a quiet line in the corner. `gap` is the play that must pass between two of them,
// `patience` how long one waits for its moment before giving up unseen, `hold` how long
// the panel's buttons ignore taps (real time: the fight stopped under a moving thumb),
// and `slamGrace` how much longer the slam being taught takes to land.
const LESSONS = ['move', 'loot', 'boon', 'core', 'slam'];
// No rest for a runner (requirements 2.36). Nothing in the well is as fast as the hero, so
// a player who simply ran round the walls could be touched by nothing, for as long as they
// liked. After `after` ms of running with nothing attacked, whatever is chasing sprints
// at `pace` times the hero's own speed whenever he runs, until one of them lands a blow
// or they are all dead. They walk while he stands: turning to fight is always allowed,
// but standing for a moment and running on is not a way out. A player who is fighting
// never meets this.
const HUNT = { on: true, after: 6000, pace: 1.35, tint: 0xff9a80 };
const LESSON = { gap: 4000, patience: 10000, hold: 550, slamGrace: 2, dim: 0.8 };
