/**
 * CrimeIntel AI - Role-Based Law Enforcement & Citizen Portal Orchestrator
 */

import {
  DATA,
  loadData,
  getCase,
  allEvidence,
  allSuspects,
  logActivity,
  persist,
  getAllApplications,
  switchPoliceProfile,
  switchCitizenProfile,
  deleteUserProfile,
  isAccountLoggedIn,
  getActiveSessions,
  removeAccountFromActiveSessions,
  addAccountToActiveSessions,
  registerNewUser,
  findUserAccount,
  hideProfileFromQuickList,
  unhideProfileFromQuickList,
  isProfileHidden,
  getHiddenProfiles
} from './data.js';

import {
  closeModal,
  openModal,
  escapeHtml,
  fmtDate,
  initials,
  scoreLabel,
  scoreColor,
  statusColor,
  activityIcon,
  showToast,
  populateCaseSelect
} from './ui.js';

import {
  computeSuspectScore,
  computeCrossCase,
  runAiAnalysis,
  drawWeb
} from './correlation.js';

import {
  caseFilterStatus,
  setCaseFilterStatus,
  viewCasesList,
  viewCaseDetail,
  handleCreateCase,
  handleStatusChange,
  savePoliceComplaintReview
} from './cases.js';

import {
  evFilterType,
  evFilterCase,
  setEvFilterType,
  setEvFilterCase,
  viewEvidenceLog,
  handleSaveEvidence,
  handlePoliceFileUpload,
  resetPolicePendingEvidenceState,
  removePolicePendingAttachment,
  addPolicePendingAttachment
} from './evidence.js';

import {
  expandedSuspectId,
  setExpandedSuspectId,
  toggleExpandedSuspect,
  suFilterCase,
  setSuFilterCase,
  viewSuspectsGlobal,
  viewSuspectProfile,
  handleSaveSuspect
} from './suspects.js';

import {
  viewReports,
  handleCopyReport,
  handlePrintReport
} from './reports.js';

import {
  viewCitizenDashboard,
  viewCitizenApplications,
  viewCitizenTracking,
  viewCitizenEvidenceLog,
  viewCitizenSuspectLog,
  openComplaintModal,
  startSpeechRecognition,
  stopSpeechRecognition,
  openCameraCaptureModal,
  captureCameraSnapshot,
  retakeCameraSnapshot,
  attachCameraSnapshot,
  closeCameraModal,
  handleFileUpload,
  removePendingAttachment,
  submitCitizenComplaint,
  previewEvidenceFile
} from './citizen.js';

import { route, parseHash, go, initRouter } from './router.js';
import { handleLogin, initAuth } from './auth.js';
import { initTheme, setTheme, toggleTheme } from './theme.js';

/* ============ EXPOSE GLOBALS FOR COMPATIBILITY ============ */
window.handleLogin = e => handleLogin(e, () => initApp());
window.closeModal = closeModal;
window.openModal = openModal;
window.getCase = getCase;
window.drawWeb = drawWeb;
window.go = go;
window.runAiAnalysis = (caseId) => runAiAnalysis(caseId, render);
window.initApp = initApp;
window.setTheme = setTheme;
window.toggleTheme = toggleTheme;
window.render = render;
window.handleLogout = handleLogout;
window.toggleProfileDropdown = toggleProfileDropdown;

/* ============ POLICE DASHBOARD VIEW ============ */
export function viewDashboard() {
  const cases = DATA.cases || [];
  const activeCases = cases.filter(c => c.status !== 'closed' && c.status !== 'resolved');
  const ev = allEvidence();
  const sus = allSuspects();
  const applications = getAllApplications();
  const scoredSuspects = sus.filter(s => s.score != null);
  const avgScore = scoredSuspects.length
    ? Math.round(
        scoredSuspects.reduce((a, s) => a + s.score, 0) / scoredSuspects.length
      )
    : 0;
  const highPriority = sus.filter(s => s.score >= 70).length;
  const statuses = [
    { key: 'critical', label: 'Critical' },
    { key: 'open', label: 'Open' },
    { key: 'cold', label: 'Cold' },
    { key: 'resolved', label: 'Resolved' }
  ];
  const statusCounts = statuses.map(
    s => cases.filter(c => s.key === 'resolved' ? (c.status === 'closed' || c.status === 'resolved') : c.status === s.key).length
  );

  const alerts = DATA.activity.filter(a => a.kind === 'alert').slice(0, 6);
  const recent = DATA.activity.slice(0, 8);

  return `
    <div class="crumb">Law Enforcement Headquarters / Overview</div>
    <div class="page-title">
      <div>
        <h2>Police Intelligence Dashboard</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);margin-top:2px;">Metro Police Department &amp; Crime Analysis Unit</div>
      </div>
      <div class="actions">
        <button class="btn primary" id="qNewCase">+ Open New Case</button>
      </div>
    </div>
    
    <div class="stat-grid">
      <div class="stat-card raised">
        <div class="label">Active FIR Cases</div>
        <div class="value">${activeCases.length}</div>
        <div class="delta">${cases.filter(c => c.status === 'critical').length} critical · ${cases.filter(c => c.status === 'closed' || c.status === 'resolved').length} resolved</div>
      </div>
      <div class="stat-card raised">
        <div class="label">Citizen Grievances</div>
        <div class="value" style="color:var(--primary);">${applications.length}</div>
        <div class="delta">${applications.filter(a => a.status === 'Under Review' || a.status === 'Submitted').length} pending review</div>
      </div>
      <div class="stat-card raised">
        <div class="label">Evidence Logged</div>
        <div class="value">${ev.length}</div>
        <div class="delta">forensic, digital &amp; physical</div>
      </div>
      <div class="stat-card raised">
        <div class="label">Suspects Tracked</div>
        <div class="value">${sus.length}</div>
        <div class="delta">${highPriority} high correlation</div>
      </div>
    </div>

    <div class="dash-grid">
      <div>
        <!-- Recent Complaints from Citizens -->
        <div class="panel raised" style="margin-bottom:16px;">
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">
            <h3>Recent Citizen Complaints</h3>
            <a href="#cases" onclick="window.switchCasesTab('complaints')" style="font-size:12px;color:var(--primary);text-decoration:none;">View All (${applications.length}) →</a>
          </div>
          ${
            applications.length
              ? `
              <div style="overflow-x:auto;">
                <table class="data-table" style="width:100%;">
                  <thead>
                    <tr>
                      <th>App ID</th>
                      <th>Complainant</th>
                      <th>Incident Title</th>
                      <th>Category</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${applications.slice(0, 4).map(app => `
                      <tr>
                        <td><strong class="mono" style="color:var(--primary);">${escapeHtml(app.num || app.id)}</strong></td>
                        <td>${escapeHtml(app.citizenName || 'Citizen')}</td>
                        <td>${escapeHtml(app.title)}</td>
                        <td><span class="tag-chip">${escapeHtml(app.category)}</span></td>
                        <td><span class="badge ${getStatusBadgeClass(app.status)}">${escapeHtml(app.status)}</span></td>
                        <td>
                          <button class="btn primary" onclick="window.openPoliceReviewComplaintModal('${app.id}')" style="padding:2px 8px;font-size:11px;">Review</button>
                        </td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>`
              : `<div class="empty-state" style="padding:16px;">No citizen complaints received.</div>`
          }
        </div>

        <!-- Recent Activity Feed -->
        <div class="panel raised">
          <h3>Investigative Activity Feed</h3>
          ${
            recent.length
              ? recent
                  .map(
                    a => `
            <div class="activity-row">
              <div class="act-icon ${a.kind}">${activityIcon(a.kind)}</div>
              <div class="act-text">${escapeHtml(a.text)}</div>
              <div class="act-time">${fmtDate(a.ts)}</div>
            </div>`
                  )
                  .join('')
              : '<div class="empty-state">No activity yet.</div>'
          }
        </div>
      </div>

      <div>
        <!-- Case Status Breakdown -->
        <div class="panel raised">
          <h3>Case Status Breakdown</h3>
          ${statuses
            .map(
              (s, i) => `
            <div class="status-bar-row">
              <div class="lbl">${s.label}</div>
              <div class="status-bar-track"><div class="status-bar-fill" style="width:${cases.length ? (statusCounts[i] / cases.length) * 100 : 0}%; background:${statusColor(s.key)};"></div></div>
              <div class="cnt">${statusCounts[i]}</div>
            </div>`
            )
            .join('')}
        </div>

        <!-- AI Correlation Alerts -->
        <div class="panel raised" style="margin-top:16px;">
          <h3>AI Correlation Alerts <span class="badge critical" style="text-transform:none;">${alerts.length}</span></h3>
          ${
            alerts.length
              ? alerts
                  .map(
                    a => `
            <div class="alert-row ${a.text.includes('Cross-case') ? 'cross' : 'high'}">
              <span></span><div>${escapeHtml(a.text)} ${a.caseId ? `— <a href="#case/${a.caseId}/suspects">view case</a>` : ''}</div>
            </div>`
                  )
                  .join('')
              : '<div class="empty-state">No active cross-case alerts. Run AI Correlation to detect patterns.</div>'
          }
        </div>
      </div>
    </div>
  `;
}

/* ============ SIDEBAR NAVIGATION RENDERER ============ */
export function updateSidebarForRole(role) {
  const sidenav = document.querySelector('.sidenav');
  if (!sidenav) return;

  const isCitizen = role === 'Citizen';
  const brandSub = sidenav.querySelector('.brand .sub');
  const footerText = sidenav.querySelector('.sidenav-footer');

  if (brandSub) {
    brandSub.textContent = isCitizen ? 'Public Grievance Portal' : 'Analytics & Intelligence';
  }
  if (footerText) {
    footerText.textContent = isCitizen ? 'v2.4.0 · citizen public session' : 'v2.4.0 · authorized police session';
  }

  // Remove existing nav items except brand and footer
  const existingItems = sidenav.querySelectorAll('.nav-item');
  existingItems.forEach(item => item.remove());

  const navContainer = document.createElement('div');
  navContainer.className = 'nav-items-wrapper';

  let navItemsHtml = '';

  if (isCitizen) {
    navItemsHtml = `
      <div class="nav-item ${route.view === 'dashboard' || route.view === 'citizen-dashboard' ? 'active' : ''}" data-nav="dashboard">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
          <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
          <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
          <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Dashboard
      </div>
      <div class="nav-item ${route.view === 'my-applications' ? 'active' : ''}" data-nav="my-applications">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" stroke="currentColor" stroke-width="1.8"/>
          <polyline points="14 2 14 8 20 8" stroke="currentColor" stroke-width="1.8"/>
          <line x1="16" y1="13" x2="8" y2="13" stroke="currentColor" stroke-width="1.8"/>
          <line x1="16" y1="17" x2="8" y2="17" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        My Applications
      </div>
      <div class="nav-item ${route.view === 'tracking' ? 'active' : ''}" data-nav="tracking">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="1.8"/>
          <polyline points="12 6 12 12 16 14" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Application Tracking
      </div>
      <div class="nav-item ${route.view === 'evidence' ? 'active' : ''}" data-nav="evidence">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 2h6l1 4H8l1-4z" stroke="currentColor" stroke-width="1.8"/>
          <rect x="5" y="6" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Evidence Log
      </div>
      <div class="nav-item ${route.view === 'suspects' ? 'active' : ''}" data-nav="suspects">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.8"/>
          <path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Suspect Log
      </div>
    `;
  } else {
    navItemsHtml = `
      <div class="nav-item ${route.view === 'dashboard' ? 'active' : ''}" data-nav="dashboard">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <rect x="3" y="3" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
          <rect x="14" y="3" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
          <rect x="14" y="12" width="7" height="9" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
          <rect x="3" y="16" width="7" height="5" rx="1.5" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Dashboard
      </div>
      <div class="nav-item ${route.view === 'cases' || route.view === 'case' ? 'active' : ''}" data-nav="cases">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Cases
      </div>
      <div class="nav-item ${route.view === 'evidence' ? 'active' : ''}" data-nav="evidence">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M9 2h6l1 4H8l1-4z" stroke="currentColor" stroke-width="1.8"/>
          <rect x="5" y="6" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Evidence Log
      </div>
      <div class="nav-item ${route.view === 'suspects' || route.view === 'suspect' ? 'active' : ''}" data-nav="suspects">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <circle cx="12" cy="8" r="3.4" stroke="currentColor" stroke-width="1.8"/>
          <path d="M5 21c0-4 3-6.5 7-6.5s7 2.5 7 6.5" stroke="currentColor" stroke-width="1.8"/>
        </svg>
        Suspects
        <span class="nav-badge" id="suspectNavBadge" style="display:none;">0</span>
      </div>
      <div class="nav-item ${route.view === 'reports' ? 'active' : ''}" data-nav="reports">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
          <path d="M6 2h9l5 5v15H6V2z" stroke="currentColor" stroke-width="1.8"/>
          <path d="M9 12h6M9 16h6M9 8h3" stroke="currentColor" stroke-width="1.6"/>
        </svg>
        Reports
      </div>
    `;
  }

  const brandEl = sidenav.querySelector('.brand');
  brandEl.insertAdjacentHTML('afterend', navItemsHtml);

  // Wire click events on newly inserted nav items
  sidenav.querySelectorAll('.nav-item').forEach(n => {
    n.addEventListener('click', () => go(n.dataset.nav));
  });
}

/* ============ MASTER RENDER ============ */
export function render() {
  if (!DATA) return;

  const app = document.getElementById('app');
  const loginScreen = document.getElementById('login-screen');

  // If user is not authenticated, ensure app is hidden and initial login screen is shown
  if (!DATA.meta || !DATA.meta.analyst || !DATA.meta.role) {
    if (app) {
      app.classList.remove('visible');
      app.style.display = 'none';
    }
    if (loginScreen) {
      loginScreen.style.display = 'flex';
      loginScreen.style.opacity = '1';
      loginScreen.style.transform = 'scale(1)';
      loginScreen.style.pointerEvents = 'auto';
    }
    return;
  }

  if (app) {
    app.style.display = '';
    app.classList.add('visible');
  }
  if (loginScreen) {
    loginScreen.style.display = 'none';
  }

  const role = DATA.meta.role || 'Police Officer';
  const isCitizen = role === 'Citizen';

  // Update navigation items for the role
  updateSidebarForRole(role);

  // Update top analyst/citizen chip
  const analystNameEl = document.getElementById('analystName');
  const analystAvatarEl = document.getElementById('analystAvatar');
  if (analystNameEl) analystNameEl.textContent = DATA.meta.analyst || (isCitizen ? 'Citizen' : 'Officer');
  if (analystAvatarEl) analystAvatarEl.textContent = initials(DATA.meta.analyst || 'AR');

  // Update high priority badge if police
  const highCount = allSuspects().filter(s => s.score >= 70).length;
  const badge = document.getElementById('suspectNavBadge');
  if (badge) {
    if (!isCitizen && highCount > 0) {
      badge.style.display = 'inline-block';
      badge.textContent = highCount;
    } else {
      badge.style.display = 'none';
    }
  }

  const el = document.getElementById('view');
  if (!el) return;

  // View Routing Dispatcher based on active Role
  if (isCitizen) {
    if (route.view === 'dashboard' || route.view === 'citizen-dashboard') {
      el.innerHTML = viewCitizenDashboard();
    } else if (route.view === 'my-applications') {
      el.innerHTML = viewCitizenApplications();
    } else if (route.view === 'tracking') {
      el.innerHTML = viewCitizenTracking(route.id);
    } else if (route.view === 'evidence' || route.view === 'citizen-evidence') {
      el.innerHTML = viewCitizenEvidenceLog();
    } else if (route.view === 'suspects' || route.view === 'citizen-suspects') {
      el.innerHTML = viewCitizenSuspectLog();
    } else {
      // Graceful fallback to citizen dashboard
      el.innerHTML = viewCitizenDashboard();
    }
  } else {
    // Police Officer Portal
    if (route.view === 'dashboard') {
      el.innerHTML = viewDashboard();
    } else if (route.view === 'cases') {
      el.innerHTML = viewCasesList();
    } else if (route.view === 'case' && route.id) {
      el.innerHTML = viewCaseDetail(route.id, route.tab || 'overview');
    } else if (route.view === 'evidence') {
      el.innerHTML = viewEvidenceLog();
    } else if (route.view === 'suspects') {
      el.innerHTML = viewSuspectsGlobal();
    } else if (route.view === 'suspect' && route.id) {
      el.innerHTML = viewSuspectProfile(route.id);
    } else if (route.view === 'reports') {
      el.innerHTML = viewReports(route.id);
    } else {
      el.innerHTML = viewDashboard();
    }
  }

  wireDynamicHandlers();

  // If on web correlation tab, draw the network immediately
  if (!isCitizen && route.view === 'case' && route.id && route.tab === 'web') {
    const c = getCase(route.id);
    if (c) {
      setTimeout(() => drawWeb(c), 0);
    }
  }
}

/* ============ EVENT WIRING ============ */
export function wireDynamicHandlers() {
  document.querySelectorAll('[data-case]').forEach(node => {
    if (node.classList.contains('case-card')) {
      node.addEventListener('click', () => go('case/' + node.dataset.case));
    }
  });

  document.querySelectorAll('[data-report]').forEach(node =>
    node.addEventListener('click', () => go('reports/' + node.dataset.report))
  );

  document.querySelectorAll('[data-suspect]').forEach(node =>
    node.addEventListener('click', () => go('suspect/' + node.dataset.suspect))
  );

  document.querySelectorAll('[data-casetab]').forEach(node =>
    node.addEventListener('click', () =>
      go(`case/${route.id}/${node.dataset.casetab}`)
    )
  );

  document.querySelectorAll('[data-status]').forEach(node =>
    node.addEventListener('click', () => {
      setCaseFilterStatus(node.dataset.status);
      render();
    })
  );

  document.querySelectorAll('[data-evtype]').forEach(node =>
    node.addEventListener('click', () => {
      setEvFilterType(node.dataset.evtype);
      render();
    })
  );

  const evCaseFilter = document.getElementById('evCaseFilter');
  if (evCaseFilter) {
    evCaseFilter.addEventListener('change', e => {
      setEvFilterCase(e.target.value);
      render();
    });
  }

  const suCaseFilter = document.getElementById('suCaseFilter');
  if (suCaseFilter) {
    suCaseFilter.addEventListener('change', e => {
      setSuFilterCase(e.target.value);
      render();
    });
  }

  const qNewCase =
    document.getElementById('qNewCase') || document.getElementById('qNewCase2');
  if (qNewCase) {
    qNewCase.addEventListener('click', () => openModal('caseOverlay'));
  }

  const btnOpenReport = document.getElementById('btnOpenReportModal');
  if (btnOpenReport) {
    btnOpenReport.addEventListener('click', () => openComplaintModal());
  }

  const statusSelect = document.getElementById('statusSelect');
  if (statusSelect) {
    statusSelect.addEventListener('change', e => {
      handleStatusChange(route.id, e.target.value, render);
    });
  }

  const addEvBtn =
    document.getElementById('addEvBtn') ||
    document.getElementById('addEvBtnGlobal');
  if (addEvBtn) {
    addEvBtn.addEventListener('click', () => {
      populateCaseSelect('evCase', addEvBtn.dataset.case || route.id);
      const evCaseField = document.getElementById('evCaseField');
      if (evCaseField) evCaseField.style.display = 'block';
      resetPolicePendingEvidenceState();
      openModal('evOverlay');
    });
  }

  const addSuBtn =
    document.getElementById('addSuBtn') ||
    document.getElementById('addSuBtnGlobal');
  if (addSuBtn) {
    addSuBtn.addEventListener('click', () => {
      populateCaseSelect('suCase', addSuBtn.dataset.case || route.id);
      openModal('suOverlay');
    });
  }

  const runAiBtn = document.getElementById('runAiBtn');
  if (runAiBtn) {
    runAiBtn.addEventListener('click', () => {
      runAiAnalysis(runAiBtn.dataset.case, render);
    });
  }

  document.querySelectorAll('[data-toggle]').forEach(node => {
    node.addEventListener('click', () => {
      toggleExpandedSuspect(node.dataset.toggle);
      render();
    });
  });

  const copyBtn = document.getElementById('copyReportBtn');
  if (copyBtn) {
    copyBtn.addEventListener('click', handleCopyReport);
  }

  const printBtn = document.getElementById('printReportBtn');
  if (printBtn) {
    printBtn.addEventListener('click', handlePrintReport);
  }
}

/* ============ CLOCK ============ */
export function tickClock() {
  const now = new Date();
  const timeEl = document.getElementById('clockTime');
  const dateEl = document.getElementById('clockDate');
  if (timeEl) {
    timeEl.textContent = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
  if (dateEl) {
    dateEl.textContent = now.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}

/* ============ USER PROFILE & MULTI-OFFICER MANAGEMENT ============ */
export function toggleProfileDropdown() {
  const dropdown = document.getElementById('profileDropdown');
  if (!dropdown) return;

  const isVisible = dropdown.classList.contains('show');
  if (isVisible) {
    dropdown.classList.remove('show');
    return;
  }

  const role = DATA.meta.role || 'Police Officer';
  const isCitizen = role === 'Citizen';
  const name = DATA.meta.analyst || (isCitizen ? 'Citizen User' : 'Officer');
  const email = DATA.meta.email || '';
  const phone = DATA.meta.phone || '';
  const registeredOfficers = (DATA.users || []).filter(u => u.role === 'Police Officer' && !isProfileHidden(u));
  const registeredCitizens = (DATA.users || []).filter(u => u.role === 'Citizen' && !isProfileHidden(u));

  let switchListHtml = '';
  if (!isCitizen) {
    switchListHtml = `
      <div class="pd-section" style="border-top:1px solid var(--line);padding:10px 0 6px 0;margin-top:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding:0 12px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-faint);font-weight:600;">
            Switch Officer Profile (${registeredOfficers.length})
          </div>
          <div style="font-size:9.5px;color:var(--ink-faint);" title="Click '✕' to temporarily remove from device quick list without deleting account">Quick List</div>
        </div>
        <div style="max-height:160px;overflow-y:auto;">
          ${registeredOfficers.length ? registeredOfficers.map(o => {
            const isCurrent = (o.email && o.email === email) || (o.fullName === name);
            const loggedIn = isAccountLoggedIn(o);
            return `
              <div class="pd-officer-item" onclick="window.switchPoliceOfficerProfile('${escapeHtml(o.id || o.email)}')" style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;cursor:pointer;background:${isCurrent ? 'var(--surface-secondary)' : 'transparent'};border-radius:6px;margin:2px 4px;font-size:12px;transition:background 0.15s ease;">
                <div style="flex:1;min-width:0;padding-right:8px;">
                  <div style="font-weight:${isCurrent ? '600' : '400'};color:var(--ink);display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${loggedIn && !isCurrent ? '<span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;flex-shrink:0;" title="Active Session"></span>' : ''}
                    <span>${escapeHtml(o.fullName || o.name)}</span>
                  </div>
                  <div style="font-size:10px;color:var(--ink-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${escapeHtml(o.email || o.policeBadgeNumber || 'Police Officer')}</div>
                </div>
                <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                  ${isCurrent 
                    ? `<span class="badge open" style="font-size:9.5px;padding:1px 6px;">Active</span>` 
                    : loggedIn 
                      ? `<span style="font-size:11px;color:var(--primary);font-weight:600;">Switch</span>
                         <button type="button" title="Sign out this profile" onclick="event.stopPropagation(); window.logoutSpecificAccount('${escapeHtml(o.id || o.email)}')" style="background:none;border:none;cursor:pointer;color:var(--ink-faint);padding:2px 3px;display:flex;align-items:center;border-radius:4px;">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                         </button>` 
                      : `<span style="font-size:10.5px;color:var(--ink-muted);display:inline-flex;align-items:center;gap:3px;" title="Logged out - Password required">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Log In
                         </span>`
                  }
                  <button type="button" title="Temporarily remove from quick-switch list (account and data remain safe in DB)" onclick="event.stopPropagation(); window.temporarilyRemoveProfile('${escapeHtml(o.id || o.email)}', '${escapeHtml(o.fullName || o.name)}')" style="background:none;border:none;cursor:pointer;color:var(--ink-faint);padding:2px 3px;display:flex;align-items:center;border-radius:4px;opacity:0.75;" onmouseover="this.style.color='var(--critical)';this.style.opacity='1'" onmouseout="this.style.color='var(--ink-faint)';this.style.opacity='0.75'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('') : `<div style="padding:10px 14px;font-size:11px;color:var(--ink-faint);text-align:center;">No officer profiles in quick list.</div>`}
        </div>
        <button type="button" class="pd-action-btn" onclick="window.openAddAccountModal('Police Officer')" style="display:flex;align-items:center;gap:6px;width:calc(100% - 16px);margin:6px 8px 0 8px;padding:6px 10px;background:var(--surface-secondary);border:1px dashed var(--line);border-radius:6px;font-size:11px;color:var(--primary);cursor:pointer;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>+ Add / Restore Officer Account</span>
        </button>
      </div>
    `;
  } else {
    // Citizen Profile switching
    switchListHtml = `
      <div class="pd-section" style="border-top:1px solid var(--line);padding:10px 0 6px 0;margin-top:6px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;padding:0 12px;">
          <div style="font-size:10px;text-transform:uppercase;letter-spacing:0.05em;color:var(--ink-faint);font-weight:600;">
            Switch Citizen Account (${registeredCitizens.length})
          </div>
          <div style="font-size:9.5px;color:var(--ink-faint);" title="Click '✕' to temporarily remove from device quick list without deleting account">Quick List</div>
        </div>
        <div style="max-height:160px;overflow-y:auto;">
          ${registeredCitizens.length ? registeredCitizens.map(c => {
            const isCurrent = (c.phone && c.phone === phone) || (c.fullName === name);
            const loggedIn = isAccountLoggedIn(c);
            return `
              <div class="pd-officer-item" onclick="window.switchCitizenOfficerProfile('${escapeHtml(c.id || c.phone)}')" style="display:flex;align-items:center;justify-content:space-between;padding:7px 10px;cursor:pointer;background:${isCurrent ? 'var(--surface-secondary)' : 'transparent'};border-radius:6px;margin:2px 4px;font-size:12px;transition:background 0.15s ease;">
                <div style="flex:1;min-width:0;padding-right:8px;">
                  <div style="font-weight:${isCurrent ? '600' : '400'};color:var(--ink);display:flex;align-items:center;gap:5px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
                    ${loggedIn && !isCurrent ? '<span style="width:6px;height:6px;border-radius:50%;background:#10b981;display:inline-block;flex-shrink:0;" title="Active Session"></span>' : ''}
                    <span>${escapeHtml(c.fullName || c.name)}</span>
                  </div>
                  <div style="font-size:10px;color:var(--ink-faint);">${escapeHtml(c.phone || 'Citizen')}</div>
                </div>
                <div style="display:flex;align-items:center;gap:4px;flex-shrink:0;">
                  ${isCurrent 
                    ? `<span class="badge closed" style="font-size:9.5px;padding:1px 6px;">Active</span>` 
                    : loggedIn 
                      ? `<span style="font-size:11px;color:var(--primary);font-weight:600;">Switch</span>
                         <button type="button" title="Sign out this profile" onclick="event.stopPropagation(); window.logoutSpecificAccount('${escapeHtml(c.id || c.phone)}')" style="background:none;border:none;cursor:pointer;color:var(--ink-faint);padding:2px 3px;display:flex;align-items:center;border-radius:4px;">
                           <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
                         </button>` 
                      : `<span style="font-size:10.5px;color:var(--ink-muted);display:inline-flex;align-items:center;gap:3px;" title="Logged out - Password required">
                           <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Log In
                         </span>`
                  }
                  <button type="button" title="Temporarily remove from quick-switch list (account and data remain safe in DB)" onclick="event.stopPropagation(); window.temporarilyRemoveProfile('${escapeHtml(c.id || c.phone)}', '${escapeHtml(c.fullName || c.name)}')" style="background:none;border:none;cursor:pointer;color:var(--ink-faint);padding:2px 3px;display:flex;align-items:center;border-radius:4px;opacity:0.75;" onmouseover="this.style.color='var(--critical)';this.style.opacity='1'" onmouseout="this.style.color='var(--ink-faint)';this.style.opacity='0.75'">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
              </div>
            `;
          }).join('') : `<div style="padding:10px 14px;font-size:11px;color:var(--ink-faint);text-align:center;">No citizen accounts in quick list.</div>`}
        </div>
        <button type="button" class="pd-action-btn" onclick="window.openAddAccountModal('Citizen')" style="display:flex;align-items:center;gap:6px;width:calc(100% - 16px);margin:6px 8px 0 8px;padding:6px 10px;background:var(--surface-secondary);border:1px dashed var(--line);border-radius:6px;font-size:11px;color:var(--primary);cursor:pointer;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          <span>+ Add / Restore Citizen Account</span>
        </button>
      </div>
    `;
  }

  dropdown.innerHTML = `
    <div class="pd-header" style="padding:12px;border-bottom:1px solid var(--line);">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:6px;">
        <div class="avatar" style="width:32px;height:32px;font-size:12px;background:var(--primary);color:#fff;display:flex;align-items:center;justify-content:center;border-radius:50%;font-weight:bold;">
          ${initials(name)}
        </div>
        <div>
          <div class="pd-name" style="font-size:13px;font-weight:600;color:var(--ink);">${escapeHtml(name)}</div>
          <div class="pd-role"><span class="badge ${isCitizen ? 'closed' : 'open'}" style="font-size:10px;padding:1px 6px;">${escapeHtml(role)}</span></div>
        </div>
      </div>
      ${phone ? `<div class="pd-info" style="font-size:11px;color:var(--ink-muted);margin-top:2px;">Phone: ${escapeHtml(phone)}</div>` : ''}
      ${email ? `<div class="pd-info" style="font-size:11px;color:var(--ink-muted);margin-top:2px;">Email: ${escapeHtml(email)}</div>` : ''}
    </div>
    
    ${switchListHtml}

    <div style="padding:8px;border-top:1px solid var(--line);display:flex;flex-direction:column;gap:4px;">
      <button type="button" class="pd-danger-btn" onclick="window.confirmDeleteUserProfile()" style="display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;background:transparent;border:none;border-radius:6px;font-size:11.5px;color:var(--critical);cursor:pointer;text-align:left;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
        <span>Delete Account Profile</span>
      </button>

      <button type="button" class="pd-logout" onclick="window.handleLogout()" style="display:flex;align-items:center;gap:8px;width:100%;padding:6px 10px;background:transparent;border:none;border-radius:6px;font-size:11.5px;color:var(--ink);cursor:pointer;text-align:left;">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
        <span>Logout Session</span>
      </button>
    </div>
  `;

  dropdown.classList.add('show');
}

window.toggleProfileDropdown = toggleProfileDropdown;

export async function handleLogout() {
  const currentName = DATA.meta?.analyst || 'User';
  const currentEmail = DATA.meta?.email || '';
  const currentPhone = DATA.meta?.phone || '';
  const currentRole = DATA.meta?.role || '';
  const currentUserId = DATA.meta?.userId || '';

  // Close profile dropdown
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('show');

  // Remove current user from active sessions
  removeAccountFromActiveSessions(currentEmail || currentPhone || currentName || currentUserId);

  // Clear session storage
  try {
    sessionStorage.removeItem('crimeintel_session');
    sessionStorage.clear();
  } catch (e) {}

  // Clear in-memory auth state
  if (DATA && DATA.meta) {
    DATA.meta.analyst = '';
    DATA.meta.role = '';
    DATA.meta.phone = '';
    DATA.meta.email = '';
  }
  await persist();

  // Reset and initialize login form
  if (window.resetLoginForm) window.resetLoginForm();
  if (window.setAuthMode) window.setAuthMode('signin');

  // Pre-set role matching previous session
  const defaultRole = currentRole === 'Citizen' ? 'Citizen' : 'Police Officer';
  const roleSelect = document.getElementById('login-role');
  if (roleSelect) {
    roleSelect.value = defaultRole;
    if (window.updateLoginRoleUI) window.updateLoginRoleUI(defaultRole);
  }

  // Hide the main app container and reveal the initial login screen
  const app = document.getElementById('app');
  const loginScreen = document.getElementById('login-screen');

  if (app) {
    app.classList.remove('visible');
    app.style.display = 'none';
  }

  if (loginScreen) {
    loginScreen.style.display = 'flex';
    loginScreen.style.opacity = '1';
    loginScreen.style.transform = 'scale(1)';
    loginScreen.style.pointerEvents = 'auto';
  }

  // Clear route hash
  window.location.hash = '';
  if (window.history && window.history.replaceState) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  showToast(`${currentName} has been logged out.`);
}

window.logoutSpecificAccount = async function(identifier) {
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('show');

  const currentEmail = (DATA.meta?.email || '').trim().toLowerCase();
  const currentPhone = (DATA.meta?.phone || '').trim().toLowerCase();
  const currentName = (DATA.meta?.analyst || '').trim().toLowerCase();
  const currentUserId = (DATA.meta?.userId || '').trim().toLowerCase();
  const target = (identifier || '').toString().trim().toLowerCase();

  const isCurrent = Boolean(
    target && (
      target === currentEmail ||
      target === currentPhone ||
      target === currentName ||
      target === currentUserId
    )
  );

  const users = (DATA && DATA.users) ? DATA.users : [];
  const acc = users.find(u => {
    const uId = (u.id || '').toString().toLowerCase();
    const uEmail = (u.email || '').toString().toLowerCase();
    const uPhone = (u.phone || '').toString().toLowerCase();
    const uName = (u.fullName || u.name || '').toString().toLowerCase();
    return uId === target || uEmail === target || uPhone === target || uName === target;
  });

  const accName = acc ? (acc.fullName || acc.name) : 'account';
  removeAccountFromActiveSessions(identifier);

  if (isCurrent) {
    await handleLogout();
  } else {
    showToast(`Logged out ${accName}. Password will be required to switch back.`);
    render();
  }
};

window.temporarilyRemoveProfile = async function(identifier, name) {
  const targetName = name || 'this account';
  const confirmed = window.confirm(
    `Temporarily remove "${targetName}" from this device's quick-switch list?\n\n• The account is NOT deleted from the database.\n• All existing cases, evidence, notes, and activity remain completely safe.\n• You can sign back in anytime via "+ Add / Restore Account" with your password.`
  );
  if (!confirmed) return;

  const currentEmail = (DATA.meta?.email || '').trim().toLowerCase();
  const currentPhone = (DATA.meta?.phone || '').trim().toLowerCase();
  const currentName = (DATA.meta?.analyst || '').trim().toLowerCase();
  const currentUserId = (DATA.meta?.userId || '').trim().toLowerCase();
  const target = (identifier || '').toString().trim().toLowerCase();

  const isCurrent = (target && (target === currentEmail || target === currentPhone || target === currentName || target === currentUserId));

  hideProfileFromQuickList(identifier);

  if (isCurrent) {
    showToast(`"${targetName}" temporarily removed from quick list.`);
    await handleLogout();
  } else {
    showToast(`"${targetName}" temporarily removed from quick list. Account remains saved in database.`);
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown && dropdown.classList.contains('show')) {
      dropdown.classList.remove('show');
      toggleProfileDropdown();
    } else {
      render();
    }
  }
};

window.handleLogout = handleLogout;
window.switchPoliceProfile = switchPoliceProfile;
window.switchCitizenProfile = switchCitizenProfile;
window.deleteUserProfile = deleteUserProfile;

window.openSwitchProfileModal = function(officerIdOrEmail) {
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('show');

  const users = (DATA && DATA.users) ? DATA.users : [];
  const target = (officerIdOrEmail || '').toString().trim().toLowerCase();
  const officer = users.find(u => {
    const uId = (u.id || '').toString().toLowerCase();
    const uEmail = (u.email || '').toString().toLowerCase();
    const uPhone = (u.phone || '').toString().toLowerCase();
    const uName = (u.fullName || u.name || '').toString().toLowerCase();
    return uId === target || uEmail === target || uPhone === target || uName === target;
  });

  if (!officer) {
    showToast('Profile not found.');
    return;
  }

  const nameEl = document.getElementById('switchTargetOfficerName');
  const emailEl = document.getElementById('switchTargetOfficerEmail');
  const targetIdEl = document.getElementById('switchTargetOfficerId');
  const pwdInput = document.getElementById('switchProfilePassword');
  const errorEl = document.getElementById('switchProfileError');

  if (nameEl) nameEl.textContent = officer.fullName || officer.name || 'User';
  if (emailEl) emailEl.textContent = officer.email || officer.phone || officer.role;
  if (targetIdEl) targetIdEl.value = officer.id || officer.email || officer.phone;
  if (pwdInput) {
    pwdInput.value = '';
    pwdInput.type = 'password';
  }
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  openModal('switchProfileModal');
  setTimeout(() => {
    if (pwdInput) pwdInput.focus();
  }, 80);
};

window.handleSwitchProfileSubmit = async function(e) {
  if (e) e.preventDefault();
  const targetIdEl = document.getElementById('switchTargetOfficerId');
  const targetId = targetIdEl ? targetIdEl.value : '';
  const pwdInput = document.getElementById('switchProfilePassword');
  const errorEl = document.getElementById('switchProfileError');
  const submitBtn = document.getElementById('btnConfirmSwitchProfile');
  const password = pwdInput ? pwdInput.value : '';

  if (!password) {
    if (errorEl) {
      errorEl.textContent = 'Please enter your password to verify & switch.';
      errorEl.style.display = 'block';
    }
    if (pwdInput) pwdInput.focus();
    return;
  }

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Verifying...';
  }

  // Find user to check role
  const users = (DATA && DATA.users) ? DATA.users : [];
  const target = targetId.toLowerCase();
  const targetUser = users.find(u => {
    const uId = (u.id || '').toString().toLowerCase();
    const uEmail = (u.email || '').toString().toLowerCase();
    const uPhone = (u.phone || '').toString().toLowerCase();
    return uId === target || uEmail === target || uPhone === target;
  });

  let res = null;
  if (targetUser && targetUser.role === 'Citizen') {
    res = await switchCitizenProfile(targetId, password);
  } else {
    res = await switchPoliceProfile(targetId, password);
  }

  if (submitBtn) {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Verify & Switch Profile';
  }

  if (res && res.success) {
    closeModal('switchProfileModal');
    showToast(`Switched active profile to ${DATA.meta.analyst}`);
    render();
  } else {
    if (errorEl) {
      errorEl.textContent = (res && res.error) ? res.error : 'Incorrect password. Please try again.';
      errorEl.style.display = 'block';
    }
    if (pwdInput) {
      pwdInput.focus();
      pwdInput.select();
    }
  }
};

/**
 * Smart Profile Switcher:
 * - If already logged in, switches directly with ZERO password prompt!
 * - If logged out, opens the password verification modal.
 */
window.switchPoliceOfficerProfile = async function(officerIdOrEmail) {
  const users = (DATA && DATA.users) ? DATA.users : [];
  const target = (officerIdOrEmail || '').toString().trim().toLowerCase();
  const officer = users.find(u => {
    if (u.role !== 'Police Officer') return false;
    const uId = (u.id || '').toString().toLowerCase();
    const uEmail = (u.email || '').toString().toLowerCase();
    const uName = (u.fullName || u.name || '').toString().toLowerCase();
    return uId === target || uEmail === target || uName === target;
  });

  if (!officer) {
    showToast('Officer profile not found.');
    return;
  }

  // Check if this is already the active profile
  const isCurrent = (officer.email && officer.email === DATA.meta.email) || (officer.fullName === DATA.meta.analyst);
  if (isCurrent) {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.remove('show');
    return;
  }

  // Check if already in active sessions (logged in)
  if (isAccountLoggedIn(officer)) {
    const res = await switchPoliceProfile(officer.id || officer.email);
    if (res && res.success) {
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.classList.remove('show');
      showToast(`Switched active profile to Officer ${DATA.meta.analyst}`);
      render();
      return;
    }
  }

  // Account is logged out -> prompt for password
  window.openSwitchProfileModal(officerIdOrEmail);
};

window.switchCitizenOfficerProfile = async function(citizenIdOrPhone) {
  const users = (DATA && DATA.users) ? DATA.users : [];
  const target = (citizenIdOrPhone || '').toString().trim().toLowerCase();
  const citizen = users.find(u => {
    if (u.role !== 'Citizen') return false;
    const uId = (u.id || '').toString().toLowerCase();
    const uPhone = (u.phone || '').toString().toLowerCase();
    const uName = (u.fullName || u.name || '').toString().toLowerCase();
    return uId === target || uPhone === target || uName === target;
  });

  if (!citizen) {
    showToast('Citizen account not found.');
    return;
  }

  const isCurrent = (citizen.phone && citizen.phone === DATA.meta.phone) || (citizen.fullName === DATA.meta.analyst);
  if (isCurrent) {
    const dropdown = document.getElementById('profileDropdown');
    if (dropdown) dropdown.classList.remove('show');
    return;
  }

  if (isAccountLoggedIn(citizen)) {
    const res = await switchCitizenProfile(citizen.id || citizen.phone);
    if (res && res.success) {
      const dropdown = document.getElementById('profileDropdown');
      if (dropdown) dropdown.classList.remove('show');
      showToast(`Switched active profile to ${DATA.meta.analyst}`);
      render();
      return;
    }
  }

  window.openSwitchProfileModal(citizenIdOrPhone);
};

/* ============ IN-APP ADD ACCOUNT MODAL LOGIC ============ */
window.openAddAccountModal = function(defaultRole = 'Police Officer') {
  const dropdown = document.getElementById('profileDropdown');
  if (dropdown) dropdown.classList.remove('show');

  const modalTitle = document.getElementById('addAccountModalTitle');
  if (modalTitle) {
    modalTitle.textContent = defaultRole === 'Citizen' ? 'Add Citizen Account' : 'Add Police Officer Profile';
  }

  const roleSelect = document.getElementById('addAccRole');
  if (roleSelect) {
    roleSelect.value = defaultRole;
    window.updateAddAccRoleFields(defaultRole);
  }

  const signinRoleSelect = document.getElementById('addAccSigninRole');
  if (signinRoleSelect) {
    signinRoleSelect.value = defaultRole;
    window.updateAddAccSigninFields(defaultRole);
  }

  // Clear inputs
  const nameInput = document.getElementById('addAccFullName');
  const emailInput = document.getElementById('addAccEmail');
  const phoneInput = document.getElementById('addAccPhone');
  const pwdInput = document.getElementById('addAccPassword');
  const confPwdInput = document.getElementById('addAccConfirmPassword');
  const signinIdent = document.getElementById('addAccSigninIdent');
  const signinPwd = document.getElementById('addAccSigninPassword');
  const errorEl = document.getElementById('addAccountError');

  if (nameInput) nameInput.value = '';
  if (emailInput) emailInput.value = '';
  if (phoneInput) phoneInput.value = '';
  if (pwdInput) pwdInput.value = '';
  if (confPwdInput) confPwdInput.value = '';
  if (signinIdent) signinIdent.value = '';
  if (signinPwd) signinPwd.value = '';
  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  window.switchAddAccountTab('create');
  openModal('addAccountModal');
};

window.switchAddAccountTab = function(tab) {
  const formCreate = document.getElementById('formAddAccCreate');
  const formSignin = document.getElementById('formAddAccSignin');
  const btnCreate = document.getElementById('tabAddAccCreate');
  const btnSignin = document.getElementById('tabAddAccSignin');
  const errorEl = document.getElementById('addAccountError');

  if (errorEl) {
    errorEl.style.display = 'none';
    errorEl.textContent = '';
  }

  if (tab === 'create') {
    if (formCreate) formCreate.style.display = 'block';
    if (formSignin) formSignin.style.display = 'none';
    if (btnCreate) {
      btnCreate.style.background = 'var(--raised)';
      btnCreate.style.color = 'var(--primary)';
      btnCreate.style.fontWeight = '600';
    }
    if (btnSignin) {
      btnSignin.style.background = 'transparent';
      btnSignin.style.color = 'var(--ink-muted)';
      btnSignin.style.fontWeight = '500';
    }
  } else {
    if (formCreate) formCreate.style.display = 'none';
    if (formSignin) formSignin.style.display = 'block';
    if (btnSignin) {
      btnSignin.style.background = 'var(--raised)';
      btnSignin.style.color = 'var(--primary)';
      btnSignin.style.fontWeight = '600';
    }
    if (btnCreate) {
      btnCreate.style.background = 'transparent';
      btnCreate.style.color = 'var(--ink-muted)';
      btnCreate.style.fontWeight = '500';
    }
  }
};

window.updateAddAccRoleFields = function(role) {
  const emailField = document.getElementById('addAccEmailField');
  if (emailField) {
    emailField.style.display = role === 'Citizen' ? 'none' : 'block';
  }
};

window.updateAddAccSigninFields = function(role) {
  const identLabel = document.getElementById('addAccSigninIdentLabel');
  const identInput = document.getElementById('addAccSigninIdent');
  if (role === 'Citizen') {
    if (identLabel) identLabel.textContent = 'Citizen Phone Number';
    if (identInput) identInput.placeholder = 'Enter 10-digit registered phone';
  } else {
    if (identLabel) identLabel.textContent = 'Official Police Email';
    if (identInput) identInput.placeholder = 'officer@police.gov.in';
  }
};

window.handleAddAccountCreate = async function(e) {
  if (e) e.preventDefault();
  const roleEl = document.getElementById('addAccRole');
  const nameEl = document.getElementById('addAccFullName');
  const emailEl = document.getElementById('addAccEmail');
  const phoneEl = document.getElementById('addAccPhone');
  const passEl = document.getElementById('addAccPassword');
  const confirmPassEl = document.getElementById('addAccConfirmPassword');
  const submitBtn = document.getElementById('btnAddAccCreateSubmit');
  const errorEl = document.getElementById('addAccountError');

  const role = roleEl ? roleEl.value : 'Police Officer';
  const fullName = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  const phone = phoneEl ? phoneEl.value.trim() : '';
  const password = passEl ? passEl.value : '';
  const confirmPassword = confirmPassEl ? confirmPassEl.value : '';

  const showError = msg => {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  };

  if (!fullName) return showError('Please enter full legal name.');
  if (role === 'Police Officer' && !email) return showError('Official police email is required.');
  if (!phone) return showError('Phone number is required.');
  if (password.length < 6) return showError('Password must be at least 6 characters long.');
  if (password !== confirmPassword) return showError('Passwords do not match.');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating Account...';
  }

  try {
    const newUser = await registerNewUser({
      role,
      fullName,
      phone,
      email: role === 'Police Officer' ? email : undefined,
      password
    });

    // Add to active logged-in sessions and switch
    addAccountToActiveSessions(newUser);

    if (role === 'Police Officer') {
      await switchPoliceProfile(newUser.id || newUser.email);
    } else {
      await switchCitizenProfile(newUser.id || newUser.phone);
    }

    closeModal('addAccountModal');
    showToast(`Account created & switched to ${newUser.fullName}!`);
    render();
  } catch (err) {
    showError('Failed to create account. Please try again.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create & Switch Account';
    }
  }
};

window.handleAddAccountSignin = async function(e) {
  if (e) e.preventDefault();
  const roleEl = document.getElementById('addAccSigninRole');
  const identEl = document.getElementById('addAccSigninIdent');
  const passEl = document.getElementById('addAccSigninPassword');
  const submitBtn = document.getElementById('btnAddAccSigninSubmit');
  const errorEl = document.getElementById('addAccountError');

  const role = roleEl ? roleEl.value : 'Police Officer';
  const identifier = identEl ? identEl.value.trim() : '';
  const password = passEl ? passEl.value : '';

  const showError = msg => {
    if (errorEl) {
      errorEl.textContent = msg;
      errorEl.style.display = 'block';
    }
  };

  if (!identifier) return showError(`Please enter your registered ${role === 'Citizen' ? 'phone' : 'email'}.`);
  if (!password) return showError('Please enter your password.');

  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Authenticating...';
  }

  try {
    const user = findUserAccount({ role, identifier });
    if (!user) {
      showError(`Account not found for this ${role === 'Citizen' ? 'phone number' : 'email address'}.`);
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In & Switch Account';
      }
      return;
    }

    if (user.password !== password) {
      showError('Incorrect password. Please try again.');
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Sign In & Switch Account';
      }
      return;
    }

    // Add to active logged in sessions & switch
    addAccountToActiveSessions(user);

    if (role === 'Police Officer') {
      await switchPoliceProfile(user.id || user.email);
    } else {
      await switchCitizenProfile(user.id || user.phone);
    }

    closeModal('addAccountModal');
    showToast(`Signed in & switched to ${user.fullName || user.name}!`);
    render();
  } catch (err) {
    showError('Authentication error occurred.');
  } finally {
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Sign In & Switch Account';
    }
  }
};

window.openAddPoliceAccount = function() {
  window.openAddAccountModal('Police Officer');
};

window.confirmDeleteUserProfile = async function() {
  const currentName = DATA.meta.analyst || 'your account';
  const confirmed = window.confirm(`Are you sure you want to permanently delete account profile "${currentName}"? This action cannot be undone.`);
  if (!confirmed) return;

  const currentEmail = DATA.meta.email;
  const currentPhone = DATA.meta.phone;

  const deleted = await deleteUserProfile(currentEmail || currentPhone || currentName);
  if (deleted) {
    showToast(`Account profile "${currentName}" has been deleted.`);
  } else {
    showToast('Account removed.');
  }
  await handleLogout();
};


/* ============ SETUP MODAL SAVE & CITIZEN LISTENERS ============ */
let modalListenersInitialized = false;

function setupModalListeners() {
  if (modalListenersInitialized) return;
  modalListenersInitialized = true;

  const saveEvBtn = document.getElementById('saveEvBtn');
  if (saveEvBtn) {
    saveEvBtn.addEventListener('click', () => handleSaveEvidence(render));
  }

  const saveSuBtn = document.getElementById('saveSuBtn');
  if (saveSuBtn) {
    saveSuBtn.addEventListener('click', () => handleSaveSuspect(render));
  }

  const saveCaseBtn = document.getElementById('saveCaseBtn');
  if (saveCaseBtn) {
    saveCaseBtn.addEventListener('click', () =>
      handleCreateCase(newCaseId => {
        go('case/' + newCaseId);
        render();
      })
    );
  }

  // Police Review Complaint Save Button
  const savePoliceReviewBtn = document.getElementById('savePoliceReviewBtn');
  if (savePoliceReviewBtn) {
    savePoliceReviewBtn.addEventListener('click', e => savePoliceComplaintReview(e));
  }

  // Citizen Complaint Submission Form
  const complaintForm = document.getElementById('citizenComplaintForm');
  if (complaintForm) {
    complaintForm.addEventListener('submit', e => submitCitizenComplaint(e));
  }

  // Citizen Speech-to-Text Button
  const speechBtn = document.getElementById('btnSpeechMic');
  if (speechBtn) {
    speechBtn.addEventListener('click', e => {
      e.preventDefault();
      startSpeechRecognition();
    });
  }

  // Citizen Complaint File Upload
  const fileUploadInput = document.getElementById('compFileInput');
  if (fileUploadInput) {
    fileUploadInput.addEventListener('change', e => {
      handleFileUpload(e.target.files);
    });
  }

  // Police Evidence File Upload
  const policeEvFileInput = document.getElementById('evFileInput');
  if (policeEvFileInput) {
    policeEvFileInput.addEventListener('change', e => {
      handlePoliceFileUpload(e.target.files);
    });
  }

  // Camera Capture Triggers
  const btnCaptureSnap = document.getElementById('btnCaptureSnap');
  if (btnCaptureSnap) {
    btnCaptureSnap.addEventListener('click', () => captureCameraSnapshot());
  }

  const btnRetakeSnap = document.getElementById('btnRetakeSnap');
  if (btnRetakeSnap) {
    btnRetakeSnap.addEventListener('click', () => retakeCameraSnapshot());
  }

  const btnAttachSnap = document.getElementById('btnAttachSnap');
  if (btnAttachSnap) {
    btnAttachSnap.addEventListener('click', () => attachCameraSnapshot());
  }

  // Profile Chip Click
  const analystChip = document.getElementById('analystChipContainer');
  if (analystChip) {
    analystChip.onclick = (e) => {
      if (e) e.stopPropagation();
      toggleProfileDropdown();
    };
  }

  // Close dropdown when clicking outside
  document.addEventListener('click', (e) => {
    const dropdown = document.getElementById('profileDropdown');
    const chip = document.getElementById('analystChipContainer');
    if (dropdown && dropdown.classList.contains('show')) {
      if (chip && chip.contains(e.target)) return;
      if (dropdown.contains(e.target)) return;
      dropdown.classList.remove('show');
    }
  });

  const searchInput = document.getElementById('globalSearch');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      const q = e.target.value.toLowerCase().trim();
      if (!q || !DATA) return;
      const hitCase = DATA.cases.find(c =>
        (c.title + c.description).toLowerCase().includes(q)
      );
      if (hitCase) {
        go('case/' + hitCase.id);
      }
    });
  }
}

function getStatusBadgeClass(status) {
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

/* ============ CITIZEN UPLOAD EVIDENCE / SUSPECT QUICK MODALS ============ */
window.openCitizenUploadEvidenceModal = function() {
  const modal = document.getElementById('citizenUploadEvModal');
  const select = document.getElementById('citizenEvAppSelect');
  const apps = getAllApplications().filter(a => DATA.meta.phone ? a.citizenPhone === DATA.meta.phone : true);

  if (select) {
    select.innerHTML = apps.map(a => `
      <option value="${a.id}">${escapeHtml(a.num || a.id)} - ${escapeHtml(a.title)}</option>
    `).join('') || '<option value="general">General Complaint Evidence</option>';
  }
  openModal('citizenUploadEvModal');
};

window.openAddSuspectModal = function() {
  const modal = document.getElementById('citizenAddSuspectModal');
  const select = document.getElementById('citizenSusAppSelect');
  const apps = getAllApplications().filter(a => DATA.meta.phone ? a.citizenPhone === DATA.meta.phone : true);

  if (select) {
    select.innerHTML = apps.map(a => `
      <option value="${a.id}">${escapeHtml(a.num || a.id)} - ${escapeHtml(a.title)}</option>
    `).join('') || '<option value="general">General Incident Suspect</option>';
  }
  openModal('citizenAddSuspectModal');
};

/* ============ INIT APP ============ */
export async function initApp() {
  await loadData();
  initTheme();

  const app = document.getElementById('app');
  const loginScreen = document.getElementById('login-screen');

  // Check active session from sessionStorage
  let session = null;
  try {
    const sessionRaw = sessionStorage.getItem('crimeintel_session');
    if (sessionRaw) {
      session = JSON.parse(sessionRaw);
    }
  } catch (e) {
    session = null;
  }

  const isAuthenticated = Boolean(session && session.role && session.analyst);

  if (isAuthenticated) {
    // Restore session data to memory
    DATA.meta.analyst = session.analyst;
    DATA.meta.role = session.role;
    DATA.meta.phone = session.phone || '';
    DATA.meta.email = session.email || '';
    if (session.org) DATA.meta.org = session.org;

    if (loginScreen) {
      loginScreen.style.display = 'none';
      loginScreen.style.opacity = '0';
    }
    if (app) {
      app.classList.add('visible');
    }

    // Default route handling
    if (!window.location.hash || window.location.hash === '#' || window.location.hash === '#login') {
      window.location.hash = '#dashboard';
    }
  } else {
    // Ensure meta is cleared when not authenticated
    if (DATA && DATA.meta) {
      DATA.meta.analyst = '';
      DATA.meta.role = '';
      DATA.meta.phone = '';
      DATA.meta.email = '';
    }

    if (app) app.classList.remove('visible');
    if (loginScreen) {
      loginScreen.style.display = 'flex';
      loginScreen.style.opacity = '1';
      loginScreen.style.transform = 'scale(1)';
    }

    // Reset login form
    if (window.resetLoginForm) window.resetLoginForm();
    if (window.setAuthMode) window.setAuthMode('signin');
  }

  initRouter(() => {
    setExpandedSuspectId(null);
    render();
  });

  tickClock();
  if (!window._clockTimer) {
    window._clockTimer = setInterval(tickClock, 1000);
  }
  setupModalListeners();

  render();
}

window.render = render;

/* Auto-initialize theme, auth handlers, and app session upon load */
initTheme();
initAuth(() => initApp());
initApp();

