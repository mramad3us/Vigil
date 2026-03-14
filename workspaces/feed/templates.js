/* ============================================================
   VIGIL — workspaces/feed/templates.js
   Template strings for analyst reports, alerts, briefings.
   ============================================================ */

var FEED_TEMPLATES = {
  SIGINT_INTERCEPT: {
    severity: ['HIGH', 'ELEVATED', 'CRITICAL'],
    headers: [
      'SIGINT INTERCEPT — {region} THEATER',
      'COMMS INTERCEPT — {city}, {country}',
      'SIGNALS ANALYSIS — PRIORITY TRAFFIC DETECTED',
    ],
    bodies: [
      'Intercepted communications between {actor} and known associates indicate planning for {objective}. Signal strength and frequency suggest operational timeline of {timeframe}. Confidence: {confidence}%.',
      'Pattern analysis of encrypted traffic from {city}, {country} reveals coordination consistent with {objective}. Source reliability: {reliability}. Recommend tasking {dept} for further collection.',
      'Burst transmission intercepted from {city} region. Content analysis indicates {actor} discussing {objective} with external contacts. Intercept time: {time}Z.',
    ],
    vars: {
      actor: ['a known operative', 'an unidentified principal', 'a suspected cell leader', 'a foreign intelligence officer'],
      objective: ['an attack on critical infrastructure', 'weapons procurement', 'personnel movement across borders', 'a high-value target meeting', 'financial transfers to front organizations'],
      timeframe: ['24-48 hours', '7-10 days', 'the coming weeks', 'an imminent window'],
      confidence: function() { return randInt(55, 95); },
      reliability: ['A (Reliable)', 'B (Usually Reliable)', 'C (Fairly Reliable)', 'D (Not Usually Reliable)'],
      dept: ['SIGINT', 'ANALYSIS', 'HUMINT'],
      time: function() { return String(randInt(0, 23)).padStart(2, '0') + String(randInt(0, 59)).padStart(2, '0'); },
    },
  },

  HUMINT_REPORT: {
    severity: ['HIGH', 'ELEVATED'],
    headers: [
      'HUMINT FLASH — SOURCE {source}',
      'HUMAN INTELLIGENCE REPORT — {region}',
      'SOURCE REPORT — {source} ({reliability})',
    ],
    bodies: [
      'Source {source} reports that {actor} has {activity} in the {city} area. Source met with handler at {time}Z. Assessment: information is {assessment}.',
      'Debriefing of source {source} reveals {actor} has been observed {activity}. Source confidence is {reliability}. Location: {city}, {country}. Follow-up meeting scheduled.',
      'Source {source} provides actionable intelligence: {activity}. This corroborates SIGINT collected from the same region. Recommend cross-referencing with IMAGERY.',
    ],
    vars: {
      source: function() { return generatePersonnelAlias(); },
      actor: ['a senior military official', 'a known arms dealer', 'an opposition leader', 'a foreign intelligence operative', 'a government insider'],
      activity: [
        'acquired materials consistent with weapons manufacturing',
        'held meetings with representatives of a designated organization',
        'established new secure communication channels',
        'relocated to a previously unknown safe house',
        'made contact with a foreign government delegation',
      ],
      assessment: ['credible and actionable', 'plausible but unconfirmed', 'partially corroborated', 'requires additional verification'],
      time: function() { return String(randInt(0, 23)).padStart(2, '0') + String(randInt(0, 59)).padStart(2, '0'); },
    },
  },

  IMAGERY_ANALYSIS: {
    severity: ['ELEVATED', 'ROUTINE'],
    headers: [
      'IMAGERY ANALYSIS — {city}, {country}',
      'SATELLITE IMAGERY — {region} THEATER',
      'GEOINT REPORT — CHANGE DETECTED',
    ],
    bodies: [
      'Satellite pass at {time}Z reveals {observation} at coordinates near {city}, {country}. Comparison with baseline imagery from {baseline} shows {change}. Assessment: {assessment}.',
      'Multi-spectral analysis of {city} region identifies {observation}. Pattern matches known {pattern_type} indicators with {confidence}% confidence. Recommend further collection.',
    ],
    vars: {
      observation: [
        'increased vehicle traffic at a military installation',
        'new construction at a previously inactive compound',
        'thermal signatures consistent with industrial activity',
        'camouflage netting over a previously exposed area',
        'excavation activity at a known sensitive site',
      ],
      baseline: ['30 days ago', 'the previous quarter', 'last month'],
      change: ['significant expansion of facility footprint', 'removal of previously stored equipment', 'new security perimeter established', 'altered traffic patterns'],
      assessment: ['consistent with military preparation', 'likely civilian development', 'indeterminate — additional passes needed', 'potential threat indicator'],
      pattern_type: ['weapons storage', 'troop staging', 'communications', 'logistics'],
      confidence: function() { return randInt(40, 85); },
      time: function() { return String(randInt(0, 23)).padStart(2, '0') + String(randInt(0, 59)).padStart(2, '0'); },
    },
  },

  SITUATION_UPDATE: {
    severity: ['ROUTINE'],
    headers: [
      'SITUATION UPDATE — {region}',
      'THEATER SITREP — {region}',
      'PERIODIC ASSESSMENT — {date}',
    ],
    bodies: [
      'Regional stability in {region} has {trend} over the reporting period. Key indicators: {indicator}. Active threats in theater: {threat_count}. Overall assessment: {assessment}.',
      '{region} theater update: threat level {threat_level}. {indicator}. Vigil recommends {recommendation}.',
    ],
    vars: {
      trend: ['deteriorated', 'improved marginally', 'remained static', 'shifted unpredictably'],
      indicator: [
        'Increased military communications traffic detected.',
        'Diplomatic channels show reduced engagement.',
        'Open-source reporting indicates growing public unrest.',
        'No significant changes to baseline assessment.',
        'Economic indicators suggest increasing instability.',
      ],
      threat_count: function() { return randInt(1, 5); },
      assessment: ['ELEVATED', 'SUBSTANTIAL', 'MODERATE', 'STABLE'],
      threat_level: function() { return pick(['CRITICAL', 'SEVERE', 'ELEVATED', 'GUARDED', 'LOW']); },
      recommendation: [
        'maintaining current posture.',
        'increased SIGINT collection.',
        'redeployment of HUMINT assets.',
        'tasking additional satellite passes.',
        'continued monitoring.',
      ],
    },
  },

  OPERATION_UPDATE: {
    severity: ['ELEVATED', 'ROUTINE'],
    headers: [
      'OPERATION UPDATE: {codename}',
      'OP {codename} — STATUS CHANGE',
    ],
    bodies: [
      'Operation {codename} has transitioned to {status} phase. {detail}',
    ],
    vars: {
      detail: [
        'All assigned departments are reporting nominal progress.',
        'Investigation has yielded new intelligence on target network.',
        'Field teams are in position. Awaiting execute authorization.',
        'Preliminary results are being analyzed.',
      ],
    },
  },

  ANALYST_NOTE: {
    severity: ['ROUTINE'],
    headers: [
      'ANALYST NOTE — {region}',
      'ASSESSMENT UPDATE — {topic}',
    ],
    bodies: [
      'Vigil pattern analysis has identified a {trend} in {region} consistent with {assessment}. This assessment is based on {basis}. Confidence: {confidence}%.',
      'Updated threat assessment for {region}: {assessment}. Key factors: {basis}. This modifies previous estimates by {modifier}.',
    ],
    vars: {
      topic: ['Regional Stability', 'Threat Posture', 'Network Activity', 'Force Disposition'],
      trend: ['shift in communications patterns', 'change in operational tempo', 'realignment of resources', 'new pattern of activity'],
      assessment: ['preparation for an escalatory action', 'internal reorganization', 'response to external pressure', 'seasonal operational variation'],
      basis: ['cross-source intelligence fusion', 'machine learning pattern detection', 'historical trend analysis', 'multi-INT correlation'],
      confidence: function() { return randInt(30, 80); },
      modifier: ['increasing overall risk', 'reducing estimated timeline', 'widening the uncertainty range', 'narrowing the target set'],
    },
  },

  RESOURCE_ALERT: {
    severity: ['ELEVATED'],
    headers: [
      'RESOURCE ALERT — {resource}',
      'SYSTEM NOTICE — {resource}',
    ],
    bodies: [
      '{resource} levels have {direction} to {value}. {recommendation}',
    ],
    vars: {
      resource: ['BUDGET', 'CONFIDENCE', 'DEPARTMENT CAPACITY'],
      direction: ['fallen', 'risen'],
      value: ['critical levels', 'concerning levels', 'optimal range'],
      recommendation: ['Immediate attention recommended.', 'Continue monitoring.', 'Reallocate resources as necessary.'],
    },
  },
};
