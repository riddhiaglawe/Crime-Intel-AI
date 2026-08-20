/**
 * CrimeIntel AI - Data Layer, Storage & Primary Nagpur Law Enforcement Dataset
 */

import { buildFormattedDataset } from './dataset.js';
import { fetchRemoteState, saveRemoteState, isRemoteAvailable } from './remote-store.js';

export const STORAGE_KEY = 'crimeintel-ai-primary-v3';

export const DEFAULT_DATA = {
  meta: {
    analyst: '',
    role: '',
    phone: '',
    email: '',
    org: 'Metro PD — Intelligence & Analysis Unit',
    seq: 101,
    appSeq: 1
  },
  cases: buildFormattedDataset(),
  applications: [
    {
      id: 'app_1',
      num: 'CI-2026-0001',
      title: 'Stolen Two-Wheeler near Sitabuldi Metro Station',
      category: 'Vehicle Theft',
      incidentDate: '2026-02-10',
      location: 'Sitabuldi Metro Station, West Exit',
      description: 'Black Honda Activa (MH-31-EZ-4421) parked at the public stand around 11:30 AM was found missing upon return at 4:00 PM.',
      citizenName: 'Amit Sharma',
      citizenPhone: '9876543210',
      status: 'Investigation in Progress',
      reviewStatus: 'Approved',
      approvedBy: 'Inspector R. Verma',
      approvedAt: '2026-02-11T09:20:00.000Z',
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      handlingDept: 'Metro PD — Sitabuldi Division',
      policeRemarks: 'CCTV footage obtained from Metro station pillar #14. Registration details forwarded to regional transport tracking network.',
      internalRemarks: 'Patrol unit alerted. Plate scanner deployed at Sitabuldi intersection.',
      createdAt: '2026-02-10T16:30:00.000Z',
      lastUpdated: '2026-02-12T11:15:00.000Z',
      statusHistory: [
        { status: 'Submitted', timestamp: '2026-02-10T16:30:00.000Z', remarks: 'Complaint registered successfully.' },
        { status: 'Under Review', timestamp: '2026-02-11T09:20:00.000Z', remarks: 'Application approved by Inspector R. Verma. Assigned to Sub-Inspector P. Deshmukh.' },
        { status: 'Investigation in Progress', timestamp: '2026-02-12T11:15:00.000Z', remarks: 'CCTV footage obtained from Metro station pillar #14. Registration details forwarded to regional transport tracking network.' }
      ],
      reviewHistory: [
        { action: 'Submitted', officerName: 'Citizen Filing', timestamp: '2026-02-10T16:30:00.000Z', remarks: 'Application registered by citizen and placed in police queue.' },
        { action: 'Approved', officerName: 'Inspector R. Verma', timestamp: '2026-02-11T09:20:00.000Z', remarks: 'Application verified and approved for active investigation.', internalRemarks: 'Jurisdiction verified, preliminary evidence validated.' }
      ],
      evidence: [
        {
          id: 'ev_init_1',
          name: 'Vehicle_Registration_Card.pdf',
          type: 'document',
          fileSize: 245000,
          uploadDate: '2026-02-10T16:30:00.000Z'
        }
      ],
      suspectInfo: {
        name: 'Unknown Male in Dark Jacket',
        age: '25-30',
        gender: 'Male',
        description: 'Observed loitering around two-wheelers with a master key set.'
      }
    },
    {
      id: 'app_2',
      num: 'CI-2026-0002',
      title: 'Commercial Burglary at Sadar Electronics Store',
      category: 'Burglary',
      incidentDate: '2026-02-14',
      location: 'Plot 42, Residency Road, Sadar',
      description: 'Rear glass panel shattered overnight. 6 premium smartphones and cash register box amounting to approx $4,500 were stolen.',
      citizenName: 'Amit Sharma',
      citizenPhone: '9876543210',
      status: 'Submitted',
      reviewStatus: 'Pending Review',
      approvedBy: null,
      approvedAt: null,
      rejectedBy: null,
      rejectedAt: null,
      rejectionReason: null,
      handlingDept: 'Metro PD — Sadar Division',
      policeRemarks: 'Complaint submitted. Awaiting Police Officer review and formal approval.',
      internalRemarks: 'Awaiting duty officer inspection of preliminary inventory list.',
      createdAt: '2026-02-14T08:45:00.000Z',
      lastUpdated: '2026-02-14T08:45:00.000Z',
      statusHistory: [
        { status: 'Submitted', timestamp: '2026-02-14T08:45:00.000Z', remarks: 'Complaint registered and placed in Police Review Queue.' }
      ],
      reviewHistory: [
        { action: 'Submitted', officerName: 'Citizen Filing', timestamp: '2026-02-14T08:45:00.000Z', remarks: 'Complaint submitted by citizen. Pending police review.' }
      ],
      evidence: [
        {
          id: 'ev_init_2',
          name: 'Store_Rear_Entry_Damage.jpg',
          type: 'photo',
          fileSize: 312000,
          uploadDate: '2026-02-14T08:45:00.000Z'
        }
      ],
      suspectInfo: {
        name: 'Unidentified Subject in Hoodie',
        age: '20-35',
        gender: 'Male',
        description: 'Wearing grey hooded sweatshirt and dark gloves, captured on motion camera fleeing towards Residency road.'
      }
    }
  ],
  citizenEvidence: [
    {
      id: 'ev_init_1',
      applicationId: 'app_1',
      applicationNum: 'CI-2026-0001',
      citizenPhone: '9876543210',
      name: 'Vehicle_Registration_Card.pdf',
      type: 'document',
      fileSize: 245000,
      status: 'Verified',
      uploadDate: '2026-02-10T16:30:00.000Z',
      description: 'RC Book copy of stolen Honda Activa'
    }
  ],
  citizenSuspects: [
    {
      id: 'cs_init_1',
      applicationId: 'app_1',
      applicationNum: 'CI-2026-0001',
      citizenPhone: '9876543210',
      name: 'Unknown Male in Dark Jacket',
      age: '25-30',
      gender: 'Male',
      location: 'Sitabuldi Metro Station',
      description: 'Observed loitering around two-wheelers with a master key set.',
      createdAt: '2026-02-10T16:30:00.000Z'
    }
  ],
  users: [
    {
      id: 'usr_pol_1',
      role: 'Police Officer',
      fullName: 'Inspector R. Verma',
      name: 'Inspector R. Verma',
      phone: '9823011223',
      email: 'officer@police.gov.in',
      password: 'password123',
      createdAt: '2026-01-01T00:00:00.000Z'
    },
    {
      id: 'usr_cit_1',
      role: 'Citizen',
      fullName: 'Amit Sharma',
      name: 'Amit Sharma',
      phone: '9876543210',
      password: 'password123',
      createdAt: '2026-01-01T00:00:00.000Z'
    }
  ],
  activity: [
    {
      id: 'act1',
      ts: new Date(Date.now() - 3600000).toISOString(),
      kind: 'case',
      caseId: 'c1',
      text: 'Case C001 "Sitabuldi Mobile Phone Theft" synchronized with regional FIR database.'
    },
    {
      id: 'act2',
      ts: new Date(Date.now() - 7200000).toISOString(),
      kind: 'status',
      caseId: 'c11',
      text: 'Case C011 "Itwari Roadside Robbery" flagged as High Priority.'
    },
    {
      id: 'act3',
      ts: new Date(Date.now() - 10800000).toISOString(),
      kind: 'ai',
      caseId: 'c3',
      text: 'AI Correlation completed on Sadar area repeat offenses.'
    }
  ]
};

export let DATA = null;

/* ============ PERSISTENCE ============ */
export async function loadData() {
  let loadedFromRemote = false;
  let loadedFromLocal = false;

  const remote = await fetchRemoteState();
  if (remote && typeof remote === 'object') {
    DATA = remote;
    loadedFromRemote = true;
  }

  if (!loadedFromRemote) {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        DATA = JSON.parse(raw);
        loadedFromLocal = true;
      }
    } catch (err) {
      console.warn('LocalStorage read error', err);
    }
  }

  if (!DATA || (!loadedFromRemote && !loadedFromLocal)) {
    DATA = JSON.parse(JSON.stringify(DEFAULT_DATA));
  }

  // Validate structural integrity
  ensureDataStructure(DATA);

  // Seed the database on first run so Atlas becomes the source of truth.
  if (!loadedFromRemote && isRemoteAvailable()) {
    saveRemoteState(DATA);
  }

  return DATA;
}

function ensureDataStructure(target) {
  if (!target) return;
  if (!Array.isArray(target.cases) || target.cases.length === 0) {
    target.cases = buildFormattedDataset();
  }
  if (!Array.isArray(target.applications)) {
    target.applications = DEFAULT_DATA.applications;
  }
  if (!Array.isArray(target.citizenEvidence)) {
    target.citizenEvidence = DEFAULT_DATA.citizenEvidence;
  }
  if (!Array.isArray(target.citizenSuspects)) {
    target.citizenSuspects = DEFAULT_DATA.citizenSuspects;
  }
  if (!Array.isArray(target.users)) {
    target.users = DEFAULT_DATA.users;
  }
  if (!Array.isArray(target.activity)) {
    target.activity = DEFAULT_DATA.activity;
  }
  if (!target.meta) {
    target.meta = { ...DEFAULT_DATA.meta };
  }
}

export async function persist() {
  if (!DATA) return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DATA));
  } catch (err) {
    console.error('Storage write error', err);
  }
  saveRemoteState(DATA);
}

/* ============ ID GENERATION ============ */
export function uid(prefix = 'id') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
}

export function nextCaseNum() {
  if (!DATA.meta.seq) DATA.meta.seq = DATA.cases.length + 1;
  DATA.meta.seq += 1;
  return `C${String(DATA.meta.seq).padStart(3, '0')}`;
}

export function nextAppNum() {
  if (!DATA.meta.appSeq) DATA.meta.appSeq = (DATA.applications ? DATA.applications.length : 0) + 1;
  const numStr = `CI-2026-${String(DATA.meta.appSeq).padStart(4, '0')}`;
  DATA.meta.appSeq += 1;
  return numStr;
}

/* ============ CASE QUERIES ============ */
export function getCase(id) {
  if (!DATA) return null;
  if (DATA.cases) {
    const foundCase = DATA.cases.find(c => c.id === id || c.num === id);
    if (foundCase) return foundCase;
  }
  if (DATA.applications) {
    const app = DATA.applications.find(a => a.id === id || a.num === id);
    if (app) {
      return {
        ...app,
        isCitizenApp: true,
        opened: app.createdAt ? app.createdAt.slice(0, 10) : '—',
        evidence: (app.evidence || []).map(e => ({
          ...e,
          caseId: app.id,
          caseNum: app.num || app.id,
          caseTitle: `[Citizen] ${app.num || app.id}: ${app.title}`,
          text: e.description || e.name || e.fileName || 'Citizen Uploaded Evidence',
          type: e.type || (e.previewUrl || e.dataUrl ? 'photo' : 'digital'),
          time: e.uploadDate ? e.uploadDate.slice(0, 10) : (app.incidentDate || '—'),
          location: app.location || 'Reported Incident Area',
          tags: ['citizen-evidence', e.type || 'file', (app.category || 'complaint').toLowerCase().replace(/\s+/g, '-')]
        })),
        suspects: app.suspectInfo && (app.suspectInfo.name || app.suspectInfo.description) ? [{
          id: `csus_${app.id}`,
          name: app.suspectInfo.name || 'Reported Suspect',
          alias: app.suspectInfo.gender ? `${app.suspectInfo.gender}, Age ~${app.suspectInfo.age || '?'}` : '',
          tags: ['citizen-reported', (app.category || 'complaint').toLowerCase().replace(/\s+/g, '-')],
          score: 50,
          matches: [],
          crossCase: []
        }] : []
      };
    }
  }
  return null;
}

export function allEvidence() {
  if (!DATA) return [];
  const list = [];
  const seenIds = new Set();
  const seenFingerprints = new Set();

  // 1. Evidence logged under Police FIR Cases
  (DATA.cases || []).forEach(c => {
    (c.evidence || []).forEach(e => {
      if (!e) return;
      const eId = e.id || uid('e');
      if (seenIds.has(eId)) return;
      seenIds.add(eId);
      list.push({
        ...e,
        id: eId,
        caseId: c.id,
        caseNum: c.num,
        caseTitle: `${c.num}: ${c.title}`,
        source: 'police'
      });
    });
  });

  // 2. Evidence registered via Citizen Complaints & Applications
  (DATA.applications || []).forEach(app => {
    const appCaseTitle = `[Citizen] ${app.num || app.id}: ${app.title}`;

    // A. Attached files/photos in the application
    (app.evidence || []).forEach(file => {
      if (!file) return;
      const fileId = file.id || uid('cev');
      const fileFp = `${app.id}_${file.name || file.fileName || ''}_${(file.dataUrl || '').slice(0, 80)}`;
      if (seenIds.has(fileId) || seenFingerprints.has(fileFp)) return;
      seenIds.add(fileId);
      seenFingerprints.add(fileFp);

      list.push({
        ...file,
        id: fileId,
        caseId: app.id,
        caseNum: app.num || app.id,
        caseTitle: appCaseTitle,
        applicationId: app.id,
        applicationNum: app.num || app.id,
        citizenName: app.citizenName || 'Citizen',
        citizenPhone: app.citizenPhone || '',
        text: file.description || file.name || file.fileName || 'Citizen Uploaded Evidence',
        name: file.name || file.fileName || 'Evidence File',
        fileName: file.fileName || file.name || 'Evidence File',
        location: app.location || 'Reported Location',
        time: file.uploadDate ? file.uploadDate.slice(0, 10) : (app.incidentDate || '—'),
        type: file.type || (file.previewUrl || file.dataUrl ? 'photo' : 'digital'),
        tags: ['citizen-evidence', file.type || 'file', (app.category || 'complaint').toLowerCase().replace(/\s+/g, '-')],
        previewUrl: file.previewUrl || file.dataUrl || null,
        dataUrl: file.dataUrl || null,
        fileSize: file.fileSize || file.size || 0,
        status: file.status || 'Submitted',
        loggedAt: file.uploadDate || app.createdAt || new Date().toISOString(),
        source: 'citizen'
      });
    });

    // B. Primary Incident Statement / Grievance Statement registered by Citizen
    if (app.description && app.description.trim()) {
      const stmtId = `ev_stmt_${app.id}`;
      if (!seenIds.has(stmtId)) {
        seenIds.add(stmtId);
        list.push({
          id: stmtId,
          caseId: app.id,
          caseNum: app.num || app.id,
          caseTitle: appCaseTitle,
          applicationId: app.id,
          applicationNum: app.num || app.id,
          citizenName: app.citizenName || 'Citizen',
          citizenPhone: app.citizenPhone || '',
          text: `Citizen Incident Statement (${app.citizenName || 'Citizen'}${app.citizenPhone ? ` · ${app.citizenPhone}` : ''}): "${app.description}"`,
          name: `Citizen Statement — ${app.category || 'Complaint'}`,
          location: app.location || 'Incident Location',
          time: app.incidentDate || (app.createdAt ? app.createdAt.slice(0, 10) : '—'),
          type: 'witness',
          tags: ['citizen-statement', 'public-grievance', (app.category || 'complaint').toLowerCase().replace(/\s+/g, '-')],
          loggedAt: app.createdAt || new Date().toISOString(),
          status: app.reviewStatus || 'Verified',
          source: 'citizen'
        });
      }
    }
  });

  // 3. Standalone Citizen Evidence uploaded through Citizen Portal
  (DATA.citizenEvidence || []).forEach(ce => {
    if (!ce) return;
    const ceId = ce.id || uid('cev');
    const ceFp = `${ce.applicationId || ''}_${ce.name || ce.fileName || ''}_${(ce.dataUrl || '').slice(0, 80)}`;
    if (seenIds.has(ceId) || seenFingerprints.has(ceFp)) return;
    seenIds.add(ceId);
    seenFingerprints.add(ceFp);

    const parentApp = (DATA.applications || []).find(a => a.id === ce.applicationId || a.num === ce.applicationNum || a.id === ce.applicationNum);
    const parentCase = (DATA.cases || []).find(c => c.id === ce.applicationId || c.num === ce.applicationNum);

    const resolvedCaseTitle = parentApp
      ? `[Citizen] ${parentApp.num || parentApp.id}: ${parentApp.title}`
      : parentCase
      ? `${parentCase.num}: ${parentCase.title}`
      : `Citizen Complaint (${ce.applicationNum || ce.applicationId || 'Grievance'})`;

    const resolvedCaseId = parentApp ? parentApp.id : parentCase ? parentCase.id : (ce.applicationId || 'general');
    const resolvedCaseNum = parentApp ? (parentApp.num || parentApp.id) : parentCase ? parentCase.num : (ce.applicationNum || ce.applicationId || 'General');

    list.push({
      ...ce,
      id: ceId,
      caseId: resolvedCaseId,
      caseNum: resolvedCaseNum,
      caseTitle: resolvedCaseTitle,
      applicationId: ce.applicationId,
      applicationNum: ce.applicationNum || resolvedCaseNum,
      text: ce.description || ce.name || ce.fileName || 'Citizen Uploaded Evidence',
      name: ce.name || ce.fileName || 'Evidence File',
      location: ce.location || (parentApp ? parentApp.location : 'Submitted via Citizen Portal'),
      time: ce.uploadDate ? ce.uploadDate.slice(0, 10) : '—',
      type: ce.type || (ce.previewUrl || ce.dataUrl ? 'photo' : 'digital'),
      tags: ['citizen-evidence', ce.type || 'file', ...(ce.tags || [])],
      previewUrl: ce.previewUrl || ce.dataUrl || null,
      dataUrl: ce.dataUrl || null,
      fileSize: ce.fileSize || 0,
      loggedAt: ce.uploadDate || new Date().toISOString(),
      source: 'citizen'
    });
  });

  return list;
}

export function allSuspects() {
  if (!DATA) return [];
  const list = [];
  const seenSusIds = new Set();

  // 1. Suspects from Police Cases
  (DATA.cases || []).forEach(c => {
    (c.suspects || []).forEach(s => {
      if (!s) return;
      const sId = s.id || uid('s');
      if (seenSusIds.has(sId)) return;
      seenSusIds.add(sId);
      list.push({
        ...s,
        id: sId,
        homeCaseId: c.id,
        homeCaseNum: c.num,
        homeCaseTitle: `${c.num}: ${c.title}`,
        source: 'police'
      });
    });
  });

  // 2. Suspects reported by Citizens in complaints
  (DATA.citizenSuspects || []).forEach(cs => {
    if (!cs) return;
    const csId = cs.id || uid('csus');
    if (seenSusIds.has(csId)) return;
    seenSusIds.add(csId);

    const parentApp = (DATA.applications || []).find(a => a.id === cs.applicationId || a.num === cs.applicationNum);
    const parentCase = (DATA.cases || []).find(c => c.id === cs.applicationId || c.num === cs.applicationNum);

    const resolvedCaseTitle = parentApp
      ? `[Citizen] ${parentApp.num || parentApp.id}: ${parentApp.title}`
      : parentCase
      ? `${parentCase.num}: ${parentCase.title}`
      : `Citizen Complaint (${cs.applicationNum || cs.applicationId || 'General'})`;

    const resolvedCaseId = parentApp ? parentApp.id : parentCase ? parentCase.id : (cs.applicationId || 'general');
    const resolvedCaseNum = parentApp ? (parentApp.num || parentApp.id) : parentCase ? parentCase.num : (cs.applicationNum || cs.applicationId || 'General');

    list.push({
      ...cs,
      id: csId,
      homeCaseId: resolvedCaseId,
      homeCaseNum: resolvedCaseNum,
      homeCaseTitle: resolvedCaseTitle,
      alias: cs.gender ? `${cs.gender} (Age ~${cs.age || '?'})` : 'Reported Subject',
      tags: ['citizen-reported', cs.location ? cs.location.toLowerCase() : 'area', ...(cs.tags || [])],
      score: 50,
      addedAt: cs.createdAt || new Date().toISOString(),
      matches: [],
      crossCase: [],
      source: 'citizen'
    });
  });

  return list;
}

export function splitTags(str) {
  if (!str) return [];
  return str
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

/* ============ ACTIVITY LOGGING ============ */
export function logActivity(kind, caseId, text) {
  if (!DATA) return;
  if (!Array.isArray(DATA.activity)) DATA.activity = [];
  DATA.activity.unshift({
    id: uid('act'),
    ts: new Date().toISOString(),
    kind,
    caseId,
    text
  });
  DATA.activity = DATA.activity.slice(0, 150);
}

/* ============ CITIZEN APPLICATION OPERATIONS ============ */
export function getCitizenApplications(phone) {
  if (!DATA || !Array.isArray(DATA.applications)) return [];
  if (!phone) return DATA.applications;
  const cleanPhone = normalizePhone(phone);
  return DATA.applications.filter(app => {
    if (!app.citizenPhone) return true;
    return normalizePhone(app.citizenPhone) === cleanPhone || app.citizenPhone.trim() === phone.trim();
  });
}

export function getAllApplications() {
  if (!DATA || !Array.isArray(DATA.applications)) return [];
  return DATA.applications;
}

export function getCitizenEvidence(phone) {
  if (!DATA) return [];
  if (!Array.isArray(DATA.citizenEvidence)) DATA.citizenEvidence = [];

  const cleanPhone = normalizePhone(phone || DATA?.meta?.phone || '');
  const currentCitizenApps = getCitizenApplications(cleanPhone);

  // 1. Deduplicate DATA.citizenEvidence in-memory
  const seenIds = new Set();
  const seenFingerprints = new Set();
  DATA.citizenEvidence = DATA.citizenEvidence.filter(item => {
    if (!item) return false;
    const id = item.id || '';
    const fp = `${item.applicationId || ''}_${item.name || item.fileName || ''}_${(item.dataUrl || '').slice(0, 80)}`;
    if (id && seenIds.has(id)) return false;
    if (fp && seenFingerprints.has(fp)) return false;
    if (id) seenIds.add(id);
    if (fp) seenFingerprints.add(fp);
    return true;
  });

  // 2. Synchronize evidence from citizen applications into DATA.citizenEvidence ONLY if missing
  currentCitizenApps.forEach(app => {
    if (Array.isArray(app.evidence)) {
      app.evidence.forEach(file => {
        if (!file) return;
        const fileId = file.id || uid('cev');
        file.id = fileId; // Ensure app.evidence keeps the same ID
        const fileFp = `${app.id}_${file.name || file.fileName || ''}_${(file.dataUrl || '').slice(0, 80)}`;

        const exists = DATA.citizenEvidence.some(ce => ce.id === fileId || (ce.applicationId === app.id && (ce.name === file.name || ce.fileName === file.name)));
        if (!exists && !seenIds.has(fileId) && !seenFingerprints.has(fileFp)) {
          seenIds.add(fileId);
          seenFingerprints.add(fileFp);
          DATA.citizenEvidence.push({
            id: fileId,
            applicationId: app.id,
            applicationNum: app.num || app.id,
            citizenPhone: app.citizenPhone || cleanPhone,
            name: file.name || file.fileName || 'Evidence Item',
            fileName: file.fileName || file.name || 'Evidence Item',
            type: file.type || 'photo',
            fileSize: file.fileSize || file.size || 0,
            dataUrl: file.dataUrl || null,
            previewUrl: file.previewUrl || file.dataUrl || null,
            status: file.status || 'Submitted',
            uploadDate: file.uploadDate || app.createdAt || new Date().toISOString(),
            description: file.description || `Attached to complaint ${app.num || app.id}`
          });
        }
      });
    }
  });

  return DATA.citizenEvidence.filter(ev => {
    if (!cleanPhone) return true;
    if (ev.citizenPhone && (normalizePhone(ev.citizenPhone) === cleanPhone || ev.citizenPhone.trim() === (phone || '').trim())) {
      return true;
    }
    const matchedApp = currentCitizenApps.find(a => a.id === ev.applicationId || a.num === ev.applicationNum);
    return Boolean(matchedApp);
  });
}

export function getCitizenSuspects(phone) {
  if (!DATA || !Array.isArray(DATA.citizenSuspects)) return [];
  if (!phone) return DATA.citizenSuspects;
  const cleanPhone = normalizePhone(phone);
  return DATA.citizenSuspects.filter(s => {
    if (!s.citizenPhone) return true;
    return normalizePhone(s.citizenPhone) === cleanPhone || s.citizenPhone.trim() === phone.trim();
  });
}

export async function createCitizenComplaint({
  title,
  category,
  incidentDate,
  location,
  description,
  citizenName,
  citizenPhone,
  evidenceFiles = [],
  suspectInfo = null
}) {
  if (!DATA) await loadData();

  const appId = uid('app');
  const appNum = nextAppNum();
  const nowIso = new Date().toISOString();

  const processedEvidence = [];
  if (!Array.isArray(DATA.citizenEvidence)) DATA.citizenEvidence = [];

  // Deduplicate and process evidence files
  if (Array.isArray(evidenceFiles)) {
    evidenceFiles.forEach(file => {
      if (!file) return;
      const stableId = file.id || uid('cev');
      const evItem = {
        id: stableId,
        applicationId: appId,
        applicationNum: appNum,
        citizenPhone: citizenPhone || '',
        name: file.name || file.fileName || 'Evidence File',
        fileName: file.fileName || file.name || 'Evidence File',
        type: file.type || 'photo',
        fileSize: file.fileSize || file.size || 0,
        dataUrl: file.dataUrl || null,
        previewUrl: file.previewUrl || file.dataUrl || null,
        status: 'Submitted',
        uploadDate: file.uploadDate || nowIso,
        description: file.description || `Attached to complaint ${appNum} (${title})`
      };
      processedEvidence.push(evItem);
      const alreadyExists = DATA.citizenEvidence.some(ce => ce.id === stableId);
      if (!alreadyExists) {
        DATA.citizenEvidence.unshift(evItem);
      }
    });
  }

  const newApp = {
    id: appId,
    num: appNum,
    title,
    category,
    incidentDate: incidentDate || nowIso.split('T')[0],
    location,
    description,
    citizenName: citizenName || 'Citizen',
    citizenPhone: citizenPhone || '',
    status: 'Submitted',
    reviewStatus: 'Pending Review',
    approvedBy: null,
    approvedAt: null,
    rejectedBy: null,
    rejectedAt: null,
    rejectionReason: null,
    handlingDept: 'Metro PD — Investigation Unit',
    policeRemarks: 'Complaint registered. Queued for Police Officer review and formal approval.',
    internalRemarks: '',
    createdAt: nowIso,
    lastUpdated: nowIso,
    statusHistory: [
      {
        status: 'Submitted',
        timestamp: nowIso,
        remarks: 'Complaint registered successfully and queued for police verification.'
      }
    ],
    reviewHistory: [
      {
        action: 'Submitted',
        officerName: 'Citizen Filing',
        timestamp: nowIso,
        remarks: 'Complaint submitted by citizen. Pending police officer review and approval.'
      }
    ],
    evidence: processedEvidence,
    suspectInfo: suspectInfo || null
  };

  DATA.applications.unshift(newApp);

  // Store suspect in citizenSuspects registry if provided
  if (suspectInfo && (suspectInfo.name || suspectInfo.description)) {
    const susItem = {
      id: uid('csus'),
      applicationId: appId,
      applicationNum: appNum,
      citizenPhone: citizenPhone || '',
      name: suspectInfo.name || 'Unknown Subject',
      age: suspectInfo.age || '',
      gender: suspectInfo.gender || 'Unknown',
      location: location,
      description: suspectInfo.description || '',
      details: suspectInfo.description || '',
      photo: suspectInfo.photo || null,
      createdAt: nowIso
    };
    DATA.citizenSuspects.unshift(susItem);
  }

  logActivity('case', null, `New Citizen Complaint registered: ${appNum} - "${title}" in ${location}. (Pending Police Review)`);
  await persist();
  return newApp;
}

/* ============ POLICE APPLICATION APPROVAL & REJECTION WORKFLOW ============ */
export async function approveCitizenApplication(appId, { remarks = '', internalRemarks = '', officerName = 'Police Officer', officerId = null } = {}) {
  if (!DATA) await loadData();
  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app) return null;

  const nowIso = new Date().toISOString();
  const resolvedOfficerName = officerName || DATA.meta.analyst || 'Duty Officer';

  app.reviewStatus = 'Approved';
  app.status = 'Under Review';
  app.approvedBy = resolvedOfficerName;
  app.approvedAt = nowIso;
  app.rejectedBy = null;
  app.rejectedAt = null;
  app.rejectionReason = null;
  app.lastUpdated = nowIso;

  const publicRemark = remarks.trim() || `Application reviewed and approved by ${resolvedOfficerName}. Active investigation initiated.`;
  app.policeRemarks = publicRemark;

  if (internalRemarks && internalRemarks.trim()) {
    app.internalRemarks = internalRemarks.trim();
  }

  if (!Array.isArray(app.statusHistory)) app.statusHistory = [];
  app.statusHistory.push({
    status: 'Under Review',
    timestamp: nowIso,
    remarks: publicRemark
  });

  if (!Array.isArray(app.reviewHistory)) app.reviewHistory = [];
  app.reviewHistory.push({
    action: 'Approved',
    officerName: resolvedOfficerName,
    officerId: officerId || null,
    timestamp: nowIso,
    remarks: publicRemark,
    internalRemarks: internalRemarks ? internalRemarks.trim() : ''
  });

  logActivity('status', null, `Police Officer ${resolvedOfficerName} APPROVED Application ${app.num || app.id} ("${app.title}").`);
  await persist();
  return app;
}

export async function rejectCitizenApplication(appId, { reason = '', internalRemarks = '', officerName = 'Police Officer', officerId = null } = {}) {
  if (!DATA) await loadData();
  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app) return null;

  const nowIso = new Date().toISOString();
  const resolvedOfficerName = officerName || DATA.meta.analyst || 'Duty Officer';
  const cleanReason = reason.trim() || 'Application does not meet jurisdiction or evidential threshold.';

  app.reviewStatus = 'Rejected';
  app.status = 'Rejected';
  app.rejectedBy = resolvedOfficerName;
  app.rejectedAt = nowIso;
  app.rejectionReason = cleanReason;
  app.lastUpdated = nowIso;
  app.policeRemarks = `Application Rejected: ${cleanReason}`;

  if (internalRemarks && internalRemarks.trim()) {
    app.internalRemarks = internalRemarks.trim();
  }

  if (!Array.isArray(app.statusHistory)) app.statusHistory = [];
  app.statusHistory.push({
    status: 'Rejected',
    timestamp: nowIso,
    remarks: `Application Rejected: ${cleanReason}`
  });

  if (!Array.isArray(app.reviewHistory)) app.reviewHistory = [];
  app.reviewHistory.push({
    action: 'Rejected',
    officerName: resolvedOfficerName,
    officerId: officerId || null,
    timestamp: nowIso,
    reason: cleanReason,
    remarks: `Application rejected: ${cleanReason}`,
    internalRemarks: internalRemarks ? internalRemarks.trim() : ''
  });

  logActivity('status', null, `Police Officer ${resolvedOfficerName} REJECTED Application ${app.num || app.id}: "${cleanReason}".`);
  await persist();
  return app;
}

export async function updateApplicationStatus(appId, newStatus, remarks, internalRemarks = '', officerName = 'Investigating Officer') {
  if (!DATA) await loadData();
  const app = DATA.applications.find(a => a.id === appId || a.num === appId);
  if (!app) return false;

  const nowIso = new Date().toISOString();
  const resolvedOfficer = officerName || DATA.meta.analyst || 'Investigating Officer';
  app.status = newStatus;
  
  if (remarks && remarks.trim()) {
    app.policeRemarks = remarks.trim();
  }
  if (internalRemarks && internalRemarks.trim()) {
    app.internalRemarks = internalRemarks.trim();
  }
  app.lastUpdated = nowIso;

  if (!Array.isArray(app.statusHistory)) {
    app.statusHistory = [];
  }

  app.statusHistory.push({
    status: newStatus,
    timestamp: nowIso,
    remarks: remarks || `Status updated to ${newStatus}`
  });

  if (!Array.isArray(app.reviewHistory)) {
    app.reviewHistory = [];
  }
  app.reviewHistory.push({
    action: `Status: ${newStatus}`,
    officerName: resolvedOfficer,
    timestamp: nowIso,
    remarks: remarks || `Investigation status updated to ${newStatus}`,
    internalRemarks: internalRemarks ? internalRemarks.trim() : ''
  });

  logActivity('status', null, `Police updated Application ${app.num || app.id} status to "${newStatus}": "${remarks || ''}"`);
  await persist();
  return true;
}

export async function addCitizenEvidenceItem({ applicationId, name, type, fileSize, dataUrl, previewUrl, description }) {
  if (!DATA) await loadData();
  const app = DATA.applications.find(a => a.id === applicationId || a.num === applicationId);
  const nowIso = new Date().toISOString();
  const currentPhone = DATA.meta.phone || (app ? app.citizenPhone : '') || '';

  if (!Array.isArray(DATA.citizenEvidence)) DATA.citizenEvidence = [];

  // Check if identical evidence already exists in citizenEvidence
  const cleanName = name || 'Evidence Item';
  const duplicate = DATA.citizenEvidence.find(ce => 
    (app ? ce.applicationId === app.id : ce.applicationId === applicationId) &&
    (ce.name === cleanName || ce.fileName === cleanName) &&
    (dataUrl ? ce.dataUrl === dataUrl : true)
  );

  if (duplicate) {
    return duplicate;
  }

  const evId = uid('cev');
  const evItem = {
    id: evId,
    applicationId: app ? app.id : (applicationId || 'app_general'),
    applicationNum: app ? (app.num || app.id) : 'General',
    citizenPhone: app ? (app.citizenPhone || currentPhone) : currentPhone,
    name: cleanName,
    fileName: cleanName,
    type: type || 'photo',
    fileSize: fileSize || 0,
    dataUrl: dataUrl || null,
    previewUrl: previewUrl || dataUrl || null,
    status: 'Submitted',
    uploadDate: nowIso,
    description: description || 'Logged from Citizen Evidence Portal'
  };

  if (app) {
    if (!Array.isArray(app.evidence)) app.evidence = [];
    const appDuplicate = app.evidence.some(e => e.id === evId || (e.name === cleanName && e.dataUrl === dataUrl));
    if (!appDuplicate) {
      app.evidence.push(evItem);
    }
  }

  DATA.citizenEvidence.unshift(evItem);
  logActivity('evidence', null, `Citizen uploaded evidence "${evItem.name}" for ${evItem.applicationNum}.`);
  await persist();
  return evItem;
}

export async function addCitizenSuspectItem({ applicationId, name, age, gender, location, description, photo }) {
  if (!DATA) await loadData();
  const app = DATA.applications.find(a => a.id === applicationId || a.num === applicationId);
  const nowIso = new Date().toISOString();
  const currentPhone = DATA.meta.phone || '';

  const susItem = {
    id: uid('csus'),
    applicationId: app ? app.id : (applicationId || 'app_general'),
    applicationNum: app ? app.num : 'General',
    citizenPhone: currentPhone,
    name: name || 'Unknown Subject',
    age: age || '',
    gender: gender || 'Unknown',
    location: location || '',
    description: description || '',
    details: description || '',
    photo: photo || null,
    createdAt: nowIso
  };

  DATA.citizenSuspects.unshift(susItem);
  logActivity('suspect', null, `Citizen reported suspect "${susItem.name}" for ${susItem.applicationNum}.`);
  await persist();
  return susItem;
}

/* ============ USER ACCOUNT MANAGEMENT & MULTI-SESSION HANDLING ============ */
const SESSIONS_STORAGE_KEY = 'crimeintel_active_sessions';
const HIDDEN_PROFILES_STORAGE_KEY = 'crimeintel_hidden_profiles';

export function getHiddenProfiles() {
  try {
    const raw = localStorage.getItem(HIDDEN_PROFILES_STORAGE_KEY) || sessionStorage.getItem(HIDDEN_PROFILES_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function saveHiddenProfiles(hiddenList) {
  try {
    const valid = Array.isArray(hiddenList) ? hiddenList : [];
    localStorage.setItem(HIDDEN_PROFILES_STORAGE_KEY, JSON.stringify(valid));
    sessionStorage.setItem(HIDDEN_PROFILES_STORAGE_KEY, JSON.stringify(valid));
  } catch (e) {}
}

export function isProfileHidden(identifierOrUser) {
  if (!identifierOrUser) return false;
  const hidden = getHiddenProfiles();
  if (!hidden.length) return false;

  const target = typeof identifierOrUser === 'string'
    ? identifierOrUser.trim().toLowerCase()
    : (identifierOrUser.id || identifierOrUser.email || identifierOrUser.phone || identifierOrUser.fullName || identifierOrUser.name || '').toString().trim().toLowerCase();

  const targetPhone = typeof identifierOrUser === 'string' ? normalizePhone(identifierOrUser) : normalizePhone(identifierOrUser.phone || '');

  return hidden.some(h => {
    if (!h) return false;
    const hStr = h.toString().trim().toLowerCase();
    const hPhone = normalizePhone(hStr);
    return (hStr && hStr === target) || (targetPhone && hPhone && targetPhone === hPhone);
  });
}

export function hideProfileFromQuickList(identifier) {
  if (!identifier) return;
  const hidden = getHiddenProfiles();
  const target = identifier.toString().trim().toLowerCase();
  const targetPhone = normalizePhone(identifier.toString());

  // Check if already in list
  const exists = hidden.some(h => {
    const hStr = h.toString().trim().toLowerCase();
    return hStr === target || (targetPhone && normalizePhone(hStr) === targetPhone);
  });

  if (!exists) {
    hidden.push(target);
    if (targetPhone && targetPhone !== target) {
      hidden.push(targetPhone);
    }
    saveHiddenProfiles(hidden);
  }

  // Also remove from active sessions so it's logged out on this device
  removeAccountFromActiveSessions(identifier);
  return hidden;
}

export function unhideProfileFromQuickList(identifier) {
  if (!identifier) return;
  const hidden = getHiddenProfiles();
  if (!hidden.length) return;

  const target = identifier.toString().trim().toLowerCase();
  const targetPhone = normalizePhone(identifier.toString());

  const remaining = hidden.filter(h => {
    const hStr = h.toString().trim().toLowerCase();
    if (hStr === target) return false;
    if (targetPhone && normalizePhone(hStr) === targetPhone) return false;
    return true;
  });

  saveHiddenProfiles(remaining);
  return remaining;
}

export function getRegisteredUsers() {
  if (!DATA) return [];
  if (!Array.isArray(DATA.users)) {
    DATA.users = [];
  }
  return DATA.users;
}

export function getActiveSessions() {
  try {
    const raw = localStorage.getItem(SESSIONS_STORAGE_KEY) || sessionStorage.getItem(SESSIONS_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {}

  // If no sessions stored yet but current user is authenticated, initialize with current user
  if (DATA && DATA.meta && DATA.meta.analyst && DATA.meta.role) {
    const defaultSession = {
      id: DATA.meta.userId || (DATA.meta.email ? `usr_${DATA.meta.email}` : `usr_${DATA.meta.phone || 'def'}`),
      fullName: DATA.meta.analyst,
      name: DATA.meta.analyst,
      role: DATA.meta.role,
      email: DATA.meta.email || '',
      phone: DATA.meta.phone || '',
      org: DATA.meta.org || '',
      lastActive: new Date().toISOString()
    };
    saveActiveSessions([defaultSession]);
    return [defaultSession];
  }
  return [];
}

export function saveActiveSessions(sessions) {
  try {
    const valid = Array.isArray(sessions) ? sessions : [];
    localStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(valid));
    sessionStorage.setItem(SESSIONS_STORAGE_KEY, JSON.stringify(valid));
  } catch (e) {}
}

export function isAccountLoggedIn(identifierOrUser) {
  if (!identifierOrUser) return false;
  const sessions = getActiveSessions();
  const target = typeof identifierOrUser === 'string' 
    ? identifierOrUser.trim().toLowerCase() 
    : (identifierOrUser.id || identifierOrUser.email || identifierOrUser.phone || identifierOrUser.fullName || identifierOrUser.name || '').toString().trim().toLowerCase();
  
  return sessions.some(s => {
    if (!s) return false;
    const sId = (s.id || '').toString().toLowerCase();
    const sEmail = (s.email || '').toString().toLowerCase();
    const sPhone = normalizePhone(s.phone || '');
    const sName = (s.fullName || s.name || '').toString().toLowerCase();
    return (sId && sId === target) || (sEmail && sEmail === target) || (sPhone && sPhone === normalizePhone(target)) || (sName && sName === target);
  });
}

export function addAccountToActiveSessions(user) {
  if (!user) return;
  // Automatically restore visibility if this account was previously hidden
  unhideProfileFromQuickList(user.id || user.email || user.phone);

  const sessions = getActiveSessions();
  const targetId = (user.id || user.email || user.phone || user.fullName || '').toString().toLowerCase();
  const targetEmail = (user.email || '').toString().toLowerCase();
  const targetPhone = normalizePhone(user.phone || '');

  const filtered = sessions.filter(s => {
    if (!s) return false;
    const sId = (s.id || '').toString().toLowerCase();
    const sEmail = (s.email || '').toString().toLowerCase();
    const sPhone = normalizePhone(s.phone || '');
    if (sId && sId === targetId) return false;
    if (targetEmail && sEmail && sEmail === targetEmail) return false;
    if (targetPhone && sPhone && sPhone === targetPhone) return false;
    return true;
  });

  const sessionObj = {
    id: user.id || `usr_${Date.now()}`,
    fullName: user.fullName || user.name || 'User',
    name: user.fullName || user.name || 'User',
    role: user.role || 'Police Officer',
    email: user.email || '',
    phone: user.phone || '',
    org: user.role === 'Citizen' ? 'CrimeIntel — Citizen Public Portal' : 'Metro PD — Intelligence & Analysis Unit',
    lastActive: new Date().toISOString()
  };

  filtered.unshift(sessionObj);
  saveActiveSessions(filtered);
  return sessionObj;
}

export function removeAccountFromActiveSessions(identifier) {
  const sessions = getActiveSessions();
  const target = (identifier || '').toString().trim().toLowerCase();
  const targetPhone = normalizePhone(identifier || '');

  const remaining = sessions.filter(s => {
    if (!s) return false;
    const sId = (s.id || '').toString().toLowerCase();
    const sEmail = (s.email || '').toString().toLowerCase();
    const sPhone = normalizePhone(s.phone || '');
    const sName = (s.fullName || s.name || '').toString().toLowerCase();
    if (sId && sId === target) return false;
    if (sEmail && sEmail === target) return false;
    if (targetPhone && sPhone && sPhone === targetPhone) return false;
    if (sName && sName === target) return false;
    return true;
  });

  saveActiveSessions(remaining);
  return remaining;
}

export function normalizePhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  return phone.replace(/\D/g, '');
}

export function findUserByPhone(phone) {
  if (!phone) return null;
  const target = normalizePhone(phone);
  const users = getRegisteredUsers();
  return users.find(u => u.phone && (normalizePhone(u.phone) === target || u.phone.trim() === phone.trim())) || null;
}

export function findUserByEmail(email) {
  if (!email) return null;
  const users = getRegisteredUsers();
  return users.find(u => u.email && u.email.trim().toLowerCase() === email.trim().toLowerCase()) || null;
}

export function findUserAccount({ role, identifier }) {
  if (!role || !identifier) return null;
  const users = getRegisteredUsers();
  const targetRole = role.trim().toLowerCase();

  if (targetRole === 'citizen') {
    const targetPhone = normalizePhone(identifier);
    return users.find(u => 
      u.role && u.role.toLowerCase() === 'citizen' &&
      u.phone && (normalizePhone(u.phone) === targetPhone || u.phone.trim() === identifier.trim())
    ) || null;
  } else if (targetRole === 'police officer') {
    const targetEmail = identifier.trim().toLowerCase();
    return users.find(u => 
      u.role && u.role.toLowerCase() === 'police officer' &&
      u.email && u.email.trim().toLowerCase() === targetEmail
    ) || null;
  }

  return null;
}

export async function registerNewUser({ role, fullName, phone, email, password }) {
  if (!DATA) await loadData();
  if (!Array.isArray(DATA.users)) {
    DATA.users = [];
  }

  const isCitizen = role === 'Citizen';
  const cleanName = (fullName || '').trim();
  const cleanPhone = (phone || '').trim();

  const newUser = {
    id: uid('usr_'),
    role: isCitizen ? 'Citizen' : 'Police Officer',
    fullName: cleanName,
    name: cleanName,
    phone: cleanPhone,
    password: password,
    createdAt: new Date().toISOString()
  };

  if (!isCitizen && email) {
    newUser.email = email.trim().toLowerCase();
  }

  DATA.users.push(newUser);
  logActivity('user', null, `New ${newUser.role} account registered: ${newUser.fullName}.`);
  await persist();
  return newUser;
}

/* ============ DELETION & PROFILE MANAGEMENT FUNCTIONS ============ */

/**
 * Delete Citizen Evidence (ONLY allowed for active/non-resolved cases)
 */
export async function deleteCitizenEvidence(evidenceId) {
  if (!DATA) await loadData();
  if (!Array.isArray(DATA.citizenEvidence)) DATA.citizenEvidence = [];

  const currentPhone = normalizePhone(DATA.meta?.phone || '');
  const currentName = (DATA.meta?.analyst || '').trim().toLowerCase();
  const currentUserId = DATA.meta?.userId || '';
  const isPolice = DATA.meta?.role === 'Police Officer';

  // 1. Identify the exact evidence ID & record
  let evIndex = DATA.citizenEvidence.findIndex(e => e.id === evidenceId);
  let ev = evIndex !== -1 ? DATA.citizenEvidence[evIndex] : null;
  let targetApp = null;

  // Search in applications
  for (const app of (DATA.applications || [])) {
    if (Array.isArray(app.evidence)) {
      const match = app.evidence.find(e => e.id === evidenceId || (ev && e.id === ev.id) || (ev && e.name === ev.name));
      if (match) {
        targetApp = app;
        if (!ev) ev = match;
        break;
      }
    }
  }

  if (!targetApp && ev) {
    targetApp = (DATA.applications || []).find(a => a.id === ev.applicationId || a.num === ev.applicationNum);
  }

  if (!ev && !targetApp) {
    return { success: false, message: 'Evidence not found' };
  }

  // 2. Verify that the evidence belongs to the currently authenticated Citizen
  if (!isPolice) {
    const isOwner = (() => {
      if (!currentPhone && !currentName && !currentUserId) {
        return true;
      }
      if (ev && ev.citizenPhone && currentPhone && (normalizePhone(ev.citizenPhone) === currentPhone || ev.citizenPhone.trim() === (DATA.meta.phone || '').trim())) {
        return true;
      }
      if (targetApp) {
        if (targetApp.citizenPhone && currentPhone && (normalizePhone(targetApp.citizenPhone) === currentPhone || targetApp.citizenPhone.trim() === (DATA.meta.phone || '').trim())) {
          return true;
        }
        if (targetApp.citizenName && currentName && targetApp.citizenName.trim().toLowerCase() === currentName) {
          return true;
        }
        if (targetApp.userId && currentUserId && targetApp.userId === currentUserId) {
          return true;
        }
      }
      const visibleList = getCitizenEvidence(currentPhone);
      if (visibleList.some(item => item.id === evidenceId || (ev && item.id === ev.id))) {
        return true;
      }
      return false;
    })();

    if (!isOwner) {
      return { success: false, message: 'You are not authorized to delete this evidence.' };
    }
  }

  // 3. Verify that the evidence belongs to an active case (not resolved/closed)
  if (targetApp && (targetApp.status === 'Resolved' || targetApp.status === 'Closed')) {
    return { success: false, message: 'Evidence from a resolved or past case cannot be deleted.' };
  }

  const targetEvId = ev ? ev.id : evidenceId;
  const targetEvName = ev ? (ev.name || ev.fileName) : null;

  // 4. Remove that exact evidence object from DATA.citizenEvidence
  DATA.citizenEvidence = DATA.citizenEvidence.filter(e => {
    if (e.id === evidenceId || e.id === targetEvId) return false;
    return true;
  });

  // 5. Remove that exact evidence object from the actual stored application record
  if (targetApp && Array.isArray(targetApp.evidence)) {
    targetApp.evidence = targetApp.evidence.filter(e => {
      if (e.id === evidenceId || e.id === targetEvId) return false;
      return true;
    });
  }

  // Clean across all application records
  (DATA.applications || []).forEach(app => {
    if (Array.isArray(app.evidence)) {
      app.evidence = app.evidence.filter(e => e.id !== evidenceId && e.id !== targetEvId);
    }
  });

  // Clean across cases if linked
  (DATA.cases || []).forEach(c => {
    if (Array.isArray(c.evidence)) {
      c.evidence = c.evidence.filter(e => e.id !== evidenceId && e.id !== targetEvId);
    }
  });

  logActivity('evidence', null, `Citizen deleted evidence "${targetEvName || 'Evidence Item'}".`);
  await persist();
  return { success: true, message: 'Evidence deleted successfully.' };
}

/**
 * Delete Citizen Application (ONLY allowed for Resolved / Closed cases)
 */
export async function deleteCitizenApplication(appId) {
  if (!DATA) await loadData();
  if (!Array.isArray(DATA.applications)) return { success: false, message: 'No applications found' };

  const appIndex = DATA.applications.findIndex(a => a.id === appId || a.num === appId);
  if (appIndex === -1) return { success: false, message: 'Application not found' };

  const app = DATA.applications[appIndex];
  if (app.status !== 'Resolved' && app.status !== 'Closed') {
    return { success: false, message: 'Only resolved applications can be deleted' };
  }

  // Remove application
  DATA.applications.splice(appIndex, 1);

  // Remove associated citizen evidence
  if (Array.isArray(DATA.citizenEvidence)) {
    DATA.citizenEvidence = DATA.citizenEvidence.filter(e => e.applicationId !== app.id && e.applicationNum !== app.num);
  }

  // Remove associated citizen suspects
  if (Array.isArray(DATA.citizenSuspects)) {
    DATA.citizenSuspects = DATA.citizenSuspects.filter(s => s.applicationId !== app.id && s.applicationNum !== app.num);
  }

  logActivity('case', null, `Citizen deleted resolved application ${app.num || app.id} ("${app.title}").`);
  await persist();
  return { success: true };
}

/**
 * Delete Citizen Suspect
 */
export async function deleteCitizenSuspect(suspectId) {
  if (!DATA) await loadData();
  if (!Array.isArray(DATA.citizenSuspects)) return { success: false, message: 'No suspects found' };

  const susIndex = DATA.citizenSuspects.findIndex(s => s.id === suspectId);
  if (susIndex === -1) return { success: false, message: 'Suspect not found' };

  const sus = DATA.citizenSuspects[susIndex];
  DATA.citizenSuspects.splice(susIndex, 1);

  logActivity('suspect', null, `Citizen deleted suspect entry "${sus.name}".`);
  await persist();
  return { success: true };
}

/**
 * Delete User Account / Profile
 */
export async function deleteUserProfile(identifier) {
  if (!DATA) await loadData();
  if (!Array.isArray(DATA.users)) return false;

  const target = (identifier || '').toString().trim().toLowerCase();
  const currentEmail = (DATA.meta?.email || '').trim().toLowerCase();
  const currentPhone = normalizePhone(DATA.meta?.phone || '');
  const currentName = (DATA.meta?.analyst || '').trim().toLowerCase();

  const userIndex = DATA.users.findIndex(u => {
    if (!u) return false;
    const uId = (u.id || '').toString().toLowerCase();
    const uEmail = (u.email || '').toString().toLowerCase();
    const uPhone = normalizePhone(u.phone || '');
    const uName = (u.fullName || u.name || '').toString().toLowerCase();

    if (target && (uId === target || uEmail === target || (uPhone && uPhone === target) || uName === target)) {
      return true;
    }
    if (currentEmail && uEmail && uEmail === currentEmail) return true;
    if (currentPhone && uPhone && uPhone === currentPhone) return true;
    if (currentName && uName && uName === currentName) return true;
    return false;
  });

  if (userIndex !== -1) {
    const deletedUser = DATA.users[userIndex];
    DATA.users.splice(userIndex, 1);
    logActivity('user', null, `User profile removed: ${deletedUser.fullName || deletedUser.name}.`);
    await persist();
    return true;
  }
  return false;
}

/**
 * Switch Active Police Officer Profile
 * - If account is already logged in (active session), switches directly WITHOUT password prompt
 * - If account is logged out, requires and verifies password
 */
export async function switchPoliceProfile(officerIdOrEmail, password) {
  if (!DATA) await loadData();
  const users = getRegisteredUsers();
  const target = (officerIdOrEmail || '').toString().trim().toLowerCase();

  const officer = users.find(u => {
    if (u.role !== 'Police Officer') return false;
    const uId = (u.id || '').toString().toLowerCase();
    const uEmail = (u.email || '').toString().toLowerCase();
    const uName = (u.fullName || u.name || '').toString().toLowerCase();
    return uId === target || uEmail === target || uName === target;
  });

  if (!officer) return { success: false, error: 'Officer account not found.' };

  const alreadyLoggedIn = isAccountLoggedIn(officer);

  // If the account is logged out (not in active sessions), verify password
  if (!alreadyLoggedIn) {
    if (password == null || password === '') {
      return { success: false, requiresPassword: true, error: 'Password required for logged-out account.' };
    }
    if (officer.password !== password) {
      return { success: false, error: 'Incorrect password. Please enter the correct password for this officer account.' };
    }
  }

  DATA.meta.analyst = officer.fullName || officer.name;
  DATA.meta.role = 'Police Officer';
  DATA.meta.email = officer.email || '';
  DATA.meta.phone = officer.phone || '';
  DATA.meta.org = 'Metro PD — Intelligence & Analysis Unit';

  // Add to active logged-in sessions
  addAccountToActiveSessions(officer);

  try {
    sessionStorage.setItem('crimeintel_session', JSON.stringify({
      analyst: DATA.meta.analyst,
      role: DATA.meta.role,
      phone: DATA.meta.phone,
      email: DATA.meta.email,
      org: DATA.meta.org
    }));
  } catch (e) {}

  logActivity('user', null, `Session switched to Officer ${DATA.meta.analyst}.`);
  await persist();
  return { success: true, officer, alreadyLoggedIn };
}

/**
 * Switch Active Citizen Profile
 */
export async function switchCitizenProfile(citizenIdOrPhone, password) {
  if (!DATA) await loadData();
  const users = getRegisteredUsers();
  const target = (citizenIdOrPhone || '').toString().trim().toLowerCase();
  const targetPhone = normalizePhone(citizenIdOrPhone || '');

  const citizen = users.find(u => {
    if (u.role !== 'Citizen') return false;
    const uId = (u.id || '').toString().toLowerCase();
    const uPhone = normalizePhone(u.phone || '');
    const uName = (u.fullName || u.name || '').toString().toLowerCase();
    return uId === target || (uPhone && uPhone === targetPhone) || uName === target;
  });

  if (!citizen) return { success: false, error: 'Citizen account not found.' };

  const alreadyLoggedIn = isAccountLoggedIn(citizen);

  if (!alreadyLoggedIn) {
    if (password == null || password === '') {
      return { success: false, requiresPassword: true, error: 'Password required for logged-out account.' };
    }
    if (citizen.password !== password) {
      return { success: false, error: 'Incorrect password for this citizen account.' };
    }
  }

  DATA.meta.analyst = citizen.fullName || citizen.name;
  DATA.meta.role = 'Citizen';
  DATA.meta.phone = citizen.phone || '';
  DATA.meta.email = citizen.email || '';
  DATA.meta.org = 'CrimeIntel — Citizen Public Portal';

  addAccountToActiveSessions(citizen);

  try {
    sessionStorage.setItem('crimeintel_session', JSON.stringify({
      analyst: DATA.meta.analyst,
      role: DATA.meta.role,
      phone: DATA.meta.phone,
      email: DATA.meta.email,
      org: DATA.meta.org
    }));
  } catch (e) {}

  logActivity('user', null, `Citizen session switched to ${DATA.meta.analyst}.`);
  await persist();
  return { success: true, citizen, alreadyLoggedIn };
}

/**
 * Universal Evidence Finder by ID across Cases, Citizen Evidence, and Applications
 */
export function findEvidenceById(id) {
  if (!DATA || !id) return null;
  // Search in allEvidence() first for fully-hydrated unified records
  const all = allEvidence();
  const foundInAll = all.find(e => e.id === id);
  if (foundInAll) return foundInAll;

  // Fallback: Search in cases
  for (const c of (DATA.cases || [])) {
    const found = (c.evidence || []).find(e => e.id === id);
    if (found) return { ...found, caseTitle: c.title, caseNum: c.num };
  }
  // Fallback: Search in applications
  for (const app of (DATA.applications || [])) {
    if (id === `ev_stmt_${app.id}`) {
      return {
        id: `ev_stmt_${app.id}`,
        caseId: app.id,
        caseNum: app.num || app.id,
        caseTitle: `[Citizen] ${app.num || app.id}: ${app.title}`,
        applicationId: app.id,
        applicationNum: app.num || app.id,
        citizenName: app.citizenName || 'Citizen',
        citizenPhone: app.citizenPhone || '',
        text: `Citizen Incident Statement (${app.citizenName || 'Citizen'}${app.citizenPhone ? ` · ${app.citizenPhone}` : ''}): "${app.description}"`,
        name: `Citizen Statement — ${app.category || 'Complaint'}`,
        location: app.location || 'Incident Location',
        time: app.incidentDate || (app.createdAt ? app.createdAt.slice(0, 10) : '—'),
        type: 'witness',
        tags: ['citizen-statement', 'public-grievance', (app.category || 'complaint').toLowerCase().replace(/\s+/g, '-')],
        loggedAt: app.createdAt,
        status: app.reviewStatus || 'Verified',
        source: 'citizen'
      };
    }
    const aFound = (app.evidence || []).find(e => e.id === id);
    if (aFound) {
      return {
        ...aFound,
        caseId: app.id,
        caseNum: app.num || app.id,
        caseTitle: `[Citizen] ${app.num || app.id}: ${app.title}`,
        applicationTitle: app.title,
        applicationNum: app.num || app.id
      };
    }
  }
  // Fallback: Search in citizenEvidence
  const cFound = (DATA.citizenEvidence || []).find(e => e.id === id);
  if (cFound) {
    const parentApp = (DATA.applications || []).find(a => a.id === cFound.applicationId || a.num === cFound.applicationNum);
    return {
      ...cFound,
      caseTitle: parentApp ? `[Citizen] ${parentApp.num || parentApp.id}: ${parentApp.title}` : `Citizen Complaint (${cFound.applicationNum || cFound.applicationId || 'General'})`,
      caseNum: parentApp ? (parentApp.num || parentApp.id) : (cFound.applicationNum || cFound.applicationId)
    };
  }
  return null;
}


