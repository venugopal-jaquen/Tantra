/*
 * calculations.js: sums that need no screen, no engine and no save: what they work on is
 * handed to them. The scene's methods of like name (dmgMult, attackRate, addGold,
 * healPlayer ...) gather the hero's state and call these, so a sum is written once and
 * tools/check-game.mjs can run it without a browser.
 *
 * Declares  upgradeCost, bankedGold, goldEarned, damageBonus, attackRateBonus, healed,
 *           itemPower, plainlyBetter.
 * Needs     rules.js (BOONS, DEATH_KEEP, DEPTH_GOLD, UPGRADE_COST, POWER).
 * State     none.
 *
 * The order of the adding and where the rounding falls are part of each sum: boon
 * bonuses add (they do not multiply), prices and gold round to the nearest, and what is
 * kept on death rounds down.
 */

// What the next level of an upgrade costs. key: 'vitalityLevel' | 'powerLevel'; level: the level held now.
function upgradeCost(key, level) { return Math.round(UPGRADE_COST[key] * Math.pow(UPGRADE_COST.growth, level)); }

// Nidhi banked when a run ends: all of it on a win or an extraction, part of it (rounded
// down) on a death or an abandoned run.
function bankedGold(runGold, kept) { return kept ? runGold : Math.floor(runGold * DEATH_KEEP); }

// Nidhi added for a kill worth n: Greed's share, then the depth's (tier 1 is the first depth).
function goldEarned(n, greedRank, tier) { return Math.round(n * (greedRank ? 1 + BOONS.greed.n : 1) * (1 + DEPTH_GOLD * (tier - 1))); }

// What the hero's damage is multiplied by. keen and ground are ranks; stillMs is how long
// the hero has stood still; lastStand is whether Last Stand is burning; slamBuffMs is
// what is left of Read the Slam. Each adds its part to 1.
function damageBonus(s) {
  let m = 1 + s.keen * BOONS.keen.n;
  if (s.ground && s.stillMs >= 200) m += BOONS.ground.n;
  if (s.lastStand) m += BOONS.laststand.n;
  if (s.slamBuffMs > 0) m += BOONS.readslam.n;
  return m;
}

// How many times faster the hero attacks. quick and run are ranks; moving is whether the
// hero means to move.
function attackRateBonus(s) { return 1 + s.quick * BOONS.quick.n + (s.run && s.moving ? BOONS.run.n : 0); }

// Health after healing `amount`, and the Blood Shield after it. Healing from blood
// (fromBlood) that goes past full health becomes shield, up to the boon's limit, if the
// boon is live. Returns { hp, bloodShield }; bloodShield is undefined when it is unchanged.
function healed(hp, maxHp, amount, fromBlood, bloodShieldLive, bloodShield) {
  const room = maxHp - hp, out = { hp: Math.min(maxHp, hp + amount) };
  if (fromBlood && amount > room && bloodShieldLive) out.bloodShield = Math.min(BOONS.bloodshield.n, (bloodShield || 0) + amount - room);
  return out;
}

// What one item adds to Power (requirements 2.28): the sum the profile shows for it.
function itemPower(item) {
  if (!item) return 0;
  if (item.type === 'weapon') return POWER.weapon[item.rarity] + ((item.shots || 1) - 1) * POWER.shot + (item.effect && item.effect !== 'none' ? POWER.effect : 0);
  return POWER.trinket[item.rarity];
}

// Whether a drop walked over is worn at once: when the slot is empty, or when it has more Power
// than what is held, whatever its kind (the founder, 2026-10-17: the most powerful is worn).
// Build 0.23 wore only the same kind, so a gold weapon of another kind went to the satchel
// while copper stayed in hand. What is taken off goes to the satchel; a pickup never makes the
// hero weaker. Overdrive follows the weapon, and the toast says when its power changes.
function plainlyBetter(item, held) {
  return !held || (item.type === held.type && itemPower(item) > itemPower(held));
}

// Health that keeps pace with the level (the founder, 2026-10-17): a Life Gem's health and the
// Iron boon grow by the same 22% a level that enemies' blows do (sectorDmgMult), so a gem or
// a rank found deep down is worth as much against what is there as one found on level 1.
function levelHealth(base, sector) {
  return Math.round(base * Math.pow(1.22, Math.max(0, sector - 1)));
}
