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

  if (window.init3DScene) {
    window.init3DScene();
  }
});

// --- Tab System ---
function initTabs() {
  const tabs = document.querySelectorAll("nav.nav-tabs a");
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      // Allow navigation tab updates locally for non-anchor tabs
      const href = tab.getAttribute("href");
      if (href.startsWith("index.html?tab=")) {
        e.preventDefault();
        const tabName = href.split("=")[1];
        switchTab(tabName);
        window.history.pushState({}, "", href);
      }
    });
  });
}

function switchTab(tabName) {
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

  // Highlight tab
  const activeLink = document.querySelector(`nav.nav-tabs a[href="index.html?tab=${tabName}"]`);
  if (activeLink) {
    activeLink.classList.add("active");
  }

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
    // Play chiptune release fanfare for Level Up!
    setTimeout(() => {
      if (window.ChiptuneAudio) ChiptuneAudio.playSFX("release");
    }, 100);
    addLog("LEVEL UP!", `Congratulations! You reached Dev Level ${gameState.level}! Max Energy: ${gameState.max_energy}, Max Nerve: ${gameState.max_nerve}.`);
    showToast(`✨ LEVEL UP! Level ${gameState.level} reached!`, "success");
    
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

  if (window.drawAuxScreen) {
    window.drawAuxScreen();
  }

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
  const gameNameInput = document.getElementById("game-name-input");
  const randomNameBtn = document.getElementById("random-name-btn");

  if (randomNameBtn && gameNameInput) {
    randomNameBtn.addEventListener("click", () => {
      const prefixes = ["Half-Baked", "Glitchy", "Spaghetti", "Cyber-Trash", "Buggy", "Pixel-Art", "Microtransaction", "AI-Generated", "Unfinished", "Pre-Alpha", "Pay-to-Win", "Crunch-Time"];
      const suffixes = ["Simulator", "Fiasco", "Disaster", "Tycoon", "Dead-End", "Keyboard-Smasher", "Asset-Flip", "Refund-Edition", "Spaghetti-Code", "Crash-Simulator", "Crunch-Edition"];
      const r1 = prefixes[Math.floor(Math.random() * prefixes.length)];
      const r2 = suffixes[Math.floor(Math.random() * suffixes.length)];
      gameNameInput.value = `${r1} ${r2}`;
    });
  }
}

// --- Game Tick Loops (1s) ---
function gameTick() {
  // 1. Regenerate Energy and Nerve
  // Energy: 5 per 60 ticks (1/12), boosted 1.5x by ergonomic chairs upgrade
  if (gameState.energy < gameState.max_energy) {
    const recoveryBonus = gameState.ergonomic_chairs ? 1.5 : 1.0;
    gameState.energy = Math.min(gameState.max_energy, gameState.energy + (5 / 60) * recoveryBonus);
  }
  // Nerve: 1 per 60 ticks (1/60)
  if (gameState.nerve < gameState.max_nerve) {
    gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + (1 / 60));
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
        
        const isDead = g.age >= 120 || (g.totalRevenue || 0) >= cap;
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

  updateUI();
}

// --- Target point targets based on Dev scale ---
function getTargetPointsForScale(scale) {
  switch (scale) {
    case "Small": return 30;
    case "Medium": return 100;
    case "Large": return 300;
    case "AAA": return 1000;
    default: return 30;
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

  // Dashboard indicators
  const dbCompanyName = document.getElementById("db-company-name");
  const dbOfficeName = document.getElementById("db-office-name");
  const dbNetWorth = document.getElementById("db-net-worth");
  const dbReleased = document.getElementById("db-released");
  const dbSold = document.getElementById("db-sold");
  const dbEmployees = document.getElementById("db-employees");
  const dbResearch = document.getElementById("db-research");

  if (dbCompanyName) dbCompanyName.innerText = gameState.company_name;
  if (dbOfficeName) dbOfficeName.innerText = gameState.office_tier;
  if (dbNetWorth) dbNetWorth.innerText = `$${parseFloat(gameState.net_worth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  if (dbReleased) dbReleased.innerText = gameState.games_released;
  if (dbSold) dbSold.innerText = parseInt(gameState.games_sold).toLocaleString();
  if (dbEmployees) dbEmployees.innerText = gameState.employees.length;
  if (dbResearch) dbResearch.innerText = gameState.research_points;

  // Active games list render
  const activeGamesContainer = document.getElementById("active-games-list");
  if (activeGamesContainer) {
    if (gameState.active_games.length === 0) {
      activeGamesContainer.innerHTML = `<div class="terminal-line" style="color: var(--color-text-muted); font-style: italic;">No active products generating sales.</div>`;
    } else {
      activeGamesContainer.innerHTML = gameState.active_games.map((game, index) => {
        const remainingTicks = Math.max(0, 240 - game.age);
        const agePercent = Math.min(100, (game.age / 240) * 100);
        const curIncome = (game.initialSalesRate * Math.exp(-game.age / 90) * game.price * 0.70);
        return `
          <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.03); padding: 12px; border-radius: 10px; margin-bottom: 8px;">
            <div style="display:flex; justify-content:space-between; font-weight:bold; font-size:0.9rem;">
              <span>${game.name} (${game.genre}/${game.topic})</span>
              <span style="color:#39ff14;">+ $${curIncome.toFixed(1)}/s</span>
            </div>
            <div style="font-size:0.75rem; color:var(--color-text-muted); margin-top:4px; display:flex; justify-content:space-between;">
              <span>Rating: ${game.rating.toFixed(1)}/10 | Sold: ${game.totalSold.toLocaleString()} copies</span>
              <span>Shelf Life: ${remainingTicks}s left</span>
            </div>
            <div class="status-bar-track" style="height: 4px; margin-top: 6px;">
              <div class="status-bar-fill" style="width: ${100 - agePercent}%; height:100%; background: var(--color-cyan);"></div>
            </div>
            <div style="display:flex; gap:8px; margin-top:8px;">
              <button class="btn-secondary" style="padding:4px 8px; font-size:0.7rem; flex:1;" onclick="runMarketing(${index}, 'social')">📱 Social Hype ($200)</button>
              <button class="btn-secondary" style="padding:4px 8px; font-size:0.7rem; flex:1;" onclick="runMarketing(${index}, 'pr')">📰 PR Blitz ($800)</button>
            </div>
          </div>
        `;
      }).join("");
    }
  }

  // Portfolio list render
  const portfolioContainer = document.getElementById("portfolio-games-list");
  if (portfolioContainer) {
    if (!gameState.portfolio || gameState.portfolio.length === 0) {
      portfolioContainer.innerHTML = `<div class="terminal-line" style="color: var(--color-text-muted); font-style: italic;">No games published yet. Go to 'Develop Game' to start!</div>`;
    } else {
      portfolioContainer.innerHTML = gameState.portfolio.map(game => {
        return `
          <div style="background: rgba(255,255,255,0.005); border: 1px solid rgba(255,255,255,0.02); padding: 10px; border-radius: 8px; display:flex; justify-content:space-between; font-size:0.8rem; margin-bottom: 6px;">
            <div>
              <strong>${game.name}</strong> (${game.genre}/${game.topic})
              <div style="font-size:0.7rem; color:var(--color-text-muted); margin-top:2px;">Rating: ${game.rating.toFixed(1)}/10</div>
            </div>
            <div style="text-align:right;">
              <div>Sold: ${parseInt(game.totalSold).toLocaleString()} copies</div>
              <div style="font-size:0.7rem; color:#39ff14; margin-top:2px;">Rev: $${parseFloat(game.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}</div>
            </div>
          </div>
        `;
      }).reverse().join("");
    }
  }

  // Active project progress rendering in Dev Panel
  if (gameState.current_project) {
    if (gameState.current_project.phase === "post_release") {
      renderPostReleaseDashboard();
    } else if (!activeMiniGame) {
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

  if (window.drawMainScreen) {
    window.drawMainScreen();
  }
  if (window.drawAuxScreen) {
    window.drawAuxScreen();
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

  let xpCost = 3;
  if (gigId === "crack_competitor") xpCost = 10;
  else if (gigId === "ransomware") xpCost = 20;
  else if (gigId === "ddos_rival") xpCost = 40;

  if (gameState.level === 1 && gigId === "freelance_html") {
    xpCost = 0;
  }

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

  if (gigId === "freelance_html") {
    activeMiniGame = {
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
    };
  } else if (gigId === "crack_competitor") {
    const { target, options } = generateBinaryMatcherState();
    activeMiniGame = {
      type: "binary",
      isGig: true,
      gigId: gigId,
      duration: 10000,
      elapsed: 0,
      targetSequence: target,
      options: options
    };
  } else if (gigId === "ransomware") {
    let coords = [];
    for (let i = 1; i <= 4; i++) {
      coords.push({
        num: i,
        top: Math.floor(Math.random() * 50) + 20,
        left: Math.floor(Math.random() * 70) + 15
      });
    }
    activeMiniGame = {
      type: "trace",
      isGig: true,
      gigId: gigId,
      duration: 12000,
      elapsed: 0,
      currentNumber: 1,
      coords: coords
    };
  } else if (gigId === "ddos_rival") {
    activeMiniGame = {
      type: "ping",
      isGig: true,
      gigId: gigId,
      duration: 7000,
      elapsed: 0,
      clicksCount: 0,
      targetClicks: 15
    };
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
  gameState.employees.splice(index, 1);

  addLog("Staff Dismissed", `Fired employee index #${index + 1} (${emp.name}).`);
  showToast(`${emp.name} was dismissed.`, "info");

  saveGame();
  renderStaffPanel();
  updateUI();
}

// --- Development Panel ---
function renderDevelopPanel() {
  const devPanel = document.getElementById("develop-panel-content");
  if (!devPanel) return;

  if (!gameState.current_project) {
    // Project initiation form
    devPanel.innerHTML = `
      <div style="display:flex; flex-direction:column; gap:16px;">
        <div style="background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.04); padding: 20px; border-radius: 16px;">
          <h3 style="margin-bottom:12px;">Start a New Game Project</h3>
          
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
                <option value="Small">Small (10 Energy action cost)</option>
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
    showToast("You must research '3D Graphics Engine' first to target Console platforms!", "error");
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
  gameState.current_project = {
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
    miniGamesPlayed: 0,
    miniGamesWon: 0,
    miniGamesLost: 0
  };

  addLog("Project Started", `Initiated development of '${name}' (${genre}/${topic}) on ${PLATFORMS[platformKey].name}. Budget spent: $${totalCost}.`);
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
  const energyCost = isTraining ? 10 : 5;
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
    addLog("Gig Cancelled", "Aborted gig mid-execution. Focus and nerve costs were lost in the network noise.");
    showToast("Gig Aborted!", "error");
    renderGigsBoard();
    updateUI();
    return;
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

  if (type === 'code') {
    const pointsGained = target;
    gameState.current_project.tech_points += pointsGained;
    gameState.coding_skill += 1;

    addLog("Syntax Striker Success!", `Correctly typed code snippet. Gained +${pointsGained} Tech Points (50% Project Progress) and +1 Coding Skill.`);
    showToast(`Code success! +${pointsGained} Tech Points (50% Progress)`, "success");
  } else if (type === 'design') {
    const pointsGained = target;
    gameState.current_project.design_points += pointsGained;
    gameState.design_skill += 1;

    addLog("Color Matcher Success!", `Matched target design color resonance. Gained +${pointsGained} Design Points (50% Project Progress) and +1 Design Skill.`);
    showToast(`Design success! +${pointsGained} Design Points (50% Progress)`, "success");
  } else if (type === 'polish') {
    const bugsRemoved = Math.floor(Math.random() * 8) + 8 + Math.floor(gameState.management_skill / 8);
    gameState.current_project.bug_points = Math.max(0, gameState.current_project.bug_points - bugsRemoved);
    gameState.management_skill += 1;

    addLog("Bug Squasher Success!", `Squashed compiler bugs. Removed -${bugsRemoved} bugs and gained +1 Management.`);
    showToast(`Polished game! Removed -${bugsRemoved} Bugs`, "success");
  }

  gainXP(5);
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

  saveGame();
  renderProjectProgress();
  updateUI();
}

function renderProjectProgress() {
  const devPanel = document.getElementById("develop-panel-content");
  if (!devPanel || !gameState.current_project) return;

  const proj = gameState.current_project;
  const target = getTargetPointsForScale(proj.scale);
  const totalPoints = proj.tech_points + proj.design_points;
  const progressPercent = Math.min(100, (totalPoints / (target * 2)) * 100);

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

  devPanel.innerHTML = `
    <div class="develop-progress-card">
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <h3 style="font-size:1.1rem; color:var(--color-cyan);">${proj.name}</h3>
        <span style="font-size:0.75rem; text-transform:uppercase; letter-spacing:1px; color:var(--color-text-muted);">${proj.scale} Project</span>
      </div>
      
      <div style="font-size:0.85rem; color:var(--color-text-muted); display:flex; flex-direction:column; gap:4px;">
        <div>Topic: <strong>${proj.topic}</strong> | Genre: <strong>${proj.genre}</strong></div>
        <div>Platform: <strong>${PLATFORMS[proj.platform].name}</strong></div>
      </div>

      <!-- Tech vs Design indicators -->
      <div style="display:grid; grid-template-columns: 1fr 1fr 1fr; gap:12px; margin-top:8px;">
        <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:10px; border-radius:10px; text-align:center;">
          <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase;">Tech Points</span>
          <div style="font-size:1.2rem; font-weight:bold; color:var(--color-cyan); margin-top:4px;">${Math.floor(proj.tech_points)}</div>
        </div>
        <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:10px; border-radius:10px; text-align:center;">
          <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase;">Design Points</span>
          <div style="font-size:1.2rem; font-weight:bold; color:var(--color-purple); margin-top:4px;">${Math.floor(proj.design_points)}</div>
        </div>
        <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:10px; border-radius:10px; text-align:center;">
          <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase;">Bugs</span>
          <div style="font-size:1.2rem; font-weight:bold; color:#ff1744; margin-top:4px;">${Math.floor(proj.bug_points)}</div>
        </div>
      </div>

      <!-- Completion bar -->
      <div class="status-bar-container" style="margin-top:10px;">
        <div class="status-bar-header">
          <span>Project Completion</span>
          <span>${Math.floor(progressPercent)}%</span>
        </div>
        <div class="status-bar-track">
          <div class="status-bar-fill" style="width: ${progressPercent}%; height:100%; background: linear-gradient(90deg, var(--color-cyan), var(--color-purple));"></div>
        </div>
      </div>

      <div style="font-size:0.8rem; color:var(--color-text-muted); line-height:1.4; margin-top:5px; text-align:center;">
        💡 Click on a task to play a mini-game and generate code/art features! Costs <strong>5 energy</strong> per play.
      </div>

      <!-- Interactive develop actions -->
      <div style="display:flex; gap:10px; margin-top:10px;">
        <button class="btn-primary" style="flex:1; background:rgba(0,229,255,0.08); border-color:var(--color-cyan); color:#fff;" onclick="startMiniGame('code')">
          ⌨️ Code Game (Mini-game)
        </button>
        <button class="btn-primary" style="flex:1; background:rgba(179,136,255,0.08); border-color:var(--color-purple); color:#fff;" onclick="startMiniGame('design')">
          🎨 Match Assets (Mini-game)
        </button>
        <button class="btn-primary" style="flex:1; background:rgba(255,23,68,0.08); border-color:#ff1744; color:#fff;" onclick="startMiniGame('polish')">
          🔧 Squash Bugs (Mini-game)
        </button>
      </div>

      <button class="btn-primary" style="margin-top:10px; background:#39ff14; border-color:#39ff14; color:#000;" ${progressPercent < 90 ? "disabled" : ""} onclick="releaseGameProject()">
        🚀 Release & Sell Game
      </button>
      <button class="btn-primary nuke-btn" style="margin-top:10px; background:rgba(255,23,68,0.15); border-color:#ff1744; color:#fff;" onclick="nukeGameProject()">
        💥 Nuke Project (Cancel & Delete)
      </button>
    </div>
  `;
}

function releaseGameProject() {
  if (!gameState.current_project) return;
  const proj = gameState.current_project;

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
  if (gameNum === 0) cap = 0.50;
  else if (gameNum === 1) cap = 3.00;
  else if (gameNum === 2) cap = 10.00;

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

  addLog("Game Released!", `'${proj.name}' was published! Shelf revenue generating (Max Revenue Cap: $${cap.toFixed(2)}). Gained +${totalXPGained} XP.`);
  showToast(`Released '${proj.name}'! Rating: ${rating.toFixed(1)}/10`, "success");
  
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
      if (window.drawLeaderboardWallPoster) window.drawLeaderboardWallPoster();
      renderLeaderboardRows(container, simulated);
      return;
    }

    window.leaderboardCache = list;
    if (window.drawLeaderboardWallPoster) window.drawLeaderboardWallPoster();
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
    ageReduction = 30; // Extend life by 30 ticks
    label = "Social Media Hype";
    xpCost = 5;
  } else if (campaignType === "pr") {
    cost = 800;
    multiplier = 1.60;
    ageReduction = 80; // Extend life by 80 ticks
    label = "PR Blitz Campaign";
    xpCost = 15;
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

  addLog("Marketing Campaign Launched", `Promoted '${game.name}' via ${label} for $${cost}. Sales rate boosted by +${Math.round((multiplier - 1) * 100)}% and shelf life extended.`);
  showToast(`Launched ${label}! Sales boosted`, "success");

  saveGame();
  updateUI();
}

// --- Research Laboratory Upgrades ---
function renderResearchLab() {
  const container = document.getElementById("research-upgrades-list");
  if (!container) return;

  const upgrades = [
    {
      id: "unlocked_console",
      name: "3D Cube spinning renderer (Graphics!)",
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

  if (activityType === "pizza_party") {
    gameState.energy = Math.min(gameState.max_energy, gameState.energy + energyGain);
    addLog("Hosted Pizza Party", `Spent $${cost} and 10 XP to host a pizza party. Gained +35 Energy.`);
    showToast("Wood-fired pizzas delivered! +35 Energy", "success");
  } else if (activityType === "hackathon") {
    gameState.research_points += researchGain;
    addLog("Started Hackathon", `Spent $${cost} and 25 XP to organize a hackathon. Gained +15 Research Points.`);
    showToast("Hackathon complete! +15 RP", "success");
  } else if (activityType === "dev_con") {
    gameState.research_points += researchGain;
    gameState.coding_skill += skillGain;
    gameState.design_skill += skillGain;
    addLog("Attended DevCon", `Spent $${cost} and 50 XP to attend DevCon. Gained +20 Research Points and +5 Coding & Design.`);
    showToast("DevCon complete! +20 RP, +5 Skills", "success");
  } else if (activityType === "chairs") {
    gameState.ergonomic_chairs = true;
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

  const proj = gameState.current_project;
  
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
  const curIncome = activeGame ? (activeGame.initialSalesRate * Math.exp(-activeGame.age / 90) * activeGame.price * 0.70) / 20 : 0;
  const isSelling = !!activeGame;

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
        <p style="font-size:0.8rem; color:var(--color-text-muted); margin-bottom:12px; line-height:1.4;">Click the grid cells to collect 3 apples and squash launch bugs to increase critic reviews score rating by <strong>+1.0</strong>!</p>
        
        <div style="display:grid; grid-template-columns: repeat(4, 1fr); gap:8px; max-width:240px; margin: 0 auto 10px;">
          ${cells.map(i => {
            const hasApple = i === proj.appleIndex;
            return `
              <button class="btn-secondary" style="padding:0; font-size:1.2rem; display:flex; justify-content:center; align-items:center; min-height:48px; border-radius:6px; cursor:pointer;" onclick="clickPatchGrid(${i})">
                ${hasApple ? "🍎" : ""}
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

  devPanel.innerHTML = `
    <div class="develop-progress-card" style="gap:20px;">
      <!-- Title & Scale -->
      <div style="display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid rgba(255,255,255,0.06); padding-bottom:12px; flex-wrap:wrap; gap:10px;">
        <div>
          <h3 style="font-size:1.3rem; color:var(--color-cyan); margin:0;">${proj.name} (Post-Release)</h3>
          <span style="font-size:0.75rem; color:var(--color-text-muted); text-transform:uppercase;">${proj.scale} Project | ${proj.genre} / ${proj.topic}</span>
        </div>
        <div style="text-align:right; display:flex; align-items:center; gap:10px;">
          <div style="text-align:right;">
            <div class="reviewer-score-badge" style="width:50px; height:50px; border-color:${badgeColor}; color:${badgeColor}; background:${badgeBg}; box-shadow:0 0 10px ${badgeBg}; margin:0 auto; font-size:1.1rem; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:800;">
              ${proj.rating.toFixed(1)}
            </div>
            <span style="font-size:0.6rem; color:var(--color-text-muted); text-transform:uppercase; margin-top:2px; display:block;">Metacritic</span>
          </div>
        </div>
      </div>

      <div style="display:grid; grid-template-columns: 1fr 1fr; gap:20px;">
        <!-- Left: Reviews & Social Feed -->
        <div style="display:flex; flex-direction:column; gap:15px;">
          <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:15px; border-radius:12px;">
            <h4 style="margin-bottom:8px; font-size:0.85rem; text-transform:uppercase; color:var(--color-purple);">Critic Reviews</h4>
            <div style="display:flex; flex-direction:column; gap:8px;">
              ${proj.reviewers.map(rev => {
                let revNameColor = "#fff";
                if (rev.name === "IGNion") revNameColor = "#ff1744";
                else if (rev.name === "GameSpotter") revNameColor = "#ffd700";
                else if (rev.name === "Metacritic rating" || rev.name === "Metacritic") revNameColor = "#39ff14";
                const displayRevName = rev.name === "Metacritic rating" ? "Metacritic" : rev.name;
                const commentText = rev.comments ? (rev.comments[proj.commentIndex] || rev.comments[0] || "No comment.") : "No comment.";
                return `
                  <div style="font-size:0.78rem; line-height:1.4;">
                    <strong style="color:${revNameColor};">${displayRevName}</strong>: "${commentText}"
                  </div>
                `;
              }).join("")}
            </div>
          </div>

          <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:15px; border-radius:12px;">
            <h4 style="margin-bottom:8px; font-size:0.85rem; text-transform:uppercase; color:var(--color-cyan);">Crowd & Social Feed</h4>
            <div style="display:flex; flex-direction:column; gap:6px;">
              ${proj.cachedTweets.map(t => {
                return `
                  <div style="font-size:0.75rem; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:6px; display:flex; gap:6px;">
                    <span style="color:var(--color-cyan); font-weight:600;">@gamer_${t.user}</span>
                    <span style="color:var(--color-text-muted); font-style:italic;">"${t.text}"</span>
                  </div>
                `;
              }).join("")}
            </div>
          </div>
        </div>

        <!-- Right: Sales Stats & Patch Mini-game -->
        <div style="display:flex; flex-direction:column; gap:15px;">
          <div style="background:rgba(255,255,255,0.01); border:1px solid rgba(255,255,255,0.03); padding:15px; border-radius:12px;">
            <h4 style="margin-bottom:8px; font-size:0.85rem; text-transform:uppercase; color:#39ff14;">Sales Statistics</h4>
            <div style="font-size:0.8rem; display:flex; flex-direction:column; gap:6px;">
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:4px;">
                <span>Status:</span>
                <span style="font-weight:bold; color:${isSelling ? "#39ff14" : "var(--color-text-muted)"};">${isSelling ? "Active Sales" : "Concluded"}</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:4px;">
                <span>Current Velocity:</span>
                <span style="font-weight:bold; color:#39ff14;">+ $${curIncome.toFixed(1)}/s</span>
              </div>
              <div style="display:flex; justify-content:space-between; border-bottom:1px solid rgba(255,255,255,0.02); padding-bottom:4px;">
                <span>Copies Sold:</span>
                <span style="font-weight:bold;">${parseInt(totalSold).toLocaleString()} copies</span>
              </div>
              <div style="display:flex; justify-content:space-between; padding-bottom:2px;">
                <span>Total Revenue:</span>
                <span style="font-weight:bold; color:#39ff14;">$${parseFloat(totalRevenue).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}</span>
              </div>
            </div>
          </div>

          ${patchHtml}

          <!-- Live Ops Actions -->
          <div style="background: rgba(0,0,0,0.3); border: 1px solid var(--color-purple); padding: 15px; border-radius: 12px; margin-top: 5px;">
            <h4 style="color:var(--color-purple); margin-bottom: 6px; font-size:0.85rem; text-transform:uppercase;">
              <span>🚀 Support & Live Ops Actions</span>
            </h4>
            <p style="font-size:0.75rem; color:var(--color-text-muted); margin-bottom:10px; line-height:1.3;">Add DLC features or start ad campaigns to revive sales!</p>
            
            <div style="display:flex; gap:10px;">
              <button class="btn-primary" style="flex:1; font-size:0.75rem; padding:8px;" onclick="supportActiveProject('dlc')">
                Release DLC Update<br><span style="font-size:0.65rem; color:#ffd700;">-$150 | -15⚡</span>
              </button>
              <button class="btn-primary" style="flex:1; font-size:0.75rem; padding:8px;" onclick="supportActiveProject('marketing')">
                Launch Hype Ads<br><span style="font-size:0.65rem; color:#ffd700;">-$100 | -5⚡</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap; width:100%;">
        <button class="btn-primary" style="flex:2; min-width:200px; background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.1); color:#fff; padding:12px; border-radius:8px;" onclick="concludeGameProject()">
          💼 Conclude Project & Return to Studio
        </button>
        <button class="btn-primary nuke-btn" style="flex:1; min-width:120px; background:rgba(255,23,68,0.15); border-color:#ff1744; color:#fff; padding:12px; border-radius:8px;" onclick="nukeGameProject()">
          💥 Nuke Game (Store Pull)
        </button>
      </div>
    </div>
  `;
}

function getSimulatedSocialFeed(rating, name) {
  const users = ["alpha_coder", "indie_fan", "console_cowboy", "pixel_purist", "noob_slayer", "hype_beast"];
  
  let comments = [];
  if (rating >= 8.0) {
    comments = [
      `I looked at the binary. The compilers themselves wept at the efficiency. 10/10.`,
      `I sold my kidney to buy the launch DLC for ${name}. Totally worth it.`,
      `I've been playing ${name} for 24 hours. My family misses me.`,
      `The shadow effects in ${name} are so smooth I am literally crying.`
    ];
  } else if (rating < 5.0) {
    comments = [
      `The code for ${name} is held together by sticky tape and thoughts. Avoid.`,
      `My GPU literally started smoking when I booted ${name}. Beautiful fire though.`,
      `Wait for the day-one patch, they forgot to compile half the files. Total mess.`,
      `Refunded. Hope the devs release a fix or switch careers.`
    ];
  } else {
    comments = [
      `${name} runs at 60 FPS, but only if you disable the shadows and close Google Chrome.`,
      `Decent game loop, but there's a bug where my character gets stuck in a toilet.`,
      `A solid 7/10. It kept me away from doing my actual software job for a couple of hours.`,
      `Nice vibe, but the buttons are misaligned by exactly 1 pixel.`
    ];
  }

  // Shuffle and pick 3 comments
  const shuffled = comments.sort(() => Math.random() - 0.5);
  return [
    { user: users[0], text: shuffled[0] },
    { user: users[1], text: shuffled[1] },
    { user: users[2], text: shuffled[2] }
  ];
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
      showToast("Bug resolved! Apple squashed!", "success");
    }
  } else {
    showToast("Clicked clean line! Find the 🍎!", "info");
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

  addLog("Day-One Patch Released!", `Metacritic rating for '${proj.name}' improved from ${oldRating.toFixed(1)} to ${proj.rating.toFixed(1)}! Sales rate boosted.`);
  showToast("Patch released! Rating boosted +1.0!", "success");
  
  saveGame();
  renderPostReleaseDashboard();
}

function concludeGameProject() {
  if (!gameState.current_project) return;
  const proj = gameState.current_project;
  addLog("Project Concluded", `Finalized post-release cycle of '${proj.name}'. Returning to studio catalog.`);
  showToast(`Concluded '${proj.name}'!`, "info");
  
  gameState.current_project = null;
  
  saveGame();
  renderDevelopPanel();
  updateUI();
}

function supportActiveProject(actionType) {
  if (!gameState.current_project || gameState.current_project.phase !== "post_release") return;
  const proj = gameState.current_project;
  
  const activeGame = gameState.active_games.find(g => g.name === proj.name);
  if (!activeGame) {
    showToast("This game is no longer active on the market!", "error");
    return;
  }

  if (actionType === "dlc") {
    const cashCost = 150;
    const energyCost = 15;
    if (gameState.cash < cashCost) {
      showToast(`Requires $${cashCost} cash!`, "error");
      return;
    }
    if (gameState.energy < energyCost) {
      showToast(`Requires ${energyCost} Energy!`, "error");
      return;
    }

    if (!confirm(`Are you sure you want to release a DLC Update for '${proj.name}'? Costs $${cashCost} and ${energyCost} Energy.`)) {
      return;
    }

    gameState.cash -= cashCost;
    gameState.energy -= energyCost;
    proj.rating = Math.min(10.0, proj.rating + 0.5);
    activeGame.rating = proj.rating;

    // Recalculate sales rate
    activeGame.initialSalesRate = Math.ceil(activeGame.initialSalesRate * 1.3);

    const portItem = gameState.portfolio.find(p => p.name === proj.name);
    if (portItem) {
      portItem.rating = proj.rating;
      portItem.initialSalesRate = activeGame.initialSalesRate;
    }

    proj.dlcCount = (proj.dlcCount || 0) + 1;
    addLog("DLC Launched", `Released DLC Update #${proj.dlcCount} for '${proj.name}'. Rating boosted to ${proj.rating.toFixed(1)}/10.`);
    showToast("DLC update launched! Sales rate boosted +30%!", "success");
  } else if (actionType === "marketing") {
    const cashCost = 100;
    const energyCost = 5;
    if (gameState.cash < cashCost) {
      showToast(`Requires $${cashCost} cash!`, "error");
      return;
    }
    if (gameState.energy < energyCost) {
      showToast(`Requires ${energyCost} Energy!`, "error");
      return;
    }

    if (!confirm(`Are you sure you want to launch Hype Ads for '${proj.name}'? Costs $${cashCost} and ${energyCost} Energy.`)) {
      return;
    }

    gameState.cash -= cashCost;
    gameState.energy -= energyCost;
    activeGame.decayHalfLife = (activeGame.decayHalfLife || 90) + 45;

    addLog("Community Hype Boosted", `Launched ad blitz for '${proj.name}'. Shelf-life extended.`);
    showToast("Community Hype boosted! Sales decay slowed.", "success");
  }

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

// --- Chiptune Audio Synth Engine (Web Audio API) ---
const ChiptuneAudio = {
  ctx: null,
  isPlaying: false,
  sequencerTimer: null,
  volumeNode: null,
  
  melody: [
    "A3", "C4", "E4", "G4", "A4", "G4", "E4", "C4",
    "D3", "F3", "A3", "C4", "D4", "C4", "A3", "F3",
    "E3", "G3", "B3", "D4", "E4", "D4", "B3", "G3",
    "F3", "A3", "C4", "E4", "F4", "E4", "C4", "A3"
  ],
  
  noteFreqs: {
    "A3": 220.00, "B3": 246.94, "C4": 261.63, "D4": 293.66,
    "E4": 329.63, "F3": 174.61, "F4": 349.23, "G3": 196.00,
    "G4": 392.00, "A4": 440.00, "D3": 146.83, "E3": 164.81
  },

  init() {
    if (this.ctx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    this.ctx = new AudioContext();
    this.volumeNode = this.ctx.createGain();
    this.volumeNode.gain.setValueAtTime(0.04, this.ctx.currentTime); // Low volume melody
    this.volumeNode.connect(this.ctx.destination);
  },

  toggle() {
    this.init();
    if (!this.ctx) return;

    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    if (this.isPlaying) {
      this.stop();
    } else {
      this.start();
    }
  },

  start() {
    this.isPlaying = true;
    let step = 0;
    const stepDuration = 0.25;

    this.sequencerTimer = setInterval(() => {
      if (!this.isPlaying) return;
      const noteName = this.melody[step % this.melody.length];
      const freq = this.noteFreqs[noteName];
      if (freq) {
        this.playPluck(freq, this.ctx.currentTime, stepDuration);
      }
      step++;
    }, 250);
  },

  stop() {
    this.isPlaying = false;
    if (this.sequencerTimer) {
      clearInterval(this.sequencerTimer);
      this.sequencerTimer = null;
    }
  },

  playPluck(freq, startTime, duration) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = "triangle";
    osc.frequency.setValueAtTime(freq, startTime);
    
    const filter = this.ctx.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.setValueAtTime(800, startTime);
    filter.Q.setValueAtTime(1, startTime);

    gain.gain.setValueAtTime(0.5, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.02);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.volumeNode);

    osc.start(startTime);
    osc.stop(startTime + duration);
  },

  playSFX(type) {
    this.init();
    if (!this.ctx) return;
    
    if (this.ctx.state === "suspended") {
      this.ctx.resume();
    }

    const now = this.ctx.currentTime;
    
    if (type === "success") {
      const notes = [261.63, 329.63, 392.00, 523.25]; // C major arpeggio
      notes.forEach((freq, i) => {
        this.playTone(freq, "sine", now + i * 0.08, 0.15, 0.05);
      });
    } else if (type === "fail") {
      this.playTone(150, "sawtooth", now, 0.25, 0.1);
      this.playTone(110, "sawtooth", now + 0.1, 0.25, 0.1);
    } else if (type === "release") {
      const notes = [329.63, 392.00, 523.25, 659.25, 783.99]; // E minor / G fanfare
      notes.forEach((freq, i) => {
        const dur = i === notes.length - 1 ? 0.6 : 0.12;
        this.playTone(freq, "triangle", now + i * 0.1, dur, 0.06);
      });
    } else if (type === "click") {
      this.playTone(600, "sine", now, 0.05, 0.02);
    }
  },

  playTone(freq, type, startTime, duration, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    
    gain.gain.setValueAtTime(vol, startTime);
    gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.01);
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    osc.start(startTime);
    osc.stop(startTime + duration);
  }
};

function toggleMusic() {
  ChiptuneAudio.toggle();
  const btn = document.getElementById("music-toggle-btn");
  if (btn) {
    btn.innerText = ChiptuneAudio.isPlaying ? "🎵 Music: ON" : "🎵 Music: OFF";
    btn.style.borderColor = ChiptuneAudio.isPlaying ? "var(--color-cyan)" : "rgba(255,255,255,0.15)";
    btn.style.color = ChiptuneAudio.isPlaying ? "var(--color-cyan)" : "";
  }
}

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
  
  // Play failure sound
  ChiptuneAudio.playSFX("fail");
  
  // Clear the active project
  gameState.current_project = null;
  
  // Log the cancellation
  addLog("PROJECT NUKED", `'${gameName}' was permanently incinerated and deleted.`);
  
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

window.toggleMusic = toggleMusic;
window.ChiptuneAudio = ChiptuneAudio;
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

  if (window.drawAuxScreen) {
    window.drawAuxScreen();
  }

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

  const getXpCost = (id) => {
    if (id === "freelance_html") return gameState.level === 1 ? 0 : 3;
    if (id === "crack_competitor") return 10;
    if (id === "ransomware") return 20;
    if (id === "ddos_rival") return 40;
    return 0;
  };

  container.innerHTML = `
    <div class="card-item">
      <div class="card-item-title">
        <span>Freelance HTML Edits</span>
        <span style="color: #ff1744; display:flex; gap:8px;"><span>-2 🎯</span> <span style="color:var(--color-cyan); font-weight:bold;">-${getXpCost("freelance_html")} XP</span></span>
      </div>
      <div class="card-item-desc" style="line-height:1.4;">
        Tweak markup code templates for small neighborhood stores. High success rate, small payouts.<br>
        <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-top: 4px; font-style: italic;">
          <strong>Dossier:</strong> Luigi (local pizzeria owner) claims his pizza image is shifting 2px left when clicked. He demands inline styles because bootstrap is "communist spyware". Rot your soul for $50.
        </span>
      </div>
      <div class="card-item-meta">
        <span>💵 Payout: $50 - $100</span>
        <span>📈 Success: 95%</span>
      </div>
      <button class="btn-primary" onclick="runGig('freelance_html')">Perform Gig</button>
    </div>

    <div class="card-item">
      <div class="card-item-title">
        <span>Crack Competitor DRM</span>
        <span style="color: #ff1744; display:flex; gap:8px;"><span>-4 🎯</span> <span style="color:var(--color-cyan); font-weight:bold;">-10 XP</span></span>
      </div>
      <div class="card-item-desc" style="line-height:1.4;">
        Leak files of rival software assets to internet forums. Generates decent returns with moderate risk.<br>
        <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-top: 4px; font-style: italic;">
          <strong>Dossier:</strong> Bypass wobbly DRM loops that melt client CPUs. Upload cracked binaries to retro forums. Gains decent returns and massive street cred among 14-year-olds.
        </span>
      </div>
      <div class="card-item-meta">
        <span>💵 Payout: $200 - $400</span>
        <span>📈 Success: 75%</span>
      </div>
      <button class="btn-primary" onclick="runGig('crack_competitor')">Perform Gig</button>
    </div>

    <div class="card-item">
      <div class="card-item-title">
        <span>Ransomware local server</span>
        <span style="color: #ff1744; display:flex; gap:8px;"><span>-6 🎯</span> <span style="color:var(--color-cyan); font-weight:bold;">-20 XP</span></span>
      </div>
      <div class="card-item-desc" style="line-height:1.4;">
        Infect server of offshore shell companies. High payout but failure results in corporate penalties.<br>
        <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-top: 4px; font-style: italic;">
          <strong>Dossier:</strong> Drop-shipping conglomerate using password "admin123". If you fail, their automatic legal fax bots will flood your parents' fax machine with 8,000 cease-and-desists.
        </span>
      </div>
      <div class="card-item-meta">
        <span>💵 Payout: $800 - $1,500</span>
        <span>📈 Success: 60%</span>
      </div>
      <button class="btn-primary" onclick="runGig('ransomware')">Perform Gig</button>
    </div>

    <div class="card-item">
      <div class="card-item-title">
        <span>DDoS Competitor Platform</span>
        <span style="color: #ff1744; display:flex; gap:8px;"><span>-8 🎯</span> <span style="color:var(--color-cyan); font-weight:bold;">-40 XP</span></span>
      </div>
      <div class="card-item-desc" style="line-height:1.4;">
        Crash concurrent database nodes of giant rivals. Extremely risky, but lucrative rewards.<br>
        <span style="font-size: 0.75rem; color: var(--color-text-muted); display: block; margin-top: 4px; font-style: italic;">
          <strong>Dossier:</strong> Coordinate botnet of 40,000 wobbly smart refrigerators and electric toothbrushes to flood a competitor's servers during their pre-order launch. Highly volatile!
        </span>
      </div>
      <div class="card-item-meta">
        <span>💵 Payout: $3,000 - $6,000</span>
        <span>📈 Success: 45%</span>
      </div>
      <button class="btn-primary" onclick="runGig('ddos_rival')">Perform Gig</button>
    </div>
  `;
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
      if (window.drawMainScreen) drawMainScreen();
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
    if (window.drawMainScreen) drawMainScreen();
  }
}

function finishGig(gigId, wasSuccess) {
  const gig = GIGS.find(g => g.id === gigId);
  if (!gig) return;

  if (wasSuccess) {
    const payout = Math.floor(Math.random() * (gig.rewardMax - gig.rewardMin + 1)) + gig.rewardMin;
    gameState.cash += payout;

    gameState[gig.skillRequired] += gig.xpReward;

    const xpRewardGained = gig.xpReward * 6;

    addLog(`SUCCESS: ${gig.name}`, `Earned $${payout}, gained +${gig.xpReward} in ${gig.skillRequired.replace("_skill", "")}, and gained +${xpRewardGained} XP.`);
    showToast(`Gig Success! +$${payout}`, "success");
    
    gainXP(xpRewardGained);
  } else {
    const penalty = Math.floor(gig.rewardMin * 0.50);
    gameState.cash = Math.max(0, gameState.cash - penalty);

    addLog(`FAILURE: ${gig.name}`, `Busted by network firewalls. Lost $${penalty} in server penalties.`);
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

// ═══════════════════════════════════════════════
// --- THREEJS 3D ARCADE ROOM & SCREEN TEXTURES ---
// ═══════════════════════════════════════════════

/* global THREE */

let mainScreenCanvas, mainScreenCtx, mainScreenTexture;
let auxScreenCanvas, auxScreenCtx, auxScreenTexture;
let leaderboardCanvas, leaderboardCtx, leaderboardTexture;
let scene3D, camera3D, renderer3D;
let cameraTargetPos, cameraTargetLookAt;
let currentCameraPos, currentCameraLookAt;
let mainScreenMesh, auxScreenMesh, coffeeMugMesh, serverRackMesh, leaderboardMesh;

let activeTab = "gigs"; // Default tab
let focusedInputField = null; // 'username' or 'password'
let profileUsernameText = "";
let profilePasswordText = "";

let draftProjectName = "CSS Div Alignment Pro";
let draftGenre = "RPG";
let draftTopic = "Cyberpunk";
let draftPlatform = "pc";
let draftScale = "Small";
let draftMultiplayer = false;

const RANDOM_GAME_NAMES = [
  "Div Align Tycoon", "CSS Centering Quest", "Noodle Compiler", "Stack Overflow Simulator",
  "Git Push Force AAA", "Lukewarm Drip Coffee 3D", "Smart Toaster DDoS", "ChatGPT Prompter",
  "Memory Leak Legends", "Segfault Survivor", "Callback Hell 2026"
];

function init3DScene() {
  const container = document.getElementById("canvas-container");
  if (!container) return;

  // Create canvas drawing buffers
  mainScreenCanvas = document.createElement("canvas");
  mainScreenCanvas.width = 1024;
  mainScreenCanvas.height = 1024;
  mainScreenCtx = mainScreenCanvas.getContext("2d");

  auxScreenCanvas = document.createElement("canvas");
  auxScreenCanvas.width = 512;
  auxScreenCanvas.height = 512;
  auxScreenCtx = auxScreenCanvas.getContext("2d");

  leaderboardCanvas = document.createElement("canvas");
  leaderboardCanvas.width = 512;
  leaderboardCanvas.height = 512;
  leaderboardCtx = leaderboardCanvas.getContext("2d");

  // Create WebGL textures
  mainScreenTexture = new THREE.CanvasTexture(mainScreenCanvas);
  auxScreenTexture = new THREE.CanvasTexture(auxScreenCanvas);
  leaderboardTexture = new THREE.CanvasTexture(leaderboardCanvas);

  // Scene setup
  scene3D = new THREE.Scene();
  scene3D.background = new THREE.Color(0x050508);

  camera3D = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 100);
  
  // Dynamic camera animation values
  cameraTargetPos = new THREE.Vector3(0, 12, 22);
  cameraTargetLookAt = new THREE.Vector3(0, 6, 0);

  currentCameraPos = new THREE.Vector3().copy(cameraTargetPos);
  currentCameraLookAt = new THREE.Vector3().copy(cameraTargetLookAt);

  camera3D.position.copy(currentCameraPos);
  camera3D.lookAt(currentCameraLookAt);

  renderer3D = new THREE.WebGLRenderer({ antialias: true });
  renderer3D.setSize(window.innerWidth, window.innerHeight);
  renderer3D.shadowMap.enabled = true;
  container.appendChild(renderer3D.domElement);

  // Setup room lighting
  const ambientLight = new THREE.AmbientLight(0x181822, 1.2);
  scene3D.add(ambientLight);

  const deskLight = new THREE.SpotLight(0xffb3ff, 5, 30, Math.PI / 4, 0.5, 1);
  deskLight.position.set(0, 18, 5);
  deskLight.target.position.set(0, 4, 0);
  scene3D.add(deskLight);
  scene3D.add(deskLight.target);

  const screenLight = new THREE.PointLight(0x00e5ff, 2.5, 8);
  screenLight.position.set(-2, 7, 3);
  scene3D.add(screenLight);

  const auxLight = new THREE.PointLight(0xb388ff, 2, 6);
  auxLight.position.set(5, 7, 3);
  scene3D.add(auxLight);

  // Desk Assembly Group
  const deskGroup = new THREE.Group();

  const deskGeo = new THREE.BoxGeometry(24, 0.8, 9);
  const deskMat = new THREE.MeshStandardMaterial({ color: 0x2b1b10, roughness: 0.85 });
  const deskMesh = new THREE.Mesh(deskGeo, deskMat);
  deskMesh.position.set(0, 4, 0);
  deskGroup.add(deskMesh);

  const legGeo = new THREE.BoxGeometry(0.8, 4, 0.8);
  const legMat = new THREE.MeshStandardMaterial({ color: 0x151518, metalness: 0.8, roughness: 0.2 });
  const leg1 = new THREE.Mesh(legGeo, legMat);
  leg1.position.set(-11.5, 2, -4);
  const leg2 = leg1.clone(); leg2.position.set(11.5, 2, -4);
  const leg3 = leg1.clone(); leg3.position.set(-11.5, 2, 4);
  const leg4 = leg1.clone(); leg4.position.set(11.5, 2, 4);
  deskGroup.add(leg1, leg2, leg3, leg4);

  // Main CRT Monitor Setup
  const monitorGeo = new THREE.BoxGeometry(7, 5.5, 5);
  const monitorMat = new THREE.MeshStandardMaterial({ color: 0x1d1d21, roughness: 0.6 });
  const monitorMesh = new THREE.Mesh(monitorGeo, monitorMat);
  monitorMesh.position.set(-2, 7.2, 0);
  deskGroup.add(monitorMesh);

  const screenGeo = new THREE.PlaneGeometry(6.4, 4.8);
  const screenMat = new THREE.MeshBasicMaterial({ map: mainScreenTexture });
  mainScreenMesh = new THREE.Mesh(screenGeo, screenMat);
  mainScreenMesh.position.set(-2, 7.25, 2.51);
  deskGroup.add(mainScreenMesh);

  // Auxiliary CRT Monitor Setup
  const auxMonitorGeo = new THREE.BoxGeometry(4.5, 4.5, 4.2);
  const auxMonitorMesh = new THREE.Mesh(auxMonitorGeo, monitorMat);
  auxMonitorMesh.position.set(5.5, 6.5, 0.5);
  auxMonitorMesh.rotation.y = -0.3;
  deskGroup.add(auxMonitorMesh);

  const auxScreenGeo = new THREE.PlaneGeometry(3.9, 3.9);
  const auxScreenMat = new THREE.MeshBasicMaterial({ map: auxScreenTexture });
  auxScreenMesh = new THREE.Mesh(auxScreenGeo, auxScreenMat);
  auxScreenMesh.position.set(5.1, 6.5, 2.45);
  auxScreenMesh.rotation.y = -0.3;
  deskGroup.add(auxScreenMesh);

  // Red Coffee Mug
  const mugGroup = new THREE.Group();
  const mugGeo = new THREE.CylinderGeometry(0.7, 0.7, 1.6, 16);
  const mugMat = new THREE.MeshStandardMaterial({ color: 0xff1744, roughness: 0.1 });
  const mugBody = new THREE.Mesh(mugGeo, mugMat);
  mugBody.position.set(0, 0.8, 0);
  
  const handleGeo = new THREE.TorusGeometry(0.5, 0.15, 8, 16, Math.PI);
  const handleMesh = new THREE.Mesh(handleGeo, mugMat);
  handleMesh.position.set(0.6, 0.8, 0);
  handleMesh.rotation.z = -Math.PI / 2;
  mugGroup.add(mugBody, handleMesh);
  
  mugGroup.position.set(-7, 4.4, 2);
  coffeeMugMesh = mugBody;
  deskGroup.add(mugGroup);

  // Server Stack
  const serverGroup = new THREE.Group();
  const rackBoxGeo = new THREE.BoxGeometry(4, 1.2, 5);
  const rackBoxMat = new THREE.MeshStandardMaterial({ color: 0x08080a, metalness: 0.9, roughness: 0.1 });
  
  for (let i = 0; i < 3; i++) {
    const rack = new THREE.Mesh(rackBoxGeo, rackBoxMat);
    rack.position.set(0, i * 1.3 + 0.6, 0);
    
    const ledGeo = new THREE.SphereGeometry(0.06, 8, 8);
    const ledMat = new THREE.MeshBasicMaterial({ color: 0x39ff14 });
    const led = new THREE.Mesh(ledGeo, ledMat);
    led.position.set(-1.6, i * 1.3 + 0.6, 2.52);
    serverGroup.add(rack, led);
  }
  serverGroup.position.set(-4, 0, -2);
  serverRackMesh = serverGroup;
  deskGroup.add(serverGroup);

  // Wall High Score Billboard Poster
  const billboardGeo = new THREE.PlaneGeometry(9, 9);
  const billboardMat = new THREE.MeshBasicMaterial({ map: leaderboardTexture });
  leaderboardMesh = new THREE.Mesh(billboardGeo, billboardMat);
  leaderboardMesh.position.set(11.8, 9, -1.5);
  leaderboardMesh.rotation.y = -Math.PI / 2;
  scene3D.add(leaderboardMesh);

  scene3D.add(deskGroup);

  // Environment elements
  const floorGeo = new THREE.PlaneGeometry(50, 50);
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x0c0c0f, roughness: 0.9 });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  scene3D.add(floor);

  const backWallGeo = new THREE.PlaneGeometry(50, 25);
  const backWallMat = new THREE.MeshStandardMaterial({ color: 0x060608, roughness: 0.95 });
  const backWall = new THREE.Mesh(backWallGeo, backWallMat);
  backWall.position.set(0, 12, -5);
  scene3D.add(backWall);

  // Sync tab state from URL if not already set during boot
  const params = new URLSearchParams(window.location.search);
  if (params.get("tab")) activeTab = params.get("tab");

  // Global listeners
  window.addEventListener("mousedown", onDocumentMouseDown, false);
  window.addEventListener("resize", onWindowResize, false);
  window.addEventListener("keydown", onDocumentKeyDown, false);

  drawMainScreen();
  drawAuxScreen();
  drawLeaderboardWallPoster();

  animate();
}

function onWindowResize() {
  if (camera3D && renderer3D) {
    camera3D.aspect = window.innerWidth / window.innerHeight;
    camera3D.updateProjectionMatrix();
    renderer3D.setSize(window.innerWidth, window.innerHeight);
  }
}

function animate() {
  requestAnimationFrame(animate);

  // Smooth LERP glide transitions
  currentCameraPos.lerp(cameraTargetPos, 0.08);
  currentCameraLookAt.lerp(cameraTargetLookAt, 0.08);

  camera3D.position.copy(currentCameraPos);
  camera3D.lookAt(currentCameraLookAt);

  if (mainScreenCtx) {
    drawMainScreen();
    drawAuxScreen();
  }

  renderer3D.render(scene3D, camera3D);
}

function zoomCameraTo(pos, lookAt) {
  cameraTargetPos.copy(pos);
  cameraTargetLookAt.copy(lookAt);
}

function resetCameraView() {
  cameraTargetPos.set(0, 12, 22);
  cameraTargetLookAt.set(0, 6, 0);
}

function isDescendantOf(obj, parent) {
  if (!obj || !parent) return false;
  let curr = obj.parent;
  while (curr) {
    if (curr === parent) return true;
    curr = curr.parent;
  }
  return false;
}

function onDocumentMouseDown(event) {
  if (event.button !== 0) return;

  const mouse = new THREE.Vector2();
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  const raycaster = new THREE.Raycaster();
  raycaster.setFromCamera(mouse, camera3D);

  const intersects = raycaster.intersectObjects(scene3D.children, true);
  
  if (intersects.length > 0) {
    let hitObject = intersects[0].object;
    let hitUv = intersects[0].uv;

    // 1. Raycast Main Screen plane
    if (hitObject === mainScreenMesh && hitUv) {
      const cx = hitUv.x * 1024;
      const cy = (1 - hitUv.y) * 1024;
      handleMainScreenClick(cx, cy);
      return;
    }

    // 2. Click Mug — focus store panel (coffee brewing mini-game)
    if (hitObject === coffeeMugMesh || isDescendantOf(hitObject, coffeeMugMesh.parent)) {
      zoomCameraTo(new THREE.Vector3(-4, 7, 7), new THREE.Vector3(-7, 5, 2));
      activeTab = "gigs";
      switchTab("gigs");
      drawMainScreen();
      return;
    }

    // 2b. Click Aux Terminal — community live feed
    if (hitObject === auxScreenMesh && hitUv) {
      zoomCameraTo(new THREE.Vector3(5.5, 7.5, 9), new THREE.Vector3(5.1, 6.5, 2.45));
      activeTab = "company";
      switchTab("company");
      drawMainScreen();
      return;
    }

    // 3. Click Server
    if (hitObject === serverRackMesh || isDescendantOf(hitObject, serverRackMesh)) {
      zoomCameraTo(new THREE.Vector3(-4, 6.5, 8.5), new THREE.Vector3(-4, 2, -2));
      activeTab = "gigs";
      switchTab("gigs");
      return;
    }

    // 4. Click Leaderboard
    if (hitObject === leaderboardMesh) {
      zoomCameraTo(new THREE.Vector3(7.5, 9, 3.5), new THREE.Vector3(11.8, 9, -1.5));
      activeTab = "leaderboard";
      switchTab("leaderboard");
      return;
    }

    // 5. Zoom in to screen if monitor casing is clicked
    if (hitObject.geometry && hitObject.geometry.type === "BoxGeometry" && hitObject.position.x === -2 && hitObject.position.y === 7.2) {
      zoomCameraTo(new THREE.Vector3(-2, 8, 10.5), new THREE.Vector3(-2, 7.25, 2.51));
      return;
    }
  }

  // Click background tabletop or floor to zoom out
  resetCameraView();
}

function onDocumentKeyDown(event) {
  if (!activeMiniGame && !focusedInputField) return;

  // Capture keystrokes for Syntax Striker
  if (activeMiniGame && activeMiniGame.type === 'code') {
    event.preventDefault();
    const key = event.key;
    const target = activeMiniGame.target;
    const currentTyped = activeMiniGame.inputText || "";
    
    const nextChar = target.charAt(currentTyped.length);
    if (key === nextChar) {
      activeMiniGame.inputText = currentTyped + key;
      if (activeMiniGame.inputText === target) {
        if (miniGameTimer) clearInterval(miniGameTimer);
        successMiniGame();
      } else {
        drawMainScreen();
      }
    }
    return;
  }

  // Captures credentials keyboard typings
  if (focusedInputField) {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (focusedInputField === 'username') {
        profileUsernameText = profileUsernameText.slice(0, -1);
      } else {
        profilePasswordText = profilePasswordText.slice(0, -1);
      }
      drawMainScreen();
    } else if (event.key === "Enter") {
      event.preventDefault();
      focusedInputField = null;
      drawMainScreen();
    } else if (event.key.length === 1) {
      event.preventDefault();
      if (focusedInputField === 'username') {
        if (profileUsernameText.length < 15) {
          profileUsernameText += event.key;
        }
      } else {
        if (profilePasswordText.length < 15) {
          profilePasswordText += event.key;
        }
      }
      drawMainScreen();
    }
  }
}

// ═══════════════════════════════════════════════
// --- 3D SCREEN CLICK ROUTING & INTERACTION ---
// ═══════════════════════════════════════════════

function isPointInRect(cx, cy, x, y, w, h) {
  return cx >= x && cx <= x + w && cy >= y && cy <= y + h;
}

function handleMainScreenClick(cx, cy) {
  if (isPointInRect(cx, cy, 400, 930, 224, 50)) {
    resetCameraView();
    focusedInputField = null;
    drawMainScreen();
    return;
  }

  const tabIds = ["company", "develop", "gigs", "staff", "leaderboard", "profile"];
  for (let i = 0; i < tabIds.length; i++) {
    if (isPointInRect(cx, cy, 20 + i * 162, 80, 150, 40)) {
      activeTab = tabIds[i];
      switchTab(tabIds[i]);
      if (tabIds[i] === "leaderboard") {
        zoomCameraTo(new THREE.Vector3(7.5, 9, 3.5), new THREE.Vector3(11.8, 9, -1.5));
        loadLeaderboard().then(() => drawLeaderboardWallPoster());
      } else {
        zoomCameraTo(new THREE.Vector3(-2, 8, 10.5), new THREE.Vector3(-2, 7.25, 2.51));
      }
      drawMainScreen();
      return;
    }
  }

  if (activeMiniGame) {
    const devMiniGame = activeTab === "develop" && !activeMiniGame.isGig && !activeMiniGame.isStore && !activeMiniGame.isTraining;
    const yBase = devMiniGame ? 500 : 220;
    if (handleMiniGameClick(cx, cy, yBase)) return;
  }

  if (activeTab === "develop") {
    handleDevelopTabClick(cx, cy);
  } else if (activeTab === "gigs" && !activeMiniGame) {
    handleGigsTabClick(cx, cy);
  } else if (activeTab === "staff") {
    handleStaffTabClick(cx, cy);
  } else if (activeTab === "profile") {
    handleProfileTabClick(cx, cy);
  }
}

function handleMiniGameClick(cx, cy, yBase) {
  if (!activeMiniGame) return false;

  if (activeMiniGame.type === "slider") {
    if (isPointInRect(cx, cy, 70, yBase + 195, 420, 50)) {
      stopGigSlider();
      return true;
    }
    if (isPointInRect(cx, cy, 534, yBase + 195, 420, 50)) {
      cancelMiniGame();
      return true;
    }
    return true;
  }

  if (activeMiniGame.type === "binary") {
    activeMiniGame.options.forEach((opt, idx) => {
      const y = yBase + 165 + idx * 52;
      if (isPointInRect(cx, cy, 70, y, 884, 42)) {
        clickGigBinary(opt);
      }
    });
    if (isPointInRect(cx, cy, 70, yBase + 350, 884, 25)) {
      cancelMiniGame();
    }
    return true;
  }

  if (activeMiniGame.type === "trace") {
    activeMiniGame.coords.forEach(coord => {
      if (coord.num < activeMiniGame.currentNumber) return;
      const pxX = 70 + (coord.left / 100) * 884;
      const pxY = yBase + 100 + (coord.top / 100) * 240;
      if (Math.hypot(cx - pxX, cy - pxY) <= 28) {
        clickGigMatrix(coord.num);
      }
    });
    if (isPointInRect(cx, cy, 70, yBase + 375, 884, 35)) {
      cancelMiniGame();
    }
    return true;
  }

  if (activeMiniGame.type === "ping") {
    if (isPointInRect(cx, cy, 70, yBase + 165, 884, 80)) {
      clickGigPing();
      return true;
    }
    if (isPointInRect(cx, cy, 70, yBase + 285, 884, 35)) {
      cancelMiniGame();
      return true;
    }
    return true;
  }

  if (activeMiniGame.type === "pour") {
    if (isPointInRect(cx, cy, 70, yBase + 195, 420, 50)) {
      stopCoffeePour();
      return true;
    }
    if (isPointInRect(cx, cy, 534, yBase + 195, 420, 50)) {
      cancelMiniGame();
      return true;
    }
    return true;
  }

  if (activeMiniGame.type === "code") {
    if (isPointInRect(cx, cy, 50, yBase + 280, 924, 40)) {
      cancelMiniGame();
      return true;
    }
    return true;
  }

  if (activeMiniGame.type === "design") {
    activeMiniGame.buttons.forEach((btn, idx) => {
      const x = 50 + idx * 310;
      if (isPointInRect(cx, cy, x, yBase + 150, 280, 50)) {
        selectDesignColor(btn.name);
      }
    });
    if (isPointInRect(cx, cy, 50, yBase + 280, 924, 40)) {
      cancelMiniGame();
    }
    return true;
  }

  if (activeMiniGame.type === "polish") {
    [0, 1, 2, 3].forEach(i => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = 50 + col * 470;
      const y = yBase + 130 + row * 70;
      if (isPointInRect(cx, cy, x, y, 440, 55)) {
        clickBugButton(i);
      }
    });
    if (isPointInRect(cx, cy, 50, yBase + 280, 924, 40)) {
      cancelMiniGame();
    }
    return true;
  }

  return false;
}

function handleDevelopTabClick(cx, cy) {
  if (!gameState.current_project) {
    if (isPointInRect(cx, cy, 450, 215, 200, 35)) {
      draftProjectName = RANDOM_GAME_NAMES[Math.floor(Math.random() * RANDOM_GAME_NAMES.length)];
      drawMainScreen();
      return;
    }

    const genres = ["RPG", "Action", "Strategy", "Adventure", "Simulation"];
    genres.forEach((g, idx) => {
      if (isPointInRect(cx, cy, 200 + idx * 140, 280, 130, 35)) draftGenre = g;
    });

    const topics = ["Cyberpunk", "Fantasy", "Space", "Zombie", "Farming", "Game Dev"];
    topics.forEach((t, idx) => {
      const x = 200 + (idx % 3) * 230;
      const y = 350 + Math.floor(idx / 3) * 45;
      if (isPointInRect(cx, cy, x, y, 220, 35)) draftTopic = t;
    });

    const platforms = ["pc", "console", "mobile"];
    platforms.forEach((p, idx) => {
      if (isPointInRect(cx, cy, 200 + idx * 230, 460, 210, 35)) draftPlatform = p;
    });

    const scales = ["Small", "Medium", "Large"];
    scales.forEach((s, idx) => {
      if (isPointInRect(cx, cy, 200 + idx * 160, 540, 150, 35)) draftScale = s;
    });

    if (isPointInRect(cx, cy, 200, 620, 160, 35)) {
      draftMultiplayer = !draftMultiplayer;
      drawMainScreen();
      return;
    }

    if (isPointInRect(cx, cy, 300, 720, 420, 70)) {
      createGameProjectFromDraft();
    } else {
      drawMainScreen();
    }
    return;
  }

  const proj = gameState.current_project;
  const target = getTargetPointsForScale(proj.scale);
  const totalPoints = proj.tech_points + proj.design_points;
  const progressPercent = Math.min(100, (totalPoints / (target * 2)) * 100);

  if (!activeMiniGame) {
    if (isPointInRect(cx, cy, 50, 560, 280, 60)) startMiniGame("code");
    if (isPointInRect(cx, cy, 360, 560, 280, 60)) startMiniGame("design");
    if (isPointInRect(cx, cy, 670, 560, 280, 60)) startMiniGame("polish");
    if (isPointInRect(cx, cy, 300, 670, 420, 60) && progressPercent >= 100 && proj.bug_points === 0) {
      releaseGameProject();
    }
  }
}

function handleGigsTabClick(cx, cy) {
  if (isPointInRect(cx, cy, 50, 285, 280, 45)) trainSkill("coding_skill");
  if (isPointInRect(cx, cy, 50, 370, 280, 45)) trainSkill("design_skill");
  if (isPointInRect(cx, cy, 50, 455, 280, 45)) trainSkill("management_skill");

  if (isPointInRect(cx, cy, 380, 285, 280, 45)) buyItem("coffee");
  if (isPointInRect(cx, cy, 380, 370, 280, 45)) buyItem("energy_drink");
  if (isPointInRect(cx, cy, 380, 455, 280, 45)) buyItem("nootropic");

  if (isPointInRect(cx, cy, 710, 285, 260, 45)) runGig("freelance_html");
  if (isPointInRect(cx, cy, 710, 370, 260, 45)) runGig("crack_competitor");
  if (isPointInRect(cx, cy, 710, 455, 260, 45)) runGig("ransomware");
  if (isPointInRect(cx, cy, 710, 540, 260, 45)) runGig("ddos_rival");
}

function handleStaffTabClick(cx, cy) {
  const officeKeys = Object.keys(OFFICE_TIERS);
  officeKeys.forEach((tierKey, idx) => {
    const y = 300 + idx * 55;
    if (isPointInRect(cx, cy, 50, y + 10, 400, 36) && gameState.office_tier !== tierKey) {
      buyOffice(tierKey);
    }
  });

  const recruitTypes = ["junior_dev", "junior_artist", "senior_dev", "senior_artist"];
  recruitTypes.forEach((id, idx) => {
    const y = 560 + idx * 58;
    if (isPointInRect(cx, cy, 50, y + 8, 380, 36)) hireEmployee(id);
  });

  const researchTypes = ["unlocked_console", "researched_multiplayer", "ai_behavior"];
  researchTypes.forEach((id, idx) => {
    const y = 560 + idx * 75;
    if (isPointInRect(cx, cy, 520, y + 8, 420, 38) && !gameState[id]) buyResearch(id);
  });

  let xOffset = 50;
  gameState.employees.forEach((emp, idx) => {
    if (idx < 4 && isPointInRect(cx, cy, xOffset, 642, 190, 35)) fireEmployee(idx);
    xOffset += 220;
  });
}

function handleProfileTabClick(cx, cy) {
  if (isUserLoggedIn) {
    if (isPointInRect(cx, cy, 200, 400, 420, 50)) handleProfileLogout();
    return;
  }

  if (isPointInRect(cx, cy, 200, 305, 400, 35)) {
    focusedInputField = "username";
    drawMainScreen();
    return;
  }
  if (isPointInRect(cx, cy, 200, 365, 400, 35)) {
    focusedInputField = "password";
    drawMainScreen();
    return;
  }
  if (isPointInRect(cx, cy, 200, 430, 400, 45)) {
    handleProfileSubmit();
    return;
  }
  if (isPointInRect(cx, cy, 200, 490, 400, 45)) {
    handleFastGuestLogin();
  }
}

function createGameProjectFromDraft() {
  const name = draftProjectName.trim();
  if (!name) {
    showToast("Please enter a project name!", "error");
    return;
  }

  if (draftPlatform === "console" && !gameState.unlocked_console) {
    showToast("You must research '3D Graphics Engine' first to target Console platforms!", "error");
    return;
  }

  let scaleCost = 0;
  if (draftScale === "Medium") scaleCost = 1000;
  if (draftScale === "Large") scaleCost = 10000;
  if (draftScale === "AAA") scaleCost = 50000;

  const totalCost = scaleCost + PLATFORMS[draftPlatform].cost;
  if (gameState.cash < totalCost) {
    showToast(`Insufficient cash reserves! Required: $${totalCost.toLocaleString()}`, "error");
    return;
  }

  let xpCost = 10;
  if (draftScale === "Medium") xpCost = 30;
  else if (draftScale === "Large") xpCost = 80;
  else if (draftScale === "AAA") xpCost = 200;
  if (gameState.level === 1 && draftScale === "Small") xpCost = 0;

  if (gameState.xp < xpCost) {
    showToast(`Insufficient XP! Starting a ${draftScale} project requires ${xpCost} XP.`, "error");
    return;
  }

  if (!confirm(`Are you sure you want to start developing '${name}'? Costs $${totalCost.toLocaleString()} and ${xpCost} XP.`)) {
    return;
  }

  gameState.cash -= totalCost;
  gameState.xp -= xpCost;
  gameState.current_project = {
    name,
    genre: draftGenre,
    topic: draftTopic,
    platform: draftPlatform,
    scale: draftScale,
    tech_points: 0,
    design_points: 0,
    bug_points: 0,
    progress: 0,
    phase: "coding",
    miniGamesPlayed: 0,
    miniGamesWon: 0,
    miniGamesLost: 0
  };

  addLog("Project Started", `Initiated development of '${name}' (${draftGenre}/${draftTopic}) on ${PLATFORMS[draftPlatform].name}. Budget spent: $${totalCost}.`);
  showToast("Development initialized!", "success");
  saveGame();
  activeTab = "develop";
  switchTab("develop");
  updateUI();
}

async function handleProfileSubmit() {
  if (!profileUsernameText || !profilePasswordText) {
    showToast("Enter username and password on the Profile Terminal.", "error");
    return;
  }
  const email = profileUsernameText.includes("@")
    ? profileUsernameText
    : `${profileUsernameText.toLowerCase().replace(/\s+/g, "")}@devend.local`;

  try {
    const result = await TycoonAPI.loginWithEmail(email, profilePasswordText);
    isUserLoggedIn = true;
    if (result.profile) {
      localStorage.setItem("tycoon_active_username", result.profile.username || profileUsernameText);
      localStorage.setItem("tycoon_color", result.profile.color || "#00e5ff");
    }
    await loadProfileFromServer();
    focusedInputField = null;
    profileUsernameText = "";
    profilePasswordText = "";
    showToast("Profile synchronized!", "success");
    updateUI();
  } catch (err) {
    showToast(err.message || "Login failed. Try Fast Guest Login or visit signup.html.", "error");
  }
}

function handleFastGuestLogin() {
  const guestName = `Guest${Math.floor(Math.random() * 9000) + 1000}`;
  localStorage.setItem("tycoon_active_username", guestName);
  localStorage.setItem("tycoon_color", "#39ff14");
  isUserLoggedIn = false;
  loadProfileFromLocal();
  focusedInputField = null;
  profileUsernameText = "";
  profilePasswordText = "";
  showToast(`Playing as ${guestName}`, "success");
  updateUI();
}

async function handleProfileLogout() {
  try {
    await TycoonAPI.logout();
  } catch (e) {
    console.warn("Logout error:", e);
  }
  isUserLoggedIn = false;
  loadProfileFromLocal();
  focusedInputField = null;
  showToast("Logged out. Local guest mode active.", "info");
  updateUI();
}

// ═══════════════════════════════════════════════
// --- CANVAS TEXTURE DRAWER PROCEDURAL CALLS ---
// ═══════════════════════════════════════════════

function drawPixelButton(ctx, x, y, w, h, text, isPressed, color = "#00e5ff", font = "12px 'Press Start 2P'") {
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.fillStyle = isPressed ? "rgba(0, 229, 255, 0.15)" : "#0c0c10";
  
  ctx.strokeRect(x, y, w, h);
  ctx.fillRect(x + 2, y + 2, w - 4, h - 4);
  
  ctx.fillStyle = color;
  ctx.font = font;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(text, x + w / 2, y + h / 2);
  ctx.restore();
}

function drawHeaderBar(ctx, w) {
  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(0, 0, w, 70);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  ctx.strokeRect(0, 0, w, 70);

  ctx.fillStyle = "#39ff14";
  ctx.font = "bold 26px 'VT323', monospace";
  ctx.fillText(`CASH: $${parseFloat(gameState.cash).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 20, 42);

  ctx.fillStyle = "#ffffff";
  ctx.font = "14px 'VT323', monospace";
  ctx.fillText("⚡ ENERGY", 300, 26);
  ctx.fillStyle = "#222";
  ctx.fillRect(300, 34, 150, 14);
  ctx.fillStyle = "#ffd700";
  ctx.fillRect(300, 34, (gameState.energy / gameState.max_energy) * 150, 14);

  ctx.fillStyle = "#ffffff";
  ctx.fillText("🎯 FOCUS", 480, 26);
  ctx.fillStyle = "#222";
  ctx.fillRect(480, 34, 150, 14);
  ctx.fillStyle = "#ff1744";
  ctx.fillRect(480, 34, (gameState.nerve / gameState.max_nerve) * 150, 14);

  ctx.fillStyle = "#ffffff";
  ctx.fillText(`✨ LEVEL ${gameState.level}`, 660, 26);
  ctx.fillStyle = "#222";
  ctx.fillRect(660, 34, 150, 14);
  ctx.fillStyle = "#39ff14";
  ctx.fillRect(660, 34, (gameState.xp / gameState.xp_needed) * 150, 14);
  
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "12px 'VT323', monospace";
  ctx.fillText(`${Math.floor(gameState.energy)}/${gameState.max_energy}`, 360, 60);
  ctx.fillText(`${Math.floor(gameState.nerve)}/${gameState.max_nerve}`, 540, 60);
  ctx.fillText(`${Math.floor(gameState.xp)}/${gameState.xp_needed} XP`, 710, 60);
}

function drawNavTabs(ctx, w) {
  const tabs = [
    { id: "company", label: "COMPANY" },
    { id: "develop", label: "DEVELOP" },
    { id: "gigs", label: "GIGS/GYM" },
    { id: "staff", label: "STAFF" },
    { id: "leaderboard", label: "SCORES" },
    { id: "profile", label: "PROFILE" }
  ];

  ctx.fillStyle = "#060608";
  ctx.fillRect(0, 70, w, 60);

  tabs.forEach((tab, index) => {
    const x = 20 + index * 162;
    const y = 80;
    const isActive = activeTab === tab.id;
    drawPixelButton(ctx, x, y, 150, 40, tab.label, isActive, isActive ? "#39ff14" : "#00e5ff", "11px 'Press Start 2P'");
  });
}

function drawMainScreen() {
  if (!mainScreenCtx) return;
  const ctx = mainScreenCtx;
  const w = 1024;
  const h = 1024;
  
  ctx.fillStyle = "#030305";
  ctx.fillRect(0, 0, w, h);
  
  ctx.fillStyle = "rgba(255, 255, 255, 0.015)";
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 2);
  }
  
  drawHeaderBar(ctx, w);
  drawNavTabs(ctx, w);
  
  if (activeTab === "company") {
    drawCompanyTab(ctx, w);
  } else if (activeTab === "develop") {
    drawDevelopTab(ctx, w);
  } else if (activeTab === "gigs") {
    drawGigsTab(ctx, w);
  } else if (activeTab === "staff") {
    drawStaffTab(ctx, w);
  } else if (activeTab === "leaderboard") {
    drawLeaderboardTab(ctx, w);
  } else if (activeTab === "profile") {
    drawProfileTab(ctx, w);
  }
  
  if (mainScreenTexture) {
    mainScreenTexture.needsUpdate = true;
  }
}

function drawCompanyTab(ctx, w) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 22px 'Press Start 2P', monospace";
  ctx.fillText("STUDIO PROFILE", 50, 190);

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "20px 'VT323', monospace";
  ctx.fillText(`Studio Name: ${gameState.company_name}`, 50, 240);
  ctx.fillText(`Office Space: ${gameState.office_tier}`, 50, 270);
  ctx.fillText(`Net Worth: $${parseFloat(gameState.net_worth).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 50, 300);
  ctx.fillText(`Games Published: ${gameState.games_released}`, 50, 330);
  ctx.fillText(`Total Copies Sold: ${parseInt(gameState.games_sold).toLocaleString()}`, 50, 360);
  
  ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
  ctx.strokeStyle = "rgba(0, 229, 255, 0.2)";
  ctx.lineWidth = 2;
  ctx.fillRect(50, 400, 924, 180);
  ctx.strokeRect(50, 400, 924, 180);
  
  ctx.fillStyle = "#00e5ff";
  ctx.font = "14px 'Press Start 2P', monospace";
  ctx.fillText("📜 Basement Co-Sign Lease Agreement (Section 4.2)", 70, 435);
  
  ctx.fillStyle = "#ffffff";
  ctx.font = "18px 'VT323', monospace";
  ctx.fillText("Morale clause: Empty pizza box tower height must not exceed 4 boxes.", 70, 475);
  ctx.fillText("Crying loudly after DB drops is strictly prohibited between 10 PM and 7 AM.", 70, 505);
  ctx.fillText("The landlord reserves the right to confiscate desk chairs if laundry is ignored.", 70, 535);

  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 16px 'Press Start 2P', monospace";
  ctx.fillText("ACTIVE PRODUCT SALES", 50, 630);
  
  let yOffset = 680;
  if (gameState.active_games.length === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "18px 'VT323', monospace";
    ctx.fillText("No active products generating sales.", 50, yOffset);
  } else {
    gameState.active_games.forEach(game => {
      const remainingTicks = Math.max(0, 240 - game.age);
      const curIncome = (game.initialSalesRate * Math.exp(-game.age / 90) * game.price * 0.70);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 20px 'VT323', monospace";
      ctx.fillText(`${game.name} (${game.genre})`, 50, yOffset);
      ctx.fillStyle = "#39ff14";
      ctx.fillText(`+ $${curIncome.toFixed(2)}/s`, 400, yOffset);
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillText(`Rating: ${game.rating.toFixed(1)}/10 | Sold: ${game.totalSold} copies (${remainingTicks}s left)`, 50, yOffset + 22);
      yOffset += 60;
    });
  }

  drawPixelButton(ctx, 400, 930, 224, 50, "ZOOM OUT", false, "#ff1744", "12px 'Press Start 2P'");
}

function drawDevelopTab(ctx, w) {
  if (!gameState.current_project) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px 'Press Start 2P', monospace";
    ctx.fillText("NEW PROJECT CREATION", 50, 190);

    ctx.font = "20px 'VT323', monospace";
    ctx.fillText(`PROJECT NAME: ${draftProjectName}`, 50, 240);
    drawPixelButton(ctx, 450, 215, 200, 35, "RANDOMIZE", false, "#ffd700", "10px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText("SELECT GENRE:", 50, 300);
    const genres = ["RPG", "Action", "Strategy", "Adventure", "Simulation"];
    genres.forEach((g, idx) => {
      const active = draftGenre === g;
      drawPixelButton(ctx, 200 + idx * 140, 280, 130, 35, g, active, active ? "#39ff14" : "#00e5ff", "9px 'Press Start 2P'");
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillText("SELECT TOPIC:", 50, 380);
    const topics = ["Cyberpunk", "Fantasy", "Space", "Zombie", "Farming", "Game Dev"];
    topics.forEach((t, idx) => {
      const active = draftTopic === t;
      const x = 200 + (idx % 3) * 230;
      const y = 350 + Math.floor(idx / 3) * 45;
      drawPixelButton(ctx, x, y, 220, 35, t, active, active ? "#39ff14" : "#00e5ff", "9px 'Press Start 2P'");
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillText("PLATFORM:", 50, 480);
    const platforms = [
      { id: "pc", label: "PC ($100)" },
      { id: "console", label: "PEAR 5 ($500)" },
      { id: "mobile", label: "MOBILE ($50)" }
    ];
    platforms.forEach((p, idx) => {
      const active = draftPlatform === p.id;
      drawPixelButton(ctx, 200 + idx * 230, 460, 210, 35, p.label, active, active ? "#39ff14" : "#00e5ff", "9px 'Press Start 2P'");
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillText("PROJECT SCALE:", 50, 560);
    const scales = ["Small", "Medium", "Large"];
    scales.forEach((s, idx) => {
      const active = draftScale === s;
      drawPixelButton(ctx, 200 + idx * 160, 540, 150, 35, s, active, active ? "#39ff14" : "#00e5ff", "9px 'Press Start 2P'");
    });

    ctx.fillStyle = "#ffffff";
    ctx.fillText("MULTIPLAYER:", 50, 640);
    drawPixelButton(ctx, 200, 620, 160, 35, draftMultiplayer ? "[X] ENABLED" : "[ ] DISABLED", draftMultiplayer, draftMultiplayer ? "#39ff14" : "#00e5ff", "9px 'Press Start 2P'");

    let cost = draftPlatform === "mobile" ? 50 : (draftPlatform === "console" ? 500 : 100);
    let scaleXp = draftScale === "Medium" ? 100 : (draftScale === "Large" ? 400 : 10);
    if (gameState.level === 1 && draftScale === "Small") scaleXp = 0;
    drawPixelButton(ctx, 300, 720, 420, 70, `START DEVELOPMENT (-$${cost}, -${scaleXp} XP)`, false, "#ffd700", "11px 'Press Start 2P'");

  } else {
    const proj = gameState.current_project;
    const target = getTargetPointsForScale(proj.scale);
    const totalPoints = proj.tech_points + proj.design_points;
    const progressPercent = Math.min(100, (totalPoints / (target * 2)) * 100);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 20px 'Press Start 2P', monospace";
    ctx.fillText(`CURRENT PROJECT: ${proj.name.toUpperCase()}`, 50, 190);
    
    ctx.font = "20px 'VT323', monospace";
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText(`Scale: ${proj.scale} | Genre: ${proj.genre} | Topic: ${proj.topic}`, 50, 230);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Tech points: ${proj.tech_points} / ${target}`, 50, 280);
    ctx.fillStyle = "#222";
    ctx.fillRect(50, 294, 400, 18);
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(50, 294, Math.min(1, proj.tech_points / target) * 400, 18);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Design points: ${proj.design_points} / ${target}`, 524, 280);
    ctx.fillStyle = "#222";
    ctx.fillRect(524, 294, 400, 18);
    ctx.fillStyle = "#b388ff";
    ctx.fillRect(524, 294, Math.min(1, proj.design_points / target) * 400, 18);

    ctx.fillStyle = proj.bug_points > 0 ? "#ff1744" : "#39ff14";
    ctx.fillText(`Bugs to Squash: ${proj.bug_points}`, 50, 360);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Overall Progress: ${progressPercent.toFixed(1)}%`, 50, 420);
    ctx.fillStyle = "#222";
    ctx.fillRect(50, 434, 874, 24);
    ctx.fillStyle = "#39ff14";
    ctx.fillRect(50, 434, (progressPercent / 100) * 874, 24);

    if (activeMiniGame) {
      drawProjectMiniGame(ctx, w);
    } else {
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 16px 'Press Start 2P', monospace";
      ctx.fillText("DEV OPERATIONS", 50, 530);

      drawPixelButton(ctx, 50, 560, 280, 60, "[CODE] STRIKER", false, "#00e5ff", "10px 'Press Start 2P'");
      drawPixelButton(ctx, 360, 560, 280, 60, "[DESIGN] COLOR", false, "#b388ff", "10px 'Press Start 2P'");
      drawPixelButton(ctx, 670, 560, 280, 60, "[POLISH] DEBUG", false, "#ffd700", "10px 'Press Start 2P'");

      const readyToRelease = progressPercent >= 100 && proj.bug_points === 0;
      drawPixelButton(ctx, 300, 670, 420, 60, readyToRelease ? "🚀 RELEASE GAME NOW" : "LOCK SPRINT (100% & 0 BUGS)", !readyToRelease, readyToRelease ? "#39ff14" : "#444", "11px 'Press Start 2P'");
    }
  }

  drawPixelButton(ctx, 400, 930, 224, 50, "ZOOM OUT", false, "#ff1744", "12px 'Press Start 2P'");
}

function drawMiniGamePanel(ctx, w, yBase) {
  if (!activeMiniGame) return;

  if (activeMiniGame.type === "code") {
    ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
    ctx.strokeStyle = "#00e5ff";
    ctx.lineWidth = 2;
    ctx.fillRect(50, yBase, 924, 330);
    ctx.strokeRect(50, yBase, 924, 330);

    ctx.fillStyle = "#00e5ff";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText("SYNTAX STRIKER", 70, yBase + 40);

    ctx.fillStyle = "#ffd700";
    ctx.font = "16px 'VT323', monospace";
    ctx.fillText(activeMiniGame.target, 70, yBase + 90);

    ctx.fillStyle = "#ffffff";
    ctx.font = "18px 'VT323', monospace";
    ctx.fillText(`> ${activeMiniGame.inputText || ""}_`, 70, yBase + 140);

    ctx.fillStyle = "#222";
    ctx.fillRect(70, yBase + 220, 884, 10);
    ctx.fillStyle = "#00e5ff";
    ctx.fillRect(70, yBase + 220, ((activeMiniGame.timeLeft || 100) / 100) * 884, 10);

    drawPixelButton(ctx, 50, yBase + 280, 924, 40, "CANCEL MINI-GAME", false, "#ff1744", "10px 'Press Start 2P'");
    return;
  }

  if (activeMiniGame.type === "design") {
    ctx.fillStyle = "rgba(179, 136, 255, 0.05)";
    ctx.strokeStyle = "#b388ff";
    ctx.lineWidth = 2;
    ctx.fillRect(50, yBase, 924, 330);
    ctx.strokeRect(50, yBase, 924, 330);

    ctx.fillStyle = "#b388ff";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText("COLOR MATCHER", 70, yBase + 40);

    ctx.fillStyle = activeMiniGame.targetColor.hex;
    ctx.font = "bold 22px 'Press Start 2P', monospace";
    ctx.fillText(activeMiniGame.targetColor.name, 70, yBase + 100);

    activeMiniGame.buttons.forEach((btn, idx) => {
      drawPixelButton(ctx, 50 + idx * 310, yBase + 150, 280, 50, btn.name, false, btn.hex, "10px 'Press Start 2P'");
    });

    ctx.fillStyle = "#222";
    ctx.fillRect(70, yBase + 230, 884, 10);
    ctx.fillStyle = "#b388ff";
    ctx.fillRect(70, yBase + 230, ((activeMiniGame.timeLeft || 100) / 100) * 884, 10);

    drawPixelButton(ctx, 50, yBase + 280, 924, 40, "CANCEL MINI-GAME", false, "#ff1744", "10px 'Press Start 2P'");
    return;
  }

  if (activeMiniGame.type === "polish") {
    ctx.fillStyle = "rgba(255, 215, 0, 0.05)";
    ctx.strokeStyle = "#ffd700";
    ctx.lineWidth = 2;
    ctx.fillRect(50, yBase, 924, 330);
    ctx.strokeRect(50, yBase, 924, 330);

    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText("BUG SQUASHER", 70, yBase + 40);

    [0, 1, 2, 3].forEach(i => {
      const col = i % 2;
      const row = Math.floor(i / 2);
      const label = i === activeMiniGame.bugIndex ? "BUG" : "CLEAN";
      drawPixelButton(ctx, 50 + col * 470, yBase + 130 + row * 70, 440, 55, label, false, i === activeMiniGame.bugIndex ? "#ff1744" : "#444", "10px 'Press Start 2P'");
    });

    ctx.fillStyle = "#222";
    ctx.fillRect(70, yBase + 230, 884, 10);
    ctx.fillStyle = "#ffd700";
    ctx.fillRect(70, yBase + 230, ((activeMiniGame.timeLeft || 100) / 100) * 884, 10);

    drawPixelButton(ctx, 50, yBase + 280, 924, 40, "CANCEL MINI-GAME", false, "#ff1744", "10px 'Press Start 2P'");
    return;
  }

  if (activeMiniGame.type === "slider") {
    ctx.fillStyle = "rgba(0, 229, 255, 0.05)";
      ctx.strokeStyle = "#00e5ff";
      ctx.lineWidth = 2;
      ctx.fillRect(50, yBase, 924, 300);
      ctx.strokeRect(50, yBase, 924, 300);

      ctx.fillStyle = "#00e5ff";
      ctx.font = "bold 16px 'Press Start 2P', monospace";
      ctx.fillText("📐 Slider Centering: CSS Alignment", 70, yBase + 45);
      
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "18px 'VT323', monospace";
      ctx.fillText("Centering Luigi's Pizzeria image! Lock the needle inside the green zone.", 70, yBase + 85);

      ctx.fillStyle = "#222";
      ctx.fillRect(70, yBase + 120, 884, 40);
      
      const startX = 70 + (activeMiniGame.greenZoneStart / 100) * 884;
      const widthX = ((activeMiniGame.greenZoneEnd - activeMiniGame.greenZoneStart) / 100) * 884;
      ctx.fillStyle = "#39ff14";
      ctx.fillRect(startX, yBase + 120, widthX, 40);

      const needleX = 70 + (activeMiniGame.needlePosition / 100) * 884;
      ctx.fillStyle = "#ff1744";
      ctx.fillRect(needleX - 4, yBase + 115, 8, 50);

      drawPixelButton(ctx, 70, yBase + 195, 420, 50, "LOCK ALIGNMENT", false, "#39ff14", "12px 'Press Start 2P'");
      drawPixelButton(ctx, 534, 195 + yBase, 420, 50, "ABORT GIG", false, "#ff1744", "12px 'Press Start 2P'");

      ctx.fillStyle = "#222";
      ctx.fillRect(70, yBase + 265, 884, 8);
      ctx.fillStyle = "#00e5ff";
      ctx.fillRect(70, yBase + 265, (activeMiniGame.timeLeft / 100) * 884, 8);
    return;
  }

  if (activeMiniGame.type === "binary") {
      ctx.fillStyle = "rgba(179, 136, 255, 0.05)";
      ctx.strokeStyle = "#b388ff";
      ctx.lineWidth = 2;
      ctx.fillRect(50, yBase, 924, 380);
      ctx.strokeRect(50, yBase, 924, 380);

      ctx.fillStyle = "#b388ff";
      ctx.font = "bold 16px 'Press Start 2P', monospace";
      ctx.fillText("💾 DRM Crack: Binary Matcher", 70, yBase + 45);
      
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "18px 'VT323', monospace";
      ctx.fillText("Cracking DRM binary security signatures! Match the encryption sequence key:", 70, yBase + 85);

      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 20px 'Press Start 2P', monospace";
      ctx.fillText(`TARGET: ${activeMiniGame.targetSequence}`, 70, yBase + 135);

      activeMiniGame.options.forEach((opt, idx) => {
        const y = yBase + 165 + idx * 52;
        drawPixelButton(ctx, 70, y, 884, 42, opt, false, "#b388ff", "12px 'Press Start 2P'");
      });

      ctx.fillStyle = "#222";
      ctx.fillRect(70, yBase + 335, 884, 8);
      ctx.fillStyle = "#b388ff";
      ctx.fillRect(70, yBase + 335, (activeMiniGame.timeLeft / 100) * 884, 8);

      drawPixelButton(ctx, 70, yBase + 350, 884, 25, "ABORT", false, "#ff1744", "10px 'Press Start 2P'");
    return;
  }

  if (activeMiniGame.type === "trace") {
      ctx.fillStyle = "rgba(255, 23, 68, 0.05)";
      ctx.strokeStyle = "#ff1744";
      ctx.lineWidth = 2;
      ctx.fillRect(50, yBase, 924, 420);
      ctx.strokeRect(50, yBase, 924, 420);

      ctx.fillStyle = "#ff1744";
      ctx.font = "bold 16px 'Press Start 2P', monospace";
      ctx.fillText("🎯 Ransomware: Trace Evader", 70, yBase + 45);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "18px 'VT323', monospace";
      ctx.fillText(`Click wobbly server nodes 1, 2, 3, 4 in ascending order. (Targeting: ${activeMiniGame.currentNumber})`, 70, yBase + 80);

      ctx.fillStyle = "#0c0d12";
      ctx.fillRect(70, yBase + 100, 884, 240);
      ctx.strokeStyle = "#ff1744";
      ctx.strokeRect(70, yBase + 100, 884, 240);

      activeMiniGame.coords.forEach(coord => {
        const isNext = coord.num === activeMiniGame.currentNumber;
        const isClicked = coord.num < activeMiniGame.currentNumber;
        
        ctx.save();
        ctx.strokeStyle = isNext ? "#39ff14" : (isClicked ? "rgba(255,255,255,0.1)" : "#ff1744");
        ctx.fillStyle = isClicked ? "rgba(255,255,255,0.02)" : "#0c0c10";
        ctx.lineWidth = 3;
        
        const pxX = 70 + (coord.left / 100) * 884;
        const pxY = yBase + 100 + (coord.top / 100) * 240;
        
        ctx.beginPath();
        ctx.arc(pxX, pxY, 24, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        ctx.fillStyle = isNext ? "#39ff14" : (isClicked ? "rgba(255,255,255,0.2)" : "#ff1744");
        ctx.font = "bold 14px 'Press Start 2P'";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(coord.num, pxX, pxY);
        ctx.restore();
      });

      ctx.fillStyle = "#222";
      ctx.fillRect(70, yBase + 355, 884, 8);
      ctx.fillStyle = "#ff1744";
      ctx.fillRect(70, yBase + 355, (activeMiniGame.timeLeft / 100) * 884, 8);

      drawPixelButton(ctx, 70, yBase + 375, 884, 35, "ABORT HACKING", false, "#ff1744", "10px 'Press Start 2P'");
    return;
  }

  if (activeMiniGame.type === "ping") {
      ctx.fillStyle = "rgba(255, 215, 0, 0.05)";
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.fillRect(50, yBase, 924, 340);
      ctx.strokeRect(50, yBase, 924, 340);

      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 16px 'Press Start 2P', monospace";
      ctx.fillText("⚡ DDoS Platform: Ping Spammer", 70, yBase + 45);
      
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "18px 'VT323', monospace";
      ctx.fillText(`Overwhelm their server! Spam click the button ${activeMiniGame.targetClicks} times!`, 70, yBase + 85);

      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 26px 'Press Start 2P', monospace";
      ctx.fillText(`${activeMiniGame.clicksCount} / ${activeMiniGame.targetClicks}`, 70, yBase + 135);

      drawPixelButton(ctx, 70, yBase + 165, 884, 80, "💥 PING!", false, "#ffd700", "18px 'Press Start 2P'");

      ctx.fillStyle = "#222";
      ctx.fillRect(70, yBase + 265, 884, 8);
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(70, yBase + 265, (activeMiniGame.timeLeft / 100) * 884, 8);

      drawPixelButton(ctx, 70, yBase + 285, 884, 35, "ABORT DDOS", false, "#ff1744", "10px 'Press Start 2P'");
    return;
  }

  if (activeMiniGame.type === "pour") {
      ctx.fillStyle = "rgba(255, 215, 0, 0.05)";
      ctx.strokeStyle = "#ffd700";
      ctx.lineWidth = 2;
      ctx.fillRect(50, yBase, 924, 300);
      ctx.strokeRect(50, yBase, 924, 300);

      ctx.fillStyle = "#ffd700";
      ctx.font = "bold 16px 'Press Start 2P', monospace";
      ctx.fillText("☕ Pouring Mini-game: Caffeine Brew", 70, yBase + 45);
      ctx.fillStyle = "rgba(255,255,255,0.7)";
      ctx.font = "18px 'VT323', monospace";
      ctx.fillText("Pour drink now! Lock the pointer inside the green target zone for 2x benefits.", 70, yBase + 85);

      ctx.fillStyle = "#222";
      ctx.fillRect(70, yBase + 120, 884, 40);

      const startX = 70 + (activeMiniGame.greenZoneStart / 100) * 884;
      const widthX = ((activeMiniGame.greenZoneEnd - activeMiniGame.greenZoneStart) / 100) * 884;
      ctx.fillStyle = "#39ff14";
      ctx.fillRect(startX, yBase + 120, widthX, 40);

      const needleX = 70 + (activeMiniGame.pointerPosition / 100) * 884;
      ctx.fillStyle = "#ff1744";
      ctx.fillRect(needleX - 4, yBase + 115, 8, 50);

      drawPixelButton(ctx, 70, yBase + 195, 420, 50, "POUR / BREW", false, "#39ff14", "12px 'Press Start 2P'");
      drawPixelButton(ctx, 534, yBase + 195, 420, 50, "ABORT BREW", false, "#ff1744", "12px 'Press Start 2P'");

      ctx.fillStyle = "#222";
      ctx.fillRect(70, yBase + 265, 884, 8);
      ctx.fillStyle = "#ffd700";
      ctx.fillRect(70, yBase + 265, (activeMiniGame.timeLeft / 100) * 884, 8);
    return;
  }
}

function drawProjectMiniGame(ctx, w) {
  drawMiniGamePanel(ctx, w, 500);
}

function drawGigsTab(ctx, w) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px 'Press Start 2P', monospace";
  ctx.fillText("DEVELOPER WORKOUT & GIGS", 50, 190);

  if (activeMiniGame) {
    drawMiniGamePanel(ctx, w, 220);
  } else {
    ctx.fillStyle = "#ffd700";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText("1. TRAINING GYM", 50, 240);

    const xpCostText = gameState.level > 1 ? "-15 XP" : "FREE";
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'VT323', monospace";
    ctx.fillText("Code Class (-10 Energy)", 50, 275);
    drawPixelButton(ctx, 50, 285, 280, 45, `TRAIN CODE (${xpCostText})`, false, "#00e5ff", "10px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText("Design Class (-10 Energy)", 50, 360);
    drawPixelButton(ctx, 50, 370, 280, 45, `TRAIN DESIGN (${xpCostText})`, false, "#b388ff", "10px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText("Agile Seminar (-10 Energy)", 50, 445);
    drawPixelButton(ctx, 50, 455, 280, 45, `TRAIN AGILE (${xpCostText})`, false, "#ffd700", "10px 'Press Start 2P'");

    // Store Column
    ctx.fillStyle = "#39ff14";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText("2. STORE ITEMS", 380, 240);

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'VT323', monospace";
    ctx.fillText("Lukewarm Drip Coffee ($20)", 380, 275);
    drawPixelButton(ctx, 380, 285, 280, 45, "BUY COFFEE (+10⚡)", false, "#39ff14", "9px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText("Java Volt Battery Acid ($50)", 380, 360);
    drawPixelButton(ctx, 380, 370, 280, 45, "BUY ENERGY (+25⚡)", false, "#39ff14", "9px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText("Nootropic Focus Pill ($100)", 380, 445);
    drawPixelButton(ctx, 380, 455, 280, 45, "BUY NOOTROPIC (+5🎯)", false, "#39ff14", "9px 'Press Start 2P'");

    // Gigs Column
    ctx.fillStyle = "#ff1744";
    ctx.font = "bold 14px 'Press Start 2P', monospace";
    ctx.fillText("3. GIGS BOARD", 710, 240);

    const getXpCost = (id) => {
      if (id === "freelance_html") return gameState.level === 1 ? 0 : 3;
      if (id === "crack_competitor") return 10;
      if (id === "ransomware") return 20;
      if (id === "ddos_rival") return 40;
      return 0;
    };

    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 16px 'VT323', monospace";
    ctx.fillText(`CSS Div Align (Cost: 2🎯, ${getXpCost("freelance_html")} XP)`, 710, 275);
    drawPixelButton(ctx, 710, 285, 260, 45, "RUN DIV ALIGN ($50)", false, "#ff1744", "8px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Crack DRM (Cost: 4🎯, 10 XP)`, 710, 360);
    drawPixelButton(ctx, 710, 370, 260, 45, "RUN CRACK DRM ($200)", false, "#ff1744", "8px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Ransomware Fridge (Cost: 6🎯, 20 XP)`, 710, 445);
    drawPixelButton(ctx, 710, 455, 260, 45, "RUN RANSOMWARE ($800)", false, "#ff1744", "8px 'Press Start 2P'");

    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Toaster DDoS (Cost: 8🎯, 40 XP)`, 710, 530);
    drawPixelButton(ctx, 710, 540, 260, 45, "RUN DDoS PLAT ($3000)", false, "#ff1744", "8px 'Press Start 2P'");
  }

  drawPixelButton(ctx, 400, 930, 224, 50, "ZOOM OUT", false, "#ff1744", "12px 'Press Start 2P'");
}

function drawStaffTab(ctx, w) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px 'Press Start 2P', monospace";
  ctx.fillText("STAFF & RESEARCH LAB", 50, 190);

  ctx.font = "20px 'VT323', monospace";
  ctx.fillStyle = "rgba(255,255,255,0.5)";
  ctx.fillText(`Hired Personnel: ${gameState.employees.length} / ${OFFICE_TIERS[gameState.office_tier]?.capacity || 0}`, 50, 225);

  ctx.fillStyle = "#b388ff";
  ctx.font = "bold 14px 'Press Start 2P', monospace";
  ctx.fillText("OFFICE EXPANSION", 50, 270);

  Object.keys(OFFICE_TIERS).forEach((tierKey, idx) => {
    const tier = OFFICE_TIERS[tierKey];
    const y = 300 + idx * 55;
    const isOwned = gameState.office_tier === tierKey;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px 'VT323', monospace";
    ctx.fillText(`${tier.name} — Cap: ${tier.capacity}`, 50, y);
    drawPixelButton(ctx, 50, y + 10, 400, 36, isOwned ? "CURRENT OFFICE" : `UPGRADE $${tier.cost}`, isOwned, isOwned ? "#39ff14" : "#b388ff", "8px 'Press Start 2P'");
  });

  ctx.fillStyle = "#00e5ff";
  ctx.font = "bold 14px 'Press Start 2P', monospace";
  ctx.fillText("RECRUITMENT BOARD", 50, 540);
  
  const recruitTypes = [
    { id: "junior_dev", name: "ChatGPT Prompter", cost: 1000, salary: 50 },
    { id: "junior_artist", name: "MS Paint Artist", cost: 1000, salary: 50 },
    { id: "senior_dev", name: "Archmage coder", cost: 5000, salary: 200 },
    { id: "senior_artist", name: "Vibe director", cost: 5000, salary: 200 }
  ];

  recruitTypes.forEach((rec, idx) => {
    const y = 560 + idx * 58;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px 'VT323', monospace";
    ctx.fillText(`${rec.name} ($${rec.cost}) — Sal: $${rec.salary}/s`, 50, y);
    drawPixelButton(ctx, 50, y + 8, 380, 36, "RECRUIT CANDIDATE", false, "#00e5ff", "9px 'Press Start 2P'");
  });

  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 14px 'Press Start 2P', monospace";
  ctx.fillText("RESEARCH LAB LABS", 520, 540);

  const researchTypes = [
    { id: "unlocked_console", name: "Unlock Consoles", cost: 10, unlocked: gameState.unlocked_console },
    { id: "researched_multiplayer", name: "Multiplayer Engine", cost: 25, unlocked: gameState.researched_multiplayer },
    { id: "ai_behavior", name: "AI NPC Algorithms", cost: 50, unlocked: gameState.ai_behavior }
  ];

  researchTypes.forEach((res, idx) => {
    const y = 560 + idx * 75;
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 15px 'VT323', monospace";
    ctx.fillText(`${res.name} (Requires: ${res.cost} RP)`, 520, y);
    drawPixelButton(ctx, 520, y + 8, 420, 38, res.unlocked ? "RESEARCH COMPLETED" : "PURCHASE RESEARCH", res.unlocked, res.unlocked ? "#39ff14" : "#ffd700", "9px 'Press Start 2P'");
  });

  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 14px 'Press Start 2P', monospace";
  ctx.fillText(`TEAM ROSTER:`, 50, 600);
  
  let xOffset = 50;
  if (gameState.employees.length === 0) {
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.font = "18px 'VT323', monospace";
    ctx.fillText("No personnel hired. You are codemonkeying alone.", 50, 635);
  } else {
    gameState.employees.forEach((emp, idx) => {
      if (idx < 4) {
        ctx.fillStyle = "#39ff14";
        ctx.font = "bold 14px 'VT323', monospace";
        ctx.fillText(`${emp.name.split(' ')[0]}`, xOffset, 630);
        drawPixelButton(ctx, xOffset, 642, 190, 35, "DISMISS (FIRE)", false, "#ff1744", "8px 'Press Start 2P'");
        xOffset += 220;
      }
    });
  }

  drawPixelButton(ctx, 400, 930, 224, 50, "ZOOM OUT", false, "#ff1744", "12px 'Press Start 2P'");
}

function drawLeaderboardTab(ctx, w) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px 'Press Start 2P', monospace";
  ctx.fillText("GLOBAL NET WORTH LEADERBOARDS", 50, 190);

  const list = window.leaderboardCache || [];
  
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.lineWidth = 2;
  
  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(50, 240, 924, 45);
  ctx.strokeRect(50, 240, 924, 45);

  ctx.fillStyle = "#ffd700";
  ctx.font = "12px 'Press Start 2P', monospace";
  ctx.fillText("RANK", 70, 270);
  ctx.fillText("STUDIO PROFILE", 200, 270);
  ctx.fillText("OFFICE STATUS", 600, 270);
  ctx.fillText("NET WORTH", 820, 270);

  ctx.font = "20px 'VT323', monospace";
  list.forEach((subject, index) => {
    const y = 305 + index * 52;
    
    ctx.fillStyle = index === 0 ? "#ffd700" : "#ffffff";
    ctx.fillText(`#${index + 1}`, 70, y);
    
    ctx.fillStyle = subject.color || "#00e5ff";
    ctx.fillText(subject.username.toUpperCase(), 200, y);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(subject.company_name, 200, y + 20);

    ctx.fillStyle = "#ffffff";
    ctx.fillText(subject.office_tier, 600, y);
    ctx.fillText(`$${parseFloat(subject.net_worth).toLocaleString(undefined, { minimumFractionDigits: 2 })}`, 820, y);
    
    ctx.strokeStyle = "rgba(255,255,255,0.04)";
    ctx.beginPath();
    ctx.moveTo(50, y + 28);
    ctx.lineTo(974, y + 28);
    ctx.stroke();
  });

  drawPixelButton(ctx, 400, 930, 224, 50, "ZOOM OUT", false, "#ff1744", "12px 'Press Start 2P'");
}

function drawProfileTab(ctx, w) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 20px 'Press Start 2P', monospace";
  ctx.fillText("DEVELOPER AUTHENTICATION STATUS", 50, 190);

  ctx.font = "20px 'VT323', monospace";
  if (isUserLoggedIn) {
    ctx.fillStyle = "#39ff14";
    ctx.fillText("ACCOUNT SYNCHRONIZED: ONLINE STATUS", 50, 240);
    ctx.fillStyle = "#ffffff";
    ctx.fillText(`Profile Tag: ${localStorage.getItem("tycoon_active_username") || "Guest"}`, 50, 280);
    ctx.fillText("All saves are actively syncing to cloud databases automatically.", 50, 310);

    drawPixelButton(ctx, 200, 400, 420, 50, "LOG OUT PROFILE", false, "#ff1744", "12px 'Press Start 2P'");
  } else {
    ctx.fillStyle = "#ff1744";
    ctx.fillText("PLAYING IN GUEST MODE: OFFLINE LOCAL ARCHIVES", 50, 240);
    ctx.fillStyle = "rgba(255,255,255,0.5)";
    ctx.fillText("To preserve net worth rankings, create or log in to a profile.", 50, 270);

    ctx.fillStyle = "#ffffff";
    ctx.fillText("ENTER USERNAME:", 50, 330);
    ctx.fillStyle = focusedInputField === 'username' ? "#00e5ff" : "#1a1a20";
    ctx.fillRect(200, 305, 400, 35);
    ctx.strokeStyle = "#444";
    ctx.strokeRect(200, 305, 400, 35);
    ctx.fillStyle = "#fff";
    ctx.fillText(profileUsernameText + (focusedInputField === 'username' ? "_" : ""), 210, 328);

    ctx.fillText("ENTER PASSWORD:", 50, 390);
    ctx.fillStyle = focusedInputField === 'password' ? "#00e5ff" : "#1a1a20";
    ctx.fillRect(200, 365, 400, 35);
    ctx.strokeRect(200, 365, 400, 35);
    ctx.fillStyle = "#fff";
    ctx.fillText("*".repeat(profilePasswordText.length) + (focusedInputField === 'password' ? "_" : ""), 210, 388);

    drawPixelButton(ctx, 200, 430, 400, 45, "SUBMIT REGISTER / LOGIN", false, "#ffd700", "11px 'Press Start 2P'");
    drawPixelButton(ctx, 200, 490, 400, 45, "FAST LOGIN AS RANDOM GUEST", false, "#39ff14", "10px 'Press Start 2P'");
  }

  drawPixelButton(ctx, 400, 930, 224, 50, "ZOOM OUT", false, "#ff1744", "12px 'Press Start 2P'");
}

function drawAuxScreen() {
  if (!auxScreenCtx) return;
  const ctx = auxScreenCtx;
  const w = 512;
  const h = 512;
  
  ctx.fillStyle = "#020204";
  ctx.fillRect(0, 0, w, h);
  
  ctx.fillStyle = "rgba(255, 255, 255, 0.012)";
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 2);
  }
  
  ctx.fillStyle = "#111116";
  ctx.fillRect(0, 0, w, 50);
  ctx.strokeStyle = "rgba(255,255,255,0.08)";
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.lineTo(w, 50);
  ctx.stroke();
  
  ctx.fillStyle = "#39ff14";
  ctx.font = "bold 13px 'Press Start 2P', monospace";
  ctx.fillText("💬 COMMUNITY LIVE FEED", 20, 32);
  
  ctx.font = "18px 'VT323', monospace";
  let yOffset = 80;
  
  const chatLogs = consoleLogs.slice(-15);
  chatLogs.forEach(log => {
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillText(`[${log.time || '00:00'}]`, 15, yOffset);
    
    ctx.fillStyle = log.color || "#00e5ff";
    ctx.fillText(`${log.user || 'SYSTEM'}:`, 70, yOffset);
    
    ctx.fillStyle = "#ffffff";
    let msg = log.text || "";
    if (msg.length > 50) msg = msg.substring(0, 48) + "...";
    ctx.fillText(msg, 180, yOffset);
    
    yOffset += 28;
  });
  
  if (auxScreenTexture) {
    auxScreenTexture.needsUpdate = true;
  }
}

function drawLeaderboardWallPoster() {
  if (!leaderboardCtx) return;
  const ctx = leaderboardCtx;
  const w = 512;
  const h = 512;

  ctx.fillStyle = "#0c0d12";
  ctx.fillRect(0, 0, w, h);
  
  ctx.strokeStyle = "#b388ff";
  ctx.lineWidth = 10;
  ctx.strokeRect(5, 5, w - 10, h - 10);
  
  ctx.fillStyle = "#ffd700";
  ctx.font = "bold 20px 'Press Start 2P', monospace";
  ctx.textAlign = "center";
  ctx.fillText("HALL OF FAME", w / 2, 70);

  ctx.strokeStyle = "rgba(179,136,255,0.3)";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(30, 100);
  ctx.lineTo(w - 30, 100);
  ctx.stroke();

  ctx.font = "22px 'VT323', monospace";
  ctx.textAlign = "left";

  const list = window.leaderboardCache || [
    { username: "CodeMaster99", company_name: "Byte Studios", net_worth: 15000.00 },
    { username: "IndieGamerX", company_name: "Solo Garage", net_worth: 3500.00 },
    { username: "NerveBreaker", company_name: "Torn Games LLC", net_worth: 89000.00 }
  ];

  list.forEach((subject, idx) => {
    const y = 140 + idx * 60;
    ctx.fillStyle = idx === 0 ? "#ffd700" : "#ffffff";
    ctx.fillText(`#${idx + 1} ${subject.username.toUpperCase()}`, 40, y);
    ctx.fillStyle = "rgba(255,255,255,0.4)";
    ctx.fillText(`${subject.company_name} - $${parseFloat(subject.net_worth).toLocaleString(undefined, { maximumFractionDigits: 0 })}`, 40, y + 22);
  });
  
  ctx.textAlign = "center";
  ctx.fillStyle = "rgba(255,255,255,0.3)";
  ctx.font = "14px 'VT323', monospace";
  ctx.fillText("Basement Tycoon Rankings 2026", w / 2, 470);

  if (leaderboardTexture) {
    leaderboardTexture.needsUpdate = true;
  }
}

window.drawMainScreen = drawMainScreen;
window.drawAuxScreen = drawAuxScreen;
window.drawLeaderboardWallPoster = drawLeaderboardWallPoster;
window.init3DScene = init3DScene;

