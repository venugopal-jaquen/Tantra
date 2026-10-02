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
  const music = await page(`return Object.fromEntries(Object.entries(Music.tracks).map(([k, t]) => [k, t.dead ? 'missing' : (t.el.duration ? Math.round(t.el.duration) + 's' : 'loading')]));`);
  check('all three music tracks load', Object.values(music).every(v => v !== 'missing'), JSON.stringify(music));
  await shot('2-title');

  // ---------- 3. a run in real time: HUD, first tip, banner ----------
  await page(`game.scene.keys.LootScene.startRun();`);
  await sleep(1500); await shot('3-run-start');
  const run = await page(`const s = game.scene.keys.LootScene; return { state: s.state, tip: s.hintBox ? s.hintBox[1].text : null, hudBottom: Math.round(s.hudText.y + s.hudText.height), hpBarTop: Math.round(s.hpBarBg.y - s.hpBarBg.height / 2) };`);
  check('first tip shows during the first run', !!run.tip, run.tip || 'none');
  check('HUD line clears the HP bar', run.hudBottom <= run.hpBarTop + 1, `text bottom ${run.hudBottom}, bar top ${run.hpBarTop}`);

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

  // ---------- 5. every text stays inside its panel ----------
  const spill = await page(`const s = game.scene.keys.LootScene, bad = [];
    const edge = (t, lo, hi, where) => { const l = t.x - t.width * t.originX, r = l + t.width; if (l < lo || r > hi) bad.push(where + ': ' + t.text.slice(0, 32)); };
    for (let pg = 0; pg < 7; pg++) { s.showHowTo(pg, () => s.closeOverlay()); const tx = s.overlay.filter(o => o.type === 'Text'); tx.forEach(t => edge(t, 27, 373, 'how-to ' + pg));
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
    PlaytestBot.start([{ name: 'fresh', vit: 0, pow: 0, target: 3 }, { name: 'mid', vit: 6, pow: 6, target: 4, tejas: true }, { name: 'grinder', vit: 14, pow: 14, target: 5, tejas: true }]);
    while (!PlaytestBot.tick(4000).done) await new Promise(r => setTimeout(r, 0));
    const rep = PlaytestBot.report();
    game.loop.wake();
    return { errors: rep.errors, runs: rep.runs.map(r => ({ p: r.profile, result: r.result, sector: r.finalSector, min: r.gameMin, leak: r.leak, lost: r.sectors.map(x => 'S' + x.S + ':' + x.hpLostPct + '%').join(' ') })) };`);
  bot.runs.forEach(r => console.log(`      ${r.p}: reached sector ${r.sector} in ${r.min} min, ${r.result}  [${r.lost}]  leak ${r.leak}`));
  check('bot runs raise no errors', bot.errors.length === 0, bot.errors.join('; '));
  check('bot runs leak nothing', bot.runs.every(r => r.leak <= 0), bot.runs.map(r => r.leak).join(', '));
  await sleep(600); await shot('7-hub-after-bot');

  // Expected noise: music files that are not added yet, and Chrome refusing to vibrate
  // because a headless page has never been tapped. Anything else is a real problem.
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
