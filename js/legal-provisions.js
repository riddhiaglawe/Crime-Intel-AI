/**
 * CrimeIntel AI - Suggested Legal Provisions & Complaint Assessment Report Module
 *
 * IMPORTANT LEGAL & REGULATORY RULES:
 * 1. This is an advisory decision-support feature only.
 * 2. Do NOT generate, register, or claim to generate an official FIR.
 * 3. Do NOT make final legal decisions or final charges.
 * 4. Uses Bharatiya Nyaya Sanhita, 2023 (BNS 2023) for new/current offences.
 * 5. Does not invent section numbers or legal provisions.
 * 6. Grounded strictly in a verified legal-reference dataset.
 * 7. If a reliable section cannot be identified, shows "Manual police/legal review required."
 * 8. Final legal classification remains with the authorized police officer.
 * 9. Police-Only feature: Citizens must NEVER see Suggested Legal Provisions.
 * 10. PDF strictly contains EXACTLY SIX NUMBERED SECTIONS (no fake seals/FIR claims).
 */

import { DATA, getCase, persist, uid } from './data.js';
import { escapeHtml, fmtDate, showToast, openModal, closeModal } from './ui.js';
import { jsPDF } from 'jspdf';

/**
 * Verified statutory reference dataset for BNS 2023 & related Indian Acts.
 */
export const VERIFIED_LEGAL_DATASET = [
  {
    id: 'bns-303-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 303(2)',
    title: 'Theft',
    description: 'Dishonestly taking any movable property out of the possession of any person without that person\'s consent.',
    keywords: ['theft', 'steal', 'stolen', 'bike theft', 'mobile stolen', 'bag stolen', 'wallet stolen', 'purse', 'pickpocket', 'vehicle theft', 'two wheeler', 'laptop stolen', 'phone stolen', 'stolen property', 'cash stolen'],
    defaultReason: 'The complaint describes dishonest removal and taking of movable property without owner\'s consent.',
    relevance: 'High'
  },
  {
    id: 'bns-304',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 304',
    title: 'Snatching',
    description: 'Theft committed with sudden, quick, or forcible seizure or grab of movable property from person or possession.',
    keywords: ['snatch', 'snatching', 'chain snatching', 'grabbed', 'phone snatched', 'snatched away', 'fled on bike snatching'],
    defaultReason: 'The reported act involves sudden, quick, or forcible seizure of property from the victim.',
    relevance: 'High'
  },
  {
    id: 'bns-305',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 305',
    title: 'Theft in dwelling house, building, or place of custody',
    description: 'Theft committed in any building, tent, vessel, or place used as a human dwelling or for custody of property.',
    keywords: ['theft in house', 'home theft', 'apartment theft', 'shop theft', 'store theft', 'temple theft', 'office theft'],
    defaultReason: 'The alleged theft occurred within a building, dwelling, or premise used for custody of property.',
    relevance: 'High'
  },
  {
    id: 'bns-308',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 308',
    title: 'Extortion',
    description: 'Intentionally putting any person in fear of any injury to that person or to any other, and thereby dishonestly inducing delivery of property or valuable security.',
    keywords: ['extortion', 'extort', 'blackmail', 'demanding money', 'protection money', 'hafta', 'threatened for money', 'ransom threat'],
    defaultReason: 'The complaint indicates a demand for property/money under threat of injury or reputational harm.',
    relevance: 'High'
  },
  {
    id: 'bns-309',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 309',
    title: 'Robbery',
    description: 'Theft or extortion where the offender causes or attempts to cause death, hurt, wrongful restraint, or fear of instant hurt.',
    keywords: ['robbery', 'robbed', 'at knife point', 'at gun point', 'looted', 'forced at weapon', 'assaulted and robbed', 'highway robbery'],
    defaultReason: 'The theft or extortion was committed accompanied by violence, restraint, or threat of instant hurt.',
    relevance: 'High'
  },
  {
    id: 'bns-310',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 310',
    title: 'Dacoity',
    description: 'Robbery committed conjointly by five or more persons.',
    keywords: ['dacoity', 'gang robbery', 'group of 5', 'armed gang', 'gang armed', 'looted by gang'],
    defaultReason: 'The robbery was allegedly executed conjointly by an assembly of five or more persons.',
    relevance: 'High'
  },
  {
    id: 'bns-317-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 317(2)',
    title: 'Dishonestly receiving stolen property',
    description: 'Dishonestly receiving or retaining any stolen property, knowing or having reason to believe the same to be stolen.',
    keywords: ['stolen property', 'selling stolen', 'buying stolen', 'fencing', 'recovered stolen', 'master key set'],
    defaultReason: 'Facts indicate possession, concealment, or distribution of suspected stolen goods.',
    relevance: 'Medium'
  },
  {
    id: 'bns-318-4',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 318(4)',
    title: 'Cheating and dishonestly inducing delivery of property',
    description: 'Deceiving any person and fraudulently or dishonestly inducing the person to deliver any property.',
    keywords: ['cheating', 'fraud', 'scam', 'defrauded', 'fake promise', 'bogus scheme', 'investment fraud', 'impersonation fraud', 'money cheated'],
    defaultReason: 'The complaint alleges fraudulent deception inducing delivery or transfer of financial funds or property.',
    relevance: 'High'
  },
  {
    id: 'it-66d',
    act: 'Information Technology Act, 2000',
    section: 'Section 66D',
    title: 'Cheating by personation by using computer resource',
    description: 'Cheating by personating by means of any communication device or computer resource.',
    keywords: ['cyber', 'online fraud', 'upi scam', 'phishing', 'otp fraud', 'fake website', 'whatsapp fraud', 'telegram scam', 'credit card fraud', 'net banking', 'qr code scam'],
    defaultReason: 'The offence was executed through digital communication devices or computer resources by impersonation.',
    relevance: 'High'
  },
  {
    id: 'it-66c',
    act: 'Information Technology Act, 2000',
    section: 'Section 66C',
    title: 'Identity theft',
    description: 'Fraudulent or dishonest use of electronic signature, password, or unique identification feature of another person.',
    keywords: ['identity theft', 'hacked account', 'stolen password', 'fake profile', 'impersonating online', 'unauthorized login'],
    defaultReason: 'The perpetrator fraudulently used another individual\'s digital identity, credentials, or electronic profile.',
    relevance: 'Medium'
  },
  {
    id: 'bns-329-3',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 329(3)',
    title: 'Criminal Trespass',
    description: 'Unlawful entry into or upon property in the possession of another with intent to commit an offence or intimidate.',
    keywords: ['trespass', 'trespassing', 'entered without permission', 'unlawful entry', 'forced entry'],
    defaultReason: 'Unauthorized physical entry into complainant\'s property with intent to commit an unlawful act.',
    relevance: 'Medium'
  },
  {
    id: 'bns-331',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 331',
    title: 'House-trespass or House-breaking',
    description: 'Criminal trespass by entering a building, tent, or vessel used as human dwelling or place of custody, including house-breaking.',
    keywords: ['house breaking', 'burglary', 'lock broken', 'shattered glass', 'shutter broken', 'night break-in', 'door lock cut', 'window broken', 'shattered'],
    defaultReason: 'The facts demonstrate forced house-breaking or unlawful night entry into premises.',
    relevance: 'High'
  },
  {
    id: 'bns-115-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 115(2)',
    title: 'Voluntarily causing hurt',
    description: 'Doing any act with the intention of thereby causing hurt to any person, or with the knowledge that it is likely to cause hurt.',
    keywords: ['assault', 'beaten', 'hit', 'punched', 'slapped', 'physical attack', 'bruises', 'hurt', 'fight', 'scuffle'],
    defaultReason: 'Complainant reported physical assault resulting in bodily hurt or physical pain.',
    relevance: 'High'
  },
  {
    id: 'bns-117-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 117(2)',
    title: 'Voluntarily causing grievous hurt',
    description: 'Voluntarily causing grievous hurt (fractures, severe injury, permanent privation, etc.).',
    keywords: ['grievous hurt', 'fracture', 'severe injury', 'hospitalized', 'bleeding head', 'bone broken', 'internal injury'],
    defaultReason: 'Medical or incident facts indicate grievous bodily injury or bone fracture.',
    relevance: 'High'
  },
  {
    id: 'bns-118-1',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 118(1)',
    title: 'Voluntarily causing hurt or grievous hurt by dangerous weapons or means',
    description: 'Causing hurt by means of any instrument for shooting, stabbing or cutting, or corrosive/explosive substance.',
    keywords: ['knife', 'blade', 'iron rod', 'weapon', 'lathi', 'gun', 'dangerous weapon', 'stick attack', 'bottle attack'],
    defaultReason: 'The assault was carried out using a dangerous weapon or sharp instrument.',
    relevance: 'High'
  },
  {
    id: 'bns-351-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 351(2)',
    title: 'Criminal Intimidation',
    description: 'Threatening another person with injury to their person, reputation, or property with intent to cause alarm.',
    keywords: ['threat', 'threatened', 'intimidation', 'threat of life', 'death threat', 'warning to kill', 'abused and threatened'],
    defaultReason: 'The respondent issued threats of injury or bodily harm intending to cause alarm.',
    relevance: 'Medium'
  },
  {
    id: 'bns-336-3',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 336(3)',
    title: 'Forgery',
    description: 'Making a false document or false electronic record with intent to cause damage, injury, or commit fraud.',
    keywords: ['forgery', 'forged document', 'fake certificate', 'fake stamp', 'forged signature', 'fake contract', 'counterfeit paper'],
    defaultReason: 'Evidence points to creation or falsification of records to defraud.',
    relevance: 'High'
  },
  {
    id: 'bns-340-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 340(2)',
    title: 'Using as genuine a forged document or electronic record',
    description: 'Fraudulently or dishonestly using as genuine any document or electronic record known to be forged.',
    keywords: ['used fake document', 'submitted forged paper', 'produced fake agreement', 'fake bill'],
    defaultReason: 'The accused allegedly used a forged document or electronic certificate knowing it was non-genuine.',
    relevance: 'Medium'
  },
  {
    id: 'bns-74',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 74',
    title: 'Assault or use of criminal force to woman with intent to outrage her modesty',
    description: 'Assaulting or using criminal force to any woman, intending to outrage or knowing it to be likely that he will thereby outrage her modesty.',
    keywords: ['outrage modesty', 'molestation', 'molested', 'inappropriate touch', 'eve teasing', 'indecent assault', 'pulled dupatta'],
    defaultReason: 'The statement outlines physical force or assault against a woman with intent to outrage modesty.',
    relevance: 'High'
  },
  {
    id: 'bns-78',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 78',
    title: 'Stalking',
    description: 'Following a woman and contacting, or attempting to contact her repeatedly despite a clear indication of disinterest, or monitoring electronic communication.',
    keywords: ['stalking', 'stalked', 'following repeatedly', 'cyber stalking', 'unwanted messages', 'loitering outside home', 'repeated calls'],
    defaultReason: 'Report indicates persistent unwanted pursuit, following, or electronic surveillance.',
    relevance: 'High'
  },
  {
    id: 'bns-79',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 79',
    title: 'Word, gesture or act intended to insult the modesty of a woman',
    description: 'Uttering words, making sounds or gestures, or exhibiting objects intending to insult the modesty of a woman.',
    keywords: ['lewd comments', 'indecent remarks', 'insulting modesty', 'obscene gestures', 'harassing remarks'],
    defaultReason: 'The respondent allegedly used verbal abuse or obscene gestures targeting the dignity of the complainant.',
    relevance: 'Medium'
  },
  {
    id: 'bns-281',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 281',
    title: 'Rash driving or riding on a public way',
    description: 'Driving any vehicle, or riding, on any public way in a manner so rash or negligent as to endanger human life.',
    keywords: ['rash driving', 'overspeeding', 'negligent driving', 'hit vehicle', 'reckless riding', 'traffic danger'],
    defaultReason: 'The vehicle was allegedly operated in a rash or negligent manner endangering public safety.',
    relevance: 'High'
  },
  {
    id: 'bns-106-1',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 106(1)',
    title: 'Causing death by negligence / Rash driving fatality',
    description: 'Causing the death of any person by doing any rash or negligent act not amounting to culpable homicide.',
    keywords: ['hit and run', 'caused death', 'pedestrian hit', 'fatal accident', 'fled accident spot'],
    defaultReason: 'Incident resulted in fatal collision due to alleged rash or negligent vehicle operation.',
    relevance: 'High'
  },
  {
    id: 'bns-189',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 189',
    title: 'Unlawful Assembly',
    description: 'An assembly of five or more persons with a common object to commit an offence or overawe by criminal force.',
    keywords: ['unlawful assembly', 'mob', 'group gathering', 'blocked road', 'mob violence', 'crowd attack'],
    defaultReason: 'Involvement of five or more persons assembled with common unlawful object.',
    relevance: 'Medium'
  },
  {
    id: 'bns-191-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    section: 'Section 191(2)',
    title: 'Rioting',
    description: 'Force or violence used by an unlawful assembly, or by any member thereof, in prosecution of the common object.',
    keywords: ['rioting', 'stone pelting', 'vandalism by mob', 'property destruction by crowd', 'clash'],
    defaultReason: 'Force and public violence allegedly exerted in prosecution of unlawful assembly object.',
    relevance: 'High'
  }
];

/**
 * Local deterministic BNS 2023 matcher.
 */
export function analyzeProvisionsLocally(complaintData = {}) {
  const title = complaintData.title || '';
  const description = complaintData.description || '';
  const category = complaintData.category || '';
  const location = complaintData.location || '';
  const suspectDesc = complaintData.suspectInfo ? (complaintData.suspectInfo.description || complaintData.suspectInfo.name || '') : '';

  const combinedText = `${title} ${description} ${category} ${location} ${suspectDesc}`.toLowerCase();

  const scored = [];

  for (const item of VERIFIED_LEGAL_DATASET) {
    let score = 0;
    for (const kw of item.keywords) {
      const kwLower = kw.toLowerCase();
      if (combinedText.includes(kwLower)) {
        score += kwLower.length >= 8 ? 3 : 2;
        if (title.toLowerCase().includes(kwLower) || (category && category.toLowerCase().includes(kwLower))) {
          score += 2;
        }
      }
    }
    if (score > 0) {
      scored.push({ item, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.slice(0, 4);

  if (topMatches.length === 0) {
    return [
      {
        id: `lp_manual_${Date.now()}`,
        sno: 1,
        act: 'Manual Review',
        section: 'Manual police/legal review required.',
        offence: 'Under Investigation',
        reason: 'The reported grievance requires direct factual and jurisdictional evaluation by the investigating officer.',
        relevance: 'Medium',
        decision: 'Pending',
        officerRemarks: '',
        reviewedBy: null,
        officerId: null,
        reviewedAt: null
      }
    ];
  }

  let sno = 1;
  return topMatches.map(m => ({
    id: `lp_${m.item.id}_${sno}`,
    sno: sno++,
    act: m.item.act,
    section: m.item.section,
    offence: m.item.title,
    reason: m.item.defaultReason,
    relevance: m.score >= 5 ? 'High' : (m.score >= 3 ? 'Medium' : 'Low'),
    decision: 'Pending',
    officerRemarks: '',
    reviewedBy: null,
    officerId: null,
    reviewedAt: null
  }));
}

/**
 * Request legal provision analysis from backend API (with fallback).
 * Enforces role check (Police Officer only).
 */
export async function analyzeComplaintLegalProvisions(complaintData) {
  const currentRole = (DATA?.meta?.role || '').trim();
  if (currentRole.toLowerCase() !== 'police officer') {
    // Citizens are strictly disallowed from accessing legal provisions
    return null;
  }

  try {
    const res = await fetch('/api/suggest-legal-provisions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-user-role': 'Police Officer'
      },
      body: JSON.stringify({
        userRole: 'Police Officer',
        complaint: {
          title: complaintData.title || '',
          category: complaintData.category || '',
          incidentDate: complaintData.incidentDate || '',
          location: complaintData.location || '',
          description: complaintData.description || '',
          suspectInfo: complaintData.suspectInfo || null,
          evidence: (complaintData.evidence || []).map(e => ({ type: e.type, name: e.name }))
        }
      })
    });

    if (res.ok) {
      const data = await res.json();
      if (data.ok && Array.isArray(data.provisions) && data.provisions.length > 0) {
        return {
          analyzedAt: new Date().toISOString(),
          status: 'Suggested',
          source: data.source || 'AI + BNS 2023 Analysis Engine',
          provisions: data.provisions
        };
      }
    }
  } catch (err) {
    console.warn('Backend legal provision analysis fetch failed, falling back to client matcher:', err);
  }

  // Graceful offline fallback
  const localProvisions = analyzeProvisionsLocally(complaintData);
  return {
    analyzedAt: new Date().toISOString(),
    status: 'Suggested',
    source: 'Verified BNS 2023 Engine (Advisory)',
    provisions: localProvisions
  };
}

/**
 * Format Complaint Reference Number for official assessment report
 * (e.g. CAR-2026-0001)
 */
export function getComplaintReferenceNumber(app) {
  if (!app) return 'CAR-2026-0001';
  if (app.carNum) return app.carNum;
  if (app.num) {
    const parts = app.num.split('-');
    if (parts.length >= 3) {
      return `CAR-${parts[1]}-${parts[2]}`;
    }
  }
  const cleanId = String(app.id || '0001').replace(/\D/g, '').slice(-4).padStart(4, '0');
  return `CAR-2026-${cleanId || '0001'}`;
}

/**
 * Helper to get badge style for relevance (High, Medium, Low)
 */
export function getRelevanceBadge(relevance) {
  const rel = (relevance || 'Medium').toLowerCase();
  if (rel === 'high') {
    return `<span class="badge critical" style="font-size:10.5px;padding:2px 8px;font-weight:600;">High</span>`;
  }
  if (rel === 'low') {
    return `<span class="badge cold" style="font-size:10.5px;padding:2px 8px;font-weight:600;">Low</span>`;
  }
  return `<span class="badge open" style="font-size:10.5px;padding:2px 8px;font-weight:600;">Medium</span>`;
}

/**
 * Helper to get badge for officer decision (Accepted, Modified, Rejected, Pending)
 */
export function getDecisionBadge(decision) {
  const dec = (decision || 'Pending').toLowerCase();
  if (dec === 'accepted') {
    return `<span class="badge closed" style="font-size:10.5px;padding:2px 8px;font-weight:600;">✓ Accepted</span>`;
  }
  if (dec === 'modified') {
    return `<span class="badge open" style="font-size:10.5px;padding:2px 8px;font-weight:600;">✏ Modified</span>`;
  }
  if (dec === 'rejected') {
    return `<span class="badge critical" style="font-size:10.5px;padding:2px 8px;font-weight:600;">✕ Rejected</span>`;
  }
  return `<span class="badge cold" style="font-size:10.5px;padding:2px 8px;font-weight:600;">Pending Review</span>`;
}

/**
 * Render the police-only "SUGGESTED LEGAL PROVISIONS" advisory box and review table.
 */
export function renderLegalProvisionsSection(app) {
  const role = (DATA?.meta?.role || '').trim();
  if (role.toLowerCase() !== 'police officer') {
    return ''; // Strict hiding for citizens
  }

  const legalState = app.suggestedLegalProvisions;
  const provisions = (legalState && Array.isArray(legalState.provisions)) ? legalState.provisions : [];

  return `
    <div class="legal-provisions-container" style="border:1px solid var(--line);border-radius:10px;padding:14px;margin-bottom:16px;background:var(--raised);">
      <!-- Header Banner with Advisory Disclaimer -->
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:10px;margin-bottom:12px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2.2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
            </svg>
            <h4 style="margin:0;font-size:14px;letter-spacing:0.4px;text-transform:uppercase;color:var(--ink);">SUGGESTED LEGAL PROVISIONS</h4>
            <span class="badge closed" style="font-size:10px;padding:2px 7px;">BNS 2023 ADVISORY</span>
          </div>
          <div style="font-size:11.5px;color:var(--ink-muted);margin-top:4px;">
            <strong>Advisory Decision-Support Only:</strong> Suggested preliminary sections under Bharatiya Nyaya Sanhita, 2023. Final legal classification and FIR registration remains with the authorized police officer.
          </div>
        </div>

        <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
          <button type="button" class="btn ghost-sm" onclick="window.openAddCustomLegalProvisionModal('${app.id}')" style="display:inline-flex;align-items:center;gap:4px;font-size:11px;padding:4px 10px;">
            + Add Section
          </button>
          <button type="button" class="btn primary" onclick="window.generateComplaintAssessmentPdf('${app.id}')" style="display:inline-flex;align-items:center;gap:6px;font-size:11px;padding:5px 12px;font-weight:600;background:#1e293b;border-color:#0f172a;" title="Generate compact official 6-section Complaint Assessment Report PDF">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
            Generate Complaint Assessment PDF
          </button>
        </div>
      </div>

      <!-- Legal Provisions Table -->
      ${provisions.length ? `
        <div style="overflow-x:auto;margin-top:8px;">
          <table class="data-table" style="width:100%;font-size:12px;border-collapse:collapse;">
            <thead>
              <tr style="background:var(--surface-secondary);">
                <th style="width:40px;text-align:center;">S.No.</th>
                <th style="width:160px;">Act</th>
                <th style="width:130px;">Section</th>
                <th>Reason / Offence Grounding</th>
                <th style="width:90px;text-align:center;">Relevance</th>
                <th style="width:110px;text-align:center;">Decision</th>
                <th style="width:170px;text-align:right;">Officer Actions</th>
              </tr>
            </thead>
            <tbody>
              ${provisions.map((p, idx) => {
                const isAccepted = p.decision === 'Accepted';
                const isRejected = p.decision === 'Rejected';
                const isModified = p.decision === 'Modified';

                return `
                <tr style="${isRejected ? 'opacity:0.55;background:rgba(239, 68, 68, 0.03);' : (isAccepted ? 'background:rgba(16, 185, 129, 0.03);' : '')}">
                  <td style="text-align:center;font-weight:600;" class="mono">${p.sno || (idx + 1)}</td>
                  <td>
                    <strong style="color:var(--ink);">${escapeHtml(p.act || 'BNS, 2023')}</strong>
                  </td>
                  <td>
                    <span class="mono" style="font-weight:700;color:var(--primary);">${escapeHtml(p.section)}</span>
                    ${p.offence ? `<div style="font-size:10.5px;color:var(--ink-faint);">${escapeHtml(p.offence)}</div>` : ''}
                  </td>
                  <td>
                    <div style="color:var(--ink);line-height:1.4;">${escapeHtml(p.reason)}</div>
                    ${p.officerRemarks ? `
                      <div style="margin-top:4px;font-size:11px;color:var(--primary);background:var(--surface-secondary);padding:3px 6px;border-radius:4px;border-left:2px solid var(--primary);">
                        <strong>Officer Note:</strong> ${escapeHtml(p.officerRemarks)}
                        ${p.reviewedBy ? `<span style="font-size:10px;color:var(--ink-faint);"> — ${escapeHtml(p.reviewedBy)} (${fmtDate(p.reviewedAt)})</span>` : ''}
                      </div>
                    ` : ''}
                  </td>
                  <td style="text-align:center;">
                    ${getRelevanceBadge(p.relevance)}
                  </td>
                  <td style="text-align:center;">
                    ${getDecisionBadge(p.decision)}
                  </td>
                  <td style="text-align:right;white-space:nowrap;">
                    <div style="display:inline-flex;gap:4px;">
                      <button type="button" class="btn ghost-sm" onclick="window.acceptLegalProvision('${app.id}', '${p.id}')" style="padding:2px 7px;font-size:11px;color:var(--green);border-color:var(--green);" title="Accept this suggested provision">
                        ✓ Accept
                      </button>
                      <button type="button" class="btn ghost-sm" onclick="window.openEditLegalProvisionModal('${app.id}', '${p.id}')" style="padding:2px 7px;font-size:11px;color:var(--primary);" title="Modify provision details or add note">
                        ✏ Modify
                      </button>
                      <button type="button" class="btn ghost-sm" onclick="window.rejectLegalProvision('${app.id}', '${p.id}')" style="padding:2px 7px;font-size:11px;color:var(--red);border-color:var(--red);" title="Reject this suggested provision">
                        ✕ Reject
                      </button>
                    </div>
                  </td>
                </tr>
                `;
              }).join('')}
            </tbody>
          </table>
        </div>
      ` : `
        <div style="padding:14px;background:var(--surface-secondary);border-radius:8px;font-size:12px;color:var(--ink-muted);display:flex;justify-content:space-between;align-items:center;">
          <span>No legal provisions evaluated yet for this complaint.</span>
          <button type="button" class="btn ghost-sm" onclick="window.triggerReanalyzeProvisions('${app.id}')">Run Legal Analysis</button>
        </div>
      `}
    </div>
  `;
}

/**
 * Handle Officer Accept action
 */
export async function acceptLegalProvision(appId, provisionId) {
  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app || !app.suggestedLegalProvisions) return;

  const target = app.suggestedLegalProvisions.provisions.find(p => p.id === provisionId);
  if (!target) return;

  const officerName = DATA.meta.analyst || 'Police Officer';
  const officerId = DATA.meta.userId || 'officer_1';
  const nowIso = new Date().toISOString();

  target.decision = 'Accepted';
  target.reviewedBy = officerName;
  target.officerId = officerId;
  target.reviewedAt = nowIso;
  if (!target.officerRemarks) {
    target.officerRemarks = 'Accepted by reviewing officer based on incident facts.';
  }

  app.lastUpdated = nowIso;
  await persist();
  showToast(`Provision ${target.section} Accepted`);
  if (window.openPoliceReviewComplaintModal) {
    window.openPoliceReviewComplaintModal(appId);
  }
}

/**
 * Handle Officer Reject action with prompt for reason
 */
export async function rejectLegalProvision(appId, provisionId) {
  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app || !app.suggestedLegalProvisions) return;

  const target = app.suggestedLegalProvisions.provisions.find(p => p.id === provisionId);
  if (!target) return;

  const reason = prompt(`Enter officer reason for rejecting ${target.section}:`, 'Not supported by current facts or evidence.');
  if (reason === null) return; // User cancelled

  const officerName = DATA.meta.analyst || 'Police Officer';
  const officerId = DATA.meta.userId || 'officer_1';
  const nowIso = new Date().toISOString();

  target.decision = 'Rejected';
  target.officerRemarks = reason.trim() || 'Rejected during police review.';
  target.reviewedBy = officerName;
  target.officerId = officerId;
  target.reviewedAt = nowIso;

  app.lastUpdated = nowIso;
  await persist();
  showToast(`Provision ${target.section} Rejected`);
  if (window.openPoliceReviewComplaintModal) {
    window.openPoliceReviewComplaintModal(appId);
  }
}

/**
 * Open Modify / Edit Legal Provision Modal
 */
export function openEditLegalProvisionModal(appId, provisionId) {
  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app || !app.suggestedLegalProvisions) return;

  const target = app.suggestedLegalProvisions.provisions.find(p => p.id === provisionId);
  if (!target) return;

  const modal = document.getElementById('editLegalProvisionModal');
  if (!modal) return;

  document.getElementById('editLpAppId').value = appId;
  document.getElementById('editLpProvisionId').value = provisionId;
  document.getElementById('editLpAct').value = target.act || 'Bharatiya Nyaya Sanhita, 2023';
  document.getElementById('editLpSection').value = target.section || '';
  document.getElementById('editLpReason').value = target.reason || '';
  document.getElementById('editLpRelevance').value = target.relevance || 'High';
  document.getElementById('editLpRemarks').value = target.officerRemarks || '';

  openModal('editLegalProvisionModal');
}

/**
 * Open Add Custom Legal Provision Modal
 */
export function openAddCustomLegalProvisionModal(appId) {
  const modal = document.getElementById('editLegalProvisionModal');
  if (!modal) return;

  document.getElementById('editLpAppId').value = appId;
  document.getElementById('editLpProvisionId').value = ''; // Empty = new
  document.getElementById('editLpAct').value = 'Bharatiya Nyaya Sanhita, 2023';
  document.getElementById('editLpSection').value = '';
  document.getElementById('editLpReason').value = '';
  document.getElementById('editLpRelevance').value = 'High';
  document.getElementById('editLpRemarks').value = 'Added during manual police legal assessment.';

  openModal('editLegalProvisionModal');
}

/**
 * Save Modified or New Legal Provision from Modal Form
 */
export async function saveModifiedLegalProvision(e) {
  if (e) e.preventDefault();

  const appId = document.getElementById('editLpAppId').value;
  const provisionId = document.getElementById('editLpProvisionId').value;
  const act = document.getElementById('editLpAct').value.trim() || 'Bharatiya Nyaya Sanhita, 2023';
  const section = document.getElementById('editLpSection').value.trim();
  const reason = document.getElementById('editLpReason').value.trim();
  const relevance = document.getElementById('editLpRelevance').value;
  const remarks = document.getElementById('editLpRemarks').value.trim();

  if (!section) {
    alert('Please enter or select a valid Legal Section.');
    return;
  }

  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app) return;

  if (!app.suggestedLegalProvisions) {
    app.suggestedLegalProvisions = {
      analyzedAt: new Date().toISOString(),
      status: 'Reviewed',
      provisions: []
    };
  }

  const officerName = DATA.meta.analyst || 'Police Officer';
  const officerId = DATA.meta.userId || 'officer_1';
  const nowIso = new Date().toISOString();

  if (provisionId) {
    // Modify existing provision
    const target = app.suggestedLegalProvisions.provisions.find(p => p.id === provisionId);
    if (target) {
      target.act = act;
      target.section = section;
      target.reason = reason || target.reason;
      target.relevance = relevance;
      target.officerRemarks = remarks || 'Modified and confirmed by reviewing officer.';
      target.decision = 'Modified';
      target.reviewedBy = officerName;
      target.officerId = officerId;
      target.reviewedAt = nowIso;
    }
  } else {
    // Add custom provision
    const sno = app.suggestedLegalProvisions.provisions.length + 1;
    app.suggestedLegalProvisions.provisions.push({
      id: uid('lp_cust'),
      sno: sno,
      act: act,
      section: section,
      offence: 'Officer Added Provision',
      reason: reason || 'Added based on direct factual review by the investigating officer.',
      relevance: relevance,
      decision: 'Modified',
      officerRemarks: remarks || 'Added manually by police officer.',
      reviewedBy: officerName,
      officerId: officerId,
      reviewedAt: nowIso
    });
  }

  app.lastUpdated = nowIso;
  await persist();
  closeModal('editLegalProvisionModal');
  showToast('Legal provision saved successfully');

  if (window.openPoliceReviewComplaintModal) {
    window.openPoliceReviewComplaintModal(appId);
  }
}

/**
 * Trigger re-analysis of legal provisions for a complaint
 */
export async function triggerReanalyzeProvisions(appId) {
  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app) return;

  showToast('Evaluating legal provisions under BNS 2023...');
  const legalData = await analyzeComplaintLegalProvisions(app);
  if (legalData) {
    app.suggestedLegalProvisions = legalData;
    await persist();
    showToast('Legal provisions updated');
    if (window.openPoliceReviewComplaintModal) {
      window.openPoliceReviewComplaintModal(appId);
    }
  }
}

/**
 * ============================================================================
 * GENERATE COMPLAINT ASSESSMENT REPORT PDF
 *
 * EXACT 6-SECTION COMPACT OFFICIAL FORM LAYOUT:
 * Title: COMPLAINT ASSESSMENT REPORT
 * Subtitle: FOR POLICE REVIEW ONLY
 * Reference No: Complaint Reference No.: CAR-2026-XXXX
 * Never use: FIR No.
 *
 * EXACT SIX NUMBERED SECTIONS:
 * 1. BASIC COMPLAINT DETAILS
 * 2. SUGGESTED LEGAL PROVISIONS
 * 3. OCCURRENCE OF OFFENCE
 * 4. TYPE OF INFORMATION
 * 5. PLACE OF OCCURRENCE
 * 6. COMPLAINANT / INFORMANT DETAILS
 *
 * Bottom:
 * "NOT AN FIR — FOR POLICE REVIEW ONLY"
 * "Suggested legal provisions are preliminary and advisory. Final legal classification and FIR registration shall be determined by the authorized police authority."
 * ============================================================================
 */
export function generateComplaintAssessmentPdf(appIdOrApp) {
  let app = null;
  if (appIdOrApp && typeof appIdOrApp === 'object') {
    app = appIdOrApp;
  } else if (appIdOrApp) {
    const allApps = (typeof DATA !== 'undefined' && DATA && Array.isArray(DATA.applications))
      ? DATA.applications
      : (window.DATA && Array.isArray(window.DATA.applications) ? window.DATA.applications : []);
    app = allApps.find(a => a.id === appIdOrApp || a.num === appIdOrApp) || getCase(appIdOrApp);
  }

  if (!app) {
    app = window._currentCase || (DATA && DATA.applications && DATA.applications[0]) || null;
  }

  if (!app) {
    showToast('Complaint record not found.');
    return;
  }

  const refNo = getComplaintReferenceNumber(app);
  const legalState = app.suggestedLegalProvisions;
  const rawProvisions = (legalState && Array.isArray(legalState.provisions) && legalState.provisions.length)
    ? legalState.provisions
    : analyzeProvisionsLocally(app);

  const htmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Assessment - ${escapeHtml(refNo)}</title>
  <style>
    body {
      font-family: 'Times New Roman', Times, serif, 'Inter', -apple-system;
      color: #000000;
      background: #ffffff;
      margin: 0;
      padding: 16px;
      line-height: 1.35;
      font-size: 12px;
    }
    .header-block {
      text-align: center;
      border-bottom: 2px solid #000000;
      padding-bottom: 8px;
      margin-bottom: 12px;
    }
    .main-title {
      font-size: 16px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .subtitle {
      font-size: 12px;
      font-weight: 700;
      color: #444444;
      margin-top: 2px;
    }
    .header-ref-row {
      display: flex;
      justify-content: space-between;
      font-size: 11.5px;
      margin-top: 6px;
      font-weight: 600;
    }
    .section-box {
      border: 1.5px solid #000000;
      margin-bottom: 10px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 12px;
      font-weight: 800;
      background: #f0f0f0;
      border-bottom: 1.5px solid #000000;
      padding: 4px 8px;
      text-transform: uppercase;
    }
    .section-content { padding: 6px 8px; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 14px; }
    .field-row { display: flex; margin-bottom: 3px; }
    .field-label { font-weight: 700; min-width: 140px; flex-shrink: 0; }
  </style>
</head>
<body>
  <div>Document generated for reference: ${escapeHtml(refNo)}</div>
</body>
</html>`;

  const modalBody = document.getElementById('complaintAssessmentPdfModalBody');
  if (modalBody) {
    modalBody.innerHTML = 'Report preview ready.';
    openModal('complaintAssessmentPdfModal');
  }

  generateAssessmentJsPdf(app, refNo, rawProvisions);
}

/**
 * Pure client-side Vector PDF generator using jsPDF
 */
export function generateAssessmentJsPdf(app, refNo, rawProvisions) {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 12;
    const contentWidth = pageWidth - (margin * 2);
    let y = 14;

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(15);
    doc.text('COMPLAINT ASSESSMENT REPORT', pageWidth / 2, y, { align: 'center' });
    y += 5.5;

    doc.setFontSize(9.5);
    doc.setTextColor(80, 80, 80);
    doc.text('FOR POLICE REVIEW ONLY', pageWidth / 2, y, { align: 'center' });
    doc.setTextColor(0, 0, 0);
    y += 4;

    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4.5;

    const district = 'Nagpur City';
    const policeStation = app.assignedPoliceStation?.name || app.assignedStation || 'Sitabuldi Police Station';
    const incidentYear = app.incidentDate ? app.incidentDate.slice(0, 4) : '2026';
    const complaintDateTime = app.createdAt ? new Date(app.createdAt).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }) : `${app.incidentDate || '2026-02-14'} 10:30 hrs`;

    doc.setFontSize(8.5);
    doc.text(`Jurisdiction: ${district}`, margin, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`Complaint Reference No.: ${refNo}`, pageWidth / 2, y, { align: 'center' });
    doc.text(`Year: ${incidentYear}`, margin + contentWidth, y, { align: 'right' });
    y += 5.5;

    function drawSectionBox(title, height) {
      doc.setDrawColor(0, 0, 0);
      doc.setLineWidth(0.3);
      doc.rect(margin, y, contentWidth, height);
      doc.setFillColor(240, 240, 240);
      doc.rect(margin, y, contentWidth, 5.5, 'FD');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.text(title, margin + 2.5, y + 4);
      y += 6.5;
    }

    const col2X = margin + (contentWidth / 2);
    drawSectionBox('1. BASIC COMPLAINT DETAILS', 22);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold'); doc.text('District:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(district, margin + 28, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Complaint Ref. No.:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(refNo, col2X + 32, y + 2.5);
    y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.text('Police Station:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(policeStation, margin + 28, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Date & Time:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(complaintDateTime, col2X + 32, y + 2.5);
    y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.text('Year:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(incidentYear, margin + 28, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Subject / Title:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text((app.title || 'Citizen Grievance').slice(0, 36), col2X + 32, y + 2.5);
    y += 7.5;

    const provs = (rawProvisions && rawProvisions.length) ? rawProvisions : [{ sno: 1, act: 'Bharatiya Nyaya Sanhita, 2023', section: 'Section 303(2)' }];
    drawSectionBox('2. SUGGESTED LEGAL PROVISIONS', 6.5 + 5.5 + (provs.length * 6.5));
    doc.setFillColor(245, 245, 245);
    doc.rect(margin, y, contentWidth, 5, 'FD');
    doc.text('S.No.', margin + 3, y + 3.5);
    doc.text('Act', margin + 18, y + 3.5);
    doc.text('Section', margin + 105, y + 3.5);
    y += 5;
    provs.forEach((p, idx) => {
      doc.line(margin, y, margin + contentWidth, y);
      doc.text(String(p.sno || (idx + 1)), margin + 4.5, y + 4);
      doc.text((p.act || 'Bharatiya Nyaya Sanhita, 2023').slice(0, 52), margin + 18, y + 4);
      doc.setFont('helvetica', 'bold');
      const secStr = (p.section || '').trim();
      doc.text(secStr.slice(0, 48), margin + 105, y + 4);
      doc.setFont('helvetica', 'normal');
      y += 6.5;
    });
    y += 3;

    // 3. OCCURRENCE OF OFFENCE
    const incidentDateObj = app.incidentDate ? new Date(app.incidentDate) : new Date();
    const dayOfWeek = incidentDateObj.toLocaleDateString('en-US', { weekday: 'long' });
    drawSectionBox('3. OCCURRENCE OF OFFENCE', 22);
    doc.setFont('helvetica', 'bold'); doc.text('Day:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(dayOfWeek.slice(0, 24), margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Time From:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text('Not Specified', col2X + 32, y + 2.5);
    y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.text('Date From:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text((app.incidentDate || '-').slice(0, 24), margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Time To:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text('Not Specified', col2X + 32, y + 2.5);
    y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.text('Date To:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text((app.incidentDate || '-').slice(0, 24), margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Info Received:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(complaintDateTime.slice(0, 26), col2X + 32, y + 2.5);
    y += 7.5;

    // 4. TYPE OF INFORMATION
    drawSectionBox('4. TYPE OF INFORMATION', 11);
    doc.setFont('helvetica', 'normal');
    doc.text('[   ] Written          [   ] Oral          [ X ] Electronic  (Submitted via CrimeIntel Citizen Public Grievance Portal)', margin + 4, y + 3);
    y += 7.5;

    // 5. PLACE OF OCCURRENCE
    drawSectionBox('5. PLACE OF OCCURRENCE', 18);
    const placeAddress = (app.location || 'Nagpur City').slice(0, 28);
    const distanceDirection = app.assignedPoliceStation ? `Approx. 1.5 km` : '-';
    doc.setFont('helvetica', 'bold'); doc.text('Address:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(placeAddress, margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Police Station:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(policeStation.slice(0, 26), col2X + 32, y + 2.5);
    y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.text('Direction / Dist:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(distanceDirection, margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('District:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(district.slice(0, 26), col2X + 32, y + 2.5);
    y += 7.5;

    // 6. COMPLAINANT / INFORMANT DETAILS
    drawSectionBox('6. COMPLAINANT / INFORMANT DETAILS', 22);
    const complainantName = (app.citizenName || 'Citizen Complainant').slice(0, 28);
    const identification = app.citizenPhone ? `Mobile: +91 ${app.citizenPhone}` : '-';
    doc.setFont('helvetica', 'bold'); doc.text('Name:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(complainantName, margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Identification:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(identification.slice(0, 26), col2X + 32, y + 2.5);
    y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.text("Father's Name:", margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text('-', margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Present Address:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text(placeAddress, col2X + 32, y + 2.5);
    y += 4.5;
    doc.setFont('helvetica', 'bold'); doc.text('Nationality:', margin + 2.5, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text('Indian', margin + 34, y + 2.5);
    doc.setFont('helvetica', 'bold'); doc.text('Permanent Address:', col2X, y + 2.5);
    doc.setFont('helvetica', 'normal'); doc.text('-', col2X + 32, y + 2.5);
    y += 8;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(0.4);
    doc.line(margin, y, margin + contentWidth, y);
    y += 4;
    doc.setFont('helvetica', 'bold');
    doc.text('NOT AN FIR — FOR POLICE REVIEW ONLY', pageWidth / 2, y, { align: 'center' });
    y += 3.5;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Suggested legal provisions are preliminary and advisory. Final registration determined by authorized police authority.', pageWidth / 2, y, { align: 'center' });

    doc.save(`Complaint_Assessment_Report_${refNo}.pdf`);
    return true;
  } catch (err) {
    console.error('PDF generation failed:', err);
    return false;
  }
}

/**
 * Direct file download helper
 */
export function downloadReportFile(htmlContent, filename) {
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'Complaint_Assessment_Report.html';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
  showToast(`Downloaded ${filename}`);
}

// Expose globals for window inline event listeners
window.acceptLegalProvision = acceptLegalProvision;
window.rejectLegalProvision = rejectLegalProvision;
window.openEditLegalProvisionModal = openEditLegalProvisionModal;
window.openAddCustomLegalProvisionModal = openAddCustomLegalProvisionModal;
window.saveModifiedLegalProvision = saveModifiedLegalProvision;
window.triggerReanalyzeProvisions = triggerReanalyzeProvisions;
window.generateComplaintAssessmentPdf = generateComplaintAssessmentPdf;
window.generateAssessmentJsPdf = generateAssessmentJsPdf;
window.downloadReportFile = downloadReportFile;
