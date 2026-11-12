// https://wiki.risenholm.com/index.php/Cleric
// https://wiki.risenholm.com/index.php/Druid
// https://wiki.risenholm.com/index.php/Paladin
// https://wiki.risenholm.com/index.php/Feats

export const divineFeats = [
  { id: 'channel-divinity-divine-might', name: 'Channel Divinity: Divine Might', general: false, description: 'Boost weapon damage using the higher of CHA or WIS, up to twice your combined Cleric and Paladin levels.' },
  { id: 'channel-divinity-divine-shield', name: 'Channel Divinity: Divine Shield', general: false, description: 'Gain physical damage resistance that scales with your combined Cleric and Paladin levels, mental modifier, and maximum HP.' },
  { id: 'channel-divinity-beneficence', name: 'Channel Divinity: Beneficence', general: false, description: 'Heal the most injured nearby ally using your highest memorized Cure Wounds spell. Extra healing becomes temporary HP.' },
  { id: 'channel-divinity-ablution', name: 'Channel Divinity: Ablution', general: false, description: 'Apply Restoration to allies in an area. Requires a memorized Restoration spell when used.' },
  { id: 'channel-divinity-condemnation', name: 'Channel Divinity: Condemnation', general: false, description: 'Deal repeated Radiant damage in a targeted area for three rounds.' },
  { id: 'channel-divinity-consecration', name: 'Channel Divinity: Consecration', general: false, description: 'Create a damaging Radiant area around yourself for one minute.' },
  { id: 'channel-divinity-succor', name: 'Channel Divinity: Succor', general: false, description: 'Give an ally the effects of a Short Rest once per rest.' },
  { id: 'channel-divinity-sanctification', name: 'Channel Divinity: Sanctification', general: false, description: 'Give yourself or an ally a Radiant Retaliation effect that scales with WIS.' },
  { id: 'channel-divinity-fervor', name: 'Channel Divinity: Fervor', general: false, description: 'Give the target an extra attack per round for a duration based on WIS.' },
];

const channelDivinityChoices = divineFeats.map(feat => feat.id);
const armorAndShield = [
  'armor-proficiency-light', 'armor-proficiency-medium', 'armor-proficiency-heavy', 'shield-proficiency',
];
const fullSpellCircles = { 1: 1, 2: 3, 3: 5, 4: 7, 5: 9 };

const cleric = {
  id: 'cleric',
  name: 'Cleric',
  skillPoints: 6,
  castingAbility: 'WIS',
  spellCircleAtLevel: fullSpellCircles,
  features: {
    1: ['1st-level spells', 'Metamagic: Conversion', 'Choose a Divine Polarity in-game'],
    2: ['Channel Divinity: Turning'],
    3: ['2nd-level spells', 'Energy Affinity matching Divine Polarity'],
    5: ['3rd-level spells'],
    7: ['4th-level spells'],
    9: ['5th-level spells'],
  },
  grantedFeats: { 1: [...armorAndShield, 'simple-weapon-proficiency', 'conversion'] },
  bonusFeats: {
    3: channelDivinityChoices, 4: channelDivinityChoices, 6: channelDivinityChoices,
    8: channelDivinityChoices, 10: channelDivinityChoices,
  },
  archetypes: [
    {
      id: 'votive', name: 'Votive',
      features: { 4: ['Yajna', 'Robust Defense'], 7: ['Bhakti'], 10: ['Nirvana'] },
      grantedFeats: { 4: ['robust-defense'] },
    },
    {
      id: 'warpriest', name: 'Warpriest',
      features: {
        4: ['Power', 'Martial Weapon Proficiency', 'Simple Weapon Mastery'],
        7: ['Force'],
        10: ['Obliteration'],
      },
      grantedFeats: { 4: ['martial-weapon-proficiency', 'simple-weapon-mastery'] },
    },
    {
      id: 'ascendant', name: 'Ascendant',
      features: { 4: ['Ascension'], 7: ['Majesty'], 10: ['Apotheosis'] },
    },
  ],
};

const druid = {
  id: 'druid',
  name: 'Druid',
  skillPoints: 6,
  castingAbility: 'WIS',
  spellCircleAtLevel: fullSpellCircles,
  features: {
    1: ['1st-level spells', 'Metamagic: Conversion'],
    2: ['Woodland Stride', 'Metamagic: Polarized Spell'],
    3: ['2nd-level spells', 'Wildshape'],
    5: ['3rd-level spells'],
    6: ['Venom Immunity'],
    7: ['4th-level spells'],
    8: ['Resist Nature’s Lure'],
    9: ['5th-level spells'],
  },
  grantedFeats: {
    1: [...armorAndShield, 'conversion'],
    2: ['polarized-spell'],
  },
  archetypes: [
    {
      id: 'invoker', name: 'Invoker',
      features: { 4: ['Invocation'], 7: ['Leylines'], 10: ['Convergence'] },
    },
    {
      id: 'shifter', name: 'Shifter',
      features: { 4: ['Form Mastery', 'Primal Surge'], 7: ['Second Shift'], 10: ['Peak Performance'] },
    },
    {
      id: 'wildspeaker', name: 'Wildspeaker',
      features: { 4: ['First Words'], 7: ['Growing Bond'], 10: ['Rite of Passage'] },
    },
  ],
};

const paladin = {
  id: 'paladin',
  name: 'Paladin',
  skillPoints: 6,
  castingAbility: 'CHA',
  spellCircleAtLevel: { 1: 1, 2: 5, 3: 9 },
  features: {
    1: ['1st-level spells', 'Simple Weapon Mastery', 'Metamagic: Conversion'],
    2: ['Divine Grace'],
    3: ['Channel Divinity: Divine Might and Divine Shield', 'Lay on Hands', 'Smite'],
    5: ['2nd-level spells'],
    6: ['Divine Health'],
    8: ['Aura of Courage'],
    9: ['3rd-level spells'],
  },
  grantedFeats: {
    1: [...armorAndShield, 'simple-weapon-proficiency', 'martial-weapon-proficiency', 'simple-weapon-mastery', 'conversion'],
    3: ['channel-divinity-divine-might', 'channel-divinity-divine-shield'],
  },
  archetypes: [
    {
      id: 'avenger', name: 'Avenger',
      features: { 4: ['Judge'], 7: ['Jury'], 10: ['Executioner'] },
    },
    {
      id: 'templar', name: 'Templar',
      features: { 4: ['Forge'], 7: ['Anvil'], 10: ['Tempered'] },
    },
    {
      id: 'hospitaller', name: 'Hospitaller',
      features: { 4: ['Divine Intervention'], 7: ['Deliverance'], 10: ['Salvation'] },
    },
  ],
};

export const divineClasses = [cleric, druid, paladin];
