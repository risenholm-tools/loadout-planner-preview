import { renderCharacterSheet } from './character-sheet-view.js';
import { ARCHETYPE_UNLOCK_LEVEL, CREATION_POINTS, INTRO_POINTS, skillPointBudget } from './progression.js';

const abilityNames = {
  STR: 'Strength',
  DEX: 'Dexterity',
  CON: 'Constitution',
  INT: 'Intelligence',
  WIS: 'Wisdom',
  CHA: 'Charisma',
};

const entities = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
const escape = value => String(value ?? '').replace(/[&<>"']/g, character => entities[character]);
const signed = value => value >= 0 ? `+${value}` : String(value);

function option(value, label, selection, reason) {
  const selected = value === selection;
  const disabled = reason && !selected ? ' disabled' : '';
  const text = reason ? `${label} (${reason})` : label;
  return `<option value="${escape(value)}"${selected ? ' selected' : ''}${disabled}>${escape(text)}</option>`;
}

function issues(messages) {
  return `<div class="issues progression-issues" role="status"${messages.length ? '' : ' hidden'}>${messages.map(message => `<p>${escape(message)}</p>`).join('')}</div>`;
}

function allocationMax(value, cap, remaining) {
  return Math.max(value, Math.min(cap, value + Math.max(0, remaining)));
}

function skillPointsToFree(row, budget) {
  const capacity = budget ?? 0;
  return capacity < row.skillBudget ? Math.max(0, row.skillSpent - capacity) : 0;
}

function attributes(plan, evaluation, catalog) {
  const { abilities, creationSpent, introSpent, attributeErrors, levels } = evaluation;
  const creationRemaining = CREATION_POINTS - creationSpent;
  const introRemaining = INTRO_POINTS - introSpent;
  const raceBonus = catalog.races.find(race => race.id === plan.raceId)?.bonusSkillPoints ?? 0;
  const raceOption = (id, name, bonusSkillPoints = 0) => {
    const conflict = levels.find(row => row.skillBudget !== null &&
      skillPointsToFree(row, row.skillBudget - raceBonus + bonusSkillPoints));
    return option(id, name, plan.raceId, conflict ? `Free skill points at level ${conflict.level} first` : '');
  };
  return `<section class="panel progression-attributes" aria-labelledby="progression-attributes-title">
    <div class="panel-head">
      <h2 id="progression-attributes-title">Attributes</h2>
      <label class="progression-race">Race
        <select data-progression-field="race">
          ${raceOption('', 'Choose a race')}
          ${catalog.races.map(race => raceOption(race.id, race.name, race.bonusSkillPoints)).join('')}
        </select>
      </label>
    </div>
    <div class="panel-body">
      <div class="progression-budgets" aria-label="Attribute points spent">
        <div><span>Creation points</span><strong class="${creationRemaining < 0 ? 'progression-negative' : ''}">${creationSpent} / ${CREATION_POINTS}</strong></div>
        <div><span>Intro points</span><strong class="${introRemaining < 0 ? 'progression-negative' : ''}">${introSpent} / ${INTRO_POINTS}</strong></div>
      </div>
      ${issues(attributeErrors)}
      <table class="progression-table progression-ability-table" aria-label="Attribute allocations">
        <thead><tr>
          <th scope="col">Stat</th><th scope="col">Creation</th><th scope="col">Intro</th>
          <th scope="col">Base</th><th scope="col">Equipped</th><th scope="col" title="Equipped modifier">Mod.</th>
        </tr></thead>
        <tbody>${abilities.map(stat => `<tr>
          <th scope="row"><abbr title="${abilityNames[stat.id]}">${stat.id}</abbr></th>
          <td><input type="number" inputmode="numeric" min="10" max="${allocationMax(stat.creation, 16, creationRemaining)}" step="1" data-progression-field="creation" data-key="${stat.id}" aria-label="${abilityNames[stat.id]} at creation" value="${stat.creation}"></td>
          <td><input type="number" inputmode="numeric" min="0" max="${allocationMax(stat.intro, INTRO_POINTS, introRemaining)}" step="1" data-progression-field="intro" data-key="${stat.id}" aria-label="${abilityNames[stat.id]} intro points" value="${stat.intro}"></td>
          <td data-progression-output>${stat.base}</td><td class="progression-total" data-progression-output>${stat.equipped}</td><td data-progression-output>${signed(stat.modifier)}</td>
        </tr>`).join('')}</tbody>
      </table>
      <p class="progression-note small muted">Equipped scores and modifiers include your planned gear.</p>
    </div>
  </section>`;
}

function levelButtons(levels, activeLevel) {
  return levels.map(row => {
    const selected = row.level === activeLevel;
    const hasErrors = row.errors.length > 0 || [...row.generalFeats, ...row.bonusFeats].some(feat => feat.error);
    const label = `Level ${row.level}${hasErrors ? ', review choices' : ''}`;
    return `<button type="button" class="progression-level-button${hasErrors ? ' progression-level-error' : ''}" data-progression-level="${row.level}" aria-label="${label}" aria-pressed="${selected}">${row.level}</button>`;
  }).join('');
}

function featField(slot, index, category, catalog) {
  const field = `${category}-feat`;
  const label = category === 'general' ? 'General feat' : 'Class bonus feat';
  const selection = catalog.feats.find(feat => feat.id === slot.value);
  const id = `progression-${field}-${index}`;
  const details = slot.error || selection?.description;
  const missingSelection = selection && !slot.options.some(feat => feat.id === selection.id);
  return `<div class="progression-feat-pick">
    <label for="${id}">${label} ${index + 1}</label>
    <select id="${id}" data-progression-field="${field}" data-key="${index}"${slot.error ? ' aria-invalid="true"' : ''}${details ? ` aria-describedby="${id}-detail"` : ''}>
      ${option('', 'Choose a feat', slot.value)}
      ${missingSelection ? option(selection.id, selection.name, slot.value, slot.error) : ''}
      ${slot.options.map(feat => option(feat.id, feat.name, slot.value, feat.reason)).join('')}
    </select>
    <p id="${id}-detail" class="small progression-feat-detail ${slot.error ? 'progression-negative' : 'muted'}"${details ? '' : ' hidden'}>${escape(details)}</p>
  </div>`;
}

function levelEditor(plan, row, catalog) {
  const activeClass = catalog.classes.find(characterClass => characterClass.id === row.classId);
  const race = catalog.races.find(entry => entry.id === plan.raceId);
  const classOption = (id, name, entry) => {
    const shortfall = skillPointsToFree(row, skillPointBudget(entry, race));
    const reason = shortfall ? `Free ${shortfall} skill ${shortfall === 1 ? 'point' : 'points'} first` : '';
    return option(id, name, row.classId, reason);
  };
  const archetypes = row.classLevel >= ARCHETYPE_UNLOCK_LEVEL ? activeClass.archetypes : [];
  const selectedArchetype = plan.archetypes[row.classId] ?? '';
  const featFields = [
    ...row.generalFeats.map((slot, index) => featField(slot, index, 'general', catalog)),
    ...row.bonusFeats.map((slot, index) => featField(slot, index, 'bonus', catalog)),
  ];
  return `<section class="section" aria-labelledby="progression-selected-level">
    <div class="section-heading progression-selected">
      <h2 id="progression-selected-level">Level ${row.level}</h2>
      ${activeClass ? `<span class="small muted">${escape(activeClass.name)} ${row.classLevel}</span>` : ''}
    </div>
    ${issues(row.errors)}
    <div class="progression-class-fields">
      <label>Class
        <select data-progression-field="class">
          ${classOption('', 'Choose a class')}
          ${catalog.classes.map(characterClass => classOption(characterClass.id, characterClass.name, characterClass)).join('')}
        </select>
      </label>
      ${archetypes.length ? `<label>Archetype
        <select data-progression-field="archetype" data-key="${escape(row.classId)}">
          ${option('', 'Choose an archetype', selectedArchetype)}
          ${archetypes.map(archetype => option(archetype.id, archetype.name, selectedArchetype)).join('')}
        </select>
      </label>` : ''}
    </div>
    ${featFields.length ? `<div class="progression-feat-fields">${featFields.join('')}</div>` : ''}
    <div class="progression-granted"${row.features.length ? '' : ' hidden'}>
      <h3>Granted at this level</h3>
      <ul>${row.features.map(feature => `<li>${escape(feature)}</li>`).join('')}</ul>
    </div>
  </section>`;
}

function skillEditor(row) {
  const available = row.skillBudget != null;
  const balance = row.skillRemaining < 0 ? `${-row.skillRemaining} over` : `${row.skillRemaining} left`;
  const showIncrease = available && row.skills.some(skill => skill.ranks > skill.added);
  const increaseCost = row.skillIncreases?.length ?? 0;
  const needsPoints = increaseCost > 0 && increaseCost > row.skillRemaining;
  return `<section class="section progression-skills" aria-labelledby="progression-skills-title">
    <div class="section-heading">
      <h3 id="progression-skills-title">Skill points</h3>
      ${available ? `<strong class="progression-skill-budget${row.skillRemaining < 0 ? ' progression-negative' : ''}">${row.skillSpent} / ${row.skillBudget} spent · ${balance}</strong>` : ''}
    </div>
    ${showIncrease ? `<div class="progression-skill-actions">
      <button type="button" class="subtle small" data-action="increase-invested-skills"${!increaseCost || needsPoints ? ' disabled' : ''}${needsPoints ? ' aria-describedby="progression-skill-increase-cost"' : ''}>+1 to invested skills</button>
      <span id="progression-skill-increase-cost" class="small muted"${needsPoints ? '' : ' hidden'}>${needsPoints ? `Needs ${increaseCost} skill ${increaseCost === 1 ? 'point' : 'points'}` : ''}</span>
    </div>` : ''}
    ${available ? `<table class="progression-table progression-skill-table" aria-label="Skill ranks at level ${row.level}">
      <thead><tr>
        <th scope="col">Skill</th><th scope="col">Add</th><th scope="col">Ranks</th><th scope="col">Total</th>
      </tr></thead>
      <tbody>${row.skills.map(skill => `<tr>
        <th scope="row">${escape(skill.name)} <span class="progression-skill-ability">${escape(skill.ability)}</span></th>
        <td><input type="number" inputmode="numeric" min="0" max="${allocationMax(skill.added, skill.max, row.skillRemaining)}" step="1" data-progression-field="skill" data-key="${escape(skill.id)}" aria-label="Ranks to add to ${escape(skill.name)} at level ${row.level}" value="${skill.added}"${skill.added > skill.max ? ' aria-invalid="true"' : ''}></td>
        <td data-progression-output>${skill.ranks} <span class="progression-rank-limit">/ ${row.level}</span></td>
        <td class="progression-total" data-progression-output>${skill.effective}</td>
      </tr>`).join('')}</tbody>
    </table>
    <p class="progression-note small muted">Total includes ability modifiers and planned gear. Positive bonuses are capped at invested ranks.</p>`
    : '<p class="small muted progression-skill-empty">Choose a class to allocate skill points.</p>'}
  </section>`;
}

export function renderProgression({ plan, evaluation, catalog, activeLevel, sheet }) {
  const row = evaluation.levels[activeLevel - 1] ?? evaluation.levels[0];
  return `<div class="progression-layout">
    <div class="progression-setup">
      ${renderCharacterSheet(sheet)}
      ${attributes(plan, evaluation, catalog)}
      <details class="progression-rules small muted">
        <summary>Rules and sources</summary>
        <p>General feat timing, the per-attribute limit for intro points, and the exact Wizard and Sorcerer bonus feat lists are provisional.</p>
        <div><a href="https://wiki.risenholm.com/index.php/General_Mechanics_Information" target="_blank" rel="noreferrer">Character creation</a>
          <a href="https://wiki.risenholm.com/index.php/Feats" target="_blank" rel="noreferrer">Feats</a>
          <a href="https://wiki.risenholm.com/index.php/Skills" target="_blank" rel="noreferrer">Skills</a>
          <a href="https://wiki.risenholm.com/index.php/Equipment_and_Itemization" target="_blank" rel="noreferrer">Equipment</a>
          <a href="https://wiki.risenholm.com/index.php/Main_Page#Mechanics" target="_blank" rel="noreferrer">Classes and archetypes</a></div>
      </details>
    </div>
    <section class="panel progression-levels" aria-labelledby="progression-levels-title">
      <div class="panel-body">
        <h2 id="progression-levels-title" class="progression-level-heading">Progression</h2>
        <div class="progression-level-picker">
          <div class="progression-creation-levels" role="group" aria-label="Character creation levels">
            <span class="small muted">Creation</span>
            <div>${levelButtons(evaluation.levels.slice(0, 3), row.level)}</div>
          </div>
          <div class="progression-later-levels" role="group" aria-label="Level-up progression">
            <span class="small muted">Level-up</span>
            <div>${levelButtons(evaluation.levels.slice(3), row.level)}</div>
          </div>
        </div>
      </div>
      ${levelEditor(plan, row, catalog)}
      ${skillEditor(row)}
    </section>
  </div>`;
}

export function refreshProgressionNumbers(root, args) {
  const current = root.querySelector('.progression-layout');
  if (!current) return false;

  const template = root.ownerDocument.createElement('template');
  template.innerHTML = renderProgression(args);
  const next = template.content;
  const updateMatches = (selector, update) => {
    const replacements = next.querySelectorAll(selector);
    current.querySelectorAll(selector).forEach((element, index) => update(element, replacements[index]));
  };
  const syncAttributes = (element, replacement, names) => {
    for (const name of names) {
      const value = replacement.getAttribute(name);
      if (element.getAttribute(name) === value) continue;
      if (value === null) element.removeAttribute(name);
      else element.setAttribute(name, value);
    }
  };

  // Committing a number can coincide with a click or Tab into a different field.
  // Keep controls mounted so that navigation and focus can finish normally.
  updateMatches('input[data-progression-field]', (element, replacement) => {
    syncAttributes(element, replacement, ['max', 'aria-invalid']);
    if (element.value !== replacement.value) element.value = replacement.value;
  });
  updateMatches('select[data-progression-field]', (element, replacement) => {
    syncAttributes(element, replacement, ['aria-invalid', 'aria-describedby']);
    if (element.innerHTML !== replacement.innerHTML) element.innerHTML = replacement.innerHTML;
  });
  updateMatches('.progression-level-button', (element, replacement) => {
    syncAttributes(element, replacement, ['class', 'aria-label']);
  });
  updateMatches('[data-action="increase-invested-skills"]', (element, replacement) => {
    syncAttributes(element, replacement, ['disabled', 'aria-describedby']);
  });
  updateMatches([
    '[data-progression-output]', '.progression-budgets', '.progression-issues',
    '.progression-skill-budget', '.progression-feat-detail', '.progression-granted',
    '#progression-skill-increase-cost',
  ].join(', '), (element, replacement) => {
    syncAttributes(element, replacement, ['class', 'hidden']);
    if (element.innerHTML !== replacement.innerHTML) element.innerHTML = replacement.innerHTML;
  });
  const currentSheet = current.querySelector('.character-sheet');
  const nextSheet = next.querySelector('.character-sheet');
  if (currentSheet && nextSheet) {
    const disclosures = new Map(Array.from(currentSheet.querySelectorAll('[data-character-sheet-key]'), element =>
      [element.dataset.characterSheetKey, element.open]));
    for (const element of nextSheet.querySelectorAll('[data-character-sheet-key]')) {
      const wasOpen = disclosures.get(element.dataset.characterSheetKey);
      if (wasOpen !== undefined) element.open = wasOpen;
    }
    if (currentSheet.innerHTML !== nextSheet.innerHTML) currentSheet.replaceWith(nextSheet);
  }
  return true;
}
