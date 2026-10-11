/*
 * floors.js: the three floors of the well, in three sets.
 *
 * Declares  FLOORS_CLASSIC and FLOORS_CARVED (painted by code, with the tools above them),
 *           FLOORS_PAINTED (the founder's pictures, assets/floors/level-N.jpg, each with
 *           where its floor lies inside it and where its lamps are), FLOOR_PICS,
 *           FLOOR_SETS, FLOOR_SET (the default) and FLOORS (the set in use).
 * Needs     config.js (MARGIN, QUERY), ui.js (FORGE).
 * State     FLOOR_PICS holds the loaded pictures; the scene fills it once, in create().
 */

// ---------- The stepwell (requirements 2.10) ----------
// The whole game is one descent down a stepwell - a baori, the stepped wells of Rajasthan
// and Gujarat. The title screen looks down its shaft; every arena is the landing of one
// level, framed by stairs; each sector is a deeper level with its own painted floor.

// A small seeded generator, so a floor paints the same way every time.
function seeded(seed) {
  return () => {
    seed = seed + 0x6D2B79F5 | 0;
    let t = Math.imul(seed ^ seed >>> 15, 1 | seed);
    t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// A lens-shaped petal from radius r0 to r1 along angle a; `bulge` is its half-width.
function petalPath(ctx, cx, cy, a, r0, r1, bulge) {
  const c = Math.cos(a), sn = Math.sin(a), mid = (r0 + r1) / 2;
  const at = (r, off) => [cx + c * r - sn * off, cy + sn * r + c * off];
  const [x0, y0] = at(r0, 0), [x1, y1] = at(r1, 0), [ax, ay] = at(mid, bulge * 2), [bx, by] = at(mid, -bulge * 2);
  ctx.beginPath(); ctx.moveTo(x0, y0);
  ctx.quadraticCurveTo(ax, ay, x1, y1); ctx.quadraticCurveTo(bx, by, x0, y0);
  ctx.closePath();
}

// rings: [petals, r0, r1, bulge, rotation]
function rosette(ctx, cx, cy, rings, fill, stroke, width) {
  rings.forEach(([n, r0, r1, bulge, rot]) => {
    for (let i = 0; i < n; i++) {
      petalPath(ctx, cx, cy, (i / n) * Math.PI * 2 + (rot || 0), r0, r1, bulge);
      if (fill) { ctx.fillStyle = fill; ctx.fill(); }
      if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.stroke(); }
    }
  });
}

// A border band of small triangles just inside the floor's edge - the stair motif again.
function stairBand(ctx, w, h, inset, depth, colour) {
  ctx.fillStyle = colour;
  const tooth = (x0, y0, x1, y1, x2, y2) => { ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.lineTo(x2, y2); ctx.closePath(); ctx.fill(); };
  const nx = Math.round((w - inset * 2) / 14), sx = (w - inset * 2) / nx;
  for (let i = 0; i < nx; i++) {
    const x = inset + i * sx;
    tooth(x, inset, x + sx, inset, x + sx / 2, inset + depth);
    tooth(x, h - inset, x + sx, h - inset, x + sx / 2, h - inset - depth);
  }
  const ny = Math.round((h - inset * 2) / 14), sy = (h - inset * 2) / ny;
  for (let i = 0; i < ny; i++) {
    const y = inset + i * sy;
    tooth(inset, y, inset, y + sy, inset + depth, y + sy / 2);
    tooth(w - inset, y, w - inset, y + sy, w - inset - depth, y + sy / 2);
  }
}

// One painted floor per level of the well. Sector N uses FLOORS[(N-1) % 3]; from Sector 4
// the three repeat under a deepening wash. Each is drawn once into a texture.
// `px` is the texture's pixels per world unit (shadow blur ignores the canvas transform).
const FLOORS_CLASSIC = [
  { // Sector 1 - the sunlit courtyard at the top: red sandstone paving, a carved lotus.
    name: 'courtyard', ember: 0xff6b1a, emberAlpha: 0.2, edge: 0xc8a96e,
    paint(ctx, w, h) {
      const cx = w / 2, cy = h / 2, R = seeded(11);
      const g = ctx.createRadialGradient(cx, cy * 0.9, 10, cx, cy, Math.max(w, h) * 0.6);
      g.addColorStop(0, '#bd5c1c'); g.addColorStop(0.5, '#903c12'); g.addColorStop(1, '#5a2209');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // Paving: running-bond slabs, each a slightly different stone.
      const cols = 5, rows = 8, sw = w / cols, sh = h / rows;
      for (let r = 0; r < rows; r++) for (let c = -1; c < cols; c++) {
        const x = c * sw + (r % 2 ? sw / 2 : 0), y = r * sh, tone = (R() - 0.5) * 0.16;
        ctx.fillStyle = tone > 0 ? `rgba(255,205,140,${tone})` : `rgba(30,8,0,${-tone})`;
        ctx.fillRect(x, y, sw, sh);
        ctx.strokeStyle = 'rgba(40,14,0,0.5)'; ctx.lineWidth = 1.4; ctx.strokeRect(x, y, sw, sh);
        ctx.strokeStyle = 'rgba(255,222,165,0.12)'; ctx.lineWidth = 1;
        ctx.beginPath(); ctx.moveTo(x + 1.5, y + sh - 1.5); ctx.lineTo(x + 1.5, y + 1.5); ctx.lineTo(x + sw - 1.5, y + 1.5); ctx.stroke();
      }
      // The carving: cut once in shadow, once in light, so it reads as relief.
      const carve = (dx, dy, fill, stroke) => {
        ctx.save(); ctx.translate(dx, dy);
        rosette(ctx, cx, cy, [[16, 84, 132, 13], [8, 34, 90, 21], [8, 24, 60, 12, Math.PI / 8]], fill, stroke, 1.5);
        ctx.strokeStyle = stroke; ctx.lineWidth = 1.5;
        for (const r of [20, 138, 146]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
        for (const [qx, qy] of [[0, 0], [w, 0], [0, h], [w, h]]) {
          rosette(ctx, qx, qy, [[12, 22, 70, 11]], fill, stroke, 1.3);
          ctx.beginPath(); ctx.arc(qx, qy, 78, 0, Math.PI * 2); ctx.stroke();
        }
        ctx.restore();
      };
      carve(1.2, 1.4, null, 'rgba(35,10,0,0.55)');
      carve(0, 0, 'rgba(255,200,130,0.12)', 'rgba(255,224,170,0.55)');
      ctx.fillStyle = 'rgba(255,224,170,0.4)';
      for (let i = 0; i < 32; i++) { const a = (i / 32) * Math.PI * 2; ctx.beginPath(); ctx.arc(cx + Math.cos(a) * 156, cy + Math.sin(a) * 156, 1.9, 0, Math.PI * 2); ctx.fill(); }
      stairBand(ctx, w, h, 5, 8, 'rgba(255,224,170,0.2)');
      // A shaft of daylight falling across the court.
      const sun = ctx.createLinearGradient(0, 0, w, h * 0.5);
      sun.addColorStop(0.15, 'rgba(255,236,190,0)'); sun.addColorStop(0.45, 'rgba(255,236,190,0.13)'); sun.addColorStop(0.75, 'rgba(255,236,190,0)');
      ctx.fillStyle = sun; ctx.fillRect(0, 0, w, h);
    } },
  { // Sector 2 - "The Churning Depths": the flooded level. Green well-water, a whirlpool, lotus.
    name: 'water', ember: 0xcffff4, emberAlpha: 0.13, edge: 0xe0c08a,
    paint(ctx, w, h) {
      const cx = w / 2, cy = h / 2;
      const g = ctx.createRadialGradient(cx, cy, 10, cx, cy, Math.max(w, h) * 0.62);
      g.addColorStop(0, '#2a8a7a'); g.addColorStop(0.5, '#175a5c'); g.addColorStop(1, '#0c3a44');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // Water drawn the way Indian miniature painters draw it: rows of little scalloped waves.
      ctx.strokeStyle = 'rgba(200,245,235,0.1)'; ctx.lineWidth = 1;
      for (let row = 0, y = 10; y < h + 10; y += 15, row++) for (let x = (row % 2 ? 0 : 11); x < w + 22; x += 22) {
        ctx.beginPath(); ctx.arc(x, y, 10, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
      }
      // The churn: spiral arms winding in to the centre.
      for (let arm = 0; arm < 6; arm++) {
        for (let i = 0; i < 60; i++) {
          const t0 = i / 60, t1 = (i + 1) / 60, spin = arm * Math.PI / 3;
          const pt = t => { const r = 24 + t * 236, a = spin + t * 3.4; return [cx + Math.cos(a) * r, cy + Math.sin(a) * r * 1.12]; };
          const [x0, y0] = pt(t0), [x1, y1] = pt(t1);
          ctx.strokeStyle = `rgba(215,250,240,${0.26 * (1 - t0 * 0.75)})`; ctx.lineWidth = 3.4 * (1 - t0) + 0.7;
          ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
        }
      }
      // A stone lotus at the eye of it.
      rosette(ctx, cx, cy, [[12, 12, 46, 8], [6, 6, 26, 7, Math.PI / 6]], 'rgba(255,214,190,0.22)', 'rgba(255,236,220,0.6)', 1.3);
      // Lily pads and blossoms drifting at the edges.
      const pads = [[0.13, 0.1, 21, 0.4], [0.87, 0.17, 17, 2.2], [0.1, 0.5, 15, 4.0], [0.9, 0.58, 23, 1.1], [0.19, 0.91, 19, 5.2], [0.81, 0.9, 16, 3.0], [0.55, 0.06, 13, 0.9], [0.4, 0.95, 12, 2.6]];
      pads.forEach(([fx, fy, r, a], i) => {
        const x = fx * w, y = fy * h;
        ctx.fillStyle = 'rgba(58,128,70,0.62)'; ctx.strokeStyle = 'rgba(170,225,150,0.45)'; ctx.lineWidth = 1.2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, a + 0.25, a + Math.PI * 2 - 0.25); ctx.closePath(); ctx.fill(); ctx.stroke();
        ctx.strokeStyle = 'rgba(170,225,150,0.22)';
        for (let v = 0; v < 6; v++) { const va = a + 0.6 + v * 0.95; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(va) * r * 0.86, y + Math.sin(va) * r * 0.86); ctx.stroke(); }
        if (i % 2 === 0) rosette(ctx, x + r * 0.9, y - r * 0.5, [[8, 2, r * 0.55, r * 0.16], [5, 1, r * 0.3, r * 0.12, 0.4]], 'rgba(255,170,190,0.7)', 'rgba(255,235,235,0.75)', 0.9);
      });
      // The stone lip of the pool, so the warm world still frames the cool one.
      ctx.strokeStyle = '#8f5a2a'; ctx.lineWidth = 10; ctx.strokeRect(5, 5, w - 10, h - 10);
      ctx.strokeStyle = 'rgba(255,224,170,0.35)'; ctx.lineWidth = 1; ctx.strokeRect(10.5, 10.5, w - 21, h - 21);
      stairBand(ctx, w, h, 1, 7, 'rgba(60,28,6,0.55)');
    } },
  { // Sector 3 - "The Convergence Core": the vault at the bottom. Dark stone, molten gold inlay.
    name: 'vault', ember: 0xffd23c, emberAlpha: 0.3, edge: 0xffc93c,
    paint(ctx, w, h, px) {
      const cx = w / 2, cy = h / 2, R = seeded(29);
      const g = ctx.createRadialGradient(cx, cy, 6, cx, cy, Math.max(w, h) * 0.6);
      g.addColorStop(0, '#d0600f'); g.addColorStop(0.28, '#8a2607'); g.addColorStop(0.7, '#4a1005'); g.addColorStop(1, '#300803');
      ctx.fillStyle = g; ctx.fillRect(0, 0, w, h);
      // Inlay: interlocking circles round a grid of dots - the four-petal figure common to
      // kolam floor drawings and to stone screens alike - poured in gold.
      ctx.save();
      ctx.shadowColor = '#ff9a20'; ctx.shadowBlur = 5 * px;
      const sp = 34, ox = (w % sp) / 2, oy = (h % sp) / 2;
      ctx.strokeStyle = 'rgba(255,198,90,0.38)'; ctx.lineWidth = 1.1;
      for (let y = oy; y <= h; y += sp) for (let x = ox; x <= w; x += sp) { ctx.beginPath(); ctx.arc(x, y, sp * 0.7071, 0, Math.PI * 2); ctx.stroke(); }
      ctx.fillStyle = 'rgba(255,226,140,0.7)';
      for (let y = oy; y <= h; y += sp) for (let x = ox; x <= w; x += sp) { ctx.beginPath(); ctx.arc(x, y, 1.7, 0, Math.PI * 2); ctx.fill(); }
      // Cracks where the heat below shows through.
      for (let i = 0; i < 10; i++) {
        let a = (i / 10) * Math.PI * 2 + R() * 0.4, r = 58 + R() * 20, x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
        ctx.strokeStyle = 'rgba(255,170,60,0.55)'; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.moveTo(x, y);
        for (let k = 0; k < 7; k++) { a += (R() - 0.5) * 0.9; r = 20 + R() * 26; x += Math.cos(a) * r; y += Math.sin(a) * r; ctx.lineTo(x, y); }
        ctx.stroke();
      }
      // The seal at the centre.
      rosette(ctx, cx, cy, [[12, 30, 64, 9], [12, 14, 40, 7, Math.PI / 12]], 'rgba(255,196,80,0.2)', 'rgba(255,228,150,0.85)', 1.4);
      ctx.strokeStyle = 'rgba(255,228,150,0.85)'; ctx.lineWidth = 1.6;
      for (const r of [12, 70, 76]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
      ctx.restore();
      // Let the inlay sink into darkness toward the walls.
      const fade = ctx.createRadialGradient(cx, cy, Math.min(w, h) * 0.3, cx, cy, Math.max(w, h) * 0.62);
      fade.addColorStop(0, 'rgba(48,8,3,0)'); fade.addColorStop(1, 'rgba(48,8,3,0.62)');
      ctx.fillStyle = fade; ctx.fillRect(0, 0, w, h);
      stairBand(ctx, w, h, 5, 8, 'rgba(255,205,100,0.26)');
    } }
];

// <<< painted floor sets
// ---------- Painted floors: shared tools (requirements 2.10) ----------
// Smooth value noise, so stone and water can be mottled pixel by pixel instead of filled
// flat - the difference between a diagram of a floor and a floor.
function makeNoise(seed) {
  const R = seeded(seed), val = new Float32Array(256), perm = new Uint8Array(512);
  for (let i = 0; i < 256; i++) { val[i] = R(); perm[i] = i; }
  for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)), t = perm[i]; perm[i] = perm[j]; perm[j] = t; }
  for (let i = 0; i < 256; i++) perm[256 + i] = perm[i];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const a = val[perm[perm[xi & 255] + (yi & 255)]], b = val[perm[perm[(xi + 1) & 255] + (yi & 255)]];
    const c = val[perm[perm[xi & 255] + ((yi + 1) & 255)]], d = val[perm[perm[(xi + 1) & 255] + ((yi + 1) & 255)]];
    return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
  };
}
function fbm(n, x, y, octaves) {
  let amp = 0.5, f = 1, sum = 0, tot = 0;
  for (let o = 0; o < octaves; o++) { sum += amp * n(x * f, y * f); tot += amp; amp *= 0.5; f *= 2.03; }
  return sum / tot;
}
const smooth = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };

// A field shaded pixel by pixel. shade(x, y, out) fills out = [r, g, b, alpha 0..1] in
// world units. Sampled once per world unit and scaled up, which keeps it soft and quick.
function paintField(ctx, w, h, shade, mode) {
  const cw = Math.ceil(w), ch = Math.ceil(h), c = document.createElement('canvas');
  c.width = cw; c.height = ch;
  const x = c.getContext('2d'), img = x.createImageData(cw, ch), d = img.data, out = [0, 0, 0, 1];
  for (let j = 0, k = 0; j < ch; j++) for (let i = 0; i < cw; i++, k += 4) {
    shade(i, j, out);
    d[k] = out[0]; d[k + 1] = out[1]; d[k + 2] = out[2]; d[k + 3] = out[3] * 255;
  }
  x.putImageData(img, 0, 0);
  ctx.save();
  if (mode) ctx.globalCompositeOperation = mode;
  ctx.drawImage(c, 0, 0, cw, ch);
  ctx.restore();
}

// stops: [[at, [r, g, b]], ...] in rising order of `at`.
function rampColour(stops, t, out) {
  let i = 1;
  while (i < stops.length - 1 && t > stops[i][0]) i++;
  const [t0, a] = stops[i - 1], [t1, b] = stops[i], k = Math.max(0, Math.min(1, (t - t0) / (t1 - t0 || 1)));
  out[0] = a[0] + (b[0] - a[0]) * k; out[1] = a[1] + (b[1] - a[1]) * k; out[2] = a[2] + (b[2] - a[2]) * k;
}

// Weathered stone: broad mottling, with a finer grain riding on it.
function paintStone(ctx, w, h, seed, stops, scale) {
  const big = makeNoise(seed), fine = makeNoise(seed + 7);
  paintField(ctx, w, h, (x, y, out) => {
    rampColour(stops, fbm(big, x / scale, y / scale, 4) * 0.72 + fbm(fine, x / 7, y / 7, 2) * 0.28, out);
    out[3] = 1;
  });
}

// Fine speckle at full resolution: the grit that tells the eye this is stone.
function paintGrit(ctx, w, h, seed, count, light, dark) {
  const R = seeded(seed);
  for (let i = 0; i < count; i++) {
    ctx.fillStyle = R() < 0.5 ? light : dark;
    ctx.fillRect(R() * w, R() * h, 0.5 + R() * 0.9, 0.5 + R() * 0.9);
  }
}

// The sun stands to the upper left of every floor. A surface facing it brightens, one
// facing away darkens: `tone(rgb, nx, ny)` shades a colour by the way its face leans.
const SUN = [-0.6, -0.8];
function tone(rgb, nx, ny, strength = 0.34, alpha = 1) {
  const k = 1 + strength * (nx * SUN[0] + ny * SUN[1]);
  const c = v => Math.max(0, Math.min(255, Math.round(v * k)));
  return `rgba(${c(rgb[0])},${c(rgb[1])},${c(rgb[2])},${alpha})`;
}
function poly(ctx, pts, fill, stroke, width) {
  ctx.beginPath();
  pts.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y));
  ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = width || 1; ctx.stroke(); }
}
// A carved ray or leaf: two faces meeting on a ridge, so it catches the light like relief.
function carvedRay(ctx, cx, cy, a, r0, r1, half, rgb, strength) {
  const c = Math.cos(a), s = Math.sin(a), bx = cx + c * r0, by = cy + s * r0, tx = cx + c * r1, ty = cy + s * r1;
  poly(ctx, [[bx, by], [bx - s * half, by + c * half], [tx, ty]], tone(rgb, -s, c, strength));
  poly(ctx, [[bx, by], [bx + s * half, by - c * half], [tx, ty]], tone(rgb, s, -c, strength));
}

// Irregular ashlar paving: courses of differing height, slabs of differing width, each
// stone a shade of its own, bevelled, and here and there cracked.
function paintPaving(ctx, w, h, seed, ink, lightInk, opts = {}) {
  const R = seeded(seed), heights = opts.heights || [46, 54, 62];
  for (let y = 0; y < h;) {
    const rh = heights[Math.floor(R() * heights.length)];
    for (let x = -R() * 40; x < w;) {
      const sw = (opts.minW || 50) + R() * (opts.varW || 46), t = (R() - 0.5) * (opts.contrast || 0.2);
      ctx.fillStyle = t > 0 ? `rgba(${lightInk},${t})` : `rgba(${ink},${-t})`;
      ctx.fillRect(x, y, sw, rh);
      ctx.strokeStyle = `rgba(${ink},0.6)`; ctx.lineWidth = 1.3; ctx.strokeRect(x, y, sw, rh);
      ctx.strokeStyle = `rgba(${lightInk},0.2)`; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(x + 1.6, y + rh - 1.6); ctx.lineTo(x + 1.6, y + 1.6); ctx.lineTo(x + sw - 1.6, y + 1.6); ctx.stroke();
      ctx.strokeStyle = `rgba(${ink},0.22)`;
      ctx.beginPath(); ctx.moveTo(x + sw - 1.6, y + 1.6); ctx.lineTo(x + sw - 1.6, y + rh - 1.6); ctx.lineTo(x + 1.6, y + rh - 1.6); ctx.stroke();
      if (R() < (opts.cracks === undefined ? 0.16 : opts.cracks)) {            // a crack running in from one edge
        let px = x + R() * sw, py = y, a = Math.PI / 2 + (R() - 0.5) * 0.8;
        ctx.strokeStyle = `rgba(${ink},0.5)`; ctx.lineWidth = 0.8;
        ctx.beginPath(); ctx.moveTo(px, py);
        for (let k = 0; k < 4; k++) { a += (R() - 0.5) * 1.1; px += Math.cos(a) * (6 + R() * 9); py += Math.sin(a) * (6 + R() * 9); ctx.lineTo(Math.max(x, Math.min(x + sw, px)), Math.min(y + rh, py)); }
        ctx.stroke();
      }
      x += sw;
    }
    y += rh;
  }
}

// The stairs around the arena, drawn as stairs: three courses of dressed stone stepping
// down toward the floor. Risers that face the sun are lit; those that face away are dark
// and throw a shadow on the tread below. `frame` is the whole area under the HUD.
function paintStepFrame(ctx, fw, fh, seed, stops, ink, lightInk, deco) {
  paintStone(ctx, fw, fh, seed, stops, 46);
  paintGrit(ctx, fw, fh, seed + 3, 2600, `rgba(${lightInk},0.22)`, `rgba(${ink},0.25)`);
  const R = seeded(seed + 1), courses = 3, cw = MARGIN / courses;
  for (let c = 0; c < courses; c++) {
    const o = c * cw, i = o + cw;                                   // this course runs from o to i, measured in from the frame's edge
    // Deeper courses stand a little lower in the well: a touch darker.
    ctx.fillStyle = `rgba(${ink},${0.09 * c})`;
    ctx.fillRect(o, o, fw - o * 2, cw); ctx.fillRect(o, fh - i, fw - o * 2, cw);
    ctx.fillRect(o, i, cw, fh - i * 2); ctx.fillRect(fw - i, i, cw, fh - i * 2);
    // Joints between the blocks of the course.
    const joint = (x0, y0, x1, y1) => {
      ctx.strokeStyle = `rgba(${ink},0.5)`; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      ctx.strokeStyle = `rgba(${lightInk},0.16)`; ctx.beginPath(); ctx.moveTo(x0 + 1, y0 + 1); ctx.lineTo(x1 + 1, y1 + 1); ctx.stroke();
    };
    for (let x = i + R() * 30; x < fw - i; x += 26 + R() * 22) { joint(x, o, x, i); joint(x + 13, fh - i, x + 13, fh - o); }
    for (let y = i + R() * 30; y < fh - i; y += 26 + R() * 22) { joint(o, y, i, y); joint(fw - i, y + 13, fw - o, y + 13); }
    // Risers. Top and left face away from the sun: a dark edge and a cast shadow.
    const sh = ctx.createLinearGradient(0, i, 0, i + 5);
    sh.addColorStop(0, `rgba(${ink},0.55)`); sh.addColorStop(1, `rgba(${ink},0)`);
    ctx.fillStyle = sh; ctx.fillRect(i, i, fw - i * 2, 5);
    const sv = ctx.createLinearGradient(i, 0, i + 5, 0);
    sv.addColorStop(0, `rgba(${ink},0.5)`); sv.addColorStop(1, `rgba(${ink},0)`);
    ctx.fillStyle = sv; ctx.fillRect(i, i, 5, fh - i * 2);
    ctx.strokeStyle = `rgba(${ink},0.75)`; ctx.lineWidth = 1.6;
    ctx.beginPath(); ctx.moveTo(i, fh - i); ctx.lineTo(i, i); ctx.lineTo(fw - i, i); ctx.stroke();
    // Bottom and right face the sun: a bright lip.
    ctx.strokeStyle = `rgba(${lightInk},0.6)`; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(i, fh - i); ctx.lineTo(fw - i, fh - i); ctx.lineTo(fw - i, i); ctx.stroke();
  }
  // Where two flights meet at a corner.
  ctx.strokeStyle = `rgba(${ink},0.55)`; ctx.lineWidth = 1.2;
  for (const [x0, y0, x1, y1] of [[0, 0, MARGIN, MARGIN], [fw, 0, fw - MARGIN, MARGIN], [0, fh, MARGIN, fh - MARGIN], [fw, fh, fw - MARGIN, fh - MARGIN]]) {
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
  }
  if (deco) deco(ctx, fw, fh, R);
}

// Small things that sit on a floor or a step, seen from straight above.
function paintGlow(ctx, x, y, r, rgb, alpha) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${alpha})`); g.addColorStop(1, `rgba(${rgb},0)`);
  ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = g; ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}
function paintDiya(ctx, x, y, s = 1) {                 // a clay lamp: bowl, wick, flame, and the light it throws
  paintGlow(ctx, x, y, 24 * s, '255,190,90', 0.5);
  ctx.fillStyle = 'rgba(20,6,0,0.35)'; ctx.beginPath(); ctx.ellipse(x + 1.5 * s, y + 2 * s, 5.4 * s, 4.4 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#9a4a22'; ctx.beginPath(); ctx.ellipse(x, y, 5.2 * s, 4.2 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#5a2408'; ctx.beginPath(); ctx.ellipse(x, y, 3.6 * s, 2.8 * s, 0, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,214,160,0.7)'; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.ellipse(x, y, 5.2 * s, 4.2 * s, 0, Math.PI * 1.05, Math.PI * 1.75); ctx.stroke();
  ctx.fillStyle = '#ffd040'; ctx.beginPath(); ctx.ellipse(x + 0.6 * s, y - 0.6 * s, 2.1 * s, 2.6 * s, 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff6d8'; ctx.beginPath(); ctx.arc(x + 0.5 * s, y - 0.4 * s, 1.1 * s, 0, Math.PI * 2); ctx.fill();
}
function paintPetals(ctx, R, x, y, spread, count, colours) {   // strewn marigold petals
  for (let i = 0; i < count; i++) {
    const a = R() * Math.PI * 2, d = Math.sqrt(R()) * spread, px = x + Math.cos(a) * d, py = y + Math.sin(a) * d * 0.8, rot = R() * Math.PI;
    ctx.fillStyle = 'rgba(40,12,0,0.3)'; ctx.beginPath(); ctx.ellipse(px + 0.7, py + 0.9, 2.3, 1.3, rot, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = colours[Math.floor(R() * colours.length)]; ctx.beginPath(); ctx.ellipse(px, py, 2.3, 1.3, rot, 0, Math.PI * 2); ctx.fill();
  }
}
function paintPot(ctx, R, x, y, r) {                  // a terracotta pot of marigolds
  ctx.fillStyle = 'rgba(20,6,0,0.4)'; ctx.beginPath(); ctx.arc(x + 2, y + 2.6, r + 0.5, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#8e4320'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#d98a52'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(x, y, r - 0.6, Math.PI * 0.95, Math.PI * 1.8); ctx.stroke();
  for (let i = 0; i < 9; i++) {
    const a = R() * Math.PI * 2, d = R() * (r - 2.2);
    ctx.fillStyle = R() < 0.55 ? '#356b22' : '#4a8a2c'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 2.2, 0, Math.PI * 2); ctx.fill();
  }
  for (let i = 0; i < 6; i++) {
    const a = R() * Math.PI * 2, d = R() * (r - 2.6);
    ctx.fillStyle = R() < 0.5 ? '#ffb020' : '#ff7e12'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d, y + Math.sin(a) * d, 1.6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffe07a'; ctx.beginPath(); ctx.arc(x + Math.cos(a) * d - 0.3, y + Math.sin(a) * d - 0.3, 0.6, 0, Math.PI * 2); ctx.fill();
  }
}

// A lotus pad on water, with the shadow it throws below it and, sometimes, a blossom.
function paintLotusPad(ctx, x, y, r, rot, blossom) {
  ctx.fillStyle = 'rgba(0,22,26,0.42)';
  ctx.beginPath(); ctx.moveTo(x + 2.5, y + 3.5); ctx.arc(x + 2.5, y + 3.5, r, rot + 0.22, rot + Math.PI * 2 - 0.22); ctx.closePath(); ctx.fill();
  const g = ctx.createRadialGradient(x - r * 0.3, y - r * 0.3, 1, x, y, r);
  g.addColorStop(0, '#5aa85a'); g.addColorStop(0.7, '#2f7a45'); g.addColorStop(1, '#1f5a36');
  ctx.fillStyle = g;
  ctx.beginPath(); ctx.moveTo(x, y); ctx.arc(x, y, r, rot + 0.22, rot + Math.PI * 2 - 0.22); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = 'rgba(190,240,170,0.5)'; ctx.lineWidth = 0.9;
  ctx.beginPath(); ctx.arc(x, y, r - 0.5, rot + Math.PI * 0.9, rot + Math.PI * 1.7); ctx.stroke();
  ctx.strokeStyle = 'rgba(20,60,34,0.5)'; ctx.lineWidth = 0.7;
  for (let v = 0; v < 7; v++) { const a = rot + 0.6 + v * 0.8; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + Math.cos(a) * r * 0.9, y + Math.sin(a) * r * 0.9); ctx.stroke(); }
  if (!blossom) return;
  const bx = x + Math.cos(rot + 2.4) * r * 0.75, by = y + Math.sin(rot + 2.4) * r * 0.75, br = Math.max(7, r * 0.62);
  ctx.fillStyle = 'rgba(0,22,26,0.35)'; ctx.beginPath(); ctx.arc(bx + 2, by + 2.6, br * 0.9, 0, Math.PI * 2); ctx.fill();
  rosette(ctx, bx, by, [[10, br * 0.2, br, br * 0.17]], '#f08fb0', 'rgba(150,40,80,0.5)', 0.6);
  rosette(ctx, bx, by, [[8, br * 0.1, br * 0.7, br * 0.15, 0.4]], '#ffc4d6', 'rgba(150,40,80,0.4)', 0.5);
  rosette(ctx, bx, by, [[6, 0, br * 0.42, br * 0.12, 0.2]], '#fff0f4', null, 0);
  ctx.fillStyle = '#ffd24a'; ctx.beginPath(); ctx.arc(bx, by, br * 0.16, 0, Math.PI * 2); ctx.fill();
}

// Points round a rounded rectangle, clockwise from the middle of its top edge, each with
// the direction that faces outward. `m` is the inset from the floor's edge.
function roundRectPoints(w, h, m, r, step) {
  const pts = [], x0 = m, y0 = m, x1 = w - m, y1 = h - m, cx = w / 2;
  const line = (ax, ay, bx, by, nx, ny) => { const len = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.round(len / step)); for (let i = 0; i < n; i++) pts.push({ x: ax + (bx - ax) * i / n, y: ay + (by - ay) * i / n, nx, ny }); };
  const arc = (ox, oy, a0) => { const n = Math.max(2, Math.round(r * Math.PI / 2 / step)); for (let i = 0; i < n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push({ x: ox + Math.cos(a) * r, y: oy + Math.sin(a) * r, nx: Math.cos(a), ny: Math.sin(a) }); } };
  line(cx, y0, x1 - r, y0, 0, -1); arc(x1 - r, y0 + r, -Math.PI / 2);
  line(x1, y0 + r, x1, y1 - r, 1, 0); arc(x1 - r, y1 - r, 0);
  line(x1 - r, y1, x0 + r, y1, 0, 1); arc(x0 + r, y1 - r, Math.PI / 2);
  line(x0, y1 - r, x0, y0 + r, -1, 0); arc(x0 + r, y0 + r, Math.PI);
  line(x0 + r, y0, cx, y0, 0, -1);
  return pts;
}

// ---------- Floor set "carved" (requirements 2.10) ----------
// Each level is a place with its own scene, not a pattern: weathered stone shaded pixel by
// pixel, carving that catches one sun, and things that belong to this game's story.
const FLOORS_CARVED = [
  { // Level 1 - Prangan, the sunlit court. The hero walks in from daylight: the court is paved
    // round a carved sun, and daylight falls through a jaali screen across it.
    name: 'court', ember: 0xffc070, emberAlpha: 0.14, edge: 0xe8c690,
    lights: [[118, 150, 120, 0xffb060, 0.1, 3200], [248, 384, 150, 0xffc880, 0.07, 4100]],   // the sun, breathing as cloud passes
    paint(ctx, w, h, px) {
      const cx = w / 2, cy = h / 2, R = seeded(101), stone = [198, 124, 62];
      paintStone(ctx, w, h, 101, [[0, [118, 58, 22]], [0.5, [170, 92, 38]], [1, [212, 140, 72]]], 74);
      paintPaving(ctx, w, h, 103, '46,16,2', '255,216,156');
      paintGrit(ctx, w, h, 105, 5200, 'rgba(255,226,176,0.2)', 'rgba(50,18,2,0.22)');

      // The sun. Its bed is cut a little below the paving, so the rays stand proud of it.
      const disc = (r, fill) => { ctx.fillStyle = fill; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill(); };
      const ring = (r, stroke, width) => { ctx.strokeStyle = stroke; ctx.lineWidth = width; ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); };
      disc(139, 'rgba(46,16,2,0.3)'); ring(139, 'rgba(46,16,2,0.7)', 1.6); ring(137.2, 'rgba(255,220,160,0.3)', 1);
      for (let i = 0; i < 44; i++) carvedRay(ctx, cx, cy, (i / 44) * Math.PI * 2, 127, 137, 4.6, stone, 0.4);   // the saw-tooth rim
      disc(127, 'rgb(142,74,30)');
      const bed = ctx.createRadialGradient(cx - 30, cy - 40, 10, cx, cy, 127);
      bed.addColorStop(0, 'rgba(255,214,150,0.2)'); bed.addColorStop(1, 'rgba(30,8,0,0.16)');
      disc(127, bed); ring(127, 'rgba(46,16,2,0.75)', 1.4);
      ring(120, 'rgba(255,220,160,0.34)', 3.4); ring(118, 'rgba(46,16,2,0.5)', 0.9); ring(122, 'rgba(46,16,2,0.5)', 0.9);
      for (let i = 0; i < 40; i++) {                                              // a row of beads in the band
        const a = (i / 40) * Math.PI * 2, bx = cx + Math.cos(a) * 120, by = cy + Math.sin(a) * 120;
        ctx.fillStyle = 'rgba(46,16,2,0.55)'; ctx.beginPath(); ctx.arc(bx + 0.5, by + 0.7, 1.9, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = 'rgba(240,176,104,1)'; ctx.beginPath(); ctx.arc(bx, by, 1.6, 0, Math.PI * 2); ctx.fill();
      }
      // Rays: sixteen long and sixteen short, each with its shadow.
      const rays = [[16, 0, 46, 112, 11], [16, Math.PI / 16, 46, 84, 8]];
      ctx.save(); ctx.translate(1.8, 2.6);
      rays.forEach(([n, off, r0, r1, half]) => { for (let i = 0; i < n; i++) { const a = off + (i / n) * Math.PI * 2, c = Math.cos(a), s = Math.sin(a);
        poly(ctx, [[cx + c * r0 - s * half, cy + s * r0 + c * half], [cx + c * r1, cy + s * r1], [cx + c * r0 + s * half, cy + s * r0 - c * half]], 'rgba(36,12,0,0.42)'); } });
      ctx.restore();
      rays.forEach(([n, off, r0, r1, half]) => { for (let i = 0; i < n; i++) carvedRay(ctx, cx, cy, off + (i / n) * Math.PI * 2, r0, r1, half, stone, 0.42); });
      // The boss at the centre: a domed disc and a lotus cut into it.
      disc(46.5, 'rgba(36,12,0,0.5)');
      const dome = ctx.createRadialGradient(cx - 12, cy - 16, 2, cx, cy, 44);
      dome.addColorStop(0, '#eeb074'); dome.addColorStop(0.6, '#c07a40'); dome.addColorStop(1, '#93502a');
      disc(44, dome); ring(44, 'rgba(46,16,2,0.7)', 1.2); ring(36, 'rgba(46,16,2,0.45)', 1); ring(34.6, 'rgba(255,224,170,0.4)', 0.9);
      for (let i = 0; i < 12; i++) carvedRay(ctx, cx, cy, (i / 12) * Math.PI * 2, 9, 33, 7, [212, 138, 74], 0.4);
      for (let i = 0; i < 12; i++) carvedRay(ctx, cx, cy, (i / 12 + 1 / 24) * Math.PI * 2, 6, 20, 4.4, [230, 156, 88], 0.4);
      disc(6.4, 'rgba(46,16,2,0.6)'); disc(5.2, '#e8b070');

      // Carved fans in the four corners.
      for (const [qx, qy, a0] of [[0, 0, 0], [w, 0, Math.PI / 2], [w, h, Math.PI], [0, h, Math.PI * 1.5]]) {
        ctx.fillStyle = 'rgba(46,16,2,0.26)'; ctx.beginPath(); ctx.moveTo(qx, qy); ctx.arc(qx, qy, 66, a0, a0 + Math.PI / 2); ctx.closePath(); ctx.fill();
        for (let i = 0; i < 5; i++) carvedRay(ctx, qx, qy, a0 + (i + 0.5) / 5 * Math.PI / 2, 14, 60, 9, stone, 0.4);
        ctx.strokeStyle = 'rgba(46,16,2,0.7)'; ctx.lineWidth = 1.3; ctx.beginPath(); ctx.arc(qx, qy, 66, a0, a0 + Math.PI / 2); ctx.stroke();
        ctx.strokeStyle = 'rgba(255,220,160,0.3)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(qx, qy, 68.4, a0, a0 + Math.PI / 2); ctx.stroke();
      }

      // Offerings: marigold petals strewn where people have walked round the sun.
      const gold = ['#ffb020', '#ff8a14', '#ffd24a', '#f06a10'];
      paintPetals(ctx, R, cx + 96, cy + 108, 30, 38, gold);
      paintPetals(ctx, R, cx - 118, cy - 70, 22, 22, gold);
      paintPetals(ctx, R, 58, h - 70, 26, 30, gold);
      paintPetals(ctx, R, w - 52, 84, 20, 18, gold);
      paintPetals(ctx, R, cx, cy, 150, 34, gold);

      // The light. The wall to the upper left throws the near corner into shade...
      const nx = 0.767, ny = 0.641, ex = w * 0.5, ey = h * 0.27;            // a point on the shadow's edge, and the way it faces
      const shade = ctx.createLinearGradient(ex - nx * 46, ey - ny * 46, ex + nx * 46, ey + ny * 46);
      shade.addColorStop(0, 'rgba(48,14,40,0.4)'); shade.addColorStop(1, 'rgba(48,14,40,0)');
      ctx.fillStyle = shade; ctx.fillRect(0, 0, w, h);
      // ...and its jaali, two arched windows of pierced stone, lets the sun through in
      // small bright patches laid long across the floor.
      const sunlit = document.createElement('canvas');
      sunlit.width = Math.round(w * px); sunlit.height = Math.round(h * px);
      const s = sunlit.getContext('2d');
      s.scale(px, px);
      s.transform(1, 0.2, -0.5, 1.2, 84, 6);
      for (const ox of [0, 100]) {
        s.save();
        s.beginPath();                                       // a pointed arch
        s.moveTo(ox, 168); s.lineTo(ox, 44); s.quadraticCurveTo(ox + 2, 14, ox + 42, 0); s.quadraticCurveTo(ox + 82, 14, ox + 84, 44); s.lineTo(ox + 84, 168); s.closePath();
        s.clip();
        s.fillStyle = 'rgba(255,170,70,0.22)'; s.fillRect(ox, 0, 84, 168);          // the glow of the whole opening
        s.shadowColor = 'rgba(255,210,130,0.9)'; s.shadowBlur = 2.4 * px;
        s.fillStyle = 'rgba(255,214,140,1)';
        for (let j = 0; j < 16; j++) for (let i = 0; i < 8; i++) {
          const x = ox + 6 + i * 12 + (j % 2 ? 6 : 0), y = 4 + j * 11;
          s.beginPath(); s.moveTo(x, y - 4.4); s.lineTo(x + 3.8, y); s.lineTo(x, y + 4.4); s.lineTo(x - 3.8, y); s.closePath(); s.fill();
        }
        s.restore();
      }
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = 0.34; ctx.drawImage(sunlit, 0, 0, w, h); ctx.restore();
      // Full sun on the rest of the court.
      const warm = ctx.createRadialGradient(w * 0.72, h * 0.68, 20, w * 0.72, h * 0.68, 320);
      warm.addColorStop(0, 'rgba(255,200,120,0.2)'); warm.addColorStop(1, 'rgba(255,200,120,0)');
      ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = warm; ctx.fillRect(0, 0, w, h); ctx.restore();
    },
    frame(ctx, fw, fh) {
      paintStepFrame(ctx, fw, fh, 111, [[0, [140, 72, 30]], [0.5, [190, 112, 52]], [1, [228, 156, 88]]], '46,16,2', '255,224,170', (c, W2, H2, R) => {
        // Pots of marigolds on the top step, the way a court is dressed for a festival.
        for (const [x, y] of [[9, 9], [W2 - 9, 9], [9, H2 - 9], [W2 - 9, H2 - 9], [9, H2 / 2], [W2 - 9, H2 / 2], [W2 * 0.3, H2 - 9], [W2 * 0.7, H2 - 9], [W2 * 0.3, 9], [W2 * 0.7, 9]]) paintPot(c, R, x, y, 7);
      });
    } },

  { // Level 2 - Jal-Kund, the flooded steps. The landing itself is under water: the stairs
    // go on down beneath your feet, each one darker, and something long moves in the deep.
    name: 'flood', ember: 0xcffff4, emberAlpha: 0.1, edge: 0xcdb48a,
    lights: [[92, 112], [250, 96], [72, 286], [270, 300], [104, 452], [240, 446]].map(([x, y], i) => [x, y, 30, 0xffb060, 0.5, 520 + i * 90]),   // the floating lamps
    paint(ctx, w, h) {
      const cx = w / 2, R = seeded(202), steps = [0, 22, 42, 60, 76, 90];     // the dry rim, four drowned steps, the pool
      paintStone(ctx, w, h, 201, [[0, [62, 52, 40]], [0.5, [112, 94, 68]], [1, [156, 132, 96]]], 58);
      paintGrit(ctx, w, h, 203, 3600, 'rgba(235,225,190,0.18)', 'rgba(20,14,6,0.25)');
      // The blocks each step is built of.
      ctx.strokeStyle = 'rgba(20,14,6,0.45)'; ctx.lineWidth = 1;
      for (let i = 0; i < steps.length - 1; i++) {
        const a = steps[i], b = steps[i + 1];
        for (let x = b + R() * 24; x < w - b; x += 26 + R() * 18) { ctx.beginPath(); ctx.moveTo(x, a); ctx.lineTo(x, b); ctx.moveTo(x + 11, h - b); ctx.lineTo(x + 11, h - a); ctx.stroke(); }
        for (let y = b + R() * 24; y < h - b; y += 26 + R() * 18) { ctx.beginPath(); ctx.moveTo(a, y); ctx.lineTo(b, y); ctx.moveTo(w - b, y + 11); ctx.lineTo(w - a, y + 11); ctx.stroke(); }
      }
      // Moss where the rim stays wet.
      for (let i = 0; i < 70; i++) {
        const side = Math.floor(R() * 4), t = R(), d = 8 + R() * 13, x = side < 2 ? t * w : (side === 2 ? d : w - d), y = side < 2 ? (side === 0 ? d : h - d) : t * h;
        ctx.fillStyle = `rgba(${60 + R() * 30},${104 + R() * 30},54,${0.12 + R() * 0.2})`;
        ctx.beginPath(); ctx.ellipse(x, y, 3 + R() * 8, 2 + R() * 5, R() * 3, 0, Math.PI * 2); ctx.fill();
      }
      // Water, deeper with every step down.
      for (let i = 1; i < steps.length; i++) {
        const o = steps[i];
        ctx.fillStyle = i === 1 ? 'rgba(26,140,118,0.44)' : 'rgba(6,62,62,0.3)';
        ctx.fillRect(o, o, w - o * 2, h - o * 2);
        // The edge of the step above: a pale lip, and the shade under it.
        const sh = ctx.createLinearGradient(0, o, 0, o + 7); sh.addColorStop(0, 'rgba(0,26,32,0.5)'); sh.addColorStop(1, 'rgba(0,26,32,0)');
        ctx.fillStyle = sh; ctx.fillRect(o, o, w - o * 2, 7);
        const sv = ctx.createLinearGradient(o, 0, o + 7, 0); sv.addColorStop(0, 'rgba(0,26,32,0.45)'); sv.addColorStop(1, 'rgba(0,26,32,0)');
        ctx.fillStyle = sv; ctx.fillRect(o, o, 7, h - o * 2);
        ctx.strokeStyle = `rgba(214,250,238,${0.34 - i * 0.045})`; ctx.lineWidth = 1.3; ctx.strokeRect(o + 0.5, o + 0.5, w - o * 2 - 1, h - o * 2 - 1);
      }
      // Something long, moving in the deep of the pool.
      const deep = steps[steps.length - 1];
      ctx.save(); ctx.beginPath(); ctx.rect(deep, deep, w - deep * 2, h - deep * 2); ctx.clip();
      for (let i = 0; i <= 150; i++) {
        const t = i / 150, x = cx + 34 * Math.sin(t * 10.5 + 0.7), y = deep + 24 + t * (h - deep * 2 - 48), r = 2.5 + 9.5 * Math.pow(Math.sin(Math.min(1, t * 1.12) * Math.PI), 0.6) * (1 - t * 0.45);
        ctx.fillStyle = 'rgba(0,20,26,0.085)'; ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
      // Fish in the shallows.
      for (const [x, y, a, col] of [[62, 232, 0.5, '255,140,60'], [276, 404, 2.4, '255,236,220'], [68, 420, 4.0, '255,120,40'], [284, 118, 1.2, '255,170,70']]) {
        ctx.save(); ctx.translate(x, y); ctx.rotate(a);
        ctx.fillStyle = 'rgba(0,22,26,0.3)'; ctx.beginPath(); ctx.ellipse(1.5, 3, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = `rgba(${col},0.72)`; ctx.beginPath(); ctx.ellipse(0, 0, 8, 3, 0, 0, Math.PI * 2); ctx.fill();
        poly(ctx, [[-7, 0], [-12.5, -3.6], [-11, 0], [-12.5, 3.6]], `rgba(${col},0.6)`);
        ctx.fillStyle = 'rgba(255,255,255,0.55)'; ctx.beginPath(); ctx.ellipse(1.5, -0.6, 3, 1.2, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }
      // Light on the water: the bright net of ripples, strongest in the shallows.
      const n = makeNoise(207);
      paintField(ctx, w, h, (x, y, out) => {
        const d = Math.min(x, y, w - x, h - y);
        const v = fbm(n, (x + 7 * Math.sin(y / 15)) / 22, (y + 7 * Math.sin(x / 19)) / 22, 3), ridge = 1 - Math.abs(2 * v - 1);
        out[0] = 196; out[1] = 255; out[2] = 236;
        out[3] = d < steps[1] ? 0 : smooth(0.82, 0.975, ridge) * (d < 62 ? 0.3 : 0.17);
      }, 'screen');
      // The line where the water meets the dry rim.
      const lip = steps[1];
      for (let p = 0, per = 2 * (w - lip * 2) + 2 * (h - lip * 2); p < per; p += 4 + R() * 7) {
        const top = w - lip * 2, side = h - lip * 2, len = 2 + R() * 5, j = (R() - 0.5) * 2.4;
        let x0, y0, x1, y1;
        if (p < top) { x0 = lip + p; y0 = lip + j; x1 = x0 + len; y1 = y0; }
        else if (p < top + side) { x0 = w - lip + j; y0 = lip + p - top; x1 = x0; y1 = y0 + len; }
        else if (p < top * 2 + side) { x0 = lip + p - top - side; y0 = h - lip + j; x1 = x0 + len; y1 = y0; }
        else { x0 = lip + j; y0 = lip + p - top * 2 - side; x1 = x0; y1 = y0 + len; }
        ctx.strokeStyle = `rgba(240,255,250,${0.25 + R() * 0.35})`; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
      }
      // Lotus, and the lamps people have set afloat.
      [[44, 62, 15, 0.4, 1], [298, 74, 12, 2.0, 0], [50, 176, 11, 4.0, 0], [296, 214, 16, 1.0, 1], [38, 326, 13, 5.0, 0], [302, 372, 11, 3.0, 1],
       [58, 474, 16, 0.9, 1], [288, 498, 13, 2.4, 0], [146, 40, 10, 1.2, 0], [212, 528, 12, 4.2, 1], [246, 46, 9, 3.3, 0], [98, 522, 9, 0.2, 0]]
        .forEach(([x, y, r, rot, blossom]) => paintLotusPad(ctx, x, y, r, rot, blossom));
      for (const [x, y] of [[92, 112], [250, 96], [72, 286], [270, 300], [104, 452], [240, 446]]) {
        ctx.strokeStyle = 'rgba(214,250,238,0.2)'; ctx.lineWidth = 0.9;
        for (const rr of [9, 14]) { ctx.beginPath(); ctx.ellipse(x, y, rr, rr * 0.8, 0, 0, Math.PI * 2); ctx.stroke(); }
        paintDiya(ctx, x, y, 0.85);
      }
      // A soft sheen where the sky shows in the water.
      const sheen = ctx.createLinearGradient(0, 0, w, h * 0.6);
      sheen.addColorStop(0.2, 'rgba(210,255,245,0)'); sheen.addColorStop(0.5, 'rgba(210,255,245,0.1)'); sheen.addColorStop(0.8, 'rgba(210,255,245,0)');
      ctx.save(); ctx.globalCompositeOperation = 'screen'; ctx.fillStyle = sheen; ctx.fillRect(0, 0, w, h); ctx.restore();
    },
    frame(ctx, fw, fh) {
      paintStepFrame(ctx, fw, fh, 211, [[0, [78, 64, 48]], [0.5, [124, 104, 76]], [1, [164, 140, 102]]], '18,14,8', '236,228,200', (c, W2, H2, R) => {
        for (let i = 0; i < 90; i++) {                       // moss creeping up the lower steps
          const side = Math.floor(R() * 4), t = R(), d = 14 + R() * 15, x = side < 2 ? t * W2 : (side === 2 ? d : W2 - d), y = side < 2 ? (side === 0 ? d : H2 - d) : t * H2;
          c.fillStyle = `rgba(${52 + R() * 30},${100 + R() * 34},50,${0.14 + R() * 0.22})`;
          c.beginPath(); c.ellipse(x, y, 3 + R() * 9, 2 + R() * 5, R() * 3, 0, Math.PI * 2); c.fill();
        }
        for (const [x, y] of [[15, 15], [W2 - 15, 15], [15, H2 - 15], [W2 - 15, H2 - 15], [15, H2 * 0.33], [15, H2 * 0.67], [W2 - 15, H2 * 0.33], [W2 - 15, H2 * 0.67], [W2 / 2, 15], [W2 / 2, H2 - 15]]) paintDiya(c, x, y, 0.8);
      });
    } },

  { // Level 3 - Nidhi-Kosh, the gold vault. Vritra is the serpent who hoarded the world's
    // waters: his coil is cast into the floor, his hoard lies heaped in the corners, and
    // under the grate at the centre the stolen water still glows.
    name: 'hoard', ember: 0xffd23c, emberAlpha: 0.2, edge: 0xffc93c,
    lights: [[170, 282, 104, 0x50e6d2, 0.3, 1900], [0, 0, 100, 0xffb040, 0.22, 2300], [340, 0, 100, 0xffb040, 0.22, 2700], [0, 564, 100, 0xffb040, 0.22, 2500], [340, 564, 100, 0xffb040, 0.22, 2100],
             [144, 23, 12, 0xff4030, 0.7, 640], [144, 37, 12, 0xff4030, 0.7, 640]],   // the water under the grate, the hoard, the serpent's eyes
    paint(ctx, w, h) {
      const cx = w / 2, cy = h / 2, R = seeded(303);
      paintStone(ctx, w, h, 301, [[0, [50, 23, 10]], [0.5, [88, 44, 18]], [1, [124, 70, 32]]], 80);
      paintGrit(ctx, w, h, 305, 3600, 'rgba(255,210,140,0.16)', 'rgba(16,5,0,0.3)');
      // Lozenge slabs, the joints run with gold.
      const d = 46;
      for (let j = -1; j * d < h + d; j++) for (let i = -1; i * d < w + d; i++) {
        if ((i + j) % 2) continue;
        poly(ctx, [[i * d, j * d - d], [i * d + d, j * d], [i * d, j * d + d], [i * d - d, j * d]], `rgba(255,190,110,${0.03 + R() * 0.05})`);
      }
      ctx.save();
      ctx.shadowColor = 'rgba(255,150,40,0.9)'; ctx.shadowBlur = 5;
      ctx.strokeStyle = 'rgba(255,196,96,0.36)'; ctx.lineWidth = 1.1;
      for (let k = -h; k < w + h; k += d) {
        ctx.beginPath(); ctx.moveTo(k, 0); ctx.lineTo(k + h, h); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(k + h, 0); ctx.lineTo(k, h); ctx.stroke();
      }
      ctx.restore();

      // The serpent, cast in bronze and laid into the floor round the whole vault.
      const pts = roundRectPoints(w, h, 30, 48, 2), N = pts.length, bronze = [96, 84, 36];
      const body = pts.map((p, i) => {
        const t = i / N, wave = 6.5 * Math.sin(i / 11), sink = 20 * smooth(0.74, 1, t);
        return { x: p.x + p.nx * (wave - sink), y: p.y + p.ny * (wave - sink), nx: p.nx, ny: p.ny,
                 half: t > 0.965 ? 0 : 11.5 * (1 - 0.86 * smooth(0.62, 0.965, t)) };
      }).filter(p => p.half > 0);
      const stroke = (dx, dy, grow, colour) => {
        ctx.strokeStyle = colour; ctx.lineCap = 'round';
        for (let i = 0; i < body.length - 1; i++) { ctx.lineWidth = Math.max(0.6, body[i].half * 2 + grow); ctx.beginPath(); ctx.moveTo(body[i].x + dx, body[i].y + dy); ctx.lineTo(body[i + 1].x + dx, body[i + 1].y + dy); ctx.stroke(); }
      };
      stroke(2.2, 3, 2, 'rgba(10,3,0,0.45)');                                  // its shadow
      stroke(0, 0, 2.6, '#2a1606');                                            // a dark outline
      stroke(0, 0, 0, 'rgb(86,74,30)');                                        // the body
      // One flank catches the light.
      ctx.strokeStyle = 'rgba(214,180,84,0.5)'; ctx.lineWidth = 1.4;
      ctx.beginPath(); body.forEach((p, i) => { const k = p.half * 0.62 * (p.nx * SUN[0] + p.ny * SUN[1] >= 0 ? 1 : -1); const x = p.x + p.nx * k, y = p.y + p.ny * k; i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }); ctx.stroke();
      // Scales, row on row.
      ctx.lineWidth = 0.9;
      for (let i = 4; i < body.length - 2; i += 3) {
        const p = body[i], q = body[i + 1], a = Math.atan2(q.y - p.y, q.x - p.x);
        if (p.half < 2.5) continue;
        ctx.strokeStyle = `rgba(236,196,96,${0.3 + 0.25 * ((i / 3) % 2)})`;
        for (const off of (i / 3) % 2 ? [-0.5, 0.5] : [-1, 0, 1]) {
          const sx = p.x - Math.sin(a) * off * p.half * 0.62, sy = p.y + Math.cos(a) * off * p.half * 0.62;
          ctx.beginPath(); ctx.arc(sx, sy, p.half * 0.34, a - Math.PI / 2, a + Math.PI / 2); ctx.stroke();
        }
      }
      // The head, at the top of the vault, where its master stands.
      const hd = body[0];
      ctx.save(); ctx.translate(hd.x - 4, hd.y); ctx.scale(-1, 1);            // it faces left, back along the coil
      const head = [[-6, -10], [10, -13.5], [26, -9], [36, -2.5], [38, 0], [36, 2.5], [26, 9], [10, 13.5], [-6, 10]];
      ctx.save(); ctx.translate(-2.2, 3); poly(ctx, head, 'rgba(10,3,0,0.45)'); ctx.restore();
      poly(ctx, head, 'rgb(96,84,36)', '#2a1606', 1.6);
      poly(ctx, [[2, -8], [12, -10.5], [24, -7], [32, -2], [24, -2.5], [10, -4]], 'rgba(214,180,84,0.4)');
      ctx.strokeStyle = 'rgba(236,196,96,0.55)'; ctx.lineWidth = 0.9;
      for (const [x, y] of [[4, -4], [4, 4], [11, 0], [17, -5], [17, 5], [23, 0]]) { ctx.beginPath(); ctx.arc(x, y, 3.4, -Math.PI / 2, Math.PI / 2); ctx.stroke(); }
      ctx.strokeStyle = '#c4331f'; ctx.lineWidth = 1.1; ctx.beginPath(); ctx.moveTo(38, 0); ctx.lineTo(46, 0); ctx.lineTo(50, -3); ctx.moveTo(46, 0); ctx.lineTo(50, 3); ctx.stroke();
      ctx.restore();
      for (const ey of [-7, 7]) {                                              // eyes of ruby
        paintGlow(ctx, hd.x - 26, hd.y + ey, 9, '255,70,50', 0.8);
        ctx.fillStyle = '#ff5038'; ctx.beginPath(); ctx.arc(hd.x - 26, hd.y + ey, 2.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#fff0e0'; ctx.beginPath(); ctx.arc(hd.x - 26.7, hd.y + ey - 0.7, 0.8, 0, Math.PI * 2); ctx.fill();
      }

      // The grate. Under it, the water he stole.
      paintGlow(ctx, cx, cy, 128, '70,230,210', 0.34);
      const pool = ctx.createRadialGradient(cx - 8, cy - 10, 2, cx, cy, 56);
      pool.addColorStop(0, '#7ff0e0'); pool.addColorStop(0.5, '#1f9a92'); pool.addColorStop(1, '#0a3c44');
      ctx.fillStyle = pool; ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.fill();
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, 55, 0, Math.PI * 2); ctx.clip();
      const cn = makeNoise(309);
      paintField(ctx, w, h, (x, y, out) => {
        const inside = Math.hypot(x - cx, y - cy) < 56, v = inside ? fbm(cn, x / 15, y / 15, 3) : 0.5;
        out[0] = 220; out[1] = 255; out[2] = 246; out[3] = inside ? smooth(0.78, 0.97, 1 - Math.abs(2 * v - 1)) * 0.6 : 0;
      }, 'screen');
      for (let k = -4; k <= 4; k++) {                                          // bars, lit along one edge
        for (const upright of [true, false]) {
          const o = k * 13;
          ctx.fillStyle = '#1e1006'; upright ? ctx.fillRect(cx + o - 2.2, cy - 56, 4.4, 112) : ctx.fillRect(cx - 56, cy + o - 2.2, 112, 4.4);
          ctx.fillStyle = 'rgba(255,200,110,0.5)'; upright ? ctx.fillRect(cx + o - 2.2, cy - 56, 1, 112) : ctx.fillRect(cx - 56, cy + o - 2.2, 112, 1);
        }
      }
      ctx.restore();
      for (let i = 0; i < 72; i++) {                                           // the rim, a ring of gold turned to the light
        const a0 = (i / 72) * Math.PI * 2, a1 = ((i + 1) / 72) * Math.PI * 2 + 0.01, am = (a0 + a1) / 2;
        ctx.fillStyle = tone([214, 160, 58], Math.cos(am), Math.sin(am), 0.5);
        ctx.beginPath(); ctx.arc(cx, cy, 66, a0, a1); ctx.arc(cx, cy, 54, a1, a0, true); ctx.closePath(); ctx.fill();
      }
      ctx.strokeStyle = '#2a1606'; ctx.lineWidth = 1.3;
      for (const r of [54, 66]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.stroke(); }
      for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2, x = cx + Math.cos(a) * 60, y = cy + Math.sin(a) * 60;
        ctx.fillStyle = '#6a4208'; ctx.beginPath(); ctx.arc(x + 0.5, y + 0.7, 2.3, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#ffe08a'; ctx.beginPath(); ctx.arc(x, y, 1.9, 0, Math.PI * 2); ctx.fill();
      }
      ctx.strokeStyle = 'rgba(255,196,96,0.5)'; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(cx, cy, 74, 0, Math.PI * 2); ctx.stroke();

      // The hoard, heaped in the corners where no one fights.
      const coinCols = ['#ffd95a', '#f2b632', '#d89a1c', '#ffe890', '#e8a824'], gems = ['#e23a4a', '#22b673', '#3a8af0', '#b04ae0'];
      for (const [qx, qy, a0] of [[0, 0, 0], [w, 0, Math.PI / 2], [w, h, Math.PI], [0, h, Math.PI * 1.5]]) {
        paintGlow(ctx, qx, qy, 120, '255,190,80', 0.3);
        const coins = [];
        for (let i = 0; i < 190; i++) { const a = a0 + R() * Math.PI / 2, dist = Math.pow(R(), 1.5) * 84; coins.push([qx + Math.cos(a) * dist, qy + Math.sin(a) * dist, dist]); }
        coins.sort((p, q) => q[2] - p[2]);                                     // the pile rises toward the corner
        coins.forEach(([x, y]) => {
          const ry = 3.5 * (0.5 + R() * 0.5), rot = R() * Math.PI;
          ctx.fillStyle = 'rgba(20,8,0,0.4)'; ctx.beginPath(); ctx.ellipse(x + 1, y + 1.4, 3.7, ry, rot, 0, Math.PI * 2); ctx.fill();
          ctx.fillStyle = coinCols[Math.floor(R() * coinCols.length)]; ctx.beginPath(); ctx.ellipse(x, y, 3.5, ry, rot, 0, Math.PI * 2); ctx.fill();
          ctx.strokeStyle = 'rgba(110,62,6,0.75)'; ctx.lineWidth = 0.6; ctx.stroke();
          ctx.strokeStyle = 'rgba(255,250,210,0.75)'; ctx.lineWidth = 0.7; ctx.beginPath(); ctx.ellipse(x, y, 2.3, ry * 0.62, rot, Math.PI * 1.1, Math.PI * 1.7); ctx.stroke();
        });
        for (let i = 0; i < 8; i++) {                                          // cut stones among the gold
          const a = a0 + R() * Math.PI / 2, dist = 10 + R() * 58, x = qx + Math.cos(a) * dist, y = qy + Math.sin(a) * dist, col = gems[Math.floor(R() * gems.length)], gr = 2.8 + R() * 1.6;
          const hex = k => [x + Math.cos(k * Math.PI / 3) * gr, y + Math.sin(k * Math.PI / 3) * gr];
          poly(ctx, [0, 1, 2, 3, 4, 5].map(hex), col, 'rgba(20,6,0,0.7)', 0.6);
          poly(ctx, [hex(3), hex(4), [x, y]], 'rgba(255,255,255,0.55)');
        }
        for (let i = 0; i < 9; i++) {                                          // and the glint off it all
          const a = a0 + R() * Math.PI / 2, dist = R() * 70, x = qx + Math.cos(a) * dist, y = qy + Math.sin(a) * dist, len = 3 + R() * 3.5;
          ctx.strokeStyle = 'rgba(255,252,230,0.9)'; ctx.lineWidth = 0.9;
          ctx.beginPath(); ctx.moveTo(x - len, y); ctx.lineTo(x + len, y); ctx.moveTo(x, y - len); ctx.lineTo(x, y + len); ctx.stroke();
        }
      }
      for (let i = 0; i < 46; i++) {                                           // strays that rolled out across the floor
        const x = 16 + R() * (w - 32), y = 16 + R() * (h - 32);
        if (Math.min(x, y, w - x, h - y) > 44) continue;                       // only along the walls: in the open they look like pickups
        ctx.fillStyle = 'rgba(20,8,0,0.4)'; ctx.beginPath(); ctx.ellipse(x + 1, y + 1.3, 3.2, 2.6, 0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = coinCols[Math.floor(R() * coinCols.length)]; ctx.beginPath(); ctx.ellipse(x, y, 3, 2.4, R() * 3, 0, Math.PI * 2); ctx.fill();
      }
    },
    frame(ctx, fw, fh) {
      paintStepFrame(ctx, fw, fh, 311, [[0, [56, 26, 11]], [0.5, [96, 50, 21]], [1, [134, 78, 36]]], '14,4,0', '255,206,130', (c, W2, H2, R) => {
        const cols = ['#ffd95a', '#f2b632', '#d89a1c', '#ffe890'];
        for (let i = 0; i < 64; i++) {                       // gold that has spilled up the steps
          const side = Math.floor(R() * 4), t = R(), dd = 4 + R() * 24, x = side < 2 ? t * W2 : (side === 2 ? dd : W2 - dd), y = side < 2 ? (side === 0 ? dd : H2 - dd) : t * H2;
          c.fillStyle = 'rgba(14,4,0,0.45)'; c.beginPath(); c.ellipse(x + 0.8, y + 1.1, 2.8, 2.2, 0, 0, Math.PI * 2); c.fill();
          c.fillStyle = cols[Math.floor(R() * cols.length)]; c.beginPath(); c.ellipse(x, y, 2.6, 2, R() * 3, 0, Math.PI * 2); c.fill();
        }
        c.strokeStyle = 'rgba(255,200,96,0.7)'; c.lineWidth = 1.2; c.strokeRect(MARGIN - 1.5, MARGIN - 1.5, W2 - MARGIN * 2 + 3, H2 - MARGIN * 2 + 3);
        for (const [x, y] of [[15, 15], [W2 - 15, 15], [15, H2 - 15], [W2 - 15, H2 - 15], [15, H2 / 2], [W2 - 15, H2 / 2]]) paintGlow(c, x, y, 46, '255,170,60', 0.5);
      });
    } }
];

// Which set of floors the game paints. `carved` is the default since 2026-10-06, chosen
// by the founder; `classic` is the line-drawn set of 2026-10-02 it replaced. Add
// ?floors=classic to the address to see the old one without changing anything.
// ---------- Floor set "painted" (requirements 2.43) ----------
// The founder's own pictures, made to go with the cast: each is a level's floor seen from
// straight above, with the band of steps round it, in one picture (assets/floors/). `inner`
// is where the floor lies inside its picture, as parts of the picture's width and height;
// that part is laid on the arena and the whole picture round it, so floor and steps are
// one piece. It is chosen a little narrower than the floor in the picture where that
// keeps what is round from being stretched by more than a twentieth. `lights` are where
// the picture's own lamps and glows are, in parts of the picture; the game flickers them.
// If a picture is missing the level is painted as the carved set paints it.
const FLOOR_PICS = {};                 // the pictures themselves, by level, once loaded (see create)
const paintedFloor = (level, carved, o) => {
  const [x0, y0, x1, y1] = o.inner, pic = () => FLOOR_PICS[level];
  const at = (fx, fy) => [(fx - x0) / (x1 - x0) * 340, (fy - y0) / (y1 - y0) * 564];       // a place in the picture, as a place on the floor
  return Object.assign({}, o, {
    picture: level,
    lights: o.glows.map(([fx, fy, ...rest]) => [...at(fx, fy), ...rest]),
    paint(ctx, w, h, px) {
      const im = pic();
      if (!im) return carved.paint(ctx, w, h, px);
      ctx.drawImage(im, x0 * im.width, y0 * im.height, (x1 - x0) * im.width, (y1 - y0) * im.height, 0, 0, w, h);
    },
    frame(ctx, fw, fh, px) {
      const im = pic();
      if (!im) return carved.frame(ctx, fw, fh, px);
      const kx = (fw - 2 * MARGIN) / ((x1 - x0) * im.width), ky = (fh - 2 * MARGIN) / ((y1 - y0) * im.height);
      ctx.fillStyle = '#1a0a04'; ctx.fillRect(0, 0, fw, fh);
      ctx.drawImage(im, MARGIN - x0 * im.width * kx, MARGIN - y0 * im.height * ky, im.width * kx, im.height * ky);
    }
  });
};
const FLOORS_PAINTED = [
  paintedFloor(1, FLOORS_CARVED[0], { name: 'court', ember: 0xffc070, emberAlpha: 0.12, edge: 0xd8a488, inner: [0.078, 0.055, 0.922, 0.945],
    glows: [[0.5, 0.5, 150, 0xffc880, 0.06, 4100]] }),                                              // the carved sun, breathing as cloud passes
  paintedFloor(2, FLOORS_CARVED[1], { name: 'flood', ember: 0xcffff4, emberAlpha: 0.1, edge: 0xb9a078, inner: [0.1225, 0.09, 0.8775, 0.885],
    glows: [[0.303, 0.1875], [0.707, 0.1875], [0.24, 0.47], [0.758, 0.47], [0.307, 0.747], [0.695, 0.747]].map(([x, y], i) => [x, y, 30, 0xffb060, 0.45, 520 + i * 90]) }),   // the floating lamps
  paintedFloor(3, FLOORS_CARVED[2], { name: 'hoard', ember: 0xffd23c, emberAlpha: 0.18, edge: 0xd8a84a, inner: [0.1225, 0.085, 0.8775, 0.895],
    glows: [[0.498, 0.477, 96, 0x50e6d2, 0.26, 1900], [0.15, 0.11, 90, 0xffb040, 0.2, 2300], [0.85, 0.11, 90, 0xffb040, 0.2, 2700], [0.15, 0.89, 90, 0xffb040, 0.2, 2500], [0.85, 0.89, 90, 0xffb040, 0.2, 2100]] })   // the water under the grate, and the hoard
];
const FLOOR_SETS = { classic: FLOORS_CLASSIC, carved: FLOORS_CARVED, painted: FLOORS_PAINTED };
const FLOOR_SET = 'painted';
const FLOORS = FLOOR_SETS[new URLSearchParams(location.search).get('floors')] || FLOOR_SETS[FLOOR_SET];
