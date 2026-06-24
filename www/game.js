// ═══════════════════════════════════════════════
// Dev Tycoon — Core Simulation Engine (game.js)
// ═══════════════════════════════════════════════

// --- Constants & Config ---
const OFFICE_TIERS = {
  Garage: { name: "Parent's Damp Basement", cost: 0, capacity: 0, speedMult: 1.0 },
  CoWorking: { name: "Overpriced Co-Working Desk", cost: 2000, capacity: 2, speedMult: 1.2 },
  IndieStudio: { name: "Hipster Loft with Single Window", cost: 15000, capacity: 5, speedMult: 1.5 },
  MegaCampus: { name: "Mega-Corp Subterranean Bunker", cost: 100000, capacity: 10, speedMult: 2.5 }
};

const EMPLOYEES_INFO = {
  junior_dev: { id: "junior_dev", name: "ChatGPT Prompter (Junior)", cost: 1000, salary: 50, techRate: 1, designRate: 0.1 },
  junior_artist: { id: "junior_artist", name: "MS Paint Specialist (Junior)", cost: 1000, salary: 50, techRate: 0.1, designRate: 1 },
  senior_dev: { id: "senior_dev", name: "StackOverflow Archmage (Senior)", cost: 5000, salary: 200, techRate: 4, designRate: 0.5 },
  senior_artist: { id: "senior_artist", name: "Vibe Director (Senior)", cost: 5000, salary: 200, techRate: 0.5, designRate: 4 },
  project_mgr: { id: "project_mgr", name: "Professional Stand-Up Host", cost: 12000, salary: 450, techRate: 2, designRate: 2, bugFixRate: 1 }
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
  const activeTab = params.get("tab");
  if (activeTab) {
    switchTab(activeTab);
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

// --- Console Log Helper ---
function addLog(title, desc) {
  const time = new Date().toLocaleTimeString();
  consoleLogs.push({ time, title, desc });
  if (consoleLogs.length > 50) consoleLogs.shift();

  const consoleEl = document.getElementById("terminal-console");
  if (consoleEl) {
    const trmLine = document.createElement("div");
    trmLine.className = "terminal-line";
    trmLine.innerHTML = `<span class="timestamp">[${time}]</span><strong>${title}</strong>: ${desc}`;
    consoleEl.appendChild(trmLine);
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
        const scale = g.scale || "Small";
        let cap = 1000;
        if (scale === "Medium") cap = 5000;
        if (scale === "Large") cap = 20000;
        if (scale === "AAA") cap = 80000;
        
        const isDead = g.age >= 120 || (g.totalRevenue || 0) >= cap;
        if (isDead) {
          addLog("Sales Concluded", `'${g.name}' has finished its sales run (Lifetime Rev: $${parseFloat(g.totalRevenue || 0).toLocaleString(undefined, { maximumFractionDigits: 0 })}).`);
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
}

// --- Training Actions (GYM) ---
function trainSkill(skillName) {
  if (gameState.energy < 10) {
    showToast("Insufficient energy. Take a rest!", "error");
    return;
  }

  gameState.energy -= 10;

  // Random XP gains based on spec modifier
  let xp = Math.floor(Math.random() * 3) + 1; // 1-3

  if (skillName === "coding_skill") {
    gameState.coding_skill += xp;
    addLog("Coding Workout", `Trained in algorithms. Coding improved by +${xp} (Now: ${gameState.coding_skill})`);
    showToast(`Coding Skill increased! +${xp}`, "success");
  } else if (skillName === "design_skill") {
    gameState.design_skill += xp;
    addLog("Design Workout", `Studied UI design templates. Design improved by +${xp} (Now: ${gameState.design_skill})`);
    showToast(`Design Skill increased! +${xp}`, "success");
  } else if (skillName === "management_skill") {
    gameState.management_skill += xp;
    addLog("Management Seminar", `Attended project management class. Management improved by +${xp} (Now: ${gameState.management_skill})`);
    showToast(`Management Skill increased! +${xp}`, "success");
  }

  saveGame();
  updateUI();
}

// --- Gigs System (CRIMES) ---
function runGig(gigId) {
  const gig = GIGS.find(g => g.id === gigId);
  if (!gig) return;

  if (gameState.nerve < gig.nerveCost) {
    showToast("Not enough nerve! Wait for your focus to recharge.", "error");
    return;
  }

  gameState.nerve -= gig.nerveCost;

  // Calculate success probability based on relevant skill levels
  // High skill increases success rate slightly
  const baseSuccess = gig.successRate;
  const userSkill = gameState[gig.skillRequired] || 10;
  const skillBonus = Math.min(0.20, (userSkill - 10) * 0.003); // Max +20% success
  const actualSuccess = Math.min(0.98, baseSuccess + skillBonus);

  const roll = Math.random();
  if (roll <= actualSuccess) {
    // Success
    const payout = Math.floor(Math.random() * (gig.rewardMax - gig.rewardMin + 1)) + gig.rewardMin;
    gameState.cash += payout;

    // Add XP
    gameState[gig.skillRequired] += gig.xpReward;

    // Play success SFX
    ChiptuneAudio.playSFX("success");

    addLog(`SUCCESS: ${gig.name}`, `Earned $${payout} and gained +${gig.xpReward} in ${gig.skillRequired.replace("_skill", "")}.`);
    showToast(`Gig Success! +$${payout}`, "success");
  } else {
    // Failure / Penalty
    const penalty = Math.floor(gig.rewardMin * 0.50);
    gameState.cash = Math.max(0, gameState.cash - penalty);
    
    // Play fail SFX
    ChiptuneAudio.playSFX("fail");

    addLog(`FAILURE: ${gig.name}`, `Busted by network firewalls. Lost $${penalty} in server penalties.`);
    showToast(`Gig Failed! Lost $${penalty}`, "error");
  }

  saveGame();
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
          <div class="card-item-desc">
            Staff Capacity: <strong>${tier.capacity}</strong> employees.<br>
            Dev Speed Multiplier: <strong>${tier.speedMult}x</strong> speed.
          </div>
          <button class="btn-primary" ${isOwned || !canAfford ? "disabled" : ""} onclick="buyOffice('${tierKey}')">
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
          <div class="card-item-desc">
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

  gameState.cash -= totalCost;
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

function startMiniGame(type) {
  if (gameState.energy < 5) {
    showToast("Requires 5 Energy to play!", "error");
    return;
  }

  // Clear previous timer
  if (miniGameTimer) clearInterval(miniGameTimer);

  activeMiniGame = {
    type: type,
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

  // Deduct energy
  gameState.energy -= 5;
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

  renderProjectProgress();
}

function cancelMiniGame() {
  if (miniGameTimer) clearInterval(miniGameTimer);
  activeMiniGame = null;
  addLog("Mini-game Cancelled", "Development cycle aborted.");
  renderProjectProgress();
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
  ChiptuneAudio.playSFX("success");
  const type = activeMiniGame.type;
  activeMiniGame = null;

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

  saveGame();
  renderProjectProgress();
  updateUI();
}

function failMiniGame(reason) {
  ChiptuneAudio.playSFX("fail");
  const type = activeMiniGame.type;
  activeMiniGame = null;

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
  const pMult = PLATFORMS[proj.platform].marketSize;

  // Rating curve (exponential bonus for excellent ratings)
  const ratingMult = Math.pow(rating / 7.0, 3.5);

  const initialSalesRate = Math.ceil(baseSales * pMult * ratingMult);

  // Reviews generated
  const reviewers = [
    { name: "IGNition", comments: [
      "Worse than formatting a hard drive. It made our reviewer cry in binary.",
      "Too much water. Also, the main menu was more fun than the actual gameplay.",
      "A solid average. It exists. It uses electricity. We did not fall asleep.",
      "Extremely good. We only found 12 memory leaks during our play session.",
      "Masterpiece! It cured my coffee addiction. 11/10 - would buy microtransactions again."
    ] },
    { name: "GameSpotter", comments: [
      "This isn't a game; it's a digital crime scene. My GPU started whispering 'why?'",
      "A mediocre experience. Like drinking decaf coffee at 2 AM.",
      "A fun weekend distraction, provided you don't mind clipping through the floor.",
      "Innovative mechanics! We spent 4 hours customizing the character's socks.",
      "It redefined the genre. I am going to write a 50-page essay on the loading screen."
    ] },
    { name: "Metacritic rating", comments: [
      "0/10 would not code again. Code comments are probably just 'Help me'.",
      "Not great, not terrible. It feels like a project made by a tired junior developer.",
      "Good vibes! Some nice code formatting, but the AI behavior is weird.",
      "Very impressive UI! They used actual border-radius instead of raw squares!",
      "A masterpiece of modern engineering. Should be preserved in the museum of clean code."
    ] }
  ];

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
    age: 0
  };

  gameState.active_games.push(releasedGame);
  if (!Array.isArray(gameState.portfolio)) gameState.portfolio = [];
  gameState.portfolio.push({ ...releasedGame });
  gameState.games_released += 1;

  addLog("Game Released!", `'${proj.name}' was published! Shelf revenue generating. Expected volume: ${initialSalesRate}/tick.`);
  showToast(`Released '${proj.name}'! Rating: ${rating.toFixed(1)}/10`, "success");

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
      // Simulate local AI competitors if empty
      const localUsername = localStorage.getItem("tycoon_active_username") || "Guest Dev";
      const simulated = [
        { username: localUsername, company_name: gameState.company_name, color: userColor, net_worth: gameState.net_worth, games_released: gameState.games_released, office_tier: gameState.office_tier },
        { username: "CodeMaster99", company_name: "Byte Studios", color: "#d500f9", net_worth: 15000.00, games_released: 8, office_tier: "IndieStudio" },
        { username: "IndieGamerX", company_name: "Solo Garage", color: "#ffd700", net_worth: 3500.00, games_released: 3, office_tier: "CoWorking" },
        { username: "NerveBreaker", company_name: "Torn Games LLC", color: "#ff1744", net_worth: 89000.00, games_released: 14, office_tier: "MegaCampus" }
      ];

      // Insert current player stats if not exist
      if (!simulated.find(s => s.username === localUsername)) {
        simulated.push({ username: localUsername, company_name: gameState.company_name, color: userColor, net_worth: gameState.net_worth, games_released: gameState.games_released, office_tier: gameState.office_tier });
      }

      simulated.sort((a, b) => b.net_worth - a.net_worth);
      renderLeaderboardRows(container, simulated);
      return;
    }

    // Render returned DB rows
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

  gameState.cash -= cost;
  if (energyGain > 0) {
    gameState.energy = Math.min(gameState.max_energy, gameState.energy + energyGain);
    addLog("Consumed Item", `Bought and drank ${label} for $${cost}. Gained +${energyGain} Energy.`);
    showToast(`Consumed ${label}! +${energyGain} Energy`, "success");
  }
  if (nerveGain > 0) {
    gameState.nerve = Math.min(gameState.max_nerve, gameState.nerve + nerveGain);
    addLog("Consumed Item", `Bought and consumed ${label} for $${cost}. Gained +${nerveGain} Nerve.`);
    showToast(`Consumed ${label}! +${nerveGain} Nerve Focus`, "success");
  }

  saveGame();
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

  if (campaignType === "social") {
    cost = 200;
    multiplier = 1.25;
    ageReduction = 30; // Extend life by 30 ticks
    label = "Social Media Hype";
  } else if (campaignType === "pr") {
    cost = 800;
    multiplier = 1.60;
    ageReduction = 80; // Extend life by 80 ticks
    label = "PR Blitz Campaign";
  }

  if (gameState.cash < cost) {
    showToast(`Insufficient funds! Marketing requires $${cost}`, "error");
    return;
  }

  gameState.cash -= cost;
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
      desc: "Draw a spinning green cube. Unlocks Console platform, claiming it represents 'Next Gen' tech.",
      owned: !!gameState.unlocked_console
    },
    {
      id: "researched_multiplayer",
      name: "Peer-to-Peer Spaghetti Netcode",
      cost: 100,
      desc: "Link players directly over unstable UDP sockets. Boosts metacritic ratings by +1.0 because reviewers love laggy PvP.",
      owned: !!gameState.researched_multiplayer
    },
    {
      id: "ai_behavior",
      name: "ChatGPT Copy-Paster v0.1",
      cost: 150,
      desc: "Automate keyboard mashing. Extends Syntax Striker coding mini-game duration from 15s to 25s so you have more time to search StackOverflow.",
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

  gameState.research_points -= cost;
  gameState[upgradeId] = true;

  addLog("Research Completed", `Researched upgrade: ${upgradeId.replace("unlocked_", "").replace("researched_", "").replace("_", " ").toUpperCase()}.`);
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

  gameState.cash -= cost;

  if (activityType === "pizza_party") {
    gameState.energy = Math.min(gameState.max_energy, gameState.energy + energyGain);
    addLog("Hosted Pizza Party", `Spent $${cost} to host a pizza party. Gained +35 Energy.`);
    showToast("Wood-fired pizzas delivered! +35 Energy", "success");
  } else if (activityType === "hackathon") {
    gameState.research_points += researchGain;
    addLog("Started Hackathon", `Spent $${cost} to organize a hackathon. Gained +15 Research Points.`);
    showToast("Hackathon complete! +15 RP", "success");
  } else if (activityType === "dev_con") {
    gameState.research_points += researchGain;
    gameState.coding_skill += skillGain;
    gameState.design_skill += skillGain;
    addLog("Attended DevCon", `Spent $${cost} to attend DevCon. Gained +20 Research Points and +5 Coding & Design.`);
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

      <button class="btn-primary" style="background:rgba(255,255,255,0.08); border-color:rgba(255,255,255,0.1); color:#fff; padding:12px; border-radius:8px;" onclick="concludeGameProject()">
        💼 Conclude Project & Return to Studio
      </button>
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

window.toggleMusic = toggleMusic;
window.ChiptuneAudio = ChiptuneAudio;

