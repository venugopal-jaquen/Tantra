/*
 * names.js: every word a player reads that could be said another way.
 *
 * Declares  NAME_PACKS (three packs of the same shape), NAME_PACK (the default), N (the
 *           pack in use: N.enemies.melee, N.boons.keen[0], N.currency ...) and GLOSSARY
 *           (the loading screen's cards, from the pack).
 * Needs     config.js (QUERY).
 * State     none. N is chosen once, when the page loads.
 *
 * A new label goes into all three packs or the smoke test fails; tools/check-game.mjs
 * says which pack lacks which entry.
 */

// ---------- NAMES (requirements 2.12) ----------
// Every word of the game's world that a player reads lives in one of these packs: the
// hero, enemies, phases, metals, items, sectors, and the loading-screen cards. Nothing
// else in the game spells a name out; it asks the pack (`N`).
//
// To change how the whole game is named, change NAME_PACK below - one line. To compare
// packs without editing anything, add ?names=plain or ?names=sanskrit to the address.
//
//   sanskrit - the game's identity since 2026-09-24: Sanskrit names, English glosses.
//   plain    - a draft in plain English, kept so the founder can judge whether the
//              Sanskrit helps or costs players. Its wording has not been reviewed.
//   hybrid   - the default since 2026-10-04: English. Its last Sanskrit words (Asura, Vritra,
//              Nidhi, Tejas) were replaced on 2026-10-14, build 0.23.
//
// Internal keys (melee, drift, common, venom...) are never shown and never change, so
// saves survive a switch of pack.
const NAME_PACKS = {
  sanskrit: {
    player: 'Veer', currency: 'Nidhi', satchel: 'Satchel', supercharge: 'Tejas', stage: 'Level',
    pause: 'Viram', pauseSub: '\u0935\u093F\u0930\u093E\u092E \u00B7 paused',
    enemies: { melee: 'Asura', ranged: 'Rakshasa', tank: 'Mahish', splitter: 'Raktabija',
               gatekeeper: 'Bakasura', sectorboss: 'Nidhi-Raksha', megaboss: 'Vritra' },
    phases:  { drift: 'Shanti', surge: 'Shakti', eclipse: 'Grahan', convergence: 'Pralaya' },
    metals:  { common: 'Tamra', rare: 'Rajat', epic: 'Swarna' },
    metalGloss: { common: 'copper', rare: 'silver', epic: 'gold' },
    // [name, gloss]
    weapons:  { none: ['Katar', 'push-dagger'], venom: ['Visha Katar', 'poison dagger'], vampiric: ['Rakta Talwar', 'blood sword'],
                chain: ['Vidyut Chakram', 'lightning discus'], executioner: ['Vadha Parashu', 'slaying axe'] },
    trinkets: { vitality: ['Prana Mani', 'life-force jewel'], aegis: ['Kavach', 'armour'], thorns: ['Kantak Kangan', 'thorn bangle'],
                swift: ['Vega Paduka', 'swift sandals'], regen: ['Sanjeevani', 'healing herb'] },
    forms:    { none: ['Agni', 'fire'], venom: ['Visha', 'poison'], vampiric: ['Rakta', 'blood'],
                chain: ['Vidyut', 'lightning'], executioner: ['Prahar', 'the blow'] },
    // Boons (2.24): [name, gloss]. Short, everyday words; nothing revered.
    boons:    { keen: ['Dhaar', 'the keen edge'], quick: ['Chapal', 'quick hands'], reach: ['Vistar', 'long reach'],
                feet: ['Laghu', 'light feet'], iron: ['Loha', 'iron body'], hide: ['Kathor', 'thick hide'],
                ground: ['Achal', 'unmoving'], run: ['Gati', 'strike on the run'], second: ['Yugal', 'a second target'],
                readslam: ['Sajag', 'read the slam'], laststand: ['Veer', 'the last stand'], greed: ['Lobh', 'greed'],
                rot: ['Prasar', 'the poison spreads'], bloodshield: ['Rakta Kavach', 'blood shield'], fork: ['Shakha', 'forked lightning'],
                cleancut: ['Nirnay', 'the clean cut'], kindling: ['Chingari', 'the spark'], hunger: ['Bhookh', 'eclipse hunger'] },
    // Levels of the stepwell, top to bottom: [name, the line under it]. `deeper` covers
    // every sector past the last one listed.
    sectors: [['Prangan', '\u092A\u094D\u0930\u093E\u0902\u0917\u0923 \u00B7 the sunlit court'],
              ['Jal-Kund', '\u091C\u0932-\u0915\u0941\u0902\u0921 \u00B7 the flooded steps'],
              ['Nidhi-Kosh', '\u0928\u093F\u0927\u093F-\u0915\u094B\u0937 \u00B7 the gold vault']],
    deeper: ['Patal', '\u092A\u093E\u0924\u093E\u0932 \u00B7 the world below'],
    // Loading-screen cards: one per load, so the Sanskrit is learnt a word at a time.
    // Each says what the word means AND what it does in play.
    cards: [
      { kind: 'You',         dev: 'वीर',         name: 'Veer',           meaning: 'the brave one', you: true,
        role: 'That is you. You strike on your own - your whole job is choosing where to stand.' },
      { kind: 'Enemy',       dev: 'असुर',         name: 'Asura',          meaning: 'power-seeking rivals of the devas',
        role: 'The rank and file. They rush straight at you and hit on contact.' },
      { kind: 'Enemy',       dev: 'राक्षस',        name: 'Rakshasa',       meaning: 'shape-shifting sorcerers',
        role: 'They keep their distance and throw bolts. Keep moving sideways.' },
      { kind: 'Enemy',       dev: 'महिष',         name: 'Mahish',         meaning: 'the buffalo demon',
        role: "Slow, heavy, and hits like a cart. Don't let it corner you." },
      { kind: 'Enemy',       dev: 'रक्तबीज',       name: 'Raktabija',      meaning: 'blood-seed',
        role: 'Every drop of his blood rose as a new demon. Kill one, and two smaller ones spring up.' },
      { kind: 'Gatekeeper',  dev: 'बकासुर',        name: 'Bakasura',       meaning: 'the demon who demanded tribute',
        role: 'Bars the way on wave 3. He resists until the timer over his head runs out - then strike.' },
      { kind: 'Sector boss', dev: 'निधि-रक्षा',     name: 'Nidhi-Raksha',   meaning: 'treasure guardian',
        role: "Guards each level's hoard behind a shield. Kill the gold-glowing anchors to break it." },
      { kind: 'The hoarder', dev: 'वृत्र',          name: 'Vritra',         meaning: "the serpent who hoarded the world's waters",
        role: 'Waits at the bottom of the well, and knows every trick the others use. Slay him and the water returns.' },
      { kind: 'Phase',       dev: 'शांति',         name: 'Shanti',         meaning: 'peace',
        role: 'The calm stretch of the Cosmic Cycle. Catch your breath and pick your fights.' },
      { kind: 'Phase',       dev: 'शक्ति',         name: 'Shakti',         meaning: 'power',
        role: 'Enemies pour in faster - and loot drops richer.' },
      { kind: 'Phase',       dev: 'ग्रहण',         name: 'Grahan',         meaning: 'eclipse',
        role: 'Everyone hits 30% harder. You included.' },
      { kind: 'Phase',       dev: 'प्रलय',         name: 'Pralaya',        meaning: 'dissolution',
        role: 'Every 90 seconds an elite arrives, and the best loot of the cycle drops.' },
      { kind: 'Treasure',    dev: 'निधि',          name: 'Nidhi',          meaning: 'treasure',
        role: 'What you gather in the depths. Extract to bank all of it. Fall, and you keep half.' },
      { kind: 'Metal',       dev: 'ताम्र',          name: 'Tamra',          meaning: 'copper',
        role: 'The common metal. Every item is named metal first: Tamra Katar.' },
      { kind: 'Metal',       dev: 'रजत',          name: 'Rajat',          meaning: 'silver',
        role: 'The middle metal - half again as strong as copper.' },
      { kind: 'Metal',       dev: 'स्वर्ण',         name: 'Swarna',         meaning: 'gold',
        role: 'The finest metal: more than twice as strong as copper. Listen for the bell.' },
      { kind: 'Weapon',      dev: 'कटार',         name: 'Katar',          meaning: 'push-dagger',
        role: 'The blade you start with. Plain and quick.' },
      { kind: 'Weapon',      dev: 'विष कटार',      name: 'Visha Katar',    meaning: 'poison dagger',
        role: 'Every hit poisons. The damage keeps ticking after you have moved on.' },
      { kind: 'Weapon',      dev: 'रक्त तलवार',    name: 'Rakta Talwar',   meaning: 'blood sword',
        role: 'Heals you with every hit that lands.' },
      { kind: 'Weapon',      dev: 'विद्युत चक्रम',   name: 'Vidyut Chakram', meaning: 'lightning discus',
        role: 'Each strike arcs on to a second enemy. Found from level 2.' },
      { kind: 'Weapon',      dev: 'वध परशु',      name: 'Vadha Parashu',  meaning: 'slaying axe',
        role: 'Hits far harder on enemies that are nearly dead. Found from level 3.' },
      { kind: 'Trinket',     dev: 'प्राण मणि',      name: 'Prana Mani',     meaning: 'life-force jewel',
        role: 'Raises your maximum health.' },
      { kind: 'Trinket',     dev: 'कवच',          name: 'Kavach',         meaning: 'armour',
        role: 'Blocks one hit completely, then recharges.' },
      { kind: 'Trinket',     dev: 'कंटक कंगन',     name: 'Kantak Kangan',  meaning: 'thorn bangle',
        role: 'Whatever touches you takes damage back. Found from level 2.' },
      { kind: 'Trinket',     dev: 'वेग पादुका',     name: 'Vega Paduka',    meaning: 'swift sandals',
        role: 'You move faster. Found from level 2.' },
      { kind: 'Trinket',     dev: 'संजीवनी',       name: 'Sanjeevani',     meaning: 'the herb that restores life',
        role: 'Heals you slowly, all the time. Found from level 3.' },
      { kind: 'Power',       dev: 'तेजस्',         name: 'Tejas',          meaning: 'radiance',
        role: 'Your supercharge. It fills as you fight; unleash it for six seconds of power shaped by your weapon. Awakens on level 2.' },
      { kind: 'Menu',        dev: 'विराम',         name: 'Viram',          meaning: 'pause',
        role: 'The pause menu. It also tells you what your weapon and trinket actually do.' },
      { kind: 'Boons',       dev: '', name: 'The + button', meaning: '', role: 'Every wave you clear earns a boon. Tap + whenever you like: the fight waits while you pick one of three.' },
      { kind: 'Bosses',      dev: '', name: 'Tribute',      meaning: '', role: 'Kill what a boss summons before you kill the boss. 5 earns an extra item, 10 a boon, 15 a gold boon.' },
      { kind: 'You',         dev: '', name: 'Power',        meaning: '', role: 'One number for how strong you are. Your weapon, your trinket and every boon add to it. Tap it to see your profile.' },
      { kind: 'The well', dev: '', name: 'Seven depths', meaning: '', role: 'Slay the serpent and a step of the well fills. The next depth is harder and pays more. Win all seven.' },
      { kind: 'You',      dev: '', name: 'Perks',        meaning: '', role: 'Your first boss kills, and each depth you win, earn a gift that lasts. Wear two of them: choose on your Profile.' }
    ]
  },
  plain: {
    player: 'Hero', currency: 'Gold', satchel: 'Satchel', supercharge: 'Radiance', stage: 'Level',
    pause: 'Paused', pauseSub: '',
    enemies: { melee: 'Goblin', ranged: 'Hexer', tank: 'Brute', splitter: 'Splitter',
               gatekeeper: 'Gatekeeper', sectorboss: 'Hoard Guardian', megaboss: 'The Hoarder' },
    phases:  { drift: 'Calm', surge: 'Surge', eclipse: 'Eclipse', convergence: 'Convergence' },
    metals:  { common: 'Copper', rare: 'Silver', epic: 'Gold' },
    metalGloss: { common: '', rare: '', epic: '' },
    weapons:  { none: ['Dagger', ''], venom: ['Venom Dagger', ''], vampiric: ['Blood Sword', ''],
                chain: ['Storm Disc', ''], executioner: ["Executioner's Axe", ''] },
    trinkets: { vitality: ['Life Gem', ''], aegis: ['Aegis', ''], thorns: ['Thorn Band', ''],
                swift: ['Swift Sandals', ''], regen: ['Healing Herb', ''] },
    forms:    { none: ['Fire', ''], venom: ['Poison', ''], vampiric: ['Blood', ''], chain: ['Lightning', ''], executioner: ['Execution', ''] },
    boons:    { keen: ['Keen Edge', ''], quick: ['Quick Hands', ''], reach: ['Long Reach', ''], feet: ['Light Feet', ''],
                iron: ['Iron Body', ''], hide: ['Thick Hide', ''], ground: ['Hold Your Ground', ''], run: ['Strike on the Run', ''],
                second: ['Second Target', ''], readslam: ['Read the Slam', ''], laststand: ['Last Stand', ''], greed: ['Greed', ''],
                rot: ['Spreading Rot', ''], bloodshield: ['Blood Shield', ''], fork: ['Forked Lightning', ''], cleancut: ['Clean Cut', ''],
                kindling: ['Kindling', ''], hunger: ['Eclipse Hunger', ''] },
    sectors: [['The Courtyard', 'sunlit stone at the top of the well'],
              ['The Drowned Steps', 'the flooded level'],
              ['The Gold Vault', 'the hoard at the bottom']],
    deeper: ['The Bottomless Well', 'deeper than any map remembers'],
    cards: [
      { kind: 'You',      dev: '', name: 'Hero',           meaning: '', you: true, role: 'That is you. You strike on your own - your whole job is choosing where to stand.' },
      { kind: 'Enemy',    dev: '', name: 'Goblin',         meaning: '', role: 'The rank and file. They rush straight at you and hit on contact.' },
      { kind: 'Enemy',    dev: '', name: 'Hexer',          meaning: '', role: 'Keeps its distance and throws bolts. Keep moving sideways.' },
      { kind: 'Enemy',    dev: '', name: 'Brute',          meaning: '', role: "Slow, heavy, and hits like a cart. Don't let it corner you." },
      { kind: 'Enemy',    dev: '', name: 'Splitter',       meaning: '', role: 'Kill one, and two smaller ones spring up.' },
      { kind: 'Boss',     dev: '', name: 'Gatekeeper',     meaning: '', role: 'Bars the way on wave 3. He resists until the timer over his head runs out - then strike.' },
      { kind: 'Boss',     dev: '', name: 'Hoard Guardian', meaning: '', role: 'Hides behind a shield. Kill the gold-glowing anchors to break it.' },
      { kind: 'Phase',    dev: '', name: 'Eclipse',        meaning: '', role: 'Everyone hits 30% harder. You included.' },
      { kind: 'Phase',    dev: '', name: 'Convergence',    meaning: '', role: 'Every 90 seconds an elite arrives, and the best loot of the cycle drops.' },
      { kind: 'Treasure', dev: '', name: 'Gold',           meaning: '', role: 'What you gather in the depths. Extract to bank all of it. Fall, and you keep half.' },
      { kind: 'Loot',     dev: '', name: 'Copper, Silver, Gold', meaning: '', role: 'The metal is the quality. Gold items are more than twice as strong as copper.' },
      { kind: 'Power',    dev: '', name: 'Radiance',       meaning: '', role: 'Your supercharge. It fills as you fight; unleash it for six seconds of power shaped by your weapon.' },
      { kind: 'Boons',       dev: '', name: 'The + button', meaning: '', role: 'Every wave you clear earns a boon. Tap + whenever you like: the fight waits while you pick one of three.' },
      { kind: 'Bosses',      dev: '', name: 'Tribute',      meaning: '', role: 'Kill what a boss summons before you kill the boss. 5 earns an extra item, 10 a boon, 15 a gold boon.' },
      { kind: 'You',         dev: '', name: 'Power',        meaning: '', role: 'One number for how strong you are. Your weapon, your trinket and every boon add to it. Tap it to see your profile.' },
      { kind: 'The well', dev: '', name: 'Seven depths', meaning: '', role: 'Slay the serpent and a step of the well fills. The next depth is harder and pays more. Win all seven.' },
      { kind: 'You',      dev: '', name: 'Perks',        meaning: '', role: 'Your first boss kills, and each depth you win, earn a gift that lasts. Wear two of them: choose on your Profile.' }
    ]
  },
  // The default since 2026-10-04. The founder played all three and liked this one "much
  // better than the Sanskrit version", then asked for it to lean further West. So English
  // carries everything a player must understand at a glance - the phases, the enemy
  // types, the weapons - and four short Sanskrit words stay as the game's own: Asura,
  // Vritra, Nidhi and Tejas. No Devanagari on the loading screen. The hero was "Kiran"
  // until 2026-10-06; the founder did not like it, and the player now names the hero
  // (requirements 2.32). `player` is what an unnamed hero is called.
  // 2026-10-14 (build 0.23), the founder, of names "sounding too Indian and difficult": Asura is
  // Imp, Vritra is The Thirst, Nidhi is Hoard, Tejas is Overdrive, the Storm Chakram is the
  // Storm Disc and Convergence is Zenith. The serpent is still a serpent.
  hybrid: {
    player: 'Hero', currency: 'Hoard', satchel: 'Satchel', supercharge: 'Overdrive', stage: 'Level',
    pause: 'Paused', pauseSub: '',
    enemies: { melee: 'Imp', ranged: 'Hexer', tank: 'Brute', splitter: 'Bloodseed',
               gatekeeper: 'Gatekeeper', sectorboss: 'Hoard Guardian', megaboss: 'The Thirst' },
    phases:  { drift: 'Calm', surge: 'Surge', eclipse: 'Eclipse', convergence: 'Zenith' },
    metals:  { common: 'Copper', rare: 'Silver', epic: 'Gold' },
    metalGloss: { common: '', rare: '', epic: '' },
    weapons:  { none: ['Dagger', ''], venom: ['Venom Dagger', ''], vampiric: ['Blood Sword', ''],
                chain: ['Storm Disc', ''], executioner: ["Slayer's Axe", ''] },
    trinkets: { vitality: ['Life Gem', ''], aegis: ['Aegis', ''], thorns: ['Thorn Band', ''],
                swift: ['Swift Sandals', ''], regen: ['Healing Herb', ''] },
    forms:    { none: ['Fire', ''], venom: ['Poison', ''], vampiric: ['Blood', ''], chain: ['Lightning', ''], executioner: ['Execution', ''] },
    boons:    { keen: ['Keen Edge', ''], quick: ['Quick Hands', ''], reach: ['Long Reach', ''], feet: ['Light Feet', ''],
                iron: ['Iron Body', ''], hide: ['Thick Hide', ''], ground: ['Hold Your Ground', ''], run: ['Strike on the Run', ''],
                second: ['Second Target', ''], readslam: ['Read the Slam', ''], laststand: ['Last Stand', ''], greed: ['Greed', ''],
                rot: ['Spreading Rot', ''], bloodshield: ['Blood Shield', ''], fork: ['Forked Lightning', ''], cleancut: ['Clean Cut', ''],
                kindling: ['Kindling', ''], hunger: ['Eclipse Hunger', ''] },
    sectors: [['The Courtyard', 'sunlit stone at the top of the well'],
              ['The Drowned Steps', 'the flooded level'],
              ['The Gold Vault', 'the hoard at the bottom']],
    deeper: ['The Abyss', 'deeper than any map remembers'],
    cards: [
      { kind: 'You',        dev: '', name: 'Hero',           meaning: '', you: true, role: 'That is you. You strike on your own - your whole job is choosing where to stand.' },
      { kind: 'Enemy',      dev: '', name: 'Imp',            meaning: '', role: 'The rank and file. They rush straight at you and hit on contact.' },
      { kind: 'Enemy',      dev: '', name: 'Hexer',          meaning: '', role: 'Keeps its distance and throws bolts. Keep moving sideways.' },
      { kind: 'Enemy',      dev: '', name: 'Brute',          meaning: '', role: "Slow, heavy, and hits like a cart. Don't let it corner you." },
      { kind: 'Enemy',      dev: '', name: 'Bloodseed',      meaning: '', role: 'Kill one, and two smaller ones spring up.' },
      { kind: 'Boss',       dev: '', name: 'Gatekeeper',     meaning: '', role: 'Bars the way on wave 3. He resists until the timer over his head runs out - then strike.' },
      { kind: 'Boss',       dev: '', name: 'Hoard Guardian', meaning: '', role: 'Hides behind a shield. Kill the gold-glowing anchors to break it.' },
      { kind: 'Final boss', dev: '', name: 'The Thirst',     meaning: 'the serpent who drank the well dry', role: 'Waits at the bottom of the well. Slay him and the water returns.' },
      { kind: 'Phase',      dev: '', name: 'Surge',          meaning: '', role: 'Enemies pour in faster - and loot drops richer.' },
      { kind: 'Phase',      dev: '', name: 'Eclipse',        meaning: '', role: 'Everyone hits 30% harder. You included.' },
      { kind: 'Phase',      dev: '', name: 'Zenith',         meaning: '', role: 'Every 90 seconds an elite arrives, and the best loot of the cycle drops.' },
      { kind: 'Treasure',   dev: '', name: 'Hoard',          meaning: '', role: 'What you gather in the depths. Extract to bank all of it. Fall, and you keep half.' },
      { kind: 'Loot',       dev: '', name: 'Copper, Silver, Gold', meaning: '', role: 'The metal is the quality. Gold items are more than twice as strong as copper.' },
      { kind: 'Supercharge', dev: '', name: 'Overdrive',     meaning: '', role: 'It fills as you fight. Unleash it for six seconds of power shaped by your weapon: the button says which.' },
      { kind: 'Boons',      dev: '', name: 'The + button',   meaning: '', role: 'Every wave you clear earns a boon. Tap + whenever you like: the fight waits while you pick one of three.' },
      { kind: 'Bosses',     dev: '', name: 'Tribute',        meaning: '', role: 'Kill what a boss summons before you kill the boss. 5 earns an extra item, 10 a boon, 15 a gold boon.' },
      { kind: 'You',        dev: '', name: 'Power',          meaning: '', role: 'One number for how strong you are. Your weapon, your trinket and every boon add to it. Tap it to see your profile.' },
      { kind: 'The well', dev: '', name: 'Seven depths', meaning: '', role: 'Slay the serpent and a step of the well fills. The next depth is harder and pays more. Win all seven.' },
      { kind: 'You',      dev: '', name: 'Perks',        meaning: '', role: 'Your first boss kills, and each depth you win, earn a gift that lasts. Wear two of them: choose on your Profile.' }
    ]
  }
};
const NAME_PACK = 'hybrid';
const N = pickFrom(NAME_PACKS, QUERY.get('names'), NAME_PACK);
const GLOSSARY = N.cards;
