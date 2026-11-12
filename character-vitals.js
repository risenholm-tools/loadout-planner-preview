import { compare, gearStatParts, partsValue, signed } from './character-sheet-values.js';

// Maximum hit die and primary saves from each Risenholm class's Vitals section.
const classVitals = {
  barbarian: [12, ['fortitude']],
  bard: [6, ['reflex', 'will']],
  cleric: [8, ['fortitude', 'will']],
  druid: [8, ['fortitude', 'will']],
  fighter: [10, ['fortitude']],
  monk: [8, ['fortitude', 'reflex', 'will']],
  paladin: [10, ['fortitude']],
  ranger: [10, ['fortitude', 'reflex']],
  rogue: [6, ['reflex']],
  sorcerer: [4, ['will']],
  wizard: [4, ['will']],
};

const savingThrows = [
  { id: 'fortitude', label: 'Fortitude', abilities: ['STR', 'CON'], feat: 'great-fortitude', featName: 'Great Fortitude' },
  { id: 'reflex', label: 'Reflex', abilities: ['DEX', 'INT'], feat: 'lightning-reflexes', featName: 'Lightning Reflexes' },
  { id: 'will', label: 'Will', abilities: ['WIS', 'CHA'], feat: 'iron-will', featName: 'Iron Will' },
];

export function evaluateCharacterVitals({ classCatalog, classes, raceId, feats, survivalRanks, buildMod, equippedMod, stats }) {
  const classLevels = classCatalog.filter(entry => classes[entry.id]).map(({ id, name }) => {
    const [hitDie, primarySaves] = classVitals[id];
    return { name, hitDie, primarySaves, count: classes[id] };
  });
  const trainedLevels = classLevels.reduce((total, entry) => total + entry.count, 0);
  const classHp = classLevels.map(entry => [entry.hitDie * entry.count, `${entry.name} hit dice`]);
  const rolledHp = partsValue(classHp);
  const hpPerBonusDie = rolledHp / trainedLevels;
  const survivalDice = Math.floor(survivalRanks / 4);
  const dwarfDice = raceId === 'dwarf' ? Math.floor(trainedLevels / 2) : 0;
  const gearDice = stats.get('hp')?.value ?? 0;

  const hpParts = modifiers => [
    ...classHp,
    [modifiers.CON * trainedLevels, 'CON across class levels'],
    ...(feats.has('toughness') ? [[rolledHp, 'Toughness']] : []),
    ...(survivalDice ? [[Math.round(survivalDice * hpPerBonusDie), `Survival (${survivalDice} HD from invested ranks)`]] : []),
    ...(dwarfDice ? [[Math.round(dwarfDice * hpPerBonusDie), `Dwarf Hardiness (${dwarfDice} HD)`]] : []),
  ];
  const equippedHp = hpParts(equippedMod);
  if (gearDice) equippedHp.push([Math.round(gearDice * hpPerBonusDie), `gear HP (${signed(gearDice)} HD)`]);
  const minimumHp = 1 - partsValue(equippedHp);
  if (minimumHp > 0) equippedHp.push([minimumHp, 'minimum HP adjustment']);
  const hasBonusDice = survivalDice || dwarfDice;
  const hp = compare('Max HP', hpParts(buildMod), equippedHp, {
    note: hasBonusDice || gearDice ? 'Bonus hit dice use your average class die for this estimate.' : '',
  });
  if (hasBonusDice) hp.base = `≈${hp.base}`;
  if (hasBonusDice || gearDice) hp.equipped = `≈${hp.equipped}`;

  const grace = Math.floor((classes.paladin ?? 0) / 2);
  const saves = savingThrows.map(save => {
    const classBonuses = classLevels.map(entry => {
      const bonus = entry.primarySaves.includes(save.id) ? 2 + Math.floor(entry.count / 2) : Math.floor(entry.count / 3);
      return [bonus, `${entry.name} base save`];
    }).filter(([bonus]) => bonus);
    const saveParts = modifiers => [
      ...classBonuses,
      ...save.abilities.map(ability => [modifiers[ability], ability]),
      ...(feats.has(save.feat) ? [[5, save.featName]] : []),
      ...(grace ? [[grace, 'Divine Grace']] : []),
    ];
    return compare(save.label, saveParts(buildMod), [...saveParts(equippedMod), ...gearStatParts(stats, `save:${save.id}`)], {
      note: 'Class base saves follow Neverwinter Nights progression.',
    });
  });
  return { hp, saves };
}
