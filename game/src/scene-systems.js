/*
 * scene-systems.js: the fourth layer: the systems round the fight.
 *
 * class SystemsScene extends ScreensScene
 * Owns      boons (what is offered, taken, live or asleep, and what they add: dmgMult,
 *           attackRate, attackRange ...), power and stats (loadout, powerParts, stats),
 *           perks and depths, tribute, the supercharge (Tejas), the satchel's contents,
 *           loot taken (applyLoot), live tips, the teaching pauses, and the hunt of a
 *           runner.
 * Needs     rules.js for every number; persistence.js (session) for what is kept.
 * Expects   of LootScene: this.player, this.enemies, this.phase, damageEnemy,
 *           damagePlayer, pauseGame, resumeGame, slamReach (how far Tejas reaches).
 * State     this.boons, this.boonQueue, this.inventory, this.tejas*, the tips and
 *           lessons on show: all belong to one run and are made anew by startRun.
 */

class SystemsScene extends ScreensScene {
  // ---------- TEJAS (supercharge) ----------
  tejasForm() { return TEJAS_FORMS[(this.player && this.player.weapon && this.player.weapon.effect) || 'none'] || TEJAS_FORMS.none; }

  buildTejasUI() {
    if (this.tejasBtn) return;
    const b = this.viewBounds;
    this.tejasPos = { x: b.x + 39, y: b.bottom - 39 };
    const { x, y } = this.tejasPos;
    this.tejasBtn = this.add.circle(x, y, TEJAS_BTN, FORGE.deep, 0.62)
      .setStrokeStyle(2, FORGE.bronze, 0.8).setInteractive({ useHandCursor: true }).setDepth(20);
    this.tejasArc = this.add.graphics().setDepth(21);
    // The button names the power it will give, which follows the weapon in hand (build 0.23;
    // it said the supercharge's own name, and which power came out was a surprise).
    const power = this.tejasForm().name.toUpperCase();
    this.tejasLabel = this.add.text(x, y - 4, power, { resolution: RES, fontSize: power.length > 6 ? '9px' : '10px', color: '#c8a96e', fontStyle: 'bold' }).setOrigin(0.5).setDepth(22);
    this.tejasPct = this.add.text(x, y + 7, '0%', { resolution: RES, fontSize: '9px', color: '#8a7360' }).setOrigin(0.5).setDepth(22);
    // The sign of the form the weapon gives, over the word.
    this.tejasSign = this.painted ? this.icon(x, y - 13, formIcon(this.player && this.player.weapon ? this.player.weapon.effect : 'none'), 11).setDepth(22) : null;
    if (this.tejasSign) { this.tejasLabel.y = y + 1; this.tejasPct.y = y + 11; }
    this.tejasBtn.on('pointerdown', () => this.activateTejas());
    this.fix(this.tejasBtn, this.tejasArc, this.tejasLabel, this.tejasPct, this.tejasSign);
  }

  destroyTejasUI() {
    this.endTejas(true);
    [this.tejasBtn, this.tejasArc, this.tejasLabel, this.tejasPct, this.tejasSign].forEach(o => o && o.destroy());
    this.tejasBtn = this.tejasArc = this.tejasLabel = this.tejasPct = this.tejasSign = null;
  }

  gainTejas(e) {
    if (!session.tejasUnlocked || this.tejasActive > 0 || e.isBoss) return;
    let g = TEJAS.perKill[e.type] || 3;
    if (e.isElite) g += TEJAS.eliteBonus;
    this.tejas = Math.min(100, this.tejas + g * this.tejasRate());
  }

  activateTejas() {
    if (!this.tejasBtn || this.tejasActive > 0 || this.tejas < 100 || this.state !== 'playing') return;
    const f = this.tejasForm();
    this.tejasActive = TEJAS.duration;
    this.tejasTick = 0;
    const auraR = f.kind === 'chain' ? 44 : this.tejasRadius(f), c = this.tejasFx();   // the ring shows how far it reaches
    this.tejasAura = this.tejasRing(auraR, c).setPosition(this.player.x, this.player.y);
    this.tweens.add({ targets: this.tejasAura, alpha: 0.5, duration: 260, yoyo: true, repeat: -1 });
    this.tejasParts = f.poison ? this.venomCloud(this.tejasRadius(f), c) : [];
    if (f.kind === 'chain') this.tejasBolts = this.add.graphics().setDepth(30);
    this.tejasBurst(this.player.x, this.player.y, c);
    this.restorePlayerTint();
    if (!settings.reduceFlash) this.cameras.main.flash(160, 255, 210, 120);
    this.sfx('tejas-go'); this.sfx('tejas-bell');
    this.buzz(60);
    this.showToast(`${N.supercharge.toUpperCase()} - ${f.name.toUpperCase()}`, '#ffd23c');
  }

  endTejas(silent) {
    this.tejasActive = 0;
    if (this.tejasAura) { this.tweens.killTweensOf(this.tejasAura); this.tejasAura.destroy(); this.tejasAura = null; }
    (this.tejasParts || []).forEach(o => o.destroy());
    this.tejasParts = [];
    if (this.tejasBolts) { this.tweens.killTweensOf(this.tejasBolts); this.tejasBolts.destroy(); this.tejasBolts = null; }
    if (!silent) this.restorePlayerTint();
  }

  updateTejas(delta, dt) {
    if (this.tejasActive > 0) {
      this.tejasActive -= delta;
      this.tejasTick -= delta;
      if (this.tejasAura) { this.tejasAura.setPosition(this.player.x, this.player.y); this.tejasAura.rotation += delta * 0.0007; }
      this.driftCloud(delta);
      if (this.tejasTick <= 0) { this.tejasPulse(); this.tejasTick = this.tejasForm().every; }
      this.tejas = Math.max(0, 100 * this.tejasActive / TEJAS.duration);   // drains while it runs
      if (this.tejasActive <= 0) { this.tejas = 0; this.endTejas(); }
    } else {
      this.tejas = Math.min(100, this.tejas + TEJAS.passivePerSec * dt * this.tejasRate());
    }
    this.drawTejasMeter();
  }

  drawTejasMeter() {
    const g = this.tejasArc, { x, y } = this.tejasPos, f = this.tejasForm();
    const p = this.tejas / 100, ready = p >= 1 && this.tejasActive <= 0;
    if (ready && !this.tejasWasReady) {
      this.sfx('tejas-ready');
      this.hint('tejas', this.sys.game.device.input.touch
        ? `${N.supercharge} is full! Tap the glowing button (bottom-left) to unleash it.`
        : `${N.supercharge} is full! Press Space (or click the glowing button) to unleash it.`);
    }
    this.tejasWasReady = ready;
    if (this.tejasSign) {
      const want = ICON_FRAMES.indexOf(formIcon(this.player.weapon.effect)[0]);
      if (this.tejasSign.frame.name !== want) this.tejasSign.setFrame(want);
    }
    const power = f.name.toUpperCase();
    if (this.tejasLabel.text !== power) this.tejasLabel.setText(power).setFontSize(power.length > 6 ? 9 : 10);
    g.clear();
    g.lineStyle(4, 0x3a1a08, 0.9); g.strokeCircle(x, y, TEJAS_BTN);
    g.lineStyle(4, this.tejasActive > 0 ? f.colour : FORGE.gold, 1);
    g.beginPath(); g.arc(x, y, TEJAS_BTN, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2); g.strokePath();
    if (ready) {                          // ready: the button itself breathes so it is hard to miss
      const pulse = 0.5 + 0.5 * Math.sin(this.time.now / 140);
      this.tejasBtn.setFillStyle(0x5c2a05, 0.75 + 0.25 * pulse);
      g.lineStyle(2, FORGE.gold, 0.35 + 0.5 * pulse); g.strokeCircle(x, y, TEJAS_BTN + 5 + pulse * 4);
      this.tejasLabel.setColor('#ffd23c'); this.tejasPct.setText('READY').setColor('#ffd23c');
    } else {
      this.tejasBtn.setFillStyle(FORGE.deep, 0.62);
      this.tejasLabel.setColor(this.tejasActive > 0 ? '#fffbef' : '#c8a96e');
      this.tejasPct.setText(this.tejasActive > 0 ? `${Math.ceil(this.tejasActive / 1000)}s` : `${Math.floor(p * 100)}%`)
        .setColor(this.tejasActive > 0 ? '#fffbef' : '#8a7360');
    }
  }

  // How far a form reaches (TEJAS.reach, 2.53): its radius, grown with a boss's slams and a
  // little past them, so that it reaches him from outside his ring. The chain keeps its own:
  // it already reaches past any ring.
  tejasRadius(f) { return f.kind === 'chain' ? f.radius : f.radius * this.slamReach() * TEJAS.reach; }

  tejasPulse() {
    const f = this.tejasForm(), c = this.tejasFx(), px = this.player.x, py = this.player.y, R = this.tejasRadius(f);
    const base = this.player.weapon.dmg * PHASE_DEFS[this.phase].playerDmgMult * f.dmgMult * this.dmgMult();
    const near = this.enemies.filter(e => Math.hypot(e.x - px, e.y - py) <= R);

    if (f.kind === 'chain') {
      // Arc to the nearest few, each hop jumping onward to its own nearest - a live web.
      const targets = near.slice().sort((a, b) => Math.hypot(a.x-px, a.y-py) - Math.hypot(b.x-px, b.y-py)).slice(0, f.targets);
      const bolts = this.tejasBolts;
      if (targets.length) this.sfx('hit-zap', { vol: 1.3 });
      if (bolts) { this.tweens.killTweensOf(bolts); bolts.clear().setAlpha(1); }
      let from = { x: px, y: py - 8 };       // from the hero's hands, not the feet
      targets.forEach(t => {
        if (bolts) this.boltFx(bolts, from.x, from.y, t.x, t.y, c);
        this.starFx(t.x, t.y, c);
        const tx = t.x, ty = t.y;
        this.damageEnemy(t, base);
        from = { x: tx, y: ty };
      });
      if (bolts) this.tweens.add({ targets: bolts, alpha: 0, delay: 30, duration: 160 });
      return;
    }

    if (f.kind === 'slam') {
      this.slamFx(px, py, R, c);
      this.shake(140, 0.005);
      this.sfx('slam-land', { vol: 0.5, rate: 1.3 });
    } else if (f.kind === 'nova') {
      this.sfx('thud');
      this.novaFx(px, py, R, c);
    }

    let dealt = 0, shown = 0;
    near.forEach(e => {
      if (e.hp <= 0) return;
      if (f.execute && !e.isBoss && e.hp / e.maxHp <= f.execute) { this.starFx(e.x, e.y, c); this.damageEnemy(e, e.hp + 1); return; }
      if (f.poison) e.poison = { dmgPerTick: this.player.weapon.poisonDmg || 3, ticksLeft: 4, tickTimer: 500 };
      dealt += base * this.weakScale(e) * (e.shieldOn ? 0 : 1);
      const ex = e.x, ey = e.y;
      this.damageEnemy(e, base);
      // In a crowd only the first few hits are drawn: the cloud and the ring say the rest.
      if (f.kind === 'aura' && shown++ < 8) { this.chipFx(ex, ey, c, 3); if (f.heal) this.drainFx(ex, ey, c); }
    });
    if (f.heal && dealt > 0) { this.healPlayer(dealt * f.heal, true); this.starFx(px, py - 6, c); }     // what was drawn off arrives
  }

  // ---------- BOONS (requirements 2.24) ----------
  // Brotato's rhythm rather than Vampire Survivors': the pick comes in the break between
  // waves, so it never interrupts a dodge, and no experience bar is needed.
  boonRank(key) { return (this.boons && this.boons[key]) || 0; }

  // A weapon boon sleeps while another kind of weapon is equipped and wakes when it comes
  // back, which is what makes keeping a weapon in the satchel worth it.
  boonLive(key) {
    const w = BOONS[key].weapon;
    return w && this.player.weapon.effect !== w ? 0 : this.boonRank(key);
  }

  lastStand() { return this.boonRank('laststand') > 0 && this.player.hp < this.player.maxHp * BOONS.laststand.below; }

  // Boon bonuses add together rather than multiply, so a stacked build grows steadily
  // instead of exploding.
  dmgMult() {
    return damageBonus({ keen: this.boonRank('keen'), ground: this.boonRank('ground'), stillMs: this.stillMs, lastStand: this.lastStand(), slamBuffMs: this.slamBuffMs });
  }

  attackRate() { return attackRateBonus({ quick: this.boonRank('quick'), run: this.boonRank('run'), moving: this.moving }); }
  attackRange() { return this.player.weapon.range + this.boonRank('reach') * BOONS.reach.n; }
  attackShots() { return (this.player.weapon.shots || 1) + this.boonRank('second'); }
  executeLine() { return this.boonLive('cleancut') ? BOONS.cleancut.n : 0.25; }
  tejasRate() { return 1 + (this.boonRank('kindling') ? BOONS.kindling.n : 0); }

  addGold(n) { this.runGold += goldEarned(n, this.boonRank('greed'), this.tier); }

  // fromBlood: vampiric healing, whose overflow Blood Shield keeps as a shield.
  healPlayer(amount, fromBlood) {
    const p = this.player, now = healed(p.hp, p.maxHp, amount, fromBlood, fromBlood && this.boonLive('bloodshield'), p.bloodShield);
    p.hp = now.hp;
    if (now.bloodShield !== undefined) p.bloodShield = now.bloodShield;
  }

  // Spreading Rot: the poison a dying enemy carried jumps to the nearest one.
  spreadPoison(from) {
    let to = null, best = 140;
    for (const e of this.enemies) {
      const d = Math.hypot(e.x - from.x, e.y - from.y);
      if (d < best && !e.shieldOn) { best = d; to = e; }
    }
    if (!to) return;
    to.poison = { dmgPerTick: from.poison.dmgPerTick, ticksLeft: 4, tickTimer: 500 };
    if (this.attackFx) this.drawWeaponBeam(from.x, from.y, to.x, to.y, 'venom');
    this.impactBurst(to.x, to.y, 0x7fdd3c);
  }

  // Three different boons, each card rolling its metal by depth. A metal with nothing
  // left to offer falls back to any boon that still applies.
  drawBoons(allGold) {
    const odds = BOON_ODDS[Math.min(this.sector, 3)];
    const fits = key => this.boonFits(key);
    const offer = [];
    for (let i = 0; i < 3; i++) {
      const pool = Object.keys(BOONS).filter(k => fits(k) && !offer.includes(k));
      if (!pool.length) break;
      const roll = Phaser.Math.Between(1, 100);
      const metal = roll <= odds.common ? 'common' : roll <= odds.common + odds.rare ? 'rare' : 'epic';
      // A tribute of 15 asks for gold on every card; when the gold that applies runs out,
      // silver stands in before anything else does.
      const wanted = allGold ? ['epic', 'rare'] : [metal];
      const ofMetal = wanted.map(m => pool.filter(k => BOONS[k].metal === m)).find(list => list.length);
      offer.push(Phaser.Utils.Array.GetRandom(ofMetal || pool));
    }
    return offer;
  }

  // Boons wait for the player (2026-10-04). A cleared wave no longer stops the fight: it
  // adds a boon to a queue and lights the + button, and the next wave comes on. The
  // player opens the picks when they choose to - Dota's "level up when you like" - and
  // only then does the fight pause. The founder: "the number of pauses when boon
  // selection is needed just turned me off from the game."
  // Whether a boon can still be offered: ranks left, not barred by its opposite, its weapon
  // in hand, Overdrive open.
  boonFits(key) {
    const b = BOONS[key];
    return this.boonRank(key) < b.max && !(b.not && this.boonRank(b.not))
      && !(b.weapon && this.player.weapon.effect !== b.weapon) && !(b.tejas && !session.tejasUnlocked);
  }

  // Ranks still to be had, among the boons that can be offered now.
  boonsLeft() {
    return Object.keys(BOONS).reduce((n, k) => n + (this.boonFits(k) ? BOONS[k].max - this.boonRank(k) : 0), 0);
  }

  // What the card says: the Iron boon names the health it gives on this level.
  boonDesc(key) {
    return key === 'iron' ? `+${levelHealth(BOONS.iron.n, this.sector)} max health, and heals as much now` : BOONS[key].desc;
  }

  // Every boon taken, or none that fits (build 0.31): a boon earned is paid in Hoard instead,
  // the wave's own clear gold over again, so the + button never counts boons that cannot be
  // offered (the founder found it counting on in a long run, 2026-10-17).
  payForBoon(n = 1) {
    const each = 15 + this.depth * 4;
    this.addGold(each * n);
    this.showToast(`EVERY BOON IS YOURS  ·  +${each * n} ${N.currency.toUpperCase()}`, '#ffd23c');
  }

  queueBoon(tribute = 0) {
    if (this.boonsLeft() <= this.boonQueue.length) { this.payForBoon(); return; }
    this.boonQueue.push({ tribute, offer: null });
    this.refreshBoonButton(true);
    this.sfx('loot-rajat', { vol: 0.7 });
    this.hint('boon', (this.sys.game.device.input.touch ? 'A boon is ready. Tap the + button' : 'A boon is ready. Press + (or tap the + button)') +
      ' whenever you like: the fight waits while you choose.', true);   // ahead of other tips: the button has just appeared
    // Unspent boons are power left on the table: in bot runs, a player who only spends them
    // between levels reaches level 3 half as often. So a second one waiting earns a nudge -
    // a line of text, after the wave's own banner has gone, never a pause.
    if (this.boonQueue.length >= 2) this.time.delayedCall(1700, () => {
      if (this.state === 'playing' && this.boonQueue.length >= 2) this.showToast(`${this.boonQueue.length} BOONS WAITING - TAP +`, '#ffd23c');
    });
  }

  buildBoonButton() {
    this.destroyBoonButton();
    const b = this.viewBounds, x = b.right - 25, y = b.centerY + 86;
    this.boonUI = {
      ring:  this.add.circle(x, y, 21, 0x000000, 0).setStrokeStyle(2, FORGE.gold, 0.9).setDepth(20),
      btn:   this.add.circle(x, y, 20, FORGE.gold, 0.92).setStrokeStyle(1.5, 0xfffbef, 0.9).setDepth(21),
      plus:  this.add.text(x, y - 1, '+', { resolution: RES, fontSize: '26px', color: '#2a0800', fontStyle: 'bold', display: false }).setOrigin(0.5).setDepth(22),
      badge: this.add.circle(x + 15, y - 15, 9, 0xc4331f, 1).setStrokeStyle(1.5, 0xfffbef, 0.9).setDepth(23),
      count: this.add.text(x + 15, y - 15, '', { resolution: RES, fontSize: '10px', color: '#fffbef', fontStyle: 'bold' }).setOrigin(0.5).setDepth(24)
    };
    this.fix(...Object.values(this.boonUI));
    this.boonUI.btn.setInteractive(new Phaser.Geom.Circle(20, 20, 26), Phaser.Geom.Circle.Contains);
    this.boonUI.btn.input.cursor = 'pointer';
    this.boonUI.btn.on('pointerdown', () => this.openBoons());
    this.tweens.add({ targets: this.boonUI.ring, scale: 1.55, alpha: 0, duration: 1100, repeat: -1, ease: 'Cubic.easeOut' });
    this.refreshBoonButton();
  }

  refreshBoonButton(pop) {
    if (!this.boonUI) return;
    const n = this.boonQueue.length;
    Object.values(this.boonUI).forEach(o => o.setVisible(n > 0));
    this.boonUI.btn.input.enabled = n > 0;
    this.boonUI.count.setText(String(n));
    if (pop && n > 0) {
      this.boonUI.btn.setScale(1.5); this.boonUI.plus.setScale(1.5);
      this.tweens.add({ targets: [this.boonUI.btn, this.boonUI.plus], scale: 1, duration: 320, ease: 'Back.easeOut' });
    }
    if (this.choiceBoonTxt && this.choiceBoonTxt.active) this.choiceBoonTxt.setText(n ? `Choose your boon${n > 1 ? 's' : ''} first (${n})` : 'Boons chosen');
  }

  destroyBoonButton() {
    if (!this.boonUI) return;
    Object.values(this.boonUI).forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
    this.boonUI = null;
  }

  // Opens the waiting picks. From a fight it pauses the fight; from the choice screen
  // after a level it simply lies over it.
  openBoons() {
    if (!this.boonQueue || !this.boonQueue.length || (this.state !== 'playing' && this.state !== 'sectorChoice')) return;
    // Boons waiting beyond what can still be offered (a weapon changed since) are paid for.
    const over = this.boonQueue.length - this.boonsLeft();
    if (over > 0) {
      this.boonQueue.splice(this.boonQueue.length - over, over);
      this.payForBoon(over);
      this.refreshBoonButton();
      if (!this.boonQueue.length) return;
    }
    this.boonReturn = this.state;
    if (this.state === 'playing') { this.pointerTarget = null; this.time.paused = true; this.tweens.pauseAll(); }
    this.state = 'boon';
    this.refreshMusic();
    this.sfx('ui-open');
    this.showBoonScreen();
  }

  // Leaves the picks, chosen or not: whatever is still in the queue keeps.
  closeBoons() {
    if (this.state !== 'boon') return;
    this.closeOverlay();
    this.state = this.boonReturn || 'playing';
    if (this.state === 'playing') { this.time.paused = false; this.tweens.resumeAll(); }
    this.refreshMusic();
    this.refreshBoonButton();
  }

  rerollBoons() {
    if (this.state !== 'boon' || this.rerollsLeft <= 0) return;
    this.rerollsLeft--;
    this.boonQueue[0].offer = null;
    this.showBoonScreen();
  }

  // key null drops the pick unspent: only the playtest bot does that, to measure a run
  // without boons.
  pickBoon(key) {
    if (this.state !== 'boon' || !this.boonQueue.length) return;
    if (key) {
      this.boons[key] = this.boonRank(key) + 1;
      if (key === 'iron') { const n = levelHealth(BOONS.iron.n, this.sector); this.player.maxHp += n; this.player.hp = Math.min(this.player.maxHp, this.player.hp + n); }
      this.sfx(LOOT_SFX[BOONS[key].metal]);
    }
    this.boonQueue.shift();
    if (this.boonQueue.length) return this.showBoonScreen();           // the next one, straight away
    this.closeBoons();
    if (key && this.state === 'playing') this.showToast(N.boons[key][0].toUpperCase(), '#' + RARITY[BOONS[key].metal].color.toString(16).padStart(6, '0'));
  }

  // ---------- POWER, STATS AND THE PROFILE (requirements 2.28) ----------
  // What the hero carries: the live run when there is one, otherwise what a new run starts with.
  loadout() {
    const live = !!this.player && ['playing', 'paused', 'boon', 'sectorChoice'].includes(this.state);
    const hp0 = 100 * (1 + session.vitalityLevel * 0.10) + (this.perkOn('lungs') ? PERKS.lungs.n : 0);
    const p = live ? this.player : { maxHp: hp0, hp: hp0, speed: 200, bloodShield: 0, trinket: null,
      weapon: { type: 'weapon', name: WEAPON_EFFECTS.none.label, rarity: 'common', shots: 1, effect: 'none', dmg: 10 * (1 + session.powerLevel * 0.08), range: 130, atkSpeed: 500 } };
    return { live, p, boons: live ? (this.boons || {}) : {} };
  }

  powerParts() {
    const { p, boons } = this.loadout(), w = p.weapon, t = p.trinket;
    const parts = {
      base: POWER.base,
      upgrades: (session.vitalityLevel + session.powerLevel) * POWER.upgrade,
      weapon: itemPower(w),
      trinket: itemPower(t),
      // A weapon boon that is asleep adds nothing until its weapon is back in hand.
      boons: Object.keys(boons).reduce((sum, k) => sum + (BOONS[k].weapon && BOONS[k].weapon !== w.effect ? 0 : boons[k] * POWER.boon[BOONS[k].metal]), 0),
      tejas: session.tejasUnlocked ? POWER.tejas : 0,
      perks: session.perksOn.length * POWER.perk
    };
    parts.total = parts.base + parts.upgrades + parts.weapon + parts.trinket + parts.boons + parts.tejas + parts.perks;
    return parts;
  }

  // The numbers themselves. Bonuses that come and go (standing still, a read slam, the
  // last stand) are left out: these are what the hero has all the time.
  stats() {
    const { p, boons } = this.loadout(), w = p.weapon, t = p.trinket, rank = k => boons[k] || 0;
    return {
      hp: Math.ceil(p.hp), maxHp: Math.ceil(p.maxHp),
      shield: Math.round(p.bloodShield || 0),
      block: t && t.effect === 'aegis' ? Math.round(t.rechargeMs / 1000) : 0,
      guard: this.perkOn('guard'),
      damage: w.dmg * (1 + rank('keen') * BOONS.keen.n),
      perSecond: 1000 / w.atkSpeed * (1 + rank('quick') * BOONS.quick.n),
      move: p.speed + (t && t.effect === 'swift' ? t.speedBonus : 0) + rank('feet') * BOONS.feet.n,
      targets: (w.shots || 1) + rank('second'),
      range: w.range + rank('reach') * BOONS.reach.n,
      taken: Math.round(100 * (1 - rank('hide') * BOONS.hide.n) * (rank('greed') ? 1 + BOONS.greed.hurt : 1) * (this.perkOn('scale') ? 1 - PERKS.scale.n : 1))
    };
  }

  // ---------- DEPTHS AND PERKS (requirements 2.30) ----------
  perkOn(key) { return session.perksOn.includes(key); }
  perkSlots() { return PERK_SLOTS + (session.depthsWon >= 4 ? 1 : 0); }
  get tributeAt() { return this.perkOn('taker') ? TRIBUTE_TAKER : TRIBUTE; }
  clearHeal() { return this.tier >= 3 ? 0.2 : SECTOR_CLEAR_HEAL; }
  strayGap() { const e = STRAYS.every[this.tier] || 0; return e ? Phaser.Math.Between(Math.max(1, e - 1), e) : 0; }
  convergeEvery() { return this.tier >= 6 ? 60000 : CONVERGENCE_INTERVAL; }
  perkHow(key) {
    const pk = PERKS[key];
    return pk.from ? `beat ${pk.from === 'gatekeeper' ? 'a ' + N.enemies.gatekeeper : 'a ' + N.enemies.sectorboss}` : `win depth ${pk.depth}`;
  }

  earnPerk(key) {
    if (session.perks[key]) return false;
    session.perks[key] = true;
    if (session.perksOn.length < this.perkSlots()) session.perksOn.push(key);     // worn at once if there is room
    saveSession();
    this.sfx('loot-swarna');
    this.time.delayedCall(1300, () => this.showToast(`PERK EARNED: ${PERKS[key].name.toUpperCase()}`, '#e2b6ff'));
    (this.perksEarned = this.perksEarned || []).push(key);
    return true;
  }

  togglePerk(key, onBack) {
    const at = session.perksOn.indexOf(key), pk = PERKS[key];
    let note;
    if (at >= 0) { session.perksOn.splice(at, 1); note = `${pk.name} taken off.\n${pk.desc}.`; }
    else if (session.perksOn.length >= this.perkSlots()) { this.sfx('ui-error'); note = `${pk.name}: ${pk.desc}.\nOnly ${this.perkSlots()} perks can be worn. Take one off first.`; }
    else { session.perksOn.push(key); this.sfx('equip'); note = `${pk.name} worn.\n${pk.desc}.`; }
    saveSession();
    this.showProfile(onBack, note);
  }

  // What a boss's fall earns beyond its drop: a perk the first time, and - on the depth
  // being attempted - water. A depth already won pays Nidhi and nothing else.
  bossRewards(e) {
    this.lastWater = 0;
    session.records.bosses[bossKind(e)] = (session.records.bosses[bossKind(e)] || 0) + 1;
    if (e.type === 'gatekeeper') { this.earnPerk('guard'); return; }
    const frontier = this.tier === session.depthsWon + 1 && session.depthsWon < DEPTH_MAX, before = wellWater();
    if (!e.isMega) {
      this.earnPerk('eye');
      if (frontier && this.sector <= 2) session.depthBest = Math.max(session.depthBest, this.sector);
    } else {
      this.depthNews = { depth: this.tier, won: frontier };
      if (frontier) {
        session.depthsWon++; session.depthBest = 0; session.depthPick = 0;
        const perk = Object.keys(PERKS).find(k => PERKS[k].depth === this.tier);
        if (perk) this.earnPerk(perk);
      }
    }
    session.water = wellWater();
    this.lastWater = session.water - before;
    this.runWater += this.lastWater;
  }

  // ---------- TRIBUTE (requirements 2.26) ----------
  addTribute(boss) {
    const t = boss.tribute = (boss.tribute || 0) + 1, gold = this.tributeAt.gold, kind = bossKind(boss);
    if (t > (session.records.tribute[kind] || 0)) {
      session.records.tribute[kind] = t;
      if (t % TRIBUTE.step === 0) saveSession();          // a record is kept even if the tab is closed before the run ends
    }
    const next = [this.tributeAt.item, this.tributeAt.boon, gold].find(n => n > t);
    if (boss.nameLabel) boss.nameLabel.setText(`${boss.baseName} · tribute ${t}${next ? '/' + next : ''}`)
      .setColor(t >= this.tributeAt.item ? '#ffd23c' : '#fffbef');
    const earned = { [this.tributeAt.item]: 'AN EXTRA ITEM', [this.tributeAt.boon]: 'A BOON', [gold]: `A ${N.metals.epic.toUpperCase()} BOON` }[t];
    if (earned) {
      this.showToast(`TRIBUTE ${t} - ${earned} WHEN IT FALLS`, '#ffd23c');
      this.sfx(LOOT_SFX[t >= gold ? 'epic' : 'rare']);
    } else if (t > gold && (t - gold) % TRIBUTE.step === 0) {
      // Said once a step, so a death deep in tribute has a cause the player was told of.
      this.showToast(`TRIBUTE ${t} - HIS SUMMONS GROW STRONGER`, '#ff9a80');
      this.sfx('slam-warn', { rate: 0.8, vol: 0.6 });
    }
  }

  // How much tougher and harder-hitting a boss's next summons are for the tribute already
  // taken from him: 1 until the gold boon, then a step up for every five more, without end.
  tributeSteps(boss) { return Math.floor(Math.max(0, (boss.tribute || 0) - this.tributeAt.gold) / TRIBUTE.step); }
  tributeWeight(boss) { return 1 + TRIBUTE.heavier * this.tributeSteps(boss); }
  tributePace(boss) { return 1 + TRIBUTE.faster * this.tributeSteps(boss); }

  // ---------- LIVE TIPS (first-run tutorial, requirements 2.12.1) ----------
  // Each tip shows once, ever, at the moment its system first appears - the Hades and
  // Archero approach, never a forced lesson. Play never stops; tap one to dismiss it.
  hint(id, text, urgent) {
    if (!settings.tips || this.silent || this.state !== 'playing' || session.hintsSeen[id]) return;
    // The first level has enough to learn. What can wait, waits until the player has got
    // to level 2: it is not marked as seen, so it comes back the next time it applies.
    if (HELD_TIPS.includes(id) && this.sector < 2 && (session.bestSector || 0) < 2) return;
    if (LESSONS.includes(id) && !session.lessonsOff) return this.askLesson(id);
    this.hintQueue = this.hintQueue || [];
    if (this.hintShowing === id || this.hintQueue.some(q => q.id === id)) return;
    const entry = { id, text, at: this.time.now };
    if (urgent) { this.hintQueue.unshift(entry); this.dismissHint(true); }
    else { this.hintQueue.push(entry); if (!this.hintBox) this.nextHint(); }
  }

  nextHint() {
    if (this.hintBox || !this.hintQueue || this.state === 'hub') return;
    // A tip that waited more than 10s is about a moment that has passed. Drop it unseen;
    // it will come back the next time that thing happens.
    while (this.hintQueue.length && this.time.now - this.hintQueue[0].at > 10000) this.hintQueue.shift();
    if (!this.hintQueue.length) return;
    const { id, text } = this.hintQueue.shift();
    session.hintsSeen[id] = true;
    saveSession();
    this.hintShowing = id;
    const b = this.viewBounds;
    // Bottom-right of the arena: clear of bosses (they enter at the top) and of the
    // Tejas button (bottom-left), whose taps it must never swallow.
    const left = b.x + 76, w = b.right - 8 - left, cx = left + w / 2;
    const t = this.add.text(cx, 0, text, { resolution: RES, fontSize: '11px', color: '#fffbef', align: 'center',
      lineSpacing: 2, wordWrap: { width: w - 20 } }).setOrigin(0.5, 0).setDepth(71);
    const h = t.height + 26, top = b.bottom - 8 - h;
    t.setY(top + 7);
    const bg = this.add.rectangle(cx, top + h / 2, w, h, FORGE.deep, 0.78).setStrokeStyle(1.5, FORGE.gold, 0.9)
      .setDepth(70).setInteractive();
    const sub = this.add.text(cx, top + h - 9, 'tap to dismiss', { resolution: RES, fontSize: '8px', color: '#c4b39c' })
      .setOrigin(0.5).setDepth(71);
    bg.on('pointerdown', () => this.dismissHint());
    this.hintBox = [bg, t, sub];
    this.fix(bg, t, sub);
    this.sfx('ui-open', { vol: 0.6 });
    this.hintTimer = this.time.delayedCall(3800 + text.length * 30, () => this.dismissHint());
  }

  dismissHint(immediate) {
    if (this.hintTimer) { this.hintTimer.remove(false); this.hintTimer = null; }
    if (this.hintBox) { this.hintBox.forEach(o => o.destroy()); this.hintBox = null; }
    this.hintShowing = null;
    if (this.hintQueue && this.hintQueue.length) {
      if (immediate) this.nextHint();
      else this.time.delayedCall(350, () => this.nextHint());
    }
  }

  clearHints() {
    this.hintQueue = [];
    this.lessonWait = [];
    this.hintShowing = null;
    if (this.hintTimer) { this.hintTimer.remove(false); this.hintTimer = null; }
    if (this.hintBox) { this.hintBox.forEach(o => o.destroy()); this.hintBox = null; }
  }

  // ---------- NO REST FOR A RUNNER (requirements 2.36) ----------
  beginHunt() {
    this.hunted = true;
    this.hunts++;
    this.paintHunt(true);
    this.showToast('THE PACK RUNS YOU DOWN - TURN AND FIGHT', '#ff9a80', true);
    this.sfx('slam-warn', { rate: 1.4, vol: 0.7 });
    this.hint('hunted', 'Run for long without fighting and the pack runs you down. Turn and fight: they only sprint while you run.');
  }

  endHunt() {
    this.hunted = false;
    this.lullMs = 0;
    this.paintHunt(false);
  }

  // The chasers redden while they sprint, so the change of pace has a cause the eye can find.
  paintHunt(on) {
    this.enemies.forEach(e => {
      if (e.isBoss || e.isRanged || e.isElite || e.isKeyAdd) return;      // the ones whose colour already means something
      const spr = this.enemySprites.get(e.id);
      if (spr) { if (on) spr.setTint(HUNT.tint); else spr.clearTint(); }
    });
  }

  // ---------- TEACHING PAUSES (requirements 2.35) ----------
  // The founder, 2026-10-10: "the game pauses and a popup is highlighted explaining a
  // particular concept. This can be skipped but happens first time the player is playing."
  // A lesson is asked for where its tip used to be, and waits for its moment: the thing
  // itself on the screen, and the last lesson a few seconds gone. One that waits too long
  // is dropped unseen, and comes back the next time that thing happens.
  askLesson(id) {
    this.lessonWait = this.lessonWait || [];
    if (!this.lessonWait.some(l => l.id === id)) this.lessonWait.push({ id, at: this.time.now });
  }

  pollLessons() {
    const q = this.lessonWait, now = this.time.now;
    if (!q || !q.length) return;
    for (let i = q.length - 1; i >= 0; i--) if (now - q[i].at > LESSON.patience) q.splice(i, 1);
    if (now - (this.lessonClosedAt === undefined ? -1e9 : this.lessonClosedAt) < LESSON.gap) return;
    const order = q.slice().sort((a, b) => (b.id === 'slam') - (a.id === 'slam'));   // a slam will not wait its turn
    for (const l of order) {
      const spot = this.lessonSpot(l.id);
      if (spot) { q.splice(q.indexOf(l), 1); this.openLesson(l.id, spot); return; }
    }
  }

  // Where a lesson's subject is on the screen, as circles to leave lit. Null while it is
  // not there to be shown.
  lessonSpot(id) {
    const ox = this.camOff.x, oy = this.camOff.y, v = this.viewBounds, p = this.player;
    const seen = (x, y, m) => x - ox > v.x + m && x - ox < v.right - m && y - oy > v.y + m && y - oy < v.bottom - m;
    if (id === 'move') {                                     // once the level's banner has gone
      return (this.banner || []).some(t => t.active) ? null : { ring: true, holes: [{ x: p.x - ox, y: p.y - oy - 10, r: 58 }] };
    }
    if (id === 'loot') {
      const k = this.pickups.find(k => !k.isMystery && seen(k.x, k.y, 24));
      return k ? { ring: true, holes: [{ x: k.x - ox, y: k.y - oy - 9, r: 40 }] } : null;
    }
    if (id === 'boon') {                                     // once the button has finished arriving
      const b = this.boonUI && this.boonQueue.length ? this.boonUI.btn : null;
      return b && b.scale < 1.02 ? { ring: true, holes: [{ x: b.x, y: b.y, r: 40 }] } : null;
    }
    if (id === 'core') {                                     // once the timer is over his head
      const e = this.enemies.find(e => e.type === 'gatekeeper' && e.gateLabel && e.gateLabel.visible && this.time.now - e.gateBorn > 900 && seen(e.x, e.y, 0));
      if (!e) return null;
      const top = Math.min(e.gateLabel.y, e.nameLabel ? e.nameLabel.y : 1e9) - 12, bottom = e.y + e.radius * 1.5 + 8;   // near the top wall his name sits above the timer
      return { ring: true, boss: e, holes: [{ x: e.x - ox, y: (top + bottom) / 2 - oy, r: Math.max((bottom - top) / 2 + 6, e.gateLabel.width / 2 + 10) }] };
    }
    const e = this.enemies.find(e => e.slam && e.slam.t > 140 && seen(e.x, e.y, 0));     // once the red zone is drawn
    if (!e) return null;
    const sl = e.slam, holes = [{ x: e.x - ox, y: e.y - oy, r: this.girth(e) + 18 }];
    if (sl.type === 'circle') holes[0].r = sl.r + 10;
    else if (sl.type === 'line') for (let d = 0; d <= sl.len; d += sl.w * 0.55) holes.push({ x: sl.x + Math.cos(sl.a) * d - ox, y: sl.y + Math.sin(sl.a) * d - oy, r: sl.w * 0.85 });
    else sl.blobs.forEach(bl => holes.push({ x: bl.x - ox, y: bl.y - oy, r: bl.r + 8 }));
    holes.push({ x: p.x - ox, y: p.y - oy - 8, r: 42 });     // and the hero: where you stand is the question
    return { boss: e, holes };
  }

  lessonCopy(id, spot) {
    const touch = this.sys.game.device.input.touch;
    const stand = 'You strike on your own: your whole job is choosing where to stand.';
    if (id === 'move') return { title: 'MOVING', body: (touch ? 'Tap where you want to go, or hold and drag. ' : 'Move with WASD or the arrow keys, or click where you want to go. ') + stand };
    if (id === 'loot') return { title: 'LOOT', body: `Walk over a drop to pick it up. A better one of what you hold is worn at once; anything else goes to your ${N.satchel}, the tab on the right edge. Copper is common, silver is better and gold is best.` };
    if (id === 'boon') return { title: 'A BOON IS WAITING', body: 'Every wave you clear earns a boon. ' + (touch ? 'Tap +' : 'Press + or click the button') + ' whenever you like: the fight waits while you choose one of three.' };
    if (id === 'core') return { title: 'THE TIMER OVER A BOSS', body: spot.boss.gateOpen
      ? 'A boss can only be hurt properly some of the time. This one is open now, and the timer over his head shows for how long. When it runs out he resists most of your damage until it counts down again.'
      : 'A boss resists most of your damage most of the time. The timer over his head counts down to when he opens: that is when to strike.' };
    return { title: 'A SLAM IS COMING', body: 'The red zone shows where it will land. The bright fill grows, and when it reaches the edge it hits. Get out of the red.' };
  }

  openLesson(id, spot) {
    session.hintsSeen[id] = true;
    saveSession();
    // The slam being taught winds up afresh, and slowly: time to read, and then to move.
    // Once only: REPLAY TUTORIAL shows the lesson again, but not a slow slam every time.
    if (id === 'slam') {
      spot.boss.slam.t = 0;
      spot.boss.slam.dur = SLAM[spot.boss.slam.type].windup * (session.slamTaught ? 1 : LESSON.slamGrace);
      // and he winds up afresh with it, even if he had begun to come down (SLAM_ACT.drop)
      if (spot.boss.act && spot.boss.act.slam) { spot.boss.act.held = true; spot.boss.act.t = 0; }
      session.slamTaught = true; saveSession();
    }
    // A boss just explained holds his first slam until its own lesson can follow: otherwise
    // it would land, untaught, inside the few seconds that two lessons are kept apart.
    if (id === 'core' && !session.hintsSeen.slam) spot.boss.slamTimer = Math.max(spot.boss.slamTimer, LESSON.gap + 600);
    this.state = 'lesson';
    this.pointerTarget = null;
    this.time.paused = true;
    this.tweens.pauseAll();
    this.refreshMusic();
    this.sfx('ui-open');
    this.lessonOpenedAt = performance.now();
    this.lessonShown = id;
    this.showLesson(id, spot);
  }

  showLesson(id, spot) {
    const copy = this.lessonCopy(id, spot);
    this.closeOverlay();
    this.overlay = [];
    // The dim, with the subject left lit: a dark sheet with soft-edged holes rubbed out of it.
    if (!this.textures.exists('spot')) {
      const tex = this.textures.createCanvas('spot', 128, 128), c = tex.getContext(), gr = c.createRadialGradient(64, 64, 0, 64, 64, 64);
      gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.7, 'rgba(255,255,255,1)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = gr; c.fillRect(0, 0, 128, 128); tex.refresh();
    }
    const sheet = this.ov(this.add.renderTexture(0, 0, W, H).setOrigin(0, 0), 100);
    sheet.fill(0x120400, LESSON.dim);
    const rub = this.make.image({ key: 'spot', add: false });
    spot.holes.forEach(h => { rub.setPosition(h.x, h.y).setDisplaySize(h.r * 2.6, h.r * 2.6); sheet.erase(rub); });
    rub.destroy();
    this.ov(this.add.zone(W / 2, H / 2, W, H).setInteractive(), 100.5);     // nothing underneath can be tapped
    const h0 = spot.holes[0];
    const ring = spot.ring ? this.ov(this.add.circle(h0.x, h0.y, h0.r, 0x000000, 0).setStrokeStyle(2, FORGE.gold, 0.95), 101) : null;

    // The panel goes on whichever side of the subject has more room, and points at it.
    const cx = W / 2, pw = 330, wrap = pw - 40;
    const head = this.ovText(cx, 0, 'TUTORIAL', { fontSize: '10px', color: '#c4b39c', fontStyle: 'bold' }).setOrigin(0.5, 0);
    const title = this.ovText(cx, 0, copy.title, { fontSize: '18px', color: '#ffd23c', fontStyle: 'bold', align: 'center', wordWrap: { width: wrap } }).setOrigin(0.5, 0);
    const body = this.ovText(cx, 0, copy.body, { fontSize: '13px', color: '#f0dcc0', align: 'left', lineSpacing: 4, wordWrap: { width: wrap } }).setOrigin(0.5, 0);
    const ph = 14 + head.height + 4 + title.height + 8 + body.height + 16 + 40 + 8 + 34 + 10;
    const top = Math.min(...spot.holes.map(h => h.y - h.r)), bottom = Math.max(...spot.holes.map(h => h.y + h.r));
    const below = H - 10 - bottom >= top - 10;
    const py = below ? Math.min(H - 10 - ph / 2, bottom + 24 + ph / 2) : Math.max(10 + ph / 2, top - 24 - ph / 2);
    const pt = py - ph / 2, g = this.ovPanel(cx, py, pw, ph, { alpha: 0.96 });
    const edge = below ? pt : pt + ph, room = below ? pt - bottom : top - (pt + ph);
    if (room >= 10) {
      const ax = Phaser.Math.Clamp(spot.holes[0].x, cx - pw / 2 + 30, cx + pw / 2 - 30);
      g.fillStyle(FORGE.gold, 0.9); g.fillTriangle(ax - 9, edge, ax + 9, edge, ax, edge + (below ? -10 : 10));
    }
    let y = pt + 14;
    head.setY(y); y += head.height + 4;
    title.setY(y); y += title.height + 8;
    body.setY(y); y += body.height + 16;
    const ok = this.ovButton(cx, y + 20, 210, 40, 'GOT IT', 0x7a3a0a, () => this.closeLesson(), { stroke: FORGE.gold, size: 15, sound: null });
    // 220 by 34, words of 12 (build 0.28; it was 170 by 24 with words of 10: ChatGPT's audit A-002).
    const skip = this.ovButton(cx, y + 65, 220, 34, 'skip the tutorial', 0x2a0f04, () => this.closeLesson(true), { size: 12, color: '#c8a96e', sound: null });
    this.lessonPanel = { top: pt, bottom: pt + ph, holeTop: top, holeBottom: bottom, holes: spot.holes.length, ok: ok.bg, skip: skip.bg, ring, labels: [ok.t, skip.t] };
    this.breatheLesson();
  }

  // Tweens and timers are stopped with the fight, so the little that moves here is moved
  // by hand, once a frame: the ring breathes, and the buttons take a moment to wake, so
  // a tap already on its way does not answer for the player.
  breatheLesson() {
    const L = this.lessonPanel, age = performance.now() - this.lessonOpenedAt;
    if (!L) return;
    if (L.ring) { const k = 0.5 + 0.5 * Math.sin(age / 220); L.ring.setScale(1 + 0.1 * k).setAlpha(1 - 0.55 * k); }
    const awake = Phaser.Math.Clamp((age - LESSON.hold + 250) / 250, 0, 1);
    L.labels.forEach(t => t.setAlpha(0.25 + 0.75 * awake));
  }

  // Skipping stops the pauses, not the teaching: the same five ideas then come as tips in
  // the corner, as they always did. How to play brings the pauses back.
  closeLesson(skip) {
    if (this.state !== 'lesson' || performance.now() - this.lessonOpenedAt < LESSON.hold) return;
    if (skip) { session.lessonsOff = true; delete session.hintsSeen.skipped; saveSession(); this.lessonWait = []; }
    this.closeOverlay();
    this.lessonPanel = null;
    this.state = 'playing';
    this.time.paused = false;
    this.tweens.resumeAll();
    this.lessonClosedAt = this.time.now;
    if (this.tejasKeys) Object.values(this.tejasKeys).forEach(k => k.reset());     // Space closed the lesson; it must not also loose Tejas
    this.sfx(skip ? 'ui-close' : 'ui-confirm');
    this.refreshMusic();
    if (skip) this.hint('skipped', 'Tutorial skipped. To see it again: How to play, then Replay tutorial.');
  }

  // ---------- SATCHEL (run inventory) ----------
  // Opening it PAUSES the fight (2026-10-03). It used not to: the first version held that
  // loot never interrupts play, and that swapping under fire was an interesting risk. On a
  // phone it was neither - small rows and small print while dodging is a test of
  // eyesight - and every game this one is measured against pauses for a build decision.
  // Picking loot up off the floor still does not pause; only choosing between items does.
  buildSatchelUI() {
    const b = this.viewBounds;
    const tabW = 26, tabH = 84;
    const tx = b.right - tabW / 2 - 2, ty = b.centerY;

    this.satchelTab = this.add.rectangle(tx, ty, tabW, tabH, FORGE.panel, 0.6)
      .setStrokeStyle(1, FORGE.bronze, 0.8)
      .setInteractive({ useHandCursor: true });
    this.satchelTabIcon = this.painted ? this.icon(tx, ty - 15, ['hud-satchel'], 18)
      : this.add.text(tx, ty - 12, '◀', { resolution: RES, fontSize: '11px', color: '#ffd23c' }).setOrigin(0.5);
    this.satchelTabCount = this.add.text(tx, ty + 8, '0', { resolution: RES, fontSize: '13px', color: '#fffbef', fontStyle: 'bold' }).setOrigin(0.5);
    // Something stored from the floor and not yet looked at (build 0.23): a gold dot on the tab.
    this.satchelDot = this.add.circle(tx + 7, ty - tabH / 2 + 7, 4, FORGE.gold).setStrokeStyle(1.5, 0x2a0800).setVisible(false);
    this.satchelNew = false;
    this.satchelTab.on('pointerdown', () => this.pauseGame('satchel'));
    this.fix(this.satchelTab, this.satchelTabIcon, this.satchelTabCount, this.satchelDot);
  }

  refreshSatchel() {
    if (!this.satchelTab) return;
    this.satchelTabCount.setText(String(this.inventory.length));
    this.satchelDot.setVisible(!!this.satchelNew);
  }

  // Swap: the equipped item of the same slot goes back into the satchel, so nothing
  // is ever destroyed by a swap - only by the satchel overflowing.
  equipFromSatchel(index) {
    const item = this.inventory[index];
    if (!item) return;
    this.inventory.splice(index, 1);
    this.applyLoot(item, false);
    this.sfx('equip');
    this.refreshSatchel();
    if (this.state === 'paused') this.showSatchel();     // redraw with the swap made
  }

  // Into the satchel. Past INV_MAX the weakest item falls out (least Power; of equals, the one
  // stored first): a full satchel never blocks a pickup, and never throws away the best
  // (build 0.23; it was the oldest). Returns what fell out, which may be the item itself.
  stashItem(item, fromFloor) {
    if (!item || !this.inventory) return null;
    this.inventory.push(item);
    let lost = null;
    if (this.inventory.length > INV_MAX) {
      let k = 0;
      this.inventory.forEach((it, i) => { if (itemPower(it) < itemPower(this.inventory[k])) k = i; });
      lost = this.inventory.splice(k, 1)[0];
    }
    if (fromFloor && lost !== item) this.satchelNew = true;
    this.refreshSatchel();
    this.hint('satchel', `Kept in the ${N.satchel} - the tab on the right edge. Tap it to wear anything there; the fight pauses while you choose.`);
    return lost;
  }

  // A drop walked over (build 0.23): worn at once only when plainly better than what is held
  // (calculations.js), else kept in the satchel.
  takeLoot(item, isMystery) {
    if (plainlyBetter(item, item.type === 'weapon' ? this.player.weapon : this.player.trinket)) { this.applyLoot(item, isMystery); return true; }
    const lost = this.stashItem(item, true), name = isMystery ? `${item.name} (revealed)` : item.name;
    const more = lost && lost !== item ? ` · dropped ${lost.name}` : '';
    this.showToast(lost === item ? `${N.satchel} full: ${name} left behind` : `Stored: ${name}` + (`Stored: ${name}${more}`.length <= 46 ? more : ''), isMystery ? '#ffd23c' : '#f0dcc0');
    return false;
  }

  destroySatchelUI() {
    [this.satchelTab, this.satchelTabIcon, this.satchelTabCount, this.satchelDot].forEach(o => o && o.destroy());
    this.satchelTab = this.satchelTabIcon = this.satchelTabCount = this.satchelDot = null;
  }

  applyLoot(item, isMystery) {
    const tag = isMystery ? 'Mystery Revealed: ' : '';
    if (item.type === 'weapon') {
      // The outgoing weapon goes to the satchel rather than being lost.
      const was = this.tejasForm();
      if (this.player.weapon) this.stashItem(this.player.weapon);
      this.player.weapon = item;
      // Overdrive's power follows the weapon: say so when it changes (build 0.23).
      const now = this.tejasForm(), told = session.tejasUnlocked && now !== was ? ` · ${N.supercharge}: ${now.name}` : '';
      this.showToast(`${tag}Equipped: ${item.name}${told}`, isMystery ? '#ffd23c' : '#4dd0ff');
    } else {
      const oldHpBonus = (this.player.trinket && this.player.trinket.hpBonus) || 0;
      if (this.player.trinket) this.stashItem(this.player.trinket);
      this.player.trinket = item;
      this.player.maxHp += (item.hpBonus - oldHpBonus);
      this.player.hp = Math.max(1, Math.min(this.player.maxHp, this.player.hp + (item.hpBonus - oldHpBonus)));   // taking a Life Gem off never leaves him on nothing
      this.player.shieldCharge = 0;
      this.player.shieldRechargeTimer = item.effect === 'aegis' ? item.rechargeMs : 0;
      this.showToast(`${tag}Equipped: ${item.name}`, isMystery ? '#ffd23c' : '#2fbf71');
    }
  }
}
