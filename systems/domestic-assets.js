/* ============================================================
   VIGIL — systems/domestic-assets.js
   US domestic federal agency assets for homeland threat response.
   FBI, DHS, ATF, US Marshals, Secret Service, DEA, FinCEN, USCG.
   Per Posse Comitatus, these are the sanctioned domestic force.
   ============================================================ */

// --- Domestic Bases ---
// Append to global BASES array (defined in bases.js)

var DOMESTIC_BASES = [
  { id: 'FBI_QUANTICO', name: 'FBI Academy', type: 'DOMESTIC_HQ', city: 'Quantico', country: 'United States', lat: 38.52, lon: -77.32, theaterId: 'NORTH_AMERICA' },
  { id: 'FBI_WASHINGTON', name: 'J. Edgar Hoover Building', type: 'DOMESTIC_HQ', city: 'Washington D.C.', country: 'United States', lat: 38.89, lon: -77.02, theaterId: 'NORTH_AMERICA' },
  { id: 'DHS_WASHINGTON', name: 'DHS Nebraska Avenue Complex', type: 'DOMESTIC_HQ', city: 'Washington D.C.', country: 'United States', lat: 38.94, lon: -77.07, theaterId: 'NORTH_AMERICA' },
  { id: 'ATF_WASHINGTON', name: 'ATF Headquarters', type: 'DOMESTIC_HQ', city: 'Washington D.C.', country: 'United States', lat: 38.89, lon: -77.03, theaterId: 'NORTH_AMERICA' },
  { id: 'USMS_ARLINGTON', name: 'US Marshals Service HQ', type: 'DOMESTIC_HQ', city: 'Arlington', country: 'United States', lat: 38.88, lon: -77.10, theaterId: 'NORTH_AMERICA' },
  { id: 'DEA_ARLINGTON', name: 'DEA Headquarters', type: 'DOMESTIC_HQ', city: 'Arlington', country: 'United States', lat: 38.88, lon: -77.12, theaterId: 'NORTH_AMERICA' },
  { id: 'TREASURY_VIENNA', name: 'FinCEN', type: 'DOMESTIC_HQ', city: 'Vienna', country: 'United States', lat: 38.90, lon: -77.26, theaterId: 'NORTH_AMERICA' },
  { id: 'USCG_PORTSMOUTH', name: 'USCG Atlantic Area', type: 'DOMESTIC_HQ', city: 'Portsmouth', country: 'United States', lat: 36.84, lon: -76.30, theaterId: 'NORTH_AMERICA' },
];

for (var i = 0; i < DOMESTIC_BASES.length; i++) BASES.push(DOMESTIC_BASES[i]);

// --- Base Type: Domestic Agency ---

BASE_TYPES.DOMESTIC_HQ = { label: 'Domestic Agency', color: '#d4a04a', icon: '◎' };

// --- Asset Category: Domestic ---

ASSET_CATEGORIES.DOMESTIC = { label: 'Domestic Agency', color: '#d4a04a', shortLabel: 'DOM' };

// --- Domestic Asset Templates ---
// Append to global ASSET_TEMPLATES array (defined in assets.js)
// speed: 0 = nationwide presence, instant deployment (field offices everywhere)
// Only tactical teams (HRT, FAST, SOG, SRT) have actual transit speeds

var DOMESTIC_ASSET_TEMPLATES = [

  // ======================= FBI =======================
  {
    type: 'FBI_HRT', name: 'FBI Hostage Rescue Team', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'FBI_QUANTICO', speed: 800, domesticAuthority: true,
    capabilities: ['HOSTAGE_RESCUE', 'COUNTER_TERROR', 'SOF'],
    collectionProfile: { HUMINT: 3, IMAGERY: 2 },
    designation: 'Tactical Operations — Critical Incident Response Group',
    personnel: 150,
    readiness: 'TIER_1',
    platform: 'Ground/Airborne',
    vehicles: ['Bell 412EP helicopter', 'Lenco BearCat armored vehicle', 'GMC Suburban tactical transport', 'armored Humvee'],
    equipment: ['HK416 assault rifles', 'Remington MSR precision rifles', 'flashbang and CS grenades', 'AN/PVS-31A BNVD', 'hydraulic breaching tools', 'explosive breaching charges', 'tactical body armor Level IV', 'multi-band tactical radios'],
    description: 'The Bureau\'s Tier 1 tactical unit, permanently staged at Quantico. Trained to FBI and JSOC standards for hostage rescue, high-risk warrants, and counter-terrorism direct action. Maintains a 4-hour worldwide deployment posture. One of two federal units (with DEVGRU) certified for national-level hostage rescue.',
    unitComposition: '4 tactical assault teams, 1 sniper-observer team, 1 tactical aviation unit, 1 technical operations cell, crisis negotiation element attached',
  },
  {
    type: 'FBI_JTTF', name: 'Joint Terrorism Task Force', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'FBI_WASHINGTON', speed: 0, domesticAuthority: true,
    capabilities: ['COUNTER_TERROR', 'INTEL'],
    collectionProfile: { HUMINT: 4, SIGINT: 3, OSINT: 3 },
    designation: 'National JTTF — FBI Counterterrorism Division',
    personnel: 200,
    readiness: 'FULL',
    platform: 'Ground/Distributed',
    vehicles: ['Unmarked sedans', 'surveillance vans', 'armored transport'],
    equipment: ['Encrypted communications suite', 'portable SIGINT intercept kit', 'covert recording devices', 'TSCM sweep equipment', 'facial recognition terminals', 'biometric collection kit'],
    description: 'Multi-agency task force operating from 200+ field offices nationwide. Integrates FBI, DHS, CBP, and local law enforcement for domestic CT intelligence and interdiction. Primary source of domestic HUMINT collection on active threat networks. Maintains informant networks and undercover operations in all 50 states.',
    unitComposition: 'Supervisory Special Agent, 12-18 FBI agents, 8-12 interagency detailees (DHS, CBP, ATF, local PD), intelligence analysts, linguists',
  },
  {
    type: 'FBI_CYBER_DIV', name: 'FBI Cyber Division', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'FBI_WASHINGTON', speed: 0, domesticAuthority: true,
    capabilities: ['CYBER', 'INTEL'],
    collectionProfile: { CYBER: 5, SIGINT: 3 },
    designation: 'Cyber Division — FBI Criminal, Cyber, Response & Services Branch',
    personnel: 100,
    readiness: 'FULL',
    platform: 'Cyber/Remote',
    vehicles: [],
    equipment: ['Network intrusion detection systems', 'malware reverse-engineering lab', 'dark web monitoring suite', 'cryptocurrency tracing tools', 'forensic imaging workstations', 'TEMPEST-certified analysis terminals'],
    description: 'Cyber threat investigation and computer intrusion response. Houses the Internet Crime Complaint Center (IC3) and CyWatch 24/7 operations center. Conducts offensive and defensive cyber operations under Title 18 authority. Maintains persistent monitoring of nation-state APT infrastructure targeting US networks.',
    unitComposition: 'Cyber Special Agents, digital forensics examiners, malware analysts, network intrusion specialists, CyWatch watch officers',
  },
  {
    type: 'FBI_FIELD_OFFICE', name: 'FBI Field Office', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'FBI_WASHINGTON', speed: 0, domesticAuthority: true,
    capabilities: ['INTEL', 'COUNTER_TERROR', 'LAW_ENFORCEMENT'],
    collectionProfile: { HUMINT: 3, SIGINT: 2, OSINT: 3 },
    designation: 'FBI Field Division',
    personnel: 50,
    readiness: 'FULL',
    platform: 'Ground/Distributed',
    vehicles: ['Unmarked sedans', 'surveillance vans'],
    equipment: ['Encrypted mobile communications', 'portable forensic kits', 'surveillance cameras', 'interview recording equipment', 'body-worn cameras', 'evidence collection kits'],
    description: 'Standard FBI field division providing investigative and intelligence support across assigned territory. Each office covers a multi-state region with resident agencies in major cities. Maintains confidential informant networks and coordinates with local law enforcement through task forces. First responder for federal crimes and domestic intelligence collection.',
    unitComposition: 'Special Agent in Charge, 30-40 Special Agents, intelligence analysts, surveillance specialists, evidence response team',
  },
  {
    type: 'FBI_COUNTERINTEL', name: 'FBI Counterintelligence Division', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'FBI_WASHINGTON', speed: 0, domesticAuthority: true,
    capabilities: ['INTEL', 'COUNTER_TERROR'],
    collectionProfile: { HUMINT: 4, SIGINT: 3 },
    designation: 'Counterintelligence Division — FBI National Security Branch',
    personnel: 80,
    readiness: 'FULL',
    platform: 'Ground/Distributed',
    vehicles: ['Unmarked vehicles', 'mobile surveillance platforms'],
    equipment: ['TSCM sweep equipment', 'covert surveillance devices', 'polygraph equipment', 'encrypted communications', 'FISA warrant processing terminals', 'classified document handling systems'],
    description: 'Responsible for detecting, disrupting, and neutralizing foreign intelligence operations on US soil. Manages double-agent programs and conducts counterespionage investigations. Coordinates with CIA and NSA on threats from foreign intelligence services. Operates under FISA and Executive Order 12333 authorities.',
    unitComposition: 'Supervisory Special Agents, counterintelligence analysts, surveillance specialists, TSCM technicians, foreign language specialists',
  },

  // ======================= DHS =======================
  {
    type: 'DHS_HSI', name: 'Homeland Security Investigations', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'DHS_WASHINGTON', speed: 0, domesticAuthority: true,
    capabilities: ['INTEL', 'LAW_ENFORCEMENT'],
    collectionProfile: { HUMINT: 3, SIGINT: 2, OSINT: 2 },
    designation: 'HSI — ICE Homeland Security Investigations',
    personnel: 100,
    readiness: 'FULL',
    platform: 'Ground/Distributed',
    vehicles: ['Unmarked sedans', 'cargo inspection vehicles', 'marine intercept craft'],
    equipment: ['Document and identity fraud detection kits', 'customs analysis tools', 'undercover communication systems', 'trade data mining terminals', 'portable X-ray scanners'],
    description: 'Principal investigative arm of DHS with the broadest federal investigative authority. Investigates transnational crime including human trafficking, narcotics smuggling, weapons proliferation, and financial crimes with a nexus to homeland security. Operates in all 50 states and 53 foreign offices. Access to CBP border crossing data and ICE detention intelligence.',
    unitComposition: 'Special Agents in Charge, field agents, intelligence research specialists, forensic accountants, trade analysts',
  },
  {
    type: 'SECRET_SERVICE', name: 'US Secret Service', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'DHS_WASHINGTON', speed: 800, domesticAuthority: true,
    capabilities: ['COUNTER_TERROR', 'INTEL'],
    collectionProfile: { HUMINT: 3, CYBER: 2 },
    designation: 'United States Secret Service — Protective Intelligence & Assessment Division',
    personnel: 50,
    readiness: 'TIER_1',
    platform: 'Ground/Airborne',
    vehicles: ['Armored Cadillac CT6 "Stagecoach"', 'Chevrolet Suburban Counter Assault Team vehicle', 'armored communications van', 'UH-60 Black Hawk'],
    equipment: ['FN P90 personal defense weapons', 'SIG Sauer P229 sidearms', 'counter-sniper rifle systems', 'electronic countermeasures suite', 'counter-UAS detection systems', 'magnetometer screening equipment', 'encrypted Motorola APX radios'],
    description: 'Dual-mission agency providing executive protection and financial crimes investigation. Counter Assault Team (CAT) maintains Tier 1 readiness for protective operations. Counter Surveillance Division conducts advance threat assessment for all protectees. Cyber Fraud Task Forces in 42 field offices target state-sponsored financial attacks.',
    unitComposition: 'Counter Assault Team (CAT), Counter Surveillance Division, Protective Intelligence agents, Electronic Crimes Special Agent Program',
  },
  {
    type: 'USCG_TLE', name: 'USCG Tactical Law Enforcement', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'USCG_PORTSMOUTH', speed: 55, domesticAuthority: true,
    capabilities: ['NAVAL', 'ISR'],
    collectionProfile: { IMAGERY: 3, ISR: 2 },
    designation: 'Tactical Law Enforcement Team — USCG Deployable Operations Group',
    personnel: 30,
    readiness: 'FULL',
    platform: 'Maritime',
    vehicles: ['Sentinel-class cutter', 'Response Boat – Medium', 'Over The Horizon interceptor', 'MH-65 Dolphin helicopter'],
    equipment: ['M240 machine guns', 'M2 .50 cal heavy machine guns', 'non-lethal compliance weapons', 'boarding ladders and grappling equipment', 'maritime radar and AIS tracking', 'night vision optics'],
    description: 'Coast Guard tactical teams specializing in maritime law enforcement, port security, and vessel interdiction. Unique federal authority to conduct law enforcement operations in US territorial waters without a warrant. TACLET teams deploy aboard Navy vessels and cutters for counter-narcotics and maritime security operations.',
    unitComposition: 'TACLET detachment (8-12 operators), cutter crew, helicopter interdiction tactical squadron element',
  },

  // ======================= ATF =======================
  {
    type: 'ATF_SRT', name: 'ATF Special Response Team', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'ATF_WASHINGTON', speed: 700, domesticAuthority: true,
    capabilities: ['SOF', 'LAW_ENFORCEMENT'],
    collectionProfile: { HUMINT: 2, IMAGERY: 2 },
    designation: 'Special Response Team — ATF Special Operations Division',
    personnel: 40,
    readiness: 'FULL',
    platform: 'Ground',
    vehicles: ['Lenco BearCat G2', 'unmarked tactical transport', 'mobile command vehicle'],
    equipment: ['M4A1 carbines', 'Remington 870 breaching shotguns', 'flashbang grenades', 'ballistic shields', 'thermal imaging cameras', 'forced entry tools', 'ballistic body armor', 'tactical communications'],
    description: 'ATF\'s primary tactical unit for high-risk enforcement operations including raids on illegal weapons caches, explosives recovery, and arson investigation support. Five regional SRT teams cover the continental United States. Trained in dynamic entry, explosive ordnance awareness, and post-blast crime scene processing. Cross-designated with FBI for joint operations.',
    unitComposition: '4 assault elements, 1 sniper-observer pair, breacher team, K-9 explosive detection unit, tactical medic',
  },

  // ======================= US MARSHALS =======================
  {
    type: 'USMS_SOG', name: 'USMS Special Operations Group', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'USMS_ARLINGTON', speed: 700, domesticAuthority: true,
    capabilities: ['SOF', 'LAW_ENFORCEMENT'],
    collectionProfile: { HUMINT: 2 },
    designation: 'Special Operations Group — United States Marshals Service',
    personnel: 60,
    readiness: 'FULL',
    platform: 'Ground/Airborne',
    vehicles: ['Armored SUVs', 'prisoner transport vehicles', 'Cessna surveillance aircraft', 'UH-72 Lakota helicopter'],
    equipment: ['M4 carbines', 'less-lethal munitions', 'GPS tracking devices', 'fugitive facial recognition system', 'ballistic entry equipment', 'tactical body armor', 'encrypted mobile communications'],
    description: 'The Marshals Service\'s part-time tactical unit composed of volunteer Deputy Marshals from district offices nationwide. Activated for high-risk fugitive apprehension, judicial security emergencies, witness protection extractions, and national emergency response. SOG operators maintain their regular district duties and deploy on 24-hour recall. Only federal tactical unit with nationwide fugitive arrest authority.',
    unitComposition: 'SOG commander, 6 tactical teams (8-10 operators each), precision marksman element, technical surveillance unit',
  },

  // ======================= DEA =======================
  {
    type: 'DEA_FAST', name: 'DEA FAST Team', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'DEA_ARLINGTON', speed: 700, domesticAuthority: true,
    capabilities: ['SOF', 'INTEL'],
    collectionProfile: { HUMINT: 4, SIGINT: 2 },
    designation: 'Foreign-deployed Advisory and Support Team — DEA Special Operations Division',
    personnel: 40,
    readiness: 'FULL',
    platform: 'Ground',
    vehicles: ['Toyota Land Cruiser armored', 'MRAP (deployed)', 'unmarked domestic vehicles'],
    equipment: ['M4A1 SOPMOD carbines', 'Glock 19 sidearms', 'portable SIGINT intercept systems', 'covert audio surveillance kits', 'night vision equipment', 'trauma medical kits', 'encrypted satellite phones'],
    description: 'DEA\'s premier tactical and intelligence unit, originally created for counter-narcotics operations in Afghanistan and South America. FAST teams combine direct action capability with deep HUMINT networks in narcotics trafficking organizations. Operate domestically and internationally under Title 21 authority. Maintain liaison relationships with foreign police and military counter-narcotics units.',
    unitComposition: '10-person team: team leader, assistant team leader, 6 operators, intelligence analyst, tactical medic',
  },
  {
    type: 'DEA_INTEL', name: 'DEA Intelligence Division', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'DEA_ARLINGTON', speed: 0, domesticAuthority: true,
    capabilities: ['INTEL'],
    collectionProfile: { HUMINT: 3, SIGINT: 4 },
    designation: 'Intelligence Division — Drug Enforcement Administration',
    personnel: 100,
    readiness: 'FULL',
    platform: 'Ground/Remote',
    vehicles: [],
    equipment: ['Hemisphere phone tracking system', 'Title III wiretap infrastructure', 'EPIC database terminals', 'financial pattern analysis tools', 'confidential source management systems', 'classified network terminals'],
    description: 'Houses the El Paso Intelligence Center (EPIC), the primary federal fusion center for drug trafficking and border security intelligence. Manages one of the largest federal wiretap programs under Title III authority. Operates the Hemisphere Project for real-time phone tracking across all US carriers. SIGINT collection capabilities rival NSA for domestic narcotics targets. Informant networks span the Western Hemisphere.',
    unitComposition: 'Intelligence analysts, SIGINT technicians, EPIC watch officers, confidential source handlers, strategic intelligence researchers',
  },

  // ======================= TREASURY =======================
  {
    type: 'FINCEN_ANALYSIS', name: 'FinCEN Analysis Unit', category: 'DOMESTIC', deniability: 'OVERT',
    homeBaseId: 'TREASURY_VIENNA', speed: 0, domesticAuthority: true,
    capabilities: ['INTEL'],
    collectionProfile: { SIGINT: 4, OSINT: 4 },
    designation: 'Financial Crimes Enforcement Network — US Department of the Treasury',
    personnel: 30,
    readiness: 'FULL',
    platform: 'Remote',
    vehicles: [],
    equipment: ['BSA database (200M+ reports)', 'Suspicious Activity Report analysis platform', 'Currency Transaction Report processing systems', 'Egmont Group secure network terminal', 'FinCEN 314(a) information sharing portal', 'sanctions screening tools'],
    description: 'Treasury bureau responsible for collecting and analyzing financial transaction data to detect money laundering, terrorist financing, and sanctions evasion. Receives and processes Suspicious Activity Reports (SARs) from 25,000+ financial institutions. Maintains the Bank Secrecy Act database — the largest repository of financial intelligence in the world. Can freeze assets and issue emergency geographic targeting orders without court approval.',
    unitComposition: 'Financial intelligence analysts, BSA compliance specialists, sanctions analysts, international liaison officers, data scientists',
  },
];

for (var i = 0; i < DOMESTIC_ASSET_TEMPLATES.length; i++) ASSET_TEMPLATES.push(DOMESTIC_ASSET_TEMPLATES[i]);

// --- Domestic Force Structure ---
// Maps base IDs to asset type/count pairs for instantiation at game start

var DOMESTIC_FORCE_STRUCTURE = {
  FBI_QUANTICO: [
    { type: 'FBI_HRT', count: 2 },
  ],
  FBI_WASHINGTON: [
    { type: 'FBI_JTTF', count: 4 },
    { type: 'FBI_CYBER_DIV', count: 3 },
    { type: 'FBI_FIELD_OFFICE', count: 8 },
    { type: 'FBI_COUNTERINTEL', count: 3 },
  ],
  DHS_WASHINGTON: [
    { type: 'DHS_HSI', count: 4 },
    { type: 'SECRET_SERVICE', count: 2 },
  ],
  USCG_PORTSMOUTH: [
    { type: 'USCG_TLE', count: 3 },
  ],
  ATF_WASHINGTON: [
    { type: 'ATF_SRT', count: 3 },
  ],
  USMS_ARLINGTON: [
    { type: 'USMS_SOG', count: 3 },
  ],
  DEA_ARLINGTON: [
    { type: 'DEA_FAST', count: 2 },
    { type: 'DEA_INTEL', count: 3 },
  ],
  TREASURY_VIENNA: [
    { type: 'FINCEN_ANALYSIS', count: 2 },
  ],
};

// --- Initialize Domestic Assets at Game Start ---

(function() {
  hook('game:start', function() {
    var baseIds = Object.keys(DOMESTIC_FORCE_STRUCTURE);
    for (var b = 0; b < baseIds.length; b++) {
      var baseId = baseIds[b];
      var base = getBase(baseId);
      if (!base) continue;

      var entries = DOMESTIC_FORCE_STRUCTURE[baseId];
      for (var e = 0; e < entries.length; e++) {
        var entry = entries[e];
        var tpl = getAssetTemplate(entry.type);
        if (!tpl) continue;

        for (var n = 0; n < entry.count; n++) {
          var instanceName = entry.count > 1
            ? tpl.name + ' #' + (n + 1)
            : tpl.name;

          V.assets.push({
            id: uid('AST'),
            type: tpl.type,
            name: instanceName,
            category: tpl.category,
            homeBaseId: baseId,
            currentBaseId: baseId,
            status: 'STATIONED',
            speed: tpl.speed,
            capabilities: tpl.capabilities.slice(),
            assignedOpId: null,
            currentLat: base.lat,
            currentLon: base.lon,
            originLat: null,
            originLon: null,
            destinationLat: null,
            destinationLon: null,
            transitStartTotalMinutes: 0,
            transitDurationMinutes: 0,
            designation: tpl.designation || '',
            personnel: tpl.personnel || 0,
            readiness: tpl.readiness || 'FULL',
            platform: tpl.platform || '',
            vehicles: tpl.vehicles ? tpl.vehicles.slice() : [],
            equipment: tpl.equipment ? tpl.equipment.slice() : [],
            description: tpl.description || '',
            unitComposition: tpl.unitComposition || '',
            collectionProfile: tpl.collectionProfile || {},
            deniability: tpl.deniability || 'OVERT',
            domesticAuthority: tpl.domesticAuthority || false,
            diplomaticEffectiveness: tpl.diplomaticEffectiveness || 0,
            assignedThreatId: null,
            rerouteCount: 0,
            maxReroutes: (tpl.readiness === 'TIER_1') ? 5 : 2,
          });
        }
      }
    }
  }, 3); // Priority 3: after base init (1) and main assets (2)
})();
