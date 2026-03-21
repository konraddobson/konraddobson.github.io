/* =========================================================
   Home Page: Electric Logo System
   ========================================================= */
(function () {
  const heroStack = document.getElementById('heroStack');
  const canvas = document.getElementById('fx');
  const ghostBlue = document.getElementById('ghostBlue');
  const glitchLayers = document.querySelectorAll('.glitch-layer');

  if (!heroStack || !canvas || !ghostBlue || !glitchLayers.length) return;

  const ctx = canvas.getContext('2d');
  const width = 1000;
  const height = 1100;

  let dpr = 1;
  let lastTime = performance.now();
  let flash = 0;
  let ambientCharge = 0.18;
  let nextPulseAt = 0;
  let pulseBoost = 0;
  let glitch = 0;
  let ghost = 0;
  let glitchBands = [];

  const streamers = [];
  const glints = [];
  const streakSparks = [];
  const strayBolts = [];

  const nodes = [
    { x: 201, y: 248 }, { x: 308, y: 356 }, { x: 692, y: 356 }, { x: 800, y: 248 },
    { x: 800, y: 520 }, { x: 500, y: 728 }, { x: 201, y: 520 }, { x: 201, y: 248 },
    { x: 308, y: 460 }, { x: 692, y: 460 }, { x: 500, y: 593 }, { x: 308, y: 460 },
    { x: 201, y: 612 }, { x: 201, y: 742 }, { x: 500, y: 951 }, { x: 800, y: 742 },
    { x: 800, y: 612 }, { x: 500, y: 821 }, { x: 201, y: 612 }
  ];

  const paths = [
    [0, 1, 2, 3, 4, 5, 6, 7],
    [8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18]
  ];

  const segments = [];

  /* ---------------------------------------------------------
     Geometry Setup
     --------------------------------------------------------- */
  function buildSegments() {
    segments.length = 0;

    for (const path of paths) {
      for (let i = 0; i < path.length - 1; i += 1) {
        const a = nodes[path[i]];
        const b = nodes[path[i + 1]];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const len = Math.hypot(dx, dy);

        if (!len) continue;

        segments.push({
          a,
          b,
          dx,
          dy,
          len,
          nx: -dy / len,
          ny: dx / len,
          angle: Math.atan2(dy, dx)
        });
      }
    }
  }

  function resizeCanvas() {
    const mobile = window.innerWidth < 768;
    dpr = Math.min(window.devicePixelRatio || 1, mobile ? 1.25 : 1.5);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  /* ---------------------------------------------------------
     Small Helpers
     --------------------------------------------------------- */
  function rand(min, max) {
    return Math.random() * (max - min) + min;
  }

  function pickSegment() {
    return segments[(Math.random() * segments.length) | 0];
  }

  function pointOnSegment(seg, t, offset = 0) {
    return {
      x: seg.a.x + seg.dx * t + seg.nx * offset,
      y: seg.a.y + seg.dy * t + seg.ny * offset
    };
  }

  /* ---------------------------------------------------------
     Particle Spawning
     --------------------------------------------------------- */
  function spawnGlint(x, y, size = 1) {
    glints.push({ x, y, size, age: 0, life: rand(0.12, 0.22) });
  }

  function spawnDotSpark(x, y, angle, major) {
    const speed = major ? rand(180, 320) : rand(120, 220);
    streakSparks.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      age: 0,
      life: major ? rand(0.9, 1.4) : rand(0.6, 0.9),
      size: major ? rand(3, 4.5) : rand(2, 3)
    });
  }

  function createStreamer(options = {}) {
    const major = Boolean(options.major);
    const chainChance = options.chainChance ?? 0.22;
    const seg = options.seg || pickSegment();
    const centerT = rand(0.08, 0.92);
    const span = major ? rand(0.48, 0.82) : rand(0.22, 0.42);
    const startT = Math.max(0.02, centerT - span * rand(0.45, 0.8));
    const endT = Math.min(0.98, centerT + span * rand(0.45, 0.8));
    const side = Math.random() < 0.5 ? -1 : 1;
    const offset = rand(0.04, major ? 2.1 : 0.8) * side;
    const root = pointOnSegment(seg, centerT, offset * 0.5);

    streamers.push({
      seg,
      startT,
      endT,
      offset,
      age: 0,
      life: major ? rand(0.4, 0.68) : rand(0.2, 0.38),
      jitter: major ? rand(1.5, 2.8) : rand(0.45, 1.05),
      width: major ? rand(3.0, 5.4) : rand(1.35, 2.45),
      detail: major ? ((Math.random() * 16 + 24) | 0) : ((Math.random() * 12 + 14) | 0),
      brightness: major ? rand(1.18, 1.62) : rand(0.88, 1.18),
      drift: rand(-0.015, 0.015),
      branch: Math.random() < chainChance,
      major
    });

    if (Math.random() < (major ? 0.28 : 0.12)) {
      spawnGlint(root.x, root.y, major ? rand(1.2, 1.8) : rand(0.8, 1.2));
    }

    if (Math.random() < (major ? 0.8 : 0.4)) {
      const count = major ? (1 + ((Math.random() * 2) | 0)) : 1;
      for (let i = 0; i < count; i += 1) {
        spawnDotSpark(root.x, root.y, seg.angle + rand(-1.2, 1.2), major);
      }
    }
  }

  function triggerPulse(now, intensity = 1) {
    const mobile = window.innerWidth < 768;
    const primaryCount = Math.round(18 + intensity * 12 + Math.random() * 8);
    const majorCount = Math.round(7 + intensity * 5 + Math.random() * 3);

    pulseBoost = Math.max(pulseBoost, intensity);
    flash = Math.max(flash, 1.15 * intensity);

    for (let i = 0; i < primaryCount; i += 1) createStreamer({ chainChance: 0.54 });
    for (let i = 0; i < majorCount; i += 1) createStreamer({ chainChance: 0.72, major: true });

    if (Math.random() < 0.78) {
      for (const seg of segments) {
        if (Math.random() < 0.55) {
          createStreamer({ chainChance: 0.5, major: Math.random() < 0.28, seg });
        }
      }
    }

    for (let i = 0; i < 3 + ((Math.random() * 4) | 0); i += 1) {
      const n = nodes[(Math.random() * nodes.length) | 0];
      spawnGlint(n.x, n.y, rand(0.9, 1.6));
    }

    if (!mobile && Math.random() < 0.18) spawnStrayBolt();

    glitch = Math.max(glitch, 1);
    ghost = Math.max(ghost, 1);
    glitchBands = [];

    const bandCount = 2 + ((Math.random() * 2) | 0);
    for (let i = 0; i < bandCount; i += 1) {
      glitchBands.push({ y: rand(0.05, 0.95), h: rand(0.01, 0.035) });
    }

    nextPulseAt = now + rand(820, 1650);
  }

  /* ---------------------------------------------------------
     Electric Path Drawing
     --------------------------------------------------------- */
  function makeArcPoints(streamer, ageRatio) {
    const points = [];
    const count = Math.max(8, streamer.detail);
    const tangentX = streamer.seg.dx / streamer.seg.len;
    const tangentY = streamer.seg.dy / streamer.seg.len;

    for (let i = 0; i <= count; i += 1) {
      const p = i / count;
      const t = streamer.startT + (streamer.endT - streamer.startT) * p + streamer.drift * ageRatio;
      const envelope = Math.sin(p * Math.PI);
      const phase = streamer.age * (streamer.major ? 26 : 18);
      const n1 = Math.sin(i * 1.37 + phase + streamer.seg.a.x * 0.015);
      const n2 = Math.sin(i * 3.1 - phase * 1.65 + streamer.seg.a.y * 0.012) * 0.6;
      const n3 = Math.cos(i * 0.82 + phase * 0.55) * 0.32;
      const offsetNoise = (n1 + n2 + n3) * streamer.jitter * envelope;
      const tangentDrift = Math.sin((p - 0.5) * Math.PI) * streamer.seg.len * streamer.drift * 2;

      points.push({
        x: streamer.seg.a.x + streamer.seg.dx * t + streamer.seg.nx * (streamer.offset + offsetNoise) + tangentX * tangentDrift,
        y: streamer.seg.a.y + streamer.seg.dy * t + streamer.seg.ny * (streamer.offset + offsetNoise) + tangentY * tangentDrift
      });
    }

    return points;
  }

  function strokePath(points, widthPx, alpha, glow) {
    if (points.length < 2) return;

    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 1; i += 1) {
      const mx = (points[i].x + points[i + 1].x) * 0.5;
      const my = (points[i].y + points[i + 1].y) * 0.5;
      ctx.quadraticCurveTo(points[i].x, points[i].y, mx, my);
    }

    ctx.lineTo(points[points.length - 1].x, points[points.length - 1].y);

    ctx.shadowBlur = 30;
    ctx.shadowColor = `rgba(80,180,255,${glow * 1.2})`;
    ctx.strokeStyle = `rgba(80,180,255,${alpha * 0.46})`;
    ctx.lineWidth = widthPx * 4.8;
    ctx.stroke();

    ctx.shadowBlur = 16;
    ctx.shadowColor = `rgba(170,228,255,${glow * 1.28})`;
    ctx.strokeStyle = `rgba(170,228,255,${alpha * 1.02})`;
    ctx.lineWidth = widthPx * 2.9;
    ctx.stroke();

    ctx.shadowBlur = 8;
    ctx.shadowColor = `rgba(255,255,255,${glow * 1.25})`;
    ctx.strokeStyle = `rgba(245,251,255,${Math.min(1, alpha * 1.08)})`;
    ctx.lineWidth = widthPx * 1.35;
    ctx.stroke();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = `rgba(255,255,255,${Math.min(1, alpha * 0.9)})`;
    ctx.lineWidth = Math.max(0.9, widthPx * 0.42);
    ctx.stroke();
    ctx.restore();
  }

  function drawBranch(origin, directionAngle, intensity) {
    const points = [origin];
    let { x, y } = origin;
    let angle = directionAngle + rand(-0.45, 0.45);
    const length = rand(20, 54) * intensity;
    const steps = 4 + ((Math.random() * 4) | 0);

    for (let i = 0; i < steps; i += 1) {
      angle += rand(-0.34, 0.34);
      x += Math.cos(angle) * (length / steps);
      y += Math.sin(angle) * (length / steps);
      points.push({ x, y });
    }

    strokePath(points, 0.7 + intensity * 0.42, 0.15 + intensity * 0.24, 0.16 + intensity * 0.2);
  }

  /* ---------------------------------------------------------
     Glow / Ambient Charge Effects
     --------------------------------------------------------- */
  function drawCorona(time) {
    for (const node of nodes) {
      const pulse = 0.04 + (Math.sin(time * 0.0019 + node.x * 0.02 + node.y * 0.014) * 0.5 + 0.5) * (0.05 + pulseBoost * 0.06);
      const r = 3.5 + pulse * 10 + flash * 0.9;
      const grad = ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 2.6);
      grad.addColorStop(0, `rgba(255,255,255,${0.08 + pulse * 0.9})`);
      grad.addColorStop(0.2, `rgba(190,232,255,${0.08 + pulse * 0.55})`);
      grad.addColorStop(0.55, `rgba(110,190,255,${0.04 + pulse * 0.22})`);
      grad.addColorStop(1, 'rgba(110,190,255,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(node.x, node.y, r * 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawSurfaceCharge(time) {
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    for (const seg of segments) {
      const shimmer = ambientCharge * (0.72 + (Math.sin(time * 0.0024 + seg.a.x * 0.03 + seg.a.y * 0.02) * 0.5 + 0.5) * 1.08) + pulseBoost * 0.22;
      const grad = ctx.createLinearGradient(seg.a.x, seg.a.y, seg.b.x, seg.b.y);
      grad.addColorStop(0, `rgba(110,190,245,${shimmer * 0.18})`);
      grad.addColorStop(0.2, `rgba(180,230,255,${shimmer * 0.38})`);
      grad.addColorStop(0.5, `rgba(255,255,255,${shimmer * 0.48})`);
      grad.addColorStop(0.8, `rgba(180,230,255,${shimmer * 0.38})`);
      grad.addColorStop(1, `rgba(110,190,245,${shimmer * 0.18})`);

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.8 + shimmer * 1.25;
      ctx.shadowBlur = 10 + shimmer * 14;
      ctx.shadowColor = `rgba(140,220,255,${shimmer})`;
      ctx.beginPath();
      ctx.moveTo(seg.a.x, seg.a.y);
      ctx.lineTo(seg.b.x, seg.b.y);
      ctx.stroke();
    }

    ctx.restore();
  }

  function drawSoftFlash() {
    if (flash <= 0.002) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    const grad = ctx.createRadialGradient(width * 0.5, height * 0.54, 0, width * 0.5, height * 0.54, 280 + flash * 180);
    grad.addColorStop(0, `rgba(255,255,255,${flash * 0.12})`);
    grad.addColorStop(0.15, `rgba(220,244,255,${flash * 0.2})`);
    grad.addColorStop(0.35, `rgba(160,220,255,${flash * 0.12})`);
    grad.addColorStop(0.65, `rgba(120,190,255,${flash * 0.06})`);
    grad.addColorStop(1, 'rgba(120,190,255,0)');

    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(width * 0.5, height * 0.54, 300 + flash * 170, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ---------------------------------------------------------
     Small Sparks / Glints / Stray Bolts
     --------------------------------------------------------- */
  function drawGlints(dt) {
    for (let i = glints.length - 1; i >= 0; i -= 1) {
      const glint = glints[i];
      glint.age += dt;

      if (glint.age >= glint.life) {
        glints.splice(i, 1);
        continue;
      }

      const alpha = 1 - glint.age / glint.life;
      const size = 6 * glint.size * (0.5 + alpha * 0.5);

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowBlur = 16 * glint.size;
      ctx.shadowColor = `rgba(180,235,255,${alpha * 0.8})`;
      ctx.strokeStyle = `rgba(255,255,255,${alpha})`;
      ctx.lineWidth = Math.max(1, 1.2 * glint.size * alpha);
      ctx.beginPath();
      ctx.moveTo(glint.x - size, glint.y);
      ctx.lineTo(glint.x + size, glint.y);
      ctx.moveTo(glint.x, glint.y - size);
      ctx.lineTo(glint.x, glint.y + size);
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawDotSparks(dt) {
    for (let i = streakSparks.length - 1; i >= 0; i -= 1) {
      const spark = streakSparks[i];
      spark.age += dt;

      if (spark.age >= spark.life) {
        streakSparks.splice(i, 1);
        continue;
      }

      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx *= 0.992;
      spark.vy *= 0.992;
      spark.vy += 10 * dt;

      const alpha = 1 - spark.age / spark.life;

      ctx.save();
      ctx.globalCompositeOperation = 'screen';
      ctx.shadowBlur = 18;
      ctx.shadowColor = `rgba(180,235,255,${alpha * 0.55})`;
      ctx.fillStyle = `rgba(255,255,255,${alpha})`;
      ctx.beginPath();
      ctx.arc(spark.x, spark.y, Math.max(0.4, spark.size * alpha), 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  }

  function spawnStrayBolt() {
    const seg = pickSegment();
    const t = rand(0.15, 0.85);
    const start = pointOnSegment(seg, t);
    const outward = rand(70, 150);
    const normalDir = Math.random() < 0.5 ? 1 : -1;
    const baseAngle = seg.angle + normalDir * (Math.PI / 2) + rand(-0.4, 0.4);
    const steps = 4 + ((Math.random() * 3) | 0);
    const points = [{ x: start.x, y: start.y }];

    let { x, y } = start;
    let angle = baseAngle;

    for (let i = 0; i < steps; i += 1) {
      angle += rand(-0.45, 0.45);
      const stepLen = (outward / steps) * rand(0.8, 1.2);
      x += Math.cos(angle) * stepLen;
      y += Math.sin(angle) * stepLen;
      points.push({ x, y });
    }

    strayBolts.push({
      points,
      age: 0,
      life: rand(0.12, 0.22),
      width: rand(1.4, 2.4)
    });
  }

  function drawStrayBolts(dt) {
    for (let i = strayBolts.length - 1; i >= 0; i -= 1) {
      const bolt = strayBolts[i];
      bolt.age += dt;

      if (bolt.age >= bolt.life) {
        strayBolts.splice(i, 1);
        continue;
      }

      const alpha = 1 - bolt.age / bolt.life;
      strokePath(bolt.points, bolt.width * (0.9 + alpha * 0.3), 0.22 + alpha * 0.9, 0.3 + alpha * 0.55);
    }
  }

  /* ---------------------------------------------------------
     Main Electric Animation Loop
     --------------------------------------------------------- */
  function animate(time) {
    const dt = Math.min(0.033, ((time - lastTime) / 1000) || 0.016);
    lastTime = time;

    if (!nextPulseAt) nextPulseAt = time + 500;
    if (time >= nextPulseAt) triggerPulse(time, rand(0.85, 1.35));

    flash *= 0.92;
    pulseBoost *= 0.9;
    glitch *= 0.85;
    ghost *= 0.9;
    ambientCharge += ((streamers.length > 0 ? 0.58 : 0.16) - ambientCharge) * 0.08;

    ctx.clearRect(0, 0, width, height);
    drawSurfaceCharge(time);

    for (let i = streamers.length - 1; i >= 0; i -= 1) {
      const streamer = streamers[i];
      streamer.age += dt;

      if (streamer.age >= streamer.life) {
        streamers.splice(i, 1);
        continue;
      }

      const t = streamer.age / streamer.life;
      const envelope = Math.sin(t * Math.PI);
      const points = makeArcPoints(streamer, t);
      strokePath(points, streamer.width * (0.78 + envelope * 0.3), (0.08 + envelope * 0.92) * streamer.brightness, 0.12 + envelope * 0.5);

      if (streamer.branch && Math.random() < (streamer.major ? 0.055 : 0.018)) {
        const point = points[(Math.random() * points.length) | 0];
        const tangentAngle = streamer.seg.angle + (Math.random() < 0.5 ? -1 : 1) * rand(0.8, 1.2);
        drawBranch(point, tangentAngle, streamer.major ? 1.0 : 0.72);
      }
    }

    drawGlints(dt);
    drawDotSparks(dt);
    drawStrayBolts(dt);
    drawCorona(time);
    drawSoftFlash();

    requestAnimationFrame(animate);
  }

  /* ---------------------------------------------------------
     Home Page: Mouse Parallax / Glitch Offset
     --------------------------------------------------------- */
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let currentX = 0;
  let currentY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  function currentMaxMove() {
    return window.innerWidth < 768 ? 30 : 82;
  }

  function currentMaxRotate() {
    return window.innerWidth < 768 ? 5.2 : 9.5;
  }

  function currentEasing() {
    return window.innerWidth < 768 ? 0.12 : 0.09;
  }

  function onPointerMove(event) {
    pointerX = event.clientX;
    pointerY = event.clientY;
  }

  function animateWrap() {
    const nx = (pointerX - window.innerWidth * 0.5) / (window.innerWidth * 0.5);
    const ny = (pointerY - window.innerHeight * 0.5) / (window.innerHeight * 0.5);
    const targetX = Math.max(-1, Math.min(1, nx)) * currentMaxMove();
    const targetY = Math.max(-1, Math.min(1, ny)) * currentMaxMove();
    const targetRotateY = Math.max(-1, Math.min(1, nx)) * currentMaxRotate();
    const targetRotateX = Math.max(-1, Math.min(1, ny)) * -currentMaxRotate();
    const easing = currentEasing();

    currentX += (targetX - currentX) * easing;
    currentY += (targetY - currentY) * easing;
    currentRotateX += (targetRotateX - currentRotateX) * easing;
    currentRotateY += (targetRotateY - currentRotateY) * easing;

    const jitterPower = glitch * 6;
    const jitterX = (Math.random() - 0.5) * jitterPower;
    const jitterY = (Math.random() - 0.5) * jitterPower;
    const scale = 1 + glitch * 0.024;

    heroStack.style.transform = `translate3d(calc(-50% + ${currentX + jitterX}px), calc(-56% + ${currentY + jitterY}px), 0) rotateX(${currentRotateX}deg) rotateY(${currentRotateY}deg) scale(${scale})`;

    glitchLayers.forEach((layer, index) => {
      const direction = index === 0 ? -1 : 1;
      const opacity = Math.min(1, glitch * 1.2);
      const offsetX = direction * (10 + Math.random() * 14) * glitch;

      layer.style.opacity = String(opacity);
      layer.style.transform = `translate(${offsetX}px, 0px)`;

      if (glitchBands.length) {
        const band = glitchBands[(Math.random() * glitchBands.length) | 0];
        const top = band.y * 100;
        const heightPct = band.h * 100;
        layer.style.clipPath = `polygon(0% ${top}%, 100% ${top}%, 100% ${top + heightPct}%, 0% ${top + heightPct}%)`;
      } else {
        layer.style.clipPath = 'none';
      }
    });

    if (glitch < 0.03) {
      glitchLayers.forEach((layer) => {
        layer.style.opacity = '0';
        layer.style.transform = 'translate(0, 0)';
        layer.style.clipPath = 'none';
      });
    }

    const ghostOpacity = Math.min(0.45, ghost * 0.28);
    const ghostX = 10 + ghost * 16;
    const ghostY = (Math.random() - 0.5) * ghost * 6;

    ghostBlue.style.opacity = String(ghostOpacity);
    ghostBlue.style.transform = `translate(${ghostX}px, ${ghostY}px)`;

    if (ghost < 0.03) {
      ghostBlue.style.opacity = '0';
      ghostBlue.style.transform = 'translate(0, 0)';
    }

    requestAnimationFrame(animateWrap);
  }

  buildSegments();
  resizeCanvas();

  window.addEventListener('resize', resizeCanvas);
  window.addEventListener('mousemove', onPointerMove, { passive: true });
  window.addEventListener('pointermove', onPointerMove, { passive: true });

  requestAnimationFrame(animate);
  requestAnimationFrame(animateWrap);
})();
