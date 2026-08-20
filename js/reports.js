/**
 * CASEWEB - Reports Generation & Views
 */

import { DATA } from './data.js';
import { escapeHtml, showToast } from './ui.js';
import { viewCaseDetail } from './cases.js';

export function viewReports(caseId) {
  if (caseId) return viewCaseDetail(caseId, 'report');
  return `
    <div class="crumb">Documentation</div>
    <div class="page-title"><h2>Reports</h2></div>
    <div class="case-grid">
      ${DATA.cases
        .map(
          c => `
        <div class="case-card raised-sm" data-report="${c.id}">
          <div class="cid mono">${c.num}</div>
          <h4>${escapeHtml(c.title)}</h4>
          <p>${c.evidence.length} evidence items · ${c.suspects.length} suspects tracked</p>
          <div class="meta-row"><span class="badge ${c.status}">${c.status}</span><span>Generate report →</span></div>
        </div>
      `
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
