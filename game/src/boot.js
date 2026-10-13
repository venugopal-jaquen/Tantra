/*
 * boot.js: starts the one game.
 *
 * Declares  config (the engine's configuration); Surround, the page round the game on a
 *           wide screen (backdrop, side panels, the request to turn a phone upright); and,
 *           once the typefaces have arrived or the loader has given up waiting,
 *           window.game. Tools and the console reach the running scene as
 *           game.scene.keys.LootScene.
 * Needs     everything. Last of the scripts.
 */

const config = {
  type: Phaser.AUTO,
  parent: 'game-container',
  backgroundColor: '#2a0800',
  physics: { default: 'arcade', arcade: { gravity: { y: 0 }, debug: false } },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: W * RES,
    height: H * RES
  },
  scene: LootScene
};

// The page round the game (requirements 2.54). The game is a portrait column, 400 by 700,
// fitted to the window; on a screen wider than that - a computer, a tablet held sideways -
// the bands either side show the stepwell: the level's own floor, blurred, or the title
// picture between runs (tools/make-backdrops.py). On a computer the controls stand in the
// left band and the goal in the right, when there is room for them. A phone held sideways
// would show the game as a sliver, so it is asked to turn upright, and the fight waits.
// A true landscape layout is pinned for after the launch (design-document.md, P14).
const Surround = {
  shown: null,
  touch: matchMedia('(pointer: coarse)'),             // a phone or a tablet; a computer's mouse is "fine"
  turned: matchMedia('(orientation: landscape) and (pointer: coarse) and (max-height: 520px)'),

  // 'title', or a level: its floor, as setFloor paints it (the deeper levels repeat the three).
  backdrop(which) {
    const name = which === 'title' ? 'title' : 'level-' + ((which - 1) % 3 + 1);
    if (name === this.shown) return;
    this.shown = name;
    document.getElementById('backdrop').style.backgroundImage = `url("assets/backdrop/${name}.jpg?v=${encodeURIComponent(BUILD_TAG)}")`;
  },

  fill() {
    const key = k => `<kbd>${k}</kbd>`;
    document.getElementById('side-left').innerHTML = `<h2>Controls</h2><dl>
      <dt>${key('W')}${key('A')}${key('S')}${key('D')}</dt><dd>Move (or the arrow keys)</dd>
      <dt>${key('Click')}</dt><dd>Walk there; hold to steer</dd>
      <dt>${key('Space')}</dt><dd>Unleash ${N.supercharge} when it is full</dd>
      <dt>${key('+')}</dt><dd>Take a boon you have earned</dd>
      <dt>${key('Esc')}</dt><dd>Pause</dd></dl>`;
    document.getElementById('side-right').innerHTML = `<h2>The goal</h2>
      <p>${N.enemies.megaboss} has drunk the well dry. Descend to the bottom of ${N.stage.toLowerCase()} ${FINAL_SECTOR} and slay him to bring the water back.</p>
      <p>Every boss you beat returns a little water, even if the run is lost. <b>Seven depths fill the well.</b></p>
      <p>Attacks are your own: all you choose is where to stand.</p>`;
  },

  // Each band holds its panel when it is wide enough, on a computer only (not a touch screen).
  place() {
    const canvas = window.game && game.canvas;
    const r = canvas ? canvas.getBoundingClientRect() : null;
    const band = r ? r.left : 0, wide = Math.min(320, band - 48), fits = !!r && !this.touch.matches && wide >= 200;
    [['side-left', band / 2], ['side-right', r ? r.right + band / 2 : 0]].forEach(([id, mid]) => {
      const el = document.getElementById(id);
      el.hidden = !fits;
      if (fits) { el.style.width = wide + 'px'; el.style.left = Math.round(mid - wide / 2) + 'px'; }
    });
  },

  start() {
    this.backdrop('title');
    this.fill();
    const again = () => requestAnimationFrame(() => this.place());   // after the engine has refitted the canvas
    addEventListener('resize', again);
    this.touch.addEventListener('change', again);
    // Turned sideways mid-fight: the fight pauses behind the request, as it does when the app is left.
    this.turned.addEventListener('change', e => {
      const s = window.game && game.scene.keys.LootScene;
      if (e.matches && s && s.state === 'playing') s.pauseGame();
    });
  }
};
Surround.start();

// Kept on window so the running game can be inspected or driven from the console
// (e.g. game.scene.keys.LootScene) - useful for debugging and automated smoke tests.
// Starts once the typefaces have arrived (or the loader gives up waiting for them).
Loader.setProgress(0.1);
Loader.fontsReady.then(() => {
  window.game = new Phaser.Game(config);
  game.scale.on('resize', () => Surround.place());
  game.events.once('ready', () => Surround.place());
});
