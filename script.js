const BG_SRC = 'https://wsrv.nl/?url=https://files.catbox.moe/tyxu2k.jpg';
document.documentElement.style.setProperty('--bg-img', `url('${BG_SRC}')`);

const kaomojiEl = document.getElementById('kaomoji');
const faces = ['( >_< )', '( ⁄>⁄▽⁄<⁄ )', '( ˘︹˘ )', '( ¬_¬ )', '( ◕‿◕ )'];
let faceIdx = 0;
kaomojiEl.addEventListener('pointerdown', (e) => {
  e.stopPropagation();
  faceIdx = (faceIdx + 1) % faces.length;
  kaomojiEl.textContent = faces[faceIdx];
});

const cardWrap = document.getElementById('cardWrap');
const frontEl = document.getElementById('front');
const backEl = document.getElementById('back');
const swipeTextEl = document.getElementById('swipeText');

let isFlipped = false;
let hasEverFlipped = false;
let dragging = false;
let startX = 0, startY = 0;

let rx = 0, ry = 0;
let tx = 0, ty = 0;
let vx = 0, vy = 0;

let tiltX = 0, tiltY = 0;

cardWrap.addEventListener('pointerdown', (e) => {
  if (e.target.closest('a') || e.target.closest('#kaomoji')) return;
  dragging = true;
  startX = e.clientX;
  startY = e.clientY;
  cardWrap.setPointerCapture(e.pointerId);
});

window.addEventListener('pointermove', (e) => {
  const rect = cardWrap.getBoundingClientRect();
  const lx = ((e.clientX - rect.left) / rect.width) * 100;
  const ly = ((e.clientY - rect.top) / rect.height) * 100;
  frontEl.style.setProperty('--lx', `${lx}%`);
  frontEl.style.setProperty('--ly', `${ly}%`);
  backEl.style.setProperty('--lx', `${lx}%`);
  backEl.style.setProperty('--ly', `${ly}%`);

  if (!dragging) {
    if (
      e.clientX >= rect.left - 60 && e.clientX <= rect.right + 60 &&
      e.clientY >= rect.top - 60 && e.clientY <= rect.bottom + 60
    ) {
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      tiltY = ((e.clientX - cx) / (rect.width / 2)) * 7;
      tiltX = -((e.clientY - cy) / (rect.height / 2)) * 7;
    } else {
      tiltX = 0;
      tiltY = 0;
    }
    return;
  }

  const dx = e.clientX - startX;
  const dy = e.clientY - startY;

  ty = dx * 0.55;
  tx = -dy * 0.55;
});

function finishSwipe() {
  if (!dragging) return;
  dragging = false;

  const predictY = ry + vy * 6;
  const predictX = rx - vy * 6;

  if (Math.abs(predictY) > 38 || Math.abs(predictX) > 38) {
    isFlipped = !isFlipped;
    if (!hasEverFlipped) {
      hasEverFlipped = true;
      swipeTextEl.classList.remove('nudge-active');
    }
    if (isFlipped) {
      runBackTerminal();
    } else {
      resetBackTerminal();
    }
  }

  tx = 0;
  ty = 0;
}

window.addEventListener('pointerup', finishSwipe);
window.addEventListener('pointercancel', finishSwipe);

setTimeout(() => {
  if (!hasEverFlipped && !isFlipped && !dragging) {
    swipeTextEl.classList.add('nudge-active');
    ty = -34;
    tx = 6;
    setTimeout(() => {
      if (!dragging && !isFlipped) {
        ty = 12;
        tx = -3;
      }
    }, 380);
    setTimeout(() => {
      if (!dragging && !isFlipped) {
        ty = 0;
        tx = 0;
      }
    }, 760);
    setTimeout(() => {
      swipeTextEl.classList.remove('nudge-active');
    }, 2500);
  }
}, 32000);

function animateCard() {
  const targetX = tx + (dragging ? 0 : tiltX);
  const targetY = ty + (dragging ? 0 : tiltY);

  vx = (vx + (targetX - rx) * 0.1) * 0.78;
  vy = (vy + (targetY - ry) * 0.1) * 0.78;

  rx += vx;
  ry += vy;

  const crossed = Math.abs(rx) > 90 || Math.abs(ry) > 90;
  const showBack = isFlipped ? !crossed : crossed;

  const dispRx = showBack !== isFlipped ? rx + (rx > 0 ? -180 : 180) : rx;
  const dispRy = showBack !== isFlipped ? ry + (ry > 0 ? -180 : 180) : ry;

  const transformStr = `rotateX(${dispRx.toFixed(2)}deg) rotateY(${dispRy.toFixed(2)}deg)`;

  frontEl.style.transform = transformStr;
  backEl.style.transform = transformStr;

  if (showBack) {
    frontEl.style.opacity = '0';
    frontEl.style.pointerEvents = 'none';
    backEl.style.opacity = '1';
    backEl.style.pointerEvents = 'auto';
  } else {
    frontEl.style.opacity = '1';
    frontEl.style.pointerEvents = 'auto';
    backEl.style.opacity = '0';
    backEl.style.pointerEvents = 'none';
  }

  requestAnimationFrame(animateCard);
}
animateCard();

const typedCmd = document.getElementById('typedCmd');
const backWrap = document.getElementById('backWrap');
const bonsaiBox = document.getElementById('bonsaiBox');

let termTimeouts = [];
let bonsaiInterval = null;

function clearTermTimers() {
  termTimeouts.forEach(clearTimeout);
  termTimeouts = [];
  if (bonsaiInterval) {
    clearInterval(bonsaiInterval);
    bonsaiInterval = null;
  }
}

function resetBackTerminal() {
  clearTermTimers();
  typedCmd.textContent = '';
  backWrap.classList.remove('show');
  bonsaiBox.innerHTML = '';
}

function startSakuraBonsai() {
  const COLS = 29;
  const ROWS = 15;
  const grid = Array.from({ length: ROWS }, () =>
    Array.from({ length: COLS }, () => ({ ch: ' ', cls: '' }))
  );

  function setStr(r, c, str, cls) {
    if (r < 0 || r >= ROWS) return;
    for (let i = 0; i < str.length; i++) {
      if (c + i >= 0 && c + i < COLS) {
        grid[r][c + i] = { ch: str[i], cls };
      }
    }
  }

  setStr(ROWS - 3, 7, ':_____________:', 'b-pot');
  setStr(ROWS - 2, 7, ' \\___________/ ', 'b-pot');
  setStr(ROWS - 1, 7, '  (_)     (_)  ', 'b-pot');
  setStr(ROWS - 3, 8, '_.,-~-.,_.,-~', 'b-grass');

  const steps = [];

  function grow(x, y, dx, dy, life, depth) {
    if (life <= 0 || depth > 5) return;

    const cx = Math.round(x);
    const cy = Math.round(y);

    if (cy >= 1 && cy < ROWS - 3 && cx >= 1 && cx < COLS - 2) {
      let str = '|';
      if (dx < -0.25) str = '\\';
      else if (dx > 0.25) str = '/';
      if (life > 4) str = dx < -0.2 ? '\\|' : dx > 0.2 ? '|/' : '|/';
      steps.push({ type: 'wood', r: cy, c: cx, str });
    }

    const nx = x + dx;
    const ny = y + dy;

    if (life > 2 && Math.random() < 0.44) {
      const dir = Math.random() < 0.5 ? -1 : 1;
      grow(
        nx,
        ny,
        dx + dir * (0.45 + Math.random() * 0.45),
        -0.55 - Math.random() * 0.35,
        life - 2,
        depth + 1
      );
    }

    if (life <= 2) {
      const blossomChars = ['&', '@', '*', '%', '❀', '.'];
      const classes = ['b-sak1', 'b-sak2', 'b-sak3'];
      for (let i = 0; i < 9; i++) {
        const bx = Math.round(nx + (Math.random() - 0.5) * 6.2);
        const by = Math.round(ny + (Math.random() - 0.5) * 2.8);
        if (by >= 0 && by < ROWS - 3 && bx >= 0 && bx < COLS) {
          steps.push({
            type: 'leaf',
            r: by,
            c: bx,
            ch: blossomChars[Math.floor(Math.random() * blossomChars.length)],
            cls: classes[Math.floor(Math.random() * classes.length)]
          });
        }
      }
    } else {
      grow(
        nx,
        ny,
        dx + (Math.random() - 0.5) * 0.45,
        dy,
        life - 1,
        depth
      );
    }
  }

  grow(14, ROWS - 4, -0.15, -0.78, 8, 0);
  grow(13, ROWS - 6, -0.75, -0.6, 5, 1);
  grow(15, ROWS - 6, 0.75, -0.6, 5, 1);

  const petals = [];

  function renderBonsai() {
    let html = '';
    for (let r = 0; r < ROWS; r++) {
      let curCls = '';
      let spanText = '';
      for (let c = 0; c < COLS; c++) {
        let cell = grid[r][c];
        const p = petals.find(pt => Math.round(pt.r) === r && Math.round(pt.c) === c);
        if (p && cell.ch === ' ') {
          cell = { ch: p.ch, cls: 'b-sak1' };
        }
        if (cell.cls !== curCls) {
          if (spanText) {
            html += curCls ? `<span class="${curCls}">${spanText}</span>` : spanText;
          }
          curCls = cell.cls;
          spanText = cell.ch;
        } else {
          spanText += cell.ch;
        }
      }
      if (spanText) {
        html += curCls ? `<span class="${curCls}">${spanText}</span>` : spanText;
      }
      html += '\n';
    }
    bonsaiBox.innerHTML = html;
  }

  renderBonsai();

  let stepIdx = 0;
  bonsaiInterval = setInterval(() => {
    for (let k = 0; k < 2; k++) {
      if (stepIdx < steps.length) {
        const s = steps[stepIdx++];
        if (s.type === 'wood') {
          setStr(s.r, s.c, s.str, 'b-wood');
        } else if (s.type === 'leaf') {
          if (grid[s.r][s.c].ch === ' ' || grid[s.r][s.c].cls.startsWith('b-sak')) {
            grid[s.r][s.c] = { ch: s.ch, cls: s.cls };
          }
        }
      }
    }

    if (stepIdx >= steps.length) {
      for (let r = 0; r < ROWS - 3; r++) {
        for (let c = 0; c < COLS; c++) {
          if (grid[r][c].cls.startsWith('b-sak') && Math.random() < 0.015) {
            const classes = ['b-sak1', 'b-sak2', 'b-sak3'];
            grid[r][c].cls = classes[Math.floor(Math.random() * classes.length)];
          }
        }
      }
      if (petals.length < 3 && Math.random() < 0.25) {
        petals.push({
          r: 3 + Math.random() * 3,
          c: 6 + Math.random() * 16,
          ch: Math.random() < 0.5 ? '.' : '*'
        });
      }
      for (let i = petals.length - 1; i >= 0; i--) {
        petals[i].r += 0.22;
        petals[i].c += (Math.random() - 0.42) * 0.4;
        if (petals[i].r >= ROWS - 3) petals.splice(i, 1);
      }
    }

    renderBonsai();
  }, 36);
}

function runBackTerminal() {
  resetBackTerminal();
  const cmd = 'fastfetch';
  cmd.split('').forEach((ch, idx) => {
    termTimeouts.push(setTimeout(() => {
      typedCmd.textContent += ch;
    }, 120 + idx * 42));
  });

  termTimeouts.push(setTimeout(() => {
    backWrap.classList.add('show');
    startSakuraBonsai();
  }, 160 + cmd.length * 42));
}

const rainBg = document.getElementById('rainBg');
const bgCtx = rainBg.getContext('2d');
let bgW = 0, bgH = 0;
let streaks = [];

function resizeBg() {
  bgW = rainBg.width = window.innerWidth;
  bgH = rainBg.height = window.innerHeight;
  streaks = Array.from({ length: 110 }, () => ({
    x: Math.random() * bgW,
    y: Math.random() * bgH,
    len: 16 + Math.random() * 24,
    speed: 13 + Math.random() * 9,
    alpha: 0.07 + Math.random() * 0.16
  }));
}
window.addEventListener('resize', resizeBg);
resizeBg();

function drawBgRain() {
  bgCtx.clearRect(0, 0, bgW, bgH);
  bgCtx.lineWidth = 1;
  bgCtx.lineCap = 'round';
  for (const s of streaks) {
    bgCtx.strokeStyle = `rgba(210, 230, 245, ${s.alpha})`;
    bgCtx.beginPath();
    bgCtx.moveTo(s.x, s.y);
    bgCtx.lineTo(s.x - s.len * 0.14, s.y + s.len);
    bgCtx.stroke();

    s.y += s.speed;
    s.x -= s.speed * 0.14;
    if (s.y > bgH) {
      s.y = -s.len;
      s.x = Math.random() * (bgW + 120);
    }
  }
  requestAnimationFrame(drawBgRain);
}
drawBgRain();

const bgImage = new Image();
bgImage.crossOrigin = 'anonymous';
bgImage.src = BG_SRC;

function createGlassDrops(canvas) {
  const ctx = canvas.getContext('2d');
  let w = 0, h = 0;
  const drops = [];

  function resize() {
    const rect = canvas.getBoundingClientRect();
    w = canvas.width = rect.width || 475;
    h = canvas.height = rect.height || 300;
  }
  resize();
  window.addEventListener('resize', resize);

  function spawn(randomY = false) {
    const r = 1.4 + Math.pow(Math.random(), 2.3) * 4.6;
    drops.push({
      x: Math.random() * w,
      y: randomY ? Math.random() * h : -10,
      r,
      vy: 0,
      slipTimer: Math.random() * 100
    });
  }

  for (let i = 0; i < 38; i++) spawn(true);

  function drawDropPath(ctx, x, y, r, stretch) {
    const topY = y - r * (1 + stretch * 0.45);
    ctx.beginPath();
    ctx.moveTo(x, topY);
    ctx.bezierCurveTo(
      x + r * 0.85, y - r * 0.3,
      x + r * 1.05, y + r * 0.75,
      x, y + r
    );
    ctx.bezierCurveTo(
      x - r * 1.05, y + r * 0.75,
      x - r * 0.85, y - r * 0.3,
      x, topY
    );
    ctx.closePath();
  }

  function tick() {
    ctx.clearRect(0, 0, w, h);
    if (Math.random() < 0.2 && drops.length < 52) spawn(false);

    for (let i = drops.length - 1; i >= 0; i--) {
      const d = drops[i];

      if (d.r > 3.1) {
        d.slipTimer++;
        if (d.slipTimer > 45 && Math.random() < 0.08) {
          d.vy = (d.r - 2.6) * 0.32;
          d.slipTimer = 0;
        }
      }

      if (d.vy > 0.01) {
        d.y += d.vy;
        d.x += Math.sin(d.y * 0.14 + i) * 0.22;
        d.vy *= 0.96;

        if (Math.random() < 0.18 && d.r > 2.3) {
          drops.push({
            x: d.x + (Math.random() - 0.5) * 1.2,
            y: d.y - d.r * 1.3,
            r: 1.0 + Math.random() * 0.9,
            vy: 0,
            slipTimer: 0
          });
          d.r *= 0.985;
        }
      }

      for (let j = i - 1; j >= 0; j--) {
        const o = drops[j];
        const dx = d.x - o.x;
        const dy = d.y - o.y;
        const dist = Math.hypot(dx, dy);
        if (dist < (d.r + o.r) * 0.82) {
          const area = d.r * d.r + o.r * o.r;
          o.r = Math.min(6.4, Math.sqrt(area));
          o.vy = Math.max(o.vy, d.vy, 0.55);
          drops.splice(i, 1);
          break;
        }
      }

      if (d.y - d.r * 2 > h) {
        drops.splice(i, 1);
        continue;
      }

      const stretch = Math.min(1.6, d.vy * 1.4);

      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.22)';
      drawDropPath(ctx, d.x + 0.6, d.y + 1.4, d.r, stretch);
      ctx.fill();

      drawDropPath(ctx, d.x, d.y, d.r, stretch);
      ctx.clip();

      if (bgImage.complete && bgImage.naturalWidth > 0) {
        const sx = ((d.x / w) * 0.6 + 0.2) * bgImage.naturalWidth;
        const sy = ((d.y / h) * 0.6 + 0.2) * bgImage.naturalHeight;
        ctx.drawImage(
          bgImage,
          sx - 35, sy - 35, 70, 70,
          d.x - d.r * 1.3, d.y - d.r * 2, d.r * 2.6, d.r * 3.2
        );
      }

      const grad = ctx.createLinearGradient(d.x - d.r, d.y - d.r, d.x + d.r, d.y + d.r);
      grad.addColorStop(0, 'rgba(15, 25, 32, 0.38)');
      grad.addColorStop(0.55, 'rgba(255, 255, 255, 0.05)');
      grad.addColorStop(1, 'rgba(225, 245, 255, 0.55)');
      ctx.fillStyle = grad;
      ctx.fillRect(d.x - d.r * 1.5, d.y - d.r * 2.2, d.r * 3, d.r * 3.5);
      ctx.restore();

      ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
      ctx.lineWidth = 0.6;
      drawDropPath(ctx, d.x, d.y, d.r, stretch);
      ctx.stroke();

      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      ctx.ellipse(
        d.x - d.r * 0.3,
        d.y - d.r * 0.28,
        Math.max(0.45, d.r * 0.22),
        Math.max(0.35, d.r * 0.14),
        -Math.PI / 4, 0, Math.PI * 2
      );
      ctx.fill();
    }

    requestAnimationFrame(tick);
  }
  tick();
}

createGlassDrops(document.getElementById('dropsFront'));
createGlassDrops(document.getElementById('dropsBack'));

const soundBtn = document.getElementById('soundBtn');
const svgSoundOff = document.getElementById('svgSoundOff');
const svgSoundOn = document.getElementById('svgSoundOn');
let audioCtx = null;
let masterGain = null;
let isPlaying = false;
let dropTimer = null;

function updateSoundIcon(playing) {
  svgSoundOff.style.display = playing ? 'none' : 'block';
  svgSoundOn.style.display = playing ? 'block' : 'none';
}

function initRainAudio() {
  const AudioContext = window.AudioContext || window.webkitAudioContext;
  audioCtx = new AudioContext();

  masterGain = audioCtx.createGain();
  masterGain.gain.value = 0.001;
  masterGain.connect(audioCtx.destination);

  const bufferSize = audioCtx.sampleRate * 4;

  const pinkBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const pinkOut = pinkBuffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
  for (let i = 0; i < bufferSize; i++) {
    const white = Math.random() * 2 - 1;
    b0 = 0.99886 * b0 + white * 0.0555179;
    b1 = 0.99332 * b1 + white * 0.0750759;
    b2 = 0.96900 * b2 + white * 0.1538520;
    b3 = 0.86650 * b3 + white * 0.3104856;
    b4 = 0.55000 * b4 + white * 0.5329522;
    b5 = -0.7616 * b5 - white * 0.0168980;
    pinkOut[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.035;
    b6 = white * 0.115926;
  }

  const rainBody = audioCtx.createBufferSource();
  rainBody.buffer = pinkBuffer;
  rainBody.loop = true;

  const bodyFilter = audioCtx.createBiquadFilter();
  bodyFilter.type = 'bandpass';
  bodyFilter.frequency.value = 820;
  bodyFilter.Q.value = 0.65;

  const bodyGain = audioCtx.createGain();
  bodyGain.gain.value = 0.7;

  rainBody.connect(bodyFilter);
  bodyFilter.connect(bodyGain);
  bodyGain.connect(masterGain);
  rainBody.start();

  const whiteBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const whiteOut = whiteBuffer.getChannelData(0);
  for (let i = 0; i < bufferSize; i++) {
    whiteOut[i] = (Math.random() * 2 - 1) * 0.04;
  }

  const mistSrc = audioCtx.createBufferSource();
  mistSrc.buffer = whiteBuffer;
  mistSrc.loop = true;

  const mistHp = audioCtx.createBiquadFilter();
  mistHp.type = 'highpass';
  mistHp.frequency.value = 2600;

  const mistLp = audioCtx.createBiquadFilter();
  mistLp.type = 'lowpass';
  mistLp.frequency.value = 6200;

  const mistGain = audioCtx.createGain();
  mistGain.gain.value = 0.18;

  mistSrc.connect(mistHp);
  mistHp.connect(mistLp);
  mistLp.connect(mistGain);
  mistGain.connect(masterGain);
  mistSrc.start();

  const windSrc = audioCtx.createBufferSource();
  windSrc.buffer = pinkBuffer;
  windSrc.loop = true;

  const windFilter = audioCtx.createBiquadFilter();
  windFilter.type = 'lowpass';
  windFilter.frequency.value = 220;

  const lfo = audioCtx.createOscillator();
  lfo.frequency.value = 0.11;
  const lfoGain = audioCtx.createGain();
  lfoGain.gain.value = 95;
  lfo.connect(lfoGain);
  lfoGain.connect(windFilter.frequency);
  lfo.start();

  const windGain = audioCtx.createGain();
  windGain.gain.value = 0.55;

  windSrc.connect(windFilter);
  windFilter.connect(windGain);
  windGain.connect(masterGain);
  windSrc.start();

  dropTimer = setInterval(() => {
    if (!isPlaying || !audioCtx || audioCtx.state !== 'running') return;
    if (Math.random() < 0.55) {
      const now = audioCtx.currentTime;
      const osc = audioCtx.createOscillator();
      const g = audioCtx.createGain();
      const pan = audioCtx.createStereoPanner();

      const baseFreq = 1100 + Math.random() * 1900;
      osc.type = 'sine';
      osc.frequency.setValueAtTime(baseFreq, now);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.48, now + 0.032);

      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(0.008 + Math.random() * 0.014, now + 0.004);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.038);

      pan.pan.value = (Math.random() - 0.5) * 1.4;

      osc.connect(g);
      g.connect(pan);
      pan.connect(masterGain);

      osc.start(now);
      osc.stop(now + 0.042);
    }
  }, 95);
}

function setSound(enable) {
  if (!audioCtx) initRainAudio();
  if (enable) {
    audioCtx.resume();
    masterGain.gain.setTargetAtTime(0.24, audioCtx.currentTime, 0.5);
    isPlaying = true;
    updateSoundIcon(true);
  } else {
    masterGain.gain.setTargetAtTime(0.0001, audioCtx.currentTime, 0.25);
    isPlaying = false;
    updateSoundIcon(false);
  }
}

soundBtn.addEventListener('click', (e) => {
  e.stopPropagation();
  setSound(!isPlaying);
});

window.addEventListener('pointerdown', () => {
  if (!audioCtx) setSound(true);
}, { once: true });
