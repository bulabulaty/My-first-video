"""Синтез звука для «Наследник — часть 1» (без внешних сэмплов, только numpy).

Таймлайн совпадает с ep01/scene.js:
  0–7.5  кладбище, дождь, гром на 4.2      7.5–10 титул (удар)
  10–16  самолёт, взрыв 12.6, всплеск 14.6  16–23  кабинет, конверт
  23–31  письмо, сердцебиение               31–37  дядя, «звон» на 35.1
  37–47  выбор, тиканье
Запуск: python3 audio/ep01_audio.py out/ep01_audio.wav
"""
import sys, wave
import numpy as np

SR, DUR = 44100, 47.0
N = int(SR * DUR)
t = np.arange(N) / SR
rs = np.random.default_rng(1)
L = np.zeros(N); R = np.zeros(N)


def band_noise(n, lo, hi, seed=0):
    x = np.random.default_rng(seed).standard_normal(n)
    X = np.fft.rfft(x); f = np.fft.rfftfreq(n, 1 / SR)
    m = 1 / (1 + (lo / np.maximum(f, 1)) ** 4) / (1 + (f / hi) ** 4)
    y = np.fft.irfft(X * m, n)
    return y / (np.abs(y).max() + 1e-9)


def env_points(pts):
    xs, ys = zip(*pts)
    return np.interp(t, xs, ys)


def add(sig, t0, gain=1.0, pan=0.0):
    i = int(t0 * SR); sig = sig[: max(0, N - i)]
    L[i:i + len(sig)] += sig * gain * (1 - max(0, pan))
    R[i:i + len(sig)] += sig * gain * (1 + min(0, pan))


def decay(n, tau, attack=0.005):
    tt = np.arange(n) / SR
    return np.minimum(tt / attack, 1) * np.exp(-tt / tau)


def tone(freq, dur, tau, harm=(1, .4, .2, .1), sweep=None):
    n = int(dur * SR); tt = np.arange(n) / SR
    f = freq if sweep is None else freq * (sweep / freq) ** (tt / dur)
    ph = 2 * np.pi * np.cumsum(np.broadcast_to(f, tt.shape)) / SR
    return sum(a * np.sin(ph * (k + 1)) for k, a in enumerate(harm)) * decay(n, tau)


def burst(dur, lo, hi, tau, seed, attack=0.005):
    n = int(dur * SR)
    return band_noise(n, lo, hi, seed) * decay(n, tau, attack)


def whoosh(t0, dur=.5, gain=.25):
    n = int(dur * SR); w = np.sin(np.linspace(0, np.pi, n)) ** 2
    add(band_noise(n, 600, 6000, int(t0 * 10)) * w, t0 - dur * .6, gain)


# --- дождь / ветер (стерео) ---
rainL = band_noise(N, 900, 9000, 11); rainR = band_noise(N, 900, 9000, 12)
rain_env = env_points([(0, 0), (.6, .30), (7.4, .32), (7.6, .12), (10, .1), (10.2, 0), (16, 0), (16.3, .10),
                       (23, .10), (23.2, .04), (37, .04), (37.4, .14), (46, .14), (47, 0)])
L += rainL * rain_env; R += rainR * rain_env
indoor = band_noise(N, 150, 1400, 13) * env_points([(0, 0), (16, 0), (16.3, .22), (22.9, .22), (23.1, 0), (47, 0)])
L += indoor; R += indoor
wind = band_noise(N, 120, 700, 14) * env_points([(0, 0), (10, 0), (10.3, .25), (15.8, .25), (16, 0), (47, 0)])
L += wind; R += wind

# --- низкий гул ---
drone = (np.sin(2 * np.pi * 55 * t) + .6 * np.sin(2 * np.pi * 82.6 * t + 1) + .3 * np.sin(2 * np.pi * 110.3 * t))
drone *= (.6 + .4 * np.sin(2 * np.pi * .13 * t)) * env_points([(0, 0), (1.5, .07), (36, .09), (37, .14), (46, .18), (47, 0)])
L += drone; R += drone

# --- пианино (ля минор, грустная тема) ---
A3, C4, D4, E4, F4, G4, A4, B3, E3, F3 = 220, 261.6, 293.7, 329.6, 349.2, 392, 440, 246.9, 164.8, 174.6
melody = [(.3, A3), (1.2, C4), (2.1, E4), (3.0, A4), (3.9, E4), (4.8, F4), (5.7, E4), (6.6, C4),
          (16.2, A3), (17.1, C4), (18.0, E4), (18.9, D4), (19.8, C4), (20.7, B3), (21.6, E3),
          (31.3, F3), (32.2, A3), (33.1, C4), (34.0, B3),
          (37.4, A3), (38.6, C4), (39.8, E4), (41.0, F4), (42.2, E4), (43.4, D4), (44.6, E4)]
for i, (st, f) in enumerate(melody):
    add(tone(f, 3.0, 1.1), st, .16, pan=(-.3 if i % 2 else .3))
    add(tone(f / 2, 3.0, 1.4, harm=(1, .3)), st, .07)

# --- гром ---
add(burst(4.0, 25, 260, 1.4, 21, attack=.08), 4.15, .9)
add(burst(.4, 1500, 9000, .08, 22), 4.15, .5)

# --- титул: удар + мерцание ---
add(tone(95, 2.2, .9, harm=(1, .2), sweep=32), 7.5, .9)
add(burst(2.0, 3000, 12000, .7, 23, attack=.3), 7.5, .12)
for k, f in enumerate((880, 1318.5, 1760)):
    add(tone(f, 2.0, .8, harm=(1, .1)), 7.6 + k * .12, .05)

# --- самолёт ---
eng_n = int(2.8 * SR); tt = np.arange(eng_n) / SR
eng = band_noise(eng_n, 250, 1600, 31) * np.minimum(tt / 1.5, 1) * .5 + .25 * np.sin(2 * np.pi * (170 + 30 * tt) * tt)
add(eng, 10.0, .45, pan=-.4)
add(burst(3.0, 20, 700, .9, 32, attack=.01), 12.6, 1.0)
add(burst(.3, 1200, 9000, .06, 33), 12.6, .6)
add(tone(70, 2.0, .7, harm=(1,), sweep=30), 12.6, .7)
add(burst(2.0, 250, 5000, .55, 34, attack=.02), 14.6, .7)
add(tone(60, 1.5, .5, harm=(1,), sweep=28), 14.6, .6)

# --- кабинет: «попы» табличек, конверт ---
for k, st in enumerate((16.5, 17.0, 17.5)):
    add(tone(700 + k * 180, .2, .05, harm=(1, .3)), st + .08, .18)
for st in (10.0, 16.0, 23.0, 31.0, 37.0):
    whoosh(st)
whoosh(20.8, 2.2, .18)

# --- письмо: сердце + шорох пера ---
beat = tone(52, .35, .09, harm=(1, .5))
k = 0
while 23.33 + k * .667 < 31:
    st = 23.33 + k * .667; add(beat, st - .05, .9); add(beat, st + .13, .55); k += 1
scr_n = int(5.1 * SR)
scr = band_noise(scr_n, 2500, 9000, 41) * (np.abs(np.sin(np.arange(scr_n) / SR * 2 * np.pi * 3.1)) ** 3) * .8
add(scr, 23.5, .06)

# --- дядя: зловещий звон ---
add(tone(2093, 2.5, .9, harm=(1, .3, .1)), 35.1, .10, pan=.3)
add(tone(3136, 2.0, .6, harm=(1,)), 35.12, .05, pan=.3)
add(tone(65, 1.6, .5, harm=(1, .4), sweep=40), 35.1, .5)
add(burst(1.0, 80, 900, .3, 51, attack=.15), 31.3, .25)

# --- выбор: тиканье + нарастание ---
k = 0
while 38 + k * .5 < 46.3:
    add(burst(.03, 2500, 8000, .006, 60 + k), 38 + k * .5, .22 if k % 2 == 0 else .14, pan=(.2 if k % 2 else -.2)); k += 1
rise_n = int(8.5 * SR); tt = np.arange(rise_n) / SR
add(np.sin(2 * np.pi * (220 * tt + 9 * tt * tt)) * (tt / 8.5) ** 2 * .5, 37.8, .12)
add(tone(55, 1.5, .6, harm=(1, .5, .2)), 46.2, .6)

# --- сведение ---
mix = np.stack([L, R], 1)
fade = np.minimum(1, (N - np.arange(N)) / (SR * .5))[:, None]
mix = np.tanh(mix * 1.3) * fade
mix /= np.abs(mix).max() / 0.89
out = sys.argv[1] if len(sys.argv) > 1 else 'out/ep01_audio.wav'
with wave.open(out, 'wb') as w:
    w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR)
    w.writeframes((mix * 32767).astype('<i2').tobytes())
print('готово:', out)
