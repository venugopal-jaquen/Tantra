/*
 * Quick checks of the game's tables, sums, save and files: no browser, a second or two.
 *
 *   node tools/check-game.mjs                    the game in game/
 *   node tools/check-game.mjs --package dist/itch   also: what tools/build-itch.py staged
 *
 * It runs the game's own scripts (game/src, in the order the page names them) in a bare
 * JavaScript context with a stand-in for the browser, so the tables and functions it
 * tests are the real ones, not copies. The loading screen, the dialogs and the start of
 * the engine are left out: they need a page. What needs the engine to draw or a fight
 * to happen is tools/smoke-test.mjs's to check, in a real browser.
 *
 * Checks: the order of the scripts; that every word pack says the same things; that
 * every boon, perk, item, power, phase and figure has its words, its icon and its
 * pictures; that every file the game loads is on the disk and nothing lies beside them
 * unasked for; the save, old and new and broken; and the sums.
 */
import vm from 'node:vm';
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GAME = join(REPO, 'game');
const PAGE = join(GAME, 'loot-chase-v0.1.html');
const PACKAGE = process.argv.includes('--package') ? resolve(process.argv[process.argv.indexOf('--package') + 1]) : null;
const NEEDS_A_PAGE = ['src/loader.js', 'src/dialogs.js', 'src/boot.js'];

let passed = 0, failed = 0;
const check = (name, ok, detail = '') => { ok ? passed++ : failed++; console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${ok && !detail ? '' : '  - ' + detail}`); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------- the page's scripts, in its order ----------
const html = readFileSync(PAGE, 'utf8');
const named = [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"/g)].map(m => m[1]);
const scripts = named.map(s => s.replace(/\?.*$/, ''));        // the file, without the build it is asked for at
const own = scripts.filter(s => !s.startsWith('vendor/'));
const inSrc = readdirSync(join(GAME, 'src')).filter(n => n.endsWith('.js')).map(n => 'src/' + n).sort();
check('the page names every script in game/src once, and the engine between those that come before it and those that need it',
  same([...own].sort(), inSrc) && new Set(own).size === own.length && scripts.filter(s => s.startsWith('vendor/')).length === 1 && !/<script(?![^>]*\bsrc=)/.test(html),
  own.length + ' scripts; ' + own.map(s => s.slice(4, -3)).join(' > '));

// Each of the game's own scripts and its stylesheet is asked for at the build's own address
// (BUILD_TAG, config.js): a phone with the last build in its cache must not mix the two.
{ const tag = (/const BUILD = '([^ ']+)/.exec(readFileSync(join(GAME, 'src/config.js'), 'utf8')) || [])[1];
  const sheets = [...html.matchAll(/<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1]);
  // and the site's front page sends a player to the game at it too
  const front = existsSync(join(GAME, '..', 'index.html')) ? [...readFileSync(join(GAME, '..', 'index.html'), 'utf8').matchAll(/(?:url=|href=")(game\/[^"\s>]+)/g)].map(m => m[1]) : [];
  const untagged = named.filter(s => !s.startsWith('vendor/')).concat(sheets, front).filter(s => !s.endsWith('?v=' + tag));
  check('the page asks for each of its scripts and its stylesheet at the build\'s own address, ?v=' + tag + ', and the front page sends players there',
    !!tag && sheets.length === 1 && (PACKAGE || front.length >= 1) && untagged.length === 0, untagged.slice(0, 4).join('; ')); }

// A stand-in for the browser, enough for the scripts to define themselves. `store` is what
// the browser would keep; `search` is the page's address after the question mark.
function load(search = '', store = null, { only = null, breakStorage = false } = {}) {
  const kept = store || {}, writes = [];
  const localStorage = breakStorage ? { getItem() { throw new Error('no storage'); }, setItem() { throw new Error('no storage'); } }
    : { getItem: k => (k in kept ? kept[k] : null), setItem: (k, v) => { kept[k] = String(v); writes.push(k); } };
  const ctx = vm.createContext({ console, URLSearchParams, setTimeout, clearTimeout, performance, localStorage, location: { search },
    devicePixelRatio: 2, navigator: {}, document: { addEventListener() {}, getElementById: () => null, createElement: () => ({ getContext: () => null, style: {} }) },
    Phaser: { Scene: class {}, Math: { Between: (a, b) => a, Clamp: (v, a, b) => Math.min(b, Math.max(a, v)), RND: { uuid: () => 'id' } }, Utils: { Array: { GetRandom: a => a[0] } } } });
  ctx.window = ctx;
  for (const s of own) {
    if (NEEDS_A_PAGE.includes(s) || (only && !only.includes(s))) continue;
    vm.runInContext(readFileSync(join(GAME, s), 'utf8'), ctx, { filename: s });
  }
  return { get: expr => vm.runInContext(expr, ctx), kept, writes };
}

let g;
try { g = load(); check('every script that needs no page defines itself in a bare context, in the page\'s order, with no name declared twice', true); }
catch (e) { check('every script that needs no page defines itself in a bare context, in the page\'s order, with no name declared twice', false, String(e).split('\n')[0]); process.exit(1); }

// ---------- words ----------
const shape = o => Object.keys(o).sort().map(k => k + (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? '{' + shape(o[k]) + '}' : '')).join(';');      // a list is a leaf: each pack has its own number of loading cards
const packs = g.get('Object.keys(NAME_PACKS)');
{ const shapes = packs.map(p => shape(g.get(`NAME_PACKS.${p}`)));
  check('every word pack has the same entries', packs.length === 3 && shapes.every(s => s === shapes[0]), packs.join(', ')); }
check('the address chooses the pack: ?names=plain, and the default without it',
  load('?names=plain', null, { only: ['src/config.js', 'src/names.js'] }).get('N === NAME_PACKS.plain') && g.get('N === NAME_PACKS[NAME_PACK]'));

// ---------- every thing has its words, its icon and its pictures ----------
const frames = g.get('ICON_FRAMES'), cut = JSON.parse(readFileSync(join(GAME, 'assets', 'incoming', 'well-delver', 'icons-cut.json'), 'utf8'));
check('the game names the icon frames as the tool that cut them does, each once', same(frames, cut.frames.map(f => f.name)) && new Set(frames).size === frames.length, frames.length + ' frames');
const lacking = [];
const want = (ok, what) => { if (!ok) lacking.push(what); };
const rar = g.get('Object.keys(RARITY)'), boons = g.get('BOONS'), perks = g.get('PERKS');
for (const p of packs) {
  const n = g.get(`NAME_PACKS.${p}`);
  for (const k of Object.keys(boons)) want(Array.isArray(n.boons[k]), `${p}: no words for boon ${k}`);
  for (const k of g.get('Object.keys(WEAPON_EFFECTS)')) { want(n.weapons[k], `${p}: no words for weapon ${k}`); want(n.forms[k], `${p}: no words for the power of ${k}`); }
  for (const k of g.get('Object.keys(TRINKET_EFFECTS)')) want(n.trinkets[k], `${p}: no words for trinket ${k}`);
  for (const k of g.get('Object.keys(PHASE_DEFS)')) want(n.phases[k], `${p}: no word for phase ${k}`);
  for (const k of [...g.get('Object.keys(ENEMY_TYPES)'), 'gatekeeper', 'sectorboss', 'megaboss']) want(n.enemies[k], `${p}: no word for ${k}`);
  for (const k of rar) want(n.metals[k], `${p}: no word for metal ${k}`);
}
for (const [k, b] of Object.entries(boons)) {
  want(rar.includes(b.metal), `boon ${k}: metal ${b.metal}`);
  want(frames.includes(g.get(`boonIcon('${k}')[0]`)), `boon ${k}: no icon`);
  if (b.weapon) want(g.get(`'${b.weapon}' in WEAPON_EFFECTS`), `boon ${k}: weapon ${b.weapon}`);
  if (b.not) want(b.not in boons, `boon ${k}: not ${b.not}`);
  want(typeof b.desc === 'string' && b.max >= 1, `boon ${k}: desc or max`);
}
for (const k of Object.keys(perks)) { want(frames.includes(g.get(`perkIcon('${k}')[0]`)), `perk ${k}: no icon`); want(perks[k].name && perks[k].desc, `perk ${k}: name or desc`); }
for (const k of g.get('Object.keys(WEAPON_EFFECTS)')) {
  want(frames.includes(g.get(`formIcon('${k}')[0]`)) && g.get(`'${k}' in TEJAS_FORMS && '${k}' in TEJAS_FX && '${k}' in WEAPON_FX`), `weapon ${k}: its power's sign, form or colours`);
  for (const r of rar) want(frames.includes(g.get(`lootIcon({ effect: '${k}', rarity: '${r}' })[0]`)), `weapon ${k} in ${r}: no icon`);
}
for (const k of g.get('Object.keys(TRINKET_EFFECTS)')) for (const r of rar) want(frames.includes(g.get(`lootIcon({ effect: '${k}', rarity: '${r}' })[0]`)), `trinket ${k} in ${r}: no icon`);
for (const k of g.get('Object.keys(PHASE_DEFS)')) want(frames.includes('hud-' + k), `phase ${k}: no sign`);
for (const k of g.get('PHASE_SEQUENCE')) want(g.get(`'${k}' in PHASE_DEFS`), `phase ${k} is in the sequence and not defined`);
for (const k of ['loot-mystery', 'hud-empty', 'hud-locked', 'hud-satchel', 'sign-treasure', 'sign-power', 'sign-health', 'sign-shield', 'sign-damage', 'sign-speed', 'sign-move']) want(frames.includes(k), `no icon ${k}`);
for (const [role, name] of Object.entries(g.get('CHARS'))) { want(g.get(`'${name}' in ART`), `figure ${name} (${role}): not in ART`); if (role !== 'player') want(g.get(`!!CHAR_LABELS.${role}`), `figure ${role}: no label`); }
for (const k of g.get('Object.keys(ENEMY_TYPES)')) want(g.get(`'${k}' in CHARS`), `enemy ${k}: no figure`);
want(g.get('DEPTHS.length === DEPTH_MAX + 1'), 'DEPTHS and DEPTH_MAX disagree');
for (const k of g.get('LESSONS')) want(typeof k === 'string', 'a lesson');
check('every boon, perk, item, power, phase and figure has its words in all three packs, its icon and its table entries', lacking.length === 0,
  lacking.slice(0, 6).join('; ') || `${Object.keys(boons).length} boons, ${Object.keys(perks).length} perks, ${g.get('Object.keys(WEAPON_EFFECTS).length + Object.keys(TRINKET_EFFECTS).length')} items`);

// ---------- files ----------
const pngSize = file => { const b = readFileSync(file); return [b.readUInt32BE(16), b.readUInt32BE(20)]; };
const wanted = g.get('JSON.stringify([...gameAssets(), ...WEAR.slots.flatMap(wearAssets)])');
const assets = JSON.parse(wanted), paths = assets.map(a => a.path);
const filesIn = (root) => ['assets/chars', 'assets/floors', 'assets/icons', 'assets/sfx'].flatMap(d => readdirSync(join(root, d)).map(n => d + '/' + n));
{ const missing = paths.filter(p => !existsSync(join(GAME, p))), stray = filesIn(GAME).filter(p => !paths.includes(p));
  check('every file the game loads is in game/, each named once, and nothing lies in its picture and sound folders unasked for',
    missing.length === 0 && stray.length === 0 && new Set(paths).size === paths.length && new Set(assets.map(a => a.key)).size === assets.length,
    missing.concat(stray.map(s => 'unasked for: ' + s)).slice(0, 5).join('; ') || paths.length + ' files');
  const wrong = [];
  for (const a of assets.filter(a => a.load === 'spritesheet')) {
    const [w, h] = pngSize(join(GAME, a.path));
    if (w % a.frame || h % a.frame) wrong.push(`${a.path} is ${w} x ${h}, not whole frames of ${a.frame}`);
    const walker = a.key.endsWith('-walk') && a.key.slice(0, -5);
    if (walker && (w / a.frame) * (h / a.frame) < 4 * g.get(`artOf('${walker}').per`)) wrong.push(`${a.path} has too few frames`);
    if (a.key.startsWith('icons') && (w / a.frame) * (h / a.frame) < frames.length) wrong.push(`${a.path} has fewer frames than the game names`);
  }
  for (const [role, name] of Object.entries(g.get('CHARS'))) { const [w, h] = pngSize(join(GAME, `assets/chars/${name}-front.png`)), s = g.get(`artOf('${name}').still`); if (w !== s || h !== s) wrong.push(`${name}-front is ${w} x ${h}, not ${s}`); }
  check('every sheet is whole frames of the size the game cuts it by, with frames enough, and every still is the size ART says', wrong.length === 0, wrong.slice(0, 4).join('; ')); }
if (PACKAGE) {
  const page = readFileSync(join(PACKAGE, 'index.html'), 'utf8'), named = [...page.matchAll(/<script\b[^>]*\bsrc="([^"]+)"|<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1] || m[2]);
  const missing = [...named.map(p => p.replace(/\?.*$/, '')), ...paths].filter(p => !existsSync(join(PACKAGE, p))), stray = filesIn(PACKAGE).filter(p => !paths.includes(p));
  const extra = ['incoming', 'music', 'tools', 'docs'].filter(d => existsSync(join(PACKAGE, 'assets', d)) || existsSync(join(PACKAGE, d)));
  check('the package holds every script, sheet, picture and sound the game names, and none of the sources, music or tools',
    missing.length === 0 && stray.length === 0 && extra.length === 0 && same(named, [...html.matchAll(/<script\b[^>]*\bsrc="([^"]+)"|<link rel="stylesheet" href="([^"]+)"/g)].map(m => m[1] || m[2])),
    missing.concat(stray, extra).slice(0, 5).join('; ') || named.length + ' scripts and sheets, ' + paths.length + ' pictures and sounds');
}

// ---------- the save ----------
const PERSIST = ['src/config.js', 'src/names.js', 'src/rules.js', 'src/calculations.js', 'src/persistence.js'];
const KEY = g.get('SAVE_KEY'), SKEY = g.get('SETTINGS_KEY');
check('the save and the settings are kept under the names they always were', KEY === 'loot-chase-session-v1' && SKEY === 'loot-chase-settings-v1', KEY + ', ' + SKEY);
{ const f = load('', {}, { only: PERSIST }), s = f.get('session');
  check('a first visit: nothing won, nothing owned, and merely opening the game writes nothing',
    s.metaGold === 0 && s.depthsWon === 0 && s.water === 0 && same(s.perks, {}) && same(s.perksOn, []) && same(s.hintsSeen, {}) && same(s.records, { tribute: {}, bosses: {}, runs: 0, slain: 0, bestHaul: 0 }) && s.nickname === '' && f.writes.length === 0,
    JSON.stringify(s).slice(0, 120)); }
{ const now = { metaGold: 460, vitalityLevel: 4, powerLevel: 3, bestSector: 3, tejasUnlocked: true, hintsSeen: { loot: true }, water: 11, wins: 2, wellFullSeen: false, gateTaught: true, lessonsOff: true, slamTaught: true,
    records: { tribute: { gatekeeper: 31 }, bosses: { megaboss: 2 }, runs: 40, slain: 900, bestHaul: 512 }, nickname: 'Asha', depthsWon: 2, depthBest: 1, depthPick: 2, perks: { guard: true, eye: true, scale: true }, perksOn: ['guard', 'scale'], somethingNew: 7 };
  const f = load('', { [KEY]: JSON.stringify(now) }, { only: PERSIST }), s = f.get('session');
  check('a save of today comes back whole, a field this build does not know included, and is not written back by opening', same(s, now) && f.writes.length === 0, JSON.stringify(s).slice(0, 100)); }
{ const old = { metaGold: 300, vitalityLevel: 2, powerLevel: 1, bestSector: 3, tejasUnlocked: true, hintsSeen: {}, water: 5, wins: 1 };
  const s = load('', { [KEY]: JSON.stringify(old) }, { only: PERSIST }).get('session');
  check('a save from before the depths, with the well won once: one depth won, its three perks, two of them worn, the water of one depth',
    s.depthsWon === 1 && s.depthBest === 0 && s.depthPick === 0 && same(s.perks, { guard: true, eye: true, scale: true }) && same(s.perksOn, ['guard', 'eye']) && s.water === 5 && s.metaGold === 300 && s.records.runs === 0,
    JSON.stringify({ depthsWon: s.depthsWon, perks: s.perks, perksOn: s.perksOn, water: s.water })); }
{ const old = { metaGold: 80, bestSector: 2, water: 2, wins: 0, hintsSeen: null };
  const s = load('', { [KEY]: JSON.stringify(old) }, { only: PERSIST }).get('session');
  check('a save from before the depths, two bosses beaten and no win: no depth won, two measures in the one attempted, the two perks of the bosses, and its tips started afresh',
    s.depthsWon === 0 && s.depthBest === 2 && same(s.perks, { guard: true, eye: true }) && s.water === 2 && same(s.hintsSeen, {}), JSON.stringify({ depthBest: s.depthBest, perks: s.perks, water: s.water, hintsSeen: s.hintsSeen })); }
{ const part = { depthsWon: 1, depthBest: 0, depthPick: 0, perks: {}, perksOn: [], records: { runs: 9 } };
  const s = load('', { [KEY]: JSON.stringify(part) }, { only: PERSIST }).get('session');
  check('a save from before some of the records: what it had is kept and the rest begin at nothing', same(s.records, { tribute: {}, bosses: {}, runs: 9, slain: 0, bestHaul: 0 }), JSON.stringify(s.records)); }
{ const f = load('', { [KEY]: '{not json', [SKEY]: 'null' }, { only: PERSIST });
  check('a save that cannot be read leaves the game as on a first visit, and is not overwritten by opening', f.get('session.metaGold') === 0 && f.get('settings.sfx') === 0.8 && f.writes.length === 0 && f.kept[KEY] === '{not json'); }
{ const f = load('', null, { only: PERSIST, breakStorage: true });
  f.get('session.metaGold = 99; saveSession(); settings.sfx = 0.2; saveSettings(); 0');
  check('with no storage at all the game keeps its save in memory for the visit, and saving does not fail', f.get('session.metaGold') === 99 && f.get('settings.sfx') === 0.2); }
{ const f = load('', { [KEY]: JSON.stringify({ metaGold: 500, depthsWon: 3, depthBest: 1, depthPick: 2, perks: { guard: true }, perksOn: ['guard'], nickname: 'Asha', records: { runs: 5 } }), [SKEY]: JSON.stringify({ sfx: 0.3, shake: false }) }, { only: PERSIST });
  const before = f.get('JSON.stringify(settings)');
  f.get('resetSession(); 0');
  const s = f.get('session'), kept = JSON.parse(f.kept[KEY]);
  check('Reset save empties the save and writes it, and leaves the settings as the player set them',
    s.metaGold === 0 && s.depthsWon === 0 && same(s.perks, {}) && s.nickname === '' && s.records.runs === 0 && kept.metaGold === 0 && same(f.writes, [KEY]) && f.get('JSON.stringify(settings)') === before && f.get('settings.sfx') === 0.3 && f.get('settings.shake') === false,
    JSON.stringify(f.writes)); }
{ const store = { area: {}, n: 0 }, f = load('', {}, { only: PERSIST });
  f.get('STORE.area = { getItem: k => null, setItem: (k, v) => { globalThis.__put = [k, v]; } }; session.metaGold = 7; saveSession(); 0');
  check('the save goes through one door (STORE), which a test can stand in for', f.get('__put[0]') === KEY && JSON.parse(f.get('__put[1]')).metaGold === 7 && f.writes.length === 0); }

// ---------- sums ----------
const B = boons;
check('an upgrade costs what it always did: 50 and 60 for the first, each level 45% dearer, rounded',
  same([0, 1, 2, 5].map(l => g.get(`upgradeCost('vitalityLevel', ${l})`)), [0, 1, 2, 5].map(l => Math.round(50 * Math.pow(1.45, l)))) && same([0, 1, 4].map(l => g.get(`upgradeCost('powerLevel', ${l})`)), [0, 1, 4].map(l => Math.round(60 * Math.pow(1.45, l)))),
  [0, 1, 2, 5].map(l => g.get(`upgradeCost('vitalityLevel', ${l})`)).join(', '));
check('a drop is worn at once when the slot is empty or it has more Power, whatever its kind (build 0.31); Life Gems and the Iron boon grow 22% a level',
  g.get(`plainlyBetter({ type: 'trinket', effect: 'aegis', rarity: 'common' }, null)`) === true
  && g.get(`plainlyBetter({ type: 'weapon', effect: 'venom', rarity: 'rare', shots: 1 }, { type: 'weapon', effect: 'venom', rarity: 'common', shots: 1 })`) === true
  && g.get(`plainlyBetter({ type: 'weapon', effect: 'venom', rarity: 'common', shots: 1 }, { type: 'weapon', effect: 'venom', rarity: 'rare', shots: 1 })`) === false
  && g.get(`plainlyBetter({ type: 'weapon', effect: 'chain', rarity: 'epic', shots: 3 }, { type: 'weapon', effect: 'venom', rarity: 'common', shots: 1 })`) === true
  && g.get(`plainlyBetter({ type: 'weapon', effect: 'chain', rarity: 'common', shots: 1 }, { type: 'weapon', effect: 'venom', rarity: 'rare', shots: 1 })`) === false
  && g.get(`plainlyBetter({ type: 'trinket', effect: 'aegis', rarity: 'epic' }, { type: 'trinket', effect: 'vitality', rarity: 'common' })`) === true
  && g.get(`plainlyBetter({ type: 'trinket', effect: 'aegis', rarity: 'epic' }, { type: 'weapon', effect: 'none', rarity: 'common', shots: 1 })`) === false
  && g.get(`levelHealth(20, 1)`) === 20 && g.get(`levelHealth(20, 3)`) === 30 && g.get(`levelHealth(46, 4)`) === 84
  && g.get(`plainlyBetter({ type: 'weapon', effect: 'none', rarity: 'common', shots: 2 }, { type: 'weapon', effect: 'none', rarity: 'common', shots: 1 })`) === true
  && g.get(`plainlyBetter({ type: 'trinket', effect: 'swift', rarity: 'common' }, { type: 'trinket', effect: 'swift', rarity: 'common' })`) === false);
check('a death or an abandoned run keeps half the Nidhi, rounded down; a win or an extraction keeps all', g.get('bankedGold(241, false)') === 120 && g.get('bankedGold(1, false)') === 0 && g.get('bankedGold(241, true)') === 241);
check('Nidhi for a kill: Greed adds its share and each depth past the first a fifth, then rounded',
  g.get('goldEarned(10, 0, 1)') === 10 && g.get('goldEarned(10, 1, 1)') === Math.round(10 * (1 + B.greed.n)) && g.get('goldEarned(7, 1, 3)') === Math.round(7 * (1 + B.greed.n) * (1 + g.get('DEPTH_GOLD') * 2)));
{ const all = g.get('damageBonus({ keen: 2, ground: 1, stillMs: 200, lastStand: true, slamBuffMs: 1 })');
  check('damage boons add and do not multiply, and Hold Your Ground begins at 200 ms of standing still, not before',
    all === 1 + 2 * B.keen.n + B.ground.n + B.laststand.n + B.readslam.n && g.get('damageBonus({ keen: 0, ground: 1, stillMs: 199, lastStand: false, slamBuffMs: 0 })') === 1
    && g.get('damageBonus({ keen: 3, ground: 0, stillMs: 999, lastStand: false, slamBuffMs: 0 })') === 1 + 3 * B.keen.n, String(all)); }
check('attack speed: Quick Hands by rank, and Strike on the Run only while the hero means to move',
  g.get('attackRateBonus({ quick: 2, run: 1, moving: true })') === 1 + 2 * B.quick.n + B.run.n && g.get('attackRateBonus({ quick: 2, run: 1, moving: false })') === 1 + 2 * B.quick.n);
check('healing stops at full health; from blood, what is over becomes Blood Shield up to its limit, and exactly full leaves none',
  same(g.get('healed(90, 100, 30, true, true, 0)'), { hp: 100, bloodShield: 20 }) && same(g.get('healed(90, 100, 60, true, true, 10)'), { hp: 100, bloodShield: B.bloodshield.n })
  && same(g.get('healed(90, 100, 10, true, true, 0)'), { hp: 100 }) && same(g.get('healed(90, 100, 30, false, true, 0)'), { hp: 100 }) && same(g.get('healed(90, 100, 30, true, false, 0)'), { hp: 100 }));
// The scene's own methods, run on a plain object in place of the scene: no engine is needed for a sum.
{ const hero = (effect, hp = 100) => `{ boons: { fork: 1, cleancut: 1, laststand: 1, keen: 1 }, player: { weapon: { effect: '${effect}', range: 130, shots: 2 }, hp: ${hp}, maxHp: 100 }, boonRank: LootScene.prototype.boonRank, boonLive: LootScene.prototype.boonLive }`;
  const call = (m, state, args = '') => g.get(`LootScene.prototype.${m}.call(${state}${args ? ', ' + args : ''})`);
  check('a weapon boon sleeps while another weapon is held and wakes when its own comes back; one that needs no weapon never sleeps',
    call('boonLive', hero('venom'), `'fork'`) === 0 && call('boonLive', hero('chain'), `'fork'`) === 1 && call('boonLive', hero('venom'), `'keen'`) === 1
    && call('executeLine', hero('venom')) === 0.25 && call('executeLine', hero('executioner')) === B.cleancut.n);
  check('Last Stand burns below 30% of health and not at it', call('lastStand', hero('venom', 30)) === false && call('lastStand', hero('venom', 29.9)) === true); }
check('enemies grow by the level, and by the depth of the run: level 1 of depth 1 is the measure',
  g.get('sectorDmgMult(1)') === 1 && g.get('sectorHpMult(1)') === 1 && g.get('sectorHpMult(3)') === Math.pow(1.26, 2) && g.get('DEPTH_NOW = 3, sectorHpMult(1)') === 1 + g.get('DEPTH_HEALTH') * 2 && g.get('DEPTH_NOW = 1'));

// No address of anyone's is in the game's files (pre-launch security checklist, line 1): feedback
// goes to FormSubmit's alias. The one address allowed is the example shown in the reply field.
{ const files = [...inSrc, 'loot-chase-v0.1.html'].map(n => join(GAME, n)).concat(existsSync(join(GAME, '..', 'index.html')) ? [join(GAME, '..', 'index.html')] : []);
  const found = files.flatMap(f => (readFileSync(f, 'utf8').match(/[\w.%+-]+@[\w-]+(?:\.[\w-]+)+|gmail|yahoo|hotmail|outlook\.com/gi) || []).filter(m => m !== 'you@example.com'));
  check("no email address is in the game, and feedback goes to the relay's alias", found.length === 0, found.slice(0, 4).join(', ')); }

console.log(`\n${passed}/${passed + failed} checks passed.`);
process.exit(failed ? 1 : 0);
