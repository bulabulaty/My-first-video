"""Озвучка серии по script.json и расчёт таймлайна.

Голоса (офлайн):
  max  — RHVoice «aleksandr-hq» (мужской)
  echo — Piper «ru-irinia-medium» + «цифровой» эффект (ИИ базы)

Запуск: python3 voice.py mars01
Создаёт: out/<ep>/voice.wav, out/<ep>/timeline.json и <ep>/timeline.js (для анимации).
"""
import json, os, subprocess, sys, wave
import numpy as np

SR = 44100
HERE = os.path.dirname(os.path.abspath(__file__))
PIPER_MODEL = os.environ.get('PIPER_MODEL', os.path.join(HERE, 'voices/ru-irinia-medium.onnx'))
GAP, PAD_IN, PAD_OUT = 0.35, 0.45, 0.55

FX = {
    'max': 'highpass=f=70,acompressor=threshold=-18dB:ratio=3:attack=5:release=80,volume=1.4',
    'echo': 'highpass=f=160,aecho=0.8:0.6:18|31:0.28|0.18,chorus=0.6:0.8:40:0.3:0.25:2,acompressor=threshold=-18dB:ratio=3,volume=1.5',
}


def synth(who, text, raw):
    if who == 'max':
        subprocess.run(['RHVoice-test', '-p', 'aleksandr-hq', '-r', '122', '-o', raw], input=text.encode(), check=True, capture_output=True)
    else:
        subprocess.run([sys.executable, '-m', 'piper', '-m', PIPER_MODEL, '--length-scale', '0.86', '-f', raw], input=text.encode(), check=True, capture_output=True)


def load(path):
    with wave.open(path) as w:
        return np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float32) / 32768


def main(ep):
    script = json.load(open(os.path.join(HERE, ep, 'script.json')))
    od = os.path.join(HERE, 'out', ep); os.makedirs(od, exist_ok=True)
    t, scenes, clips = 0.0, [], []
    for si, sc in enumerate(script['scenes']):
        s0 = t; t += PAD_IN; lines = []
        for li, ln in enumerate(sc['lines']):
            raw, fin = f'{od}/raw_{si}_{li}.wav', f'{od}/v_{si}_{li}.wav'
            synth(ln['who'], ln['say'], raw)
            subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', raw, '-af', FX[ln['who']], '-ar', str(SR), '-ac', '1', fin], check=True)
            a = load(fin); d = len(a) / SR
            a *= min(0.1 / (np.sqrt((a ** 2).mean()) + 1e-9), 0.95 / (np.abs(a).max() + 1e-9))  # выравниваем громкость
            lines.append({'who': ln['who'], 'text': ln['text'], 'start': round(t, 3), 'end': round(t + d, 3)})
            clips.append((t, a)); t += d + GAP
        t = t - (GAP if lines else 0) + (sc.get('fixed', 0) if not lines else PAD_OUT) + sc.get('tail', 0)
        scenes.append({'id': sc['id'], 'start': round(s0, 3), 'end': round(t, 3), 'lines': lines})
    total = round(t, 3)
    voice = np.zeros(int(total * SR) + SR)
    for st, a in clips:
        i = int(st * SR); voice[i:i + len(a)] += a
    voice = voice[: int(total * SR)]
    with wave.open(f'{od}/voice.wav', 'wb') as w:
        w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
        w.writeframes((np.clip(voice, -1, 1) * 32767).astype('<i2').tobytes())
    tl = {'total': total, 'scenes': scenes}
    json.dump(tl, open(f'{od}/timeline.json', 'w'), ensure_ascii=False, indent=1)
    open(os.path.join(HERE, ep, 'timeline.js'), 'w').write('window.TL = ' + json.dumps(tl, ensure_ascii=False) + ';\n')
    for s in scenes: print(f"{s['id']:8s} {s['start']:6.2f} → {s['end']:6.2f}")
    print('итого', total, 'сек')


if __name__ == '__main__':
    main(sys.argv[1])
