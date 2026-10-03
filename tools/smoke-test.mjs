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
  await sleep(500); await shot('1-loader');

  // The loader must also fit a phone held sideways, and a small phone.
  for (const [w, h, name] of [[740, 360, 'sideways'], [320, 568, 'small phone']]) {
    await send('Emulation.setDeviceMetricsOverride', { width: w, height: h, deviceScaleFactor: 2, mobile: false });
    await sleep(350);
    const fit = await page(`const r = [...document.getElementById('loader').children].map(c => c.getBoundingClientRect());
      return { top: Math.round(Math.min(...r.map(b => b.top))), bottom: Math.round(Math.max(...r.map(b => b.bottom))), left: Math.round(Math.min(...r.map(b => b.left))), right: Math.round(Math.max(...r.map(b => b.right))), vw: innerWidth, vh: innerHeight };`);
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
    await new Promise(r => setTimeout(r, 400));
    const safe = s.player.hp === hp || s.player.hp > hp;
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
    const e = s.spawnGatekeeper(); e.slamTimer = 1e9; e.slamTypes = ['circle']; e.speed = 0;
    p.x = e.x; p.y = e.y + e.radius + 20; s.beginSlam(e);
    await new Promise(r => setTimeout(r, 250));
    const touched = !!(e.slam && e.slam.touched), hp = p.hp;
    p.x = s.arenaBounds.x + 20; p.y = s.arenaBounds.bottom - 20;
    await new Promise(r => setTimeout(r, 1100));
    const out = { touched, buff: Math.round(s.slamBuffMs), mult: +s.dmgMult().toFixed(2), unhurt: p.hp >= hp };
    s.boons = {}; s.killEnemy(e); await new Promise(r => setTimeout(r, 700));
    if (s.state === 'boon') s.pickBoon(null); s.spawnQueue = [];
    return out;`);
  check('reading a slam makes the next hits harder', read.touched && read.buff > 2500 && read.mult === 1.5 && read.unhurt, JSON.stringify(read));

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
  await send('Page.navigate', { url: pathToFileURL(join(REPO, 'game', 'loot-chase-v0.1.html')).href + '?names=plain' });
  state = 'loading';
  for (let i = 0; i < 80 && state === 'loading'; i++) { await sleep(250); state = await page(`return typeof Loader === 'undefined' ? 'loading' : Loader.state;`); }
  await shot('9-plain-loader');
  const plain = await page(`settings.sfx = 0; settings.tips = false; Loader.begin(); await new Promise(r => setTimeout(r, 500));
    const s = game.scene.keys.LootScene, seen = [];
    const grab = list => list.filter(o => o && o.type === 'Text' && o.text).forEach(o => seen.push(o.text));
    seen.push(document.getElementById('loader').textContent);
    grab(s.uiObjects);
    for (const tab of ['weapons', 'trinkets', 'tejas']) { s.showCodex(tab); grab(s.uiObjects); }
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
    return { texts: seen.length, leaks: [...new Set(seen.filter(t => words.test(t)).map(t => t.replace(/\s+/g, ' ').slice(0, 60)))], sample: sectorTitle(1) + ' / ' + N.enemies.melee + ' / ' + N.currency };`);
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
