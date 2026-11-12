import { ABILITIES } from './engine.js';

export const MAX_LEVEL = 10;
export const ARCHETYPE_UNLOCK_LEVEL = 4;
export const CREATION_POINTS = 20;
export const INTRO_POINTS = 4;
const abilityKeys = ABILITIES.map(name => name.slice(0, 3).toUpperCase());
// NWN's general feat cadence plus the universal bonus creation feat documented by Risenholm.
const generalFeatCount = { 1: 2, 3: 1, 6: 1, 9: 1 };
const modifier = score => Math.floor((score - 10) / 2);
const numberWithin = (value, fallback, min, max) =>
  Number.isInteger(value) && value >= min && value <= max ? value : fallback;
const knownId = (value, options) => options.some(option => option.id === value) ? value : '';

export function skillPointBudget(characterClass, race) {
  return characterClass ? characterClass.skillPoints + (race?.bonusSkillPoints ?? 0) : null;
}

export function createProgression() {
  return {
    raceId: '',
    creation: Object.fromEntries(abilityKeys.map(key => [key, 10])),
    intro: Object.fromEntries(abilityKeys.map(key => [key, 0])),
    archetypes: {},
    levels: Array.from({ length: MAX_LEVEL }, () => ({
      classId: '', generalFeats: [], bonusFeats: [], skills: {}
    }))
  };
}

export function normalizeProgression(value, catalog) {
  const plan = createProgression();
  plan.raceId = knownId(value?.raceId, catalog.races);
  for (const key of abilityKeys) {
    plan.creation[key] = numberWithin(value?.creation?.[key], 10, 10, 16);
    plan.intro[key] = numberWithin(value?.intro?.[key], 0, 0, INTRO_POINTS);
  }
  for (const entry of catalog.classes) {
    const archetype = knownId(value?.archetypes?.[entry.id], entry.archetypes);
    if (archetype) plan.archetypes[entry.id] = archetype;
  }
  plan.levels.forEach((row, index) => {
    const input = value?.levels?.[index];
    row.classId = knownId(input?.classId, catalog.classes);
    for (const [group, count] of [['generalFeats', generalFeatCount[index + 1] ?? 0], ['bonusFeats', 1]]) {
      if (Array.isArray(input?.[group])) {
        row[group] = input[group].slice(0, count).map(id => knownId(id, catalog.feats));
      }
    }
    for (const skill of catalog.skills) {
      const ranks = numberWithin(input?.skills?.[skill.id], 0, 0, MAX_LEVEL);
      if (ranks) row.skills[skill.id] = ranks;
    }
  });
  return plan;
}

function missingRequirement(feat, knownFeats, classLevels, baseScores, catalog) {
  if (knownFeats.has(feat.id)) return 'Already acquired';
  for (const requirement of feat.requirements ?? []) {
    const { type, id, min } = requirement;
    if (type === 'feat' && !knownFeats.has(id)) {
      return `Requires ${catalog.feats.find(entry => entry.id === id)?.name ?? id}`;
    }
    if (type === 'classLevel' && (classLevels.get(id) ?? 0) < min) {
      return `Requires ${catalog.classes.find(entry => entry.id === id)?.name ?? id} ${min}`;
    }
    if (type === 'ability' && baseScores[id] < min) return `Requires ${id} ${min}`;
    if (type === 'spellcasting') {
      const qualifies = catalog.classes.some(entry => {
        const unlockLevel = entry.spellCircleAtLevel?.[min];
        return unlockLevel && (classLevels.get(entry.id) ?? 0) >= unlockLevel &&
          baseScores[entry.castingAbility] >= 10 + min;
      });
      if (!qualifies) return `Requires level ${min} spellcasting`;
    }
  }
  return '';
}

export function evaluateProgression(plan, catalog, gear = {}) {
  const creationSpent = Object.values(plan.creation).reduce((sum, score) => sum + score - 10, 0);
  const introSpent = Object.values(plan.intro).reduce((sum, points) => sum + points, 0);
  const attributeErrors = [];
  if (creationSpent > CREATION_POINTS) attributeErrors.push(`Creation is ${creationSpent - CREATION_POINTS} points over budget.`);
  if (introSpent > INTRO_POINTS) attributeErrors.push(`Intro is ${introSpent - INTRO_POINTS} points over budget.`);

  const abilities = ABILITIES.map((name, index) => {
    const id = abilityKeys[index];
    const creation = plan.creation[id];
    const intro = plan.intro[id];
    const base = creation + intro;
    const equipped = base + Math.min(10, gear.attributes?.[name] ?? 0);
    return { id, name, creation, intro, base, equipped, modifier: modifier(equipped) };
  });
  const skillGear = new Map((gear.stats ?? []).filter(stat => stat.key.startsWith('skill:'))
    .map(stat => [stat.key.slice(6), stat.value]));
  const race = catalog.races.find(entry => entry.id === plan.raceId);
  const ranks = new Map();
  const classLevels = new Map();
  const knownFeats = new Set();
  const featById = new Map(catalog.feats.map(feat => [feat.id, feat]));
  const generalChoices = catalog.feats.filter(feat => feat.general);
  let foundEmptyLevel = false;

  const levels = plan.levels.map((row, index) => {
    const level = index + 1;
    const entry = catalog.classes.find(entry => entry.id === row.classId);
    const errors = [];
    const classLevel = entry ? (classLevels.get(entry.id) ?? 0) + 1 : 0;
    if (entry) {
      classLevels.set(entry.id, classLevel);
      if (foundEmptyLevel) errors.push('Choose a class for the earlier levels to confirm these unlocks.');
    } else {
      foundEmptyLevel = true;
    }
    const archetype = classLevel >= ARCHETYPE_UNLOCK_LEVEL
      ? entry.archetypes.find(item => item.id === plan.archetypes[entry.id])
      : undefined;
    const features = [
      ...(level === 1 && entry ? ['Critical Hit Resilience'] : []),
      ...(entry?.features?.[classLevel] ?? []),
      ...(archetype?.features?.[classLevel] ?? [])
    ];
    const baseScores = Object.fromEntries(abilities.map(ability => [ability.id, level < 3 ? ability.creation : ability.base]));
    const equippedScores = Object.fromEntries(abilities.map(ability =>
      [ability.id, baseScores[ability.id] + (ability.equipped - ability.base)]));
    const statModifiers = Object.fromEntries(abilities.map(ability =>
      [ability.id, modifier(equippedScores[ability.id])]));

    for (const id of knownFeats) {
      const upgrade = featById.get(id)?.upgrade;
      if (upgrade?.level === level) features.push(upgrade.name);
    }
    function acquireFeat(id) {
      if (knownFeats.has(id)) return;
      knownFeats.add(id);
      const upgrade = featById.get(id)?.upgrade;
      if (upgrade && upgrade.level <= level) features.push(upgrade.name);
    }
    for (const id of [...(entry?.grantedFeats?.[classLevel] ?? []), ...(archetype?.grantedFeats?.[classLevel] ?? [])]) {
      acquireFeat(id);
    }

    function featSlot(value, choices) {
      const options = choices.map(feat => ({
        id: feat.id, name: feat.name, description: feat.description,
        reason: missingRequirement(feat, knownFeats, classLevels, baseScores, catalog)
      }));
      const selected = options.find(option => option.id === value);
      const error = value ? (selected ? selected.reason : 'Unavailable in this feat slot') : '';
      if (selected && !error) acquireFeat(value);
      return { value: value || '', options, error };
    }

    const generalFeats = Array.from({ length: generalFeatCount[level] ?? 0 }, (_, slot) =>
      featSlot(row.generalFeats[slot], generalChoices));
    const bonusIds = entry?.bonusFeats?.[classLevel] ?? [];
    const bonusChoices = bonusIds.map(id => featById.get(id)).filter(Boolean);
    const bonusFeats = bonusChoices.length || row.bonusFeats[0] ? [featSlot(row.bonusFeats[0], bonusChoices)] : [];

    const skillBudget = skillPointBudget(entry, race);
    let skillSpent = 0;
    const skills = catalog.skills.map(skill => {
      const previous = ranks.get(skill.id) ?? 0;
      const added = row.skills[skill.id] ?? 0;
      const current = previous + added;
      const max = Math.max(0, level - previous);
      skillSpent += added;
      ranks.set(skill.id, current);
      if (current > level) errors.push(`${skill.name} has ${current} ranks. The level ${level} cap is ${level}.`);
      const gearKey = skill.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      const bardicKnowledge = skill.id === 'knowledge' ? (classLevels.get('bard') ?? 0) : 0;
      const abilityModifier = statModifiers[skill.ability];
      const baseModifier = modifier(baseScores[skill.ability]);
      const gearBonus = skillGear.get(gearKey) ?? 0;
      const bonus = abilityModifier + gearBonus + bardicKnowledge;
      return {
        ...skill, added, max, ranks: current, effective: current + Math.min(current, bonus),
        baseEffective: current + Math.min(current, baseModifier + bardicKnowledge),
        abilityModifier, baseModifier, gearBonus, bardicKnowledge,
      };
    });
    const skillRemaining = skillBudget === null ? null : skillBudget - skillSpent;
    if (skillRemaining < 0) errors.push(`${-skillRemaining} skill points over budget.`);
    if (skillBudget === null && skillSpent) errors.push('Choose a class to check this level’s skill budget.');
    return {
      level, classId: row.classId, classLevel, features, generalFeats, bonusFeats,
      skillBudget, skillSpent, skillRemaining, skills, errors,
      classLevels: Object.fromEntries(classLevels), knownFeats: [...knownFeats], baseScores, equippedScores, statModifiers,
    };
  });
  // An extra rank here also counts at every later level.
  const rankRoom = new Map();
  for (let index = levels.length - 1; index >= 0; index--) {
    const row = levels[index];
    row.skillIncreases = [];
    for (const skill of row.skills) {
      const room = Math.min(row.level - skill.ranks, rankRoom.get(skill.id) ?? Infinity);
      rankRoom.set(skill.id, room);
      if (skill.ranks > skill.added && room > 0) row.skillIncreases.push(skill.id);
    }
  }
  return { creationSpent, introSpent, abilities, attributeErrors, levels };
}
