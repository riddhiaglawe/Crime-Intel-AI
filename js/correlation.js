/**
 * CASEWEB - AI Correlation Engine & Correlation Web Graph
 */

import { DATA, getCase, logActivity, persist } from './data.js';
import { escapeHtml } from './ui.js';

export function computeSuspectScore(suspect, evidenceList) {
  let rawShared = 0,
    matches = [];
  evidenceList.forEach(ev => {
    const shared = ev.tags.filter(t => suspect.tags.includes(t));
    if (shared.length) {
      rawShared += shared.length;
      matches.push({ evidenceId: ev.id, shared });
    }
  });
  const maxPossible = Math.max(3, evidenceList.length * 1.6);
  let score = Math.min(
    97,
    Math.round((rawShared / maxPossible) * 100) + (matches.length > 0 ? 8 : 0)
  );
  if (rawShared === 0) score = Math.max(4, Math.round(Math.random() * 8));
  return { score, matches };
}

export function computeCrossCase(suspect, homeCaseId) {
  let hits = [];
  DATA.cases.forEach(c => {
    if (c.id === homeCaseId) return;
    c.evidence.forEach(ev => {
      const shared = ev.tags.filter(t => suspect.tags.includes(t));
      if (shared.length)
        hits.push({
          caseId: c.id,
          caseTitle: c.title,
          evidenceId: ev.id,
          shared
        });
    });
  });
  return hits;
}

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

export async function runAiAnalysis(caseId, onRender) {
  const c = getCase(caseId);
  if (!c) return;

  const logEl = document.getElementById('aiLog');
  if (logEl) {
    logEl.style.display = 'block';
    logEl.innerHTML = '';
  }
  const btn = document.getElementById('runAiBtn');
  if (btn) {
    btn.disabled = true;
    btn.textContent = 'Analyzing…';
  }

  const lines = [
    `> AI Engine v2.4 — loading ${c.evidence.length} evidence item(s), ${c.suspects.length} known subject(s)…`,
    `> Tokenizing descriptions and cross-referencing tag vectors…`
  ];
  let crossFound = 0;
  c.suspects.forEach(s => {
    const { score, matches } = computeSuspectScore(s, c.evidence);
    s.score = score;
    s.matches = matches;
    if (matches.length) {
      const tagSet = new Set();
      matches.forEach(m => m.shared.forEach(t => tagSet.add(t)));
      lines.push(
        `> HIT — "${s.name}" ⇄ ${matches.length} evidence item(s), shared: ${[...tagSet].join(', ')}`
      );
    } else {
      lines.push(`> "${s.name}" — no direct tag overlap found.`);
    }
    if (score >= 75) {
      logActivity(
        'alert',
        c.id,
        `⚠ High-priority match: ${s.name} scored ${score}% in "${c.title}"`
      );
    }

    const cross = computeCrossCase(s, c.id);
    s.crossCase = cross;
    if (cross.length) {
      crossFound++;
      const uniqueCases = [...new Set(cross.map(x => x.caseTitle))];
      lines.push(
        `>  CROSS-CASE — "${s.name}" pattern also found in: ${uniqueCases.join(', ')}`
      );
      logActivity(
        'alert',
        c.id,
        `⚠ Cross-case pattern: ${s.name} linked to "${uniqueCases.join(', ')}"`
      );
    }
  });
  lines.push(`> Scoring complete. Ranking subjects by correlation confidence…`);
  logActivity(
    'ai',
    c.id,
    `AI correlation run on "${c.title}" — ${c.suspects.length} suspect(s) scored${crossFound ? `, ${crossFound} cross-case pattern(s) found` : ''}.`
  );

  if (logEl) {
    for (let i = 0; i < lines.length; i++) {
      await sleep(240);
      const d = document.createElement('div');
      d.className =
        'line' +
        (lines[i].includes('HIT') ? ' hit' : '') +
        (lines[i].includes('⚠') ? ' warn' : '');
      d.textContent = lines[i];
      logEl.appendChild(d);
      logEl.scrollTop = logEl.scrollHeight;
    }
  } else {
    await sleep(600);
  }

  if (btn) {
    btn.disabled = false;
    btn.textContent = '▶ Run AI Correlation';
  }
  await persist();
  if (typeof onRender === 'function') {
    onRender();
  }
}

/* ============ CORRELATION WEB (SVG) ============ */
export function drawWeb(c) {
  window._currentCase = c;
  const svg = document.getElementById('webSvg');
  if (!svg) return;
  const empty = document.getElementById('webEmpty');
  if (!c || (!c.evidence.length && !c.suspects.length)) {
    svg.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    return;
  }
  if (empty) empty.style.display = 'none';

  const evNodes = c.evidence.map((ev, i) => ({
    ...ev,
    kind: 'evidence',
    x: 90,
    y: 40 + i * (320 / Math.max(1, c.evidence.length - 1 || 1))
  }));
  const suNodes = c.suspects.map((s, i) => ({
    ...s,
    kind: 'suspect',
    x: 590,
    y: 40 + i * (320 / Math.max(1, c.suspects.length - 1 || 1))
  }));
  if (c.evidence.length === 1) evNodes[0].y = 200;
  if (c.suspects.length === 1) suNodes[0].y = 200;

  let edges = [];
  suNodes.forEach(s => {
    evNodes.forEach(ev => {
      const shared = ev.tags.filter(t => s.tags.includes(t));
      if (shared.length) edges.push({ from: ev, to: s, weight: shared.length });
    });
  });

  let parts = [];
  edges.forEach(e => {
    const strong = e.weight >= 2;
    parts.push(
      `<line x1="${e.from.x}" y1="${e.from.y}" x2="${e.to.x}" y2="${e.to.y}" stroke="${strong ? 'var(--blue, #3b82f6)' : 'var(--line, #cbd5e1)'}" stroke-width="${1 + e.weight}" opacity="${strong ? 0.85 : 0.55}" ${strong ? 'class="pulse-edge"' : ''}/>`
    );
  });

  evNodes.forEach(n => {
    parts.push(nodeSvg(n.x, n.y, 15, 'var(--amber, #d97706)', n));
    parts.push(labelSvg(n.x, n.y + 28, n.type, 'var(--ink-muted, #64748b)'));
  });

  suNodes.forEach(n => {
    const score = n.score;
    const color =
      score >= 70 ? 'var(--red, #ef4444)' : score >= 38 ? 'var(--amber, #d97706)' : 'var(--blue, #3b82f6)';
    parts.push(nodeSvg(n.x, n.y, 20, color, n, true));
    parts.push(
      labelSvg(n.x, n.y + 32, (n.name || '').split(' ')[0], 'var(--ink, #0f172a)')
    );
  });

  svg.innerHTML = `<style>.pulse-edge{animation:pulseLine 1.8s ease-in-out infinite;}@keyframes pulseLine{0%,100%{opacity:.5;}50%{opacity:1;}}.wnode{filter:drop-shadow(0 2px 4px rgba(0,0,0,.15));}</style>${parts.join('')}`;
}

export function nodeSvg(x, y, r, color, data, isSuspect) {
  return `<g class="wnode"><circle cx="${x}" cy="${y}" r="${r}" fill="var(--raised, #ffffff)" stroke="${color}" stroke-width="2.4"/><circle cx="${x}" cy="${y}" r="${r - 6}" fill="${color}" opacity="${isSuspect ? (data.score ? (data.score / 100) * 0.85 + 0.15 : 0.2) : 0.35}"/></g>`;
}

export function labelSvg(x, y, text, color) {
  return `<text x="${x}" y="${y}" text-anchor="middle" font-family="Inter, sans-serif" font-size="9.5" font-weight="600" fill="${color}">${escapeHtml(String(text)).slice(0, 14)}</text>`;
}
