// «ПОСЛЕДНИЙ НА МАРСЕ» — Серия 1 «Один».
// Тайминги берутся из timeline.js (его создаёт voice.py по длине озвучки).

const SC = Object.fromEntries(TL.scenes.map(s => [s.id, s]));
const TAGS = { max: { text: 'МАКС', color: '#ff9a4a' }, echo: { text: 'ЭХО', color: '#5fe0ff' } };
// ключевые моменты (те же формулы в audio/mars01_audio.py)
const EV = {
  boom: SC.crash.lines[0].end - .55,
  launch: SC.earth.start + 1.2,
};

function say(T, y, size) {
  for (const sc of TL.scenes) for (const l of sc.lines) {
    if (!l.text) continue;
    caption(l.text, T, l.start - .05, Math.min(l.end + .3, sc.end - .05), y, { tag: TAGS[l.who], size: size || 54 });
  }
}
function talking(T, who) { return TL.scenes.some(s => s.lines.some(l => l.who === who && T > l.start && T < l.end)) ? 1 : 0; }
function camera(scale, cx = W / 2, cy = H / 2, sx = 0, sy = 0) { ctx.translate(cx + sx, cy + sy); ctx.scale(scale, scale); ctx.translate(-cx, -cy); }
function shake(t, amt, seed = 1) { return [Math.sin(t * 61 + seed) * amt, Math.cos(t * 47 + seed * 3) * amt]; }

const STARS = (() => { const r = rng(3); return [...Array(220)].map(() => ({ x: r() * W, y: r() * H, s: .5 + r() * 2.2, p: r() * 6 })); })();
function stars(t, a = 1) { STARS.forEach(s => { ctx.globalAlpha = a * (.35 + .65 * Math.abs(Math.sin(t * 1.3 + s.p))); ctx.fillStyle = '#eef2ff'; ellipse(s.x, s.y, s.s, s.s); }); ctx.globalAlpha = 1; }
const CRATERS = (() => { const r = rng(17); return [...Array(26)].map(() => ({ u: r() * Math.PI * 2, v: (r() - .5) * 1.6, s: .03 + r() * .09 })); })();
function mars(x, y, R, rot) {
  ctx.save(); glow(x, y, R * 1.35, 'rgba(255,120,60,.28)');
  ctx.beginPath(); ctx.arc(x, y, R, 0, Math.PI * 2); ctx.clip();
  const g = ctx.createRadialGradient(x - R * .35, y - R * .35, R * .1, x, y, R); g.addColorStop(0, '#e8855a'); g.addColorStop(.6, '#b8522c'); g.addColorStop(1, '#5a1f10');
  ctx.fillStyle = g; ctx.fillRect(x - R, y - R, R * 2, R * 2);
  for (const c of CRATERS) {
    const lon = c.u + rot; if (Math.cos(lon) < 0) continue;
    const cx = x + Math.sin(lon) * Math.cos(c.v) * R, cy = y + Math.sin(c.v) * R, k = Math.cos(lon);
    ctx.fillStyle = 'rgba(90,30,15,.35)'; ellipse(cx, cy, c.s * R * k, c.s * R);
    ctx.fillStyle = 'rgba(255,190,150,.12)'; ellipse(cx - c.s * R * .2 * k, cy - c.s * R * .2, c.s * R * .6 * k, c.s * R * .6);
  }
  ctx.fillStyle = 'rgba(120,40,20,.35)'; ctx.beginPath(); ctx.ellipse(x + Math.sin(rot) * R * .3, y + R * .05, R * .7, R * .08, -.1, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,245,240,.85)'; ellipse(x, y - R * .97, R * .35, R * .09);
  const sh = ctx.createLinearGradient(x - R, y - R, x + R, y + R); sh.addColorStop(.55, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.75)');
  ctx.fillStyle = sh; ctx.fillRect(x - R, y - R, R * 2, R * 2); ctx.restore();
}
function hudChip(text, x, y, t, a, color = '#5fe0ff', size = 34) {
  const p = prog(t, a, a + .3); if (p <= 0) return;
  ctx.save(); ctx.globalAlpha = p; ctx.font = `800 ${size}px Montserrat`; ctx.textBaseline = 'middle';
  const w = ctx.measureText(text).width + 44; ctx.translate(x + (1 - easeOut(p)) * -40, y);
  ctx.fillStyle = 'rgba(6,12,20,.78)'; rr(0, -size * .9, w, size * 1.8, 12);
  ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); ctx.roundRect(0, -size * .9, w, size * 1.8, 12); ctx.stroke();
  ctx.fillStyle = color; ctx.fillText(text, 22, 2); ctx.restore();
}
function solHud(T) { hudChip('СОЛ 1', 60, 210, T, SC.wake.start + .6, '#ffb36b', 30); hudChip('O2: 14 СОЛОВ', 230, 210, T, SC.oxygen.lines[0].start + 1.5, '#ff5a5a', 30); }

// ---------- 1. Орбита ----------
function orbit(lt, d, T) {
  camera(1 + lt * .02, W / 2, 1300);
  ctx.fillStyle = '#03040a'; ctx.fillRect(0, 0, W, H); stars(T);
  mars(540, 1560, 760, lt * .05);
  ctx.setTransform(1, 0, 0, 1, 0, 0); say(T, 330, 58);
}

// ---------- 2. Умирающая Земля, старт ракеты ----------
const SKY = (() => { const r = rng(8); return [...Array(30)].map(() => ({ x: r() * W, w: 40 + r() * 90, h: 160 + r() * 420 })); })();
function earth(lt, d, T) {
  const ls = T - EV.launch; const [sx, sy] = ls > 0 && ls < 2.5 ? shake(lt, 6 * (1 - ls / 2.5)) : [0, 0];
  camera(1.03, W / 2, H / 2, sx, sy);
  ctx.fillStyle = vgrad(0, 1400, ['#2a0f08', '#7a2c10', '#d0662a']); ctx.fillRect(-50, -50, W + 100, 1500);
  glow(700, 980, 380, 'rgba(255,90,40,.5)'); ctx.fillStyle = '#ff6a35'; ellipse(700, 980, 150, 150);
  ctx.fillStyle = 'rgba(80,30,15,.55)'; for (let i = 0; i < 5; i++) rr(((i * 260 + lt * 20) % 1400) - 200, 820 + i * 60, 520, 40, 20);
  ctx.fillStyle = '#2a120b'; SKY.forEach(b => { ctx.fillRect(b.x - b.w / 2, 1300 - b.h, b.w, b.h); });
  ctx.fillStyle = 'rgba(255,200,120,.25)'; SKY.forEach((b, i) => { if (i % 3 === 0) ctx.fillRect(b.x - 4, 1300 - b.h + 30, 8, 8); });
  ctx.fillStyle = vgrad(1290, H, ['#5a2c18', '#2a140b']); ctx.fillRect(-50, 1290, W + 100, H);
  ctx.strokeStyle = 'rgba(20,8,4,.7)'; ctx.lineWidth = 4; const r = rng(4);
  for (let i = 0; i < 18; i++) { let x = r() * W, y = 1330 + r() * 560; ctx.beginPath(); ctx.moveTo(x, y); for (let k = 0; k < 5; k++) { x += (r() - .5) * 140; y += (r() - .3) * 50; ctx.lineTo(x, y); } ctx.stroke(); }
  // ракета
  const ry = ls < 0 ? 1300 : 1300 - easeIn(clamp(ls / 4.5)) * 1900;
  if (ls > 0) for (let i = 30; i > 0; i--) { const yy = ry + 120 + i * 26; ctx.fillStyle = `rgba(200,180,170,${.35 * (1 - i / 30)})`; ellipse(860 + Math.sin(i + lt) * 10, Math.min(yy, 1300), 30 + i * 3.5, 30 + i * 3.5); }
  ctx.save(); ctx.translate(860, ry);
  if (ls > 0) { glow(0, 140, 160, 'rgba(255,190,90,1)'); ctx.fillStyle = '#fff1b0'; poly([-18, 110, 18, 110, 0, 200 + Math.sin(lt * 50) * 20]); }
  ctx.fillStyle = '#e9ecf2'; rr(-28, -120, 56, 230, 10); poly([-28, -120, 28, -120, 0, -190]);
  ctx.fillStyle = '#ef6a2a'; rr(-28, -40, 56, 18, 2); poly([-28, 60, -60, 120, -28, 110]); poly([28, 60, 60, 120, 28, 110]);
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0); say(T, 330);
}

// ---------- 3. Взрыв корабля ----------
function ship(x, y, t, broken) {
  ctx.save(); ctx.translate(x, y); ctx.rotate(-.12 + (broken ? t * .4 : 0));
  ctx.fillStyle = '#2b3a5a'; rr(-330, -110, 170, 70, 6); rr(-330, 40, 170, 70, 6);
  ctx.strokeStyle = '#6a7fa8'; ctx.lineWidth = 2; for (let i = 1; i < 6; i++) { ctx.beginPath(); ctx.moveTo(-330 + i * 28, -110); ctx.lineTo(-330 + i * 28, -40); ctx.moveTo(-330 + i * 28, 40); ctx.lineTo(-330 + i * 28, 110); ctx.stroke(); }
  ctx.fillStyle = '#c9ced8'; rr(-260, -12, 120, 24, 4);
  ctx.fillStyle = '#e6e9ef'; rr(-150, -38, 360, 76, 30); poly([210, -38, 290, 0, 210, 38]);
  ctx.strokeStyle = '#b8bfcc'; ctx.lineWidth = 16; ctx.beginPath(); ctx.ellipse(10, 0, 40, 120, 0, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ef6a2a'; rr(60, -38, 14, 76, 2);
  ctx.fillStyle = '#26324a'; for (let i = 0; i < 5; i++) ellipse(110 + i * 22, -8, 6, 6);
  ctx.fillStyle = '#1b2233'; ctx.font = '800 22px Montserrat'; ctx.fillText('НАДЕЖДА', -120, 30);
  ctx.restore();
}
function crash(lt, d, T) {
  const b = T - EV.boom;
  const [sx, sy] = b > 0 && b < 1.2 ? shake(lt, 20 * (1 - b / 1.2)) : [0, 0];
  camera(1 + lt * .015, W / 2, 800, sx, sy);
  ctx.fillStyle = '#03040a'; ctx.fillRect(-50, -50, W + 100, H + 100); stars(T);
  mars(150, 1650, 520, T * .05);
  if (b < 0) ship(560 - lt * 25, 760, lt, false);
  else {
    const k = clamp(b / 3);
    ctx.save(); ctx.globalAlpha = 1 - k;
    [[-1, -.6], [1.2, .3], [-.4, 1], [.7, -1]].forEach(([vx, vy], i) => { ctx.save(); ctx.translate(560 + vx * b * 160, 760 + vy * b * 160); ctx.rotate(b * (i + 1)); ctx.fillStyle = i % 2 ? '#e6e9ef' : '#2b3a5a'; rr(-60, -20, 120, 40, 6); ctx.restore(); });
    ctx.restore();
    glow(560, 760, 700 * (1 - k * .6), 'rgba(255,150,60,1)', 1 - k);
    ctx.fillStyle = `rgba(255,240,200,${1 - clamp(b / .5)})`; ellipse(560, 760, 120 + b * 400, 120 + b * 400);
    // капсула летит к Марсу
    const cx = 560 - b * 120, cy = 760 + b * 170;
    ctx.save(); ctx.translate(cx, cy); ctx.rotate(2.4);
    ctx.fillStyle = '#e6e9ef'; poly([-30, -40, 30, -40, 45, 40, -45, 40]); ctx.fillStyle = '#ef6a2a'; rr(-45, 34, 90, 12, 3);
    ctx.fillStyle = '#26324a'; ellipse(0, -5, 12, 12); glow(0, 60, 70, 'rgba(120,200,255,.9)');
    ctx.restore();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  flash(b > 0 ? .8 * (1 - clamp(b / .35)) : 0, '255,220,170');
  say(T, 330);
}

// ---------- 4. Титул ----------
const DUST = (() => { const r = rng(12); return [...Array(120)].map(() => ({ x: r() * W, y: r() * H, s: 1 + r() * 3, v: 40 + r() * 120 })); })();
function title(lt) {
  ctx.fillStyle = vgrad(0, H, ['#0a0403', '#2a0e06', '#0a0403']); ctx.fillRect(0, 0, W, H);
  DUST.forEach(p => { ctx.fillStyle = 'rgba(255,150,90,.5)'; ellipse((p.x + lt * p.v) % W, p.y, p.s, p.s); });
  glow(W / 2, 900, 600, 'rgba(255,110,50,.28)', easeOut(prog(lt, 0, .8)));
  const p = easeOut(prog(lt, .05, .8));
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.translate(W / 2, 880); ctx.scale(1.2 - .2 * p, 1.2 - .2 * p); ctx.globalAlpha = p;
  ctx.font = '800 112px Montserrat'; ctx.letterSpacing = '6px'; ctx.shadowColor = 'rgba(255,100,40,.6)'; ctx.shadowBlur = 30;
  ctx.fillStyle = '#f2ece4'; ctx.fillText('ПОСЛЕДНИЙ', 0, -70);
  const g = ctx.createLinearGradient(-300, 0, 300, 0); g.addColorStop(0, '#ff7a3a'); g.addColorStop(1, '#ffb36b'); ctx.fillStyle = g; ctx.fillText('НА МАРСЕ', 0, 60);
  ctx.restore();
  ctx.globalAlpha = prog(lt, .7, 1.2); ctx.textAlign = 'center'; ctx.fillStyle = '#d9cfc4'; ctx.font = '600 40px Montserrat'; ctx.letterSpacing = '10px';
  ctx.fillText('СЕРИЯ 1 · ОДИН', W / 2, 1060); ctx.letterSpacing = '0px'; ctx.globalAlpha = 1;
}

// ---------- 5. Пробуждение на базе ----------
function baseRoom(t, alarm) {
  ctx.fillStyle = vgrad(0, H, ['#1b2029', '#2a313d', '#171b22']); ctx.fillRect(-50, -50, W + 100, H + 100);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 18; for (const x of [120, 960]) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.quadraticCurveTo(x + (x < 500 ? -80 : 80), 900, x, 1800); ctx.stroke(); }
  ctx.fillStyle = '#323a48'; rr(0, 1500, W, 420, 0); ctx.fillStyle = '#262c37'; for (let x = 0; x < W; x += 120) rr(x + 4, 1510, 112, 30, 4);
  ctx.fillStyle = '#11161e'; rr(150, 300, 300, 200, 14); ctx.fillStyle = '#0f3a44'; rr(166, 316, 268, 168, 8);
  ctx.strokeStyle = '#5fe0ff'; ctx.lineWidth = 3; ctx.beginPath(); for (let x = 0; x < 260; x += 6) ctx.lineTo(170 + x, 420 + Math.sin(x * .08 + t * 4) * 20 * Math.sin(x * .02)); ctx.stroke();
  ctx.fillStyle = '#3a4252'; rr(120, 1180, 420, 70, 14); ctx.fillStyle = '#4a6a8a'; rr(130, 1150, 400, 40, 14);
  if (alarm) {
    const a = .5 + .5 * Math.sin(t * 6);
    ctx.fillStyle = `rgba(255,40,40,${.12 * a})`; ctx.fillRect(-50, -50, W + 100, H + 100);
    ctx.fillStyle = '#5a1010'; rr(500, 120, 80, 40, 10); glow(540, 140, 260, `rgba(255,40,40,${.7 * a})`);
  }
}
function wake(lt, d, T) {
  camera(1.02 + lt * .008, W / 2, 900);
  baseRoom(T, true);
  echoEye(790, 760, 110, T, talking(T, 'echo'));
  hudChip('СВЯЗЬ С ЗЕМЛЁЙ: НЕТ', 520, 1040, T, SC.wake.lines[1].start, '#ff5a5a', 32);
  person(as('max', { x: 360, y: 1640, s: 1.08, mood: lt < 2 ? 'shock' : 'sad', look: .8, lookY: -.5 }));
  ctx.setTransform(1, 0, 0, 1, 0, 0); solHud(T); say(T, 1440);
}

// ---------- 6. Вид наружу + научные факты ----------
const ROCKS = (() => { const r = rng(31); return [...Array(30)].map(() => ({ x: r() * 900 + 90, y: 1000 + r() * 300, s: 8 + r() * 30 })); })();
function marsSurface(t, x0, y0, w, h) {
  ctx.fillStyle = vgrad(y0, y0 + h * .55, ['#c98a5a', '#e2a86f', '#f0c08a']); ctx.fillRect(x0, y0, w, h);
  glow(x0 + w * .7, y0 + h * .2, 160, 'rgba(200,220,255,.5)'); ctx.fillStyle = '#eef4ff'; ellipse(x0 + w * .7, y0 + h * .2, 22, 22);
  ctx.fillStyle = '#9a4a2a'; ctx.beginPath(); ctx.moveTo(x0, y0 + h * .55); for (let x = 0; x <= w; x += 40) ctx.lineTo(x0 + x, y0 + h * .5 - Math.abs(Math.sin(x * .011)) * 120 - Math.sin(x * .03) * 20); ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0, y0 + h); ctx.fill();
  ctx.fillStyle = '#b75c33'; ctx.beginPath(); ctx.moveTo(x0, y0 + h * .68); for (let x = 0; x <= w; x += 40) ctx.lineTo(x0 + x, y0 + h * .64 + Math.sin(x * .008 + 1) * 40); ctx.lineTo(x0 + w, y0 + h); ctx.lineTo(x0, y0 + h); ctx.fill();
  ctx.fillStyle = '#7a3418'; ROCKS.forEach(r => ellipse(r.x, r.y, r.s, r.s * .55));
  ctx.fillStyle = 'rgba(240,170,110,.25)'; for (let i = 0; i < 40; i++) ellipse(((i * 97 + t * 160) % (w + 200)) + x0 - 100, y0 + h * .55 + (i * 37) % (h * .4), 40, 3);
}
function outside(lt, d, T) {
  camera(1 + lt * .01, W / 2, 850);
  baseRoom(T, false);
  ctx.save(); ctx.beginPath(); ctx.arc(540, 860, 400, 0, Math.PI * 2); ctx.clip(); marsSurface(T, 140, 460, 800, 800); ctx.restore();
  ctx.strokeStyle = '#4a5466'; ctx.lineWidth = 40; ctx.beginPath(); ctx.arc(540, 860, 420, 0, Math.PI * 2); ctx.stroke();
  ctx.strokeStyle = '#11151c'; ctx.lineWidth = 6; ctx.beginPath(); ctx.arc(540, 860, 402, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#6a7486'; for (let i = 0; i < 12; i++) { const a = i * Math.PI / 6; ellipse(540 + Math.cos(a) * 420, 860 + Math.sin(a) * 420, 8, 8); }
  ctx.fillStyle = 'rgba(255,255,255,.08)'; ctx.beginPath(); ctx.ellipse(400, 660, 140, 60, -.6, 0, Math.PI * 2); ctx.fill();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const l = SC.outside.lines;
  hudChip('−63 °C  средняя температура', 60, 1360, T, l[0].start + .5, '#5fe0ff');
  hudChip('95% CO2 в атмосфере', 60, 1450, T, l[0].start + 2.6, '#ffb36b');
  hudChip('Давление: 0,6% от земного', 60, 1540, T, l[1].start + .2, '#ff5a5a');
  solHud(T); say(T, 380);
}

// ---------- 7. Кислород и сол ----------
function oxygen(lt, d, T) {
  baseRoom(T, true);
  const l = SC.oxygen.lines, sw = easeInOut(prog(T, l[1].start - .2, l[1].start + .6));
  ctx.save(); ctx.translate(0, -sw * 330);
  const cx = 540, cy = 760, R = 270, frac = lerp(1, 14 / 60, easeOut(prog(lt, .5, 3)));
  ctx.fillStyle = 'rgba(6,10,16,.85)'; ellipse(cx, cy, R + 50, R + 50);
  ctx.strokeStyle = '#2a313d'; ctx.lineWidth = 46; ctx.beginPath(); ctx.arc(cx, cy, R, 0, Math.PI * 2); ctx.stroke();
  const col = frac < .4 ? '#ff4a4a' : '#5fe0ff';
  ctx.strokeStyle = col; ctx.lineCap = 'round'; ctx.beginPath(); ctx.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * frac); ctx.stroke(); ctx.lineCap = 'butt';
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = '#fff'; ctx.font = '800 70px Montserrat'; ctx.fillText('O2', cx, cy - 90);
  ctx.fillStyle = col; ctx.font = '800 150px Montserrat'; ctx.fillText(String(Math.round(frac * 60)), cx, cy + 20);
  ctx.font = '800 44px Montserrat'; ctx.fillText('СОЛОВ', cx, cy + 120);
  ctx.restore();
  if (sw > 0) {
    ctx.save(); ctx.globalAlpha = sw;
    const clock = (x, label, hours, mins, color) => {
      ctx.fillStyle = 'rgba(6,10,16,.88)'; ellipse(x, 1000, 170, 170);
      ctx.strokeStyle = color; ctx.lineWidth = 10; ctx.beginPath(); ctx.arc(x, 1000, 150, 0, Math.PI * 2); ctx.stroke();
      const a = (T * 1.2) % (Math.PI * 2); ctx.lineWidth = 8; ctx.beginPath(); ctx.moveTo(x, 1000); ctx.lineTo(x + Math.sin(a) * 110, 1000 - Math.cos(a) * 110); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.font = '800 54px Montserrat'; ctx.fillText(`${hours}:${mins}`, x, 1000 + 230);
      ctx.fillStyle = color; ctx.font = '800 36px Montserrat'; ctx.fillText(label, x, 1000 - 220);
    };
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    clock(290, 'ЗЕМЛЯ', '24', '00', '#5fa8ff'); clock(790, 'МАРС', '24', '39', '#ff8a4a');
    ctx.restore();
  }
  solHud(T); say(T, 1470);
}

// ---------- 8. Обломки в 6 км ----------
function dome(x, y, r) {
  ctx.fillStyle = '#d7dbe2'; ctx.beginPath(); ctx.ellipse(x, y, r, r * .8, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.18)'; ctx.beginPath(); ctx.ellipse(x + r * .3, y, r * .7, r * .8, 0, Math.PI * 1.5, 0); ctx.fill();
  ctx.fillStyle = '#5fe0ff'; rr(x - r * .3, y - r * .45, r * .6, r * .16, 4);
}
function wreck(lt, d, T) {
  camera(1 + lt * .012, W / 2, 1000);
  ctx.fillStyle = '#000'; ctx.fillRect(-50, -50, W + 100, H + 100);
  marsSurface(T, -50, -150, W + 100, 2250);
  for (let i = 0; i < 26; i++) { const k = i / 26, a = .5 * (1 - k); ctx.fillStyle = `rgba(60,40,35,${a})`; ellipse(860 + Math.sin(T * .8 + i) * 18 * k + k * 160, 1000 - i * 30, 30 + i * 6, 30 + i * 6); }
  glow(860, 1030, 120, 'rgba(255,140,60,.8)'); ctx.fillStyle = '#e6e9ef'; poly([820, 1040, 880, 1015, 905, 1045]);
  ctx.save(); ctx.fillStyle = 'rgba(0,0,0,.15)'; ctx.fillRect(-50, 1350, W + 100, 700); ctx.restore();
  dome(230, 1560, 150); dome(450, 1580, 100); ctx.fillStyle = '#c4c9d2'; rr(300, 1520, 90, 40, 6);
  ctx.strokeStyle = '#2c3340'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(140, 1440); ctx.lineTo(140, 1340); ctx.stroke(); ctx.fillStyle = '#e6e9ef'; ctx.beginPath(); ctx.ellipse(140, 1330, 40, 18, -.4, 0, Math.PI); ctx.fill();
  const p = easeInOut(prog(lt, .6, 2.2));
  ctx.setLineDash([18, 14]); ctx.strokeStyle = '#ffd23f'; ctx.lineWidth = 6; ctx.beginPath(); ctx.moveTo(300, 1480); ctx.lineTo(lerp(300, 840, p), lerp(1480, 1060, p)); ctx.stroke(); ctx.setLineDash([]);
  if (p > .5) nameTag('6 км', 600, 1210, lt, 1.4);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const l = SC.wreck.lines[0];
  hudChip('Баллоны с O2', 60, 1420, T, l.start + 3.2, '#5fe0ff');
  hudChip('Бортовой самописец', 60, 1510, T, l.start + 4.6, '#ffb36b');
  solHud(T); say(T, 470);
}

// ---------- 9. Сбой ЭХО ----------
function glitch(lt, d, T) {
  const l = SC.glitch.lines, red = T > l[1].start - .1, g = red ? Math.max(0, Math.sin(T * 30)) : 0;
  baseRoom(T, red);
  ctx.save(); camera(1 + lt * .03, W / 2, 800); echoEye(540, 800, 260, T, talking(T, 'echo'), red); ctx.restore();
  if (red) {
    const r = rng(Math.floor(T * 20));
    for (let i = 0; i < 7; i++) { const y = r() * 1500 + 100, h = 10 + r() * 60; const dx = (r() - .5) * 120; ctx.drawImage(cv, 0, y, W, h, dx, y, W, h); }
    ctx.fillStyle = `rgba(255,0,60,${.12 + .1 * g})`; ctx.fillRect(0, 0, W, H);
    if (Math.floor(T * 8) % 4 !== 0) {
      ctx.textAlign = 'center'; ctx.font = '800 40px Montserrat'; ctx.fillStyle = '#ff5a5a';
      ctx.fillText('ФАЙЛ УДАЛЁН', W / 2, 1180); ctx.font = '600 32px Montserrat'; ctx.fillText('ЗАПИСЬ: 06:00 ДО ВЗРЫВА', W / 2, 1235);
    }
  }
  solHud(T); say(T, 1450);
}

// ---------- 10. Выбор ----------
function choice(lt, d, T) {
  baseRoom(T, false);
  const look = lt < 1.6 ? .6 : Math.sin((lt - 1.6) * 1.6) > 0 ? -1 : 1;
  person(as('max', { x: 540, y: 1700, s: 1.95, mood: lt > 6 ? 'determined' : 'sad', look, shadow: false }));
  ctx.fillStyle = vgrad(640, 980, ['rgba(5,6,10,0)', 'rgba(5,6,10,.92)']); ctx.fillRect(0, 640, W, 340); ctx.fillStyle = 'rgba(5,6,10,.92)'; ctx.fillRect(0, 980, W, H);
  const hp = easeOut(prog(lt, .1, .5));
  ctx.save(); ctx.globalAlpha = hp; ctx.textAlign = 'center'; ctx.font = '800 64px Montserrat'; ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 16;
  ctx.fillStyle = '#fff'; ctx.fillText('ЧТО ДЕЛАТЬ', W / 2, 300); ctx.fillStyle = '#ff9a4a'; ctx.fillText('МАКСУ?', W / 2, 375); ctx.restore();
  const pa = lt > 2.4 ? Math.max(0, Math.sin(lt * 3)) : 0, pb = lt > 2.4 ? Math.max(0, -Math.sin(lt * 3)) : 0;
  choiceCard('A', 'ЧИНИТЬ', 'генератор: добывать O2\nиз марсианского CO2', 860, '#3e7bfa', lt, .8, pa);
  choiceCard('B', 'ИДТИ', 'к обломкам за 6 км:\nбаллоны и самописец', 1110, '#ef6a2a', lt, 1.2, pb);
  const fp = easeOut(prog(lt, 2, 2.5));
  ctx.save(); ctx.globalAlpha = fp; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '800 46px Montserrat';
  ctx.fillText('Пиши A или B в комментариях', W / 2, 1410);
  ctx.font = '600 34px Montserrat'; ctx.fillStyle = '#b9bccb'; ctx.fillText('Большинство решит судьбу Макса в серии 2', W / 2, 1470); ctx.restore();
  solHud(T);
}

const DRAW = { orbit, earth, crash, title, wake, outside, oxygen, wreck, glitch, choice };
runTimeline(TL.scenes.map((s, i) => ({
  start: s.start, end: s.end, draw: DRAW[s.id],
  fadeIn: i === 0 ? .4 : s.id === 'glitch' ? .05 : .2, fadeOut: s.id === 'choice' ? .6 : s.id === 'wake' ? .2 : .15,
})), TL.total);
