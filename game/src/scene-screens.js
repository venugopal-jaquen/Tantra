/*
 * scene-screens.js: the third layer: the screens.
 *
 * class ScreensScene extends FxScene
 * Owns      the title screen (showHub, drawWell), the list of powers (showCodex),
 *           settings, How to Play, the profile, the pause menu and the abandon prompt,
 *           the satchel, the boon cards, the choice after a level and the victory.
 * Needs     scene-ui.js for every panel, button and icon; names.js; rules.js.
 * Expects   of the layers above, as actions a screen may ask for: startRun, resumeGame,
 *           abandonRun, descend, endRun, pickBoon, rerollBoons, closeBoons, togglePerk,
 *           equipFromSatchel, nameYourself's saving; and as things to show: session,
 *           settings, this.player, this.boons, this.inventory, powerParts(), stats().
 *
 * A screen draws what is true when it opens and is drawn again when that changes; it
 * keeps no copy of it.
 */

class ScreensScene extends FxScene {
  boonNote(key) {
    const b = BOONS[key], parts = [];
    if (N.boons[key][1]) parts.push(N.boons[key][1]);
    if (b.max > 1) parts.push(`rank ${this.boonRank(key) + 1} of ${b.max}`);
    if (b.weapon) parts.push(`${WEAPON_EFFECTS[b.weapon].label} only`);
    return parts.join(' · ');
  }

  // The boons taken so far as a row of icons, with the rank when it stacks. `room` is how far
  // the last icon's centre may lie from the first: more boons than fit are drawn smaller and
  // closer, never past the panel's edge (17 can be carried at once).
  drawBoonRow(x, y, size, room) {
    const keys = Object.keys(this.boons || {});
    const step = room && keys.length > 1 ? Math.min(size + 3, room / (keys.length - 1)) : size + 3, s = Math.min(size, step - 2);
    keys.forEach((key, i) => {
      const bx = x + i * step;
      this.ov(this.icon(bx, y, boonIcon(key), s), 102);
      if (this.boons[key] > 1) this.ovText(bx + s / 2 - 1, y + s / 2 - 2, String(this.boons[key]),
        { fontSize: '9px', color: '#fffbef', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 2.5 }).setOrigin(0.5);
    });
    return keys.length;
  }

  showBoonScreen() {
    const pick = this.boonQueue[0], waiting = this.boonQueue.length - 1;
    // The offer is drawn once and kept, so closing and reopening is not a free reroll.
    if (!pick.offer) pick.offer = this.drawBoons(pick.tribute >= this.tributeAt.gold);
    this.boonOffer = pick.offer;
    this.boonTribute = pick.tribute;
    this.openOverlay(0.8);
    const cx = W / 2, left = cx - 161, opened = performance.now(), tb = pick.tribute;
    this.ovPanel(cx, 372, 350, 560);
    this.ovText(cx, 112, (tb ? `TRIBUTE OF ${tb} PAID` : 'A BOON IS READY') + (waiting > 0 ? `  ·  ${waiting} MORE WAITING` : ''),
      { fontSize: '10px', color: tb ? '#ffd23c' : '#c8a96e', fontStyle: 'bold' }).setOrigin(0.5);
    this.ovText(cx, 136, 'CHOOSE A BOON', { fontSize: '22px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(0.5);
    this.ovText(cx, 161, (tb ? 'earned by patience' : 'the fight is paused') + ' · boons last until the run ends',
      { fontSize: '10px', color: '#c8a96e' }).setOrigin(0.5);

    this.boonOffer.forEach((key, i) => {
      const b = BOONS[key], y = 230 + i * 98, col = RARITY[b.metal].color;
      this.glass(this.ov(this.add.graphics()), cx, y, 322, 88, { fill: FORGE.panel, alpha: 0.62, stroke: col, strokeAlpha: 0.95, radius: 12, sheen: 0.07 });
      const card = this.ov(this.add.rectangle(cx, y, 322, 88, 0xffffff, 0).setInteractive({ useHandCursor: true }));
      // A tap that was meant for walking must not choose a card the instant it appears.
      card.on('pointerdown', () => { if (performance.now() - opened > 350) this.pickBoon(key); });
      this.ov(this.icon(left + 26, y, boonIcon(key), 34), 102);
      this.ovText(left + 54, y - 37, N.boons[key][0], { fontSize: '15px', color: '#fffbef', fontStyle: 'bold' });
      this.ovText(left + 314, y - 34, N.metals[b.metal].toUpperCase(), { fontSize: '9px', color: '#' + col.toString(16).padStart(6, '0'), fontStyle: 'bold' }).setOrigin(1, 0);
      this.ovText(left + 54, y - 14, b.desc, { fontSize: '12px', color: '#f0dcc0', lineSpacing: 1, wordWrap: { width: 252 } });
      this.ovText(left + 54, y + 24, this.boonNote(key), { fontSize: '10px', color: '#c8a96e' });
    });

    const rr = this.rerollsLeft;
    this.ovButton(cx - 82, 532, 156, 36, rr > 0 ? `REROLL · ${rr} LEFT` : 'NO REROLL LEFT',
      rr > 0 ? 0x3a1a08 : 0x2a0f04, () => this.rerollBoons(), { sound: rr > 0 ? 'ui-page' : 'ui-error', color: rr > 0 ? '#ffd23c' : '#8a7360', size: 12 });
    this.ovButton(cx + 82, 532, 156, 36, 'CHOOSE LATER', 0x3a1a08, () => this.closeBoons(), { sound: 'ui-close', size: 12 });
    this.ovText(left, 568, 'YOUR BOONS', { fontSize: '10px', color: '#b8a58e', fontStyle: 'bold' });
    if (!this.drawBoonRow(left + 9, 598, 17, 309)) this.ovText(left, 588, 'None yet. Every wave you clear earns one.', { fontSize: '10px', color: '#b8a58e' });
  }

  // Opens the naming dialog and keeps what comes back; an empty name means unnamed again.
  nameYourself(after) {
    Namer.open(session.nickname, name => {
      session.nickname = name; saveSession();
      this.sfx(name ? 'ui-confirm' : 'ui-close');
      if (after) after();
    });
  }

  showProfile(onBack, note) {
    this.openOverlay(0.8);
    this.ensureSoftGlow();
    const cx = W / 2, left = cx - 156, right = cx + 156, parts = this.powerParts(), st = this.stats(), { live, p, boons } = this.loadout();
    const w = p.weapon, t = p.trinket, hex = c => '#' + c.toString(16).padStart(6, '0');
    this.ovPanel(cx, 362, 350, 600);

    // Who, and where.
    const nameT = this.ovText(left, 76, heroName().toUpperCase(), { fontSize: '25px', color: '#ffd23c', fontStyle: 'bold' });
    const room = right - left - 126;                       // the Power number has the rest of the line
    if (nameT.width > room) nameT.setFontSize(Math.floor(25 * room / nameT.width));
    this.ovText(left + 1, 108, live ? `${stageLabel(this.sector)} · wave ${Math.min(this.wave, 5)} of 5`
      : session.nickname ? 'at the top of the well  ·  tap to rename' : 'tap to name yourself',
      { fontSize: '10px', color: live || session.nickname ? '#c8a96e' : '#ffd23c' });
    if (!live) {
      const rename = this.ov(this.add.zone(left + 92, 94, 196, 48).setInteractive({ useHandCursor: true }), 103);
      rename.on('pointerdown', () => { this.sfx('ui-click'); this.nameYourself(() => this.showProfile(onBack)); });
    }
    // Power, the way Destiny sets it: small label, large number.
    this.ovText(right, 74, 'POWER', { fontSize: '9px', color: '#c8a96e', fontStyle: 'bold' }).setOrigin(1, 0);
    const num = this.ovText(right, 82, String(parts.total), { fontSize: '36px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(1, 0);
    // Beside the number, the sign of power: painted, or the diamond the game draws itself.
    const dx = right - num.width - 15, dy = 106;
    if (this.painted) this.ov(this.icon(dx, dy, ['sign-power'], 18), 102);
    else { const dia = this.ov(this.add.graphics(), 102); dia.fillStyle(FORGE.gold, 1); dia.fillPoints([{ x: dx + 2, y: dy - 7 }, { x: dx + 9, y: dy }, { x: dx + 2, y: dy + 7 }, { x: dx - 5, y: dy }], true); }

    // The hero, lit from behind.
    this.ov(this.add.image(cx, 232, 'softglow').setDisplaySize(230, 230).setTint(0xffa040).setAlpha(0.5).setBlendMode(Phaser.BlendModes.ADD), 101);
    this.ov(this.add.ellipse(cx, 280, 100, 26, 0x000000, 0.3), 101);
    this.ov(this.add.ellipse(cx, 278, 92, 24, 0, 0).setStrokeStyle(2, live ? PHASE_DEFS[this.phase].color : FORGE.gold, 0.85), 101);
    // The portrait is cut at the full size of the hero's picture, three times what the
    // still holds: this screen is where the hero is looked at, and where what is worn will show.
    if (this.textures.exists(`${CHARS.player}-portrait`)) {
      const pic = this.ov(this.add.image(cx, PORTRAIT.feet, `${CHARS.player}-portrait`).setOrigin(0.5, 1 - PORTRAIT.edge), 102);
      pic.setDisplaySize(PORTRAIT.tall * pic.width / pic.height, PORTRAIT.tall);
    } else this.ov(this.add.image(cx, 216, `${CHARS.player}-front`).setDisplaySize(132, 132), 102);

    // Tapping a slot says what is in it.
    const detail = this.ovText(cx, 322, '', { fontSize: '11px', color: '#f0dcc0', align: 'center', wordWrap: { width: 300 } }).setOrigin(0.5, 0);
    // `ref` is the icon (see ICON). `tint` colours the slot's border: with painted icons
    // that is where quality and wearing show. A dim slot's icon is faded, its colours kept.
    const slot = (x, y, size, ref, tint, corner, title, body, dim, onTap) => {
      this.glass(this.ov(this.add.graphics()), x, y, size, size, { fill: FORGE.panel, alpha: 0.6, stroke: dim ? 0x6b4a2e : tint, strokeAlpha: 0.95, radius: 9, sheen: 0.08 });
      const pic = this.ov(this.icon(x, y - (size > 40 ? 2 : 0), [ref[0], ref[1], dim ? 0x5a4535 : tint], size * 0.6), 102);
      if (dim && this.painted && !ref[0].startsWith('hud-')) pic.setAlpha(0.4);
      if (corner) this.ovText(x + size / 2 - 3, y + size / 2 - 2, corner, { fontSize: '9px', color: '#fffbef', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 2.5 }).setOrigin(1, 1);
      const hit = this.ov(this.add.zone(x, y, size + 6, size + 6).setInteractive({ useHandCursor: true }), 103);
      hit.on('pointerdown', () => { this.sfx('ui-page'); detail.setText(`${title}\n${body}`); if (onTap) onTap(); });
    };
    // Left: what is equipped, each with the power it adds.
    const col = left + 26, f = this.tejasForm ? TEJAS_FORMS[w.effect || 'none'] || TEJAS_FORMS.none : null;
    this.ovText(col, 146, 'GEAR', { fontSize: '9px', color: '#b8a58e', fontStyle: 'bold' }).setOrigin(0.5);
    slot(col, 178, 48, lootIcon(w), RARITY[w.rarity].color, '+' + parts.weapon, w.name + (w.shots > 1 ? `  x${w.shots}` : ''), (WEAPON_EFFECTS[w.effect] || WEAPON_EFFECTS.none).desc);
    if (t) slot(col, 232, 48, lootIcon(t), RARITY[t.rarity].color, '+' + parts.trinket, t.name, TRINKET_EFFECTS[t.effect].desc);
    else slot(col, 232, 48, EMPTY_ICON, 0x6b4a2e, '', 'No trinket', live ? 'Trinkets drop from enemies: walk over one.' : 'Trinkets are found during a run.', true);
    if (session.tejasUnlocked) slot(col, 286, 48, formIcon(w.effect), f.colour, '+' + parts.tejas, `${N.supercharge}: ${f.name}`, f.desc);
    else slot(col, 286, 48, LOCKED_ICON, 0x6b4a2e, '', `${N.supercharge}: dormant`, `Awakens the first time you reach ${N.stage.toLowerCase()} ${TEJAS_UNLOCK_SECTOR}.`, true);

    // Right: the boons of this run.
    this.ovText(right - 46, 146, live ? 'BOONS' : `PERKS  \u00B7  WEAR ${this.perkSlots()}`, { fontSize: '9px', color: '#b8a58e', fontStyle: 'bold' }).setOrigin(0.5);
    // The perks worn, at the hero's feet.
    session.perksOn.forEach((key, i) => slot(cx + (i - (session.perksOn.length - 1) / 2) * 30, 304, 24, perkIcon(key), PERK_TINT, '', `${PERKS[key].name}  \u00B7  perk`, PERKS[key].desc));
    const keys = Object.keys(boons);
    // Five rows of three hold fifteen; past that the slots close up to six rows, so every
    // boon carried has one to tap (17 can be carried at once).
    const tight = keys.length > 15, gap = tight ? 27 : 32;
    keys.forEach((key, i) => {
      const b = BOONS[key], asleep = b.weapon && b.weapon !== w.effect;
      slot(right - 78 + (tight ? 5 : 0) + (i % 3) * gap, 172 + Math.floor(i / 3) * gap, tight ? 24 : 28, boonIcon(key), RARITY[b.metal].color, boons[key] > 1 ? String(boons[key]) : '',
        N.boons[key][0] + (b.max > 1 ? `  ·  rank ${boons[key]} of ${b.max}` : '') + (asleep ? '  ·  asleep' : ''), b.desc, asleep);
    });
    if (!live) this.profilePerks(slot, right, onBack);
    else if (!keys.length) this.ovText(right - 46, 190, 'none yet:\nclear a wave,\nthen tap +', { fontSize: '10px', color: '#b8a58e', align: 'center', lineSpacing: 2 }).setOrigin(0.5, 0);
    detail.setText(note || (live ? 'Tap anything you carry to see what it does.' : 'This is what you start a run with. Tap a perk to wear it or take it off.'));

    // The numbers.
    const rows = [
      ['sign-health', 'icon_vitality', 0xff6b6b, 'Health', `${st.hp} / ${st.maxHp}`],
      ['sign-shield', 'icon_aegis', 0x9fd8ff, 'Shield', st.shield || st.block || st.guard ? [st.shield ? String(st.shield) : '', st.block ? `blocks a hit every ${st.block}s` : st.guard ? 'blocks 1 hit a level' : ''].filter(Boolean).join('  +  ') : '0'],
      ['sign-damage', 'boon_keen', 0xff8c42, 'Attack damage', (Math.round(st.damage * 10) / 10) + (st.targets > 1 ? `  x ${st.targets} targets` : '')],
      ['sign-speed', 'boon_quick', 0xffd23c, 'Attack speed', (Math.round(st.perSecond * 100) / 100).toFixed(2) + ' a second'],
      ['sign-move', 'boon_feet', 0x5fe08a, 'Move speed', String(Math.round(st.move))]
    ];
    this.ovText(left, 372, 'STATS', { fontSize: '9px', color: '#b8a58e', fontStyle: 'bold' });
    rows.forEach(([sign, icon, tint, label, value], i) => {
      const y = 398 + i * 24;
      if (i) { const ln = this.ov(this.add.graphics(), 101); ln.lineStyle(1, 0xffffff, 0.08); ln.lineBetween(left, y - 12, right, y - 12); }
      this.ov(this.icon(left + 9, y, [sign, icon, tint], 16), 102);
      this.ovText(left + 26, y, label, { fontSize: '12px', color: '#f0dcc0' }).setOrigin(0, 0.5);
      this.ovText(right, y, value, { fontSize: '13px', color: '#fffbef', fontStyle: 'bold' }).setOrigin(1, 0.5);
    });
    this.ovText(cx, 514, `range ${Math.round(st.range)}  ·  damage taken ${st.taken}%`, { fontSize: '10px', color: '#b8a58e' }).setOrigin(0.5);

    // Where the power comes from: one bar, a colour to each source.
    const src = [['Base', parts.base, 0x8a7360], ['Upgrades', parts.upgrades, 0xfffbef], ['Weapon', parts.weapon, 0xff8c42],
                 ['Trinket', parts.trinket, 0x4dd0ff], ['Boons', parts.boons, 0xffd23c], [N.supercharge, parts.tejas, 0xfff0a0], ['Perks', parts.perks, PERK_TINT]].filter(e => e[1] > 0);
    const bar = this.ov(this.add.graphics(), 102), bw = right - left;
    let bx = left;
    src.forEach(([, v, c]) => { const sw = bw * v / parts.total; bar.fillStyle(c, 0.9); bar.fillRect(bx, 532, Math.max(1, sw - 1.5), 8); bx += sw; });
    src.forEach(([name, v, c], i) => {
      const lx = left + (i % 4) * (bw / 4), ly = 552 + Math.floor(i / 4) * 15;
      const dot = this.ov(this.add.graphics(), 102); dot.fillStyle(c, 1); dot.fillCircle(lx + 4, ly, 3.2);
      this.ovText(lx + 12, ly, `${name} ${v}`, { fontSize: '10px', color: '#c8a96e' }).setOrigin(0, 0.5);
    });

    this.ovButton(cx, 628, 200, 40, 'BACK', 0x5c2a05, () => onBack(), { stroke: FORGE.gold });
  }

  // The perks to choose from, on the Profile at the top of the well.
  profilePerks(slot, right, onBack) {
    Object.keys(PERKS).forEach((key, i) => {
      const pk = PERKS[key], has = !!session.perks[key], worn = session.perksOn.includes(key);
      slot(right - 78 + (i % 3) * 32, 172 + Math.floor(i / 3) * 32, 28, perkIcon(key), worn ? PERK_TINT : 0xc8a96e, worn ? 'ON' : '',
        pk.name + (has ? '' : '  \u00B7  not earned yet'), has ? pk.desc : `${pk.desc}. To earn it, ${this.perkHow(key)}.`, !has, has ? () => this.togglePerk(key, onBack) : null);
    });
  }

  showPauseMenu() {
    this.openOverlay(0.78);
    const cx = W / 2;
    // The perks worn, two to a line, push what is below them down; a player with none
    // sees the screen as it was.
    const perks = session.perksOn, more = perks.length ? 24 + 22 * Math.ceil(perks.length / 2) : 0;
    this.ovPanel(cx, 372 + more / 2, 336, 486 + more);
    this.ovText(cx, N.pauseSub ? 156 : 166, N.pause.toUpperCase(), { fontSize: '26px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(0.5);
    if (N.pauseSub) this.ovText(cx, 181, N.pauseSub, { fontSize: '11px', color: '#c8a96e' }).setOrigin(0.5);

    // The build you are carrying - Brotato and Vampire Survivors both put it here, since
    // pause is the one calm moment to read what your items actually do.
    const left = cx - 146, textX = left + 40;
    const row = (y, ref, title, body) => {
      this.ov(this.icon(left + 16, y + 8, ref, 24));
      this.ovText(textX, y - 4, title, { fontSize: '12px', color: '#fffbef', fontStyle: 'bold', wordWrap: { width: 250 } });
      this.ovText(textX, y + 12, body, { fontSize: '10px', color: '#c8a96e', wordWrap: { width: 250 } });
    };
    this.ovText(left, 204, 'YOUR BUILD', { fontSize: '10px', color: '#b8a58e', fontStyle: 'bold' });
    const w = this.player.weapon, tr = this.player.trinket;
    row(226, lootIcon(w), w.name + (w.shots > 1 ? `  x${w.shots}` : ''),
        (WEAPON_EFFECTS[w.effect] || WEAPON_EFFECTS.none).desc);
    if (tr) row(270, lootIcon(tr), tr.name, TRINKET_EFFECTS[tr.effect].desc);
    else row(270, EMPTY_ICON, 'No trinket', 'Trinkets drop from enemies - walk over one');
    const f = this.tejasForm();
    if (session.tejasUnlocked) row(314, formIcon(w.effect), `${N.supercharge}: ${f.name}`, f.desc);
    else row(314, LOCKED_ICON, `${N.supercharge}: dormant`, `Awakens the first time you reach ${N.stage.toLowerCase()} ${TEJAS_UNLOCK_SECTOR}`);
    this.ovText(left, 350, 'YOUR BOONS', { fontSize: '10px', color: '#b8a58e', fontStyle: 'bold' });
    if (!this.drawBoonRow(left + 16, 374, 18, 280)) this.ovText(left, 367, 'None yet. One comes after every wave.', { fontSize: '10px', color: '#b8a58e' });
    if (more) {
      this.ovText(left, 396, 'YOUR PERKS', { fontSize: '10px', color: '#b8a58e', fontStyle: 'bold' });
      perks.forEach((key, i) => {
        const x = left + 16 + (i % 2) * 146, y = 420 + Math.floor(i / 2) * 22;
        this.ov(this.icon(x, y, perkIcon(key), 18), 102);
        this.ovText(x + 15, y, PERKS[key].name, { fontSize: '11px', color: '#e2b6ff', fontStyle: 'bold' }).setOrigin(0, 0.5);
      });
    }
    this.ovText(cx, 400 + more, `${this.tier > 1 ? 'Depth ' + this.tier + ' · ' : ''}${stageLabel(this.sector)} · Wave ${Math.min(this.wave, 5)}/5 · ${this.runGold} ${N.currency} this run`,
      { fontSize: '11px', color: '#ffd23c' }).setOrigin(0.5);

    this.ovButton(cx, 440 + more, 240, 44, 'RESUME', 0x7a3a0a, () => this.resumeGame(), { sound: null, stroke: FORGE.gold, size: 16 });
    this.ovButton(cx - 62, 488 + more, 116, 38, 'PROFILE', 0x3a1a08, () => this.showProfile(() => this.showPauseMenu()), { stroke: FORGE.gold });
    this.ovButton(cx + 62, 488 + more, 116, 38, 'HOW TO PLAY', 0x3a1a08, () => this.showHowTo(0, () => this.showPauseMenu()), { size: 12 });
    this.ovButton(cx, 531 + more, 240, 38, 'SETTINGS', 0x3a1a08, () => this.showSettings(() => this.showPauseMenu()));
    this.ovButton(cx, 583 + more, 240, 38, 'ABANDON RUN', 0x3a0f08, () => this.showAbandonConfirm(),
      { sound: 'ui-error', color: '#ff9a80' });
  }

  // A real question rather than a second tap on the same button: abandoning costs half
  // the run's Nidhi, and the player should read that before it happens, not after.
  showAbandonConfirm() {
    this.openOverlay(0.84);
    const cx = W / 2, kept = bankedGold(this.runGold, false);
    this.ovPanel(cx, 362, 324, 300, { stroke: 0xff5c5c, strokeAlpha: 0.9 });
    this.ovText(cx, 252, 'ABANDON THIS RUN?', { fontSize: '21px', color: '#ff9a80', fontStyle: 'bold' }).setOrigin(0.5);
    this.ovText(cx, 296, 'Abandoning counts as a death.', { fontSize: '14px', color: '#fffbef', fontStyle: 'bold', display: false }).setOrigin(0.5);
    this.ovText(cx, 338, `You keep only half of this run's ${N.currency}:\n${kept} of ${this.runGold}. The rest is lost.`,
      { fontSize: '12px', color: '#f0dcc0', align: 'center', lineSpacing: 4 }).setOrigin(0.5);
    this.ovButton(cx, 404, 250, 46, 'KEEP FIGHTING', 0x7a3a0a, () => this.showPauseMenu(), { stroke: FORGE.gold, size: 16 });
    this.ovButton(cx, 462, 250, 38, 'ABANDON RUN', 0x3a0f08, () => this.abandonRun(),
      { sound: null, color: '#ff9a80', stroke: 0xff5c5c });
  }

  // ---------- SETTINGS ----------
  showSettings(onBack) {
    this.openOverlay(0.82);
    const cx = W / 2, left = cx - 150;
    this.ovPanel(cx, 362, 344, 540);
    this.ovText(cx, 118, 'SETTINGS', { fontSize: '22px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(0.5);

    // Volume: eleven tap-cells (off, 1..10) - easier to hit on a phone than a slider.
    const volRow = (y, label, key) => {
      this.ovText(left, y, label, { fontSize: '12px', color: '#fffbef', fontStyle: 'bold' }).setOrigin(0, 0.5);
      const cells = [];
      const paint = () => cells.forEach((c, i) => {
        const on = i > 0 && i <= Math.round(settings[key] * 10);
        c.setFillStyle(i === 0 ? (settings[key] === 0 ? 0x7a3a0a : 0x2a0f04) : (on ? FORGE.gold : 0x3a1a08), 1);
      });
      for (let i = 0; i <= 10; i++) {
        const c = this.ov(this.add.rectangle(left + 128 + i * 16.5, y, i === 0 ? 22 : 13, 22, 0x3a1a08, 1)
          .setStrokeStyle(1, FORGE.bronze, 0.5).setInteractive({ useHandCursor: true }));
        if (i === 0) this.ovText(c.x, y, 'off', { fontSize: '8px', color: '#c8a96e' }).setOrigin(0.5);
        c.on('pointerdown', () => {
          settings[key] = i / 10; saveSettings(); paint();
          if (key === 'sfx') this.sfx('ui-click'); else this.refreshMusic();
        });
        cells.push(c);
      }
      if (cells[0]) cells[0].x -= 4;
      paint();
    };

    const toggleRow = (y, label, sub, key) => {
      this.ovText(left, y - (sub ? 7 : 0), label, { fontSize: '12px', color: '#fffbef', fontStyle: 'bold' }).setOrigin(0, 0.5);
      if (sub) this.ovText(left, y + 9, sub, { fontSize: '9px', color: '#b8a58e' }).setOrigin(0, 0.5);
      const btn = this.ovButton(left + 268, y, 64, 26, '', 0x3a1a08, () => {
        settings[key] = !settings[key]; saveSettings(); paint();
      });
      const paint = () => {
        btn.t.setText(settings[key] ? 'ON' : 'OFF').setColor(settings[key] ? '#ffd23c' : '#8a7360');
        btn.bg.setFillStyle(settings[key] ? 0x7a3a0a : 0x2a0f04, 1);
      };
      paint();
    };

    let y = 164;
    if (MUSIC_ON) { volRow(y, 'Music', 'music'); y += 40; }
    volRow(y, 'Sound effects', 'sfx'); y += 48;
    toggleRow(y, 'Screen shake', null, 'shake'); y += 42;
    toggleRow(y, 'Reduce flashing', `softer hit flash, no ${N.supercharge} flash`, 'reduceFlash'); y += 42;
    toggleRow(y, 'Damage numbers', null, 'dmgNumbers'); y += 42;
    if (navigator.vibrate) { toggleRow(y, 'Vibration', null, 'vibrate'); y += 42; }
    toggleRow(y, 'Tutorial', 'pauses and hints the first time things happen', 'tips'); y += 40;
    const replay = this.ovButton(left + 244, y, 112, 24, 'show it all again', 0x2a0f04, () => {
      session.hintsSeen = {}; session.lessonsOff = false; saveSession();
      settings.tips = true; saveSettings();
      replay.t.setText('done');
    }, { size: 10, color: '#c8a96e' });
    y += 44;

    // Only from the hub: wiping the save from inside a run would leave the run orphaned.
    if (this.state === 'hub') {
      let armed = false;
      this.ovButton(cx, y, 260, 34, 'RESET SAVE', 0x3a0f08, (bg, t) => {
        if (!armed) {
          armed = true;
          t.setText(`TAP AGAIN - erases ${N.currency}, upgrades, unlocks`).setFontSize(10);
          bg.setStrokeStyle(1.5, 0xff5c5c, 1);
          this.sfx('ui-error');
          return;
        }
        resetSession();
        this.closeOverlay();
        this.showHub();
      }, { sound: null, color: '#ff9a80', size: 12 });
    }

    this.ovButton(cx, 604, 180, 40, 'BACK', 0x5c2a05, () => onBack(), { stroke: FORGE.gold });
  }

  // ---------- HOW TO PLAY ----------
  // Illustrated cards, one system each (requirements 2.12.2). Illustrations reuse the
  // real game art and shapes, so what you learn here is exactly what you'll see.
  showHowTo(page, onBack) {
    const touch = this.sys.game.device.input.touch;
    const cards = this.howToCards(touch);
    page = Phaser.Math.Clamp(page, 0, cards.length - 1);
    this.openOverlay(0.84);
    const cx = W / 2, card = cards[page];
    this.ovPanel(cx, 370, 350, 548);
    this.ovText(cx, 118, 'HOW TO PLAY', { fontSize: '11px', color: '#b8a58e', fontStyle: 'bold' }).setOrigin(0.5);
    this.ovText(cx, 142, card.title, { fontSize: '19px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(0.5);
    this.glass(this.ov(this.add.graphics()), cx, 250, 310, 172, { fill: 0x3d1200, alpha: 0.7, stroke: FORGE.bronze, strokeAlpha: 0.5, radius: 12, sheen: 0.05 });
    card.draw(cx, 250);
    this.ovText(cx, 348, card.body, { fontSize: '13px', color: '#f0dcc0', align: 'left', lineSpacing: 4,
      wordWrap: { width: 304 } }).setOrigin(0.5, 0);

    // Swipe anywhere on the card, or use the arrows.
    const swipe = this.ov(this.add.zone(cx, 330, 350, 440).setInteractive(), 101);
    let downX = null;
    swipe.on('pointerdown', p => { downX = p.x; });
    swipe.on('pointerup', p => {
      if (downX === null) return;
      const dx = p.x - downX; downX = null;
      if (Math.abs(dx) > 40 * RES) { this.sfx('ui-page'); this.showHowTo(page + (dx < 0 ? 1 : -1), onBack); }
    });

    const dotsY = 566;
    cards.forEach((_, i) => this.ov(this.add.circle(cx + (i - (cards.length - 1) / 2) * 14, dotsY, i === page ? 4 : 3,
      i === page ? FORGE.gold : 0x6b4a2e, 1), 102));
    if (page > 0) this.ovButton(cx - 128, dotsY, 58, 32, '<', 0x3a1a08, () => this.showHowTo(page - 1, onBack), { sound: 'ui-page', size: 16 });
    if (page < cards.length - 1) this.ovButton(cx + 128, dotsY, 58, 32, '>', 0x7a3a0a, () => this.showHowTo(page + 1, onBack), { sound: 'ui-page', size: 16, stroke: FORGE.gold });
    // The teaching pauses, armed again: each plays the next time its moment comes.
    const again = this.ovButton(cx - 84, 614, 156, 38, 'REPLAY TUTORIAL', 0x3a1a08, () => {
      LESSONS.forEach(id => { delete session.hintsSeen[id]; });
      session.lessonsOff = false; saveSession();
      settings.tips = true; saveSettings();
      again.t.setText('IT WILL PLAY AGAIN');
    }, { size: 11 });
    this.ovButton(cx + 84, 614, 156, 38, page < cards.length - 1 ? 'CLOSE' : 'GOT IT', 0x5c2a05, () => onBack(), { stroke: FORGE.gold });
  }

  howToCards(touch) {
    const g = () => this.ov(this.add.graphics(), 102);
    const img = (key, x, y, size, tint) => { const i = this.ov(this.add.image(x, y, key).setDisplaySize(size, size), 102); if (tint) i.setTint(tint); return i; };
    const pic = (ref, x, y, size) => this.ov(this.icon(x, y, ref, size), 102);
    const label = (x, y, str, colour, size = 9) => this.ovText(x, y, str, { fontSize: size + 'px', color: colour || '#c8a96e', fontStyle: 'bold' }).setOrigin(0.5);
    const warn = 0xff3b1f;
    return [
      { title: 'THE GOAL',
        body: `${N.enemies.megaboss} has drunk the well dry. Descend to ${N.stage.toLowerCase()} ${FINAL_SECTOR}, the bottom of the well, and slay him to bring the water back. Every boss you beat on the way returns a little water, even if the run is lost. Fill the well and the game is won.`,
        draw: (cx, cy) => {
          const gr = g();
          img(`${CHARS.megaboss}-front`, cx - 84, cy + 2, 96);
          label(cx - 84, cy + 54, N.enemies.megaboss, '#ffb38a', 10);
          gr.fillStyle(0x2a0f04, 1); gr.fillRect(cx + 4, cy - 44, 112, 76);
          gr.fillStyle(0x1f8f80, 0.9); gr.fillRect(cx + 4, cy + 2, 112, 30);
          gr.lineStyle(2, 0xc8a96e, 0.9); gr.strokeRect(cx + 4, cy - 44, 112, 76);
          gr.lineStyle(1.5, 0xbff5ea, 0.7); gr.lineBetween(cx + 4, cy + 2, cx + 116, cy + 2);
          label(cx + 60, cy + 54, 'the well fills as you win', '#9fe8d8', 9);
        } },
      { title: 'MOVE · FIGHT',
        body: (touch ? 'Tap a spot and you walk there; hold and drag to steer.' : 'Move with WASD or the arrow keys (or click and drag).') +
              ' Attacks are automatic: you strike the nearest enemy in range. Your whole job is where you stand.' +
              ' Keep out of harm for a few seconds and you catch your breath: health creeps back, up to half.',
        draw: (cx, cy) => {
          const gr = g();
          gr.lineStyle(1, FORGE.cool, 0.35); gr.strokeCircle(cx - 50, cy, 70);
          gr.lineStyle(2, FORGE.cool, 0.9); gr.lineBetween(cx - 50, cy, cx + 62, cy - 12);
          img(`${CHARS.player}-right`, cx - 50, cy, 56);
          img(`${CHARS.melee}-left`, cx + 70, cy - 12, 44);
          gr.lineStyle(2, FORGE.gold, 0.8); gr.strokeCircle(cx - 8, cy + 58, 9);
          gr.fillStyle(FORGE.gold, 0.35); gr.fillCircle(cx - 8, cy + 58, 9);
          label(cx - 8, cy + 76, touch ? 'drag' : 'WASD / drag', '#ffd23c');
          label(cx - 50, cy - 76, 'attack range', '#4dd0ff', 8);
        } },
      { title: `LOOT · ${N.satchel.toUpperCase()}`,
        body: `Walk over a drop to take it. A better one of what you hold is worn at once; anything else goes to the ${N.satchel} on the right edge: tap it, and the fight pauses while you choose. The metal is the quality: ${metalList()}. Violet ??? is unidentified - a gamble that usually pays.`,
        draw: (cx, cy) => {
          ['common', 'rare', 'epic'].map(r => [r, N.metals[r]]).forEach(([r, n], i) => {
            pic([`loot-chain-${r}`, 'icon_chain', RARITY[r].color], cx - 118 + i * 58, cy - 18, 34);
            label(cx - 118 + i * 58, cy + 14, n, '#' + RARITY[r].color.toString(16));
          });
          pic(['loot-mystery', 'icon_mystery', MYSTERY_COLOR], cx + 56, cy - 18, 34);
          label(cx + 56, cy + 14, '???', '#b48cff');
          this.ov(this.add.rectangle(cx + 128, cy, 22, 70, FORGE.panel, 1).setStrokeStyle(1, FORGE.bronze, 0.8), 102);
          label(cx + 128, cy - 10, '<', '#ffd23c', 10); label(cx + 128, cy + 8, '2', '#fffbef', 11);
          label(cx + 128, cy + 48, N.satchel.toLowerCase(), '#c8a96e', 8);
          label(cx - 60, cy + 50, 'finer metal = stronger item', '#b8a58e', 9);
        } },
      { title: 'BOONS',
        body: `Every wave you clear earns a boon. Tap + whenever you like: the fight waits while you choose one of three. Copper boons add to your stats and stack up to three times. Silver ones change how you fight. Gold ones build on the weapon you carry. Boons last until the run ends, and each ${N.stage.toLowerCase()} gives you one free reroll.`,
        draw: (cx, cy) => {
          [['keen', 'common'], ['ground', 'rare'], ['fork', 'epic']].forEach(([k, m], i) => {
            const y = cy - 52 + i * 52, col = RARITY[m].color;
            this.ov(this.add.rectangle(cx, y, 252, 44, FORGE.panel, 1).setStrokeStyle(1.5, col, 0.9), 102);
            pic(boonIcon(k), cx - 102, y, 28);
            this.ovText(cx - 80, y - 16, N.boons[k][0], { fontSize: '12px', color: '#fffbef', fontStyle: 'bold' });
            this.ovText(cx - 80, y + 2, BOONS[k].desc, { fontSize: '9px', color: '#c8a96e' });
          });
        } },
      { title: 'THE COSMIC CYCLE',
        body: `The bar at the top loops through three phases. ${PHASE_DEFS.drift.label} is calm. ${PHASE_DEFS.surge.label} floods the arena but pays richer loot. In ${PHASE_DEFS.eclipse.label} everyone hits 30% harder - you included. Every 90 seconds, ${PHASE_DEFS.convergence.label} brings an elite and the best drops. The ring at your feet always shows the phase.`,
        draw: (cx, cy) => {
          const seq = [['drift', 20], ['surge', 12], ['eclipse', 10]], total = 42, bw = 270;
          // A phase's sign on a dark stud, as the HUD shows it at the head of its bar.
          const sign = (k, sx, sy) => { if (!this.painted) return;
            this.ov(this.add.circle(sx, sy, 11, 0x2a0f04, 1).setStrokeStyle(1.5, FORGE.bronze, 0.9), 102); pic(['hud-' + k], sx, sy, 14); };
          let x = cx - bw / 2;
          seq.forEach(([k, d]) => {
            const w = bw * d / total;
            this.ov(this.add.rectangle(x + w / 2, cy - 36, w - 2, 20, PHASE_DEFS[k].color, 1), 102);
            label(x + w / 2, cy - 36, PHASE_DEFS[k].label, '#1a0600', 9);
            sign(k, x + w / 2, cy - 12);
            x += w;
          });
          label(cx, cy - 58, 'loops forever', '#b8a58e', 8);
          this.ov(this.add.rectangle(cx + 92, cy + 20, 70, 18, PHASE_DEFS.convergence.color, 1), 102);
          label(cx + 92, cy + 20, PHASE_DEFS.convergence.label, '#1a0600', 9);
          sign('convergence', cx + 43, cy + 20);
          label(cx + 92, cy + 38, 'every 90s', '#b8a58e', 8);
          img(`${CHARS.player}-front`, cx - 60, cy + 22, 44);
          this.ov(this.add.ellipse(cx - 60, cy + 38, 34, 13, 0, 0).setStrokeStyle(2, PHASE_DEFS.eclipse.color, 0.95), 102);
          label(cx - 60, cy + 62, 'phase ring', '#c8a96e', 8);
        } },
      { title: 'BOSSES',
        body: `A boss resists most damage outside its own phase. The timer over its head counts down to when it opens. A shielded boss can't be hurt at all: kill the gold-glowing ${N.enemies.melee} anchoring the shield. Bosses summon ${N.enemies.melee}: each one you kill first is tribute. ${this.tributeAt.item} earns an item, ${this.tributeAt.boon} a boon, ${this.tributeAt.gold} a ${N.metalGloss.epic || N.metals.epic.toLowerCase()} boon - but the summons speed up, and past that they grow stronger.`,
        draw: (cx, cy) => {
          const gr = g(); gr.setDepth(101.5);
          gr.fillStyle(PHASE_DEFS.surge.color, 0.35); gr.fillEllipse(cx - 70, cy + 32, 72, 26);
          gr.fillStyle(PHASE_DEFS.surge.color, 0.9); gr.fillEllipse(cx - 70, cy + 32, 40, 13);
          img(`${CHARS.gatekeeper}-front`, cx - 70, cy - 4, 76);
          label(cx - 70, cy + 58, `orange core = hit in ${PHASE_DEFS.surge.label}`, '#ff8c42', 8);
          this.ov(this.add.circle(cx + 70, cy, 38, 0x9fd8ff, 0.18), 102);
          this.ov(this.add.circle(cx + 70, cy, 42, 0, 0).setStrokeStyle(2, 0x9fd8ff, 0.8), 102);
          img(`${CHARS.sectorboss}-front`, cx + 70, cy, 70);
          [[-50, -44], [52, -40], [0, 50]].forEach(([dx, dy]) => img(`${CHARS.melee}-front`, cx + 70 + dx * 0.9, cy + dy * 0.9, 26, 0xffd23c));
          label(cx + 70, cy + 72, 'kill the gold anchors', '#9fd8ff', 8);
        } },
      { title: 'SLAMS',
        body: 'Bosses slam. A red zone shows where, and its bright fill grows - when the fill reaches the edge, it lands. Three shapes: a ring around the boss, a line aimed where you stood, and eruptions around you. Slams scale with your max HP, so no amount of Vitality makes standing in one safe.',
        draw: (cx, cy) => {
          const gr = g();
          gr.fillStyle(warn, 0.14); gr.fillCircle(cx - 100, cy, 40);
          gr.fillStyle(warn, 0.36); gr.fillCircle(cx - 100, cy, 26);
          gr.lineStyle(2.5, warn, 0.95); gr.strokeCircle(cx - 100, cy, 40);
          gr.fillStyle(warn, 0.14); gr.fillRect(cx - 18, cy - 55, 36, 110);
          gr.fillStyle(warn, 0.36); gr.fillRect(cx - 18, cy - 55, 36, 64);
          gr.lineStyle(2.5, warn, 0.95); gr.strokeRect(cx - 18, cy - 55, 36, 110);
          [[92, -30, 20, 0.8], [124, 6, 18, 0.5], [88, 30, 20, 0.3]].forEach(([dx, dy, r, p]) => {
            gr.fillStyle(warn, 0.14); gr.fillCircle(cx + dx, cy + dy, r);
            gr.fillStyle(warn, 0.36); gr.fillCircle(cx + dx, cy + dy, r * p);
            gr.lineStyle(2, warn, 0.9); gr.strokeCircle(cx + dx, cy + dy, r);
          });
          label(cx - 100, cy + 62, 'ring', '#ff8a70'); label(cx, cy + 68, 'line', '#ff8a70'); label(cx + 104, cy + 62, 'scatter', '#ff8a70');
        } },
      { title: N.supercharge.toUpperCase(),
        body: (touch ? `From ${N.stage.toLowerCase()} 2, a meter fills as you fight - faster with every kill. When it is full, tap the glowing ${N.supercharge.toUpperCase()} button` : `From ${N.stage.toLowerCase()} 2, a meter fills as you fight - faster with every kill. When it is full, press Space (or click the ${N.supercharge.toUpperCase()} button)`) +
              ' for six seconds of power. The form follows your weapon: fire novas, a poison cloud, a blood drain, chain lightning or executing slams.' +
              (session.tejasUnlocked ? '' : ` (Not awakened yet - reach ${N.stage.toLowerCase()} 2.)`),
        draw: (cx, cy) => {
          const gr = g(), bx = cx - 70;
          gr.fillStyle(0x5c2a05, 1); gr.fillCircle(bx, cy, 30);
          gr.lineStyle(5, FORGE.gold, 1); gr.strokeCircle(bx, cy, 30);
          gr.lineStyle(2, FORGE.gold, 0.5); gr.strokeCircle(bx, cy, 37);
          label(bx, cy - 6, N.supercharge.toUpperCase(), '#ffd23c', N.supercharge.length > 6 ? 8 : 10); label(bx, cy + 8, 'READY', '#ffd23c', 9);
          img(`${CHARS.player}-front`, cx + 70, cy, 48, 0xffe08a);
          gr.lineStyle(4, 0xff8c42, 0.9); gr.strokeCircle(cx + 70, cy, 44);
          gr.lineStyle(2, 0xff8c42, 0.45); gr.strokeCircle(cx + 70, cy, 62);
          label(cx + 70, cy + 72, `${TEJAS_FORMS.none.name} - fire nova`, '#ff8c42', 8);
        } },
      { title: 'EXTRACT OR DESCEND',
        body: `Beat a ${N.stage.toLowerCase()}'s boss and choose: Extract to bank all your ${N.currency} and end the run, or Descend toward ${N.enemies.megaboss}. Fall down there and you keep only half. ${N.currency} buys Vitality and Power on the title screen - but the deeper ${N.stage.toLowerCase()}s hit hard enough that upgrades alone won't carry you.`,
        draw: (cx, cy) => {
          this.ov(this.add.rectangle(cx, cy - 30, 230, 40, 0x3a1a08, 1).setStrokeStyle(1.5, FORGE.bronze, 0.9), 102);
          label(cx, cy - 30, 'Extract - bank & end run', '#fffbef', 11);
          this.ov(this.add.rectangle(cx, cy + 22, 230, 40, 0x7a3a0a, 1).setStrokeStyle(1.5, FORGE.gold, 0.9), 102);
          label(cx, cy + 22, `Descend to ${N.stage} 2`, '#ffd23c', 11);
          label(cx, cy + 62, 'deeper = richer and deadlier', '#b8a58e', 9);
        } },
      { title: 'DEPTHS · PERKS',
        body: `Slay ${N.enemies.megaboss} and that depth of the well is won: a step fills, and the next depth opens with a new hardship, tougher enemies, a stray now and then, and richer ${N.currency}. There are seven. Your first boss kills and each depth you win also earn a perk, a gift that lasts. Choose which to wear on your Profile.`,
        draw: (cx, cy) => {
          const gr = g(), won = Math.min(DEPTH_MAX, session.depthsWon);
          for (let i = 0; i < DEPTH_MAX; i++) {                 // the well's seven steps, the won ones under water
            const half = 62 - i * 6.5, y = cy - 58 + i * 15;
            gr.fillStyle(DEPTH_MAX - 1 - i < won ? 0x1f8f80 : 0x2a0f04, 1); gr.fillRect(cx - 80 - half, y, half * 2, 13);
            gr.lineStyle(1.2, 0xc8a96e, 0.8); gr.strokeRect(cx - 80 - half, y, half * 2, 13);
          }
          label(cx - 80, cy + 62, `depth ${Math.min(DEPTH_MAX, won + 1)} of ${DEPTH_MAX}`, '#9fe8d8', 9);
          ['guard', 'scale', 'wind'].forEach((k, i) => {
            const y = cy - 44 + i * 40;
            this.glass(gr, cx + 30, y, 30, 30, { fill: FORGE.panel, alpha: 0.7, stroke: PERK_TINT, strokeAlpha: 0.95, radius: 7, sheen: 0.08 });
            pic(perkIcon(k), cx + 30, y, 18);
            this.ovText(cx + 52, y - 13, PERKS[k].name, { fontSize: '10px', color: '#fffbef', fontStyle: 'bold' });
            this.ovText(cx + 52, y + 1, PERKS[k].desc, { fontSize: '8px', color: '#c8a96e', wordWrap: { width: 96 } });
          });
        } }
    ];
  }

  // ---------- TITLE SCREEN ----------
  makeMenuTextures() {
    if (this.textures.exists('coreglow')) return;
    const glow = this.textures.createCanvas('coreglow', 256, 256), gc = glow.getContext();
    const rg = gc.createRadialGradient(128, 128, 0, 128, 128, 128);
    rg.addColorStop(0, 'rgba(255,246,206,1)'); rg.addColorStop(0.22, 'rgba(255,196,80,0.8)');
    rg.addColorStop(0.55, 'rgba(255,120,24,0.28)'); rg.addColorStop(1, 'rgba(255,90,10,0)');
    gc.fillStyle = rg; gc.fillRect(0, 0, 256, 256); glow.refresh();
    // Dusk at the top and bottom of the screen, so the words sit on something calm.
    const veil = this.textures.createCanvas('menuveil', 4, H), vc = veil.getContext();
    const lg = vc.createLinearGradient(0, 0, 0, H);
    lg.addColorStop(0, 'rgba(34,6,0,0.5)'); lg.addColorStop(0.12, 'rgba(34,6,0,0.3)'); lg.addColorStop(0.24, 'rgba(34,6,0,0)');
    lg.addColorStop(0.6, 'rgba(34,6,0,0)'); lg.addColorStop(0.7, 'rgba(34,6,0,0.78)'); lg.addColorStop(1, 'rgba(26,4,0,0.94)');
    vc.fillStyle = lg; vc.fillRect(0, 0, 4, H); veil.refresh();
  }

  // Looking straight down the well. Every tier is a square ring of four stair-walls; the
  // rings grow as we sink, and when one has grown a whole tier the cycle starts again, so
  // the descent never ends.
  drawWell(time) {
    const g = this.menu.g, cx = W / 2, cy = WELL.cy;
    if (!g.visible) { this.menu.embers.tilePositionY += 0.5; return; }     // the title picture stands in for the drawn shaft
    const t = (time / WELL.period) % 1, sway = Math.sin(time / 4300) * 0.06;
    const corners = (r, a) => {
      const c = Math.cos(a) * r, sn = Math.sin(a) * r;
      return [{ x: cx - c + sn, y: cy - sn - c }, { x: cx + c + sn, y: cy + sn - c }, { x: cx + c - sn, y: cy + sn + c }, { x: cx - c - sn, y: cy - sn + c }];
    };
    const mix = (p, q, f) => ({ x: p.x + (q.x - p.x) * f, y: p.y + (q.y - p.y) * f });
    g.clear();
    for (let i = 0; i < WELL.tiers; i++) {
      const d = i - t, ro = WELL.size * Math.pow(WELL.k, d);
      const O = corners(ro, d * WELL.twist + sway), I = corners(ro * WELL.k, (d + 1) * WELL.twist + sway);
      for (let side = 0; side < 4; side++) {
        const a = O[side], b = O[(side + 1) % 4], c = I[(side + 1) % 4], e = I[side];
        g.fillStyle(wellColour(d + 0.5, WELL.shade[side] * 0.6), 1);
        g.fillPoints([a, b, c, e], true);
        g.fillStyle(wellColour(d + 0.5, WELL.shade[side]), 1);
        for (let k = 0; k < WELL.steps; k++) {
          const p0 = mix(a, b, k / WELL.steps), p1 = mix(a, b, (k + 1) / WELL.steps), q = mix(e, c, (k + 0.5) / WELL.steps);
          g.fillTriangle(p0.x, p0.y, p1.x, p1.y, q.x, q.y);
        }
      }
      g.lineStyle(1, wellColour(d, 1.3), 0.55);
      g.strokePoints(O, true);
    }
    // The water that has been won back: a pool rising from the bottom of the shaft. Dry
    // at first, so the molten floor shows; full, and it reaches the fourth tier.
    const fill = Math.min(1, (session.water || 0) / WELL_FULL);
    if (fill > 0) {
      const r = 72 + 118 * fill, d = Math.log(r / WELL.size) / Math.log(WELL.k);
      const pool = corners(r, d * WELL.twist + sway);
      g.fillStyle(0x1f8f80, 0.8); g.fillPoints(pool, true);
      g.lineStyle(2, 0xbff5ea, 0.55); g.strokePoints(pool, true);
      const ripple = 0.55 + 0.25 * ((time / 2600) % 1);
      g.lineStyle(1.5, 0xbff5ea, 0.5 * (1 - (time / 2600) % 1));
      g.strokePoints(corners(r * ripple, d * WELL.twist + sway), true);
    }
    this.menu.embers.tilePositionY += 0.5;
  }

  // ---------- TITLE SCREEN / HUB ----------
  // One screen, not two: the title, the way into a run, and the two upgrades. A separate
  // title in front of a separate hub would put three taps between a player and a fight.
  showHub() {
    this.clearUI();
    this.clearToasts();
    this.state = 'hub';
    this.cameraOn = false;
    this.aimCamera(true);
    this.hudOnTop(false);
    this.setHudLine('', '');
    this.showPauseButton(false);
    this.setFloor(1);
    Surround.backdrop('title');           // beside the game, the stepwell of the title picture (2.54)
    this.playMusic('hub');
    this.makeMenuTextures();

    const cx = W / 2, cy = WELL.cy;
    const g = this.add.graphics().setDepth(10);
    const embers = this.add.tileSprite(cx, H / 2, W, H, 'bg_stars').setTint(FORGE.gold).setAlpha(0.3).setDepth(10.2);
    const glow = this.add.image(cx, cy, 'coreglow').setDisplaySize(250, 250).setDepth(10.3).setBlendMode(Phaser.BlendModes.ADD);
    const veil = this.add.image(cx, H / 2, 'menuveil').setDisplaySize(W, H).setDepth(10.5);
    this.uiObjects.push(g, embers, glow, veil);
    this.menu = { g, embers };
    // The title picture (requirements 2.21, 2.48; the founder's own): a stepwell seen from
    // above, lit by lamps, and the hero on its ledge looking down at the pool. It is cut to
    // the screen with its pool at the way in (tools/fit-title.py) and stands still; the
    // embers and the glow move over it. The glow lies on the water, short of where he
    // stands. If the file is missing, the shaft drawn in code shows instead.
    const pictured = this.textures.exists('title_art');
    if (pictured) {
      g.setVisible(false);
      this.uiObjects.push(this.add.image(cx, H / 2, 'title_art').setDisplaySize(W, H).setDepth(10.1));
      glow.setPosition(cx, cy - 12).setDisplaySize(226, 124).setAlpha(0.38);
    }
    this.tweens.add(pictured ? { targets: glow, alpha: 0.6, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' }
      : { targets: glow, scale: glow.scale * 1.14, alpha: 0.78, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    this.drawWell(this.time.now);

    const say = (x, y, str, style) => {
      const t = this.add.text(x, y, str, Object.assign({ resolution: RES }, style)).setOrigin(0.5);
      this.uiObjects.push(t);
      return t;
    };
    say(cx, 84, GAME_TITLE, { fontSize: '54px', color: '#ffd23c', display: true,
      shadow: { offsetX: 0, offsetY: 3, color: '#5c2a05', blur: 8, fill: true } });
    // Who is descending (requirements 2.32): the player's own name, or the way to give one.
    const named = !!session.nickname;
    const who = say(cx, 27, named ? `${session.nickname}  ·  rename` : 'Name yourself', { fontSize: '11px', color: named ? '#f0dcc0' : '#ffd23c', fontStyle: 'bold' });
    this.uiObjects.push(this.glass(this.add.graphics(), cx, 27, who.width + 28, 24, { fill: FORGE.panel, alpha: 0.6, stroke: named ? FORGE.bronze : FORGE.gold, strokeAlpha: named ? 0.5 : 0.9, radius: 12, sheen: 0.08 }));
    const whoHit = this.add.rectangle(cx, 27, who.width + 40, 36, 0xffffff, 0).setInteractive({ useHandCursor: true });
    whoHit.on('pointerdown', () => { this.sfx('ui-click'); this.nameYourself(() => this.showHub()); });
    this.uiObjects.push(whoHit);
    // The goal, in the first thing a player reads.
    say(cx, 136, `${N.enemies.megaboss} has drunk the well dry.\nDescend ${['no', 'one', 'two', 'three', 'four', 'five'][FINAL_SECTOR] || FINAL_SECTOR} ${N.stage.toLowerCase()}s and take the water back.`,
      { fontSize: '13px', color: '#fffbef', align: 'center', lineSpacing: 3, stroke: '#2a0800', strokeThickness: 3 });

    // The way in sits at the bottom of the well: you press the light you are falling toward.
    // With the picture, the pool itself is the way in: a ring of gold round its water, open
    // at the foot where the hero stands before it, and the words on the water over his head.
    let ring, core;
    if (pictured) {
      ring = this.add.graphics({ x: cx, y: cy + 1 });
      ring.lineStyle(2.5, MAT.amber, 0.95);
      ring.strokePoints(Array.from({ length: 77 }, (_, i) => { const a = Phaser.Math.DegToRad(118 + i * 4); return { x: Math.cos(a) * 79, y: Math.sin(a) * 47 }; }));
      core = this.add.circle(cx, cy, 54, BTN.primary, 0.001);
      this.tweens.add({ targets: ring, scale: 1.1, alpha: 0.4, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
    } else {
      ring = this.add.circle(cx, cy, 60, 0x000000, 0).setStrokeStyle(2, FORGE.gold, 0.8);
      core = this.add.circle(cx, cy, 54, BTN.primary, 0.96).setStrokeStyle(3, FORGE.gold, 1);
      this.tweens.add({ targets: ring, scale: 1.3, alpha: 0, duration: 1700, repeat: -1, ease: 'Cubic.easeOut' });
    }
    core.setInteractive(new Phaser.Geom.Circle(54, 54, 54), Phaser.Geom.Circle.Contains);
    core.input.cursor = 'pointer';
    core.on('pointerdown', () => { this.sfx('ui-click'); this.startRun(); });
    this.uiObjects.push(ring, core);
    if (pictured) {
      say(cx, cy - 18, 'DESCEND', { fontSize: '21px', color: '#fffbef', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 5 });
      say(cx, cy + 2, 'start a run', { fontSize: '10px', color: '#ffe9a0', stroke: '#2a0800', strokeThickness: 3 });
    } else {
      say(cx, cy - 5, 'DESCEND', { fontSize: '19px', color: '#fffbef', fontStyle: 'bold' });
      say(cx, cy + 16, 'start a run', { fontSize: '10px', color: '#ffe9a0' });
    }

    // Which depth of the well this run goes down (requirements 2.30).
    const openDepth = Math.min(DEPTH_MAX, session.depthsWon + 1), pick = Phaser.Math.Clamp(session.depthPick || openDepth, 1, openDepth), dp = DEPTHS[pick];
    const dy = pictured ? TITLE_ART.depthY : 396;         // above the well with the picture: the hero stands where it was
    this.uiObjects.push(this.glass(this.add.graphics(), cx, dy, 348, 66, { fill: FORGE.panel, alpha: 0.62, stroke: FORGE.gold, strokeAlpha: 0.55, radius: 14, sheen: 0.06 }));
    say(cx, dy - 17, `DEPTH ${pick} OF ${DEPTH_MAX}  ·  ${dp.name.toUpperCase()}`, { fontSize: '12px', color: '#ffd23c', fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 3 });
    say(cx, dy + 1, dp.twist, { fontSize: '10px', color: '#f0dcc0', align: 'center', stroke: '#2a0800', strokeThickness: 2, wordWrap: { width: 262 } });
    // What every depth past the first adds besides its own hardship, and what it pays.
    const won = pick <= session.depthsWon, health = Math.round(DEPTH_HEALTH * (pick - 1) * 100), gold = Math.round(DEPTH_GOLD * (pick - 1) * 100);
    say(cx, dy + 18, pick === 1 ? (won ? 'won: no water here' : 'win it and depth 2 opens')
      : won ? `+${health}% health  ·  strays  ·  +${gold}% ${N.currency}  ·  won, no water`
      : `+${health}% enemy health  ·  a stray in ${STRAYS.says[pick]} wave${STRAYS.says[pick] === 'every' ? '' : 's'}  ·  +${gold}% ${N.currency}`,
      { fontSize: '9px', color: '#c8a96e', stroke: '#2a0800', strokeThickness: 2 });
    if (openDepth > 1) {
      const step = d => () => { session.depthPick = Phaser.Math.Clamp(pick + d, 1, openDepth); saveSession(); this.showHub(); };
      if (pick > 1) this.makeButton(cx - 152, dy, 30, 34, '<', BTN.quiet, step(-1), { size: 14, sound: 'ui-page' });
      if (pick < openDepth) this.makeButton(cx + 152, dy, 30, 34, '>', BTN.quiet, step(1), { size: 14, sound: 'ui-page', stroke: FORGE.gold });
    }
    say(cx, 441, (session.bestSector ? `Deepest: ${N.stage} ${session.bestSector}` : 'No descent yet') + `  ·  ${wellLine()}`,
      { fontSize: '11px', color: session.water > 0 ? '#9fe8d8' : '#c8a96e' });
    { const purse = say(cx, 463, `${N.currency}: ${session.metaGold}`, { fontSize: '20px', color: '#ffd23c', fontStyle: 'bold' });
      if (this.painted) { purse.x += 12; this.uiObjects.push(this.icon(purse.x - purse.width / 2 - 14, 463, ['sign-treasure'], 19)); } }
    if (this.powerText) this.setPower('');

    // Exponential, not linear: linear costs let Vitality outgrow every sector. Levels
    // now plateau around 8-12 unless a player commits to many deep runs.
    const vitCost = upgradeCost('vitalityLevel', session.vitalityLevel);
    const powCost = upgradeCost('powerLevel', session.powerLevel);
    const buy = (cost, level) => () => {
      if (session.metaGold < cost) { this.sfx('ui-error'); return; }
      session.metaGold -= cost; session[level]++; saveSession();
      this.sfx('ui-confirm');
      this.showHub();
    };
    const card = (x, name, level, effect, cost, key) => {
      const can = session.metaGold >= cost;
      this.uiObjects.push(this.glass(this.add.graphics(), x, 530, 178, 96, { alpha: 0.5, stroke: can ? FORGE.gold : FORGE.bronze, strokeAlpha: can ? 0.9 : 0.45, radius: 14, sheen: 0.07 }));
      say(x, 497, name, { fontSize: '11px', color: '#c8a96e', fontStyle: 'bold' });
      say(x, 515, `Rank ${level}  ·  ${effect}`, { fontSize: '12px', color: '#fffbef' });
      this.makeButton(x, 550, 152, 32, `${cost} ${N.currency}`, can ? BTN.plain : BTN.off, buy(cost, key),
        { sound: null, size: 14, color: can ? '#fffbef' : '#8a7360' });
    };
    card(104, 'VITALITY', session.vitalityLevel, `+${session.vitalityLevel * 10}% max HP`, vitCost, 'vitalityLevel');
    card(296, 'POWER', session.powerLevel, `+${session.powerLevel * 8}% damage`, powCost, 'powerLevel');

    const locked = this.lockedPowerCount();
    say(cx, 598, locked > 0 ? `${locked} power${locked === 1 ? '' : 's'} still locked — descend to find them` : 'all powers unlocked',
      { fontSize: '11px', color: locked > 0 ? '#ffd23c' : '#b8a58e' });
    const small = (x, label, fn) => this.makeButton(x, 634, 70, 34, label, BTN.quiet, fn, { size: 10 });
    small(48,  'PROFILE',  () => this.showProfile(() => this.closeOverlay()));
    small(124, 'POWERS',   () => this.showCodex());
    small(200, 'HELP',     () => this.showHowTo(0, () => this.closeOverlay()));
    small(276, 'SETTINGS', () => this.showSettings(() => this.closeOverlay()));
    small(352, 'FEEDBACK', () => Feedback.open());
    say(cx, 676, 'build ' + BUILD, { fontSize: '8px', color: '#6b4a2e' });

    // Everything above sits over the well, which itself covers the arena and the HUD.
    this.uiObjects.forEach(o => { if (o.depth === 0) o.setDepth(o.type === 'Text' ? 13 : 12); });
  }

  // ---------- CODEX ----------
  // How many effects the player has not yet reached the depth to see drop. Surfaced on
  // the hub button because "3 still locked" is a far better reason to press Descend
  // than any amount of copy about replayability.
  lockedPowerCount() {
    const reached = session.bestSector || 1;
    const items = [...Object.entries(WEAPON_EFFECTS), ...Object.entries(TRINKET_EFFECTS)]
      .filter(([k, e]) => k !== 'none' && e.minSector > reached).length;
    return items + (session.tejasUnlocked ? 0 : 1);
  }

  // Tabbed so it scales: three short pages instead of one tall list that overflowed its
  // border on narrow screens. Every line is word-wrapped to the panel width.
  showCodex(tab = 'weapons', metal = 'common') {
    this.clearUI();
    this.state = 'hub';
    const reached = session.bestSector || 1;
    const b = this.viewBounds;
    const textX = 80, wrap = b.right - textX - 12;       // never past the arena border

    // A backing panel keeps the text readable over the rangoli floor.
    this.uiObjects.push(this.add.rectangle(W / 2, HUD_H + (H - HUD_H) / 2, W, H - HUD_H, 0x160803, 0.9));
    this.uiObjects.push(this.glass(this.add.graphics(), b.centerX, b.centerY + 4, b.width + 16, b.height + 6, { kind: 'panel', alpha: 0.92 }));
    this.uiObjects.push(this.add.text(W/2, 30, 'POWERS', { resolution: RES, fontSize: '22px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(0.5));
    this.uiObjects.push(this.add.text(W/2, 56, `found in the depths · deepest ${N.stage.toLowerCase()} ${reached}`, { resolution: RES, fontSize: '11px', color: '#c8a96e' }).setOrigin(0.5));

    const tabs = [['weapons', 'WEAPONS'], ['trinkets', 'TRINKETS'], ['tejas', N.supercharge.toUpperCase()], ['boons', 'BOONS']];
    tabs.forEach(([key, label], i) => {
      const tx = b.centerX + (i - 1.5) * 84, active = key === tab;
      const btn = this.add.rectangle(tx, b.y + 24, 78, 30, active ? 0x7a3a0a : 0x3a1a08, 1)
        .setStrokeStyle(1, active ? FORGE.gold : FORGE.bronze, active ? 1 : 0.5)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => { this.sfx('ui-page'); this.showCodex(key); });
      const t = this.add.text(tx, b.y + 24, label, { resolution: RES, fontSize: '11px', fontStyle: 'bold',
        color: active ? '#ffd23c' : '#c8a96e' }).setOrigin(0.5);
      this.uiObjects.push(btn, t);
    });

    const row = (y, ref, title, gloss, body, unlocked) => {
      const dim = !unlocked, pic = this.icon(48, y, [ref[0], ref[1], dim ? 0x5a4535 : ref[2]], 28);
      if (dim && this.painted) pic.setAlpha(0.4);
      this.uiObjects.push(
        pic,
        this.add.text(textX, y - 17, title, { resolution: RES, fontSize: '13px', fontStyle: 'bold',
          color: dim ? '#7a6656' : '#fffbef', wordWrap: { width: wrap } }),
        this.add.text(textX, y - 1, gloss, { resolution: RES, fontSize: '10px', fontStyle: 'italic',
          color: dim ? '#6b5847' : '#e8a868', wordWrap: { width: wrap } }),
        this.add.text(textX, y + 13, body, { resolution: RES, fontSize: '10px',
          color: dim ? '#6b5847' : '#c8a96e', wordWrap: { width: wrap } })
      );
    };

    let y = b.y + 84;
    const step = 66;
    if (tab === 'weapons' || tab === 'trinkets') {
      const table = tab === 'weapons' ? WEAPON_EFFECTS : TRINKET_EFFECTS;
      const tint = tab === 'weapons' ? 0xff8c42 : 0x4dd0ff;
      for (const [key, def] of Object.entries(table)) {
        if (key === 'none') continue;                     // the starting Katar is not a discovery
        const unlocked = def.minSector <= reached;
        row(y, [`loot-${key}-rare`, 'icon_' + key, tint], def.label, def.meaning,
            unlocked ? def.desc : `Locked — reaches you on ${N.stage.toLowerCase()} ${def.minSector}`, unlocked);
        y += step;
      }
      this.uiObjects.push(this.add.text(b.centerX, y + 6,
        `${metalList()}. Finer metal, stronger effect. About 1 drop in 4 is unidentified: riskier, better odds.`,
        { resolution: RES, fontSize: '10px', color: '#b8a58e', align: 'center', wordWrap: { width: b.width - 40 } }).setOrigin(0.5, 0));
    } else if (tab === 'boons') {
      // One short page per metal, so the rows keep the size they have on the other tabs.
      ['common', 'rare', 'epic'].forEach((m, i) => {
        const mx = b.centerX + (i - 1) * 104, active = m === metal, col = RARITY[m].color;
        const chip = this.add.rectangle(mx, b.y + 58, 96, 24, active ? 0x5c2a05 : 0x2a0f04, 1)
          .setStrokeStyle(1.5, col, active ? 1 : 0.45).setInteractive({ useHandCursor: true });
        chip.on('pointerdown', () => { this.sfx('ui-page'); this.showCodex('boons', m); });
        this.uiObjects.push(chip, this.add.text(mx, b.y + 58, N.metals[m].toUpperCase(), { resolution: RES, fontSize: '10px', fontStyle: 'bold',
          color: '#' + col.toString(16).padStart(6, '0') }).setOrigin(0.5).setAlpha(active ? 1 : 0.6));
      });
      const about = { common: 'These add to your stats, and each can be taken three times.',
                      rare: 'These change how you fight.',
                      epic: 'These build on what you carry, and are offered only when they apply.' }[metal];
      this.uiObjects.push(this.add.text(b.centerX, b.y + 90, `You pick one of three after every wave. ${about}`,
        { resolution: RES, fontSize: '10px', color: '#e8a868', align: 'center', wordWrap: { width: b.width - 40 } }).setOrigin(0.5));
      y = b.y + 128;
      for (const [key, def] of Object.entries(BOONS)) {
        if (def.metal !== metal) continue;
        const notes = [N.boons[key][1]];
        if (def.max === 2) notes.push('can be taken twice');
        if (def.not) notes.push(`not with ${N.boons[def.not][0]}`);
        if (def.weapon) notes.push(`${WEAPON_EFFECTS[def.weapon].label} only`);
        if (def.tejas) notes.push(`once ${N.supercharge} has woken`);
        row(y, boonIcon(key), N.boons[key][0], notes.filter(Boolean).join(' · '), def.desc, true);
        y += 62;
      }
    } else {
      const on = session.tejasUnlocked;
      this.uiObjects.push(this.add.text(b.centerX, y - 22,
        on ? `Kill to charge. When full, tap ${N.supercharge.toUpperCase()} (or Space) to unleash. The form follows your weapon.`
           : `Locked — ${N.supercharge} awakens the first time you reach ${N.stage.toLowerCase()} ${TEJAS_UNLOCK_SECTOR}.`,
        { resolution: RES, fontSize: '10px', color: on ? '#e8a868' : '#ffd23c', align: 'center',
          wordWrap: { width: b.width - 40 } }).setOrigin(0.5, 0.5));
      y += 24;
      for (const [key, f] of Object.entries(TEJAS_FORMS)) {
        row(y, formIcon(key), f.name, `${f.meaning} · with ${WEAPON_EFFECTS[key].label}`, f.desc, on);
        y += step - 4;
      }
    }

    this.makeButton(W/2, H - 56, 160, 40, 'BACK', 0x5c2a05, () => this.showHub());
  }

  // What an item does, with its numbers. The same line serves equipped and stored items,
  // so a copper and a gold version of one item can be told apart before choosing.
  itemLine(item) {
    if (item.type === 'weapon') {
      const def = WEAPON_EFFECTS[item.effect] || WEAPON_EFFECTS.none;
      return `${def.desc} · ${Math.round(item.dmg)} damage${item.shots > 1 ? `, ${item.shots} targets` : ''}`;
    }
    const def = TRINKET_EFFECTS[item.effect];
    const number = {
      vitality: `+${Math.round(item.hpBonus)} max health`,
      aegis:    `one block every ${Math.round(item.rechargeMs / 1000)}s`,
      thorns:   `${Math.round(item.reflectPct * 100)}% reflected`,
      swift:    `+${item.speedBonus} speed`,
      regen:    `${item.regenPerSec} health a second`
    }[item.effect];
    return number ? `${def.desc} · ${number}` : def.desc;
  }

  showSatchel() {
    this.satchelNew = false; this.refreshSatchel();          // what is new in it is seen now
    this.openOverlay(0.8);
    const cx = W / 2, left = cx - 161;
    this.ovPanel(cx, 362, 350, 600);
    this.ovText(cx, 92, N.satchel.toUpperCase(), { fontSize: '22px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(0.5);
    this.ovText(cx, 115, 'the fight is paused', { fontSize: '10px', color: '#c8a96e' }).setOrigin(0.5);

    const heading = (y, str) => this.ovText(left, y, str, { fontSize: '10px', color: '#b8a58e', fontStyle: 'bold' });
    const row = (y, item, onTap) => {
      this.glass(this.ov(this.add.graphics()), cx, y, 322, 38, { fill: onTap ? FORGE.panel : 0x2a0f04, alpha: 0.6, stroke: onTap ? FORGE.bronze : 0x6b4a2e, strokeAlpha: onTap ? 0.8 : 0.5, radius: 9, sheen: 0.06 });
      const bg = this.ov(this.add.rectangle(cx, y, 322, 38, 0xffffff, 0));
      if (onTap) { bg.setInteractive({ useHandCursor: true }); bg.on('pointerdown', onTap); }
      this.ov(this.icon(left + 22, y, lootIcon(item), 24), 102);
      this.ovText(left + 44, y - 16, item.name, { fontSize: '12px', color: '#fffbef', fontStyle: 'bold' });
      this.ovText(left + 44, y + 1, this.itemLine(item), { fontSize: '10px', color: '#c8a96e' });
      // A weapon says which power Overdrive gives with it; gold when it is not the one held now (build 0.23).
      const power = item.type === 'weapon' && session.tejasUnlocked ? TEJAS_FORMS[item.effect || 'none'] || TEJAS_FORMS.none : null;
      this.ovText(left + 316, y - 15, power ? `${N.supercharge}: ${power.name}` : item.type,
        { fontSize: '8px', color: power && power !== this.tejasForm() ? '#ffd23c' : '#b8a58e', fontStyle: power ? 'bold' : '' }).setOrigin(1, 0);
    };

    heading(134, 'EQUIPPED');
    row(168, this.player.weapon);
    if (this.player.trinket) row(210, this.player.trinket);
    else this.ovText(cx, 210, 'No trinket yet - they drop from enemies', { fontSize: '10px', color: '#b8a58e' }).setOrigin(0.5);

    heading(238, this.inventory.length ? 'STORED · tap one to equip it' : 'STORED');
    if (!this.inventory.length) {
      this.ovText(cx, 300, 'Nothing stored yet.\nWhat you find that is not better than\nwhat you hold, and what you replace, lands here.', { fontSize: '11px', color: '#b8a58e', align: 'center', lineSpacing: 4 }).setOrigin(0.5);
    }
    this.inventory.forEach((item, i) => row(272 + i * 40, item, () => this.equipFromSatchel(i)));

    this.ovButton(cx, 620, 220, 42, 'BACK TO THE FIGHT', 0x7a3a0a, () => this.resumeGame(), { sound: null, stroke: FORGE.gold, size: 14 });
  }

  showSectorClearChoice(isMega) {
    this.prepaintFloor(this.sector + 1);
    if (isMega) return this.showVictory();
    this.state = 'sectorChoice';
    this.clearUI();
    this.playMusic('hub');   // the decision is a breath between fights
    const say = (y, str, size, colour) => this.uiObjects.push(this.add.text(W/2, y, str,
      { resolution: RES, fontSize: size + 'px', color: colour, align: 'center', lineSpacing: 4 }).setOrigin(0.5));
    // Boons still waiting can be taken here, before the decision: the panel grows a row.
    const waiting = this.boonQueue.length, grow = waiting ? 42 : 0;
    this.uiPanel(W/2, H/2 + grow / 2, W-50, 320 + grow, 0x2fbf71);
    this.uiObjects.push(this.add.text(W/2, H/2-125, `${N.stage.toUpperCase()} CLEARED`, { resolution: RES, fontSize: '19px', color: '#2fbf71', fontStyle: 'bold' }).setOrigin(0.5));
    const ahead = this.sector < FINAL_SECTOR ? ` ${N.enemies.megaboss} waits ${levelsBelow(this.sector)}.` : '';
    say(H/2-92, `${sectorTitle(this.sector)} is cleared.${ahead}`, 13, '#fffbef');
    say(H/2-68, (this.lastWater > 0 ? `+${this.lastWater} water for the well` : 'No new water') + `  ·  ${wellLine()}`, 12, '#9fe8d8');
    say(H/2-44, `${N.currency} carried: ${this.runGold}`, 13, '#ffd23c');
    say(H/2-2, 'Extract now and bank all of it,\nor descend for tougher fights and\nbetter loot. Fall, and half is lost.', 12, '#c8a96e');

    if (waiting) {
      this.makeButton(W/2, H/2+50, 230, 32, `Choose your boon${waiting > 1 ? 's' : ''} first (${waiting})`, BTN.plain, () => this.openBoons(), { size: 12, stroke: FORGE.gold });
      this.choiceBoonTxt = this.uiObjects[this.uiObjects.length - 1];
    }
    this.makeButton(W/2, H/2+72+grow, 230, 46, 'Extract — Bank & End Run', BTN.quiet, () => this.endRun(true));
    this.makeButton(W/2, H/2+126+grow, 230, 46, `Descend to ${N.stage} ${this.sector+1}`, BTN.primary, () => this.descend(), { stroke: FORGE.gold });
    this.raiseUI();
  }

  // The ending. The final boss is dead, so the run has been won whatever happens next;
  // surfacing banks everything, and the endless depths below are there for those who
  // want more.
  showVictory() {
    this.state = 'sectorChoice';
    this.clearUI();
    this.playMusic('hub');
    const full = session.water >= WELL_FULL, firstFull = full && !session.wellFullSeen;
    if (firstFull) { session.wellFullSeen = true; saveSession(); }
    const say = (y, str, size, colour) => this.uiObjects.push(this.add.text(W/2, y, str,
      { resolution: RES, fontSize: size + 'px', color: colour, align: 'center', lineSpacing: 4 }).setOrigin(0.5));
    this.uiPanel(W/2, H/2 + 10, W-50, 386, FORGE.gold);
    this.uiObjects.push(this.add.text(W/2, H/2-142, firstFull ? 'THE WELL IS FULL' : 'THE WATERS RETURN',
      { resolution: RES, fontSize: '23px', color: '#ffd23c', fontStyle: 'bold' }).setOrigin(0.5));
    say(H/2-104, firstFull
      ? `Every drop ${N.enemies.megaboss} took is back in the well.\nYou have finished the game. Thank you for playing.`
      : session.nickname ? `${session.nickname} has slain ${N.enemies.megaboss}.\nThe water he hoarded rises through the well again.`
      : `${N.enemies.megaboss} is slain, and the water he hoarded\nrises through the well again.`, 13, '#fffbef');
    say(H/2-62, `+${this.runWater} water this run  ·  ${wellLine()}`, 13, '#9fe8d8');
    const news = this.depthNews || { depth: this.tier, won: false }, next = DEPTHS[news.depth + 1];
    say(H/2-40, !news.won ? `Depth ${news.depth} was already won: no new water.`
      : next ? `Depth ${news.depth} is won. Depth ${news.depth + 1} opens: ${next.name}.` : 'The seventh depth is won.', 12, '#ffd23c');
    const got = this.perksEarned || [];
    if (got.length) say(H/2-21, `Perk earned: ${PERKS[got[got.length - 1]].name}`, 12, '#e2b6ff');
    say(H/2-1, `${N.currency} carried: ${this.runGold}`, 13, '#ffd23c');
    say(H/2+40, `Surface now and bank all of it,\nor go on into ${N.deeper[0]}, the endless depths.\nFall there, and half is lost.`, 12, '#c8a96e');

    this.makeButton(W/2, H/2+104, 240, 46, 'Surface — Bank & End Run', BTN.primary, () => this.endRun(true), { stroke: FORGE.gold });
    this.makeButton(W/2, H/2+158, 240, 46, `Descend into ${N.deeper[0]}`, BTN.quiet, () => this.descend());
    this.raiseUI();
  }
}
