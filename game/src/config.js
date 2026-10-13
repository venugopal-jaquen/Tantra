/*
 * config.js: what the game is called, which build it is, and the shape of its screen.
 *
 * Declares  GAME_TITLE, BUILD (tools/build-itch.py reads both from this file), BUILD_TAG, W, H, RES,
 *           MARGIN, HUD_H, the arena's size (ARENA_SCALES, ARENA_MODE, ARENA_SCALE) and
 *           CAMERA_EASE. QUERY is the page's address switches, read once, here.
 * Needs     nothing. First of the scripts.
 * State     none: every value is fixed when the page loads.
 *
 * The switches an address may carry (each is read where it is used, through QUERY):
 *   ?names=sanskrit|plain|hybrid   which words the game uses      (names.js)
 *   ?arena=fixed|wide              one screen, or the wide arena  (here)
 *   ?floors=classic|carved|painted which floors are laid          (floors.js)
 *   ?icons=drawn                   the game's own drawn icons     (assets.js)
 *   ?wear=head:saffron,legs:indigo dyes tried on the hero         (assets.js)
 *
 * The game is ordered classic scripts that share one scope: a name declared at the top of
 * one file is seen by every file after it. docs/code-architecture.md has the order and
 * who owns what.
 */

// The switches the page's address carries (?arena=fixed&names=plain ...), read once.
// Each is used where it belongs; the list is in this file's header.
const QUERY = new URLSearchParams(location.search);

// One line to rename the game: the browser tab, the loading screen and the hub all read
// this. (Working title, 2026-10-02 - the founder will settle the final name later. The
// root index.html redirect page carries its own copy.)
const GAME_TITLE = 'Anantarya';

const BUILD = '0.19 (2026-10-13)';
// Every file the game fetches carries the build in its address (?v=0.16), so that a phone
// holding files of the last build from its cache cannot mix them with this one's: a new
// build is new addresses throughout (2026-10-12: a phone ran build 0.15's code against
// build 0.16's hero and drew him in pieces). The page names its scripts and stylesheet
// with the same tag, and tools/check-game.mjs holds the two together.
const BUILD_TAG = BUILD.split(' ')[0];

const W = 400, H = 700;

// Backing-store multiplier for high-DPI screens. The game still thinks in 400x700
// world units - RES only raises the number of real pixels those units are drawn
// into, and the main camera zooms back in by the same factor so no coordinate in
// this file has to change. Without it a 400px buffer gets stretched across ~1179
// device pixels on a modern iPhone, which is the softness you can see.
// Clamped to 3: beyond that the buffer cost stops buying visible sharpness.
const RES = Math.min(3, Math.max(2, Math.round(window.devicePixelRatio || 1)));
const MARGIN = 30, HUD_H = 76;

// The arena (requirements 2.33). `wide` is Brotato's: a walled arena larger than the screen,
// with the camera following the hero, so that walking is travelling. It is the default
// since 2026-10-07, chosen by the founder after playing both. `fixed` is the game as it was
// before: the arena is one screen and the camera never moves. Everything in the arena is
// laid out for the fixed one and scaled by this number about the corner under the HUD; add
// ?arena=fixed to the address for the old arena, or ?arena=1.9 to try another size.
const ARENA_SCALES = { fixed: 1, wide: 1.6 };
const ARENA_MODE = 'wide';
const ARENA_SCALE = (() => {
  // Named arenas only. Any size from 1 to 2.2 could be asked for while the wide arena was
  // being tried out; a bigger arena is an easier game, so that is gone (requirements 2.36).
  return ARENA_SCALES[QUERY.get('arena')] || ARENA_SCALES[ARENA_MODE];
})();
const CAMERA_EASE = 0.012;                 // how fast the camera closes on the hero, per millisecond
