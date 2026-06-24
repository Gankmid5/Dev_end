// ═══════════════════════════════════════════════
// Dev Tycoon — Account Portal (signup.js)
// Handles sign up, login, profile edit, logout,
// and layout details.
// ═══════════════════════════════════════════════

let currentMode = "register";

// DOM Elements
const signupForm = document.getElementById("signup-form");
const emailInput = document.getElementById("email-input");
const usernameInput = document.getElementById("username-input");
const dobInput = document.getElementById("dob-picker");
const passwordInput = document.getElementById("password-input");
const confirmPasswordInput = document.getElementById("confirm-password-input");
const ageCheckbox = document.getElementById("age-checkbox");
const termsCheckbox = document.getElementById("terms-checkbox");
const formError = document.getElementById("form-error");
const zodiacSelect = document.getElementById("zodiac-select");
const specializationSelect = document.getElementById("specialization-select");
const colorSelect = document.getElementById("color-select");
const submitBtn = document.getElementById("submit-btn");

// Toggle elements
const togglePasswordBtn = document.getElementById("toggle-password-btn");
const tabRegisterBtn = document.getElementById("tab-register-btn");
const tabLoginBtn = document.getElementById("tab-login-btn");
const authTabs = document.getElementById("auth-tabs");
const panelTitle = document.getElementById("panel-title");

// Profile display elements
const activeProfileDetails = document.getElementById("active-profile-details");
const activeCodenameDisplay = document.getElementById("active-codename-display");
const activeEmailDisplay = document.getElementById("active-email-display");
const activeMetaDisplay = document.getElementById("active-meta-display");
const editProfileBtn = document.getElementById("edit-profile-btn");
const logoutBtn = document.getElementById("logout-btn");
const avatarGlowOrb = document.getElementById("avatar-glow-orb");
const avatarContainer = document.getElementById("avatar-container");
const headerProfileBadge = document.getElementById("header-profile-badge");
const activeRankDisplay = document.getElementById("active-rank-display");

const OFFICE_TIER_LABELS = {
  Garage: "Parent's Damp Basement",
  CoWorking: "Overpriced Co-Working Desk",
  IndieStudio: "Hipster Loft with Single Window",
  MegaCampus: "Mega-Corp Subterranean Bunker"
};

function getOfficeTierLabel(tierKey) {
  return OFFICE_TIER_LABELS[tierKey] || tierKey || "Garage";
}

function loadLocalGameState() {
  const activeUser = localStorage.getItem("tycoon_active_username");
  if (activeUser) {
    const userKey = `dev_tycoon_local_state_${activeUser}`;
    const userState = localStorage.getItem(userKey);
    if (userState) return JSON.parse(userState);
  }
  const guestState = localStorage.getItem("dev_tycoon_local_state_guest");
  return guestState ? JSON.parse(guestState) : null;
}

function statsFromGameState(state) {
  if (!state) return null;
  return {
    net_worth: state.net_worth ?? 500,
    cash: state.cash ?? 500,
    office_tier: state.office_tier ?? "Garage",
    coding_skill: state.coding_skill ?? 10,
    design_skill: state.design_skill ?? 10,
    management_skill: state.management_skill ?? 10,
    games_released: state.games_released ?? 0,
    games_sold: state.games_sold ?? 0,
    employees_count: state.employees_count ?? (state.employees?.length || 0)
  };
}

// Signup-only groups
const usernameGroup = document.getElementById("username-group");
const dobGroup = document.getElementById("dob-group");
const confirmPasswordGroup = document.getElementById("confirm-password-group");
const additionalFields = document.getElementById("additional-fields");
const legalCheckboxes = document.getElementById("legal-checkboxes");
const passwordStrength = document.getElementById("password-strength");
const strengthBarFill = document.getElementById("strength-bar-fill");
const strengthLabel = document.getElementById("strength-label");
const forgotPasswordRow = document.getElementById("forgot-password-row");

// Modals
const termsModal = document.getElementById("terms-modal");
const privacyModal = document.getElementById("privacy-modal");
const termsLink = document.getElementById("terms-link");
const privacyLink = document.getElementById("privacy-link");
const termsClose = document.getElementById("terms-close");
const privacyClose = document.getElementById("privacy-close");

// Email Verification Modal
const verifyEmailModal = document.getElementById("verify-email-modal");
const verifyEmailDisplay = document.getElementById("verify-email-display");
const resendVerificationBtn = document.getElementById("resend-verification-btn");
const verifyCloseBtn = document.getElementById("verify-close-btn");
const goHomeBtn = document.getElementById("go-home-btn");

// ═══════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════
window.addEventListener("DOMContentLoaded", () => {
  setupPasswordToggle();
  setupPasswordStrengthMeter();
  setupAuthTabs();
  setupModals();
  setupVerificationModal();
  setupFormSubmit();
  setupProfileActions();
  loadSavedProfile();
});

// PASSWORD VISIBILITY TOGGLE
function setupPasswordToggle() {
  if (togglePasswordBtn) {
    togglePasswordBtn.addEventListener("click", () => {
      const isHidden = passwordInput.type === "password";
      passwordInput.type = isHidden ? "text" : "password";
      togglePasswordBtn.innerText = isHidden ? "🙈" : "👁️";
    });
  }
}

// PASSWORD STRENGTH METER
function setupPasswordStrengthMeter() {
  if (passwordInput) {
    passwordInput.addEventListener("input", () => {
      if (currentMode === "login") {
        strengthBarFill.style.width = "0%";
        strengthLabel.innerText = "";
        return;
      }

      const val = passwordInput.value;
      const result = evaluatePasswordStrength(val);

      strengthBarFill.style.width = result.percent + "%";
      strengthBarFill.style.background = result.color;
      strengthLabel.innerText = result.label;
      strengthLabel.style.color = result.color;
    });
  }
}

function evaluatePasswordStrength(password) {
  if (!password || password.length === 0) {
    return { percent: 0, label: "", color: "transparent" };
  }

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { percent: 25, label: "Weak", color: "#ff1744" };
  if (score <= 3) return { percent: 50, label: "Fair", color: "#ff9100" };
  if (score <= 4) return { percent: 75, label: "Good", color: "#ffd700" };
  return { percent: 100, label: "Strong", color: "#00e676" };
}

// AUTH TAB SWITCHING (Register / Login)
function setupAuthTabs() {
  if (tabRegisterBtn) {
    tabRegisterBtn.addEventListener("click", () => {
      currentMode = "register";
      updateFormForMode();
    });
  }

  if (tabLoginBtn) {
    tabLoginBtn.addEventListener("click", () => {
      currentMode = "login";
      updateFormForMode();
    });
  }
}

function updateFormForMode() {
  clearFormError();

  const isRegister = currentMode === "register";
  const isLogin = currentMode === "login";
  const isEdit = currentMode === "edit";

  if (tabRegisterBtn) tabRegisterBtn.classList.toggle("active", isRegister);
  if (tabLoginBtn) tabLoginBtn.classList.toggle("active", isLogin);

  if (usernameGroup) usernameGroup.style.display = (isRegister || isEdit) ? "flex" : "none";
  if (dobGroup) dobGroup.style.display = isRegister ? "flex" : "none";
  if (confirmPasswordGroup) confirmPasswordGroup.style.display = (isRegister || isEdit) ? "flex" : "none";
  if (additionalFields) additionalFields.style.display = (isRegister || isEdit) ? "flex" : "none";
  if (legalCheckboxes) legalCheckboxes.style.display = isRegister ? "flex" : "none";
  if (passwordStrength) passwordStrength.style.display = isLogin ? "none" : "flex";
  if (forgotPasswordRow) forgotPasswordRow.style.display = isLogin ? "flex" : "none";

  if (usernameInput) usernameInput.required = isRegister || isEdit;
  if (dobInput) dobInput.required = isRegister;
  if (confirmPasswordInput) confirmPasswordInput.required = isRegister || isEdit;
  if (ageCheckbox) ageCheckbox.required = isRegister;
  if (termsCheckbox) termsCheckbox.required = isRegister;

  if (emailInput) {
    if (isEdit) {
      emailInput.disabled = true;
      emailInput.style.opacity = "0.5";
    } else {
      emailInput.disabled = false;
      emailInput.style.opacity = "1";
    }
  }

  const titleSpan = panelTitle ? panelTitle.querySelector("span") : null;
  if (isRegister) {
    if (titleSpan) titleSpan.innerText = "Create Your Account";
    if (submitBtn) submitBtn.innerText = "🔮 Create Account";
    if (passwordInput) passwordInput.placeholder = "Create a strong password...";
  } else if (isLogin) {
    if (titleSpan) titleSpan.innerText = "Welcome Back";
    if (submitBtn) submitBtn.innerText = "🔑 Log In";
    if (passwordInput) passwordInput.placeholder = "Enter your password...";
  } else if (isEdit) {
    if (titleSpan) titleSpan.innerText = "Edit Profile";
    if (submitBtn) submitBtn.innerText = "⚙️ Save Changes";
    if (passwordInput) passwordInput.placeholder = "New password (leave blank to keep current)...";
    if (passwordInput) passwordInput.required = false;
  }

  if (strengthBarFill) strengthBarFill.style.width = "0%";
  if (strengthLabel) strengthLabel.innerText = "";
}

function calculateAge(dobString) {
  const dob = new Date(dobString);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

// MODALS
function setupModals() {
  if (termsLink && termsModal) {
    termsLink.addEventListener("click", (e) => {
      e.preventDefault();
      termsModal.classList.add("visible");
    });
  }
  if (termsClose && termsModal) {
    termsClose.addEventListener("click", () => termsModal.classList.remove("visible"));
  }
  if (privacyLink && privacyModal) {
    privacyLink.addEventListener("click", (e) => {
      e.preventDefault();
      privacyModal.classList.add("visible");
    });
  }
  if (privacyClose && privacyModal) {
    privacyClose.addEventListener("click", () => privacyModal.classList.remove("visible"));
  }
}

function setupVerificationModal() {
  if (verifyCloseBtn && verifyEmailModal) {
    verifyCloseBtn.addEventListener("click", () => {
      verifyEmailModal.classList.remove("visible");
      window.location.href = "index.html";
    });
  }
  if (goHomeBtn && verifyEmailModal) {
    goHomeBtn.addEventListener("click", () => {
      verifyEmailModal.classList.remove("visible");
      window.location.href = "index.html";
    });
  }
}

// PROFILE ACTIONS
function setupProfileActions() {
  if (editProfileBtn) {
    editProfileBtn.addEventListener("click", async () => {
      try {
        const { data: { user } } = await window.supabaseClient.auth.getUser();
        if (user) {
          emailInput.value = user.email || "";

          let pData = user.user_metadata || {};
          try {
            const profileRes = await TycoonAPI.getProfile();
            pData = profileRes || pData;
          } catch(err) {}

          usernameInput.value = pData.username || pData.codename || "";
          usernameInput.disabled = true;
          zodiacSelect.value = pData.zodiac || "Aries";
          specializationSelect.value = pData.specialization || "RPG Specialist";
          colorSelect.value = pData.color || "#00e5ff";

          currentMode = "edit";
          updateFormForMode();
          signupForm.style.display = "flex";
          authTabs.style.display = "none";
        }
      } catch (err) {
        console.error("Failed to load profile for edit:", err);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await TycoonAPI.logout();
        showToast("Logged out successfully.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        console.error("Logout failed:", err);
      }
    });
  }
}

// FORM SUBMIT
function setupFormSubmit() {
  if (!signupForm) return;

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = emailInput.value.trim();
    const password = passwordInput.value;
    const confirmPassword = confirmPasswordInput.value;

    if (!email || (!password && currentMode !== "edit")) {
      showFormError("Please fill out all required authentication fields.");
      return;
    }

    if (currentMode === "register") {
      const username = usernameInput.value.trim();
      const dob = dobInput.value;

      if (password !== confirmPassword) {
        showFormError("Passwords do not match.");
        return;
      }

      if (!dob || calculateAge(dob) < 13) {
        showFormError("You must be at least 13 years old to register.");
        return;
      }

      try {
        setLoading(true);
        const data = await TycoonAPI.signupWithEmail(
          email,
          username,
          password,
          dob,
          zodiacSelect.value,
          specializationSelect.value,
          colorSelect.value
        );

        if (data.user) {
          if (verifyEmailDisplay) verifyEmailDisplay.innerText = email;
          if (verifyEmailModal) verifyEmailModal.classList.add("visible");
          setLoading(false);
          signupForm.style.display = "none";
          authTabs.style.display = "none";
          if (panelTitle) {
            panelTitle.querySelector("span").innerText = "Check Your Email";
          }
        }
      } catch (err) {
        showFormError(err.message || "Sign up failed.");
        setLoading(false);
      }
    } else if (currentMode === "login") {
      try {
        setLoading(true);
        const result = await TycoonAPI.loginWithEmail(email, password);

        const profile = result.profile || result.user.user_metadata || {};
        localStorage.setItem("tycoon_active_username", profile.username || profile.codename || "Developer");
        localStorage.setItem("tycoon_color", profile.color || "#00e5ff");

        showToast("Logged in successfully. Loading studio...", "success");
        if (window.SynthwaveAudio) SynthwaveAudio.playSFX("success");
        setTimeout(() => window.location.href = "index.html", 1200);
      } catch (err) {
        showFormError(err.message || "Login failed.");
        setLoading(false);
      }
    } else if (currentMode === "edit") {
      try {
        setLoading(true);
        // Update auth metadata
        const updateData = {
          data: {
            zodiac: zodiacSelect.value,
            specialization: specializationSelect.value,
            color: colorSelect.value
          }
        };
        if (password) updateData.password = password;

        const { error: authError } = await window.supabaseClient.auth.updateUser(updateData);
        if (authError) throw authError;

        // Try DB update
        try {
          await window.supabaseClient
            .from('profiles')
            .update({
              zodiac: zodiacSelect.value,
              specialization: specializationSelect.value,
              color: colorSelect.value
            })
            .eq('id', (await window.supabaseClient.auth.getUser()).data.user.id);
        } catch(dbErr) {}

        localStorage.setItem("tycoon_color", colorSelect.value);
        showToast("Profile updated successfully.", "success");
        setTimeout(() => window.location.reload(), 1000);
      } catch (err) {
        showFormError(err.message || "Profile update failed.");
        setLoading(false);
      }
    }
  });
}

// LOAD ACTIVE PROFILE
async function loadSavedProfile() {
  let user = null;
  try {
    const { data } = await window.supabaseClient.auth.getUser();
    user = data?.user || null;
  } catch (err) {}

  if (!user) {
    if (headerProfileBadge) headerProfileBadge.innerText = "GUEST";

    const guestState = loadLocalGameState();
    const guestStats = statsFromGameState(guestState);
    if (!guestStats) return;

    const guestName = (guestState.company_name || "Guest Developer").toUpperCase();
    if (activeCodenameDisplay) {
      activeCodenameDisplay.innerText = guestName;
      activeCodenameDisplay.style.color = "#00e5ff";
    }
    if (activeEmailDisplay) activeEmailDisplay.innerText = "Playing locally — no cloud sync";
    if (activeMetaDisplay) {
      activeMetaDisplay.innerHTML = `Specialization: <strong>Garage Indie</strong> | Zodiac: <strong>Stack Overflow</strong>`;
    }
    if (activeRankDisplay) {
      activeRankDisplay.innerText = `Studio Tier: ${getOfficeTierLabel(guestStats.office_tier)}`;
    }

    populateProfileStats(guestStats);
    if (signupForm) signupForm.style.display = "none";
    if (authTabs) authTabs.style.display = "none";
    if (activeProfileDetails) activeProfileDetails.style.display = "flex";
    if (panelTitle) panelTitle.querySelector("span").innerText = "Guest Studio Profile";
    return;
  }

  let profile = {
    username: user.user_metadata?.username || user.email.split("@")[0],
    zodiac: user.user_metadata?.zodiac || "Aries",
    specialization: user.user_metadata?.specialization || "RPG Specialist",
    color: user.user_metadata?.color || "#00e5ff"
  };

  let stats = {
    net_worth: 500,
    cash: 500,
    office_tier: "Garage",
    coding_skill: 10,
    design_skill: 10,
    management_skill: 10,
    games_released: 0,
    games_sold: 0,
    employees_count: 0
  };

  try {
    const res = await TycoonAPI.getProfile();
    profile = res;
    if (res.stats) stats = res.stats;
  } catch (dbErr) {
    const localStats = statsFromGameState(loadLocalGameState());
    if (localStats) stats = localStats;
  }

  // Populate UI
  const color = profile.color || "#00e5ff";
  const name = (profile.username || "Developer").toUpperCase();

  if (headerProfileBadge) {
    headerProfileBadge.innerText = name;
    headerProfileBadge.style.borderColor = color;
    headerProfileBadge.style.color = color;
  }

  if (activeCodenameDisplay) {
    activeCodenameDisplay.innerText = name;
    activeCodenameDisplay.style.color = color;
  }
  if (activeEmailDisplay) activeEmailDisplay.innerText = user.email;
  if (activeMetaDisplay) {
    activeMetaDisplay.innerHTML = `Specialization: <strong>${profile.specialization}</strong> | Zodiac: <strong>${profile.zodiac}</strong>`;
  }
  if (activeRankDisplay) {
    activeRankDisplay.innerText = `Studio Tier: ${getOfficeTierLabel(stats.office_tier)}`;
  }

  if (avatarGlowOrb) {
    avatarGlowOrb.style.background = color;
    avatarGlowOrb.style.boxShadow = `0 0 30px ${color}`;
  }
  if (avatarContainer) avatarContainer.style.borderColor = color;

  populateProfileStats(stats);

  if (signupForm) signupForm.style.display = "none";
  if (authTabs) authTabs.style.display = "none";
  if (activeProfileDetails) activeProfileDetails.style.display = "flex";
  if (panelTitle) {
    panelTitle.querySelector("span").innerText = "Active Studio Profile";
  }
}

function populateProfileStats(stats) {
  const netWorthEl = document.getElementById("prof-net-worth");
  const cashEl = document.getElementById("prof-cash");
  const officeEl = document.getElementById("prof-office-tier");
  const codingEl = document.getElementById("prof-coding");
  const designEl = document.getElementById("prof-design");
  const mgmtEl = document.getElementById("prof-management");
  const releasedEl = document.getElementById("prof-games-released");
  const soldEl = document.getElementById("prof-games-sold");
  const employeesEl = document.getElementById("prof-employees");

  if (netWorthEl) {
    netWorthEl.innerText = `$${parseFloat(stats.net_worth).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (cashEl) {
    cashEl.innerText = `$${parseFloat(stats.cash).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (officeEl) officeEl.innerText = getOfficeTierLabel(stats.office_tier);
  if (codingEl) codingEl.innerText = stats.coding_skill;
  if (designEl) designEl.innerText = stats.design_skill;
  if (mgmtEl) mgmtEl.innerText = stats.management_skill;
  if (releasedEl) releasedEl.innerText = stats.games_released;
  if (soldEl) soldEl.innerText = parseInt(stats.games_sold).toLocaleString();
  if (employeesEl) employeesEl.innerText = stats.employees_count;
}

// UI HELPERS
function showFormError(msg) {
  if (formError) {
    formError.innerText = msg;
    formError.style.display = "block";
  }
}

function clearFormError() {
  if (formError) {
    formError.innerText = "";
    formError.style.display = "none";
  }
}

function setLoading(isLoading) {
  if (submitBtn) {
    submitBtn.disabled = isLoading;
    if (isLoading) {
      submitBtn.dataset.origText = submitBtn.innerText;
      submitBtn.innerText = "Calibrating Connection...";
    } else if (submitBtn.dataset.origText) {
      submitBtn.innerText = submitBtn.dataset.origText;
    }
  }
}

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

window.addEventListener("DOMContentLoaded", () => {
  if (window.SynthwaveAudio) {
    SynthwaveAudio.boot("profile");
    SynthwaveAudio.setZone("profile");
  }
});
