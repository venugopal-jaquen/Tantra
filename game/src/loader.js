/*
 * loader.js: the loading screen. Plain DOM, on screen before the engine has arrived.
 *
 * Declares  Loader: setProgress, fail, begin, fontsReady, state ('loading' | 'ready' |
 *           'failed'), and the cards and the well it shows meanwhile.
 * Needs     config.js, names.js (GLOSSARY), rules.js (WELL_FULL), persistence.js
 *           (SAVE_KEY: it reads the raw save itself, to draw the well).
 * State     its own: the bar, the card on show, whether Begin has been pressed.
 *
 * The engine's script tag in the page calls Loader.fail if the engine cannot be fetched.
 */

// The loading screen. Plain DOM rather than Phaser, so it is on screen before the engine
// has even downloaded. It ends on a Begin button for a real reason: browsers refuse to
// play sound until the player has tapped something, and this tap is what unlocks it.
const Loader = (() => {
  const $ = id => document.getElementById(id);
  const root = $('loader');
  let i = 0, timer = null, state = 'loading', onBegin = null;
  try { i = (parseInt(STORE.read('loot-chase-glossary-i'), 10) + 1) || 0; } catch (e) { /* no storage */ }

  $('ldr-title').textContent = GAME_TITLE;
  document.title = GAME_TITLE;

  // The well: how full it is, what fills it, and what a full well means. The shaft has
  // seven steps because seven complete descents fill it, so one step is one descent.
  (() => {
    let water = 0, won = 0;
    try {
      const save = JSON.parse(STORE.read(SAVE_KEY)) || {};
      water = save.water || 0;
      won = save.depthsWon !== undefined ? save.depthsWon : (save.wins > 0 ? 1 : 0);
    } catch (e) { /* no save yet */ }
    const f = Math.max(0, Math.min(1, water / WELL_FULL)), pc = Math.round(f * 100);
    const boss = N.enemies.megaboss, deep = N.deeper[0], steps = Math.round(WELL_FULL / (WATER.boss * 2 + WATER.final));
    const top = 4, stepH = 70 / steps, left = [];
    for (let k = 0; k < steps; k++) { const half = 30 - k * 3.2; left.push([32 - half, top + k * stepH], [32 - half, top + (k + 1) * stepH]); }
    const d = 'M' + left.concat(left.slice().reverse().map(([x, y]) => [64 - x, y])).map(pt => pt.map(v => +v.toFixed(1)).join(' ')).join(' L');
    $('well-shape').setAttribute('d', d + 'Z');
    $('well-wall').setAttribute('d', d);                       // open at the top, as a well is
    const level = top + 70 * (1 - f);
    $('well-water').setAttribute('y', level); $('well-water').setAttribute('height', 74 - level);
    $('well-surface').setAttribute('y1', level); $('well-surface').setAttribute('y2', level);
    $('well-surface').style.display = f > 0 ? '' : 'none';
    $('ldr-well-line').textContent = pc <= 0 ? 'The well is dry' : pc >= 100 ? 'The well is full' : `The well is ${pc}% full`;
    $('ldr-well-sub').textContent = water <= 0 ? `${boss} has drunk it dry`
      : `Depth ${Math.min(steps, won + 1)} of ${steps} \u00B7 ${Math.min(water, WELL_FULL)} of ${WELL_FULL} measures returned`;
    $('ldr-well-legend').textContent = f >= 1 ? `Every drop ${boss} took is back`
      : `Slay ${boss} to win a depth and fill a step. There are ${steps}, each harder than the last`;
    $('ldr-well-after').textContent = f >= 1 ? `You have finished the game. ${deep}, the endless depths, stays open.`
      : `Fill it and the game is won. ${deep}, the endless depths, stays open after.`;
  })();

  // The card about the hero carries the name the player chose, or says where to choose one.
  let nick = '';
  try { nick = String((JSON.parse(STORE.read(SAVE_KEY)) || {}).nickname || '').slice(0, 28); } catch (e) { /* no save yet */ }
  const show = () => {
    const n = GLOSSARY.length, card = $('ldr-card');
    let g = GLOSSARY[((i % n) + n) % n];
    if (g.you) g = Object.assign({}, g, nick ? { dev: '', name: nick, meaning: '' } : { role: g.role + ' Name yourself on the title screen.' });
    $('ldr-kind').textContent = g.kind;
    $('ldr-dev').textContent = g.dev;
    $('ldr-dev').style.display = g.dev ? '' : 'none';
    $('ldr-name').textContent = g.name;
    $('ldr-meaning').textContent = g.meaning ? '\u201C' + g.meaning + '\u201D' : '';
    $('ldr-role').textContent = g.role;
    card.classList.remove('in'); void card.offsetWidth; card.classList.add('in');   // replay the entrance
    try { STORE.write('loot-chase-glossary-i', String(((i % n) + n) % n)); } catch (e) { /* ignore */ }
  };
  const arm = () => { clearInterval(timer); timer = setInterval(() => { i++; show(); }, 7000); };
  const next = () => { i++; show(); arm(); };
  $('ldr-card').addEventListener('click', next);
  $('ldr-card').addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); e.stopPropagation(); next(); } });
  show(); arm();

  // Canvas text cannot swap fonts after it is drawn, so the game must not start until
  // the faces are in. Their @font-face rules are in this page's own stylesheet, so they
  // exist by now. Capped: a font file that fails to arrive must never stop the game
  // from starting (it falls back to system fonts).
  const probes = [['16px "Yatra One"', 'Aa'], ['400 16px "Baloo 2"', 'Aa'], ['700 16px "Baloo 2"', 'Aa'],
                  ['16px "Yatra One"', '\u0915\u093F\u0930\u0923'], ['400 16px "Baloo 2"', '\u0935\u093F\u0930\u093E\u092E']];
  const fonts = Promise.resolve()
    .then(() => document.fonts ? Promise.all(probes.map(([f, t]) => document.fonts.load(f, t))) : null)
    .catch(() => null);
  const wait = ms => new Promise(res => setTimeout(res, ms));
  const fontsReady = Promise.race([fonts, wait(3500)]);
  Promise.race([fonts, wait(1200)]).then(() => root.classList.add('show'));

  const begin = () => {
    if (state !== 'ready') return;
    state = 'done';
    clearInterval(timer);
    root.classList.add('done');
    setTimeout(() => { root.style.display = 'none'; }, 500);
    if (onBegin) onBegin();
  };
  $('ldr-begin').addEventListener('click', begin);
  // Capture phase: Phaser claims Space for Tejas and would swallow it first.
  document.addEventListener('keydown', e => {
    if (state === 'ready' && (e.key === 'Enter' || e.key === ' ') && e.target !== $('ldr-card')) { e.preventDefault(); begin(); }
  }, true);

  return {
    fontsReady,
    get state() { return state; },
    setProgress(p) {
      if (state !== 'loading') return;
      p = Math.max(0, Math.min(1, p));
      $('ldr-fill').style.width = (p * 100).toFixed(1) + '%';
      $('ldr-label').textContent = 'Forging \u00B7 ' + (p < 0.34 ? N.metals.common : p < 0.67 ? N.metals.rare : N.metals.epic);
    },
    ready(cb) {
      if (state !== 'loading') return;
      onBegin = cb; state = 'ready';
      root.classList.add('ready', 'show');
      $('ldr-begin').focus({ preventScroll: true });
    },
    begin,
    fail(msg) {
      if (state === 'done') return;
      state = 'failed';
      root.classList.add('failed', 'show');
      $('ldr-label').textContent = msg;
    }
  };
})();
Loader.setProgress(0.04);
