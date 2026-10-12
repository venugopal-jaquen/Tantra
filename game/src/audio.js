/*
 * audio.js: sound. The effects' table, and the music player (music is off: MUSIC_ON).
 *
 * Declares  SFX and LOOT_SFX (which file plays for what, how loud, how often), MUSIC and
 *           its settings, Unmute (the iPhone's silent switch) and Music.
 * Needs     persistence.js (settings: the volumes), the engine at the time a sound plays.
 * State     Music and Unmute keep what is playing and what the page's visibility is.
 *           The scene plays effects through its own sfx().
 */

// Sound effects - Kenney CC0 packs, trimmed and converted to WAV (assets/CREDITS.md).
// vol is relative to the player's SFX setting. gap is a minimum spacing in ms, so a
// 3-target volley or a swarm dying on one frame reads as one hit instead of a buzz.
// Chosen by measurement (length, brightness, ring-out), not by ear - the founder's ear
// is the final judge (requirements 2.16).
const SFX = {
  'ui-click':     { vol: 0.45 },
  'ui-confirm':   { vol: 0.55 },
  'ui-error':     { vol: 0.4 },
  'ui-open':      { vol: 0.4 },
  'ui-close':     { vol: 0.4 },
  'ui-page':      { vol: 0.6 },
  'satchel':      { vol: 0.6 },
  'equip':        { vol: 0.45 },
  'hit-blade':    { vol: 0.28, gap: 70 },
  'hit-axe':      { vol: 0.34, gap: 70 },
  'hit-zap':      { vol: 0.35, gap: 60 },
  'hit-blocked':  { vol: 0.3,  gap: 120 },
  'enemy-die':    { vol: 0.4,  gap: 45, files: ['enemy-die-1', 'enemy-die-2'] },
  'hurt':         { vol: 0.55, gap: 90, files: ['hurt-1', 'hurt-2'] },
  'kavach':       { vol: 0.6 },
  'bolt':         { vol: 0.22, gap: 140 },
  'slam-warn':    { vol: 0.75 },
  'slam-land':    { vol: 0.9,  gap: 60 },
  'phase':        { vol: 0.5 },
  'shield-break': { vol: 0.8 },
  'loot-tamra':   { vol: 0.55 },
  'loot-rajat':   { vol: 0.5 },
  'loot-swarna':  { vol: 0.6 },
  'loot-mystery': { vol: 0.45 },
  'coins':        { vol: 0.6 },
  'wave-clear':   { vol: 0.4 },
  'gate-open':    { vol: 0.6 },
  'boss-fall':    { vol: 0.7 },
  'descend':      { vol: 0.6 },
  'toll':         { vol: 0.6 },
  'tejas-ready':  { vol: 0.5 },
  'tejas-go':     { vol: 0.6 },
  'tejas-bell':   { vol: 0.55 },
  'thud':         { vol: 0.45, gap: 80 },
  'boom':         { vol: 0.8 }
};
const LOOT_SFX = { common: 'loot-tamra', rare: 'loot-rajat', epic: 'loot-swarna' };

// Music (requirements 2.16). One track per mood, STREAMED rather than decoded up front:
// three tracks decoded into memory would cost roughly 150 MB on a phone, and would hold
// the loading screen until every one had downloaded. An <audio> element per track feeds
// the Web Audio graph - which is also what makes volume work on iOS (it ignores an
// element's own volume) and what lets the Cosmic Cycle colour the sound:
//
//   <audio> -> seam gain -> track gain (crossfade) -> lowpass -> bus gain -> speakers
//
// A track whose file is missing is simply silent, and a mood can name a fallback.
const MUSIC = {
  hub:    { file: 'assets/music/hub.mp3' },
  combat: { file: 'assets/music/combat.mp3' },
  // If the boss track is ever missing, a boss fight keeps the combat track and pushes
  // it - faster and louder - rather than falling silent.
  boss:   { file: 'assets/music/boss.mp3', fallback: 'combat', push: { rate: 1.05, vol: 1.15 } }
};
// Switched off 2026-10-02: the founder listened and the tracks, and above all the
// transitions between them, did not suit the game. The engine, the files and the
// Settings row all stay; set this to true to hear them again.
const MUSIC_ON = false;
const MUSIC_BASE_VOL = 0.5;
const MUSIC_SEAM = 1.5;   // seconds of fade either side of a track's loop point

// How the Cosmic Cycle colours whatever is playing. Licensed tracks do not come as stems,
// so instead of adding and removing instruments (the Hades approach) each phase reshapes
// the one track: Shanti softens it, Shakti opens it up, Grahan muffles it and sinks its
// pitch, Pralaya pushes it. These were set WITHOUT hearing them - tune by ear.
const MUSIC_PHASE = {
  none:        { vol: 1.0,  cutoff: 22000, rate: 1.0 },    // hub, menus, the sector choice
  drift:       { vol: 0.8,  cutoff: 3200,  rate: 1.0 },    // Shanti: softer, calmer
  surge:       { vol: 1.0,  cutoff: 22000, rate: 1.0 },    // Shakti: full and open
  eclipse:     { vol: 0.9,  cutoff: 800,   rate: 0.97 },   // Grahan: muffled, sunk
  convergence: { vol: 1.25, cutoff: 22000, rate: 1.03 }    // Pralaya: louder, driven
};

// SOUND EFFECTS ON iOS (requirements 2.16). An iPhone with its ring switch on silent mutes
// everything played through Web Audio - which is every sound effect in this game - unless
// the page is also playing an HTML <audio> element. While the background music was on, its
// <audio> elements did that by accident, so switching the music off (2026-10-02) silenced
// the effects on the founder's phone as well. The effects no longer lean on the music:
// the audio session is declared as playback where the browser allows it (Safari 16.4+),
// and a silent loop stands in for the music on older iOS. Started inside the Begin tap,
// like all audio. `force` is for the smoke test, which does not run on iOS.
const Unmute = {
  el: null,
  isIOS: /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1),
  start(sound, force) {
    const ctx = sound && sound.context;
    if (ctx && ctx.state === 'suspended' && ctx.resume) { const p = ctx.resume(); if (p && p.catch) p.catch(() => {}); }
    try { if (navigator.audioSession) navigator.audioSession.type = 'playback'; } catch (e) { /* not supported: the loop below covers it */ }
    if (this.el || !(this.isIOS || force)) return;
    // Half a second of silence as an 8-bit WAV, built here rather than shipped as a file.
    const rate = 8000, n = rate / 2, buf = new ArrayBuffer(44 + n), v = new DataView(buf);
    const str = (at, text) => { for (let i = 0; i < text.length; i++) v.setUint8(at + i, text.charCodeAt(i)); };
    str(0, 'RIFF'); v.setUint32(4, 36 + n, true); str(8, 'WAVEfmt '); v.setUint32(16, 16, true);
    v.setUint16(20, 1, true); v.setUint16(22, 1, true); v.setUint32(24, rate, true); v.setUint32(28, rate, true);
    v.setUint16(32, 1, true); v.setUint16(34, 8, true); str(36, 'data'); v.setUint32(40, n, true);
    for (let i = 0; i < n; i++) v.setUint8(44 + i, 128);
    this.el = new Audio(URL.createObjectURL(new Blob([buf], { type: 'audio/wav' })));
    this.el.loop = true;
    this.el.setAttribute('playsinline', '');
    this.el.setAttribute('x-webkit-airplay', 'deny');
    this.visible();
  },
  hidden() { if (this.el) this.el.pause(); },
  visible() { if (this.el) { const p = this.el.play(); if (p && p.catch) p.catch(() => {}); } }
};

const Music = {
  ctx: null, bus: null, filter: null, inited: false,
  tracks: {},          // mood -> { el, gain, seam, dead }
  mood: null,          // what the game asked for
  key: null,           // the track actually playing - differs when a mood falls back
  push: null,          // the fallback's rate/volume nudge, if any
  phase: 'none', ducked: false, rate: 1, rateTarget: 1, wasPlaying: false,

  // Called from the Begin tap. `sound` is Phaser's sound manager: sharing its
  // AudioContext means one unlock, and Phaser's own blur handling covers the music too.
  init(sound) {
    if (this.inited) return;
    this.inited = true;
    this.ctx = (sound && sound.context) || null;
    if (this.ctx) {
      this.filter = this.ctx.createBiquadFilter();
      this.filter.type = 'lowpass';
      this.filter.frequency.value = 22000;
      this.bus = this.ctx.createGain();
      this.bus.gain.value = 0;
      this.filter.connect(this.bus);
      this.bus.connect(this.ctx.destination);
    }
    for (const [mood, def] of Object.entries(MUSIC)) {
      const el = new Audio();
      const t = this.tracks[mood] = { el, gain: null, seam: null, dead: false };
      el.loop = true;
      el.preload = mood === 'hub' ? 'auto' : 'metadata';
      // Let a rate change bend the pitch: that IS the Grahan effect.
      el.preservesPitch = el.mozPreservesPitch = el.webkitPreservesPitch = false;
      el.addEventListener('error', () => {
        t.dead = true;
        if (this.key === mood) { const want = this.mood; this.mood = this.key = null; this.play(want); }
      });
      el.src = def.file + '?v=' + encodeURIComponent(BUILD_TAG);      // the build's own copy (config.js)
      if (this.ctx) {
        try {
          const src = this.ctx.createMediaElementSource(el);
          t.seam = this.ctx.createGain();
          t.gain = this.ctx.createGain();
          t.gain.gain.value = 0;
          src.connect(t.seam); t.seam.connect(t.gain); t.gain.connect(this.filter);
        } catch (e) { t.seam = t.gain = null; }
      }
      if (!t.gain) el.volume = 0;
    }
    this.level();
  },

  // Also from the Begin tap. iOS only lets an <audio> element be started from code once
  // it has been played inside a real tap, so every track is touched here, silently.
  unlock() {
    for (const t of Object.values(this.tracks)) {
      if (t.dead) continue;
      const p = t.el.play();
      if (p && p.then) p.then(() => { if (this.tracks[this.key] !== t) t.el.pause(); }).catch(() => {});
    }
  },

  play(mood) {
    if (!this.inited || this.mood === mood) return;
    this.mood = mood;
    const usable = k => k && this.tracks[k] && !this.tracks[k].dead;
    const def = MUSIC[mood] || {};
    let key = mood;
    this.push = null;
    if (!usable(key)) { key = def.fallback; this.push = def.push || null; }
    if (!usable(key)) { key = null; this.push = null; }

    if (key !== this.key) {
      const old = this.tracks[this.key];
      if (old) {
        this.fade(old, 0);
        setTimeout(() => { if (this.tracks[this.key] !== old) old.el.pause(); }, 1100);
      }
      this.key = key;
      const t = this.tracks[key];
      if (t) {
        try { t.el.currentTime = 0; t.el.playbackRate = this.rate; } catch (e) { /* not seekable yet */ }
        const p = t.el.play();
        if (p && p.catch) p.catch(() => {});
        this.fade(t, 1);
      }
    }
    this.level();
  },

  fade(t, to) {
    if (t.gain) {
      const g = t.gain.gain, now = this.ctx.currentTime;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(to, now + 0.9);
    } else {
      t.el.volume = to ? this.target() : 0;      // no Web Audio: a hard switch
    }
  },

  // phase: a PHASE_DEFS key while a run is live, anything else for "no colouring".
  colour(phase, ducked) {
    this.phase = MUSIC_PHASE[phase] ? phase : 'none';
    this.ducked = !!ducked;
    this.level();
  },

  target() {
    const c = MUSIC_PHASE[this.phase], push = this.push || {};
    return Math.min(1, settings.music * MUSIC_BASE_VOL * c.vol * (push.vol || 1) * (this.ducked ? 0.35 : 1));
  },

  level() {
    if (!this.inited) return;
    const c = MUSIC_PHASE[this.phase];
    this.rateTarget = c.rate * ((this.push && this.push.rate) || 1);
    if (this.ctx) {
      const now = this.ctx.currentTime;
      this.bus.gain.cancelScheduledValues(now);
      this.bus.gain.setTargetAtTime(this.target(), now, 0.25);
      this.filter.frequency.cancelScheduledValues(now);
      this.filter.frequency.setTargetAtTime(c.cutoff, now, 0.35);
    } else if (this.tracks[this.key]) {
      this.tracks[this.key].el.volume = this.target();
    }
  },

  // Every frame, in every state.
  tick(delta) {
    const t = this.tracks[this.key];
    if (!t) return;
    // Glide the rate - a sudden step in pitch would sound like a glitch, not an eclipse.
    if (Math.abs(this.rate - this.rateTarget) > 0.0005) {
      const step = 0.06 * delta / 1000;
      this.rate += Math.max(-step, Math.min(step, this.rateTarget - this.rate));
      try { t.el.playbackRate = this.rate; } catch (e) { /* ignore */ }
    }
    // These tracks were not written to loop. Dip the volume across the loop point so
    // the restart is a breath rather than a cut.
    const d = t.el.duration;
    if (t.seam && d > 6) {
      const edge = Math.min(t.el.currentTime, d - t.el.currentTime) / MUSIC_SEAM;
      t.seam.gain.setTargetAtTime(Math.max(0, Math.min(1, edge)), this.ctx.currentTime, 0.05);
    }
  },

  // Browsers keep an <audio> element playing in a background tab; the game does not.
  hidden() {
    const t = this.tracks[this.key];
    this.wasPlaying = !!(t && !t.el.paused);
    if (t) t.el.pause();
  },

  visible() {
    const t = this.tracks[this.key];
    if (t && this.wasPlaying) { const p = t.el.play(); if (p && p.catch) p.catch(() => {}); }
    this.wasPlaying = false;
  }
};
