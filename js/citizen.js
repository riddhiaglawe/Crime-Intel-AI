/**
 * CrimeIntel AI — Citizen Portal Module
 * Provides Dashboard, Report Complaint (Type & Voice-to-Text), Application Tracking, Evidence Log & Suspect Log
 */

import {
  DATA,
  getCitizenApplications,
  getCitizenEvidence,
  getCitizenSuspects,
  createCitizenComplaint,
  addCitizenEvidenceItem,
  addCitizenSuspectItem,
  deleteCitizenEvidence,
  deleteCitizenApplication,
  deleteCitizenSuspect,
  persist
} from './data.js';

import {
  escapeHtml,
  fmtDate,
  showToast,
  openModal,
  closeModal
} from './ui.js';

import { go, route } from './router.js';

/* ============ SPEECH RECOGNITION STATE ============ */
let speechRecognitionInstance = null;
let isListening = false;

/* ============ CAMERA CAPTURE STATE ============ */
let cameraStream = null;
let capturedPhotoData = null;
let currentCameraTarget = 'complaint'; // 'complaint' | 'evidence' | 'suspect'

/* ============ FILTER STATE ============ */
export let citizenSuspectCaseFilter = 'all';
export let citizenEvidenceCaseFilter = 'all';

export function setCitizenSuspectCaseFilter(caseId) {
  citizenSuspectCaseFilter = caseId;
  if (window.render) window.render();
}

export function setCitizenEvidenceCaseFilter(caseId) {
  citizenEvidenceCaseFilter = caseId;
  if (window.render) window.render();
}

/* ==========================================================================
   NAGPUR POLICE STATION JURISDICTION MATCHING
   ========================================================================== */
const NAGPUR_POLICE_STATIONS = [
  {
    id: 'ambazari',
    name: 'Ambazari Police Station',
    zone: 'Nagpur City Police — Zone I',
    address: 'Near Ambazari Lake / South Ambazari Road, Ambazari, Nagpur, Maharashtra 440033',
    phone: '0712-2226506',
    controlRoom: '100 / 112',
    email: 'ps.ambazari@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1297,
    lng: 79.0444,
    mapsQuery: 'Ambazari Police Station, Nagpur',
    keywords: [
      'ambazari', 'ambazari lake', 'ambazhari', 'seminary hills', 'dharampeth',
      'west high court', 'whc road', 'shankar nagar', 'laxminagar west',
      'south ambazari', 'vnit gate west'
    ]
  },
  {
    id: 'sitabuldi',
    name: 'Sitabuldi Police Station',
    zone: 'Nagpur City Police — Zone I',
    address: 'Sitabuldi Fort / Variety Square, Sitabuldi, Nagpur, Maharashtra 440012',
    phone: '0712-2560478',
    controlRoom: '100 / 112',
    email: 'ps.sitabuldi@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1458,
    lng: 79.0882,
    mapsQuery: 'Sitabuldi Police Station, Nagpur',
    keywords: [
      'sitabuldi', 'sitabardi', 'sitaburdi', 'sitabuldi fort', 'variety square',
      'central avenue', 'railway station nagpur', 'nagpur railway', 'mahal road',
      'residency road', 'cotton market sitabuldi', 'city centre nagpur'
    ]
  },
  {
    id: 'sadar',
    name: 'Sadar Police Station',
    zone: 'Nagpur City Police — Zone II',
    address: 'Sadar Bazaar, Kingsway / Kamptee Road side, Sadar, Nagpur, Maharashtra 440001',
    phone: '0712-2522222',
    controlRoom: '100 / 112',
    email: 'ps.sadar@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1619,
    lng: 79.0831,
    mapsQuery: 'Sadar Police Station, Nagpur',
    keywords: [
      'sadar', 'sadar bazaar', 'sadar nagpur', 'kingsway', 'kamptee road',
      'gokulpeth', 'itwari', 'mount road', 'civil lines north'
    ]
  },
  {
    id: 'bajaj-nagar',
    name: 'Bajaj Nagar Police Station',
    zone: 'Nagpur City Police — Zone III',
    address: 'Bajaj Nagar, near VNIT / Ravi Nagar, Nagpur, Maharashtra 440010',
    phone: '0712-2233657',
    controlRoom: '100 / 112',
    email: 'ps.bajajnagar@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1233,
    lng: 79.0511,
    mapsQuery: 'Bajaj Nagar Police Station, Nagpur',
    keywords: [
      'bajaj nagar', 'bajajnagar', 'vnit', 'visvesvaraya', 'ravi nagar',
      'laxmi nagar', 'laxminagar', 'abhyankar nagar', 'trimurti nagar west'
    ]
  },
  {
    id: 'dhantoli',
    name: 'Dhantoli Police Station',
    zone: 'Nagpur City Police — Zone I',
    address: 'Dhantoli, near Medical Square / Ramdaspeth, Nagpur, Maharashtra 440012',
    phone: '0712-2565893',
    controlRoom: '100 / 112',
    email: 'ps.dhantoli@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1406,
    lng: 79.0839,
    mapsQuery: 'Dhantoli Police Station, Nagpur',
    keywords: [
      'dhantoli', 'ramdaspeth', 'ramdas peth', 'medical square', 'ghat road',
      'congress nagar', 'civil lines', 'whc dhantoli', 'lokmat square',
      'zero mile', 'mahal dhantoli'
    ]
  },
  {
    id: 'sonegaon',
    name: 'Sonegaon Police Station',
    zone: 'Nagpur City Police — Zone III',
    address: 'Sonegaon, Wardha Road / Airport area, Nagpur, Maharashtra 440025',
    phone: '0712-2283706',
    controlRoom: '100 / 112',
    email: 'ps.sonegaon@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.0922,
    lng: 79.0470,
    mapsQuery: 'Sonegaon Police Station, Nagpur',
    keywords: [
      'sonegaon', 'sonagaon', 'sonagaon airport', 'nagpur airport', 'dr babasaheb',
      'wardha road', 'somalwada', 'manish nagar',
      'airport', 'airport nagpur', 'sonegaon police'
    ]
  },
  {
    id: 'wathoda',
    name: 'Wathoda Police Station',
    zone: 'Nagpur City Police — Zone IV',
    address: 'Wathoda Layout, Nagpur, Maharashtra 440009',
    phone: '0712-2999999',
    controlRoom: '100 / 112',
    email: 'ps.wathoda@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1300,
    lng: 79.1350,
    mapsQuery: 'Wathoda Police Station, Nagpur',
    keywords: [
      'wathoda', 'wathoda layout', 'symbiosis nagpur', 'kharbi', 'dighori'
    ]
  },
  {
    id: 'nandanvan',
    name: 'Nandanvan Police Station',
    zone: 'Nagpur City Police — Zone IV',
    address: 'Nandanvan Road, Nagpur, Maharashtra 440009',
    phone: '0712-2710123',
    controlRoom: '100 / 112',
    email: 'ps.nandanvan@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1275,
    lng: 79.1235,
    mapsQuery: 'Nandanvan Police Station, Nagpur',
    keywords: [
      'nandanvan', 'hasanbagh', 'vyankatesh nagar', 'darshan colony'
    ]
  },
  {
    id: 'kamptee',
    name: 'Kamptee Police Station',
    zone: 'Nagpur City Police — Zone V',
    address: 'Kamptee (Kamthi), Nagpur, Maharashtra 441002',
    phone: '0712-2612222',
    controlRoom: '100 / 112',
    email: 'ps.kamptee@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.2230,
    lng: 79.1985,
    mapsQuery: 'Kamptee Police Station, Nagpur',
    keywords: [
      'kamptee', 'kamthi', 'dragon palace', 'kamptee cantonment', 'kanhan'
    ]
  },
  {
    id: 'gaddigodam',
    name: 'Gaddigodam Police Station',
    zone: 'Nagpur City Police — Zone II',
    address: 'Gaddigodam Square, Kamptee Road, Nagpur, Maharashtra 440001',
    phone: '0712-2525555',
    controlRoom: '100 / 112',
    email: 'ps.gaddigodam@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1645,
    lng: 79.0850,
    mapsQuery: 'Gaddigodam Police Station, Nagpur',
    keywords: [
      'gaddigodam', 'gaddi godam', 'gaddigudam', 'mohamin nagar', 'khalasi line'
    ]
  },
  {
    id: 'ajni',
    name: 'Ajni Police Station',
    zone: 'Nagpur City Police',
    address: 'Ring Road, Rameshwari / Empress Mill Colony, Nagpur, Maharashtra',
    phone: '0712-2270399',
    controlRoom: '100 / 112',
    email: 'ps.ajni@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1158,
    lng: 79.0835,
    mapsQuery: 'Ajni Police Station, Nagpur',
    keywords: ['ajni', 'rameshwari', 'empress mill colony', 'manewada ring road']
  },
  {
    id: 'beltarodi',
    name: 'Beltarodi Police Station',
    zone: 'Nagpur City Police',
    address: 'Besa Beltarodi Road, Nagpur, Maharashtra',
    phone: '0712-2811444',
    controlRoom: '100 / 112',
    email: 'ps.beltarodi@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.0850,
    lng: 79.0850,
    mapsQuery: 'Beltarodi Police Station, Nagpur',
    keywords: ['beltarodi', 'besa', 'besa road', 'manish nagar south']
  },
  {
    id: 'hudkeshwar',
    name: 'Hudkeshwar Police Station',
    zone: 'Nagpur City Police',
    address: 'Pipla Road, Manewada, Nagpur, Maharashtra',
    phone: '0712-2746400',
    controlRoom: '100 / 112',
    email: 'ps.hudkeshwar@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1000,
    lng: 79.1100,
    mapsQuery: 'Hudkeshwar Police Station, Nagpur',
    keywords: ['hudkeshwar', 'pipla', 'pipla road', 'manewada']
  },
  {
    id: 'sakkardara',
    name: 'Sakkardara Police Station',
    zone: 'Nagpur City Police',
    address: 'Chota Tajbag Road, Azamshah Layout, Nagpur, Maharashtra',
    phone: '0712-2746401',
    controlRoom: '100 / 112',
    email: 'ps.sakkardara@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1190,
    lng: 79.1090,
    mapsQuery: 'Sakkardara Police Station, Nagpur',
    keywords: ['sakkardara', 'tajbag', 'azamshah layout', 'bhande plot']
  },
  {
    id: 'imamwada',
    name: 'Imamwada Police Station',
    zone: 'Nagpur City Police',
    address: 'Baidyanath Square, Great Nag Road, Nagpur, Maharashtra',
    phone: '0712-2746402',
    controlRoom: '100 / 112',
    email: 'ps.imamwada@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1320,
    lng: 79.0960,
    mapsQuery: 'Imamwada Police Station, Nagpur',
    keywords: ['imamwada', 'baidyanath square', 'great nag road', 'rambagh', 'untakhana']
  },
  {
    id: 'jaripatka',
    name: 'Jaripatka Police Station',
    zone: 'Nagpur City Police',
    address: 'Ring Road, Kukreja Nagar, Nagpur, Maharashtra',
    phone: '0712-2646403',
    controlRoom: '100 / 112',
    email: 'ps.jaripatka@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1890,
    lng: 79.0830,
    mapsQuery: 'Jaripatka Police Station, Nagpur',
    keywords: ['jaripatka', 'kukreja nagar', 'indora', 'nari road', 'dixit nagar']
  },
  {
    id: 'koradi',
    name: 'Koradi Police Station',
    zone: 'Nagpur City Police',
    address: 'Chhindwara Road, Koradi, Nagpur, Maharashtra',
    phone: '0712-2646404',
    controlRoom: '100 / 112',
    email: 'ps.koradi@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.2400,
    lng: 79.0800,
    mapsQuery: 'Koradi Police Station, Nagpur',
    keywords: ['koradi', 'chhindwara road', 'koradi thermal power']
  },
  {
    id: 'mankapur',
    name: 'Mankapur Police Station',
    zone: 'Nagpur City Police',
    address: 'Zingabai Takli, Mankapur, Nagpur, Maharashtra',
    phone: '0712-2646405',
    controlRoom: '100 / 112',
    email: 'ps.mankapur@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1800,
    lng: 79.0600,
    mapsQuery: 'Mankapur Police Station, Nagpur',
    keywords: ['mankapur', 'zingabai takli', 'gorewada']
  },
  {
    id: 'kapil-nagar',
    name: 'Kapil Nagar Police Station',
    zone: 'Nagpur City Police',
    address: 'Sahayog Nagar, Angulimal Nagar, Nagpur, Maharashtra',
    phone: '0712-2646406',
    controlRoom: '100 / 112',
    email: 'ps.kapilnagar@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1950,
    lng: 79.1000,
    mapsQuery: 'Kapil Nagar Police Station, Nagpur',
    keywords: ['kapil nagar', 'sahayog nagar', 'angulimal nagar']
  },
  {
    id: 'pachpaoli',
    name: 'Pachpaoli Police Station',
    zone: 'Nagpur City Police',
    address: 'Ambedkar Road, Kamal Chowk, Nagpur, Maharashtra',
    phone: '0712-2646407',
    controlRoom: '100 / 112',
    email: 'ps.pachpaoli@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1650,
    lng: 79.0950,
    mapsQuery: 'Pachpaoli Police Station, Nagpur',
    keywords: ['pachpaoli', 'kamal chowk', 'ambedkar road', 'laskharibagh']
  },
  {
    id: 'yashodhara-nagar',
    name: 'Yashodhara Nagar Police Station',
    zone: 'Nagpur City Police',
    address: 'Tipu Sultan Chowk, Sidharth Nagar, Nagpur, Maharashtra',
    phone: '0712-2646408',
    controlRoom: '100 / 112',
    email: 'ps.yashodharanagar@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1750,
    lng: 79.1150,
    mapsQuery: 'Yashodhara Nagar Police Station, Nagpur',
    keywords: ['yashodhara nagar', 'tipu sultan chowk', 'sidharth nagar']
  },
  {
    id: 'kotwali',
    name: 'Kotwali Police Station',
    zone: 'Nagpur City Police',
    address: 'Tilak Road, Mahal, Nagpur, Maharashtra',
    phone: '0712-2720202',
    controlRoom: '100 / 112',
    email: 'ps.kotwali@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1450,
    lng: 79.0950,
    mapsQuery: 'Kotwali Police Station, Nagpur',
    keywords: ['kotwali', 'tilak road', 'mahal', 'badkas chowk']
  },
  {
    id: 'ganeshpeth',
    name: 'Ganeshpeth Police Station',
    zone: 'Nagpur City Police',
    address: 'Gandhi Sagar Lake, Ganeshpeth, Nagpur, Maharashtra',
    phone: '0712-2720203',
    controlRoom: '100 / 112',
    email: 'ps.ganeshpeth@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1400,
    lng: 79.0900,
    mapsQuery: 'Ganeshpeth Police Station, Nagpur',
    keywords: ['ganeshpeth', 'gandhi sagar lake', 'cotton market', 'sbct']
  },
  {
    id: 'tahsil',
    name: 'Tahsil Police Station',
    zone: 'Nagpur City Police',
    address: 'Nanga Putla Chowk, Gandhibagh, Nagpur, Maharashtra',
    phone: '0712-2720204',
    controlRoom: '100 / 112',
    email: 'ps.tahsil@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1500,
    lng: 79.1000,
    mapsQuery: 'Tahsil Police Station, Nagpur',
    keywords: ['tahsil', 'gandhibagh', 'nanga putla chowk', 'daga hospital']
  },
  {
    id: 'lakadganj',
    name: 'Lakadganj Police Station',
    zone: 'Nagpur City Police',
    address: 'Bhandara Road, Queta Colony, Nagpur, Maharashtra',
    phone: '0712-2720205',
    controlRoom: '100 / 112',
    email: 'ps.lakadganj@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1550,
    lng: 79.1150,
    mapsQuery: 'Lakadganj Police Station, Nagpur',
    keywords: ['lakadganj', 'bhandara road', 'queta colony', 'wardhaman nagar']
  },
  {
    id: 'kalamana',
    name: 'Kalamana Police Station',
    zone: 'Nagpur City Police',
    address: 'Juna Kamptee Road, Kalamna Market, Nagpur, Maharashtra',
    phone: '0712-2720206',
    controlRoom: '100 / 112',
    email: 'ps.kalamana@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1650,
    lng: 79.1250,
    mapsQuery: 'Kalamna Police Station, Nagpur',
    keywords: ['kalamana', 'kalamna', 'kalamna market', 'juna kamptee road']
  },
  {
    id: 'shanti-nagar',
    name: 'Shanti Nagar Police Station',
    zone: 'Nagpur City Police',
    address: 'Old Kamptee Road, Shanti Nagar, Nagpur, Maharashtra',
    phone: '0712-2720207',
    controlRoom: '100 / 112',
    email: 'ps.shantinagar@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1700,
    lng: 79.1050,
    mapsQuery: 'Shanti Nagar Police Station, Nagpur',
    keywords: ['shanti nagar', 'old kamptee road']
  },
  {
    id: 'wadi',
    name: 'Wadi Police Station',
    zone: 'Nagpur City Police',
    address: 'Amravati Road, Defence Gate, Wadi, Nagpur, Maharashtra',
    phone: '0712-2361222',
    controlRoom: '100 / 112',
    email: 'ps.wadi@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1500,
    lng: 79.0100,
    mapsQuery: 'Wadi Police Station, Nagpur',
    keywords: ['wadi', 'amravati road', 'defence gate', 'dattawadi']
  },
  {
    id: 'midc-nagpur',
    name: 'MIDC Police Station',
    zone: 'Nagpur City Police',
    address: 'Nagpur Road, MIDC, Nagpur, Maharashtra',
    phone: '0712-2361223',
    controlRoom: '100 / 112',
    email: 'ps.midc@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.1100,
    lng: 79.0050,
    mapsQuery: 'MIDC Police Station, Nagpur',
    keywords: ['midc nagpur', 'midc police', 'hingna midc', 'midc']
  },
  {
    id: 'hingna',
    name: 'Hingna Police Station',
    zone: 'Nagpur City Police',
    address: 'Hingna Road, MIDC Area, Nagpur, Maharashtra',
    phone: '0712-2361224',
    controlRoom: '100 / 112',
    email: 'ps.hingna@mahapolice.gov.in',
    hours: '24×7 duty desk',
    lat: 21.0800,
    lng: 78.9800,
    mapsQuery: 'Hingna Police Station, Nagpur',
    keywords: ['hingna', 'hingna road', 'wanadongri', 'ysa']
  }
];

let nagpurLocationMatcherBound = false;

function normalizeNagpurLocation(text) {
  return String(text || '')
    .toLowerCase()
    .replace(/[–—]/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function looksLikeNagpurLocation(normalized) {
  if (!normalized) return false;
  if (/\bnagpur\b/.test(normalized) || /\bmaharashtra\b/.test(normalized)) return true;
  return NAGPUR_POLICE_STATIONS.some(st =>
    st.keywords.some(kw => {
      const kwL = kw.toLowerCase();
      return normalized.includes(kwL) || (normalized.length >= 4 && kwL.includes(normalized));
    })
  );
}

export function matchNagpurPoliceStation(rawLocation) {
  const text = normalizeNagpurLocation(rawLocation);
  if (!text || !looksLikeNagpurLocation(text)) return null;

  let best = null;
  let bestScore = 0;

  NAGPUR_POLICE_STATIONS.forEach(station => {
    let score = 0;
    station.keywords.forEach(keyword => {
      const kw = keyword.toLowerCase();
      if (!kw) return;
      if (text.includes(kw)) {
        score += kw.length;
        if (text === kw || text.startsWith(kw + ' ') || text.endsWith(' ' + kw)) {
          score += 8;
        }
      } else if (text.length >= 4 && kw.includes(text)) {
        score += text.length;
        if (kw.startsWith(text) || kw.endsWith(text)) {
          score += 4;
        }
      }
    });
    if (score > bestScore) {
      bestScore = score;
      best = station;
    }
  });

  if (best && bestScore >= 4) return best;

  // Central Nagpur with no specific area still maps to Sitabuldi (city centre).
  if (/\bnagpur\b/.test(text)) {
    return NAGPUR_POLICE_STATIONS.find(s => s.id === 'sitabuldi') || null;
  }
  return null;
}

export function getNagpurStationMapsUrl(station, originLocation) {
  if (!station) return '#';
  const origin = encodeURIComponent(
    String(originLocation || '').trim() || 'Nagpur, Maharashtra'
  );
  const destination = encodeURIComponent(station.mapsQuery || `${station.name}, Nagpur`);
  return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=driving`;
}

export function serializeAssignedStation(station, originLocation) {
  if (!station) return null;
  return {
    id: station.id,
    name: station.name,
    zone: station.zone,
    address: station.address,
    phone: station.phone,
    controlRoom: station.controlRoom,
    email: station.email,
    hours: station.hours,
    lat: station.lat,
    lng: station.lng,
    mapsQuery: station.mapsQuery,
    mapsUrl: getNagpurStationMapsUrl(station, originLocation)
  };
}

export function renderAssignedPoliceStationCard(station, originLocation, options = {}) {
  const { showHint = false } = options;
  if (!station) {
    if (!showHint) return '';
    return `
      <div class="assigned-station-card hint">
        <div class="assigned-station-hint">
          Type a Nagpur locality (Ambazari, Sitabuldi, Sadar, Bajaj Nagar, Dhantoli, or Sonegaon) to auto-assign the covering police station and driving directions.
        </div>
      </div>
    `;
  }

  const mapsUrl = station.mapsUrl || getNagpurStationMapsUrl(station, originLocation);
  const tel = String(station.phone || '').replace(/[^\d+]/g, '');

  return `
    <div class="assigned-station-card match">
      <div class="station-kicker">Assigned jurisdiction</div>
      <h4>${escapeHtml(station.name)}</h4>
      <div style="font-size:11.5px;color:var(--ink-faint);margin-top:2px;">${escapeHtml(station.zone || 'Nagpur City Police')}</div>
      <div class="assigned-station-meta">
        <div class="assigned-station-meta-row">
          <strong>Address</strong>
          <span>${escapeHtml(station.address)}</span>
        </div>
        <div class="assigned-station-meta-row">
          <strong>Phone</strong>
          <span>
            ${tel ? `<a href="tel:${tel}" style="color:var(--primary);font-weight:600;">${escapeHtml(station.phone)}</a>` : escapeHtml(station.phone || '—')}
            <span style="color:var(--ink-faint);"> · Emergency ${escapeHtml(station.controlRoom || '112')}</span>
          </span>
        </div>
        <div class="assigned-station-meta-row">
          <strong>Email</strong>
          <span>${station.email ? `<a href="mailto:${escapeHtml(station.email)}" style="color:var(--primary);">${escapeHtml(station.email)}</a>` : '—'}</span>
        </div>
        <div class="assigned-station-meta-row">
          <strong>Desk</strong>
          <span>${escapeHtml(station.hours || '24×7 duty desk')}</span>
        </div>
      </div>
      <div class="assigned-station-actions">
        <a class="btn primary" href="${mapsUrl}" target="_blank" rel="noopener noreferrer" style="display:inline-flex;align-items:center;gap:6px;font-size:12px;padding:6px 12px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="3 11 22 2 13 21 11 13 3 11"/>
          </svg>
          Google Maps driving directions
        </a>
        ${tel ? `<a class="btn ghost-sm" href="tel:${tel}" style="display:inline-flex;align-items:center;padding:6px 10px;">Call station</a>` : ''}
      </div>
    </div>
  `;
}

export function updateAssignedStationCardFromInput() {
  const locEl = document.getElementById('compLocation');
  const host = document.getElementById('assignedPoliceStationCard');
  if (!host) return;
  const value = locEl ? locEl.value.trim() : '';
  if (!value) {
    host.innerHTML = '';
    return;
  }
  const station = matchNagpurPoliceStation(value);
  host.innerHTML = renderAssignedPoliceStationCard(station, value, { showHint: looksLikeNagpurLocation(normalizeNagpurLocation(value)) && !station });
}

export function bindNagpurStationAssignment() {
  const locEl = document.getElementById('compLocation');
  if (!locEl) return;
  if (!nagpurLocationMatcherBound) {
    nagpurLocationMatcherBound = true;
    locEl.addEventListener('input', updateAssignedStationCardFromInput);
    locEl.addEventListener('change', updateAssignedStationCardFromInput);
    locEl.addEventListener('blur', updateAssignedStationCardFromInput);
  }
  updateAssignedStationCardFromInput();
}

/* ============ COMPLAINT FORM ATTACHMENTS STATE ============ */
export let pendingComplaintFiles = [];
export let pendingComplaintSuspect = null;

export function resetPendingComplaintState() {
  pendingComplaintFiles = [];
  pendingComplaintSuspect = null;
  capturedPhotoData = null;
  const fileInput = document.getElementById('compFileInput');
  if (fileInput) {
    fileInput.value = '';
  }
  const suspectPhotoInput = document.getElementById('compSuspectPhotoData');
  if (suspectPhotoInput) {
    suspectPhotoInput.value = '';
  }
  renderPendingAttachmentsList();
}

/* ==========================================================================
   1. CITIZEN DASHBOARD
   ========================================================================== */
export function viewCitizenDashboard() {
  const currentPhone = DATA.meta.phone || '';
  const currentName = DATA.meta.analyst || 'Citizen';
  const apps = getCitizenApplications(currentPhone);

  const totalComplaints = apps.length;
  const pendingReviewCount = apps.filter(a => (a.reviewStatus === 'Pending Review') || (!a.reviewStatus && a.status === 'Submitted')).length;
  const approvedActiveCount = apps.filter(a => (a.reviewStatus === 'Approved' || (!a.reviewStatus && a.status !== 'Submitted' && a.status !== 'Rejected')) && a.status !== 'Resolved' && a.status !== 'Closed' && a.status !== 'Rejected').length;
  const resolvedCount = apps.filter(a => a.status === 'Resolved' || a.status === 'Closed').length;

  const recentApps = [...apps].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  // Recent police updates (hide internal notes)
  const recentUpdates = [];
  apps.forEach(app => {
    if (app.statusHistory && app.statusHistory.length > 1) {
      const latestUpdate = app.statusHistory[app.statusHistory.length - 1];
      recentUpdates.push({
        appId: app.id,
        appNum: app.num || app.id,
        title: app.title,
        status: latestUpdate.status,
        remarks: latestUpdate.remarks || app.policeRemarks || 'Status updated by investigating officer.',
        timestamp: latestUpdate.timestamp
      });
    } else if (app.policeRemarks) {
      recentUpdates.push({
        appId: app.id,
        appNum: app.num || app.id,
        title: app.title,
        status: app.status,
        remarks: app.policeRemarks,
        timestamp: app.lastUpdated || app.createdAt
      });
    }
  });

  return `
    <div class="crumb">Public Portal / Citizen Dashboard</div>
    <div class="page-title">
      <div>
        <h2>Welcome, ${escapeHtml(currentName)}</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);margin-top:2px;">Emergency &amp; Law Enforcement Citizen Services System</div>
      </div>
      <div class="actions">
        <button class="btn primary" id="btnOpenReportModal" onclick="window.openComplaintModal()" style="display:flex;align-items:center;gap:6px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          Report a Complaint
        </button>
      </div>
    </div>

    <!-- Citizen Stat Cards -->
    <div class="stat-grid">
      <div class="stat-card raised">
        <div class="label">My Complaints</div>
        <div class="value">${totalComplaints}</div>
        <div class="delta">Total submitted applications</div>
      </div>
      <div class="stat-card raised">
        <div class="label">Pending Police Review</div>
        <div class="value" style="color:var(--amber);">${pendingReviewCount}</div>
        <div class="delta">Awaiting officer verification</div>
      </div>
      <div class="stat-card raised">
        <div class="label">Approved &amp; Active</div>
        <div class="value" style="color:var(--blue);">${approvedActiveCount}</div>
        <div class="delta">Under active field investigation</div>
      </div>
      <div class="stat-card raised">
        <div class="label">Resolved Complaints</div>
        <div class="value" style="color:var(--green);">${resolvedCount}</div>
        <div class="delta">Action completed &amp; closed</div>
      </div>
    </div>

    <!-- Main Citizen Dashboard Grid -->
    <div class="dash-grid">
      <div>
        <!-- Recent Complaints Panel -->
        <div class="panel raised">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:12px;">
            <h3>My Recent Applications</h3>
            <a href="#my-applications" style="font-size:12px;color:var(--primary);text-decoration:none;font-weight:500;">View All (${apps.length}) →</a>
          </div>
          ${
            recentApps.length
              ? `
              <div style="overflow-x:auto;">
                <table class="data-table" style="width:100%;">
                  <thead>
                    <tr>
                      <th>Application ID</th>
                      <th>Complaint Title</th>
                      <th>Category</th>
                      <th>Submitted Date</th>
                      <th>Police Review</th>
                      <th>Investigation Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${recentApps.map(app => {
                      const reviewStatus = app.reviewStatus || (app.status === 'Submitted' ? 'Pending Review' : 'Approved');
                      return `
                      <tr>
                        <td><strong class="mono" style="color:var(--primary);">${escapeHtml(app.num || app.id)}</strong></td>
                        <td>
                          <strong>${escapeHtml(app.title)}</strong>
                          <div style="font-size:11px;color:var(--ink-faint);">${escapeHtml(app.location)}</div>
                        </td>
                        <td><span class="tag-chip">${escapeHtml(app.category)}</span></td>
                        <td>${fmtDate(app.createdAt)}</td>
                        <td>
                          <span class="badge ${getReviewBadgeClass(reviewStatus)}">
                            ${escapeHtml(reviewStatus)}
                          </span>
                        </td>
                        <td>
                          <span class="badge ${getStatusBadgeClass(app.status)}">${escapeHtml(app.status)}</span>
                        </td>
                        <td>
                          <button class="btn ghost-sm" onclick="window.go('tracking/${app.id}')" style="padding:4px 8px;font-size:11.5px;font-weight:600;">Track Status →</button>
                        </td>
                      </tr>
                    `;}).join('')}
                  </tbody>
                </table>
              </div>`
              : `<div class="empty-state" style="padding:32px 16px;">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--ink-faint)" stroke-width="1.5" style="margin-bottom:8px;opacity:0.6;">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="12" y1="18" x2="12" y2="12"/>
                    <line x1="9" y1="15" x2="15" y2="15"/>
                  </svg>
                  <p>No complaints reported yet.</p>
                  <button class="btn primary" onclick="window.openComplaintModal()" style="margin-top:10px;">+ Report Your First Complaint</button>
                </div>`
          }
        </div>

        <!-- How it Works Guide -->
        <div class="panel raised" style="margin-top:16px;">
          <h3>Citizens Legal Grievance Workflow</h3>
          <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(130px, 1fr));gap:12px;margin-top:12px;">
            <div style="background:var(--surface-secondary);padding:12px;border-radius:10px;border:1px solid var(--line);">
              <div style="font-size:11px;font-weight:700;color:var(--primary);margin-bottom:4px;">STEP 1</div>
              <div style="font-size:12.5px;font-weight:600;">Submit Complaint</div>
              <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">Type or use voice input to log details &amp; evidence.</div>
            </div>
            <div style="background:var(--surface-secondary);padding:12px;border-radius:10px;border:1px solid var(--line);">
              <div style="font-size:11px;font-weight:700;color:var(--amber);margin-bottom:4px;">STEP 2</div>
              <div style="font-size:12.5px;font-weight:600;">Police Review</div>
              <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">Duty officer inspects statement, photos and facts.</div>
            </div>
            <div style="background:var(--surface-secondary);padding:12px;border-radius:10px;border:1px solid var(--line);">
              <div style="font-size:11px;font-weight:700;color:var(--blue);margin-bottom:4px;">STEP 3</div>
              <div style="font-size:12.5px;font-weight:600;">Investigation</div>
              <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">Field action, correlation analysis &amp; evidence verify.</div>
            </div>
            <div style="background:var(--surface-secondary);padding:12px;border-radius:10px;border:1px solid var(--line);">
              <div style="font-size:11px;font-weight:700;color:var(--green);margin-bottom:4px;">STEP 4</div>
              <div style="font-size:12.5px;font-weight:600;">Resolution</div>
              <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">Official conclusion, recovery &amp; grievance closure.</div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: Recent Police Updates & Quick Assistance -->
      <div>
        <div class="panel raised">
          <h3>Updates from Police</h3>
          ${
            recentUpdates.length
              ? recentUpdates.slice(0, 5).map(u => `
                <div class="activity-row" style="align-items:flex-start;">
                  <div class="act-icon status" style="margin-top:2px;">
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                  <div class="act-text">
                    <div style="font-weight:600;font-size:12.5px;">
                      <a href="#tracking/${u.appId}">${escapeHtml(u.appNum)}: ${escapeHtml(u.title)}</a>
                    </div>
                    <div style="font-size:11px;color:var(--ink-faint);margin-top:2px;">
                      Status: <span class="badge ${getStatusBadgeClass(u.status)}" style="padding:1px 6px;font-size:10px;">${escapeHtml(u.status)}</span>
                    </div>
                    <div style="font-size:12px;margin-top:4px;color:var(--ink-muted);background:var(--surface-secondary);padding:6px 8px;border-radius:6px;border-left:3px solid var(--primary);">
                      "${escapeHtml(u.remarks)}"
                    </div>
                  </div>
                  <div class="act-time" style="font-size:10.5px;">${fmtDate(u.timestamp)}</div>
                </div>
              `).join('')
              : `<div class="empty-state" style="padding:20px 8px;">No police remarks or status changes yet.</div>`
          }
        </div>

        <div class="panel raised" style="margin-top:16px;">
          <h3>Emergency Contacts</h3>
          <div style="display:flex;flex-direction:column;gap:8px;margin-top:8px;">
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--surface-secondary);border-radius:8px;">
              <span style="font-weight:600;font-size:12.5px;">Police Emergency Hotline</span>
              <span class="mono" style="font-weight:700;color:var(--red);">112 / 100</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--surface-secondary);border-radius:8px;">
              <span style="font-weight:600;font-size:12.5px;">Cyber Crime Helpline</span>
              <span class="mono" style="font-weight:700;color:var(--blue);">1930</span>
            </div>
            <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 12px;background:var(--surface-secondary);border-radius:8px;">
              <span style="font-weight:600;font-size:12.5px;">Women &amp; Senior Helpline</span>
              <span class="mono" style="font-weight:700;color:var(--purple);">1090</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   2. CITIZEN MY APPLICATIONS VIEW
   ========================================================================== */
export function viewCitizenApplications() {
  const currentPhone = DATA.meta.phone || '';
  const apps = getCitizenApplications(currentPhone);

  return `
    <div class="crumb">Public Portal / Applications</div>
    <div class="page-title">
      <div>
        <h2>My Applications</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);">Registered complaints submitted under your verified mobile number (${escapeHtml(currentPhone)})</div>
      </div>
      <div class="actions">
        <button class="btn primary" onclick="window.openComplaintModal()">+ Report New Complaint</button>
      </div>
    </div>

    <div class="case-grid">
      ${
        apps.length
          ? apps.map(app => {
            const reviewStatus = app.reviewStatus || (app.status === 'Submitted' ? 'Pending Review' : 'Approved');
            const isPending = reviewStatus === 'Pending Review';
            const isApproved = reviewStatus === 'Approved';
            const isRejected = reviewStatus === 'Rejected' || app.status === 'Rejected';
            const assignedStation = app.assignedPoliceStation || matchNagpurPoliceStation(app.location);

            return `
            <div class="case-card raised-sm" onclick="window.go('tracking/${app.id}')" style="cursor:pointer;position:relative;">
              
              <!-- Review Status Pill Top -->
              <div style="margin-bottom:8px;">
                ${
                  isPending
                    ? `<div style="background:var(--amber-soft);color:var(--amber);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">
                        ⏳ Pending Police Officer Review
                      </div>`
                    : isApproved
                    ? `<div style="background:var(--green-soft);color:var(--green);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">
                        ✓ Approved by Police — Active
                      </div>`
                    : `<div style="background:var(--red-soft);color:var(--red);padding:4px 8px;border-radius:6px;font-size:11px;font-weight:700;display:inline-flex;align-items:center;gap:4px;">
                        ✕ Rejected by Police
                      </div>`
                }
              </div>

              <div class="cid mono" style="display:flex;justify-content:space-between;align-items:center;">
                <span style="font-weight:700;color:var(--primary);">${escapeHtml(app.num || app.id)}</span>
                <span class="badge ${getStatusBadgeClass(app.status)}">${escapeHtml(app.status)}</span>
              </div>
              <h4 style="margin-top:6px;font-size:14.5px;">${escapeHtml(app.title)}</h4>
              <p style="font-size:12.5px;color:var(--ink-muted);line-height:1.4;">${escapeHtml(app.description)}</p>
              
              <div style="margin-top:10px;padding:8px;background:var(--surface-secondary);border-radius:8px;font-size:11.5px;">
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="color:var(--ink-faint);">Category:</span>
                  <strong>${escapeHtml(app.category)}</strong>
                </div>
                <div style="display:flex;justify-content:space-between;margin-bottom:3px;">
                  <span style="color:var(--ink-faint);">Incident Location:</span>
                  <span>${escapeHtml(app.location)}</span>
                </div>
                <div style="display:flex;justify-content:space-between;">
                  <span style="color:var(--ink-faint);">Submitted:</span>
                  <span>${fmtDate(app.createdAt)}</span>
                </div>
                ${assignedStation ? `
                <div style="display:flex;justify-content:space-between;margin-top:3px;">
                  <span style="color:var(--ink-faint);">Police Station:</span>
                  <strong>${escapeHtml(assignedStation.name)}</strong>
                </div>` : ''}
              </div>

              ${
                isRejected && (app.rejectionReason || app.policeRemarks) ? `
                  <div style="margin-top:8px;font-size:11.5px;color:var(--red);background:var(--red-soft);padding:6px 8px;border-radius:6px;border:1px solid var(--red);">
                    <strong>Rejection Reason:</strong> ${escapeHtml(app.rejectionReason || app.policeRemarks)}
                  </div>
                ` : app.policeRemarks ? `
                  <div style="margin-top:8px;font-size:11.5px;color:var(--ink-muted);background:var(--blue-soft);padding:6px 8px;border-radius:6px;">
                    <strong>Police Note:</strong> ${escapeHtml(app.policeRemarks)}
                  </div>
                ` : ''
              }

              <div class="meta-row" style="margin-top:12px;border-top:1px solid var(--line);padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
                <span>${(app.evidence || []).length} Attached Evidence</span>
                <div style="display:flex;gap:6px;align-items:center;">
                  ${
                    (app.status === 'Resolved' || app.status === 'Closed' || app.status === 'Rejected') ? `
                      <button class="btn ghost-sm" onclick="event.stopPropagation(); window.confirmDeleteApplication('${app.id}')" style="color:var(--red);border-color:rgba(220,38,38,0.3);padding:3px 8px;font-size:11px;display:inline-flex;align-items:center;gap:4px;" title="Delete resolved application record">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                          <polyline points="3 6 5 6 21 6"/>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                        </svg>
                        Delete
                      </button>
                    ` : ''
                  }
                  <span style="color:var(--primary);font-weight:600;font-size:12px;">Track Status →</span>
                </div>
              </div>
            </div>
          `;}).join('')
          : `<div class="empty-state" style="grid-column:1/-1;padding:48px 16px;">
              <h3>No Applications Found</h3>
              <p style="margin-top:4px;">You have not registered any complaints yet.</p>
              <button class="btn primary" onclick="window.openComplaintModal()" style="margin-top:14px;">+ Report a Complaint</button>
            </div>`
      }
    </div>
  `;
}

/* ==========================================================================
   3. CITIZEN APPLICATION TRACKING VIEW
   ========================================================================== */
export function viewCitizenTracking(selectedAppId) {
  const currentPhone = DATA.meta.phone || '';
  const apps = getCitizenApplications(currentPhone);

  if (!apps.length) {
    return `
      <div class="crumb">Public Portal / Tracking</div>
      <div class="page-title"><h2>Application Tracking</h2></div>
      <div class="panel raised">
        <div class="empty-state">
          <h3>No applications available to track</h3>
          <p>Please submit a complaint first to track its status.</p>
          <button class="btn primary" onclick="window.openComplaintModal()" style="margin-top:12px;">+ Report a Complaint</button>
        </div>
      </div>
    `;
  }

  // Determine active application
  let activeApp = apps.find(a => a.id === selectedAppId || a.num === selectedAppId);
  if (!activeApp) activeApp = apps[0];

  const reviewStatus = activeApp.reviewStatus || (activeApp.status === 'Submitted' ? 'Pending Review' : 'Approved');
  const isPendingReview = reviewStatus === 'Pending Review';
  const isApproved = reviewStatus === 'Approved';
  const isRejected = reviewStatus === 'Rejected' || activeApp.status === 'Rejected';

  const statuses = [
    { key: 'Submitted', label: '1. Submitted', desc: 'Complaint registered and logged in police system.' },
    { key: 'Review', label: '2. Police Review', desc: 'Duty officer verifies statement, jurisdiction & evidence.' },
    { key: 'Investigation in Progress', label: '3. Investigation', desc: 'Assigned investigating officer taking active field steps.' },
    { key: 'Action Taken', label: '4. Action Taken', desc: 'Suspects questioned, evidence matched, or recovery executed.' },
    { key: 'Resolved', label: '5. Resolved', desc: 'Official investigation concluded and case closed.' }
  ];

  let currentStepIndex = 0;
  const isResolved = activeApp.status === 'Resolved' || activeApp.status === 'Closed' || activeApp.status === 'Rejected';

  if (isPendingReview) {
    currentStepIndex = 1;
  } else if (isApproved || !activeApp.reviewStatus) {
    if (activeApp.status === 'Under Review') currentStepIndex = 1;
    else if (activeApp.status === 'Investigation in Progress') currentStepIndex = 2;
    else if (activeApp.status === 'Action Taken') currentStepIndex = 3;
    else if (isResolved) currentStepIndex = 5; // All 5 steps completed with checkmarks
    else currentStepIndex = 1;
  }

  const history = activeApp.statusHistory || [];
  const assignedStation = activeApp.assignedPoliceStation || matchNagpurPoliceStation(activeApp.location);

  return `
    <div class="crumb">Public Portal / <a href="#my-applications">Applications</a> / Tracking</div>
    <div class="page-title">
      <div>
        <h2>Application Tracking: <span class="mono" style="color:var(--primary);">${escapeHtml(activeApp.num || activeApp.id)}</span></h2>
        <div style="font-size:12.5px;color:var(--ink-faint);">Live Status &amp; Police Investigation Timeline</div>
      </div>
      <div class="actions">
        ${apps.length > 1 ? `
          <select id="selectTrackApp" class="raised-sm" onchange="window.go('tracking/' + this.value)" style="box-shadow:none;padding:8px 12px;border-radius:10px;">
            ${apps.map(a => `
              <option value="${a.id}" ${a.id === activeApp.id ? 'selected' : ''}>${escapeHtml(a.num || a.id)} - ${escapeHtml(a.title)}</option>
            `).join('')}
          </select>
        ` : ''}
      </div>
    </div>

    <!-- Application Summary Banner -->
    <div class="panel raised" style="margin-bottom:16px;">
      <div style="display:flex;justify-content:space-between;align-items:flex-start;flex-wrap:wrap;gap:12px;">
        <div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="tag-chip">${escapeHtml(activeApp.category)}</span>
            <span class="badge ${getReviewBadgeClass(reviewStatus)}">${escapeHtml(reviewStatus)}</span>
          </div>
          <h3 style="margin-top:6px;font-size:18px;">${escapeHtml(activeApp.title)}</h3>
          <div style="font-size:13px;color:var(--ink-muted);margin-top:4px;">${escapeHtml(activeApp.description)}</div>
        </div>
        <div style="text-align:right;">
          <div style="font-size:11px;color:var(--ink-faint);">INVESTIGATION STATUS</div>
          <span class="badge ${getStatusBadgeClass(activeApp.status)}" style="font-size:13px;padding:5px 12px;margin-top:4px;">
            ${escapeHtml(activeApp.status)}
          </span>
        </div>
      </div>

      <div class="meta-row" style="margin-top:16px;padding-top:12px;border-top:1px solid var(--line);display:grid;grid-template-columns:repeat(auto-fit, minmax(160px, 1fr));gap:12px;">
        <div>
          <div style="font-size:11px;color:var(--ink-faint);">Incident Location</div>
          <div style="font-weight:600;font-size:13px;">${escapeHtml(activeApp.location)}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--ink-faint);">Incident Date</div>
          <div style="font-weight:600;font-size:13px;">${escapeHtml(activeApp.incidentDate || '—')}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--ink-faint);">Handling Department</div>
          <div style="font-weight:600;font-size:13px;">${escapeHtml(activeApp.handlingDept || 'Metro PD — Investigation Unit')}</div>
        </div>
        <div>
          <div style="font-size:11px;color:var(--ink-faint);">Last Updated</div>
          <div style="font-weight:600;font-size:13px;">${fmtDate(activeApp.lastUpdated || activeApp.createdAt)}</div>
        </div>
      </div>
      ${assignedStation ? `<div style="margin-top:14px;">${renderAssignedPoliceStationCard(assignedStation, activeApp.location)}</div>` : ''}
    </div>

    <!-- Review Decision Notice Card -->
    <div style="margin-bottom:16px;">
      ${
        isPendingReview
          ? `
          <div style="background:var(--amber-soft);border:1px solid var(--amber);padding:14px;border-radius:10px;">
            <div style="display:flex;align-items:center;gap:8px;color:var(--amber);font-weight:700;font-size:13px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12 6 12 12 16 14"/>
              </svg>
              APPLICATION STATUS: PENDING POLICE OFFICER REVIEW
            </div>
            <div style="font-size:12.5px;color:var(--ink);margin-top:6px;line-height:1.5;">
              Your complaint has been registered and is currently in the Police Officer Review Queue. A duty officer will inspect the statement and attached evidence to verify details. Once approved, it will move into active investigation.
            </div>
          </div>
        `
          : isApproved
          ? `
          <div style="background:var(--green-soft);border:1px solid var(--green);padding:14px;border-radius:10px;">
            <div style="display:flex;align-items:center;gap:8px;color:var(--green);font-weight:700;font-size:13px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
              APPLICATION APPROVED BY POLICE OFFICER
            </div>
            <div style="font-size:12.5px;color:var(--ink);margin-top:6px;line-height:1.5;">
              Your complaint has been formally reviewed and approved by <strong>${escapeHtml(activeApp.approvedBy || 'Duty Officer')}</strong> on ${fmtDate(activeApp.approvedAt || activeApp.lastUpdated)}. Active investigation is ongoing.
            </div>
          </div>
        `
          : `
          <div style="background:var(--red-soft);border:1px solid var(--red);padding:14px;border-radius:10px;">
            <div style="display:flex;align-items:center;gap:8px;color:var(--red);font-weight:700;font-size:13px;">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              APPLICATION REJECTED BY POLICE DEPARTMENT
            </div>
            <div style="font-size:13px;color:var(--red);font-weight:600;margin-top:6px;">
              Reason: ${escapeHtml(activeApp.rejectionReason || activeApp.policeRemarks || 'Does not meet jurisdiction or evidential threshold.')}
            </div>
            <div style="font-size:11.5px;color:var(--ink-faint);margin-top:4px;">
              Reviewed on: ${fmtDate(activeApp.rejectedAt || activeApp.lastUpdated)} by ${escapeHtml(activeApp.rejectedBy || 'Duty Officer')}
            </div>
          </div>
        `
      }
    </div>

    <!-- Visual Status Timeline Stepper -->
    <div class="panel raised">
      <h3>Investigation Progress Stepper</h3>
      
      ${isRejected ? `
        <div style="background:var(--surface-secondary);border:1px solid var(--line);padding:14px;border-radius:10px;margin:16px 0;">
          <div style="font-size:12.5px;color:var(--ink-muted);">
            This complaint was reviewed and rejected. No further automated milestones are scheduled. If you have fresh evidence or need clarification, you may visit your local police station.
          </div>
        </div>
      ` : `
        <div class="tracking-timeline-container" style="margin:24px 0 16px 0;">
          <div class="timeline-step-track">
            ${statuses.map((s, idx) => {
              const isCompleted = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isPending = idx > currentStepIndex;

              let dotClass = 'pending';
              if (isCompleted) dotClass = 'completed';
              else if (isCurrent) dotClass = 'current';

              return `
                <div class="timeline-step ${dotClass}">
                  <div class="step-marker">
                    ${isCompleted ? '✓' : (idx + 1)}
                  </div>
                  <div class="step-label">${escapeHtml(s.label)}</div>
                  <div class="step-desc">${escapeHtml(s.desc)}</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>
      `}

      <!-- Official Police Remarks Box -->
      <div style="background:var(--surface-secondary);padding:16px;border-radius:12px;border:1px solid var(--line);margin-top:20px;">
        <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--primary)" stroke-width="2">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
          </svg>
          <strong style="font-size:13px;">Official Police Remarks &amp; Updates (Citizen View)</strong>
        </div>
        <div style="font-size:13px;color:var(--ink);line-height:1.5;">
          ${escapeHtml(activeApp.policeRemarks || 'Your complaint is queued for processing. Investigating officers will update remarks as progress occurs.')}
        </div>
      </div>

      <!-- Chronological Updates Log -->
      <div style="margin-top:20px;">
        <h4 style="margin-bottom:10px;font-size:13px;">Status History Log</h4>
        <div style="display:flex;flex-direction:column;gap:8px;">
          ${
            history.length
              ? history.map(h => `
                <div style="background:var(--surface-secondary);padding:10px 12px;border-radius:8px;border:1px solid var(--line);display:flex;justify-content:space-between;align-items:flex-start;">
                  <div>
                    <span class="badge ${getStatusBadgeClass(h.status)}" style="font-size:11px;padding:2px 8px;">${escapeHtml(h.status)}</span>
                    <div style="font-size:12.5px;color:var(--ink);margin-top:4px;">${escapeHtml(h.remarks || 'Status update logged.')}</div>
                  </div>
                  <div class="mono" style="font-size:11px;color:var(--ink-faint);white-space:nowrap;margin-left:12px;">
                    ${fmtDate(h.timestamp)}
                  </div>
                </div>
              `).join('')
              : `<div style="font-size:12px;color:var(--ink-faint);">No recorded history.</div>`
          }
        </div>
      </div>

      <!-- Attached Evidence & Suspect Details for this Application -->
      <div style="margin-top:24px;display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
        <!-- Attached Evidence -->
        <div style="border:1px solid var(--line);padding:14px;border-radius:10px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:8px;">Attached Evidence (${(activeApp.evidence || []).length})</div>
          ${
            (activeApp.evidence && activeApp.evidence.length)
              ? activeApp.evidence.map(e => `
                <div style="display:flex;align-items:center;justify-content:space-between;padding:8px 0;border-bottom:1px solid var(--line);font-size:12.5px;">
                  <div>
                    <span style="font-weight:600;">${escapeHtml(e.name || e.fileName || 'Evidence File')}</span>
                    <span style="font-size:11px;color:var(--ink-faint);margin-left:4px;">(${escapeHtml(e.type || 'file')})</span>
                  </div>
                  <div style="display:flex;gap:6px;align-items:center;">
                    ${isResolved ? `
                    <button type="button" class="btn-delete-evidence" onclick="window.confirmDeleteEvidence('${e.id}')" style="background:var(--red-soft);color:var(--red);border:1px solid var(--red);padding:3px 8px;font-size:11px;font-weight:600;display:inline-flex;align-items:center;gap:3px;border-radius:6px;cursor:pointer;" title="Delete this evidence">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                        <polyline points="3 6 5 6 21 6"/>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                      </svg>
                      Delete
                    </button>
                    ` : ''}
                    ${e.dataUrl || e.previewUrl ? `
                      <button type="button" class="btn ghost-sm" onclick="window.previewEvidenceFile('${e.id}')" style="padding:3px 8px;font-size:11px;border-radius:6px;border:1px solid var(--line);">View</button>
                    ` : '<span style="color:var(--ink-faint);font-size:11px;">Attached</span>'}
                  </div>
                </div>
              `).join('')
              : '<div style="font-size:12px;color:var(--ink-faint);">No evidence files attached.</div>'
          }
        </div>

        <!-- Attached Suspect Information -->
        <div style="border:1px solid var(--line);padding:14px;border-radius:10px;">
          <div style="font-weight:600;font-size:13px;margin-bottom:8px;">Reported Suspect Information</div>
          ${
            activeApp.suspectInfo
              ? `
                <div style="font-size:12px;">
                  <div><strong>Name / Alias:</strong> ${escapeHtml(activeApp.suspectInfo.name || 'Unknown')}</div>
                  <div style="margin-top:2px;"><strong>Approx Age / Gender:</strong> ${escapeHtml(activeApp.suspectInfo.age || '—')} / ${escapeHtml(activeApp.suspectInfo.gender || '—')}</div>
                  <div style="margin-top:2px;"><strong>Description:</strong> ${escapeHtml(activeApp.suspectInfo.description || '—')}</div>
                </div>
              `
              : '<div style="font-size:12px;color:var(--ink-faint);">No specific suspect information provided.</div>'
          }
        </div>
      </div>
    </div>
  `;
}

/* ==========================================================================
   4. CITIZEN EVIDENCE LOG
   ========================================================================== */
export function viewCitizenEvidenceLog() {
  const currentPhone = DATA.meta.phone || '';
  const evidenceList = getCitizenEvidence(currentPhone);
  const apps = getCitizenApplications(currentPhone);

  const filteredEvidence = evidenceList.filter(ev => {
    if (citizenEvidenceCaseFilter === 'all') return true;
    return ev.applicationId === citizenEvidenceCaseFilter || ev.applicationNum === citizenEvidenceCaseFilter;
  });

  const selectedApp = apps.find(a => a.id === citizenEvidenceCaseFilter);
  const isSelectedAppResolved = selectedApp ? (selectedApp.status === 'Resolved' || selectedApp.status === 'Closed' || selectedApp.status === 'Rejected') : false;

  return `
    <div class="crumb">Public Portal / Evidence</div>
    <div class="page-title">
      <div>
        <h2>Evidence Log</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);">Secure repository of files, documents, and camera photos attached to your applications</div>
      </div>
      <div class="actions" style="display:flex;gap:8px;">
        ${!isSelectedAppResolved ? `
        <button class="btn ghost" onclick="window.openCameraCaptureModal('evidence')" style="display:flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="4"/>
          </svg>
          Take Photo
        </button>
        <button class="btn primary" onclick="window.openCitizenUploadEvidenceModal()" style="display:flex;align-items:center;gap:6px;">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="17 8 12 3 7 8"/>
            <line x1="12" y1="3" x2="12" y2="15"/>
          </svg>
          Upload Evidence
        </button>
        ` : `<span class="badge closed" style="font-size:12px;padding:6px 12px;">🔒 Case Resolved — Evidence Log Locked</span>`}
      </div>
    </div>

    <!-- Case Filter Dropdown -->
    <div class="filters-row" style="margin-bottom:14px;display:flex;align-items:center;gap:10px;">
      <label for="citizenEvFilterSelect" style="font-size:12px;font-weight:600;color:var(--ink-muted);margin:0;">Select Case / Application:</label>
      <select id="citizenEvFilterSelect" class="raised-sm" onchange="window.setCitizenEvidenceCaseFilter(this.value)" style="box-shadow:none;width:auto;padding:7px 12px;border-radius:8px;font-size:12.5px;">
        <option value="all" ${citizenEvidenceCaseFilter === 'all' ? 'selected' : ''}>All Applications (${evidenceList.length})</option>
        ${apps.map(a => `
          <option value="${a.id}" ${citizenEvidenceCaseFilter === a.id ? 'selected' : ''}>
            ${escapeHtml(a.num || a.id)} - ${escapeHtml(a.title)}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="evidence-grid">
      ${
        filteredEvidence.length
          ? filteredEvidence.map(ev => {
            const app = apps.find(a => a.id === ev.applicationId || a.num === ev.applicationNum);
            const isResolvedCase = app ? (app.status === 'Resolved' || app.status === 'Closed' || app.status === 'Rejected') : false;

            return `
            <div class="ev-card raised-sm">
              <div style="display:flex;justify-content:space-between;align-items:center;">
                <span class="etype ${getEvTypeBadgeClass(ev.type)}">${escapeHtml(ev.type || 'file')}</span>
                <span class="case-tag-badge">${escapeHtml(ev.applicationNum || ev.applicationId || 'Grievance')}</span>
              </div>
              <div class="etext" style="font-weight:600;margin-top:8px;">${escapeHtml(ev.name || ev.fileName || 'Evidence File')}</div>
              <div style="font-size:12px;color:var(--ink-muted);margin-top:2px;">${escapeHtml(ev.description || ev.text || 'Submitted with complaint')}</div>
              
              ${ev.previewUrl || ev.dataUrl ? `
                <div style="margin-top:8px;border-radius:8px;overflow:hidden;border:1px solid var(--line);background:#000;">
                  <img src="${ev.previewUrl || ev.dataUrl}" alt="Evidence" style="width:100%;max-height:140px;object-fit:cover;display:block;" />
                </div>
              ` : ''}

              <div class="emeta" style="margin-top:10px;">
                <span class="mono">${escapeHtml(ev.fileSize ? formatBytes(ev.fileSize) : 'Attached')}</span>
                <span class="mono">${fmtDate(ev.uploadDate || ev.loggedAt)}</span>
              </div>
              <div style="margin-top:12px;padding-top:10px;border-top:1px solid var(--line);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
                <span class="badge ${getStatusBadgeClass(ev.status || 'Verified')}" style="padding:3px 8px;font-size:10px;">
                  ${escapeHtml(ev.status || 'Submitted')}
                </span>
                <div style="display:flex;gap:8px;align-items:center;">
                  ${isResolvedCase ? `
                  <button type="button" class="btn-delete-evidence" onclick="event.stopPropagation(); window.confirmDeleteEvidence('${ev.id}')" style="background:var(--red-soft);color:var(--red);border:1px solid var(--red);padding:4px 10px;font-size:11.5px;font-weight:600;display:inline-flex;align-items:center;gap:4px;border-radius:6px;cursor:pointer;line-height:1;" title="Delete this evidence record">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                  ` : ''}
                  ${ev.previewUrl || ev.dataUrl ? `
                    <button type="button" class="btn ghost-sm" onclick="event.stopPropagation(); window.previewEvidenceFile('${ev.id}')" style="padding:4px 10px;font-size:11.5px;border-radius:6px;border:1px solid var(--line);">View</button>
                  ` : ''}
                </div>
              </div>
            </div>
          `;}).join('')
          : `<div class="empty-state" style="grid-column:1/-1;padding:40px 16px;">
              <h3>No Evidence Files Logged</h3>
              <p>You haven't uploaded evidence yet. You can attach images, camera photos, or PDF documents to your complaints.</p>
              <button class="btn primary" onclick="window.openCitizenUploadEvidenceModal()" style="margin-top:12px;">+ Upload Evidence</button>
            </div>`
      }
    </div>
  `;
}

/* ==========================================================================
   5. CITIZEN SUSPECT LOG
   ========================================================================== */
export function viewCitizenSuspectLog() {
  const currentPhone = DATA.meta.phone || '';
  const suspects = getCitizenSuspects(currentPhone);
  const apps = getCitizenApplications(currentPhone);

  const filteredSuspects = suspects.filter(s => {
    if (citizenSuspectCaseFilter === 'all') return true;
    return s.applicationId === citizenSuspectCaseFilter || s.applicationNum === citizenSuspectCaseFilter;
  });

  return `
    <div class="crumb">Public Portal / Suspect Log</div>
    <div class="page-title">
      <div>
        <h2>Citizen Suspect Log</h2>
        <div style="font-size:12.5px;color:var(--ink-faint);">Suspect descriptions, photos, and identifying details provided by you to assist the investigation</div>
      </div>
      <div class="actions">
        ${(function(){
          const selectedApp = apps.find(a => a.id === citizenSuspectCaseFilter);
          const isSelectedAppResolved = selectedApp ? (selectedApp.status === 'Resolved' || selectedApp.status === 'Closed' || selectedApp.status === 'Rejected') : false;
          return !isSelectedAppResolved ? `
          <button class="btn primary" onclick="window.openAddSuspectModal()" style="display:flex;align-items:center;gap:6px;">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="8" r="4"/>
              <path d="M6 20v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/>
              <line x1="19" y1="11" x2="19" y2="17"/>
              <line x1="16" y1="14" x2="22" y2="14"/>
            </svg>
            Add Suspect Information
          </button>
          ` : `<span class="badge closed" style="font-size:12px;padding:6px 12px;">🔒 Case Resolved — Suspect Log Locked</span>`;
        })()}
      </div>
    </div>

    <!-- Case Filter Dropdown -->
    <div class="filters-row" style="margin-bottom:14px;display:flex;align-items:center;gap:10px;">
      <label for="citizenSusFilterSelect" style="font-size:12px;font-weight:600;color:var(--ink-muted);margin:0;">Select Case / Application:</label>
      <select id="citizenSusFilterSelect" class="raised-sm" onchange="window.setCitizenSuspectCaseFilter(this.value)" style="box-shadow:none;width:auto;padding:7px 12px;border-radius:8px;font-size:12.5px;">
        <option value="all" ${citizenSuspectCaseFilter === 'all' ? 'selected' : ''}>All Applications (${suspects.length})</option>
        ${apps.map(a => `
          <option value="${a.id}" ${citizenSuspectCaseFilter === a.id ? 'selected' : ''}>
            ${escapeHtml(a.num || a.id)} - ${escapeHtml(a.title)}
          </option>
        `).join('')}
      </select>
    </div>

    <div class="case-grid">
      ${
        filteredSuspects.length
          ? filteredSuspects.map(s => {
            const app = apps.find(a => a.id === s.applicationId || a.num === s.applicationNum);
            const isResolvedCase = app ? (app.status === 'Resolved' || app.status === 'Closed' || app.status === 'Rejected') : false;
            return `
            <div class="case-card raised-sm">
              <div style="display:flex;justify-content:space-between;align-items:flex-start;">
                <div>
                  <h4 style="margin:0;">${escapeHtml(s.name || 'Unknown Subject')}</h4>
                  <div style="font-size:11.5px;color:var(--ink-faint);margin-top:2px;">Related: <strong class="mono" style="color:var(--primary);">${escapeHtml(s.applicationNum || s.applicationId || 'Complaint')}</strong></div>
                </div>
                <span class="tag-chip">${escapeHtml(s.gender || 'Unknown')} • ${escapeHtml(s.age ? `${s.age} yrs` : 'Age ~')}</span>
              </div>

              ${s.photo ? `
                <div style="margin:10px 0;border-radius:8px;overflow:hidden;border:1px solid var(--line);background:#000;">
                  <img src="${s.photo}" alt="Suspect Reference" style="width:100%;max-height:160px;object-fit:cover;display:block;" />
                </div>
              ` : ''}

              <div style="margin-top:8px;font-size:12.5px;color:var(--ink-muted);">
                ${escapeHtml(s.description || s.details || 'No description provided.')}
              </div>

              <div style="margin-top:10px;padding:6px 8px;background:var(--surface-secondary);border-radius:6px;font-size:11px;">
                <strong>Last Seen / Area:</strong> ${escapeHtml(s.location || 'Not specified')}
              </div>

              <div class="meta-row" style="margin-top:10px;border-top:1px solid var(--line);padding-top:8px;display:flex;justify-content:space-between;align-items:center;">
                <span style="font-size:11px;color:var(--ink-faint);">Reported: ${fmtDate(s.createdAt)}</span>
                <div style="display:flex;gap:6px;align-items:center;">
                  ${isResolvedCase ? `
                  <button class="btn ghost-sm" onclick="window.confirmDeleteSuspect('${s.id}')" style="color:var(--red);border-color:rgba(220,38,38,0.25);padding:2px 6px;font-size:10.5px;display:inline-flex;align-items:center;gap:3px;" title="Delete suspect information">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                    </svg>
                    Delete
                  </button>
                  ` : ''}
                  <span class="badge open" style="font-size:10px;">Submitted</span>
                </div>
              </div>
            </div>
          `;}).join('')
          : `<div class="empty-state" style="grid-column:1/-1;padding:40px 16px;">
              <h3>No Suspect Information Logged</h3>
              <p>${citizenSuspectCaseFilter !== 'all' ? 'No suspects reported under this selected case.' : 'If you observed a perpetrator or have details about a suspect related to your complaint, you can log them here.'}</p>
              ${(function(){
                const selectedApp = apps.find(a => a.id === citizenSuspectCaseFilter);
                const isSelectedAppResolved = selectedApp ? (selectedApp.status === 'Resolved' || selectedApp.status === 'Closed' || selectedApp.status === 'Rejected') : false;
                return !isSelectedAppResolved ? '<button class="btn primary" onclick="window.openAddSuspectModal()" style="margin-top:12px;">+ Add Suspect Information</button>' : '<div style="margin-top:12px;"><span class="badge closed" style="font-size:12px;padding:6px 12px;">🔒 Case Resolved — Suspect Log Locked</span></div>';
              })()}
            </div>`
      }
    </div>
  `;
}

/* ==========================================================================
   6. REPORT A COMPLAINT MODAL & SPEECH-TO-TEXT CONTROLS
   ========================================================================== */
export function openComplaintModal() {
  resetPendingComplaintState();
  const modal = document.getElementById('citizenComplaintModal');
  if (!modal) return;

  // Set default incident date to today
  const dateInput = document.getElementById('compIncidentDate');
  if (dateInput && !dateInput.value) {
    dateInput.value = new Date().toISOString().split('T')[0];
  }

  renderPendingAttachmentsList();
  bindNagpurStationAssignment();
  updateAssignedStationCardFromInput();
  openModal('citizenComplaintModal');
}

export function startSpeechRecognition() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const statusEl = document.getElementById('speechStatusIndicator');
  const micBtn = document.getElementById('btnSpeechMic');
  const textarea = document.getElementById('compDescription');

  if (!SpeechRecognition) {
    if (statusEl) {
      statusEl.style.display = 'block';
      statusEl.innerHTML = `<span style="color:var(--amber);">Voice input is not supported in this browser. Please type your complaint.</span>`;
    }
    showToast('Speech recognition not supported in this browser.');
    return;
  }

  if (isListening && speechRecognitionInstance) {
    speechRecognitionInstance.stop();
    return;
  }

  try {
    speechRecognitionInstance = new SpeechRecognition();
    speechRecognitionInstance.continuous = true;
    speechRecognitionInstance.interimResults = true;
    speechRecognitionInstance.lang = 'en-US';

    speechRecognitionInstance.onstart = () => {
      isListening = true;
      if (micBtn) {
        micBtn.classList.add('recording-pulse');
        micBtn.innerHTML = `
          <svg width="15" height="15" viewBox="0 0 24 24" fill="#dc2626" stroke="#dc2626" stroke-width="2">
            <rect x="6" y="6" width="12" height="12" rx="2"/>
          </svg>
          Stop
        `;
      }
      if (statusEl) {
        statusEl.style.display = 'flex';
        statusEl.innerHTML = `
          <span class="pulse-dot" style="background:#dc2626;"></span>
          <span style="color:var(--red);font-weight:600;">Listening... Speak clearly into your microphone.</span>
        `;
      }
    };

    speechRecognitionInstance.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; ++i) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript && textarea) {
        const current = textarea.value.trim();
        textarea.value = current ? `${current} ${finalTranscript.trim()}` : finalTranscript.trim();
      }
    };

    speechRecognitionInstance.onerror = (event) => {
      console.warn('Speech recognition error', event.error);
      stopSpeechRecognition();
      if (statusEl) {
        statusEl.innerHTML = `<span style="color:var(--amber);">Microphone access issue (${event.error}). Please type your complaint.</span>`;
      }
    };

    speechRecognitionInstance.onend = () => {
      stopSpeechRecognition();
    };

    speechRecognitionInstance.start();

  } catch (err) {
    console.error('Speech recognition exception', err);
    stopSpeechRecognition();
    if (statusEl) {
      statusEl.innerHTML = `<span style="color:var(--amber);">Voice input is not supported in this browser. Please type your complaint.</span>`;
    }
  }
}

export function stopSpeechRecognition() {
  isListening = false;
  const statusEl = document.getElementById('speechStatusIndicator');
  const micBtn = document.getElementById('btnSpeechMic');

  if (micBtn) {
    micBtn.classList.remove('recording-pulse');
    micBtn.innerHTML = `
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
        <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
        <line x1="12" y1="19" x2="12" y2="23"/>
        <line x1="8" y1="23" x2="16" y2="23"/>
      </svg>
      Voice Input
    `;
  }
  if (statusEl) {
    statusEl.style.display = 'none';
  }
}

/* ==========================================================================
   7. CAMERA PHOTOGRAPH CAPTURE SYSTEM
   ========================================================================== */
export async function openCameraCaptureModal(target = 'complaint') {
  currentCameraTarget = target;
  capturedPhotoData = null;

  const modal = document.getElementById('cameraCaptureModal');
  const videoEl = document.getElementById('cameraVideoFeed');
  const canvasEl = document.getElementById('cameraCanvas');
  const previewBox = document.getElementById('cameraPreviewBox');
  const captureBtn = document.getElementById('btnCaptureSnap');
  const retakeBtn = document.getElementById('btnRetakeSnap');
  const attachBtn = document.getElementById('btnAttachSnap');

  if (previewBox) previewBox.style.display = 'none';
  if (videoEl) videoEl.style.display = 'block';
  if (captureBtn) captureBtn.style.display = 'inline-flex';
  if (retakeBtn) retakeBtn.style.display = 'none';
  if (attachBtn) attachBtn.style.display = 'none';

  openModal('cameraCaptureModal');

  try {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      cameraStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      if (videoEl) {
        videoEl.srcObject = cameraStream;
        videoEl.play();
      }
    } else {
      showToast('Camera API not available. Please use file upload.');
      closeModal('cameraCaptureModal');
    }
  } catch (err) {
    console.warn('Camera access denied or unavailable', err);
    showToast('Camera access permission was denied or not available.');
    closeModal('cameraCaptureModal');
  }
}

export function captureCameraSnapshot() {
  const videoEl = document.getElementById('cameraVideoFeed');
  const canvasEl = document.getElementById('cameraCanvas');
  const previewBox = document.getElementById('cameraPreviewBox');
  const previewImg = document.getElementById('cameraPreviewImg');
  const captureBtn = document.getElementById('btnCaptureSnap');
  const retakeBtn = document.getElementById('btnRetakeSnap');
  const attachBtn = document.getElementById('btnAttachSnap');

  if (!videoEl || !canvasEl) return;

  canvasEl.width = videoEl.videoWidth || 640;
  canvasEl.height = videoEl.videoHeight || 480;
  const ctx = canvasEl.getContext('2d');
  ctx.drawImage(videoEl, 0, 0, canvasEl.width, canvasEl.height);

  capturedPhotoData = canvasEl.toDataURL('image/jpeg', 0.85);

  if (previewImg) previewImg.src = capturedPhotoData;
  if (previewBox) previewBox.style.display = 'block';
  if (videoEl) videoEl.style.display = 'none';

  if (captureBtn) captureBtn.style.display = 'none';
  if (retakeBtn) retakeBtn.style.display = 'inline-flex';
  if (attachBtn) attachBtn.style.display = 'inline-flex';
}

export function retakeCameraSnapshot() {
  capturedPhotoData = null;
  const videoEl = document.getElementById('cameraVideoFeed');
  const previewBox = document.getElementById('cameraPreviewBox');
  const captureBtn = document.getElementById('btnCaptureSnap');
  const retakeBtn = document.getElementById('btnRetakeSnap');
  const attachBtn = document.getElementById('btnAttachSnap');

  if (previewBox) previewBox.style.display = 'none';
  if (videoEl) videoEl.style.display = 'block';
  if (captureBtn) captureBtn.style.display = 'inline-flex';
  if (retakeBtn) retakeBtn.style.display = 'none';
  if (attachBtn) attachBtn.style.display = 'none';
}

export async function attachCameraSnapshot() {
  if (!capturedPhotoData) return;

  const photoFile = {
    id: 'photo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    name: `Camera_Photo_${new Date().toISOString().slice(0, 10)}_${Date.now().toString().slice(-4)}.jpg`,
    type: 'image/jpeg',
    size: Math.round((capturedPhotoData.length * 3) / 4),
    dataUrl: capturedPhotoData,
    previewUrl: capturedPhotoData,
    uploadDate: new Date().toISOString()
  };

  if (currentCameraTarget === 'complaint') {
    // Only push once and avoid duplicate entries
    const exists = pendingComplaintFiles.some(f => f.dataUrl === photoFile.dataUrl);
    if (!exists) {
      pendingComplaintFiles.push(photoFile);
      renderPendingAttachmentsList();
    }
  } else if (currentCameraTarget === 'police-evidence') {
    if (typeof window.addPolicePendingAttachment === 'function') {
      window.addPolicePendingAttachment(photoFile);
      showToast('Field photograph attached to Evidence record.');
    }
  } else if (currentCameraTarget === 'evidence') {
    const currentPhone = DATA.meta.phone || '';
    const apps = getCitizenApplications(currentPhone);
    const activeApps = apps.filter(a => a.status !== 'Resolved' && a.status !== 'Closed' && a.status !== 'Rejected');
    
    let selectedAppId = document.getElementById('citizenEvAppSelect')?.value;
    if (!selectedAppId) {
      if (citizenEvidenceCaseFilter && citizenEvidenceCaseFilter !== 'all') {
        selectedAppId = citizenEvidenceCaseFilter;
      } else {
        selectedAppId = activeApps.length > 0 ? activeApps[0].id : '';
      }
    }

    await addCitizenEvidenceItem({
      applicationId: selectedAppId,
      name: photoFile.name,
      type: 'photo',
      fileSize: photoFile.size,
      dataUrl: photoFile.dataUrl,
      previewUrl: photoFile.previewUrl,
      description: 'Captured via Camera in Citizen Evidence Portal'
    });
    showToast('Camera photograph added to Evidence Log.');
    if (window.render) window.render();
  } else if (currentCameraTarget === 'suspect') {
    const suspectPhotoPreview = document.getElementById('suspectPhotoPreview');
    const suspectPhotoInput = document.getElementById('susPhotoData');
    const compSuspectPhotoInput = document.getElementById('compSuspectPhotoData');
    if (suspectPhotoPreview) {
      suspectPhotoPreview.src = capturedPhotoData;
      suspectPhotoPreview.style.display = 'block';
    }
    if (suspectPhotoInput) {
      suspectPhotoInput.value = capturedPhotoData;
    }
    if (compSuspectPhotoInput) {
      compSuspectPhotoInput.value = capturedPhotoData;
    }
  }

  closeCameraModal();
}

export function closeCameraModal() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
  closeModal('cameraCaptureModal');
}

/* ==========================================================================
   8. FILE ATTACHMENTS HANDLING
   ========================================================================== */
export function handleFileUpload(files) {
  if (!files || !files.length) return;

  const fileArray = Array.from(files);
  const fileInput = document.getElementById('compFileInput');

  fileArray.forEach(file => {
    // Prevent adding identical file multiple times
    const isDuplicate = pendingComplaintFiles.some(f => 
      f.name === file.name && f.size === file.size && f.type === file.type
    );
    if (isDuplicate) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      const isImg = file.type.startsWith('image/');
      
      if (!pendingComplaintFiles.some(f => f.name === file.name && f.dataUrl === dataUrl)) {
        pendingComplaintFiles.push({
          id: 'file_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          name: file.name,
          type: file.type || 'document',
          size: file.size,
          dataUrl: dataUrl,
          previewUrl: isImg ? dataUrl : null,
          uploadDate: new Date().toISOString()
        });
        renderPendingAttachmentsList();
      }
    };
    reader.readAsDataURL(file);
  });

  if (fileInput) {
    fileInput.value = '';
  }
}

export function removePendingAttachment(fileId) {
  pendingComplaintFiles = pendingComplaintFiles.filter(f => f.id !== fileId);
  renderPendingAttachmentsList();
}

export function renderPendingAttachmentsList() {
  const container = document.getElementById('pendingAttachmentsList');
  if (!container) return;

  if (!pendingComplaintFiles.length) {
    container.innerHTML = '';
    return;
  }

  container.innerHTML = `
    <div style="font-size:12px;font-weight:600;margin-bottom:6px;">Attached Files (${pendingComplaintFiles.length}):</div>
    <div style="display:flex;flex-wrap:wrap;gap:8px;">
      ${pendingComplaintFiles.map(f => `
        <div style="display:flex;align-items:center;gap:6px;background:var(--surface-secondary);padding:4px 8px;border-radius:6px;border:1px solid var(--line);font-size:11.5px;">
          ${f.previewUrl ? `
            <img src="${f.previewUrl}" alt="Thumb" style="width:20px;height:20px;border-radius:3px;object-fit:cover;" />
          ` : `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          `}
          <span style="max-width:140px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${escapeHtml(f.name)}</span>
          <span style="color:var(--ink-faint);font-size:10px;">(${formatBytes(f.size)})</span>
          <button type="button" onclick="window.removePendingAttachment('${f.id}')" style="background:none;border:none;color:var(--red);cursor:pointer;font-weight:bold;padding:0 2px;">×</button>
        </div>
      `).join('')}
    </div>
  `;
}

/* ==========================================================================
   9. SUBMIT COMPLAINT ACTION
   ========================================================================== */
export async function submitCitizenComplaint(e) {
  if (e) e.preventDefault();

  const titleEl = document.getElementById('compTitle');
  const catEl = document.getElementById('compCategory');
  const dateEl = document.getElementById('compIncidentDate');
  const locEl = document.getElementById('compLocation');
  const descEl = document.getElementById('compDescription');

  // Suspect subfields if filled
  const sNameEl = document.getElementById('compSuspectName');
  const sAgeEl = document.getElementById('compSuspectAge');
  const sGenderEl = document.getElementById('compSuspectGender');
  const sDescEl = document.getElementById('compSuspectDesc');
  const sPhotoEl = document.getElementById('compSuspectPhotoData');

  const title = titleEl ? titleEl.value.trim() : '';
  const category = catEl ? catEl.value : 'Theft';
  const incidentDate = dateEl ? dateEl.value : '';
  const location = locEl ? locEl.value.trim() : '';
  const description = descEl ? descEl.value.trim() : '';

  if (!title) {
    showToast('Please enter a Complaint Title.');
    if (titleEl) titleEl.focus();
    return;
  }
  if (!location) {
    showToast('Please enter Incident Location.');
    if (locEl) locEl.focus();
    return;
  }
  if (!description) {
    showToast('Please enter or dictate Complaint Description.');
    if (descEl) descEl.focus();
    return;
  }

  let suspectInfo = null;
  if (sNameEl && (sNameEl.value.trim() || (sDescEl && sDescEl.value.trim()))) {
    suspectInfo = {
      name: sNameEl.value.trim() || 'Unknown Subject',
      age: sAgeEl ? sAgeEl.value.trim() : '',
      gender: sGenderEl ? sGenderEl.value : 'Unknown',
      description: sDescEl ? sDescEl.value.trim() : '',
      photo: sPhotoEl ? sPhotoEl.value : null
    };
  }

  const currentPhone = DATA.meta.phone || '';
  const currentName = DATA.meta.analyst || 'Citizen';
  const matchedStation = matchNagpurPoliceStation(location);
  const assignedPoliceStation = serializeAssignedStation(matchedStation, location);

  const newApp = await createCitizenComplaint({
    title,
    category,
    incidentDate,
    location,
    description,
    citizenName: currentName,
    citizenPhone: currentPhone,
    evidenceFiles: [...pendingComplaintFiles],
    suspectInfo,
    assignedPoliceStation
  });

  // Clear form
  if (titleEl) titleEl.value = '';
  if (locEl) locEl.value = '';
  if (descEl) descEl.value = '';
  if (sNameEl) sNameEl.value = '';
  if (sAgeEl) sAgeEl.value = '';
  if (sDescEl) sDescEl.value = '';
  if (sPhotoEl) sPhotoEl.value = '';
  resetPendingComplaintState();
  updateAssignedStationCardFromInput();
  closeModal('citizenComplaintModal');

  // Open confirmation modal
  showComplaintSuccessModal(newApp);
}

export function showComplaintSuccessModal(app) {
  const modal = document.getElementById('complaintSuccessModal');
  const appIdEl = document.getElementById('successAppId');
  const dateEl = document.getElementById('successAppDate');
  const statusEl = document.getElementById('successAppStatus');
  const stationHost = document.getElementById('successAssignedStation');

  if (appIdEl) appIdEl.textContent = app.num || app.id;
  if (dateEl) dateEl.textContent = fmtDate(app.createdAt);
  if (statusEl) statusEl.textContent = app.status || 'Submitted';
  if (stationHost) {
    const station = app.assignedPoliceStation || matchNagpurPoliceStation(app.location);
    stationHost.innerHTML = station
      ? renderAssignedPoliceStationCard(station, app.location)
      : '';
  }

  openModal('complaintSuccessModal');
}

/* ==========================================================================
   10. MODAL VIEW / DOWNLOAD PREVIEW HELPERS
   ========================================================================== */
export function previewEvidenceFile(evidenceId) {
  const currentPhone = DATA.meta.phone || '';
  const evidenceList = getCitizenEvidence(currentPhone);
  const ev = evidenceList.find(e => e.id === evidenceId) || (DATA.citizenEvidence || []).find(e => e.id === evidenceId);
  if (!ev) return;

  const modal = document.getElementById('evidencePreviewModal');
  const titleEl = document.getElementById('previewModalTitle');
  const bodyEl = document.getElementById('previewModalBody');
  const actionsEl = document.getElementById('previewModalActions');

  if (titleEl) titleEl.textContent = ev.name || ev.fileName || 'Evidence File';
  if (bodyEl) {
    if (ev.previewUrl || ev.dataUrl) {
      bodyEl.innerHTML = `
        <div style="text-align:center;">
          <img src="${ev.previewUrl || ev.dataUrl}" alt="Evidence" style="max-width:100%;max-height:70vh;border-radius:8px;border:1px solid var(--line);" />
          <div style="margin-top:12px;font-size:12.5px;color:var(--ink-muted);">${escapeHtml(ev.description || ev.text || '')}</div>
        </div>
      `;
    } else {
      bodyEl.innerHTML = `
        <div class="empty-state">
          <p>Document file attached: <strong>${escapeHtml(ev.name || ev.fileName)}</strong></p>
          <div style="margin-top:8px;font-size:12px;color:var(--ink-muted);">${escapeHtml(ev.description || ev.text || '')}</div>
        </div>
      `;
    }
  }

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

/* ==========================================================================
   11. DELETION HANDLERS (CITIZEN PORTAL)
   ========================================================================== */
export async function confirmDeleteEvidence(evidenceId) {
  if (!confirm('Are you sure you want to delete this evidence?')) {
    return;
  }
  const res = await deleteCitizenEvidence(evidenceId);
  if (res.success) {
    showToast(res.message || 'Evidence deleted successfully.');
    if (typeof window.render === 'function') {
      window.render();
    }
  } else {
    showToast(res.message || 'Cannot delete evidence.');
  }
}

export async function confirmDeleteApplication(appId) {
  if (!confirm('Are you sure you want to permanently delete this resolved application record? All associated files and suspect details will be removed.')) {
    return;
  }
  const res = await deleteCitizenApplication(appId);
  if (res.success) {
    showToast('Resolved application record deleted.');
    if (window.render) window.render();
  } else {
    showToast(res.message || 'Cannot delete application.');
  }
}

export async function confirmDeleteSuspect(suspectId) {
  if (!confirm('Are you sure you want to permanently delete this suspect entry?')) {
    return;
  }
  const res = await deleteCitizenSuspect(suspectId);
  if (res.success) {
    showToast('Suspect information deleted.');
    if (window.render) window.render();
  } else {
    showToast(res.message || 'Cannot delete suspect.');
  }
}

/* ==========================================================================
   12. UTILITY HELPERS
   ========================================================================== */
function getStatusStepIndex(status) {
  switch (status) {
    case 'Submitted': return 0;
    case 'Under Review': return 1;
    case 'Investigation in Progress': return 2;
    case 'Action Taken': return 3;
    case 'Resolved': return 4;
    case 'Closed': return 4;
    default: return 0;
  }
}

export function getReviewBadgeClass(reviewStatus) {
  switch (reviewStatus) {
    case 'Pending Review': return 'open';
    case 'Approved': return 'closed';
    case 'Rejected': return 'critical';
    default: return 'cold';
  }
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

function getEvTypeBadgeClass(type) {
  switch (type) {
    case 'photo': return 'forensic';
    case 'document': return 'digital';
    case 'image': return 'forensic';
    case 'witness': return 'witness';
    case 'digital': return 'digital';
    default: return 'physical';
  }
}

function formatBytes(bytes, decimals = 1) {
  if (!bytes || bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Expose globals for onclick handlers
window.openComplaintModal = openComplaintModal;
window.startSpeechRecognition = startSpeechRecognition;
window.stopSpeechRecognition = stopSpeechRecognition;
window.openCameraCaptureModal = openCameraCaptureModal;
window.captureCameraSnapshot = captureCameraSnapshot;
window.retakeCameraSnapshot = retakeCameraSnapshot;
window.attachCameraSnapshot = attachCameraSnapshot;
window.closeCameraModal = closeCameraModal;
window.handleFileUpload = handleFileUpload;
window.removePendingAttachment = removePendingAttachment;
window.submitCitizenComplaint = submitCitizenComplaint;
window.previewEvidenceFile = previewEvidenceFile;
window.confirmDeleteEvidence = confirmDeleteEvidence;
window.confirmDeleteApplication = confirmDeleteApplication;
window.confirmDeleteSuspect = confirmDeleteSuspect;
window.resetPendingComplaintState = resetPendingComplaintState;
window.setCitizenSuspectCaseFilter = setCitizenSuspectCaseFilter;
window.bindNagpurStationAssignment = bindNagpurStationAssignment;
window.updateAssignedStationCardFromInput = updateAssignedStationCardFromInput;
window.matchNagpurPoliceStation = matchNagpurPoliceStation;
