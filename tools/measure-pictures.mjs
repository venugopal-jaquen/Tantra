/*
 * How much memory the game's pictures take once they are loaded: the figure to hold the
 * phone test against. Loads the game in a private, muted, headless Chrome at a phone's
 * pixel density, goes to the title screen and into a run, and prints:
 *
 *   - every picture the engine holds, at the size it is held (width x height x 4 bytes,
 *     which is what a picture costs on the graphics card, whatever its file weighs);
 *   - the floor pictures, which the game keeps as plain pictures off the graphics card
 *     once it has painted them into its floors (floors.js, FLOOR_PICS);
 *   - the same, added up by kind (figures, icons, floors ...), beside what the files weigh;
 *   - the words on screen and the canvas itself, which grow with the pixel density;
 *   - on Linux and the Mac, how much memory Chrome's own processes hold at each step.
 *
 *   node tools/measure-pictures.mjs [density] [page.html]
 *
 *   density   the phone's device pixel ratio, 1 to 3 (default 3: most phones sold now)
 *   page      defaults to game/loot-chase-v0.1.html; give dist/itch/index.html to measure
 *             what was packaged
 *
 * A browser may keep its own decoded copy of a picture beside the one on the graphics
 * card, so a phone may hold up to twice the pictures' total. Needs Chrome or Edge and
 * Node 22+. No packages.
 */
import { spawn, execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, statSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { findBrowser, MACHINE_FLAGS } from './find-browser.mjs';

const REPO = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const DENSITY = Math.min(3, Math.max(1, +(process.argv[2] || 3)));
const PAGE_FILE = resolve(process.argv[3] || join(REPO, 'game', 'loot-chase-v0.1.html'));
const PAGE = pathToFileURL(PAGE_FILE).href;
const PORT = 9333 + Math.floor(Math.random() * 500);
const MB = n => (n / 1048576).toFixed(1);

const sleep = ms => new Promise(r => setTimeout(r, ms));
const exe = findBrowser();
if (!exe) { console.error('No Chrome or Edge found.'); process.exit(2); }
const profile = mkdtempSync(join(tmpdir(), 'anantarya-profile-'));
const browser = spawn(exe, [
  '--headless=new', ...MACHINE_FLAGS, '--mute-audio', '--allow-file-access-from-files',
  `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--window-size=420,740', 'about:blank'
], { stdio: 'ignore' });

let ws, nextId = 1;
const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => {
  const id = nextId++;
  pending.set(id, { res, rej });
  ws.send(JSON.stringify({ id, method, params }));
});
const page = async (expression) => {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expression} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('page: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
};

// Chrome's processes and what each holds in memory (resident, in bytes), by the kind of
// process: the page ("renderer"), the graphics ("gpu-process"), and the rest. Linux and the
// Mac only; Windows has no `ps`. Shared pages are counted in each process that maps them,
// so the parts add up to a little more than the whole.
function chromeMemory() {
  if (process.platform === 'win32') return null;
  let rows;
  try { rows = execFileSync('ps', ['-axo', 'pid=,ppid=,rss=,args='], { encoding: 'utf8' }).trim().split('\n'); } catch { return null; }
  const procs = rows.map(r => { const m = r.trim().match(/^(\d+)\s+(\d+)\s+(\d+)\s+(.*)$/); return m && { pid: +m[1], ppid: +m[2], rss: +m[3] * 1024, args: m[4] }; }).filter(Boolean);
  const ours = new Set([browser.pid]);
  for (let grew = true; grew;) { grew = false; for (const p of procs) if (!ours.has(p.pid) && ours.has(p.ppid)) { ours.add(p.pid); grew = true; } }
  const by = { renderer: 0, gpu: 0, other: 0 };
  for (const p of procs.filter(p => ours.has(p.pid))) {
    const type = (p.args.match(/--type=(\S+)/) || [])[1];
    by[type === 'renderer' ? 'renderer' : type === 'gpu-process' ? 'gpu' : 'other'] += p.rss;
  }
  return by;
}

// Everything the engine holds, read from the running game. A picture's cost is its width
// x height x 4; a sheet is one picture, however many frames are cut from it.
const HELD = `
  const s = game.scene.keys.LootScene, files = Object.fromEntries(gameAssets().map(a => [a.key, a.path]));
  const pictures = [];
  for (const [key, tex] of Object.entries(game.textures.list)) {
    if (key.startsWith('__')) continue;          // the engine's own one-pixel stand-ins
    for (const src of tex.source) pictures.push({ key, w: src.width, h: src.height, drawn: !!src.isCanvas || !files[key], path: files[key] || null });
  }
  const texts = s.children.list.concat(s.overlay || [], s.uiObjects || []).filter(o => o.type === 'Text' && o.canvas);
  const seen = new Set(), words = texts.filter(t => !seen.has(t) && seen.add(t)).reduce((n, t) => n + t.canvas.width * t.canvas.height * 4, 0);
  const kept = Object.entries(FLOOR_PICS).filter(([, im]) => im).map(([level, im]) => ({ key: 'floor picture ' + level, w: im.naturalWidth || im.width, h: im.naturalHeight || im.height, path: 'assets/floors/level-' + level + '.jpg' }));
  const c = game.canvas;
  return { state: s.state, pictures, kept, words, wordCount: seen.size, canvas: [c.width, c.height], res: RES, renderer: game.renderer.type === Phaser.WEBGL ? 'WebGL' : 'Canvas',
           heap: performance.memory ? performance.memory.usedJSHeapSize : null };`;

const KINDS = [
  ['figures: walk and attack sheets', p => /-walk$/.test(p.key)],
  ['figures: standing, four facings', p => /^[a-z]+-(front|back|left|right)$/.test(p.key)],
  ["hero's portrait and worn parts", p => /-portrait|-zone-/.test(p.key)],
  ['icons', p => /^icons/.test(p.key)],
  ['floors', p => /^floor-pic-/.test(p.key)],
  ['title picture', p => p.key === 'title_art'],
  ['drawn by the game', p => p.drawn],
  ['other pictures', () => true]
];

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
  };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 400, height: 700, deviceScaleFactor: DENSITY, mobile: true });

  const steps = [['an empty page', chromeMemory()]];
  await send('Page.navigate', { url: PAGE });
  let state = 'loading';
  for (let i = 0; i < 120 && state === 'loading'; i++) { await sleep(250); state = await page(`return typeof Loader === 'undefined' ? 'loading' : Loader.state;`); }
  if (state !== 'ready') throw new Error('the loading screen did not reach Begin: ' + state);
  await sleep(1500);
  steps.push(['the loading screen', chromeMemory()]);

  await page(`settings.music = 0; settings.sfx = 0; Loader.begin();`);
  for (let i = 0; i < 80 && (await page(`return game.scene.keys.LootScene.state;`)) !== 'hub'; i++) await sleep(250);
  await sleep(2000);
  const hub = await page(HELD);
  steps.push(['the title screen', chromeMemory()]);

  // Into a run, its lessons skipped, and left to play a while so that what a fight makes
  // as it goes (effects, words, the floor) is made.
  await page(`session.lessonsOff = true; game.scene.keys.LootScene.startRun();`);
  await sleep(8000);
  const run = await page(HELD);
  steps.push(['a run, eight seconds in', chromeMemory()]);

  // ---- the report ----
  const pics = run.pictures, cost = p => p.w * p.h * 4;
  const weigh = path => { try { return statSync(join(dirname(PAGE_FILE), path)).size; } catch { return 0; } };
  console.log(`Pictures held by the game, at a pixel density of ${DENSITY} (the game draws at ${run.res}x, ${run.renderer}).\n`);
  console.log('Each picture, largest first:');
  console.log('  ' + 'held MB'.padStart(8) + '  ' + 'file MB'.padStart(8) + '  ' + 'size'.padEnd(11) + '  picture');
  for (const p of [...pics].sort((a, b) => cost(b) - cost(a))) {
    console.log('  ' + MB(cost(p)).padStart(8) + '  ' + (p.path ? MB(weigh(p.path)) : '-').padStart(8) + '  ' + `${p.w}x${p.h}`.padEnd(11) + '  ' + p.key + (p.drawn ? ' (drawn by the game)' : ''));
  }
  console.log('\nBy kind:');
  const left = [...pics];
  let total = 0, totalFile = 0;
  for (const [name, test] of KINDS) {
    const these = left.filter(test);
    these.forEach(p => left.splice(left.indexOf(p), 1));
    if (!these.length) continue;
    const held = these.reduce((n, p) => n + cost(p), 0), file = these.reduce((n, p) => n + (p.path ? weigh(p.path) : 0), 0);
    total += held; totalFile += file;
    console.log('  ' + MB(held).padStart(8) + ' MB held  ' + MB(file).padStart(6) + ' MB of files  ' + `${these.length}`.padStart(3) + '  ' + name);
  }
  console.log('  ' + MB(total).padStart(8) + ' MB held  ' + MB(totalFile).padStart(6) + ' MB of files  ' + `${pics.length}`.padStart(3) + '  ALL PICTURES ON THE GRAPHICS CARD');
  const kept = run.kept.reduce((n, p) => n + cost(p), 0), keptFile = run.kept.reduce((n, p) => n + weigh(p.path), 0);
  if (run.kept.length) {
    console.log('  ' + MB(kept).padStart(8) + ' MB held  ' + MB(keptFile).padStart(6) + ' MB of files  ' + `${run.kept.length}`.padStart(3) + '  floor pictures, kept off the card once painted into the floors');
    console.log('  ' + MB(total + kept).padStart(8) + ' MB in all');
  }
  const canvas = run.canvas[0] * run.canvas[1] * 4;
  console.log(`\nBeside the pictures: the canvas, ${run.canvas[0]}x${run.canvas[1]}, ${MB(canvas)} MB (and as much again for the frame being drawn);`);
  console.log(`the ${run.wordCount} lines of words on screen in the run, ${MB(run.words)} MB. JavaScript's own heap: ${run.heap ? MB(run.heap) + ' MB' : 'not reported'}.`);
  const fresh = pics.filter(p => !hub.pictures.some(q => q.key === p.key));
  console.log(`Held at the title screen: ${MB(hub.pictures.reduce((n, p) => n + cost(p), 0))} MB; made after it, in the run: ${fresh.length ? fresh.map(p => p.key).join(', ') : 'nothing'}.`);

  if (steps.every(([, m]) => m)) {
    console.log("\nChrome's own processes, resident memory in MB (page / graphics / the rest):");
    for (const [name, m] of steps) console.log('  ' + `${MB(m.renderer)} / ${MB(m.gpu)} / ${MB(m.other)}`.padEnd(24) + name);
    console.log('  The page holds the decoded pictures; the graphics process, the pictures sent to be drawn. Where Chrome draws');
    console.log('  without a graphics chip (the cloud machines) that process does the chip\'s work in software and holds several');
    console.log('  times the pictures\' total, which says nothing of a phone: hold a phone to the pictures\' total above.');
  } else console.log("\nChrome's own processes were not measured: that needs `ps` (Linux or the Mac).");
} catch (err) {
  console.error(err.message);
  process.exitCode = 1;
} finally {
  try { ws && ws.close(); } catch { /* already closed */ }
  browser.kill();
  await sleep(500);
  try { rmSync(profile, { recursive: true, force: true }); } catch { /* Chrome may still hold it */ }
}
