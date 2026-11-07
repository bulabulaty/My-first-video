"""Звук для «Последний на Марсе — серия 1»: музыка + эффекты + озвучка.
Тайминги из out/mars01/timeline.json (создаёт voice.py).
Запуск: python3 audio/mars01_audio.py out/mars01_audio.wav
"""
import json, os, sys, wave
import numpy as np

HERE = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TL = json.load(open(os.path.join(HERE, 'out/mars01/timeline.json')))
SC = {s['id']: s for s in TL['scenes']}
SR = 44100; DUR = TL['total']; N = int(SR * DUR); t = np.arange(N) / SR
L = np.zeros(N); R = np.zeros(N)
BOOM = SC['crash']['lines'][0]['end'] - .55
LAUNCH = SC['earth']['start'] + 1.2


def band_noise(n, lo, hi, seed=0):
    X = np.fft.rfft(np.random.default_rng(seed).standard_normal(n)); f = np.fft.rfftfreq(n, 1 / SR)
    y = np.fft.irfft(X / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4), n)
    return y / (np.abs(y).max() + 1e-9)


def env(pts):
    xs, ys = zip(*pts); return np.interp(t, xs, ys)


def add(sig, t0, gain=1., pan=0.):
    i = int(max(t0, 0) * SR); sig = sig[: max(0, N - i)]
    L[i:i + len(sig)] += sig * gain * (1 - max(0, pan)); R[i:i + len(sig)] += sig * gain * (1 + min(0, pan))


def decay(n, tau, attack=.005):
    tt = np.arange(n) / SR; return np.minimum(tt / attack, 1) * np.exp(-tt / tau)


def tone(freq, dur, tau, harm=(1, .4, .2), sweep=None, attack=.005):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = freq if sweep is None else freq * (sweep / freq) ** (tt / dur)
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(f, tt.shape)) / SR
    return sum(a * np.sin(ph * (k + 1)) for k, a in enumerate(harm)) * decay(n, tau, attack)


def burst(dur, lo, hi, tau, seed, attack=.005):
    n = int(dur * SR); return band_noise(n, lo, hi, seed) * decay(n, tau, attack)


def S(id_, k='start'): return SC[id_][k]


music_L = np.zeros(N); music_R = np.zeros(N)
# --- космический пэд (ре минор → си-бемоль → фа → до) ---
chords = [(146.8, 174.6, 220), (116.5, 146.8, 174.6), (174.6, 220, 261.6), (130.8, 164.8, 196)]
for i in range(int(DUR / 4) + 1):
    st = i * 4.0
    for k, f in enumerate(chords[i % 4]):
        n = int(4.6 * SR); tt = np.arange(n) / SR
        e = np.minimum(tt / 1.2, 1) * np.minimum((4.6 - tt) / 1.4, 1)
        sig = (np.sin(2 * np.pi * f * tt) + .3 * np.sin(2 * np.pi * f * 2.003 * tt) + .15 * np.sin(2 * np.pi * f * 3.01 * tt)) * e
        i0 = int(st * SR); m = min(n, N - i0)
        if m > 0: music_L[i0:i0 + m] += sig[:m] * .05 * (1.1 if k % 2 else .9); music_R[i0:i0 + m] += sig[:m] * .05 * (.9 if k % 2 else 1.1)
# --- пульсирующее арпеджио в сценах на базе ---
arp = [293.7, 349.2, 440, 523.3, 440, 349.2]
k = 0; st = S('wake')
while st < S('choice', 'end') - .5:
    n = int(.3 * SR); sig = tone(arp[k % 6], .3, .09, harm=(1, .5, .25))
    i0 = int(st * SR); m = min(n, N - i0); music_L[i0:i0 + m] += sig[:m] * .035; music_R[i0:i0 + m] += sig[:m] * .035
    st += .25; k += 1
music_env = env([(0, 0), (1, 1), (S('title') - .3, 1), (S('title'), .4), (S('title', 'end'), 1), (DUR - 1, 1), (DUR, 0)])
music_L *= music_env; music_R *= music_env

# --- озвучка и «приглушение» музыки под голос ---
with wave.open(os.path.join(HERE, 'out/mars01/voice.wav')) as w:
    voice = np.frombuffer(w.readframes(w.getnframes()), '<i2').astype(np.float64) / 32768
voice = np.pad(voice, (0, max(0, N - len(voice))))[:N]
duck = np.ones(N)
for sc in TL['scenes']:
    for ln in sc['lines']:
        duck -= .55 * np.clip(np.minimum((t - ln['start'] + .25) / .25, (ln['end'] + .35 - t) / .35), 0, 1)
duck = np.clip(duck, .3, 1)
L += music_L * duck; R += music_R * duck

# --- эффекты ---
space = band_noise(N, 40, 300, 1) * env([(0, 0), (.8, .08), (S('earth'), .08), (S('earth') + .1, 0), (S('crash'), 0), (S('crash') + .2, .08), (S('crash', 'end'), .06), (S('crash', 'end') + .1, 0), (DUR, 0)])
L += space; R += space
wind_e = env([(0, 0), (S('earth'), 0), (S('earth') + .3, .12), (S('earth', 'end'), .12), (S('earth', 'end') + .1, 0),
              (S('outside'), 0), (S('outside') + .5, .06), (S('outside', 'end'), .06), (S('outside', 'end') + .1, 0),
              (S('wreck'), 0), (S('wreck') + .4, .16), (S('wreck', 'end'), .16), (S('wreck', 'end') + .1, 0), (DUR, 0)])
wl = band_noise(N, 200, 1800, 2) * (0.6 + 0.4 * np.sin(2 * np.pi * .23 * t)); wr = band_noise(N, 200, 1800, 3) * (0.6 + 0.4 * np.sin(2 * np.pi * .19 * t + 1))
L += wl * wind_e; R += wr * wind_e
hum = (np.sin(2 * np.pi * 60 * t) * .6 + np.sin(2 * np.pi * 120 * t) * .3 + band_noise(N, 100, 500, 4) * .3) * env(
    [(0, 0), (S('wake'), 0), (S('wake') + .3, .05), (S('choice', 'end') - .5, .05), (DUR, 0)])
L += hum; R += hum
# старт ракеты
add(burst(5.0, 25, 900, 2.0, 11, attack=.6), LAUNCH, .6)
# взрыв корабля
add(burst(3.5, 20, 800, 1.1, 12, attack=.01), BOOM, 1.0)
add(burst(.35, 1500, 9000, .07, 13), BOOM, .5)
add(tone(70, 2.5, .9, harm=(1,), sweep=28), BOOM, .8)
add(burst(1.0, 800, 6000, .3, 14, attack=.2), BOOM + .6, .25, pan=-.5)  # капсула
# титул
add(tone(90, 2.5, 1.0, harm=(1, .25), sweep=32), S('title'), .9)
for k_, f in enumerate((587.3, 880, 1174.7)): add(tone(f, 2.0, .8, harm=(1, .1)), S('title') + .1 + k_ * .12, .05)
# тревога на базе
for sid in ('wake', 'oxygen'):
    st = S(sid) + .2
    while st < S(sid, 'end') - .4:
        add(tone(880, .18, .08, harm=(1, .3)), st, .06); add(tone(660, .18, .08, harm=(1, .3)), st + .22, .06); st += 1.4
# «пиу» при появлении интерфейса
blips = [S('wake') + .6, SC['wake']['lines'][1]['start'], SC['outside']['lines'][0]['start'] + .5, SC['outside']['lines'][0]['start'] + 2.6,
         SC['outside']['lines'][1]['start'] + .2, SC['oxygen']['lines'][0]['start'] + 1.5, SC['wreck']['lines'][0]['start'] + 3.2,
         SC['wreck']['lines'][0]['start'] + 4.6, S('choice') + .8, S('choice') + 1.2]
for b in blips: add(tone(1320, .12, .04, harm=(1, .2), sweep=1760), b, .12)
for st in (S('earth'), S('crash'), S('wake'), S('outside'), S('oxygen'), S('wreck'), S('choice')):
    n = int(.5 * SR); add(band_noise(n, 600, 6000, int(st * 7)) * np.sin(np.linspace(0, np.pi, n)) ** 2, st - .3, .15)
# сбой ЭХО
g0 = SC['glitch']['lines'][1]['start'] - .1
for k_ in range(14):
    add(burst(.06 + (k_ % 3) * .03, 300, 9000, .03, 70 + k_), g0 + k_ * .17 + (k_ % 2) * .05, .25, pan=(.4 if k_ % 2 else -.4))
add(tone(55, 3.0, 1.2, harm=(1, .6, .3)), g0, .5)
add(tone(1100, 1.2, .5, harm=(1,), sweep=180), g0, .08)
# выбор: тиканье + финальный удар
st = S('choice') + 1.5; k_ = 0
while st < DUR - 1.2:
    add(burst(.03, 2500, 8000, .006, 90 + k_), st, .18 if k_ % 2 == 0 else .11, pan=(.2 if k_ % 2 else -.2)); st += .5; k_ += 1
add(tone(55, 1.6, .6, harm=(1, .5, .2)), DUR - 1.1, .5)

L *= .4; R *= .4  # фон на ~8 дБ ниже, чтобы голос был разборчивым
L += voice; R += voice
mix = np.stack([L, R], 1)
mix *= np.minimum(1, (N - np.arange(N)) / (SR * .5))[:, None]
mix = np.tanh(mix * .9); mix /= np.abs(mix).max() / .89
out = sys.argv[1] if len(sys.argv) > 1 else 'out/mars01_audio.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes((mix * 32767).astype('<i2').tobytes())
print('готово:', out)
