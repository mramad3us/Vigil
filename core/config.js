/* ============================================================
   VIGIL — core/config.js
   Game constants: theaters, departments, content pools.
   Year 2052 setting.
   ============================================================ */

// --- Operation Types ---
// Maps event/threat categories to the type of operation Vigil will plan.
// requiredCapabilities: the force package must collectively cover ALL of these.
// assetMustHaveAll: if set, each individual asset must have ALL these caps to be eligible (e.g. armed drones need ISR+STRIKE on the same platform).
// preferredCapabilities: assets with these score higher in recommendations.

var OPERATION_TYPES = {
  MILITARY_STRIKE: {
    id: 'MILITARY_STRIKE', label: 'Military Strike', shortLabel: 'MIL STRIKE',
    requiredCapabilities: ['STRIKE'],
    preferredCapabilities: ['STRIKE', 'ISR'],
    execHoursRange: [4, 12],
    baseSuccessRate: 70,
    illegalDomestic: true,
  },
  SOF_RAID: {
    id: 'SOF_RAID', label: 'Special Operations Raid', shortLabel: 'SOF RAID',
    requiredCapabilities: ['SOF'],
    preferredCapabilities: ['SOF', 'ISR', 'INTEL'],
    execHoursRange: [2, 8],
    baseSuccessRate: 65,
    illegalDomestic: true,
  },
  SURVEILLANCE: {
    id: 'SURVEILLANCE', label: 'Surveillance Operation', shortLabel: 'SURV',
    requiredCapabilities: ['ISR'],
    preferredCapabilities: ['ISR', 'SIGINT', 'INTEL'],
    execHoursRange: [6, 24],
    baseSuccessRate: 80,
  },
  NAVAL_INTERDICTION: {
    id: 'NAVAL_INTERDICTION', label: 'Naval Interdiction', shortLabel: 'NAVAL INT',
    requiredCapabilities: ['NAVAL'],
    preferredCapabilities: ['NAVAL', 'ISR', 'STRIKE'],
    execHoursRange: [8, 24],
    baseSuccessRate: 75,
    maritime: true,
  },
  CYBER_OP: {
    id: 'CYBER_OP', label: 'Cyber Operation', shortLabel: 'CYBER',
    requiredCapabilities: ['CYBER'],
    preferredCapabilities: ['CYBER', 'SIGINT'],
    execHoursRange: [2, 12],
    baseSuccessRate: 70,
  },
  HOSTAGE_RESCUE: {
    id: 'HOSTAGE_RESCUE', label: 'Hostage Rescue', shortLabel: 'HRT',
    requiredCapabilities: ['HOSTAGE_RESCUE'],
    preferredCapabilities: ['HOSTAGE_RESCUE', 'SOF', 'ISR'],
    execHoursRange: [1, 6],
    baseSuccessRate: 55,
  },
  COUNTER_TERROR: {
    id: 'COUNTER_TERROR', label: 'Counter-Terrorism', shortLabel: 'CT',
    requiredCapabilities: ['COUNTER_TERROR'],
    preferredCapabilities: ['COUNTER_TERROR', 'SOF', 'INTEL', 'ISR'],
    execHoursRange: [3, 12],
    baseSuccessRate: 65,
  },
  DIPLOMATIC_RESPONSE: {
    id: 'DIPLOMATIC_RESPONSE', label: 'Diplomatic Response', shortLabel: 'DIPLO',
    requiredCapabilities: ['DIPLOMATIC'],
    preferredCapabilities: ['DIPLOMATIC', 'INTEL', 'HUMINT'],
    execHoursRange: [4, 16],
    baseSuccessRate: 75,
  },
  INTEL_COLLECTION: {
    id: 'INTEL_COLLECTION', label: 'Intelligence Collection', shortLabel: 'INT COL',
    requiredCapabilities: ['INTEL'],
    preferredCapabilities: ['INTEL', 'HUMINT', 'SIGINT', 'ISR'],
    execHoursRange: [6, 24],
    baseSuccessRate: 80,
  },
  DRONE_STRIKE: {
    id: 'DRONE_STRIKE', label: 'Drone Strike', shortLabel: 'UAS STRIKE',
    requiredCapabilities: ['ISR', 'STRIKE'],
    assetMustHaveAll: ['ISR', 'STRIKE'],  // Each asset must be an armed ISR platform
    restrictToCategories: ['ISR'],          // Only unmanned/ISR platforms, not manned fighters
    preferredCapabilities: ['ISR', 'STRIKE'],
    execHoursRange: [1, 4],
    baseSuccessRate: 85,
    illegalDomestic: true,
  },
  // --- HVT / Hostage Operation Types ---
  HVT_ELIMINATION: {
    id: 'HVT_ELIMINATION', label: 'HVT Elimination', shortLabel: 'HVT ELIM',
    requiredCapabilities: ['SOF'],
    preferredCapabilities: ['SOF', 'STRIKE', 'ISR', 'INTEL'],
    execHoursRange: [1, 6],
    baseSuccessRate: 60,
    illegalDomestic: true,
  },
  HVT_CAPTURE: {
    id: 'HVT_CAPTURE', label: 'HVT Capture Operation', shortLabel: 'HVT CAP',
    requiredCapabilities: ['SOF'],
    preferredCapabilities: ['SOF', 'ISR', 'INTEL', 'HOSTAGE_RESCUE'],
    execHoursRange: [2, 8],
    baseSuccessRate: 55,
  },
  DOMESTIC_HOSTAGE_RESCUE: {
    id: 'DOMESTIC_HOSTAGE_RESCUE', label: 'Domestic Hostage Rescue', shortLabel: 'DOM HRT',
    requiredCapabilities: ['HOSTAGE_RESCUE'],
    preferredCapabilities: ['HOSTAGE_RESCUE', 'SOF', 'LAW_ENFORCEMENT', 'INTEL'],
    execHoursRange: [1, 6],
    baseSuccessRate: 60,
  },
  TARGETED_KILLING: {
    id: 'TARGETED_KILLING', label: 'Targeted Killing', shortLabel: 'TGT KILL',
    requiredCapabilities: ['STRIKE'],
    preferredCapabilities: ['STRIKE', 'SOF', 'ISR', 'INTEL'],
    execHoursRange: [1, 4],
    baseSuccessRate: 70,
    illegalDomestic: true,
  },
  ASSET_EXTRACTION: {
    id: 'ASSET_EXTRACTION', label: 'Asset Extraction', shortLabel: 'EXTRACT',
    requiredCapabilities: ['SOF'],
    preferredCapabilities: ['SOF', 'INTEL', 'ISR'],
    execHoursRange: [2, 12],
    baseSuccessRate: 55,
  },
  // --- Domestic Operation Types ---
  LAW_ENFORCEMENT: {
    id: 'LAW_ENFORCEMENT', label: 'Law Enforcement Operation', shortLabel: 'LE OP',
    requiredCapabilities: ['LAW_ENFORCEMENT'],
    preferredCapabilities: ['LAW_ENFORCEMENT', 'COUNTER_TERROR', 'SOF', 'INTEL'],
    execHoursRange: [2, 8],
    baseSuccessRate: 75,
  },
  INVESTIGATION: {
    id: 'INVESTIGATION', label: 'Federal Investigation', shortLabel: 'FED INV',
    requiredCapabilities: ['INTEL'],
    preferredCapabilities: ['INTEL', 'HUMINT', 'SIGINT', 'CYBER', 'OSINT'],
    execHoursRange: [12, 48],
    baseSuccessRate: 80,
  },
  DOMESTIC_SURVEILLANCE: {
    id: 'DOMESTIC_SURVEILLANCE', label: 'Domestic Surveillance', shortLabel: 'DOM SURV',
    requiredCapabilities: ['INTEL'],
    preferredCapabilities: ['ISR', 'SIGINT', 'HUMINT', 'CYBER', 'OSINT'],
    execHoursRange: [6, 24],
    baseSuccessRate: 85,
  },
  ARREST_OPERATION: {
    id: 'ARREST_OPERATION', label: 'Arrest Operation', shortLabel: 'ARREST',
    requiredCapabilities: ['LAW_ENFORCEMENT'],
    preferredCapabilities: ['LAW_ENFORCEMENT', 'SOF', 'INTEL'],
    execHoursRange: [1, 6],
    baseSuccessRate: 80,
  },
};

// --- Intel Difficulty Tiers ---
// ticksRange: game-minutes of passive collection needed to reveal.
// preRevealChance: probability the field starts already revealed at threat spawn.

var INTEL_DIFFICULTY = {
  EASY:      { ticksRange: [10, 40],   label: 'EASY',      preRevealChance: 0.6 },
  MEDIUM:    { ticksRange: [60, 180],  label: 'MEDIUM',    preRevealChance: 0.15 },
  HARD:      { ticksRange: [240, 480], label: 'HARD',      preRevealChance: 0.02 },
  VERY_HARD: { ticksRange: [480, 960], label: 'VERY HARD', preRevealChance: 0.0 },
};

// --- Threat Intel Fields ---
// Per threat type: what intel Vigil tries to collect. Each field has a difficulty
// that determines how many game-minutes of collection are needed to reveal it.

var THREAT_INTEL_FIELDS = {
  TERROR_CELL: [
    { key: 'CELL_LOCATION',     label: 'Cell Location',                 difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'CELL_STRUCTURE',    label: 'Cell Structure',                difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'MEMBER_COUNT',      label: 'Member Count',                  difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'ATTACK_PLANNING',   label: 'Attack Planning Intel',         difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'WEAPONS_CACHE',     label: 'Weapons Cache Location',        difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'LEADERSHIP_ID',     label: 'Leadership Identification',     difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'SUPPORT_NETWORK',   label: 'Support & Financing Network',   difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'INTERNAL_COMMS',    label: 'Internal Communications',       difficulty: 'VERY_HARD', source: 'SIGINT' },
    { key: 'TARGET_INTENT',     label: 'Target & Intent Assessment',    difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  STATE_ACTOR: [
    { key: 'ACTOR_ID',          label: 'State Actor Identification',    difficulty: 'EASY',      source: 'OSINT' },
    { key: 'FORCE_DISPOSITION', label: 'Force Disposition',             difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'COMMS_PATTERN',     label: 'Communications Pattern',        difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'AIR_DEFENSE_POSTURE', label: 'Air Defense Posture',         difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'MOVEMENT_PATTERNS', label: 'Military Movement Patterns',    difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'COMMAND_STRUCTURE', label: 'Command Authority Structure',   difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'STRATEGIC_INTENT',  label: 'Strategic Intent',              difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'ESCALATION_POSTURE', label: 'Escalation Posture',          difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  CYBER_GROUP: [
    { key: 'NETWORK_TOPOLOGY',  label: 'Network Topology',             difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'ATTRIBUTION_CONF',  label: 'Attribution Confidence',        difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'VULNERABILITY_SCAN', label: 'Vulnerability Assessment',     difficulty: 'MEDIUM',    source: 'CYBER' },
    { key: 'ACCESS_VECTORS',    label: 'Access Vectors',                difficulty: 'MEDIUM',    source: 'CYBER' },
    { key: 'COUNTER_INTRUSION', label: 'Counter-Intrusion Risk',        difficulty: 'HARD',      source: 'CYBER' },
    { key: 'TARGET_INTENT',     label: 'Target & Intent',               difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'INTERNAL_COMMS',    label: 'Operator Communications',       difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  CRIMINAL_ORG: [
    { key: 'ORG_LOCATION',      label: 'Organization Location',         difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'VESSEL_IDENTIFICATION', label: 'Transport Identification',  difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'CARGO_MANIFEST',    label: 'Cargo/Shipment Intel',          difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'ROUTE_PREDICTION',  label: 'Route Prediction',              difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'NETWORK_MAPPING',   label: 'Criminal Network Map',          difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'LEADERSHIP_ID',     label: 'Leadership Identification',     difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'FINANCIAL_FLOWS',   label: 'Financial Flow Analysis',       difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  INSURGENCY: [
    { key: 'AREA_OF_INTEREST',  label: 'Area of Operations',            difficulty: 'EASY',      source: 'ISR' },
    { key: 'GUARD_FORCE',       label: 'Force Estimate',                difficulty: 'EASY',      source: 'ISR' },
    { key: 'ACTIVITY_BASELINE', label: 'Activity Baseline',             difficulty: 'MEDIUM',    source: 'IMAGERY' },
    { key: 'WEAPONS_CACHE',     label: 'Weapons Cache Location',        difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'INGRESS_ROUTES',    label: 'Supply Routes',                 difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'LEADERSHIP_ID',     label: 'Leadership Identification',     difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'QRF_PROXIMITY',     label: 'QRF / Reinforcement Proximity', difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'TARGET_INTENT',     label: 'Strategic Intent',              difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  PROLIFERATOR: [
    { key: 'FACILITY_ID',       label: 'Facility Identification',       difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'TARGET_HARDENING',  label: 'Facility Hardening',            difficulty: 'MEDIUM',    source: 'IMAGERY' },
    { key: 'ACTIVITY_BASELINE', label: 'Activity Baseline',             difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'CARGO_MANIFEST',    label: 'Materials Shipment Intel',      difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'CIVILIAN_PROXIMITY', label: 'Civilian Proximity',           difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'NETWORK_MAPPING',   label: 'Procurement Network',           difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'COMMAND_STRUCTURE', label: 'Program Authority',             difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'ESCALATION_POSTURE', label: 'Weaponization Timeline',      difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],

  // === MILITARY / STRATEGIC TARGETS ===
  MILITARY_TARGET: [
    { key: 'FORCE_DISPOSITION', label: 'Force Disposition',             difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'DEFENSIVE_POSITIONS', label: 'Defensive Positions',         difficulty: 'EASY',      source: 'ISR' },
    { key: 'AIR_DEFENSE_POSTURE', label: 'Air Defenses',               difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'COMMAND_STRUCTURE', label: 'Command Structure',             difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'SUPPLY_LINES',     label: 'Supply Lines',                   difficulty: 'HARD',      source: 'ISR' },
    { key: 'REINFORCEMENT_ROUTES', label: 'Reinforcement Routes',      difficulty: 'HARD',      source: 'IMAGERY' },
  ],
  STRATEGIC_TARGET: [
    { key: 'FACILITY_ID',      label: 'Facility Type',                  difficulty: 'EASY',      source: 'IMAGERY' },
    { key: 'DEFENSIVE_PERIMETER', label: 'Defensive Perimeter',        difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'PERSONNEL_COUNT',  label: 'Personnel Count',                difficulty: 'MEDIUM',    source: 'IMAGERY' },
    { key: 'OUTPUT_CAPACITY',  label: 'Output Capacity',                difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'HARDENING_LEVEL',  label: 'Hardening Level',                difficulty: 'HARD',      source: 'IMAGERY' },
    { key: 'COLLATERAL_RISK',  label: 'Collateral Assessment',          difficulty: 'VERY_HARD', source: 'ISR' },
  ],
  // === HOSTAGE / HVT / ASSET THREAT TYPES ===
  HOSTAGE_CRISIS: [
    { key: 'HOSTAGE_LOCATION',    label: 'Hostage Location',               difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'HOSTAGE_COUNT',       label: 'Hostage Count & Identities',     difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'CAPTOR_ID',           label: 'Captor Identification',          difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'GUARD_FORCE',         label: 'Guard Force Assessment',         difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'HOSTAGE_CONDITION',   label: 'Hostage Condition',              difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'ENTRY_POINTS',        label: 'Entry Points & Building Layout', difficulty: 'HARD',      source: 'IMAGERY' },
    { key: 'CAPTOR_DEMANDS',      label: 'Captor Demands & Intentions',    difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'QRF_PROXIMITY',       label: 'QRF / Reinforcement Proximity',  difficulty: 'HARD',      source: 'ISR' },
    { key: 'INTERNAL_COMMS',      label: 'Captor Communications',          difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  HVT_TARGET: [
    { key: 'HVT_IDENTITY',        label: 'Target Identity',                difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'CELL_LOCATION',       label: 'Target Location',                difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'MOVEMENT_PATTERNS',   label: 'Pattern of Life',                difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'GUARD_FORCE',         label: 'Security Detail Assessment',     difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'HVT_NETWORK',         label: 'Target Network & Associates',    difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'ESCAPE_ROUTES',       label: 'Escape Routes & Safe Houses',    difficulty: 'HARD',      source: 'IMAGERY' },
    { key: 'COLLATERAL_RISK',     label: 'Collateral Damage Assessment',   difficulty: 'HARD',      source: 'ISR' },
    { key: 'COMMAND_STRUCTURE',    label: 'Command Authority',              difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'INTERNAL_COMMS',      label: 'Target Communications',          difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  ASSET_COMPROMISED: [
    { key: 'ASSET_LAST_KNOWN',    label: 'Asset Last Known Position',      difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'COMPROMISE_VECTOR',   label: 'Compromise Vector',              difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'HOSTILE_CI_ACTIVITY', label: 'Hostile CI Activity Level',      difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'EXFIL_ROUTES',        label: 'Exfiltration Routes',            difficulty: 'MEDIUM',    source: 'IMAGERY' },
    { key: 'ASSET_CONDITION',     label: 'Asset Condition & Status',       difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'COVER_STATUS',        label: 'Cover Identity Status',          difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'SAFE_HOUSE_NETWORK',  label: 'Safe House Network',             difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'DAMAGE_ASSESSMENT',   label: 'Operational Damage Assessment',  difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  // === DOMESTIC THREAT TYPES (continued) ===
  HOSTAGE_DOMESTIC: [
    { key: 'HOSTAGE_LOCATION',    label: 'Hostage Location',               difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'HOSTAGE_COUNT',       label: 'Hostage Count & Identities',     difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'CAPTOR_ID',           label: 'Captor Identification',          difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'GUARD_FORCE',         label: 'Armed Subject Assessment',       difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'HOSTAGE_CONDITION',   label: 'Hostage Condition',              difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'ENTRY_POINTS',        label: 'Entry Points & Floor Plan',      difficulty: 'HARD',      source: 'IMAGERY' },
    { key: 'CAPTOR_DEMANDS',      label: 'Subject Demands & State of Mind',difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'INTERNAL_COMMS',      label: 'Subject Communications',         difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  ASSASSINATION_TARGET: [
    { key: 'SUBJECT_ID',          label: 'Target Identification',          difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'CELL_LOCATION',       label: 'Target Location',                difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'MOVEMENT_PATTERNS',   label: 'Pattern of Life',                difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'GUARD_FORCE',         label: 'Security Assessment',            difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'LEGAL_AUTHORITY',     label: 'Legal Authority Assessment',     difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'COLLATERAL_RISK',     label: 'Collateral Risk Assessment',     difficulty: 'HARD',      source: 'ISR' },
    { key: 'NETWORK_MAPPING',     label: 'Target Network & Associates',    difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'CONTINGENCY_PLANNING',label: 'Contingency Planning',           difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  DOMESTIC_CAPTURE_TARGET: [
    { key: 'SUBJECT_ID',          label: 'Subject Identification',         difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'CELL_LOCATION',       label: 'Subject Location',               difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'MOVEMENT_PATTERNS',   label: 'Pattern of Life',                difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'GUARD_FORCE',         label: 'Security & Armed Assessment',    difficulty: 'MEDIUM',    source: 'ISR' },
    { key: 'LEGAL_AUTHORITY',     label: 'Legal Authority & Warrants',     difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'ESCAPE_ROUTES',       label: 'Escape Routes & Safe Houses',    difficulty: 'HARD',      source: 'IMAGERY' },
    { key: 'NETWORK_MAPPING',     label: 'Associate Network',              difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'CONTINGENCY_PLANNING',label: 'Apprehension Plan',              difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  // === DOMESTIC THREAT TYPES ===
  DOMESTIC_EXTREMISM: [
    { key: 'CELL_LOCATION',         label: 'Cell Location',                   difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'MEMBERSHIP_ROSTER',     label: 'Membership Roster',               difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'ONLINE_ACTIVITY',       label: 'Online Activity Profile',         difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'WEAPONS_PROCUREMENT',   label: 'Weapons Procurement',             difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'LEADERSHIP_ID',         label: 'Leadership Identification',       difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'RADICALIZATION_NETWORK', label: 'Radicalization Network',         difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'ATTACK_PLANNING',       label: 'Attack Planning Intel',           difficulty: 'VERY_HARD', source: 'HUMINT' },
    { key: 'FINANCING_TRAIL',       label: 'Financial Trail',                 difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  FINANCIAL_CRIME: [
    { key: 'SHELL_COMPANIES',       label: 'Shell Company Network',           difficulty: 'EASY',      source: 'OSINT' },
    { key: 'TRANSACTION_PATTERNS',  label: 'Transaction Patterns',            difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'BENEFICIAL_OWNERS',     label: 'Beneficial Ownership',            difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'MONEY_LAUNDERING_CHAIN', label: 'Money Laundering Chain',        difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'LEADERSHIP_ID',         label: 'Principal Identification',        difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'NETWORK_MAPPING',       label: 'Network Map',                     difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'FINANCIAL_FLOWS',       label: 'Full Financial Flow Analysis',    difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  CYBER_INTRUSION: [
    { key: 'NETWORK_TOPOLOGY',      label: 'Network Topology',               difficulty: 'EASY',      source: 'CYBER' },
    { key: 'ACCESS_VECTORS',        label: 'Access Vectors',                  difficulty: 'EASY',      source: 'CYBER' },
    { key: 'ATTRIBUTION_CONF',      label: 'Attribution Confidence',          difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'DATA_COMPROMISED',      label: 'Data Compromised',                difficulty: 'MEDIUM',    source: 'CYBER' },
    { key: 'COMMAND_STRUCTURE',      label: 'Command Infrastructure',         difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'INTERNAL_COMMS',        label: 'Operator Communications',         difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'COUNTER_INTRUSION',     label: 'Counter-Intrusion Capability',    difficulty: 'VERY_HARD', source: 'CYBER' },
  ],
  INSIDER_THREAT: [
    { key: 'SUBJECT_ID',            label: 'Subject Identification',          difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'ACCESS_LEVEL',          label: 'Access Level Assessment',         difficulty: 'EASY',      source: 'CYBER' },
    { key: 'EXFILTRATION_METHOD',   label: 'Exfiltration Method',             difficulty: 'MEDIUM',    source: 'CYBER' },
    { key: 'DATA_COMPROMISED',      label: 'Data Compromised',                difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'HANDLER_CONTACT',       label: 'Foreign Handler Contact',         difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'MOTIVATION_ASSESSMENT', label: 'Motivation Assessment',           difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'DAMAGE_ASSESSMENT',     label: 'Full Damage Assessment',          difficulty: 'VERY_HARD', source: 'CYBER' },
  ],
  ORGANIZED_CRIME: [
    { key: 'ORG_LOCATION',          label: 'Organization Location',           difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'MEMBERSHIP_ROSTER',     label: 'Membership Roster',               difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'WEAPONS_PROCUREMENT',   label: 'Weapons & Resources',             difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'FINANCIAL_FLOWS',       label: 'Financial Flows',                 difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'LEADERSHIP_ID',         label: 'Leadership Identification',       difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'NETWORK_MAPPING',       label: 'Criminal Network Map',            difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'INTERNAL_COMMS',        label: 'Internal Communications',         difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  CIVIL_UNREST: [
    { key: 'MOVEMENT_LEADERSHIP',   label: 'Movement Leadership',             difficulty: 'EASY',      source: 'OSINT' },
    { key: 'PARTICIPANT_ESTIMATE',  label: 'Participant Estimate',            difficulty: 'EASY',      source: 'ISR' },
    { key: 'COMMUNICATIONS_NETWORK', label: 'Communications Network',        difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'FINANCING_TRAIL',       label: 'Funding Sources',                 difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'FOREIGN_INFLUENCE',     label: 'Foreign Influence Assessment',    difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'ESCALATION_INDICATORS', label: 'Escalation Indicators',          difficulty: 'HARD',      source: 'ISR' },
    { key: 'CONTINGENCY_PLANNING',  label: 'Contingency Planning',            difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  WHISTLEBLOWER: [
    { key: 'SUBJECT_ID',            label: 'Subject Identification',          difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'LEAK_CHANNEL',          label: 'Leak Channel',                    difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'MEDIA_CONTACTS',        label: 'Media Contacts',                  difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'CLASSIFIED_MATERIAL_SCOPE', label: 'Classified Material Scope',  difficulty: 'HARD',      source: 'CYBER' },
    { key: 'PUBLISHER_TIMELINE',    label: 'Publication Timeline',            difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'DAMAGE_ASSESSMENT',     label: 'Damage Projection',              difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  CORPORATE_ESPIONAGE: [
    { key: 'CORPORATE_TARGET',      label: 'Corporate Target',                difficulty: 'EASY',      source: 'OSINT' },
    { key: 'OPERATIVE_COVER',       label: 'Operative Cover Identity',        difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'TRADE_SECRETS',         label: 'Trade Secrets Targeted',          difficulty: 'MEDIUM',    source: 'CYBER' },
    { key: 'EXFILTRATION_METHOD',   label: 'Exfiltration Method',             difficulty: 'HARD',      source: 'CYBER' },
    { key: 'CLIENT_STATE',          label: 'Client State Identification',     difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'NETWORK_MAPPING',       label: 'Operative Network',               difficulty: 'VERY_HARD', source: 'HUMINT' },
  ],
  NARCOTICS_NETWORK: [
    { key: 'SUPPLY_CHAIN',          label: 'Supply Chain Analysis',           difficulty: 'EASY',      source: 'HUMINT' },
    { key: 'STASH_LOCATIONS',       label: 'Stash Locations',                 difficulty: 'EASY',      source: 'ISR' },
    { key: 'DISTRIBUTION_NETWORK',  label: 'Distribution Network',            difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'FINANCIAL_FLOWS',       label: 'Financial Flows',                 difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'CARTEL_CONNECTIONS',    label: 'Cartel Connections',               difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'LEADERSHIP_ID',         label: 'Leadership Identification',       difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'INTERNAL_COMMS',        label: 'Internal Communications',         difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
  DOMESTIC_TERROR: [
    { key: 'CELL_LOCATION',         label: 'Cell Location',                   difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'MEMBERSHIP_ROSTER',     label: 'Cell Members',                    difficulty: 'EASY',      source: 'SIGINT' },
    { key: 'WEAPONS_PROCUREMENT',   label: 'Weapons & Materiel',              difficulty: 'MEDIUM',    source: 'HUMINT' },
    { key: 'ATTACK_PLANNING',       label: 'Attack Planning',                 difficulty: 'MEDIUM',    source: 'SIGINT' },
    { key: 'TARGET_INTENT',         label: 'Target Assessment',               difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'SUPPORT_NETWORK',       label: 'Support Network',                 difficulty: 'HARD',      source: 'SIGINT' },
    { key: 'LEADERSHIP_ID',         label: 'Cell Leader Identification',      difficulty: 'HARD',      source: 'HUMINT' },
    { key: 'INTERNAL_COMMS',        label: 'Encrypted Communications',        difficulty: 'VERY_HARD', source: 'SIGINT' },
    { key: 'FINANCING_TRAIL',       label: 'Financial Trail',                 difficulty: 'VERY_HARD', source: 'SIGINT' },
  ],
};

// --- Threat Expiration Ranges (game-minutes) ---
// Higher threat level = shorter window before the threat manifests.

var THREAT_EXPIRATION = {
  1: [525600, 1051200],  // 1-2 years (365-730 days)
  2: [129600, 525600],   // 3 months - 1 year
  3: [43200, 172800],    // 1-4 months
  4: [10080, 43200],     // 1 week - 1 month
  5: [4320, 14400],      // 3-10 days
};

// --- Collection Source Types ---
// Intel fields have a 'source' property (HUMINT, SIGINT, IMAGERY, ISR, CYBER, OSINT).
// Each asset has a collectionProfile mapping source types → effectiveness multiplier.
// If an asset has no rating for a source type, it contributes NOTHING to that field
// beyond passive collection. This means deploying a Reaper for a HUMINT field is
// flagged as ineffective — it won't advance that field any faster.
//
// Effectiveness scale: 0 = no capability, 1 = marginal, 2-3 = decent, 4-5 = excellent.
// Profiles are defined on each asset template in assets.js.

// --- Theaters ---

var THEATERS = {
  NORTH_AMERICA: {
    id: 'NORTH_AMERICA', name: 'North America', shortName: 'N.AMERICA',
    baseRisk: 1, volatility: 0.15,
    color: '#4a90d9',
    countries: ['United States', 'Canada', 'Mexico'],
    cities: [
      { city: 'Washington D.C.', country: 'United States', lat: 38.89, lon: -77.03 },
      { city: 'New York', country: 'United States', lat: 40.71, lon: -74.00, maritime: true },
      { city: 'Los Angeles', country: 'United States', lat: 34.05, lon: -118.24, maritime: true },
      { city: 'Chicago', country: 'United States', lat: 41.87, lon: -87.62 },
      { city: 'Houston', country: 'United States', lat: 29.76, lon: -95.37, maritime: true },
      { city: 'San Francisco', country: 'United States', lat: 37.77, lon: -122.41, maritime: true },
      { city: 'Miami', country: 'United States', lat: 25.76, lon: -80.19, maritime: true },
      { city: 'Atlanta', country: 'United States', lat: 33.75, lon: -84.39 },
      { city: 'Seattle', country: 'United States', lat: 47.60, lon: -122.33, maritime: true },
      { city: 'Denver', country: 'United States', lat: 39.74, lon: -104.99 },
      { city: 'Boston', country: 'United States', lat: 42.36, lon: -71.06, maritime: true },
      { city: 'Dallas', country: 'United States', lat: 32.78, lon: -96.80 },
      { city: 'Detroit', country: 'United States', lat: 42.33, lon: -83.04 },
      { city: 'Phoenix', country: 'United States', lat: 33.45, lon: -112.07 },
      { city: 'Portland', country: 'United States', lat: 45.52, lon: -122.67, maritime: true },
      { city: 'Las Vegas', country: 'United States', lat: 36.17, lon: -115.14 },
      { city: 'Minneapolis', country: 'United States', lat: 44.98, lon: -93.27 },
      { city: 'Philadelphia', country: 'United States', lat: 39.95, lon: -75.17, maritime: true },
      { city: 'San Diego', country: 'United States', lat: 32.72, lon: -117.16, maritime: true },
      { city: 'San Antonio', country: 'United States', lat: 29.42, lon: -98.49 },
      { city: 'Austin', country: 'United States', lat: 30.27, lon: -97.74 },
      { city: 'Nashville', country: 'United States', lat: 36.16, lon: -86.78 },
      { city: 'Charlotte', country: 'United States', lat: 35.23, lon: -80.84 },
      { city: 'Columbus', country: 'United States', lat: 39.96, lon: -82.99 },
      { city: 'Indianapolis', country: 'United States', lat: 39.77, lon: -86.16 },
      { city: 'Jacksonville', country: 'United States', lat: 30.33, lon: -81.66, maritime: true },
      { city: 'Memphis', country: 'United States', lat: 35.15, lon: -90.05 },
      { city: 'Baltimore', country: 'United States', lat: 39.29, lon: -76.61, maritime: true },
      { city: 'Milwaukee', country: 'United States', lat: 43.04, lon: -87.91 },
      { city: 'Albuquerque', country: 'United States', lat: 35.08, lon: -106.65 },
      { city: 'Tucson', country: 'United States', lat: 32.22, lon: -110.97 },
      { city: 'Omaha', country: 'United States', lat: 41.26, lon: -95.94 },
      { city: 'Raleigh', country: 'United States', lat: 35.78, lon: -78.64 },
      { city: 'Cleveland', country: 'United States', lat: 41.50, lon: -81.69 },
      { city: 'Kansas City', country: 'United States', lat: 39.10, lon: -94.58 },
      { city: 'Tampa', country: 'United States', lat: 27.95, lon: -82.46, maritime: true },
      { city: 'St. Louis', country: 'United States', lat: 38.63, lon: -90.20 },
      { city: 'Pittsburgh', country: 'United States', lat: 40.44, lon: -80.00 },
      { city: 'Cincinnati', country: 'United States', lat: 39.10, lon: -84.51 },
      { city: 'Orlando', country: 'United States', lat: 28.54, lon: -81.38 },
      { city: 'New Orleans', country: 'United States', lat: 29.95, lon: -90.07, maritime: true },
      { city: 'Salt Lake City', country: 'United States', lat: 40.76, lon: -111.89 },
      { city: 'Richmond', country: 'United States', lat: 37.54, lon: -77.44 },
      { city: 'Buffalo', country: 'United States', lat: 42.89, lon: -78.88 },
      { city: 'Honolulu', country: 'United States', lat: 21.31, lon: -157.86, maritime: true },
      { city: 'Anchorage', country: 'United States', lat: 61.22, lon: -149.90, maritime: true },
      { city: 'El Paso', country: 'United States', lat: 31.76, lon: -106.44 },
      { city: 'Boise', country: 'United States', lat: 43.62, lon: -116.21 },
      { city: 'Oklahoma City', country: 'United States', lat: 35.47, lon: -97.52 },
      { city: 'Louisville', country: 'United States', lat: 38.25, lon: -85.76 },
      { city: 'Hartford', country: 'United States', lat: 41.76, lon: -72.68 },
      { city: 'Spokane', country: 'United States', lat: 47.66, lon: -117.43 },
      { city: 'Little Rock', country: 'United States', lat: 34.75, lon: -92.29 },
      { city: 'Birmingham', country: 'United States', lat: 33.52, lon: -86.80 },
      { city: 'Norfolk', country: 'United States', lat: 36.85, lon: -76.29, maritime: true },
      { city: 'Toronto', country: 'Canada', lat: 43.65, lon: -79.38 },
      { city: 'Mexico City', country: 'Mexico', lat: 19.43, lon: -99.13 },
    ],
  },
  EUROPE: {
    id: 'EUROPE', name: 'Europe', shortName: 'EUROPE',
    baseRisk: 2, volatility: 0.3,
    color: '#6a8fd4',
    countries: ['United Kingdom', 'France', 'Germany', 'Poland', 'Italy', 'Spain', 'Ukraine'],
    cities: [
      { city: 'London', country: 'United Kingdom', lat: 51.50, lon: -0.12, maritime: true },
      { city: 'Paris', country: 'France', lat: 48.85, lon: 2.35 },
      { city: 'Berlin', country: 'Germany', lat: 52.52, lon: 13.40 },
      { city: 'Warsaw', country: 'Poland', lat: 52.22, lon: 21.01 },
      { city: 'Rome', country: 'Italy', lat: 41.90, lon: 12.49, maritime: true },
      { city: 'Kyiv', country: 'Ukraine', lat: 50.45, lon: 30.52 },
      { city: 'Madrid', country: 'Spain', lat: 40.41, lon: -3.70 },
    ],
  },
  MIDDLE_EAST: {
    id: 'MIDDLE_EAST', name: 'Middle East', shortName: 'MIDEAST',
    baseRisk: 4, volatility: 0.55,
    color: '#e0a030',
    countries: ['Iran', 'Iraq', 'Syria', 'Saudi Arabia', 'Israel', 'Turkey', 'Yemen', 'Lebanon'],
    cities: [
      { city: 'Tehran', country: 'Iran', lat: 35.69, lon: 51.38 },
      { city: 'Baghdad', country: 'Iraq', lat: 33.31, lon: 44.36 },
      { city: 'Damascus', country: 'Syria', lat: 33.51, lon: 36.29 },
      { city: 'Riyadh', country: 'Saudi Arabia', lat: 24.71, lon: 46.67 },
      { city: 'Tel Aviv', country: 'Israel', lat: 32.08, lon: 34.78, maritime: true },
      { city: 'Ankara', country: 'Turkey', lat: 39.93, lon: 32.85 },
      { city: 'Sana\'a', country: 'Yemen', lat: 15.35, lon: 44.20 },
      { city: 'Beirut', country: 'Lebanon', lat: 33.89, lon: 35.50, maritime: true },
    ],
  },
  EAST_ASIA: {
    id: 'EAST_ASIA', name: 'East Asia', shortName: 'E.ASIA',
    baseRisk: 3, volatility: 0.4,
    color: '#e07030',
    countries: ['China', 'North Korea', 'South Korea', 'Japan', 'Taiwan'],
    cities: [
      { city: 'Beijing', country: 'China', lat: 39.90, lon: 116.40 },
      { city: 'Shanghai', country: 'China', lat: 31.23, lon: 121.47, maritime: true },
      { city: 'Pyongyang', country: 'North Korea', lat: 39.03, lon: 125.75 },
      { city: 'Seoul', country: 'South Korea', lat: 37.56, lon: 126.97, maritime: true },
      { city: 'Tokyo', country: 'Japan', lat: 35.68, lon: 139.69, maritime: true },
      { city: 'Taipei', country: 'Taiwan', lat: 25.03, lon: 121.56, maritime: true },
    ],
  },
  SOUTH_ASIA: {
    id: 'SOUTH_ASIA', name: 'South Asia', shortName: 'S.ASIA',
    baseRisk: 3, volatility: 0.45,
    color: '#cc6040',
    countries: ['Pakistan', 'India', 'Afghanistan', 'Bangladesh'],
    cities: [
      { city: 'Islamabad', country: 'Pakistan', lat: 33.69, lon: 73.03 },
      { city: 'Kabul', country: 'Afghanistan', lat: 34.52, lon: 69.17 },
      { city: 'New Delhi', country: 'India', lat: 28.61, lon: 77.20 },
      { city: 'Mumbai', country: 'India', lat: 19.07, lon: 72.87, maritime: true },
      { city: 'Dhaka', country: 'Bangladesh', lat: 23.81, lon: 90.41, maritime: true },
    ],
  },
  AFRICA: {
    id: 'AFRICA', name: 'Africa', shortName: 'AFRICA',
    baseRisk: 3, volatility: 0.5,
    color: '#9060cc',
    countries: ['Nigeria', 'Somalia', 'Libya', 'Mali', 'Kenya', 'Ethiopia', 'South Africa', 'Egypt'],
    cities: [
      { city: 'Lagos', country: 'Nigeria', lat: 6.52, lon: 3.37, maritime: true },
      { city: 'Mogadishu', country: 'Somalia', lat: 2.04, lon: 45.34, maritime: true },
      { city: 'Tripoli', country: 'Libya', lat: 32.89, lon: 13.18, maritime: true },
      { city: 'Bamako', country: 'Mali', lat: 12.63, lon: -8.00 },
      { city: 'Nairobi', country: 'Kenya', lat: -1.28, lon: 36.81 },
      { city: 'Cairo', country: 'Egypt', lat: 30.04, lon: 31.23 },
    ],
  },
  RUSSIA_CIS: {
    id: 'RUSSIA_CIS', name: 'Russia & CIS', shortName: 'RUSSIA',
    baseRisk: 3, volatility: 0.35,
    color: '#cc4040',
    countries: ['Russia', 'Belarus', 'Kazakhstan', 'Georgia'],
    cities: [
      { city: 'Moscow', country: 'Russia', lat: 55.75, lon: 37.61 },
      { city: 'St. Petersburg', country: 'Russia', lat: 59.93, lon: 30.31, maritime: true },
      { city: 'Minsk', country: 'Belarus', lat: 53.90, lon: 27.55 },
      { city: 'Tbilisi', country: 'Georgia', lat: 41.71, lon: 44.78 },
      { city: 'Astana', country: 'Kazakhstan', lat: 51.16, lon: 71.42 },
    ],
  },
  LATIN_AMERICA: {
    id: 'LATIN_AMERICA', name: 'Latin America', shortName: 'LATAM',
    baseRisk: 2, volatility: 0.3,
    color: '#40a060',
    countries: ['Brazil', 'Colombia', 'Venezuela', 'Argentina', 'Cuba'],
    cities: [
      { city: 'Bogotá', country: 'Colombia', lat: 4.71, lon: -74.07 },
      { city: 'Caracas', country: 'Venezuela', lat: 10.48, lon: -66.90, maritime: true },
      { city: 'São Paulo', country: 'Brazil', lat: -23.55, lon: -46.63 },
      { city: 'Buenos Aires', country: 'Argentina', lat: -34.60, lon: -58.38 },
      { city: 'Havana', country: 'Cuba', lat: 23.11, lon: -82.36, maritime: true },
    ],
  },
};

// --- Maritime Locations (open-ocean threat spawn points) ---

var MARITIME_LOCATIONS = [
  // Piracy zones
  { name: 'Gulf of Aden',              theaterId: 'AFRICA',        lat: 12.0,  lon: 45.0 },
  { name: 'Gulf of Guinea',            theaterId: 'AFRICA',        lat: 3.0,   lon: 3.0 },
  { name: 'Somali Basin',              theaterId: 'AFRICA',        lat: 5.0,   lon: 50.0 },
  // Chokepoints
  { name: 'Strait of Hormuz',          theaterId: 'MIDDLE_EAST',   lat: 26.5,  lon: 56.2 },
  { name: 'Bab el-Mandeb Strait',      theaterId: 'MIDDLE_EAST',   lat: 12.6,  lon: 43.3 },
  { name: 'Suez Canal Approaches',     theaterId: 'MIDDLE_EAST',   lat: 30.0,  lon: 32.5 },
  { name: 'Strait of Malacca',         theaterId: 'EAST_ASIA',     lat: 2.5,   lon: 101.0 },
  { name: 'Taiwan Strait',             theaterId: 'EAST_ASIA',     lat: 24.0,  lon: 119.0 },
  // Smuggling routes
  { name: 'Caribbean Sea',             theaterId: 'LATIN_AMERICA', lat: 15.0,  lon: -70.0 },
  { name: 'Eastern Pacific Corridor',  theaterId: 'LATIN_AMERICA', lat: 8.0,   lon: -85.0 },
  { name: 'South China Sea',           theaterId: 'EAST_ASIA',     lat: 12.0,  lon: 114.0 },
  { name: 'Mediterranean Sea',         theaterId: 'EUROPE',        lat: 35.0,  lon: 18.0 },
  // Strategic waters
  { name: 'Arabian Sea',               theaterId: 'SOUTH_ASIA',    lat: 15.0,  lon: 62.0 },
  { name: 'Bay of Bengal',             theaterId: 'SOUTH_ASIA',    lat: 14.0,  lon: 87.0 },
  { name: 'East China Sea',            theaterId: 'EAST_ASIA',     lat: 30.0,  lon: 126.0 },
  { name: 'Norwegian Sea',             theaterId: 'RUSSIA_CIS',    lat: 66.0,  lon: 5.0 },
  { name: 'North Atlantic',            theaterId: 'EUROPE',        lat: 45.0,  lon: -30.0 },
];

// --- Codename Pools ---

var CODENAME_ADJ = [
  'IRON', 'SHADOW', 'CRIMSON', 'SILENT', 'BROKEN', 'FROZEN', 'DARK', 'STEEL',
  'FALLEN', 'BURNING', 'GOLDEN', 'SILVER', 'HOLLOW', 'BLIND', 'SAVAGE', 'GHOST',
  'AMBER', 'COBALT', 'IVORY', 'ONYX', 'SCARLET', 'OBSIDIAN', 'GRANITE', 'MERCURY',
  'VELVET', 'ARCTIC', 'SOLAR', 'LUNAR', 'STORM', 'EMBER', 'ASHEN', 'RAVEN',
  'JADE', 'COPPER', 'SAPPHIRE', 'CHROME', 'PHANTOM', 'RAPID', 'DEEP', 'FINAL',
  'SHARP', 'BLACK', 'WHITE', 'STARK', 'COLD', 'DIRE', 'GRIM', 'BLEAK',
  'NIGHT', 'DAWN', 'DUSK', 'PALE', 'RED', 'BLUE', 'GREY', 'RUST',
  'ACID', 'NEON', 'ZERO', 'PRIME', 'DUAL', 'FIRST', 'LAST', 'CORE',
  'OUTER', 'INNER', 'UPPER', 'LOWER', 'NORTH', 'SOUTH', 'EAST', 'WEST',
  'HIDDEN', 'OPEN', 'SEALED', 'LOST', 'WILD', 'THORN', 'STONE', 'GLASS',
  'TITAN', 'OMEGA', 'DELTA', 'SIGMA', 'GAMMA', 'ALPHA', 'BETA', 'APEX',
  'HYPER', 'ULTRA', 'NOVA', 'VOID', 'PULSE', 'FLUX', 'DRIFT', 'SURGE',
];

var CODENAME_NOUN = [
  'SPEAR', 'SHIELD', 'HAMMER', 'LANCE', 'ARROW', 'BLADE', 'DAGGER', 'SWORD',
  'EAGLE', 'HAWK', 'FALCON', 'WOLF', 'BEAR', 'LION', 'TIGER', 'VIPER',
  'THUNDER', 'LIGHTNING', 'TEMPEST', 'MONSOON', 'TYPHOON', 'BLIZZARD', 'CYCLONE', 'TORNADO',
  'SENTINEL', 'GUARDIAN', 'WARDEN', 'BASTION', 'FORTRESS', 'CITADEL', 'TOWER', 'RAMPART',
  'HORIZON', 'MERIDIAN', 'ZENITH', 'APEX', 'SUMMIT', 'RIDGE', 'VALLEY', 'CANYON',
  'ORACLE', 'SPHINX', 'PHOENIX', 'HYDRA', 'CHIMERA', 'GRYPHON', 'TITAN', 'ATLAS',
  'TRIDENT', 'HARPOON', 'JAVELIN', 'SABRE', 'RAPIER', 'CLAYMORE', 'PIKE', 'MACE',
  'CONDOR', 'OSPREY', 'RAVEN', 'COBRA', 'PYTHON', 'SCORPION', 'MANTIS', 'HORNET',
  'GLACIER', 'VOLCANO', 'TUNDRA', 'DESERT', 'REEF', 'CASCADE', 'DELTA', 'FJORD',
  'PRISM', 'NEXUS', 'HELIX', 'VERTEX', 'MATRIX', 'CIPHER', 'VECTOR', 'SPECTRUM',
];

var ORG_NAME_ADJ = [
  'Iron', 'Shadow', 'Crimson', 'Silent', 'Sacred', 'Golden', 'Black',
  'Burning', 'Fallen', 'Hidden', 'Eternal', 'True', 'Pure', 'Holy',
  'Red', 'White', 'Dark', 'Free', 'New', 'Last', 'First',
  'Divine', 'Righteous', 'Sovereign', 'United', 'People\'s', 'National',
  'Revolutionary', 'Liberation', 'Patriotic', 'Glorious', 'Awakened',
];

var ORG_NAME_NOUN = [
  'Dawn', 'Path', 'Sword', 'Shield', 'Hand', 'Eye', 'Voice',
  'Brigade', 'Front', 'Legion', 'Army', 'Guard', 'Militia', 'Force',
  'Brotherhood', 'Covenant', 'Order', 'Pact', 'Alliance', 'Council',
  'Resistance', 'Movement', 'Vanguard', 'Mandate', 'Directive',
  'Flame', 'Storm', 'Thunder', 'Hammer', 'Crescent', 'Cross', 'Star',
];

var PERSONNEL_ALIASES = [
  'CARDINAL', 'TOPAZ', 'GRANITE', 'ONYX', 'MERCURY', 'OBSIDIAN', 'OPAL',
  'JASPER', 'COBALT', 'AMBER', 'GARNET', 'IVORY', 'BASALT', 'QUARTZ',
  'FLINT', 'SLATE', 'MARBLE', 'CORAL', 'PEARL', 'RUBY', 'IRON',
  'COPPER', 'BRONZE', 'SILVER', 'PLATINUM', 'TITANIUM', 'TUNGSTEN',
  'CEDAR', 'OAK', 'BIRCH', 'PINE', 'MAPLE', 'ASH', 'WILLOW', 'ELM',
  'HAWK', 'FALCON', 'EAGLE', 'OSPREY', 'CONDOR', 'RAVEN', 'SPARROW',
  'WOLF', 'BEAR', 'FOX', 'LYNX', 'PANTHER', 'COBRA', 'VIPER', 'MANTIS',
];

// --- Theater Helper ---

function getTheater(id) {
  return THEATERS[id] || null;
}

function getRandomTheater() {
  var keys = Object.keys(THEATERS);
  return THEATERS[pick(keys)];
}

function getTheaterCity(theaterId) {
  var t = THEATERS[theaterId];
  if (!t || !t.cities.length) return null;
  return pick(t.cities);
}

function getAllCities() {
  var all = [];
  for (var tid in THEATERS) {
    all = all.concat(THEATERS[tid].cities);
  }
  return all;
}

// --- Operation Type Helper ---

function getOperationType(id) {
  return OPERATION_TYPES[id] || null;
}

// --- Event Category → Operation Type Mapping ---

var EVENT_TO_OP_TYPE = {
  SECURITY: 'COUNTER_TERROR',
  CYBER: 'CYBER_OP',
  MILITARY: 'MILITARY_STRIKE',
  INTELLIGENCE: 'INTEL_COLLECTION',
  DIPLOMATIC: 'DIPLOMATIC_RESPONSE',
  WMD: 'SURVEILLANCE',
  CRIME: 'NAVAL_INTERDICTION',
  SPACE: 'SURVEILLANCE',
  HUMANITARIAN: 'DIPLOMATIC_RESPONSE',
  DOMESTIC: 'SURVEILLANCE',
};
