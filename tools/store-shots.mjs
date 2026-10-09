/*
 * Store-page pictures: plays the game in a private, MUTED, headless Chrome and saves
 * candidate screenshots of each scene, and the frames for a short GIF. Nothing appears on
 * screen and nothing touches your own browser profile or your saved game.
 *
 *   node tools/store-shots.mjs [output-dir] [page.html] [scenes]
 *
 * The page defaults to dist/itch/index.html (what tools/build-itch.py made), so the
 * pictures are of the build that is uploaded. `scenes` is a comma-separated pick from
 * title, fight, boons, gate, guardian, vritra, cover, film; the default is all of them.
 * `cover` is the serpent mid-slam with the HUD left out, for tools/make-cover.py.
 *
 * A fight is never the same twice, so each scene saves several candidates: look through
 * them and keep the best. tools/make-gif.py turns the film/ folder into a GIF.
 *
 * The hero is steered by a simple autopilot and is kept from dying, which is fair for a
 * picture and for nothing else. Needs Chrome or Edge and Node 22+. No packages.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = resolve(process.argv[2] || join(tmpdir(), 'anantarya-store'));
const PAGE = pathToFileURL(resolve(process.argv[3] || join(REPO, 'dist', 'itch', 'index.html'))).href;
const SCENES = (process.argv[4] || 'title,fight,boons,gate,guardian,vritra,cover,film').split(',');
const PORT = 9333 + Math.floor(Math.random() * 500);
const BROWSERS = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  'C:/Program Files/Microsoft/Edge/Application/msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome', '/usr/bin/chromium', '/usr/bin/chromium-browser'
];
const VIEW = { width: 400, height: 700 };      // the game's own size: one unit is one CSS pixel

const sleep = ms => new Promise(r => setTimeout(r, ms));
mkdirSync(OUT, { recursive: true });
const exe = BROWSERS.find(existsSync);
if (!exe) { console.error('No Chrome or Edge found.'); process.exit(2); }
const profile = mkdtempSync(join(tmpdir(), 'anantarya-profile-'));
const browser = spawn(exe, [
  '--headless=new', '--mute-audio', '--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', `--window-size=${VIEW.width},${VIEW.height}`, 'about:blank'
], { stdio: 'ignore' });

let ws, nextId = 1;
const pending = new Map(), problems = [], film = [];
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = nextId++;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
const page = async (expression) => {
  const r = await send('Runtime.evaluate', { expression: `(async () => { const s = game.scene.keys.LootScene, wait = ms => new Promise(r => setTimeout(r, ms)); ${expression} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('page: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
};
const shot = async (name) => {
  const r = await send('Page.captureScreenshot', { format: 'png' });
  writeFileSync(join(OUT, name + '.png'), Buffer.from(r.data, 'base64'));
  console.log('  saved ' + name + '.png');
};
// Several pictures of one scene, a moment apart.
const burst = async (name, count, gap) => {
  for (let i = 0; i < count; i++) { await sleep(gap); await shot(`${name}-${String.fromCharCode(97 + i)}`); }
};

// What a returning player's save looks like: two depths won, a level boss beaten on the
// third, some upgrades and four perks. A new save would show a dry well and no perks.
const SAVE = `Object.assign(session, { metaGold: 460, vitalityLevel: 4, powerLevel: 4, bestSector: 3, tejasUnlocked: true, wins: 2, gateTaught: true,
  depthsWon: 2, depthBest: 1, depthPick: 0, perks: { guard: true, eye: true, scale: true, lungs: true }, perksOn: ['guard', 'eye'] });
  session.water = wellWater(); saveSession();
  Object.assign(settings, { sfx: 0, tips: false, vibrate: false });`;

// The autopilot: gives ground to whatever comes within `near` (bosses get a wider berth),
// drifts round the middle of the arena, steps toward loot, and never lets the hero's
// health run out. A small `near` stands and fights, which is what fills a picture.
const pilot = (near = 110) => `clearInterval(window.__pilot);
  window.__pilot = setInterval(() => {
    if (s.state !== 'playing' || !s.player) return;
    const p = s.player, b = s.arenaBounds;
    let vx = 0, vy = 0;
    for (const e of s.enemies) {
      const dx = p.x - e.x, dy = p.y - e.y, d = Math.hypot(dx, dy) || 1, near = e.isBoss ? 170 : ${near};
      if (d < near) { const w = (near - d) / near * (e.isBoss ? 2.2 : 1.4); vx += dx / d * w; vy += dy / d * w; }
    }
    let loot = null, best = 190;
    for (const k of s.pickups) { const d = Math.hypot(k.x - p.x, k.y - p.y); if (d < best) { best = d; loot = k; } }
    if (loot) { vx += (loot.x - p.x) / best * 1.1; vy += (loot.y - p.y) / best * 1.1; }
    const ox = p.x - b.centerX, oy = p.y - b.centerY, od = Math.hypot(ox, oy) || 1, far = Math.max(0, od - 150) / 90;
    vx += -oy / od * 0.35 - ox / od * far; vy += ox / od * 0.35 - oy / od * far;
    const m = Math.hypot(vx, vy) || 1;
    s.setMoveTarget(p.x + vx / m * 80, p.y + vy / m * 80);
    if (p.hp < p.maxHp * 0.4) p.hp = p.maxHp * 0.7;
  }, 160);`;
// For the cover: the camera keeps the hero in the middle of the screen except at a wall,
// so the hero waits at a side wall, level with the serpent, and the serpent comes to him.
// That puts the two side by side with both in the picture. Once the serpent is the right
// distance off it is stood still there - this one picture is posed, and nothing else is.
const coverPilot = `clearInterval(window.__pilot);
  window.__pilot = setInterval(() => {
    if (s.state !== 'playing' || !s.player) return;
    const p = s.player, b = s.arenaBounds, boss = s.enemies.find(e => e.isMega);
    if (!boss) return;
    if (Math.abs(boss.x - p.x) < 170 && Math.abs(boss.y - p.y) < 40) boss.speed = 0;
    s.setMoveTarget(b.right - 28, Phaser.Math.Clamp(boss.y + 12, b.y + 70, b.bottom - 70));
    if (p.hp < p.maxHp * 0.6) p.hp = p.maxHp * 0.9;      // he stands in every slam here: a wider margin
  }, 160);`;
// Ends the wave on the floor so the next one is the wave wanted: 3 is the Gatekeeper, 6 the level's boss.
const skipTo = wave => `s.spawnQueue = []; s.wave = ${wave - 1}; [...s.enemies].forEach(e => s.killEnemy(e)); await wait(900);`;
// A run begun on a given level, the way a descent arrives there. Only ever from a fresh
// page (fresh() below): a second run begun over a live one leaves the first hero standing.
const runOn = (level, near) => `s.startRun(); ${level > 1 ? `s.sector = ${level - 1}; s.descend();` : ''} ${pilot(near)}`;
const fresh = async () => {
  await send('Page.navigate', { url: PAGE });
  let state = 'loading';
  for (let i = 0; i < 80 && state === 'loading'; i++) {
    await sleep(250);
    state = (await send('Runtime.evaluate', { expression: `typeof Loader === 'undefined' ? 'loading' : Loader.state`, returnByValue: true })).result.value;
  }
  if (state !== 'ready') throw new Error('the loading screen did not reach Begin: ' + state);
  await send('Runtime.evaluate', { expression: `${SAVE} Loader.begin();` });
  await sleep(1400);
  await page(`s.showHub(); await wait(700);`);     // drawn again, now that the save above is in place
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
    else if (m.method === 'Runtime.exceptionThrown') problems.push((m.params.exceptionDetails.exception?.description || m.params.exceptionDetails.text).split('\n')[0]);
    else if (m.method === 'Page.screencastFrame') {
      film.push({ data: m.params.data, at: m.params.metadata.timestamp });
      ws.send(JSON.stringify({ id: nextId++, method: 'Page.screencastFrameAck', params: { sessionId: m.params.sessionId } }));
    }
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { ...VIEW, deviceScaleFactor: 2, mobile: true });
  await fresh();
  console.log(await page(`return GAME_TITLE + ', build ' + BUILD + ', arena x' + ARENA_SCALE;`));

  if (SCENES.includes('title')) {
    console.log('title');
    await shot('title');
  }
  if (SCENES.includes('fight')) {
    console.log('fight: wave 4 of level 1, then wave 5 of level 2');
    await page(`${runOn(1, 55)} await wait(3000); ${skipTo(4)}`);
    await sleep(5000); await burst('fight-1', 8, 1800);
    await fresh(); await page(`${runOn(2, 55)} await wait(3000); ${skipTo(5)}`);
    await sleep(5000); await burst('fight-2', 8, 1800);
  }
  if (SCENES.includes('boons')) {
    console.log('boons');
    await fresh(); await page(`${runOn(2)} await wait(2500); s.queueBoon(); s.openBoons(); await wait(900);`);
    await shot('boons');
    await page(`s.closeBoons();`);
  }
  if (SCENES.includes('gate')) {
    console.log('gate: the Gatekeeper on level 2');
    await fresh(); await page(`${runOn(2)} await wait(3000); ${skipTo(3)}`);
    await sleep(2500); await burst('gate', 7, 1500);
  }
  if (SCENES.includes('guardian')) {
    console.log('guardian: the Hoard Guardian on level 1');
    await fresh(); await page(`${runOn(1)} await wait(3000); ${skipTo(6)}`);
    await sleep(2500); await burst('guardian', 6, 1700);
  }
  if (SCENES.includes('vritra')) {
    console.log('vritra: the serpent on level 3');
    await fresh(); await page(`${runOn(3)} await wait(3000); ${skipTo(6)}`);
    await sleep(2500); await burst('vritra', 5, 1500);
    await page(`s.tejas = 100; s.activateTejas();`);
    await burst('vritra-tejas', 4, 900);
  }
  if (SCENES.includes('cover')) {
    console.log('cover: the serpent mid-slam, without the HUD');
    await fresh(); await page(`${runOn(3)} await wait(3000); ${skipTo(6)} ${coverPilot}`);
    for (let i = 0; i < 5; i++) {
      // Wait for a slam well into its wind-up with the two side by side and the serpent
      // whole on the screen; stop the clock, hide everything pinned to the screen, and
      // draw that one moment again. Where the hero and the serpent stand on the screen
      // goes into a file beside the picture, for the crop.
      const at = await page(`const good = b => b && b.slam && b.slam.t > b.slam.dur * 0.5
          && Math.abs(b.x - s.player.x) > 115 && Math.abs(b.x - s.player.x) < 215 && Math.abs(b.y - s.player.y) < 90
          && b.x - s.camOff.x > 75 && b.x - s.camOff.x < W - 75;
        let b; for (let n = 0; n < 2500; n++) { b = s.enemies.find(e => e.isMega); if (good(b)) break; b = null; await wait(20); }
        if (!b) return null;
        game.loop.sleep();
        window.__hud = s.children.list.filter(o => o.scrollFactorX === 0 && o.visible); window.__hud.forEach(o => o.setVisible(false));
        const r = game.renderer; r.preRender(); game.scene.render(r); r.postRender();
        await wait(120);
        return { hero: [s.player.x - s.camOff.x, s.player.y - s.camOff.y], boss: [b.x - s.camOff.x, b.y - s.camOff.y], view: [W, H], slam: b.slam.type };`);
      if (!at) { console.log('  no slam came with the two side by side'); break; }
      const name = `cover-${String.fromCharCode(97 + i)}`;
      await shot(name);
      writeFileSync(join(OUT, name + '.json'), JSON.stringify(at));
      await page(`window.__hud.forEach(o => o.setVisible(true)); game.loop.wake(); await wait(1600);`);
    }
  }
  if (SCENES.includes('film')) {
    const SECONDS = 8;
    console.log(`film: ${SECONDS} seconds of wave 4 on level 1`);
    mkdirSync(join(OUT, 'film'), { recursive: true });
    await fresh(); await page(`${runOn(1, 55)} await wait(3000); ${skipTo(4)}`);
    await sleep(6000);
    film.length = 0;
    await send('Page.startScreencast', { format: 'jpeg', quality: 92, maxWidth: VIEW.width, maxHeight: VIEW.height, everyNthFrame: 1 });
    await sleep(SECONDS * 1000);
    await send('Page.stopScreencast');
    const frames = film.map((f, i) => {
      const name = `f-${String(i).padStart(4, '0')}.jpg`;
      writeFileSync(join(OUT, 'film', name), Buffer.from(f.data, 'base64'));
      return { name, ms: Math.round((f.at - film[0].at) * 1000) };
    });
    writeFileSync(join(OUT, 'film', 'frames.json'), JSON.stringify(frames));
    console.log(`  ${frames.length} frames, ${(frames.length / SECONDS).toFixed(1)} a second`);
  }
  if (problems.length) console.log('PAGE ERRORS: ' + [...new Set(problems)].join('; '));
} catch (e) {
  console.error('FAILED: ' + e.message);
  process.exitCode = 1;
} finally {
  try { ws?.close(); } catch { /* ignore */ }
  browser.kill();
  await sleep(400);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* the browser may still hold it */ }
}
console.log('Pictures: ' + OUT);
