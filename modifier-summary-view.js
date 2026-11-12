import { ABILITIES } from './engine.js';

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
const signed = value => `${value >= 0 ? '+' : ''}${value}`;
const armorFamilies = [
  ['armor', 'Armor enchantment'],
  ['natural', 'Natural'],
  ['deflection', 'Deflection'],
  ['dodge', 'Dodge'],
];

function renderAbilityScores(abilities, attributes) {
  const cells = abilities ? abilities.map(ability => {
    const gearBonus = ability.score - ability.base;
    const sources = `${ability.name}, ${ability.base} base${gearBonus ? ` · ${signed(gearBonus)} from gear` : ''}`;
    return `<div class="attribute" title="${escape(sources)}">
      <span>${escape(ability.id)}</span>
      <strong>${escape(ability.score)}</strong>
      <small class="modifier-ability-mod muted">${escape(signed(ability.modifier))} mod</small>
    </div>`;
  }) : ABILITIES.map(name => `<div class="attribute">
    <span title="${escape(name)}">${escape(name.slice(0, 3).toUpperCase())}</span>
    <strong>${escape(signed(attributes[name] ?? 0))}</strong>
  </div>`);
  return `<section class="summary-block">
    <h3 class="summary-label">${abilities ? 'Ability scores' : 'Ability bonuses'}</h3>
    <div class="attribute-grid">${cells.join('')}</div>
  </section>`;
}

function renderStat({ key, label, value, sources, negative }) {
  const line = `<span class="stat-line">
    <span>${escape(label)}</span>
    <strong${negative ? ' class="negative"' : ''}>${escape(value ?? '—')}</strong>
  </span>`;
  if (!sources.length) return line;
  return `<details class="stat-detail modifier-stat" data-summary-key="${escape(key)}">
    <summary>${line}</summary>
    <div class="stat-source">${sources.map(escape).join('<br>')}</div>
  </details>`;
}

function renderGroup(label, content, extraClass = '') {
  return `<details class="summary-block modifier-group${extraClass ? ` ${extraClass}` : ''}" data-summary-key="${escape(`group:${label}`)}">
    <summary class="summary-label">${escape(label)}</summary>
    <div class="modifier-group-body">${content}</div>
  </details>`;
}

function renderCharacterTotals(sheet) {
  const groups = sheet.groups.filter(group => group.rows.length).map(group => {
    const rows = group.rows.map(row => renderStat({
      key: `total:${group.label}:${row.label}`,
      label: row.label,
      value: row.equipped,
      sources: [row.equippedDetail, row.note].filter(Boolean),
      negative: parseFloat(row.equipped) < 0,
    })).join('');
    return group.label === 'Combat'
      ? `<section class="summary-block"><h3 class="summary-label">Combat</h3>${rows}</section>`
      : renderGroup(group.label, rows);
  });
  if (sheet.unlocks.length) {
    const feats = `<ul class="modifier-feats">${sheet.unlocks.map(feat => `<li>${escape(feat)}</li>`).join('')}</ul>`;
    groups.push(renderGroup('Feats', feats));
  }
  return groups.join('');
}

function renderGearDefense(gear) {
  return `<div class="stat-line"><span>Equipment AC bonus</span><strong>${escape(signed(gear.ac.total))}</strong></div>
    <div class="stat-source">Highest of each AC family</div>
    ${armorFamilies.map(([key, label]) => `<div class="stat-line">
      <span class="muted">${label}</span><span>${escape(signed(gear.ac[key]))}</span>
    </div>`).join('')}
    <div class="stat-line"><span>Capstone attack bonus</span>
      <strong>${escape(signed(gear.capstone))}<span class="muted small"> / +5</span></strong>
    </div>`;
}

function renderGearStats(stats) {
  const effects = stats.filter(stat => !/^(?:ac:|attribute:|ability:|capstone$)/.test(stat.key));
  if (!effects.length) return '<div class="summary-empty">No effects selected.</div>';
  return effects.map(stat => {
    const sources = stat.sources.map(source => typeof source === 'string'
      ? source
      : [source.itemLabel, source.label].filter(Boolean).join(' · '));
    if (stat.capped) sources.push(`Raw net ${signed(stat.rawValue)} · equipment cap +5`);
    return renderStat({
      key: `gear:${stat.key}`,
      label: stat.label,
      value: stat.display ?? signed(stat.value ?? 0),
      sources,
      negative: stat.value < 0,
    });
  }).join('');
}

function renderGearIssues(issues) {
  if (!issues.length) return '';
  return `<section class="summary-block modifier-summary-wide">
    <h3 class="summary-label">Needs attention · ${issues.length}</h3>
    ${issues.slice(0, 7).map(issue => `<p class="warning-text">
      <button type="button" class="text-link" data-action="slot" data-id="${escape(issue.itemId)}">${escape(issue.label)}</button><br>
      ${escape(issue.message)}
    </p>`).join('')}
    ${issues.length > 7 ? '<p class="small muted">Open individual items for all details.</p>' : ''}
  </section>`;
}

export function renderModifierSummary({ gear, sheet, abilities, levels = [], level, completed, itemCount }) {
  const gearDefense = renderGearDefense(gear);
  const gearStats = renderGearStats(gear.stats);
  const levelControl = levels.length ? `<select class="modifier-level" data-summary-level aria-label="Modifier level">
    ${levels.map(entry => {
      const selected = entry.level === level;
      const context = selected && sheet?.classSummary ? sheet.classSummary : entry.className;
      return `<option value="${escape(entry.level)}"${selected ? ' selected' : ''}>Level ${escape(entry.level)}${context ? ` · ${escape(context)}` : ''}</option>`;
    }).join('')}
  </select>` : '<button type="button" class="text-link modifier-setup" data-view="progression">Set up progression</button>';
  const contents = sheet?.ready
    ? `${renderCharacterTotals(sheet)}${renderGroup('Gear effects', `${gearDefense}<h3 class="summary-label modifier-effects-label">Other effects</h3>${gearStats}`, 'modifier-summary-wide')}`
    : `<section class="summary-block"><h3 class="summary-label">Defense &amp; attack</h3>${gearDefense}</section>
      <section class="summary-block summary-more modifier-summary-wide"><h3 class="summary-label">Other effects</h3>${gearStats}</section>`;
  return `<aside class="panel summary" aria-label="Modifiers">
    <div class="panel-head">
      <div class="summary-title">
        <h2>Modifiers</h2>
        <span class="chip ${gear.issues.length ? 'red' : 'green'}">${escape(completed)}/${escape(itemCount)} filled</span>
      </div>
      ${levelControl}
    </div>
    ${renderAbilityScores(abilities, gear.attributes)}
    ${contents}
    ${renderGearIssues(gear.issues)}
  </aside>`;
}
