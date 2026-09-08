/**
 * CASEWEB - Common UI Helpers, Formatting & Modal Functions
 */

import { DATA, findEvidenceById } from './data.js';

export function closeModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.remove('show');
}

export function openModal(id) {
  const el = document.getElementById(id);
  if (el) el.classList.add('show');
}

export function escapeHtml(s) {
  const d = document.createElement('div');
  d.textContent = s == null ? '' : String(s);
  return d.innerHTML;
}

export function fmtDate(iso) {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime())
    ? iso
    : d.toLocaleString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
}

export function initials(name) {
  return (name || 'Officer')
    .split(' ')
    .filter(w => w[0] !== '"' && w[0] !== '(')
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

export function showToast(msg) {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}

export function scoreLabel(score) {
  if (score >= 70) return { cls: 'high', label: 'High Priority' };
  if (score >= 38) return { cls: 'mid', label: 'Person of Interest' };
  return { cls: 'low', label: 'Low Correlation' };
}

export function scoreColor(score) {
  if (score >= 70) return 'linear-gradient(90deg,#e0555f,#c8404a)';
  if (score >= 38) return 'linear-gradient(90deg,#e0a94a,#c9791f)';
  return 'linear-gradient(90deg,#9aa4bd,#8b93a8)';
}

export function statusColor(status) {
  return (
    {
      open: '#3a5fe0',
      critical: '#c8404a',
      cold: '#8b93a8',
      closed: '#2f9e63',
      resolved: '#2f9e63'
    }[status] || '#8b93a8'
  );
}

export function activityIcon(kind) {
  const icons = {
    case: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="#3a5fe0" stroke-width="2"/></svg>',
    evidence: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><rect x="5" y="6" width="14" height="16" rx="2" stroke="#c9791f" stroke-width="2"/></svg>',
    suspect: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="3.4" stroke="#6a4fc4" stroke-width="2"/></svg>',
    ai: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="8" stroke="#2f9e63" stroke-width="2"/><path d="M12 8v4l3 2" stroke="#2f9e63" stroke-width="2"/></svg>',
    alert: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M12 3l10 18H2L12 3z" stroke="#c8404a" stroke-width="2"/></svg>',
    status: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><path d="M4 12l5 5L20 6" stroke="#6b7488" stroke-width="2"/></svg>',
    user: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="8" r="4" stroke="#3a5fe0" stroke-width="2"/><path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" stroke="#3a5fe0" stroke-width="2"/></svg>'
  };
  return icons[kind] || icons.status;
}

export function openEvidencePreview(ev) {
  if (!ev) return;
  const modal = document.getElementById('evidencePreviewModal');
  const titleEl = document.getElementById('previewModalTitle');
  const bodyEl = document.getElementById('previewModalBody');
  if (!modal) return;

  if (titleEl) titleEl.textContent = ev.name || ev.fileName || (ev.type ? `${ev.type.toUpperCase()} Evidence Record` : 'Evidence Details');
  if (bodyEl) {
    if (ev.previewUrl || ev.dataUrl) {
      bodyEl.innerHTML = `
        <div style="text-align:center;">
          <img src="${ev.previewUrl || ev.dataUrl}" alt="Evidence" style="max-width:100%;max-height:65vh;border-radius:8px;border:1px solid var(--line);display:block;margin:0 auto;" />
          <div style="margin-top:12px;font-size:13.5px;font-weight:600;">${escapeHtml(ev.name || ev.fileName || ev.text || 'Evidence File')}</div>
          <div style="margin-top:4px;font-size:12px;color:var(--ink-muted);">${escapeHtml(ev.description || ev.text || '')}</div>
          <div style="margin-top:8px;font-size:11px;color:var(--ink-faint);">Logged: ${fmtDate(ev.uploadDate || ev.loggedAt)} ${ev.caseNum ? `· Related Case: ${ev.caseNum}` : ''}</div>
        </div>
      `;
    } else {
      bodyEl.innerHTML = `
        <div style="background:var(--surface-secondary);padding:16px;border-radius:10px;border:1px solid var(--line);">
          <div style="font-size:14px;font-weight:600;color:var(--ink);">${escapeHtml(ev.text || ev.name || 'Evidence Record')}</div>
          <div style="margin-top:10px;font-size:12px;color:var(--ink-muted);line-height:1.6;">
            <div><strong>Type:</strong> <span class="etype ${ev.type || 'forensic'}" style="margin-left:4px;">${escapeHtml(ev.type || 'forensic')}</span></div>
            ${ev.location ? `<div style="margin-top:4px;"><strong>Location:</strong> ${escapeHtml(ev.location)}</div>` : ''}
            ${ev.time ? `<div style="margin-top:4px;"><strong>Time / Date:</strong> ${escapeHtml(ev.time)}</div>` : ''}
            ${ev.caseTitle ? `<div style="margin-top:4px;"><strong>Associated Case:</strong> ${escapeHtml(ev.caseTitle)} (${escapeHtml(ev.caseNum || '')})</div>` : ''}
            ${ev.tags && ev.tags.length ? `<div style="margin-top:8px;"><strong>Tags:</strong> ${ev.tags.map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join(' ')}</div>` : ''}
            <div style="margin-top:8px;font-size:11px;color:var(--ink-faint);">Recorded: ${fmtDate(ev.loggedAt || ev.uploadDate)}</div>
          </div>
        </div>
      `;
    }
  }
  const actionsEl = document.getElementById('previewModalActions');
  if (actionsEl) {
    actionsEl.innerHTML = `
      <div style="display:flex;justify-content:space-between;align-items:center;width:100%;">
        <button type="button" class="btn-delete-evidence" onclick="window.closeModal('evidencePreviewModal'); window.confirmDeleteEvidence('${ev.id}')" style="background:var(--red-soft);color:var(--red);border:1px solid var(--red);padding:6px 12px;font-size:12px;font-weight:600;border-radius:6px;cursor:pointer;display:inline-flex;align-items:center;gap:5px;" title="Delete this evidence">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
          </svg>
          Delete Evidence
        </button>
        <button type="button" class="btn primary" onclick="closeModal('evidencePreviewModal')">Close</button>
      </div>
    `;
  }
  openModal('evidencePreviewModal');
}

export function previewAnyEvidence(evidenceId) {
  const ev = findEvidenceById(evidenceId);
  if (ev) {
    openEvidencePreview(ev);
  } else {
    showToast('Evidence details not found.');
  }
}
window.previewAnyEvidence = previewAnyEvidence;
window.openEvidencePreview = openEvidencePreview;

export function evCardHtml(ev, showCase) {
  const hasPreview = Boolean(ev.previewUrl || ev.dataUrl);
  const isCitizen = ev.source === 'citizen' || Boolean(ev.applicationId) || (ev.caseTitle && ev.caseTitle.startsWith('[Citizen]'));
  const displayCase = showCase || ev.caseTitle || (ev.caseNum ? `Case ${ev.caseNum}` : '');

  return `<div class="ev-card raised-sm" style="display:flex;flex-direction:column;justify-content:space-between;">
    <div>
      <div style="display:flex;justify-content:space-between;align-items:center;gap:6px;flex-wrap:wrap;">
        <div style="display:flex;align-items:center;gap:5px;">
          <span class="etype ${ev.type || 'forensic'}">${escapeHtml(ev.type || 'evidence')}</span>
          ${isCitizen ? `<span class="badge open" style="font-size:9.5px;padding:2px 6px;letter-spacing:0.02em;">Citizen Filing</span>` : ''}
        </div>
        ${displayCase ? `<span class="case-tag-badge" style="max-width:180px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(displayCase)}">${escapeHtml(displayCase)}</span>` : ''}
      </div>
      <div class="etext" style="font-weight:600;margin-top:6px;line-height:1.4;">${escapeHtml(ev.text || ev.name || ev.fileName || 'Evidence Item')}</div>
      ${hasPreview ? `
        <div style="margin-top:8px;border-radius:6px;overflow:hidden;border:1px solid var(--line);background:#000;cursor:pointer;" onclick="window.previewAnyEvidence('${ev.id}')">
          <img src="${ev.previewUrl || ev.dataUrl}" alt="Evidence" style="width:100%;max-height:130px;object-fit:cover;display:block;" />
        </div>
      ` : ''}
      <div class="emeta" style="margin-top:8px;">
        <span class="mono" style="font-size:11px;">📍 ${escapeHtml(ev.location || 'Reported Location')}</span>
        <span class="mono" style="font-size:11px;">📅 ${escapeHtml(ev.time || '—')}</span>
      </div>
      <div class="ev-tags" style="margin-top:6px;">${(ev.tags || []).map(t => `<span class="tag-chip">${escapeHtml(t)}</span>`).join('')}</div>
    </div>
    <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;border-top:1px solid var(--line);padding-top:6px;">
      <span style="font-size:10px;color:var(--ink-faint);">Logged ${fmtDate(ev.loggedAt || ev.uploadDate)}</span>
      <button class="btn ghost-sm" onclick="window.previewAnyEvidence('${ev.id}')" style="padding:3px 9px;font-size:11px;font-weight:600;">Inspect View</button>
    </div>
  </div>`;
}

export function populateCaseSelect(selectId, preselect) {
  const sel = document.getElementById(selectId);
  if (!sel || !DATA) return;
  const cases = DATA.cases || [];
  const apps = DATA.applications || [];

  const policeOptions = cases.map(
    c => `<option value="${c.id}" ${c.id === preselect ? 'selected' : ''}>${escapeHtml(c.num)}: ${escapeHtml(c.title)}</option>`
  ).join('');

  const citizenOptions = apps.map(
    a => `<option value="${a.id}" ${a.id === preselect ? 'selected' : ''}>[Citizen] ${escapeHtml(a.num || a.id)}: ${escapeHtml(a.title)} (${escapeHtml(a.citizenName || 'Citizen')})</option>`
  ).join('');

  let html = '';
  if (cases.length) {
    html += `<optgroup label="Police FIR Cases (${cases.length})">${policeOptions}</optgroup>`;
  }
  if (apps.length) {
    html += `<optgroup label="Citizen Registered Cases (${apps.length})">${citizenOptions}</optgroup>`;
  }
  if (!html) {
    html = '<option value="">No cases registered</option>';
  }

  sel.innerHTML = html;
}

