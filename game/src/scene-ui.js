/*
 * scene-ui.js: the first layer of the scene: the screen itself.
 *
 * class UiScene extends Phaser.Scene
 * Owns      what is pinned to the screen (fix), the two lists a screen's objects go on
 *           (uiObjects for the title's screens, overlay for what opens over a fight) and
 *           their clearing (clearUI, openOverlay, closeOverlay); frost; panels and
 *           buttons (glass, ovPanel, uiPanel, ovButton, makeButton, pressed); icons
 *           (icon, makeLootIcons); toasts; sound and touch feedback (sfx, shake, buzz).
 * Needs     ui.js (MAT, FORGE, drawSlab), assets.js (ICON), audio.js (SFX).
 * Expects   of the layers above: this.state, this.silent, this.camOff.
 *
 * The scene is one object in five files, each a class extending the one before:
 * UiScene < FxScene < ScreensScene < SystemsScene < LootScene. A method may call any
 * other through `this`. The split is by what a method is about, so that a change to a
 * screen or to a material is made in one short file.
 */

class UiScene extends Phaser.Scene {
  // ---------- AUDIO ----------
  sfx(key, opts = {}) {
    if (this.silent || settings.sfx <= 0) return;
    const def = SFX[key];
    if (!def) return;
    const now = this.time.now;
    this.sfxLast = this.sfxLast || {};
    if (def.gap && now - (this.sfxLast[key] || -1e9) < def.gap) return;
    this.sfxLast[key] = now;
    const file = def.files ? Phaser.Utils.Array.GetRandom(def.files) : key;
    if (!this.cache.audio.exists(file)) return;
    // A few percent of pitch drift so a repeated hit never sounds like a machine gun.
    const rate = (opts.rate || 1) * (1 + (Math.random() - 0.5) * 0.08);
    try { this.sound.play(file, { volume: Math.min(1, def.vol * (opts.vol || 1) * settings.sfx), rate }); }
    catch (e) { /* audio not unlocked yet - skip rather than throw mid-frame */ }
  }

  shake(duration, intensity) { if (settings.shake) this.cameras.main.shake(duration, intensity); }

  // ---------- THE SCREEN AND THE ARENA (requirements 2.33) ----------
  // Pins things to the screen: they stay put when the camera moves. Whatever is not part
  // of the fight goes through here, or through ov() or uiObjects, which do the same.
  fix(...objs) { objs.forEach(o => { if (o && o.setScrollFactor) o.setScrollFactor(0); }); return objs[0]; }

  // A list whose members are pinned to the screen as they are added (uiObjects).
  uiList() {
    const list = [], push = list.push;
    list.push = (...objs) => { this.fix(...objs); return push.apply(list, objs); };
    return list;
  }

  hudOnTop(on) {
    if (ARENA_SCALE === 1) return;
    this.hudPanel.setDepth(on ? Z.hud : 0); this.hudEdge.setDepth(on ? Z.hud + 0.5 : 0);
    [this.hudText, this.weaponText, this.powerText, this.goldText, this.goldSign, this.powerSign].forEach(o => o && o.setDepth(on ? Z.hud + 1 : 0));
  }

  buzz(ms) {
    if (!settings.vibrate || this.silent || !navigator.vibrate) return;
    try { navigator.vibrate(Math.round(ms)); } catch (e) { /* ignore */ }
  }

  // ---------- OVERLAYS (pause menu, settings, how to play) ----------
  // Drawn above everything on their own list, so opening one never disturbs the run or
  // hub UI underneath. A full-screen blocker swallows taps meant for what's below.
  openOverlay(dim = 0.72) {
    this.closeOverlay();
    this.overlay = [];
    const frost = this.frost('overlay', 99.5);
    // The blocker swallows taps. Over a frosted backdrop it only needs to tint.
    this.ov(this.add.rectangle(W / 2, H / 2, W, H, 0x120400, frost ? Math.min(dim, 0.42) : dim).setInteractive(), 100);
  }

  closeOverlay() {
    (this.overlay || []).forEach(o => o.destroy());
    this.overlay = [];
    if (this.frostRT && this.frostRT.overlay) this.frostRT.overlay.setVisible(false);
  }

  // ---------- GLASS (requirements 2.29) ----------
  // Panels are translucent, and what lies behind them shows through frosted. The frost
  // is made once, when a panel opens, and costs nothing per frame: the whole scene is
  // drawn into a texture a quarter of the size, and that small copy is then laid down
  // thirteen times in two rings, each averaged into the last - a blur built from plain
  // draws, so it does not depend on how the graphics card filters a stretched texture.
  // There are two, so a pick can open over the choice screen without one overwriting
  // the other. Where WebGL is missing the panels fall back to a plain dark backing.
  initFrost() {
    this.frostRT = {};
    if (this.game.renderer.type !== Phaser.WEBGL) return;
    const k = 0.25;
    this.frostSmall = this.make.renderTexture({ x: 0, y: 0, width: Math.ceil(W * k), height: Math.ceil(H * k) }, false).setOrigin(0).setScale(1 / k);
    this.frostSmall.camera.setOrigin(0, 0).setZoom(k).setScroll(0, 0);     // the same view as the main camera, a quarter of the size
    this.frostTaps = [[0, 0]];
    for (let i = 0; i < 6; i++) {
      const a1 = i * Math.PI / 3, a2 = a1 + Math.PI / 6;
      this.frostTaps.push([Math.cos(a1) * 4.5, Math.sin(a1) * 4.5], [Math.cos(a2) * 9, Math.sin(a2) * 9]);
    }
    for (const slot of ['overlay', 'ui']) this.frostRT[slot] = this.fix(this.add.renderTexture(W / 2, H / 2, W, H).setOrigin(0.5).setVisible(false));
  }

  frost(slot, depth) {
    const rt = this.frostRT && this.frostRT[slot], small = this.frostSmall;
    if (!rt || this.silent) return null;      // the playtest bot runs silent and never looks at a panel
    try {
      rt.setVisible(false);
      this.children.depthSort();
      small.camera.setScroll(this.camOff.x, this.camOff.y);
      small.clear();
      small.draw(this.children.list.filter(o => o.visible));
      rt.clear();
      this.frostTaps.forEach(([dx, dy], i) => { small.setAlpha(1 / (i + 1)); rt.draw(small, dx, dy); });   // a running average
      return rt.setDepth(depth).setVisible(true);
    } catch (e) { return null; }
  }

  // x, y is the centre. One material for every screen (requirements 2.47): the stepwell's.
  // A `panel` is a slab of shadowed sandstone with its corners cut, edged in worn bronze
  // and lit from above as the figures are: a warm line along its top, a shadow under its
  // foot. A `card` (a row, a slot, a choice) is cut into a panel: flatter, darker, thinly
  // edged, in shade along its top. A `button` stands out of a panel as a panel stands out
  // of the screen. An edge takes the colour of what it says: a metal, a state, a warning.
  // What lies behind still shows through, blurred (frost): only the frame is new.
  glass(g, x, y, w, h, opts = {}) { return drawSlab(g, x, y, w, h, opts); }      // the material itself is ui.js's

  // A button answers the finger: it dips for a moment. The tap has already been acted on,
  // and the screen may have changed under it, so only a button still there is touched.
  pressed(...parts) {
    parts = parts.filter(o => o && o.active);
    parts.forEach(o => o.setAlpha(0.66));
    setTimeout(() => parts.forEach(o => { if (o.active) o.setAlpha(1); }), 120);
  }

  ovPanel(cx, cy, w, h, opts = {}) {
    const frosted = this.frostRT && this.frostRT.overlay && this.frostRT.overlay.visible;
    return this.glass(this.ov(this.add.graphics()), cx, cy, w, h, Object.assign({ kind: 'panel', alpha: frosted ? 0.66 : 0.97 }, opts));
  }

  // The same glass for the screens that are not overlays - the choice after a level, the
  // victory, the end of a run. Everything the screen adds afterwards is lifted above it
  // by raiseUI().
  uiPanel(cx, cy, w, h, stroke) {
    const frost = this.frost('ui', 78);
    this.uiObjects.push(this.add.rectangle(W / 2, H / 2, W, H, 0x120400, frost ? 0.3 : 0.5).setDepth(78.4));
    this.uiObjects.push(this.add.zone(W / 2, H / 2, W, H).setInteractive().setDepth(78.5));     // nothing underneath can be tapped
    this.uiObjects.push(this.glass(this.add.graphics().setDepth(79), cx, cy, w, h, { kind: 'panel', stroke, strokeAlpha: 0.95, alpha: frost ? 0.68 : 0.97 }));
  }
  raiseUI() { this.uiObjects.forEach(o => { if (o.depth === 0) o.setDepth(o.type === 'Text' ? 81 : 80); }); }

  ensureSoftGlow() {
    if (this.textures.exists('softglow')) return;
    const tex = this.textures.createCanvas('softglow', 128, 128), c = tex.getContext(), g = c.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.4, 'rgba(255,255,255,0.42)'); g.addColorStop(1, 'rgba(255,255,255,0)');
    c.fillStyle = g; c.fillRect(0, 0, 128, 128); tex.refresh();
  }

  ov(obj, depth = 101) { obj.setDepth(depth).setScrollFactor(0); this.overlay.push(obj); return obj; }

  ovText(x, y, str, style) { return this.ov(this.add.text(x, y, str, Object.assign({ resolution: RES }, style)), 102); }

  // A glass button: the look is drawn, and an unseen rectangle over it takes the taps.
  // Callers that restyle the rectangle (the settings switches) restyle the drawing.
  ovButton(x, y, w, h, label, fill, onClick, opts = {}) {
    const g = this.ov(this.add.graphics()), look = { fill, stroke: opts.stroke || FORGE.bronze };
    const paint = () => { g.clear(); this.glass(g, x, y, w, h, { kind: 'button', fill: look.fill, alpha: 0.82, stroke: look.stroke, strokeAlpha: 0.9, radius: Math.min(11, h / 2), sheen: 0.09 }); };
    paint();
    const bg = this.ov(this.add.rectangle(x, y, w, h, 0xffffff, 0).setInteractive({ useHandCursor: true }));
    bg.setFillStyle = c => { look.fill = c; paint(); return bg; };
    bg.setStrokeStyle = (lw, c) => { look.stroke = c; paint(); return bg; };
    const t = this.ovText(x, y, label, { fontSize: (opts.size || 13) + 'px', color: opts.color || '#fffbef', fontStyle: 'bold' }).setOrigin(0.5);
    bg.on('pointerdown', () => { if (opts.sound !== null) this.sfx(opts.sound || 'ui-click'); onClick(bg, t); this.pressed(g); });
    return { bg, t };
  }

  // ---------- ICONS ----------
  // An icon, `size` across. `ref` is [frame, drawn shape, its colour] (see ICON). A painted
  // icon is never tinted: its colours are its own, and what state it is in is shown round
  // it (a border, a badge, a word) or by fading it.
  icon(x, y, ref, size) {
    if (!this.painted) {
      const old = this.add.image(x, y, ref[1]).setDisplaySize(size, size);
      return ref[2] === undefined ? old : old.setTint(ref[2]);
    }
    const drawn = size * (ICON.grow[ref[0].split('-')[0]] || 1);
    return this.add.image(x, y, drawn * RES <= ICON.small ? 'icons-small' : 'icons', ICON_FRAMES.indexOf(ref[0])).setDisplaySize(drawn, drawn);
  }

  // ---------- LOOT ICONS ----------
  // Drawn once into textures at boot rather than shipped as files: they stay exactly
  // on-palette, cost nothing to download, and one texture serves every rarity because
  // the rarity colour is applied as a tint at pickup time.
  makeLootIcons() {
    const S = 32, C = S / 2;
    const g = this.make.graphics({ add: false });
    const ink = 0xfffbef;
    const def = (key, draw) => {
      g.clear();
      g.fillStyle(ink, 1); g.lineStyle(3, ink, 1);
      draw(g);
      g.generateTexture('icon_' + key, S, S);
    };

    // --- weapons ---
    def('none', g => {                      // plain blade
      g.fillTriangle(C, 3, C - 5, 14, C + 5, 14);
      g.fillRect(C - 4, 14, 8, 11);
      g.fillRect(C - 8, 24, 16, 4);
    });
    def('venom', g => {                     // droplet
      g.fillTriangle(C, 4, C - 8, 17, C + 8, 17);
      g.fillCircle(C, 19, 8);
    });
    def('vampiric', g => {                  // paired fangs
      g.fillTriangle(C - 7, 5, C - 1, 5, C - 4, 24);
      g.fillTriangle(C + 1, 5, C + 7, 5, C + 4, 24);
      g.fillRect(C - 9, 4, 18, 4);
    });
    def('chain', g => {                     // two interlocked links
      g.strokeCircle(C - 5, C, 7);
      g.strokeCircle(C + 5, C, 7);
    });
    def('executioner', g => {               // axe head
      g.fillRect(C - 2, 4, 4, 24);
      g.beginPath(); g.moveTo(C + 1, 6); g.lineTo(C + 13, 12);
      g.lineTo(C + 13, 20); g.lineTo(C + 1, 24); g.closePath(); g.fillPath();
    });

    // --- trinkets ---
    def('vitality', g => {                  // heart
      g.fillCircle(C - 5, 12, 6); g.fillCircle(C + 5, 12, 6);
      g.fillTriangle(C - 11, 14, C + 11, 14, C, 28);
    });
    def('aegis', g => {                     // shield
      g.beginPath(); g.moveTo(C, 3); g.lineTo(C + 11, 9); g.lineTo(C + 9, 21);
      g.lineTo(C, 29); g.lineTo(C - 9, 21); g.lineTo(C - 11, 9);
      g.closePath(); g.fillPath();
    });
    def('thorns', g => {                    // spiked ring
      g.strokeCircle(C, C, 7);
      for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        g.lineBetween(C + Math.cos(a) * 8, C + Math.sin(a) * 8,
                      C + Math.cos(a) * 14, C + Math.sin(a) * 14);
      }
    });
    def('swift', g => {                     // stacked chevrons
      for (const dy of [0, 9]) {
        g.beginPath(); g.moveTo(C - 9, 8 + dy); g.lineTo(C, 15 + dy); g.lineTo(C + 9, 8 + dy);
        g.strokePath();
      }
    });
    def('regen', g => {                     // cross
      g.fillRect(C - 3, 6, 6, 20);
      g.fillRect(6, C - 3, 20, 6);
    });

    // --- unidentified ---
    def('mystery', g => {
      g.strokeCircle(C, C, 11);
      g.fillCircle(C, C, 3);
    });

    // --- boons (2.24) ---
    const boon = (key, draw) => {
      g.clear();
      g.fillStyle(ink, 1); g.lineStyle(3, ink, 1);
      draw(g);
      g.generateTexture('boon_' + key, S, S);
    };
    boon('keen', g => {                     // a blade with a glint
      g.fillTriangle(C - 2, 4, C - 8, 24, C + 4, 24);
      g.fillRect(C - 9, 24, 14, 3);
      g.lineStyle(2, ink, 1); g.lineBetween(C + 8, 5, C + 8, 13); g.lineBetween(C + 4, 9, C + 12, 9);
    });
    boon('quick', g => {                    // chevrons, pressing on
      for (const dx of [-6, 4]) { g.beginPath(); g.moveTo(C + dx - 4, 8); g.lineTo(C + dx + 4, C); g.lineTo(C + dx - 4, 24); g.strokePath(); }
    });
    boon('reach', g => {                    // a long arrow from a point
      g.fillCircle(6, C, 3.5); g.lineBetween(9, C, 24, C);
      g.fillTriangle(29, C, 22, C - 6, 22, C + 6);
    });
    boon('feet', g => {                     // a footprint
      g.fillEllipse(C, 21, 11, 15);
      [[-6, 10], [-2, 8], [2, 8], [6, 10]].forEach(([dx, y]) => g.fillCircle(C + dx, y, 2.2));
    });
    boon('iron', g => {                     // a breastplate
      g.beginPath(); g.moveTo(C - 11, 6); g.lineTo(C + 11, 6); g.lineTo(C + 9, 23); g.lineTo(C, 28); g.lineTo(C - 9, 23); g.closePath(); g.strokePath();
      g.fillRect(C - 1.5, 8, 3, 17);
    });
    boon('hide', g => {                     // overlapping scales
      for (const [x, y] of [[C - 6, 11], [C + 6, 11], [C, 21]]) g.strokeCircle(x, y, 6.5);
    });
    boon('ground', g => {                   // a stake driven into the ground
      g.fillTriangle(C - 5, 5, C + 5, 5, C, 22);
      g.fillRect(C - 12, 23, 24, 3);
      g.lineStyle(2, ink, 1); g.lineBetween(C - 10, 29, C - 6, 26); g.lineBetween(C + 10, 29, C + 6, 26);
    });
    boon('run', g => {                      // an arrow with speed lines
      g.lineBetween(13, C, 24, C); g.fillTriangle(30, C, 23, C - 6, 23, C + 6);
      g.lineStyle(2, ink, 1); g.lineBetween(4, C - 6, 11, C - 6); g.lineBetween(2, C, 9, C); g.lineBetween(4, C + 6, 11, C + 6);
    });
    boon('second', g => {                   // one strike, two targets
      g.fillCircle(C, 26, 3.5);
      g.lineStyle(2.5, ink, 1); g.lineBetween(C, 24, C - 8, 11); g.lineBetween(C, 24, C + 8, 11);
      g.strokeCircle(C - 9, 7, 4.5); g.strokeCircle(C + 9, 7, 4.5);
    });
    boon('readslam', g => {                 // stepping out of the ring
      g.lineStyle(2.5, ink, 1); g.strokeCircle(C - 4, C + 4, 10);
      g.fillCircle(C - 4, C + 4, 3);
      g.lineBetween(C + 2, C - 2, C + 10, C - 10);
      g.fillTriangle(C + 14, C - 14, C + 5, C - 12, C + 12, C - 5);
    });
    boon('laststand', g => {                // a warning sign
      g.lineStyle(2.5, ink, 1); g.strokeTriangle(C, 4, C - 13, 27, C + 13, 27);
      g.fillRect(C - 1.5, 11, 3, 9); g.fillCircle(C, 23, 1.8);
    });
    boon('greed', g => {                    // a stack of coins
      for (const y of [24, 17, 10]) g.fillEllipse(C, y, 20, 6);
    });
    boon('rot', g => {                      // a drop that spreads
      g.fillTriangle(C - 3, 5, C - 10, 17, C + 4, 17);
      g.fillCircle(C - 3, 19, 7);
      g.fillCircle(C + 9, 11, 3); g.fillCircle(C + 11, 22, 2.5);
    });
    boon('bloodshield', g => {              // a shield holding a drop
      g.lineStyle(2.5, ink, 1);
      g.beginPath(); g.moveTo(C, 3); g.lineTo(C + 11, 9); g.lineTo(C + 9, 21); g.lineTo(C, 29); g.lineTo(C - 9, 21); g.lineTo(C - 11, 9); g.closePath(); g.strokePath();
      g.fillTriangle(C, 10, C - 4, 17, C + 4, 17); g.fillCircle(C, 18, 4);
    });
    boon('fork', g => {                     // a bolt that splits
      g.lineStyle(2.5, ink, 1);
      g.beginPath(); g.moveTo(C + 2, 3); g.lineTo(C - 4, 13); g.lineTo(C + 3, 15); g.lineTo(C - 2, 22); g.strokePath();
      g.lineBetween(C - 2, 22, C - 9, 29); g.lineBetween(C - 2, 22, C + 6, 29);
    });
    boon('cleancut', g => {                 // a clean diagonal cut
      g.fillTriangle(5, 27, 5, 9, 23, 27);
      g.fillTriangle(9, 5, 27, 5, 27, 23);
    });
    boon('kindling', g => {                 // a flame
      g.fillCircle(C, 21, 7);
      g.fillTriangle(C - 7, 20, C + 7, 20, C + 2, 3);
      g.fillTriangle(C - 7, 21, C - 1, 18, C - 8, 9);
    });
    boon('hunger', g => {                   // the eclipse
      g.lineStyle(2, ink, 1); g.strokeCircle(C, C, 12);
      g.fillCircle(C + 4, C - 3, 8);
    });

    g.destroy();
  }

  // ---------- UI HELPERS ----------
  clearUI() {
    this.uiObjects.forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
    this.uiObjects = this.uiList();
    if (this.frostRT && this.frostRT.ui) this.frostRT.ui.setVisible(false);
    this.menu = null;
  }

  makeButton(x, y, w, h, label, color, onClick, opts = {}) {
    const g = this.glass(this.add.graphics(), x, y, w, h, { kind: 'button', fill: color, alpha: 0.86, stroke: opts.stroke || MAT.bronze, strokeAlpha: opts.stroke ? 0.9 : 0.75, radius: Math.min(12, h / 2), sheen: 0.1 });
    const bg = this.add.rectangle(x, y, w, h, 0xffffff, 0).setInteractive({ useHandCursor: true });
    const txt = this.add.text(x, y, label, { resolution: RES, fontSize: (opts.size || 16) + 'px', color: opts.color || '#fffbef', fontStyle: 'bold' }).setOrigin(0.5);
    bg.on('pointerdown', () => { if (opts.sound !== null) this.sfx(opts.sound || 'ui-click'); onClick(); this.pressed(g); });
    this.uiObjects.push(g, bg, txt);
    return bg;
  }

  showToast(msg, color) {
    const t = this.fix(this.add.text(W/2, HUD_H + 20, msg, { resolution: RES, fontSize: '14px', color, fontStyle: 'bold',
      stroke: '#2a0800', strokeThickness: 4 }).setOrigin(0.5).setAlpha(0).setDepth(ARENA_SCALE > 1 ? Z.hud + 2 : 45));
    this.tweens.add({
      targets: t, alpha: 1, y: HUD_H + 8, duration: 200, yoyo: true, hold: 700,
      onComplete: () => t.destroy()
    });
  }
}
