/*
 * loot-scene.js: the scene itself: its life, the run, the fight.
 *
 * class LootScene extends SystemsScene   (registered with the engine as 'LootScene')
 * Owns      preload, create and begin; a run from startRun to endRun; waves and what
 *           they spawn; the hero's and the enemies' movement; bosses, their slams,
 *           shields and gates; damage (damageEnemy is the one door for damage to an
 *           enemy, damagePlayer for damage to the hero); death, loot dropped, banking;
 *           pause and resume; the HUD; and update(), which runs all of it each frame.
 * Needs     every file before it.
 * State     one run's: this.player, this.enemies, this.pickups, this.projectiles,
 *           this.wave, this.sector, this.phase and its timers. startRun makes them,
 *           the end-of-run screen's button clears them.
 *
 * The order things happen in inside update(), and the order enemies are gone through,
 * decide who is hit first and what a kill sets off. They are kept as they were.
 */

class LootScene extends SystemsScene {
  constructor() { super('LootScene'); }

  // Kenney "Space Shooter Remastered", CC0 — see assets/CREDITS.md for the file map.
  preload() {
    // The first slice of the bar is the page and the engine itself arriving.
    this.load.on('progress', v => Loader.setProgress(0.12 + v * 0.88));
    // Every file the game uses is named by gameAssets() (assets.js), and loaded in its order.
    for (const a of gameAssets()) {
      if (a.load === 'spritesheet') this.load.spritesheet(a.key, a.path, { frameWidth: a.frame, frameHeight: a.frame });
      else this.load[a.load](a.key, a.path);
    }
  }

  create() {
    this.state = 'loading'; // loading -> hub -> playing -> ... -> summary -> hub
    this.dressHero();
    // A floor picture is only ever painted into the floor's own texture, so the copy the
    // loader put on the graphics card is given back; the picture itself is kept.
    FLOORS.forEach(theme => {
      const key = `floor-pic-${theme.picture}`;
      if (!theme.picture || !this.textures.exists(key)) return;
      FLOOR_PICS[theme.picture] = this.textures.get(key).getSourceImage();
      this.textures.remove(key);
    });

    // One door for typography: every this.add.text() call of the scene picks up its
    // typeface here, so no call site has to name a font.
    const addText = this.add.text;
    this.add.text = (x, y, str, style) => addText.call(this.add, x, y, str, styleText(style, str));

    // Canvas is RES times larger than the world; zoom back in by RES so the visible
    // area is exactly 0..W, 0..H. Every coordinate below stays in world units. The zoom
    // is taken about the top-left corner, so the camera's scroll is simply that corner's
    // place in the arena: (0, 0) while the arena is one screen, and things pinned to the
    // screen (see fix) stay where they are drawn however far it scrolls.
    this.cameras.main.setOrigin(0, 0).setZoom(RES).setScroll(0, 0);
    this.camOff = { x: 0, y: 0 };
    this.cameraOn = false;
    this.uiObjects = this.uiList();
    // Painted icons if both sheets came, the drawn shapes if not; the shapes are not even
    // made when the pictures are there, so nothing can show one by mistake.
    this.painted = this.textures.exists('icons') && this.textures.exists('icons-small');
    if (!this.painted) this.makeLootIcons();
    this.makeFxPieces();
    this.initFrost();

    // Below every layer. At the default depth 0 it covered the floor, the phase tint AND
    // every slam telegraph - which silently made boss attacks invisible.
    this.fix(this.add.rectangle(W/2, H/2, W, H, FORGE.deep).setDepth(Z.floor - 1));

    // Two rectangles. viewBounds is the window on to the arena: the part of the screen
    // under the HUD and inside the frame; what lives on the screen during a fight (tips,
    // tabs, the wave track) is placed against it. arenaBounds is the arena itself, where
    // everything that fights is kept. With a fixed arena they are the same rectangle.
    const S = ARENA_SCALE;
    this.viewBounds = new Phaser.Geom.Rectangle(MARGIN, HUD_H + MARGIN, W - MARGIN*2, H - HUD_H - MARGIN*2);
    this.arenaBounds = new Phaser.Geom.Rectangle(MARGIN * S, HUD_H + MARGIN * S, (W - MARGIN*2) * S, (H - HUD_H - MARGIN*2) * S);
    this.worldBounds = new Phaser.Geom.Rectangle(0, 0, W * S, HUD_H + (H - HUD_H) * S);

    const ab = this.arenaBounds;

    // --- Arena floor: the landing of one level of the stepwell (see FLOOR ART) ---
    // Layers, all under the phase tint and the slam telegraphs:
    //   stairs frame (in the margins)  <  painted floor  <  drifting embers  <  edge line
    this.drawWellFrame();
    this.floorLayers = [];
    this.starfield = this.add.tileSprite(ab.centerX, ab.centerY, ab.width, ab.height, 'bg_stars').setDepth(Z.floor + 0.4);
    this.floorEdge = this.add.rectangle(ab.centerX, ab.centerY, ab.width, ab.height, 0x000000, 0).setDepth(Z.floor + 0.5);
    this.setFloor(1);

    // Full-arena red flash for taking damage. Created once and reused - it idles at
    // alpha 0 rather than being built and destroyed on every hit.
    // It covers the window: the arena when that is one screen, everything under the HUD when it is wide.
    const vb = this.viewBounds, flash = S > 1 ? new Phaser.Geom.Rectangle(0, HUD_H, W, H - HUD_H) : vb;
    this.hurtFlash = this.fix(this.add.rectangle(flash.centerX, flash.centerY, flash.width, flash.height, 0xff2a14, 0).setDepth(50));

    // HUD chrome is drawn after the arena so it always wins the depth fight.
    this.hudPanel = this.add.rectangle(W/2, HUD_H/2, W, HUD_H, FORGE.panel);
    this.hudEdge = this.add.graphics();
    this.hudEdge.fillStyle(MAT.light, 0.3).fillRect(0, HUD_H - 3, W, 1).fillStyle(MAT.bronze, 0.95).fillRect(0, HUD_H - 2, W, 2).fillStyle(MAT.shade, 0.45).fillRect(0, HUD_H, W, 2.5);
    this.hudText = this.add.text(14, 2, '', { resolution: RES, fontSize: '13px', color: '#fffbef' });
    // The treasure carried, after the line, with its sign.
    this.goldText = this.add.text(14, 2, '', { resolution: RES, fontSize: '13px', color: '#ffd23c' });
    this.goldSign = this.painted ? this.icon(0, 11, ['sign-treasure'], 13).setVisible(false) : null;
    this.powerSign = this.painted ? this.icon(0, 67, ['sign-power'], 12).setVisible(false) : null;
    this.weaponText = this.add.text(14, 60, '', { resolution: RES, fontSize: '11px', color: '#c8a96e' });
    // Power (2.28), at the right of the same line. Tapping it opens the profile.
    this.powerText = this.add.text(W - 14, 59, '', { resolution: RES, fontSize: '12px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(1, 0);
    const powerZone = this.add.zone(W - 52, 66, 104, 24).setInteractive({ useHandCursor: true }).on('pointerdown', () => this.pauseGame('profile'));
    this.fix(this.hudEdge, this.hudPanel, this.hudText, this.weaponText, this.powerText, powerZone, this.goldText, this.goldSign, this.powerSign);

    // input for movement (only acts while playing)
    this.pointerTarget = null;
    // Tapping a button (satchel tab, Tejas) must not ALSO walk the hero to that spot.
    this.input.on('pointerdown', (p, over) => {
      this.pointerOnUI = !!(over && over.length);
      if (this.state === 'playing' && !this.pointerOnUI) { this.setMoveTarget(p.worldX, p.worldY); this.tapMark(); }
    });
    this.input.on('pointermove', p => { if (this.state === 'playing' && p.isDown && !this.pointerOnUI) this.setMoveTarget(p.worldX, p.worldY); });
    // Lifting the finger does NOT cancel the walk: a tap means "go there". The target is
    // dropped on arrival, or as soon as a movement key is pressed.
    this.input.on('pointerup', () => { this.pointerOnUI = false; });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.wasd = this.input.keyboard.addKeys('W,A,S,D');
    this.tejasKeys = this.input.keyboard.addKeys('SPACE,E');   // desktop trigger for Tejas

    this.buildPauseButton();
    const escape = () => {
      if (this.state === 'lesson') return this.closeLesson();
      if (this.state === 'boon') return this.closeBoons();   // the picks keep
      if (this.state === 'playing') this.pauseGame();
      else if (this.state === 'paused') this.resumeGame();
      else if (this.overlay && this.overlay.length) this.closeOverlay();
    };
    this.input.keyboard.on('keydown-ESC', escape);
    // Dota's habit: + spends a waiting boon. (= is the same key without Shift.)
    this.input.keyboard.on('keydown', e => { if (e.key === '+' || e.key === '=' || e.key === 'b' || e.key === 'B') this.openBoons(); });
    this.input.keyboard.on('keydown-P', escape);
    this.input.keyboard.on('keydown-ENTER', () => this.closeLesson());
    this.input.keyboard.on('keydown-SPACE', () => this.closeLesson());
    // Switching apps or tabs mid-fight pauses the run, so nobody comes back to a death
    // they never saw. The playtest bot turns this off (it runs in a hidden pane).
    this.autoPause = true;
    this.game.events.on('hidden', () => { if (this.autoPause) this.pauseGame(); Music.hidden(); Unmute.hidden(); });
    this.game.events.on('visible', () => { Music.visible(); Unmute.visible(); });

    // Everything is built; the loading screen swaps its bar for a Begin button and the
    // hub appears when it is pressed.
    Loader.setProgress(1);
    Loader.ready(() => this.begin());
  }

  // Runs inside the Begin tap, which is what lets the browser start audio at all.
  begin() {
    Unmute.start(this.sound);    // sound effects must work whether or not the music is on
    if (MUSIC_ON) { Music.init(this.sound); Music.unlock(); }
    this.showHub();
  }

  // Where the player has asked to walk to. Kept inside the arena, so the walk can always
  // arrive (a tap on the HUD would otherwise leave the hero pushing at the wall forever).
  setMoveTarget(x, y) {
    const b = this.arenaBounds;
    this.pointerTarget = { x: Phaser.Math.Clamp(x, b.x + 15, b.right - 15), y: Phaser.Math.Clamp(y, b.y + 15, b.bottom - 15) };
  }

  // The part of the arena the screen shows under the HUD, in the arena's own coordinates.
  viewRect() { return new Phaser.Geom.Rectangle(this.camOff.x, this.camOff.y + HUD_H, W, H - HUD_H); }

  // Where enemies come in. The walls of a fixed arena; in a wide one, just beyond what
  // the screen shows, or the wall where that is nearer, so that they arrive as soon as
  // they always have and are never seen appearing.
  spawnRect() {
    const b = this.arenaBounds;
    if (ARENA_SCALE === 1) return b;
    const v = this.viewRect(), pad = 26;
    const x0 = Math.max(b.x, v.x - pad), y0 = Math.max(b.y, v.y - pad), x1 = Math.min(b.right, v.right + pad), y1 = Math.min(b.bottom, v.bottom + pad);
    return new Phaser.Geom.Rectangle(x0, y0, x1 - x0, y1 - y0);
  }

  // Keeps the hero in the middle of the window, easing after him, and stops at the
  // arena's walls. With a fixed arena, or outside a run, the camera sits at the corner.
  aimCamera(snap, delta = 16) {
    const S = ARENA_SCALE;
    let x = 0, y = 0;
    if (S > 1 && this.cameraOn && this.player) {
      x = Phaser.Math.Clamp(this.player.x - W / 2, 0, W * (S - 1));
      y = Phaser.Math.Clamp(this.player.y - (HUD_H + (H - HUD_H) / 2), 0, (H - HUD_H) * (S - 1));
    }
    const k = snap ? 1 : Math.min(1, delta * CAMERA_EASE);
    this.camOff.x += (x - this.camOff.x) * k;
    this.camOff.y += (y - this.camOff.y) * k;
    this.cameras.main.setScroll(this.camOff.x, this.camOff.y);
  }

  // How far a boss's slams reach, against their size in the fixed arena.
  slamReach() { return ARENA_SCALE > 1 ? Math.min(WIDE.slamMost, WIDE.slam + WIDE.slamPerSector * (this.sector - 1)) : 1; }

  // In a wide arena the HUD has the arena passing underneath it, so during a run it is
  // lifted above everything that fights. On the title screen it goes back under the menu.
  // The top line of the HUD: where the run stands, then the treasure carried with its sign.
  setHudLine(line, gold) {
    this.hudText.setText(line);
    this.goldText.setText(gold);
    const x = this.hudText.x + this.hudText.width + 12;
    this.goldText.x = x + (this.goldSign && gold ? 17 : 0);
    if (this.goldSign) this.goldSign.setVisible(!!gold).setPosition(x + 7, 11);
  }
  // Power, at the right of the HUD, with its sign (the drawn HUD had a diamond for one).
  setPower(power) {
    this.powerText.setText(power === '' ? '' : (this.painted ? 'Power ' : '◆ Power ') + power);
    if (this.powerSign) this.powerSign.setVisible(power !== '').setPosition(W - 14 - this.powerText.width - 9, 67);
  }

  playMusic(mood) {
    if (this.silent) return;
    Music.play(mood);
    this.refreshMusic();
  }

  // Tells the music what the Cosmic Cycle is doing: the phase colours whatever track is
  // playing while a run is live, and pausing ducks it rather than cutting it.
  refreshMusic() {
    const held = this.state === 'paused' || this.state === 'boon' || this.state === 'lesson';
    Music.colour(held || this.state === 'playing' ? this.phase : null, held);
  }

  // ---------- PAUSE ----------
  buildPauseButton() {
    const x = W - 24, y = 12;
    this.pauseBtn = this.add.rectangle(x, y, 30, 17, FORGE.deep, 0.9).setStrokeStyle(1, FORGE.bronze, 0.8).setDepth(60);
    this.pauseIcon = this.add.text(x, y, 'II', { resolution: RES, fontSize: '10px', color: '#ffd23c', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(61);
    // The touch target is much larger than the drawn button: 30x17 is too small for a thumb.
    this.pauseHit = this.add.zone(x - 8, y + 4, 56, 36).setInteractive({ useHandCursor: true }).setDepth(62);
    this.pauseHit.on('pointerdown', () => this.pauseGame());
    this.fix(this.pauseBtn, this.pauseIcon, this.pauseHit);
    this.showPauseButton(false);
  }

  showPauseButton(on) {
    if (!this.pauseBtn) return;
    this.pauseBtn.setVisible(on); this.pauseIcon.setVisible(on);
    if (this.pauseHit.input) this.pauseHit.input.enabled = on;
  }

  // menu: 'pause' for the pause menu, 'satchel' to choose between items.
  pauseGame(menu = 'pause') {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.pointerTarget = null;
    this.time.paused = true;
    this.tweens.pauseAll();
    this.sfx(menu === 'satchel' ? 'satchel' : 'ui-open');
    this.refreshMusic();
    if (menu === 'satchel') this.showSatchel();
    else if (menu === 'profile') this.showProfile(() => this.resumeGame());
    else this.showPauseMenu();
  }

  resumeGame() {
    if (this.state !== 'paused') return;
    this.closeOverlay();
    this.state = 'playing';
    this.time.paused = false;
    this.tweens.resumeAll();
    this.sfx('ui-close');
    this.refreshMusic();
  }

  // Counts as a death: an escape hatch that dodged the cost of a bad run would make
  // the Extract/Descend choice meaningless.
  abandonRun() {
    this.closeOverlay();
    this.time.paused = false;
    this.tweens.resumeAll();
    this.state = 'playing';
    this.endRun(false, true);
  }

  // ---------- BOSS COMBAT ----------
  // Before this, a shielded boss was completely inert (it only repositioned its shield),
  // slams did a flat 22-28 that never scaled, and contact damage was 0 - so standing
  // next to a boss was safe indefinitely. Every boss now: hits on contact, summons
  // Asura, and cycles through a telegraphed slam kit that scales with depth AND with
  // the player's own max HP, so stacking Vitality cannot trivialise it.
  armBoss(e, kind) {
    const byKind = {
      gatekeeper: { types: this.sector >= 2 ? ['circle', 'line'] : ['circle'], cooldown: 2400, radius: 78, summonEvery: 9000 },
      sectorboss: { types: ['circle', 'line'],            cooldown: 2300, radius: 90, summonEvery: 8000 },
      megaboss:   { types: ['circle', 'line', 'scatter'], cooldown: 1900, radius: 96, summonEvery: 7000 }
    }[kind];
    e.slamTypes = byKind.types;
    e.slamCooldown = byKind.cooldown * (this.tier >= 4 ? 0.75 : 1);
    e.slamRadius = byKind.radius;
    e.slamTimer = 1400;                    // a short grace beat after it appears
    e.slam = null;
    e.summonEvery = byKind.summonEvery;
    e.summonTimer = byKind.summonEvery;
    e.contactDmg = (10 + this.depth * 1.6) * sectorDmgMult(this.sector);
  }

  updateBoss(e, edx, edy, edist, dt, delta) {
    // Rooted while shielded (the anchor puzzle is a stand-off) and while winding up a
    // slam (so the telegraph stays honest), but never idle.
    if (!e.shieldOn && !e.slam) {
      e.x += (edx/edist) * e.speed * dt;
      e.y += (edy/edist) * e.speed * dt;
    }

    // Reach, not just body contact: collision holds the hero at exactly his own radius plus
    // the boss's, and a rooted (shielded) boss never steps back into him, so a body-contact
    // check almost never fired. Bosses swing with a reach of the hero's radius again.
    if (edist < (2 * HERO_RADIUS + e.radius) && e.hitCooldown <= 0) {
      e.hitCooldown = 750;
      this.enemyLunge(e);
      if (this.damagePlayer(e.contactDmg * PHASE_DEFS[this.phase].enemyDmgMult, e, 'melee')) return true;
      if (this.player.trinket && this.player.trinket.effect === 'thorns' && !e.shieldOn) {
        this.damageEnemy(e, e.contactDmg * this.player.trinket.reflectPct);
        if (e.hp <= 0) return false;
      }
    }

    // Summons keep low-value Asura flowing through a boss fight - pressure, and
    // Tejas charge for a player patient enough to farm it before committing.
    e.summonTimer -= delta;
    if (e.summonTimer <= 0) {
      // The price of waiting for tribute (2.26): every summons comes sooner than the last.
      e.summonEvery = Math.max(TRIBUTE.fastest, e.summonEvery * TRIBUTE.quicken);
      e.summonTimer = e.summonEvery;
      // Capped per boss: uncapped summons crowded the arena so the auto-attack (which
      // targets the nearest enemy) almost never reached the boss - one test fight ran
      // 3.4 minutes. The cap grows with tribute, so the patient player earns the crowd.
      const alive = this.enemies.filter(m => m.summonedBy === e.id).length;
      const cap = Math.min(7, 4 + Math.floor((e.tribute || 0) / 5));
      this.hint('tribute', `Bosses summon ${N.enemies.melee}. Each one you kill before the boss falls is tribute: ${this.tributeAt.item} earns an extra item, ${this.tributeAt.boon} a boon. But the summons speed up.`);
      if (this.enemies.length < 16 && alive < cap) {
        if (!e.slam) this.act(e, 0, 0, 0, 1);          // he calls them: the same strike, turned to face us
        const b = this.arenaBounds;
        for (let i = 0; i < 2; i++) {
          const a = Math.random() * Math.PI * 2;
          const m = this.spawnEnemyOfType('melee',
            Phaser.Math.Clamp(e.x + Math.cos(a) * (e.radius + 30), b.x + 16, b.right - 16),
            Phaser.Math.Clamp(e.y + Math.sin(a) * (e.radius + 30), b.y + 16, b.bottom - 16),
            this.depth, false);
          m.summonedBy = e.id;
          const weight = this.tributeWeight(e);
          if (weight > 1) { m.hp = m.maxHp = m.maxHp * weight; m.dmg *= weight; m.speed *= this.tributePace(e); }
        }
      }
    }

    if (!e.slam) {
      e.slamTimer -= delta;
      if (e.slamTimer <= 0) this.beginSlam(e);
    } else {
      e.slam.t += delta;
      if (!e.slam.touched && this.inSlam(e.slam, this.player.x, this.player.y)) e.slam.touched = true;   // for Read the Slam
      this.drawSlamTelegraph(e);
      if (e.slam.t >= e.slam.dur && this.resolveSlam(e)) return true;
    }
    return false;
  }

  beginSlam(e) {
    // A shielded (rooted) boss cannot walk to you, so it reaches out instead.
    const type = e.shieldOn ? 'scatter' : Phaser.Utils.Array.GetRandom(e.slamTypes);
    const b = this.arenaBounds;
    const clampX = x => Phaser.Math.Clamp(x, b.x + 10, b.right - 10);
    const clampY = y => Phaser.Math.Clamp(y, b.y + 10, b.bottom - 10);
    const slam = { type, t: 0, dur: SLAM[type].windup, x: e.x, y: e.y };
    const reach = this.slamReach();         // the whole shape grows together, gaps included

    if (type === 'circle') {
      slam.r = e.slamRadius * reach;
    } else if (type === 'line') {
      slam.a = Math.atan2(this.player.y - e.y, this.player.x - e.x);   // aimed where you stand NOW
      slam.len = 280 * reach; slam.w = 48 * reach;
    } else {
      const n = e.isMega ? 6 : 4;
      slam.blobs = [];
      for (let i = 0; i < n; i++) {
        const off = i === 0 ? 0 : Phaser.Math.Between(42, 118) * reach;   // one always on you
        const a = Math.random() * Math.PI * 2;
        slam.blobs.push({ x: clampX(this.player.x + Math.cos(a) * off),
                          y: clampY(this.player.y + Math.sin(a) * off), r: 36 * reach, delay: i * 90 });
      }
    }
    // Reusing telegraphGfx means killEnemy and run cleanup already destroy it.
    e.telegraphGfx = this.add.graphics().setDepth(Z.telegraph);
    e.slam = slam;
    // He draws back for as long as the warning runs, facing where it will land.
    if (type === 'line') this.act(e, 0, 0, Math.cos(slam.a), Math.sin(slam.a), true);
    else this.act(e, e.x, e.y, this.player.x, this.player.y, true);
    SLAM_WARN[type].forEach(([ms, rate]) => {
      if (ms) this.time.delayedCall(ms, () => this.sfx('slam-warn', { rate }));
      else this.sfx('slam-warn', { rate });
    });
    this.hint('slam', 'RED ZONE! A slam lands when the bright fill reaches the edge - get out of it!', true);
  }

  drawSlamTelegraph(e) {
    const s = e.slam, g = e.telegraphGfx;
    if (!g) return;
    const p = Math.min(1, s.t / s.dur);
    const warn = 0xff3b1f, pulse = 0.5 + 0.5 * Math.sin(s.t / 55);
    g.clear();
    // Read: faint = the danger zone, bright fill = how close it is to landing.
    // When the fill reaches the edge, it lands.
    const under = 0x1a0000;
    if (s.type === 'circle') {
      g.fillStyle(under, 0.34); g.fillCircle(s.x, s.y, s.r);
      g.fillStyle(warn, 0.12); g.fillCircle(s.x, s.y, s.r);
      g.fillStyle(warn, 0.26 + 0.14 * pulse); g.fillCircle(s.x, s.y, s.r * p);
      g.lineStyle(3, warn, 0.95); g.strokeCircle(s.x, s.y, s.r);
    } else if (s.type === 'line') {
      const quad = len => {
        const c = Math.cos(s.a), sn = Math.sin(s.a), hw = s.w / 2;
        return [s.x - sn*hw, s.y + c*hw,  s.x + c*len - sn*hw, s.y + sn*len + c*hw,
                s.x + c*len + sn*hw, s.y + sn*len - c*hw,  s.x + sn*hw, s.y - c*hw];
      };
      const draw = (pts, fill, a, colour = warn) => {
        g.beginPath(); g.moveTo(pts[0], pts[1]);
        for (let i = 2; i < 8; i += 2) g.lineTo(pts[i], pts[i+1]);
        g.closePath();
        if (fill) { g.fillStyle(colour, a); g.fillPath(); } else { g.lineStyle(3, colour, a); g.strokePath(); }
      };
      draw(quad(s.len), true, 0.34, under);
      draw(quad(s.len), true, 0.12);
      draw(quad(s.len * p), true, 0.26 + 0.14 * pulse);
      draw(quad(s.len), false, 0.95);
    } else {
      s.blobs.forEach(bl => {
        const bp = Phaser.Math.Clamp((s.t - bl.delay) / (s.dur - bl.delay), 0, 1);
        g.fillStyle(under, 0.34); g.fillCircle(bl.x, bl.y, bl.r);
        g.fillStyle(warn, 0.12); g.fillCircle(bl.x, bl.y, bl.r);
        g.fillStyle(warn, 0.26 + 0.14 * pulse); g.fillCircle(bl.x, bl.y, bl.r * bp);
        g.lineStyle(2.5, warn, 0.9); g.strokeCircle(bl.x, bl.y, bl.r);
      });
    }
  }

  // Returns true if the player died.
  resolveSlam(e) {
    const s = e.slam;
    e.slam = null;
    this.release(e);              // the blow itself: out of the wind-up and down
    e.squash = 140;
    if (e.telegraphGfx) { e.telegraphGfx.destroy(); e.telegraphGfx = null; }
    e.slamTimer = e.slamCooldown + Phaser.Math.Between(-250, 350);

    if (s.type === 'circle') this.slamFx(s.x, s.y, s.r, SLAM_FX);
    else if (s.type === 'line') this.lineImpact(s);
    else s.blobs.forEach(bl => this.slamFx(bl.x, bl.y, bl.r, SLAM_FX, 4));
    const hit = this.inSlam(s, this.player.x, this.player.y);   // one hit per slam, not per blob
    this.shake(230, SLAM[s.type].shake);
    this.sfx('slam-land', { rate: e.isMega ? 0.8 : 1 });
    if (!hit && s.touched && this.boonRank('readslam')) {
      this.slamBuffMs = BOONS.readslam.ms;
      this.showToast(`${N.boons.readslam[0].toUpperCase()} - 50% HARDER`, '#ffd23c');
    }
    return hit ? this.damagePlayer(this.slamDamage(SLAM[s.type].pct), e, 'slam') : false;
  }

  inSlam(s, px, py) {
    if (s.type === 'circle') return Math.hypot(px - s.x, py - s.y) <= s.r;
    if (s.type === 'line') {
      const dx = px - s.x, dy = py - s.y;
      const along = dx * Math.cos(s.a) + dy * Math.sin(s.a);
      const across = -dx * Math.sin(s.a) + dy * Math.cos(s.a);
      return along >= 0 && along <= s.len && Math.abs(across) <= s.w / 2;
    }
    return s.blobs.some(bl => Math.hypot(px - bl.x, py - bl.y) <= bl.r);
  }

  // Flat part scales with depth and sector; the percentage part scales with the
  // player's own max HP, which is what keeps slams dangerous against HP stacking.
  // Sector 1 only gets 60% of the percentage so a first Bakasura is a lesson, not a wall.
  slamDamage(pct) {
    const flat = (14 + this.depth * 1.6) * sectorDmgMult(this.sector);
    const pctScale = Math.min(1, 0.6 + 0.2 * (this.sector - 1));
    return (flat + this.player.maxHp * pct * pctScale) * PHASE_DEFS[this.phase].enemyDmgMult;
  }

  lineImpact(s) {
    const g = this.add.graphics().setDepth(Z.fx);
    const c = Math.cos(s.a), sn = Math.sin(s.a), hw = s.w / 2;
    g.fillStyle(0xff6a3d, 0.5);
    g.beginPath();
    g.moveTo(s.x - sn*hw, s.y + c*hw);
    g.lineTo(s.x + c*s.len - sn*hw, s.y + sn*s.len + c*hw);
    g.lineTo(s.x + c*s.len + sn*hw, s.y + sn*s.len - c*hw);
    g.lineTo(s.x + sn*hw, s.y - c*hw);
    g.closePath(); g.fillPath();
    this.tweens.add({ targets: g, alpha: 0, duration: 300, onComplete: () => g.destroy() });
    for (let t = 0.15; t < 1; t += 0.2) this.slamFx(s.x + c * s.len * t, s.y + sn * s.len * t, 20, SLAM_FX, 2);
  }

  // Bosses with an exposed weak core take full damage only in the matching phase.
  bossGated(e) { return !!e.isBoss && (!e.isSectorBoss || e.bossPhase === 'timing'); }
  weakScale(e) {
    return this.bossGated(e) && this.phase !== e.weakPhase ? (this.sector === 1 ? BOSS_RESIST.first : BOSS_RESIST.deeper) : 1;
  }

  // Milliseconds until `target` is the phase again; 0 if it is the phase now. Convergence
  // holds the cycle still, so its remaining time is added on.
  phaseWait(target) {
    let cur = this.phase, wait = this.phaseTimeLeft;
    if (this.inConvergence) {
      cur = this.savedPhase;
      if (cur === target) return this.phaseTimeLeft;
      wait += this.savedPhaseTimeLeft > 0 ? this.savedPhaseTimeLeft : PHASE_DEFS[cur].duration;
    } else if (cur === target) return 0;
    for (let i = PHASE_SEQUENCE.indexOf(cur), k = 0; k < PHASE_SEQUENCE.length; k++) {
      i = (i + 1) % PHASE_SEQUENCE.length;
      if (PHASE_SEQUENCE[i] === target) return wait;
      wait += PHASE_DEFS[PHASE_SEQUENCE[i]].duration;
    }
    return wait;
  }

  // The rule shown on the boss itself (requirements 2.6, 2026-10-04). It used to live in
  // one tip: match a small glow at his feet to the bar at the top. Now a resisting boss
  // is steel-grey under plates, with a countdown to when he opens; an open one flares in
  // his colour and says so. Nothing to read, nothing to match.
  updateBossGate(e, time) {
    if (!this.bossGated(e) || e.shieldOn) {
      if (e.gateLabel) e.gateLabel.setVisible(false);
      if (e.gateOpen === false) { const spr0 = this.enemySprites.get(e.id); if (spr0) spr0.clearTint(); }
      e.gateOpen = null;
      return;
    }
    if (!e.gateLabel) {
      e.gateLabel = this.add.text(e.x, e.y, '', { resolution: RES, fontSize: '10px', color: '#fffbef', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 3 }).setOrigin(0.5).setDepth(42);
      e.gateBorn = this.time.now;
    }
    const open = this.phase === e.weakPhase, col = PHASE_DEFS[e.weakPhase].color, spr = this.enemySprites.get(e.id);
    if (open !== e.gateOpen) {
      e.gateOpen = open;
      if (spr) { if (open) spr.clearTint(); else spr.setTint(0x8d94a6); }
      if (open) {
        // Not on top of the banner that announces him.
        this.time.delayedCall(this.time.now - e.gateBorn < 1500 ? 1500 : 0, () => {
          if (this.state === 'playing' && e.hp > 0 && e.gateOpen) this.showToast(`${e.baseName.toUpperCase()} IS VULNERABLE - STRIKE NOW`, '#' + col.toString(16).padStart(6, '0'));
        });
        this.sfx('tejas-bell', { vol: 0.6, rate: 1.25 });
      }
    }
    const secs = Math.max(1, Math.ceil((open ? this.phaseTimeLeft : this.phaseWait(e.weakPhase)) / 1000));
    const ab = this.arenaBounds, top = (e.nameLabel ? e.nameLabel.y : e.y - this.headUp(e) - 26) - 13;
    e.gateLabel.setVisible(true).setText(open ? `VULNERABLE  ${secs}s` : `RESISTS  \u00B7  opens in ${secs}s`).setColor(open ? '#ffe27a' : '#b9c2d6');
    const half = e.gateLabel.width / 2 + 2;
    e.gateLabel.setPosition(Phaser.Math.Clamp(e.x, ab.x + half, ab.right - half), Math.max((this.trackY ? this.trackY + this.camOff.y : ab.y) + 28, top));
  }

  // A hit that mostly glances off says so.
  resistFx(e) {
    if (this.silent || this.time.now - (e.resistAt || -1e9) < 480) return;
    e.resistAt = this.time.now;
    const t = this.add.text(e.x + Phaser.Math.Between(-18, 18), e.y - this.headUp(e) - 2, 'RESISTS', { resolution: RES, fontSize: '9px', color: '#b9c2d6', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 3 }).setOrigin(0.5).setDepth(41);
    this.tweens.add({ targets: t, y: t.y - 20, alpha: 0, duration: 620, ease: 'Cubic.easeOut', onComplete: () => t.destroy() });
    this.chipFx(e.x + Phaser.Math.Between(-10, 10), e.y - this.headUp(e) * 0.3, STEEL_FX, 2, 14);     // it glances off
  }

  // One door for all player-sourced damage to an enemy: shields, boss weak phases and
  // the Vritra transition live here, so the auto-attack and Tejas can never disagree.
  // Returns true if the enemy died.
  damageEnemy(e, dmg) {
    this.lullMs = 0;                 // a blow struck, whatever it does: the hero is in the fight (2.36)
    if (!e || e.hp <= 0) return false;
    if (e.shieldOn) { e.domeHit = 160; return false; }        // the dome flashes where it is struck
    const scale = this.weakScale(e);
    if (scale < 1) this.resistFx(e); else e.squash = 140;
    e.hp -= dmg * scale;
    // Vritra must pass through its shield phase: clamp a big hit at the 55% line
    // instead of letting it skip the second half of the fight.
    if (e.isMega && e.bossPhase === 'timing' && e.hp <= e.maxHp * 0.55) {
      e.hp = Math.max(e.hp, e.maxHp * 0.55);
      this.transitionMegaBossToShield(e);
      return false;
    }
    if (e.hp <= 0) { this.killEnemy(e); return true; }
    return false;
  }

  // ---------- RUN SETUP ----------
  startRun() {
    this.clearUI();
    this.closeOverlay();
    // The depth of the well this run goes down: the one picked on the title screen, or
    // the deepest that is open.
    const openDepth = Math.min(DEPTH_MAX, session.depthsWon + 1);
    this.tier = DEPTH_NOW = Phaser.Math.Clamp(session.depthPick || openDepth, 1, openDepth);
    this.windUsed = false; this.depthNews = null; this.perksEarned = [];
    this.strayIn = this.strayGap();
    this.time.paused = false;   // a run never starts frozen, whatever screen came before
    this.tweens.resumeAll();
    this.state = 'playing';

    // Satchel: items swapped out during this run, so a pickup no longer destroys
    // whatever you were holding. Run-scoped by design - carrying loot between runs
    // would undermine the Extract/Descend decision (2.5).
    this.inventory = [];

    // Boons (2.24): one after each wave, kept until the run ends.
    this.boons = {};
    this.rerollsLeft = BOON_REROLLS + (this.perkOn('reroll') ? 1 : 0);
    this.slamBuffMs = 0;   // Read the Slam
    this.powerShown = 0;
    this.boonQueue = [];       // boons earned and not yet chosen (2.24)
    this.lessonWait = [];      // lessons asked for and not yet shown (2.35)
    this.lullMs = 0;           // how long the hero has run without attacking anything (2.36)
    session.records.runs++;
    this.hunted = false; this.huntPace = 0; this.hunts = 0;
    this.lessonClosedAt = undefined;
    this.boonTribute = 0;
    this.choiceBoonTxt = null;
    this.lastShape = null;     // the last wave's shape (2.25)
    this.spawnGap = 380;
    this.stillMs = 0;      // Hold Your Ground
    this.moving = false;   // Strike on the Run

    this.tejas = 0;          // 0-100
    this.tejasActive = 0;    // ms of the active form remaining
    this.tejasTick = 0;

    // Cosmic Cycle state - continuous, learnable timer independent of waves
    this.phase = 'drift';
    this.phaseTimeLeft = PHASE_DEFS.drift.duration;
    this.convergenceCountdown = this.convergeEvery();
    this.inConvergence = false;
    this.savedPhase = null;
    this.savedPhaseTimeLeft = null;

    // Sector/depth state - runs are no longer capped at one 5-wave block
    this.sector = 1;
    this.depth = 0;

    // mood tint over the arena that shifts with the current phase (procedural, no art needed)
    const arena = this.arenaBounds;
    this.phaseTint = this.add.rectangle(arena.centerX, arena.centerY, arena.width, arena.height, PHASE_DEFS.drift.tint, PHASE_DEFS.drift.tintAlpha)
      .setDepth(Z.tint);   // over the floor, under telegraphs - it must never dim a slam warning

    const baseMaxHP = 100 * (1 + session.vitalityLevel * 0.10) + (this.perkOn('lungs') ? PERKS.lungs.n : 0);
    this.player = {
      x: arena.centerX, y: arena.centerY,
      maxHp: baseMaxHP, hp: baseMaxHP,
      speed: 200,
      flashTimer: 0,
      shieldCharge: 0,
      guardCharge: this.perkOn('guard') ? 1 : 0,     // Sentinel's Guard: one hit blocked on every level
      shieldRechargeTimer: 0,
      // `type` matters now that the satchel can hand this back to applyLoot: without
      // it the starting Dagger fell through to the trinket branch and equipped itself
      // into the wrong slot. Every dropped item already carries one.
      weapon: { type: 'weapon', name: WEAPON_EFFECTS.none.label, rarity: 'common', shots: 1, effect: 'none', dmg: 10 * (1 + session.powerLevel * 0.08), range: 130, atkSpeed: 500 },
      trinket: null,
      bloodShield: 0       // Blood Shield boon: soaks damage before health
    };
    this.playerFacing = 'front';
    this.playerAnim = { age: 1e6 };       // the state of the hero's motion (see animate)
    this.playerSprite = this.charSprite(CHARS.player, this.player.x, this.player.y, HERO_SIZE);
    // The ring stays a vector circle: it is the phase-colour tell, and must not inherit ship art.
    // Stance ring at the hero's feet, not a circle around the body - a ring around a
    // character sprite reads as a bubble, but on the floor it reads as a stance and
    // leaves the silhouette clean. This is the Cosmic Cycle phase tell.
    this.playerRing = this.add.ellipse(this.player.x, this.player.y + HERO_RING_DOWN, 34, 13, 0xffffff, 0)
      .setStrokeStyle(2, PHASE_DEFS.drift.color, 0.9);
    this.boonFx = this.add.graphics();   // tells for Hold Your Ground and Read the Slam

    // HP bar: over the hero's head, where the eyes already are in a fight (2026-10-06). It
    // used to run across the top of the screen. It follows him every frame (see update).
    const barX = this.player.x - HP_BAR.w / 2, barY = this.player.y - HERO_BAR_UP, barW = HP_BAR.w, barH = HP_BAR.h;
    this.hpBarBg = this.add.rectangle(barX, barY, barW, barH, 0x2a0f04).setOrigin(0,0.5).setStrokeStyle(1.5, 0x1a0600).setDepth(40);
    this.hpBarFill = this.add.rectangle(barX, barY, barW, barH, 0x2fbf71).setOrigin(0,0.5).setDepth(40);
    this.hpBarW = barW;
    this.bloodBar = this.add.rectangle(barX, barY - barH / 2 - 2, 0, 2, 0xffb0b0).setOrigin(0, 0.5).setDepth(40);   // Blood Shield, a line over the bar

    // Phase bar - big, prominent, drains as the current phase runs out. This replaces the old tiny dial.
    const pbarX = 14, pbarY = 36, pbarW = W - 28, pbarH = 18;
    this.phaseBarBg = this.add.rectangle(pbarX, pbarY, pbarW, pbarH, 0x2a0f04).setOrigin(0,0.5).setStrokeStyle(1, 0x6b4a2e);
    this.phaseBarFill = this.add.rectangle(pbarX, pbarY, pbarW, pbarH, PHASE_DEFS.drift.color).setOrigin(0,0.5);
    this.phaseBarLabel = this.add.text(pbarX + pbarW/2, pbarY, PHASE_DEFS.drift.label, { resolution: RES, fontSize: '11px', color: '#1a0600', fontStyle: 'bold' }).setOrigin(0.5);
    this.phaseBarW = pbarW;
    // The phase's sign, on a dark stud at the head of the bar: the bar is the sign's own colour.
    this.phaseStud = this.painted ? this.add.circle(pbarX + 13, pbarY, 11, 0x2a0f04, 1).setStrokeStyle(1.5, FORGE.bronze, 0.9) : null;
    this.phaseSign = this.painted ? this.icon(pbarX + 13, pbarY, ['hud-drift'], 14) : null;
    const phaseParts = [this.phaseBarBg, this.phaseBarFill, this.phaseBarLabel, this.phaseStud, this.phaseSign].filter(Boolean);
    this.fix(...phaseParts);
    if (ARENA_SCALE > 1) phaseParts.forEach(o => o.setDepth(Z.hud + 1));

    // Progress track - Dota-lane style: waves 1-5, gate at wave 3, ancient/flag at wave 5, moving marker
    const b = new Phaser.Geom.Rectangle(MARGIN, HUD_H + MARGIN, W - MARGIN*2, H - HUD_H - MARGIN*2);
    const trackY = b.y + 16;
    this.trackStartX = b.x + 34; this.trackEndX = b.right - 34;
    this.progressLine = this.add.rectangle((this.trackStartX+this.trackEndX)/2, trackY, this.trackEndX-this.trackStartX, 3, 0x6b4a2e);
    this.progressNodes = [];
    for (let i = 1; i <= 5; i++) {
      const nx = this.trackStartX + (this.trackEndX-this.trackStartX) * (i-1)/4;
      let node;
      if (i === GATEKEEPER_WAVE) node = this.add.rectangle(nx, trackY, 13, 13, 0x2a0f04).setAngle(45).setStrokeStyle(2, FORGE.flame);
      else if (i === 5) node = this.add.circle(nx, trackY, 10, 0x2a0f04).setStrokeStyle(2, 0xffd23c);
      else node = this.add.circle(nx, trackY, 7, 0x2a0f04).setStrokeStyle(2, 0x6b4a2e);
      this.progressNodes.push(node);
    }
    this.progressMarker = this.add.triangle(this.trackStartX, trackY+16, 0,0, -6,9, 6,9, 0xffd23c);
    this.trackY = trackY;
    this.sectorLabel = this.add.text(this.trackStartX - 14, trackY, N.stage[0] + '1', { resolution: RES, fontSize: '10px', color: '#8a7360', fontStyle: 'bold' }).setOrigin(1, 0.5);
    this.fix(this.progressLine, this.progressMarker, this.sectorLabel, ...this.progressNodes);
    // Arrows toward what is out of sight; only a wide arena has an out of sight.
    this.farFx = ARENA_SCALE > 1 ? this.fix(this.add.graphics().setDepth(44)) : null;

    this.atkTimer = 0;
    this.attackFx = this.add.graphics();
    this.buildSatchelUI();
    this.buildBoonButton();
    if (session.tejasUnlocked) this.buildTejasUI();

    this.enemies = [];
    this.enemySprites = new Map();
    this.goldPickups = [];
    this.projectiles = [];
    this.pickups = [];

    this.runGold = 0;
    this.runWater = 0;         // measures returned to the well this run
    this.lastWater = 0;        // and by the last boss to fall
    this.bossSlain = false;    // the final boss has fallen this run
    this.wave = 0;
    this.spawnQueue = [];
    this.spawnTimer = 0;

    this.cameraOn = true;
    this.aimCamera(true);
    this.hudOnTop(true);
    this.showSectorBanner(this.sector);
    this.nextWave();
    this.showPauseButton(true);
    if (this.perkOn('study')) this.queueBoon();
    this.playMusic('combat');
    this.time.delayedCall(900, () => this.hint('move', this.sys.game.device.input.touch
      ? 'Tap or drag to walk there. You attack on your own - just stay in range.'
      : 'Move with WASD or the arrow keys. You attack on your own - just stay in range.'));
  }

  showSectorBanner(n) {
    const style = (size, colour, bold) => ({ resolution: RES, stroke: '#2a0800', strokeThickness: 4, fontSize: size + 'px', color: colour, fontStyle: bold ? 'bold' : 'normal' });
    const line = (y, str, st) => this.fix(this.add.text(W/2, y, str, st).setOrigin(0.5).setAlpha(0));
    const t1 = line(H/2-46, (this.tier > 1 ? `DEPTH ${this.tier} · ` : '') + stageLabel(n).toUpperCase(), style(14, '#e8c690', true));
    const t2 = line(H/2-16, sectorTitle(n), style(28, '#ffd23c', true));
    const t3 = line(H/2+14, sectorSub(n), style(12, '#f0dcc0'));
    // Every level says how far the goal is.
    const boss = N.enemies.megaboss;
    const where = n < FINAL_SECTOR ? `${boss} waits ${levelsBelow(n)}` : n === FINAL_SECTOR ? `${boss} waits at the bottom of this ${N.stage.toLowerCase()}` : '';
    const t4 = line(H/2+38, where, style(12, '#ffb38a'));
    this.clearBanner();
    this.banner = [t1, t2, t3, t4];
    this.banner.forEach(t => {
      this.tweens.add({ targets: t, alpha: 1, duration: 300, hold: 1500, yoyo: true, onComplete: () => t.destroy() });
    });
  }

  // Destroying twice is safe: Phaser ignores destroy() on an object that is already gone.
  clearBanner() {
    (this.banner || []).forEach(t => { this.tweens.killTweensOf(t); t.destroy(); });
    this.banner = null;
  }

  updateProgressTrack() {
    const idx = Math.min(this.wave, 5) - 1;
    const nx = this.trackStartX + (this.trackEndX-this.trackStartX) * idx/4;
    this.tweens.add({ targets: this.progressMarker, x: nx, duration: 300, ease: 'Cubic.easeOut' });
    this.progressNodes.forEach((node, i) => {
      if (i < this.wave-1) node.fillColor = 0x2fbf71;
      else if (i === this.wave-1) node.fillColor = 0xffd23c;
    });
    if (this.sectorLabel) this.sectorLabel.setText(N.stage[0] + this.sector);
  }

  nextWave() {
    this.wave++;
    this.depth = (this.sector-1)*5 + this.wave;
    this.updateProgressTrack();

    if (this.wave > 5) {
      this.spawnSectorBoss();
      this.playMusic('boss');
      this.sfx('boom');
      const isMega = this.sector === MEGA_BOSS_SECTOR;
      this.showToast(isMega ? `${N.enemies.megaboss.toUpperCase()} AWAKENS` : `${N.enemies.sectorboss.toUpperCase()} STIRS`, '#fffbef');
      return;
    }

    if (this.wave === GATEKEEPER_WAVE) {
      this.spawnGatekeeper();
      this.sfx('boom', { vol: 0.7 });
      for (let i = 0; i < 3; i++) this.spawnQueue.push({}); // a little escort pressure alongside the boss
      this.spawnGap = 380;
      this.spawnTimer = 700;
      this.showToast(`${N.enemies.gatekeeper.toUpperCase()} BARS THE WAY`, '#fffbef');
      return;
    }

    this.buildWave();
  }

  // Fills the spawn queue for an ordinary wave (requirements 2.25). `force` names a shape;
  // only the tests pass it.
  buildWave(force) {
    // A first-ever run opens as it always did - two small waves of plain Asura - so the
    // tutorial tips have room. Everyone after that gets the full opening.
    const gentle = !force && !session.bestSector && this.sector === 1 && this.wave <= 2;
    // Deeper sectors field more enemies, not just tougher ones - HP scaling alone made
    // Sector 5 feel like Sector 1 with bigger numbers.
    // A wide arena's waves are larger by a number left to chance (WIDE), a first-ever opening excepted.
    this.waveExtra = ARENA_SCALE > 1 && !gentle && !force ? Phaser.Math.Between(WIDE.creeps[0], WIDE.creeps[1] + WIDE.creepsPerSector * (this.sector - 1)) : 0;
    const base = (gentle ? 3 : WAVE_BASE + (this.sector === 1 ? WAVE_OPENING : 0)) + this.wave + (this.sector - 1) + (this.tier >= 5 ? 2 : 0) + this.waveExtra;
    let shape = force || 'mixed';
    if (!force && !gentle) {
      const pool = Object.entries(WAVE_SHAPES).filter(([k, d]) => d.from <= this.depth && (k === 'mixed' || k !== this.lastShape));
      let r = Phaser.Math.Between(0, pool.reduce((sum, [, d]) => sum + d.weight, 0) - 1);
      shape = pool.find(([, d]) => (r -= d.weight) < 0)[0];
    }
    this.lastShape = shape;

    const q = [], add = (n, entry) => { for (let i = 0; i < n; i++) q.push(Object.assign({}, entry)); };
    if (shape === 'swarm') add(Math.round(base * 1.7), { type: 'melee', weak: true });       // many, each worth less
    else if (shape === 'pincer') {                                                           // two opposite walls at once
      const [a, b] = Phaser.Math.Between(0, 1) ? [0, 1] : [2, 3];
      for (let i = 0; i <= base; i++) q.push({ edge: i % 2 ? a : b });
    } else if (shape === 'archers') {
      const n = Math.max(2, Math.round(base * 0.45));
      add(base - n, { type: 'melee' }); add(n, { type: 'ranged' });
    } else if (shape === 'brute') {
      const n = this.sector >= 2 ? 2 : 1;
      add(n, { type: 'tank' }); add(Math.max(2, base - 2 * n), { type: 'melee' });
    } else if (shape === 'splitters') {
      const n = Math.round(base * 0.55);
      add(n, { type: 'splitter' }); add(base - n, { type: 'melee' });
    } else add(base, gentle ? { type: 'melee' } : {});
    if (shape === 'archers' || shape === 'splitters') Phaser.Utils.Array.Shuffle(q);

    // A stray: one enemy of a kind this wave does not already field, somewhere in its ranks.
    let toast = WAVE_SHAPES[shape].toast ? WAVE_SHAPES[shape].toast() : '';
    if (!force && !gentle && this.strayIn > 0 && --this.strayIn === 0) {
      const here = new Set(q.map(e => e.type).filter(Boolean)), fresh = STRAYS.kinds.filter(k => !here.has(k));
      const kind = Phaser.Utils.Array.GetRandom(fresh.length ? fresh : STRAYS.kinds);
      q.splice(Phaser.Math.Between(1, q.length), 0, { type: kind, stray: true });
      toast += (toast ? '  ·  ' : '') + `A STRAY ${N.enemies[kind].toUpperCase()}`;
      this.strayIn = this.strayGap();
    }

    this.spawnQueue = q;
    this.spawnGap = WAVE_SHAPES[shape].gap;
    this.spawnTimer = 0;
    if (toast) this.showToast(toast, '#ffb38a');
    return shape;
  }

  descend() {
    this.clearUI();
    this.sfx('descend');
    this.sector++;
    if (this.sector >= TEJAS_UNLOCK_SECTOR && !session.tejasUnlocked) {
      session.tejasUnlocked = true;
      saveSession();
      this.buildTejasUI();
      this.time.delayedCall(1600, () => this.showToast(`${N.supercharge.toUpperCase()} AWAKENS - kill to charge, then unleash`, '#ffd23c'));
    }
    this.wave = 0;
    this.rerollsLeft = BOON_REROLLS + (this.perkOn('reroll') ? 1 : 0);
    if (this.perkOn('guard')) this.player.guardCharge = 1;
    this.progressNodes.forEach(node => { node.fillColor = 0x2a0f04; });
    this.state = 'playing';
    this.setFloor(this.sector, true);
    this.playMusic('combat');
    this.showSectorBanner(this.sector);
    this.nextWave();
  }

  // Every enemy carries one now, not just tanks and bosses - you cannot read a
  // fight you cannot see the state of. Bars scale with the enemy so a swarm of
  // Asura reads as chatter and a boss bar reads as a wall.
  addHpBar(enemy) {
    const big = !!enemy.isBoss;
    const w = big ? Math.max(58, enemy.radius * 2.4) : Math.max(22, enemy.radius * 1.9);
    const h = big ? 6 : 3.5;
    const y = enemy.y - this.headUp(enemy) - (big ? 18 : 13);
    enemy.hpBarW = w;
    enemy.hpBarH = h;
    enemy.hpBarBg = this.add.rectangle(enemy.x, y, w, h, FORGE.deep, 0.8)
      .setStrokeStyle(1, 0x000000, 0.45);
    enemy.hpBarFill = this.add.rectangle(enemy.x - w/2, y, w, h, FORGE.gold).setOrigin(0, 0.5);
  }

  declutterLabels() {
    const shown = [];
    const boxOf = l => ({ x: l.x - l.width / 2, y: l.y - l.height / 2, w: l.width, h: l.height });
    const hit = (a, b) => a.x < b.x + b.w + 2 && b.x < a.x + a.w + 2 && a.y < b.y + b.h && b.y < a.y + a.h;
    // Bosses first so they always win; then nearest-to-player first, since that is the
    // enemy you most need to identify.
    const order = this.enemies.filter(e => e.nameLabel).sort((a, b) =>
      (b.isBoss - a.isBoss) ||
      (Math.hypot(a.x - this.player.x, a.y - this.player.y) - Math.hypot(b.x - this.player.x, b.y - this.player.y)));
    for (const e of order) {
      const box = boxOf(e.nameLabel);
      const clash = !e.isBoss && shown.some(b => hit(box, b));
      e.nameLabel.setVisible(!clash);
      if (!clash) shown.push(box);
    }
  }

  addNameLabel(enemy) {
    const big = !!enemy.isBoss;
    const role = enemy.isMega ? 'megaboss' : enemy.isSplit ? 'splitter' : enemy.type;   // both sector bosses share a type; a brood is named for its parent
    const name = CHAR_LABELS[role] || '';
    if (!name) return;
    const label = enemy.isElite ? name.toUpperCase() : name;
    enemy.baseName = label;
    enemy.nameLabel = this.add.text(enemy.x, 0, label, {
      resolution: RES,
      fontSize: big ? '11px' : '8px',
      color: enemy.isElite ? '#ffd23c' : (big ? '#fffbef' : '#f0dcc0'),
      fontStyle: big ? 'bold' : 'normal',
      stroke: '#2a0800', strokeThickness: 2.5
    }).setOrigin(0.5).setAlpha(big ? 1 : 0.9);
  }

  // A second, separate bar above the HP bar showing how much shield is left. It sits
  // apart on purpose: while it has any fill the HP bar underneath is unreachable, and
  // two stacked bars say that far faster than a toast does.
  addShieldBar(enemy) {
    const w = Math.max(58, enemy.radius * 2.4);
    enemy.shieldBarW = w;
    enemy.shieldBarBg = this.add.rectangle(enemy.x, enemy.y - this.headUp(enemy) - 27, w, 5, FORGE.deep, 0.8)
      .setStrokeStyle(1, 0x000000, 0.45);
    enemy.shieldBarFill = this.add.rectangle(enemy.x - w/2, enemy.y - this.headUp(enemy) - 27, w, 5, 0x9fd8ff)
      .setOrigin(0, 0.5);
  }

  spawnGatekeeper() {
    const b = this.arenaBounds, v = this.viewRect();        // he enters at the top of what is seen
    const x = ARENA_SCALE > 1 ? Phaser.Math.Clamp(v.centerX, b.x + 60, b.right - 60) : (b.x + b.right) / 2, y = Math.max(b.y, v.y) + 60;
    let weakPhase = Phaser.Utils.Array.GetRandom(PHASE_SEQUENCE);
    // The first Gatekeeper a player ever meets arrives open, and stays open for a good
    // while: they see what full damage looks like, then watch it fall away when the phase
    // turns. A rule learnt by contrast needs no reading.
    if (!session.gateTaught) {
      weakPhase = this.inConvergence ? this.savedPhase : this.phase;
      if (!this.inConvergence) this.phaseTimeLeft = Math.max(this.phaseTimeLeft, 8000);
      session.gateTaught = true; saveSession();
    }
    const hp = (220 + this.depth * 16) * sectorHpMult(this.sector);
    const enemy = {
      id: Phaser.Math.RND.uuid(),
      type: 'gatekeeper', isBoss: true, isSplit: false, isElite: false,
      x, y, hp, maxHp: hp,
      speed: 42, dmg: 0, radius: 26 * HIT,
      hitCooldown: 0, goldDrop: 60 + this.depth * 4,
      isRanged: false,
      weakPhase
    };
    this.armBoss(enemy, 'gatekeeper');
    this.enemies.push(enemy);
    enemy.char = CHARS.gatekeeper;
    enemy.facing = 'front';
    // The pool of his phase's colour at his feet, and what else stands round him, is drawn
    // each frame (drawBossFx).
    this.enemySprites.set(enemy.id, this.charSprite(enemy.char, x, y, this.stockSize(enemy)));
    this.addHpBar(enemy);
    this.addNameLabel(enemy);
    this.hint('core', `${N.enemies.gatekeeper} resists most of your damage outside his own phase. The timer over his head counts down to when he opens.`);
    return enemy;
  }

  spawnSectorBoss() {
    const isMega = this.sector === MEGA_BOSS_SECTOR;
    const b = this.arenaBounds, v = this.viewRect();
    const x = ARENA_SCALE > 1 ? Phaser.Math.Clamp(v.centerX, b.x + 60, b.right - 60) : (b.x + b.right) / 2, y = Math.max(b.y, v.y) + 70;
    const hp = (420 + this.depth * 26) * sectorHpMult(this.sector);
    const weakPhase = Phaser.Utils.Array.GetRandom(PHASE_SEQUENCE);
    const enemy = {
      id: Phaser.Math.RND.uuid(),
      type: 'sectorboss', isBoss: true, isSectorBoss: true, isMega: !!isMega,
      x, y, hp, maxHp: hp,
      speed: 34, dmg: 0, radius: (isMega ? 38 : 32) * HIT,
      hitCooldown: 0, goldDrop: isMega ? 260 : 130 + this.depth * 3,
      isRanged: false,
      weakPhase,
      bossPhase: isMega ? 'timing' : 'shielded',
      shieldOn: !isMega,
      keyAddIds: []
    };
    this.armBoss(enemy, isMega ? 'megaboss' : 'sectorboss');
    this.enemies.push(enemy);

    enemy.char = isMega ? CHARS.megaboss : CHARS.sectorboss;
    enemy.facing = 'front';
    const spr = this.charSprite(enemy.char, x, y, this.stockSize(enemy));
    this.enemySprites.set(enemy.id, spr);
    this.addHpBar(enemy);
    this.addNameLabel(enemy);

    // Two stars of his gold go round Vritra on the floor, behind him and in front by turns.
    if (isMega && !this.silent) enemy.orbiters = [0, 1].map(() => this.fxPiece('fx_star', x, y, 20, [GILT_FX[0], VRITRA_FX[0]]));

    if (enemy.bossPhase !== 'timing') this.spawnShieldAdds(enemy);
    return enemy;
  }

  spawnShieldAdds(boss) {
    boss.keyAddIds = [];
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const cx = Phaser.Math.Clamp(boss.x + Math.cos(angle) * 60, this.arenaBounds.x+16, this.arenaBounds.right-16);
      const cy = Phaser.Math.Clamp(boss.y + Math.sin(angle) * 60, this.arenaBounds.y+16, this.arenaBounds.bottom-16);
      const add = this.spawnEnemyOfType('melee', cx, cy, this.depth, false);
      add.isKeyAdd = true;
      add.ownerBossId = boss.id;
      boss.keyAddIds.push(add.id);
      // An anchor glows gold, is named for what it is, and is chained to the dome it holds
      // up (gild, drawDome): "this one is an anchor, kill it".
      this.gild(add);
      if (add.nameLabel) add.nameLabel.setText('ANCHOR').setColor('#ffd23c');
    }
    boss.shieldMax = boss.keyAddIds.length;       // the dome itself is drawn each frame (drawBossFx)
    this.addShieldBar(boss);
    this.time.delayedCall(900, () => this.showToast('DESTROY THE ANCHORS', '#9fd8ff'));
    this.hint('shield', `Shielded - no damage gets through. Kill the gold-glowing ${N.enemies.melee} anchoring it and the shield breaks.`);
  }

  transitionMegaBossToShield(boss) {
    boss.bossPhase = 'shielded';
    boss.shieldOn = true;
    this.showToast(`${N.enemies.megaboss.toUpperCase()} COILS - DESTROY THE ANCHORS`, '#9fd8ff');
    this.sfx('toll', { rate: 1.3 });
    this.spawnShieldAdds(boss);
  }

  // entry: what the wave's shape asked for - a type, a wall to enter by, a weaker body.
  // Anything it leaves out is rolled as before.
  spawnEnemy(entry) {
    const want = entry && typeof entry === 'object' ? entry : {};
    const type = want.type || pickEnemyType(this.depth);
    const edge = want.edge !== undefined ? want.edge : Phaser.Math.Between(0,3);
    const b = this.spawnRect();
    let x,y;
    if (edge===0) { x = Phaser.Math.Between(b.x, b.right); y = b.y; }
    else if (edge===1) { x = Phaser.Math.Between(b.x, b.right); y = b.bottom; }
    else if (edge===2) { x = b.x; y = Phaser.Math.Between(b.y, b.bottom); }
    else { x = b.right; y = Phaser.Math.Between(b.y, b.bottom); }

    const e = this.spawnEnemyOfType(type, x, y, this.depth, false);
    if (want.weak) { e.hp = e.maxHp = e.maxHp * 0.55; e.speed *= 1.12; e.goldDrop = Math.max(1, Math.round(e.goldDrop * 0.6)); }
    return e;
  }

  spawnEnemyOfType(type, x, y, wave, isSplit, isElite) {
    const def = ENEMY_TYPES[type];
    const eliteMult = isElite ? 2.6 : 1;
    const hp = (16 + wave * 7) * def.hpMult * (isSplit ? 0.4 : 1) * eliteMult * sectorHpMult(this.sector);
    const enemy = {
      id: Phaser.Math.RND.uuid(),
      type, isSplit: !!isSplit, isElite: !!isElite,
      x, y, hp, maxHp: hp,
      speed: (62 + wave * 5) * def.speedMult * (isSplit ? 1.15 : 1) * (this.tier >= 2 ? 1.12 : 1),
      dmg: (8 + wave * 1.4) * def.dmgMult * (isElite ? 1.5 : 1) * sectorDmgMult(this.sector),
      radius: ((isSplit ? Math.max(7, def.radius - 4) : def.radius) + (isElite ? 6 : 0)) * HIT,     // the table gives the stock circle
      hitCooldown: 0,
      goldDrop: Math.ceil((4 + wave) * (isSplit ? 0.35 : 1) * (isElite ? 4 : 1)),
      isRanged: !!def.isRanged,
      preferredRange: def.preferredRange || 0,
      fireTimer: def.fireInterval ? Phaser.Math.Between(300, def.fireInterval) : 0,
      fireInterval: def.fireInterval || 0,
      projSpeed: def.projSpeed || 0,
      projDmg: def.projDmgMult ? (8 + wave * 1.4) * def.projDmgMult * sectorDmgMult(this.sector) : 0,
      splitsOnDeath: !!def.splitsOnDeath && !isSplit
    };
    this.enemies.push(enemy);
    // Characters are now visually distinct by design (goblin / chieftain / brute / rogue),
    // so type no longer needs a tint to be readable - and tinting detailed art just
    // muddies it. Elites keep a gold wash because that IS a state, not an identity.
    // What a Bloodseed splits into is drawn as a Bloodseed, small: it is its own brood.
    enemy.char = isSplit ? CHARS.splitter : CHARS[type];
    enemy.facing = 'front';
    const spr = this.charSprite(enemy.char, x, y, this.stockSize(enemy));
    this.enemySprites.set(enemy.id, spr);
    if (isElite) this.gild(enemy);
    this.addHpBar(enemy);
    this.addNameLabel(enemy);
    if (type === 'ranged') this.hint('ranged', `${N.enemies.ranged} shoot bolts from range. Keep moving sideways to dodge them.`);
    return enemy;
  }

  spawnElite() {
    const b = this.spawnRect();
    const edge = Phaser.Math.Between(0,3);
    let x,y;
    if (edge===0) { x = Phaser.Math.Between(b.x, b.right); y = b.y; }
    else if (edge===1) { x = Phaser.Math.Between(b.x, b.right); y = b.bottom; }
    else if (edge===2) { x = b.x; y = Phaser.Math.Between(b.y, b.bottom); }
    else { x = b.right; y = Phaser.Math.Between(b.y, b.bottom); }
    this.spawnEnemyOfType('tank', x, y, this.depth, false, true);
  }

  // ---------- COMBAT ----------
  // Centralizes all damage TO the player so Aegis (shield block) applies consistently everywhere,
  // regardless of whether the source is contact, a boss slam, or a projectile.
  // kind: 'melee' | 'ranged' | 'slam'. source: the enemy that struck, when there is one.
  damagePlayer(amount, source, kind) {
    // Brief invulnerability after a melee/ranged hit. Without it five Asura touching you
    // landed five hits in the same instant - a one-frame death that reads as unfair, not
    // hard. Slams are exempt: they are telegraphed, so standing in one should always cost.
    if (kind !== 'slam' && this.player.iframes > 0) return false;
    if (this.hunted && kind !== 'slam' && source) this.endHunt();     // caught: blocked or not, the chase is over
    if (this.player.guardCharge > 0) {
      this.player.guardCharge--;
      if (kind !== 'slam') this.player.iframes = IFRAMES_MS;
      this.showToast(`${PERKS.guard.name.toUpperCase()} BLOCKED`, '#e2b6ff');
      this.sfx('kavach');
      this.impactBurst(this.player.x, this.player.y, PERK_TINT);
      return false;
    }
    if (this.player.shieldCharge > 0) {
      this.player.shieldCharge--;
      this.showToast(`${TRINKET_EFFECTS.aegis.label.toUpperCase()} BLOCKED`, '#4dd0ff');
      this.sfx('kavach');
      this.impactBurst(this.player.x, this.player.y, 0x9fd8ff);
      return false;
    }
    amount *= (1 - this.boonRank('hide') * BOONS.hide.n) * (this.boonRank('greed') ? 1 + BOONS.greed.hurt : 1) * (this.perkOn('scale') ? 1 - PERKS.scale.n : 1);
    if (this.player.bloodShield > 0) {
      const soak = Math.min(this.player.bloodShield, amount);
      this.player.bloodShield -= soak;
      amount -= soak;
      this.impactBurst(this.player.x, this.player.y, 0xff8080);
      if (amount <= 0) { if (kind !== 'slam') this.player.iframes = IFRAMES_MS; return false; }
    }
    this.player.hp -= amount;
    if (kind !== 'slam') this.player.iframes = IFRAMES_MS;
    // The existing hit flicker now lasts exactly as long as the invulnerability, so the
    // player can read "I'm safe for a moment" off the hero himself.
    this.player.flashTimer = Math.max(150, kind !== 'slam' ? IFRAMES_MS : 0);
    this.hitFeedback(amount, source, kind);
    if (this.player.hp > 0 && this.player.hp < this.player.maxHp * 0.3) {
      this.hint('lowhp', `Low HP! Keep your distance. Beating a ${N.stage.toLowerCase()}'s boss restores ${Math.round(this.clearHeal() * 100)}% of your health.`);
    }
    if (this.player.hp <= 0 && this.perkOn('wind') && !this.windUsed) {      // Second Wind: once a run
      this.windUsed = true;
      this.player.hp = Math.round(this.player.maxHp * PERKS.wind.n);
      this.player.iframes = 1500;
      this.showToast('SECOND WIND', '#e2b6ff');
      this.sfx('kavach');
      return false;
    }
    if (this.player.hp <= 0) {
      this.player.hp = 0;
      this.endRun(false);
      return true;
    }
    return false;
  }

  killEnemy(enemy) {
    const spr = this.enemySprites.get(enemy.id);
    if (spr && spr.visible && !this.silent) this.deathFx(enemy, spr);      // it comes apart rather than blinking out
    if (spr) spr.destroy();
    this.enemySprites.delete(enemy.id);
    if (enemy.gateLabel) { enemy.gateLabel.destroy(); enemy.gateLabel = null; }
    this.dropRound(enemy);
    if (enemy.hpBarBg) { enemy.hpBarBg.destroy(); enemy.hpBarFill.destroy(); }
    if (enemy.shieldBarBg) { enemy.shieldBarBg.destroy(); enemy.shieldBarFill.destroy(); }
    if (enemy.nameLabel) enemy.nameLabel.destroy();
    if (enemy.telegraphGfx) { enemy.telegraphGfx.destroy(); enemy.telegraphGfx = null; }
    this.enemies.splice(this.enemies.indexOf(enemy), 1);

    this.addGold(enemy.goldDrop);
    this.gainTejas(enemy);
    session.records.slain++;
    // Tribute counts only while its boss still stands. It is paid for as long as he does:
    // what keeps a boss from being an endless safe supply is its weight (tributeWeight).
    const lord = enemy.summonedBy ? this.enemies.find(e => e.id === enemy.summonedBy) : null;
    if (lord) this.addTribute(lord);
    if (this.boonRank('hunger') && this.phase === 'eclipse') this.healPlayer(BOONS.hunger.n);
    if (enemy.poison && this.boonLive('rot')) this.spreadPoison(enemy);
    if (enemy.isMega) { this.sfx('boss-fall'); this.sfx('toll', { rate: 0.8 }); }
    else if (enemy.isSectorBoss) this.sfx('boss-fall');
    else if (enemy.isBoss) { this.sfx('gate-open'); this.sfx('boom', { vol: 0.6 }); }
    else this.sfx('enemy-die', { rate: enemy.type === 'tank' ? 0.75 : (enemy.isSplit ? 1.25 : 1) });

    // if this was a shield anchor, check whether its boss's shield should now break
    if (enemy.isKeyAdd && enemy.ownerBossId) {
      const boss = this.enemies.find(e => e.id === enemy.ownerBossId);
      if (boss) {
        boss.keyAddIds = boss.keyAddIds.filter(id => id !== enemy.id);
        if (!this.silent) this.snapFx(enemy, boss);
        if (boss.keyAddIds.length === 0 && boss.shieldOn) {
          boss.shieldOn = false;
          boss.bossPhase = 'active';
          // The dome flies apart rather than snapping off: the break is the payoff for
          // the anchor puzzle and deserves to be seen.
          if (!this.silent) this.domeBreakFx(boss);
          if (boss.shieldBarBg) {
            boss.shieldBarBg.destroy(); boss.shieldBarFill.destroy();
            boss.shieldBarBg = null; boss.shieldBarFill = null;
          }
          this.showToast('THE SHIELD BREAKS', '#2fbf71');
          this.sfx('shield-break');
        }
      }
    }

    if (enemy.splitsOnDeath) {
      for (let i = 0; i < 2; i++) {
        const ox = enemy.x + (i ? 1 : -1) * Phaser.Math.Between(11, 22);      // one to each side, so that two can be seen
        const oy = enemy.y + Phaser.Math.Between(-18, 18);
        // Thrown out of the one that fell: drawn from where it stood to where they land.
        this.spawnEnemyOfType('melee', ox, oy, this.depth, true).hatch = { t: 0, dur: 280, dx: enemy.x - ox, dy: enemy.y - oy };
      }
      if (!this.silent) this.splitFx(enemy.x, enemy.y);
    }

    // Sector/Mega Boss defeat: skip normal wave-clear flow entirely, trigger the Extract/Descend choice instead
    if (enemy.isSectorBoss) {
      // Beating the sector boss restores part of your health. HP otherwise carries over,
      // and the bot showed players arriving at Sector 2 on 19-45% HP - nobody presses
      // Descend on 20% HP, which is the exact decision 1.6 depends on.
      const heal = Math.round(this.player.maxHp * this.clearHeal());
      const before = this.player.hp;
      this.player.hp = Math.min(this.player.maxHp, this.player.hp + heal);
      const gained = Math.round(this.player.hp - before);
      if (gained > 0 && settings.dmgNumbers) {
        const n = this.add.text(this.player.x, this.player.y - 30, `+${gained}`, { resolution: RES, fontSize: '15px',
          color: '#5fe08a', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 3 }).setOrigin(0.5).setDepth(40);
        this.tweens.add({ targets: n, y: n.y - 30, alpha: 0, duration: 1100, onComplete: () => n.destroy() });
      }
      this.spawnLootPickup(enemy.x, enemy.y, 'epic');
      this.spawnLootPickup(enemy.x + 24, enemy.y, 'epic');
      const tribute = enemy.tribute || 0;
      if (tribute >= this.tributeAt.item) this.spawnLootPickup(enemy.x - 24, enemy.y, 'epic');
      this.showToast(`${N.enemies[enemy.isMega ? 'megaboss' : 'sectorboss'].toUpperCase()} FALLS`, '#2fbf71');
      if (enemy.isMega) { this.bossSlain = true; session.wins = (session.wins || 0) + 1; }
      this.bossRewards(enemy);
      saveSession();
      if (tribute >= this.tributeAt.boon) this.queueBoon(tribute);            // tribute of 10 or more is paid as a boon
      this.time.delayedCall(1000, () => { if (this.state === 'playing') this.showSectorClearChoice(enemy.isMega); });
      return;
    }

    const waveJustCleared = this.enemies.length === 0 && this.spawnQueue.length === 0;

    if (enemy.isBoss) {
      this.spawnLootPickup(enemy.x, enemy.y, 'epic');
      if ((enemy.tribute || 0) >= this.tributeAt.item) this.spawnLootPickup(enemy.x + 24, enemy.y, 'epic');
      if ((enemy.tribute || 0) >= this.tributeAt.boon) this.queueBoon(enemy.tribute);
      this.showToast('THE GATE OPENS', '#2fbf71');
      this.bossRewards(enemy);
    } else if (enemy.isElite) {
      this.spawnLootPickup(enemy.x, enemy.y, 'epic');
    } else if (waveJustCleared || Phaser.Math.Between(0,100) < (this.perkOn('eye') ? PERKS.eye.n : 18)) {
      this.spawnLootPickup(enemy.x, enemy.y);
    }
    if (waveJustCleared) this.afterWaveClear();
  }

  spawnLootPickup(x, y, forceRarity = null) {
    const isWeapon = Phaser.Math.Between(0,1) === 0;
    const phaseBoost = (PHASE_DEFS[this.phase] && PHASE_DEFS[this.phase].lootBoost) || 0;
    // ~25% of non-forced drops are Unidentified - you don't know what you're getting until you grab it
    const isMystery = !forceRarity && Phaser.Math.Between(0,100) < 25;
    const rarity = forceRarity || rollRarity(phaseBoost + (isMystery ? 10 : 0));
    const r = RARITY[rarity];

    let item;
    if (isWeapon) {
      // higher rarity = chance at extra simultaneous shots (Contra-style spread), not just bigger numbers
      let shots = 1;
      if (rarity === 'rare') shots = Phaser.Math.Between(0,100) < 50 ? 2 : 1;
      if (rarity === 'epic') shots = Phaser.Math.Between(2,3);

      const effectKey = pickWeaponEffect(this.sector);
      // Multi-shot is already shown as xN in the HUD, so it stays out of the name.
      item = {
        type: 'weapon', rarity, shots, effect: effectKey,
        name: `${r.label} ${WEAPON_EFFECTS[effectKey].label}`,
        dmg: 10 * r.mult * (1 + session.powerLevel*0.08),
        range: 130 + (r.mult-1)*20,
        atkSpeed: Math.max(180, 500 - (r.mult-1)*90),
        lifestealPct: effectKey === 'vampiric' ? 0.10 * r.mult : 0,
        poisonDmg: effectKey === 'venom' ? 3 * r.mult : 0,
        chainPct: effectKey === 'chain' ? Math.min(0.8, 0.4 * r.mult) : 0,
        executeBonusMult: effectKey === 'executioner' ? (rarity === 'common' ? 1.5 : rarity === 'rare' ? 2 : 2.5) : 1
      };
    } else {
      const effectKey = pickTrinketEffect(this.sector);
      item = {
        type: 'trinket', rarity, effect: effectKey,
        name: `${r.label} ${TRINKET_EFFECTS[effectKey].label}`,
        hpBonus: effectKey === 'vitality' ? 20 * r.mult : 0,
        rechargeMs: effectKey === 'aegis' ? Math.round(10000 / r.mult) : 0,
        reflectPct: effectKey === 'thorns' ? Math.min(0.6, 0.2 * r.mult) : 0,
        speedBonus: effectKey === 'swift' ? Math.round(25 * r.mult) : 0,
        regenPerSec: effectKey === 'regen' ? +(1.5 * r.mult).toFixed(2) : 0
      };
    }

    const px = Phaser.Math.Clamp(x, this.arenaBounds.x+16, this.arenaBounds.right-16);
    const py = Phaser.Math.Clamp(y, this.arenaBounds.y+16, this.arenaBounds.bottom-16);

    const dispColor = isMystery ? MYSTERY_COLOR : r.color;
    // Icon tells you WHAT dropped, tint tells you how good it is. Unidentified drops
    // deliberately show the same blank sigil regardless of contents - that ambiguity
    // is the whole incentive to risk walking over one.
    // An item not yet known is the same closed bundle whatever is in it.
    const sprite = this.icon(px, py, isMystery ? ['loot-mystery', 'icon_mystery', dispColor] : lootIcon(item), 19);
    if (this.painted) {
      // A painted item is marked out from a painted floor: a shadow where it hovers, and
      // a garland in its metal (violet for the unknown). They go when the item goes.
      const mark = this.add.graphics().setDepth(Z.fx);
      mark.fillStyle(0x140600, 0.38); mark.fillEllipse(px, py + 13, 24, 9);
      this.facetRing(mark, px, py + 13, 13, [dispColor, dim(dispColor, 0.55)], 0.95, 0, 3);
      // And a pale outline, its own shape a little larger behind it: copper on the
      // terracotta of level 1 or the brown of level 3 is otherwise hard to find.
      const rim = this.add.image(px, py, sprite.texture.key, sprite.frame.name).setDisplaySize(sprite.displayWidth * 1.17, sprite.displayHeight * 1.17)
        .setTintFill(0xfff1cf).setAlpha(0.9).setDepth(-0.001);
      this.tweens.add({ targets: rim, y: py - 6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });       // it hovers with the item
      if (isMystery) this.tweens.add({ targets: rim, alpha: 0.4, duration: 350, yoyo: true, repeat: -1 });
      sprite.once('destroy', () => { mark.destroy(); this.tweens.killTweensOf(rim); rim.destroy(); });
    }
    this.tweens.add({ targets: sprite, y: py-6, duration: 600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    if (isMystery) {
      this.tweens.add({ targets: sprite, alpha: 0.45, duration: 350, yoyo: true, repeat: -1 });
    }
    const label = this.add.text(px, py-20, isMystery ? '???' : item.name, { resolution: RES, fontSize: '9px', color: isMystery ? '#d2b8ff' : '#fffbef', stroke: '#2a0800', strokeThickness: 2.5 }).setOrigin(0.5);
    { const b = this.arenaBounds, half = label.width / 2;
      label.x = Phaser.Math.Clamp(px, b.x + half + 4, b.right - half - 4); }   // never over the border

    this.pickups.push({ x: px, y: py, item, sprite, label, isMystery });
    if (isMystery) this.hint('mystery', "Violet ??? is unidentified - you won't know what it is until you grab it. It usually pays.");
    else this.hint('loot', 'Loot! Walk over it to equip. Copper, then silver, then gold: finer metal, stronger item.');
  }

  // Every wave cleared before a boss earns a boon (2.24), to be chosen whenever the
  // player likes. The next wave comes on after a short beat.
  afterWaveClear() {
    this.addGold(15 + this.depth * 4);
    this.sfx('wave-clear');
    this.queueBoon();
    this.time.delayedCall(400, () => { if (this.state === 'playing') this.nextWave(); });
  }

  // ---------- END OF RUN ----------
  endRun(victory, abandoned) {
    this.state = 'summary';
    if (this.boonFx) this.boonFx.clear();
    this.clearHints();
    this.clearBanner();
    this.showPauseButton(false);
    if (victory) this.sfx('coins'); else this.sfx('toll', { rate: 0.75 });
    this.playMusic('hub');
    const banked = bankedGold(this.runGold, victory);
    session.metaGold += banked;
    session.records.bestHaul = Math.max(session.records.bestHaul, banked);
    if (this.sector > (session.bestSector || 0)) session.bestSector = this.sector;
    saveSession();

    // How close the player came: the strongest reason to try again.
    const bossName = N.enemies.megaboss, where = `${sectorTitle(this.sector)}, ${stageLabel(this.sector).toLowerCase()}`;
    const finalBoss = this.enemies.find(e => e.isMega);
    let near;
    if (this.bossSlain) near = `${bossName} is slain.`;
    else if (finalBoss) near = `${bossName} had ${Math.max(1, Math.round(100 * finalBoss.hp / finalBoss.maxHp))}% health left.`;
    else if (this.sector === FINAL_SECTOR) near = `${bossName} was waiting at the bottom of this ${N.stage.toLowerCase()}.`;
    else near = `${bossName} waits ${levelsBelow(this.sector)}.`;

    this.clearUI();
    const say = (y, str, size, colour) => this.uiObjects.push(this.add.text(W/2, y, str,
      { resolution: RES, fontSize: size + 'px', color: colour }).setOrigin(0.5));
    this.uiPanel(W/2, H/2, W-50, 336, victory ? 0x2fbf71 : 0xff5c5c);
    this.uiObjects.push(this.add.text(W/2, H/2-132,
      victory ? (this.bossSlain ? `${bossName.toUpperCase()} SLAIN` : 'EXTRACTED SAFELY') : (abandoned ? 'RUN ABANDONED' : 'YOU FELL'),
      { resolution: RES, fontSize: '24px', color: victory ? '#2fbf71' : '#ff5c5c', fontStyle: 'bold' }).setOrigin(0.5));
    say(H/2-96, victory ? `You surfaced from ${where}.` : (abandoned ? `You turned back in ${where}.` : `You fell in ${where}.`), 13, '#fffbef');
    say(H/2-74, near, 13, this.bossSlain ? '#9fe8d8' : '#ffb38a');
    if (victory) {
      say(H/2-40, `${N.currency} banked: ${banked}`, 15, '#ffd23c');
    } else {
      say(H/2-44, `${N.currency} gathered: ${this.runGold}`, 15, '#ffd23c');
      say(H/2-22, abandoned ? `Half is forfeit. You keep ${banked}.` : `Half is lost in the fall. You keep ${banked}.`, 12, '#ff9a80');
    }
    say(H/2+4, `Treasury: ${session.metaGold} ${N.currency}`, 13, '#c8a96e');
    say(H/2+30, this.runWater > 0 ? `Water returned: +${this.runWater}  ·  ${wellLine()}` : `No water returned  ·  ${wellLine()}`, 12, '#9fe8d8');
    const got = this.perksEarned || [];       // a perk is worth a visit to the Profile
    if (got.length) say(H/2+52, got.length > 1 ? `${got.length} perks earned  ·  choose which to wear on your Profile` : `Perk earned: ${PERKS[got[0]].name}  ·  see your Profile`, 12, '#e2b6ff');

    this.makeButton(W/2, H/2+88, 200, 48, 'Continue to Hub', BTN.primary, () => {
      // clean up run visuals
      if (this.playerSprite) { this.playerSprite.destroy(); this.playerSprite = null; }
      if (this.playerRing) this.playerRing.destroy();
      if (this.boonFx) { this.boonFx.destroy(); this.boonFx = null; }
      if (this.hpBarBg) this.hpBarBg.destroy();
      if (this.hpBarFill) this.hpBarFill.destroy();
      if (this.bloodBar) this.bloodBar.destroy();
      if (this.phaseTint) this.phaseTint.destroy();
      if (this.phaseBarBg) this.phaseBarBg.destroy();
      if (this.phaseBarFill) this.phaseBarFill.destroy();
      if (this.phaseBarLabel) this.phaseBarLabel.destroy();
      if (this.phaseStud) { this.phaseStud.destroy(); this.phaseSign.destroy(); this.phaseStud = this.phaseSign = null; }
      if (this.progressLine) this.progressLine.destroy();
      if (this.progressNodes) this.progressNodes.forEach(n => n.destroy());
      if (this.progressMarker) this.progressMarker.destroy();
      if (this.sectorLabel) this.sectorLabel.destroy();
      if (this.farFx) { this.farFx.destroy(); this.farFx = null; }
      if (this.weaponText) this.weaponText.setText('');
      this.destroySatchelUI();
      this.destroyBoonButton();
      if (this.powerText) this.setPower('');
      this.destroyTejasUI();
      if (this.attackFx) { this.attackFx.destroy(); this.attackFx = null; }   // was leaking one per run
      // Cancel every timer the run scheduled. Without this a callback queued in the
      // last moments of a run (e.g. the 80ms beam clear) fired AFTER cleanup and hit a
      // destroyed object - found by tools/playtest-bot.js.
      this.time.removeAllEvents();
      this.enemySprites.forEach(s => s.destroy());
      if (this.enemies) this.enemies.forEach(e => {
        if (e.telegraphGfx) e.telegraphGfx.destroy();
        this.dropRound(e);
        if (e.hpBarBg) { e.hpBarBg.destroy(); e.hpBarFill.destroy(); }
        if (e.shieldBarBg) { e.shieldBarBg.destroy(); e.shieldBarFill.destroy(); }
        if (e.nameLabel) e.nameLabel.destroy();
        if (e.gateLabel) e.gateLabel.destroy();
      });
      this.goldPickups.forEach(g => g.sprite && g.sprite.destroy());
      if (this.projectiles) this.projectiles.forEach(p => { if (p.sprite) p.sprite.destroy(); if (p.halo) p.halo.destroy(); });
      if (this.pickups) this.pickups.forEach(pk => { pk.sprite.destroy(); pk.label.destroy(); });
      this.showHub();
    });
    // The end of a run is when a player has something to say.
    this.makeButton(W/2, H/2+136, 150, 24, 'Send feedback', BTN.off, () => Feedback.open(), { size: 11, color: '#c8a96e' });
    this.raiseUI();
  }

  // ---------- MAIN LOOP ----------
  update(time, delta) {
    Music.tick(delta);
    if (this.menu) this.drawWell(time);
    if (this.state === 'lesson') this.breatheLesson();
    if (this.state !== 'playing') return;
    this.pollLessons();
    if (this.state !== 'playing') return;   // a lesson has stopped the fight
    const dt = delta / 1000;

    if (this.tejasBtn) {
      if (this.tejasKeys && (Phaser.Input.Keyboard.JustDown(this.tejasKeys.SPACE) ||
                             Phaser.Input.Keyboard.JustDown(this.tejasKeys.E))) this.activateTejas();
      this.updateTejas(delta, dt);
      if (this.state !== 'playing') return;   // a Tejas pulse can end the sector
    }

    // --- Cosmic Cycle: advance phase timer, trigger Convergence on schedule ---
    if (!this.inConvergence) {
      this.convergenceCountdown -= delta;
      this.phaseTimeLeft -= delta;
      if (this.convergenceCountdown <= 0) {
        this.savedPhase = this.phase;
        this.savedPhaseTimeLeft = this.phaseTimeLeft;
        this.inConvergence = true;
        this.phase = 'convergence';
        this.phaseTimeLeft = PHASE_DEFS.convergence.duration;
        this.convergenceCountdown = this.convergeEvery();
        this.showToast(`${PHASE_DEFS.convergence.label} - an elite approaches`, '#fffbef');
        this.spawnElite();
        this.sfx('tejas-bell', { rate: 0.7 });
        this.refreshMusic();
        this.hint('pralaya', `${N.phases.convergence}! An elite ${N.enemies.tank} joins the fight - and the best loot drops now.`);
      } else if (this.phaseTimeLeft <= 0) {
        const idx = (PHASE_SEQUENCE.indexOf(this.phase) + 1) % PHASE_SEQUENCE.length;
        this.phase = PHASE_SEQUENCE[idx];
        this.phaseTimeLeft = PHASE_DEFS[this.phase].duration;
        this.showToast(`${PHASE_DEFS[this.phase].label} begins`, '#' + PHASE_DEFS[this.phase].color.toString(16).padStart(6,'0'));
        this.sfx('phase');
        this.refreshMusic();
        if (this.phase === 'eclipse') this.hint('grahan', `${N.phases.eclipse}: everyone hits 30% harder - you included. Bosses with a red core are vulnerable now.`);
        if (this.phase === 'surge') this.hint('shakti', `${N.phases.surge}: enemies pour in faster, but loot drops richer.`);
      }
    } else {
      this.phaseTimeLeft -= delta;
      if (this.phaseTimeLeft <= 0) {
        this.inConvergence = false;
        this.phase = this.savedPhase;
        this.phaseTimeLeft = this.savedPhaseTimeLeft > 0 ? this.savedPhaseTimeLeft : PHASE_DEFS[this.phase].duration;
        this.showToast(`${PHASE_DEFS[this.phase].label} resumes`, '#' + PHASE_DEFS[this.phase].color.toString(16).padStart(6,'0'));
        this.refreshMusic();
      }
    }

    // phase visuals - big countdown bar that drains as the phase runs out, flashes as a warning near the end
    const pdef = PHASE_DEFS[this.phase];
    this.phaseTint.fillColor = pdef.tint;
    this.phaseTint.fillAlpha = pdef.tintAlpha;
    const barFrac = Phaser.Math.Clamp(this.phaseTimeLeft / pdef.duration, 0, 1);
    this.phaseBarFill.width = this.phaseBarW * barFrac;
    this.phaseBarFill.fillColor = pdef.color;
    this.phaseBarLabel.setText(pdef.label);
    if (this.phaseSign && this.phaseSign.frame.name !== ICON_FRAMES.indexOf('hud-' + this.phase)) this.phaseSign.setFrame(ICON_FRAMES.indexOf('hud-' + this.phase));
    if (!this.inConvergence && this.phaseTimeLeft < 2500) {
      this.phaseBarFill.setAlpha(Math.sin(time/60) > 0 ? 1 : 0.3);
      this.phaseBarLabel.setAlpha(Math.sin(time/60) > 0 ? 1 : 0.3);
    } else {
      this.phaseBarFill.setAlpha(1);
      this.phaseBarLabel.setAlpha(1);
    }

    // In a wide arena a held finger keeps steering: the spot under it moves as the camera does.
    if (ARENA_SCALE > 1) {
      const ptr = this.input.activePointer;
      if (ptr.isDown && !this.pointerOnUI) { ptr.updateWorldPoint(this.cameras.main); this.setMoveTarget(ptr.worldX, ptr.worldY); }
    }

    // --- movement ---
    // Captured before any movement so facing can be derived from where we actually went.
    const prevX = this.player.x, prevY = this.player.y;
    const swiftBonus = (this.player.trinket && this.player.trinket.effect === 'swift') ? this.player.trinket.speedBonus : 0;
    const moveSpeed = this.player.speed + swiftBonus + this.boonRank('feet') * BOONS.feet.n + (this.lastStand() ? BOONS.laststand.speed : 0);
    let dx = 0, dy = 0;
    if (this.cursors.left.isDown || this.wasd.A.isDown) dx -= 1;
    if (this.cursors.right.isDown || this.wasd.D.isDown) dx += 1;
    if (this.cursors.up.isDown || this.wasd.W.isDown) dy -= 1;
    if (this.cursors.down.isDown || this.wasd.S.isDown) dy += 1;
    if (dx || dy) this.pointerTarget = null;            // the keys take over from a tap
    // By intent, not by position: being shoved by an enemy is still standing your ground.
    this.moving = !!(dx || dy || this.pointerTarget);
    this.stillMs = this.moving ? 0 : this.stillMs + delta;
    // No rest for a runner (2.36). The lull is counted only while something is chasing;
    // any blow the hero strikes ends it (damageEnemy).
    const chased = this.enemies.some(e => !e.isBoss && !e.isRanged), px0 = this.player.x, py0 = this.player.y;
    this.lullMs = chased ? this.lullMs + delta : 0;
    if (this.hunted && !chased) this.endHunt();
    this.huntPace = this.hunted && this.moving ? moveSpeed * HUNT.pace : 0;
    if (this.pointerTarget) {
      // Walk toward the finger at exactly the speed the keys give. This used to close 45%
      // of the gap every frame - anywhere in the arena in about a tenth of a second. That
      // was a teleport: no bolt, slam or swarm could ever catch a touch player, and every
      // difficulty figure in 2.14 was tuned against it.
      const tx = this.pointerTarget.x - this.player.x, ty = this.pointerTarget.y - this.player.y;
      const gap = Math.hypot(tx, ty), step = moveSpeed * dt;
      if (gap <= step) { this.player.x = this.pointerTarget.x; this.player.y = this.pointerTarget.y; this.pointerTarget = null; }
      else { this.player.x += tx / gap * step; this.player.y += ty / gap * step; }
    } else {
      const len = Math.hypot(dx,dy);
      if (len > 0) { dx /= len; dy /= len; }
      this.player.x += dx * moveSpeed * dt;
      this.player.y += dy * moveSpeed * dt;
    }
    this.player.x = Phaser.Math.Clamp(this.player.x, this.arenaBounds.x+15, this.arenaBounds.right-15);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.arenaBounds.y+15, this.arenaBounds.bottom-15);

    // The hunt begins (2.36) - but not while he is making for the nearest of them: that
    // is going to the fight, not leaving it.
    if (!this.hunted && HUNT.on && this.moving && this.lullMs >= HUNT.after) {
      let near = null, nd = 1e9;
      for (const e of this.enemies) {
        if (e.isBoss || e.isRanged) continue;
        const d = Math.hypot(e.x - px0, e.y - py0);
        if (d < nd) { nd = d; near = e; }
      }
      const mx = this.player.x - px0, my = this.player.y - py0, ml = Math.hypot(mx, my);
      const toward = near && ml > 0.01 && nd > 0.01 ? (mx * (near.x - px0) + my * (near.y - py0)) / (ml * nd) : 0;
      if (near && toward < 0.5) this.beginHunt();
    }

    // block walking through enemies - push the player back out of any overlap
    for (const enemy of this.enemies) {
      const edx2 = this.player.x - enemy.x, edy2 = this.player.y - enemy.y;
      const edist2 = Math.hypot(edx2, edy2);
      const minDist = HERO_RADIUS + enemy.radius;
      if (edist2 < minDist) {
        if (edist2 > 0.01) {
          this.player.x += (edx2/edist2) * (minDist - edist2);
          this.player.y += (edy2/edist2) * (minDist - edist2);
        } else {
          this.player.x += minDist;
        }
      }
    }
    this.player.x = Phaser.Math.Clamp(this.player.x, this.arenaBounds.x+15, this.arenaBounds.right-15);
    this.player.y = Phaser.Math.Clamp(this.player.y, this.arenaBounds.y+15, this.arenaBounds.bottom-15);

    this.aimCamera(false, delta);
    const lift = this.animate(this.playerSprite, this.playerAnim, delta, (this.player.x - prevX) / dt, (this.player.y - prevY) / dt, false, 0);
    this.playerSprite.setPosition(this.player.x, this.player.y - lift).setDepth(sortDepth(this.player.y + HERO_RING_DOWN));
    this.playerRing.setPosition(this.player.x, this.player.y + HERO_RING_DOWN);
    // Ring carries the live phase colour, so the player reads Cycle timing off their own feet.
    this.playerRing.setStrokeStyle(2, PHASE_DEFS[this.phase].color, 0.9);

    // Boon tells (2.24). A boon that only works some of the time has to say when it is
    // working: a gold ring planted outside the phase ring while Hold Your Ground is live,
    // and a gold arc around the hero that drains for as long as Read the Slam lasts.
    this.boonFx.clear();
    if (this.boonRank('ground') && this.stillMs >= 200) {
      this.boonFx.lineStyle(2, FORGE.gold, 0.65 + 0.3 * Math.sin(time / 160));
      this.boonFx.strokeEllipse(this.player.x, this.player.y + 16, 52, 21);
    }
    if (this.slamBuffMs > 0) {
      this.boonFx.lineStyle(3, FORGE.gold, 0.95);
      this.boonFx.beginPath();
      this.boonFx.arc(this.player.x, this.player.y - 2, 26, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * this.slamBuffMs / BOONS.readslam.ms);
      this.boonFx.strokePath();
    }

    // Facing follows actual movement while moving, and falls back to the nearest
    // enemy when standing still - so a stationary player still looks engaged.
    const mdx = this.player.x - prevX, mdy = this.player.y - prevY;
    let want;
    if (Math.abs(mdx) > 0.05 || Math.abs(mdy) > 0.05) {
      want = facingFor(mdx, mdy);
    } else {
      let aim = null, aimD = Infinity;
      for (const e of this.enemies) {
        const d = Phaser.Math.Distance.Squared(this.player.x, this.player.y, e.x, e.y);
        if (d < aimD) { aimD = d; aim = e; }
      }
      want = aim ? facingFor(aim.x - this.player.x, aim.y - this.player.y) : this.playerFacing;
    }
    if (want) this.playerFacing = want;
    this.pose(this.playerSprite, CHARS.player, this.playerFacing, this.playerAnim);

    // Slow drift sells "descending" without moving the arena itself.
    if (this.starfield) this.starfield.tilePositionY -= 0.28 * (delta / 16.67);

    if (this.player.iframes > 0) this.player.iframes -= delta;
    if (this.slamBuffMs > 0) this.slamBuffMs -= delta;
    if (this.player.flashTimer > 0) {
      this.player.flashTimer -= delta;
      this.playerSprite.setAlpha(Math.sin(time/40) > 0 ? 1 : 0.4);
    } else {
      this.playerSprite.setAlpha(1);
    }

    // --- spawn queue ---
    if (this.spawnQueue.length > 0) {
      this.spawnTimer -= delta;
      if (this.spawnTimer <= 0) {
        this.spawnEnemy(this.spawnQueue.shift());
        this.spawnTimer = (this.spawnGap || 380) * PHASE_DEFS[this.phase].spawnRateMult;
      }
    }

    // --- enemies move + attack (behavior varies by type) ---
    for (const enemy of [...this.enemies]) {
      const edx = this.player.x - enemy.x, edy = this.player.y - enemy.y;
      const edist = Math.hypot(edx, edy) || 1;

      if (enemy.isRanged) {
        // kite: close in if too far, back off if too close, hold and fire at preferred range
        const diff = edist - enemy.preferredRange;
        if (Math.abs(diff) > 12) {
          const dir = diff > 0 ? 1 : -1;
          enemy.x += (edx/edist) * dir * enemy.speed * dt;
          enemy.y += (edy/edist) * dir * enemy.speed * dt;
        }
        enemy.fireTimer -= delta;
        if (enemy.fireTimer <= 0 && edist <= enemy.preferredRange + 60) {
          enemy.fireTimer = enemy.fireInterval;
          const pdx = edx/edist, pdy = edy/edist;
          // The Hexer's bolt: a faceted shard, point first, with a star turning behind
          // it, in his own violet, which nothing of the hero's is drawn in.
          const halo = this.fxPiece('fx_star', enemy.x, enemy.y, 13, HEX_FX, 0).setAlpha(0.75);
          const shard = this.fxPiece('fx_shard', enemy.x, enemy.y, 17, HEX_FX, 0).setRotation(Math.atan2(pdy, pdx) - Math.PI / 2);
          this.act(enemy, enemy.x, enemy.y, this.player.x, this.player.y);
          const proj = {
            x: enemy.x, y: enemy.y,
            vx: pdx * enemy.projSpeed, vy: pdy * enemy.projSpeed,
            dmg: enemy.projDmg,
            sprite: shard, halo
          };
          this.projectiles.push(proj);
          this.sfx('bolt');
        }
      } else if (enemy.isBoss) {
        if (this.updateBoss(enemy, edx, edy, edist, dt, delta)) return;   // true = player died
        if (enemy.hp > 0) {
          if (enemy.orbiters) {
            const fy = enemy.y + this.feetDown(enemy), rx = this.girth(enemy) + 24;
            enemy.orbiters.forEach((o, idx) => {
              const ang = time / 520 + idx * Math.PI, oy = fy + Math.sin(ang) * rx * FLAT;
              o.setPosition(enemy.x + Math.cos(ang) * rx, oy - 9).setRotation(time / 300).setDepth(sortDepth(oy));
            });
          }
          this.updateBossGate(enemy, time);
          this.drawBossFx(enemy, time, delta);
        }
      } else {
        // melee / tank / splitter: chase and hit on contact. A hunted runner is run down (2.36).
        const pace = Math.max(enemy.speed, this.huntPace);
        enemy.x += (edx/edist) * pace * dt;
        enemy.y += (edy/edist) * pace * dt;
        if (edist < (HERO_RADIUS + enemy.radius) && enemy.hitCooldown <= 0) {
          enemy.hitCooldown = 420;
          this.enemyLunge(enemy);
          if (this.damagePlayer(enemy.dmg * PHASE_DEFS[this.phase].enemyDmgMult, enemy, 'melee')) return;
          if (this.player.trinket && this.player.trinket.effect === 'thorns') {
            if (this.damageEnemy(enemy, enemy.dmg * this.player.trinket.reflectPct)) continue;
          }
        }
      }
      enemy.hitCooldown -= delta;

      // venom poison ticks - applies regardless of enemy type
      if (enemy.poison && enemy.poison.ticksLeft > 0) {
        enemy.poison.tickTimer -= delta;
        if (enemy.poison.tickTimer <= 0) {
          enemy.poison.ticksLeft--;
          enemy.poison.tickTimer = 500;
          if (this.damageEnemy(enemy, enemy.poison.dmgPerTick)) continue;
          if (enemy.poison.ticksLeft <= 0) enemy.poison = null;   // worn off: nothing left to spread
        }
      }

      const spr = this.enemySprites.get(enemy.id);
      if (spr) {
        let ox = 0, oy = 0;
        if (enemy.lunge) {
          enemy.lunge.t += delta;
          const k = enemy.lunge.t / enemy.lunge.dur;
          if (k >= 1) enemy.lunge = null;
          else { const push = Math.sin(k * Math.PI) * enemy.lunge.amp; ox = enemy.lunge.dx * push; oy = enemy.lunge.dy * push; }
        }
        if (enemy.hatch) {                    // a brood, still in the air from the one that fell
          enemy.hatch.t += delta;
          const k = enemy.hatch.t / enemy.hatch.dur;
          if (k >= 1) enemy.hatch = null;
          else { const back = (1 - k) * (1 - k); ox += enemy.hatch.dx * back; oy += enemy.hatch.dy * back - Math.sin(k * Math.PI) * 13; }
        }
        if (enemy.act && enemy.act.held && !enemy.slam) this.release(enemy);
        const lift = this.animate(spr, enemy, delta, (enemy.x - (enemy.lastX === undefined ? enemy.x : enemy.lastX)) / dt,
          (enemy.y - (enemy.lastY === undefined ? enemy.y : enemy.lastY)) / dt, !!enemy.isBoss, enemy.slam ? Math.min(1, enemy.slam.t / enemy.slam.dur) : 0);
        enemy.lastX = enemy.x; enemy.lastY = enemy.y;
        spr.setPosition(enemy.x + ox, enemy.y + oy - lift).setDepth(sortDepth(enemy.y + this.feetDown(enemy)));
        // 4-direction art is never turned to face - the facing frame is swapped instead.
        // Face the player, which is also the direction almost every enemy is moving.
        if (enemy.char) {
          enemy.facing = facingFor(this.player.x - enemy.x, this.player.y - enemy.y);
          this.pose(spr, enemy.char, enemy.facing, enemy);
        }
        if (enemy.gilt) {                     // the gold follows the figure through every cell
          enemy.gilt.setTexture(spr.texture.key, spr.frame.name).setPosition(spr.x, spr.y).setScale(spr.scaleX, spr.scaleY).setRotation(spr.rotation)
            .setDepth(spr.depth + 1e-6).setAlpha(0.2 + 0.1 * Math.sin(time / 190 + enemy.gait));
          enemy.giltRing.clear();
          this.facetRing(enemy.giltRing, enemy.x, enemy.y + this.feetDown(enemy), this.girth(enemy) + 5, GILT_FX, 0.85, time / 1500, 4);
        }
      }

      if (enemy.nameLabel) {
        // Sits above the topmost bar, so a shielded boss does not overlap its own name.
        const topBar = enemy.shieldBarFill ? 27 : (enemy.isBoss ? 18 : 13);
        // Clamped below the progress track: bosses spawn near the top of the arena and
        // their label would otherwise sit on top of the sector rail.
        // A boss's timer sits over his name: at the top wall it keeps its place and the name gives way.
        const floor = (this.trackY ? this.trackY + this.camOff.y : this.arenaBounds.y) + (enemy.gateLabel && enemy.gateLabel.visible ? 41 : 14), ab = this.arenaBounds, half = enemy.nameLabel.width / 2 + 2;
        // Kept inside the arena: a boss's label grows once it carries a tribute count.
        enemy.nameLabel.setPosition(half * 2 >= ab.width ? ab.centerX : Phaser.Math.Clamp(enemy.x, ab.x + half, ab.right - half),
                                    Math.max(floor, enemy.y - this.headUp(enemy) - topBar - 8));
      }
      // A boss up against the top wall: his name is held under the wave track, and his bars under his name.
      const barTop = enemy.isBoss && enemy.nameLabel ? enemy.nameLabel.y + 12 : -1e9;
      if (enemy.shieldBarFill) {
        const sy = Math.max(barTop, enemy.y - this.headUp(enemy) - 27);
        const left = (enemy.keyAddIds ? enemy.keyAddIds.length : 0) / (enemy.shieldMax || 1);
        enemy.shieldBarBg.setPosition(enemy.x, sy);
        enemy.shieldBarFill.x = enemy.x - enemy.shieldBarW/2;
        enemy.shieldBarFill.y = sy;
        enemy.shieldBarFill.width = enemy.shieldBarW * Math.max(0, left);
      }
      if (enemy.hpBarBg) {
        const by = Math.max(barTop + (enemy.shieldBarFill ? 9 : 0), enemy.y - this.headUp(enemy) - (enemy.isBoss ? 18 : 13));
        const pct = Math.max(0, enemy.hp / enemy.maxHp);
        enemy.hpBarBg.setPosition(enemy.x, by);
        enemy.hpBarFill.x = enemy.x - enemy.hpBarW/2;
        enemy.hpBarFill.y = by;
        enemy.hpBarFill.width = enemy.hpBarW * pct;
        // Gold -> ember -> crimson as it drains: reads at a glance without a number,
        // and stays inside the forge palette instead of the old generic green/red.
        enemy.hpBarFill.fillColor = pct > 0.5 ? FORGE.gold : (pct > 0.22 ? FORGE.flame : 0xc4331f);
      }
    }

    this.declutterLabels();

    // --- projectiles ---
    for (let i = this.projectiles.length - 1; i >= 0; i--) {
      const p = this.projectiles[i];
      p.x += p.vx * dt; p.y += p.vy * dt;
      p.sprite.setPosition(p.x, p.y);
      if (p.halo) { p.halo.setPosition(p.x, p.y); p.halo.rotation += 0.25; }

      const pdist = Math.hypot(p.x - this.player.x, p.y - this.player.y);
      const offscreen = !Phaser.Geom.Rectangle.Contains(this.worldBounds, p.x, p.y);

      if (pdist < HERO_RADIUS + 3 * HIT) {
        const died = this.damagePlayer(p.dmg * PHASE_DEFS[this.phase].enemyDmgMult, null, 'ranged');
        this.impactBurst(p.x, p.y, FORGE.flame);
        p.sprite.destroy(); if (p.halo) p.halo.destroy();
        this.projectiles.splice(i,1);
        if (died) return;
      } else if (offscreen) {
        p.sprite.destroy(); if (p.halo) p.halo.destroy();
        this.projectiles.splice(i,1);
      }
    }

    // --- auto attack (fires at up to `shots` nearest enemies in range - spread weapons hit multiple) ---
    this.atkTimer -= delta;
    if (this.atkTimer <= 0 && this.enemies.length > 0) {
      const range = this.attackRange();
      const inRange = this.enemies
        .map(e => ({ e, d: Math.hypot(e.x-this.player.x, e.y-this.player.y) }))
        .filter(o => o.d <= range)
        .sort((a,b) => a.d - b.d)
        .slice(0, this.attackShots());
      // Every other volley, an in-range boss is guaranteed a shot even when summons are
      // nearer - but ONLY while it is actually vulnerable (weak phase, or no phase gate).
      // Focusing an off-phase boss wasted half of a new player's damage on 12%-effective
      // hits while the adds kept shooting (playtest-bot: Sector 1 HP loss 34% -> 92%).
      // As a bonus the auto-attack visibly swings onto the boss when its weak phase
      // opens, so the mechanic teaches itself.
      this.bossFocus = !this.bossFocus;
      if (this.bossFocus) {
        const boss = this.enemies.find(e => e.isBoss && !e.shieldOn && this.weakScale(e) === 1 &&
          Math.hypot(e.x - this.player.x, e.y - this.player.y) <= range);
        if (boss && !inRange.some(o => o.e === boss)) {
          inRange[inRange.length - 1] = { e: boss, d: 0 };
        }
      }

      if (inRange.length) {
        this.atkTimer = this.player.weapon.atkSpeed / this.attackRate();
        this.playerAnim.punch = 90;
        this.act(this.playerAnim, this.player.x, this.player.y, inRange[0].e.x, inRange[0].e.y);
        this.attackFx.clear();
        const wfx = this.player.weapon.effect;
        this.sfx(inRange.every(o => o.e.shieldOn || this.weakScale(o.e) < 1) ? 'hit-blocked'
          : ({ chain: 'hit-zap', executioner: 'hit-axe' }[wfx] || 'hit-blade'));
        const beamColour = { venom: 0x7fdd3c, vampiric: 0xff8080, chain: 0x4dd0ff,
                             executioner: FORGE.gold }[wfx] || FORGE.cool;
        inRange.forEach(({e}) => {
          this.drawWeaponBeam(this.player.x, this.player.y, e.x, e.y, wfx);
          if (e.shieldOn) {
            // Shielded bosses take no damage until their anchors die - show the beam
            // stopping dead on the shield so that reads as "blocked", not "missed".
            this.impactBurst(e.x, e.y, 0x9fd8ff);   // matches the shield dome - reads as "blocked"
            return;
          }
          this.impactBurst(e.x, e.y, beamColour);
          let dmg = this.player.weapon.dmg * PHASE_DEFS[this.phase].playerDmgMult * this.dmgMult();
          if (wfx === 'executioner' && e.hp/e.maxHp <= this.executeLine()) dmg *= this.player.weapon.executeBonusMult;
          if (wfx === 'venom') e.poison = { dmgPerTick: this.player.weapon.poisonDmg * this.dmgMult(), ticksLeft: 4, tickTimer: 500 };
          if (wfx === 'vampiric') {
            // Heal off what actually lands, so an off-phase boss is not a free fountain.
            this.healPlayer(dmg * this.weakScale(e) * this.player.weapon.lifestealPct, true);
          }
          this.damageEnemy(e, dmg);
        });
        // Chain: after primary hits land, jump to a nearby enemy not already hit (two with
        // Forked Lightning).
        if (this.player.weapon.effect === 'chain') {
          const primaryIds = new Set(inRange.map(o => o.e.id)), jumps = this.boonLive('fork') ? 2 : 1;
          const chainDmg = this.player.weapon.dmg * PHASE_DEFS[this.phase].playerDmgMult * this.player.weapon.chainPct * this.dmgMult();
          inRange.forEach(({e: primary}) => {
            const done = new Set();
            for (let j = 0; j < jumps; j++) {
              let secondary = null, sd = 90;
              for (const cand of this.enemies) {
                if (primaryIds.has(cand.id) || done.has(cand.id) || cand.shieldOn) continue;
                const d = Math.hypot(cand.x-primary.x, cand.y-primary.y);
                if (d <= sd) { secondary = cand; sd = d; }
              }
              if (!secondary) break;
              done.add(secondary.id);
              this.drawWeaponBeam(primary.x, primary.y, secondary.x, secondary.y, 'chain');
              this.impactBurst(secondary.x, secondary.y, 0x4dd0ff);
              this.damageEnemy(secondary, chainDmg);
            }
          });
        }
        this.time.delayedCall(80, () => this.attackFx && this.attackFx.clear());
      } else {
        this.atkTimer = 100;
      }
    }

    // --- loot pickups (walk over to equip, no pause) ---
    for (let i = this.pickups.length - 1; i >= 0; i--) {
      const pk = this.pickups[i];
      if (Math.hypot(pk.x - this.player.x, pk.y - this.player.y) < 26) {
        this.applyLoot(pk.item, pk.isMystery);
        const lootSfx = LOOT_SFX[pk.item.rarity];
        if (pk.isMystery) { this.sfx('loot-mystery'); this.time.delayedCall(260, () => this.sfx(lootSfx)); }
        else this.sfx(lootSfx);
        pk.sprite.destroy();
        pk.label.destroy();
        this.pickups.splice(i,1);
      }
    }

    // --- passive trinket effects: Aegis recharge, Regen healing ---
    if (this.player.trinket) {
      if (this.player.trinket.effect === 'aegis') {
        this.player.shieldRechargeTimer -= delta;
        if (this.player.shieldRechargeTimer <= 0 && this.player.shieldCharge < 1) {
          this.player.shieldCharge = 1;
          this.player.shieldRechargeTimer = this.player.trinket.rechargeMs;
          this.showToast('SHIELD READY', '#4dd0ff');
        }
      } else if (this.player.trinket.effect === 'regen') {
        this.player.hp = Math.min(this.player.maxHp, this.player.hp + this.player.trinket.regenPerSec * dt);
      }
    }

    this.drawFarPointers();

    // --- HP bar update ---
    const hpPct = Math.max(0, this.player.hp/this.player.maxHp);
    const hbX = this.player.x - HP_BAR.w / 2, hbY = this.player.y - HERO_BAR_UP;
    this.hpBarBg.setPosition(hbX, hbY); this.hpBarFill.setPosition(hbX, hbY); this.bloodBar.setPosition(hbX, hbY - HP_BAR.h / 2 - 2);
    this.hpBarFill.width = this.hpBarW * hpPct;
    this.hpBarFill.fillColor = hpPct > 0.5 ? 0x2fbf71 : (hpPct > 0.25 ? 0xffd23c : 0xff5c5c);
    const shield = this.player.bloodShield || 0;
    this.bloodBar.width = this.hpBarW * Math.min(1, shield / this.player.maxHp);

    // --- HUD text ---
    this.setHudLine(`${this.tier > 1 ? 'D' + this.tier + ' · ' : ''}${stageLabel(this.sector)} · Wave ${Math.min(this.wave,5)}/5`, `${N.currency}: ${this.runGold}`);
    this.weaponText.setText(`${this.player.weapon.name}${this.player.weapon.shots>1 ? ' x'+this.player.weapon.shots : ''}   ${Math.ceil(this.player.hp)}/${Math.ceil(this.player.maxHp)} HP${shield > 0 ? ` +${Math.ceil(shield)} shield` : ''}`);
    const power = this.powerParts().total;
    if (power !== this.powerShown) {
      // A gain shows: the number swells, and the amount floats up from it.
      if (this.powerShown && power > this.powerShown) {
        const gain = this.fix(this.add.text(W - 14, 74, `+${power - this.powerShown}`, { resolution: RES, fontSize: '11px', color: '#fffbef', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 3 }).setOrigin(1, 0).setDepth(ARENA_SCALE > 1 ? Z.hud + 2 : 45));
        this.tweens.add({ targets: gain, y: 88, alpha: 0, duration: 900, ease: 'Cubic.easeOut', onComplete: () => gain.destroy() });
        this.powerText.setScale(1.35); this.tweens.add({ targets: this.powerText, scale: 1, duration: 300, ease: 'Back.easeOut' });
      }
      this.powerShown = power;
      this.setPower(power);
    }
  }
}
