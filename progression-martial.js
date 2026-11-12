// https://wiki.risenholm.com/index.php/Barbarian
// https://wiki.risenholm.com/index.php/Fighter
// https://wiki.risenholm.com/index.php/Monk
// https://wiki.risenholm.com/index.php/Ranger
// https://wiki.risenholm.com/index.php/Feats

const maneuvers = [
  'maneuver-knockdown', 'maneuver-blind', 'maneuver-commander-strike',
  'maneuver-provoke', 'maneuver-called-shot', 'maneuver-bypass',
  'maneuver-reel-in', 'maneuver-knockback', 'maneuver-stun',
];
const combatStyles = [
  'ranged-fighting', 'two-weapon-fighting', 'great-weapon-fighting',
  'single-weapon-fighting', 'shield-fighting', 'implement-fighting',
];
const fighterChoices = [
  'blind-fight', 'cleave', ...maneuvers, ...combatStyles, 'deflect-arrows',
  'evasion', 'improved-unarmed-strike',
];
const lightAndMediumArmor = ['armor-proficiency-light', 'armor-proficiency-medium'];
const martialProficiencies = [
  ...lightAndMediumArmor, 'shield-proficiency', 'simple-weapon-proficiency',
  'martial-weapon-proficiency',
];

export const martialFeats = [
  {
    id: 'deflect-arrows', name: 'Deflect Arrows', general: false,
    description: 'Attempt to deflect an incoming ranged attack once per round with a Reflex save while a hand is free.',
  },
  {
    id: 'evasion', name: 'Evasion', general: false,
    description: 'Take no damage on a successful Reflex save that would normally halve damage.',
  },
];

export const martialClasses = [
  {
    id: 'barbarian', name: 'Barbarian', skillPoints: 6,
    features: {
      1: ['Maneuver: Knockback', 'Simple Weapon Mastery'],
      2: ['Uncanny Dodge', 'Robust Defense'],
      3: ['Rage', 'Grit / Grudge'],
      5: ['Uncanny Dodge II'],
      6: ['Rage II'],
      8: ['Uncanny Dodge III'],
      9: ['Rage III'],
    },
    grantedFeats: {
      1: [...martialProficiencies, 'maneuver-knockback', 'simple-weapon-mastery'],
      2: ['robust-defense'],
    },
    bonusFeats: { 5: maneuvers },
    archetypes: [
      { id: 'berserker', name: 'Berserker', features: { 4: ['Berserk'], 7: ['Frenzy'], 10: ['Apoplexy'] } },
      {
        id: 'behemoth', name: 'Behemoth',
        features: { 4: ['Meaty', 'Maneuver: Provoke'], 7: ['Seasoned'], 10: ['Tenderized'] },
        grantedFeats: { 4: ['maneuver-provoke'] },
      },
      { id: 'agitator', name: 'Agitator', features: { 4: ['Instigator'], 7: ['Stoking the Coals'], 10: ['Mob Rule'] } },
    ],
  },
  {
    id: 'fighter', name: 'Fighter', skillPoints: 6,
    features: {
      1: ['Maneuver: Knockdown', 'Simple Weapon Mastery'],
      3: ['Action Surge', 'Battle Master I', 'Hard Target', 'Second Wind'],
      5: ['Battle Master II', 'Precision I'],
      7: ['Battle Master III'],
      9: ['Battle Master IV'],
      10: ['Precision II'],
    },
    grantedFeats: {
      1: [...martialProficiencies, 'armor-proficiency-heavy', 'maneuver-knockdown', 'simple-weapon-mastery'],
    },
    bonusFeats: { 2: fighterChoices, 4: fighterChoices, 6: fighterChoices, 8: fighterChoices, 10: fighterChoices },
    archetypes: [
      { id: 'vanquisher', name: 'Vanquisher', features: { 4: ['Backswing'], 7: ['Vanquishing'], 10: ['Flawless Technique'] } },
      {
        id: 'juggernaut', name: 'Juggernaut',
        features: { 4: ['Inertia', 'Maneuver: Provoke'], 7: ['Momentum'], 10: ['Pendulum'] },
        grantedFeats: { 4: ['maneuver-provoke'] },
      },
      { id: 'marshal', name: 'Marshal', features: { 4: ['Rally'], 7: ['Hard Corps'], 10: ['Call to Action'] } },
    ],
  },
  {
    id: 'monk', name: 'Monk', skillPoints: 6,
    features: {
      1: ['Ki', 'Flurry of Blows', 'Improved Unarmed Strike', 'Maneuver: Stun', 'Simple Weapon Mastery'],
      2: ['Deflect Missiles', 'Strategic Defense'],
      3: ['Evasion', 'Wholeness of Body', 'Martial Arts'],
      5: ['Improved Flurry of Blows', 'Monk AC I'],
      6: ['Still Mind'],
      8: ['Purity of Body'],
      9: ['Improved Evasion'],
      10: ['Monk AC II'],
    },
    grantedFeats: {
      1: ['simple-weapon-proficiency', 'improved-unarmed-strike', 'maneuver-stun', 'simple-weapon-mastery'],
      2: ['deflect-arrows', 'strategic-defense'],
      3: ['evasion'],
      9: ['improved-evasion'],
    },
    bonusFeats: { 5: maneuvers },
    archetypes: [
      { id: 'way-of-thunder', name: 'Way of Thunder', features: { 4: ['Gathering Storm'], 7: ['Thunderstrike'], 10: ['Shockwave'] } },
      {
        id: 'way-of-wave-and-river', name: 'Way of Wave and River',
        features: { 4: ['Flow', 'Maneuver: Provoke'], 7: ['Crash'], 10: ['Formless'] },
        grantedFeats: { 4: ['maneuver-provoke'] },
      },
      { id: 'way-of-the-heavens', name: 'Way of the Heavens', features: { 4: ['Demonstrate'], 7: ['Encourage'], 10: ['Chastise'] } },
    ],
  },
  {
    id: 'ranger', name: 'Ranger', skillPoints: 6,
    castingAbility: 'WIS', spellCircleAtLevel: { 1: 1, 2: 5, 3: 9 },
    features: {
      1: ['1st-level spells', 'Maneuver: Called Shot', 'Simple Weapon Mastery', 'Ranged Fighting', 'Metamagic: Conversion'],
      3: ['Awareness', 'Favoured Enemy', 'Favoured Terrain', 'Survival Instinct'],
      5: ['2nd-level spells'],
      6: ['Woodland Stride'],
      8: ['Evasion'],
      9: ['3rd-level spells'],
    },
    grantedFeats: {
      1: [...martialProficiencies, 'armor-proficiency-heavy', 'maneuver-called-shot',
        'simple-weapon-mastery', 'ranged-fighting', 'conversion'],
      8: ['evasion'],
    },
    bonusFeats: { 2: combatStyles },
    archetypes: [
      { id: 'predator', name: 'Predator', features: { 4: ['Rules of Nature'], 7: ['Bloodshed'], 10: ['Violence Breeds Violence'] } },
      {
        id: 'warden', name: 'Warden',
        features: { 4: ['Home Advantage', 'Maneuver: Provoke'], 7: ['Survivalist'], 10: ['Dead Set'] },
        grantedFeats: { 4: ['maneuver-provoke'] },
      },
      { id: 'beastmaster', name: 'Beastmaster', features: { 4: ['Animal Companion'], 7: ['Pack Tactics'], 10: ['Maneater'] } },
    ],
  },
];
