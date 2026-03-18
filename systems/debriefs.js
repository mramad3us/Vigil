/* ============================================================
   VIGIL — systems/debriefs.js
   Faux13-style after-action reports. Every line parametrized
   with real op/asset data. 19 generator types, success/failure
   branches, helmet-cam-level climax detail for SOF operations.
   ============================================================ */

// --- Vocabulary Pools ---

var DEBRIEF_CALLSIGNS = [
  "VANGUARD",
  "SENTINEL",
  "OVERLORD",
  "GUARDIAN",
  "WARDEN",
  "PALADIN",
  "SPECTER",
  "PHANTOM",
  "NOMAD",
  "ROGUE",
  "BISHOP",
  "KNIGHT",
  "CASTLE",
  "PROPHET",
  "ORACLE",
  "REAPER",
  "HUNTER",
  "PROWLER",
  "TALON",
  "RAZOR",
  "SABER",
  "RAPTOR",
  "CONDOR",
  "VULTURE",
  "WRAITH",
  "SHADE",
  "EMBER",
  "FROST",
  "APEX",
  "ZENITH",
];

var DEBRIEF_WEATHER = [
  "Clear skies, visibility unlimited",
  "Partial cloud cover at 8,000ft, visibility 10km",
  "Overcast, ceiling at 3,000ft, light rain",
  "Heavy cloud cover, intermittent precipitation",
  "Sandstorm conditions, visibility reduced to 500m",
  "Dense fog, visibility under 200m",
  "Clear with high winds, 35kt gusting to 50kt",
  "Scattered thunderstorms in AO",
  "Night operations — no illumination, new moon",
  "Tropical humidity, temperatures exceeding 45°C",
];

var DEBRIEF_BREACH = [
  "Explosive breach on primary entry point",
  "Simultaneous entry through two access points",
  "Covert infiltration via an unguarded perimeter section",
  "Rooftop insertion via fast-rope",
  "Subsurface approach through drainage infrastructure",
  "Vehicle-borne approach under cover of civilian traffic",
  "Maritime insertion from rigid-hull inflatable boats",
  "HALO insertion from 25,000ft AGL",
  "Diversionary action drew guards; primary team entered undetected",
  "Electronic lock bypass followed by silent entry",
];

var DEBRIEF_EVIDENCE = [
  "Communications equipment and encrypted storage devices",
  "Financial records linking the organization to state funding",
  "Weapons cache including military-grade ordnance",
  "Biometric data and identity documents of cell members",
  "Planning documents detailing future operations",
  "Chemical precursors consistent with IED manufacturing",
  "Satellite phones with recoverable call history",
  "Laptop computers containing operational correspondence",
  "Maps and surveillance photography of potential targets",
  "Cash reserves totaling approximately $2.3M USD",
];

var DEBRIEF_COMPROMISE = [
  "counter-surveillance detected the approach",
  "an encrypted communication was intercepted by the target",
  "a local informant alerted the target organization",
  "unexpected civilian presence in the operational area",
  "target relocated to an alternate site 6 hours prior",
  "electronic countermeasures disrupted team communications",
  "hostile QRF responded faster than intelligence predicted",
  "weather conditions degraded ISR coverage at a critical moment",
];

var DEBRIEF_EXFIL = [
  "Exfiltration via tiltrotor to a forward staging area",
  "Ground exfil to a pre-positioned extraction vehicle",
  "Maritime extraction by submarine",
  "Helicopter extraction under covering fire",
  "Overland movement to a safe house, extraction at dawn",
  "Commercial cover — team departed via civilian aviation",
  "Exfil to a nearby allied military installation",
  "Emergency extraction via V-22 Osprey under hostile fire",
  "Dispersed exfil — team members departed individually over 48 hours",
];

// --- SOF Detail Pools (helmet-cam-level) ---

var SOF_APPROACH = [
  "Team moved single-file along the compound's eastern wall. Point man held fist up — team froze. Guard patrol passed within 15 meters.",
  "Split into two-man pairs. Alpha pair covered the courtyard from the roofline. Bravo pair stacked on the door.",
  "Crawled through 80m of irrigation ditch to reach the compound's blind spot. NVGs showed two sentries on the north gate.",
  "Inserted via MH-6 Little Birds, touching down 400m from the objective. Moved on foot through a dry wadi bed.",
  "Low-crawled across an open field for 200m. Thermal showed the compound's generator running — masked the approach noise.",
  "Approached via an adjacent building's rooftop. Bridged a 3m gap between structures using a portable ladder.",
];

var SOF_BREACH_DETAIL = [
  'Breacher placed a strip charge on the hinges. "Set." "Execute." The door blew inward. Team flowed through the smoke.',
  "Flashbang through the window — BANG. Two-second count. First man through the doorframe, weapon up, sweeping left.",
  "Shotgun breach on the lock. First man kicked the remnants clear. Rifle up, IR laser cutting through the dust.",
  "Simultaneous breach — front and rear. Both charges detonated within 50ms of each other. Total surprise achieved.",
  "Silent breach — hydraulic ram on the door frame. Hinges popped without a sound. Team entered on NODs.",
  "Charge on the wall itself — created a new entry point where none existed. Team poured through the ragged opening.",
  "Mechanical breach — halligan bar jammed into the doorframe. Two sharp blows. Door split off the hinges. Flashbang in, team in.",
  "Thermite charge on the reinforced door. Metal glowed orange, sagged. Team kicked through the weakened frame. Smoke boiling.",
  "Window entry — operators fast-roped onto the balcony, smashed through floor-to-ceiling glass. Inside in under two seconds.",
];

var SOF_ROOM_CLEAR = [
  "First room: two hostiles, both armed. Team leader double-tapped the near man. Number two engaged the far target. Both down in under a second.",
  'Hallway — three doors. Point man pieing the first corner. Muzzle flash from inside. Return fire — two rounds center mass. "Clear left."',
  "Kitchen area. One hostile reached for an AK behind the counter. Operator closed the distance, controlled the weapon, transitioned to sidearm. Threat neutralized.",
  "Stairwell. Fragmentation grenade from above. Team pulled back. Waited. Grenade detonated on empty landing. Team surged up the stairs, clearing by sectors.",
  "Second floor. Three rooms. First — empty. Second — non-combatant, flex-cuffed and moved to collection point. Third — hostile with suicide vest. Precision headshot from 4m.",
  "Long corridor with no cover. Operator laid suppressive fire while number two flanked through an adjacent room. Caught the hostile in crossfire.",
  "Bedroom — door slightly ajar. Point man pushed it with his boot. Hostile behind the bed, PKM braced on the mattress. Burst of fire shredded the door frame. Team pulled back, tossed a frag. Detonation. Silence. Entered. Hostile KIA, weapon destroyed.",
  "Storage room. Empty on visual sweep. Operator heard breathing behind stacked crates. IR laser found the man crouched with an AK pointed at the door. Two suppressed rounds from the HK416 before he could pull the trigger.",
  "Bathroom. Hostile tried to barricade the door. Operator shouldered it open — the man stumbled backward into the tub. Sidearm drawn, two rounds. Threat down. Checked his hands — no dead man's switch. Clear.",
  'Open courtyard. Three hostiles caught in the open, scrambling for weapons stacked against the far wall. Sniper from overwatch dropped the first. Assault team engaged the other two from the doorway — four rounds, both down. "Courtyard clear."',
  "Back room. Helmet cam caught the muzzle flash before the sound registered — rounds snapping past the point man's head. He dropped to a knee, returned fire. His IR laser found the hostile's chest. Three rounds. Hostile slid down the wall.",
  "Main hallway. Two hostiles appeared from a side door, AKs up. Point man dropped the first with a controlled pair to the head. Number two engaged the second — three rounds center mass, hostile stumbled back through the doorway. Team advanced past the bodies, weapons still smoking.",
  'Second floor landing. Hostile leaned over the railing with an RPG. Sniper saw it first — "RPG, second floor!" — single round through the man\'s shoulder. RPG clattered to the ground unfired. Follow-up shot from the assault team as they crested the stairs.',
  "Side room. Door was booby-trapped — tripwire visible on NODs. Breacher cut the wire, team entered through the window instead. One hostile inside, back turned, talking on a radio. Operator grabbed his collar, pulled him to the ground. Flex-cuffed. Radio seized.",
  "Narrow stairway to the roof. Blood trail on the steps — wounded hostile had crawled up. Found him on the landing, pistol in hand, trying to aim through the pain. Operator kicked the weapon away. Medic applied a tourniquet. Detained.",
  'Ground floor corridor. Team stacked on a T-intersection. Point man used a mirror — two hostiles with RPKs covering the hallway. Frag grenade around the corner. Explosion. Team flowed in. Both hostiles down, one still moving. Controlled pair. "Intersection clear."',
];

// --- Extended Combat Sequences (multi-step engagement narratives) ---

var SOF_GROUND_FLOOR_CLEAR = [
  'Ground floor: team split into two elements. Alpha took the east wing — first room empty, overturned furniture, radio still warm. Bravo pushed west, stacking on a closed metal door. Banging from inside. Breacher set a charge. "Breaching." Door blew. Two hostiles behind a flipped table — one firing blind over the top. Alpha-1 put two rounds through the table surface. Second hostile threw his weapon and put his hands up.',
  "Ground floor was a maze of narrow corridors. Point man moved in a combat glide, muzzle tracking every doorway. First contact — hostile stepped into the hall carrying an ammunition can. Didn't even see the team. Two suppressed rounds. He went down without a sound. Team stepped over the body and pushed forward.",
  "Ground floor. Kitchen was the first room off the hallway. Point man sliced the pie on the doorframe — hostile sitting at a table, disassembling a phone. He looked up. Saw the IR laser on his chest. Raised his hands. Flex-cuffed in three seconds. Team pushed to the next room.",
  "Main entrance hall. Overhead light swinging from the breach detonation. Glass crunching underfoot. Two hostiles ran from a back room, one carrying documents. Lead operator shouted the challenge word. No response. Both men raised weapons. Four rounds from two shooters. Both hostile down. Documents scattered across the floor — SSE team would collect later.",
];

var SOF_UPPER_FLOOR_CLEAR = [
  "Second floor. The stairwell was the funnel — worst part of any assault. Point man held a ballistic shield. Rounds pinging off the steel as he climbed. Number two fired past his shoulder, suppressed. Hostile at the top of the stairs took two rounds and fell backward. Team surged over the body and split left and right.",
  "Upper floor. First door — locked from inside. Flashbang through the gap above the door frame. BANG. Kick. Two hostiles, ears bleeding, stumbling. Near man got two rounds before he could orient. Far man tripped over a chair trying to reach his rifle. Operator closed the distance and put him on the ground. Flex-cuffed.",
  "Top floor. Helmet cam showed the hallway stretching out in green-tinted NOD vision. IR lasers criss-crossing the walls. Sound of someone racking a bolt. Team froze. Point man located the sound — last door on the left. Grenade. Wait. BOOM. Entry. One hostile KIA, slumped against the wall with an SVD sniper rifle across his lap.",
  "Second floor corridor. A burst of automatic fire raked the doorway as the team entered. Plaster and splinters everywhere. Point man pulled back — round had creased his plate carrier. Number two went low, leaned around the corner, and fired three rounds under a table where the hostile was crouched. Hits confirmed. Team moved up.",
  "Third floor. Two rooms remaining. First: blood on the floor, drag marks leading to the window. Hostile had jumped — overwatch reported a body in the alley below. Second room: reinforced door. Strip charge. Breach. Inside: communications equipment, maps, a cot. Recently occupied. Cigarette still burning in an ashtray. But the room was empty.",
];

var SOF_FINAL_CONTACT = [
  'Last room. Door was heavier than the others — steel-reinforced. Breacher used a double charge. The blast rattled the whole building. First man in. Movement behind an overturned desk. IR laser found a hand reaching for a pistol. "DON\'T. HANDS." The hand froze. Target pulled from behind the desk. Positive ID confirmed under white light.',
  "Master bedroom at the end of the hall. Two hostiles guarding the door — one with an AK, one with a chest rig full of magazines. Team engaged simultaneously. Point man dropped the AK-holder with a headshot. Number two put three rounds into the chest rig. Both down. Door breached. Inside: the target, alone, sitting on the bed. No weapon. No resistance.",
  "Final room. A hostile burst through the door before the team reached it — spraying AK fire wildly down the corridor. Rounds stitched across the ceiling. Point man dropped to prone and fired upward — two rounds caught the hostile in the pelvis. He crumpled. Team advanced. Through the door. Target was in the corner, hands visible, shaking.",
  "End of the corridor. The target's bodyguard made a stand in the doorway — emptied an entire magazine down the hall. Team pressed against the walls. Return fire. Bodyguard took four rounds and went down hard. Team entered over the body. Target was in the bathroom. Mirror showed his reflection — he was trying to flush a phone. Operator grabbed his arm. Target secured.",
];

var SOF_SNIPER_ENGAGEMENT = [
  '"Overwatch, I have a squirter — one pax east side, moving to a vehicle." "Roger, tracking." Pause. "He\'s got a weapon. Engaging." Single crack of the .300 Win Mag. "Target down. No movement."',
  'Sniper team reported movement on the compound roof. One hostile setting up an RPG aimed at the assault element\'s approach route. "Taking the shot." Suppressed .308 — impact confirmed. RPG tumbled off the roof unfired.',
  '"All stations, be advised — I have three pax exiting the south gate on foot, moving fast. Appear to be unarmed but one is carrying a bag." "Can you interdict?" "Negative, they\'re in civilian traffic." "Track only, do not engage." Ground team dispatched to intercept.',
  '"Overwatch to assault lead. You have two hostiles one room ahead of your position, both armed, facing the door. Recommend breach from the adjacent window." "Copy, rerouting." The sniper\'s thermal view guided the team around a fatal funnel they never saw.',
];

var SOF_COMMS = [
  '"All stations, JACKPOT. I say again, JACKPOT." The HVT was confirmed.',
  '"Contact front. Two times hostile. Engaging." Suppressed rifle fire echoed through the compound.',
  '"Moving to breach point Bravo. Alpha team set." The assault was synchronized to the second.',
  '"Precious cargo secured. Moving to extract." The primary objective was in hand.',
  '"This is ' +
    pick(DEBRIEF_CALLSIGNS) +
    ' Actual. Objective FALCON is secure. Requesting extract."',
  '"Overwatch, we have squirters — two pax moving east. Can you interdict?" "Roger, tracking."',
];

var SOF_SSE = [
  "SSE team moved in immediately. Hard drives pulled. Cell phones bagged. Documents photographed in situ before collection.",
  "Found a hidden room behind a false wall. Inside: communications equipment, maps of potential targets, and $400K USD in shrink-wrapped bills.",
  "Biometric enrollment on all KIA and detained personnel. Fingerprints, iris scans, DNA swabs. Cross-referenced with the database in real-time.",
  "Recovered a laptop still powered on — encryption keys still in memory. NSA exploitation team will have full disk access.",
];

var SOF_FAILURE_DETAIL = [
  "Heavy automatic fire from multiple positions. Team was pinned in the courtyard with no cover.",
  "IED detonated in the entryway as point man crossed the threshold. Immediate casualty. Team medic rushed forward under fire.",
  "Hostile reinforcements arrived from an adjacent building — estimated squad-sized element. Team was outnumbered 3-to-1.",
  "RPG impacted the wall above the team's position. Debris injuries to two operators. Team leader called immediate withdrawal.",
  "Target escaped through a pre-prepared tunnel system. By the time the team located the exit, the target had a 20-minute head start.",
  "First room was rigged. Tripwire on the doorframe — breacher caught it at the last second but the blast blew out the interior wall. Two operators down with concussion injuries. Building structurally compromised.",
  "Heavy PKM fire from a prepared fighting position at the top of the stairs. Rounds punching through the plaster walls. Team couldn't advance. Called for gun support but the helicopter couldn't get a firing solution without risking the hostage.",
  "Hostile threw a thermite grenade into the server room before the team could reach it. Critical intelligence — hard drives, phones, documents — destroyed in seconds. The room was an inferno by the time operators got there.",
  "Ambush. The compound was a trap. Team entered through the breach point and immediately took fire from three directions. Prepared positions with interlocking fields of fire. The whole thing was a setup.",
];

var DOMESTIC_LOCATIONS = [
  "a residential neighborhood",
  "a commercial district",
  "an industrial park",
  "a downtown high-rise",
  "a suburban apartment complex",
  "a rural compound",
  "a warehouse district",
  "a shipping terminal",
  "a motel off the interstate",
];

var LE_ENTRY = [
  'Agents established a perimeter. Entry team stacked on the front door. "FBI, search warrant!" No response.',
  "SWAT breached simultaneously at front and rear. Flashbangs deployed. Occupants ordered to the ground.",
  "Plain-clothes agents approached from multiple directions. Target was taken into custody without resistance on the street.",
  "Agents served the warrant at 0600. Target answered the door in civilian clothes. Placed in handcuffs and read Miranda rights.",
  "Vehicle stop on the interstate. Agents boxed the target's vehicle. Felony stop procedures. Driver extracted at gunpoint.",
];

// --- Threat-Context Narrative Pools ---
// When an op type (e.g. SOF_RAID) is used against a different threat type
// (e.g. HOSTAGE_CRISIS), these pools provide context-appropriate narrative elements.

var THREAT_CONTEXT = {
  HOSTAGE_CRISIS: {
    targetDesc: "hostage site",
    objective: "hostage rescue",
    preMission: [
      "hostages confirmed held by {org} in a fortified position. Rules of engagement: hostage safety is the absolute priority. Non-lethal options prepared for close-quarters near hostage positions.",
      "hostage situation developing. {org} holding multiple civilians. ISR confirms hostage location. Assault plan built around simultaneous entry to prevent hostage execution.",
    ],
    jackpotSuccess: [
      '"PRECIOUS CARGO SECURE. All hostages alive." Hostages found in {loc} — frightened, some with minor injuries, but alive. Operators shielded them during the final clearing. Flex-cuffed captors separated from hostages immediately.',
      '"PRECIOUS CARGO SECURE." {count} hostages recovered from {loc}. Captors had rigged a dead man\'s switch — sniper neutralized the triggerman through a window at the moment of breach. All hostages breathing.',
    ],
    jackpotFailure: [
      "Hostage holding area breached too late. Captors detonated a prepared charge when they heard the assault team in the corridor. {count} hostages killed in the blast. Remaining hostages pulled from the rubble — alive but traumatized.",
      "By the time the assault team reached the hostage room, the captors had already executed {count} hostages. Remaining hostages rescued but the primary objective — zero hostage casualties — was not achieved.",
    ],
    sseSuccess:
      "Hostages evacuated to medical triage point. All checked for injuries — minor abrasions and severe psychological trauma but no life-threatening conditions. Captor bodies and equipment documented for intelligence exploitation.",
    sseFailure:
      "Surviving hostages evacuated under emergency medical protocol. Mass casualty response initiated. Scene preservation for after-action review.",
    assessmentSuccess:
      "Hostage rescue operation {codename} in {city} achieved primary objective — all hostages recovered alive. {org}'s capability to hold hostages in {country} has been eliminated. The operation demonstrated the value of precise intelligence and synchronized assault.",
    assessmentFailure:
      "Hostage rescue operation {codename} in {city} resulted in hostage casualties. {org}'s captors executed their contingency before the assault team could secure the holding area. Intelligence on the defensive preparations was insufficient. Vigil is reviewing the gap.",
  },
  CRIMINAL_ORG: {
    targetDesc: "compound",
    objective: "interdiction raid",
    preMission: [
      "{org} criminal network operating from a compound in {city}. Target: leadership and logistics hub. Intelligence indicates narcotics processing, weapons storage, and financial records at the site.",
      "criminal network {org} using this facility as a regional headquarters. Expected contents: cash reserves, communications equipment, ledgers, and potentially armed guards from the cartel's security wing.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Primary target — {org}\'s regional commander — identified and detained. Found in a back office behind a reinforced door, shredding documents when the team breached. Hard drives seized before wipe could complete.',
      '"JACKPOT." Cache located: {evidence}. Financial ledgers documenting transactions across {count} countries. {org}\'s logistics network is blown wide open.',
    ],
    jackpotFailure: [
      "Primary target fled through a pre-prepared escape tunnel. The compound was partially cleared but {org}'s leadership was not present. Evidence of recent occupation — the shredder was still warm.",
      "Target compound was a decoy. Limited personnel and materials found. Real operations likely redirected to an alternate site. {org} was tipped off.",
    ],
    sseSuccess:
      "SSE team catalogued: " +
      pick(DEBRIEF_EVIDENCE) +
      ". Cash totaling approximately $" +
      randInt(1, 15) +
      "M seized. Financial forensics team will trace the money trail.",
    sseFailure:
      "Limited materials recovered. Thermite charges had been set — most documents and electronics destroyed. Forensic team attempting data recovery from damaged media.",
    assessmentSuccess:
      "Raid on {org}'s facility in {city} disrupted their criminal operations. Key leadership detained, financial records seized, and logistics chain exposed. Law enforcement partners notified for coordinated follow-up.",
    assessmentFailure:
      "Raid on {org}'s facility in {city} failed to secure primary targets. Criminal leadership evaded capture, likely via prior warning. The network will relocate operations. Recommend immediate surveillance of known alternate sites.",
  },
  PROLIFERATOR: {
    targetDesc: "facility",
    objective: "counter-proliferation raid",
    preMission: [
      "{org} suspected of WMD-related activities at this facility in {city}. CBRN-qualified operators assigned. NBC protective equipment staged. Priority: secure all materials, documents, and scientific equipment before destruction.",
      "counter-proliferation intelligence indicates {org} is operating a research or manufacturing facility. Threat type: {threatLabel}. CBRN team attached to assault element. Containment protocols briefed.",
    ],
    jackpotSuccess: [
      '"JACKPOT — materials secured." CBRN team entered the laboratory section in full protective gear. Found: centrifuge components, chemical precursors, and technical documents in multiple languages. All materials containerized in hazmat packaging.',
      '"JACKPOT." Research facility secured. Scientific equipment, sample containers, and procurement records recovered intact. Lead scientist detained — positive ID confirmed. CBRN sweep shows no active contamination threat.',
    ],
    jackpotFailure: [
      "Laboratory section was destroyed by internal charges before the team could reach it. Fire suppression failed — critical materials consumed. CBRN team detected residual chemical signatures confirming WMD-related activity, but physical evidence is gone.",
      "Facility was in the process of being dismantled when the team arrived. Heavy equipment moved out within the last 48 hours based on floor marks. Only secondary materials recovered. {org}'s proliferation program has relocated.",
    ],
    sseSuccess:
      "CBRN-qualified SSE team catalogued all materials under strict chain-of-custody protocols. Samples sealed in triple containment. Technical documents photographed in situ. Full inventory transmitted to Vigil CBRN analysis division.",
    sseFailure:
      "Limited materials recovered. CBRN sweep of destroyed sections confirmed hazardous residue. Site will require environmental remediation. Intelligence value severely degraded by destruction.",
    assessmentSuccess:
      "Counter-proliferation raid on {org}'s facility in {city} secured WMD-related materials and key personnel. The seizure significantly degrades {org}'s program timeline. Materials are en route to national laboratory for full analysis.",
    assessmentFailure:
      "Counter-proliferation raid failed to secure {org}'s primary materials. Evidence of program activity was confirmed but the bulk of materials and equipment has been relocated. {org}'s proliferation timeline is delayed but not stopped.",
  },
  PROLIFERATOR_NETWORK: {
    targetDesc: "transfer site",
    objective: "counter-proliferation interdiction",
    preMission: [
      "{org} proliferation network operating a transfer point in {city}. Intelligence indicates dual-use components staged for handoff to end-user state program. Priority: seize all materials, detain facilitators, and map the upstream supply chain.",
      "counter-proliferation interdiction targeting {org}'s logistics node in {city}. Network has been moving centrifuge parts, precursor chemicals, and technical documents through this location. CBRN-qualified operators assigned for materials assessment.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Transfer site secured. Found: shipping containers packed with dual-use equipment — maraging steel tubes, specialized valves, vacuum pumps. Procurement documents in three languages recovered. Two facilitators detained.',
      '"JACKPOT." Network node disrupted. {org}\'s logistics coordinator captured alive with encrypted communications devices. Warehouse contained crated centrifuge components, falsified end-user certificates, and payment records linking to state sponsors.',
    ],
    jackpotFailure: [
      "Transfer site was partially cleared before the team arrived. Loading dock showed evidence of recent vehicle departure. Some secondary materials recovered but the primary shipment is gone. {org}'s network has been tipped off.",
      "Facilitators fled via a pre-planned escape route minutes before breach. Site contained empty crates with CBRN residue and shredded documents. Network is intact and will reconstitute at an alternate location.",
    ],
    sseSuccess:
      "SSE team recovered procurement records, shipping manifests, communication devices, and sample materials. Chain of custody established for all evidence. Financial records will map the broader network.",
    sseFailure:
      "Limited exploitation. Most documents destroyed. Materials recovered insufficient to prove weapons-grade intent. Network disrupted but not dismantled.",
    assessmentSuccess:
      "Counter-proliferation interdiction against {org}'s network in {city} successful. Key facilitators detained and supply chain disrupted. Recovered materials and documents will enable follow-on targeting of upstream suppliers and end-user programs.",
    assessmentFailure:
      "Interdiction of {org}'s network in {city} did not achieve primary objectives. The proliferation pipeline has been disrupted but key personnel and materials escaped. {org} will likely establish alternate routes within weeks.",
  },
  ASSET_COMPROMISED: {
    targetDesc: "detention site",
    objective: "asset recovery",
    preMission: [
      "FLASH priority: Vigil source compromised and detained by {org} in {city}. Counter-intelligence indicates the asset is being held for interrogation. Window for recovery is closing — the longer {org} has the asset, the more damage to Vigil's network.",
      "compromised Vigil asset confirmed alive and held at this location by {org}. The asset possesses knowledge of active operations across the theater. Extraction before full interrogation is critical.",
    ],
    jackpotSuccess: [
      '"PRECIOUS CARGO SECURE." Vigil asset located in a basement holding cell. Alive, showing signs of interrogation but conscious and responsive. Asset confirmed identity via pre-arranged challenge/response. Immediate medical assessment: stable.',
      '"PRECIOUS CARGO SECURE." Asset found in {loc}, handcuffed to a chair. Interrogation equipment in the room — they had started but hadn\'t broken the asset yet. Operators cut the restraints and moved the asset to extract vehicle.',
    ],
    jackpotFailure: [
      "Asset not found at the target location. Evidence of recent detention — chair bolted to the floor, restraints, blood. {org} moved the asset before the team arrived. Trail is cold.",
      "Asset located but too late. Found unresponsive in the holding area. Team medic attempted resuscitation. Asset did not survive. {org}'s interrogators had extracted information before elimination — damage assessment required.",
    ],
    sseSuccess:
      "Interrogation records and equipment seized. Analysis will determine what information was extracted from the asset before rescue. Counter-intelligence damage assessment initiated. Asset transported to secure medical facility for debriefing.",
    sseFailure:
      "Interrogation room documented. Recording equipment recovered — may reveal what {org} learned. All Vigil operations known to the asset must be considered potentially compromised. Emergency network lockdown recommended.",
    assessmentSuccess:
      "Asset recovery operation {codename} in {city} succeeded. Vigil source recovered alive before {org} could complete interrogation. Counter-intelligence damage assessment in progress but initial indications suggest the asset held. Network integrity maintained.",
    assessmentFailure:
      "Asset recovery failed. Vigil source remains in {org}'s custody or has been eliminated. All operations known to the asset are considered compromised. Vigil is executing emergency protocols across the {theater} theater to protect remaining sources.",
  },
  MILITARY_TARGET: {
    targetDesc: "military installation",
    objective: "direct action raid",
    preMission: [
      "military target identified in {city}, {country}. Fortified position with defensive perimeter. Expected resistance: organized military-grade. Team equipped for heavy contact.",
      "{org} military installation targeted for destruction/capture. ISR shows defensive positions, vehicle parks, and communications infrastructure. Heavy resistance expected.",
    ],
    jackpotSuccess: [
      '"Objective secured." Military installation under team control. Command post captured intact — maps, communications equipment, and classified documents recovered. Defensive positions neutralized.',
      '"JACKPOT." Facility\'s command element captured. Military-grade equipment, ammunition stores, and operational plans secured. Remaining garrison surrendered after leadership was neutralized.',
    ],
    jackpotFailure: [
      "Garrison reinforced from adjacent positions before the team could secure the objective. The installation's defensive preparations exceeded intelligence estimates. Team forced to withdraw under heavy fire.",
      "Target installation's defenses were more extensive than ISR indicated. Concealed fighting positions and pre-registered mortar fire pinned the assault element. Objective not secured.",
    ],
    sseSuccess:
      "Military intelligence materials recovered: operational plans, communications logs, and equipment inventories. Order-of-battle analysis updated based on recovered documents.",
    sseFailure:
      "Minimal materials recovered during emergency withdrawal. Post-action ISR shows the installation remains operational with reinforced garrison.",
    assessmentSuccess:
      "Direct action against {org}'s military installation in {city} achieved objectives. Facility degraded, key personnel captured, and military intelligence recovered. Enemy force capability in the area significantly reduced.",
    assessmentFailure:
      "Raid on {org}'s military installation in {city} did not achieve objectives. Enemy defenses exceeded intelligence estimates. The installation remains operational. Recommend alternative approach — air strike or siege.",
  },
  STRATEGIC_TARGET: {
    targetDesc: "strategic facility",
    objective: "strategic strike",
    preMission: [
      "strategic target in {city}: {org}'s critical infrastructure node. Destruction of this facility will degrade enemy strategic capability. Maximum force authorized.",
      "{org} strategic facility targeted. Intelligence confirms this is a high-value infrastructure target whose destruction will have operational-level impact.",
    ],
    jackpotSuccess: [
      '"Objective destroyed." Strategic facility rendered inoperable. Critical infrastructure demolished. Secondary explosions confirm ammunition or fuel storage was present.',
      '"JACKPOT." Strategic target neutralized. Facility\'s primary function — assessed as command-and-control — has been permanently degraded. Demolition charges placed on remaining structures.',
    ],
    jackpotFailure: [
      "Strategic target partially damaged but not destroyed. Hardened construction absorbed more ordnance than planned. Facility likely repairable within weeks.",
      "Target facility was defended by systems not identified in pre-mission intelligence. Team took casualties during approach. Only peripheral structures damaged.",
    ],
    sseSuccess:
      "Demolition complete. BDA confirms primary structures destroyed. Strategic capability permanently degraded.",
    sseFailure:
      "Partial damage only. Facility will require follow-up strike to complete destruction.",
    assessmentSuccess:
      "Strategic strike on {org}'s facility in {city} achieved destruction of critical infrastructure. Enemy strategic capability in the {theater} theater significantly degraded.",
    assessmentFailure:
      "Strike on {org}'s strategic facility in {city} achieved only partial damage. The facility may be restored. Follow-up action required to complete the mission.",
  },
  HVT_TARGET: {
    targetDesc: "compound",
    objective: "HVT operation",
    // HVT_TARGET maps naturally to SOF_RAID's default narrative, so minimal overrides needed
    preMission: null, // use default
    jackpotSuccess: null, // use default
    jackpotFailure: null, // use default
    sseSuccess: null,
    sseFailure: null,
    assessmentSuccess: null,
    assessmentFailure: null,
  },
  TERROR_CELL: {
    targetDesc: "compound",
    objective: "direct action",
    // TERROR_CELL maps naturally to SOF_RAID's default narrative
    preMission: null,
    jackpotSuccess: null,
    jackpotFailure: null,
    sseSuccess: null,
    sseFailure: null,
    assessmentSuccess: null,
    assessmentFailure: null,
  },
  STATE_ACTOR: {
    targetDesc: "facility",
    objective: "direct action",
    preMission: [
      "state-sponsored {org} facility in {city}. Intelligence indicates foreign intelligence officers and military advisors present. Diplomatic implications are severe — this is a high-stakes operation.",
      "{org} — a state-backed entity — operating from this facility. Evidence of espionage infrastructure, signals equipment, and foreign military liaison. Assault must be precise to control the narrative.",
    ],
    jackpotSuccess: null,
    jackpotFailure: null,
    sseSuccess: null,
    sseFailure: null,
    assessmentSuccess: null,
    assessmentFailure: null,
  },
  STATE_ACTOR_ESPIONAGE: {
    targetDesc: "intelligence station",
    objective: "counter-espionage operation",
    preMission: [
      "{sponsor}-directed espionage cell operating under {org} cover in {city}. Intelligence confirms active collection against US diplomatic and military targets. Counter-intelligence operation aims to identify handlers, map the network, and neutralize collection capability.",
      "{org} identified as a {sponsor} intelligence front in {city}. SIGINT intercepts confirm tasking from {sponsor} intelligence services. The operation has been penetrating US classified programs. Immediate disruption required to stop the hemorrhaging of sensitive information.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Espionage cell rolled up. Lead intelligence officer identified and detained with encrypted communications equipment, dead-drop schedules, and intelligence reports prepared for transmission to {sponsor}. Network fully mapped.',
      "\"JACKPOT.\" {org}'s intelligence station neutralized. Found: SIGINT collection equipment targeting US embassy communications, handler contact protocols, and payment records. {sponsor}'s espionage infrastructure in {city} is dismantled.",
    ],
    jackpotFailure: [
      "Primary intelligence officer evaded detention — likely warned by counter-surveillance. Safe house was sanitized before entry. {sponsor}'s espionage network in {city} is intact and now aware of US counter-intelligence interest.",
      "Cell members scattered before the operation could close the net. Communications equipment found destroyed. {org}'s handlers have gone dark. {sponsor} will reconstitute the network under new cover.",
    ],
    sseSuccess:
      "Counter-intelligence exploitation recovered encrypted devices, intelligence reports, contact schedules, and financial transaction records. Damage assessment initiated — scope of compromised information being determined.",
    sseFailure:
      "Minimal exploitation value. Communications devices wiped. The damage assessment will rely on previously collected signals intelligence to determine what information was compromised.",
    assessmentSuccess:
      "Counter-espionage operation {codename} in {city} successfully dismantled {sponsor}'s intelligence collection network operating under {org} cover. Key personnel detained, collection equipment seized, and damage assessment underway. {sponsor}'s intelligence capability in the region is significantly degraded.",
    assessmentFailure:
      "Counter-espionage operation {codename} in {city} failed to neutralize {sponsor}'s intelligence network. {org}'s operatives evaded capture. The espionage operation against US interests continues. {sponsor} will implement enhanced security measures making future counter-intelligence operations more difficult.",
  },
  STATE_ACTOR_PROXY: {
    targetDesc: "proxy force staging area",
    objective: "strike against state-sponsored proxy force",
    preMission: [
      "{sponsor}-backed proxy force {org} staging in {city}. Intelligence confirms weapons shipments from {sponsor}, military advisors embedded with the force, and operational planning for attacks against US-aligned interests. Strike aims to destroy staging capability and demonstrate resolve.",
      "{org} — a {sponsor} proxy — massing personnel and equipment near {city}. Satellite imagery shows vehicle concentrations, ammunition staging, and communications infrastructure linked to {sponsor} military command. Strike authorized to degrade combat capability.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Proxy staging area destroyed. BDA confirms: vehicle park eliminated, ammunition stores detonated (secondary explosions for 40 minutes), communications equipment destroyed. {sponsor} military advisors confirmed among casualties.',
      '"JACKPOT." Strike achieved full effect on {org}\'s staging area in {city}. Pre-positioned weapons shipments from {sponsor} destroyed before distribution. Proxy force combat effectiveness severely degraded.',
    ],
    jackpotFailure: [
      "Strike achieved only partial effect. {org}'s forces had dispersed from the primary staging area — likely warned by {sponsor} intelligence. Secondary positions struck but the proxy force retains most of its combat capability.",
      "Target area was reinforced with air defenses not previously identified. Strike package diverted to suppress defenses — limited ordnance on primary target. {org}'s proxy force staging area partially damaged but operational.",
    ],
    sseSuccess:
      "Battle damage assessment confirms destruction of primary staging infrastructure. {sponsor}'s investment in proxy capability in this area has been set back significantly. Intel recovered from the site will map the supply chain.",
    sseFailure:
      "BDA inconclusive. Cloud cover and secondary fires obscure damage extent. {org}'s proxy force may retain significant capability. Follow-up ISR tasked.",
    assessmentSuccess:
      "Strike on {sponsor}'s proxy force {org} in {city} achieved strategic objectives. Staging capability destroyed, supply chain disrupted, and {sponsor}'s ability to project force through proxies in the region degraded. Diplomatic messaging to {sponsor} reinforced through back channels.",
    assessmentFailure:
      "Strike on {org}'s proxy staging area in {city} did not achieve primary objectives. {sponsor}'s proxy force retains combat capability and will likely reconstitute. {sponsor} may escalate support in response. Recommend follow-up action or diplomatic engagement.",
  },
  STATE_ACTOR_SABOTAGE: {
    targetDesc: "sabotage cell safe house",
    objective: "counter-sabotage raid",
    preMission: [
      "{sponsor}-directed sabotage cell operating as {org} in {city}. Intelligence confirms planning or execution of attacks against US critical infrastructure — energy, communications, or military systems. Raid objective: neutralize the cell, seize sabotage materials, and identify the target list.",
      "{org} identified as a {sponsor} sabotage operation targeting US interests in {city}. Cell members have been conducting reconnaissance on critical infrastructure. Explosive materials or cyber attack tools may be on-site. CBRN precautions advised.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Sabotage cell neutralized. Cell leader detained. Found: detailed reconnaissance files on US infrastructure targets, sabotage equipment (explosives/devices), and direct communications with {sponsor} handlers. Attack timeline recovered — strikes were imminent.',
      "\"JACKPOT.\" {org}'s safe house secured. Cell members captured. Evidence includes target packages for US military installations, pre-positioned sabotage materials, and encrypted links to {sponsor}'s intelligence directorate. The planned attack has been prevented.",
    ],
    jackpotFailure: [
      "Safe house was rigged. Entry triggered a booby trap that delayed the assault team. By the time the building was cleared, key cell members had evacuated through a prepared escape route. Sabotage materials and target lists not recovered.",
      "Cell had already dispersed from the safe house. Evidence of recent occupation but operational materials removed. {sponsor}'s sabotage operation is still active and the target list is unknown. The threat persists.",
    ],
    sseSuccess:
      "Exploitation recovered sabotage materials, target reconnaissance files, communication devices, and {sponsor} handler contact protocols. The full scope of planned attacks can now be assessed. Counter-measures being deployed to identified targets.",
    sseFailure:
      "Limited exploitation. Cell members destroyed critical materials during the raid. Target list not fully recovered. Defensive measures must be applied broadly across potential targets.",
    assessmentSuccess:
      "Counter-sabotage raid {codename} in {city} neutralized {sponsor}'s sabotage cell operating as {org}. Planned attacks against US critical infrastructure prevented. Recovered materials will enable counter-intelligence operations against {sponsor}'s sabotage directorate.",
    assessmentFailure:
      "Counter-sabotage raid {codename} in {city} failed to neutralize {sponsor}'s cell. {org}'s sabotage capability remains intact and target list is unknown. All US installations in the {theater} theater should increase security posture. Follow-up intelligence collection is critical.",
  },
  ILLEGAL_AGENT_DOMESTIC: {
    targetDesc: "subject's residence",
    objective: "counter-espionage operation",
    preMission: [
      "Foreign intelligence operative {org} identified in {city}. {agency} sponsorship confirmed through SIGINT analysis. Cover identity documented. Domestic law enforcement assets briefed. Objective: apprehend the operative and exploit for intelligence.",
      "Counter-espionage target {org} operating on US soil under commercial cover in {city}. Sponsored by {agency}. Vigil assesses the operative has been conducting intelligence collection targeting US national security interests. Domestic authorities cleared for action.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Subject detained without incident at {loc}. Cover identity documents, encrypted communication devices, and intelligence materials seized. Subject is cooperating at a minimal level. Transfer to detention facility in progress.',
      '"JACKPOT." Operative apprehended. Found in possession of classified material, tradecraft equipment, and communication devices linked to {agency}. Arrest conducted cleanly — no public attention. Subject now in federal custody.',
    ],
    jackpotFailure: [
      "Subject was alerted and initiated counter-surveillance evasion. By the time the arrest team reached the location, the operative had sanitized their residence and vanished. {agency}'s agent is in the wind.",
      "Arrest operation compromised. Subject detected surveillance and activated emergency extraction protocol. Residence was empty — all intelligence materials removed. {agency} likely exfiltrated the operative within hours.",
    ],
    sseSuccess:
      "Exploitation of subject's residence and devices recovered encrypted communications, handler contact information, intelligence reports, and collection tasking. Damage assessment to US intelligence programs initiated.",
    sseFailure:
      "Subject's residence was professionally sanitized. Communication devices were destroyed or missing. Minimal intelligence value recovered. The scope of espionage damage may never be fully assessed.",
    assessmentSuccess:
      "Counter-espionage operation {codename} in {city} successfully neutralized a {agency} operative on US soil. Subject detained and transferred to federal custody. Intelligence exploitation is underway — damage assessment to US programs will follow.",
    assessmentFailure:
      "Counter-espionage operation {codename} in {city} failed to apprehend the {agency} operative. Subject evaded arrest and is presumed to have been exfiltrated. The espionage operation against US interests continues through other agents.",
  },
  ILLEGAL_AGENT_FOREIGN: {
    targetDesc: "safe house",
    objective: "capture operation",
    preMission: [
      "{agency} operative {org} identified operating in {city}, {country}. Subject is conducting intelligence operations targeting US interests from a third country. Capture team deployed under non-official cover. Objective: snatch the operative for interrogation and intelligence exploitation.",
      "Foreign illegal {org} operating in {city}, {country} on behalf of {agency}. Cover identity documented. Capture operation planned: close target surveillance, isolate the subject, execute a covert snatch, and exfiltrate to a secure facility.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Subject snatched from {loc} without alerting local authorities. Encrypted devices, documentation, and intelligence materials secured. Operative is now in transit to a secure detention facility. {country} host government was not informed.',
      '"JACKPOT." Capture operation successful. Subject isolated during a routine movement pattern and apprehended by the snatch team. No local witnesses, no police involvement. Operative and seized materials en route to secure facility.',
    ],
    jackpotFailure: [
      "Capture team was detected during approach. Subject activated emergency protocols and fled to the {agency} diplomatic mission — now beyond reach. Operation is blown and {country} authorities are asking questions.",
      "Subject's counter-surveillance training proved effective. The snatch team was identified and the operative evaded through a pre-planned escape route. Local police responded to the disturbance. Diplomatic complications likely.",
    ],
    sseSuccess:
      "Exploitation of seized devices and documents revealing operational communications with {agency} headquarters, collection tasking, and intelligence reports. Prisoner interrogation will supplement technical exploitation.",
    sseFailure:
      "Subject destroyed primary communication device during the struggle. Limited materials seized. Intelligence value will depend primarily on prisoner interrogation.",
    assessmentSuccess:
      "Capture operation {codename} in {city}, {country} successfully apprehended a {agency} operative. Subject is in custody and being transported to a secure detention facility. Intelligence exploitation and interrogation will commence immediately.",
    assessmentFailure:
      "Capture operation {codename} in {city}, {country} failed. The {agency} operative evaded the snatch team and is presumed to have been exfiltrated or sought diplomatic protection. The operation's exposure may compromise other intelligence activities in {country}.",
  },
  DOMESTIC_CAPTURE_TARGET: {
    targetDesc: "subject's last known location",
    objective: "fugitive apprehension",
    preMission: [
      "High-priority fugitive {org} located in {city}. Subject has outstanding federal warrants and has evaded capture for an extended period. Vigil monitoring confirmed the subject's current position. Apprehension team being assembled.",
      "Federal fugitive {org} identified in {city} through Vigil surveillance network. Subject is considered dangerous based on criminal history and prior evasion behavior. Domestic law enforcement assets cleared for targeted apprehension.",
    ],
    jackpotSuccess: [
      '"JACKPOT." Subject detained by plainclothes team at {loc}. No resistance. Personal effects seized including false identification and cash. Subject transported to federal holding.',
      '"JACKPOT." Fugitive apprehended without incident. Subject was intercepted during a routine activity and did not attempt to flee. Federal custody confirmed.',
    ],
    jackpotFailure: [
      "Subject was not at the expected location. Evidence of hasty departure — personal items left behind but no forwarding indicators. Subject is back in the wind.",
      "Apprehension team compromised during approach. Subject fled the area before contact was made. Expanded search in progress but subject has likely relocated.",
    ],
    sseSuccess:
      "Subject's personal effects yielded false identification documents, prepaid communication devices, and evidence of an associate support network. All items catalogued for prosecution.",
    sseFailure:
      "Location was sanitized. Subject departed with all critical personal effects. Limited forensic evidence recovered.",
    assessmentSuccess:
      "Fugitive apprehension {codename} in {city} concluded successfully. Subject in federal custody. Outstanding warrants served. Prosecution process initiated.",
    assessmentFailure:
      "Fugitive apprehension {codename} in {city} failed. Subject remains at large. BOLO updated with latest known description and vehicle information. Vigil monitoring of associate network continues.",
  },
};

// Fill template variables in threat context strings
function fillThreatContext(str, vars) {
  if (!str) return str;
  return str.replace(/\{(\w+)\}/g, function (m, key) {
    return vars[key] || m;
  });
}

// --- Intel Field Helpers ---

// Get a specific collected intel field's value, or null if not collected
function getIntel(v, key) {
  if (!v._intelMap) return null;
  var f = v._intelMap[key];
  return f && f.revealed ? f.value : null;
}

// Get intel field label for display
function getIntelLabel(v, key) {
  if (!v._intelMap) return null;
  var f = v._intelMap[key];
  return f && f.revealed ? f.label : null;
}

// Build a summary string of 1-3 collected intel findings
function intelExcerpts(v, keys, fallback) {
  var found = [];
  for (var i = 0; i < keys.length && found.length < 3; i++) {
    var val = getIntel(v, keys[i]);
    if (val) found.push(val);
  }
  return found.length > 0 ? found.join(" ") : fallback || "";
}

// Pick N items from an array, return comma-joined string
function pickItems(arr, n, fallback) {
  if (!arr || arr.length === 0) return fallback || "";
  var shuffled = arr.slice();
  for (var i = shuffled.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = tmp;
  }
  return shuffled.slice(0, Math.min(n, shuffled.length)).join(", ");
}

// --- Main Entry Point ---

function generateDebrief(op, success) {
  var v = op.fillVars || {};

  // Enrich fillVars with underlying threat type for context-aware narratives
  if (op.relatedThreatId && !v.threatType) {
    var _threat = getThreat(op.relatedThreatId);
    if (_threat) {
      v.threatType = _threat.type;
      v.threatLabel = _threat.typeLabel || _threat.type;
      v.threatUrgent = _threat.urgent || false;
      if (_threat.programType) v.programType = _threat.programType;
      if (_threat.cellType) v.cellType = _threat.cellType;
      if (_threat.assetStatus) v.assetStatus = _threat.assetStatus;
      if (_threat.activityType) v.activityType = _threat.activityType;
      if (_threat.sponsorCountry) v.sponsor = _threat.sponsorCountry;
      if (_threat.agencyId) v.agencyId = _threat.agencyId;
      if (_threat.agencyLabel) v.agency = _threat.agencyLabel;
      if (_threat.agencyCountry) v.agencyCountry = _threat.agencyCountry;
      if (_threat.agentTier) v.agentTier = _threat.agentTier;
      if (op._killingMethod) v.killingMethod = op._killingMethod;
      if (op._prisonerName) v.prisonerName = op._prisonerName;
      if (op._burnNoticeCountry) v.burnNoticeCountry = op._burnNoticeCountry;
      if (op._burnNoticeBoost) v.burnNoticeBoost = op._burnNoticeBoost;
    }
  }

  // --- Intel fields enrichment ---
  v._intelMap = {};
  v._revealedIntel = [];
  v._unrevealedIntel = [];
  if (op.intelFields) {
    for (var fi = 0; fi < op.intelFields.length; fi++) {
      var field = op.intelFields[fi];
      v._intelMap[field.key] = field;
      if (field.revealed) {
        v._revealedIntel.push(field);
      } else {
        v._unrevealedIntel.push(field);
      }
    }
  }
  v.intelCoverage =
    op.intelFields && op.intelFields.length > 0
      ? Math.round((v._revealedIntel.length / op.intelFields.length) * 100)
      : 0;

  // --- Timing enrichment ---
  v.transitHours = op.transitDurationMinutes
    ? Math.round(op.transitDurationMinutes / 6) / 10
    : null;
  v.execHours = op.execDurationMinutes
    ? Math.round(op.execDurationMinutes / 6) / 10
    : null;
  v.urgencyHours = op.urgencyHours || null;
  v.daysSinceSpawn = op.daySpawned ? V.time.day - op.daySpawned : null;
  v.domestic = op.domestic || false;
  v.maritime = op.maritime || false;

  // --- Confidence ---
  v.confidence = null;
  if (
    op.options &&
    op.selectedOptionIdx !== undefined &&
    op.options[op.selectedOptionIdx]
  ) {
    v.confidence = op.options[op.selectedOptionIdx].confidencePercent;
  }

  // Expired ops with no assets deployed get a special debrief
  if (op.expired) {
    // Build minimal fillVars if missing (expired ops may not have gone through full flow)
    if (!v.codename) v.codename = op.codename || "UNKNOWN";
    if (!v.orgName) v.orgName = op.orgName || "Unknown";
    if (!v.city && op.location) v.city = op.location.city;
    if (!v.country && op.location) v.country = op.location.country;
    if (!v.theater && op.location && op.location.theater)
      v.theater = op.location.theater.name;
    if (!v.threatLevel) v.threatLevel = op.threatLevel || 3;
    var sections = DEBRIEF_GENERATORS.EXPIRED(op, v, false);
    return assemblDebrief(sections, op, false);
  }

  var generator = DEBRIEF_GENERATORS[op.operationType];
  if (!generator) generator = DEBRIEF_GENERATORS.MILITARY_STRIKE;

  var sections = generator(op, v, success);
  return assemblDebrief(sections, op, success);
}

// --- Debrief Assembly ---

function assemblDebrief(sections, op, success) {
  var html = "";
  html += headerSection(op, success);
  html += deployedSection(op);
  html += intelligenceBasisSection(op);
  html += vigilAssessmentSection(op);

  for (var i = 0; i < sections.length; i++) {
    html += sections[i];
  }

  html += operationalImpactSection(op);
  html += classificationFooter(op);
  return html;
}

// --- Common Sections ---

function headerSection(op, success) {
  var outcomeClass = success ? "debrief-success" : "debrief-failure";
  var outcomeLabel = success ? "MISSION SUCCESS" : "MISSION FAILURE";
  if (op.expired) {
    outcomeClass = "debrief-failure";
    outcomeLabel = "OPERATIONAL WINDOW EXPIRED — NO ACTION TAKEN";
  }
  var dt = dayToDate(V.time.day, V.time.year, V.time.month);
  var dateStr = dt.dayOfMonth + " " + MONTH_NAMES[dt.month] + " " + dt.year;

  return (
    '<div class="debrief-header">' +
    '<div class="debrief-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
    '<div class="debrief-title">AFTER-ACTION REPORT</div>' +
    '<div class="debrief-codename">' +
    op.codename +
    "</div>" +
    '<div class="debrief-outcome ' +
    outcomeClass +
    '">' +
    outcomeLabel +
    "</div>" +
    '<div class="debrief-date">' +
    dateStr +
    " — " +
    (op.location
      ? op.location.city + ", " + op.location.country
      : "UNKNOWN AO") +
    "</div>" +
    "</div>"
  );
}

function deployedSection(op) {
  if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return "";

  var html =
    '<div class="debrief-section">' +
    '<div class="debrief-section-title">DEPLOYED ASSETS</div>' +
    '<div class="debrief-assets">';

  for (var i = 0; i < op.assignedAssetIds.length; i++) {
    var asset = getAsset(op.assignedAssetIds[i]);
    if (!asset) continue;
    var base = getBase(asset.homeBaseId);
    var catInfo = ASSET_CATEGORIES[asset.category] || {};

    var readinessLabel =
      asset.readiness === "TIER_1"
        ? "TIER 1"
        : asset.readiness === "TIER_2"
          ? "TIER 2"
          : "";
    var deniLabel = asset.deniability === "COVERT" ? "COVERT" : "OVERT";

    html +=
      '<div class="debrief-asset-card">' +
      '<div class="debrief-asset-cat" style="color:' +
      (catInfo.color || "var(--text)") +
      '">' +
      (catInfo.shortLabel || asset.category) +
      (readinessLabel
        ? ' <span style="opacity:0.6">(' + readinessLabel + ")</span>"
        : "") +
      "</div>" +
      '<div class="debrief-asset-name">' +
      asset.name +
      "</div>" +
      (asset.designation
        ? '<div class="debrief-asset-origin" style="color:var(--text-dim);font-size:var(--fs-xs)">' +
          asset.designation +
          "</div>"
        : "") +
      '<div class="debrief-asset-origin">Origin: ' +
      (base ? base.name + ", " + base.country : "Unknown") +
      " | " +
      deniLabel +
      (asset.personnel ? " | " + asset.personnel + " personnel" : "") +
      "</div>" +
      (asset.vehicles && asset.vehicles.length > 0
        ? '<div class="debrief-asset-origin" style="color:var(--text-dim);font-size:var(--fs-xs)">Platforms: ' +
          asset.vehicles.slice(0, 4).join(", ") +
          (asset.vehicles.length > 4
            ? " +" + (asset.vehicles.length - 4) + " more"
            : "") +
          "</div>"
        : "") +
      "</div>";
  }

  html += "</div></div>";
  return html;
}

function intelligenceBasisSection(op) {
  if (!op.intelFields || op.intelFields.length === 0) return "";

  var revealed = [];
  var unrevealed = [];
  for (var i = 0; i < op.intelFields.length; i++) {
    if (op.intelFields[i].revealed) revealed.push(op.intelFields[i]);
    else unrevealed.push(op.intelFields[i]);
  }

  var coverage = Math.round((revealed.length / op.intelFields.length) * 100);
  var coverageColor =
    coverage >= 80
      ? "var(--green)"
      : coverage >= 50
        ? "var(--amber)"
        : "var(--red)";

  var html =
    '<div class="debrief-section">' +
    '<div class="debrief-section-title">INTELLIGENCE BASIS</div>' +
    '<div class="debrief-vigil-assessment">';

  html +=
    '<div class="debrief-meta-row">' +
    '<span class="debrief-meta-key">INTEL COVERAGE</span>' +
    '<span class="debrief-meta-val" style="color:' +
    coverageColor +
    ';font-weight:700">' +
    coverage +
    "% (" +
    revealed.length +
    " of " +
    op.intelFields.length +
    " fields collected)</span>" +
    "</div>";

  // Show collected fields with their values
  if (revealed.length > 0) {
    html += '<div style="margin-top:var(--sp-2)">';
    for (var r = 0; r < revealed.length; r++) {
      var f = revealed[r];
      var srcColor =
        f.source === "HUMINT"
          ? "var(--accent)"
          : f.source === "SIGINT"
            ? "var(--blue)"
            : f.source === "IMAGERY"
              ? "var(--green)"
              : f.source === "ISR"
                ? "var(--amber)"
                : f.source === "CYBER"
                  ? "var(--red)"
                  : "var(--text-dim)";
      html +=
        '<div style="margin-bottom:var(--sp-1)">' +
        '<span style="color:' +
        srcColor +
        ';font-size:var(--fs-xs);font-weight:600">[' +
        f.source +
        "]</span> " +
        '<span style="color:var(--text-hi);font-size:var(--fs-sm)">' +
        f.label +
        ":</span> " +
        '<span style="color:var(--text);font-size:var(--fs-sm)">' +
        f.value +
        "</span>" +
        "</div>";
    }
    html += "</div>";
  }

  // Show gaps
  if (unrevealed.length > 0) {
    var gapLabels = [];
    for (var u = 0; u < unrevealed.length; u++)
      gapLabels.push(unrevealed[u].label);
    html +=
      '<div style="margin-top:var(--sp-2);color:var(--text-dim);font-size:var(--fs-sm)">' +
      '<span style="color:var(--amber)">INTELLIGENCE GAPS:</span> ' +
      gapLabels.join(", ") +
      ". These fields were not collected prior to operational commitment." +
      "</div>";
  }

  html += "</div></div>";
  return html;
}

function vigilAssessmentSection(op) {
  if (!op.options || op.selectedOptionIdx === undefined) return "";

  var selected = op.options[op.selectedOptionIdx];
  var recommended = op.options[op.vigilRecommendedIdx];
  var deviated = op.deviatedFromVigil;

  var html =
    '<div class="debrief-section">' +
    '<div class="debrief-section-title">VIGIL ASSESSMENT</div>' +
    '<div class="debrief-vigil-assessment">';

  html +=
    '<div class="debrief-meta-row">' +
    '<span class="debrief-meta-key">SELECTED OPTION</span>' +
    '<span class="debrief-meta-val">' +
    selected.label +
    " (Confidence: " +
    selected.confidencePercent +
    "%)</span>" +
    "</div>";

  if (deviated && recommended) {
    html +=
      '<div class="debrief-meta-row debrief-deviation">' +
      '<span class="debrief-meta-key">VIGIL RECOMMENDED</span>' +
      '<span class="debrief-meta-val">' +
      recommended.label +
      " (Confidence: " +
      recommended.confidencePercent +
      "%)</span>" +
      "</div>" +
      '<div class="debrief-deviation-note">OPERATOR DEVIATED FROM VIGIL RECOMMENDATION. This deviation has been logged and will be factored into viability assessment.</div>';
  } else {
    html +=
      '<div class="debrief-compliance-note">Operator followed Vigil recommendation.</div>';
  }

  html += "</div></div>";
  return html;
}

function operationalImpactSection(op) {
  var html =
    '<div class="debrief-section">' +
    '<div class="debrief-section-title">OPERATIONAL IMPACT</div>' +
    '<div class="debrief-vigil-assessment">';

  // --- Viability ---
  if (op.viabilityDelta !== undefined) {
    var vDelta = op.viabilityDelta;
    var vSign = vDelta >= 0 ? "+" : "";
    var vColor =
      vDelta > 0
        ? "var(--green)"
        : vDelta < 0
          ? "var(--red)"
          : "var(--text-dim)";
    html +=
      '<div class="debrief-meta-row">' +
      '<span class="debrief-meta-key">VIABILITY</span>' +
      '<span class="debrief-meta-val" style="color:' +
      vColor +
      ';font-weight:700">' +
      vSign +
      vDelta +
      "% (now " +
      Math.round(V.resources.viability) +
      "%)</span>" +
      "</div>";
  }

  // --- Intel ---
  if (op.intelGain !== undefined && op.intelGain > 0) {
    html +=
      '<div class="debrief-meta-row">' +
      '<span class="debrief-meta-key">INTELLIGENCE</span>' +
      '<span class="debrief-meta-val" style="color:var(--green);font-weight:700">+' +
      op.intelGain +
      " (now " +
      V.resources.intel +
      ")</span>" +
      "</div>";
  } else if (op.status !== "SUCCESS" && op.status !== "EXPIRED") {
    html +=
      '<div class="debrief-meta-row">' +
      '<span class="debrief-meta-key">INTELLIGENCE</span>' +
      '<span class="debrief-meta-val" style="color:var(--text-dim)">No actionable intelligence recovered.</span>' +
      "</div>";
  }

  // --- Theater Risk ---
  if (op.theaterRiskDelta !== undefined && op.theaterRiskDelta !== 0) {
    var rSign = op.theaterRiskDelta > 0 ? "+" : "";
    var rColor = op.theaterRiskDelta < 0 ? "var(--green)" : "var(--red)";
    var theaterName =
      op.location && op.location.theater
        ? op.location.theater.name
        : op.location
          ? op.location.theaterId
          : "Unknown";
    html +=
      '<div class="debrief-meta-row">' +
      '<span class="debrief-meta-key">THEATER RISK (' +
      theaterName.toUpperCase() +
      ")</span>" +
      '<span class="debrief-meta-val" style="color:' +
      rColor +
      ';font-weight:700">' +
      rSign +
      op.theaterRiskDelta +
      "</span>" +
      "</div>";
  }

  // --- Diplomatic Impact ---
  if (op.diplomaticImpacts && op.diplomaticImpacts.length > 0) {
    for (var i = 0; i < op.diplomaticImpacts.length; i++) {
      var di = op.diplomaticImpacts[i];
      var dSign = di.delta >= 0 ? "+" : "";
      var dColor = di.delta > 0 ? "var(--green)" : "var(--red)";
      html +=
        '<div class="debrief-meta-row">' +
        '<span class="debrief-meta-key">DIPLOMATIC (' +
        di.country.toUpperCase() +
        ")</span>" +
        '<span class="debrief-meta-val" style="color:' +
        dColor +
        ';font-weight:700">' +
        dSign +
        di.delta +
        " stance — " +
        di.reason +
        "</span>" +
        "</div>";
    }
  }

  // --- Vigil Assessment Commentary ---
  var deviated = op.deviatedFromVigil;
  var success = op.status === "SUCCESS";
  var expired = op.expired;
  var v = op.fillVars || {};
  var assessment;

  // Intel coverage commentary
  var intelNote = "";
  if (v.intelCoverage !== undefined && !expired) {
    if (v.intelCoverage < 50) {
      intelNote =
        " Intelligence coverage was critically low at " +
        v.intelCoverage +
        "% — operational planning was severely constrained by collection gaps.";
    } else if (v.intelCoverage < 75) {
      intelNote =
        " Intelligence coverage at " +
        v.intelCoverage +
        "% left material gaps that may have affected operational outcomes.";
    }
  }

  // Confidence commentary
  var confNote = "";
  if (v.confidence && !expired) {
    if (v.confidence >= 85)
      confNote =
        " Pre-mission confidence was assessed at " +
        v.confidence +
        "% — well within acceptable parameters.";
    else if (v.confidence < 50)
      confNote =
        " Pre-mission confidence was only " +
        v.confidence +
        "% — this was a high-risk commitment from the outset.";
  }

  if (expired) {
    assessment =
      "The operator failed to deploy assets within the operational window. " +
      (op.orgName || "The target") +
      " was not engaged. " +
      "Vigil presented viable options that were not acted upon. This inaction has been logged. The threat remains active and the window of opportunity has closed.";
  } else if (success && !deviated) {
    assessment =
      "Operator adhered to Vigil-recommended course of action. Mission success validates system analysis. Viability standing reinforced." +
      confNote +
      intelNote;
  } else if (success && deviated) {
    assessment =
      "Mission objectives achieved despite operator deviation from Vigil recommendation. Outcome acknowledged, however the deviation introduces uncertainty into Vigil's predictive models. Reduced viability credit applied." +
      confNote +
      intelNote;
  } else if (!success && !deviated) {
    assessment =
      "Mission failure occurred while following Vigil-recommended course of action. System acknowledges shared responsibility for outcome. Minimal viability adjustment applied pending root-cause analysis." +
      confNote +
      intelNote;
  } else {
    assessment =
      "Mission failure compounded by unauthorized deviation from Vigil recommendation. The operator chose a course of action Vigil assessed as suboptimal, and the outcome confirms that assessment. Significant viability reduction applied. This pattern of judgment is being tracked." +
      confNote +
      intelNote;
  }

  html +=
    '<div style="margin-top:var(--sp-2);color:var(--text-dim);font-size:var(--fs-sm);line-height:1.6">' +
    assessment +
    "</div>";
  html += "</div></div>";
  return html;
}

function classificationFooter(op) {
  return (
    '<div class="debrief-footer">' +
    '<div class="debrief-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
    '<div class="debrief-case-file">CASE FILE: ' +
    generateCaseFileId() +
    " — VIGIL INTERNAL DISTRIBUTION ONLY</div>" +
    "</div>"
  );
}

// --- Timeline Builder ---

function buildTimeline(entries) {
  var html =
    '<div class="debrief-section">' +
    '<div class="debrief-section-title">OPERATIONAL TIMELINE</div>' +
    '<div class="debrief-timeline">';

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var cls =
      e.type === "critical"
        ? " critical"
        : e.type === "failure"
          ? " failure"
          : "";
    html +=
      '<div class="debrief-timeline-entry' +
      cls +
      '">' +
      '<div class="debrief-timeline-time">' +
      e.time +
      "</div>" +
      '<div class="debrief-timeline-text">' +
      e.text +
      "</div>" +
      "</div>";
  }

  html += "</div></div>";
  return html;
}

function buildAssessment(text) {
  return (
    '<div class="debrief-section">' +
    '<div class="debrief-section-title">STRATEGIC ASSESSMENT</div>' +
    '<div class="debrief-assessment">' +
    text +
    "</div>" +
    "</div>"
  );
}

// --- Time Helpers ---

function zuluTime(hourOffset) {
  var h = (V.time.hour + hourOffset) % 24;
  if (h < 0) h += 24;
  return (
    String(h).padStart(2, "0") + String(randInt(0, 59)).padStart(2, "0") + "Z"
  );
}

function zuluMinOffset(hourOffset, minOffset) {
  var h = (V.time.hour + hourOffset) % 24;
  if (h < 0) h += 24;
  var m = minOffset || 0;
  return String(h).padStart(2, "0") + String(m).padStart(2, "0") + "Z";
}

function dayLabel(offset) {
  return "D" + (offset >= 0 ? "+" : "") + offset;
}

// --- Generators ---

var DEBRIEF_GENERATORS = {};

// =====================================================================
//  MILITARY STRIKE
// =====================================================================

DEBRIEF_GENERATORS.MILITARY_STRIKE = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var entries = [];

  // Threat-context adaptation
  var isWMD = v.threatType === "PROLIFERATOR";
  var isMilitary =
    v.threatType === "MILITARY_TARGET" || v.threatType === "STRATEGIC_TARGET";
  var isProxy = v.threatType === "STATE_ACTOR" && v.activityType === "PROXY";
  var targetLabel = isWMD
    ? v.programType === "NETWORK"
      ? "proliferation logistics site"
      : "WMD-related facility"
    : isMilitary
      ? "military installation"
      : isProxy
        ? (v.sponsor || "state") + "-backed proxy staging area"
        : "command-and-control infrastructure";

  // Pull real intel
  var airDefenseIntel = getIntel(v, "AIR_DEFENSE_POSTURE");
  var forceIntel = getIntel(v, "FORCE_DISPOSITION");
  var hardeningIntel =
    getIntel(v, "TARGET_HARDENING") || getIntel(v, "HARDENING_LEVEL");
  var collateralIntel =
    getIntel(v, "COLLATERAL_RISK") || getIntel(v, "CIVILIAN_PROXIMITY");
  var supplyIntel = getIntel(v, "SUPPLY_LINES");
  var commandIntel = getIntel(v, "COMMAND_STRUCTURE");

  // Use actual platform designation if available
  var platformStr =
    v.designations && v.designations.length > 0
      ? v.designations[0]
      : v.primaryAsset;
  var transitNote = v.transitHours
    ? " Transit to AO: " + v.transitHours + " hours."
    : "";

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-6),
    type: "normal",
    text:
      platformStr +
      " departed " +
      v.primaryBase +
      ". Mission callsign: " +
      callsign +
      ". Strike package assembled." +
      transitNote +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-5),
    type: "normal",
    text:
      "Pre-strike coordination with CAOC complete. Deconfliction verified. No friendly forces in the target area. ROE: Vigil Directive 3 applies." +
      (isWMD
        ? " CBRN contamination risk assessed — munition selection accounts for secondary dispersal."
        : "") +
      (airDefenseIntel
        ? " Air defense assessment: " + airDefenseIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Transit to " +
      v.city +
      ", " +
      v.country +
      ". Conditions: " +
      weather +
      ". Tanker rendezvous on schedule." +
      (forceIntel
        ? " Target force disposition per Vigil: " + forceIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "ISR assets established overwatch of target area in " +
      v.city +
      ". " +
      v.threatLevel +
      "/5 threat environment confirmed. Final target coordinates uploaded. Intel coverage: " +
      v.intelCoverage +
      "%." +
      (isWMD
        ? " MASINT confirms chemical/radiological signatures at the target site."
        : "") +
      (hardeningIntel
        ? " Target hardening assessed: " + hardeningIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      callsign +
      " at IP. All systems nominal. Weapons armed. Awaiting final clearance from Vigil operations center." +
      (collateralIntel
        ? " Collateral risk assessment: " + collateralIntel + "."
        : ""),
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        '"' +
        callsign +
        ', you are cleared hot." Weapons release. ' +
        randInt(2, 6) +
        " precision-guided munitions on target. Time on target: " +
        randInt(3, 8) +
        " seconds. Direct hits confirmed on " +
        v.orgName +
        " " +
        targetLabel +
        ".",
    });
    if (isWMD) {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+5min",
        type: "normal",
        text: "Post-strike observation: facility destroyed. No secondary chemical release detected — munitions achieved clean destruction. CBRN monitoring assets confirm no contamination plume.",
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+5min",
        type: "normal",
        text: "Secondary explosions observed at target site — probable ammunition storage. Thermal imaging confirms structural collapse of primary building.",
      });
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0) + "+20min",
      type: "normal",
      text:
        "BDA pass complete. " +
        randInt(2, 4) +
        " of " +
        randInt(3, 5) +
        " designated aim points destroyed. " +
        v.orgName +
        " communications traffic ceased from target facility.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text: "Collateral damage assessment: minimal — no civilian structures impacted within assessed blast radius. Pattern-of-life analysis confirmed target was military in nature.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        pick(DEBRIEF_EXFIL) +
        ". All assets accounted for. No battle damage sustained.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        callsign +
        " initiated strike sequence. Weapons away. " +
        randInt(2, 4) +
        " munitions released on target coordinates.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0) + "+3min",
      type: "normal",
      text:
        "Initial BDA: impacts observed in target area. However, " +
        pick(DEBRIEF_COMPROMISE) +
        ".",
    });
    if (isWMD) {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+30min",
        type: "failure",
        text: "Detailed BDA reveals the primary WMD facility was located in a hardened underground structure not fully destroyed by the strike. Surface structures demolished but subsurface capability may be intact. CBRN monitoring shows possible low-level release — downwind monitoring activated.",
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+30min",
        type: "failure",
        text:
          "Detailed BDA reveals primary target — " +
          v.orgName +
          " " +
          (isMilitary ? "military installation" : "command post") +
          " — was not in the struck structures. Intelligence now indicates the facility was vacated " +
          randInt(4, 24) +
          " hours prior to the strike. Decoy activity detected at the site.",
      });
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        "Collateral damage assessment: " +
        pick([
          "under review — adjacent civilian structure sustained minor damage",
          "clean — only military structures affected",
          "one non-target structure within blast radius, damage assessment pending",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Assets recovered to " +
        v.primaryBase +
        ". Intelligence gap identified — Vigil initiating review of source reliability for target confirmation.",
    });
  }

  var assessment;
  var coverStr = " Intel coverage at time of strike: " + v.intelCoverage + "%.";
  if (isWMD && success) {
    assessment =
      "Operation " +
      v.codename +
      " destroyed " +
      v.orgName +
      "'s WMD-related facility in " +
      v.city +
      ". CBRN assessment confirms clean destruction — no hazardous material release. " +
      v.orgName +
      "'s proliferation program has been set back significantly. Materials and equipment destroyed cannot be easily replaced." +
      coverStr;
  } else if (isWMD) {
    assessment =
      "Operation " +
      v.codename +
      " achieved only partial damage to " +
      v.orgName +
      "'s WMD facility." +
      (hardeningIntel
        ? " Pre-strike hardening assessment (" +
          hardeningIntel +
          ") proved accurate — structure withstood initial strike."
        : " Hardened underground components may remain functional.") +
      " CBRN monitoring continues. Follow-up action required." +
      coverStr;
  } else if (success) {
    assessment =
      "Operation " +
      v.codename +
      " achieved its primary objective in the " +
      v.theater +
      " theater. " +
      v.orgName +
      "'s operational capability in " +
      v.city +
      " has been significantly degraded. SIGINT confirms disruption to their " +
      (isMilitary ? "military command structure" : "command network") +
      "." +
      (commandIntel
        ? " Command structure assessment (" +
          commandIntel +
          ") corroborated by post-strike analysis."
        : "") +
      " Theater risk assessment adjusted downward." +
      coverStr;
  } else {
    assessment =
      "Operation " +
      v.codename +
      " failed to achieve its primary objective. " +
      v.orgName +
      " remains operational in " +
      v.city +
      ", " +
      v.country +
      "." +
      (v.intelCoverage < 60
        ? " Intelligence coverage was only " +
          v.intelCoverage +
          "% — critical gaps may have contributed to target alerting."
        : " Intelligence suggests the target was alerted prior to the strike.") +
      " Vigil is reviewing the intelligence chain and assessing whether source compromise occurred. Theater risk remains elevated.";
  }

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  SOF RAID — Helmet-cam-level detail
// =====================================================================

DEBRIEF_GENERATORS.SOF_RAID = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var entries = [];

  // --- Threat-context adaptation ---
  // Use program-type-specific context for PROLIFERATOR network raids
  var tcKey = v.threatType;
  if (v.threatType === "PROLIFERATOR" && v.programType === "NETWORK")
    tcKey = "PROLIFERATOR_NETWORK";
  if (v.threatType === "STATE_ACTOR" && v.activityType)
    tcKey = "STATE_ACTOR_" + v.activityType;
  var tc = tcKey && THREAT_CONTEXT[tcKey] ? THREAT_CONTEXT[tcKey] : null;
  var targetDesc = (tc && tc.targetDesc) || "compound";
  var objectiveDesc = (tc && tc.objective) || "direct action";

  // Pull real data from intel fields
  var guardForceIntel =
    getIntel(v, "GUARD_FORCE") || getIntel(v, "MEMBER_COUNT");
  var hostileCount = guardForceIntel ? randInt(6, 18) : randInt(4, 12);
  var teamSize =
    v.totalPersonnel && v.totalPersonnel > 0
      ? Math.min(v.totalPersonnel, randInt(16, 32))
      : randInt(12, 24);
  var hostageCountIntel = getIntel(v, "HOSTAGE_COUNT");
  var entryPointsIntel = getIntel(v, "ENTRY_POINTS");
  var leadershipIntel =
    getIntel(v, "LEADERSHIP_ID") ||
    getIntel(v, "HVT_IDENTITY") ||
    getIntel(v, "CAPTOR_ID");
  var weaponsCacheIntel = getIntel(v, "WEAPONS_CACHE");
  var qrfIntel = getIntel(v, "QRF_PROXIMITY");
  var escapesIntel = getIntel(v, "ESCAPE_ROUTES");
  var targetIntentIntel = getIntel(v, "TARGET_INTENT");
  var facilityIntel =
    getIntel(v, "FACILITY_ID") || getIntel(v, "TARGET_HARDENING");
  var commsIntel =
    getIntel(v, "INTERNAL_COMMS") || getIntel(v, "COMMS_PATTERN");
  var networkIntel =
    getIntel(v, "NETWORK_MAPPING") ||
    getIntel(v, "SUPPORT_NETWORK") ||
    getIntel(v, "HVT_NETWORK");

  var tcVars = {
    org: v.orgName,
    city: v.city,
    country: v.country,
    theater: v.theater,
    codename: v.codename,
    threatLabel: v.threatLabel || "",
    sponsor: v.sponsor || "",
    loc: pick([
      "second floor, east wing",
      "ground floor, rear room",
      "basement level",
      "reinforced interior room",
    ]),
    count: randInt(2, 6),
    evidence: pick(DEBRIEF_EVIDENCE),
  };

  // For hostage/asset rescue contexts, adjust team composition
  var isRescue =
    v.threatType === "HOSTAGE_CRISIS" || v.threatType === "ASSET_COMPROMISED";
  var isCBRN = v.threatType === "PROLIFERATOR";

  // --- Pre-mission ---
  var preMissionContext = "";
  if (tc && tc.preMission) {
    preMissionContext = fillThreatContext(pick(tc.preMission), tcVars);
  }

  // Build intel-informed pre-mission briefing
  var intelBrief = "";
  if (guardForceIntel)
    intelBrief += " Force assessment: " + guardForceIntel + ".";
  if (leadershipIntel && !isRescue)
    intelBrief += " Target ID: " + leadershipIntel + ".";
  if (qrfIntel) intelBrief += " QRF assessment: " + qrfIntel + ".";

  // Transit time from actual op data
  var transitNote = v.transitHours
    ? "Transit time to AO: " + v.transitHours + " hours. "
    : "";

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(-8),
    type: "normal",
    text:
      v.primaryAsset +
      " staged at forward operating base near " +
      v.city +
      ". " +
      teamSize +
      "-man assault element. " +
      transitNote +
      "Final intelligence brief received from Vigil (" +
      v.intelCoverage +
      "% collection coverage). Target: " +
      v.orgName +
      " " +
      targetDesc +
      ", grid reference classified." +
      (preMissionContext ? " " + preMissionContext : "") +
      intelBrief,
  });

  // Rehearsal — use real entry points if collected
  var rehearsalNote = entryPointsIntel
    ? "Scale model of target " +
      targetDesc +
      " constructed from ISR imagery. Entry point analysis: " +
      entryPointsIntel +
      ". Contingency plans for " +
      randInt(3, 5) +
      " abort scenarios reviewed."
    : "Scale model of target " +
      targetDesc +
      " constructed from ISR imagery. Entry points designated Alpha through Delta. Contingency plans for " +
      randInt(3, 5) +
      " abort scenarios reviewed.";
  if (escapesIntel)
    rehearsalNote += " Known escape routes identified: " + escapesIntel + ".";
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(-4),
    type: "normal",
    text: "Mission rehearsal complete. " + rehearsalNote,
  });

  // Kit check — use actual equipment from deployed assets
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 3) : "";
  if (isCBRN) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-6),
      type: "normal",
      text:
        "Kit check. " +
        (actualGear
          ? "Primary weapons: " + actualGear + ". "
          : "Weapons function-tested. ") +
        "CBRN protective equipment issued and tested — full MOPP-4 capability. Decontamination team staged at extract point. NODs calibrated.",
    });
  } else if (isRescue) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-6),
      type: "normal",
      text:
        "Kit check. " +
        (actualGear
          ? "Primary weapons: " + actualGear + ". "
          : "Weapons function-tested. ") +
        "Non-lethal options loaded — flashbangs, CS gas. Medic carried additional trauma supplies for " +
        (v.threatType === "HOSTAGE_CRISIS" ? "hostage" : "asset") +
        " casualties. NODs calibrated.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-6),
      type: "normal",
      text:
        "Kit check. " +
        (actualGear
          ? "Primary loadout: " + actualGear + ". "
          : "Weapons function-tested. ") +
        "Comms check on all nets. Medic verified blood types and trauma supplies for all team members. NODs calibrated.",
    });
  }

  // Aviation — use actual vehicles if available
  var aviationStr =
    v.vehicles && v.vehicles.length > 0
      ? pickItems(
          v.vehicles.filter(function (vv) {
            return /MH-|AH-|CV-|UH-|CH-|V-22|Osprey|Black Hawk|Chinook|Apache|Little Bird|Pave/.test(
              vv,
            );
          }),
          3,
          pick([
            "2x MH-60M Black Hawks + 1x MH-47G Chinook for extract",
            "2x MH-6M Little Birds + 1x AH-6 for gun support",
            "1x CV-22 Osprey + 2x AH-64 Apache escort",
          ]),
        )
      : pick([
          "2x MH-60M Black Hawks + 1x MH-47G Chinook for extract",
          "2x MH-6M Little Birds + 1x AH-6 for gun support",
          "1x CV-22 Osprey + 2x AH-64 Apache escort",
        ]);
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Team " +
      callsign +
      " departed for insertion. " +
      weather +
      ". Aviation assets: " +
      aviationStr +
      "." +
      (v.confidence ? " Pre-mission confidence: " + v.confidence + "%." : ""),
  });

  // Overwatch — adapted for threat context, pull real intel
  if (isRescue) {
    var cargoLabel =
      v.threatType === "HOSTAGE_CRISIS" ? "hostages" : "Vigil asset";
    var hostageDetail = hostageCountIntel
      ? hostageCountIntel
      : "Thermal confirms " + cargoLabel + " present";
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-2),
      type: "normal",
      text:
        "Overwatch established. ISR feed shows " +
        hostileCount +
        " armed personnel in and around the " +
        targetDesc +
        ". " +
        hostageDetail +
        ". " +
        pick([
          "Movement detected in interior room consistent with captive personnel.",
          "Heat signatures in basement level consistent with detained individuals.",
          "Audio intercept confirms " + cargoLabel + " alive as of this hour.",
        ]),
    });
  } else if (isCBRN) {
    var cbrDetail = facilityIntel ? facilityIntel + ". " : "";
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-2),
      type: "normal",
      text:
        "Overwatch established. ISR feed shows " +
        hostileCount +
        " personnel at the " +
        targetDesc +
        ". " +
        cbrDetail +
        "MASINT sensors detect chemical signatures consistent with WMD-related activity. Ventilation systems and laboratory equipment visible on thermal. " +
        randInt(1, 3) +
        " vehicles parked outside.",
    });
  } else {
    var pidMethod = commsIntel
      ? "SIGINT intercept confirmed target communications from the site"
      : success
        ? "confirmed by positive identification"
        : "assessed as probable";
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-2),
      type: "normal",
      text:
        "Overwatch established. ISR feed shows " +
        hostileCount +
        " military-age males in and around the " +
        targetDesc +
        ". " +
        randInt(1, 3) +
        " vehicles parked outside." +
        (guardForceIntel
          ? " Guard force consistent with intel assessment."
          : " Pattern-of-life consistent with Vigil intelligence package.") +
        ' "Jackpot" individual\'s presence ' +
        pidMethod +
        ".",
    });
  }

  // --- Approach and insertion ---
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text: pick(SOF_APPROACH),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluMinOffset(0, randInt(0, 5)),
    type: "normal",
    text:
      "Assault element in final assault position. Snipers in overwatch — " +
      randInt(2, 4) +
      ' positions covering all egress routes. "All stations, I have control. Stand by... stand by..."',
  });

  if (success) {
    // --- Climax: successful breach and clear (expanded room-by-room) ---
    var kia = 0;
    var detained = 0;

    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(5, 8)),
      type: "critical",
      text: '"EXECUTE EXECUTE EXECUTE." ' + pick(SOF_BREACH_DETAIL),
    });

    // Ground floor fighting
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(8, 9)),
      type: "critical",
      text: pick(SOF_GROUND_FLOOR_CLEAR),
    });
    kia += randInt(1, 3);

    // Room-by-room clearing
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(9, 11)),
      type: "critical",
      text: pick(SOF_ROOM_CLEAR),
    });
    kia += randInt(1, 2);

    // Sniper engagement during assault
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(11, 12)),
      type: "critical",
      text: pick(SOF_SNIPER_ENGAGEMENT),
    });
    kia += 1;

    // Upper floor push
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(12, 14)),
      type: "critical",
      text: pick(SOF_UPPER_FLOOR_CLEAR),
    });
    kia += randInt(1, 2);

    // Additional contact
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(14, 16)),
      type: "critical",
      text: pick(SOF_ROOM_CLEAR),
    });

    // Final target contact
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(16, 18)),
      type: "critical",
      text: pick(SOF_FINAL_CONTACT),
    });
    detained += randInt(0, 2);

    // JACKPOT call — adapted for threat context
    if (tc && tc.jackpotSuccess) {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(18, 20)),
        type: "critical",
        text:
          fillThreatContext(pick(tc.jackpotSuccess), tcVars) +
          " " +
          kia +
          " hostile KIA. " +
          detained +
          " detained.",
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(18, 20)),
        type: "critical",
        text:
          '"All stations, JACKPOT. I say again, JACKPOT." Target ' +
          (v.targetAlias || "HVT") +
          " positively identified and " +
          pick(["secured", "neutralized", "detained"]) +
          ". " +
          kia +
          " hostile KIA. " +
          detained +
          " detained.",
      });
    }

    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(20, 24)),
      type: "normal",
      text:
        targetDesc.charAt(0).toUpperCase() +
        targetDesc.slice(1) +
        " secured. All rooms cleared. Helmet cams reviewed — every engagement accounted for. Team accounting: all " +
        teamSize +
        " operators present. " +
        randInt(0, 2) +
        " minor injuries — shrapnel and abrasions treated on site.",
    });

    // --- SSE — adapted for threat context, enriched with real intel ---
    if (tc && tc.sseSuccess) {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(24, 30)),
        type: "normal",
        text: fillThreatContext(tc.sseSuccess, tcVars),
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(24, 30)),
        type: "normal",
        text: pick(SOF_SSE),
      });
    }
    // SSE corroboration — reference actual intel findings
    var sseCorroboration = "";
    if (weaponsCacheIntel)
      sseCorroboration +=
        " Weapons cache confirmed — consistent with pre-mission intel: " +
        weaponsCacheIntel +
        ".";
    if (networkIntel)
      sseCorroboration +=
        " Network documentation seized — corroborates SIGINT assessment: " +
        networkIntel +
        ".";
    if (targetIntentIntel && !isRescue)
      sseCorroboration +=
        " Recovered planning materials confirm assessed intent: " +
        targetIntentIntel +
        ".";
    var sseTime = v.execHours
      ? Math.round(v.execHours * 60 * 0.6)
      : randInt(25, 45);
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(30, 40)),
      type: "normal",
      text:
        "SSE complete. Total time on objective: " +
        sseTime +
        " minutes. All items catalogued and packaged for transport." +
        (isCBRN
          ? " CBRN materials sealed in triple containment for laboratory analysis."
          : " Demolition charges set on remaining weapons cache.") +
        sseCorroboration,
    });

    // --- Extract ---
    var extractCargo = isRescue
      ? v.threatType === "HOSTAGE_CRISIS"
        ? "Rescued hostages"
        : "Recovered asset"
      : v.targetAlias || "HVT";
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(40, 55)),
      type: "normal",
      text:
        pick(DEBRIEF_EXFIL) +
        ". " +
        extractCargo +
        " secured aboard extract aircraft. Zero friendly KIA.",
    });
  } else {
    // --- Climax: compromised assault (expanded with combat detail) ---
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(5, 8)),
      type: "critical",
      text: '"EXECUTE EXECUTE EXECUTE." ' + pick(SOF_BREACH_DETAIL),
    });

    // Initial contact — things seem normal
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(8, 10)),
      type: "critical",
      text: pick(SOF_ROOM_CLEAR),
    });

    // Then it goes wrong
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(10, 12)),
      type: "critical",
      text: pick(SOF_FAILURE_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(12, 14)),
      type: "failure",
      text:
        pick(SOF_ROOM_CLEAR) +
        " But " +
        pick(DEBRIEF_COMPROMISE) +
        ". " +
        targetDesc.charAt(0).toUpperCase() +
        targetDesc.slice(1) +
        " alarm triggered. Hostile QRF mobilizing from " +
        randInt(2, 5) +
        " blocks away.",
    });

    // Objective not achieved — adapted for threat context
    if (tc && tc.jackpotFailure) {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(14, 18)),
        type: "failure",
        text: fillThreatContext(pick(tc.jackpotFailure), tcVars),
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(14, 18)),
        type: "failure",
        text:
          "Target " +
          (v.targetAlias || "HVT") +
          " not located in expected position. Intelligence indicated room " +
          pick(["2A", "3B", "1C", "ground floor east"]) +
          " — room was empty. " +
          pick([
            "Evidence of recent occupation — warm tea, still-lit cigarette",
            "Bed unmade, personal effects removed",
            "Room had been stripped clean within the last hour",
          ]) +
          ".",
      });
    }

    // Continued fighting during withdrawal
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(18, 22)),
      type: "failure",
      text:
        pick(SOF_SNIPER_ENGAGEMENT) +
        " But hostiles are massing at the " +
        targetDesc +
        " perimeter. Muzzle flashes from adjacent rooftops.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(22, 25)),
      type: "normal",
      text:
        'Team leader: "We\'re dry on the objective. Calling abort." ' +
        randInt(1, 3) +
        " WIA — " +
        pick([
          "gunshot wound to the leg, non-life-threatening",
          "fragmentation injuries from improvised explosive",
          "blast concussion from RPG near-miss",
        ]) +
        ". Medic applying treatment under fire.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(25, 35)),
      type: "normal",
      text: "Emergency extraction. Gun runs by escort helicopters suppressed hostile reinforcements. Team extracted under fire. All wounded stable.",
    });

    // SSE for failure — reference what we lost
    if (tc && tc.sseFailure) {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(35, 40)),
        type: "normal",
        text: fillThreatContext(tc.sseFailure, tcVars),
      });
    }
    // Intel gap analysis on failure
    if (v._unrevealedIntel && v._unrevealedIntel.length > 0) {
      var gapNote =
        "Post-action analysis: intelligence gaps in " +
        v._unrevealedIntel
          .map(function (f) {
            return f.label;
          })
          .slice(0, 3)
          .join(", ") +
        " likely contributed to mission failure.";
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, randInt(40, 45)),
        type: "normal",
        text: gapNote,
      });
    }
  }

  // Assessment — adapted for threat context, enriched with real data
  var assessment;
  var confStr = v.confidence
    ? " Pre-mission confidence was " + v.confidence + "%."
    : "";
  var coverStr =
    " Intel coverage at time of commitment: " + v.intelCoverage + "%.";
  if (tc && tc.assessmentSuccess && success) {
    assessment =
      fillThreatContext(tc.assessmentSuccess, tcVars) +
      " " +
      v.primaryAsset +
      " returning to " +
      v.primaryBase +
      ". Zero friendly KIA." +
      confStr +
      coverStr;
  } else if (tc && tc.assessmentFailure && !success) {
    assessment =
      fillThreatContext(tc.assessmentFailure, tcVars) +
      " " +
      randInt(1, 3) +
      " operators WIA, all expected to return to duty." +
      confStr +
      coverStr +
      " Vigil is re-evaluating source reliability.";
  } else if (success) {
    assessment =
      "Operation " +
      v.codename +
      ": SOF raid on " +
      v.orgName +
      " " +
      targetDesc +
      " in " +
      v.city +
      " achieved all objectives. Target " +
      (v.targetAlias || "HVT") +
      " captured/neutralized. Sensitive materials recovered for exploitation by Vigil analysis division. " +
      v.primaryAsset +
      " returning to " +
      v.primaryBase +
      ". Zero friendly KIA." +
      confStr +
      coverStr;
  } else {
    assessment =
      "Operation " +
      v.codename +
      ": SOF raid on " +
      v.orgName +
      " in " +
      v.city +
      " did not achieve primary objective. Target " +
      (v.targetAlias || "HVT") +
      " was not present at the " +
      targetDesc +
      " — intelligence suggests early warning enabled departure." +
      confStr +
      coverStr +
      " " +
      randInt(1, 3) +
      " operators WIA, all expected to return to duty. Operational security review initiated. Vigil is re-evaluating source reliability.";
  }

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  SURVEILLANCE
// =====================================================================

DEBRIEF_GENERATORS.SURVEILLANCE = function (op, v, success) {
  var entries = [];

  // Pull real intel and asset data
  var commsIntel =
    getIntel(v, "COMMS_PATTERN") || getIntel(v, "INTERNAL_COMMS");
  var networkIntel =
    getIntel(v, "NETWORK_MAPPING") ||
    getIntel(v, "SUPPORT_NETWORK") ||
    getIntel(v, "HVT_NETWORK");
  var movementIntel =
    getIntel(v, "MOVEMENT_PATTERNS") || getIntel(v, "ACTIVITY_BASELINE");
  var locationIntel =
    getIntel(v, "CELL_LOCATION") ||
    getIntel(v, "ORG_LOCATION") ||
    getIntel(v, "AREA_OF_INTEREST");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";
  var execTime = v.execHours ? Math.round(v.execHours) : randInt(48, 96);

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-6),
    type: "normal",
    text:
      v.primaryAsset +
      " tasked for persistent surveillance of " +
      v.orgName +
      " activities in " +
      v.city +
      ", " +
      v.country +
      ". Collection priority: network mapping and communications intercept." +
      (actualGear ? " Sensor suite: " + actualGear + "." : "") +
      (v.transitHours
        ? " Platform on station after " + v.transitHours + "-hour transit."
        : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "ISR platform on station. Full-spectrum coverage initiated — SIGINT, IMINT, and pattern-of-life analysis. Collection plan synchronized with Vigil targeting cell." +
      (locationIntel
        ? " Pre-existing location intel: " + locationIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(0),
    type: "normal",
    text:
      "Initial pattern-of-life data being compiled. Tracking " +
      randInt(4, 12) +
      " persons of interest across " +
      randInt(2, 5) +
      " locations in " +
      v.city +
      "." +
      (v.confidence ? " Operation confidence: " + v.confidence + "%." : ""),
  });

  if (success) {
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Identified " +
        randInt(3, 8) +
        " previously unknown associates of " +
        v.orgName +
        ". Network map updated with new communication links and meeting locations." +
        (movementIntel ? " Movement patterns confirmed: " + movementIntel : ""),
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(8),
      type: "normal",
      text:
        "SIGINT breakthrough: " +
        (commsIntel
          ? commsIntel
          : "intercepted an unencrypted voice call between two senior " +
            v.orgName +
            " operatives discussing logistics for an upcoming operation."),
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(4),
      type: "critical",
      text:
        "Critical intelligence obtained: " +
        (networkIntel ? networkIntel + "." : pick(DEBRIEF_EVIDENCE) + ".") +
        " Data transmitted to Vigil for analysis. Cross-referencing with existing threat models.",
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(12),
      type: "normal",
      text:
        "Key facility identified: " +
        v.orgName +
        " using a " +
        pick([
          "warehouse",
          "residential building",
          "commercial office",
          "religious compound",
        ]) +
        " as a logistics hub. Geo-tagged for future targeting.",
    });
    entries.push({
      time: dayLabel(3) + " " + zuluTime(0),
      type: "normal",
      text:
        "Surveillance window complete (" +
        execTime +
        " hours total). Asset repositioned. " +
        randInt(80, 200) +
        " hours of collected data processed. " +
        randInt(12, 30) +
        " actionable intelligence reports generated. Intel coverage improved from " +
        v.intelCoverage +
        "% to " +
        Math.min(100, v.intelCoverage + randInt(15, 30)) +
        "%.",
    });
  } else {
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Limited collection achieved. " +
        v.orgName +
        " employing counter-surveillance measures in " +
        v.city +
        ". Targets using encrypted communications and irregular movement patterns." +
        (commsIntel
          ? " Prior SIGINT on their comms (" +
            commsIntel +
            ") no longer current — TTPs have changed."
          : ""),
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(12),
      type: "normal",
      text: "Multiple targets observed conducting surveillance detection routes. Professional tradecraft — possible foreign intelligence training.",
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(4),
      type: "failure",
      text:
        "Target organization went dark after suspected detection of ISR platform. " +
        pick(DEBRIEF_COMPROMISE) +
        ". All tracked individuals changed communications methods simultaneously.",
    });
    entries.push({
      time: dayLabel(3) + " " + zuluTime(0),
      type: "normal",
      text:
        "Surveillance terminated after " +
        execTime +
        " hours. Minimal actionable intelligence collected. Target awareness of Vigil interest confirmed. Recommend stand-down period before re-tasking.",
    });
  }

  var assessment = success
    ? "Surveillance of " +
      v.orgName +
      " in " +
      v.city +
      " yielded high-value intelligence (" +
      v.intelCoverage +
      "% pre-mission coverage). Network analysis has identified new nodes for future targeting. Intel score increased. " +
      v.primaryAsset +
      " available for retasking. Recommend sustained collection posture in " +
      v.theater +
      " theater."
    : "Surveillance operation against " +
      v.orgName +
      " in " +
      v.city +
      " compromised after " +
      execTime +
      " hours on station. Counter-surveillance by the target resulted in loss of collection capability. " +
      v.orgName +
      " is likely to adjust TTPs. Alternative collection methods recommended. Intel coverage remains at " +
      v.intelCoverage +
      "%.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  NAVAL INTERDICTION
// =====================================================================

DEBRIEF_GENERATORS.NAVAL_INTERDICTION = function (op, v, success) {
  var entries = [];
  var vesselName =
    "MV " +
    pick([
      "ATLANTIC HORIZON",
      "PACIFIC STAR",
      "NORTHERN SPIRIT",
      "GOLDEN DAWN",
      "IRON MERCHANT",
      "SILVER CREST",
      "OCEAN TIGER",
      "DESERT WIND",
    ]);
  var flag = pick([
    "Panama",
    "Liberia",
    "Marshall Islands",
    "Comoros",
    "Togo",
    "Moldova",
  ]);

  // Pull real intel
  var cargoIntel = getIntel(v, "CARGO_MANIFEST");
  var routeIntel = getIntel(v, "ROUTE_PREDICTION");
  var vesselIntel = getIntel(v, "VESSEL_IDENTIFICATION");
  var networkIntel =
    getIntel(v, "NETWORK_MAPPING") || getIntel(v, "FINANCIAL_FLOWS");
  var actualVehicles =
    v.vehicles && v.vehicles.length > 0 ? pickItems(v.vehicles, 2) : "";
  var transitNote = v.transitHours
    ? " Transit: " + v.transitHours + " hours."
    : "";

  entries.push({
    time: dayLabel(-2) + " " + zuluTime(0),
    type: "normal",
    text:
      v.primaryAsset +
      " departed " +
      v.primaryBase +
      ". Ordered to establish interdiction zone near " +
      v.city +
      ", " +
      v.country +
      ". Maritime patrol area: " +
      randInt(200, 800) +
      " square nautical miles." +
      transitNote +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Transit to operational area. " +
      pick(DEBRIEF_WEATHER) +
      ". Sea state " +
      randInt(2, 5) +
      "." +
      (routeIntel ? " Route intelligence: " + routeIntel + "." : "") +
      (vesselIntel ? " Vessel identification: " + vesselIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Naval assets on station." +
      (actualVehicles ? " Deployed platforms: " + actualVehicles + "." : "") +
      " Interdiction zone established. All vessels entering the area subject to query and possible inspection." +
      (cargoIntel ? " Intel on expected cargo: " + cargoIntel + "." : ""),
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-2),
      type: "normal",
      text:
        "Suspect vessel identified: " +
        vesselName +
        ", " +
        flag +
        "-flagged, " +
        randInt(4000, 15000) +
        " DWT. AIS data inconsistent with declared route. Closing to intercept.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        vesselName +
        " ordered to stop for inspection. Vessel initially non-compliant — warning shots fired across bow. Vessel hove to. VBSS team deployed from RHIB.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0) + "+45min",
      type: "critical",
      text:
        "Board-and-search underway. Forward cargo hold: " +
        pick(DEBRIEF_EVIDENCE) +
        ". Concealed in modified shipping containers beneath legitimate cargo.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Vessel seized. " +
        randInt(12, 25) +
        " crew members detained and processed. Ship's logs and navigation data recovered — revealing " +
        v.orgName +
        "'s maritime supply network across " +
        randInt(3, 6) +
        " ports.",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        vesselName +
        " escorted to port under prize crew. Interdiction zone maintained for 12 additional hours. No further contacts. " +
        v.primaryAsset +
        " released to return to homeport.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Multiple vessels inspected over " +
        randInt(8, 16) +
        " hour period. " +
        randInt(3, 7) +
        " VBSS operations conducted. No contraband detected.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(6),
      type: "failure",
      text:
        "Intelligence indicates " +
        v.orgName +
        "'s shipment diverted to alternate route before interdiction zone was established. SIGINT intercept suggests the cargo transited via " +
        pick([
          "overland route through a neighboring country",
          "fishing vessel transfer at sea",
          "small craft in coastal waters outside the patrol area",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Interdiction terminated. " +
        v.primaryAsset +
        " returning to " +
        v.primaryBase +
        ". Shipment is assessed to have reached its destination. " +
        v.orgName +
        "'s awareness of naval patrol patterns confirmed.",
    });
  }

  var assessment = success
    ? "Naval interdiction near " +
      v.city +
      " successfully disrupted " +
      v.orgName +
      "'s maritime logistics. Seized cargo and crew provide actionable intelligence on the supply chain. Vessel " +
      vesselName +
      " and contents transferred to evidence custody." +
      (networkIntel
        ? " Seized materials corroborate network intelligence: " +
          networkIntel +
          "."
        : "") +
      " Intel coverage: " +
      v.intelCoverage +
      "%. Recommend sustained maritime presence."
    : "Interdiction failed to intercept target shipment. " +
      v.orgName +
      " demonstrated awareness of naval patrol patterns and adapted." +
      (v.intelCoverage < 60
        ? " Intel coverage was only " +
          v.intelCoverage +
          "% — route prediction may have been unreliable."
        : " Intelligence timeline was insufficient.") +
      " Recommend earlier deployment in future operations.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  CYBER OP
// =====================================================================

DEBRIEF_GENERATORS.CYBER_OP = function (op, v, success) {
  var entries = [];
  var implantName = pick([
    "NIGHTFALL",
    "COBALT",
    "IRONSIDE",
    "GLASSBREAK",
    "OVERCAST",
    "SANDCASTLE",
  ]);

  // Pull real intel
  var topoIntel = getIntel(v, "NETWORK_TOPOLOGY");
  var vulnIntel =
    getIntel(v, "VULNERABILITY_SCAN") || getIntel(v, "ACCESS_VECTORS");
  var attrIntel = getIntel(v, "ATTRIBUTION_CONF");
  var counterIntel = getIntel(v, "COUNTER_INTRUSION");
  var targetIntel = getIntel(v, "TARGET_INTENT");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-6),
    type: "normal",
    text:
      v.primaryAsset +
      " initiated cyber operation against " +
      v.orgName +
      "'s network infrastructure in " +
      v.city +
      ", " +
      v.country +
      ". Target: " +
      pick([
        "C2 servers",
        "financial network",
        "communications infrastructure",
        "operational planning systems",
      ]) +
      "." +
      (v.confidence ? " Operation confidence: " + v.confidence + "%." : "") +
      (attrIntel ? " Attribution assessment: " + attrIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Reconnaissance phase complete. " +
      (topoIntel
        ? "Network topology per Vigil collection: " + topoIntel + ". "
        : "Attack surface mapped. ") +
      randInt(3, 8) +
      " potential access vectors identified. Initial access vector selected: " +
      (vulnIntel
        ? vulnIntel
        : pick([
            "spear-phishing with weaponized document",
            "exploitation of unpatched VPN appliance",
            "supply chain compromise via third-party vendor",
            "watering hole attack on known associate website",
            "zero-day in target's custom web application",
          ])) +
      ".",
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "Initial access achieved. Establishing persistence via implant " +
      implantName +
      ". Lateral movement in progress through target network. " +
      randInt(3, 12) +
      " internal hosts enumerated." +
      (counterIntel ? " Counter-intrusion risk: " + counterIntel + "." : ""),
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-1),
      type: "normal",
      text:
        "Privilege escalation successful — domain administrator credentials obtained. Full Active Directory access. " +
        randInt(40, 200) +
        " user accounts enumerated across " +
        randInt(3, 8) +
        " organizational units.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        "Objective achieved. " +
        randInt(2, 8) +
        "TB of data exfiltrated from " +
        v.orgName +
        "'s servers via covert channel. Implants " +
        implantName +
        "-A through -" +
        String.fromCharCode(65 + randInt(2, 5)) +
        " deployed across " +
        randInt(4, 10) +
        " critical systems for persistent access.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        "Email server compromised — " +
        randInt(6, 24) +
        " months of communications archived. Encryption keys extracted from key management server. Future SIGINT collection against this target dramatically simplified.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Operational cleanup complete. Logs sanitized. Attribution indicators scrubbed. Implant beaconing set to low-and-slow profile — " +
        randInt(6, 24) +
        " hour callback interval to avoid detection.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-1),
      type: "normal",
      text: "Lateral movement detected by target's EDR solution. Alert generated in their security operations center. Attempting to evade detection...",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "failure",
      text:
        "Intrusion detected and contained. " +
        v.orgName +
        "'s security team isolated the compromised segment within " +
        randInt(8, 30) +
        " minutes. " +
        pick(DEBRIEF_COMPROMISE) +
        ". Implant " +
        implantName +
        " burned.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        v.orgName +
        " initiated network-wide incident response. All credentials rotated. Partial data collection — " +
        randInt(50, 500) +
        "MB recovered before access was severed. Intelligence value limited.",
    });
  }

  var assessment = success
    ? "Cyber operation against " +
      v.orgName +
      " in " +
      v.country +
      " achieved comprehensive network penetration. Persistent access established for ongoing intelligence collection." +
      (targetIntel
        ? " Exfiltrated data confirms prior assessment of target intent: " +
          targetIntel +
          "."
        : " Data exploitation in progress — initial analysis reveals " +
          pick(DEBRIEF_EVIDENCE).toLowerCase() +
          ".") +
      " Vigil SIGINT division has been briefed on the new collection capability. Intel coverage: " +
      v.intelCoverage +
      "%."
    : "Cyber operation detected and contained by " +
      v.orgName +
      "'s defensive capabilities within their " +
      v.city +
      " infrastructure." +
      (counterIntel
        ? " Counter-intrusion risk assessment (" +
          counterIntel +
          ") proved accurate."
        : "") +
      " Target network has been hardened. Access vector " +
      implantName +
      " is burned and cannot be reused." +
      (v.intelCoverage < 60
        ? " Intel coverage was only " +
          v.intelCoverage +
          "% — insufficient reconnaissance of target's defensive posture."
        : "") +
      " Recommend alternative collection approaches for this target in the " +
      v.theater +
      " theater.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  HOSTAGE RESCUE — Detailed climax
// =====================================================================

DEBRIEF_GENERATORS.HOSTAGE_RESCUE = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var teamSize =
    v.totalPersonnel && v.totalPersonnel > 0
      ? Math.min(v.totalPersonnel, randInt(16, 32))
      : randInt(16, 32);
  var entries = [];

  // Pull real intel
  var hostageCountIntel = getIntel(v, "HOSTAGE_COUNT");
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var entryPointsIntel = getIntel(v, "ENTRY_POINTS");
  var hostageCondIntel =
    getIntel(v, "HOSTAGE_CONDITION") || getIntel(v, "ASSET_CONDITION");
  var captorDemandsIntel = getIntel(v, "CAPTOR_DEMANDS");
  var captorIdIntel = getIntel(v, "CAPTOR_ID");
  var qrfIntel = getIntel(v, "QRF_PROXIMITY");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var hostageLocIntel =
    getIntel(v, "HOSTAGE_LOCATION") || getIntel(v, "ASSET_LAST_KNOWN");
  var compromiseIntel = getIntel(v, "COMPROMISE_VECTOR");
  var damageIntel = getIntel(v, "DAMAGE_ASSESSMENT");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 3) : "";

  // Adapt for ASSET_COMPROMISED — rescue a Vigil source, not civilian hostages
  var isAssetRecovery = v.threatType === "ASSET_COMPROMISED";
  var hostageCount = isAssetRecovery ? 1 : randInt(3, 12);
  var cargoLabel = isAssetRecovery
    ? "compromised Vigil asset"
    : hostageCount + " hostages";
  var sourceCode = isAssetRecovery ? generateSourceCode() : null;
  var transitNote = v.transitHours
    ? " Transit: " + v.transitHours + " hours."
    : "";

  if (isAssetRecovery) {
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(0),
      type: "normal",
      text:
        (v.threatUrgent ? "FLASH priority: " : "") +
        v.primaryAsset +
        " deployed from " +
        v.primaryBase +
        ". " +
        teamSize +
        "-operator rescue force." +
        transitNote +
        " Vigil source " +
        sourceCode +
        " confirmed detained by " +
        v.orgName +
        " in " +
        v.city +
        ", " +
        v.country +
        "." +
        (compromiseIntel
          ? " Compromise vector: " + compromiseIntel + "."
          : " Asset is being interrogated — recovery before full exploitation is critical.") +
        (v.confidence ? " Operation confidence: " + v.confidence + "%." : ""),
    });
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(6),
      type: "normal",
      text:
        "Counter-intelligence damage assessment initiated." +
        (damageIntel ? " Current assessment: " + damageIntel + "." : "") +
        " Vigil providing real-time intelligence on asset location and guard rotation. ISR feed active on detention site." +
        (hostageCondIntel ? " Asset condition: " + hostageCondIntel + "." : ""),
    });
  } else {
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(0),
      type: "normal",
      text:
        (v.threatUrgent ? "FLASH priority: " : "") +
        v.primaryAsset +
        " deployed from " +
        v.primaryBase +
        ". " +
        teamSize +
        "-operator rescue force." +
        transitNote +
        " " +
        (hostageCountIntel
          ? hostageCountIntel
          : hostageCount + " hostages confirmed held by " + v.orgName) +
        " in " +
        v.city +
        ", " +
        v.country +
        "." +
        (v.confidence ? " Operation confidence: " + v.confidence + "%." : ""),
    });
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(6),
      type: "normal",
      text:
        "Crisis negotiation cell established. Vigil providing real-time intelligence on hostage conditions and captor behavior. ISR feed active on target building." +
        (hostageCondIntel
          ? " Hostage condition: " + hostageCondIntel + "."
          : "") +
        (captorIdIntel ? " Captor identification: " + captorIdIntel + "." : ""),
    });
  }
  var entryNote = entryPointsIntel
    ? entryPointsIntel
    : randInt(3, 5) + " entry points identified";
  var guardCount = guardForceIntel
    ? guardForceIntel
    : randInt(4, 10) +
      " armed captors identified via thermal and audio surveillance";
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Rescue plan finalized. " +
      entryNote +
      ". Sniper teams positioned on " +
      randInt(2, 4) +
      " rooftops. Emergency medical team staged " +
      randInt(200, 500) +
      "m from the objective." +
      (actualGear ? " Assault loadout: " + actualGear + "." : "") +
      (qrfIntel ? " QRF assessment: " + qrfIntel + "." : "") +
      (captorDemandsIntel
        ? " Captor demands assessment: " + captorDemandsIntel + "."
        : ""),
  });
  var hostageLocStr = hostageLocIntel
    ? hostageLocIntel
    : pick([
        "second floor, east wing",
        "ground floor, central room",
        "basement level",
        "third floor, rear",
      ]);
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "ISR confirmed hostage location: " +
      hostageLocStr +
      ". " +
      guardCount +
      "." +
      (commsIntel ? " Captor communications: " + commsIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      "Team " +
      callsign +
      " at final assault positions. All elements report ready. " +
      (isAssetRecovery
        ? "ISR maintaining continuous track on detention site."
        : "Negotiation team maintaining contact with captors as cover for assault preparation.") +
      " Intel coverage: " +
      v.intelCoverage +
      "%.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text:
        '"GREEN GREEN GREEN." Simultaneous breach on all entry points. Flashbangs deployed. ' +
        pick(SOF_BREACH_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 1),
      type: "critical",
      text: 'Entry hall. Two captors scrambled for weapons. Point man\'s IR laser found the first — double tap, center mass. He dropped. Second hostile raised an AK. Number two operator put three rounds through his chest before the muzzle came level. "FRIENDLIES, STAY DOWN." Screaming from the hostages on the floor.',
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "critical",
      text: pick(SOF_ROOM_CLEAR) + " Clearing toward hostage holding area.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "critical",
      text: pick(SOF_SNIPER_ENGAGEMENT),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 4),
      type: "critical",
      text:
        "Hostage room. Helmet cam showed the door — reinforced, barricaded from inside. Breacher placed a water charge to minimize fragmentation. BANG. Door blew in. " +
        randInt(2, 4) +
        " captors guarding hostages — one reached for a detonator on the table. Sniper took the shot through the window simultaneously with the breach team entry. Round caught the man's hand. Detonator skittered across the floor. Operators engaged the remaining captors — controlled pairs, all targets down in under two seconds. All " +
        hostageCount +
        " hostages recovered alive.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 6),
      type: "normal",
      text:
        '"Precious cargo secure. ' +
        hostageCount +
        ' souls, all breathing." Hostages evacuated to casualty collection point. ' +
        randInt(0, 3) +
        " minor injuries — shock and minor abrasions. No life-threatening conditions.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 15),
      type: "normal",
      text:
        "Building secured. " +
        randInt(4, 8) +
        " hostile KIA. " +
        randInt(0, 2) +
        " captured alive. EOD team cleared " +
        randInt(1, 3) +
        " IEDs that had been rigged to the hostage room — the captors were prepared to kill the hostages if the rescue took ten seconds longer.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        pick(DEBRIEF_EXFIL) +
        ". Hostages transferred to medical facility. All operators accounted for — zero friendly casualties.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text: '"GREEN GREEN GREEN." Breach initiated. ' + pick(SOF_BREACH_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 1),
      type: "critical",
      text:
        "Immediate heavy contact in the entry hallway. PKM fire from a prepared position shredded the doorframe. Point man took fragments to the plate carrier — knocked back but functional. Team returned fire, suppressed. " +
        pick(DEBRIEF_COMPROMISE) +
        ". Captors were alerted.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "critical",
      text:
        pick(SOF_ROOM_CLEAR) +
        " But the clock was running — captors knew the team was inside.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "failure",
      text:
        "Explosion in the hostage holding area. Captors detonated a prepared charge. The blast wave knocked the assault team flat in the corridor. Ears ringing, dust everywhere. Team fought through to the room — " +
        randInt(1, Math.max(1, Math.floor(hostageCount / 3))) +
        " hostages killed, " +
        randInt(1, 3) +
        " critically wounded. Remaining hostages recovered alive with injuries.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 5),
      type: "critical",
      text:
        "Remaining captors engaged in a last stand from a back room. " +
        pick(SOF_ROOM_CLEAR) +
        " All captors neutralized.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 8),
      type: "normal",
      text:
        "Building secured. " +
        randInt(1, 2) +
        " operators WIA. Emergency medical evacuation for wounded hostages and team members. Multiple ambulances on scene.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text: "Scene secured. Evidence preservation underway. Casualty notification process initiated for hostage fatalities.",
    });
  }

  var assessment = success
    ? "Hostage rescue in " +
      v.city +
      ", " +
      v.country +
      " was a complete success. All " +
      hostageCount +
      " hostages recovered alive. " +
      v.orgName +
      " cell eliminated. The operation demonstrated precise coordination between ISR, sniper, and assault elements. Zero friendly KIA."
    : "Hostage rescue in " +
      v.city +
      " resulted in hostage fatalities. Captors executed their contingency plan before the assault team could secure the holding area. " +
      v.orgName +
      "'s defensive preparations exceeded intelligence estimates. Vigil is conducting a review of the intelligence gap.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  COUNTER TERROR
// =====================================================================

DEBRIEF_GENERATORS.COUNTER_TERROR = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var raidLocations = randInt(2, 5);
  var entries = [];

  // Pull real intel
  var memberCountIntel = getIntel(v, "MEMBER_COUNT");
  var cellSize = memberCountIntel ? randInt(4, 12) : randInt(4, 12);
  var attackPlanIntel = getIntel(v, "ATTACK_PLANNING");
  var weaponsCacheIntel = getIntel(v, "WEAPONS_CACHE");
  var leadershipIntel =
    getIntel(v, "LEADERSHIP_ID") || getIntel(v, "CAPTOR_ID");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var networkIntel =
    getIntel(v, "SUPPORT_NETWORK") || getIntel(v, "NETWORK_MAPPING");
  var targetIntentIntel = getIntel(v, "TARGET_INTENT");
  var hostageCountIntel = getIntel(v, "HOSTAGE_COUNT");
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";
  var transitNote = v.transitHours
    ? " Transit time: " + v.transitHours + " hours."
    : "";

  var isHostage =
    v.threatType === "HOSTAGE_CRISIS" || v.threatType === "HOSTAGE_DOMESTIC";
  var hostageCount = isHostage ? randInt(4, 15) : 0;

  if (isHostage) {
    entries.push({
      time: dayLabel(-3) + " " + zuluTime(0),
      type: "normal",
      text:
        "Vigil intelligence identified " +
        v.orgName +
        " cell holding " +
        (hostageCountIntel ? hostageCountIntel : hostageCount + " hostages") +
        " across " +
        raidLocations +
        " locations in " +
        v.city +
        ", " +
        v.country +
        ". " +
        (memberCountIntel
          ? "Cell assessment: " + memberCountIntel + "."
          : "Cell estimated at " + cellSize + " members.") +
        " " +
        v.primaryAsset +
        " tasked for coordinated hostage recovery operation." +
        transitNote +
        (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
    });
    entries.push({
      time: dayLabel(-2) + " " + zuluTime(0),
      type: "normal",
      text:
        "Surveillance established. Hostage positions confirmed at " +
        raidLocations +
        " sites via thermal and audio surveillance. Crisis negotiation team maintaining contact with captors to buy time." +
        (guardForceIntel
          ? " Armed subject assessment: " + guardForceIntel + "."
          : ""),
    });
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(0),
      type: "normal",
      text:
        (commsIntel
          ? "SIGINT collection: " + commsIntel + ". "
          : "SIGINT intercept indicates ") +
        v.orgName +
        " cell growing agitated — execution timeline may be imminent. Simultaneous rescue operation authorized. All assault elements briefed: hostage safety is the absolute priority.",
    });
  } else {
    entries.push({
      time: dayLabel(-3) + " " + zuluTime(0),
      type: "normal",
      text:
        "Vigil intelligence identified " +
        v.orgName +
        " cell preparing an attack in " +
        v.city +
        ", " +
        v.country +
        ". " +
        (memberCountIntel
          ? "Cell assessment: " + memberCountIntel + "."
          : "Cell estimated at " + cellSize + " members.") +
        " " +
        v.primaryAsset +
        " tasked for counter-terrorism operation." +
        transitNote +
        (v.confidence ? " Vigil confidence: " + v.confidence + "%." : "") +
        " Intel coverage: " +
        v.intelCoverage +
        "%.",
    });
    entries.push({
      time: dayLabel(-2) + " " + zuluTime(0),
      type: "normal",
      text:
        "Surveillance established on " +
        randInt(3, 6) +
        " known cell members. Pattern-of-life analysis underway. " +
        randInt(2, 4) +
        " safe houses identified across " +
        v.city +
        "." +
        (leadershipIntel
          ? " Leadership identification: " + leadershipIntel + "."
          : "") +
        (networkIntel ? " Network assessment: " + networkIntel + "." : ""),
    });
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(0),
      type: "normal",
      text:
        (attackPlanIntel
          ? "Attack planning intel: " + attackPlanIntel + ". "
          : "SIGINT intercept confirms attack timeline — ") +
        v.orgName +
        " cell plans to execute within " +
        randInt(24, 72) +
        " hours. " +
        (weaponsCacheIntel
          ? "Weapons cache confirmed: " + weaponsCacheIntel + "."
          : "Attack materiel confirmed at location " +
            pick(["Alpha", "Bravo", "Charlie"]) +
            ".") +
        " Coordinated takedown authorized.",
    });
  }
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "Team " +
      callsign +
      " elements positioned at " +
      raidLocations +
      " target locations across " +
      v.city +
      ". " +
      (actualGear ? "Loadout: " + actualGear + ". " : "") +
      "Local security forces briefed on cordon responsibilities. Medical and EOD teams staged.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        '"All stations: execute." Simultaneous raids across ' +
        raidLocations +
        " locations. Doors breached at " +
        String(raidLocations) +
        " sites within a 30-second window.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 1),
      type: "critical",
      text:
        "Location Alpha: " +
        pick(SOF_BREACH_DETAIL) +
        " " +
        randInt(2, 4) +
        " suspects inside — one dove for a weapon under the mattress. Operator pinned his arm, kicked the pistol away. All suspects flex-cuffed face-down.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "critical",
      text:
        "Location Bravo: hostile opened fire through the door as the team stacked. Rounds punching through the wood. Team pulled offline. Flashbang through the window. Re-entry. " +
        randInt(1, 3) +
        " hostile KIA. One suspect hiding in a closet — dragged out and detained.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 5),
      type: "critical",
      text:
        "Location Charlie: " +
        randInt(1, 3) +
        " suspects surrendered immediately upon seeing the assault team. Hands up before the first operator was fully through the door. Apartment full of bombmaking materials — wires, detonators, bags of ammonium nitrate.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 20),
      type: "normal",
      text:
        "All locations secured. " +
        randInt(6, 12) +
        " total suspects detained. " +
        v.orgName +
        " cell leadership — including the " +
        (isHostage ? "hostage-taker commander" : "attack planner") +
        " — in custody. Helmet cam footage captured everything for prosecution.",
    });
    if (isHostage) {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(1),
        type: "normal",
        text:
          "All " +
          hostageCount +
          " hostages recovered alive across " +
          raidLocations +
          " sites. Medical teams assessed all hostages — minor injuries and psychological trauma but no life-threatening conditions. EOD cleared " +
          randInt(1, 3) +
          " IEDs rigged near hostage positions.",
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(1),
        type: "normal",
        text:
          "Attack materiel recovered: " +
          pick(DEBRIEF_EVIDENCE) +
          ". EOD team rendered safe " +
          randInt(1, 4) +
          " IEDs found ready for deployment. Planned attack disrupted prior to execution.",
      });
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(3),
      type: "normal",
      text:
        "All detained subjects transferred to secure facility for interrogation. Initial interrogation producing intelligence on wider " +
        v.orgName +
        " network. No civilian casualties. No friendly casualties.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        '"All stations: execute." Raids initiated simultaneously. However, ' +
        pick(DEBRIEF_COMPROMISE) +
        ".",
    });
    if (isHostage) {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, 2),
        type: "critical",
        text:
          "Location Alpha: " +
          pick(SOF_BREACH_DETAIL) +
          " Captors triggered prepared charges upon hearing the assault. " +
          randInt(1, Math.max(1, Math.floor(hostageCount / 4))) +
          " hostages killed in the blast. Remaining hostages pulled from the site — alive but injured.",
      });
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, 5),
        type: "failure",
        text:
          "Location Bravo: captors fled with " +
          randInt(1, 3) +
          " hostages before the team could breach. Vehicle spotted leaving the rear exit. Pursuit initiated but lost in urban traffic.",
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, 2),
        type: "critical",
        text:
          "Location Alpha: " +
          pick(SOF_BREACH_DETAIL) +
          " Premises empty — recently vacated. Warm food on the table, electronics wiped. Smell of soldering flux — bombmaking happened here.",
      });
      entries.push({
        time: dayLabel(0) + " " + zuluMinOffset(0, 5),
        type: "failure",
        text:
          "Location Bravo: brief contact. " +
          randInt(1, 2) +
          " low-level operatives detained after a scuffle in the stairwell. One tried to swallow a SIM card. Cell leadership not present at any target location.",
      });
    }
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 10),
      type: "failure",
      text: "Location Charlie: door was booby-trapped. Breacher detected the tripwire — EOD called in. By the time the room was cleared, any occupants were long gone. Back window open, fire escape ladder deployed.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 30),
      type: "normal",
      text:
        "Sweep of all target locations complete. Only " +
        randInt(1, 3) +
        " of " +
        cellSize +
        " cell members apprehended. Core network — including the " +
        (isHostage ? "hostage-taker leadership" : "attack planner") +
        " — has dispersed." +
        (isHostage
          ? " Some hostages remain unaccounted for."
          : " Attack materiel not recovered."),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(4),
      type: "normal",
      text:
        v.orgName +
        " posted a statement on encrypted channels" +
        (isHostage
          ? " threatening to execute remaining hostages unless demands are met."
          : " claiming credit for evading the operation. Attack timeline may have been accelerated or redirected to alternate target."),
    });
  }

  var assessment;
  if (isHostage && success) {
    assessment =
      "Counter-terrorism operation in " +
      v.city +
      " successfully rescued all " +
      hostageCount +
      " hostages and dismantled " +
      v.orgName +
      "'s cell. Coordinated simultaneous raids across " +
      raidLocations +
      " sites achieved complete surprise. All hostages recovered alive. Detained subjects providing intelligence under interrogation.";
  } else if (isHostage) {
    assessment =
      "Counter-terrorism operation in " +
      v.city +
      " resulted in hostage casualties. " +
      v.orgName +
      "'s cell was partially alerted before simultaneous breach could be executed. Some hostages remain unaccounted for. Vigil is reviewing the intelligence and operational timing for lessons learned.";
  } else if (success) {
    assessment =
      "Counter-terrorism operation in " +
      v.city +
      " successfully dismantled " +
      v.orgName +
      "'s operational cell. Imminent attack disrupted. Detained subjects providing intelligence under interrogation. Threat to " +
      v.theater +
      " theater reduced.";
  } else {
    assessment =
      "Counter-terrorism operation failed to neutralize " +
      v.orgName +
      "'s core leadership. The cell was alerted and dispersed before takedown. Attack materiel remains unrecovered — the threat is still active. Enhanced surveillance and alternative approaches recommended.";
  }

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DIPLOMATIC RESPONSE
// =====================================================================

DEBRIEF_GENERATORS.DIPLOMATIC_RESPONSE = function (op, v, success) {
  var entries = [];

  // Pull real intel
  var commandIntel = getIntel(v, "COMMAND_STRUCTURE");
  var strategicIntel =
    getIntel(v, "STRATEGIC_INTENT") || getIntel(v, "ESCALATION_POSTURE");
  var commsIntel = getIntel(v, "COMMS_PATTERN");
  var forceIntel = getIntel(v, "FORCE_DISPOSITION");

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-8),
    type: "normal",
    text:
      v.primaryAsset +
      " dispatched to " +
      v.city +
      ", " +
      v.country +
      " to manage diplomatic situation involving " +
      v.orgName +
      ". Vigil situation brief transmitted via secure channel." +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : "") +
      (v.transitHours ? " Transit: " + v.transitHours + " hours." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Arrived in " +
      v.city +
      ". Initial coordination with US Embassy staff and allied diplomatic representatives. Media monitoring activated — " +
      randInt(3, 8) +
      " international outlets covering the situation." +
      (strategicIntel ? " Strategic assessment: " + strategicIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "Secure communications established with Washington. Vigil providing real-time intelligence support on " +
      v.orgName +
      "'s political connections and leverage points." +
      (commandIntel ? " Command structure intel: " + commandIntel + "." : "") +
      " Intel coverage: " +
      v.intelCoverage +
      "%.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Initial meeting with " +
        v.country +
        " counterparts. Tone: " +
        pick([
          "cautious but receptive",
          "tense but professional",
          "unexpectedly cooperative",
        ]) +
        ". Key demands presented through back-channel.",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Back-channel negotiations progressing. " +
        v.country +
        " delegation responsive to intelligence package demonstrating " +
        v.orgName +
        "'s activities. Framework for cooperation emerging.",
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(0),
      type: "critical",
      text:
        "Agreement reached. " +
        v.country +
        " has agreed to terms that protect US interests and address the " +
        v.orgName +
        " situation. Public-facing statement coordinated. Crisis de-escalated.",
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(8),
      type: "normal",
      text:
        "Intelligence gathered during negotiations forwarded to Vigil. " +
        v.country +
        " shared " +
        randInt(2, 5) +
        " previously unknown data points on " +
        v.orgName +
        "'s regional operations.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Initial meeting with " +
        v.country +
        " counterparts. Tone: " +
        pick([
          "hostile and dismissive",
          "polite but non-committal",
          "deeply suspicious of US intentions",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Negotiations stalled. " +
        v.country +
        " delegation refusing to engage on key issues. Media coverage intensifying — leaked details are shaping public opinion against US position.",
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(0),
      type: "failure",
      text:
        "Diplomatic effort in " +
        v.city +
        " collapsed. " +
        v.country +
        " has issued a public condemnation of US involvement. Allied partners expressing concern. The situation has deteriorated beyond the scope of the original mission.",
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(8),
      type: "normal",
      text:
        v.primaryAsset +
        " recalled. Damage assessment: bilateral relations with " +
        v.country +
        " degraded. " +
        v.orgName +
        " likely emboldened by the diplomatic failure.",
    });
  }

  var assessment = success
    ? "Diplomatic response in " +
      v.city +
      " achieved de-escalation. US interests in " +
      v.theater +
      " theater preserved. Relations with " +
      v.country +
      " stabilized. Intelligence gathered during negotiations has been forwarded to Vigil for integration into threat models."
    : "Diplomatic response failed. Relations with " +
      v.country +
      " have deteriorated further. Theater risk in " +
      v.theater +
      " increased. Recommend alternative approaches including economic leverage and allied coordination.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  INTEL COLLECTION
// =====================================================================

DEBRIEF_GENERATORS.INTEL_COLLECTION = function (op, v, success) {
  var sourceCode = generateSourceCode();
  var entries = [];

  // Pull real intel
  var locationIntel =
    getIntel(v, "CELL_LOCATION") || getIntel(v, "ORG_LOCATION");
  var networkIntel =
    getIntel(v, "NETWORK_MAPPING") || getIntel(v, "SUPPORT_NETWORK");
  var leadershipIntel =
    getIntel(v, "LEADERSHIP_ID") || getIntel(v, "COMMAND_STRUCTURE");
  var commsIntel =
    getIntel(v, "INTERNAL_COMMS") || getIntel(v, "COMMS_PATTERN");
  var transitNote = v.transitHours
    ? " Transit: " + v.transitHours + " hours."
    : "";

  entries.push({
    time: dayLabel(-2) + " " + zuluTime(0),
    type: "normal",
    text:
      v.primaryAsset +
      " deployed to " +
      v.city +
      ", " +
      v.country +
      "." +
      transitNote +
      " Cover identity established. Target: " +
      v.orgName +
      " network intelligence collection." +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : "") +
      (locationIntel ? " Prior location intel: " + locationIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Case officer established operational base in " +
      v.city +
      ". Counter-surveillance route validated. No hostile indicators detected. Source " +
      sourceCode +
      " contacted via dead drop — meeting arranged." +
      (v.hasCovert ? " All assets operating under non-official cover." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Pre-meeting surveillance of rendezvous site. " +
      randInt(2, 4) +
      " counter-surveillance passes. Site assessed as clean. Meeting location: " +
      pick([
        "hotel lobby",
        "public park",
        "commercial café",
        "underground parking structure",
        "private residence",
      ]) +
      ". Intel coverage: " +
      v.intelCoverage +
      "%.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Meeting with source " +
        sourceCode +
        ". Source provided verbal debrief on " +
        v.orgName +
        "'s current activities, leadership changes, and upcoming operational plans." +
        (leadershipIntel
          ? " Corroborated existing leadership intel: " + leadershipIntel + "."
          : ""),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "critical",
      text:
        "Source " +
        sourceCode +
        " delivered physical materials: " +
        pick(DEBRIEF_EVIDENCE) +
        ". " +
        (networkIntel
          ? "Network intelligence confirmed: " + networkIntel + ". "
          : "") +
        "Intelligence corroborated by existing SIGINT intercepts. Assessed as high-confidence.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Follow-up meeting established for " +
        randInt(5, 14) +
        " days. Source recruited for ongoing reporting with monthly contact schedule. Cover story intact. No counter-intelligence indicators detected." +
        (commsIntel
          ? " Communications protocol established matching existing intercept profile."
          : ""),
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Case officer departed " +
        v.city +
        " via commercial cover. Materials transmitted to Vigil via secure channel. Source " +
        sourceCode +
        " assessed as reliable — graded B-2 on the admiralty scale. Intel coverage now " +
        Math.min(100, v.intelCoverage + randInt(10, 25)) +
        "%.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Case officer arrived at meeting site. Source " +
        sourceCode +
        " " +
        pick([
          "45 minutes late and visibly agitated",
          "failed to appear — no signal at dead drop",
          "sent an intermediary with a warning message",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "failure",
      text:
        pick(DEBRIEF_COMPROMISE) +
        ". Source " +
        sourceCode +
        " " +
        pick([
          "is assessed as compromised — likely under hostile control",
          "may have been doubled by " + v.orgName + "'s counter-intelligence",
          "sent a distress signal indicating imminent danger",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(3),
      type: "normal",
      text:
        "Case officer executed emergency exfiltration protocol. Left " +
        v.city +
        " via " +
        pick([
          "overland route to border crossing",
          "commercial flight under backup identity",
          "maritime extraction from coastal rendezvous",
        ]) +
        ". No pursuit detected but counter-intelligence exposure assessed as high.",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Source " +
        sourceCode +
        " status: unknown. All associated sub-sources placed on administrative hold. " +
        v.orgName +
        "'s counter-intelligence capabilities in " +
        v.country +
        " have been reassessed upward. Network requires reconstruction. Intel coverage remains at " +
        v.intelCoverage +
        "%.",
    });
  }

  var assessment = success
    ? "Intelligence collection against " +
      v.orgName +
      " in " +
      v.city +
      " was successful. Source " +
      sourceCode +
      " is producing high-value reporting. Vigil has integrated new intelligence into threat models for " +
      v.theater +
      " theater." +
      (v.intelCoverage < 70
        ? " Collection should continue — current coverage is " +
          v.intelCoverage +
          "%, below threshold for confident operational commitment."
        : " Intel coverage now sufficient for high-confidence operational planning.") +
      " Sustained collection recommended."
    : "Intelligence collection operation in " +
      v.city +
      " compromised. Source " +
      sourceCode +
      " is presumed lost. " +
      v.orgName +
      "'s counter-intelligence capabilities in " +
      v.country +
      " exceeded estimates." +
      (v.intelCoverage < 50
        ? " Critical — intel coverage is only " +
          v.intelCoverage +
          "%. Alternative collection vectors urgently needed."
        : "") +
      " All collection assets in theater placed under review.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DRONE STRIKE
// =====================================================================

DEBRIEF_GENERATORS.DRONE_STRIKE = function (op, v, success) {
  var entries = [];
  // Use actual munitions from asset equipment if available
  var assetMunitions = (v.equipment || []).filter(function (e) {
    return /Hellfire|GBU|JAGM|Paveway|JDAM|Harpoon|AGM|bomb|missile/i.test(e);
  });
  var munitionType =
    assetMunitions.length > 0
      ? pick(assetMunitions)
      : pick([
          "AGM-114R Hellfire",
          "GBU-39 Small Diameter Bomb",
          "AGM-179 JAGM",
          "GBU-12 Paveway II",
        ]);

  // Threat-context adaptation
  var isFacility =
    v.threatType === "MILITARY_TARGET" ||
    v.threatType === "STRATEGIC_TARGET" ||
    (v.threatType === "PROLIFERATOR" && v.programType !== "NETWORK");
  var isWMD = v.threatType === "PROLIFERATOR";
  var isProxy = v.threatType === "STATE_ACTOR" && v.activityType === "PROXY";
  var targetLabel = isFacility
    ? isWMD
      ? "WMD-related facility"
      : "military installation"
    : isWMD
      ? "proliferation logistics site"
      : isProxy
        ? (v.sponsor || "state") + "-backed proxy staging area"
        : "leadership";

  // Pull real intel
  var movementIntel = getIntel(v, "MOVEMENT_PATTERNS");
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var collateralIntel =
    getIntel(v, "COLLATERAL_RISK") || getIntel(v, "CIVILIAN_PROXIMITY");
  var facilityIntel =
    getIntel(v, "FACILITY_ID") ||
    getIntel(v, "TARGET_HARDENING") ||
    getIntel(v, "HARDENING_LEVEL");
  var airDefenseIntel = getIntel(v, "AIR_DEFENSE_POSTURE");
  var hvtIdIntel = getIntel(v, "HVT_IDENTITY") || getIntel(v, "LEADERSHIP_ID");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var actualSensors = (v.equipment || []).filter(function (e) {
    return /FLIR|infrared|radar|EO|IR|sensor|camera|optic/i.test(e);
  });
  var sensorStr =
    actualSensors.length > 0
      ? pickItems(actualSensors, 2)
      : "EO/IR and SIGINT collection";
  var transitNote = v.transitHours
    ? " Transit: " + v.transitHours + " hours."
    : "";

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-8),
    type: "normal",
    text:
      v.primaryAsset +
      " launched from " +
      v.primaryBase +
      ". Target package: " +
      v.orgName +
      " " +
      targetLabel +
      " in " +
      v.city +
      ", " +
      v.country +
      "." +
      transitNote +
      " Estimated time on station: " +
      randInt(8, 16) +
      " hours." +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Platform on station over " +
      v.city +
      ". Altitude: " +
      randInt(15, 25) +
      ",000ft. " +
      pick(DEBRIEF_WEATHER) +
      ". Sensor suite active — " +
      sensorStr +
      "." +
      (airDefenseIntel
        ? " Air defense environment: " + airDefenseIntel + "."
        : ""),
  });

  if (isFacility) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-2),
      type: "normal",
      text:
        "Target facility under observation. " +
        (isWMD
          ? "MASINT sensors confirm chemical/radiological activity. "
          : "") +
        (facilityIntel ? "Facility assessment: " + facilityIntel + ". " : "") +
        "Tracking " +
        randInt(3, 8) +
        " personnel and " +
        randInt(1, 4) +
        " vehicles at the site. Facility layout confirmed against ISR imagery.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-1),
      type: "normal",
      text:
        "Target facility confirmed active — " +
        pick([
          "communications traffic originating from structure",
          "thermal signatures consistent with operational equipment",
          "vehicle movement pattern indicates shift change — personnel count confirmed",
        ]) +
        ". Strike authorization requested. Intel coverage: " +
        v.intelCoverage +
        "%.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-2),
      type: "normal",
      text:
        "Target compound under observation. " +
        (movementIntel
          ? "Pattern-of-life per Vigil collection: " + movementIntel + ". "
          : "Pattern-of-life monitoring established. ") +
        "Tracking " +
        randInt(3, 8) +
        " individuals at the site. " +
        (guardForceIntel ? "Security detail: " + guardForceIntel + ". " : "") +
        "Waiting for positive identification of " +
        (v.targetAlias || "HVT") +
        ".",
    });
    var pidMethod = hvtIdIntel
      ? hvtIdIntel
      : commsIntel
        ? "SIGINT — target communications confirmed at location"
        : pick([
            "facial recognition match at 94% confidence",
            "gait analysis consistent with known profile",
            "SIGINT — target's personal device confirmed at location",
            "multiple corroborating HUMINT sources",
          ]);
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-1),
      type: "normal",
      text:
        "PID confirmed: " +
        (v.targetAlias || "HVT") +
        " positively identified by " +
        pidMethod +
        ". Strike authorization requested. Intel coverage: " +
        v.intelCoverage +
        "%.",
    });
  }
  var collateralStr = collateralIntel
    ? collateralIntel
    : pick([
        "no civilians within blast radius",
        "one non-combatant structure adjacent, risk assessed as acceptable",
        "civilians cleared from the area in the last 30 minutes",
      ]);
  entries.push({
    time: dayLabel(0) + " " + zuluTime(0) + "-5min",
    type: "normal",
    text:
      "Strike authorization confirmed by operator. Collateral damage estimate reviewed — " +
      collateralStr +
      ". Weapons release authorized under Vigil Directive 3. " +
      munitionType +
      " selected.",
  });

  if (success) {
    if (isFacility) {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0),
        type: "critical",
        text:
          "Weapons release. " +
          randInt(2, 4) +
          "x " +
          munitionType +
          " away. Time of flight: " +
          randInt(15, 45) +
          " seconds. Multiple impacts on target facility. Direct hits on " +
          randInt(2, 4) +
          " designated aim points.",
      });
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+2min",
        type: "normal",
        text:
          "Post-strike observation. Facility " +
          (isWMD
            ? "destroyed. No secondary chemical release detected — clean destruction achieved."
            : "destroyed. Secondary explosions confirm ammunition or fuel storage. Structural collapse of primary buildings.") +
          " No movement at the target site.",
      });
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+15min",
        type: "normal",
        text:
          "BDA complete. Facility assessed as non-operational. " +
          randInt(3, 8) +
          " hostile casualties confirmed. Collateral damage: " +
          pick([
            "none observed",
            "minimal — perimeter wall of adjacent property damaged",
            "one non-target vehicle destroyed",
          ]) +
          ".",
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0),
        type: "critical",
        text:
          "Weapons release. " +
          randInt(1, 3) +
          "x " +
          munitionType +
          " away. Time of flight: " +
          randInt(15, 45) +
          " seconds. Impact. Direct hit on target structure. " +
          (v.targetAlias || "HVT") +
          " was in the building at time of impact.",
      });
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+2min",
        type: "normal",
        text: "Post-strike observation. Structure destroyed. Secondary explosion observed — probable weapons or ammunition storage. No movement at the target site.",
      });
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+15min",
        type: "normal",
        text:
          "BDA complete. Target " +
          (v.targetAlias || "HVT") +
          " assessed KIA with high confidence. " +
          randInt(2, 5) +
          " additional hostile casualties confirmed. Collateral damage: " +
          pick([
            "none observed",
            "minimal — adjacent wall damaged",
            "one non-target vehicle destroyed",
          ]) +
          ".",
      });
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        v.primaryAsset +
        " remained on station for " +
        randInt(1, 3) +
        " additional hours monitoring for hostile activity. " +
        v.orgName +
        "'s communications traffic from the area ceased completely. Platform returning to " +
        v.primaryBase +
        ".",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        "Weapons release. " +
        randInt(1, 2) +
        "x " +
        munitionType +
        " away. Impact on target coordinates. However — " +
        pick(DEBRIEF_COMPROMISE) +
        ".",
    });
    if (isFacility) {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+2min",
        type: "failure",
        text:
          "Post-strike observation: target facility partially damaged but hardened structures appear intact. " +
          (isWMD
            ? "Underground sections likely survived. CBRN monitoring activated."
            : "Key military structures withstood the strike — construction was more resilient than assessed."),
      });
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+30min",
        type: "normal",
        text:
          "BDA: partial damage to surface structures. " +
          randInt(1, 3) +
          " hostile casualties at site. Facility may remain operational. Collateral damage assessment: " +
          pick([
            "minimal",
            "under review",
            "one civilian structure within blast radius sustained damage",
          ]) +
          ".",
      });
    } else {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+2min",
        type: "failure",
        text:
          "Post-strike observation: target structure partially destroyed, but real-time sensor data indicates " +
          (v.targetAlias || "HVT") +
          " departed the compound " +
          randInt(10, 45) +
          " minutes prior to strike. Vehicle observed leaving the area shortly before weapons release.",
      });
      entries.push({
        time: dayLabel(0) + " " + zuluTime(0) + "+30min",
        type: "normal",
        text:
          "BDA: " +
          randInt(1, 3) +
          " hostile casualties at target site — none matching " +
          (v.targetAlias || "HVT") +
          "'s profile. Collateral damage assessment: " +
          pick([
            "minimal",
            "under review",
            "one civilian structure within blast radius sustained damage",
          ]) +
          ".",
      });
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        v.primaryAsset +
        (isFacility
          ? " maintained station for follow-up BDA. Facility shows signs of activity — emergency repairs may be underway. "
          : " maintaining station to track " +
            (v.targetAlias || "HVT") +
            "'s possible escape route. Target vehicle lost in urban environment. ") +
        "Platform returning to " +
        v.primaryBase +
        " at bingo fuel.",
    });
  }

  var assessment;
  if (isFacility && success) {
    assessment =
      "Drone strike destroyed " +
      v.orgName +
      "'s " +
      (isWMD ? "WMD-related facility" : "military installation") +
      " in " +
      v.city +
      ", " +
      v.country +
      ". " +
      (isWMD
        ? "CBRN assessment confirms clean destruction. Proliferation program significantly degraded."
        : "Military capability in the area significantly reduced.") +
      " " +
      v.primaryAsset +
      " available for retasking.";
  } else if (isFacility) {
    assessment =
      "Drone strike achieved only partial damage to " +
      v.orgName +
      "'s " +
      (isWMD ? "WMD facility" : "military installation") +
      " in " +
      v.city +
      ". Hardened construction withstood the munitions. Follow-up strike or alternative approach recommended.";
  } else if (success) {
    assessment =
      "Drone strike on " +
      v.orgName +
      " in " +
      v.city +
      ", " +
      v.country +
      " achieved target elimination. " +
      (v.targetAlias || "HVT") +
      " confirmed KIA. " +
      v.orgName +
      "'s leadership structure disrupted. SIGINT confirms network-wide communications disruption. " +
      v.primaryAsset +
      " available for retasking.";
  } else {
    assessment =
      "Drone strike failed to eliminate " +
      (v.targetAlias || "HVT") +
      ". Target departed the site prior to weapons release — possible early warning via counter-surveillance or compromised intelligence. The strike may have revealed Vigil's surveillance capability in " +
      v.country +
      ". Target expected to relocate and increase security posture.";
  }

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  HVT ELIMINATION
// =====================================================================

DEBRIEF_GENERATORS.HVT_ELIMINATION = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var teamSize =
    v.totalPersonnel && v.totalPersonnel > 0
      ? Math.min(v.totalPersonnel, randInt(12, 24))
      : randInt(12, 24);
  var entries = [];

  // Pull real intel
  var hvtIdIntel = getIntel(v, "HVT_IDENTITY") || getIntel(v, "LEADERSHIP_ID");
  var movementIntel = getIntel(v, "MOVEMENT_PATTERNS");
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var escapesIntel = getIntel(v, "ESCAPE_ROUTES");
  var collateralIntel = getIntel(v, "COLLATERAL_RISK");
  var networkIntel =
    getIntel(v, "HVT_NETWORK") || getIntel(v, "SUPPORT_NETWORK");
  var commandIntel = getIntel(v, "COMMAND_STRUCTURE");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";
  var transitNote = v.transitHours
    ? " Transit: " + v.transitHours + " hours."
    : "";

  entries.push({
    time: dayLabel(-2) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil issued kill/capture authorization for " +
      (v.targetAlias || "HVT") +
      ", senior " +
      v.orgName +
      " operative, located in " +
      v.city +
      ", " +
      v.country +
      ". " +
      v.primaryAsset +
      " assigned. " +
      teamSize +
      "-man kill team." +
      transitNote +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : "") +
      (hvtIdIntel ? " Target identification: " + hvtIdIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Target surveillance package activated. " +
      (movementIntel
        ? "Pattern of life: " + movementIntel + ". "
        : (v.targetAlias || "HVT") +
          "'s residence, known associates, and pattern-of-life mapped. ") +
      "Positive ID established via " +
      (commsIntel
        ? "SIGINT intercept: " + commsIntel
        : pick([
            "long-range photography",
            "SIGINT device signature",
            "HUMINT source corroboration",
          ])) +
      "." +
      (networkIntel ? " Target network: " + networkIntel + "." : "") +
      (escapesIntel ? " Known escape routes: " + escapesIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-6),
    type: "normal",
    text:
      "Team " +
      callsign +
      " staged at forward position. " +
      weather +
      ". " +
      (actualGear ? "Primary weapons: " + actualGear + ". " : "") +
      "ISR confirms target at " +
      pick([
        "primary residence",
        "known associate's compound",
        "commercial property used as office",
      ]) +
      ". Intel coverage: " +
      v.intelCoverage +
      "%.",
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text: pick(SOF_APPROACH),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      "All teams in position. Overwatch confirms " +
      (guardForceIntel
        ? guardForceIntel + "."
        : randInt(3, 8) + " personnel at target location.") +
      " " +
      (v.targetAlias || "HVT") +
      ' positively identified on thermal. "We have eyes on JACKPOT."',
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text: '"Execute." ' + pick(SOF_BREACH_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 1),
      type: "critical",
      text: pick(SOF_GROUND_FLOOR_CLEAR),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "critical",
      text: pick(SOF_ROOM_CLEAR),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "critical",
      text: pick(SOF_SNIPER_ENGAGEMENT),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 4),
      type: "critical",
      text: pick(SOF_UPPER_FLOOR_CLEAR),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 6),
      type: "critical",
      text:
        "Target room. " +
        (v.targetAlias || "HVT") +
        " identified by the IR strobe on the helmet cam. Target reached for a weapon under the desk. Point man didn't hesitate — " +
        randInt(2, 4) +
        ' rounds center mass. Target slumped forward. "JACKPOT is EKIA." Biometric confirmation initiated — fingerprints and facial match: positive.',
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 12),
      type: "normal",
      text: pick(SOF_SSE),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 25),
      type: "normal",
      text:
        "SSE complete. Compound secured. " +
        randInt(5, 9) +
        " hostile KIA total. " +
        randInt(0, 3) +
        " detained. All team members accounted for.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        pick(DEBRIEF_EXFIL) +
        ". " +
        (v.targetAlias || "HVT") +
        "'s remains recovered for DNA confirmation. Zero friendly casualties.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text: '"Execute." ' + pick(SOF_BREACH_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "critical",
      text: pick(SOF_ROOM_CLEAR),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "failure",
      text: pick(SOF_FAILURE_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 5),
      type: "failure",
      text:
        pick(SOF_ROOM_CLEAR) +
        " But the compound is emptying. " +
        (v.targetAlias || "HVT") +
        " not found at expected location.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 8),
      type: "failure",
      text:
        "Full compound sweep complete. " +
        (v.targetAlias || "HVT") +
        " is not present. Evidence suggests departure via " +
        pick([
          "underground tunnel system",
          "concealed vehicle exit",
          "rooftop escape to adjacent building",
        ]) +
        " within minutes of team arrival. Security was tighter than intelligence predicted.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 12),
      type: "normal",
      text:
        pick(SOF_SNIPER_ENGAGEMENT) +
        " Hostile reinforcements arriving from the east.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 20),
      type: "normal",
      text:
        "Emergency extraction. " +
        randInt(1, 3) +
        " operators WIA. " +
        pick(DEBRIEF_EXFIL) +
        ". Target remains at large.",
    });
  }

  var assessment = success
    ? "HVT elimination operation " +
      v.codename +
      " achieved primary objective. " +
      (v.targetAlias || "HVT") +
      " — senior " +
      v.orgName +
      " operative — confirmed EKIA with biometric verification. Sensitive materials recovered. " +
      v.orgName +
      "'s leadership structure in " +
      v.city +
      " decapitated."
    : "HVT elimination failed. " +
      (v.targetAlias || "HVT") +
      " evaded the assault team, likely via a pre-prepared escape route. " +
      v.orgName +
      "'s counter-intelligence in " +
      v.country +
      " reassessed as highly capable. Target will increase security posture. Vigil recommends alternative approach.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  HVT CAPTURE
// =====================================================================

DEBRIEF_GENERATORS.HVT_CAPTURE = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var teamSize =
    v.totalPersonnel && v.totalPersonnel > 0
      ? Math.min(v.totalPersonnel, randInt(16, 28))
      : randInt(16, 28);
  var entries = [];

  // Pull real intel
  var hvtIdIntel = getIntel(v, "HVT_IDENTITY") || getIntel(v, "LEADERSHIP_ID");
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var movementIntel = getIntel(v, "MOVEMENT_PATTERNS");
  var escapesIntel = getIntel(v, "ESCAPE_ROUTES");
  var commandIntel = getIntel(v, "COMMAND_STRUCTURE");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil issued capture order for " +
      (v.targetAlias || "HVT") +
      ", " +
      v.orgName +
      " operative, in " +
      v.city +
      ", " +
      v.country +
      ". Priority: ALIVE for interrogation. " +
      v.primaryAsset +
      " assigned — " +
      teamSize +
      " operators." +
      (hvtIdIntel ? " Target ID: " + hvtIdIntel + "." : "") +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : "") +
      (commandIntel ? " Command authority: " + commandIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-6),
    type: "normal",
    text:
      "ISR confirms target at location. " +
      (actualGear ? "Loadout: " + actualGear + ". " : "") +
      "Non-lethal options prepared: flashbangs, CS gas, flex-cuffs. Designated marksmen briefed: weapon-arm shots only unless life-threatening situation." +
      (guardForceIntel ? " Security detail: " + guardForceIntel + "." : "") +
      (escapesIntel
        ? " Escape routes identified: " +
          escapesIntel +
          " — interdiction teams posted."
        : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "Team " +
      callsign +
      " at final assault position. " +
      (movementIntel
        ? "Pattern-of-life confirms target on site: " + movementIntel + ". "
        : "") +
      pick(SOF_APPROACH),
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text:
        '"Execute." CS gas deployed into target structure via windows. ' +
        pick(SOF_BREACH_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "critical",
      text:
        pick(SOF_GROUND_FLOOR_CLEAR) +
        " Operators calling targets before engaging — priority is keeping the principal alive.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "critical",
      text:
        pick(SOF_ROOM_CLEAR) + " Non-lethal protocols observed where possible.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 4),
      type: "critical",
      text: pick(SOF_UPPER_FLOOR_CLEAR),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 6),
      type: "critical",
      text:
        (v.targetAlias || "HVT") +
        " located in " +
        pick([
          "a locked interior room — could hear coughing from the CS gas",
          "attempting to destroy documents — shredder jammed, papers half-fed",
          "hiding in a concealed space behind a bookshelf — thermal signature gave him away",
        ]) +
        '. Target detained without lethal force. Flex-cuffed, hooded, and moved to collection point. "PRECIOUS CARGO SECURE."',
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 15),
      type: "normal",
      text: pick(SOF_SSE),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        (v.targetAlias || "HVT") +
        " transported to secure interrogation facility via " +
        pick(["helicopter", "armored vehicle convoy", "fixed-wing aircraft"]) +
        ". Initial health screening complete — no injuries. Zero friendly casualties.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text:
        '"Execute." ' +
        pick(SOF_BREACH_DETAIL) +
        " Target structure more fortified than intelligence indicated.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "critical",
      text: pick(SOF_ROOM_CLEAR),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "critical",
      text: pick(SOF_FAILURE_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 5),
      type: "failure",
      text:
        (v.targetAlias || "HVT") +
        " barricaded in an interior room. Bodyguards engaged the assault team — helmet cam showed muzzle flashes from two positions. During the firefight, target " +
        pick([
          "ingested a cyanide capsule — team medic unable to revive",
          "was caught in crossfire — GSW to the chest, pronounced dead on scene",
          "escaped through a concealed exit before the room was breached",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 10),
      type: "normal",
      text: pick(SOF_SNIPER_ENGAGEMENT),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 15),
      type: "normal",
      text:
        "Compound secured. " +
        randInt(2, 5) +
        " hostile KIA, " +
        randInt(0, 3) +
        " detained. " +
        (v.targetAlias || "HVT") +
        " " +
        pick([
          "confirmed dead — intelligence value lost",
          "at large — all checkpoints alerted",
          "critically wounded — medevac attempted but DOA at field hospital",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        pick(DEBRIEF_EXFIL) +
        ". Mission objective — live capture — not achieved.",
    });
  }

  var assessment = success
    ? "HVT capture operation " +
      v.codename +
      " successful. " +
      (v.targetAlias || "HVT") +
      " is in custody and available for interrogation. Initial exploitation expected to yield critical intelligence on " +
      v.orgName +
      "'s network, operational plans, and state sponsors. Vigil interrogation team en route."
    : "HVT capture operation failed to secure " +
      (v.targetAlias || "HVT") +
      " alive. The intelligence value of a live capture has been lost. Vigil recommends immediate exploitation of any recovered materials and reassessment of " +
      v.orgName +
      "'s security protocols.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  TARGETED KILLING
// =====================================================================

DEBRIEF_GENERATORS.TARGETED_KILLING = function (op, v, success) {
  var entries = [];
  var method = v.killingMethod
    ? v.killingMethod.desc
    : pick([
        "vehicle-borne IED on target route",
        "sniper team at overwatch position",
        "command-detonated device at chokepoint",
        "covert close-range engagement",
      ]);
  var methodLabel = v.killingMethod ? v.killingMethod.label : method;

  // Pull real intel
  var hvtIdIntel =
    getIntel(v, "HVT_IDENTITY") ||
    getIntel(v, "LEADERSHIP_ID") ||
    getIntel(v, "SUBJECT_ID");
  var movementIntel = getIntel(v, "MOVEMENT_PATTERNS");
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var collateralIntel = getIntel(v, "COLLATERAL_RISK");
  var networkIntel =
    getIntel(v, "HVT_NETWORK") || getIntel(v, "NETWORK_MAPPING");

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil authorized targeted killing of " +
      (v.targetAlias || "HVT") +
      ", " +
      v.orgName +
      " operative, in " +
      v.city +
      ", " +
      v.country +
      ". Method: " +
      method +
      ". " +
      v.primaryAsset +
      " tasked." +
      (hvtIdIntel ? " Target ID: " + hvtIdIntel + "." : "") +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Assets in position. " +
      (movementIntel
        ? "Pattern of life per Vigil collection: " + movementIntel + ". "
        : "Target's pattern of life monitored. ") +
      "Expected window of opportunity: " +
      pick([
        "morning commute between 0700-0800 local",
        "evening meeting at known associate's residence",
        "weekly visit to a commercial establishment",
        "departure from compound for scheduled event",
      ]) +
      "." +
      (guardForceIntel ? " Security detail: " + guardForceIntel + "." : ""),
  });
  var collateralStr = collateralIntel
    ? collateralIntel
    : pick([
        "No civilian bystanders within danger zone",
        "Minimal civilian presence — 2 non-combatants at edge of blast radius, acceptable under ROE",
        "Area is clear",
      ]);
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      "PID confirmed. " +
      (v.targetAlias || "HVT") +
      " observed at anticipated location. " +
      collateralStr +
      ". Awaiting final authorization. Intel coverage: " +
      v.intelCoverage +
      "%.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        "Authorization received. Action executed. " +
        (v.targetAlias || "HVT") +
        " " +
        pick([
          "engaged by sniper team — two rounds, both hits, target down immediately",
          "vehicle destroyed by directed charge — no survivors",
          "neutralized by covert operative at close range — suppressed weapon, single shot",
          "eliminated by command-detonated device as vehicle passed through chokepoint",
        ]) +
        ". Confirmed EKIA.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0) + "+10min",
      type: "normal",
      text:
        "Post-action surveillance confirms target eliminated. " +
        pick([
          "Local emergency services responding — cover story holding",
          "Area secured by allied local forces",
          "Clean operation — no witnesses to the action itself",
        ]) +
        ". Collateral damage: none.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Assets exfiltrated from area without detection. Attribution assessment: " +
        pick([
          "impossible to attribute — appears accidental",
          "low — could be attributed to rival faction",
          "moderate — forensics may indicate state actor",
        ]) +
        ".",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text: "Action executed. However — " + pick(DEBRIEF_COMPROMISE) + ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0) + "+5min",
      type: "failure",
      text:
        (v.targetAlias || "HVT") +
        " " +
        pick([
          "survived — armored vehicle absorbed the blast",
          "was not in the expected vehicle — decoy detected too late",
          "was shielded by bodyguards who took the impact",
          "had already departed the area when the action was initiated",
        ]) +
        ". Target alive and aware of assassination attempt.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Assets exfiltrated. " +
        v.orgName +
        " has gone to ground. " +
        (v.targetAlias || "HVT") +
        " will significantly increase personal security. Future opportunities will be harder to create.",
    });
  }

  var assessment = success
    ? "Targeted killing of " +
      (v.targetAlias || "HVT") +
      " in " +
      v.city +
      " successful. " +
      v.orgName +
      "'s operational leadership disrupted. The action was conducted with minimal attribution risk and zero collateral damage."
    : "Targeted killing attempt against " +
      (v.targetAlias || "HVT") +
      " failed. Target survived and is aware of Vigil's intent. Future operations against this target will face significantly enhanced security measures. " +
      v.orgName +
      " may use the attempt for propaganda purposes.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  ASSET EXTRACTION
// =====================================================================

DEBRIEF_GENERATORS.ASSET_EXTRACTION = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var sourceCode = generateSourceCode();
  var entries = [];

  // Pull real intel
  var lastKnownIntel = getIntel(v, "ASSET_LAST_KNOWN");
  var compromiseIntel = getIntel(v, "COMPROMISE_VECTOR");
  var ciActivityIntel = getIntel(v, "HOSTILE_CI_ACTIVITY");
  var exfilRoutesIntel = getIntel(v, "EXFIL_ROUTES");
  var conditionIntel = getIntel(v, "ASSET_CONDITION");
  var coverIntel = getIntel(v, "COVER_STATUS");
  var safeHouseIntel = getIntel(v, "SAFE_HOUSE_NETWORK");
  var damageIntel = getIntel(v, "DAMAGE_ASSESSMENT");
  var transitNote = v.transitHours
    ? " Transit: " + v.transitHours + " hours."
    : "";

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      (v.threatUrgent ? "FLASH priority: " : "") +
      "Vigil source " +
      sourceCode +
      " compromised in " +
      v.city +
      ", " +
      v.country +
      ". " +
      (compromiseIntel
        ? "Compromise vector: " + compromiseIntel + ". "
        : v.orgName + " counter-intelligence has identified the asset. ") +
      "Immediate extraction authorized. " +
      v.primaryAsset +
      " tasked." +
      transitNote +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(4),
    type: "normal",
    text:
      "Emergency contact protocol activated. " +
      (conditionIntel
        ? "Asset condition: " + conditionIntel + ". "
        : "Source " +
          sourceCode +
          " reached via dead drop — confirmed alive, under surveillance but not yet detained. ") +
      (ciActivityIntel
        ? "Hostile CI activity: " + ciActivityIntel + ". "
        : "") +
      (coverIntel ? "Cover status: " + coverIntel + ". " : "") +
      "Extraction window estimated at " +
      randInt(12, 36) +
      " hours before " +
      v.orgName +
      " acts." +
      (damageIntel ? " Damage assessment: " + damageIntel + "." : ""),
  });
  var exfilPlan = exfilRoutesIntel
    ? exfilRoutesIntel
    : pick([
        "vehicle pickup at pre-arranged safe point, overland to border",
        "maritime extraction from coastal rendezvous",
        "helicopter extraction from rooftop of allied facility",
        "commercial air departure under false identity",
      ]);
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Team " +
      callsign +
      " in " +
      v.city +
      ". Extraction plan: " +
      exfilPlan +
      ". " +
      (safeHouseIntel ? "Safe house network: " + safeHouseIntel + ". " : "") +
      "Backup plans Alpha through Charlie prepared. Intel coverage: " +
      v.intelCoverage +
      "%.",
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      "Source " +
      sourceCode +
      " moving to extraction point. Counter-surveillance team reports " +
      pick([
        "no hostile tail detected — route appears clean",
        "2 possible surveillance vehicles — taking evasive action",
        "foot surveillance team detected, source running SDR",
      ]) +
      ".",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        "Source " +
        sourceCode +
        " arrived at extraction point. Identity confirmed by team " +
        callsign +
        ". Source and immediate family (" +
        randInt(0, 3) +
        " dependents) boarded extraction vehicle. Moving to phase line ALPHA.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        pick([
          "Passed through checkpoint without incident — cover documentation held",
          "Evasive routing through " +
            v.city +
            " suburbs to avoid known surveillance zones",
          "Brief vehicle swap at safe house — counter-surveillance confirmed no tail",
        ]) + ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(3),
      type: "normal",
      text:
        "Source " +
        sourceCode +
        " and dependents crossed into safe territory. Transferred to secure facility for debriefing. All extraction team members accounted for — clean operation, no hostile contact.",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Source " +
        sourceCode +
        " completing full debrief. Resettlement process initiated. Cover identities being destroyed. " +
        v.orgName +
        " expected to discover the extraction within " +
        randInt(12, 48) +
        " hours.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        "Source " +
        sourceCode +
        " arrived at extraction point under obvious hostile surveillance. Team " +
        callsign +
        " initiated contact. " +
        v.orgName +
        " security forces converged on the area.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0) + "+15min",
      type: "failure",
      text:
        pick([
          "Source " +
            sourceCode +
            " detained by hostile security forces before extraction vehicle could depart. Team " +
            callsign +
            " forced to abort — engaging would have resulted in international incident",
          "Vehicle pursuit through " +
            v.city +
            ". Extraction vehicle disabled by roadblock. Source " +
            sourceCode +
            " captured. Team " +
            callsign +
            " evaded on foot",
          "Source " +
            sourceCode +
            " failed to reach extraction point — last communication indicated armed men at the door. Signal lost",
        ]) + ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Team " +
        callsign +
        " exfiltrated " +
        v.city +
        " via emergency protocol. All team members accounted for but source " +
        sourceCode +
        " is in hostile custody. Source's intelligence value to " +
        v.orgName +
        " if interrogated: " +
        pick([
          "critical — source had knowledge of Vigil operations across the theater",
          "significant — source aware of multiple active operations",
          "moderate — source was compartmented but knows handler identities",
        ]) +
        ".",
    });
  }

  var assessment = success
    ? "Asset extraction from " +
      v.city +
      ", " +
      v.country +
      " successful. Source " +
      sourceCode +
      " and dependents are safe. Intelligence network in " +
      v.country +
      " is compromised but the source — a " +
      randInt(3, 15) +
      "-year producer — has been preserved. Full debrief in progress."
    : "Asset extraction failed. Source " +
      sourceCode +
      " is in " +
      v.orgName +
      "'s custody. Vigil's intelligence network in " +
      v.country +
      " must be considered fully compromised. All associated sources and operations placed on immediate stand-down. Damage assessment in progress.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DOMESTIC HOSTAGE RESCUE
// =====================================================================

DEBRIEF_GENERATORS.DOMESTIC_HOSTAGE_RESCUE = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var entries = [];

  // Pull real intel
  var hostageCountIntel = getIntel(v, "HOSTAGE_COUNT");
  var hostageCount = randInt(4, 20);
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var entryPointsIntel = getIntel(v, "ENTRY_POINTS");
  var captorDemandsIntel = getIntel(v, "CAPTOR_DEMANDS");
  var captorIdIntel = getIntel(v, "CAPTOR_ID");
  var hostageCondIntel = getIntel(v, "HOSTAGE_CONDITION");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Hostage situation confirmed in " +
      v.city +
      ", United States. " +
      (hostageCountIntel
        ? hostageCountIntel
        : hostageCount + " civilians held by " + v.orgName) +
      " in " +
      pick([
        "a commercial building",
        "a government facility",
        "a residential compound",
        "a transportation hub",
      ]) +
      ". FBI HRT alerted. " +
      v.primaryAsset +
      " designated as primary assault element." +
      (captorIdIntel ? " Captor identification: " + captorIdIntel + "." : "") +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-6),
    type: "normal",
    text:
      "Crisis negotiation team established contact with " +
      v.orgName +
      ". " +
      (captorDemandsIntel
        ? "Demands assessment: " + captorDemandsIntel + "."
        : "Demands: " +
          pick([
            "political concessions and safe passage",
            "release of imprisoned associates",
            "ransom of $" + randInt(5, 50) + "M",
            "media broadcast of manifesto",
          ]) +
          ".") +
      " Vigil assessing sincerity and hostage welfare." +
      (hostageCondIntel ? " Hostage condition: " + hostageCondIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Tactical teams positioned. " +
      randInt(3, 5) +
      " sniper teams in overwatch. " +
      (actualGear ? "Assault loadout: " + actualGear + ". " : "") +
      (entryPointsIntel ? "Entry assessment: " + entryPointsIntel + ". " : "") +
      "Inner and outer perimeter established by local law enforcement. Medical teams staged. Media cordon holding." +
      (guardForceIntel
        ? " Armed subject assessment: " + guardForceIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-2),
    type: "normal",
    text:
      "Negotiations deteriorating. " +
      v.orgName +
      " becoming increasingly agitated. " +
      (commsIntel
        ? "Subject communications: " + commsIntel + ". "
        : "Vigil intercepted communications suggesting deadline for hostage execution. ") +
      "Assault authorization granted by DOJ. Intel coverage: " +
      v.intelCoverage +
      "%.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text:
        '"Green light. Execute." Simultaneous entry — ' +
        pick(SOF_BREACH_DETAIL) +
        " CS gas deployed through ventilation system to disorient captors.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 1),
      type: "critical",
      text: "Lobby area. Two captors coughing from the gas, weapons lowered. Lead operator rushed the nearest — controlled the rifle barrel, drove him into the wall. Flex-cuffed in seconds. Second captor raised his hands, choking. Detained.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "critical",
      text:
        pick(SOF_ROOM_CLEAR) + " Operators advancing toward hostage location.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 3),
      type: "critical",
      text: pick(SOF_SNIPER_ENGAGEMENT),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 4),
      type: "critical",
      text:
        "Hostage room. Reinforced door. Breacher placed a shaped water charge to avoid fragmentation toward hostages. BANG. Door flew in. " +
        randInt(2, 5) +
        ' captors inside — one lunged for a detonator on the table. Sniper round came through the window at the same instant the breach team entered. Hit the man\'s wrist. Detonator went spinning. Second captor raised a pistol toward the hostages — two operators fired simultaneously. He crumpled. Remaining captors threw themselves flat. "ALL CLEAR. PRECIOUS CARGO SECURE."',
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 6),
      type: "normal",
      text:
        "All " +
        hostageCount +
        " hostages recovered alive. Evacuated to triage. " +
        randInt(0, 3) +
        " minor injuries — stress reactions and abrasions. No life-threatening conditions. All team members accounted for.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 15),
      type: "normal",
      text:
        "Building secured. " +
        randInt(4, 8) +
        " hostile KIA or detained. EOD team cleared " +
        randInt(1, 3) +
        " IEDs rigged to the hostage room. Scene turned over to FBI Evidence Response Team. Media briefing coordinated with DOJ.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text:
        randInt(1, 3) +
        " surviving " +
        v.orgName +
        " members in federal custody. Hostages transported to local hospitals for evaluation. Zero friendly casualties.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 0),
      type: "critical",
      text:
        '"Green light. Execute." Assault initiated. ' + pick(SOF_BREACH_DETAIL),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 1),
      type: "critical",
      text: "Entry hallway. Immediate contact — captor opened fire from behind a barricade of furniture. Rounds snapping down the corridor. Point man returned fire, suppressed. Number two flanked through a side office. Captor engaged from both sides — went down.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 2),
      type: "failure",
      text:
        "Captors triggered prepared explosive device in the hostage area upon hearing the gunfire. The blast wave blew out the windows on the south side. Assault team fought through smoke and debris to reach the room — " +
        randInt(1, Math.max(1, Math.floor(hostageCount / 4))) +
        " hostages killed, " +
        randInt(1, 3) +
        " critically wounded. Remaining hostages recovered alive with injuries.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 4),
      type: "critical",
      text:
        pick(SOF_ROOM_CLEAR) +
        " Remaining captors making a last stand. All neutralized.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 8),
      type: "normal",
      text:
        "Building secured. " +
        (hostageCount - randInt(1, 3)) +
        " hostages recovered alive, some with serious injuries. " +
        randInt(0, 2) +
        " operators WIA.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "normal",
      text: "Mass casualty response initiated. Wounded transported to area hospitals. FBI assuming jurisdiction for criminal investigation. Casualty notification process initiated.",
    });
  }

  var assessment = success
    ? "Domestic hostage rescue in " +
      v.city +
      " was a complete success. All " +
      hostageCount +
      " hostages recovered alive. " +
      v.orgName +
      " cell neutralized on US soil. Operation conducted within Posse Comitatus guidelines — federal law enforcement maintained legal authority throughout."
    : "Domestic hostage rescue in " +
      v.city +
      " resulted in hostage casualties. " +
      v.orgName +
      "'s prepared explosive contingency was triggered during the assault. Vigil is reviewing the pre-assault intelligence for indicators that the booby trap could have been anticipated.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  INVESTIGATION
// =====================================================================

DEBRIEF_GENERATORS.INVESTIGATION = function (op, v, success) {
  var entries = [];
  var sourceCount = randInt(3, 8);

  // Pull real intel
  var cellLocationIntel =
    getIntel(v, "CELL_LOCATION") || getIntel(v, "ORG_LOCATION");
  var cellStructureIntel = getIntel(v, "CELL_STRUCTURE");
  var memberCountIntel = getIntel(v, "MEMBER_COUNT");
  var attackPlanningIntel = getIntel(v, "ATTACK_PLANNING");
  var weaponsCacheIntel = getIntel(v, "WEAPONS_CACHE");
  var leadershipIntel = getIntel(v, "LEADERSHIP_ID");
  var supportNetworkIntel =
    getIntel(v, "SUPPORT_NETWORK") || getIntel(v, "NETWORK_MAPPING");
  var financialIntel = getIntel(v, "FINANCIAL_FLOWS");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var targetIntentIntel = getIntel(v, "TARGET_INTENT");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";

  entries.push({
    time: dayLabel(-7) + " " + zuluTime(0),
    type: "normal",
    text:
      "Federal investigation initiated against " +
      v.orgName +
      " network in " +
      v.city +
      ", United States. " +
      v.primaryAsset +
      " assigned as lead investigative unit. Vigil providing SIGINT and database support." +
      (v.confidence ? " Operation confidence: " + v.confidence + "%." : "") +
      (cellLocationIntel ? " Target location: " + cellLocationIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(-5) + " " + zuluTime(0),
    type: "normal",
    text:
      "FISA warrants obtained for electronic surveillance on " +
      randInt(3, 8) +
      " targets. Financial subpoenas served to " +
      randInt(2, 5) +
      " banking institutions. Grand jury convened." +
      (leadershipIntel
        ? " Leadership identified: " + leadershipIntel + "."
        : "") +
      (cellStructureIntel
        ? " Cell structure: " + cellStructureIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(-3) + " " + zuluTime(0),
    type: "normal",
    text:
      "Surveillance producing results. " +
      randInt(50, 200) +
      " hours of intercepted communications. " +
      sourceCount +
      " confidential sources providing information. " +
      (supportNetworkIntel
        ? "Network analysis: " + supportNetworkIntel + ". "
        : "Pattern analysis revealing network structure. ") +
      (commsIntel ? "Communications intel: " + commsIntel + "." : "") +
      (financialIntel
        ? " Financial intelligence: " + financialIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Case file compiled. " +
      randInt(200, 800) +
      " pages of evidence. " +
      (financialIntel
        ? "Financial trail: " + financialIntel + ". "
        : "Financial trail mapped across " +
          randInt(3, 7) +
          " shell companies. Key transactions identified totaling $" +
          randInt(1, 25) +
          "M. ") +
      (memberCountIntel
        ? "Suspect assessment: " + memberCountIntel + ". "
        : "") +
      (attackPlanningIntel
        ? "Attack planning intel: " + attackPlanningIntel + ". "
        : "") +
      "Intel coverage: " +
      v.intelCoverage +
      "%.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        "Investigation reached actionable threshold. Grand jury returned " +
        randInt(12, 40) +
        "-count indictment against " +
        randInt(3, 8) +
        " " +
        v.orgName +
        " operatives. Charges include: " +
        pick([
          "material support for terrorism",
          "conspiracy to commit acts of violence",
          "money laundering and fraud",
          "weapons trafficking and procurement of destructive devices",
        ]) +
        "." +
        (targetIntentIntel
          ? " Target intent established: " + targetIntentIntel + "."
          : "") +
        (weaponsCacheIntel
          ? " Weapons evidence: " + weaponsCacheIntel + "."
          : ""),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(4),
      type: "normal",
      text:
        "Arrest warrants issued. " +
        randInt(3, 6) +
        " subjects taken into custody across " +
        randInt(2, 4) +
        " states. " +
        randInt(0, 2) +
        " subjects remain at large — fugitive task force activated." +
        (actualGear ? " Arrest teams equipped with " + actualGear + "." : ""),
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Evidence exploitation continuing. Digital forensics team processing " +
        randInt(5, 20) +
        " devices. Vigil cross-referencing findings with international intelligence holdings. Additional subjects may be identified.",
    });
  } else {
    var gapAnalysis = "";
    if (v._unrevealedIntel && v._unrevealedIntel.length > 0) {
      var gaps = v._unrevealedIntel
        .slice(0, 2)
        .map(function (f) {
          return f.label;
        })
        .join(" and ");
      gapAnalysis =
        " Intelligence gaps in " +
        gaps +
        " may have contributed to the evidentiary shortfall.";
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Investigation stalled. Key evidence challenged — FISA warrant application contained procedural errors. Defense counsel filed motion to suppress." +
        gapAnalysis,
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(8),
      type: "failure",
      text:
        "Federal judge ruled " +
        pick([
          "key electronic intercepts inadmissible — warrant affidavit insufficient",
          "financial evidence obtained in violation of Fourth Amendment protections",
          "confidential source testimony unreliable — source was previously compromised by " +
            v.orgName,
        ]) +
        ". Case significantly weakened.",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "US Attorney's office declining to prosecute on current evidence. Case remanded for additional investigation. " +
        v.orgName +
        " operatives remain at liberty. Their legal counsel has filed counter-complaints.",
    });
  }

  var assessment = success
    ? "Federal investigation of " +
      v.orgName +
      " in " +
      v.city +
      " produced actionable indictments. Multiple subjects in custody. Evidence chain is strong — prosecution expected to proceed. Intel coverage at " +
      v.intelCoverage +
      "% — Vigil intelligence was instrumental in building the case." +
      (v.confidence ? " Operation confidence was " + v.confidence + "%." : "")
    : "Federal investigation of " +
      v.orgName +
      " encountered legal obstacles. Key evidence suppressed by judicial ruling. Intel coverage was only " +
      v.intelCoverage +
      "% — " +
      (v.intelCoverage < 50
        ? "insufficient intelligence collection likely contributed to the weak evidentiary foundation."
        : "despite adequate intelligence, the legal framework could not support the case.") +
      " " +
      v.orgName +
      " operatives remain free and are now aware of the investigation's scope. Recommend rebuilding the case with alternative evidence sources.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DOMESTIC SURVEILLANCE
// =====================================================================

DEBRIEF_GENERATORS.DOMESTIC_SURVEILLANCE = function (op, v, success) {
  var entries = [];
  var targetsCount = randInt(3, 8);

  // Pull real intel
  var cellLocationIntel =
    getIntel(v, "CELL_LOCATION") || getIntel(v, "ORG_LOCATION");
  var cellStructureIntel = getIntel(v, "CELL_STRUCTURE");
  var memberCountIntel = getIntel(v, "MEMBER_COUNT");
  var attackPlanningIntel = getIntel(v, "ATTACK_PLANNING");
  var leadershipIntel = getIntel(v, "LEADERSHIP_ID");
  var supportNetworkIntel =
    getIntel(v, "SUPPORT_NETWORK") || getIntel(v, "NETWORK_MAPPING");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var targetIntentIntel = getIntel(v, "TARGET_INTENT");
  var financialIntel = getIntel(v, "FINANCIAL_FLOWS");
  var weaponsCacheIntel = getIntel(v, "WEAPONS_CACHE");
  var actualVehicles =
    v.vehicles && v.vehicles.length > 0 ? pickItems(v.vehicles, 2) : "";
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";
  var transitNote = v.transitHours
    ? " Deployment transit: " + v.transitHours + " hours."
    : "";

  entries.push({
    time: dayLabel(-3) + " " + zuluTime(0),
    type: "normal",
    text:
      v.primaryAsset +
      " initiated domestic surveillance operation against " +
      v.orgName +
      " in " +
      v.city +
      ", United States. " +
      (memberCountIntel
        ? "Suspect assessment: " + memberCountIntel + ". "
        : targetsCount + " persons of interest identified. ") +
      "FISA court authorization obtained." +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : "") +
      (cellLocationIntel
        ? " Target location: " + cellLocationIntel + "."
        : "") +
      transitNote,
  });
  entries.push({
    time: dayLabel(-2) + " " + zuluTime(0),
    type: "normal",
    text:
      "Physical surveillance teams deployed. " +
      randInt(4, 8) +
      " agents in " +
      (actualVehicles ? actualVehicles : randInt(2, 4) + " vehicles") +
      " maintaining rolling coverage. Technical surveillance: pen registers on " +
      randInt(2, 5) +
      " phone lines, email intercepts active." +
      (actualGear ? " Equipment: " + actualGear + "." : "") +
      (leadershipIntel
        ? " Primary target — leadership: " + leadershipIntel + "."
        : ""),
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Pattern-of-life established on primary targets. Daily routines mapped. Known associates catalogued. " +
      (cellStructureIntel
        ? "Cell structure: " + cellStructureIntel + ". "
        : "") +
      randInt(2, 4) +
      " previously unknown meeting locations identified across " +
      v.city +
      "." +
      (commsIntel ? " Communications: " + commsIntel + "." : ""),
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Key intercept: " +
        v.orgName +
        " cell leader conducted an unencrypted phone call discussing " +
        (attackPlanningIntel
          ? attackPlanningIntel
          : pick([
              "operational timeline for planned attack",
              "weapons procurement from out-of-state supplier",
              "financial transfer instructions to overseas account",
              "meeting with foreign contact at designated location",
            ])) +
        ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(4),
      type: "critical",
      text:
        "Breakthrough: physical surveillance team observed " +
        randInt(2, 4) +
        " targets meeting at " +
        pick(["a storage unit", "a rented warehouse", "a private residence"]) +
        ". Targets were observed " +
        (weaponsCacheIntel
          ? "at weapons cache: " + weaponsCacheIntel
          : pick([
              "handling weapons and tactical equipment",
              "reviewing maps and photographs of a potential target",
              "transferring large amounts of cash",
              "conducting rehearsals of an operational plan",
            ])) +
        ". Documented via long-range photography and audio." +
        (targetIntentIntel
          ? " Intent assessment: " + targetIntentIntel + "."
          : ""),
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "Network fully mapped. " +
        randInt(8, 20) +
        " associates identified. " +
        (supportNetworkIntel
          ? "Network analysis: " + supportNetworkIntel + ". "
          : "Communication patterns, financial flows, and logistics chain documented. ") +
        (financialIntel
          ? "Financial intelligence: " + financialIntel + ". "
          : "") +
        "Intelligence package forwarded to Vigil for threat assessment and to DOJ for prosecution support.",
    });
    entries.push({
      time: dayLabel(2) + " " + zuluTime(0),
      type: "normal",
      text:
        "Surveillance window complete. " +
        randInt(100, 300) +
        " hours of coverage compiled. " +
        randInt(15, 40) +
        " actionable intelligence reports generated. Intel coverage: " +
        v.intelCoverage +
        "%. Recommend transition to enforcement phase.",
    });
  } else {
    var gapAnalysis = "";
    if (v._unrevealedIntel && v._unrevealedIntel.length > 0) {
      var gaps = v._unrevealedIntel
        .slice(0, 2)
        .map(function (f) {
          return f.label;
        })
        .join(" and ");
      gapAnalysis =
        " Intelligence gaps in " +
        gaps +
        " left the team unprepared for counter-surveillance measures.";
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "normal",
      text:
        "Targets employing counter-surveillance techniques. " +
        randInt(2, 3) +
        " surveillance detection routes observed. Subjects switching vehicles and using burner phones with regular frequency." +
        gapAnalysis,
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(8),
      type: "failure",
      text:
        "Surveillance compromised. Target " +
        pick([
          "spotted a surveillance vehicle and took evasive action — all targets went dark within 2 hours",
          "used an RF detector and found a planted audio device — counter-intelligence protocols activated",
          "posted photographs of surveillance team members on encrypted channels",
        ]) +
        ".",
    });
    entries.push({
      time: dayLabel(1) + " " + zuluTime(0),
      type: "normal",
      text:
        "All surveillance assets recalled. " +
        v.orgName +
        " cell aware of federal interest. Targets have changed all communication methods, relocated from known addresses, and alerted the wider network.",
    });
  }

  var assessment = success
    ? "Domestic surveillance of " +
      v.orgName +
      " in " +
      v.city +
      " produced comprehensive intelligence at " +
      v.intelCoverage +
      "% coverage. Network mapped, communications intercepted, and evidence documented within FISA guidelines. Case ready for prosecution phase." +
      (v.confidence ? " Operation confidence was " + v.confidence + "%." : "")
    : "Domestic surveillance operation compromised. " +
      v.orgName +
      "'s counter-surveillance capabilities exceeded assessment. Intel coverage was " +
      v.intelCoverage +
      "% — " +
      (v.intelCoverage < 50
        ? "inadequate pre-operational intelligence likely contributed to detection."
        : "despite reasonable intelligence, the target's tradecraft proved superior.") +
      " All targets are now aware of federal interest and have gone dark. Recommend stand-down period and alternative approaches.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  ARREST OPERATION
// =====================================================================

DEBRIEF_GENERATORS.ARREST_OPERATION = function (op, v, success) {
  var entries = [];
  var targetCount = randInt(1, 4);

  // Pull real intel
  var cellLocationIntel =
    getIntel(v, "CELL_LOCATION") || getIntel(v, "ORG_LOCATION");
  var memberCountIntel = getIntel(v, "MEMBER_COUNT");
  var leadershipIntel = getIntel(v, "LEADERSHIP_ID");
  var weaponsCacheIntel = getIntel(v, "WEAPONS_CACHE");
  var attackPlanningIntel = getIntel(v, "ATTACK_PLANNING");
  var targetIntentIntel = getIntel(v, "TARGET_INTENT");
  var supportNetworkIntel =
    getIntel(v, "SUPPORT_NETWORK") || getIntel(v, "NETWORK_MAPPING");
  var commsIntel = getIntel(v, "INTERNAL_COMMS");
  var guardForceIntel = getIntel(v, "GUARD_FORCE");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";
  var actualVehicles =
    v.vehicles && v.vehicles.length > 0 ? pickItems(v.vehicles, 2) : "";

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Federal arrest warrants issued for " +
      (memberCountIntel
        ? v.orgName + " operatives (" + memberCountIntel + ")"
        : targetCount + " " + v.orgName + " operatives") +
      " in " +
      v.city +
      ", United States. " +
      v.primaryAsset +
      " designated as arresting agency. Charges: " +
      pick([
        "material support for terrorism (18 USC 2339A)",
        "conspiracy to use weapons of mass destruction (18 USC 2332a)",
        "seditious conspiracy (18 USC 2384)",
        "interstate transportation of stolen property and fraud",
      ]) +
      "." +
      (leadershipIntel ? " Primary target: " + leadershipIntel + "." : "") +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      "Surveillance confirms target(s) at expected location. " +
      (cellLocationIntel
        ? "Target location: " + cellLocationIntel + ". "
        : "") +
      "Tactical arrest team assembled — " +
      (v.totalPersonnel
        ? v.totalPersonnel + " personnel"
        : randInt(8, 16) + " agents") +
      ". " +
      (actualVehicles
        ? "Vehicles: " + actualVehicles + ". "
        : "Marked and unmarked vehicles staged. ") +
      "Ambulance on standby." +
      (guardForceIntel
        ? " Subject threat assessment: " + guardForceIntel + "."
        : "") +
      (weaponsCacheIntel ? " Weapons intel: " + weaponsCacheIntel + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      "Final brief. Arrest plan: " +
      pick([
        "dynamic entry at residence — SWAT support requested",
        "vehicle interception during target's morning commute",
        "controlled approach at target's workplace — minimal disruption",
        "surround and call-out at target's known location",
      ]) +
      ". Rules of engagement: minimum force necessary." +
      (actualGear ? " Team loadout: " + actualGear + "." : "") +
      (attackPlanningIntel
        ? " Attack planning context: " + attackPlanningIntel + "."
        : "") +
      " Intel coverage: " +
      v.intelCoverage +
      "%.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        pick(LE_ENTRY) +
        " Target(s) detained without incident. Miranda rights administered. " +
        targetCount +
        " of " +
        targetCount +
        " subjects in federal custody." +
        (commsIntel
          ? " Subjects' phones seized — communications already monitored: " +
            commsIntel +
            "."
          : ""),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 30),
      type: "normal",
      text:
        "Incident search conducted pursuant to arrest. Recovered: " +
        pick(DEBRIEF_EVIDENCE) +
        ". All items tagged and photographed for chain of custody." +
        (supportNetworkIntel
          ? " Network intel confirmed: " + supportNetworkIntel + "."
          : ""),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Subjects transported to federal holding facility. Initial processing complete. Legal counsel notified. Magistrate hearing scheduled within 24 hours." +
        (targetIntentIntel
          ? " Intent assessment confirmed: " + targetIntentIntel + "."
          : ""),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(4),
      type: "normal",
      text: "No injuries to any party. Media statement prepared jointly with US Attorney's office. Operation documented in compliance with DOJ use-of-force reporting requirements.",
    });
  } else {
    var gapAnalysis = "";
    if (v._unrevealedIntel && v._unrevealedIntel.length > 0) {
      var gaps = v._unrevealedIntel
        .slice(0, 2)
        .map(function (f) {
          return f.label;
        })
        .join(" and ");
      gapAnalysis =
        " Intelligence gaps in " +
        gaps +
        " contributed to the operational failure.";
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        "Arrest team approached target location. " +
        pick(DEBRIEF_COMPROMISE) +
        "." +
        gapAnalysis,
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 10),
      type: "failure",
      text:
        pick([
          "Target barricaded inside residence. Armed standoff ensued — negotiators called to scene. After " +
            randInt(4, 12) +
            " hours, target surrendered but had destroyed all physical evidence inside",
          "Target fled on foot. Pursuit through " +
            pick(DOMESTIC_LOCATIONS) +
            ". Lost contact after " +
            randInt(5, 15) +
            " minutes. Target remains at large",
          "Target resisted arrest — altercation resulted in injuries to " +
            randInt(1, 2) +
            " agents and the subject. Use-of-force investigation automatically triggered. Subject hospitalized",
        ]) + ".",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(4),
      type: "normal",
      text:
        "Only " +
        randInt(0, Math.max(0, targetCount - 1)) +
        " of " +
        targetCount +
        " targets successfully arrested. Remaining subjects are fugitives. BOLO issued to all field offices and international partners.",
    });
  }

  var assessment = success
    ? "Arrest operation against " +
      v.orgName +
      " in " +
      v.city +
      " completed successfully. All " +
      targetCount +
      " subjects in custody. Evidence preserved. Intel coverage: " +
      v.intelCoverage +
      "%. Prosecution timeline on track. Operation conducted within constitutional requirements." +
      (v.confidence ? " Vigil confidence was " + v.confidence + "%." : "")
    : "Arrest operation partially failed. Key subject(s) evaded custody. Intel coverage was " +
      v.intelCoverage +
      "% — " +
      (v.intelCoverage < 50
        ? "insufficient pre-arrest intelligence likely allowed targets to anticipate the operation."
        : "despite adequate intelligence, operational execution fell short.") +
      " Vigil recommends fugitive task force activation and enhanced surveillance on known associates. The failed arrest will alert the wider " +
      v.orgName +
      " network.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  SOLO_APPREHENSION — Single-target arrest (illegals, fugitives)
// =====================================================================

DEBRIEF_GENERATORS.SOLO_APPREHENSION = function (op, v, success) {
  var entries = [];

  // Pull real intel — solo target keys
  var subjectIdIntel =
    getIntel(v, "SUBJECT_ID") ||
    getIntel(v, "COVER_IDENTITY") ||
    getIntel(v, "HVT_IDENTITY");
  var locationIntel =
    getIntel(v, "FUGITIVE_LOCATION") || getIntel(v, "CELL_LOCATION");
  var movementsIntel =
    getIntel(v, "FUGITIVE_MOVEMENTS") || getIntel(v, "MOVEMENT_PATTERNS");
  var armedIntel = getIntel(v, "FUGITIVE_ARMED") || getIntel(v, "GUARD_FORCE");
  var associatesIntel =
    getIntel(v, "FUGITIVE_ASSOCIATES") || getIntel(v, "NETWORK_MAPPING");
  var apprehensionIntel =
    getIntel(v, "FUGITIVE_APPREHENSION") || getIntel(v, "CONTINGENCY_PLANNING");
  var backgroundIntel = getIntel(v, "FUGITIVE_BACKGROUND");
  var actualGear =
    v.equipment && v.equipment.length > 0 ? pickItems(v.equipment, 2) : "";
  var actualVehicles =
    v.vehicles && v.vehicles.length > 0 ? pickItems(v.vehicles, 1) : "";

  var approachType = pick(["plainclothes", "tactical", "mixed"]);
  var approachDesc =
    approachType === "plainclothes"
      ? "Plainclothes surveillance team"
      : approachType === "tactical"
        ? "Tactical arrest team in full kit"
        : "Mixed element — plainclothes outer cordon, tactical inner team";

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Apprehension order issued for " +
      v.orgName +
      " in " +
      v.city +
      ", United States. " +
      v.primaryAsset +
      " assigned as lead. Single-target operation." +
      (subjectIdIntel ? " Subject profile: " + subjectIdIntel + "." : "") +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      approachDesc +
      " deployed to " +
      v.city +
      ". " +
      (locationIntel
        ? "Subject located: " + locationIntel + " "
        : "Subject's last known position confirmed. ") +
      (movementsIntel
        ? "Pattern-of-life assessment: " + movementsIntel + " "
        : "") +
      (v.totalPersonnel ? v.totalPersonnel + " personnel staged." : "") +
      (actualVehicles ? " Vehicles: " + actualVehicles + "." : ""),
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      "Final brief. " +
      (apprehensionIntel
        ? "Apprehension plan: " + apprehensionIntel + " "
        : "Intercept planned at subject's next predictable location. ") +
      (armedIntel ? "Armed assessment: " + armedIntel + " " : "") +
      "Rules of engagement: minimum force. Intel coverage: " +
      v.intelCoverage +
      "%." +
      (actualGear ? " Team loadout: " + actualGear + "." : ""),
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        pick([
          "Subject intercepted at " +
            pick([
              "a gas station",
              "a convenience store",
              "a motel parking lot",
              "a residential address",
              "a laundromat",
              "a transit stop",
            ]) +
            " in " +
            v.city +
            ". Plainclothes agents approached and identified themselves. Subject complied after brief verbal exchange. Handcuffed without incident.",
          "Apprehension team moved on subject at " +
            pick([
              "the known residence",
              "a vehicle stop on a surface street",
              "a commercial establishment",
              "an associate's address",
            ]) +
            ". Subject attempted to walk away — agents identified themselves and subject was detained. No resistance.",
          "Subject spotted at " +
            pick([
              "a fueling station",
              "a grocery store",
              "a public park",
              "a fast-food restaurant",
            ]) +
            ". Team closed in from two directions. Subject complied immediately upon seeing credentials. Arrested without incident.",
          "Tactical team executed a vehicle stop on subject's car at a red light in " +
            v.city +
            ". Agents boxed the vehicle. Subject ordered out at gunpoint. Complied immediately. Secured without incident.",
          "FBI HRT breached subject's motel room at " +
            pick(["0430", "0515", "0545"]) +
            " local. Flash-bang deployed. Subject found in bed. No resistance. Taken into custody.",
          "Arrest team intercepted subject leaving " +
            pick([
              "a restaurant",
              "a gym",
              "a rented storage unit",
              "a barbershop",
            ]) +
            ". Agents in tactical vests converged from unmarked vehicles. Subject froze. Detained and cuffed within seconds.",
        ]) +
        (v.prisonerName ? " Prisoner designated: " + v.prisonerName + "." : ""),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 20),
      type: "normal",
      text:
        "Subject's personal effects searched incident to arrest. Recovered: " +
        pick([
          "a prepaid mobile phone, $2,400 in cash, and a set of false identification documents",
          "encrypted communication device, foreign currency, and a notebook with coded entries",
          "two mobile phones (1 encrypted), a laptop, and a go-bag containing travel documents",
          "a handgun (loaded), false identification, and $6,000 in cash",
        ]) +
        ". All items catalogued for evidence." +
        (associatesIntel
          ? " Associate network assessment: " + associatesIntel
          : ""),
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Subject transported to federal holding facility. " +
        pick([
          "Initial interview conducted — subject is not cooperating.",
          "Subject invoked right to counsel. Attorney notification in progress.",
          "Subject is cooperating at a minimal level. Preliminary debriefing underway.",
          "Subject provided name and date of birth only. Interrogation team standing by.",
        ]) +
        (backgroundIntel ? " Background: " + backgroundIntel : ""),
    });
  } else {
    var gapAnalysis = "";
    if (v._unrevealedIntel && v._unrevealedIntel.length > 0) {
      var gaps = v._unrevealedIntel
        .slice(0, 2)
        .map(function (f) {
          return f.label;
        })
        .join(" and ");
      gapAnalysis =
        " Intelligence gaps in " + gaps + " contributed to the failure.";
    }
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text:
        pick([
          "Apprehension team arrived at target location — subject was not present. Neighbors report the individual left with a bag hours earlier.",
          "Subject detected surveillance team during approach. Fled on foot through a crowded area. Pursuit lost contact after 3 blocks.",
          "Team approached subject at expected intercept point. Subject ran to a vehicle and departed at high speed. Vehicle pursuit terminated after 4 minutes per department policy.",
          "Subject was tipped off — location was empty and cleaned. Personal effects removed. Subject is in the wind.",
          "Tactical team breached the motel room — empty. Bed still warm. Subject departed through a rear fire escape within the last 20 minutes. Perimeter was not established in time.",
          "Vehicle stop attempted. Subject accelerated through the box, T-boned an unmarked sedan, and fled on foot into a residential area. K-9 unit deployed but lost the trail.",
        ]) + gapAnalysis,
    });
    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, 30),
      type: "failure",
      text: pick([
        "Expanded search of surrounding area negative. Subject has left the immediate area. BOLO issued to all regional field offices and transportation hubs.",
        "Review of CCTV footage shows subject departed the area via " +
          pick([
            "public transit",
            "a ride-share vehicle",
            "a pre-positioned vehicle",
            "an associate's car",
          ]) +
          " approximately " +
          randInt(1, 4) +
          " hours before the team arrived.",
        "Canvass of known associates yielded no cooperation. All contacts are aware of the investigation. Subject's network has gone dark.",
      ]),
    });
  }

  var assessment = success
    ? "Solo apprehension of " +
      v.orgName +
      " in " +
      v.city +
      " executed successfully. Subject in federal custody. Personal effects and devices seized for exploitation. Intel coverage: " +
      v.intelCoverage +
      "%." +
      (v.confidence ? " Vigil confidence was " + v.confidence + "%." : "")
    : "Apprehension of " +
      v.orgName +
      " in " +
      v.city +
      " failed. Subject evaded the team and is at large. Intel coverage was " +
      v.intelCoverage +
      "% — " +
      (v.intelCoverage < 50
        ? "insufficient intelligence on the subject's movements likely contributed to the miss."
        : "despite adequate intelligence, the subject's counter-surveillance awareness was underestimated.") +
      " BOLO active. Recommend enhanced monitoring of known associates.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  EXPIRED — No action taken by operator
// =====================================================================

DEBRIEF_GENERATORS.EXPIRED = function (op, v, success) {
  var entries = [];

  // Build intel context for expired ops
  var revealedCount = v._revealedIntel ? v._revealedIntel.length : 0;
  var totalCount =
    (v._revealedIntel ? v._revealedIntel.length : 0) +
    (v._unrevealedIntel ? v._unrevealedIntel.length : 0);
  var coverageStr =
    totalCount > 0
      ? " (" +
        v.intelCoverage +
        "% coverage — " +
        revealedCount +
        " of " +
        totalCount +
        " fields collected)"
      : "";

  entries.push({
    time: dayLabel(-3) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil intelligence identified " +
      v.orgName +
      " as an active threat in " +
      v.city +
      ", " +
      v.country +
      ". Threat level assessed at " +
      v.threatLevel +
      "/5. " +
      (v.threatLabel ? "Classification: " + v.threatLabel + ". " : "") +
      "Intelligence package compiled and forwarded for operator review" +
      coverageStr +
      ".",
  });
  entries.push({
    time: dayLabel(-2) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil completed threat analysis and generated operational recommendations. " +
      (op.options ? op.options.length : "Multiple") +
      " viable courses of action presented to the operator. Operational window established: " +
      (op.urgencyHours || "48") +
      " hours." +
      (v.threatUrgent ? " This was flagged as URGENT intelligence." : ""),
  });

  // Show what intel was collected before expiry
  if (revealedCount > 0 && v._revealedIntel) {
    var intelSummary = v._revealedIntel
      .slice(0, 3)
      .map(function (f) {
        return f.label;
      })
      .join(", ");
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(-12),
      type: "normal",
      text:
        "Intelligence collected prior to expiry: " +
        intelSummary +
        (revealedCount > 3
          ? " and " + (revealedCount - 3) + " additional fields"
          : "") +
        ". This intelligence is now stale and may require re-verification.",
    });
  }
  if (v._unrevealedIntel && v._unrevealedIntel.length > 0) {
    var gapSummary = v._unrevealedIntel
      .slice(0, 3)
      .map(function (f) {
        return f.label;
      })
      .join(", ");
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(-6),
      type: "normal",
      text:
        "Intelligence gaps at time of expiry: " +
        gapSummary +
        ". These fields were never collected — operator did not deploy collection assets or commit to direct action.",
    });
  }

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil issued reminder: operational window for " +
      v.orgName +
      " is closing. Deployment options remain available. No operator response received.",
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(0),
    type: "failure",
    text:
      "Operational window EXPIRED. No assets were deployed. No action was taken against " +
      v.orgName +
      ". The target has moved beyond the reach of previously recommended options.",
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(1),
    type: "failure",
    text:
      v.orgName +
      " remains operational in " +
      v.city +
      ", " +
      v.country +
      ". Vigil's intelligence collection on the target will continue, but the window for direct action at the recommended confidence levels has passed.",
  });
  entries.push({
    time: dayLabel(0) + " " + zuluTime(2),
    type: "normal",
    text:
      "Post-expiry intelligence indicates " +
      pick([
        v.orgName +
          " has relocated to an unknown safehouse. Re-acquisition will require significant intelligence effort.",
        v.orgName +
          " has dispersed its cell structure. Individual members are now operating independently, making them harder to track.",
        v.orgName +
          " has accelerated its operational timeline. The threat they pose may materialize before new options can be generated.",
        v.orgName +
          " has reinforced its security posture. Future operations against this target will face greater resistance.",
        "the target has gone dark. Communications ceased, known locations abandoned. Vigil has lost the thread.",
      ]),
  });

  var assessment =
    "Operation " +
    v.codename +
    " expired without action. " +
    (v.intelCoverage >= 70
      ? "Vigil had achieved " +
        v.intelCoverage +
        "% intelligence coverage — more than sufficient for confident action. "
      : "Intelligence coverage was at " + v.intelCoverage + "%. ") +
    "The operator was presented with " +
    (op.options ? op.options.length : "multiple") +
    " viable options and chose not to deploy. " +
    v.orgName +
    " (" +
    (v.threatLabel || "unknown type") +
    ") remains an active threat in the " +
    (v.theater || "unknown") +
    " theater. " +
    "Vigil notes that inaction carries consequences equal to failed action — threats do not resolve themselves. " +
    "This operational lapse has been recorded in the operator's performance file.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  CAPTURE_OP — Foreign illegal agent snatch operation
// =====================================================================

DEBRIEF_GENERATORS.CAPTURE_OP = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var entries = [];

  var tcKey = v.threatType;
  var tc = tcKey && THREAT_CONTEXT[tcKey] ? THREAT_CONTEXT[tcKey] : null;
  var targetDesc = (tc && tc.targetDesc) || "target location";

  var agencyLabel = v.agency || "foreign intelligence service";
  var coverIntel = getIntel(v, "COVER_IDENTITY");
  var networkIntel = getIntel(v, "NETWORK_MAPPING");
  var methodIntel = getIntel(v, "OPERATIONAL_METHOD");
  var handlerIntel = getIntel(v, "HANDLER_CONTACT");

  var tcVars = {
    org: v.orgName,
    city: v.city,
    country: v.country,
    theater: v.theater,
    codename: v.codename,
    agency: agencyLabel,
    loc: pick([
      "a commercial district apartment",
      "a rented villa",
      "a hotel room",
      "a café meeting point",
      "a residential safe house",
    ]),
    count: randInt(2, 4),
  };

  var preMission =
    tc && tc.preMission
      ? fillThreatContext(pick(tc.preMission), tcVars)
      : agencyLabel +
        " operative " +
        v.orgName +
        " identified in " +
        v.city +
        ". Capture team deployed.";
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(-4),
    type: "normal",
    text:
      callsign +
      " capture team briefed. Target: " +
      v.orgName +
      " (" +
      agencyLabel +
      " operative). Weather: " +
      weather +
      ".",
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(-2),
    type: "normal",
    text:
      preMission + (coverIntel ? " Cover identity: " + coverIntel + "." : ""),
  });

  if (methodIntel) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(-3),
      type: "normal",
      text:
        "Close target surveillance confirms operational pattern: " +
        methodIntel,
    });
  }

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      callsign +
      " team in position. Subject under continuous surveillance. Snatch window identified during routine movement pattern. Counter-surveillance screen active.",
  });

  if (success) {
    var jackpot =
      tc && tc.jackpotSuccess
        ? fillThreatContext(pick(tc.jackpotSuccess), tcVars)
        : '"JACKPOT." Subject apprehended. Encrypted devices and documentation seized.';
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "success",
      text: jackpot,
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "success",
      text:
        "Subject sedated and moved to exfiltration vehicle. " +
        (networkIntel ? "Network intelligence: " + networkIntel + ". " : "") +
        "Clean extraction — no local law enforcement response.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(3),
      type: "normal",
      text:
        "Subject delivered to secure facility. " +
        (v.prisonerName
          ? "Prisoner designated: " + v.prisonerName + ". "
          : "") +
        "Interrogation team standing by. Biometrics collected, personal effects catalogued.",
    });
    if (tc && tc.sseSuccess)
      entries.push({
        time: dayLabel(0) + " " + zuluTime(5),
        type: "normal",
        text: fillThreatContext(tc.sseSuccess, tcVars),
      });
  } else {
    var fail =
      tc && tc.jackpotFailure
        ? fillThreatContext(pick(tc.jackpotFailure), tcVars)
        : "Subject detected the approach and evaded capture.";
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "failure",
      text: fail,
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(1),
      type: "failure",
      text:
        callsign +
        " team withdrawing. Local security responding. Subject's location unknown." +
        (handlerIntel
          ? " Handler protocol suggests emergency extraction underway."
          : ""),
    });
    if (tc && tc.sseFailure)
      entries.push({
        time: dayLabel(0) + " " + zuluTime(2),
        type: "failure",
        text: fillThreatContext(tc.sseFailure, tcVars),
      });
  }

  var assessment = tc
    ? fillThreatContext(
        success ? tc.assessmentSuccess : tc.assessmentFailure,
        tcVars,
      )
    : success
      ? "Capture operation " +
        v.codename +
        " achieved its objective. " +
        agencyLabel +
        " operative detained."
      : "Capture operation " +
        v.codename +
        " failed. " +
        agencyLabel +
        " operative evaded.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  COVERT_SNATCH — Quiet street abduction (domestic HVT / foreign HVT)
// =====================================================================

DEBRIEF_GENERATORS.COVERT_SNATCH = function (op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var entries = [];

  // Pull intel
  var hvtIdIntel =
    getIntel(v, "HVT_IDENTITY") ||
    getIntel(v, "SUBJECT_ID") ||
    getIntel(v, "LEADERSHIP_ID");
  var movementIntel = getIntel(v, "MOVEMENT_PATTERNS");
  var guardIntel =
    getIntel(v, "PERSONAL_SECURITY") || getIntel(v, "GUARD_FORCE");
  var isolationIntel = getIntel(v, "ISOLATION_WINDOWS");
  var residenceIntel = getIntel(v, "RESIDENCE") || getIntel(v, "CELL_LOCATION");
  var csIntel = getIntel(v, "COUNTERSURVEILLANCE");
  var networkIntel =
    getIntel(v, "NETWORK_MAPPING") || getIntel(v, "HVT_NETWORK");

  var isDomestic = v.domestic;
  var targetName = v.targetAlias || v.orgName || "HVT";

  // --- Abduction method variations ---
  var SNATCH_METHODS = [
    {
      setup:
        "Snatch method: vehicle intercept. Team will box subject's car at a traffic chokepoint. Secondary vehicle pulls alongside, operatives dismount, subject extracted to transfer van. Total exposure: under 20 seconds.",
      exec_success:
        '"GO GO GO." Subject\'s vehicle boxed at the intersection of ' +
        pick([
          "5th and Main",
          "the underpass near the rail yard",
          "an industrial access road",
          "the parking ramp exit",
        ]) +
        ". Two operatives dismounted from a panel van — passenger door opened, subject pulled from driver seat. Flex-cuffs on, hood on, into the van. Door shut. Vehicle convoy moving. Total time from stop to departure: 14 seconds.",
      exec_fail:
        "Vehicle intercept initiated but subject " +
        pick([
          "rammed through the blocking car and fled at high speed — pursuit through residential streets aborted to avoid civilian casualties",
          "saw the approach in his mirror and bailed on foot into a crowded market — team could not pursue without exposure",
          "was not in the vehicle — a decoy was driving. Subject's countersurveillance detected the tail",
        ]),
    },
    {
      setup:
        "Snatch method: parking structure grab. Team will position in subject's parking garage on sublevel " +
        pick(["2", "3", "B1"]) +
        ". When subject exits vehicle, operatives close from 2 directions. Needle sedation, into the trunk of a staged vehicle. Camera blind spots mapped.",
      exec_success:
        "Subject parked on sublevel " +
        pick(["2", "3", "B1"]) +
        " as expected. Two operatives approached from the stairwell as subject locked his car. Brief struggle — subject reached for a weapon but was restrained before he could draw. Sedative administered via auto-injector to the neck. Subject went limp in 8 seconds. Loaded into a staged minivan. Drove out the south exit at normal speed. Garage cameras confirmed: no coverage of the grab point.",
      exec_fail:
        "Subject entered the garage but " +
        pick([
          "was accompanied by an unknown associate — two targets instead of one, team not configured for a double grab. Operation aborted",
          "spotted the staged vehicle and reversed out of the garage at speed. Team could not pursue without blowing cover",
          "parked on a different level than expected. By the time the team repositioned, subject had entered the elevator with two other civilians",
        ]),
    },
    {
      setup:
        "Snatch method: sidewalk grab. Team in a van with sliding door. Subject walks a predictable route between " +
        pick([
          "his apartment and a coffee shop",
          "the subway station and his office",
          "a gym and his residence",
          "a mosque and his residence",
        ]) +
        ". Van pulls up, door opens, subject pulled in. Approach timed to a camera dead zone.",
      exec_success:
        "Van pulled alongside subject on " +
        pick([
          "a tree-lined residential street",
          "a side road behind the strip mall",
          "the walkway under the overpass",
          "a quiet stretch near the canal",
        ]) +
        ". Sliding door opened — two operatives grabbed the subject by both arms and hauled him inside. Subject attempted to shout but a hand was over his mouth before any sound carried. Door shut, van moving. Hood and flex-cuffs applied in the vehicle. A jogger passed 30 meters behind — did not appear to notice.",
      exec_fail:
        "Van approached but " +
        pick([
          "subject was walking with a companion — civilian witness made the grab impossible. Operation waved off",
          "subject suddenly changed his route — walked into a convenience store instead of continuing on the expected path. Team circled the block but subject exited from a different door",
          "a police cruiser was parked at the next intersection. Team aborted to avoid law enforcement contact",
        ]),
    },
    {
      setup:
        "Snatch method: apartment entry. Team will enter subject's residence during predicted absence, wait inside, and take the subject when he returns. Lock bypass kit prepared. Sedation protocol: auto-injector within 5 seconds of entry.",
      exec_success:
        "Team entered the apartment via " +
        pick([
          "a picked deadbolt — 40 seconds, no damage",
          "a copied key obtained from the building superintendent through a cover story",
          "an unlocked window on the fire escape",
        ]) +
        ". Three operatives waited in the dark for " +
        randInt(1, 4) +
        " hours. Subject entered at " +
        pick(["2247", "0118", "2315", "1956"]) +
        " local, locked the door behind him, set down his keys. Operative stepped from behind the door — auto-injector to the neck. Subject collapsed in the hallway. Wrapped in a moving blanket, carried to the van via the service elevator. Building quiet. No witnesses.",
      exec_fail:
        "Team entered and held position. Subject " +
        pick([
          "did not return to the apartment — stayed at an unknown location overnight. Team exfiltrated at dawn to avoid detection",
          "returned with 2 associates. Team could not engage 3 targets. Remained concealed in a closet until all subjects left, then withdrew",
          "appeared to detect something wrong — paused at the door, then left without entering. May have spotted a telltale sign or received a warning",
        ]),
    },
    {
      setup:
        "Snatch method: vehicle entry. Subject drives a " +
        pick([
          "late-model sedan",
          "dark SUV",
          "silver hatchback",
          "rental car",
        ]) +
        " and parks in " +
        pick([
          "a residential street",
          "an unmonitored lot behind a restaurant",
          "his building's rear lot",
        ]) +
        ". Operative will enter the rear seat during a window when the car is unlocked but unattended. When subject returns and begins driving, operative applies sedation from behind.",
      exec_success:
        "Operative entered rear seat of subject's vehicle during a " +
        pick([
          "grocery store visit",
          "gym session",
          "meeting at a restaurant",
        ]) +
        ". Lay flat under a blanket across the back seat for " +
        randInt(20, 45) +
        " minutes. Subject returned, started the engine, pulled onto the road. At the first stoplight, operative sat up — auto-injector to the side of the neck. Subject slumped. Operative leaned forward, engaged parking brake, and steered to the curb. Backup vehicle pulled alongside within 30 seconds. Subject transferred. Both vehicles departed in opposite directions.",
      exec_fail:
        "Operative entered the vehicle but " +
        pick([
          "subject returned earlier than expected with a companion — operative had to abort and exit the car before being seen",
          "subject opened the rear door to load bags and discovered the operative. Subject fled on foot shouting for help — operative withdrew",
          "a parking attendant noticed movement in the vehicle and approached. Operative exited and walked away. Cover intact but operation burned",
        ]),
    },
    {
      setup:
        "Snatch method: restaurant approach. Subject eats alone at a regular establishment in " +
        v.city +
        ". Operative team will stage as customers. When subject exits, team converges at the vehicle — door block, sedation, transfer to waiting van in the adjacent lot.",
      exec_success:
        "Team in position at the restaurant. Subject arrived alone at " +
        pick(["1915", "2020", "1245", "1830"]) +
        ' local and took his usual table. Two operatives inside, two at the exit. Subject finished his meal and walked to his car in the side lot. First operative reached the car simultaneously — "Excuse me, do you have the time?" Subject turned. Second operative applied the auto-injector from behind. Subject sagged. Caught him before he hit the ground. Into the van. Door shut. 11 seconds total. Restaurant noise covered everything.',
      exec_fail:
        "Subject arrived at the restaurant but " +
        pick([
          "sat with an unknown woman — potential witness made the grab at the vehicle untenable. Team observed but did not act",
          "left through the kitchen exit instead of the main door — an alternate route not previously observed. Team scrambled but lost visual in the alley",
          "appeared agitated and was on the phone throughout the meal. Left quickly, drove erratically — possible warning received. Operation aborted",
        ]),
    },
  ];

  var method = pick(SNATCH_METHODS);

  // --- Timeline ---
  entries.push({
    time: dayLabel(-2) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil authorized covert snatch of " +
      targetName +
      " in " +
      v.city +
      (v.country ? ", " + v.country : "") +
      ". Priority: ALIVE. " +
      v.primaryAsset +
      " tasked. " +
      callsign +
      " team assembled — " +
      randInt(3, 6) +
      " operators." +
      (hvtIdIntel ? " Target ID: " + hvtIdIntel + "." : "") +
      (v.confidence ? " Vigil confidence: " + v.confidence + "%." : ""),
  });

  entries.push({
    time: dayLabel(-1) + " " + zuluTime(-6),
    type: "normal",
    text:
      "Close target reconnaissance in progress. Weather: " +
      weather +
      ". " +
      (residenceIntel ? "Residence intel: " + residenceIntel + " " : "") +
      (movementIntel
        ? "Pattern of life: " + movementIntel
        : "Pattern of life under development from Vigil surveillance feeds."),
  });

  if (guardIntel) {
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(-2),
      type: "normal",
      text: "Security assessment: " + guardIntel,
    });
  }

  if (csIntel) {
    entries.push({
      time: dayLabel(-1) + " " + zuluTime(0),
      type: "normal",
      text: "Countersurveillance profile: " + csIntel,
    });
  }

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-4),
    type: "normal",
    text:
      method.setup +
      (isolationIntel
        ? " Isolation window per Vigil collection: " + isolationIntel
        : ""),
  });

  entries.push({
    time: dayLabel(0) + " " + zuluTime(-1),
    type: "normal",
    text:
      callsign +
      " team in final position. Vehicles staged. Comms check complete. Counter-surveillance screen reports area clean — no law enforcement, no hostile watchers. Standing by for execute.",
  });

  if (success) {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "critical",
      text: method.exec_success,
    });

    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(15, 30)),
      type: "success",
      text:
        "Subject conscious but disoriented. " +
        pick([
          "Flex-cuffs, hood, and noise-canceling headphones applied. Subject attempted to speak — told to remain silent.",
          "Subject regained awareness in the vehicle. Calm — almost resigned. Said nothing.",
          "Subject woke agitated, tested the restraints, then went still. No words exchanged.",
          "Subject came around during the drive. Tried to memorize turns. Operatives took a deliberately circuitous route to disorient.",
        ]) +
        " Transfer vehicle switched at a prearranged point " +
        randInt(8, 25) +
        " minutes from the grab site.",
    });

    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Subject delivered to " +
        pick([
          "a secure facility via underground parking entrance. No exterior exposure.",
          "an Agency safehouse on the outskirts of " +
            v.city +
            ". Property is clean — used once, burned after.",
          "a federal black site. Subject processed: biometrics, photographs, personal effects catalogued and sealed.",
          "a secondary staging point. From there, transferred by unmarked aircraft to a secure interrogation facility.",
        ]) +
        (v.prisonerName
          ? " Prisoner designated: " + v.prisonerName + "."
          : "") +
        " Interrogation team standing by.",
    });

    if (networkIntel) {
      entries.push({
        time: dayLabel(0) + " " + zuluTime(4),
        type: "normal",
        text:
          "Preliminary exploitation of subject's personal effects: encrypted phone, " +
          pick([
            "3 SIM cards",
            "2 passport-quality IDs under different names",
            "a notebook with coded entries",
            "a USB drive — encrypted, sent to forensics",
          ]) +
          ". Network intelligence: " +
          networkIntel,
      });
    }
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "failure",
      text: method.exec_fail + ".",
    });

    entries.push({
      time: dayLabel(0) + " " + zuluMinOffset(0, randInt(5, 15)),
      type: "failure",
      text:
        callsign +
        " team withdrawing from area. " +
        pick([
          "Subject is now aware of hostile intent — will alter all patterns and possibly flee " +
            v.city +
            ".",
          "No compromise of team identity. However, subject will assume surveillance and take countermeasures.",
          "Team vehicles clear of the area. No law enforcement contact. But the window is closed — subject will not be this exposed again.",
          "Abort was clean — no witnesses, no evidence. But subject's routine has been disrupted. Will need to rebuild pattern-of-life from scratch.",
        ]),
    });

    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "normal",
      text:
        "Vigil assessing whether subject has fled or gone to ground. " +
        pick([
          "SIGINT shows a burst of encrypted communications from subject's phone — likely contacting handlers or associates.",
          "Subject's vehicle has not returned to known locations. Mobile device powered off.",
          "Subject seen returning to his residence 2 hours later. May not realize the attempt was directed — could attribute it to street crime.",
          "Subject booked a flight out of " +
            v.city +
            " within 90 minutes of the failed grab. Currently airborne.",
        ]),
    });
  }

  var assessment = success
    ? "Covert snatch operation " +
      v.codename +
      " in " +
      v.city +
      " successful. " +
      targetName +
      " captured alive without gunfire, witnesses, or law enforcement involvement. Subject is in custody and available for interrogation." +
      (isDomestic
        ? " Operation was conducted without legal authorization on US soil — classification: EYES ONLY."
        : "")
    : "Covert snatch operation " +
      v.codename +
      " failed to acquire " +
      targetName +
      ". Subject evaded capture and is now likely aware of hostile intent. All previously collected pattern-of-life intelligence should be considered burned. " +
      (isDomestic
        ? "Risk of subject contacting media or law enforcement is elevated."
        : "Subject may flee " + v.city + " or seek protection from allies.");

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  BURN_NOTICE — Diplomatic exposure of foreign illegal
// =====================================================================

DEBRIEF_GENERATORS.BURN_NOTICE = function (op, v, success) {
  var entries = [];
  var agencyLabel = v.agency || "foreign intelligence service";
  var hostCountry = v.burnNoticeCountry || v.country || "the host country";
  var coverIntel = getIntel(v, "COVER_IDENTITY");
  var serviceIntel = getIntel(v, "SPONSORING_SERVICE");

  entries.push({
    time: dayLabel(-2) + " " + zuluTime(0),
    type: "normal",
    text:
      "Vigil compiled evidence package documenting " +
      v.orgName +
      "'s intelligence activities in " +
      v.city +
      ", " +
      v.country +
      ". Sponsoring service: " +
      agencyLabel +
      ".",
  });
  entries.push({
    time: dayLabel(-1) + " " + zuluTime(0),
    type: "normal",
    text:
      "Evidence package transmitted to " +
      hostCountry +
      " counterintelligence liaison." +
      (serviceIntel ? " Attribution: " + serviceIntel : "") +
      (coverIntel ? " Cover identity documented: " + coverIntel + "." : ""),
  });

  if (success) {
    var boost = v.burnNoticeBoost || randInt(15, 20);
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "success",
      text:
        hostCountry +
        " confirmed receipt and verified the intelligence. " +
        v.orgName +
        " declared persona non grata. Expulsion in progress.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "success",
      text:
        "Diplomatic back-channel: " +
        hostCountry +
        " appreciates the sharing. Relations improved by " +
        boost +
        "%. Counterintelligence investigation opened into " +
        agencyLabel +
        " activities.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(4),
      type: "normal",
      text:
        agencyLabel +
        "'s local station is scrambling. Exposed operative being withdrawn. SIGINT confirms spike in encrypted comms between station and headquarters.",
    });
  } else {
    entries.push({
      time: dayLabel(0) + " " + zuluTime(0),
      type: "failure",
      text:
        hostCountry +
        " declined to act on the evidence. Political considerations outweigh counterintelligence concerns.",
    });
    entries.push({
      time: dayLabel(0) + " " + zuluTime(2),
      type: "failure",
      text:
        "Burn notice failed. " +
        v.orgName +
        " remains operational. " +
        agencyLabel +
        " has been alerted — they will rotate the agent and adjust tradecraft.",
    });
  }

  var assessment = success
    ? "Burn notice " +
      v.codename +
      " exposed " +
      agencyLabel +
      "'s operative in " +
      v.city +
      ", " +
      v.country +
      ". " +
      hostCountry +
      " expelled the agent. Relations improved. No prisoner — operative expelled rather than detained."
    : "Burn notice " +
      v.codename +
      " failed. " +
      hostCountry +
      " declined to act. " +
      agencyLabel +
      "'s operative remains in place but now aware of US interest.";

  return [buildTimeline(entries), buildAssessment(assessment)];
};
