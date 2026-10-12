#!/usr/bin/env node
// Renders index.html to frames, a WAV and an MP4, in headless Chromium.
//
//   node animation/principles-loop/render.mjs                 every frame, the score, the MP4
//   node animation/principles-loop/render.mjs --frames=0,105,384 [--calib]   just those frames, as PNGs
//   node animation/principles-loop/render.mjs --probe=60,300  colours at the mascot's face and diamond 3
//   node animation/principles-loop/render.mjs --audio         the score alone
//   node animation/principles-loop/render.mjs --mux           the MP4 again from the frames and WAV already made
//
// The page asks for three.js on jsDelivr and Geist Mono on Google Fonts. Each is fetched once
// with curl into .cache/ and served from there, so a render is repeatable and works behind a
// proxy. If jsDelivr cannot be reached, three@0.160.0 comes from the npm registry instead:
// the same files.
//
// Needs Node 18+, Playwright with Chromium, ffmpeg, and curl and tar on the PATH.

import { execFileSync, execSync, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const CACHE = path.join(HERE, '.cache');
const ORIGIN = 'http://principles-loop.local';
const OUT = { frames: path.join(CACHE, 'frames'), stills: path.join(CACHE, 'stills'),
  wav: path.join(HERE, 'principles-loop.wav'), mp4: path.join(HERE, 'principles-loop.mp4') };

const args = Object.fromEntries(process.argv.slice(2).map(a => {
  const m = a.replace(/^--/, '').match(/^([^=]+)(?:=(.*))?$/s);
  return [m[1], m[2] ?? true];
}));
const listOf = v => String(v).split(',').filter(Boolean).map(Number);

async function loadPlaywright() {
  try { return await import('playwright'); } catch { /* fall through to the global install */ }
  const root = execSync('npm root -g').toString().trim();
  return import(pathToFileURL(path.join(root, 'playwright', 'index.mjs')).href);
}

// ── fetching, once, into .cache/
const MIME = { '.js': 'text/javascript', '.mjs': 'text/javascript', '.css': 'text/css', '.html': 'text/html',
  '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json' };
function curl(url, dest, ua) {
  const a = ['-sSfL', '--retry', '3', '--max-time', '60', '-o', dest];
  if (ua) a.push('-A', ua);
  execFileSync('curl', [...a, url], { stdio: ['ignore', 'ignore', 'pipe'] });
}
function threeFromNpm(rel) {
  const dir = path.join(CACHE, 'three-0.160.0');
  if (!fs.existsSync(path.join(dir, 'package.json'))) {
    fs.mkdirSync(dir, { recursive: true });
    const tgz = path.join(CACHE, 'three-0.160.0.tgz');
    curl('https://registry.npmjs.org/three/-/three-0.160.0.tgz', tgz);
    execFileSync('tar', ['-xzf', tgz, '-C', dir, '--strip-components=1']);
  }
  return path.join(dir, rel);
}
function cached(url, ua) {
  fs.mkdirSync(path.join(CACHE, 'net'), { recursive: true });
  const ext = path.extname(new URL(url).pathname) || (url.includes('fonts.googleapis.com/css') ? '.css' : '');
  const file = path.join(CACHE, 'net', createHash('sha1').update(url).digest('hex').slice(0, 16) + ext);
  if (!fs.existsSync(file)) {
    try { curl(url, file, ua); }
    catch (e) {
      const m = url.match(/^https:\/\/cdn\.jsdelivr\.net\/npm\/three@0\.160\.0\/(.+)$/);
      if (!m) throw e;
      fs.copyFileSync(threeFromNpm(m[1]), file);
    }
  }
  return { body: fs.readFileSync(file), type: MIME[ext] || 'application/octet-stream' };
}

async function openPage(browser, query = '') {
  const page = await browser.newPage({ viewport: { width: 1080, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => console.error('page error:', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error(`page ${m.type()}:`, m.text()); });
  await page.route('**/*', async route => {
    const req = route.request(), url = req.url();
    try {
      if (url.startsWith(ORIGIN)) {
        const rel = decodeURIComponent(new URL(url).pathname).replace(/^\/+/, '') || 'index.html';
        const file = path.join(HERE, rel);
        return route.fulfill({ body: fs.readFileSync(file), contentType: MIME[path.extname(file)] || 'application/octet-stream' });
      }
      const { body, type } = cached(url, req.headers()['user-agent']);
      return route.fulfill({ body, contentType: type, headers: { 'access-control-allow-origin': '*' } });
    } catch (e) {
      console.error('could not fetch', url, '-', e.message);
      return route.abort();
    }
  });
  await page.goto(`${ORIGIN}/index.html?capture${query}`);
  await page.waitForFunction(() => window.ready !== undefined, null, { timeout: 120000 });
  await page.evaluate(() => window.ready);
  return page;
}

const grab = (page, frame) => page.evaluate(i => {
  window.renderAt(i / window.loopInfo.fps);
  return document.querySelector('#stage canvas').toDataURL('image/png').split(',')[1];
}, frame);

// Median colour of a 9 x 9 patch around each point, read off the drawn canvas.
const probe = (page, frame) => page.evaluate(i => {
  const t = i / 60, face = window.debug.mascotFace(t), diamond = window.debug.project(0, 0.09, 0, t);
  window.renderAt(t);
  const src = document.querySelector('#stage canvas'), c = document.createElement('canvas');
  c.width = c.height = 1080; const g = c.getContext('2d'); g.drawImage(src, 0, 0);
  const at = ([x, y]) => {
    const d = g.getImageData(Math.round(x) - 4, Math.round(y) - 4, 9, 9).data, ch = [[], [], []];
    for (let k = 0; k < d.length; k += 4) for (let j = 0; j < 3; j++) ch[j].push(d[k + j]);
    return ch.map(a => a.sort((p, q) => p - q)[40]);
  };
  const all = g.getImageData(0, 0, 1080, 1080).data; let lum = 0;
  for (let k = 0; k < all.length; k += 4) lum += 0.2126 * all[k] + 0.7152 * all[k + 1] + 0.0722 * all[k + 2];
  return { frame: i, face: at(face), facePx: face.map(Math.round), diamond3: at(diamond), diamondPx: diamond.map(Math.round), meanLuma: lum / (all.length / 4) / 255 };
}, frame);

function writeWav(file, left, right, rate) {
  const n = left.length, bytes = 3, data = Buffer.alloc(n * 2 * bytes), head = Buffer.alloc(44);
  for (let i = 0; i < n; i++) for (const [c, ch] of [[0, left], [1, right]]) {
    const v = Math.max(-8388608, Math.min(8388607, Math.round(ch[i] * 8388607)));
    data.writeIntLE(v, (i * 2 + c) * bytes, bytes);
  }
  head.write('RIFF', 0); head.writeUInt32LE(36 + data.length, 4); head.write('WAVE', 8);
  head.write('fmt ', 12); head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22);
  head.writeUInt32LE(rate, 24); head.writeUInt32LE(rate * 2 * bytes, 28); head.writeUInt16LE(2 * bytes, 32); head.writeUInt16LE(bytes * 8, 34);
  head.write('data', 36); head.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([head, data]));
}

// ffmpeg's own EBU R128 reading, on the file and on three copies of it end to end (how it plays).
function measure(file) {
  const read = loop => {
    const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', ...(loop ? ['-stream_loop', '2'] : []), '-i', file,
      '-filter_complex', 'ebur128=peak=true:framelog=quiet', '-f', 'null', '-'], { encoding: 'utf8' });
    const sum = r.stderr.slice(r.stderr.lastIndexOf('Summary:'));
    const num = re => { const m = sum.match(re); return m ? Number(m[1]) : null; };
    return { lufs: num(/I:\s+(-?[\d.]+) LUFS/), truePeakDb: num(/Peak:\s+(-?[\d.]+) dBFS/) };
  };
  return { once: read(false), looped3x: read(true) };
}

async function main() {
  fs.mkdirSync(CACHE, { recursive: true });
  const { chromium } = await loadPlaywright();
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist', '--autoplay-policy=no-user-gesture-required'] });
  try {
    if (args.eval) {                                       // debugging: run code in the page, keep what it drew
      const page = await openPage(browser, args.calib ? '&calib' : '');
      console.log(JSON.stringify(await page.evaluate(code => (0, eval)(code), String(args.eval))));
      if (args.shot) {
        fs.mkdirSync(OUT.stills, { recursive: true });
        const png = await page.evaluate(() => document.querySelector('#stage canvas').toDataURL('image/png').split(',')[1]);
        fs.writeFileSync(path.join(OUT.stills, `${args.shot}.png`), Buffer.from(png, 'base64'));
      }
      return;
    }
    if (args.probe) {
      const page = await openPage(browser, args.calib ? '&calib' : '');
      for (const f of listOf(args.probe)) console.log(JSON.stringify(await probe(page, f)));
      return;
    }
    if (args.frames) {
      fs.mkdirSync(OUT.stills, { recursive: true });
      const page = await openPage(browser, args.calib ? '&calib' : '');
      for (const f of listOf(args.frames)) {
        const t0 = Date.now(), png = await grab(page, f);
        const file = path.join(OUT.stills, `${args.calib ? 'calib-' : ''}${String(f).padStart(4, '0')}.png`);
        fs.writeFileSync(file, Buffer.from(png, 'base64'));
        console.log(`frame ${f} -> ${path.relative(process.cwd(), file)} (${Date.now() - t0} ms)`);
      }
      return;
    }

    const doVideo = !args.audio, doAudio = !args['no-audio'] && !args.mux;
    if (doAudio) {
      const page = await openPage(browser);
      const t0 = Date.now();
      const s = await page.evaluate(async () => {
        const r = await window.renderScore();
        const b64 = a => { const u = new Uint8Array(a.buffer); let s = ''; for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); };
        return { L: b64(r.left), R: b64(r.right), rate: r.sampleRate, stats: r.stats };
      });
      const f32 = b => { const buf = Buffer.from(b, 'base64'); return new Float32Array(buf.buffer, buf.byteOffset, buf.length / 4); };
      writeWav(OUT.wav, f32(s.L), f32(s.R), s.rate);
      console.log(`score: ${(Date.now() - t0) / 1000} s; in-page master ${s.stats.lufs.toFixed(2)} LUFS, ${s.stats.truePeakDb.toFixed(2)} dBTP, gain ${s.stats.gainDb.toFixed(1)} dB, limiter at most ${s.stats.limiterDb.toFixed(1)} dB`);
      console.log('ffmpeg ebur128:', JSON.stringify(measure(OUT.wav)));
      await page.close();
    }
    if (!doVideo) return;

    const frames = 480;
    if (!args.mux) {
      const workers = Number(args.workers || 2);
      fs.mkdirSync(OUT.frames, { recursive: true });
      const pages = await Promise.all(Array.from({ length: workers }, () => openPage(browser)));
      const t0 = Date.now();
      let done = 0;
      await Promise.all(pages.map(async (page, w) => {
        for (let f = w; f < frames; f += workers) {
          const png = await grab(page, f);
          fs.writeFileSync(path.join(OUT.frames, `${String(f).padStart(4, '0')}.png`), Buffer.from(png, 'base64'));
          if (++done % 24 === 0) console.log(`${done}/${frames} frames, ${((Date.now() - t0) / done / 1000 * workers).toFixed(2)} s a frame a worker`);
        }
      }));
      // Frame 480 must be frame 0.
      const a = await grab(pages[0], 0), b = await grab(pages[0], 480);
      console.log(a === b ? 'frame 480 == frame 0: identical' : 'frame 480 != frame 0');
    }

    const enc = ['-y', '-hide_banner', '-loglevel', 'error', '-framerate', '60', '-i', path.join(OUT.frames, '%04d.png')];
    if (fs.existsSync(OUT.wav)) enc.push('-i', OUT.wav);
    enc.push('-map', '0:v:0');
    // AAC pads the start of the track, so a looping player steps at the seam: the MP4's copy of the
    // score gets a 2 ms raised-cosine fade at each end. The WAV stays the seamless master.
    if (fs.existsSync(OUT.wav)) enc.push('-map', '1:a:0', '-af', 'afade=t=in:d=0.002:curve=hsin,afade=t=out:st=7.998:d=0.002:curve=hsin',
      '-c:a', 'aac', '-b:a', '320k', '-ar', '48000');
    enc.push('-vf', 'scale=in_range=full:out_range=tv:out_color_matrix=bt709,format=yuv420p',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', String(args.crf || 20), '-profile:v', 'high',
      '-colorspace', 'bt709', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-color_range', 'tv',
      '-frames:v', '480', '-t', '8', '-movflags', '+faststart', OUT.mp4);
    execFileSync('ffmpeg', enc, { stdio: 'inherit' });
    console.log(`wrote ${path.relative(process.cwd(), OUT.mp4)} (${(fs.statSync(OUT.mp4).size / 1e6).toFixed(1)} MB)`);
  } finally {
    await browser.close();
  }
}

main().catch(e => { console.error(e); process.exit(1); });
