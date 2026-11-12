// config.js - All tunable game data: layout, towers, enemies, waves, portfolio links.
// Plain script (no ES modules) so the game also runs from file:// via `open index.html`.
(function (CQ) {
  CQ.WIDTH = 960;
  CQ.HEIGHT = 540;

  CQ.START_FOCUS = 170;
  CQ.START_BUFFER = 10; // days of slack before the launch date slips
  CQ.SELL_REFUND = 0.6;
  CQ.BRIEF_LINK_DISTANCE = 150; // an AI Assistant this close to a Clear Brief is "briefed"

  // The project timeline the work walks along, kickoff to launch.
  CQ.PATH_POINTS = [
    { x: -40, y: 110 },
    { x: 800, y: 110 },
    { x: 800, y: 250 },
    { x: 160, y: 250 },
    { x: 160, y: 390 },
    { x: 890, y: 390 }
  ];

  // Milestones are decoration: distance along the path and a label.
  CQ.MILESTONES = [
    { dist: 90, label: 'KICKOFF' },
    { dist: 520, label: 'BRIEF' },
    { dist: 1300, label: 'FIRST DRAFT' },
    { dist: 2060, label: 'REVIEW' }
  ];

  // Fixed build spots. Fixed spots are much easier to hit on a phone than free placement.
  CQ.SLOTS = [
    { x: 130, y: 180 }, { x: 270, y: 180 }, { x: 410, y: 180 }, { x: 550, y: 180 },
    { x: 690, y: 180 }, { x: 885, y: 180 },
    { x: 60, y: 320 }, { x: 270, y: 320 }, { x: 410, y: 320 }, { x: 550, y: 320 },
    { x: 690, y: 320 }, { x: 830, y: 320 }
  ];

  CQ.TOWER_ORDER = ['no', 'brief', 'async', 'ai'];

  CQ.TOWERS = {
    no: {
      name: 'A Polite No',
      cost: 50,
      range: 120,
      cooldown: 0.5,
      damage: 10,
      color: '#ff5d5d',
      blurb: 'Steady, reliable pushback on one thing at a time.'
    },
    brief: {
      name: 'Clear Brief',
      cost: 60,
      range: 120,
      slow: 0.4,
      color: '#ffe9a8',
      blurb: 'Slows work nearby, stops scope creep growing, and keeps a neighbouring AI on target.'
    },
    async: {
      name: 'Async Update',
      cost: 70,
      range: 115,
      cooldown: 1.2,
      damage: 8,
      meetingMultiplier: 5,
      color: '#4fd6c8',
      blurb: 'Pulses hit everything in range. Dissolves quick syncs. Cannot be frozen.'
    },
    ai: {
      name: 'AI Assistant',
      cost: 120,
      range: 170,
      cooldown: 0.75,
      damage: 30,
      misfire: 0.3,
      misfireBriefed: 0.03,
      glitchTime: 1.0,
      color: '#ff9d3c',
      blurb: 'Hits hardest and furthest. Confidently wrong 30% of the time, unless it sits next to a Clear Brief.'
    }
  };

  CQ.ENEMIES = {
    creep: {
      name: 'Scope Creep',
      hp: 34, speed: 50, bounty: 8, leak: 1, radius: 11,
      growRate: 0.07, // share of base hp gained per second while un-briefed
      growMax: 3.5,
      leavesCorpse: true
    },
    sync: {
      name: 'Quick Sync',
      hp: 48, speed: 56, bounty: 10, leak: 1, radius: 14,
      pulseEvery: 4.5, pulseRange: 105, freezeTime: 1.8,
      leavesCorpse: true
    },
    ticket: {
      name: 'Ticket',
      hp: 34, speed: 64, bounty: 5, leak: 1, radius: 14,
      splitsInto: 'subticket'
    },
    subticket: {
      name: 'Sub-task',
      hp: 14, speed: 80, bounty: 3, leak: 1, radius: 9,
      leavesCorpse: true
    },
    zombie: {
      // Brief called this the "zombie manager". Depicted as a thing (an email thread
      // that will not die), not a person. Change the display name here if you prefer.
      name: 'Zombie Thread',
      hp: 120, speed: 38, bounty: 18, leak: 2, radius: 16,
      reviveEvery: 3.2, reviveRange: 170, reviveHp: 0.6
    },
    boss: {
      name: 'One More Round of Feedback',
      hp: 280, speed: 30, bounty: 0, leak: 6, radius: 30,
      phases: ['feedback_v1', 'feedback_v2_final', 'feedback_FINAL_final_v3'],
      phaseSpeedUp: 1.15,
      phaseShield: 1.2
    }
  };

  // Each wave: hp multiplier plus spawn groups (type, count, seconds between, start delay).
  CQ.WAVES = [
    {
      name: 'Kickoff',
      intro: 'Scope creep grows the longer it lives. Stop it early.',
      hpScale: 1,
      groups: [
        { type: 'creep', count: 6, gap: 2.4, delay: 0 },
        { type: 'ticket', count: 3, gap: 1.6, delay: 11 }
      ]
    },
    {
      name: 'Calendar Tetris',
      intro: 'Quick syncs freeze towers near them. An Async Update dissolves them.',
      hpScale: 1.25,
      groups: [
        { type: 'sync', count: 4, gap: 3.2, delay: 0 },
        { type: 'ticket', count: 5, gap: 1.3, delay: 5 },
        { type: 'creep', count: 4, gap: 2.4, delay: 12 }
      ]
    },
    {
      name: 'Backlog Grooming',
      intro: 'Close a ticket and it splits into two sub-tasks.',
      hpScale: 1.55,
      groups: [
        { type: 'ticket', count: 10, gap: 1.0, delay: 0 },
        { type: 'creep', count: 6, gap: 2.0, delay: 4 },
        { type: 'sync', count: 3, gap: 4.0, delay: 9 }
      ]
    },
    {
      name: "Didn't We Ship This?",
      intro: 'Zombie threads reopen things you already shipped.',
      hpScale: 1.85,
      groups: [
        { type: 'ticket', count: 8, gap: 1.1, delay: 0 },
        { type: 'zombie', count: 3, gap: 6.0, delay: 3 },
        { type: 'creep', count: 6, gap: 1.8, delay: 7 },
        { type: 'sync', count: 4, gap: 3.5, delay: 11 }
      ]
    },
    {
      name: 'One More Round of Feedback',
      intro: 'The final boss. It comes back. Twice.',
      hpScale: 2.1,
      groups: [
        { type: 'creep', count: 6, gap: 2.6, delay: 0 },
        { type: 'boss', count: 1, gap: 0, delay: 5 },
        { type: 'sync', count: 4, gap: 5.0, delay: 8 },
        { type: 'zombie', count: 2, gap: 10.0, delay: 14 },
        { type: 'ticket', count: 8, gap: 1.5, delay: 18 }
      ]
    }
  ];

  // End-screen portfolio links. Descriptions mirror the public repo descriptions.
  CQ.LINKS = [
    {
      title: 'Shoal',
      text: 'Governance and admin layer for AI agents: policies, approvals and audit.',
      url: 'https://github.com/grizzdank/shoal'
    },
    {
      title: 'image-gen',
      text: 'A Claude Code skill for AI image generation with Gemini and OpenAI models.',
      url: 'https://github.com/grizzdank/image-gen'
    },
    {
      title: 'Meeting-notes app',
      text: 'A local meeting-notes app. Not public yet.',
      url: null // TODO(Dave): add the public URL for the meeting-notes app when it exists.
    }
  ];
})(globalThis.CQ = globalThis.CQ || {});
