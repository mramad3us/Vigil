/* ============================================================
   VIGIL — systems/debriefs.js
   Faux13-style after-action reports. Every line parametrized
   with real op/asset data. 19 generator types, success/failure
   branches, helmet-cam-level climax detail for SOF operations.
   ============================================================ */

// --- Vocabulary Pools ---

var DEBRIEF_CALLSIGNS = [
  'VANGUARD', 'SENTINEL', 'OVERLORD', 'GUARDIAN', 'WARDEN', 'PALADIN',
  'SPECTER', 'PHANTOM', 'NOMAD', 'ROGUE', 'BISHOP', 'KNIGHT',
  'CASTLE', 'PROPHET', 'ORACLE', 'REAPER', 'HUNTER', 'PROWLER',
  'TALON', 'RAZOR', 'SABER', 'RAPTOR', 'CONDOR', 'VULTURE',
  'WRAITH', 'SHADE', 'EMBER', 'FROST', 'APEX', 'ZENITH',
];

var DEBRIEF_WEATHER = [
  'Clear skies, visibility unlimited',
  'Partial cloud cover at 8,000ft, visibility 10km',
  'Overcast, ceiling at 3,000ft, light rain',
  'Heavy cloud cover, intermittent precipitation',
  'Sandstorm conditions, visibility reduced to 500m',
  'Dense fog, visibility under 200m',
  'Clear with high winds, 35kt gusting to 50kt',
  'Scattered thunderstorms in AO',
  'Night operations — no illumination, new moon',
  'Tropical humidity, temperatures exceeding 45°C',
];

var DEBRIEF_BREACH = [
  'Explosive breach on primary entry point',
  'Simultaneous entry through two access points',
  'Covert infiltration via an unguarded perimeter section',
  'Rooftop insertion via fast-rope',
  'Subsurface approach through drainage infrastructure',
  'Vehicle-borne approach under cover of civilian traffic',
  'Maritime insertion from rigid-hull inflatable boats',
  'HALO insertion from 25,000ft AGL',
  'Diversionary action drew guards; primary team entered undetected',
  'Electronic lock bypass followed by silent entry',
];

var DEBRIEF_EVIDENCE = [
  'Communications equipment and encrypted storage devices',
  'Financial records linking the organization to state funding',
  'Weapons cache including military-grade ordnance',
  'Biometric data and identity documents of cell members',
  'Planning documents detailing future operations',
  'Chemical precursors consistent with IED manufacturing',
  'Satellite phones with recoverable call history',
  'Laptop computers containing operational correspondence',
  'Maps and surveillance photography of potential targets',
  'Cash reserves totaling approximately $2.3M USD',
];

var DEBRIEF_COMPROMISE = [
  'counter-surveillance detected the approach',
  'an encrypted communication was intercepted by the target',
  'a local informant alerted the target organization',
  'unexpected civilian presence in the operational area',
  'target relocated to an alternate site 6 hours prior',
  'electronic countermeasures disrupted team communications',
  'hostile QRF responded faster than intelligence predicted',
  'weather conditions degraded ISR coverage at a critical moment',
];

var DEBRIEF_EXFIL = [
  'Exfiltration via tiltrotor to a forward staging area',
  'Ground exfil to a pre-positioned extraction vehicle',
  'Maritime extraction by submarine',
  'Helicopter extraction under covering fire',
  'Overland movement to a safe house, extraction at dawn',
  'Commercial cover — team departed via civilian aviation',
  'Exfil to a nearby allied military installation',
  'Emergency extraction via V-22 Osprey under hostile fire',
  'Dispersed exfil — team members departed individually over 48 hours',
];

// --- SOF Detail Pools (helmet-cam-level) ---

var SOF_APPROACH = [
  'Team moved single-file along the compound\'s eastern wall. Point man held fist up — team froze. Guard patrol passed within 15 meters.',
  'Split into two-man pairs. Alpha pair covered the courtyard from the roofline. Bravo pair stacked on the door.',
  'Crawled through 80m of irrigation ditch to reach the compound\'s blind spot. NVGs showed two sentries on the north gate.',
  'Inserted via MH-6 Little Birds, touching down 400m from the objective. Moved on foot through a dry wadi bed.',
  'Low-crawled across an open field for 200m. Thermal showed the compound\'s generator running — masked the approach noise.',
  'Approached via an adjacent building\'s rooftop. Bridged a 3m gap between structures using a portable ladder.',
];

var SOF_BREACH_DETAIL = [
  'Breacher placed a strip charge on the hinges. "Set." "Execute." The door blew inward. Team flowed through the smoke.',
  'Flashbang through the window — BANG. Two-second count. First man through the doorframe, weapon up, sweeping left.',
  'Shotgun breach on the lock. First man kicked the remnants clear. Rifle up, IR laser cutting through the dust.',
  'Simultaneous breach — front and rear. Both charges detonated within 50ms of each other. Total surprise achieved.',
  'Silent breach — hydraulic ram on the door frame. Hinges popped without a sound. Team entered on NODs.',
  'Charge on the wall itself — created a new entry point where none existed. Team poured through the ragged opening.',
  'Mechanical breach — halligan bar jammed into the doorframe. Two sharp blows. Door split off the hinges. Flashbang in, team in.',
  'Thermite charge on the reinforced door. Metal glowed orange, sagged. Team kicked through the weakened frame. Smoke boiling.',
  'Window entry — operators fast-roped onto the balcony, smashed through floor-to-ceiling glass. Inside in under two seconds.',
];

var SOF_ROOM_CLEAR = [
  'First room: two hostiles, both armed. Team leader double-tapped the near man. Number two engaged the far target. Both down in under a second.',
  'Hallway — three doors. Point man pieing the first corner. Muzzle flash from inside. Return fire — two rounds center mass. "Clear left."',
  'Kitchen area. One hostile reached for an AK behind the counter. Operator closed the distance, controlled the weapon, transitioned to sidearm. Threat neutralized.',
  'Stairwell. Fragmentation grenade from above. Team pulled back. Waited. Grenade detonated on empty landing. Team surged up the stairs, clearing by sectors.',
  'Second floor. Three rooms. First — empty. Second — non-combatant, flex-cuffed and moved to collection point. Third — hostile with suicide vest. Precision headshot from 4m.',
  'Long corridor with no cover. Operator laid suppressive fire while number two flanked through an adjacent room. Caught the hostile in crossfire.',
  'Bedroom — door slightly ajar. Point man pushed it with his boot. Hostile behind the bed, PKM braced on the mattress. Burst of fire shredded the door frame. Team pulled back, tossed a frag. Detonation. Silence. Entered. Hostile KIA, weapon destroyed.',
  'Storage room. Empty on visual sweep. Operator heard breathing behind stacked crates. IR laser found the man crouched with an AK pointed at the door. Two suppressed rounds from the HK416 before he could pull the trigger.',
  'Bathroom. Hostile tried to barricade the door. Operator shouldered it open — the man stumbled backward into the tub. Sidearm drawn, two rounds. Threat down. Checked his hands — no dead man\'s switch. Clear.',
  'Open courtyard. Three hostiles caught in the open, scrambling for weapons stacked against the far wall. Sniper from overwatch dropped the first. Assault team engaged the other two from the doorway — four rounds, both down. "Courtyard clear."',
  'Back room. Helmet cam caught the muzzle flash before the sound registered — rounds snapping past the point man\'s head. He dropped to a knee, returned fire. His IR laser found the hostile\'s chest. Three rounds. Hostile slid down the wall.',
  'Main hallway. Two hostiles appeared from a side door, AKs up. Point man dropped the first with a controlled pair to the head. Number two engaged the second — three rounds center mass, hostile stumbled back through the doorway. Team advanced past the bodies, weapons still smoking.',
  'Second floor landing. Hostile leaned over the railing with an RPG. Sniper saw it first — "RPG, second floor!" — single round through the man\'s shoulder. RPG clattered to the ground unfired. Follow-up shot from the assault team as they crested the stairs.',
  'Side room. Door was booby-trapped — tripwire visible on NODs. Breacher cut the wire, team entered through the window instead. One hostile inside, back turned, talking on a radio. Operator grabbed his collar, pulled him to the ground. Flex-cuffed. Radio seized.',
  'Narrow stairway to the roof. Blood trail on the steps — wounded hostile had crawled up. Found him on the landing, pistol in hand, trying to aim through the pain. Operator kicked the weapon away. Medic applied a tourniquet. Detained.',
  'Ground floor corridor. Team stacked on a T-intersection. Point man used a mirror — two hostiles with RPKs covering the hallway. Frag grenade around the corner. Explosion. Team flowed in. Both hostiles down, one still moving. Controlled pair. "Intersection clear."',
];

// --- Extended Combat Sequences (multi-step engagement narratives) ---

var SOF_GROUND_FLOOR_CLEAR = [
  'Ground floor: team split into two elements. Alpha took the east wing — first room empty, overturned furniture, radio still warm. Bravo pushed west, stacking on a closed metal door. Banging from inside. Breacher set a charge. "Breaching." Door blew. Two hostiles behind a flipped table — one firing blind over the top. Alpha-1 put two rounds through the table surface. Second hostile threw his weapon and put his hands up.',
  'Ground floor was a maze of narrow corridors. Point man moved in a combat glide, muzzle tracking every doorway. First contact — hostile stepped into the hall carrying an ammunition can. Didn\'t even see the team. Two suppressed rounds. He went down without a sound. Team stepped over the body and pushed forward.',
  'Ground floor. Kitchen was the first room off the hallway. Point man sliced the pie on the doorframe — hostile sitting at a table, disassembling a phone. He looked up. Saw the IR laser on his chest. Raised his hands. Flex-cuffed in three seconds. Team pushed to the next room.',
  'Main entrance hall. Overhead light swinging from the breach detonation. Glass crunching underfoot. Two hostiles ran from a back room, one carrying documents. Lead operator shouted the challenge word. No response. Both men raised weapons. Four rounds from two shooters. Both hostile down. Documents scattered across the floor — SSE team would collect later.',
];

var SOF_UPPER_FLOOR_CLEAR = [
  'Second floor. The stairwell was the funnel — worst part of any assault. Point man held a ballistic shield. Rounds pinging off the steel as he climbed. Number two fired past his shoulder, suppressed. Hostile at the top of the stairs took two rounds and fell backward. Team surged over the body and split left and right.',
  'Upper floor. First door — locked from inside. Flashbang through the gap above the door frame. BANG. Kick. Two hostiles, ears bleeding, stumbling. Near man got two rounds before he could orient. Far man tripped over a chair trying to reach his rifle. Operator closed the distance and put him on the ground. Flex-cuffed.',
  'Top floor. Helmet cam showed the hallway stretching out in green-tinted NOD vision. IR lasers criss-crossing the walls. Sound of someone racking a bolt. Team froze. Point man located the sound — last door on the left. Grenade. Wait. BOOM. Entry. One hostile KIA, slumped against the wall with an SVD sniper rifle across his lap.',
  'Second floor corridor. A burst of automatic fire raked the doorway as the team entered. Plaster and splinters everywhere. Point man pulled back — round had creased his plate carrier. Number two went low, leaned around the corner, and fired three rounds under a table where the hostile was crouched. Hits confirmed. Team moved up.',
  'Third floor. Two rooms remaining. First: blood on the floor, drag marks leading to the window. Hostile had jumped — overwatch reported a body in the alley below. Second room: reinforced door. Strip charge. Breach. Inside: communications equipment, maps, a cot. Recently occupied. Cigarette still burning in an ashtray. But the room was empty.',
];

var SOF_FINAL_CONTACT = [
  'Last room. Door was heavier than the others — steel-reinforced. Breacher used a double charge. The blast rattled the whole building. First man in. Movement behind an overturned desk. IR laser found a hand reaching for a pistol. "DON\'T. HANDS." The hand froze. Target pulled from behind the desk. Positive ID confirmed under white light.',
  'Master bedroom at the end of the hall. Two hostiles guarding the door — one with an AK, one with a chest rig full of magazines. Team engaged simultaneously. Point man dropped the AK-holder with a headshot. Number two put three rounds into the chest rig. Both down. Door breached. Inside: the target, alone, sitting on the bed. No weapon. No resistance.',
  'Final room. A hostile burst through the door before the team reached it — spraying AK fire wildly down the corridor. Rounds stitched across the ceiling. Point man dropped to prone and fired upward — two rounds caught the hostile in the pelvis. He crumpled. Team advanced. Through the door. Target was in the corner, hands visible, shaking.',
  'End of the corridor. The target\'s bodyguard made a stand in the doorway — emptied an entire magazine down the hall. Team pressed against the walls. Return fire. Bodyguard took four rounds and went down hard. Team entered over the body. Target was in the bathroom. Mirror showed his reflection — he was trying to flush a phone. Operator grabbed his arm. Target secured.',
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
  '"This is ' + pick(DEBRIEF_CALLSIGNS) + ' Actual. Objective FALCON is secure. Requesting extract."',
  '"Overwatch, we have squirters — two pax moving east. Can you interdict?" "Roger, tracking."',
];

var SOF_SSE = [
  'SSE team moved in immediately. Hard drives pulled. Cell phones bagged. Documents photographed in situ before collection.',
  'Found a hidden room behind a false wall. Inside: communications equipment, maps of potential targets, and $400K USD in shrink-wrapped bills.',
  'Biometric enrollment on all KIA and detained personnel. Fingerprints, iris scans, DNA swabs. Cross-referenced with the database in real-time.',
  'Recovered a laptop still powered on — encryption keys still in memory. NSA exploitation team will have full disk access.',
];

var SOF_FAILURE_DETAIL = [
  'Heavy automatic fire from multiple positions. Team was pinned in the courtyard with no cover.',
  'IED detonated in the entryway as point man crossed the threshold. Immediate casualty. Team medic rushed forward under fire.',
  'Hostile reinforcements arrived from an adjacent building — estimated squad-sized element. Team was outnumbered 3-to-1.',
  'RPG impacted the wall above the team\'s position. Debris injuries to two operators. Team leader called immediate withdrawal.',
  'Target escaped through a pre-prepared tunnel system. By the time the team located the exit, the target had a 20-minute head start.',
  'First room was rigged. Tripwire on the doorframe — breacher caught it at the last second but the blast blew out the interior wall. Two operators down with concussion injuries. Building structurally compromised.',
  'Heavy PKM fire from a prepared fighting position at the top of the stairs. Rounds punching through the plaster walls. Team couldn\'t advance. Called for gun support but the helicopter couldn\'t get a firing solution without risking the hostage.',
  'Hostile threw a thermite grenade into the server room before the team could reach it. Critical intelligence — hard drives, phones, documents — destroyed in seconds. The room was an inferno by the time operators got there.',
  'Ambush. The compound was a trap. Team entered through the breach point and immediately took fire from three directions. Prepared positions with interlocking fields of fire. The whole thing was a setup.',
];

var DOMESTIC_LOCATIONS = [
  'a residential neighborhood', 'a commercial district', 'an industrial park',
  'a downtown high-rise', 'a suburban apartment complex', 'a rural compound',
  'a warehouse district', 'a shipping terminal', 'a motel off the interstate',
];

var LE_ENTRY = [
  'Agents established a perimeter. Entry team stacked on the front door. "FBI, search warrant!" No response.',
  'SWAT breached simultaneously at front and rear. Flashbangs deployed. Occupants ordered to the ground.',
  'Plain-clothes agents approached from multiple directions. Target was taken into custody without resistance on the street.',
  'Agents served the warrant at 0600. Target answered the door in civilian clothes. Placed in handcuffs and read Miranda rights.',
  'Vehicle stop on the interstate. Agents boxed the target\'s vehicle. Felony stop procedures. Driver extracted at gunpoint.',
];

// --- Main Entry Point ---

function generateDebrief(op, success) {
  var v = op.fillVars || {};
  var generator = DEBRIEF_GENERATORS[op.operationType];
  if (!generator) generator = DEBRIEF_GENERATORS.MILITARY_STRIKE;

  var sections = generator(op, v, success);
  return assemblDebrief(sections, op, success);
}

// --- Debrief Assembly ---

function assemblDebrief(sections, op, success) {
  var html = '';
  html += headerSection(op, success);
  html += deployedSection(op);
  html += vigilAssessmentSection(op);

  for (var i = 0; i < sections.length; i++) {
    html += sections[i];
  }

  html += viabilityImpactSection(op);
  html += classificationFooter(op);
  return html;
}

// --- Common Sections ---

function headerSection(op, success) {
  var outcomeClass = success ? 'debrief-success' : 'debrief-failure';
  var outcomeLabel = success ? 'MISSION SUCCESS' : 'MISSION FAILURE';
  var dt = dayToDate(V.time.day, V.time.year, V.time.month);
  var dateStr = dt.dayOfMonth + ' ' + MONTH_NAMES[dt.month] + ' ' + dt.year;

  return '<div class="debrief-header">' +
    '<div class="debrief-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
    '<div class="debrief-title">AFTER-ACTION REPORT</div>' +
    '<div class="debrief-codename">' + op.codename + '</div>' +
    '<div class="debrief-outcome ' + outcomeClass + '">' + outcomeLabel + '</div>' +
    '<div class="debrief-date">' + dateStr + ' — ' + (op.location ? op.location.city + ', ' + op.location.country : 'UNKNOWN AO') + '</div>' +
  '</div>';
}

function deployedSection(op) {
  if (!op.assignedAssetIds || op.assignedAssetIds.length === 0) return '';

  var html = '<div class="debrief-section">' +
    '<div class="debrief-section-title">DEPLOYED ASSETS</div>' +
    '<div class="debrief-assets">';

  for (var i = 0; i < op.assignedAssetIds.length; i++) {
    var asset = getAsset(op.assignedAssetIds[i]);
    if (!asset) continue;
    var base = getBase(asset.homeBaseId);
    var catInfo = ASSET_CATEGORIES[asset.category] || {};

    html += '<div class="debrief-asset-card">' +
      '<div class="debrief-asset-cat" style="color:' + (catInfo.color || 'var(--text)') + '">' + (catInfo.shortLabel || asset.category) + '</div>' +
      '<div class="debrief-asset-name">' + asset.name + '</div>' +
      '<div class="debrief-asset-origin">Origin: ' + (base ? base.name + ', ' + base.country : 'Unknown') + '</div>' +
    '</div>';
  }

  html += '</div></div>';
  return html;
}

function vigilAssessmentSection(op) {
  if (!op.options || op.selectedOptionIdx === undefined) return '';

  var selected = op.options[op.selectedOptionIdx];
  var recommended = op.options[op.vigilRecommendedIdx];
  var deviated = op.deviatedFromVigil;

  var html = '<div class="debrief-section">' +
    '<div class="debrief-section-title">VIGIL ASSESSMENT</div>' +
    '<div class="debrief-vigil-assessment">';

  html += '<div class="debrief-meta-row">' +
    '<span class="debrief-meta-key">SELECTED OPTION</span>' +
    '<span class="debrief-meta-val">' + selected.label + ' (Confidence: ' + selected.confidencePercent + '%)</span>' +
  '</div>';

  if (deviated && recommended) {
    html += '<div class="debrief-meta-row debrief-deviation">' +
      '<span class="debrief-meta-key">VIGIL RECOMMENDED</span>' +
      '<span class="debrief-meta-val">' + recommended.label + ' (Confidence: ' + recommended.confidencePercent + '%)</span>' +
    '</div>' +
    '<div class="debrief-deviation-note">OPERATOR DEVIATED FROM VIGIL RECOMMENDATION. This deviation has been logged and will be factored into viability assessment.</div>';
  } else {
    html += '<div class="debrief-compliance-note">Operator followed Vigil recommendation.</div>';
  }

  html += '</div></div>';
  return html;
}

function viabilityImpactSection(op) {
  if (op.viabilityDelta === undefined) return '';

  var delta = op.viabilityDelta;
  var deviated = op.deviatedFromVigil;
  var success = op.status === 'SUCCESS';
  var sign = delta >= 0 ? '+' : '';
  var color = delta > 0 ? 'var(--green)' : delta < 0 ? 'var(--red)' : 'var(--text-dim)';
  var currentViability = Math.round(V.resources.viability);

  var assessment;
  if (success && !deviated) {
    assessment = 'Operator adhered to Vigil-recommended course of action. Mission success validates system analysis. Viability standing reinforced.';
  } else if (success && deviated) {
    assessment = 'Mission objectives achieved despite operator deviation from Vigil recommendation. Outcome acknowledged, however the deviation introduces uncertainty into Vigil\'s predictive models. Reduced viability credit applied.';
  } else if (!success && !deviated) {
    assessment = 'Mission failure occurred while following Vigil-recommended course of action. System acknowledges shared responsibility for outcome. Minimal viability adjustment applied pending root-cause analysis.';
  } else {
    assessment = 'Mission failure compounded by unauthorized deviation from Vigil recommendation. The operator chose a course of action Vigil assessed as suboptimal, and the outcome confirms that assessment. Significant viability reduction applied. This pattern of judgment is being tracked.';
  }

  return '<div class="debrief-section">' +
    '<div class="debrief-section-title">VIABILITY IMPACT</div>' +
    '<div class="debrief-vigil-assessment">' +
      '<div class="debrief-meta-row">' +
        '<span class="debrief-meta-key">VIABILITY ADJUSTMENT</span>' +
        '<span class="debrief-meta-val" style="color:' + color + ';font-weight:700">' + sign + delta + '%</span>' +
      '</div>' +
      '<div class="debrief-meta-row">' +
        '<span class="debrief-meta-key">CURRENT VIABILITY</span>' +
        '<span class="debrief-meta-val">' + currentViability + '%</span>' +
      '</div>' +
      '<div style="margin-top:var(--sp-2);color:var(--text-dim);font-size:var(--fs-sm);line-height:1.6">' + assessment + '</div>' +
    '</div>' +
  '</div>';
}

function classificationFooter(op) {
  return '<div class="debrief-footer">' +
    '<div class="debrief-classification">TOP SECRET // SCI // VIGIL // NOFORN</div>' +
    '<div class="debrief-case-file">CASE FILE: ' + generateCaseFileId() + ' — VIGIL INTERNAL DISTRIBUTION ONLY</div>' +
  '</div>';
}

// --- Timeline Builder ---

function buildTimeline(entries) {
  var html = '<div class="debrief-section">' +
    '<div class="debrief-section-title">OPERATIONAL TIMELINE</div>' +
    '<div class="debrief-timeline">';

  for (var i = 0; i < entries.length; i++) {
    var e = entries[i];
    var cls = e.type === 'critical' ? ' critical' : e.type === 'failure' ? ' failure' : '';
    html += '<div class="debrief-timeline-entry' + cls + '">' +
      '<div class="debrief-timeline-time">' + e.time + '</div>' +
      '<div class="debrief-timeline-text">' + e.text + '</div>' +
    '</div>';
  }

  html += '</div></div>';
  return html;
}

function buildAssessment(text) {
  return '<div class="debrief-section">' +
    '<div class="debrief-section-title">STRATEGIC ASSESSMENT</div>' +
    '<div class="debrief-assessment">' + text + '</div>' +
  '</div>';
}

// --- Time Helpers ---

function zuluTime(hourOffset) {
  var h = (V.time.hour + hourOffset) % 24;
  if (h < 0) h += 24;
  return String(h).padStart(2, '0') + String(randInt(0, 59)).padStart(2, '0') + 'Z';
}

function zuluMinOffset(hourOffset, minOffset) {
  var h = (V.time.hour + hourOffset) % 24;
  if (h < 0) h += 24;
  var m = minOffset || 0;
  return String(h).padStart(2, '0') + String(m).padStart(2, '0') + 'Z';
}

function dayLabel(offset) {
  return 'D' + (offset >= 0 ? '+' : '') + offset;
}

// --- Generators ---

var DEBRIEF_GENERATORS = {};

// =====================================================================
//  MILITARY STRIKE
// =====================================================================

DEBRIEF_GENERATORS.MILITARY_STRIKE = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: v.primaryAsset + ' departed ' + v.primaryBase + '. Mission callsign: ' + callsign + '. Strike package assembled.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-5), type: 'normal', text: 'Pre-strike coordination with CAOC complete. Deconfliction verified. No friendly forces in the target area. ROE: Vigil Directive 3 applies.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Transit to ' + v.city + ', ' + v.country + '. Conditions: ' + weather + '. Tanker rendezvous on schedule.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'ISR assets established overwatch of target area in ' + v.city + '. ' + v.threatLevel + '/5 threat environment confirmed. Final target coordinates uploaded.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: callsign + ' at IP. All systems nominal. Weapons armed. Awaiting final clearance from Vigil operations center.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: '"' + callsign + ', you are cleared hot." Weapons release. ' + randInt(2, 6) + ' precision-guided munitions on target. Time on target: ' + randInt(3, 8) + ' seconds. Direct hits confirmed on ' + v.orgName + ' command-and-control infrastructure.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+5min', type: 'normal', text: 'Secondary explosions observed at target site — probable ammunition storage. Thermal imaging confirms structural collapse of primary building.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+20min', type: 'normal', text: 'BDA pass complete. ' + randInt(2, 4) + ' of ' + randInt(3, 5) + ' designated aim points destroyed. ' + v.orgName + ' communications traffic ceased from target facility.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Collateral damage assessment: minimal — no civilian structures impacted within assessed blast radius. Pattern-of-life analysis confirmed target was military in nature.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: pick(DEBRIEF_EXFIL) + '. All assets accounted for. No battle damage sustained.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: callsign + ' initiated strike sequence. Weapons away. ' + randInt(2, 4) + ' munitions released on target coordinates.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+3min', type: 'normal', text: 'Initial BDA: impacts observed in target area. However, ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+30min', type: 'failure', text: 'Detailed BDA reveals primary target — ' + v.orgName + ' command post — was not in the struck structures. Intelligence now indicates the facility was vacated ' + randInt(4, 24) + ' hours prior to the strike. Decoy activity detected at the site.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Collateral damage assessment: ' + pick(['under review — adjacent civilian structure sustained minor damage', 'clean — only military structures affected', 'one non-target structure within blast radius, damage assessment pending']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Assets recovered to ' + v.primaryBase + '. Intelligence gap identified — Vigil initiating review of source reliability for target confirmation.' });
  }

  var assessment = success ?
    'Operation ' + v.codename + ' achieved its primary objective in the ' + v.theater + ' theater. ' + v.orgName + '\'s operational capability in ' + v.city + ' has been significantly degraded. SIGINT confirms disruption to their command network. Theater risk assessment adjusted downward.' :
    'Operation ' + v.codename + ' failed to achieve its primary objective. ' + v.orgName + ' remains operational in ' + v.city + ', ' + v.country + '. Intelligence suggests the target was alerted prior to the strike. Vigil is reviewing the intelligence chain and assessing whether source compromise occurred. Theater risk remains elevated.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  SOF RAID — Helmet-cam-level detail
// =====================================================================

DEBRIEF_GENERATORS.SOF_RAID = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var hostileCount = randInt(6, 18);
  var teamSize = randInt(12, 24);
  var entries = [];

  // --- Pre-mission ---
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(-8), type: 'normal', text: v.primaryAsset + ' staged at forward operating base near ' + v.city + '. ' + teamSize + '-man assault element. Final intelligence brief received from Vigil. Target: ' + v.orgName + ' compound, grid reference classified.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(-4), type: 'normal', text: 'Mission rehearsal complete. Scale model of target compound constructed from ISR imagery. Entry points designated Alpha through Delta. Contingency plans for ' + randInt(3, 5) + ' abort scenarios reviewed.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: 'Kit check. Weapons function-tested. Comms check on all nets. Medic verified blood types and trauma supplies for all team members. NODs calibrated.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Team ' + callsign + ' departed for insertion. ' + weather + '. Aviation assets: ' + pick(['2x MH-60M Black Hawks + 1x MH-47G Chinook for extract', '2x MH-6M Little Birds + 1x AH-6 for gun support', '1x CV-22 Osprey + 2x AH-64 Apache escort']) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Overwatch established. ISR feed shows ' + hostileCount + ' military-age males in and around the compound. ' + randInt(1, 3) + ' vehicles parked outside. Pattern-of-life consistent with Vigil intelligence package. "Jackpot" individual\'s presence ' + (success ? 'confirmed by positive identification' : 'assessed as probable') + '.' });

  // --- Approach and insertion ---
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: pick(SOF_APPROACH) });
  entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(0, 5)), type: 'normal', text: 'Assault element in final assault position. Snipers in overwatch — ' + randInt(2, 4) + ' positions covering all egress routes. "All stations, I have control. Stand by... stand by..."' });

  if (success) {
    // --- Climax: successful breach and clear (expanded room-by-room) ---
    var kia = 0;
    var detained = 0;

    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(5, 8)), type: 'critical', text: '"EXECUTE EXECUTE EXECUTE." ' + pick(SOF_BREACH_DETAIL) });

    // Ground floor fighting
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(8, 9)), type: 'critical', text: pick(SOF_GROUND_FLOOR_CLEAR) });
    kia += randInt(1, 3);

    // Room-by-room clearing
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(9, 11)), type: 'critical', text: pick(SOF_ROOM_CLEAR) });
    kia += randInt(1, 2);

    // Sniper engagement during assault
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(11, 12)), type: 'critical', text: pick(SOF_SNIPER_ENGAGEMENT) });
    kia += 1;

    // Upper floor push
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(12, 14)), type: 'critical', text: pick(SOF_UPPER_FLOOR_CLEAR) });
    kia += randInt(1, 2);

    // Additional contact
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(14, 16)), type: 'critical', text: pick(SOF_ROOM_CLEAR) });

    // Final target contact
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(16, 18)), type: 'critical', text: pick(SOF_FINAL_CONTACT) });
    detained += randInt(0, 2);

    // JACKPOT call
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(18, 20)), type: 'critical', text: '"All stations, JACKPOT. I say again, JACKPOT." Target ' + (v.targetAlias || 'HVT') + ' positively identified and ' + pick(['secured', 'neutralized', 'detained']) + '. ' + kia + ' hostile KIA. ' + detained + ' detained.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(20, 24)), type: 'normal', text: 'Compound secured. All rooms cleared. Helmet cams reviewed — every engagement accounted for. Team accounting: all ' + teamSize + ' operators present. ' + randInt(0, 2) + ' minor injuries — shrapnel and abrasions treated on site.' });

    // --- SSE ---
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(24, 30)), type: 'normal', text: pick(SOF_SSE) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(30, 40)), type: 'normal', text: 'SSE complete. Total time on objective: ' + randInt(25, 45) + ' minutes. All items catalogued and packaged for transport. Demolition charges set on remaining weapons cache.' });

    // --- Extract ---
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(40, 55)), type: 'normal', text: pick(DEBRIEF_EXFIL) + '. ' + (v.targetAlias || 'HVT') + ' secured aboard extract aircraft. Zero friendly KIA.' });
  } else {
    // --- Climax: compromised assault (expanded with combat detail) ---
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(5, 8)), type: 'critical', text: '"EXECUTE EXECUTE EXECUTE." ' + pick(SOF_BREACH_DETAIL) });

    // Initial contact — things seem normal
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(8, 10)), type: 'critical', text: pick(SOF_ROOM_CLEAR) });

    // Then it goes wrong
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(10, 12)), type: 'critical', text: pick(SOF_FAILURE_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(12, 14)), type: 'failure', text: pick(SOF_ROOM_CLEAR) + ' But ' + pick(DEBRIEF_COMPROMISE) + '. Compound alarm triggered. Hostile QRF mobilizing from ' + randInt(2, 5) + ' blocks away.' });

    // Target not found
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(14, 18)), type: 'failure', text: 'Target ' + (v.targetAlias || 'HVT') + ' not located in expected position. Intelligence indicated room ' + pick(['2A', '3B', '1C', 'ground floor east']) + ' — room was empty. ' + pick(['Evidence of recent occupation — warm tea, still-lit cigarette', 'Bed unmade, personal effects removed', 'Room had been stripped clean within the last hour']) + '.' });

    // Continued fighting during withdrawal
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(18, 22)), type: 'failure', text: pick(SOF_SNIPER_ENGAGEMENT) + ' But hostiles are massing at the compound perimeter. Muzzle flashes from adjacent rooftops.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(22, 25)), type: 'normal', text: 'Team leader: "We\'re dry on the objective. Calling abort." ' + randInt(1, 3) + ' WIA — ' + pick(['gunshot wound to the leg, non-life-threatening', 'fragmentation injuries from improvised explosive', 'blast concussion from RPG near-miss']) + '. Medic applying treatment under fire.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, randInt(25, 35)), type: 'normal', text: 'Emergency extraction. Gun runs by escort helicopters suppressed hostile reinforcements. Team extracted under fire. All wounded stable.' });
  }

  var assessment = success ?
    'Operation ' + v.codename + ': SOF raid on ' + v.orgName + ' compound in ' + v.city + ' achieved all objectives. Target ' + (v.targetAlias || 'HVT') + ' captured/neutralized. Sensitive materials recovered for exploitation by Vigil analysis division. ' + v.primaryAsset + ' returning to ' + v.primaryBase + '. Zero friendly KIA.' :
    'Operation ' + v.codename + ': SOF raid on ' + v.orgName + ' in ' + v.city + ' did not achieve primary objective. Target ' + (v.targetAlias || 'HVT') + ' was not present at the compound — intelligence suggests early warning enabled departure. ' + randInt(1, 3) + ' operators WIA, all expected to return to duty. Operational security review initiated. Vigil is re-evaluating source reliability.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  SURVEILLANCE
// =====================================================================

DEBRIEF_GENERATORS.SURVEILLANCE = function(op, v, success) {
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: v.primaryAsset + ' tasked for persistent surveillance of ' + v.orgName + ' activities in ' + v.city + ', ' + v.country + '. Collection priority: network mapping and communications intercept.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'ISR platform on station. Full-spectrum coverage initiated — SIGINT, IMINT, and pattern-of-life analysis. Collection plan synchronized with Vigil targeting cell.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Initial pattern-of-life data being compiled. Tracking ' + randInt(4, 12) + ' persons of interest across ' + randInt(2, 5) + ' locations in ' + v.city + '.' });

  if (success) {
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Identified ' + randInt(3, 8) + ' previously unknown associates of ' + v.orgName + '. Network map updated with new communication links and meeting locations.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(8), type: 'normal', text: 'SIGINT breakthrough: intercepted an unencrypted voice call between two senior ' + v.orgName + ' operatives discussing logistics for an upcoming operation.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(4), type: 'critical', text: 'Critical intelligence obtained: ' + pick(DEBRIEF_EVIDENCE) + '. Data transmitted to Vigil for analysis. Cross-referencing with existing threat models.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(12), type: 'normal', text: 'Key facility identified: ' + v.orgName + ' using a ' + pick(['warehouse', 'residential building', 'commercial office', 'religious compound']) + ' as a logistics hub. Geo-tagged for future targeting.' });
    entries.push({ time: dayLabel(3) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance window complete. Asset repositioned. ' + randInt(80, 200) + ' hours of collected data processed. ' + randInt(12, 30) + ' actionable intelligence reports generated.' });
  } else {
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Limited collection achieved. ' + v.orgName + ' employing counter-surveillance measures in ' + v.city + '. Targets using encrypted communications and irregular movement patterns.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(12), type: 'normal', text: 'Multiple targets observed conducting surveillance detection routes. Professional tradecraft — possible foreign intelligence training.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(4), type: 'failure', text: 'Target organization went dark after suspected detection of ISR platform. ' + pick(DEBRIEF_COMPROMISE) + '. All tracked individuals changed communications methods simultaneously.' });
    entries.push({ time: dayLabel(3) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance terminated. Minimal actionable intelligence collected. Target awareness of Vigil interest confirmed. Recommend stand-down period before re-tasking.' });
  }

  var assessment = success ?
    'Surveillance of ' + v.orgName + ' in ' + v.city + ' yielded high-value intelligence. Network analysis has identified new nodes for future targeting. Intel score increased. Recommend sustained collection posture in ' + v.theater + ' theater.' :
    'Surveillance operation against ' + v.orgName + ' in ' + v.city + ' compromised. Counter-surveillance by the target resulted in loss of collection capability. ' + v.orgName + ' is likely to adjust TTPs. Alternative collection methods recommended.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  NAVAL INTERDICTION
// =====================================================================

DEBRIEF_GENERATORS.NAVAL_INTERDICTION = function(op, v, success) {
  var entries = [];
  var vesselName = 'MV ' + pick(['ATLANTIC HORIZON', 'PACIFIC STAR', 'NORTHERN SPIRIT', 'GOLDEN DAWN', 'IRON MERCHANT', 'SILVER CREST', 'OCEAN TIGER', 'DESERT WIND']);
  var flag = pick(['Panama', 'Liberia', 'Marshall Islands', 'Comoros', 'Togo', 'Moldova']);

  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: v.primaryAsset + ' departed ' + v.primaryBase + '. Ordered to establish interdiction zone near ' + v.city + ', ' + v.country + '. Maritime patrol area: ' + randInt(200, 800) + ' square nautical miles.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Transit to operational area. ' + pick(DEBRIEF_WEATHER) + '. Sea state ' + randInt(2, 5) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Naval assets on station. Interdiction zone established. All vessels entering the area subject to query and possible inspection. P-8 maritime patrol aircraft providing wide-area surveillance.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Suspect vessel identified: ' + vesselName + ', ' + flag + '-flagged, ' + randInt(4000, 15000) + ' DWT. AIS data inconsistent with declared route. Closing to intercept.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: vesselName + ' ordered to stop for inspection. Vessel initially non-compliant — warning shots fired across bow. Vessel hove to. VBSS team deployed from RHIB.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+45min', type: 'critical', text: 'Board-and-search underway. Forward cargo hold: ' + pick(DEBRIEF_EVIDENCE) + '. Concealed in modified shipping containers beneath legitimate cargo.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Vessel seized. ' + randInt(12, 25) + ' crew members detained and processed. Ship\'s logs and navigation data recovered — revealing ' + v.orgName + '\'s maritime supply network across ' + randInt(3, 6) + ' ports.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: vesselName + ' escorted to port under prize crew. Interdiction zone maintained for 12 additional hours. No further contacts. ' + v.primaryAsset + ' released to return to homeport.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Multiple vessels inspected over ' + randInt(8, 16) + ' hour period. ' + randInt(3, 7) + ' VBSS operations conducted. No contraband detected.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(6), type: 'failure', text: 'Intelligence indicates ' + v.orgName + '\'s shipment diverted to alternate route before interdiction zone was established. SIGINT intercept suggests the cargo transited via ' + pick(['overland route through a neighboring country', 'fishing vessel transfer at sea', 'small craft in coastal waters outside the patrol area']) + '.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Interdiction terminated. ' + v.primaryAsset + ' returning to ' + v.primaryBase + '. Shipment is assessed to have reached its destination. ' + v.orgName + '\'s awareness of naval patrol patterns confirmed.' });
  }

  var assessment = success ?
    'Naval interdiction near ' + v.city + ' successfully disrupted ' + v.orgName + '\'s maritime logistics. Seized cargo and crew provide actionable intelligence on the supply chain. Vessel ' + vesselName + ' and contents transferred to evidence custody. Recommend sustained maritime presence.' :
    'Interdiction failed to intercept target shipment. ' + v.orgName + ' demonstrated awareness of naval patrol patterns and adapted. Intelligence timeline was insufficient — recommend earlier deployment in future operations.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  CYBER OP
// =====================================================================

DEBRIEF_GENERATORS.CYBER_OP = function(op, v, success) {
  var entries = [];
  var implantName = pick(['NIGHTFALL', 'COBALT', 'IRONSIDE', 'GLASSBREAK', 'OVERCAST', 'SANDCASTLE']);

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: v.primaryAsset + ' initiated cyber operation against ' + v.orgName + '\'s network infrastructure in ' + v.city + ', ' + v.country + '. Target: ' + pick(['C2 servers', 'financial network', 'communications infrastructure', 'operational planning systems']) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Reconnaissance phase complete. Attack surface mapped. ' + randInt(3, 8) + ' potential access vectors identified. Initial access vector selected: ' + pick(['spear-phishing with weaponized document', 'exploitation of unpatched VPN appliance', 'supply chain compromise via third-party vendor', 'watering hole attack on known associate website', 'zero-day in target\'s custom web application']) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Initial access achieved. Establishing persistence via implant ' + implantName + '. Lateral movement in progress through target network. ' + randInt(3, 12) + ' internal hosts enumerated.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'Privilege escalation successful — domain administrator credentials obtained. Full Active Directory access. ' + randInt(40, 200) + ' user accounts enumerated across ' + randInt(3, 8) + ' organizational units.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Objective achieved. ' + randInt(2, 8) + 'TB of data exfiltrated from ' + v.orgName + '\'s servers via covert channel. Implants ' + implantName + '-A through -' + String.fromCharCode(65 + randInt(2, 5)) + ' deployed across ' + randInt(4, 10) + ' critical systems for persistent access.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Email server compromised — ' + randInt(6, 24) + ' months of communications archived. Encryption keys extracted from key management server. Future SIGINT collection against this target dramatically simplified.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Operational cleanup complete. Logs sanitized. Attribution indicators scrubbed. Implant beaconing set to low-and-slow profile — ' + randInt(6, 24) + ' hour callback interval to avoid detection.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'Lateral movement detected by target\'s EDR solution. Alert generated in their security operations center. Attempting to evade detection...' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'failure', text: 'Intrusion detected and contained. ' + v.orgName + '\'s security team isolated the compromised segment within ' + randInt(8, 30) + ' minutes. ' + pick(DEBRIEF_COMPROMISE) + '. Implant ' + implantName + ' burned.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: v.orgName + ' initiated network-wide incident response. All credentials rotated. Partial data collection — ' + randInt(50, 500) + 'MB recovered before access was severed. Intelligence value limited.' });
  }

  var assessment = success ?
    'Cyber operation against ' + v.orgName + ' in ' + v.country + ' achieved comprehensive network penetration. Persistent access established for ongoing intelligence collection. Data exploitation in progress — initial analysis reveals ' + pick(DEBRIEF_EVIDENCE).toLowerCase() + '. Vigil SIGINT division has been briefed on the new collection capability.' :
    'Cyber operation detected and contained by ' + v.orgName + '\'s defensive capabilities within their ' + v.city + ' infrastructure. Target network has been hardened. Access vector ' + implantName + ' is burned and cannot be reused. Recommend alternative collection approaches for this target in the ' + v.theater + ' theater.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  HOSTAGE RESCUE — Detailed climax
// =====================================================================

DEBRIEF_GENERATORS.HOSTAGE_RESCUE = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var hostageCount = randInt(3, 12);
  var teamSize = randInt(16, 32);
  var entries = [];

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: v.primaryAsset + ' deployed from ' + v.primaryBase + '. ' + teamSize + '-operator rescue force. ' + hostageCount + ' hostages confirmed held by ' + v.orgName + ' in ' + v.city + ', ' + v.country + '.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(6), type: 'normal', text: 'Crisis negotiation cell established. Vigil providing real-time intelligence on hostage conditions and captor behavior. ISR feed active on target building.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Rescue plan finalized. ' + randInt(3, 5) + ' entry points identified. Sniper teams positioned on ' + randInt(2, 4) + ' rooftops. Emergency medical team staged ' + randInt(200, 500) + 'm from the objective.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'ISR confirmed hostage location: ' + pick(['second floor, east wing', 'ground floor, central room', 'basement level', 'third floor, rear']) + '. ' + randInt(4, 10) + ' armed captors identified via thermal and audio surveillance.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'Team ' + callsign + ' at final assault positions. All elements report ready. Negotiation team maintaining contact with captors as cover for assault preparation.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"GREEN GREEN GREEN." Simultaneous breach on all entry points. Flashbangs deployed. ' + pick(SOF_BREACH_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 1), type: 'critical', text: 'Entry hall. Two captors scrambled for weapons. Point man\'s IR laser found the first — double tap, center mass. He dropped. Second hostile raised an AK. Number two operator put three rounds through his chest before the muzzle came level. "FRIENDLIES, STAY DOWN." Screaming from the hostages on the floor.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: pick(SOF_ROOM_CLEAR) + ' Clearing toward hostage holding area.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'critical', text: pick(SOF_SNIPER_ENGAGEMENT) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 4), type: 'critical', text: 'Hostage room. Helmet cam showed the door — reinforced, barricaded from inside. Breacher placed a water charge to minimize fragmentation. BANG. Door blew in. ' + randInt(2, 4) + ' captors guarding hostages — one reached for a detonator on the table. Sniper took the shot through the window simultaneously with the breach team entry. Round caught the man\'s hand. Detonator skittered across the floor. Operators engaged the remaining captors — controlled pairs, all targets down in under two seconds. All ' + hostageCount + ' hostages recovered alive.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 6), type: 'normal', text: '"Precious cargo secure. ' + hostageCount + ' souls, all breathing." Hostages evacuated to casualty collection point. ' + randInt(0, 3) + ' minor injuries — shock and minor abrasions. No life-threatening conditions.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 15), type: 'normal', text: 'Building secured. ' + randInt(4, 8) + ' hostile KIA. ' + randInt(0, 2) + ' captured alive. EOD team cleared ' + randInt(1, 3) + ' IEDs that had been rigged to the hostage room — the captors were prepared to kill the hostages if the rescue took ten seconds longer.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: pick(DEBRIEF_EXFIL) + '. Hostages transferred to medical facility. All operators accounted for — zero friendly casualties.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"GREEN GREEN GREEN." Breach initiated. ' + pick(SOF_BREACH_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 1), type: 'critical', text: 'Immediate heavy contact in the entry hallway. PKM fire from a prepared position shredded the doorframe. Point man took fragments to the plate carrier — knocked back but functional. Team returned fire, suppressed. ' + pick(DEBRIEF_COMPROMISE) + '. Captors were alerted.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: pick(SOF_ROOM_CLEAR) + ' But the clock was running — captors knew the team was inside.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'failure', text: 'Explosion in the hostage holding area. Captors detonated a prepared charge. The blast wave knocked the assault team flat in the corridor. Ears ringing, dust everywhere. Team fought through to the room — ' + randInt(1, Math.max(1, Math.floor(hostageCount / 3))) + ' hostages killed, ' + randInt(1, 3) + ' critically wounded. Remaining hostages recovered alive with injuries.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 5), type: 'critical', text: 'Remaining captors engaged in a last stand from a back room. ' + pick(SOF_ROOM_CLEAR) + ' All captors neutralized.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 8), type: 'normal', text: 'Building secured. ' + randInt(1, 2) + ' operators WIA. Emergency medical evacuation for wounded hostages and team members. Multiple ambulances on scene.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Scene secured. Evidence preservation underway. Casualty notification process initiated for hostage fatalities.' });
  }

  var assessment = success ?
    'Hostage rescue in ' + v.city + ', ' + v.country + ' was a complete success. All ' + hostageCount + ' hostages recovered alive. ' + v.orgName + ' cell eliminated. The operation demonstrated precise coordination between ISR, sniper, and assault elements. Zero friendly KIA.' :
    'Hostage rescue in ' + v.city + ' resulted in hostage fatalities. Captors executed their contingency plan before the assault team could secure the holding area. ' + v.orgName + '\'s defensive preparations exceeded intelligence estimates. Vigil is conducting a review of the intelligence gap.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  COUNTER TERROR
// =====================================================================

DEBRIEF_GENERATORS.COUNTER_TERROR = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var cellSize = randInt(4, 12);
  var raidLocations = randInt(2, 5);
  var entries = [];

  entries.push({ time: dayLabel(-3) + ' ' + zuluTime(0), type: 'normal', text: 'Vigil intelligence identified ' + v.orgName + ' cell preparing an attack in ' + v.city + ', ' + v.country + '. Cell estimated at ' + cellSize + ' members. ' + v.primaryAsset + ' tasked for counter-terrorism operation.' });
  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance established on ' + randInt(3, 6) + ' known cell members. Pattern-of-life analysis underway. ' + randInt(2, 4) + ' safe houses identified across ' + v.city + '.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'SIGINT intercept confirms attack timeline — ' + v.orgName + ' cell plans to execute within ' + randInt(24, 72) + ' hours. Attack materiel confirmed at location ' + pick(['Alpha', 'Bravo', 'Charlie']) + '. Coordinated takedown authorized.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Team ' + callsign + ' elements positioned at ' + raidLocations + ' target locations across ' + v.city + '. Local security forces briefed on cordon responsibilities. Medical and EOD teams staged.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: '"All stations: execute." Simultaneous raids across ' + raidLocations + ' locations. Doors breached at ' + String(raidLocations) + ' sites within a 30-second window.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 1), type: 'critical', text: 'Location Alpha: ' + pick(SOF_BREACH_DETAIL) + ' ' + randInt(2, 4) + ' suspects inside — one dove for a weapon under the mattress. Operator pinned his arm, kicked the pistol away. All suspects flex-cuffed face-down.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'critical', text: 'Location Bravo: hostile opened fire through the door as the team stacked. Rounds punching through the wood. Team pulled offline. Flashbang through the window. Re-entry. ' + randInt(1, 3) + ' hostile KIA. One suspect hiding in a closet — dragged out and detained.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 5), type: 'critical', text: 'Location Charlie: ' + randInt(1, 3) + ' suspects surrendered immediately upon seeing the assault team. Hands up before the first operator was fully through the door. Apartment full of bombmaking materials — wires, detonators, bags of ammonium nitrate.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 20), type: 'normal', text: 'All locations secured. ' + randInt(6, 12) + ' total suspects detained. ' + v.orgName + ' cell leadership — including the attack planner — in custody. Helmet cam footage captured everything for prosecution.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Attack materiel recovered: ' + pick(DEBRIEF_EVIDENCE) + '. EOD team rendered safe ' + randInt(1, 4) + ' IEDs found ready for deployment. Planned attack disrupted prior to execution.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(3), type: 'normal', text: 'All detained subjects transferred to secure facility for interrogation. Initial interrogation producing intelligence on wider ' + v.orgName + ' network. No civilian casualties. No friendly casualties.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: '"All stations: execute." Raids initiated simultaneously. However, ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: 'Location Alpha: ' + pick(SOF_BREACH_DETAIL) + ' Premises empty — recently vacated. Warm food on the table, electronics wiped. Smell of soldering flux — bombmaking happened here.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 5), type: 'failure', text: 'Location Bravo: brief contact. ' + randInt(1, 2) + ' low-level operatives detained after a scuffle in the stairwell. One tried to swallow a SIM card. Cell leadership not present at any target location.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 10), type: 'failure', text: 'Location Charlie: door was booby-trapped. Breacher detected the tripwire — EOD called in. By the time the room was cleared, any occupants were long gone. Back window open, fire escape ladder deployed.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 30), type: 'normal', text: 'Sweep of all target locations complete. Only ' + randInt(1, 3) + ' of ' + cellSize + ' cell members apprehended. Core network — including the attack planner — has dispersed. Attack materiel not recovered.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: v.orgName + ' posted a statement on encrypted channels claiming credit for evading the operation. Attack timeline may have been accelerated or redirected to alternate target.' });
  }

  var assessment = success ?
    'Counter-terrorism operation in ' + v.city + ' successfully dismantled ' + v.orgName + '\'s operational cell. Imminent attack disrupted. Detained subjects providing intelligence under interrogation. Threat to ' + v.theater + ' theater reduced.' :
    'Counter-terrorism operation failed to neutralize ' + v.orgName + '\'s core leadership. The cell was alerted and dispersed before takedown. Attack materiel remains unrecovered — the threat is still active. Enhanced surveillance and alternative approaches recommended.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DIPLOMATIC RESPONSE
// =====================================================================

DEBRIEF_GENERATORS.DIPLOMATIC_RESPONSE = function(op, v, success) {
  var entries = [];

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-8), type: 'normal', text: v.primaryAsset + ' dispatched to ' + v.city + ', ' + v.country + ' to manage diplomatic situation involving ' + v.orgName + '. Vigil situation brief transmitted via secure channel.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Arrived in ' + v.city + '. Initial coordination with US Embassy staff and allied diplomatic representatives. Media monitoring activated — ' + randInt(3, 8) + ' international outlets covering the situation.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Secure communications established with Washington. Vigil providing real-time intelligence support on ' + v.orgName + '\'s political connections and leverage points.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Initial meeting with ' + v.country + ' counterparts. Tone: ' + pick(['cautious but receptive', 'tense but professional', 'unexpectedly cooperative']) + '. Key demands presented through back-channel.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Back-channel negotiations progressing. ' + v.country + ' delegation responsive to intelligence package demonstrating ' + v.orgName + '\'s activities. Framework for cooperation emerging.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(0), type: 'critical', text: 'Agreement reached. ' + v.country + ' has agreed to terms that protect US interests and address the ' + v.orgName + ' situation. Public-facing statement coordinated. Crisis de-escalated.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(8), type: 'normal', text: 'Intelligence gathered during negotiations forwarded to Vigil. ' + v.country + ' shared ' + randInt(2, 5) + ' previously unknown data points on ' + v.orgName + '\'s regional operations.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Initial meeting with ' + v.country + ' counterparts. Tone: ' + pick(['hostile and dismissive', 'polite but non-committal', 'deeply suspicious of US intentions']) + '.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Negotiations stalled. ' + v.country + ' delegation refusing to engage on key issues. Media coverage intensifying — leaked details are shaping public opinion against US position.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(0), type: 'failure', text: 'Diplomatic effort in ' + v.city + ' collapsed. ' + v.country + ' has issued a public condemnation of US involvement. Allied partners expressing concern. The situation has deteriorated beyond the scope of the original mission.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(8), type: 'normal', text: v.primaryAsset + ' recalled. Damage assessment: bilateral relations with ' + v.country + ' degraded. ' + v.orgName + ' likely emboldened by the diplomatic failure.' });
  }

  var assessment = success ?
    'Diplomatic response in ' + v.city + ' achieved de-escalation. US interests in ' + v.theater + ' theater preserved. Relations with ' + v.country + ' stabilized. Intelligence gathered during negotiations has been forwarded to Vigil for integration into threat models.' :
    'Diplomatic response failed. Relations with ' + v.country + ' have deteriorated further. Theater risk in ' + v.theater + ' increased. Recommend alternative approaches including economic leverage and allied coordination.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  INTEL COLLECTION
// =====================================================================

DEBRIEF_GENERATORS.INTEL_COLLECTION = function(op, v, success) {
  var sourceCode = generateSourceCode();
  var entries = [];

  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: v.primaryAsset + ' deployed to ' + v.city + ', ' + v.country + '. Cover identity established. Target: ' + v.orgName + ' network intelligence collection.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Case officer established operational base in ' + v.city + '. Counter-surveillance route validated. No hostile indicators detected. Source ' + sourceCode + ' contacted via dead drop — meeting arranged.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Pre-meeting surveillance of rendezvous site. ' + randInt(2, 4) + ' counter-surveillance passes. Site assessed as clean. Meeting location: ' + pick(['hotel lobby', 'public park', 'commercial café', 'underground parking structure', 'private residence']) + '.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Meeting with source ' + sourceCode + '. Source provided verbal debrief on ' + v.orgName + '\'s current activities, leadership changes, and upcoming operational plans.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'critical', text: 'Source ' + sourceCode + ' delivered physical materials: ' + pick(DEBRIEF_EVIDENCE) + '. Intelligence corroborated by existing SIGINT intercepts. Assessed as high-confidence.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Follow-up meeting established for ' + randInt(5, 14) + ' days. Source recruited for ongoing reporting with monthly contact schedule. Cover story intact. No counter-intelligence indicators detected.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Case officer departed ' + v.city + ' via commercial cover. Materials transmitted to Vigil via secure channel. Source ' + sourceCode + ' assessed as reliable — graded B-2 on the admiralty scale.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Case officer arrived at meeting site. Source ' + sourceCode + ' ' + pick(['45 minutes late and visibly agitated', 'failed to appear — no signal at dead drop', 'sent an intermediary with a warning message']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'failure', text: pick(DEBRIEF_COMPROMISE) + '. Source ' + sourceCode + ' ' + pick(['is assessed as compromised — likely under hostile control', 'may have been doubled by ' + v.orgName + '\'s counter-intelligence', 'sent a distress signal indicating imminent danger']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(3), type: 'normal', text: 'Case officer executed emergency exfiltration protocol. Left ' + v.city + ' via ' + pick(['overland route to border crossing', 'commercial flight under backup identity', 'maritime extraction from coastal rendezvous']) + '. No pursuit detected but counter-intelligence exposure assessed as high.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Source ' + sourceCode + ' status: unknown. All associated sub-sources placed on administrative hold. ' + v.orgName + '\'s counter-intelligence capabilities in ' + v.country + ' have been reassessed upward. Network requires reconstruction.' });
  }

  var assessment = success ?
    'Intelligence collection against ' + v.orgName + ' in ' + v.city + ' was successful. Source ' + sourceCode + ' is producing high-value reporting. Vigil has integrated new intelligence into threat models for ' + v.theater + ' theater. Sustained collection recommended.' :
    'Intelligence collection operation in ' + v.city + ' compromised. Source ' + sourceCode + ' is presumed lost. ' + v.orgName + '\'s counter-intelligence capabilities in ' + v.country + ' exceeded estimates. All collection assets in theater placed under review.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DRONE STRIKE
// =====================================================================

DEBRIEF_GENERATORS.DRONE_STRIKE = function(op, v, success) {
  var entries = [];
  var munitionType = pick(['AGM-114R Hellfire', 'GBU-39 Small Diameter Bomb', 'AGM-179 JAGM', 'GBU-12 Paveway II']);

  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-8), type: 'normal', text: v.primaryAsset + ' launched from ' + v.primaryBase + '. Target package: ' + v.orgName + ' leadership in ' + v.city + ', ' + v.country + '. Estimated time on station: ' + randInt(8, 16) + ' hours.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Platform on station over ' + v.city + '. Altitude: ' + randInt(15, 25) + ',000ft. ' + pick(DEBRIEF_WEATHER) + '. Sensor suite active — EO/IR and SIGINT collection initiated.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Target compound under observation. Pattern-of-life monitoring established. Tracking ' + randInt(3, 8) + ' individuals at the site. Waiting for positive identification of ' + (v.targetAlias || 'HVT') + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'PID confirmed: ' + (v.targetAlias || 'HVT') + ' positively identified by ' + pick(['facial recognition match at 94% confidence', 'gait analysis consistent with known profile', 'SIGINT — target\'s personal device confirmed at location', 'multiple corroborating HUMINT sources']) + '. Strike authorization requested.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '-5min', type: 'normal', text: 'Strike authorization confirmed by operator. Collateral damage estimate reviewed — ' + pick(['no civilians within blast radius', 'one non-combatant structure adjacent, risk assessed as acceptable', 'civilians cleared from the area in the last 30 minutes']) + '. Weapons release authorized under Vigil Directive 3. ' + munitionType + ' selected.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Weapons release. ' + randInt(1, 3) + 'x ' + munitionType + ' away. Time of flight: ' + randInt(15, 45) + ' seconds. Impact. Direct hit on target structure. ' + (v.targetAlias || 'HVT') + ' was in the building at time of impact.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+2min', type: 'normal', text: 'Post-strike observation. Structure destroyed. Secondary explosion observed — probable weapons or ammunition storage. No movement at the target site.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+15min', type: 'normal', text: 'BDA complete. Target ' + (v.targetAlias || 'HVT') + ' assessed KIA with high confidence. ' + randInt(2, 5) + ' additional hostile casualties confirmed. Collateral damage: ' + pick(['none observed', 'minimal — adjacent wall damaged', 'one non-target vehicle destroyed']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: v.primaryAsset + ' remained on station for ' + randInt(1, 3) + ' additional hours monitoring for hostile activity. ' + v.orgName + '\'s communications traffic from the area ceased completely. Platform returning to ' + v.primaryBase + '.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Weapons release. ' + randInt(1, 2) + 'x ' + munitionType + ' away. Impact on target coordinates. However — ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+2min', type: 'failure', text: 'Post-strike observation: target structure partially destroyed, but real-time sensor data indicates ' + (v.targetAlias || 'HVT') + ' departed the compound ' + randInt(10, 45) + ' minutes prior to strike. Vehicle observed leaving the area shortly before weapons release.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+30min', type: 'normal', text: 'BDA: ' + randInt(1, 3) + ' hostile casualties at target site — none matching ' + (v.targetAlias || 'HVT') + '\'s profile. Collateral damage assessment: ' + pick(['minimal', 'under review', 'one civilian structure within blast radius sustained damage']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: v.primaryAsset + ' maintaining station to track ' + (v.targetAlias || 'HVT') + '\'s possible escape route. Target vehicle lost in urban environment. Platform returning to ' + v.primaryBase + ' at bingo fuel.' });
  }

  var assessment = success ?
    'Drone strike on ' + v.orgName + ' in ' + v.city + ', ' + v.country + ' achieved target elimination. ' + (v.targetAlias || 'HVT') + ' confirmed KIA. ' + v.orgName + '\'s leadership structure disrupted. SIGINT confirms network-wide communications disruption. ' + v.primaryAsset + ' available for retasking.' :
    'Drone strike failed to eliminate ' + (v.targetAlias || 'HVT') + '. Target departed the site prior to weapons release — possible early warning via counter-surveillance or compromised intelligence. The strike may have revealed Vigil\'s surveillance capability in ' + v.country + '. Target expected to relocate and increase security posture.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  HVT ELIMINATION
// =====================================================================

DEBRIEF_GENERATORS.HVT_ELIMINATION = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var weather = pick(DEBRIEF_WEATHER);
  var teamSize = randInt(12, 24);
  var entries = [];

  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: 'Vigil issued kill/capture authorization for ' + (v.targetAlias || 'HVT') + ', senior ' + v.orgName + ' operative, located in ' + v.city + ', ' + v.country + '. ' + v.primaryAsset + ' assigned. ' + teamSize + '-man kill team.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Target surveillance package activated. ' + (v.targetAlias || 'HVT') + '\'s residence, known associates, and pattern-of-life mapped. Positive ID established via ' + pick(['long-range photography', 'SIGINT device signature', 'HUMINT source corroboration']) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: 'Team ' + callsign + ' staged at forward position. ' + weather + '. ISR confirms target at ' + pick(['primary residence', 'known associate\'s compound', 'commercial property used as office']) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: pick(SOF_APPROACH) });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'All teams in position. Overwatch confirms ' + randInt(3, 8) + ' personnel at target location. ' + (v.targetAlias || 'HVT') + ' positively identified on thermal. "We have eyes on JACKPOT."' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"Execute." ' + pick(SOF_BREACH_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 1), type: 'critical', text: pick(SOF_GROUND_FLOOR_CLEAR) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: pick(SOF_ROOM_CLEAR) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'critical', text: pick(SOF_SNIPER_ENGAGEMENT) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 4), type: 'critical', text: pick(SOF_UPPER_FLOOR_CLEAR) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 6), type: 'critical', text: 'Target room. ' + (v.targetAlias || 'HVT') + ' identified by the IR strobe on the helmet cam. Target reached for a weapon under the desk. Point man didn\'t hesitate — ' + randInt(2, 4) + ' rounds center mass. Target slumped forward. "JACKPOT is EKIA." Biometric confirmation initiated — fingerprints and facial match: positive.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 12), type: 'normal', text: pick(SOF_SSE) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 25), type: 'normal', text: 'SSE complete. Compound secured. ' + randInt(5, 9) + ' hostile KIA total. ' + randInt(0, 3) + ' detained. All team members accounted for.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: pick(DEBRIEF_EXFIL) + '. ' + (v.targetAlias || 'HVT') + '\'s remains recovered for DNA confirmation. Zero friendly casualties.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"Execute." ' + pick(SOF_BREACH_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: pick(SOF_ROOM_CLEAR) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'failure', text: pick(SOF_FAILURE_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 5), type: 'failure', text: pick(SOF_ROOM_CLEAR) + ' But the compound is emptying. ' + (v.targetAlias || 'HVT') + ' not found at expected location.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 8), type: 'failure', text: 'Full compound sweep complete. ' + (v.targetAlias || 'HVT') + ' is not present. Evidence suggests departure via ' + pick(['underground tunnel system', 'concealed vehicle exit', 'rooftop escape to adjacent building']) + ' within minutes of team arrival. Security was tighter than intelligence predicted.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 12), type: 'normal', text: pick(SOF_SNIPER_ENGAGEMENT) + ' Hostile reinforcements arriving from the east.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 20), type: 'normal', text: 'Emergency extraction. ' + randInt(1, 3) + ' operators WIA. ' + pick(DEBRIEF_EXFIL) + '. Target remains at large.' });
  }

  var assessment = success ?
    'HVT elimination operation ' + v.codename + ' achieved primary objective. ' + (v.targetAlias || 'HVT') + ' — senior ' + v.orgName + ' operative — confirmed EKIA with biometric verification. Sensitive materials recovered. ' + v.orgName + '\'s leadership structure in ' + v.city + ' decapitated.' :
    'HVT elimination failed. ' + (v.targetAlias || 'HVT') + ' evaded the assault team, likely via a pre-prepared escape route. ' + v.orgName + '\'s counter-intelligence in ' + v.country + ' reassessed as highly capable. Target will increase security posture. Vigil recommends alternative approach.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  HVT CAPTURE
// =====================================================================

DEBRIEF_GENERATORS.HVT_CAPTURE = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var teamSize = randInt(16, 28);
  var entries = [];

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Vigil issued capture order for ' + (v.targetAlias || 'HVT') + ', ' + v.orgName + ' operative, in ' + v.city + ', ' + v.country + '. Priority: ALIVE for interrogation. ' + v.primaryAsset + ' assigned — ' + teamSize + ' operators.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: 'ISR confirms target at location. Non-lethal options prepared: flashbangs, CS gas, flex-cuffs. Designated marksmen briefed: weapon-arm shots only unless life-threatening situation.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Team ' + callsign + ' at final assault position. ' + pick(SOF_APPROACH) });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"Execute." CS gas deployed into target structure via windows. ' + pick(SOF_BREACH_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: pick(SOF_GROUND_FLOOR_CLEAR) + ' Operators calling targets before engaging — priority is keeping the principal alive.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'critical', text: pick(SOF_ROOM_CLEAR) + ' Non-lethal protocols observed where possible.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 4), type: 'critical', text: pick(SOF_UPPER_FLOOR_CLEAR) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 6), type: 'critical', text: (v.targetAlias || 'HVT') + ' located in ' + pick(['a locked interior room — could hear coughing from the CS gas', 'attempting to destroy documents — shredder jammed, papers half-fed', 'hiding in a concealed space behind a bookshelf — thermal signature gave him away']) + '. Target detained without lethal force. Flex-cuffed, hooded, and moved to collection point. "PRECIOUS CARGO SECURE."' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 15), type: 'normal', text: pick(SOF_SSE) });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: (v.targetAlias || 'HVT') + ' transported to secure interrogation facility via ' + pick(['helicopter', 'armored vehicle convoy', 'fixed-wing aircraft']) + '. Initial health screening complete — no injuries. Zero friendly casualties.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"Execute." ' + pick(SOF_BREACH_DETAIL) + ' Target structure more fortified than intelligence indicated.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: pick(SOF_ROOM_CLEAR) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'critical', text: pick(SOF_FAILURE_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 5), type: 'failure', text: (v.targetAlias || 'HVT') + ' barricaded in an interior room. Bodyguards engaged the assault team — helmet cam showed muzzle flashes from two positions. During the firefight, target ' + pick(['ingested a cyanide capsule — team medic unable to revive', 'was caught in crossfire — GSW to the chest, pronounced dead on scene', 'escaped through a concealed exit before the room was breached']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 10), type: 'normal', text: pick(SOF_SNIPER_ENGAGEMENT) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 15), type: 'normal', text: 'Compound secured. ' + randInt(2, 5) + ' hostile KIA, ' + randInt(0, 3) + ' detained. ' + (v.targetAlias || 'HVT') + ' ' + pick(['confirmed dead — intelligence value lost', 'at large — all checkpoints alerted', 'critically wounded — medevac attempted but DOA at field hospital']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: pick(DEBRIEF_EXFIL) + '. Mission objective — live capture — not achieved.' });
  }

  var assessment = success ?
    'HVT capture operation ' + v.codename + ' successful. ' + (v.targetAlias || 'HVT') + ' is in custody and available for interrogation. Initial exploitation expected to yield critical intelligence on ' + v.orgName + '\'s network, operational plans, and state sponsors. Vigil interrogation team en route.' :
    'HVT capture operation failed to secure ' + (v.targetAlias || 'HVT') + ' alive. The intelligence value of a live capture has been lost. Vigil recommends immediate exploitation of any recovered materials and reassessment of ' + v.orgName + '\'s security protocols.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  TARGETED KILLING
// =====================================================================

DEBRIEF_GENERATORS.TARGETED_KILLING = function(op, v, success) {
  var entries = [];
  var method = pick(['precision air strike', 'vehicle-borne IED on target route', 'sniper team at overwatch position', 'armed drone loiter-and-strike']);

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Vigil authorized targeted killing of ' + (v.targetAlias || 'HVT') + ', ' + v.orgName + ' operative, in ' + v.city + ', ' + v.country + '. Method: ' + method + '. ' + v.primaryAsset + ' tasked.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Assets in position. Target\'s pattern of life monitored. Expected window of opportunity: ' + pick(['morning commute between 0700-0800 local', 'evening meeting at known associate\'s residence', 'weekly visit to a commercial establishment', 'departure from compound for scheduled event']) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'PID confirmed. ' + (v.targetAlias || 'HVT') + ' observed at anticipated location. ' + pick(['No civilian bystanders within danger zone', 'Minimal civilian presence — 2 non-combatants at edge of blast radius, acceptable under ROE', 'Area is clear']) + '. Awaiting final authorization.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Authorization received. Action executed. ' + (v.targetAlias || 'HVT') + ' ' + pick(['struck by precision munition — no time to react', 'engaged by sniper team — two rounds, both hits, target down immediately', 'vehicle destroyed by directed charge — no survivors']) + '. Confirmed EKIA.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+10min', type: 'normal', text: 'Post-action surveillance confirms target eliminated. ' + pick(['Local emergency services responding — cover story holding', 'Area secured by allied local forces', 'Clean operation — no witnesses to the action itself']) + '. Collateral damage: none.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Assets exfiltrated from area without detection. Attribution assessment: ' + pick(['impossible to attribute — appears accidental', 'low — could be attributed to rival faction', 'moderate — forensics may indicate state actor']) + '.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Action executed. However — ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+5min', type: 'failure', text: (v.targetAlias || 'HVT') + ' ' + pick(['survived — armored vehicle absorbed the blast', 'was not in the expected vehicle — decoy detected too late', 'was shielded by bodyguards who took the impact', 'had already departed the area when the action was initiated']) + '. Target alive and aware of assassination attempt.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Assets exfiltrated. ' + v.orgName + ' has gone to ground. ' + (v.targetAlias || 'HVT') + ' will significantly increase personal security. Future opportunities will be harder to create.' });
  }

  var assessment = success ?
    'Targeted killing of ' + (v.targetAlias || 'HVT') + ' in ' + v.city + ' successful. ' + v.orgName + '\'s operational leadership disrupted. The action was conducted with minimal attribution risk and zero collateral damage.' :
    'Targeted killing attempt against ' + (v.targetAlias || 'HVT') + ' failed. Target survived and is aware of Vigil\'s intent. Future operations against this target will face significantly enhanced security measures. ' + v.orgName + ' may use the attempt for propaganda purposes.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  ASSET EXTRACTION
// =====================================================================

DEBRIEF_GENERATORS.ASSET_EXTRACTION = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var sourceCode = generateSourceCode();
  var entries = [];

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'FLASH priority: Vigil source ' + sourceCode + ' compromised in ' + v.city + ', ' + v.country + '. ' + v.orgName + ' counter-intelligence has identified the asset. Immediate extraction authorized. ' + v.primaryAsset + ' tasked.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(4), type: 'normal', text: 'Emergency contact protocol activated. Source ' + sourceCode + ' reached via dead drop — confirmed alive, under surveillance but not yet detained. Extraction window estimated at ' + randInt(12, 36) + ' hours before ' + v.orgName + ' acts.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Team ' + callsign + ' in ' + v.city + '. Extraction plan: ' + pick(['vehicle pickup at pre-arranged safe point, overland to border', 'maritime extraction from coastal rendezvous', 'helicopter extraction from rooftop of allied facility', 'commercial air departure under false identity']) + '. Backup plans Alpha through Charlie prepared.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'Source ' + sourceCode + ' moving to extraction point. Counter-surveillance team reports ' + pick(['no hostile tail detected — route appears clean', '2 possible surveillance vehicles — taking evasive action', 'foot surveillance team detected, source running SDR']) + '.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Source ' + sourceCode + ' arrived at extraction point. Identity confirmed by team ' + callsign + '. Source and immediate family (' + randInt(0, 3) + ' dependents) boarded extraction vehicle. Moving to phase line ALPHA.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: pick(['Passed through checkpoint without incident — cover documentation held', 'Evasive routing through ' + v.city + ' suburbs to avoid known surveillance zones', 'Brief vehicle swap at safe house — counter-surveillance confirmed no tail']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(3), type: 'normal', text: 'Source ' + sourceCode + ' and dependents crossed into safe territory. Transferred to secure facility for debriefing. All extraction team members accounted for — clean operation, no hostile contact.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Source ' + sourceCode + ' completing full debrief. Resettlement process initiated. Cover identities being destroyed. ' + v.orgName + ' expected to discover the extraction within ' + randInt(12, 48) + ' hours.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Source ' + sourceCode + ' arrived at extraction point under obvious hostile surveillance. Team ' + callsign + ' initiated contact. ' + v.orgName + ' security forces converged on the area.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0) + '+15min', type: 'failure', text: pick(['Source ' + sourceCode + ' detained by hostile security forces before extraction vehicle could depart. Team ' + callsign + ' forced to abort — engaging would have resulted in international incident', 'Vehicle pursuit through ' + v.city + '. Extraction vehicle disabled by roadblock. Source ' + sourceCode + ' captured. Team ' + callsign + ' evaded on foot', 'Source ' + sourceCode + ' failed to reach extraction point — last communication indicated armed men at the door. Signal lost']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Team ' + callsign + ' exfiltrated ' + v.city + ' via emergency protocol. All team members accounted for but source ' + sourceCode + ' is in hostile custody. Source\'s intelligence value to ' + v.orgName + ' if interrogated: ' + pick(['critical — source had knowledge of Vigil operations across the theater', 'significant — source aware of multiple active operations', 'moderate — source was compartmented but knows handler identities']) + '.' });
  }

  var assessment = success ?
    'Asset extraction from ' + v.city + ', ' + v.country + ' successful. Source ' + sourceCode + ' and dependents are safe. Intelligence network in ' + v.country + ' is compromised but the source — a ' + randInt(3, 15) + '-year producer — has been preserved. Full debrief in progress.' :
    'Asset extraction failed. Source ' + sourceCode + ' is in ' + v.orgName + '\'s custody. Vigil\'s intelligence network in ' + v.country + ' must be considered fully compromised. All associated sources and operations placed on immediate stand-down. Damage assessment in progress.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DOMESTIC HOSTAGE RESCUE
// =====================================================================

DEBRIEF_GENERATORS.DOMESTIC_HOSTAGE_RESCUE = function(op, v, success) {
  var callsign = pick(DEBRIEF_CALLSIGNS);
  var hostageCount = randInt(4, 20);
  var entries = [];

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Hostage situation confirmed in ' + v.city + ', United States. ' + hostageCount + ' civilians held by ' + v.orgName + ' in ' + pick(['a commercial building', 'a government facility', 'a residential compound', 'a transportation hub']) + '. FBI HRT alerted. ' + v.primaryAsset + ' designated as primary assault element.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-6), type: 'normal', text: 'Crisis negotiation team established contact with ' + v.orgName + '. Demands: ' + pick(['political concessions and safe passage', 'release of imprisoned associates', 'ransom of $' + randInt(5, 50) + 'M', 'media broadcast of manifesto']) + '. Vigil assessing sincerity and hostage welfare.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Tactical teams positioned. ' + randInt(3, 5) + ' sniper teams in overwatch. Inner and outer perimeter established by local law enforcement. Medical teams staged. Media cordon holding.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'Negotiations deteriorating. ' + v.orgName + ' becoming increasingly agitated. Vigil intercepted communications suggesting deadline for hostage execution. Assault authorization granted by DOJ.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"Green light. Execute." Simultaneous entry — ' + pick(SOF_BREACH_DETAIL) + ' CS gas deployed through ventilation system to disorient captors.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 1), type: 'critical', text: 'Lobby area. Two captors coughing from the gas, weapons lowered. Lead operator rushed the nearest — controlled the rifle barrel, drove him into the wall. Flex-cuffed in seconds. Second captor raised his hands, choking. Detained.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'critical', text: pick(SOF_ROOM_CLEAR) + ' Operators advancing toward hostage location.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 3), type: 'critical', text: pick(SOF_SNIPER_ENGAGEMENT) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 4), type: 'critical', text: 'Hostage room. Reinforced door. Breacher placed a shaped water charge to avoid fragmentation toward hostages. BANG. Door flew in. ' + randInt(2, 5) + ' captors inside — one lunged for a detonator on the table. Sniper round came through the window at the same instant the breach team entered. Hit the man\'s wrist. Detonator went spinning. Second captor raised a pistol toward the hostages — two operators fired simultaneously. He crumpled. Remaining captors threw themselves flat. "ALL CLEAR. PRECIOUS CARGO SECURE."' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 6), type: 'normal', text: 'All ' + hostageCount + ' hostages recovered alive. Evacuated to triage. ' + randInt(0, 3) + ' minor injuries — stress reactions and abrasions. No life-threatening conditions. All team members accounted for.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 15), type: 'normal', text: 'Building secured. ' + randInt(4, 8) + ' hostile KIA or detained. EOD team cleared ' + randInt(1, 3) + ' IEDs rigged to the hostage room. Scene turned over to FBI Evidence Response Team. Media briefing coordinated with DOJ.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: randInt(1, 3) + ' surviving ' + v.orgName + ' members in federal custody. Hostages transported to local hospitals for evaluation. Zero friendly casualties.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 0), type: 'critical', text: '"Green light. Execute." Assault initiated. ' + pick(SOF_BREACH_DETAIL) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 1), type: 'critical', text: 'Entry hallway. Immediate contact — captor opened fire from behind a barricade of furniture. Rounds snapping down the corridor. Point man returned fire, suppressed. Number two flanked through a side office. Captor engaged from both sides — went down.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 2), type: 'failure', text: 'Captors triggered prepared explosive device in the hostage area upon hearing the gunfire. The blast wave blew out the windows on the south side. Assault team fought through smoke and debris to reach the room — ' + randInt(1, Math.max(1, Math.floor(hostageCount / 4))) + ' hostages killed, ' + randInt(1, 3) + ' critically wounded. Remaining hostages recovered alive with injuries.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 4), type: 'critical', text: pick(SOF_ROOM_CLEAR) + ' Remaining captors making a last stand. All neutralized.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 8), type: 'normal', text: 'Building secured. ' + (hostageCount - randInt(1, 3)) + ' hostages recovered alive, some with serious injuries. ' + randInt(0, 2) + ' operators WIA.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'normal', text: 'Mass casualty response initiated. Wounded transported to area hospitals. FBI assuming jurisdiction for criminal investigation. Casualty notification process initiated.' });
  }

  var assessment = success ?
    'Domestic hostage rescue in ' + v.city + ' was a complete success. All ' + hostageCount + ' hostages recovered alive. ' + v.orgName + ' cell neutralized on US soil. Operation conducted within Posse Comitatus guidelines — federal law enforcement maintained legal authority throughout.' :
    'Domestic hostage rescue in ' + v.city + ' resulted in hostage casualties. ' + v.orgName + '\'s prepared explosive contingency was triggered during the assault. Vigil is reviewing the pre-assault intelligence for indicators that the booby trap could have been anticipated.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  LAW ENFORCEMENT
// =====================================================================

DEBRIEF_GENERATORS.LAW_ENFORCEMENT = function(op, v, success) {
  var entries = [];
  var suspectsCount = randInt(3, 8);
  var warrantCount = randInt(2, 5);

  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: 'Federal warrants obtained for ' + warrantCount + ' locations associated with ' + v.orgName + ' in ' + v.city + ', United States. ' + v.primaryAsset + ' designated as lead agency. Vigil providing intelligence support.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Pre-raid coordination complete. ' + randInt(20, 60) + ' agents and officers from ' + randInt(2, 4) + ' agencies briefed. Target packages distributed. Tactical plans reviewed. Flash-bang and breach equipment staged.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-2), type: 'normal', text: 'All teams in position at ' + warrantCount + ' target locations across ' + v.city + '. Surveillance confirms ' + suspectsCount + ' targets at their expected locations. H-hour set.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: '"Execute." Simultaneous service of ' + warrantCount + ' warrants. ' + pick(LE_ENTRY) });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 15), type: 'normal', text: 'Location 1: ' + randInt(1, 3) + ' suspects detained. Location 2: ' + randInt(1, 3) + ' suspects in custody after brief standoff — talked down by negotiator. All locations secured within ' + randInt(20, 45) + ' minutes.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(1), type: 'critical', text: suspectsCount + ' total suspects arrested and processed. Evidence recovered: ' + pick(DEBRIEF_EVIDENCE) + '. No shots fired by federal agents.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: 'All suspects transported to federal holding. Initial interviews underway. Evidence chain of custody documented. US Attorney\'s office preparing charges.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: '"Execute." Warrant service initiated. ' + pick(LE_ENTRY) + ' However — ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 10), type: 'failure', text: randInt(1, 3) + ' target locations empty — evidence of hasty departure. Primary suspects fled before the operation. Only ' + randInt(1, 2) + ' of ' + suspectsCount + ' targets apprehended — low-level associates with limited intelligence value.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Remaining targets entered into NCIC and TECS databases. Border alerts issued. ' + v.orgName + ' network in ' + v.city + ' is alerted and dispersing. Evidence at vacated locations was ' + pick(['destroyed — hard drives wiped, documents burned', 'partially recovered — forensic analysis may yield results', 'removed entirely — professional cleanup']) + '.' });
  }

  var assessment = success ?
    'Law enforcement operation against ' + v.orgName + ' in ' + v.city + ' achieved all objectives. ' + suspectsCount + ' suspects in federal custody. Evidence sufficient for prosecution. Operation conducted within constitutional guidelines — all warrants valid, all rights observed.' :
    'Law enforcement operation partially failed. Key targets fled before warrant service. ' + v.orgName + '\'s network in ' + v.city + ' was alerted — possible leak in the operational planning chain. Internal affairs review recommended. Remaining targets are fugitives.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  INVESTIGATION
// =====================================================================

DEBRIEF_GENERATORS.INVESTIGATION = function(op, v, success) {
  var entries = [];
  var sourceCount = randInt(3, 8);

  entries.push({ time: dayLabel(-7) + ' ' + zuluTime(0), type: 'normal', text: 'Federal investigation initiated against ' + v.orgName + ' network in ' + v.city + ', United States. ' + v.primaryAsset + ' assigned as lead investigative unit. Vigil providing SIGINT and database support.' });
  entries.push({ time: dayLabel(-5) + ' ' + zuluTime(0), type: 'normal', text: 'FISA warrants obtained for electronic surveillance on ' + randInt(3, 8) + ' targets. Financial subpoenas served to ' + randInt(2, 5) + ' banking institutions. Grand jury convened.' });
  entries.push({ time: dayLabel(-3) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance producing results. ' + randInt(50, 200) + ' hours of intercepted communications. ' + sourceCount + ' confidential sources providing information. Pattern analysis revealing network structure.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Case file compiled. ' + randInt(200, 800) + ' pages of evidence. Financial trail mapped across ' + randInt(3, 7) + ' shell companies. Key transactions identified totaling $' + randInt(1, 25) + 'M.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Investigation reached actionable threshold. Grand jury returned ' + randInt(12, 40) + '-count indictment against ' + randInt(3, 8) + ' ' + v.orgName + ' operatives. Charges include: ' + pick(['material support for terrorism', 'conspiracy to commit acts of violence', 'money laundering and fraud', 'weapons trafficking and procurement of destructive devices']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: 'Arrest warrants issued. ' + randInt(3, 6) + ' subjects taken into custody across ' + randInt(2, 4) + ' states. ' + randInt(0, 2) + ' subjects remain at large — fugitive task force activated.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Evidence exploitation continuing. Digital forensics team processing ' + randInt(5, 20) + ' devices. Vigil cross-referencing findings with international intelligence holdings. Additional subjects may be identified.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Investigation stalled. Key evidence challenged — FISA warrant application contained procedural errors. Defense counsel filed motion to suppress.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(8), type: 'failure', text: 'Federal judge ruled ' + pick(['key electronic intercepts inadmissible — warrant affidavit insufficient', 'financial evidence obtained in violation of Fourth Amendment protections', 'confidential source testimony unreliable — source was previously compromised by ' + v.orgName]) + '. Case significantly weakened.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'US Attorney\'s office declining to prosecute on current evidence. Case remanded for additional investigation. ' + v.orgName + ' operatives remain at liberty. Their legal counsel has filed counter-complaints.' });
  }

  var assessment = success ?
    'Federal investigation of ' + v.orgName + ' in ' + v.city + ' produced actionable indictments. Multiple subjects in custody. Evidence chain is strong — prosecution expected to proceed. Vigil intelligence was instrumental in building the case.' :
    'Federal investigation of ' + v.orgName + ' encountered legal obstacles. Key evidence suppressed by judicial ruling. ' + v.orgName + ' operatives remain free and are now aware of the investigation\'s scope. Recommend rebuilding the case with alternative evidence sources.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  DOMESTIC SURVEILLANCE
// =====================================================================

DEBRIEF_GENERATORS.DOMESTIC_SURVEILLANCE = function(op, v, success) {
  var entries = [];
  var targetsCount = randInt(3, 8);

  entries.push({ time: dayLabel(-3) + ' ' + zuluTime(0), type: 'normal', text: v.primaryAsset + ' initiated domestic surveillance operation against ' + v.orgName + ' in ' + v.city + ', United States. ' + targetsCount + ' persons of interest identified. FISA court authorization obtained.' });
  entries.push({ time: dayLabel(-2) + ' ' + zuluTime(0), type: 'normal', text: 'Physical surveillance teams deployed. ' + randInt(4, 8) + ' agents in ' + randInt(2, 4) + ' vehicles maintaining rolling coverage. Technical surveillance: pen registers on ' + randInt(2, 5) + ' phone lines, email intercepts active.' });
  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Pattern-of-life established on primary targets. Daily routines mapped. Known associates catalogued. ' + randInt(2, 4) + ' previously unknown meeting locations identified across ' + v.city + '.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Key intercept: ' + v.orgName + ' cell leader conducted an unencrypted phone call discussing ' + pick(['operational timeline for planned attack', 'weapons procurement from out-of-state supplier', 'financial transfer instructions to overseas account', 'meeting with foreign contact at designated location']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'critical', text: 'Breakthrough: physical surveillance team observed ' + randInt(2, 4) + ' targets meeting at ' + pick(['a storage unit', 'a rented warehouse', 'a private residence']) + '. Targets were observed ' + pick(['handling weapons and tactical equipment', 'reviewing maps and photographs of a potential target', 'transferring large amounts of cash', 'conducting rehearsals of an operational plan']) + '. Documented via long-range photography and audio.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'Network fully mapped. ' + randInt(8, 20) + ' associates identified. Communication patterns, financial flows, and logistics chain documented. Intelligence package forwarded to Vigil for threat assessment and to DOJ for prosecution support.' });
    entries.push({ time: dayLabel(2) + ' ' + zuluTime(0), type: 'normal', text: 'Surveillance window complete. ' + randInt(100, 300) + ' hours of coverage compiled. ' + randInt(15, 40) + ' actionable intelligence reports generated. Recommend transition to enforcement phase.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'normal', text: 'Targets employing counter-surveillance techniques. ' + randInt(2, 3) + ' surveillance detection routes observed. Subjects switching vehicles and using burner phones with regular frequency.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(8), type: 'failure', text: 'Surveillance compromised. Target ' + pick(['spotted a surveillance vehicle and took evasive action — all targets went dark within 2 hours', 'used an RF detector and found a planted audio device — counter-intelligence protocols activated', 'posted photographs of surveillance team members on encrypted channels']) + '.' });
    entries.push({ time: dayLabel(1) + ' ' + zuluTime(0), type: 'normal', text: 'All surveillance assets recalled. ' + v.orgName + ' cell aware of federal interest. Targets have changed all communication methods, relocated from known addresses, and alerted the wider network.' });
  }

  var assessment = success ?
    'Domestic surveillance of ' + v.orgName + ' in ' + v.city + ' produced comprehensive intelligence. Network mapped, communications intercepted, and evidence documented within FISA guidelines. Case ready for prosecution phase.' :
    'Domestic surveillance operation compromised. ' + v.orgName + '\'s counter-surveillance capabilities exceeded assessment. All targets are now aware of federal interest and have gone dark. Recommend stand-down period and alternative approaches.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};

// =====================================================================
//  ARREST OPERATION
// =====================================================================

DEBRIEF_GENERATORS.ARREST_OPERATION = function(op, v, success) {
  var entries = [];
  var targetCount = randInt(1, 4);

  entries.push({ time: dayLabel(-1) + ' ' + zuluTime(0), type: 'normal', text: 'Federal arrest warrants issued for ' + targetCount + ' ' + v.orgName + ' operatives in ' + v.city + ', United States. ' + v.primaryAsset + ' designated as arresting agency. Charges: ' + pick(['material support for terrorism (18 USC 2339A)', 'conspiracy to use weapons of mass destruction (18 USC 2332a)', 'seditious conspiracy (18 USC 2384)', 'interstate transportation of stolen property and fraud']) + '.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-4), type: 'normal', text: 'Surveillance confirms target(s) at expected location. Tactical arrest team assembled — ' + randInt(8, 16) + ' agents. Marked and unmarked vehicles staged. Ambulance on standby.' });
  entries.push({ time: dayLabel(0) + ' ' + zuluTime(-1), type: 'normal', text: 'Final brief. Arrest plan: ' + pick(['dynamic entry at residence — SWAT support requested', 'vehicle interception during target\'s morning commute', 'controlled approach at target\'s workplace — minimal disruption', 'surround and call-out at target\'s known location']) + '. Rules of engagement: minimum force necessary.' });

  if (success) {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: pick(LE_ENTRY) + ' Target(s) detained without incident. Miranda rights administered. ' + targetCount + ' of ' + targetCount + ' subjects in federal custody.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 30), type: 'normal', text: 'Incident search conducted pursuant to arrest. Recovered: ' + pick(DEBRIEF_EVIDENCE) + '. All items tagged and photographed for chain of custody.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(2), type: 'normal', text: 'Subjects transported to federal holding facility. Initial processing complete. Legal counsel notified. Magistrate hearing scheduled within 24 hours.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: 'No injuries to any party. Media statement prepared jointly with US Attorney\'s office. Operation documented in compliance with DOJ use-of-force reporting requirements.' });
  } else {
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(0), type: 'critical', text: 'Arrest team approached target location. ' + pick(DEBRIEF_COMPROMISE) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluMinOffset(0, 10), type: 'failure', text: pick(['Target barricaded inside residence. Armed standoff ensued — negotiators called to scene. After ' + randInt(4, 12) + ' hours, target surrendered but had destroyed all physical evidence inside', 'Target fled on foot. Pursuit through ' + pick(DOMESTIC_LOCATIONS) + '. Lost contact after ' + randInt(5, 15) + ' minutes. Target remains at large', 'Target resisted arrest — altercation resulted in injuries to ' + randInt(1, 2) + ' agents and the subject. Use-of-force investigation automatically triggered. Subject hospitalized']) + '.' });
    entries.push({ time: dayLabel(0) + ' ' + zuluTime(4), type: 'normal', text: 'Only ' + randInt(0, Math.max(0, targetCount - 1)) + ' of ' + targetCount + ' targets successfully arrested. Remaining subjects are fugitives. BOLO issued to all field offices and international partners.' });
  }

  var assessment = success ?
    'Arrest operation against ' + v.orgName + ' in ' + v.city + ' completed successfully. All ' + targetCount + ' subjects in custody. Evidence preserved. Prosecution timeline on track. Operation conducted within constitutional requirements.' :
    'Arrest operation partially failed. Key subject(s) evaded custody. Vigil recommends fugitive task force activation and enhanced surveillance on known associates. The failed arrest will alert the wider ' + v.orgName + ' network.';

  return [buildTimeline(entries), buildAssessment(assessment)];
};
