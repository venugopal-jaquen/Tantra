/*
 * Loot Chase - automated playtest bot.
 *
 * Plays complete runs headlessly (game logic only, no rendering) at ~80x real time, and
 * records per-sector balance metrics: HP lost, time spent, kills, boss-fight length,
 * dead time, Tejas uses, plus any runtime errors and display-list leaks.
 *
 * It plays like a competent-but-not-perfect human: kites enemies while staying inside
 * weapon range, sidesteps slam telegraphs, grabs loot that is not crowded, fires Tejas
 * as soon as it is full, and always chooses Descend until its target sector.
 *
 * Usage (browser console, with the game open):
 *   const s = document.createElement('script'); s.src = '../tools/playtest-bot.js';
 *   document.head.appendChild(s);
 *   // then:
 *   PlaytestBot.start([{ name: 'fresh', vit: 0, pow: 0, target: 5 }]);
 *   while (!PlaytestBot.done()) PlaytestBot.tick(15000);   // run in chunks
 *   PlaytestBot.report();
 *
 * It overwrites the saved session while running and restores it on report(). Run it
 * against a local copy, never on a player's machine.
 */
(function () {
  const DT = 16.67;
  const g = () => window.game;
  const S = () => window.game.scene.keys.LootScene;

  let queue = [], cur = null, results = [], t = 0, backup = null, errors = [], baseline = null;

  window.addEventListener('error', e => errors.push(`${e.message} @${e.lineno}`));

  function press(label) {
    const s = S();
    const hit = s.uiObjects.find(o => o.type === 'Rectangle' && o.input &&
      s.uiObjects.some(x => x.type === 'Text' && x.text === label && Math.abs(x.y - o.y) < 3));
    if (hit) hit.emit('pointerdown');
    return !!hit;
  }
  // Objects still mid-tween are transient FX that destroy themselves when the tween ends.
  // Under headlessStep Phaser's tweens barely advance (they measure real elapsed time),
  // so counting them reports a phantom leak. A real leak is something nothing will ever
  // clean up - i.e. not being tweened.
  const countChildren = () => S().children.list.filter(o => !S().tweens.isTweening(o)).length;

  // ---------- the player's brain ----------
  function steer() {
    const s = S(), p = s.player, b = s.arenaBounds;
    let vx = 0, vy = 0, danger = false;

    for (const e of s.enemies) {                              // 1. get out of slam zones
      const sl = e.slam;
      if (!sl) continue;
      if (sl.type === 'circle') {
        const d = Math.hypot(p.x - sl.x, p.y - sl.y) || 1;
        if (d < sl.r + 14) { danger = true; vx += (p.x - sl.x) / d * 6; vy += (p.y - sl.y) / d * 6; }
      } else if (sl.type === 'line') {
        const dx = p.x - sl.x, dy = p.y - sl.y;
        const along = dx * Math.cos(sl.a) + dy * Math.sin(sl.a);
        const across = -dx * Math.sin(sl.a) + dy * Math.cos(sl.a);
        if (along > -10 && along < sl.len + 10 && Math.abs(across) < sl.w / 2 + 14) {
          danger = true;
          const side = across >= 0 ? 1 : -1;
          vx += -Math.sin(sl.a) * side * 6; vy += Math.cos(sl.a) * side * 6;
        }
      } else if (sl.blobs) {
        for (const bl of sl.blobs) {
          const d = Math.hypot(p.x - bl.x, p.y - bl.y) || 1;
          if (d < bl.r + 12) { danger = true; vx += (p.x - bl.x) / d * 5; vy += (p.y - bl.y) / d * 5; }
        }
      }
    }

    for (const pr of s.projectiles) {                         // 1b. sidestep incoming bolts
      const dx = p.x - pr.x, dy = p.y - pr.y, d = Math.hypot(dx, dy) || 1;
      const sp = Math.hypot(pr.vx, pr.vy) || 1;
      const closing = (pr.vx * dx + pr.vy * dy) / (sp * d);   // 1 = heading straight at us
      if (d < 130 && closing > 0.75) {
        const side = (pr.vx * dy - pr.vy * dx) >= 0 ? 1 : -1;  // step off the line of fire
        vx += -pr.vy / sp * side * 3.5 * (1 - d / 130);
        vy +=  pr.vx / sp * side * 3.5 * (1 - d / 130);
      }
    }

    let nearest = null, nd = 1e9;                             // 2. kite, but stay in range
    for (const e of s.enemies) {
      const d = Math.hypot(p.x - e.x, p.y - e.y) || 1;
      if (d < nd) { nd = d; nearest = e; }
      const keep = e.isBoss ? 120 : (e.type === 'tank' ? 80 : 60);
      if (d < keep) {
        const k = (keep - d) / keep * (e.isBoss ? 3 : 2);
        vx += (p.x - e.x) / d * k; vy += (p.y - e.y) / d * k;
      }
    }
    if (nearest && !danger && nd > s.player.weapon.range * 0.8) {
      vx += (nearest.x - p.x) / nd * 1.2; vy += (nearest.y - p.y) / nd * 1.2;
    }

    if (!danger && s.pickups.length) {                        // 3. uncrowded loot
      let best = null, bd = 170;
      for (const pk of s.pickups) {
        const d = Math.hypot(pk.x - p.x, pk.y - p.y);
        if (d < bd && !s.enemies.some(e => Math.hypot(e.x - pk.x, e.y - pk.y) < 50)) { bd = d; best = pk; }
      }
      if (best) { vx += (best.x - p.x) / bd * 1.6; vy += (best.y - p.y) / bd * 1.6; }
    }

    vx += (b.centerX - p.x) / b.width * 0.8;                   // 4. stay off the walls
    vy += (b.centerY - p.y) / b.height * 0.8;

    const m = Math.hypot(vx, vy);
    s.pointerTarget = m < 0.05 ? null : { x: p.x + vx / m * 9, y: p.y + vy / m * 9 };
  }

  // ---------- one run ----------
  function sectorRec(s) {
    return { sector: s.sector, secs: 0, dmg: 0, maxHp: Math.round(s.player.maxHp), minHpPct: 100,
             kills: 0, bossSecs: 0, idleSecs: 0, tejasUses: 0, slamHits: 0, meleeHits: 0, rangedHits: 0, dmgBy: {} };
  }

  function beginRun(profile) {
    const s = S();
    if (s.state === 'summary') press('Continue to Hub');
    Object.assign(session, { vitalityLevel: profile.vit, powerLevel: profile.pow });
    if ('tejasUnlocked' in session) session.tejasUnlocked = !!profile.tejas;
    if (baseline === null) baseline = countChildren();
    s.startRun();
    cur = { profile, frames: 0, sectors: [sectorRec(s)], result: null, lastHit: null, capFrames: profile.capMin * 60 * 60 };

    // instrument (on the instance, removed at the end of the run)
    const od = s.damagePlayer.bind(s);
    s.damagePlayer = (a, src, kind) => {
      const r = cur.sectors[cur.sectors.length - 1];
      const blocked = s.player.shieldCharge > 0 || (kind !== 'slam' && s.player.iframes > 0);
      if (!blocked) {
        r.dmg += a; r[(kind || 'melee') + 'Hits']++;
        const who = kind === 'slam' ? 'SLAM:' + (src && src.char) : (src ? (src.isBoss ? 'BOSS-CONTACT:' + src.char : src.char || src.type) : 'rakshasa-bolt');
        r.dmgBy[who] = (r.dmgBy[who] || 0) + a;
      }
      cur.lastHit = { kind, by: src ? (src.char || src.type) : 'projectile', amount: Math.round(a) };
      return od(a, src, kind);
    };
    const ok = s.killEnemy.bind(s);
    s.killEnemy = e => { cur.sectors[cur.sectors.length - 1].kills++; return ok(e); };
    if (s.activateTejas) {   // absent in builds that predate Tejas
      const oa = s.activateTejas.bind(s);
      s.activateTejas = () => { const before = s.tejasActive; oa(); if (s.tejasActive > before) cur.sectors[cur.sectors.length - 1].tejasUses++; };
    }
  }

  function endRun(outcome) {
    const s = S();
    delete s.damagePlayer; delete s.killEnemy; delete s.activateTejas;
    cur.result = outcome;
    cur.finalSector = s.sector;
    cur.gameMin = +(cur.frames * DT / 60000).toFixed(1);
    if (s.state === 'summary') press('Continue to Hub');
    // Let transient FX (damage numbers ~700ms, bursts, slashes) finish and self-destroy
    // before counting - counting too early reports them as a leak.
    for (let i = 0; i < 120; i++) { t += DT; g().headlessStep(t, DT); }
    cur.childrenAtHub = countChildren();
    cur.leak = cur.childrenAtHub - baseline;
    results.push(cur);
    cur = null;
  }

  function frame() {
    const s = S();
    if (s.state === 'playing') {
      steer();
      if (s.tejasBtn && s.tejas >= 100 && s.tejasActive <= 0) s.activateTejas();
    }
    t += DT; g().headlessStep(t, DT); cur.frames++;

    const r = cur.sectors[cur.sectors.length - 1];
    if (s.state === 'playing') {
      r.secs += DT / 1000;
      r.minHpPct = Math.min(r.minHpPct, Math.round(100 * s.player.hp / s.player.maxHp));
      if (s.enemies.some(e => e.isBoss)) r.bossSecs += DT / 1000;
      if (s.enemies.length === 0 && s.spawnQueue.length === 0) r.idleSecs += DT / 1000;
    } else if (s.state === 'sectorChoice') {
      if (s.sector < cur.profile.target) { s.descend(); cur.sectors.push(sectorRec(s)); }
      else { s.endRun(true); endRun('extracted at target'); return; }
    } else if (s.state === 'summary') {
      endRun(`died - last hit ${cur.lastHit ? `${cur.lastHit.amount} (${cur.lastHit.kind}) by ${cur.lastHit.by}` : 'unknown'}`);
      return;
    }
    if (cur.frames >= cur.capFrames) { s.endRun(false); endRun(`time cap (${cur.profile.capMin} min) - possible stall`); }
  }

  window.PlaytestBot = {
    start(profiles) {
      backup = localStorage.getItem('loot-chase-session-v1');
      queue = profiles.map(p => Object.assign({ capMin: 30, tejas: false }, p));
      results = []; errors = []; baseline = null;
      t = performance.now() + 5e6;
    },
    tick(budgetMs = 15000) {
      const t0 = performance.now();
      while (performance.now() - t0 < budgetMs) {
        if (!cur) { if (!queue.length) break; beginRun(queue.shift()); }
        frame();
      }
      return { done: this.done(), finished: results.length, remaining: queue.length + (cur ? 1 : 0) };
    },
    done() { return !cur && !queue.length; },
    report() {
      if (backup !== null) localStorage.setItem('loot-chase-session-v1', backup);
      else localStorage.removeItem('loot-chase-session-v1');
      loadSession();
      return { errors: [...new Set(errors)], runs: results.map(r => ({
        profile: r.profile.name, result: r.result, finalSector: r.finalSector, gameMin: r.gameMin, leak: r.leak,
        sectors: r.sectors.map(x => ({
          S: x.sector, min: +(x.secs / 60).toFixed(1), maxHp: x.maxHp,
          hpLostPct: Math.round(100 * x.dmg / x.maxHp), minHpPct: x.minHpPct, kills: x.kills,
          bossMin: +(x.bossSecs / 60).toFixed(1), idleSec: Math.round(x.idleSecs), tejas: x.tejasUses,
          hits: `${x.meleeHits}m/${x.rangedHits}r/${x.slamHits}s`,
          dmgBy: Object.fromEntries(Object.entries(x.dmgBy).sort((a, b) => b[1] - a[1])
            .map(([k, v]) => [k, Math.round(100 * v / x.maxHp) + '%']))
        }))
      })) };
    }
  };
})();
