// Рендер серии в видео (без звука) или контрольные кадры.
//   node render.js ep01 out/ep01_silent.mp4          — всё видео
//   node render.js ep01 --stills 2,9,14,20,27,34,42    — PNG-кадры в out/stills/
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

(async () => {
  const [ep, arg2, arg3] = process.argv.slice(2);
  const FPS = 30;
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('pageerror', e => { console.error('PAGE ERROR:', e.message); process.exit(1); });
  await page.goto('file://' + path.resolve(__dirname, ep, 'index.html'));
  await page.evaluate(async () => {
    await Promise.all(['800 50px Montserrat', '600 50px Montserrat', '700 50px Caveat', '900 50px "Playfair Display"']
      .flatMap(f => [document.fonts.load(f, 'АБВЖЯ'), document.fonts.load(f, 'ABab')]));
    await document.fonts.ready;
  });
  const total = await page.evaluate(() => window.TOTAL);

  if (arg2 === '--stills') {
    const dir = path.resolve(__dirname, 'out/stills'); fs.mkdirSync(dir, { recursive: true });
    for (const t of arg3.split(',').map(Number)) {
      const d = await page.evaluate(t => window.render(t), t);
      fs.writeFileSync(path.join(dir, `${ep}_${String(t).replace('.', '_')}.jpg`), Buffer.from(d.split(',')[1], 'base64'));
    }
  } else {
    const out = path.resolve(arg2 || `out/${ep}_silent.mp4`); fs.mkdirSync(path.dirname(out), { recursive: true });
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '19', '-preset', 'medium', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const n = Math.round(total * FPS);
    for (let i = 0; i < n; i++) {
      const d = await page.evaluate(t => window.render(t), i / FPS);
      if (!ff.stdin.write(Buffer.from(d.split(',')[1], 'base64'))) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) process.stdout.write(`кадр ${i}/${n}\n`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log('готово:', out);
  }
  await browser.close();
})();
