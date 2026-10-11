/*
 * boot.js: starts the one game.
 *
 * Declares  config (the engine's configuration) and, once the typefaces have arrived or
 *           the loader has given up waiting, window.game. Tools and the console reach
 *           the running scene as game.scene.keys.LootScene.
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

// Kept on window so the running game can be inspected or driven from the console
// (e.g. game.scene.keys.LootScene) - useful for debugging and automated smoke tests.
// Starts once the typefaces have arrived (or the loader gives up waiting for them).
Loader.setProgress(0.1);
Loader.fontsReady.then(() => { window.game = new Phaser.Game(config); });
