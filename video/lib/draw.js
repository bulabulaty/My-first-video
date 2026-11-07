// Общая 2D-библиотека для серий «Наследник».
// Всё рисуется кодом на canvas 1080x1920 (формат Reels 9:16).
// Персонажи, дождь, титры, карточки выбора — переиспользуются в каждой серии.

const W = 1080, H = 1920;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');

// ---------- утилиты ----------
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, t) => a + (b - a) * t;
const prog = (t, a, b) => clamp((t - a) / (b - a));
const easeInOut = t => t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
const easeOut = t => 1 - Math.pow(1 - t, 3);
const easeIn = t => t * t * t;
const backOut = t => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2); };

function ellipse(x, y, rx, ry, rot = 0) { ctx.beginPath(); ctx.ellipse(x, y, rx, ry, rot, 0, Math.PI * 2); ctx.fill(); }
function rr(x, y, w, h, r) { ctx.beginPath(); ctx.roundRect(x, y, w, h, r); ctx.fill(); }
function poly(pts) { ctx.beginPath(); ctx.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) ctx.lineTo(pts[i], pts[i + 1]); ctx.closePath(); ctx.fill(); }
function vgrad(y0, y1, stops) { const g = ctx.createLinearGradient(0, y0, 0, y1); stops.forEach((c, i) => g.addColorStop(i / (stops.length - 1), c)); return g; }
function glow(x, y, r, color, a = 1) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, color); g.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.save(); ctx.globalAlpha = a; ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
  ctx.fillRect(x - r, y - r, r * 2, r * 2); ctx.restore();
}

// ---------- атмосфера ----------
const _R = rng(7);
const DROPS = [...Array(280)].map(() => ({ x: _R() * 1500 - 300, y: _R() * 2300, len: 30 + _R() * 60, sp: 1700 + _R() * 900, w: 1 + _R() * 2.4, a: .12 + _R() * .35 }));
function rain(t, alpha = 1, slant = .2) {
  ctx.save(); ctx.lineCap = 'round';
  for (const d of DROPS) {
    const y = ((d.y + d.sp * t) % 2300) - 200, x = d.x + y * slant;
    ctx.strokeStyle = `rgba(190,210,255,${d.a * alpha})`; ctx.lineWidth = d.w;
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + d.len * slant, y + d.len); ctx.stroke();
  }
  ctx.restore();
}

const GRAIN = [0, 1, 2, 3].map(k => {
  const c = document.createElement('canvas'); c.width = 270; c.height = 480;
  const g = c.getContext('2d'), im = g.createImageData(270, 480), r = rng(99 + k);
  for (let i = 0; i < im.data.length; i += 4) { const v = r() * 255; im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255; }
  g.putImageData(im, 0, 0); return c;
});
function filmFinish(t, vig = .75) {
  ctx.save(); ctx.globalAlpha = .07; ctx.globalCompositeOperation = 'overlay';
  ctx.imageSmoothingEnabled = false; ctx.drawImage(GRAIN[Math.floor(t * 24) % 4], 0, 0, W, H); ctx.restore();
  const g = ctx.createRadialGradient(W / 2, H * .45, H * .25, W / 2, H * .5, H * .78);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(0,0,0,${vig})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}
function fadeBlack(a) { if (a <= 0) return; ctx.fillStyle = `rgba(0,0,0,${clamp(a)})`; ctx.fillRect(0, 0, W, H); }
function flash(a, color = '255,255,255') { if (a <= 0) return; ctx.fillStyle = `rgba(${color},${clamp(a)})`; ctx.fillRect(0, 0, W, H); }

function tree(x, y, len, ang, depth, r, width) {
  if (depth === 0) return;
  const x2 = x + Math.cos(ang) * len, y2 = y + Math.sin(ang) * len;
  ctx.lineWidth = width; ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x2, y2); ctx.stroke();
  const n = depth > 4 ? 2 : 2 + (r() < .4 ? 1 : 0);
  for (let i = 0; i < n; i++) tree(x2, y2, len * (.62 + r() * .18), ang + (r() - .5) * 1.3, depth - 1, r, width * .66);
}

// ---------- персонаж ----------
// o: x,y (точка у ног), s (масштаб, рост ~640px при s=1), skin, hair, hairStyle(messy|slick|bald|pigtails),
// coat, hem, shirt, tie, pants, mood(sad|smile|sly|neutral|angry|determined|shock), closed, look(-1..1),
// tilt, hs (масштаб головы), arms(down|umbrella|teddy), glasses, beard, blush
function person(o) {
  const sk = o.skin || '#eab894', coat = o.coat || '#22252f', hem = o.hem ?? -210;
  ctx.save(); ctx.translate(o.x, o.y); ctx.scale(o.s, o.s);
  if (o.shadow !== false) { ctx.fillStyle = 'rgba(0,0,0,.35)'; ellipse(0, 0, 120, 20); }
  ctx.fillStyle = o.pants || '#191b26'; rr(-50, -270, 42, 268, 16); rr(8, -270, 42, 268, 16);
  ctx.fillStyle = '#0b0b10'; ellipse(-32, -6, 36, 14); ellipse(32, -6, 36, 14);

  const arm = (x1, y1, x2, y2, x3, y3) => {
    ctx.strokeStyle = coat; ctx.lineWidth = 40; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
    ctx.strokeStyle = 'rgba(0,0,0,.2)'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(x2, y2); ctx.lineTo(x3, y3); ctx.stroke();
    ctx.fillStyle = sk; ellipse(x3, y3 + 6, 17, 19);
  };
  const arms = o.arms || 'down';
  if (arms === 'down') { arm(-96, -440, -114, -340, -112, -238); arm(96, -440, 114, -340, 112, -238); }
  if (arms === 'umbrella') arm(-96, -440, -114, -340, -112, -238);

  // корпус
  ctx.fillStyle = coat; ctx.beginPath(); ctx.moveTo(-62, -482); ctx.quadraticCurveTo(-110, -478, -108, -430);
  ctx.lineTo(-100, hem); ctx.lineTo(100, hem); ctx.lineTo(108, -430); ctx.quadraticCurveTo(110, -478, 62, -482); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.clip(); ctx.fillStyle = 'rgba(0,0,0,.2)'; ctx.fillRect(12, -500, 120, 700); ctx.restore();
  if (!o.dress) {
    ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(0, -385); ctx.lineTo(0, hem); ctx.stroke();
    ctx.fillStyle = o.shirt || '#d9dde6'; poly([-32, -484, 32, -484, 0, -385]);
    if (o.tie) { ctx.fillStyle = o.tie; poly([-10, -478, 10, -478, 7, -462, 16, -395, 0, -378, -16, -395, -7, -462]); }
    ctx.fillStyle = 'rgba(0,0,0,.28)'; poly([-32, -484, -62, -476, -4, -386]); poly([32, -484, 62, -476, 4, -386]);
  } else {
    ctx.fillStyle = 'rgba(255,255,255,.85)'; poly([-34, -486, 34, -486, 22, -460, -22, -460]);
  }
  if (arms === 'umbrella') arm(96, -440, 122, -352, 26, -376);
  if (arms === 'teddy') {
    ctx.save(); ctx.translate(0, -350);
    ctx.fillStyle = '#8a5a36'; ellipse(0, 10, 42, 48); ellipse(-22, -62, 12, 12); ellipse(22, -62, 12, 12); ellipse(0, -40, 32, 30);
    ctx.fillStyle = '#c99b73'; ellipse(0, -32, 12, 9); ellipse(0, 16, 22, 26);
    ctx.fillStyle = '#1a1010'; ellipse(-11, -46, 4, 4); ellipse(11, -46, 4, 4); ellipse(0, -35, 4, 3);
    ctx.restore();
    arm(-90, -440, -86, -360, -34, -340); arm(90, -440, 86, -360, 34, -340);
  }
  // шея
  ctx.fillStyle = sk; rr(-20, -514, 40, 36, 8);
  ctx.fillStyle = 'rgba(0,0,0,.18)'; rr(-20, -500, 40, 14, 6);

  // голова
  ctx.save(); ctx.translate(0, -500); ctx.rotate(o.tilt || 0); const hs = o.hs || 1; ctx.scale(hs, hs); ctx.translate(0, 500);
  const hair = o.hair || '#1a1410', hst = o.hairStyle || 'messy';
  if (hst === 'pigtails') {
    ctx.fillStyle = hair; ellipse(-78, -568, 26, 34, -.4); ellipse(78, -568, 26, 34, .4);
    ctx.fillStyle = '#ffcf3a'; poly([-60, -588, -48, -600, -48, -574]); poly([60, -588, 48, -600, 48, -574]);
  }
  ctx.fillStyle = sk; ellipse(-54, -556, 10, 15); ellipse(54, -556, 10, 15);
  ellipse(0, -560, 54, 64);
  ctx.save(); ctx.beginPath(); ctx.ellipse(0, -560, 54, 64, 0, 0, Math.PI * 2); ctx.clip();
  ctx.fillStyle = 'rgba(80,30,20,.16)'; ctx.fillRect(14, -640, 60, 160); ctx.restore();

  ctx.fillStyle = hair;
  if (hst === 'messy') {
    ellipse(0, -598, 60, 42);
    poly([-60, -598, -58, -560, -46, -578, -36, -548, -24, -574, -10, -546, 4, -572, 18, -548, 30, -574, 44, -552, 52, -578, 60, -556, 60, -600]);
    poly([-40, -630, -30, -648, -16, -634]); poly([-6, -636, 8, -652, 20, -634]); poly([24, -630, 40, -642, 44, -618]);
    rr(-60, -600, 10, 50, 5); rr(50, -600, 10, 50, 5);
  } else if (hst === 'slick') {
    ellipse(0, -600, 58, 36); rr(-58, -604, 12, 48, 6); rr(46, -604, 12, 48, 6);
    ctx.strokeStyle = 'rgba(255,255,255,.25)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-22, -630); ctx.quadraticCurveTo(-30, -608, -26, -590); ctx.stroke();
  } else if (hst === 'bald') {
    ellipse(-50, -566, 11, 24); ellipse(50, -566, 11, 24);
    ctx.fillStyle = 'rgba(255,255,255,.28)'; ellipse(-16, -606, 18, 8, -.3);
  } else if (hst === 'pigtails') {
    ellipse(0, -598, 60, 44);
    ctx.beginPath(); ctx.moveTo(-58, -596); ctx.quadraticCurveTo(0, -560, 58, -596); ctx.lineTo(58, -620); ctx.lineTo(-58, -620); ctx.fill();
  }

  if (o.beard) {
    ctx.fillStyle = o.beard; ctx.beginPath(); ctx.moveTo(-52, -556); ctx.quadraticCurveTo(-52, -490, 0, -486);
    ctx.quadraticCurveTo(52, -490, 52, -556); ctx.lineTo(42, -540); ctx.quadraticCurveTo(0, -506, -42, -540); ctx.closePath(); ctx.fill();
    ellipse(0, -527, 22, 6);
  }
  // лицо
  const lx = (o.look || 0) * 9, ly = (o.lookY || 0) * 5, ey = -562, mood = o.mood || 'neutral';
  if (o.closed) {
    ctx.strokeStyle = '#2a1c18'; ctx.lineWidth = 4;
    for (const sx of [-21, 21]) { ctx.beginPath(); ctx.moveTo(sx - 10, ey); ctx.quadraticCurveTo(sx, ey + 7, sx + 10, ey); ctx.stroke(); }
  } else {
    ctx.fillStyle = '#fff'; ellipse(-21 + lx * .4, ey, 11, 9); ellipse(21 + lx * .4, ey, 11, 9);
    ctx.fillStyle = o.eye || '#2a1a14'; ellipse(-21 + lx, ey + ly, 6.5, 7.5); ellipse(21 + lx, ey + ly, 6.5, 7.5);
    ctx.fillStyle = '#fff'; ellipse(-19 + lx, ey - 3 + ly, 2, 2); ellipse(23 + lx, ey - 3 + ly, 2, 2);
    if (mood === 'sly' || mood === 'angry' || mood === 'determined') { ctx.fillStyle = sk; rr(-34, ey - 14, 26, 7, 2); rr(8, ey - 14, 26, 7, 2); }
  }
  const brows = { sad: [-588, -578], angry: [-574, -586], determined: [-576, -584], sly: [-578, -582], neutral: [-582, -582], smile: [-584, -582], shock: [-596, -592] }[mood] || [-582, -582];
  ctx.strokeStyle = o.browColor || hair; ctx.lineWidth = 6; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-34, brows[1]); ctx.lineTo(-10, brows[0]); ctx.stroke();
  const rb = mood === 'sly' ? brows[0] - 8 : brows[0];
  ctx.beginPath(); ctx.moveTo(10, rb); ctx.lineTo(34, brows[1] - (mood === 'sly' ? 6 : 0)); ctx.stroke();
  ctx.strokeStyle = 'rgba(0,0,0,.28)'; ctx.lineWidth = 3.5;
  ctx.beginPath(); ctx.moveTo(3, -556); ctx.lineTo(-4, -536); ctx.lineTo(5, -533); ctx.stroke();
  if (o.blush) { ctx.fillStyle = 'rgba(255,110,120,.35)'; ellipse(-32, -540, 11, 6); ellipse(32, -540, 11, 6); }
  ctx.strokeStyle = '#6b2b2b'; ctx.lineWidth = 4.5; ctx.beginPath();
  if (mood === 'sad') { ctx.moveTo(-13, -512); ctx.quadraticCurveTo(0, -522, 13, -512); }
  else if (mood === 'smile') { ctx.moveTo(-18, -522); ctx.quadraticCurveTo(0, -506, 18, -522); }
  else if (mood === 'sly') { ctx.moveTo(-16, -517); ctx.quadraticCurveTo(6, -510, 22, -527); }
  else if (mood === 'shock') { ctx.fillStyle = '#4a1a1a'; ellipse(0, -516, 8, 11); }
  else { ctx.moveTo(-12, -517); ctx.lineTo(12, -517); }
  ctx.stroke();
  if (o.glasses) {
    ctx.strokeStyle = '#111'; ctx.lineWidth = 4;
    for (const sx of [-21, 21]) { ctx.beginPath(); ctx.arc(sx, ey, 16, 0, Math.PI * 2); ctx.stroke(); }
    ctx.beginPath(); ctx.moveTo(-5, ey - 2); ctx.lineTo(5, ey - 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,.18)'; poly([-30, ey - 8, -24, ey - 14, -14, ey + 4, -20, ey + 10]);
  }
  ctx.restore(); // голова

  if (arms === 'umbrella') {
    ctx.strokeStyle = '#0a0a0e'; ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(26, -330); ctx.lineTo(26, -780); ctx.stroke();
    ctx.fillStyle = '#0f1016'; ctx.beginPath(); ctx.ellipse(26, -740, 270, 160, 0, Math.PI, 0);
    for (let i = 4; i >= -4; i--) ctx.quadraticCurveTo(26 + i * 60 + 30, -715, 26 + (i - 1) * 60 + 30 + (i === -4 ? -30 : 0), -740);
    ctx.fill();
    ctx.strokeStyle = 'rgba(140,160,200,.25)'; ctx.lineWidth = 3;
    for (const k of [-.6, -.25, .25, .6]) { ctx.beginPath(); ctx.moveTo(26, -900); ctx.quadraticCurveTo(26 + k * 200, -880, 26 + k * 270, -742); ctx.stroke(); }
  }
  ctx.restore();
}

// Готовые персонажи (единый вид во всех сериях)
const CAST = {
  lev: { skin: '#eab894', hair: '#17110d', hairStyle: 'messy', coat: '#1f2330', shirt: '#2b2f3c', pants: '#151722', hem: -150 },
  viktor: { skin: '#dfa985', hair: '#9b9ba5', hairStyle: 'slick', coat: '#2c2e38', tie: '#b3202a', beard: '#8d8d97', shirt: '#e9e9ef', eye: '#3a2a10' },
  gordeev: { skin: '#e4b58f', hair: '#6d6d74', hairStyle: 'bald', coat: '#4a4f5c', tie: '#20324f', glasses: true, shirt: '#f2f2f2' },
  alisa: { skin: '#f1c3a0', hair: '#c26a2a', hairStyle: 'pigtails', coat: '#f2b631', dress: true, hem: -170, pants: '#f1c3a0', blush: true, hs: 1.35, arms: 'teddy' },
};
const as = (who, extra) => Object.assign({}, CAST[who], extra);

// ---------- титры ----------
// *слово* — подсветка жёлтым. Возвращает высоту блока.
function caption(text, t, a, b, y = 1330, opt = {}) {
  if (t < a || t > b) return;
  const ap = easeOut(prog(t, a, a + .25)), dp = prog(t, b - .2, b), alpha = ap * (1 - dp);
  const size = opt.size || 56; ctx.save();
  ctx.font = `800 ${size}px Montserrat`; ctx.textBaseline = 'middle';
  const words = []; let hl = false;
  for (const raw of text.split(' ')) {
    let w = raw; const st = w.startsWith('*'); if (st) { hl = true; w = w.slice(1); }
    const en = w.endsWith('*') || w.endsWith('*,') || w.endsWith('*.'); const tail = en ? w.slice(w.lastIndexOf('*') + 1) : '';
    if (en) w = w.slice(0, w.lastIndexOf('*'));
    words.push({ w, hl }); if (tail) words.push({ w: tail, hl: false, glue: true });
    if (en) hl = false;
  }
  const maxW = opt.maxW || 900, sp = ctx.measureText(' ').width; const lines = [[]]; let lw = 0;
  for (const wd of words) {
    const ww = ctx.measureText(wd.w).width + (wd.glue ? 0 : sp);
    if (lw + ww > maxW && lines[lines.length - 1].length && !wd.glue) { lines.push([]); lw = 0; }
    lines[lines.length - 1].push(wd); lw += ww;
  }
  const lh = size * 1.28, bh = lines.length * lh + 36;
  const widths = lines.map(l => l.reduce((s, wd, i) => s + ctx.measureText(wd.w).width + (i && !wd.glue ? sp : 0), 0));
  const bw = Math.max(...widths) + 64;
  ctx.globalAlpha = alpha; ctx.translate(0, (1 - ap) * 24);
  ctx.fillStyle = 'rgba(8,8,14,.62)'; rr(W / 2 - bw / 2, y - bh / 2, bw, bh, 26);
  lines.forEach((l, li) => {
    let x = W / 2 - widths[li] / 2; const ly = y - bh / 2 + 18 + lh * (li + .5);
    l.forEach((wd, i) => {
      if (i && !wd.glue) x += sp;
      ctx.fillStyle = wd.hl ? '#ffd23f' : '#fff'; ctx.shadowColor = 'rgba(0,0,0,.6)'; ctx.shadowBlur = 8;
      ctx.fillText(wd.w, x, ly); x += ctx.measureText(wd.w).width;
    });
  });
  ctx.restore();
}

function nameTag(text, x, y, t, a) {
  const p = prog(t, a, a + .35); if (p <= 0) return; const sc = backOut(p);
  ctx.save(); ctx.translate(x, y); ctx.scale(sc, sc); ctx.font = '800 34px Montserrat'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  const w = ctx.measureText(text).width + 44;
  ctx.fillStyle = '#ffd23f'; rr(-w / 2, -30, w, 60, 30); poly([-12, 28, 12, 28, 0, 46]);
  ctx.fillStyle = '#16120a'; ctx.fillText(text, 0, 2); ctx.restore();
}

function sparkle(x, y, r, a) {
  if (a <= 0) return; ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#fff'; ctx.translate(x, y);
  ctx.beginPath(); for (let i = 0; i < 8; i++) { const rad = i % 2 ? r * .18 : r, an = i * Math.PI / 4; ctx.lineTo(Math.cos(an) * rad, Math.sin(an) * rad); } ctx.fill();
  ctx.restore(); glow(x, y, r * 1.6, 'rgba(255,240,200,.9)', a);
}

// Карточка выбора для финала серии
function choiceCard(letter, title, desc, y, color, t, a, pulse) {
  const p = prog(t, a, a + .45); if (p <= 0) return; const e = backOut(p);
  const dir = letter === 'A' ? -1 : 1; ctx.save(); ctx.translate((1 - e) * 700 * dir, 0); ctx.globalAlpha = clamp(p * 2);
  const x = 70, w = 840, h = 210;
  if (pulse > 0) { ctx.shadowColor = color; ctx.shadowBlur = 40 * pulse; }
  ctx.fillStyle = 'rgba(14,14,22,.92)'; rr(x, y, w, h, 30); ctx.shadowBlur = 0;
  ctx.strokeStyle = color; ctx.lineWidth = 5; ctx.beginPath(); ctx.roundRect(x, y, w, h, 30); ctx.stroke();
  ctx.fillStyle = color; rr(x + 22, y + 30, 150, 150, 24);
  ctx.fillStyle = '#fff'; ctx.font = '800 110px Montserrat'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(letter, x + 97, y + 110);
  ctx.textAlign = 'left'; ctx.font = '800 50px Montserrat'; ctx.fillText(title, x + 200, y + 62);
  ctx.font = '600 33px Montserrat'; ctx.fillStyle = '#d6d8e2';
  desc.split('\n').forEach((l, i) => ctx.fillText(l, x + 200, y + 118 + i * 42));
  ctx.restore();
}

// ---------- движок таймлайна ----------
function runTimeline(scenes, total) {
  window.TOTAL = total;
  window.render = (T) => {
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
    const sc = scenes.find(s => T >= s.start && T < s.end) || scenes[scenes.length - 1];
    const lt = T - sc.start, dur = sc.end - sc.start;
    ctx.save(); sc.draw(lt, dur, T); ctx.restore();
    filmFinish(T, sc.vig ?? .75);
    fadeBlack(Math.max(1 - lt / (sc.fadeIn ?? .25), (lt - (dur - (sc.fadeOut ?? .2))) / (sc.fadeOut ?? .2)));
    return cv.toDataURL('image/jpeg', .92);
  };
}
