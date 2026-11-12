export const signed = value => value < 0 ? `−${Math.abs(value)}` : `+${value}`;

export function partsValue(parts) {
  return parts.reduce((total, [value]) => total + value, 0);
}

export function partsDetail(parts) {
  return parts.map(([value, label], index) =>
    `${value < 0 ? '− ' : index ? '+ ' : ''}${Math.abs(value)} ${label}`).join(' ');
}

export function compare(label, baseParts, equippedParts, { suffix = '', percent = 0, note = '' } = {}) {
  const base = partsValue(baseParts);
  const beforePercent = partsValue(equippedParts);
  const equipped = Number((beforePercent * (1 + percent / 100)).toFixed(2));
  const percentDetail = percent
    ? `. ${signed(percent)}% capacity from gear${Number.isInteger(equipped) ? '' : ', before in-game rounding'}`
    : '';
  return {
    label, base: `${base}${suffix}`, equipped: `${equipped}${suffix}`,
    baseDetail: partsDetail(baseParts),
    equippedDetail: partsDetail(equippedParts) + percentDetail,
    note,
  };
}

export function highest(modifiers, abilities) {
  const ability = abilities.reduce((best, key) => modifiers[key] > modifiers[best] ? key : best);
  return [modifiers[ability], ability];
}

export function gearStatParts(stats, key) {
  const stat = stats.get(key);
  if (!stat || (!stat.value && !stat.capped)) return [];
  const sources = [...new Set(stat.sources.map(source => source.itemLabel))].join(', ');
  const cap = stat.capped ? `, capped from ${signed(stat.rawValue)}` : '';
  return [[stat.value, `gear${sources ? ` from ${sources}` : ''}${cap}`]];
}
