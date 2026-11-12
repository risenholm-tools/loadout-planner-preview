// https://wiki.risenholm.com/index.php/Sorcerer
// https://wiki.risenholm.com/index.php/Wizard
// https://wiki.risenholm.com/index.php/Feats

// The class pages describe the bonus feat categories without listing every choice.
const metamagicFeats = [
  'quicken-spell', 'silent-spell', 'extend-spell', 'empower-spell',
  'selective-spell', 'heighten-spell', 'polarized-spell',
];
const wizardBonusFeats = ['spell-focus', ...metamagicFeats];
const spellCircleAtLevel = { 1: 1, 2: 3, 3: 5, 4: 7, 5: 9 };

const sorcerer = {
  id: 'sorcerer',
  name: 'Sorcerer',
  skillPoints: 6,
  castingAbility: 'CHA',
  spellCircleAtLevel,
  features: {
    1: ['1st-level spells', 'Ablation', 'Metamagic: Conversion'],
    2: ['Font of Magic I'],
    3: ['2nd-level spells'],
    4: ['Font of Magic II'],
    5: ['3rd-level spells'],
    6: ['Font of Magic III'],
    7: ['4th-level spells'],
    8: ['Font of Magic IV'],
    9: ['5th-level spells'],
    10: ['Font of Magic V'],
  },
  grantedFeats: { 1: ['conversion', 'simple-weapon-proficiency'] },
  bonusFeats: { 4: metamagicFeats, 8: metamagicFeats },
  archetypes: [
    { id: 'conduit', name: 'Conduit', features: { 4: ['Dynamo'], 7: ['Capacitance'], 10: ['Unlimited Power'] } },
    {
      id: 'spellsword',
      name: 'Spellsword',
      features: { 4: ['Spellbinding'], 7: ['Wreathing'], 10: ['Flourishing Synergy'] },
      grantedFeats: {
        4: ['martial-weapon-proficiency', 'simple-weapon-mastery',
          'armor-proficiency-light', 'armor-proficiency-medium', 'shield-proficiency'],
      },
    },
    { id: 'summoner', name: 'Summoner', features: { 4: ['Harmony'], 7: ['Proxy'], 10: ['Eidolon'] } },
  ],
};

const wizard = {
  id: 'wizard',
  name: 'Wizard',
  skillPoints: 7,
  castingAbility: 'INT',
  spellCircleAtLevel,
  features: {
    1: ['1st-level spells', 'Arcane Focus', 'Metamagic: Conversion', 'Scribe Scroll', 'Summon Familiar'],
    2: ['Contingency I'],
    3: ['2nd-level spells', 'Revision'],
    4: ['Contingency II'],
    5: ['3rd-level spells'],
    6: ['Contingency III'],
    7: ['4th-level spells'],
    8: ['Contingency IV'],
    9: ['5th-level spells'],
    10: ['Contingency V'],
  },
  grantedFeats: { 1: ['conversion', 'scribe-scroll'] },
  bonusFeats: { 5: wizardBonusFeats, 10: wizardBonusFeats },
  archetypes: [
    { id: 'evoker', name: 'Evoker', features: { 4: ['Conjunction'], 7: ['Syzygy', 'Astroclasm'], 10: ['Binary System'] } },
    { id: 'conjurer', name: 'Conjurer', features: { 4: ['Reinforcements'], 7: ['Shock Troops'], 10: ['Vanguarded'] } },
    {
      id: 'eldritch-knight',
      name: 'Eldritch Knight',
      features: { 4: ['Launch Sequencer'], 7: ['Force Feedback'], 10: ['Rune and Iron'] },
      grantedFeats: {
        4: ['martial-weapon-proficiency', 'simple-weapon-proficiency', 'simple-weapon-mastery',
          'armor-proficiency-light', 'armor-proficiency-medium', 'armor-proficiency-heavy',
          'shield-proficiency', 'maneuver-provoke'],
      },
    },
  ],
};

export const arcaneClasses = [sorcerer, wizard];
