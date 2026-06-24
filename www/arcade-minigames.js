/**
 * Arcade Mini-games Engine for Dev End Tycoon
 * Canvas-based retro arcade games for dev sprints, training, and gigs.
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
  const DURATION_MULT = 1.35;

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

  function drawScanlines(ctx, w, h) {
    ctx.fillStyle = "rgba(0,0,0,0.12)";
    for (let y = 0; y < h; y += 4) ctx.fillRect(0, y, w, 2);
  }

  function drawHud(ctx, w, text, accent) {
    ctx.fillStyle = "rgba(0,0,0,0.55)";
    ctx.fillRect(0, 0, w, 22);
    ctx.fillStyle = accent || C.cyan;
    ctx.font = "11px monospace";
    ctx.fillText(text, 8, 15);
  }

  // ─── GAME DEFINITIONS ───────────────────────────────────────────

  const GAMES = {
    snake: {
      id: "snake",
      title: "Syntax Snake",
      emoji: "🐍",
      category: "code",
      accent: C.cyan,
      instructions: "Arrow keys / WASD — eat code bytes without crashing.",
      goal: "Eat 5 code bytes",
      controls: "WASD or Arrow keys",
      duration: 55000,
      create(w, h, keys) {
        const cols = 20, rows = 15;
        const cw = w / cols, ch = h / rows;
        let snake = [{ x: 10, y: 7 }, { x: 9, y: 7 }, { x: 8, y: 7 }];
        let dir = { x: 1, y: 0 }, nextDir = { x: 1, y: 0 };
        let food = { x: 15, y: 7 };
        let eaten = 0, tick = 0, speed = 11;
        const placeFood = () => {
          do { food = { x: rand(0, cols - 1), y: rand(0, rows - 1) }; }
          while (snake.some(s => s.x === food.x && s.y === food.y));
        };
        return {
          update() {
            if (keys.left && dir.x !== 1) nextDir = { x: -1, y: 0 };
            if (keys.right && dir.x !== -1) nextDir = { x: 1, y: 0 };
            if (keys.up && dir.y !== 1) nextDir = { x: 0, y: -1 };
            if (keys.down && dir.y !== -1) nextDir = { x: 0, y: 1 };
            tick++;
            if (tick < speed) return;
            tick = 0;
            dir = nextDir;
            const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
            if (head.x < 0 || head.x >= cols || head.y < 0 || head.y >= rows) return endSession("lose", "Segmentation fault!");
            if (snake.some(s => s.x === head.x && s.y === head.y)) return endSession("lose", "Infinite recursion!");
            snake.unshift(head);
            if (head.x === food.x && head.y === food.y) {
              eaten++;
              if (eaten >= 5) return endSession("win");
              placeFood();
              speed = Math.max(7, speed - 1);
            } else snake.pop();
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            for (let x = 0; x < cols; x++) for (let y = 0; y < rows; y++) {
              ctx.strokeStyle = C.grid;
              ctx.strokeRect(x * cw, y * ch + 22, cw, ch);
            }
            drawHud(ctx, w, `BYTES: ${eaten}/5`, C.cyan);
            ctx.fillStyle = C.gold;
            ctx.fillRect(food.x * cw + 2, food.y * ch + 24, cw - 4, ch - 4);
            snake.forEach((s, i) => {
              ctx.fillStyle = i === 0 ? C.cyan : C.purple;
              ctx.fillRect(s.x * cw + 1, s.y * ch + 23, cw - 2, ch - 2);
            });
          }
        };
      }
    },

    space_invaders: {
      id: "space_invaders",
      title: "Deploy Invaders",
      emoji: "👾",
      category: "code",
      accent: C.cyan,
      instructions: "← → move, SPACE shoot — clear the alien PRs.",
      goal: "Destroy all aliens",
      controls: "← → move · Space shoot",
      duration: 60000,
      create(w, h, keys) {
        let px = w / 2, bullets = [], aliens = [], frame = 0, dir = 1;
        for (let r = 0; r < 2; r++) for (let c = 0; c < 7; c++)
          aliens.push({ x: 45 + c * 42, y: 45 + r * 30, alive: true });
        return {
          update() {
            if (keys.left) px = Math.max(20, px - 6);
            if (keys.right) px = Math.min(w - 20, px + 6);
            if (keys.fire && frame % 7 === 0) bullets.push({ x: px, y: h - 35, vy: -8 });
            frame++;
            bullets.forEach(b => { b.y += b.vy; });
            bullets = bullets.filter(b => b.y > 20);
            let edge = false;
            aliens.filter(a => a.alive).forEach(a => {
              a.x += dir * 0.75;
              if (a.x < 15 || a.x > w - 15) edge = true;
            });
            if (edge) { dir *= -1; aliens.forEach(a => { if (a.alive) a.y += 7; }); }
            aliens.forEach(a => {
              if (!a.alive) return;
              bullets.forEach(b => {
                if (Math.abs(b.x - a.x) < 20 && Math.abs(b.y - a.y) < 18) { a.alive = false; b.y = -99; }
              });
              if (a.y > h - 48) endSession("lose", "Aliens merged to main!");
            });
            if (aliens.every(a => !a.alive)) endSession("win");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `ALIENS: ${aliens.filter(a => a.alive).length}`, C.cyan);
            ctx.fillStyle = C.cyan;
            ctx.fillRect(px - 14, h - 28, 28, 10);
            bullets.forEach(b => { ctx.fillStyle = C.gold; ctx.fillRect(b.x - 2, b.y, 4, 8); });
            aliens.forEach(a => {
              if (!a.alive) return;
              ctx.fillStyle = C.red;
              ctx.fillRect(a.x - 10, a.y, 20, 14);
              ctx.fillStyle = C.green;
              ctx.fillRect(a.x - 6, a.y + 4, 4, 4);
              ctx.fillRect(a.x + 2, a.y + 4, 4, 4);
            });
            drawScanlines(ctx, w, h);
          }
        };
      }
    },

    breakout: {
      id: "breakout",
      title: "Brick Breaker Build",
      emoji: "🧱",
      category: "code",
      accent: C.cyan,
      instructions: "← → paddle, SPACE launch — smash the legacy bricks.",
      goal: "Break all bricks (one row is enough to vibe)",
      controls: "← → move paddle · Space launch ball",
      duration: 55000,
      create(w, h, keys) {
        let paddle = w / 2, ball = { x: w / 2, y: h - 50, vx: 2.5, vy: -3.5, stuck: true };
        let bricks = [];
        for (let r = 0; r < 3; r++) for (let c = 0; c < 9; c++)
          bricks.push({ x: 14 + c * 42, y: 38 + r * 20, w: 36, h: 14, alive: true, color: [C.cyan, C.purple, C.gold][r] });
        return {
          update() {
            if (keys.left) paddle = Math.max(30, paddle - 6);
            if (keys.right) paddle = Math.min(w - 30, paddle + 6);
            if (ball.stuck) { ball.x = paddle; if (keys.fire) ball.stuck = false; return; }
            ball.x += ball.vx; ball.y += ball.vy;
            if (ball.x < 8 || ball.x > w - 8) ball.vx *= -1;
            if (ball.y < 30) ball.vy *= -1;
            if (ball.y > h - 40 && Math.abs(ball.x - paddle) < 40) { ball.vy = -Math.abs(ball.vy); ball.vx += (ball.x - paddle) * 0.06; }
            if (ball.y > h + 10) return endSession("lose", "Ball fell to /dev/null!");
            bricks.forEach(b => {
              if (!b.alive) return;
              if (ball.x > b.x && ball.x < b.x + b.w && ball.y > b.y && ball.y < b.y + b.h) {
                b.alive = false; ball.vy *= -1;
              }
            });
            if (bricks.every(b => !b.alive)) endSession("win");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `BRICKS: ${bricks.filter(b => b.alive).length}`, C.cyan);
            bricks.forEach(b => { if (b.alive) { ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h); } });
            ctx.fillStyle = C.purple;
            ctx.fillRect(paddle - 32, h - 22, 64, 10);
            ctx.fillStyle = C.gold;
            ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2); ctx.fill();
          }
        };
      }
    },

    asteroids: {
      id: "asteroids",
      title: "Memory Leak Asteroids",
      emoji: "☄️",
      category: "code",
      accent: C.cyan,
      instructions: "WASD thrust/rotate, SPACE shoot — destroy heap fragments.",
      goal: "Destroy 7 fragments",
      controls: "WASD move · Space shoot",
      duration: 60000,
      create(w, h, keys) {
        let ship = { x: w / 2, y: h / 2, a: -Math.PI / 2, vx: 0, vy: 0 };
        let rocks = [], bullets = [], killed = 0, frame = 0;
        const spawn = () => { for (let i = 0; i < 5; i++) rocks.push({ x: randF(30, w - 30), y: randF(40, h - 30), r: rand(12, 22), vx: randF(-1.5, 1.5), vy: randF(-1.5, 1.5) }); };
        spawn();
        return {
          update() {
            frame++;
            if (keys.left) ship.a -= 0.1;
            if (keys.right) ship.a += 0.1;
            if (keys.up) { ship.vx += Math.cos(ship.a) * 0.15; ship.vy += Math.sin(ship.a) * 0.15; }
            if (keys.fire && frame % 10 === 0) bullets.push({ x: ship.x, y: ship.y, vx: Math.cos(ship.a) * 6, vy: Math.sin(ship.a) * 6, life: 50 });
            ship.x = (ship.x + ship.vx + w) % w; ship.y = (ship.y + ship.vy + h) % h;
            ship.vx *= 0.99; ship.vy *= 0.99;
            bullets.forEach(b => { b.x += b.vx; b.y += b.vy; b.life--; });
            bullets = bullets.filter(b => b.life > 0);
            rocks.forEach(r => { r.x = (r.x + r.vx + w) % w; r.y = (r.y + r.vy + h) % h; });
            rocks.forEach(r => {
              bullets.forEach(b => {
                const d = Math.hypot(b.x - r.x, b.y - r.y);
                if (d < r.r + 6) { b.life = 0; r.r = -1; killed++; if (killed >= 7) endSession("win"); else if (rocks.filter(x => x.r > 0).length === 0) spawn(); }
              });
              if (Math.hypot(ship.x - r.x, ship.y - r.y) < r.r + 5) endSession("lose", "Ship garbage collected!");
            });
            rocks = rocks.filter(r => r.r > 0);
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `FRAGMENTS: ${killed}/7`, C.cyan);
            rocks.forEach(r => { ctx.strokeStyle = C.purple; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2); ctx.stroke(); });
            ctx.save(); ctx.translate(ship.x, ship.y); ctx.rotate(ship.a);
            ctx.fillStyle = C.cyan; ctx.beginPath(); ctx.moveTo(10, 0); ctx.lineTo(-8, 6); ctx.lineTo(-8, -6); ctx.fill();
            ctx.restore();
            bullets.forEach(b => { ctx.fillStyle = C.gold; ctx.fillRect(b.x - 1, b.y - 1, 3, 3); });
          }
        };
      }
    },

    pong: {
      id: "pong",
      title: "API Pong",
      emoji: "🏓",
      category: "design",
      accent: C.purple,
      instructions: "↑ ↓ move paddle — beat the latency bot.",
      goal: "Score 3 points",
      controls: "↑ ↓ move paddle",
      duration: 50000,
      create(w, h, keys) {
        let py = h / 2, ay = h / 2, ball = { x: w / 2, y: h / 2, vx: 3, vy: 2.5 }, ps = 0, as = 0;
        return {
          update() {
            if (keys.up) py = Math.max(30, py - 6);
            if (keys.down) py = Math.min(h - 30, py + 6);
            ay += (ball.y - ay) * 0.04;
            ball.x += ball.vx; ball.y += ball.vy;
            if (ball.y < 30 || ball.y > h - 10) ball.vy *= -1;
            if (ball.x < 24 && ball.y > py - 35 && ball.y < py + 35) { ball.vx = Math.abs(ball.vx); ball.vy += (ball.y - py) * 0.05; }
            if (ball.x > w - 24 && ball.y > ay - 35 && ball.y < ay + 35) { ball.vx = -Math.abs(ball.vx); ball.vy += (ball.y - ay) * 0.05; }
            if (ball.x < 0) { as++; ball = { x: w / 2, y: h / 2, vx: 3, vy: randF(-2.5, 2.5) }; if (as >= 4) endSession("lose", "Latency bot wins!"); }
            if (ball.x > w) { ps++; ball = { x: w / 2, y: h / 2, vx: -3, vy: randF(-2.5, 2.5) }; if (ps >= 3) endSession("win"); }
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `YOU ${ps} — ${as} BOT`, C.purple);
            ctx.fillStyle = C.purple;
            ctx.fillRect(8, py - 30, 8, 60);
            ctx.fillStyle = C.red;
            ctx.fillRect(w - 16, ay - 30, 8, 60);
            ctx.fillStyle = C.gold;
            ctx.beginPath(); ctx.arc(ball.x, ball.y, 6, 0, Math.PI * 2); ctx.fill();
          }
        };
      }
    },

    memory: {
      id: "memory",
      title: "UI Memory Match",
      emoji: "🃏",
      category: "design",
      accent: C.purple,
      instructions: "Click cards — match all design token pairs.",
      goal: "Match 4 pairs",
      controls: "Mouse click on cards",
      duration: 70000,
      create(w, h, keys, mouse) {
        const symbols = ["🎨", "🖌️", "✨", "📐"];
        let cards = [...symbols, ...symbols].sort(() => Math.random() - 0.5).map((s, i) => ({ id: i, sym: s, open: false, matched: false }));
        let sel = [], moves = 0, lock = false;
        const cols = 4, rows = 2, cw = (w - 20) / cols, ch = (h - 40) / rows;
        mouse.click = (mx, my) => {
          if (lock) return;
          const c = Math.floor((mx - 10) / cw), r = Math.floor((my - 30) / ch);
          if (c < 0 || c >= cols || r < 0 || r >= rows) return;
          const card = cards[r * cols + c];
          if (!card || card.open || card.matched) return;
          card.open = true; sel.push(card);
          if (sel.length === 2) {
            moves++; lock = true;
            if (sel[0].sym === sel[1].sym) { sel.forEach(c => c.matched = true); sel = []; lock = false; if (cards.every(c => c.matched)) endSession("win"); }
            else setTimeout(() => { sel.forEach(c => c.open = false); sel = []; lock = false; }, 700);
          }
        };
        return {
          update() {},
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `MOVES: ${moves}`, C.purple);
            cards.forEach((card, i) => {
              const c = i % cols, r = Math.floor(i / cols);
              const x = 10 + c * cw, y = 30 + r * ch;
              ctx.fillStyle = card.matched ? "rgba(57,255,20,0.3)" : card.open ? C.purple : "#1a1a2e";
              ctx.fillRect(x + 2, y + 2, cw - 4, ch - 4);
              if (card.open || card.matched) { ctx.font = "24px serif"; ctx.fillText(card.sym, x + cw / 2 - 12, y + ch / 2 + 8); }
            });
          },
          cleanup() { mouse.click = null; }
        };
      }
    },

    frogger: {
      id: "frogger",
      title: "Sprint Frogger",
      emoji: "🐸",
      category: "design",
      accent: C.purple,
      instructions: "Cross traffic lanes to reach prod.",
      goal: "Reach production (top)",
      controls: "WASD or Arrows",
      duration: 55000,
      create(w, h, keys) {
        let fx = w / 2, fy = h - 40, lane = 0, frame = 0;
        const lanes = 3, cars = [];
        for (let l = 0; l < lanes; l++) for (let i = 0; i < 2; i++)
          cars.push({ lane: l, x: randF(0, w), spd: (l % 2 ? 1 : -1) * (1.2 + l * 0.35) });
        return {
          update() {
            frame++;
            if (keys.up && frame % 5 === 0 && fy > 50) { fy -= 24; lane++; }
            if (keys.down && frame % 5 === 0 && fy < h - 40) { fy += 24; lane = Math.max(0, lane - 1); }
            if (keys.left) fx = Math.max(16, fx - 5);
            if (keys.right) fx = Math.min(w - 16, fx + 5);
            cars.forEach(c => { c.x += c.spd; if (c.x < -30) c.x = w + 30; if (c.x > w + 30) c.x = -30; });
            if (lane > 0) cars.forEach(c => {
              const ly = 55 + c.lane * 32;
              if (Math.abs(fy - ly) < 16 && Math.abs(fx - c.x) < 28) endSession("lose", "Run over by a deadline!");
            });
            if (fy < 45) endSession("win");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `LANE: ${lane}/${lanes}`, C.purple);
            for (let l = 0; l < lanes; l++) {
              const ly = 50 + l * 28;
              ctx.fillStyle = l % 2 ? "rgba(179,136,255,0.1)" : "rgba(0,229,255,0.06)";
              ctx.fillRect(0, ly - 10, w, 24);
              cars.filter(c => c.lane === l).forEach(c => { ctx.fillStyle = C.red; ctx.fillRect(c.x - 18, ly - 8, 36, 16); });
            }
            ctx.fillStyle = C.green;
            ctx.beginPath(); ctx.arc(fx, fy, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = C.gold;
            ctx.fillRect(0, 25, w, 20);
            ctx.fillStyle = "#000";
            ctx.font = "10px monospace";
            ctx.fillText("PRODUCTION", w / 2 - 35, 38);
          }
        };
      }
    },

    tetris: {
      id: "tetris",
      title: "Block Commit Tetris",
      emoji: "🧩",
      category: "design",
      accent: C.purple,
      instructions: "← → move, ↓ drop, ↑ rotate — clear lines of tech debt.",
      goal: "Clear 5 lines",
      controls: "← → move · ↓ fast drop · ↑ rotate",
      duration: 65000,
      create(w, h, keys) {
        const cols = 10, rows = 16, cw = 24;
        const ox = (w - cols * cw) / 2, oy = 30;
        let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
        const shapes = [[[1,1,1,1]], [[1,1],[1,1]], [[0,1,0],[1,1,1]], [[1,0,0],[1,1,1]]];
        let piece = null, lines = 0, drop = 0;
        const newPiece = () => {
          const s = shapes[rand(0, shapes.length - 1)];
          piece = { shape: s.map(r => [...r]), x: 3, y: 0 };
        };
        const collide = (sh, px, py) => sh.some((row, ry) => row.some((v, rx) => {
          if (!v) return false;
          const nx = px + rx, ny = py + ry;
          return nx < 0 || nx >= cols || ny >= rows || (ny >= 0 && grid[ny][nx]);
        }));
        const merge = () => {
          piece.shape.forEach((row, ry) => row.forEach((v, rx) => { if (v && piece.y + ry >= 0) grid[piece.y + ry][piece.x + rx] = 1; }));
          let cleared = 0;
          grid = grid.filter(row => { if (row.every(c => c)) { cleared++; return false; } return true; });
          while (grid.length < rows) grid.unshift(Array(cols).fill(0));
          lines += cleared;
          if (lines >= 5) endSession("win");
          newPiece();
          if (collide(piece.shape, piece.x, piece.y)) endSession("lose", "Stack overflow!");
        };
        const rotate = () => {
          const rot = piece.shape[0].map((_, i) => piece.shape.map(r => r[i]).reverse());
          if (!collide(rot, piece.x, piece.y)) piece.shape = rot;
        };
        newPiece();
        return {
          update() {
            drop++;
            if (keys.left && drop % 6 === 0) { if (!collide(piece.shape, piece.x - 1, piece.y)) piece.x--; }
            if (keys.right && drop % 6 === 0) { if (!collide(piece.shape, piece.x + 1, piece.y)) piece.x++; }
            if (keys.up && drop % 10 === 0) rotate();
            if (drop % (keys.down ? 5 : 22) === 0) {
              if (!collide(piece.shape, piece.x, piece.y + 1)) piece.y++;
              else merge();
            }
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `LINES: ${lines}/5`, C.purple);
            grid.forEach((row, ry) => row.forEach((v, rx) => {
              if (v) { ctx.fillStyle = C.purple; ctx.fillRect(ox + rx * cw, oy + ry * cw, cw - 1, cw - 1); }
            }));
            piece.shape.forEach((row, ry) => row.forEach((v, rx) => {
              if (v) { ctx.fillStyle = C.cyan; ctx.fillRect(ox + (piece.x + rx) * cw, oy + (piece.y + ry) * cw, cw - 1, cw - 1); }
            }));
          }
        };
      }
    },

    flappy: {
      id: "flappy",
      title: "Flappy Feature",
      emoji: "🐦",
      category: "design",
      accent: C.purple,
      instructions: "SPACE / click flap — pass scope gates.",
      goal: "Pass 6 gates",
      controls: "Space or click to flap",
      duration: 50000,
      create(w, h, keys, mouse) {
        let bird = { y: h / 2, vy: 0 }, pipes = [], passed = 0, frame = 0;
        mouse.click = () => { bird.vy = -4.5; };
        return {
          update() {
            frame++;
            if (keys.fire) bird.vy = -4.5;
            bird.vy += 0.22; bird.y += bird.vy;
            if (frame % 85 === 0) pipes.push({ x: w, gap: randF(100, 155), scored: false });
            pipes.forEach(p => {
              p.x -= 2.2;
              if (!p.scored && p.x + 30 < 60) { p.scored = true; passed++; if (passed >= 6) endSession("win"); }
              if (60 > p.x && 60 < p.x + 30 && (bird.y < p.gap - 48 || bird.y > p.gap + 48)) endSession("lose", "Hit a scope gate!");
            });
            pipes = pipes.filter(p => p.x > -40);
            if (bird.y < 25 || bird.y > h) endSession("lose", "Fell off the roadmap!");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `GATES: ${passed}/6`, C.purple);
            pipes.forEach(p => {
              ctx.fillStyle = C.purple;
              ctx.fillRect(p.x, 30, 30, p.gap - 40);
              ctx.fillRect(p.x, p.gap + 40, 30, h - p.gap - 40);
            });
            ctx.fillStyle = C.gold;
            ctx.beginPath(); ctx.arc(60, bird.y, 10, 0, Math.PI * 2); ctx.fill();
          },
          cleanup() { mouse.click = null; }
        };
      }
    },

    whack_bug: {
      id: "whack_bug",
      title: "Whack-a-Bug",
      emoji: "🔨",
      category: "polish",
      accent: C.gold,
      instructions: "Click the 🐛 bugs before they escape!",
      goal: "Squash 10 bugs (8 misses allowed)",
      controls: "Mouse click on bugs",
      duration: 45000,
      create(w, h, keys, mouse) {
        let holes = Array.from({ length: 9 }, (_, i) => ({ i, bug: false, timer: rand(30, 90) }));
        let squashed = 0, missed = 0;
        mouse.click = (mx, my) => {
          const cols = 3, cw = w / cols, ch = (h - 30) / 3;
          const c = Math.floor(mx / cw), r = Math.floor((my - 30) / ch);
          const hole = holes[r * 3 + c];
          if (hole && hole.bug) { hole.bug = false; squashed++; if (squashed >= 10) endSession("win"); }
        };
        return {
          update() {
            holes.forEach(h => {
              h.timer--;
              if (h.timer <= 0) {
                if (h.bug) { missed++; if (missed >= 8) endSession("lose", "Bugs shipped to prod!"); }
                h.bug = Math.random() < 0.65;
                h.timer = rand(35, 85);
              }
            });
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `SQUASHED: ${squashed}/10  MISSED: ${missed}/8`, C.gold);
            holes.forEach((hole, i) => {
              const c = i % 3, r = Math.floor(i / 3);
              const x = c * (w / 3) + w / 6, y = 30 + r * ((h - 30) / 3) + (h - 30) / 6;
              ctx.fillStyle = "#1a1a2e";
              ctx.beginPath(); ctx.arc(x, y, 28, 0, Math.PI * 2); ctx.fill();
              if (hole.bug) { ctx.font = "28px serif"; ctx.fillText("🐛", x - 14, y + 10); }
            });
          },
          cleanup() { mouse.click = null; }
        };
      }
    },

    pac_dots: {
      id: "pac_dots",
      title: "Pac-Bug Dots",
      emoji: "👻",
      category: "polish",
      accent: C.gold,
      instructions: "WASD move — eat all dots, avoid ghost regressions.",
      goal: "Eat all dots on the board",
      controls: "WASD or Arrow keys",
      duration: 60000,
      create(w, h, keys) {
        const cols = 15, rows = 11, cw = w / cols, ch = (h - 25) / rows;
        let px = 1, py = 1, dots = [], ghosts = [{ x: 13, y: 9, c: 0 }];
        for (let y = 0; y < rows; y++) for (let x = 0; x < cols; x++)
          if ((x + y) % 4 === 0 && !(x === 1 && y === 1)) dots.push({ x, y });
        return {
          update() {
            let nx = px, ny = py;
            if (keys.left) nx--;
            if (keys.right) nx++;
            if (keys.up) ny--;
            if (keys.down) ny++;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) { px = nx; py = ny; }
            dots = dots.filter(d => !(d.x === px && d.y === py));
            if (dots.length === 0) endSession("win");
            ghosts.forEach(g => {
              if (Math.random() < 0.022) { g.x += rand(-1, 1); g.y += rand(-1, 1); g.x = clamp(g.x, 0, cols - 1); g.y = clamp(g.y, 0, rows - 1); }
              if (g.x === px && g.y === py) endSession("lose", "Regression ghost caught you!");
            });
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `DOTS: ${dots.length}`, C.gold);
            dots.forEach(d => { ctx.fillStyle = C.gold; ctx.beginPath(); ctx.arc(d.x * cw + cw / 2, d.y * ch + ch / 2 + 25, 3, 0, Math.PI * 2); ctx.fill(); });
            ghosts.forEach(g => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(g.x * cw + cw / 2, g.y * ch + ch / 2 + 25, 10, 0, Math.PI * 2); ctx.fill(); });
            ctx.fillStyle = C.gold;
            ctx.beginPath(); ctx.arc(px * cw + cw / 2, py * ch + ch / 2 + 25, 9, 0.2, Math.PI * 2); ctx.fill();
          }
        };
      }
    },

    minesweeper: {
      id: "minesweeper",
      title: "Mine Sweeper QA",
      emoji: "💣",
      category: "polish",
      accent: C.gold,
      instructions: "Click to reveal — flag 7 mines without detonating.",
      goal: "Flag all 7 mines safely",
      controls: "Left-click reveal · Right-click flag",
      duration: 70000,
      create(w, h, keys, mouse) {
        const cols = 10, rows = 8, cw = (w - 10) / cols, ch = (h - 30) / rows;
        let grid = Array.from({ length: rows }, () => Array(cols).fill(0));
        let revealed = 0, flags = 0, done = false;
        const mineCount = 7;
        let mines = mineCount;
        while (mines > 0) {
          const x = rand(0, cols - 1), y = rand(0, rows - 1);
          if (!grid[y][x]) { grid[y][x] = -1; mines--; }
        }
        const count = (x, y) => {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
            const nx = x + dx, ny = y + dy;
            if (nx >= 0 && nx < cols && ny >= 0 && ny < rows && grid[ny][nx] === -1) n++;
          }
          return n;
        };
        mouse.click = (mx, my) => {
          if (done) return;
          const c = Math.floor((mx - 5) / cw), r = Math.floor((my - 30) / ch);
          if (c < 0 || c >= cols || r < 0 || r >= rows) return;
          if (grid[r][c] === -2) return;
          if (grid[r][c] === -1) { endSession("lose", "Detonated a landmine bug!"); return; }
          if (grid[r][c] === 0) {
            const flood = (x, y) => {
              if (x < 0 || x >= cols || y < 0 || y >= rows || grid[y][x] !== 0) return;
              grid[y][x] = -3; revealed++;
              for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) flood(x + dx, y + dy);
            };
            grid[r][c] = -3; revealed++;
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
              const n = count(r + dy, c + dx);
              if (r + dy >= 0 && c + dx >= 0 && r + dy < rows && c + dx < cols && grid[r + dy][c + dx] === 0) flood(c + dx, r + dy);
            }
          } else { grid[r][c] = -3; revealed++; }
          if (revealed >= cols * rows - mineCount) endSession("win");
        };
        mouse.right = (mx, my) => {
          const c = Math.floor((mx - 5) / cw), r = Math.floor((my - 30) / ch);
          if (c < 0 || c >= cols || r < 0 || r >= rows) return;
          if (grid[r][c] === 0) { grid[r][c] = -2; flags++; if (flags >= mineCount) endSession("win"); }
        };
        return {
          update() {},
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `FLAGS: ${flags}/${mineCount}  SAFE: ${revealed}`, C.gold);
            for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
              const x = 5 + c * cw, y = 30 + r * ch;
              const v = grid[r][c];
              ctx.fillStyle = v === -3 ? "#1a1a2e" : v === -2 ? C.red : "#2a2a4e";
              ctx.fillRect(x + 1, y + 1, cw - 2, ch - 2);
              if (v === -2) { ctx.fillStyle = C.gold; ctx.fillText("🚩", x + 4, y + ch - 4); }
              if (v === -3 && grid[r][c] !== -1) {
                const n = count(c, r);
                if (n) { ctx.fillStyle = C.cyan; ctx.fillText(String(n), x + cw / 2 - 3, y + ch - 4); }
              }
            }
          },
          cleanup() { mouse.click = null; mouse.right = null; }
        };
      }
    },

    reaction: {
      id: "reaction",
      title: "Ping Reaction",
      emoji: "⚡",
      category: "polish",
      accent: C.gold,
      instructions: "SPACE when the bar hits green — 6 perfect pings.",
      goal: "Land 6 pings in the green zone",
      controls: "Space when bar is green",
      duration: 40000,
      create(w, h, keys) {
        let pos = 0, dir = 1, hits = 0, waiting = true, wait = rand(30, 80), frame = 0;
        return {
          update() {
            frame++;
            if (waiting) { wait--; if (wait <= 0) waiting = false; return; }
            pos += dir * 2;
            if (pos >= 100 || pos <= 0) dir *= -1;
            if (keys.fire) {
              if (pos >= 36 && pos <= 64) { hits++; waiting = true; wait = rand(25, 55); pos = 0; if (hits >= 6) endSession("win"); }
              else endSession("lose", "Missed the ping window!");
            }
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `PINGS: ${hits}/6`, C.gold);
            if (!waiting) {
              ctx.fillStyle = "#222";
              ctx.fillRect(40, h / 2 - 15, w - 80, 30);
              ctx.fillStyle = "rgba(57,255,20,0.5)";
              ctx.fillRect(40 + (w - 80) * 0.36, h / 2 - 15, (w - 80) * 0.28, 30);
              ctx.fillStyle = C.gold;
              ctx.fillRect(40 + (w - 80) * pos / 100 - 3, h / 2 - 18, 6, 36);
            } else {
              ctx.fillStyle = C.cyan;
              ctx.font = "14px monospace";
              ctx.fillText("GET READY...", w / 2 - 45, h / 2);
            }
          }
        };
      }
    },

    invaders_rush: {
      id: "invaders_rush",
      title: "CI/CD Invader Rush",
      emoji: "🚀",
      category: "code",
      accent: C.cyan,
      instructions: "SPACE shoot — destroy 12 deploy blobs before they land.",
      goal: "Destroy 12 deploy blobs",
      controls: "← → move · Space shoot",
      duration: 50000,
      create(w, h, keys) {
        let px = w / 2, blobs = [], bullets = [], killed = 0, frame = 0;
        return {
          update() {
            frame++;
            if (keys.left) px = Math.max(20, px - 5);
            if (keys.right) px = Math.min(w - 20, px + 5);
            if (keys.fire && frame % 6 === 0) bullets.push({ x: px, y: h - 30, vy: -9 });
            if (frame % 48 === 0) blobs.push({ x: randF(20, w - 20), y: 30, vy: randF(1.1, 2.2) });
            bullets.forEach(b => { b.y += b.vy; });
            bullets = bullets.filter(b => b.y > 20);
            blobs.forEach(b => {
              b.y += b.vy;
              bullets.forEach(bl => { if (Math.abs(bl.x - b.x) < 18 && Math.abs(bl.y - b.y) < 16) { b.y = 999; bl.y = -99; killed++; } });
              if (b.y > h - 40 && Math.abs(b.x - px) < 24) endSession("lose", "Deploy failed on prod!");
              if (b.y > h) endSession("lose", "Blob reached main branch!");
            });
            blobs = blobs.filter(b => b.y < h);
            if (killed >= 12) endSession("win");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `BLOBS: ${killed}/12`, C.cyan);
            ctx.fillStyle = C.cyan;
            ctx.fillRect(px - 12, h - 26, 24, 8);
            bullets.forEach(b => { ctx.fillStyle = C.gold; ctx.fillRect(b.x - 2, b.y, 4, 6); });
            blobs.forEach(b => { ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(b.x, b.y, 12, 0, Math.PI * 2); ctx.fill(); });
          }
        };
      }
    },

    color_catch: {
      id: "color_catch",
      title: "Palette Catcher",
      emoji: "🎨",
      category: "design",
      accent: C.purple,
      instructions: "← → catch 8 falling swatches in your palette bucket.",
      goal: "Catch 8 color swatches",
      controls: "← → move bucket",
      duration: 50000,
      create(w, h, keys) {
        let bx = w / 2, drops = [], caught = 0, frame = 0;
        const colors = [C.cyan, C.purple, C.gold, C.green, C.red];
        return {
          update() {
            frame++;
            if (keys.left) bx = Math.max(30, bx - 5);
            if (keys.right) bx = Math.min(w - 30, bx + 5);
            if (frame % 50 === 0) drops.push({ x: randF(20, w - 20), y: 30, color: colors[rand(0, colors.length - 1)] });
            drops.forEach(d => { d.y += 2.4; if (d.y > h - 35 && Math.abs(d.x - bx) < 42) { caught++; d.y = 999; if (caught >= 8) endSession("win"); } });
            drops = drops.filter(d => d.y < h);
            if (drops.some(d => d.y > h)) endSession("lose", "Dropped a brand color!");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `CAUGHT: ${caught}/8`, C.purple);
            drops.forEach(d => { ctx.fillStyle = d.color; ctx.fillRect(d.x - 8, d.y, 16, 16); });
            ctx.fillStyle = C.purple;
            ctx.fillRect(bx - 45, h - 28, 90, 12);
          }
        };
      }
    },

    stack_jump: {
      id: "stack_jump",
      title: "Stack Overflow Jump",
      emoji: "📚",
      category: "polish",
      accent: C.gold,
      instructions: "SPACE jump — land on 7 stack frames without falling.",
      goal: "Land on 7 stack frames",
      controls: "Space to jump",
      duration: 45000,
      create(w, h, keys) {
        let player = { x: 80, y: h - 60, vy: 0, onGround: true }, frames = [], score = 0;
        for (let i = 0; i < 10; i++) frames.push({ x: 60 + i * 50, y: h - 50 - i * 32, w: 58 });
        return {
          update() {
            if (keys.fire && player.onGround) { player.vy = -9.5; player.onGround = false; }
            player.vy += 0.38; player.y += player.vy;
            frames.forEach(f => { f.x -= 1.1; if (f.x < -60) { f.x = w + rand(0, 80); f.y = rand(h - 200, h - 80); f.landed = false; } });
            player.onGround = false;
            frames.forEach(f => {
              if (player.vy >= 0 && player.x > f.x && player.x < f.x + f.w && player.y >= f.y - 10 && player.y <= f.y + 10) {
                player.y = f.y - 10; player.vy = 0; player.onGround = true;
                if (!f.landed) { f.landed = true; score++; if (score >= 7) endSession("win"); }
              }
            });
            if (player.y > h) endSession("lose", "Stack unwound!");
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `FRAMES: ${score}/7`, C.gold);
            frames.forEach(f => { ctx.fillStyle = C.purple; ctx.fillRect(f.x, f.y, f.w, 8); });
            ctx.fillStyle = C.gold;
            ctx.fillRect(player.x - 8, player.y - 12, 16, 16);
          }
        };
      }
    },

    typing_shooter: {
      id: "typing_shooter",
      title: "Keyword Shooter",
      emoji: "⌨️",
      category: "code",
      accent: C.cyan,
      instructions: "Type falling keywords & press ENTER — clear 7 before they hit bottom.",
      goal: "Type and clear 7 keywords",
      controls: "Type word · Enter to shoot",
      duration: 55000,
      create(w, h, keys, mouse) {
        const words = ["async", "null", "void", "const", "debug", "merge", "lint", "cache", "proxy", "fetch"];
        let falling = [], typed = "", cleared = 0, frame = 0;
        const onKey = (e) => {
          if (e.key === "Enter") {
            const match = falling.find(f => f.word === typed);
            if (match) { match.y = -99; typed = ""; cleared++; if (cleared >= 7) endSession("win"); }
            else typed = "";
          } else if (e.key === "Backspace") typed = typed.slice(0, -1);
          else if (e.key.length === 1 && /[a-z]/.test(e.key)) typed += e.key;
        };
        document.addEventListener("keydown", onKey);
        return {
          update() {
            frame++;
            if (frame % 72 === 0) falling.push({ word: words[rand(0, words.length - 1)], x: randF(40, w - 80), y: 35 });
            falling.forEach(f => { f.y += 1.35; if (f.y > h - 20) endSession("lose", "Unhandled exception!"); });
            falling = falling.filter(f => f.y < h);
          },
          draw(ctx) {
            ctx.fillStyle = C.bg;
            ctx.fillRect(0, 0, w, h);
            drawHud(ctx, w, `CLEARED: ${cleared}/7  TYPE: ${typed}`, C.cyan);
            falling.forEach(f => { ctx.fillStyle = C.cyan; ctx.font = "14px monospace"; ctx.fillText(f.word, f.x, f.y); });
          },
          cleanup() { document.removeEventListener("keydown", onKey); }
        };
      }
    }
  };

  const CATEGORY_MAP = {
    code: ["snake", "space_invaders", "breakout", "asteroids", "invaders_rush", "typing_shooter"],
    design: ["pong", "memory", "frogger", "tetris", "flappy", "color_catch"],
    polish: ["whack_bug", "pac_dots", "minesweeper", "reaction", "stack_jump"]
  };

  const GIG_MAP = {
    freelance_html: ["breakout", "pong", "color_catch"],
    crack_competitor: ["memory", "minesweeper", "typing_shooter"],
    ransomware: ["frogger", "pac_dots", "stack_jump"],
    ddos_rival: ["space_invaders", "invaders_rush", "reaction"]
  };

  function pickFrom(list) {
    return list[Math.floor(Math.random() * list.length)];
  }

  function getMeta(id) {
    const g = GAMES[id];
    if (!g) return { id, title: "Arcade", emoji: "🎮", accent: C.cyan, instructions: "Play to win!" };
    return g;
  }

  function pickForCategory(category) {
    const list = CATEGORY_MAP[category] || Object.keys(GAMES);
    return pickFrom(list);
  }

  function pickForGig(gigId) {
    const list = GIG_MAP[gigId] || Object.keys(GAMES);
    return pickFrom(list);
  }

  function listForCategory(category) {
    return (CATEGORY_MAP[category] || []).map(getMeta);
  }

  function renderShell(arcadeId, extraStyle, opts) {
    const meta = getMeta(arcadeId);
    const started = opts && opts.started;
    const goal = meta.goal || "Win before the timer runs out";
    const controls = meta.controls || meta.instructions;
    return `
      <div class="arcade-minigame" style="border-color:${meta.accent}; ${extraStyle || ""}">
        <div class="arcade-minigame-header">
          <h4 style="color:${meta.accent}">${meta.emoji} ${meta.title}</h4>
          <span class="arcade-badge">${started ? "LIVE" : "READY"}</span>
        </div>
        <p class="arcade-instructions">${meta.instructions}</p>
        <div class="arcade-canvas-wrap">
          <canvas id="arcade-canvas" width="420" height="300" tabindex="0"></canvas>
          ${started ? "" : `
          <div class="arcade-start-overlay" id="arcade-start-overlay">
            <div class="arcade-start-panel">
              <p class="arcade-start-goal"><span>Goal</span> ${goal}</p>
              <p class="arcade-start-controls"><span>Controls</span> ${controls}</p>
              <button type="button" class="btn-primary arcade-start-btn" onclick="startArcadeSession()">▶ START GAME</button>
              <div class="arcade-countdown" id="arcade-countdown" hidden></div>
            </div>
          </div>`}
        </div>
        <p class="arcade-controls-hint">${controls} · Click canvas after start for keyboard focus</p>
        <div class="status-bar-track arcade-timer${started ? "" : " arcade-timer-paused"}">
          <div class="status-bar-fill" id="minigame-timer-bar" style="width:100%; height:100%; background:${meta.accent};"></div>
        </div>
        <p class="arcade-timer-label" id="arcade-timer-label">${started ? "" : "Timer starts when you press START"}</p>
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
    const mouse = { click: null, right: null };

    const keyMap = {
      ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down",
      a: "left", d: "right", w: "up", s: "down",
      " ": "fire"
    };

    const onKeyDown = (e) => {
      const k = keyMap[e.key];
      if (k) { keys[k] = true; if (k === "fire") e.preventDefault(); }
    };
    const onKeyUp = (e) => {
      const k = keyMap[e.key];
      if (k) keys[k] = false;
    };
    const onClick = (e) => {
      canvas.focus();
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (w / rect.width);
      const my = (e.clientY - rect.top) * (h / rect.height);
      if (mouse.click) mouse.click(mx, my);
    };
    const onContext = (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left) * (w / rect.width);
      const my = (e.clientY - rect.top) * (h / rect.height);
      if (mouse.right) mouse.right(mx, my);
    };

    canvas.addEventListener("keydown", onKeyDown);
    canvas.addEventListener("keyup", onKeyUp);
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    canvas.addEventListener("click", onClick);
    canvas.addEventListener("contextmenu", onContext);

    const engine = game.create(w, h, keys, mouse);
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
        canvas.removeEventListener("click", onClick);
        canvas.removeEventListener("contextmenu", onContext);
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
    return Math.round((g ? g.duration : 55000) * DURATION_MULT);
  }

  window.ArcadeMinigames = {
    GAMES,
    CATEGORY_MAP,
    GIG_MAP,
    getMeta,
    pickForCategory,
    pickForGig,
    listForCategory,
    renderShell,
    mount,
    unmount,
    getDuration
  };
})();