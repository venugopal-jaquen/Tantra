/*
 * ui.js: the look. Layers, colours, the material of the screens, type.
 *
 * Declares  Z (which layer is over which), FORGE (the palette), MAT (the material of every
 *           panel: stone, cut, bronze, light, shade) and drawSlab (how a panel, a card
 *           and a button are drawn from it), BTN (button fills), FONT, DEVANAGARI,
 *           styleText, dim; the colours of effects (TEJAS_FX, WEAPON_FX, HEX_FX, SLAM_FX,
 *           VRITRA_FX, SHIELD_FX, STEEL_FX, GILT_FX, GILT_GLOW, DEATH_FX) and FLAT; and
 *           the title screen's drawn shaft (WELL, WELL_STOPS, wellColour).
 * Needs     nothing but the engine's Graphics, when something is drawn.
 * State     none.
 *
 * The page's own surfaces (loading cards, dialogs) take the same material from
 * styles/game.css; MAT says which CSS name matches which colour.
 */

// What each form is drawn in (requirements 2.40): the colour of a face in the light, and of
// the face beside it in shade. Matte and a little earthy, like the cast's cloth and bronze.
const TEJAS_FX = {
  none:        [0xffdc64, 0xe8501a],     // flame: bright enough to read on level 1's sandstone, rust in its shade
  venom:       [0xcfe650, 0x5a9433],     // acid, not the leaf green of the lotus on level 2
  vampiric:    [0xff8273, 0x9c1f30],     // blood, lit: level 3's floor is dark brown
  chain:       [0xbaf4f2, 0x2a9db5],     // the hero's own teal, struck bright
  executioner: [0xf7d264, 0xa66f1c]      // gold, bronze in its shade
};
// What each weapon's ordinary strike is drawn in. The plain weapon is the hero's own teal.
const WEAPON_FX = Object.assign({}, TEJAS_FX, { none: [0xeafcf4, 0x2fa7a0] });
const HEX_FX = [0xf0b8ff, 0x8a3fc0];       // the Hexer's bolt: violet, which nothing of the hero's uses
const SLAM_FX = [0xff8a5a, 0xb5301a];      // where a boss's slam lands: the red of its warning
const VRITRA_FX = [0xe0aa3e, 0x3a3558];    // what Vritra bursts into when he falls: his gold and his indigo
// What stands round a figure (requirements 2.45).
const SHIELD_FX = [0xd6f2ff, 0x4f9fd6];    // the dome over a shielded boss: ice, lit and in shade
const STEEL_FX = [0xc3cad8, 0x565d70];     // the plates round a boss who resists
const GILT_FX = [0xffe27a, 0xc78a1c];      // the gold of an elite, of what anchors a shield, and of a boss's own ring
const GILT_GLOW = 0xffb820;                // the light laid over such a figure: deeper, so it gilds and does not bleach
// What each figure comes apart in when it falls: two of its own colours.
const DEATH_FX = {
  asura: [0xe07a3a, 0x3d3a8c], rakshasa: [0xb48ad8, 0x4a3a66], mahish: [0xe08a3c, 0x4a4450], raktabija: [0xe2584a, 0x7a1f2c],
  bakasura: [0xd89a4a, 0x7a2430], nidhiraksha: [0xf0c050, 0x2f8f8f], vritra: VRITRA_FX
};
const FLAT = 0.42;                         // how flat a ring lying on the floor round a standing figure is drawn
const dim = (c, k) => (Math.floor((c >> 16 & 255) * k) << 16) | (Math.floor((c >> 8 & 255) * k) << 8) | Math.floor((c & 255) * k);

// Render layers. Floor < phase tint < slam telegraphs < everything else (default 0),
// so a telegraph is painted ON the ground, under the characters standing in it, and is
// never dimmed by the phase-tint overlay.
const Z = { floor: -10, tint: -8, telegraph: -5, fx: -4, hud: 55 };

// "Cosmic Forge" palette, measured from concept/loot-chase-visual-forge-v2.html.
// Warm throughout: the direction was rejected twice for reading too dark.
const FORGE = {
  deep:   0x2b1107,  // furthest back
  bg:     0x3d1200,  // arena floor
  panel:  0x4c2410,  // HUD chrome
  ember:  0xff6b1a,  // hot edge
  flame:  0xff8c42,  // forge orange
  gold:   0xffd23c,  // player-facing highlight, currency
  bronze: 0xc8a96e,  // tarnished trim
  cream:  0xfffbef,  // brightest
  cool:   0x4dd0ff   // the single cool accent (Shanti) - pops against everything
};

// The material of the screens (requirements 2.47): the stepwell's own, and the same on
// the page (the CSS names beside each). See glass().
const MAT = {
  stone: 0x57301a,       // --stone: a panel's body, sandstone in shade
  cut: 0x2a1208,         // --cut: what is cut into a panel: cards, slots, tracks
  bronze: 0xb88c4c,      // --edge: the worn edge
  bronzeDark: 0x6e4d22,  // --edge-low: its shaded side
  amber: 0xf0b040,       // an edge that asks to be pressed, in place of bright gold
  light: 0xffe2b0,       // --lit: the warm line along a top edge
  shade: 0x140600        // --foot: the shadow under a foot
};

// How the material is drawn (requirements 2.47). g is a Graphics; x, y the centre.
// opts: kind ('panel' | 'card' | 'button'; by default a panel if its corners are cut
// 14 or more, else a card), fill, alpha, stroke, strokeAlpha, radius, sheen.
// The scene's glass() calls this; so can anything else that has a Graphics.
function drawSlab(g, x, y, w, h, opts = {}) {
  const r = opts.radius === undefined ? 16 : opts.radius, kind = opts.kind || (r >= 14 ? 'panel' : 'card'), heavy = kind === 'panel';
  const c = Math.min(heavy ? 11 : Math.max(3, r * 0.62), w / 4, h / 3.2), l = x - w / 2, t = y - h / 2, e = l + w, b = t + h;
  // The eight corners, `i` inside the outline (outside it, if less than nothing).
  const cut = (i = 0) => { const k = Math.max(0.5, c - i * 0.586);
    return [{ x: l + i + k, y: t + i }, { x: e - i - k, y: t + i }, { x: e - i, y: t + i + k }, { x: e - i, y: b - i - k },
            { x: e - i - k, y: b - i }, { x: l + i + k, y: b - i }, { x: l + i, y: b - i - k }, { x: l + i, y: t + i + k }]; };
  const top = q => [q[7], q[0], q[1], q[2]], foot = q => [q[3], q[4], q[5], q[6]], outer = cut();
  const stroke = opts.stroke === undefined ? MAT.bronze : opts.stroke === FORGE.gold ? MAT.amber : opts.stroke;
  const sa = opts.strokeAlpha === undefined ? 0.85 : opts.strokeAlpha;
  g.fillStyle(opts.fill === undefined ? (kind === 'card' ? MAT.cut : MAT.stone) : opts.fill, opts.alpha === undefined ? 0.62 : opts.alpha);
  g.fillPoints(outer, true);
  if (kind === 'card') {
    g.lineStyle(2, MAT.shade, 0.32); g.strokePoints(top(cut(1.6)));
    g.lineStyle(1, MAT.light, 0.1); g.strokePoints(foot(cut(1.2)));
    g.lineStyle(1.3, stroke, sa); g.strokePoints(outer, true);
    return g;
  }
  const band = t + Math.min(h * 0.42, 120);
  g.fillStyle(MAT.light, (opts.sheen === undefined ? 0.045 : opts.sheen) * 0.7);
  g.fillPoints([outer[7], outer[0], outer[1], outer[2], { x: e, y: band }, { x: l, y: band }], true);
  g.lineStyle(heavy ? 2 : 1.6, MAT.shade, 0.55); g.strokePoints(foot(cut(-1.4)));
  g.lineStyle(heavy ? 2.4 : 1.8, stroke, sa); g.strokePoints(outer, true);
  g.lineStyle(1, MAT.light, heavy ? 0.42 : 0.5); g.strokePoints(top(cut(heavy ? 2 : 1.7)));
  if (heavy) { g.lineStyle(1, MAT.bronzeDark, 0.8); g.strokePoints(cut(5), true); }
  return g;
}

// Typography (requirements 2.18). Yatra One is a display face drawn from the hand-painted
// signage of Mumbai's local trains; Baloo 2 is a rounded text face from Ek Type. Both are
// by designers of Indian scripts and carry Devanagari and Latin in one design, so the
// Devanagari in the UI is set in the same hand as the English beside it.
const FONT = {
  display: '"Yatra One", "Baloo 2", system-ui, sans-serif',
  body:    '"Baloo 2", system-ui, -apple-system, "Segoe UI", sans-serif'
};
const DEVANAGARI = /[\u0900-\u097F]/;

// Every text in the game goes through this (see create()). Bold text of 14px and up is
// a heading and gets the display face; everything else gets the text face. Pass
// `display: true/false` in a style to override, or `fontFamily` to opt out entirely.
function styleText(style, str) {
  const st = Object.assign({}, style);
  if (!st.fontFamily) {
    const px = parseInt(st.fontSize, 10) || 16;
    const display = st.display !== undefined ? st.display : (/bold/.test(st.fontStyle || '') && px >= 14);
    st.fontFamily = display ? FONT.display : FONT.body;
    // Yatra One has a single weight; asking the canvas for bold makes it smear one.
    if (display) st.fontStyle = (st.fontStyle || '').replace('bold', '').trim();
  }
  delete st.display;
  // Phaser sizes a text box from the Latin test string, which clips the marks that sit
  // above and below Devanagari letters. Measure with Devanagari when there is some.
  if (DEVANAGARI.test(String(str))) st.testString = '|M\u00C9qgy\u0915\u093F\u0930\u094D\u0937\u0942\u0901';
  return st;
}
const WELL = { cy: 300, size: 540, k: 0.8, tiers: 17, steps: 5, period: 5200, twist: 0.07, shade: [1.0, 0.8, 0.6, 0.86] };
const WELL_STOPS = [[0, 244, 184, 104], [2.5, 232, 150, 66], [5, 204, 108, 38], [7.5, 158, 68, 20], [9.5, 124, 44, 10], [11.5, 190, 78, 14], [13.5, 255, 166, 52], [16, 255, 240, 176]];
function wellColour(depth, shade) {
  const st = WELL_STOPS;
  let i = 0;
  while (i < st.length - 2 && depth > st[i + 1][0]) i++;
  const a = st[i], b = st[i + 1], t = Math.max(0, Math.min(1, (depth - a[0]) / (b[0] - a[0])));
  const ch = n => Math.min(255, Math.round((a[n] + (b[n] - a[n]) * t) * shade));
  return (ch(1) << 16) | (ch(2) << 8) | ch(3);
}

// Button fills. One saffron primary per screen: the thing you are most likely to press.
const BTN = { primary: 0xc8500e, plain: 0x7a3a0a, quiet: 0x5c2a05, off: 0x2a0f04 };
