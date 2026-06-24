/**
 * Meta-progression — interconnects zones, mini-games, shipping, and live ops
 * into one "Complete Web-Game" arc for Dev End.
 */
(function () {
  "use strict";

  const META_STEPS = [
    { id: "train_arcade", act: 1, label: "Win a training arcade session", hint: "Gigs → Workout Gym", zone: "gigs" },
    { id: "pay_rent", act: 1, label: "Pay rent at Studio HQ", hint: "Studio → Pay Rent", zone: "studio" },
    { id: "gig_clear", act: 1, label: "Complete a gig (arcade crime)", hint: "Gigs → Perform Gig", zone: "gigs" },
    { id: "start_project", act: 2, label: "Greenlight a dev project", hint: "Dev Lab → New Brief", zone: "develop" },
    { id: "sprint_wins_3", act: 2, label: "Win 3 dev sprint arcades", hint: "Dev Lab → Code/Design/Polish", zone: "develop" },
    { id: "first_ship", act: 2, label: "Ship your first game (90%, ≤8 bugs)", hint: "Dev Lab → Ship It", zone: "develop" },
    { id: "post_release", act: 3, label: "Enter Live Ops on a shipped game", hint: "Auto after shipping", zone: "develop" },
    { id: "day_one_patch", act: 3, label: "Ship the day-one patch mini-game", hint: "Live Ops → Apple grid", zone: "develop" },
    { id: "play_platformer", act: 3, label: "Play your game (shipped platformer)", hint: "Live Ops → Play Game", zone: "develop" },
    { id: "zone_minigame", act: 3, label: "Clear any zone arcade mini-game", hint: "Zone Arcade hubs everywhere", zone: "hud" },
    { id: "hire_staff", act: 4, label: "Hire at least 2 crew members", hint: "Crew → Talent Recruitment", zone: "staff" },
    { id: "buy_research", act: 4, label: "Purchase any lab research", hint: "Crew → Research Lab", zone: "staff" },
    { id: "legacy_50", act: 4, label: "Reach 50 studio legacy", hint: "Ship hits, DLC, platformer, post-mortems", zone: "studio" },
    { id: "second_ship", act: 4, label: "Ship 2+ games total", hint: "Dev Lab pipeline", zone: "develop" },
    { id: "combo_3", act: 5, label: "Hit a 3× dev sprint combo", hint: "Chain arcade sprint wins", zone: "develop" },
    { id: "triple_engine", act: 5, label: "Win arcade + zone + platformer runs", hint: "All three game engines", zone: "develop" },
    { id: "conclude_liveops", act: 5, label: "Conclude a Live Ops project", hint: "Live Ops → Conclude", zone: "develop" },
    { id: "capstone_ready", act: 5, label: "Greenlight Dev End: The Web Game", hint: "Unlocked when arc completes", zone: "develop" }
  ];

  const ACT_TITLES = {
    1: "Act I — Basement Origins",
    2: "Act II — First Ship",
    3: "Act III — Live Ops",
    4: "Act IV — Studio Empire",
    5: "Act V — Complete Web-Game"
  };

  function ensureMeta(gs) {
    if (!gs) return null;
    gs.metaProgress = gs.metaProgress ?? {
      completedSteps: [],
      flags: {},
      maxCombo: 0,
      totalSprintWins: 0,
      capstoneUnlocked: false,
      capstoneStarted: false,
      capstoneShipped: false,
      webGameComplete: false
    };
    gs.arcadeStats = gs.arcadeStats ?? {
      arcadeWins: 0,
      siteWins: 0,
      platformerClears: 0,
      trainingWins: 0,
      gigWins: 0
    };
    return gs.metaProgress;
  }

  function isStepDone(gs, stepId) {
    return (gs.metaProgress?.completedSteps || []).includes(stepId);
  }

  function completeStep(gs, stepId) {
    ensureMeta(gs);
    if (isStepDone(gs, stepId)) return false;
    gs.metaProgress.completedSteps.push(stepId);
    const step = META_STEPS.find(s => s.id === stepId);
    if (step && step.act === 5 && stepId === "conclude_liveops") {
      gs.metaProgress.capstoneUnlocked = true;
    }
    if (gs.metaProgress.completedSteps.length >= META_STEPS.length - 1) {
      gs.metaProgress.capstoneUnlocked = true;
    }
    return true;
  }

  function getCurrentAct(gs) {
    ensureMeta(gs);
    for (let act = 1; act <= 5; act++) {
      const steps = META_STEPS.filter(s => s.act === act);
      if (steps.some(s => !isStepDone(gs, s.id))) return act;
    }
    return 5;
  }

  function getNextStep(gs) {
    ensureMeta(gs);
    return META_STEPS.find(s => !isStepDone(gs, s.id)) || null;
  }

  function getActProgress(gs, act) {
    const steps = META_STEPS.filter(s => s.act === act);
    const done = steps.filter(s => isStepDone(gs, s.id)).length;
    return { done, total: steps.length, pct: steps.length ? Math.round((done / steps.length) * 100) : 100 };
  }

  function getOverallProgress(gs) {
    ensureMeta(gs);
    const done = gs.metaProgress.completedSteps.length;
    return { done, total: META_STEPS.length, pct: Math.round((done / META_STEPS.length) * 100) };
  }

  function getLegacyTotal(gs) {
    let total = 0;
    (gs.portfolio || []).forEach(g => { total += g.legacyScore || Math.round((g.rating || 5) * 8); });
    if (gs.current_project?.legacyScore) total += gs.current_project.legacyScore;
    return total;
  }

  function getLegacyNetWorthBonus(gs) {
    return getLegacyTotal(gs) * 25;
  }

  function normalizeZoneId(zone) {
    if (zone === "company") return "studio";
    return zone;
  }

  function evaluateChecks(gs) {
    ensureMeta(gs);
    const f = gs.metaProgress.flags;
    const checks = [
      ["train_arcade", (gs.arcadeStats.trainingWins || 0) >= 1],
      ["pay_rent", (gs.rentPaidCount || 0) >= 1],
      ["gig_clear", (gs.gigsCompleted || 0) >= 1],
      ["start_project", !!f.startedProject || !!gs.current_project || gs.games_released > 0],
      ["sprint_wins_3", (gs.metaProgress.totalSprintWins || 0) >= 3],
      ["first_ship", gs.games_released >= 1],
      ["post_release", !!f.seenPostRelease],
      ["day_one_patch", !!f.dayOnePatch],
      ["play_platformer", !!f.playedPlatformer || (gs.current_project?.platformerPlayed)],
      ["zone_minigame", (gs.arcadeStats.siteWins || 0) >= 1 || (gs.siteMiniGamesWon || 0) >= 1],
      ["hire_staff", (gs.employees || []).length >= 2],
      ["buy_research", !!(gs.unlocked_console || gs.researched_multiplayer || gs.ai_behavior)],
      ["legacy_50", getLegacyTotal(gs) >= 50],
      ["second_ship", gs.games_released >= 2],
      ["combo_3", (gs.metaProgress.maxCombo || 0) >= 3],
      ["triple_engine", !!(f.wonArcade && f.wonSite && f.wonPlatformer)],
      ["conclude_liveops", !!f.concludedLiveOps],
      ["capstone_ready", !!gs.metaProgress.capstoneShipped]
    ];
    return checks;
  }

  function syncProgress(gs) {
    let newlyCompleted = [];
    evaluateChecks(gs).forEach(([id, ok]) => {
      if (ok && completeStep(gs, id)) newlyCompleted.push(id);
    });
    if (gs.metaProgress.capstoneUnlocked && !isStepDone(gs, "capstone_ready") && gs.metaProgress.capstoneShipped) {
      if (completeStep(gs, "capstone_ready")) newlyCompleted.push("capstone_ready");
    }
    if (gs.metaProgress.completedSteps.length >= META_STEPS.length - 1 && !gs.metaProgress.capstoneUnlocked) {
      gs.metaProgress.capstoneUnlocked = true;
    }
    return newlyCompleted;
  }

  function onEvent(gs, event, data) {
    if (!gs) return [];
    ensureMeta(gs);
    const mp = gs.metaProgress;
    const f = mp.flags;

    switch (event) {
      case "training_win":
        gs.arcadeStats.trainingWins = (gs.arcadeStats.trainingWins || 0) + 1;
        break;
      case "sprint_win":
        mp.totalSprintWins = (mp.totalSprintWins || 0) + 1;
        f.wonArcade = true;
        if (data?.combo) mp.maxCombo = Math.max(mp.maxCombo || 0, data.combo);
        if (gs.current_project) gs.current_project.hypeMeter = Math.min(100, (gs.current_project.hypeMeter || 0) + 2);
        break;
      case "site_win":
        f.wonSite = true;
        break;
      case "platformer_win":
        f.wonPlatformer = true;
        f.playedPlatformer = true;
        gs.arcadeStats.platformerClears = (gs.arcadeStats.platformerClears || 0) + 1;
        break;
      case "platformer_play":
        f.playedPlatformer = true;
        break;
      case "gig_win":
        gs.arcadeStats.gigWins = (gs.arcadeStats.gigWins || 0) + 1;
        break;
      case "project_start":
        f.startedProject = true;
        break;
      case "ship":
        break;
      case "post_release":
        f.seenPostRelease = true;
        break;
      case "day_one_patch":
        f.dayOnePatch = true;
        break;
      case "conclude":
        f.concludedLiveOps = true;
        break;
      case "capstone_start":
        mp.capstoneStarted = true;
        break;
      case "capstone_ship":
        mp.capstoneShipped = true;
        mp.webGameComplete = true;
        break;
      default:
        break;
    }
    return syncProgress(gs);
  }

  function getQuestDisplay(gs) {
    ensureMeta(gs);
    syncProgress(gs);

    if (gs.rentOverdue > 0) {
      return {
        main: "URGENT: Pay rent — arc paused, landlord cutscene loading",
        sub: "Studio HQ → Pay Rent (Act I still counts)",
        act: getCurrentAct(gs),
        step: null,
        urgent: true
      };
    }

    const next = getNextStep(gs);
    if (!next) {
      if (gs.metaProgress.webGameComplete) {
        return {
          main: "COMPLETE: You shipped Dev End — The Web Game",
          sub: "NG+ loop: legacy × prestige forever. Touch grass (DLC).",
          act: 5,
          step: null,
          complete: true
        };
      }
      return {
        main: "CAPSTONE: Greenlight 'Dev End: The Web Game'",
        sub: "Simulation / Game Dev · AAA scale · The meta finale",
        act: 5,
        step: { id: "capstone_ready", zone: "develop" },
        capstone: true
      };
    }

    const act = next.act;
    const prog = getActProgress(gs, act);
    return {
      main: `${ACT_TITLES[act]} — ${next.label}`,
      sub: `${next.hint} · ${prog.done}/${prog.total} act steps`,
      act,
      step: next,
      progress: getOverallProgress(gs)
    };
  }

  function renderMetaArcHtml(gs) {
    ensureMeta(gs);
    syncProgress(gs);
    const act = getCurrentAct(gs);
    const overall = getOverallProgress(gs);
    const next = getNextStep(gs);

    const actPips = [1, 2, 3, 4, 5].map(a => {
      const p = getActProgress(gs, a);
      const cls = p.pct >= 100 ? "meta-act-done" : a === act ? "meta-act-current" : "meta-act-locked";
      return `<div class="meta-act-pip ${cls}" title="${ACT_TITLES[a]} — ${p.done}/${p.total}"><span>${a}</span><small>${p.pct}%</small></div>`;
    }).join("");

    const engineRow = `
      <div class="meta-engine-row">
        <span class="${gs.metaProgress.flags.wonArcade ? "meta-engine-on" : ""}">🕹️ Arcade ${gs.arcadeStats.arcadeWins || 0}W</span>
        <span class="${gs.metaProgress.flags.wonSite ? "meta-engine-on" : ""}">🎪 Zone ${gs.arcadeStats.siteWins || 0}W</span>
        <span class="${gs.metaProgress.flags.wonPlatformer ? "meta-engine-on" : ""}">🎮 Shipped ${gs.arcadeStats.platformerClears || 0}W</span>
        <span>🏛️ Legacy ${getLegacyTotal(gs)} (+$${getLegacyNetWorthBonus(gs).toLocaleString()} NW)</span>
      </div>`;

    const nextBtn = next && next.zone
      ? `<button type="button" class="btn-secondary meta-goto-btn" onclick="goToMetaZone('${next.zone}')">Go → ${next.zone.toUpperCase()}</button>`
      : "";

    const capstoneBlock = gs.metaProgress.capstoneUnlocked && !gs.metaProgress.capstoneShipped
      ? `<div class="meta-capstone-cta">
          <p><strong>Capstone unlocked:</strong> Start <em>Dev End: The Web Game</em> — the simulation about shipping this simulation.</p>
          <button type="button" class="btn-primary" onclick="startCapstoneProject()">🌐 Greenlight Capstone</button>
        </div>`
      : "";

    return `
      <div class="meta-arc-hub">
        <div class="meta-arc-header">
          <h4 class="dev-section-label">📜 Main Quest — Complete Web-Game Arc</h4>
          <span class="meta-arc-pct">${overall.pct}%</span>
        </div>
        <div class="meta-act-pipeline">${actPips}</div>
        ${engineRow}
        <p class="meta-arc-next">${next ? `Next: <strong>${next.label}</strong>` : "Ship the capstone."}</p>
        <div class="meta-arc-actions">${nextBtn}</div>
        ${capstoneBlock}
      </div>
    `;
  }

  function renderMetaStepList(gs) {
    const act = getCurrentAct(gs);
    const steps = META_STEPS.filter(s => s.act === act);
    return steps.map(s => {
      const done = isStepDone(gs, s.id);
      return `<div class="meta-step-line ${done ? "done" : ""}"><span>${done ? "✓" : "○"}</span> ${s.label}</div>`;
    }).join("");
  }

  window.MetaProgression = {
    META_STEPS,
    ACT_TITLES,
    ensureMeta,
    syncProgress,
    onEvent,
    getQuestDisplay,
    getNextStep,
    getCurrentAct,
    getOverallProgress,
    getLegacyTotal,
    getLegacyNetWorthBonus,
    normalizeZoneId,
    renderMetaArcHtml,
    renderMetaStepList,
    isCapstoneUnlocked: (gs) => !!ensureMeta(gs)?.capstoneUnlocked
  };
})();