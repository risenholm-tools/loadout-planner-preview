const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
const displayValue = value => String(value ?? '—');

function hasGearChange(row) {
  return displayValue(row.base) !== displayValue(row.equipped);
}

function renderRow(groupLabel, row) {
  const changed = hasGearChange(row);
  const changeClass = parseFloat(row.equipped) < parseFloat(row.base) ? 'lower' : 'higher';
  const classes = `character-sheet-row${changed ? ` character-sheet-row-${changeClass}` : ''}`;
  const values = `<span class="character-sheet-label">${escape(row.label)}</span>
    <span class="character-sheet-base"><span class="character-sheet-sr-only">Build </span>${escape(displayValue(row.base))}</span>
    <span class="character-sheet-equipped"><span class="character-sheet-sr-only">With gear </span>${escape(displayValue(row.equipped))}</span>`;

  if (!row.baseDetail && !row.equippedDetail) {
    return `<div class="${classes} character-sheet-values">${values}</div>`;
  }

  const detail = row.baseDetail === row.equippedDetail
    ? `<div>${escape(row.baseDetail)}</div>`
    : `<dl>
        ${row.baseDetail ? `<div><dt>Build</dt><dd>${escape(row.baseDetail)}</dd></div>` : ''}
        ${row.equippedDetail ? `<div><dt>With gear</dt><dd>${escape(row.equippedDetail)}</dd></div>` : ''}
      </dl>`;

  return `<details class="${classes}" data-character-sheet-key="${escape(`row:${groupLabel}:${row.label}`)}">
    <summary class="character-sheet-values">${values}</summary>
    <div class="character-sheet-detail">${detail}${row.note ? `<p>${escape(row.note)}</p>` : ''}</div>
  </details>`;
}

function renderGroup({ label, rows }) {
  const changes = rows.filter(hasGearChange).length;
  return `<details class="character-sheet-group" data-character-sheet-key="${escape(`group:${label}`)}"${label === 'Skills' ? '' : ' open'}>
    <summary class="character-sheet-group-heading">
      <h3>${escape(label)}${changes ? `<span class="character-sheet-change-count">${changes} changed</span>` : ''}</h3>
    </summary>
    <div class="character-sheet-columns" aria-hidden="true">
      <span></span><span>Build</span><span>With gear</span>
    </div>
    ${rows.map(row => renderRow(label, row)).join('')}
  </details>`;
}

export function renderCharacterSheet(sheet) {
  if (!sheet?.ready) return '';

  return `<section class="panel character-sheet" aria-labelledby="character-sheet-title">
    <div class="panel-head character-sheet-head">
      <h2 id="character-sheet-title">Character sheet</h2>
      <p>Level ${escape(sheet.level)}${sheet.classSummary ? ` · ${escape(sheet.classSummary)}` : ''}</p>
    </div>
    <div class="panel-body character-sheet-body">
      ${sheet.groups.filter(group => group.rows.length).map(renderGroup).join('')}
      ${sheet.unlocks.length ? `<details class="character-sheet-group" data-character-sheet-key="unlocks">
        <summary class="character-sheet-group-heading"><h3>Feats</h3></summary>
        <ul class="character-sheet-features">${sheet.unlocks.map(unlock => `<li>${escape(unlock)}</li>`).join('')}</ul>
      </details>` : ''}
    </div>
  </section>`;
}
