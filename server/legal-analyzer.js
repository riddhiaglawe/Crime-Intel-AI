/**
 * CrimeIntel AI - Verified Legal Provisions Reference Dataset & Advisory Analyzer
 *
 * IMPORTANT LEGAL CONSTRAINTS:
 * 1. Advisory decision-support ONLY — does NOT generate, register, or claim to generate an official FIR.
 * 2. Uses Bharatiya Nyaya Sanhita, 2023 (BNS 2023) for current/new offences.
 * 3. Does not invent section numbers or legal provisions.
 * 4. Grounded strictly in a verified legal-reference dataset.
 * 5. Final legal classification remains with the authorized police officer.
 */

import { GoogleGenAI } from '@google/genai';

/**
 * Verified statutory reference dataset for BNS 2023 & related Indian Acts.
 */
export const VERIFIED_LEGAL_DATASET = [
  {
    id: 'bns-303-2',
    act: 'Bharatiya Nyaya Sanhita, 2023',
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'IT Act, 2000',
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
    shortAct: 'IT Act, 2000',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
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
    shortAct: 'BNS 2023',
    section: 'Section 191(2)',
    title: 'Rioting',
    description: 'Force or violence used by an unlawful assembly, or by any member thereof, in prosecution of the common object.',
    keywords: ['rioting', 'stone pelting', 'vandalism by mob', 'property destruction by crowd', 'clash'],
    defaultReason: 'Force and public violence allegedly exerted in prosecution of unlawful assembly object.',
    relevance: 'High'
  }
];

/**
 * Deterministic rule-based matcher against verified dataset.
 */
export function analyzeProvisionsRuleBased({ title = '', description = '', category = '', suspectInfo = null, location = '' } = {}) {
  const combinedText = `${title} ${description} ${category} ${location} ${suspectInfo ? (suspectInfo.description || suspectInfo.name || '') : ''}`.toLowerCase();

  const matched = [];
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
  for (const match of topMatches) {
    matched.push({
      id: `lp_${match.item.id}_${sno}`,
      sno: sno++,
      act: match.item.act,
      section: match.item.section,
      offence: match.item.title,
      reason: match.item.defaultReason,
      relevance: match.score >= 5 ? 'High' : (match.score >= 3 ? 'Medium' : 'Low'),
      decision: 'Pending',
      officerRemarks: '',
      reviewedBy: null,
      officerId: null,
      reviewedAt: null
    });
  }

  return matched;
}

/**
 * Intelligent analyzer that leverages Gemini AI if API key is configured,
 * grounded strictly against verified BNS 2023 legal provisions.
 */
export async function suggestLegalProvisions(complaintData) {
  const apiKey = process.env.GEMINI_API_KEY;

  // Fallback to rule matcher if Gemini API key not present or default placeholder
  if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
    return {
      source: 'Verified BNS 2023 Rule Engine',
      provisions: analyzeProvisionsRuleBased(complaintData)
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });

    // Strip sensitive personal identifiers
    const safePayload = {
      title: complaintData.title || '',
      category: complaintData.category || '',
      incidentDate: complaintData.incidentDate || '',
      location: complaintData.location || '',
      description: complaintData.description || '',
      suspectMarkers: complaintData.suspectInfo ? (complaintData.suspectInfo.description || 'Unknown') : 'None',
      evidenceSummary: Array.isArray(complaintData.evidence) ? complaintData.evidence.map(e => e.type || 'file').join(', ') : 'None'
    };

    const prompt = `You are a legal decision-support assistant for Indian law enforcement officers.
Analyze the following police complaint facts and suggest applicable legal provisions under the Bharatiya Nyaya Sanhita, 2023 (BNS 2023) and related Indian Acts (e.g. Information Technology Act, 2000).

CRITICAL LEGAL CONSTRAINTS:
1. This is advisory decision support ONLY. Do NOT claim to generate an official FIR or final legal charge.
2. Use BNS 2023 for new/current offences. Do NOT use IPC for current offences.
3. Ground your suggestions strictly in the verified BNS 2023 sections:
   - Theft: BNS 2023 Section 303(2)
   - Snatching: BNS 2023 Section 304
   - Theft in dwelling/custody: BNS 2023 Section 305
   - Extortion: BNS 2023 Section 308
   - Robbery: BNS 2023 Section 309
   - Dacoity: BNS 2023 Section 310
   - Stolen property receiving: BNS 2023 Section 317(2)
   - Cheating: BNS 2023 Section 318(4)
   - Cyber Cheating by Personation: IT Act, 2000 Section 66D
   - Identity Theft: IT Act, 2000 Section 66C
   - Criminal Trespass: BNS 2023 Section 329(3)
   - House-trespass / House-breaking: BNS 2023 Section 331
   - Voluntarily causing hurt: BNS 2023 Section 115(2)
   - Grievous hurt: BNS 2023 Section 117(2)
   - Hurt by dangerous weapons: BNS 2023 Section 118(1)
   - Criminal Intimidation: BNS 2023 Section 351(2)
   - Forgery: BNS 2023 Section 336(3)
   - Outraging modesty of woman: BNS 2023 Section 74
   - Stalking: BNS 2023 Section 78
   - Rash driving: BNS 2023 Section 281
   - Fatal rash driving: BNS 2023 Section 106(1)
   - Rioting: BNS 2023 Section 191(2)
4. If no section reliably applies, return exactly: "Manual police/legal review required."
5. Output ONLY valid JSON in this exact structure without markdown:
[
  {
    "act": "Bharatiya Nyaya Sanhita, 2023",
    "section": "Section 303(2)",
    "offence": "Theft",
    "reason": "Clear 1-sentence legal reasoning based on reported facts",
    "relevance": "High"
  }
]

Complaint facts:
${JSON.stringify(safePayload, null, 2)}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    const rawText = response.text || '';
    const cleaned = rawText.replace(/```json/gi, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.length > 0) {
      let sno = 1;
      const formatted = parsed.slice(0, 4).map(p => ({
        id: `lp_ai_${sno}_${Date.now()}`,
        sno: sno++,
        act: p.act || 'Bharatiya Nyaya Sanhita, 2023',
        section: p.section || 'Manual police/legal review required.',
        offence: p.offence || 'Offence',
        reason: p.reason || 'Identified based on reported incident facts.',
        relevance: ['High', 'Medium', 'Low'].includes(p.relevance) ? p.relevance : 'Medium',
        decision: 'Pending',
        officerRemarks: '',
        reviewedBy: null,
        officerId: null,
        reviewedAt: null
      }));
      return { source: 'Gemini AI + BNS 2023 Grounding', provisions: formatted };
    }
  } catch (err) {
    console.warn('AI legal suggestion encountered error, falling back to rule matcher:', err.message);
  }

  // Fallback to rule engine
  return {
    source: 'Verified BNS 2023 Rule Engine (Fallback)',
    provisions: analyzeProvisionsRuleBased(complaintData)
  };
}
