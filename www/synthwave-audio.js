// ═══════════════════════════════════════════════
// SYNTHWAVE AUDIO ENGINE — procedural Web Audio
// Zone soundtracks + retro SFX for Dev end
// ═══════════════════════════════════════════════

const NOTE = {
  C2: 65.41, D2: 73.42, E2: 82.41, F2: 87.31, G2: 98.0, A2: 110.0, B2: 123.47,
  C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.0, A3: 220.0, B3: 246.94,
  C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.0, A4: 440.0, B4: 493.88,
  C5: 523.25, D5: 587.33, E5: 659.25, G5: 783.99
};

const ZONES = {
  company: {
    label: "MIDNIGHT OFFICE",
    bpm: 88,
    root: NOTE.A2,
    chord: [NOTE.A3, NOTE.C4, NOTE.E4, NOTE.G4],
    bass: [0, -1, 0, -1, 2, -1, 0, -1],
    arp: [0, 2, 1, 3, 2, 1, 0, 2],
    kick: [1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 0],
    hat: [1, 1, 1, 1, 1, 1, 1, 1],
    padVol: 0.06,
    bassVol: 0.09,
    arpVol: 0.05
  },
  develop: {
    label: "CODE RUNNER",
    bpm: 108,
    root: NOTE.D2,
    chord: [NOTE.D3, NOTE.F3, NOTE.A3, NOTE.C4],
    bass: [0, 0, -1, 0, 2, 0, -1, 0],
    arp: [0, 1, 2, 3, 2, 1, 0, 3],
    kick: [1, 0, 0, 1, 0, 0, 1, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0],
    padVol: 0.05,
    bassVol: 0.11,
    arpVol: 0.07
  },
  gigs: {
    label: "NEON HUSTLE",
    bpm: 118,
    root: NOTE.E2,
    chord: [NOTE.E3, NOTE.G3, NOTE.B3, NOTE.D4],
    bass: [0, -1, 0, 2, 0, -1, 0, 2],
    arp: [0, 2, 1, 3, 0, 2, 1, 3],
    kick: [1, 0, 1, 0, 1, 0, 1, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 1],
    hat: [1, 1, 0, 1, 1, 1, 0, 1],
    padVol: 0.055,
    bassVol: 0.12,
    arpVol: 0.08
  },
  staff: {
    label: "CORP BUNKER",
    bpm: 96,
    root: NOTE.G2,
    chord: [NOTE.G3, NOTE.Bb3 || 233.08, NOTE.D4, NOTE.F4],
    bass: [0, 0, -1, -1, 0, 2, -1, 0],
    arp: [0, 1, 0, 2, 1, 0, 3, 1],
    kick: [1, 0, 0, 0, 1, 0, 0, 1],
    snare: [0, 0, 0, 1, 0, 0, 1, 0],
    hat: [1, 0, 1, 1, 1, 0, 1, 1],
    padVol: 0.065,
    bassVol: 0.1,
    arpVol: 0.055
  },
  leaderboard: {
    label: "HALL OF FAME",
    bpm: 112,
    root: NOTE.C2,
    chord: [NOTE.C4, NOTE.E4, NOTE.G4, NOTE.B4],
    bass: [0, 2, 0, -1, 0, 2, 0, -1],
    arp: [3, 2, 1, 0, 1, 2, 3, 2],
    kick: [1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 1, 0, 0, 1, 1, 0],
    hat: [1, 1, 1, 0, 1, 1, 1, 0],
    padVol: 0.07,
    bassVol: 0.1,
    arpVol: 0.075
  },
  profile: {
    label: "LOGIN SEQUENCE",
    bpm: 92,
    root: NOTE.F2,
    chord: [NOTE.F3, NOTE.A3, NOTE.C4, NOTE.E4],
    bass: [0, -1, 0, 0, 2, -1, 0, 0],
    arp: [0, 1, 2, 1, 0, 3, 2, 1],
    kick: [1, 0, 0, 0, 1, 0, 0, 0],
    snare: [0, 0, 1, 0, 0, 0, 1, 0],
    hat: [1, 0, 1, 0, 1, 0, 1, 0],
    padVol: 0.06,
    bassVol: 0.085,
    arpVol: 0.06
  }
};

// Fix Bb reference
ZONES.staff.chord[1] = 233.08;

const SynthwaveAudio = {
  ctx: null,
  master: null,
  musicBus: null,
  sfxBus: null,
  reverb: null,
  isPlaying: false,
  currentZone: "gigs",
  step: 0,
  seqTimer: null,
  padNodes: [],
  _unlocked: false,
  _lastMeaningfulSfx: 0,
  musicEnabled: true,

  init() {
    if (this.ctx) return;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;

    this.ctx = new AC();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0.85;

    this.musicBus = this.ctx.createGain();
    this.musicBus.gain.value = 0.55;
    this.sfxBus = this.ctx.createGain();
    this.sfxBus.gain.value = 0.9;

    this.reverb = this.ctx.createConvolver();
    this.reverb.buffer = this._makeReverbImpulse(2.2, 2.5);

    const reverbSend = this.ctx.createGain();
    reverbSend.gain.value = 0.28;

    this.musicBus.connect(reverbSend);
    reverbSend.connect(this.reverb);
    this.reverb.connect(this.master);
    this.musicBus.connect(this.master);
    this.sfxBus.connect(this.master);
    this.master.connect(this.ctx.destination);
  },

  _makeReverbImpulse(duration, decay) {
    const rate = this.ctx ? this.ctx.sampleRate : 44100;
    const len = rate * duration;
    const buf = this.ctx ? this.ctx.createBuffer(2, len, rate) : null;
    if (!buf) return null;
    for (let c = 0; c < 2; c++) {
      const ch = buf.getChannelData(c);
      for (let i = 0; i < len; i++) {
        ch[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, decay);
      }
    }
    return buf;
  },

  boot(defaultZone) {
    const saved = localStorage.getItem("dev_end_music_enabled");
    this.musicEnabled = saved !== "false";
    if (defaultZone) this.currentZone = defaultZone;

    const unlock = () => {
      if (this._unlocked) return;
      this._unlocked = true;
      this.init();
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
      if (this.musicEnabled) this.start();
      document.removeEventListener("click", unlock);
      document.removeEventListener("keydown", unlock);
    };
    document.addEventListener("click", unlock);
    document.addEventListener("keydown", unlock);

    document.addEventListener("click", (e) => {
      if (e.target.closest("#music-toggle-btn, #hud-music-btn")) return;
      if (e.target.closest(".btn-primary, .btn-secondary, .zone-node[data-tab], .link-node[data-tab], .synth-btn-mini")) {
        this.playSFX("click");
      }
    });

    if (this.musicEnabled && !localStorage.getItem("dev_end_music_prompted")) {
      localStorage.setItem("dev_end_music_prompted", "1");
      setTimeout(() => {
        if (typeof showToast === "function") {
          showToast("🎵 Click anywhere to boot the synthwave soundtrack", "info");
        }
      }, 800);
    }
  },

  getZoneConfig(zone) {
    return ZONES[zone] || ZONES.gigs;
  },

  setZone(zone) {
    if (!ZONES[zone]) return;
    const changed = this.currentZone !== zone;
    this.currentZone = zone;
    if (changed && this.isPlaying) {
      this._crossfadeZone();
      this.playSFX("zone");
    }
    this._updateMusicButtons();
  },

  _crossfadeZone() {
    if (!this.musicBus) return;
    const t = this.ctx.currentTime;
    this.musicBus.gain.cancelScheduledValues(t);
    this.musicBus.gain.setValueAtTime(this.musicBus.gain.value, t);
    this.musicBus.gain.linearRampToValueAtTime(0.25, t + 0.15);
    this.musicBus.gain.linearRampToValueAtTime(0.55, t + 0.5);
    this._restartPad();
  },

  toggle() {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    if (this.isPlaying) {
      this.stop();
      this.musicEnabled = false;
      localStorage.setItem("dev_end_music_enabled", "false");
    } else {
      this.musicEnabled = true;
      localStorage.setItem("dev_end_music_enabled", "true");
      this._unlocked = true;
      this.start();
    }
    this._updateMusicButtons();
  },

  start() {
    if (!this.ctx) this.init();
    if (!this.ctx || this.isPlaying) return;
    this.isPlaying = true;
    this.step = 0;
    this._restartPad();
    const zone = this.getZoneConfig(this.currentZone);
    const beatMs = (60 / zone.bpm) * 1000 / 2;

    this.seqTimer = setInterval(() => this._tick(), beatMs);
    this._updateMusicButtons();
  },

  stop() {
    this.isPlaying = false;
    if (this.seqTimer) {
      clearInterval(this.seqTimer);
      this.seqTimer = null;
    }
    this._stopPad();
    this._updateMusicButtons();
  },

  _stopPad() {
    this.padNodes.forEach(n => {
      try { n.gain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 0.3); n.osc.stop(this.ctx.currentTime + 0.35); } catch (e) { /* */ }
    });
    this.padNodes = [];
  },

  _restartPad() {
    this._stopPad();
    if (!this.isPlaying || !this.ctx) return;
    const zone = this.getZoneConfig(this.currentZone);
    const now = this.ctx.currentTime;
    zone.chord.forEach((freq, i) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      osc.detune.value = (i - 1.5) * 8;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(zone.padVol, now + 1.2);
      const filt = this.ctx.createBiquadFilter();
      filt.type = "lowpass";
      filt.frequency.value = 1200;
      osc.connect(filt);
      filt.connect(gain);
      gain.connect(this.musicBus);
      osc.start(now);
      this.padNodes.push({ osc, gain });
    });
  },

  _tick() {
    if (!this.isPlaying || !this.ctx) return;
    const zone = this.getZoneConfig(this.currentZone);
    const s = this.step % 8;
    const now = this.ctx.currentTime;

    if (zone.kick[s]) this._playKick(now);
    if (zone.snare[s]) this._playSnare(now);
    if (zone.hat[s]) this._playHat(now);

    const bassDeg = zone.bass[s];
    if (bassDeg !== undefined && bassDeg >= 0) {
      const freq = zone.chord[bassDeg % zone.chord.length] / 2;
      this._playBass(freq, now, zone.bassVol);
    }

    const arpDeg = zone.arp[s];
    if (arpDeg !== undefined) {
      const freq = zone.chord[arpDeg % zone.chord.length] * 2;
      this._playArp(freq, now, zone.arpVol);
    }

    this.step++;
  },

  _playKick(time) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(150, time);
    osc.frequency.exponentialRampToValueAtTime(40, time + 0.12);
    gain.gain.setValueAtTime(0.7, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
    osc.connect(gain);
    gain.connect(this.musicBus);
    osc.start(time);
    osc.stop(time + 0.16);
  },

  _playSnare(time) {
    const len = this.ctx.sampleRate * 0.12;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = "highpass";
    filt.frequency.value = 1200;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.35, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.1);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.musicBus);
    src.start(time);
    src.stop(time + 0.12);
  },

  _playHat(time) {
    const len = this.ctx.sampleRate * 0.04;
    const buf = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    const filt = this.ctx.createBiquadFilter();
    filt.type = "highpass";
    filt.frequency.value = 6000;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0.12, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.03);
    src.connect(filt);
    filt.connect(gain);
    gain.connect(this.musicBus);
    src.start(time);
    src.stop(time + 0.04);
  },

  _playBass(freq, time, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "sawtooth";
    osc.frequency.value = freq;
    const filt = this.ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.setValueAtTime(900, time);
    filt.frequency.linearRampToValueAtTime(400, time + 0.18);
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.22);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(this.musicBus);
    osc.start(time);
    osc.stop(time + 0.24);
  },

  _playArp(freq, time, vol) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = "square";
    osc.frequency.value = freq;
    const filt = this.ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 2800;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + 0.14);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(this.musicBus);
    osc.start(time);
    osc.stop(time + 0.16);
  },

  playSFX(type) {
    this.init();
    if (!this.ctx) return;
    if (this.ctx.state === "suspended") this.ctx.resume();

    const wallNow = Date.now();
    if (type === "click" && wallNow - this._lastMeaningfulSfx < 150) return;
    if (type !== "click") this._lastMeaningfulSfx = wallNow;

    const now = this.ctx.currentTime;

    if (type === "click") {
      this._sfxTone(880, "square", now, 0.06, 0.04, 4000);
      this._sfxTone(1320, "sine", now + 0.02, 0.04, 0.025, 6000);
    } else if (type === "zone") {
      [440, 554.37, 659.25].forEach((f, i) => {
        this._sfxTone(f, "sawtooth", now + i * 0.05, 0.12, 0.035, 2000);
      });
    } else if (type === "success") {
      [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
        this._sfxTone(f, "square", now + i * 0.07, 0.14, 0.05, 3500);
      });
    } else if (type === "fail") {
      this._sfxTone(200, "sawtooth", now, 0.3, 0.08, 600);
      this._sfxTone(140, "sawtooth", now + 0.12, 0.35, 0.06, 400);
    } else if (type === "release") {
      [329.63, 392, 523.25, 659.25, 783.99].forEach((f, i) => {
        this._sfxTone(f, "sawtooth", now + i * 0.1, i === 4 ? 0.7 : 0.15, 0.06, 2500);
      });
    } else if (type === "combo") {
      [392, 493.88, 587.33, 783.99, 987.77].forEach((f, i) => {
        this._sfxTone(f, "square", now + i * 0.05, 0.1, 0.045, 5000);
      });
    } else if (type === "cash") {
      this._sfxTone(1200, "sine", now, 0.08, 0.04, 8000);
      this._sfxTone(1600, "sine", now + 0.06, 0.1, 0.035, 8000);
    } else if (type === "levelup") {
      [261.63, 329.63, 392, 523.25, 659.25].forEach((f, i) => {
        this._sfxTone(f, "triangle", now + i * 0.08, 0.2, 0.055, 3000);
      });
    }
  },

  _sfxTone(freq, type, time, dur, vol, filterFreq) {
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    const filt = this.ctx.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = filterFreq || 4000;
    gain.gain.setValueAtTime(vol, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + dur - 0.02);
    osc.connect(filt);
    filt.connect(gain);
    gain.connect(this.sfxBus);
    osc.start(time);
    osc.stop(time + dur);
  },

  _updateMusicButtons() {
    const zone = this.getZoneConfig(this.currentZone);
    const on = this.isPlaying;
    const label = on ? `🎵 ${zone.label}` : "🎵 OFF";
    const shortLabel = on ? "🎵 ON" : "🎵 OFF";
    const railLabel = on ? `🎵 ${zone.label}` : "🎵 SYNTH: OFF";

    ["music-toggle-btn", "hud-music-btn"].forEach(id => {
      const btn = document.getElementById(id);
      if (!btn) return;
      btn.innerText = id === "hud-music-btn" ? railLabel : shortLabel;
      btn.classList.toggle("music-on", on);
      btn.title = on ? `Now playing: ${zone.label}` : "Enable synthwave soundtrack";
    });

    const trackEl = document.getElementById("now-playing-track");
    if (trackEl) {
      trackEl.innerText = on ? `▶ ${zone.label}` : "■ SILENCE";
      trackEl.classList.toggle("playing", on);
    }
  }
};

function toggleMusic() {
  SynthwaveAudio.toggle();
}

// Back-compat alias used throughout game.js
window.SynthwaveAudio = SynthwaveAudio;
window.ChiptuneAudio = SynthwaveAudio;
window.toggleMusic = toggleMusic;