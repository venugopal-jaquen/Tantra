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
  check('a glossary card is showing', !!(await page(`return document.getElementById('ldr-name').textContent && document.getElementById('ldr-role').textContent;`)));
  const names = await page(`return { hybrid: N === NAME_PACKS.hybrid, devanagari: /[\u0900-\u097F]/.test(document.getElementById('loader').textContent), currency: N.currency, phase: N.phases.eclipse };`);
  check('the default names are the hybrid set, with no Devanagari on the loading screen', names.hybrid && !names.devanagari && names.phase === 'Eclipse', JSON.stringify(names));
  const well0 = await page(`const t = id => document.getElementById(id).textContent;
    return { line: t('ldr-well-line'), sub: t('ldr-well-sub'), legend: t('ldr-well-legend'), after: t('ldr-well-after'),
             water: +document.getElementById('well-water').getAttribute('height'), wall: document.getElementById('well-wall').getAttribute('d').length };`);
  check('the loading screen shows the well, dry on a new save', well0.line === 'The well is dry' && /drunk it dry/.test(well0.sub) && /win a depth/.test(well0.legend) && /There are 7/.test(well0.legend)
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
  const run = await page(`const s = game.scene.keys.LootScene; return { state: s.state, tip: s.hintBox ? s.hintBox[1].text : null, hudBottom: Math.round(s.hudText.y + s.hudText.height), barTop: Math.round(s.phaseBarBg.y - s.phaseBarBg.height / 2), hp: { dx: Math.round(s.hpBarBg.x + s.hpBarBg.width / 2 - s.player.x), dy: Math.round(s.player.y - s.hpBarBg.y), w: s.hpBarBg.width } };`);
  check('first tip shows during the first run', !!run.tip, run.tip || 'none');
  check('HUD line clears the phase bar', run.hudBottom <= run.barTop + 1, `text bottom ${run.hudBottom}, bar top ${run.barTop}`);
  check("the hero's health bar floats over his head", run.hp.dx === 0 && run.hp.dy === 35 && run.hp.w === 42, JSON.stringify(run.hp));

  // Waves are held still for the checks that follow: a queue that never spawns, so a kill
  // is not a cleared wave unless a check empties the queue to make it one.
  const FREEZE = `s.buildWave = () => { s.spawnQueue = [{}]; s.spawnTimer = 1e9; s.lastShape = 'mixed'; return 'mixed'; }; s.spawnQueue = [{}]; s.spawnTimer = 1e9;`;

  // A tap far away must be WALKED to at the same speed the keys give, never jumped to.
  const walk = await page(`const s = game.scene.keys.LootScene; s.player.iframes = 1e9; ${FREEZE} s.enemies.slice().forEach(e => { e.x = 60; e.y = 640; e.speed = 0; });
    s.player.x = 200; s.player.y = 600; s.setMoveTarget(200, 150); const t0 = performance.now();
    await new Promise(r => setTimeout(r, 500));
    const moved = 600 - s.player.y, secs = (performance.now() - t0) / 1000;
    await new Promise(r => setTimeout(r, 2200));
    return { moved: Math.round(moved), speed: Math.round(moved / secs), arrived: Math.round(s.player.y), target: s.pointerTarget };`);
  check('a tap is walked to at walking speed, not jumped to', walk.speed > 150 && walk.speed < 250 && walk.arrived === 150 && walk.target === null, JSON.stringify(walk));

  // Walk frames: every character but Vritra has a sheet; a standing figure shows the first
  // cell of its facing's row, a moving one steps through the rest, and the figure is the
  // size it was as a still.
  const legs = await page(`const s = game.scene.keys.LootScene, per = WALK.frames + 1, wait = ms => new Promise(r => setTimeout(r, ms));
    const stepsOf = async (spr, need) => { const seen = new Set(), rows = new Set();
      for (let i = 0; i < 80 && seen.size < need; i++) { await wait(30); const f = spr.frame.name; if (f % per) { seen.add(f % per); rows.add(Math.floor(f / per)); } }
      return { steps: seen.size, rows: [...rows].join() }; };
    const out = { sheets: WALKERS.filter(n => s.textures.exists(n + '-walk') && s.textures.get(n + '-walk').frameTotal - 1 === per * FACINGS.length).length, walkers: WALKERS.length,
      vritra: s.textures.exists(CHARS.megaboss + '-walk'), onSheet: !!s.playerSprite.walks, size: Math.round(s.playerSprite.baseSX * WALK.cell / WALK.pad), standing: s.playerSprite.frame.name % per };
    s.setMoveTarget(330, 150); out.kiran = await stepsOf(s.playerSprite, 5); out.right = FACINGS.indexOf('right');
    for (let i = 0; i < 60 && s.pointerTarget; i++) await wait(40);
    await wait(320); out.stopped = s.playerSprite.frame.name % per;
    const e = s.spawnEnemyOfType('melee', 70, 330, 1), spr = s.enemySprites.get(e.id);
    out.asura = await stepsOf(spr, 4); out.asuraSize = Math.round(spr.baseSX * WALK.cell / WALK.pad * 10) / 10; out.asuraWants = Math.round(e.radius * 28) / 10;
    e.speed = 0; await wait(320); out.asuraStopped = spr.frame.name % per;
    s.killEnemy(e); return out;`);
  check('every character but Vritra has a walk sheet, and figures keep their size', legs.sheets === 7 && legs.walkers === 7 && !legs.vritra && legs.onSheet && legs.size === 44 && legs.asuraSize === legs.asuraWants, JSON.stringify(legs));
  check('the hero and his enemies step through their walk frames, and stand when they stop', legs.standing === 0 && legs.kiran.steps >= 5 && legs.kiran.rows === String(legs.right) && legs.stopped === 0
    && legs.asura.steps >= 4 && legs.asuraStopped === 0, JSON.stringify(legs));

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

  // A cleared wave earns a boon and the fight goes on; the + button opens the pick when the player likes.
  const boon = await page(`const s = game.scene.keys.LootScene;
    s.dismissHint(); s.spawnQueue = []; const wave = s.wave;
    while (s.enemies.length) s.killEnemy(s.enemies[0]);    // splitters leave children: kill until the arena is empty
    await new Promise(r => setTimeout(r, 800));
    const earned = { state: s.state, frozen: s.time.paused, queued: s.boonQueue.length, next: s.wave, button: s.boonUI.btn.visible, badge: s.boonUI.count.text };
    s.boonUI.btn.emit('pointerdown');
    const texts = s.overlay.filter(o => o.type === 'Text'), glass = () => !!(s.frostRT.overlay && s.frostRT.overlay.visible);
    const open = { state: s.state, frozen: s.time.paused, cards: s.overlay.filter(o => o.type === 'Rectangle' && o.input && o.width === 322).length,
                   described: (s.boonOffer || []).every(k => texts.some(t => t.text === BOONS[k].desc)), glass: glass(), webgl: game.renderer.type === Phaser.WEBGL };
    const spill = texts.filter(t => { const l = t.x - t.width * t.originX; return l < 27 || l + t.width > 373; }).map(t => t.text.slice(0, 30));
    const card = () => s.overlay.find(o => o.type === 'Rectangle' && o.input && o.width === 322);
    const offer = s.boonOffer.join();
    s.closeBoons(); const later = { state: s.state, queued: s.boonQueue.length, frozen: s.time.paused, glass: glass() };
    s.openBoons(); const kept = s.boonOffer.join() === offer;          // closing and reopening is not a free reroll
    s.rerollBoons(); s.rerollBoons(); const rerolls = s.rerollsLeft, stillOpen = s.state;
    card().emit('pointerdown'); const early = s.state;      // the instant the new cards appear: ignored
    await new Promise(r => setTimeout(r, 400));
    const chosen = s.boonOffer[0]; card().emit('pointerdown');
    return { wave, earned, open, spill, later, kept, early, rerolls, stillOpen, chosen, after: s.state, frozen: s.time.paused, rank: s.boons[chosen], left: s.boonQueue.length, button: s.boonUI.btn.visible };`);
  check('a cleared wave earns a boon without stopping the fight', boon.earned.state === 'playing' && !boon.earned.frozen && boon.earned.queued === 1 && boon.earned.next === boon.wave + 1
    && boon.earned.button && boon.earned.badge === '1', JSON.stringify(boon.earned));
  check('the + button opens a pick of three, on frosted glass', boon.open.state === 'boon' && boon.open.frozen && boon.open.cards === 3 && boon.open.described
    && boon.spill.length === 0 && boon.open.glass === boon.open.webgl, JSON.stringify(boon.open) + (boon.spill.length ? ' SPILL ' + boon.spill.join(' | ') : ''));
  check('a pick can wait, keeps its cards, allows one reroll, and ignores a stray tap', boon.later.state === 'playing' && boon.later.queued === 1 && !boon.later.frozen && !boon.later.glass
    && boon.kept && boon.early === 'boon' && boon.rerolls === 0 && boon.stillOpen === 'boon' && boon.after === 'playing' && !boon.frozen && boon.rank === 1 && boon.left === 0 && !boon.button, JSON.stringify(boon));
  // The + key spends a waiting boon, as in Dota; Esc puts the pick off.
  await page(`game.scene.keys.LootScene.queueBoon();`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: '+', code: 'Equal', text: '+', unmodifiedText: '=', windowsVirtualKeyCode: 187, nativeVirtualKeyCode: 187 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: '+', code: 'Equal', windowsVirtualKeyCode: 187, nativeVirtualKeyCode: 187 });
  await sleep(150);
  const byKey = await page(`return game.scene.keys.LootScene.state;`);
  await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Escape', code: 'Escape', windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27 });
  await sleep(150);
  const byEsc = await page(`const s = game.scene.keys.LootScene; return { state: s.state, queued: s.boonQueue.length };`);
  check('the + key opens the pick and Esc puts it off', byKey === 'boon' && byEsc.state === 'playing' && byEsc.queued === 1, byKey + ' ' + JSON.stringify(byEsc));
  await page(`const s = game.scene.keys.LootScene; s.boons = { keen: 2, iron: 1 }; s.queueBoon(12); s.openBoons();`);
  await sleep(300); await shot('3-boons');
  await page(`const s = game.scene.keys.LootScene; s.closeBoons(); s.boonQueue = []; s.refreshBoonButton(); s.boons = {};`);

  // What the boons actually do, one number each.
  const fx = await page(`const s = game.scene.keys.LootScene, p = s.player, w = p.weapon, out = {}, eff = w.effect;
    s.boons = { keen: 2 }; out.keen = +s.dmgMult().toFixed(2);
    const max0 = p.maxHp; s.queueBoon(); s.openBoons(); s.pickBoon('iron'); out.iron = p.maxHp - max0;
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

  // Power: a gear score every item and boon adds to, shown on the HUD and broken down on the profile.
  const pow = await page(`const s = game.scene.keys.LootScene, p = s.player, keepW = p.weapon, keepT = p.trinket; s.boons = {};
    p.weapon = { type: 'weapon', name: 'x', rarity: 'common', shots: 1, effect: 'none', dmg: 10, range: 130, atkSpeed: 500 }; p.trinket = null;
    const base = s.powerParts();
    p.weapon = Object.assign({}, p.weapon, { rarity: 'epic', shots: 3, effect: 'venom' }); const gun = s.powerParts().total - base.total;
    s.boons = { keen: 2, ground: 1, hunger: 1, rot: 1 }; const awake = s.powerParts().boons;      // rot counts: the weapon is venom
    p.weapon.effect = 'none'; const asleep = s.powerParts().boons;
    s.boons = { quick: 1, feet: 2, second: 1 }; const st = s.stats();
    await new Promise(r => setTimeout(r, 150));
    const hud = s.powerText.text, total = s.powerParts().total;
    s.__keep = { w: keepW, t: keepT };
    s.pauseGame('profile');
    const all = s.overlay.filter(o => o.type === 'Text'), texts = all.map(o => o.text);
    const prof = { state: s.state, power: texts.includes(String(total)), rows: ['Health', 'Shield', 'Attack damage', 'Attack speed', 'Move speed'].every(r => texts.includes(r)),
      spill: all.filter(t => { const l = t.x - t.width * t.originX; return l < 27 || l + t.width > 373; }).map(t => t.text.slice(0, 30)) };
    return { base: base.total, gun, awake, asleep, perSecond: +st.perSecond.toFixed(2), move: st.move, targets: st.targets, hud, total, prof };`);
  await sleep(250); await shot('3-profile');
  await page(`const s = game.scene.keys.LootScene; s.resumeGame(); s.boons = {}; s.player.weapon = s.__keep.w; s.player.trinket = s.__keep.t; delete s.__keep;`);
  check('power counts gear and boons, and sleeps a weapon boon with its weapon', pow.base === 120 && pow.gun === 105 && pow.awake === 125 && pow.asleep === 85, JSON.stringify(pow));
  check('the HUD shows power and the profile shows the stats', pow.hud === '\u25C6 Power ' + pow.total && pow.prof.state === 'paused' && pow.prof.power && pow.prof.rows
    && pow.prof.spill.length === 0 && pow.perSecond === 2.24 && pow.move === 240 && pow.targets === 4, JSON.stringify(pow));

  // Read the Slam: stand in a ring, step out before it lands, hit harder.
  const read = await page(`const s = game.scene.keys.LootScene, p = s.player; s.boons = { readslam: 1 }; s.slamBuffMs = 0; p.iframes = 1e9;
    s.pickups.forEach(pk => { pk.sprite.destroy(); pk.label.destroy(); }); s.pickups = [];   // loose loot could swap a trinket and change health mid-check
    const e = s.spawnGatekeeper(); e.slamTimer = 1e9; e.slamTypes = ['circle']; e.speed = 0;
    p.x = e.x; p.y = e.y + e.radius + 20; s.beginSlam(e);
    // Waits are on the event, not the clock: a headless page can stall for a moment.
    const until = async (test, ms) => { for (let i = 0; i < ms / 40 && !test(); i++) await new Promise(r => setTimeout(r, 40)); };
    await until(() => e.slam && e.slam.touched, 1500);
    const touched = !!(e.slam && e.slam.touched), hp = p.hp;
    p.x = s.arenaBounds.x + 20; p.y = s.arenaBounds.bottom - 20;
    await until(() => !e.slam, 3000);
    await new Promise(r => setTimeout(r, 120));
    const out = { touched, buff: Math.round(s.slamBuffMs), mult: +s.dmgMult().toFixed(2), unhurt: p.hp >= hp, arc: s.boonFx.commandBuffer.length > 0 };
    // Hold Your Ground: the gold ring shows only while it is live.
    s.boons = { ground: 1 }; s.slamBuffMs = 0; s.stillMs = 0;
    await until(() => s.stillMs >= 200 && s.boonFx.commandBuffer.length > 0, 2500);
    out.planted = s.boonFx.commandBuffer.length > 0 && +s.dmgMult().toFixed(2) === 1.35;
    s.setMoveTarget(p.x + 150, p.y - 150);
    await until(() => s.moving && s.boonFx.commandBuffer.length === 0, 1500);
    out.walking = s.boonFx.commandBuffer.length === 0 && s.dmgMult() === 1; s.pointerTarget = null;
    s.boons = {}; s.killEnemy(e);
    return out;`);
  check('reading a slam makes the next hits harder', read.touched && read.buff > 3000 && read.mult === 1.5 && read.unhurt, JSON.stringify(read));
  check('timed boons show on the hero while they are live', read.arc && read.planted && read.walking, JSON.stringify(read));

  // Wave shapes: a first-ever run opens gently; after that waves vary and never repeat a shape.
  const waves = await page(`const s = game.scene.keys.LootScene, out = { shapes: {}, repeat: false };
    const keep = { wave: s.wave, depth: s.depth, best: session.bestSector, last: s.lastShape };
    delete s.buildWave;                                       // the real one, for this check
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
    Object.assign(s, { wave: keep.wave, depth: keep.depth, lastShape: keep.last, spawnGap: 380 }); session.bestSector = keep.best;
    ${FREEZE}
    return out;`);
  check('waves take different shapes, and a first run opens gently', waves.gentle.n === 4 && waves.gentle.plain && waves.early === 'mixed,pincer,swarm' && waves.opening
    && Object.keys(waves.shapes).length === 6 && !waves.repeat && waves.swarm === 15 && waves.swarmWeak && (waves.pincer === '01' || waves.pincer === '23')
    && waves.archers === 4 && waves.brute === 1 && waves.split === 5 && waves.mixed === 9, JSON.stringify(waves));

  // Tribute: summoned enemies killed before the boss falls are counted on the boss and paid out.
  const trib = await page(`const s = game.scene.keys.LootScene, p = s.player; p.iframes = 1e9; s.boons = {}; s.dismissHint(); s.boonQueue = []; s.refreshBoonButton();
    const e = s.spawnGatekeeper(); e.slamTimer = 1e9; e.speed = 0; e.summonTimer = 0; const every0 = e.summonEvery;
    await new Promise(r => setTimeout(r, 250));
    const summoned = s.enemies.filter(m => m.summonedBy === e.id);
    const out = { summoned: summoned.length, quicker: e.summonEvery < every0 };
    e.summonTimer = 1e9; summoned.forEach(m => s.killEnemy(m)); out.count = e.tribute; out.label = e.nameLabel.text;
    const loot0 = s.pickups.length; e.tribute = 15; s.killEnemy(e);
    out.items = s.pickups.length - loot0; out.queued = s.boonQueue.map(q => q.tribute).join(); out.state = s.state;
    s.openBoons();
    out.pick = { state: s.state, head: s.overlay.filter(o => o.type === 'Text')[0].text, metals: s.boonOffer.map(k => BOONS[k].metal) };
    s.pickBoon(s.boonOffer[0]);
    out.after = { state: s.state, left: s.boonQueue.length };
    s.boons = {}; return out;`);
  check('summoned enemies killed before a boss falls count as tribute', trib.summoned === 2 && trib.quicker && trib.count === 2 && /tribute 2\/5/.test(trib.label), JSON.stringify(trib));
  check('tribute pays an extra item and a better boon, to be chosen at leisure', trib.items === 2 && trib.queued === '15' && trib.state === 'playing'
    && trib.pick.state === 'boon' && /TRIBUTE OF 15 PAID/.test(trib.pick.head) && trib.pick.metals.every(m => m !== 'common')
    && trib.after.state === 'playing' && trib.after.left === 0, JSON.stringify(trib));

  // Each sector's floor, with a boss and a slam zone on it to judge legibility.
  await page(`const s = game.scene.keys.LootScene; s.player.iframes = 1e9; s.dismissHint(); const e = s.spawnGatekeeper(); e.slamTimer = 1e9; s.beginSlam(e); s.spawnLootPickup(120, 420, 'epic'); s.spawnLootPickup(280, 500, 'rare');`);
  await sleep(450); await shot('3-floor-sector-1');
  for (const n of [2, 3, 4]) {
    await page(`const s = game.scene.keys.LootScene; s.setFloor(${n}); const e = s.enemies.find(x => x.isBoss); if (e && !e.slam) { e.slamTypes = ['${n === 2 ? 'line' : 'circle'}']; s.beginSlam(e); }`);
    await sleep(450); await shot('3-floor-sector-' + n);
  }
  const floors = await page(`const s = game.scene.keys.LootScene; const t0 = performance.now(); for (const n of [1, 2, 3]) s.setFloor(n);
    const out = { set: FLOORS === FLOOR_SETS.carved, floors: [0, 1, 2].filter(k => s.textures.exists('floor-' + k + '-0')).length,
      frames: [0, 1, 2].filter(k => s.textures.exists('frame-floor-' + k + '-0')).length, lights: s.floorLights.length, frameShown: s.frameImg.visible, paintMs: Math.round(performance.now() - t0) };
    s.setFloor(1); return out;`);
  check('the carved floors are the default, and paint all three levels with their stairs and lights', floors.set && floors.floors === 3 && floors.frames === 3 && floors.lights > 0 && floors.frameShown, JSON.stringify(floors));

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
  const goal = await page(`const s = game.scene.keys.LootScene;
    Object.assign(session, { water: 0, wins: 0, depthsWon: 0, depthBest: 0, depthPick: 0, perks: {}, perksOn: [] }); s.showHub();
    const title = ${texts};
    s.startRun(); s.spawnQueue = []; s.player.iframes = 1e9; await new Promise(r => setTimeout(r, 400));
    return { title, hud: s.hudText.text, banner: (s.banner || []).map(t => t.text).join(' | ') };`);
  check('title screen states the goal and the depth', /has drunk the well dry/.test(goal.title) && /The well is dry/.test(goal.title) && /DEPTH 1 OF 7  ·  THE FIRST DESCENT/.test(goal.title), goal.title.replace(/\n/g, ' ').slice(0, 230));
  check('a run shows how far the goal is', goal.hud.startsWith('Level 1 of 3') && /waits two levels below/.test(goal.banner), goal.hud + ' || ' + goal.banner);
  await shot('5b-level-banner');
  const fell = await page(`const s = game.scene.keys.LootScene; s.sector = 2; s.runGold = 100; s.endRun(false); return ${texts};`);
  check('falling says how close you came', /You fell in The Drowned Steps, level 2 of 3/.test(fell) && /Vritra waits one level below/.test(fell), fell);
  await sleep(250); await shot('5c-fell');
  const paid = await page(`const s = game.scene.keys.LootScene; ${press};
    s.startRun(); s.spawnQueue = []; s.player.iframes = 1e9; s.wave = 6;
    const b = s.spawnSectorBoss(); b.tribute = 10; const loot0 = s.pickups.length; s.killEnemy(b); const items = s.pickups.length - loot0;
    await new Promise(r => setTimeout(r, 1400));
    const label = () => (s.uiObjects.find(o => o.type === 'Text' && /boon/i.test(o.text)) || {}).text;
    const out = { items, state: s.state, queued: s.boonQueue.length, button: label(), glass: !!(s.frostRT.ui && s.frostRT.ui.visible) };
    s.openBoons(); out.pick = { state: s.state, head: s.overlay.filter(o => o.type === 'Text')[0].text };
    s.pickBoon(s.boonOffer[0]); out.then = s.state; out.buttonAfter = label();
    out.level = { best: session.depthBest, water: session.water, perk: !!session.perks.eye, says: (s.uiObjects.find(o => o.type === 'Text' && /water/.test(o.text)) || {}).text };
    s.endRun(false); session.water = 0; session.depthBest = 0; saveSession(); return out;`);
  check("a level boss's tribute can be chosen on the choice screen", paid.items === 3 && paid.state === 'sectorChoice' && paid.queued === 1 && /Choose your boon first \(1\)/.test(paid.button || '')
    && paid.pick.state === 'boon' && /TRIBUTE OF 10 PAID/.test(paid.pick.head) && paid.then === 'sectorChoice' && paid.buttonAfter === 'Boons chosen', JSON.stringify(paid));
  check("a level's boss fills one measure of the depth being attempted, and its first fall earns a perk", paid.level.best === 1 && paid.level.water === 1 && paid.level.perk && /^\+1 water for the well/.test(paid.level.says || ''), JSON.stringify(paid.level));
  const won = await page(`const s = game.scene.keys.LootScene; ${press};
    s.startRun(); s.spawnQueue = []; s.player.iframes = 1e9; s.sector = 3; s.wave = 6; s.runGold = 300; s.setFloor(3);
    s.killEnemy(s.spawnSectorBoss());
    await new Promise(r => setTimeout(r, 1400));
    return { state: s.state, water: session.water, wins: session.wins, depths: session.depthsWon, perks: Object.keys(session.perks).sort().join(), panel: ${texts} };`);
  check('slaying the final boss wins the run and the depth', won.state === 'sectorChoice' && won.water === 5 && won.wins === 1 && won.depths === 1 && won.perks === 'eye,scale'
    && /THE WATERS RETURN/.test(won.panel) && /Depth 1 is won\. Depth 2 opens: Swift\./.test(won.panel) && /Perk earned: Serpent's Scale/.test(won.panel), JSON.stringify(won).replace(/\\n/g, ' '));
  await shot('5d-victory');
  const surfaced = await page(`const s = game.scene.keys.LootScene; const before = session.metaGold, carried = s.runGold; ${press};
    const summary = ${texts}; const banked = session.metaGold - before; ${press};
    await new Promise(r => setTimeout(r, 300));
    return { banked, carried, summary, title: ${texts} };`);
  check('surfacing after the win banks everything', surfaced.banked === surfaced.carried && surfaced.carried >= 300 && /VRITRA SLAIN/.test(surfaced.summary), `banked ${surfaced.banked} of ${surfaced.carried} carried | ` + surfaced.summary);
  check('the title screen shows the water and the next depth', /The well is 14% full/.test(surfaced.title) && /DEPTH 2 OF 7  ·  SWIFT/.test(surfaced.title) && /Enemies move 12% faster\. \+20% Nidhi\./.test(surfaced.title), surfaced.title.replace(/\n/g, ' ').slice(0, 260));
  await sleep(900); await shot('5e-title-with-water');
  const packs = await page(`const shape = o => Object.keys(o).sort().map(k => k + (o[k] && typeof o[k] === 'object' && !Array.isArray(o[k]) ? '{' + Object.keys(o[k]).sort().join(',') + '}' : '')).join(';');
    return Object.fromEntries(Object.keys(NAME_PACKS).map(k => [k, shape(NAME_PACKS[k]) === shape(NAME_PACKS.sanskrit)]));`);
  check('every name pack has the same entries', Object.keys(packs).length === 3 && Object.values(packs).every(Boolean), JSON.stringify(packs));

  // ---------- 4c. the boss says when it can be hurt; the serpent; depths; perks ----------
  const gate = await page(`const s = game.scene.keys.LootScene; session.gateTaught = false; session.depthPick = 1;
    const hold = e => { e.slamTimer = 1e9; e.speed = 0; e.summonTimer = 1e9; return e; }, wait = ms => new Promise(r => setTimeout(r, ms));
    s.startRun(); ${FREEZE} s.player.iframes = 1e9; s.dismissHint();
    const first = hold(s.spawnGatekeeper());
    const out = { tier: s.tier, firstOpen: first.weakPhase === s.phase, taught: session.gateTaught, held: s.phaseTimeLeft >= 8000, full: s.weakScale(first) };
    await wait(300);
    out.openLabel = first.gateLabel.text;
    first.weakPhase = PHASE_SEQUENCE.find(p => p !== s.phase);
    let hp = first.hp; s.damageEnemy(first, 100); out.level1 = Math.round(hp - first.hp);
    await wait(300);
    out.closedLabel = first.gateLabel.text; out.grey = s.enemySprites.get(first.id).tintTopLeft === 0x8d94a6;
    s.sector = 2; hp = first.hp; s.damageEnemy(first, 100); out.level2 = Math.round(hp - first.hp);
    first.x = 70; first.y = 590;                           // out of the serpent's way
    s.sector = 3; s.setFloor(3); const v = hold(s.spawnSectorBoss()); v.weakPhase = PHASE_SEQUENCE.find(p => p !== s.phase);
    await wait(400);
    out.serpent = { drawn: !!v.serpent && v.serpent.segs.length === SERPENT.length, spriteHidden: !s.enemySprites.get(v.id).visible, label: v.gateLabel.text,
                    moved: Math.hypot(v.serpent.segs[0].x - v.x, v.serpent.segs[0].y - v.y) < 30 };
    return out;`);
  check('the first Gatekeeper a player meets arrives open, and stays open a while', gate.tier === 1 && gate.firstOpen && gate.taught && gate.held && gate.full === 1 && /^VULNERABLE  \d+s$/.test(gate.openLabel), JSON.stringify(gate));
  check('a resisting boss says so, counts down, and takes 30% on level 1 and 12% below', /^RESISTS  \u00B7  opens in \d+s$/.test(gate.closedLabel) && gate.grey && gate.level1 === 30 && gate.level2 === 12, JSON.stringify(gate));
  check('Vritra is a drawn serpent with the same tell', gate.serpent.drawn && gate.serpent.spriteHidden && gate.serpent.moved && /^RESISTS/.test(gate.serpent.label), JSON.stringify(gate.serpent));
  await shot('5f-serpent');

  // Depths: a depth already won pays no water; the next one is harder and pays more.
  const deep = await page(`const s = game.scene.keys.LootScene, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
    const a = s.spawnEnemyOfType('melee', 100, 300, 1), slow = a.speed; s.killEnemy(a);
    const v = s.enemies.find(e => e.isMega); s.killEnemy(v); await wait(1400);
    out.again = { water: session.water, depths: session.depthsWon, panel: ${texts} };
    ${press}; ${press}; await wait(200);
    session.depthPick = 0; s.showHub();
    out.arrows = s.uiObjects.filter(o => o.type === 'Text' && (o.text === '<' || o.text === '>')).map(o => o.text).join('');
    s.startRun(); ${FREEZE} s.player.iframes = 1e9; await wait(300);
    const quick = s.spawnEnemyOfType('melee', 100, 300, 1); s.killEnemy(quick);
    s.runGold = 0; s.addGold(100);
    out.two = { tier: s.tier, hud: s.hudText.text, banner: (s.banner || []).map(t => t.text).join(' | '), faster: Math.round(100 * quick.speed / slow), gold: s.runGold, heal: s.clearHeal(), every: s.convergeEvery() };
    s.sector = 3; s.wave = 6; s.setFloor(3); s.killEnemy(s.spawnSectorBoss()); await wait(1400);
    out.won = { water: session.water, depths: session.depthsWon, perks: Object.keys(session.perks).sort().join(), worn: session.perksOn.join(), panel: ${texts} };
    ${press}; ${press}; await wait(200);
    s.startRun(); ${FREEZE} s.player.iframes = 1e9; s.wave = 6;
    out.three = { tier: s.tier, heal: s.clearHeal(), hard: [sectorHpMult(1), sectorDmgMult(1)] };
    s.killEnemy(s.spawnSectorBoss()); await wait(1300);
    out.three.water = session.water; out.three.best = session.depthBest;
    s.descend(); s.spawnQueue = [{}]; s.spawnTimer = 1e9; s.player.iframes = 1e9; s.wave = 6; s.sector = 1; s.killEnemy(s.spawnSectorBoss()); await wait(1300);
    out.three.again = (s.uiObjects.find(o => o.type === 'Text' && /water/.test(o.text)) || {}).text; out.three.waterAfter = session.water;
    s.endRun(false); ${press}; await wait(200);
    session.depthPick = 1; s.showHub(); out.back = ${texts};
    session.depthPick = 0; saveSession(); s.showHub();
    return out;`);
  check('a depth already won pays no water', deep.again.water === 5 && deep.again.depths === 1 && /Depth 1 was already won: no new water/.test(deep.again.panel), JSON.stringify(deep.again).replace(/\\n/g, ' '));
  check('the second depth is faster and richer, and says which depth it is', deep.arrows === '<' && deep.two.tier === 2 && deep.two.hud.startsWith('D2 · Level 1 of 3') && /DEPTH 2 · LEVEL 1 OF 3/.test(deep.two.banner)
    && deep.two.faster === 112 && deep.two.gold === 120 && deep.two.heal === 0.35 && deep.two.every === 90000, JSON.stringify(deep.two));
  check('winning a depth opens the next and earns its perk', deep.won.water === 10 && deep.won.depths === 2 && deep.won.perks === 'eye,lungs,scale' && deep.won.worn === 'eye,scale'
    && /Depth 2 is won\. Depth 3 opens: Thin Air\./.test(deep.won.panel) && /Perk earned: Deep Lungs/.test(deep.won.panel), JSON.stringify(deep.won).replace(/\\n/g, ' '));
  check('the third depth heals less, and its level bosses fill the well', deep.three.tier === 3 && deep.three.heal === 0.2 && deep.three.hard.join() === '1,1' && deep.three.water === 11 && deep.three.best === 1 && deep.three.waterAfter === 11 && /^No new water/.test(deep.three.again || '')
    && /DEPTH 1 OF 7/.test(deep.back) && /Already won: no water here/.test(deep.back), JSON.stringify(deep.three) + ' | ' + deep.back.replace(/\n/g, ' ').slice(0, 200));
  await sleep(500); await shot('5g-title-depth-3');

  // Perks: worn two at a time, chosen on the profile, and they do what they say.
  const perk = await page(`const s = game.scene.keys.LootScene, wait = ms => new Promise(r => setTimeout(r, ms)), back = () => s.closeOverlay(), out = {};
    const hp0 = 100 * (1 + session.vitalityLevel * 0.10), note = () => s.overlay.filter(o => o.type === 'Text').map(o => o.text).join(' | ');
    s.showHub(); s.showProfile(back);
    out.shown = { head: /PERKS  ·  WEAR 2/.test(note()), power: s.powerParts().perks, slots: s.perkSlots() };
    const zone = (x, y) => s.overlay.find(o => o.type === 'Zone' && Math.abs(o.x - x) < 2 && Math.abs(o.y - y) < 2);
    zone(310, 204).emit('pointerdown'); out.locked = /Second Wind  ·  not earned yet/.test(note()) && /To earn it, win depth 3/.test(note()) && session.perksOn.join() === 'eye,scale';
    s.togglePerk('lungs', back); out.full = /Only 2 perks can be worn/.test(note()) && session.perksOn.join() === 'eye,scale';
    zone(310, 172).emit('pointerdown'); out.off = session.perksOn.join();                         // a real tap takes Hoarder's Eye off
    zone(278, 204).emit('pointerdown'); out.on = session.perksOn.join(); out.maxHp = s.loadout().p.maxHp - hp0;   // and puts Deep Lungs on
    out.saved = JSON.parse(localStorage.getItem(SAVE_KEY)).perksOn.join();
    return out;`);
  await sleep(300); await shot('5h-profile-perks');
  const perk2 = await page(`const s = game.scene.keys.LootScene, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
    s.closeOverlay(); session.depthPick = 1;
    s.startRun(); ${FREEZE} s.dismissHint();
    out.lungs = s.player.maxHp - 100 * (1 + session.vitalityLevel * 0.10);
    s.player.iframes = 0; let hp = s.player.hp; s.damagePlayer(20, null, 'melee'); out.scale = Math.round((hp - s.player.hp) * 10) / 10;
    s.player.iframes = 1e9; s.killEnemy(s.spawnGatekeeper()); out.guardEarned = !!session.perks.guard; out.wornAfter = session.perksOn.join();
    s.endRun(false); ${press}; await wait(150);
    session.perksOn = ['guard', 'wind']; session.perks.wind = true;
    s.startRun(); ${FREEZE} s.dismissHint();
    s.player.iframes = 0; hp = s.player.hp; s.damagePlayer(20, null, 'melee'); out.guard = { blocked: s.player.hp === hp, left: s.player.guardCharge };
    s.player.iframes = 0; s.player.hp = 5; const died = s.damagePlayer(50, null, 'melee'); out.wind = { died, hp: Math.round(100 * s.player.hp / s.player.maxHp), state: s.state };
    s.player.iframes = 0; out.windOnce = s.damagePlayer(1e5, null, 'melee') === true && s.state === 'summary';
    ${press}; await wait(150);
    session.perksOn = ['taker', 'reroll', 'study']; session.depthsWon = 4;
    s.startRun(); ${FREEZE}
    out.kit = { slots: s.perkSlots(), tribute: s.tributeAt.item + '/' + s.tributeAt.boon + '/' + s.tributeAt.gold, rerolls: s.rerollsLeft, waiting: s.boonQueue.length, power: s.powerParts().perks };
    s.boonQueue = []; s.refreshBoonButton(); s.endRun(false); ${press}; await wait(150);
    session.depthsWon = 2; session.perksOn = ['scale', 'lungs']; delete session.perks.wind; session.depthPick = 0; saveSession(); s.showHub();
    return out;`);
  check('perks show on the profile, and one not yet earned says how to earn it', perk.shown.head && perk.shown.power === 40 && perk.shown.slots === 2 && perk.locked, JSON.stringify(perk));
  check('two perks are worn at a time, chosen by tapping, and the choice is saved', perk.full && perk.off === 'scale' && perk.on === 'scale,lungs' && perk.maxHp === 25 && perk.saved === 'scale,lungs', JSON.stringify(perk));
  check("perks do what they say: health, damage taken, the Gatekeeper's block, a second wind", perk2.lungs === 25 && perk2.scale === 18 && perk2.guardEarned && perk2.wornAfter === 'scale,lungs'
    && perk2.guard.blocked && perk2.guard.left === 0 && perk2.wind.died === false && perk2.wind.hp === 30 && perk2.wind.state === 'playing' && perk2.windOnce, JSON.stringify(perk2));
  check('later perks: a third slot, cheaper tribute, a second reroll, a boon to start', perk2.kit.slots === 3 && perk2.kit.tribute === '4/8/12' && perk2.kit.rerolls === 2 && perk2.kit.waiting === 1 && perk2.kit.power === 60, JSON.stringify(perk2.kit));

  // A save from before the depths keeps what it had done.
  const old = await page(`const keep = localStorage.getItem(SAVE_KEY), now = JSON.stringify(session), read = () => ({ won: session.depthsWon, best: session.depthBest, water: session.water, perks: Object.keys(session.perks).sort().join(), worn: session.perksOn.length });
    localStorage.setItem(SAVE_KEY, JSON.stringify({ metaGold: 40, vitalityLevel: 1, powerLevel: 0, bestSector: 3, wins: 2, water: 8, hintsSeen: {} })); loadSession(); const winner = read();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ metaGold: 5, vitalityLevel: 0, powerLevel: 0, bestSector: 3, wins: 0, water: 2, hintsSeen: {} })); loadSession(); const founder = read();
    localStorage.setItem(SAVE_KEY, JSON.stringify({ metaGold: 0, vitalityLevel: 0, powerLevel: 0, bestSector: 1, wins: 0, water: 0, hintsSeen: {} })); loadSession(); const fresh = read();
    localStorage.setItem(SAVE_KEY, keep); Object.assign(session, JSON.parse(now));
    return { winner, founder, fresh, back: session.depthsWon };`);
  check('an older save is carried into the depths with what it had earned', old.winner.won === 1 && old.winner.water === 5 && old.winner.perks === 'eye,guard,scale' && old.winner.worn === 2
    && old.founder.won === 0 && old.founder.best === 2 && old.founder.water === 2 && old.founder.perks === 'eye,guard'
    && old.fresh.won === 0 && old.fresh.water === 0 && old.fresh.perks === '' && old.back === 2, JSON.stringify(old));

  // The hero is named by the player (requirements 2.32).
  const nick = await page(`const s = game.scene.keys.LootScene, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
    const words = () => s.uiObjects.filter(o => o.type === 'Text').map(o => o.text);
    session.nickname = ''; s.showHub();
    out.unnamed = { chip: words().includes('Name yourself'), hero: heroName(), kiran: words().concat([document.getElementById('loader').textContent]).some(t => /Kiran/.test(t)) };
    out.clean = [Namer.clean('  Ravi \\n the   <b>Bold</b> '), Namer.clean('ABCDEFGHIJKLMNOPQRS'), Namer.clean('   ')].join('|');
    s.uiObjects.find(o => o.type === 'Rectangle' && o.input && Math.abs(o.y - 27) < 1).emit('pointerdown');
    await wait(150);
    out.dialog = { open: Namer.isOpen, keysOff: game.input.keyboard.enabled === false, focus: document.activeElement.id };
    return out;`);
  await send('Input.insertText', { text: 'Ravi the Bold' });
  await sleep(150); await shot('5i-name-dialog');
  const nick2 = await page(`const s = game.scene.keys.LootScene, wait = ms => new Promise(r => setTimeout(r, ms)), out = {};
    const words = () => s.uiObjects.filter(o => o.type === 'Text').map(o => o.text);
    document.getElementById('nm-save').click(); await wait(100);
    out.saved = { name: session.nickname, stored: JSON.parse(localStorage.getItem(SAVE_KEY)).nickname, closed: !Namer.isOpen, keysOn: game.input.keyboard.enabled === true, chip: words().includes('Ravi the Bold  ·  rename') };
    s.showProfile(() => s.closeOverlay());
    let head = s.overlay.filter(o => o.type === 'Text');
    out.profile = { name: head[0].text, sub: head[1].text };
    s.overlay.find(o => o.type === 'Zone' && Math.abs(o.y - 94) < 1).emit('pointerdown'); await wait(150);
    out.fromProfile = Namer.isOpen && document.getElementById('nm-text').value === 'Ravi the Bold';
    document.getElementById('nm-text').value = 'WWWWWWWWWWWWWWWWWW'; document.getElementById('nm-save').click(); await wait(100);
    head = s.overlay.filter(o => o.type === 'Text');
    out.long = { name: session.nickname.length, right: Math.round(head[0].x + head[0].width), font: parseInt(head[0].style.fontSize, 10) };
    s.closeOverlay(); session.nickname = 'Ravi the Bold'; saveSession();
    session.depthPick = 1; s.startRun(); ${FREEZE} s.player.iframes = 1e9; s.sector = 3; s.wave = 6; s.setFloor(3); s.killEnemy(s.spawnSectorBoss()); await wait(1400);
    out.victory = ${texts};
    ${press}; ${press}; await wait(200); session.depthPick = 0; saveSession(); s.showHub();
    return out;`);
  check('an unnamed hero is "Hero", the old name is gone, and the title screen offers a name', nick.unnamed.chip && nick.unnamed.hero === 'Hero' && !nick.unnamed.kiran
    && nick.clean === 'Ravi the bBold|ABCDEFGHIJKLMN|' && nick.dialog.open && nick.dialog.keysOff && nick.dialog.focus === 'nm-text', JSON.stringify(nick));
  check('a nickname is saved and shown on the title screen, the profile and the victory', nick2.saved.name === 'Ravi the Bold' && nick2.saved.stored === 'Ravi the Bold' && nick2.saved.closed && nick2.saved.keysOn && nick2.saved.chip
    && nick2.profile.name === 'RAVI THE BOLD' && /tap to rename/.test(nick2.profile.sub) && nick2.fromProfile && nick2.long.name === 14 && nick2.long.right <= 232 && nick2.long.font < 25
    && /Ravi the Bold has slain Vritra\./.test(nick2.victory), JSON.stringify(nick2).replace(/\\n/g, ' ').slice(0, 700));

  // ---------- 5. every text stays inside its panel ----------
  const spill = await page(`const s = game.scene.keys.LootScene, bad = [];
    const edge = (t, lo, hi, where) => { const l = t.x - t.width * t.originX, r = l + t.width; if (l < lo || r > hi) bad.push(where + ': ' + t.text.slice(0, 32)); };
    for (let pg = 0; pg < 10; pg++) { s.showHowTo(pg, () => s.closeOverlay()); const tx = s.overlay.filter(o => o.type === 'Text'); tx.forEach(t => edge(t, 27, 373, 'how-to ' + pg));
      const body = tx.reduce((a, b) => (b.height > a.height ? b : a)); if (body.y + body.height > 548) bad.push('how-to ' + pg + ' body runs into the page dots'); }
    s.showSettings(() => s.closeOverlay()); s.overlay.filter(o => o.type === 'Text').forEach(t => edge(t, 28, 372, 'settings')); s.closeOverlay();
    s.showHub(); s.showProfile(() => s.closeOverlay()); s.overlay.filter(o => o.type === 'Text').forEach(t => edge(t, 27, 373, 'profile')); s.closeOverlay();
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
    delete s.buildWave;                                    // real waves again
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
  const oldNames = await page(`return NAME_PACKS.sanskrit.sectors.map(x => x[0]).join(' / ') + ' / ' + NAME_PACKS.sanskrit.deeper[0];`);
  check('levels carry the stepwell names, in both packs', sectors === 'The Courtyard / The Drowned Steps / The Gold Vault / The Abyss / The Abyss'
    && oldNames === 'Prangan / Jal-Kund / Nidhi-Kosh / Patal', sectors + ' || ' + oldNames);
  await send('Page.navigate', { url: pathToFileURL(join(REPO, 'game', 'loot-chase-v0.1.html')).href + '?names=plain&floors=classic' });
  state = 'loading';
  for (let i = 0; i < 80 && state === 'loading'; i++) { await sleep(250); state = await page(`return typeof Loader === 'undefined' ? 'loading' : Loader.state;`); }
  await shot('9-plain-loader');
  const well1 = await page(`const t = id => document.getElementById(id).textContent;
    return { line: t('ldr-well-line'), sub: t('ldr-well-sub'), after: t('ldr-well-after'), water: +document.getElementById('well-water').getAttribute('height') };`);
  check('the loading screen shows the water already returned', well1.line === 'The well is 31% full' && /^Depth 3 of 7 \u00B7 11 of 35/.test(well1.sub) && well1.water > 0 && /The Bottomless Well/.test(well1.after), JSON.stringify(well1));
  const youCard = `const t = id => document.getElementById(id).textContent; for (let k = 0; k < GLOSSARY.length && !/^That is you\./.test(t('ldr-role')); k++) document.getElementById('ldr-card').click();
    return { kind: t('ldr-kind'), name: t('ldr-name'), role: t('ldr-role') };`;
  const card1 = await page(youCard);
  check("the loading screen's card about the hero carries the player's name", card1.kind === 'You' && card1.name === 'Ravi the Bold' && !/Name yourself/.test(card1.role), JSON.stringify(card1));
  const plain = await page(`settings.sfx = 0; settings.tips = false; Loader.begin(); await new Promise(r => setTimeout(r, 500));
    const s = game.scene.keys.LootScene, seen = [];
    const grab = list => list.filter(o => o && o.type === 'Text' && o.text).forEach(o => seen.push(o.text));
    seen.push(document.getElementById('loader').textContent);
    grab(s.uiObjects);
    for (const tab of ['weapons', 'trinkets', 'tejas']) { s.showCodex(tab); grab(s.uiObjects); }
    for (const m of ['common', 'rare', 'epic']) { s.showCodex('boons', m); grab(s.uiObjects); }
    s.showHub(); for (let pg = 0; pg < 10; pg++) { s.showHowTo(pg, () => s.closeOverlay()); grab(s.overlay); } s.closeOverlay();
    session.tejasUnlocked = true; s.startRun(); s.player.iframes = 1e9; grab(s.banner || []);
    for (const t of ['melee', 'ranged', 'tank', 'splitter']) s.spawnEnemyOfType(t, 100, 300, 1, false);
    s.spawnGatekeeper(); s.spawnSectorBoss(); s.spawnLootPickup(200, 300, 'epic'); s.spawnLootPickup(210, 320, 'common');
    await new Promise(r => setTimeout(r, 300));
    grab(s.children.list);
    s.queueBoon(); s.openBoons(); grab(s.overlay); for (const k of Object.keys(BOONS)) { s.boonQueue[0].offer = [k]; s.showBoonScreen(); grab(s.overlay); } s.closeBoons(); s.boonQueue = []; s.refreshBoonButton();
    s.pauseGame('profile'); grab(s.overlay); s.resumeGame();
    s.pauseGame(); grab(s.overlay); s.showAbandonConfirm(); grab(s.overlay); s.resumeGame();
    s.runGold = 50; s.showSectorClearChoice(false); grab(s.uiObjects); s.endRun(false); grab(s.uiObjects);
    const words = /Asura|Rakshasa|Mahish|Raktabija|Bakasura|Nidhi|Vritra|Shanti|Shakti|Grahan|Pralaya|Tamra|Rajat|Swarna|Katar|Talwar|Chakram|Parashu|Kavach|Kantak|Paduka|Sanjeevani|Tejas|Viram|[\u0900-\u097F]/i;
    for (const n of [1, 2, 3]) s.setFloor(n); s.setFloor(1);
    const classic = { set: FLOORS === FLOOR_SETS.classic, layers: s.floorLayers.length, textures: ['floor-0-0', 'floor-1-0', 'floor-2-0'].filter(k => s.textures.exists(k)).length, frames: [0, 1, 2].filter(k => s.textures.exists('frame-floor-' + k + '-0')).length };
    return { classic, texts: seen.length, leaks: [...new Set(seen.filter(t => words.test(t)).map(t => t.replace(/\s+/g, ' ').slice(0, 60)))], sample: sectorTitle(1) + ' / ' + N.enemies.melee + ' / ' + N.currency };`);
  check('the classic floors still paint when the address asks for them', plain.classic.set && plain.classic.textures === 3 && plain.classic.layers === 1 && plain.classic.frames === 0, JSON.stringify(plain.classic));
  await shot('9-plain-summary');
  check('plain-English pack leaves no Sanskrit on screen', plain.leaks.length === 0 && plain.texts > 80, `${plain.texts} texts read, e.g. ${plain.sample}` + (plain.leaks.length ? ' LEAKS: ' + plain.leaks.join(' | ') : ''));

  // ---------- 8. a save from before the depths, loaded the way a player's is: with the page ----------
  await page(`localStorage.setItem(SAVE_KEY, JSON.stringify({ metaGold: 77, vitalityLevel: 1, powerLevel: 0, bestSector: 3, tejasUnlocked: true, hintsSeen: {}, water: 2, wins: 0 }));`);
  await send('Page.navigate', { url: pathToFileURL(join(REPO, 'game', 'loot-chase-v0.1.html')).href });
  state = 'loading';
  for (let i = 0; i < 80 && state === 'loading'; i++) { await sleep(250); state = await page(`return typeof Loader === 'undefined' ? 'loading' : Loader.state;`); }
  const card2 = await page(youCard);
  check('an unnamed player is told on the loading screen where to name themselves', card2.kind === 'You' && card2.name === 'Hero' && /Name yourself on the title screen\.$/.test(card2.role), JSON.stringify(card2));
  const carried = await page(`const t = id => document.getElementById(id).textContent;
    const out = { line: t('ldr-well-line'), sub: t('ldr-well-sub'), won: session.depthsWon, best: session.depthBest, water: session.water, gold: session.metaGold,
      perks: Object.keys(session.perks).sort().join(), worn: session.perksOn.join(), taught: session.gateTaught };
    settings.sfx = 0; settings.tips = false; Loader.begin(); await new Promise(r => setTimeout(r, 500));
    const s = game.scene.keys.LootScene;
    out.title = s.uiObjects.filter(o => o.type === 'Text').map(o => o.text).join(' | ');
    s.startRun(); out.run = { tier: s.tier, guard: s.player.guardCharge, power: s.powerParts().perks }; s.endRun(false);
    return out;`);
  check('an older save loads with the page into depth 1, keeping its water and wearing its perks', carried.line === 'The well is 6% full' && /^Depth 1 of 7 · 2 of 35/.test(carried.sub)
    && carried.won === 0 && carried.best === 2 && carried.water === 2 && carried.gold === 77 && carried.perks === 'eye,guard' && carried.worn === 'guard,eye' && !carried.taught
    && /DEPTH 1 OF 7/.test(carried.title) && /The well is 6% full/.test(carried.title) && carried.run.tier === 1 && carried.run.guard === 1 && carried.run.power === 40, JSON.stringify(carried).replace(/\n/g, ' ').slice(0, 420));

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
