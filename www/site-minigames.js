/**
 * Site-wide funny mini-games — neon garage micro-games for every zone.
 */
(function () {
  "use strict";

  const C = {
    bg: "#06060c",
    cyan: "#00e5ff",
    purple: "#b388ff",
    gold: "#ffd700",
    red: "#ff1744",
    green: "#39ff14",
    white: "#e8e8f0",
    grid: "rgba(0,229,255,0.08)"
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
  const randF = (lo, hi) => lo + Math.random() * (hi - lo);

  let session = null;

  function endSession(result, reason) {
    if (!session || session.ended) return;
    session.ended = true;
    if (session.rafId) cancelAnimationFrame(session.rafId);
    if (session.cleanup) session.cleanup();
    const cb = result === "win" ? session.onWin : session.onLose;
    session = null;
    if (cb) cb(reason);
  }

  function drawHud(ctx, w, text, accent) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, w, 22);
    ctx.fillStyle = accent || C.cyan;
    ctx.font = "11px monospace";
    ctx.fillText(text, 8, 15);
  }

  function drawScanlines(ctx, w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
  }

  const GAMES = {
    email_whack: {
      id: "email_whack",
      title: "Inbox Whack-a-Mole",
      emoji: "📧",
      zone: "hud",
      accent: C.cyan,
      energyCost: 5,
      instructions: "Click unread emails before they become JIRA tickets.",
      goal: "Clear 10 emails",
      controls: "Mouse click",
      duration: 40000,
      create(w, h, keys, mouse) {
        let targets = [], cleared = 0, frame = 0, lives = 3;
        const spawn = () => {
          targets.push({
            x: rand(20, w - 50), y: rand(30, h - 40),
            life: rand(50, 90), label: ["URGENT", "RE: RE:", "FYI", "ASAP", "EOD"][rand(0, 4)]
          });
        };
        mouse.click = (mx, my) => {
          targets.forEach(t => {
            if (mx > t.x && mx < t.x + 36 && my > t.y && my < t.y + 22) t.life = -1;
          });
        };
        return {
          update() {
            frame++;
            if (frame % 55 === 0) spawn();
            targets.forEach(t => { t.life--; if (t.life <= 0) { lives--; t.dead = true; } });
            targets = targets.filter(t => !t.dead);
            targets.forEach(t => { if (t.life < 0) { cleared++; t.life = -99; } });
            targets = targets.filter(t => t.life > -90);
            if (cleared >= 10) endSession("win");
            if (lives <= 0) endSession("lose", "Inbox achieved sentience.");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `CLEARED: ${cleared}/10  LIVES: ${lives}`, C.cyan);
            targets.forEach(t => {
              ctx.fillStyle = C.red; ctx.fillRect(t.x, t.y, 36, 22);
              ctx.fillStyle = C.white; ctx.font = "8px monospace"; ctx.fillText(t.label, t.x + 3, t.y + 14);
            });
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    rent_dodge: {
      id: "rent_dodge",
      title: "Rent Dodge",
      emoji: "💸",
      zone: "studio",
      accent: C.gold,
      energyCost: 6,
      instructions: "← → dodge envelopes from Mom/Dad LLC.",
      goal: "Survive 35 seconds",
      controls: "← → or A D",
      duration: 38000,
      create(w, h, keys) {
        let px = w / 2, bills = [], frame = 0, survived = 0;
        return {
          update() {
            frame++;
            survived++;
            if (keys.left) px = Math.max(20, px - 5);
            if (keys.right) px = Math.min(w - 20, px + 5);
            if (frame % 38 === 0) bills.push({ x: rand(15, w - 30), y: 28, vy: randF(2.2, 3.8) });
            bills.forEach(b => { b.y += b.vy; if (Math.abs(b.x - px) < 22 && b.y > h - 42 && b.y < h - 18) endSession("lose", "Landlord got you. +$50 overdue."); });
            bills = bills.filter(b => b.y < h + 10);
            if (survived > 35 * 60) endSession("win");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `RENT DODGE — ${Math.floor(survived / 60)}s`, C.gold);
            ctx.fillStyle = C.cyan; ctx.fillRect(px - 14, h - 32, 28, 14);
            bills.forEach(b => {
              ctx.fillStyle = C.gold; ctx.fillRect(b.x, b.y, 24, 16);
              ctx.fillStyle = C.red; ctx.font = "8px monospace"; ctx.fillText("$", b.x + 8, b.y + 12);
            });
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    standup_bingo: {
      id: "standup_bingo",
      title: "Standup Bingo",
      emoji: "📋",
      zone: "staff",
      accent: C.purple,
      energyCost: 5,
      instructions: "Click lit buzzword cells before standup ends.",
      goal: "Mark 8 bingo squares",
      controls: "Mouse click",
      duration: 42000,
      create(w, h, keys, mouse) {
        const words = ["synergy", "blocker", "pivot", "agile", "blockchain", "AI", "NFT", "scope", "crunch", "retro", "KPI", "vibes", "bandwidth", "circle back", "deliverable", "touch base"];
        const cells = words.map((word, i) => ({ word, col: i % 4, row: Math.floor(i / 4), lit: false, marked: false }));
        let marked = 0, frame = 0;
        mouse.click = (mx, my) => {
          const cw = (w - 20) / 4, ch = (h - 30) / 4;
          cells.forEach(c => {
            const cx = 10 + c.col * cw, cy = 28 + c.row * ch;
            if (c.lit && !c.marked && mx > cx && mx < cx + cw - 4 && my > cy && my < cy + ch - 4) {
              c.marked = true; c.lit = false; marked++;
              if (marked >= 8) endSession("win");
            }
          });
        };
        return {
          update() {
            frame++;
            if (frame % 45 === 0) {
              const pool = cells.filter(c => !c.marked);
              if (pool.length) pool[rand(0, pool.length - 1)].lit = true;
            }
            cells.forEach(c => { if (c.lit && frame % 8 === 0) c.lit = Math.random() > 0.15; });
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `BINGO: ${marked}/8`, C.purple);
            const cw = (w - 20) / 4, ch = (h - 30) / 4;
            cells.forEach(c => {
              const cx = 10 + c.col * cw, cy = 28 + c.row * ch;
              ctx.fillStyle = c.marked ? "rgba(57,255,20,0.2)" : c.lit ? "rgba(179,136,255,0.35)" : "rgba(255,255,255,0.04)";
              ctx.fillRect(cx, cy, cw - 4, ch - 4);
              ctx.fillStyle = c.marked ? C.green : c.lit ? C.gold : C.white;
              ctx.font = "7px monospace";
              ctx.fillText(c.word.slice(0, 8), cx + 3, cy + ch / 2);
            });
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    investor_qte: {
      id: "investor_qte",
      title: "Investor Pitch QTE",
      emoji: "🧠",
      zone: "studio",
      accent: C.gold,
      energyCost: 7,
      instructions: "SPACE when buzzword bar is green — nail the pitch.",
      goal: "Hit 5 perfect slides",
      controls: "Space bar",
      duration: 45000,
      create(w, h, keys) {
        let pos = 0, dir = 1, hits = 0, fired = false;
        const zone = { lo: 38, hi: 62 };
        return {
          update() {
            pos += dir * 2.8;
            if (pos >= 100 || pos <= 0) dir *= -1;
            if (keys.fire && !fired) {
              fired = true;
              if (pos >= zone.lo && pos <= zone.hi) {
                hits++;
                if (hits >= 5) endSession("win");
              } else endSession("lose", "Investor asked for users. You showed a mood board.");
            }
            if (!keys.fire) fired = false;
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `SLIDES: ${hits}/5  [SPACE]`, C.gold);
            ctx.fillStyle = "rgba(255,255,255,0.06)"; ctx.fillRect(30, h / 2 - 10, w - 60, 20);
            ctx.fillStyle = "rgba(57,255,20,0.25)"; ctx.fillRect(30 + (w - 60) * zone.lo / 100, h / 2 - 10, (w - 60) * (zone.hi - zone.lo) / 100, 20);
            ctx.fillStyle = C.cyan; ctx.fillRect(30 + (w - 60) * pos / 100 - 3, h / 2 - 14, 6, 28);
            ctx.fillStyle = C.white; ctx.font="10px monospace"; ctx.fillText("SYNERGY", w / 2 - 28, h / 2 + 36);
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    leaderboard_climb: {
      id: "leaderboard_climb",
      title: "Rank Climb Mash",
      emoji: "🏆",
      zone: "leaderboard",
      accent: C.gold,
      energyCost: 6,
      instructions: "SPACE mash to climb past fake studios.",
      goal: "Reach rank #1",
      controls: "Space mash",
      duration: 35000,
      create(w, h, keys) {
        let climb = 0, target = 100, frame = 0;
        return {
          update() {
            frame++;
            if (keys.fire) climb += 2.2;
            climb = Math.max(0, climb - 0.35);
            if (climb >= target) endSession("win");
            if (frame > 35 * 60) endSession("lose", "Still #47. Net worth unchanged.");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `CLIMB: ${Math.floor(climb)}%`, C.gold);
            for (let i = 0; i < 5; i++) {
              const y = h - 40 - i * 28 - climb * 0.4;
              ctx.fillStyle = i === 0 ? C.gold : C.purple;
              ctx.fillRect(40, y, w - 80, 18);
              ctx.fillStyle = C.white; ctx.font = "8px monospace";
              ctx.fillText(["#1 You?", "#2 Bot Studio", "#3 Vaporware Inc", "#4 Mom's Basement", "#5 NFT Farm"][i], 48, y + 12);
            }
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    hire_interview: {
      id: "hire_interview",
      title: "Hire Interview",
      emoji: "👔",
      zone: "staff",
      accent: C.cyan,
      energyCost: 6,
      instructions: "Pick the buzzword the interviewer wants.",
      goal: "Answer 4 questions correctly",
      controls: "Click answer · 1/2/3 keys",
      duration: 50000,
      create(w, h, keys, mouse) {
        const qs = [
          { q: "Where do you see yourself in 5 years?", a: ["Shipping DLC", "Still in standup", "Therapy"], correct: 0 },
          { q: "Greatest weakness?", a: ["Perfectionism", "Honesty", "Sleep"], correct: 0 },
          { q: "Why this studio?", a: ["Passion", "Rent due", "Accident"], correct: 1 },
          { q: "Culture fit?", a: ["Pizza", "Crunch", "Both"], correct: 2 }
        ];
        let qi = 0, correct = 0;
        const pick = (i) => {
          if (i === qs[qi].correct) {
            correct++;
            qi++;
            if (qi >= qs.length) endSession("win");
          } else endSession("lose", "Candidate said 'no' to unpaid overtime.");
        };
        mouse.click = (mx, my) => {
          if (my > 120 && my < 145) pick(0);
          else if (my > 155 && my < 180) pick(1);
          else if (my > 190 && my < 215) pick(2);
        };
        const onKey = (e) => {
          if (e.key === "1") pick(0);
          if (e.key === "2") pick(1);
          if (e.key === "3") pick(2);
        };
        document.addEventListener("keydown", onKey);
        return {
          update() {},
          draw(ctx) {
            const q = qs[qi];
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `CORRECT: ${correct}/${qs.length}`, C.cyan);
            ctx.fillStyle = C.white; ctx.font = "11px monospace";
            ctx.fillText(q.q, 12, 50);
            q.a.forEach((a, i) => {
              ctx.fillStyle = "rgba(0,229,255,0.12)"; ctx.fillRect(10, 120 + i * 35, w - 20, 28);
              ctx.fillStyle = C.cyan; ctx.font = "10px monospace"; ctx.fillText(`${i + 1}. ${a}`, 18, 138 + i * 35);
            });
            drawScanlines(ctx, w, h);
          },
          cleanup() { document.removeEventListener("keydown", onKey); }
        };
      }
    },

    research_orbs: {
      id: "research_orbs",
      title: "Grant Orb Catcher",
      emoji: "🔬",
      zone: "research",
      accent: C.purple,
      energyCost: 5,
      instructions: "Catch floating RP orbs before committee closes.",
      goal: "Collect 12 RP orbs",
      controls: "← → move catcher",
      duration: 40000,
      create(w, h, keys) {
        let px = w / 2, orbs = [], got = 0, frame = 0;
        return {
          update() {
            frame++;
            if (keys.left) px = Math.max(25, px - 5);
            if (keys.right) px = Math.min(w - 25, px + 5);
            if (frame % 40 === 0) orbs.push({ x: rand(20, w - 20), y: 30, vy: randF(1.5, 2.5) });
            let missed = 0;
            orbs.forEach(o => {
              o.y += o.vy;
              if (o.y > h - 38 && Math.abs(o.x - px) < 28) { got++; o.y = 999; }
              else if (o.y > h - 10) { missed++; o.y = 999; }
            });
            orbs = orbs.filter(o => o.y < h + 10);
            if (got >= 12) endSession("win");
            if (missed >= 6) endSession("lose", "Committee rejected grant. Try buzzwords.");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `RP: ${got}/12`, C.purple);
            ctx.fillStyle = C.cyan; ctx.fillRect(px - 24, h - 28, 48, 10);
            orbs.forEach(o => {
              ctx.fillStyle = C.purple; ctx.beginPath(); ctx.arc(o.x, o.y, 8, 0, Math.PI * 2); ctx.fill();
            });
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    blame_wheel: {
      id: "blame_wheel",
      title: "Blame Roulette",
      emoji: "🎰",
      zone: "gigs",
      accent: C.red,
      energyCost: 4,
      instructions: "SPACE to stop wheel — hope it's not you.",
      goal: "Land on 'Intern'",
      controls: "Space to stop",
      duration: 30000,
      create(w, h, keys) {
        const labels = ["Intern", "DNS", "Solar flare", "You", "QA", "Prod"];
        let angle = 0, spinning = true, stopped = false;
        return {
          update() {
            if (spinning) angle += 0.18;
            if (keys.fire && spinning) { spinning = false; stopped = true; }
            if (stopped) {
              const idx = Math.floor(((angle % (Math.PI * 2)) / (Math.PI * 2)) * labels.length) % labels.length;
              if (labels[idx] === "Intern" || labels[idx] === "DNS" || labels[idx] === "Solar flare") endSession("win");
              else endSession("lose", `Blame assigned to: ${labels[idx]}.`);
            }
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, spinning ? "SPINNING... [SPACE]" : "STOPPED", C.red);
            const cx = w / 2, cy = h / 2 + 10, r = 70;
            labels.forEach((l, i) => {
              const a = angle + (i / labels.length) * Math.PI * 2;
              ctx.fillStyle = i % 2 ? C.purple : C.red;
              ctx.beginPath(); ctx.moveTo(cx, cy); ctx.arc(cx, cy, r, a, a + Math.PI * 2 / labels.length); ctx.fill();
              ctx.fillStyle = C.white; ctx.font = "7px monospace";
              ctx.fillText(l, cx + Math.cos(a + 0.3) * r * 0.6, cy + Math.sin(a + 0.3) * r * 0.6);
            });
            ctx.fillStyle = C.gold; ctx.beginPath(); ctx.moveTo(cx, cy - r - 8); ctx.lineTo(cx - 8, cy - r + 4); ctx.lineTo(cx + 8, cy - r + 4); ctx.fill();
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    scope_creep: {
      id: "scope_creep",
      title: "Scope Creep Catcher",
      emoji: "📈",
      zone: "develop",
      accent: C.gold,
      energyCost: 5,
      instructions: "Block feature requests from entering the build.",
      goal: "Reject 8 scope items",
      controls: "Click creeping features",
      duration: 38000,
      create(w, h, keys, mouse) {
        let items = [], blocked = 0, frame = 0;
        const labels = ["Battle Royale", "NFT Pets", "Ray Tracing", "Roguelike", "MMO", "Battle Pass"];
        mouse.click = (mx, my) => {
          items.forEach(it => {
            if (!it.dead && mx > it.x && mx < it.x + 50 && my > it.y && my < it.y + 18) { it.dead = true; blocked++; }
          });
        };
        return {
          update() {
            frame++;
            if (frame % 50 === 0) items.push({ x: w + 10, y: rand(40, h - 30), vx: -randF(1.5, 2.8), label: labels[rand(0, labels.length - 1)] });
            items.forEach(it => { it.x += it.vx; if (it.x < -60 && !it.dead) endSession("lose", `${it.label} shipped itself.`); });
            items = items.filter(it => !it.dead && it.x > -70);
            if (blocked >= 8) endSession("win");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `BLOCKED: ${blocked}/8`, C.gold);
            items.forEach(it => {
              if (it.dead) return;
              ctx.fillStyle = C.red; ctx.fillRect(it.x, it.y, 50, 18);
              ctx.fillStyle = C.white; ctx.font = "7px monospace"; ctx.fillText(it.label.slice(0, 9), it.x + 2, it.y + 12);
            });
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    vpn_dash: {
      id: "vpn_dash",
      title: "VPN Tunnel Dash",
      emoji: "🕵️",
      zone: "gigs",
      accent: C.cyan,
      energyCost: 6,
      instructions: "↑ ↓ dodge firewall packets.",
      goal: "Survive 30 seconds",
      controls: "↑ ↓ or W S",
      duration: 32000,
      create(w, h, keys) {
        let py = h / 2, packets = [], frame = 0, t = 0;
        return {
          update() {
            frame++; t++;
            if (keys.up) py = Math.max(30, py - 4);
            if (keys.down) py = Math.min(h - 30, py + 4);
            if (frame % 28 === 0) packets.push({ x: w + 10, y: rand(35, h - 35), vx: -randF(3, 5) });
            packets.forEach(p => {
              p.x += p.vx;
              if (p.x < 40 && p.x > 10 && Math.abs(p.y - py) < 14) endSession("lose", "IT traced you to the garage.");
            });
            packets = packets.filter(p => p.x > -20);
            if (t > 30 * 60) endSession("win");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `VPN: ${Math.floor(t / 60)}s`, C.cyan);
            ctx.fillStyle = C.green; ctx.fillRect(18, py - 8, 20, 16);
            packets.forEach(p => { ctx.fillStyle = C.red; ctx.fillRect(p.x, p.y, 14, 10); });
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    captcha_ship: {
      id: "captcha_ship",
      title: "Are You A Dev?",
      emoji: "🤖",
      zone: "signup",
      accent: C.green,
      energyCost: 0,
      instructions: "Click every SHIP IT button. Prove humanity.",
      goal: "Click 6 SHIP IT buttons",
      controls: "Mouse click",
      duration: 45000,
      create(w, h, keys, mouse) {
        let buttons = [], clicked = 0, frame = 0;
        const addBtn = () => buttons.push({ x: rand(10, w - 70), y: rand(30, h - 30), w: 58, h: 20, done: false });
        for (let i = 0; i < 4; i++) addBtn();
        mouse.click = (mx, my) => {
          buttons.forEach(b => {
            if (!b.done && mx > b.x && mx < b.x + b.w && my > b.y && my < b.y + b.h) {
              b.done = true; clicked++;
              if (clicked >= 6) endSession("win");
              else if (buttons.filter(x => !x.done).length < 2) addBtn();
            }
          });
        };
        return {
          update() {
            frame++;
            if (frame % 80 === 0 && buttons.length < 8) addBtn();
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `SHIP IT: ${clicked}/6`, C.green);
            buttons.forEach(b => {
              if (b.done) return;
              ctx.fillStyle = C.gold; ctx.fillRect(b.x, b.y, b.w, b.h);
              ctx.fillStyle = C.bg; ctx.font = "bold 8px monospace"; ctx.fillText("SHIP IT", b.x + 8, b.y + 14);
            });
          }
        };
      }
    },

    touch_grass_game: {
      id: "touch_grass_game",
      title: "Touch Grass Simulator",
      emoji: "🌿",
      zone: "studio",
      accent: C.green,
      energyCost: 0,
      instructions: "← → move hand — catch 5 🌿 grass, dodge 📧 recruiters & 🐛 Jira bugs.",
      goal: "Touch 5 blades of grass",
      controls: "← → or A D",
      duration: 35000,
      create(w, h, keys) {
        let px = w / 2, items = [], frame = 0, grassTouched = 0;
        const spawn = () => {
          const types = ["grass", "recruiter", "jira"];
          const r = Math.random();
          const type = r < 0.45 ? "grass" : r < 0.75 ? "recruiter" : "jira";
          items.push({
            x: rand(20, w - 30),
            y: 24,
            vy: randF(2.0, 3.5),
            type: type
          });
        };
        return {
          update() {
            frame++;
            if (keys.left) px = Math.max(20, px - 6);
            if (keys.right) px = Math.min(w - 20, px + 6);
            if (frame % 35 === 0) spawn();
            items.forEach(it => {
              it.y += it.vy;
              if (Math.abs(it.x - px) < 22 && it.y > h - 38 && it.y < h - 14) {
                it.dead = true;
                if (it.type === "grass") {
                  grassTouched++;
                  if (grassTouched >= 5) endSession("win");
                } else if (it.type === "recruiter") {
                  endSession("lose", "Recruiter cornered you on LinkedIn. retreat to basement!");
                } else {
                  endSession("lose", "Hit by a JIRA ticket! Out of scope!");
                }
              }
            });
            items = items.filter(it => !it.dead && it.y < h + 10);
          },
          draw(ctx) {
            ctx.fillStyle = C.bg; ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `GRASS TOUCHED: ${grassTouched}/5`, C.green);
            ctx.fillStyle = C.cyan;
            ctx.fillRect(px - 16, h - 26, 32, 10);
            ctx.fillStyle = C.gold;
            ctx.font = "10px sans-serif";
            ctx.fillText("🫴", px - 7, h - 18);
            items.forEach(it => {
              ctx.font = "14px sans-serif";
              let label = "🌿";
              if (it.type === "recruiter") label = "📧";
              if (it.type === "jira") label = "🐛";
              ctx.fillText(label, it.x - 7, it.y);
            });
            drawScanlines(ctx, w, h);
          }
        };
      }
    }
  };

  const ZONE_POOLS = {
    studio: ["rent_dodge", "investor_qte", "email_whack", "touch_grass_game"],
    develop: ["scope_creep", "email_whack", "blame_wheel"],
    staff: ["standup_bingo", "hire_interview", "blame_wheel"],
    research: ["research_orbs", "standup_bingo"],
    leaderboard: ["leaderboard_climb", "investor_qte"],
    gigs: ["blame_wheel", "vpn_dash", "email_whack"],
    store: ["investor_qte", "email_whack"],
    hud: ["email_whack", "standup_bingo", "blame_wheel"],
    post_release: ["email_whack", "scope_creep", "leaderboard_climb"],
    signup: ["captcha_ship"],
    global: Object.keys(GAMES)
  };

  const ZONE_COPY = {
    studio: "Mandatory fun sponsored by Finance. Win for +XP and morale theater.",
    develop: "Procrastination sprints. Block scope creep between real sprints.",
    staff: "HR-approved micro-games. Failure becomes a retrospective action item.",
    research: "Turn grant anxiety into gameplay. Peer review not included.",
    leaderboard: "Climb ranks that definitely aren't simulated for your ego.",
    gigs: "Side hustle training simulators. VPN sold separately.",
    store: "Consume mini-games before consumables. Meta.",
    hud: "Click vitals, ignore metrics. Classic studio workflow.",
    post_release: "Live ops boredom breakers. Players never asked for these.",
    signup: "Prove you are a real developer before cloud save.",
    global: "Every corner of Dev End now has unnecessary arcade energy."
  };

  function getMeta(id) {
    const g = GAMES[id];
    if (!g) return { id, title: "Mini-game", emoji: "🎮", accent: C.cyan, instructions: "Play!", goal: "Win", controls: "Keyboard" };
    return g;
  }

  function listForZone(zoneId) {
    const pool = ZONE_POOLS[zoneId] || ZONE_POOLS.global;
    return pool.map(getMeta);
  }

  function pickForZone(zoneId) {
    const pool = ZONE_POOLS[zoneId] || ZONE_POOLS.global;
    return pool[rand(0, pool.length - 1)];
  }

  function renderZoneHub(zoneId) {
    const games = listForZone(zoneId);
    const copy = ZONE_COPY[zoneId] || ZONE_COPY.global;
    return `
      <div class="zone-minigame-hub" data-zone="${zoneId}">
        <div class="zone-minigame-head">
          <h4 class="dev-section-label">🎪 Zone Arcade (unnecessary)</h4>
          <button type="button" class="btn-secondary detail-micro-btn" onclick="launchZoneMiniGameRandom('${zoneId}')" title="Random game">🎲 Random</button>
        </div>
        <p class="zone-minigame-hint">${copy}</p>
        <div class="zone-minigame-grid">
          ${games.map(g => `
            <button type="button" class="zone-minigame-btn" style="border-color:${g.accent}" onclick="launchZoneMiniGame('${zoneId}', '${g.id}')" title="${g.instructions}">
              <span class="zone-minigame-emoji">${g.emoji}</span>
              <span class="zone-minigame-label">${g.title}</span>
              <span class="zone-minigame-cost">-${g.energyCost || 5} ☕</span>
            </button>
          `).join("")}
        </div>
      </div>
    `;
  }

  function renderShell(gameId, opts) {
    const meta = getMeta(gameId);
    const started = opts && opts.started;
    return `
      <div class="arcade-minigame site-minigame" style="border-color:${meta.accent}; ${opts?.extraStyle || ""}">
        <div class="arcade-minigame-header">
          <h4 style="color:${meta.accent}">${meta.emoji} ${meta.title}</h4>
          <span class="arcade-badge">${started ? "LIVE" : "READY"}</span>
        </div>
        <p class="arcade-instructions">${meta.instructions}</p>
        <div class="arcade-canvas-wrap">
          <canvas id="site-minigame-canvas" width="420" height="260" tabindex="0"></canvas>
          ${started ? "" : `
          <div class="arcade-start-overlay" id="site-start-overlay">
            <div class="arcade-start-panel">
              <p class="arcade-start-goal"><span>Goal</span> ${meta.goal}</p>
              <p class="arcade-start-controls"><span>Controls</span> ${meta.controls}</p>
              <button type="button" class="btn-primary arcade-start-btn" onclick="startSiteMiniGameSession()">▶ START</button>
              <div class="arcade-countdown" id="site-countdown" hidden></div>
            </div>
          </div>`}
        </div>
        <p class="arcade-controls-hint">${meta.controls} · Click canvas for focus</p>
        <div class="status-bar-track arcade-timer${started ? "" : " arcade-timer-paused"}">
          <div class="status-bar-fill" id="site-minigame-timer-bar" style="width:100%; height:100%; background:${meta.accent};"></div>
        </div>
        <button class="btn-secondary arcade-cancel-btn" onclick="cancelMiniGame()">Cancel Mini-game</button>
      </div>
    `;
  }

  function mount(canvas, gameId, opts) {
    unmount();
    const game = GAMES[gameId];
    if (!game || !canvas) return;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    const keys = { left: false, right: false, up: false, down: false, fire: false };
    const mouse = { click: null };
    const keyMap = {
      ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      a: "left", d: "right", w: "up", s: "down",
      A: "left", D: "right", W: "up", S: "down",
      " ": "fire"
    };
    const onKeyDown = (e) => {
      const k = keyMap[e.key];
      if (k) {
        keys[k] = true;
        if (["left", "right", "up", "down", "fire"].includes(k)) {
          e.preventDefault();
        }
      }
    };
    const onKeyUp = (e) => { const k = keyMap[e.key]; if (k) keys[k] = false; };
    const onClick = (e) => {
      canvas.focus();
      if (typeof mouse.click === "function") {
        const rect = canvas.getBoundingClientRect();
        mouse.click((e.clientX - rect.left) * (w / rect.width), (e.clientY - rect.top) * (h / rect.height));
      }
    };
    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", onClick);
    const engine = game.create(w, h, keys, mouse);
    let last = performance.now();
    const loop = (now) => {
      if (!session || session.ended) return;
      if (engine.update) engine.update(now - last);
      last = now;
      if (engine.draw) engine.draw(ctx);
      session.rafId = requestAnimationFrame(loop);
    };
    session = {
      ended: false,
      onWin: opts.onWin,
      onLose: opts.onLose,
      cleanup: () => {
        canvas.removeEventListener("keydown", onKeyDown);
        canvas.removeEventListener("keyup", onKeyUp);
        document.removeEventListener("keydown", onKeyDown);
        document.removeEventListener("keyup", onKeyUp);
        canvas.removeEventListener("click", onClick);
        if (engine.cleanup) engine.cleanup();
      }
    };
    setTimeout(() => canvas.focus(), 80);
    session.rafId = requestAnimationFrame(loop);
  }

  function unmount() {
    if (!session) return;
    if (session.rafId) cancelAnimationFrame(session.rafId);
    if (session.cleanup) session.cleanup();
    session = null;
  }

  function getDuration(gameId) {
    const g = GAMES[gameId];
    return g ? g.duration : 40000;
  }

  window.SiteMinigames = {
    GAMES,
    ZONE_POOLS,
    getMeta,
    listForZone,
    pickForZone,
    renderZoneHub,
    renderShell,
    mount,
    unmount,
    getDuration
  };
})();