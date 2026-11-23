// STAR CATCH — a tiny browser game in one file's worth of code.
// A cat slides along the bottom of the screen catching falling stars.
// Catch a star: +10. Miss one: lose a heart (you have 3). Catch a rock: -20 and a wobble.
// You have 60 seconds. Controls: arrow keys, A/D, mouse or touch drag.
// Demo mode (demo: true) plays by itself with a seeded star field, for recordings.
'use strict';

function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createStarCatch(canvas, opts) {
  const W = 900, H = 1350;
  canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d');
  const demo = !!(opts && opts.demo);
  const rand = mulberry32(opts && opts.seed ? opts.seed : 20261123);

  const GROUND = H - 150;
  const cat = { x: W / 2, w: 170, targetX: W / 2, wobble: 0 };
  let stars = [], rocks = [], sparkles = [];
  let score = 0, hearts = 3, timeLeft = 60, elapsed = 0;
  let spawnT = 0, rockT = 2.5, over = false, started = false;
  let keys = { left: false, right: false }, pointerX = null;
  let lastTs = 0, raf = 0;

  function spawnStar() {
    stars.push({ x: 60 + rand() * (W - 120), y: -30, vy: 330 + rand() * 160 + elapsed * 2.2, r: 24 + rand() * 8, spin: rand() * 6.28 });
  }
  function spawnRock() {
    rocks.push({ x: 60 + rand() * (W - 120), y: -30, vy: 300 + rand() * 120, r: 26, spin: rand() * 6.28 });
  }

  function drawStarShape(x, y, r, rot, fill) {
    ctx.save(); ctx.translate(x, y); ctx.rotate(rot);
    ctx.beginPath();
    for (let i = 0; i < 10; i++) {
      const rad = i % 2 === 0 ? r : r * 0.45;
      const a = (Math.PI / 5) * i - Math.PI / 2;
      ctx[i === 0 ? 'moveTo' : 'lineTo'](Math.cos(a) * rad, Math.sin(a) * rad);
    }
    ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.restore();
  }

  function drawCat() {
    const x = cat.x, y = GROUND + 58, wob = Math.sin(cat.wobble) * 4;
    ctx.save(); ctx.translate(x, y + wob);
    // tail
    ctx.strokeStyle = '#8d8d99'; ctx.lineWidth = 17; ctx.lineCap = 'round';
    ctx.beginPath(); ctx.moveTo(62, 26); ctx.quadraticCurveTo(118, 10, 104, -38); ctx.stroke();
    ctx.strokeStyle = '#f5f2ea'; ctx.lineWidth = 15;
    ctx.beginPath(); ctx.moveTo(106, -30); ctx.quadraticCurveTo(108, -40, 104, -38); ctx.stroke();
    // head
    ctx.fillStyle = '#a7a7b3';
    ctx.beginPath(); ctx.ellipse(0, 0, 84, 70, 0, 0, 6.29); ctx.fill();
    // ears with pink inners
    for (const s of [-1, 1]) {
      ctx.fillStyle = '#a7a7b3';
      ctx.beginPath(); ctx.moveTo(s * 34, -52); ctx.lineTo(s * 62, -108); ctx.lineTo(s * 82, -44); ctx.closePath(); ctx.fill();
      ctx.fillStyle = '#ffb7cd';
      ctx.beginPath(); ctx.moveTo(s * 47, -56); ctx.lineTo(s * 60, -88); ctx.lineTo(s * 70, -50); ctx.closePath(); ctx.fill();
    }
    // face: closed happy eyes, mouth, whiskers
    ctx.strokeStyle = '#26232b'; ctx.lineWidth = 6;
    for (const s of [-1, 1]) {
      ctx.beginPath(); ctx.arc(s * 32, -6, 13, Math.PI * 1.12, Math.PI * 1.88); ctx.stroke();
      ctx.lineWidth = 3.4;
      for (const k of [-1, 0, 1]) {
        ctx.beginPath(); ctx.moveTo(s * 56, 8 + k * 11); ctx.lineTo(s * 96, 2 + k * 14); ctx.stroke();
      }
      ctx.lineWidth = 6;
    }
    ctx.fillStyle = '#ff8fab';
    ctx.beginPath(); ctx.ellipse(0, 10, 8, 6, 0, 0, 6.29); ctx.fill();
    ctx.strokeStyle = '#26232b'; ctx.lineWidth = 4.4;
    ctx.beginPath(); ctx.arc(-7, 18, 7, 0.15 * Math.PI, 0.95 * Math.PI); ctx.stroke();
    ctx.beginPath(); ctx.arc(7, 18, 7, 0.05 * Math.PI, 0.85 * Math.PI); ctx.stroke();
    ctx.restore();
  }

  function draw() {
    const g = ctx.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, '#171233'); g.addColorStop(0.7, '#241a4d'); g.addColorStop(1, '#2e1a4d');
    ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    // distant twinkles (fixed pattern)
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    for (let i = 0; i < 42; i++) {
      const tx = (i * 197) % W, ty = (i * 311) % 900;
      ctx.fillRect(tx, ty, 3, 3);
    }
    // moon
    ctx.fillStyle = '#fdf6d8';
    ctx.beginPath(); ctx.arc(W - 130, 120, 52, 0, 6.29); ctx.fill();
    ctx.fillStyle = '#241a4d';
    ctx.beginPath(); ctx.arc(W - 104, 102, 46, 0, 6.29); ctx.fill();
    // ground
    ctx.fillStyle = '#120c26'; ctx.fillRect(0, GROUND + 108, W, H - GROUND);
    ctx.fillStyle = '#3a2a6b'; ctx.fillRect(0, GROUND + 108, W, 5);

    for (const s of stars) drawStarShape(s.x, s.y, s.r, s.spin, '#ffd94d');
    for (const r of rocks) {
      ctx.save(); ctx.translate(r.x, r.y); ctx.rotate(r.spin);
      ctx.fillStyle = '#6d6d78';
      ctx.beginPath(); ctx.ellipse(0, 0, r.r, r.r * 0.82, 0, 0, 6.29); ctx.fill();
      ctx.fillStyle = '#585864';
      ctx.beginPath(); ctx.ellipse(-8, -6, 9, 7, 0, 0, 6.29); ctx.fill();
      ctx.restore();
    }
    for (const p of sparkles) drawStarShape(p.x, p.y, p.r * p.life, 0.4, 'rgba(255,217,77,' + p.life.toFixed(2) + ')');
    drawCat();

    // HUD
    ctx.fillStyle = '#ffffff';
    ctx.font = '700 54px "Inter", "Helvetica Neue", Arial, sans-serif';
    ctx.textAlign = 'left'; ctx.fillText('SCORE ' + score, 36, 74);
    ctx.textAlign = 'right';
    ctx.fillStyle = hearts > 0 ? '#ff6b8a' : '#554';
    ctx.fillText('♥'.repeat(Math.max(0, hearts)), W - 36, 74);
    // timer bar
    ctx.fillStyle = 'rgba(255,255,255,0.18)'; ctx.fillRect(36, 100, W - 72, 14);
    ctx.fillStyle = timeLeft > 12 ? '#57e6a9' : '#ff6b8a';
    ctx.fillRect(36, 100, (W - 72) * Math.max(0, timeLeft) / 60, 14);

    if (!started && !demo) {
      ctx.fillStyle = 'rgba(10,6,24,0.55)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = '800 92px "Inter", Arial, sans-serif'; ctx.fillText('STAR CATCH', W / 2, H / 2 - 90);
      ctx.font = '500 40px "Inter", Arial, sans-serif';
      ctx.fillText('Catch the falling stars!', W / 2, H / 2 - 10);
      ctx.fillText('← → keys, mouse or touch', W / 2, H / 2 + 60);
      ctx.font = '700 44px "Inter", Arial, sans-serif'; ctx.fillStyle = '#ffd94d';
      ctx.fillText('Click or tap to start', W / 2, H / 2 + 150);
    }
    if (over) {
      ctx.fillStyle = 'rgba(10,6,24,0.62)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = '800 96px "Inter", Arial, sans-serif'; ctx.fillText("TIME'S UP!", W / 2, H / 2 - 40);
      ctx.font = '700 64px "Inter", Arial, sans-serif'; ctx.fillStyle = '#ffd94d';
      ctx.fillText('Score: ' + score, W / 2, H / 2 + 60);
      if (!demo) { ctx.fillStyle = '#fff'; ctx.font = '500 38px "Inter", Arial, sans-serif'; ctx.fillText('Click to play again', W / 2, H / 2 + 140); }
    }
  }

  function step(dt) {
    if (!started || over) return;
    elapsed += dt; timeLeft = Math.max(0, 60 - elapsed);
    if (timeLeft <= 0) { over = true; return; }
    spawnT -= dt; if (spawnT <= 0) { spawnStar(); spawnT = 0.42 + rand() * 0.3; }
    rockT -= dt; if (rockT <= 0) { spawnRock(); rockT = 3.4 + rand() * 2.4; }

    // movement
    const SPEED = 880;
    if (demo) {
      let best = null;
      for (const s of stars) if (!best || s.y > best.y) best = s;
      let tx = best ? best.x : W / 2;
      for (const r of rocks) if (r.y > H * 0.45 && Math.abs(r.x - tx) < 120) tx = r.x > W / 2 ? r.x - 260 : r.x + 260;
      cat.targetX = Math.max(90, Math.min(W - 90, tx + Math.sin(elapsed * 1.7) * 22));
      const d = cat.targetX - cat.x;
      cat.x += Math.max(-SPEED * dt, Math.min(SPEED * dt, d));
    } else {
      if (keys.left) cat.x -= SPEED * dt;
      if (keys.right) cat.x += SPEED * dt;
      if (pointerX !== null) cat.x += (pointerX - cat.x) * Math.min(1, dt * 14);
      cat.x = Math.max(90, Math.min(W - 90, cat.x));
    }
    cat.wobble += dt * 6;

    const catchY = GROUND + 30;
    stars = stars.filter((s) => {
      s.y += s.vy * dt; s.spin += dt * 1.6;
      if (s.y > catchY - 26 && s.y < catchY + 66 && Math.abs(s.x - cat.x) < cat.w / 2 + 8) {
        score += 10;
        for (let i = 0; i < 5; i++) sparkles.push({ x: s.x + (rand() - 0.5) * 70, y: catchY - 10 + (rand() - 0.5) * 30, r: 13, life: 1 });
        return false;
      }
      if (s.y > H + 40) { if (!demo) { hearts -= 1; if (hearts <= 0) { /* last heart gone: timer decides */ hearts = 0; } } return false; }
      return true;
    });
    rocks = rocks.filter((r) => {
      r.y += r.vy * dt; r.spin += dt * 0.9;
      if (r.y > catchY - 26 && r.y < catchY + 66 && Math.abs(r.x - cat.x) < cat.w / 2 + 4) {
        if (!demo) score = Math.max(0, score - 20);
        cat.wobble += 2.4;
        return false;
      }
      return r.y < H + 40;
    });
    sparkles = sparkles.filter((p) => (p.life -= dt * 1.8) > 0);
  }

  function frame(ts) {
    if (!lastTs) lastTs = ts;
    const dt = Math.min(0.05, (ts - lastTs) / 1000);
    lastTs = ts;
    step(dt); draw();
    raf = requestAnimationFrame(frame);
  }

  function begin() { if (!started) { started = true; } if (over && !demo) { score = 0; hearts = 3; elapsed = 0; stars = []; rocks = []; over = false; } }

  if (!demo) {
    addEventListener('keydown', (e) => { if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = true; if (e.key === 'ArrowRight' || e.key === 'd') keys.right = true; begin(); });
    addEventListener('keyup', (e) => { if (e.key === 'ArrowLeft' || e.key === 'a') keys.left = false; if (e.key === 'ArrowRight' || e.key === 'd') keys.right = false; });
    const toGameX = (clientX) => { const r = canvas.getBoundingClientRect(); return (clientX - r.left) / r.width * W; };
    canvas.addEventListener('pointermove', (e) => { pointerX = toGameX(e.clientX); });
    canvas.addEventListener('pointerdown', (e) => { pointerX = toGameX(e.clientX); begin(); });
    canvas.addEventListener('click', begin);
  } else {
    started = true;
  }

  raf = requestAnimationFrame(frame);
  return { stop: () => cancelAnimationFrame(raf), canvas };
}
