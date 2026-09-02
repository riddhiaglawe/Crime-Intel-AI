/**
 * CrimeIntel AI - Case Management & Police Portal Case/Complaint Views
 */

import {
  DATA,
  getCase,
  uid,
  nextCaseNum,
  logActivity,
  persist,
  getAllApplications,
  approveCitizenApplication,
  rejectCitizenApplication,
  updateApplicationStatus
} from './data.js';

import {
  escapeHtml,
  evCardHtml,
  scoreLabel,
  showToast,
  openModal,
  closeModal,
  fmtDate
} from './ui.js';

import { suspectCardHtml } from './suspects.js';
import { renderLegalProvisionsSection, generateComplaintAssessmentPdf } from './legal-provisions.js';

export let caseFilterStatus = 'all';
export let casesActiveTab = 'cases'; // 'cases' | 'complaints'
export let complaintFilterStatus = 'all'; // 'all' | 'pending' | 'approved' | 'rejected' | 'investigating' | 'resolved'

export function setCaseFilterStatus(status) {
  caseFilterStatus = status;
}

export function setCasesActiveTab(tab) {
  casesActiveTab = tab;
}

export function setComplaintFilterStatus(status) {
  complaintFilterStatus = status;
}

export function viewCasesList() {
  const filteredCases =
    caseFilterStatus === 'all'
      ? DATA.cases
      : DATA.cases.filter(c => {
          if (caseFilterStatus === 'resolved' || caseFilterStatus === 'closed') {
            return c.status === 'resolved' || c.status === 'closed';
          }
          return c.status === caseFilterStatus;
        });

  const allApps = getAllApplications();

  const filteredApps = allApps.filter(app => {
    if (complaintFilterStatus === 'all') return true;
    if (complaintFilterStatus === 'pending') return app.reviewStatus === 'Pending Review' || app.status === 'Submitted';
    if (complaintFilterStatus === 'approved') return app.reviewStatus === 'Approved';
    if (complaintFilterStatus === 'rejected') return app.reviewStatus === 'Rejected' || app.status === 'Rejected';
    if (complaintFilterStatus === 'investigating') return app.status === 'Investigation in Progress' || app.status === 'Under Review';
    if (complaintFilterStatus === 'resolved') return app.status === 'Resolved' || app.status === 'Closed' || app.status === 'Action Taken';
    return true;
  });

  const pendingCount = allApps.filter(a => a.reviewStatus === 'Pending Review' || (!a.reviewStatus && a.status === 'Submitted')).length;
  const approvedCount = allApps.filter(a => a.reviewStatus === 'Approved').length;
  const rejectedCount = allApps.filter(a => a.reviewStatus === 'Rejected' || a.status === 'Rejected').length;
  const investigatingCount = allApps.filter(a => a.status === 'Investigation in Progress' || a.status === 'Under Review').length;
  const resolvedCount = allApps.filter(a => a.status === 'Resolved' || a.status === 'Closed').length;

  return `
    <div class="crumb">Law Enforcement Investigations</div>
    <div class="page-title">
      <div>
        <h2>Investigation Records &amp; Public Grievances</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);margin-top:2px;">Primary Metro Police Department Repository</div>
      </div>
      <div class="actions">
        ${casesActiveTab === 'cases' ? `
          <button class="btn primary" id="qNewCase2">+ Open New Case</button>
        ` : `
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="badge ${pendingCount > 0 ? 'critical' : 'closed'}" style="font-size:12px;padding:4px 10px;">
              ${pendingCount} Pending Police Review
            </span>
          </div>
        `}
      </div>
    </div>

    <!-- Police Cases vs Citizen Complaints Switcher -->
    <div class="tabs" style="margin-bottom:14px;">
      <div class="tab-btn ${casesActiveTab === 'cases' ? 'active' : ''}" onclick="window.switchCasesTab('cases')">
        Police FIR Cases (${DATA.cases.length})
      </div>
      <div class="tab-btn ${casesActiveTab === 'complaints' ? 'active' : ''}" onclick="window.switchCasesTab('complaints')">
        Citizen Complaints / Grievances (${allApps.length})
        ${pendingCount > 0 ? `<span class="badge-dot-live" style="margin-left:6px;width:7px;height:7px;"></span>` : ''}
      </div>
    </div>

    ${casesActiveTab === 'cases' ? `
      <div class="filters-row">
        ${[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'critical', label: 'Critical' },
          { key: 'cold', label: 'Cold' },
          { key: 'resolved', label: 'Resolved' }
        ]
          .map(
            s =>
              `<div class="chip-filter raised-sm ${(caseFilterStatus === s.key || (s.key === 'resolved' && caseFilterStatus === 'closed')) ? 'active' : ''}" data-status="${s.key}">${s.label}</div>`
          )
          .join('')}
      </div>
      <div class="case-grid">
        ${
          filteredCases
            .map(
              c => `
          <div class="case-card raised-sm" data-case="${c.id}">
            <div class="cid mono" style="display:flex;justify-content:space-between;align-items:center;">
              <span>${c.num}</span>
              <span class="badge ${c.status}">${c.status === 'closed' ? 'resolved' : c.status}</span>
            </div>
            <h4 style="margin-top:4px;">${escapeHtml(c.title)}</h4>
            <p>${escapeHtml(c.description)}</p>
            <div class="meta-row" style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px;">
              <span>${c.evidence ? c.evidence.length : 0} evidence · ${c.suspects ? c.suspects.length : 0} suspects</span>
              <span style="font-size:11px;color:var(--ink-faint);">Opened: ${c.opened || '—'}</span>
            </div>
          </div>
        `
            )
            .join('') || '<div class="empty-state">No cases match this filter.</div>'
        }
      </div>
    ` : `
      <!-- Citizen Complaints Table for Police Officers -->
      <div class="panel raised">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px;">
          <div>
            <h3 style="margin:0;">Citizen Applications &amp; Complaints Review</h3>
            <div style="font-size:12px;color:var(--ink-faint);margin-top:2px;">Review citizen submissions, inspect evidence, approve or reject applications, and update investigation milestones.</div>
          </div>
        </div>

        <!-- Filter Chips for Complaints -->
        <div class="filters-row" style="margin-bottom:14px;">
          <div class="chip-filter raised-sm ${complaintFilterStatus === 'all' ? 'active' : ''}" onclick="window.setComplaintFilterStatus('all')">
            All Complaints (${allApps.length})
          </div>
          <div class="chip-filter raised-sm ${complaintFilterStatus === 'pending' ? 'active' : ''}" onclick="window.setComplaintFilterStatus('pending')" style="color:var(--amber);">
            Pending Review (${pendingCount})
          </div>
          <div class="chip-filter raised-sm ${complaintFilterStatus === 'approved' ? 'active' : ''}" onclick="window.setComplaintFilterStatus('approved')" style="color:var(--green);">
            Approved (${approvedCount})
          </div>
          <div class="chip-filter raised-sm ${complaintFilterStatus === 'investigating' ? 'active' : ''}" onclick="window.setComplaintFilterStatus('investigating')" style="color:var(--blue);">
            Under Investigation (${investigatingCount})
          </div>
          <div class="chip-filter raised-sm ${complaintFilterStatus === 'resolved' ? 'active' : ''}" onclick="window.setComplaintFilterStatus('resolved')">
            Resolved (${resolvedCount})
          </div>
          <div class="chip-filter raised-sm ${complaintFilterStatus === 'rejected' ? 'active' : ''}" onclick="window.setComplaintFilterStatus('rejected')" style="color:var(--red);">
            Rejected (${rejectedCount})
          </div>
        </div>

        ${
          filteredApps.length
            ? `
            <div style="overflow-x:auto;">
              <table class="data-table" style="width:100%;">
                <thead>
                  <tr>
                    <th>Application ID</th>
                    <th>Citizen Details</th>
                    <th>Complaint Title &amp; Location</th>
                    <th>Category</th>
                    <th>Submitted Date</th>
                    <th>Review Decision</th>
                    <th>Investigation Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${filteredApps.map(app => {
                    const reviewStatus = app.reviewStatus || (app.status === 'Submitted' ? 'Pending Review' : 'Approved');
                    const isPending = reviewStatus === 'Pending Review';
                    return `
                    <tr class="complaint-row" data-app-id="${app.id}" style="${isPending ? 'background:rgba(217, 119, 6, 0.04);' : ''}cursor:pointer;" title="Click row to open full case detail">
                      <td onclick="window.go('case/${app.id}')">
                        <strong class="mono" style="color:var(--primary);">${escapeHtml(app.num || app.id)}</strong>
                      </td>
                      <td onclick="window.go('case/${app.id}')">
                        <strong>${escapeHtml(app.citizenName || 'Citizen')}</strong>
                        <div class="mono" style="font-size:11px;color:var(--ink-faint);">${escapeHtml(app.citizenPhone || '—')}</div>
                      </td>
                      <td onclick="window.go('case/${app.id}')">
                        <strong>${escapeHtml(app.title)}</strong>
                        <div style="font-size:11.5px;color:var(--ink-muted);">${escapeHtml(app.location)}</div>
                      </td>
                      <td onclick="window.go('case/${app.id}')"><span class="tag-chip">${escapeHtml(app.category)}</span></td>
                      <td onclick="window.go('case/${app.id}')">${fmtDate(app.createdAt)}</td>
                      <td onclick="window.go('case/${app.id}')">
                        <span class="badge ${getReviewBadgeClass(reviewStatus)}">
                          ${escapeHtml(reviewStatus)}
                        </span>
                      </td>
                      <td onclick="window.go('case/${app.id}')">
                        <span class="badge ${getStatusBadgeClass(app.status)}">${escapeHtml(app.status)}</span>
                      </td>
                      <td>
                        <div style="display:flex;gap:6px;align-items:center;flex-wrap:wrap;">
                          <button class="btn ghost-sm" onclick="event.stopPropagation();window.go('case/${app.id}')" style="padding:4px 10px;font-size:11px;font-weight:600;display:flex;align-items:center;gap:4px;" title="Open full case detail view">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>
                            Open
                          </button>
                          <button class="btn ${isPending ? 'primary' : 'ghost-sm'}" onclick="event.stopPropagation();window.openPoliceReviewComplaintModal('${app.id}')" style="padding:4px 12px;font-size:11px;font-weight:600;">
                            ${isPending ? '⚡ Review' : 'Update'}
                          </button>
                        </div>
                      </td>
                    </tr>
                    `;}).join('')}
                </tbody>
              </table>
            </div>`
            : `<div class="empty-state" style="padding:36px 16px;">
                <p>No citizen complaints match the selected filter.</p>
                <button class="btn ghost-sm" onclick="window.setComplaintFilterStatus('all')" style="margin-top:8px;">Clear Filters</button>
              </div>`
        }
      </div>
    `}
  `;
}

export function viewCaseDetail(caseId, tab) {
  const c = getCase(caseId);
  if (!c)
    return `<div class="empty-state">Case not found. <a href="#cases">Back to cases</a></div>`;

  const isCitizenApp = !!c.isCitizenApp;

  const tabs = [
    ['overview', 'Overview'],
    ['evidence', 'Evidence'],
    ['web', 'Correlation Web'],
    ['suspects', 'Suspects'],
    ['timeline', 'Timeline'],
    ['report', 'Report']
  ];

  let body = '';
  if (tab === 'overview') body = isCitizenApp ? citizenAppOverviewTab(c) : caseOverviewTab(c);
  else if (tab === 'evidence') body = caseEvidenceTab(c);
  else if (tab === 'web') body = caseWebTab(c);
  else if (tab === 'suspects') body = caseSuspectsTab(c);
  else if (tab === 'timeline') body = caseTimelineTab(c);
  else if (tab === 'report') body = caseReportTab(c);

  // Citizen apps use different status values than police FIR cases
  const statusDropdown = isCitizenApp
    ? `<select id="citizenAppStatusSelect" class="raised-sm" style="box-shadow:none;padding:9px 12px;border-radius:11px;">
        ${[
          { value: 'Submitted', label: 'Submitted' },
          { value: 'Under Review', label: 'Under Review' },
          { value: 'Investigation in Progress', label: 'Investigation in Progress' },
          { value: 'Action Taken', label: 'Action Taken' },
          { value: 'Resolved', label: 'Resolved' },
          { value: 'Closed', label: 'Closed' }
        ].map(s => `<option value="${s.value}" ${s.value === c.status ? 'selected' : ''}>${s.label}</option>`).join('')}
      </select>`
    : `<select id="statusSelect" class="raised-sm" style="box-shadow:none;padding:9px 12px;border-radius:11px;">
        ${[
          { value: 'open', label: 'Open' },
          { value: 'critical', label: 'Critical' },
          { value: 'cold', label: 'Cold' },
          { value: 'closed', label: 'Resolved' }
        ].map(s => `<option value="${s.value}" ${(s.value === c.status || (s.value === 'closed' && c.status === 'resolved')) ? 'selected' : ''}>${s.label}</option>`).join('')}
      </select>`;

  const reviewBtn = isCitizenApp
    ? `<button class="btn primary" onclick="window.openPoliceReviewComplaintModal('${c.id}')" style="margin-right:8px;">⚡ Review / Update</button>
       <button class="btn ghost-sm" onclick="window.generateComplaintAssessmentPdf('${c.id}')" style="margin-right:8px;display:inline-flex;align-items:center;gap:4px;" title="Generate compact official 6-section Complaint Assessment PDF">
         <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
         Assessment PDF
       </button>`
    : '';

  const sourceLabel = isCitizenApp
    ? `<span style="font-size:11px;background:var(--amber-soft);color:var(--amber);padding:3px 10px;border-radius:20px;font-weight:600;margin-left:8px;vertical-align:middle;">Citizen Complaint</span>`
    : '';

  return `
    <div class="crumb"><a href="#cases">Cases</a> / ${c.num}</div>
    <div class="page-title">
      <h2>${escapeHtml(c.title)} <span class="badge ${isCitizenApp ? getStatusBadgeClass(c.status) : c.status}" style="vertical-align:middle;margin-left:8px;">${c.status}</span>${sourceLabel}</h2>
      <div class="actions">
        ${reviewBtn}
        ${statusDropdown}
      </div>
    </div>
    <div class="tabs">
      ${tabs
        .map(
          ([key, label]) =>
            `<div class="tab-btn ${tab === key ? 'active' : ''}" data-casetab="${key}">${label}</div>`
        )
        .join('')}
    </div>
    ${body}
  `;
}

export function caseOverviewTab(c) {
  return `
    <div class="panel raised">
      <p style="font-size:13px;color:var(--ink-muted);line-height:1.6;max-width:640px;margin:0 0 16px;">${escapeHtml(c.description)}</p>
      <div class="row-2" style="max-width:500px;">
        <div><label>Case Number</label><div class="mono" style="font-size:13px;">${c.num}</div></div>
        <div><label>Opened</label><div style="font-size:13px;">${c.opened}</div></div>
      </div>
    </div>
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="stat-card raised-sm"><div class="label">Evidence</div><div class="value">${(c.evidence || []).length}</div></div>
      <div class="stat-card raised-sm"><div class="label">Suspects</div><div class="value">${(c.suspects || []).length}</div></div>
      <div class="stat-card raised-sm"><div class="label">Top Score</div><div class="value">${(c.suspects && c.suspects.length && c.suspects.some(s => s.score != null)) ? Math.max(...c.suspects.map(s => s.score || 0)) + '%' : '—'}</div></div>
    </div>
  `;
}

export function citizenAppOverviewTab(c) {
  const reviewStatus = c.reviewStatus || (c.status === 'Submitted' ? 'Pending Review' : 'Approved');
  const history = c.reviewHistory || [];
  return `
    <!-- Citizen Complainant Details -->
    <div class="panel raised" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;margin-bottom:12px;">
        <div>
          <div style="font-size:11px;color:var(--ink-faint);text-transform:uppercase;letter-spacing:0.5px;margin-bottom:4px;">Citizen Complaint Overview</div>
          <h3 style="margin:0;font-size:15px;">${escapeHtml(c.title)}</h3>
        </div>
        <div style="display:flex;gap:8px;align-items:center;">
          <span class="badge ${getReviewBadgeClass(reviewStatus)}" style="font-size:11px;padding:3px 10px;">Review: ${escapeHtml(reviewStatus)}</span>
          <span class="badge ${getStatusBadgeClass(c.status)}" style="font-size:11px;padding:3px 10px;">${escapeHtml(c.status)}</span>
        </div>
      </div>
      <p style="font-size:13px;color:var(--ink-muted);line-height:1.6;margin:0 0 14px;">${escapeHtml(c.description)}</p>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:10px;border-top:1px solid var(--line);padding-top:12px;font-size:12.5px;">
        <div>
          <span style="color:var(--ink-faint);">Application No.</span><br>
          <strong class="mono" style="color:var(--primary);">${escapeHtml(c.num || c.id)}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Complainant</span><br>
          <strong>${escapeHtml(c.citizenName || 'Citizen')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Phone</span><br>
          <strong class="mono">${escapeHtml(c.citizenPhone || '—')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Category</span><br>
          <span class="tag-chip">${escapeHtml(c.category || '—')}</span>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Incident Location</span><br>
          <strong>${escapeHtml(c.location || '—')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Incident Date</span><br>
          <strong>${escapeHtml(c.incidentDate || '—')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Submitted</span><br>
          <span>${fmtDate(c.createdAt)}</span>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Police Station</span><br>
          <strong>${escapeHtml(c.assignedStation || '—')}</strong>
        </div>
      </div>
    </div>

    ${c.suspectInfo && (c.suspectInfo.name || c.suspectInfo.description) ? `
    <!-- Reported Suspect Info -->
    <div class="panel raised" style="margin-bottom:16px;">
      <div style="font-weight:600;font-size:13px;margin-bottom:8px;">Reported Suspect Information</div>
      <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:10px;font-size:12.5px;">
        <div>
          <span style="color:var(--ink-faint);">Name / Alias</span><br>
          <strong>${escapeHtml(c.suspectInfo.name || 'Unknown')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Gender / Age</span><br>
          <span>${escapeHtml(c.suspectInfo.gender || 'Unknown')} (${escapeHtml(c.suspectInfo.age ? c.suspectInfo.age + ' yrs' : 'Age ~')})</span>
        </div>
      </div>
      ${c.suspectInfo.description ? `
      <div style="margin-top:8px;background:var(--surface-secondary);padding:8px 10px;border-radius:6px;font-size:12px;color:var(--ink-muted);">
        <strong>Description:</strong> ${escapeHtml(c.suspectInfo.description)}
      </div>` : ''}
    </div>` : ''}

    <!-- Police Suggested Legal Provisions Section (Advisory Decision Support) -->
    ${renderLegalProvisionsSection(c)}

    <!-- Audit Trail -->
    ${history.length ? `
    <div class="panel raised" style="margin-bottom:16px;">
      <div style="font-weight:600;font-size:13px;margin-bottom:8px;">Audit Trail & Review History</div>
      <div style="display:flex;flex-direction:column;gap:6px;max-height:200px;overflow-y:auto;">
        ${history.map(h => `
          <div style="display:flex;justify-content:space-between;align-items:flex-start;background:var(--surface-secondary);padding:8px 10px;border-radius:6px;border:1px solid var(--line);font-size:12px;">
            <div>
              <strong>${escapeHtml(h.action || 'Action')}</strong> by <span style="color:var(--primary);font-weight:600;">${escapeHtml(h.officerName || 'Officer')}</span>
              <div style="color:var(--ink-muted);margin-top:2px;">"${escapeHtml(h.remarks || h.reason || '')}"</div>
            </div>
            <div class="mono" style="font-size:10.5px;color:var(--ink-faint);white-space:nowrap;margin-left:8px;">${fmtDate(h.timestamp)}</div>
          </div>
        `).join('')}
      </div>
    </div>` : ''}

    <!-- Stats -->
    <div class="stat-grid" style="grid-template-columns:repeat(3,1fr);">
      <div class="stat-card raised-sm"><div class="label">Evidence</div><div class="value">${(c.evidence || []).length}</div></div>
      <div class="stat-card raised-sm"><div class="label">Suspects</div><div class="value">${(c.suspects || []).length}</div></div>
      <div class="stat-card raised-sm"><div class="label">Top Score</div><div class="value">${(c.suspects && c.suspects.length && c.suspects.some(s => s.score != null)) ? Math.max(...c.suspects.map(s => s.score || 0)) + '%' : '—'}</div></div>
    </div>
  `;
}

export function caseEvidenceTab(c) {
  return `
    <div class="toolbar" style="margin-bottom:16px;"><button class="btn" id="addEvBtn" data-case="${c.id}">+ Add Evidence</button></div>
    <div class="evidence-grid">
      ${(c.evidence || []).map(ev => evCardHtml(ev)).join('') || '<div class="empty-state">No evidence logged yet.</div>'}
    </div>
  `;
}

export function caseWebTab(c) {
  return `
    <div class="toolbar" style="margin-bottom:16px;"><button class="btn primary" id="runAiBtn" data-case="${c.id}">▶ Run AI Correlation</button></div>
    <div class="panel raised" style="padding:14px;">
      <div class="web-wrap pressed" style="box-shadow:none;background:var(--raised);">
        <svg id="webSvg" viewBox="0 0 700 400"></svg>
        <div class="web-empty" id="webEmpty" style="display:none;">
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#8b93a8" stroke-width="1.6"/><path d="M12 8v5M12 16h.01" stroke="#8b93a8" stroke-width="1.6" stroke-linecap="round"/></svg>
          Run AI Correlation to generate the evidence-suspect network.
        </div>
      </div>
      <div class="ai-log raised-sm" id="aiLog" style="display:none;"></div>
    </div>
  `;
}

export function caseSuspectsTab(c) {
  const ranked = [...(c.suspects || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  return `
    <div class="toolbar" style="margin-bottom:16px;"><button class="btn" id="addSuBtn" data-case="${c.id}">+ Add Suspect</button></div>
    ${ranked.length ? ranked.map(s => suspectCardHtml(s, c.id)).join('') : '<div class="empty-state">No suspects added yet.</div>'}
  `;
}

export function caseTimelineTab(c) {
  const sorted = [...(c.evidence || [])].sort((a, b) =>
    (a.time || '').localeCompare(b.time || '')
  );
  return `<div class="panel raised"><div class="timeline">
    ${
      sorted
        .map(
          ev => `<div class="tl-item"><div class="tl-dot"></div><div class="tl-time">${escapeHtml(ev.time)}</div><div class="tl-body"><span class="etype ${ev.type}">${ev.type}</span> ${escapeHtml(ev.text)} <span style="color:var(--ink-faint);">— ${escapeHtml(ev.location)}</span></div></div>`
        )
        .join('') || '<div class="empty-state">No evidence to plot yet.</div>'
    }
  </div></div>`;
}

export function caseReportTab(c) {
  const ranked = [...(c.suspects || [])].sort((a, b) => (b.score || 0) - (a.score || 0));
  const byType = {};
  (c.evidence || []).forEach(ev => (byType[ev.type] = (byType[ev.type] || 0) + 1));
  return `
  <div class="report-doc raised" id="reportDoc">
    <h2>${escapeHtml(DATA.meta.org)}</h2>
    <div class="r-meta">CASE INTELLIGENCE REPORT · ${c.num} · Generated ${new Date().toLocaleString()} · Officer: ${escapeHtml(DATA.meta.analyst)}</div>
    <h4>Case Summary</h4>
    <p><strong>${escapeHtml(c.title)}</strong> — Status: ${c.status.toUpperCase()} · Opened: ${c.opened}</p>
    <p>${escapeHtml(c.description)}</p>
    <h4>Evidence Summary (${(c.evidence || []).length} items)</h4>
    <ul>${Object.entries(byType).map(([t, n]) => `<li>${n} × ${t}</li>`).join('') || '<li>No evidence logged.</li>'}</ul>
    <h4>Suspect Analysis</h4>
    ${
      ranked.length
        ? ranked
            .map(
              s =>
                `<div class="r-suspect"><strong>${escapeHtml(s.name)}</strong> — ${s.score != null ? s.score + '% (' + scoreLabel(s.score).label + ')' : 'not analyzed'}<br><span style="color:var(--ink-muted);font-size:12px;">${escapeHtml(s.alias || '')}</span>${s.crossCase && s.crossCase.length ? `<br><span style="color:var(--amber);font-size:11.5px;">⚠ Cross-case pattern: ${[...new Set(s.crossCase.map(x => x.caseTitle))].join(', ')}</span>` : ''}</div>`
            )
            .join('')
        : '<p>No suspects on file.</p>'
    }
    <h4 style="border:none;color:var(--ink-faint);margin-top:26px;">Generated by CrimeIntel AI Correlation Engine — for law enforcement investigative reference only.</h4>
  </div>
  <div class="toolbar" style="margin-top:16px;display:flex;gap:8px;flex-wrap:wrap;">
    <button class="btn" id="copyReportBtn" data-case="${c.id}">Copy Report</button>
    <button class="btn" id="printReportBtn">Print / Save PDF</button>
    ${c.isCitizenApp ? `
      <button class="btn primary" onclick="window.generateComplaintAssessmentPdf('${c.id}')" style="display:inline-flex;align-items:center;gap:6px;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>
        Generate Complaint Assessment PDF
      </button>
    ` : ''}
  </div>
  `;
}

export async function handleCreateCase(onCreated) {
  const titleEl = document.getElementById('ncTitle');
  const descEl = document.getElementById('ncDesc');
  const statusEl = document.getElementById('ncStatus');
  const dateEl = document.getElementById('ncDate');

  const title = titleEl ? titleEl.value.trim() : '';
  if (!title) return;

  const nc = {
    id: uid('c'),
    num: nextCaseNum(),
    title,
    status: statusEl ? statusEl.value : 'open',
    opened: (dateEl && dateEl.value) || new Date().toISOString().slice(0, 10),
    description: (descEl && descEl.value.trim()) || 'No summary provided yet.',
    evidence: [],
    suspects: []
  };

  DATA.cases.push(nc);
  logActivity('case', nc.id, `Case opened: "${nc.title}" (${nc.num})`);
  ['ncTitle', 'ncDesc', 'ncDate'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  closeModal('caseOverlay');
  await persist();
  if (typeof onCreated === 'function') onCreated(nc.id);
  showToast('Case created');
}

export async function handleStatusChange(caseId, newStatus, onRender) {
  const c = getCase(caseId);
  if (!c) return;
  const old = c.status;
  c.status = newStatus;
  logActivity('status', c.id, `Case status changed: "${c.title}" ${old} → ${c.status}`);
  await persist();
  if (typeof onRender === 'function') onRender();
  showToast('Status updated');
}

/* ==========================================================================
   POLICE REVIEW CITIZEN COMPLAINT MODAL & ACTIONS
   ========================================================================== */
export function openPoliceReviewComplaintModal(appId) {
  const apps = getAllApplications();
  const app = apps.find(a => a.id === appId || a.num === appId);
  if (!app) return;

  const modal = document.getElementById('policeReviewModal');
  const modalBody = document.getElementById('policeReviewModalBody');
  if (!modalBody) return;

  const reviewStatus = app.reviewStatus || (app.status === 'Submitted' ? 'Pending Review' : 'Approved');
  const isPending = reviewStatus === 'Pending Review';
  const isApproved = reviewStatus === 'Approved';
  const isRejected = reviewStatus === 'Rejected' || app.status === 'Rejected';

  const history = app.reviewHistory || [];
  const statusHistory = app.statusHistory || [];

  modalBody.innerHTML = `
    <!-- Top Application Banner -->
    <div style="background:var(--surface-secondary);padding:14px;border-radius:10px;margin-bottom:14px;border:1px solid var(--line);">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;">
        <div>
          <span class="mono" style="font-weight:700;color:var(--primary);font-size:14px;">${escapeHtml(app.num || app.id)}</span>
          <h3 style="margin:4px 0 4px 0;font-size:16px;">${escapeHtml(app.title)}</h3>
          <div style="font-size:12px;color:var(--ink-faint);">
            Category: <strong style="color:var(--ink);">${escapeHtml(app.category)}</strong> · Incident Date: <strong style="color:var(--ink);">${escapeHtml(app.incidentDate || '—')}</strong>
          </div>
        </div>
        <div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;">
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11px;color:var(--ink-faint);">Review Decision:</span>
            <span class="badge ${getReviewBadgeClass(reviewStatus)}" style="font-size:11px;padding:3px 8px;">
              ${escapeHtml(reviewStatus)}
            </span>
          </div>
          <div style="display:flex;align-items:center;gap:6px;">
            <span style="font-size:11px;color:var(--ink-faint);">Investigation Status:</span>
            <span class="badge ${getStatusBadgeClass(app.status)}" style="font-size:11px;padding:3px 8px;">
              ${escapeHtml(app.status)}
            </span>
          </div>
        </div>
      </div>

      <!-- Citizen Complainant Details -->
      <div style="margin-top:12px;display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;border-top:1px solid var(--line);padding-top:10px;font-size:12px;">
        <div>
          <span style="color:var(--ink-faint);">Complainant Name:</span><br>
          <strong style="color:var(--ink);">${escapeHtml(app.citizenName || 'Citizen')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Verified Mobile Number:</span><br>
          <strong class="mono" style="color:var(--primary);">${escapeHtml(app.citizenPhone || '—')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Incident Location:</span><br>
          <strong style="color:var(--ink);">${escapeHtml(app.location || '—')}</strong>
        </div>
        <div>
          <span style="color:var(--ink-faint);">Submitted Date &amp; Time:</span><br>
          <span>${fmtDate(app.createdAt)}</span>
        </div>
      </div>
    </div>

    <!-- Citizen Statement & Description -->
    <div style="margin-bottom:14px;border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--raised);">
      <div style="font-weight:600;font-size:12.5px;color:var(--ink);margin-bottom:6px;display:flex;align-items:center;gap:6px;">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
          <polyline points="14 2 14 8 20 8"/>
          <line x1="16" y1="13" x2="8" y2="13"/>
          <line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        Citizen Statement / Grievance Description
      </div>
      <div style="font-size:12.5px;color:var(--ink-muted);line-height:1.6;white-space:pre-wrap;">${escapeHtml(app.description)}</div>
    </div>

    <!-- Attached Evidence & Suspect Information Grid -->
    <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(260px, 1fr));gap:12px;margin-bottom:16px;">
      <!-- Attached Evidence Files -->
      <div style="border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--raised);">
        <div style="font-weight:600;font-size:12.5px;margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;">
          <span>Citizen Evidence Files (${(app.evidence || []).length})</span>
          <span style="font-size:10.5px;color:var(--ink-faint);">Click to inspect</span>
        </div>
        ${
          (app.evidence && app.evidence.length)
            ? `
            <div style="display:flex;flex-direction:column;gap:6px;max-height:160px;overflow-y:auto;">
              ${app.evidence.map(e => `
                <div style="display:flex;align-items:center;justify-content:space-between;border:1px solid var(--line);padding:6px 8px;border-radius:6px;background:var(--surface-secondary);font-size:11.5px;">
                  <div style="display:flex;align-items:center;gap:6px;overflow:hidden;">
                    ${e.dataUrl || e.previewUrl ? `
                      <img src="${e.dataUrl || e.previewUrl}" alt="Evidence" style="width:28px;height:28px;object-fit:cover;border-radius:4px;flex-shrink:0;" />
                    ` : `
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" style="flex-shrink:0;">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                      </svg>
                    `}
                    <div style="overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                      <div style="font-weight:600;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(e.name || e.fileName || 'Evidence File')}</div>
                      <div style="font-size:10px;color:var(--ink-faint);">${escapeHtml(e.type || 'file')}</div>
                    </div>
                  </div>
                  ${e.dataUrl || e.previewUrl ? `
                    <button type="button" class="btn ghost-sm" onclick="window.previewEvidenceFile('${e.id}')" style="padding:2px 8px;font-size:10.5px;flex-shrink:0;">
                      View
                    </button>
                  ` : ''}
                </div>
              `).join('')}
            </div>`
            : '<div style="font-size:12px;color:var(--ink-faint);padding:8px 0;">No evidence files attached by citizen.</div>'
        }
      </div>

      <!-- Suspect Information -->
      <div style="border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--raised);">
        <div style="font-weight:600;font-size:12.5px;margin-bottom:8px;">Reported Suspect Information</div>
        ${app.suspectInfo ? `
          <div style="font-size:12px;">
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:var(--ink-faint);">Name / Alias:</span>
              <strong>${escapeHtml(app.suspectInfo.name || 'Unknown')}</strong>
            </div>
            <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
              <span style="color:var(--ink-faint);">Gender / Approx Age:</span>
              <span>${escapeHtml(app.suspectInfo.gender || 'Unknown')} (${escapeHtml(app.suspectInfo.age ? `${app.suspectInfo.age} yrs` : 'Age ~')})</span>
            </div>
            <div style="margin-top:6px;background:var(--surface-secondary);padding:6px 8px;border-radius:6px;font-size:11.5px;color:var(--ink-muted);">
              <strong>Description:</strong> ${escapeHtml(app.suspectInfo.description || 'No physical markers logged.')}
            </div>
          </div>
        ` : '<div style="font-size:12px;color:var(--ink-faint);padding:8px 0;">No suspect details provided.</div>'}
      </div>
    </div>

    <!-- Police Suggested Legal Provisions Section (Advisory Decision Support) -->
    ${renderLegalProvisionsSection(app)}

    <!-- Police Audit Trail & Review History -->
    <div style="border:1px solid var(--line);border-radius:10px;padding:12px;margin-bottom:16px;background:var(--surface-secondary);">
      <div style="font-weight:600;font-size:12.5px;margin-bottom:8px;color:var(--ink);">Audit Trail &amp; Status Logs</div>
      <div style="display:flex;flex-direction:column;gap:6px;max-height:130px;overflow-y:auto;font-size:11.5px;">
        ${
          history.length
            ? history.map(h => `
              <div style="display:flex;justify-content:space-between;align-items:flex-start;background:var(--raised);padding:6px 10px;border-radius:6px;border:1px solid var(--line);">
                <div>
                  <strong>${escapeHtml(h.action || 'Action')}</strong> by <span style="color:var(--primary);font-weight:600;">${escapeHtml(h.officerName || 'Police Officer')}</span>
                  <div style="color:var(--ink-muted);margin-top:2px;">"${escapeHtml(h.remarks || h.reason || '')}"</div>
                  ${h.internalRemarks ? `<div style="color:var(--amber);font-size:10.5px;margin-top:1px;">🔒 Internal note: ${escapeHtml(h.internalRemarks)}</div>` : ''}
                </div>
                <div class="mono" style="font-size:10.5px;color:var(--ink-faint);white-space:nowrap;margin-left:8px;">${fmtDate(h.timestamp)}</div>
              </div>
            `).join('')
            : '<div style="color:var(--ink-faint);font-size:11.5px;">Initial complaint record created.</div>'
        }
      </div>
    </div>

    <!-- ==================== POLICE WORKFLOW ACTION PANEL ==================== -->
    <div id="policeActionPanel" style="border-top:2px solid var(--line);padding-top:16px;margin-top:12px;">
      ${
        isPending
          ? `
          <!-- 1. PENDING REVIEW STATE CONTROLS -->
          <div style="background:var(--amber-soft);border:1px solid var(--amber);padding:14px;border-radius:10px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:8px;color:var(--amber);font-weight:700;font-size:13px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              APPLICATION AWAITING POLICE OFFICER REVIEW &amp; APPROVAL
            </div>
            <div style="font-size:12px;color:var(--ink);margin-top:4px;">
              As an authorized Police Officer, please evaluate this citizen's grievance. Approving will forward the case into active investigation and notify the citizen. Rejecting requires a mandatory legal/factual reason.
            </div>
          </div>

          <!-- Police Review Remarks Fields -->
          <div class="field">
            <label>Public Remarks (Visible to Citizen) *</label>
            <input type="text" id="pendingReviewPublicRemarks" class="raised-sm" value="Application reviewed and verified by duty officer. Approved for active investigation." placeholder="Enter public remarks for citizen..." style="width:100%;">
          </div>

          <div class="field" style="margin-top:10px;">
            <label>Police-Only Internal Notes (🔒 Confidential — Not Visible to Citizen)</label>
            <input type="text" id="pendingReviewInternalRemarks" class="raised-sm" placeholder="e.g. Jurisdiction verified, CCTV team notified, patrolling beat 4..." style="width:100%;">
          </div>

          <!-- Rejection Reason Form (Hidden by default, toggled if reject clicked) -->
          <div id="rejectionReasonBox" style="display:none;background:var(--red-soft);border:1px solid var(--red);padding:12px;border-radius:8px;margin:12px 0;">
            <label style="color:var(--red);font-weight:700;display:block;margin-bottom:4px;">Mandatory Reason for Rejection *</label>
            <textarea id="rejectionReasonInput" rows="2" placeholder="Provide clear reason why complaint is being rejected (e.g. Non-cognizable civil matter, duplicate complaint, false submission)..." style="width:100%;border:1px solid var(--red);border-radius:6px;padding:8px;"></textarea>
            <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:8px;">
              <button type="button" class="btn ghost-sm" onclick="document.getElementById('rejectionReasonBox').style.display='none'">Cancel</button>
              <button type="button" class="btn danger" onclick="window.confirmRejectApplication('${app.id}')">Confirm Rejection</button>
            </div>
          </div>

          <!-- Pending Action Buttons -->
          <div class="modal-actions" style="justify-content:space-between;margin-top:16px;">
            <button type="button" class="btn ghost" onclick="closeModal('policeReviewModal')">Cancel</button>
            <div style="display:flex;gap:10px;">
              <button type="button" class="btn danger" onclick="document.getElementById('rejectionReasonBox').style.display='block'; document.getElementById('rejectionReasonInput').focus();">
                ✕ Reject Application
              </button>
              <button type="button" class="btn primary" onclick="window.confirmApproveApplication('${app.id}')" style="background:var(--green);border-color:var(--green);">
                ✓ Approve Application
              </button>
            </div>
          </div>
        `
          : isApproved
          ? `
          <!-- 2. APPROVED STATE CONTROLS: INVESTIGATION MILESTONES -->
          <div style="background:var(--green-soft);border:1px solid var(--green);padding:12px;border-radius:8px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:6px;color:var(--green);font-weight:700;font-size:13px;">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              APPLICATION APPROVED &amp; ACTIVE
            </div>
            <div style="font-size:12px;color:var(--ink);margin-top:2px;">
              Approved by: <strong>${escapeHtml(app.approvedBy || 'Duty Officer')}</strong> on ${fmtDate(app.approvedAt || app.lastUpdated)}. You can update ongoing investigation status and remarks below.
            </div>
          </div>

          <form id="investigationUpdateForm" onsubmit="window.saveInvestigationProgress(event, '${app.id}')">
            <div class="field">
              <label>Update Investigation Status *</label>
              <select id="investigationStatusSelect" required style="width:100%;">
                <option value="Under Review" ${app.status === 'Under Review' ? 'selected' : ''}>Under Review (Assigned to Station)</option>
                <option value="Investigation in Progress" ${app.status === 'Investigation in Progress' ? 'selected' : ''}>Investigation in Progress (Active Field &amp; Evidence Work)</option>
                <option value="Action Taken" ${app.status === 'Action Taken' ? 'selected' : ''}>Action Taken (Recovery / Notice Issued / Suspect Questioned)</option>
                <option value="Resolved" ${app.status === 'Resolved' ? 'selected' : ''}>Resolved (Investigation Concluded &amp; Closed)</option>
                <option value="Closed" ${app.status === 'Closed' ? 'selected' : ''}>Closed (Formally Archiving Case)</option>
              </select>
            </div>

            <div class="field" style="margin-top:10px;">
              <label>Citizen Update Remarks *</label>
              <textarea id="investigationPublicRemarks" rows="2" placeholder="Enter progress update for citizen..." required style="width:100%;">${escapeHtml(app.policeRemarks || '')}</textarea>
            </div>

            <div class="field" style="margin-top:10px;">
              <label>Police-Only Internal Notes (🔒 Confidential)</label>
              <input type="text" id="investigationInternalRemarks" class="raised-sm" value="${escapeHtml(app.internalRemarks || '')}" placeholder="Confidential officer notes..." style="width:100%;">
            </div>

            <div class="modal-actions" style="margin-top:16px;">
              <button type="button" class="btn ghost" onclick="closeModal('policeReviewModal')">Close</button>
              <button type="submit" class="btn primary">Update Investigation Progress</button>
            </div>
          </form>
        `
          : `
          <!-- 3. REJECTED STATE DISPLAY -->
          <div style="background:var(--red-soft);border:1px solid var(--red);padding:14px;border-radius:10px;margin-bottom:14px;">
            <div style="display:flex;align-items:center;gap:6px;color:var(--red);font-weight:700;font-size:13px;">
              ✕ APPLICATION REJECTED
            </div>
            <div style="font-size:12.5px;color:var(--ink);margin-top:4px;">
              <strong>Reason for Rejection:</strong> ${escapeHtml(app.rejectionReason || app.policeRemarks || 'Does not meet jurisdiction or threshold.')}
            </div>
            <div style="font-size:11.5px;color:var(--ink-faint);margin-top:4px;">
              Rejected by: ${escapeHtml(app.rejectedBy || 'Duty Officer')} on ${fmtDate(app.rejectedAt || app.lastUpdated)}
            </div>
          </div>

          <div class="modal-actions" style="justify-content:space-between;margin-top:16px;">
            <button type="button" class="btn ghost" onclick="closeModal('policeReviewModal')">Close</button>
            <button type="button" class="btn ghost-sm" onclick="window.reopenForReview('${app.id}')">
              Re-Evaluate Application
            </button>
          </div>
        `
      }
    </div>
  `;

  openModal('policeReviewModal');
}

/* ==========================================================================
   POLICE REVIEW ACTION HANDLERS
   ========================================================================== */
export async function confirmApproveApplication(appId) {
  const publicRemarksEl = document.getElementById('pendingReviewPublicRemarks');
  const internalRemarksEl = document.getElementById('pendingReviewInternalRemarks');

  const remarks = publicRemarksEl ? publicRemarksEl.value.trim() : '';
  const internalRemarks = internalRemarksEl ? internalRemarksEl.value.trim() : '';
  const officerName = DATA.meta.analyst || 'Inspector R. Verma';

  await approveCitizenApplication(appId, {
    remarks,
    internalRemarks,
    officerName
  });

  closeModal('policeReviewModal');
  showToast(`Application approved successfully. Forwarded to Active Investigation.`);
  if (window.render) window.render();
}

export async function confirmRejectApplication(appId) {
  const reasonEl = document.getElementById('rejectionReasonInput');
  const internalRemarksEl = document.getElementById('pendingReviewInternalRemarks');

  const reason = reasonEl ? reasonEl.value.trim() : '';
  if (!reason) {
    showToast('Please provide a Reason for Rejection.');
    if (reasonEl) reasonEl.focus();
    return;
  }

  const internalRemarks = internalRemarksEl ? internalRemarksEl.value.trim() : '';
  const officerName = DATA.meta.analyst || 'Inspector R. Verma';

  await rejectCitizenApplication(appId, {
    reason,
    internalRemarks,
    officerName
  });

  closeModal('policeReviewModal');
  showToast(`Application rejected. Status and reason updated.`);
  if (window.render) window.render();
}

export async function saveInvestigationProgress(e, appId) {
  if (e) e.preventDefault();

  const statusSelect = document.getElementById('investigationStatusSelect');
  const remarksInput = document.getElementById('investigationPublicRemarks');
  const internalInput = document.getElementById('investigationInternalRemarks');

  const newStatus = statusSelect ? statusSelect.value : 'Investigation in Progress';
  const remarks = remarksInput ? remarksInput.value.trim() : '';
  const internalRemarks = internalInput ? internalInput.value.trim() : '';
  const officerName = DATA.meta.analyst || 'Investigating Officer';

  await updateApplicationStatus(appId, newStatus, remarks, internalRemarks, officerName);
  closeModal('policeReviewModal');
  showToast(`Investigation progress updated to "${newStatus}".`);
  if (window.render) window.render();
}

export async function reopenForReview(appId) {
  const app = (DATA.applications || []).find(a => a.id === appId || a.num === appId);
  if (!app) return;

  app.reviewStatus = 'Pending Review';
  app.status = 'Submitted';
  app.rejectionReason = null;
  app.policeRemarks = 'Re-opened for police officer evaluation.';
  app.lastUpdated = new Date().toISOString();

  if (!Array.isArray(app.statusHistory)) app.statusHistory = [];
  app.statusHistory.push({
    status: 'Submitted',
    timestamp: app.lastUpdated,
    remarks: 'Application re-opened for police review.'
  });

  await persist();
  openPoliceReviewComplaintModal(appId);
  showToast('Application re-opened for review.');
  if (window.render) window.render();
}

export function getStatusBadgeClass(status) {
  switch (status) {
    case 'Submitted': return 'open';
    case 'Under Review': return 'critical';
    case 'Investigation in Progress': return 'critical';
    case 'Action Taken': return 'open';
    case 'Resolved': return 'closed';
    case 'Closed': return 'closed';
    case 'Rejected': return 'critical';
    default: return 'cold';
  }
}

export function getReviewBadgeClass(reviewStatus) {
  switch (reviewStatus) {
    case 'Approved': return 'closed';
    case 'Pending Review': return 'critical';
    case 'Rejected': return 'critical';
    default: return 'cold';
  }
}

export const savePoliceComplaintReview = saveInvestigationProgress;

window.switchCasesTab = function(tab) {
  setCasesActiveTab(tab);
  if (window.render) window.render();
};

window.setComplaintFilterStatus = function(status) {
  setComplaintFilterStatus(status);
  if (window.render) window.render();
};

window.openPoliceReviewComplaintModal = openPoliceReviewComplaintModal;
window.confirmApproveApplication = confirmApproveApplication;
window.confirmRejectApplication = confirmRejectApplication;
window.saveInvestigationProgress = saveInvestigationProgress;
window.reopenForReview = reopenForReview;
