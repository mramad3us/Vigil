/* ============================================================
   VIGIL — systems/assets.js
   Deployable military/intel assets. Each tied to a home base.
   Transit calculations, position updates, return-to-base.
   ============================================================ */

// --- Asset Templates ---
// These define the "types" of assets. Instances are created at game start.

var ASSET_TEMPLATES = [
  // ======================= SOF =======================
  {
    type: 'SEAL_TEAM_6', name: 'SEAL Team 6 (DEVGRU)', category: 'SOF', deniability: 'COVERT',
    homeBaseId: 'DAM_NECK', speed: 800,
    capabilities: ['SOF', 'STRIKE', 'HOSTAGE_RESCUE', 'COUNTER_TERROR'],
    collectionProfile: { HUMINT: 3, IMAGERY: 3, SIGINT: 1 },
    designation: 'Naval Special Warfare Development Group',
    personnel: 300,
    readiness: 'TIER_1',
    platform: 'Ground/Maritime',
    vehicles: ['MH-60M Black Hawk', 'MH-47G Chinook', 'RHIB assault craft', 'SDV Mk 8 Mod 1'],
    equipment: ['Suppressed HK416 assault rifles', 'AN/PVS-31A night vision', 'breaching charges', 'tactical communications suite', 'Close Quarters Battle kits'],
    description: 'Tier 1 special missions unit specializing in hostage rescue, direct action, and counter-terrorism. Capable of maritime, airborne, and ground infiltration. Can deploy anywhere in the world within 18 hours.',
    unitComposition: '4 assault squadrons (Red, Blue, Gold, Silver), 1 SIGINT support element, 1 tactical development and evaluation squadron',
  },
  {
    type: 'DELTA_FORCE', name: '1st SFOD-Delta', category: 'SOF', deniability: 'COVERT',
    homeBaseId: 'FORT_LIBERTY', speed: 800,
    capabilities: ['SOF', 'STRIKE', 'HOSTAGE_RESCUE', 'COUNTER_TERROR'],
    collectionProfile: { HUMINT: 3, IMAGERY: 3, SIGINT: 1 },
    designation: '1st Special Forces Operational Detachment-Delta',
    personnel: 250,
    readiness: 'TIER_1',
    platform: 'Ground/Airborne',
    vehicles: ['MH-6 Little Bird', 'Ground Mobility Vehicle', 'Pandur armored car', 'civilian cover vehicles'],
    equipment: ['Custom M4A1 SOPMOD', 'AN/PEQ-15 laser designators', 'explosive entry tools', 'ISR micro-drones', 'Level IV body armor'],
    description: 'Tier 1 special missions unit specializing in direct action, hostage rescue, and counter-terrorism. Operates under JSOC with maximum operational security. Urban warfare and close quarters experts.',
    unitComposition: '3 assault squadrons (A, B, C), 1 support squadron (D), aviation platoon from 160th SOAR attached',
  },
  {
    type: 'JSOC_TASK_FORCE', name: 'JSOC Task Force', category: 'SOF', deniability: 'COVERT',
    homeBaseId: 'FORT_LIBERTY', speed: 750,
    capabilities: ['SOF', 'STRIKE', 'COUNTER_TERROR'],
    collectionProfile: { HUMINT: 2, IMAGERY: 2, SIGINT: 2 },
    designation: 'Joint Special Operations Command Task Force',
    personnel: 180,
    readiness: 'TIER_1',
    platform: 'Multi-domain',
    vehicles: ['CV-22B Osprey', 'MH-60L DAP', 'technical vehicles'],
    equipment: ['Multi-spectral targeting systems', 'encrypted satellite uplink', 'drone swarm controllers', 'AI-assisted targeting package'],
    description: 'Combined task force drawing operators from multiple Tier 1 units for complex multi-domain operations. Optimized for high-value target elimination and network disruption in denied environments.',
    unitComposition: 'Composite force: Green Berets ODA elements, intelligence support activity (ISA), signals exploitation team, tactical air control party',
  },
  {
    type: '75TH_RANGERS', name: '75th Ranger Regiment', category: 'SOF', deniability: 'OVERT',
    homeBaseId: 'FORT_LIBERTY', speed: 700,
    capabilities: ['SOF', 'STRIKE', 'MILITARY'],
    collectionProfile: { HUMINT: 1, IMAGERY: 2 },
    designation: '75th Ranger Regiment, U.S. Army',
    personnel: 3600,
    readiness: 'TIER_2',
    platform: 'Light Infantry/Airborne',
    vehicles: ['Stryker ICV', 'JLTV', 'GMV 1.1', 'AH-64E Apache escort'],
    equipment: ['M4A1 carbines', 'Carl Gustaf M3E1 recoilless rifles', 'Javelin ATGMs', '60mm/81mm mortars', 'AN/PRC-163 radios'],
    description: 'Elite light infantry regiment capable of airfield seizure, large-scale raids, and direct action operations. Can deploy a full battalion within 18 hours via airborne insertion.',
    unitComposition: '3 Ranger battalions (1st, 2nd, 3rd), Regimental Special Troops Battalion, Military Intelligence Battalion',
  },

  // ======================= NAVY =======================
  {
    type: 'CSG_7', name: 'Carrier Strike Group 7', category: 'NAVY', deniability: 'OVERT',
    homeBaseId: 'YOKOSUKA', speed: 55, effectiveRangeKm: 1500,
    capabilities: ['NAVAL', 'STRIKE', 'ISR'],
    collectionProfile: { IMAGERY: 1, SIGINT: 1, ISR: 1 },
    designation: 'Carrier Strike Group 7, U.S. 7th Fleet',
    personnel: 7500,
    readiness: 'FULL',
    platform: 'Carrier Strike Group',
    vehicles: ['CVN-76 USS Ronald Reagan (Nimitz-class carrier)', '2x Arleigh Burke-class destroyers', '1x Ticonderoga-class cruiser', '1x Los Angeles-class submarine'],
    equipment: ['F/A-18E/F Super Hornets (44)', 'EA-18G Growlers (5)', 'E-2D Advanced Hawkeye (4)', 'MH-60R/S helicopters (8)', 'Tomahawk cruise missiles (300+)', 'SM-6 SAMs', 'Aegis combat system'],
    description: 'Forward-deployed carrier strike group providing persistent presence in the Western Pacific. Full-spectrum naval warfare capability including power projection, anti-submarine warfare, and integrated air and missile defense. 85+ fixed-wing aircraft aboard.',
    unitComposition: 'Carrier air wing (CVW-5), Destroyer Squadron 15, cruiser-destroyer group, submarine element, logistics support',
  },
  {
    type: 'CSG_2', name: 'Carrier Strike Group 2', category: 'NAVY', deniability: 'OVERT',
    homeBaseId: 'NORFOLK', speed: 55, effectiveRangeKm: 1500,
    capabilities: ['NAVAL', 'STRIKE', 'ISR'],
    collectionProfile: { IMAGERY: 1, SIGINT: 1, ISR: 1 },
    designation: 'Carrier Strike Group 2, U.S. 2nd Fleet',
    personnel: 7500,
    readiness: 'FULL',
    platform: 'Carrier Strike Group',
    vehicles: ['CVN-77 USS George H.W. Bush (Nimitz-class carrier)', '2x Arleigh Burke-class destroyers', '1x Ticonderoga-class cruiser', '1x Virginia-class submarine'],
    equipment: ['F-35C Lightning II (20)', 'F/A-18E/F Super Hornets (24)', 'EA-18G Growlers (5)', 'E-2D Advanced Hawkeye (4)', 'MH-60R/S helicopters (8)', 'Tomahawk cruise missiles (300+)', 'Aegis BMD system'],
    description: 'Atlantic-based carrier strike group providing surge capability for European and Middle Eastern operations. Features next-generation F-35C stealth fighters alongside legacy Super Hornets for maximum strike flexibility.',
    unitComposition: 'Carrier air wing (CVW-8), Destroyer Squadron 22, cruiser-destroyer group, submarine element, logistics support',
  },
  {
    type: 'CSG_3', name: 'Carrier Strike Group 3', category: 'NAVY', deniability: 'OVERT',
    homeBaseId: 'PEARL_HARBOR', speed: 55, effectiveRangeKm: 1500,
    capabilities: ['NAVAL', 'STRIKE', 'ISR'],
    collectionProfile: { IMAGERY: 1, SIGINT: 1, ISR: 2 },
    designation: 'Carrier Strike Group 3, U.S. 3rd Fleet',
    personnel: 7500,
    readiness: 'FULL',
    platform: 'Carrier Strike Group',
    vehicles: ['CVN-78 USS Gerald R. Ford (Ford-class carrier)', '3x Arleigh Burke-class Flight III destroyers', '1x Virginia-class Block V submarine'],
    equipment: ['F-35C Lightning II (28)', 'F/A-18E/F Super Hornets (16)', 'EA-18G Growlers (7)', 'E-2D Advanced Hawkeye (5)', 'MQ-25 Stingray tanker drones (4)', 'EMALS catapults', 'Advanced Arresting Gear', 'Dual Band Radar'],
    description: 'Ford-class carrier strike group representing the most advanced naval aviation platform ever deployed. Enhanced sortie generation rate, electromagnetic aircraft launch system, and integrated unmanned aerial tankers extend strike range by 400%.',
    unitComposition: 'Carrier air wing (CVW-11), Destroyer Squadron 1, Flight III DDGs with AN/SPY-6 radar, submarine element, logistics support',
  },
  {
    type: 'DDG_SQUADRON', name: 'Destroyer Squadron 15', category: 'NAVY', deniability: 'OVERT',
    homeBaseId: 'YOKOSUKA', speed: 60, effectiveRangeKm: 1600,
    capabilities: ['NAVAL', 'STRIKE'],
    collectionProfile: { SIGINT: 1 },
    designation: 'Destroyer Squadron 15, U.S. 7th Fleet',
    personnel: 1200,
    readiness: 'FULL',
    platform: 'Surface Combatant Group',
    vehicles: ['4x Arleigh Burke-class destroyers (DDG-51 Flight IIA)', '2x Arleigh Burke-class Flight III destroyers'],
    equipment: ['96x Mk 41 VLS cells per ship', 'Tomahawk Land Attack Missiles', 'SM-2/SM-6 SAMs', 'RIM-162 ESSM', 'Mk 54 lightweight torpedoes', 'AN/SPY-1D(V) / AN/SPY-6 radar', 'SQQ-89 ASW suite'],
    description: 'Forward-deployed destroyer squadron providing independent surface warfare, ballistic missile defense, and anti-submarine warfare capability. Can operate independently or as escort for carrier operations.',
    unitComposition: '6 destroyers with 576 combined VLS cells, organic helicopters (MH-60R), embarked VBSS teams',
  },
  {
    type: 'SSN_SQUADRON', name: 'Submarine Squadron 8', category: 'NAVY', deniability: 'OVERT',
    homeBaseId: 'NORFOLK', speed: 50, effectiveRangeKm: 1600,
    capabilities: ['NAVAL', 'INTEL', 'STRIKE'],
    collectionProfile: { SIGINT: 3, ISR: 1 },
    designation: 'Submarine Squadron 8, U.S. Atlantic Fleet',
    personnel: 600,
    readiness: 'FULL',
    platform: 'Nuclear Submarine Group',
    vehicles: ['2x Virginia-class Block V SSN', '1x Virginia-class Block IV SSN'],
    equipment: ['Tomahawk cruise missiles (40 per boat)', 'Virginia Payload Module (VPM)', 'Mk 48 ADCAP torpedoes', 'AN/BYG-1 combat system', 'towed sonar array', 'Special Operations dry deck shelter', 'UUV launch capability'],
    description: 'Nuclear fast-attack submarine squadron providing covert strike, intelligence collection, and special operations insertion capability. Operates undetected in denied waters for months. Virginia Payload Module triples strike capacity.',
    unitComposition: '3 nuclear submarines, 450 combined Tomahawk capacity with VPM, SEAL delivery vehicle detachment',
  },

  // ======================= AIR =======================
  {
    type: 'F35_SQN_EU', name: 'F-35A Squadron (EU)', category: 'AIR', deniability: 'OVERT',
    homeBaseId: 'RAMSTEIN', speed: 1700,
    capabilities: ['STRIKE', 'ISR'],
    collectionProfile: { IMAGERY: 1, ISR: 1 },
    designation: '495th Fighter Squadron, 48th Fighter Wing',
    personnel: 450,
    readiness: 'FULL',
    platform: 'Stealth Multirole Fighter',
    vehicles: ['24x F-35A Lightning II Block 4', '2x KC-46A Pegasus tanker (attached)'],
    equipment: ['AN/APG-81 AESA radar', 'AN/AAQ-37 DAS', 'AN/ASQ-239 EW suite', 'GBU-53/B StormBreaker glide bombs', 'AIM-120D AMRAAM', 'AGM-158 JASSM-ER', 'B61-12 nuclear gravity bomb (certified)'],
    description: '5th-generation stealth multi-role squadron providing air superiority, precision strike, and ISR fusion in the European theater. Each aircraft functions as a sensor node in the kill web, sharing targeting data with all networked forces.',
    unitComposition: '24 aircraft in 3 flights of 8, maintenance squadron, weapons loading crews, mission planning cell',
  },
  {
    type: 'F35_SQN_PAC', name: 'F-35A Squadron (PAC)', category: 'AIR', deniability: 'OVERT',
    homeBaseId: 'KADENA', speed: 1700,
    capabilities: ['STRIKE', 'ISR'],
    collectionProfile: { IMAGERY: 1, ISR: 1 },
    designation: '356th Fighter Squadron, 18th Wing',
    personnel: 450,
    readiness: 'FULL',
    platform: 'Stealth Multirole Fighter',
    vehicles: ['24x F-35A Lightning II Block 4', '2x KC-135R Stratotanker (attached)'],
    equipment: ['AN/APG-81 AESA radar', 'AN/AAQ-37 DAS', 'AN/ASQ-239 EW suite', 'GBU-31 JDAM', 'GBU-39 SDB II', 'AIM-9X Sidewinder', 'JSM anti-ship missile'],
    description: '5th-generation stealth multi-role squadron providing forward air presence in the Pacific theater. Optimized for maritime strike and anti-access/area-denial (A2/AD) penetration missions against near-peer threats.',
    unitComposition: '24 aircraft in 3 flights of 8, maintenance squadron, weapons loading crews, mission planning cell',
  },
  {
    type: 'B2_WING', name: 'B-2 Spirit Wing', category: 'AIR', deniability: 'OVERT',
    homeBaseId: 'CREECH', speed: 900,
    capabilities: ['STRIKE'],
    collectionProfile: {},
    designation: '509th Bomb Wing (Provisional)',
    personnel: 350,
    readiness: 'FULL',
    platform: 'Stealth Strategic Bomber',
    vehicles: ['6x B-2A Spirit stealth bombers'],
    equipment: ['AN/APQ-181 radar (upgraded)', 'JDAM (80 per sortie)', 'GBU-57A/B Massive Ordnance Penetrator', 'AGM-158B JASSM-ER (16 per sortie)', 'B83 nuclear gravity bomb (certified)', 'AESA radar modernization'],
    description: 'Strategic stealth bomber wing capable of penetrating the most advanced air defense systems in the world. Each aircraft can deliver 40,000 lbs of precision ordnance to any point on the globe without refueling. Intercontinental range.',
    unitComposition: '6 operational bombers, mission planning cell, in-flight refueling coordination, STRATCOM liaison',
  },
  {
    type: 'AC130_FLIGHT', name: 'AC-130J Ghostrider Flight', category: 'AIR', deniability: 'OVERT',
    homeBaseId: 'SOTO_CANO', speed: 480,
    capabilities: ['STRIKE', 'SOF'],
    collectionProfile: { IMAGERY: 2, ISR: 1 },
    designation: '4th Special Operations Squadron (Det. 1)',
    personnel: 120,
    readiness: 'FULL',
    platform: 'Gunship',
    vehicles: ['3x AC-130J Ghostrider'],
    equipment: ['105mm M102 howitzer', '30mm GAU-23 autocannon', 'AGM-176 Griffin missiles', 'GBU-39 SDB', 'AN/AAQ-38 targeting pod', 'Link 16 datalink', 'precision strike package'],
    description: 'Special operations gunship flight providing persistent close air support, armed overwatch, and precision strike for SOF operations. Loiters for hours over the target area with devastating firepower under all-weather conditions.',
    unitComposition: '3 aircraft with 13-person crews each, SOF liaison officer, combat controllers for terminal guidance',
  },

  // ======================= ISR =======================
  {
    type: 'MQ9_FLIGHT_ME', name: 'MQ-9 Reaper Flight (ME)', category: 'ISR', deniability: 'OVERT',
    homeBaseId: 'AL_UDEID', speed: 370,
    capabilities: ['ISR', 'STRIKE'],
    collectionProfile: { IMAGERY: 5, ISR: 4, SIGINT: 2 },
    designation: '432nd Wing Detachment (Middle East)',
    personnel: 80,
    readiness: 'FULL',
    platform: 'Armed MALE UAS',
    vehicles: ['8x MQ-9A Reaper Block 5'],
    equipment: ['MTS-B multi-spectral targeting system', 'Lynx SAR/GMTI radar', 'AGM-114R Hellfire II (4 per aircraft)', 'GBU-12 Paveway II (2 per aircraft)', 'GBU-38 JDAM', 'SIGINT pod', 'full-motion video (FMV) relay'],
    description: 'Medium-altitude long-endurance UAS flight providing 24/7 persistent surveillance and precision strike in the Middle East theater. Each aircraft can loiter for 27+ hours, maintaining unblinking overwatch of target areas. Piloted remotely from Creech AFB.',
    unitComposition: '8 airframes, 16 sensor operators, ground control station (GCS) crews, maintenance detachment, intelligence analysts',
  },
  {
    type: 'MQ9_FLIGHT_AF', name: 'MQ-9 Reaper Flight (AF)', category: 'ISR', deniability: 'OVERT',
    homeBaseId: 'CAMP_LEMONNIER', speed: 370,
    capabilities: ['ISR', 'STRIKE'],
    collectionProfile: { IMAGERY: 5, ISR: 4, SIGINT: 2 },
    designation: '432nd Wing Detachment (Africa)',
    personnel: 80,
    readiness: 'FULL',
    platform: 'Armed MALE UAS',
    vehicles: ['6x MQ-9A Reaper Block 5'],
    equipment: ['MTS-B multi-spectral targeting system', 'Lynx SAR/GMTI radar', 'AGM-114R Hellfire II', 'GBU-12 Paveway II', 'wide-area airborne surveillance (WAAS) pod', 'SIGINT collection suite'],
    description: 'Persistent UAS flight providing armed ISR coverage across the Horn of Africa and East Africa. Primary mission: tracking and eliminating high-value targets in austere environments with minimal forward presence.',
    unitComposition: '6 airframes, 12 sensor operators, GCS crews, maintenance detachment, HUMINT fusion cell',
  },
  {
    type: 'RQ4_FLIGHT', name: 'RQ-4 Global Hawk Flight', category: 'ISR', deniability: 'OVERT',
    homeBaseId: 'CREECH', speed: 575,
    capabilities: ['ISR', 'SIGINT'],
    collectionProfile: { IMAGERY: 5, ISR: 5, SIGINT: 2 },
    designation: '12th Reconnaissance Squadron',
    personnel: 60,
    readiness: 'FULL',
    platform: 'HALE UAS',
    vehicles: ['4x RQ-4B Global Hawk Block 40'],
    equipment: ['Enhanced Integrated Sensor Suite (EISS)', 'Multi-Platform Radar Technology Insertion Program (MP-RTIP)', 'SIGINT payload', 'electro-optical/infrared sensor', 'SAR radar with 1m resolution', 'communications relay'],
    description: 'High-altitude long-endurance surveillance platform operating at 60,000+ feet for 30+ hours. Covers an area the size of South Korea in a single sortie. Unmatched wide-area surveillance for theater-level intelligence.',
    unitComposition: '4 airframes, mission control element, ground processing station, signals analysts',
  },
  {
    type: 'EP3_ARIES', name: 'EP-3E Aries II', category: 'ISR', deniability: 'OVERT',
    homeBaseId: 'BAHRAIN', speed: 610,
    capabilities: ['ISR', 'SIGINT'],
    collectionProfile: { SIGINT: 5, ISR: 2 },
    designation: 'Fleet Air Reconnaissance Squadron 1 (VQ-1) Det.',
    personnel: 100,
    readiness: 'FULL',
    platform: 'Manned SIGINT Aircraft',
    vehicles: ['2x EP-3E Aries II'],
    equipment: ['AN/ALQ-227 SIGINT suite', 'wideband communications intercept', 'ELINT receivers', 'DF antenna array', 'voice and data recording systems', 'on-board cryptologic analysis'],
    description: 'Manned signals intelligence aircraft with 24 on-board operators conducting real-time SIGINT collection, analysis, and reporting. Capable of intercepting, geolocating, and exploiting electromagnetic emissions across the full spectrum.',
    unitComposition: '2 aircraft, 24-person mission crews per aircraft, ground processing element, linguist team',
  },
  {
    type: 'RC135_RIVET', name: 'RC-135 Rivet Joint', category: 'ISR', deniability: 'OVERT',
    homeBaseId: 'MENWITH_HILL', speed: 800,
    capabilities: ['ISR', 'SIGINT', 'CYBER'],
    collectionProfile: { SIGINT: 5, CYBER: 3, ISR: 2 },
    designation: '95th Reconnaissance Squadron Det. (Europe)',
    personnel: 120,
    readiness: 'FULL',
    platform: 'Strategic SIGINT/ELINT Aircraft',
    vehicles: ['2x RC-135V/W Rivet Joint'],
    equipment: ['AEELS electronic intelligence system', 'Real-Time Information in the Cockpit (RTIC)', 'satellite communications relay', 'automated ELINT analysis', 'cyber exploitation payload (classified)', 'threat warning receivers'],
    description: 'Strategic signals intelligence platform providing real-time electronic intelligence to theater and national-level consumers. On-board analysts detect, identify, and geolocate signals of interest across an entire theater of operations. The aircraft the adversary fears most.',
    unitComposition: '2 aircraft, 32-person mission crews per aircraft, signals intelligence analysts, electronic warfare officers, linguists',
  },

  // ======================= INTEL =======================
  {
    type: 'CIA_SAD_EU', name: 'CIA SAD/SOG (Europe)', category: 'INTEL', deniability: 'COVERT',
    homeBaseId: 'CIA_LONDON', speed: 600,
    capabilities: ['INTEL', 'SOF', 'COUNTER_TERROR'],
    collectionProfile: { HUMINT: 5, IMAGERY: 2, SIGINT: 1 },
    designation: 'Special Activities Division / Special Operations Group',
    personnel: 40,
    readiness: 'TIER_1',
    platform: 'Covert Operations',
    vehicles: ['Civilian cover vehicles', 'leased rotary-wing', 'maritime insertion craft'],
    equipment: ['Non-attributable weapons systems', 'covert communications equipment', 'biometric collection devices', 'denied-area access tools', 'cover documentation packages', 'tactical medical kits'],
    description: 'CIA paramilitary operations element conducting covert action, direct action, and unconventional warfare in the European theater. Operates under official and non-official cover with plausible deniability. Drawn from former Tier 1 operators.',
    unitComposition: 'Ground Branch operators (16), maritime element (8), air element (4), technical support (12)',
  },
  {
    type: 'CIA_SAD_ME', name: 'CIA SAD/SOG (Middle East)', category: 'INTEL', deniability: 'COVERT',
    homeBaseId: 'CIA_CAIRO', speed: 600,
    capabilities: ['INTEL', 'SOF', 'COUNTER_TERROR'],
    collectionProfile: { HUMINT: 5, IMAGERY: 2, SIGINT: 1 },
    designation: 'Special Activities Division / Special Operations Group',
    personnel: 40,
    readiness: 'TIER_1',
    platform: 'Covert Operations',
    vehicles: ['Armored SUVs (non-attributable)', 'civilian rotary-wing', 'technical vehicles'],
    equipment: ['Non-attributable weapons', 'tactical ISR micro-drones', 'encrypted HF/VHF radios', 'covert tracking beacons', 'field surgical kits', 'cash reserves (operational funds)'],
    description: 'CIA paramilitary operations element with deep expertise in Middle Eastern operations. Conducts unilateral covert action, advise-and-assist with partner forces, and high-risk human intelligence operations in denied areas.',
    unitComposition: 'Ground Branch operators (20), HUMINT enablers (8), technical surveillance team (6), logistics (6)',
  },
  {
    type: 'CIA_CASE_TEAM_1', name: 'CIA Case Officer Team Alpha', category: 'INTEL', deniability: 'COVERT',
    homeBaseId: 'CIA_BERLIN', speed: 500,
    capabilities: ['INTEL', 'HUMINT'],
    collectionProfile: { HUMINT: 5, OSINT: 2, SIGINT: 1 },
    designation: 'Directorate of Operations — European Division',
    personnel: 12,
    readiness: 'FULL',
    platform: 'Clandestine HUMINT',
    vehicles: ['Diplomatic and civilian cover vehicles'],
    equipment: ['Covert recording devices', 'encrypted burst communications', 'dead drop materials', 'counter-surveillance detection gear', 'fabricated identity documents', 'polygraph equipment'],
    description: 'Clandestine human intelligence team operating under diplomatic and non-official cover across European targets. Recruits, handles, and manages human sources within foreign governments, military, and intelligence services.',
    unitComposition: '4 case officers, 2 reports officers, 2 targeting analysts, 2 surveillance detection operators, 2 technical officers',
  },
  {
    type: 'CIA_CASE_TEAM_2', name: 'CIA Case Officer Team Bravo', category: 'INTEL', deniability: 'COVERT',
    homeBaseId: 'CIA_ISLAMABAD', speed: 500,
    capabilities: ['INTEL', 'HUMINT'],
    collectionProfile: { HUMINT: 5, OSINT: 2, SIGINT: 1 },
    designation: 'Directorate of Operations — South Asia Division',
    personnel: 12,
    readiness: 'FULL',
    platform: 'Clandestine HUMINT',
    vehicles: ['Armored diplomatic vehicles', 'local cover vehicles'],
    equipment: ['Covert recording devices', 'encrypted satellite phone', 'counter-surveillance gear', 'biometric enrollment kit', 'safe house materials', 'emergency exfiltration kits'],
    description: 'Clandestine HUMINT team specializing in South Asian intelligence operations. Manages a network of human sources across Pakistan, Afghanistan, and India. Operates in high-threat environments with minimal support infrastructure.',
    unitComposition: '4 case officers, 2 reports officers, 2 targeting analysts, 2 surveillance detection operators, 2 technical officers',
  },
  {
    type: 'CIA_CASE_TEAM_3', name: 'CIA Case Officer Team Charlie', category: 'INTEL', deniability: 'COVERT',
    homeBaseId: 'CIA_TOKYO', speed: 500,
    capabilities: ['INTEL', 'HUMINT'],
    collectionProfile: { HUMINT: 5, OSINT: 2, SIGINT: 1 },
    designation: 'Directorate of Operations — East Asia Pacific Division',
    personnel: 12,
    readiness: 'FULL',
    platform: 'Clandestine HUMINT',
    vehicles: ['Diplomatic vehicles', 'commercial cover fleet'],
    equipment: ['Technical surveillance devices', 'encrypted communications suite', 'counter-surveillance detection equipment', 'deep cover documentation', 'cyber-enabled HUMINT tools'],
    description: 'Clandestine HUMINT team conducting intelligence collection against East Asian targets. Operates sophisticated human source networks penetrating foreign intelligence services, military establishments, and technology sectors.',
    unitComposition: '4 case officers, 2 reports officers, 2 targeting analysts, 2 surveillance detection operators, 2 cyber-HUMINT specialists',
  },
  {
    type: 'DIA_SIGINT_TEAM', name: 'DIA SIGINT Collection Team', category: 'INTEL', deniability: 'COVERT',
    homeBaseId: 'FORT_MEADE', speed: 500,
    capabilities: ['INTEL', 'SIGINT', 'CYBER'],
    collectionProfile: { SIGINT: 5, CYBER: 3 },
    designation: 'Defense Clandestine Service — SIGINT Collection',
    personnel: 30,
    readiness: 'FULL',
    platform: 'Technical SIGINT',
    vehicles: ['SIGINT collection vans (disguised)', 'portable antenna platforms'],
    equipment: ['Wideband RF interceptors', 'direction-finding arrays', 'COMINT processors', 'network exploitation tools', 'close-access SIGINT devices', 'cloud-based analysis platform'],
    description: 'Defense Intelligence Agency signals intelligence team providing close-access technical collection against priority targets. Deploys forward to intercept communications, map networks, and enable cyber operations.',
    unitComposition: 'SIGINT collectors (12), cryptologic analysts (8), network warfare operators (4), support staff (6)',
  },
  {
    type: 'NSA_TAO', name: 'NSA TAO Unit', category: 'INTEL', deniability: 'COVERT',
    homeBaseId: 'FORT_MEADE', speed: 0,
    capabilities: ['CYBER', 'SIGINT'],
    collectionProfile: { CYBER: 5, SIGINT: 4 },
    designation: 'NSA Tailored Access Operations',
    personnel: 45,
    readiness: 'FULL',
    platform: 'Remote Cyber Operations',
    vehicles: [],
    equipment: ['Custom exploitation frameworks', 'zero-day exploit library', 'network implant toolkits', 'quantum computing access (limited)', 'AI-assisted vulnerability analysis', 'global signals intercept feeds'],
    description: 'NSA\'s premier cyber operations unit conducting computer network exploitation and attack from CONUS. No forward deployment required — operates through the global signals architecture. Can penetrate virtually any network on Earth given sufficient time.',
    unitComposition: 'Exploit developers (15), network operators (12), target analysts (10), software engineers (8)',
  },

  // ======================= DIPLOMATIC =======================
  {
    type: 'STATE_DEPT_ENVOY', name: 'State Dept Special Envoy', category: 'DIPLOMATIC', deniability: 'COVERT',
    homeBaseId: 'LANGLEY', speed: 800,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: { HUMINT: 2 },
    diplomaticEffectiveness: 5,
    designation: 'Department of State — Office of the Special Envoy',
    personnel: 8,
    readiness: 'FULL',
    platform: 'Diplomatic Mission',
    vehicles: ['Armored diplomatic sedan', 'secure transport detail'],
    equipment: ['Secure communications suite', 'classified briefing materials', 'diplomatic pouch', 'biometric credentials', 'encrypted satellite phone'],
    description: 'Senior diplomatic envoy operating under State Department authority with direct access to foreign heads of state. Can negotiate at the highest levels on behalf of the US government. Carries presidential authorization for sensitive discussions.',
    unitComposition: 'Special envoy (1), deputy (1), political advisor (2), security detail (4)',
  },
  {
    type: 'STATE_DEPT_NEGOTIATOR', name: 'State Dept Crisis Negotiator', category: 'DIPLOMATIC', deniability: 'COVERT',
    homeBaseId: 'LANGLEY', speed: 800,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: { HUMINT: 1 },
    diplomaticEffectiveness: 4,
    designation: 'Department of State — Bureau of Conflict & Stabilization Operations',
    personnel: 6,
    readiness: 'FULL',
    platform: 'Crisis Negotiation Team',
    vehicles: ['Armored transport', 'secure communications vehicle'],
    equipment: ['Crisis negotiation protocols', 'secure satellite communications', 'cultural advisory materials', 'regional briefing dossiers', 'encrypted laptop'],
    description: 'Specialist crisis negotiator deployed to defuse active diplomatic confrontations. Trained in hostage negotiation, ceasefire brokering, and de-escalation under extreme political pressure. Reports directly to the Secretary of State.',
    unitComposition: 'Lead negotiator (1), deputy negotiator (1), regional analyst (2), security detail (2)',
  },
  {
    type: 'NSC_REPRESENTATIVE', name: 'NSC Senior Director', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'LANGLEY', speed: 800,
    capabilities: ['DIPLOMATIC', 'INTEL'],
    collectionProfile: {},
    diplomaticEffectiveness: 5,
    designation: 'National Security Council — Directorate of Strategic Affairs',
    personnel: 5,
    readiness: 'FULL',
    platform: 'Executive Diplomatic Mission',
    vehicles: ['Executive transport aircraft', 'armored motorcade'],
    equipment: ['Presidential authorization letters', 'classified situation briefings', 'secure White House communications', 'executive orders portfolio'],
    description: 'Senior National Security Council director carrying direct presidential authority. Deployed for situations requiring executive-level engagement with foreign governments. Can make binding commitments on behalf of the United States.',
    unitComposition: 'Senior director (1), deputy (1), intelligence briefer (1), security detail (2)',
  },
  {
    type: 'AMBASSADOR_EU', name: 'US Ambassador (Europe)', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'CIA_LONDON', speed: 800,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: {},
    diplomaticEffectiveness: 4,
    designation: 'US Embassy — European Affairs',
    personnel: 15,
    readiness: 'FULL',
    platform: 'Embassy Mission',
    vehicles: ['Armored Cadillac limousine', 'motorcade support vehicles'],
    equipment: ['Diplomatic credentials', 'secure communications', 'classified document safe', 'embassy security detail equipment'],
    description: 'Accredited US Ambassador to key European allies. Maintains direct relationships with foreign ministers and heads of government. Official channel for all bilateral diplomatic engagement in the European theater.',
    unitComposition: 'Ambassador (1), Deputy Chief of Mission (1), political section (5), security detail (8)',
  },
  {
    type: 'AMBASSADOR_ME', name: 'US Ambassador (Middle East)', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'CIA_CAIRO', speed: 800,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: {},
    diplomaticEffectiveness: 4,
    designation: 'US Embassy — Middle Eastern Affairs',
    personnel: 15,
    readiness: 'FULL',
    platform: 'Embassy Mission',
    vehicles: ['Armored SUV convoy', 'counter-assault team vehicle'],
    equipment: ['Diplomatic credentials', 'hardened communications suite', 'threat assessment kit', 'embassy security detail equipment'],
    description: 'Accredited US Ambassador operating in the volatile Middle East theater. Experienced in high-stakes negotiations with regional powers. Maintains critical relationships with allied and neutral states.',
    unitComposition: 'Ambassador (1), Deputy Chief of Mission (1), political section (5), security detail (8)',
  },
  {
    type: 'AMBASSADOR_PAC', name: 'US Ambassador (Pacific)', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'CIA_TOKYO', speed: 800,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: {},
    diplomaticEffectiveness: 4,
    designation: 'US Embassy — East Asian & Pacific Affairs',
    personnel: 15,
    readiness: 'FULL',
    platform: 'Embassy Mission',
    vehicles: ['Armored diplomatic vehicles', 'escort detail'],
    equipment: ['Diplomatic credentials', 'secure communications', 'classified briefing materials', 'treaty documentation'],
    description: 'Accredited US Ambassador to Pacific theater nations. Key liaison for the alliance structure underpinning US Indo-Pacific strategy. Direct line to allied defense and foreign affairs ministries.',
    unitComposition: 'Ambassador (1), Deputy Chief of Mission (1), political section (5), security detail (8)',
  },
  {
    type: 'AMBASSADOR_AF', name: 'US Ambassador (Africa)', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'CIA_NAIROBI', speed: 800,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: {},
    diplomaticEffectiveness: 4,
    designation: 'US Embassy — African Affairs',
    personnel: 12,
    readiness: 'FULL',
    platform: 'Embassy Mission',
    vehicles: ['Armored SUV', 'security escort vehicles'],
    equipment: ['Diplomatic credentials', 'secure communications', 'classified briefing materials', 'regional development dossiers'],
    description: 'Accredited US Ambassador to African partner nations. Critical conduit for counter-terrorism cooperation, development diplomacy, and great power competition on the continent. Navigates complex multi-party dynamics in the Horn and Sahel.',
    unitComposition: 'Ambassador (1), Deputy Chief of Mission (1), political section (4), security detail (6)',
  },
  {
    type: 'AMBASSADOR_SA', name: 'US Ambassador (Latin America)', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'LANGLEY', speed: 800,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: {},
    diplomaticEffectiveness: 4,
    designation: 'US Embassy — Western Hemisphere Affairs',
    personnel: 12,
    readiness: 'FULL',
    platform: 'Embassy Mission',
    vehicles: ['Armored Suburban', 'diplomatic motorcade'],
    equipment: ['Diplomatic credentials', 'secure communications', 'classified briefing materials', 'counter-narcotics intelligence summaries'],
    description: 'Accredited US Ambassador to Latin American and Caribbean states. Key interlocutor for narcotics interdiction cooperation, democratic governance support, and hemispheric security. Maintains relationships with civilian and military leadership.',
    unitComposition: 'Ambassador (1), Deputy Chief of Mission (1), political section (4), security detail (6)',
  },
  {
    type: 'CIA_POLITICAL_OFC', name: 'CIA Political Action Officer', category: 'DIPLOMATIC', deniability: 'COVERT',
    homeBaseId: 'CIA_BERLIN', speed: 600,
    capabilities: ['DIPLOMATIC', 'INTEL', 'HUMINT'],
    collectionProfile: { HUMINT: 3 },
    diplomaticEffectiveness: 3,
    designation: 'Directorate of Operations — Political Action Group',
    personnel: 6,
    readiness: 'FULL',
    platform: 'Covert Diplomatic Operations',
    vehicles: ['Civilian cover vehicles', 'diplomatic pool access'],
    equipment: ['Non-official cover documentation', 'covert recording devices', 'encrypted communications', 'operational funds', 'counter-surveillance gear'],
    description: 'CIA officer specializing in political action and covert influence operations. Operates under diplomatic or non-official cover to build relationships with foreign officials, conduct back-channel negotiations, and shape political outcomes.',
    unitComposition: 'Political action officer (2), reports officer (1), cover support (1), security (2)',
  },
  {
    type: 'CIA_INFLUENCE_OFC', name: 'CIA Covert Influence Officer', category: 'DIPLOMATIC', deniability: 'COVERT',
    homeBaseId: 'LANGLEY', speed: 600,
    capabilities: ['DIPLOMATIC', 'INTEL', 'HUMINT'],
    collectionProfile: { HUMINT: 2 },
    diplomaticEffectiveness: 3,
    designation: 'Directorate of Operations — Covert Influence Division',
    personnel: 4,
    readiness: 'FULL',
    platform: 'Covert Influence Operations',
    vehicles: ['Civilian cover vehicles'],
    equipment: ['Non-official cover documentation', 'operational funds (large denomination)', 'media placement assets', 'front organization credentials', 'encrypted dead-drop communications'],
    description: 'CIA officer running covert influence campaigns — media placement, funding opposition movements, and cultivating political assets inside foreign governments. Deniable and expendable. The invisible hand of American foreign policy.',
    unitComposition: 'Influence officer (1), media specialist (1), finance officer (1), security (1)',
  },
  {
    type: 'DEFENSE_ATTACHE', name: 'Defense Attaché', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'CIA_LONDON', speed: 800,
    capabilities: ['DIPLOMATIC', 'INTEL'],
    collectionProfile: { HUMINT: 1 },
    diplomaticEffectiveness: 3,
    designation: 'Defense Intelligence Agency — Defense Attaché System',
    personnel: 8,
    readiness: 'FULL',
    platform: 'Military Diplomatic Mission',
    vehicles: ['Military staff car', 'diplomatic transport'],
    equipment: ['Military credentials', 'secure military communications', 'defense cooperation agreements', 'arms transfer documentation', 'classified military briefings'],
    description: 'Senior military officer serving as the official DoD representative at US embassies. Bridges the gap between diplomatic engagement and military cooperation. Can negotiate basing agreements, arms sales, and joint exercise frameworks.',
    unitComposition: 'Defense attaché (1), assistant attaché (2), military analyst (2), security detail (3)',
  },
  {
    type: 'TREASURY_SANCTIONS_OFC', name: 'Treasury Sanctions Officer', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'LANGLEY', speed: 0,
    capabilities: ['DIPLOMATIC', 'INTEL'],
    collectionProfile: {},
    diplomaticEffectiveness: 3,
    designation: 'Department of the Treasury — Office of Foreign Assets Control',
    personnel: 8,
    readiness: 'FULL',
    platform: 'Remote Financial Diplomatic Operations',
    vehicles: [],
    equipment: ['OFAC sanctions database access', 'SWIFT network monitoring', 'financial intelligence feeds', 'sanctions designation authority', 'multinational coordination platform'],
    description: 'OFAC officer wielding the financial instruments of American power — sanctions designations, asset freezes, and SWIFT disconnection. Remote operations through the global financial architecture. The economic equivalent of a carrier strike group.',
    unitComposition: 'Sanctions officer (2), financial analyst (3), legal counsel (1), compliance specialist (2)',
  },
  {
    type: 'UN_LIAISON', name: 'UN Liaison Office', category: 'DIPLOMATIC', deniability: 'OVERT',
    homeBaseId: 'LANGLEY', speed: 0,
    capabilities: ['DIPLOMATIC'],
    collectionProfile: {},
    diplomaticEffectiveness: 2,
    designation: 'US Mission to the United Nations — Liaison Element',
    personnel: 10,
    readiness: 'FULL',
    platform: 'Remote Diplomatic Operations',
    vehicles: [],
    equipment: ['Secure video teleconference suite', 'UN secure communications channel', 'multilateral coordination platform', 'diplomatic cable system'],
    description: 'Remote diplomatic coordination office operating through UN channels and multilateral frameworks. Can engage any country through formal international mechanisms without forward deployment. Lower influence but global reach.',
    unitComposition: 'Liaison director (1), regional desk officers (4), communications team (3), analysts (2)',
  },
];

// --- Force Structure ---
// Maps each base to the asset types and quantities stationed there.
// The game:start hook uses this to create multiple instances from templates.

var FORCE_STRUCTURE = {
  // ===== CONUS =====
  FORT_LIBERTY: [
    { type: 'DELTA_FORCE', count: 2 },
    { type: 'JSOC_TASK_FORCE', count: 3 },
    { type: '75TH_RANGERS', count: 3 },
  ],
  DAM_NECK: [
    { type: 'SEAL_TEAM_6', count: 2 },
  ],
  NORFOLK: [
    { type: 'CSG_2', count: 1 },
    { type: 'DDG_SQUADRON', count: 2 },
    { type: 'SSN_SQUADRON', count: 2 },
  ],
  LANGLEY: [
    { type: 'CIA_CASE_TEAM_1', count: 3 },
    { type: 'CIA_SAD_EU', count: 1 },
    { type: 'STATE_DEPT_ENVOY', count: 2 },
    { type: 'STATE_DEPT_NEGOTIATOR', count: 2 },
    { type: 'NSC_REPRESENTATIVE', count: 1 },
    { type: 'CIA_INFLUENCE_OFC', count: 2 },
    { type: 'AMBASSADOR_SA', count: 1 },
    { type: 'TREASURY_SANCTIONS_OFC', count: 2 },
    { type: 'UN_LIAISON', count: 2 },
  ],
  PEARL_HARBOR: [
    { type: 'CSG_3', count: 1 },
    { type: 'DDG_SQUADRON', count: 1 },
    { type: 'SSN_SQUADRON', count: 1 },
  ],
  CREECH: [
    { type: 'MQ9_FLIGHT_ME', count: 2 },
    { type: 'RQ4_FLIGHT', count: 2 },
    { type: 'B2_WING', count: 1 },
  ],
  FORT_MEADE: [
    { type: 'NSA_TAO', count: 3 },
    { type: 'DIA_SIGINT_TEAM', count: 3 },
  ],

  // ===== EUROPE =====
  RAMSTEIN: [
    { type: 'F35_SQN_EU', count: 2 },
    { type: 'MQ9_FLIGHT_ME', count: 1 },
  ],
  ROTA: [
    { type: 'DDG_SQUADRON', count: 2 },
    { type: 'SSN_SQUADRON', count: 1 },
  ],
  MENWITH_HILL: [
    { type: 'RC135_RIVET', count: 2 },
    { type: 'DIA_SIGINT_TEAM', count: 1 },
  ],
  CIA_LONDON: [
    { type: 'CIA_SAD_EU', count: 2 },
    { type: 'CIA_CASE_TEAM_1', count: 2 },
    { type: 'AMBASSADOR_EU', count: 1 },
    { type: 'CIA_POLITICAL_OFC', count: 1 },
    { type: 'DEFENSE_ATTACHE', count: 1 },
  ],
  CIA_BERLIN: [
    { type: 'CIA_CASE_TEAM_1', count: 2 },
    { type: 'CIA_POLITICAL_OFC', count: 2 },
  ],

  // ===== MIDDLE EAST =====
  AL_UDEID: [
    { type: 'MQ9_FLIGHT_ME', count: 3 },
    { type: 'F35_SQN_EU', count: 1 },
    { type: 'RQ4_FLIGHT', count: 1 },
    { type: 'AC130_FLIGHT', count: 1 },
  ],
  BAHRAIN: [
    { type: 'DDG_SQUADRON', count: 2 },
    { type: 'EP3_ARIES', count: 2 },
    { type: 'SSN_SQUADRON', count: 1 },
  ],
  INCIRLIK: [
    { type: 'F35_SQN_EU', count: 1 },
    { type: 'MQ9_FLIGHT_ME', count: 1 },
    { type: 'AC130_FLIGHT', count: 1 },
  ],
  CIA_CAIRO: [
    { type: 'CIA_SAD_ME', count: 2 },
    { type: 'CIA_CASE_TEAM_2', count: 2 },
    { type: 'AMBASSADOR_ME', count: 1 },
    { type: 'CIA_POLITICAL_OFC', count: 1 },
    { type: 'DEFENSE_ATTACHE', count: 1 },
  ],

  // ===== EAST ASIA =====
  KADENA: [
    { type: 'F35_SQN_PAC', count: 2 },
    { type: 'MQ9_FLIGHT_AF', count: 1 },
    { type: 'RQ4_FLIGHT', count: 1 },
  ],
  YOKOSUKA: [
    { type: 'CSG_7', count: 1 },
    { type: 'DDG_SQUADRON', count: 2 },
    { type: 'SSN_SQUADRON', count: 1 },
  ],
  CAMP_HUMPHREYS: [
    { type: '75TH_RANGERS', count: 1 },
    { type: 'JSOC_TASK_FORCE', count: 1 },
    { type: 'DELTA_FORCE', count: 1 },
  ],
  CIA_TOKYO: [
    { type: 'CIA_CASE_TEAM_3', count: 2 },
    { type: 'AMBASSADOR_PAC', count: 1 },
    { type: 'CIA_POLITICAL_OFC', count: 1 },
    { type: 'DEFENSE_ATTACHE', count: 1 },
  ],

  // ===== SOUTH ASIA =====
  CIA_ISLAMABAD: [
    { type: 'CIA_CASE_TEAM_2', count: 2 },
    { type: 'CIA_SAD_ME', count: 1 },
    { type: 'CIA_POLITICAL_OFC', count: 1 },
    { type: 'CIA_INFLUENCE_OFC', count: 1 },
  ],
  DIEGO_GARCIA: [
    { type: 'SSN_SQUADRON', count: 1 },
    { type: 'B2_WING', count: 1 },
    { type: 'MQ9_FLIGHT_AF', count: 1 },
  ],

  // ===== AFRICA =====
  CAMP_LEMONNIER: [
    { type: 'MQ9_FLIGHT_AF', count: 2 },
    { type: 'JSOC_TASK_FORCE', count: 1 },
    { type: '75TH_RANGERS', count: 1 },
    { type: 'AC130_FLIGHT', count: 1 },
  ],
  CIA_NAIROBI: [
    { type: 'CIA_CASE_TEAM_2', count: 1 },
    { type: 'CIA_SAD_ME', count: 1 },
    { type: 'AMBASSADOR_AF', count: 1 },
    { type: 'CIA_POLITICAL_OFC', count: 1 },
  ],

  // ===== LATIN AMERICA =====
  GUANTANAMO: [
    { type: 'DDG_SQUADRON', count: 1 },
    { type: 'SSN_SQUADRON', count: 1 },
  ],
  SOTO_CANO: [
    { type: 'AC130_FLIGHT', count: 2 },
    { type: 'MQ9_FLIGHT_AF', count: 1 },
    { type: '75TH_RANGERS', count: 1 },
  ],

  // ===== SIGINT =====
  PINE_GAP: [
    { type: 'DIA_SIGINT_TEAM', count: 2 },
    { type: 'RC135_RIVET', count: 1 },
  ],
};

// --- Helper: find template by type ---

function getAssetTemplate(type) {
  for (var i = 0; i < ASSET_TEMPLATES.length; i++) {
    if (ASSET_TEMPLATES[i].type === type) return ASSET_TEMPLATES[i];
  }
  return null;
}

// --- Asset Deniability Display ---

var DENIABILITY_DISPLAY = {
  COVERT: { label: 'COVERT', color: 'var(--amber)' },
  OVERT:  { label: 'OVERT',  color: 'var(--text-dim)' },
};

// --- Asset Category Display ---

var ASSET_CATEGORIES = {
  SOF:   { label: 'Special Operations', color: '#e04040', shortLabel: 'SOF' },
  NAVY:  { label: 'Naval Forces',       color: '#4a8fd4', shortLabel: 'NAVY' },
  AIR:   { label: 'Air Power',          color: '#5a9fe4', shortLabel: 'AIR' },
  ISR:   { label: 'ISR Platform',       color: '#9060cc', shortLabel: 'ISR' },
  INTEL: { label: 'Intelligence',       color: '#e0a030', shortLabel: 'INTEL' },
  DIPLOMATIC: { label: 'Diplomatic Corps', color: '#4ac4d4', shortLabel: 'DIPLO' },
};

// --- Initialize Assets at Game Start ---

(function() {

  hook('game:start', function() {
    if (V.initialized) return;

    V.assets = [];

    var baseIds = Object.keys(FORCE_STRUCTURE);
    for (var b = 0; b < baseIds.length; b++) {
      var baseId = baseIds[b];
      var base = getBase(baseId);
      if (!base) continue;

      var entries = FORCE_STRUCTURE[baseId];
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
            // Rich metadata from template
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
            // Intel collection state
            assignedThreatId: null,
            rerouteCount: 0,
            maxReroutes: (tpl.readiness === 'TIER_1') ? 5 : 2,
            // Mobile base flag for CSGs
            isMobileBase: tpl.type.indexOf('CSG') === 0,
            // Naval area of effectiveness (km from station point to target)
            effectiveRangeKm: tpl.effectiveRangeKm || 0,
          });
        }
      }
    }
  }, 2); // Priority 2: after state init, before ops spawn

  // --- Transit Tick ---

  hook('tick', function(data) {
    if (!V.assets) return;
    var now = V.time.totalMinutes;

    for (var i = 0; i < V.assets.length; i++) {
      var asset = V.assets[i];

      // COLLECTING assets stay at destination — no transit update needed
      if (asset.status === 'IN_TRANSIT' || asset.status === 'RETURNING') {
        if (asset.transitDurationMinutes <= 0) {
          arriveAsset(asset);
          continue;
        }

        var elapsed = now - asset.transitStartTotalMinutes;
        var fraction = elapsed / asset.transitDurationMinutes;

        if (fraction >= 1) {
          arriveAsset(asset);
        } else {
          // Interpolate position — use maritime path if available
          var pos;
          if (asset._transitPath) {
            pos = interpolateAlongPath(asset._transitPath, fraction);
          } else {
            pos = interpolateGreatCircle(
              asset.originLat, asset.originLon,
              asset.destinationLat, asset.destinationLon,
              fraction
            );
          }
          asset.currentLat = pos.lat;
          asset.currentLon = pos.lon;
        }
      }
    }
  }, 5); // Run early in tick cycle

})();

// --- Asset Helpers ---

function getAsset(id) {
  if (!V.assets) return null;
  for (var i = 0; i < V.assets.length; i++) {
    if (V.assets[i].id === id) return V.assets[i];
  }
  return null;
}

function getAssetsByIds(ids) {
  var result = [];
  for (var i = 0; i < ids.length; i++) {
    var a = getAsset(ids[i]);
    if (a) result.push(a);
  }
  return result;
}

function getAvailableAssets() {
  if (!V.assets) return [];
  return V.assets.filter(function(a) { return a.status === 'STATIONED'; });
}

function getAvailableAssetsWithCapability(capability) {
  return getAvailableAssets().filter(function(a) {
    return a.capabilities.indexOf(capability) >= 0;
  });
}

function getAssetsAtBase(baseId) {
  if (!V.assets) return [];
  return V.assets.filter(function(a) {
    return a.currentBaseId === baseId && a.status === 'STATIONED';
  });
}

// --- Transit Calculations ---

function calcTransitMinutes(asset, destLat, destLon) {
  if (asset.speed <= 0) return 0; // Cyber/remote — instant

  // NAVY assets use maritime waypoint pathing — path to station point, not land target
  if (asset.category === 'NAVY') {
    var stationLat = destLat;
    var stationLon = destLon;
    if (asset._stationPoint) {
      stationLat = asset._stationPoint.lat;
      stationLon = asset._stationPoint.lon;
    }
    var path = findMaritimePath(asset.currentLat, asset.currentLon, stationLat, stationLon);
    asset._transitPath = path;
    var dist = calcPathDistance(path);
    return Math.max(30, Math.round((dist / asset.speed) * 60));
  }

  // Air/ground assets — straight-line with warzone penalty
  var dist = haversineKm(asset.currentLat, asset.currentLon, destLat, destLon);
  var transitMin = Math.max(30, Math.round((dist / asset.speed) * 60));

  // Warzone airspace penalty for non-NAVY assets
  if (typeof getAtWarCountriesOnRoute === 'function') {
    var atWar = getAtWarCountriesOnRoute(asset.currentLat, asset.currentLon, destLat, destLon);
    if (atWar.length > 0) {
      transitMin = Math.round(transitMin * (1 + 0.10 + Math.random() * 0.05));
    }
  }

  return transitMin;
}

function calcGroupTransitMinutes(assetIds, destLat, destLon) {
  var maxMinutes = 0;
  for (var i = 0; i < assetIds.length; i++) {
    var a = getAsset(assetIds[i]);
    if (!a) continue;
    var m = calcTransitMinutes(a, destLat, destLon);
    if (m > maxMinutes) maxMinutes = m;
  }
  return maxMinutes;
}

function formatTransitTime(minutes) {
  if (minutes <= 0) return 'INSTANT';
  var h = Math.floor(minutes / 60);
  var m = minutes % 60;
  if (h === 0) return m + 'min';
  if (m === 0) return h + 'h';
  return h + 'h ' + m + 'min';
}

// --- Deploy & Return ---

function deployAssets(assetIds, destLat, destLon, opId) {
  var now = V.time.totalMinutes;
  for (var i = 0; i < assetIds.length; i++) {
    var asset = getAsset(assetIds[i]);
    if (!asset || asset.status !== 'STATIONED') continue;

    var transitMin = calcTransitMinutes(asset, destLat, destLon);

    // NAVY assets go to their station point, not the land target
    var actualDestLat = destLat;
    var actualDestLon = destLon;
    if (asset.category === 'NAVY' && asset._stationPoint) {
      actualDestLat = asset._stationPoint.lat;
      actualDestLon = asset._stationPoint.lon;
    }

    asset.status = 'IN_TRANSIT';
    asset.assignedOpId = opId;
    asset.currentBaseId = null;
    asset.originLat = asset.currentLat;
    asset.originLon = asset.currentLon;
    asset.destinationLat = actualDestLat;
    asset.destinationLon = actualDestLon;
    asset.transitStartTotalMinutes = now;
    asset.transitDurationMinutes = transitMin;
  }
}

function returnAssetsToBase(assetIds) {
  var now = V.time.totalMinutes;
  for (var i = 0; i < assetIds.length; i++) {
    var asset = getAsset(assetIds[i]);
    if (!asset) continue;

    asset._stationPoint = null; // Clear op station point before return path calc

    var homeBase = getBase(asset.homeBaseId);
    if (!homeBase) continue;

    var transitMin = calcTransitMinutes(asset, homeBase.lat, homeBase.lon);

    asset.status = 'RETURNING';
    asset.assignedOpId = null;
    asset.originLat = asset.currentLat;
    asset.originLon = asset.currentLon;
    asset.destinationLat = homeBase.lat;
    asset.destinationLon = homeBase.lon;
    asset.transitStartTotalMinutes = now;
    asset.transitDurationMinutes = transitMin;
  }
}

function repositionCSG(assetId, destLat, destLon) {
  var asset = getAsset(assetId);
  if (!asset || !asset.isMobileBase) return;
  if (asset.status !== 'STATIONED') return;

  var transitMin = calcTransitMinutes(asset, destLat, destLon);
  var now = V.time.totalMinutes;

  asset.status = 'IN_TRANSIT';
  asset.assignedOpId = null;
  asset.currentBaseId = null;
  asset.originLat = asset.currentLat;
  asset.originLon = asset.currentLon;
  asset.destinationLat = destLat;
  asset.destinationLon = destLon;
  asset.transitStartTotalMinutes = now;
  asset.transitDurationMinutes = transitMin;
}

function arriveAsset(asset) {
  asset._transitPath = null;
  asset._stationPoint = null;

  if (asset.status === 'IN_TRANSIT') {
    // Mobile base repositioning (CSG without an assigned op)
    if (asset.isMobileBase && !asset.assignedOpId && !asset.assignedThreatId) {
      asset.status = 'STATIONED';
      asset.currentLat = asset.destinationLat;
      asset.currentLon = asset.destinationLon;
      asset.currentBaseId = null;
      asset.originLat = null;
      asset.originLon = null;
      asset.destinationLat = null;
      asset.destinationLon = null;
      fire('asset:arrived', { asset: asset });
      return;
    }
    // Check if this is a collection deployment (assigned to threat, not op)
    if (asset.assignedThreatId && !asset.assignedOpId) {
      asset.status = 'COLLECTING';
    } else {
      asset.status = 'DEPLOYED';
    }
    asset.currentLat = asset.destinationLat;
    asset.currentLon = asset.destinationLon;
    fire('asset:arrived', { asset: asset, opId: asset.assignedOpId, threatId: asset.assignedThreatId });
  } else if (asset.status === 'RETURNING') {
    asset.status = 'STATIONED';
    asset.currentBaseId = asset.homeBaseId;
    var home = getBase(asset.homeBaseId);
    if (home) {
      asset.currentLat = home.lat;
      asset.currentLon = home.lon;
    }
    asset.assignedOpId = null;
    asset.assignedThreatId = null;
    asset.rerouteCount = 0;
    asset.originLat = null;
    asset.originLon = null;
    asset.destinationLat = null;
    asset.destinationLon = null;
    asset.transitStartTotalMinutes = 0;
    asset.transitDurationMinutes = 0;
  }
}

// --- Deploy Asset for Intel Collection on a Threat ---

function deployAssetForCollection(assetId, threatId) {
  var asset = getAsset(assetId);
  var threat = getThreat(threatId);
  if (!asset || !threat) return false;
  if (asset.status !== 'STATIONED' && asset.status !== 'RETURNING') return false;

  // Calculate effectiveness — warn if useless
  var effectiveness = getAssetCollectionEffectiveness(asset, threat);

  var destLat = threat.location.lat;
  var destLon = threat.location.lon;
  var transitMin = calcTransitMinutes(asset, destLat, destLon);

  // Handle rerouting RTB assets
  if (asset.status === 'RETURNING') {
    if (asset.rerouteCount >= asset.maxReroutes) return false;
    asset.rerouteCount++;
  }

  asset.status = 'IN_TRANSIT';
  asset.assignedThreatId = threatId;
  asset.assignedOpId = null;
  asset.currentBaseId = null;
  asset.originLat = asset.currentLat;
  asset.originLon = asset.currentLon;
  asset.destinationLat = destLat;
  asset.destinationLon = destLon;
  asset.transitStartTotalMinutes = V.time.totalMinutes;
  asset.transitDurationMinutes = transitMin;

  // Register on threat
  if (!threat.collectorAssetIds) threat.collectorAssetIds = [];
  if (threat.collectorAssetIds.indexOf(assetId) < 0) {
    threat.collectorAssetIds.push(assetId);
  }

  addLog(asset.name + ' deploying for collection on ' + threat.orgName + '. Transit: ' + formatTransitTime(transitMin) + '.', 'log-intel');

  fire('asset:deployed:collection', { asset: asset, threat: threat, effectiveness: effectiveness });
  return true;
}

// --- Recall Collection Asset ---

function recallCollectionAsset(assetId) {
  console.log('[RECALL] called with assetId:', assetId);
  var asset = getAsset(assetId);
  if (!asset) { console.log('[RECALL] asset not found'); return; }
  console.log('[RECALL] asset status:', asset.status, 'assignedThreatId:', asset.assignedThreatId, 'assignedOpId:', asset.assignedOpId);
  if (asset.status === 'STATIONED' || asset.status === 'RETURNING') { console.log('[RECALL] rejected — status is', asset.status); return; }

  // Remove from threat's collector list
  var threatId = asset.assignedThreatId;
  if (threatId) {
    var threat = getThreat(threatId);
    if (threat && threat.collectorAssetIds) {
      var idx = threat.collectorAssetIds.indexOf(assetId);
      if (idx >= 0) threat.collectorAssetIds.splice(idx, 1);
    }
  }

  // Return to base
  var homeBase = getBase(asset.homeBaseId);
  if (!homeBase) return;

  var transitMin = calcTransitMinutes(asset, homeBase.lat, homeBase.lon);

  asset.status = 'RETURNING';
  asset.assignedThreatId = null;
  asset.assignedOpId = null;
  asset.currentBaseId = null;
  asset.originLat = asset.currentLat;
  asset.originLon = asset.currentLon;
  asset.destinationLat = homeBase.lat;
  asset.destinationLon = homeBase.lon;
  asset.transitStartTotalMinutes = V.time.totalMinutes;
  asset.transitDurationMinutes = transitMin;

  console.log('[RECALL] success — asset now RETURNING, transit:', transitMin, 'min');
  addLog(asset.name + ' recalled from collection. RTB: ' + formatTransitTime(transitMin) + '.', 'log-info');
  fire('asset:recalled', { asset: asset, threatId: threatId });
}

// --- Reroute RTB Asset to New Target ---

function rerouteAsset(assetId, newThreatId) {
  var asset = getAsset(assetId);
  if (!asset || asset.status !== 'RETURNING') return false;
  if (asset.rerouteCount >= asset.maxReroutes) return false;

  return deployAssetForCollection(assetId, newThreatId);
}

// --- Asset Collection Effectiveness for a Threat ---
// Returns { total, fields[] } showing how effective this asset is at each field.

function getAssetCollectionEffectiveness(asset, threat) {
  var profile = asset.collectionProfile || {};
  var fields = [];
  var total = 0;
  var effective = 0;

  for (var i = 0; i < threat.intelFields.length; i++) {
    var f = threat.intelFields[i];
    if (f.revealed) continue;
    total++;
    var mult = profile[f.source] || 0;
    fields.push({ key: f.key, label: f.label, source: f.source, multiplier: mult });
    if (mult > 0) effective++;
  }

  return {
    totalUnrevealed: total,
    effectiveFields: effective,
    ineffectiveFields: total - effective,
    fields: fields,
    rating: total > 0 ? Math.round((effective / total) * 100) : 0,
  };
}

// --- Get assets available for collection ---

function getCollectionAssets() {
  if (!V.assets) return [];
  return V.assets.filter(function(a) {
    return (a.status === 'STATIONED' || a.status === 'RETURNING') &&
           a.collectionProfile && Object.keys(a.collectionProfile).length > 0;
  });
}
