// supabaseUrl and supabaseKey are already declared in supabase.js (loaded first)
let initializedClient = null;

function getSupabase() {
  if (window.supabaseClient) return window.supabaseClient;
  if (initializedClient) return initializedClient;
  const lib = window.supabase;
  if (lib && typeof lib.createClient === "function") {
    initializedClient = lib.createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    });
    window.supabaseClient = initializedClient;
    return initializedClient;
  }
  return null;
}

const supabaseClientApi = new Proxy({}, {
  get(target, prop) {
    const client = getSupabase();
    if (!client) {
      throw new Error("Supabase client is not initialized. Please check your internet connection and reload the page.");
    }
    const value = client[prop];
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  }
});

window.supabaseClientApi = supabaseClientApi;

const TycoonAPI = {
  isLoggedIn() {
    const keys = Object.keys(localStorage);
    const authKey = keys.find(k => k.startsWith('sb-') && k.endsWith('-auth-token'));
    return !!(authKey && localStorage.getItem(authKey));
  },

  async logout() {
    await supabaseClientApi.auth.signOut();
    localStorage.removeItem("tycoon_active_username");
    localStorage.removeItem("tycoon_color");
  },

  async signupWithEmail(email, username, password, dob, zodiac, specialization, color) {
    // Check if username already exists in profiles table
    try {
      const { data: existing, error: checkError } = await supabaseClientApi
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (!checkError && existing) {
        throw new Error("That codename/username is already registered. Choose another.");
      }
    } catch (err) {
      console.warn("Could not check duplicate username on database, proceeding. Details:", err.message);
    }

    const { data, error } = await supabaseClientApi.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          username: username,
          date_of_birth: dob,
          zodiac: zodiac,
          specialization: specialization,
          color: color
        }
      }
    });

    if (error) throw new Error(error.message);
    return data;
  },

  async loginWithEmail(email, password) {
    const { data, error } = await supabaseClientApi.auth.signInWithPassword({
      email: email,
      password: password
    });

    if (error) throw new Error("Invalid email or password. Please try again.");

    // Fetch matching user profile
    let profile = null;
    try {
      const { data: prof, error: pError } = await supabaseClientApi
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .maybeSingle();
      if (!pError) profile = prof;
    } catch (e) {
      console.warn("Could not query profile on login:", e.message);
    }

    return {
      token: data.session.access_token,
      user: data.user,
      profile: profile
    };
  },

  async resetPassword(email) {
    const { error } = await supabaseClientApi.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin + '/signup.html'
    });
    if (error) throw new Error(error.message);
    return { success: true };
  },

  async getProfile() {
    const { data: { session }, error: sError } = await supabaseClientApi.auth.getSession();
    if (sError || !session) throw new Error("Session required");

    const userId = session.user.id;

    // Fetch profile settings
    let profile = {
      username: session.user.user_metadata?.username || session.user.email.split("@")[0],
      zodiac: session.user.user_metadata?.zodiac || "Aries",
      specialization: session.user.user_metadata?.specialization || "RPG Developer",
      color: session.user.user_metadata?.color || "#00e5ff"
    };

    try {
      const { data: dbProfile, error: pError } = await supabaseClientApi
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (!pError && dbProfile) {
        profile = dbProfile;
      }
    } catch (err) {
      console.warn("Profiles table not readable/accessible. Using local metadata fallback.", err.message);
    }

    // Fetch Tycoon stats
    let stats = null;
    try {
      const { data: dbStats, error: stError } = await supabaseClientApi
        .from('dev_tycoon_stats')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();

      if (!stError && dbStats) {
        stats = dbStats;
      }
    } catch (err) {
      console.warn("dev_tycoon_stats table not readable/accessible. Using localStorage fallback.", err.message);
    }

    return {
      username: profile.username,
      zodiac: profile.zodiac,
      specialization: profile.specialization,
      color: profile.color,
      stats: stats
    };
  },

  async saveStats(statsPayload) {
    const { data: { session } } = await supabaseClientApi.auth.getSession();
    if (!session) return { success: false, reason: "No session" };
    const userId = session.user.id;

    try {
      // Upsert stats
      const { error } = await supabaseClientApi
        .from('dev_tycoon_stats')
        .upsert({
          user_id: userId,
          company_name: statsPayload.company_name,
          office_tier: statsPayload.office_tier,
          cash: parseFloat(statsPayload.cash),
          net_worth: parseFloat(statsPayload.net_worth),
          coding_skill: parseInt(statsPayload.coding_skill),
          design_skill: parseInt(statsPayload.design_skill),
          management_skill: parseInt(statsPayload.management_skill),
          research_points: parseInt(statsPayload.research_points),
          games_released: parseInt(statsPayload.games_released),
          games_sold: parseInt(statsPayload.games_sold),
          employees_count: parseInt(statsPayload.employees_count),
          updated_at: new Date().toISOString()
        });

      if (error) throw error;
      return { success: true };
    } catch (err) {
      console.warn("Failed to save stats to Supabase. Fallback to localStorage active. Reason:", err.message);
      return { success: false, error: err.message };
    }
  },

  async getLeaderboards() {
    try {
      // Fetch stats
      const { data: stats, error: sErr } = await supabaseClientApi
        .from('dev_tycoon_stats')
        .select('*')
        .order('net_worth', { ascending: false })
        .limit(50);
      
      if (sErr) throw sErr;

      // Fetch profiles
      const { data: profiles, error: pErr } = await supabaseClientApi
        .from('profiles')
        .select('*');
      
      const profileMap = {};
      if (!pErr && profiles) {
        profiles.forEach(p => {
          profileMap[p.id] = p;
        });
      }

      // Map statistics
      const leaderboardList = (stats || []).map(s => {
        const p = profileMap[s.user_id] || { 
          username: 'Anonymous Dev', 
          color: '#00e5ff',
          specialization: 'Indie Dev'
        };
        return {
          username: p.username,
          company_name: s.company_name || 'Garage Studio',
          color: p.color || '#00e5ff',
          net_worth: parseFloat(s.net_worth || 0),
          games_released: parseInt(s.games_released || 0),
          office_tier: s.office_tier || 'Garage'
        };
      });

      return leaderboardList;
    } catch (err) {
      console.warn("Could not query leaderboards from server, generating simulated local leaderboard:", err.message);
      return []; // Return empty, UI will show simulated or offline state
    }
  }
};

window.TycoonAPI = TycoonAPI;
