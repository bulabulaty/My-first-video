# Интерактивные сериалы для Instagram Reels / TikTok

2D-анимация, которая целиком рисуется кодом, с озвучкой и выбором зрителей (A/B в комментариях) в конце каждой серии.

## Сериалы
| Сериал | Готово | Описание |
|---|---|---|
| **ПОСЛЕДНИЙ НА МАРСЕ** | `episodes/mars01.mp4` (73 сек, с озвучкой) | `story/mars/README.md` |
| НАСЛЕДНИК (черновик) | `episodes/ep01.mp4` (47 сек, без голоса) | `story/01_bible.md` … |

## Сборка
```bash
cd video
./setup.sh            # один раз: шрифты, Piper, RHVoice, голос
./build.sh mars01     # → episodes/mars01.mp4
node render.js mars01 --stills 5,20,40   # контрольные кадры в video/out/stills
```

## Как сделать серию 2
1. `cp -r video/mars01 video/mars02`, затем `cp video/audio/mars01_audio.py video/audio/mars02_audio.py` и поменять в нём путь `out/mars01` → `out/mars02`.
2. В `mars02/script.json` написать реплики: `say` — что звучит в озвучке (числа словами), `text` — титр на экране (`*слово*` — подсветка).
3. В `mars02/scene.js` нарисовать сцены (id сцен = id из `script.json`).
4. `./build.sh mars02`

Голоса: **Макс** — RHVoice «Александр», **ЭХО** — Piper «Ирина» с «цифровым» эффектом (`video/voice.py`).
Персонажи и элементы (Макс, ЭХО, титры, карточки выбора) лежат в `video/lib/draw.js`.
