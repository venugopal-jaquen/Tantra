/*
 * Headless smoke test: loads the game in a private, MUTED Chrome with its own throwaway
 * profile, clicks through the loading screen, runs the playtest bot, and saves
 * screenshots. Nothing appears on screen and nothing touches your own browser profile or
 * your saved game.
 *
 *   node tools/smoke-test.mjs [output-dir]
 *
 * Needs Chrome or Edge installed and Node 22+ (for the built-in WebSocket). No packages.
 * Exit code 0 = every check passed.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(process.argv[2] || join(tmpdir(), 'anantarya-smoke'));
const PORT = 9333 + Math.floor(Math.random() * 500);
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
];

const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });
const exe = BROWSERS.find(existsSync);
if (!exe) { console.error('No Chrome or Edge found.'); process.exit(2); }
const profile = mkdtempSync(join(tmpdir(), 'anantarya-profile-'));
const browser = spawn(exe, [
  '--headless=new', '--mute-audio', '--autoplay-policy=no-user-gesture-required',
  '--allow-file-access-from-files',        // the game is loaded straight off disk
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--window-size=420,740', 'about:blank'
], { stdio: 'ignore' });

let ws, nextId = 1;
const pending = new Map(), problems = [];
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = nextId++;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
// Evaluate in the page. Top-level consts of the game (session, settings, Music, Loader)
// are visible here, exactly as in the DevTools console.
const page = async (expression) => {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expression} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('page: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
};
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
};
const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  - ' + detail : ''}`);
};

try {
  let target;
  for (let i = 0; i < 60 && !target; i++) {
    await sleep(250);
    try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch { /* not up yet */ }
  }
  if (!target) throw new Error('browser did not start');
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => {
    const m = JSON.parse(ev.data);
    if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); }
    else if (m.method === 'Runtime.exceptionThrown') problems.push('exception: ' + (m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
    else if (m.method === 'Log.entryAdded' && m.params.entry.level === 'error') problems.push('console: ' + m.params.entry.text + ' ' + (m.params.entry.url || '').split('/').pop());
  };
  await send('Page.enable'); await send('Runtime.enable'); await send('Log.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 740, deviceScaleFactor: 2, mobile: false });

  // ---------- 1. loading screen ----------
  await send('Page.navigate', { url: pathToFileURL(join(REPO, 'game', 'loot-chase-v0.1.html')).href });
  let state = 'loading';
  for (let i = 0; i < 80 && state === 'loading'; i++) { await sleep(250); state = await page(`return typeof Loader === 'undefined' ? 'loading' : Loader.state;`); }
  check('loader reaches the Begin button', state === 'ready', state);
  const fonts = await page(`return [...document.fonts].filter(f => f.status === 'loaded').map(f => f.family).filter((f, i, a) => a.indexOf(f) === i);`);
  check('both typefaces loaded', fonts.includes('Yatra One') && fonts.includes('Baloo 2'), fonts.join(', '));
  check('a glossary card is showing', !!(await page(`return document.getElementById('ldr-dev').textContent && document.getElementById('ldr-role').textContent;`)));
  const well0 = await page(`const t = id => document.getElementById(id).textContent;
    return { line: t('ldr-well-line'), sub: t('ldr-well-sub'), legend: t('ldr-well-legend'), after: t('ldr-well-after'),
             water: +document.getElementById('well-water').getAttribute('height'), wall: document.getElementById('well-wall').getAttribute('d').length };`);
  check('the loading screen shows the well, dry on a new save', well0.line === 'The well is dry' && /drunk it dry/.test(well0.sub) && /7 full descents/.test(well0.legend)
    && /game is won/.test(well0.after) && well0.water === 0 && well0.wall > 50, JSON.stringify(well0));
  await sleep(500); await shot('1-loader');

  // The loader must also fit a phone held sideways, and a small phone.
  for (const [w, h, name] of [[740, 360, 'sideways'], [320, 568, 'small phone']]) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: false });
    await sleep(350);
    const fit = await page(`const box = () => { const r = [...document.getElementById('loader').children].map(c => c.getBoundingClientRect());
        return { top: Math.round(Math.min(...r.map(b => b.top))), bottom: Math.round(Math.max(...r.map(b => b.bottom))), left: Math.round(Math.min(...r.map(b => b.left))), right: Math.round(Math.max(...r.map(b => b.right))) }; };
      let worst = box();
      for (let i = 0; i < GLOSSARY.length; i++) { document.getElementById('ldr-card').click(); const b = box(); if (b.bottom - b.top > worst.bottom - worst.top) worst = b; }
      return Object.assign(worst, { cards: GLOSSARY.length, vw: innerWidth, vh: innerHeight });`);
    check(`loader fits a ${name} screen (${w}x${h})`, fit.top >= 0 && fit.bottom <= fit.vh && fit.left >= 0 && fit.right <= fit.vw, JSON.stringify(fit));
    await shot('1-loader-' + name.replace(' ', '-'));
  }
  await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 740, deviceScaleFactor: 2, mobile: false });
  await sleep(250);

  // ---------- 2. hub ----------
  await page(`settings.music = 0; settings.sfx = 0; Loader.begin();`);
  await sleep(900);
  const hub = await page(`const s = game.scene.keys.LootScene; return { state: s.state, title: s.uiObjects.find(o => o.type === 'Text').text, families: [...new Set(s.uiObjects.filter(o => o.type === 'Text').map(o => o.style.fontFamily.split(',')[0]))] };`);
  check('Begin opens the title screen', hub.state === 'hub', JSON.stringify(hub));
  await sleep(1300);
  const music = await page(`return { on: MUSIC_ON, started: Music.inited, tracks: Object.fromEntries(Object.entries(Music.tracks).map(([k, t]) => [k, t.dead ? 'missing' : (t.el.duration ? Math.round(t.el.duration) + 's' : 'loading')])) };`);
  const fxSound = await page(`const s = game.scene.keys.LootScene, was = settings.sfx;
    settings.sfx = 0.8; s.sfx('ui-click'); const playing = game.sound.getAllPlaying().length; settings.sfx = was;
    Unmute.start(game.sound, true); await new Promise(r => setTimeout(r, 400));
    const el = Unmute.el, out = { loaded: Object.keys(SFX).length, playing, context: game.sound.context.state, session: !!navigator.audioSession,
      loop: !!el && !el.paused && el.loop && el.duration > 0.4 && !el.error };
    Unmute.hidden(); out.pausedWhenHidden = el.paused; return out;`);
  check('sound effects play with the music off, and the iOS stand-in loop is valid', fxSound.playing >= 1 && fxSound.context === 'running' && fxSound.loop && fxSound.pausedWhenHidden, JSON.stringify(fxSound));
  if (music.on) check('all three music tracks load', Object.values(music.tracks).length === 3 && Object.values(music.tracks).every(v => v !== 'missing'), JSON.stringify(music.tracks));
  else check('music is switched off and loads nothing', music.started === false && Object.keys(music.tracks).length === 0, JSON.stringify(music));
  await shot('2-title');

  // ---------- 3. a run in real time: HUD, first tip, banner ----------
  await page(`game.scene.keys.LootScene.startRun();`);
  await sleep(1500); await shot('3-run-start');
  const run = await page(`const s = game.scene.keys.LootScene; return { state: s.state, tip: s.hintBox ? s.hintBox[1].text : null, hudBottom: Math.round(s.hudText.y + s.hudText.height), hpBarTop: Math.round(s.hpBarBg.y - s.hpBarBg.height / 2) };`);
  check('first tip shows during the first run', !!run.tip, run.tip || 'none');
  check('HUD line clears the HP bar', run.hudBottom <= run.hpBarTop + 1, `text bottom ${run.hudBottom}, bar top ${run.hpBarTop}`);

  // A tap far away must be WALKED to at the same speed the keys give, never jumped to.
  const walk = await page(`const s = game.scene.keys.LootScene; s.player.iframes = 1e9; s.spawnQueue = []; s.enemies.slice().forEach(e => { e.x = 60; e.y = 640; e.speed = 0; });
    s.player.x = 200; s.player.y = 600; s.setMoveTarget(200, 150); const t0 = performance.now();
    await new Promise(r => setTimeout(r, 500));
    const moved = 600 - s.player.y, secs = (performance.now() - t0) / 1000;
    await new Promise(r => setTimeout(r, 2200));
    return { moved: Math.round(moved), speed: Math.round(moved / secs), arrived: Math.round(s.player.y), target: s.pointerTarget };`);
  check('a tap is walked to at walking speed, not jumped to', walk.speed > 150 && walk.speed < 250 && walk.arrived === 150 && walk.target === null, JSON.stringify(walk));

  // The satchel pauses the fight, says what each item does, and swaps on a tap.
  const satchel = await page(`const s = game.scene.keys.LootScene;
    for (const r of ['rare', 'epic', 'common']) { s.spawnLootPickup(s.player.x, s.player.y, r); await new Promise(r2 => setTimeout(r2, 150)); }
    const stored = s.inventory.length, hp = s.player.hp;
    s.satchelTab.emit('pointerdown');
    const open = { state: s.state, frozen: s.time.paused, texts: s.overlay.filter(o => o.type === 'Text').map(o => o.text) };
    const wasWeapon = s.player.weapon.name, wasTrinket = s.player.trinket && s.player.trinket.name, first = s.inventory[0];
    s.overlay.find(o => o.type === 'Rectangle' && o.input && o.width === 322).emit('pointerdown');
    const swapped = first.type === 'weapon' ? s.player.weapon === first && s.inventory.some(i => i.name === wasWeapon)
                                              : s.player.trinket === first;
    const hpAfterSwap = s.player.hp;
    await new Promise(r => setTimeout(r, 400));
    const safe = s.player.hp >= hpAfterSwap;
    s.resumeGame();
    return { stored, open, swapped, stillStored: s.inventory.length, safe, after: s.state };`);
  await page(`game.scene.keys.LootScene.pauseGame('satchel');`); await sleep(250); await shot('3-satchel'); await page(`game.scene.keys.LootScene.resumeGame();`);
  check('the satchel pauses the fight and swaps on a tap', satchel.open.state === 'paused' && satchel.open.frozen && satchel.stored >= 1 && satchel.swapped
    && satchel.safe && satchel.after === 'playing' && satchel.open.texts.some(t => /damage|health|block|speed|reflected/.test(t)), JSON.stringify(satchel.open.texts).slice(0, 220));

  // A cleared wave ends in a boon pick: the fight freezes, three cards, one reroll, a tap.
  const boon = await page(`const s = game.scene.keys.LootScene;
    s.dismissHint(); s.spawnQueue = []; const wave = s.wave;
    while (s.enemies.length) s.killEnemy(s.enemies[0]);    // splitters leave children: kill until the arena is empty
    await new Promise(r => setTimeout(r, 800));
    const texts = s.overlay.filter(o => o.type === 'Text');
    const open = { state: s.state, frozen: s.time.paused, cards: s.overlay.filter(o => o.type === 'Rectangle' && o.input && o.width === 322).length,
                   described: (s.boonOffer || []).every(k => texts.some(t => t.text === BOONS[k].desc)) };
    const spill = texts.filter(t => { const l = t.x - t.width * t.originX; return l < 27 || l + t.width > 373; }).map(t => t.text.slice(0, 30));
    const card = () => s.overlay.find(o => o.type === 'Rectangle' && o.input && o.width === 322);
    s.rerollBoons(); s.rerollBoons(); const rerolls = s.rerollsLeft, stillOpen = s.state;
    card().emit('pointerdown'); const early = s.state;      // the instant the new cards appear: ignored
    await new Promise(r => setTimeout(r, 400));
    const chosen = s.boonOffer[0]; card().emit('pointerdown'); s.spawnQueue = [];
    return { wave, open, spill, early, rerolls, stillOpen, chosen, after: s.state, next: s.wave, frozen: s.time.paused, rank: s.boons[chosen] };`);
  check('a cleared wave pauses for a pick of three boons', boon.open.state === 'boon' && boon.open.frozen && boon.open.cards === 3 && boon.open.described
    && boon.spill.length === 0, JSON.stringify(boon.open) + (boon.spill.length ? ' SPILL ' + boon.spill.join(' | ') : ''));
  check('one reroll, a stray tap ignored, a pick starts the next wave', boon.early === 'boon' && boon.rerolls === 0 && boon.stillOpen === 'boon'
    && boon.after === 'playing' && !boon.frozen && boon.next === boon.wave + 1 && boon.rank === 1, JSON.stringify(boon));
  await page(`const s = game.scene.keys.LootScene; s.boons.keen = 2; s.boons.iron = 1; s.state = 'playing'; s.offerBoons();`);
  await sleep(300); await shot('3-boons');
  await page(`const s = game.scene.keys.LootScene; s.wave = 0; s.pickBoon(null); s.spawnQueue = []; s.boons = {};`);   // wave 0, so the next pick never lands on the Gatekeeper's wave

  // What the boons actually do, one number each.
  const fx = await page(`const s = game.scene.keys.LootScene, p = s.player, w = p.weapon, out = {}, eff = w.effect;
    s.boons = { keen: 2 }; out.keen = +s.dmgMult().toFixed(2);
    const max0 = p.maxHp; s.wave = 0; s.offerBoons(); s.pickBoon('iron'); s.spawnQueue = []; out.iron = p.maxHp - max0;
    s.boons = { hide: 1 }; p.hp = 100; p.shieldCharge = 0; s.damagePlayer(50, null, 'slam'); out.hide = Math.round(100 - p.hp);
    s.boons = { greed: 1 }; const g0 = s.runGold; s.addGold(100); out.greed = s.runGold - g0;
    s.boons = { reach: 1, second: 1, quick: 1 }; out.range = s.attackRange() - w.range; out.shots = s.attackShots() - (w.shots || 1); out.rate = +s.attackRate().toFixed(2);
    s.boons = { cleancut: 1 }; w.effect = 'executioner'; out.cut = s.executeLine(); w.effect = 'none'; out.cutAsleep = s.executeLine();
    s.boons = { bloodshield: 1 }; w.effect = 'vampiric'; p.hp = p.maxHp - 5; s.healPlayer(20, true); out.shield = p.bloodShield;
    s.damagePlayer(10, null, 'slam'); out.soaked = { shield: p.bloodShield, hp: Math.round(p.maxHp - p.hp) };
    w.effect = eff; p.bloodShield = 0; p.hp = p.maxHp; s.boons = {};
    return out;`);
  check('boons change the numbers they promise', fx.keen === 1.3 && fx.iron === 20 && fx.hide === 46 && fx.greed === 125 && fx.range === 20 && fx.shots === 1
    && fx.rate === 1.12 && fx.cut === 0.35 && fx.cutAsleep === 0.25 && fx.shield === 15 && fx.soaked.shield === 5 && fx.soaked.hp === 0, JSON.stringify(fx));

  // Read the Slam: stand in a ring, step out before it lands, hit harder.
  const read = await page(`const s = game.scene.keys.LootScene, p = s.player; s.boons = { readslam: 1 }; s.slamBuffMs = 0; p.iframes = 1e9;
    s.pickups.forEach(pk => { pk.sprite.destroy(); pk.label.destroy(); }); s.pickups = [];   // loose loot could swap a trinket and change health mid-check
    const e = s.spawnGatekeeper(); e.slamTimer = 1e9; e.slamTypes = ['circle']; e.speed = 0;
    p.x = e.x; p.y = e.y + e.radius + 20; s.beginSlam(e);
    await new Promise(r => setTimeout(r, 250));
    const touched = !!(e.slam && e.slam.touched), hp = p.hp;
    p.x = s.arenaBounds.x + 20; p.y = s.arenaBounds.bottom - 20;
    await new Promise(r => setTimeout(r, 1100));
    const out = { touched, buff: Math.round(s.slamBuffMs), mult: +s.dmgMult().toFixed(2), unhurt: p.hp >= hp, arc: s.boonFx.commandBuffer.length > 0 };
    // Hold Your Ground: the gold ring shows only while it is live.
    s.boons = { ground: 1 }; s.slamBuffMs = 0; await new Promise(r => setTimeout(r, 450));
    out.planted = s.boonFx.commandBuffer.length > 0 && +s.dmgMult().toFixed(2) === 1.35;
    s.setMoveTarget(p.x + 150, p.y - 150); await new Promise(r => setTimeout(r, 200));
    out.walking = s.boonFx.commandBuffer.length === 0 && s.dmgMult() === 1; s.pointerTarget = null;
    s.boons = {}; s.killEnemy(e); await new Promise(r => setTimeout(r, 700));
    if (s.state === 'boon') s.pickBoon(null); s.spawnQueue = [];
    return out;`);
  check('reading a slam makes the next hits harder', read.touched && read.buff > 2500 && read.mult === 1.5 && read.unhurt, JSON.stringify(read));
  check('timed boons show on Kiran while they are live', read.arc && read.planted && read.walking, JSON.stringify(read));

  // Wave shapes: a first-ever run opens gently; after that waves vary and never repeat a shape.
  const waves = await page(`const s = game.scene.keys.LootScene, out = { shapes: {}, repeat: false };
    const keep = { wave: s.wave, depth: s.depth, best: session.bestSector, last: s.lastShape };
    s.showToast = () => {};                                   // 300 waves are built here: no toasts
    session.bestSector = 0; s.sector = 1; s.wave = 1; s.depth = 1; s.buildWave();
    out.gentle = { n: s.spawnQueue.length, plain: s.spawnQueue.every(e => e.type === 'melee' && !e.weak) };
    session.bestSector = 1; const early = new Set(); for (let i = 0; i < 80; i++) early.add(s.buildWave());
    out.early = [...early].sort().join(','); out.opening = s.spawnQueue.length >= 6;
    s.wave = 4; s.depth = 4; let prev = null;
    for (let i = 0; i < 200; i++) { const sh = s.buildWave(); out.shapes[sh] = (out.shapes[sh] || 0) + 1; if (sh === prev && sh !== 'mixed') out.repeat = true; prev = sh; }
    const q = sh => { s.buildWave(sh); return s.spawnQueue.slice(); };
    out.swarm = q('swarm').length; out.swarmWeak = q('swarm').every(e => e.weak && e.type === 'melee');
    out.pincer = [...new Set(q('pincer').map(e => e.edge))].sort().join('');
    out.archers = q('archers').filter(e => e.type === 'ranged').length; out.brute = q('brute').filter(e => e.type === 'tank').length;
    out.split = q('splitters').filter(e => e.type === 'splitter').length; out.mixed = q('mixed').length;
    delete s.showToast;
    Object.assign(s, { wave: keep.wave, depth: keep.depth, lastShape: keep.last, spawnQueue: [], spawnGap: 380 }); session.bestSector = keep.best;
    return out;`);
  check('waves take different shapes, and a first run opens gently', waves.gentle.n === 4 && waves.gentle.plain && waves.early === 'mixed,pincer,swarm' && waves.opening
    && Object.keys(waves.shapes).length === 6 && !waves.repeat && waves.swarm === 15 && waves.swarmWeak && (waves.pincer === '01' || waves.pincer === '23')
    && waves.archers === 4 && waves.brute === 1 && waves.split === 5 && waves.mixed === 9, JSON.stringify(waves));

  // Tribute: summoned enemies killed before the boss falls are counted on the boss and paid out.
  const trib = await page(`const s = game.scene.keys.LootScene, p = s.player; p.iframes = 1e9; s.boons = {}; s.dismissHint();
    const e = s.spawnGatekeeper(); e.slamTimer = 1e9; e.speed = 0; e.summonTimer = 0; const every0 = e.summonEvery;
    await new Promise(r => setTimeout(r, 250));
    const summoned = s.enemies.filter(m => m.summonedBy === e.id);
    const out = { summoned: summoned.length, quicker: e.summonEvery < every0 };
    e.summonTimer = 1e9; summoned.forEach(m => s.killEnemy(m)); out.count = e.tribute; out.label = e.nameLabel.text;
    const loot0 = s.pickups.length; e.tribute = 15; s.killEnemy(e);
    out.items = s.pickups.length - loot0; out.pending = s.pendingTribute;
    await new Promise(r => setTimeout(r, 800));
    out.first = { state: s.state, tribute: s.boonTribute };
    s.pickBoon(s.boonOffer[0]);
    out.second = { state: s.state, tribute: s.boonTribute, head: s.overlay.filter(o => o.type === 'Text')[0].text, metals: s.boonOffer.map(k => BOONS[k].metal) };
    const wave = s.wave; s.pickBoon(s.boonOffer[0]); s.spawnQueue = [];
    out.after = { state: s.state, advanced: s.wave === wave + 1, pending: s.pendingTribute };
    s.boons = {}; return out;`);
  check('summoned enemies killed before a boss falls count as tribute', trib.summoned === 2 && trib.quicker && trib.count === 2 && /tribute 2\/5/.test(trib.label), JSON.stringify(trib));
  check('tribute pays an extra item and a second, better boon pick', trib.items === 2 && trib.pending === 15 && trib.first.state === 'boon' && trib.first.tribute === 0
    && trib.second.state === 'boon' && trib.second.tribute === 15 && /TRIBUTE OF 15 PAID/.test(trib.second.head) && trib.second.metals.every(m => m !== 'common')
    && trib.after.state === 'playing' && trib.after.advanced && trib.after.pending === 0, JSON.stringify(trib));

  // Each sector's floor, with a boss and a slam zone on it to judge legibility.
  await page(`const s = game.scene.keys.LootScene; s.player.iframes = 1e9; s.dismissHint(); const e = s.spawnGatekeeper(); e.slamTimer = 1e9; s.beginSlam(e); s.spawnLootPickup(120, 420, 'epic'); s.spawnLootPickup(280, 500, 'rare');`);
  await sleep(450); await shot('3-floor-sector-1');
  for (const n of [2, 3, 4]) {
    await page(`const s = game.scene.keys.LootScene; s.setFloor(${n}); const e = s.enemies.find(x => x.isBoss); if (e && !e.slam) { e.slamTypes = ['${n === 2 ? 'line' : 'circle'}']; s.beginSlam(e); }`);
    await sleep(450); await shot('3-floor-sector-' + n);
  }
  const floors = await page(`const s = game.scene.keys.LootScene; s.setFloor(1); return { layers: s.floorLayers.length, textures: ['floor-0-0', 'floor-1-0', 'floor-2-0', 'floor-0-1'].filter(k => s.textures.exists(k)).length };`);
  check('each sector paints its own floor', floors.textures === 4 && floors.layers === 1, JSON.stringify(floors));

  // ---------- 4. pause, abandon prompt, death keeps half ----------
  await page(`const s = game.scene.keys.LootScene; s.runGold = 125; s.pauseGame();`);
  await sleep(300); await shot('4-pause');
  await page(`game.scene.keys.LootScene.showAbandonConfirm();`);
  await sleep(300); await shot('5-abandon-prompt');
  const prompt = await page(`return game.scene.keys.LootScene.overlay.filter(o => o.type === 'Text').map(o => o.text).join(' | ');`);
  check('abandon prompt says it counts as a death', /counts as a death/.test(prompt) && /62 of 125/.test(prompt), prompt.replace(/\n/g, ' '));
  const fall = await page(`const s = game.scene.keys.LootScene; const before = session.metaGold; s.abandonRun(); return { banked: session.metaGold - before, state: s.state, banner: !!s.banner, texts: s.uiObjects.filter(o => o.type === 'Text').map(o => o.text) };`);
  check('abandoning banks half the Nidhi', fall.banked === 62 && fall.state === 'summary', JSON.stringify(fall.texts));
  check('sector banner is cleared when a run ends', fall.banner === false);
  await sleep(300); await shot('6-summary');

  // Extract keeps everything; the choice screen says what is at stake.
  const extract = await page(`const s = game.scene.keys.LootScene;
    s.uiObjects.find(o => o.type === 'Rectangle' && o.input).emit('pointerdown');          // Continue to Hub
    s.startRun(); s.runGold = 200; s.showSectorClearChoice(false);
    const copy = s.uiObjects.filter(o => o.type === 'Text').map(o => o.text).join(' | ');
    const before = session.metaGold; s.endRun(true);
    return { copy, banked: session.metaGold - before };`);
  await sleep(200);
  check('extracting banks all of it', extract.banked === 200);
  check('choice screen states the risk', /half is lost/i.test(extract.copy), extract.copy.replace(/\n/g, ' '));
  await page(`const s = game.scene.keys.LootScene; s.uiObjects.find(o => o.type === 'Rectangle' && o.input).emit('pointerdown');`);

  // ---------- 4b. the goal, the near miss and the ending ----------
  const texts = `s.uiObjects.filter(o => o.type === 'Text').map(o => o.text).join(' | ')`;
  const press = `s.uiObjects.find(o => o.type === 'Rectangle' && o.input).emit('pointerdown')`;
  const goal = await page(`const s = game.scene.keys.LootScene; session.water = 0; session.wins = 0; s.showHub();
    const title = ${texts};
    s.startRun(); s.spawnQueue = []; s.player.iframes = 1e9; await new Promise(r => setTimeout(r, 400));
    return { title, hud: s.hudText.text, banner: (s.banner || []).map(t => t.text).join(' | ') };`);
  check('title screen states the goal', /has drunk the well dry/.test(goal.title) && /The well is dry/.test(goal.title), goal.title.replace(/\n/g, ' ').slice(0, 130));
  check('a run shows how far the goal is', goal.hud.startsWith('Level 1 of 3') && /waits two levels below/.test(goal.banner), goal.hud + ' || ' + goal.banner);
  await shot('5b-level-banner');
  const fell = await page(`const s = game.scene.keys.LootScene; s.sector = 2; s.runGold = 100; s.endRun(false); return ${texts};`);
  check('falling says how close you came', /You fell in Jal-Kund, level 2 of 3/.test(fell) && /Vritra waits one level below/.test(fell), fell);
  await sleep(250); await shot('5c-fell');
  const paid = await page(`const s = game.scene.keys.LootScene; ${press};
    s.startRun(); s.spawnQueue = []; s.player.iframes = 1e9; s.wave = 6;
    const b = s.spawnSectorBoss(); b.tribute = 10; const loot0 = s.pickups.length; s.killEnemy(b); const items = s.pickups.length - loot0;
    await new Promise(r => setTimeout(r, 1400));
    const out = { items, state: s.state, tribute: s.boonTribute }; s.pickBoon(s.boonOffer[0]); out.then = s.state;
    s.endRun(false); session.water = 0; saveSession(); return out;`);
  check("a level boss's tribute is paid before the choice screen", paid.items === 3 && paid.state === 'boon' && paid.tribute === 10 && paid.then === 'sectorChoice', JSON.stringify(paid));
  const won = await page(`const s = game.scene.keys.LootScene; ${press};
    s.startRun(); s.spawnQueue = []; s.player.iframes = 1e9; s.sector = 3; s.wave = 6; s.runGold = 300; s.setFloor(3);
    s.killEnemy(s.spawnSectorBoss());
    await new Promise(r => setTimeout(r, 1400));
    return { state: s.state, water: session.water, wins: session.wins, panel: ${texts} };`);
  check('slaying the final boss wins the run', won.state === 'sectorChoice' && won.water === 3 && won.wins === 1 && /THE WATERS RETURN/.test(won.panel), JSON.stringify(won).replace(/\\n/g, ' '));
  await shot('5d-victory');
  const surfaced = await page(`const s = game.scene.keys.LootScene; const before = session.metaGold, carried = s.runGold; ${press};
    const summary = ${texts}; const banked = session.metaGold - before; ${press};
    await new Promise(r => setTimeout(r, 300));
    return { banked, carried, summary, title: ${texts} };`);
  check('surfacing after the win banks everything', surfaced.banked === surfaced.carried && surfaced.carried >= 300 && /VRITRA SLAIN/.test(surfaced.summary), `banked ${surfaced.banked} of ${surfaced.carried} carried | ` + surfaced.summary);
  check('the well on the title screen has filled', /The well is 9% full/.test(surfaced.title), surfaced.title.replace(/\n/g, ' ').slice(0, 160));
  await sleep(900); await shot('5e-title-with-water');
  const packs = await page(`const shape = o => Object.keys(o).sort().map(k => k + (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? '{' + Object.keys(o[k]).sort().join(',') + '}' : '')).join(';');
    return Object.fromEntries(Object.keys(NAME_PACKS).map(k => [k, shape(NAME_PACKS[k]) === shape(NAME_PACKS.sanskrit)]));`);
  check('every name pack has the same entries', Object.keys(packs).length === 3 && Object.values(packs).every(Boolean), JSON.stringify(packs));

  // ---------- 5. every text stays inside its panel ----------
  const spill = await page(`const s = game.scene.keys.LootScene, bad = [];
    const edge = (t, lo, hi, where) => { const l = t.x - t.width * t.originX, r = l + t.width; if (l < lo || r > hi) bad.push(where + ': ' + t.text.slice(0, 32)); };
    for (let pg = 0; pg < 9; pg++) { s.showHowTo(pg, () => s.closeOverlay()); const tx = s.overlay.filter(o => o.type === 'Text'); tx.forEach(t => edge(t, 27, 373, 'how-to ' + pg));
      const body = tx.reduce((a, b) => (b.height > a.height ? b : a)); if (body.y + body.height > 548) bad.push('how-to ' + pg + ' body runs into the page dots'); }
    s.showSettings(() => s.closeOverlay()); s.overlay.filter(o => o.type === 'Text').forEach(t => edge(t, 28, 372, 'settings')); s.closeOverlay();
    for (const tab of ['weapons', 'trinkets', 'tejas']) { s.showCodex(tab); s.uiObjects.filter(o => o.type === 'Text').forEach(t => edge(t, s.arenaBounds.x, s.arenaBounds.right, 'powers/' + tab)); }
    for (const m of ['common', 'rare', 'epic']) { s.showCodex('boons', m); const tx = s.uiObjects.filter(o => o.type === 'Text'); tx.forEach(t => edge(t, s.arenaBounds.x, s.arenaBounds.right, 'powers/boons/' + m));
      if (tx.filter(t => Object.values(BOONS).some(d => d.desc === t.text)).length !== 6) bad.push('powers/boons/' + m + ' does not list six boons');
      const low = Math.max(...tx.filter(t => t.y < 600).map(t => t.y + t.height)); if (low > 622) bad.push('powers/boons/' + m + ' runs into the Back button'); }
    s.showHub(); s.uiObjects.filter(o => o.type === 'Text').forEach(t => edge(t, 0, 400, 'hub'));
    return bad;`);
  check('no text spills its panel', spill.length === 0, spill.join('; '));

  // ---------- 5b. feedback dialog (the mail relay is stubbed: nothing is sent) ----------
  const fbOpen = await page(`window.__sent = []; window.__fetch = window.fetch;
    window.fetch = (url, opts) => { window.__sent.push({ url: String(url), body: JSON.parse(opts.body) });
      return Promise.resolve(new Response(JSON.stringify({ success: 'true' }), { status: 200, headers: { 'Content-Type': 'application/json' } })); };
    Feedback.open(); await new Promise(r => setTimeout(r, 200));
    return { open: Feedback.isOpen, gameKeys: game.input.keyboard.enabled, focus: document.activeElement.id };`);
  check('feedback dialog opens with the text box focused', fbOpen.open && fbOpen.focus === 'fb-text' && fbOpen.gameKeys === false, JSON.stringify(fbOpen));
  // Real key presses for the letters the game itself listens to: they must reach the box.
  for (const [key, code, vk] of [['w', 'KeyW', 87], ['a', 'KeyA', 65], ['s', 'KeyS', 83], ['d', 'KeyD', 68], [' ', 'Space', 32], ['e', 'KeyE', 69], ['p', 'KeyP', 80]]) {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key, code, text: key, unmodifiedText: key, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key, code, windowsVirtualKeyCode: vk, nativeVirtualKeyCode: vk });
  }
  await send('Input.insertText', { text: ' - the bosses are great' });
  const typed = await page(`return document.getElementById('fb-text').value;`);
  check('game keys can be typed into the feedback box', typed === 'wasd ep - the bosses are great', JSON.stringify(typed));
  await shot('8-feedback');
  const fbSent = await page(`document.getElementById('fb-send').click(); await new Promise(r => setTimeout(r, 400));
    const first = window.__sent[0] || {}; const note = document.getElementById('fb-note').textContent;
    await new Promise(r => setTimeout(r, 1500)); window.fetch = window.__fetch;
    return { url: first.url, message: first.body && first.body.message, hasBuild: !!(first.body && first.body.build), note, closed: !Feedback.isOpen, gameKeys: game.input.keyboard.enabled };`);
  check('feedback is posted to the mail relay and the dialog closes', /formsubmit\.co\/ajax\//.test(fbSent.url || '') && fbSent.message === typed && fbSent.hasBuild && fbSent.closed && fbSent.gameKeys === true, JSON.stringify(fbSent));

  // ---------- 6. playtest bot: errors and leaks ----------
  const bot = await page(`
    game.loop.sleep();
    await new Promise((res, rej) => { const el = document.createElement('script'); el.src = '../tools/playtest-bot.js'; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
    const s = game.scene.keys.LootScene;
    s.startRun(); s.showSectorClearChoice(false);          // the bot must cope with a run left on the choice screen
    PlaytestBot.start([{ name: 'fresh', vit: 0, pow: 0, target: 3 }, { name: 'mid', vit: 6, pow: 6, target: 4, tejas: true }, { name: 'grinder', vit: 14, pow: 14, target: 5, tejas: true }, { name: 'no boons', vit: 0, pow: 0, target: 3, boons: false }]);
    while (!PlaytestBot.tick(4000).done) await new Promise(r => setTimeout(r, 0));
    const rep = PlaytestBot.report();
    game.loop.wake();
    return { errors: rep.errors, runs: rep.runs.map(r => ({ p: r.profile, result: r.result, sector: r.finalSector, min: r.gameMin, leak: r.leak, boons: r.boons, lost: r.sectors.map(x => "S" + x.S + ":" + x.hpLostPct + "%").join(" ") })) };`);
  bot.runs.forEach(r => console.log(`      ${r.p}: reached sector ${r.sector} in ${r.min} min with ${r.boons} boons, ${r.result}  [${r.lost}]  leak ${r.leak}`));
  check('bot runs raise no errors', bot.errors.length === 0, bot.errors.join('; '));
  check('bot runs leak nothing', bot.runs.every(r => r.leak <= 0), bot.runs.map(r => r.leak).join(', '));
  await sleep(600); await shot('7-hub-after-bot');

  // Expected noise: music files that are not added yet, and Chrome refusing to vibrate
  // because a headless page has never been tapped. Anything else is a real problem.
  // ---------- 7. names: Option A sectors, and the plain-English pack ----------
  const sectors = await page(`return [1, 2, 3, 4, 9].map(n => sectorTitle(n)).join(' / ');`);
  check('sectors carry the stepwell names', sectors === 'Prangan / Jal-Kund / Nidhi-Kosh / Patal / Patal', sectors);
  await send('Page.navigate', { url: pathToFileURL(join(REPO, 'game', 'loot-chase-v0.1.html')).href + '?names=plain&floors=carved' });
  state = 'loading';
  for (let i = 0; i < 80 && state === 'loading'; i++) { await sleep(250); state = await page(`return typeof Loader === 'undefined' ? 'loading' : Loader.state;`); }
  await shot('9-plain-loader');
  const well1 = await page(`const t = id => document.getElementById(id).textContent;
    return { line: t('ldr-well-line'), sub: t('ldr-well-sub'), after: t('ldr-well-after'), water: +document.getElementById('well-water').getAttribute('height') };`);
  check('the loading screen shows the water already returned', well1.line === 'The well is 9% full' && /^3 of 35/.test(well1.sub) && well1.water > 0 && /The Bottomless Well/.test(well1.after), JSON.stringify(well1));
  const plain = await page(`settings.sfx = 0; settings.tips = false; Loader.begin(); await new Promise(r => setTimeout(r, 500));
    const s = game.scene.keys.LootScene, seen = [];
    const grab = list => list.filter(o => o && o.type === 'Text' && o.text).forEach(o => seen.push(o.text));
    seen.push(document.getElementById('loader').textContent);
    grab(s.uiObjects);
    for (const tab of ['weapons', 'trinkets', 'tejas']) { s.showCodex(tab); grab(s.uiObjects); }
    for (const m of ['common', 'rare', 'epic']) { s.showCodex('boons', m); grab(s.uiObjects); }
    s.showHub(); for (let pg = 0; pg < 9; pg++) { s.showHowTo(pg, () => s.closeOverlay()); grab(s.overlay); } s.closeOverlay();
    session.tejasUnlocked = true; s.startRun(); s.player.iframes = 1e9; grab(s.banner || []);
    for (const t of ['melee', 'ranged', 'tank', 'splitter']) s.spawnEnemyOfType(t, 100, 300, 1, false);
    s.spawnGatekeeper(); s.spawnSectorBoss(); s.spawnLootPickup(200, 300, 'epic'); s.spawnLootPickup(210, 320, 'common');
    await new Promise(r => setTimeout(r, 300));
    grab(s.children.list);
    s.offerBoons(); grab(s.overlay); for (const k of Object.keys(BOONS)) { s.boonOffer = [k]; s.showBoonScreen(); grab(s.overlay); } s.pickBoon(null); s.spawnQueue = [];
    s.pauseGame(); grab(s.overlay); s.showAbandonConfirm(); grab(s.overlay); s.resumeGame();
    s.runGold = 50; s.showSectorClearChoice(false); grab(s.uiObjects); s.endRun(false); grab(s.uiObjects);
    const words = /Asura|Rakshasa|Mahish|Raktabija|Bakasura|Nidhi|Vritra|Shanti|Shakti|Grahan|Pralaya|Tamra|Rajat|Swarna|Katar|Talwar|Chakram|Parashu|Kavach|Kantak|Paduka|Sanjeevani|Tejas|Viram|[\u0900-\u097F]/i;
    const t0 = performance.now(); for (const n of [1, 2, 3]) s.setFloor(n);
    const carved = { set: FLOORS === FLOOR_SETS.carved, floors: [0, 1, 2].filter(k => s.textures.exists('floor-' + k + '-0')).length,
      frames: [0, 1, 2].filter(k => s.textures.exists('frame-floor-' + k + '-0')).length, lights: s.floorLights.length, frameShown: s.frameImg.visible, paintMs: Math.round(performance.now() - t0) };
    return { carved, texts: seen.length, leaks: [...new Set(seen.filter(t => words.test(t)).map(t => t.replace(/\s+/g, ' ').slice(0, 60)))], sample: sectorTitle(1) + ' / ' + N.enemies.melee + ' / ' + N.currency };`);
  check('the carved floor set paints all three levels with their stairs and lights', plain.carved.set && plain.carved.floors === 3 && plain.carved.frames === 3 && plain.carved.lights > 0 && plain.carved.frameShown, JSON.stringify(plain.carved));
  await shot('9-plain-summary');
  check('plain-English pack leaves no Sanskrit on screen', plain.leaks.length === 0 && plain.texts > 80, `${plain.texts} texts read, e.g. ${plain.sample}` + (plain.leaks.length ? ' LEAKS: ' + plain.leaks.join(' | ') : ''));

  const real = problems.filter(p => !/music\/|404|Failed to load resource|navigator\.vibrate/.test(p));
  check('no page errors', real.length === 0, real.join('; '));
} catch (e) {
  check('smoke test ran to the end', false, e.message);
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  browser.kill();
  await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* the browser may still hold it */ }
}
const failed = results.filter(r => !r.ok).length;
console.log(`\n${results.length - failed}/${results.length} checks passed. Screenshots: ${OUT}`);
process.exit(failed ? 1 : 0);
