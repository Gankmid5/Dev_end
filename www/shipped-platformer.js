/**
 * Shipped Platformer — playable neon garage platformer for post-release Dev Lab.
 */
(function () {
  "use strict";

  const C = {
    bg: "#06060c",
    sky: "#0a0820",
    cyan: "#00e5ff",
    purple: "#b388ff",
    gold: "#ffd700",
    red: "#ff1744",
    green: "#39ff14",
    white: "#e8e8f0",
    grid: "rgba(0,229,255,0.08)",
    platform: "rgba(0,229,255,0.18)",
    platformTop: "#00e5ff"
  };

  const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
  const rand = (lo, hi) => Math.floor(Math.random() * (hi - lo + 1)) + lo;
  const randF = (lo, hi) => lo + Math.random() * (hi - lo);

  const DEATH_LINES = [
    "Segmentation fault — player fell off the world.",
    "Null pointer caught you. Classic.",
    "Bug merged to main. You did not.",
    "Physics engine filed a harassment report.",
    "Respawn sponsored by Day-One Patch.",
    "Tutorial skipped. Consequences delivered.",
    "Unhandled exception: legs not found.",
    "QA marked this death as 'working as intended'."
  ];

  const FEATURE_BY_GENRE = {
    RPG: ["Loot Box", "Skill Tree", "Emotional Damage", "Horse Armor", "RNG Pity", "Prestige+", "Dialog Skip", "Boss Gate"],
    Action: ["Bullet Time", "Wall Run", "Rage Meter", "QTE Spam", "Cover System", "Finisher Cam", "Ammo Void", "Dodge Roll"],
    Strategy: ["Fog of War", "Meta Build", "Patch Nerf", "A+ Move", "Supply Line", "Fog of Lore", "DLC Faction", "Undo Button"],
    Simulation: ["Microtransaction", "Realistic Poop", "Weather API", "Idle Loop", "Patch Tuesday", "Tutorial Pop-up", "Premium Soil", "NPC Schedule"],
    Puzzle: ["Hint Button", "Undo Stack", "Brain Melt", "One More Try", "Color Blind Mode", "Timer Anxiety", "Star Rating", "Paywall Level"],
    Horror: ["Jump Scare", "Flashlight", "Sanity Bar", "Creaky Door", "Lore Note", "Save Room", "Monster AI", "No Ammo"]
  };

  const FEATURE_FALLBACK = [
    "Feature Creep", "Scope Bloat", "Neon Shader", "Patch Notes", "Battle Pass", "Micro-Skip", "Vibe Check", "Hotfix Hope"
  ];

  const BUG_NAMES = ["Heisenbug", "Race Condition", "Memory Leak", "Off-by-One", "Stack Overflow", "Infinite Loop"];

  let session = null;

  function endSession(result, reason, stats) {
    if (!session || session.ended) return;
    session.ended = true;
    if (session.rafId) cancelAnimationFrame(session.rafId);
    if (session.cleanup) session.cleanup();
    const cb = result === "win" ? session.onWin : session.onLose;
    session = null;
    if (cb) cb(reason, stats || {});
  }

  function getFlavor(proj) {
    const name = proj?.name || "Untitled Masterpiece";
    const genre = proj?.genre || "Indie";
    const topic = proj?.topic || "Chaos";
    const pool = FEATURE_BY_GENRE[genre] || FEATURE_FALLBACK;
    const features = [...pool].sort(() => Math.random() - 0.5).slice(0, 8);
    const tagline = [
      `A ${genre} ${topic} experience that absolutely compiles.`,
      `Critics call it '${name}' — players call it '${name} (Deluxe Edition)'.`,
      `Now with ${topic.toLowerCase()} and 400% more neon.`,
      `Genre: ${genre}. Vibe: legally distinct from a lawsuit.`
    ][rand(0, 3)];
    return { name, genre, topic, features, tagline };
  }

  function buildLevel(flavor) {
    const worldW = 2520;
    const platforms = [{ x: 0, y: 288, w: worldW, h: 32, ground: true }];
    const gaps = [false, false, true, false, false, true, false, false, false, true, false, false, false, false, false, false, false, true, false, false];

    let cx = 80;
    for (let i = 0; i < gaps.length; i++) {
      if (gaps[i]) {
        cx += rand(70, 110);
        continue;
      }
      const w = rand(72, 130);
      const y = 288 - rand(48, 148) - (i % 4) * 8;
      platforms.push({ x: cx, y, w, h: 14, ground: false });
      cx += w + rand(18, 42);
    }

    platforms.push({ x: worldW - 120, y: 220, w: 100, h: 14, goal: true });

    const features = [];
    const used = new Set();
    flavor.features.forEach((label, i) => {
      const plat = platforms[rand(1, Math.max(1, platforms.length - 2))];
      const fx = plat.x + rand(16, Math.max(20, plat.w - 24));
      const fy = plat.y - 22;
      const key = `${Math.floor(fx / 20)}_${Math.floor(fy / 20)}`;
      if (!used.has(key)) {
        used.add(key);
        features.push({ x: fx, y: fy, label, collected: false, bob: randF(0, Math.PI * 2) });
      }
    });

    const bugs = [];
    for (let i = 0; i < 7; i++) {
      const plat = platforms[rand(1, platforms.length - 2)];
      bugs.push({
        x: plat.x + rand(10, Math.max(20, plat.w - 30)),
        y: plat.y - 16,
        vx: rand(0, 1) ? 1.2 : -1.2,
        minX: plat.x + 6,
        maxX: plat.x + plat.w - 18,
        name: BUG_NAMES[i % BUG_NAMES.length],
        w: 16,
        h: 14
      });
    }

    return { worldW, platforms, features, bugs, goalX: worldW - 72, goalY: 188 };
  }

  function drawScanlines(ctx, w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.1)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
  }

  function drawParallax(ctx, camX, vw, vh) {
    const grad = ctx.createLinearGradient(0, 0, 0, vh);
    grad.addColorStop(0, "#12082a");
    grad.addColorStop(0.55, C.sky);
    grad.addColorStop(1, C.bg);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, vw, vh);

    ctx.fillStyle = "rgba(179,136,255,0.06)";
    for (let i = 0; i < 8; i++) {
      const bx = ((i * 180 - camX * 0.15) % (vw + 200)) - 100;
      ctx.fillRect(bx, vh - 120 - (i % 3) * 18, 40 + (i % 4) * 12, 80 + (i % 2) * 30);
    }

    ctx.strokeStyle = C.grid;
    ctx.lineWidth = 1;
    const gridOff = -(camX * 0.35) % 32;
    for (let x = gridOff; x < vw; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, vh);
      ctx.stroke();
    }
    for (let y = 0; y < vh; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(vw, y);
      ctx.stroke();
    }

    ctx.fillStyle = "rgba(0,229,255,0.04)";
    ctx.font = "bold 28px monospace";
    ctx.fillText("DEV_END", vw - camX * 0.05 + 40, 48);
  }

  function drawPlatform(ctx, p, camX) {
    const x = p.x - camX;
    if (x + p.w < -20 || x > 520) return;
    ctx.fillStyle = p.ground ? "rgba(0,229,255,0.08)" : C.platform;
    ctx.fillRect(x, p.y, p.w, p.h);
    ctx.fillStyle = p.goal ? C.gold : C.platformTop;
    ctx.fillRect(x, p.y, p.w, 3);
    if (p.goal) {
      ctx.fillStyle = C.gold;
      ctx.font = "bold 9px monospace";
      ctx.fillText("SHIP IT", x + 12, p.y - 8);
    }
  }

  function drawPlayer(ctx, px, py, facing, frame) {
    const glow = ctx.createRadialGradient(px + 9, py + 11, 2, px + 9, py + 11, 22);
    glow.addColorStop(0, "rgba(0,229,255,0.35)");
    glow.addColorStop(1, "rgba(0,229,255,0)");
    ctx.fillStyle = glow;
    ctx.fillRect(px - 8, py - 8, 36, 36);

    ctx.fillStyle = C.cyan;
    ctx.fillRect(px, py, 18, 22);
    ctx.fillStyle = C.purple;
    ctx.fillRect(px + 3, py + 4, 12, 8);
    ctx.fillStyle = C.white;
    ctx.fillRect(px + (facing > 0 ? 11 : 5), py + 6, 3, 3);
    ctx.fillStyle = C.gold;
    const leg = Math.sin(frame * 0.25) * 2;
    ctx.fillRect(px + 2, py + 18, 5, 6 + leg);
    ctx.fillRect(px + 11, py + 18, 5, 6 - leg);
  }

  function drawFeature(ctx, f, camX, t) {
    if (f.collected) return;
    const bob = Math.sin(t * 0.06 + f.bob) * 4;
    const x = f.x - camX;
    const y = f.y + bob;
    ctx.fillStyle = "rgba(255,215,0,0.25)";
    ctx.beginPath();
    ctx.arc(x + 8, y + 8, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = C.gold;
    ctx.beginPath();
    ctx.moveTo(x + 8, y);
    ctx.lineTo(x + 14, y + 16);
    ctx.lineTo(x + 2, y + 16);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = C.white;
    ctx.font = "7px monospace";
    ctx.fillText(f.label.slice(0, 10), x - 4, y - 6);
  }

  function drawBug(ctx, b, camX) {
    const x = b.x - camX;
    ctx.fillStyle = "rgba(255,23,68,0.25)";
    ctx.fillRect(x - 2, b.y - 2, b.w + 4, b.h + 4);
    ctx.fillStyle = C.red;
    ctx.fillRect(x, b.y, b.w, b.h);
    ctx.fillStyle = C.green;
    ctx.fillRect(x + 3, b.y + 4, 3, 3);
    ctx.fillRect(x + 10, b.y + 4, 3, 3);
    ctx.fillStyle = C.white;
    ctx.font = "6px monospace";
    ctx.fillText(b.name.slice(0, 8), x - 2, b.y - 4);
  }

  function drawGoal(ctx, gx, gy, camX, pulse) {
    const x = gx - camX;
    const h = 52 + Math.sin(pulse * 0.08) * 4;
    ctx.strokeStyle = C.gold;
    ctx.lineWidth = 2;
    ctx.strokeRect(x, gy, 36, h);
    ctx.fillStyle = `rgba(255,215,0,${0.15 + Math.sin(pulse * 0.1) * 0.08})`;
    ctx.fillRect(x + 2, gy + 2, 32, h - 4);
    ctx.fillStyle = C.gold;
    ctx.font = "bold 10px monospace";
    ctx.fillText("SHIP", x + 4, gy + h / 2);
    ctx.fillText("IT ▶", x + 2, gy + h / 2 + 12);
  }

  function rectsOverlap(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function createEngine(w, h, proj, keys) {
    const flavor = getFlavor(proj);
    const level = buildLevel(flavor);
    const player = {
      x: 48,
      y: 240,
      w: 18,
      h: 22,
      vx: 0,
      vy: 0,
      grounded: false,
      facing: 1,
      lives: 3,
      invuln: 0
    };
    let camX = 0;
    let frame = 0;
    let score = 0;
    let collected = 0;
    const particles = [];
    let winAnim = 0;

    const spawnParticle = (x, y, color) => {
      for (let i = 0; i < 6; i++) {
        particles.push({
          x, y,
          vx: randF(-2.5, 2.5),
          vy: randF(-3, -0.5),
          life: rand(18, 32),
          color
        });
      }
    };

    return {
      flavor,
      level,
      getStats() {
        return {
          score,
          collected,
          totalFeatures: level.features.length,
          livesLeft: player.lives,
          flavor
        };
      },
      update() {
        if (winAnim > 0) {
          winAnim++;
          if (winAnim > 90) {
            return endSession("win", "SHIPPED!", {
              score,
              collected,
              totalFeatures: level.features.length,
              livesLeft: player.lives,
              flavor
            });
          }
          return;
        }

        frame++;
        if (player.invuln > 0) player.invuln--;

        if (keys.left) { player.vx = -4.2; player.facing = -1; }
        else if (keys.right) { player.vx = 4.2; player.facing = 1; }
        else player.vx *= 0.72;

        if ((keys.up || keys.fire) && player.grounded) {
          player.vy = -10.8;
          player.grounded = false;
          spawnParticle(player.x + 9, player.y + 22, C.cyan);
        }

        player.vy = clamp(player.vy + 0.55, -14, 13);
        player.x += player.vx;
        player.y += player.vy;

        player.grounded = false;
        const feet = { x: player.x, y: player.y + player.h - 2, w: player.w, h: 4 };
        level.platforms.forEach(p => {
          if (player.vy >= 0 && rectsOverlap(feet, p)) {
            if (player.y + player.h - player.vy <= p.y + 4) {
              player.y = p.y - player.h;
              player.vy = 0;
              player.grounded = true;
            }
          }
        });

        if (player.x < 0) player.x = 0;
        if (player.y > h + 40) {
          player.lives--;
          if (player.lives <= 0) {
            return endSession("lose", DEATH_LINES[rand(0, DEATH_LINES.length - 1)], {
              score, collected, totalFeatures: level.features.length, livesLeft: 0, flavor
            });
          }
          player.x = Math.max(48, player.x - 120);
          player.y = 200;
          player.vy = 0;
          player.invuln = 60;
          spawnFloatMsg("RESPAWN");
        }

        camX = clamp(player.x - w * 0.35, 0, level.worldW - w);

        level.features.forEach(f => {
          if (f.collected) return;
          const box = { x: f.x, y: f.y, w: 16, h: 16 };
          if (rectsOverlap(player, box)) {
            f.collected = true;
            collected++;
            score += 120;
            spawnParticle(f.x + 8, f.y + 8, C.gold);
          }
        });

        level.bugs.forEach(b => {
          b.x += b.vx;
          if (b.x <= b.minX || b.x >= b.maxX) b.vx *= -1;
          const box = { x: b.x, y: b.y, w: b.w, h: b.h };
          if (player.invuln <= 0 && rectsOverlap(player, box)) {
            player.lives--;
            player.invuln = 70;
            player.vy = -6;
            player.vx = player.x < b.x ? -5 : 5;
            spawnParticle(b.x + 8, b.y + 8, C.red);
            if (player.lives <= 0) {
              return endSession("lose", `${b.name} closed the ticket on your soul.`, {
                score, collected, totalFeatures: level.features.length, livesLeft: 0, flavor
              });
            }
          }
        });

        const goalBox = { x: level.goalX, y: level.goalY, w: 36, h: 56 };
        if (rectsOverlap(player, goalBox)) {
          score += collected * 50 + player.lives * 80;
          winAnim = 1;
        }

        particles.forEach(p => {
          p.x += p.vx;
          p.y += p.vy;
          p.vy += 0.12;
          p.life--;
        });
        for (let i = particles.length - 1; i >= 0; i--) {
          if (particles[i].life <= 0) particles.splice(i, 1);
        }
      },
      draw(ctx) {
        drawParallax(ctx, camX, w, h);

        level.platforms.forEach(p => drawPlatform(ctx, p, camX));
        drawGoal(ctx, level.goalX, level.goalY, camX, frame);
        level.features.forEach(f => drawFeature(ctx, f, camX, frame));
        level.bugs.forEach(b => drawBug(ctx, b, camX));

        const px = player.x - camX;
        if (player.invuln <= 0 || frame % 6 < 3) drawPlayer(ctx, px, player.y, player.facing, frame);

        particles.forEach(p => {
          ctx.fillStyle = p.color;
          ctx.globalAlpha = clamp(p.life / 30, 0.2, 1);
          ctx.fillRect(p.x - camX, p.y, 3, 3);
          ctx.globalAlpha = 1;
        });

        ctx.fillStyle = "rgba(0,0,0,0.55)";
        ctx.fillRect(0, 0, w, 28);
        ctx.fillStyle = C.cyan;
        ctx.font = "bold 11px monospace";
        ctx.fillText(`${flavor.name}`, 8, 12);
        ctx.fillStyle = C.gold;
        ctx.fillText(`★ ${collected}/${level.features.length}`, 8, 24);
        ctx.fillStyle = C.white;
        ctx.textAlign = "right";
        ctx.fillText(`SCORE ${score}`, w - 8, 12);
        ctx.fillStyle = C.red;
        ctx.fillText(`♥ ${player.lives}`, w - 8, 24);
        ctx.textAlign = "left";

        if (winAnim > 0) {
          ctx.fillStyle = "rgba(0,0,0,0.45)";
          ctx.fillRect(0, 0, w, h);
          ctx.fillStyle = C.gold;
          ctx.font = "bold 22px monospace";
          ctx.textAlign = "center";
          ctx.fillText("SHIPPED!", w / 2, h / 2 - 8);
          ctx.fillStyle = C.cyan;
          ctx.font = "12px monospace";
          ctx.fillText("Players will tweet about this for 4 minutes.", w / 2, h / 2 + 16);
          ctx.textAlign = "left";
        }

        drawScanlines(ctx, w, h);
      }
    };
  }

  function spawnFloatMsg() { /* visual only via particles */ }

  function renderShell(proj, opts) {
    const flavor = getFlavor(proj);
    const started = opts && opts.started;
    const title = flavor.name;
    return `
      <div class="shipped-platformer play-game-shell" style="border-color:${C.cyan}">
        <div class="play-game-header">
          <div>
            <h4 class="play-game-title">▶ ${title}</h4>
            <p class="play-game-tagline">${flavor.tagline}</p>
          </div>
          <span class="arcade-badge play-game-badge">${started ? "LIVE" : "READY"}</span>
        </div>
        <p class="arcade-instructions">Collect shipped features, dodge production bugs, reach the <strong>SHIP IT</strong> portal. ${flavor.genre}/${flavor.topic} edition.</p>
        <div class="arcade-canvas-wrap play-game-canvas-wrap">
          <canvas id="shipped-platformer-canvas" width="480" height="320" tabindex="0"></canvas>
          ${started ? "" : `
          <div class="arcade-start-overlay" id="shipped-start-overlay">
            <div class="arcade-start-panel">
              <p class="arcade-start-goal"><span>Goal</span> Reach SHIP IT with your dignity (optional)</p>
              <p class="arcade-start-controls"><span>Controls</span> ← → / A D move · ↑ / W / Space jump</p>
              <button type="button" class="btn-primary arcade-start-btn" onclick="startShippedGameSession()">▶ PLAY GAME</button>
              <div class="arcade-countdown" id="shipped-countdown" hidden></div>
            </div>
          </div>`}
        </div>
        <p class="arcade-controls-hint">WASD or arrows · Space to jump · Click canvas for keyboard focus</p>
      </div>
    `;
  }

  function mount(canvas, proj, opts) {
    unmount();
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    const keys = { left: false, right: false, up: false, down: false, fire: false };

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
    const onKeyUp = (e) => {
      const k = keyMap[e.key];
      if (k) keys[k] = false;
    };

    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", () => canvas.focus());

    const engine = createEngine(w, h, proj, keys);
    let last = performance.now();

    const loop = (now) => {
      if (!session || session.ended) return;
      const dt = now - last;
      last = now;
      if (engine.update) engine.update(dt);
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

  window.ShippedPlatformer = {
    getFlavor,
    renderShell,
    mount,
    unmount
  };
})();