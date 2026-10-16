/*
 * persistence.js: what is kept between visits: the save and the settings.
 *
 * Declares  SAVE_KEY, session (the one save; everything reads and writes this object),
 *           SESSION_FIRST and mendSession (a damaged save put right, build 0.28),
 *           newRecords, wellWater, heroName, loadSession, saveSession, resetSession,
 *           SETTINGS_KEY, settings (the one settings object), loadSettings, saveSettings,
 *           and STORE, the only door to the browser's storage.
 * Needs     names.js (heroName), rules.js (the depths and perks an old save is read by).
 * State     session and settings. Both are loaded once, here, as this file runs; the
 *           loading screen (loader.js) reads the raw save for its picture of the well and
 *           writes nothing. They are written only by saveSession and saveSettings, which
 *           the scene calls when something worth keeping happens.
 *
 * Reset (Settings > Reset save) clears the save and leaves the settings. A save from
 * before the depths, or from before the records, is read as loadSession says. If storage
 * is missing or throws, both stay in memory for the visit. tools/check-game.mjs runs all
 * of that against saved fixtures without a browser.
 */

// The save's name in the browser's storage. The loading screen (loader.js) reads the
// raw save under it too, to draw the well before the engine has arrived.
const SAVE_KEY = 'loot-chase-session-v1';

// tribute: the most taken from each kind of boss; bosses: how many of each kind have fallen;
// runs begun, enemies slain, and the most Nidhi banked from one run.
function newRecords() { return { tribute: {}, bosses: {}, runs: 0, slain: 0, bestHaul: 0 }; }

const session = {
  metaGold: 0,
  vitalityLevel: 0,   // +10% max HP per level
  powerLevel: 0,       // +8% weapon dmg per level
  bestSector: 0,
  tejasUnlocked: false, // set the first time the player reaches TEJAS_UNLOCK_SECTOR
  hintsSeen: {},        // live tips already shown once (the first-run tutorial)
  water: 0,             // measures returned to the well, 0..WELL_FULL (kept even if the run is lost)
  wins: 0,              // times the final boss has been slain
  wellFullSeen: false,  // the "well is full" ending has been shown
  gateTaught: false,    // the first Gatekeeper, who arrives vulnerable, has been met
  lessonsOff: false,    // the player skipped the teaching pauses: those five ideas come as corner tips
  slamTaught: false,    // the one slow slam a player is taught on has been given
  // Records (requirements 2.37): kept from the first build that has them, shown nowhere
  // yet. They are what badges will be given for (design-document P13), and a feat that
  // was not counted on the day cannot be counted later.
  records: newRecords(),
  nickname: '',         // what the player calls themselves (requirements 2.32); empty = unnamed
  depthsWon: 0,         // depths of the well won, 0..7 (requirements 2.30)
  depthBest: 0,         // level bosses beaten, at best, on the depth now being attempted: 0..2
  depthPick: 0,         // the depth chosen on the title screen; 0 = the deepest one open
  perks: {},            // perks earned
  perksOn: []           // perks worn, at most perkSlots()
};
// What a new save holds, kept apart: mendSession() puts a damaged field back to it.
const SESSION_FIRST = JSON.parse(JSON.stringify(session));

// Water is no longer counted boss by boss: it is what the depths hold. A depth won holds
// all five measures; the one being attempted holds one for each level boss beaten in it.
function wellWater() {
  return Math.min(WELL_FULL, session.depthsWon * DEPTH_WATER + (session.depthsWon < DEPTH_MAX ? session.depthBest : 0));
}

// What the hero is called: the name the player gave, or the pack's word for an unnamed one.
function heroName() { return session.nickname || N.player; }

// The one door to the browser's storage. Everything kept goes through it, so a test can
// put a store of its own in its place (STORE.area) and a browser without storage fails
// in one spot. It looks localStorage up at each use, as the code it replaces did: where
// storage is missing or forbidden that throws, and each caller already catches it.
const STORE = {
  area: null,
  read(key) { return (this.area || localStorage).getItem(key); },
  write(key, value) { (this.area || localStorage).setItem(key, value); }
};

function loadSession() {
  try {
    const saved = JSON.parse(STORE.read(SAVE_KEY));
    if (saved) {
      Object.assign(session, saved);
      session.records = Object.assign(newRecords(), saved.records);       // a save from before records, or from before one of them
      // A save from before the depths: what it had already done is honoured.
      if (saved.depthsWon === undefined) {
        session.depthsWon = saved.wins > 0 ? 1 : 0;
        session.depthBest = session.depthsWon ? 0 : Math.min(2, saved.water || 0);
        session.depthPick = 0;
        session.perks = {};
        if ((saved.bestSector || 0) >= 2 || saved.wins > 0) { session.perks.guard = true; session.perks.eye = true; }
        if (saved.wins > 0) session.perks.scale = true;
        session.perksOn = Object.keys(session.perks).slice(0, PERK_SLOTS);
        session.water = wellWater();
      }
    }
  } catch (e) { /* localStorage unavailable — session stays in-memory only */ }
  mendSession();
}

// A save read back is put right field by field (build 0.28): a number that is not a number,
// a list that is not a list, a name that is not words. Found by testing damaged saves: a
// depth written as text stopped the title screen, and a name that was not text, the
// profile. Whatever is wrong goes back to its first value; whatever is right is kept.
function mendSession() {
  const first = SESSION_FIRST;
  for (const [k, v] of Object.entries(first)) {
    const s = session[k];
    if (typeof v === 'number') session[k] = Number.isFinite(s) && s >= 0 ? s : v;
    else if (typeof v === 'boolean') session[k] = typeof s === 'boolean' ? s : v;
    else if (typeof v === 'string') session[k] = typeof s === 'string' ? s.slice(0, 64) : v;
    else if (Array.isArray(v)) session[k] = Array.isArray(s) ? s.filter(x => typeof x === 'string') : v.slice();
    else if (v && typeof v === 'object') session[k] = s && typeof s === 'object' && !Array.isArray(s) ? s : JSON.parse(JSON.stringify(v));
  }
  session.depthsWon = Math.min(DEPTH_MAX, Math.floor(session.depthsWon));
  session.depthPick = Math.min(DEPTH_MAX, Math.floor(session.depthPick));
  session.depthBest = Math.min(2, Math.floor(session.depthBest));
  session.records = Object.assign(newRecords(), session.records);
  session.perksOn = session.perksOn.filter(k => PERKS[k]);
}

function saveSession() {
  try { STORE.write(SAVE_KEY, JSON.stringify(session)); } catch (e) { /* ignore */ }
}

loadSession();
if (!session.hintsSeen) session.hintsSeen = {};

// "Reset save" in Settings. Settings themselves survive it - wiping someone's volume
// because they wanted a fresh run would be a surprise.
function resetSession() {
  Object.assign(session, { metaGold: 0, vitalityLevel: 0, powerLevel: 0, bestSector: 0,
                           tejasUnlocked: false, hintsSeen: {}, water: 0, wins: 0, wellFullSeen: false, gateTaught: false,
                           depthsWon: 0, depthBest: 0, depthPick: 0, perks: {}, perksOn: [], nickname: '', lessonsOff: false, slamTaught: false, records: newRecords() });
  saveSession();
}

// Player preferences, stored apart from the save (requirements 2.17).
const SETTINGS_KEY = 'loot-chase-settings-v1';
const settings = {
  music: 0.7, sfx: 0.8,    // 0..1
  shake: true,             // camera shake on hits and slams
  reduceFlash: false,      // accessibility: caps the red hit flash, drops the Tejas flash
  dmgNumbers: true,        // floating -N / +N over the hero
  vibrate: true,           // Android only - iOS Safari exposes no vibration API
  tips: true               // live first-run tips
};
function loadSettings() {
  try { const saved = JSON.parse(STORE.read(SETTINGS_KEY)); if (saved) Object.assign(settings, saved); }
  catch (e) { /* storage unavailable - defaults stand */ }
}
function saveSettings() {
  try { STORE.write(SETTINGS_KEY, JSON.stringify(settings)); } catch (e) { /* ignore */ }
}
loadSettings();
