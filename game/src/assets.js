/*
 * assets.js: which picture stands for what. The art manifest.
 *
 * Declares  characters: CHARS (role -> file name), FACINGS, WALK, WALKERS, ART (each
 *           figure's cell, scale and proportions), STOCK_ART, artOf, artRise, artDrop,
 *           ACT (the strike's timing, ms), SLAM_ACT (a boss's slam on the figure), FEEL and
 *           springBack (how a blow and an arrival move, and the hold on heavy blows),
 *           TOAST_WAITING and TOAST_STALE (the announcement lane's queue),
 *           sortDepth, facingFor, CHAR_LABELS;
 *           the hero: HERO_SIZE, HP_BAR, HERO_BAR_UP, HERO_RING_DOWN, PORTRAIT, WEAR and
 *           WORN (dyes tried by ?wear=);
 *           icons: ICON_FRAMES (the frames of assets/icons/*.png, in order: printed by
 *           tools/cut-icons.py), ICON, FORM_SIGN and the functions that name an icon
 *           (lootIcon, boonIcon, perkIcon, formIcon, EMPTY_ICON, LOCKED_ICON);
 *           the title picture's fit: TITLE_ART;
 *           and gameAssets(): every file the game loads, in one list (wearAssets(slot)
 *           for what a worn piece adds).
 * Needs     config.js, names.js, rules.js (RARITY, BOONS, PERKS, TEJAS_FORMS, when an
 *           icon is named); audio.js (SFX) and floors.js (FLOORS) when the list is made.
 * State     none.
 *
 * The scene's preload() loads gameAssets() and nothing else. tools/check-game.mjs
 * checks that every file and frame named here exists and that nothing is named twice.
 */

const HP_BAR = { w: 42, h: 5, up: 35 };   // the hero's health bar: its size, and how far over the stock figure's middle it floats (HERO_BAR_UP)

// ---------- ICONS (requirements 2.46) ----------
// The founder's icon pictures, cut by tools/cut-icons.py into two sheets of square frames
// (assets/icons/): `icons` for where an icon is drawn large, `icons-small` for where it is
// drawn small. ICON_FRAMES names the frames in the order they lie in both sheets; that tool
// prints the line, and the smoke test holds the two to each other (by the tool's record, icons-cut.json). Loot has a frame for
// each metal, with only its metal recoloured. If the sheets are not there, or the page is
// opened with ?icons=drawn, the game draws the white shapes it always drew (makeLootIcons),
// coloured as they were: one set or the other, never a mix.
const ICON_FRAMES = 'loot-none-common loot-none-rare loot-none-epic loot-venom-common loot-venom-rare loot-venom-epic loot-vampiric-common loot-vampiric-rare loot-vampiric-epic loot-chain-common loot-chain-rare loot-chain-epic loot-executioner-common loot-executioner-rare loot-executioner-epic loot-vitality-common loot-vitality-rare loot-vitality-epic loot-aegis-common loot-aegis-rare loot-aegis-epic loot-thorns-common loot-thorns-rare loot-thorns-epic loot-swift-common loot-swift-rare loot-swift-epic loot-regen-common loot-regen-rare loot-regen-epic loot-mystery boon-keen boon-quick boon-reach boon-feet boon-iron boon-hide boon-ground boon-run boon-second boon-readslam boon-laststand boon-greed boon-rot boon-bloodshield boon-fork boon-cleancut boon-kindling boon-hunger perk-guard perk-eye perk-scale perk-lungs perk-wind perk-study perk-reroll perk-taker sign-treasure sign-power sign-health sign-shield sign-damage sign-speed sign-move sign-fire sign-poison sign-blood sign-lightning sign-execution hud-satchel hud-empty hud-locked hud-drift hud-surge hud-eclipse hud-convergence'.split(' ');
// `grow`: a painted icon fills less of its square than a drawn shape did of its, and has
// more in it to see, so each kind is drawn this much larger than the size asked for.
const ICON = { frame: 128, small: 64, drawn: QUERY.get('icons') === 'drawn',
               grow: { loot: 1.25, boon: 1.12, perk: 1.3, sign: 1.15, hud: 1.15 } };
// An icon is named by three things: its frame in the sheets and, for when the sheets are
// not loaded, the drawn shape that stands in for it and the colour that shape is given.
const FORM_SIGN = { none: 'fire', venom: 'poison', vampiric: 'blood', chain: 'lightning', executioner: 'execution' };
const lootIcon = item => [`loot-${item.effect || 'none'}-${item.rarity}`, `icon_${item.effect || 'none'}`, RARITY[item.rarity].color];
const boonIcon = key => ['boon-' + key, 'boon_' + key, RARITY[BOONS[key].metal].color];
const perkIcon = key => ['perk-' + key, PERKS[key].icon, PERK_TINT];
const formIcon = effect => ['sign-' + FORM_SIGN[effect || 'none'], 'icon_' + (effect || 'none'), TEJAS_FORMS[effect || 'none'].colour];
const EMPTY_ICON = ['hud-empty', 'icon_mystery', 0x5a4535], LOCKED_ICON = ['hud-locked', 'icon_mystery', 0x5a4535];

// Sanskrit roster (requirements.md 2.12). Each entry is a character folder in
// assets/chars/ with four facing frames: -front, -back, -left, -right.
// Art is CraftPix (commercial use, no attribution) - see assets/CREDITS.md.
const CHARS = {
  melee:    'asura',        // असुर     — power-seeking antagonists of the devas
  ranged:   'rakshasa',     // राक्षस    — shape-shifting demons famed for sorcery (maya)
  tank:     'mahish',       // महिष    — the buffalo demon
  splitter: 'raktabija',    // रक्तबीज  — every drop of his blood rose as a new demon
  player:   'kiran',        // the hero's art keeps its first file name; the player names the hero (2.32)
  gatekeeper:  'bakasura',    // बकासुर   — demanded tribute before anyone could pass
  sectorboss:  'nidhiraksha', // निधि-रक्षा — treasure guardian (descriptive, not a figure)
  megaboss:    'vritra'       // वृत्र     — the serpent who hoarded the world's waters
};
const FACINGS = ['front', 'back', 'left', 'right'];
// Walk frames (requirements 2.31). One sheet per character, "<name>-walk": a row for each
// facing, in the order of FACINGS; the first cell of a row is the standing frame and the
// rest are one walk cycle. Cells are larger than the 96px stills so that a stride never
// clips, and a sheet is drawn larger by the same amount (pad), which leaves the figure the
// size it was. Built by tools/extract-walk.py.
// The pace of a walk (2026-10-12, the founder: "the legs just move every few seconds"): a
// figure takes `base` strides a second standing almost still, and `perHeight` more for
// every body-height it covers in a second, so a larger figure strides longer, not slower
// to the eye. A foot coming down settles the body by `land` of its height, and seen from
// the front or back it rocks from foot to foot by `rock` (radians).
const WALK = { frames: 8, cell: 112, pad: 112 / 96, base: 1.0, heavyBase: 0.8, perHeight: 0.5, land: 0.04, rock: 0.04 };
const WALKERS = Object.values(CHARS);          // every figure has a sheet, Vritra too since 2026-10-11
// Art made for this game comes one figure at a time (requirements 2.39), so a figure named
// here has files of its own while the others keep the stock ones: stills of `still` pixels
// and a walk sheet with cells of `cell`, both cut by tools/cut-turnaround.py. `scale` is
// how much larger than the stock figure it is drawn. These figures stand as people do,
// half as wide as they are tall, where the stock cast are squat: at the stock size they
// are slivers on a phone. Nothing about the fight changes with the size: hit circles,
// reach and speed are as they were.
// `per` is how many cells a sheet has for each facing: one standing, WALK.frames walking
// and, in art cut for this game, ACT.cells of a strike (requirements 2.41). `tall` is how
// much of a still the figure fills, where that is not the usual 0.86: a beast on four
// legs is cut to fit the width.
// `wide` is how much of a still the figure's widest view fills. `scale` is how much larger
// a figure is drawn than the stock figure of its kind was: half as large again as first
// set (the founder, 2026-10-10: "the new characters are looking too small in game.. Make
// their size 50% bigger"). It is measured from the stock hit circle, not today's, so the
// circles can be changed (HIT) without anything being drawn differently.
const ART = {
  kiran:       { still: 320, cell: 368, per: 12, scale: 2.8125, wide: 0.46 },      // a quarter larger, 2026-10-12: "Player looks too small"
  asura:       { still: 160, cell: 192, per: 12, scale: 2.55, wide: 0.58 },
  rakshasa:    { still: 160, cell: 192, per: 12, scale: 3.2, wide: 0.5 },
  mahish:      { still: 192, cell: 224, per: 12, scale: 2.25, wide: 0.87 },
  raktabija:   { still: 160, cell: 192, per: 12, scale: 2.55, tall: 0.8, wide: 0.96 },
  bakasura:    { still: 224, cell: 256, per: 12, scale: 2.6, wide: 0.56 },
  nidhiraksha: { still: 224, cell: 256, per: 12, scale: 2.2, tall: 0.75, wide: 0.96 },
  vritra:      { still: 224, cell: 256, per: 12, scale: 2.0, wide: 0.7, sways: true }   // his cells are a sway, not a stride
};
// Figures are drawn in the order they stand, the one nearest the top of the floor first,
// so that whoever is nearer the bottom of the screen is in front. They keep to a band of
// their own just under everything else in the fight (bars, names, rings, beams, loot),
// which is drawn over them as it always was.
const sortDepth = feetY => -0.5 + feetY / 20000;
// What the hero wears (requirements 2.42). The hero's picture is known in four parts, the
// slots: tools/cut-turnaround.py writes a "zone" for each, the pixels of that part in
// every cell of the sheet and in the portrait. A piece worn in a slot is drawn through
// its zone, so it walks and strikes with the figure and shows on the profile and in the
// fight alike. Nothing in the game hands pieces out yet (the pinned cosmetics, P12): the
// only pieces are `dyes`, the same cloth in another colour, and the only way to wear one
// is the address, for trying the slots out: ?wear=head:saffron,legs:indigo
const WEAR = {
  slots: ['head', 'chest', 'legs', 'holster'],
  dyes: { saffron: 0xf0a030, indigo: 0x4a50c8, crimson: 0xc22a3a, moss: 0x5c9a38, ash: 0x8c8c98, gold: 0xe6c040, rose: 0xe070a0, ink: 0x30364a }
};
const WORN = (() => {
  const worn = {};
  (QUERY.get('wear') || '').split(',').forEach(pair => {
    const [slot, piece] = pair.split(':');
    if (WEAR.slots.includes(slot) && Object.prototype.hasOwnProperty.call(WEAR.dyes, piece)) worn[slot] = piece;
  });
  return worn;
})();
const STOCK_ART = { still: 96, cell: WALK.cell, per: WALK.frames + 1, scale: 1 };
const artOf = char => ART[char] || STOCK_ART;
// A strike: how long a figure is drawn back, strikes, and comes out of it, in ms.
const ACT = { cells: 3, back: 70, strike: 100, out: 70 };
// A boss's slam on his own figure (2026-10-12, the founder: "Slam animations still didn't
// work"). Through the warning he rises by `rise` of his height and draws back `lean` from
// where it will land; for the last `gather` ms he holds at the top and trembles. He lets go
// `drop` ms before it lands and comes down hard, lunging `lunge` toward it; he stays in the
// blow for `hold` ms and comes out of it over `out` ms, rooted till then.
const SLAM_ACT = { gather: 300, drop: 80, hold: 200, out: 280, rise: 0.08, lean: 6, lunge: 12 };
// How a blow and an arrival move (requirements 2.52). Struck, a figure squashes and springs
// back past round before it settles (damping ratio 0.4, 7 Hz: follow-through), where it
// used to fade straight back in 140 ms. Arriving, it overshoots its size a little and
// settles (ease-out-back). The heaviest blows hold the fight still for a few frames, so
// they land. A toast leaves in about half the time it took to come.
const FEEL = {
  squash: { ms: 320, x: 0.17, y: 0.15, zeta: 0.4, hz: 7 },
  pop: { ms: 260 },
  hitStop: { slam: 55, boss: 110, elite: 45, hitFrom: 0.12, hitMin: 40, hitMax: 90 },
  toast: { in: 200, hold: 700, out: 110 },
};
// The announcement lane (scene-ui.js showToast, build 0.27): how many messages may wait their turn,
// and how long one may wait before its moment has passed and it is dropped.
const TOAST_WAITING = 3, TOAST_STALE = 2200;
// A damped spring let go from 1 at rest: 1 at t = 0, through 0, a little past, and back.
function springBack(t, zeta, hz) {
  if (t <= 0) return 1;
  const w = 2 * Math.PI * hz, k = Math.sqrt(1 - zeta * zeta);
  return Math.exp(-zeta * w * t) * (Math.cos(w * k * t) + (zeta / k) * Math.sin(w * k * t));
}
// A larger figure stands on the same spot, so its head is higher and its feet lower than
// the stock figure's would be at the same `size` (what charSprite is asked for). By how
// much: a cut still has its feet 44% of its height below the middle, and its head as far
// above the middle as the figure is tall, less that; the stock figure's head was 42% up.
const artRise = (char, size) => { const a = ART[char]; return a ? a.scale * size * ((a.tall || 0.86) - 0.44) - size * 0.42 : 0; };
const artDrop = (char, size) => (artOf(char).scale - 1) * size * 0.44;
// The hero's portrait on the profile: how tall it is drawn, where its feet stand, and how
// much of the picture's height is clear margin below them.
const PORTRAIT = { tall: 172, feet: 281, edge: 0.037 };
const HERO_SIZE = 44;                                                           // the hero's figure, before `scale`
const HERO_BAR_UP = HP_BAR.up + Math.round(artRise(CHARS.player, HERO_SIZE));   // his health bar clears his head
const HERO_RING_DOWN = 16 + Math.round(artDrop(CHARS.player, HERO_SIZE));       // his stance ring lies at his feet

// Shown above every enemy. These are the Sanskrit *type* names, not proper nouns -
// the point is that the player is reading "Asura", "Yaksha", "Mahish" constantly
// during a run, so the Indian identity lands through play rather than through a
// menu nobody opens. Devanagari is deliberately omitted here: at ~9px over a moving
// sprite it turns to mush, and it already carries the identity on the codex screen.
const CHAR_LABELS = N.enemies;
// painted floor sets >>>

// The title screen's view down the shaft: nested square tiers shrinking toward a glowing
// floor. `period` is the time to sink one tier; `twist` turns each tier a little more.
// The title picture (requirements 2.48) is fitted to the screen by tools/fit-title.py, its
// pool at the way in (WELL.cy). `hero` is where the hero stands in it, on the screen:
// nothing of the menu is laid there. `depthY` is where the depth chooser sits above the well.
const TITLE_ART = { hero: { x: 200, top: 318, foot: 430, wide: 56 }, depthY: 196 };

// Movement vector -> facing frame. Vertical wins ties so a diagonal runner
// still reads as advancing rather than flickering between two side frames.
function facingFor(dx, dy) {
  if (Math.abs(dy) >= Math.abs(dx)) return dy >= 0 ? 'front' : 'back';
  return dx >= 0 ? 'right' : 'left';
}

// ---------- Every file the game loads ----------
// The two pictures a worn slot needs: its zone on the hero's sheet and on the portrait.
function wearAssets(slot) {
  return [{ load: 'image', key: `${CHARS.player}-zone-${slot}`, path: `assets/chars/${CHARS.player}-zone-${slot}.png` },
          { load: 'image', key: `${CHARS.player}-portrait-zone-${slot}`, path: `assets/chars/${CHARS.player}-portrait-zone-${slot}.png` }];
}

// The whole list, in the order the scene's preload() asks for it: { load, key, path } and,
// for a sheet of square frames, `frame` (their size). `key` is what the engine knows the
// file by. This is the one place a file's address is written; tools/check-game.mjs
// checks every one is on the disk and that nothing lies in those folders unasked for.
function gameAssets() {
  const list = [];
  // 8 characters x 4 facings. Texture key is "<char>-<facing>", e.g. "asura-left".
  for (const name of Object.values(CHARS)) {
    for (const f of FACINGS) list.push({ load: 'image', key: `${name}-${f}`, path: `assets/chars/${name}-${f}.png` });
  }
  for (const name of WALKERS) list.push({ load: 'spritesheet', key: `${name}-walk`, path: `assets/chars/${name}-walk.png`, frame: artOf(name).cell });
  // The hero's portrait for the profile, at the full size of the picture it was cut from;
  // and, only if something is worn, the zones it is worn through (see dressHero).
  list.push({ load: 'image', key: `${CHARS.player}-portrait`, path: `assets/chars/${CHARS.player}-portrait.png` });
  Object.keys(WORN).forEach(slot => list.push(...wearAssets(slot)));
  // The floor pictures (requirements 2.43), if this set of floors has any.
  FLOORS.forEach(theme => { if (theme.picture) list.push({ load: 'image', key: `floor-pic-${theme.picture}`, path: `assets/floors/level-${theme.picture}.jpg` }); });
  list.push({ load: 'image', key: 'bg_stars', path: 'assets/bg-stars.png' });
  list.push({ load: 'image', key: 'title_art', path: 'assets/title-art.jpg' });
  // The icon pictures (requirements 2.46). Without them the game draws its own.
  if (!ICON.drawn) {
    list.push({ load: 'spritesheet', key: 'icons', path: 'assets/icons/icons.png', frame: ICON.frame });
    list.push({ load: 'spritesheet', key: 'icons-small', path: 'assets/icons/icons-small.png', frame: ICON.small });
  }
  for (const [key, def] of Object.entries(SFX)) {
    for (const f of def.files || [key]) list.push({ load: 'audio', key: f, path: `assets/sfx/${f}.wav` });
  }
  return list;
}
