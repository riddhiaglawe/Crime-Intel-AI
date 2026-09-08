/**
 * CASEWEB - Evidence Log & Management
 */

import { DATA, allEvidence, getCase, uid, splitTags, logActivity, persist } from './data.js';
import { escapeHtml, evCardHtml, showToast, closeModal } from './ui.js';

export let evFilterType = 'all';
export let evFilterCase = 'all';

/* ============ POLICE EVIDENCE ATTACHMENTS STATE ============ */
export let policePendingEvidenceFiles = [];

export function resetPolicePendingEvidenceState() {
  policePendingEvidenceFiles = [];
  const fileInput = document.getElementById('evFileInput');
  if (fileInput) fileInput.value = '';
  renderPolicePendingAttachmentsList();
}

export function handlePoliceFileUpload(files) {
  if (!files || !files.length) return;

  const fileArray = Array.from(files);
  const fileInput = document.getElementById('evFileInput');

  fileArray.forEach(file => {
    const isDuplicate = policePendingEvidenceFiles.some(f => 
      f.name === file.name && f.size === file.size
    );
    if (isDuplicate) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const isImg = file.type.startsWith('image/');
      
      if (!policePendingEvidenceFiles.some(f => f.name === file.name && f.dataUrl === dataUrl)) {
        policePendingEvidenceFiles.push({
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: file.type || (isImg ? 'image/jpeg' : 'application/octet-stream'),
          size: file.size,
          dataUrl: dataUrl,
          previewUrl: isImg ? dataUrl : null,
          uploadDate: new Date().toISOString()
        });

        // If description is empty, auto-populate from first file
        const textEl = document.getElementById('evText');
        if (textEl && !textEl.value.trim()) {
          textEl.value = `Photo evidence: ${file.name}`;
        }
        
        // Auto-select Photo if image attached
        const typeEl = document.getElementById('evType');
        if (typeEl && isImg && (typeEl.value === 'forensic' || !typeEl.value)) {
          typeEl.value = 'photo';
        }
        
        renderPolicePendingAttachmentsList();
      }
    };
    reader.readAsDataURL(file);
  });

  if (fileInput) {
    fileInput.value = '';
  }
}

export function removePolicePendingAttachment(fileId) {
  policePendingEvidenceFiles = policePendingEvidenceFiles.filter(f => f.id !== fileId);
  renderPolicePendingAttachmentsList();
}

export function addPolicePendingAttachment(fileObj) {
  if (!fileObj) return;
  const exists = policePendingEvidenceFiles.some(f => f.dataUrl === fileObj.dataUrl);
  if (!exists) {
    policePendingEvidenceFiles.push(fileObj);

    // If description is empty, auto-populate
    const textEl = document.getElementById('evText');
    if (textEl && !textEl.value.trim()) {
      textEl.value = `Field camera photograph (${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})})`;
    }

    const typeEl = document.getElementById('evType');
    if (typeEl && (typeEl.value === 'forensic' || !typeEl.value)) {
      typeEl.value = 'photo';
    }
    renderPolicePendingAttachmentsList();
  }
}

export function renderPolicePendingAttachmentsList() {
  const container = document.getElementById('evPendingAttachmentsList');
  if (!container) return;

  if (!policePendingEvidenceFiles.length) {
    container.innerHTML = '';
    return;
  }

  function formatBytes(bytes) {
    if (!bytes || bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  }

  container.innerHTML = `
    <div style="font-size:11.5px;font-weight:600;margin-bottom:6px;color:var(--ink-muted);">Attached Field Media (${policePendingEvidenceFiles.length}):</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${policePendingEvidenceFiles.map(f => `
        <div style="display:flex;align-items:center;gap:6px;background:var(--surface-secondary);padding:4px 8px;border-radius:6px;border:1px solid var(--line);font-size:11.5px;">
          ${f.previewUrl ? `
            <img src="${f.previewUrl}" alt="Thumb" style="width:22px;height:22px;border-radius:4px;object-fit:cover;border:1px solid var(--line);" />
          ` : `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          `}
          <span style="max-width:130px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-weight:500;">${escapeHtml(f.name)}</span>
          <span style="color:var(--ink-faint);font-size:10px;">(${formatBytes(f.size)})</span>
          <button type="button" onclick="window.removePolicePendingAttachment('${f.id}')" style="background:none;border:none;color:var(--red);cursor:pointer;font-weight:bold;padding:0 2px;font-size:13px;" title="Remove media">×</button>
        </div>
      `).join('')}
    </div>
  `;
}

// Expose globals for inline HTML event handlers
window.handlePoliceFileUpload = handlePoliceFileUpload;
window.removePolicePendingAttachment = removePolicePendingAttachment;
window.addPolicePendingAttachment = addPolicePendingAttachment;
window.resetPolicePendingEvidenceState = resetPolicePendingEvidenceState;

export function setEvFilterType(type) {
  evFilterType = type;
}

export function setEvFilterCase(caseId) {
  evFilterCase = caseId;
}

export function viewEvidenceLog() {
  const allEv = allEvidence();
  let ev = allEv;

  if (evFilterCase !== 'all') {
    ev = ev.filter(e => 
      e.caseId === evFilterCase ||
      e.caseNum === evFilterCase ||
      e.applicationId === evFilterCase ||
      e.applicationNum === evFilterCase
    );
  }

  if (evFilterType !== 'all') {
    ev = ev.filter(e => {
      const et = (e.type || '').toLowerCase();
      if (evFilterType === 'digital') return et === 'digital' || et === 'document' || et === 'file';
      if (evFilterType === 'photo') return et === 'photo' || et === 'image' || Boolean(e.previewUrl || e.dataUrl);
      if (evFilterType === 'document') return et === 'document' || et === 'pdf' || et === 'doc';
      if (evFilterType === 'witness') return et === 'witness' || et.includes('statement');
      return et === evFilterType;
    });
  }

  const policeCases = DATA?.cases || [];
  const citizenApps = DATA?.applications || [];

  return `
    <div class="crumb">Police Intelligence / Evidence Log</div>
    <div class="page-title">
      <div>
        <h2>Evidence Log</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);">Central repository across Police FIR cases & Citizen-registered complaints</div>
      </div>
      <div class="actions">
        <button class="btn primary" id="addEvBtnGlobal">+ Log Evidence</button>
      </div>
    </div>

    <div class="filters-row" style="display:flex;align-items:center;gap:10px;flex-wrap:wrap;">
      <select id="evCaseFilter" class="raised-sm" style="box-shadow:none;min-width:280px;padding:8px 12px;border-radius:8px;font-size:12.5px;">
        <option value="all" ${evFilterCase === 'all' ? 'selected' : ''}>All Cases & Citizen Complaints (${allEv.length})</option>
        ${policeCases.length ? `
          <optgroup label="Police FIR Cases (${policeCases.length})">
            ${policeCases.map(c => `<option value="${c.id}" ${evFilterCase === c.id ? 'selected' : ''}>${escapeHtml(c.num)}: ${escapeHtml(c.title)}</option>`).join('')}
          </optgroup>
        ` : ''}
        ${citizenApps.length ? `
          <optgroup label="Citizen Registered Cases (${citizenApps.length})">
            ${citizenApps.map(a => `<option value="${a.id}" ${evFilterCase === a.id ? 'selected' : ''}>[Citizen] ${escapeHtml(a.num || a.id)}: ${escapeHtml(a.title)} (${escapeHtml(a.citizenName || 'Citizen')})</option>`).join('')}
          </optgroup>
        ` : ''}
      </select>

      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        ${['all', 'forensic', 'witness', 'photo', 'digital', 'document', 'physical'].map(t => `
          <div class="chip-filter raised-sm ${evFilterType === t ? 'active' : ''}" data-evtype="${t}" style="text-transform:capitalize;font-size:11.5px;padding:5px 11px;cursor:pointer;">
            ${t === 'all' ? 'All Types' : t}
          </div>
        `).join('')}
      </div>
    </div>

    <div class="evidence-grid" style="margin-top:14px;">
      ${ev.length
        ? ev.map(e => evCardHtml(e, e.caseTitle)).join('')
        : `<div class="empty-state" style="grid-column:1/-1;padding:48px 16px;">
            <h3>No Evidence Matches Filter</h3>
            <p>No evidence records found matching the selected case or classification filter.</p>
          </div>`
      }
    </div>
  `;
}

export async function handleSaveEvidence(onRender) {
  const evCaseEl = document.getElementById('evCase');
  if (!evCaseEl) return;
  const caseId = evCaseEl.value;
  if (!caseId) {
    showToast('Please select a case to attach evidence to.');
    return;
  }

  const textEl = document.getElementById('evText');
  const typeEl = document.getElementById('evType');
  const locEl = document.getElementById('evLocation');
  const timeEl = document.getElementById('evTime');
  const tagsEl = document.getElementById('evTags');

  let text = textEl ? textEl.value.trim() : '';
  const attachedFiles = [...policePendingEvidenceFiles];

  if (!text && attachedFiles.length > 0) {
    text = `Field evidence attachment: ${attachedFiles.map(f => f.name).join(', ')}`;
  }

  if (!text && attachedFiles.length === 0) {
    showToast('Please enter an evidence description or attach a photo.');
    return;
  }

  // Check if it's a Police Case
  const policeCase = DATA?.cases?.find(c => c.id === caseId || c.num === caseId);
  const citizenApp = DATA?.applications?.find(a => a.id === caseId || a.num === caseId);

  const nowIso = new Date().toISOString();
  let evType = typeEl ? typeEl.value : 'forensic';
  const location = locEl && locEl.value.trim() ? locEl.value.trim() : '—';
  const time = timeEl && timeEl.value.trim() ? timeEl.value.trim() : '—';
  const tags = splitTags(tagsEl ? tagsEl.value : '');

  const primaryFile = attachedFiles.length > 0 ? attachedFiles[0] : null;

  // If user attached an image and type was forensic or default, use 'photo'
  if (primaryFile && primaryFile.previewUrl && (evType === 'forensic' || !evType)) {
    evType = 'photo';
  }

  if (policeCase) {
    if (!Array.isArray(policeCase.evidence)) policeCase.evidence = [];

    if (attachedFiles.length > 1) {
      // Multiple attachments: log each one cleanly
      attachedFiles.forEach((f, idx) => {
        const itemEvId = uid('e');
        const isImg = Boolean(f.previewUrl || f.dataUrl);
        const itemType = isImg ? 'photo' : evType;
        const itemText = idx === 0 ? text : `${text} [Attachment: ${f.name}]`;
        const ev = {
          id: itemEvId,
          name: f.name,
          fileName: f.name,
          type: itemType,
          text: itemText,
          location,
          time,
          tags,
          loggedAt: nowIso,
          dataUrl: f.dataUrl || null,
          previewUrl: f.previewUrl || f.dataUrl || null,
          fileSize: f.size || 0
        };
        policeCase.evidence.push(ev);
      });
    } else {
      const evId = uid('e');
      const ev = {
        id: evId,
        name: primaryFile ? primaryFile.name : (evType === 'photo' ? 'Scene Photograph' : 'Evidence Record'),
        fileName: primaryFile ? primaryFile.name : null,
        type: evType,
        text,
        location,
        time,
        tags,
        loggedAt: nowIso,
        dataUrl: primaryFile ? primaryFile.dataUrl : null,
        previewUrl: primaryFile ? (primaryFile.previewUrl || primaryFile.dataUrl) : null,
        fileSize: primaryFile ? primaryFile.size : 0
      };
      policeCase.evidence.push(ev);
    }

    logActivity(
      'evidence',
      policeCase.id,
      `Evidence logged in "${policeCase.title}": ${evType} — ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}`
    );
  } else if (citizenApp) {
    if (!Array.isArray(citizenApp.evidence)) citizenApp.evidence = [];

    if (attachedFiles.length > 1) {
      attachedFiles.forEach((f, idx) => {
        const itemEvId = uid('e');
        const isImg = Boolean(f.previewUrl || f.dataUrl);
        const itemType = isImg ? 'photo' : evType;
        const ev = {
          id: itemEvId,
          applicationId: citizenApp.id,
          applicationNum: citizenApp.num || citizenApp.id,
          citizenPhone: citizenApp.citizenPhone || '',
          name: f.name || text.slice(0, 50),
          fileName: f.name || text.slice(0, 50),
          description: idx === 0 ? text : `${text} [Attachment: ${f.name}]`,
          type: itemType,
          location,
          time,
          tags: ['police-logged', ...tags],
          status: 'Verified',
          uploadDate: nowIso,
          dataUrl: f.dataUrl || null,
          previewUrl: f.previewUrl || f.dataUrl || null,
          fileSize: f.size || 0
        };
        citizenApp.evidence.push(ev);
        if (!Array.isArray(DATA.citizenEvidence)) DATA.citizenEvidence = [];
        DATA.citizenEvidence.unshift(ev);
      });
    } else {
      const evId = uid('e');
      const ev = {
        id: evId,
        applicationId: citizenApp.id,
        applicationNum: citizenApp.num || citizenApp.id,
        citizenPhone: citizenApp.citizenPhone || '',
        name: primaryFile ? primaryFile.name : text.slice(0, 50),
        fileName: primaryFile ? primaryFile.name : text.slice(0, 50),
        description: text,
        type: evType,
        location,
        time,
        tags: ['police-logged', ...tags],
        status: 'Verified',
        uploadDate: nowIso,
        dataUrl: primaryFile ? primaryFile.dataUrl : null,
        previewUrl: primaryFile ? (primaryFile.previewUrl || primaryFile.dataUrl) : null,
        fileSize: primaryFile ? primaryFile.size : 0
      };
      citizenApp.evidence.push(ev);
      if (!Array.isArray(DATA.citizenEvidence)) DATA.citizenEvidence = [];
      DATA.citizenEvidence.unshift(ev);
    }

    logActivity(
      'evidence',
      citizenApp.id,
      `Police logged evidence in Citizen Case ${citizenApp.num || citizenApp.id}: ${evType} — ${text.slice(0, 60)}${text.length > 60 ? '…' : ''}`
    );
  } else {
    showToast('Target case could not be located.');
    return;
  }

  ['evText', 'evLocation', 'evTime', 'evTags'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  resetPolicePendingEvidenceState();
  closeModal('evOverlay');
  await persist();
  if (typeof onRender === 'function') onRender();
  showToast('Evidence logged successfully');
}
