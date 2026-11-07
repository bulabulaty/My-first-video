// «НАСЛЕДНИК» — Часть 1. «Завещание». 47 секунд, 1080x1920.
// Таймлайн согласован с audio/ep01_audio.py (те же секунды).

// ---------- предрасчёт ----------
const STARS = (() => { const r = rng(3); return [...Array(140)].map(() => ({ x: r() * W, y: r() * 1250, s: .6 + r() * 2.2, p: r() * 6 })); })();
const BOLT = (() => { const r = rng(11); const pts = [[330, -20]]; let x = 330, y = -20; while (y < 820) { y += 50 + r() * 70; x += (r() - .5) * 140; pts.push([x, y]); } return pts; })();
const CITY = (() => { const r = rng(5); return [...Array(90)].map(() => ({ x: r() * 480, y: 330 + r() * 260, w: 4 + r() * 8, c: r() < .7 ? '#ffd27a' : '#9fd0ff', b: r() })); })();
const BOOKS = (() => { const r = rng(9); const cols = ['#5b2a2a', '#2f4a3a', '#2b3550', '#6b5530', '#40303f', '#7a3b22']; return [...Array(36)].map(() => ({ w: 18 + r() * 14, h: 90 + r() * 40, c: cols[Math.floor(r() * cols.length)] })); })();

function camera(scale, cx = W / 2, cy = H / 2, sx = 0, sy = 0) { ctx.translate(cx + sx, cy + sy); ctx.scale(scale, scale); ctx.translate(-cx, -cy); }
function shake(t, amt, seed = 1) { return [Math.sin(t * 61 + seed) * amt, Math.cos(t * 47 + seed * 3) * amt]; }

// ---------- СЦЕНА 1: кладбище, дождь ----------
function cemetery(lt) {
  camera(1 + lt * .012, 600, 1100);
  ctx.fillStyle = vgrad(0, 1300, ['#070a14', '#121a2e', '#26324d']); ctx.fillRect(0, 0, W, H);
  glow(800, 330, 260, 'rgba(170,190,255,.35)'); ctx.fillStyle = '#dfe6ff'; ellipse(800, 330, 62, 62);
  ctx.fillStyle = 'rgba(14,18,32,.85)';
  for (let i = 0; i < 7; i++) ellipse(((i * 230 + lt * 18) % 1500) - 200, 230 + (i % 3) * 70, 260, 70);
  const lf = lt > 4.15 && lt < 4.75;
  if (lf && (lt < 4.3 || (lt > 4.42 && lt < 4.55))) {
    ctx.strokeStyle = '#eef3ff'; ctx.lineWidth = 7; ctx.shadowColor = '#9bb6ff'; ctx.shadowBlur = 40;
    ctx.beginPath(); BOLT.forEach(([x, y], i) => i ? ctx.lineTo(x, y) : ctx.moveTo(x, y)); ctx.stroke(); ctx.shadowBlur = 0;
  }
  ctx.fillStyle = '#0d1322'; ctx.beginPath(); ctx.moveTo(0, 1180);
  for (let x = 0; x <= W; x += 60) ctx.lineTo(x, 1170 + Math.sin(x * .006) * 40); ctx.lineTo(W, H); ctx.lineTo(0, H); ctx.fill();
  ctx.fillStyle = '#0a0f1b';
  [[120, 1180], [210, 1170], [430, 1150], [690, 1160], [930, 1185], [1010, 1170]].forEach(([x, y], i) => {
    if (i % 2) { rr(x - 8, y - 70, 16, 90, 3); rr(x - 30, y - 50, 60, 14, 3); } else { rr(x - 28, y - 60, 56, 80, 26); }
  });
  ctx.strokeStyle = '#05070d'; ctx.lineCap = 'round';
  tree(70, 1240, 230, -Math.PI / 2 - .08, 7, rng(21), 26);
  tree(1010, 1230, 200, -Math.PI / 2 + .1, 7, rng(42), 22);
  ctx.fillStyle = vgrad(1050, 1400, ['rgba(120,140,190,0)', 'rgba(120,140,190,.22)', 'rgba(120,140,190,0)']); ctx.fillRect(0, 1050, W, 350);
  ctx.fillStyle = vgrad(1350, H, ['#0b0f1a', '#05070c']); ctx.fillRect(0, 1350, W, H);
  person(as('lev', { x: 640, y: 1600, s: 1.05, arms: 'umbrella', mood: 'sad', closed: lt < 3.6, look: -.4, lookY: 1, tilt: -.05 }));
  // надгробие
  ctx.save(); ctx.translate(300, 1690);
  ctx.fillStyle = 'rgba(0,0,0,.4)'; ellipse(0, 0, 190, 26);
  ctx.fillStyle = '#4b5366'; ctx.beginPath(); ctx.moveTo(-150, 0); ctx.lineTo(-150, -300); ctx.quadraticCurveTo(-150, -400, 0, -400); ctx.quadraticCurveTo(150, -400, 150, -300); ctx.lineTo(150, 0); ctx.fill();
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(60, -360, 90, 360);
  ctx.fillStyle = '#c9cfdc'; ctx.textAlign = 'center'; ctx.font = '900 46px "Playfair Display"'; ctx.fillText('СЕВЕРОВЫ', 0, -280);
  ctx.font = '600 28px Montserrat'; ctx.fillText('Андрей  ·  Елена', 0, -220); ctx.fillText('— 2026 —', 0, -175);
  [[-90, -12], [-60, -26], [-30, -10], [70, -16], [100, -6]].forEach(([x, y]) => { ctx.fillStyle = '#2d5a2a'; rr(x - 3, y, 6, 30, 3); ctx.fillStyle = '#b3172a'; ellipse(x, y, 16, 14); ctx.fillStyle = '#e0303f'; ellipse(x - 3, y - 3, 7, 6); });
  ctx.restore();
  rain(lt, 1);
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  const fl = lt > 4.15 ? Math.max(0, .8 - (lt - 4.15) * 2.2) * (lt < 4.35 || lt > 4.42 ? 1 : .2) : 0;
  flash(fl, '220,230,255');
  caption('Мне 19. Вчера я стал *наследником* миллиарда.', lt, .3, 3.9, 330);
  caption('А сегодня узнал: моих родителей *убили.*', lt, 4.3, 7.4, 330);
}

// ---------- СЦЕНА 2: титул ----------
function titleCard(lt) {
  ctx.fillStyle = vgrad(0, H, ['#05060b', '#120f0a', '#05060b']); ctx.fillRect(0, 0, W, H);
  glow(W / 2, 900, 520, 'rgba(255,190,90,.22)', easeOut(prog(lt, 0, .8)));
  rain(lt + 9, .45);
  const p = easeOut(prog(lt, .05, .9));
  ctx.save(); ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.translate(W / 2, 880); ctx.scale(1.25 - .25 * p, 1.25 - .25 * p); ctx.globalAlpha = p;
  const g = ctx.createLinearGradient(-400, -60, 400, 60); g.addColorStop(0, '#b8862e'); g.addColorStop(.5, '#ffe7a3'); g.addColorStop(1, '#a8741f');
  ctx.font = '900 128px "Playfair Display"'; ctx.letterSpacing = `${Math.round(lerp(40, 8, p))}px`;
  ctx.shadowColor = 'rgba(255,190,80,.5)'; ctx.shadowBlur = 30; ctx.fillStyle = g; ctx.fillText('НАСЛЕДНИК', 0, 0);
  ctx.restore();
  const lp = easeInOut(prog(lt, .5, 1.3));
  ctx.fillStyle = '#d6a64a'; ctx.fillRect(W / 2 - 330 * lp, 975, 660 * lp, 3);
  ctx.globalAlpha = prog(lt, .8, 1.3); ctx.fillStyle = '#e8e2d2'; ctx.textAlign = 'center';
  ctx.font = '600 40px Montserrat'; ctx.letterSpacing = '10px'; ctx.fillText('ЧАСТЬ 1 · ЗАВЕЩАНИЕ', W / 2, 1040);
  ctx.letterSpacing = '0px'; ctx.globalAlpha = 1;
}

// ---------- СЦЕНА 3: самолёт над морем ----------
function jetPos(t) {
  if (t < 2.6) return { x: lerp(-260, 560, t / 2.6), y: 640 + Math.sin(t * 2) * 8, a: 0 };
  const k = easeIn(prog(t, 2.6, 4.6));
  return { x: lerp(560, 860, prog(t, 2.6, 4.6)), y: lerp(640, 1330, k), a: lerp(0, .75, easeOut(prog(t, 2.6, 4.2))) };
}
function jet(p, t) {
  ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a);
  ctx.fillStyle = '#3a4152'; poly([-20, 0, 60, 70, 90, 70, 40, 0]);
  ctx.fillStyle = '#d9dee8'; ctx.beginPath(); ctx.ellipse(0, 0, 150, 26, 0, 0, Math.PI * 2); ctx.fill();
  poly([110, -10, 170, 0, 110, 14]);
  ctx.fillStyle = '#9aa3b5'; poly([-120, -10, -165, -90, -135, -90, -90, -14]);
  ctx.fillStyle = '#5b6375'; ellipse(-70, -26, 36, 12);
  ctx.fillStyle = '#2c3446'; for (let i = 0; i < 6; i++) ellipse(-30 + i * 22, -6, 6, 6);
  ctx.fillStyle = '#4a5266'; poly([-30, 6, 50, 6, 90, 40, 60, 40]);
  if (Math.floor(t * 3) % 2 === 0) { glow(-160, -88, 30, 'rgba(255,60,60,1)'); }
  if (t > 2.6) {
    const f = 1 + Math.sin(t * 40) * .2;
    glow(-70, -26, 120 * f, 'rgba(255,140,40,.9)'); ctx.fillStyle = '#ffd36b'; ellipse(-80, -26, 28 * f, 14 * f);
  }
  ctx.restore();
}
function sea(lt) {
  ctx.fillStyle = vgrad(0, 1300, ['#03040b', '#0b1530', '#1d2a52']); ctx.fillRect(0, 0, W, 1310);
  STARS.forEach(s => { ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(lt * 1.5 + s.p)); ctx.fillStyle = '#e8eeff'; ellipse(s.x, s.y, s.s, s.s); });
  ctx.globalAlpha = 1; glow(240, 300, 200, 'rgba(180,200,255,.3)'); ctx.fillStyle = '#e9eeff'; ellipse(240, 300, 50, 50);
  ctx.fillStyle = vgrad(1300, H, ['#0e1a33', '#050912']); ctx.fillRect(0, 1300, W, H);
  ctx.strokeStyle = 'rgba(150,180,255,.18)'; ctx.lineWidth = 3;
  for (let i = 0; i < 26; i++) { const y = 1320 + i * i * 1.1, off = (lt * (20 + i * 6) + i * 80) % 200; for (let x = -200 + off; x < W; x += 200) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 60 + i * 2, y); ctx.stroke(); } }
  ctx.fillStyle = 'rgba(220,230,255,.18)'; for (let i = 0; i < 12; i++) rr(240 - 30 + Math.sin(lt * 3 + i) * 12, 1330 + i * 26, 60, 6, 3);
}
function crash(lt) {
  let [sx, sy] = lt > 2.6 && lt < 3.4 ? shake(lt, 14 * (1 - prog(lt, 2.6, 3.4))) : [0, 0];
  if (lt > 4.6 && lt < 5.2) [sx, sy] = shake(lt, 18 * (1 - prog(lt, 4.6, 5.2)), 4);
  camera(1.02 + lt * .01, W / 2, 900, sx, sy);
  sea(lt);
  if (lt > 2.6) for (let i = 40; i > 0; i--) {
    const tt = lt - i * .045; if (tt < 2.6) continue; const p = jetPos(tt);
    ctx.fillStyle = `rgba(60,60,70,${.5 * (1 - i / 40)})`; ellipse(p.x - 60, p.y - 30, 26 + i * 2.2, 26 + i * 2.2);
  }
  if (lt < 4.65) jet(jetPos(lt), lt);
  if (lt > 2.6 && lt < 3.0) glow(jetPos(2.6).x - 70, 610, 420 * (1 - prog(lt, 2.6, 3.0)), 'rgba(255,170,60,1)');
  if (lt > 4.6) {
    const k = prog(lt, 4.6, 6); glow(860, 1330, 500 * (1 - k * .6), 'rgba(255,130,40,.9)', 1 - k);
    ctx.strokeStyle = `rgba(230,240,255,${.8 * (1 - k)})`; ctx.lineWidth = 6; ctx.beginPath(); ctx.ellipse(860, 1340, 80 + k * 420, 14 + k * 60, 0, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = `rgba(230,240,255,${.9 * (1 - k)})`; for (let i = 0; i < 9; i++) { const a = -Math.PI * (i + .5) / 9; ellipse(860 + Math.cos(a) * k * 260, 1330 + Math.sin(a) * k * 360 + k * k * 300, 10, 22); }
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  flash(lt > 2.6 ? .7 * (1 - prog(lt, 2.6, 2.9)) : 0, '255,200,120');
  caption('Их самолёт упал в море.', lt, .5, 3.6, 1560);
  caption('Полиция сказала: *«несчастный случай».*', lt, 3.8, 5.95, 1560);
}

// ---------- СЦЕНА 4: кабинет адвоката ----------
function envelope(sc, rot) {
  ctx.save(); ctx.rotate(rot); ctx.scale(sc, sc);
  ctx.fillStyle = 'rgba(0,0,0,.35)'; rr(-255, -160, 520, 340, 10);
  ctx.fillStyle = '#ece0c3'; rr(-260, -170, 520, 340, 10);
  ctx.strokeStyle = 'rgba(120,90,40,.35)'; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(-260, -170); ctx.lineTo(0, 20); ctx.lineTo(260, -170); ctx.stroke();
  ctx.fillStyle = '#8f1420'; ellipse(0, 20, 46, 46); ctx.fillStyle = '#b51d2b'; ellipse(-4, 16, 36, 36);
  ctx.fillStyle = '#5e0c14'; ctx.font = '900 44px "Playfair Display"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText('С', -3, 18);
  ctx.fillStyle = '#2b2a35'; ctx.font = '700 56px Caveat'; ctx.fillText('Только для Льва', 0, 115);
  ctx.restore();
}
function office(lt) {
  camera(1 + lt * .008, W / 2, 1000);
  ctx.fillStyle = vgrad(0, H, ['#24160f', '#1a0f0a', '#120a07']); ctx.fillRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 3; for (let x = 0; x < W; x += 90) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, 1150); ctx.stroke(); }
  ctx.save(); ctx.beginPath(); ctx.rect(300, 230, 480, 620); ctx.clip();
  ctx.fillStyle = vgrad(230, 850, ['#0a1226', '#16244a']); ctx.fillRect(300, 230, 480, 620);
  CITY.forEach(c => { ctx.fillStyle = c.c; ctx.globalAlpha = .5 + .5 * c.b; rr(300 + c.x, 260 + c.y, c.w, c.w * 1.4, 1); });
  ctx.globalAlpha = 1; rain(lt + 3, .8, .05); ctx.restore();
  ctx.fillStyle = '#3a2418'; rr(286, 216, 508, 14, 3); rr(286, 850, 508, 18, 3); rr(286, 216, 14, 650, 3); rr(780, 216, 14, 650, 3); rr(533, 216, 14, 650, 3); rr(286, 530, 508, 12, 3);
  ctx.fillStyle = '#2c1b12'; rr(-10, 200, 230, 950, 6); rr(860, 200, 230, 950, 6);
  for (let sh = 0; sh < 6; sh++) {
    let x = 4; const y = 340 + sh * 150; ctx.fillStyle = '#1c110b'; ctx.fillRect(0, y, 220, 14); ctx.fillRect(860, y, 220, 14);
    for (let i = 0; i < 6; i++) { const b = BOOKS[(sh * 6 + i) % 36]; ctx.fillStyle = b.c; ctx.fillRect(x, y - b.h, b.w, b.h); ctx.fillRect(1070 - x - b.w, y - b.h, b.w, b.h); x += b.w + 3; }
  }
  glow(760, 1080, 520, 'rgba(255,190,100,.35)');
  person(as('gordeev', { x: 540, y: 1520, s: .95, mood: lt > 3.6 ? 'neutral' : 'sad', look: lt > 3.6 ? 0 : -.6 }));
  ctx.fillStyle = vgrad(1120, 1650, ['#5a3520', '#3b2213', '#2a170c']); rr(130, 1120, 820, 560, 10);
  ctx.fillStyle = '#6e4428'; rr(110, 1105, 860, 34, 8);
  ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 4; ctx.strokeRect(190, 1190, 300, 360); ctx.strokeRect(590, 1190, 300, 360);
  ctx.fillStyle = '#c8a24a'; rr(758, 1000, 8, 105, 3); ctx.fillStyle = '#1f5a3a'; ctx.beginPath(); ctx.moveTo(690, 1010); ctx.lineTo(830, 1010); ctx.lineTo(805, 960); ctx.lineTo(715, 960); ctx.fill(); ctx.fillStyle = '#c8a24a'; rr(730, 1096, 64, 12, 4);
  glow(760, 1030, 200, 'rgba(255,210,130,.55)');
  person(as('viktor', { x: 200, y: 1700, s: 1.0, mood: lt > 3.6 ? 'sly' : 'neutral', look: .7 }));
  person(as('alisa', { x: 880, y: 1720, s: .6, mood: 'sad', look: -.6 }));
  nameTag('Дядя Виктор', 200, 980, lt, .5);
  nameTag('Адвокат Гордеев', 540, 840, lt, 1.0);
  nameTag('Сестра Алиса, 9', 840, 1260, lt, 1.5);
  if (lt > 3.6) {
    const p = easeInOut(prog(lt, 3.8, 6.9));
    ctx.save(); ctx.translate(lerp(540, 540, p), lerp(1100, 980, p)); envelope(lerp(.35, 2.2, p), lerp(-.15, 0.02, p)); ctx.restore();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  caption('На оглашении завещания нас было *четверо.*', lt, .2, 3.5, 300);
  caption('Мне досталось *всё.* И конверт…', lt, 3.7, 6.8, 300);
}

// ---------- СЦЕНА 5: письмо отца ----------
const LETTER = [
  ['Лев,', 0], ['если ты читаешь это —', 0], ['нас убили.', 1], ['Убийца был в той комнате,', 0],
  ['где читали завещание.', 0], ['Не верь никому.', 1], ['Защити Алису.', 0], ['— Папа', 2],
];
function letter(lt) {
  const beat = Math.pow(Math.max(0, Math.sin(lt * Math.PI * 1.5)), 12);
  const [sx, sy] = shake(lt, 2.5);
  camera(1.04 + lt * .012 + beat * .006, W / 2, 800, sx, sy);
  ctx.fillStyle = '#1e120b'; ctx.fillRect(-100, -100, W + 200, H + 200);
  ctx.strokeStyle = 'rgba(0,0,0,.35)'; ctx.lineWidth = 2; for (let y = -100; y < H + 100; y += 26) { ctx.beginPath(); ctx.moveTo(-100, y); ctx.bezierCurveTo(300, y + 10, 700, y - 10, W + 100, y + 4); ctx.stroke(); }
  glow(900, 300, 700, 'rgba(255,170,80,.3)');
  ctx.save(); ctx.translate(540, 800); ctx.rotate(-.035);
  ctx.fillStyle = 'rgba(0,0,0,.5)'; rr(-415, -545, 840, 1110, 6);
  ctx.fillStyle = '#efe5cd'; rr(-430, -560, 840, 1110, 6);
  ctx.strokeStyle = 'rgba(80,110,160,.18)'; ctx.lineWidth = 2; for (let y = -440; y < 520; y += 92) { ctx.beginPath(); ctx.moveTo(-400, y + 30); ctx.lineTo(380, y + 30); ctx.stroke(); }
  ctx.font = '700 72px Caveat'; ctx.textBaseline = 'alphabetic';
  const totalChars = LETTER.reduce((s, l) => s + l[0].length, 0);
  let shown = Math.floor(totalChars * prog(lt, .5, 5.6));
  LETTER.forEach(([txt, kind], i) => {
    const n = Math.min(txt.length, shown); shown -= txt.length; if (n <= 0) return;
    const s = txt.slice(0, n), y = -440 + i * 92 + 20, x = kind === 2 ? 60 : -380;
    ctx.fillStyle = kind === 1 ? '#a3121f' : '#1f2638'; ctx.fillText(s, x, y);
    if (kind === 1 && n === txt.length) { ctx.strokeStyle = '#a3121f'; ctx.lineWidth = 5; ctx.beginPath(); ctx.moveTo(x, y + 14); ctx.quadraticCurveTo(x + 200, y + 6, x + ctx.measureText(s).width + 10, y + 16); ctx.stroke(); }
  });
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.fillStyle = `rgba(120,0,10,${beat * .22})`; ctx.fillRect(0, 0, W, H);
}

// ---------- СЦЕНА 6: дядя и доверенность ----------
function uncle(lt) {
  camera(1 + lt * .02, W / 2, 700);
  ctx.fillStyle = vgrad(0, H, ['#0d0806', '#1b100a', '#0a0605']); ctx.fillRect(0, 0, W, H);
  glow(880, 900, 800, 'rgba(255,160,80,.35)');
  person(as('viktor', { x: 540, y: 2050, s: 2.45, mood: 'sly', look: lt > 4 ? 0 : -.3, shadow: false }));
  ctx.fillStyle = 'rgba(255,150,70,.12)'; ctx.fillRect(540, 0, 540, H);
  sparkle(540 + 21 * 2.45 + 4, 2050 - 562 * 2.45 - 6, 46, lt > 4.1 ? Math.sin(prog(lt, 4.1, 4.9) * Math.PI) : 0);
  const p = easeOut(prog(lt, .6, 1.6));
  ctx.save(); ctx.translate(540, lerp(1950, 1500, p)); ctx.rotate(-.06);
  ctx.fillStyle = 'rgba(0,0,0,.45)'; rr(-345, -205, 700, 520, 6);
  ctx.fillStyle = '#f4f1ea'; rr(-350, -210, 700, 520, 6);
  ctx.fillStyle = '#1b1b24'; ctx.textAlign = 'center'; ctx.font = '800 46px Montserrat'; ctx.fillText('ДОВЕРЕННОСТЬ', 0, -140);
  ctx.font = '600 26px Montserrat'; ctx.fillStyle = '#4b4b57'; ctx.fillText('на управление «Северов Групп»', 0, -96);
  ctx.fillStyle = '#c9c9d2'; for (let i = 0; i < 4; i++) rr(-290, -55 + i * 36, 580 - (i === 3 ? 200 : 0), 12, 6);
  ctx.fillStyle = '#1b1b24'; ctx.textAlign = 'left'; ctx.font = '600 30px Montserrat'; ctx.fillText('Подпись: ____________', -290, 140);
  ctx.save(); ctx.translate(230, 110); ctx.rotate(-.7); ctx.fillStyle = '#d6a64a'; rr(-12, -150, 24, 230, 10); ctx.fillStyle = '#1b1b24'; poly([-12, 80, 12, 80, 0, 112]); ctx.restore();
  ctx.restore();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  caption('— Подпиши, Лёва. Компанией займусь *я.*', lt, .4, 3.2, 300);
  caption('Тебе сейчас не до бизнеса.', lt, 3.4, 5.8, 300);
}

// ---------- СЦЕНА 7: выбор зрителя ----------
function choice(lt) {
  ctx.fillStyle = vgrad(0, H, ['#070912', '#101628', '#06070c']); ctx.fillRect(0, 0, W, H);
  glow(540, 560, 600, 'rgba(90,120,220,.25)');
  rain(lt + 20, .5);
  const look = lt < 1.5 ? 0 : Math.sin((lt - 1.5) * 1.6) > 0 ? -1 : 1;
  person(as('lev', { x: 540, y: 1700, s: 1.95, mood: lt > 6 ? 'determined' : 'sad', look, shadow: false }));
  ctx.fillStyle = vgrad(640, 980, ['rgba(5,6,10,0)', 'rgba(5,6,10,.92)']); ctx.fillRect(0, 640, W, 340); ctx.fillStyle = 'rgba(5,6,10,.92)'; ctx.fillRect(0, 980, W, H);
  const hp = easeOut(prog(lt, .1, .5));
  ctx.save(); ctx.globalAlpha = hp; ctx.textAlign = 'center'; ctx.font = '800 64px Montserrat'; ctx.fillStyle = '#fff';
  ctx.shadowColor = 'rgba(0,0,0,.8)'; ctx.shadowBlur = 16; ctx.fillText('ЧТО ДЕЛАТЬ', W / 2, 270); ctx.fillStyle = '#ffd23f'; ctx.fillText('ЛЬВУ?', W / 2, 345); ctx.restore();
  const pa = lt > 2 ? Math.max(0, Math.sin(lt * 3)) : 0, pb = lt > 2 ? Math.max(0, -Math.sin(lt * 3)) : 0;
  choiceCard('A', 'ПОДПИСАТЬ', 'Притвориться слабым,\nчтобы убийца расслабился', 860, '#e5484d', lt, .6, pa);
  choiceCard('B', 'ОТКАЗАТЬСЯ', 'И при всех забрать\nкомпанию себе', 1110, '#3e7bfa', lt, 1.0, pb);
  const fp = easeOut(prog(lt, 1.6, 2.1));
  ctx.save(); ctx.globalAlpha = fp; ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = '800 46px Montserrat';
  ctx.fillText('Пиши A или B в комментариях', W / 2, 1410);
  ctx.font = '600 34px Montserrat'; ctx.fillStyle = '#b9bccb'; ctx.fillText('Большинство решит, что будет в части 2', W / 2, 1470);
  ctx.restore();
}

runTimeline([
  { start: 0, end: 7.5, draw: cemetery, fadeIn: .5 },
  { start: 7.5, end: 10, draw: titleCard, fadeIn: .1 },
  { start: 10, end: 16, draw: crash },
  { start: 16, end: 23, draw: office, fadeOut: .05 },
  { start: 23, end: 31, draw: letter, fadeIn: .15, vig: .9 },
  { start: 31, end: 37, draw: uncle },
  { start: 37, end: 47, draw: choice, fadeOut: .5 },
], 47);
