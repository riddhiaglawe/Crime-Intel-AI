/**
 * CASEWEB - Suspects Database & Suspect Profile Views
 */

import { DATA, allSuspects, getCase, uid, splitTags, logActivity, persist } from './data.js';
import { escapeHtml, fmtDate, initials, scoreLabel, scoreColor, showToast, closeModal } from './ui.js';

export let expandedSuspectId = null;
export let suFilterCase = 'all';

export function setExpandedSuspectId(id) {
  expandedSuspectId = id;
}

export function toggleExpandedSuspect(id) {
  expandedSuspectId = expandedSuspectId === id ? null : id;
}

export function setSuFilterCase(caseId) {
  suFilterCase = caseId;
}

export function suspectCardHtml(s, caseId) {
  const score = s.score;
  const expanded = expandedSuspectId === s.id;
  const { cls, label } = scoreLabel(score || 0);
  const matchLines = (s.matches || [])
    .map(m => {
      const c = getCase(caseId);
      const ev = c ? c.evidence.find(e => e.id === m.evidenceId) : null;
      return ev
        ? `• ${escapeHtml(ev.text)} <span class="mono" style="color:var(--ink-faint)">[${m.shared.join(', ')}]</span>`
        : '';
    })
    .filter(Boolean)
    .join('<br>');
  const crossHtml =
    s.crossCase && s.crossCase.length
      ? `<div class="cross-flag">⚠ Cross-case pattern in ${[...new Set(s.crossCase.map(x => x.caseTitle))].join(', ')}</div>`
      : '';

  return `<div class="suspect-card raised-sm">
    <div class="s-top" data-toggle="${s.id}">
      <div>
        <div class="s-name"><a href="#suspect/${s.id}" onclick="event.stopPropagation()">${escapeHtml(s.name)}</a></div>
        <div class="s-alias">${escapeHtml(s.alias || '')}</div>
      </div>
      ${score != null ? `<span class="s-status ${cls}">${label}</span>` : ''}
    </div>
    ${
      score != null
        ? `<div class="gauge-wrap"><div class="gauge pressed" style="box-shadow:inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light);"><div class="gauge-fill" style="width:${score}%;background:${scoreColor(score)};"></div></div><div class="gauge-pct mono">${score}%</div></div>`
        : `<div style="font-size:11px;color:var(--ink-faint);margin-top:10px;">Not yet analyzed</div>`
    }
    ${crossHtml}
    ${
      expanded
        ? `<div class="s-detail">Known tags: ${s.tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join(' ')}${matchLines ? `<div class="why">AI reasoning:<br>${matchLines}</div>` : ''}</div>`
        : ''
    }
  </div>`;
}

export function viewSuspectsGlobal() {
  const allSus = allSuspects();
  let sus = allSus;

  if (suFilterCase !== 'all') {
    sus = sus.filter(s =>
      s.homeCaseId === suFilterCase ||
      s.homeCaseNum === suFilterCase ||
      s.applicationId === suFilterCase ||
      s.applicationNum === suFilterCase
    );
  }

  sus.sort((a, b) => (b.score || 0) - (a.score || 0));

  const policeCases = DATA?.cases || [];
  const citizenApps = DATA?.applications || [];

  return `
    <div class="crumb">Police Intelligence / Suspects Database</div>
    <div class="page-title">
      <div>
        <h2>Suspects Database</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);">Central cross-case intelligence on identified persons of interest & reported subjects</div>
      </div>
      <div class="actions">
        <button class="btn primary" id="addSuBtnGlobal">+ Add Suspect</button>
      </div>
    </div>

    <!-- Case Filter Dropdown -->
    <div class="filters-row" style="margin-bottom:14px;display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <select id="suCaseFilter" class="raised-sm" style="box-shadow:none;min-width:280px;padding:8px 12px;border-radius:8px;font-size:12.5px;">
        <option value="all" ${suFilterCase === 'all' ? 'selected' : ''}>All Cases & Citizen Complaints (${allSus.length})</option>
        ${policeCases.length ? `
          <optgroup label="Police FIR Cases (${policeCases.length})">
            ${policeCases.map(c => `<option value="${c.id}" ${suFilterCase === c.id ? 'selected' : ''}>${escapeHtml(c.num)}: ${escapeHtml(c.title)}</option>`).join('')}
          </optgroup>
        ` : ''}
        ${citizenApps.length ? `
          <optgroup label="Citizen Registered Cases (${citizenApps.length})">
            ${citizenApps.map(a => `<option value="${a.id}" ${suFilterCase === a.id ? 'selected' : ''}>[Citizen] ${escapeHtml(a.num || a.id)}: ${escapeHtml(a.title)} (${escapeHtml(a.citizenName || 'Citizen')})</option>`).join('')}
          </optgroup>
        ` : ''}
      </select>
    </div>

    <table class="data-table raised" style="padding:6px;width:100%;">
      <thead>
        <tr>
          <th>Name / Alias</th>
          <th>Associated Case</th>
          <th>Correlation Score</th>
          <th>Status</th>
          <th>Cross-Case Linkages</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        ${
          sus.length
            ? sus
                .map(
                  s => {
                    const isCitizen = s.source === 'citizen' || (s.homeCaseTitle && s.homeCaseTitle.startsWith('[Citizen]'));
                    return `
              <tr data-suspect="${s.id}" style="cursor:pointer;">
                <td>
                  <div style="display:flex;align-items:center;gap:6px;">
                    <strong>${escapeHtml(s.name)}</strong>
                    ${isCitizen ? `<span class="badge open" style="font-size:9.5px;padding:1px 5px;">Citizen Report</span>` : ''}
                  </div>
                  <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">${escapeHtml(s.alias || '')}</div>
                </td>
                <td>
                  <span class="case-tag-badge" style="max-width:240px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;display:inline-block;" title="${escapeHtml(s.homeCaseTitle || '')}">
                    ${escapeHtml(s.homeCaseTitle || 'Associated Incident')}
                  </span>
                </td>
                <td>
                  ${s.score != null ? `<span class="mono" style="font-weight:600;color:var(--ink);">${s.score}%</span>` : '<span style="color:var(--ink-faint);">—</span>'}
                </td>
                <td>
                  ${s.score != null ? `<span class="s-status ${scoreLabel(s.score).cls}">${scoreLabel(s.score).label}</span>` : '<span class="tag-chip" style="font-size:10.5px;">Pending Analysis</span>'}
                </td>
                <td>
                  ${s.crossCase && s.crossCase.length ? `<span class="cross-flag">⚠ ${[...new Set(s.crossCase.map(x => x.caseTitle))].length} case(s)</span>` : '<span style="color:var(--ink-faint);font-size:12px;">—</span>'}
                </td>
                <td>
                  <button class="btn ghost-sm" onclick="event.stopPropagation(); window.location.hash = 'suspect/${s.id}';" style="padding:3px 9px;font-size:11px;font-weight:600;">View Profile</button>
                </td>
              </tr>
            `;
                  }
                )
                .join('')
            : `<tr><td colspan="6"><div class="empty-state" style="padding:36px 16px;"><h3>No Suspects Found</h3><p>No suspect records match the selected case filter.</p></div></td></tr>`
        }
      </tbody>
    </table>
  `;
}

export function viewSuspectProfile(id) {
  let found = null;
  let homeCase = null;

  // Search in police cases
  (DATA?.cases || []).forEach(c => {
    const s = (c.suspects || []).find(x => x.id === id);
    if (s) {
      found = s;
      homeCase = c;
    }
  });

  // Search in citizen suspects if not found
  if (!found) {
    const cs = (DATA?.citizenSuspects || []).find(x => x.id === id);
    if (cs) {
      const parentApp = (DATA?.applications || []).find(a => a.id === cs.applicationId || a.num === cs.applicationNum);
      const parentCase = (DATA?.cases || []).find(c => c.id === cs.applicationId || c.num === cs.applicationNum);
      found = {
        ...cs,
        name: cs.name || 'Reported Subject',
        alias: cs.alias || (cs.gender ? `${cs.gender} (Age ~${cs.age || '?'})` : 'Subject Details'),
        tags: cs.tags || ['citizen-reported', cs.location ? cs.location.toLowerCase() : 'area'],
        score: cs.score || 50,
        addedAt: cs.createdAt,
        matches: cs.matches || [],
        crossCase: cs.crossCase || []
      };
      homeCase = parentApp ? {
        id: parentApp.id,
        num: parentApp.num || parentApp.id,
        title: `[Citizen] ${parentApp.num || parentApp.id}: ${parentApp.title}`,
        evidence: parentApp.evidence || []
      } : parentCase ? parentCase : {
        id: cs.applicationId || 'general',
        num: cs.applicationNum || 'General',
        title: `Citizen Complaint (${cs.applicationNum || cs.applicationId || 'General'})`,
        evidence: []
      };
    }
  }

  if (!found)
    return `<div class="empty-state">Suspect record not found. <a href="#suspects">Back to suspects database</a></div>`;

  const { cls, label } = scoreLabel(found.score || 0);
  const matchLines = (found.matches || [])
    .map(m => {
      const ev = homeCase && homeCase.evidence ? homeCase.evidence.find(e => e.id === m.evidenceId) : null;
      return ev
        ? `<li>${escapeHtml(ev.text || ev.name || 'Evidence Item')} <span class="mono" style="color:var(--ink-faint)">[${(m.shared || []).join(', ')}]</span></li>`
        : '';
    })
    .filter(Boolean)
    .join('');

  const crossHtml = (found.crossCase || [])
    .map(x => {
      const oc = getCase(x.caseId);
      const ev = oc && oc.evidence ? oc.evidence.find(e => e.id === x.evidenceId) : null;
      return `<li><a href="#case/${x.caseId}">${escapeHtml(x.caseTitle || oc?.title || 'Related Case')}</a> — ${ev ? escapeHtml(ev.text || ev.name || '') : ''} <span class="mono" style="color:var(--ink-faint)">[${(x.shared || []).join(', ')}]</span></li>`;
    })
    .join('');

  return `
    <div class="crumb"><a href="#suspects">Suspects Database</a> / ${escapeHtml(found.name)}</div>
    <div class="profile-head">
      <div class="profile-avatar">${initials(found.name)}</div>
      <div>
        <h2 class="display" style="margin:0 0 4px;">${escapeHtml(found.name)}</h2>
        <div style="color:var(--ink-muted);font-size:13px;">${escapeHtml(found.alias || '')}</div>
        <div style="margin-top:8px;">Associated Case: <strong style="color:var(--blue);font-weight:600;">${escapeHtml(homeCase?.title || 'Associated Incident')}</strong></div>
      </div>
    </div>
    <div class="dash-grid">
      <div>
        <div class="panel raised">
          <h3>Correlation Score</h3>
          ${
            found.score != null
              ? `
            <div class="gauge-wrap"><div class="gauge pressed" style="box-shadow:inset 2px 2px 4px var(--shadow-dark), inset -2px -2px 4px var(--shadow-light);"><div class="gauge-fill" style="width:${found.score}%;background:${scoreColor(found.score)};"></div></div><div class="gauge-pct mono">${found.score}%</div></div>
            <span class="s-status ${cls}" style="margin-top:8px;display:inline-block;">${label}</span>
          `
              : '<div class="empty-state">Not yet analyzed. Run AI Correlation from the case page.</div>'
          }
        </div>
        <div class="panel raised">
          <h3>Matched Evidence (Home Case)</h3>
          <ul style="font-size:12.5px;line-height:1.7;padding-left:18px;margin:0;">${matchLines || '<li style="color:var(--ink-faint);">No specific matches attached.</li>'}</ul>
        </div>
        <div class="panel raised">
          <h3>Cross-Case Pattern Matches</h3>
          <ul style="font-size:12.5px;line-height:1.7;padding-left:18px;margin:0;">${crossHtml || '<li style="color:var(--ink-faint);">No cross-case correlations detected.</li>'}</ul>
        </div>
      </div>
      <div>
        <div class="panel raised">
          <h3>Known Tags & Traits</h3>
          <div class="ev-tags">${(found.tags || []).map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>
        </div>
        <div class="panel raised">
          <h3>Record Details</h3>
          <div style="font-size:12px;color:var(--ink-muted);line-height:1.8;">
            Added: ${fmtDate(found.addedAt || found.createdAt)}<br>
            Case Reference: ${escapeHtml(homeCase?.num || 'General Reference')}
          </div>
        </div>
      </div>
    </div>
  `;
}

export async function handleSaveSuspect(onRender) {
  const suCaseEl = document.getElementById('suCase');
  if (!suCaseEl) return;
  const caseId = suCaseEl.value;
  if (!caseId) {
    showToast('Please select a target case.');
    return;
  }

  const nameEl = document.getElementById('suName');
  const aliasEl = document.getElementById('suAlias');
  const tagsEl = document.getElementById('suTags');
  const name = nameEl ? nameEl.value.trim() : '';
  if (!name) {
    showToast('Please enter a suspect name or description.');
    return;
  }

  const policeCase = DATA?.cases?.find(c => c.id === caseId || c.num === caseId);
  const citizenApp = DATA?.applications?.find(a => a.id === caseId || a.num === caseId);
  const nowIso = new Date().toISOString();

  if (policeCase) {
    if (!Array.isArray(policeCase.suspects)) policeCase.suspects = [];
    const s = {
      id: uid('s'),
      name,
      alias: aliasEl ? aliasEl.value.trim() : '',
      tags: splitTags(tagsEl ? tagsEl.value : ''),
      addedAt: nowIso,
      score: null,
      matches: [],
      crossCase: []
    };
    policeCase.suspects.push(s);
    logActivity('suspect', policeCase.id, `Suspect added to "${policeCase.title}": ${name}`);
  } else if (citizenApp) {
    const susItem = {
      id: uid('csus'),
      applicationId: citizenApp.id,
      applicationNum: citizenApp.num || citizenApp.id,
      citizenPhone: citizenApp.citizenPhone || '',
      name,
      alias: aliasEl ? aliasEl.value.trim() : '',
      description: aliasEl ? aliasEl.value.trim() : '',
      tags: ['police-logged', ...splitTags(tagsEl ? tagsEl.value : '')],
      createdAt: nowIso
    };
    if (!Array.isArray(DATA.citizenSuspects)) DATA.citizenSuspects = [];
    DATA.citizenSuspects.unshift(susItem);
    citizenApp.suspectInfo = {
      name,
      description: aliasEl ? aliasEl.value.trim() : ''
    };
    logActivity('suspect', citizenApp.id, `Police logged suspect for Citizen Case ${citizenApp.num || citizenApp.id}: ${name}`);
  } else {
    showToast('Target case could not be located.');
    return;
  }

  ['suName', 'suAlias', 'suTags'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  closeModal('suOverlay');
  await persist();
  if (typeof onRender === 'function') onRender();
  showToast('Suspect added successfully');
}
