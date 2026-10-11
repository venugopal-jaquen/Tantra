/*
 * scene-fx.js: the second layer: how the fight is drawn. No rule is decided here.
 *
 * class FxScene extends UiScene
 * Owns      the faceted effects (fxPiece, chipFx, starFx, novaFx, slamFx, boltFx ...),
 *           what stands round a figure (drawBossFx, drawDome, gild, deathFx, splitFx),
 *           figures and their motion (charSprite, pose, animate, act, release,
 *           enemyLunge, dressHero, and the sizes stockSize, headUp, girth, feetDown),
 *           hit feedback, weapon beams, floors (setFloor, paintFloor, setFrame ...),
 *           the tap mark and the arrows to what is off screen.
 * Needs     ui.js (the effect colours), assets.js (ART, CHARS), floors.js, rules.js.
 * Expects   of the layers above: this.player, this.enemies, this.enemySprites,
 *           this.phase, this.arenaBounds, this.camOff.
 */

class FxScene extends UiScene {
  // ---------- TEJAS EFFECTS (requirements 2.40) ----------
  // The supercharge is drawn in the look of the cast: flat, faceted pieces, each with a
  // face in the light and a face in shade, as if cut from stone or folded from cloth. No
  // soft glows, no round blobs. The pieces are made once, in white and greys, and take a
  // form's two colours as a tint; what lies on the floor is drawn under the figures, and
  // what flies is drawn over them.
  tejasFx() { return TEJAS_FX[(this.player && this.player.weapon && this.player.weapon.effect) || 'none'] || TEJAS_FX.none; }

  makeFxPieces() {
    if (this.textures.exists('fx_shard')) return;
    const K = 3, g = this.make.graphics({ add: false });      // drawn three times the size, for a phone's screen
    const piece = (key, w, h, faces) => {
      g.clear();
      faces.forEach(([tone, pts]) => {
        g.fillStyle(Phaser.Display.Color.GetColor(tone, tone, tone), 1);
        g.fillPoints(pts.map(([x, y]) => ({ x: x * K, y: y * K })), true);
      });
      g.generateTexture(key, w * K, h * K);
    };
    // A long shard, split down its spine: a tongue of flame, a splinter, a drop drawn off.
    piece('fx_shard', 14, 36, [[255, [[7, 0], [0, 13], [7, 36]]], [170, [[7, 0], [14, 13], [7, 36]]]]);
    // A chip of three faces.
    piece('fx_chip', 14, 13, [[255, [[7, 0], [0, 11], [6, 7]]], [205, [[7, 0], [6, 7], [14, 12]]], [150, [[0, 11], [6, 7], [14, 12]]]]);
    // A star of four points, each point two faces.
    const C = 15, I = 4, star = [[C, 0], [C + I, C - I], [2 * C, C], [C + I, C + I], [C, 2 * C], [C - I, C + I], [0, C], [C - I, C - I]];
    piece('fx_star', 30, 30, star.map((pt, i) => [i % 2 ? 165 : 255, [[C, C], pt, star[(i + 1) % 8]]]));
    // A lump of seven faces: smoke, a cloud, a clot.
    const hub = [19, 17], rim = [[22, 1], [37, 8], [42, 23], [31, 37], [13, 38], [2, 26], [6, 9]], tones = [255, 215, 165, 120, 150, 195, 235];
    piece('fx_lump', 44, 40, rim.map((pt, i) => [tones[i], [hub, pt, rim[(i + 1) % 7]]]));
    // A slab of the floor thrown up: its top in the light, its two sides in shade.
    piece('fx_slab', 26, 22, [[255, [[2, 6], [18, 0], [26, 8], [10, 14]]], [140, [[2, 6], [10, 14], [10, 22], [2, 14]]], [190, [[10, 14], [26, 8], [26, 16], [10, 22]]]]);
    g.destroy();
  }

  // One piece, `size` tall, in a form's colours: lit on its left, shaded toward its right.
  fxPiece(key, x, y, size, c, depth = 30) {
    const img = this.add.image(x, y, key).setDepth(depth).setTint(c[0], c[1], c[0], c[1]);
    return img.setScale(size / img.height);
  }

  // Sends a piece on its way and removes it when it gets there.
  fxFade(obj, to, duration, ease = 'Cubic.easeOut') {
    this.tweens.add(Object.assign({ targets: obj, duration, ease, onComplete: () => obj.destroy() }, to));
  }

  // The standing mark of a live supercharge: a garland of facets on the floor at the reach
  // of the power, turning slowly (see updateTejas).
  tejasRing(r, c) {
    const g = this.add.graphics().setDepth(Z.fx), n = Math.max(10, Math.round(r / 7)), w = Phaser.Math.Clamp(r * 0.075, 4, 9);
    const at = (a, d) => ({ x: Math.cos(a) * d, y: Math.sin(a) * d });
    for (let i = 0; i < n; i++) {
      const a0 = i / n * Math.PI * 2, a1 = (i + 0.86) / n * Math.PI * 2, mid = (a0 + a1) / 2;
      g.fillStyle(c[0], 0.8); g.fillPoints([at(a0, r), at(mid, r + w), at(mid, r - w * 0.7)], true);
      g.fillStyle(c[1], 0.8); g.fillPoints([at(mid, r + w), at(a1, r), at(mid, r - w * 0.7)], true);
    }
    return g.setAlpha(0.9);
  }

  // Switching on: shards thrown out from the feet, a star opening over the hero, chips in the air.
  tejasBurst(x, y, c) {
    const n = 12, spin = Math.random() * 6.28;
    for (let i = 0; i < n; i++) {
      const a = spin + i / n * Math.PI * 2;
      const shard = this.fxPiece('fx_shard', x + Math.cos(a) * 10, y + Math.sin(a) * 10, 20, c).setRotation(a - Math.PI / 2);
      this.fxFade(shard, { x: x + Math.cos(a) * 64, y: y + Math.sin(a) * 64, alpha: 0 }, 420);
    }
    const star = this.fxPiece('fx_star', x, y - 6, 18, c);
    this.fxFade(star, { scale: star.scale * 3.4, angle: 50, alpha: 0 }, 460);
    this.chipFx(x, y, c, 8, 34);
  }

  // Chips knocked off where something is struck.
  chipFx(x, y, c, n, reach = 16) {
    for (let i = 0; i < n; i++) {
      const a = Math.random() * 6.28, chip = this.fxPiece('fx_chip', x, y, 6 + Math.random() * 4, c).setRotation(a);
      this.fxFade(chip, { x: x + Math.cos(a) * reach, y: y + Math.sin(a) * reach - reach * 0.6, angle: chip.angle + 140, alpha: 0 }, 300 + Math.random() * 120);
    }
  }

  // A star where a bolt lands or a slam finishes someone.
  starFx(x, y, c) {
    const star = this.fxPiece('fx_star', x, y, 10, c).setRotation(Math.random() * 1.5);
    this.fxFade(star, { scale: star.scale * 2.4, angle: star.angle + 60, alpha: 0 }, 200);
    this.chipFx(x, y, c, 2, 12);
  }

  // Fire: a ring of flame tongues thrown out along the floor to the reach of the nova.
  novaFx(x, y, r, c) {
    const n = 16, spin = Math.random() * 6.28, at = (a, d) => ({ x: Math.cos(a) * d, y: Math.sin(a) * d });
    const ring = this.add.graphics({ x, y }).setDepth(Z.fx);
    ring.lineStyle(3, c[0], 0.95);
    ring.strokePoints(Array.from({ length: n }, (_, i) => at(spin + i / n * Math.PI * 2, r)), true);
    ring.setScale(18 / r);                 // drawn at its full reach and grown to it, so the line ends fine, not fat
    this.fxFade(ring, { scale: 1, alpha: 0 }, 300, 'Linear');
    // Two rows of tongues: a long one that runs to the reach and holds its colour most
    // of the way, and a short one behind it. A star opens where they start.
    const row = (count, size, reach, ms, turn) => {
      for (let i = 0; i < count; i++) {
        const a = spin + (i + turn) / count * Math.PI * 2;
        const tongue = this.fxPiece('fx_shard', x + Math.cos(a) * 14, y + Math.sin(a) * 14, size, c, Z.fx + 0.2).setRotation(a - Math.PI / 2);
        this.tweens.add({ targets: tongue, x: x + Math.cos(a) * reach, y: y + Math.sin(a) * reach, scale: tongue.scale * 2, duration: ms, ease: 'Cubic.easeOut', onComplete: () => tongue.destroy() });
        this.tweens.add({ targets: tongue, alpha: 0, delay: ms * 0.5, duration: ms * 0.5 });
      }
    };
    row(n, 20, r * 0.94, 350, 0.5);
    row(10, 13, r * 0.55, 280, 0);
    const star = this.fxPiece('fx_star', x, y, 20, c, Z.fx + 0.3).setRotation(spin);
    this.fxFade(star, { scale: star.scale * 2.4, angle: star.angle + 45, alpha: 0 }, 240);
  }

  // The slam, the hero's or a boss's: the floor tips up in twelve faces, cracks run out
  // from the blow, and slabs of it jump along them.
  slamFx(x, y, r, c, cracks = 7) {
    const at = (a, d) => ({ x: Math.cos(a) * d, y: Math.sin(a) * d }), spin = Math.random() * 6.28, n = 12;
    const g = this.add.graphics({ x, y }).setDepth(Z.fx);
    for (let i = 0; i < n; i++) {
      const a0 = spin + i / n * Math.PI * 2, a1 = spin + (i + 1) / n * Math.PI * 2;
      g.fillStyle(i % 2 ? c[0] : c[1], i % 2 ? 0.2 : 0.13);
      g.fillPoints([{ x: 0, y: 0 }, at(a0, r), at(a1, r)], true);
    }
    g.lineStyle(2.5, c[0], 0.9);
    g.strokePoints(Array.from({ length: n }, (_, i) => at(spin + i / n * Math.PI * 2, r)), true);
    for (let i = 0; i < cracks; i++) {
      const a = spin + (i + Math.random() * 0.6) / cracks * Math.PI * 2, len = r * (0.55 + Math.random() * 0.4);
      g.fillStyle(0x2a0f04, 0.7); g.fillPoints([at(a - 0.14, 10), at(a + 0.14, 10), at(a, len)], true);      // the crack
      g.fillStyle(c[0], 0.95); g.fillPoints([at(a + 0.14, 10), at(a + 0.2, 10), at(a, len)], true);          // its lit edge
      const slab = this.fxPiece('fx_slab', x + Math.cos(a) * len * 0.8, y + Math.sin(a) * len * 0.8, 11 + Math.random() * 5, c).setRotation((Math.random() - 0.5) * 0.8);
      this.tweens.add({ targets: slab, y: slab.y - 14 - Math.random() * 8, angle: slab.angle + (Math.random() - 0.5) * 60, duration: 170, ease: 'Quad.easeOut', yoyo: true, onComplete: () => slab.destroy() });
      this.tweens.add({ targets: slab, alpha: 0, delay: 200, duration: 130 });
    }
    this.fxFade(g, { alpha: 0 }, 400, 'Quad.easeOut');
  }

  // Poison: lumps of it that keep to the hero and wander round him while the power lasts.
  venomCloud(r, c) {
    return Array.from({ length: 7 }, (_, i) => {
      const lump = this.fxPiece('fx_lump', this.player.x, this.player.y, 26 + (i % 3) * 9, c, Z.fx + 0.1).setAlpha(0.56);
      lump.orbit = { a: i / 7 * Math.PI * 2, d: r * (0.3 + 0.055 * ((i * 37) % 10)), w: (i % 2 ? 1 : -1) * (0.5 + (i % 3) * 0.22), size: lump.scale };
      return lump;
    });
  }
  driftCloud(delta) {
    (this.tejasParts || []).forEach(o => {
      const q = o.orbit;
      q.a += q.w * delta / 1000;
      o.setPosition(this.player.x + Math.cos(q.a) * q.d, this.player.y + Math.sin(q.a) * q.d * 0.8).setRotation(q.a * 0.6).setScale(q.size * (1 + 0.12 * Math.sin(q.a * 3)));
    });
  }

  // The drain: what is taken from an enemy flies to the hero.
  drainFx(x, y, c) {
    for (let i = 0; i < 2; i++) {
      const drop = this.fxPiece('fx_shard', x + (Math.random() - 0.5) * 12, y + (Math.random() - 0.5) * 12, 16, c);
      drop.setRotation(Math.atan2(this.player.y - drop.y, this.player.x - drop.x) - Math.PI / 2);
      this.fxFade(drop, { x: this.player.x, y: this.player.y - 6, scale: drop.scale * 0.4, alpha: 0.2 }, 260 + i * 70, 'Quad.easeIn');
    }
  }

  // Lightning: a bolt in hard angles, a dark band with a bright one laid along it and a
  // facet at every turn, and one short fork.
  boltFx(g, x1, y1, x2, y2, c, thick = 1) {
    const zig = (ax, ay, bx, by, sway) => {
      const len = Math.hypot(bx - ax, by - ay) || 1, n = Math.max(2, Math.round(len / 24)), nx = -(by - ay) / len, ny = (bx - ax) / len, pts = [{ x: ax, y: ay }];
      for (let i = 1; i < n; i++) {
        const t = i / n, off = (i % 2 ? 1 : -1) * Phaser.Math.Between(sway * 0.5, sway);
        pts.push({ x: ax + (bx - ax) * t + nx * off, y: ay + (by - ay) * t + ny * off });
      }
      pts.push({ x: bx, y: by });
      return pts;
    };
    const band = (pts, half, colour, alpha) => {
      g.fillStyle(colour, alpha);
      for (let i = 0; i < pts.length - 1; i++) {
        const a = pts[i], b = pts[i + 1], d = Math.hypot(b.x - a.x, b.y - a.y) || 1, ox = -(b.y - a.y) / d * half, oy = (b.x - a.x) / d * half, k = half * 1.5;
        g.fillPoints([{ x: a.x + ox, y: a.y + oy }, { x: b.x + ox, y: b.y + oy }, { x: b.x - ox, y: b.y - oy }, { x: a.x - ox, y: a.y - oy }], true);
        g.fillPoints([{ x: b.x, y: b.y - k }, { x: b.x + k, y: b.y }, { x: b.x, y: b.y + k }, { x: b.x - k, y: b.y }], true);
      }
    };
    const draw = (pts, thick) => { band(pts, 4.5 * thick, c[1], 0.85); band(pts, 2.2 * thick, c[0], 1); band(pts, 0.8 * thick, 0xffffff, 0.95); };
    const main = zig(x1, y1, x2, y2, 11);
    draw(main, thick);
    if (main.length > 3) {
      const from = main[1 + Math.floor(Math.random() * (main.length - 2))], a = Math.atan2(y2 - y1, x2 - x1) + (Math.random() < 0.5 ? 0.8 : -0.8), reach = 20 + Math.random() * 12;
      draw(zig(from.x, from.y, from.x + Math.cos(a) * reach, from.y + Math.sin(a) * reach, 5), 0.5 * thick);
    }
  }

  // ---------- ROUND A FIGURE (requirements 2.45) ----------
  // The figures stand; the floor is seen from above. What lies on the floor round one of
  // them is therefore drawn as it would be seen there: a ring flattened to an ellipse at
  // its feet, under it. Returns the point at angle `a` on such a ring, `k` times as wide.
  onFloor(x, y, rx) { return (a, k = 1) => ({ x: x + Math.cos(a) * rx * k, y: y + Math.sin(a) * rx * k * FLAT }); }

  // A garland of facets on such a ring: kites, each half in the light and half in shade.
  facetRing(g, x, y, rx, c, alpha, spin = 0, w = 5) {
    const at = this.onFloor(x, y, rx), n = Math.max(10, Math.round(rx / 5)), k = w / rx;
    for (let i = 0; i < n; i++) {
      const a0 = spin + i / n * Math.PI * 2, a1 = spin + (i + 0.84) / n * Math.PI * 2, mid = (a0 + a1) / 2;
      g.fillStyle(c[0], alpha); g.fillPoints([at(a0), at(mid, 1 + k), at(mid, 1 - k * 0.7)], true);
      g.fillStyle(c[1], alpha); g.fillPoints([at(mid, 1 + k), at(a1), at(mid, 1 - k * 0.7)], true);
    }
  }

  // A pool of colour at a figure's feet: a fan of eight faces, light and shade by turns.
  facetPool(g, x, y, rx, colour, alpha, spin) {
    const at = this.onFloor(x, y, rx), n = 8, shade = dim(colour, 0.62);
    for (let i = 0; i < n; i++) {
      g.fillStyle(i % 2 ? colour : shade, alpha);
      g.fillPoints([{ x, y }, at(spin + i / n * Math.PI * 2), at(spin + (i + 1) / n * Math.PI * 2)], true);
    }
    g.lineStyle(1.5, colour, Math.min(1, alpha + 0.25));
    g.strokePoints(Array.from({ length: n }, (_, i) => at(spin + i / n * Math.PI * 2)), true);
  }

  // Plates of armour lying round a boss who resists: six slabs, each with a top of two
  // faces and the one side of it that is turned to us, going slowly round.
  steelPlates(g, x, y, rx, spin) {
    const at = this.onFloor(x, y, rx), n = 6, lip = 4.5, up = p => ({ x: p.x, y: p.y - lip });
    for (let i = 0; i < n; i++) {
      const a0 = spin + i * Math.PI * 2 / n, a1 = a0 + 0.76, am = (a0 + a1) / 2;
      const out = [at(a0, 1.09), at(am, 1.11), at(a1, 1.09)], inn = [at(a0, 0.89), at(am, 0.87), at(a1, 0.89)];
      const side = Math.sin(am) > 0 ? out : inn;                       // near us its outer side shows, far from us its inner
      g.fillStyle(STEEL_FX[1], 0.95); g.fillPoints([...side.map(up), side[2], side[1], side[0]], true);
      g.fillStyle(STEEL_FX[0], 0.95); g.fillPoints([up(inn[0]), up(out[0]), up(out[1]), up(inn[1])], true);
      g.fillStyle(dim(STEEL_FX[0], 0.8), 0.95); g.fillPoints([up(inn[1]), up(out[1]), up(out[2]), up(inn[2])], true);
    }
  }

  // A boss who can be hurt: a garland in the colour of his phase breathing at his feet,
  // and shards standing out of it all round.
  openGlow(g, x, y, rx, colour, time) {
    const pulse = 0.5 + 0.5 * Math.sin(time / 130), c = [colour, dim(colour, 0.6)], at = this.onFloor(x, y, rx);
    this.facetRing(g, x, y, rx + pulse * 3, c, 0.75 + 0.25 * pulse, time / 900, 6);
    for (let i = 0; i < 10; i++) {
      const a = -time / 1400 + i * Math.PI / 5, tip = at(a, 1.34 + 0.1 * pulse), mid = at(a, 1.15);
      g.fillStyle(c[0], 0.9); g.fillPoints([at(a - 0.075, 1.15), mid, tip], true);
      g.fillStyle(c[1], 0.9); g.fillPoints([mid, at(a + 0.075, 1.15), tip], true);
    }
  }

  // The shield over a boss: a dome of flat panes standing on the floor round him, going
  // slowly round, its far half drawn behind him and its near half in front. Each anchor
  // that still stands holds it by a chain of gold along the floor; each one lost cracks it.
  drawDome(e, time, fx, fy) {
    const back = e.floorFx, front = e.domeFx, rx = this.girth(e) + 14, tall = this.headUp(e) + this.feetDown(e) + 18;
    const P = (a, w, h) => ({ x: fx + Math.cos(a) * rx * w, y: fy + Math.sin(a) * rx * w * FLAT - tall * h });
    const n = 10, spin = time / 5200, ring = [[1, 0], [0.93, 0.4], [0.62, 0.8], [0, 1]];           // each ring of corners: how wide, how high
    const held = e.keyAddIds.length / (e.shieldMax || 1), lost = (e.shieldMax || 0) - e.keyAddIds.length, strength = 0.5 + 0.5 * held;
    const breath = 0.5 + 0.5 * Math.sin(time / 420), glint = Math.floor(time / 110) % (n * 3), struck = Math.max(0, (e.domeHit || 0) / 160);
    this.facetRing(back, fx, fy, rx, SHIELD_FX, 0.45 + 0.35 * held, -spin * 2, 5);
    for (let i = 0; i < n; i++) {
      const a0 = spin + i / n * Math.PI * 2, a1 = spin + (i + 1) / n * Math.PI * 2, am = (a0 + a1) / 2;
      const near = Math.sin(am) > 0, g = near ? front : back, lit = 0.5 - 0.5 * Math.cos(am);      // the light is on its left
      for (let k = 0; k < 3; k++) {
        const pane = k < 2 ? [P(a0, ...ring[k]), P(a1, ...ring[k]), P(a1, ...ring[k + 1]), P(a0, ...ring[k + 1])] : [P(a0, ...ring[k]), P(a1, ...ring[k]), P(am, 0, 1)];
        const shine = (i * 3 + k === glint ? 0.2 : 0) + struck * 0.22;
        g.fillStyle((i + k) % 2 ? SHIELD_FX[0] : SHIELD_FX[1], ((near ? 0.1 : 0.2) + 0.1 * lit + 0.05 * breath) * strength + shine);
        g.fillPoints(pane, true);
        g.lineStyle(1, SHIELD_FX[0], (near ? 0.55 : 0.3) * strength + shine); g.strokePoints(pane, true);
      }
    }
    for (let j = 0; j < lost; j++) {
      const a = 0.75 + j * 0.82, crack = [P(a, 0.5, 0.86), P(a + 0.16, 0.7, 0.72), P(a + 0.02, 0.8, 0.6), P(a + 0.15, 0.9, 0.45), P(a - 0.07, 0.94, 0.33), P(a + 0.09, 0.98, 0.17), P(a, 1, 0)];
      front.lineStyle(2.4, 0x1d3a5a, 0.4); front.strokePoints(crack);
      front.lineStyle(1, 0xffffff, 0.9); front.strokePoints(crack);
      front.strokePoints([crack[2], P(a - 0.2, 0.88, 0.52)]); front.strokePoints([crack[4], P(a + 0.24, 0.99, 0.3)]);        // and two that branch from it
    }
    e.keyAddIds.forEach(id => {
      const m = this.enemies.find(o => o.id === id);
      if (!m) return;
      const mx = m.x, my = m.y + this.feetDown(m), a = Math.atan2((my - fy) / FLAT, mx - fx), end = P(a, 1, 0);
      const len = Math.hypot(mx - end.x, my - end.y);
      if (len < 14 || Math.hypot(mx - fx, (my - fy) / FLAT) < rx) return;                          // it stands under the dome itself
      const ux = (end.x - mx) / len, uy = (end.y - my) / len, run = (time / 70) % 12;              // the links run toward the dome
      for (let d = run; d < len; d += 12) {
        const cx = mx + ux * d, cy = my + uy * d, tail = { x: cx - ux * 4.5, y: cy - uy * 4.5 }, head = { x: cx + ux * 4.5, y: cy + uy * 4.5 };
        back.fillStyle(GILT_FX[0], 0.85); back.fillPoints([tail, { x: cx - uy * 2.4, y: cy + ux * 2.4 }, head], true);
        back.fillStyle(GILT_FX[1], 0.85); back.fillPoints([tail, { x: cx + uy * 2.4, y: cy - ux * 2.4 }, head], true);
      }
    });
  }

  // What is drawn round a boss this frame. On the floor at his feet: the pool of the
  // phase that opens him, with the plates of one who resists or the garland of one who
  // can be hurt; a plain garland for a boss who has neither; and the dome of a shielded one.
  drawBossFx(e, time, delta) {
    if (this.silent) return;
    if (!e.floorFx) { e.floorFx = this.add.graphics().setDepth(Z.fx); e.domeFx = this.add.graphics(); }
    const g = e.floorFx, x = e.x, y = e.y + this.feetDown(e), rx = this.girth(e) + 10, spr = this.enemySprites.get(e.id);
    g.clear(); e.domeFx.clear();
    if (e.domeHit > 0) e.domeHit -= delta;
    if (e.shieldOn) {
      e.domeFx.setDepth((spr ? spr.depth : 0) + 1e-5);
      this.drawDome(e, time, x, y);
    } else if (this.bossGated(e)) {
      const open = this.phase === e.weakPhase, col = PHASE_DEFS[e.weakPhase].color, beat = 0.5 + 0.5 * Math.sin(time / 500);
      this.facetPool(g, x, y, rx * (open ? 0.72 : 0.58), col, open ? 0.6 + 0.25 * beat : 0.55 + 0.2 * beat, time / 3000);
      if (open) this.openGlow(g, x, y, rx, col, time); else this.steelPlates(g, x, y, rx, time / 2600);
    } else this.facetRing(g, x, y, rx, e.isMega ? VRITRA_FX : GILT_FX, 0.75, time / 2400, 5);
  }

  // Gold on a figure that is more than its kind: an elite, or one that anchors a shield.
  // Its own picture is laid over it as light, so it glows and keeps its colours (a tint
  // turned the Asura's indigo to mud), and a garland of gold lies at its feet.
  gild(e) {
    const spr = this.enemySprites.get(e.id);
    if (!spr || this.silent) return;
    spr.clearTint();
    e.gilt = this.add.image(spr.x, spr.y, spr.texture.key, spr.frame.name).setTintFill(GILT_GLOW).setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.2);
    e.giltRing = this.add.graphics().setDepth(Z.fx);
  }

  // Everything drawn round an enemy, taken away.
  dropRound(e) {
    [e.floorFx, e.domeFx, e.gilt, e.giltRing, ...(e.orbiters || [])].forEach(o => o && o.destroy());
    e.floorFx = e.domeFx = e.gilt = e.giltRing = e.orbiters = null;
  }

  // A figure falls: its own picture comes apart in pieces that are thrown out and fade,
  // with chips in two of its colours. The larger it was the more of both; a boss also
  // throws a ring of shards and opens a star, and Vritra does it twice.
  deathFx(e, spr) {
    const c = DEATH_FX[e.char] || GILT_FX, big = e.isBoss ? (e.isMega ? 3 : 2) : (e.isElite || e.type === 'tank' ? 1 : 0);
    const cols = big >= 2 ? 3 : 2, rows = big >= 1 ? 3 : 2, f = spr.frame, fw = f.width, fh = f.height;
    const x0 = fw * 0.16, y0 = fh * 0.08, pw = fw * 0.68 / cols, ph = fh * 0.88 / rows;        // the part of a cell a figure stands in
    const cx = spr.x, cy = spr.y - spr.displayHeight * 0.04, far = 9 + big * 7;
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      const ox = (x0 + (i + 0.5) * pw) / fw, oy = (y0 + (j + 0.5) * ph) / fh;
      const px = spr.x + (ox - 0.5) * spr.displayWidth, py = spr.y + (oy - 0.5) * spr.displayHeight;
      const piece = this.add.image(px, py, spr.texture.key, f.name).setScale(spr.scaleX, spr.scaleY).setOrigin(ox, oy)
        .setCrop(x0 + i * pw, y0 + j * ph, pw, ph).setTint(0xffe6c0).setDepth(spr.depth);
      const a = Math.atan2(py - cy, px - cx) + (Math.random() - 0.5) * 0.7, d = far * (0.7 + Math.random() * 0.6);
      const ms = 260 + big * 70 + Math.random() * 70;
      this.fxFade(piece, { x: px + Math.cos(a) * d, y: py + Math.sin(a) * d - 3 - big * 2, angle: (Math.random() - 0.5) * 110, scale: spr.scaleX * 0.7 }, ms, 'Quad.easeOut');
      this.tweens.add({ targets: piece, alpha: 0, delay: ms * 0.45, duration: ms * 0.55 });      // whole for the first of its flight, then gone
    }
    this.chipFx(cx, cy, c, 4 + big * 4, 16 + big * 16);
    if (big < 1) return;
    const star = this.fxPiece('fx_star', cx, cy, 12 + big * 7, c).setRotation(Math.random() * 1.5);
    this.fxFade(star, { scale: star.scale * 2.6, angle: star.angle + 60, alpha: 0 }, 260 + big * 60);
    if (big < 2) return;
    const ring = (n, reach, ms) => {
      const spin = Math.random() * 6.28;
      for (let i = 0; i < n; i++) {
        const a = spin + i / n * Math.PI * 2;
        const shard = this.fxPiece('fx_shard', cx + Math.cos(a) * 14, cy + Math.sin(a) * 14, 22, c).setRotation(a - Math.PI / 2);
        this.fxFade(shard, { x: cx + Math.cos(a) * reach, y: cy + Math.sin(a) * reach, alpha: 0 }, ms);
      }
    };
    ring(12, 78, 460);
    this.shake(260, 0.006 + big * 0.002);
    if (big >= 3) this.time.delayedCall(150, () => { ring(16, 118, 560); this.chipFx(cx, cy, c, 14, 80); });
  }

  // A Bloodseed bursts: clots of it thrown out, and a ring of short shards.
  splitFx(x, y) {
    const c = DEATH_FX.raktabija, spin = Math.random() * 6.28;
    for (let i = 0; i < 5; i++) {
      const a = spin + i / 5 * Math.PI * 2, clot = this.fxPiece('fx_lump', x, y, 14 + Math.random() * 7, c).setRotation(a);
      this.fxFade(clot, { x: x + Math.cos(a) * 34, y: y + Math.sin(a) * 34 - 6, scale: clot.scale * 0.5, alpha: 0 }, 380 + Math.random() * 110, 'Quad.easeOut');
    }
    for (let i = 0; i < 8; i++) {
      const a = spin + (i + 0.5) / 8 * Math.PI * 2, shard = this.fxPiece('fx_shard', x + Math.cos(a) * 8, y + Math.sin(a) * 8, 16, c).setRotation(a - Math.PI / 2);
      this.fxFade(shard, { x: x + Math.cos(a) * 44, y: y + Math.sin(a) * 44, alpha: 0 }, 340, 'Quad.easeOut');
    }
  }

  // An anchor falls: its chain parts in chips of gold, link by link, toward the dome.
  snapFx(m, boss) {
    const fx = boss.x, fy = boss.y + this.feetDown(boss), mx = m.x, my = m.y + this.feetDown(m);
    for (let t = 0.1; t < 1; t += 0.2) this.chipFx(mx + (fx - mx) * t, my + (fy - my) * t, GILT_FX, 2, 10);
    boss.domeHit = 260;
  }

  // The shield breaks: its panes fly out as shards of ice from where they stood.
  domeBreakFx(boss) {
    const fx = boss.x, fy = boss.y + this.feetDown(boss), rx = this.girth(boss) + 14, tall = this.headUp(boss) + this.feetDown(boss) + 18;
    for (let i = 0; i < 16; i++) {
      const a = i / 16 * Math.PI * 2 + Math.random() * 0.3, h = 0.15 + (i % 3) * 0.3, w = Math.sqrt(1 - h * h * 0.8);
      const x = fx + Math.cos(a) * rx * w, y = fy + Math.sin(a) * rx * w * FLAT - tall * h;
      const pane = this.fxPiece(i % 2 ? 'fx_shard' : 'fx_chip', x, y, i % 2 ? 24 : 13, SHIELD_FX).setRotation(a - Math.PI / 2);
      this.fxFade(pane, { x: x + Math.cos(a) * 62, y: y + Math.sin(a) * 34 - 26 + h * 30, angle: pane.angle + (i % 2 ? 40 : 200), alpha: 0 }, 380 + Math.random() * 140);
    }
    const star = this.fxPiece('fx_star', fx, fy - tall * 0.55, 26, SHIELD_FX);
    this.fxFade(star, { scale: star.scale * 3.2, angle: 50, alpha: 0 }, 420);
    this.chipFx(fx, fy - tall * 0.4, SHIELD_FX, 12, 70);
  }

  // A small ring where the tap landed, so "I'm walking there" is visible.
  tapMark() {
    const t = this.pointerTarget;
    if (!t) return;
    const ring = this.add.circle(t.x, t.y, 9, 0x000000, 0).setStrokeStyle(2, FORGE.gold, 0.8).setDepth(Z.fx);
    this.tweens.add({ targets: ring, scale: 0.4, alpha: 0, duration: 420, onComplete: () => ring.destroy() });
  }

  // Arrows at the edge of the window toward what is out of sight: a boss always, and the
  // last few enemies of a wave, so a wide arena never becomes a search.
  drawFarPointers() {
    if (!this.farFx) return;
    const g = this.farFx;
    g.clear();
    const few = this.enemies.length <= 3, inset = 12;
    const L = inset, R = W - inset, T = HUD_H + inset, B = H - inset, cx = W / 2, cy = HUD_H + (H - HUD_H) / 2;
    for (const e of this.enemies) {
      if (!e.isBoss && !few) continue;
      const sx = e.x - this.camOff.x, sy = e.y - this.camOff.y;
      if (sx > L - 4 && sx < R + 4 && sy > T - 4 && sy < B + 4) continue;                  // in sight
      const a = Math.atan2(sy - cy, sx - cx), t = Math.min((sx > cx ? R - cx : cx - L) / Math.abs(Math.cos(a) || 1e-6), (sy > cy ? B - cy : cy - T) / Math.abs(Math.sin(a) || 1e-6));
      const px = cx + Math.cos(a) * t, py = cy + Math.sin(a) * t, size = e.isBoss ? 11 : 7;
      g.fillStyle(e.isBoss ? FORGE.gold : 0xfffbef, e.isBoss ? 0.95 : 0.75);
      g.lineStyle(1.5, 0x2a0800, 0.9);
      const tri = [[1, 0], [-0.7, 0.75], [-0.7, -0.75]].map(([ux, uy]) => ({ x: px + (ux * Math.cos(a) - uy * Math.sin(a)) * size, y: py + (ux * Math.sin(a) + uy * Math.cos(a)) * size }));
      g.fillPoints(tri, true); g.strokePoints(tri, true);
    }
  }

  // ---------- HIT FEEDBACK ----------
  // Being hit used to produce one 150ms alpha flicker - players could lose half their HP
  // without registering that anything touched them. Every hit now reads on four
  // channels at once, all scaled by how much of your max HP it took, so a chip from an
  // Asura is a nudge and a Vritra slam is an event.
  hitFeedback(amount, source, kind) {
    const frac = Phaser.Math.Clamp(amount / Math.max(1, this.player.maxHp), 0, 1);
    this.shake(90 + frac * 280, 0.0025 + frac * 0.02);
    this.sfx('hurt', { vol: 0.7 + frac * 1.5, rate: kind === 'slam' ? 0.85 : 1 });
    this.buzz(kind === 'slam' ? 90 : 25 + frac * 80);

    this.hurtFlash.setAlpha(settings.reduceFlash ? Math.min(0.12, 0.05 + frac * 0.2) : 0.1 + frac * 0.55);
    this.tweens.killTweensOf(this.hurtFlash);
    this.tweens.add({ targets: this.hurtFlash, alpha: 0, duration: 240 + frac * 200 });

    if (this.playerSprite) {
      this.playerSprite.setTint(0xff6a55);
      this.time.delayedCall(120, () => this.restorePlayerTint());
    }

    if (source && kind === 'melee') this.slashFx(source, this.player);
    if (!settings.dmgNumbers) return;
    const num = this.add.text(this.player.x + Phaser.Math.Between(-10, 10), this.player.y - 28,
      `-${Math.max(1, Math.round(amount))}`,
      { resolution: RES, fontSize: frac > 0.15 ? '15px' : '11px', color: '#ff5a44',
        fontStyle: 'bold', stroke: '#2a0800', strokeThickness: 3 }).setOrigin(0.5).setDepth(40);
    this.tweens.add({ targets: num, y: num.y - 26, alpha: 0, duration: 700, ease: 'Cubic.easeOut',
                      onComplete: () => num.destroy() });
  }

  // Returns the hero to whatever tint the current state calls for (Tejas glows gold).
  restorePlayerTint() {
    if (!this.playerSprite) return;
    if (this.tejasActive > 0) this.playerSprite.setTint(0xffe08a);
    else this.playerSprite.clearTint();
  }

  // A claw-arc between attacker and target: shows WHO hit you and from WHERE.
  slashFx(src, dst) {
    const a = Math.atan2(dst.y - src.y, dst.x - src.x);
    const g = this.add.graphics({ x: (src.x + dst.x) / 2, y: (src.y + dst.y) / 2 }).setDepth(30);
    const perp = a + Math.PI / 2;
    g.lineStyle(3.2, 0xfff0d8, 0.95);
    g.beginPath(); g.arc(0, 0, 13, perp - 1.05, perp + 1.05); g.strokePath();
    g.lineStyle(1.8, 0xff5a3a, 0.9);
    g.beginPath(); g.arc(0, 0, 18, perp - 0.85, perp + 0.85); g.strokePath();
    this.tweens.add({ targets: g, alpha: 0, scale: 1.35, duration: 210, onComplete: () => g.destroy() });
  }

  // Dresses the hero in what is worn (requirements 2.42): redraws the sheet and the
  // portrait once, with each worn piece laid in through its zone, and puts them in place
  // of the loaded pictures, so nothing else in the game needs to know. The four stills are
  // taken again from the standing cells of the new sheet. With nothing worn it does nothing.
  dressHero() {
    const worn = Object.entries(WORN), name = CHARS.player, art = ART[name];
    if (!worn.length || !art || !this.textures.exists(`${name}-walk`)) return;
    const canvas = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    const dressed = (key, zones) => {
      const src = this.textures.get(key).getSourceImage(), w = src.width, h = src.height;
      const out = canvas(w, h), ctx = out.getContext('2d'), part = canvas(w, h), p = part.getContext('2d');
      ctx.drawImage(src, 0, 0);
      worn.forEach(([slot, piece]) => {
        if (!this.textures.exists(`${zones}-${slot}`)) return;
        // A dye: the figure, its colour changed and its light and shade kept, cut down to the slot.
        p.globalCompositeOperation = 'copy'; p.drawImage(src, 0, 0);
        p.globalCompositeOperation = 'color'; p.fillStyle = '#' + WEAR.dyes[piece].toString(16).padStart(6, '0'); p.fillRect(0, 0, w, h);
        p.globalCompositeOperation = 'destination-in'; p.drawImage(this.textures.get(`${zones}-${slot}`).getSourceImage(), 0, 0);
        p.drawImage(src, 0, 0);
        ctx.drawImage(part, 0, 0);
      });
      return out;
    };
    const sheet = dressed(`${name}-walk`, `${name}-zone`);
    this.textures.remove(`${name}-walk`);
    Phaser.Textures.Parsers.SpriteSheet(this.textures.addCanvas(`${name}-walk`, sheet), 0, 0, 0, sheet.width, sheet.height, { frameWidth: art.cell, frameHeight: art.cell });
    FACINGS.forEach((facing, row) => {
      const at = row * art.per, cols = Math.floor(sheet.width / art.cell), edge = (art.cell - art.still) / 2, still = canvas(art.still, art.still);
      still.getContext('2d').drawImage(sheet, at % cols * art.cell + edge, Math.floor(at / cols) * art.cell + edge, art.still, art.still, 0, 0, art.still, art.still);
      this.textures.remove(`${name}-${facing}`);
      this.textures.addCanvas(`${name}-${facing}`, still);
    });
    if (this.textures.exists(`${name}-portrait`)) {
      const portrait = dressed(`${name}-portrait`, `${name}-portrait-zone`);
      this.textures.remove(`${name}-portrait`);
      this.textures.addCanvas(`${name}-portrait`, portrait);
    }
    worn.forEach(([slot]) => [`${name}-zone-${slot}`, `${name}-portrait-zone-${slot}`].forEach(key => this.textures.exists(key) && this.textures.remove(key)));
  }

  // How far over an enemy's middle its bars and name begin, and how far under it the
  // floor is, whatever art it has.
  // What an enemy's figure was drawn at before art of the game's own: 2.8 times its stock
  // hit circle. Everything about how a figure is drawn is measured from this.
  stockSize(e) { return e.radius / HIT * 2.8; }
  headUp(e) { return e.radius / HIT + artRise(e.char, this.stockSize(e)); }
  // How far out from an enemy's middle a ring drawn round it must be to clear what is
  // drawn of it: its hit circle for stock art, most of its half-width for the game's own.
  girth(e) { const a = ART[e.char]; return a ? Math.max(e.radius, this.stockSize(e) * a.scale * (a.wide || 0.5) * 0.45) : e.radius; }
  feetDown(e) { return e.radius / HIT * 0.55 + artDrop(e.char, this.stockSize(e)); }

  // A character's sprite: its walk sheet where it has one, its still otherwise. `size` is
  // how large the standing stock figure is drawn, whichever it is; art of the game's own
  // is drawn larger by its `scale` (ART).
  charSprite(char, x, y, size) {
    const art = artOf(char), drawn = size * art.scale, pad = art.cell / art.still;
    const walks = this.textures.exists(`${char}-walk`);
    const spr = walks ? this.add.image(x, y, `${char}-walk`, 0).setDisplaySize(drawn * pad, drawn * pad)
                      : this.add.image(x, y, `${char}-front`).setDisplaySize(drawn, drawn);
    spr.walks = walks;
    spr.figure = size;
    return spr.setDepth(sortDepth(y));
  }

  // Turns a character to a facing, and on a walk sheet shows the step that animate() has
  // reached: 0 is standing, 1 to WALK.frames the stride. `a` is the state animate() keeps.
  pose(spr, char, facing, a) {
    if (spr.walks) {
      // A figure in the middle of a strike faces what it strikes at and shows the strike.
      const per = artOf(char).per, acting = a.act && per > WALK.frames + 1;
      const frame = FACINGS.indexOf(acting ? a.act.facing : facing) * per + (acting ? WALK.frames + 1 + a.act.cell : (a.step || 0));
      if (spr.frame.name !== frame) spr.setFrame(frame);
    } else if (spr.posed !== facing) {
      spr.posed = facing;
      spr.setTexture(`${char}-${facing}`);
    }
  }

  // Life beyond the frames (requirements 2.31). The walk sheets carry the stride; the rest
  // is made here: a lean into the turn, a breath at rest, a squash when struck, a swell on
  // arrival, a crouch before a slam - and, for a character with no sheet, a hop in place of
  // the stride. `a` carries the state (the enemy itself, or playerAnim). Returns how far
  // the sprite should be lifted off its spot this frame.
  animate(spr, a, delta, vx, vy, heavy, crouch) {
    if (spr.baseSX === undefined) { spr.baseSX = spr.scaleX; spr.baseSY = spr.scaleY; spr.strideLen = (spr.figure || spr.displayWidth) * 2.4; }
    if (a.gait === undefined) { a.gait = Math.random() * 6.28; a.age = a.age || 0; }
    a.age += delta;
    const speed = Math.hypot(vx, vy), moving = speed > 12, rate = heavy ? 0.0085 : 0.0135;
    a.gait += delta * (moving ? rate + Math.min(0.006, speed * 0.00003) : rate * 0.22);
    const stride = Math.sin(a.gait), k = heavy ? 0.55 : 1;
    let sx = 1, sy = 1, lift = 0;
    if (spr.walks) {
      // The cycle keeps pace with the ground covered, so feet do not slide; a slow giant
      // still steps at a walk. The pose is held a moment after stopping, so a character
      // jostled in a crowd does not flicker between standing and walking.
      if (moving) { a.walkHold = 140; a.walk = (a.walk || 0) + Math.max(0.7, speed / spr.strideLen) * delta / 1000; }
      else if (a.walkHold > 0) a.walkHold -= delta;
      a.step = a.walkHold > 0 ? 1 + Math.floor((a.walk || 0) * WALK.frames) % WALK.frames : 0;
    } else if (moving) { sy += 0.055 * stride * k; sx -= 0.04 * stride * k; lift = Math.abs(stride) * (heavy ? 1.6 : 2.8); }
    // A strike runs through its three cells and is over. One that is held stays drawn
    // back until release() lets it go: a boss winding up a slam.
    if (a.act) {
      if (!a.act.held) a.act.t += delta;
      a.act.cell = a.act.t < ACT.back ? 0 : a.act.t < ACT.back + ACT.strike ? 1 : 2;
      if (a.act.t >= ACT.back + ACT.strike + ACT.out) a.act = null;
    }
    if (!moving) { const breath = Math.sin(a.gait * 2) * 0.02; sy += breath; sx -= breath * 0.6; }
    if (a.squash > 0) { a.squash -= delta; const q = Math.max(0, a.squash / 140); sx += 0.17 * q; sy -= 0.15 * q; }
    if (a.punch > 0) { a.punch -= delta; const q = Math.max(0, a.punch / 90); sx += 0.07 * q; sy += 0.07 * q; }
    // Winding up a slam: a figure with strike cells is already drawn back, and rises as
    // it gathers; one without them crouches, as it always did.
    const gathering = crouch > 0 && a.act && a.act.held && spr.walks;
    if (gathering) { sy += 0.12 * crouch; sx += 0.05 * crouch; lift += 7 * crouch; }
    else if (crouch > 0) { sy -= 0.12 * crouch; sx += 0.09 * crouch; }
    if (a.age < 220) { const q = a.age / 220, pop = 0.55 + 0.45 * (1 - Math.pow(1 - q, 3)); sx *= pop; sy *= pop; }
    spr.setScale(spr.baseSX * sx, spr.baseSY * sy);
    let turn = moving ? Phaser.Math.Clamp(vx / 260, -1, 1) * (spr.walks ? 0.06 : 0.1) : 0;
    if (gathering) turn += Math.sin(a.age / 24) * 0.035 * Math.max(0, crouch - 0.55) / 0.45;      // he shakes with it at the last
    spr.setRotation(turn);
    return lift;
  }

  // A figure strikes toward a point (requirements 2.41): it turns that way and goes
  // through the strike cells of its sheet: drawing back, striking, coming out of it. The
  // same three serve a thrust, a throw, a cast and a slam. `a` is the state animate()
  // keeps (an enemy, or playerAnim). A `held` strike stays drawn back until release().
  act(a, fromX, fromY, toX, toY, held) {
    a.act = { t: 0, cell: 0, facing: facingFor(toX - fromX, toY - fromY), held: !!held };
  }
  release(a) { if (a.act && a.act.held) { a.act.held = false; a.act.t = ACT.back; } }

  // The attacker visibly lunges at you. Stored as an offset rather than tweened, because
  // the update loop re-positions every sprite from its logical position each frame.
  enemyLunge(e) {
    if (!(e.act && e.act.held)) this.act(e, e.x, e.y, this.player.x, this.player.y);     // a blow in passing does not break a wind-up
    const d = Math.hypot(this.player.x - e.x, this.player.y - e.y) || 1;
    e.lunge = { t: 0, dur: 200, dx: (this.player.x - e.x) / d, dy: (this.player.y - e.y) / d,
                amp: Math.min(16, 6 + e.radius * 0.5) };
  }

  // ---------- FLOOR ART ----------
  floorKey(sector) {
    const theme = (sector - 1) % FLOORS.length, cycle = Math.min(2, Math.floor((sector - 1) / FLOORS.length));
    const key = `floor-${theme}-${cycle}`;
    if (!this.textures.exists(key)) this.paintFloor(key, FLOORS[theme], cycle);
    return key;
  }

  paintFloor(key, theme, cycle) {
    // Floors are soft art: 2x is plenty, and a third of the memory of 3x. A wide arena
    // shows the same painting larger, so it is painted finer by as much, up to 2048 pixels.
    const b = this.viewBounds, px = Math.min(Math.min(RES, 2) * ARENA_SCALE, 2048 / b.height);
    const tex = this.textures.createCanvas(key, Math.round(b.width * px), Math.round(b.height * px));
    const ctx = tex.getContext(), w = b.width, h = b.height;
    ctx.scale(px, px);
    theme.paint(ctx, w, h, px);
    // The endless descent: past Sector 3 the same three levels return under a deepening wash.
    if (cycle) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = cycle === 1 ? '#d99aa6' : '#9c86c2';
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
    }
    // Shade the edges, so the floor sits below the stairs around it.
    const shade = (x0, y0, x1, y1, rx, ry, rw, rh) => {
      const g = ctx.createLinearGradient(x0, y0, x1, y1);
      g.addColorStop(0, 'rgba(20,4,0,0.5)'); g.addColorStop(1, 'rgba(20,4,0,0)');
      ctx.fillStyle = g; ctx.fillRect(rx, ry, rw, rh);
    };
    shade(0, 0, 0, 26, 0, 0, w, 26); shade(0, h, 0, h - 20, 0, h - 20, w, 20);
    shade(0, 0, 22, 0, 0, 0, 22, h); shade(w, 0, w - 22, 0, w - 22, 0, 22, h);
    tex.refresh();
  }

  // Swap the floor for this sector's. With `fade` the new one rises through the old.
  setFloor(sector, fade) {
    const key = this.floorKey(sector), b = this.arenaBounds, theme = FLOORS[(sector - 1) % FLOORS.length];
    this.starfield.setTint(theme.ember).setAlpha(theme.emberAlpha);
    this.floorEdge.setStrokeStyle(1, theme.edge, 0.7);
    this.setFrame(sector, theme);
    const top = this.floorLayers[this.floorLayers.length - 1];
    if (top && top.texture.key === key) return;
    const img = this.add.image(b.centerX, b.centerY, key).setDisplaySize(b.width, b.height).setDepth(Z.floor);
    const older = this.floorLayers.slice();
    this.floorLayers.push(img);
    const drop = () => {
      older.forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
      this.floorLayers = this.floorLayers.filter(o => !older.includes(o));
    };
    if (fade && older.length) { img.setAlpha(0); this.tweens.add({ targets: img, alpha: 1, duration: 900, onComplete: drop }); }
    else drop();
    this.setFloorLights(theme);
  }

  // Lamps flicker and water glows: a few soft lights laid over the painted floor, each
  // [x, y, radius, colour, alpha, period in ms] in the floor's own coordinates.
  setFloorLights(theme) {
    (this.floorLights || []).forEach(o => { this.tweens.killTweensOf(o); o.destroy(); });
    this.floorLights = [];
    if (!theme.lights) return;
    this.ensureSoftGlow();
    const b = this.arenaBounds, S = ARENA_SCALE;
    theme.lights.forEach(([x0, y0, r0, colour, alpha, ms]) => {
      const x = x0 * S, y = y0 * S, r = r0 * S;                // set out for the fixed arena
      const img = this.add.image(b.x + x, b.y + y, 'softglow').setDisplaySize(r * 2, r * 2).setTint(colour).setAlpha(alpha)
        .setBlendMode(Phaser.BlendModes.ADD).setDepth(Z.floor + 0.3);
      // Clipped to the arena, so a light in a corner does not spill over the stairs.
      img.setCrop(Math.max(0, (r - x) * 64 / r), Math.max(0, (r - y) * 64 / r),
                  128 - Math.max(0, (r - x) * 64 / r) - Math.max(0, (x + r - b.width) * 64 / r),
                  128 - Math.max(0, (r - y) * 64 / r) - Math.max(0, (y + r - b.height) * 64 / r));
      this.tweens.add({ targets: img, alpha: alpha * 0.5, duration: ms, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
      this.floorLights.push(img);
    });
  }

  // A floor set may paint its own stairs round the arena (the classic set leaves the
  // saw-tooth frame of drawWellFrame showing). One image, re-skinned per level.
  setFrame(sector, theme) {
    if (!theme.frame) { if (this.frameImg) this.frameImg.setVisible(false); return; }
    const key = this.frameKey(sector), S = ARENA_SCALE, fw = W * S, fh = (H - HUD_H) * S;
    if (!this.frameImg) this.frameImg = this.add.image(fw / 2, HUD_H + fh / 2, key).setDepth(Z.floor - 0.4);
    this.frameImg.setTexture(key).setDisplaySize(fw, fh).setVisible(true);
  }

  frameKey(sector) {
    const theme = FLOORS[(sector - 1) % FLOORS.length], key = 'frame-' + this.floorKey(sector), fw = W, fh = H - HUD_H;
    if (theme.frame && !this.textures.exists(key)) {
      const px = Math.min(Math.min(RES, 2) * ARENA_SCALE, 2048 / fh), tex = this.textures.createCanvas(key, Math.round(fw * px), Math.round(fh * px)), ctx = tex.getContext();
      ctx.scale(px, px);
      theme.frame(ctx, fw, fh, px);
      tex.refresh();
    }
    return key;
  }

  // A painted floor takes a moment to make. The next level's is made while the player is
  // reading the Extract or Descend screen, so the descent itself never stutters.
  prepaintFloor(sector) {
    this.time.delayedCall(120, () => { this.floorKey(sector); this.frameKey(sector); });
  }

  // The stairs around every arena: two courses of saw-tooth steps climbing away on all
  // four sides, the pattern that makes Chand Baori instantly recognisable from above.
  drawWellFrame() {
    // Drawn for the fixed arena, then scaled with it about the corner under the HUD.
    const b = this.viewBounds, g = this.add.graphics().setDepth(Z.floor - 0.5).setScale(ARENA_SCALE).setPosition(0, HUD_H * (1 - ARENA_SCALE));
    const courses = 2, ch = MARGIN / courses, tooth = 20;
    for (let c = courses - 1; c >= 0; c--) {
      const near = c * ch, far = (c + 1) * ch;                       // distance out from the arena edge
      const light = c === 0 ? 0xc88a46 : 0x8a5526, dark = c === 0 ? 0x6e3c15 : 0x47240b;
      const L = b.x - far, R = b.right + far, T = b.y - far, B = b.bottom + far;
      g.fillStyle(dark, 1);
      g.fillRect(L, T, R - L, ch); g.fillRect(L, B - ch, R - L, ch);
      g.fillRect(L, T, ch, B - T); g.fillRect(R - ch, T, ch, B - T);
      g.fillStyle(light, 1);
      const nx = Math.round((b.width + near * 2) / tooth), sx = (b.width + near * 2) / nx, half = c % 2 ? 0.5 : 0;
      for (let i = -1; i <= nx; i++) {
        const x0 = b.x - near + (i + half) * sx, x1 = x0 + sx, xm = x0 + sx / 2;
        if (x1 <= b.x - near || x0 >= b.right + near) continue;
        g.fillTriangle(x0, b.y - near, x1, b.y - near, xm, b.y - far);               // top
        g.fillTriangle(x0, b.bottom + near, x1, b.bottom + near, xm, b.bottom + far); // bottom
      }
      const ny = Math.round((b.height + near * 2) / tooth), sy = (b.height + near * 2) / ny;
      for (let i = -1; i <= ny; i++) {
        const y0 = b.y - near + (i + half) * sy, y1 = y0 + sy, ym = y0 + sy / 2;
        if (y1 <= b.y - near || y0 >= b.bottom + near) continue;
        g.fillTriangle(b.x - near, y0, b.x - near, y1, b.x - far, ym);                // left
        g.fillTriangle(b.right + near, y0, b.right + near, y1, b.right + far, ym);    // right
      }
      g.lineStyle(1, 0x2a0f04, 0.8); g.strokeRect(L, T, R - L, B - T);
    }
    // The half-teeth of the outer course spill past the frame's corners; square them off.
    g.fillStyle(0x47240b, 1);
    for (const [x, y] of [[0, b.y - MARGIN], [b.right, b.y - MARGIN], [0, b.bottom], [b.right, b.bottom]]) g.fillRect(x, y, MARGIN, MARGIN);
    g.lineStyle(1, 0x8a5526, 0.9);
    g.lineBetween(0, b.y - MARGIN, MARGIN, b.y); g.lineBetween(W, b.y - MARGIN, b.right, b.y);
    g.lineBetween(0, b.bottom + MARGIN, MARGIN, b.bottom); g.lineBetween(W, b.bottom + MARGIN, b.right, b.bottom);
  }

  // ---------- ATTACK VISUALS ----------
  // Every weapon used to draw the same cyan line, so a Venom Blade and an Executioner
  // felt identical to use. Each effect now has its own beam shape and colour, which is
  // also free build feedback: you can see what you're holding without reading the HUD.
  drawWeaponBeam(x1, y1, x2, y2, effect) {
    const fx = this.attackFx, c = WEAPON_FX[effect] || WEAPON_FX.none;
    const len = Math.hypot(x2 - x1, y2 - y1) || 1, ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const at = (along, off) => ({ x: x1 + ux * along - uy * off, y: y1 + uy * along + ux * off });
    // A blade of two faces lying along the line from `a` to `b`, widest at `belly`: one
    // face in the light, the other in shade, like everything else the cast is made of.
    const blade = (a, b, belly, half) => {
      fx.fillStyle(c[0], 0.95); fx.fillPoints([at(a, 0), at(belly, half), at(b, 0)], true);
      fx.fillStyle(c[1], 0.95); fx.fillPoints([at(a, 0), at(belly, -half), at(b, 0)], true);
    };
    const gem = (along, off, r) => {
      fx.fillStyle(c[0], 0.95); fx.fillPoints([at(along - r, off), at(along, off + r), at(along + r, off)], true);
      fx.fillStyle(c[1], 0.95); fx.fillPoints([at(along - r, off), at(along, off - r), at(along + r, off)], true);
    };
    switch (effect) {
      case 'venom':              // a thin dart, with drops shaken off it to either side
        blade(10, len, len * 0.7, 2.6);
        for (let i = 1; i <= 3; i++) gem(len * (0.18 + i * 0.2), i % 2 ? 5 : -5, 2.6);
        break;
      case 'vampiric':           // drawn off the victim: widest where it leaves him
        blade(len, 8, len * 0.86, 5);
        gem(len, 0, 4);
        break;
      case 'chain':              // a bolt in hard angles, as the supercharge's is, but finer
        this.boltFx(fx, x1, y1, x2, y2, c, 0.62);
        break;
      case 'executioner':        // a cleaver: a heavy wedge that widens to the blow
        blade(6, len, len * 0.92, 8.5);
        gem(len, 0, 5);
        break;
      default:                   // the plain weapon: a lance, quick and clean
        blade(12, len, len * 0.8, 3.2);
        gem(len, 0, 3);
    }
  }

  // Short-lived burst where a hit lands. Destroys itself, so it needs no bookkeeping
  // in the run-cleanup path.
  impactBurst(x, y, colour) {
    const shade = Phaser.Display.Color.IntegerToColor(colour).darken(38).color;
    const star = this.fxPiece('fx_star', x, y, 9, [colour, shade]).setRotation(Math.random() * 1.5);
    this.fxFade(star, { scale: star.scale * 2.2, angle: star.angle + 50, alpha: 0 }, 180);
  }
}
