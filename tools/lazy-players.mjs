/*
 * Players who do not play (requirements 2.36): runs the playtest bot's lazy styles beside
 * the bot that plays properly, headless and muted, and prints one line for each. If a
 * lazy style lives as long, gets as far or earns as much as the one that plays, the game
 * has a hole in it.
 *
 *   node tools/lazy-players.mjs [styles] [runs] [upgrades] [cap] [depth] [build]
 *
 *   styles    comma-separated, from plays, lap, stutter, circle, corner, still, milk
 *             (default: all of them; tools/playtest-bot.js says what each does)
 *   runs      runs of each style (default 8; the figures are noisy below that)
 *   upgrades  Vitality and Power rank of the character (default 0, a new player)
 *   cap       game minutes after which a run is stopped as a stall (default 12)
 *   depth     depth of the well, 1 to 7 (default 1)
 *   build     a folder holding another copy of game/, to compare an older build
 *             (git archive <commit> game | tar -x -C <folder>); today's bot plays both
 *
 * Read the columns against the first line, never as absolutes: the bot is far weaker
 * than a person. Needs Chrome or Edge and Node 22+. No packages.
 */
import { spawn } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STYLES = (process.argv[2] || 'plays,lap,stutter,circle,corner,still,milk').split(',');
const RUNS = +(process.argv[3] || 8);
const LEVELS = +(process.argv[4] || 0);
const CAP = +(process.argv[5] || 12);
const DEPTH = +(process.argv[6] || 1);
const REPO = process.argv[7] ? resolve(process.argv[7]) : HERE;
const QUERY = '', TARGET = 3, LABEL = REPO === HERE ? 'this build' : REPO;
const BOT = pathToFileURL(join(HERE, 'tools', 'playtest-bot.js')).href;   // always today's bot, whatever build is played
const PORT = 9333 + Math.floor(Math.random() * 500);
const exe = ['C:/Program Files/Google/Chrome/Application/chrome.exe', 'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', 'C:/Program Files/Microsoft/Edge/Application/msedge.exe'].find(existsSync);
const sleep = ms => new Promise(r => setTimeout(r, ms));
const profile = mkdtempSync(join(tmpdir(), 'anantarya-profile-'));
const browser = spawn(exe, ['--headless=new', '--mute-audio', '--allow-file-access-from-files', `--remote-debugging-port=${PORT}`, `--user-data-dir=${profile}`,
  '--no-first-run', '--no-default-browser-check', '--window-size=420,740', 'about:blank'], { stdio: 'ignore' });
let ws, nextId = 1; const pending = new Map();
const send = (method, params = {}) => new Promise((res, rej) => { const id = nextId++; pending.set(id, { res, rej }); ws.send(JSON.stringify({ id, method, params })); });
const page = async expression => {
  const r = await send('Runtime.evaluate', { expression: `(async () => { ${expression} })()`, awaitPromise: true, returnByValue: true });
  if (r.exceptionDetails) throw new Error('page: ' + (r.exceptionDetails.exception?.description || r.exceptionDetails.text));
  return r.result.value;
};
try {
  let target;
  for (let i = 0; i < 60 && !target; i++) { await sleep(250); try { target = (await (await fetch(`http://127.0.0.1:${PORT}/json/list`)).json()).find(t => t.type === 'page'); } catch {} }
  ws = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((res, rej) => { ws.onopen = res; ws.onerror = rej; });
  ws.onmessage = ev => { const m = JSON.parse(ev.data); if (m.id && pending.has(m.id)) { const p = pending.get(m.id); pending.delete(m.id); m.error ? p.rej(new Error(m.error.message)) : p.res(m.result); } };
  await send('Page.enable'); await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride', { width: 420, height: 740, deviceScaleFactor: 2, mobile: false });
  await send('Page.navigate', { url: pathToFileURL(join(REPO, 'game', 'loot-chase-v0.1.html')).href + QUERY });
  let state = 'loading';
  for (let i = 0; i < 80 && state === 'loading'; i++) { await sleep(250); state = await page(`return typeof Loader === 'undefined' ? 'loading' : Loader.state;`); }
  await page(`settings.sfx = 0; settings.tips = false; settings.shake = false; Loader.begin(); await new Promise(r => setTimeout(r, 500));`);
  const res = await page(`
    game.loop.sleep();
    await new Promise((res, rej) => { const el = document.createElement('script'); el.src = '${BOT}'; el.onload = res; el.onerror = rej; document.head.appendChild(el); });
    const profiles = [];
    for (const style of ${JSON.stringify(STYLES)}) for (let i = 0; i < ${RUNS}; i++)
      profiles.push({ name: style, style: style === 'plays' ? undefined : style, vit: ${LEVELS}, pow: ${LEVELS}, target: ${TARGET}, tejas: ${LEVELS > 0}, capMin: ${CAP}, depth: ${DEPTH} });
    PlaytestBot.start(profiles);
    while (!PlaytestBot.tick(4000).done) await new Promise(r => setTimeout(r, 0));
    const rep = PlaytestBot.report();
    return { errors: rep.errors, build: BUILD, arena: ARENA_SCALE,
      runs: rep.runs.map(r => ({ p: r.profile, sector: r.finalSector, wave: r.wave, won: /extracted/.test(r.result), capped: /time cap/.test(r.result), min: r.gameMin, gold: r.gold, tribute: r.tribute, boons: r.boons, hunts: r.hunts,
        l1: r.sectors[0].hpLostPct, l1min: r.sectors[0].min, kills: r.sectors.reduce((a, x) => a + x.kills, 0), lost: r.sectors.reduce((a, x) => a + x.hpLostPct, 0),
        hits: r.sectors.map(x => x.hits).join(' '), by: r.sectors[0].dmgBy })) };`);
  const groups = {};
  for (const r of res.runs) (groups[r.p] = groups[r.p] || []).push(r);
  const avg = a => a.length ? a.reduce((x, y) => x + y, 0) / a.length : 0;
  console.log(`== ${LABEL} | build ${res.build} | arena x${res.arena} | upgrades ${LEVELS}/${LEVELS} | depth ${DEPTH} | ${RUNS} runs each, capped at ${CAP} min | errors ${res.errors.length}`);
  console.log(`   style     died  capped  won   reached L2  L3   minutes  kills  Nidhi  Nidhi/min  health lost/min  tribute  hunts`);
  for (const [k, rs] of Object.entries(groups)) {
    const mins = avg(rs.map(r => r.min));
    console.log(`   ${k.padEnd(8)} ${String(rs.filter(r => !r.won && !r.capped).length).padStart(4)} ${String(rs.filter(r => r.capped).length).padStart(6)} ${String(rs.filter(r => r.won).length).padStart(5)}`
      + ` ${String(rs.filter(r => r.sector >= 2).length).padStart(8)} ${String(rs.filter(r => r.sector >= 3).length).padStart(5)}`
      + ` ${mins.toFixed(1).padStart(8)} ${avg(rs.map(r => r.kills)).toFixed(0).padStart(6)} ${avg(rs.map(r => r.gold)).toFixed(0).padStart(6)} ${(avg(rs.map(r => r.gold)) / Math.max(0.1, mins)).toFixed(0).padStart(9)}`
      + ` ${(avg(rs.map(r => r.lost)) / Math.max(0.1, mins)).toFixed(0).padStart(13)}% ${avg(rs.map(r => r.tribute)).toFixed(0).padStart(8)} ${avg(rs.map(r => r.hunts || 0)).toFixed(1).padStart(6)}`);
  }
  if (process.argv[8] === 'detail') for (const r of res.runs) console.log('     ' + JSON.stringify(r));
} catch (e) { console.error('FAILED:', e.message); process.exitCode = 1; }
finally { try { ws?.close(); } catch {} browser.kill(); await sleep(400); try { rmSync(profile, { recursive: true, force: true }); } catch {} }
