import { ARCHETYPE_UNLOCK_LEVEL } from './progression.js';
import { evaluateCharacterAttacks } from './character-attacks.js';
import { compare, gearStatParts, highest, partsDetail, partsValue, signed } from './character-sheet-values.js';
import { evaluateCharacterVitals } from './character-vitals.js';

const mod = score => Math.floor((score - 10) / 2);

function skillParts(skill, equipped) {
  const parts = [[skill.ranks, 'invested ranks'], [
    equipped ? skill.abilityModifier : skill.baseModifier, skill.ability,
  ]];
  if (skill.bardicKnowledge) parts.push([skill.bardicKnowledge, 'Bardic Knowledge']);
  if (equipped && skill.gearBonus) parts.push([skill.gearBonus, 'direct gear bonus']);
  return parts;
}

function skillDetail(skill, equipped) {
  const parts = skillParts(skill, equipped);
  const capped = partsValue(parts) > 2 * skill.ranks;
  return partsDetail(parts) + (capped ? `. Bonus capped at +${skill.ranks} by invested ranks.` : '');
}

export function evaluateCharacterSheet({ plan, evaluation, level, progressionCatalog, loadout, gear, equipmentCatalog }) {
  const row = evaluation.levels[level - 1];
  if (!row?.classId) return { ready: false };

  const stats = new Map(gear.stats.map(stat => [stat.key, stat]));
  const equippedMod = row.statModifiers;
  const buildMod = Object.fromEntries(Object.entries(row.baseScores).map(([ability, score]) => [ability, mod(score)]));
  const classes = row.classLevels;
  const classSummary = Object.entries(classes).map(([id, count]) => {
    const entry = progressionCatalog.classes.find(entry => entry.id === id);
    const archetype = count >= ARCHETYPE_UNLOCK_LEVEL ? entry.archetypes.find(item => item.id === plan.archetypes[id]) : null;
    return `${archetype?.name ?? entry.name} ${count}`;
  }).join(' / ');
  const feats = new Set(row.knownFeats);
  const focusBonus = level >= 6 ? 4 : 2;
  const gearPart = key => gearStatParts(stats, key);
  const compareModifiers = (label, parts, gearKey, options) => compare(
    label, parts(buildMod), [...parts(equippedMod), ...gearPart(gearKey)], options,
  );

  const combat = [];
  const armorItem = loadout.items.find(item => item.slot === 'chest');
  const armor = equipmentCatalog.armor.find(entry => entry.id === armorItem?.armorType || entry.name === armorItem?.armorType);
  const strategic = feats.has('strategic-defense');
  const robust = feats.has('robust-defense');
  if (strategic && robust) {
    combat.push({
      label: 'Armor Class',
      baseDetail: 'The wiki gives individual rules for Strategic Defense and Robust Defense. Their combined AC needs in-game verification.',
      equippedDetail: 'The wiki gives individual rules for Strategic Defense and Robust Defense. Their combined AC needs in-game verification.',
    });
  } else {
    const armorParts = (modifiers, equipped) => {
      const wornArmor = equipped ? armor : null;
      const defense = strategic ? highest(modifiers, ['INT', 'WIS', 'CHA'])
        : robust ? [modifiers.CON, 'CON'] : null;
      const combined = modifiers.DEX + (defense?.[0] ?? 0);
      const limit = wornArmor?.maxDex ?? 10;
      const name = defense ? `DEX and ${defense[1]} via ${strategic ? 'Strategic Defense' : 'Robust Defense'}` : 'DEX';
      const parts = [[10, 'base AC'], [Math.min(limit, combined), `${name}${combined > limit ? ` (capped from ${signed(combined)})` : ''}`]];
      if (wornArmor?.baseAC) parts.push([wornArmor.baseAC, wornArmor.name]);
      const monk = classes.monk ?? 0;
      if (monk >= 5) parts.push([monk >= 10 ? 2 : 1, 'Monk dodge']);
      if (equipped) {
        for (const [type, name] of [['armor', 'armor enchantment'], ['natural', 'natural'], ['deflection', 'deflection'], ['dodge', 'dodge']]) {
          if (gear.ac[type]) parts.push([gear.ac[type], `${name} gear AC`]);
        }
      }
      return parts;
    };
    combat.push(compare('Armor Class', armorParts(buildMod, false), armorParts(equippedMod, true)));
  }

  const survivalRanks = row.skills.find(skill => skill.id === 'survival')?.ranks ?? 0;
  const { hp, saves } = evaluateCharacterVitals({
    classCatalog: progressionCatalog.classes, classes, raceId: plan.raceId,
    feats, survivalRanks, buildMod, equippedMod, stats,
  });
  const weaponType = loadout.items.find(item => item.slot === 'weapon')?.weaponType;
  const weapon = equipmentCatalog.weapons.find(entry => entry.id === weaponType || entry.name === weaponType);
  combat.push(hp, ...evaluateCharacterAttacks({
    level, classes, feats, weapon, buildMod, equippedMod, stats, capstone: gear.capstone,
  }));

  const halfLevel = [Math.floor(level / 2), 'half character level'];
  combat.push(compareModifiers('Maneuver DC', modifiers => [[10, 'base'], halfLevel, highest(modifiers, ['STR', 'DEX'])], 'maneuverdc'));
  if (classes.rogue || feats.has('gadget-focus') || stats.has('gadgetdc')) {
    const focus = feats.has('gadget-focus') ? [[focusBonus, level >= 6 ? 'Greater Gadget Focus' : 'Gadget Focus']] : [];
    combat.push(compareModifiers('Gadget DC', modifiers => [[10, 'base'], halfLevel, [modifiers.INT, 'INT'], ...focus], 'gadgetdc', {
      note: 'Standard DC used by Acid Flask, Tanglefoot Bag, and similar gadgets.',
    }));
  }
  if (feats.has('spell-focus') || stats.has('spelldc')) {
    const focus = feats.has('spell-focus') ? [[focusBonus, level >= 6 ? 'Greater Spell Focus' : 'Spell Focus']] : [[0, 'feat bonus']];
    combat.push(compare('Spell DC bonus', focus, [...focus, ...gearPart('spelldc')]));
  }
  if (feats.has('cleave') || stats.has('damage_cleave:')) {
    const name = feats.has('cleave') ? (level >= 6 ? 'Great Cleave' : 'Cleave') : 'Cleave attacks';
    const parts = [[0, 'cleave-specific damage bonus from the build']];
    combat.push(compare('Cleave damage bonus', parts, [...parts, ...gearPart('damage_cleave:')], {
      suffix: '%', note: `Applies to attacks made by ${name}.`,
    }));
  }

  const athletics = row.skills.find(skill => skill.id === 'athletics');
  combat.push(compare('Dash speed bonus', [[50, 'from Dash'], [athletics.baseEffective, 'Athletics score']],
    [[50, 'from Dash'], [athletics.effective, 'Athletics score'], ...gearPart('dash:')], { suffix: '%' }));

  const insight = row.skills.find(skill => skill.id === 'insight');
  const stability = [[10, 'base'], [level, 'character level'], [Math.floor(insight.ranks / 2), 'from invested Insight ranks']];
  const battleMaster = classes.fighter >= 5;
  const resources = [
    compare('Stability', stability, [...stability, ...gearPart('stability')]),
    compareModifiers('Maneuvers', modifiers => [[3, 'base'], [
      modifiers.INT * (battleMaster ? 2 : 1), battleMaster ? 'INT doubled by Battle Master' : 'INT',
    ]], 'maneuvers'),
    compareModifiers('Stamina', modifiers => [[10, 'base'], [modifiers.CON, 'CON']], null, { percent: stats.get('stamina:')?.value }),
  ];
  if (progressionCatalog.classes.some(entry => classes[entry.id] && entry.castingAbility) || stats.has('metamagic')) {
    resources.push(compareModifiers('Metamagic', modifiers =>
      [[3, 'base'], ...['INT', 'WIS', 'CHA'].map(ability => [modifiers[ability], ability])], 'metamagic'));
  }
  function addResource(label, key, parts, note) {
    resources.push(compareModifiers(label, parts, null, { percent: stats.get(`resource:${key}`)?.value, note }));
  }
  if (classes.rogue >= 3) {
    const moxieParts = modifiers => [[classes.rogue, 'Rogue levels'], [modifiers.INT, 'INT']];
    addResource('Moxie', 'moxie', moxieParts);
    if (classes.rogue >= 4 && plan.archetypes.rogue === 'gadgeteer') {
      addResource('Utility Belt', 'moxie', moxieParts, 'Capacity follows maximum Moxie.');
    }
    if (classes.rogue >= 4 && plan.archetypes.rogue === 'thrillseeker') {
      resources.push(compareModifiers('Thrill', modifiers =>
        [[classes.rogue, 'Rogue levels'], [modifiers.CON, 'CON'], highest(modifiers, ['WIS', 'CHA'])], null, {
        note: 'Thrillseeking spends one Thrill per second.',
      }));
    }
  }
  if (classes.bard >= 3) addResource('Harmony', 'harmony', modifiers => [[classes.bard, 'Bard levels'], [modifiers.CHA, 'CHA']]);
  if (classes.monk) addResource('Ki', 'ki', modifiers => [[classes.monk, 'Monk levels'], [modifiers.WIS, 'WIS']]);
  if (classes.fighter >= 3) {
    const marshal = classes.fighter >= 4 && plan.archetypes.fighter === 'marshal';
    addResource('Discipline', 'discipline', modifiers => [
      [classes.fighter, 'Fighter levels'], [modifiers.INT, 'INT'],
      ...(marshal ? [[modifiers.CHA, 'CHA via Rally']] : []),
    ]);
  }

  const skills = row.skills.filter(skill => skill.ranks || skill.gearBonus).map(skill => ({
    label: skill.name, base: skill.baseEffective, equipped: skill.effective,
    baseDetail: skillDetail(skill, false), equippedDetail: skillDetail(skill, true),
  }));
  const unlocks = [...new Set(row.knownFeats.map(id => {
    const feat = progressionCatalog.feats.find(entry => entry.id === id);
    return feat?.upgrade?.level <= level ? feat.upgrade.name : feat?.name;
  }).filter(Boolean))];

  return {
    ready: true, level, classSummary, unlocks,
    groups: [
      { label: 'Combat', rows: combat },
      { label: 'Saving throws', rows: saves },
      { label: 'Resources', rows: resources },
      { label: 'Skills', rows: skills },
    ],
  };
}
