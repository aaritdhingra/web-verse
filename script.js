/* =========================================================
   1. 3D BACKGROUND SYSTEM (Three.js)
   ========================================================= */
const canvas = document.getElementById('bg3d');
const scene3d = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));

const pastel = [
  [0.77, 0.71, 0.99],
  [0.73, 0.90, 0.99],
  [1.00, 0.79, 0.79],
  [0.66, 0.95, 0.82],
  [0.99, 0.90, 0.54]
];
const N = 2200;
const pos = new Float32Array(N * 3);
const col = new Float32Array(N * 3);
for (let i = 0; i < N; i++) {
  const r = 8 + Math.random() * 4;
  const th = Math.random() * Math.PI * 2;
  const ph = Math.acos(2 * Math.random() - 1);
  pos[i * 3] = r * Math.sin(ph) * Math.cos(th);
  pos[i * 3 + 1] = r * Math.sin(ph) * Math.sin(th);
  pos[i * 3 + 2] = r * Math.cos(ph);
  const c = pastel[Math.floor(Math.random() * pastel.length)];
  col[i * 3] = c[0]; col[i * 3 + 1] = c[1]; col[i * 3 + 2] = c[2];
}
const g = new THREE.BufferGeometry();
g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
g.setAttribute('color', new THREE.BufferAttribute(col, 3));
const points = new THREE.Points(
  g,
  new THREE.PointsMaterial({
    size: 0.05, vertexColors: true, transparent: true, opacity: 0.75,
    blending: THREE.AdditiveBlending
  })
);
scene3d.add(points);
camera.position.z = 10;

let mx = 0, my = 0, impactJolt = 0;
addEventListener('mousemove', e => {
  mx = (e.clientX / innerWidth - 0.5) * 0.5;
  my = (e.clientY / innerHeight - 0.5) * 0.5;
});

(function loop() {
  requestAnimationFrame(loop);
  points.rotation.y += 0.0008;
  points.rotation.x += 0.0004;
  const shake = Math.sin(Date.now() * 0.1) * impactJolt * 0.4;
  camera.position.x += (mx * 2 - camera.position.x) * 0.03 + shake;
  camera.position.y += (-my * 2 - camera.position.y) * 0.03 + shake;
  if (impactJolt > 0.01) impactJolt *= 0.92;
  camera.lookAt(scene3d.position);
  renderer.render(scene3d, camera);
})();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

/* =========================================================
   2. HERO ICON SWAP (Space Theme)
   ========================================================= */
const innerIcon = document.getElementById('innerIcon');
const iconSet = ['#i-planet', '#i-rocket', '#i-satellite', '#i-ufo', '#i-comet', '#i-galaxy'];
let ii = 0;
setInterval(() => {
  ii = (ii + 1) % iconSet.length;
  if (!innerIcon) return;
  innerIcon.style.opacity = '0';
  innerIcon.style.transform = 'scale(.7)';
  setTimeout(() => {
    innerIcon.innerHTML = `<svg width="60" height="60"><use href="${iconSet[ii]}"/></svg>`;
    innerIcon.style.opacity = '1';
    innerIcon.style.transform = 'scale(1)';
  }, 220);
}, 2400);

/* =========================================================
   3. RETRO AUDIO SYNTHESIS ENGINE
   ========================================================= */
let actx = null;
function getAudio() {
  if (!actx) actx = new (window.AudioContext || window.webkitAudioContext)();
  if (actx.state === 'suspended') actx.resume();
}
function playBeep(freq, type, dur, vol) {
  try {
    getAudio();
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.connect(gain); gain.connect(actx.destination);
    osc.type = type;
    osc.frequency.setValueAtTime(freq, actx.currentTime);
    gain.gain.setValueAtTime(vol, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    osc.start(); osc.stop(actx.currentTime + dur);
  } catch (e) {}
}
function playExplosion() {
  try {
    getAudio();
    const bufferSize = actx.sampleRate * 0.4;
    const buffer = actx.createBuffer(1, bufferSize, actx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
    const noise = actx.createBufferSource();
    noise.buffer = buffer;
    const filter = actx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, actx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(10, actx.currentTime + 0.4);
    const gain = actx.createGain();
    gain.gain.setValueAtTime(0.4, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, actx.currentTime + 0.4);
    noise.connect(filter); filter.connect(gain); gain.connect(actx.destination);
    noise.start();
  } catch (e) {}
}
function playEpicCompletion() {
  try {
    getAudio();
    const now = actx.currentTime;
    [261.63, 329.63, 392.0, 523.25].forEach(freq => {
      const o1 = actx.createOscillator();
      const o2 = actx.createOscillator();
      const gain = actx.createGain();
      const filter = actx.createBiquadFilter();
      o1.type = 'sawtooth'; o2.type = 'triangle';
      o1.frequency.setValueAtTime(freq * 0.5, now);
      o1.frequency.exponentialRampToValueAtTime(freq, now + 1.2);
      o2.frequency.setValueAtTime(freq * 0.5 + 2, now);
      o2.frequency.exponentialRampToValueAtTime(freq + 2, now + 1.2);
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(200, now);
      filter.frequency.exponentialRampToValueAtTime(4000, now + 1.2);
      o1.connect(filter); o2.connect(filter); filter.connect(gain); gain.connect(actx.destination);
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.06, now + 1.3);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2);
      o1.start(now); o2.start(now); o1.stop(now + 2); o2.stop(now + 2);
    });
    setTimeout(() => {
      const t = actx.currentTime;
      const sub = actx.createOscillator();
      const g = actx.createGain();
      sub.type = 'sine';
      sub.frequency.setValueAtTime(100, t);
      sub.frequency.exponentialRampToValueAtTime(20, t + 1.2);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 1.2);
      sub.connect(g); g.connect(actx.destination);
      sub.start(t); sub.stop(t + 1.2);
    }, 1400);
    setTimeout(() => {
      const t = actx.currentTime;
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const o1 = actx.createOscillator();
        const o2 = actx.createOscillator();
        const g = actx.createGain();
        const f = actx.createBiquadFilter();
        o1.type = 'square'; o2.type = 'sawtooth';
        o1.frequency.setValueAtTime(freq, t + idx * 0.08);
        o2.frequency.setValueAtTime(freq + 3, t + idx * 0.08);
        f.type = 'bandpass'; f.frequency.setValueAtTime(freq * 2, t); f.Q.setValueAtTime(3, t);
        o1.connect(f); o2.connect(f); f.connect(g); g.connect(actx.destination);
        g.gain.setValueAtTime(0.001, t + idx * 0.08);
        g.gain.linearRampToValueAtTime(0.12, t + idx * 0.08 + 0.05);
        g.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.08 + 1.5);
        o1.start(t + idx * 0.08); o2.start(t + idx * 0.08);
        o1.stop(t + idx * 0.08 + 1.5); o2.stop(t + idx * 0.08 + 1.5);
      });
    }, 1600);
  } catch (e) {}
}

/* =========================================================
   4. FX (Confetti & Fireworks)
   ========================================================= */
const pastelHex = ['#c4b5fd', '#a7f3d0', '#fecaca', '#bae6fd', '#fde68a', '#22d3ee'];
function confettiBlast() {
  for (let i = 0; i < 180; i++) {
    const c = document.createElement('div');
    const size = 6 + Math.random() * 12;
    c.style.cssText = `position:fixed;top:50%;left:50%;width:${size}px;height:${size}px;background:${pastelHex[Math.floor(Math.random()*pastelHex.length)]};border-radius:${Math.random()>.5?'50%':'2px'};z-index:9998;pointer-events:none;transition:transform 2s cubic-bezier(.15,.5,.5,1),opacity 2s ease-out;`;
    document.body.appendChild(c);
    requestAnimationFrame(() => {
      const a = Math.random() * Math.PI * 2;
      const d = 300 + Math.random() * 800;
      c.style.transform = `translate(${Math.cos(a)*d}px, ${Math.sin(a)*d + 200}px) rotate(${Math.random()*1080}deg)`;
      c.style.opacity = '0';
    });
    setTimeout(() => c.remove(), 2100);
  }
}
function firework(x, y) {
  const color = pastelHex[Math.floor(Math.random() * pastelHex.length)];
  for (let i = 0; i < 40; i++) {
    const p = document.createElement('div');
    p.style.cssText = `position:fixed;top:${y}px;left:${x}px;width:6px;height:6px;background:${color};border-radius:50%;z-index:9997;pointer-events:none;box-shadow:0 0 15px ${color};transition:transform 1s cubic-bezier(.15,.5,.5,1),opacity 1s ease-out;`;
    document.body.appendChild(p);
    requestAnimationFrame(() => {
      const a = (Math.PI * 2 * i) / 40;
      const d = 100 + Math.random() * 150;
      p.style.transform = `translate(${Math.cos(a)*d}px, ${Math.sin(a)*d}px)`;
      p.style.opacity = '0';
    });
    setTimeout(() => p.remove(), 1100);
  }
}
function fullBurst() {
  const flash = document.createElement('div');
  flash.className = 'flash';
  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 900);
  confettiBlast();
  setTimeout(() => firework(innerWidth * 0.25, innerHeight * 0.4), 200);
  setTimeout(() => firework(innerWidth * 0.75, innerHeight * 0.5), 400);
  setTimeout(() => firework(innerWidth * 0.5, innerHeight * 0.3), 600);
  setTimeout(() => confettiBlast(), 1000);
}

/* =========================================================
   5. QUIZ LOGIC
   ========================================================= */
const questions = [
  { q: "A text drops reading 'We need to talk'. You:", ic: '#i-planet', opts: [
    { t: "Pack up & relocate", s: 5 }, { t: "'I did nothing'", s: 15 },
    { t: "Send a TikTok", s: 25 }, { t: "Reply 'okay' instantly", s: 40 }
  ]},
  { q: "Awkward silence at the table. You:", ic: '#i-satellite', opts: [
    { t: "Flee to washroom", s: 5 }, { t: "Start mewing", s: 35 },
    { t: "'Well, that was awkward'", s: 0 }, { t: "Drop a brain-rot quote", s: 20 }
  ]},
  { q: "Friend uses Discord light mode. Verdict?", ic: '#i-rocket', opts: [
    { t: "Report to authorities", s: 35 }, { t: "Understand them", s: 5 },
    { t: "Stare deeply", s: 25 }, { t: "They are cooked", s: 40 }
  ]},
  { q: "Barista messes up your drink.", ic: '#i-comet', opts: [
    { t: "Apologize & take it", s: 0 }, { t: "Consume it locking eyes", s: 40 },
    { t: "Sip quietly", s: 15 }, { t: "Live review stream", s: 25 }
  ]},
  { q: "Handshake vs Fist Bump collision.", ic: '#i-ufo', opts: [
    { t: "Paper-scissors-rock", s: 35 }, { t: "Abort sequence", s: 5 },
    { t: "Engulf their fist", s: 40 }, { t: "Vocalize error", s: 20 }
  ]},
  { q: "Stance on 'Mewing'?", ic: '#i-galaxy', opts: [
    { t: "Nonsense", s: 0 }, { t: "Quietly lock jawline", s: 40 },
    { t: "Only for cameras", s: 20 }, { t: "Ask my cat", s: 10 }
  ]},
  { q: "Fanum Tax mentioned. You think:", ic: '#i-planet', opts: [
    { t: "Actual taxes", s: 0 }, { t: "Asset transfer of fries", s: 40 },
    { t: "Dark magic", s: 15 }, { t: "Refuse to process", s: 5 }
  ]},
  { q: "Hustle culture perspective?", ic: '#i-rocket', opts: [
    { t: "Work till matrix crumbles", s: 10 }, { t: "Quiet quit by lunch", s: 35 },
    { t: "Automate to AI", s: 40 }, { t: "Argue with board", s: 25 }
  ]},
  { q: "Favorite communication?", ic: '#i-satellite', opts: [
    { t: "8 min voice notes", s: 5 }, { t: "Random stickers", s: 30 },
    { t: "Heavy text paragraphs", s: 0 }, { t: "Silence. Read receipts off", s: 40 }
  ]},
  { q: "A mirror is detected. Protocols?", ic: '#i-ufo', opts: [
    { t: "Avoid contact", s: 10 }, { t: "Adjust hair & wink", s: 35 },
    { t: "Lock-in face check", s: 40 }, { t: "Clean glasses", s: 15 }
  ]}
];

let i = 0, score = 0, selected = null;
const $ = id => document.getElementById(id);
const hero = $('hero'), quiz = $('quiz'), result = $('result');

function load() {
  const q = questions[i];
  $('qNum').textContent = String(i + 1).padStart(2, '0');
  const pct = Math.round((i / 10) * 100);
  $('qPct').textContent = pct + '%';
  $('bar').style.width = pct + '%';
  $('qText').innerHTML = `<span class="q-ic"><svg width="26" height="26"><use href="${q.ic}"/></svg></span> ${q.q}`;
  $('opts').innerHTML = '';
  selected = null;
  $('warn').classList.add('hidden');
  q.opts.forEach((o, idx) => {
    const b = document.createElement('button');
    b.className = 'opt';
    b.id = `opt-${idx}`;
    b.innerHTML = `<span class="key">${String.fromCharCode(65 + idx)}</span><span>${o.t}</span>`;
    b.onclick = () => selectOption(idx, o.s);
    $('opts').appendChild(b);
  });
  $('nextText').textContent = i === 9 ? 'CALCULATE AURA' : 'Next';
}

function selectOption(index, pointsValue) {
  playBeep(260 + index * 40, 'sine', 0.25, 0.15);
  document.querySelectorAll('.opt').forEach(x => x.classList.remove('selected'));
  const target = $(`opt-${index}`);
  if (target) {
    target.classList.add('selected', 'key-active');
    setTimeout(() => target.classList.remove('key-active'), 150);
  }
  selected = pointsValue;
  $('warn').classList.add('hidden');
}

addEventListener('keydown', e => {
  if (quiz.classList.contains('hidden')) return;
  const k = e.key.toLowerCase();
  if (k === 'a' || k === '1') selectOption(0, questions[i].opts[0].s);
  else if (k === 'b' || k === '2') selectOption(1, questions[i].opts[1].s);
  else if (k === 'c' || k === '3') selectOption(2, questions[i].opts[2].s);
  else if (k === 'd' || k === '4') selectOption(3, questions[i].opts[3].s);
  else if (k === 'enter') { e.preventDefault(); $('nextBtn').click(); }
});

$('startBtn').onclick = () => {
  getAudio();
  playBeep(330, 'triangle', 0.4, 0.2);
  hero.classList.add('hidden');
  quiz.classList.remove('hidden');
  i = 0; score = 0; load();
  scrollTo({ top: 0, behavior: 'smooth' });
};

$('nextBtn').onclick = () => {
  if (selected === null) {
    playBeep(120, 'square', 0.35, 0.2);
    $('warn').classList.remove('hidden');
    const c = $('quizCard');
    c.classList.remove('shake'); void c.offsetWidth; c.classList.add('shake');
    return;
  }
  score += selected;
  i++;
  if (i >= 10) showResult();
  else { playBeep(440, 'triangle', 0.2, 0.1); load(); }
};

/* =========================================================
   6. RESULT SCENE & ANIMATION WITH GOKU STATIC IMAGE
   ========================================================= */

// Ensure your image is placed in the "assets" folder and named "goku.png"
const GOKU_IMAGE_PATH = "assets/goku.png"; 

function buildResult() {
  const resultCard = document.querySelector('.card.result');
  const powerLevel = (score * 9000).toLocaleString();
  resultCard.innerHTML = `
    <div class="badge"><i></i> Aura Calibration Complete</div>
    <div class="result-grid">
      <div class="scene" id="scene">
        <div class="scene-ground"></div>
        <div class="scene-tower">
          <div class="meter-fill" id="meterFill"></div>
          <div class="tower-bell" id="bell"></div>
          <div class="tower-impact" id="towerImpact"></div>
          <div class="tick" style="bottom:98%"></div><div class="tick-num" style="bottom:98%">100</div>
          <div class="tick" style="bottom:75%"></div><div class="tick-num" style="bottom:75%">75</div>
          <div class="tick" style="bottom:50%"></div><div class="tick-num" style="bottom:50%">50</div>
          <div class="tick" style="bottom:25%"></div><div class="tick-num" style="bottom:25%">25</div>
          <div class="tier-label" id="tL1" style="bottom:92%">Titan</div>
          <div class="tier-label" id="tL2" style="bottom:75%">Elite</div>
          <div class="tier-label" id="tL3" style="bottom:55%">Zen</div>
          <div class="tier-label" id="tL4" style="bottom:35%">Rising</div>
          <div class="tier-label" id="tL5" style="bottom:15%">Stealth</div>
        </div>

        <div class="character" id="character">
          <div class="goku-pixel" id="gokuPixel">
            <div class="power-level">POWER: ${powerLevel}</div>

            <!-- STATIC GOKU IMAGE LOADED HERE -->
            <div class="goku-img-wrap">
               <img src="${GOKU_IMAGE_PATH}" alt="Goku" class="goku-img" onerror="this.src='goku.png'">
            </div>

            <!-- CSS Animations applied over hands -->
            <div class="kame-charge" id="kameCharge">
              <div class="kame-core"></div>
              <div class="kame-inner-glow"></div>
              <div class="kame-outer-glow"></div>
              <div class="kame-particle p1"></div>
              <div class="kame-particle p2"></div>
              <div class="kame-particle p3"></div>
              <div class="kame-particle p4"></div>
              <div class="kame-particle p5"></div>
              <div class="kame-particle p6"></div>
            </div>

            <div class="kame-beam" id="kameBeam">
              <div class="beam-core"></div>
              <div class="beam-glow"></div>
              <div class="beam-shock"></div>
            </div>

            <div class="kamehameha-text" id="kameText">KA...ME...HA...ME...HAAAA!</div>
          </div>
        </div>
      </div>

      <div class="score-panel">
        <div class="score-panel-badge"><span class="ic"><svg width="12" height="12"><use href="#i-power"/></svg></span> Power Reading</div>
        <h2><span class="ic"><svg width="24" height="24"><use href="#i-bolt"/></svg></span> Your Vibe Frequency</h2>
        <p id="fireStatus">Goku is preparing your energy reading...</p>

        <div class="big-score" id="bigScore">
          <span id="scoreNum">0</span><span class="small-num">/100</span>
        </div>

        <div class="aura-power-bar">
          <div class="aura-power-bar-fill" id="powerBarFill"></div>
        </div>

        <div class="tier-panel" id="tierPanel">
          <small>Detected Tier</small>
          <strong>
            <span class="ic" id="tierIc"><svg width="22" height="22"><use href="#i-crown"/></svg></span>
            <span id="tierName">—</span>
          </strong>
          <p id="tierDesc"></p>
        </div>

        <div class="retry-btn-wrap" id="retryWrap">
          <button class="btn btn-ghost" id="retryBtn">
            <span class="ic"><svg width="16" height="16"><use href="#i-refresh"/></svg></span>
            Power Up Again
          </button>
        </div>
      </div>
    </div>
  `;
}

function createDebris(x, y) {
  const container = $('scene');
  for (let d = 0; d < 24; d++) {
    const el = document.createElement('div');
    el.className = 'debris';
    const angle = Math.random() * Math.PI * 2;
    const force = 60 + Math.random() * 140;
    el.style.left = x + 'px';
    el.style.top = y + 'px';
    el.style.setProperty('--x', Math.cos(angle) * force + 'px');
    el.style.setProperty('--y', Math.sin(angle) * force - 50 + 'px');
    el.style.animation = 'scatter 0.7s cubic-bezier(0.1, 0.8, 0.3, 1) forwards';
    container.appendChild(el);
    setTimeout(() => el.remove(), 750);
  }
}

function playAnimation() {
  const kameCharge = $('kameCharge');
  const kameBeam = $('kameBeam');
  const kameText = $('kameText');
  const meterFill = $('meterFill');
  const towerImpact = $('towerImpact');
  const scene = $('scene');
  const bell = $('bell');
  const scoreNum = $('scoreNum');
  const bigScore = $('bigScore');
  const powerBarFill = $('powerBarFill');
  const tierPanel = $('tierPanel');
  const retryWrap = $('retryWrap');
  const fireStatus = $('fireStatus');

  // Max score is 400. Normalize to 100%.
  let finalScore = (score / 400) * 100; 
  if (finalScore < 0) finalScore = 0;
  if (finalScore > 100) finalScore = 100;

  let color, name, desc, icon, tierLabelId;

  if (finalScore >= 85) { color = '#fcd34d'; name = 'Titan Aura'; icon = '#i-crown'; desc = 'Main-character energy. You walk in and the whole vibe shifts.'; tierLabelId = 'tL1'; }
  else if (finalScore >= 70) { color = '#bae6fd'; name = 'Elite Aura'; icon = '#i-bolt'; desc = 'Strong presence, clean confidence, high social gravity.'; tierLabelId = 'tL2'; }
  else if (finalScore >= 55) { color = '#a7f3d0'; name = 'Zen Aura'; icon = '#i-diamond'; desc = 'Balanced, magnetic, unbothered — premium calm energy.'; tierLabelId = 'tL3'; }
  else if (finalScore >= 40) { color = '#fecaca'; name = 'Rising Aura'; icon = '#i-spark'; desc = 'Your frequency is warming up. Keep leveling the vibe.'; tierLabelId = 'tL4'; }
  else { color = '#c4b5fd'; name = 'Stealth Aura'; icon = '#i-moon'; desc = 'Low broadcast mode. Mysterious, quiet, untapped potential.'; tierLabelId = 'tL5'; }

  // Phase 1: Charge Up (0.5s)
  setTimeout(() => {
    kameCharge.classList.add('charging');
    kameText.classList.add('show');
    scene.classList.add('gentle-shake');
    try {
      getAudio();
      const now = actx.currentTime;
      const osc = actx.createOscillator();
      const gain = actx.createGain();
      osc.type = 'sawtooth';
      osc.connect(gain); gain.connect(actx.destination);
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 2);
      gain.gain.setValueAtTime(0.01, now);
      gain.gain.linearRampToValueAtTime(0.18, now + 1.8);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 2.2);
      osc.start(now); osc.stop(now + 2.2);
    } catch (e) {}
  }, 500);

  // Phase 2: Fire (2.5s)
  setTimeout(() => {
    kameText.textContent = 'HAAAAAA!';
    kameText.classList.add('shout');
    kameCharge.classList.add('firing');
    kameBeam.classList.add('fire');
    scene.classList.remove('gentle-shake');
    scene.classList.add('charging-shake');
    fireStatus.textContent = 'KAMEHAMEHA UNLEASHED!';
    fireStatus.style.color = color;
    playExplosion();
  }, 2500);

  // Phase 3: Beam Hits Tower (3.1s)
  setTimeout(() => {
    towerImpact.classList.add('hit');
    createDebris(355, 250);
    createDebris(355, 380);
    impactJolt = 6;
    playExplosion();

    meterFill.style.background = color;
    meterFill.style.boxShadow = `0 0 40px ${color}`;
    meterFill.style.height = finalScore + '%';
    powerBarFill.style.background = color;
    powerBarFill.style.width = finalScore + '%';

    const labels = ['tL5', 'tL4', 'tL3', 'tL2', 'tL1'];
    const targetIdx = labels.indexOf(tierLabelId);
    labels.forEach((id, idx) => {
      if (idx <= targetIdx) {
        setTimeout(() => {
          document.getElementById(id).classList.add('active');
          playBeep(200 + idx * 80, 'square', 0.2, 0.08);
        }, idx * 300 + 100);
      }
    });

    const total = Math.floor(finalScore);
    const duration = 2000;
    const start = performance.now();
    (function tick(now) {
      const p = Math.min((now - start) / duration, 1);
      const eased = p === 1 ? 1 : Math.pow(2, 10 * p - 10);
      const s = Math.floor(eased * total);
      scoreNum.textContent = s;
      if (Math.random() > 0.45) playBeep(300 + s * 4, 'sine', 0.05, 0.03);
      if (p < 1) requestAnimationFrame(tick);
      else scoreNum.textContent = total;
    })(start);
  }, 3100);

  // Phase 4: Beam Fade (4.2s)
  setTimeout(() => {
    kameBeam.classList.remove('fire');
    kameCharge.classList.remove('charging', 'firing');
    kameText.classList.remove('show', 'shout');
  }, 4200);

  // Phase 5: Settle (5.1s)
  setTimeout(() => {
    scene.classList.remove('charging-shake');
    bigScore.style.color = color;
  }, 5100);

  // Phase 6: Celebration (5.15s)
  setTimeout(() => {
    playEpicCompletion();
    if (finalScore >= 70) bell.classList.add('ring');
  }, 5150);

  // Phase 7: Reveal Tier Panel (5.4s)
  setTimeout(() => {
    $('tierName').textContent = name;
    $('tierDesc').textContent = desc;
    $('tierIc').innerHTML = `<svg width="22" height="22"><use href="${icon}"/></svg>`;
    tierPanel.style.borderColor = color;
    $('tierName').style.color = color;
    tierPanel.classList.add('show');
    retryWrap.classList.add('show');
    
    // Add click to retry
    $('retryBtn').onclick = () => {
      result.classList.add('hidden');
      hero.classList.remove('hidden');
      scrollTo({ top: 0, behavior: 'smooth' });
    };
  }, 5400);
}

function showResult() {
  $('bar').style.width = '100%';
  $('qPct').textContent = '100%';
  quiz.classList.add('hidden');
  result.classList.remove('hidden');
  scrollTo({ top: 0, behavior: 'smooth' });
  buildResult();
  playAnimation();
}