// ═══════════════════════════════════════════════
// Dev Tycoon — Core Simulation Engine (game.js)
// ═══════════════════════════════════════════════

// --- Constants & Config ---
const OFFICE_TIERS = {
  Garage: { 
    name: "Parent's Damp Basement", 
    cost: 0, 
    capacity: 0, 
    speedMult: 1.0,
    desc: "The absolute birthplace of corporate legends. Features an overwhelming scent of laundry detergent, a leaking pipe that you've integrated into the build environment, and a total capacity of exactly zero people (because your parents keep threatening to turn this space into a home gym)."
  },
  CoWorking: { 
    name: "Overpriced Co-Working Desk", 
    cost: 2000, 
    capacity: 2, 
    speedMult: 1.2,
    desc: "A single wobbly desk shared with three other startup founders who are currently pitch-decking an AI-based laundry app. The subscription includes one cup of wobbly matcha green tea daily and access to beanbag chairs that are structurally impossible to exit."
  },
  IndieStudio: { 
    name: "Hipster Loft with Single Window", 
    cost: 15000, 
    capacity: 5, 
    speedMult: 1.5,
    desc: "A trendy open-space studio with exposed wooden beams and a single, tiny window that overlooks an industrial brick wall. Equipped with a vintage arcade machine that doesn't turn on and a water dispenser that only dispenses lukewarm tap water."
  },
  MegaCampus: { 
    name: "Mega-Corp Subterranean Bunker", 
    cost: 100000, 
    capacity: 10, 
    speedMult: 2.5,
    desc: "A massive, subterranean bunker constructed of concrete and glass. Has automated security doors, three cafeterias serving micro-greens, a slide connecting the 3rd and 1st floors, and an atmosphere of sterile corporate compliance. Perfect for maximum developer speed."
  }
};

const EMPLOYEES_INFO = {
  junior_dev: { 
    id: "junior_dev", 
    name: "ChatGPT Prompter (Junior)", 
    cost: 1000, 
    salary: 50, 
    techRate: 1, 
    designRate: 0.1,
    desc: "An enthusiastic intern who doesn't know how to code but has a paid subscription to an AI chatbot. Spends 6 hours a day crafting prompts like 'write entire game engine in HTML' and 2 hours copy-pasting the output, introducing exactly 40 compiler warnings per second."
  },
  junior_artist: { 
    id: "junior_artist", 
    name: "MS Paint Specialist (Junior)", 
    cost: 1000, 
    salary: 50, 
    techRate: 0.1, 
    designRate: 1,
    desc: "A visionary creator who insists that drawing everything using the 2px pencil tool in MS Paint is a 'deconstructive post-modern critique of modern high-fidelity shaders'. Morale is high; resolution is low."
  },
  senior_dev: { 
    id: "senior_dev", 
    name: "StackOverflow Archmage (Senior)", 
    cost: 5000, 
    salary: 200, 
    techRate: 4, 
    designRate: 0.5,
    desc: "An ancient programmer who speaks in binary and has a keyboard that doesn't contain letters, only control characters. Can solve segfaults by looking intensely at the monitor. Refuses to explain how their code works, calling it 'job security architecture'."
  },
  senior_artist: { 
    id: "senior_artist", 
    name: "Vibe Director (Senior)", 
    cost: 5000, 
    salary: 200, 
    techRate: 0.5, 
    designRate: 4,
    desc: "Insists that they don't 'draw' assets, but rather 'curate visual vibes' and 'conceptualize graphic resonances'. Spends most of their time adjusting the ambient lighting of their dual-monitor setup to warm orange and drinking artisanal drip coffee."
  },
  project_mgr: { 
    id: "project_mgr", 
    name: "Professional Stand-Up Host", 
    cost: 12000, 
    salary: 450, 
    techRate: 2, 
    designRate: 2, 
    bugFixRate: 1,
    desc: "A certified host of daily stand-up meetings. Spends their entire day moving digital tickets across columns on virtual boards and asking developers if their 10-minute task is 'on track for deployment'. Boosts management and bug squashing by sheer administrative pressure."
  }
};

const PLATFORMS = {
  pc: { name: "Glorious PC Master Race", cost: 100, marketSize: 1.0 },
  console: { name: "The Pear Station 5", cost: 500, marketSize: 1.5 },
  mobile: { name: "Microtransaction Generator", cost: 50, marketSize: 0.8 }
};

const SYNERGIES = {
  "RPG-Cyberpunk": 1.25,
  "RPG-Fantasy": 1.25,
  "Action-Cyberpunk": 1.2,
  "Action-Zombie": 1.2,
  "Action-Space": 1.15,
  "Strategy-Space": 1.2,
  "Adventure-Fantasy": 1.15,
  "Simulation-Farming": 1.25,
  "Simulation-Game Dev": 1.3
};

const GIGS = [
  { id: "freelance_html", name: "Center a CSS Div for Local Pizzeria", nerveCost: 2, successRate: 0.95, rewardMin: 50, rewardMax: 100, skillRequired: "coding_skill", xpReward: 1, label: "Literally the hardest task in computer science. Tweak CSS alignment for $50." },
  { id: "crack_competitor", name: "Crack Rival Studio's DRM", nerveCost: 4, successRate: 0.75, rewardMin: 200, rewardMax: 400, skillRequired: "coding_skill", xpReward: 2, label: "Bypass their 99 layers of digital security to leak their source code comments." },
  { id: "ransomware", name: "Install Crypto-miner on Smart Fridge", nerveCost: 6, successRate: 0.60, rewardMin: 800, rewardMax: 1500, skillRequired: "coding_skill", xpReward: 4, label: "Infect the internet-connected kitchen appliances of a rival dev studio." },
  { id: "ddos_rival", name: "Unleash DDoS Botnet of Smart Toasters", nerveCost: 8, successRate: 0.45, rewardMin: 3000, rewardMax: 6000, skillRequired: "management_skill", xpReward: 6, label: "Take down competitor servers using traffic from hacked internet kitchenware." }
];

// --- Core Game State ---
let gameState = {
  company_name: "Underpaid Garage Interns",
  office_tier: "Garage",
  cash: 500.00,
  net_worth: 500.00,
  coding_skill: 10,
  design_skill: 10,
  management_skill: 10,
  research_points: 0,
  games_released: 0,
  games_sold: 0,
  employees_count: 0,
  unlocked_console: false,
  researched_multiplayer: false,
  ai_behavior: false,
  ergonomic_chairs: false,

  // Dev Level & XP System
  level: 1,
  xp: 0,
  xp_needed: 100,

  // Local active arrays (not fully serialized to DB, but serialized to localStorage)
  employees: [],
  active_games: [],
  portfolio: [],

  // Ticking resources
  energy: 100,
  max_energy: 100,
  nerve: 10,
  max_nerve: 10,

  // Active Project state
  current_project: null
};

// Console logs active memory
let consoleLogs = [];
let localSaveTimer = 0;
let paySalaryTimer = 0;
let studioRentTimer = 0;

// Mini-game combo streak (resets on fail)
let miniGameCombo = 0;

// Active UI zone (synthwave dashboard)
let activeTab = "gigs";

// Supabase sync session check
let isUserLoggedIn = false;
let userColor = "#00e5ff";

// --- Game Initializer ---
window.addEventListener("DOMContentLoaded", async () => {
  initTabs();
  initFormInputs();

  // Load account info
  try {
    isUserLoggedIn = TycoonAPI.isLoggedIn();
    if (isUserLoggedIn) {
      await loadProfileFromServer();
    } else {
      loadProfileFromLocal();
    }
  } catch (err) {
    console.warn("Auth status fetch error, loading local data fallback:", err);
    loadProfileFromLocal();
  }

  // Start the tick loops
  setInterval(gameTick, 1000);

  // Renders
  addLog("System initialized.", "Ready in developer console.");
  updateUI();

  // URL check for tabs
  const params = new URLSearchParams(window.location.search);
  activeTab = params.get("tab") || "gigs";
  switchTab(activeTab);

  if (window.SynthwaveAudio) {
    SynthwaveAudio.boot(activeTab);
  }

  if (!localStorage.getItem("dev_end_seen_tutorial")) {
    localStorage.setItem("dev_end_seen_tutorial", "1");
    setTimeout(() => {
      showToast("Welcome to the neon garage — pick a zone on the left rail and ship bugs!", "info");
    }, 600);
  }
});

// --- Tab System ---
function initTabs() {
  document.querySelectorAll("nav.nav-tabs a").forEach(tab => {
    tab.addEventListener("click", (e) => {
      const href = tab.getAttribute("href");
      if (href && href.startsWith("index.html?tab=")) {
        e.preventDefault();
        const tabName = href.split("=")[1];
        switchTab(tabName);
        window.history.pushState({}, "", href);
      }
    });
  });

  document.querySelectorAll(".zone-node[data-tab]").forEach(node => {
    node.addEventListener("click", () => {
      const tabName = node.dataset.tab;
      switchTab(tabName);
      window.history.pushState({}, "", `index.html?tab=${tabName}`);
    });
  });

  document.querySelectorAll(".link-node[data-tab]").forEach(node => {
    node.addEventListener("click", () => {
      const tabName = node.dataset.tab;
      switchTab(tabName);
      window.history.pushState({}, "", `index.html?tab=${tabName}`);
    });
  });
}

function switchTab(tabName) {
  if (tabName !== activeTab) {
    suspendMiniGameForTabChange(tabName);
  }
  activeTab = tabName;

  // Hide all main layout containers
  document.querySelectorAll("main.main-layout").forEach(main => {
    main.style.display = "none";
  });

  // Deactivate tabs
  document.querySelectorAll("nav.nav-tabs a").forEach(tab => {
    tab.classList.remove("active");
  });

  // Show target main container
  const targetSection = document.getElementById(`${tabName}-section`);
  if (targetSection) {
    targetSection.style.display = "grid";
  }

  const activeLink = document.querySelector(`nav.nav-tabs a[href="index.html?tab=${tabName}"]`);
  if (activeLink) activeLink.classList.add("active");

  document.querySelectorAll(".zone-node[data-tab]").forEach(node => {
    node.classList.toggle("active", node.dataset.tab === tabName);
  });

  document.querySelectorAll(".link-node[data-tab]").forEach(node => {
    node.classList.toggle("active", node.dataset.tab === tabName);
  });

  // Load conditional panels
  if (tabName === "leaderboard") {
    loadLeaderboard();
  } else if (tabName === "staff") {
    renderStaffPanel();
    renderResearchLab();
  } else if (tabName === "develop") {
    renderDevelopPanel();
  } else if (tabName === "gigs") {
    renderTrainingGym();
    renderDeveloperStore();
    renderGigsBoard();
  } else if (tabName === "company") {
    renderStudioDashboard();
  }

  if (window.SynthwaveAudio) {
    SynthwaveAudio.setZone(tabName);
  }
}

// --- Load / Save Logic ---
async function loadProfileFromServer() {
  try {
    const profile = await TycoonAPI.getProfile();
    userColor = profile.color || "#00e5ff";

    // Apply header badge
    const headerProfileBadge = document.getElementById("header-profile-badge");
    if (headerProfileBadge) {
      headerProfileBadge.innerText = profile.username.toUpperCase();
      headerProfileBadge.style.borderColor = userColor;
      headerProfileBadge.style.color = userColor;
    }

    if (profile.stats) {
      // Sync DB data
      gameState.company_name = profile.stats.company_name || "Garage Devs";
      gameState.office_tier = profile.stats.office_tier || "Garage";
      gameState.cash = parseFloat(profile.stats.cash || 500);
      gameState.net_worth = parseFloat(profile.stats.net_worth || 500);
      gameState.coding_skill = parseInt(profile.stats.coding_skill || 10);
      gameState.design_skill = parseInt(profile.stats.design_skill || 10);
      gameState.management_skill = parseInt(profile.stats.management_skill || 10);
      gameState.research_points = parseInt(profile.stats.research_points || 0);
      gameState.games_released = parseInt(profile.stats.games_released || 0);
      gameState.games_sold = parseInt(profile.stats.games_sold || 0);
      gameState.employees_count = parseInt(profile.stats.employees_count || 0);
    }

    // Pull staff/active games array from local storage matching username to avoid blank states
    const key = `dev_tycoon_local_state_${profile.username}`;
    const localBackup = localStorage.getItem(key) || localStorage.getItem("dev_tycoon_local_state_guest");
    if (localBackup) {
      const backup = JSON.parse(localBackup);
      gameState.employees = backup.employees || [];
      gameState.active_games = backup.active_games || [];
      gameState.portfolio = backup.portfolio || [];
      gameState.current_project = backup.current_project || null;
      gameState.energy = backup.energy ?? 100;
      gameState.nerve = backup.nerve ?? 10;
      gameState.unlocked_console = backup.unlocked_console ?? false;
      gameState.researched_multiplayer = backup.researched_multiplayer ?? false;
      gameState.ai_behavior = backup.ai_behavior ?? false;
      gameState.ergonomic_chairs = backup.ergonomic_chairs ?? false;
      gameState.level = backup.level ?? 1;
      gameState.xp = backup.xp ?? 0;
      gameState.xp_needed = backup.xp_needed ?? 100;
    }

    ensureStudioMeta();
    addLog("Cloud profile synced.", `Welcome back, ${profile.username}.`);
  } catch (err) {
    console.warn("Could not sync cloud profile, loading local backup:", err);
    loadProfileFromLocal();
  }
}

function loadProfileFromLocal() {
  const localBackup = localStorage.getItem("dev_tycoon_local_state_guest");
  if (localBackup) {
    try {
      const parsed = JSON.parse(localBackup);
      gameState = { ...gameState, ...parsed };
      if (!Array.isArray(gameState.employees)) gameState.employees = [];
      if (!Array.isArray(gameState.active_games)) gameState.active_games = [];
    } catch (e) {
      console.warn("Corrupt local save state, using defaults:", e);
    }
  }

  // Set default guest color
  userColor = "#00e5ff";
  const headerProfileBadge = document.getElementById("header-profile-badge");
  if (headerProfileBadge) {
    headerProfileBadge.innerText = "GUEST";
    headerProfileBadge.style.borderColor = userColor;
    headerProfileBadge.style.color = userColor;
  }

  addLog("Guest local profile loaded.", "Progress is stored on this device.");
  ensureStudioMeta();
}

function gainXP(amount) {
  if (amount <= 0) return;
  
  if (gameState.level === undefined) gameState.level = 1;
  if (gameState.xp === undefined) gameState.xp = 0;
  if (gameState.xp_needed === undefined) gameState.xp_needed = gameState.level * 100;
  
  gameState.xp += amount;
  
  let leveledUp = false;
  while (gameState.xp >= gameState.xp_needed) {
    gameState.xp -= gameState.xp_needed;
    gameState.level += 1;
    gameState.xp_needed = gameState.level * 100;
    
    // Level-up bonuses: increase max resources slightly and refill them!
    gameState.max_energy = (gameState.max_energy || 100) + 10;
    gameState.max_nerve = (gameState.max_nerve || 10) + 1;
    gameState.energy = gameState.max_energy;
    gameState.nerve = gameState.max_nerve;
    
    leveledUp = true;
  }
  
  if (leveledUp) {
    triggerScreenFlash(57, 255, 20);
    if (window.SynthwaveAudio) SynthwaveAudio.playSFX("levelup");
    const levelQuips = [
      "HR says you're now 'senior enough to blame'.",
      "Your LinkedIn headline updated itself to 'Visionary'.",
      "Parents still ask when you'll get a real job. Level up anyway.",
      "Achievement unlocked: more responsibilities, same snack budget."
    ];
    const levelQuip = levelQuips[Math.floor(Math.random() * levelQuips.length)];
    addLog("LEVEL UP!", `Dev Level ${gameState.level}! Max Energy: ${gameState.max_energy}, Max Nerve: ${gameState.max_nerve}. ${levelQuip}`);
    showToast(`✨ LEVEL ${gameState.level}! ${levelQuip}`, "success");
    
    // If Gigs tab is active, redraw the training gym to show updated XP cost labels
    const gigsSection = document.getElementById("gigs-section");
    if (gigsSection && gigsSection.style.display !== "none") {
      renderTrainingGym();
    }
  } else {
    addLog("XP Gained", `Gained +${amount} XP.`);
  }
  
  saveGame();
  updateUI();
}
window.gainXP = gainXP;

async function saveGame() {
  // Compute Net Worth
  let employeesValue = gameState.employees.reduce((acc, emp) => acc + (EMPLOYEES_INFO[emp.id]?.cost || 0) * 0.5, 0);
  let officeValue = OFFICE_TIERS[gameState.office_tier]?.cost || 0;
  gameState.net_worth = gameState.cash + employeesValue + officeValue;
  gameState.employees_count = gameState.employees.length;

  const serialized = JSON.stringify(gameState);

  // Save guest or current user locally
  localStorage.setItem("dev_tycoon_local_state_guest", serialized);
  if (isUserLoggedIn) {
    const activeUser = localStorage.getItem("tycoon_active_username") || "user";
    localStorage.setItem(`dev_tycoon_local_state_${activeUser}`, serialized);

    // Sync to Supabase
    try {
      await TycoonAPI.saveStats(gameState);
    } catch (err) {
      console.warn("Database stats sync failed:", err.message);
    }
  }
}

// --- Console Log Helper (System Bot Announcements) ---
function addLog(title, desc) {
  const time = new Date().toLocaleTimeString().split(' ')[0];
  consoleLogs.push({
    time: time,
    user: "STUDIO_BOT",
    text: `${title} — ${desc}`,
    color: "#00e5ff",
    badge: "🤖 BOT"
  });
  if (consoleLogs.length > 60) consoleLogs.shift();

  const consoleEl = document.getElementById("terminal-console");
  if (consoleEl) {
    const trmLine = document.createElement("div");
    trmLine.className = "terminal-line";
    trmLine.style.borderLeft = "3px solid var(--color-cyan)";
    trmLine.style.background = "rgba(0, 229, 255, 0.03)";
    trmLine.style.padding = "6px 10px";
    trmLine.style.margin = "4px 0";
    trmLine.style.borderRadius = "6px";
    trmLine.style.fontSize = "0.78rem";
    trmLine.style.lineHeight = "1.35";
    
    trmLine.innerHTML = `
      <span class="timestamp" style="font-size:0.72rem; color:var(--color-text-muted); margin-right:6px;">[${time}]</span>
      <span style="font-size:0.65rem; font-weight:800; padding:2px 5px; border-radius:4px; margin-right:6px; border:1px solid var(--color-cyan); color:var(--color-cyan); background:rgba(0,229,255,0.15);">🤖 BOT</span>
      <strong style="color:var(--color-cyan); margin-right:5px;">[STUDIO_BOT]:</strong>
      <span style="color:var(--color-light-grey); font-weight:500;">${title}</span> — 
      <span style="color:var(--color-text-muted); font-style:italic;">${desc}</span>
    `;
    consoleEl.appendChild(trmLine);
    
    while (consoleEl.children.length > 60) {
      consoleEl.removeChild(consoleEl.firstChild);
    }
    
    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

// --- Dynamic Form Inputs ---
function initFormInputs() {
  if (formInputsInitialized) return;
  const gameNameInput = document.getElementById("game-name-input");
  const randomNameBtn = document.getElementById("random-name-btn");

  if (randomNameBtn && gameNameInput) {
    formInputsInitialized = true;
    randomNameBtn.addEventListener("click", () => {
      const prefixes = ["Half-Baked", "Glitchy", "Spaghetti", "Cyber-Trash", "Buggy", "AI-Generated", "Unfinished", "Pay-to-Win", "Crunch-Time", "Wobbly", "NFT", "Live-Service"];
      const suffixes = ["Simulator", "Fiasco", "Disaster", "Tycoon", "Refund-Edition", "Crash-Simulator", "Battle Pass", "Early Access Forever", "Day-One Patch", "Microtransaction Hell"];
      const r1 = prefixes[Math.floor(Math.random() * prefixes.length)];
      const r2 = suffixes[Math.floor(Math.random() * suffixes.length)];
      gameNameInput.value = `${r1} ${r2}`;
    });
  }

  const genreSel = document.getElementById("genre-select");
  const topicSel = document.getElementById("topic-select");
  const synergyPreview = document.getElementById("synergy-preview");
  const updateSynergyPreview = () => {
    if (!synergyPreview || !genreSel || !topicSel) return;
    const info = getSynergyInfo(genreSel.value, topicSel.value);
    synergyPreview.innerHTML = `
      <span style="color:${info.color}; font-weight:700;">${info.label}</span>
      <span style="color:var(--color-text-muted);"> — ${info.key} (${info.mult.toFixed(2)}× critic multiplier)</span>
    `;
  };
  if (genreSel) genreSel.addEventListener("change", updateSynergyPreview);
  if (topicSel) topicSel.addEventListener("change", updateSynergyPreview);
  updateSynergyPreview();
}

// --- Game Tick Loops (1s) ---
function gameTick() {
  // 1. Regenerate Energy and Nerve (tuned for snappier early-game pacing)
  const recoveryBonus = gameState.ergonomic_chairs ? 1.5 : 1.0;
  const energyRate = (gameState.level === 1 ? 12 : 8) / 60;
  if (gameState.energy < gameState.max_energy) {
    gameState.energy = Math.min(gameState.max_energy, gameState.energy + energyRate * recoveryBonus);
  }
  if (gameState.nerve < gameState.max_nerve) {
    gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + (2 / 60));
  }

  // 1b. Staff passively contribute to active dev project
  if (gameState.current_project && gameState.current_project.phase !== "post_release") {
    const speedMult = OFFICE_TIERS[gameState.office_tier]?.speedMult || 1.0;
    let techGain = 0;
    let designGain = 0;
    let bugFix = 0;
    gameState.employees.forEach(emp => {
      const info = EMPLOYEES_INFO[emp.id];
      if (!info) return;
      techGain += (info.techRate || 0) * 0.04 * speedMult;
      designGain += (info.designRate || 0) * 0.04 * speedMult;
      bugFix += (info.bugFixRate || 0) * 0.015 * speedMult;
    });
    if (techGain > 0 || designGain > 0) {
      gameState.current_project.tech_points += techGain;
      gameState.current_project.design_points += designGain;
      if (bugFix > 0) {
        gameState.current_project.bug_points = Math.max(0, gameState.current_project.bug_points - bugFix);
      }
    }
  }

  // 2. Active games revenue generation
  if (gameState.active_games.length > 0) {
    let tickIncome = 0;
    gameState.active_games.forEach((game, index) => {
      // Simulate decay: sales decline based on age
      game.age = (game.age || 0) + 1;

      // Decaying copies sold per tick (moderated by 20x to prevent cash flood)
      const baseUnits = (game.initialSalesRate || 100);
      const halfLife = game.decayHalfLife || 90;
      const decayMult = Math.max(0.01, Math.exp(-game.age / halfLife)); // Dynamic half-life
      const copiesSoldThisTick = Math.ceil((baseUnits * decayMult) / 20);

      const revenue = copiesSoldThisTick * game.price * 0.70; // 30% store cut
      tickIncome += revenue;
      game.totalSold = (game.totalSold || 0) + copiesSoldThisTick;
      game.totalRevenue = (game.totalRevenue || 0) + revenue;
      gameState.games_sold += copiesSoldThisTick;

      // Update matching item in portfolio
      if (!Array.isArray(gameState.portfolio)) gameState.portfolio = [];
      const portItem = gameState.portfolio.find(p => p.name === game.name);
      if (portItem) {
        portItem.totalSold = game.totalSold;
        portItem.totalRevenue = game.totalRevenue;
      }
    });

    // Add to cash
    if (tickIncome > 0) {
      gameState.cash += tickIncome;
      // Prune dead games (age >= 120 seconds or has reached its scale revenue threshold)
      gameState.active_games = gameState.active_games.filter(g => {
        let cap = g.revenueCap;
        if (cap === undefined) {
          const scale = g.scale || "Small";
          cap = 300;
          if (scale === "Medium") cap = 1500;
          if (scale === "Large") cap = 6000;
          if (scale === "AAA") cap = 20000;
        }
        
        const isDead = g.age >= GAME_SHELF_LIFE || (g.totalRevenue || 0) >= cap;
        if (isDead) {
          addLog("Sales Concluded", `'${g.name}' has concluded its sales run (Lifetime Rev: $${parseFloat(g.totalRevenue || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}).`);
        }
        return !isDead;
      });
    }
  }

  // 3. Staff contribution to research points (RP)
  let researchGenerated = 0;
  gameState.employees.forEach(emp => {
    if (emp.id === "junior_dev" || emp.id === "junior_artist") {
      researchGenerated += 0.05;
    } else if (emp.id === "senior_dev" || emp.id === "senior_artist") {
      researchGenerated += 0.2;
    } else if (emp.id === "project_mgr") {
      researchGenerated += 0.5;
    }
  });

  if (researchGenerated > 0) {
    const speedMult = OFFICE_TIERS[gameState.office_tier]?.speedMult || 1.0;
    gameState.research_points += researchGenerated * speedMult;
  }

  // 4. Pay Salaries (every 60 ticks)
  paySalaryTimer++;
  if (paySalaryTimer >= 60) {
    paySalaryTimer = 0;
    let totalSalary = gameState.employees.reduce((acc, emp) => acc + (EMPLOYEES_INFO[emp.id]?.salary || 0), 0);
    if (totalSalary > 0) {
      gameState.cash = Math.max(0, gameState.cash - totalSalary);
      addLog("Payroll Cleared", `Paid $${totalSalary} in developer salaries.`);
    }
  }

  // 4b. Rent pressure (every 90 ticks)
  studioRentTimer++;
  if (studioRentTimer >= 90) {
    studioRentTimer = 0;
    ensureStudioMeta();
    gameState.rentOverdue += 1;
    if (gameState.rentOverdue >= 2) {
      gameState.studioMorale = Math.max(0, gameState.studioMorale - 4);
      if (gameState.rentOverdue === 2) {
        pushStudioDiary("Rent overdue. Landlord left a voicemail composed entirely of sighs.");
        addLog("Rent Overdue", `Pay $${getStudioRentCost()} in Studio dashboard to avoid morale collapse.`);
      }
    }
  }

  // 5. Periodic Auto Save (every 10 ticks)
  localSaveTimer++;
  if (localSaveTimer >= 10) {
    localSaveTimer = 0;
    saveGame();
  }

  // 6. Live Chat generation (60% probability)
  if (Math.random() < 0.6) {
    generateLiveChatMessage();
  }

  // 7. Random studio events (~4% per tick)
  if (Math.random() < 0.04) {
    triggerRandomEvent();
  }

  updateUI();
}

function triggerRandomEvent() {
  const pool = [
    () => {
      gameState.energy = Math.min(gameState.max_energy, gameState.energy + 18);
      addLog("Random Event", "Roommate delivered lukewarm pizza. +18 Energy. Toppings: regret and marinara.");
      showToast("🍕 Pizza delivery! +18 Energy (crust optional)", "success");
    },
    () => {
      gameState.cash += 85;
      addLog("Random Event", "Found $85 in the couch cushions between the Cheeto dust and a forgotten Steam refund.");
      showToast("💰 Couch treasure! +$85", "success");
    },
    () => {
      gameState.research_points += 4;
      addLog("Random Event", "StackOverflow answer accepted. +4 RP. Someone called you 'legend' then deleted their account.");
      showToast("📚 Research breakthrough! +4 RP", "info");
    },
    () => {
      gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + 2);
      addLog("Random Event", "Espresso machine fixed itself. +2 Nerve. It still tastes like burnt ambition.");
      showToast("☕ Espresso miracle! +2 Focus", "success");
    },
    () => {
      gameState.xp += 8;
      addLog("Random Event", "A recruiter DM'd 'quick call?' You ignored it and gained +8 XP from pure spite.");
      showToast("💼 Recruiter ignored! +8 XP", "info");
    },
    () => {
      gameState.cash = Math.max(0, gameState.cash - 40);
      addLog("Random Event", "Accidentally subscribed to another AI tool trial. -$40. It only writes TODO comments.");
      showToast("🤖 AI trial regret! -$40", "warning");
    },
    () => {
      if (gameState.employees.length > 0) {
        gameState.cash = Math.max(0, gameState.cash - 25);
        addLog("Random Event", "Intern ordered 14 oat-milk lattes on the company card. -$25.");
        showToast("☕ Latte incident! -$25", "warning");
      } else {
        gameState.energy = Math.min(gameState.max_energy, gameState.energy + 6);
        addLog("Random Event", "No staff to blame. You drank the intern's imaginary latte and gained +6 Energy.");
        showToast("🫠 Solo dev coping! +6 Energy", "info");
      }
    },
    () => {
      ensureStudioMeta();
      gameState.studioMorale = Math.min(100, gameState.studioMorale + 6);
      pushStudioDiary("Surprise donut delivery from a former playtester. Morale suspiciously up.");
      addLog("Random Event", "Mystery donuts appeared. +6 studio morale.");
      showToast("🍩 Donut diplomacy! +6 Morale", "success");
    },
    () => {
      ensureStudioMeta();
      gameState.studioReputation = Math.min(100, gameState.studioReputation + 3);
      addLog("Random Event", "Local blog called your studio 'ones to watch'. +3 Reputation.");
      showToast("📰 Press mention! +3 Rep", "info");
    }
  ];

  if (gameState.current_project) {
    pool.push(() => {
      gameState.current_project.bug_points += 2;
      addLog("Random Event", "A Reddit thread exposed 2 new bugs in your build.");
      showToast("🐛 Viral bug thread! +2 bugs", "warning");
    });
  }

  if (gameState.active_games.length > 0) {
    pool.push(() => {
      const g = gameState.active_games[Math.floor(Math.random() * gameState.active_games.length)];
      g.age = Math.max(0, g.age - 25);
      addLog("Random Event", `'${g.name}' is trending on social media! Shelf life extended.`);
      showToast(`📱 '${g.name}' went viral! Sales extended`, "success");
    });
  }

  pool[Math.floor(Math.random() * pool.length)]();
}

// --- Target point targets based on Dev scale ---
const GAME_SHELF_LIFE = 120;

function getTargetPointsForScale(scale) {
  switch (scale) {
    case "Small": return 30;
    case "Medium": return 100;
    case "Large": return 300;
    case "AAA": return 1000;
    default: return 30;
  }
}

function getProjectProgressPercent(proj) {
  const target = getTargetPointsForScale(proj.scale);
  const scopeMult = 1 + ((proj && proj.scopeFeatures) || 0) * 0.1;
  const totalPoints = (proj.tech_points || 0) + (proj.design_points || 0);
  return Math.min(100, (totalPoints / (target * 2 * scopeMult)) * 100);
}

function canReleaseProject(proj) {
  return getProjectProgressPercent(proj) >= 90 && (proj.bug_points || 0) <= 8;
}

function getDevEnergyCost() {
  return gameState.level === 1 ? 4 : 5;
}

function getOfficeDisplayName(tierKey) {
  return OFFICE_TIERS[tierKey]?.name || tierKey;
}

function getGameIncomePerTick(game) {
  const halfLife = game.decayHalfLife || 90;
  const baseUnits = game.initialSalesRate || 100;
  const decayMult = Math.max(0.01, Math.exp(-(game.age || 0) / halfLife));
  const copiesSoldThisTick = Math.ceil((baseUnits * decayMult) / 20);
  return copiesSoldThisTick * game.price * 0.70;
}

let developPanelRefreshCounter = 0;
let formInputsInitialized = false;

function getGigXpCost(gigId) {
  if (gigId === "freelance_html") return gameState.level === 1 ? 0 : 3;
  if (gigId === "crack_competitor") return 10;
  if (gigId === "ransomware") return 20;
  if (gigId === "ddos_rival") return 40;
  return 0;
}

const GIG_DOSSIERS = {
  freelance_html: {
    title: "Freelance HTML Edits",
    desc: "Tweak markup code templates for small neighborhood stores. High success rate, small payouts.",
    dossier: "Luigi (local pizzeria owner) claims his pizza image is shifting 2px left when clicked. He demands inline styles because bootstrap is \"communist spyware\". Rot your soul for $50."
  },
  crack_competitor: {
    title: "Crack Competitor DRM",
    desc: "Leak files of rival software assets to internet forums. Generates decent returns with moderate risk.",
    dossier: "Bypass wobbly DRM loops that melt client CPUs. Upload cracked binaries to retro forums. Gains decent returns and massive street cred among 14-year-olds."
  },
  ransomware: {
    title: "Ransomware local server",
    desc: "Infect server of offshore shell companies. High payout but failure results in corporate penalties.",
    dossier: "Drop-shipping conglomerate using password \"admin123\". If you fail, their automatic legal fax bots will flood your parents' fax machine with 8,000 cease-and-desists."
  },
  ddos_rival: {
    title: "DDoS Rival Studio",
    desc: "Overwhelm competitor servers with smart-toaster traffic. Massive payout, maximum heat.",
    dossier: "Target a rival whose servers run on a Raspberry Pi and hope. Success means champagne; failure means your router gets subpoenaed by three countries."
  }
};

const DEV_PHASES = [
  { id: "concept", label: "Concept", min: 0, icon: "💡" },
  { id: "prototype", label: "Prototype", min: 20, icon: "🔧" },
  { id: "alpha", label: "Alpha", min: 45, icon: "🧪" },
  { id: "beta", label: "Beta", min: 70, icon: "📋" },
  { id: "gold", label: "Gold", min: 90, icon: "🏆" }
];

const DEV_MILESTONES = [25, 50, 75];

const DEV_DIARY_POOL = {
  concept: [
    "Brainstormed 47 game ideas. Chose the one with the least documentation required.",
    "Wrote a 200-page design doc. Page 3 is the only page anyone will read.",
    "Stakeholder (your mom) requested 'less violence, more laundry simulator'."
  ],
  prototype: [
    "First playable build: player can walk into a wall forever. Immersive.",
    "Placeholder art is a gray cube. Marketing calls it 'minimalist brutalism'.",
    "Physics engine powered by hope and an unclosed while loop."
  ],
  alpha: [
    "QA filed 312 bugs. 300 are 'feature requests' from your cousin.",
    "Cutscenes are still PowerPoint slides with fade transitions.",
    "Networking works on LAN only if everyone whispers near the router."
  ],
  beta: [
    "Beta testers demand darker mode, lighter mode, and emotional support mode.",
    "Performance optimized from 12 FPS to 13 FPS. Ship it.",
    "Legal approved the EULA after removing the clause about soul ownership."
  ],
  gold: [
    "Gold master burned to a USB stick labeled 'DO NOT DROP'.",
    "Launch trailer uses 90% stock footage of people high-fiving in offices.",
    "CFO asked if we can ship bugs as DLC. Finance loves recurring revenue."
  ],
  post_release: [
    "Players discovered a speedrun strat involving the pause menu.",
    "Discord is debating whether the tutorial is a hate crime.",
    "Influencer called it 'mid' then bought the season pass anyway."
  ]
};

const SUPPORT_TICKET_TEMPLATES = [
  "Game crashed when I alt-tabbed to pay my rent.",
  "My character is stuck inside a decorative lamp. Send help.",
  "Is the 4th boss supposed to be a JPEG of a raccoon?",
  "I bought the deluxe edition but only received existential dread.",
  "Multiplayer lobby is just three guys arguing about tabs vs spaces.",
  "Achievement 'Finish Tutorial' won't unlock. Tutorial has no end.",
  "Refund request: game too fun, productivity destroyed.",
  "Bug: loot box opened itself and contained a PDF of HR policies."
];

function ensureProjectMeta(proj) {
  if (!proj) return proj;
  proj.techDebt = proj.techDebt ?? 0;
  proj.hypeMeter = proj.hypeMeter ?? 0;
  proj.scopeFeatures = proj.scopeFeatures ?? 0;
  proj.milestonesHit = proj.milestonesHit ?? [];
  proj.devDiary = proj.devDiary ?? [];
  proj.focusGroupBonus = proj.focusGroupBonus ?? 0;
  proj.playtestsRun = proj.playtestsRun ?? 0;
  proj.dlcCount = proj.dlcCount ?? 0;
  proj.hotfixCount = proj.hotfixCount ?? 0;
  proj.expansionCount = proj.expansionCount ?? 0;
  proj.amaCount = proj.amaCount ?? 0;
  proj.freeWeekendsUsed = proj.freeWeekendsUsed ?? 0;
  proj.seasonPassActive = proj.seasonPassActive ?? false;
  proj.postMortemDone = proj.postMortemDone ?? false;
  proj.legacyScore = proj.legacyScore ?? 0;
  proj.awards = proj.awards ?? [];
  proj.roadmap = proj.roadmap ?? [
    { id: "patch", label: "Day-One Patch", done: false },
    { id: "dlc1", label: "Cosmetic DLC Pack", done: false },
    { id: "expansion", label: "Story Expansion", done: false },
    { id: "sequel", label: "Franchise Sequel", done: false }
  ];
  proj.supportTickets = proj.supportTickets ?? [];
  return proj;
}

function getDevPhaseId(progressPercent) {
  let phase = DEV_PHASES[0].id;
  for (const p of DEV_PHASES) {
    if (progressPercent >= p.min) phase = p.id;
  }
  return phase;
}

function getSynergyInfo(genre, topic) {
  const key = `${genre}-${topic}`;
  const mult = SYNERGIES[key] || 0.85;
  let label = "Awkward Match";
  let color = "#ff1744";
  if (mult >= 1.25) { label = "God-Tier Synergy"; color = "#39ff14"; }
  else if (mult >= 1.15) { label = "Strong Synergy"; color = "#00e5ff"; }
  else if (mult >= 1.0) { label = "Decent Fit"; color = "#ffd700"; }
  else if (mult >= 0.9) { label = "Questionable"; color = "#ff9100"; }
  return { mult, label, color, key };
}

function pushDevDiary(proj, phaseId, customText) {
  ensureProjectMeta(proj);
  const pool = DEV_DIARY_POOL[phaseId] || DEV_DIARY_POOL.concept;
  const text = customText || pool[Math.floor(Math.random() * pool.length)];
  proj.devDiary.unshift({ time: new Date().toLocaleTimeString().split(" ")[0], phase: phaseId, text });
  if (proj.devDiary.length > 8) proj.devDiary.pop();
}

function checkDevMilestones(proj) {
  ensureProjectMeta(proj);
  const pct = getProjectProgressPercent(proj);
  DEV_MILESTONES.forEach(ms => {
    if (pct >= ms && !proj.milestonesHit.includes(ms)) {
      proj.milestonesHit.push(ms);
      const xp = ms === 25 ? 12 : ms === 50 ? 25 : 40;
      const cash = ms === 75 ? 150 : 0;
      if (cash) gameState.cash += cash;
      gainXP(xp);
      pushDevDiary(proj, getDevPhaseId(pct), `Milestone ${ms}% reached! Publisher sent ${cash ? `$${cash} and ` : ""}+${xp} XP in motivational Post-its.`);
      addLog("Dev Milestone", `'${proj.name}' hit ${ms}% completion. ${cash ? `+$${cash}, ` : ""}+${xp} XP.`);
      showToast(`Milestone ${ms}%! ${cash ? `+$${cash}, ` : ""}+${xp} XP`, "success");
    }
  });
}

function getStaffDevContribution() {
  let tech = 0, design = 0, bugs = 0;
  gameState.employees.forEach(emp => {
    const info = EMPLOYEES_INFO[emp.id];
    if (!info) return;
    tech += info.techRate || 0;
    design += info.designRate || 0;
    bugs -= (info.bugFixRate || 0) * 0.5;
  });
  const mult = OFFICE_TIERS[gameState.office_tier]?.speedMult || 1;
  return { tech: tech * mult, design: design * mult, bugFix: bugs * mult };
}

function renderDevPhasePipeline(progressPercent) {
  const cur = getDevPhaseId(progressPercent);
  return `
    <div class="dev-phase-pipeline">
      ${DEV_PHASES.map(p => {
        const active = p.id === cur;
        const done = progressPercent > p.min + 15 || (p.id === "gold" && progressPercent >= 90);
        const cls = done ? "done" : active ? "active" : "";
        return `<div class="dev-phase-step ${cls}"><span class="dev-phase-icon">${p.icon}</span><span class="dev-phase-label">${p.label}</span></div>`;
      }).join("")}
    </div>
  `;
}

function generateSupportTickets(proj, count = 4) {
  ensureProjectMeta(proj);
  const shuffled = [...SUPPORT_TICKET_TEMPLATES].sort(() => Math.random() - 0.5);
  proj.supportTickets = shuffled.slice(0, count).map((text, i) => ({
    id: `ticket_${Date.now()}_${i}`,
    text,
    resolved: false
  }));
}

function getCommunitySentiment(proj) {
  ensureProjectMeta(proj);
  let score = Math.min(100, Math.max(0, (proj.rating || 5) * 10));
  score += (proj.patchCompleted ? 8 : 0);
  score += (proj.dlcCount || 0) * 4;
  score -= proj.supportTickets.filter(t => !t.resolved).length * 5;
  score += proj.amaCount * 3;
  return Math.min(100, Math.max(0, Math.round(score)));
}

function initPostReleaseState(proj) {
  ensureProjectMeta(proj);
  if (!proj.cachedTweets) proj.cachedTweets = getSimulatedSocialFeed(proj.rating, proj.name);
  if (proj.supportTickets.length === 0) generateSupportTickets(proj);
  pushDevDiary(proj, "post_release");
}

let studioDashboardRefreshCounter = 0;

const STUDIO_DIARY_POOL = [
  "Landlord inspected the garage. Classified pizza boxes as 'structural elements'.",
  "Investor asked for ARR. You showed them active Steam sales and prayed.",
  "Team stand-up lasted 47 minutes. Nothing stood up.",
  "Accounting discovered the coffee budget exceeds the shader budget.",
  "Press inquiry: 'Is your game a soulslike?' You said yes. It is a spreadsheet.",
  "HR filed a complaint about HR not existing.",
  "Merch shipment arrived: 400 shirts that say 'It compiles on my machine'.",
  "Industry analyst called the studio 'promisingly chaotic'.",
  "Parent company (Mom) threatened to revoke Wi-Fi unless dishes are done.",
  "Franchise fan demanded sequel. You demanded they buy the DLC first."
];

const STUDIO_LEASE_CLAUSES = {
  Garage: {
    title: "Garage Rental & Co-Sign Lease (Landlord: Mom/Dad)",
    body: "SECTION 4.2 (MILDEW & SODIUM): Pizza box tower max height 4 boxes. SECTION 9.1 (MORALE NOISE): Git screaming banned 10PM–7AM. SECTION 12.0 (RENT): $50/month or emotional support."
  },
  CoWorking: {
    title: "Co-Working Membership (Landlord: WeWork Clone)",
    body: "SECTION 2.1: One desk, three founders, infinite pitch decks. SECTION 5.0: Matcha allowance is one cup per fiscal quarter. Rent: $200/month billed as 'community vibes'."
  },
  IndieStudio: {
    title: "Hipster Loft Lease (Landlord: Artisan REIT)",
    body: "SECTION 1.0: Exposed brick is load-bearing for morale only. SECTION 7.3: Arcade machine may remain broken for aesthetic purposes. Rent: $800/month."
  },
  MegaCampus: {
    title: "Mega-Corp Bunker Sublease (Landlord: Evil Holdings LLC)",
    body: "SECTION 0.1: Slides mandatory. SECTION 3.3: Micro-greens subsidized; joy is not. SECTION 99.9: All bugs are 'feature flags'. Rent: $2,500/month."
  }
};

const STUDIO_OPPORTUNITY_POOL = [
  { title: "Indie Publisher Advance", cash: 900, repReq: 15, xp: 0, blurb: "They want 40% of everything forever. Standard." },
  { title: "Mobile Port Contract", cash: 450, repReq: 8, xp: 20, blurb: "Port to phone. Add ads. Remove fun. Profit?" },
  { title: "Game Jam Sponsorship", cash: 200, repReq: 5, xp: 35, blurb: "Brand your logo on 48-hour suffering." },
  { title: "VC Office Hours", cash: 1500, repReq: 25, xp: 0, blurb: "Investor wants 'AI blockchain metaverse RPG'." },
  { title: "Merch Licensing Deal", cash: 350, repReq: 10, xp: 10, blurb: "Sell mugs that say 'Have you tried turning it off and on again?'" },
  { title: "Platform Feature Slot", cash: 600, repReq: 18, xp: 15, blurb: "Front page placement next to a farming sim." }
];

function ensureStudioMeta() {
  gameState.studioMorale = gameState.studioMorale ?? 55;
  gameState.studioReputation = gameState.studioReputation ?? 12;
  gameState.studioBuzz = gameState.studioBuzz ?? 0;
  gameState.studioDiary = gameState.studioDiary ?? [];
  gameState.studioAwards = gameState.studioAwards ?? [];
  gameState.rentOverdue = gameState.rentOverdue ?? 0;
  gameState.investorMeetings = gameState.investorMeetings ?? 0;
  if (!gameState.studioOpportunity) generateStudioOpportunity();
}

function pushStudioDiary(text) {
  ensureStudioMeta();
  gameState.studioDiary.unshift({
    time: new Date().toLocaleTimeString().split(" ")[0],
    text: text || STUDIO_DIARY_POOL[Math.floor(Math.random() * STUDIO_DIARY_POOL.length)]
  });
  if (gameState.studioDiary.length > 10) gameState.studioDiary.pop();
}

function generateStudioOpportunity() {
  ensureStudioMeta();
  const pool = [...STUDIO_OPPORTUNITY_POOL].sort(() => Math.random() - 0.5);
  gameState.studioOpportunity = pool[0];
}

function getStudioRentCost() {
  const rents = { Garage: 50, CoWorking: 200, IndieStudio: 800, MegaCampus: 2500 };
  return rents[gameState.office_tier] || 50;
}

function getStudioPassiveIncome() {
  return gameState.active_games.reduce((sum, g) => sum + getGameIncomePerTick(g), 0);
}

function getStudioLegacyTotal() {
  let total = 0;
  (gameState.portfolio || []).forEach(g => { total += g.legacyScore || Math.round((g.rating || 5) * 8); });
  if (gameState.current_project?.legacyScore) total += gameState.current_project.legacyScore;
  return total;
}

function getLeaseClause(tier) {
  return STUDIO_LEASE_CLAUSES[tier] || STUDIO_LEASE_CLAUSES.Garage;
}

function renderStudioMeter(label, value, color) {
  return `
    <div class="studio-meter">
      <div class="studio-meter-head"><span>${label}</span><span>${value}%</span></div>
      <div class="status-bar-track" style="height:5px;"><div class="status-bar-fill" style="width:${value}%; height:100%; background:${color};"></div></div>
    </div>
  `;
}

function renderStudioDashboard() {
  const container = document.getElementById("studio-dashboard-content");
  if (!container) return;
  ensureStudioMeta();

  const passive = getStudioPassiveIncome();
  const legacy = getStudioLegacyTotal();
  const lease = getLeaseClause(gameState.office_tier);
  const rent = getStudioRentCost();
  const avgSkill = Math.round((gameState.coding_skill + gameState.design_skill + gameState.management_skill) / 3);
  const opp = gameState.studioOpportunity;

  const projectSnap = gameState.current_project
    ? `<div class="studio-project-snap">
        <strong>Active:</strong> ${gameState.current_project.name}
        <span class="studio-snap-phase">${gameState.current_project.phase === "post_release" ? "LIVE OPS" : "IN DEV"}</span>
        <button class="btn-secondary" style="padding:4px 10px; font-size:0.68rem;" onclick="switchTab('develop')">Open Dev Board →</button>
      </div>`
    : `<div class="studio-project-snap muted">No active project — <button class="btn-secondary" style="padding:4px 10px; font-size:0.68rem;" onclick="switchTab('develop')">Start one →</button></div>`;

  const activeGamesHtml = gameState.active_games.length === 0
    ? `<p class="studio-empty">No products on shelves. The warehouse echoes with unused hype.</p>`
    : gameState.active_games.map((game, index) => {
      const remaining = Math.max(0, GAME_SHELF_LIFE - game.age);
      const agePct = Math.min(100, (game.age / GAME_SHELF_LIFE) * 100);
      const income = getGameIncomePerTick(game);
      return `
        <div class="studio-product-card">
          <div class="studio-product-head">
            <span><strong>${game.name}</strong> <small>${game.genre}/${game.topic}</small></span>
            <span class="studio-income">+$${income.toFixed(1)}/s</span>
          </div>
          <div class="studio-product-meta">★ ${game.rating.toFixed(1)} · ${game.totalSold.toLocaleString()} sold · ${remaining}s shelf</div>
          <div class="status-bar-track" style="height:4px; margin:6px 0;"><div class="status-bar-fill" style="width:${100 - agePct}%; height:100%; background:var(--color-cyan);"></div></div>
          <div class="studio-marketing-row">
            <button class="btn-secondary studio-mkt-btn" onclick="runMarketing(${index}, 'social')">📱 Social $200</button>
            <button class="btn-secondary studio-mkt-btn" onclick="runMarketing(${index}, 'pr')">📰 PR $800</button>
            <button class="btn-secondary studio-mkt-btn" onclick="runMarketing(${index}, 'steam')">🎮 Steam $400</button>
            <button class="btn-secondary studio-mkt-btn" onclick="runMarketing(${index}, 'influencer')">📹 Creator $350</button>
          </div>
        </div>`;
    }).join("");

  const portfolioHtml = (!gameState.portfolio || gameState.portfolio.length === 0)
    ? `<p class="studio-empty">Portfolio empty. History is written by shipped builds (and deleted branches).</p>`
    : [...gameState.portfolio].reverse().map(game => {
      const leg = game.legacyScore || Math.round((game.rating || 5) * 8);
      return `
        <div class="studio-portfolio-card">
          <div><strong>${game.name}</strong> <small>${game.genre}/${game.topic}</small>
            <div class="studio-product-meta">★ ${(game.rating || 0).toFixed(1)} · Legacy ${leg}</div>
          </div>
          <div class="studio-portfolio-stats">
            <div>${parseInt(game.totalSold || 0).toLocaleString()} sold</div>
            <div class="studio-income">$${parseFloat(game.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
          </div>
        </div>`;
    }).join("");

  const diaryHtml = gameState.studioDiary.slice(0, 6).map(d =>
    `<div class="dev-diary-entry"><span class="dev-diary-time">[${d.time}]</span> ${d.text}</div>`
  ).join("") || `<p class="studio-empty">Studio chronicle blank. Make decisions to generate corporate lore.</p>`;

  const awardsHtml = gameState.studioAwards.length
    ? gameState.studioAwards.map(a => `<span class="award-chip">🏆 ${a}</span>`).join("")
    : `<span class="studio-empty">No studio awards yet. Ship hits, pay rent on time, fool investors.</span>`;

  container.innerHTML = `
    <div class="studio-dashboard-hub">
      <div class="studio-dash-header">
        <div>
          <h2 class="studio-dash-title">${gameState.company_name}</h2>
          <p class="studio-dash-sub">${getOfficeDisplayName(gameState.office_tier)} · Level ${gameState.level} Dev · ${gameState.employees.length} crew</p>
        </div>
        <div class="studio-dash-badges">
          <div class="studio-badge cash">$${parseFloat(gameState.cash).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div class="studio-badge worth">NW $${parseFloat(gameState.net_worth).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div>
          <div class="studio-badge passive">+$${passive.toFixed(1)}/s</div>
        </div>
      </div>

      ${projectSnap}

      <div class="studio-pulse-grid">
        ${renderStudioMeter("Morale", gameState.studioMorale, "#b388ff")}
        ${renderStudioMeter("Reputation", Math.min(100, gameState.studioReputation), "#00e5ff")}
        ${renderStudioMeter("Industry Buzz", Math.min(100, gameState.studioBuzz), "#ffd700")}
      </div>

      <div class="studio-stats-grid">
        <div class="studio-stat"><span>Games Shipped</span><strong>${gameState.games_released}</strong></div>
        <div class="studio-stat"><span>Copies Sold</span><strong>${parseInt(gameState.games_sold).toLocaleString()}</strong></div>
        <div class="studio-stat"><span>Research</span><strong>${Math.floor(gameState.research_points)} RP</strong></div>
        <div class="studio-stat"><span>Avg Skill</span><strong>${avgSkill}</strong></div>
        <div class="studio-stat"><span>Legacy Score</span><strong>${legacy}</strong></div>
        <div class="studio-stat"><span>Rent Due</span><strong style="color:${gameState.rentOverdue > 0 ? "#ff1744" : "#39ff14"}">$${rent}${gameState.rentOverdue > 0 ? " (!)" : ""}</strong></div>
      </div>

      <div class="studio-board-grid">
        <div class="studio-board-col">
          <div class="dev-board-card compact">
            <h4 class="dev-section-label">📦 Active Product Sales</h4>
            <div class="studio-product-list">${activeGamesHtml}</div>
          </div>
          <div class="dev-board-card compact">
            <h4 class="dev-section-label">📚 Studio Portfolio</h4>
            <div class="studio-portfolio-list">${portfolioHtml}</div>
          </div>
        </div>

        <div class="studio-board-col">
          <div class="dev-board-card compact lease-card">
            <h4 class="dev-section-label">📜 ${lease.title}</h4>
            <p class="lease-body">${lease.body}</p>
            <button class="btn-secondary" style="margin-top:8px; font-size:0.75rem;" onclick="runStudioAction('pay_rent')">Pay Rent ($${rent})</button>
          </div>

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">💼 Incoming Opportunity</h4>
            ${opp ? `
              <p class="opp-title">${opp.title}</p>
              <p class="opp-blurb">${opp.blurb}</p>
              <p class="opp-meta">+$${opp.cash} · Rep ${opp.repReq}+ · ${opp.xp ? opp.xp + " XP" : "no XP"}</p>
              <div style="display:flex; gap:8px; margin-top:8px;">
                <button class="btn-primary" style="flex:1; font-size:0.72rem;" onclick="runStudioAction('accept_opportunity')">Sign Deal</button>
                <button class="btn-secondary" style="font-size:0.72rem;" onclick="runStudioAction('decline_opportunity')">Pass</button>
              </div>
            ` : `<p class="studio-empty">No deals in inbox. Buzz around to attract vultures.</p>`}
          </div>

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">🏢 Studio Operations</h4>
            <div class="studio-ops-grid">
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('investor_pitch')">Investor Pitch<br><small>-5 🎯</small></button>
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('rebrand')">Rebrand<br><small>-$500</small></button>
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('merch')">Merch Drop<br><small>-$150</small></button>
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('cleanup')">Clean Office<br><small>-$75</small></button>
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('networking')">Industry Mixer<br><small>-20 XP</small></button>
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('showcase')">Sales Showcase<br><small>-$200</small></button>
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('tax_audit')">Tax Audit<br><small>Free chaos</small></button>
              <button class="btn-secondary studio-ops-btn" onclick="runStudioAction('rename')">Rename Studio<br><small>Free ego</small></button>
            </div>
          </div>

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">🏆 Studio Trophy Wall</h4>
            <div class="awards-row">${awardsHtml}</div>
          </div>

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">📓 Studio Chronicle</h4>
            <div class="dev-diary-feed">${diaryHtml}</div>
          </div>
        </div>
      </div>
    </div>
  `;
}

function runStudioAction(actionId) {
  ensureStudioMeta();
  const rent = getStudioRentCost();

  if (actionId === "pay_rent") {
    if (gameState.cash < rent) { showToast(`Rent is $${rent}!`, "error"); return; }
    gameState.cash -= rent;
    gameState.rentOverdue = 0;
    gameState.studioMorale = Math.min(100, gameState.studioMorale + 8);
    pushStudioDiary(`Rent paid ($${rent}). Landlord sent a passive-aggressive thank-you emoji.`);
    addLog("Rent Paid", `Paid $${rent}. Morale restored slightly.`);
    showToast(`Rent paid! Morale +8`, "success");
  } else if (actionId === "investor_pitch") {
    if (gameState.nerve < 5) { showToast("Pitch needs 5 nerve!", "error"); return; }
    gameState.nerve -= 5;
    gameState.investorMeetings += 1;
    const success = gameState.studioReputation >= 10 + gameState.investorMeetings * 2;
    if (success) {
      const payout = 200 + gameState.studioReputation * 25 + gameState.investorMeetings * 50;
      gameState.cash += payout;
      gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 10);
      pushStudioDiary(`Investor meeting #${gameState.investorMeetings}: they said 'interesting' — finance for 'yes'. +$${payout}.`);
      addLog("Investor Pitch", `Secured $${payout} in 'strategic runway extension'.`);
      showToast(`Investor hooked! +$${payout}`, "success");
      if (window.SynthwaveAudio) SynthwaveAudio.playSFX("cash");
    } else {
      gameState.studioReputation = Math.max(0, gameState.studioReputation - 2);
      pushStudioDiary("Investor asked for users, revenue, and a soul. You had two spreadsheets.");
      showToast("Pitch flopped. Reputation -2", "warning");
    }
  } else if (actionId === "rebrand") {
    if (gameState.cash < 500) { showToast("Rebrand costs $500!", "error"); return; }
    gameState.cash -= 500;
    gameState.studioReputation = Math.min(100, gameState.studioReputation + 8);
    gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 12);
    const names = ["Neon Crunch Interactive", "Hyperbolic Games", "Bug Feature Studios", "Live Service Trauma LLC"];
    gameState.company_name = names[Math.floor(Math.random() * names.length)];
    pushStudioDiary(`Rebranded to '${gameState.company_name}'. Same bugs, fresher logo.`);
    addLog("Studio Rebrand", `Now operating as '${gameState.company_name}'.`);
    showToast("Rebrand complete! Rep +8", "success");
  } else if (actionId === "merch") {
    if (gameState.cash < 150) { showToast("Merch costs $150!", "error"); return; }
    if (gameState.games_released < 1) { showToast("Ship a game before selling hoodies!", "error"); return; }
    gameState.cash -= 150;
    const sales = 80 + gameState.games_released * 40 + Math.floor(gameState.studioBuzz * 2);
    gameState.cash += sales;
    gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 6);
    pushStudioDiary(`Merch drop sold ${Math.floor(sales / 15)} hoodies that say 'Day One Patch Soon™'.`);
    addLog("Merch Drop", `Earned $${sales} from questionable apparel.`);
    showToast(`Merch sold! +$${sales}`, "success");
  } else if (actionId === "cleanup") {
    if (gameState.cash < 75) { showToast("Cleanup costs $75!", "error"); return; }
    gameState.cash -= 75;
    gameState.studioMorale = Math.min(100, gameState.studioMorale + 12);
    pushStudioDiary("Office cleaned. Found three keyboards, two hopes, one working mouse.");
    showToast("Office sparkles! Morale +12", "success");
  } else if (actionId === "networking") {
    if (gameState.xp < 20) { showToast("Mixer costs 20 XP!", "error"); return; }
    gameState.xp -= 20;
    gameState.studioReputation = Math.min(100, gameState.studioReputation + 6);
    gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 8);
    pushStudioDiary("Industry mixer: exchanged 14 LinkedIn requests and zero business cards.");
    showToast("Networking done! Rep +6", "info");
  } else if (actionId === "showcase") {
    if (gameState.cash < 200) { showToast("Showcase costs $200!", "error"); return; }
    if (gameState.active_games.length === 0) { showToast("No active games to showcase!", "error"); return; }
    gameState.cash -= 200;
    gameState.active_games.forEach(g => { g.initialSalesRate = Math.ceil(g.initialSalesRate * 1.12); });
    gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 15);
    pushStudioDiary("Studio showcase streamed to 47 viewers (44 bots, 3 humans).");
    addLog("Studio Showcase", "All active titles got +12% sales velocity.");
    showToast("Showcase hype! All games boosted.", "success");
  } else if (actionId === "tax_audit") {
    const roll = Math.random();
    if (roll < 0.4) {
      const fine = Math.floor(50 + gameState.cash * 0.05);
      gameState.cash = Math.max(0, gameState.cash - fine);
      pushStudioDiary(`Tax audit found 'miscellaneous Steam keys' expense. Fine: $${fine}.`);
      showToast(`Audit fine: -$${fine}`, "warning");
    } else {
      const refund = Math.floor(60 + Math.random() * 120);
      gameState.cash += refund;
      pushStudioDiary(`Auditor confused by your depreciation of 'good intentions'. Refund: $${refund}.`);
      showToast(`Audit refund! +$${refund}`, "success");
    }
  } else if (actionId === "rename") {
    const newName = prompt("New studio name:", gameState.company_name);
    if (newName && newName.trim()) {
      gameState.company_name = newName.trim().substring(0, 40);
      pushStudioDiary(`Studio renamed to '${gameState.company_name}'. Trademark pending/emotional.`);
      showToast("Studio renamed!", "info");
    }
  } else if (actionId === "accept_opportunity") {
    const o = gameState.studioOpportunity;
    if (!o) return;
    if (gameState.studioReputation < o.repReq) { showToast(`Need ${o.repReq} reputation!`, "error"); return; }
    if (o.xp && gameState.xp < o.xp) { showToast(`Need ${o.xp} XP!`, "error"); return; }
    if (o.xp) gameState.xp -= o.xp;
    gameState.cash += o.cash;
    gameState.studioReputation = Math.min(100, gameState.studioReputation + 5);
    gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 10);
    pushStudioDiary(`Signed '${o.title}'. Lawyers high-fived (legally distinct from a handshake).`);
    addLog("Contract Signed", `${o.title}: +$${o.cash}.`);
    showToast(`Deal signed! +$${o.cash}`, "success");
    if (window.SynthwaveAudio) SynthwaveAudio.playSFX("cash");
    gameState.studioOpportunity = null;
    generateStudioOpportunity();
  } else if (actionId === "decline_opportunity") {
    pushStudioDiary(`Passed on '${gameState.studioOpportunity?.title}'. They'll be back with worse terms.`);
    gameState.studioOpportunity = null;
    generateStudioOpportunity();
    showToast("Opportunity declined. New one inbound.", "info");
  }

  saveGame();
  renderStudioDashboard();
  updateUI();
}

function suspendMiniGameForTabChange(nextTab) {
  if (!activeMiniGame) return;

  if (miniGameTimer) {
    clearInterval(miniGameTimer);
    miniGameTimer = null;
  }

  const mg = activeMiniGame;
  activeMiniGame = null;

  if (mg.isGig) {
    if (mg._refundNerve) gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + mg._refundNerve);
    if (mg._refundXp) gameState.xp += mg._refundXp;
    addLog("Gig Interrupted", "You alt-tabbed to another zone. Crime cancelled; nerve refunded (plausible deniability restored).");
    showToast("Gig aborted — focus refunded. One hack at a time, criminal.", "warning");
    renderGigsBoard();
    saveGame();
    return;
  }

  if (mg.isStore && nextTab !== "gigs") {
    if (mg.energyGain) gameState.energy = Math.min(gameState.max_energy, gameState.energy + mg.energyGain);
    if (mg.nerveGain) gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + mg.nerveGain);
    addLog("Store Run", "Abandoned brew mid-pour. Drank it lukewarm anyway.");
    showToast("Left the store mid-brew. Lukewarm caffeine acquired.", "warning");
    renderDeveloperStore();
    saveGame();
    return;
  }

  if (mg.isTraining && nextTab !== "gigs") {
    showToast("Training paused. Your gym membership is non-refundable.", "info");
    return;
  }

  if (!mg.isGig && !mg.isStore && !mg.isTraining && nextTab !== "develop") {
    miniGameCombo = 0;
    updateHudCombo(0);
    showToast("Sprint interrupted by a Slack @here. Energy not refunded.", "warning");
  }
}

// --- UI Sync Update ---
function updateUI() {
  // Resource displays
  const cashEl = document.getElementById("header-cash");
  const energyVal = document.getElementById("header-energy-val");
  const energyBar = document.getElementById("header-energy-bar");
  const nerveVal = document.getElementById("header-nerve-val");
  const nerveBar = document.getElementById("header-nerve-bar");

  if (cashEl) cashEl.innerText = `$${parseFloat(gameState.cash).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (energyVal) energyVal.innerText = `${Math.floor(gameState.energy)} / ${gameState.max_energy}`;
  if (energyBar) energyBar.style.width = `${(gameState.energy / gameState.max_energy) * 100}%`;

  if (nerveVal) nerveVal.innerText = `${Math.floor(gameState.nerve)} / ${gameState.max_nerve}`;
  if (nerveBar) nerveBar.style.width = `${(gameState.nerve / gameState.max_nerve) * 100}%`;

  // Dev Level & XP displays
  const levelVal = document.getElementById("header-level-val");
  const xpVal = document.getElementById("header-xp-val");
  const xpBar = document.getElementById("header-xp-bar");

  if (levelVal) levelVal.innerText = gameState.level;
  if (xpVal) xpVal.innerText = `${Math.floor(gameState.xp)} / ${gameState.xp_needed} XP`;
  if (xpBar) xpBar.style.width = `${Math.min(100, (gameState.xp / gameState.xp_needed) * 100)}%`;

  ensureStudioMeta();

  const companySection = document.getElementById("company-section");
  const companyVisible = companySection && companySection.style.display !== "none";
  if (companyVisible && studioDashboardRefreshCounter++ % 4 === 0) {
    renderStudioDashboard();
  }

  const developSection = document.getElementById("develop-section");
  const developVisible = developSection && developSection.style.display !== "none";
  developPanelRefreshCounter++;
  if (gameState.current_project && developVisible && !activeMiniGame) {
    if (gameState.current_project.phase !== "post_release" && developPanelRefreshCounter % 4 === 0) {
      renderProjectProgress();
    }
  }

  // Refresh research lab upgrade statuses in real time when Staff section is active
  const staffSection = document.getElementById("staff-section");
  if (staffSection && staffSection.style.display !== "none") {
    renderResearchLab();
  }

  // Update activities button states
  const chairsBtn = document.getElementById("btn-chairs-activity");
  if (chairsBtn && gameState.ergonomic_chairs) {
    chairsBtn.disabled = true;
    chairsBtn.innerText = "Purchased";
  }

  updateZonePulse();
}

function updateZonePulse() {
  const project = gameState.current_project;
  const developPulse = document.getElementById("zone-pulse-develop");
  if (developPulse) {
    const lit = project && project.phase !== "post_release";
    developPulse.classList.toggle("lit", lit);
  }
  const gigsPulse = document.getElementById("zone-pulse-gigs");
  if (gigsPulse) {
    gigsPulse.classList.toggle("lit", gameState.energy >= 5 || gameState.nerve >= 2);
  }
  const companyPulse = document.getElementById("zone-pulse-company");
  if (companyPulse) {
    companyPulse.classList.toggle("lit", gameState.active_games.length > 0 || gameState.rentOverdue > 0);
  }
}

// --- Training Actions (GYM) ---
function renderTrainingGym() {
  const container = document.getElementById("training-gym-grid");
  if (!container) return;

  if (activeMiniGame && activeMiniGame.isTraining) {
    let gameHtml = "";
    if (activeMiniGame.type === 'code') {
      gameHtml = `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--color-cyan); padding: 20px; border-radius: 12px; grid-column: span 3; width: 100%;">
          <h4 style="color:var(--color-cyan); margin-bottom: 8px;">⌨️ Coding Mini-game: Syntax Striker</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:12px;">Type the following code snippet exactly as shown within the time limit:</p>
          
          <div style="background:#060608; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:8px; font-family:monospace; font-size:1rem; color:#ffd700; text-align:center; margin-bottom:12px; letter-spacing:0.5px; user-select:none;">
            ${activeMiniGame.target}
          </div>

          <input type="text" id="minigame-code-input" autocomplete="off" placeholder="Type it here..." style="width:100%; padding:12px; background:rgba(0,0,0,0.6); border:1px solid var(--border-glass); border-radius:8px; color:#fff; font-family:monospace; font-size:1rem; margin-bottom:12px;" oninput="submitCodeInput()">
          
          <div class="status-bar-track" style="height:6px; margin-bottom:12px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width:100%; height:100%; background:var(--color-cyan);"></div>
          </div>
          
          <button class="btn-secondary" style="width:100%; border-color:rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">Cancel Mini-game</button>
        </div>
      `;
    } else if (activeMiniGame.type === 'design') {
      gameHtml = `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--color-purple); padding: 20px; border-radius: 12px; grid-column: span 3; width: 100%;">
          <h4 style="color:var(--color-purple); margin-bottom: 8px;">🎨 Design Mini-game: Color Matcher</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:12px;">Stroop Effect! Click the button that matches the target color name:</p>
          
          <div style="font-size:1.6rem; font-weight:800; text-align:center; margin-bottom:15px; letter-spacing:1px; color: ${getRandomColorHex()};">
            ${activeMiniGame.targetColor.name}
          </div>

          <div style="display:flex; gap:10px; margin-bottom:15px;">
            ${activeMiniGame.buttons.map(btn => {
              return `<button class="btn-primary" style="flex:1; background:${btn.hex}; border-color:${btn.hex}; color:#000;" onclick="selectDesignColor('${btn.name}')">${btn.name}</button>`;
            }).join("")}
          </div>

          <div class="status-bar-track" style="height:6px; margin-bottom:12px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width:100%; height:100%; background:var(--color-purple);"></div>
          </div>
          
          <button class="btn-secondary" style="width:100%; border-color:rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">Cancel Mini-game</button>
        </div>
      `;
    } else if (activeMiniGame.type === 'polish') {
      const buttons = [0, 1, 2, 3];
      gameHtml = `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid #ffd700; padding: 20px; border-radius: 12px; grid-column: span 3; width: 100%;">
          <h4 style="color:#ffd700; margin-bottom: 8px;">🐛 Polish Mini-game: Bug Squasher</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:12px;">Click the button containing the BUG to squash it:</p>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:15px;">
            ${buttons.map(i => {
              const isBug = i === activeMiniGame.bugIndex;
              return `<button class="btn-secondary" style="padding:16px; font-size:1rem; font-weight:bold;" onclick="clickBugButton(${i})">${isBug ? "🐛 BUG" : "Clean Line"}</button>`;
            }).join("")}
          </div>

          <div class="status-bar-track" style="height:6px; margin-bottom:12px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width:100%; height:100%; background:#ffd700;"></div>
          </div>
          
          <button class="btn-secondary" style="width:100%; border-color:rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">Cancel Mini-game</button>
        </div>
      `;
    }

    container.innerHTML = gameHtml;

    if (activeMiniGame.type === 'code') {
      setTimeout(() => {
        const input = document.getElementById("minigame-code-input");
        if (input) input.focus();
      }, 50);
    }
    return;
  }

  const xpCostText = gameState.level > 1 ? "-15 XP" : "FREE (mom pays tuition)";

  container.innerHTML = `
    <div class="card-item" style="padding: 14px;">
      <div class="card-item-title" style="font-size: 0.95rem;">
        <span>Code Optimization Class</span>
        <span style="color: #ffd700; display:flex; gap:8px;"><span>-10 ⚡</span> <span style="color:var(--color-cyan); font-weight:bold;">${xpCostText}</span></span>
      </div>
      <div class="card-item-desc" style="font-size: 0.8rem; line-height:1.4;">
        Solve complex algorithm challenges. Coding skill increases points generated during sprints.<br>
        <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
          <strong>Syllabus Excerpt:</strong> Learn how to write O(N^3) nested loops and explain it to management as 'dynamic scaling'. Study why comments like <code>// do not touch this or server melts</code> are essential for job security.
        </span>
      </div>
      <button class="btn-primary" style="padding: 10px;" onclick="trainSkill('coding_skill')">Train Coding</button>
    </div>

    <div class="card-item" style="padding: 14px;">
      <div class="card-item-title" style="font-size: 0.95rem;">
        <span>Design Theory Templates</span>
        <span style="color: #ffd700; display:flex; gap:8px;"><span>-10 ⚡</span> <span style="color:var(--color-cyan); font-weight:bold;">${xpCostText}</span></span>
      </div>
      <div class="card-item-desc" style="font-size: 0.8rem; line-height:1.4;">
        Study harmonic layout guidelines. Design skill contributes heavy design points to active games.<br>
        <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
          <strong>Syllabus Excerpt:</strong> Discover why using 12 neon shades of purple creates a 'cyberpunk layout' that distracts reviewers from collision detection failures. Learn the hex codes of wobbly loot boxes.
        </span>
      </div>
      <button class="btn-primary" style="padding: 10px;" onclick="trainSkill('design_skill')">Train Design</button>
    </div>

    <div class="card-item" style="padding: 14px;">
      <div class="card-item-title" style="font-size: 0.95rem;">
        <span>Agile Lead Seminars</span>
        <span style="color: #ffd700; display:flex; gap:8px;"><span>-10 ⚡</span> <span style="color:var(--color-cyan); font-weight:bold;">${xpCostText}</span></span>
      </div>
      <div class="card-item-desc" style="font-size: 0.8rem; line-height:1.4;">
        Practice project management classes. Management skill boosts gig success and bug squashing.<br>
        <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
          <strong>Syllabus Excerpt:</strong> A 4-hour presentation on why talking about coding is mathematically more productive than coding. Learn how to convert 2 lines of edits into a 15-person standup meeting.
        </span>
      </div>
      <button class="btn-primary" style="padding: 10px;" onclick="trainSkill('management_skill')">Train Management</button>
    </div>
  `;
}

function trainSkill(skillName) {
  const xpCost = gameState.level > 1 ? 15 : 0;
  if (gameState.xp < xpCost) {
    showToast(`Requires ${xpCost} XP to train!`, "error");
    return;
  }
  if (gameState.energy < 10) {
    showToast("Insufficient energy. Take a rest!", "error");
    return;
  }

  let type = 'code';
  if (skillName === 'design_skill') type = 'design';
  else if (skillName === 'management_skill') type = 'polish';

  startMiniGame(type, true);
}

// --- Gigs System (CRIMES) ---
function runGig(gigId) {
  const gig = GIGS.find(g => g.id === gigId);
  if (!gig) return;

  const xpCost = getGigXpCost(gigId);

  if (gameState.xp < xpCost) {
    showToast(`Insufficient XP! Performing this gig requires ${xpCost} XP.`, "error");
    return;
  }

  if (gameState.nerve < gig.nerveCost) {
    showToast("Not enough nerve! Wait for your focus to recharge.", "error");
    return;
  }

  if (!confirm(`Are you sure you want to perform gig '${gig.name}'? Costs ${gig.nerveCost} Nerve and ${xpCost} XP.`)) {
    return;
  }

  gameState.nerve -= gig.nerveCost;
  gameState.xp -= xpCost;

  const attachGigMeta = (mg) => {
    mg._refundNerve = gig.nerveCost;
    mg._refundXp = xpCost;
    return mg;
  };

  if (gigId === "freelance_html") {
    activeMiniGame = attachGigMeta({
      type: "slider",
      isGig: true,
      gigId: gigId,
      duration: 8000,
      elapsed: 0,
      needlePosition: 0,
      needleDirection: 1,
      needleSpeed: 4,
      greenZoneStart: 38,
      greenZoneEnd: 62
    });
  } else if (gigId === "crack_competitor") {
    const { target, options } = generateBinaryMatcherState();
    activeMiniGame = attachGigMeta({
      type: "binary",
      isGig: true,
      gigId: gigId,
      duration: 10000,
      elapsed: 0,
      targetSequence: target,
      options: options
    });
  } else if (gigId === "ransomware") {
    let coords = [];
    for (let i = 1; i <= 4; i++) {
      coords.push({
        num: i,
        top: Math.floor(Math.random() * 50) + 20,
        left: Math.floor(Math.random() * 70) + 15
      });
    }
    activeMiniGame = attachGigMeta({
      type: "trace",
      isGig: true,
      gigId: gigId,
      duration: 12000,
      elapsed: 0,
      currentNumber: 1,
      coords: coords
    });
  } else if (gigId === "ddos_rival") {
    activeMiniGame = attachGigMeta({
      type: "ping",
      isGig: true,
      gigId: gigId,
      duration: 7000,
      elapsed: 0,
      clicksCount: 0,
      targetClicks: 15
    });
  }

  activateMiniGameTimer();
  renderGigsBoard();
  updateUI();
}

// --- Staff & Office Panel Upgrades ---
function renderStaffPanel() {
  const staffContainer = document.getElementById("staff-capacity-status");
  const officeCapacity = OFFICE_TIERS[gameState.office_tier]?.capacity || 0;

  if (staffContainer) {
    staffContainer.innerHTML = `
      Office: <strong>${gameState.office_tier}</strong> | 
      Capacity: <strong>${gameState.employees.length} / ${officeCapacity}</strong> staff members hired.
    `;
  }

  // Rent Upgrade options
  const officeGrid = document.getElementById("office-upgrade-grid");
  if (officeGrid) {
    officeGrid.innerHTML = Object.keys(OFFICE_TIERS).map(tierKey => {
      const tier = OFFICE_TIERS[tierKey];
      const isOwned = gameState.office_tier === tierKey;
      const canAfford = gameState.cash >= tier.cost;
      return `
        <div class="card-item" style="${isOwned ? "border-color:var(--color-cyan);" : ""}">
          <div class="card-item-title">
            <span>${tier.name}</span>
            <span>${tier.cost > 0 ? `$${tier.cost.toLocaleString()}` : "Free"}</span>
          </div>
          <div class="card-item-desc" style="font-size:0.76rem; margin:6px 0; color:var(--color-text-muted); line-height:1.35;">
            ${tier.desc}<br><br>
            Staff Capacity: <strong>${tier.capacity}</strong> employees.<br>
            Dev Speed Multiplier: <strong>${tier.speedMult}x</strong> speed.
          </div>
          <button class="btn-primary" style="padding: 10px;" ${isOwned || !canAfford ? "disabled" : ""} onclick="buyOffice('${tierKey}')">
            ${isOwned ? "Owned" : "Upgrade"}
          </button>
        </div>
      `;
    }).join("");
  }

  // Staff options
  const staffGrid = document.getElementById("staff-hire-grid");
  if (staffGrid) {
    staffGrid.innerHTML = Object.keys(EMPLOYEES_INFO).map(empKey => {
      const emp = EMPLOYEES_INFO[empKey];
      const hiredCount = gameState.employees.filter(e => e.id === empKey).length;
      const canAfford = gameState.cash >= emp.cost;
      const atCapacity = gameState.employees.length >= officeCapacity;
      return `
        <div class="card-item">
          <div class="card-item-title">
            <span>${emp.name}</span>
            <span>$${emp.cost.toLocaleString()}</span>
          </div>
          <div class="card-item-desc" style="font-size:0.76rem; margin:6px 0; color:var(--color-text-muted); line-height:1.35;">
            ${emp.desc}<br><br>
            Passively Generates:<br>
            Tech: <strong>+${emp.techRate}/s</strong> | Design: <strong>+${emp.designRate}/s</strong><br>
            Salary: <strong>$${emp.salary}/minute</strong>
          </div>
          <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
            <span style="font-size:0.8rem; color:var(--color-text-muted);">Active Staff: ${hiredCount}</span>
            <button class="btn-secondary" ${atCapacity || !canAfford ? "disabled" : ""} onclick="hireEmployee('${empKey}')">
              Hire
            </button>
          </div>
        </div>
      `;
    }).join("");
  }

  // Active staff list
  const activeStaffList = document.getElementById("active-staff-list");
  if (activeStaffList) {
    if (gameState.employees.length === 0) {
      activeStaffList.innerHTML = `<div style="text-align:center; font-style:italic; color:var(--color-text-muted); padding:20px;">No hired employees on team.</div>`;
    } else {
      activeStaffList.innerHTML = gameState.employees.map((emp, index) => {
        const info = EMPLOYEES_INFO[emp.id];
        return `
          <div class="staff-row">
            <div class="staff-info">
              <span class="staff-name">${info.name} (ID: #${index + 1})</span>
              <span class="staff-details">Salary: $${info.salary}/min | Tech: +${info.techRate}/s | Design: +${info.designRate}/s</span>
            </div>
            <button class="btn-secondary" style="border-color:rgba(255, 23, 68, 0.3); color:#ff1744; padding:6px 12px; font-size:0.75rem;" onclick="fireEmployee(${index})">
              Fire
            </button>
          </div>
        `;
      }).join("");
    }
  }
}

function buyOffice(tierKey) {
  const tier = OFFICE_TIERS[tierKey];
  if (!tier || gameState.cash < tier.cost) return;

  if (!confirm(`Are you sure you want to upgrade office premises to '${tier.name}' for $${tier.cost.toLocaleString()}?`)) {
    return;
  }

  gameState.cash -= tier.cost;
  gameState.office_tier = tierKey;
  pushStudioDiary(`Moved to ${tier.name}. ${tier.desc.substring(0, 80)}...`);

  addLog("Office Upgraded", `Moved studio premises to ${tier.name}. Cash spent: $${tier.cost}.`);
  showToast(`Moved to ${tier.name}!`, "success");

  saveGame();
  renderStaffPanel();
  updateUI();
}

function hireEmployee(empKey) {
  const emp = EMPLOYEES_INFO[empKey];
  const capacity = OFFICE_TIERS[gameState.office_tier]?.capacity || 0;

  if (gameState.employees.length >= capacity) {
    showToast("Office is at maximum staff capacity!", "error");
    return;
  }

  if (gameState.cash < emp.cost) {
    showToast("Cannot afford hiring fee!", "error");
    return;
  }

  if (!confirm(`Are you sure you want to hire '${emp.name}' for a sign-on fee of $${emp.cost.toLocaleString()}?`)) {
    return;
  }

  gameState.cash -= emp.cost;
  gameState.employees.push({ id: empKey, name: emp.name });

  addLog("Staff Hired", `Hired a ${emp.name} for a sign-on bonus of $${emp.cost}.`);
  showToast(`${emp.name} joined team!`, "success");

  saveGame();
  renderStaffPanel();
  updateUI();
}

function fireEmployee(index) {
  if (index < 0 || index >= gameState.employees.length) return;
  const emp = gameState.employees[index];
  const info = EMPLOYEES_INFO[emp.id];
  if (!confirm(`Fire ${info?.name || emp.name}? They will live-tweet about your 'toxic studio culture'.`)) return;

  gameState.employees.splice(index, 1);

  addLog("Staff Dismissed", `Fired ${info?.name || emp.name}. They left a 1-star Glassdoor review from the parking lot.`);
  showToast(`${info?.name || emp.name} was dismissed. Morale unchanged (there was none).`, "info");

  saveGame();
  renderStaffPanel();
  updateUI();
}

// --- Development Panel ---
function renderDevelopPanel() {
  const devPanel = document.getElementById("develop-panel-content");
  if (!devPanel) return;

  if (!gameState.current_project) {
    const portfolioCount = (gameState.portfolio || []).length;
    devPanel.innerHTML = `
      <div class="dev-board-intro">
        <p class="dev-board-tagline">Formulate a project, sign away your sanity, and enter crunch time. The board tracks every sprint, milestone, and regrettable scope decision.</p>
      </div>
      <div class="dev-board-grid">
        <div class="dev-board-card">
          <h3 style="margin-bottom:12px;">📋 New Project Brief</h3>
          
          <div class="form-group">
            <label class="form-label">Game Title</label>
            <div style="display:flex; gap:10px;">
              <input type="text" id="game-name-input" placeholder="Title of your game..." style="flex:1;">
              <button class="btn-secondary" id="random-name-btn">🎲 Random</button>
            </div>
          </div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
            <div class="form-group">
              <label class="form-label">Genre Selection</label>
              <select id="genre-select">
                <option value="RPG">RPG</option>
                <option value="Action">Action</option>
                <option value="Strategy">Strategy</option>
                <option value="Simulation">Simulation</option>
                <option value="Adventure">Adventure</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Topic Selection</label>
              <select id="topic-select">
                <option value="Cyberpunk">Cyberpunk</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Zombie">Zombie</option>
                <option value="Space">Space</option>
                <option value="Farming">Farming</option>
                <option value="Game Dev">Game Dev</option>
              </select>
            </div>
          </div>

          <div id="synergy-preview" class="synergy-preview-box">Synergy preview loading...</div>

          <div style="display:grid; grid-template-columns: 1fr 1fr; gap:15px;">
            <div class="form-group">
              <label class="form-label">Target Platform</label>
              <select id="platform-select">
                <option value="pc">PC (Dev Cost: $100)</option>
                <option value="console">Console (Dev Cost: $500)</option>
                <option value="mobile">Mobile (Dev Cost: $50)</option>
              </select>
            </div>
            <div class="form-group">
              <label class="form-label">Project Scale</label>
              <select id="scale-select">
                <option value="Small">Small (4–5 Energy per dev sprint)</option>
                <option value="Medium">Medium (Requires $1,000 budget)</option>
                <option value="Large">Large (Requires $10,000 budget)</option>
                <option value="AAA">AAA (Requires $50,000 budget)</option>
              </select>
            </div>
          </div>

          <button class="btn-primary" style="margin-top:10px;" onclick="createGameProject()">
            💻 Start Development Project
          </button>
        </div>

        <div class="dev-board-card dev-board-sidebar">
          <h4 style="margin-bottom:10px; color:var(--color-purple); text-transform:uppercase; font-size:0.8rem; letter-spacing:1px;">Studio Pipeline Guide</h4>
          <div class="dev-pipeline-guide">
            ${DEV_PHASES.map(p => `<div class="dev-guide-step"><span>${p.icon}</span><div><strong>${p.label}</strong><p>Unlocks at ${p.min}% progress. Each phase unlocks new diary drama.</p></div></div>`).join("")}
          </div>
          <div style="margin-top:14px; padding-top:14px; border-top:1px dashed rgba(255,255,255,0.08); font-size:0.78rem; color:var(--color-text-muted); line-height:1.45;">
            <strong style="color:var(--color-cyan);">Games shipped:</strong> ${portfolioCount}<br>
            Ship at <strong>90%</strong> with <strong>≤8 bugs</strong>. Post-release live ops, DLC, sequels, and remasters unlock after launch.
          </div>
        </div>
      </div>
    `;
    initFormInputs();
  } else if (gameState.current_project.phase === "post_release") {
    renderPostReleaseDashboard();
  } else {
    // Project actively in progress
    renderProjectProgress();
  }
}

function createGameProject() {
  const nameInput = document.getElementById("game-name-input");
  const name = nameInput ? nameInput.value.trim() : "";
  if (!name) {
    showToast("Please enter a game title!", "error");
    return;
  }

  const genre = document.getElementById("genre-select").value;
  const topic = document.getElementById("topic-select").value;
  const platformKey = document.getElementById("platform-select").value;
  const scale = document.getElementById("scale-select").value;

  if (platformKey === "console" && !gameState.unlocked_console) {
    showToast("Console requires Spinning Green Cube™ research. Pear Station lawyers demand at least one rotating cube.", "error");
    return;
  }

  // Verify budgets
  let scaleCost = 0;
  if (scale === "Medium") scaleCost = 1000;
  if (scale === "Large") scaleCost = 10000;
  if (scale === "AAA") scaleCost = 50000;

  const totalCost = scaleCost + PLATFORMS[platformKey].cost;
  if (gameState.cash < totalCost) {
    showToast(`Insufficient cash reserves! Required: $${totalCost.toLocaleString()}`, "error");
    return;
  }

  let xpCost = 10;
  if (scale === "Medium") xpCost = 30;
  else if (scale === "Large") xpCost = 80;
  else if (scale === "AAA") xpCost = 200;

  if (gameState.level === 1 && scale === "Small") {
    xpCost = 0;
  }

  if (gameState.xp < xpCost) {
    showToast(`Insufficient XP! Starting a ${scale} project requires ${xpCost} XP.`, "error");
    return;
  }

  if (!confirm(`Are you sure you want to start developing '${name}'? Costs $${totalCost.toLocaleString()} and ${xpCost} XP.`)) {
    return;
  }

  gameState.cash -= totalCost;
  gameState.xp -= xpCost;
  const synergy = getSynergyInfo(genre, topic);
  gameState.current_project = ensureProjectMeta({
    name,
    genre,
    topic,
    platform: platformKey,
    scale,
    tech_points: 0,
    design_points: 0,
    bug_points: 0,
    progress: 0,
    phase: "coding",
    devPhase: "concept",
    miniGamesPlayed: 0,
    miniGamesWon: 0,
    miniGamesLost: 0,
    techDebt: 0,
    hypeMeter: 5,
    scopeFeatures: 0,
    milestonesHit: [],
    devDiary: [],
    focusGroupBonus: 0,
    playtestsRun: 0
  });
  pushDevDiary(gameState.current_project, "concept", `Greenlit '${name}' (${genre}/${topic}). Synergy forecast: ${synergy.label}. CFO cried, then approved.`);

  addLog("Project Started", `Initiated development of '${name}' (${genre}/${topic}) on ${PLATFORMS[platformKey].name}. Budget spent: $${totalCost}. Synergy: ${synergy.label}.`);
  showToast("Development initialized!", "success");

  saveGame();
  renderDevelopPanel();
  updateUI();
}

let activeMiniGame = null;
let miniGameTimer = null;

function getRandomColorHex() {
  const hexes = ['#00e5ff', '#b388ff', '#ffd700'];
  return hexes[Math.floor(Math.random() * hexes.length)];
}

function startMiniGame(type, isTraining = false) {
  const energyCost = isTraining ? 10 : (gameState.level === 1 ? 4 : 5);
  const xpCost = isTraining ? (gameState.level > 1 ? 15 : 0) : 0;

  if (gameState.energy < energyCost) {
    showToast(`Insufficient energy. Requires ${energyCost} Energy!`, "error");
    return;
  }
  if (isTraining && gameState.xp < xpCost) {
    showToast(`Insufficient XP. Requires ${xpCost} XP to train!`, "error");
    return;
  }

  // Clear previous timer
  if (miniGameTimer) clearInterval(miniGameTimer);

  activeMiniGame = {
    type: type,
    isTraining: isTraining,
    timeLeft: 100, // percentage
    duration: type === 'code' ? (gameState.ai_behavior ? 25000 : 15000) : 10000, // ms
    elapsed: 0
  };

  if (type === 'code') {
    const snippets = [
      'rm -rf / --no-preserve-root',
      'const bugs = new Array(999);',
      '// TODO: fix this before Friday',
      'while(true) { console.log("help"); }',
      '// Copied from StackOverflow',
      'if (score === 10) rating = 1.0;',
      'const database = "local_json_lol";',
      '// It works on my machine',
      'npm install left-pad',
      'git commit -m "jerry-rigged fix"',
      'sudo chmod -R 777 /',
      '// Pray to the server gods',
      'window.gameLoop = "pure_luck";'
    ];
    activeMiniGame.target = snippets[Math.floor(Math.random() * snippets.length)];
  } else if (type === 'design') {
    const colors = [
      { name: 'CYAN', hex: '#00e5ff' },
      { name: 'PURPLE', hex: '#b388ff' },
      { name: 'GOLD', hex: '#ffd700' }
    ];
    activeMiniGame.targetColor = colors[Math.floor(Math.random() * colors.length)];
    // Randomize buttons
    activeMiniGame.buttons = [...colors].sort(() => Math.random() - 0.5);
  } else if (type === 'polish') {
    activeMiniGame.bugIndex = Math.floor(Math.random() * 4); // 4 buttons
  }

  // Deduct energy & XP
  gameState.energy -= energyCost;
  if (isTraining) {
    gameState.xp -= xpCost;
  }
  updateUI();

  // Start timer interval (every 100ms)
  const interval = 100;
  miniGameTimer = setInterval(() => {
    if (!activeMiniGame) {
      clearInterval(miniGameTimer);
      return;
    }

    activeMiniGame.elapsed += interval;
    activeMiniGame.timeLeft = Math.max(0, 100 - (activeMiniGame.elapsed / activeMiniGame.duration) * 100);

    // Update the progress bar element directly for performance
    const bar = document.getElementById("minigame-timer-bar");
    if (bar) {
      bar.style.width = `${activeMiniGame.timeLeft}%`;
    }

    if (activeMiniGame.elapsed >= activeMiniGame.duration) {
      clearInterval(miniGameTimer);
      failMiniGame("Time Out!");
    }
  }, interval);

  if (isTraining) {
    renderTrainingGym();
  } else {
    renderProjectProgress();
  }
}

function cancelMiniGame() {
  if (miniGameTimer) clearInterval(miniGameTimer);
  if (!activeMiniGame) return;

  const isTraining = activeMiniGame.isTraining;
  const isGig = activeMiniGame.isGig;
  const isStore = activeMiniGame.isStore;
  const itemId = activeMiniGame.itemId;
  const storeEnergy = activeMiniGame.energyGain;
  const storeNerve = activeMiniGame.nerveGain;
  const refundNerve = activeMiniGame._refundNerve || 0;
  const refundXp = activeMiniGame._refundXp || 0;

  activeMiniGame = null;

  if (isStore) {
    if (storeEnergy > 0) {
      gameState.energy = Math.min(gameState.max_energy, gameState.energy + storeEnergy);
      addLog("Consumable Aborted", `Brew cancelled. Gained base +${storeEnergy} Energy.`);
      showToast(`Brew aborted! +${storeEnergy} Energy`, "warning");
    }
    if (storeNerve > 0) {
      gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + storeNerve);
      addLog("Consumable Aborted", `Nootropic cancelled. Gained base +${storeNerve} Nerve.`);
      showToast(`Nootropic aborted! +${storeNerve} Nerve Focus`, "warning");
    }
    saveGame();
    renderDeveloperStore();
    updateUI();
    return;
  }

  if (isGig) {
    if (refundNerve) gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + refundNerve);
    if (refundXp) gameState.xp += refundXp;
    addLog("Gig Cancelled", "Aborted mid-hack. Nerve refunded. Your VPN history has been tastefully blurred.");
    showToast("Gig aborted — nerve refunded. The FBI sends their regards.", "warning");
    saveGame();
    renderGigsBoard();
    updateUI();
    return;
  }

  if (!isTraining && !isGig && !isStore) {
    miniGameCombo = 0;
    updateHudCombo(0);
  }

  addLog("Mini-game Cancelled", isTraining ? "Training session aborted." : "Development cycle aborted.");
  if (isTraining) {
    renderTrainingGym();
  } else {
    renderProjectProgress();
  }
  updateUI();
}

function submitCodeInput() {
  if (!activeMiniGame || activeMiniGame.type !== 'code') return;
  const inputEl = document.getElementById("minigame-code-input");
  const value = inputEl ? inputEl.value.trim() : "";

  if (value === activeMiniGame.target) {
    if (miniGameTimer) clearInterval(miniGameTimer);
    successMiniGame();
  }
}

function selectDesignColor(colorName) {
  if (!activeMiniGame || activeMiniGame.type !== 'design') return;

  if (colorName === activeMiniGame.targetColor.name) {
    if (miniGameTimer) clearInterval(miniGameTimer);
    successMiniGame();
  } else {
    if (miniGameTimer) clearInterval(miniGameTimer);
    failMiniGame("Wrong Color clicked!");
  }
}

function clickBugButton(clickedIndex) {
  if (!activeMiniGame || activeMiniGame.type !== 'polish') return;

  if (clickedIndex === activeMiniGame.bugIndex) {
    if (miniGameTimer) clearInterval(miniGameTimer);
    successMiniGame();
  } else {
    if (miniGameTimer) clearInterval(miniGameTimer);
    failMiniGame("Clicked clean code!");
  }
}

function successMiniGame() {
  if (!activeMiniGame) return;
  ChiptuneAudio.playSFX("success");
  const type = activeMiniGame.type;
  const isTraining = activeMiniGame.isTraining;
  const isGig = activeMiniGame.isGig;
  const gigId = activeMiniGame.gigId;
  const isStore = activeMiniGame.isStore;
  const itemId = activeMiniGame.itemId;

  const storeEnergy = activeMiniGame.energyGain;
  const storeNerve = activeMiniGame.nerveGain;

  activeMiniGame = null;

  if (isStore) {
    let label = itemId === "energy_drink" ? "Java Volt Energy Drink" : (itemId === "coffee" ? "Espresso Shot Coffee" : "Focus Nootropic Pill");
    if (storeEnergy > 0) {
      const doubledEnergy = storeEnergy * 2;
      gameState.energy = Math.min(gameState.max_energy, gameState.energy + doubledEnergy);
      addLog("Consumable Masterwork", `Successfully brewed/poured perfect ${label}! Gained double energy: +${doubledEnergy} Energy.`);
      showToast(`Perfect brew! +${doubledEnergy} Energy`, "success");
    }
    if (storeNerve > 0) {
      const doubledNerve = storeNerve * 2;
      gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + doubledNerve);
      addLog("Consumable Masterwork", `Successfully ingested perfect ${label}! Gained double focus: +${doubledNerve} Nerve.`);
      showToast(`Perfect focus! +${doubledNerve} Nerve Focus`, "success");
    }
    saveGame();
    renderDeveloperStore();
    updateUI();
    return;
  }

  if (isGig) {
    finishGig(gigId, true);
    return;
  }

  if (isTraining) {
    const skillGain = Math.floor(Math.random() * 3) + 2; // 2-4 points
    let skillLabel = "";
    if (type === 'code') {
      gameState.coding_skill += skillGain;
      skillLabel = "Coding";
      addLog("Coding Workout Success!", `Successfully solved algorithm challenge. Coding skill improved by +${skillGain} (Now: ${gameState.coding_skill}).`);
      showToast(`Coding Skill increased! +${skillGain}`, "success");
    } else if (type === 'design') {
      gameState.design_skill += skillGain;
      skillLabel = "Design";
      addLog("Design Workout Success!", `Successfully designed layout interface. Design skill improved by +${skillGain} (Now: ${gameState.design_skill}).`);
      showToast(`Design Skill increased! +${skillGain}`, "success");
    } else if (type === 'polish') {
      gameState.management_skill += skillGain;
      skillLabel = "Management";
      addLog("Management Workout Success!", `Successfully optimized project workflow. Management skill improved by +${skillGain} (Now: ${gameState.management_skill}).`);
      showToast(`Management Skill increased! +${skillGain}`, "success");
    }
    gainXP(10);
    saveGame();
    renderTrainingGym();
    updateUI();
    return;
  }

  if (gameState.current_project) {
    gameState.current_project.miniGamesPlayed = (gameState.current_project.miniGamesPlayed || 0) + 1;
    gameState.current_project.miniGamesWon = (gameState.current_project.miniGamesWon || 0) + 1;
  }

  const target = getTargetPointsForScale(gameState.current_project.scale);
  miniGameCombo++;
  const comboMult = Math.min(1.8, 1 + (miniGameCombo - 1) * 0.12);
  updateHudCombo(miniGameCombo);

  if (miniGameCombo >= 3) {
    ChiptuneAudio.playSFX("combo");
    triggerScreenFlash(255, 215, 0);
  }

  const comboLabel = miniGameCombo >= 2 ? ` (${miniGameCombo}x COMBO!)` : "";

  if (type === 'code') {
    const pointsGained = Math.ceil(target * comboMult);
    gameState.current_project.tech_points += pointsGained;
    gameState.coding_skill += 1;

    addLog("Syntax Striker Success!", `Correctly typed code snippet. Gained +${pointsGained} Tech Points${comboLabel} and +1 Coding Skill.`);
    showToast(`Code success! +${pointsGained} Tech${comboLabel}`, "success");
  } else if (type === 'design') {
    const pointsGained = Math.ceil(target * comboMult);
    gameState.current_project.design_points += pointsGained;
    gameState.design_skill += 1;

    addLog("Color Matcher Success!", `Matched target design color resonance. Gained +${pointsGained} Design Points${comboLabel} and +1 Design Skill.`);
    showToast(`Design success! +${pointsGained} Design${comboLabel}`, "success");
  } else if (type === 'polish') {
    const bugsRemoved = Math.floor((Math.random() * 8) + 8 + Math.floor(gameState.management_skill / 8)) * comboMult;
    gameState.current_project.bug_points = Math.max(0, gameState.current_project.bug_points - bugsRemoved);
    gameState.management_skill += 1;

    addLog("Bug Squasher Success!", `Squashed compiler bugs. Removed -${Math.floor(bugsRemoved)} bugs${comboLabel} and gained +1 Management.`);
    showToast(`Polished! -${Math.floor(bugsRemoved)} Bugs${comboLabel}`, "success");
  }

  const xpGain = 5 + Math.min(10, miniGameCombo * 2);
  gainXP(xpGain);
  const proj = ensureProjectMeta(gameState.current_project);
  const pct = getProjectProgressPercent(proj);
  proj.devPhase = getDevPhaseId(pct);
  proj.techDebt = Math.max(0, (proj.techDebt || 0) - 1);
  if (Math.random() < 0.35) pushDevDiary(proj, proj.devPhase);
  checkDevMilestones(proj);
  saveGame();
  renderProjectProgress();
  updateUI();
}

function failMiniGame(reason) {
  if (!activeMiniGame) return;
  ChiptuneAudio.playSFX("fail");
  const type = activeMiniGame.type;
  const isTraining = activeMiniGame.isTraining;
  const isGig = activeMiniGame.isGig;
  const gigId = activeMiniGame.gigId;
  const isStore = activeMiniGame.isStore;
  const itemId = activeMiniGame.itemId;

  const storeEnergy = activeMiniGame.energyGain;
  const storeNerve = activeMiniGame.nerveGain;

  activeMiniGame = null;

  if (isStore) {
    if (storeEnergy > 0) {
      gameState.energy = Math.min(gameState.max_energy, gameState.energy + storeEnergy);
      addLog("Consumable Fail (Bitter Brew)", `Brew failed: ${reason}. Drank bitter cold coffee anyway. Gained base +${storeEnergy} Energy.`);
      showToast(`Bitter brew: ${reason}! +${storeEnergy} Energy`, "warning");
    }
    if (storeNerve > 0) {
      gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + storeNerve);
      addLog("Consumable Fail (Bitter Pill)", `Swallow failed: ${reason}. Gained base +${storeNerve} Nerve.`);
      showToast(`Bitter pill: ${reason}! +${storeNerve} Nerve Focus`, "warning");
    }
    saveGame();
    renderDeveloperStore();
    updateUI();
    return;
  }

  if (isGig) {
    finishGig(gigId, false);
    return;
  }

  if (isTraining) {
    let skillLabel = type === 'code' ? "Coding" : (type === 'design' ? "Design" : "Management");
    addLog("Training Workout Failed!", `Reason: ${reason}. Gained 0 points in ${skillLabel}.`);
    showToast(`Training Failed: ${reason}`, "error");
    saveGame();
    renderTrainingGym();
    updateUI();
    return;
  }

  if (gameState.current_project) {
    gameState.current_project.miniGamesPlayed = (gameState.current_project.miniGamesPlayed || 0) + 1;
    gameState.current_project.miniGamesLost = (gameState.current_project.miniGamesLost || 0) + 1;
  }

  if (!isTraining && !isGig && !isStore) {
    miniGameCombo = 0;
    updateHudCombo(0);
  }

  if (type === 'code') {
    gameState.current_project.bug_points += 2;
    addLog("Syntax Striker Failure!", `Reason: ${reason}. Compiler error introduced +2 Bugs.`);
    showToast(`Compilation failed: +2 Bugs`, "error");
  } else if (type === 'design') {
    addLog("Color Matcher Failure!", `Reason: ${reason}. Poor color palette selected.`);
    showToast(`Design failed! No points gained`, "error");
  } else if (type === 'polish') {
    gameState.current_project.bug_points += 3;
    addLog("Bug Squasher Failure!", `Reason: ${reason}. Memory leak introduced +3 Bugs.`);
    showToast(`Squash failed: +3 Bugs`, "error");
  }

  if (gameState.current_project && !isTraining && !isGig && !isStore) {
    ensureProjectMeta(gameState.current_project);
    gameState.current_project.techDebt = (gameState.current_project.techDebt || 0) + 2;
    if (Math.random() < 0.4) {
      pushDevDiary(gameState.current_project, getDevPhaseId(getProjectProgressPercent(gameState.current_project)), `Sprint failed: ${reason}. Tech debt now haunts stand-up meetings.`);
    }
  }

  saveGame();
  renderProjectProgress();
  updateUI();
}

function runDevSprintAction(actionId) {
  if (!gameState.current_project || gameState.current_project.phase === "post_release" || activeMiniGame) return;
  const proj = ensureProjectMeta(gameState.current_project);
  const target = getTargetPointsForScale(proj.scale);

  if (actionId === "crunch") {
    if (gameState.nerve < 3) { showToast("Need 3 Nerve to crunch!", "error"); return; }
    gameState.nerve -= 3;
    const boost = Math.ceil(target * 0.12);
    proj.tech_points += boost;
    proj.design_points += Math.ceil(boost * 0.6);
    proj.bug_points += 3;
    proj.techDebt += 2;
    proj.hypeMeter = Math.min(100, proj.hypeMeter + 4);
    pushDevDiary(proj, getDevPhaseId(getProjectProgressPercent(proj)), "Crunch weekend declared. Pizza budget exceeded. Morale file not found.");
    addLog("Crunch Sprint", `+${boost} tech, +bugs. Nerve spent. HR has left the chat.`);
    showToast(`Crunch mode! +${boost} points, +3 bugs`, "warning");
  } else if (actionId === "refactor") {
    if (gameState.cash < 200) { showToast("Refactor costs $200!", "error"); return; }
    gameState.cash -= 200;
    proj.bug_points = Math.max(0, proj.bug_points - 5);
    proj.techDebt = Math.max(0, proj.techDebt - 4);
    pushDevDiary(proj, getDevPhaseId(getProjectProgressPercent(proj)), "Paid down tech debt. Senior dev called it 'a weekend of deleting comments'.");
    addLog("Refactor Pass", "Spent $200. -5 bugs, -4 tech debt.");
    showToast("Refactor complete! Bugs and debt reduced.", "success");
  } else if (actionId === "playtest") {
    if (gameState.energy < 8) { showToast("Playtest needs 8 Energy!", "error"); return; }
    gameState.energy -= 8;
    proj.playtestsRun += 1;
    const feedback = [
      "Tester fell through the floor. Called it 'immersive verticality'.",
      "Tutorial took 45 minutes. Tester aged visibly.",
      "UI praised. Gameplay described as 'present'.",
      "One tester speedran the menu. New meta?"
    ];
    const note = feedback[Math.floor(Math.random() * feedback.length)];
    proj.design_points += Math.ceil(target * 0.06);
    if (Math.random() < 0.4) proj.bug_points = Math.max(0, proj.bug_points - 2);
    pushDevDiary(proj, getDevPhaseId(getProjectProgressPercent(proj)), `Playtest #${proj.playtestsRun}: ${note}`);
    addLog("Playtest Session", note);
    showToast("Playtest done! Design up.", "info");
  } else if (actionId === "scope_creep") {
    if (gameState.cash < 100) { showToast("Scope creep costs $100!", "error"); return; }
    gameState.cash -= 100;
    proj.scopeFeatures += 1;
    proj.hypeMeter = Math.min(100, proj.hypeMeter + 12);
    const features = ["battle royale mode", "NFT horse armor", "procedural eyebrows", "live-service battle pass", "roguelike fishing minigame"];
    const feat = features[Math.floor(Math.random() * features.length)];
    pushDevDiary(proj, getDevPhaseId(getProjectProgressPercent(proj)), `Added ${feat}. Scope expanded. Deadline remains a suggestion.`);
    addLog("Scope Creep", `Added '${feat}'. Hype +12. Completion bar now harder (more points needed).`);
    showToast(`Scope creep: ${feat}! Hype rising.`, "warning");
  } else if (actionId === "focus_group") {
    if (gameState.cash < 350 || gameState.xp < 10) { showToast("Focus group: $350 + 10 XP!", "error"); return; }
    gameState.cash -= 350;
    gameState.xp -= 10;
    proj.focusGroupBonus = Math.min(0.5, proj.focusGroupBonus + 0.15);
    const synergy = getSynergyInfo(proj.genre, proj.topic);
    pushDevDiary(proj, getDevPhaseId(getProjectProgressPercent(proj)), `Focus group loved the ${synergy.label} pitch. Marketing cried happy tears.`);
    addLog("Focus Group", `Synergy validated (${synergy.label}). Release rating bonus increased.`);
    showToast("Focus group approved the vibe!", "success");
  } else if (actionId === "asset_store") {
    if (gameState.cash < 75) { showToast("Asset pack costs $75!", "error"); return; }
    gameState.cash -= 75;
    proj.design_points += Math.ceil(target * 0.08);
    pushDevDiary(proj, getDevPhaseId(getProjectProgressPercent(proj)), "Bought generic asset pack. Every tree looks like the same tree. Efficiency.");
    addLog("Asset Store", "Bought stock assets. +Design points.");
    showToast("Assets imported! Design boosted.", "success");
  }

  checkDevMilestones(proj);
  proj.devPhase = getDevPhaseId(getProjectProgressPercent(proj));
  saveGame();
  renderProjectProgress();
  updateUI();
}

function renderProjectProgress() {
  const devPanel = document.getElementById("develop-panel-content");
  if (!devPanel || !gameState.current_project) return;

  const proj = gameState.current_project;
  const target = getTargetPointsForScale(proj.scale);
  const progressPercent = getProjectProgressPercent(proj);
  const readyToShip = canReleaseProject(proj);
  const energyCost = getDevEnergyCost();

  // Mini-game conditional rendering
  if (activeMiniGame) {
    let gameHtml = "";
    if (activeMiniGame.type === 'code') {
      gameHtml = `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--color-cyan); padding: 20px; border-radius: 12px; margin-top: 15px;">
          <h4 style="color:var(--color-cyan); margin-bottom: 8px;">⌨️ Coding Mini-game: Syntax Striker</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:12px;">Type the following code snippet exactly as shown within the time limit:</p>
          
          <div style="background:#060608; border:1px solid rgba(255,255,255,0.1); padding:12px; border-radius:8px; font-family:monospace; font-size:1rem; color:#ffd700; text-align:center; margin-bottom:12px; letter-spacing:0.5px; user-select:none;">
            ${activeMiniGame.target}
          </div>

          <input type="text" id="minigame-code-input" autocomplete="off" placeholder="Type it here..." style="width:100%; padding:12px; background:rgba(0,0,0,0.6); border:1px solid var(--border-glass); border-radius:8px; color:#fff; font-family:monospace; font-size:1rem; margin-bottom:12px;" oninput="submitCodeInput()">
          
          <div class="status-bar-track" style="height:6px; margin-bottom:12px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width:100%; height:100%; background:var(--color-cyan);"></div>
          </div>
          
          <button class="btn-secondary" style="width:100%; border-color:rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">Cancel Mini-game</button>
        </div>
      `;
    } else if (activeMiniGame.type === 'design') {
      gameHtml = `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid var(--color-purple); padding: 20px; border-radius: 12px; margin-top: 15px;">
          <h4 style="color:var(--color-purple); margin-bottom: 8px;">🎨 Design Mini-game: Color Matcher</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:12px;">Stroop Effect! Click the button that matches the target color name:</p>
          
          <div style="font-size:1.6rem; font-weight:800; text-align:center; margin-bottom:15px; letter-spacing:1px; color: ${getRandomColorHex()};">
            ${activeMiniGame.targetColor.name}
          </div>

          <div style="display:flex; gap:10px; margin-bottom:15px;">
            ${activeMiniGame.buttons.map(btn => {
        return `<button class="btn-primary" style="flex:1; background:${btn.hex}; border-color:${btn.hex}; color:#000;" onclick="selectDesignColor('${btn.name}')">${btn.name}</button>`;
      }).join("")}
          </div>

          <div class="status-bar-track" style="height:6px; margin-bottom:12px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width:100%; height:100%; background:var(--color-purple);"></div>
          </div>
          
          <button class="btn-secondary" style="width:100%; border-color:rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">Cancel Mini-game</button>
        </div>
      `;
    } else if (activeMiniGame.type === 'polish') {
      const buttons = [0, 1, 2, 3];
      gameHtml = `
        <div style="background: rgba(0,0,0,0.4); border: 1px solid #ffd700; padding: 20px; border-radius: 12px; margin-top: 15px;">
          <h4 style="color:#ffd700; margin-bottom: 8px;">🐛 Polish Mini-game: Bug Squasher</h4>
          <p style="font-size:0.85rem; color:var(--color-text-muted); margin-bottom:12px;">One cell hides the bug. The others are lying.</p>
          
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; margin-bottom:15px;">
            ${buttons.map(i => {
        return `<button class="btn-secondary" style="padding:16px; font-size:1.2rem; font-weight:bold;" onclick="clickBugButton(${i})">❓</button>`;
      }).join("")}
          </div>

          <div class="status-bar-track" style="height:6px; margin-bottom:12px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width:100%; height:100%; background:#ffd700;"></div>
          </div>
          
          <button class="btn-secondary" style="width:100%; border-color:rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">Cancel Mini-game</button>
        </div>
      `;
    }

    devPanel.innerHTML = `
      <div class="develop-progress-card">
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <h3 style="font-size:1.1rem; color:var(--color-cyan);">${proj.name}</h3>
          <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--color-text-muted);">${proj.scale} Project</span>
        </div>
        ${gameHtml}
      </div>
    `;

    if (activeMiniGame.type === 'code') {
      setTimeout(() => {
        const input = document.getElementById("minigame-code-input");
        if (input) input.focus();
      }, 50);
    }
    return;
  }

  ensureProjectMeta(proj);
  const synergy = getSynergyInfo(proj.genre, proj.topic);
  const staff = getStaffDevContribution();
  const phaseId = getDevPhaseId(progressPercent);
  proj.devPhase = phaseId;
  const milestoneHtml = DEV_MILESTONES.map(ms => {
    const hit = (proj.milestonesHit || []).includes(ms);
    return `<span class="dev-milestone ${hit ? "hit" : ""}">${hit ? "✓" : "○"} ${ms}%</span>`;
  }).join("");

  const diaryHtml = (proj.devDiary || []).slice(0, 5).map(d => `
    <div class="dev-diary-entry"><span class="dev-diary-time">[${d.time}]</span> <span class="dev-diary-phase">${d.phase}</span> — ${d.text}</div>
  `).join("") || `<div class="dev-diary-entry" style="font-style:italic; opacity:0.6;">No diary entries yet. Make questionable decisions to generate lore.</div>`;

  devPanel.innerHTML = `
    <div class="develop-progress-card">
      <div class="dev-board-header">
        <div>
          <h3 class="dev-board-title">${proj.name}</h3>
          <span class="dev-board-subtitle">${proj.scale} · ${proj.genre}/${proj.topic} · ${PLATFORMS[proj.platform].name}</span>
        </div>
        <div class="dev-synergy-badge" style="border-color:${synergy.color}; color:${synergy.color};">${synergy.label}</div>
      </div>

      ${renderDevPhasePipeline(progressPercent)}

      <div class="dev-stats-grid">
        <div class="dev-stat-card"><span>Tech</span><strong style="color:var(--color-cyan)">${Math.floor(proj.tech_points)}</strong></div>
        <div class="dev-stat-card"><span>Design</span><strong style="color:var(--color-purple)">${Math.floor(proj.design_points)}</strong></div>
        <div class="dev-stat-card"><span>Bugs</span><strong style="color:#ff1744">${Math.floor(proj.bug_points)}</strong></div>
        <div class="dev-stat-card"><span>Tech Debt</span><strong style="color:#ff9100">${proj.techDebt}</strong></div>
        <div class="dev-stat-card"><span>Hype</span><strong style="color:#ffd700">${proj.hypeMeter}%</strong></div>
        <div class="dev-stat-card"><span>Scope+</span><strong>${proj.scopeFeatures}</strong></div>
      </div>

      <div class="status-bar-container">
        <div class="status-bar-header"><span>Completion (${phaseId})</span><span>${Math.floor(progressPercent)}%</span></div>
        <div class="status-bar-track">
          <div class="status-bar-fill" style="width:${progressPercent}%; height:100%; background:linear-gradient(90deg, var(--color-cyan), var(--color-purple));"></div>
        </div>
      </div>

      <div class="dev-milestone-row">${milestoneHtml}</div>

      <div class="dev-board-grid" style="margin-top:4px;">
        <div>
          <h4 class="dev-section-label">⚡ Dev Sprints (Mini-games)</h4>
          <p class="dev-section-hint">${energyCost} energy per sprint · Ship at 90% with ≤8 bugs</p>
          <div class="dev-sprint-row">
            <button class="btn-primary dev-sprint-btn" onclick="startMiniGame('code')">⌨️ Code</button>
            <button class="btn-primary dev-sprint-btn" onclick="startMiniGame('design')">🎨 Design</button>
            <button class="btn-primary dev-sprint-btn" onclick="startMiniGame('polish')">🔧 Polish</button>
          </div>

          <h4 class="dev-section-label" style="margin-top:14px;">🛠️ Production Actions</h4>
          <div class="dev-action-grid">
            <button class="btn-secondary dev-action-btn" onclick="runDevSprintAction('crunch')">Crunch Weekend<br><small>-3 🎯 nerve</small></button>
            <button class="btn-secondary dev-action-btn" onclick="runDevSprintAction('refactor')">Refactor Pass<br><small>-$200</small></button>
            <button class="btn-secondary dev-action-btn" onclick="runDevSprintAction('playtest')">Playtest<br><small>-8 ⚡</small></button>
            <button class="btn-secondary dev-action-btn" onclick="runDevSprintAction('scope_creep')">Scope Creep<br><small>-$100</small></button>
            <button class="btn-secondary dev-action-btn" onclick="runDevSprintAction('focus_group')">Focus Group<br><small>-$350 · -10 XP</small></button>
            <button class="btn-secondary dev-action-btn" onclick="runDevSprintAction('asset_store')">Asset Store<br><small>-$75</small></button>
          </div>

          <div class="dev-ship-row">
            <button class="btn-primary dev-ship-btn" ${readyToShip ? "" : "disabled"} onclick="releaseGameProject()">
              ${readyToShip ? "🚀 Ship It (Lawyers Pre-Approved)" : `🔒 ${Math.floor(progressPercent)}% · ${proj.bug_points || 0} bugs`}
            </button>
            <button class="btn-secondary nuke-btn" onclick="nukeGameProject()">💥 Nuke</button>
          </div>
        </div>

        <div class="dev-board-sidebar">
          <h4 class="dev-section-label">📓 Dev Diary</h4>
          <div class="dev-diary-feed">${diaryHtml}</div>
          <h4 class="dev-section-label" style="margin-top:12px;">👥 Staff / Tick</h4>
          <p class="dev-section-hint" style="margin-bottom:6px;">
            Each second staff adds ~${staff.tech.toFixed(1)} tech, ~${staff.design.toFixed(1)} design
            ${staff.bugFix < 0 ? `, fixes ~${Math.abs(staff.bugFix).toFixed(1)} bugs` : ""} while this project is active.
          </p>
          <p class="dev-section-hint">Sprints won: ${proj.miniGamesWon || 0}/${proj.miniGamesPlayed || 0} · Playtests: ${proj.playtestsRun || 0}</p>
        </div>
      </div>
    </div>
  `;
}

function releaseGameProject() {
  if (!gameState.current_project) return;
  const proj = gameState.current_project;

  if (!canReleaseProject(proj)) {
    showToast(`Can't ship yet — need 90% progress and ≤8 bugs (current: ${Math.floor(getProjectProgressPercent(proj))}%, ${proj.bug_points || 0} bugs). Industry standard!`, "error");
    return;
  }

  // Compute rating out of 10.0
  const target = getTargetPointsForScale(proj.scale);

  // Topic/Genre compatibility multiplier
  const synergyKey = `${proj.genre}-${proj.topic}`;
  const synergyMult = SYNERGIES[synergyKey] || 0.85; // Penalty for bad matches!

  const techRatio = Math.min(1.5, proj.tech_points / target);
  const designRatio = Math.min(1.5, proj.design_points / target);

  // Compute rating out of 10.0 based on mini-game performance success rate
  const successRate = proj.miniGamesPlayed > 0 ? (proj.miniGamesWon / proj.miniGamesPlayed) : 1.0;

  // Bug penalty calculation
  const bugPenalty = Math.max(0, Math.min(3.0, (proj.bug_points || 0) * 0.15));

  // Base rating capped around 6.5 for early perfect plays, scaled by platform/topic synergy
  let rating = (techRatio * 3.25 + designRatio * 3.25) * synergyMult * successRate - bugPenalty;
  
  // Critic random variance adds dynamic randomness
  const criticNoise = Math.random() * 2.0 - 1.5; // range [-1.5, +0.5]
  rating += criticNoise;

  if (gameState.researched_multiplayer) {
    rating += 1.0;
  }
  ensureProjectMeta(proj);
  rating += (proj.hypeMeter || 0) * 0.008;
  rating += proj.focusGroupBonus || 0;
  if ((proj.scopeFeatures || 0) > 2) rating -= 0.3;
  rating = Math.max(1.0, Math.min(10.0, rating));

  // Determine copies sold and price based on platform, scale, and rating
  let price = 4.99;
  let baseSales = 60; // Small project baseline
  if (proj.scale === "Medium") { price = 14.99; baseSales = 250; }
  if (proj.scale === "Large") { price = 29.99; baseSales = 800; }
  if (proj.scale === "AAA") { price = 49.99; baseSales = 2500; }

  // Platform multipliers
  const reviewers = [
    { name: "IGNion", comments: [
      "Worse than formatting a hard drive. It made our lead reviewer cry in binary, drop his laptop in the fish tank, and question why he spent four years in journalism school. The frame rate is so wobbly it feels like a slide presentation running on a digital smart kettle. Truly a landmark of digital despair.",
      "Too much water, too much air, too many files, and not nearly enough gameplay. The character movement is wobbly, and clipping through a brick wall into the void is a common occurrence. Ironically, adjusting the character's sock design was the most fluid part of the entire code stack. A solid distraction.",
      "A solid average. It exists. It consumes electricity. It does not actively melt your GPU, but it will make you ponder if there are better ways to spend a Saturday evening, like reading the documentation of a deprecated library. We didn't fall asleep, but we did think about coffee a lot.",
      "Extremely good! We only encountered 12 fatal segmentation faults during our initial play session, which is a massive upgrade from this studio's previous wobbly prototypes. The visual styling has some nice border-radius curves that really showcase the ChatGPT developer's prompt engineering skills.",
      "An absolute masterpiece! It cured our lead writer's coffee addiction by replacing caffeine with raw digital hype. The synergies are incredible, the microtransactions are beautifully integrated into the pause screen, and the main menu music is so premium we are nominating it for a Grammy!"
    ] },
    { name: "GameSpotter", comments: [
      "This isn't a game; it's a digital crime scene. Our testing suite started whispering 'please stop compiling me' after two minutes. The code comments are likely just a chain of wobbly cries for help. We recommend restoring the repository to an empty git commit and starting over in a different industry.",
      "A wobbly, mediocre experience. Like drinking cold decaf coffee at 2 AM while trying to find a missing semicolon in a 50,000-line spaghetti codebase. It technically launches, it has a menu, and the buttons do things, but the vibe is one of deep corporate fatigue and minimal testing.",
      "A fun weekend distraction, provided you don't mind clipping through the floor, falling into a digital void, and having your character custom socks launch into orbit. The physics engine feels like it was coded by a smart toaster, which gives it a charming, chaotic atmosphere.",
      "Incredibly innovative mechanics! We spent four consecutive hours customizing the micro-threads on the developer's ergonomic chairs instead of completing the tutorial. The design is harmonic, the visual templates are sleek, and it is clear the designers spent a lot of time ignoring the programmers.",
      "It completely redefined the genre of software. We are currently writing a 50-page philosophical essay on why the wobbly loading screen is a metaphor for developer crunch-time. The netcode is spaghetti, but it lags so beautifully that PvP encounters feel like a post-modern art gallery."
    ] },
    { name: "Metacritic rating", comments: [
      "0/10 would not compile again. The code comments are probably just links to therapist directories and coffee machine manuals. Playing this game is like trying to center a wobbly CSS div on a mobile layout while your house is actively on fire. A total disaster of software engineering.",
      "Not great, not terrible. It feels like a project made by a tired junior developer who copy-pasted StackOverflow snippets at 4:30 PM on a Friday before a major launch. It works, but you can feel the desperation in every wobbly frame. It needs a major refactoring pass.",
      "Good vibes! The UI uses some actual border-radius styling instead of raw neon rectangles, which is a nice touch. The gameplay is wobbly, but it is clear the developers tried their best under severe coffee shortages and parent lease agreements.",
      "Very impressive UI! The design matches target color resonances and the CSS transitions are remarkably smooth. It is clear that the ChatGPT prompter spent a lot of time refining their design prompts. A highly polished package that we recommend to interface designers.",
      "A masterclass of modern engineering that should be preserved in a museum of clean architecture. The algorithms are optimized, the design synergy is flawless, and the gameplay is so immersive we forgot we were supposed to be reviewing it. Bravo to the garage developers!"
    ] }
  ];

  const pMult = PLATFORMS[proj.platform].marketSize;

  // Rating curve (exponential bonus for excellent ratings)
  const ratingMult = Math.pow(rating / 7.0, 3.5);

  const initialSalesRate = Math.ceil(baseSales * pMult * ratingMult);

  let commentIndex = 0;
  if (rating < 3.0) commentIndex = 0;
  else if (rating >= 3.0 && rating < 5.5) commentIndex = 1;
  else if (rating >= 5.5 && rating < 7.5) commentIndex = 2;
  else if (rating >= 7.5 && rating < 9.0) commentIndex = 3;
  else commentIndex = 4;

  addLog("--- CRITIC REVIEWS ---", `'${proj.name}' was graded.`);
  reviewers.forEach(rev => {
    addLog(rev.name, `"${rev.comments[commentIndex]}" (Rating: ${(rating + (Math.random() * 0.8 - 0.4)).toFixed(1)}/10)`);
  });

  // Save to active lists
  let cap = 300; // default Small project cap
  if (proj.scale === "Medium") cap = 1500;
  else if (proj.scale === "Large") cap = 6000;
  else if (proj.scale === "AAA") cap = 20000;

  const gameNum = gameState.games_released;

  const releasedGame = {
    name: proj.name,
    genre: proj.genre,
    topic: proj.topic,
    scale: proj.scale,
    price,
    rating,
    initialSalesRate,
    totalSold: 0,
    totalRevenue: 0,
    age: 0,
    revenueCap: cap
  };

  gameState.active_games.push(releasedGame);
  if (!Array.isArray(gameState.portfolio)) gameState.portfolio = [];
  gameState.portfolio.push({ ...releasedGame });
  gameState.games_released += 1;

  // XP Gains
  let baseXP = 20;
  if (proj.scale === "Medium") baseXP = 45;
  else if (proj.scale === "Large") baseXP = 100;
  else if (proj.scale === "AAA") baseXP = 250;

  let bonusXP = 0;
  if (gameNum === 0) bonusXP = 80;
  else if (gameNum === 1) bonusXP = 120;
  else if (gameNum === 2) bonusXP = 150;

  const totalXPGained = baseXP + bonusXP;

  const releaseQuips = [
    "Metacritic is already composing a passive-aggressive tweet.",
    "Day-one patch scheduled for approximately 37 seconds from now.",
    "Investors describe this as 'aggressive shipping with defensive bug posture'.",
    "Your mom just asked if this will finally make you move out."
  ];
  const quip = releaseQuips[Math.floor(Math.random() * releaseQuips.length)];
  ensureStudioMeta();
  gameState.studioReputation = Math.min(100, gameState.studioReputation + Math.round(rating));
  gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 15);
  gameState.studioMorale = Math.min(100, gameState.studioMorale + 10);
  pushStudioDiary(`Shipped '${proj.name}' at ${rating.toFixed(1)}/10. Champagne flat; dreams fizzy.`);
  if (gameState.games_released === 1 && !gameState.studioAwards.includes("First Ship")) {
    gameState.studioAwards.push("First Ship");
  }
  if (rating >= 8.5 && !gameState.studioAwards.includes("Critical Darling")) {
    gameState.studioAwards.push("Critical Darling");
  }
  if (gameState.games_released >= 5 && !gameState.studioAwards.includes("Serial Shipper")) {
    gameState.studioAwards.push("Serial Shipper");
  }

  addLog("Game Released!", `'${proj.name}' hit the shelves! Max revenue cap: $${cap.toLocaleString()}. +${totalXPGained} XP. ${quip}`);
  showToast(`🚀 Shipped '${proj.name}' at ${rating.toFixed(1)}/10! ${quip}`, "success");

  miniGameCombo = 0;
  updateHudCombo(0);
  triggerScreenFlash(0, 229, 255);
  
  gainXP(totalXPGained);

  // Move project to post-release reviews and patch board phase
  proj.phase = "post_release";
  proj.rating = rating;
  proj.price = price;
  proj.initialSalesRate = initialSalesRate;
  proj.reviewers = reviewers;
  proj.commentIndex = commentIndex;
  proj.applesCollected = 0;
  proj.patchCompleted = false;
  proj.appleIndex = Math.floor(Math.random() * 16);
  proj.legacyScore = Math.round(rating * 10 + (proj.hypeMeter || 0) * 0.2);
  initPostReleaseState(proj);

  saveGame();
  renderDevelopPanel();
  updateUI();
  
  // Play triumphant release fanfare
  ChiptuneAudio.playSFX("release");
  
  // Show reviews modal overlay popup
  showReviewModal(proj.name, proj.genre, proj.topic, rating, reviewers, commentIndex);
}

// --- Leaderboard Loader ---
async function loadLeaderboard() {
  const container = document.getElementById("leaderboard-tbody");
  if (!container) return;

  container.innerHTML = `<tr><td colspan="4" style="text-align:center; padding:24px 0; color:var(--color-text-muted); font-style:italic;">Querying global database indices...</td></tr>`;

  try {
    const list = await TycoonAPI.getLeaderboards();
    if (list.length === 0) {
      const localUsername = localStorage.getItem("tycoon_active_username") || "Guest Dev";
      const simulated = [
        { username: localUsername, company_name: gameState.company_name, color: userColor, net_worth: gameState.net_worth, games_released: gameState.games_released, office_tier: gameState.office_tier },
        { username: "CodeMaster99", company_name: "Byte Studios", color: "#d500f9", metalness: 0.9, net_worth: 15000.00, games_released: 8, office_tier: "IndieStudio" },
        { username: "IndieGamerX", company_name: "Solo Garage", color: "#ffd700", net_worth: 3500.00, games_released: 3, office_tier: "CoWorking" },
        { username: "NerveBreaker", company_name: "Torn Games LLC", color: "#ff1744", net_worth: 89000.00, games_released: 14, office_tier: "MegaCampus" }
      ];

      if (!simulated.find(s => s.username === localUsername)) {
        simulated.push({ username: localUsername, company_name: gameState.company_name, color: userColor, net_worth: gameState.net_worth, games_released: gameState.games_released, office_tier: gameState.office_tier });
      }

      simulated.sort((a, b) => b.net_worth - a.net_worth);
      window.leaderboardCache = simulated;
      renderLeaderboardRows(container, simulated);
      return;
    }

    window.leaderboardCache = list;
    renderLeaderboardRows(container, list);
  } catch (err) {
    container.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#ff1744; padding:24px 0;">Failed to fetch leaderboards. Offline.</td></tr>`;
  }
}

function renderLeaderboardRows(container, list) {
  const localUsername = localStorage.getItem("tycoon_active_username") || "Guest Dev";

  container.innerHTML = list.map((subject, index) => {
    const isPlayer = subject.username.toLowerCase() === localUsername.toLowerCase();
    return `
      <tr class="${isPlayer ? "highlight" : ""}" style="${!isPlayer ? `border-left: 3px solid ${subject.color};` : ""}">
        <td>#${index + 1}</td>
        <td>
          <span style="font-weight:bold; color:${subject.color};">${subject.username}</span><br>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">${subject.company_name}</span>
        </td>
        <td>${subject.office_tier} (${subject.games_released} games)</td>
        <td style="font-weight:bold; text-align:right;">$${parseFloat(subject.net_worth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join("");
}

// --- Consumables Store & Item Usage ---
function buyItem(itemType) {
  let cost = 0;
  let energyGain = 0;
  let nerveGain = 0;
  let label = "";

  if (itemType === "energy_drink") {
    cost = 50;
    energyGain = 25;
    label = "Java Bolt Energy Drink";
  } else if (itemType === "coffee") {
    cost = 20;
    energyGain = 10;
    label = "Espresso Shot Coffee";
  } else if (itemType === "nootropic") {
    cost = 100;
    nerveGain = 5;
    label = "Focus Nootropic Pill";
  }

  if (gameState.cash < cost) {
    showToast(`Insufficient cash reserves! Required: $${cost}`, "error");
    return;
  }

  if (!confirm(`Are you sure you want to purchase and consume ${label} for $${cost}?`)) {
    return;
  }

  gameState.cash -= cost;

  // Start pouring mini-game!
  activeMiniGame = {
    type: "pour",
    isStore: true,
    itemId: itemType,
    cost: cost,
    energyGain: energyGain,
    nerveGain: nerveGain,
    duration: 6000,
    elapsed: 0,
    pointerPosition: 0,
    pointerDirection: 1,
    pointerSpeed: 5,
    greenZoneStart: 38,
    greenZoneEnd: 62
  };

  activateMiniGameTimer();
  renderDeveloperStore();
  updateUI();
}

// --- Active Game Marketing Campaigns ---
function runMarketing(gameIndex, campaignType) {
  if (gameIndex < 0 || gameIndex >= gameState.active_games.length) return;
  const game = gameState.active_games[gameIndex];

  let cost = 0;
  let multiplier = 1.0;
  let ageReduction = 0;
  let label = "";
  let xpCost = 5;

  if (campaignType === "social") {
    cost = 200;
    multiplier = 1.25;
    ageReduction = 30;
    label = "Social Media Hype";
    xpCost = 5;
  } else if (campaignType === "pr") {
    cost = 800;
    multiplier = 1.60;
    ageReduction = 80;
    label = "PR Blitz Campaign";
    xpCost = 15;
  } else if (campaignType === "steam") {
    cost = 400;
    multiplier = 1.40;
    ageReduction = 50;
    label = "Steam Featured Slot";
    xpCost = 12;
  } else if (campaignType === "influencer") {
    cost = 350;
    multiplier = 1.35;
    ageReduction = 40;
    label = "Influencer Sponsorship";
    xpCost = 10;
  }

  if (gameState.cash < cost) {
    showToast(`Insufficient funds! Marketing requires $${cost}`, "error");
    return;
  }

  if (gameState.xp < xpCost) {
    showToast(`Insufficient XP! Marketing campaign requires ${xpCost} XP.`, "error");
    return;
  }

  if (!confirm(`Are you sure you want to launch ${label} for '${game.name}'? Costs $${cost} and ${xpCost} XP.`)) {
    return;
  }

  gameState.cash -= cost;
  gameState.xp -= xpCost;
  game.initialSalesRate = Math.ceil(game.initialSalesRate * multiplier);
  game.age = Math.max(0, game.age - ageReduction);

  // Sync to portfolio
  if (!Array.isArray(gameState.portfolio)) gameState.portfolio = [];
  const portItem = gameState.portfolio.find(p => p.name === game.name);
  if (portItem) {
    portItem.initialSalesRate = game.initialSalesRate;
  }

  ensureStudioMeta();
  gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 5);
  pushStudioDiary(`Marketing push for '${game.name}' via ${label}. Buzz accumulates like technical debt.`);

  addLog("Marketing Campaign Launched", `Promoted '${game.name}' via ${label} for $${cost}. Sales rate boosted by +${Math.round((multiplier - 1) * 100)}% and shelf life extended.`);
  showToast(`Launched ${label}! Sales boosted`, "success");

  saveGame();
  renderStudioDashboard();
  updateUI();
}

// --- Research Laboratory Upgrades ---
function renderResearchLab() {
  const container = document.getElementById("research-upgrades-list");
  if (!container) return;

  const upgrades = [
    {
      id: "unlocked_console",
      name: "Spinning Green Cube™ (Graphics Engine)",
      cost: 50,
      desc: "Research a revolutionary technology that renders a single, flat, spinning green cube on screen at 24 FPS. Claim to the press that this represents a '120 FPS ray-traced next-generation graphics engine'. Unlocks target compatibility for console platforms. Warn your hardware provider about smoke hazards.",
      owned: !!gameState.unlocked_console
    },
    {
      id: "researched_multiplayer",
      name: "Peer-to-Peer Spaghetti Netcode",
      cost: 100,
      desc: "Implement a chaotic networking system that links players together via wobbly, unencrypted peer-to-peer UDP sockets. Includes no latency compensation, so characters will teleport through walls. Critics will rate it +1.0 point higher anyway because 'everything is better with friends'.",
      owned: !!gameState.researched_multiplayer
    },
    {
      id: "ai_behavior",
      name: "ChatGPT Copy-Paster v0.1",
      cost: 150,
      desc: "Integrate a custom script that automatically scrapes developer forums and copy-pastes solutions into your main codebase. Increases the duration of the Syntax Striker coding mini-game from 15 seconds to 25 seconds, giving you ample time to read through forum complaints and pretend you understand memory leaks.",
      owned: !!gameState.ai_behavior
    }
  ];

  container.innerHTML = upgrades.map(upg => {
    const canAfford = gameState.research_points >= upg.cost;
    return `
      <div class="card-item" style="${upg.owned ? "border-color:var(--color-cyan);" : ""}">
        <div class="card-item-title">
          <span>${upg.name}</span>
          <span style="color:var(--color-cyan);">${upg.owned ? "Researched" : `${upg.cost} RP`}</span>
        </div>
        <div class="card-item-desc">
          ${upg.desc}
        </div>
        <button class="btn-primary" ${upg.owned || !canAfford ? "disabled" : ""} onclick="buyResearch('${upg.id}')">
          ${upg.owned ? "Researched" : "Buy Research"}
        </button>
      </div>
    `;
  }).join("");
}

function buyResearch(upgradeId) {
  const upgrades = {
    unlocked_console: 50,
    researched_multiplayer: 100,
    ai_behavior: 150
  };

  const cost = upgrades[upgradeId];
  if (cost === undefined) return;

  if (gameState.research_points < cost) {
    showToast("Not enough Research Points!", "error");
    return;
  }

  const upgradeLabel = upgradeId.replace("unlocked_", "").replace("researched_", "").replace("_", " ").toUpperCase();
  if (!confirm(`Are you sure you want to purchase research upgrade for ${upgradeLabel}? Costs ${cost} Research Points.`)) {
    return;
  }

  gameState.research_points -= cost;
  gameState[upgradeId] = true;

  addLog("Research Completed", `Researched upgrade: ${upgradeLabel}.`);
  showToast("Research Upgrade unlocked!", "success");

  saveGame();
  renderResearchLab();
  updateUI();
}

function showReviewModal(name, genre, topic, overallRating, reviewers, commentIndex) {
  const modal = document.getElementById("review-modal");
  const titleEl = document.getElementById("review-game-title");
  const metaEl = document.getElementById("review-game-meta");
  const container = document.getElementById("reviewers-cards-container");
  
  if (!modal || !titleEl || !metaEl || !container) return;

  titleEl.innerText = name;
  metaEl.innerText = `${genre} / ${topic} | Metacritic Rating: ${overallRating.toFixed(1)}/10`;

  container.innerHTML = reviewers.map(rev => {
    // Generate an individual score slightly varied from overall rating
    const individualScore = Math.max(1.0, Math.min(10.0, overallRating + (Math.random() * 0.8 - 0.4)));
    
    // Choose color theme based on score
    let badgeColor = "var(--color-cyan)";
    let badgeBg = "rgba(0, 229, 255, 0.1)";
    if (individualScore >= 8.0) {
      badgeColor = "#39ff14";
      badgeBg = "rgba(57, 255, 20, 0.1)";
    } else if (individualScore < 5.0) {
      badgeColor = "#ff1744";
      badgeBg = "rgba(255, 23, 68, 0.1)";
    } else {
      badgeColor = "#ffd700";
      badgeBg = "rgba(255, 215, 0, 0.1)";
    }

    // Custom text name colors
    let revNameColor = "#fff";
    if (rev.name === "IGNion") revNameColor = "#ff1744";
    else if (rev.name === "GameSpotter") revNameColor = "#ffd700";
    else if (rev.name === "Metacritic rating" || rev.name === "Metacritic") revNameColor = "#39ff14";

    const displayRevName = rev.name === "Metacritic rating" ? "Metacritic" : rev.name;

    return `
      <div class="reviewer-card">
        <div class="reviewer-info">
          <div class="reviewer-name" style="color: ${revNameColor};">${displayRevName}</div>
          <div class="reviewer-comment">"${rev.comments[commentIndex]}"</div>
        </div>
        <div class="reviewer-score-badge" style="border-color: ${badgeColor}; color: ${badgeColor}; background: ${badgeBg}; box-shadow: 0 0 10px ${badgeBg};">
          ${individualScore.toFixed(1)}
        </div>
      </div>
    `;
  }).join("");

  modal.style.display = "flex";
}

function closeReviewModal() {
  const modal = document.getElementById("review-modal");
  if (modal) {
    modal.style.display = "none";
  }
}

function runActivity(activityType) {
  let cost = 0;
  let energyGain = 0;
  let researchGain = 0;
  let skillGain = 0;
  let label = "";

  if (activityType === "pizza_party") {
    cost = 150;
    energyGain = 35;
    label = "Studio Pizza Party";
  } else if (activityType === "hackathon") {
    cost = 500;
    researchGain = 15;
    label = "24h Studio Hackathon";
  } else if (activityType === "dev_con") {
    cost = 1200;
    researchGain = 20;
    skillGain = 5;
    label = "Annual DevCon Attendance";
  } else if (activityType === "chairs") {
    cost = 5000;
    label = "High-End Ergonomic Chairs Upgrade";
    if (gameState.ergonomic_chairs) {
      showToast("You already upgraded to Ergonomic Chairs!", "info");
      return;
    }
  }

  if (gameState.cash < cost) {
    showToast(`Insufficient cash reserves! Required: $${cost}`, "error");
    return;
  }

  let xpCost = 0;
  if (activityType === "pizza_party") xpCost = 10;
  else if (activityType === "hackathon") xpCost = 25;
  else if (activityType === "dev_con") xpCost = 50;

  if (gameState.xp < xpCost) {
    showToast(`Insufficient XP! Hosting this activity requires ${xpCost} XP.`, "error");
    return;
  }

  if (!confirm(`Are you sure you want to start '${label}'? Costs $${cost} and ${xpCost} XP.`)) {
    return;
  }

  gameState.cash -= cost;
  gameState.xp -= xpCost;

  ensureStudioMeta();
  if (activityType === "pizza_party") {
    gameState.energy = Math.min(gameState.max_energy, gameState.energy + energyGain);
    gameState.studioMorale = Math.min(100, gameState.studioMorale + 10);
    pushStudioDiary("Pizza party hosted. Morale up; digestion down.");
    addLog("Hosted Pizza Party", `Spent $${cost} and 10 XP to host a pizza party. Gained +35 Energy.`);
    showToast("Wood-fired pizzas delivered! +35 Energy", "success");
  } else if (activityType === "hackathon") {
    gameState.research_points += researchGain;
    gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 8);
    pushStudioDiary("Hackathon ended. 3 prototypes, 47 energy drinks, 1 working demo.");
    addLog("Started Hackathon", `Spent $${cost} and 25 XP to organize a hackathon. Gained +15 Research Points.`);
    showToast("24h hackathon complete! Devs saw God, then a linter. +15 RP", "success");
  } else if (activityType === "dev_con") {
    gameState.research_points += researchGain;
    gameState.coding_skill += skillGain;
    gameState.design_skill += skillGain;
    gameState.studioReputation = Math.min(100, gameState.studioReputation + 5);
    gameState.studioBuzz = Math.min(100, gameState.studioBuzz + 12);
    pushStudioDiary("DevCon loot: stickers, anxiety, and one good contact.");
    addLog("Attended DevCon", `Spent $${cost} and 50 XP to attend DevCon. Gained +20 Research Points and +5 Coding & Design.`);
    showToast("DevCon complete! +20 RP, +5 Skills", "success");
  } else if (activityType === "chairs") {
    gameState.ergonomic_chairs = true;
    gameState.studioMorale = Math.min(100, gameState.studioMorale + 15);
    pushStudioDiary("Ergonomic chairs installed. Lower backs cautiously optimistic.");
    addLog("Ergonomic Chairs Upgraded", `Spent $${cost} on posture chairs. Active Energy recovery increased by 50% permanently.`);
    showToast("Chairs installed! +50% Energy recovery speed", "success");
    
    const btn = document.getElementById("btn-chairs-activity");
    if (btn) {
      btn.disabled = true;
      btn.innerText = "Purchased";
    }
  }

  saveGame();
  updateUI();
}

// --- Post-Release Dashboard & Day-One Patching ---
function renderPostReleaseDashboard() {
  const devPanel = document.getElementById("develop-panel-content");
  if (!devPanel || !gameState.current_project) return;

  const proj = ensureProjectMeta(gameState.current_project);
  
  // Safety checks for corrupted or legacy save files
  if (proj.rating === undefined) proj.rating = 5.0;
  if (proj.commentIndex === undefined) proj.commentIndex = 2;
  if (!proj.reviewers) {
    proj.reviewers = [
      { name: "IGNion", comments: ["Worse than formatting a hard drive.", "Too much water.", "A solid average.", "Extremely good.", "Masterpiece!"] },
      { name: "GameSpotter", comments: ["Digital crime scene.", "Mediocre.", "Fun weekend distraction.", "Innovative mechanics.", "Redefined the genre."] },
      { name: "Metacritic rating", comments: ["0/10 would not code.", "Not great, not terrible.", "Good vibes.", "Impressive UI.", "Masterpiece of engineering."] }
    ];
  }
  if (!proj.cachedTweets) {
    proj.cachedTweets = getSimulatedSocialFeed(proj.rating, proj.name);
  }

  // Find real-time stats from active_games or portfolio
  const activeGame = gameState.active_games.find(g => g.name === proj.name);
  const portGame = gameState.portfolio.find(p => p.name === proj.name);
  
  const totalSold = activeGame ? activeGame.totalSold : (portGame ? portGame.totalSold : 0);
  const totalRevenue = activeGame ? activeGame.totalRevenue : (portGame ? portGame.totalRevenue : 0);
  const curIncome = activeGame ? getGameIncomePerTick(activeGame) : 0;
  const isSelling = !!activeGame;
  ensureProjectMeta(proj);
  const sentiment = getCommunitySentiment(proj);
  let sentimentColor = "#ffd700";
  if (sentiment >= 75) sentimentColor = "#39ff14";
  else if (sentiment < 45) sentimentColor = "#ff1744";

  // Choose rating badge color
  let badgeColor = "#00e5ff";
  let badgeBg = "rgba(0, 229, 255, 0.1)";
  if (proj.rating >= 8.0) {
    badgeColor = "#39ff14";
    badgeBg = "rgba(57, 255, 20, 0.1)";
  } else if (proj.rating < 5.0) {
    badgeColor = "#ff1744";
    badgeBg = "rgba(255, 23, 68, 0.1)";
  } else {
    badgeColor = "#ffd700";
    badgeBg = "rgba(255, 215, 0, 0.1)";
  }

  // Render patch mini-game html
  let patchHtml = "";
  if (!proj.patchCompleted) {
    if (proj.appleIndex === undefined) {
      proj.appleIndex = Math.floor(Math.random() * 16);
    }
    const cells = Array.from({ length: 16 }, (_, i) => i);
    patchHtml = `
      <div style="background: rgba(0,0,0,0.3); border: 1px solid #ffd700; padding: 20px; border-radius: 12px; margin-top: 15px;">
        <h4 style="color:#ffd700; margin-bottom: 8px; display:flex; justify-content:space-between; font-size:0.9rem;">
          <span>🔧 Day-One Patch Mini-game</span>
          <span>🍎 Apples: ${proj.applesCollected || 0}/3</span>
        </h4>
        <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:12px; line-height:1.4;">Find the hidden memory leak disguised as fruit. Collect 3 to ship a Day-One Patch and earn <strong>+1.0</strong> Metacritic pity points.</p>
        
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; max-width:240px; margin: 0 auto 10px;">
          ${cells.map(i => {
            return `
              <button class="btn-secondary" style="padding:0; font-size:1.1rem; display:flex; justify-content:center; align-items:center; min-height:48px; border-radius:6px; cursor:pointer; color:var(--color-text-muted);" onclick="clickPatchGrid(${i})">
                ❓
              </button>
            `;
          }).join("")}
        </div>
      </div>
    `;
  } else {
    patchHtml = `
      <div style="background: rgba(57,255,20,0.05); border: 1px solid #39ff14; padding: 15px; border-radius: 12px; margin-top: 15px; text-align:center; color:#39ff14; font-size:0.85rem; font-weight:bold;">
        ✓ Day-One Patch Released!<br>Critic reviews rating boosted by <strong>+1.0</strong>!
      </div>
    `;
  }

  const ticketsHtml = (proj.supportTickets || []).map(t => `
    <div class="support-ticket ${t.resolved ? "resolved" : ""}">
      <span>${t.resolved ? "✓" : "🎫"} ${t.text}</span>
      ${t.resolved ? "" : `<button class="btn-secondary" style="padding:4px 8px; font-size:0.65rem;" onclick="resolveSupportTicket('${t.id}')">Resolve</button>`}
    </div>
  `).join("");

  const roadmapHtml = (proj.roadmap || []).map(r => `
    <div class="roadmap-item ${r.done ? "done" : ""}"><span>${r.done ? "✓" : "○"}</span> ${r.label}</div>
  `).join("");

  const awardsHtml = (proj.awards || []).length
    ? proj.awards.map(a => `<span class="award-chip">🏆 ${a}</span>`).join("")
    : `<span style="font-size:0.75rem; color:var(--color-text-muted); font-style:italic;">No awards yet. Host an AMA or ship DLC to impress the industry.</span>`;

  const diaryHtml = (proj.devDiary || []).slice(0, 4).map(d => `
    <div class="dev-diary-entry"><span class="dev-diary-time">[${d.time}]</span> ${d.text}</div>
  `).join("");

  devPanel.innerHTML = `
    <div class="develop-progress-card post-release-hub">
      <div class="dev-board-header post-release-header">
        <div>
          <h3 class="dev-board-title">${proj.name} <span class="post-release-tag">LIVE OPS</span></h3>
          <span class="dev-board-subtitle">${proj.scale} · ${proj.genre}/${proj.topic} · Legacy ${proj.legacyScore || 0} · DLC×${proj.dlcCount || 0}</span>
        </div>
        <div class="post-release-badges">
          <div class="reviewer-score-badge" style="width:52px; height:52px; border-color:${badgeColor}; color:${badgeColor}; background:${badgeBg};">${proj.rating.toFixed(1)}</div>
          <div class="sentiment-badge" style="border-color:${sentimentColor}; color:${sentimentColor};">${sentiment}%<small>sentiment</small></div>
        </div>
      </div>

      <div class="post-release-grid">
        <div class="post-release-col">
          <div class="dev-board-card compact">
            <h4 class="dev-section-label">📰 Critic Desk</h4>
            ${proj.reviewers.map(rev => {
              let revNameColor = "#fff";
              if (rev.name === "IGNion") revNameColor = "#ff1744";
              else if (rev.name === "GameSpotter") revNameColor = "#ffd700";
              else if (rev.name === "Metacritic rating" || rev.name === "Metacritic") revNameColor = "#39ff14";
              const displayRevName = rev.name === "Metacritic rating" ? "Metacritic" : rev.name;
              const commentText = rev.comments ? (rev.comments[proj.commentIndex] || rev.comments[0] || "No comment.") : "No comment.";
              return `<p class="critic-line"><strong style="color:${revNameColor}">${displayRevName}</strong>: "${commentText}"</p>`;
            }).join("")}
          </div>

          <div class="dev-board-card compact">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
              <h4 class="dev-section-label" style="margin:0;">🐦 Social Feed</h4>
              <button class="btn-secondary" style="padding:4px 10px; font-size:0.65rem;" onclick="refreshSocialFeed()">Refresh ($25)</button>
            </div>
            <div class="social-feed-scroll">
              ${proj.cachedTweets.map(t => `<div class="social-line"><strong>@gamer_${t.user}</strong> "${t.text}"</div>`).join("")}
            </div>
          </div>

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">📓 Post-Launch Diary</h4>
            <div class="dev-diary-feed">${diaryHtml || "<em>Silence on the dev blog. Concerning.</em>"}</div>
          </div>
        </div>

        <div class="post-release-col">
          <div class="dev-board-card compact">
            <h4 class="dev-section-label">💰 Sales Pulse</h4>
            <div class="sales-stat-list">
              <div><span>Status</span><strong style="color:${isSelling ? "#39ff14" : "var(--color-text-muted)"}">${isSelling ? "On shelves" : "Catalog concluded"}</strong></div>
              <div><span>Velocity</span><strong style="color:#39ff14">+$${curIncome.toFixed(1)}/s</strong></div>
              <div><span>Copies</span><strong>${parseInt(totalSold).toLocaleString()}</strong></div>
              <div><span>Revenue</span><strong style="color:#39ff14">$${parseFloat(totalRevenue).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</strong></div>
              <div><span>Season Pass</span><strong>${proj.seasonPassActive ? "ACTIVE" : "Inactive"}</strong></div>
            </div>
          </div>

          ${patchHtml}

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">🎫 Support Queue (${(proj.supportTickets || []).filter(t => !t.resolved).length} open)</h4>
            <div class="support-ticket-list">${ticketsHtml}</div>
          </div>

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">🗺️ Live Roadmap</h4>
            <div class="roadmap-list">${roadmapHtml}</div>
          </div>

          <div class="dev-board-card compact">
            <h4 class="dev-section-label">🏆 Trophy Case</h4>
            <div class="awards-row">${awardsHtml}</div>
          </div>
        </div>
      </div>

      <div class="live-ops-hub">
        <h4 class="dev-section-label">🚀 Live Ops Command Center</h4>
        <p class="dev-section-hint">Support tickets, DLC, esports, remasters, sequels — the game never truly ends until you conclude the project.</p>
        <div class="live-ops-grid">
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('dlc')">DLC Drop<br><small>-$150 · -15⚡</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('marketing')">Hype Ads<br><small>-$100 · -5⚡</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('hotfix')">Emergency Hotfix<br><small>-$50 · -5⚡</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('expansion')">Story Expansion<br><small>-$800 · -25⚡</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('free_weekend')" ${!isSelling || proj.freeWeekendsUsed >= 2 ? "disabled" : ""}>Free Weekend<br><small>Free · ${2 - (proj.freeWeekendsUsed || 0)} left</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('ama')">Community AMA<br><small>-4 🎯</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('esports')">Esports Circuit<br><small>-$600</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('season_pass')" ${proj.seasonPassActive ? "disabled" : ""}>Season Pass<br><small>-$400</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('influencer')">Influencer Drop<br><small>-$250</small></button>
          <button class="btn-primary live-ops-btn" onclick="supportActiveProject('goty')">GOTY Bundle<br><small>-$300</small></button>
          <button class="btn-primary live-ops-btn" onclick="launchRemaster()" ${isSelling ? "disabled" : ""}>4K Remaster<br><small>-$2000 · relaunch</small></button>
          <button class="btn-primary live-ops-btn" onclick="startSequelProject()">Greenlight Sequel<br><small>New project++</small></button>
        </div>
      </div>

      <div class="post-release-footer">
        <button class="btn-secondary" onclick="runPostMortem()" ${proj.postMortemDone ? "disabled" : ""}>📋 ${proj.postMortemDone ? "Post-Mortem Filed" : "Run Post-Mortem (+XP)"}</button>
        <button class="btn-primary" onclick="concludeGameProject()">💼 Conclude & Return to Studio</button>
        <button class="btn-secondary nuke-btn" onclick="nukeGameProject()">💥 Pull from Store</button>
      </div>
    </div>
  `;
}

function getSimulatedSocialFeed(rating, name) {
  const users = ["alpha_coder", "indie_fan", "console_cowboy", "pixel_purist", "noob_slayer", "hype_beast", "patch_when", "dlc_whale", "speedrun_god", "review_bomber"];
  
  let comments = [];
  if (rating >= 8.0) {
    comments = [
      `I looked at the binary. The compilers themselves wept at the efficiency. 10/10.`,
      `I sold my kidney to buy the launch DLC for ${name}. Totally worth it.`,
      `I've been playing ${name} for 24 hours. My family misses me.`,
      `The shadow effects in ${name} are so smooth I am literally crying.`,
      `Day one: masterpiece. Day two: still masterpiece. Day three: I am the masterpiece.`,
      `Streamer economy saved. ${name} carries my entire content calendar.`,
      `Patch notes read like poetry. Dev team cooked.`,
      `My therapist says ${name} counts as emotional regulation.`
    ];
  } else if (rating < 5.0) {
    comments = [
      `The code for ${name} is held together by sticky tape and thoughts. Avoid.`,
      `My GPU literally started smoking when I booted ${name}. Beautiful fire though.`,
      `Wait for the day-one patch, they forgot to compile half the files. Total mess.`,
      `Refunded. Hope the devs release a fix or switch careers.`,
      `${name} crashed so hard it opened my tax documents.`,
      `Tutorial soft-locked me in the options menu. Impressive.`,
      `Review bomb incoming. Not because it's bad — because it's honest about being bad.`,
      `Dev blog post was just 'we are investigating'. Investigate faster.`
    ];
  } else {
    comments = [
      `${name} runs at 60 FPS, but only if you disable the shadows and close Google Chrome.`,
      `Decent game loop, but there's a bug where my character gets stuck in a toilet.`,
      `A solid 7/10. It kept me away from doing my actual software job for a couple of hours.`,
      `Nice vibe, but the buttons are misaligned by exactly 1 pixel.`,
      `${name} is comfort food for people who enjoy mild suffering.`,
      `Played 3 hours. 2 hours were loading screens with personality.`,
      `Would recommend to enemies and close friends only.`,
      `The soundtrack slaps. The netcode slaps back.`
    ];
  }

  const shuffled = [...comments].sort(() => Math.random() - 0.5);
  const pick = shuffled.slice(0, 6);
  return pick.map((text, i) => ({ user: users[i % users.length], text }));
}

function markRoadmapDone(proj, roadmapId) {
  ensureProjectMeta(proj);
  const item = (proj.roadmap || []).find(r => r.id === roadmapId);
  if (item) item.done = true;
}

function syncActiveGameStats(proj) {
  const activeGame = gameState.active_games.find(g => g.name === proj.name);
  const portItem = gameState.portfolio.find(p => p.name === proj.name);
  if (activeGame) {
    activeGame.rating = proj.rating;
  }
  if (portItem) {
    portItem.rating = proj.rating;
    if (activeGame) portItem.initialSalesRate = activeGame.initialSalesRate;
  }
}

function clickPatchGrid(index) {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  
  const proj = gameState.current_project;
  
  if (index === proj.appleIndex) {
    proj.applesCollected = (proj.applesCollected || 0) + 1;
    
    if (proj.applesCollected >= 3) {
      proj.patchCompleted = true;
      applyDayOnePatch();
    } else {
      // Move apple to new random index that is not the current one
      let nextIndex = proj.appleIndex;
      while (nextIndex === proj.appleIndex) {
        nextIndex = Math.floor(Math.random() * 16);
      }
      proj.appleIndex = nextIndex;
      showToast("Bug squashed! One down. The apple was a metaphor (mostly).", "success");
    }
  } else {
    const misses = ["Clean line. No bugs. Suspicious.", "That's production code. Don't touch it.", "Stack trace points elsewhere. Probably." ];
    showToast(misses[Math.floor(Math.random() * misses.length)], "info");
  }
  
  saveGame();
  renderPostReleaseDashboard();
}

function applyDayOnePatch() {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const proj = gameState.current_project;
  
  // Increase rating by 1.0 (capped at 10.0)
  const oldRating = proj.rating;
  proj.rating = Math.min(10.0, proj.rating + 1.0);
  
  // Recalculate sales multiplier & velocity
  let price = 4.99;
  let baseSales = 60;
  if (proj.scale === "Medium") { price = 14.99; baseSales = 250; }
  if (proj.scale === "Large") { price = 29.99; baseSales = 800; }
  if (proj.scale === "AAA") { price = 49.99; baseSales = 2500; }
  
  const pMult = PLATFORMS[proj.platform].marketSize;
  const ratingMult = Math.pow(proj.rating / 7.0, 3.5);
  const newSalesRate = Math.ceil(baseSales * pMult * ratingMult);

  // Update matching item in active_games
  const activeGame = gameState.active_games.find(g => g.name === proj.name);
  if (activeGame) {
    activeGame.rating = proj.rating;
    activeGame.initialSalesRate = newSalesRate;
  }
  
  // Update matching item in portfolio
  if (!Array.isArray(gameState.portfolio)) gameState.portfolio = [];
  const portItem = gameState.portfolio.find(p => p.name === proj.name);
  if (portItem) {
    portItem.rating = proj.rating;
    portItem.initialSalesRate = newSalesRate;
  }
  
  // Refresh cached comments to be more positive with rating boost
  proj.cachedTweets = getSimulatedSocialFeed(proj.rating, proj.name);

  markRoadmapDone(proj, "patch");
  proj.legacyScore = (proj.legacyScore || 0) + 8;
  pushDevDiary(proj, "post_release", "Day-one patch shipped. Players can now log in. Revolutionary.");

  addLog("Day-One Patch Released!", `Metacritic rating for '${proj.name}' improved from ${oldRating.toFixed(1)} to ${proj.rating.toFixed(1)}! Sales rate boosted.`);
  showToast("Patch released! Rating boosted +1.0!", "success");
  
  saveGame();
  renderPostReleaseDashboard();
}

function resolveSupportTicket(ticketId) {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const proj = ensureProjectMeta(gameState.current_project);
  const ticket = proj.supportTickets.find(t => t.id === ticketId && !t.resolved);
  if (!ticket) return;
  ticket.resolved = true;
  gainXP(6);
  pushDevDiary(proj, "post_release", `Closed ticket: "${ticket.text.substring(0, 40)}..." Support hero status: pending.`);
  addLog("Ticket Resolved", `Support closed: ${ticket.text}`);
  showToast("Ticket resolved! +6 XP", "success");
  saveGame();
  renderPostReleaseDashboard();
}

function refreshSocialFeed() {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const proj = gameState.current_project;
  if (gameState.cash < 25) { showToast("Social refresh costs $25!", "error"); return; }
  gameState.cash -= 25;
  proj.cachedTweets = getSimulatedSocialFeed(proj.rating, proj.name);
  pushDevDiary(proj, "post_release", "Community manager scheduled 14 identical hype posts across all platforms.");
  showToast("Social feed refreshed!", "info");
  saveGame();
  renderPostReleaseDashboard();
}

function runPostMortem() {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const proj = ensureProjectMeta(gameState.current_project);
  if (proj.postMortemDone) return;
  proj.postMortemDone = true;
  const lessons = [
    "Lesson 1: Scope creep is a feature, not a bug. Lesson 2: It is still a bug.",
    "We shipped on time by redefining what 'time' means.",
    "Morale was low but the coffee was lower.",
    "Would crunch again (lie). Would document less (truth)."
  ];
  const lesson = lessons[Math.floor(Math.random() * lessons.length)];
  gainXP(35);
  proj.legacyScore = (proj.legacyScore || 0) + 15;
  addLog("Post-Mortem Filed", `'${proj.name}': ${lesson}`);
  showToast(`Post-mortem complete! +35 XP. ${lesson}`, "success");
  saveGame();
  renderPostReleaseDashboard();
}

function launchRemaster() {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const proj = ensureProjectMeta(gameState.current_project);
  const activeGame = gameState.active_games.find(g => g.name === proj.name);
  if (activeGame) { showToast("Wait for sales to end before remastering!", "error"); return; }
  if (gameState.cash < 2000) { showToast("4K Remaster costs $2000!", "error"); return; }
  if (!confirm(`Relaunch '${proj.name}' as a Definitive Edition for $2000?`)) return;

  gameState.cash -= 2000;
  const portItem = gameState.portfolio.find(p => p.name === proj.name) || proj;
  proj.rating = Math.min(10, proj.rating + 0.8);
  const relaunch = {
    name: proj.name,
    genre: proj.genre,
    topic: proj.topic,
    scale: proj.scale,
    price: (portItem.price || proj.price || 14.99) + 5,
    rating: proj.rating,
    initialSalesRate: Math.ceil((portItem.initialSalesRate || proj.initialSalesRate || 100) * 1.5),
    totalSold: portItem.totalSold || 0,
    totalRevenue: portItem.totalRevenue || 0,
    age: 0,
    revenueCap: (portItem.revenueCap || 3000) + 2000,
    decayHalfLife: 120
  };
  gameState.active_games.push(relaunch);
  syncActiveGameStats(proj);
  proj.legacyScore = (proj.legacyScore || 0) + 25;
  if (!proj.awards.includes("Definitive Re-Re-Release")) proj.awards.push("Definitive Re-Re-Release");
  pushDevDiary(proj, "post_release", "Remastered with 4K shadows and 8K marketing. Same bugs, prettier.");
  addLog("Remaster Launched", `'${proj.name}' Definitive Edition back on shelves!`);
  showToast("Remaster live! Sales relaunched.", "success");
  saveGame();
  renderPostReleaseDashboard();
  updateUI();
}

function startSequelProject() {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const parent = ensureProjectMeta(gameState.current_project);
  if (!confirm(`Greenlight sequel to '${parent.name}'? Development starts immediately with franchise bonuses.`)) return;

  markRoadmapDone(parent, "sequel");
  const baseName = parent.name.replace(/\s+\d+:.*$/, "");
  const sequelName = `${baseName} 2: Electric Bugaloo`;
  const scaleOrder = ["Small", "Medium", "Large", "AAA"];
  let sequelScale = parent.scale;
  const idx = scaleOrder.indexOf(parent.scale);
  if (idx < scaleOrder.length - 1 && parent.rating >= 7) sequelScale = scaleOrder[idx + 1];

  const target = getTargetPointsForScale(sequelScale);
  gameState.current_project = ensureProjectMeta({
    name: sequelName,
    genre: parent.genre,
    topic: parent.topic,
    platform: parent.platform,
    scale: sequelScale,
    tech_points: Math.ceil(target * 0.12),
    design_points: Math.ceil(target * 0.1),
    bug_points: 3,
    phase: "coding",
    hypeMeter: Math.min(100, (parent.hypeMeter || 20) + 20),
    franchiseParent: parent.name,
    miniGamesPlayed: 0,
    miniGamesWon: 0,
    miniGamesLost: 0
  });
  pushDevDiary(gameState.current_project, "concept", `Sequel greenlit off '${parent.name}'. Fan forums already arguing about canon.`);
  addLog("Sequel Greenlit", `'${sequelName}' enters production.`);
  showToast(`Sequel '${sequelName}' now in development!`, "success");
  saveGame();
  renderDevelopPanel();
  updateUI();
}

function concludeGameProject() {
  if (!gameState.current_project) return;
  const proj = ensureProjectMeta(gameState.current_project);
  if (!proj.postMortemDone && !confirm("Conclude without a post-mortem? You'll miss +35 XP and priceless industry wisdom.")) {
    return;
  }
  proj.legacyScore = (proj.legacyScore || 0) + Math.round((proj.rating || 5) * 2);
  addLog("Project Concluded", `Finalized '${proj.name}'. Legacy score: ${proj.legacyScore}. Studio catalog updated.`);
  showToast(`Concluded '${proj.name}'! Legacy +${proj.legacyScore}`, "info");
  
  gameState.current_project = null;
  
  saveGame();
  renderDevelopPanel();
  updateUI();
}

function supportActiveProject(actionType) {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const proj = ensureProjectMeta(gameState.current_project);
  const activeGame = gameState.active_games.find(g => g.name === proj.name);
  const needsActive = ["dlc", "marketing", "hotfix", "expansion", "free_weekend", "esports", "influencer", "goty", "season_pass"];
  if (needsActive.includes(actionType) && !activeGame) {
    showToast("This game is no longer on shelves — try Remaster or Sequel!", "error");
    return;
  }

  if (actionType === "dlc") {
    if (gameState.cash < 150 || gameState.energy < 15) { showToast("DLC: $150 + 15 energy!", "error"); return; }
    gameState.cash -= 150;
    gameState.energy -= 15;
    proj.rating = Math.min(10.0, proj.rating + 0.5);
    activeGame.initialSalesRate = Math.ceil(activeGame.initialSalesRate * 1.3);
    proj.dlcCount += 1;
    markRoadmapDone(proj, "dlc1");
    proj.legacyScore += 5;
    if (proj.dlcCount >= 2 && !proj.awards.includes("DLC Machine")) proj.awards.push("DLC Machine");
    pushDevDiary(proj, "post_release", `DLC #${proj.dlcCount}: Horse armor (cosmetic). $19.99. Community thrilled/confused.`);
    addLog("DLC Launched", `DLC #${proj.dlcCount} for '${proj.name}'. Rating ${proj.rating.toFixed(1)}.`);
    showToast("DLC dropped! +30% sales rate", "success");
  } else if (actionType === "marketing") {
    if (gameState.cash < 100 || gameState.energy < 5) { showToast("Ads: $100 + 5 energy!", "error"); return; }
    gameState.cash -= 100;
    gameState.energy -= 5;
    activeGame.decayHalfLife = (activeGame.decayHalfLife || 90) + 45;
    pushDevDiary(proj, "post_release", "Ad blitz bought bots, hope, and three podcast sponsorships.");
    addLog("Hype Ads", `Marketing push for '${proj.name}'. Shelf life extended.`);
    showToast("Hype ads live! Decay slowed.", "success");
  } else if (actionType === "hotfix") {
    if (gameState.cash < 50 || gameState.energy < 5) { showToast("Hotfix: $50 + 5 energy!", "error"); return; }
    gameState.cash -= 50;
    gameState.energy -= 5;
    proj.hotfixCount += 1;
    proj.rating = Math.min(10, proj.rating + 0.2);
    const open = proj.supportTickets.filter(t => !t.resolved);
    if (open.length) open[0].resolved = true;
    pushDevDiary(proj, "post_release", `Hotfix v${proj.hotfixCount}.0.001: fixed crash when player exists.`);
    addLog("Hotfix", `Emergency patch #${proj.hotfixCount} for '${proj.name}'.`);
    showToast("Hotfix deployed!", "success");
  } else if (actionType === "expansion") {
    if (gameState.cash < 800 || gameState.energy < 25) { showToast("Expansion: $800 + 25 energy!", "error"); return; }
    gameState.cash -= 800;
    gameState.energy -= 25;
    proj.expansionCount += 1;
    proj.rating = Math.min(10, proj.rating + 1.0);
    activeGame.initialSalesRate = Math.ceil(activeGame.initialSalesRate * 1.8);
    markRoadmapDone(proj, "expansion");
    proj.legacyScore += 12;
    pushDevDiary(proj, "post_release", "Expansion adds 6 hours of fetch quests and one new hat.");
    addLog("Expansion", `Major expansion for '${proj.name}'. Rating +1.0!`);
    showToast("Expansion shipped! Sales surging.", "success");
  } else if (actionType === "free_weekend") {
    if ((proj.freeWeekendsUsed || 0) >= 2) return;
    proj.freeWeekendsUsed += 1;
    activeGame.age = Math.max(0, activeGame.age - 35);
    const burst = Math.ceil(activeGame.initialSalesRate * 0.4);
    activeGame.initialSalesRate += burst;
    pushDevDiary(proj, "post_release", "Free weekend: servers melted, player count briefly looked healthy.");
    addLog("Free Weekend", `'${proj.name}' free weekend #${proj.freeWeekendsUsed}. Player spike!`);
    showToast("Free weekend! Sales spike.", "success");
  } else if (actionType === "ama") {
    if (gameState.nerve < 4) { showToast("AMA needs 4 nerve!", "error"); return; }
    gameState.nerve -= 4;
    proj.amaCount += 1;
    proj.rating = Math.min(10, proj.rating + 0.15);
    proj.cachedTweets = getSimulatedSocialFeed(proj.rating, proj.name);
    pushDevDiary(proj, "post_release", "AMA went well until someone asked about crunch. You answered with emojis.");
    addLog("Community AMA", `Hosted AMA for '${proj.name}'. Sentiment improved.`);
    showToast("AMA complete! Social feed updated.", "success");
  } else if (actionType === "esports") {
    if (gameState.cash < 600) { showToast("Esports costs $600!", "error"); return; }
    gameState.cash -= 600;
    activeGame.initialSalesRate = Math.ceil(activeGame.initialSalesRate * 1.5);
    activeGame.age = Math.max(0, activeGame.age - 20);
    if (!proj.awards.includes("Grassroots Esports")) proj.awards.push("Grassroots Esports");
    pushDevDiary(proj, "post_release", "Esports finals featured 200 ping and one incredible play.");
    addLog("Esports", `Funded tournament for '${proj.name}'.`);
    showToast("Esports event! Sales boosted.", "success");
  } else if (actionType === "season_pass") {
    if (proj.seasonPassActive) return;
    if (gameState.cash < 400) { showToast("Season pass: $400!", "error"); return; }
    gameState.cash -= 400;
    proj.seasonPassActive = true;
    activeGame.initialSalesRate = Math.ceil(activeGame.initialSalesRate * 1.15);
    pushDevDiary(proj, "post_release", "Season pass live. 90 tiers. 2 rewards are fun.");
    addLog("Season Pass", `Live service monetization enabled for '${proj.name}'.`);
    showToast("Season pass activated!", "success");
  } else if (actionType === "influencer") {
    if (gameState.cash < 250) { showToast("Influencer drop: $250!", "error"); return; }
    gameState.cash -= 250;
    activeGame.initialSalesRate = Math.ceil(activeGame.initialSalesRate * 1.25);
    pushDevDiary(proj, "post_release", "Influencer streamed 20 minutes, said 'not bad', moved on.");
    addLog("Influencer", `Sponsored stream for '${proj.name}'.`);
    showToast("Influencer campaign live!", "success");
  } else if (actionType === "goty") {
    if (gameState.cash < 300) { showToast("GOTY bundle: $300!", "error"); return; }
    gameState.cash -= 300;
    activeGame.decayHalfLife = (activeGame.decayHalfLife || 90) + 60;
    proj.rating = Math.min(10, proj.rating + 0.25);
    if (proj.rating >= 8.5 && !proj.awards.includes("GOTY Nominee")) proj.awards.push("GOTY Nominee");
    pushDevDiary(proj, "post_release", "GOTY bundle includes soundtrack, wallpaper, and unresolved bugs.");
    addLog("GOTY Bundle", `Premium bundle for '${proj.name}'.`);
    showToast("GOTY bundle on sale!", "success");
  }

  syncActiveGameStats(proj);
  saveGame();
  renderPostReleaseDashboard();
  updateUI();
}

// --- Global Window Bindings for Module Scope Safeguard ---
window.trainSkill = trainSkill;
window.runGig = runGig;
window.renderTrainingGym = renderTrainingGym;
window.buyOffice = buyOffice;
window.hireEmployee = hireEmployee;
window.fireEmployee = fireEmployee;
window.createGameProject = createGameProject;
window.releaseGameProject = releaseGameProject;
window.buyItem = buyItem;
window.runMarketing = runMarketing;
window.switchTab = switchTab;
window.buyResearch = buyResearch;
window.closeReviewModal = closeReviewModal;
window.runActivity = runActivity;
window.clickPatchGrid = clickPatchGrid;
window.concludeGameProject = concludeGameProject;
window.supportActiveProject = supportActiveProject;
window.runDevSprintAction = runDevSprintAction;
window.resolveSupportTicket = resolveSupportTicket;
window.refreshSocialFeed = refreshSocialFeed;
window.runPostMortem = runPostMortem;
window.launchRemaster = launchRemaster;
window.startSequelProject = startSequelProject;
window.runStudioAction = runStudioAction;
window.renderStudioDashboard = renderStudioDashboard;

// TOAST NOTIFICATIONS
function showToast(message, type = "info") {
  const container = document.getElementById("toast-container");
  if (!container) return;

  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.innerText = message;

  container.appendChild(toast);

  setTimeout(() => toast.classList.add("visible"), 50);

  setTimeout(() => {
    toast.classList.remove("visible");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
window.showToast = showToast;

function triggerScreenFlash(r, g, b) {
  const main = document.getElementById("zone-main");
  if (!main) return;
  main.style.setProperty("--flash-color", `rgba(${r}, ${g}, ${b}, 0.4)`);
  main.classList.add("screen-flash");
  setTimeout(() => main.classList.remove("screen-flash"), 450);
}

function updateHudCombo(combo) {
  const el = document.getElementById("hud-combo");
  if (!el) return;
  if (combo >= 2) {
    el.style.display = "block";
    el.innerText = `🔥 ${combo}x COMBO`;
  } else {
    el.style.display = "none";
  }
}

window.triggerScreenFlash = triggerScreenFlash;

const devNukeComments = [
  "Wait, they canceled it? But I already bought the gamer socks from their merch store!",
  "The code was probably just one giant 'if (false)' anyway. Saved us from a crash.",
  "Typical vaporware. Devs probably ran away to Bali with the budget.",
  "They took the money and ran! I'm calling my bank to chargeback the pre-order.",
  "Good, the teaser trailer was already drop-frame at 15 FPS.",
  "A tragedy. We lost another potential masterpiece of misaligned pixels.",
  "I had a countdown timer on my desktop for this. Now I have to go outside.",
  "I saw their github repo. The README was just a single crying emoji.",
  "Deleting the game project is the ultimate refactoring technique.",
  "But where am I going to find my daily supply of memory leaks now?"
];

const releaseNukeComments = [
  "Did they just pull it from the store? Legendary rug pull!",
  "Devs literally dropped database in production and called it 'creative direction'.",
  "Gone like a fart in the wind. Glad I didn't buy the Season Pass.",
  "Rest in spaghetti, never forgetti. I'm going back to Minesweeper.",
  "The servers went offline faster than my laptop battery.",
  "It's an ultra-rare collector's item now. Selling my hard drive for $5000.",
  "They pulled a Flappy Bird! Devs are too pure for this world.",
  "They deleted the game to avoid fixing the bugs. Honestly, respect.",
  "I still had 14 unresolved bug tickets open. What a speedrun."
];

function nukeGameProject() {
  if (!gameState.current_project) return;
  
  const proj = gameState.current_project;
  const gameName = proj.name;
  const wasReleased = proj.phase === "post_release";
  
  if (!confirm(`Are you sure you want to NUKE '${gameName}'? This will permanently cancel/pull the project and delete all progress!`)) {
    return;
  }
  
  // Stop active mini-games
  if (miniGameTimer) {
    clearInterval(miniGameTimer);
    miniGameTimer = null;
  }
  activeMiniGame = null;
  
  // If it was post-release, remove from active games list so sales stop!
  if (wasReleased) {
    gameState.active_games = gameState.active_games.filter(g => g.name !== gameName);
  }
  gameState.portfolio = (gameState.portfolio || []).filter(g => g.name !== gameName);

  ChiptuneAudio.playSFX("fail");

  gameState.current_project = null;

  addLog("PROJECT NUKED", `'${gameName}' was vaporized. Store delisted. Portfolio entry sent to /dev/null (not really — we fixed that).`);
  
  saveGame();
  
  // Show nuke modal with crowd reactions
  showNukeModal(gameName, wasReleased);
}

function showNukeModal(gameName, wasReleased) {
  const modal = document.getElementById("nuke-modal");
  const titleEl = document.getElementById("nuke-game-title");
  const metaEl = document.getElementById("nuke-game-meta");
  const container = document.getElementById("nuke-reactions-container");
  
  if (!modal || !container) return;

  if (titleEl) titleEl.innerText = `💥 ${gameName} Nuked!`;
  if (metaEl) {
    metaEl.innerText = wasReleased 
      ? "Pulled from store! The internet is in absolute shambles."
      : "Project canceled! Angry backers are demanding refunds.";
  }

  const sourceComments = wasReleased ? releaseNukeComments : devNukeComments;
  
  // Shuffle comments & users
  const shuffledComments = [...sourceComments].sort(() => Math.random() - 0.5);
  const users = ["alpha_coder", "indie_fan", "console_cowboy", "pixel_purist", "noob_slayer", "hype_beast", "db_nuker", "bug_hunter"];
  const shuffledUsers = [...users].sort(() => Math.random() - 0.5);
  const emojis = ["💀", "🤡", "💸", "😡", "😭", "🤦", "🔥", "💨"];
  const shuffledEmojis = [...emojis].sort(() => Math.random() - 0.5);

  container.innerHTML = "";
  for (let i = 0; i < 3; i++) {
    const commenter = shuffledUsers[i % shuffledUsers.length];
    const text = shuffledComments[i % shuffledComments.length];
    const emoji = shuffledEmojis[i % shuffledEmojis.length];

    container.innerHTML += `
      <div class="reviewer-card" style="border-color: rgba(255, 23, 68, 0.25); background: rgba(255, 23, 68, 0.02); margin-bottom: 0;">
        <div class="reviewer-info">
          <div class="reviewer-name" style="color: #ff1744; font-weight: 700;">@gamer_${commenter}</div>
          <div class="reviewer-comment" style="color: var(--color-text-muted); font-style: italic;">"${text}"</div>
        </div>
        <div class="reviewer-score-badge" style="border-color: #ff1744; color: #ff1744; background: rgba(255, 23, 68, 0.1); box-shadow: 0 0 10px rgba(255, 23, 68, 0.2); font-size: 1.3rem;">
          ${emoji}
        </div>
      </div>
    `;
  }

  modal.style.display = "flex";
}

function closeNukeModal() {
  const modal = document.getElementById("nuke-modal");
  if (modal) {
    modal.style.display = "none";
  }
  renderDevelopPanel();
  updateUI();
}

window.nukeGameProject = nukeGameProject;
window.closeNukeModal = closeNukeModal;

function generateLiveChatMessage() {
  const time = new Date().toLocaleTimeString().split(' ')[0];

  const users = [
    "Speedrunner99", "NoobSlayer_xX", "KappaLord", "GamerGirl3000", "PixelPerfect",
    "SpaghettiCoder", "GlitchHunter", "MetacriticMod", "HypeTrainConductor", "Backer_404",
    "CopypasteKing", "ConsoleWarrior", "FrameRatePolice", "WhaleSpender", "IndieSupporter",
    "KeyboardMasher", "SpeedyCode", "SyntaxError", "NullPointer", "StackOverlord"
  ];
  
  const userColors = [
    "#00e5ff", "#b388ff", "#ffd700", "#39ff14", "#ff1744", 
    "#ff9100", "#00e676", "#d500f9", "#ff007f", "#3d5afe"
  ];
  
  const badges = [
    { text: "👑 DEV", color: "#39ff14", bg: "rgba(57,255,20,0.15)" },
    { text: "🛡️ MOD", color: "#ff1744", bg: "rgba(255,23,68,0.15)" },
    { text: "💎 SUB", color: "#00e5ff", bg: "rgba(0,229,255,0.15)" },
    { text: "⭐ VIP", color: "#ffd700", bg: "rgba(255,215,0,0.15)" }
  ];

  const username = users[Math.floor(Math.random() * users.length)];
  const userColor = userColors[Math.floor(Math.random() * userColors.length)];
  
  let badgeText = "";
  if (Math.random() < 0.3) {
    const badge = badges[Math.floor(Math.random() * badges.length)];
    badgeText = badge.text;
  }

  let comments = [];
  const currentProj = gameState.current_project;
  const activeGames = gameState.active_games;

  if (activeGames && activeGames.length > 0) {
    const randomGame = activeGames[Math.floor(Math.random() * activeGames.length)];
    const gameName = randomGame.name;
    const rating = randomGame.rating.toFixed(1);

    comments = [
      `playing ${gameName} right now, centering a div took me 4 hours 😂`,
      `just got stuck in a bathroom toilet in ${gameName} 🤦`,
      `the frames are dropping to 12 FPS on Pear Station ResidentSleeper 😴`,
      `Wait, did they nuke their database? the gameplay is pure chaos LUL 😂`,
      `their metacritic rating is ${rating}/10? METACRITIC IS BRIBED 🤡`,
      `W release! Best game of 2026 PogChamp 😲`,
      `Is this pay-to-win? I need to flex my wallet 💸`,
      `the physics are completely glitched, I launched a toaster into orbit 🚀`,
      `Refunded ${gameName}. My GPU is now a space heater 😭`,
      `W game! centring divs has never been this immersive`,
      `Kappa 🤡`,
      `Is the day-one patch out yet? I'm clipping through the floor 🤦`
    ];
  } else if (currentProj) {
    const gameName = currentProj.name;
    comments = [
      `did you guys see the leaks for ${gameName}?`,
      `looks like absolute vaporware Kappa 🤡`,
      `is there multiplayer? if not, I riot`,
      `W game incoming, I can feel it PogChamp 😲`,
      `when is pre-alpha testing?`,
      `don't rush the devs, they are crunching hard in mom's basement 😭`,
      `the code snippets are literally copied from stackoverflow LUL 😂`,
      `looks better than Cyberpunk launch already`,
      `preordered the deluxe gold alpha premium version already 💸`,
      `HYPE PogChamp 😲`,
      `will it run on my potato laptop?`,
      `Adding ChatGPT to code? Bold move devs 🤡`
    ];
  } else {
    comments = [
      "is the stream online? Kappa 🤡",
      "when next game???",
      "their last game was such a cash grab 😂",
      "can I apply as a moderator here?",
      "are the devs sleeping on the job again? 😴",
      "ResidentSleeper 😴",
      "agile standups are just devs lying in unison LUL 😂",
      "ChatGPT Prompter is carrying the entire company ngl 👑",
      "did they buy the ergonomic chairs yet? my back hurts watching them",
      "LUL 😂",
      "Anyone here playing Minesweeper?",
      "They probably ran out of coffee again ☕",
      "Fired employee #1? Savage LUL 😂"
    ];
  }

  const commentText = comments[Math.floor(Math.random() * comments.length)];

  // Push to consoleLogs for WebGL Auxiliary screen
  consoleLogs.push({
    time: time,
    user: "@" + username,
    text: `"${commentText}"`,
    color: userColor,
    badge: badgeText
  });
  if (consoleLogs.length > 60) consoleLogs.shift();

  const consoleEl = document.getElementById("terminal-console");
  if (consoleEl) {
    let badgeHtml = "";
    if (badgeText) {
      const matchBadge = badges.find(b => b.text === badgeText);
      badgeHtml = `<span style="font-size:0.65rem; font-weight:800; padding:2px 5px; border-radius:4px; margin-right:5px; border:1px solid ${matchBadge.color}; color:${matchBadge.color}; background:${matchBadge.bg};">${matchBadge.text}</span>`;
    }

    const chatLine = document.createElement("div");
    chatLine.className = "terminal-line";
    chatLine.style.display = "flex";
    chatLine.style.alignItems = "center";
    chatLine.style.flexWrap = "wrap";
    chatLine.style.padding = "2px 0";

    chatLine.innerHTML = `
      <span class="timestamp" style="font-size:0.72rem; color:var(--color-text-muted); margin-right:6px;">[${time}]</span>
      ${badgeHtml}
      <strong style="color:${userColor}; margin-right:6px; cursor:pointer;">@${username}:</strong>
      <span style="color:#fff;">"${commentText}"</span>
    `;

    consoleEl.appendChild(chatLine);

    while (consoleEl.children.length > 60) {
      consoleEl.removeChild(consoleEl.firstChild);
    }

    consoleEl.scrollTop = consoleEl.scrollHeight;
  }
}

window.generateLiveChatMessage = generateLiveChatMessage;


// ═══════════════════════════════════════════════
// --- NEW MINI-GAME UTILITIES AND FUNCTIONS ---
// ═══════════════════════════════════════════════

function generateBinaryMatcherState() {
  const binaryOptions = ["0000", "0001", "0010", "0011", "0100", "0101", "0110", "0111", "1000", "1001", "1010", "1011", "1100", "1101", "1110", "1111"];
  const target = binaryOptions[Math.floor(Math.random() * binaryOptions.length)];
  let others = binaryOptions.filter(x => x !== target);
  let fake1 = others[Math.floor(Math.random() * others.length)];
  others = others.filter(x => x !== fake1);
  let fake2 = others[Math.floor(Math.random() * others.length)];
  const options = [target, fake1, fake2].sort(() => Math.random() - 0.5);
  return { target, options };
}

function activateMiniGameTimer() {
  if (miniGameTimer) clearInterval(miniGameTimer);

  const interval = 100;
  miniGameTimer = setInterval(() => {
    if (!activeMiniGame) {
      clearInterval(miniGameTimer);
      return;
    }

    activeMiniGame.elapsed += interval;
    activeMiniGame.timeLeft = Math.max(0, 100 - (activeMiniGame.elapsed / activeMiniGame.duration) * 100);

    const bar = document.getElementById("minigame-timer-bar");
    if (bar) {
      bar.style.width = `${activeMiniGame.timeLeft}%`;
    }

    if (activeMiniGame.type === 'slider') {
      activeMiniGame.needlePosition += activeMiniGame.needleDirection * activeMiniGame.needleSpeed;
      if (activeMiniGame.needlePosition >= 100) {
        activeMiniGame.needlePosition = 100;
        activeMiniGame.needleDirection = -1;
      } else if (activeMiniGame.needlePosition <= 0) {
        activeMiniGame.needlePosition = 0;
        activeMiniGame.needleDirection = 1;
      }
      const needle = document.getElementById("minigame-slider-needle");
      if (needle) {
        needle.style.left = `${activeMiniGame.needlePosition}%`;
      }
    } else if (activeMiniGame.type === 'pour') {
      activeMiniGame.pointerPosition += activeMiniGame.pointerDirection * activeMiniGame.pointerSpeed;
      if (activeMiniGame.pointerPosition >= 100) {
        activeMiniGame.pointerPosition = 100;
        activeMiniGame.pointerDirection = -1;
      } else if (activeMiniGame.pointerPosition <= 0) {
        activeMiniGame.pointerPosition = 0;
        activeMiniGame.pointerDirection = 1;
      }
      const needle = document.getElementById("minigame-pour-needle");
      if (needle) {
        needle.style.left = `${activeMiniGame.pointerPosition}%`;
      }
    }

    if (activeMiniGame.elapsed >= activeMiniGame.duration) {
      clearInterval(miniGameTimer);
      failMiniGame("Time Out!");
    }
  }, interval);
}

function renderDeveloperStore() {
  const container = document.getElementById("store-items-grid");
  if (!container) return;

  if (activeMiniGame && activeMiniGame.isStore) {
    container.innerHTML = `
      <div style="background: rgba(0,0,0,0.4); border: 2px solid var(--color-gold); padding: 20px; border-radius: 12px; grid-column: span 1; width: 100%; text-align: center; box-sizing: border-box;">
        <h4 style="color: var(--color-gold); margin-bottom: 8px; font-family: 'Press Start 2P', monospace; font-size: 0.8rem;">☕ Pouring Mini-game: Caffeine Brew</h4>
        <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 15px;">Pour/Consume when the wobbly pointer is inside the green zone to double your recovery!</p>
        
        <div style="position: relative; height: 30px; background: #222; border: 2px solid #555; border-radius: 6px; margin-bottom: 20px; overflow: hidden;">
          <div style="position: absolute; left: ${activeMiniGame.greenZoneStart}%; width: ${activeMiniGame.greenZoneEnd - activeMiniGame.greenZoneStart}%; height: 100%; background: #39ff14; opacity: 0.6; box-shadow: 0 0 10px #39ff14;"></div>
          <div id="minigame-pour-needle" style="position: absolute; left: ${activeMiniGame.pointerPosition}%; width: 6px; height: 100%; background: #ff1744; border-radius: 3px; transform: translateX(-50%); box-shadow: 0 0 8px #ff1744; transition: left 0.05s linear;"></div>
        </div>

        <div style="display: flex; gap: 10px; margin-bottom: 12px;">
          <button class="btn-primary" style="flex: 1; padding: 12px; font-size: 1rem;" onclick="stopCoffeePour()">POUR / BREW</button>
          <button class="btn-secondary" style="flex: 1; padding: 12px; border-color: rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">ABORT</button>
        </div>

        <div class="status-bar-track" style="height: 6px;">
          <div class="status-bar-fill" id="minigame-timer-bar" style="width: 100%; height: 100%; background: var(--color-gold);"></div>
        </div>
      </div>
    `;
    return;
  }

  container.innerHTML = `
    <div class="card-item" style="padding: 14px;">
      <div class="card-item-title" style="font-size: 0.9rem;">
        <span>Java Volt Extra-Battery Acid</span>
        <span style="color: #39ff14;">$50</span>
      </div>
      <div class="card-item-desc" style="font-size: 0.8rem; line-height:1.35;">
        A carbonated cocktail of taurine, caffeine, and pure desperation. Instantly restores <strong>+25 Energy</strong>.<br>
        <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
          ⚠️ <strong>WARNING:</strong> Highly radioactive. Side effects include seeing memory leaks in 4D space, rapid finger twitching, and typing compile loops in your sleep. Daily value of caffeine: 900%.
        </span>
      </div>
      <button class="btn-primary" style="padding: 10px; font-size: 0.85rem;" onclick="buyItem('energy_drink')">Buy & Consume</button>
    </div>

    <div class="card-item" style="padding: 14px;">
      <div class="card-item-title" style="font-size: 0.9rem;">
        <span>Lukewarm Office Drip Coffee</span>
        <span style="color: #39ff14;">$20</span>
      </div>
      <div class="card-item-desc" style="font-size: 0.8rem; line-height:1.35;">
        Brewed last Tuesday in a machine that has not been descaled since the Dot-Com crash. Restores <strong>+10 Energy</strong>.<br>
        <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
          ⚠️ <strong>Surgeon General Warning:</strong> Tastes like hot copper coins, industrial solvent, and broken promises. Morale boost is zero, but it is wet.
        </span>
      </div>
      <button class="btn-primary" style="padding: 10px; font-size: 0.85rem;" onclick="buyItem('coffee')">Buy & Consume</button>
    </div>

    <div class="card-item" style="padding: 14px;">
      <div class="card-item-title" style="font-size: 0.9rem;">
        <span>Sus Nootropic Focus Pill</span>
        <span style="color: #39ff14;">$100</span>
      </div>
      <div class="card-item-desc" style="font-size: 0.8rem; line-height:1.35;">
        Bought from a sketchy pop-up banner on an unindexed forum. Instantly restores <strong>+5 Nerve Focus</strong>.<br>
        <span style="font-size: 0.72rem; color: var(--color-text-muted); display: block; margin-top: 4px; border-top: 1px dashed rgba(255,255,255,0.1); padding-top: 4px;">
          ⚠️ <strong>DISCLAIMER:</strong> Ingredients list is written in wingdings. Guaranteed to lock you in an 8-hour loop staring at CSS centering tutorials.
        </span>
      </div>
      <button class="btn-primary" style="padding: 10px; font-size: 0.85rem;" onclick="buyItem('nootropic')">Buy & Consume</button>
    </div>
  `;
}

function renderGigsBoard() {
  const container = document.getElementById("gigs-board-grid");
  if (!container) return;

  if (activeMiniGame && activeMiniGame.isGig) {
    if (activeMiniGame.type === 'slider') {
      container.innerHTML = `
        <div style="background: rgba(0,0,0,0.4); border: 2px solid var(--color-cyan); padding: 20px; border-radius: 12px; grid-column: span 1; width: 100%; text-align: center; box-sizing: border-box;">
          <h4 style="color: var(--color-cyan); margin-bottom: 8px; font-family: 'Press Start 2P', monospace; font-size: 0.8rem;">📐 Slider Centering: CSS Alignment</h4>
          <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 15px;">Lock the needle directly inside the center green zone to align the Luigi pizzeria layout!</p>

          <div style="position: relative; height: 30px; background: #222; border: 2px solid #555; border-radius: 6px; margin-bottom: 20px; overflow: hidden;">
            <div style="position: absolute; left: ${activeMiniGame.greenZoneStart}%; width: ${activeMiniGame.greenZoneEnd - activeMiniGame.greenZoneStart}%; height: 100%; background: #39ff14; opacity: 0.6; box-shadow: 0 0 10px #39ff14;"></div>
            <div id="minigame-slider-needle" style="position: absolute; left: ${activeMiniGame.needlePosition}%; width: 6px; height: 100%; background: #00e5ff; border-radius: 3px; transform: translateX(-50%); box-shadow: 0 0 8px #00e5ff; transition: left 0.05s linear;"></div>
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <button class="btn-primary" style="flex: 1; padding: 12px; font-size: 1rem;" onclick="stopGigSlider()">LOCK ALIGNMENT</button>
            <button class="btn-secondary" style="flex: 1; padding: 12px; border-color: rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">ABORT</button>
          </div>

          <div class="status-bar-track" style="height: 6px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width: 100%; height: 100%; background: var(--color-cyan);"></div>
          </div>
        </div>
      `;
    } else if (activeMiniGame.type === 'binary') {
      container.innerHTML = `
        <div style="background: rgba(0,0,0,0.4); border: 2px solid var(--color-purple); padding: 20px; border-radius: 12px; grid-column: span 1; width: 100%; text-align: center; box-sizing: border-box;">
          <h4 style="color: var(--color-purple); margin-bottom: 8px; font-family: 'Press Start 2P', monospace; font-size: 0.8rem;">💾 DRM Crack: Binary Matcher</h4>
          <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 15px;">Click the button that matches the target key to crack the rival's DRM:</p>

          <div style="font-size: 1.8rem; font-weight: 800; color: #ffd700; margin-bottom: 20px; font-family: monospace; letter-spacing: 2px;">
            TARGET: ${activeMiniGame.targetSequence}
          </div>

          <div style="display: grid; grid-template-columns: 1fr; gap: 10px; margin-bottom: 15px;">
            ${activeMiniGame.options.map(opt => {
              return `<button class="btn-primary" style="padding: 12px; font-size: 1rem; font-family: monospace;" onclick="clickGigBinary('${opt}')">${opt}</button>`;
            }).join("")}
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <button class="btn-secondary" style="width: 100%; padding: 12px; border-color: rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">ABORT</button>
          </div>

          <div class="status-bar-track" style="height: 6px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width: 100%; height: 100%; background: var(--color-purple);"></div>
          </div>
        </div>
      `;
    } else if (activeMiniGame.type === 'trace') {
      container.innerHTML = `
        <div style="background: rgba(0,0,0,0.5); border: 2px solid #ff1744; padding: 20px; border-radius: 12px; grid-column: span 1; width: 100%; text-align: center; box-sizing: border-box;">
          <h4 style="color: #ff1744; margin-bottom: 8px; font-family: 'Press Start 2P', monospace; font-size: 0.8rem;">🎯 Ransomware: Trace Evader</h4>
          <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 15px;">Locate and click the numbers 1, 2, 3, 4 in ascending order to bypass security tracing!</p>

          <div style="position: relative; height: 180px; background: #08080a; border: 2px dashed #ff1744; border-radius: 8px; margin-bottom: 15px; overflow: hidden;">
            ${activeMiniGame.coords.map(coord => {
              const isNext = coord.num === activeMiniGame.currentNumber;
              const isClicked = coord.num < activeMiniGame.currentNumber;
              const opacity = isClicked ? 0.2 : 1;
              const pointerEvents = isClicked ? 'none' : 'auto';
              const borderGlow = isNext ? 'box-shadow: 0 0 10px #39ff14; border-color: #39ff14; color: #39ff14;' : 'border-color: #ff1744; color: #ff1744;';
              return `
                <button class="btn-primary" style="position: absolute; top: ${coord.top}%; left: ${coord.left}%; padding: 8px 14px; font-size: 1.1rem; border-radius: 50% !important; min-width: 40px; min-height: 40px; transform: translate(-50%, -50%); transition: all 0.2s ease-in-out; opacity: ${opacity}; pointer-events: ${pointerEvents}; ${borderGlow}" onclick="clickGigMatrix(${coord.num})">
                  ${coord.num}
                </button>
              `;
            }).join("")}
          </div>

          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <button class="btn-secondary" style="width: 100%; padding: 12px; border-color: rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">ABORT</button>
          </div>

          <div class="status-bar-track" style="height: 6px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width: 100%; height: 100%; background: #ff1744;"></div>
          </div>
        </div>
      `;
    } else if (activeMiniGame.type === 'ping') {
      container.innerHTML = `
        <div style="background: rgba(0,0,0,0.4); border: 2px solid #ffd700; padding: 20px; border-radius: 12px; grid-column: span 1; width: 100%; text-align: center; box-sizing: border-box;">
          <h4 style="color: #ffd700; margin-bottom: 8px; font-family: 'Press Start 2P', monospace; font-size: 0.8rem;">⚡ DDoS platform: Ping Spammer</h4>
          <p style="font-size: 0.8rem; color: var(--color-text-muted); margin-bottom: 15px;">Spam the PING button ${activeMiniGame.targetClicks} times to overwhelm their database cluster!</p>

          <div style="font-size: 2.2rem; font-weight: 800; color: #ffd700; margin-bottom: 15px; font-family: monospace;">
            ${activeMiniGame.clicksCount} / ${activeMiniGame.targetClicks}
          </div>

          <button class="btn-primary" style="width: 100%; padding: 20px; font-size: 1.3rem; margin-bottom: 15px; background: #ffd700; color: #000; font-family: 'Press Start 2P', monospace;" onclick="clickGigPing()">
            💥 PING!
          </button>

          <div style="display: flex; gap: 10px; margin-bottom: 12px;">
            <button class="btn-secondary" style="width: 100%; padding: 12px; border-color: rgba(255,23,68,0.3); color:#ff1744;" onclick="cancelMiniGame()">ABORT</button>
          </div>

          <div class="status-bar-track" style="height: 6px;">
            <div class="status-bar-fill" id="minigame-timer-bar" style="width: 100%; height: 100%; background: #ffd700;"></div>
          </div>
        </div>
      `;
    }
    return;
  }

  container.innerHTML = GIGS.map(gig => {
    const dossier = GIG_DOSSIERS[gig.id] || { title: gig.name, desc: gig.label, dossier: gig.label };
    const xpCost = getGigXpCost(gig.id);
    const successPct = Math.round(gig.successRate * 100);
    return `
      <div class="card-item">
        <div class="card-item-title">
          <span>${dossier.title}</span>
          <span style="color: #ff1744; display:flex; gap:8px;"><span>-${gig.nerveCost} 🎯</span> <span style="color:var(--color-cyan); font-weight:bold;">-${xpCost} XP</span></span>
        </div>
        <div class="card-item-desc" style="line-height:1.4;">
          ${dossier.desc}<br>
          <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-top: 4px; font-style: italic;">
            <strong>Dossier:</strong> ${dossier.dossier}
          </span>
        </div>
        <div class="card-item-meta">
          <span>💵 Payout: $${gig.rewardMin.toLocaleString()} - $${gig.rewardMax.toLocaleString()}</span>
          <span>📈 Client Reliability: ${successPct}%</span>
        </div>
        <button class="btn-primary" onclick="runGig('${gig.id}')">Perform Gig</button>
      </div>
    `;
  }).join("");
}

function stopCoffeePour() {
  if (!activeMiniGame || activeMiniGame.type !== 'pour') return;
  if (miniGameTimer) clearInterval(miniGameTimer);

  const pos = activeMiniGame.pointerPosition;
  if (pos >= activeMiniGame.greenZoneStart && pos <= activeMiniGame.greenZoneEnd) {
    successMiniGame();
  } else {
    failMiniGame("Poured coffee on keyboard!");
  }
}

function stopGigSlider() {
  if (!activeMiniGame || activeMiniGame.type !== 'slider') return;
  if (miniGameTimer) clearInterval(miniGameTimer);

  const pos = activeMiniGame.needlePosition;
  if (pos >= activeMiniGame.greenZoneStart && pos <= activeMiniGame.greenZoneEnd) {
    successMiniGame();
  } else {
    failMiniGame("Layout misaligned! Pizzeria image overflowed.");
  }
}

function clickGigBinary(selectedOption) {
  if (!activeMiniGame || activeMiniGame.type !== 'binary') return;
  if (miniGameTimer) clearInterval(miniGameTimer);

  if (selectedOption === activeMiniGame.targetSequence) {
    successMiniGame();
  } else {
    failMiniGame("Encryption mismatch! Security alarm triggered.");
  }
}

function clickGigMatrix(num) {
  if (!activeMiniGame || activeMiniGame.type !== 'trace') return;

  if (num === activeMiniGame.currentNumber) {
    activeMiniGame.currentNumber += 1;
    if (activeMiniGame.currentNumber > 4) {
      if (miniGameTimer) clearInterval(miniGameTimer);
      successMiniGame();
    } else {
      renderGigsBoard();
      updateUI();
    }
  } else {
    if (miniGameTimer) clearInterval(miniGameTimer);
    failMiniGame("Tracing active! Wrong node order selected.");
  }
}

function clickGigPing() {
  if (!activeMiniGame || activeMiniGame.type !== 'ping') return;

  activeMiniGame.clicksCount += 1;
  if (activeMiniGame.clicksCount >= activeMiniGame.targetClicks) {
    if (miniGameTimer) clearInterval(miniGameTimer);
    successMiniGame();
  } else {
    renderGigsBoard();
    updateUI();
  }
}

function finishGig(gigId, wasSuccess) {
  const gig = GIGS.find(g => g.id === gigId);
  if (!gig) return;

  if (wasSuccess) {
    let payout = Math.floor(Math.random() * (gig.rewardMax - gig.rewardMin + 1)) + gig.rewardMin;
    const reliabilityBonus = Math.floor(payout * gig.successRate * 0.15);
    payout += reliabilityBonus;
    gameState.cash += payout;

    gameState[gig.skillRequired] += gig.xpReward;

    const xpRewardGained = gig.xpReward * 6;
    const bonusNote = reliabilityBonus > 0 ? ` (+$${reliabilityBonus} repeat-client tip)` : "";

    addLog(`SUCCESS: ${gig.name}`, `Earned $${payout}${bonusNote}, gained +${gig.xpReward} in ${gig.skillRequired.replace("_skill", "")}, and gained +${xpRewardGained} XP. VPN logs shredded.`);
    showToast(`Gig Success! +$${payout}${bonusNote}`, "success");
    if (window.SynthwaveAudio) SynthwaveAudio.playSFX("cash");

    gainXP(xpRewardGained);
  } else {
    const penalty = Math.floor(gig.rewardMin * (0.25 + (1 - gig.successRate) * 0.45));
    gameState.cash = Math.max(0, gameState.cash - penalty);

    const failLines = [
      "Busted by network firewalls. Lost money and dignity.",
      "Caught by an intern with a Wireshark hobby. Penalties applied.",
      "Your smart toaster botnet betrayed you to IT. Classic."
    ];
    const failLine = failLines[Math.floor(Math.random() * failLines.length)];
    addLog(`FAILURE: ${gig.name}`, `${failLine} Lost $${penalty} in server penalties.`);
    showToast(`Gig Failed! Lost $${penalty}`, "error");
  }

  saveGame();
  renderGigsBoard();
  updateUI();
}

window.cancelMiniGame = cancelMiniGame;
window.stopCoffeePour = stopCoffeePour;
window.stopGigSlider = stopGigSlider;
window.clickGigBinary = clickGigBinary;
window.clickGigMatrix = clickGigMatrix;
window.clickGigPing = clickGigPing;
window.renderDeveloperStore = renderDeveloperStore;
window.renderGigsBoard = renderGigsBoard;


