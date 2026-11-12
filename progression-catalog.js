// Source pages for the preview catalog:
// https://wiki.risenholm.com/index.php/General_Mechanics_Information
// https://wiki.risenholm.com/index.php/Playable_Races
// https://wiki.risenholm.com/index.php/Skills
// https://wiki.risenholm.com/index.php/Feats
// https://wiki.risenholm.com/index.php/Rogue
// https://wiki.risenholm.com/index.php/Bard

import { arcaneClasses } from './progression-arcane.js';
import { divineClasses, divineFeats } from './progression-divine.js';
import { martialClasses, martialFeats } from './progression-martial.js';

const races = [
  { id: 'human', name: 'Human', bonusSkillPoints: 1 },
  { id: 'dwarf', name: 'Dwarf', bonusSkillPoints: 0 },
  { id: 'elf', name: 'Elf', bonusSkillPoints: 0 },
  { id: 'gnome', name: 'Gnome', bonusSkillPoints: 0 },
  { id: 'halfling', name: 'Halfling', bonusSkillPoints: 0 },
  { id: 'orc', name: 'Orc', bonusSkillPoints: 0 },
  { id: 'triton', name: 'Triton', bonusSkillPoints: 0 },
];

const skills = [
  { id: 'alchemy', name: 'Alchemy', ability: 'INT' },
  { id: 'arcana', name: 'Arcana', ability: 'INT' },
  { id: 'athletics', name: 'Athletics', ability: 'STR' },
  { id: 'coercion', name: 'Coercion', ability: 'CHA' },
  { id: 'deception', name: 'Deception', ability: 'CHA' },
  { id: 'diplomacy', name: 'Diplomacy', ability: 'CHA' },
  { id: 'insight', name: 'Insight', ability: 'WIS' },
  { id: 'investigation', name: 'Investigation', ability: 'INT' },
  { id: 'knowledge', name: 'Knowledge', ability: 'INT' },
  { id: 'medicine', name: 'Medicine', ability: 'WIS' },
  { id: 'nature', name: 'Nature', ability: 'WIS' },
  { id: 'perception', name: 'Perception', ability: 'WIS' },
  { id: 'performance', name: 'Performance', ability: 'CHA' },
  { id: 'religion', name: 'Religion', ability: 'WIS' },
  { id: 'stealth', name: 'Stealth', ability: 'DEX' },
  { id: 'survival', name: 'Survival', ability: 'WIS' },
  { id: 'tinkering', name: 'Tinkering', ability: 'INT' },
];

const feats = [
  { id: 'critical-hit-resilience', name: 'Critical Hit Resilience', general: false, description: 'Limits incoming critical hits to one each round.' },
  { id: 'cleave', name: 'Cleave', general: true, description: 'Killing a foe grants a free attack against a nearby enemy once per round.', upgrade: { level: 6, name: 'Great Cleave' } },
  { id: 'great-fortitude', name: 'Great Fortitude', general: true, description: 'Gain +5 to Fortitude saves.' },
  { id: 'improved-unarmed-strike', name: 'Improved Unarmed Strike', general: true, description: 'Unarmed strikes avoid provoking attacks of opportunity and deal an extra 1d4 with an empty main hand.' },
  { id: 'iron-will', name: 'Iron Will', general: true, description: 'Gain +5 to Will saves.' },
  { id: 'lightning-reflexes', name: 'Lightning Reflexes', general: true, description: 'Gain +5 to Reflex saves.' },
  { id: 'ranged-fighting', name: 'Combat Style: Ranged Fighting', general: true, description: 'Removes the melee penalty for ranged attacks. Bows and thrown weapons gain an extra attack, and crossbows gain attack bonus and lose their single-attack limit.', upgrade: { level: 6, name: 'Improved Ranged Fighting' } },
  { id: 'two-weapon-fighting', name: 'Combat Style: Two-Weapon Fighting', general: true, description: 'Removes the dual-wield attack penalty and adds an attack when another effect grants an extra attack.', upgrade: { level: 6, name: 'Improved Two-Weapon Fighting' } },
  { id: 'great-weapon-fighting', name: 'Combat Style: Great-Weapon Fighting', general: true, description: 'Doubles weapon damage bonuses with a Large melee weapon.', upgrade: { level: 6, name: 'Improved Great-Weapon Fighting' } },
  { id: 'single-weapon-fighting', name: 'Combat Style: Single Weapon Fighting', general: true, description: 'Gain +3 attack bonus with a one-handed melee weapon and empty off hand. Exceeding the target’s AC adds damage.', upgrade: { level: 6, name: 'Improved Single Weapon Fighting' } },
  { id: 'shield-fighting', name: 'Combat Style: Shield Fighting', general: true, description: 'A shield grants 20% multiplicative physical damage immunity and a CON-based chance to retaliate with an attack of opportunity.', upgrade: { level: 6, name: 'Improved Shield Fighting' } },
  { id: 'implement-fighting', name: 'Combat Style: Implement Fighting', general: true, description: 'With an off-hand implement, attacks and harmful spells build Retaliation that lowers the enemy’s attack bonus.', upgrade: { level: 6, name: 'Improved Implement Fighting' } },
  { id: 'armor-proficiency-heavy', name: 'Proficiency: Armour, Heavy', general: true, description: 'Use heavy armour.' },
  { id: 'armor-proficiency-medium', name: 'Proficiency: Armour, Medium', general: true, description: 'Use medium armour.' },
  { id: 'armor-proficiency-light', name: 'Proficiency: Armour, Light', general: true, description: 'Use light armour.' },
  { id: 'shield-proficiency', name: 'Proficiency: Shield', general: true, description: 'Use shields.' },
  { id: 'martial-weapon-proficiency', name: 'Proficiency: Weapon, Martial', general: true, description: 'Use martial weapons.' },
  { id: 'simple-weapon-proficiency', name: 'Proficiency: Weapon, Simple', general: true, description: 'Use simple weapons.' },
  { id: 'simple-weapon-mastery', name: 'Simple Weapon Mastery', general: true, description: 'Gain damage with simple weapons, with a larger bonus for large weapons and light crossbows.' },
  { id: 'maneuver-knockdown', name: 'Maneuver: Knockdown', general: true, description: 'Attempt to knock enemies prone. Targets resist with Fortitude.' },
  { id: 'maneuver-blind', name: 'Maneuver: Blind', general: true, description: 'Attempt to blind enemies. Targets resist with Reflex.' },
  { id: 'maneuver-commander-strike', name: 'Maneuver: Commander Strike', general: true, description: 'Grant an ally an extra attack for a duration based on CHA.' },
  { id: 'maneuver-provoke', name: 'Maneuver: Provoke', general: true, description: 'Draw enemy attacks toward you and reduce the damage they deal to others.' },
  { id: 'maneuver-called-shot', name: 'Maneuver: Called Shot', general: true, description: 'Reduce enemy attack bonus and movement speed for a duration based on WIS.' },
  { id: 'maneuver-bypass', name: 'Maneuver: Bypass', general: true, description: 'Move through occupied spaces for one round.' },
  { id: 'maneuver-reel-in', name: 'Maneuver: Reel In', general: true, description: 'Pull an enemy toward you unless they pass a Reflex save.' },
  { id: 'maneuver-knockback', name: 'Maneuver: Knockback', general: true, description: 'Push back a target and potentially daze them when they hit an obstacle.' },
  { id: 'maneuver-stun', name: 'Maneuver: Stun', general: true, description: 'Attempt to stun enemies. Targets resist with Will.' },
  { id: 'martial-acuity', name: 'Martial Acuity', general: true, description: 'Add your highest mental modifier to attack bonus, subject to the combined +10 ability modifier cap.' },
  { id: 'strategic-defense', name: 'Strategic Defense', general: true, description: 'Add your highest mental modifier to AC alongside DEX, subject to the combined +10 and armour caps.' },
  { id: 'robust-defense', name: 'Robust Defense', general: true, description: 'Combine DEX and CON modifiers for AC within the armour cap.' },
  { id: 'selective-gadget', name: 'Selective Gadget', general: true, description: 'Lets affected gadgets deal damage only to enemies.' },
  { id: 'gadget-focus', name: 'Gadget Focus', general: true, description: 'Add +2 to gadget DCs, increasing to +4 at level 6.', upgrade: { level: 6, name: 'Greater Gadget Focus' } },
  { id: 'dodgeroll', name: 'Dodgeroll', general: true, description: 'Spend 5 Stamina to quickly cross a short distance, passing through creatures.' },
  { id: 'spell-focus', name: 'Spell Focus', general: true, description: 'Add +2 to spell DCs, increasing to +4 at level 6.', upgrade: { level: 6, name: 'Greater Spell Focus' } },
  { id: 'toughness', name: 'Toughness', general: true, description: 'Double the hit points from class hit dice, including levels taken before this feat.' },
  { id: 'extra-summoning', name: 'Extra Summoning', general: true, description: 'Control one additional summon.' },
  { id: 'symbiotic-link', name: 'Symbiotic Link', general: true, description: 'Share many of your warding spells with your summons and companions.' },
  { id: 'scribe-scroll', name: 'Scribe Scroll', general: true, description: 'Use ichor and a prepared blank scroll to record a spell you know.' },
  { id: 'quicken-spell', name: 'Metamagic: Quicken Spell', general: true, description: 'Spend 4 Metamagic for charges that allow two spells in a round. Haste prevents charge use.' },
  { id: 'silent-spell', name: 'Metamagic: Silent Spell', general: true, description: 'Spend 1 Metamagic for charges that remove the verbal components of your spells.' },
  { id: 'extend-spell', name: 'Metamagic: Extend Spell', general: true, description: 'Spend 1 Metamagic to double your next spell’s duration.' },
  { id: 'empower-spell', name: 'Metamagic: Empower Spell', general: true, description: 'Spend 1 Metamagic to increase your spell’s damage by 50%.' },
  { id: 'selective-spell', name: 'Metamagic: Selective Spell', general: true, description: 'Spend 1 Metamagic to keep the next harmful spell from affecting allies.' },
  {
    id: 'heighten-spell',
    name: 'Metamagic: Heighten Spell',
    general: true,
    description: 'Spend 1 Metamagic to add +4 to your next spell’s DC.',
    requirements: [{ type: 'spellcasting', min: 1 }],
  },
  {
    id: 'conversion',
    name: 'Metamagic: Conversion',
    general: false,
    description: 'Spend Metamagic to restore your lowest available expended spell slot.',
    requirements: [{ type: 'spellcasting', min: 1 }],
  },
  { id: 'polarized-spell', name: 'Metamagic: Polarized Spell', general: true, description: 'Change the damage type of applicable spells to a type offered by your spellcasting class.' },
  { id: 'slippery-mind', name: 'Slippery Mind', general: false, description: 'Reroll failed Will saves against mind-affecting spells.' },
  { id: 'improved-evasion', name: 'Improved Evasion', general: false, description: 'When a Reflex save would halve damage, take none on a success and half on a failure.' },
  { id: 'blind-fight', name: 'Blind Fight', general: false, description: 'Reroll miss chance once and negate invisible attackers’ melee attack bonus.' },
  { id: 'skill-mastery', name: 'Skill Mastery', general: false, description: 'Automatically take 20 when handling traps and locks, including in combat.' },
  { id: 'harmony-echo', name: 'Harmony: Echo', general: false, description: 'Spend 2 Harmony to copy your beneficial spells to an ally.' },
  { id: 'harmony-sympathy', name: 'Harmony: Sympathy', general: false, description: 'Spend 1 Harmony to restore half of an ally’s missing HP.' },
  { id: 'harmony-epiphany', name: 'Harmony: Epiphany', general: false, description: 'Spend 1 Harmony to grant an ally Maneuvers and Metamagic based on CHA.' },
  { id: 'harmony-peace', name: 'Harmony: Peace', general: false, description: 'Spend 3 Harmony to grant an ally the effects of a Short Rest, limited per target between rests.' },
];

for (const energy of ['Fire', 'Cold', 'Acid', 'Lightning', 'Sonic', 'Force', 'Radiant', 'Necrotic', 'Psychic']) {
  feats.push({
    id: `energy-affinity-${energy.toLowerCase()}`,
    name: `Energy Affinity: ${energy}`,
    general: true,
    description: `Your ${energy.toLowerCase()} damage checks the enemy’s weakest damage immunity.`,
  });
}

const rogueChoices = [
  'slippery-mind', 'improved-evasion', 'blind-fight', 'skill-mastery',
  'armor-proficiency-heavy', 'selective-gadget', 'dodgeroll',
];
const bardChoices = ['harmony-echo', 'harmony-sympathy', 'harmony-epiphany', 'harmony-peace'];

const rogue = {
  id: 'rogue',
  name: 'Rogue',
  skillPoints: 10,
  features: {
    1: ['Sneak Attack', 'Maneuver: Blind', 'Simple Weapon Mastery'],
    2: ['Uncanny Dodge'],
    3: ['Sneak Attack improves', 'Evasion', 'Self-Concealment I', 'Moxie', 'Defensive Roll', 'Use Magic Device'],
    5: ['Sneak Attack improves', 'Uncanny Dodge II'],
    6: ['Self-Concealment II'],
    7: ['Sneak Attack improves'],
    9: ['Sneak Attack improves', 'Self-Concealment III'],
  },
  grantedFeats: {
    1: ['armor-proficiency-light', 'armor-proficiency-medium', 'maneuver-blind', 'simple-weapon-mastery'],
    3: ['evasion'],
  },
  bonusFeats: { 4: rogueChoices, 6: rogueChoices, 8: rogueChoices, 10: rogueChoices },
  archetypes: [
    { id: 'gadgeteer', name: 'Gadgeteer', features: { 4: ['Utility Belt'], 7: ['Duct Tape'], 10: ['Resourcefulness'] } },
    { id: 'silhouette', name: 'Silhouette', features: { 4: ['Shadow Step'], 7: ['Shadow Jump'], 10: ['Shadow Clone'] } },
    {
      id: 'thrillseeker',
      name: 'Thrillseeker',
      features: { 4: ['Thrillseeking', 'Maneuver: Provoke'], 7: ['Danger Zone'], 10: ['Hedged Bets'] },
      grantedFeats: { 4: ['maneuver-provoke'] },
    },
  ],
};

const bard = {
  id: 'bard',
  name: 'Bard',
  skillPoints: 8,
  castingAbility: 'CHA',
  spellCircleAtLevel: { 1: 1, 2: 3, 3: 5, 4: 7, 5: 9 },
  features: {
    1: ['1st-level spells', 'Bardic Knowledge', 'Metamagic: Conversion', 'Simple Weapon Mastery'],
    2: ['Inspiration +1'],
    3: ['2nd-level spells', 'Harmony: Vilify'],
    4: ['Inspiration +2'],
    5: ['3rd-level spells'],
    6: ['Inspiration +3'],
    7: ['4th-level spells'],
    8: ['Inspiration +4'],
    9: ['5th-level spells'],
    10: ['Inspiration +5'],
  },
  grantedFeats: {
    1: ['armor-proficiency-light', 'armor-proficiency-medium', 'shield-proficiency',
      'simple-weapon-proficiency', 'simple-weapon-mastery', 'conversion'],
  },
  bonusFeats: { 4: bardChoices, 6: bardChoices, 8: bardChoices, 10: bardChoices },
  archetypes: [
    { id: 'lorekeeper', name: 'Lorekeeper', features: { 4: ['Magical Secrets'], 7: ['Expansive Knowledge'], 10: ['Deep Lore'] } },
    {
      id: 'skald',
      name: 'Skald',
      features: { 4: ['Great Deeds', 'Martial Weapon Proficiency'], 7: ['Striking a Chord'], 10: ['Retelling'] },
      grantedFeats: { 4: ['martial-weapon-proficiency'] },
    },
    { id: 'storyteller', name: 'Storyteller', features: { 4: ['Living Legends'], 7: ['Rapt Audience'], 10: ['Legends Never Die'] } },
  ],
};

const classes = [rogue, bard, ...martialClasses, ...divineClasses, ...arcaneClasses]
  .sort((left, right) => left.name.localeCompare(right.name));

export const progressionCatalog = { races, skills, feats: [...feats, ...martialFeats, ...divineFeats], classes };
