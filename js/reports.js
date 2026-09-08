/**
 * CASEWEB - Reports Generation & Views
 */

import { DATA, getAllApplications, getCase } from './data.js';
import { escapeHtml, showToast } from './ui.js';
import { viewCaseDetail, getStatusBadgeClass } from './cases.js';

export function viewReports(caseId) {
  if (caseId) return viewCaseDetail(caseId, 'report');
  const allApps = getAllApplications().map(app => getCase(app.id));
  const allCases = [...DATA.cases, ...allApps];

  return `
    <div class="crumb">Documentation</div>
    <div class="page-title"><h2>Reports</h2></div>
    <div class="case-grid">
      ${allCases
        .map(
          c => {
            const num = c.num || c.id;
            const evidenceCount = c.evidence ? c.evidence.length : 0;
            const suspectsCount = c.suspects ? c.suspects.length : 0;
            const badgeClass = c.isCitizenApp ? getStatusBadgeClass(c.status) : c.status;
            return `
        <div class="case-card raised-sm" data-report="${c.id}">
          <div class="cid mono">${escapeHtml(num)}</div>
          <h4>${escapeHtml(c.title)}</h4>
          <p>${evidenceCount} evidence items · ${suspectsCount} suspects tracked</p>
          <div class="meta-row"><span class="badge ${badgeClass}">${escapeHtml(c.status)}</span><span>Generate report →</span></div>
        </div>
      `;}
        )
        .join('')}
    </div>
  `;
}

export async function handleCopyReport() {
  const doc = document.getElementById('reportDoc');
  if (!doc) return;
  const text = doc.innerText;
  try {
    await navigator.clipboard.writeText(text);
    showToast('Report copied to clipboard');
  } catch (e) {
    showToast('Could not copy — select text manually');
  }
}

export function handlePrintReport() {
  window.print();
}
