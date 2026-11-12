import { compare, highest, partsDetail, partsValue, signed } from './character-sheet-values.js';

function attackParts(modifiers, { baseAttack, weapon, feats, precision, singleWeaponBonus }) {
  const [physical, physicalAbility] = weapon.finesse
    ? highest(modifiers, ['STR', 'DEX'])
    : [modifiers.STR, 'STR'];
  const parts = [[baseAttack, 'base attack'], [physical, physicalAbility === 'DEX' ? 'DEX via Finesse' : 'STR']];
  if (feats.has('martial-acuity')) {
    const [mental, mentalAbility] = highest(modifiers, ['INT', 'WIS', 'CHA']);
    const applied = Math.min(mental, 10 - physical);
    parts.push([applied, `${mentalAbility} via Martial Acuity${applied < mental ? ' (combined ability bonus capped at +10)' : ''}`]);
  }
  if (precision) parts.push([precision, 'Fighter Precision']);
  if (singleWeaponBonus) parts.push([singleWeaponBonus, 'Single Weapon Fighting']);
  return parts;
}

function damageParts(modifiers, classes, enhancement, multiplier) {
  const parts = [[modifiers.STR * multiplier, 'STR'], [modifiers.DEX * multiplier, 'DEX']];
  if (enhancement) parts.push([enhancement * multiplier, 'weapon enhancement']);
  if (classes.monk >= 3) parts.push([Math.min(modifiers.WIS, 2 * classes.monk) * multiplier, 'Martial Arts']);
  if (classes.bard >= 2) parts.push([Math.floor(classes.bard / 2) * multiplier, 'Inspiration Aura']);
  return parts;
}

function damageRoll(weapon, parts, masteryDice) {
  const baseDice = weapon.damage.match(/^(\d+)d(\d+)$/i);
  const flat = partsValue(parts);
  if (!baseDice) return `${weapon.damage} ${signed(flat)}${masteryDice ? ` + ${masteryDice}` : ''}`;
  const dice = Number(baseDice[1]);
  const faces = Number(baseDice[2]);
  return `${Math.max(1, dice + flat)}–${Math.max(1, dice * faces + flat)}${masteryDice ? ` + ${masteryDice}` : ''}`;
}

function attackGearEffects(stats, multiplier) {
  const effects = [];
  for (const [key, condition, weaponMultiplier] of [
    ['rune', 'with an active rune', multiplier],
    ['oil', 'against an applicable target with an oil applied', multiplier],
    ['massive_crit', 'from Massive Criticals on a critical hit', 1],
    ['sneak', 'from gear on a sneak attack', 1],
  ]) {
    for (const part of stats.get(key)?.parts ?? []) {
      const dice = part.match(/\b\d+d\d+\b/i)?.[0];
      if (dice) effects.push(`+${weaponMultiplier > 1 ? `${weaponMultiplier} × ` : ''}${dice} ${condition}`);
    }
  }
  return effects;
}

function criticalHits(weapon, stats) {
  const [threat, multiplier] = (weapon.critical ?? '').split('/');
  if (!threat || !multiplier) return [];

  const range = threat.replace('-', '–');
  const value = `${range} / ${multiplier.replace(/^x/i, '×')}`;
  const detail = `${weapon.name} threatens a critical hit on an attack roll of ${range}.`;
  return [{
    label: 'Critical hits',
    base: value,
    equipped: value,
    baseDetail: detail,
    equippedDetail: detail,
    note: stats.has('massive_crit') ? 'Massive Criticals adds damage on a critical hit.' : '',
  }];
}

export function evaluateCharacterAttacks({ level, classes, feats, weapon, buildMod, equippedMod, stats, capstone }) {
  if (!weapon) return [];

  const enhancement = stats.get('enhancement')?.value ?? 0;
  const oneHanded = weapon.kind === 'melee' && weapon.size !== 'Large' && weapon.proficiency !== 'unarmed';
  const singleWeaponBonus = oneHanded && feats.has('single-weapon-fighting') ? (level >= 6 ? 6 : 3) : 0;
  const attackOptions = {
    baseAttack: Object.values(classes).reduce((sum, levels) => sum + levels, 0),
    weapon, feats, singleWeaponBonus,
    precision: classes.fighter >= 10 ? 2 : classes.fighter >= 5 ? 1 : 0,
  };
  const baseAttack = attackParts(buildMod, attackOptions);
  const equippedAttack = attackParts(equippedMod, attackOptions);
  if (enhancement) equippedAttack.push([enhancement, 'weapon enhancement']);
  if (capstone) equippedAttack.push([capstone, 'capstone attack bonus']);
  const attack = compare('Attack bonus', baseAttack, equippedAttack, {
    note: `Main-hand ${weapon.name}${singleWeaponBonus ? ' with an empty off hand' : ''}.`,
  });
  const baseAttacksPerRound = [[2, 'base attacks']];
  const attacksPerRound = compare('Attacks per round', baseAttacksPerRound, baseAttacksPerRound, {
    note: [
      level < 6 ? 'The in-game sheet shows the second base attack starting at level 6.' : '',
      'Haste adds one attack per round while active.',
    ].filter(Boolean).join(' '),
  });

  const greatWeapon = weapon.kind === 'melee' && weapon.size === 'Large' && feats.has('great-weapon-fighting');
  const multiplier = greatWeapon ? 2 : 1;
  const mastery = weapon.proficiency === 'simple' && feats.has('simple-weapon-mastery');
  const masteryDice = mastery && weapon.size === 'Large' ? '1d4' : '';
  const baseDamage = damageParts(buildMod, classes, 0, multiplier);
  const equippedDamage = damageParts(equippedMod, classes, enhancement, multiplier);
  if (mastery && !masteryDice) {
    baseDamage.push([1, 'Simple Weapon Mastery']);
    equippedDamage.push([1, 'Simple Weapon Mastery']);
  }
  const damageDetail = parts => `${weapon.damage} ${weapon.damageType.toLowerCase()} (${weapon.name}) + ${partsDetail(parts)}${masteryDice ? ` + ${masteryDice} Simple Weapon Mastery` : ''}`;
  const effects = attackGearEffects(stats, multiplier);
  const percentBonuses = [
    [stats.get('damage_attacks:')?.value, 'attack damage'],
    [stats.get('damage_all:')?.value, 'all damage'],
  ].filter(([amount]) => amount).map(([amount, label]) => `${signed(amount)}% ${label}`);
  const notes = [];
  if (greatWeapon) notes.push('Great-Weapon Fighting doubles the flat weapon bonuses shown here.');
  if (singleWeaponBonus) notes.push('Single Weapon Fighting adds damage based on how far the attack roll exceeds the target’s AC.');
  if (percentBonuses.length) notes.push(`Gear applies ${percentBonuses.join(' and ')} to the normal hit range.`);
  if (effects.length) notes.push(`Additional effects on applicable hits include ${effects.join(', ')}.`);
  return [attack, attacksPerRound, ...criticalHits(weapon, stats), {
    label: 'Attack damage',
    base: damageRoll(weapon, baseDamage, masteryDice),
    equipped: damageRoll(weapon, equippedDamage, masteryDice),
    baseDetail: damageDetail(baseDamage),
    equippedDetail: damageDetail(equippedDamage),
    note: notes.join(' '),
  }];
}
