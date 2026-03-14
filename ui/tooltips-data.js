/* ============================================================
   VIGIL — ui/tooltips-data.js
   Tooltip text definitions for all game concepts.
   Referenced by workspaces to populate data-tip attributes.
   ============================================================ */

var TIPS = {

  // --- Threat Types ---
  threatType: {
    TERROR_CELL:       'Organized terrorist cell with operational attack capability. Typically 5–30 members with weapons caches, financing networks, and specific target intent.',
    STATE_ACTOR:       'Government-sponsored threat — military, intelligence, or proxy force acting on behalf of a nation-state. High resources, sophisticated tradecraft.',
    CYBER_GROUP:       'Advanced persistent threat conducting cyber operations — espionage, sabotage, or destructive attacks against critical infrastructure.',
    CRIMINAL_ORG:      'Transnational criminal organization engaged in trafficking, weapons smuggling, or financial crimes that pose national security risks.',
    INSURGENCY:        'Armed insurgent movement challenging state authority through guerrilla warfare, territorial control, and political subversion.',
    PROLIFERATOR:      'Entity involved in WMD proliferation — acquisition, development, or transfer of nuclear, chemical, or biological weapons materials.',
    HOSTAGE_CRISIS:    'Active hostage situation involving US citizens or allied nationals. Time-critical — hostage survival probability degrades over time.',
    HVT_TARGET:        'High-Value Target identified for capture or elimination. Senior leadership, bomb-makers, or key operational figures.',
    ASSET_COMPROMISED: 'A US intelligence asset (human source) has been identified by a hostile service. Extraction or protective action required.',
    MILITARY_TARGET:   'Identified military installation or formation in a hostile theater. Requires DEFCON 2 or lower to engage.',
    STRATEGIC_TARGET:  'Strategic facility — command center, weapons depot, or critical infrastructure in an AT_WAR country.',
  },

  // --- Operation Types ---
  opType: {
    MILITARY_STRIKE:         'Conventional military strike using air power or cruise missiles. High firepower, high visibility. Requires STRIKE-capable assets.',
    SOF_RAID:                'Special operations ground raid. Small-unit direct action — breach, clear, exploit. Precise but high-risk.',
    SURVEILLANCE:            'Persistent ISR coverage to develop pattern-of-life intelligence and identify targets. Low risk, long duration.',
    NAVAL_INTERDICTION:      'Maritime interdiction — boarding, search, and seizure of suspect vessels. Requires naval assets with VBSS teams.',
    CYBER_OP:                'Offensive cyber operation — network exploitation, implant deployment, or destructive payload delivery. Deniable.',
    HOSTAGE_RESCUE:          'Hostage rescue mission. Simultaneous breach with snipers, assault elements, and medical support. Extremely high stakes.',
    COUNTER_TERROR:          'Multi-target counter-terrorism operation. Simultaneous raids across multiple locations to dismantle a network.',
    DIPLOMATIC_RESPONSE:     'Diplomatic engagement — negotiations, back-channel communication, or allied coordination to resolve a crisis.',
    INTEL_COLLECTION:        'Dedicated intelligence collection mission — agent meetings, dead drops, technical surveillance. Builds the picture.',
    DRONE_STRIKE:            'Unmanned aerial strike. Long loiter time, precise targeting, lower risk to personnel. Requires ISR + STRIKE.',
    HVT_ELIMINATION:         'Kill mission against a high-value target. SOF kill team or precision strike. Requires positive identification.',
    HVT_CAPTURE:             'Capture operation against a high-value target. Non-lethal preferred — intelligence value of live capture is immense.',
    TARGETED_KILLING:        'Authorized lethal action against a designated target. Multiple methods — air, sniper, drone. Attribution considerations.',
    ASSET_EXTRACTION:        'Emergency extraction of a compromised intelligence asset and potentially their family. Speed is critical.',
    DOMESTIC_HOSTAGE_RESCUE: 'Domestic hostage rescue by FBI HRT. Requires DOJ authorization. Posse Comitatus restricts military involvement.',
    LAW_ENFORCEMENT:         'Federal law enforcement operation — arrest warrants, search warrants, multi-agency coordination. Miranda applies.',
    INVESTIGATION:           'Long-running federal investigation — FISA warrants, grand jury subpoenas, financial analysis. Builds a prosecution.',
    DOMESTIC_SURVEILLANCE:   'Court-authorized domestic surveillance — physical and technical collection under FISA oversight.',
    ARREST_OPERATION:        'Tactical arrest of identified suspects. Federal warrant service with tactical teams and evidence collection.',
  },

  // --- Intel Sources ---
  source: {
    SIGINT:  'Signals Intelligence — intercepted communications, electronic emissions, and data transmissions.',
    HUMINT:  'Human Intelligence — information from recruited agents, defectors, and clandestine sources.',
    IMAGERY: 'Imagery Intelligence — satellite and aerial photography. Facility identification, vehicle tracking.',
    ISR:     'Intelligence, Surveillance & Reconnaissance — persistent aerial or ground sensor coverage.',
    CYBER:   'Cyber Intelligence — data from network exploitation, malware implants, and digital forensics.',
    OSINT:   'Open Source Intelligence — publicly available information: media, social networks, academic publications.',
  },

  // --- Intel Difficulty ---
  difficulty: {
    EASY:      'Low-difficulty intelligence. Quickly revealed through routine collection. Often available from open sources.',
    MEDIUM:    'Moderate-difficulty intelligence. Requires dedicated collection assets and time. Standard operational intel.',
    HARD:      'High-difficulty intelligence. Protected information requiring specialized collection or a well-placed source.',
    VERY_HARD: 'Extremely difficult intelligence. Compartmented, heavily encrypted, or known only to a few individuals.',
  },

  // --- Asset Categories ---
  assetCat: {
    SOF:        'Special Operations Forces — elite units trained for direct action, special reconnaissance, and unconventional warfare.',
    NAVY:       'Naval Forces — carrier strike groups, surface combatants, and submarine platforms with global reach.',
    AIR:        'Air Power — fighter, bomber, and tanker aircraft providing strike capability and air superiority.',
    ISR:        'ISR Platforms — unmanned and manned aircraft providing persistent surveillance and reconnaissance.',
    INTEL:      'Intelligence assets — SIGINT platforms, HUMINT operatives, and cyber warfare units.',
    DIPLOMATIC: 'Diplomatic Corps — envoys, ambassadors, and political officers for diplomatic engagement and negotiations.',
    DOMESTIC:   'Domestic agencies — FBI, DHS, and other federal entities authorized for operations on US soil.',
  },

  // --- Deniability ---
  deniability: {
    COVERT: 'Covert asset — plausible deniability. Lower diplomatic risk if operating without host nation clearance.',
    OVERT:  'Overt asset — officially attributed. Requires host nation clearance or risks severe diplomatic consequences.',
  },

  // --- Threat Levels ---
  threatLevel: {
    1: 'Threat Level 1 — LOW. Limited capability, no imminent attack. Long collection window.',
    2: 'Threat Level 2 — GUARDED. Emerging capability. Standard monitoring recommended.',
    3: 'Threat Level 3 — ELEVATED. Credible threat with operational capability. Active collection required.',
    4: 'Threat Level 4 — HIGH. Imminent threat with demonstrated capability. Urgent action recommended.',
    5: 'Threat Level 5 — CRITICAL. Active attack in progress or imminent. Maximum priority.',
  },

  // --- Operation Status ---
  opStatus: {
    DETECTED:           'Threat detected. Vigil is initializing threat analysis and gathering preliminary data.',
    ANALYSIS:           'Vigil is analyzing threat intelligence and generating deployment options for operator review.',
    OPTIONS_PRESENTED:  'Deployment options ready. Awaiting operator selection before the operational window expires.',
    APPROVED:           'Option approved by operator. Vigil is issuing deployment orders to assigned assets.',
    ASSETS_IN_TRANSIT:  'Assets en route to the area of operations. Transit time varies by asset speed and distance.',
    EXECUTING:          'Operation underway. Assets are on station and executing the mission profile.',
    SUCCESS:            'Operation complete — objectives achieved. After-action report available.',
    FAILURE:            'Operation failed — objectives not achieved. Review after-action report for details.',
  },

  // --- Feed Tags ---
  tags: {
    DOMESTIC: 'US homeland threat — Posse Comitatus Act restricts military deployment. Federal agency assets required.',
    URGENT:   'Time-critical threat. Shortened operational window demands rapid collection and response.',
  },

  // --- Collection Concepts ---
  collection: {
    effectiveness: 'How well this asset can collect intelligence on the threat, based on its sensor capabilities vs. remaining unrevealed intel field sources.',
    transitTime:   'Estimated travel time from the asset\'s current location to the threat area. Based on asset speed and distance.',
    fieldsCount:   'Intelligence fields this asset can actively collect, out of total unrevealed fields remaining.',
  },

  // --- Vigil Options ---
  vigilOption: {
    confidence:   'Vigil\'s estimated probability of mission success, based on asset capabilities, threat level, and intel coverage.',
    risk:         'Expected collateral damage, political fallout, and asset exposure. LOW = minimal, HIGH = significant consequences.',
    eta:          'Estimated time until all assigned assets arrive on station and the operation can begin.',
  },

  // --- Status Bar ---
  statusBar: {
    viability: 'National security credibility. Drops from failed operations, civilian casualties, diplomatic incidents. At zero, you are relieved of command.',
    intel:     'Intelligence reserve. Spent on diplomatic outreach, intel sharing, and advanced collection. Earned through successful operations.',
    threat:    'Global threat level based on active threats, recent attacks, and intelligence gaps. Drives political pressure.',
  },

  // --- DEFCON Levels ---
  defcon: {
    5: 'DEFCON 5 — FADE OUT. Peacetime readiness. Normal operations and baseline threat monitoring.',
    4: 'DEFCON 4 — DOUBLE TAKE. Enhanced intelligence watch. Intel collection speed +50% in theater.',
    3: 'DEFCON 3 — ROUND HOUSE. Covert ops authorized in hostile territory. SOF and intel assets relocate to theater. Threat spawn rate x1.5.',
    2: 'DEFCON 2 — FAST PACE. Conventional forces routing to theater. Migration proposals generated. Threat spawn x2.0.',
    1: 'DEFCON 1 — COCKED PISTOL. Maximum combat readiness. All covert ops authorized. Military targets generated. Threat spawn x2.5.',
  },

  // --- Conflict Types ---
  conflict: {
    BORDER_WAR:            'Active military conflict along a disputed border. High-intensity conventional operations.',
    NAVAL_CONFRONTATION:   'Maritime standoff involving warships, blockades, or contested waterways.',
    PROXY_CONFLICT:        'Conflict fought through intermediary forces, with state sponsors providing arms and funding.',
    INSURGENT_OFFENSIVE:   'Large-scale insurgent offensive aimed at seizing territory or destabilizing the government.',
  },
};

// Helper: get tooltip text for a threat type ID
function tipThreatType(typeId) {
  return TIPS.threatType[typeId] || '';
}

// Helper: get tooltip text for an operation type ID
function tipOpType(typeId) {
  return TIPS.opType[typeId] || '';
}

// Helper: get tooltip text for an intel source
function tipSource(source) {
  return TIPS.source[source] || '';
}

// Helper: get tooltip text for difficulty
function tipDifficulty(diff) {
  return TIPS.difficulty[diff] || '';
}

// Helper: escape for data-tip attribute embedding
function escTipAttr(text) {
  if (!text) return '';
  return text.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;');
}
